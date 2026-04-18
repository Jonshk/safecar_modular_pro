"use client";

import { useEffect, useState, useCallback } from "react";
import { useLang } from "@/context/LangContext";
import { site } from "@/lib/content";

const txt = {
  en: {
    eyebrow: "Training Center",
    title: "Master the machine.",
    sub: "Real hands-on training from certified technicians inside our Chicago workshop.",
    enroll: "Enroll now",
    spots: "spots left",
    full: "Full",
    weeks: "weeks",
    hybrid: "Hybrid",
    online: "Online",
    presential: "In-person",
    schedule: "Schedule",
    price: "One-time payment",
    // Portal
    portalTitle: "Student Portal",
    portalSub: "Access your enrolled modules",
    portalEmail: "Your email",
    portalRef: "Enrollment reference (SC-XXXX-XXXX)",
    portalAccess: "Access portal",
    portalChecking: "Checking...",
    portalNotFound: "No enrollment found. Check your email and reference.",
    portalPending: "Your payment is pending confirmation. Check back soon.",
    // Enrollment form
    enrollTitle: "Enroll in",
    yourName: "Full name",
    email: "Email",
    phone: "Phone",
    payMethod: "Payment method",
    card: "Card / Apple Pay / Google Pay",
    zelle: "Zelle",
    bank: "Bank transfer",
    submit: "Continue to payment",
    submitting: "Processing...",
    // Payment
    payNow: "Pay",
    zelleInstr: "Zelle instructions",
    bankInstr: "Bank transfer instructions",
    sendProof: "Send proof to: payments@safecar.com",
    copyRef: "Copy",
    copied: "Copied!",
    enrollDone: "Enrollment confirmed!",
    enrollRef: "Your reference:",
    enrollNext: "Access will be granted after payment confirmation.",
    back: "← Back",
    err: "Something went wrong. Try again.",
  },
  es: {
    eyebrow: "Centro de Formación",
    title: "Domina la máquina.",
    sub: "Formación práctica con técnicos certificados en nuestro taller de Chicago.",
    enroll: "Inscribirse",
    spots: "cupos disponibles",
    full: "Completo",
    weeks: "semanas",
    hybrid: "Híbrido",
    online: "Online",
    presential: "Presencial",
    schedule: "Horario",
    price: "Pago único",
    portalTitle: "Portal del Estudiante",
    portalSub: "Accede a tus módulos inscritos",
    portalEmail: "Tu correo",
    portalRef: "Referencia (SC-XXXX-XXXX)",
    portalAccess: "Acceder",
    portalChecking: "Verificando...",
    portalNotFound: "No se encontró inscripción. Verifica tu correo y referencia.",
    portalPending: "Tu pago está pendiente. Vuelve pronto.",
    enrollTitle: "Inscribirse en",
    yourName: "Nombre completo",
    email: "Correo",
    phone: "Teléfono",
    payMethod: "Método de pago",
    card: "Tarjeta / Apple Pay / Google Pay",
    zelle: "Zelle",
    bank: "Transferencia bancaria",
    submit: "Continuar al pago",
    submitting: "Procesando...",
    payNow: "Pagar",
    zelleInstr: "Instrucciones Zelle",
    bankInstr: "Instrucciones de transferencia",
    sendProof: "Envía comprobante a: payments@safecar.com",
    copyRef: "Copiar",
    copied: "¡Copiado!",
    enrollDone: "¡Inscripción confirmada!",
    enrollRef: "Tu referencia:",
    enrollNext: "Tendrás acceso una vez confirmado el pago.",
    back: "← Volver",
    err: "Algo salió mal. Intenta de nuevo.",
  },
};

interface Module {
  id: number;
  title: string;
  title_es: string;
  description: string;
  description_es: string;
  duration_weeks: number;
  price: number;
  mode: string;
  max_students: number;
  schedule: string;
  image_url: string;
  enrolled_count: number;
}

type PayMethod = "card" | "zelle" | "bank_transfer";
type View = "catalog" | "enroll" | "card_pay" | "instructions" | "done" | "portal" | "portal_result";

