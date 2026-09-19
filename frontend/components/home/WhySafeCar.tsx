"use client";

import { useLang } from "@/context/LangContext";

const whyText = {
  en: {
    eyebrow: "Why Safe Car",
    title: "Diagnose right. Explain clearly. Repair with confidence.",
    sub: "Practical diagnostics, straight communication and reliable repairs. Built to feel like a real Chicago workshop.",
    items: [
      "Electrical fault tracing and charging system checks",
      "Brake, suspension, engine and maintenance service",
      "Domestic, Asian and European vehicles",
      "Bilingual service — English & Español",
    ],
    cta: "View Services",
  },
  es: {
    eyebrow: "Por qué Safe Car",
    title: "Diagnóstico preciso. Comunicación clara. Reparación confiable.",
    sub: "Diagnóstico práctico, comunicación directa y reparaciones confiables. Un verdadero taller de Chicago.",
    items: [
      "Rastreo de fallas eléctricas y sistema de carga",
      "Frenos, suspensión, motor y mantenimiento",
      "Vehículos domésticos, asiáticos y europeos",
      "Servicio bilingüe — English & Español",
    ],
    cta: "Ver Servicios",
  },
};

export default function WhySafeCar() {
  const { lang } = useLang();
  const t = whyText[lang];

  return (
    <section className="splitSection" id="about">
      <div className="splitImage">
        <img
          src="https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1800&q=80"
          alt="Mechanic working"
        />
      </div>
      <div className="splitCopy">
        <div className="eyebrow">{t.eyebrow}</div>
        <h2>{t.title}</h2>
        <p>{t.sub}</p>
        <ul>
          {t.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <a href="/services" className="heroPrimary" style={{ marginTop: "28px", display: "inline-flex" }}>
          {t.cta}
        </a>
      </div>
    </section>
  );
}