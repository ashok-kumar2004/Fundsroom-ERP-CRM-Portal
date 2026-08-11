import React, { useEffect, useRef } from 'react';
import { LucideSearch, LucideX } from './Icons';

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
  icon?: string;
}

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  
  // Quick Filter Chips (Pills)
  chips?: FilterOption[];
  activeChip?: string;
  onChipChange?: (chipId: string) => void;
  
  // Select Dropdown
  selectFilterValue?: string;
  onSelectFilterChange?: (value: string) => void;
  selectOptions?: { value: string; label: string }[];
  selectPlaceholder?: string;

  // Toggle Checkbox (e.g. Low Stock Only)
  checkboxChecked?: boolean;
  onCheckboxChange?: (checked: boolean) => void;
  checkboxLabel?: string;

  // Status metrics
  totalMatches?: number;
  isSearching?: boolean;

  // Clear handler
  onClearAll?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = 'Search by keyword, SKU, name, code...',
  chips = [],
  activeChip,
  onChipChange,
  selectFilterValue,
  onSelectFilterChange,
  selectOptions = [],
  selectPlaceholder = 'Filter by category...',
  checkboxChecked,
  onCheckboxChange,
  checkboxLabel,
  totalMatches,
  isSearching = false,
  onClearAll,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener: Press "/" or "Ctrl+K" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || (e.key === 'k' && (e.ctrlKey || e.metaKey))) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        document.activeElement?.tagName !== 'SELECT'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const hasActiveFilters =
    Boolean(searchTerm) ||
    Boolean(activeChip && activeChip !== 'ALL') ||
    Boolean(selectFilterValue) ||
    Boolean(checkboxChecked);

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-lg shadow-slate-200/50 space-y-4">
      {/* Top Search Input & Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3.5">
        {/* Main Big Search Box */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-indigo-600">
            {isSearching ? (
              <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <LucideSearch className="w-5 h-5 text-indigo-600" />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-3.5 bg-slate-50/80 border-2 border-slate-200 rounded-2xl text-sm sm:text-base font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15 transition shadow-inner"
          />

          {/* Right end controls: Clear button */}
          {searchTerm && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
              <button
                onClick={() => onSearchChange('')}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition font-bold text-xs flex items-center justify-center"
                title="Clear search input"
              >
                <LucideX className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Category / Status Select Dropdown */}
        {selectOptions.length > 0 && onSelectFilterChange && (
          <div className="w-full md:w-64">
            <select
              value={selectFilterValue || ''}
              onChange={(e) => onSelectFilterChange(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600 transition"
            >
              <option value="">{selectPlaceholder}</option>
              {selectOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Checkbox Filter */}
        {checkboxLabel && onCheckboxChange !== undefined && (
          <label className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 text-xs sm:text-sm font-bold text-slate-700 cursor-pointer select-none hover:bg-slate-100 hover:border-slate-300 transition">
            <input
              type="checkbox"
              checked={checkboxChecked || false}
              onChange={(e) => onCheckboxChange(e.target.checked)}
              className="w-4 h-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span>{checkboxLabel}</span>
          </label>
        )}
      </div>

      {/* Quick Filter Chips & Live Match Counter */}
      {(chips.length > 0 || totalMatches !== undefined || hasActiveFilters) && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Quick Filter Chips */}
          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Quick Filters:</span>
              {chips.map((chip) => {
                const isActive = activeChip === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => onChipChange && onChipChange(chip.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 border ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/25'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {chip.icon && <span className="text-sm">{chip.icon}</span>}
                    <span>{chip.label}</span>
                    {chip.count !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        {chip.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Match Counter Badge & Clear All */}
          <div className="flex items-center gap-3 ml-auto">
            {totalMatches !== undefined && (
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                Found <strong className="text-indigo-600 font-extrabold">{totalMatches}</strong> match{totalMatches === 1 ? '' : 'es'}
              </span>
            )}

            {hasActiveFilters && onClearAll && (
              <button
                onClick={onClearAll}
                className="text-xs font-extrabold text-rose-600 hover:text-rose-700 underline underline-offset-4 transition"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
