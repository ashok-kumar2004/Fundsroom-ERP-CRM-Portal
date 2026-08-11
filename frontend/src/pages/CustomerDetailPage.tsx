import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCustomerByIdApi, addFollowUpApi } from '../api/customer.api';
import type { Customer, FollowUpNote } from '../types/customer.types';
import { useAuth } from '../context/AuthContext';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Follow-up Note Form
  const [noteText, setNoteText] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  const fetchCustomerDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await getCustomerByIdApi(id);
      if (res.success && res.customer) {
        setCustomer(res.customer);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load customer profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerDetail();
  }, [id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !noteText.trim()) return;

    setSubmittingNote(true);
    try {
      await addFollowUpApi(id, noteText);
      setNoteText('');
      fetchCustomerDetail();
    } catch (err: any) {
      console.error('Failed to add note:', err);
    } fontally: {
      setSubmittingNote(false);
    }
  };

  const canAddNote = ['ADMIN', 'SALES', 'ACCOUNTS'].includes(user?.role || '');

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500 font-semibold">Loading customer CRM profile...</div>;
  }

  if (error || !customer) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
        {error || 'Customer profile not found'}
      </div>
    );
  }

  const notesList: FollowUpNote[] = customer.CustomerNotes || customer.FollowUps || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
      <div>
        <Link to="/customers" className="text-xs text-slate-600 hover:text-indigo-600 font-bold transition">
          ← Back to Customer Directory
        </Link>
      </div>

      {/* Customer Header & Details Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">{customer.name}</h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                  customer.status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : customer.status === 'LEAD'
                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                {customer.status}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">{customer.businessName || 'Individual Customer'}</p>
          </div>
          <div className="text-xs text-slate-600 font-medium text-left sm:text-right">
            <div>Type: <strong className="text-slate-900 font-extrabold">{customer.customerType}</strong></div>
            <div>Joined: <span className="text-slate-700 font-bold">{new Date(customer.createdAt).toLocaleDateString()}</span></div>
          </div>
        </div>

        {/* Profile Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-medium">
            <span className="text-[11px] uppercase font-extrabold text-slate-500 block">Mobile Number</span>
            <span className="font-mono text-slate-900 font-bold text-sm">{customer.mobile}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-medium">
            <span className="text-[11px] uppercase font-extrabold text-slate-500 block">Email Address</span>
            <span className="text-slate-900 font-bold">{customer.email || 'N/A'}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-medium">
            <span className="text-[11px] uppercase font-extrabold text-slate-500 block">GST Number</span>
            <span className="font-mono text-slate-900 font-bold">{customer.gstNumber || 'N/A'}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-medium">
            <span className="text-[11px] uppercase font-extrabold text-slate-500 block">Next Follow-Up Date</span>
            <span className="text-amber-700 font-extrabold">
              {customer.followUpDate ? new Date(customer.followUpDate).toLocaleDateString() : 'None Scheduled'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 sm:col-span-2 font-medium">
            <span className="text-[11px] uppercase font-extrabold text-slate-500 block">Address</span>
            <span className="text-slate-800">{customer.address || 'No address provided'}</span>
          </div>
        </div>

        {customer.notes && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm">
            <span className="text-[11px] uppercase font-extrabold text-slate-500 block mb-1">General Profile Notes</span>
            <p className="text-slate-700 italic font-medium">{customer.notes}</p>
          </div>
        )}
      </div>

      {/* Follow-Up Timeline Section */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-xl space-y-6">
        <h2 className="text-lg font-extrabold tracking-tight">CRM Follow-Up Note History ({notesList.length})</h2>

        {/* Add Note Form */}
        {canAddNote && (
          <form onSubmit={handleAddNote} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Add New Follow-Up Note</label>
            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Record call discussion, payment reminder, or meeting summary..."
              className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 resize-none font-medium"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingNote || !noteText.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-extrabold rounded-xl transition shadow-md shadow-indigo-600/20"
              >
                {submittingNote ? 'Saving...' : '📝 Save Follow-Up Note'}
              </button>
            </div>
          </form>
        )}

        {/* Notes Timeline */}
        <div className="space-y-3">
          {notesList.length === 0 ? (
            <p className="text-xs text-slate-500 italic text-center py-4 font-medium">No follow-up notes recorded yet.</p>
          ) : (
            notesList.map((n) => (
              <div key={n.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs sm:text-sm">
                <div className="flex justify-between items-center text-xs text-slate-500 font-semibold">
                  <span className="font-extrabold text-indigo-700">
                    {n.user?.name || 'Staff User'} ({n.user?.role || 'STAFF'})
                  </span>
                  <span className="font-mono">{new Date(n.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-slate-800 font-medium leading-relaxed mt-1">{n.note}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
