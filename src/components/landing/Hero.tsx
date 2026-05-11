import {
  ArrowRight,
  Play,
  Users,
  CreditCard,
  Wrench,
  QrCode,
  Bell,
  TrendingUp,
  Building2,
  Shield,
  CheckCircle,
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

function FloatingCard({
  icon: Icon,
  label,
  value,
  sub,
  iconClass,
  iconBg,
  className,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  iconClass: string;
  iconBg: string;
  className?: string;
  delay?: string;
}) {
  return (
    <div
      className={`absolute bg-white rounded-2xl shadow-xl border border-slate-100 p-3.5 flex items-center gap-3 min-w-[148px] animate-float ${className}`}
      style={{ animationDelay: delay || "0s" }}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}
      >
        <Icon size={18} className={iconClass} />
      </div>
      <div>
        <p className="text-[10px] text-slate-400 font-medium leading-none mb-1">
          {label}
        </p>
        <p className="text-sm font-bold text-slate-800 leading-none">{value}</p>
        {sub && (
          <p className="text-[10px] text-emerald-500 font-semibold mt-1">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

export default function Hero() {
  const { t } = useLanguage();

  const statsData = [
    { value: "1,200+", label: t.hero.stats.buildings },
    { value: "48K+", label: t.hero.stats.residents },
    { value: "99.2%", label: t.hero.stats.requests },
  ];

  const demoVideoUrl = "https://drive.google.com/file/d/1NQRq_bzGR7clQWyD06u3AD4PPH--oOH8/view?usp=sharing";

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20 bg-brand-bg bg-hero-grid">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -start-40 w-[500px] h-[500px] bg-brand-navy/4 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -end-40 w-[600px] h-[600px] bg-brand-teal/6 rounded-full blur-3xl" />
        <div className="absolute top-1/3 end-1/4 w-48 h-48 bg-brand-amber/6 rounded-full blur-2xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-start">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-navy/8 border border-brand-navy/12 text-brand-navy text-sm font-semibold mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
              {t.hero.badge}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.2rem] font-black text-slate-900 leading-[1.1] tracking-tight mb-6 animate-fade-in-up">
              {t.hero.headline.split(" ").slice(0, 4).join(" ")}{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-brand-navy via-[#1d6ab5] to-brand-teal bg-clip-text text-transparent">
                  {t.hero.headline.split(" ").slice(4, 7).join(" ")}
                </span>
                <span className="absolute -bottom-1 start-0 end-0 h-[3px] bg-gradient-to-r from-brand-navy/30 to-brand-teal/30 rounded-full" />
              </span>{" "}
              {t.hero.headline.split(" ").slice(7).join(" ")}
            </h1>

            <p
              className="text-base sm:text-lg text-slate-500 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              {t.hero.subheadline}
            </p>

            <div
              className="flex flex-wrap gap-4 justify-center lg:justify-start mb-10 animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <a
                href="#pricing"
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-brand-navy hover:bg-[#16205e] text-white font-bold rounded-xl shadow-lg shadow-brand-navy/25 transition-all duration-200 hover:shadow-brand-navy/40 hover:-translate-y-0.5 text-sm"
              >
                {t.hero.cta1}
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </a>
              <a
                href={demoVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 px-6 py-3.5 bg-white border border-slate-200 hover:border-brand-teal/50 text-slate-700 hover:text-brand-teal font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md text-sm"
              >
                <span className="w-7 h-7 rounded-full bg-brand-teal/10 flex items-center justify-center">
                  <Play
                    size={10}
                    className="ms-0.5 fill-brand-teal text-brand-teal"
                  />
                </span>
                {t.hero.cta2}
              </a>
            </div>

            <div
              className="flex items-center gap-3 justify-center lg:justify-start animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="flex -space-x-2">
                {[
                  { c: "bg-brand-navy", l: "M" },
                  { c: "bg-brand-teal", l: "S" },
                  { c: "bg-brand-amber", l: "K" },
                  { c: "bg-blue-500", l: "A" },
                ].map((av, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full border-2 border-brand-bg ${av.c} flex items-center justify-center text-[11px] text-white font-bold`}
                  >
                    {av.l}
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-500">{t.hero.trustedBy}</p>
            </div>
          </div>

          <div className="relative h-[420px] flex items-center justify-center">
            <div className="relative w-60 h-60 sm:w-64 sm:h-64 animate-float-slow">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-navy to-[#164480] shadow-2xl shadow-brand-navy/25 flex flex-col items-center justify-center gap-3">
                <div className="w-20 h-20 rounded-2xl bg-white/12 border border-white/15 flex items-center justify-center">
                  <Building2 size={38} className="text-white" />
                </div>
                <div className="text-center px-4">
                  <p className="text-white font-bold text-base leading-none">
                    Les Jardins d'Hydra
                  </p>
                  <p className="text-white/50 text-xs mt-1.5">
                    64 Units · 8 Floors
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-400/20 rounded-full border border-emerald-400/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-300">
                    94% Occupied
                  </span>
                </div>
              </div>
              <div className="absolute -inset-3 rounded-[32px] border-2 border-brand-navy/10 animate-spin-slow" />
              <div
                className="absolute -inset-6 rounded-[40px] border border-brand-teal/8"
                style={{ animation: "spin 12s linear infinite reverse" }}
              />
            </div>

            <FloatingCard
              icon={Users}
              label="Total Residents"
              value="156"
              sub="+8 this month"
              iconBg="bg-brand-navy/8"
              iconClass="text-brand-navy"
              className="-top-2 -start-2 sm:-start-10"
              delay="0s"
            />
            <FloatingCard
              icon={CreditCard}
              label="Monthly Revenue"
              value="412K DZD"
              sub="96% collected"
              iconBg="bg-emerald-50"
              iconClass="text-emerald-600"
              className="top-10 -end-2 sm:-end-10"
              delay="0.8s"
            />
            <FloatingCard
              icon={Wrench}
              label="Open Tickets"
              value="3 Active"
              iconBg="bg-orange-50"
              iconClass="text-orange-500"
              className="-bottom-4 -start-2 sm:-start-10"
              delay="1.6s"
            />
            <FloatingCard
              icon={Bell}
              label="Announcement"
              value="Sent to all"
              iconBg="bg-brand-teal/10"
              iconClass="text-brand-teal"
              className="bottom-12 -end-2 sm:-end-10"
              delay="2.4s"
            />
          </div>
        </div>

        <div className="mt-16 pt-10 border-t border-slate-200/70">
          <div className="flex flex-col sm:flex-row sm:items-center gap-8 sm:gap-16">
            <div className="grid grid-cols-3 gap-6 sm:gap-10">
              {statsData.map((s, i) => (
                <div key={i} className="text-center sm:text-start">
                  <p className="text-3xl font-black text-brand-navy mb-0.5">
                    {s.value}
                  </p>
                  <p className="text-sm text-slate-400 font-medium">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {[
                { icon: Shield, text: "Bank-Grade Security" },
                { icon: QrCode, text: "Smart QR Access" },
                { icon: TrendingUp, text: "Real-Time Analytics" },
                { icon: CheckCircle, text: "5-Min Setup" },
              ].map(({ icon: Icon, text }, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-600 font-medium shadow-sm"
                >
                  <Icon size={12} className="text-brand-teal" />
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}