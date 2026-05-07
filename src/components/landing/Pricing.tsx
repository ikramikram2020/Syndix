import { Check, Zap, TrendingUp, FileText, Building2, Headphones, Download, BarChart3 } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

export default function Pricing() {
  const { t } = useLanguage();

  // Common features (both plans have)
  const commonFeatures = [
    { name: "Payment tracking", included: true },
    { name: "Resident management", included: true },
    { name: "Maintenance requests", included: true },
    { name: "Announcements", included: true },
    { name: "Resident portal (PWA) access", included: true },
    { name: "QR code authentication", included: true },
    { name: "Support tickets", included: true },
    { name: "Mobile-friendly interface", included: true },
  ];

  // Starter only features
  const starterOnly = [
    { name: "Basic reports", included: true, isPro: false },
    { name: "Single building management", included: true, isPro: false },
  ];

  // Professional exclusive features (BETTER than Starter)
  const proFeatures = [
    { name: "Advanced analytics dashboard", included: true, isPro: true, icon: BarChart3 },
    { name: "PDF & CSV export (unlimited)", included: true, isPro: true, icon: Download },
    { name: "Multi-building management tools", included: true, isPro: true, icon: Building2 },
    { name: "Priority email support", included: true, isPro: true, icon: Headphones },
    { name: "Financial performance reports", included: true, isPro: true, icon: TrendingUp },
    { name: "Custom report builder", included: true, isPro: true, icon: FileText },
  ];

  // Enterprise features
  const enterpriseFeatures = [
    "Everything in Professional",
    "24/7 phone & chat support",
    "Dedicated account manager",
    "Onboarding & training sessions",
    "Custom integrations (Edahabia/CIB)",
    "SLA agreement (99.9% uptime)",
    "API access for custom development",
    "Multi-portfolio management",
  ];

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full mb-4">
            Value-Based Pricing
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Choose the plan that fits your building size. <span className="font-semibold text-brand-navy">Professional</span> offers significantly more value for growing portfolios.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* STARTER PLAN - 6,000 DZD */}
          <div className="rounded-2xl p-8 flex flex-col transition-all duration-200 hover:-translate-y-1 bg-white border border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300">
            <div className="mb-7">
              <p className="text-sm font-bold mb-1.5 text-slate-500">
                Starter Plan
              </p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-black tracking-tight text-slate-900">
                  6,000
                </span>
                <span className="text-sm font-medium text-slate-400">
                  DZD/month
                </span>
              </div>
              <p className="text-sm text-slate-400">
                For small buildings up to 20 units
              </p>
            </div>

            {/* Features List */}
            <ul className="space-y-3 mb-8 flex-1">
              {commonFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-teal/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={11} className="text-brand-teal" />
                  </div>
                  <span className="text-sm leading-relaxed text-slate-600">
                    {feature.name}
                  </span>
                </li>
              ))}
              {starterOnly.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-teal/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={11} className="text-brand-teal" />
                  </div>
                  <span className="text-sm leading-relaxed text-slate-600">
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>

            {/* Missing PRO features (greyed out) */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-400 mb-3">UPGRADE TO PRO FOR:</p>
              <ul className="space-y-2">
                {proFeatures.slice(0, 4).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 opacity-40">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-slate-400">—</span>
                    </div>
                    <span className="text-xs leading-relaxed text-slate-400 line-through">
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <a
              href="/register?plan=starter"
              className="block text-center py-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-200 bg-brand-navy text-white hover:bg-[#16205e] shadow-md shadow-brand-navy/20 hover:-translate-y-0.5 mt-6"
            >
              Start 14-Day Trial
            </a>
          </div>

          {/* PROFESSIONAL PLAN - 12,000 DZD (MOST POPULAR) */}
          <div className="relative rounded-2xl p-8 flex flex-col transition-all duration-200 hover:-translate-y-1 bg-gradient-to-b from-brand-navy to-[#162070] text-white shadow-2xl shadow-brand-navy/25 border border-brand-navy/20 scale-105 z-10">
            <div className="absolute -top-3.5 start-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-brand-amber to-orange-400 text-white text-xs font-bold rounded-full shadow-lg shadow-brand-amber/30">
                <Zap size={11} className="fill-white" />
                Best Value — Most Popular
              </span>
            </div>

            <div className="mb-7">
              <p className="text-sm font-bold mb-1.5 text-blue-200">
                Professional Plan
              </p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-black tracking-tight text-white">
                  12,000
                </span>
                <span className="text-sm font-medium text-blue-200/70">
                  DZD/month
                </span>
              </div>
              <p className="text-sm text-blue-200/70">
                For medium buildings up to 50 units
              </p>
              <div className="mt-3 inline-block px-3 py-1 bg-white/10 rounded-full">
                <span className="text-xs font-medium text-blue-200">
                  Just +6,000 DZD for DOUBLE the features
                </span>
              </div>
            </div>

            {/* All features (with PRO badges) */}
            <ul className="space-y-3 mb-8 flex-1">
              {commonFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={11} className="text-white" />
                  </div>
                  <span className="text-sm leading-relaxed text-blue-100">
                    {feature.name}
                  </span>
                </li>
              ))}
              
              {/* PRO Exclusive Features with Icons and Highlight */}
              <li className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-gradient-to-b from-brand-navy to-[#162070] text-xs font-bold text-brand-amber">
                    ✨ PROFESSIONAL EXCLUSIVE ✨
                  </span>
                </div>
              </li>
              
              {proFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-white/5 rounded-lg p-2 -mx-2">
                  <div className="w-5 h-5 rounded-full bg-brand-amber/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {feature.icon ? <feature.icon size={11} className="text-brand-amber" /> : <Check size={11} className="text-brand-amber" />}
                  </div>
                  <div>
                    <span className="text-sm font-medium leading-relaxed text-white">
                      {feature.name}
                    </span>
                    <p className="text-xs text-blue-200/60">
                      Not available in Starter Plan
                    </p>
                  </div>
                </li>
              ))}

              {/* Additional value note */}
              <li className="mt-3 pt-2">
                <div className="flex items-center gap-2 text-blue-200/80 text-xs">
                  <TrendingUp size={14} />
                  <span>Up to 40% better financial visibility with Pro reports</span>
                </div>
              </li>
            </ul>

            <a
              href="/register?plan=professional"
              className="block text-center py-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-200 bg-white text-brand-navy hover:bg-blue-50 shadow-lg transform hover:scale-[1.02]"
            >
              Start 14-Day Trial → Upgrade Anytime
            </a>
          </div>

          {/* ENTERPRISE PLAN - Custom */}
          <div className="rounded-2xl p-8 flex flex-col transition-all duration-200 hover:-translate-y-1 bg-white border border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300">
            <div className="mb-7">
              <p className="text-sm font-bold mb-1.5 text-slate-500">
                Enterprise Plan
              </p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-black tracking-tight text-slate-900">
                  Custom
                </span>
              </div>
              <p className="text-sm text-slate-400">
                For large portfolios & property management companies
              </p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {enterpriseFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-teal/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={11} className="text-brand-teal" />
                  </div>
                  <span className="text-sm leading-relaxed text-slate-600">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <a
              href="/contact"
              className="block text-center py-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-200 bg-brand-navy text-white hover:bg-[#16205e] shadow-md shadow-brand-navy/20 hover:-translate-y-0.5"
            >
              Contact Sales
            </a>
          </div>
        </div>

        {/* Comparison Table - Shows Starter vs Professional side by side */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-slate-900 text-center mb-6">
            Starter vs Professional — What's the Difference?
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Feature</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-600 w-32">Starter</th>
                  <th className="text-center py-3 px-4 font-semibold text-brand-navy bg-brand-navy/5 w-32">Professional</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-2 px-4 text-slate-700">Payment tracking</td>
                  <td className="text-center py-2 px-4 text-emerald-600">✓</td>
                  <td className="text-center py-2 px-4 text-emerald-600 bg-brand-navy/5">✓</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2 px-4 text-slate-700">Maintenance requests</td>
                  <td className="text-center py-2 px-4 text-emerald-600">✓</td>
                  <td className="text-center py-2 px-4 text-emerald-600 bg-brand-navy/5">✓</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2 px-4 text-slate-700">QR authentication</td>
                  <td className="text-center py-2 px-4 text-emerald-600">✓</td>
                  <td className="text-center py-2 px-4 text-emerald-600 bg-brand-navy/5">✓</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2 px-4 text-slate-700">Advanced analytics dashboard</td>
                  <td className="text-center py-2 px-4 text-slate-300">—</td>
                  <td className="text-center py-2 px-4 text-emerald-600 bg-brand-navy/5 font-medium">✓</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2 px-4 text-slate-700">PDF & CSV exports</td>
                  <td className="text-center py-2 px-4 text-slate-300">—</td>
                  <td className="text-center py-2 px-4 text-emerald-600 bg-brand-navy/5 font-medium">✓</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2 px-4 text-slate-700">Multi-building management</td>
                  <td className="text-center py-2 px-4 text-slate-300">—</td>
                  <td className="text-center py-2 px-4 text-emerald-600 bg-brand-navy/5 font-medium">✓</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2 px-4 text-slate-700">Priority support</td>
                  <td className="text-center py-2 px-4 text-slate-300">Standard</td>
                  <td className="text-center py-2 px-4 text-emerald-600 bg-brand-navy/5 font-medium">Priority</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-slate-800">Monthly Price</td>
                  <td className="text-center py-3 px-4 font-bold text-slate-800">6,000 DZD</td>
                  <td className="text-center py-3 px-4 font-bold text-brand-navy bg-brand-navy/5">12,000 DZD</td>
                </tr>
                <tr className="bg-brand-navy/10">
                  <td className="py-3 px-4 font-semibold text-slate-800">Value per DZD</td>
                  <td className="text-center py-3 px-4 text-slate-600">Base value</td>
                  <td className="text-center py-3 px-4 font-semibold text-brand-amber">🔹 2x features for 2x price + extras</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full">
              <Zap size={14} className="text-amber-600" />
              <span className="text-xs text-amber-700 font-medium">Professional gives you 6+ advanced features not available in Starter</span>
            </div>
          </div>
        </div>

        {/* Additional offers note */}
        <div className="text-center mt-12">
          <p className="text-sm text-slate-400">
            ✨ 14-day free trial • No credit card required • 10% discount for annual subscriptions • Cancel anytime
          </p>
          <p className="text-xs text-slate-400 mt-2">
            All prices are in Algerian Dinar (DZD) excluding VAT
          </p>
        </div>
      </div>
    </section>
  );
}