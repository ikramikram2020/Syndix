// C:\Users\kawth\Desktop\syndix\src\components\landing\Footer.tsx
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "../../contexts/LanguageContext";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

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
    <footer className="bg-[var(--syndix-surface)] border-t border-[var(--syndix-border)]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1 - Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-3">
              <div className="relative w-36 h-auto">
                <Image
                  src="/logo2.png"
                  alt="SYNDIX Logo"
                  width={144}
                  height={45}
                  className="object-contain w-full h-auto"
                  priority
                />
              </div>
            </Link>
            <p className="text-xs text-[var(--syndix-medium)] leading-relaxed max-w-xs mt-3">
              {t.footer.tagline}
            </p>
            <div className="flex gap-2 mt-4">
              <a
                href="#"
                className="w-7 h-7 rounded-lg bg-white hover:bg-gray-100 border border-[var(--syndix-border)] flex items-center justify-center transition-all group"
              >
                <FaFacebook className="w-3.5 h-3.5 text-[var(--syndix-medium)] group-hover:text-[var(--syndix-navy)] transition-colors" />
              </a>
              <a
                href="#"
                className="w-7 h-7 rounded-lg bg-white hover:bg-gray-100 border border-[var(--syndix-border)] flex items-center justify-center transition-all group"
              >
                <FaTwitter className="w-3.5 h-3.5 text-[var(--syndix-medium)] group-hover:text-[var(--syndix-navy)] transition-colors" />
              </a>
              <a
                href="#"
                className="w-7 h-7 rounded-lg bg-white hover:bg-gray-100 border border-[var(--syndix-border)] flex items-center justify-center transition-all group"
              >
                <FaLinkedin className="w-3.5 h-3.5 text-[var(--syndix-medium)] group-hover:text-[var(--syndix-navy)] transition-colors" />
              </a>
              <a
                href="#"
                className="w-7 h-7 rounded-lg bg-white hover:bg-gray-100 border border-[var(--syndix-border)] flex items-center justify-center transition-all group"
              >
                <FaInstagram className="w-3.5 h-3.5 text-[var(--syndix-medium)] group-hover:text-[var(--syndix-navy)] transition-colors" />
              </a>
            </div>
          </div>

          {columns.map((col, i) => (
            <div key={i}>
              <p className="text-[10px] font-bold text-[var(--syndix-light)] uppercase tracking-widest mb-3">
                {col.title}
              </p>
              <ul className="space-y-2">
                {col.links.map((link, li) => (
                  <li key={li}>
                    <a
                      href={link.href}
                      onClick={(e) => handleHashClick(e, link.href)}
                      className="text-xs text-[var(--syndix-medium)] hover:text-[var(--syndix-navy)] transition-colors cursor-pointer"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--syndix-border)] pt-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[var(--syndix-light)]">
            © {year} Syndix. {t.footer.rights}
          </p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-[var(--syndix-light)]">
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}