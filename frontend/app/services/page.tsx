"use client";

import { useRef, useEffect, useState } from "react";
import { useLang } from "@/context/LangContext";

const servicesData = {
  en: [
    {
      id: "electrical",
      title: "Electrical Diagnostics",
      tagline: "Find it right. Fix it once.",
      short: "Check engine light, wiring faults, charging system issues and hard-to-find electrical problems.",
      body: [
        "Modern vehicles rely on dozens of sensors and control modules communicating across multiple bus networks. A single faulty ground or degraded connector can produce misleading codes pointing to the wrong system entirely.",
        "We use professional-grade scan tools and oscilloscopes to trace signals at the source — not just read codes. That means we find intermittent faults, CAN-bus communication errors, and wiring shorts that other shops miss.",
        "Every diagnostic starts with a full system scan across all modules, followed by a clear written estimate before any repair begins.",
      ],
      bullets: ["Full module scan across all systems","Oscilloscope signal tracing","Intermittent fault diagnosis","Charging & starting system tests","Wiring repair & harness work"],
    },
    {
      id: "brakes",
      title: "Brake & Suspension",
      tagline: "Stop right. Handle right.",
      short: "Brake inspections, pads, rotors, steering and suspension work for daily drivers.",
      body: [
        "Brakes and suspension work together — worn shocks change how weight transfers under braking, meaning a brake problem and a suspension problem can look identical from the driver's seat.",
        "We inspect the full corner: caliper operation, rotor condition, pad thickness, wheel bearing play, and suspension geometry. You get a clear picture of what's safety-critical now versus what can wait.",
        "All brake work uses quality parts with a minimum 12-month warranty on labor. Rotor replacement comes with a brake bed-in procedure and test drive.",
      ],
      bullets: ["Brake pad & rotor replacement","Caliper service & replacement","Wheel bearing inspection & replacement","Shock & strut replacement","Steering linkage & alignment check"],
    },
    {
      id: "engine",
      title: "Engine & Maintenance",
      tagline: "Keep it running right.",
      short: "Oil changes, tune-ups, cooling systems, filters, batteries and scheduled maintenance.",
      body: [
        "Scheduled maintenance is the cheapest repair you'll ever do. We follow manufacturer intervals using quality fluids and filters, and we flag developing issues before they become expensive failures.",
        "Beyond routine service, we handle cooling system repairs, timing belts and chains, valve cover gaskets, intake manifold work, and fuel system service. Domestic, Asian, and European platforms.",
        "We keep a service history on file for every customer — so at your next visit we know what was done, what's coming due, and what to watch.",
      ],
      bullets: ["Oil & filter service","Spark plug & ignition tune-up","Timing belt / chain replacement","Cooling system flush & repair","Fuel system service","Battery replacement & testing"],
    },
    {
      id: "parts",
      title: "Parts & Components",
      tagline: "Right part. Right fit. No guessing.",
      short: "Quality repair parts and practical service options, not vague promises.",
      body: [
        "We source parts from OEM suppliers and trusted aftermarket brands — the same lines used by dealerships and independent specialists. We don't use the cheapest part available; we use the part that will still be working two years from now.",
        "For customers who supply their own parts, we'll install them with standard labor rates. We're upfront about warranty terms in that case — labor warranty applies, parts warranty is between you and your supplier.",
        "Common wear items for popular domestic and Asian platforms are kept in stock for same-day turnaround.",
      ],
      bullets: ["OEM-equivalent parts sourcing","Customer-supplied parts installation","Same-day stock for common repairs","Warranty on all parts we supply","Transparent part pricing before approval"],
    },
    {
      id: "starting",
      title: "Starting & Charging",
      tagline: "Dead battery? We trace it to the source.",
      short: "Battery, alternator and starter testing with clear repair recommendations.",
      body: [
        "A dead battery is rarely just a dead battery. Parasitic draws, a failing alternator, or a corroded charging circuit will kill a new battery in weeks. We test the full system before recommending any replacement.",
        "We use carbon-pile load testers and conductance analyzers to give accurate battery health readings — not just voltage checks. Alternator output is tested under load at multiple RPM points.",
        "If the starter is the problem, we bench-test before condemning it. A starter that spins fine off the car but won't engage usually means a flywheel ring gear issue — not a starter.",
      ],
      bullets: ["Battery load & conductance testing","Alternator output test under load","Starter bench test","Parasitic draw diagnosis","Full charging circuit inspection"],
    },
    {
      id: "general",
      title: "General Repair",
      tagline: "Domestic, Asian & European. We work on real cars.",
      short: "Domestic, Asian and European vehicle repair for real-world local customers.",
      body: [
        "Safe Car handles the full range of mechanical repairs for passenger cars, SUVs, and light trucks. We don't specialize in one brand — we specialize in doing the job right regardless of what's in the bay.",
        "Common requests include EVAP system repairs, catalytic converter replacement, O2 sensor service, exhaust work, AC recharge and leak repair, and door/window mechanism fixes.",
        "We're a bilingual shop — English and Spanish — which means no communication gap when explaining what we found and what it will take to fix it.",
      ],
      bullets: ["EVAP & emissions repair","AC service & leak repair","Exhaust system repair","O2 sensor & catalytic converter","Bilingual service — EN / ES","Domestic, Asian & European vehicles"],
    },
  ],
  es: [
    {
      id: "electrical",
      title: "Diagnóstico Eléctrico",
      tagline: "Encuéntralo bien. Repáralo una vez.",
      short: "Luz de check engine, fallas de cableado, problemas del sistema de carga y fallas eléctricas difíciles de encontrar.",
      body: [
        "Los vehículos modernos dependen de docenas de sensores y módulos de control que se comunican a través de múltiples redes. Un solo tierra defectuoso o un conector deteriorado puede producir códigos engañosos que apuntan al sistema equivocado.",
        "Usamos herramientas de diagnóstico profesionales y osciloscopios para rastrear señales en la fuente, no solo leer códigos. Eso significa que encontramos fallas intermitentes y errores de comunicación que otros talleres pasan por alto.",
        "Cada diagnóstico comienza con un escaneo completo del sistema en todos los módulos, seguido de un estimado escrito claro antes de comenzar cualquier reparación.",
      ],
      bullets: ["Escaneo completo de todos los módulos","Rastreo de señales con osciloscopio","Diagnóstico de fallas intermitentes","Pruebas del sistema de carga y arranque","Reparación de cableado y arneses"],
    },
    {
      id: "brakes",
      title: "Frenos y Suspensión",
      tagline: "Frena bien. Maneja bien.",
      short: "Inspecciones de frenos, pastillas, rotores, dirección y trabajo de suspensión para conductores diarios.",
      body: [
        "Los frenos y la suspensión trabajan juntos — los amortiguadores desgastados cambian cómo se transfiere el peso al frenar, lo que significa que un problema de frenos y uno de suspensión pueden verse idénticos desde el asiento del conductor.",
        "Inspeccionamos la esquina completa: operación del calibrador, condición del rotor, grosor de la pastilla, juego del rodamiento y geometría de suspensión.",
        "Todo el trabajo de frenos usa piezas de calidad con garantía mínima de 12 meses en mano de obra. El reemplazo de rotores incluye procedimiento de rodaje y prueba de manejo.",
      ],
      bullets: ["Reemplazo de pastillas y rotores","Servicio y reemplazo de calibradores","Inspección y reemplazo de rodamientos","Reemplazo de amortiguadores y resortes","Revisión de dirección y alineación"],
    },
    {
      id: "engine",
      title: "Motor y Mantenimiento",
      tagline: "Mantenlo funcionando bien.",
      short: "Cambios de aceite, afinaciones, sistemas de enfriamiento, filtros, baterías y mantenimiento programado.",
      body: [
        "El mantenimiento programado es la reparación más barata que harás. Seguimos los intervalos del fabricante usando fluidos y filtros de calidad, y señalamos problemas en desarrollo antes de que se conviertan en fallas costosas.",
        "Más allá del servicio de rutina, manejamos reparaciones del sistema de enfriamiento, correas y cadenas de distribución, juntas de tapa de válvulas y servicio del sistema de combustible.",
        "Mantenemos un historial de servicio para cada cliente, para que en tu próxima visita sepamos qué se hizo, qué vence pronto y qué vigilar.",
      ],
      bullets: ["Servicio de aceite y filtro","Afinación de bujías e ignición","Reemplazo de correa/cadena de distribución","Flush y reparación del sistema de enfriamiento","Servicio del sistema de combustible","Reemplazo y prueba de batería"],
    },
    {
      id: "parts",
      title: "Piezas y Componentes",
      tagline: "La pieza correcta. Sin adivinar.",
      short: "Piezas de reparación de calidad y opciones de servicio prácticas, sin promesas vagas.",
      body: [
        "Obtenemos piezas de proveedores OEM y marcas aftermarket de confianza — las mismas líneas utilizadas por concesionarios y especialistas independientes.",
        "Para clientes que suministran sus propias piezas, las instalamos con tarifas de mano de obra estándar. Somos transparentes sobre los términos de garantía en ese caso.",
        "Los artículos de desgaste comunes para plataformas domésticas y asiáticas populares se mantienen en stock para entrega el mismo día.",
      ],
      bullets: ["Abastecimiento de piezas equivalentes OEM","Instalación de piezas del cliente","Stock el mismo día para reparaciones comunes","Garantía en todas las piezas que suministramos","Precios transparentes antes de la aprobación"],
    },
    {
      id: "starting",
      title: "Arranque y Carga",
      tagline: "¿Batería muerta? Rastreamos la causa.",
      short: "Pruebas de batería, alternador y arranque con recomendaciones de reparación claras.",
      body: [
        "Una batería muerta rara vez es solo una batería muerta. Las cargas parásitas, un alternador defectuoso o un circuito de carga corroído matarán una batería nueva en semanas.",
        "Usamos probadores de carga y analizadores de conductancia para lecturas precisas de la salud de la batería, no solo verificaciones de voltaje. La salida del alternador se prueba bajo carga en múltiples puntos de RPM.",
        "Si el arranque es el problema, lo probamos en banco antes de condenarlo. Un arranque que gira bien fuera del auto pero no engancha generalmente indica un problema con el engranaje del volante.",
      ],
      bullets: ["Prueba de carga y conductancia de batería","Prueba de salida del alternador bajo carga","Prueba de arranque en banco","Diagnóstico de descarga parásita","Inspección completa del circuito de carga"],
    },
    {
      id: "general",
      title: "Reparación General",
      tagline: "Domésticos, asiáticos y europeos.",
      short: "Reparación de vehículos domésticos, asiáticos y europeos para clientes locales.",
      body: [
        "Safe Car maneja la gama completa de reparaciones mecánicas para autos de pasajeros, SUVs y camionetas ligeras. No nos especializamos en una marca — nos especializamos en hacer el trabajo bien.",
        "Las solicitudes comunes incluyen reparaciones del sistema EVAP, reemplazo de convertidor catalítico, servicio de sensor O2, trabajo de escape y reparación de AC.",
        "Somos un taller bilingüe — inglés y español — lo que significa sin brecha de comunicación al explicar lo que encontramos.",
      ],
      bullets: ["Reparación EVAP y emisiones","Servicio y reparación de fugas de AC","Reparación del sistema de escape","Sensor O2 y convertidor catalítico","Servicio bilingüe — EN / ES","Vehículos domésticos, asiáticos y europeos"],
    },
  ],
};

