"use client";

import { useRef, useEffect, useState, useId } from "react";
import { useLang } from "@/context/LangContext";
import { services } from "@/lib/content";

const pageText = {
  en: { eyebrow:"Core Services", title:"What we fix", sub:"Complete automotive care for domestic, Asian and European vehicles.", included:"What's included", book:"BOOK SERVICE" },
  es: { eyebrow:"Servicios", title:"Lo que reparamos", sub:"Servicio automotriz completo para vehículos domésticos, asiáticos y europeos.", included:"Qué incluye", book:"RESERVAR SERVICIO" },
};

const serviceDetails: Record<string, {
  tagline: { en: string; es: string };
  body: { en: string[]; es: string[] };
  bullets: { en: string[]; es: string[] };
}> = {
  "Electrical Diagnostics": {
    tagline: { en:"Find it right. Fix it once.", es:"Encuéntralo bien. Repáralo una vez." },
    body: {
      en: ["Modern vehicles rely on dozens of sensors and control modules communicating across multiple bus networks. A single faulty ground or degraded connector can produce misleading codes pointing to the wrong system entirely.","We use professional-grade scan tools and oscilloscopes to trace signals at the source — not just read codes. That means we find intermittent faults, CAN-bus communication errors, and wiring shorts that other shops miss.","Every diagnostic starts with a full system scan across all modules, followed by a clear written estimate before any repair begins."],
      es: ["Los vehículos modernos dependen de docenas de sensores y módulos de control. Un solo tierra defectuoso puede producir códigos engañosos que apuntan al sistema equivocado.","Usamos herramientas de diagnóstico profesionales y osciloscopios para rastrear señales en la fuente, no solo leer códigos. Encontramos fallas intermitentes que otros talleres pasan por alto.","Cada diagnóstico comienza con un escaneo completo en todos los módulos, seguido de un estimado escrito claro antes de comenzar cualquier reparación."],
    },
    bullets: { en:["Full module scan across all systems","Oscilloscope signal tracing","Intermittent fault diagnosis","Charging & starting system tests","Wiring repair & harness work"], es:["Escaneo completo de todos los módulos","Rastreo de señales con osciloscopio","Diagnóstico de fallas intermitentes","Pruebas del sistema de carga","Reparación de cableado y arneses"] },
  },
  "Brake & Suspension": {
    tagline: { en:"Stop right. Handle right.", es:"Frena bien. Maneja bien." },
    body: {
      en: ["Brakes and suspension work together — worn shocks change how weight transfers under braking, meaning both problems can look identical from the driver's seat.","We inspect the full corner: caliper operation, rotor condition, pad thickness, wheel bearing play, and suspension geometry.","All brake work uses quality parts with a minimum 12-month warranty on labor. Rotor replacement comes with a brake bed-in procedure and test drive."],
      es: ["Los frenos y la suspensión trabajan juntos — los amortiguadores desgastados cambian cómo se transfiere el peso al frenar.","Inspeccionamos la esquina completa: calibrador, condición del rotor, grosor de pastilla, juego del rodamiento y geometría de suspensión.","Todo el trabajo de frenos usa piezas de calidad con garantía mínima de 12 meses en mano de obra."],
    },
    bullets: { en:["Brake pad & rotor replacement","Caliper service & replacement","Wheel bearing inspection","Shock & strut replacement","Steering linkage & alignment check"], es:["Reemplazo de pastillas y rotores","Servicio y reemplazo de calibradores","Inspección de rodamientos","Reemplazo de amortiguadores","Revisión de dirección y alineación"] },
  },
  "Engine & Maintenance": {
    tagline: { en:"Keep it running right.", es:"Mantenlo funcionando bien." },
    body: {
      en: ["Scheduled maintenance is the cheapest repair you'll ever do. We follow manufacturer intervals using quality fluids and filters, flagging developing issues before they become expensive failures.","Beyond routine service, we handle cooling system repairs, timing belts and chains, valve cover gaskets, and fuel system service. Domestic, Asian, and European platforms.","We keep a service history on file for every customer — so at your next visit we know what was done, what's coming due, and what to watch."],
      es: ["El mantenimiento programado es la reparación más barata que harás. Seguimos los intervalos del fabricante usando fluidos y filtros de calidad.","Manejamos reparaciones del sistema de enfriamiento, correas y cadenas de distribución y servicio del sistema de combustible.","Mantenemos un historial de servicio para cada cliente para que en tu próxima visita sepamos qué se hizo."],
    },
    bullets: { en:["Oil & filter service","Spark plug & ignition tune-up","Timing belt / chain replacement","Cooling system flush & repair","Fuel system service","Battery replacement & testing"], es:["Servicio de aceite y filtro","Afinación de bujías e ignición","Reemplazo de correa/cadena","Flush y reparación del sistema de enfriamiento","Servicio del sistema de combustible","Reemplazo y prueba de batería"] },
  },
  "Parts & Components": {
    tagline: { en:"Right part. Right fit. No guessing.", es:"La pieza correcta. Sin adivinar." },
    body: {
      en: ["We source parts from OEM suppliers and trusted aftermarket brands — the same lines used by dealerships. We don't use the cheapest part; we use the part that will still be working two years from now.","For customers who supply their own parts, we'll install them with standard labor rates and are upfront about warranty terms.","Common wear items for popular domestic and Asian platforms are kept in stock for same-day turnaround."],
      es: ["Obtenemos piezas de proveedores OEM y marcas aftermarket de confianza — las mismas líneas utilizadas por concesionarios.","Para clientes que suministran sus propias piezas, las instalamos con tarifas de mano de obra estándar.","Los artículos de desgaste comunes se mantienen en stock para entrega el mismo día."],
    },
    bullets: { en:["OEM-equivalent parts sourcing","Customer-supplied parts installation","Same-day stock for common repairs","Warranty on all parts we supply","Transparent pricing before approval"], es:["Abastecimiento de piezas equivalentes OEM","Instalación de piezas del cliente","Stock el mismo día","Garantía en todas las piezas que suministramos","Precios transparentes antes de la aprobación"] },
  },
  "Starting & Charging": {
    tagline: { en:"Dead battery? We trace it to the source.", es:"¿Batería muerta? Rastreamos la causa." },
    body: {
      en: ["A dead battery is rarely just a dead battery. Parasitic draws, a failing alternator, or a corroded charging circuit will kill a new battery in weeks. We test the full system before recommending any replacement.","We use carbon-pile load testers and conductance analyzers to give accurate battery health readings — not just voltage checks.","If the starter is the problem, we bench-test before condemning it. A starter that won't engage usually means a flywheel ring gear issue — not the starter itself."],
      es: ["Una batería muerta rara vez es solo una batería muerta. Las cargas parásitas o un alternador defectuoso matarán una batería nueva en semanas.","Usamos probadores de carga y analizadores de conductancia para lecturas precisas de la salud de la batería.","Si el arranque es el problema, lo probamos en banco antes de condenarlo."],
    },
    bullets: { en:["Battery load & conductance testing","Alternator output test under load","Starter bench test","Parasitic draw diagnosis","Full charging circuit inspection"], es:["Prueba de carga y conductancia de batería","Prueba de salida del alternador bajo carga","Prueba de arranque en banco","Diagnóstico de descarga parásita","Inspección completa del circuito de carga"] },
  },
  "General Repair": {
    tagline: { en:"Domestic, Asian & European. We work on real cars.", es:"Domésticos, asiáticos y europeos." },
    body: {
      en: ["Safe Car handles the full range of mechanical repairs for passenger cars, SUVs, and light trucks. We don't specialize in one brand — we specialize in doing the job right.","Common requests include EVAP system repairs, catalytic converter replacement, O2 sensor service, exhaust work, and AC recharge and leak repair.","We're a bilingual shop — English and Spanish — which means no communication gap when explaining what we found."],
      es: ["Safe Car maneja la gama completa de reparaciones mecánicas para autos de pasajeros, SUVs y camionetas ligeras.","Las solicitudes comunes incluyen reparaciones del sistema EVAP, reemplazo de convertidor catalítico, servicio de sensor O2, trabajo de escape y reparación de AC.","Somos un taller bilingüe — inglés y español — sin brecha de comunicación."],
    },
    bullets: { en:["EVAP & emissions repair","AC service & leak repair","Exhaust system repair","O2 sensor & catalytic converter","Bilingual service — EN / ES","Domestic, Asian & European vehicles"], es:["Reparación EVAP y emisiones","Servicio y reparación de fugas de AC","Reparación del sistema de escape","Sensor O2 y convertidor catalítico","Servicio bilingüe — EN / ES","Vehículos domésticos, asiáticos y europeos"] },
  },
};

