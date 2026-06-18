'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  Key, 
  Users, 
  BarChart2, 
  Terminal, 
  CreditCard, 
  Settings as SettingsIcon,
  Copy,
  Check,
  Eye,
  EyeOff,
  Plus,
  Play,
  Pause,
  RefreshCw,
  Trash2,
  Lock,
  Search,
  Filter,
  Layers,
  ChevronRight,
  TrendingUp,
  Sliders,
  Calendar,
  Info
} from 'lucide-react';
import { useLicenseStore } from '../../../../store/licenseStore';
import { Product, License, Customer, Heartbeat } from '../../../../types';
import { getFirebaseInstance } from '../../../../lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const { 
    products, 
    licenses, 
    customers, 
    logs, 
    heartbeats, 
    user,
    generateLicense,
    renewLicense,
    suspendLicense,
    activateLicense,
    revokeLicense,
    deleteLicense,
    simulateHeartbeat,
    firebaseConfig,
    company
  } = useLicenseStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'licenses' | 'customers' | 'analytics' | 'connection' | 'logs' | 'billing' | 'settings'>('overview');
  
  // Find target product
  const product = products.find((p) => p.productId === id);

  // Role authorization checks
  const isViewer = user?.role === 'viewer';
  const isManager = user?.role === 'manager';
  const isReadOnly = isViewer;

  // Copy status
  const [copiedField, setCopiedField] = useState<'api' | 'secret' | 'key' | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  // Heartbeat simulator states
  const [simOpen, setSimOpen] = useState(false);
  const [simEnv, setSimEnv] = useState<'production' | 'staging' | 'development'>('production');
  const [simStatus, setSimStatus] = useState<'UP' | 'DOWN'>('UP');
  const [simUsers, setSimUsers] = useState(120);
  const [simVersion, setSimVersion] = useState('1.0.0');

  // Single License Gen modal states
  const [singleGenOpen, setSingleGenOpen] = useState(false);
  const [singleCustId, setSingleCustId] = useState('');
  const [singleUsage, setSingleUsage] = useState<number | ''>(50);
  const [singleExpiryPreset, setSingleExpiryPreset] = useState<'month' | 'year' | 'custom'>('year');
  const [singleExpiryDate, setSingleExpiryDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });

  // Bulk License Gen modal states
  const [bulkGenOpen, setBulkGenOpen] = useState(false);
  const [bulkCustId, setBulkCustId] = useState('');
  const [bulkQty, setBulkQty] = useState(5);
  const [bulkUsage, setBulkUsage] = useState<number | ''>(100);
  const [bulkExpiryPreset, setBulkExpiryPreset] = useState<'month' | 'year' | 'custom'>('year');
  const [bulkExpiryDate, setBulkExpiryDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });

  // License lists & filters
  const productLicenses = licenses.filter((l) => l.productId === id);
  const [licSearch, setLicSearch] = useState('');
  const [licStatusFilter, setLicStatusFilter] = useState('ALL');

  const filteredProductLicenses = productLicenses.filter((l) => {
    const matchesSearch = l.key.toLowerCase().includes(licSearch.toLowerCase()) || 
                          l.customerName.toLowerCase().includes(licSearch.toLowerCase());
    const matchesStatus = licStatusFilter === 'ALL' || l.status === licStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Customers of this product (derived from customer IDs on product's licenses)
  const productCustomerIds = Array.from(new Set(productLicenses.map((l) => l.customerId)));
  const productCustomers = customers.filter((c) => productCustomerIds.includes(c.customerId));
  const [custSearch, setCustSearch] = useState('');
  const filteredProductCustomers = productCustomers.filter((c) => 
    c.name.toLowerCase().includes(custSearch.toLowerCase()) ||
    c.company.toLowerCase().includes(custSearch.toLowerCase())
  );

  // Heartbeats for this product
  const productHeartbeats = heartbeats.filter((h) => h.productId === id);
  
  // Settings tab form states
  const [editName, setEditName] = useState(product?.name || '');
  const [editType, setEditType] = useState<Product['type']>(product?.type || 'SaaS Application');
  const [editVersion, setEditVersion] = useState(product?.version || '1.0.0');

  // Trigger default form values on product load
  React.useEffect(() => {
    if (product) {
      setEditName(product.name);
      setEditType(product.type);
      setEditVersion(product.version);
    }
  }, [product]);

  // If product not loaded or doesn't exist
  if (!product) {
    return (
      <div className="glass-card-no-hover p-12 text-center rounded-2xl max-w-lg mx-auto mt-20">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4 animate-bounce" />
        <h3 className="text-lg font-bold text-white mb-2">Application Asset Not Found</h3>
        <p className="text-xs text-slate-400 mb-6">
          This product may have been archived, deleted, or belongs to a different workspace context.
        </p>
        <button 
          onClick={() => router.push('/dashboard/products')}
          className="glass-button flex items-center justify-center gap-2 px-4 py-2 mx-auto text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products Catalog
        </button>
      </div>
    );
  }

  // Format Helper functions
  const handleCopyText = (text: string, type: 'api' | 'secret' | 'key') => {
    navigator.clipboard.writeText(text);
    setCopiedField(type);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatTimeAgo = (isoString: string) => {
    if (!isoString || isoString === 'Never') return 'Never';
    try {
      const diffMs = new Date().getTime() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch (e) {
      return 'Never';
    }
  };

  const getStatusBadge = (status: Product['status']) => {
    switch (status) {
      case 'LIVE':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/10">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
          </span>
        );
      case 'WARNING':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/10">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            WARNING
          </span>
        );
      case 'OFFLINE':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/10">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            OFFLINE
          </span>
        );
      case 'RENEWAL_NEEDED':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/15 text-orange-400 border border-orange-500/10">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
            RENEWAL
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/15 text-pink-400 border border-pink-500/10">
            <span className="h-1.5 w-1.5 rounded-full bg-pink-500" />
            SUSPENDED
          </span>
        );
      case 'REVOKED':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-950/30 text-red-600 border border-red-900/20">
            <span className="h-1.5 w-1.5 rounded-full bg-red-700" />
            REVOKED
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/15 text-slate-400 border border-slate-500/10">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
            PENDING
          </span>
        );
    }
  };

  // Sim trigger
  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    try {
      await simulateHeartbeat(
        product.productId,
        simVersion,
        simUsers,
        simEnv,
        simStatus
      );
      setSimOpen(false);
    } catch (err) {
      alert('Heartbeat simulation failed.');
    }
  };

  // Single Generation
  const handleSingleGen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!singleCustId) return;

    const cust = customers.find(c => c.customerId === singleCustId);
    if (!cust) return;

    try {
      await generateLicense({
        customerId: cust.customerId,
        customerName: cust.name,
        productId: product.productId,
        productName: product.name,
        status: 'ACTIVE',
        expiryDate: new Date(singleExpiryDate).toISOString(),
        usageLimit: singleUsage === '' ? 1 : Number(singleUsage)
      });
      setSingleGenOpen(false);
    } catch (err) {
      alert('Failed to generate license.');
    }
  };

  // Bulk Generation
  const handleBulkGen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!bulkCustId || bulkQty < 1) return;

    const cust = customers.find(c => c.customerId === bulkCustId);
    if (!cust) return;

    try {
      for (let i = 0; i < bulkQty; i++) {
        await generateLicense({
          customerId: cust.customerId,
          customerName: cust.name,
          productId: product.productId,
          productName: product.name,
          status: 'ACTIVE',
          expiryDate: new Date(bulkExpiryDate).toISOString(),
          usageLimit: bulkUsage === '' ? 100 : Number(bulkUsage)
        });
      }
      setBulkGenOpen(false);
    } catch (err) {
      alert('Failed during bulk generation process.');
    }
  };

  // Set single date preset
  const setSinglePreset = (preset: 'month' | 'year' | 'custom') => {
    setSingleExpiryPreset(preset);
    const d = new Date();
    if (preset === 'month') {
      d.setMonth(d.getMonth() + 1);
      setSingleExpiryDate(d.toISOString().split('T')[0]);
    } else if (preset === 'year') {
      d.setFullYear(d.getFullYear() + 1);
      setSingleExpiryDate(d.toISOString().split('T')[0]);
    }
  };

  // Set bulk date preset
  const setBulkPreset = (preset: 'month' | 'year' | 'custom') => {
    setBulkExpiryPreset(preset);
    const d = new Date();
    if (preset === 'month') {
      d.setMonth(d.getMonth() + 1);
      setBulkExpiryDate(d.toISOString().split('T')[0]);
    } else if (preset === 'year') {
      d.setFullYear(d.getFullYear() + 1);
      setBulkExpiryDate(d.toISOString().split('T')[0]);
    }
  };

  // Save Settings Changes
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    
    const { db } = getFirebaseInstance(firebaseConfig);
    
    if (db) {
      try {
        await updateDoc(doc(db, 'products', product.productId), {
          name: editName,
          type: editType,
          version: editVersion
        });
        
        // Log activity
        const store = useLicenseStore.getState();
        await (store as any).logActivity(`Updated details for product "${product.name}" -> "${editName}"`);
        alert('Product details updated successfully.');
      } catch (err) {
        console.error(err);
        alert('Failed to update product details.');
      }
    }
  };

  // Archive / Delete Product
  const handleDeleteProduct = async () => {
    if (isReadOnly) return;
    if (confirm('CAUTION: Are you sure you want to permanently delete this product? All active licenses associated with this product will remain but disconnected. This action cannot be undone.')) {
      const { db } = getFirebaseInstance(firebaseConfig);
      
      if (db) {
        try {
          await deleteDoc(doc(db, 'products', product.productId));
          const store = useLicenseStore.getState();
          await (store as any).logActivity(`Deleted product "${product.name}" from catalog`);
          router.push('/dashboard/products');
        } catch (e) {
          alert('Failed to delete product.');
        }
      }
    }
  };

  // Administrative Overrides (SUSPENDED / REVOKED / LIVE)
  const handleOverrideStatus = async (overrideStatus: Product['status']) => {
    if (isReadOnly) return;
    const { db } = getFirebaseInstance(firebaseConfig);
    
    if (db) {
      try {
        await updateDoc(doc(db, 'products', product.productId), {
          status: overrideStatus
        });
        const store = useLicenseStore.getState();
        await (store as any).logActivity(`Manually override status of "${product.name}" to ${overrideStatus}`);
        alert(`Product override set to ${overrideStatus}`);
      } catch (err) {
        alert('Failed to set override status.');
      }
    }
  };

  // Filter logs for this product name
  const filteredLogs = logs.filter(l => 
    l.action.toLowerCase().includes(product.name.toLowerCase()) || 
    l.action.toLowerCase().includes(product.productId.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Return to list & Product Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
        <div className="space-y-1">
          <Link 
            href="/dashboard/products"
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-400 transition-colors font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Products Catalog
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 border border-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Package className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{product.name}</h2>
                {getStatusBadge(product.status)}
              </div>
              <p className="text-xs text-slate-500 font-mono tracking-wide mt-0.5">
                PRODUCT ID: {product.productId} • TYPE: {product.type} • VERSION: v{product.version}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Simulator CTA */}
        {!isReadOnly && (
          <button
            onClick={() => {
              setSimUsers(product.activeUsers || 100);
              setSimVersion(product.version);
              setSimOpen(true);
            }}
            className="glass-button flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold self-start sm:self-auto hover:border-indigo-500/20 hover:text-indigo-400 cursor-pointer"
          >
            <Activity className="w-4 h-4 animate-pulse text-indigo-400" /> Simulate Heartbeat
          </button>
        )}
      </div>

      {/* Tabs Switcher Navigation */}
      <div className="flex border-b border-white/5 space-x-2 sm:space-x-6 overflow-x-auto text-xs sm:text-sm select-none scrollbar-none pb-0">
        {[
          { key: 'overview', label: 'Overview', icon: Sliders },
          { key: 'licenses', label: 'Licenses', icon: Key },
          { key: 'customers', label: 'Customers', icon: Users },
          { key: 'analytics', label: 'Analytics', icon: BarChart2 },
          { key: 'connection', label: 'SDK Integration', icon: Terminal },
          { key: 'logs', label: 'Audit Logs', icon: Clock },
          { key: 'billing', label: 'Billing & Quotas', icon: CreditCard },
          { key: 'settings', label: 'Settings & Overrides', icon: SettingsIcon },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`pb-3 px-1 border-b-2 font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
                isActive 
                  ? 'border-indigo-500 text-indigo-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Panel Render switcher */}
      <div className="mt-2">
        
        {/* ==================== 1. OVERVIEW TAB ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Top Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card-no-hover p-4.5 rounded-2xl border border-white/5">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-mono">Telemetry Health</span>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className={`text-xl sm:text-2xl font-bold font-mono ${
                    product.healthScore >= 90 ? 'text-emerald-400' : (product.healthScore >= 70 ? 'text-amber-400' : 'text-rose-500')
                  }`}>{product.healthScore}%</span>
                </div>
                <span className="text-[9px] text-slate-500 block mt-1">Status calculated from diagnostics.</span>
              </div>

              <div className="glass-card-no-hover p-4.5 rounded-2xl border border-white/5">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-mono">Live Connections</span>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-xl sm:text-2xl font-bold font-mono text-white">{product.activeUsers}</span>
                  <span className="text-[10px] text-slate-400">clients</span>
                </div>
                <span className="text-[9px] text-slate-500 block mt-1">Active nodes verifying licenses.</span>
              </div>

              <div className="glass-card-no-hover p-4.5 rounded-2xl border border-white/5">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-mono">Licenses Allocated</span>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-xl sm:text-2xl font-bold font-mono text-white">{productLicenses.length}</span>
                  <span className="text-[9px] text-slate-500 font-mono">/ {company?.plan === 'free' ? '50 max' : 'unlimited'}</span>
                </div>
                <span className="text-[9px] text-slate-500 block mt-1">Total license keys provisioned.</span>
              </div>

              <div className="glass-card-no-hover p-4.5 rounded-2xl border border-white/5">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-mono">Last Sync Received</span>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-xs sm:text-sm font-semibold text-slate-200 truncate">
                    {product.lastHeartbeat === 'Never' ? 'Never Connected' : formatTimeAgo(product.lastHeartbeat)}
                  </span>
                </div>
                <span className="text-[9px] text-slate-500 block mt-1.5">Last heartbeat telemetry.</span>
              </div>
            </div>

            {/* Heartbeat Status Timeline Component */}
            <div className="glass-card-no-hover p-5 rounded-2xl border border-white/5 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-200">Diagnostics Heatmap</h3>
                  <p className="text-[10px] text-slate-500">Visual ping history of server syncs (production/staging/dev).</p>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-white/[0.02] px-2 py-0.5 rounded border border-white/5">
                  Total Heartbeats: {productHeartbeats.length}
                </span>
              </div>

              {productHeartbeats.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  <Activity className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                  <p>No telemetry recorded yet. Connect this app to post heartbeat logs.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Visual Timeline Bar Grid */}
                  <div className="flex items-center gap-1.5 overflow-x-auto py-2">
                    {productHeartbeats.slice(0, 48).reverse().map((hb, i) => (
                      <div
                        key={hb.heartbeatId}
                        className={`h-7 w-2.5 rounded-sm flex-shrink-0 transition-all ${
                          hb.serverStatus === 'UP' 
                            ? (hb.environment === 'production' ? 'bg-emerald-500/70 hover:bg-emerald-400' : 'bg-indigo-500/70 hover:bg-indigo-400')
                            : 'bg-rose-500/80 hover:bg-rose-400 animate-pulse'
                        }`}
                        title={`Env: ${hb.environment} | Status: ${hb.serverStatus} | Users: ${hb.activeUsers} | Time: ${new Date(hb.timestamp).toLocaleString()}`}
                      />
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                    <span>Oldest pings (last 48)</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-emerald-500/70" /> Production UP</span>
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-indigo-500/70" /> Non-Prod UP</span>
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-rose-500/80" /> Server DOWN</span>
                    </div>
                    <span>Most recent</span>
                  </div>
                </div>
              )}
            </div>

            {/* Heartbeat detailed list & Version distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Ping logs (2 cols) */}
              <div className="glass-card-no-hover p-5 rounded-2xl border border-white/5 lg:col-span-2 space-y-4">
                <h3 className="text-xs sm:text-sm font-bold text-slate-200 border-b border-white/5 pb-2">Recent Heartbeat Log</h3>
                
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {productHeartbeats.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">No telemetry history logged.</p>
                  ) : (
                    productHeartbeats.slice(0, 15).map((hb) => (
                      <div 
                        key={hb.heartbeatId}
                        className="p-3 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`h-2 w-2 rounded-full ${hb.serverStatus === 'UP' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                          <div>
                            <span className="font-mono text-slate-200 block font-semibold">Env: {hb.environment}</span>
                            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Ping ID: {hb.heartbeatId}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 font-mono text-[10px] text-slate-400">
                          <div>
                            <span className="text-slate-500">USERS:</span> {hb.activeUsers}
                          </div>
                          <div>
                            <span className="text-slate-500">VER:</span> v{hb.version}
                          </div>
                          <div className="text-slate-500">
                            {new Date(hb.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Version History List */}
              <div className="glass-card-no-hover p-5 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-xs sm:text-sm font-bold text-slate-200 border-b border-white/5 pb-2">Version Audit</h3>
                <div className="space-y-3">
                  {Array.from(new Set([product.version, ...productHeartbeats.map(h => h.version)])).map((ver) => {
                    const matchedHeartbeats = productHeartbeats.filter(h => h.version === ver);
                    return (
                      <div key={ver} className="p-3 rounded-xl bg-white/[0.01] border border-white/5 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                          <span className="font-mono font-bold text-white">v{ver}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {matchedHeartbeats.length} check-ins
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================== 2. LICENSES TAB ==================== */}
        {activeTab === 'licenses' && (
          <div className="space-y-6">
            
            {/* Toolbar search & modal triggers */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search keys, customers..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-white/[0.02] border border-white/5 focus:border-indigo-500 focus:outline-none placeholder-slate-500 text-white"
                  value={licSearch}
                  onChange={(e) => setLicSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    className="text-xs bg-[#090d16] border border-white/5 rounded-xl px-2.5 py-1.5 focus:outline-none text-slate-300 focus:border-indigo-500"
                    value={licStatusFilter}
                    onChange={(e) => setLicStatusFilter(e.target.value)}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="REVOKED">Revoked</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  {!isReadOnly && (
                    <>
                      <button
                        onClick={() => {
                          if (customers.length > 0) setBulkCustId(customers[0].customerId);
                          setBulkGenOpen(true);
                        }}
                        className="glass-button px-3 py-1.5 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5" /> Bulk Generate
                      </button>
                      
                      <button
                        onClick={() => {
                          if (customers.length > 0) setSingleCustId(customers[0].customerId);
                          setSingleGenOpen(true);
                        }}
                        className="glass-button-primary px-3 py-1.5 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Issue Key
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* License list rendering */}
            <div className="glass-card-no-hover overflow-x-auto rounded-2xl border border-white/5">
              {filteredProductLicenses.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500">
                  <Key className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p>No license keys matching filters found for this product.</p>
                </div>
              ) : (
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.01] text-slate-400 font-medium select-none">
                      <th className="p-4">License Key</th>
                      <th className="p-4">Assigned Client</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Node Usage</th>
                      <th className="p-4">Expiry Date</th>
                      {!isReadOnly && <th className="p-4 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300 font-mono">
                    {filteredProductLicenses.map((lic) => {
                      const isCopied = copiedKeyId === lic.licenseId;
                      
                      let statusBadge = '';
                      if (lic.status === 'ACTIVE') {
                        statusBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10';
                      } else if (lic.status === 'SUSPENDED') {
                        statusBadge = 'bg-pink-500/10 text-pink-400 border-pink-500/10';
                      } else if (lic.status === 'EXPIRED') {
                        statusBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/10';
                      } else {
                        statusBadge = 'bg-red-500/10 text-red-500 border-red-500/10';
                      }

                      return (
                        <tr key={lic.licenseId} className="hover:bg-white/[0.01] transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white tracking-wider bg-white/[0.02] px-2 py-1.5 rounded-lg border border-white/5">
                                {lic.key}
                              </span>
                              <button
                                onClick={() => handleCopyText(lic.key, 'key')}
                                className="p-1 hover:bg-white/5 text-slate-500 hover:text-white rounded"
                              >
                                {copiedField === 'key' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>

                          <td className="p-4 font-sans font-semibold text-slate-200">
                            {lic.customerName}
                          </td>

                          <td className="p-4">
                            <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${statusBadge}`}>
                              {lic.status}
                            </span>
                          </td>

                          <td className="p-4 text-slate-400">
                            <span className="text-white font-bold">{lic.usageCount}</span> / {lic.usageLimit}
                          </td>

                          <td className="p-4 text-slate-400">
                            {new Date(lic.expiryDate).toLocaleDateString()}
                          </td>

                          {!isReadOnly && (
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {lic.status === 'SUSPENDED' ? (
                                  <button
                                    onClick={() => activateLicense(lic.licenseId)}
                                    className="p-1.5 rounded-lg border border-white/5 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 transition-all cursor-pointer"
                                    title="Activate"
                                  >
                                    <Play className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => suspendLicense(lic.licenseId)}
                                    className="p-1.5 rounded-lg border border-white/5 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 transition-all cursor-pointer"
                                    title="Suspend"
                                  >
                                    <Pause className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                <button
                                  onClick={() => {
                                    const nextYr = new Date();
                                    nextYr.setFullYear(nextYr.getFullYear() + 1);
                                    renewLicense(lic.licenseId, nextYr.toISOString());
                                  }}
                                  className="p-1.5 rounded-lg border border-white/5 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 transition-all cursor-pointer"
                                  title="Renew 1 Year"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => {
                                    if (confirm('Permanently delete license key?')) {
                                      deleteLicense(lic.licenseId);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg border border-white/5 hover:bg-rose-500/10 hover:text-rose-400 text-slate-500 transition-all cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        )}

        {/* ==================== 3. CUSTOMERS TAB ==================== */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            
            {/* Customer Search Toolbar */}
            <div className="flex gap-4 items-center justify-between p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search customer directory..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-white/[0.02] border border-white/5 focus:border-indigo-500 focus:outline-none placeholder-slate-500 text-white"
                  value={custSearch}
                  onChange={(e) => setCustSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Customers grid */}
            {filteredProductCustomers.length === 0 ? (
              <div className="glass-card-no-hover p-12 text-center text-slate-500 text-xs">
                <Users className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p>No customers hold active licenses for this application.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProductCustomers.map((c) => {
                  const custLics = productLicenses.filter(l => l.customerId === c.customerId);
                  return (
                    <div key={c.customerId} className="glass-card p-5 rounded-2xl flex flex-col justify-between border border-white/5">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8.5 h-8.5 rounded-lg bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold font-mono text-xs">
                            {c.name.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-white leading-tight">{c.name}</h4>
                            <span className="text-[10px] text-slate-500 font-medium">{c.company}</span>
                          </div>
                        </div>

                        <div className="text-xs text-slate-400 space-y-1">
                          <p className="truncate"><span className="text-slate-500 font-medium">Email:</span> {c.email}</p>
                          <p><span className="text-slate-500 font-medium">Customer ID:</span> <code className="text-[10px] bg-white/[0.01] px-1.5 py-0.5 rounded border border-white/5">{c.customerId}</code></p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-5">
                        <span className="text-[10px] text-slate-500">
                          Licenses: <b className="text-emerald-400 font-mono">{custLics.length} active</b>
                        </span>
                        
                        <span className="text-[9px] text-slate-500 font-mono">
                          Usage: <b className="text-white">{custLics.reduce((acc, curr) => acc + curr.usageCount, 0)} nodes</b>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ==================== 4. ANALYTICS TAB ==================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Active Users Trend (SVG curve) */}
              <div className="glass-card-no-hover p-5 rounded-2xl border border-white/5 lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-200">Active Node Utilization Curve</h3>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> +14.2% peak load</span>
                </div>
                
                {/* SVG Curve chart */}
                <div className="h-44 relative">
                  <svg className="w-full h-full" viewBox="0 0 500 150">
                    <defs>
                      <linearGradient id="gradientAnalytics" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Grid Lines */}
                    <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
                    <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
                    <line x1="0" y1="40" x2="500" y2="40" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
                    
                    {/* Area path */}
                    <path
                      d="M 0 130 C 50 110, 100 120, 150 90 C 200 60, 250 80, 300 50 C 350 20, 400 40, 450 30 L 500 20 L 500 150 L 0 150 Z"
                      fill="url(#gradientAnalytics)"
                    />
                    
                    {/* Curve line */}
                    <path
                      d="M 0 130 C 50 110, 100 120, 150 90 C 200 60, 250 80, 300 50 C 350 20, 400 40, 450 30 L 500 20"
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="2"
                    />

                    {/* Data nodes */}
                    <circle cx="150" cy="90" r="4" fill="#8b5cf6" />
                    <circle cx="300" cy="50" r="4" fill="#8b5cf6" />
                    <circle cx="450" cy="30" r="4" fill="#6366f1" />
                  </svg>
                  
                  <div className="absolute top-1 right-2 text-[9px] font-mono text-slate-500">
                    Max Capacity: 5k Nodes
                  </div>
                </div>

                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>Sync Interval 1</span>
                  <span>Sync Interval 12</span>
                  <span>Sync Interval 24 (Live Peak)</span>
                </div>
              </div>

              {/* Environment breakdown */}
              <div className="glass-card-no-hover p-5 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-xs sm:text-sm font-bold text-slate-200 border-b border-white/5 pb-2">Environment Distribution</h3>
                
                <div className="space-y-4 pt-2">
                  {[
                    { env: 'Production', count: productHeartbeats.filter(h => h.environment === 'production').length, color: 'bg-emerald-500' },
                    { env: 'Staging', count: productHeartbeats.filter(h => h.environment === 'staging').length, color: 'bg-indigo-500' },
                    { env: 'Development', count: productHeartbeats.filter(h => h.environment === 'development').length, color: 'bg-amber-500' },
                  ].map((item) => {
                    const total = productHeartbeats.length || 1;
                    const pct = Math.round((item.count / total) * 100);
                    return (
                      <div key={item.env} className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span className="font-semibold">{item.env}</span>
                          <span className="font-mono text-slate-500">{item.count} pings ({pct}%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
                          <div className={`h-full ${item.color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================== 5. SDK / CONNECTION TAB ==================== */}
        {activeTab === 'connection' && (
          <div className="space-y-6">
            
            {/* Credentials Info panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* SDK Secret & API Key view panel */}
              <div className="glass-card-no-hover p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <Key className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-slate-200">Integration Credentials</h3>
                </div>

                <div className="space-y-4">
                  {/* API Key */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider text-slate-400">
                      <span>API KEY (Client Token)</span>
                      <button
                        onClick={() => handleCopyText(product.apiKey, 'api')}
                        className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === 'api' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Copy
                      </button>
                    </div>
                    <div className="bg-[#030712] border border-white/5 rounded-xl p-3 font-mono text-xs text-slate-300 break-all select-all">
                      {product.apiKey}
                    </div>
                  </div>

                  {/* SDK Secret */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider text-slate-400">
                      <span>SDK SECRET (Server Auth Key)</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowSecret(!showSecret)}
                          className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1"
                        >
                          {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          {showSecret ? 'Hide' : 'Reveal'}
                        </button>
                        <button
                          onClick={() => handleCopyText(product.sdkSecret, 'secret')}
                          className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {copiedField === 'secret' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="bg-[#030712] border border-white/5 rounded-xl p-3 font-mono text-xs text-slate-300 break-all select-all">
                      {showSecret ? product.sdkSecret : '••••••••••••••••••••••••••••••••••••••••••••••••'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Endpoint URLs */}
              <div className="glass-card-no-hover p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-semibold text-slate-200">Gateway Target Endpoints</h3>
                </div>

                <div className="space-y-4 text-xs font-mono">
                  <div className="space-y-1">
                    <span className="text-slate-500 block uppercase text-[10px]">Heartbeat Ping URI</span>
                    <div className="p-2 rounded bg-[#030712] border border-white/5 text-slate-300 select-all">
                      https://api.aegisflow.io/v2/heartbeat
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 block uppercase text-[10px]">License Validation URI</span>
                    <div className="p-2 rounded bg-[#030712] border border-white/5 text-slate-300 select-all">
                      https://api.aegisflow.io/v2/licenses/validate
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Code Snippets Accordion */}
            <div className="glass-card-no-hover p-5 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-xs sm:text-sm font-bold text-slate-200 border-b border-white/5 pb-2">SDK Code Snippet Integrations</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Node.js */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-indigo-400 block">Node.js / Javascript SDK</span>
                  <div className="bg-[#030712] border border-white/5 rounded-xl p-4 font-mono text-[11px] text-slate-300 overflow-x-auto">
                    <span className="text-slate-500">// Initialize client</span><br />
                    <span className="text-indigo-400">import</span> AegisFlow <span className="text-indigo-400">from</span> <span className="text-emerald-400">'@aegisflow/sdk'</span>;<br /><br />
                    
                    <span className="text-indigo-400">const</span> aegis = <span className="text-indigo-400">new</span> AegisFlow(&#123;<br />
                    &nbsp;&nbsp;apiKey: <span className="text-emerald-400">"{product.apiKey}"</span>,<br />
                    &nbsp;&nbsp;sdkSecret: <span className="text-emerald-400">"{product.sdkSecret.substring(0, 12)}..."</span><br />
                    &#125;);<br /><br />

                    <span className="text-slate-500">// Validate license key</span><br />
                    <span className="text-indigo-400">const</span> res = <span className="text-indigo-400">await</span> aegis.validateLicense(<span className="text-emerald-400">"LIC-KEY-XXXX"</span>);<br />
                    console.log(res.isValid);
                  </div>
                </div>

                {/* Python */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-purple-400 block">Python SDK</span>
                  <div className="bg-[#030712] border border-white/5 rounded-xl p-4 font-mono text-[11px] text-slate-300 overflow-x-auto">
                    <span className="text-slate-500"># Import and initialize</span><br />
                    <span className="text-indigo-400">from</span> aegisflow <span className="text-indigo-400">import</span> AegisFlowSDK<br /><br />
                    
                    sdk = AegisFlowSDK(<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;api_key=<span className="text-emerald-400">"{product.apiKey}"</span>,<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;sdk_secret=<span className="text-emerald-400">"{product.sdkSecret.substring(0, 12)}..."</span><br />
                    )<br /><br />

                    <span className="text-slate-500"># Send heartbeat health logs</span><br />
                    sdk.start_heartbeat(<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;product_id=<span className="text-emerald-400">"{product.productId}"</span>,<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;version=<span className="text-emerald-400">"1.0.0"</span>,<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;environment=<span className="text-emerald-400">"production"</span><br />
                    )
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ==================== 6. AUDIT LOGS TAB ==================== */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            
            <div className="glass-card-no-hover p-5 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-xs sm:text-sm font-bold text-slate-200 border-b border-white/5 pb-2">Product Specific Activity Log</h3>
              
              <div className="space-y-2">
                {filteredLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No specific activity logs for this product registered.</p>
                ) : (
                  filteredLogs.map((l) => (
                    <div 
                      key={l.logId}
                      className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between gap-4 text-xs font-mono"
                    >
                      <div>
                        <span className="text-slate-300 block">{l.action}</span>
                        <span className="text-[10px] text-slate-500 mt-1 block">Triggered by: {l.employeeEmail || l.userId}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 self-start">
                        {new Date(l.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* ==================== 7. BILLING TAB ==================== */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            
            <div className="glass-card-no-hover p-5 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-xs sm:text-sm font-bold text-slate-200 border-b border-white/5 pb-2">Workspace Quota Trackers</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* Licenses limit progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span className="font-semibold">Workspace Licenses Allocation</span>
                    <span className="font-mono">{productLicenses.length} issued / {company?.plan === 'free' ? '50 keys maximum' : 'Unlimited'}</span>
                  </div>
                  <div className="h-2 w-full bg-white/[0.03] border border-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500" 
                      style={{ width: `${company?.plan === 'free' ? Math.min(100, (productLicenses.length / 50) * 100) : 100}%` }} 
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block">Limits are governed by your subscription plan. Upgrades can be managed from workspace settings.</span>
                </div>

                {/* Node usage limits */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span className="font-semibold">Active Telemetry Server Limits</span>
                    <span className="font-mono">{product.activeUsers} concurrent nodes / {company?.plan === 'free' ? '500 max' : 'Unlimited'}</span>
                  </div>
                  <div className="h-2 w-full bg-white/[0.03] border border-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500" 
                      style={{ width: `${company?.plan === 'free' ? Math.min(100, (product.activeUsers / 500) * 100) : 100}%` }} 
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block">Simultaneous heartbeats reporting pings. Excess nodes will return error responses.</span>
                </div>

              </div>

              {/* Warning if quota is high */}
              {company?.plan === 'free' && (productLicenses.length >= 40 || product.activeUsers >= 400) && (
                <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-2 text-amber-500 text-xs">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">Quota Limit Warning</span>
                    <span>Your free plan workspace is approaching its resource allotment limits. Upgrade to a paid plan inside the settings page to avoid transaction declines.</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ==================== 8. SETTINGS TAB ==================== */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main configurations form */}
            <form onSubmit={handleSaveSettings} className="glass-card-no-hover p-6 rounded-2xl lg:col-span-2 space-y-5 h-fit">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <SettingsIcon className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-slate-200">Asset Parameters</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Product Name</label>
                  <input
                    type="text"
                    required
                    disabled={isReadOnly}
                    className="w-full glass-input text-xs"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Asset Category</label>
                    <select
                      disabled={isReadOnly}
                      className="w-full bg-[#030712] border border-white/8 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                      value={editType}
                      onChange={(e) => setEditType(e.target.value as any)}
                    >
                      <option value="SaaS Application">SaaS Application</option>
                      <option value="REST API">REST API</option>
                      <option value="Internal Platform">Internal Platform</option>
                      <option value="Enterprise Software">Enterprise Software</option>
                      <option value="Cloud Service">Cloud Service</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Current Version</label>
                    <input
                      type="text"
                      required
                      disabled={isReadOnly}
                      className="w-full glass-input text-xs"
                      value={editVersion}
                      onChange={(e) => setEditVersion(e.target.value)}
                    />
                  </div>
                </div>

                {!isReadOnly ? (
                  <button 
                    type="submit"
                    className="glass-button-primary px-4 py-2 text-xs font-semibold cursor-pointer"
                  >
                    Save Changes
                  </button>
                ) : (
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Read-only mode: Only administrators can modify parameters.
                  </div>
                )}
              </div>
            </form>

            {/* Overrides and Danger Zone */}
            <div className="space-y-6">
              
              {/* Overrides */}
              <div className="glass-card-no-hover p-5 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-xs sm:text-sm font-bold text-slate-200 border-b border-white/5 pb-2">Administrative Overrides</h3>
                
                <div className="space-y-2 text-xs">
                  <p className="text-[10px] text-slate-500 mb-3">Force override the product diagnostic status regardless of telemetry checks.</p>
                  
                  {isReadOnly ? (
                    <div className="text-slate-500 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Actions disabled.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleOverrideStatus('SUSPENDED')}
                        className={`w-full text-left p-2.5 rounded-xl border border-pink-500/10 text-pink-400 flex items-center justify-between ${
                          product.status === 'SUSPENDED' ? 'bg-pink-500/10' : 'bg-transparent hover:bg-white/[0.01]'
                        }`}
                      >
                        <span>Force Suspend Product</span>
                        <span className="text-[9px] font-mono border border-pink-500/20 px-2 py-0.5 rounded">SUSPENDED</span>
                      </button>

                      <button
                        onClick={() => handleOverrideStatus('REVOKED')}
                        className={`w-full text-left p-2.5 rounded-xl border border-red-500/10 text-red-500 flex items-center justify-between ${
                          product.status === 'REVOKED' ? 'bg-red-500/10' : 'bg-transparent hover:bg-white/[0.01]'
                        }`}
                      >
                        <span>Force Revoke Product</span>
                        <span className="text-[9px] font-mono border border-red-500/20 px-2 py-0.5 rounded">REVOKED</span>
                      </button>

                      <button
                        onClick={() => handleOverrideStatus('LIVE')}
                        className={`w-full text-left p-2.5 rounded-xl border border-emerald-500/10 text-emerald-400 flex items-center justify-between ${
                          product.status === 'LIVE' ? 'bg-emerald-500/10' : 'bg-transparent hover:bg-white/[0.01]'
                        }`}
                      >
                        <span>Restore Normal status</span>
                        <span className="text-[9px] font-mono border border-emerald-500/20 px-2 py-0.5 rounded">LIVE</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="glass-card-no-hover p-5 rounded-2xl border border-rose-500/10 space-y-4">
                <h3 className="text-xs sm:text-sm font-bold text-rose-500 border-b border-rose-500/10 pb-2">Danger Zone</h3>
                
                <div className="space-y-4">
                  <p className="text-[10px] text-slate-500">Deletes the product and archives its SDK keys. Clients calling with these keys will receive validation fails.</p>
                  
                  {isReadOnly ? (
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" /> Deletions require owner permissions.
                    </div>
                  ) : (
                    <button
                      onClick={handleDeleteProduct}
                      className="w-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-500 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Delete Product Asset
                    </button>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* ==================== MODALS ==================== */}
      <AnimatePresence>
        
        {/* Heartbeat Simulator Modal */}
        {simOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSimOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#090d16] border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <h3 className="text-base font-semibold text-slate-200">SDK Heartbeat Simulator</h3>
                <button onClick={() => setSimOpen(false)} className="p-1 rounded hover:bg-white/5 border border-white/5 text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSimulate} className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-400 uppercase font-mono">Environment</label>
                    <select
                      className="w-full bg-[#030712] border border-white/8 rounded-xl p-2 text-xs text-slate-300 focus:outline-none"
                      value={simEnv}
                      onChange={(e) => setSimEnv(e.target.value as any)}
                    >
                      <option value="production">Production</option>
                      <option value="staging">Staging</option>
                      <option value="development">Development</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-400 uppercase font-mono">Server Status</label>
                    <select
                      className="w-full bg-[#030712] border border-white/8 rounded-xl p-2 text-xs text-slate-300 focus:outline-none"
                      value={simStatus}
                      onChange={(e) => setSimStatus(e.target.value as any)}
                    >
                      <option value="UP">UP (Online)</option>
                      <option value="DOWN">DOWN (Offline)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-400 uppercase font-mono">Simulate Connections</label>
                    <input
                      type="number"
                      required
                      min={0}
                      className="w-full glass-input text-xs"
                      value={simUsers}
                      onChange={(e) => setSimUsers(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-400 uppercase font-mono">Reporter Version</label>
                    <input
                      type="text"
                      required
                      className="w-full glass-input text-xs font-mono"
                      value={simVersion}
                      onChange={(e) => setSimVersion(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5 mt-6">
                  <button
                    type="button"
                    onClick={() => setSimOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="glass-button-primary px-4 py-2 text-xs font-semibold cursor-pointer"
                  >
                    Trigger Ping
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Single License Generation Modal */}
        {singleGenOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSingleGenOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#090d16] border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <h3 className="text-base font-semibold text-slate-200">Provision License Key</h3>
                <button onClick={() => setSingleGenOpen(false)} className="p-1 rounded hover:bg-white/5 border border-white/5 text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {customers.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  You must add a customer first to generate keys.
                </div>
              ) : (
                <form onSubmit={handleSingleGen} className="mt-4 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-400 uppercase">Assign to Customer</label>
                    <select
                      required
                      className="w-full bg-[#030712] border border-white/8 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none"
                      value={singleCustId}
                      onChange={(e) => setSingleCustId(e.target.value)}
                    >
                      {customers.map((c) => (
                        <option key={c.customerId} value={c.customerId}>{c.name} ({c.company})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-slate-400 uppercase">Node Usage Limit</label>
                      <input
                        type="number"
                        required
                        min={1}
                        className="w-full glass-input text-xs"
                        value={singleUsage}
                        onChange={(e) => setSingleUsage(e.target.value === '' ? '' : Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-slate-400 uppercase">Expiry Preset</label>
                      <select
                        className="w-full bg-[#030712] border border-white/8 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none"
                        value={singleExpiryPreset}
                        onChange={(e) => setSinglePreset(e.target.value as any)}
                      >
                        <option value="month">1 Month</option>
                        <option value="year">1 Year</option>
                        <option value="custom">Custom Date</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-400 uppercase">Expiration Date</label>
                    {singleExpiryPreset === 'custom' ? (
                      <input
                        type="date"
                        required
                        className="w-full glass-input text-xs"
                        value={singleExpiryDate}
                        onChange={(e) => setSingleExpiryDate(e.target.value)}
                      />
                    ) : (
                      <input
                        type="text"
                        disabled
                        className="w-full glass-input text-xs bg-white/[0.01] border-white/5 text-slate-400 cursor-not-allowed select-none"
                        value={new Date(singleExpiryDate).toLocaleDateString()}
                      />
                    )}
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5 mt-6">
                    <button
                      type="button"
                      onClick={() => setSingleGenOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="glass-button-primary px-4 py-2 text-xs font-semibold cursor-pointer"
                    >
                      Generate Key
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}

        {/* Bulk License Generation Modal */}
        {bulkGenOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBulkGenOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#090d16] border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <h3 className="text-base font-semibold text-slate-200">Bulk Generate Licenses</h3>
                <button onClick={() => setBulkGenOpen(false)} className="p-1 rounded hover:bg-white/5 border border-white/5 text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {customers.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  You must add a customer first to generate keys.
                </div>
              ) : (
                <form onSubmit={handleBulkGen} className="mt-4 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-400 uppercase">Assign to Customer</label>
                    <select
                      required
                      className="w-full bg-[#030712] border border-white/8 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none"
                      value={bulkCustId}
                      onChange={(e) => setBulkCustId(e.target.value)}
                    >
                      {customers.map((c) => (
                        <option key={c.customerId} value={c.customerId}>{c.name} ({c.company})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-slate-400 uppercase">Licenses Quantity</label>
                      <input
                        type="number"
                        required
                        min={1}
                        max={100}
                        className="w-full glass-input text-xs"
                        value={bulkQty}
                        onChange={(e) => setBulkQty(Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-slate-400 uppercase">Node Limit Per Key</label>
                      <input
                        type="number"
                        required
                        min={1}
                        className="w-full glass-input text-xs"
                        value={bulkUsage}
                        onChange={(e) => setBulkUsage(e.target.value === '' ? '' : Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-slate-400 uppercase">Expiry Term</label>
                      <select
                        className="w-full bg-[#030712] border border-white/8 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none"
                        value={bulkExpiryPreset}
                        onChange={(e) => setBulkPreset(e.target.value as any)}
                      >
                        <option value="month">1 Month</option>
                        <option value="year">1 Year</option>
                        <option value="custom">Custom Date</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-slate-400 uppercase">Expiration Date</label>
                      {bulkExpiryPreset === 'custom' ? (
                        <input
                          type="date"
                          required
                          className="w-full glass-input text-xs"
                          value={bulkExpiryDate}
                          onChange={(e) => setBulkExpiryDate(e.target.value)}
                        />
                      ) : (
                        <input
                          type="text"
                          disabled
                          className="w-full glass-input text-xs bg-white/[0.01] border-white/5 text-slate-400 cursor-not-allowed select-none"
                          value={new Date(bulkExpiryDate).toLocaleDateString()}
                        />
                      )}
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5 mt-6">
                    <button
                      type="button"
                      onClick={() => setBulkGenOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="glass-button-primary px-4 py-2 text-xs font-semibold cursor-pointer"
                    >
                      Bulk Issue Keys
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}

      </AnimatePresence>

    </div>
  );
}

// Inline SVG close icon to avoid importing issues
const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
