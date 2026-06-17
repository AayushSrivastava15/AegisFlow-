'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Search, 
  Bell, 
  Menu, 
  User, 
  Settings, 
  LogOut,
  ChevronDown,
  Info
} from 'lucide-react';
import { useLicenseStore } from '../../store/licenseStore';

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const logs = useLicenseStore((state) => state.logs);
  
  const [searchFocused, setSearchFocused] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format current page title
  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length <= 1) return 'Dashboard';
    const sub = segments[1];
    return sub.charAt(0).toUpperCase() + sub.slice(1).replace('-', ' ');
  };

  // Filter out latest warnings or events for notification center (max 5)
  const notificationsList = logs.slice(0, 5);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-6 bg-[#030712]/50 backdrop-blur-md border-b border-white/5 text-slate-100">
      
      {/* Left section: Breadcrumb and Hamburger */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-1.5 rounded-lg border border-white/5 hover:bg-white/5 md:hidden"
        >
          <Menu className="w-5 h-5 text-slate-400" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Workspace</span>
          <span className="text-xs text-slate-600">/</span>
          <h1 className="text-sm font-semibold tracking-tight text-slate-200">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Center/Right section: Search & Dropdowns */}
      <div className="flex items-center gap-4">
        
        {/* Global Search box */}
        <div className="relative hidden sm:block">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Search licenses, clients, keys... (⌘K)"
            className={`w-64 px-9 py-1.5 text-xs rounded-lg bg-white/[0.02] border transition-all placeholder-slate-500 ${
              searchFocused 
                ? 'border-indigo-500 w-80 shadow-md shadow-indigo-500/10' 
                : 'border-white/5 hover:border-white/10'
            }`}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <span className="px-1 py-0.5 text-[9px] font-mono border border-white/10 text-slate-500 rounded bg-white/[0.02]">
              ⌘K
            </span>
          </div>
        </div>

        {/* Notification Center */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-400 hover:text-white rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/5 transition-all relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 shadow-md shadow-indigo-500/50" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2.5 w-80 rounded-xl bg-[#090d16] border border-white/10 shadow-2xl p-1 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">Recent Activations</span>
                <span className="text-[10px] text-indigo-400 cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto py-1">
                {notificationsList.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No new activities
                  </div>
                ) : (
                  notificationsList.map((notif) => (
                    <div 
                      key={notif.id} 
                      className="px-4 py-2.5 hover:bg-white/5 rounded-lg transition-colors flex items-start gap-2.5 cursor-pointer"
                    >
                      <div className="p-1 rounded bg-indigo-500/10 mt-0.5">
                        <Info className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-300 font-medium leading-normal line-clamp-2">
                          {notif.description}
                        </p>
                        <span className="text-[9px] text-slate-500 block mt-1 font-mono">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2 border-t border-white/5 text-center bg-white/[0.01]">
                <Link href="/dashboard/logs" onClick={() => setShowNotifications(false)}>
                  <span className="text-[10px] text-slate-400 hover:text-white font-medium">
                    View all platform logs
                  </span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu Dropdown */}
        <div className="relative flex items-center" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 pl-2.5 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/5 transition-all text-left"
          >
            <div className="flex flex-col text-right">
              <span className="text-xs font-medium text-slate-200">Aayush Sharma</span>
              <span className="text-[9px] text-slate-500 font-mono">Administrator</span>
            </div>
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-gradient-to-tr from-purple-500 to-indigo-500 text-white text-xs font-bold font-mono">
              AS
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-[40px] mt-2 w-48 rounded-xl bg-[#090d16] border border-white/10 shadow-2xl p-1 overflow-hidden z-50">
              <div className="px-3 py-2 border-b border-white/5 text-[11px] text-slate-500 font-mono">
                ACCOUNT SETTINGS
              </div>
              <Link href="/dashboard/settings" onClick={() => setShowProfileMenu(false)}>
                <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>My Profile</span>
                </div>
              </Link>
              <Link href="/dashboard/settings" onClick={() => setShowProfileMenu(false)}>
                <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Config Options</span>
                </div>
              </Link>
              <div className="border-t border-white/5 my-1" />
              <Link href="/" onClick={() => setShowProfileMenu(false)}>
                <div className="flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/5 rounded-lg transition-colors cursor-pointer">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </div>
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
