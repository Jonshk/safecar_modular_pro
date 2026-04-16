"use client";

import { useLang } from "@/context/LangContext";
import { hero } from "@/lib/content";

const heroText = {
  en: {
    eyebrow: "CHICAGO AUTO REPAIR SHOP",
    title: "Auto Repair & Diagnostics in Chicago",
    description: "Trusted automotive repair, electrical diagnostics, maintenance and quality parts for domestic, Asian and European vehicles.",
    rating: "4.9 · 500+ happy customers",
    cta: "BOOK SERVICE",
    ctaCall: "Call Now",
    ctaServices: "View Services",
  },
  es: {
    eyebrow: "TALLER MECÁNICO EN CHICAGO",
    title: "Reparación y Diagnóstico en Chicago",
    description: "Reparación automotriz, diagnóstico eléctrico, mantenimiento y repuestos de calidad para vehículos domésticos, asiáticos y europeos.",
    rating: "4.9 · +500 clientes satisfechos",
    cta: "RESERVAR CITA",
    ctaCall: "Llamar",
    ctaServices: "Ver Servicios",
  },
};

export default function Hero() {
  const { lang } = useLang();
  const t = heroText[lang];

  return (
    <section className="hero">
      <img src={hero.image} alt="Auto repair workshop" className="heroImage" />
      <div className="heroOverlay" />

      <div className="container heroContent">
        <div className="heroCopy">

          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p className="heroSub">{t.description}</p>

          <div className="heroRating">
            <span className="heroStars" aria-hidden="true">★★★★★</span>
            <span>{t.rating}</span>
          </div>

          <div className="heroActions">
            <a href="/contact" className="heroPrimary">{t.cta}</a>
            <a href="tel:+13128509417" className="heroSecondary">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 1.5h3l1.5 3.5-1.75 1.25S6.9 8.9 9.75 11.25L11 9.5l3.5 1.5v3C14.5 14 12 15.5 8 11.5 4 7.5 2 5 1.5 3L3 1.5z"
                  stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              </svg>
              {t.ctaCall}
            </a>
            <a href="/services" className="heroSecondary">{t.ctaServices}</a>
          </div>

        </div>
      </div>
    </section>
  );
}