import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Shield, DollarSign, Globe, Headphones, Plane } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import BottomNav from './BottomNav';

interface Destination {
  id: number;
  name: string;
  country: string;
  price: number;
  image: string;
  special?: boolean;
  category: 'domestic' | 'international';
}

export default function HomePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');

  const destinations: Destination[] = [
    {
      id: 1,
      name: 'Paris',
      country: 'France',
      price: 325,
      image: 'https://images.unsplash.com/photo-1570097703229-b195d6dd291f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlaWZmZWwlMjB0b3dlciUyMHBhcmlzfGVufDF8fHx8MTc2MTcwODM0OXww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'international',
    },
    {
      id: 2,
      name: 'Dubai',
      country: 'United Arab Emirates',
      price: 587,
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkdWJhaSUyMHNreWxpbmV8ZW58MXx8fHwxNzYxNzMyODU5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'international',
    },
    {
      id: 3,
      name: 'Sydney',
      country: 'Australia',
      price: 892,
      image: 'https://images.unsplash.com/photo-1523059623039-a9ed027e7fad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzeWRuZXklMjBvcGVyYSUyMGhvdXNlfGVufDF8fHx8MTc2MTcwODM1MHww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'international',
    },
    {
      id: 4,
      name: 'New York',
      country: 'United States',
      price: 445,
      image: 'https://images.unsplash.com/photo-1557211300-9991249b466a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXclMjB5b3JrJTIwY2l0eSUyMG5pZ2h0fGVufDF8fHx8MTc2MTc0NTY1Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'international',
    },
    {
      id: 5,
      name: 'Tokyo',
      country: 'Japan',
      price: 678,
      image: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b2t5byUyMHNreWxpbmV8ZW58MXx8fHwxNzYxNjYxNDc4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'international',
    },
    {
      id: 6,
      name: 'London',
      country: 'United Kingdom',
      price: 289,
      image: 'https://images.unsplash.com/photo-1745016176874-cd3ed3f5bfc6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb25kb24lMjBiaWclMjBiZW58ZW58MXx8fHwxNzYxNzQ4NzMwfDA&ixlib=rb-4.1.0&q=80&w=1080',
      special: true,
      category: 'international',
    },
    {
      id: 7,
      name: 'Mumbai',
      country: 'India',
      price: 120,
      image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdW1iYWklMjBnYXRld2F5fGVufDF8fHx8MTc2MTcwODM1MXww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'domestic',
    },
    {
      id: 8,
      name: 'Delhi',
      country: 'India',
      price: 98,
      image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWxoaSUyMGluZGlhJTIwbWFoYWwlMjB0YWp8ZW58MXx8fHwxNzYxNzQ4NzMxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'domestic',
    },
    {
      id: 9,
      name: 'Bangalore',
      country: 'India',
      price: 89,
      image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5nYWxvcmUlMjBpbmRpYXxlbnwxfHx8fDE3NjE3NDg3MzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'domestic',
    },
    {
      id: 10,
      name: 'Goa',
      country: 'India',
      price: 145,
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2ElMjBiZWFjaHxlbnwxfHx8fDE3NjE3NDg3MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'domestic',
      special: true,
    },
    {
      id: 11,
      name: 'Jaipur',
      country: 'India',
      price: 78,
      image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYWlwdXIlMjBoYXdhJTIwbWFoYWx8ZW58MXx8fHwxNzYxNzQ4NzMyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'domestic',
    },
    {
      id: 12,
      name: 'Kolkata',
      country: 'India',
      price: 95,
      image: 'https://images.unsplash.com/photo-1558431382-27e303142255?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb2xrYXRhJTIwaG93cmFoJTIwYnJpZGdlfGVufDF8fHx8MTc2MTc0ODczM3ww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'domestic',
    },
  ];

  const tabs = ['All', 'Domestic', 'International', 'Special'];

  // Filter destinations based on active tab
  const filteredDestinations = destinations.filter((dest) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Domestic') return dest.category === 'domestic';
    if (activeTab === 'International') return dest.category === 'international';
    if (activeTab === 'Special') return dest.special === true;
    return true;
  });

  const features = [
    {
      icon: Shield,
      title: 'Secure Booking',
      description: 'Safe & protected',
    },
    {
      icon: DollarSign,
      title: 'Best Prices',
      description: 'Lowest fares',
    },
    {
      icon: Globe,
      title: 'Worldwide',
      description: 'Global coverage',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Always available',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-50 to-gray-900">
      {/* Header */}
      <div className="bg-gray-900 pt-12 pb-6 px-4">
        <div className="max-w-md mx-auto flex items-center justify-between mb-8">
          <button className="text-white p-2">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <button className="text-white p-2">
            <Download className="h-6 w-6" />
          </button>
        </div>

        {/* Logo/Brand */}
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Top Section */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <span className="text-gray-900">SkyWings</span>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Special Offer Button */}
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-6 mb-4">
              🎉 LONDON SPECIAL
            </Button>

            {/* Destination Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {filteredDestinations.map((destination) => (
                <button
                  key={destination.id}
                  onClick={() => navigate('/flights')}
                  className="relative rounded-xl overflow-hidden group hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-[4/3] relative">
                    <ImageWithFallback
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Destination Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                      <p className="text-xs opacity-90">{destination.country}</p>
                      <p className="font-medium">{destination.name}</p>
                      <p className="text-sm mt-1">
                        <span className="text-xs">from </span>
                        <span className="font-semibold">${destination.price}</span>
                      </p>
                    </div>

                    {destination.special && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        Special
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Why Choose Section */}
            <div className="mb-4">
              <h3 className="text-gray-900 mb-4 text-center">
                Why Choose SkyWings?
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex flex-col items-center text-center">
                    <div className="bg-blue-50 p-3 rounded-full mb-2">
                      <feature.icon className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="text-xs text-gray-900 font-medium mb-1">
                      {feature.title}
                    </p>
                    <p className="text-xs text-gray-500">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Spacer for BottomNav */}
      <div className="h-20 bg-gray-900" />
      
      <BottomNav />
    </div>
  );
}