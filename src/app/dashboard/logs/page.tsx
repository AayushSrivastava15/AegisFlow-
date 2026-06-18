'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardList, 
  Plus, 
  Play, 
  Pause, 
  RefreshCw, 
  Trash2, 
  Calendar, 
  Clock,
  Filter
} from 'lucide-react';
import { useLicenseStore } from '../../../store/licenseStore';

export default function ActivityLogsPage() {
  const logs = useLicenseStore((state) => state.logs);
  const [selectedType, setSelectedType] = useState<'all' | 'created' | 'activated' | 'suspended' | 'renewed' | 'deleted' | 'other'>('all');

  // Dynamic helper to extract category type from action text
  const getLogType = (actionText: string): 'created' | 'activated' | 'suspended' | 'renewed' | 'deleted' | 'other' => {
    const act = actionText.toLowerCase();
    if (act.includes('created') || act.includes('provisioned') || act.includes('added') || act.includes('issued') || act.includes('invited')) {
      return 'created';
    }
    if (act.includes('activated') || act.includes('validated')) {
      return 'activated';
    }
    if (act.includes('suspended')) {
      return 'suspended';
    }
    if (act.includes('renewed')) {
      return 'renewed';
    }
    if (act.includes('deleted') || act.includes('removed')) {
      return 'deleted';
    }
    return 'other';
  };

  // Filter logs by type
  const filteredLogs = logs.filter((log) => {
    const inferredType = getLogType(log.action);
    return selectedType === 'all' || inferredType === selectedType;
  });

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <Plus className="w-4 h-4 text-indigo-400" />;
      case 'activated':
        return <Play className="w-4 h-4 text-emerald-400" />;
      case 'suspended':
        return <Pause className="w-4 h-4 text-rose-400" />;
      case 'renewed':
        return <RefreshCw className="w-4 h-4 text-amber-400" />;
      case 'deleted':
        return <Trash2 className="w-4 h-4 text-red-400" />;
      default:
        return <ClipboardList className="w-4 h-4 text-slate-400" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'created':
        return 'bg-indigo-500/10 border-indigo-500/10';
      case 'activated':
        return 'bg-emerald-500/10 border-emerald-500/10';
      case 'suspended':
        return 'bg-rose-500/10 border-rose-500/10';
      case 'renewed':
        return 'bg-amber-500/10 border-amber-500/10';
      case 'deleted':
        return 'bg-red-500/10 border-red-500/10';
      default:
        return 'bg-slate-500/10 border-slate-500/10';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Platform Activity Logs</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Audit logs tracking all license provisioning, suspension cycles, and activation handshakes.
          </p>
        </div>

        {/* Filter type dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            className="text-xs bg-[#090d16] border border-white/5 rounded-xl px-2.5 py-1.5 focus:outline-none text-slate-300 focus:border-indigo-500"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
          >
            <option value="all">All Activities</option>
            <option value="created">Created & Issued</option>
            <option value="activated">Activated & Validated</option>
            <option value="suspended">Suspended</option>
            <option value="renewed">Renewed</option>
            <option value="deleted">Deleted</option>
            <option value="other">Other Operations</option>
          </select>
        </div>
      </div>

      {/* Timeline view */}
      <div className="glass-card-no-hover p-6 rounded-2xl relative overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No activity log entries found matching the filter criteria.
          </div>
        ) : (
          <div className="relative border-l border-white/5 pl-6 ml-4 py-2 space-y-8">
            
            {filteredLogs.map((log, idx) => {
              const logDate = new Date(log.timestamp);
              const inferredType = getLogType(log.action);
              
              return (
                <motion.div 
                  key={log.logId} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(idx * 0.04, 0.4) }}
                  className="relative group"
                >
                  {/* Bullet point icon */}
                  <span className={`absolute top-0.5 -left-[35px] w-7 h-7 rounded-lg border flex items-center justify-center ${getIconBg(inferredType)} bg-[#030712] z-10 transition-transform duration-200 group-hover:scale-110 shadow-lg`}>
                    {getLogIcon(inferredType)}
                  </span>

                  {/* Log Card Box */}
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/10 transition-all space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-200">
                        {log.action}
                      </span>
                      
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {logDate.toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[9px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded border border-white/5 bg-white/[0.02] text-slate-400">
                        {inferredType}
                      </span>
                      
                      {log.employeeEmail && (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-indigo-500/5 bg-indigo-500/5 text-indigo-400">
                          Executor: {log.employeeEmail}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

          </div>
        )}
      </div>

    </div>
  );
}
