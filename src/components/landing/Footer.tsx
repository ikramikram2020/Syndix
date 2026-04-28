import Link from "next/link";
import { useLanguage } from "../../contexts/LanguageContext";

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

  // Smooth scroll handler for hash links
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
    <footer id="contact" className="bg-gradient-to-b from-gray-50 to-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <img
                src="logo2.png"
                alt="Syndix Logo"
                className="h-15 w-15 object-contain"
              />
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
              {t.footer.tagline}
            </p>
            <div className="flex gap-2.5 mt-5">
              {["tw", "in", "fb", "ig"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 flex items-center justify-center transition-all"
                >
                  <span className="text-[10px] font-bold uppercase text-gray-600 hover:text-gray-900 transition-colors">
                    {s}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {columns.map((col, i) => (
            <div key={i}>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                {col.title}
              </p>
              <ul className="space-y-3">
                {col.links.map((link, li) => (
                  <li key={li}>
                    <a
                      href={link.href}
                      onClick={(e) => handleHashClick(e, link.href)}
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            © {year} Syndix. {t.footer.rights}
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-gray-500">
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}