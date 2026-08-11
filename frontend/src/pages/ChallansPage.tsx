import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChallansApi } from '../api/challan.api';
import type { Challan } from '../types/challan.types';
import { useAuth } from '../context/AuthContext';
import { SearchBar, type FilterOption } from '../components/SearchBar';
import { HighlightText } from '../components/HighlightText';

export const ChallansPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeChip, setActiveChip] = useState('ALL');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchChallans = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getChallansApi({
        page,
        limit: 10,
        status: statusFilter,
        search: debouncedSearch,
      });

      if (res.success) {
        setChallans(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotalCount(res.pagination.total);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch Sales Challan list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [page, statusFilter, debouncedSearch]);

  const handleChipChange = (chipId: string) => {
    setActiveChip(chipId);
    setPage(1);
    if (chipId === 'ALL') {
      setStatusFilter('');
    } else {
      setStatusFilter(chipId);
    }
  };

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setActiveChip('ALL');
    setPage(1);
  };

  const canCreate = ['ADMIN', 'SALES'].includes(user?.role || '');

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold';
      case 'DRAFT':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-extrabold';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-extrabold';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const filterChips: FilterOption[] = [
    { id: 'ALL', label: 'All Orders', icon: '🧾' },
    { id: 'DRAFT', label: 'Drafts', icon: '📝' },
    { id: 'CONFIRMED', label: 'Confirmed', icon: '✅' },
    { id: 'CANCELLED', label: 'Cancelled', icon: '❌' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">
            Dispatch Notes & Invoices
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">Sales Delivery Challans</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Manage order dispatch notes, automatic stock deductions, and PDF invoice generation ({totalCount} total)
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => navigate('/challans/create')}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-extrabold rounded-2xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            📋 Create New Challan
          </button>
        )}
      </div>

      {/* Big Bold Search Bar */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="🔍 Live search Challan # (e.g. CH-2026-001) or Customer Name..."
        chips={filterChips}
        activeChip={activeChip}
        onChipChange={handleChipChange}
        selectFilterValue={statusFilter}
        onSelectFilterChange={(val) => {
          setStatusFilter(val);
          setActiveChip(val || 'ALL');
          setPage(1);
        }}
        selectOptions={[
          { value: 'DRAFT', label: 'Status: Draft' },
          { value: 'CONFIRMED', label: 'Status: Confirmed' },
          { value: 'CANCELLED', label: 'Status: Cancelled' },
        ]}
        selectPlaceholder="All Challan Statuses"
        totalMatches={totalCount}
        isSearching={loading}
        onClearAll={handleClearAllFilters}
      />

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
          ⚠️ {error}
        </div>
      )}

      {/* Challans Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-lg shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-800">
            <thead className="bg-slate-100 text-slate-600 uppercase text-[11px] font-extrabold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-4 px-5">Challan Number</th>
                <th className="py-4 px-5">Customer Name</th>
                <th className="py-4 px-5">Line Items</th>
                <th className="py-4 px-5">Total Quantity</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Created Date</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-sm font-semibold">
                    <div className="inline-flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                      <span>Loading delivery challans...</span>
                    </div>
                  </td>
                </tr>
              ) : challans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-sm font-semibold">
                    No sales delivery challans found.
                  </td>
                </tr>
              ) : (
                challans.map((c) => {
                  const itemsList = c.items || c.ChallanItems || [];
                  const itemCount = itemsList.length;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => navigate(`/challans/${c.id}`)}
                      className="hover:bg-indigo-50/50 cursor-pointer transition-colors group"
                    >
                      {/* Challan Number */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg text-xs font-extrabold shadow-xs">
                          <HighlightText text={c.challanNumber} highlight={debouncedSearch} />
                        </span>
                      </td>

                      {/* Customer Name */}
                      <td className="py-4 px-5 font-bold text-slate-900 group-hover:text-indigo-600 transition">
                        <HighlightText text={c.customer?.name || 'Unknown Customer'} highlight={debouncedSearch} />
                        {c.customer?.businessName && (
                          <span className="block text-xs text-slate-500 font-medium">
                            {c.customer.businessName}
                          </span>
                        )}
                      </td>

                      {/* Line items count */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                          📦 {itemCount} product{itemCount === 1 ? '' : 's'}
                        </span>
                      </td>

                      {/* Total quantity */}
                      <td className="py-4 px-5 whitespace-nowrap font-mono text-slate-900 font-bold">
                        {c.totalQuantity} units
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getStatusBadgeStyle(c.status)}`}>
                          {c.status === 'CONFIRMED' ? '✅ CONFIRMED' : c.status === 'DRAFT' ? '📝 DRAFT' : '❌ CANCELLED'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-5 text-slate-600 whitespace-nowrap text-xs font-medium">
                        {new Date(c.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Action View */}
                      <td className="py-4 px-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/challans/${c.id}`)}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ml-auto"
                        >
                          📄 View / Print PDF
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs sm:text-sm text-slate-600 bg-slate-50">
          <div>
            Page <strong className="text-slate-900 font-extrabold">{page}</strong> of <strong className="text-slate-900 font-extrabold">{totalPages}</strong> ({totalCount} total challans)
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold disabled:opacity-40 rounded-xl transition shadow-xs"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold disabled:opacity-40 rounded-xl transition shadow-xs"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
