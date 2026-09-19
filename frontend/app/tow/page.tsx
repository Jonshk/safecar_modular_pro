"use client";

import { useState } from "react";
import { useLang } from "@/context/LangContext";
import { site } from "@/lib/content";

const text = {
  en: {
    eyebrow: "24/7 Emergency",
    title: "Tow Service",
    sub: "Broke down? We dispatch immediately. Share your location and a driver will reach you as fast as possible.",
    namePh: "Full name",
    phonePh: "Phone number",
    vehiclePh: "Year, make & model (e.g. 2018 Toyota Camry)",
    pickupPh: "Pickup address or location description",
    destPh: "Destination address (optional)",
    notesPh: "Additional notes (optional)",
    locBtn: "Share my GPS location",
    locGetting: "Getting location...",
    locOk: "Location captured",
    locErr: "Could not get location — fill address manually",
    submit: "Request Tow",
    sending: "Sending...",
    success: "✓ Tow requested — a dispatcher will call you shortly.",
    error: "Something went wrong. Please call us directly.",
    infoTitle: "What to expect",
    info1: "We call you back within 5 minutes",
    info2: "Driver dispatched immediately",
    info3: "ETA 30–45 min depending on location",
    info4: "All makes & models accepted",
    orCall: "Or call us now",
  },
  es: {
    eyebrow: "Emergencia 24/7",
    title: "Servicio de Grúa",
    sub: "¿Varado? Enviamos grúa de inmediato. Comparte tu ubicación y un conductor llegará lo antes posible.",
    namePh: "Nombre completo",
    phonePh: "Número de teléfono",
    vehiclePh: "Año, marca y modelo (ej. Toyota Camry 2018)",
    pickupPh: "Dirección o descripción del lugar de recogida",
    destPh: "Destino (opcional)",
    notesPh: "Notas adicionales (opcional)",
    locBtn: "Compartir mi ubicación GPS",
    locGetting: "Obteniendo ubicación...",
    locOk: "Ubicación capturada",
    locErr: "No se pudo obtener ubicación — escribe la dirección",
    submit: "Solicitar Grúa",
    sending: "Enviando...",
    success: "✓ Grúa solicitada — un despachador te llamará pronto.",
    error: "Algo salió mal. Por favor llámanos directamente.",
    infoTitle: "Qué esperar",
    info1: "Te llamamos en menos de 5 minutos",
    info2: "Conductor enviado de inmediato",
    info3: "Tiempo de llegada 30–45 min",
    info4: "Todas las marcas y modelos",
    orCall: "O llámanos ahora",
  },
};

export default function TowPage() {
  const { lang } = useLang();
  const t = text[lang];

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locStatus, setLocStatus] = useState<"idle"|"getting"|"ok"|"error">("idle");
  const [status, setStatus] = useState<"idle"|"sending"|"success"|"error">("idle");

  async function getLocation() {
    if (!navigator.geolocation) { setLocStatus("error"); return; }
    setLocStatus("getting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocStatus("ok");
        const field = document.querySelector<HTMLInputElement>('input[name="pickup_address"]');
        if (field && !field.value) {
          field.value = `GPS: ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
        }
      },
      () => setLocStatus("error"),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const fd = new FormData(e.currentTarget);
    const payload = {
      customer_name:       String(fd.get("customer_name") || ""),
      customer_phone:      String(fd.get("customer_phone") || ""),
      vehicle_description: String(fd.get("vehicle_description") || ""),
      pickup_address:      String(fd.get("pickup_address") || ""),
      destination_address: String(fd.get("destination_address") || ""),
      notes:               String(fd.get("notes") || ""),
      pickup_lat:          lat ?? 0,
      pickup_lng:          lng ?? 0,
    };
    try {
      const res = await fetch(`${site.apiBase}/tow/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      (e.target as HTMLFormElement).reset();
      setLat(null); setLng(null); setLocStatus("idle");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="towPage">
      <div className="container towLayout">
        <div className="towLeft">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 className="towTitle">{t.title}</h1>
          <p className="towSub">{t.sub}</p>
          <div className="towInfoBox">
            <p className="towInfoTitle">{t.infoTitle}</p>
            {[t.info1, t.info2, t.info3, t.info4].map((info, i) => (
              <div key={i} className="towInfoRow">
                <span className="towInfoCheck">✓</span>
                <span>{info}</span>
              </div>
            ))}
          </div>
          <p className="ctOrLabel">{t.orCall}</p>
          <a href="tel:+18723545706" className="towCallBtn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            +1 (872) 354-5706
          </a>
        </div>

        <div className="towRight">
          <form className="ctForm" onSubmit={handleSubmit} noValidate>
            <button type="button" className={`towLocBtn towLocBtn--${locStatus}`}
              onClick={getLocation} disabled={locStatus === "getting"}>
              <span className="towLocIcon">
                {locStatus === "ok" ? "✓" : locStatus === "error" ? "✕" : "⊕"}
              </span>
              {locStatus === "getting" ? t.locGetting
                : locStatus === "ok" ? t.locOk
                : locStatus === "error" ? t.locErr
                : t.locBtn}
            </button>
            <div className="ctFormRow">
              <div className="ctField">
                <input name="customer_name" placeholder={t.namePh} required className="ctInput" />
              </div>
              <div className="ctField">
                <input name="customer_phone" placeholder={t.phonePh} required className="ctInput" type="tel" />
              </div>
            </div>
            <div className="ctField">
              <input name="vehicle_description" placeholder={t.vehiclePh} required className="ctInput" />
            </div>
            <div className="ctField">
              <input name="pickup_address" placeholder={t.pickupPh} required className="ctInput" />
            </div>
            <div className="ctField">
              <input name="destination_address" placeholder={t.destPh} className="ctInput" />
            </div>
            <div className="ctField">
              <textarea name="notes" placeholder={t.notesPh} rows={3} className="ctInput ctTextarea" />
            </div>
            <button type="submit" className="ctSubmit" disabled={status === "sending"}>
              {status === "sending" ? t.sending : t.submit}
            </button>
            {status === "success" && <p className="ctStatusOk">{t.success}</p>}
            {status === "error"   && <p className="ctStatusErr">{t.error}</p>}
          </form>
        </div>
      </div>
    </main>
  );
}