// ── ALL keyframes in ONE place — fixes hydration mismatch ─────
const GLOBAL_KEYFRAMES = `
  .svcSvg { width: 100%; height: 100%; }
  .bolt{animation:boltFlash 1.4s ease-in-out infinite;transform-origin:32px 32px}
  .arc1{animation:arcPulse 1.4s ease-in-out infinite 0.1s;stroke-dasharray:40;stroke-dashoffset:40}
  .arc2{animation:arcPulse 1.4s ease-in-out infinite 0.3s;stroke-dasharray:40;stroke-dashoffset:40}
  @keyframes boltFlash{0%,100%{opacity:1;filter:drop-shadow(0 0 2px #d91f26)}50%{opacity:.3;filter:drop-shadow(0 0 12px #d91f26)}}
  @keyframes arcPulse{0%,100%{stroke-dashoffset:40;opacity:0}50%{stroke-dashoffset:0;opacity:1}}
  .wheel{animation:wheelSpin 2.5s linear infinite;transform-origin:32px 32px}
  .caliper{animation:caliperSqueeze 2.5s ease-in-out infinite;transform-origin:10px 32px}
  @keyframes wheelSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes caliperSqueeze{0%,100%{transform:scaleX(1)}50%{transform:scaleX(1.08)}}
  .needle{animation:needleSweep 2s ease-in-out infinite;transform-origin:32px 40px}
  .glow{animation:glowPulse 2s ease-in-out infinite}
  @keyframes needleSweep{0%{transform:rotate(-80deg)}70%{transform:rotate(80deg)}100%{transform:rotate(-80deg)}}
  @keyframes glowPulse{0%,100%{opacity:.3}70%{opacity:1}}
  .g1{animation:gR 3s linear infinite;transform-origin:22px 26px}
  .g2{animation:gL 3s linear infinite;transform-origin:42px 38px}
  @keyframes gR{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes gL{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
  .bar{animation:barFill 2s ease-in-out infinite}
  .zap2{animation:zapShow 2s ease-in-out infinite .6s;transform-origin:32px 36px}
  @keyframes barFill{0%,100%{stroke-dashoffset:120}70%{stroke-dashoffset:0}}
  @keyframes zapShow{0%,39%,100%{opacity:0;transform:scale(.6)}50%,89%{opacity:1;transform:scale(1)}}
  .wr{animation:wrTurn 2s ease-in-out infinite;transform-origin:42px 20px}
  .sp1{animation:spFly 2s ease-in-out infinite .7s}
  .sp2{animation:spFly 2s ease-in-out infinite 1s}
  .sp3{animation:spFly 2s ease-in-out infinite 1.3s}
  @keyframes wrTurn{0%,100%{transform:rotate(-20deg)}50%{transform:rotate(20deg)}}
  @keyframes spFly{0%,100%{opacity:0;transform:translate(0,0) scale(0)}60%{opacity:1;transform:translate(6px,-6px) scale(1)}}
`;

