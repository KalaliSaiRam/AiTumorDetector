import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Database, Lock, Mail, ArrowRight, BrainCircuit, Activity, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await login(email, password);

      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'DOCTOR') navigate('/doctor');
      else if (user.role === 'RECEPTIONIST') navigate('/reception');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen flex w-full bg-[#0a0a0a] overflow-hidden">

      {/* LEFT SIDE: BRANDING PANEL (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-black flex-col justify-between p-12 border-r border-[#222]">
        {/* Abstract Background Effects */}
        <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-primary-900/20 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[150px] pointer-events-none" />

        {/* Dynamic Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>

        {/* Top Logo */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center border border-primary-500/20 backdrop-blur-md">
            <BrainCircuit className="text-primary-400" size={24} />
          </div>
          <span className="text-xl font-black text-white tracking-widest uppercase">NeuroMRI <span className="text-primary-500">AI</span></span>
        </motion.div>

        {/* Center Hero Content */}
        <motion.div
          variants={containerVariants} initial="hidden" animate="show"
          className="relative z-10 max-w-xl"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold tracking-widest uppercase mb-6">
            <Activity size={14} /> Clinical Evaluation Engine v2.0
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6 tracking-tight">
            Precision neural <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-500">diagnostics.</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg text-slate-400 leading-relaxed max-w-lg mb-8">
            Empowering radiology departments with state-of-the-art Grad-CAM neural network analysis for instantaneous, millimeter-accurate tumor classification.
          </motion.p>

          <motion.div variants={itemVariants} className="flex gap-8">
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-black text-white">99.4%</span>
              <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Model Accuracy</span>
            </div>
            <div className="w-px h-12 bg-[#333]"></div>
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-black text-white">&lt;0.5s</span>
              <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Inference Time</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }} className="relative z-10 flex items-center gap-3 text-slate-500 text-sm font-medium">
          <ShieldCheck size={18} className="text-emerald-500" />
          HIPAA Compliant encrypted tunnel. All data is anonymized.
        </motion.div>
      </div>

      {/* RIGHT SIDE: AUTH FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative bg-[#0a0a0a]">
        <div className="absolute top-[10%] right-[10%] w-64 h-64 bg-primary-600/10 rounded-full blur-[100px] pointer-events-none lg:hidden" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          className="w-full max-w-md p-8 lg:p-12 relative z-10"
        >
          <div className="flex flex-col items-center lg:items-start mb-10">
            <div className="w-16 h-16 bg-[#111] rounded-2xl flex items-center justify-center mb-6 border border-[#222] lg:hidden">
              <BrainCircuit className="text-primary-400" size={32} />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">Access Portal</h2>
            <p className="text-slate-400">Enter your clinical credentials to proceed.</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm font-medium flex items-start gap-3"
            >
              <ShieldCheck className="mt-0.5 shrink-0" size={16} />
              <p>{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#111] border border-[#333] text-white rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-medium placeholder:text-slate-600"
                  placeholder="doctor@hospital.edu"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Secret Key</label>
                {/* <a href="#" className="text-xs font-bold text-primary-500 hover:text-primary-400 transition-colors">Forgot?</a> */}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#111] border border-[#333] text-white rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-medium placeholder:text-slate-600 tracking-widest"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-500 text-white mt-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Authenticate <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-xs font-medium text-slate-500">
            For technical assistance, contact <span className="text-slate-300">IT Support</span>.
          </p>
        </motion.div>
      </div>

    </div>
  );
}
