"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useLang } from "@/context/LangContext";
import { site } from "@/lib/content";

const txt = {
  en: {
    title: "Checkout",
    back: "← Back to cart",
    yourInfo: "Your information",
    name: "Full name",
    email: "Email address",
    phone: "Phone number",
    address: "Shipping address",
    payMethod: "Payment method",
    card: "Credit / Debit card",
    cardSub: "Visa, Mastercard, Amex · Apple Pay · Google Pay",
    zelle: "Zelle",
    zelleSub: "Send to our Zelle — confirmed in 2 hrs",
    bank: "Bank transfer",
    bankSub: "ACH / Wire transfer — 1–2 business days",
    orderSummary: "Order summary",
    total: "Total",
    placeOrder: "Place order",
    payNow: "Pay",
    processing: "Processing...",
    orderConfirmed: "Order confirmed!",
    orderRef: "Your reference:",
    orderNext: "We'll contact you to confirm shipping.",
    zelleInstructions: "Zelle payment instructions",
    bankInstructions: "Bank transfer instructions",
    sendProof: "Send proof to: payments@safecar.com",
    copyRef: "Copy reference",
    copied: "Copied!",
    err: "Something went wrong. Please try again.",
  },
  es: {
    title: "Pago",
    back: "← Volver al carrito",
    yourInfo: "Tu información",
    name: "Nombre completo",
    email: "Correo electrónico",
    phone: "Teléfono",
    address: "Dirección de envío",
    payMethod: "Método de pago",
    card: "Tarjeta crédito / débito",
    cardSub: "Visa, Mastercard, Amex · Apple Pay · Google Pay",
    zelle: "Zelle",
    zelleSub: "Envía a nuestro Zelle — confirmado en 2 hrs",
    bank: "Transferencia bancaria",
    bankSub: "ACH / Wire — 1-2 días hábiles",
    orderSummary: "Resumen del pedido",
    total: "Total",
    placeOrder: "Realizar pedido",
    payNow: "Pagar",
    processing: "Procesando...",
    orderConfirmed: "¡Pedido confirmado!",
    orderRef: "Tu referencia:",
    orderNext: "Te contactaremos para confirmar el envío.",
    zelleInstructions: "Instrucciones Zelle",
    bankInstructions: "Instrucciones de transferencia",
    sendProof: "Envía el comprobante a: payments@safecar.com",
    copyRef: "Copiar referencia",
    copied: "¡Copiado!",
    err: "Algo salió mal. Intenta de nuevo.",
  },
};

type PayMethod = "card" | "zelle" | "bank_transfer";

interface Instructions {
  method: string;
  reference: string;
  total: number;
  instructions: string[];
  zelle_email?: string;
  zelle_phone?: string;
  bank_name?: string;
  account?: string;
  routing?: string;
  holder?: string;
}

// ── Payment method selector ────────────────────────────────
function MethodButton({ id, label, sub, selected, onClick }: {
  id: PayMethod; label: string; sub: string;
  selected: boolean; onClick: () => void;
}) {
  const icons: Record<PayMethod, React.ReactNode> = {
    card: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="5" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M2 10h20" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M6 15h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    zelle: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M8 15l8-6M8 9h8M8 15h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    bank_transfer: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 21h18M3 10h18M5 10V7l7-4 7 4v3M9 21v-5a3 3 0 016 0v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  };

  return (
    <button
      type="button"
      className={`payMethodBtn ${selected ? "payMethodSelected" : ""}`}
      onClick={onClick}
    >
      <span className="payMethodIcon">{icons[id]}</span>
      <span className="payMethodText">
        <span className="payMethodLabel">{label}</span>
        <span className="payMethodSub">{sub}</span>
      </span>
      <span className="payMethodCheck">
        {selected && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" fill="#d91f26"/>
            <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
      </span>
    </button>
  );
}

// ── Stripe card form ────────────────────────────────────────
function StripeForm({ clientSecret, onSuccess, onError, total, t }: {
  clientSecret: string; onSuccess: () => void;
  onError: () => void; total: number; t: typeof txt["en"];
}) {
  const [stripe, setStripe] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!clientSecret) return;
    const key = process.env.NEXT_PUBLIC_STRIPE_KEY;
    if (!key) return;

    // Load Stripe.js
    if ((window as any).Stripe) {
      initStripe((window as any).Stripe(key));
      return;
    }
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
      payEl.mount("#stripe-payment-element");
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
      <div id="stripe-payment-element" className="stripeElement" />
      <button
        type="button"
        className="cartCheckoutBtn"
        onClick={handlePay}
        disabled={paying || !stripe}
      >
        {paying ? t.processing : `${t.payNow} $${total.toFixed(2)}`}
      </button>
    </div>
  );
}

