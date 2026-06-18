'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Plus, 
  X,
  Mail,
  Building,
  Calendar,
  LayoutGrid,
  List,
  Lock
} from 'lucide-react';
import { useLicenseStore } from '../../../store/licenseStore';

export default function ClientsPage() {
  const { customers, addCustomer, licenses, user } = useLicenseStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');

  // Role authorization
  const isReadOnly = user?.role === 'viewer';

  // Filtering
  const filteredCustomers = customers.filter((c) => {
    return c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
           c.company.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!name.trim() || !email.trim() || !company.trim()) return;

    try {
      await addCustomer({
        name,
        email,
        company
      });

      // Reset
      setName('');
      setEmail('');
      setCompany('');
      setIsModalOpen(false);
    } catch (err) {
      alert('Failed to register customer.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Customers Directory</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Monitor client accounts, corporate domains, and active license subscriptions.
          </p>
        </div>
        
        {!isReadOnly ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="glass-button-primary flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Customer
          </button>
        ) : (
          <button
            disabled
            className="glass-button flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold self-start sm:self-auto cursor-not-allowed opacity-50 select-none"
          >
            <Lock className="w-3.5 h-3.5" /> Add Customer
          </button>
        )}
      </div>

      {/* Search & Layout toggle */}
      <div className="flex gap-4 items-center justify-between p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search customers by name, email, company..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-white/[0.02] border border-white/5 focus:border-indigo-500 focus:outline-none placeholder-slate-500 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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

      {/* Grid or List View rendering */}
      {filteredCustomers.length === 0 ? (
        <div className="glass-card-no-hover p-12 text-center rounded-2xl">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No customers registered</h3>
          <p className="text-xs text-slate-500 mt-1">Register a customer to start generating license keys.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((c) => {
            // Calculate license counts dynamically from licenses state
            const customerLicenses = licenses.filter((l) => l.customerId === c.customerId);
            const activeLicCount = customerLicenses.filter((l) => l.status === 'ACTIVE').length;
            const logo = c.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

            return (
              <motion.div
                key={c.customerId}
                layout
                className="glass-card p-5 rounded-2xl flex flex-col justify-between border border-white/5"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold font-mono text-xs">
                      {logo}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white leading-tight">{c.name}</h4>
                      <span className="text-[10px] text-slate-500 font-medium">{c.company}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{c.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      <span>{c.company}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-5">
                  <div className="flex items-center gap-3.5 text-[10px] text-slate-500">
                    <div>
                      <span className="text-emerald-400 font-semibold font-mono">{activeLicCount}</span> active
                    </div>
                    <div>
                      <span className="text-slate-300 font-semibold font-mono">{customerLicenses.length}</span> total
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Renewal: {c.renewalDate || 'None'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* List Mode / Table View */
        <motion.div 
          layout 
          className="glass-card-no-hover overflow-x-auto rounded-2xl border border-white/5"
        >
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01] text-slate-400 font-medium select-none">
                <th className="p-4">Customer</th>
                <th className="p-4">Contact Email</th>
                <th className="p-4">Company</th>
                <th className="p-4">Active Subscriptions</th>
                <th className="p-4">Total Licenses</th>
                <th className="p-4">Renewal Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredCustomers.map((c) => {
                const customerLicenses = licenses.filter((l) => l.customerId === c.customerId);
                const activeLicCount = customerLicenses.filter((l) => l.status === 'ACTIVE').length;
                const logo = c.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                return (
                  <tr key={c.customerId} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold font-mono text-[10px]">
                        {logo}
                      </div>
                      <span className="font-semibold text-white">{c.name}</span>
                    </td>
                    <td className="p-4 text-slate-400">{c.email}</td>
                    <td className="p-4 text-slate-300">{c.company}</td>
                    <td className="p-4 font-mono text-emerald-400 font-semibold">{activeLicCount}</td>
                    <td className="p-4 font-mono">{customerLicenses.length}</td>
                    <td className="p-4 text-slate-500 font-mono">
                      {c.renewalDate || 'None'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Add Customer Modal Overlay */}
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
                <h3 className="text-base font-semibold text-slate-200">Register New Customer</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded hover:bg-white/5 border border-white/5 text-slate-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddCustomer} className="mt-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Customer Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mitchell Baker"
                    className="w-full glass-input text-xs"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Contact Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. mitchell@stripe.com"
                    className="w-full glass-input text-xs"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Company / Organization</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stripe Inc."
                    className="w-full glass-input text-xs"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
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
                    Register Customer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

