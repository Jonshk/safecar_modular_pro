"use client";

import { useLang } from "@/context/LangContext";

const trustText = {
  en: [
    { title: "Honest estimates",    text: "Clear next steps before work starts." },
    { title: "Diagnostics done right", text: "Less guesswork, fewer wasted repairs." },
    { title: "Quality parts",       text: "Practical shop-sourced components." },
    { title: "Bilingual support",   text: "English & Español for local customers." },
  ],
  es: [
    { title: "Presupuestos honestos",  text: "Pasos claros antes de comenzar." },
    { title: "Diagnóstico preciso",    text: "Menos suposiciones, menos pérdidas." },
    { title: "Repuestos de calidad",   text: "Componentes prácticos del taller." },
    { title: "Servicio bilingüe",      text: "English & Español para todos." },
  ],
};

export default function TrustBar() {
  const { lang } = useLang();
  const items = trustText[lang];

  return (
    <div className="trustBar">
      <div className="container trustGrid">
        {items.map((item) => (
          <div key={item.title} className="trustItem">
            <div className="trustDot" />
            <div>
              <strong>{item.title}</strong>
              <span>{item.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}