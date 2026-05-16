"use client";

import { useState, useEffect } from "react";

type NavbarProps = {
  lang: "en" | "es";
  setLang: (l: "en" | "es") => void;
  scrolled: boolean;
};

const content = {
  en: { services:"Services", parts:"Parts", training:"Training", contact:"Contact", reviews:"Reviews", cta:"BOOK SERVICE" },
  es: { services:"Servicios", parts:"Repuestos", training:"Formación", contact:"Contacto", reviews:"Reseñas", cta:"RESERVAR CITA" },
};

export default function Navbar({ lang, setLang, scrolled }: NavbarProps) {
  const t = content[lang];
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <div className={`navBar ${scrolled ? "navScrolled" : ""}`}>
      <div className="container navInner">

        {/* BRAND */}
        <a href="/" className="brand" aria-label="Safe Car home">
          <img src="/logo-safecar.png" alt="Safe Car"
            className={`brandLogo ${scrolled ? "brandScrolled" : ""}`} />
        </a>

        {/* DESKTOP MENU */}
        <nav className="navMenu" aria-label="Main navigation">
          <a href="/services"  className="navLink">{t.services}</a>
          <a href="/parts"     className="navLink">{t.parts}</a>
          <a href="/training"  className="navLink">{t.training}</a>
          <a href="/reviews"   className="navLink">{t.reviews}</a>
          <a href="/contact"   className="navLink">{t.contact}</a>
        </nav>

        {/* DESKTOP ACTIONS */}
        <div className="navActions">
          <a href="/contact" className="navBookBtn">{t.cta}</a>
          <div className="langSwitch" role="group">
            <span className="langIcon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" opacity=".7"/>
                <ellipse cx="7" cy="7" rx="2.6" ry="6" stroke="currentColor" strokeWidth="1.3" opacity=".7"/>
                <path d="M1.5 5h11M1.5 9h11" stroke="currentColor" strokeWidth="1.3" opacity=".7"/>
              </svg>
            </span>
            <button className={`langOption ${lang==="en"?"active":""}`} onClick={() => setLang("en")}>EN</button>
            <span className="langDivider">/</span>
            <button className={`langOption ${lang==="es"?"active":""}`} onClick={() => setLang("es")}>ES</button>
          </div>
        </div>

        {/* HAMBURGER */}
        <button className={`navHamburger ${menuOpen ? "navHamOpen" : ""}`}
          onClick={() => setMenuOpen(v => !v)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>
      </div>

      {/* MOBILE */}
      {menuOpen && <div className="mobileOverlay" onClick={close} />}
      <div className={`mobileMenu ${menuOpen ? "mobileMenuOpen" : ""}`}>
        <div className="mobileMenuHead">
          <img src="/logo-safecar.png" alt="Safe Car" style={{width:130,display:"block"}} />
          <button className="mobileMenuClose" onClick={close} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <nav className="mobileNav">
          <a href="/services"  className="mobileNavLink" onClick={close}>{t.services}</a>
          <a href="/parts"     className="mobileNavLink" onClick={close}>{t.parts}</a>
          <a href="/training"  className="mobileNavLink" onClick={close}>{t.training}</a>
          <a href="/reviews"   className="mobileNavLink" onClick={close}>{t.reviews}</a>
          <a href="/contact"   className="mobileNavLink" onClick={close}>{t.contact}</a>
        </nav>
        <div className="mobileMenuFooter">
          <a href="/contact" className="navBookBtn mobileBookBtn" onClick={close}>{t.cta}</a>
          <div className="mobileLang">
            <button className={`langOption ${lang==="en"?"active":""}`} onClick={() => { setLang("en"); close(); }}>EN</button>
            <span className="langDivider">/</span>
            <button className={`langOption ${lang==="es"?"active":""}`} onClick={() => { setLang("es"); close(); }}>ES</button>
          </div>
        </div>
      </div>
    </div>
  );
}