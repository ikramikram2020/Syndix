import { useLanguage } from "../../contexts/LanguageContext";
import { useState } from "react";

// Define the type for step icons
type StepIcons = {
  [key: number]: JSX.Element;
};

export default function HowItWorks() {
  const { t } = useLanguage();
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  // Icon mapping for each step
  const stepIcons: StepIcons = {
    1: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 2v4h4" />
      </svg>
    ),
    2: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    3: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 12l-2 1m0 0l-2-1m2 1v2.5M4 12l2 1m0 0l2-1M6 13v2.5" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    4: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  // Helper function to safely get icon
  const getStepIcon = (stepNumber: string | number): JSX.Element => {
    const num = typeof stepNumber === 'string' ? parseInt(stepNumber, 10) : stepNumber;
    return stepIcons[num] || stepIcons[1];
  };

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-br from-white via-gray-50 to-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-teal/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-navy/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-brand-amber bg-brand-amber/10 border border-brand-amber/20 rounded-full mb-4 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
            <span className="w-1.5 h-1.5 bg-brand-amber rounded-full animate-ping" />
            {t.howItWorks.badge}
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            {t.howItWorks.headline}
          </h2>
          <p className="text-slate-500 mt-4 max-w-2xl mx-auto">
            Simple steps to get started with your investment journey
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Animated connector lines */}
          <div className="hidden md:block absolute top-24 left-[16%] right-[16%] h-0.5">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/20 via-brand-teal/30 to-brand-navy/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-teal to-transparent animate-pulse" style={{ width: '30%', left: '35%' }} />
          </div>

          {t.howItWorks.steps.map((step: any, i: number) => (
            <div
              key={i}
              className="relative text-center group animate-fade-in-up"
              style={{ animationDelay: `${i * 150}ms` }}
              onMouseEnter={() => setHoveredStep(i)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              {/* Step number circle with icon */}
              <div className="relative inline-flex items-center justify-center w-24 h-24 mb-7">
                {/* Pulsing background */}
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-brand-navy to-brand-teal opacity-10 transition-all duration-500 ${
                  hoveredStep === i ? 'scale-150 opacity-20' : 'scale-125'
                }`} />
                
                {/* Rotating ring */}
                <div className={`absolute inset-0 rounded-full border-2 border-dashed border-brand-teal/30 transition-all duration-500 ${
                  hoveredStep === i ? 'rotate-180 scale-110' : ''
                }`} />
                
                {/* Main circle */}
                <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br from-brand-navy to-brand-teal flex items-center justify-center shadow-xl transition-all duration-500 ${
                  hoveredStep === i 
                    ? 'shadow-2xl shadow-brand-teal/40 scale-110 rotate-6' 
                    : 'shadow-lg shadow-brand-navy/25'
                }`}>
                  <div className={`text-white transition-all duration-500 ${
                    hoveredStep === i ? 'scale-110 rotate-12' : ''
                  }`}>
                    {getStepIcon(step.step)}
                  </div>
                </div>

                {/* Step number badge */}
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-brand-amber text-white text-sm font-black flex items-center justify-center shadow-lg animate-bounce-in">
                  {step.step}
                </div>
              </div>

              {/* Card */}
              <div className={`relative bg-white backdrop-blur-sm rounded-2xl p-6 transition-all duration-500 border-2 ${
                hoveredStep === i
                  ? 'border-brand-teal/50 shadow-2xl shadow-brand-teal/20 -translate-y-2'
                  : 'border-slate-100 shadow-lg hover:shadow-xl'
              }`}>
                {/* Shine effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ${
                  hoveredStep === i ? 'translate-x-full' : '-translate-x-full'
                }`} style={{ width: '200%' }} />
                
                {/* Icon in card header */}
                <div className="flex items-center justify-center mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br from-brand-navy/5 to-brand-teal/5 transition-all duration-500 ${
                    hoveredStep === i ? 'scale-110 rotate-3' : ''
                  }`}>
                    <div className="w-12 h-12 text-brand-teal">
                      {getStepIcon(step.step)}
                    </div>
                  </div>
                </div>

                <h3 className={`text-xl font-bold mb-3 transition-all duration-300 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent ${
                  hoveredStep === i ? 'scale-105' : ''
                }`}>
                  {step.title}
                </h3>
                
                <p className="text-slate-500 leading-relaxed">
                  {step.desc}
                </p>

                {/* Decorative dots */}
                <div className="absolute bottom-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {[...Array(3)].map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-1 h-1 rounded-full bg-brand-teal transition-all duration-300 ${
                        hoveredStep === i ? `animate-pulse delay-${idx * 150}` : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Floating particles */}
              {hoveredStep === i && (
                <div className="absolute -z-10 inset-0 pointer-events-none">
                  {[...Array(6)].map((_, idx) => (
                    <div
                      key={idx}
                      className="absolute w-2 h-2 bg-brand-teal/40 rounded-full animate-float"
                      style={{
                        left: `${20 + Math.random() * 60}%`,
                        top: `${10 + Math.random() * 80}%`,
                        animationDelay: `${idx * 200}ms`,
                        animationDuration: '2s'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-16 animate-fade-in-up animation-delay-500">
          <button className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-brand-navy to-brand-teal text-white font-bold rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <span>Get Started Now</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          60% {
            opacity: 1;
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          50% {
            transform: translateY(-20px) scale(1.5);
            opacity: 1;
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }

        .animate-float {
          animation: float 2s ease-in-out infinite;
        }

        .animation-delay-500 {
          animation-delay: 500ms;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </section>
  );
}