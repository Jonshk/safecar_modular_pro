"use client";

import { useState } from "react";
import { useLang } from "@/context/LangContext";
import { site } from "@/lib/content";

const text = {
  en: {
    eyebrow: "Schedule Appointment",
    title: "Book a Service",
    sub: "Choose your service, pick a date and we'll confirm your appointment by phone.",
    namePh: "Full name",
    emailPh: "Email address",
    phonePh: "Phone number",
    makePh: "Make (e.g. Toyota)",
    modelPh: "Model (e.g. Camry)",
    yearPh: "Year",
    notesPh: "Describe your issue or any details...",
    dateLabel: "Preferred date",
    timeLabel: "Preferred time",
    submit: "Confirm Booking",
    sending: "Sending...",
    success: "✓ Booking received — we'll call to confirm your appointment.",
    error: "Something went wrong. Please call us directly.",
    orCall: "Or call us now",
  },
  es: {
    eyebrow: "Agendar Cita",
    title: "Reservar Servicio",
    sub: "Elige el servicio, selecciona una fecha y confirmaremos tu cita por teléfono.",
    namePh: "Nombre completo",
    emailPh: "Correo electrónico",
    phonePh: "Número de teléfono",
    makePh: "Marca (ej. Toyota)",
    modelPh: "Modelo (ej. Camry)",
    yearPh: "Año",
    notesPh: "Describe el problema o cualquier detalle...",
    dateLabel: "Fecha preferida",
    timeLabel: "Hora preferida",
    submit: "Confirmar Reserva",
    sending: "Enviando...",
    success: "✓ Reserva recibida — te llamaremos para confirmar la cita.",
    error: "Algo salió mal. Por favor llámanos directamente.",
    orCall: "O llámanos ahora",
  },
};

const services = [
  { value: "oil_change",     en: "Oil Change",       es: "Cambio de aceite" },
  { value: "brake_service",  en: "Brake Service",    es: "Servicio de frenos" },
  { value: "diagnostics",    en: "Diagnostics",      es: "Diagnóstico" },
  { value: "tire_rotation",  en: "Tire Rotation",    es: "Rotación de neumáticos" },
  { value: "general_repair", en: "General Repair",   es: "Reparación general" },
  { value: "body_collision_repair", en: "Collision Repair", es: "Latonería / Colisión" },
  { value: "body_paint_refinishing", en: "Paint & Refinishing", es: "Pintura y refinado" },
  { value: "body_dent_removal", en: "Dent Removal", es: "Eliminación de abolladuras" },
  { value: "body_frame_straightening", en: "Frame Straightening", es: "Enderezado de chasis" },
  { value: "body_shop_estimate", en: "Body Shop Estimate", es: "Presupuesto de carrocería" },
  { value: "other",          en: "Other",            es: "Otro" },
];

const times = ["08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00"];

export default function BookPage() {
  const { lang } = useLang();
  const t = text[lang];
  const [status, setStatus] = useState<"idle"|"sending"|"success"|"error">("idle");
  const [selectedTime, setSelectedTime] = useState("09:00");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const fd = new FormData(e.currentTarget);
    const payload = {
      customer_name:  String(fd.get("customer_name")  || ""),
      customer_email: String(fd.get("customer_email") || ""),
      customer_phone: String(fd.get("customer_phone") || ""),
      vehicle_make:   String(fd.get("vehicle_make")   || ""),
      vehicle_model:  String(fd.get("vehicle_model")  || ""),
      vehicle_year:   String(fd.get("vehicle_year")   || ""),
      service_type:   String(fd.get("service_type")   || "general_repair"),
      preferred_date: String(fd.get("preferred_date") || ""),
      preferred_time: selectedTime,
      notes:          String(fd.get("notes")          || ""),
    };
    try {
      const res = await fetch(`${site.apiBase}/bookings/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      (e.target as HTMLFormElement).reset();
      setSelectedTime("09:00");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <main className="bookPage">
      <div className="container bookLayout">
        <div className="towLeft">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 className="towTitle">{t.title}</h1>
          <p className="towSub">{t.sub}</p>
          <div className="bookServiceGrid">
            {services.map((s) => (
              <label key={s.value} className="bookServiceCard">
                <input type="radio" name="service_type" value={s.value}
                  defaultChecked={s.value === "oil_change"} className="bookServiceRadio" />
                <span className="bookServiceLabel">{lang === "en" ? s.en : s.es}</span>
              </label>
            ))}
          </div>
          <p className="ctOrLabel" style={{ marginTop: 32 }}>{t.orCall}</p>
          <a href="tel:+18723545706" className="towCallBtn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            +1 (872) 354-5706
          </a>
        </div>

        <div className="towRight">
          <form className="ctForm" onSubmit={handleSubmit} noValidate>
            <div className="ctFormRow">
              <div className="ctField">
                <input name="customer_name" placeholder={t.namePh} required className="ctInput" />
              </div>
              <div className="ctField">
                <input name="customer_phone" placeholder={t.phonePh} required className="ctInput" type="tel" />
              </div>
            </div>
            <div className="ctField">
              <input name="customer_email" placeholder={t.emailPh} required className="ctInput" type="email" />
            </div>
            <div className="ctFormRow">
              <div className="ctField" style={{ flex: "0 0 80px" }}>
                <input name="vehicle_year" placeholder={t.yearPh} className="ctInput" maxLength={4} />
              </div>
              <div className="ctField">
                <input name="vehicle_make" placeholder={t.makePh} className="ctInput" />
              </div>
              <div className="ctField">
                <input name="vehicle_model" placeholder={t.modelPh} className="ctInput" />
              </div>
            </div>
            <div className="ctField">
              <label className="bookFieldLabel">{t.dateLabel}</label>
              <input name="preferred_date" type="date" min={minDate} required className="ctInput bookDateInput" />
            </div>
            <div className="ctField">
              <label className="bookFieldLabel">{t.timeLabel}</label>
              <div className="bookTimeGrid">
                {times.map((time) => (
                  <button key={time} type="button"
                    className={`bookTimeBtn ${selectedTime === time ? "bookTimeBtnActive" : ""}`}
                    onClick={() => setSelectedTime(time)}>
                    {time}
                  </button>
                ))}
              </div>
            </div>
            <div className="ctField">
              <textarea name="notes" placeholder={t.notesPh} rows={4} className="ctInput ctTextarea" />
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