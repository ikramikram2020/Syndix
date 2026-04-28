import { useLanguage } from "../../contexts/LanguageContext";
import { 
  Upload, 
  Settings, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight,
  Zap,
  Sparkles,
  Building2,
  Users,
  CreditCard,
  Smartphone,
  Bell,
  QrCode
} from "lucide-react";
import { useState } from "react";

export default function HowItWorks() {
  const { t } = useLanguage();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Define steps with icons (keeping your exact text)
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

  // Additional features icons
  const extraFeatures = [
    { icon: Building2, label: "Building Management" },
    { icon: Users, label: "Resident Portal" },
    { icon: CreditCard, label: "DZD Payments" },
    { icon: QrCode, label: "QR Access" },
    { icon: Bell, label: "Notifications" },
    { icon: Smartphone, label: "Mobile App" }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-white to-brand-bg relative overflow-hidden">
      {/* Modern Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-teal/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-amber/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-navy/3 rounded-full blur-3xl"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="h-full w-full" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #1C2B6B 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header - UNCHANGED TEXT */}
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

        {/* Modern Steps Grid */}
        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Modern Connecting Line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 -translate-y-1/2">
            <div className="relative h-[1px] bg-gradient-to-r from-transparent via-brand-teal/30 to-transparent">
              <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-brand-teal/50"></div>
              <div className="absolute top-1/2 left-2/3 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-brand-teal/50"></div>
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
                {/* Modern Glow Effect */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${step.color} rounded-2xl blur-xl transition-all duration-500 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}></div>
                
                {/* Modern Card */}
                <div className={`relative bg-white rounded-2xl p-6 transition-all duration-500 ${
                  isHovered 
                    ? 'shadow-2xl -translate-y-1' 
                    : 'shadow-lg hover:shadow-xl'
                }`}>
                  
                  {/* Icon Circle - Modern Design */}
                  <div className="relative mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg transition-all duration-300 ${
                      isHovered ? 'scale-110 rotate-3' : 'scale-100'
                    }`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    {/* Step Badge - Modern */}
                    <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      isHovered ? 'scale-110' : 'scale-100'
                    }`}>
                      <span className={`text-transparent bg-clip-text bg-gradient-to-r ${step.color}`}>
                        {step.step}
                      </span>
                    </div>
                  </div>

                  {/* Content - UNCHANGED TEXT */}
                  <h3 className={`text-xl font-bold mb-3 transition-colors duration-300 ${
                    isHovered ? 'text-brand-navy' : 'text-slate-900'
                  }`}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-5">
                    {step.desc}
                  </p>

                  {/* Modern Feature Tags */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                    {step.features.map((feature, fidx) => (
                      <span 
                        key={fidx} 
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-brand-bg rounded-lg text-xs text-slate-600 transition-all duration-300 ${
                          isHovered ? 'translate-x-0.5' : 'translate-x-0'
                        }`}
                        style={{ transitionDelay: `${fidx * 30}ms` }}
                      >
                        <CheckCircle className="w-3 h-3 text-brand-teal" />
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Modern Hover Arrow */}
                  <div className={`absolute bottom-5 right-5 transition-all duration-300 ${
                    isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
                  }`}>
                    <div className="w-7 h-7 rounded-full bg-brand-teal/10 flex items-center justify-center">
                      <ArrowRight className="w-3.5 h-3.5 text-brand-teal" />
                    </div>
                  </div>
                </div>

                {/* Modern Connector Dot */}
                {i < stepsWithIcons.length - 1 && (
                  <div className="hidden md:flex justify-center mt-4">
                    <div className={`w-1.5 h-1.5 rounded-full bg-brand-teal/40 transition-all duration-300 ${
                      isHovered ? 'scale-150' : 'scale-100'
                    }`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modern Bottom Section */}
        <div className="mt-20 text-center animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          {/* Modern Feature Strip */}
          <div className="max-w-3xl mx-auto mb-10">
            <div className="flex flex-wrap justify-center gap-3">
              {extraFeatures.map((feature, idx) => (
                <div 
                  key={idx}
                  className="group flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full hover:border-brand-teal/30 hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  <feature.icon className="w-3.5 h-3.5 text-brand-teal group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-slate-600 group-hover:text-brand-navy">
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Modern CTA */}
          <div className="inline-flex items-center gap-4 bg-white border border-slate-200 rounded-full p-1 pr-5 shadow-sm">
            <div className="flex -space-x-2 pl-3">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-navy to-brand-teal border-2 border-white flex items-center justify-center shadow-md"
                >
                  <span className="text-[10px] text-white font-bold">✓</span>
                </div>
              ))}
            </div>
            <span className="text-sm text-slate-500">
              Join <strong className="text-brand-navy">1,200+ buildings</strong> already using Syndix
            </span>
          </div>
          
          {/* Modern Button */}
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 bg-gradient-to-r from-brand-navy to-brand-teal text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200 group"
          >
            <Zap className="w-4 h-4" />
            Start Your 14-Day Trial
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
          <p className="text-xs text-slate-400 mt-3">No credit card required • Cancel anytime</p>
        </div>
      </div>
    </section>
  );
}