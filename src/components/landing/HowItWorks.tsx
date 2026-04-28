import { useLanguage } from "../../contexts/LanguageContext";
import { 
  Upload, 
  Settings, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight,
  Zap,
  Sparkles
} from "lucide-react";
import { useState } from "react";

export default function HowItWorks() {
  const { t } = useLanguage();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Define steps with icons (since t.howItWorks.steps doesn't have icons)
  const stepsWithIcons = [
    {
      step: "01",
      title: "Import Your Data",
      desc: "Upload resident list via Excel or enter manually—takes 10 minutes max",
      icon: Upload,
      features: ["Excel Import", "Manual Entry", "Bulk Upload"],
      color: "from-brand-navy to-brand-teal"
    },
    {
      step: "02",
      title: "Configure Settings",
      desc: "Set monthly fees, payment due dates, and notification preferences",
      icon: Settings,
      features: ["Set Fees", "Due Dates", "Notifications"],
      color: "from-brand-orange to-brand-amber"
    },
    {
      step: "03",
      title: "Start Collecting",
      desc: "Send payment links via SMS/email, residents pay online or at CCP",
      icon: TrendingUp,
      features: ["SMS/Email", "Online Pay", "Track All"],
      color: "from-brand-teal to-brand-navy"
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-white to-brand-bg relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-teal/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-amber/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-navy/3 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-brand-amber bg-brand-amber/10 border border-brand-amber/20 rounded-full mb-4 animate-fade-in">
            <Sparkles className="w-3 h-3" />
            {t.howItWorks.badge}
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4 animate-fade-in-up">
            {t.howItWorks.headline}
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Get started in minutes — no technical skills required
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-32 left-0 right-0">
            <div className="relative h-[2px] bg-gradient-to-r from-brand-navy/20 via-brand-teal/40 to-brand-navy/20">
              <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-2 h-2 rounded-full bg-brand-teal animate-pulse"></div>
              <div className="absolute top-1/2 left-2/3 -translate-y-1/2 w-2 h-2 rounded-full bg-brand-teal animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>

          {stepsWithIcons.map((step, i) => {
            const Icon = step.icon;
            const isHovered = hoveredCard === i;
            
            return (
              <div
                key={i}
                className="relative group animate-fade-in-up"
                style={{ animationDelay: `${0.2 + i * 0.1}s` }}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Glow Effect on Hover */}
                {isHovered && (
                  <div className="absolute -inset-2 bg-gradient-to-r from-brand-teal/20 to-brand-amber/20 rounded-3xl blur-xl transition-all duration-500"></div>
                )}
                
                {/* Card */}
                <div className={`relative bg-white rounded-2xl p-8 border-2 transition-all duration-300 ${
                  isHovered 
                    ? 'border-brand-teal/50 shadow-2xl -translate-y-2' 
                    : 'border-slate-200 shadow-lg hover:shadow-xl'
                }`}>
                  
                  {/* Step Number Circle */}
                  <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300 ${
                      isHovered ? 'scale-110' : 'scale-100'
                    }`} />
                    <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg transition-all duration-300 ${
                      isHovered ? 'scale-110 shadow-xl' : 'scale-100'
                    }`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    {/* Step Badge */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-brand-orange text-brand-orange flex items-center justify-center text-sm font-bold shadow-md">
                      {step.step}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-navy transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-5">
                    {step.desc}
                  </p>

                  {/* Feature List */}
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    {step.features.map((feature, fidx) => (
                      <div 
                        key={fidx} 
                        className={`flex items-center gap-2 text-xs text-slate-600 transition-all duration-300 ${
                          isHovered ? 'translate-x-1' : 'translate-x-0'
                        }`}
                        style={{ transitionDelay: `${fidx * 50}ms` }}
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-brand-teal flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Hover Arrow */}
                  <div className={`absolute bottom-6 right-6 transition-all duration-300 ${
                    isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
                  }`}>
                    <ArrowRight className="w-5 h-5 text-brand-teal" />
                  </div>
                </div>

                {/* Animated Dot below card (except last) */}
                {i < stepsWithIcons.length - 1 && (
                  <div className="hidden md:flex justify-center mt-6">
                    <div className={`w-2 h-2 rounded-full bg-brand-teal transition-all duration-300 ${
                      isHovered ? 'scale-150 animate-ping' : 'scale-100'
                    }`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="inline-flex items-center gap-4 bg-white border border-slate-200 rounded-full p-1.5 shadow-sm">
            <div className="flex -space-x-2 px-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-navy to-brand-teal border-2 border-white flex items-center justify-center">
                  <span className="text-[10px] text-white font-bold">✓</span>
                </div>
              ))}
            </div>
            <span className="text-sm text-slate-600 pr-4">
              Join <strong className="text-brand-navy">1,200+ buildings</strong> already using Syndix
            </span>
          </div>
          
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 bg-gradient-to-r from-brand-navy to-brand-teal text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200 group"
          >
            Start Your 14-Day Trial
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
          <p className="text-xs text-slate-400 mt-3">No credit card required • Cancel anytime</p>
        </div>
      </div>
    </section>
  );
}