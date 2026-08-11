import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductsApi, createProductApi, updateProductApi, addStockMovementApi } from '../api/product.api';
import type { Product, CreateProductPayload, StockMovementPayload } from '../types/product.types';
import { useAuth } from '../context/AuthContext';
import { SearchBar, type FilterOption } from '../components/SearchBar';
import { HighlightText } from '../components/HighlightText';

export const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [activeChip, setActiveChip] = useState('ALL');

  // Categories list extracted dynamically
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Modal States
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedProductForMovement, setSelectedProductForMovement] = useState<Product | null>(null);

  // Form States
  const [productForm, setProductForm] = useState<CreateProductPayload>({
    name: '',
    sku: '',
    category: '',
    unitPrice: 0,
    currentStock: 0,
    minStockAlert: 5,
    location: '',
  });

  const [movementForm, setMovementForm] = useState<StockMovementPayload>({
    quantityChanged: 1,
    movementType: 'IN',
    reason: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getProductsApi({
        page,
        limit: 10,
        search: debouncedSearch,
        category: categoryFilter,
        lowStock: lowStockFilter || activeChip === 'LOW_STOCK' ? true : undefined,
      });

      if (res.success) {
        setProducts(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotalCount(res.pagination.total);

        // Dynamically build category options from data
        const cats = Array.from(new Set(res.data.map((p) => p.category).filter(Boolean))) as string[];
        if (cats.length > 0) {
          setAvailableCategories((prev) => Array.from(new Set([...prev, ...cats])));
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, debouncedSearch, categoryFilter, lowStockFilter, activeChip]);

  const handleChipChange = (chipId: string) => {
    setActiveChip(chipId);
    setPage(1);
    if (chipId === 'LOW_STOCK') {
      setLowStockFilter(true);
    } else {
      setLowStockFilter(false);
    }
  };

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setLowStockFilter(false);
    setActiveChip('ALL');
    setPage(1);
  };

  const handleOpenProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        sku: product.sku,
        category: product.category || '',
        unitPrice: product.unitPrice,
        currentStock: product.currentStock,
        minStockAlert: product.minStockAlert,
        location: product.location || '',
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        sku: '',
        category: '',
        unitPrice: 0,
        currentStock: 0,
        minStockAlert: 5,
        location: '',
      });
    }
    setFormErrors({});
    setShowProductModal(true);
  };

  const handleOpenMovementModal = (product: Product) => {
    setSelectedProductForMovement(product);
    setMovementForm({ quantityChanged: 1, movementType: 'IN', reason: '' });
    setShowMovementModal(true);
  };

  const validateProductForm = () => {
    const errors: Record<string, string> = {};
    if (!productForm.name.trim()) errors.name = 'Product name is required';
    if (!productForm.sku.trim()) errors.sku = 'SKU is required';
    if (productForm.unitPrice <= 0) errors.unitPrice = 'Unit price must be greater than 0';
    if (productForm.minStockAlert < 0) errors.minStockAlert = 'Min stock alert cannot be negative';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProductForm()) return;

    try {
      if (editingProduct) {
        await updateProductApi(editingProduct.id, {
          name: productForm.name,
          category: productForm.category,
          unitPrice: Number(productForm.unitPrice),
          minStockAlert: Number(productForm.minStockAlert),
          location: productForm.location,
        });
        showToast(`Product '${productForm.name}' updated!`);
      } else {
        await createProductApi({
          ...productForm,
          unitPrice: Number(productForm.unitPrice),
          currentStock: Number(productForm.currentStock),
          minStockAlert: Number(productForm.minStockAlert),
        });
        showToast(`Product '${productForm.name}' created!`);
      }
      setShowProductModal(false);
      fetchProducts();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save product';
      showToast(msg, 'error');
    }
  };

  const handleMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForMovement || movementForm.quantityChanged <= 0) return;

    try {
      await addStockMovementApi(selectedProductForMovement.id, movementForm);
      showToast(`Stock ${movementForm.movementType} recorded for '${selectedProductForMovement.name}'!`);
      setShowMovementModal(false);
      fetchProducts();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Stock adjustment failed', 'error');
    }
  };

  const canManage = ['ADMIN', 'WAREHOUSE'].includes(user?.role || '');

  const filterChips: FilterOption[] = [
    { id: 'ALL', label: 'All Items', icon: '📦' },
    { id: 'LOW_STOCK', label: 'Low Stock Alerts', icon: '⚠️' },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-extrabold text-white border transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-700 border-emerald-600 shadow-emerald-900/20'
              : 'bg-rose-700 border-rose-600 shadow-rose-900/20'
          }`}
        >
          {toastMessage.type === 'success' ? '✔ ' : '⚠️ '}
          {toastMessage.text}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">
            Inventory Catalog Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">Products Catalog</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Monitor live stock levels, SKU codes, warehouse sections, and stock movement logs ({totalCount} total items)
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => handleOpenProductModal()}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-extrabold rounded-2xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            ➕ Add Product
          </button>
        )}
      </div>

      {/* Big Bold Search Bar Component */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="🔍 Live search product name, SKU code, category..."
        chips={filterChips}
        activeChip={activeChip}
        onChipChange={handleChipChange}
        selectFilterValue={categoryFilter}
        onSelectFilterChange={(val) => {
          setCategoryFilter(val);
          setPage(1);
        }}
        selectOptions={availableCategories.map((c) => ({ value: c, label: `Category: ${c}` }))}
        selectPlaceholder="All Categories"
        checkboxChecked={lowStockFilter}
        onCheckboxChange={(checked) => {
          setLowStockFilter(checked);
          setActiveChip(checked ? 'LOW_STOCK' : 'ALL');
          setPage(1);
        }}
        checkboxLabel="⚠️ Low Stock Only"
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

      {/* Data Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-lg shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-800">
            <thead className="bg-slate-100 text-slate-600 uppercase text-[11px] font-extrabold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-4 px-5">Product Name</th>
                <th className="py-4 px-5">SKU Code</th>
                <th className="py-4 px-5">Category</th>
                <th className="py-4 px-5">Current Stock</th>
                <th className="py-4 px-5">Unit Price</th>
                <th className="py-4 px-5">Warehouse Location</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-sm font-semibold">
                    <div className="inline-flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                      <span>Loading products catalog...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-sm font-semibold">
                    No products found matching query parameters.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLow = p.currentStock <= p.minStockAlert;
                  const isOut = p.currentStock === 0;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/products/${p.id}`)}
                      className="hover:bg-indigo-50/50 cursor-pointer transition-colors group"
                    >
                      {/* Product Name with Highlight */}
                      <td className="py-4 px-5 font-bold text-slate-900 group-hover:text-indigo-600 transition">
                        <HighlightText text={p.name} highlight={debouncedSearch} />
                      </td>

                      {/* SKU Code */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg text-xs font-bold shadow-xs">
                          <HighlightText text={p.sku} highlight={debouncedSearch} />
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-5 text-slate-600 whitespace-nowrap font-medium">
                        <span className="px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs">
                          {p.category || 'General'}
                        </span>
                      </td>

                      {/* Stock Level Pills */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                            🚫 0 pcs (Out of Stock)
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                            ⚠️ {p.currentStock} pcs
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {p.currentStock} pcs
                          </span>
                        )}
                      </td>

                      {/* Unit Price */}
                      <td className="py-4 px-5 font-extrabold text-slate-900 whitespace-nowrap">
                        ₹{p.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Location */}
                      <td className="py-4 px-5 text-slate-600 whitespace-nowrap font-medium">
                        {p.location || '—'}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-5 text-right whitespace-nowrap space-x-2" onClick={(e) => e.stopPropagation()}>
                        {canManage && (
                          <>
                            <button
                              onClick={() => handleOpenMovementModal(p)}
                              className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-extrabold transition"
                            >
                              📦 Stock IN/OUT
                            </button>
                            <button
                              onClick={() => handleOpenProductModal(p)}
                              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-extrabold transition"
                            >
                              ✏️ Edit
                            </button>
                          </>
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
            Page <strong className="text-slate-900 font-extrabold">{page}</strong> of <strong className="text-slate-900 font-extrabold">{totalPages}</strong> ({totalCount} total items)
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

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg p-6 bg-white border border-slate-200 rounded-2xl shadow-2xl space-y-4 my-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h2 className="text-base font-extrabold text-slate-900">
                {editingProduct ? 'Edit Product Details' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setShowProductModal(false)}
                className="h-8 w-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Product Name *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
                  placeholder="e.g. Brass Metallic Apparel Buttons"
                />
                {formErrors.name && <p className="text-rose-600 text-xs font-bold mt-1">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">SKU Code *</label>
                  <input
                    type="text"
                    disabled={Boolean(editingProduct)}
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-600 focus:bg-white disabled:opacity-60"
                    placeholder="e.g. ACC-BUTTON-01"
                  />
                  {formErrors.sku && <p className="text-rose-600 text-xs font-bold mt-1">{formErrors.sku}</p>}
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Category</label>
                  <input
                    type="text"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
                    placeholder="e.g. Accessories"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Unit Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.unitPrice}
                    onChange={(e) => setProductForm({ ...productForm, unitPrice: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                  {formErrors.unitPrice && <p className="text-rose-600 text-xs font-bold mt-1">{formErrors.unitPrice}</p>}
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Current Stock *</label>
                  <input
                    type="number"
                    disabled={Boolean(editingProduct)}
                    value={productForm.currentStock}
                    onChange={(e) => setProductForm({ ...productForm, currentStock: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-600 focus:bg-white disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Min Alert</label>
                  <input
                    type="number"
                    value={productForm.minStockAlert}
                    onChange={(e) => setProductForm({ ...productForm, minStockAlert: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Warehouse Location</label>
                <input
                  type="text"
                  value={productForm.location}
                  onChange={(e) => setProductForm({ ...productForm, location: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
                  placeholder="e.g. Warehouse Section C2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/30"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock IN/OUT Adjustment Modal */}
      {showMovementModal && selectedProductForMovement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-md p-6 bg-white border border-slate-200 rounded-2xl shadow-2xl space-y-4 my-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h2 className="text-base font-extrabold text-slate-900">Stock Movement Adjustment</h2>
              <button
                onClick={() => setShowMovementModal(false)}
                className="h-8 w-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-1 text-xs sm:text-sm">
              <p className="font-extrabold text-indigo-900">{selectedProductForMovement.name}</p>
              <p className="text-indigo-700 font-mono font-bold">SKU: {selectedProductForMovement.sku}</p>
              <p className="text-slate-700 font-medium">Current Stock: <strong className="text-slate-900 font-extrabold">{selectedProductForMovement.currentStock} pcs</strong></p>
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
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Reason / Reference</label>
                <input
                  type="text"
                  value={movementForm.reason}
                  onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
                  placeholder="e.g. Stock arrival / Delivery correction"
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/30"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