// ── Icons — NO inline <style> tags (moved to GLOBAL_KEYFRAMES) ─
const AnimatedIcons: Record<string, React.ReactNode> = {
  "Electrical Diagnostics": (
    <svg viewBox="0 0 64 64" fill="none" className="svcSvg">
      <path className="bolt" d="M38 8L22 34h14l-8 22 24-32H36L42 8z" stroke="#d91f26" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path className="arc1" d="M12 32 Q6 26 12 20" stroke="#d91f26" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path className="arc2" d="M52 32 Q58 26 52 20" stroke="#d91f26" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  "Brake & Suspension": (
    <svg viewBox="0 0 64 64" fill="none" className="svcSvg">
      <g className="wheel">
        <circle cx="32" cy="32" r="22" stroke="rgba(255,255,255,.25)" strokeWidth="2"/>
        <circle cx="32" cy="32" r="8" stroke="rgba(255,255,255,.5)" strokeWidth="2.5"/>
        {[0,45,90,135,180,225,270,315].map((a,i)=>(
          <line key={i} x1="32" y1="10" x2="32" y2="18" stroke="rgba(255,255,255,.3)" strokeWidth="2" transform={`rotate(${a} 32 32)`} strokeLinecap="round"/>
        ))}
      </g>
      <g className="caliper">
        <path d="M8 22 L8 42 Q4 32 8 22z" fill="#d91f26" opacity=".8"/>
        <rect x="6" y="24" width="6" height="16" rx="2" fill="#d91f26" opacity=".6"/>
      </g>
    </svg>
  ),
  "Engine & Maintenance": (
    <svg viewBox="0 0 64 64" fill="none" className="svcSvg">
      <path d="M10 46 A26 26 0 0 1 54 46" stroke="rgba(255,255,255,.15)" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path className="glow" d="M10 46 A26 26 0 0 1 54 46" stroke="#d91f26" strokeWidth="3" strokeLinecap="round" fill="none" strokeDasharray="80" strokeDashoffset="0"/>
      {[[-28,14],[0,6],[28,14]].map(([dx,dy],i)=>(
        <line key={i} x1={32+(dx as number)} y1={46-(dy as number)} x2={32+(dx as number)*.7} y2={46-(dy as number)*.7} stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinecap="round"/>
      ))}
      <g className="needle">
        <line x1="32" y1="40" x2="32" y2="16" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="32" cy="40" r="4" fill="#d91f26"/>
      </g>
    </svg>
  ),
  "Parts & Components": (
    <svg viewBox="0 0 64 64" fill="none" className="svcSvg">
      <g className="g1">
        <circle cx="22" cy="26" r="11" stroke="rgba(255,255,255,.5)" strokeWidth="2" fill="none"/>
        <circle cx="22" cy="26" r="4" fill="rgba(255,255,255,.2)"/>
        {[0,45,90,135,180,225,270,315].map((a,i)=>(
          <rect key={i} x="20" y="13" width="4" height="5" fill="rgba(255,255,255,.4)" rx="1.5" transform={`rotate(${a} 22 26)`}/>
        ))}
      </g>
      <g className="g2">
        <circle cx="42" cy="38" r="8" stroke="#d91f26" strokeWidth="2" fill="none"/>
        <circle cx="42" cy="38" r="3" fill="rgba(217,31,38,.3)"/>
        {[0,60,120,180,240,300].map((a,i)=>(
          <rect key={i} x="40" y="28" width="4" height="4" fill="#d91f26" rx="1.5" transform={`rotate(${a} 42 38)`} opacity=".8"/>
        ))}
      </g>
    </svg>
  ),
  "Starting & Charging": (
    <svg viewBox="0 0 64 64" fill="none" className="svcSvg">
      <rect x="10" y="22" width="44" height="26" rx="4" stroke="rgba(255,255,255,.4)" strokeWidth="2" fill="none"/>
      <rect x="10" y="22" width="44" height="26" rx="4" stroke="#d91f26" strokeWidth="2" fill="none" strokeDasharray="140" className="bar"/>
      <rect x="23" y="16" width="8" height="6" rx="1.5" fill="rgba(255,255,255,.3)"/>
      <rect x="33" y="16" width="8" height="6" rx="1.5" fill="rgba(255,255,255,.3)"/>
      <path className="zap2" d="M34 26l-8 10h7l-4 10 11-14h-8l5-6z" fill="#d91f26"/>
    </svg>
  ),
  "General Repair": (
    <svg viewBox="0 0 64 64" fill="none" className="svcSvg">
      <g className="wr">
        <path d="M36 28 L18 50" stroke="rgba(255,255,255,.8)" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="42" cy="20" r="9" stroke="rgba(255,255,255,.5)" strokeWidth="2" fill="none"/>
        <circle cx="42" cy="20" r="3.5" fill="rgba(255,255,255,.3)"/>
      </g>
      <circle className="sp1" cx="26" cy="38" r="2" fill="#d91f26"/>
      <circle className="sp2" cx="22" cy="44" r="1.5" fill="#d91f26"/>
      <circle className="sp3" cx="28" cy="42" r="1" fill="#ff6060"/>
    </svg>
  ),
};

// ── Card3D — identical to ServicesGrid ───────────────────────
function Card3D({ title, text, index, onClick }: {
  title: string; text: string; index: number; onClick: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => el.classList.add("svcCardVisible"), index * 80);
        obs.disconnect();
      }
    }, { threshold: 0.1 });
    obs.observe(el);

    const applyTilt = (dx: number, dy: number, intensity: number) => {
      el.style.transform = `perspective(700px) rotateX(${-dy * intensity}deg) rotateY(${dx * intensity}deg) scale3d(1.04,1.04,1.04)`;
      el.style.setProperty("--mx", `${((dx + 1) / 2) * 100}%`);
      el.style.setProperty("--my", `${((dy + 1) / 2) * 100}%`);
    };
    const resetTilt = () => {
      el.style.transform = "perspective(700px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
      el.style.setProperty("--mx", "50%");
      el.style.setProperty("--my", "50%");
    };
    const onMouseMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      applyTilt((e.clientX-(r.left+r.width/2))/(r.width/2),(e.clientY-(r.top+r.height/2))/(r.height/2),14);
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]; const r = el.getBoundingClientRect();
      applyTilt((t.clientX-(r.left+r.width/2))/(r.width/2),(t.clientY-(r.top+r.height/2))/(r.height/2),8);
    };
    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", resetTilt);
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", resetTilt);
    el.addEventListener("touchcancel", resetTilt);
    return () => {
      obs.disconnect();
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", resetTilt);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", resetTilt);
      el.removeEventListener("touchcancel", resetTilt);
    };
  }, [index]);

  return (
    <article
      ref={cardRef}
      className="svcCard svcCardPage"
      onClick={onClick}
      onKeyDown={(e) => { if (e.key==="Enter"||e.key===" ") onClick(); }}
      tabIndex={0}
      role="button"
      aria-label={`Learn more about ${title}`}
    >
      <div className="svcShine"/>
      <div className="svcHalo"/>
      <div className="svcIconWrap">
        {AnimatedIcons[title] ?? (
          <svg viewBox="0 0 64 64" fill="none" className="svcSvg">
            <circle cx="32" cy="32" r="22" stroke="rgba(255,255,255,.4)" strokeWidth="2" fill="none"/>
          </svg>
        )}
      </div>
      <h3 className="svcCardTitle">{title}</h3>
      <p className="svcCardDesc">{text}</p>
      <div className="svcLearnMore">Learn more <span className="svcArrow">→</span></div>
    </article>
  );
}

