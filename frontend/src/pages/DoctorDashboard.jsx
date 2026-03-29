import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { FileSearch, ChevronRight, User, Activity, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get('/doctor/patients');
        setPatients(res.data.data.patients);
      } catch (err) {
        console.error("Failed to fetch doctor patients", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 h-full">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3 drop-shadow-lg">
          <FileSearch className="text-primary-400" size={36} /> Patient Roster
        </h1>
        <p className="text-slate-400 mt-2 text-lg">Detailed clinical overview of your currently assigned caseload.</p>
      </motion.div>

      {/* PATIENT ROSTER (Using same massive aesthetic styling) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="glass-panel border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl flex-1 flex flex-col"
      >
        <div className="px-8 py-6 border-b border-white/10 bg-black/40 flex items-center justify-between">
          <h2 className="text-xl font-black text-white flex items-center gap-3 tracking-wide drop-shadow-md">
            <FileSearch size={24} className="text-primary-400" />
            Patient Roster
          </h2>
        </div>

        {loading ? (
          <div className="p-20 flex justify-center">
            <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        ) : patients.length === 0 ? (
          <div className="p-24 text-center text-slate-400">
            <User size={64} className="mx-auto mb-6 text-slate-600 opacity-50" />
            <p className="text-2xl font-bold text-white mb-2">No active caseload</p>
            <p className="text-lg">Reception has not assigned any patients to your roster.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-white/5">
              {patients.map((patient) => {
                const latestScan = patient.scans && patient.scans[0];
                const hasPrediction = latestScan && latestScan.prediction;
                
                return (
                  <div
                    key={patient.id}
                    className="p-6 hover:bg-white/5 transition-all duration-300 cursor-pointer flex items-center justify-between group"
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-slate-900 border-2 border-primary-500/30 rounded-2xl flex items-center justify-center text-primary-400 shadow-inner group-hover:scale-110 transition-transform duration-300">
                        <User size={28} />
                      </div>
                      <div>
                        <h3 className="text-white font-black text-xl tracking-wide group-hover:text-primary-300 transition-colors drop-shadow-sm">{patient.name}</h3>
                        <p className="text-slate-400 font-medium text-sm mt-1">ID: {patient.id.slice(-8).toUpperCase()} • Age: {patient.age} • Gender: {patient.gender}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      {hasPrediction ? (
                        <div className="hidden md:block text-right pr-4">
                          <p className="text-xs font-bold text-emerald-400 tracking-widest uppercase">Analyzed</p>
                          <p className="text-sm font-black text-white mt-1 capitalize">{latestScan.prediction.predictedClass.replace('_', ' ')}</p>
                        </div>
                      ) : (
                        <div className="hidden md:block text-right pr-4">
                          <p className="text-xs font-bold text-amber-500 tracking-widest uppercase animate-pulse">Pending</p>
                          <p className="text-sm font-black text-slate-300 mt-1">Awaiting Diagnosis</p>
                        </div>
                      )}
                      
                      <button className="px-5 py-2.5 rounded-xl bg-primary-600/20 text-primary-400 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity border border-primary-500/30 tracking-wide">
                        View Diagnostics
                      </button>
                      <ChevronRight size={24} className="text-slate-600 group-hover:text-primary-400 transition-colors translate-x-2 group-hover:translate-x-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
