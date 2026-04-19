import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { signIn } from "../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError, data } = await signIn(email, password);
    
    console.log('=== LOGIN DEBUG ===');
    console.log('Login response:', { error: signInError, hasSession: !!data?.session });
    console.log('Email used:', email);
    console.log('==================');

    if (signInError) {
      setError(signInError.message || "Invalid email or password.");
      setLoading(false);
    } else if (data?.session) {
      // Success - wait a moment for session to be saved
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } else {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 bg-white">
        <div className="w-full max-w-md mx-auto">
          <Link href="/" className="inline-flex items-center gap-3 mb-10 group">
            <img
              src="/5769129754689736308.jpg"
              alt="Syndix"
              className="h-10 w-10 rounded-xl object-contain bg-white border border-slate-100 shadow-sm"
            />
            <div>
              <p className="text-lg font-black text-brand-navy leading-none">
                SYNDIX
              </p>
              <p className="text-[9px] font-semibold text-brand-teal tracking-widest uppercase">
                Digital Property Platform
              </p>
            </div>
          </Link>

          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
              Welcome back
            </h1>
            <p className="text-slate-500">
              Sign in to your account to continue
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 px-4 py-3.5 bg-red-50 border border-red-200 rounded-xl animate-scale-in">
              <AlertCircle
                size={16}
                className="text-red-500 flex-shrink-0 mt-0.5"
              />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5 animate-fade-in-up"
            style={{ animationDelay: "0.05s" }}
          >
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@syndix.com"
                  className="w-full ps-10 pe-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/15 transition-all bg-slate-50 hover:bg-white focus:bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full ps-10 pe-10 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/15 transition-all bg-slate-50 hover:bg-white focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-slate-300 text-brand-teal focus:ring-brand-teal/30 cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="text-sm text-slate-600 cursor-pointer select-none"
              >
                Remember me for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center gap-2.5 py-3.5 bg-brand-navy hover:bg-[#16205e] disabled:bg-brand-navy/70 text-white font-bold rounded-xl shadow-lg shadow-brand-navy/25 transition-all hover:-translate-y-0.5 hover:shadow-brand-navy/35 disabled:cursor-not-allowed disabled:transform-none text-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in to Syndix
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-brand-teal hover:text-brand-navy font-semibold transition-colors"
              >
                Create free account
              </Link>
            </p>
          </div>

          <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-xs font-semibold text-slate-500 mb-2">
              Demo credentials
            </p>
            <p className="text-xs text-slate-400 font-mono">
              Email: zakariaabdo391@gmail.com
            </p>
            <p className="text-xs text-slate-400 font-mono">
              Password: (your password)
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <img
          src="https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          alt="Modern residential building"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/80 via-[#1a3a8f]/70 to-brand-teal/60" />

        <div className="relative flex flex-col justify-between p-12 w-full">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/15 rounded-full backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
              <span className="text-xs font-semibold text-white">
                Trusted by 1,200+ buildings
              </span>
            </div>
          </div>

          <div>
            <blockquote className="text-white mb-8">
              <p className="text-2xl font-black leading-tight mb-4">
                "Manage your building smarter with SYNDIX"
              </p>
              <p className="text-blue-200/70 text-base leading-relaxed max-w-sm">
                The complete digital platform for building managers. Residents,
                payments, maintenance, and access — all in one place.
              </p>
            </blockquote>

            <div className="grid grid-cols-3 gap-4">
              {[
                { value: "1,200+", label: "Buildings" },
                { value: "48K+", label: "Residents" },
                { value: "99.2%", label: "Uptime" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white/8 border border-white/10 rounded-xl p-4 backdrop-blur-sm"
                >
                  <p className="text-xl font-black text-white mb-0.5">
                    {stat.value}
                  </p>
                  <p className="text-xs text-blue-200/60 font-medium">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}