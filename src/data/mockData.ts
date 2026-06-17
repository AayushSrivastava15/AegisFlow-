import { Product, Client, License, ActivityLog } from '../types';

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'SupaAuth Gateway',
    description: 'Premium identity provider and authentication proxy for microservices. Supports OAuth2, SAML, and custom claims.',
    category: 'Security',
    clientCount: 3,
    licenseCount: 3,
    createdAt: '2026-01-15T08:00:00Z',
    price: '$99/mo',
    icon: 'ShieldAlert'
  },
  {
    id: 'prod-2',
    name: 'Vercel Edge Analytics',
    description: 'Real-time performance and user behavior tracking computed directly at edge nodes with zero cold-start overhead.',
    category: 'Analytics',
    clientCount: 4,
    licenseCount: 4,
    createdAt: '2026-02-10T09:30:00Z',
    price: '$149/mo',
    icon: 'Activity'
  },
  {
    id: 'prod-3',
    name: 'Linear Enterprise Sync',
    description: 'Bidirectional state synchronization between Jira, GitHub Issues, and internal developer platforms.',
    category: 'Productivity',
    clientCount: 2,
    licenseCount: 2,
    createdAt: '2026-03-01T14:15:00Z',
    price: '$299/mo',
    icon: 'RefreshCw'
  },
  {
    id: 'prod-4',
    name: 'Stripe Billing Connect',
    description: 'Custom revenue routing, tax computation, and compliance engine for global SaaS models.',
    category: 'Finance',
    clientCount: 1,
    licenseCount: 1,
    createdAt: '2026-04-18T11:00:00Z',
    price: '$499/mo',
    icon: 'CreditCard'
  }
];

export const initialClients: Client[] = [
  {
    id: 'cli-1',
    name: 'Stripe Inc.',
    email: 'licensing@stripe.com',
    company: 'Stripe, Inc.',
    logo: 'ST',
    activeLicenses: 2,
    totalLicenses: 2,
    joinedAt: '2026-01-20T10:00:00Z'
  },
  {
    id: 'cli-2',
    name: 'Airbnb Ltd',
    email: 'admin@airbnb.com',
    company: 'Airbnb, Inc.',
    logo: 'AB',
    activeLicenses: 2,
    totalLicenses: 3, // 1 suspended
    joinedAt: '2026-02-15T12:00:00Z'
  },
  {
    id: 'cli-3',
    name: 'Vercel Platform',
    email: 'billing@vercel.com',
    company: 'Vercel Inc.',
    logo: 'VE',
    activeLicenses: 3,
    totalLicenses: 3,
    joinedAt: '2026-02-28T09:00:00Z'
  },
  {
    id: 'cli-4',
    name: 'OpenAI Dev',
    email: 'api@openai.com',
    company: 'OpenAI L.L.C.',
    logo: 'OA',
    activeLicenses: 2,
    totalLicenses: 2,
    joinedAt: '2026-03-12T16:00:00Z'
  },
  {
    id: 'cli-5',
    name: 'Retool Admin',
    email: 'ops@retool.com',
    company: 'Retool, Inc.',
    logo: 'RT',
    activeLicenses: 1,
    totalLicenses: 1,
    joinedAt: '2026-04-05T15:45:00Z'
  }
];

