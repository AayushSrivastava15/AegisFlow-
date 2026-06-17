'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  ChevronRight, 
  X,
  CreditCard,
  Layers,
  Activity,
  ShieldAlert,
  RefreshCw,
  LayoutGrid,
  List
} from 'lucide-react';
import { useLicenseStore } from '../../../store/licenseStore';

const iconMap: { [key: string]: React.ComponentType<any> } = {
  ShieldAlert,
  Activity,
  RefreshCw,
  CreditCard,
  Package
};

export default function ProductsPage() {
  const { products, addProduct } = useLicenseStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Security');
  const [priceAmount, setPriceAmount] = useState('99');
  const [priceInterval, setPriceInterval] = useState<'mo' | 'yr'>('mo');
  const [icon, setIcon] = useState('Package');

  // Categories extraction
  const categories = ['All', ...new Set(products.map((p) => p.category))];

  // Filtering
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formattedPrice = `$${priceAmount || '0'}/${priceInterval}`;

    addProduct({
      name,
      description,
      category,
      price: formattedPrice,
      icon
    });

    // Reset
    setName('');
    setDescription('');
    setCategory('Security');
    setPriceAmount('99');
    setPriceInterval('mo');
    setIcon('Package');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Products Catalog</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Define, price, and track licensing stats for your application endpoints.
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="glass-button-primary flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-white/[0.02] border border-white/5 focus:border-indigo-500 focus:outline-none placeholder-slate-500 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Categories select list */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              className="text-xs bg-[#090d16] border border-white/5 rounded-xl px-2.5 py-1.5 focus:outline-none text-slate-300 focus:border-indigo-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Grid/List toggles */}
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

      {/* Grid or List View rendering */}
      {filteredProducts.length === 0 ? (
        <div className="glass-card-no-hover p-12 text-center rounded-2xl">
          <Package className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No products found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search terms.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map((p) => {
            const IconComponent = iconMap[p.icon] || Package;
            return (
              <motion.div
                key={p.id}
                layout
                className="glass-card p-5 rounded-2xl flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">{p.name}</h4>
                        <span className="text-[10px] text-indigo-400/80 font-mono bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/5">
                          {p.category}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-300">{p.price}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed min-h-[40px] line-clamp-2">
                    {p.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-5">
                  <div className="flex items-center gap-4 text-[11px] text-slate-500">
                    <div>
                      <span className="text-slate-300 font-mono font-semibold">{p.clientCount}</span> clients
                    </div>
                    <div>
                      <span className="text-slate-300 font-mono font-semibold">{p.licenseCount}</span> licenses
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono">
                    Created {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* List Mode / Modern Data Table */
        <motion.div 
          layout 
          className="glass-card-no-hover overflow-x-auto rounded-2xl border border-white/5"
        >
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01] text-slate-400 font-medium select-none">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Licenses Issued</th>
                <th className="p-4">Registered Clients</th>
                <th className="p-4">Date Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center text-indigo-400">
                      {React.createElement(iconMap[p.icon] || Package, { className: 'w-4 h-4' })}
                    </div>
                    <div>
                      <span className="font-semibold text-white block">{p.name}</span>
                      <span className="text-[10px] text-slate-500 block truncate max-w-[200px]">{p.description}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] text-slate-400 border border-white/5 bg-white/[0.02] px-2 py-0.5 rounded">
                      {p.category}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-200">{p.price}</td>
                  <td className="p-4 font-mono">{p.licenseCount}</td>
                  <td className="p-4 font-mono">{p.clientCount}</td>
                  <td className="p-4 text-slate-500 font-mono">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
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
                <h3 className="text-base font-semibold text-slate-200">Register New Product</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded hover:bg-white/5 border border-white/5 text-slate-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="mt-4 space-y-4">
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
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Brief details about capabilities or billing tiers."
                    className="w-full glass-input text-xs resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Category</label>
                    <select
                      className="w-full bg-[#030712] border border-white/8 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="Security">Security</option>
                      <option value="Analytics">Analytics</option>
                      <option value="Productivity">Productivity</option>
                      <option value="Finance">Finance</option>
                      <option value="Infrastructure">Infrastructure</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Price / Rate</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 font-mono select-none">$</span>
                        <input
                          type="number"
                          required
                          min="0"
                          placeholder="99"
                          className="w-full glass-input pl-8 text-xs font-mono"
                          value={priceAmount}
                          onChange={(e) => setPriceAmount(e.target.value)}
                        />
                      </div>
                      <div className="flex bg-[#030712] border border-white/8 rounded-xl p-1 items-center">
                        <button
                          type="button"
                          onClick={() => setPriceInterval('mo')}
                          className={`px-3 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                            priceInterval === 'mo'
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          Mo
                        </button>
                        <button
                          type="button"
                          onClick={() => setPriceInterval('yr')}
                          className={`px-3 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                            priceInterval === 'yr'
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          Yr
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Asset Icon</label>
                  <select
                    className="w-full bg-[#030712] border border-white/8 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                  >
                    <option value="Package">Standard Box</option>
                    <option value="ShieldAlert">Shield (Security)</option>
                    <option value="Activity">Pulse (Analytics)</option>
                    <option value="RefreshCw">Sync (Productivity)</option>
                    <option value="CreditCard">Card (Finance)</option>
                  </select>
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
                    Add Product
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
