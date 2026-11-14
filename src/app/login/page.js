'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { dataService } from '@/services/dataService';
import { HeartPulse, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, UserCheck, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@careguide.bd');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);

    try {
      await dataService.login(email.trim(), password);
      setLoading(false);
      router.push('/');
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Invalid credentials. Please verify your email and password.');
    }
  };

  const handleQuickFill = (targetEmail, targetPass) => {
    setEmail(targetEmail);
    setPassword(targetPass);
    setError('');
  };

  return (
    <div className="bg-slate-900 min-h-screen flex items-center justify-center p-4 relative overflow-hidden antialiased">
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Login Card Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Top Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-400 items-center justify-center shadow-xl shadow-teal-500/25 mb-4 text-white">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Doctor<span className="text-teal-400">Tracker</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
            Care Guide BD • Admin Portal
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-100/90">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Sign in to your account</h2>
            <p className="text-xs text-slate-500 mt-0.5">Enter your credentials to access the real-time clinical system</p>
          </div>

          {/* Quick Demo Fill Buttons */}
          <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              <KeyRound className="w-3.5 h-3.5 text-teal-600" />
              <span>Assessment Demo Accounts (1-Click Fill):</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@careguide.bd', 'Admin@123')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-teal-200 text-teal-700 hover:bg-teal-50 transition shadow-xs flex items-center justify-center gap-1"
              >
                <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Admin Login</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('staff@careguide.bd', 'Staff@123')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition shadow-xs flex items-center justify-center gap-1"
              >
                <UserCheck className="w-3.5 h-3.5 text-slate-600" />
                <span>Staff Login</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Account Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              placeholder="admin@careguide.bd"
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <span className="text-[11px] text-slate-400">Default: Admin@123</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-slate-50 text-xs text-slate-900 pl-9 pr-10 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 absolute right-3 top-3"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              type="submit"
              isLoading={loading}
              className="w-full"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Authorize & Enter Portal
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Connected to Live Express API & MongoDB Atlas Cloud</span>
          </div>
        </div>

        {/* Footer Copyright */}
        <p className="text-center text-xs text-slate-500 mt-6">
          &copy; 2026 Care Guide BD. All administrative rights reserved.
        </p>
      </div>
    </div>
  );
}
