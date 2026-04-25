"use client";

import { useState, useEffect, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

function getToken() { return typeof window !== "undefined" ? localStorage.getItem("admin_token") : null; }
function setToken(t: string) { localStorage.setItem("admin_token", t); }
function clearToken() { localStorage.removeItem("admin_token"); }

async function apiFetch(path: string, opts: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  if (res.status === 401) { clearToken(); window.location.reload(); }
  return res;
}

// ── Login ──────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr]   = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr("");
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password: pass }),
    });
    if (!res.ok) { setErr("Invalid credentials"); setLoading(false); return; }
    const data = await res.json();
    setToken(data.access_token);
    onLogin();
    setLoading(false);
  };

  return (
    <div className="adminLogin">
      <div className="adminLoginCard">
        <img src="/logo-safecar.png" alt="Safe Car" className="adminLoginLogo" />
        <h1>Admin Panel</h1>
        <p style={{ color: "rgba(255,255,255,.4)", fontSize: ".9rem", marginBottom: 28 }}>Sign in to manage your shop</p>
        <form onSubmit={submit} className="adminLoginForm">
          <label className="adminLabel">USERNAME
            <input className="ctInput" required value={user}
              onChange={e => setUser(e.target.value)} autoComplete="username" />
          </label>
          <label className="adminLabel">PASSWORD
            <input className="ctInput" type="password" required value={pass}
              onChange={e => setPass(e.target.value)} autoComplete="current-password" />
          </label>
          <button type="submit" className="cartCheckoutBtn" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? "Signing in..." : "Sign in →"}
          </button>
          {err && <p className="ctStatusErr" style={{ textAlign: "center" }}>{err}</p>}
        </form>
      </div>
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────
const SECTIONS = [
  { id: "dashboard",   label: "Dashboard",   icon: "📊" },
  { id: "parts",       label: "Parts",       icon: "🔧" },
  { id: "orders",      label: "Orders",      icon: "🛒" },
  { id: "modules",     label: "Training",    icon: "🎓" },
  { id: "enrollments", label: "Enrollments", icon: "📋" },
  { id: "quotes",      label: "Quotes",      icon: "💬" },
];

function Sidebar({ active, onSelect, onLogout }: {
  active: string; onSelect: (s: string) => void; onLogout: () => void;
}) {
  return (
    <aside className="adminSidebar">
      <div className="adminSidebarLogo">
        <a href="/" title="Back to site">
          <img src="/logo-safecar.png" alt="Safe Car" />
        </a>
      </div>
      <nav className="adminNav">
        {SECTIONS.map(s => (
          <button key={s.id}
            className={`adminNavBtn ${active === s.id ? "adminNavActive" : ""}`}
            onClick={() => onSelect(s.id)}>
            <span style={{ fontSize: "1.1rem" }}>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </nav>
      <button className="adminLogoutBtn" onClick={onLogout}>← Log out</button>
    </aside>
  );
}

// ── Badge ──────────────────────────────────────────────────
function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: "#16a34a", pending: "#d97706", awaiting_verification: "#2563eb",
    failed: "#dc2626", active: "#16a34a",
  };
  const color = map[status] || "#6b7280";
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: "999px",
      fontSize: ".7rem", fontWeight: 700, letterSpacing: ".05em",
      background: `${color}22`, color, border: `1px solid ${color}44`,
      textTransform: "uppercase",
    }}>{status.replace(/_/g, " ")}</span>
  );
}

// ── Toast ──────────────────────────────────────────────────
function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: "#16a34a", color: "#fff", padding: "12px 20px",
      borderRadius: 12, fontSize: ".9rem", fontWeight: 600,
      boxShadow: "0 8px 24px rgba(0,0,0,.4)",
    }}>✓ {msg}</div>
  );
}

