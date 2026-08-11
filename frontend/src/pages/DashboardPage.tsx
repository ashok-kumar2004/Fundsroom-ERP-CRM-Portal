import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.config';

interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  totalChallans: number;
  draftChallanCount: number;
  confirmedChallansValue: number;
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentChallans, setRecentChallans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data.success) {
          setStats(res.data.stats);
          setRecentChallans(res.data.recentChallans || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 text-white border border-slate-800 relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-400">
              Operations Control Center
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Welcome back, {user?.name} 👋</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
              Active Role: <span className="font-extrabold text-indigo-300">{user?.role}</span> — Live summary metrics across CRM, Inventory, and Sales Delivery Challans.
            </p>
          </div>
          {['ADMIN', 'SALES'].includes(user?.role || '') && (
            <button
              onClick={() => navigate('/challans/create')}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-extrabold rounded-2xl transition shadow-lg shadow-indigo-600/30 shrink-0"
            >
              📋 Issue Delivery Challan
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-md space-y-1.5 hover:border-emerald-400 transition">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">Total Customers</span>
          <div className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">{loading ? '...' : stats?.totalCustomers || 0}</div>
          <span className="text-xs text-slate-500 font-semibold">Leads & Active Clients</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-md space-y-1.5 hover:border-amber-400 transition">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">Low Stock Alerts</span>
          <div className={`text-3xl sm:text-4xl font-black tracking-tight ${(stats?.lowStockCount || 0) > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {loading ? '...' : stats?.lowStockCount || 0}
          </div>
          <span className="text-xs text-slate-500 font-semibold">Below Reorder Level</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-md space-y-1.5 hover:border-indigo-400 transition">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">Draft Challans</span>
          <div className="text-3xl sm:text-4xl font-black text-indigo-600 tracking-tight">{loading ? '...' : stats?.draftChallanCount || 0}</div>
          <span className="text-xs text-slate-500 font-semibold">Pending Order Dispatch</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-md space-y-1.5 hover:border-cyan-400 transition">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">Confirmed Sales Value</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
            ₹{loading ? '...' : (stats?.confirmedChallansValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-slate-500 font-semibold">Stock Deducted Orders</span>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Customer CRM */}
        {['ADMIN', 'SALES', 'ACCOUNTS'].includes(user?.role || '') && (
          <Link
            to="/customers"
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-xl transition-all group flex flex-col justify-between shadow-md"
          >
            <div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-2xl mb-4 font-bold">
                👥
              </div>
              <h3 className="font-extrabold text-slate-900 group-hover:text-emerald-600 transition text-base">Customer CRM Directory</h3>
              <p className="text-xs text-slate-600 mt-1.5 font-medium leading-relaxed">
                Manage leads, retail/wholesale accounts, GST profile details, and set follow-up notes.
              </p>
            </div>
            <div className="mt-5 text-xs font-extrabold text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Open Directory →
            </div>
          </Link>
        )}

        {/* Product & Stock */}
        {['ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS'].includes(user?.role || '') && (
          <Link
            to="/products"
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-xl transition-all group flex flex-col justify-between shadow-md"
          >
            <div>
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center text-2xl mb-4 font-bold">
                📦
              </div>
              <h3 className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition text-base">Product & Stock Catalog</h3>
              <p className="text-xs text-slate-600 mt-1.5 font-medium leading-relaxed">
                Track unit prices, SKUs, warehouse location sections, low stock alerts, and log IN/OUT stock adjustments.
              </p>
            </div>
            <div className="mt-5 text-xs font-extrabold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              View Catalog →
            </div>
          </Link>
        )}

        {/* Sales Challans */}
        {['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'].includes(user?.role || '') && (
          <Link
            to="/challans"
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-cyan-500 hover:shadow-xl transition-all group flex flex-col justify-between shadow-md"
          >
            <div>
              <div className="h-12 w-12 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center text-2xl mb-4 font-bold">
                🧾
              </div>
              <h3 className="font-extrabold text-slate-900 group-hover:text-cyan-600 transition text-base">Sales Delivery Challans</h3>
              <p className="text-xs text-slate-600 mt-1.5 font-medium leading-relaxed">
                Issue sales delivery notes, auto-generate sequential challan numbers, and print professional PDF invoices.
              </p>
            </div>
            <div className="mt-5 text-xs font-extrabold text-cyan-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Manage Orders →
            </div>
          </Link>
        )}
      </div>

      {/* Recent Activity Table */}
      {recentChallans.length > 0 && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-md space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-extrabold text-slate-900">Recent Delivery Challans</h2>
            <Link to="/challans" className="text-xs font-extrabold text-indigo-600 hover:text-indigo-700">
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-800">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200 font-extrabold">
                <tr>
                  <th className="py-3 px-4">Challan #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentChallans.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/challans/${c.id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">{c.challanNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{c.customer?.name || 'Customer'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        c.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : c.status === 'DRAFT'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 font-mono font-medium">
                      {new Date(c.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