// ── Manual payment instructions ────────────────────────────
function InstructionsPanel({ data, t }: { data: Instructions; t: typeof txt["en"] }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(data.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="instrPanel">
      <div className="instrHeader">
        <span className="instrIcon">
          {data.method === "zelle" ? "💸" : "🏦"}
        </span>
        <div>
          <h3>{data.method === "zelle" ? t.zelleInstructions : t.bankInstructions}</h3>
          <p className="instrTotal">${data.total.toFixed(2)}</p>
        </div>
      </div>

      <ol className="instrList">
        {data.instructions.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ol>

      <div className="instrRef">
        <span>Reference</span>
        <div className="instrRefBox">
          <code>{data.reference}</code>
          <button type="button" onClick={copy} className="instrCopyBtn">
            {copied ? t.copied : t.copyRef}
          </button>
        </div>
      </div>

      <p className="instrProof">{t.sendProof}</p>
    </div>
  );
}

// ── Main Checkout ──────────────────────────────────────────
export default function Checkout({ onBack }: { onBack: () => void }) {
  const { lang } = useLang();
  const t = txt[lang];
  const { items, total, clear } = useCart();

  const [method, setMethod] = useState<PayMethod>("card");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [step, setStep] = useState<"form" | "card_pay" | "instructions" | "done">("form");
  const [clientSecret, setClientSecret] = useState("");
  const [instructions, setInstructions] = useState<Instructions | null>(null);
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create order
      const res = await fetch(`${site.apiBase}/orders/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name:    form.name,
          customer_email:   form.email,
          customer_phone:   form.phone,
          shipping_address: form.address,
          payment_method:   method,
          items: items.map(i => ({ part_id: i.id, quantity: i.quantity })),
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      const order = await res.json();
      setReference(order.reference);

      if (method === "card") {
        // Get Stripe payment intent
        const piRes = await fetch(`${site.apiBase}/orders/payment-intent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id: order.id }),
        });

        if (!piRes.ok) {
          // Stripe not configured — mark done anyway
          clear();
          setStep("done");
          return;
        }

        const pi = await piRes.json();
        setClientSecret(pi.client_secret);
        setStep("card_pay");
      } else {
        // Zelle or bank transfer — get instructions
        const instrRes = await fetch(`${site.apiBase}/orders/${order.id}/payment-instructions`);
        const instr = await instrRes.json();
        setInstructions(instr);
        setStep("instructions");
      }
    } catch (err) {
      setError(t.err);
    }
    setLoading(false);
  };

  // ── Done screen ──
  if (step === "done") {
    return (
      <div className="checkoutDone">
        <div className="checkoutDoneIcon">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="1.8"/>
            <path d="M8 12l3 3 5-5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h2>{t.orderConfirmed}</h2>
        {reference && <p className="checkoutDoneRef">{t.orderRef} <strong>{reference}</strong></p>}
        <p className="checkoutDoneNext">{t.orderNext}</p>
        <button className="partAddBtn" onClick={() => { clear(); onBack(); }} style={{ marginTop: 8 }}>
          {t.back}
        </button>
      </div>
    );
  }

  // ── Instructions screen (Zelle / Bank) ──
  if (step === "instructions" && instructions) {
    return (
      <div className="checkoutWrap">
        <button className="checkoutBack" onClick={onBack}>{t.back}</button>
        <div className="instrGrid">
          {/* Order summary */}
          <div className="checkoutSummary">
            <h2>{t.orderSummary}</h2>
            {items.map(i => (
              <div key={i.id} className="checkoutItem">
                <span>{i.name} × {i.quantity}</span>
                <span>${(i.price * i.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="checkoutItemTotal">
              <strong>{t.total}</strong>
              <strong>${total.toFixed(2)}</strong>
            </div>
          </div>
          <InstructionsPanel data={instructions} t={t} />
        </div>
      </div>
    );
  }

  // ── Card payment screen ──
  if (step === "card_pay") {
    return (
      <div className="checkoutWrap">
        <button className="checkoutBack" onClick={() => setStep("form")}>{t.back}</button>
        <div className="checkoutGrid">
          <div className="checkoutSummary">
            <h2>{t.orderSummary}</h2>
            {items.map(i => (
              <div key={i.id} className="checkoutItem">
                <span>{i.name} × {i.quantity}</span>
                <span>${(i.price * i.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="checkoutItemTotal">
              <strong>{t.total}</strong>
              <strong>${total.toFixed(2)}</strong>
            </div>
          </div>
          <div>
            <h2 style={{ marginBottom: 24 }}>{t.title}</h2>
            <StripeForm
              clientSecret={clientSecret}
              onSuccess={() => { clear(); setStep("done"); }}
              onError={() => setError(t.err)}
              total={total}
              t={t}
            />
            {error && <p className="ctStatusErr">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ──
  return (
    <div className="checkoutWrap">
      <button className="checkoutBack" onClick={onBack}>{t.back}</button>

      <form className="checkoutMainGrid" onSubmit={handleSubmit}>
        {/* LEFT — info + method */}
        <div className="checkoutLeft">
          <h2>{t.yourInfo}</h2>
          <div className="checkoutFields">
            <input className="ctInput" placeholder={t.name}    required value={form.name}    onChange={f("name")} />
            <input className="ctInput" placeholder={t.email}   required type="email" value={form.email}   onChange={f("email")} />
            <input className="ctInput" placeholder={t.phone}   required type="tel"   value={form.phone}   onChange={f("phone")} />
            <textarea className="ctInput ctTextarea" placeholder={t.address} required rows={3}
              value={form.address} onChange={f("address")} />
          </div>

          <h2 style={{ marginTop: 32, marginBottom: 16 }}>{t.payMethod}</h2>
          <div className="payMethodList">
            <MethodButton id="card"          label={t.card}  sub={t.cardSub}  selected={method === "card"}          onClick={() => setMethod("card")} />
            <MethodButton id="zelle"         label={t.zelle} sub={t.zelleSub} selected={method === "zelle"}         onClick={() => setMethod("zelle")} />
            <MethodButton id="bank_transfer" label={t.bank}  sub={t.bankSub}  selected={method === "bank_transfer"} onClick={() => setMethod("bank_transfer")} />
          </div>
        </div>

        {/* RIGHT — summary + submit */}
        <div className="checkoutRight">
          <div className="checkoutSummary">
            <h2>{t.orderSummary}</h2>
            {items.map(i => (
              <div key={i.id} className="checkoutItem">
                <span>{i.name} × {i.quantity}</span>
                <span>${(i.price * i.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="checkoutItemTotal">
              <strong>{t.total}</strong>
              <strong>${total.toFixed(2)}</strong>
            </div>
          </div>

          <button type="submit" className="cartCheckoutBtn" disabled={loading} style={{ marginTop: 16 }}>
            {loading ? t.processing : `${t.placeOrder} — $${total.toFixed(2)}`}
          </button>
          {error && <p className="ctStatusErr" style={{ marginTop: 12 }}>{error}</p>}
        </div>
      </form>
    </div>
  );
}