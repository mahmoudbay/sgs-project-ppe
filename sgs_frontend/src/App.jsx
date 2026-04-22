import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Notifications from './components/Notifications';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

// Modules
import RHModule from './pages/modules/RHModule';
import FinanceModule from './pages/modules/FinanceModule';
import SchoolLifeModule from './pages/modules/SchoolLifeModule';
import DocumentsModule from './pages/modules/DocumentsModule';

// Admin
import UserManagement from './pages/admin/UserManagement';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, message: "Erreur de connexion" };
    }
  };

  const hasPermission = (functionality) => {
    const rolePermissions = {
      admin: ['gestion_comptes', 'demande_rh', 'validation_demande_rh', 'gestion_financiere', 'dossiers_eleves', 'generation_certificats', 'resultats_scolaires', 'tableau_bord'],
      employe: ['demande_rh', 'consultation_dossiers'],
      service_financier: ['gestion_financiere'],
      surveillant_general: ['gestion_financiere', 'dossiers_eleves', 'resultats_scolaires'],
      direction: ['consultation_dossiers', 'validation_demande_rh', 'tableau_bord'],
    };
    return (rolePermissions[user?.role] || []).includes(functionality);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;

  if (!isAuthenticated) return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} user={user} hasPermission={hasPermission} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar user={user} onLogout={() => setIsAuthenticated(false)} notifications={notifications} unreadCount={0} />
          <Notifications notifications={notifications} />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/dashboard" element={<Dashboard user={user} api={api} hasPermission={hasPermission} />} />
              <Route path="/rh/*" element={<RHModule user={user} api={api} hasPermission={hasPermission} />} />
              <Route path="/finance/*" element={<FinanceModule user={user} api={api} hasPermission={hasPermission} />} />
              <Route path="/school-life/*" element={<SchoolLifeModule user={user} api={api} hasPermission={hasPermission} />} />
              <Route path="/documents/*" element={<DocumentsModule user={user} api={api} hasPermission={hasPermission} />} />
              {user?.role === 'admin' && <Route path="/admin/users" element={<UserManagement api={api} user={user} />} />}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
