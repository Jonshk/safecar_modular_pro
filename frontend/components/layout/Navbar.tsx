"use client";

import { useState, useRef, useEffect } from "react";
import { useLang } from "@/context/LangContext";

const navContent = {
  en: { services: "Services", parts: "Parts", training: "Training", visitUs: "Visit Us", contact: "Contact", directions: "Get Directions", cta: "BOOK SERVICE" },
  es: { services: "Servicios", parts: "Repuestos", training: "Formación", visitUs: "Visítanos", contact: "Contacto", directions: "Cómo llegar", cta: "RESERVAR CITA" },
};

export default function Navbar() {
  const { lang } = useLang();
  const t = navContent[lang];
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="navBar">
      <div className="container navInner">

        {/* BRAND — columna izquierda, alineado bajo el teléfono */}
        <a href="/" className="brand" aria-label="Safe Car home">
          <img src="/logo-safecar.png" alt="Safe Car" className="brandLogo" />
        </a>

        {/* MENU — columna central */}
        <nav className="navMenu" aria-label="Main navigation">
          <a href="/services" className="navLink">{t.services}</a>
          <a href="/parts"    className="navLink">{t.parts}</a>
          <a href="/training" className="navLink">{t.training}</a>

          <div className="navDropWrap" ref={dropRef}>
            <button
              type="button"
              className={`navLink navDropTrigger ${dropOpen ? "open" : ""}`}
              onClick={() => setDropOpen((v) => !v)}
              aria-expanded={dropOpen}
              aria-haspopup="true"
            >
              {t.visitUs}
              <svg className="dropChevron" width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {dropOpen && (
              <div className="navDropMenu" role="menu">
                <a href="/contact" className="navDropItem" role="menuitem" onClick={() => setDropOpen(false)}>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M2 4a1 1 0 011-1h10a1 1 0 011 1v7a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M2 4l6 5 6-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  {t.contact}
                </a>
                <a href="#directions" className="navDropItem" role="menuitem" onClick={() => setDropOpen(false)}>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.5 4.5 9 4.5 9s4.5-5.5 4.5-9c0-2.485-2.015-4.5-4.5-4.5z" stroke="currentColor" strokeWidth="1.4" />
                    <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                  {t.directions}
                </a>
              </div>
            )}
          </div>
        </nav>

        {/* BOOK SERVICE — columna derecha, alineado bajo el horario */}
        <div className="navActions">
          <a href="/contact" className="navBookBtn">{t.cta}</a>
        </div>

      </div>
    </div>
  );
}