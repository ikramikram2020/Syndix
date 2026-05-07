import { Check, Zap } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

export default function Pricing() {
  const { t } = useLanguage();

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full mb-4">
            {t.pricing.badge}
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            {t.pricing.headline}
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            {t.pricing.subheadline}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Starter Plan - 6,000 DZD/month */}
          <div className="relative rounded-2xl p-8 flex flex-col transition-all duration-200 hover:-translate-y-1 bg-white border border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300">
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

            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-brand-teal/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={11} className="text-brand-teal" />
                </div>
                <span className="text-sm leading-relaxed text-slate-600">
                  Payment tracking
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-brand-teal/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={11} className="text-brand-teal" />
                </div>
                <span className="text-sm leading-relaxed text-slate-600">
                  Resident management
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-brand-teal/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={11} className="text-brand-teal" />
                </div>
                <span className="text-sm leading-relaxed text-slate-600">
                  Maintenance requests
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-brand-teal/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={11} className="text-brand-teal" />
                </div>
                <span className="text-sm leading-relaxed text-slate-600">
                  Announcements
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-brand-teal/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={11} className="text-brand-teal" />
                </div>
                <span className="text-sm leading-relaxed text-slate-600">
                  Resident portal (PWA) access
                </span>
              </li>
              <li className="flex items-start gap-3 opacity-50">
                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-slate-400">—</span>
                </div>
                <span className="text-sm leading-relaxed text-slate-400">
                  Advanced reporting
                </span>
              </li>
              <li className="flex items-start gap-3 opacity-50">
                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-slate-400">—</span>
                </div>
                <span className="text-sm leading-relaxed text-slate-400">
                  PDF exports
                </span>
              </li>
            </ul>

            <a
              href="/register"
              className="block text-center py-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-200 bg-brand-navy text-white hover:bg-[#16205e] shadow-md shadow-brand-navy/20 hover:-translate-y-0.5"
            >
              Start Free Trial
            </a>
          </div>

          {/* Professional Plan - 12,000 DZD/month - MOST POPULAR */}
          <div className="relative rounded-2xl p-8 flex flex-col transition-all duration-200 hover:-translate-y-1 bg-gradient-to-b from-brand-navy to-[#162070] text-white shadow-2xl shadow-brand-navy/25 border border-brand-navy/20">
            <div className="absolute -top-3.5 start-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-brand-amber to-orange-400 text-white text-xs font-bold rounded-full shadow-lg shadow-brand-amber/30">
                <Zap size={11} className="fill-white" />
                Most Popular
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
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={11} className="text-white" />
                </div>
                <span className="text-sm leading-relaxed text-blue-100">
                  Payment tracking
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={11} className="text-white" />
                </div>
                <span className="text-sm leading-relaxed text-blue-100">
                  Resident management
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={11} className="text-white" />
                </div>
                <span className="text-sm leading-relaxed text-blue-100">
                  Maintenance requests
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={11} className="text-white" />
                </div>
                <span className="text-sm leading-relaxed text-blue-100">
                  Announcements
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={11} className="text-white" />
                </div>
                <span className="text-sm leading-relaxed text-blue-100">
                  Resident portal (PWA) access
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={11} className="text-white" />
                </div>
                <span className="text-sm leading-relaxed text-blue-100">
                  Advanced reporting
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={11} className="text-white" />
                </div>
                <span className="text-sm leading-relaxed text-blue-100">
                  PDF & CSV exports
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={11} className="text-white" />
                </div>
                <span className="text-sm leading-relaxed text-blue-100">
                  Multi-building management tools
                </span>
              </li>
            </ul>

            <a
              href="/register"
              className="block text-center py-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-200 bg-white text-brand-navy hover:bg-blue-50 shadow-lg"
            >
              Start Free Trial
            </a>
          </div>

          {/* Enterprise Plan - Custom Pricing */}
          <div className="relative rounded-2xl p-8 flex flex-col transition-all duration-200 hover:-translate-y-1 bg-white border border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300">
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
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-brand-teal/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={11} className="text-brand-teal" />
                </div>
                <span className="text-sm leading-relaxed text-slate-600">
                  Everything in Professional
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-brand-teal/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={11} className="text-brand-teal" />
                </div>
                <span className="text-sm leading-relaxed text-slate-600">
                  Advanced support
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-brand-teal/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={11} className="text-brand-teal" />
                </div>
                <span className="text-sm leading-relaxed text-slate-600">
                  Onboarding assistance
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-brand-teal/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={11} className="text-brand-teal" />
                </div>
                <span className="text-sm leading-relaxed text-slate-600">
                  Premium integrations
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-brand-teal/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={11} className="text-brand-teal" />
                </div>
                <span className="text-sm leading-relaxed text-slate-600">
                  SLA agreement
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-brand-teal/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={11} className="text-brand-teal" />
                </div>
                <span className="text-sm leading-relaxed text-slate-600">
                  Dedicated account manager
                </span>
              </li>
            </ul>

            <a
              href="/contact"
              className="block text-center py-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-200 bg-brand-navy text-white hover:bg-[#16205e] shadow-md shadow-brand-navy/20 hover:-translate-y-0.5"
            >
              Contact Sales
            </a>
          </div>
        </div>

        {/* Additional offers note */}
        <div className="text-center mt-12">
          <p className="text-sm text-slate-400">
            ✨ 14-day free trial • No credit card required • 10% discount for annual subscriptions
          </p>
        </div>
      </div>
    </section>
  );
}