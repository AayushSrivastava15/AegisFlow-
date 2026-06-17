'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Package, 
  Users, 
  Key, 
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Database,
  Globe,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { useLicenseStore } from '../../store/licenseStore';

export default function DashboardPage() {
  const { products, clients, licenses, logs } = useLicenseStore();

  // Metrics calculations
  const totalProducts = products.length;
  const totalClients = clients.length;
  const activeLicenses = licenses.filter((l) => l.status === 'active').length;
  const suspendedLicenses = licenses.filter((l) => l.status === 'suspended').length;
  const expiringLicenses = licenses.filter((l) => l.status === 'expiring').length;

  // Recent 5 activations
  const recentActivations = licenses
    .filter((l) => l.lastActivatedAt)
    .sort((a, b) => new Date(b.lastActivatedAt!).getTime() - new Date(a.lastActivatedAt!).getTime())
    .slice(0, 4);

  // System Health details
  const apiStatus = 'Healthy';
  const dbStatus = 'Synched';
  const averageLatency = '14ms';

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 20 } }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Enterprise Licensing Suite
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time analytics, key telemetry, and operational controls.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs text-emerald-400 font-mono">Telemetry Live</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <motion.div variants={itemVariants} className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400">Total Products</p>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2 font-mono">
                {totalProducts}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 group-hover:bg-indigo-500/20 transition-all">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-500">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-indigo-400 font-semibold">+100%</span> since platform launch
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>

        {/* Total Clients */}
        <motion.div variants={itemVariants} className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400">Active Clients</p>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2 font-mono">
                {totalClients}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/10 group-hover:bg-purple-500/20 transition-all">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="text-emerald-400 font-semibold">+24%</span> average client growth
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>

        {/* Active Licenses */}
        <motion.div variants={itemVariants} className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400">Active Licenses</p>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2 font-mono text-emerald-400">
                {activeLicenses}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 group-hover:bg-emerald-500/20 transition-all">
              <Key className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="text-slate-400">{expiringLicenses} licenses expiring soon</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>

        {/* Suspended Licenses */}
        <motion.div variants={itemVariants} className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400">Suspended Licenses</p>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2 font-mono text-rose-500">
                {suspendedLicenses}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/10 group-hover:bg-rose-500/20 transition-all">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="text-rose-400 font-semibold">
              {((suspendedLicenses / (licenses.length || 1)) * 100).toFixed(0)}%
            </span> 
            <span>of total license allocation</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
      </div>

      {/* Main Charts & Overview Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Custom SVG Line Chart */}
        <motion.div variants={itemVariants} className="glass-card-no-hover p-6 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-200">License Activation Activity</h4>
              <p className="text-xs text-slate-500">Telemetry tracking peak connections over the last week.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/10 text-[10px] text-indigo-400 font-mono">Weekly</span>
            </div>
          </div>
          
          {/* Custom Responsive SVG Chart */}
          <div className="h-64 w-full flex items-center justify-center pt-4">
            <svg viewBox="0 0 500 200" className="w-full h-full text-indigo-500">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0"/>
                </linearGradient>
              </defs>
              {/* Horizontal Grid lines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

              {/* Chart Path Area */}
              <path
                d="M 10 170 Q 90 140 100 130 T 180 90 T 260 110 T 340 70 T 420 50 T 490 30 L 490 180 L 10 180 Z"
                fill="url(#chartGradient)"
              />
              
              {/* Chart Line */}
              <path
                d="M 10 170 Q 90 140 100 130 T 180 90 T 260 110 T 340 70 T 420 50 T 490 30"
                fill="none"
                stroke="url(#chartLineGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              
              <linearGradient id="chartLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366F1"/>
                <stop offset="50%" stopColor="#8B5CF6"/>
                <stop offset="100%" stopColor="#EC4899"/>
              </linearGradient>

              {/* Data points */}
              <circle cx="100" cy="130" r="4.5" fill="#030712" stroke="#6366F1" strokeWidth="2.5" />
              <circle cx="180" cy="90" r="4.5" fill="#030712" stroke="#6366F1" strokeWidth="2.5" />
              <circle cx="260" cy="110" r="4.5" fill="#030712" stroke="#8B5CF6" strokeWidth="2.5" />
              <circle cx="340" cy="70" r="4.5" fill="#030712" stroke="#8B5CF6" strokeWidth="2.5" />
              <circle cx="420" cy="50" r="4.5" fill="#030712" stroke="#EC4899" strokeWidth="2.5" />
              <circle cx="490" cy="30" r="4.5" fill="#030712" stroke="#EC4899" strokeWidth="2.5" />

              {/* Labels */}
              <text x="10" y="195" fill="rgba(255,255,255,0.3)" fontSize="10" fontStyle="mono">Mon</text>
              <text x="90" y="195" fill="rgba(255,255,255,0.3)" fontSize="10" fontStyle="mono">Tue</text>
              <text x="170" y="195" fill="rgba(255,255,255,0.3)" fontSize="10" fontStyle="mono">Wed</text>
              <text x="250" y="195" fill="rgba(255,255,255,0.3)" fontSize="10" fontStyle="mono">Thu</text>
              <text x="330" y="195" fill="rgba(255,255,255,0.3)" fontSize="10" fontStyle="mono">Fri</text>
              <text x="410" y="195" fill="rgba(255,255,255,0.3)" fontSize="10" fontStyle="mono">Sat</text>
              <text x="470" y="195" fill="rgba(255,255,255,0.3)" fontSize="10" fontStyle="mono">Sun</text>
            </svg>
          </div>
        </motion.div>

        {/* System Health / API telemetry widget */}
        <motion.div variants={itemVariants} className="glass-card-no-hover p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-200">System Telemetry</h4>
            <p className="text-xs text-slate-500 mb-5">Global status and key performance indicators.</p>
            
            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-slate-300">API Gateway</span>
                </div>
                <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">
                  {apiStatus}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs text-slate-300">Memory Sync</span>
                </div>
                <span className="text-xs font-mono font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10">
                  {dbStatus}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-slate-300">Avg Latency</span>
                </div>
                <span className="text-xs font-mono font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/10">
                  {averageLatency}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-white/[0.01] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400">Platform Status</span>
                <span className="text-xs font-semibold text-slate-200">100% Uptime</span>
              </div>
            </div>
            <span className="text-[9px] font-mono text-slate-500">v1.2.0-stable</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom section: Recent activations & latest logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Latest license activations */}
        <motion.div variants={itemVariants} className="glass-card-no-hover p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Recent Activations</h4>
              <p className="text-xs text-slate-500">The most recently utilized license nodes.</p>
            </div>
            <Link href="/dashboard/licenses">
              <span className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5 cursor-pointer">
                View Licenses <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentActivations.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No recent activations detected.
              </div>
            ) : (
              recentActivations.map((lic) => (
                <div key={lic.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/10">
                      <Key className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-semibold text-slate-200 block">{lic.key}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{lic.productName} • {lic.clientName}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-medium text-slate-300 block">
                      {lic.usageCount} / {lic.usageLimit} uses
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5 flex items-center gap-1 justify-end">
                      <Calendar className="w-2.5 h-2.5" /> 
                      {lic.lastActivatedAt ? new Date(lic.lastActivatedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Latest Activity Logs */}
        <motion.div variants={itemVariants} className="glass-card-no-hover p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Latest Platform Logs</h4>
              <p className="text-xs text-slate-500">Audit logs tracking core telemetry operations.</p>
            </div>
            <Link href="/dashboard/logs">
              <span className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5 cursor-pointer">
                View Logs <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          <div className="space-y-3">
            {logs.slice(0, 4).map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-xs leading-normal">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 text-[11px] font-medium leading-relaxed">
                    {log.description}
                  </p>
                  <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">
                    {new Date(log.timestamp).toLocaleDateString()} at {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
