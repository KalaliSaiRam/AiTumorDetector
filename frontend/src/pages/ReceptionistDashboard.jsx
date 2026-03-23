import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { Users, Activity, Calendar, UploadCloud, FileText, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReceptionistDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [stats, setStats] = useState({ totalPatients: 0, totalScans: 0 });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Registration Form State
  const [regForm, setRegForm] = useState({ name: '', age: '', gender: 'MALE', contact: '', doctorId: '' });
  
  // Appointment Form State
  const [aptForm, setAptForm] = useState({ patientId: '', doctorId: '', date: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [patientsRes, doctorsRes] = await Promise.all([
        api.get('/patients'),
        api.get('/admin/users?role=DOCTOR') // Assuming admin users API allows role filtering for Receptionist as well
      ]);
      
      const pts = patientsRes.data.data.patients || [];
      setPatients(pts);
      setDoctors(doctorsRes.data.data || []);
      
      // Calculate scans (mocking total by counting arrays)
      const scanCount = pts.reduce((acc, p) => acc + (p._count?.scans || 0), 0);
      setStats({ totalPatients: pts.length, totalScans: scanCount });
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      // Fallback
      const res = await api.get('/patients');
      const pts = res.data.data.patients || [];
      setPatients(pts);
      setStats({ totalPatients: pts.length, totalScans: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });
    try {
      await api.post('/patients', regForm);
      setMsg({ text: 'Patient successfully registered!', type: 'success' });
      setRegForm({ name: '', age: '', gender: 'MALE', contact: '', doctorId: '' });
      fetchData(); // Refresh list
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Failed to register patient.', type: 'error' });
    }
  };

  const handleAppointment = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });
    try {
      await api.post('/appointments', aptForm);
      setMsg({ text: 'Appointment permanently scheduled!', type: 'success' });
      setAptForm({ patientId: '', doctorId: '', date: '' });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Failed to schedule appointment.', type: 'error' });
    }
  };

  const handlePatientSelectForApt = (pid) => {
    const selectedPatient = patients.find(p => p.id === pid);
    if (selectedPatient && selectedPatient.createdBy) {
      setAptForm({ ...aptForm, patientId: pid, doctorId: selectedPatient.createdBy.id });
    } else {
      setAptForm({ ...aptForm, patientId: pid, doctorId: '' });
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-6 h-full overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Front Desk Operations</h1>
          <p className="text-slate-400">Manage patient intake, scheduling, and hospital logistics</p>
        </div>
      </div>

      {msg.text && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-4 rounded-xl text-sm font-medium ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {msg.text}
        </motion.div>
      )}

      {/* TABS */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
          Overview Dashboard
        </button>
        <button onClick={() => setActiveTab('register')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'register' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
          Register Patient
        </button>
        <button onClick={() => setActiveTab('schedule')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'schedule' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
          Schedule Appointment
        </button>
        <button onClick={() => setActiveTab('list')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'list' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
          Patient Archive
        </button>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 border-emerald-500/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl"><Users size={24} /></div>
              <div>
                <h3 className="text-sm font-medium text-slate-400">Total Registered Patients</h3>
                <p className="text-3xl font-bold text-white">{stats.totalPatients}</p>
              </div>
            </div>
          </div>
          <div className="glass-panel p-6 border-purple-500/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl"><FileText size={24} /></div>
              <div>
                <h3 className="text-sm font-medium text-slate-400">Total Uploaded Scans</h3>
                <p className="text-3xl font-bold text-white">{stats.totalScans}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* REGISTER TAB */}
      {activeTab === 'register' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-8 max-w-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">New Patient Intake</h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300">Full Name</label>
                <input type="text" required value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} className="w-full glass-input" placeholder="Jane Doe" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300">Age</label>
                <input type="number" required min="0" value={regForm.age} onChange={e => setRegForm({...regForm, age: e.target.value})} className="w-full glass-input" placeholder="45" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300">Gender</label>
                <select value={regForm.gender} onChange={e => setRegForm({...regForm, gender: e.target.value})} className="w-full glass-input appearance-none bg-slate-900 border-white/10 text-slate-300">
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              {/* Contact Field */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300">Contact / Phone</label>
                <input type="text" required value={regForm.contact} onChange={e => setRegForm({...regForm, contact: e.target.value})} className="w-full glass-input" placeholder="+1 (555) 000-0000" />
              </div>
              
              {/* Doctor Assignment Field */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-emerald-400 font-semibold mb-1 block">Assign Primary Doctor (Mandatory for AI Access)</label>
                <select required value={regForm.doctorId} onChange={e => setRegForm({...regForm, doctorId: e.target.value})} className="w-full glass-input appearance-none bg-emerald-950/20 border-emerald-500/30 text-emerald-100 font-medium">
                  <option value="">-- Select Attending Doctor --</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name} ({d.email})</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="w-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 py-3 mt-4 rounded-xl font-medium transition-all">Register Patient & Route to Doctor</button>
          </form>
        </motion.div>
      )}

      {/* SCHEDULE TAB */}
      {activeTab === 'schedule' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-8 max-w-2xl">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2"><Calendar className="text-primary-400" /> Schedule Specialist Appointment</h2>
          <form onSubmit={handleAppointment} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Select Patient</label>
              <select required value={aptForm.patientId} onChange={e => handlePatientSelectForApt(e.target.value)} className="w-full glass-input appearance-none bg-slate-900 border-white/10 text-slate-300">
                <option value="">-- Choose Patient --</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name} (Contact: {p.contact})</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Assigned Doctor (Fixed)</label>
              <div className="w-full glass-input bg-slate-900/50 border-white/5 text-slate-400 flex items-center cursor-not-allowed select-none min-h-[48px]">
                {aptForm.patientId 
                  ? (patients.find(p => p.id === aptForm.patientId)?.createdBy?.name ? `Dr. ${patients.find(p => p.id === aptForm.patientId).createdBy.name}` : 'Unassigned/Missing') 
                  : '-- Select a patient first --'}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Appointment Date & Time</label>
              <input type="datetime-local" required value={aptForm.date} onChange={e => setAptForm({...aptForm, date: e.target.value})} className="w-full glass-input appearance-none" style={{ colorScheme: 'dark' }} />
            </div>
            <button type="submit" disabled={!aptForm.doctorId} className={`w-full py-3 mt-4 rounded-xl font-medium transition-colors ${aptForm.doctorId ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>Confirm & Process Scheduling</button>
          </form>
        </motion.div>
      )}

      {/* PATIENT LIST TAB */}
      {activeTab === 'list' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-6 flex-1 overflow-auto">
          <h2 className="text-xl font-semibold text-white mb-6">Full Patient Hospital Directory</h2>
          {loading ? (
            <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-sm">
                  <th className="py-3 px-4 font-medium">Patient Name</th>
                  <th className="py-3 px-4 font-medium">Age & Gender</th>
                  <th className="py-3 px-4 font-medium">Contact</th>
                  <th className="py-3 px-4 font-medium">Registration Date</th>
                  <th className="py-3 px-4 font-medium">AI Scans</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {patients.map(p => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 text-white font-medium">{p.name}</td>
                    <td className="py-4 px-4 text-slate-300 text-sm">{p.age} yrs • <span className="capitalize">{p.gender.toLowerCase()}</span></td>
                    <td className="py-4 px-4 text-primary-400 text-sm">{p.contact}</td>
                    <td className="py-4 px-4 text-slate-400 text-sm">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-4 text-slate-400 text-sm">{p._count?.scans || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>
      )}
    </div>
  );
}
