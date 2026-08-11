import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCustomersApi } from '../api/customer.api';
import { getProductsApi } from '../api/product.api';
import { createChallanApi } from '../api/challan.api';
import type { Customer } from '../types/customer.types';
import type { Product } from '../types/product.types';

interface LineItemState {
  productId: string;
  quantity: number;
  productSearch?: string;
}

export const CreateChallanPage: React.FC = () => {
  const navigate = useNavigate();

  // Reference catalogs
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);

  // Search filter terms
  const [customerSearch, setCustomerSearch] = useState('');

  // Selected customer & items
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [items, setItems] = useState<LineItemState[]>([{ productId: '', quantity: 1, productSearch: '' }]);

  // Confirmation dialog & state
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [apiError, setApiError] = useState<{ message: string; details?: any[] } | null>(null);

  useEffect(() => {
    const fetchCatalogs = async () => {
      setLoadingCatalogs(true);
      try {
        const [custRes, prodRes] = await Promise.all([
          getCustomersApi({ limit: 100 }),
          getProductsApi({ limit: 100 }),
        ]);
        if (custRes.success) setCustomers(custRes.data);
        if (prodRes.success) setProducts(prodRes.data);
      } catch (err: any) {
        console.error('Failed to load customers/products catalog:', err);
      } finally {
        setLoadingCatalogs(false);
      }
    };
    fetchCatalogs();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    if (!customerSearch.trim()) return true;
    const q = customerSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.businessName && c.businessName.toLowerCase().includes(q))
    );
  });

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1, productSearch: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof LineItemState, value: any) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    setItems(next);
  };

  const totalQuantity = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const prod = products.find((p) => p.id === item.productId);
      const price = prod ? prod.unitPrice : 0;
      return sum + price * (Number(item.quantity) || 0);
    }, 0);
  };

  // Check if any line item requests more stock than currently available
  const anyInsufficientStock = items.some((item) => {
    if (!item.productId) return false;
    const prod = products.find((p) => p.id === item.productId);
    return prod ? item.quantity > prod.currentStock : false;
  });

  const executeCreateChallan = async (status: 'DRAFT' | 'CONFIRMED') => {
    if (!selectedCustomerId) {
      setApiError({ message: 'Please select a customer for the delivery challan.' });
      return;
    }

    const invalidItem = items.find((i) => !i.productId || i.quantity <= 0);
    if (invalidItem) {
      setApiError({ message: 'Please ensure every line item has a valid product and positive quantity.' });
      return;
    }

    if (status === 'CONFIRMED' && anyInsufficientStock) {
      setApiError({
        message: 'Cannot confirm Challan due to Insufficient Stock on one or more items.',
      });
      return;
    }

    setSubmitting(true);
    setApiError(null);

    try {
      const res = await createChallanApi({
        customerId: selectedCustomerId,
        status,
        items: items.map((i) => ({ productId: i.productId, quantity: Number(i.quantity) })),
      });

      if (res.success) {
        navigate(`/challans/${res.challan.id}`);
      }
    } catch (err: any) {
      const data = err.response?.data;
      setApiError({
        message: data?.message || 'Failed to create Sales Delivery Challan',
        details: data?.details || data?.errors || [],
      });
    } finally {
      setSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  if (loadingCatalogs) {
    return <div className="p-8 text-center text-xs text-slate-500 font-semibold">Loading catalog reference data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
      <div>
        <Link to="/challans" className="text-xs font-bold text-slate-600 hover:text-indigo-600 transition">
          ← Back to Delivery Challans
        </Link>
      </div>

      {/* Main Header Container Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 text-slate-900 shadow-xl shadow-slate-200/50 space-y-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">New Order Dispatch</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Generate Sales Delivery Challan</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Snapshot product pricing and auto-deduct stock upon confirmation
          </p>
        </div>

        {/* API / Validation Error Notification */}
        {apiError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs space-y-2 font-medium">
            <div className="font-extrabold flex items-center gap-1.5">
              <span>⚠️</span>
              <span>{apiError.message}</span>
            </div>
            {apiError.details && apiError.details.length > 0 && (
              <ul className="list-disc list-inside space-y-1 text-xs text-rose-600 pl-2 font-semibold">
                {apiError.details.map((d: any, idx: number) => (
                  <li key={idx}>
                    {typeof d === 'string'
                      ? d
                      : `${d.productName || 'Item'}: Short by ${d.shortageCount || d.message} pcs`}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Searchable Customer Select */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Select Customer *</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="sm:col-span-1">
              <input
                type="text"
                placeholder="🔍 Search customer name / mobile..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
            <div className="sm:col-span-2">
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
              >
                <option value="">-- Choose Customer from Directory ({filteredCustomers.length} available) --</option>
                {filteredCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.businessName ? `(${c.businessName})` : ''} — {c.mobile}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Searchable Line Items Table */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Line Items</h2>
            <button
              type="button"
              onClick={handleAddItem}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold rounded-xl transition border border-slate-200"
            >
              ➕ Add Another Product
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => {
              const itemSearchTerm = item.productSearch || '';
              const filteredProducts = products.filter((p) => {
                if (!itemSearchTerm.trim()) return true;
                const q = itemSearchTerm.toLowerCase();
                return (
                  p.name.toLowerCase().includes(q) ||
                  p.sku.toLowerCase().includes(q) ||
                  (p.category && p.category.toLowerCase().includes(q))
                );
              });

              const selectedProd = products.find((p) => p.id === item.productId);
              const price = selectedProd ? selectedProd.unitPrice : 0;
              const currentStock = selectedProd ? selectedProd.currentStock : 0;
              const subtotal = price * (Number(item.quantity) || 0);

              const isShort = selectedProd ? item.quantity > currentStock : false;
              const shortageCount = isShort ? item.quantity - currentStock : 0;

              return (
                <div
                  key={index}
                  className={`p-4 rounded-2xl transition border-2 ${
                    isShort
                      ? 'bg-rose-50/70 border-rose-300'
                      : 'bg-slate-50/70 border-slate-200'
                  } grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center`}
                >
                  <div className="sm:col-span-6 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-[11px] uppercase font-extrabold text-slate-500">
                        Product #{index + 1}
                      </label>
                      {selectedProd && (
                        <span className={`text-[11px] font-extrabold ${isShort ? 'text-rose-600' : 'text-emerald-700'}`}>
                          Available Stock: {currentStock} pcs
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="🔍 Filter product/SKU..."
                        value={itemSearchTerm}
                        onChange={(e) => handleItemChange(index, 'productSearch', e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                      />
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        className="sm:col-span-2 w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                      >
                        <option value="">-- Select Product ({filteredProducts.length}) --</option>
                        {filteredProducts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (SKU: {p.sku}) — Stock: {p.currentStock} pcs
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Insufficient Stock Warning */}
                    {isShort && (
                      <div className="text-xs font-extrabold text-rose-600 mt-1 flex items-center gap-1">
                        ⚠️ Insufficient Stock! Only {currentStock} pcs available (Short by {shortageCount} pcs)
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                      className={`w-full p-2.5 bg-white border-2 rounded-xl text-xs font-mono font-bold focus:outline-none ${
                        isShort
                          ? 'border-rose-400 text-rose-700 focus:border-rose-600'
                          : 'border-slate-300 text-slate-900 focus:border-indigo-600'
                      }`}
                    />
                  </div>

                  <div className="sm:col-span-2 text-left sm:text-right">
                    <span className="block text-[10px] uppercase font-extrabold text-slate-500">Unit Price</span>
                    <span className="text-xs text-slate-900 font-mono font-bold">₹{price.toFixed(2)}</span>
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-2">
                    <div className="text-right">
                      <span className="block text-[10px] uppercase font-extrabold text-slate-500">Subtotal</span>
                      <span className="text-xs font-extrabold text-indigo-700 font-mono">₹{subtotal.toFixed(2)}</span>
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-slate-400 hover:text-rose-600 p-1 font-extrabold text-base ml-2"
                        title="Remove line"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insufficient Stock Footer Alert */}
        {anyInsufficientStock && (
          <div className="p-3.5 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2">
            <span>⚠️</span>
            <span>
              Stock Warning: Requested quantity exceeds current available inventory stock for one or more items. Reduce quantity or save as draft.
            </span>
          </div>
        )}

        {/* Footer Totals & Action Buttons */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <span className="text-xs text-slate-600 font-medium">Total Dispatch Quantity: </span>
            <strong className="text-lg text-emerald-700 font-black">{totalQuantity} pcs</strong>
            <span className="text-slate-600 text-xs font-medium ml-4">
              Estimated Value: <strong className="text-indigo-700 font-bold">₹{calculateSubtotal().toFixed(2)}</strong>
            </span>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={submitting}
              onClick={() => executeCreateChallan('DRAFT')}
              className="flex-1 sm:flex-none px-4 py-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl transition shadow-xs"
            >
              💾 Save as Draft
            </button>
            <button
              type="button"
              disabled={submitting || anyInsufficientStock}
              onClick={() => setShowConfirmModal(true)}
              className="flex-1 sm:flex-none px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-extrabold rounded-xl transition shadow-lg shadow-indigo-600/30"
              title={anyInsufficientStock ? 'Cannot confirm: Insufficient stock available' : ''}
            >
              🚀 Save & Confirm (Deduct Stock)
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 bg-white border border-slate-200 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-base font-extrabold text-slate-900">Confirm Order Dispatch</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Are you sure you want to confirm this sales delivery challan? Confirming will immediately deduct{' '}
              <strong className="text-slate-900 font-bold">{totalQuantity} pcs</strong> from live warehouse inventory.
            </p>
            <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => executeCreateChallan('CONFIRMED')}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-600/30"
              >
                {submitting ? 'Processing...' : 'Confirm & Deduct Stock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
