import Link from "next/link";
import { useLanguage } from "../../contexts/LanguageContext";
import { useState } from "react";

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const columns = [
    {
      title: t.footer.product,
      icon: "✨",
      links: [
        { label: t.footer.links.features, href: "#features", icon: "🚀" },
        { label: t.footer.links.pricing, href: "#pricing", icon: "💰" },
        { label: t.footer.links.demo, href: "#dashboard", icon: "🎮" },
        { label: t.footer.links.changelog, href: "#", icon: "📝" },
      ],
    },
    {
      title: t.footer.company,
      icon: "🏢",
      links: [
        { label: t.footer.links.about, href: "#", icon: "💡" },
        { label: t.footer.links.blog, href: "#", icon: "✍️" },
        { label: t.footer.links.careers, href: "#", icon: "💼" },
        { label: t.footer.links.press, href: "#", icon: "📰" },
      ],
    },
    {
      title: t.footer.support,
      icon: "🎧",
      links: [
        { label: t.footer.links.helpCenter, href: "#", icon: "❓" },
        { label: t.footer.links.contact, href: "#contact", icon: "📧" },
        { label: t.footer.links.privacy, href: "#", icon: "🔒" },
        { label: t.footer.links.terms, href: "#", icon: "⚖️" },
      ],
    },
  ];

  const socialLinks = [
    { name: "Twitter", icon: "🐦", href: "#", color: "hover:bg-black" },
    { name: "LinkedIn", icon: "🔗", href: "#", color: "hover:bg-blue-600" },
    { name: "Facebook", icon: "📘", href: "#", color: "hover:bg-blue-700" },
    { name: "Instagram", icon: "📷", href: "#", color: "hover:bg-pink-600" },
    { name: "GitHub", icon: "🐙", href: "#", color: "hover:bg-gray-800" },
  ];

  const handleHashClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Pattern Overlay - Fixed version */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat"
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        {/* Newsletter Section */}
        <div className="mb-16 pb-8 border-b border-white/10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm mb-4">
              <span className="text-sm">📧</span>
              <span className="text-xs font-medium">Stay Updated</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Subscribe to our newsletter
            </h3>
            <p className="text-white/60 text-sm mb-6">
              Get the latest updates, features, and insights delivered straight to your inbox
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium transition-all transform hover:scale-105 shadow-lg"
              >
                {isSubscribed ? "✓ Subscribed!" : "Subscribe →"}
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 mb-12">
          {/* Brand Section with Text Logo */}
          <div className="md:col-span-4 lg:col-span-5">
            <Link href="/" className="block mb-4 group">
              <div className="relative">
                <div className="text-left">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                    SYNDIX
                  </h2>
                  <p className="text-xs text-purple-300/70 tracking-wider mt-1 font-mono">
                    DIGITAL PROPERTY PLATFORM
                  </p>
                </div>
                <div className="absolute -inset-2 bg-purple-500 rounded-full filter blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
              </div>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-sm">
              {t.footer.tagline || "Building the future of digital experiences with cutting-edge technology and innovative solutions."}
            </p>
            
            {/* Social Links with Modern Design */}
            <div className="flex gap-2 flex-wrap">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className={`relative group w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all hover:scale-110 ${social.color}`}
                  aria-label={social.name}
                >
                  <span className="text-lg">{social.icon}</span>
                  <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {columns.map((col, i) => (
            <div key={i} className="md:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xl">{col.icon}</span>
                <p className="text-xs font-bold text-white/50 uppercase tracking-wider">
                  {col.title}
                </p>
              </div>
              <ul className="space-y-3">
                {col.links.map((link, li) => (
                  <li key={li}>
                    <a
                      href={link.href}
                      onClick={(e) => handleHashClick(e, link.href)}
                      className="group flex items-center gap-2 text-white/50 hover:text-white transition-all duration-300 text-sm"
                    >
                      <span className="text-base opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 -translate-x-1">
                        {link.icon}
                      </span>
                      <span className="group-hover:translate-x-1 transition-transform inline-block">
                        {link.label}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar with Stats */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <p className="text-sm text-white/40">
              © {year} Syndix. {t.footer.rights || "All rights reserved."}
            </p>
            
            <div className="flex items-center gap-6">
              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs text-white/40">All systems operational</span>
              </div>
              
              {/* Version Badge */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 backdrop-blur-sm">
                <span className="text-xs text-white/40">v</span>
                <span className="text-xs text-white/60 font-mono">4.2.1</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </footer>
  );
}