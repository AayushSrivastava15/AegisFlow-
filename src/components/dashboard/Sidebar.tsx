'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Key, 
  ClipboardList, 
  Settings, 
  LogOut, 
  ShieldCheck,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/dashboard/products', icon: Package },
    { name: 'Clients', href: '/dashboard/clients', icon: Users },
    { name: 'Licenses', href: '/dashboard/licenses', icon: Key },
    { name: 'Activity Logs', href: '/dashboard/logs', icon: ClipboardList },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#030712]/80 backdrop-blur-xl border-r border-white/5 text-slate-200">
      {/* Brand logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            AegisFlow
          </span>
          <p className="text-[10px] text-indigo-400/80 font-mono tracking-wider">LICENSE HUB</p>
        </div>
        {/* Mobile close button */}
        <button 
          onClick={onClose} 
          className="ml-auto p-1.5 rounded-lg border border-white/5 hover:bg-white/5 md:hidden"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href} onClick={() => onClose()}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-l-2 border-indigo-500 text-white font-medium shadow-inner shadow-indigo-500/5'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span>{item.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeGlow" 
                    className="absolute inset-0 bg-indigo-500/5 rounded-xl filter blur-sm -z-10" 
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile shortcut */}
      <div className="p-4 border-t border-white/5 bg-white/[0.01]">
        <Link href="/">
          <div className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 rounded-xl transition-colors hover:bg-red-500/5 cursor-pointer">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Sign Out</span>
          </div>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 z-50 md:hidden shadow-2xl"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
