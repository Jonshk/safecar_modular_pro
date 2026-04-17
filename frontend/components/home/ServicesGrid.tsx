"use client";

import { useRef, useEffect } from "react";
import { useLang } from "@/context/LangContext";
import { services } from "@/lib/content";

const servicesText = {
  en: { eyebrow:"Core Services", title:"What we fix", sub:"Complete automotive care for domestic, Asian and European vehicles." },
  es: { eyebrow:"Servicios", title:"Lo que reparamos", sub:"Servicio automotriz completo para vehículos domésticos, asiáticos y europeos." },
};

const AnimatedIcons: Record<string, React.ReactNode> = {
  "Electrical Diagnostics": (
    <svg viewBox="0 0 64 64" fill="none" className="svcSvg">
      <style>{`
        .bolt{animation:boltFlash 1.4s ease-in-out infinite;transform-origin:32px 32px}
        .arc1{animation:arcPulse 1.4s ease-in-out infinite 0.1s;stroke-dasharray:40;stroke-dashoffset:40}
        .arc2{animation:arcPulse 1.4s ease-in-out infinite 0.3s;stroke-dasharray:40;stroke-dashoffset:40}
        @keyframes boltFlash{0%,100%{opacity:1;filter:drop-shadow(0 0 2px #d91f26)}50%{opacity:.3;filter:drop-shadow(0 0 12px #d91f26)}}
        @keyframes arcPulse{0%,100%{stroke-dashoffset:40;opacity:0}50%{stroke-dashoffset:0;opacity:1}}
      `}</style>
      <path className="bolt" d="M38 8L22 34h14l-8 22 24-32H36L42 8z" stroke="#d91f26" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path className="arc1" d="M12 32 Q6 26 12 20" stroke="#d91f26" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path className="arc2" d="M52 32 Q58 26 52 20" stroke="#d91f26" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  "Brake & Suspension": (
    <svg viewBox="0 0 64 64" fill="none" className="svcSvg">
      <style>{`
        .wheel{animation:wheelSpin 2.5s linear infinite;transform-origin:32px 32px}
        .caliper{animation:caliperSqueeze 2.5s ease-in-out infinite;transform-origin:10px 32px}
        @keyframes wheelSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes caliperSqueeze{0%,100%{transform:scaleX(1)}50%{transform:scaleX(1.08)}}
      `}</style>
      <g className="wheel">
        <circle cx="32" cy="32" r="22" stroke="rgba(255,255,255,.25)" strokeWidth="2"/>
        <circle cx="32" cy="32" r="8" stroke="rgba(255,255,255,.5)" strokeWidth="2.5"/>
        {[0,45,90,135,180,225,270,315].map((a,i)=>(
          <line key={i} x1="32" y1="10" x2="32" y2="18" stroke="rgba(255,255,255,.3)" strokeWidth="2"
            transform={`rotate(${a} 32 32)`} strokeLinecap="round"/>
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
      <style>{`
        .needle{animation:needleSweep 2s ease-in-out infinite;transform-origin:32px 40px}
        .glow{animation:glowPulse 2s ease-in-out infinite}
        @keyframes needleSweep{0%{transform:rotate(-80deg)}70%{transform:rotate(80deg)}100%{transform:rotate(-80deg)}}
        @keyframes glowPulse{0%,100%{opacity:.3}70%{opacity:1}}
      `}</style>
      <path d="M10 46 A26 26 0 0 1 54 46" stroke="rgba(255,255,255,.15)" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path className="glow" d="M10 46 A26 26 0 0 1 54 46" stroke="#d91f26" strokeWidth="3" strokeLinecap="round" fill="none" strokeDasharray="80" strokeDashoffset="0"/>
      {[[-28,14],[0,6],[28,14]].map(([dx,dy],i)=>(
        <line key={i} x1={32+dx} y1={46-dy} x2={32+dx*.7} y2={46-dy*.7}
          stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinecap="round"/>
      ))}
      <g className="needle">
        <line x1="32" y1="40" x2="32" y2="16" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="32" cy="40" r="4" fill="#d91f26"/>
      </g>
    </svg>
  ),
  "Parts & Components": (
    <svg viewBox="0 0 64 64" fill="none" className="svcSvg">
      <style>{`
        .g1{animation:gR 3s linear infinite;transform-origin:22px 26px}
        .g2{animation:gL 3s linear infinite;transform-origin:42px 38px}
        @keyframes gR{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes gL{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
      `}</style>
      <g className="g1">
        <circle cx="22" cy="26" r="11" stroke="rgba(255,255,255,.5)" strokeWidth="2" fill="none"/>
        <circle cx="22" cy="26" r="4" fill="rgba(255,255,255,.2)"/>
        {[0,45,90,135,180,225,270,315].map((a,i)=>(
          <rect key={i} x="20" y="13" width="4" height="5" fill="rgba(255,255,255,.4)" rx="1.5"
            transform={`rotate(${a} 22 26)`}/>
        ))}
      </g>
      <g className="g2">
        <circle cx="42" cy="38" r="8" stroke="#d91f26" strokeWidth="2" fill="none"/>
        <circle cx="42" cy="38" r="3" fill="rgba(217,31,38,.3)"/>
        {[0,60,120,180,240,300].map((a,i)=>(
          <rect key={i} x="40" y="28" width="4" height="4" fill="#d91f26" rx="1.5"
            transform={`rotate(${a} 42 38)`} opacity=".8"/>
        ))}
      </g>
    </svg>
  ),
  "Starting & Charging": (
    <svg viewBox="0 0 64 64" fill="none" className="svcSvg">
      <style>{`
        .bar{animation:barFill 2s ease-in-out infinite}
        .zap2{animation:zapShow 2s ease-in-out infinite .6s;transform-origin:32px 36px}
        @keyframes barFill{0%,100%{stroke-dashoffset:120}70%{stroke-dashoffset:0}}
        @keyframes zapShow{0%,39%,100%{opacity:0;transform:scale(.6)}50%,89%{opacity:1;transform:scale(1)}}
      `}</style>
      <rect x="10" y="22" width="44" height="26" rx="4" stroke="rgba(255,255,255,.4)" strokeWidth="2" fill="none"/>
      <rect x="10" y="22" width="44" height="26" rx="4" stroke="#d91f26" strokeWidth="2" fill="none" strokeDasharray="140" className="bar"/>
      <rect x="23" y="16" width="8" height="6" rx="1.5" fill="rgba(255,255,255,.3)"/>
      <rect x="33" y="16" width="8" height="6" rx="1.5" fill="rgba(255,255,255,.3)"/>
      <path className="zap2" d="M34 26l-8 10h7l-4 10 11-14h-8l5-6z" fill="#d91f26"/>
    </svg>
  ),
  "General Repair": (
    <svg viewBox="0 0 64 64" fill="none" className="svcSvg">
      <style>{`
        .wr{animation:wrTurn 2s ease-in-out infinite;transform-origin:42px 20px}
        .sp1{animation:spFly 2s ease-in-out infinite .7s}
        .sp2{animation:spFly 2s ease-in-out infinite 1s}
        .sp3{animation:spFly 2s ease-in-out infinite 1.3s}
        @keyframes wrTurn{0%,100%{transform:rotate(-20deg)}50%{transform:rotate(20deg)}}
        @keyframes spFly{0%,100%{opacity:0;transform:translate(0,0) scale(0)}60%{opacity:1;transform:translate(6px,-6px) scale(1)}}
      `}</style>
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

function Card3D({ title, text, index }: { title: string; text: string; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    // Scroll reveal
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

    // Mouse
    const onMouseMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      applyTilt(
        (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2),
        (e.clientY - (r.top  + r.height / 2)) / (r.height / 2),
        14
      );
    };

    // Touch
    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const r = el.getBoundingClientRect();
      applyTilt(
        (touch.clientX - (r.left + r.width  / 2)) / (r.width  / 2),
        (touch.clientY - (r.top  + r.height / 2)) / (r.height / 2),
        8  // softer on mobile
      );
    };

    el.addEventListener("mousemove",  onMouseMove);
    el.addEventListener("mouseleave", resetTilt);
    el.addEventListener("touchmove",  onTouchMove,  { passive: true });
    el.addEventListener("touchend",   resetTilt);
    el.addEventListener("touchcancel",resetTilt);

    return () => {
      obs.disconnect();
      el.removeEventListener("mousemove",  onMouseMove);
      el.removeEventListener("mouseleave", resetTilt);
      el.removeEventListener("touchmove",  onTouchMove);
      el.removeEventListener("touchend",   resetTilt);
      el.removeEventListener("touchcancel",resetTilt);
    };
  }, [index]);

  return (
    <article ref={cardRef} className="svcCard">
      <div className="svcShine" />
      <div className="svcHalo" />
      <div className="svcIconWrap">
        {AnimatedIcons[title] ?? (
          <svg viewBox="0 0 64 64" fill="none" className="svcSvg">
            <circle cx="32" cy="32" r="22" stroke="rgba(255,255,255,.4)" strokeWidth="2" fill="none"/>
          </svg>
        )}
      </div>
      <h3 className="svcCardTitle">{title}</h3>
      <p className="svcCardDesc">{text}</p>
    </article>
  );
}

export default function ServicesGrid() {
  const { lang } = useLang();
  const t = servicesText[lang];

  return (
    <section className="svcSection" id="services">
      <div className="container">
        <div className="svcHeader">
          <div className="eyebrow">{t.eyebrow}</div>
          <h2 className="svcMainTitle">{t.title}</h2>
          <p className="svcMainSub">{t.sub}</p>
        </div>
        <div className="svcGrid">
          {services.map((item, i) => (
            <Card3D key={item.title} title={item.title} text={item.text} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}