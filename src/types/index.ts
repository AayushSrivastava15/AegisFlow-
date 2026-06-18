export interface Company {
  companyId: string;
  companyName: string;
  ownerUid: string;
  plan: 'free' | 'starter' | 'growth' | 'enterprise';
  createdAt: string;
}

export interface Employee {
  employeeId: string;
  companyId: string;
  email: string;
  role: 'owner' | 'admin' | 'manager' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  name?: string;
}

export interface Product {
  productId: string;
  companyId: string;
  name: string;
  type: 'SaaS Application' | 'REST API' | 'Internal Platform' | 'Enterprise Software' | 'Cloud Service';
  apiKey: string;
  sdkSecret: string;
  status: 'LIVE' | 'WARNING' | 'OFFLINE' | 'RENEWAL_NEEDED' | 'SUSPENDED' | 'REVOKED' | 'PENDING_CONNECTION';
  version: string;
  activeUsers: number;
  healthScore: number;
  lastHeartbeat: string;
  createdAt: string;
}

export interface Customer {
  customerId: string;
  companyId: string;
  name: string;
  email: string;
  company: string;
  licenseCount?: number;
  productUsage?: number;
  renewalDate?: string;
  status?: 'active' | 'inactive';
}

export interface License {
  licenseId: string;
  companyId: string;
  productId: string;
  productName: string;
  customerId: string;
  customerName: string;
  key: string;
  expiryDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'REVOKED' | 'PENDING';
  createdAt: string;
  lastActivatedAt?: string;
  usageLimit: number;
  usageCount: number;
}

export interface Heartbeat {
  heartbeatId: string;
  companyId: string;
  productId: string;
  version: string;
  activeUsers: number;
  environment: 'production' | 'staging' | 'development';
  serverStatus: 'UP' | 'DOWN';
  timestamp: string;
}

export interface ActivityLog {
  logId: string;
  companyId: string;
  userId: string;
  action: string;
  timestamp: string;
  employeeEmail?: string;
}

export interface Billing {
  billingId: string;
  companyId: string;
  plan: 'free' | 'starter' | 'growth' | 'enterprise';
  amount: number;
  status: 'active' | 'past_due' | 'canceled';
  createdAt: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