// ── Detail modal ─────────────────────────────────────────────
function DetailModal({ title, lang, onClose, included, bookLabel }: {
  title: string; lang: string; onClose: () => void;
  included: string; bookLabel: string;
}) {
  const l = lang as "en"|"es";
  const d = serviceDetails[title];
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => panelRef.current?.classList.add("siModalOpen"));
    const onKey = (e: KeyboardEvent) => { if (e.key==="Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!d) return null;

  return (
    <div className="siOverlay" onClick={(e) => { if (e.target===e.currentTarget) onClose(); }} role="dialog" aria-modal="true">
      <div ref={panelRef} className="siModal">
        <div className="siModalHeader">
          <div className="siModalGrid"/>
          <div className="siModalGlow"/>
          <button className="siModalClose" onClick={onClose} aria-label="Close">✕</button>
          <div className="siModalHeaderContent">
            <div className="siModalIcon">{AnimatedIcons[title] ?? null}</div>
            <div>
              <div className="siModalTagline">{d.tagline[l].toUpperCase()}</div>
              <h2 className="siModalTitle">{title}</h2>
            </div>
          </div>
        </div>
        <div className="siModalBody">
          {d.body[l].map((p,i) => <p key={i} className="siModalPara">{p}</p>)}
          <div className="siModalIncluded">{included}</div>
          <ul className="siModalBullets">
            {d.bullets[l].map((b,i) => (
              <li key={i} className="siModalBullet"><span className="siBulletDot"/>{b}</li>
            ))}
          </ul>
          <a href="/contact" className="siModalCta">{bookLabel}</a>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────
export default function ServicesPage() {
  const { lang } = useLang();
  const t = pageText[lang as keyof typeof pageText] ?? pageText.en;
  const [active, setActive] = useState<string|null>(null);

  return (
    <>
      {/* Single style block — all keyframes here, NO inline style in SVGs */}
      <style suppressHydrationWarning>{`
        ${GLOBAL_KEYFRAMES}

        /* Hero — padding-top fixes navbar overlap */
        .siPageHero{
          padding:40px 0 72px;
          background:#0a0a0c;
          border-bottom:1px solid rgba(255,255,255,.07);
          position:relative;overflow:hidden;
        }
        .siPageHero::before{
          content:'';position:absolute;inset:0;pointer-events:none;
          background-image:
            linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),
            linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px);
          background-size:48px 48px;
        }
        .siPageHeroInner{position:relative;z-index:1;text-align:center}
        .siPageEyebrow{
          display:inline-flex;align-items:center;justify-content:center;gap:10px;
          font-size:11px;font-weight:700;letter-spacing:2.5px;
          color:#d97706;text-transform:uppercase;margin-bottom:16px;
        }
        .siPageEyebrow::before,.siPageEyebrow::after{
          content:'';width:28px;height:1px;background:currentColor;display:inline-block;
        }
        .siPageTitle{
          font-size:clamp(2.6rem,7vw,4.5rem);font-weight:900;
          color:#f0f1f3;letter-spacing:-.03em;line-height:1.05;margin-bottom:16px;
        }
        .siPageSub{
          font-size:1.05rem;color:rgba(255,255,255,.45);
          max-width:520px;line-height:1.65;margin:0 auto;
        }

        /* Grid section */
        .siPageSection{padding:72px 0 96px;background:#07080b}
        .svcGridPage{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:20px;
        }
        @media(max-width:900px){.svcGridPage{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:560px){.svcGridPage{grid-template-columns:1fr}}

        /* Card page extras */
        .svcCardPage{cursor:pointer}
        .svcCardPage:hover{
          border-color:rgba(217,31,38,.35) !important;
          box-shadow:0 8px 40px rgba(217,31,38,.1) !important;
        }
        .svcCardPage:focus-visible{outline:2px solid #d91f26;outline-offset:4px}
        .svcLearnMore{
          display:flex;align-items:center;gap:6px;margin-top:14px;
          font-size:.78rem;font-weight:700;letter-spacing:.8px;
          text-transform:uppercase;color:#d91f26;
        }
        .svcArrow{display:inline-block;transition:transform .2s}
        .svcCardPage:hover .svcArrow{transform:translateX(5px)}

        /* Overlay */
        .siOverlay{
          position:fixed;inset:0;z-index:9999;
          background:rgba(0,0,0,.78);
          display:flex;align-items:center;justify-content:center;
          padding:16px;
          animation:siOvIn .2s ease;
        }
        @keyframes siOvIn{from{opacity:0}to{opacity:1}}

        /* Modal */
        .siModal{
          background:#111315;border:1px solid rgba(255,255,255,.1);
          border-radius:20px;width:100%;max-width:640px;
          max-height:88vh;overflow-y:auto;
          opacity:0;transform:translateY(20px) scale(.97);
          transition:opacity .25s ease,transform .25s ease;
        }
        .siModalOpen{opacity:1 !important;transform:translateY(0) scale(1) !important}
        .siModal::-webkit-scrollbar{width:4px}
        .siModal::-webkit-scrollbar-track{background:transparent}
        .siModal::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:2px}

        .siModalHeader{
          position:relative;background:#0d0e10;
          padding:44px 28px 28px;
          border-bottom:1px solid rgba(255,255,255,.07);
          overflow:hidden;min-height:170px;
          display:flex;flex-direction:column;justify-content:flex-end;
        }
        .siModalGrid{
          position:absolute;inset:0;pointer-events:none;
          background-image:
            linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),
            linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);
          background-size:36px 36px;
        }
        .siModalGlow{
          position:absolute;top:-60px;right:-60px;
          width:240px;height:240px;border-radius:50%;pointer-events:none;
          background:radial-gradient(circle,rgba(217,31,38,.14),transparent 70%);
        }
        .siModalClose{
          position:absolute;top:16px;right:16px;
          width:34px;height:34px;border-radius:50%;
          background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);
          color:rgba(255,255,255,.6);font-size:13px;cursor:pointer;
          display:flex;align-items:center;justify-content:center;
          transition:background .2s,color .2s;z-index:2;
        }
        .siModalClose:hover{background:rgba(217,31,38,.6);color:#fff}
        .siModalHeaderContent{
          position:relative;z-index:1;display:flex;align-items:flex-end;gap:16px;
        }
        .siModalIcon{width:52px;height:52px;flex-shrink:0}
        .siModalTagline{font-size:.7rem;font-weight:700;letter-spacing:2px;color:#d91f26;margin-bottom:5px}
        .siModalTitle{font-size:1.75rem;font-weight:900;color:#f0f1f3;line-height:1.1;letter-spacing:-.02em}
        .siModalBody{padding:24px 28px 32px}
        .siModalPara{font-size:.915rem;color:rgba(255,255,255,.6);line-height:1.8;margin-bottom:14px}
        .siModalIncluded{
          font-size:.68rem;font-weight:800;letter-spacing:2px;
          color:rgba(255,255,255,.3);text-transform:uppercase;
          margin:22px 0 12px;padding-top:22px;
          border-top:1px solid rgba(255,255,255,.06);
        }
        .siModalBullets{
          list-style:none;padding:0;margin:0 0 28px;
          display:grid;grid-template-columns:1fr 1fr;gap:8px;
        }
        @media(max-width:480px){.siModalBullets{grid-template-columns:1fr}}
        .siModalBullet{
          display:flex;align-items:center;gap:10px;
          font-size:.84rem;color:rgba(255,255,255,.7);font-weight:500;
          background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);
          border-radius:8px;padding:9px 12px;
        }
        .siBulletDot{width:6px;height:6px;border-radius:50%;background:#d91f26;flex-shrink:0}
        .siModalCta{
          display:block;width:100%;padding:15px;
          background:#d91f26;color:#fff;font-size:.78rem;font-weight:900;
          letter-spacing:1.5px;text-transform:uppercase;text-align:center;
          border-radius:10px;text-decoration:none;
          transition:background .2s,transform .1s;
        }
        .siModalCta:hover{background:#bc181f;transform:translateY(-1px)}
      `}</style>

      {/* Hero — innerPage adds padding-top:180px that clears the fixed navbar */}
      <main className="innerPage" style={{paddingBottom:0,background:"transparent"}}>
        <section className="siPageHero">
          <div className="container siPageHeroInner">
            <div className="siPageEyebrow">{t.eyebrow}</div>
            <h1 className="siPageTitle">{t.title}</h1>
            <p className="siPageSub">{t.sub}</p>
          </div>
        </section>
      </main>

      {/* Grid */}
      <section className="siPageSection">
        <div className="container">
          <div className="svcGridPage">
            {services.map((item, i) => (
              <Card3D
                key={item.title}
                title={item.title}
                text={item.text}
                index={i}
                onClick={() => setActive(item.title)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      {active && (
        <DetailModal
          title={active}
          lang={lang}
          onClose={() => setActive(null)}
          included={t.included}
          bookLabel={t.book}
        />
      )}
    </>
  );
}