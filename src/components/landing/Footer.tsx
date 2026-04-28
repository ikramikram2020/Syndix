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
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Column 1 - Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <div className="relative w-48 h-auto">
                <Image
                  src="/logo2.png"
                  alt="SYNDIX Logo"
                  width={192}
                  height={60}
                  className="object-contain w-full h-auto"
                  priority
                />
              </div>
            </Link>
            <p className="text-sm text-[var(--syndix-medium)] leading-relaxed max-w-xs mt-4">
              {t.footer.tagline}
            </p>
            <div className="flex gap-2.5 mt-5">
              <a
                href="#"
                className="w-9 h-9 rounded-xl bg-white hover:bg-gray-100 border border-[var(--syndix-border)] flex items-center justify-center transition-all group"
              >
                <FaFacebook className="w-4 h-4 text-[var(--syndix-medium)] group-hover:text-[var(--syndix-navy)] transition-colors" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-xl bg-white hover:bg-gray-100 border border-[var(--syndix-border)] flex items-center justify-center transition-all group"
              >
                <FaTwitter className="w-4 h-4 text-[var(--syndix-medium)] group-hover:text-[var(--syndix-navy)] transition-colors" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-xl bg-white hover:bg-gray-100 border border-[var(--syndix-border)] flex items-center justify-center transition-all group"
              >
                <FaLinkedin className="w-4 h-4 text-[var(--syndix-medium)] group-hover:text-[var(--syndix-navy)] transition-colors" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-xl bg-white hover:bg-gray-100 border border-[var(--syndix-border)] flex items-center justify-center transition-all group"
              >
                <FaInstagram className="w-4 h-4 text-[var(--syndix-medium)] group-hover:text-[var(--syndix-navy)] transition-colors" />
              </a>
            </div>
          </div>

          {columns.map((col, i) => (
            <div key={i}>
              <p className="text-xs font-bold text-[var(--syndix-light)] uppercase tracking-widest mb-4">
                {col.title}
              </p>
              <ul className="space-y-3">
                {col.links.map((link, li) => (
                  <li key={li}>
                    <a
                      href={link.href}
                      onClick={(e) => handleHashClick(e, link.href)}
                      className="text-sm text-[var(--syndix-medium)] hover:text-[var(--syndix-navy)] transition-colors cursor-pointer"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--syndix-border)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-[var(--syndix-light)]">
            © {year} Syndix. {t.footer.rights}
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-[var(--syndix-light)]">
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}