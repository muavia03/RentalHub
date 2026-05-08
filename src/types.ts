export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'Landlord' | 'Tenant';
  avatar?: string;
  notificationsEnabled: boolean;
  privacyEnabled: boolean;
  createdAt: any;
}

export interface Property {
  id?: string;
  title: string;
  type: string;
  price: number;
  location: string;
  city: string;
  beds: number;
  baths?: number;
  match?: number;
  description?: string;
  amenities: string[];
  images: string[];
  ownerId?: string;
  ownerName?: string;
  ownerAvatar?: string;
  owner?: {
    name: string;
    role: string;
    verified: boolean;
    phone: string;
    avatar: string;
  };
  status?: string;
  createdAt?: any;
}

export interface Inquiry {
  id?: string;
  listingId: string;
  listingTitle: string;
  tenantId: string;
  tenantName: string;
  landlordId: string;
  message: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  createdAt: any;
}
