import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  HelpCircle, 
  Clock, 
  MapPin,
  Send,
  CheckCircle2
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { toast } from 'sonner@2.0.3';
import BottomNav from './BottomNav';

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Your message has been sent! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const faqs = [
    {
      question: 'How do I change my flight booking?',
      answer: 'You can change your booking by going to "My Bookings", selecting your flight, and clicking the "Modify Booking" button. Changes are subject to availability and may incur fees.',
    },
    {
      question: 'What is the cancellation policy?',
      answer: 'Cancellation policies vary by airline and fare type. Generally, you can cancel within 24 hours of booking for a full refund. Check your booking details for specific terms.',
    },
    {
      question: 'How do I select my seat?',
      answer: 'During the booking process, you\'ll have the option to select your seat from the available seat map. You can also change your seat selection in "My Bookings" before check-in.',
    },
    {
      question: 'What documents do I need to travel?',
      answer: 'You\'ll need a valid government-issued ID for domestic flights and a passport for international travel. Some destinations may require visas or additional documentation.',
    },
    {
      question: 'How early should I arrive at the airport?',
      answer: 'We recommend arriving 2 hours before domestic flights and 3 hours before international flights to allow time for check-in and security.',
    },
    {
      question: 'How can I track my refund?',
      answer: 'Refunds typically take 7-10 business days to process. You can track your refund status in "My Bookings" or contact our support team.',
    },
  ];

  const contactMethods = [
    {
      icon: Phone,
      title: '24/7 Phone Support',
      detail: '+1 (800) 123-4567',
      action: 'Call Now',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Mail,
      title: 'Email Support',
      detail: 'support@skywings.com',
      action: 'Send Email',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      detail: 'Available 24/7',
      action: 'Start Chat',
      color: 'bg-green-50 text-green-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white pt-12 pb-6 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-white mb-2">Support Center</h1>
          <p className="text-purple-100">We're here to help you 24/7</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4 space-y-4">
        {/* Quick Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {contactMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <Card key={index} className="shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className={`${method.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-gray-900 mb-1">{method.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{method.detail}</p>
                  <Button variant="outline" size="sm" className="w-full">
                    {method.action}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-purple-600" />
              Send Us a Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  placeholder="Please describe your issue or question..."
                  rows={5}
                />
              </div>

              <Button type="submit" className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Office Hours */}
        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-600 mt-1" />
              <div>
                <h3 className="text-gray-900 mb-1">Support Hours</h3>
                <p className="text-sm text-gray-600">
                  Our support team is available 24/7 to assist you with any questions or concerns.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
