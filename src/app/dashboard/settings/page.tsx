'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Building, 
  Key, 
  Flame, 
  Eye, 
  EyeOff, 
  Plus, 
  Check, 
  Copy,
  Info
} from 'lucide-react';
import { useLicenseStore } from '../../../store/licenseStore';

export default function SettingsPage() {
  const { firebaseConfig, updateFirebaseConfig } = useLicenseStore();
  
  const [activeTab, setActiveTab] = useState<'account' | 'api' | 'firebase'>('account');

  // Account Form states
  const [profileName, setProfileName] = useState('Aayush Sharma');
  const [profileEmail, setProfileEmail] = useState('aayush@aegisflow.com');
  const [companyName, setCompanyName] = useState('AegisFlow Software');
  const [companyDomain, setCompanyDomain] = useState('aegisflow.com');

  // Firebase Form states (bound to Zustand or local placeholder fields)
  const [apiKey, setApiKey] = useState(firebaseConfig.apiKey);
  const [authDomain, setAuthDomain] = useState(firebaseConfig.authDomain);
  const [projectId, setProjectId] = useState(firebaseConfig.projectId);
  const [storageBucket, setStorageBucket] = useState(firebaseConfig.storageBucket);
  const [messagingSenderId, setMessagingSenderId] = useState(firebaseConfig.messagingSenderId);
  const [appId, setAppId] = useState(firebaseConfig.appId);
  
  // API credentials states
  const [apiKeys, setApiKeys] = useState([
    { id: 'key-1', label: 'Production SDK Key', value: 'af_live_8F4C3B9AE8D190F2C2A6B7E1', created: '2026-02-15' },
    { id: 'key-2', label: 'Development Key', value: 'af_test_1A2B3C4D5E6F7G8H9I0J1K2L', created: '2026-04-18' }
  ]);
  const [showKeyId, setShowKeyId] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [newKeyLabel, setNewKeyLabel] = useState('');

  const handleUpdateFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    updateFirebaseConfig({
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId
    });
    alert('Firebase credentials updated in memory!');
  };

  const handleGenerateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyLabel.trim()) return;

    const randomHex = () => Math.random().toString(16).substring(2, 18).toUpperCase();
    const newKey = {
      id: `key-${Date.now()}`,
      label: newKeyLabel,
      value: `af_live_${randomHex()}${randomHex()}`,
      created: new Date().toISOString().split('T')[0]
    };

    setApiKeys([newKey, ...apiKeys]);
    setNewKeyLabel('');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">Settings Panel</h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage your account profile, API credentials, and client database configurations.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-white/5 space-x-6 text-sm">
        <button
          onClick={() => setActiveTab('account')}
          className={`pb-3 border-b-2 font-medium transition-all ${
            activeTab === 'account' 
              ? 'border-indigo-500 text-white' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Profile & Company
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`pb-3 border-b-2 font-medium transition-all ${
            activeTab === 'api' 
              ? 'border-indigo-500 text-white' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          API Credentials
        </button>
        <button
          onClick={() => setActiveTab('firebase')}
          className={`pb-3 border-b-2 font-medium transition-all ${
            activeTab === 'firebase' 
              ? 'border-indigo-500 text-white' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Firebase Setup
        </button>
      </div>

      {/* Tab Panels */}
      <div className="mt-4">
        
        {/* Tab 1: Profile & Company Settings */}
        {activeTab === 'account' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile */}
            <div className="glass-card-no-hover p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <User className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-slate-200">Profile Configuration</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Administrator Name</label>
                  <input
                    type="text"
                    className="w-full glass-input text-xs"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    className="w-full glass-input text-xs"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                  />
                </div>

                <button 
                  onClick={() => alert('Profile changes saved successfully!')}
                  className="glass-button-primary px-4 py-2 text-xs font-semibold"
                >
                  Save Profile Settings
                </button>
              </div>
            </div>

            {/* Company Settings */}
            <div className="glass-card-no-hover p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <Building className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-slate-200">Company Profile</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Company Name</label>
                  <input
                    type="text"
                    className="w-full glass-input text-xs"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Corporate Domain</label>
                  <input
                    type="text"
                    className="w-full glass-input text-xs"
                    value={companyDomain}
                    onChange={(e) => setCompanyDomain(e.target.value)}
                  />
                </div>

                <button 
                  onClick={() => alert('Company configuration updated!')}
                  className="glass-button px-4 py-2 text-xs font-semibold"
                >
                  Update Company Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: API Keys Management */}
        {activeTab === 'api' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Generate Key */}
            <div className="glass-card-no-hover p-6 rounded-2xl space-y-4 h-fit">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <Key className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-slate-200">Generate API Key</h3>
              </div>

              <form onSubmit={handleGenerateApiKey} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Key Label Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Production SDK Key"
                    className="w-full glass-input text-xs"
                    value={newKeyLabel}
                    onChange={(e) => setNewKeyLabel(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full glass-button-primary px-4 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Provision Key
                </button>
              </form>
            </div>

            {/* List Keys */}
            <div className="glass-card-no-hover p-6 rounded-2xl lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <h3 className="text-sm font-semibold text-slate-200">Active API Keys</h3>
                <span className="text-[10px] text-slate-500">Provide keys to client apps for licensing requests.</span>
              </div>

              <div className="space-y-3">
                {apiKeys.map((key) => {
                  const isVisible = showKeyId === key.id;
                  const isCopied = copiedKeyId === key.id;

                  return (
                    <div key={key.id} className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-semibold text-slate-200 block">{key.label}</span>
                        <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">Issued: {key.created}</span>
                      </div>

                      <div className="flex items-center gap-2 bg-[#030712] border border-white/5 rounded-lg px-3 py-1.5 max-w-full md:max-w-[320px] justify-between">
                        <span className="font-mono text-xs text-slate-400 truncate pr-2">
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
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Firebase Config Settings */}
        {activeTab === 'firebase' && (
          <div className="max-w-2xl">
            <div className="glass-card-no-hover p-6 rounded-2xl relative overflow-hidden space-y-5">
              
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/10 text-orange-500">
                  <Flame className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">Firebase Configuration</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-normal">
                    Provide Firestore database API credentials. Keys are saved in-memory and will connect on sync.
                  </p>
                </div>
              </div>

              {/* Status Alert */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/10 flex items-start gap-2.5 text-amber-400 text-xs">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Firebase integration pending.</span>
                  <span className="text-[11px] opacity-80 mt-0.5 block">
                    All licensing states currently compute locally in-memory. Providing keys will not initialize SDK connections.
                  </span>
                </div>
              </div>

              {/* Configuration forms */}
              <form onSubmit={handleUpdateFirebase} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider font-mono">apiKey</label>
                    <input
                      type="text"
                      placeholder="AIzaSyA1B2C3D4E5F6G7H8I9..."
                      className="w-full glass-input text-xs font-mono"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider font-mono">authDomain</label>
                    <input
                      type="text"
                      placeholder="license-dashboard.firebaseapp.com"
                      className="w-full glass-input text-xs font-mono"
                      value={authDomain}
                      onChange={(e) => setAuthDomain(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider font-mono">projectId</label>
                    <input
                      type="text"
                      placeholder="license-dashboard-prod"
                      className="w-full glass-input text-xs font-mono"
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider font-mono">storageBucket</label>
                    <input
                      type="text"
                      placeholder="license-dashboard.appspot.com"
                      className="w-full glass-input text-xs font-mono"
                      value={storageBucket}
                      onChange={(e) => setStorageBucket(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider font-mono">messagingSenderId</label>
                    <input
                      type="text"
                      placeholder="847291038291"
                      className="w-full glass-input text-xs font-mono"
                      value={messagingSenderId}
                      onChange={(e) => setMessagingSenderId(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider font-mono">appId</label>
                    <input
                      type="text"
                      placeholder="1:847291038291:web:9c8d7e6f5a4b3c"
                      className="w-full glass-input text-xs font-mono"
                      value={appId}
                      onChange={(e) => setAppId(e.target.value)}
                    />
                  </div>

                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-end">
                  <button
                    type="submit"
                    className="glass-button-primary px-4 py-2 text-xs font-semibold cursor-pointer"
                  >
                    Save Configuration
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
