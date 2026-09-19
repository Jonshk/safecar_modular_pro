"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
    processing: "Processing...",
    pay: "Pay",
    paidTitle: "Payment successful!",
    paidSub: "Your enrollment is confirmed. We'll be in touch shortly.",
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
    processing: "Procesando...",
    pay: "Pagar",
    paidTitle: "¡Pago exitoso!",
    paidSub: "Tu inscripción está confirmada. Te contactaremos pronto.",
  },
};

function StripeForm({ clientSecret, onSuccess, onError, total, t }: {
  clientSecret: string; onSuccess: () => void;
  onError: () => void; total: number; t: typeof T.en;
}) {
  const [stripe, setStripe] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!clientSecret) return;
    const key = process.env.NEXT_PUBLIC_STRIPE_KEY;
    if (!key) return;
    if ((window as any).Stripe) { initStripe((window as any).Stripe(key)); return; }
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/";
    script.onload = () => initStripe((window as any).Stripe(key));
    document.head.appendChild(script);

    function initStripe(s: any) {
      setStripe(s);
      const els = s.elements({
        clientSecret,
        appearance: {
          theme: "night",
          variables: {
            colorPrimary: "#d91f26",
            colorBackground: "#0e0f13",
            colorText: "#ffffff",
            colorDanger: "#f87171",
            fontFamily: "Arial, sans-serif",
            borderRadius: "12px",
          },
        },
      });
      const payEl = els.create("payment");
      payEl.mount("#stripe-payment-element-training");
      setElements(els);
    }
  }, [clientSecret]);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setPaying(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });
    if (error) { onError(); setPaying(false); }
    else onSuccess();
  };

  return (
    <div className="stripeWrap">
      <div id="stripe-payment-element-training" className="stripeElement" />
      <button type="button" className="trnCta trnEnrollSubmit" onClick={handlePay} disabled={paying || !stripe}>
        {paying ? t.processing : `${t.pay} $${total.toFixed(2)}`}
      </button>
    </div>
  );
}

export default function EnrollPayPage() {
  const { lang } = useLang();
  const t = T[lang as "en" | "es"] ?? T.en;
  const params = useParams();
  const enrollmentId = params?.id;

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);
  const [paid, setPaid] = useState(false);

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

        {paid ? (
          <>
            <p className="eyebrow">{t.eyebrow}</p>
            <h1 className="trnHeroTitle">{t.paidTitle}</h1>
            <p className="trnSub">{t.paidSub}</p>
          </>
        ) : (
          <>
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

                <StripeForm
                  clientSecret={data.client_secret}
                  onSuccess={() => setPaid(true)}
                  onError={() => setError(true)}
                  total={data.total}
                  t={t}
                />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}