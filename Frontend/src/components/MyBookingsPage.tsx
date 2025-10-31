import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plane, Calendar, MapPin, Clock, ChevronRight, Filter, Search } from 'lucide-react';
import { Input } from './ui/input';
import BottomNav from './BottomNav';

interface Booking {
  pnr: string;
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  passengerName: string;
  seatNumber: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  totalAmount: number;
}

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  // Mock bookings data - in production, this would come from your API
  const mockBookings: Booking[] = [
    {
      pnr: 'ABC123',
      flightNumber: 'AA101',
      airline: 'American Airlines',
      origin: 'New York',
      destination: 'London',
      departureDate: '2025-11-15',
      departureTime: '14:30',
      passengerName: 'John Doe',
      seatNumber: '12A',
      status: 'confirmed',
      totalAmount: 1250,
    },
    {
      pnr: 'DEF456',
      flightNumber: 'DL202',
      airline: 'Delta Airlines',
      origin: 'Los Angeles',
      destination: 'Paris',
      departureDate: '2025-10-25',
      departureTime: '10:15',
      passengerName: 'John Doe',
      seatNumber: '8B',
      status: 'completed',
      totalAmount: 980,
    },
    {
      pnr: 'GHI789',
      flightNumber: 'UA303',
      airline: 'United Airlines',
      origin: 'Chicago',
      destination: 'Tokyo',
      departureDate: '2025-12-01',
      departureTime: '18:45',
      passengerName: 'John Doe',
      seatNumber: '15C',
      status: 'confirmed',
      totalAmount: 1450,
    },
  ];

  const [bookings] = useState<Booking[]>(mockBookings);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.pnr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.flightNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.origin.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = 
      filter === 'all' || 
      (filter === 'upcoming' && booking.status === 'confirmed') ||
      (filter === 'completed' && booking.status === 'completed') ||
      (filter === 'cancelled' && booking.status === 'cancelled');

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white pt-12 pb-6 px-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-white mb-2">My Bookings</h1>
          <p className="text-blue-100">Manage your flight reservations</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4">
        {/* Search and Filter */}
        <Card className="mb-4 shadow-lg">
          <CardContent className="p-4">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by PNR, flight, or destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
                className="whitespace-nowrap"
              >
                All
              </Button>
              <Button
                variant={filter === 'upcoming' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('upcoming')}
                className="whitespace-nowrap"
              >
                Upcoming
              </Button>
              <Button
                variant={filter === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('completed')}
                className="whitespace-nowrap"
              >
                Completed
              </Button>
              <Button
                variant={filter === 'cancelled' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('cancelled')}
                className="whitespace-nowrap"
              >
                Cancelled
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="py-12 text-center">
              <Plane className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No bookings found</p>
              <Button onClick={() => navigate('/flights')} variant="default">
                Book a Flight
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((booking) => (
              <Card
                key={booking.pnr}
                className="shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/receipt/${booking.pnr}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-900">{booking.flightNumber}</span>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{booking.airline}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{booking.origin}</span>
                      </div>
                    </div>
                    <Plane className="h-4 w-4 text-blue-500 transform rotate-90" />
                    <div className="flex-1 text-right">
                      <div className="flex items-center justify-end gap-2 mb-1">
                        <span className="text-gray-900">{booking.destination}</span>
                        <MapPin className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm border-t pt-3">
                    <div className="flex items-center gap-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{booking.departureDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{booking.departureTime}</span>
                      </div>
                    </div>
                    <span className="text-gray-900">${booking.totalAmount}</span>
                  </div>

                  <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
                    <span className="text-gray-600">PNR: {booking.pnr}</span>
                    <span className="text-gray-600">Seat: {booking.seatNumber}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
