// Mock API for demo purposes - simulates the FastAPI backend

export interface Flight {
  flight_id: number;
  flight_no: string;
  airline: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  total_seats: number;
  available_seats: number;
  base_price: number;
  dynamic_price: number;
  status: string;
}

export interface BookingRequest {
  flight_id: number;
  seat_no: string;
  passenger_fullname: string;
  passenger_contact: string;
  addons?: string[]; // Array of add-on IDs
}

export interface BookingResponse {
  pnr: string;
  message: string;
  booking_details: {
    booking_id: number;
    flight_no: string;
    seat_no: string;
    passenger_fullname: string;
    price: number;
    status: string;
    addons?: string[];
  };
}

export interface PaymentResponse {
  message: string;
  pnr: string;
  status: string;
  payment_details?: {
    payment_id: number;
    amount: number;
    payment_method: string;
    payment_status: string;
  };
}

export interface Receipt {
  pnr: string;
  passenger_fullname: string;
  passenger_contact: string;
  flight_no: string;
  airline: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  seat_no: string;
  price: number;
  booking_status: string;
  booking_date: string;
  addons?: string[];
}

export interface FareHistory {
  timestamp: string;
  price: number;
  available_seats: number;
}

// Mock data storage
let mockFlights: Flight[] = [
  {
    flight_id: 1,
    flight_no: 'AA101',
    airline: 'American Airlines',
    origin: 'New York (JFK)',
    destination: 'Los Angeles (LAX)',
    departure_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    arrival_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
    total_seats: 180,
    available_seats: 45,
    base_price: 299.99,
    dynamic_price: 324.99,
    status: 'Scheduled',
  },
  {
    flight_id: 2,
    flight_no: 'DL205',
    airline: 'Delta Airlines',
    origin: 'Chicago (ORD)',
    destination: 'Miami (MIA)',
    departure_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    arrival_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
    total_seats: 160,
    available_seats: 78,
    base_price: 189.99,
    dynamic_price: 175.50,
    status: 'Scheduled',
  },
  {
    flight_id: 3,
    flight_no: 'UA303',
    airline: 'United Airlines',
    origin: 'San Francisco (SFO)',
    destination: 'Seattle (SEA)',
    departure_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    arrival_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    total_seats: 120,
    available_seats: 12,
    base_price: 149.99,
    dynamic_price: 189.99,
    status: 'Scheduled',
  },
  {
    flight_id: 4,
    flight_no: 'SW407',
    airline: 'Southwest Airlines',
    origin: 'Dallas (DFW)',
    destination: 'Denver (DEN)',
    departure_time: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    arrival_time: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000).toISOString(),
    total_seats: 140,
    available_seats: 95,
    base_price: 129.99,
    dynamic_price: 119.99,
    status: 'Scheduled',
  },
  {
    flight_id: 5,
    flight_no: 'JB512',
    airline: 'JetBlue Airways',
    origin: 'Boston (BOS)',
    destination: 'Orlando (MCO)',
    departure_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    arrival_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 3.5 * 60 * 60 * 1000).toISOString(),
    total_seats: 150,
    available_seats: 5,
    base_price: 199.99,
    dynamic_price: 259.99,
    status: 'Scheduled',
  },
  {
    flight_id: 6,
    flight_no: 'AS615',
    airline: 'Alaska Airlines',
    origin: 'Portland (PDX)',
    destination: 'Las Vegas (LAS)',
    departure_time: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    arrival_time: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    total_seats: 130,
    available_seats: 0,
    base_price: 159.99,
    dynamic_price: 159.99,
    status: 'Sold Out',
  },
];

// Helper functions for localStorage persistence
const getStoredBookings = (): Map<string, any> => {
  try {
    const stored = localStorage.getItem('mockBookings');
    if (stored) {
      const bookingsArray = JSON.parse(stored);
      return new Map(bookingsArray);
    }
  } catch (error) {
    console.error('Error loading bookings from localStorage:', error);
  }
  return new Map();
};

const saveBookings = (bookings: Map<string, any>) => {
  try {
    const bookingsArray = Array.from(bookings.entries());
    localStorage.setItem('mockBookings', JSON.stringify(bookingsArray));
  } catch (error) {
    console.error('Error saving bookings to localStorage:', error);
  }
};

let mockBookings: Map<string, any> = getStoredBookings();
let mockFareHistories: Map<string, FareHistory[]> = new Map();

