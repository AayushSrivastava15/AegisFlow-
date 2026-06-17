export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  clientCount: number;
  licenseCount: number;
  createdAt: string;
  price: string;
  icon: string; // Lucide icon name
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  logo: string; // Initials or short name
  activeLicenses: number;
  totalLicenses: number;
  joinedAt: string;
}

export interface License {
  id: string;
  key: string;
  clientId: string;
  clientName: string;
  productId: string;
  productName: string;
  status: 'active' | 'suspended' | 'expiring';
  expiresAt: string;
  createdAt: string;
  lastActivatedAt?: string;
  usageLimit: number;
  usageCount: number;
}

export interface ActivityLog {
  id: string;
  licenseId?: string;
  type: 'created' | 'activated' | 'suspended' | 'renewed' | 'deleted';
  description: string;
  timestamp: string;
  productName?: string;
  clientName?: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
