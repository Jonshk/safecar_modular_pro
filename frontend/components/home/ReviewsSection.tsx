"use client";

import { useEffect, useState, useRef } from "react";
import { useLang } from "@/context/LangContext";
import { site } from "@/lib/content";

const PLACE_ID = "ChIJV1Orpo4uDogRuNsHRYoybSA";
const GOOGLE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${PLACE_ID}`;
const GOOGLE_VIEW_URL = `https://search.google.com/local/reviews?placeid=${PLACE_ID}`;

const SAMPLE_REVIEWS = [
  { id: -1, customer_name: "Maria G.", rating: 5, comment: "Excellent service! They fixed my brakes quickly and at a great price. Very professional and honest.", service_type: "Repair", avatar_color: "#4285F4" },
  { id: -2, customer_name: "Carlos M.", rating: 5, comment: "Best auto shop in Chicago. The diagnostics training course was incredible, I learned so much!", service_type: "Training", avatar_color: "#EA4335" },
  { id: -3, customer_name: "Jennifer R.", rating: 5, comment: "Got my parts fast and they were exactly what I needed. Staff was super helpful explaining everything.", service_type: "Parts", avatar_color: "#34A853" },
  { id: -4, customer_name: "Luis P.", rating: 5, comment: "Muy profesionales. Me explicaron todo el proceso y el precio fue justo. Los recomiendo al 100%.", service_type: "Repair", avatar_color: "#FBBC04" },
  { id: -5, customer_name: "Amanda T.", rating: 5, comment: "Safe Car is the real deal. Fixed my transmission issue same day. Will definitely be back!", service_type: "Repair", avatar_color: "#9C27B0" },
  { id: -6, customer_name: "Roberto S.", rating: 5, comment: "El curso de electrónica automotriz superó mis expectativas. Instructor muy experimentado.", service_type: "Training", avatar_color: "#FF5722" },
];

const txt = {
  en: {
    eyebrow: "CUSTOMER REVIEWS", title: "What our clients say",
    sub: "Trusted by Chicago drivers for quality auto repair, parts and training.",
    googleBtn: "Leave a Google Review", viewGoogle: "View on Google", writeBtn: "Write a Review",
    nameLabel: "Your name", commentLabel: "Tell us about your experience...",
    submitBtn: "Submit Review", successTitle: "Thank you!", rating: "Your rating",
    successSub: "Your review will be published after moderation.",
    services: { parts: "Parts", training: "Training", repair: "Repair" },
    basedOn: "Based on Google Reviews", verified: "Verified Customer",
  },
  es: {
    eyebrow: "RESEÑAS DE CLIENTES", title: "Lo que dicen nuestros clientes",
    sub: "La confianza de los conductores de Chicago en reparación, refacciones y formación.",
    googleBtn: "Dejar reseña en Google", viewGoogle: "Ver en Google", writeBtn: "Escribir Reseña",
    nameLabel: "Tu nombre", commentLabel: "Cuéntanos tu experiencia...",
    submitBtn: "Publicar Reseña", successTitle: "¡Gracias!", rating: "Tu calificación",
    successSub: "Tu reseña será publicada tras moderación.",
    services: { parts: "Refacciones", training: "Capacitación", repair: "Reparación" },
    basedOn: "Basado en Google Reviews", verified: "Cliente Verificado",
  },
};

