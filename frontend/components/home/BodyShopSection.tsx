"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/context/LangContext";

const bodyShopText = {
  en: {
    eyebrow: "Body Shop",
    title: "Collision repair & paint, done right.",
    sub: "Frame straightening, panel replacement and factory-quality paint matching — full body shop services under one roof.",
    items: [
      "Collision repair & frame straightening",
      "Dent removal & panel replacement",
      "Full & spot paint matching, clear coat refinishing",
      "Free body shop estimates",
    ],
    cta: "View Body Shop Services",
  },
  es: {
    eyebrow: "Taller de Carrocería",
    title: "Latonería y pintura, bien hechas.",
    sub: "Enderezado de chasis, reemplazo de paneles y pintura de calidad de fábrica — servicio completo de carrocería en un solo lugar.",
    items: [
      "Reparación de colisiones y enderezado de chasis",
      "Eliminación de abolladuras y reemplazo de paneles",
      "Pintura total y por zonas, refinado con clear coat",
      "Presupuestos de carrocería sin costo",
    ],
    cta: "Ver Servicios de Carrocería",
  },
};

// Imágenes que rotan — cambia justo cuando el haz de luz neón termina su barrido
const bodyShopImages = [
  "https://images.unsplash.com/photo-1767681092416-bccf9410bda4?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1727893304219-063d142ce6f3?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1702146713858-8e7d1cc29fe8?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1727893119356-1702fe921cf9?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1618312980096-873bd19759a0?auto=format&fit=crop&w=1800&q=80",
];

// Debe coincidir con la duración de la animación bsBeamSweep en globals.css (5s)
const BEAM_DURATION_MS = 5000;

export default function BodyShopSection() {
  const { lang } = useLang();
  const t = bodyShopText[lang];
  const [imgIndex, setImgIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setImgIndex((i) => (i + 1) % bodyShopImages.length);
        setFading(false);
      }, 350); // pequeño crossfade antes de cambiar
    }, BEAM_DURATION_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="splitSection splitSectionReverse" id="body-shop">
      <div className="splitImage">
        <div className="bsImageWrap">
          <img
            key={imgIndex}
            src={bodyShopImages[imgIndex]}
            alt="Body shop collision repair and paint"
            className={`bsImg ${fading ? "bsImgFading" : ""}`}
          />
          <div className="bsMesh" />
          <div className="bsBeam" />
          <div className="bsVignette" />
          <div className="bsGlowBorder" />
          <span className="bsCorner bsCorner--tl" />
          <span className="bsCorner bsCorner--br" />
        </div>
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
        <a href="/body-shop" className="heroPrimary" style={{ marginTop: "28px", display: "inline-flex" }}>
          {t.cta}
        </a>
      </div>
    </section>
  );
}
