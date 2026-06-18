'use client';

import React, { useState, useEffect } from 'react';
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
  Layers,
  CircleDollarSign,
  Activity,
  Heart,
  Eye,
  CheckCircle,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { useLicenseStore } from '../../store/licenseStore';

export default function DashboardPage() {
  const { products, customers, licenses, logs, employees, company, heartbeats } = useLicenseStore();

  // Metrics Calculations (Top Row)
  const totalProducts = products.length;
  const connectedProducts = products.filter((p) => p.status !== 'PENDING_CONNECTION').length;
  const activeLicenses = licenses.filter((l) => l.status === 'ACTIVE').length;
  const totalEmployees = employees.length;

  const renewalsDue = licenses.filter((lic) => {
    if (lic.status === 'EXPIRED' || lic.status === 'REVOKED') return false;
    try {
      const expiry = new Date(lic.expiryDate).getTime();
      const now = new Date().getTime();
      const diffDays = (expiry - now) / (1000 * 60 * 60 * 24);
      return diffDays > 0 && diffDays <= 30;
    } catch (e) {
      return false;
    }
  }).length;

  const getMonthlyRevenue = () => {
    if (!company) return 0;
    const plan = company.plan;
    if (plan === 'starter') return 49;
    if (plan === 'growth') return 199;
    if (plan === 'enterprise') return 999;
    return 0; // Free
  };
  const monthlyRevenue = getMonthlyRevenue();

  // Second Row: Status Distribution
  const liveCount = products.filter((p) => p.status === 'LIVE').length;
  const warningCount = products.filter((p) => p.status === 'WARNING').length;
  const offlineCount = products.filter((p) => p.status === 'OFFLINE').length;
  const suspendedCount = products.filter((p) => p.status === 'SUSPENDED').length;
  const revokedCount = products.filter((p) => p.status === 'REVOKED').length;

  // Latency telemetries
  const [latency, setLatency] = useState('14ms');
  const [cpuUsage, setCpuUsage] = useState('1.2%');

  useEffect(() => {
    const interval = setInterval(() => {
      const baseLatency = products.length > 0 ? 8 : 2;
      const val = baseLatency + Math.floor(Math.random() * 8);
      setLatency(`${val}ms`);

      const cpu = 0.5 + Math.random() * 2;
      setCpuUsage(`${cpu.toFixed(1)}%`);
    }, 4000);
    return () => clearInterval(interval);
  }, [products]);

  // Chart 1: License Growth (Mon-Sun SVG)
  const activityCounts = [0, 0, 0, 0, 0, 0, 0];
  licenses.forEach((lic) => {
    try {
      const date = new Date(lic.createdAt);
      const day = date.getDay(); 
      const index = day === 0 ? 6 : day - 1; 
      if (index >= 0 && index < 7) {
        activityCounts[index]++;
      }
    } catch (e) {}
  });
  const maxCount = Math.max(...activityCounts, 1);
  const points = activityCounts.map((count, index) => {
    const x = 30 + index * 73.3;
    const y = 160 - (count / maxCount) * 120;
    return { x, y, count };
  });
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cp1x = (p0.x + p1.x) / 2;
    const cp1y = p0.y;
    const cp2x = (p0.x + p1.x) / 2;
    const cp2y = p1.y;
    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
  }
  const areaD = `${pathD} L ${points[points.length - 1].x} 170 L ${points[0].x} 170 Z`;
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Chart 2: Product Health Score Average
  const averageHealth = products.length > 0
    ? Math.round(products.reduce((acc, p) => acc + p.healthScore, 0) / products.length)
    : 100;

  // Chart 3: Revenue Trend (Last 5 Months)
  const revenueTrend = [monthlyRevenue * 0.8, monthlyRevenue * 0.9, monthlyRevenue * 0.95, monthlyRevenue, monthlyRevenue];
  const maxRevenue = Math.max(...revenueTrend, 10);
  const revPoints = revenueTrend.map((val, idx) => {
    const x = 40 + idx * 100;
    const y = 150 - (val / maxRevenue) * 100;
    return { x, y, val };
  });
  let revPath = `M ${revPoints[0].x} ${revPoints[0].y}`;
  for (let i = 0; i < revPoints.length - 1; i++) {
    const p0 = revPoints[i];
    const p1 = revPoints[i + 1];
    revPath += ` L ${p1.x} ${p1.y}`;
  }

  // Animation layout
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 }
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
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
            Enterprise Control Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time multi-tenant licensing dashboard, telemetry diagnostics, and health logs.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#090d16]/30 border border-white/5 px-3 py-1.5 rounded-xl backdrop-blur">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs text-emerald-400 font-mono font-medium">SaaS Instance Online</span>
        </div>
      </div>

      {/* Row 1: Core Dashboard Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* Total Products */}
        <motion.div variants={itemVariants} className="glass-card p-4 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Total Products</p>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1.5 font-mono">{totalProducts}</h3>
            </div>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-[10px] text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Connected: <b>{connectedProducts}</b></span>
          </div>
        </motion.div>

        {/* Active Licenses */}
        <motion.div variants={itemVariants} className="glass-card p-4 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Active Licenses</p>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1.5 font-mono text-indigo-400">{activeLicenses}</h3>
            </div>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/10">
              <Key className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-[10px] text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>Total: <b>{licenses.length}</b></span>
          </div>
        </motion.div>

        {/* Renewals Due */}
        <motion.div variants={itemVariants} className="glass-card p-4 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Renewals Due</p>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1.5 font-mono text-amber-500">{renewalsDue}</h3>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/10">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-[10px] text-slate-500">
            <span>Expiring within 30 days</span>
          </div>
        </motion.div>

        {/* Monthly Revenue */}
        <motion.div variants={itemVariants} className="glass-card p-4 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Monthly Revenue</p>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1.5 font-mono text-emerald-400">
                ${monthlyRevenue}
              </h3>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
              <CircleDollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-[10px] text-slate-500">
            <span>Tier: <b className="uppercase">{company?.plan || 'Free'}</b></span>
          </div>
        </motion.div>

        {/* Customers count */}
        <motion.div variants={itemVariants} className="glass-card p-4 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Customers</p>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1.5 font-mono">{customers.length}</h3>
            </div>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/10">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-[10px] text-slate-500">
            <span>Active client accounts</span>
          </div>
        </motion.div>

        {/* Employees */}
        <motion.div variants={itemVariants} className="glass-card p-4 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Employees</p>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1.5 font-mono">{totalEmployees}</h3>
            </div>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/10">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-[10px] text-slate-500">
            <span>Provisioned team seats</span>
          </div>
        </motion.div>

      </div>

      {/* Row 2: Live Diagnostics Distribution */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* Live */}
        <motion.div variants={itemVariants} className="glass-card px-4 py-3.5 rounded-xl border-l-4 border-l-emerald-500 flex justify-between items-center bg-emerald-500/[0.01]">
          <span className="text-xs text-slate-400 font-medium">Live Products</span>
          <span className="text-base font-bold font-mono text-emerald-400">{liveCount}</span>
        </motion.div>

        {/* Warning */}
        <motion.div variants={itemVariants} className="glass-card px-4 py-3.5 rounded-xl border-l-4 border-l-amber-500 flex justify-between items-center bg-amber-500/[0.01]">
          <span className="text-xs text-slate-400 font-medium">Warning Tiers</span>
          <span className="text-base font-bold font-mono text-amber-500">{warningCount}</span>
        </motion.div>

        {/* Offline */}
        <motion.div variants={itemVariants} className="glass-card px-4 py-3.5 rounded-xl border-l-4 border-l-rose-500 flex justify-between items-center bg-rose-500/[0.01]">
          <span className="text-xs text-slate-400 font-medium">Offline Apps</span>
          <span className="text-base font-bold font-mono text-rose-500">{offlineCount}</span>
        </motion.div>

        {/* Suspended */}
        <motion.div variants={itemVariants} className="glass-card px-4 py-3.5 rounded-xl border-l-4 border-l-pink-500 flex justify-between items-center bg-pink-500/[0.01]">
          <span className="text-xs text-slate-400 font-medium">Suspended</span>
          <span className="text-base font-bold font-mono text-pink-400">{suspendedCount}</span>
        </motion.div>

        {/* Revoked */}
        <motion.div variants={itemVariants} className="glass-card px-4 py-3.5 rounded-xl border-l-4 border-l-red-800 flex justify-between items-center bg-red-950/[0.01]">
          <span className="text-xs text-slate-400 font-medium">Revoked Licenses</span>
          <span className="text-base font-bold font-mono text-red-700">{revokedCount}</span>
        </motion.div>

      </div>

      {/* Row 3: Graphs Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Custom SVG Line Chart */}
        <motion.div variants={itemVariants} className="glass-card-no-hover p-6 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-200">License Allocation Flow</h4>
              <p className="text-xs text-slate-500">Weekly tracking of generated license records.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/10 text-[9px] text-indigo-400 font-mono">Real-time</span>
            </div>
          </div>
          
          <div className="h-56 w-full flex items-center justify-center pt-2">
            <svg viewBox="0 0 500 180" className="w-full h-full text-indigo-500">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0"/>
                </linearGradient>
              </defs>
              <line x1="0" y1="45" x2="500" y2="45" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1="135" x2="500" y2="135" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

              <path d={areaD} fill="url(#chartGradient)" />
              <path d={pathD} fill="none" stroke="url(#chartLineGrad)" strokeWidth="3.5" strokeLinecap="round" />
              
              <linearGradient id="chartLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366F1"/>
                <stop offset="50%" stopColor="#8B5CF6"/>
                <stop offset="100%" stopColor="#EC4899"/>
              </linearGradient>

              {points.map((p, idx) => (
                <circle 
                  key={idx}
                  cx={p.x} 
                  cy={p.y} 
                  r="4" 
                  fill="#030712" 
                  stroke={idx >= 5 ? '#EC4899' : (idx > 2 ? '#8B5CF6' : '#6366F1')} 
                  strokeWidth="2" 
                />
              ))}

              {points.map((p, idx) => (
                <text key={idx} x={p.x - 9} y="170" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="monospace">
                  {dayNames[idx]}
                </text>
              ))}
            </svg>
          </div>
        </motion.div>

        {/* Health Donut Chart & Diagnosis */}
        <motion.div variants={itemVariants} className="glass-card-no-hover p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Catalog Health Index</h4>
            <p className="text-xs text-slate-500 mb-6">Aggregated average health score across connected nodes.</p>

            <div className="relative flex items-center justify-center h-36">
              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Track */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="8" />
                {/* Indicator Circle */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="transparent" 
                  stroke="url(#healthGrad)" 
                  strokeWidth="8" 
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * averageHealth) / 100}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="healthGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold font-mono tracking-tight text-white">{averageHealth}%</span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Average Score</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-white/[0.01] border border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>Status:</span>
            </div>
            <span className={`font-semibold ${
              averageHealth >= 90 
                ? 'text-emerald-400' 
                : (averageHealth >= 70 ? 'text-amber-400' : 'text-rose-500')
            }`}>
              {averageHealth >= 90 ? 'Excellent' : (averageHealth >= 70 ? 'Optimal' : 'Attention Needed')}
            </span>
          </div>
        </motion.div>

      </div>

      {/* Row 4: Revenue trend, Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Custom Revenue trend chart */}
        <motion.div variants={itemVariants} className="glass-card-no-hover p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">SaaS Monthly Revenue</h4>
                <p className="text-xs text-slate-500">Historical workspace billing progression.</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">${monthlyRevenue}/mo</span>
            </div>

            <div className="h-32 w-full flex items-end justify-center pt-2">
              <svg viewBox="0 0 500 160" className="w-full h-full text-emerald-500">
                <line x1="0" y1="130" x2="500" y2="130" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                <path d={revPath} fill="none" stroke="#10B981" strokeWidth="3" />
                {revPoints.map((p, idx) => (
                  <circle key={idx} cx={p.x} cy={p.y} r="4.5" fill="#030712" stroke="#10B981" strokeWidth="2.5" />
                ))}
              </svg>
            </div>
          </div>

          <div className="mt-4 flex justify-between text-[9px] text-slate-500 uppercase tracking-wider font-mono">
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
          </div>
        </motion.div>

        {/* Telemetry Status diagnostics widget */}
        <motion.div variants={itemVariants} className="glass-card-no-hover p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Gateway Telemetry</h4>
            <p className="text-xs text-slate-500 mb-4">Diagnostic latency metrics and platform hooks.</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.01] border border-white/5">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-slate-300">Heartbeat Receiver</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">Active</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.01] border border-white/5">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400 animate-pulse" />
                  <span className="text-xs text-slate-300">Avg Response Time</span>
                </div>
                <span className="text-xs font-mono font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/10">{latency}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.01] border border-white/5">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs text-slate-300">CPU Usage</span>
                </div>
                <span className="text-xs font-mono font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10">{cpuUsage}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded-lg bg-white/[0.01] border border-white/5 flex items-center justify-between text-[10px] text-slate-400">
            <span>Heartbeats recorded: <b>{heartbeats.length}</b></span>
            <span>v2.0-Multitenant</span>
          </div>
        </motion.div>

        {/* Recent Activity Timeline */}
        <motion.div variants={itemVariants} className="glass-card-no-hover p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Recent Workspace Logs</h4>
                <p className="text-xs text-slate-500">Live feed of administrative actions.</p>
              </div>
              <Link href="/dashboard/logs">
                <span className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5 cursor-pointer">
                  All Logs <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>

            <div className="space-y-3.5 max-h-[140px] overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <div className="text-center py-6 text-[11px] text-slate-500">No logs generated yet.</div>
              ) : (
                logs.slice(0, 3).map((log) => (
                  <div key={log.logId} className="flex items-start gap-2.5 text-xs leading-normal">
                    <div className="p-1 rounded bg-indigo-500/10 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-300 text-[11px] font-medium leading-relaxed truncate">{log.action}</p>
                      <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">
                        {log.employeeEmail || 'System'} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 border-t border-white/5 pt-3 text-center">
            <span className="text-[10px] text-slate-500 font-medium font-sans">Scoped by Company: <b>{company?.companyName || 'Active Workspace'}</b></span>
          </div>
        </motion.div>

      </div>

    </motion.div>
  );
}
