"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";

const API = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

const T = {
  en: {
    eyebrow: "Training Center",
    title: "Reserve your spot.",
    sub: "Fill out the form below and our team will confirm your enrollment.",
    course: "Course",
    selectCourse: "Select a course",
    loadingCourses: "Loading courses...",
    name: "Full Name",
    email: "Email",
    phone: "Phone",
    payment: "Payment Method",
    card: "Card",
    zelle: "Zelle",
    bank: "Bank Transfer",
    submit: "Enroll now",
    submitting: "Submitting...",
    error: "Something went wrong. Please try again.",
    back: "← Back to Training",
    full: "This module is full.",
    already: "You're already enrolled in this module.",
  },
  es: {
    eyebrow: "Centro de Formación",
    title: "Reserva tu plaza.",
    sub: "Completa el formulario y nuestro equipo confirmará tu inscripción.",
    course: "Curso",
    selectCourse: "Selecciona un curso",
    loadingCourses: "Cargando cursos...",
    name: "Nombre completo",
    email: "Correo electrónico",
    phone: "Teléfono",
    payment: "Método de pago",
    card: "Tarjeta",
    zelle: "Zelle",
    bank: "Transferencia bancaria",
    submit: "Inscribirme",
    submitting: "Enviando...",
    error: "Algo salió mal. Inténtalo de nuevo.",
    back: "← Volver a Formación",
    full: "Este módulo está completo.",
    already: "Ya estás inscrito en este módulo.",
  },
};

function EnrollForm() {
  const { lang } = useLang();
  const t = T[lang as "en" | "es"] ?? T.en;
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedModule = searchParams.get("course") || "";

  const [modules, setModules] = useState<any[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    module_id: preselectedModule,
    student_name: "",
    student_email: "",
    student_phone: "",
    payment_method: "card",
  });

  useEffect(() => {
    fetch(`${API}/training/modules`)
      .then((r) => r.json())
      .then((data) => {
        setModules(data);
        setLoadingModules(false);
      })
      .catch((err) => {
        console.error("Error fetching modules:", err);
        setLoadingModules(false);
      });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch(`${API}/training/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          module_id: Number(formData.module_id),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const detail = err.detail || "";
        if (detail.includes("full")) throw new Error(t.full);
        if (detail.includes("Already")) throw new Error(t.already);
        throw new Error(t.error);
      }

      const enrollment = await res.json();

      if (formData.payment_method === "card") {
        router.push(`/training/enroll/${enrollment.id}/pay`);
      } else {
        router.push(`/training/enroll/${enrollment.id}/instructions`);
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || t.error);
    }
  };

  return (
    <section className="trnSection trnEnrollSection" id="training-enroll">
      <img
        src="https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=2400&q=85"
        alt="Workshop"
        className="trnBg"
      />
      <div className="trnOverlay" />

      <div className="container trnEnrollLayout">
        <a href="/training" className="trnEnrollBack">{t.back}</a>

        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="trnHeroTitle">{t.title}</h1>
        <p className="trnSub">{t.sub}</p>

        <form onSubmit={handleSubmit} className="trnEnrollForm">
          <div className="trnEnrollField">
            <label className="trnEnrollLabel">{t.course}</label>
            <select
              name="module_id"
              required
              value={formData.module_id}
              onChange={handleChange}
              className="trnEnrollInput"
            >
              <option value="">
                {loadingModules ? t.loadingCourses : t.selectCourse}
              </option>
              {modules.map((m) => {
                const title = lang === "es" && m.title_es ? m.title_es : m.title;
                return (
                  <option key={m.id} value={m.id}>
                    {title} — ${m.price?.toFixed(2)}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="trnEnrollField">
            <label className="trnEnrollLabel">{t.name}</label>
            <input
              type="text"
              name="student_name"
              required
              value={formData.student_name}
              onChange={handleChange}
              className="trnEnrollInput"
            />
          </div>

          <div className="trnEnrollField">
            <label className="trnEnrollLabel">{t.email}</label>
            <input
              type="email"
              name="student_email"
              required
              value={formData.student_email}
              onChange={handleChange}
              className="trnEnrollInput"
            />
          </div>

          <div className="trnEnrollField">
            <label className="trnEnrollLabel">{t.phone}</label>
            <input
              type="tel"
              name="student_phone"
              required
              value={formData.student_phone}
              onChange={handleChange}
              className="trnEnrollInput"
            />
          </div>

          <div className="trnEnrollField">
            <label className="trnEnrollLabel">{t.payment}</label>
            <select
              name="payment_method"
              required
              value={formData.payment_method}
              onChange={handleChange}
              className="trnEnrollInput"
            >
              <option value="card">{t.card}</option>
              <option value="zelle">{t.zelle}</option>
              <option value="bank_transfer">{t.bank}</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="trnCta trnEnrollSubmit"
          >
            {status === "loading" ? t.submitting : t.submit}
          </button>

          {status === "error" && <p className="trnEnrollErrorMsg">❌ {errorMsg}</p>}
        </form>
      </div>
    </section>
  );
}

export default function EnrollPage() {
  return (
    <Suspense fallback={<div style={{ padding: "4rem", textAlign: "center" }}>Loading...</div>}>
      <EnrollForm />
    </Suspense>
  );
}