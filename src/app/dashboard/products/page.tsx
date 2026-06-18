'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Search, 
  Plus, 
  ChevronRight, 
  X,
  Layers,
  Activity,
  CheckCircle,
  AlertTriangle,
  Lock,
  Copy,
  Check,
  TrendingUp,
  Cpu,
  RefreshCw,
  Clock,
  Sparkles,
  ShieldCheck,
  LayoutGrid,
  List
} from 'lucide-react';
import { useLicenseStore } from '../../../store/licenseStore';
import { Product } from '../../../types';

export default function ProductsPage() {
  const { products, addProduct, licenses } = useLicenseStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Registration Wizard Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<Product['type']>('SaaS Application');
  const [step, setStep] = useState<'input' | 'credentials'>('input');
  
  // Credentials reference for copying in step 2
  const [createdKeys, setCreatedKeys] = useState<{ id: string; apiKey: string; secret: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<'api' | 'secret' | null>(null);

  // Filter types
  const productTypes = ['All', 'SaaS Application', 'REST API', 'Internal Platform', 'Enterprise Software', 'Cloud Service'];

  // Scoped Filtering
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || p.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await addProduct({
        name,
        type
      });

      // Retrieve the newly created product to show its keys
      const allProducts = useLicenseStore.getState().products;
      const newProd = allProducts[0]; // Sorted by createdAt desc, so it is index 0
      
      if (newProd) {
        setCreatedKeys({
          id: newProd.productId,
          apiKey: newProd.apiKey,
          secret: newProd.sdkSecret
        });
        setStep('credentials');
      } else {
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to register product.');
    }
  };

  const handleCopyText = (text: string, field: 'api' | 'secret') => {
    navigator.clipboard.writeText(text);
    setCopiedKey(field);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCloseModal = () => {
    setName('');
    setType('SaaS Application');
    setStep('input');
    setCreatedKeys(null);
    setIsModalOpen(false);
  };

  // Helper for Status indicator tags
  const getStatusBadge = (status: Product['status']) => {
    switch (status) {
      case 'LIVE':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
          </span>
        );
      case 'WARNING':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/10">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            WARNING
          </span>
        );
      case 'OFFLINE':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/10">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            OFFLINE
          </span>
        );
      case 'RENEWAL_NEEDED':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/10">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
            RENEWAL
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/10">
            <span className="h-1.5 w-1.5 rounded-full bg-pink-500" />
            SUSPENDED
          </span>
        );
      case 'REVOKED':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-950/20 text-red-700 border border-red-900/10">
            <span className="h-1.5 w-1.5 rounded-full bg-red-700" />
            REVOKED
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/10">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
            PENDING
          </span>
        );
    }
  };

  // Helper to format last heartbeat
  const formatHeartbeatTime = (isoString: string) => {
    if (!isoString || isoString === 'Never') return 'Never';
    try {
      const diffMs = new Date().getTime() - new Date(isoString).getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) {
        const mins = Math.floor(diffMs / (1000 * 60));
        return mins <= 1 ? 'Just now' : `${mins} mins ago`;
      }
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } catch (e) {
      return 'Never';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">Products Catalog</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Provision connected applications, generate SDK credentials, and monitor server heartbeat metrics.
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="glass-button-primary flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Provision Product
        </button>
      </div>

      {/* Filters & Searches */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search catalog by name..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-white/[0.02] border border-white/5 focus:border-indigo-500 focus:outline-none placeholder-slate-500 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <select
              className="text-xs bg-[#090d16] border border-white/5 rounded-xl px-2.5 py-1.5 focus:outline-none text-slate-300 focus:border-indigo-500"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {productTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center border border-white/5 bg-white/[0.02] rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Catalog Render */}
      {filteredProducts.length === 0 ? (
        <div className="glass-card-no-hover p-12 text-center rounded-2xl">
          <Package className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No applications registered</h3>
          <p className="text-xs text-slate-500 mt-1">Register a product asset and connect it via the SDK to start monitoring.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProducts.map((p) => {
            const productLicenses = licenses.filter((l) => l.productId === p.productId);
            const activeLicCount = productLicenses.filter((l) => l.status === 'ACTIVE').length;
            
            return (
              <Link key={p.productId} href={`/dashboard/products/${p.productId}`} className="block">
                <motion.div
                  layout
                  className="glass-card p-5 rounded-2xl flex flex-col justify-between h-full cursor-pointer border border-white/5 hover:border-indigo-500/20 transition-all duration-300"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 border border-indigo-500/10 flex items-center justify-center text-indigo-400">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">{p.name}</h4>
                          <span className="text-[9px] text-slate-500 font-mono tracking-wider block mt-0.5">ID: {p.productId}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        {getStatusBadge(p.status)}
                        <span className="text-[9px] text-slate-500 font-mono">v{p.version}</span>
                      </div>
                    </div>

                    {/* Middle: Diagnostic Grid */}
                    <div className="grid grid-cols-3 gap-3 p-3 bg-white/[0.01] border border-white/5 rounded-xl text-center select-none">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">Users</span>
                        <span className="text-xs font-bold text-slate-300 mt-1 block font-mono">{p.activeUsers}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">Licenses</span>
                        <span className="text-xs font-bold text-slate-300 mt-1 block font-mono">{productLicenses.length}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">Health</span>
                        <span className={`text-xs font-bold mt-1 block font-mono ${
                          p.healthScore >= 90 ? 'text-emerald-400' : (p.healthScore >= 70 ? 'text-amber-400' : 'text-rose-500')
                        }`}>{p.healthScore}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer metadata */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-3.5 mt-5 text-[10px] text-slate-500 font-mono">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-600" />
                      <span>Last Heartbeat: <b>{formatHeartbeatTime(p.lastHeartbeat)}</b></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-600">•</span>
                      <span className="text-indigo-400/80 font-sans font-medium">{p.type}</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* List Mode Table */
        <motion.div layout className="glass-card-no-hover overflow-x-auto rounded-2xl border border-white/5">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01] text-slate-400 font-medium select-none">
                <th className="p-4">Application name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4">Version</th>
                <th className="p-4">Active Users</th>
                <th className="p-4">Licenses</th>
                <th className="p-4">Health Score</th>
                <th className="p-4">Last Sync</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredProducts.map((p) => {
                const productLicenses = licenses.filter((l) => l.productId === p.productId);
                return (
                  <tr key={p.productId} className="hover:bg-white/[0.01] transition-colors cursor-pointer">
                    <td className="p-4">
                      <Link href={`/dashboard/products/${p.productId}`} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center text-indigo-400">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-white block hover:underline">{p.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono block">ID: {p.productId}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] text-slate-400 border border-white/5 bg-white/[0.02] px-2 py-0.5 rounded">
                        {p.type}
                      </span>
                    </td>
                    <td className="p-4">{getStatusBadge(p.status)}</td>
                    <td className="p-4 font-mono font-medium text-slate-400">v{p.version}</td>
                    <td className="p-4 font-mono font-semibold">{p.activeUsers}</td>
                    <td className="p-4 font-mono font-semibold">{productLicenses.length}</td>
                    <td className="p-4 font-mono">
                      <span className={p.healthScore >= 90 ? 'text-emerald-400' : (p.healthScore >= 70 ? 'text-amber-400' : 'text-rose-500')}>
                        {p.healthScore}%
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 font-mono">
                      {formatHeartbeatTime(p.lastHeartbeat)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Add Product Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#090d16] border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <h3 className="text-base font-semibold text-slate-200">
                  {step === 'input' ? 'Register SaaS Asset' : 'Credentials Provisioned'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-1 rounded hover:bg-white/5 border border-white/5 text-slate-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {step === 'input' ? (
                <form onSubmit={handleCreateProduct} className="mt-4 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Product Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SupaAuth Gateway"
                      className="w-full glass-input text-xs"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Application Type</label>
                    <select
                      className="w-full bg-[#030712] border border-white/8 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                    >
                      <option value="SaaS Application">SaaS Application</option>
                      <option value="REST API">REST API</option>
                      <option value="Internal Platform">Internal Platform</option>
                      <option value="Enterprise Software">Enterprise Software</option>
                      <option value="Cloud Service">Cloud Service</option>
                    </select>
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5 mt-6">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white border border-transparent hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="glass-button-primary px-4 py-2 text-xs font-semibold cursor-pointer"
                    >
                      Provision Credentials
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-4 space-y-5">
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex gap-2.5 text-emerald-400 text-xs leading-normal">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block mb-0.5">Asset Created Successfully</span>
                      <span>Integrate this product into your codebase using the secrets below. They can also be accessed later from the product details panel.</span>
                    </div>
                  </div>

                  {/* API Key */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider text-slate-400">
                      <span>API KEY (Client Secret)</span>
                      <button
                        onClick={() => handleCopyText(createdKeys?.apiKey || '', 'api')}
                        className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        {copiedKey === 'api' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Copy
                      </button>
                    </div>
                    <div className="bg-[#030712] border border-white/5 rounded-xl p-3 font-mono text-xs text-slate-300 break-all select-all">
                      {createdKeys?.apiKey}
                    </div>
                  </div>

                  {/* SDK Secret */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider text-slate-400">
                      <span>SDK SECRET (Server Secret)</span>
                      <button
                        onClick={() => handleCopyText(createdKeys?.secret || '', 'secret')}
                        className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        {copiedKey === 'secret' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Copy
                      </button>
                    </div>
                    <div className="bg-[#030712] border border-white/5 rounded-xl p-3 font-mono text-xs text-slate-300 break-all select-all">
                      {createdKeys?.secret}
                    </div>
                  </div>

                  <button
                    onClick={handleCloseModal}
                    className="w-full glass-button-primary py-2.5 mt-4 text-xs font-semibold cursor-pointer"
                  >
                    Go to Dashboard Catalog
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
