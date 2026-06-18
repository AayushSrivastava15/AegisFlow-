import { Product, Customer, License, ActivityLog } from '../types';

export const initialProducts: Product[] = [
  {
    productId: 'prod-1',
    companyId: 'company-1',
    name: 'SupaAuth Gateway',
    type: 'SaaS Application',
    apiKey: 'ak_live_51N8fH2kL90QjPzRt8x5yT2w',
    sdkSecret: 'sec_live_9a8b7c6d5e4f3g2h1i0j',
    status: 'LIVE',
    version: '1.2.0',
    activeUsers: 1420,
    healthScore: 98,
    lastHeartbeat: '2026-06-18T10:00:00Z',
    createdAt: '2026-01-15T08:00:00Z'
  },
  {
    productId: 'prod-2',
    companyId: 'company-1',
    name: 'Hospital ERP Security Broker',
    type: 'Enterprise Software',
    apiKey: 'ak_live_382jD8fkJ29Kds91J8fkd01',
    sdkSecret: 'sec_live_a1b2c3d4e5f6g7h8i9j0',
    status: 'WARNING',
    version: '2.0.4',
    activeUsers: 340,
    healthScore: 78,
    lastHeartbeat: '2026-06-18T09:45:00Z',
    createdAt: '2026-02-10T11:30:00Z'
  },
  {
    productId: 'prod-3',
    companyId: 'company-1',
    name: 'Patient Telemetry API Engine',
    type: 'REST API',
    apiKey: 'ak_live_725kS91Kd83Jks92J1skd93',
    sdkSecret: 'sec_live_0j9i8h7g6f5e4d3c2b1a',
    status: 'OFFLINE',
    version: '1.0.0',
    activeUsers: 0,
    healthScore: 0,
    lastHeartbeat: '2026-06-17T22:30:00Z',
    createdAt: '2026-03-01T09:00:00Z'
  }
];

export const initialCustomers: Customer[] = [
  {
    customerId: 'cust-1',
    companyId: 'company-1',
    name: 'Mitchell Baker',
    email: 'mitchell@mozilla.org',
    company: 'Mozilla Foundation',
    licenseCount: 2,
    productUsage: 85,
    renewalDate: '2027-01-20T10:00:00Z',
    status: 'active'
  },
  {
    customerId: 'cust-2',
    companyId: 'company-1',
    name: 'Shantanu Narayen',
    email: 'shantanu@adobe.com',
    company: 'Adobe Systems Inc.',
    licenseCount: 1,
    productUsage: 94,
    renewalDate: '2026-12-15T08:00:00Z',
    status: 'active'
  },
  {
    customerId: 'cust-3',
    companyId: 'company-1',
    name: 'Thomas Dohmke',
    email: 'thomas@github.com',
    company: 'GitHub, Inc.',
    licenseCount: 0,
    productUsage: 0,
    renewalDate: '2026-08-30T12:00:00Z',
    status: 'inactive'
  }
];

export const initialLicenses: License[] = [
  {
    licenseId: 'lic-1',
    companyId: 'company-1',
    productId: 'prod-1',
    productName: 'SupaAuth Gateway',
    customerId: 'cust-1',
    customerName: 'Mitchell Baker',
    key: 'LIC-8F4C-3B9A-E8D1-90F2',
    expiryDate: '2027-01-20T10:00:00Z',
    status: 'ACTIVE',
    createdAt: '2026-01-20T10:00:00Z',
    lastActivatedAt: '2026-06-18T08:12:00Z',
    usageLimit: 100,
    usageCount: 43
  },
  {
    licenseId: 'lic-2',
    companyId: 'company-1',
    productId: 'prod-2',
    productName: 'Hospital ERP Security Broker',
    customerId: 'cust-2',
    customerName: 'Shantanu Narayen',
    key: 'LIC-4D9A-2C8F-7B1A-E0D5',
    expiryDate: '2026-12-15T08:00:00Z',
    status: 'ACTIVE',
    createdAt: '2026-02-15T08:00:00Z',
    lastActivatedAt: '2026-06-18T09:20:00Z',
    usageLimit: 50,
    usageCount: 48
  },
  {
    licenseId: 'lic-3',
    companyId: 'company-1',
    productId: 'prod-1',
    productName: 'SupaAuth Gateway',
    customerId: 'cust-3',
    customerName: 'Thomas Dohmke',
    key: 'LIC-9A1B-8C2D-7E3F-6A4B',
    expiryDate: '2026-08-30T12:00:00Z',
    status: 'SUSPENDED',
    createdAt: '2026-02-28T12:00:00Z',
    lastActivatedAt: '2026-05-10T14:30:00Z',
    usageLimit: 10,
    usageCount: 2
  }
];

export const initialActivityLogs: ActivityLog[] = [
  {
    logId: 'log-1',
    companyId: 'company-1',
    userId: 'user-1',
    action: 'Generated License LIC-8F4C-3B9A-E8D1-90F2 for Mitchell Baker',
    timestamp: '2026-06-18T09:30:00Z',
    employeeEmail: 'aayush@aegisflow.com'
  },
  {
    logId: 'log-2',
    companyId: 'company-1',
    userId: 'user-1',
    action: 'Provisioned Product Patient Telemetry API Engine',
    timestamp: '2026-06-17T15:20:00Z',
    employeeEmail: 'aayush@aegisflow.com'
  },
  {
    logId: 'log-3',
    companyId: 'company-1',
    userId: 'user-2',
    action: 'Suspended License LIC-9A1B-8C2D-7E3F-6A4B for Thomas Dohmke',
    timestamp: '2026-06-16T11:15:00Z',
    employeeEmail: 'admin@aegisflow.com'
  }
];