// ══ DASHBOARD ══════════════════════════════════════════════
function Dashboard({ onNavigate }: { onNavigate: (s: string) => void }) {
  const [stats, setStats] = useState({ parts: 0, orders: 0, enrollments: 0, quotes: 0, revenue: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch("/parts/?limit=200").then(r => r.json()),
      apiFetch("/orders/admin/all").then(r => r.json()),
      apiFetch("/training/admin/enrollments").then(r => r.json()),
      apiFetch("/quote-requests/").then(r => r.json()),
    ]).then(([parts, orders, enrollments, quotes]) => {
      const revenue = [...orders, ...enrollments]
        .filter((x: any) => x.payment_status === "paid")
        .reduce((s: number, x: any) => s + (x.total || x.amount || 0), 0);
      const pending = [...orders, ...enrollments]
        .filter((x: any) => x.payment_status === "awaiting_verification").length;
      setStats({ parts: parts.length, orders: orders.length, enrollments: enrollments.length, quotes: quotes.length, revenue, pending });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Total Parts",      value: stats.parts,                  section: "parts",       color: "#3b82f6" },
    { label: "Orders",           value: stats.orders,                  section: "orders",      color: "#8b5cf6" },
    { label: "Enrollments",      value: stats.enrollments,             section: "enrollments", color: "#ec4899" },
    { label: "Quote Requests",   value: stats.quotes,                  section: "quotes",      color: "#f59e0b" },
    { label: "Revenue (paid)",   value: `$${stats.revenue.toFixed(2)}`, section: "orders",     color: "#10b981" },
    { label: "Pending Approval", value: stats.pending,                 section: "orders",      color: "#ef4444" },
  ];

  return (
    <div className="adminSection">
      <div className="adminSectionHead">
        <h2>Dashboard</h2>
        <span style={{ fontSize: ".82rem", color: "rgba(255,255,255,.3)" }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </span>
      </div>
      {loading ? <p className="adminLoading">Loading stats...</p> : (
        <div className="adminStatsGrid">
          {cards.map(card => (
            <button key={card.label} className="adminStatCard" onClick={() => onNavigate(card.section)}>
              <p className="adminStatLabel">{card.label}</p>
              <p className="adminStatValue" style={{ color: card.color }}>{card.value}</p>
              <p className="adminStatLink">View →</p>
            </button>
          ))}
        </div>
      )}
      <div className="adminDashInfo">
        <div className="adminDashInfoCard">
          <h3>Quick access</h3>
          <p>Click any stat card above to go directly to that section.</p>
          <p style={{ marginTop: 8 }}>Use the sidebar to navigate between sections.</p>
        </div>
        <div className="adminDashInfoCard">
          <h3>Credentials</h3>
          <p>Change admin credentials by updating <code style={{ color: "#d91f26" }}>ADMIN_USERNAME</code> and <code style={{ color: "#d91f26" }}>ADMIN_PASSWORD</code> in your <code>.env</code> file.</p>
        </div>
      </div>
    </div>
  );
}

// ══ PARTS ══════════════════════════════════════════════════
const EMPTY_PART = { name: "", description: "", category: "", brand: "", sku: "", price: "", stock: "0", image_url: "", compatible_vehicles: "" };

function PartsSection() {
  const [parts, setParts]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState<any>(null);
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState("");
  const [toast, setToast]     = useState("");
  const [search, setSearch]   = useState("");
  const [catFilter, setCatFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const r = await apiFetch("/parts/?limit=200");
    setParts(await r.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const cats = [...new Set(parts.map((p: any) => p.category))].sort();
  const filtered = parts.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !catFilter || p.category === catFilter;
    return matchSearch && matchCat;
  });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr("");
    const isNew = !form.id;
    const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) };
    const res = await apiFetch(
      isNew ? "/parts/admin/create" : `/parts/admin/${form.id}`,
      { method: isNew ? "POST" : "PATCH", body: JSON.stringify(payload) }
    );
    if (!res.ok) { setErr("Save failed — check all fields"); setSaving(false); return; }
    setForm(null);
    setToast(isNew ? "Part created!" : "Part updated!");
    load(); setSaving(false);
  };

  const del = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await apiFetch(`/parts/admin/${id}`, { method: "DELETE" });
    setToast("Part deleted");
    load();
  };

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p: any) => ({ ...p, [k]: e.target.value }));

  if (form !== null) return (
    <div className="adminSection">
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
      <div className="adminSectionHead">
        <h2>{form.id ? `Edit: ${form.name}` : "Add New Part"}</h2>
        <button className="adminBtnGhost" onClick={() => setForm(null)}>← Back to list</button>
      </div>
      <form onSubmit={save} className="adminForm">
        {form.image_url && (
          <div style={{ marginBottom: 20 }}>
            <img src={form.image_url} alt="Preview"
              style={{ width: 200, height: 140, objectFit: "cover", borderRadius: 12, border: "1px solid rgba(255,255,255,.08)" }} />
          </div>
        )}
        <div className="adminFormGrid">
          <label className="adminLabel">Part name *
            <input className="ctInput" required placeholder="Front Brake Pad Set" value={form.name || ""} onChange={f("name")} />
          </label>
          <label className="adminLabel">Category *
            <input className="ctInput" required placeholder="Brakes, Engine, Electrical..." value={form.category || ""} onChange={f("category")} />
          </label>
          <label className="adminLabel">Brand
            <input className="ctInput" placeholder="Bosch, NGK, Monroe..." value={form.brand || ""} onChange={f("brand")} />
          </label>
          <label className="adminLabel">SKU
            <input className="ctInput" placeholder="BPF-4421" value={form.sku || ""} onChange={f("sku")} />
          </label>
          <label className="adminLabel">Price (USD) *
            <input className="ctInput" type="number" step=".01" min="0" required placeholder="49.99" value={form.price || ""} onChange={f("price")} />
          </label>
          <label className="adminLabel">Stock quantity
            <input className="ctInput" type="number" min="0" placeholder="0" value={form.stock ?? 0} onChange={f("stock")} />
          </label>
          <label className="adminLabel" style={{ gridColumn: "1/-1" }}>Image
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
              <label style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                height: 38, padding: "0 14px",
                background: "rgba(217,31,38,.12)", border: "1px solid rgba(217,31,38,.3)",
                borderRadius: 10, color: "#d91f26", fontSize: ".8rem", fontWeight: 700,
                cursor: "pointer", flexShrink: 0,
              }}>
                📁 Upload from PC
                <input type="file" accept="image/*" style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const fd = new FormData();
                    fd.append("file", file);
                    try {
                      const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
                      const res = await fetch(`${API}/upload/image`, {
                        method: "POST",
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                        body: fd,
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setForm((p: any) => ({ ...p, image_url: data.url }));
                      } else { alert("Upload failed"); }
                    } catch { alert("Upload error"); }
                  }} />
              </label>
              <span style={{ color: "rgba(255,255,255,.2)", fontSize: ".78rem" }}>or paste URL:</span>
            </div>
            <input className="ctInput" placeholder="https://images.unsplash.com/..." value={form.image_url || ""} onChange={f("image_url")} />
          </label>
          <label className="adminLabel" style={{ gridColumn: "1/-1" }}>Description
            <textarea className="ctInput ctTextarea" rows={3}
              placeholder="Describe the part, material, specs..."
              value={form.description || ""} onChange={f("description")} />
          </label>
          <label className="adminLabel" style={{ gridColumn: "1/-1" }}>Compatible vehicles
            <input className="ctInput" placeholder="Toyota Camry 2018-2023, Honda Accord 2017-2022"
              value={form.compatible_vehicles || ""} onChange={f("compatible_vehicles")} />
          </label>
        </div>
        {err && <p className="ctStatusErr">{err}</p>}
        <div className="adminFormActions">
          <button type="submit" className="cartCheckoutBtn" disabled={saving} style={{ width: "auto", padding: "0 32px" }}>
            {saving ? "Saving..." : form.id ? "Save changes" : "Create part"}
          </button>
          <button type="button" className="adminBtnGhost" onClick={() => setForm(null)}>Cancel</button>
          {form.id && (
            <button type="button" className="adminBtnGhost" style={{ marginLeft: "auto", color: "#f87171", borderColor: "rgba(248,113,113,.3)" }}
              onClick={() => del(form.id, form.name)}>
              Delete this part
            </button>
          )}
        </div>
      </form>
    </div>
  );

  return (
    <div className="adminSection">
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
      <div className="adminSectionHead">
        <h2>Parts ({filtered.length}{search || catFilter ? ` of ${parts.length}` : ""})</h2>
        <button className="adminBtnPrimary" onClick={() => setForm({ ...EMPTY_PART })}>+ Add part</button>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <input className="ctInput" placeholder="Search parts..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 180, height: 38 }} />
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {["", ...cats].map(cat => (
          <button key={cat || "all"} onClick={() => setCatFilter(cat)}
            style={{
              height: 34, padding: "0 14px", borderRadius: "999px",
              border: "1px solid", cursor: "pointer", fontSize: ".8rem", fontWeight: 600,
              background: catFilter === cat ? "rgba(217,31,38,.15)" : "rgba(255,255,255,.04)",
              borderColor: catFilter === cat ? "rgba(217,31,38,.5)" : "rgba(255,255,255,.1)",
              color: catFilter === cat ? "#ffffff" : "rgba(255,255,255,.5)",
              transition: "all .15s",
            }}>
            {cat || "All categories"}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="adminLoading">Loading parts...</p>
      ) : filtered.length === 0 ? (
        <p className="adminLoading">No parts found.</p>
      ) : (
        <div className="adminPartsGrid">
          {filtered.map(p => (
            <div key={p.id} className="adminPartCard">
              <div className="adminPartImg">
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} />
                  : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "rgba(255,255,255,.1)" }}>No image</div>
                }
                <span className="adminPartCat">{p.category}</span>
              </div>
              <div className="adminPartInfo">
                {p.brand && <p className="adminPartBrand">{p.brand}</p>}
                <p className="adminPartName">{p.name}</p>
                <div className="adminPartMeta">
                  <span className="adminPartPrice">${p.price?.toFixed(2)}</span>
                  <span style={{ color: p.stock > 5 ? "#16a34a" : p.stock > 0 ? "#d97706" : "#ef4444", fontSize: ".78rem", fontWeight: 700 }}>
                    {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                  </span>
                </div>
                <button className="adminBtnSm" style={{ marginTop: 10, width: "100%" }}
                  onClick={() => setForm({ ...p, price: p.price?.toString(), stock: p.stock?.toString() })}>
                  Edit →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══ ORDERS ═════════════════════════════════════════════════
function OrdersSection() {
  const [orders, setOrders]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [toast, setToast]     = useState("");
  const [filter, setFilter]   = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    const r = await apiFetch("/orders/admin/all");
    setOrders(await r.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const confirmOrder = async (id: number) => {
    await apiFetch(`/orders/${id}/confirm-manual`, {
      method: "POST", body: JSON.stringify({ order_id: id, confirmation_note: "Confirmed by admin" })
    });
    setToast("Payment confirmed!");
    load();
    if (selected?.id === id) setSelected((prev: any) => ({ ...prev, payment_status: "paid" }));
  };

  const statusFilters = ["all", "pending", "awaiting_verification", "paid", "failed"];
  const filtered = filter === "all" ? orders : orders.filter(o => o.payment_status === filter);

  if (selected) return (
    <div className="adminSection">
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
      <div className="adminSectionHead">
        <h2>Order <code style={{ color: "#d91f26" }}>{selected.reference}</code></h2>
        <button className="adminBtnGhost" onClick={() => setSelected(null)}>← Back to orders</button>
      </div>
      <div className="adminDetailGrid" style={{ marginBottom: 16 }}>
        <div className="adminDetailCard">
          <h3>Customer</h3>
          <p><strong>{selected.customer_name}</strong></p>
          <p><a href={`mailto:${selected.customer_email}`} style={{ color: "#d91f26" }}>{selected.customer_email}</a></p>
          <p><a href={`tel:${selected.customer_phone}`} style={{ color: "#d91f26" }}>{selected.customer_phone}</a></p>
          <p style={{ marginTop: 8, color: "rgba(255,255,255,.5)" }}>{selected.shipping_address}</p>
        </div>
        <div className="adminDetailCard">
          <h3>Payment</h3>
          <p>Method: <strong style={{ textTransform: "capitalize" }}>{selected.payment_method?.replace("_", " ")}</strong></p>
          <p style={{ marginTop: 8 }}>Status: <Badge status={selected.payment_status} /></p>
          <p style={{ marginTop: 8 }}>Total: <strong style={{ color: "#d91f26", fontSize: "1.2rem" }}>${selected.total?.toFixed(2)}</strong></p>
          <p style={{ marginTop: 4, fontSize: ".78rem", color: "rgba(255,255,255,.3)" }}>
            {new Date(selected.created_at).toLocaleString()}
          </p>
          {selected.payment_status === "awaiting_verification" && (
            <button className="adminBtnPrimary" style={{ marginTop: 14, width: "100%" }} onClick={() => confirmOrder(selected.id)}>
              ✓ Confirm payment
            </button>
          )}
        </div>
      </div>
      <div className="adminDetailCard">
        <h3>Items ordered</h3>
        <table style={{ width: "100%", marginTop: 8 }}>
          <thead><tr>
            <th style={{ textAlign: "left", color: "rgba(255,255,255,.3)", fontSize: ".72rem", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,.07)" }}>Part</th>
            <th style={{ textAlign: "center", color: "rgba(255,255,255,.3)", fontSize: ".72rem", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,.07)" }}>Qty</th>
            <th style={{ textAlign: "right", color: "rgba(255,255,255,.3)", fontSize: ".72rem", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,.07)" }}>Unit</th>
            <th style={{ textAlign: "right", color: "rgba(255,255,255,.3)", fontSize: ".72rem", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,.07)" }}>Subtotal</th>
          </tr></thead>
          <tbody>
            {selected.items?.map((it: any, i: number) => (
              <tr key={i}>
                <td style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.05)", fontSize: ".88rem" }}>{it.part_name}</td>
                <td style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.05)", textAlign: "center" }}>{it.quantity}</td>
                <td style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.05)", textAlign: "right" }}>${it.unit_price?.toFixed(2)}</td>
                <td style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.05)", textAlign: "right", fontWeight: 700 }}>${it.subtotal?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.07)" }}>
          <strong style={{ fontSize: "1.1rem" }}>Total: ${selected.total?.toFixed(2)}</strong>
        </div>
      </div>
    </div>
  );

  return (
    <div className="adminSection">
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
      <div className="adminSectionHead">
        <h2>Orders ({filtered.length})</h2>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {statusFilters.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{
              height: 32, padding: "0 14px", borderRadius: "999px", border: "1px solid", fontSize: ".78rem", fontWeight: 600, cursor: "pointer",
              background: filter === s ? "rgba(217,31,38,.12)" : "rgba(255,255,255,.04)",
              borderColor: filter === s ? "rgba(217,31,38,.4)" : "rgba(255,255,255,.08)",
              color: filter === s ? "#fff" : "rgba(255,255,255,.5)",
            }}>
            {s === "all" ? "All" : s.replace(/_/g, " ")}
            {s !== "all" && <span style={{ marginLeft: 6, opacity: .6 }}>({orders.filter(o => o.payment_status === s).length})</span>}
          </button>
        ))}
      </div>
      {loading ? <p className="adminLoading">Loading orders...</p> : (
        <div className="adminTable">
          <table>
            <thead><tr>
              <th>Reference</th><th>Customer</th><th>Method</th>
              <th>Status</th><th>Total</th><th>Date</th><th></th>
            </tr></thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id}>
                  <td><code style={{ color: "#d91f26", fontSize: ".8rem" }}>{o.reference}</code></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{o.customer_name}</div>
                    <div style={{ fontSize: ".75rem", color: "rgba(255,255,255,.35)" }}>{o.customer_email}</div>
                  </td>
                  <td style={{ textTransform: "capitalize" }}>{o.payment_method?.replace("_", " ")}</td>
                  <td><Badge status={o.payment_status} /></td>
                  <td style={{ fontWeight: 700 }}>${o.total?.toFixed(2)}</td>
                  <td style={{ color: "rgba(255,255,255,.4)", fontSize: ".78rem" }}>{o.created_at?.slice(0, 10)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="adminBtnSm" onClick={() => setSelected(o)}>View</button>
                      {o.payment_status === "awaiting_verification" && (
                        <button className="adminBtnSm" style={{ background: "rgba(22,163,74,.15)", borderColor: "rgba(22,163,74,.3)", color: "#4ade80" }}
                          onClick={() => confirmOrder(o.id)}>✓</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ══ TRAINING MODULES ═══════════════════════════════════════
const EMPTY_MODULE = {
  title: "", title_es: "", description: "", description_es: "",
  duration_weeks: "4", price: "", mode: "hybrid",
  max_students: "20", schedule: "", image_url: "", is_active: true, sort_order: "0",
};

function ModulesSection() {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState<any>(null);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState("");
  const [err, setErr]         = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const r = await apiFetch("/training/modules");
    setModules(await r.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr("");
    const payload = {
      ...form,
      price:          parseFloat(form.price),
      duration_weeks: parseInt(form.duration_weeks),
      max_students:   parseInt(form.max_students),
      sort_order:     parseInt(form.sort_order || "0"),
    };
    const isNew = !form.id;
    const res = await apiFetch(
      isNew ? "/training/admin/modules" : `/training/admin/modules/${form.id}`,
      { method: isNew ? "POST" : "PATCH", body: JSON.stringify(payload) }
    );
    if (!res.ok) { setErr("Save failed — check all fields"); setSaving(false); return; }
    setToast(isNew ? "Module created!" : "Module updated!");
    setForm(null); load(); setSaving(false);
  };

  const del = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await apiFetch(`/training/admin/modules/${id}`, { method: "DELETE" });
    setToast("Module deleted");
    load();
  };

  const f = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p: any) => ({ ...p, [k]: e.target.value }));

  // ── Form ──
  if (form !== null) return (
    <div className="adminSection">
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
      <div className="adminSectionHead">
        <h2>{form.id ? `Edit: ${form.title}` : "New Training Module"}</h2>
        <button className="adminBtnGhost" onClick={() => setForm(null)}>← Back</button>
      </div>
      <form onSubmit={save} className="adminForm">

        {form.image_url && (
          <div style={{ marginBottom: 20 }}>
            <img src={form.image_url} alt="Preview"
              style={{ width: 220, height: 150, objectFit: "cover", borderRadius: 12, border: "1px solid rgba(255,255,255,.08)" }} />
          </div>
        )}

        <div className="adminFormGrid">
          <label className="adminLabel">Title (English) *
            <input className="ctInput" required value={form.title || ""} onChange={f("title")} placeholder="Automotive Electronics" />
          </label>
          <label className="adminLabel">Título (Español)
            <input className="ctInput" value={form.title_es || ""} onChange={f("title_es")} placeholder="Electrónica Automotriz" />
          </label>

          <label className="adminLabel">Price (USD) *
            <input className="ctInput" type="number" step=".01" required
              placeholder="299.00" value={form.price || ""} onChange={f("price")} />
          </label>
          <label className="adminLabel">Duration weeks (0 = Open)
            <input className="ctInput" type="number" min="0" value={form.duration_weeks ?? 4} onChange={f("duration_weeks")} />
          </label>

          <label className="adminLabel">Mode
            <select className="ctInput" value={form.mode || "hybrid"} onChange={f("mode")}
              style={{ background: "rgba(255,255,255,.05)", cursor: "pointer" }}>
              <option value="hybrid">Hybrid</option>
              <option value="online">Online</option>
              <option value="presential">In-person</option>
            </select>
          </label>
          <label className="adminLabel">Max students
            <input className="ctInput" type="number" min="1" value={form.max_students ?? 20} onChange={f("max_students")} />
          </label>

          <label className="adminLabel" style={{ gridColumn: "1/-1" }}>Schedule
            <input className="ctInput" placeholder="Saturdays 9AM–1PM" value={form.schedule || ""} onChange={f("schedule")} />
          </label>

          {/* Upload imagen */}
          <label className="adminLabel" style={{ gridColumn: "1/-1" }}>Image
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
              <label style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                height: 38, padding: "0 14px",
                background: "rgba(217,31,38,.12)", border: "1px solid rgba(217,31,38,.3)",
                borderRadius: 10, color: "#d91f26", fontSize: ".8rem", fontWeight: 700,
                cursor: "pointer", flexShrink: 0,
              }}>
                📁 Upload from PC
                <input type="file" accept="image/*" style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const fd = new FormData();
                    fd.append("file", file);
                    try {
                      const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
                      const res = await fetch(`${API}/upload/image`, {
                        method: "POST",
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                        body: fd,
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setForm((p: any) => ({ ...p, image_url: data.url }));
                      } else { alert("Upload failed"); }
                    } catch { alert("Upload error — is the backend running?"); }
                  }} />
              </label>
              <span style={{ color: "rgba(255,255,255,.2)", fontSize: ".78rem" }}>or paste URL:</span>
            </div>
            <input className="ctInput" placeholder="https://..." value={form.image_url || ""} onChange={f("image_url")} />
          </label>

          <label className="adminLabel" style={{ gridColumn: "1/-1" }}>Description (EN)
            <textarea className="ctInput ctTextarea" rows={4}
              placeholder="What students will learn, tools used, outcomes..."
              value={form.description || ""} onChange={f("description")} />
          </label>
          <label className="adminLabel" style={{ gridColumn: "1/-1" }}>Descripción (ES)
            <textarea className="ctInput ctTextarea" rows={4}
              placeholder="Qué aprenderán, herramientas, resultados..."
              value={form.description_es || ""} onChange={f("description_es")} />
          </label>

          <label className="adminLabel">Sort order
            <input className="ctInput" type="number" min="0" value={form.sort_order ?? 0} onChange={f("sort_order")} />
          </label>
          <label className="adminLabel" style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 20 }}>
            <input type="checkbox" checked={!!form.is_active}
              onChange={e => setForm((p: any) => ({ ...p, is_active: e.target.checked }))} />
            <span style={{ textTransform: "none", letterSpacing: 0, color: "rgba(255,255,255,.6)", fontSize: ".88rem" }}>
              Active (visible on site)
            </span>
          </label>
        </div>

        {err && <p className="ctStatusErr">{err}</p>}

        <div className="adminFormActions">
          <button type="submit" className="cartCheckoutBtn" disabled={saving}
            style={{ width: "auto", padding: "0 32px" }}>
            {saving ? "Saving..." : form.id ? "Save changes" : "Create module"}
          </button>
          <button type="button" className="adminBtnGhost" onClick={() => setForm(null)}>Cancel</button>
          {form.id && (
            <button type="button" className="adminBtnGhost"
              style={{ marginLeft: "auto", color: "#f87171", borderColor: "rgba(248,113,113,.3)" }}
              onClick={() => del(form.id, form.title)}>
              🗑 Delete this module
            </button>
          )}
        </div>
      </form>
    </div>
  );

  // ── List ──
  return (
    <div className="adminSection">
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
      <div className="adminSectionHead">
        <h2>Training Modules ({modules.length})</h2>
        <button className="adminBtnPrimary" onClick={() => setForm({ ...EMPTY_MODULE })}>+ Add module</button>
      </div>
      {loading ? (
        <p className="adminLoading">Loading...</p>
      ) : modules.length === 0 ? (
        <p className="adminLoading">No modules yet — add your first one above.</p>
      ) : (
        <div className="adminPartsGrid">
          {modules.map(m => (
            <div key={m.id} className="adminPartCard">
              <div className="adminPartImg">
                {m.image_url
                  ? <img src={m.image_url} alt={m.title} />
                  : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "2rem" }}>🎓</div>
                }
                <span className="adminPartCat" style={{ textTransform: "capitalize" }}>{m.mode}</span>
              </div>
              <div className="adminPartInfo">
                <p className="adminPartName">{m.title}</p>
                {m.title_es && <p className="adminPartBrand">{m.title_es}</p>}
                <div className="adminPartMeta">
                  <span className="adminPartPrice">${m.price?.toFixed(2)}</span>
                  <span style={{ fontSize: ".75rem", color: "rgba(255,255,255,.35)" }}>
                    {m.duration_weeks > 0 ? `${m.duration_weeks} wks` : "Open"}
                  </span>
                </div>
                <p style={{ fontSize: ".72rem", margin: "6px 0 0", color: "rgba(255,255,255,.3)" }}>
                  <span style={{ color: m.enrolled_count >= m.max_students ? "#ef4444" : "#16a34a", fontWeight: 700 }}>
                    {m.enrolled_count || 0}
                  </span>{" / "}{m.max_students} enrolled
                </p>
                <button className="adminBtnSm" style={{ marginTop: 10, width: "100%" }}
                  onClick={() => setForm({
                    ...m,
                    price:          m.price?.toString(),
                    duration_weeks: m.duration_weeks?.toString(),
                    max_students:   m.max_students?.toString(),
                    sort_order:     (m.sort_order ?? 0).toString(),
                  })}>
                  Edit →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══ ENROLLMENTS ════════════════════════════════════════════
function EnrollmentsSection() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast]     = useState("");
  const [filter, setFilter]   = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    const r = await apiFetch("/training/admin/enrollments");
    setEnrollments(await r.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const confirmEnrollment = async (id: number) => {
    await apiFetch(`/training/admin/enrollments/${id}/confirm`, { method: "POST" });
    setToast("Enrollment confirmed!");
    load();
  };

  const filtered = filter === "all" ? enrollments : enrollments.filter(e => e.payment_status === filter);

  return (
    <div className="adminSection">
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
      <div className="adminSectionHead">
        <h2>Enrollments ({filtered.length})</h2>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["all", "awaiting_verification", "paid", "pending"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{
              height: 32, padding: "0 14px", borderRadius: "999px", border: "1px solid", fontSize: ".78rem", fontWeight: 600, cursor: "pointer",
              background: filter === s ? "rgba(217,31,38,.12)" : "rgba(255,255,255,.04)",
              borderColor: filter === s ? "rgba(217,31,38,.4)" : "rgba(255,255,255,.08)",
              color: filter === s ? "#fff" : "rgba(255,255,255,.5)",
            }}>
            {s === "all" ? "All" : s.replace(/_/g, " ")}
            {s !== "all" && <span style={{ marginLeft: 6, opacity: .6 }}>({enrollments.filter(e => e.payment_status === s).length})</span>}
          </button>
        ))}
      </div>
      {loading ? <p className="adminLoading">Loading...</p> : (
        <div className="adminTable">
          <table>
            <thead><tr>
              <th>Reference</th><th>Student</th><th>Module</th>
              <th>Method</th><th>Status</th><th>Amount</th><th></th>
            </tr></thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td><code style={{ color: "#d91f26", fontSize: ".78rem" }}>{e.reference}</code></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{e.student_name}</div>
                    <div style={{ fontSize: ".75rem", color: "rgba(255,255,255,.35)" }}>{e.student_email}</div>
                  </td>
                  <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.module_title}</td>
                  <td style={{ textTransform: "capitalize" }}>{e.payment_method?.replace("_", " ")}</td>
                  <td><Badge status={e.payment_status} /></td>
                  <td>${e.amount?.toFixed(2)}</td>
                  <td>
                    {e.payment_status === "awaiting_verification" && (
                      <button className="adminBtnSm"
                        style={{ background: "rgba(22,163,74,.15)", borderColor: "rgba(22,163,74,.3)", color: "#4ade80" }}
                        onClick={() => confirmEnrollment(e.id)}>✓ Confirm</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ══ QUOTES ═════════════════════════════════════════════════
function QuotesSection() {
  const [quotes, setQuotes]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    apiFetch("/quote-requests/").then(r => r.json()).then(d => { setQuotes(d); setLoading(false); });
  }, []);

  if (selected) return (
    <div className="adminSection">
      <div className="adminSectionHead">
        <h2>Quote #{selected.id}</h2>
        <button className="adminBtnGhost" onClick={() => setSelected(null)}>← Back</button>
      </div>
      <div className="adminDetailCard" style={{ maxWidth: 600 }}>
        <div className="adminDetailGrid" style={{ marginBottom: 16 }}>
          <div>
            <p className="adminDetailLabel">Customer</p>
            <p style={{ fontWeight: 700, fontSize: "1.05rem" }}>{selected.name}</p>
          </div>
          <div>
            <p className="adminDetailLabel">Phone</p>
            <p><a href={`tel:${selected.phone}`} style={{ color: "#d91f26", fontWeight: 600, fontSize: "1.05rem" }}>{selected.phone}</a></p>
          </div>
          <div>
            <p className="adminDetailLabel">Vehicle</p>
            <p>{selected.vehicle}</p>
          </div>
          <div>
            <p className="adminDetailLabel">Date</p>
            <p>{new Date(selected.created_at).toLocaleString()}</p>
          </div>
        </div>
        <div>
          <p className="adminDetailLabel">Issue description</p>
          <p style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", padding: "14px 16px", borderRadius: 10, lineHeight: 1.7, marginTop: 6 }}>{selected.issue}</p>
        </div>
        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <a href={`tel:${selected.phone}`} className="adminBtnPrimary" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>📞 Call now</a>
          <a href={`sms:${selected.phone}`} className="adminBtnGhost" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>💬 Send SMS</a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="adminSection">
      <div className="adminSectionHead">
        <h2>Quote Requests ({quotes.length})</h2>
      </div>
      {loading ? <p className="adminLoading">Loading...</p> : (
        <div className="adminTable">
          <table>
            <thead><tr>
              <th>#</th><th>Name</th><th>Phone</th><th>Vehicle</th><th>Issue</th><th>Date</th><th></th>
            </tr></thead>
            <tbody>
              {quotes.map(q => (
                <tr key={q.id}>
                  <td style={{ color: "rgba(255,255,255,.3)" }}>{q.id}</td>
                  <td><strong>{q.name}</strong></td>
                  <td><a href={`tel:${q.phone}`} style={{ color: "#d91f26", fontWeight: 600 }}>{q.phone}</a></td>
                  <td>{q.vehicle}</td>
                  <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "rgba(255,255,255,.5)" }}>{q.issue}</td>
                  <td style={{ color: "rgba(255,255,255,.4)", fontSize: ".78rem" }}>{q.created_at?.slice(0, 10)}</td>
                  <td><button className="adminBtnSm" onClick={() => setSelected(q)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ══ MAIN ═══════════════════════════════════════════════════
export default function AdminPage() {
  const [authed,   setAuthed]   = useState(false);
  const [section,  setSection]  = useState("dashboard");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { setChecking(false); return; }
    apiFetch("/auth/me").then(r => {
      if (r.ok) setAuthed(true);
      setChecking(false);
    }).catch(() => setChecking(false));
  }, []);

  if (checking) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#07080b" }}>
      <p style={{ color: "rgba(255,255,255,.3)" }}>Loading...</p>
    </div>
  );

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  const logout = () => { clearToken(); setAuthed(false); setSection("dashboard"); };

  const views: Record<string, React.ReactNode> = {
    dashboard:   <Dashboard onNavigate={setSection} />,
    parts:       <PartsSection />,
    orders:      <OrdersSection />,
    modules:     <ModulesSection />,
    enrollments: <EnrollmentsSection />,
    quotes:      <QuotesSection />,
  };

  return (
    <div className="adminLayout">
      <Sidebar active={section} onSelect={setSection} onLogout={logout} />
      <main className="adminMain">{views[section]}</main>
    </div>
  );
}