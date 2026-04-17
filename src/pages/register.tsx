import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
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

    // Use Supabase sign up
    const { error: signUpError } = await signUp(form.email, form.password, form.name);

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
    } else {
      // Redirect to login after successful registration
      router.push('/login?registered=true');
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-[45%] relative overflow-hidden flex-shrink-0">
        <img
          src="https://images.pexels.com/photos/1560932/pexels-photo-1560932.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          alt="Modern apartment complex"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-teal/75 via-brand-navy/80 to-[#0f2260]/90" />

        <div className="relative flex flex-col justify-between p-12 w-full">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <img src="/5769129754689736308.jpg" alt="Syndix" className="h-9 w-9 rounded-xl object-contain bg-white border border-white/20" />
            <div>
              <p className="text-base font-black text-white leading-none">SYNDIX</p>
              <p className="text-[9px] font-semibold text-brand-teal tracking-widest uppercase">Digital Property Platform</p>
            </div>
          </Link>

          <div>
            <div className="space-y-4 mb-10">
              {[
                { icon: CheckCircle, text: 'Free 30-day trial, no credit card needed' },
                { icon: CheckCircle, text: 'Manage unlimited buildings & residents' },
                { icon: CheckCircle, text: 'QR access, payments, tickets & more' },
                { icon: CheckCircle, text: 'Get started in under 5 minutes' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-teal/20 border border-brand-teal/30 flex items-center justify-center flex-shrink-0">
                    <item.icon size={12} className="text-brand-teal" />
                  </div>
                  <p className="text-sm text-white/80 font-medium">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="bg-white/8 border border-white/12 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-amber to-orange-400 flex items-center justify-center font-bold text-white text-sm">M</div>
                <div>
                  <p className="text-sm font-bold text-white">Mohamed Saidi</p>
                  <p className="text-xs text-white/50">Building Manager · Algiers</p>
                </div>
              </div>
              <p className="text-sm text-white/70 leading-relaxed italic">
                "Syndix transformed our building management. We cut admin work by 80% in the first month."
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-14 xl:px-20 bg-white overflow-y-auto">
        <div className="w-full max-w-md mx-auto">
          <Link href="/" className="lg:hidden inline-flex items-center gap-3 mb-8">
            <img src="/5769129754689736308.jpg" alt="Syndix" className="h-9 w-9 rounded-xl object-contain bg-white border border-slate-100 shadow-sm" />
            <div>
              <p className="text-lg font-black text-brand-navy leading-none">SYNDIX</p>
              <p className="text-[9px] font-semibold text-brand-teal tracking-widest uppercase">Digital Property Platform</p>
            </div>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Create your account</h1>
            <p className="text-slate-500">Start your free 30-day trial. No credit card required.</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 px-4 py-3.5 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Mohamed Saidi"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/15 transition-all bg-slate-50 hover:bg-white focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@building.com"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/15 transition-all bg-slate-50 hover:bg-white focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/15 transition-all bg-slate-50 hover:bg-white focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
              <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={form.confirm}
                  onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                  placeholder="Repeat your password"
                  className={`w-full pl-10 pr-10 py-3 border rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all bg-slate-50 hover:bg-white focus:bg-white ${
                    form.confirm && form.confirm !== form.password
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:border-brand-teal focus:ring-brand-teal/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {form.confirm && form.confirm === form.password && (
                  <CheckCircle size={15} className="absolute right-10 top-1/2 -translate-y-1/2 text-emerald-500" />
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center gap-2.5 py-3.5 bg-brand-navy hover:bg-[#16205e] disabled:bg-brand-navy/70 text-white font-bold rounded-xl shadow-lg shadow-brand-navy/25 transition-all hover:-translate-y-0.5 hover:shadow-brand-navy/35 disabled:cursor-not-allowed disabled:transform-none text-sm mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Free Account
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

            <p className="text-xs text-slate-400 text-center leading-relaxed pt-1">
              By creating an account you agree to our{' '}
              <a href="#" className="text-brand-teal hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-brand-teal hover:underline">Privacy Policy</a>.
            </p>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="text-brand-teal hover:text-brand-navy font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}