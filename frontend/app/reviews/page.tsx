"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/context/LangContext";
import { site } from "@/lib/content";

const PLACE_ID = "ChIJV1Orpo4uDogRuNsHRYoybSA";
const GOOGLE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${PLACE_ID}`;
const GOOGLE_VIEW_URL   = `https://search.google.com/local/reviews?placeid=${PLACE_ID}`;

const txt = {
  en: {
    eyebrow: "Customer Reviews",
    title: "What our clients say",
    sub: "Real experiences from real customers in Chicago.",
    googleView: "View our Google Reviews",
    googleLeave: "Leave us a Google Review ⭐",
    googleSub: "Your feedback helps us grow",
    ownTitle: "Customer Reviews",
    writeBtn: "Write a Review",
    noReviews: "Be the first to leave a review!",
    nameLabel: "Your name",
    commentLabel: "Tell us about your experience...",
    serviceLabel: "Service type",
    services: { parts: "Parts", training: "Training", repair: "Repair" },
    submitBtn: "Submit Review",
    successTitle: "Thank you for your review!",
    successSub: "It will be published after moderation.",
    stars: "Rating",
  },
  es: {
    eyebrow: "Reseñas de Clientes",
    title: "Lo que dicen nuestros clientes",
    sub: "Experiencias reales de clientes reales en Chicago.",
    googleView: "Ver nuestras reseñas en Google",
    googleLeave: "Déjanos una reseña en Google ⭐",
    googleSub: "Tu opinión nos ayuda a crecer",
    ownTitle: "Reseñas de Clientes",
    writeBtn: "Escribir Reseña",
    noReviews: "¡Sé el primero en dejar una reseña!",
    nameLabel: "Tu nombre",
    commentLabel: "Cuéntanos tu experiencia...",
    serviceLabel: "Tipo de servicio",
    services: { parts: "Refacciones", training: "Capacitación", repair: "Reparación" },
    submitBtn: "Publicar Reseña",
    successTitle: "¡Gracias por tu reseña!",
    successSub: "Será publicada tras revisión.",
    stars: "Calificación",
  },
};

interface Review {
  id: number;
  customer_name: string;
  rating: number;
  comment: string;
  service_type?: string;
  created_at: string;
}

interface Stats {
  total: number;
  avg_rating: number;
  five_star: number;
  four_star: number;
  three_star: number;
  two_star: number;
  one_star: number;
}

