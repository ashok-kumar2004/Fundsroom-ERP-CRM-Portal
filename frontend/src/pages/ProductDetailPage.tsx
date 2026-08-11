import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductByIdApi, addStockMovementApi, getStockHistoryApi } from '../api/product.api';
import type { Product, StockMovement, StockMovementPayload } from '../types/product.types';
import { useAuth } from '../context/AuthContext';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [history, setHistory] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState('');

  // Pagination for stock movements
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyCount, setHistoryCount] = useState(0);

  // Modal State for stock IN/OUT adjustment
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [movementForm, setMovementForm] = useState<StockMovementPayload>({
    quantityChanged: 1,
    movementType: 'IN',
    reason: '',
  });

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchProductDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await getProductByIdApi(id);
      if (res.success && res.product) {
        setProduct(res.product);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const fetchStockHistory = async () => {
    if (!id) return;
    setLoadingHistory(true);
    try {
      const res = await getStockHistoryApi(id, historyPage, 10);
      if (res.success) {
        setHistory(res.data);
        setHistoryTotalPages(res.pagination.totalPages);
        setHistoryCount(res.pagination.total);
      }
    } catch (err: any) {
      console.error('Failed to load stock movements:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  useEffect(() => {
    fetchStockHistory();
  }, [id, historyPage]);

  const handleMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || movementForm.quantityChanged <= 0) return;

    try {
      await addStockMovementApi(id, movementForm);
      showToast(`Stock ${movementForm.movementType} adjustment recorded!`);
      setShowMovementModal(false);
      setMovementForm({ quantityChanged: 1, movementType: 'IN', reason: '' });
      fetchProductDetail();
      fetchStockHistory();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Stock adjustment failed', 'error');
    }
  };

  const canAdjustStock = ['ADMIN', 'WAREHOUSE'].includes(user?.role || '');

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500 font-semibold">Loading inventory product details...</div>;
  }

  if (error || !product) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
        {error || 'Product not found'}
      </div>
    );
  }

  const isLowStock = product.currentStock <= product.minStockAlert;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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

      {/* Back Link */}
      <div>
        <Link to="/products" className="text-xs text-slate-600 hover:text-indigo-600 font-bold transition">
          ← Back to Inventory Catalog
        </Link>
      </div>

      {/* Product Detail Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">{product.name}</h1>
              {isLowStock && (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                  ⚠️ Low Stock Alert
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              SKU: <strong className="font-mono text-indigo-700 font-bold">{product.sku}</strong> | Category: {product.category || 'General'}
            </p>
          </div>
          {canAdjustStock && (
            <button
              onClick={() => setShowMovementModal(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-extrabold rounded-2xl transition shadow-lg shadow-indigo-600/20"
            >
              📦 Adjust Stock IN / OUT
            </button>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] uppercase font-extrabold text-slate-500 block">Current Stock</span>
            <span className={`text-2xl font-black ${isLowStock ? 'text-amber-700' : 'text-emerald-700'}`}>
              {product.currentStock} pcs
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] uppercase font-extrabold text-slate-500 block">Min Stock Alert</span>
            <span className="text-2xl font-extrabold text-slate-800">{product.minStockAlert} pcs</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] uppercase font-extrabold text-slate-500 block">Unit Price</span>
            <span className="text-2xl font-black text-indigo-700 font-mono">
              ₹{product.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] uppercase font-extrabold text-slate-500 block">Warehouse Location</span>
            <span className="text-sm font-extrabold text-slate-800">{product.location || 'Unassigned'}</span>
          </div>
        </div>
      </div>

      {/* Stock Movement History Table */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-extrabold tracking-tight">Stock Movement Audit History ({historyCount})</h2>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs sm:text-sm text-slate-800">
            <thead className="bg-slate-100 text-slate-600 uppercase text-[11px] font-extrabold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Movement</th>
                <th className="py-3.5 px-4">Quantity</th>
                <th className="py-3.5 px-4">Reason / Reference</th>
                <th className="py-3.5 px-4">Logged By</th>
                <th className="py-3.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loadingHistory ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-semibold">
                    Loading stock movements...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-semibold">
                    No stock movements recorded yet.
                  </td>
                </tr>
              ) : (
                history.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold border ${
                          m.movementType === 'IN'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}
                      >
                        {m.movementType === 'IN' ? '▲ Stock IN' : '▼ Stock OUT'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900">{m.quantityChanged} pcs</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{m.reason || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {m.user?.name || 'Staff User'} ({m.user?.role || 'STAFF'})
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-500 font-medium">
                      {new Date(m.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* History Pagination */}
        <div className="flex justify-between items-center text-xs font-bold text-slate-600 pt-2">
          <span>Page {historyPage} of {historyTotalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={historyPage <= 1}
              onClick={() => setHistoryPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg disabled:opacity-40"
            >
              Prev
            </button>
            <button
              disabled={historyPage >= historyTotalPages}
              onClick={() => setHistoryPage((p) => Math.min(p + 1, historyTotalPages))}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {showMovementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 bg-white border border-slate-200 rounded-2xl shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h2 className="text-base font-extrabold text-slate-900">Record Stock Movement</h2>
              <button
                onClick={() => setShowMovementModal(false)}
                className="h-8 w-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleMovementSubmit} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Movement Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMovementForm({ ...movementForm, movementType: 'IN' })}
                    className={`py-2.5 rounded-xl font-extrabold border transition ${
                      movementForm.movementType === 'IN'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    📥 Stock IN (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementForm({ ...movementForm, movementType: 'OUT' })}
                    className={`py-2.5 rounded-xl font-extrabold border transition ${
                      movementForm.movementType === 'OUT'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    📤 Stock OUT (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  value={movementForm.quantityChanged}
                  onChange={(e) => setMovementForm({ ...movementForm, quantityChanged: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Reason / Reference</label>
                <input
                  type="text"
                  value={movementForm.reason}
                  onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-indigo-600"
                  placeholder="e.g. Shipment arrival / Stock audit correction"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowMovementModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-800 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
