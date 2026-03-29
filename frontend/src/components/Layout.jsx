import React, { useContext, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Activity, Users, Settings, Database, UploadCloud, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinks = () => {
    if (!user) return [];
    if (user.role === 'ADMIN') {
      return [
        { path: '/admin', icon: <Activity size={20} />, label: 'Dashboard' },
        { path: '/admin/users', icon: <Users size={20} />, label: 'Manage Staff' },
      ];
    }
    if (user.role === 'DOCTOR') {
      return [
        { path: '/doctor', icon: <Activity size={20} />, label: 'Analytics Hub' },
        { path: '/doctor/patients', icon: <Users size={20} />, label: 'Patient Roster' },
        { path: '/upload', icon: <UploadCloud size={20} />, label: 'Upload MRI' },
      ];
    }
    if (user.role === 'RECEPTIONIST') {
      return [
        { path: '/reception', icon: <Activity size={20} />, label: 'Dashboard / Register' },
        { path: '/upload', icon: <UploadCloud size={20} />, label: 'Upload MRI' },
      ];
    }
    return [];
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-950 overflow-hidden">
      
      {/* MOBILE TOP BAR */}
      <div className="md:hidden flex items-center justify-between p-4 glass-panel m-4 mb-0 z-50 border-b border-white/5 relative">
        <div className="flex items-center gap-3">
          <Database className="text-primary-500" size={24} />
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-primary-400">
            NeuroMRI AI
          </h1>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="text-slate-300 hover:text-white p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}

      {/* SIDEBAR */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 md:w-64 glass-panel m-4 flex flex-col border-r border-white/5 shadow-2xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-[150%] md:translate-x-0'}`}
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="text-primary-500" size={24} />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-primary-400">
              NeuroMRI AI
            </h1>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {getLinks().map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 md:py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30 font-bold'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white font-medium'
                }`
              }
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="px-4 py-3 rounded-xl bg-white/5 mb-4 border border-white/5">
            <p className="text-sm text-slate-400">Logged in as</p>
            <p className="text-white font-medium truncate">{user?.name}</p>
            <p className="text-xs text-primary-400 font-semibold mt-1">{user?.role}</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium border border-transparent hover:border-red-500/20"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-4 md:pl-0 overflow-hidden relative w-full h-full">
        {/* Ambient Glows */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex-1 glass-panel overflow-hidden relative z-10 shadow-2xl flex flex-col">
          <div className="flex-1 overflow-y-auto w-full h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
