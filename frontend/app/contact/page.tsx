"use client";

import { useState } from "react";
import { useLang } from "@/context/LangContext";
import { site } from "@/lib/content";

const txt = {
  en: {
    eyebrow: "SAFE CAR", title: "Get In Touch",
    sub: "Call, visit the shop, or send a request and we'll follow up with next steps.",
    nameLabel: "Full name", phoneLabel: "Phone number",
    vehicleLabel: "Year, make & model",
    issueLabel: "Describe what's happening with your vehicle...",
    sendBtn: "SEND REQUEST", sending: "Sending...",
    successTitle: "Request sent!",
    successSub: "We'll contact you shortly to schedule your appointment.",
    bookTitle: "Need help with your vehicle?",
    hours: "Mon - Fri: 7:30 AM - 5:30 PM",
  },
  es: {
    eyebrow: "SAFE CAR", title: "Contáctanos",
    sub: "Llama, visítanos o envía una solicitud y te contactaremos con los próximos pasos.",
    nameLabel: "Nombre completo", phoneLabel: "Número de teléfono",
    vehicleLabel: "Año, marca y modelo",
    issueLabel: "Describe qué está pasando con tu vehículo...",
    sendBtn: "ENVIAR SOLICITUD", sending: "Enviando...",
    successTitle: "¡Solicitud enviada!",
    successSub: "Te contactaremos pronto para agendar tu cita.",
    bookTitle: "¿Necesitas ayuda con tu vehículo?",
    hours: "Lun - Vie: 7:30 AM - 5:30 PM",
  },
};

export default function ContactPage() {
  const { lang } = useLang();
  const t = txt[lang];

  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [vehicle, setVehicle] = useState("");
  const [issue, setIssue]     = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !vehicle.trim() || !issue.trim()) return;
    setSending(true); setError("");
    try {
      const r = await fetch(`${site.apiBase}/quote-requests/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), vehicle: vehicle.trim(), issue: issue.trim() }),
      });
      if (r.ok) { setSent(true); setName(""); setPhone(""); setVehicle(""); setIssue(""); }
      else setError("Error sending. Please try again.");
    } catch { setError("Connection error. Please call us directly."); }
    setSending(false);
  };

  const card = (icon: React.ReactNode, label: string, value: string, sub?: string, href?: string) => {
    const inner = (
      <div style={{ display:"flex", alignItems:"center", gap:14, padding:"18px 20px",
        background:"var(--card,#111)", border:"1px solid var(--border,#222)",
        borderRadius:16, marginBottom:12, textDecoration:"none", color:"var(--fg)" as string }}>
        <div style={{ width:44,height:44,background:"#E8323C22",borderRadius:12,
          display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
          {icon}
        </div>
        <div>
          <p style={{ fontSize:10,color:"var(--muted)",letterSpacing:"0.1em",fontWeight:700,marginBottom:2 }}>{label}</p>
          <p style={{ fontWeight:700,fontSize:"0.95rem" }}>{value}</p>
          {sub && <p style={{ fontSize:12,color:"var(--muted)" }}>{sub}</p>}
        </div>
      </div>
    );
    return href ? <a href={href} target={href.startsWith("http")?"_blank":"_self"} rel="noopener noreferrer" style={{ textDecoration:"none" }}>{inner}</a> : inner;
  };

  return (
    <main className="innerPage">
      <div className="container" style={{ paddingTop:"3rem", paddingBottom:"5rem" }}>

        {/* ── Header arriba del todo ── */}
        <p className="eyebrow" style={{ marginBottom:8 }}>{t.eyebrow}</p>
        <h1 style={{ fontSize:"clamp(2.2rem,5vw,3.5rem)", fontWeight:900, lineHeight:1.1, marginBottom:"0.8rem" }}>
          {t.title}
        </h1>
        <p style={{ color:"var(--muted)", lineHeight:1.7, marginBottom:"2.5rem" }}>{t.sub}</p>

        {/* ── Grid: info left | form right ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"3rem", alignItems:"start" }}>

          {/* LEFT — cards de contacto SIN texto extra arriba */}
          <div>
            {card(
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8323C" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.1 11.9 19.79 19.79 0 011.05 3.29 2 2 0 013.04 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
              "PHONE", "+1 (872) 361-1607", undefined, "tel:+18723611607"
            )}

            <a href="https://wa.me/18723545706" target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
              <div style={{ display:"flex", alignItems:"center", gap:14, padding:"18px 20px",
                background:"linear-gradient(135deg,#075E54,#128C7E)",
                borderRadius:16, marginBottom:12 }}>
                <div style={{ width:44,height:44,background:"rgba(255,255,255,0.15)",borderRadius:12,
                  display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </div>
                <div>
                  <p style={{ fontSize:10,color:"rgba(255,255,255,0.7)",letterSpacing:"0.1em",fontWeight:700,marginBottom:2 }}>WHATSAPP</p>
                  <p style={{ fontWeight:700,fontSize:"0.95rem",color:"white" }}>+1 (872) 354-5706</p>
                </div>
              </div>
            </a>

            {card(
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8323C" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
              "ADDRESS", "1052 W 51st St", "Chicago, IL 60609",
              "https://maps.google.com/?q=1052+W+51st+St+Chicago+IL+60609"
            )}

            {card(
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8323C" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
              "HOURS", t.hours, "Sat - Sun: Closed"
            )}
          </div>

          {/* RIGHT — Formulario */}
          <div style={{ background:"var(--card,#111)", border:"1px solid var(--border,#222)",
            borderRadius:24, padding:"32px 28px" }}>
            {sent ? (
              <div style={{ textAlign:"center", padding:"2rem 0" }}>
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#00C47A" strokeWidth="2"
                  style={{ margin:"0 auto 16px", display:"block" }}>
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>
                </svg>
                <h2 style={{ fontWeight:900, color:"#00C47A", marginBottom:8 }}>{t.successTitle}</h2>
                <p style={{ color:"var(--muted)" }}>{t.successSub}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <p className="eyebrow" style={{ marginBottom:4 }}>BOOK SERVICE</p>
                <h2 style={{ fontSize:"1.5rem", fontWeight:900, marginBottom:8 }}>{t.bookTitle}</h2>
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder={t.nameLabel} required className="ctInput"
                  style={{ padding:"13px 16px", borderRadius:12 }} />
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder={t.phoneLabel} required className="ctInput" type="tel"
                  style={{ padding:"13px 16px", borderRadius:12 }} />
                <input value={vehicle} onChange={e => setVehicle(e.target.value)}
                  placeholder={t.vehicleLabel} required className="ctInput"
                  style={{ padding:"13px 16px", borderRadius:12 }} />
                <textarea value={issue} onChange={e => setIssue(e.target.value)}
                  placeholder={t.issueLabel} required rows={4} className="ctInput"
                  style={{ padding:"13px 16px", borderRadius:12, resize:"vertical" }} />
                {error && <p style={{ color:"#E8323C", fontSize:13 }}>{error}</p>}
                <button type="submit" disabled={sending}
                  style={{ padding:"15px", background:"#E8323C", color:"white", border:"none",
                    borderRadius:12, fontWeight:800, fontSize:14, letterSpacing:"0.06em",
                    cursor:"pointer", opacity:sending?0.7:1,
                    boxShadow:"0 6px 20px rgba(232,50,60,0.35)" }}>
                  {sending ? t.sending : t.sendBtn}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}