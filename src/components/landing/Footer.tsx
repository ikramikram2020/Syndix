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
      links: [
        { label: t.footer.links.features, href: "#features" },
        { label: t.footer.links.pricing, href: "#pricing" },
        { label: t.footer.links.demo, href: "#dashboard" },
        { label: t.footer.links.changelog, href: "#" },
      ],
    },
    {
      title: t.footer.company,
      links: [
        { label: t.footer.links.about, href: "#" },
        { label: t.footer.links.blog, href: "#" },
        { label: t.footer.links.careers, href: "#" },
        { label: t.footer.links.press, href: "#" },
      ],
    },
    {
      title: t.footer.support,
      links: [
        { label: t.footer.links.helpCenter, href: "#" },
        { label: t.footer.links.contact, href: "#contact" },
        { label: t.footer.links.privacy, href: "#" },
        { label: t.footer.links.terms, href: "#" },
      ],
    },
  ];

  const socialLinks = [
    { name: "Twitter", icon: "🐦", href: "#" },
    { name: "LinkedIn", icon: "🔗", href: "#" },
    { name: "Facebook", icon: "📘", href: "#" },
    { name: "Instagram", icon: "📷", href: "#" },
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
    <footer className="relative" style={{ backgroundColor: T.surface, borderTop: `1px solid ${T.border}` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <img
                src="logo2png"
                alt="Syndix Logo"
                className="h-auto w-32 object-contain"
              />
            </Link>
            <p className="text-sm" style={{ color: T.textMd, lineHeight: "1.625", maxWidth: "16rem" }}>
              {t.footer.tagline}
            </p>
            <div className="flex gap-2.5 mt-5">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                  style={{ 
                    backgroundColor: T.white, 
                    border: `1px solid ${T.border}`,
                    color: T.textMd
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = T.tealLight;
                    e.currentTarget.style.borderColor = T.teal;
                    e.currentTarget.style.color = T.navy;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = T.white;
                    e.currentTarget.style.borderColor = T.border;
                    e.currentTarget.style.color = T.textMd;
                  }}
                >
                  <span className="text-base">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {columns.map((col, i) => (
            <div key={i}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: T.textSm }}>
                {col.title}
              </p>
              <ul className="space-y-3">
                {col.links.map((link, li) => (
                  <li key={li}>
                    <a
                      href={link.href}
                      onClick={(e) => handleHashClick(e, link.href)}
                      className="text-sm transition-colors cursor-pointer"
                      style={{ color: T.textMd }}
                      onMouseEnter={(e) => e.currentTarget.style.color = T.navy}
                      onMouseLeave={(e) => e.currentTarget.style.color = T.textMd}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="border-t pt-8 mb-8" style={{ borderColor: T.border }}>
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl font-bold mb-3" style={{ color: T.text }}>
              Subscribe to our newsletter
            </h3>
            <p className="text-sm mb-6" style={{ color: T.textMd }}>
              Get the latest updates and insights delivered straight to your inbox
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg transition-all focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: T.white, 
                  border: `1px solid ${T.border}`,
                  color: T.text,
                  borderRadius: "0.5rem"
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = T.teal}
                onBlur={(e) => e.currentTarget.style.borderColor = T.border}
                required
              />
              <button
                type="submit"
                className="px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105"
                style={{ 
                  backgroundColor: T.navy, 
                  color: T.white,
                  borderRadius: "0.5rem"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = T.navyDeep}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = T.navy}
              >
                {isSubscribed ? "✓ Subscribed!" : "Subscribe"}
              </button>
            </form>
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderColor: T.border }}>
          <p className="text-sm" style={{ color: T.textSm }}>
            © {year} Syndix. {t.footer.rights}
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: T.green }} />
            <span className="text-xs" style={{ color: T.textSm }}>
              All systems operational
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </footer>
  );
}

// Your Theme tokens
const T = {
  sidebarBg: '#FFFFFF',
  sidebarBorder: '#E8EDF5',
  canvasBg: '#F0F4FB',
  navy: '#1C2B6B',
  navyDeep: '#111D4A',
  teal: '#2BBCD4',
  tealLight: '#E0F7FB',
  orange: '#F5A623',
  orangeDeep: '#E8891A',
  orangeLight: '#FFF4E0',
  amber: '#F07C29',
  white: '#FFFFFF',
  text: '#0F1A3E',
  textMd: '#4A5578',
  textSm: '#8892AA',
  border: '#E4E9F2',
  surface: '#F7F9FD',
  green: '#00C48C',
  greenLight: '#E6FBF5',
  red: '#FF5A5A',
  redLight: '#FFF0F0',
  gold: '#F5A623',
};