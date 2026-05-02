"use client";

import { useLang } from "@/context/LangContext";
import { useState, useEffect } from "react";

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

const promoSlides = [
  {
    photo: "https://images.unsplash.com/photo-1538105891735-5ec7eadd8aa7?w=1920&q=85",
    en: {
      label: "PARTS & ACCESSORIES",
      heading: "Genuine Parts,\nFair Prices.",
      sub: "OEM & aftermarket parts for domestic, Asian and European vehicles. Same-day availability.",
      btn: "Shop Parts",
      href: "/parts",
      tags: ["Domestic", "Asian", "European"],
    },
    es: {
      label: "REPUESTOS Y ACCESORIOS",
      heading: "Repuestos Originales,\nPrecios Justos.",
      sub: "Repuestos OEM y alternativos para todo tipo de vehículo. Disponibilidad inmediata.",
      btn: "Ver Repuestos",
      href: "/parts",
      tags: ["Domésticos", "Asiáticos", "Europeos"],
    },
  },
  {
    photo: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1920&q=85",
    en: {
      label: "ELECTRICAL · OBD-II",
      heading: "Advanced\nDiagnostics.",
      sub: "Check engine light? We scan, identify and fix the root cause — not just clear the code.",
      btn: "Book Diagnostic",
      href: "/contact",
      tags: ["Engine Scan", "Electrical", "ABS / Airbag"],
    },
    es: {
      label: "ELÉCTRICO · OBD-II",
      heading: "Diagnóstico\nAvanzado.",
      sub: "Luz de motor encendida? Escaneamos, identificamos y reparamos la causa raíz.",
      btn: "Agendar Diagnóstico",
      href: "/contact",
      tags: ["Escaneo Motor", "Eléctrico", "ABS / Airbag"],
    },
  },
  {
    photo: "https://images.unsplash.com/photo-1727893380169-4dda123e19f7?w=1920&q=85",
    en: {
      label: "SAFECAR ACADEMY",
      heading: "Get Certified.\nLevel Up.",
      sub: "Hands-on automotive training taught by working professionals. In-person and online.",
      btn: "View Courses",
      href: "/training",
      tags: ["Engine Systems", "Diagnostics", "Electrical"],
    },
    es: {
      label: "ACADEMIA SAFECAR",
      heading: "Certifícate.\nSube de Nivel.",
      sub: "Formación automotriz práctica impartida por profesionales activos. Presencial y online.",
      btn: "Ver Cursos",
      href: "/training",
      tags: ["Sistemas Motor", "Diagnóstico", "Eléctrico"],
    },
  },
];

export default function Hero() {
  const { lang } = useLang();
  const t = heroText[lang];
  const [current, setCurrent] = useState(0);
  const total = promoSlides.length + 1;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % (promoSlides.length + 1));
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const isMain = current === 0;
  const promo = isMain ? null : promoSlides[current - 1];
  const promoT = promo ? promo[lang] : null;

  return (
    <section className="hero">

      {/* Foto principal — slide 0 */}
      <img
        src="https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=1920&q=85"
        alt="Auto repair workshop"
        className="heroImage"
        style={{ opacity: isMain ? 1 : 0, transition: "opacity 1s ease-in-out" }}
      />

      {/* Fotos temáticas — slides 1-3 */}
      {promoSlides.map((slide, i) => (
        <img
          key={slide.photo}
          src={slide.photo}
          alt={slide[lang].label}
          className="heroImage"
          style={{
            opacity: current === i + 1 ? 1 : 0,
            transition: "opacity 1s ease-in-out",
          }}
        />
      ))}

      <div className="heroOverlay" />

      {/* Contenido */}
      <div className="container heroContent">
        <div className="heroCopy">

          {isMain ? (
            <>
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
            </>
          ) : promoT ? (
            <div key={current} style={{ animation: "heroPromoIn 0.55s ease forwards" }}>
              <p className="eyebrow" style={{ color: "#d91f26" }}>{promoT.label}</p>
              <h2 style={{
                margin: "0 0 20px",
                fontSize: "clamp(2.8rem, 6vw, 5.5rem)",
                lineHeight: 0.95,
                letterSpacing: "-0.04em",
                fontWeight: 900,
                color: "#ffffff",
                whiteSpace: "pre-line",
              }}>
                {promoT.heading}
              </h2>
              <p style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "1.1rem",
                lineHeight: 1.65,
                maxWidth: "520px",
                margin: "0 0 24px",
              }}>
                {promoT.sub}
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "32px" }}>
                {promoT.tags.map((tag) => (
                  <span key={tag} style={{
                    padding: "5px 14px",
                    borderRadius: "999px",
                    border: "1px solid rgba(217,31,38,0.4)",
                    background: "rgba(217,31,38,0.1)",
                    color: "#d91f26",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                <a href={promoT.href} className="heroPrimary">{promoT.btn}</a>
                <a href="tel:+13128509417" className="heroSecondary">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 1.5h3l1.5 3.5-1.75 1.25S6.9 8.9 9.75 11.25L11 9.5l3.5 1.5v3C14.5 14 12 15.5 8 11.5 4 7.5 2 5 1.5 3L3 1.5z"
                      stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                  </svg>
                  {t.ctaCall}
                </a>
              </div>
            </div>
          ) : null}

        </div>
      </div>

      {/* Dots */}
      <div style={{
        position: "absolute",
        bottom: "1.75rem",
        right: "2rem",
        display: "flex",
        gap: "8px",
        zIndex: 10,
      }}>
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            style={{
              width: i === current ? "28px" : "8px",
              height: "8px",
              borderRadius: "4px",
              background: i === current ? "#d91f26" : "rgba(255,255,255,0.3)",
              border: "none",
              padding: 0,
              cursor: "pointer",
              transition: "all 0.4s ease",
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes heroPromoIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </section>
  );
}