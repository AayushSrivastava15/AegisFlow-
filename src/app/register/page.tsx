'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, User, Building, ArrowRight, AlertTriangle } from 'lucide-react';
import { useLicenseStore } from '../../store/licenseStore';

export default function RegisterPage() {
  const router = useRouter();

  const { 
    signUpWithEmail, 
    signInWithGoogle, 
    user 
  } = useLicenseStore();

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setAuthError('You must agree to the Terms of Service.');
      return;
    }
    
    setIsLoading(true);

    try {
      await signUpWithEmail(email, password, name, company);
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      let errMsg = 'Failed to create account. Please check your credentials.';
      if (err.code === 'auth/email-already-in-use') {
        errMsg = 'This email address is already registered.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'Password must be at least 6 characters long.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'Invalid email address syntax.';
      } else if (err.message) {
        errMsg = err.message;
      }
      setAuthError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    setAuthError(null);

    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      let errMsg = 'Failed to register with Google.';
      if (err.message) {
        errMsg = err.message;
      }
      setAuthError(errMsg);
    } finally {
      setIsLoading(false);
    }
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
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <Link href="/">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 cursor-pointer">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Create Workspace Account</h2>
            <p className="text-xs text-slate-500 mt-1">Deploy your own SaaS licensing node in seconds.</p>
          </div>
        </div>

          <div className="space-y-5">
            {/* Error Banner */}
            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex gap-2 animate-pulse">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Aayush Sharma"
                    className="w-full glass-input !pl-10 text-xs"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Company Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Company Name</label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="AegisFlow Ltd."
                    className="w-full glass-input !pl-10 text-xs"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="admin@aegisflow.com"
                    className="w-full glass-input !pl-10 text-xs"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Passwords grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full glass-input !pl-10 text-xs"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Confirm</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full glass-input !pl-10 text-xs"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Terms checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-start gap-2 text-xs text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    className="w-3.5 h-3.5 accent-indigo-500 rounded border-white/10 bg-[#090d16] focus:ring-indigo-500 mt-0.5"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    disabled={isLoading}
                  />
                  <span>I agree to the Terms of Service & Privacy Policy</span>
                </label>
              </div>

              {/* Sign Up Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full glass-button-primary py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Create Free Account <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-4 text-center select-none">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <span className="relative bg-[#090d16] px-3 text-[10px] uppercase font-mono text-slate-500 tracking-wider">
                OR REGISTER WITH
              </span>
            </div>

            {/* Google Authentication */}
            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={isLoading}
              className="w-full glass-button py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.51 0-6.355-2.846-6.355-6.356s2.846-6.356 6.355-6.356c1.613 0 3.084.6 4.223 1.579l3.057-3.057C19.347 2.683 15.937 1.5 12.24 1.5 6.015 1.5 1 6.515 1 12.74s5.015 11.24 11.24 11.24c6.29 0 10.748-4.42 10.748-10.91 0-.723-.077-1.414-.213-2.07H12.24z" />
              </svg>
              <span>Sign up with Google</span>
            </button>
          </div>

        {/* Login Link */}
        <div className="text-center pt-4 border-t border-white/5 mt-5">
          <p className="text-[11px] text-slate-500">
            Already have an account?{' '}
            <Link href="/login">
              <span className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer">
                Sign In instead
              </span>
            </Link>
          </p>
        </div>

        {/* Back Link */}
        <div className="text-center pt-3 mt-3">
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
