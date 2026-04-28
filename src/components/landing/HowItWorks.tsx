import { useLanguage } from "../../contexts/LanguageContext";
import { 
  Building2, 
  Users, 
  CreditCard, 
  QrCode, 
  Bell, 
  CheckCircle,
  ArrowRight,
  Upload,
  Settings,
  TrendingUp,
  Smartphone,
  Zap
} from "lucide-react";
import { useState, useEffect } from "react";

export default function HowItWorks() {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  // Auto-rotate steps for demo
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Icons for each step
  const stepIcons = [
    { icon: Upload, color: "from-brand-navy to-brand-teal", bg: "bg-brand-navy/10", iconColor: "text-brand-navy", title: "Import Your Data", desc: "Upload resident list via Excel or enter manually—takes 10 minutes max" },
    { icon: Settings, color: "from-brand-orange to-brand-amber", bg: "bg-brand-amber/10", iconColor: "text-brand-amber", title: "Configure Settings", desc: "Set monthly fees, payment due dates, and notification preferences" },
    { icon: TrendingUp, color: "from-brand-teal to-brand-navy", bg: "bg-brand-teal/10", iconColor: "text-brand-teal", title: "Start Collecting", desc: "Send payment links via SMS/email, residents pay online or at CCP" }
  ];

  const features = [
    { icon: <Upload className="w-4 h-4" />, text: "Excel Import" },
    { icon: <Users className="w-4 h-4" />, text: "Bulk Upload" },
    { icon: <CreditCard className="w-4 h-4" />, text: "DZD Payments" },
    { icon: <QrCode className="w-4 h-4" />, text: "QR Access" },
    { icon: <Bell className="w-4 h-4" />, text: "Notifications" },
    { icon: <Smartphone className="w-4 h-4" />, text: "Mobile App" }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-white to-brand-bg relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-teal/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-amber/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
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

        {/* Horizontal Timeline Strip - Desktop */}
        <div className="hidden md:block relative mb-16">
          {/* Progress Line */}
          <div className="absolute top-20 left-0 right-0 h-1 bg-slate-200 rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-brand-navy via-brand-teal to-brand-amber rounded-full transition-all duration-500"
              style={{ width: `${(activeStep + 1) * 33.33}%` }}
            ></div>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-3 gap-8 relative">
            {stepIcons.map((step, idx) => {
              const IconComponent = step.icon;
              const isActive = activeStep === idx;
              const isCompleted = activeStep > idx;
              
              return (
                <div 
                  key={idx}
                  className="relative text-center cursor-pointer group"
                  onClick={() => setActiveStep(idx)}
                >
                  {/* Step Circle */}
                  <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
                    <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
                      isActive ? 'scale-110 bg-gradient-to-br from-brand-navy to-brand-teal opacity-20' : 'bg-slate-100'
                    } group-hover:scale-110`} />
                    <div className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive || isCompleted
                        ? 'bg-gradient-to-br from-brand-navy to-brand-teal shadow-lg shadow-brand-navy/30'
                        : 'bg-white border-2 border-slate-200'
                    } group-hover:scale-105`}>
                      {isCompleted ? (
                        <CheckCircle className="w-8 h-8 text-white" />
                      ) : (
                        <IconComponent className={`w-8 h-8 ${isActive ? 'text-white' : 'text-slate-400'} transition-colors`} />
                      )}
                    </div>
                    {/* Step Number Badge */}
                    <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isActive || isCompleted
                        ? 'bg-brand-orange text-white shadow-lg'
                        : 'bg-white border-2 border-slate-200 text-slate-400'
                    }`}>
                      {idx + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className={`text-lg font-bold mb-2 transition-colors ${
                    isActive ? 'text-brand-navy' : 'text-slate-600'
                  }`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm transition-colors ${
                    isActive ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    {step.desc}
                  </p>

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-brand-navy to-brand-teal rounded-full animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile: Interactive Cards with Hover Effects */}
        <div className="md:hidden space-y-6">
          {stepIcons.map((step, idx) => {
            const IconComponent = step.icon;
            return (
              <div 
                key={idx}
                className="group relative bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-brand-teal/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex items-start gap-5">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-navy to-brand-teal flex items-center justify-center shadow-lg">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-brand-orange text-white flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-brand-teal group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Feature Strip */}
        <div className="mt-20 bg-white rounded-2xl border border-slate-200 p-8 shadow-lg hover:shadow-xl transition-all">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Everything you need, all in one place
            </h3>
            <p className="text-slate-500">
              Join 1,200+ buildings already using Syndix
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-brand-bg rounded-xl border border-slate-200 hover:border-brand-teal/30 hover:bg-white hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="text-brand-teal group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <span className="text-xs font-medium text-slate-600 group-hover:text-brand-navy">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2 text-xs text-slate-500">
              <span>Setup Progress</span>
              <span className="font-semibold text-brand-navy">3 simple steps</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full w-0 bg-gradient-to-r from-brand-navy via-brand-teal to-brand-orange rounded-full animate-[progress_2s_ease-out_forwards]"></div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-12">
          <button className="group inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-brand-navy to-brand-teal text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200">
            Get Started Now
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-xs text-slate-400 mt-3">No credit card required • 14-day free trial</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}