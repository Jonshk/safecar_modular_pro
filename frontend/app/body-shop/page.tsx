"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/context/LangContext";

const T = {
  en: {
    eyebrow: "Body Shop",
    title: "Collision repair & paint, done right.",
    sub: "Frame straightening, panel replacement and factory-quality paint matching — full body shop services under one roof, inside our Chicago workshop.",
    tag1: "Insurance-ready estimates",
    tag2: "OEM-spec parts",
    tag3: "Bilingual EN/ES",
    servicesEyebrow: "What We Do",
    servicesTitle: "Two specialties. One standard.",
    included: "What's included",
    cta: "Book Body Shop Service",
    estimateEyebrow: "Free Estimate",
    estimateTitle: "Get a written estimate before we touch your car.",
    estimateSub: "Bring your vehicle in or send photos — we'll walk you through the repair plan and cost, no surprises.",
    estimateCta: "Request an Estimate",
  },
  es: {
    eyebrow: "Taller de Carrocería",
    title: "Latonería y pintura, bien hechas.",
    sub: "Enderezado de chasis, reemplazo de paneles y pintura de calidad de fábrica — servicio completo de carrocería en un solo lugar, dentro de nuestro taller en Chicago.",
    tag1: "Presupuestos para seguros",
    tag2: "Piezas especificación OEM",
    tag3: "Bilingüe EN/ES",
    servicesEyebrow: "Qué Hacemos",
    servicesTitle: "Dos especialidades. Un solo estándar.",
    included: "Qué incluye",
    cta: "Reservar Servicio de Carrocería",
    estimateEyebrow: "Presupuesto Gratis",
    estimateTitle: "Presupuesto por escrito antes de tocar tu auto.",
    estimateSub: "Trae tu vehículo o envíanos fotos — te explicamos el plan de reparación y el costo, sin sorpresas.",
    estimateCta: "Pedir Presupuesto",
  },
};

const bodyShopServices = {
  "Collision Repair": {
    tagline: { en: "Straight frame. Solid structure. Done right.", es: "Chasis recto. Estructura sólida. Bien hecho." },
    body: {
      en: ["After a collision, what you can't see matters more than what you can. A frame that's off by even half an inch changes handling, tire wear, and crash safety on the next impact.", "We use computerized frame measuring to pull structural damage back to factory spec, then rebuild with OEM-spec panels and proper welding — not just filler and hope.", "Every collision repair includes a full structural inspection, a written estimate for insurance, and a final alignment check before the car leaves the shop."],
      es: ["Después de una colisión, lo que no se ve importa más que lo que se ve. Un chasis desalineado cambia el manejo, el desgaste de neumáticos y la seguridad en el próximo impacto.", "Usamos medición computarizada de chasis para devolver el daño estructural a la especificación de fábrica, y reconstruimos con paneles de especificación OEM y soldadura adecuada.", "Cada reparación de colisión incluye inspección estructural completa, presupuesto escrito para el seguro y revisión final de alineación antes de entregar el auto."],
    },
    bullets: {
      en: ["Computerized frame measuring & pulling", "OEM-spec panel replacement", "Structural welding & reinforcement", "Insurance-ready written estimates", "Post-repair alignment check", "Bilingual claims support — EN / ES"],
      es: ["Medición y enderezado de chasis computarizado", "Reemplazo de paneles OEM", "Soldadura y refuerzo estructural", "Presupuestos listos para el seguro", "Revisión de alineación post-reparación", "Soporte bilingüe para reclamos — EN / ES"],
    },
    image: "https://images.unsplash.com/photo-1767681092416-bccf9410bda4?auto=format&fit=crop&w=1600&q=85",
  },
  "Paint & Refinishing": {
    tagline: { en: "Matched to the panel. Not just to the eye.", es: "Igualada al panel. No solo a simple vista." },
    body: {
      en: ["Factory color codes drift with age, sun exposure, and prior repairs. We pull your vehicle's exact code and blend-test it against the actual panel before spraying — not just the paint chip.", "Our paint booth controls temperature and filtration for a clean, even finish, whether it's a single-panel touch-up or a full respray after collision work.", "Every job gets clear coat, wet sanding, and a buff-out pass so the repaired area disappears into the rest of the car."],
      es: ["Los códigos de color de fábrica se desvanecen con la edad, el sol y reparaciones previas. Extraemos el código exacto de tu vehículo y hacemos una prueba de mezcla contra el panel real antes de pintar.", "Nuestra cabina de pintura controla temperatura y filtración para un acabado limpio y uniforme, ya sea un retoque de un panel o una repintada completa.", "Cada trabajo lleva capa transparente, lijado en húmedo y pulido final para que el área reparada se integre con el resto del auto."],
    },
    bullets: {
      en: ["Factory color code matching", "Spot & full panel refinishing", "Climate-controlled spray booth", "Clear coat & wet sanding", "Buff-out & final polish", "Post-paint quality inspection"],
      es: ["Igualación de código de color de fábrica", "Retoque parcial o repintado completo", "Cabina de pintura con clima controlado", "Capa transparente y lijado en húmedo", "Pulido y acabado final", "Inspección de calidad post-pintura"],
    },
    image: "https://images.unsplash.com/photo-1702146713858-8e7d1cc29fe8?auto=format&fit=crop&w=1600&q=85",
  },
};

