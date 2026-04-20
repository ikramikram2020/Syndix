import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, Mail, Lock, User, CheckCircle2, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { signUp } from '../lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordStrength = (p: string) => {
    if (p.length === 0) return null;
    if (p.length < 6) return 'weak';
    if (p.length < 10) return 'medium';
    return 'strong';
  };

  const strength = passwordStrength(form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (form.password !== form.confirm) {
      setError('Passwords do not match. Please try again.');
      return;
    }
    
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    
    setLoading(true);

    const { data, error: signUpError } = await signUp(form.email, form.password, form.name);

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
    } else if (data?.user) {
      router.push('/dashboard/setup');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden lg:grid lg:grid-cols-2">
      {/* Left Side: Photo & Content */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex relative overflow-hidden items-center justify-center p-8 bg-slate-900 shadow-2xl z-10"
      >
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover grayscale-[0.5] brightness-75 opacity-60"
            alt="Modern Residential Building"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 via-slate-900/20 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-lg text-white">
          <h1 className="text-5xl font-black leading-tight mb-5 tracking-tighter italic">
            Digital <br />
            <span className="text-[#2BBCD4] not-italic">Property.</span>
          </h1>
          <p className="text-base text-slate-300 mb-8 leading-relaxed font-medium italic">
            Join the new standard of property management in Algiers. 
            Automated, professional, and secure.
          </p>

          <div className="space-y-4">
            {[
              "Free 30-day trial, no credit card needed",
              "Manage unlimited buildings & residents",
              "QR access, payments, tickets & more",
              "Get started in under 5 minutes"
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (i * 0.1) }}
                className="flex items-center gap-3 group"
              >
                <div className="w-5 h-5 rounded-full bg-[#2BBCD4]/20 flex items-center justify-center group-hover:bg-[#2BBCD4]/40 transition-colors">
                  <CheckCircle2 className="w-3 h-3 text-[#2BBCD4]" />
                </div>
                <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right Side: Register Form with Logo */}
      <div className="w-full flex flex-col justify-center p-6 lg:p-8 relative bg-white overflow-hidden">
        <div className="max-w-md w-full mx-auto">
          {/* Logo on white side - properly sized */}
          <div className="flex justify-center mb-6">
            <img 
              src="/logo2.png" 
              className="w-36 h-auto object-contain"
              alt="SYNDIX Logo"
            />
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create account</h2>
            <p className="text-slate-500 mt-1 text-sm">Start your free 30-day trial. No credit card required.</p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ahmed Mansouri"
                  className="w-full h-11 pl-10 pr-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#2BBCD4]/10 focus:border-[#2BBCD4] outline-none transition-all placeholder:text-slate-300 text-slate-900 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="ahmed.m@syndix.dz"
                  className="w-full h-11 pl-10 pr-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#2BBCD4]/10 focus:border-[#2BBCD4] outline-none transition-all placeholder:text-slate-300 text-slate-900 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-10 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#2BBCD4]/10 focus:border-[#2BBCD4] outline-none transition-all placeholder:text-slate-300 text-slate-900 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {strength && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {(['weak', 'medium', 'strong'] as const).map((level, i) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          (strength === 'weak' && i === 0) ? 'bg-red-400' :
                          (strength === 'medium' && i <= 1) ? 'bg-amber-400' :
                          (strength === 'strong') ? 'bg-emerald-500' :
                          'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-[10px] font-semibold capitalize ${
                    strength === 'weak' ? 'text-red-500' :
                    strength === 'medium' ? 'text-amber-500' : 'text-emerald-600'
                  }`}>{strength}</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={form.confirm}
                  onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-10 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#2BBCD4]/10 focus:border-[#2BBCD4] outline-none transition-all placeholder:text-slate-300 text-slate-900 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full h-11 text-xs font-black uppercase tracking-widest bg-[#1C2B6B] hover:bg-[#0D1A45] text-white rounded-xl shadow-lg shadow-[#1C2B6B]/20 mt-2 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="group-hover:translate-x-1 transition-transform flex items-center justify-center gap-2">
                  Create free account <ArrowLeft className="w-4 h-4 rotate-180" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-xs font-medium">
              Already have an account?{' '}
              <Link href="/login" className="text-[#2BBCD4] font-bold hover:text-[#1C2B6B] transition-colors underline-offset-4 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}