import { useLanguage } from "../../contexts/LanguageContext";
import { Upload, Settings, TrendingUp, ArrowRight, Zap, CheckCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function HowItWorks() {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const steps = [
    {
      icon: Upload,
      title: "Import Your Data",
      desc: "Upload resident list via Excel or enter manually—takes 10 minutes max",
      features: ["Excel Import", "Manual Entry", "Bulk Upload"]
    },
    {
      icon: Settings,
      title: "Configure Settings",
      desc: "Set monthly fees, payment due dates, and notification preferences",
      features: ["Set Fees", "Due Dates", "Notifications"]
    },
    {
      icon: TrendingUp,
      title: "Start Collecting",
      desc: "Send payment links via SMS/email, residents pay online or at CCP",
      features: ["SMS/Email", "Online Pay", "Track All"]
    }
  ];

  // Animate steps one by one on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let step = 0;
          const interval = setInterval(() => {
            if (step < steps.length) {
              setActiveStep(step + 1);
              step++;
            } else {
              clearInterval(interval);
            }
          }, 300);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated, steps.length]);

  return (
    <section id="how-it-works" ref={sectionRef} className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-brand-amber bg-brand-amber/10 border border-brand-amber/20 rounded-full mb-4">
            {t.howItWorks.badge}
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            {t.howItWorks.headline}
          </h2>
        </div>

        {/* Steps - Clean Vertical Layout */}
        <div className="space-y-12">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isVisible = hasAnimated && idx < activeStep;
            const isCurrent = hasAnimated && idx === activeStep - 1;
            
            return (
              <div
                key={idx}
                className={`flex gap-6 transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                } ${isCurrent ? 'scale-[1.02]' : 'scale-100'}`}
                style={{ transitionDelay: `${idx * 150}ms` }}
              >
                {/* Left - Icon */}
                <div className="flex-shrink-0">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                    isCurrent 
                      ? 'bg-gradient-to-br from-brand-navy to-brand-teal shadow-lg shadow-brand-navy/25' 
                      : 'bg-brand-bg border-2 border-slate-200'
                  }`}>
                    <Icon className={`w-8 h-8 ${isCurrent ? 'text-white' : 'text-brand-navy'}`} />
                  </div>
                </div>

                {/* Right - Content */}
                <div className="flex-1">
                  <div className={`rounded-2xl p-6 transition-all ${
                    isCurrent 
                      ? 'bg-gradient-to-r from-brand-navy/5 to-transparent border-l-4 border-brand-teal' 
                      : ''
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-sm font-bold ${isCurrent ? 'text-brand-teal' : 'text-slate-400'}`}>
                        Step {idx + 1}
                      </span>
                      {isCurrent && (
                        <span className="text-xs px-2 py-0.5 bg-brand-teal/10 text-brand-teal rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-slate-500 mb-4">{step.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {step.features.map((feature, fidx) => (
                        <span key={fidx} className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <CheckCircle size={12} className="text-brand-teal" />
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className={`text-center mt-12 transition-all duration-500 ${
          hasAnimated && activeStep === steps.length ? 'opacity-100' : 'opacity-0'
        }`}>
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 px-8 py-3 bg-brand-navy text-white font-bold rounded-xl hover:bg-brand-navy/90 hover:scale-105 transition-all"
          >
            Start Free Trial
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}