'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, ArrowRight, Info } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock authentication lag
    setTimeout(() => {
      setIsLoading(false);
      // Redirect to Dashboard home
      router.push('/dashboard');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#030712] relative flex items-center justify-center p-4 overflow-hidden font-sans">
      
      {/* Background accents */}
      <div className="absolute top-[-15%] left-[-15%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute top-[30%] right-[10%] w-[35%] h-[35%] bg-pink-500/5 rounded-full blur-[100px] pointer-events-none animate-float-delayed" />
      
      <div className="bg-mesh" />
      <div className="bg-grid" />

      {/* Main glass box */}
      <div className="relative w-full max-w-md bg-[#090d16]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-8 overflow-hidden z-10">
        
        {/* Brand header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-8">
          <Link href="/">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 cursor-pointer">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Access Licensing Console</h2>
            <p className="text-xs text-slate-500 mt-1">Sign in with your workspace credentials.</p>
          </div>
        </div>

        {/* Info panel */}
        <div className="mb-6 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/10 text-indigo-400 text-[11px] flex gap-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            <strong>UI Mode Active:</strong> Clicking Sign In or Google Sign In will redirect directly to the console.
          </span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="admin@aegisflow.com"
                className="w-full glass-input pl-10 text-xs"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Password</label>
              <button 
                type="button" 
                onClick={() => alert('Forgot Password UI placeholder action.')}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                className="w-full glass-input pl-10 text-xs"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                className="w-3.5 h-3.5 accent-indigo-500 rounded border-white/10 bg-[#090d16] focus:ring-indigo-500"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember this device</span>
            </label>
          </div>

          {/* Login Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full glass-button-primary py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign In to Console <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6 text-center select-none">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5" />
          </div>
          <span className="relative bg-[#090d16] px-3 text-[10px] uppercase font-mono text-slate-500 tracking-wider">
            OR CONTINUE WITH
          </span>
        </div>

        {/* Google Mock login */}
        <button
          type="button"
          onClick={() => {
            setIsLoading(true);
            setTimeout(() => {
              setIsLoading(false);
              router.push('/dashboard');
            }, 1000);
          }}
          className="w-full glass-button py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.51 0-6.355-2.846-6.355-6.356s2.846-6.356 6.355-6.356c1.613 0 3.084.6 4.223 1.579l3.057-3.057C19.347 2.683 15.937 1.5 12.24 1.5 6.015 1.5 1 6.515 1 12.74s5.015 11.24 11.24 11.24c6.29 0 10.748-4.42 10.748-10.91 0-.723-.077-1.414-.213-2.07H12.24z" />
          </svg>
          <span>Authenticate with Google</span>
        </button>

        {/* Back Link */}
        <div className="text-center pt-6">
          <Link href="/">
            <span className="text-[11px] text-slate-500 hover:text-slate-300 cursor-pointer">
              &larr; Back to Landing Page
            </span>
          </Link>
        </div>

      </div>
    </div>
  );
}

