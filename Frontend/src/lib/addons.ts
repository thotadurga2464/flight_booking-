// Shared add-ons configuration
import { UtensilsCrossed, Luggage, ShieldCheck, Star } from 'lucide-react';

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: any;
  category: 'meal' | 'baggage' | 'insurance' | 'upgrade';
}

export const AVAILABLE_ADDONS: AddOn[] = [
  {
    id: 'meal-veg',
    name: 'Vegetarian Meal',
    description: 'Fresh vegetarian meal with salad',
    price: 15,
    icon: UtensilsCrossed,
    category: 'meal',
  },
  {
    id: 'meal-nonveg',
    name: 'Non-Vegetarian Meal',
    description: 'Chicken or beef meal with sides',
    price: 18,
    icon: UtensilsCrossed,
    category: 'meal',
  },
  {
    id: 'meal-premium',
    name: 'Premium Meal',
    description: 'Gourmet meal with dessert & beverage',
    price: 35,
    icon: UtensilsCrossed,
    category: 'meal',
  },
  {
    id: 'baggage-extra',
    name: 'Extra Baggage (23kg)',
    description: 'Additional checked baggage allowance',
    price: 45,
    icon: Luggage,
    category: 'baggage',
  },
  {
    id: 'insurance-basic',
    name: 'Travel Insurance',
    description: 'Basic coverage up to $50,000',
    price: 25,
    icon: ShieldCheck,
    category: 'insurance',
  },
  {
    id: 'insurance-premium',
    name: 'Premium Insurance',
    description: 'Comprehensive coverage up to $200,000',
    price: 65,
    icon: ShieldCheck,
    category: 'insurance',
  },
  {
    id: 'upgrade-priority',
    name: 'Priority Boarding',
    description: 'Board first and skip the queue',
    price: 20,
    icon: Star,
    category: 'upgrade',
  },
  {
    id: 'upgrade-lounge',
    name: 'Airport Lounge Access',
    description: 'Complimentary food & drinks',
    price: 40,
    icon: Star,
    category: 'upgrade',
  },
];

export const getAddOnById = (id: string): AddOn | undefined => {
  return AVAILABLE_ADDONS.find((addon) => addon.id === id);
};

export const calculateAddOnsTotal = (addonIds: string[]): number => {
  return addonIds.reduce((total, id) => {
    const addon = getAddOnById(id);
    return total + (addon?.price || 0);
  }, 0);
};
