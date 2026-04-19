import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    // Check if we have a hash in the URL
    const hash = window.location.hash;
    console.log('URL hash:', hash);
    
    if (hash && hash.includes('access_token')) {
      // We have a token, don't redirect
      setHasToken(true);
    } else {
      // No token, show error or redirect after a delay
      setError('Invalid or expired reset link. Please request a new one.');
      setTimeout(() => {
        router.push('/forgot-password');
      }, 3000);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Don't redirect immediately, let user see success message
        setTimeout(() => {
          router.push('/login');
        }, 4000);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
    setLoading(false);
  };

  // Show loading while checking token
  if (!hasToken && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-white mt-4">Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  // Show error and redirect message
  if (error && !hasToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Invalid Reset Link</h2>
          <p className="text-slate-500 mb-4">{error}</p>
          <Link
            href="/forgot-password"
            className="inline-block px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  // Show success message
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full text-center">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Password Reset Successful!</h2>
          <p className="text-slate-500 mb-4">Your password has been changed.</p>
          <p className="text-sm text-slate-400 mb-4">Redirecting to login...</p>
          <Link
            href="/login"
            className="inline-block px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Go to Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto shadow-lg mb-4">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-blue-200 mt-2">Create a new password for your account</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-slate-500 hover:text-orange-600 transition flex items-center justify-center gap-1"
              >
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}