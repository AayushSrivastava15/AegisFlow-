'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import Header from '../../components/dashboard/Header';
import { useLicenseStore } from '../../store/licenseStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { firebaseConfig, subscribeToLicenses } = useLicenseStore();

  useEffect(() => {
    const unsubscribe = subscribeToLicenses();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [firebaseConfig, subscribeToLicenses]);

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
