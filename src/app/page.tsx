'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  ChevronDown, 
  Key, 
  Users, 
  Layers, 
  TrendingUp, 
  Settings, 
  Activity, 
  CheckCircle,
  FileText,
  Lock,
  Zap
} from 'lucide-react';

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const features = [
    {
      title: 'License Provisioning',
      desc: 'Provision custom license keys with precise active device limits, expiry dates, and usage telemetry.',
      icon: Key,
      color: 'text-indigo-400 bg-indigo-500/10'
    },
    {
      title: 'Client Management',
      desc: 'Track accounts, contact details, corporate domains, and active subscriptions in a single interface.',
      icon: Users,
      color: 'text-purple-400 bg-purple-500/10'
    },
    {
      title: 'Product Cataloging',
      desc: 'Organize products, define pricing structures, and view activation telemetry across all products.',
      icon: Layers,
      color: 'text-pink-400 bg-pink-500/10'
    },
    {
      title: 'Renewal Tracking',
      desc: 'Automatically flag expiring licenses and extend expiration by 1 year with a single click.',
      icon: TrendingUp,
      color: 'text-emerald-400 bg-emerald-500/10'
    },
    {
      title: 'Suspension Controls',
      desc: 'Instantly deactivate or activate license keys to respond to payment updates or abuse.',
      icon: Settings,
      color: 'text-rose-400 bg-rose-500/10'
    },
    {
      title: 'Analytics Ready',
      desc: 'Track activations, latency statistics, and system health status widgets in real time.',
      icon: Activity,
      color: 'text-amber-400 bg-amber-500/10'
    }
  ];

  const steps = [
    { title: 'Create Product', desc: 'Define your app, categories, and price plans.' },
    { title: 'Register Client', desc: 'Add contact details and client organizations.' },
    { title: 'Generate License', desc: 'Provision keys with custom expiry dates & limits.' },
    { title: 'Activate App', desc: 'Connect the SDK to validate keys in real-time.' },
    { title: 'Manage Overview', desc: 'Monitor telemetry and process renewals easily.' }
  ];

  const plans = [
    {
      name: 'Starter',
      price: '$49',
      desc: 'Ideal for indie developers and early-stage startups.',
      features: ['Up to 3 Products', 'Up to 50 Clients', '500 Active Licenses', 'Telemetry Analytics', 'Standard Support'],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Enterprise',
      price: '$199',
      desc: 'Designed for scaling SaaS and professional software platforms.',
      features: ['Unlimited Products', 'Unlimited Clients', '10,000 Active Licenses', 'Advanced Latency Telemetry', 'API Gateway Keys', '24/7 Priority Support'],
      cta: 'Go Pro',
      popular: true
    },
    {
      name: 'Custom',
      price: 'Custom',
      desc: 'For massive scale, high volume nodes, and custom integrations.',
      features: ['Unlimited Everything', 'Dedicated API Proxies', 'On-prem Database Sync', 'White-labeled SDKs', 'Dedicated Slack Channel'],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const faqs = [
    {
      q: 'How does the license key activation mechanism work?',
      a: 'When your application launches, it makes an API call to our endpoints sending the license key. We authenticate the request, check the activation limit, verify the expiry date, log the telemetry, and respond with a secure signed payload.'
    },
    {
      q: 'Can I suspend a client license key instantly?',
      a: 'Yes. The moment you toggle a license status to suspended inside the dashboard, all future handshakes will reject the key immediately.'
    },
    {
      q: 'Is there a limit to how many products I can manage?',
      a: 'On the Enterprise plan, you can define unlimited products and handle as many active clients as your business requires.'
    },
    {
      q: 'How do I renew a license key that is expiring soon?',
      a: 'You can search or filter for expiring keys in the Licenses dashboard and simply click the Renew button. This automatically adds 1 year to the expiration date.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans relative overflow-hidden">
      
      {/* Background design accents */}
      <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#030712]/60 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/25">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">
            AegisFlow
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <span className="text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer">
              Login
            </span>
          </Link>
          <Link href="/dashboard">
            <span className="glass-button-primary px-3 py-1.5 text-xs font-semibold cursor-pointer">
              Dashboard
            </span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center space-y-8 relative z-10">
        
        {/* Floating statistics cards & header */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-mono font-medium shadow-inner">
            <Zap className="w-3.5 h-3.5 animate-pulse" /> Platform Live in Dev
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Manage Every License From{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              One Dashboard
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Provision license keys, track developer seats, monitor telemetry connections, and automate client renewals with our premium SaaS dashboard.
          </p>
          
          <div className="flex justify-center items-center gap-4 pt-4">
            <Link href="/dashboard">
              <span className="glass-button-primary px-6 py-3 text-sm font-semibold flex items-center gap-2 cursor-pointer group">
                Enter Console <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <Link href="/login">
              <span className="glass-button px-6 py-3 text-sm font-semibold cursor-pointer">
                Sign In
              </span>
            </Link>
          </div>
        </div>

        {/* Dashboard Preview Mockup container */}
        <div className="pt-12 relative max-w-4xl mx-auto">
          {/* Floating statistics cards */}
          <div className="absolute top-1/4 -left-12 hidden lg:flex glass-card p-4 rounded-xl flex-col items-start gap-1 z-20 animate-float-slow">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Active telemetry</span>
            <span className="text-xl font-bold text-emerald-400 font-mono">1,248 Nodes</span>
            <span className="text-[9px] text-slate-500 font-mono">Uptime: 100.00%</span>
          </div>

          <div className="absolute bottom-1/4 -right-12 hidden lg:flex glass-card p-4 rounded-xl flex-col items-start gap-1 z-20 animate-float-delayed">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Total Sales</span>
            <span className="text-xl font-bold text-white font-mono">$18,400</span>
            <span className="text-[9px] text-indigo-400 font-semibold">+12% this week</span>
          </div>

          {/* Interactive mockup representation */}
          <div className="rounded-2xl border border-white/10 bg-[#090d16]/80 backdrop-blur-2xl shadow-2xl p-2 relative overflow-hidden aspect-video">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 pointer-events-none" />
            <div className="flex items-center gap-1.5 px-4 py-2 border-b border-white/5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-mono text-slate-600 ml-4">console.aegisflow.com/dashboard</span>
            </div>
            
            {/* Visual Dashboard wireframe mockup */}
            <div className="p-4 grid grid-cols-4 gap-3 h-full">
              <div className="col-span-1 border-r border-white/5 pr-3 space-y-2 text-left py-1">
                <div className="h-6 w-24 bg-white/10 rounded-lg" />
                <div className="h-4 w-full bg-white/5 rounded-lg" />
                <div className="h-4 w-4/5 bg-white/5 rounded-lg" />
                <div className="h-4 w-11/12 bg-white/5 rounded-lg" />
              </div>
              <div className="col-span-3 space-y-3 pt-1">
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-10 bg-white/5 rounded-xl border border-white/5" />
                  <div className="h-10 bg-white/5 rounded-xl border border-white/5" />
                  <div className="h-10 bg-white/5 rounded-xl border border-white/5" />
                </div>
                <div className="h-28 bg-white/5 rounded-xl border border-white/5 relative flex items-center justify-center">
                  {/* SVG Mock Sparkline chart */}
                  <svg viewBox="0 0 400 100" className="w-full h-full p-2 opacity-50">
                    <path d="M 0 80 Q 80 50 120 70 T 200 40 T 300 20 T 400 10" fill="none" stroke="#6366F1" strokeWidth="2.5" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-white/5 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Designed for Modern Dev Platforms
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            A premium licensing infrastructure designed to keep integrations fast and secure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className="glass-card p-6 rounded-2xl space-y-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${feat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-slate-200">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-white/5 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Go from product creation to secure endpoints in five simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {steps.map((step, idx) => (
            <div key={step.title} className="relative glass-card-no-hover p-5 rounded-2xl space-y-3 text-center border border-white/5">
              <div className="absolute top-3 left-4 text-[10px] font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full">
                Step 0{idx + 1}
              </div>
              <div className="pt-6 font-semibold text-xs text-slate-200">{step.title}</div>
              <p className="text-[11px] text-slate-400 leading-normal">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-white/5 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Sleek, Transparent Pricing
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Choose a plan that fits your developer team size and project volume.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`glass-card p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between space-y-6 ${
                plan.popular ? 'border-indigo-500 shadow-lg shadow-indigo-500/10' : ''
              }`}
            >
              {plan.popular && (
                <span className="absolute top-3 right-4 bg-indigo-500 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Popular
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400">{plan.name}</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white">{plan.price}</span>
                    {plan.price !== 'Custom' && <span className="text-xs text-slate-500">/month</span>}
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{plan.desc}</p>
                </div>

                <div className="border-t border-white/5 my-4" />

                <ul className="space-y-2">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-xs text-slate-300">
                      <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link href="/login">
                <button className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  plan.popular ? 'glass-button-primary' : 'glass-button'
                }`}>
                  {plan.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-6 py-20 border-t border-white/5 relative z-10">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white text-center mb-10">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={faq.q} className="glass-card-no-hover rounded-xl border border-white/5 overflow-hidden">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 flex items-center justify-between text-left text-xs font-semibold text-slate-200 hover:bg-white/[0.01] transition-colors focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#01040a]/40 px-6 py-8 text-center text-xs text-slate-500 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-6xl mx-auto gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-400">AegisFlow Telemetry</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} AegisFlow Inc. All rights reserved. Built for Next.js and Tailwind CSS.
          </div>
        </div>
      </footer>

    </div>
  );
}
