import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { FileSearch, ChevronRight, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get('/patients');
        setPatients(res.data.data.patients);
      } catch (err) {
        console.error("Failed to fetch patients", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  return (
    <div className="p-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">My Patients</h1>
        <p className="text-slate-400 mt-1">Select a patient to view their AI MRI predictions and history.</p>
      </motion.div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <FileSearch size={20} className="text-primary-400" />
            Patient Records
          </h2>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        ) : patients.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            No patients registered yet. Reception needs to add patients.
          </div>
        ) : (
          <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
            {patients.map((patient) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-4 hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-between group"
                onClick={() => navigate(`/patients/${patient.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-900/50 rounded-full flex items-center justify-center text-primary-400 border border-primary-500/20">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-lg">{patient.name}</h3>
                    <p className="text-slate-400 text-sm">ID: {patient.id.slice(-8).toUpperCase()} • Age: {patient.age} • Gender: {patient.gender}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button className="px-4 py-2 rounded-lg bg-primary-600/20 text-primary-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity border border-primary-500/30">
                    Run New Prediction
                  </button>
                  <ChevronRight size={20} className="text-slate-500 group-hover:text-white transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
