"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useLang } from "@/context/LangContext";

const API = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

const T = {
  en: {
    eyebrow: "Training Center",
    title: "Master the machine.",
    sub: "Real hands-on training from certified technicians inside our Chicago workshop.",
    gallEyebrow: "Inside the Classroom",
    gallTitle: "Where techs are made.",
    gallSub: "Real students. Real tools. Real Chicago.",
    coursesEyebrow: "Available Programs",
    coursesSub: "Choose your path — every course is taught inside our live workshop.",
    enroll: "Enroll now",
    wks: "wks",
    open: "Open",
    loading: "Loading programs...",
    noModules: "No programs available right now. Check back soon.",
    tag1: "Bilingual EN/ES",
    tag2: "Hands-on only",
    tag3: "Certified techs",
    spots: "spots available",
    fewSpots: "Only {n} spots left",
    full: "Full — waitlist only",
  },
  es: {
    eyebrow: "Centro de Formación",
    title: "Domina la máquina.",
    sub: "Formación práctica con técnicos certificados dentro de nuestro taller en Chicago.",
    gallEyebrow: "Dentro del Aula",
    gallTitle: "Aquí nacen los técnicos.",
    gallSub: "Estudiantes reales. Herramientas reales. Chicago real.",
    coursesEyebrow: "Programas Disponibles",
    coursesSub: "Elige tu camino — todos los cursos se imparten en nuestro taller activo.",
    enroll: "Inscribirse",
    wks: "sem",
    open: "Abierto",
    loading: "Cargando programas...",
    noModules: "No hay programas disponibles por ahora. Vuelve pronto.",
    tag1: "Bilingüe EN/ES",
    tag2: "100% práctica",
    tag3: "Técnicos certificados",
    spots: "plazas disponibles",
    fewSpots: "Solo {n} plazas",
    full: "Completo — solo lista de espera",
  },
};

const GALLERY_COUNT = 6;
const galleryPhotos = Array.from({ length: GALLERY_COUNT }, (_, i) => ({
  src: `/training/${i + 1}.jpg`,
  alt: `Training photo ${i + 1}`,
}));

const gallSizes = [
  { gridColumn: "1 / 2", gridRow: "1 / 3" },
  { gridColumn: "2 / 3", gridRow: "1 / 2" },
  { gridColumn: "3 / 4", gridRow: "1 / 2" },
  { gridColumn: "2 / 3", gridRow: "2 / 3" },
  { gridColumn: "3 / 4", gridRow: "2 / 3" },
  { gridColumn: "1 / 4", gridRow: "3 / 4" },
];

// Opción B: imagen automática por palabra clave en el título
function getDefaultImage(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("electric") || t.includes("eléctric") || t.includes("electronic") || t.includes("wiring"))
    return "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80";
  if (t.includes("diagnostic") || t.includes("diagnós") || t.includes("fault") || t.includes("obd") || t.includes("scan"))
    return "https://images.unsplash.com/photo-1727893380169-4dda123e19f7?w=800&q=80";
  if (t.includes("motorcycle") || t.includes("moto"))
    return "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80";
  if (t.includes("shop") || t.includes("taller") || t.includes("hands") || t.includes("learning"))
    return "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=800&q=80";
  if (t.includes("engine") || t.includes("motor"))
    return "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80";
  if (t.includes("transmis") || t.includes("brake") || t.includes("freno") || t.includes("suspension"))
    return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80";
  return "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=800&q=80";
}

function normalizeMode(mode: string): string {
  const m = mode?.toLowerCase().trim();
  if (m === "presential" || m === "presencial" || m === "in-person" || m === "on-site") return "IN-PERSON";
  if (m === "online") return "ONLINE";
  if (m === "hybrid" || m === "híbrido") return "HYBRID";
  return mode?.toUpperCase() ?? "";
}

function ScanTile({ src, alt, index, onOpen }: {
  src: string; alt: string; index: number; onOpen: () => void;
}) {
  const ref    = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setScanned(true), index * 120); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(el);
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
      <div className="glryScanLine" />
      <div className="glryBracketTL" /><div className="glryBracketTR" />
      <div className="glryBracketBL" /><div className="glryBracketBR" />
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

function TrainingHero({ t }: { t: typeof T.en }) {
  return (
    <section className="trnSection" id="training-hero">
      <img
        src="https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=2400&q=85"
        alt="Workshop"
        className="trnBg"
      />
      <div className="trnOverlay" />
      <div className="container trnHeroLayout">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="trnHeroTitle">{t.title}</h1>
        <p className="trnSub">{t.sub}</p>
        <div className="trnTags">
          <span className="trnTag">{t.tag1}</span>
          <span className="trnTag">{t.tag2}</span>
          <span className="trnTag">{t.tag3}</span>
        </div>
        <a href="#trn-courses" className="trnCta">{t.coursesEyebrow} ↓</a>
      </div>
    </section>
  );
}

