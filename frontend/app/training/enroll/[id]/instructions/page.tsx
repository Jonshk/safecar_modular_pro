"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useLang } from "@/context/LangContext";

const API = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

const T = {
  en: {
    eyebrow: "Almost done",
    title: "Payment instructions",
    sub: "Complete your payment using the details below to confirm your spot.",
    reference: "Reference",
    total: "Total",
    steps: "Steps",
    back: "← Back to Training",
    loading: "Loading instructions...",
    error: "Could not load payment instructions.",
  },
  es: {
    eyebrow: "Casi listo",
    title: "Instrucciones de pago",
    sub: "Completa tu pago con los datos de abajo para confirmar tu plaza.",
    reference: "Referencia",
    total: "Total",
    steps: "Pasos",
    back: "← Volver a Formación",
    loading: "Cargando instrucciones...",
    error: "No se pudieron cargar las instrucciones de pago.",
  },
};

export default function EnrollInstructionsPage() {
  const { lang } = useLang();
  const t = T[lang as "en" | "es"] ?? T.en;
  const params = useParams();
  const enrollmentId = params?.id;

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!enrollmentId) return;
    fetch(`${API}/training/enroll/${enrollmentId}/payment-instructions`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setData)
      .catch(() => setError(true));
  }, [enrollmentId]);

  return (
    <section className="trnSection trnEnrollSection" id="training-instructions">
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

        {error && <p className="trnEnrollErrorMsg">❌ {t.error}</p>}

        {!data && !error && <p className="trnSub">{t.loading}</p>}

        {data && (
          <div className="trnEnrollForm">
            <div className="trnEnrollField">
              <span className="trnEnrollLabel">{t.reference}</span>
              <p className="trnCoursePrice">{data.reference}</p>
            </div>

            <div className="trnEnrollField">
              <span className="trnEnrollLabel">{t.total}</span>
              <p className="trnCoursePrice">${data.total?.toFixed(2)}</p>
            </div>

            {data.method === "zelle" && (
              <div className="trnEnrollField">
                <span className="trnEnrollLabel">Zelle</span>
                <p className="trnSub">{data.zelle_email}</p>
                <p className="trnSub">{data.zelle_phone}</p>
              </div>
            )}

            {data.method === "bank_transfer" && (
              <div className="trnEnrollField">
                <span className="trnEnrollLabel">Bank</span>
                <p className="trnSub">{data.bank_name}</p>
                <p className="trnSub">Account: {data.account}</p>
                <p className="trnSub">Routing: {data.routing}</p>
                <p className="trnSub">Holder: {data.holder}</p>
              </div>
            )}

            <div className="trnEnrollField">
              <span className="trnEnrollLabel">{t.steps}</span>
              <ul>
                {data.instructions?.map((step: string, i: number) => (
                  <li key={i} className="trnSub">• {step}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}