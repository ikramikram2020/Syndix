import { useLanguage } from "../../contexts/LanguageContext";
import { 
  Upload, 
  Settings, 
  TrendingUp,
  ArrowRight,
  Zap,
  CheckCircle
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function HowItWorks() {
  const { t } = useLanguage();
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Icons for each step
  const stepIcons = [
    { 
      icon: Upload, 
      color: "from-brand-navy to-brand-teal", 
      bg: "bg-brand-navy/10", 
      iconColor: "text-brand-navy", 
      title: "Import Your Data", 
      desc: "Upload resident list via Excel or enter manually—takes 10 minutes max",
      details: ["Excel Import", "Manual Entry", "Bulk Upload"]
    },
    { 
      icon: Settings, 
      color: "from-brand-orange to-brand-amber", 
      bg: "bg-brand-amber/10", 
      iconColor: "text-brand-amber", 
      title: "Configure Settings", 
      desc: "Set monthly fees, payment due dates, and notification preferences",
      details: ["Set Fees", "Due Dates", "Notifications"]
    },
    { 
      icon: TrendingUp, 
      color: "from-brand-teal to-brand-navy", 
      bg: "bg-brand-teal/10", 
      iconColor: "text-brand-teal", 
      title: "Start Collecting", 
      desc: "Send payment links via SMS/email, residents pay online or at CCP",
      details: ["SMS/Email", "Online Pay", "Track All"]
    }
  ];

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observers = stepRefs.current.map((ref, index) => {
      if (!ref) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleSteps((prev) => {
                if (!prev.includes(index)) {
                  return [...prev, index];
                }
                return prev;
              });
            }
          });
        },
        { threshold: 0.3, rootMargin: "0px 0px -100px 0px" }
      );

      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach((observer) => {
        if (observer) observer.disconnect();
      });
    };
  }, []);

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-white to-brand-bg relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-teal/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-amber/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-brand-amber bg-brand-amber/10 border border-brand-amber/20 rounded-full mb-4">
            <Zap className="w-3 h-3" />
            {t.howItWorks.badge}
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4">
            {t.howItWorks.headline}
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Get started in minutes, not days — no technical skills required
          </p>
        </div>

        {/* Vertical Timeline - One by one animation */}
        <div className="max-w-4xl mx-auto">
          {stepIcons.map((step, idx) => {
            const IconComponent = step.icon;
            const isVisible = visibleSteps.includes(idx);
            
            return (
              <div
                key={idx}
                ref={(el) => { stepRefs.current[idx] = el; }}
                className={`relative mb-16 transition-all duration-700 transform ${
                  isVisible 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 -translate-x-10'
                }`}
                style={{ transitionDelay: `${idx * 200}ms` }}
              >
                {/* Vertical Connecting Line */}
                {idx < stepIcons.length - 1 && (
                  <div className="absolute left-8 top-24 bottom-0 w-0.5 bg-gradient-to-b from-brand-teal to-brand-navy/20 hidden md:block">
                    <div 
                      className={`w-full h-0 bg-gradient-to-b from-brand-navy to-brand-teal rounded-full transition-all duration-1000 ${
                        isVisible ? 'h-full' : 'h-0'
                      }`}
                      style={{ transitionDelay: `${idx * 200 + 300}ms` }}
                    ></div>
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                  {/* Left side - Icon with number */}
                  <div className="relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20">
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.color} opacity-20 transition-all duration-500 ${
                      isVisible ? 'scale-100' : 'scale-50'
                    }`}></div>
                    <div className={`relative w-full h-full rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg transition-all duration-500 ${
                      isVisible ? 'scale-100 rotate-0' : 'scale-50 rotate-180'
                    }`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    {/* Step Number */}
                    <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full bg-brand-orange text-white flex items-center justify-center text-xs font-bold shadow-lg transition-all duration-500 ${
                      isVisible ? 'scale-100' : 'scale-0'
                    }`}>
                      {idx + 1}
                    </div>
                  </div>

                  {/* Right side - Content */}
                  <div className="flex-1">
                    <div className={`bg-white rounded-2xl p-6 md:p-8 border-2 border-slate-200 hover:border-brand-teal/30 hover:shadow-xl transition-all duration-300 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}>
                      <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">
                        {step.title}
                      </h3>
                      <p className="text-slate-500 leading-relaxed mb-4">
                        {step.desc}
                      </p>
                      
                      {/* Feature pills */}
                      <div className="flex flex-wrap gap-2">
                        {step.details.map((detail, didx) => (
                          <span
                            key={didx}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-bg rounded-lg text-xs text-slate-600 transition-all duration-500 delay-300 ${
                              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                            }`}
                            style={{ transitionDelay: `${idx * 200 + 400 + didx * 100}ms` }}
                          >
                            <CheckCircle className="w-3 h-3 text-brand-teal" />
                            {detail}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Animated arrow between steps */}
                {idx < stepIcons.length - 1 && (
                  <div className={`hidden md:flex justify-center mt-4 transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'
                  }`}>
                    <div className="animate-bounce">
                      <ArrowRight className="w-6 h-6 text-brand-teal rotate-90 md:rotate-0" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Final CTA Button */}
        <div className={`text-center mt-8 transition-all duration-700 delay-700 transform ${
          visibleSteps.length === 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <button className="group inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-brand-navy to-brand-teal text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200">
            Get Started Now
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-xs text-slate-400 mt-3">No credit card required • 14-day free trial</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  );
}