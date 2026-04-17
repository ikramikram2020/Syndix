import { useLanguage } from "../../contexts/LanguageContext";

export default function HowItWorks() {
  const { t } = useLanguage();

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-brand-amber bg-brand-amber/10 border border-brand-amber/20 rounded-full mb-4">
            {t.howItWorks.badge}
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            {t.howItWorks.headline}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-14 start-[33%] end-[33%] h-px bg-gradient-to-r from-brand-navy/20 via-brand-teal/30 to-brand-navy/20" />

          {t.howItWorks.steps.map((step, i) => (
            <div key={i} className="relative text-center group">
              <div className="relative inline-flex items-center justify-center w-16 h-16 mb-7">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-navy to-brand-teal opacity-10 group-hover:opacity-20 transition-opacity scale-125" />
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-brand-navy to-brand-teal flex items-center justify-center shadow-lg shadow-brand-navy/25 group-hover:shadow-brand-navy/40 group-hover:scale-105 transition-all">
                  <span className="text-xl font-black text-white">
                    {step.step}
                  </span>
                </div>
              </div>

              <div className="bg-brand-bg border border-slate-200 rounded-2xl p-6 group-hover:border-brand-teal/30 group-hover:shadow-lg group-hover:shadow-brand-teal/5 transition-all">
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