export const initialLicenses: License[] = [
  {
    id: 'lic-1',
    key: 'LIC-8F4C-3B9A-E8D1-90F2',
    clientId: 'cli-1',
    clientName: 'Stripe Inc.',
    productId: 'prod-1',
    productName: 'SupaAuth Gateway',
    status: 'active',
    expiresAt: '2027-01-20T10:00:00Z',
    createdAt: '2026-01-20T10:00:00Z',
    lastActivatedAt: '2026-01-21T11:05:00Z',
    usageLimit: 100,
    usageCount: 42
  },
  {
    id: 'lic-2',
    key: 'LIC-1A2B-3C4D-5E6F-7G8H',
    clientId: 'cli-1',
    clientName: 'Stripe Inc.',
    productId: 'prod-2',
    productName: 'Vercel Edge Analytics',
    status: 'active',
    expiresAt: '2027-01-22T08:00:00Z',
    createdAt: '2026-01-22T08:00:00Z',
    lastActivatedAt: '2026-01-23T12:00:00Z',
    usageLimit: 50,
    usageCount: 15
  },
  {
    id: 'lic-3',
    key: 'LIC-9A8B-7C6D-5E4F-3G2H',
    clientId: 'cli-2',
    clientName: 'Airbnb Ltd',
    productId: 'prod-2',
    productName: 'Vercel Edge Analytics',
    status: 'suspended',
    expiresAt: '2026-12-15T12:00:00Z',
    createdAt: '2026-02-15T12:00:00Z',
    lastActivatedAt: '2026-02-16T14:30:00Z',
    usageLimit: 50,
    usageCount: 48
  },
  {
    id: 'lic-4',
    key: 'LIC-5D2E-9R8T-2Y7U-4I1O',
    clientId: 'cli-2',
    clientName: 'Airbnb Ltd',
    productId: 'prod-1',
    productName: 'SupaAuth Gateway',
    status: 'active',
    expiresAt: '2027-02-15T12:00:00Z',
    createdAt: '2026-02-15T12:00:00Z',
    lastActivatedAt: '2026-02-15T13:10:00Z',
    usageLimit: 100,
    usageCount: 88
  },
  {
    id: 'lic-5',
    key: 'LIC-2P3O-4I5U-6Y7T-8R9E',
    clientId: 'cli-2',
    clientName: 'Airbnb Ltd',
    productId: 'prod-3',
    productName: 'Linear Enterprise Sync',
    status: 'expiring', // Expiring in less than 30 days relative to 2026-06-17
    expiresAt: '2026-07-05T12:00:00Z',
    createdAt: '2026-02-15T12:00:00Z',
    lastActivatedAt: '2026-02-16T18:00:00Z',
    usageLimit: 10,
    usageCount: 9
  },
  {
    id: 'lic-6',
    key: 'LIC-7H6G-5F4D-3S2A-1Q0W',
    clientId: 'cli-3',
    clientName: 'Vercel Platform',
    productId: 'prod-2',
    productName: 'Vercel Edge Analytics',
    status: 'active',
    expiresAt: '2027-02-28T09:00:00Z',
    createdAt: '2026-02-28T09:00:00Z',
    lastActivatedAt: '2026-03-01T10:00:00Z',
    usageLimit: 200,
    usageCount: 154
  },
  {
    id: 'lic-7',
    key: 'LIC-QWER-TYUI-OPAS-DFGH',
    clientId: 'cli-3',
    clientName: 'Vercel Platform',
    productId: 'prod-3',
    productName: 'Linear Enterprise Sync',
    status: 'active',
    expiresAt: '2027-03-05T15:00:00Z',
    createdAt: '2026-03-05T15:00:00Z',
    lastActivatedAt: '2026-03-06T11:45:00Z',
    usageLimit: 20,
    usageCount: 12
  },
  {
    id: 'lic-8',
    key: 'LIC-ZXCV-BNMK-JHGF-DSAW',
    clientId: 'cli-3',
    clientName: 'Vercel Platform',
    productId: 'prod-4',
    productName: 'Stripe Billing Connect',
    status: 'active',
    expiresAt: '2027-03-10T10:00:00Z',
    createdAt: '2026-03-10T10:00:00Z',
    lastActivatedAt: '2026-03-10T14:20:00Z',
    usageLimit: 5,
    usageCount: 3
  },
  {
    id: 'lic-9',
    key: 'LIC-PLOK-MIJN-UHYB-GVTC',
    clientId: 'cli-4',
    clientName: 'OpenAI Dev',
    productId: 'prod-1',
    productName: 'SupaAuth Gateway',
    status: 'active',
    expiresAt: '2027-03-12T16:00:00Z',
    createdAt: '2026-03-12T16:00:00Z',
    lastActivatedAt: '2026-03-12T19:50:00Z',
    usageLimit: 500,
    usageCount: 341
  },
  {
    id: 'lic-10',
    key: 'LIC-EDCR-FVGB-YHNJ-UJM1',
    clientId: 'cli-4',
    clientName: 'OpenAI Dev',
    productId: 'prod-2',
    productName: 'Vercel Edge Analytics',
    status: 'expiring', // Expiring in July 2026
    expiresAt: '2026-07-10T16:00:00Z',
    createdAt: '2026-03-12T16:00:00Z',
    lastActivatedAt: '2026-03-13T09:12:00Z',
    usageLimit: 100,
    usageCount: 95
  }
];

