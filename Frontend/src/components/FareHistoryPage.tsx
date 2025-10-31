import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner@2.0.3';
import { TrendingUp, Plane, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Skeleton } from './ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getFlights, getFareHistory, Flight, FareHistory } from '../lib/api';

export default function FareHistoryPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<string>('');
  const [fareHistory, setFareHistory] = useState<FareHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchFlights();
  }, []);

  useEffect(() => {
    if (selectedFlight) {
      fetchFareHistory(selectedFlight);
    }
  }, [selectedFlight]);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const data = await getFlights();
      setFlights(data);
      
      if (data.length > 0) {
        setSelectedFlight(data[0].flight_no);
      }
    } catch (error) {
      toast.error('Failed to fetch flights');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFareHistory = async (flightNo: string) => {
    try {
      setLoadingHistory(true);
      const data = await getFareHistory(flightNo);
      setFareHistory(data);
    } catch (error) {
      toast.error('Failed to fetch fare history');
      console.error(error);
      setFareHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const getChartData = () => {
    return fareHistory.map((item) => ({
      time: new Date(item.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      price: item.price,
      seats: item.available_seats,
      fullTimestamp: new Date(item.timestamp).toLocaleString(),
    }));
  };

  const getStatistics = () => {
    if (fareHistory.length === 0) return null;

    const prices = fareHistory.map((f) => f.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const currentPrice = prices[prices.length - 1];
    const priceChange = prices.length > 1 ? currentPrice - prices[0] : 0;
    const percentChange = prices.length > 1 ? ((priceChange / prices[0]) * 100) : 0;

    return {
      minPrice,
      maxPrice,
      avgPrice,
      currentPrice,
      priceChange,
      percentChange,
    };
  };

  const selectedFlightDetails = flights.find((f) => f.flight_no === selectedFlight);
  const stats = getStatistics();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/flights')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-gray-900">Fare Trends</h1>
              <p className="text-sm text-gray-600">Historical pricing</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* Flight Selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Flight</CardTitle>
          <CardDescription>Choose a flight to view its fare history</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedFlight} onValueChange={setSelectedFlight}>
            <SelectTrigger>
              <SelectValue placeholder="Select a flight" />
            </SelectTrigger>
            <SelectContent>
              {flights.map((flight) => (
                <SelectItem key={flight.flight_id} value={flight.flight_no}>
                  {flight.flight_no} - {flight.airline} ({flight.origin} → {flight.destination})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedFlightDetails && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Plane className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-gray-900">
                    {selectedFlightDetails.flight_no} - {selectedFlightDetails.airline}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {selectedFlightDetails.origin} → {selectedFlightDetails.destination}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Current Price</p>
                  <p className="text-gray-900 text-2xl">${stats.currentPrice.toFixed(2)}</p>
                </div>
                <div className={`text-sm ${stats.percentChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {stats.percentChange >= 0 ? '+' : ''}
                  {stats.percentChange.toFixed(1)}%
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600 text-sm">Average Price</p>
              <p className="text-gray-900 text-2xl">${stats.avgPrice.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600 text-sm">Lowest Price</p>
              <p className="text-gray-900 text-2xl text-green-600">${stats.minPrice.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600 text-sm">Highest Price</p>
              <p className="text-gray-900 text-2xl text-red-600">${stats.maxPrice.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            <TrendingUp className="inline h-5 w-5 mr-2" />
            Price History Chart
          </CardTitle>
          <CardDescription>
            Real-time fare changes over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="h-96 flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          ) : fareHistory.length === 0 ? (
            <div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No fare history available for this flight</p>
                <p className="text-gray-500 text-sm mt-2">
                  Price history will be recorded as the dynamic pricing system updates
                </p>
              </div>
            </div>
          ) : (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                  />
                  <YAxis
                    yAxisId="price"
                    orientation="left"
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                    label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
                  />
                  <YAxis
                    yAxisId="seats"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                    label={{ value: 'Available Seats', angle: 90, position: 'insideRight' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '12px',
                    }}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
                    formatter={(value: any, name: string) => {
                      if (name === 'price') return [`$${value.toFixed(2)}`, 'Price'];
                      if (name === 'seats') return [value, 'Available Seats'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="price"
                    type="monotone"
                    dataKey="price"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ fill: '#2563eb', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Price"
                  />
                  <Line
                    yAxisId="seats"
                    type="monotone"
                    dataKey="seats"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Available Seats"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {fareHistory.length > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-gray-700 text-sm">
            💡 <span className="font-semibold">Tip:</span> Prices fluctuate based on seat availability and demand. 
            Book early when prices are lower to get the best deals!
          </p>
        </div>
      )}
      </div>
    </div>
  );
}
