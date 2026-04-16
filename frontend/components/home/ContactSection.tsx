"use client";

import { useState } from "react";
import { site } from "@/lib/content";
import { useLang } from "@/context/LangContext";

const contactText = {
  en: {
    eyebrow: "Book Service",
    title: "Need help with your vehicle?",
    sub: "Call, visit the shop, or send a quick request and we'll follow up with next steps.",
    namePh: "Full name",
    phonePh: "Phone number",
    vehiclePh: "Year, make & model",
    issuePh: "Describe what's happening with your vehicle...",
    submit: "Send Request",
    sending: "Sending...",
    success: "✓ Request sent — we'll be in touch shortly.",
    error: "Something went wrong. Please call us directly.",
    or: "Or reach us directly",
  },
  es: {
    eyebrow: "Reservar Servicio",
    title: "¿Necesitas ayuda con tu vehículo?",
    sub: "Llama, visítanos o envía una solicitud y te contactaremos con los próximos pasos.",
    namePh: "Nombre completo",
    phonePh: "Número de teléfono",
    vehiclePh: "Año, marca y modelo",
    issuePh: "Describe qué le está pasando a tu vehículo...",
    submit: "Enviar Solicitud",
    sending: "Enviando...",
    success: "✓ Solicitud enviada — te contactaremos pronto.",
    error: "Algo salió mal. Por favor llámanos directamente.",
    or: "O contáctanos directamente",
  },
};

const contactInfo = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"
          stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: "+1 (872) 354-5706",
    href: "tel:+18723545706",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
          stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
      </svg>
    ),
    label: "1052 W 51st St, Chicago, IL 60609",
    href: "https://maps.google.com/?q=1052+W+51st+St+Chicago+IL",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    label: "Mon - Fri: 7:30 AM - 5:30 PM",
    href: null,
  },
];

export default function ContactSection() {
  const { lang } = useLang();
  const t = contactText[lang];
  const [status, setStatus] = useState<"idle"|"sending"|"success"|"error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name:    String(fd.get("name")    || ""),
      phone:   String(fd.get("phone")   || ""),
      vehicle: String(fd.get("vehicle") || ""),
      issue:   String(fd.get("issue")   || ""),
    };
    try {
      const res = await fetch(`${site.apiBase}/quote-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="ctSection" id="contact">
      {/* Ambient glow */}
      <div className="ctGlow" />

      <div className="container ctLayout">

        {/* LEFT */}
        <div className="ctLeft">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="ctTitle">{t.title}</h2>
          <p className="ctSub">{t.sub}</p>

          <p className="ctOrLabel">{t.or}</p>

          <div className="ctInfoList">
            {contactInfo.map((item, i) => (
              <div key={i} className="ctInfoRow">
                <span className="ctInfoIcon">{item.icon}</span>
                {item.href ? (
                  <a href={item.href} className="ctInfoText" target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                    {item.label}
                  </a>
                ) : (
                  <span className="ctInfoText">{item.label}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — form */}
        <div className="ctRight">
          <form className="ctForm" onSubmit={handleSubmit} noValidate>
            <div className="ctFormRow">
              <div className="ctField">
                <input name="name"    placeholder={t.namePh}    required className="ctInput" />
              </div>
              <div className="ctField">
                <input name="phone"   placeholder={t.phonePh}   required className="ctInput" type="tel"/>
              </div>
            </div>
            <div className="ctField">
              <input name="vehicle" placeholder={t.vehiclePh} required className="ctInput" />
            </div>
            <div className="ctField">
              <textarea name="issue" placeholder={t.issuePh} rows={5} required className="ctInput ctTextarea"/>
            </div>
            <button
              type="submit"
              className="ctSubmit"
              disabled={status === "sending"}
            >
              {status === "sending" ? t.sending : t.submit}
            </button>
            {status === "success" && <p className="ctStatusOk">{t.success}</p>}
            {status === "error"   && <p className="ctStatusErr">{t.error}</p>}
          </form>
        </div>

      </div>
    </section>
  );
}