export const initialLogs: ActivityLog[] = [
  {
    id: 'log-1',
    licenseId: 'lic-1',
    type: 'created',
    description: 'License created for SupaAuth Gateway and assigned to Stripe Inc.',
    timestamp: '2026-01-20T10:00:00Z',
    productName: 'SupaAuth Gateway',
    clientName: 'Stripe Inc.'
  },
  {
    id: 'log-2',
    licenseId: 'lic-1',
    type: 'activated',
    description: 'License activated on api.stripe.com',
    timestamp: '2026-01-21T11:05:00Z',
    productName: 'SupaAuth Gateway',
    clientName: 'Stripe Inc.'
  },
  {
    id: 'log-3',
    licenseId: 'lic-2',
    type: 'created',
    description: 'License created for Vercel Edge Analytics and assigned to Stripe Inc.',
    timestamp: '2026-01-22T08:00:00Z',
    productName: 'Vercel Edge Analytics',
    clientName: 'Stripe Inc.'
  },
  {
    id: 'log-4',
    licenseId: 'lic-3',
    type: 'created',
    description: 'License created for Vercel Edge Analytics and assigned to Airbnb Ltd.',
    timestamp: '2026-02-15T12:00:00Z',
    productName: 'Vercel Edge Analytics',
    clientName: 'Airbnb Ltd'
  },
  {
    id: 'log-5',
    licenseId: 'lic-4',
    type: 'created',
    description: 'License created for SupaAuth Gateway and assigned to Airbnb Ltd.',
    timestamp: '2026-02-15T12:00:00Z',
    productName: 'SupaAuth Gateway',
    clientName: 'Airbnb Ltd'
  },
  {
    id: 'log-6',
    licenseId: 'lic-3',
    type: 'suspended',
    description: 'License for Vercel Edge Analytics suspended due to payment issue.',
    timestamp: '2026-02-20T15:00:00Z',
    productName: 'Vercel Edge Analytics',
    clientName: 'Airbnb Ltd'
  },
  {
    id: 'log-7',
    licenseId: 'lic-6',
    type: 'created',
    description: 'License created for Vercel Edge Analytics and assigned to Vercel Platform.',
    timestamp: '2026-02-28T09:00:00Z',
    productName: 'Vercel Edge Analytics',
    clientName: 'Vercel Platform'
  },
  {
    id: 'log-8',
    licenseId: 'lic-7',
    type: 'created',
    description: 'License created for Linear Enterprise Sync and assigned to Vercel Platform.',
    timestamp: '2026-03-05T15:00:00Z',
    productName: 'Linear Enterprise Sync',
    clientName: 'Vercel Platform'
  },
  {
    id: 'log-9',
    licenseId: 'lic-8',
    type: 'created',
    description: 'License created for Stripe Billing Connect and assigned to Vercel Platform.',
    timestamp: '2026-03-10T10:00:00Z',
    productName: 'Stripe Billing Connect',
    clientName: 'Vercel Platform'
  },
  {
    id: 'log-10',
    licenseId: 'lic-9',
    type: 'created',
    description: 'License created for SupaAuth Gateway and assigned to OpenAI Dev.',
    timestamp: '2026-03-12T16:00:00Z',
    productName: 'SupaAuth Gateway',
    clientName: 'OpenAI Dev'
  },
  {
    id: 'log-11',
    licenseId: 'lic-9',
    type: 'activated',
    description: 'License activated on chat.openai.com',
    timestamp: '2026-03-12T19:50:00Z',
    productName: 'SupaAuth Gateway',
    clientName: 'OpenAI Dev'
  },
  {
    id: 'log-12',
    licenseId: 'lic-5',
    type: 'renewed',
    description: 'License for Linear Enterprise Sync renewed until 2026-07-05.',
    timestamp: '2026-05-15T09:00:00Z',
    productName: 'Linear Enterprise Sync',
    clientName: 'Airbnb Ltd'
  }
];