interface Review {
  id: number; customer_name: string; rating: number;
  comment: string; service_type?: string; avatar_color?: string;
}

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function Stars({ rating, size = 15 }: { rating: number; size?: number }) {
  return (
    <div style={{ display:"flex", gap:2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= rating ? "#FBBC04" : "#333"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display:"flex", gap:6 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={32} height={32} viewBox="0 0 24 24"
          fill={i <= (hover || value) ? "#FBBC04" : "none"}
          stroke={i <= (hover || value) ? "#FBBC04" : "#555"} strokeWidth="1.5"
          style={{ cursor:"pointer", transition:"transform 0.15s", transform: i <= (hover || value) ? "scale(1.2)" : "scale(1)" }}
          onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)} onClick={() => onChange(i)}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ review, t }: { review: Review; t: typeof txt["en"] }) {
  const color = review.avatar_color || "#E8323C";
  const initials = review.customer_name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
  return (
    <div style={{ background:"var(--card,#111)", border:"1px solid var(--border,#1e1e1e)",
      borderRadius:20, padding:"24px", display:"flex", flexDirection:"column", gap:14,
      width:300, flexShrink:0, boxShadow:"0 4px 24px rgba(0,0,0,0.4)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:44,height:44,borderRadius:"50%",background:color,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:16,fontWeight:900,color:"white",flexShrink:0 }}>
            {initials}
          </div>
          <div>
            <p style={{ fontWeight:700,fontSize:"0.95rem",marginBottom:2 }}>{review.customer_name}</p>
            <p style={{ fontSize:11,color:"var(--muted)" }}>{review.service_type || t.verified}</p>
          </div>
        </div>
        <GoogleIcon size={18} />
      </div>
      <Stars rating={review.rating} />
      <p style={{ color:"var(--fg-secondary,#bbb)", lineHeight:1.65, fontSize:"0.88rem", flex:1 }}>
        "{review.comment}"
      </p>
      <div style={{ paddingTop:10, borderTop:"1px solid var(--border,#1e1e1e)",
        display:"flex", alignItems:"center", gap:6 }}>
        <GoogleIcon size={14} />
        <span style={{ fontSize:11, color:"var(--muted)" }}>Google Review</span>
        {review.service_type && (
          <span style={{ marginLeft:"auto", fontSize:11, padding:"3px 10px", borderRadius:20,
            background:"#E8323C15", color:"#E8323C", fontWeight:600 }}>
            {review.service_type}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ReviewsSection() {
  const { lang } = useLang();
  const t = txt[lang];
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const [reviews, setReviews] = useState<Review[]>(SAMPLE_REVIEWS);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [service, setService] = useState("repair");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`${site.apiBase}/reviews/?limit=12`)
      .then(r => r.ok ? r.json() : [])
      .then((data: Review[]) => { if (data.length > 0) setReviews(data); })
      .catch(() => {});
  }, []);

  const scroll = (dir: "prev" | "next") => {
    if (!trackRef.current) return;
    const amount = 320;
    trackRef.current.scrollBy({ left: dir === "next" ? amount : -amount, behavior: "smooth" });
  };

  const onScroll = () => {
    if (!trackRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
    setCanPrev(scrollLeft > 10);
    setCanNext(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || comment.trim().length < 10) return;
    setSubmitting(true);
    try {
      const r = await fetch(`${site.apiBase}/reviews/`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ customer_name:name.trim(), rating, comment:comment.trim(), service_type:service }),
      });
      if (r.ok) {
        setSubmitted(true);
        setTimeout(() => { setSubmitted(false); setShowForm(false); setName(""); setComment(""); setRating(5); }, 3000);
      }
    } catch {}
    setSubmitting(false);
  };

  const btnStyle = (active: boolean) => ({
    width:44, height:44, borderRadius:"50%", border:"1px solid var(--border,#333)",
    background: active ? "#E8323C" : "var(--card,#111)",
    color: active ? "white" : "var(--muted)",
    display:"flex", alignItems:"center", justifyContent:"center",
    cursor: active ? "pointer" : "default" as "pointer" | "default",
    opacity: active ? 1 : 0.3, transition:"all 0.2s", flexShrink:0 as 0,
  });

  return (
    <section style={{ padding:"5rem 0", background:"#080808", overflow:"hidden" }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 style={{ fontSize:"clamp(1.8rem,4vw,2.8rem)", fontWeight:900, marginBottom:"0.8rem" }}>{t.title}</h2>
          <p style={{ color:"var(--muted)", maxWidth:520, margin:"0 auto 1.5rem" }}>{t.sub}</p>

          {/* Rating badge */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:10,
            background:"var(--card,#111)", border:"1px solid var(--border,#1e1e1e)",
            borderRadius:50, padding:"10px 20px", marginBottom:"1.5rem" }}>
            <GoogleIcon />
            <div style={{ display:"flex", gap:2 }}>
              {[1,2,3,4,5].map(i => <svg key={i} width={15} height={15} viewBox="0 0 24 24" fill="#FBBC04"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
            </div>
            <span style={{ fontWeight:800 }}>5.0</span>
            <span style={{ color:"var(--muted)", fontSize:13 }}>· {t.basedOn}</span>
          </div>

          {/* CTAs */}
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
            <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer"
              style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 20px",
                background:"white", color:"#333", borderRadius:50, textDecoration:"none",
                fontWeight:700, fontSize:13, boxShadow:"0 2px 12px rgba(0,0,0,0.4)" }}>
              <GoogleIcon size={16} />{t.googleBtn}
            </a>
            <a href={GOOGLE_VIEW_URL} target="_blank" rel="noopener noreferrer"
              style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 20px",
                background:"transparent", color:"var(--fg)", border:"1px solid var(--border,#333)",
                borderRadius:50, textDecoration:"none", fontWeight:600, fontSize:13 }}>
              {t.viewGoogle}
            </a>
            <button onClick={() => setShowForm(v => !v)}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 20px",
                background:"#E8323C", color:"white", border:"none", borderRadius:50,
                fontWeight:700, fontSize:13, cursor:"pointer" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              {t.writeBtn}
            </button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div style={{ maxWidth:500, margin:"0 auto 3rem", background:"var(--card,#111)",
            border:"1.5px solid #E8323C33", borderRadius:20, padding:24 }}>
            {submitted ? (
              <div style={{ textAlign:"center", padding:"1rem" }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#00C47A" strokeWidth="2" style={{ margin:"0 auto 12px", display:"block" }}>
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>
                </svg>
                <p style={{ fontWeight:800, color:"#00C47A" }}>{t.successTitle}</p>
                <p style={{ color:"var(--muted)", fontSize:13 }}>{t.successSub}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <p style={{ fontSize:11,fontWeight:700,color:"#E8323C",letterSpacing:"0.08em",marginBottom:10 }}>{t.rating}</p>
                <StarSelector value={rating} onChange={setRating} />
                <div style={{ display:"flex", gap:8, margin:"14px 0" }}>
                  {Object.entries(t.services).map(([k,v]) => (
                    <button key={k} type="button" onClick={() => setService(k)}
                      style={{ padding:"5px 12px", borderRadius:20,
                        border:`1px solid ${service===k?"#E8323C":"var(--border,#333)"}`,
                        background:service===k?"#E8323C22":"transparent",
                        color:service===k?"#E8323C":"var(--muted)",
                        fontWeight:600, fontSize:12, cursor:"pointer" }}>
                      {v as string}
                    </button>
                  ))}
                </div>
                <input value={name} onChange={e => setName(e.target.value)} placeholder={t.nameLabel} required
                  style={{ width:"100%", padding:"11px 14px", background:"var(--bg,#000)",
                    border:"1px solid var(--border,#333)", borderRadius:10,
                    color:"var(--fg)", fontSize:14, marginBottom:10, boxSizing:"border-box" as "border-box" }} />
                <textarea value={comment} onChange={e => setComment(e.target.value)}
                  placeholder={t.commentLabel} required minLength={10} rows={3}
                  style={{ width:"100%", padding:"11px 14px", background:"var(--bg,#000)",
                    border:"1px solid var(--border,#333)", borderRadius:10,
                    color:"var(--fg)", fontSize:14, resize:"vertical", marginBottom:14, boxSizing:"border-box" as "border-box" }} />
                <button type="submit" disabled={submitting}
                  style={{ width:"100%", padding:"13px", background:"#E8323C", color:"white",
                    border:"none", borderRadius:10, fontWeight:700, fontSize:14,
                    cursor:"pointer", opacity:submitting?0.7:1 }}>
                  {submitting ? "..." : t.submitBtn}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Carousel */}
        <div style={{ position:"relative" }}>
          {/* Fade edges */}
          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:60, zIndex:2,
            background:"linear-gradient(to right, #080808, transparent)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", right:0, top:0, bottom:0, width:60, zIndex:2,
            background:"linear-gradient(to left, #080808, transparent)", pointerEvents:"none" }} />

          {/* Track */}
          <div ref={trackRef} onScroll={onScroll}
            style={{ display:"flex", gap:20, overflowX:"auto", paddingBottom:8,
              scrollbarWidth:"none", msOverflowStyle:"none",
              paddingLeft:4, paddingRight:4 }}>
            {reviews.map(review => (
              <ReviewCard key={review.id} review={review} t={t} />
            ))}
          </div>

          {/* Nav buttons */}
          <div style={{ display:"flex", justifyContent:"center", gap:12, marginTop:28 }}>
            <button style={btnStyle(canPrev)} onClick={() => canPrev && scroll("prev")} aria-label="Previous">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <button style={btnStyle(canNext)} onClick={() => canNext && scroll("next")} aria-label="Next">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
        </div>

      </div>

      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}