"use client";

import { useState, useRef, useEffect } from "react";

type NavbarProps = {
  lang: "en" | "es";
  setLang: (l: "en" | "es") => void;
  scrolled: boolean;
};

const content = {
  en: { services:"Services", parts:"Parts", training:"Training", contact:"Contact", directions:"Get Directions", cta:"BOOK SERVICE", visitUs:"Visit Us" },
  es: { services:"Servicios", parts:"Repuestos", training:"Formación", contact:"Contacto", directions:"Cómo llegar", cta:"RESERVAR CITA", visitUs:"Visítanos" },
};

export default function Navbar({ lang, setLang, scrolled }: NavbarProps) {
  const t = content[lang];
  const [dropOpen, setDropOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

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
          <a href="/services" className="navLink">{t.services}</a>
          <a href="/parts"    className="navLink">{t.parts}</a>
          <a href="/training" className="navLink">{t.training}</a>
          <div className="navDropWrap" ref={dropRef}>
            <button className={`navLink navDropTrigger ${dropOpen ? "open" : ""}`}
              onClick={() => setDropOpen(v => !v)} aria-expanded={dropOpen}>
              {t.visitUs}
              <svg className="dropChevron" width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
              </svg>
            </button>
            {dropOpen && (
              <div className="navDropMenu" role="menu">
                <a href="/contact"    className="navDropItem" onClick={() => setDropOpen(false)}>{t.contact}</a>
                <a href="#directions" className="navDropItem" onClick={() => setDropOpen(false)}>{t.directions}</a>
              </div>
            )}
          </div>
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

      {/* MOBILE OVERLAY + DRAWER */}
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
          <a href="/services"   className="mobileNavLink" onClick={close}>{t.services}</a>
          <a href="/parts"      className="mobileNavLink" onClick={close}>{t.parts}</a>
          <a href="/training"   className="mobileNavLink" onClick={close}>{t.training}</a>
          <a href="/contact"    className="mobileNavLink" onClick={close}>{t.contact}</a>
          <a href="#directions" className="mobileNavLink" onClick={close}>{t.directions}</a>
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