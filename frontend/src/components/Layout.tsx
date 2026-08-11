import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  IconDashboard,
  IconCustomers,
  IconWarehouse,
  IconChallans,
  IconCross,
} from './Icons';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-300 font-extrabold';
      case 'SALES':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold';
      case 'WAREHOUSE':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-extrabold';
      case 'ACCOUNTS':
        return 'bg-blue-100 text-blue-800 border-blue-300 font-extrabold';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300 font-extrabold';
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'], icon: IconDashboard },
    { label: 'Customer CRM', path: '/customers', roles: ['ADMIN', 'SALES', 'ACCOUNTS'], icon: IconCustomers },
    { label: 'Products & Inventory', path: '/products', roles: ['ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS'], icon: IconWarehouse },
    { label: 'Sales Challans', path: '/challans', roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'], icon: IconChallans },
  ];

  const filteredNav = navItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-[#0f172a] text-slate-100 z-20">
        {/* Logo Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-base shadow-md">
            ERP
          </div>
          <div>
            <h1 className="font-extrabold text-white tracking-tight text-base leading-tight">
              Fundsroom <span className="text-indigo-400">ERP</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-semibold">Operations Portal</p>
          </div>
        </div>

        {/* User Card */}
        <div className="px-4 py-4">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-9 w-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-extrabold text-indigo-300 shrink-0 text-sm">
                {user?.name.charAt(0)}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getRoleBadgeStyle(user?.role)}`}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {filteredNav.map((item) => {
            const IconComp = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <IconComp className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 transition shadow-sm"
          >
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-700 hover:text-slate-900 p-2 rounded-xl bg-slate-100 border border-slate-200"
            >
              {mobileMenuOpen ? <IconCross className="w-5 h-5" /> : '☰'}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Portal /</span>
              <span className="text-xs font-bold text-slate-900">{user?.role} Workspace</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${getRoleBadgeStyle(user?.role)}`}>
              Role: {user?.role}
            </span>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0f172a] text-white p-4 space-y-2 border-b border-slate-800">
            {filteredNav.map((item) => {
              const IconComp = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-200 bg-slate-900 border border-slate-800"
                >
                  <IconComp className="w-4 h-4 text-indigo-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
