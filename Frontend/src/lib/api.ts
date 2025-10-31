// Re-export types and functions from mockApi for demo mode
// To use real backend, replace './mockApi' with the axios implementation

export type {
  Flight,
  BookingRequest,
  BookingResponse,
  PaymentResponse,
  Receipt,
  FareHistory,
} from './mockApi';

export {
  getFlights,
  getPricing,
  reserveBooking,
  payBooking,
  cancelBooking,
  getFareHistory,
  getBookingDetails,
} from './mockApi';

// Note: When connecting to real FastAPI backend at http://127.0.0.1:8000,
// uncomment the axios implementation below and comment out the mockApi imports above

/*
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getFlights = async (): Promise<Flight[]> => {
  const response = await api.get('/flights/');
  return response.data;
};

export const getPricing = async (flightNo: string): Promise<{ flight_no: string; current_price: number }> => {
  const response = await api.get(`/pricing/${flightNo}`);
  return response.data;
};

export const reserveBooking = async (bookingData: BookingRequest): Promise<BookingResponse> => {
  const response = await api.post('/booking/reserve', bookingData);
  return response.data;
};

export const payBooking = async (pnr: string): Promise<PaymentResponse> => {
  const response = await api.post(`/bookings/pay/${pnr}`);
  return response.data;
};

export const cancelBooking = async (pnr: string): Promise<{ message: string }> => {
  const response = await api.delete(`/bookings/cancel/${pnr}`);
  return response.data;
};

export const getFareHistory = async (flightNo: string): Promise<FareHistory[]> => {
  const response = await api.get(`/fare-history/${flightNo}`);
  return response.data;
};

export const getBookingDetails = async (pnr: string): Promise<Receipt> => {
  const response = await api.get(`/bookings/${pnr}`);
  return response.data;
};
*/
