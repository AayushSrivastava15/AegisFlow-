'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, 
  Search, 
  Plus, 
  X,
  Copy,
  Check,
  Calendar,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Trash2,
  Filter,
  User,
  Package,
  Layers
} from 'lucide-react';
import { useLicenseStore } from '../../../store/licenseStore';

export default function LicensesPage() {
  const { 
    licenses, 
    products, 
    clients, 
    generateLicense, 
    suspendLicense, 
    activateLicense, 
    renewLicense, 
    deleteLicense 
  } = useLicenseStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [productFilter, setProductFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Form states for license generation
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [usageLimit, setUsageLimit] = useState(100);
  const [expiryPreset, setExpiryPreset] = useState<'month' | 'year' | 'custom'>('year');
  const [expiryDate, setExpiryDate] = useState(() => {
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    return oneYearLater.toISOString().split('T')[0];
  });

  const setPresetDate = (preset: 'month' | 'year' | 'custom') => {
    setExpiryPreset(preset);
    const date = new Date();
    if (preset === 'month') {
      date.setMonth(date.getMonth() + 1);
      setExpiryDate(date.toISOString().split('T')[0]);
    } else if (preset === 'year') {
      date.setFullYear(date.getFullYear() + 1);
      setExpiryDate(date.toISOString().split('T')[0]);
    }
  };

  // Unique lists for filtering
  const productOptions = ['All', ...new Set(licenses.map((l) => l.productName))];

  // Filtering logic
  const filteredLicenses = licenses.filter((l) => {
    const matchesSearch = l.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || l.status === statusFilter.toLowerCase();
    const matchesProduct = productFilter === 'All' || l.productName === productFilter;
    return matchesSearch && matchesStatus && matchesProduct;
  });

  const handleCopyKey = (id: string, keyString: string) => {
    navigator.clipboard.writeText(keyString);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleGenerateLicense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !selectedProductId) return;

    const client = clients.find(c => c.id === selectedClientId);
    const product = products.find(p => p.id === selectedProductId);

    if (!client || !product) return;

    generateLicense({
      clientId: client.id,
      clientName: client.name,
      productId: product.id,
      productName: product.name,
      status: 'active',
      expiresAt: new Date(expiryDate).toISOString(),
      usageLimit: Number(usageLimit),
    });

    // Reset form
    setSelectedClientId('');
    setSelectedProductId('');
    setUsageLimit(100);
    setIsModalOpen(false);
  };

  const handleRenew = (id: string) => {
    // Renew extends expiration by 1 year from today
    const newExpiry = new Date();
    newExpiry.setFullYear(newExpiry.getFullYear() + 1);
    renewLicense(id, newExpiry.toISOString());
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">Issued Licenses</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Provision license keys, view usage volume, toggle suspensions, and process client renewals.
          </p>
        </div>
        
        <button
          onClick={() => {
            // Set defaults if lists are populated
            if (clients.length > 0) setSelectedClientId(clients[0].id);
            if (products.length > 0) setSelectedProductId(products[0].id);
            setIsModalOpen(true);
          }}
          className="glass-button-primary flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Generate License
        </button>
      </div>

      {/* Filters and Search toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by key, client name, or product..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-white/[0.02] border border-white/5 focus:border-indigo-500 focus:outline-none placeholder-slate-500 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            className="w-full text-xs bg-[#090d16] border border-white/5 rounded-xl px-2.5 py-1.5 focus:outline-none text-slate-300 focus:border-indigo-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Expiring">Expiring Soon</option>
          </select>
        </div>

        {/* Product filter */}
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          <select
            className="w-full text-xs bg-[#090d16] border border-white/5 rounded-xl px-2.5 py-1.5 focus:outline-none text-slate-300 focus:border-indigo-500"
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
          >
            {productOptions.map((prod) => (
              <option key={prod} value={prod}>{prod === 'All' ? 'All Products' : prod}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Licenses Data Table */}
      <div className="glass-card-no-hover overflow-x-auto rounded-2xl border border-white/5">
        {filteredLicenses.length === 0 ? (
          <div className="p-12 text-center">
            <Key className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-300">No licenses found</h3>
            <p className="text-xs text-slate-500 mt-1">Generate a new license key to get started.</p>
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01] text-slate-400 font-medium select-none">
                <th className="p-4">License Key</th>
                <th className="p-4">Client</th>
                <th className="p-4">Product</th>
                <th className="p-4">Status</th>
                <th className="p-4">Usage Limit</th>
                <th className="p-4">Expires On</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredLicenses.map((lic) => {
                const isCopied = copiedKeyId === lic.id;
                
                // Status color rendering
                let statusBadge = '';
                if (lic.status === 'active') {
                  statusBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10';
                } else if (lic.status === 'suspended') {
                  statusBadge = 'bg-rose-500/10 text-rose-400 border-rose-500/10';
                } else {
                  statusBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/10';
                }

                return (
                  <tr key={lic.id} className="hover:bg-white/[0.01] transition-colors">
                    
                    {/* License key with copy CTA */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white tracking-wider bg-white/[0.02] px-2.5 py-1.5 rounded-lg border border-white/5">
                          {lic.key}
                        </span>
                        <button
                          onClick={() => handleCopyKey(lic.id, lic.key)}
                          className="p-1.5 rounded-lg border border-white/5 hover:bg-white/5 text-slate-500 hover:text-white transition-all cursor-pointer"
                          title="Copy license key"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    {/* Client company */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <div>
                          <span className="font-semibold text-slate-200 block">{lic.clientName}</span>
                        </div>
                      </div>
                    </td>

                    {/* Product name */}
                    <td className="p-4 font-medium text-slate-300">
                      <div className="flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-slate-500" />
                        <span>{lic.productName}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <span className={`text-[10px] font-semibold border px-2.5 py-0.5 rounded-full capitalize ${statusBadge}`}>
                        {lic.status === 'expiring' ? 'expiring soon' : lic.status}
                      </span>
                    </td>

                    {/* Usage volume details */}
                    <td className="p-4 font-mono text-slate-400">
                      <span className="text-slate-200 font-semibold">{lic.usageCount}</span> / {lic.usageLimit}
                    </td>

                    {/* Expiration date */}
                    <td className="p-4 text-slate-400 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(lic.expiresAt).toLocaleDateString()}</span>
                      </div>
                    </td>

                    {/* Operational Action items */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Toggle Suspend/Activate */}
                        {lic.status === 'suspended' ? (
                          <button
                            onClick={() => activateLicense(lic.id)}
                            className="p-1.5 rounded-lg border border-white/5 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 transition-all cursor-pointer"
                            title="Activate license"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => suspendLicense(lic.id)}
                            className="p-1.5 rounded-lg border border-white/5 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 transition-all cursor-pointer"
                            title="Suspend license"
                          >
                            <Pause className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Renew */}
                        <button
                          onClick={() => handleRenew(lic.id)}
                          className="p-1.5 rounded-lg border border-white/5 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 transition-all cursor-pointer"
                          title="Renew license for 1 year"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to permanently delete this license key?')) {
                              deleteLicense(lic.id);
                            }
                          }}
                          className="p-1.5 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-rose-500/10 hover:text-rose-400 text-slate-500 transition-all cursor-pointer"
                          title="Delete license key"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Generate License Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
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
                <h3 className="text-base font-semibold text-slate-200">Provision License Key</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded hover:bg-white/5 border border-white/5 text-slate-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {clients.length === 0 || products.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500 space-y-2">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                  <p>You must have at least one product and one client registered to generate a license.</p>
                </div>
              ) : (
                <form onSubmit={handleGenerateLicense} className="mt-4 space-y-4">
                  
                  {/* Select Client */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Assign to Client</label>
                    <select
                      required
                      className="w-full bg-[#030712] border border-white/8 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                      ))}
                    </select>
                  </div>

                  {/* Select Product */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Select Product</label>
                    <select
                      required
                      className="w-full bg-[#030712] border border-white/8 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Activation limits & Expiration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Node Usage Limit</label>
                      <input
                        type="number"
                        required
                        min={1}
                        max={10000}
                        className="w-full glass-input text-xs"
                        value={usageLimit}
                        onChange={(e) => setUsageLimit(Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Expiry Term</label>
                      <select
                        className="w-full bg-[#030712] border border-white/8 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                        value={expiryPreset}
                        onChange={(e) => setPresetDate(e.target.value as any)}
                      >
                        <option value="month">1 Month</option>
                        <option value="year">1 Year</option>
                        <option value="custom">Custom Date</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Expiration Date</label>
                    {expiryPreset === 'custom' ? (
                      <input
                        type="date"
                        required
                        className="w-full glass-input text-xs"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                      />
                    ) : (
                      <input
                        type="text"
                        disabled
                        className="w-full glass-input text-xs bg-white/[0.01] border-white/5 text-slate-400 cursor-not-allowed select-none"
                        value={new Date(expiryDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      />
                    )}
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white border border-transparent hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="glass-button-primary px-4 py-2 text-xs font-semibold cursor-pointer"
                    >
                      Generate License
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
