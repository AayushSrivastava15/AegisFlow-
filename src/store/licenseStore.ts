import { create } from 'zustand';
import { Product, Client, License, ActivityLog, FirebaseConfig } from '../types';
import { initialProducts, initialClients, initialLicenses, initialLogs } from '../data/mockData';
import { getFirebaseInstance } from '../lib/firebase';
import { doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

interface LicenseState {
  products: Product[];
  clients: Client[];
  licenses: License[];
  logs: ActivityLog[];
  firebaseConfig: FirebaseConfig;
  
  // Actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'clientCount' | 'licenseCount'>) => void;
  addClient: (client: Omit<Client, 'id' | 'joinedAt' | 'activeLicenses' | 'totalLicenses'>) => void;
  generateLicense: (license: Omit<License, 'id' | 'key' | 'createdAt' | 'usageCount'>) => Promise<void>;
  suspendLicense: (id: string) => Promise<void>;
  activateLicense: (id: string) => Promise<void>;
  renewLicense: (id: string, newExpiryDate: string) => Promise<void>;
  deleteLicense: (id: string) => Promise<void>;
  updateFirebaseConfig: (config: FirebaseConfig) => void;
}

export const useLicenseStore = create<LicenseState>((set, get) => ({
  products: initialProducts,
  clients: initialClients,
  licenses: initialLicenses,
  logs: initialLogs,
  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  },

  addProduct: (productData) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      clientCount: 0,
      licenseCount: 0,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      products: [newProduct, ...state.products],
      logs: [
        {
          id: `log-${Date.now()}`,
          type: 'created',
          description: `New product "${newProduct.name}" was added to the platform.`,
          timestamp: new Date().toISOString(),
          productName: newProduct.name,
        },
        ...state.logs,
      ],
    }));
  },

  addClient: (clientData) => {
    const newClient: Client = {
      ...clientData,
      id: `cli-${Date.now()}`,
      activeLicenses: 0,
      totalLicenses: 0,
      joinedAt: new Date().toISOString(),
    };
    set((state) => ({
      clients: [newClient, ...state.clients],
      logs: [
        {
          id: `log-${Date.now()}`,
          type: 'created',
          description: `New client "${newClient.name}" (${newClient.company}) registered.`,
          timestamp: new Date().toISOString(),
          clientName: newClient.name,
        },
        ...state.logs,
      ],
    }));
  },

  generateLicense: async (licenseData) => {
    // Generate a random mock license key: LIC-XXXX-XXXX-XXXX-XXXX
    const randomHex = (len: number) => {
      const chars = '0123456789ABCDEF';
      let result = '';
      for (let i = 0; i < len; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
      return result;
    };
    const key = `LIC-${randomHex(4)}-${randomHex(4)}-${randomHex(4)}-${randomHex(4)}`;
    const newLicenseId = `lic-${Date.now()}`;
    const newLicense: License = {
      ...licenseData,
      id: newLicenseId,
      key,
      createdAt: new Date().toISOString(),
      usageCount: 0,
    };

    const state = get();
    const { db } = getFirebaseInstance(state.firebaseConfig);

    if (db) {
      try {
        await setDoc(doc(db, 'licenses', newLicenseId), newLicense);
      } catch (error) {
        console.error('Error saving license to Firestore:', error);
      }
    }

    set((state) => {
      // Update counts in products
      const products = state.products.map((p) => {
        if (p.id === licenseData.productId) {
          // Increment licenseCount. Increment clientCount if client doesn't have license for this product already.
          const clientHasLicense = state.licenses.some(
            (l) => l.productId === licenseData.productId && l.clientId === licenseData.clientId
          );
          return {
            ...p,
            licenseCount: p.licenseCount + 1,
            clientCount: clientHasLicense ? p.clientCount : p.clientCount + 1,
          };
        }
        return p;
      });

      // Update counts in clients
      const clients = state.clients.map((c) => {
        if (c.id === licenseData.clientId) {
          return {
            ...c,
            totalLicenses: c.totalLicenses + 1,
            activeLicenses: licenseData.status === 'active' ? c.activeLicenses + 1 : c.activeLicenses,
          };
        }
        return c;
      });

      const newLog: ActivityLog = {
        id: `log-${Date.now()}`,
        licenseId: newLicense.id,
        type: 'created',
        description: `License generated for ${newLicense.productName} and assigned to ${newLicense.clientName}.`,
        timestamp: new Date().toISOString(),
        productName: newLicense.productName,
        clientName: newLicense.clientName,
      };

      return {
        licenses: [newLicense, ...state.licenses],
        products,
        clients,
        logs: [newLog, ...state.logs],
      };
    });
  },

  suspendLicense: async (id) => {
    const state = get();
    const { db } = getFirebaseInstance(state.firebaseConfig);

    if (db) {
      try {
        await updateDoc(doc(db, 'licenses', id), { status: 'suspended' });
      } catch (error) {
        console.error('Error suspending license in Firestore:', error);
      }
    }

    set((state) => {
      let logEntry: ActivityLog | null = null;
      
      const licenses = state.licenses.map((lic) => {
        if (lic.id === id) {
          logEntry = {
            id: `log-${Date.now()}`,
            licenseId: lic.id,
            type: 'suspended',
            description: `License key ${lic.key.substring(0, 12)}... for ${lic.productName} has been suspended.`,
            timestamp: new Date().toISOString(),
            productName: lic.productName,
            clientName: lic.clientName,
          };
          return { ...lic, status: 'suspended' as const };
        }
        return lic;
      });

      // Recalculate client active licenses
      const targetLicense = state.licenses.find((l) => l.id === id);
      const clients = state.clients.map((c) => {
        if (targetLicense && c.id === targetLicense.clientId && targetLicense.status === 'active') {
          return {
            ...c,
            activeLicenses: Math.max(0, c.activeLicenses - 1),
          };
        }
        return c;
      });

      return {
        licenses,
        clients,
        logs: logEntry ? [logEntry, ...state.logs] : state.logs,
      };
    });
  },

  activateLicense: async (id) => {
    const state = get();
    const { db } = getFirebaseInstance(state.firebaseConfig);
    const target = state.licenses.find((l) => l.id === id);

    if (db && target) {
      try {
        await updateDoc(doc(db, 'licenses', id), {
          status: 'active',
          lastActivatedAt: new Date().toISOString(),
          usageCount: Math.min(target.usageLimit, target.usageCount + 1)
        });
      } catch (error) {
        console.error('Error activating license in Firestore:', error);
      }
    }

    set((state) => {
      let logEntry: ActivityLog | null = null;

      const licenses = state.licenses.map((lic) => {
        if (lic.id === id) {
          logEntry = {
            id: `log-${Date.now()}`,
            licenseId: lic.id,
            type: 'activated',
            description: `License key ${lic.key.substring(0, 12)}... for ${lic.productName} was activated.`,
            timestamp: new Date().toISOString(),
            productName: lic.productName,
            clientName: lic.clientName,
          };
          return {
            ...lic,
            status: 'active' as const,
            lastActivatedAt: new Date().toISOString(),
            usageCount: Math.min(lic.usageLimit, lic.usageCount + 1),
          };
        }
        return lic;
      });

      // Recalculate client active licenses
      const targetLicense = state.licenses.find((l) => l.id === id);
      const clients = state.clients.map((c) => {
        if (targetLicense && c.id === targetLicense.clientId && targetLicense.status !== 'active') {
          return {
            ...c,
            activeLicenses: c.activeLicenses + 1,
          };
        }
        return c;
      });

      return {
        licenses,
        clients,
        logs: logEntry ? [logEntry, ...state.logs] : state.logs,
      };
    });
  },

  renewLicense: async (id, newExpiryDate) => {
    const state = get();
    const { db } = getFirebaseInstance(state.firebaseConfig);

    if (db) {
      try {
        await updateDoc(doc(db, 'licenses', id), {
          status: 'active',
          expiresAt: newExpiryDate
        });
      } catch (error) {
        console.error('Error renewing license in Firestore:', error);
      }
    }

    set((state) => {
      let logEntry: ActivityLog | null = null;

      const licenses = state.licenses.map((lic) => {
        if (lic.id === id) {
          logEntry = {
            id: `log-${Date.now()}`,
            licenseId: lic.id,
            type: 'renewed',
            description: `License key ${lic.key.substring(0, 12)}... for ${lic.productName} has been renewed until ${new Date(newExpiryDate).toLocaleDateString()}.`,
            timestamp: new Date().toISOString(),
            productName: lic.productName,
            clientName: lic.clientName,
          };
          return {
            ...lic,
            status: 'active' as const,
            expiresAt: newExpiryDate,
          };
        }
        return lic;
      });

      // Update client active licenses if it was suspended before
      const targetLicense = state.licenses.find((l) => l.id === id);
      const clients = state.clients.map((c) => {
        if (targetLicense && c.id === targetLicense.clientId && targetLicense.status === 'suspended') {
          return {
            ...c,
            activeLicenses: c.activeLicenses + 1,
          };
        }
        return c;
      });

      return {
        licenses,
        clients,
        logs: logEntry ? [logEntry, ...state.logs] : state.logs,
      };
    });
  },

  deleteLicense: async (id) => {
    const state = get();
    const { db } = getFirebaseInstance(state.firebaseConfig);

    if (db) {
      try {
        await deleteDoc(doc(db, 'licenses', id));
      } catch (error) {
        console.error('Error deleting license from Firestore:', error);
      }
    }

    set((state) => {
      const targetLicense = state.licenses.find((l) => l.id === id);
      if (!targetLicense) return state;

      const licenses = state.licenses.filter((l) => l.id !== id);

      // Recalculate client counts
      const clients = state.clients.map((c) => {
        if (c.id === targetLicense.clientId) {
          return {
            ...c,
            totalLicenses: Math.max(0, c.totalLicenses - 1),
            activeLicenses: targetLicense.status === 'active' ? Math.max(0, c.activeLicenses - 1) : c.activeLicenses,
          };
        }
        return c;
      });

      // Recalculate product counts
      const products = state.products.map((p) => {
        if (p.id === targetLicense.productId) {
          // Decrement licenseCount. Decrement clientCount if client has no more licenses for this product.
          const clientHasOtherLicense = licenses.some(
            (l) => l.productId === targetLicense.productId && l.clientId === targetLicense.clientId
          );
          return {
            ...p,
            licenseCount: Math.max(0, p.licenseCount - 1),
            clientCount: clientHasOtherLicense ? p.clientCount : Math.max(0, p.clientCount - 1),
          };
        }
        return p;
      });

      const newLog: ActivityLog = {
        id: `log-${Date.now()}`,
        type: 'deleted',
        description: `License key for ${targetLicense.productName} (Client: ${targetLicense.clientName}) was deleted.`,
        timestamp: new Date().toISOString(),
        productName: targetLicense.productName,
        clientName: targetLicense.clientName,
      };

      return {
        licenses,
        clients,
        products,
        logs: [newLog, ...state.logs],
      };
    });
  },

  updateFirebaseConfig: (config) => {
    set({ firebaseConfig: config });
  },
}));