const AnimatedIcons: Record<string, React.ReactNode> = {
  "Electrical Diagnostics": (
    <svg viewBox="0 0 64 64" fill="none" style={{width:"100%",height:"100%"}}>
      <style>{`.siBolt{animation:siBoltFlash 1.4s ease-in-out infinite}.siArc1{animation:siArcP 1.4s ease-in-out infinite 0.1s;stroke-dasharray:40;stroke-dashoffset:40}.siArc2{animation:siArcP 1.4s ease-in-out infinite 0.3s;stroke-dasharray:40;stroke-dashoffset:40}@keyframes siBoltFlash{0%,100%{opacity:1}50%{opacity:.3}}@keyframes siArcP{0%,100%{stroke-dashoffset:40;opacity:0}50%{stroke-dashoffset:0;opacity:1}}`}</style>
      <path className="siBolt" d="M38 8L22 34h14l-8 22 24-32H36L42 8z" stroke="#d91f26" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path className="siArc1" d="M12 32 Q6 26 12 20" stroke="#d91f26" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path className="siArc2" d="M52 32 Q58 26 52 20" stroke="#d91f26" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  "Diagnóstico Eléctrico": (
    <svg viewBox="0 0 64 64" fill="none" style={{width:"100%",height:"100%"}}>
      <style>{`.siBolt2{animation:siBoltFlash2 1.4s ease-in-out infinite}@keyframes siBoltFlash2{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
      <path className="siBolt2" d="M38 8L22 34h14l-8 22 24-32H36L42 8z" stroke="#d91f26" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  "Brake & Suspension": (
    <svg viewBox="0 0 64 64" fill="none" style={{width:"100%",height:"100%"}}>
      <style>{`.siWheel{animation:siWheelSpin 2.5s linear infinite;transform-origin:32px 32px}@keyframes siWheelSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <g className="siWheel">
        <circle cx="32" cy="32" r="22" stroke="rgba(255,255,255,.25)" strokeWidth="2"/>
        <circle cx="32" cy="32" r="8" stroke="rgba(255,255,255,.5)" strokeWidth="2.5"/>
        {[0,45,90,135,180,225,270,315].map((a,i)=>(
          <line key={i} x1="32" y1="10" x2="32" y2="18" stroke="rgba(255,255,255,.3)" strokeWidth="2" transform={`rotate(${a} 32 32)`} strokeLinecap="round"/>
        ))}
      </g>
    </svg>
  ),
  "Frenos y Suspensión": (
    <svg viewBox="0 0 64 64" fill="none" style={{width:"100%",height:"100%"}}>
      <style>{`.siWheel3{animation:siWheelSpin3 2.5s linear infinite;transform-origin:32px 32px}@keyframes siWheelSpin3{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <g className="siWheel3">
        <circle cx="32" cy="32" r="22" stroke="rgba(255,255,255,.25)" strokeWidth="2"/>
        <circle cx="32" cy="32" r="8" stroke="rgba(255,255,255,.5)" strokeWidth="2.5"/>
      </g>
    </svg>
  ),
  "Engine & Maintenance": (
    <svg viewBox="0 0 64 64" fill="none" style={{width:"100%",height:"100%"}}>
      <style>{`.siNeedle{animation:siNeedleSweep 2s ease-in-out infinite;transform-origin:32px 40px}@keyframes siNeedleSweep{0%{transform:rotate(-80deg)}70%{transform:rotate(80deg)}100%{transform:rotate(-80deg)}}`}</style>
      <path d="M10 46 A26 26 0 0 1 54 46" stroke="rgba(255,255,255,.15)" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M10 46 A26 26 0 0 1 54 46" stroke="#d91f26" strokeWidth="3" strokeLinecap="round" fill="none" strokeOpacity=".6"/>
      <g className="siNeedle">
        <line x1="32" y1="40" x2="32" y2="16" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="32" cy="40" r="4" fill="#d91f26"/>
      </g>
    </svg>
  ),
  "Motor y Mantenimiento": (
    <svg viewBox="0 0 64 64" fill="none" style={{width:"100%",height:"100%"}}>
      <path d="M10 46 A26 26 0 0 1 54 46" stroke="rgba(255,255,255,.15)" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M10 46 A26 26 0 0 1 54 46" stroke="#d91f26" strokeWidth="3" strokeLinecap="round" fill="none" strokeOpacity=".6"/>
      <circle cx="32" cy="40" r="4" fill="#d91f26"/>
    </svg>
  ),
  "Parts & Components": (
    <svg viewBox="0 0 64 64" fill="none" style={{width:"100%",height:"100%"}}>
      <style>{`.siG1{animation:siGR 3s linear infinite;transform-origin:22px 26px}.siG2{animation:siGL 3s linear infinite;transform-origin:42px 38px}@keyframes siGR{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes siGL{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}`}</style>
      <g className="siG1">
        <circle cx="22" cy="26" r="11" stroke="rgba(255,255,255,.5)" strokeWidth="2" fill="none"/>
        <circle cx="22" cy="26" r="4" fill="rgba(255,255,255,.2)"/>
      </g>
      <g className="siG2">
        <circle cx="42" cy="38" r="8" stroke="#d91f26" strokeWidth="2" fill="none"/>
        <circle cx="42" cy="38" r="3" fill="rgba(217,31,38,.3)"/>
      </g>
    </svg>
  ),
  "Piezas y Componentes": (
    <svg viewBox="0 0 64 64" fill="none" style={{width:"100%",height:"100%"}}>
      <circle cx="22" cy="26" r="11" stroke="rgba(255,255,255,.5)" strokeWidth="2" fill="none"/>
      <circle cx="42" cy="38" r="8" stroke="#d91f26" strokeWidth="2" fill="none"/>
    </svg>
  ),
  "Starting & Charging": (
    <svg viewBox="0 0 64 64" fill="none" style={{width:"100%",height:"100%"}}>
      <style>{`.siBar{animation:siBarFill 2s ease-in-out infinite}@keyframes siBarFill{0%,100%{stroke-dashoffset:120}70%{stroke-dashoffset:0}}`}</style>
      <rect x="10" y="22" width="44" height="26" rx="4" stroke="rgba(255,255,255,.4)" strokeWidth="2" fill="none"/>
      <rect x="10" y="22" width="44" height="26" rx="4" stroke="#d91f26" strokeWidth="2" fill="none" strokeDasharray="140" className="siBar"/>
      <rect x="23" y="16" width="8" height="6" rx="1.5" fill="rgba(255,255,255,.3)"/>
      <rect x="33" y="16" width="8" height="6" rx="1.5" fill="rgba(255,255,255,.3)"/>
    </svg>
  ),
  "Arranque y Carga": (
    <svg viewBox="0 0 64 64" fill="none" style={{width:"100%",height:"100%"}}>
      <rect x="10" y="22" width="44" height="26" rx="4" stroke="rgba(255,255,255,.4)" strokeWidth="2" fill="none"/>
      <rect x="10" y="22" width="44" height="26" rx="4" stroke="#d91f26" strokeWidth="2" fill="none" strokeOpacity=".6"/>
      <rect x="23" y="16" width="8" height="6" rx="1.5" fill="rgba(255,255,255,.3)"/>
    </svg>
  ),
  "General Repair": (
    <svg viewBox="0 0 64 64" fill="none" style={{width:"100%",height:"100%"}}>
      <style>{`.siWr{animation:siWrTurn 2s ease-in-out infinite;transform-origin:42px 20px}@keyframes siWrTurn{0%,100%{transform:rotate(-20deg)}50%{transform:rotate(20deg)}}`}</style>
      <g className="siWr">
        <path d="M36 28 L18 50" stroke="rgba(255,255,255,.8)" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="42" cy="20" r="9" stroke="rgba(255,255,255,.5)" strokeWidth="2" fill="none"/>
        <circle cx="42" cy="20" r="3.5" fill="rgba(255,255,255,.3)"/>
      </g>
    </svg>
  ),
  "Reparación General": (
    <svg viewBox="0 0 64 64" fill="none" style={{width:"100%",height:"100%"}}>
      <path d="M36 28 L18 50" stroke="rgba(255,255,255,.8)" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="42" cy="20" r="9" stroke="rgba(255,255,255,.5)" strokeWidth="2" fill="none"/>
    </svg>
  ),
};

function getIcon(title: string): React.ReactNode {
  return AnimatedIcons[title] ?? (
    <svg viewBox="0 0 64 64" fill="none" style={{width:"100%",height:"100%"}}>
      <circle cx="32" cy="32" r="22" stroke="rgba(255,255,255,.3)" strokeWidth="2" fill="none"/>
      <circle cx="32" cy="32" r="8" stroke="#d91f26" strokeWidth="2.5" fill="none"/>
    </svg>
  );
}

const pageText = {
  en: { eyebrow:"Safe Car Chicago", title:"Services", sub:"Honest diagnostics. Clear estimates. Quality repair.", included:"What's included", book:"BOOK SERVICE" },
  es: { eyebrow:"Safe Car Chicago", title:"Servicios", sub:"Diagnóstico honesto. Estimados claros. Reparación de calidad.", included:"Qué incluye", book:"RESERVAR SERVICIO" },
};

// ── Detail modal ──────────────────────────────────────────────
function DetailModal({ service, onClose, included, bookLabel }: {
  service: typeof servicesData.en[0];
  onClose: () => void;
  included: string;
  bookLabel: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Lock body scroll
    document.body.style.overflow = "hidden";
    // Animate in
    const raf = requestAnimationFrame(() => {
      panelRef.current?.classList.add("siModalOpen");
    });
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="siOverlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div ref={panelRef} className="siModal">
        {/* Header — no image to avoid CSP issues, pure design header */}
        <div className="siModalHeader">
          {/* Grid texture */}
          <div className="siModalGrid" />
          {/* Glow orb */}
          <div className="siModalGlow" />

          <button className="siModalClose" onClick={onClose} aria-label="Close">✕</button>

          <div className="siModalHeaderContent">
            <div className="siModalIcon">{getIcon(service.title)}</div>
            <div>
              <div className="siModalTagline">{service.tagline.toUpperCase()}</div>
              <h2 className="siModalTitle">{service.title}</h2>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="siModalBody">
          {service.body.map((p, i) => (
            <p key={i} className="siModalPara">{p}</p>
          ))}

          <div className="siModalIncluded">{included}</div>
          <ul className="siModalBullets">
            {service.bullets.map((b, i) => (
              <li key={i} className="siModalBullet">
                <span className="siBulletDot" />
                {b}
              </li>
            ))}
          </ul>

          <a href="/contact" className="siModalCta">{bookLabel}</a>
        </div>
      </div>
    </div>
  );
}

// ── Service card ──────────────────────────────────────────────
function ServiceCard({ service, index, onClick }: {
  service: typeof servicesData.en[0];
  index: number;
  onClick: () => void;
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

    const apply = (dx: number, dy: number, k: number) => {
      el.style.transform = `perspective(700px) rotateX(${-dy*k}deg) rotateY(${dx*k}deg) scale3d(1.04,1.04,1.04)`;
      el.style.setProperty("--mx", `${((dx+1)/2)*100}%`);
      el.style.setProperty("--my", `${((dy+1)/2)*100}%`);
    };
    const reset = () => {
      el.style.transform = "perspective(700px) rotateX(0) rotateY(0) scale3d(1,1,1)";
      el.style.setProperty("--mx","50%"); el.style.setProperty("--my","50%");
    };
    const onMM = (e: MouseEvent) => { const r=el.getBoundingClientRect(); apply((e.clientX-(r.left+r.width/2))/(r.width/2),(e.clientY-(r.top+r.height/2))/(r.height/2),14); };
    const onTM = (e: TouchEvent) => { const t=e.touches[0],r=el.getBoundingClientRect(); apply((t.clientX-(r.left+r.width/2))/(r.width/2),(t.clientY-(r.top+r.height/2))/(r.height/2),8); };

    el.addEventListener("mousemove", onMM);
    el.addEventListener("mouseleave", reset);
    el.addEventListener("touchmove", onTM, { passive:true });
    el.addEventListener("touchend", reset);
    el.addEventListener("touchcancel", reset);
    return () => { obs.disconnect(); el.removeEventListener("mousemove",onMM); el.removeEventListener("mouseleave",reset); el.removeEventListener("touchmove",onTM); el.removeEventListener("touchend",reset); el.removeEventListener("touchcancel",reset); };
  }, [index]);

  return (
    <article
      ref={cardRef}
      className="svcCard svcCardClickable"
      onClick={onClick}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key==="Enter"||e.key===" ") onClick(); }}
      role="button"
      aria-label={`Learn more about ${service.title}`}
    >
      <div className="svcShine"/>
      <div className="svcHalo"/>
      <div className="svcIconWrap">{getIcon(service.title)}</div>
      <h3 className="svcCardTitle">{service.title}</h3>
      <p className="svcCardDesc">{service.short}</p>
      <div className="svcLearnMore">Learn more <span className="svcArrow">→</span></div>
    </article>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function ServicesPage() {
  const { lang } = useLang();
  const t = pageText[lang as keyof typeof pageText] ?? pageText.en;
  const services = servicesData[lang as keyof typeof servicesData] ?? servicesData.en;
  const [active, setActive] = useState<typeof servicesData.en[0] | null>(null);

  return (
    <>
      <style>{`
        /* Hero */
        .siPageHero{background:#0a0a0c;padding:80px 0 60px;border-bottom:1px solid rgba(255,255,255,.07);position:relative;overflow:hidden}
        .siPageHero::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px);background-size:48px 48px}
        .siPageHeroInner{position:relative;z-index:1}
        .siPageEyebrow{display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:700;letter-spacing:2.5px;color:#d91f26;text-transform:uppercase;margin-bottom:16px}
        .siPageEyebrow::before{content:'';width:24px;height:2px;background:#d91f26;border-radius:1px}
        .siPageTitle{font-size:clamp(2.4rem,6vw,4rem);font-weight:900;color:#f0f1f3;letter-spacing:-.03em;line-height:1.05;margin-bottom:16px}
        .siPageSub{font-size:1.05rem;color:rgba(255,255,255,.45);max-width:480px;line-height:1.65}

        /* Grid section */
        .siPageSection{padding:72px 0 96px;background:#07080b}
        .svcGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}

        /* Cards */
        .svcCard{position:relative;overflow:hidden;background:linear-gradient(135deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.01) 100%);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:32px 28px 28px;will-change:transform;opacity:0;transform:translateY(24px)}
        .svcCardVisible{opacity:1 !important;transform:translateY(0) !important;transition:opacity .5s ease,transform .5s ease}
        .svcCardClickable{cursor:pointer;transition:border-color .3s,box-shadow .3s}
        .svcCardClickable:hover{border-color:rgba(217,31,38,.35);box-shadow:0 8px 40px rgba(217,31,38,.1)}
        .svcCardClickable:focus-visible{outline:2px solid #d91f26;outline-offset:4px}
        .svcShine{position:absolute;inset:0;border-radius:16px;background:radial-gradient(circle at var(--mx,50%) var(--my,50%),rgba(255,255,255,.06) 0%,transparent 60%);pointer-events:none;opacity:0;transition:opacity .3s}
        .svcCard:hover .svcShine{opacity:1}
        .svcHalo{position:absolute;top:-40px;right:-40px;width:140px;height:140px;border-radius:50%;background:radial-gradient(circle,rgba(217,31,38,.08),transparent 70%);pointer-events:none}
        .svcIconWrap{width:56px;height:56px;margin-bottom:20px}
        .svcCardTitle{font-size:1.15rem;font-weight:800;color:#f0f1f3;margin-bottom:10px;line-height:1.2}
        .svcCardDesc{font-size:.875rem;color:rgba(255,255,255,.45);line-height:1.65;margin-bottom:16px}
        .svcLearnMore{font-size:.8rem;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#d91f26;display:flex;align-items:center;gap:6px}
        .svcArrow{transition:transform .2s;display:inline-block}
        .svcCard:hover .svcArrow{transform:translateX(4px)}

        /* Overlay */
        .siOverlay{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.78);display:flex;align-items:center;justify-content:center;padding:16px;animation:siOverlayIn .2s ease}
        @keyframes siOverlayIn{from{opacity:0}to{opacity:1}}

        /* Modal */
        .siModal{background:#111315;border:1px solid rgba(255,255,255,.1);border-radius:20px;width:100%;max-width:640px;max-height:88vh;overflow-y:auto;opacity:0;transform:translateY(20px) scale(.97);transition:opacity .25s ease,transform .25s ease;flex-shrink:0}
        .siModalOpen{opacity:1 !important;transform:translateY(0) scale(1) !important}
        .siModal::-webkit-scrollbar{width:4px}
        .siModal::-webkit-scrollbar-track{background:transparent}
        .siModal::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:2px}

        /* Modal header — no image, pure dark design */
        .siModalHeader{position:relative;background:#0d0e10;padding:40px 28px 28px;border-bottom:1px solid rgba(255,255,255,.07);overflow:hidden;min-height:160px;display:flex;flex-direction:column;justify-content:flex-end}
        .siModalGrid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:36px 36px;pointer-events:none}
        .siModalGlow{position:absolute;top:-60px;right:-60px;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(217,31,38,.12),transparent 70%);pointer-events:none}
        .siModalClose{position:absolute;top:16px;right:16px;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.6);font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s,color .2s;z-index:2}
        .siModalClose:hover{background:rgba(217,31,38,.6);color:#fff}
        .siModalHeaderContent{position:relative;z-index:1;display:flex;align-items:flex-end;gap:16px}
        .siModalIcon{width:52px;height:52px;flex-shrink:0}
        .siModalTagline{font-size:.7rem;font-weight:700;letter-spacing:2px;color:#d91f26;margin-bottom:5px}
        .siModalTitle{font-size:1.75rem;font-weight:900;color:#f0f1f3;line-height:1.1;letter-spacing:-.02em}

        /* Modal body */
        .siModalBody{padding:24px 28px 32px}
        .siModalPara{font-size:.915rem;color:rgba(255,255,255,.6);line-height:1.8;margin-bottom:14px}
        .siModalIncluded{font-size:.68rem;font-weight:800;letter-spacing:2px;color:rgba(255,255,255,.3);text-transform:uppercase;margin:22px 0 12px;padding-top:22px;border-top:1px solid rgba(255,255,255,.06)}
        .siModalBullets{list-style:none;padding:0;margin:0 0 28px;display:grid;grid-template-columns:1fr 1fr;gap:8px}
        @media(max-width:480px){.siModalBullets{grid-template-columns:1fr}}
        .siModalBullet{display:flex;align-items:center;gap:10px;font-size:.84rem;color:rgba(255,255,255,.7);font-weight:500;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:8px;padding:9px 12px}
        .siBulletDot{width:6px;height:6px;border-radius:50%;background:#d91f26;flex-shrink:0}
        .siModalCta{display:block;width:100%;padding:15px;background:#d91f26;color:#fff;font-size:.78rem;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;text-align:center;border-radius:10px;text-decoration:none;transition:background .2s,transform .1s;margin-top:4px}
        .siModalCta:hover{background:#bc181f;transform:translateY(-1px)}
      `}</style>

      {/* Hero */}
      <section className="siPageHero">
        <div className="container siPageHeroInner">
          <div className="siPageEyebrow">{t.eyebrow}</div>
          <h1 className="siPageTitle">{t.title}</h1>
          <p className="siPageSub">{t.sub}</p>
        </div>
      </section>

      {/* Cards grid */}
      <section className="siPageSection">
        <div className="container">
          <div className="svcGrid">
            {services.map((svc, i) => (
              <ServiceCard key={svc.id} service={svc} index={i} onClick={() => setActive(svc)} />
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      {active && (
        <DetailModal
          service={active}
          onClose={() => setActive(null)}
          included={t.included}
          bookLabel={t.book}
        />
      )}
    </>
  );
}