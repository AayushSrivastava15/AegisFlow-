import { create } from 'zustand';
import { 
  Product, 
  Customer, 
  License, 
  ActivityLog, 
  Heartbeat, 
  Employee, 
  Billing, 
  Company, 
  FirebaseConfig 
} from '../types';
import { getFirebaseInstance } from '../lib/firebase';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  getDoc,
  orderBy,
  getDocs
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  updateProfile 
} from 'firebase/auth';

interface LicenseState {
  products: Product[];
  customers: Customer[];
  licenses: License[];
  logs: ActivityLog[];
  heartbeats: Heartbeat[];
  employees: Employee[];
  company: Company | null;
  user: any | null; // Contains uid, email, displayName, companyId, role, companyName
  authLoading: boolean;
  
  // Actions
  addProduct: (productData: Omit<Product, 'productId' | 'companyId' | 'apiKey' | 'sdkSecret' | 'status' | 'version' | 'activeUsers' | 'healthScore' | 'lastHeartbeat' | 'createdAt'>) => Promise<void>;
  addCustomer: (customerData: Omit<Customer, 'customerId' | 'companyId'>) => Promise<void>;
  generateLicense: (licenseData: Omit<License, 'licenseId' | 'companyId' | 'key' | 'createdAt' | 'usageCount'>) => Promise<void>;
  renewLicense: (id: string, newExpiryDate: string) => Promise<void>;
  suspendLicense: (id: string) => Promise<void>;
  activateLicense: (id: string) => Promise<void>;
  revokeLicense: (id: string) => Promise<void>;
  deleteLicense: (id: string) => Promise<void>;
  
  // Heartbeat Telemetry Simulator
  simulateHeartbeat: (productId: string, version: string, activeUsers: number, environment: 'production' | 'staging' | 'development', serverStatus: 'UP' | 'DOWN') => Promise<void>;
  
  // Team and Billing Actions
  inviteEmployee: (email: string, role: Employee['role']) => Promise<void>;
  deactivateEmployee: (employeeId: string, status: Employee['status']) => Promise<void>;
  updateBillingPlan: (plan: Company['plan']) => Promise<void>;
  
  // Real-time subscriptions scoped by companyId
  subscribeToProducts: () => (() => void) | undefined;
  subscribeToCustomers: () => (() => void) | undefined;
  subscribeToLicenses: () => (() => void) | undefined;
  subscribeToLogs: () => (() => void) | undefined;
  subscribeToHeartbeats: () => (() => void) | undefined;
  subscribeToEmployees: () => (() => void) | undefined;
  subscribeToCompany: () => (() => void) | undefined;

