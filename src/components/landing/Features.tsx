import {
  Building2,
  QrCode,
  CreditCard,
  Wrench,
  Megaphone,
  Smartphone,
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

const featureIcons = [
  Building2,
  QrCode,
  CreditCard,
  Wrench,
  Megaphone,
  Smartphone,
];

const featureStyles = [
  {
    bg: "bg-brand-navy/8",
    border: "border-brand-navy/15",
    icon: "text-brand-navy",
    hover: "hover:border-brand-navy/30",
    accent: "from-brand-navy/5",
  },
  {
    bg: "bg-brand-teal/8",
    border: "border-brand-teal/15",
    icon: "text-brand-teal",
    hover: "hover:border-brand-teal/30",
    accent: "from-brand-teal/5",
  },
  {
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    icon: "text-emerald-600",
    hover: "hover:border-emerald-200",
    accent: "from-emerald-50/50",
  },
  {
    bg: "bg-orange-50",
    border: "border-orange-100",
    icon: "text-orange-500",
    hover: "hover:border-orange-200",
    accent: "from-orange-50/50",
  },
  {
    bg: "bg-brand-amber/10",
    border: "border-brand-amber/20",
    icon: "text-brand-amber",
    hover: "hover:border-brand-amber/30",
    accent: "from-amber-50/50",
  },
  {
    bg: "bg-rose-50",
    border: "border-rose-100",
    icon: "text-rose-500",
    hover: "hover:border-rose-200",
    accent: "from-rose-50/50",
  },
];

export default function Features() {
  const { t } = useLanguage();

  return (
    <section id="features" className="py-24 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-brand-teal bg-brand-teal/10 border border-brand-teal/20 rounded-full mb-4">
            {t.features.badge}
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            {t.features.headline}
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            {t.features.subheadline}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.features.list.map((feature, i) => {
            const Icon = featureIcons[i];
            const style = featureStyles[i];
            return (
              <div
                key={i}
                className={`group relative bg-white border border-slate-200 ${style.hover} rounded-2xl p-7 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${style.accent} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}
                />

                <div
                  className={`relative w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${style.bg} ${style.border}`}
                >
                  <Icon size={22} className={style.icon} />
                </div>

                <h3 className="relative text-base font-bold text-slate-900 mb-2.5 leading-snug">
                  {feature.title}
                </h3>
                <p className="relative text-sm text-slate-500 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
