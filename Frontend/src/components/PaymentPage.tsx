import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner@2.0.3';
import { CreditCard, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { payBooking, cancelBooking } from '../lib/api';

export default function PaymentPage() {
  const { pnr } = useParams<{ pnr: string }>();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleExpiration();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleExpiration = () => {
    toast.error('Booking expired! Please try again.');
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  const handlePayment = async () => {
    if (!pnr) return;

    try {
      setProcessing(true);
      
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const response = await payBooking(pnr);
      
      if (response.payment_details?.payment_status === 'Completed') {
        setPaymentStatus('success');
        toast.success('Payment successful!');
        
        // Navigate to receipt after 2 seconds
        setTimeout(() => {
          navigate(`/receipt/${pnr}`);
        }, 2000);
      } else {
        setPaymentStatus('failed');
        toast.error('Payment failed. Please try again.');
      }
    } catch (error: any) {
      setPaymentStatus('failed');
      const errorMessage = error.response?.data?.detail || 'Payment processing failed';
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!pnr) return;

    try {
      setCanceling(true);
      await cancelBooking(pnr);
      toast.success('Booking cancelled successfully');
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to cancel booking';
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setCanceling(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((900 - timeLeft) / 900) * 100;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-gray-900 mb-2">Complete Payment</h1>
        <p className="text-gray-600">PNR: {pnr}</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Timer</CardTitle>
              <CardDescription>Complete payment before time expires</CardDescription>
            </div>
            <Badge variant={timeLeft < 300 ? 'destructive' : 'default'}>
              {formatTime(timeLeft)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={getProgressPercentage()} className="h-2" />
          {timeLeft < 300 && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Hurry up!</AlertTitle>
              <AlertDescription>
                Your reservation will expire in {formatTime(timeLeft)}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {paymentStatus === 'pending' && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>This is a simulated payment for demonstration purposes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <CreditCard className="h-4 w-4" />
              <AlertTitle>Demo Payment</AlertTitle>
              <AlertDescription>
                Click "Pay Now" to simulate a successful payment. No actual transaction will occur.
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-lg border-2 border-gray-200">
                  <CreditCard className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-gray-900">Credit / Debit Card</p>
                  <p className="text-gray-500 text-sm">Simulated payment method</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t space-y-4">
              <Button
                onClick={handlePayment}
                disabled={processing}
                className="w-full"
                size="lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Pay Now
                  </>
                )}
              </Button>

              <Button
                onClick={handleCancel}
                disabled={canceling || processing}
                variant="outline"
                className="w-full"
              >
                {canceling ? 'Canceling...' : 'Cancel Booking'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {paymentStatus === 'success' && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your booking has been confirmed. Redirecting to receipt...
            </p>
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
          </CardContent>
        </Card>
      )}

      {paymentStatus === 'failed' && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">
              There was an error processing your payment. Please try again.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={handlePayment} disabled={processing}>
                Try Again
              </Button>
              <Button onClick={handleCancel} variant="outline" disabled={canceling}>
                Cancel Booking
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