  setUser: (user: any | null) => void;
  setAuthLoading: (loading: boolean) => void;
  signUpWithEmail: (email: string, password: string, name: string, companyName: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  cleanOldLogs: () => Promise<void>;
  firebaseConfig: FirebaseConfig;
}

// Custom generator for ids and keys to avoid uuid compatibility issues in Turbopack
const generateRandomHex = (length: number) => {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

const generateRandomAlphanumeric = (prefix: string, length: number) => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = prefix + '_';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

export const useLicenseStore = create<LicenseState>((set, get) => ({
  products: [],
  customers: [],
  licenses: [],
  logs: [],
  heartbeats: [],
  employees: [],
  company: null,
  user: null,
  authLoading: true,
  firebaseConfig: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  },

  // Scoped Audit logger
  logActivity: async (actionText: string) => {
    const state = get();
    const { db } = getFirebaseInstance(state.firebaseConfig);
    const companyId = state.user?.companyId;
    const userId = state.user?.uid;
    const email = state.user?.email;

    if (db && companyId && userId) {
      const logId = generateRandomAlphanumeric('log', 10);
      const newLog: ActivityLog = {
        logId,
        companyId,
        userId,
        action: actionText,
        timestamp: new Date().toISOString(),
        employeeEmail: email || 'System Gateway'
      };
      try {
        await setDoc(doc(db, 'activityLogs', logId), newLog);
      } catch (err) {
        console.error('Error writing activity log:', err);
      }
    }
  },

  addProduct: async (productData) => {
    const state = get();
    const { db } = getFirebaseInstance(state.firebaseConfig);
    const companyId = state.user?.companyId;
    if (!db || !companyId) throw new Error('Unauthenticated user context or offline database.');

    const productId = generateRandomAlphanumeric('prod', 8);
    const apiKey = `af_live_${generateRandomHex(32)}`;
    const sdkSecret = `sdk_secret_${generateRandomHex(24)}`;
    
    const newProduct: Product = {
      ...productData,
      productId,
      companyId,
      apiKey,
      sdkSecret,
      status: 'PENDING_CONNECTION',
      version: '1.0.0',
      activeUsers: 0,
      healthScore: 100,
      lastHeartbeat: 'Never',
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'products', productId), newProduct);
    await (get() as any).logActivity(`Created product "${newProduct.name}" (Type: ${newProduct.type})`);
  },

  addCustomer: async (customerData) => {
    const state = get();
    const { db } = getFirebaseInstance(state.firebaseConfig);
    const companyId = state.user?.companyId;
    if (!db || !companyId) throw new Error('Unauthenticated user context.');

    const customerId = generateRandomAlphanumeric('cust', 8);
    const newCustomer: Customer = {
      ...customerData,
      customerId,
      companyId,
      licenseCount: 0,
      productUsage: 0,
      renewalDate: 'None',
      status: 'active'
    };

    await setDoc(doc(db, 'customers', customerId), newCustomer);
    await (get() as any).logActivity(`Added customer "${newCustomer.name}" from ${newCustomer.company}`);
  },

  generateLicense: async (licenseData) => {
    const state = get();
    const { db } = getFirebaseInstance(state.firebaseConfig);
    const companyId = state.user?.companyId;
    if (!db || !companyId) throw new Error('Unauthenticated user context.');

    const licenseId = generateRandomAlphanumeric('lic', 8);
    const key = `LIC-${generateRandomHex(4).toUpperCase()}-${generateRandomHex(4).toUpperCase()}-${generateRandomHex(4).toUpperCase()}-${generateRandomHex(4).toUpperCase()}`;

    const newLicense: License = {
      ...licenseData,
      licenseId,
      companyId,
      key,
      createdAt: new Date().toISOString(),
      usageCount: 0
    };

    await setDoc(doc(db, 'licenses', licenseId), newLicense);
    
    // Update customer stats
    const customerRef = doc(db, 'customers', licenseData.customerId);
    const custSnap = await getDoc(customerRef);
    if (custSnap.exists()) {
      const custData = custSnap.data();
      await updateDoc(customerRef, {
        licenseCount: (custData.licenseCount || 0) + 1,
        renewalDate: licenseData.expiryDate
      });
    }

    await (get() as any).logActivity(`Issued license key ${key.substring(0, 12)}... for ${licenseData.productName} to ${licenseData.customerName}`);
  },

  renewLicense: async (id, newExpiryDate) => {
    const state = get();
    const { db } = getFirebaseInstance(state.firebaseConfig);
    const license = state.licenses.find((l) => l.licenseId === id);
    if (!db || !license) return;

    await updateDoc(doc(db, 'licenses', id), {
      status: 'ACTIVE',
      expiryDate: newExpiryDate
    });

    // Update customer renewalDate
    const customerRef = doc(db, 'customers', license.customerId);
    const custSnap = await getDoc(customerRef);
    if (custSnap.exists()) {
      await updateDoc(customerRef, {
        renewalDate: newExpiryDate
      });
    }

    await (get() as any).logActivity(`Renewed license key ${license.key.substring(0, 12)}... until ${new Date(newExpiryDate).toLocaleDateString()}`);
  },

  suspendLicense: async (id) => {
    const state = get();
    const { db } = getFirebaseInstance(state.firebaseConfig);
    const license = state.licenses.find((l) => l.licenseId === id);
    if (!db || !license) return;

    await updateDoc(doc(db, 'licenses', id), { status: 'SUSPENDED' });
    await (get() as any).logActivity(`Suspended license key ${license.key.substring(0, 12)}...`);
  },

  activateLicense: async (id) => {
    const state = get();
    const { db } = getFirebaseInstance(state.firebaseConfig);
    const license = state.licenses.find((l) => l.licenseId === id);
    if (!db || !license) return;

    await updateDoc(doc(db, 'licenses', id), {
      status: 'ACTIVE',
      lastActivatedAt: new Date().toISOString(),
      usageCount: license.usageCount + 1
    });

    await (get() as any).logActivity(`Validated and activated license key ${license.key.substring(0, 12)}...`);
  },

  revokeLicense: async (id) => {
    const state = get();
    const { db } = getFirebaseInstance(state.firebaseConfig);
    const license = state.licenses.find((l) => l.licenseId === id);
    if (!db || !license) return;

    await updateDoc(doc(db, 'licenses', id), { status: 'REVOKED' });
    await (get() as any).logActivity(`Revoked license key ${license.key.substring(0, 12)}...`);
  },

  deleteLicense: async (id) => {
    const state = get();
    const { db } = getFirebaseInstance(state.firebaseConfig);
    const license = state.licenses.find((l) => l.licenseId === id);
    if (!db || !license) return;

    await deleteDoc(doc(db, 'licenses', id));

    // Update customer stats
    const customerRef = doc(db, 'customers', license.customerId);
    const custSnap = await getDoc(customerRef);
    if (custSnap.exists()) {
      const custData = custSnap.data();
      await updateDoc(customerRef, {
        licenseCount: Math.max(0, (custData.licenseCount || 0) - 1)
      });
    }

    await (get() as any).logActivity(`Deleted license key entry ${license.key.substring(0, 12)}...`);
  },

  // Heartbeat Telemetry Simulator
  simulateHeartbeat: async (productId, version, activeUsers, environment, serverStatus) => {
    const state = get();
    const { db } = getFirebaseInstance(state.firebaseConfig);
    const companyId = state.user?.companyId;
    const targetProduct = state.products.find((p) => p.productId === productId);
    if (!db || !companyId || !targetProduct) return;

    const heartbeatId = generateRandomAlphanumeric('hb', 10);
    const timestamp = new Date().toISOString();
    
    const newHeartbeat: Heartbeat = {
      heartbeatId,
      companyId,
      productId,
      version,
      activeUsers,
      environment,
      serverStatus,
      timestamp
    };

    // Recalculate health and status
    let status: Product['status'] = 'LIVE';
    let healthScore = 100;

    if (serverStatus === 'DOWN') {
      status = 'OFFLINE';
      healthScore = 0;
    } else {
      // Base health score calculations on active users vs target limits
      healthScore = activeUsers > 5000 ? 92 : Math.min(100, 95 + Math.floor(Math.random() * 6));
    }

    // Manual status override check (if target product status was manually SUSPENDED or REVOKED)
    if (targetProduct.status === 'SUSPENDED') {
      status = 'SUSPENDED';
      healthScore = 40;
    } else if (targetProduct.status === 'REVOKED') {
      status = 'REVOKED';
      healthScore = 10;
    }

    // Write heartbeat and update product details
    await setDoc(doc(db, 'heartbeats', heartbeatId), newHeartbeat);
    await updateDoc(doc(db, 'products', productId), {
      status,
      version,
      activeUsers,
      healthScore,
      lastHeartbeat: timestamp
    });

    await (get() as any).logActivity(`SDK Heartbeat received from "${targetProduct.name}" (Version: ${version}, Environment: ${environment}, Status: ${serverStatus})`);
  },

  inviteEmployee: async (email, role) => {
    const state = get();
    const { db } = getFirebaseInstance(state.firebaseConfig);
    const companyId = state.user?.companyId;
    if (!db || !companyId) throw new Error('Unauthenticated user context.');

    const employeeId = generateRandomAlphanumeric('emp', 8);
    const newEmployee: Employee = {
      employeeId,
      companyId,
      email,
      role,
      status: 'pending'
    };

    await setDoc(doc(db, 'employees', employeeId), newEmployee);
    await (get() as any).logActivity(`Invited employee "${email}" with role "${role}"`);
  },

  deactivateEmployee: async (employeeId, status) => {
    const state = get();
    const { db } = getFirebaseInstance(state.firebaseConfig);
    const emp = state.employees.find((e) => e.employeeId === employeeId);
    if (!db || !emp) return;

    await updateDoc(doc(db, 'employees', employeeId), { status });
    await (get() as any).logActivity(`Changed employee status for ${emp.email} to ${status}`);
  },

  updateBillingPlan: async (plan) => {
    const state = get();
    const { db } = getFirebaseInstance(state.firebaseConfig);
    const companyId = state.user?.companyId;
    if (!db || !companyId) return;

    await updateDoc(doc(db, 'companies', companyId), { plan });

    // Create a billing transaction invoice log
    const billingId = generateRandomAlphanumeric('bill', 8);
    let amount = 0;
    if (plan === 'starter') amount = 49;
    if (plan === 'growth') amount = 199;
    if (plan === 'enterprise') amount = 999;

    const newBill: Billing = {
      billingId,
      companyId,
      plan,
      amount,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'billing', billingId), newBill);

    await (get() as any).logActivity(`Upgraded workspace subscription tier to "${plan.toUpperCase()}" ($${amount}/mo)`);
  },

  // Subscriptions scoped by companyId
  subscribeToProducts: () => {
    const state = get();
    const { db } = getFirebaseInstance(state.firebaseConfig);
    const companyId = state.user?.companyId;
    if (!db || !companyId) return undefined;

    const q = query(collection(db, 'products'), where('companyId', '==', companyId));
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => doc.data() as Product);
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      set({ products: list });
    });
  },

  subscribeToCustomers: () => {
    const state = get();
    const { db } = getFirebaseInstance(state.firebaseConfig);
    const companyId = state.user?.companyId;
    if (!db || !companyId) return undefined;

    const q = query(collection(db, 'customers'), where('companyId', '==', companyId));
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => doc.data() as Customer);
      set({ customers: list });
    });
  },

  subscribeToLicenses: () => {
    const state = get();
    const { db } = getFirebaseInstance(state.firebaseConfig);
    const companyId = state.user?.companyId;
    if (!db || !companyId) return undefined;

    const q = query(collection(db, 'licenses'), where('companyId', '==', companyId));
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => doc.data() as License);
      set({ licenses: list });
    });
  },

  subscribeToLogs: () => {
    const state = get();
    const { db } = getFirebaseInstance(state.firebaseConfig);
    const companyId = state.user?.companyId;
    if (!db || !companyId) return undefined;

    const q = query(collection(db, 'activityLogs'), where('companyId', '==', companyId));
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => doc.data() as ActivityLog);
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      set({ logs: list });
    });
  },

  subscribeToHeartbeats: () => {
    const state = get();
    const { db } = getFirebaseInstance(state.firebaseConfig);
    const companyId = state.user?.companyId;
    if (!db || !companyId) return undefined;

    const q = query(collection(db, 'heartbeats'), where('companyId', '==', companyId));
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => doc.data() as Heartbeat);
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      set({ heartbeats: list });
    });
  },

  subscribeToEmployees: () => {
    const state = get();
    const { db } = getFirebaseInstance(state.firebaseConfig);
    const companyId = state.user?.companyId;
    if (!db || !companyId) return undefined;

    const q = query(collection(db, 'employees'), where('companyId', '==', companyId));
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => doc.data() as Employee);
      set({ employees: list });
    });
  },

  subscribeToCompany: () => {
    const state = get();
    const { db } = getFirebaseInstance(state.firebaseConfig);
    const companyId = state.user?.companyId;
    if (!db || !companyId) return undefined;

    return onSnapshot(doc(db, 'companies', companyId), (docSnap) => {
      if (docSnap.exists()) {
        set({ company: docSnap.data() as Company });
      }
    });
  },

  setUser: (user) => set({ user }),
  setAuthLoading: (authLoading) => set({ authLoading }),

  signUpWithEmail: async (email, password, name, companyName) => {
    const state = get();
    const { auth, db } = getFirebaseInstance(state.firebaseConfig);
    if (!auth || !db) throw new Error('Firebase connection offline.');

    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = credential.user;

    await updateProfile(firebaseUser, { displayName: name });

    const companyId = generateRandomAlphanumeric('comp', 8);

    // Write Company Document
    const companyDoc: Company = {
      companyId,
      companyName,
      ownerUid: firebaseUser.uid,
      plan: 'free',
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'companies', companyId), companyDoc);

    // Write Employee Document
    const employeeId = `emp_${firebaseUser.uid}`;
    const employeeDoc: Employee = {
      employeeId,
      companyId,
      email,
      role: 'owner',
      status: 'active',
      name
    };
    await setDoc(doc(db, 'employees', employeeId), employeeDoc);

    // Write User Profile
    const userProfile = {
      uid: firebaseUser.uid,
      email,
      displayName: name,
      company: companyName,
      companyId,
      role: 'owner' as const,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);

    set({
      user: userProfile,
      company: companyDoc
    });
  },

  signInWithEmail: async (email, password) => {
    const state = get();
    const { auth, db } = getFirebaseInstance(state.firebaseConfig);
    if (!auth) throw new Error('Firebase connection offline.');

    const credential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = credential.user;

    let companyName = 'Personal Workspace';
    let companyId = '';
    let role: Employee['role'] = 'viewer';

    if (db) {
      const docRef = doc(db, 'users', firebaseUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        companyName = data.company || 'Personal Workspace';
        companyId = data.companyId || '';
        role = data.role || 'viewer';

        // Self-heal: If companyId is missing in the user profile but they logged in
        if (!companyId) {
          companyId = generateRandomAlphanumeric('comp', 8);
          role = 'owner';
          
          await setDoc(doc(db, 'companies', companyId), {
            companyId,
            companyName,
            ownerUid: firebaseUser.uid,
            plan: 'free',
            createdAt: new Date().toISOString()
          });

          const employeeId = `emp_${firebaseUser.uid}`;
          await setDoc(doc(db, 'employees', employeeId), {
            employeeId,
            companyId,
            email: firebaseUser.email || '',
            role: 'owner',
            status: 'active',
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Administrator'
          });

          await updateDoc(docRef, { companyId, role });
        }
      } else {
        // Self-heal: If users doc doesn't exist at all for this authenticated user
        companyId = generateRandomAlphanumeric('comp', 8);
        const name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Administrator';
        role = 'owner';

        await setDoc(doc(db, 'companies', companyId), {
          companyId,
          companyName,
          ownerUid: firebaseUser.uid,
          plan: 'free',
          createdAt: new Date().toISOString()
        });

        const employeeId = `emp_${firebaseUser.uid}`;
        await setDoc(doc(db, 'employees', employeeId), {
          employeeId,
          companyId,
          email: firebaseUser.email || '',
          role: 'owner',
          status: 'active',
          name
        });

        const userProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: name,
          company: companyName,
          companyId,
          role: 'owner' as const,
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, userProfile);
      }
    }

    set({
      user: {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Administrator',
        company: companyName,
        companyId,
        role
      }
    });
  },

  signInWithGoogle: async () => {
    const state = get();
    const { auth, db } = getFirebaseInstance(state.firebaseConfig);
    if (!auth || !db) throw new Error('Firebase connection offline.');

    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    const firebaseUser = credential.user;

    const userDocRef = doc(db, 'users', firebaseUser.uid);
    let companyName = 'Personal Workspace';
    let companyId = '';
    let role: Employee['role'] = 'owner';

    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
      companyId = generateRandomAlphanumeric('comp', 8);
      
      const companyDoc: Company = {
        companyId,
        companyName,
        ownerUid: firebaseUser.uid,
        plan: 'free',
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'companies', companyId), companyDoc);

      const employeeId = `emp_${firebaseUser.uid}`;
      const employeeDoc: Employee = {
        employeeId,
        companyId,
        email: firebaseUser.email || '',
        role: 'owner',
        status: 'active',
        name: firebaseUser.displayName || 'Administrator'
      };
      await setDoc(doc(db, 'employees', employeeId), employeeDoc);

      const userProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'Administrator',
        company: companyName,
        companyId,
        role: 'owner' as const,
        createdAt: new Date().toISOString()
      };
      await setDoc(userDocRef, userProfile);

      set({
        user: userProfile,
        company: companyDoc
      });
    } else {
      const data = userDocSnap.data();
      companyId = data.companyId || '';
      companyName = data.company || 'Personal Workspace';
      role = data.role || 'viewer';
      
      // Self-heal: Google user exists in Firestore but has no company workspace
      if (!companyId) {
        companyId = generateRandomAlphanumeric('comp', 8);
        role = 'owner';
        
        await setDoc(doc(db, 'companies', companyId), {
          companyId,
          companyName,
          ownerUid: firebaseUser.uid,
          plan: 'free',
          createdAt: new Date().toISOString()
        });

        const employeeId = `emp_${firebaseUser.uid}`;
        await setDoc(doc(db, 'employees', employeeId), {
          employeeId,
          companyId,
          email: firebaseUser.email || '',
          role: 'owner',
          status: 'active',
          name: firebaseUser.displayName || 'Administrator'
        });

        await updateDoc(userDocRef, { companyId, role });
      }

      set({
        user: {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'Administrator',
          company: companyName,
          companyId,
          role
        }
      });
    }
  },

  signOutUser: async () => {
    const state = get();
    const { auth } = getFirebaseInstance(state.firebaseConfig);
    if (auth) {
      await signOut(auth);
    }
    set({ user: null, company: null });
  },

  cleanOldLogs: async () => {
    const state = get();
    const { db } = getFirebaseInstance(state.firebaseConfig);
    const companyId = state.user?.companyId;

    if (!db || !companyId) return;

    try {
      const now = new Date();
      const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(); // 24 hours ago

      // 1. Clean Activity Logs
      const logsQuery = query(
        collection(db, 'activityLogs'),
        where('companyId', '==', companyId),
        where('timestamp', '<', cutoff)
      );
      const logsSnap = await getDocs(logsQuery);
      const deletePromises = logsSnap.docs.map(d => deleteDoc(d.ref));

      // 2. Clean Heartbeats
      const hbQuery = query(
        collection(db, 'heartbeats'),
        where('companyId', '==', companyId),
        where('timestamp', '<', cutoff)
      );
      const hbSnap = await getDocs(hbQuery);
      const hbPromises = hbSnap.docs.map(d => deleteDoc(d.ref));

      await Promise.all([...deletePromises, ...hbPromises]);
      
      if (deletePromises.length > 0 || hbPromises.length > 0) {
        console.log(`[AegisFlow] Cleaned up ${deletePromises.length} old activity logs and ${hbPromises.length} heartbeats older than 24 hours.`);
      }
    } catch (err) {
      console.error('[AegisFlow] Error during background logs cleanup:', err);
    }
  },
}));
