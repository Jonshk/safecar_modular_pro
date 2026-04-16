"use client";

import { useState } from "react";
import { useLang } from "@/context/LangContext";

const trainingText = {
  en: {
    eyebrow: "Training Center",
    title: "Master the machine.",
    sub: "Real hands-on training from certified technicians inside our Chicago workshop.",
    cta: "Ask About Training",
    tag1: "4 modules",
    tag2: "Bilingual EN/ES",
    tag3: "Hands-on only",
  },
  es: {
    eyebrow: "Centro de Formación",
    title: "Domina la máquina.",
    sub: "Formación práctica con técnicos certificados dentro de nuestro taller en Chicago.",
    cta: "Preguntar sobre Formación",
    tag1: "4 módulos",
    tag2: "Bilingüe EN/ES",
    tag3: "100% práctica",
  },
};

const modules = {
  en: [
    { n: "01", title: "Automotive Electronics Fundamentals",  dur: "4 wks", desc: "Circuits, sensors, actuators and vehicle communication networks. Learn to read wiring diagrams and trace faults from root cause — not symptoms." },
    { n: "02", title: "Diagnostics Workflow & Fault Isolation", dur: "6 wks", desc: "Systematic scan tool usage, live data analysis and freeze frames. Build a repeatable process that eliminates guesswork for good." },
    { n: "03", title: "Motorcycle Mechanics",                  dur: "3 wks", desc: "Engine teardown, suspension tuning, electrical and fuel systems. Two-wheel specific techniques with real bikes in the bay." },
    { n: "04", title: "Hands-On Shop Learning Blocks",        dur: "Open",  desc: "Work live jobs alongside certified techs. Real vehicles, real tools, real feedback. No simulators — only the shop floor." },
  ],
  es: [
    { n: "01", title: "Fundamentos de Electrónica Automotriz",          dur: "4 sem", desc: "Circuitos, sensores, actuadores y redes de comunicación del vehículo. Aprende a leer diagramas y rastrear fallas desde la raíz, no los síntomas." },
    { n: "02", title: "Diagnóstico y Aislamiento de Fallas",            dur: "6 sem", desc: "Uso sistemático del escáner, análisis de datos en vivo y cuadros de congelamiento. Un proceso repetible que elimina las suposiciones." },
    { n: "03", title: "Mecánica de Motocicletas",                       dur: "3 sem", desc: "Desmontaje de motor, afinación de suspensión, eléctrico y combustible. Técnicas de dos ruedas con motos reales en el taller." },
    { n: "04", title: "Bloques de Aprendizaje en Taller Real",          dur: "Abierto", desc: "Trabaja en trabajos reales junto a técnicos certificados. Vehículos reales, herramientas reales, retroalimentación real." },
  ],
};

export default function TrainingSection() {
  const { lang } = useLang();
  const t = trainingText[lang];
  const mods = modules[lang];
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="trnSection" id="training">
      <img
        src="https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=2400&q=85"
        alt="Workshop"
        className="trnBg"
      />
      <div className="trnOverlay" />

      <div className="container trnLayout">

        {/* LEFT — headline */}
        <div className="trnLeft">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="trnTitle">{t.title}</h2>
          <p className="trnSub">{t.sub}</p>
          <div className="trnTags">
            <span className="trnTag">{t.tag1}</span>
            <span className="trnTag">{t.tag2}</span>
            <span className="trnTag">{t.tag3}</span>
          </div>
          <a href="/training" className="trnCta">{t.cta}</a>
        </div>

        {/* RIGHT — module list */}
        <div className="trnRight">
          {mods.map((m, i) => (
            <div key={m.n} className="trnRow">
              <button
                className={`trnRowBtn ${open === i ? "open" : ""}`}
                onClick={() => setOpen(open === i ? null : i)}
                type="button"
              >
                <span className="trnN">{m.n}</span>
                <span className="trnModTitle">{m.title}</span>
                <span className="trnDur">{m.dur}</span>
                <svg className="trnArrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {open === i && (
                <p className="trnDesc">{m.desc}</p>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}