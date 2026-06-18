'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Search, 
  Terminal, 
  Key, 
  Activity, 
  Server, 
  ShieldAlert, 
  HelpCircle, 
  Copy, 
  Check, 
  ArrowRight,
  Info,
  CheckCircle,
  AlertTriangle,
  Play
} from 'lucide-react';

type Chapter = 'intro' | 'onboarding' | 'validate-api' | 'heartbeat-api' | 'sdks' | 'deployment' | 'security' | 'faq';

export default function DocsPage() {
  const [activeChapter, setActiveChapter] = useState<Chapter>('intro');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chapters: { id: Chapter; name: string; icon: any; category: string }[] = [
    { id: 'intro', name: 'Product Introduction', icon: Info, category: 'GETTING STARTED' },
    { id: 'onboarding', name: '5-Minute Onboarding', icon: Play, category: 'GETTING STARTED' },
    { id: 'validate-api', name: 'License Validation API', icon: Key, category: 'API REFERENCE' },
    { id: 'heartbeat-api', name: 'Heartbeat Telemetry API', icon: Activity, category: 'API REFERENCE' },
    { id: 'sdks', name: 'SDK & Integrations', icon: Terminal, category: 'API REFERENCE' },
    { id: 'deployment', name: 'VPS / Self-Hosting', icon: Server, category: 'DEPLOYMENT' },
    { id: 'security', name: 'Security & Token Rotation', icon: ShieldAlert, category: 'SECURITY' },
    { id: 'faq', name: 'FAQ & Troubleshooting', icon: HelpCircle, category: 'SUPPORT' },
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Group chapters by category
  const categories = Array.from(new Set(chapters.map((c) => c.category)));

  // Filter chapters if searching
  const filteredChapters = chapters.filter((c) => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-400" /> Platform Documentation
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          World-class guides, REST API endpoints specifications, and SDK integration walkthroughs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Navigation Sidebar */}
        <div className="space-y-4 lg:col-span-1">
          {/* Docs Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search documentation..."
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-white/[0.02] border border-white/5 focus:border-indigo-500 focus:outline-none placeholder-slate-500 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Chapters Tree list */}
          <div className="glass-card-no-hover p-3.5 rounded-2xl border border-white/5 space-y-4">
            {categories.map((cat) => {
              const catChapters = filteredChapters.filter((c) => c.category === cat);
              if (catChapters.length === 0) return null;

              return (
                <div key={cat} className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-500 tracking-widest block uppercase px-2 py-1 select-none">
                    {cat}
                  </span>
                  <div className="space-y-0.5">
                    {catChapters.map((ch) => {
                      const isActive = activeChapter === ch.id;
                      const Icon = ch.icon;
                      return (
                        <button
                          key={ch.id}
                          onClick={() => setActiveChapter(ch.id)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                            isActive
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.01]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{ch.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Content View Pane */}
        <div className="lg:col-span-3 glass-card-no-hover p-6 sm:p-8 rounded-2xl border border-white/5 min-h-[500px]">
          <AnimatePresence mode="wait">
            
            {/* CHAPTER 1: INTRO */}
            {activeChapter === 'intro' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Introduction to AegisFlow</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    AegisFlow is a modern, developer-first license management platform built for software-as-a-service (SaaS), APIs, desktop utilities, and microservices. By combining Edge validation with secure telemetry, AegisFlow protects your digital IP, logs client activations, and gives you real-time visibility into who is using your software.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
                    <span className="text-xs font-semibold text-white block">Stripe-Grade Simplicity</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">Provision keys, suspend access, and trigger pings in seconds using standard REST endpoints or official SDK scripts.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
                    <span className="text-xs font-semibold text-white block">Multi-Tenant Isolation</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">Each company receives a completely isolated database partition. Your records, clients, and telemetry logs are strictly walled.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex gap-3 text-xs leading-normal">
                  <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div className="text-slate-300">
                    <span className="font-semibold block mb-0.5">Need a sample application?</span>
                    We have a fully functional sandbox client app inside your workspace under <code>c:\testing_license</code>. Run it to simulate direct Firestore operations or test endpoints!
                  </div>
                </div>
              </motion.div>
            )}

            {/* CHAPTER 2: ONBOARDING */}
            {activeChapter === 'onboarding' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6 text-xs sm:text-sm text-slate-400 leading-relaxed"
              >
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 font-sans">5-Minute Quickstart</h3>
                <p>Follow these four simple steps to generate and validate your first license key.</p>
                
                <div className="space-y-4 mt-2">
                  <div className="flex gap-3">
                    <span className="h-5 w-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">1</span>
                    <div>
                      <h4 className="font-semibold text-white text-xs mb-1">Provision a Product</h4>
                      <p className="text-[11px]">Navigate to the <b>Products</b> tab, click <b>Provision Product</b>, enter a name (e.g. <i>SupaAuth Gateway</i>), and copy the generated API Client Key.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="h-5 w-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">2</span>
                    <div>
                      <h4 className="font-semibold text-white text-xs mb-1">Register a Customer</h4>
                      <p className="text-[11px]">Go to the <b>Customers</b> panel, click <b>Add Customer</b>, and fill in the corporate name (e.g. <i>Stripe Inc.</i>) and contact email.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="h-5 w-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">3</span>
                    <div>
                      <h4 className="font-semibold text-white text-xs mb-1">Issue a Key</h4>
                      <p className="text-[11px]">Go to the <b>Licenses</b> page, select the product and customer, enter a node connection limit (e.g. <i>100</i>), and click <b>Generate License</b>.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="h-5 w-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">4</span>
                    <div>
                      <h4 className="font-semibold text-white text-xs mb-1">Validate in App</h4>
                      <p className="text-[11px]">Paste the license key in your application to execute validation checks via the REST API or official SDK wrappers.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* CHAPTER 3: VALIDATE API */}
            {activeChapter === 'validate-api' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1">Validate License Key API</h3>
                  <span className="text-[10px] font-mono text-indigo-400 border border-indigo-500/10 bg-indigo-500/5 px-2 py-0.5 rounded uppercase font-semibold">POST /api/licenses/validate</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Call this endpoint from your application servers to check if a client license key is active, expired, suspended, or invalid.
                </p>

                {/* Headers */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 tracking-wider block uppercase font-mono">Headers</span>
                  <div className="bg-[#030712] border border-white/5 rounded-xl p-3 font-mono text-[11px] text-slate-300">
                    <div>Content-Type: application/json</div>
                    <div>x-api-key: af_live_8f4c3b9ae8d190f2... (Your Product API Key)</div>
                  </div>
                </div>

                {/* Request Payload */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 tracking-wider uppercase font-mono">
                    <span>Request Body</span>
                    <button 
                      onClick={() => handleCopy('req-v', '{\n  "licenseKey": "LIC-XXXX-XXXX-XXXX-XXXX",\n  "productId": "prod_8cf123"\n}')}
                      className="text-indigo-400 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      {copiedId === 'req-v' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} Copy
                    </button>
                  </div>
                  <pre className="bg-[#030712] border border-white/5 rounded-xl p-4 font-mono text-[11px] text-slate-300">
{`{
  "licenseKey": "LIC-XXXX-XXXX-XXXX-XXXX",
  "productId": "prod_8cf123"
}`}
                  </pre>
                </div>

                {/* Success Response */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 tracking-wider block uppercase font-mono">Success Response (200 OK)</span>
                  <pre className="bg-[#030712] border border-white/5 rounded-xl p-4 font-mono text-[11px] text-slate-300">
{`{
  "isValid": true,
  "status": "ACTIVE",
  "usageCount": 42,
  "usageLimit": 100,
  "expiryDate": "2027-01-20T10:00:00Z",
  "customerName": "Mitchell Baker"
}`}
                  </pre>
                </div>
              </motion.div>
            )}

            {/* CHAPTER 4: HEARTBEAT API */}
            {activeChapter === 'heartbeat-api' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1">Heartbeat Telemetry API</h3>
                  <span className="text-[10px] font-mono text-indigo-400 border border-indigo-500/10 bg-indigo-500/5 px-2 py-0.5 rounded uppercase font-semibold">POST /api/heartbeat</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Submit periodic telemetry check-ins (e.g. every 5 minutes) from active server nodes. If a product goes offline (or pings are missed for 72 hours), the system updates the diagnostic card to warning or offline.
                </p>

                {/* Headers */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 tracking-wider block uppercase font-mono">Headers</span>
                  <div className="bg-[#030712] border border-white/5 rounded-xl p-3 font-mono text-[11px] text-slate-300">
                    <div>Content-Type: application/json</div>
                    <div>x-api-key: af_live_8f4c3b9ae8d190f2... (Your Product API Key)</div>
                  </div>
                </div>

                {/* Request Payload */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 tracking-wider uppercase font-mono">
                    <span>Request Body</span>
                    <button 
                      onClick={() => handleCopy('req-hb', '{\n  "productId": "prod_8cf123",\n  "version": "1.2.0",\n  "activeUsers": 350,\n  "environment": "production",\n  "serverStatus": "UP"\n}')}
                      className="text-indigo-400 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      {copiedId === 'req-hb' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} Copy
                    </button>
                  </div>
                  <pre className="bg-[#030712] border border-white/5 rounded-xl p-4 font-mono text-[11px] text-slate-300">
{`{
  "productId": "prod_8cf123",
  "version": "1.2.0",
  "activeUsers": 350,
  "environment": "production",
  "serverStatus": "UP" // UP or DOWN
}`}
                  </pre>
                </div>
              </motion.div>
            )}

            {/* CHAPTER 5: SDKs */}
            {activeChapter === 'sdks' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">SDK Code Examples</h3>

                {/* Node.js */}
                <div className="space-y-2.5">
                  <span className="text-xs font-semibold text-indigo-400 block font-mono">Node.js (Axios) Integration</span>
                  <pre className="bg-[#030712] border border-white/5 rounded-xl p-4 font-mono text-[11px] text-slate-300 overflow-x-auto">
{`import axios from 'axios';

const validate = async (key, productId, apiKey) => {
  try {
    const res = await axios.post('http://localhost:3000/api/licenses/validate', {
      licenseKey: key,
      productId: productId
    }, {
      headers: { 'x-api-key': apiKey }
    });
    
    return res.data.isValid; // returns true or false
  } catch (err) {
    console.error('Validation error:', err.response?.data?.error);
    return false;
  }
};`}
                  </pre>
                </div>

                {/* Python */}
                <div className="space-y-2.5 mt-6">
                  <span className="text-xs font-semibold text-purple-400 block font-mono">Python Telemetry client</span>
                  <pre className="bg-[#030712] border border-white/5 rounded-xl p-4 font-mono text-[11px] text-slate-300 overflow-x-auto">
{`import requests

def send_heartbeat(api_key, product_id, active_users=150):
    url = "http://localhost:3000/api/heartbeat"
    headers = {"x-api-key": api_key}
    payload = {
        "productId": product_id,
        "version": "1.0.0",
        "activeUsers": active_users,
        "environment": "production",
        "serverStatus": "UP"
    }
    
    res = requests.post(url, json=payload, headers=headers)
    return res.json()`}
                  </pre>
                </div>
              </motion.div>
            )}

            {/* CHAPTER 6: DEPLOYMENT */}
            {activeChapter === 'deployment' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6 text-xs sm:text-sm text-slate-400 leading-relaxed"
              >
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Self-Hosting & VPS Deployment</h3>
                <p>Deploy the AegisFlow license gateway to your own Ubuntu VPS instance (e.g. DigitalOcean, AWS EC2, or Vultr) in minutes.</p>

                <div className="space-y-4 font-mono text-[11px] text-slate-300">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 font-sans block uppercase">Step 1: Clone & Install</span>
                    <div className="bg-[#030712] border border-white/5 rounded-xl p-3">
                      git clone https://github.com/yourorg/aegisflow.git<br />
                      cd aegisflow<br />
                      npm install
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 font-sans block uppercase">Step 2: Build Production assets</span>
                    <div className="bg-[#030712] border border-white/5 rounded-xl p-3">
                      npm run build
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 font-sans block uppercase">Step 3: Run in Background with PM2</span>
                    <div className="bg-[#030712] border border-white/5 rounded-xl p-3">
                      npm install -g pm2<br />
                      pm2 start npm --name "aegisflow-gateway" -- run start -- -p 3000
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* CHAPTER 7: SECURITY */}
            {activeChapter === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6 text-xs sm:text-sm text-slate-400 leading-relaxed"
              >
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">API Security & Token Protection</h3>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                    <span className="text-xs font-semibold text-white block mb-1">Server-to-Server Checks Only</span>
                    <p className="text-[11px] leading-relaxed">Always run license validation requests inside your backend codebases (e.g. Node Express controllers, Python backends, or Spring Boot endpoints). Never expose your SDK Secret directly inside front-end clients, as users could modify JavaScript state or execute custom intercepts.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                    <span className="text-xs font-semibold text-white block mb-1">Periodic Key Rotation</span>
                    <p className="text-[11px] leading-relaxed">It is best practice to rotate product credentials (API Keys and SDK Secrets) every 180 days. You can monitor workspace-wide access logs in the settings module to audit unexpected requests.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* CHAPTER 8: FAQ */}
            {activeChapter === 'faq' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6 text-xs sm:text-sm text-slate-400 leading-relaxed"
              >
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">FAQ & Troubleshooting</h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white text-xs mb-1">Q: What is the "Unauthenticated user context" error?</h4>
                    <p className="text-[11px]">This error occurs when you are logged in but have no workspace associated with your account. We have added automatic self-healing hooks. Simply log out and log back in, and your organization profile will automatically provision.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white text-xs mb-1">Q: How does offline fallback work?</h4>
                    <p className="text-[11px]">If the AegisFlow servers are unreachable due to a network outage, your application can store the last successful validation response locally inside a signed JWT or encrypted config for a grace period (e.g. 24 hours) to avoid locking out legitimate users.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white text-xs mb-1">Q: How is the product Health Score computed?</h4>
                    <p className="text-[11px]">If a server reports <code>serverStatus = "DOWN"</code>, the health score drops to 0% (OFFLINE). During healthy pings, the score tracks user capacity (usually staying above 95%). If no pings are received for 72 hours, it shifts to OFFLINE.</p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
