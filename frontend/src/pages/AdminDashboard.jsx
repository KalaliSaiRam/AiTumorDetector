import React, { useEffect, useState } from 'react';
import { Users, Activity, FileText, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axiosInstance';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ patients: 0, users: 0, scans: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We mock some stats if the backend doesn't have an exact /api/admin/stats endpoint
    // Or we fetch lists and count them.
    const fetchStats = async () => {
      try {
        const [patientsRes] = await Promise.all([
          api.get('/patients'),
        ]);
        setStats({
          patients: patientsRes.data.data.patients?.length || 0,
          users: 3, // mock
          scans: (patientsRes.data.data.patients?.length || 0) * 2, // mock metric logic
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Total Patients', value: stats.patients, icon: <Users size={24} className="text-primary-400" /> },
    { label: 'System Scans', value: stats.scans, icon: <Activity size={24} className="text-purple-400" /> },
    { label: 'Active Staff', value: stats.users, icon: <FileText size={24} className="text-emerald-400" /> },
    { label: 'AI Detections', value: `${stats.scans - 1 > 0 ? stats.scans - 1 : 0}`, icon: <TrendingUp size={24} className="text-orange-400" /> },
  ];

  return (
    <div className="p-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">System Overview</h1>
        <p className="text-slate-400 mt-1">Real-time metrics and system health administration.</p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse border border-white/5" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-primary-500/30 transition-colors shadow-lg"
            >
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4">
                {c.icon}
              </div>
              <p className="text-slate-400 text-sm font-medium">{c.label}</p>
              <p className="text-3xl font-bold text-white mt-1">{c.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Placeholder for future admin tables */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px]"
      >
        <Activity size={48} className="text-slate-600 mb-4" />
        <h3 className="text-xl font-medium text-slate-300">System Logs</h3>
        <p className="text-slate-500 mt-2 text-center max-w-md">Detailed system logs and staff activity tracking will be populated here as events stream from the Node.js backend.</p>
      </motion.div>
    </div>
  );
}
