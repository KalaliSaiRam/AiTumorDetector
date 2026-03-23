import React, { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import { Users, UserPlus, CheckCircle2, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ManageStaff() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('DOCTOR');
  
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setMsg({ text: '', type: '' });

    if (password.length < 8) {
      setMsg({ text: 'Error: password should not be < 8 characters', type: 'error' });
      setCreating(false);
      return;
    }

    try {
      // Create user bypassing context so current Admin is not logged out
      await api.post('/auth/register', { name, email, password, role });
      setMsg({ text: 'Account provisioned successfully!', type: 'success' });
      setName(''); setEmail(''); setPassword('');
      fetchUsers(); // Refresh table
    } catch (err) {
      const data = err.response?.data;
      const errorMsg = data?.errors ? data.errors.map(e => e.msg).join(', ') : data?.message || 'Failed to create user';
      setMsg({ text: errorMsg, type: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const handleVerify = async (userId) => {
    try {
      await api.post('/admin/toggle-verification', { userId });
      setMsg({ text: 'User account clearance updated.', type: 'success' });
      fetchUsers(); // Refresh table
    } catch (err) {
      setMsg({ text: 'Failed to update account status.', type: 'error' });
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Create User Form */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 glass-panel p-6 h-fit">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
          <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center text-primary-400">
            <UserPlus size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Issue Credentials</h2>
            <p className="text-sm text-slate-400">Provision a new staff account</p>
          </div>
        </div>

        {msg.text && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full glass-input" placeholder="Dr. John" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full glass-input" placeholder="john@hospital.com" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Temporary Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full glass-input" placeholder="Min 8 characters" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Security Clearance</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="w-full glass-input appearance-none bg-slate-900 border-white/10 text-slate-300">
              <option value="DOCTOR">Doctor (AI Authorized)</option>
              <option value="RECEPTIONIST">Receptionist (Intake Only)</option>
            </select>
          </div>
          <button type="submit" disabled={creating} className="w-full glass-button py-3 mt-2 rounded-xl font-medium flex justify-center">
            {creating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Provision Account'}
          </button>
        </form>
      </motion.div>

      {/* Users Table */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 glass-panel p-6">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Active Personnel Directory</h2>
            <p className="text-sm text-slate-400">View and manage verification statuses</p>
          </div>
        </div>

        {loading ? (
           <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-sm">
                  <th className="py-3 px-4 font-medium">Name</th>
                  <th className="py-3 px-4 font-medium">Email</th>
                  <th className="py-3 px-4 font-medium">Role</th>
                  <th className="py-3 px-4 font-medium">Verification</th>
                  <th className="py-3 px-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-4 text-white font-medium">{u.name}</td>
                    <td className="py-4 px-4 text-slate-400 text-sm">{u.email}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${u.role === 'ADMIN' ? 'bg-primary-500/20 text-primary-400' : 'bg-slate-800 text-slate-300'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {u.isVerified ? (
                        <span className="flex items-center gap-1 text-emerald-400 text-sm font-medium"><CheckCircle2 size={16} /> Active</span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-400 text-sm font-medium"><ShieldAlert size={16} /> Restricted</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {u.role !== 'ADMIN' && (
                        <button 
                          onClick={() => handleVerify(u.id)}
                          className={u.isVerified 
                            ? "px-4 py-1.5 bg-rose-600/20 hover:bg-rose-500/30 text-rose-400 rounded-lg text-xs font-semibold border border-rose-500/30 transition-all opacity-0 group-hover:opacity-100" 
                            : "px-4 py-1.5 bg-emerald-600/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-semibold border border-emerald-500/30 transition-all opacity-0 group-hover:opacity-100"}
                        >
                          {u.isVerified ? 'Deactivate' : 'Verify'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
