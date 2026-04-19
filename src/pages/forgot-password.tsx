import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Get the current URL origin
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto shadow-lg mb-4">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white">Forgot Password?</h1>
          <p className="text-blue-200 mt-2">Enter your email to reset your password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          {success ? (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-800 mb-2">Check Your Email</h2>
              <p className="text-slate-500 text-sm mb-4">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-slate-400 text-xs mb-6">
                Click the link in the email to create a new password.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
              >
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
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
                {loading ? 'Sending...' : 'Send Reset Link'}
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
          )}
        </div>
      </div>
    </div>
  );
}