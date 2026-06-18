'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import Sidebar from '../../components/dashboard/Sidebar';
import Header from '../../components/dashboard/Header';
import { useLicenseStore } from '../../store/licenseStore';
import { getFirebaseInstance } from '../../lib/firebase';
import { ShieldAlert, Zap } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { 
    firebaseConfig, 
    subscribeToLicenses, 
    subscribeToProducts,
    subscribeToCustomers,
    subscribeToLogs,
    subscribeToHeartbeats,
    subscribeToEmployees,
    subscribeToCompany,
    user, 
    authLoading, 
    setUser, 
    setAuthLoading,
    cleanOldLogs
  } = useLicenseStore();

  // 1. Listen for Firebase Authentication Changes
  useEffect(() => {
    const { auth } = getFirebaseInstance(firebaseConfig);
    
    if (!auth) {
      setUser(null);
      setAuthLoading(false);
      return;
    }

    setAuthLoading(true);
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Query user record in Cloud Firestore to read company details
        const { db } = getFirebaseInstance(firebaseConfig);
        let companyNameStr = 'Personal Workspace';
        let companyId = '';
        let role = 'viewer';
        
        if (db) {
          try {
            const docRef = doc(db, 'users', firebaseUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              companyNameStr = data.company || 'Personal Workspace';
              companyId = data.companyId || '';
              role = data.role || 'viewer';
              
              // Self-heal: If companyId is missing in the user profile but they are authenticated
              if (!companyId) {
                const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
                let newCompanyId = 'comp_';
                for (let i = 0; i < 8; i++) {
                  newCompanyId += chars[Math.floor(Math.random() * chars.length)];
                }
                companyId = newCompanyId;
                role = 'owner';
                
                await setDoc(doc(db, 'companies', companyId), {
                  companyId,
                  companyName: companyNameStr,
                  ownerUid: firebaseUser.uid,
                  plan: 'free',
                  createdAt: new Date().toISOString()
                });
                
                await setDoc(doc(db, 'employees', `emp_${firebaseUser.uid}`), {
                  employeeId: `emp_${firebaseUser.uid}`,
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
              const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
              let newCompanyId = 'comp_';
              for (let i = 0; i < 8; i++) {
                newCompanyId += chars[Math.floor(Math.random() * chars.length)];
              }
              companyId = newCompanyId;
              role = 'owner';
              
              await setDoc(doc(db, 'companies', companyId), {
                companyId,
                companyName: companyNameStr,
                ownerUid: firebaseUser.uid,
                plan: 'free',
                createdAt: new Date().toISOString()
              });
              
              await setDoc(doc(db, 'employees', `emp_${firebaseUser.uid}`), {
                employeeId: `emp_${firebaseUser.uid}`,
                companyId,
                email: firebaseUser.email || '',
                role: 'owner',
                status: 'active',
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Administrator'
              });

              await setDoc(docRef, {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Administrator',
                company: companyNameStr,
                companyId,
                role: 'owner',
                createdAt: new Date().toISOString()
              });
            }
          } catch (e) {
            console.error('Error fetching user company in layout:', e);
          }
        }
        
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Administrator',
          company: companyNameStr,
          companyId,
          role,
        });
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, [firebaseConfig, setUser, setAuthLoading]);

  // 2. Route Guarding - Redirect to login if user is unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // 3. Listen for Firestore collections telemetries
  useEffect(() => {
    if (!user) return;

    // Background optimization: delete logs and heartbeats older than 24 hours
    cleanOldLogs();

    const unsubLicenses = subscribeToLicenses();
    const unsubProducts = subscribeToProducts();
    const unsubCustomers = subscribeToCustomers();
    const unsubLogs = subscribeToLogs();
    const unsubHeartbeats = subscribeToHeartbeats();
    const unsubEmployees = subscribeToEmployees();
    const unsubCompany = subscribeToCompany();
    
    return () => {
      if (unsubLicenses) unsubLicenses();
      if (unsubProducts) unsubProducts();
      if (unsubCustomers) unsubCustomers();
      if (unsubLogs) unsubLogs();
      if (unsubHeartbeats) unsubHeartbeats();
      if (unsubEmployees) unsubEmployees();
      if (unsubCompany) unsubCompany();
    };
  }, [user, firebaseConfig, subscribeToLicenses, subscribeToProducts, subscribeToCustomers, subscribeToLogs, subscribeToHeartbeats, subscribeToEmployees, subscribeToCompany, cleanOldLogs]);

  // Premium loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center relative overflow-hidden font-sans">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
        <div className="bg-mesh" />
        <div className="bg-grid" />
        
        <div className="flex flex-col items-center space-y-4 relative z-10 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 animate-bounce">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-sm font-semibold text-white tracking-wider uppercase">AegisFlow Telemetry</h2>
          <p className="text-xs text-slate-500 max-w-[200px] animate-pulse">
            Connecting workspace session gateway...
          </p>
        </div>
      </div>
    );
  }

  // Guard render
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute top-[30%] right-[10%] w-[35%] h-[35%] bg-pink-500/5 rounded-full blur-[100px] pointer-events-none animate-float-delayed" />
      
      {/* Mesh & Grid */}
      <div className="bg-mesh" />
      <div className="bg-grid" />

      {/* Sidebar Nav */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Content wrapper */}
      <div className="md:pl-64 flex flex-col min-h-screen relative z-10">
        
        {/* Top Header navbar */}
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Main Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
