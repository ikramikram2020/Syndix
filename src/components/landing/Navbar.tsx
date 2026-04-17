import { useState, useEffect } from "react";
import { Menu, X, Globe, LogIn } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { Language } from "../../translations";
import Link from 'next/link';
import { useRouter } from 'next/router';

const LANGS: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "ar", label: "AR" },
  { code: "fr", label: "FR" },
];

export default function Navbar() {
  const { t, language, setLanguage } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "#features", label: t.nav.features },
    { href: "#how-it-works", label: t.nav.howItWorks },
    { href: "#pricing", label: t.nav.pricing },
    { href: "#contact", label: t.nav.contact },
  ];

  const handleHashClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/60"
          : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo - Changed to href= */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="Syndix Logo"
              className="h-9 w-9 rounded-xl object-contain bg-white border border-slate-100 shadow-sm"
            />
            <div className="flex flex-col leading-none">
              <span className="text-lg font-black text-brand-navy tracking-tight">
                SYNDIX
              </span>
              <span className="text-[9px] font-semibold text-brand-teal tracking-widest uppercase">
                Digital Property Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleHashClick(e, link.href)}
                className="text-sm font-medium text-slate-600 hover:text-brand-navy transition-colors cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Right Section */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Globe size={15} className="text-brand-teal" />
                <span>{LANGS.find((l) => l.code === language)?.label}</span>
              </button>
              {langOpen && (
                <div className="absolute top-full mt-1 end-0 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden min-w-[80px]">
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-sm font-medium text-start transition-colors ${
                        language === l.code
                          ? "bg-brand-navy/5 text-brand-navy"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Login Button - Changed to href= */}
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-brand-navy px-4 py-2 transition-colors"
            >
              <LogIn size={15} />
              {t.nav.login}
            </Link>

            {/* Register Button - Changed to href= */}
            <Link
              href="/register"
              className="text-sm font-bold text-white bg-brand-navy hover:bg-[#16205e] px-5 py-2.5 rounded-xl shadow-md shadow-brand-navy/20 transition-all hover:shadow-brand-navy/30 hover:-translate-y-0.5"
            >
              {t.nav.startTrial}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-1 shadow-lg">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleHashClick(e, link.href)}
              className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              {link.label}
            </a>
          ))}
          
          {/* Mobile Language Selector */}
          <div className="flex gap-2 pt-2 pb-1">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLanguage(l.code);
                  setMobileOpen(false);
                }}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  language === l.code
                    ? "bg-brand-navy text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          
          {/* Mobile Auth Buttons - Changed to href= */}
          <div className="flex gap-2 pt-1">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex-1 text-center text-sm font-semibold text-brand-navy border border-brand-navy/20 hover:bg-brand-navy/5 px-4 py-2.5 rounded-xl transition-colors"
            >
              {t.nav.login}
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="flex-1 text-center text-sm font-bold text-white bg-brand-navy hover:bg-[#16205e] px-4 py-2.5 rounded-xl transition-colors"
            >
              {t.nav.startTrial}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}