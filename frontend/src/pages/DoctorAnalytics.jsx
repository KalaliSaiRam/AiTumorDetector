import React, { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import { Activity, BrainCircuit, ActivitySquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DoctorAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/doctor/dashboard');
        // Backend returns: { total, analyzed, distribution: { pituitary, glioma, meningioma, clean } }
        setStats(res.data.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center h-full">
        <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!stats) return null;

  const { total, analyzed, distribution } = stats;
  const analysisRate = total > 0 ? Math.round((analyzed / total) * 100) : 0;

  // Stagger animation container
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4, duration: 0.8 } }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-12 h-full relative">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} className="relative z-10">
        <h1 className="text-5xl font-black text-white tracking-tight flex items-center gap-4 drop-shadow-2xl">
          <ActivitySquare className="text-primary-400" size={48} /> 
          Analytics Command Center
        </h1>
        <p className="text-slate-400 mt-4 text-xl max-w-2xl leading-relaxed">System-wide neurological classifications and real-time processing distribution mapping for your active caseload.</p>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10"
      >
        {/* Total Overview Cards */}
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-2 glass-panel p-8 border-white/5 shadow-2xl flex flex-col justify-center relative overflow-hidden bg-slate-900/40">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <BrainCircuit size={160} />
          </div>
          <p className="text-sm font-bold text-slate-400 tracking-widest uppercase mb-2">Caseload Velocity</p>
          <div className="flex items-end gap-4 mb-4">
            <p className="text-7xl font-black text-white leading-none">{total}</p>
            <p className="text-lg text-slate-400 font-medium mb-2">Patients</p>
          </div>
          <div className="w-full bg-black/40 h-4 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }} animate={{ width: `${analysisRate}%` }} transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
              className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full relative"
            >
              <div className="absolute inset-0 bg-white/20 blur-sm animate-pulse" />
            </motion.div>
          </div>
          <div className="mt-3 flex justify-between text-sm font-bold">
            <span className="text-primary-400">{analyzed} Fully Diagnosed</span>
            <span className="text-slate-500">{analysisRate}% Completion Rate</span>
          </div>
        </motion.div>

        {/* Tumor Type Widgets */}
        <motion.div variants={itemVariants} className="glass-panel p-8 border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)] bg-gradient-to-b from-purple-500/10 to-transparent flex flex-col justify-between group hover:scale-[1.02] transition-transform">
          <p className="text-sm font-bold text-purple-400 tracking-widest uppercase truncate drop-shadow-md">Pituitary Type</p>
          <div className="mt-4">
            <p className="text-6xl font-black text-white drop-shadow-xl">{distribution.pituitary}</p>
            <p className="text-slate-400 mt-2 font-medium">Flagged Cases</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel p-8 border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.15)] bg-gradient-to-b from-indigo-500/10 to-transparent flex flex-col justify-between group hover:scale-[1.02] transition-transform">
          <p className="text-sm font-bold text-indigo-400 tracking-widest uppercase truncate drop-shadow-md">Glioma Type</p>
          <div className="mt-4">
            <p className="text-6xl font-black text-white drop-shadow-xl">{distribution.glioma}</p>
            <p className="text-slate-400 mt-2 font-medium">Flagged Cases</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel p-8 border-pink-500/30 shadow-[0_0_30px_rgba(236,72,153,0.15)] bg-gradient-to-b from-pink-500/10 to-transparent flex flex-col justify-between group hover:scale-[1.02] transition-transform">
          <p className="text-sm font-bold text-pink-400 tracking-widest uppercase truncate drop-shadow-md">Meningioma Type</p>
          <div className="mt-4">
            <p className="text-6xl font-black text-white drop-shadow-xl">{distribution.meningioma}</p>
            <p className="text-slate-400 mt-2 font-medium">Flagged Cases</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel p-8 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] bg-gradient-to-b from-emerald-500/10 to-transparent flex flex-col justify-between group hover:scale-[1.02] transition-transform">
          <p className="text-sm font-bold text-emerald-400 tracking-widest uppercase truncate drop-shadow-md">Clean / No Tumor</p>
          <div className="mt-4">
            <p className="text-6xl font-black text-white drop-shadow-xl">{distribution.clean}</p>
            <p className="text-slate-400 mt-2 font-medium">Cleared Patients</p>
          </div>
        </motion.div>
        
        {/* Extra visualization space or chart could go here if needed in future */}
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 lg:col-span-2 glass-panel p-8 border-white/5 flex items-center justify-center bg-black/20 text-slate-500 border-dashed border-2">
            <p className="font-medium tracking-wide">Additional visualization matrices offline.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
