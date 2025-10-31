import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner@2.0.3';
import { ArrowLeft, Plane, MapPin, Clock, DollarSign, User, Phone, Armchair, UtensilsCrossed, Luggage, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import { getFlights, reserveBooking, Flight } from '../lib/api';
import { AVAILABLE_ADDONS, calculateAddOnsTotal as calcAddOnsTotal } from '../lib/addons';

export default function BookingPage() {
  const { flightId } = useParams<{ flightId: string }>();
  const navigate = useNavigate();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    passenger_fullname: '',
    passenger_contact: '',
    seat_no: '',
  });

  useEffect(() => {
    fetchFlightDetails();
  }, [flightId]);

  const fetchFlightDetails = async () => {
    try {
      setLoading(true);
      const flights = await getFlights();
      const selectedFlight = flights.find((f) => f.flight_id === Number(flightId));
      
      if (!selectedFlight) {
        toast.error('Flight not found');
        navigate('/');
        return;
      }
      
      setFlight(selectedFlight);
    } catch (error) {
      toast.error('Failed to load flight details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOns((prev) => {
      // For meals and insurance, only allow one selection per category
      const addOn = AVAILABLE_ADDONS.find((a) => a.id === addOnId);
      if (!addOn) return prev;

      if (addOn.category === 'meal' || addOn.category === 'insurance') {
        // Remove any existing add-on from the same category
        const filtered = prev.filter((id) => {
          const existingAddOn = AVAILABLE_ADDONS.find((a) => a.id === id);
          return existingAddOn?.category !== addOn.category;
        });
        
        // If the clicked item was already selected, just remove it
        if (prev.includes(addOnId)) {
          return filtered;
        }
        
        // Otherwise, add the new one
        return [...filtered, addOnId];
      }

      // For other categories, toggle normally
      if (prev.includes(addOnId)) {
        return prev.filter((id) => id !== addOnId);
      }
      return [...prev, addOnId];
    });
  };

  const calculateTotalPrice = () => {
    if (!flight) return 0;
    return flight.dynamic_price + calcAddOnsTotal(selectedAddOns);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!flight) return;

    // Validation
    if (!formData.passenger_fullname.trim()) {
      toast.error('Please enter passenger name');
      return;
    }

    if (!formData.passenger_contact.trim()) {
      toast.error('Please enter contact number');
      return;
    }

    if (!formData.seat_no.trim()) {
      toast.error('Please enter seat number');
      return;
    }

    try {
      setSubmitting(true);
      const response = await reserveBooking({
        flight_id: flight.flight_id,
        seat_no: formData.seat_no.toUpperCase(),
        passenger_fullname: formData.passenger_fullname,
        passenger_contact: formData.passenger_contact,
        addons: selectedAddOns.length > 0 ? selectedAddOns : undefined,
      });

      toast.success('Seat reserved successfully!');
      
      // Navigate to payment page
      setTimeout(() => {
        navigate(`/payment/${response.pnr}`);
      }, 1000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to reserve seat';
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (datetime: string) => {
    return new Date(datetime).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!flight) {
    return null;
  }

  const isAvailable = flight.available_seats > 0 && flight.status === 'Scheduled';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/flights')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-gray-900">Book Flight</h1>
              <p className="text-sm text-gray-600">Complete your booking</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flight Details */}
        <Card>
          <CardHeader>
            <CardTitle>Flight Details</CardTitle>
            <CardDescription>Review your selected flight</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Plane className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-gray-900">{flight.flight_no}</h3>
                <p className="text-gray-600">{flight.airline}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-600 text-sm">Route</p>
                  <p className="text-gray-900">
                    {flight.origin} → {flight.destination}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-600 text-sm">Departure</p>
                  <p className="text-gray-900">{formatDate(flight.departure_time)}</p>
                  <p className="text-gray-600">{formatTime(flight.departure_time)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-600 text-sm">Arrival</p>
                  <p className="text-gray-900">{formatDate(flight.arrival_time)}</p>
                  <p className="text-gray-600">{formatTime(flight.arrival_time)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-600 text-sm">Current Price</p>
                  <p className="text-gray-900">${flight.dynamic_price.toFixed(2)}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-gray-600 text-sm mb-1">Available Seats</p>
                <p className="text-gray-900">
                  {flight.available_seats} of {flight.total_seats} seats available
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Form */}
        <Card>
          <CardHeader>
            <CardTitle>Passenger Details</CardTitle>
            <CardDescription>Enter your information to reserve a seat</CardDescription>
          </CardHeader>
          <CardContent>
            {!isAvailable ? (
              <Alert variant="destructive">
                <AlertDescription>
                  This flight is currently unavailable for booking.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="passenger_fullname">
                    <User className="h-4 w-4 inline mr-2" />
                    Full Name
                  </Label>
                  <Input
                    id="passenger_fullname"
                    name="passenger_fullname"
                    type="text"
                    placeholder="John Doe"
                    value={formData.passenger_fullname}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passenger_contact">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Contact Number
                  </Label>
                  <Input
                    id="passenger_contact"
                    name="passenger_contact"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.passenger_contact}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seat_no">
                    <Armchair className="h-4 w-4 inline mr-2" />
                    Seat Number
                  </Label>
                  <Input
                    id="seat_no"
                    name="seat_no"
                    type="text"
                    placeholder="12A"
                    value={formData.seat_no}
                    onChange={handleInputChange}
                    required
                  />
                  <p className="text-gray-500 text-xs">
                    Example: 12A, 15B, 20C
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="text-gray-900">${calculateTotalPrice().toFixed(2)}</span>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? 'Reserving...' : 'Reserve Seat'}
                  </Button>
                </div>

                <Alert>
                  <AlertDescription className="text-xs">
                    After reserving, you'll be redirected to complete payment within 15 minutes.
                  </AlertDescription>
                </Alert>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add-ons Section */}
      {isAvailable && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Enhance Your Journey</CardTitle>
            <CardDescription>Select optional add-ons to make your trip more comfortable</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Meals */}
              <div>
                <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-orange-600" />
                  In-Flight Meals
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {AVAILABLE_ADDONS.filter((a) => a.category === 'meal').map((addOn) => {
                    const Icon = addOn.icon;
                    const isSelected = selectedAddOns.includes(addOn.id);
                    return (
                      <div
                        key={addOn.id}
                        onClick={() => toggleAddOn(addOn.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                          <Checkbox checked={isSelected} />
                        </div>
                        <p className="text-gray-900 mb-1">{addOn.name}</p>
                        <p className="text-xs text-gray-600 mb-2">{addOn.description}</p>
                        <p className="text-gray-900">+${addOn.price}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Baggage & Services */}
              <div>
                <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                  <Luggage className="h-5 w-5 text-purple-600" />
                  Baggage & Services
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {AVAILABLE_ADDONS.filter((a) => a.category === 'baggage' || a.category === 'upgrade').map((addOn) => {
                    const Icon = addOn.icon;
                    const isSelected = selectedAddOns.includes(addOn.id);
                    return (
                      <div
                        key={addOn.id}
                        onClick={() => toggleAddOn(addOn.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                          <Checkbox checked={isSelected} />
                        </div>
                        <p className="text-gray-900 mb-1">{addOn.name}</p>
                        <p className="text-xs text-gray-600 mb-2">{addOn.description}</p>
                        <p className="text-gray-900">+${addOn.price}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Travel Insurance */}
              <div>
                <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                  Travel Insurance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {AVAILABLE_ADDONS.filter((a) => a.category === 'insurance').map((addOn) => {
                    const Icon = addOn.icon;
                    const isSelected = selectedAddOns.includes(addOn.id);
                    return (
                      <div
                        key={addOn.id}
                        onClick={() => toggleAddOn(addOn.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                          <Checkbox checked={isSelected} />
                        </div>
                        <p className="text-gray-900 mb-1">{addOn.name}</p>
                        <p className="text-xs text-gray-600 mb-2">{addOn.description}</p>
                        <p className="text-gray-900">+${addOn.price}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Summary */}
              {selectedAddOns.length > 0 && (
                <div className="pt-4 border-t">
                  <h3 className="text-gray-900 mb-3">Selected Add-ons</h3>
                  <div className="space-y-2 mb-4">
                    {selectedAddOns.map((addOnId) => {
                      const addOn = AVAILABLE_ADDONS.find((a) => a.id === addOnId);
                      if (!addOn) return null;
                      return (
                        <div key={addOnId} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">{addOn.name}</span>
                          <span className="text-gray-900">+${addOn.price}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="text-gray-900">Add-ons Total:</span>
                    <span className="text-gray-900">${calcAddOnsTotal(selectedAddOns).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}