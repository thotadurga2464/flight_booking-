import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner@2.0.3';
import HomePage from './components/HomePage';
import FlightsList from './components/FlightsList';
import BookingPage from './components/BookingPage';
import PaymentPage from './components/PaymentPage';
import ReceiptPage from './components/ReceiptPage';
import FareHistoryPage from './components/FareHistoryPage';
import MyBookingsPage from './components/MyBookingsPage';
import SupportPage from './components/SupportPage';
import AdminPage from './components/AdminPage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Toaster position="top-right" richColors />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/flights" element={<FlightsList />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/book/:flightId" element={<BookingPage />} />
            <Route path="/payment/:pnr" element={<PaymentPage />} />
            <Route path="/receipt/:pnr" element={<ReceiptPage />} />
            <Route path="/fare-history" element={<FareHistoryPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
