"use client";

import { useLang } from "@/context/LangContext";
import { useState, useEffect } from "react";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.safecar.safecar_app&pcampaignid=web_share";
const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(PLAY_STORE_URL)}&color=ffffff&bgcolor=000000&margin=10`;

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
  // Slide QR — último slide
  {
    photo: "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=1920&q=85",
    en: {
      label: "SAFECAR APP",
      heading: "Track your tow.\nRight from your phone.",
      sub: "Request roadside assistance, track your technician in real time, and rate the service — all from our free app.",
      btn: "Download on Google Play",
      href: PLAY_STORE_URL,
      tags: ["Tow Tracking", "Push Notifications", "Free"],
    },
    es: {
      label: "APP SAFECAR",
      heading: "Rastrea tu grúa.\nDesde tu móvil.",
      sub: "Solicita asistencia en carretera, sigue a tu técnico en tiempo real y califica el servicio — todo desde nuestra app gratuita.",
      btn: "Descargar en Google Play",
      href: PLAY_STORE_URL,
      tags: ["Tracking en Vivo", "Notificaciones Push", "Gratis"],
    },
  },
];

// índice del slide del QR (el último)
const QR_SLIDE_INDEX = promoSlides.length; // slide 4 (0=main, 1-3=promo, 4=QR)

export default function Hero() {
  const { lang } = useLang();
  const t = heroText[lang];
  const [current, setCurrent] = useState(0);
  const total = promoSlides.length + 1;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % total);
    }, 6000);
    return () => clearInterval(interval);
  }, [total]);

  const isMain = current === 0;
  const isQR = current === QR_SLIDE_INDEX;
  const promo = (!isMain && !isQR) ? promoSlides[current - 1] : null;
  const qrSlide = isQR ? promoSlides[QR_SLIDE_INDEX - 1] : null;
  const promoT = promo ? promo[lang] : null;
  const qrT = qrSlide ? qrSlide[lang] : null;

  return (
    <section className="hero">

      {/* Foto principal — slide 0 */}
      <img
        src="https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=1920&q=85"
        alt="Auto repair workshop"
        className="heroImage"
        style={{ opacity: isMain || isQR ? 1 : 0, transition: "opacity 1s ease-in-out" }}
      />

      {/* Fotos temáticas — slides 1-3 */}
      {promoSlides.slice(0, 3).map((slide, i) => (
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

          {isMain && (
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
          )}

          {promoT && !isQR && (
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
          )}

          {/* Slide QR */}
          {isQR && qrT && (
            <div key="qr-slide" style={{ animation: "heroPromoIn 0.55s ease forwards" }}>
              <p className="eyebrow" style={{ color: "#d91f26" }}>{qrT.label}</p>
              <h2 style={{
                margin: "0 0 16px",
                fontSize: "clamp(2.4rem, 5vw, 4.5rem)",
                lineHeight: 0.95,
                letterSpacing: "-0.04em",
                fontWeight: 900,
                color: "#ffffff",
                whiteSpace: "pre-line",
              }}>
                {qrT.heading}
              </h2>
              <p style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "1rem",
                lineHeight: 1.65,
                maxWidth: "440px",
                margin: "0 0 28px",
              }}>
                {qrT.sub}
              </p>

              {/* Tags */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "32px" }}>
                {qrT.tags.map((tag) => (
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

              {/* QR + botón */}
              <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
                {/* QR */}
                <div style={{
                  background: "#000",
                  borderRadius: "12px",
                  padding: "10px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                }}>
                  <img
                    src={QR_URL}
                    alt="QR Code Safe Car App"
                    width={140}
                    height={140}
                    style={{ borderRadius: "6px", display: "block" }}
                  />
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.65rem", letterSpacing: "0.08em" }}>
                    {lang === "en" ? "SCAN TO DOWNLOAD" : "ESCANEA PARA DESCARGAR"}
                  </span>
                </div>

                {/* Botón Play Store */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <a
                    href={PLAY_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      background: "#fff",
                      color: "#000",
                      padding: "12px 20px",
                      borderRadius: "10px",
                      textDecoration: "none",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      letterSpacing: "0.01em",
                      transition: "opacity 0.2s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                  >
                    {/* Ícono Play Store */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M3.18 1.2L13.46 12 3.18 22.8c-.46-.25-.76-.73-.76-1.27V2.47c0-.54.3-1.02.76-1.27z" fill="#EA4335"/>
                      <path d="M17.54 8.46L5.3 1.74l9.28 9.28 2.96-2.56z" fill="#FBBC04"/>
                      <path d="M20.7 10.56c.69.38 1.12 1.09 1.12 1.88 0 .78-.43 1.49-1.12 1.88l-3.16 1.74-3.25-3.25 3.25-3.25 3.16 1z" fill="#4285F4"/>
                      <path d="M5.3 22.26l12.24-6.72-2.96-2.56L5.3 22.26z" fill="#34A853"/>
                    </svg>
                    <div>
                      <div style={{ fontSize: "0.65rem", fontWeight: 400, opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {lang === "en" ? "Get it on" : "Disponible en"}
                      </div>
                      <div>Google Play</div>
                    </div>
                  </a>
                  <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.72rem" }}>
                    {lang === "en" ? "Free · Android" : "Gratis · Android"}
                  </span>
                </div>
              </div>
            </div>
          )}

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