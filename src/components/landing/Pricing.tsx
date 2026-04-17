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
          {t.pricing.plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-8 flex flex-col transition-all duration-200 hover:-translate-y-1 ${
                plan.popular
                  ? "bg-gradient-to-b from-brand-navy to-[#162070] text-white shadow-2xl shadow-brand-navy/25 border border-brand-navy/20"
                  : "bg-white border border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 start-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-brand-amber to-orange-400 text-white text-xs font-bold rounded-full shadow-lg shadow-brand-amber/30">
                    <Zap size={11} className="fill-white" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-7">
                <p
                  className={`text-sm font-bold mb-1.5 ${plan.popular ? "text-blue-200" : "text-slate-500"}`}
                >
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span
                    className={`text-4xl font-black tracking-tight ${plan.popular ? "text-white" : "text-slate-900"}`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm font-medium ${plan.popular ? "text-blue-200/70" : "text-slate-400"}`}
                  >
                    {plan.period}
                  </span>
                </div>
                <p
                  className={`text-sm ${plan.popular ? "text-blue-200/70" : "text-slate-400"}`}
                >
                  {plan.desc}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        plan.popular ? "bg-white/15" : "bg-brand-teal/10"
                      }`}
                    >
                      <Check
                        size={11}
                        className={
                          plan.popular ? "text-white" : "text-brand-teal"
                        }
                      />
                    </div>
                    <span
                      className={`text-sm leading-relaxed ${plan.popular ? "text-blue-100" : "text-slate-600"}`}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href="/register"
                className={`block text-center py-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-200 ${
                  plan.popular
                    ? "bg-white text-brand-navy hover:bg-blue-50 shadow-lg"
                    : "bg-brand-navy text-white hover:bg-[#16205e] shadow-md shadow-brand-navy/20 hover:-translate-y-0.5"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