function BsHero({ t }: { t: typeof T.en }) {
  return (
    <section className="trnSection" id="body-shop-hero">
      <img
        src="https://images.unsplash.com/photo-1727893304219-063d142ce6f3?auto=format&fit=crop&w=2400&q=85"
        alt="Body shop"
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
        <a href="#bs-services" className="trnCta">{t.servicesEyebrow} ↓</a>
      </div>
    </section>
  );
}

function BsServiceBlock({
  name, data, lang, reverse, t,
}: {
  name: keyof typeof bodyShopServices;
  data: (typeof bodyShopServices)["Collision Repair"];
  lang: "en" | "es";
  reverse: boolean;
  t: typeof T.en;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`splitSection ${reverse ? "splitSectionReverse" : ""}`}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(24px)",
        transition: "opacity .6s ease, transform .6s ease",
      }}
    >
      <div className="splitImage">
        <div className="bsImageWrap">
          <img src={data.image} alt={name} />
          <div className="bsMesh" />
          <div className="bsVignette" />
          <div className="bsGlowBorder" />
          <span className="bsCorner bsCorner--tl" />
          <span className="bsCorner bsCorner--br" />
        </div>
      </div>
      <div className="splitCopy">
        <div className="eyebrow">{name}</div>
        <h2>{data.tagline[lang]}</h2>
        {data.body[lang].map((p, i) => (
          <p key={i} style={{ marginBottom: 14 }}>{p}</p>
        ))}
        <p style={{ fontSize: ".78rem", letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(255,255,255,.45)", marginTop: 18, marginBottom: 8, fontWeight: 700 }}>
          {t.included}
        </p>
        <ul>
          {data.bullets[lang].map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <a href="/book" className="heroPrimary" style={{ marginTop: "28px", display: "inline-flex" }}>
          {t.cta}
        </a>
      </div>
    </div>
  );
}

function BsEstimateStrip({ t }: { t: typeof T.en }) {
  return (
    <section className="glrySection" style={{ textAlign: "center" }}>
      <div className="container">
        <p className="eyebrow">{t.estimateEyebrow}</p>
        <h2 className="glryTitle">{t.estimateTitle}</h2>
        <p className="glrySub" style={{ maxWidth: 560, margin: "0 auto 28px" }}>{t.estimateSub}</p>
        <a href="/book" className="heroPrimary" style={{ display: "inline-flex" }}>
          {t.estimateCta}
        </a>
      </div>
    </section>
  );
}

export default function BodyShopPage() {
  const { lang } = useLang();
  const t = T[lang as "en" | "es"] ?? T.en;

  return (
    <>
      <BsHero t={t} />
      <section id="bs-services">
        <BsServiceBlock
          name="Collision Repair"
          data={bodyShopServices["Collision Repair"]}
          lang={lang as "en" | "es"}
          reverse={false}
          t={t}
        />
        <BsServiceBlock
          name="Paint & Refinishing"
          data={bodyShopServices["Paint & Refinishing"]}
          lang={lang as "en" | "es"}
          reverse={true}
          t={t}
        />
      </section>
      <BsEstimateStrip t={t} />
    </>
  );
}
