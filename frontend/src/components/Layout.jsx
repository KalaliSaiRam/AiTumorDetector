import React, { useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Activity, Users, Settings, Database, UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

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
        { path: '/doctor', icon: <Activity size={20} />, label: 'My Patients' },
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
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 glass-panel m-4 flex flex-col border-r border-white/5"
      >
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <Database className="text-primary-500" size={24} />
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-primary-400">
            NeuroMRI AI
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {getLinks().map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {link.icon}
              <span className="font-medium">{link.label}</span>
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
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-4 pl-0 overflow-hidden relative">
        {/* Ambient Glows */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex-1 glass-panel overflow-y-auto relative z-10 shadow-2xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
