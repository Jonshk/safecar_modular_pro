"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useLang } from "@/context/LangContext";

const API = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

const T = {
  en: {
    eyebrow: "Almost done",
    title: "Complete your payment",
    sub: "Secure card payment powered by Stripe.",
    reference: "Reference",
    total: "Total",
    back: "← Back to Training",
    loading: "Preparing payment...",
    error: "Could not start payment. Please try again or contact us.",
  },
  es: {
    eyebrow: "Casi listo",
    title: "Completa tu pago",
    sub: "Pago seguro con tarjeta procesado por Stripe.",
    reference: "Referencia",
    total: "Total",
    back: "← Volver a Formación",
    loading: "Preparando el pago...",
    error: "No se pudo iniciar el pago. Inténtalo de nuevo o contáctanos.",
  },
};

export default function EnrollPayPage() {
  const { lang } = useLang();
  const t = T[lang as "en" | "es"] ?? T.en;
  const params = useParams();
  const enrollmentId = params?.id;

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!enrollmentId) return;
    fetch(`${API}/training/enroll/${enrollmentId}/payment-intent`, {
      method: "POST",
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setData)
      .catch(() => setError(true));
  }, [enrollmentId]);

  return (
    <section className="trnSection trnEnrollSection" id="training-pay">
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

            {/* TODO: integrar Stripe Elements aquí usando data.client_secret */}
          </div>
        )}
      </div>
    </section>
  );
}