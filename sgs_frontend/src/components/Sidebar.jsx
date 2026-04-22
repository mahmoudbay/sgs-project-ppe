import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  BookOpen,
  FileText,
  Settings,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

/**
 * Sidebar Component
 * 
 * Displays the main navigation menu with role-based access control.
 * Shows different menu items based on user permissions.
 */
export default function Sidebar({ isOpen, onToggle, user, hasPermission }) {
  const location = useLocation();

  const menuItems = [
    {
      label: 'Tableau de Bord',
      path: '/dashboard',
      icon: LayoutDashboard,
      permission: null,
    },
    {
      label: 'Ressources Humaines',
      path: '/rh',
      icon: Users,
      permission: 'demande_rh',
    },
    {
      label: 'Gestion Financière',
      path: '/finance',
      icon: DollarSign,
      permission: 'gestion_financiere',
    },
    {
      label: 'Vie Scolaire',
      path: '/school-life',
      icon: BookOpen,
      permission: 'dossiers_eleves',
    },
    {
      label: 'Documents Scolaires',
      path: '/documents',
      icon: FileText,
      permission: 'generation_certificats',
    },
    {
      label: 'Administration',
      path: '/admin/users',
      icon: Settings,
      permission: null,
      adminOnly: true,
    },
  ];

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.adminOnly) {
      return user?.role === 'admin';
    }
    if (item.permission) {
      return hasPermission(item.permission);
    }
    return true;
  });

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-40 lg:hidden p-2 bg-white rounded-lg shadow-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:relative lg:translate-x-0 z-30 h-screen w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-transform duration-300 ease-in-out`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center font-bold text-lg">
              SGS
            </div>
            <div>
              <h2 className="text-lg font-bold">SGS</h2>
              <p className="text-xs text-gray-400">Gestion Scolaire</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 bg-gray-800 border-b border-gray-700">
          <p className="text-sm font-medium text-gray-100">
            {user?.prenom} {user?.nom}
          </p>
          <p className="text-xs text-gray-400 capitalize mt-1">
            {user?.role?.replace('_', ' ')}
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    onToggle();
                  }
                }}
                className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {active && <ChevronRight size={18} />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <div className="text-xs text-gray-400 space-y-1">
            <p>SGS v1.0</p>
            <p>© 2024 College Borj Azaitoune</p>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}
