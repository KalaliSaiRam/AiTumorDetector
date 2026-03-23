import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import UploadScan from './pages/UploadScan';
import ManageStaff from './pages/ManageStaff';
import PatientDetails from './pages/PatientDetails';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Protected Layout Routes */}
      <Route element={<Layout />}>
        
        {/* ADMIN ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageStaff />} />
        </Route>

        {/* DOCTOR ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/patients/:id" element={<PatientDetails />} />
        </Route>

        {/* RECEPTIONIST ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['RECEPTIONIST']} />}>
          <Route path="/reception" element={<ReceptionistDashboard />} />
          {/* <Route path="/reception/register" element={<RegisterPatient />} /> */}
        </Route>

        {/* SHARED UPLOAD (DOCTOR, RECEPTIONIST, ADMIN) */}
        <Route element={<ProtectedRoute allowedRoles={['DOCTOR', 'RECEPTIONIST', 'ADMIN']} />}>
          <Route path="/upload" element={<UploadScan />} />
        </Route>

      </Route>

      {/* Fallback to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