// ── Module card ────────────────────────────────────────────
function ModuleCard({ mod, lang, t, onEnroll }: {
  mod: Module; lang: string;
  t: typeof txt["en"]; onEnroll: () => void;
}) {
  const title = lang === "es" ? mod.title_es || mod.title : mod.title;
  const desc  = lang === "es" ? mod.description_es || mod.description : mod.description;
  const spots = mod.max_students - mod.enrolled_count;
  const full  = spots <= 0;
  const modeLabel = { hybrid: t.hybrid, online: t.online, presential: t.presential }[mod.mode] ?? mod.mode;

  return (
    <article className="trnCard">
      {mod.image_url && (
        <div className="trnCardImg">
          <img src={mod.image_url} alt={title} />
        </div>
      )}
      <div className="trnCardBody">
        <div className="trnCardMeta">
          <span className="trnCardMode">{modeLabel}</span>
          {mod.duration_weeks > 0 && (
            <span className="trnCardDur">{mod.duration_weeks} {t.weeks}</span>
          )}
        </div>
        <h3 className="trnCardTitle">{title}</h3>
        <p className="trnCardDesc">{desc}</p>
        {mod.schedule && (
          <p className="trnCardSchedule">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/>
              <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            {mod.schedule}
          </p>
        )}
        <div className="trnCardFooter">
          <div>
            <p className="trnCardPrice">${mod.price.toFixed(0)}</p>
            <p className="trnCardPriceSub">{t.price}</p>
          </div>
          <div className="trnCardRight">
            {!full && <p className="trnCardSpots">{spots} {t.spots}</p>}
            <button
              className={`partAddBtn ${full ? "" : ""}`}
              onClick={onEnroll}
              disabled={full}
            >
              {full ? t.full : t.enroll}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

// ── Enrollment + payment flow ──────────────────────────────
function EnrollFlow({ mod, lang, t, onBack }: {
  mod: Module; lang: string; t: typeof txt["en"]; onBack: () => void;
}) {
  const title = lang === "es" ? mod.title_es || mod.title : mod.title;
  const [view, setView]           = useState<"form"|"card_pay"|"instructions"|"done">("form");
  const [method, setMethod]       = useState<PayMethod>("card");
  const [form, setForm]           = useState({ name:"", email:"", phone:"" });
  const [enrollmentId, setEnrollmentId] = useState(0);
  const [reference, setReference] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [instructions, setInstructions] = useState<any>(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [copied, setCopied]       = useState(false);

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch(`${site.apiBase}/training/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module_id: mod.id,
          student_name:  form.name,
          student_email: form.email,
          student_phone: form.phone,
          payment_method: method,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || "Error"); }
      const enrollment = await res.json();
      setEnrollmentId(enrollment.id);
      setReference(enrollment.reference);

      if (method === "card") {
        const piRes = await fetch(`${site.apiBase}/training/enroll/${enrollment.id}/payment-intent`, {
          method: "POST",
        });
        if (!piRes.ok) { setView("done"); return; }
        const pi = await piRes.json();
        setClientSecret(pi.client_secret);
        setView("card_pay");
      } else {
        const instrRes = await fetch(`${site.apiBase}/training/enroll/${enrollment.id}/payment-instructions`);
        setInstructions(await instrRes.json());
        setView("instructions");
      }
    } catch(err: any) { setError(err.message || t.err); }
    setLoading(false);
  };

  const copy = () => { navigator.clipboard.writeText(reference); setCopied(true); setTimeout(()=>setCopied(false),2000); };

  if (view === "done") return (
    <div className="checkoutDone">
      <div className="checkoutDoneIcon">
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="1.8"/>
          <path d="M8 12l3 3 5-5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <h2>{t.enrollDone}</h2>
      <p className="checkoutDoneRef">{t.enrollRef} <strong>{reference}</strong></p>
      <p className="checkoutDoneNext">{t.enrollNext}</p>
      <button className="partAddBtn" onClick={onBack} style={{marginTop:8}}>{t.back}</button>
    </div>
  );

  if (view === "instructions" && instructions) return (
    <div className="trnInstrWrap">
      <button className="checkoutBack" onClick={onBack}>{t.back}</button>
      <div className="instrPanel">
        <div className="instrHeader">
          <span className="instrIcon">{instructions.method==="zelle"?"💸":"🏦"}</span>
          <div>
            <h3>{instructions.method==="zelle"?t.zelleInstr:t.bankInstr}</h3>
            <p className="instrTotal">${instructions.total?.toFixed(2)}</p>
          </div>
        </div>
        <ol className="instrList">
          {instructions.instructions?.map((l:string,i:number)=><li key={i}>{l}</li>)}
        </ol>
        <div className="instrRef">
          <span>Reference</span>
          <div className="instrRefBox">
            <code>{reference}</code>
            <button type="button" onClick={copy} className="instrCopyBtn">
              {copied?t.copied:t.copyRef}
            </button>
          </div>
        </div>
        <p className="instrProof">{t.sendProof}</p>
      </div>
    </div>
  );

  if (view === "card_pay" && clientSecret) return (
    <div className="trnInstrWrap">
      <button className="checkoutBack" onClick={() => setView("form")}>{t.back}</button>
      <StripePayment clientSecret={clientSecret} total={mod.price} t={t}
        onSuccess={() => setView("done")} onError={() => setError(t.err)} />
      {error && <p className="ctStatusErr">{error}</p>}
    </div>
  );

  return (
    <div className="trnEnrollWrap">
      <button className="checkoutBack" onClick={onBack}>{t.back}</button>
      <h2 className="trnEnrollTitle">{t.enrollTitle} <span>{title}</span></h2>
      <div className="trnEnrollGrid">
        {/* Module summary */}
        <div className="checkoutSummary">
          <h3 style={{margin:"0 0 16px",fontSize:"0.95rem",color:"rgba(255,255,255,.5)",fontWeight:600}}>{title}</h3>
          <div className="checkoutItem"><span>{mod.schedule||"—"}</span></div>
          <div className="checkoutItemTotal">
            <strong>Total</strong>
            <strong>${mod.price.toFixed(2)}</strong>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="checkoutForm">
          <input className="ctInput" placeholder={t.yourName} required value={form.name}  onChange={f("name")} />
          <input className="ctInput" placeholder={t.email}    required type="email" value={form.email} onChange={f("email")} />
          <input className="ctInput" placeholder={t.phone}    required type="tel"   value={form.phone} onChange={f("phone")} />

          <p className="trnPayLabel">{t.payMethod}</p>
          <div className="payMethodList">
            {(["card","zelle","bank_transfer"] as PayMethod[]).map(m=>(
              <button key={m} type="button"
                className={`payMethodBtn ${method===m?"payMethodSelected":""}`}
                onClick={()=>setMethod(m)}>
                <span className="payMethodLabel">
                  {m==="card"?t.card:m==="zelle"?t.zelle:t.bank}
                </span>
                {method===m&&<svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{marginLeft:"auto",flexShrink:0}}>
                  <circle cx="12" cy="12" r="9" fill="#d91f26"/>
                  <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>}
              </button>
            ))}
          </div>

          <button type="submit" className="cartCheckoutBtn" disabled={loading}>
            {loading?t.submitting:`${t.submit} — $${mod.price.toFixed(2)}`}
          </button>
          {error&&<p className="ctStatusErr">{error}</p>}
        </form>
      </div>
    </div>
  );
}

// ── Stripe inline ──────────────────────────────────────────
function StripePayment({ clientSecret, total, t, onSuccess, onError }: any) {
  const [stripe, setStripe]   = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  const [paying, setPaying]   = useState(false);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_STRIPE_KEY;
    if (!key || !clientSecret) return;
    const load = (S:any) => {
      setStripe(S);
      const els = S.elements({ clientSecret, appearance:{ theme:"night", variables:{ colorPrimary:"#d91f26", colorBackground:"#0e0f13", borderRadius:"12px" } } });
      els.create("payment").mount("#trn-stripe-el");
      setElements(els);
    };
    if ((window as any).Stripe) { load((window as any).Stripe(key)); return; }
    const s = document.createElement("script");
    s.src = "https://js.stripe.com/v3/";
    s.onload = () => load((window as any).Stripe(key));
    document.head.appendChild(s);
  }, [clientSecret]);

  const pay = async () => {
    if (!stripe||!elements) return;
    setPaying(true);
    const { error } = await stripe.confirmPayment({ elements, confirmParams:{ return_url: window.location.href }, redirect:"if_required" });
    if (error) { onError(); setPaying(false); }
    else onSuccess();
  };

  return (
    <div className="stripeWrap">
      <div id="trn-stripe-el" className="stripeElement" />
      <button type="button" className="cartCheckoutBtn" onClick={pay} disabled={paying||!stripe}>
        {paying ? t.processing : `${t.payNow} $${total?.toFixed(2)}`}
      </button>
    </div>
  );
}

// ── Student portal ─────────────────────────────────────────
function StudentPortal({ t }: { t: typeof txt["en"] }) {
  const [email, setEmail]   = useState("");
  const [ref, setRef]       = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const check = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`${site.apiBase}/training/portal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, reference: ref }),
      });
      if (res.status === 404) { setError(t.portalNotFound); setLoading(false); return; }
      setResult(await res.json());
    } catch { setError(t.err); }
    setLoading(false);
  };

  return (
    <div className="trnPortal">
      <div className="trnPortalHead">
        <h2>{t.portalTitle}</h2>
        <p>{t.portalSub}</p>
      </div>
      {!result ? (
        <form className="trnPortalForm" onSubmit={check}>
          <input className="ctInput" type="email" placeholder={t.portalEmail} required
            value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="ctInput" placeholder={t.portalRef} required
            value={ref} onChange={e=>setRef(e.target.value.toUpperCase())} style={{fontFamily:"monospace",letterSpacing:".06em"}} />
          <button type="submit" className="cartCheckoutBtn" disabled={loading}>
            {loading ? t.portalChecking : t.portalAccess}
          </button>
          {error && <p className="ctStatusErr">{error}</p>}
        </form>
      ) : result.access ? (
        <div className="trnPortalResult">
          <div className="trnPortalWelcome">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#22c55e" strokeWidth="1.6"/>
              <path d="M8 12l3 3 5-5" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <div>
              <h3>Welcome, {result.student_name}</h3>
              <p>{result.module_title}</p>
            </div>
          </div>
          <div className="trnPortalInfo">
            <div className="trnPortalInfoRow">
              <span>Schedule</span><strong>{result.schedule||"—"}</strong>
            </div>
            <div className="trnPortalInfoRow">
              <span>Mode</span><strong style={{textTransform:"capitalize"}}>{result.mode}</strong>
            </div>
            {result.duration_weeks>0&&<div className="trnPortalInfoRow">
              <span>Duration</span><strong>{result.duration_weeks} weeks</strong>
            </div>}
            <div className="trnPortalInfoRow">
              <span>Reference</span><code style={{color:"#d91f26",fontFamily:"monospace"}}>{result.reference}</code>
            </div>
          </div>
          <div className="trnPortalContact">
            <p>For class materials and updates, contact us at <a href="tel:+18723545706" style={{color:"#d91f26"}}>+1 (872) 354-5706</a></p>
          </div>
        </div>
      ) : (
        <p className="ctStatusErr">{t.portalPending}</p>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────
export default function TrainingPage() {
  const { lang } = useLang();
  const t = txt[lang];

  const [modules, setModules]     = useState<Module[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<Module | null>(null);
  const [view, setView]           = useState<"catalog"|"enroll"|"portal">("catalog");

  useEffect(() => {
    fetch(`${site.apiBase}/training/modules`)
      .then(r => r.json())
      .then(data => { setModules(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (view === "enroll" && selected) return (
    <main className="innerPage">
      <div className="container">
        <EnrollFlow mod={selected} lang={lang} t={t} onBack={() => setView("catalog")} />
      </div>
    </main>
  );

  if (view === "portal") return (
    <main className="innerPage">
      <div className="container">
        <button className="checkoutBack" onClick={() => setView("catalog")}>{t.back}</button>
        <StudentPortal t={t} />
      </div>
    </main>
  );

  return (
    <main className="innerPage trnPage">
      <div className="container">
        {/* Hero */}
        <div className="trnHero">
          <div className="trnHeroLeft">
            <p className="eyebrow">{t.eyebrow}</p>
            <h1 className="trnHeroTitle">{t.title}</h1>
            <p className="trnHeroSub">{t.sub}</p>
            <button className="trnPortalBtn" onClick={() => setView("portal")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              {t.portalTitle}
            </button>
          </div>
        </div>

        {/* Modules */}
        {loading ? (
          <div className="trnGrid">
            {[...Array(4)].map((_,i) => <div key={i} className="partSkeleton" style={{height:360}} />)}
          </div>
        ) : (
          <div className="trnGrid">
            {modules.map(mod => (
              <ModuleCard key={mod.id} mod={mod} lang={lang} t={t}
                onEnroll={() => { setSelected(mod); setView("enroll"); }} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}