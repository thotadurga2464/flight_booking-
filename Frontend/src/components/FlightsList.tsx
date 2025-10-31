import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner@2.0.3';
import { Search, Plane, Clock, MapPin, DollarSign, Users, TrendingUp, TrendingDown, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { getFlights, Flight } from '../lib/api';

export default function FlightsList() {
  const navigate = useNavigate();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAirline, setSelectedAirline] = useState('all');
  const [sortBy, setSortBy] = useState('price-asc');

  useEffect(() => {
    fetchFlights();
    
    // Auto-refresh flights every 30 seconds for dynamic pricing
    const interval = setInterval(() => {
      fetchFlights(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterAndSortFlights();
  }, [flights, searchTerm, selectedAirline, sortBy]);

  const fetchFlights = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await getFlights();
      setFlights(data);
      if (silent) {
        toast.success('Prices updated');
      }
    } catch (error) {
      toast.error('Failed to fetch flights');
      console.error(error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const filterAndSortFlights = () => {
    let filtered = [...flights];

    // Filter by search term (origin or destination)
    if (searchTerm) {
      filtered = filtered.filter(
        (flight) =>
          flight.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
          flight.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
          flight.flight_no.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by airline
    if (selectedAirline !== 'all') {
      filtered = filtered.filter((flight) => flight.airline === selectedAirline);
    }

    // Sort flights
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.dynamic_price - b.dynamic_price;
        case 'price-desc':
          return b.dynamic_price - a.dynamic_price;
        case 'departure':
          return new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime();
        case 'seats':
          return b.available_seats - a.available_seats;
        default:
          return 0;
      }
    });

    setFilteredFlights(filtered);
  };

  const getUniqueAirlines = () => {
    const airlines = [...new Set(flights.map((f) => f.airline))];
    return airlines.sort();
  };

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (datetime: string) => {
    return new Date(datetime).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getPriceChange = (flight: Flight) => {
    const change = ((flight.dynamic_price - flight.base_price) / flight.base_price) * 100;
    return change;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </button>
              <div>
                <h1 className="text-gray-900">Available Flights</h1>
                <p className="text-sm text-gray-600">Real-time pricing</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/fare-history')}
              className="flex items-center gap-1"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Trends</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by city or flight number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedAirline} onValueChange={setSelectedAirline}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by airline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Airlines</SelectItem>
                {getUniqueAirlines().map((airline) => (
                  <SelectItem key={airline} value={airline}>
                    {airline}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="departure">Departure Time</SelectItem>
                <SelectItem value="seats">Available Seats</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Flights List */}
      <div className="space-y-4">
        {filteredFlights.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No flights found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          filteredFlights.map((flight) => {
            const priceChange = getPriceChange(flight);
            const isAvailable = flight.available_seats > 0 && flight.status === 'Scheduled';

            return (
              <Card key={flight.flight_id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Flight Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Plane className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-gray-900">{flight.flight_no}</h3>
                          <p className="text-gray-600 text-sm">{flight.airline}</p>
                        </div>
                        <Badge variant={isAvailable ? 'default' : 'secondary'}>
                          {flight.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Route */}
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-gray-900">{flight.origin}</p>
                            <p className="text-gray-500 text-sm">to {flight.destination}</p>
                          </div>
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-gray-900">
                              {formatTime(flight.departure_time)} - {formatTime(flight.arrival_time)}
                            </p>
                            <p className="text-gray-500 text-sm">
                              {formatDate(flight.departure_time)}
                            </p>
                          </div>
                        </div>

                        {/* Seats */}
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-gray-900">
                              {flight.available_seats} / {flight.total_seats}
                            </p>
                            <p className="text-gray-500 text-sm">Available seats</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price & Booking */}
                    <div className="lg:text-right flex lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 justify-end mb-1">
                          <DollarSign className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-900">{flight.dynamic_price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          {priceChange > 0 ? (
                            <>
                              <TrendingUp className="h-3 w-3 text-red-500" />
                              <span className="text-red-500">+{priceChange.toFixed(1)}%</span>
                            </>
                          ) : priceChange < 0 ? (
                            <>
                              <TrendingDown className="h-3 w-3 text-green-500" />
                              <span className="text-green-500">{priceChange.toFixed(1)}%</span>
                            </>
                          ) : (
                            <span className="text-gray-500">Base price</span>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => navigate(`/book/${flight.flight_id}`)}
                        disabled={!isAvailable}
                      >
                        {isAvailable ? 'Book Now' : 'Unavailable'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {filteredFlights.length > 0 && (
        <p className="text-center text-gray-500 text-sm mt-6 pb-6">
          Showing {filteredFlights.length} of {flights.length} flights • Prices update every 30 seconds
        </p>
      )}
      </div>
    </div>
  );
}
