import {
  FileText,
  MessageSquare,
  CreditCard,
  Wrench,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

const problemIcons = [FileText, MessageSquare, CreditCard, Wrench];

const problemStyles = [
  { badge: "bg-red-50 border-red-100 text-red-500", dot: "bg-red-400" },
  { badge: "bg-amber-50 border-amber-100 text-amber-500", dot: "bg-amber-400" },
  {
    badge: "bg-orange-50 border-orange-100 text-orange-500",
    dot: "bg-orange-400",
  },
  { badge: "bg-rose-50 border-rose-100 text-rose-500", dot: "bg-rose-400" },
];

export default function ProblemSolution() {
  const { t } = useLanguage();

  const solutionPoints = [
    "Centralized resident & unit management",
    "Automated payment reminders & invoicing",
    "Real-time maintenance ticket tracking",
    "Instant broadcast announcements",
    "Mobile QR access for all residents",
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-red-500 bg-red-50 border border-red-100 rounded-full mb-4">
            {t.problem.badge}
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            {t.problem.headline}
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            {t.problem.subheadline}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
          {t.problem.problems.map((prob, i) => {
            const Icon = problemIcons[i];
            const style = problemStyles[i];
            return (
              <div
                key={i}
                className="group relative bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-100 hover:border-slate-300 transition-all duration-200 hover:-translate-y-1"
              >
                <div
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 ${style.badge}`}
                >
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-2">
                  {prob.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {prob.desc}
                </p>
                <div
                  className={`absolute top-5 end-5 w-2 h-2 rounded-full animate-pulse ${style.dot}`}
                />
              </div>
            );
          })}
        </div>

        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-navy via-[#1a3a8f] to-[#0f2260] shadow-2xl shadow-brand-navy/20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(31,162,166,0.25)_0%,_transparent_60%)]" />
          <div className="absolute bottom-0 start-0 w-64 h-64 bg-brand-amber/5 rounded-full blur-3xl" />

          <div className="relative p-8 md:p-12">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <span className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-brand-teal bg-brand-teal/15 border border-brand-teal/25 rounded-full mb-5">
                  {t.problem.solutionBadge}
                </span>
                <h2 className="text-3xl lg:text-4xl font-black text-white mb-4 leading-tight">
                  {t.problem.solutionHeadline}
                </h2>
                <p className="text-blue-200/80 text-base leading-relaxed mb-8">
                  {t.problem.solutionDesc}
                </p>
                <a
                  href="#pricing"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-brand-amber hover:bg-amber-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-amber/30 hover:-translate-y-0.5 text-sm"
                >
                  {t.hero.cta1} <ArrowRight size={15} />
                </a>
              </div>

              <div className="space-y-3">
                {solutionPoints.map((point, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-white/8 border border-white/10 rounded-xl px-5 py-4 hover:bg-white/12 transition-colors"
                  >
                    <div className="w-5 h-5 rounded-full bg-brand-teal/20 border border-brand-teal/30 flex items-center justify-center flex-shrink-0">
                      <CheckCircle size={12} className="text-brand-teal" />
                    </div>
                    <span className="text-sm font-medium text-white/90">
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
