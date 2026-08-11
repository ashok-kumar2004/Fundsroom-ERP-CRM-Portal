import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  IconAdmin,
  IconSales,
  IconWarehouse,
  IconAccounts,
  IconEye,
  IconEyeOff,
  IconAlert,
  IconCross,
} from '../components/Icons';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Field-level error messages
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  // General top alert message
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address (e.g. admin@fundsroom.com).';
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await login({ email: email.trim(), password });
      navigate('/dashboard');
    } catch (err: any) {
      const resp = err.response?.data;

      if (resp?.errors && Array.isArray(resp.errors)) {
        const newFieldErrors: { email?: string; password?: string } = {};
        resp.errors.forEach((e: { field: string; message: string }) => {
          if (e.field === 'email') newFieldErrors.email = e.message;
          if (e.field === 'password') newFieldErrors.password = e.message;
        });
        setFieldErrors(newFieldErrors);
        setGeneralError('Please correct the highlighted validation errors below.');
      } else if (resp?.message) {
        setGeneralError(resp.message);
      } else if (err.message) {
        setGeneralError(err.message);
      } else {
        setGeneralError('Unable to log in. Please check backend server.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, pass: string = 'Test@123') => {
    setEmail(demoEmail);
    setPassword(pass);
    setFieldErrors({});
    setGeneralError('');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4 font-sans text-slate-900">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Header Branding */}
        <div className="text-center space-y-2 mb-6">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
            ERP
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to Portal</h1>
          <p className="text-xs text-slate-500 font-medium">Fundsroom Mini ERP & CRM Operations System</p>
        </div>

        {/* Top General Error Alert */}
        {generalError && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2.5">
            <IconAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold">{generalError}</p>
              <p className="text-[11px] font-normal text-rose-600 mt-1 leading-relaxed">
                Test Password: <strong className="font-mono">Test@123</strong> (or click one of the quick demo role buttons below).
              </p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Work Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
              }}
              placeholder="e.g. admin@test.com"
              className={`w-full px-4 py-3 rounded-2xl bg-slate-50 border-2 text-slate-900 text-sm font-semibold focus:outline-none transition ${
                fieldErrors.email
                  ? 'border-rose-400 bg-rose-50/50 focus:border-rose-600 focus:ring-4 focus:ring-rose-500/10'
                  : 'border-slate-200 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/10'
              }`}
            />
            {fieldErrors.email && (
              <p className="text-xs font-bold text-rose-600 mt-1 flex items-center gap-1">
                <IconCross className="w-3.5 h-3.5" /> {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Account Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                }}
                placeholder="••••••••"
                className={`w-full pl-4 pr-12 py-3 rounded-2xl bg-slate-50 border-2 text-slate-900 text-sm font-semibold focus:outline-none transition ${
                  fieldErrors.password
                    ? 'border-rose-400 bg-rose-50/50 focus:border-rose-600 focus:ring-4 focus:ring-rose-500/10'
                    : 'border-slate-200 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/10'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 font-bold text-sm"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs font-bold text-rose-600 mt-1 flex items-center gap-1">
                <IconCross className="w-3.5 h-3.5" /> {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-semibold">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span>Remember me on this device</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm transition shadow-lg shadow-indigo-600/30 disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Verifying credentials...</span>
              </>
            ) : (
              <span>Sign In to Portal →</span>
            )}
          </button>
        </form>

        {/* Quick Demo Login Preset Buttons */}
        <div className="mt-7 pt-6 border-t border-slate-100 space-y-2">
          <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider text-center mb-2">
            Quick One-Click Demo Role Accounts:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@test.com')}
              className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl transition text-left shadow-xs flex items-center gap-2"
            >
              <IconAdmin className="w-4 h-4 text-purple-700 shrink-0" />
              <span>Admin User</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('sales@test.com')}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl transition text-left shadow-xs flex items-center gap-2"
            >
              <IconSales className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Sales Rep</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('warehouse@test.com')}
              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl transition text-left shadow-xs flex items-center gap-2"
            >
              <IconWarehouse className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Warehouse</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('accounts@test.com')}
              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl transition text-left shadow-xs flex items-center gap-2"
            >
              <IconAccounts className="w-4 h-4 text-blue-700 shrink-0" />
              <span>Accounts Team</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
