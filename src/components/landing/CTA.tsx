import { ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";  // ← Changed from react-router-dom
import { useLanguage } from "../../contexts/LanguageContext";

export default function CTA() {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-brand-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-[#1a3a8f] to-[#0f2260]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(31,162,166,0.25)_0%,_transparent_65%)]" />
          <div className="absolute top-0 start-0 w-72 h-72 bg-brand-teal/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 end-0 w-72 h-72 bg-brand-amber/8 rounded-full blur-3xl" />

          <div className="relative px-8 py-14 md:px-16 md:py-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-teal/15 border border-brand-teal/25 text-brand-teal text-xs font-semibold mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
              No credit card required
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-white mb-5 leading-tight tracking-tight">
              {t.cta.headline}
            </h2>
            <p className="text-blue-200/70 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              {t.cta.subheadline}
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              {/* Changed "to" to "href" */}
              <Link
                href="/register"  // ← Changed from "to"
                className="group inline-flex items-center gap-2 px-8 py-3.5 bg-brand-amber hover:bg-amber-500 text-white font-bold rounded-xl shadow-xl shadow-brand-amber/30 transition-all hover:-translate-y-0.5 text-sm"
              >
                {t.cta.cta1}
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </Link>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 border border-white/15 hover:bg-white/15 text-white font-semibold rounded-xl backdrop-blur-sm transition-all text-sm"
              >
                <Calendar size={15} />
                {t.cta.cta2}
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-5 justify-center text-sm text-blue-300/50">
              {[
                "14-day free trial",
                "No setup fees",
                "Cancel anytime",
                "Full support included",
              ].map((item, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-brand-teal" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}