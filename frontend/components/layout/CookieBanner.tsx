"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/context/LangContext";

const T = {
  en: {
    text: "We use cookies to improve your experience and analyze site traffic. By continuing, you agree to our",
    policy: "Privacy Policy",
    accept: "Accept All",
    decline: "Decline",
  },
  es: {
    text: "Usamos cookies para mejorar tu experiencia y analizar el tráfico. Al continuar, aceptas nuestra",
    policy: "Política de Privacidad",
    accept: "Aceptar Todo",
    decline: "Rechazar",
  },
};

export default function CookieBanner() {
  const { lang } = useLang();
  const t = T[lang as "en" | "es"] ?? T.en;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      // Small delay so it doesn't flash on first paint
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  function accept() {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem("cookie_consent", "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <>
      {/* Backdrop blur on mobile */}
      <div style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        zIndex: 8990,
        backdropFilter: "blur(2px)",
        animation: "cookieFadeIn 0.3s ease",
      }} />

      <div style={{
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(1200px, calc(100vw - 48px))",
        zIndex: 8999,
        background: "#0e0f13",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "20px",
        padding: "24px 28px",
        display: "flex",
        alignItems: "center",
        gap: "24px",
        boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(217,31,38,0.08)",
        animation: "cookieSlideUp 0.4s cubic-bezier(.22,1,.36,1)",
        flexWrap: "wrap",
      }}>

        {/* Cookie icon */}
        <div style={{
          width: "44px",
          height: "44px",
          borderRadius: "12px",
          background: "rgba(217,31,38,0.1)",
          border: "1px solid rgba(217,31,38,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: "22px",
        }}>
          🍪
        </div>

        {/* Text */}
        <p style={{
          flex: 1,
          margin: 0,
          fontSize: "0.9rem",
          color: "rgba(255,255,255,0.65)",
          lineHeight: 1.6,
          minWidth: "200px",
        }}>
          {t.text}{" "}
          <a
            href="/privacy"
            style={{ color: "#d91f26", textDecoration: "underline", fontWeight: 600 }}
          >
            {t.policy}
          </a>
          .
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
          <button
            onClick={decline}
            style={{
              height: "42px",
              padding: "0 20px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "12px",
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.84rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => {
              (e.target as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.3)";
              (e.target as HTMLButtonElement).style.color = "#fff";
            }}
            onMouseLeave={e => {
              (e.target as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.15)";
              (e.target as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)";
            }}
          >
            {t.decline}
          </button>

          <button
            onClick={accept}
            style={{
              height: "42px",
              padding: "0 24px",
              background: "#d91f26",
              border: "none",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "0.84rem",
              fontWeight: 800,
              cursor: "pointer",
              letterSpacing: "0.04em",
              boxShadow: "0 4px 16px rgba(217,31,38,0.35)",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => {
              (e.target as HTMLButtonElement).style.background = "#bc181f";
              (e.target as HTMLButtonElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              (e.target as HTMLButtonElement).style.background = "#d91f26";
              (e.target as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          >
            {t.accept}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes cookieSlideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes cookieFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}