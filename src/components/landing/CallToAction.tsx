// C:\Users\kawth\Desktop\syndix\src\components\landing\CallToAction.tsx
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { T } from '../../styles/theme';

export default function CallToAction() {
  return (
    <section 
      className="relative overflow-hidden py-20"
      style={{ 
        background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyDeep} 50%, ${T.teal} 100%)`
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full blur-3xl"></div>
        <div 
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl"
          style={{ backgroundColor: T.teal }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: T.orange }}
        ></div>
      </div>

      {/* Decorative Dots Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full"></div>
        <div className="absolute top-20 right-20 w-2 h-2 bg-white rounded-full"></div>
        <div className="absolute bottom-10 left-1/2 w-2 h-2 bg-white rounded-full"></div>
        <div className="absolute top-1/2 right-10 w-2 h-2 bg-white rounded-full"></div>
      </div>

      <div className="relative max-w-[900px] mx-auto px-6 lg:px-12 text-center z-10">
        {/* Small Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6">
          <span 
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: T.teal }}
          ></span>
          <span className="text-xs font-medium text-white/90">Limited Time Offer</span>
        </div>

        {/* Main Heading */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
          Ready to digitize your building?
        </h2>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          Join 1,200+ buildings collecting fees faster and easier
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 px-8 py-3.5 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-2xl shadow-lg"
            style={{ backgroundColor: T.orange }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = T.orangeDeep;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = T.orange;
            }}
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link
            href="#contact"
            className="group inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105"
          >
            <Calendar className="w-4 h-4" />
            Schedule Demo
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap gap-4 justify-center text-sm text-white/60">
          <span className="flex items-center gap-1.5">
            <span 
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: T.teal }}
            ></span>
            No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <span 
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: T.teal }}
            ></span>
            14-day free trial
          </span>
          <span className="flex items-center gap-1.5">
            <span 
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: T.teal }}
            ></span>
            Cancel anytime
          </span>
        </div>

        {/* Floating Elements Animation */}
        <div className="absolute -top-10 -left-10 w-20 h-20 bg-white/5 rounded-full blur-xl animate-pulse"></div>
        <div 
          className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-2xl animate-pulse"
          style={{ backgroundColor: `${T.orange}20`, animationDelay: '1s' }}
        ></div>
      </div>
    </section>
  );
}