'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Building, 
  Key, 
  Eye, 
  EyeOff, 
  Plus, 
  Check, 
  Copy,
  Users,
  CreditCard,
  Bell,
  Clock,
  Lock,
  Mail,
  ShieldCheck,
  AlertTriangle,
  UserX,
  UserCheck
} from 'lucide-react';
import { useLicenseStore } from '../../../store/licenseStore';
import { getFirebaseInstance } from '../../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Employee } from '../../../types';

export default function SettingsPage() {
  const { 
    firebaseConfig, 
    user, 
    setUser, 
    company, 
    employees, 
    logs,
    inviteEmployee,
    deactivateEmployee,
    updateBillingPlan
  } = useLicenseStore();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'billing' | 'api' | 'notifications' | 'audit'>('profile');

  // Role authorization
  const isOwner = user?.role === 'owner';
  const isAdmin = user?.role === 'admin';
  const isViewer = user?.role === 'viewer';
  const isReadOnly = isViewer;

  // Account Form states
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyDomain, setCompanyDomain] = useState('');

  // API credentials states (persisted to localStorage)
  const [apiKeys, setApiKeys] = useState<{ id: string; label: string; value: string; created: string }[]>([]);
  const [showKeyId, setShowKeyId] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [newKeyLabel, setNewKeyLabel] = useState('');

  // Team Invite Form states
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Employee['role']>('viewer');

  // Notifications states
  const [notifyHeartbeat, setNotifyHeartbeat] = useState(true);
  const [notifyExpiry, setNotifyExpiry] = useState(true);
  const [notifyBilling, setNotifyBilling] = useState(true);
  const [notifyInvites, setNotifyInvites] = useState(false);

  // Load User Configuration
  useEffect(() => {
    if (user) {
      setProfileName(user.displayName || '');
      setProfileEmail(user.email || '');
      setCompanyName(user.company || '');
      setCompanyDomain(user.email?.split('@')[1] || '');
    }
  }, [user]);

  // Load notifications from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('aegisflow_notifications');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setNotifyHeartbeat(parsed.heartbeat ?? true);
          setNotifyExpiry(parsed.expiry ?? true);
          setNotifyBilling(parsed.billing ?? true);
          setNotifyInvites(parsed.invites ?? false);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const saveNotifications = (updated: any) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('aegisflow_notifications', JSON.stringify(updated));
    }
  };

  // Load API Keys from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('aegisflow_api_keys');
      if (saved) {
        try {
          setApiKeys(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse API keys:', e);
        }
      }
    }
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    const { db } = getFirebaseInstance(firebaseConfig);
    if (db && user?.uid) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          displayName: profileName,
          email: profileEmail
        });
        setUser({ ...user, displayName: profileName, email: profileEmail });
        
        // Log activity
        const store = useLicenseStore.getState();
        await (store as any).logActivity(`Updated user profile: "${profileName}"`);
        alert('Profile configuration saved successfully!');
      } catch (error) {
        console.error(error);
        alert('Failed to save profile.');
      }
    }
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    const { db } = getFirebaseInstance(firebaseConfig);
    if (db && user?.uid && company?.companyId) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          company: companyName
        });
        await updateDoc(doc(db, 'companies', company.companyId), {
          companyName: companyName
        });
        setUser({ ...user, company: companyName });
        
        // Log activity
        const store = useLicenseStore.getState();
        await (store as any).logActivity(`Renamed workspace company to "${companyName}"`);
        alert('Company profile updated successfully!');
      } catch (error) {
        console.error(error);
        alert('Failed to save company profile.');
      }
    }
  };

  const handleGenerateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!newKeyLabel.trim()) return;

    const randomHex = () => Math.random().toString(16).substring(2, 18).toUpperCase();
    const newKey = {
      id: `key-${Date.now()}`,
      label: newKeyLabel,
      value: `af_live_${randomHex()}${randomHex()}`,
      created: new Date().toISOString().split('T')[0]
    };

    const updated = [newKey, ...apiKeys];
    setApiKeys(updated);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('aegisflow_api_keys', JSON.stringify(updated));
    }
    setNewKeyLabel('');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleInviteEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!inviteEmail.trim()) return;

    // Billing limit checks
    if (company?.plan === 'free' && employees.length >= 3) {
      alert('Your Free plan is limited to 3 workspace employees. Upgrade to add more seats.');
      return;
    }

    try {
      await inviteEmployee(inviteEmail, inviteRole);
      setInviteEmail('');
      setInviteRole('viewer');
      alert(`Invitation sent to ${inviteEmail}.`);
    } catch (err) {
      alert('Failed to send employee invitation.');
    }
  };

  const handleToggleEmployeeStatus = async (employeeId: string, currentStatus: Employee['status']) => {
    if (isReadOnly) return;
    const targetStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await deactivateEmployee(employeeId, targetStatus);
      alert(`User status changed to ${targetStatus}.`);
    } catch (err) {
      alert('Failed to update employee status.');
    }
  };

  const handleUpgradePlan = async (plan: 'free' | 'starter' | 'growth' | 'enterprise') => {
    if (isReadOnly) return;
    if (!isOwner) {
      alert('Only the workspace Owner can modify subscription plans.');
      return;
    }
    if (company?.plan === plan) return;

    try {
      await updateBillingPlan(plan);
      alert(`Billing subscription tier updated to ${plan.toUpperCase()}.`);
    } catch (err) {
      alert('Billing update failed.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">Settings Panel</h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage your account profile, team invitations, subscriptions, API credentials, and notifications.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-white/5 space-x-6 text-xs sm:text-sm overflow-x-auto select-none scrollbar-none pb-0">
        {[
          { key: 'profile', label: 'Profile & Company', icon: User },
          { key: 'team', label: 'Team Workspace', icon: Users },
          { key: 'billing', label: 'Billing & Subscriptions', icon: CreditCard },
          { key: 'api', label: 'Security & API Keys', icon: Key },
          { key: 'notifications', label: 'Notifications', icon: Bell },
          { key: 'audit', label: 'Audit Trail', icon: Clock }
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`pb-3 px-1 border-b-2 font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === t.key 
                  ? 'border-indigo-500 text-indigo-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="mt-2">
        
        {/* ==================== Tab 1: Profile & Company Settings ==================== */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            {/* Profile */}
            <form onSubmit={handleSaveProfile} className="glass-card-no-hover p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <User className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-slate-200">Profile Configuration</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Administrator Name</label>
                  <input
                    type="text"
                    required
                    disabled={isReadOnly}
                    className="w-full glass-input text-xs"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    disabled={isReadOnly}
                    className="w-full glass-input text-xs"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                  />
                </div>

                {!isReadOnly ? (
                  <button 
                    type="submit"
                    className="glass-button-primary px-4 py-2 text-xs font-semibold cursor-pointer"
                  >
                    Save Profile Settings
                  </button>
                ) : (
                  <div className="text-[11px] text-slate-500 flex items-center gap-1"><Lock className="w-3 h-3" /> Profile modifications locked.</div>
                )}
              </div>
            </form>

            {/* Company Settings */}
            <form onSubmit={handleSaveCompany} className="glass-card-no-hover p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <Building className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-slate-200">Company Profile</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Company Name</label>
                  <input
                    type="text"
                    required
                    disabled={isReadOnly}
                    className="w-full glass-input text-xs"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Corporate Domain</label>
                  <input
                    type="text"
                    disabled
                    className="w-full glass-input text-xs bg-white/[0.02] border-white/5 text-slate-400 cursor-not-allowed"
                    value={companyDomain}
                  />
                </div>

                {!isReadOnly ? (
                  <button 
                    type="submit"
                    className="glass-button px-4 py-2 text-xs font-semibold cursor-pointer"
                  >
                    Update Company Profile
                  </button>
                ) : (
                  <div className="text-[11px] text-slate-500 flex items-center gap-1"><Lock className="w-3 h-3" /> Company modifications locked.</div>
                )}
              </div>
            </form>
          </div>
        )}

        {/* ==================== Tab 2: Team Members ==================== */}
        {activeTab === 'team' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* Invite employee */}
            <div className="glass-card-no-hover p-6 rounded-2xl space-y-4 h-fit">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <Users className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-slate-200">Invite Team Member</h3>
              </div>

              <form onSubmit={handleInviteEmployee} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400 uppercase">Employee Email</label>
                  <input
                    type="email"
                    required
                    disabled={isReadOnly}
                    placeholder="e.g. teammate@domain.com"
                    className="w-full glass-input text-xs"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400 uppercase">System Role</label>
                  <select
                    disabled={isReadOnly}
                    className="w-full bg-[#030712] border border-white/8 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                  >
                    <option value="viewer">Viewer (Read Only)</option>
                    <option value="manager">Manager (License Admin)</option>
                    <option value="admin">Administrator (Full Access)</option>
                  </select>
                </div>

                {!isReadOnly ? (
                  <button
                    type="submit"
                    className="w-full glass-button-primary py-2 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Send Invite
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full glass-button py-2 text-xs font-semibold cursor-not-allowed opacity-50"
                  >
                    <Lock className="w-4 h-4 mx-auto" />
                  </button>
                )}
              </form>
            </div>

            {/* List Employees */}
            <div className="glass-card-no-hover p-6 rounded-2xl lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h3 className="text-sm font-semibold text-slate-200">Workspace Employees</h3>
                <span className="text-[10px] text-slate-500">Total Seats: {employees.length}</span>
              </div>

              <div className="space-y-3">
                {employees.map((emp) => (
                  <div 
                    key={emp.employeeId} 
                    className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold font-mono text-xs">
                        {emp.email.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-200 block">{emp.email}</span>
                        <span className="text-[9px] text-slate-500 font-mono mt-0.5 block uppercase">Role: {emp.role} • Status: {emp.status}</span>
                      </div>
                    </div>

                    {!isReadOnly && emp.role !== 'owner' && emp.employeeId !== `emp_${user?.uid}` ? (
                      <button
                        onClick={() => handleToggleEmployeeStatus(emp.employeeId, emp.status)}
                        className={`p-1.5 rounded-lg border border-white/5 transition-all text-xs flex items-center gap-1 ${
                          emp.status === 'active' 
                            ? 'bg-rose-500/5 hover:bg-rose-500/10 text-rose-400' 
                            : 'bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400'
                        }`}
                      >
                        {emp.status === 'active' ? (
                          <>
                            <UserX className="w-3.5 h-3.5" /> Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5" /> Activate
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-600 font-mono italic">Protected</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== Tab 3: Billing Plan ==================== */}
        {activeTab === 'billing' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Active Plan Summary */}
            <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              <div className="flex gap-3 text-slate-300">
                <ShieldCheck className="w-10 h-10 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">Active Subscription: {company?.plan?.toUpperCase()} Tier</h4>
                  <span>Your current organization workspace is utilizing the {company?.plan} quotas. Upgrade or cancel subscription parameters below.</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] text-slate-400 font-mono">Invoice Status</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/10">ACTIVE ACCOUNT</span>
              </div>
            </div>

            {/* Plan Selector Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { key: 'free', name: 'Free Tier', price: '$0', desc: 'SaaS evaluation keys.', licenses: '50 Licenses', users: '500 Node Pings' },
                { key: 'starter', name: 'Starter Tier', price: '$49', desc: 'Indie developer launch kit.', licenses: '500 Licenses', users: '2k Node Pings' },
                { key: 'growth', name: 'Growth Tier', price: '$199', desc: 'Expanding commercial apps.', licenses: '5k Licenses', users: '10k Node Pings' },
                { key: 'enterprise', name: 'Enterprise SaaS', price: '$999', desc: 'High telemetry load systems.', licenses: 'Unlimited', users: 'Unlimited' },
              ].map((tier) => {
                const isCurrent = company?.plan === tier.key;
                return (
                  <div 
                    key={tier.key}
                    className={`p-5 rounded-2xl border flex flex-col justify-between h-full transition-all ${
                      isCurrent 
                        ? 'bg-indigo-500/5 border-indigo-500 shadow-lg' 
                        : 'bg-white/[0.01] border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-300">{tier.name}</span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500 text-white text-[8px] font-bold">CURRENT</span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1 mt-3.5 mb-2">
                        <span className="text-2xl font-bold font-mono text-white">{tier.price}</span>
                        <span className="text-[10px] text-slate-500 font-medium">/ month</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">{tier.desc}</p>
                      
                      <div className="mt-4 pt-4 border-t border-white/5 space-y-2 text-[10px] text-slate-400 font-mono">
                        <p>• {tier.licenses}</p>
                        <p>• {tier.users}</p>
                      </div>
                    </div>

                    {!isReadOnly && isOwner ? (
                      <button
                        onClick={() => handleUpgradePlan(tier.key as any)}
                        disabled={isCurrent}
                        className={`w-full py-2 mt-5 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                          isCurrent 
                            ? 'bg-white/5 text-slate-400 border border-white/5 cursor-not-allowed' 
                            : 'glass-button-primary hover:opacity-90'
                        }`}
                      >
                        {isCurrent ? 'Current Plan' : `Upgrade to ${tier.name}`}
                      </button>
                    ) : (
                      <button disabled className="w-full py-2 mt-5 text-[11px] text-slate-600 bg-white/[0.01] border border-white/5 rounded-xl cursor-not-allowed">
                        Locked
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== Tab 4: API Keys Management ==================== */}
        {activeTab === 'api' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* Generate Key */}
            <div className="glass-card-no-hover p-6 rounded-2xl space-y-4 h-fit">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <Key className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-slate-200">Generate Workspace API Key</h3>
              </div>

              <form onSubmit={handleGenerateApiKey} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Key Label Name</label>
                  <input
                    type="text"
                    required
                    disabled={isReadOnly}
                    placeholder="e.g. Production SDK Key"
                    className="w-full glass-input text-xs"
                    value={newKeyLabel}
                    onChange={(e) => setNewKeyLabel(e.target.value)}
                  />
                </div>
                {!isReadOnly ? (
                  <button
                    type="submit"
                    className="w-full glass-button-primary px-4 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Provision Key
                  </button>
                ) : (
                  <button disabled className="w-full glass-button py-2 text-xs font-semibold cursor-not-allowed opacity-50"><Lock className="w-4 h-4 mx-auto" /></button>
                )}
              </form>
            </div>

            {/* List Keys */}
            <div className="glass-card-no-hover p-6 rounded-2xl lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <h3 className="text-sm font-semibold text-slate-200">Active API Keys</h3>
                <span className="text-[10px] text-slate-500">Global workspace keys.</span>
              </div>

              <div className="space-y-3">
                {apiKeys.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No API Keys provisioned yet. Generate one to start validation queries.</p>
                ) : (
                  apiKeys.map((key) => {
                    const isVisible = showKeyId === key.id;
                    const isCopied = copiedKeyId === key.id;

                    return (
                      <div key={key.id} className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <span className="text-xs font-semibold text-slate-200 block">{key.label}</span>
                          <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">Issued: {key.created}</span>
                        </div>

                        <div className="flex items-center gap-2 bg-[#030712] border border-white/5 rounded-lg px-3 py-1.5 max-w-full md:max-w-[320px] justify-between">
                          <span className="font-mono text-xs text-slate-400 pr-2 select-all max-w-[200px] truncate">
                            {isVisible ? key.value : '••••••••••••••••••••••••••••••••'}
                          </span>
                          
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setShowKeyId(isVisible ? null : key.id)}
                              className="p-1 hover:bg-white/5 text-slate-500 hover:text-white rounded"
                            >
                              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            
                            <button
                              onClick={() => handleCopy(key.id, key.value)}
                              className="p-1 hover:bg-white/5 text-slate-500 hover:text-white rounded"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== Tab 5: Notifications ==================== */}
        {activeTab === 'notifications' && (
          <div className="glass-card-no-hover p-6 rounded-2xl max-w-2xl mx-auto space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <Bell className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-200">Email & Webhook Triggers</h3>
            </div>

            <div className="space-y-4">
              {[
                { state: notifyHeartbeat, setter: setNotifyHeartbeat, key: 'heartbeat', label: 'Heartbeat Offline Alert', desc: 'Email workspace team when a product status shifts to OFFLINE.' },
                { state: notifyExpiry, setter: setNotifyExpiry, key: 'expiry', label: 'License Expiry Alerts', desc: 'Send notification emails 30 days before client license keys expire.' },
                { state: notifyBilling, setter: setNotifyBilling, key: 'billing', label: 'Billing Invoices & Reports', desc: 'Deliver monthly transaction invoice receipts to the owner profile.' },
                { state: notifyInvites, setter: setNotifyInvites, key: 'invites', label: 'Employee Invitations Log', desc: 'Notify team administrators when a workspace invite is accepted.' },
              ].map((item) => (
                <div key={item.key} className="flex items-start justify-between gap-4 p-3 rounded-xl border border-white/5 bg-white/[0.01]">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">{item.label}</span>
                    <span className="text-[10px] text-slate-500 mt-1 block leading-normal">{item.desc}</span>
                  </div>

                  <input
                    type="checkbox"
                    disabled={isReadOnly}
                    className="h-4 w-4 mt-0.5 border-white/10 rounded accent-indigo-500 cursor-pointer"
                    checked={item.state}
                    onChange={(e) => {
                      const val = e.target.checked;
                      item.setter(val);
                      saveNotifications({
                        heartbeat: item.key === 'heartbeat' ? val : notifyHeartbeat,
                        expiry: item.key === 'expiry' ? val : notifyExpiry,
                        billing: item.key === 'billing' ? val : notifyBilling,
                        invites: item.key === 'invites' ? val : notifyInvites,
                      });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== Tab 6: Audit Trail ==================== */}
        {activeTab === 'audit' && (
          <div className="glass-card-no-hover p-6 rounded-2xl space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-sm font-semibold text-slate-200">Global Workspace Logs</h3>
              <span className="text-[10px] text-slate-500">Company Activity Logger</span>
            </div>

            <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No workspace activities logged yet.</p>
              ) : (
                logs.map((log) => (
                  <div 
                    key={log.logId}
                    className="p-3 rounded-xl border border-white/5 bg-white/[0.01] flex justify-between items-center gap-4 text-xs font-mono"
                  >
                    <div>
                      <span className="text-slate-300 block font-sans">{log.action}</span>
                      <span className="text-[9px] text-slate-500 block mt-1">Executor: {log.employeeEmail || log.userId} • Log ID: {log.logId}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 self-start">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
