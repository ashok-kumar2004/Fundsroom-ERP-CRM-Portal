import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomersApi, createCustomerApi, updateCustomerApi } from '../api/customer.api';
import type { Customer, CreateCustomerPayload, CustomerType, CustomerStatus } from '../types/customer.types';
import { useAuth } from '../context/AuthContext';
import { SearchBar, type FilterOption } from '../components/SearchBar';
import { HighlightText } from '../components/HighlightText';

export const CustomersPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [activeChip, setActiveChip] = useState('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form State
  const [formData, setFormData] = useState<CreateCustomerPayload>({
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'RETAIL',
    address: '',
    status: 'LEAD',
    followUpDate: '',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getCustomersApi({
        page,
        limit: 10,
        search: debouncedSearch,
        status: statusFilter,
        customerType: typeFilter,
      });

      if (res.success) {
        setCustomers(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotalCount(res.pagination.total);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch customers directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, debouncedSearch, statusFilter, typeFilter]);

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
    setTypeFilter('');
    setActiveChip('ALL');
    setPage(1);
  };

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        mobile: customer.mobile,
        email: customer.email || '',
        businessName: customer.businessName || '',
        gstNumber: customer.gstNumber || '',
        customerType: customer.customerType,
        address: customer.address || '',
        status: customer.status,
        followUpDate: customer.followUpDate ? new Date(customer.followUpDate).toISOString().split('T')[0] : '',
        notes: customer.notes || '',
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        mobile: '',
        email: '',
        businessName: '',
        gstNumber: '',
        customerType: 'RETAIL',
        address: '',
        status: 'LEAD',
        followUpDate: '',
        notes: '',
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.mobile.trim()) errors.mobile = 'Mobile number is required';
    else if (!/^\+?[0-9\s-]{8,15}$/.test(formData.mobile)) errors.mobile = 'Invalid mobile number format';

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email address format';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingCustomer) {
        await updateCustomerApi(editingCustomer.id, formData);
        showToast(`Customer '${formData.name}' updated successfully!`);
      } else {
        await createCustomerApi(formData);
        showToast(`Customer '${formData.name}' created successfully!`);
      }
      setShowModal(false);
      fetchCustomers();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save customer', 'error');
    }
  };

  const canManage = ['ADMIN', 'SALES'].includes(user?.role || '');

  const getStatusBadgeStyle = (status: CustomerStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold';
      case 'LEAD':
        return 'bg-purple-100 text-purple-800 border-purple-300 font-extrabold';
      case 'INACTIVE':
        return 'bg-slate-100 text-slate-700 border-slate-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const filterChips: FilterOption[] = [
    { id: 'ALL', label: 'All Customers', icon: '👥' },
    { id: 'LEAD', label: 'Leads', icon: '⚡' },
    { id: 'ACTIVE', label: 'Active Clients', icon: '⭐' },
    { id: 'INACTIVE', label: 'Inactive', icon: '⚪' },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-extrabold text-white border transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-700 border-emerald-600'
              : 'bg-rose-700 border-rose-600'
          }`}
        >
          {toastMessage.type === 'success' ? '✔ ' : '⚠️ '}
          {toastMessage.text}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">
            CRM Directory & Contacts
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">Customer CRM</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Manage wholesale/retail accounts, GST IDs, lead statuses, and CRM follow-up dates ({totalCount} total)
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => handleOpenModal()}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold rounded-2xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            👤 Add New Customer
          </button>
        )}
      </div>

      {/* Big Bold Search Bar */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="🔍 Live search customer name, mobile, firm name, email, GSTIN..."
        chips={filterChips}
        activeChip={activeChip}
        onChipChange={handleChipChange}
        selectFilterValue={typeFilter}
        onSelectFilterChange={(val) => {
          setTypeFilter(val);
          setPage(1);
        }}
        selectOptions={[
          { value: 'RETAIL', label: 'Type: Retail' },
          { value: 'WHOLESALE', label: 'Type: Wholesale' },
          { value: 'DISTRIBUTOR', label: 'Type: Distributor' },
        ]}
        selectPlaceholder="All Customer Types"
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

      {/* Customer Directory Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-lg shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-800">
            <thead className="bg-slate-100 text-slate-600 uppercase text-[11px] font-extrabold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-4 px-5">Customer / Business Name</th>
                <th className="py-4 px-5">Mobile & Email</th>
                <th className="py-4 px-5">GST Number</th>
                <th className="py-4 px-5">Type</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Next Follow-Up</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-sm font-semibold">
                    <div className="inline-flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
                      <span>Loading customer directory...</span>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-sm font-semibold">
                    No customers found matching search filters.
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  return (
                    <tr
                      key={c.id}
                      onClick={() => navigate(`/customers/${c.id}`)}
                      className="hover:bg-emerald-50/50 cursor-pointer transition-colors group"
                    >
                      {/* Name & Business */}
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition">
                          <HighlightText text={c.name} highlight={debouncedSearch} />
                        </div>
                        {c.businessName && (
                          <div className="text-xs text-slate-500 font-medium mt-0.5">
                            <HighlightText text={c.businessName} highlight={debouncedSearch} />
                          </div>
                        )}
                      </td>

                      {/* Mobile & Email */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="font-mono text-slate-900 font-bold text-xs">
                          <HighlightText text={c.mobile} highlight={debouncedSearch} />
                        </div>
                        {c.email && (
                          <div className="text-xs text-slate-500 font-medium">
                            <HighlightText text={c.email} highlight={debouncedSearch} />
                          </div>
                        )}
                      </td>

                      {/* GST Number */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        {c.gstNumber ? (
                          <span className="font-mono text-slate-800 bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-md text-xs font-bold">
                            <HighlightText text={c.gstNumber} highlight={debouncedSearch} />
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Customer Type */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-extrabold text-slate-700">
                          {c.customerType}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getStatusBadgeStyle(c.status)}`}>
                          {c.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Follow up date */}
                      <td className="py-4 px-5 text-slate-600 whitespace-nowrap text-xs font-medium">
                        {c.followUpDate ? new Date(c.followUpDate).toLocaleDateString('en-IN') : '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right whitespace-nowrap space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/customers/${c.id}`)}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-extrabold transition"
                        >
                          👁️ Profile
                        </button>
                        {canManage && (
                          <button
                            onClick={() => handleOpenModal(c)}
                            className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-extrabold transition"
                          >
                            ✏️ Edit
                          </button>
                        )}
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
            Page <strong className="text-slate-900 font-extrabold">{page}</strong> of <strong className="text-slate-900 font-extrabold">{totalPages}</strong> ({totalCount} total customers)
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

      {/* Add / Edit Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg p-6 bg-white border border-slate-200 rounded-2xl shadow-2xl space-y-4 my-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h2 className="text-base font-extrabold text-slate-900">
                {editingCustomer ? 'Edit Customer Details' : 'Add New Customer'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="h-8 w-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Customer Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
                    placeholder="e.g. Ramesh Kumar"
                  />
                  {formErrors.name && <p className="text-rose-600 text-xs font-bold mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Mobile Number *</label>
                  <input
                    type="text"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-600 focus:bg-white"
                    placeholder="e.g. +91 9876543210"
                  />
                  {formErrors.mobile && <p className="text-rose-600 text-xs font-bold mt-1">{formErrors.mobile}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Business / Firm Name</label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
                    placeholder="e.g. Apex Garments Pvt Ltd"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">GST Number (Optional)</label>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-600 focus:bg-white"
                    placeholder="27AAACA12341Z"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
                    placeholder="name@business.com"
                  />
                  {formErrors.email && <p className="text-rose-600 text-xs font-bold mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Customer Type</label>
                  <select
                    value={formData.customerType}
                    onChange={(e) => setFormData({ ...formData, customerType: e.target.value as CustomerType })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-emerald-600 focus:bg-white"
                  >
                    <option value="RETAIL">RETAIL</option>
                    <option value="WHOLESALE">WHOLESALE</option>
                    <option value="DISTRIBUTOR">DISTRIBUTOR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">CRM Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-emerald-600 focus:bg-white"
                  >
                    <option value="LEAD">LEAD</option>
                    <option value="ACTIVE">ACTIVE CLIENT</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Next Follow-Up Date</label>
                <input
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Address Details</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
                  placeholder="Street, City, State, Pincode"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-800 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/30"
                >
                  {editingCustomer ? 'Save Changes' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