function Stars({ rating, size = 20 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= rating ? "#F59E0B" : "none"} stroke="#F59E0B" strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4, cursor: "pointer" }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={32} height={32} viewBox="0 0 24 24"
          fill={i <= (hover || value) ? "#F59E0B" : "none"}
          stroke="#F59E0B" strokeWidth="1.5"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          style={{ transition: "transform 0.15s", transform: i <= (hover || value) ? "scale(1.2)" : "scale(1)" }}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { lang } = useLang();
  const t = txt[lang];

  const [reviews, setReviews]   = useState<Review[]>([]);
  const [stats, setStats]       = useState<Stats | null>(null);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName]       = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating]   = useState(5);
  const [service, setService] = useState("parts");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        fetch(`${site.apiBase}/reviews/?limit=20`),
        fetch(`${site.apiBase}/reviews/stats`),
      ]);
      if (r1.ok) setReviews(await r1.json());
      if (r2.ok) setStats(await r2.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || comment.trim().length < 10) return;
    setSubmitting(true);
    try {
      const r = await fetch(`${site.apiBase}/reviews/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_name: name.trim(), rating, comment: comment.trim(), service_type: service }),
      });
      if (r.ok) {
        setSubmitted(true);
        setName(""); setComment(""); setRating(5);
        setTimeout(() => { setSubmitted(false); setShowForm(false); load(); }, 3000);
      }
    } catch {}
    setSubmitting(false);
  };

  const starKeys = ["five_star","four_star","three_star","two_star","one_star"] as const;

  return (
    <main className="innerPage">
      <div className="container" style={{ maxWidth: 860, paddingTop: "3rem", paddingBottom: "5rem" }}>
        {/* Header */}
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 style={{ fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 900, marginBottom: "0.5rem" }}>{t.title}</h1>
        <p style={{ color: "var(--muted)", marginBottom: "2.5rem" }}>{t.sub}</p>

        {/* Google CTAs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: "2.5rem" }}>
          <a href={GOOGLE_VIEW_URL} target="_blank" rel="noopener noreferrer"
            style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 20px",
              background:"var(--card)", border:"1px solid var(--border)", borderRadius:16,
              textDecoration:"none", color:"var(--fg)", transition:"border-color 0.2s" }}>
            <div style={{ width:44,height:44,background:"white",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              <span style={{ fontSize:24,fontWeight:900,color:"#4285F4" }}>G</span>
            </div>
            <div>
              <p style={{ fontWeight:700,marginBottom:2 }}>{t.googleView}</p>
              <div style={{ display:"flex", gap:2 }}>
                {[1,2,3,4,5].map(i => <span key={i} style={{ color:"#F59E0B",fontSize:14 }}>★</span>)}
              </div>
            </div>
            <svg style={{ marginLeft:"auto" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
          </a>

          <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer"
            style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 20px",
              background:"linear-gradient(135deg,#1557D4,#1A3A8F)", borderRadius:16,
              textDecoration:"none", color:"white", boxShadow:"0 6px 20px rgba(66,133,244,0.3)" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <div>
              <p style={{ fontWeight:800,marginBottom:2 }}>{t.googleLeave}</p>
              <p style={{ fontSize:13,opacity:0.75 }}>{t.googleSub}</p>
            </div>
            <svg style={{ marginLeft:"auto" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>

        {/* Stats */}
        {stats && stats.total > 0 && (
          <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:16, padding:"20px 24px", marginBottom:"2rem", display:"flex", gap:24, alignItems:"center", flexWrap:"wrap" }}>
            <div style={{ textAlign:"center", minWidth:80 }}>
              <p style={{ fontSize:48,fontWeight:900,color:"#E8323C",lineHeight:1 }}>{stats.avg_rating.toFixed(1)}</p>
              <Stars rating={Math.round(stats.avg_rating)} size={16} />
              <p style={{ fontSize:12,color:"var(--muted)",marginTop:4 }}>{stats.total} {lang==="es"?"reseñas":"reviews"}</p>
            </div>
            <div style={{ flex:1, minWidth:200 }}>
              {[5,4,3,2,1].map((star,i) => {
                const count = stats[starKeys[i]] ?? 0;
                const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={star} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <span style={{ fontSize:12,color:"var(--muted)",width:8 }}>{star}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <div style={{ flex:1,height:6,background:"var(--border)",borderRadius:4,overflow:"hidden" }}>
                      <div style={{ width:`${pct}%`,height:"100%",background:"#F59E0B",borderRadius:4,transition:"width 0.6s" }} />
                    </div>
                    <span style={{ fontSize:12,color:"var(--muted)",width:16 }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Own reviews header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem" }}>
          <h2 style={{ fontSize:"1.3rem", fontWeight:800 }}>{t.ownTitle}</h2>
          <button onClick={() => setShowForm(v => !v)}
            style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 18px",
              background:"#E8323C",color:"white",border:"none",borderRadius:24,
              fontWeight:700,fontSize:13,cursor:"pointer",letterSpacing:"0.05em" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            {t.writeBtn}
          </button>
        </div>

        {/* Review Form */}
        {showForm && (
          <div style={{ background:"var(--card)", border:"1.5px solid #E8323C44", borderRadius:18, padding:24, marginBottom:"2rem" }}>
            {submitted ? (
              <div style={{ textAlign:"center", padding:"1rem 0" }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00C47A" strokeWidth="2" style={{ margin:"0 auto 12px" }}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                <p style={{ fontWeight:800, fontSize:"1.2rem", color:"#00C47A" }}>{t.successTitle}</p>
                <p style={{ color:"var(--muted)", marginTop:4 }}>{t.successSub}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Stars */}
                <div style={{ marginBottom:16 }}>
                  <p style={{ fontSize:12,fontWeight:700,color:"#E8323C",letterSpacing:"0.08em",marginBottom:8 }}>{t.stars}</p>
                  <StarSelector value={rating} onChange={setRating} />
                </div>
                {/* Service type */}
                <div style={{ display:"flex", gap:8, marginBottom:16 }}>
                  {Object.entries(t.services).map(([k,v]) => (
                    <button key={k} type="button" onClick={() => setService(k)}
                      style={{ padding:"6px 14px", borderRadius:20, border:`1px solid ${service===k?"#E8323C":"var(--border)"}`,
                        background: service===k ? "#E8323C22" : "transparent",
                        color: service===k ? "#E8323C" : "var(--muted)",
                        fontWeight:600, fontSize:12, cursor:"pointer" }}>
                      {v}
                    </button>
                  ))}
                </div>
                {/* Name */}
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder={t.nameLabel} required
                  style={{ width:"100%",padding:"12px 16px",background:"var(--bg)",border:"1px solid var(--border)",
                    borderRadius:12,color:"var(--fg)",fontSize:14,marginBottom:12,boxSizing:"border-box" }} />
                {/* Comment */}
                <textarea value={comment} onChange={e => setComment(e.target.value)}
                  placeholder={t.commentLabel} required minLength={10} rows={4}
                  style={{ width:"100%",padding:"12px 16px",background:"var(--bg)",border:"1px solid var(--border)",
                    borderRadius:12,color:"var(--fg)",fontSize:14,resize:"vertical",marginBottom:16,boxSizing:"border-box" }} />
                <button type="submit" disabled={submitting}
                  style={{ width:"100%",padding:"14px",background:"#E8323C",color:"white",border:"none",
                    borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer",
                    opacity:submitting?0.7:1 }}>
                  {submitting ? "..." : t.submitBtn}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Reviews list */}
        {loading ? (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {[1,2,3].map(i => <div key={i} style={{ height:120,background:"var(--card)",borderRadius:16,animation:"pulse 1.5s infinite" }} />)}
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign:"center", padding:"3rem", background:"var(--card)", borderRadius:16, border:"1px solid var(--border)" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" style={{ margin:"0 auto 12px" }}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            <p style={{ color:"var(--muted)" }}>{t.noReviews}</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {reviews.map(review => (
              <div key={review.id}
                style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:16, padding:"20px 24px" }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:12 }}>
                  <div style={{ width:44,height:44,borderRadius:"50%",background:"#E8323C22",
                    display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    <span style={{ color:"#E8323C",fontWeight:900,fontSize:20 }}>
                      {review.customer_name[0].toUpperCase()}
                    </span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8 }}>
                      <p style={{ fontWeight:700,fontSize:"1rem" }}>{review.customer_name}</p>
                      <Stars rating={review.rating} size={16} />
                    </div>
                    {review.service_type && (
                      <span style={{ fontSize:11,color:"var(--muted)",background:"var(--border)",
                        padding:"2px 8px",borderRadius:20,marginTop:4,display:"inline-block" }}>
                        {review.service_type}
                      </span>
                    )}
                  </div>
                </div>
                <p style={{ color:"var(--fg-secondary,#ccc)",lineHeight:1.6 }}>{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}