export const PAKISTAN_CITIES = [
  "Karachi", "Lahore", "Islamabad", "Faisalabad", "Rawalpindi", 
  "Multan", "Hyderabad", "Gujranwala", "Peshawar", "Quetta", 
  "Sialkot", "Bahawalpur", "Sargodha", "Sukkur", "Jhang", 
  "Shekhupura", "Larkana", "Gujrat", "Mardan", "Kasur"
];

import { Property } from './types';

export const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Skyline Loft Residency',
    location: 'Downtown District, Metropolis',
    city: 'Islamabad',
    price: 125000,
    match: 98,
    beds: 3,
    baths: 2,
    type: 'Apartment',
    images: ['https://images.unsplash.com/photo-1600607687940-47a000dfd39c?w=800&q=80'],
    description: 'A high-end, contemporary luxury villa with expansive floor-to-ceiling glass windows and a sleek architectural design.',
    amenities: ['Close to work', 'Pet friendly', 'Under budget'],
    owner: {
      name: 'John Doe',
      role: 'Registered Property Manager',
      verified: true,
      phone: '+92 300 1234567',
      avatar: 'https://i.pravatar.cc/150?u=john'
    }
  },
  {
    id: '2',
    title: 'The Glass House Unit 4B',
    location: 'West End Arts District',
    city: 'Lahore',
    price: 85000,
    match: 92,
    beds: 2,
    baths: 1,
    type: 'Apartment',
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80'],
    description: 'A bright and airy modern apartment interior with high ceilings and minimalist decor.',
    amenities: ['Parking', 'WiFi', 'Security'],
    owner: {
      name: 'Jane Smith',
      role: 'Landlord',
      verified: true,
      phone: '+92 321 7654321',
      avatar: 'https://i.pravatar.cc/150?u=jane'
    }
  },
  {
    id: '3',
    title: 'Modern Office Suite',
    location: 'Gulberg Main Blvd',
    city: 'Lahore',
    price: 150000,
    match: 85,
    beds: 0,
    baths: 2,
    type: 'Commercial',
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'],
    description: 'Fully furnished luxury office suite with high-speed internet and conference room access.',
    amenities: ['AC', 'Elevator', 'WiFi'],
    owner: {
      name: 'Ali Khan',
      role: 'Commercial Agent',
      verified: true,
      phone: '+92 333 4445556',
      avatar: 'https://i.pravatar.cc/150?u=ali'
    }
  },
  {
    id: '4',
    title: 'Retail Corner Shop',
    location: 'Tariq Road Shop #12',
    city: 'Karachi',
    price: 45000,
    match: 89,
    beds: 0,
    baths: 1,
    type: 'Commercial',
    images: ['https://images.unsplash.com/photo-1555529669-2269763671c0?w=800&q=80'],
    description: 'Excellent visibility for your brand. This corner unit offers high exposure.',
    amenities: ['High Traffic', 'Security', 'Parking'],
    owner: {
      name: 'Sarah Ahmed',
      role: 'Property Owner',
      verified: true,
      phone: '+92 345 9998887',
      avatar: 'https://i.pravatar.cc/150?u=sarah'
    }
  }
];