// Generate initial fare history for each flight
mockFlights.forEach((flight) => {
  const history: FareHistory[] = [];
  const now = Date.now();
  
  for (let i = 10; i >= 0; i--) {
    const timestamp = new Date(now - i * 60 * 60 * 1000); // Every hour
    const availableSeats = Math.max(5, flight.available_seats + Math.floor(Math.random() * 20) - 10);
    const priceVariation = (100 - (availableSeats / flight.total_seats) * 100) / 100;
    const price = flight.base_price * (1 + priceVariation * 0.5);
    
    history.push({
      timestamp: timestamp.toISOString(),
      price: Number(price.toFixed(2)),
      available_seats: availableSeats,
    });
  }
  
  mockFareHistories.set(flight.flight_no, history);
});

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock API functions
export const getFlights = async (): Promise<Flight[]> => {
  await delay(500);
  
  // Simulate dynamic pricing changes
  mockFlights = mockFlights.map((flight) => {
    const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
    const newPrice = flight.dynamic_price * (1 + variation);
    return {
      ...flight,
      dynamic_price: Number(newPrice.toFixed(2)),
    };
  });
  
  return [...mockFlights];
};

export const getPricing = async (flightNo: string): Promise<{ flight_no: string; current_price: number }> => {
  await delay(300);
  
  const flight = mockFlights.find((f) => f.flight_no === flightNo);
  if (!flight) {
    throw new Error('Flight not found');
  }
  
  return {
    flight_no: flightNo,
    current_price: flight.dynamic_price,
  };
};

export const reserveBooking = async (bookingData: BookingRequest): Promise<BookingResponse> => {
  await delay(800);
  
  const flight = mockFlights.find((f) => f.flight_id === bookingData.flight_id);
  if (!flight) {
    throw new Error('Flight not found');
  }
  
  if (flight.available_seats <= 0) {
    throw new Error('No seats available');
  }
  
  // Generate PNR
  const pnr = `PNR${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  
  // Store booking
  const booking = {
    pnr,
    booking_id: Date.now(),
    flight_id: flight.flight_id,
    flight_no: flight.flight_no,
    airline: flight.airline,
    origin: flight.origin,
    destination: flight.destination,
    departure_time: flight.departure_time,
    arrival_time: flight.arrival_time,
    seat_no: bookingData.seat_no,
    passenger_fullname: bookingData.passenger_fullname,
    passenger_contact: bookingData.passenger_contact,
    price: flight.dynamic_price,
    status: 'Reserved',
    booking_date: new Date().toISOString(),
    addons: bookingData.addons,
  };
  
  mockBookings.set(pnr, booking);
  saveBookings(mockBookings); // Persist to localStorage
  
  // Update available seats
  flight.available_seats -= 1;
  
  return {
    pnr,
    message: 'Seat reserved successfully',
    booking_details: {
      booking_id: booking.booking_id,
      flight_no: booking.flight_no,
      seat_no: booking.seat_no,
      passenger_fullname: booking.passenger_fullname,
      price: booking.price,
      status: booking.status,
      addons: booking.addons,
    },
  };
};

export const payBooking = async (pnr: string): Promise<PaymentResponse> => {
  await delay(1500);
  
  const booking = mockBookings.get(pnr);
  if (!booking) {
    throw new Error('Booking not found');
  }
  
  // Update booking status
  booking.status = 'Confirmed';
  mockBookings.set(pnr, booking);
  saveBookings(mockBookings); // Persist to localStorage
  
  return {
    message: 'Payment processed successfully',
    pnr,
    status: 'Confirmed',
    payment_details: {
      payment_id: Date.now(),
      amount: booking.price,
      payment_method: 'Credit Card',
      payment_status: 'Completed',
    },
  };
};

export const cancelBooking = async (pnr: string): Promise<{ message: string }> => {
  await delay(500);
  
  const booking = mockBookings.get(pnr);
  if (!booking) {
    throw new Error('Booking not found');
  }
  
  // Restore seat
  const flight = mockFlights.find((f) => f.flight_id === booking.flight_id);
  if (flight) {
    flight.available_seats += 1;
  }
  
  // Remove booking
  mockBookings.delete(pnr);
  saveBookings(mockBookings); // Persist to localStorage
  
  return {
    message: 'Booking cancelled successfully',
  };
};

export const getFareHistory = async (flightNo: string): Promise<FareHistory[]> => {
  await delay(600);
  
  const history = mockFareHistories.get(flightNo);
  if (!history) {
    return [];
  }
  
  return [...history];
};

export const getBookingDetails = async (pnr: string): Promise<Receipt> => {
  await delay(400);
  
  const booking = mockBookings.get(pnr);
  if (!booking) {
    throw new Error('Booking not found');
  }
  
  return {
    pnr: booking.pnr,
    passenger_fullname: booking.passenger_fullname,
    passenger_contact: booking.passenger_contact,
    flight_no: booking.flight_no,
    airline: booking.airline,
    origin: booking.origin,
    destination: booking.destination,
    departure_time: booking.departure_time,
    arrival_time: booking.arrival_time,
    seat_no: booking.seat_no,
    price: booking.price,
    booking_status: booking.status,
    booking_date: booking.booking_date,
    addons: booking.addons,
  };
};