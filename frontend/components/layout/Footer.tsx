"use client";

import { useLang } from "@/context/LangContext";

const footerText = {
  en: {
    tagline: "Professional auto repair, diagnostics and training you can trust.",
    quickLinks: "Quick Links",
    links: [
      { label: "Services",       href: "/services" },
      { label: "Parts",          href: "/parts" },
      { label: "Training",       href: "/training" },
      { label: "Contact",        href: "/contact" },
    ],
    followUs: "Follow Us",
    rights: "All Rights Reserved.",
    privacy: "Privacy Policy",
    credits: "Image Credits",
  },
  es: {
    tagline: "Reparación automotriz, diagnóstico y formación de confianza.",
    quickLinks: "Enlaces rápidos",
    links: [
      { label: "Servicios",   href: "/services" },
      { label: "Repuestos",   href: "/parts" },
      { label: "Formación",   href: "/training" },
      { label: "Contacto",    href: "/contact" },
    ],
    followUs: "Síguenos",
    rights: "Todos los derechos reservados.",
    privacy: "Política de Privacidad",
    credits: "Créditos de Imágenes",
  },
};

const socials = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/safecartallerautomotriz",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="2" width="20" height="20" rx="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@safeeducations",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
      </svg>
    ),
  },
  {
    label: "Google",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
  },
];

export default function Footer() {
  const { lang } = useLang();
  const t = footerText[lang];

  return (
    <footer className="footer">

      {/* Red halo — like brake lights */}
      <div className="footerHalo" aria-hidden="true" />

      <div className="footerAccent" />

      <div className="container footerMain">

        {/* BRAND col — big logo, no heading */}
        <div className="footerBrand">
          <img src="/logo-safecar.png" alt="Safe Car" className="footerLogo" />
          <p className="footerBrandText">{t.tagline}</p>
          <div className="footerCards">
            <img src="/icons/visa.webp"       alt="Visa"             className="footerCardIcon" />
            <img src="/icons/mastercard.webp" alt="Mastercard"       className="footerCardIcon" />
            <img src="/icons/amex.webp"       alt="American Express" className="footerCardIcon" />
            <img src="/icons/discover.webp"   alt="Discover"         className="footerCardIcon" />
          </div>
        </div>

        {/* LINKS col */}
        <div>
          <h3 className="footerHeading">{t.quickLinks}</h3>
          <nav className="footerLinks">
            {t.links.map((l) => (
              <a key={l.href} href={l.href}>{l.label}</a>
            ))}
          </nav>
        </div>

        {/* CONTACT col */}
        <div className="footerContact">
          <h3 className="footerHeading">{t.followUs}</h3>
          <div className="footerSocials">
            {socials.map((s) => (
              <a key={s.label} href={s.href} aria-label={s.label} className="footerSocialBtn" target="_blank" rel="noopener noreferrer">
                {s.icon}
              </a>
            ))}
          </div>
          <div className="footerContactInfo">
            <p className="footerBusiness">Safe Car</p>
            <p><a href="tel:+18723611607" style={{ color: "inherit" }}>+1 (872) 361-1607</a></p>
            <a
              href="https://wa.me/18723545706"
              target="_blank"
              rel="noopener noreferrer"
              className="footerWhatsApp"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              +1 (872) 354-5706 · WhatsApp
            </a>
            <p>1052 W 51st St, Chicago, IL 60609</p>
            <p>Mon - Fri: 7:30 AM - 5:30 PM</p>
          </div>
        </div>

      </div>

      {/* Bottom bar — copyright centered, links right */}
      <div className="footerBottom">
        <div className="container footerBottomInner">
          <div className="footerBottomLinks">
            <a href="#">{t.privacy}</a>
            <a href="#">{t.credits}</a>
          </div>
          <p className="footerBottomCopy">© 2026 Safe Car. {t.rights}</p>
          <div style={{ width: "200px" }} />
        </div>
      </div>

    </footer>
  );
}