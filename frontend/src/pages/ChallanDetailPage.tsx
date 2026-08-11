import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getChallanByIdApi, confirmChallanApi, cancelChallanApi } from '../api/challan.api';
import type { Challan, ChallanItem } from '../types/challan.types';
import { useAuth } from '../context/AuthContext';
import { IconPrint, IconCheck, IconCross, IconAlert, IconArrowLeft } from '../components/Icons';

export const ChallanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Action Modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchChallanDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await getChallanByIdApi(id);
      if (res.success && res.challan) {
        setChallan(res.challan);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load Sales Challan details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallanDetail();
  }, [id]);

  const handleConfirmChallan = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await confirmChallanApi(id);
      showToast(`Challan '${challan?.challanNumber}' confirmed and stock deducted!`);
      setShowConfirmModal(false);
      fetchChallanDetail();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to confirm Challan', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelChallan = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await cancelChallanApi(id);
      showToast(`Challan '${challan?.challanNumber}' cancelled successfully!`);
      setShowCancelModal(false);
      fetchChallanDetail();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to cancel Challan', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const canAction = ['ADMIN', 'SALES'].includes(user?.role || '');

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500 font-semibold">Loading Tax Invoice & Delivery Note...</div>;
  }

  if (error || !challan) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
        {error || 'Sales Challan invoice not found'}
      </div>
    );
  }

  const itemsList: ChallanItem[] = challan.items || challan.ChallanItems || [];
  const subtotal = itemsList.reduce(
    (sum: number, item: ChallanItem) => sum + item.unitPriceSnapshot * item.quantity,
    0
  );
  const taxAmount = subtotal * 0.18; // 18% GST
  const grandTotal = subtotal + taxAmount;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Print Specific CSS Rules */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .no-print, header, sidebar, nav, aside {
            display: none !important;
          }
          .print-area {
            box-shadow: none !important;
            border: 1px solid #000 !important;
            border-radius: 0 !important;
            padding: 20px !important;
            margin: 0 !important;
            width: 100% !important;
          }
          .print-border-black {
            border-color: #000 !important;
          }
          .print-text-black {
            color: #000 !important;
          }
        }
      `}</style>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`no-print fixed top-5 right-5 z-50 px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-extrabold text-white border transition-all flex items-center gap-2 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-700 border-emerald-600'
              : 'bg-rose-700 border-rose-600'
          }`}
        >
          {toastMessage.type === 'success' ? <IconCheck className="w-4 h-4" /> : <IconAlert className="w-4 h-4" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Action Header Controls Bar */}
      <div className="no-print flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <Link to="/challans" className="text-xs text-slate-600 hover:text-indigo-600 font-extrabold transition flex items-center gap-1.5">
          <IconArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sales Challans Directory</span>
        </Link>
        <div className="flex items-center gap-2">
          {canAction && challan.status === 'DRAFT' && (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition shadow-md flex items-center gap-1.5"
            >
              <IconCheck className="w-3.5 h-3.5" />
              <span>Confirm Order & Deduct Stock</span>
            </button>
          )}
          {canAction && challan.status !== 'CANCELLED' && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold rounded-xl transition flex items-center gap-1.5"
            >
              <IconCross className="w-3.5 h-3.5" />
              <span>Cancel Order</span>
            </button>
          )}
          <button
            onClick={handlePrintPDF}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl transition shadow-md flex items-center gap-1.5"
          >
            <IconPrint className="w-4 h-4" />
            <span>Export / Print PDF Invoice</span>
          </button>
        </div>
      </div>

      {/* Printable Corporate Tax Invoice Paper Sheet (Clean Minimal Design like Case Study Document) */}
      <div className="print-area p-8 sm:p-12 bg-white border border-slate-300 rounded-3xl text-slate-900 shadow-2xl space-y-6 font-sans">
        {/* Top Header */}
        <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">FUNDSROOM OPERATIONS</h1>
            <p className="text-xs font-semibold text-slate-600">Mini ERP + CRM Wholesale Operations Portal</p>
            <p className="text-xs text-slate-500">GSTIN: 27AAAAF1234F1Z9 | Reg Office: Mumbai, MH - 400001</p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-700 print-text-black block">
              TAX INVOICE / DELIVERY NOTE
            </span>
            <div className="text-xl font-black font-mono text-slate-900">{challan.challanNumber}</div>
            <div className="text-xs text-slate-600 font-medium">
              Date: <strong className="font-mono text-slate-900">{new Date(challan.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
            </div>
            <div className="text-xs font-bold text-slate-800 uppercase">
              Status: <span className="underline decoration-indigo-500 font-extrabold">{challan.status}</span>
            </div>
          </div>
        </div>

        {/* Invoice Customer Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 print-border-black space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block border-b border-slate-200 pb-1">
              Customer Details
            </span>
            <div className="text-base font-extrabold text-slate-900 pt-1">{challan.customer?.name}</div>
            {challan.customer?.businessName && (
              <div className="text-xs font-bold text-slate-700">{challan.customer.businessName}</div>
            )}
            <div className="text-xs text-slate-600">{challan.customer?.address || 'Address: N/A'}</div>
            <div className="text-xs text-slate-800 font-mono font-bold">Mobile: {challan.customer?.mobile}</div>
            {challan.customer?.gstNumber && (
              <div className="text-xs text-slate-900 font-mono font-extrabold">GSTIN: {challan.customer.gstNumber}</div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 print-border-black space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block border-b border-slate-200 pb-1">
              Order Reference
            </span>
            <div className="text-xs text-slate-700 pt-1">
              Generated By: <strong className="text-slate-900 font-bold">{challan.user?.name || 'Staff User'}</strong> ({challan.user?.role || 'STAFF'})
            </div>
            <div className="text-xs text-slate-700">
              Total Quantity: <strong className="text-slate-900 font-mono font-extrabold">{challan.totalQuantity} pcs</strong>
            </div>
            <div className="text-xs text-slate-700">
              Payment Terms: <strong className="text-slate-900 font-bold">Immediate Stock Dispatch</strong>
            </div>
          </div>
        </div>

        {/* Clean Line Items Snapshot Table */}
        <div className="space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">Itemized Product Snapshot</span>
          <div className="overflow-x-auto rounded-2xl border border-slate-300 print-border-black">
            <table className="w-full text-left text-xs sm:text-sm text-slate-900">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[11px] font-extrabold tracking-wider border-b border-slate-300 print-border-black">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">SKU / Code</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price (₹)</th>
                  <th className="py-3 px-4 text-right">Line Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 print-border-black">
                {itemsList.map((item: ChallanItem, idx: number) => {
                  const lineTotal = item.unitPriceSnapshot * item.quantity;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{item.productNameSnapshot}</td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700 print-text-black">{item.productSkuSnapshot}</td>
                      <td className="py-3 px-4 text-center font-extrabold text-slate-900">{item.quantity} pcs</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-700">₹{item.unitPriceSnapshot.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900">
                        ₹{lineTotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calculation Totals */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
          <div className="flex-1 text-xs text-slate-500 space-y-1 font-medium">
            <span className="font-extrabold uppercase text-slate-700 block">Notes:</span>
            <p>1. Goods once sold/dispatched will not be taken back.</p>
            <p>2. Subject to Mumbai Jurisdiction.</p>
          </div>

          <div className="w-full sm:w-72 p-4 rounded-2xl bg-slate-50 border border-slate-300 print-border-black space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between text-slate-700 font-medium">
              <span>Subtotal:</span>
              <span className="font-mono font-bold text-slate-900">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-700 font-medium pb-2 border-b border-slate-200 print-border-black">
              <span>GST (18%):</span>
              <span className="font-mono font-bold text-slate-900">₹{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900 pt-1">
              <span>Grand Total:</span>
              <span className="font-mono font-black text-indigo-700 print-text-black">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Signature Line */}
        <div className="grid grid-cols-2 gap-8 pt-10 border-t-2 border-slate-900 text-xs text-slate-900 font-bold">
          <div>
            <p>Customer Receiver Signature</p>
            <div className="mt-10 border-b border-slate-900 w-44"></div>
            <p className="text-[10px] text-slate-500 font-medium mt-1">Received goods in good condition</p>
          </div>
          <div className="text-right">
            <p>Authorized Signatory (Fundsroom ERP)</p>
            <div className="mt-10 border-b border-slate-900 w-44 ml-auto"></div>
            <p className="text-[10px] text-slate-500 font-medium mt-1">Dispatch Manager Signature</p>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 bg-white border border-slate-200 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-base font-extrabold text-slate-900">Confirm Delivery Challan</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Confirming <strong>{challan.challanNumber}</strong> will immediately deduct{' '}
              <strong className="text-slate-900">{challan.totalQuantity} pcs</strong> from your live inventory catalog.
            </p>
            <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-800 text-xs font-bold rounded-xl"
              >
                Go Back
              </button>
              <button
                disabled={actionLoading}
                onClick={handleConfirmChallan}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md"
              >
                {actionLoading ? 'Processing...' : 'Yes, Confirm & Deduct Stock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 bg-white border border-slate-200 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚨</span>
              <h3 className="text-base font-extrabold text-slate-900">Cancel Delivery Challan?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {challan.status === 'CONFIRMED' ? (
                <>
                  Warning: Cancelling a <strong>CONFIRMED</strong> Challan will automatically{' '}
                  <strong className="text-emerald-700">RESTOCK {challan.totalQuantity} pcs</strong> back into
                  live inventory and log an IN stock movement entry.
                </>
              ) : (
                <>Are you sure you want to mark this draft Challan as cancelled?</>
              )}
            </p>
            <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-800 text-xs font-bold rounded-xl"
              >
                Go Back
              </button>
              <button
                disabled={actionLoading}
                onClick={handleCancelChallan}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-md"
              >
                {actionLoading ? 'Cancelling...' : 'Yes, Cancel Challan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
