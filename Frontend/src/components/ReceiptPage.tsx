import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner@2.0.3';
import { Download, CheckCircle, Plane, MapPin, Clock, User, Phone, Armchair, DollarSign, Hash, Calendar, UtensilsCrossed, Luggage, ShieldCheck, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import jsPDF from 'jspdf';
import { getBookingDetails, Receipt } from '../lib/api';
import { getAddOnById, calculateAddOnsTotal } from '../lib/addons';

export default function ReceiptPage() {
  const { pnr } = useParams<{ pnr: string }>();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipt();
  }, [pnr]);

  const fetchReceipt = async () => {
    try {
      setLoading(true);
      const data = await getBookingDetails(pnr!);
      setReceipt(data);
    } catch (error) {
      toast.error('Failed to load receipt');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!receipt) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('FLIGHT BOOKING RECEIPT', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('FlightBook System', pageWidth / 2, 30, { align: 'center' });

    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Booking Information
    let yPos = 55;
    
    doc.setFontSize(16);
    doc.text('Booking Confirmation', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Booking Date: ${new Date(receipt.booking_date).toLocaleDateString()}`, 20, yPos);
    doc.text(`Status: ${receipt.booking_status}`, pageWidth - 20, yPos, { align: 'right' });
    yPos += 15;
    
    // PNR Box
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.5);
    doc.rect(20, yPos, pageWidth - 40, 15);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`PNR: ${receipt.pnr}`, pageWidth / 2, yPos + 10, { align: 'center' });
    yPos += 25;
    
    // Passenger Details
    doc.setFontSize(14);
    doc.text('Passenger Information', 20, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Name:', 20, yPos);
    doc.setTextColor(0, 0, 0);
    doc.text(receipt.passenger_fullname, 60, yPos);
    yPos += 6;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Contact:', 20, yPos);
    doc.setTextColor(0, 0, 0);
    doc.text(receipt.passenger_contact, 60, yPos);
    yPos += 6;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Seat Number:', 20, yPos);
    doc.setTextColor(0, 0, 0);
    doc.text(receipt.seat_no, 60, yPos);
    yPos += 15;
    
    // Flight Details
    doc.setFontSize(14);
    doc.text('Flight Information', 20, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Flight Number:', 20, yPos);
    doc.setTextColor(0, 0, 0);
    doc.text(receipt.flight_no, 60, yPos);
    yPos += 6;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Airline:', 20, yPos);
    doc.setTextColor(0, 0, 0);
    doc.text(receipt.airline, 60, yPos);
    yPos += 6;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Route:', 20, yPos);
    doc.setTextColor(0, 0, 0);
    doc.text(`${receipt.origin} → ${receipt.destination}`, 60, yPos);
    yPos += 6;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Departure:', 20, yPos);
    doc.setTextColor(0, 0, 0);
    doc.text(new Date(receipt.departure_time).toLocaleString(), 60, yPos);
    yPos += 6;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Arrival:', 20, yPos);
    doc.setTextColor(0, 0, 0);
    doc.text(new Date(receipt.arrival_time).toLocaleString(), 60, yPos);
    yPos += 15;
    
    // Add-ons Information (if any)
    if (receipt.addons && receipt.addons.length > 0) {
      doc.setFontSize(14);
      doc.text('Selected Add-ons', 20, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      receipt.addons.forEach((addonId) => {
        const addon = getAddOnById(addonId);
        if (addon) {
          const Icon = addon.icon;
          doc.text(`${addon.name}: $${addon.price.toFixed(2)}`, 20, yPos);
          yPos += 6;
        }
      });
      doc.text(`Add-ons Total: $${calculateAddOnsTotal(receipt.addons).toFixed(2)}`, 20, yPos);
      yPos += 15;
    }
    
    // Payment Details
    doc.setFontSize(14);
    doc.text('Payment Information', 20, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Total Amount Paid:', 20, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`$${receipt.price.toFixed(2)}`, 60, yPos);
    yPos += 15;
    
    // Footer
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 10;
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for booking with FlightBook!', pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
    doc.text('Please arrive at the airport 2 hours before departure.', pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
    doc.text('For support, contact: support@flightbook.com', pageWidth / 2, yPos, { align: 'center' });
    
    // Save PDF
    doc.save(`Booking_Receipt_${receipt.pnr}.pdf`);
    toast.success('Receipt downloaded successfully!');
  };

  const formatDateTime = (datetime: string) => {
    return new Date(datetime).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">Receipt not found</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Back to Flights
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-gray-600">Your flight has been successfully booked</p>
      </div>

      <Card className="mb-6">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle>Booking Receipt</CardTitle>
            <Badge variant="secondary" className="bg-white text-blue-700">
              {receipt.booking_status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* PNR */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6 text-center">
            <p className="text-gray-600 text-sm mb-1">PNR Number</p>
            <p className="text-gray-900 text-2xl tracking-wider">{receipt.pnr}</p>
          </div>

          {/* Passenger Information */}
          <div className="mb-6">
            <h3 className="text-gray-900 mb-3">Passenger Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-gray-600 text-sm">Full Name</p>
                  <p className="text-gray-900">{receipt.passenger_fullname}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-gray-600 text-sm">Contact Number</p>
                  <p className="text-gray-900">{receipt.passenger_contact}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Armchair className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-gray-600 text-sm">Seat Number</p>
                  <p className="text-gray-900">{receipt.seat_no}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Flight Information */}
          <div className="mb-6">
            <h3 className="text-gray-900 mb-3">Flight Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Plane className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-gray-600 text-sm">Flight Number</p>
                  <p className="text-gray-900">{receipt.flight_no} - {receipt.airline}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-gray-600 text-sm">Route</p>
                  <p className="text-gray-900">{receipt.origin} → {receipt.destination}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-gray-600 text-sm">Departure</p>
                  <p className="text-gray-900">{formatDateTime(receipt.departure_time)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-gray-600 text-sm">Arrival</p>
                  <p className="text-gray-900">{formatDateTime(receipt.arrival_time)}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Add-ons Information (if any) */}
          {receipt.addons && receipt.addons.length > 0 && (
            <>
              <div className="mb-6">
                <h3 className="text-gray-900 mb-3">Selected Add-ons</h3>
                <div className="space-y-2">
                  {receipt.addons.map((addonId) => {
                    const addon = getAddOnById(addonId);
                    if (!addon) return null;
                    const Icon = addon.icon;
                    return (
                      <div key={addonId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-gray-900">{addon.name}</p>
                            <p className="text-xs text-gray-600">{addon.description}</p>
                          </div>
                        </div>
                        <span className="text-gray-900">${addon.price.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded-lg flex justify-between items-center">
                  <span className="text-gray-700">Add-ons Total:</span>
                  <span className="text-gray-900">${calculateAddOnsTotal(receipt.addons).toFixed(2)}</span>
                </div>
              </div>

              <Separator className="my-6" />
            </>
          )}

          {/* Payment Information */}
          <div className="mb-6">
            <h3 className="text-gray-900 mb-3">Payment Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">Total Amount Paid</span>
                </div>
                <span className="text-gray-900">${receipt.price.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Calendar className="h-4 w-4" />
            <span>Booked on {new Date(receipt.booking_date).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={generatePDF} className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Download PDF Receipt
        </Button>
        <Button onClick={() => navigate('/')} variant="outline" className="flex-1">
          Book Another Flight
        </Button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-gray-700 text-sm text-center">
          📧 A confirmation email has been sent to your registered email address.
          Please arrive at the airport at least 2 hours before departure.
        </p>
      </div>
    </div>
  );
}