function TrainingGallery({ t }: { t: typeof T.en }) {
  const [open, setOpen] = useState<number | null>(null);
  const prev = useCallback(() => setOpen(i => i !== null ? (i - 1 + GALLERY_COUNT) % GALLERY_COUNT : null), []);
  const next = useCallback(() => setOpen(i => i !== null ? (i + 1) % GALLERY_COUNT : null), []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [prev, next]);

  useEffect(() => {
    document.body.style.overflow = open !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <section className="glrySection" id="trn-gallery">
      <div className="container">
        <div className="glryHeader">
          <p className="eyebrow">{t.gallEyebrow}</p>
          <h2 className="glryTitle">{t.gallTitle}</h2>
          <p className="glrySub">{t.gallSub}</p>
        </div>
        <div className="trnMasonry">
          {galleryPhotos.map((p, i) => (
            <div key={i} className="glryCell" style={gallSizes[i] as React.CSSProperties}>
              <ScanTile src={p.src} alt={p.alt} index={i} onOpen={() => setOpen(i)} />
            </div>
          ))}
        </div>
      </div>
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
            <div className="glryLbBracketTL" /><div className="glryLbBracketTR" />
            <div className="glryLbBracketBL" /><div className="glryLbBracketBR" />
            <img src={galleryPhotos[open].src} alt={galleryPhotos[open].alt} className="glryLbImg" />
          </div>
          <button className="glryLbNav glryLbNext" onClick={e => { e.stopPropagation(); next(); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <p className="glryLbCount">{open + 1} / {GALLERY_COUNT}</p>
        </div>
      )}
    </section>
  );
}

function CourseCard({ module, lang, t }: { module: any; lang: "en" | "es"; t: typeof T.en }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const title     = lang === "es" && module.title_es ? module.title_es : module.title;
  const desc      = lang === "es" && module.description_es ? module.description_es : module.description;
  const dur       = module.duration_weeks > 0 ? `${module.duration_weeks} ${t.wks}` : t.open;
  const spotsLeft = module.max_students - (module.enrolled_count || 0);
  const modeLabel = normalizeMode(module.mode);

  // Opción A (admin) tiene prioridad → Opción B (automática) como fallback
  const imageSrc = module.image_url || getDefaultImage(title);

  return (
    <div
      ref={ref}
      className={`trnCourseCard ${vis ? "trnCourseCardVis" : ""}`}
      style={{ display: "flex", flexDirection: "column" }}
    >
      <div className="trnCourseImg">
        <img src={imageSrc} alt={title} />
        <span className="trnCourseMode">{modeLabel}</span>
      </div>

      <div className="trnCourseBody" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div className="trnCourseMeta">
          <span className="trnCourseDur">⏱ {dur}</span>
          {module.schedule && <span className="trnCourseSched">📅 {module.schedule}</span>}
        </div>

        <h3 className="trnCourseTitle" style={{ minHeight: "3rem" }}>{title}</h3>

        {desc && <p className="trnCourseDesc" style={{ flex: 1 }}>{desc}</p>}

        <div className="trnCourseFooter" style={{ marginTop: "auto" }}>
          <div>
            <p className="trnCoursePrice">${module.price?.toFixed(2)}</p>
            {spotsLeft > 0
              ? <p className="trnCourseSpots" style={{ color: spotsLeft < 5 ? "#f59e0b" : "#16a34a" }}>
                  {spotsLeft < 5
                    ? t.fewSpots.replace("{n}", String(spotsLeft))
                    : `${spotsLeft} ${t.spots}`}
                </p>
              : <p className="trnCourseSpots" style={{ color: "#ef4444" }}>{t.full}</p>
            }
          </div>
          <a href="/training/enroll" className="trnCourseBtn">{t.enroll} →</a>
        </div>
      </div>
    </div>
  );
}

function TrainingCourses({ t, lang }: { t: typeof T.en; lang: "en" | "es" }) {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/training/modules`)
      .then(r => r.json())
      .then(data => { setModules(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section className="trnCoursesSection" id="trn-courses">
      <div className="container">
        <div className="glryHeader">
          <p className="eyebrow">{t.coursesEyebrow}</p>
          <h2 className="glryTitle">{t.coursesSub}</h2>
        </div>
        {loading ? (
          <div className="trnCoursesGrid">
            {[1,2,3,4].map(i => <div key={i} className="trnCourseSkeleton" />)}
          </div>
        ) : modules.length === 0 ? (
          <p className="trnCoursesEmpty">{t.noModules}</p>
        ) : (
          <div className="trnCoursesGrid">
            {modules.map(m => (
              <CourseCard key={m.id} module={m} lang={lang} t={t} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function TrainingPage() {
  const { lang } = useLang();
  const t = T[lang as "en" | "es"] ?? T.en;
  return (
    <>
      <TrainingHero t={t} />
      <TrainingGallery t={t} />
      <TrainingCourses t={t} lang={lang as "en" | "es"} />
    </>
  );
}