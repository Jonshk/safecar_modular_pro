"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useLang } from "@/context/LangContext";

const galleryText = {
  en: { eyebrow: "Our Shop", title: "Inside the workshop.", sub: "Real tools. Real work. Real Chicago." },
  es: { eyebrow: "Nuestro Taller", title: "Dentro del taller.", sub: "Herramientas reales. Trabajo real. Chicago real." },
};

// Put your photos in public/gallery/ named 1.jpg, 2.jpg ... 8.jpg
const COUNT = 8;
const photos = Array.from({ length: COUNT }, (_, i) => ({
  src: `/gallery/${i + 1}.jpg`,
  alt: `Workshop photo ${i + 1}`,
}));

// Layout: sizes for each tile in the masonry
const sizes = [
  { gridColumn: "1 / 2", gridRow: "1 / 3", height: "100%" }, // tall left
  { gridColumn: "2 / 3", gridRow: "1 / 2", height: "100%" }, // top center
  { gridColumn: "3 / 4", gridRow: "1 / 2", height: "100%" }, // top right
  { gridColumn: "2 / 3", gridRow: "2 / 3", height: "100%" }, // bottom center
  { gridColumn: "3 / 4", gridRow: "2 / 3", height: "100%" }, // bottom right
  { gridColumn: "1 / 2", gridRow: "3 / 4", height: "100%" }, // bottom-left small
  { gridColumn: "2 / 4", gridRow: "3 / 4", height: "100%" }, // wide bottom
  { gridColumn: "1 / 4", gridRow: "4 / 5", height: "100%" }, // full width banner
];

function ScanTile({ src, alt, index, onOpen }: {
  src: string; alt: string; index: number; onOpen: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setTimeout(() => setScanned(true), index * 120);
        obs.disconnect();
      }
    }, { threshold: 0.1 });
    obs.observe(el);

    // Parallax
    const speed = 24 + (index % 4) * 8;
    const tick = () => {
      if (!ref.current || !imgRef.current) return;
      const r = ref.current.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      const p = (vh - r.top) / (vh + r.height);
      imgRef.current.style.transform = `scale(1.14) translateY(${(p - 0.5) * speed}px)`;
    };
    window.addEventListener("scroll", tick, { passive: true });
    tick();

    return () => { obs.disconnect(); window.removeEventListener("scroll", tick); };
  }, [index]);

  return (
    <div
      ref={ref}
      className={`glryTile ${scanned ? "glryScanned" : ""}`}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      aria-label={alt}
    >
      {/* Scan line effect */}
      <div className="glryScanLine" />
      {/* Red corner brackets — tech HUD style */}
      <div className="glryBracketTL" />
      <div className="glryBracketTR" />
      <div className="glryBracketBL" />
      <div className="glryBracketBR" />
      {/* Index label */}
      <span className="glryIndex">0{index + 1}</span>

      <img ref={imgRef} src={src} alt={alt} className="glryTileImg" />

      <div className="glryHover">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="#d91f26" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
}

export default function GallerySection() {
  const { lang } = useLang();
  const t = galleryText[lang];
  const [open, setOpen] = useState<number | null>(null);

  const prev = useCallback(() => setOpen(i => i !== null ? (i - 1 + COUNT) % COUNT : null), []);
  const next = useCallback(() => setOpen(i => i !== null ? (i + 1) % COUNT : null), []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [prev, next]);

  // Lock body scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = open !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <section className="glrySection" id="gallery">
      <div className="container">
        <div className="glryHeader">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="glryTitle">{t.title}</h2>
          <p className="glrySub">{t.sub}</p>
        </div>

        <div className="glryMasonry">
          {photos.map((p, i) => (
            <div
              key={i}
              className="glryCell"
              style={sizes[i] as React.CSSProperties}
            >
              <ScanTile src={p.src} alt={p.alt} index={i} onOpen={() => setOpen(i)} />
            </div>
          ))}
        </div>
      </div>

      {/* LIGHTBOX */}
      {open !== null && (
        <div className="glryLb" onClick={() => setOpen(null)}>
          <button className="glryLbClose" onClick={() => setOpen(null)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <button className="glryLbNav glryLbPrev" onClick={e => { e.stopPropagation(); prev(); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="glryLbFrame" onClick={e => e.stopPropagation()}>
            {/* HUD corners on lightbox too */}
            <div className="glryLbBracketTL" />
            <div className="glryLbBracketTR" />
            <div className="glryLbBracketBL" />
            <div className="glryLbBracketBR" />
            <img src={photos[open].src} alt={photos[open].alt} className="glryLbImg" />
          </div>
          <button className="glryLbNav glryLbNext" onClick={e => { e.stopPropagation(); next(); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <p className="glryLbCount">{open + 1} / {COUNT}</p>
        </div>
      )}
    </section>
  );
}