"use client";

import { useEffect, useState, useCallback } from "react";
import { useCart } from "@/context/CartContext";
import { useLang } from "@/context/LangContext";
import { site } from "@/lib/content";

const txt = {
  en: {
    eyebrow: "Parts & Components",
    title: "Shop repair parts",
    sub: "Quality parts for domestic, Asian and European vehicles.",
    all: "All categories",
    search: "Search parts...",
    inStock: "In stock only",
    addCart: "Add to cart",
    added: "Added!",
    noResults: "No parts found.",
    cart: "Cart",
    empty: "Your cart is empty.",
    checkout: "Proceed to checkout",
    remove: "Remove",
    total: "Total",
    qty: "Qty",
    // Checkout form
    checkoutTitle: "Checkout",
    yourName: "Full name",
    email: "Email",
    phone: "Phone",
    address: "Shipping address",
    pay: "Pay now",
    paying: "Processing...",
    orderOk: "Order confirmed! We'll contact you shortly.",
    orderErr: "Payment failed. Please try again.",
    back: "← Back to shop",
  },
  es: {
    eyebrow: "Repuestos y Componentes",
    title: "Compra repuestos",
    sub: "Repuestos de calidad para vehículos domésticos, asiáticos y europeos.",
    all: "Todas las categorías",
    search: "Buscar repuestos...",
    inStock: "Solo en stock",
    addCart: "Agregar al carrito",
    added: "¡Agregado!",
    noResults: "No se encontraron repuestos.",
    cart: "Carrito",
    empty: "Tu carrito está vacío.",
    checkout: "Ir al pago",
    remove: "Eliminar",
    total: "Total",
    qty: "Cant",
    checkoutTitle: "Pago",
    yourName: "Nombre completo",
    email: "Correo",
    phone: "Teléfono",
    address: "Dirección de envío",
    pay: "Pagar ahora",
    paying: "Procesando...",
    orderOk: "¡Pedido confirmado! Te contactaremos pronto.",
    orderErr: "Pago fallido. Intenta de nuevo.",
    back: "← Volver a la tienda",
  },
};

interface Part {
  id: number;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  image_url: string;
  compatible_vehicles: string;
}

// ── PART CARD ─────────────────────────────────────────────
function PartCard({ part, t }: { part: Part; t: typeof txt["en"] }) {
  const { add } = useCart();
  const [flash, setFlash] = useState(false);

  const handleAdd = () => {
    add({ id: part.id, name: part.name, price: part.price, image_url: part.image_url });
    setFlash(true);
    setTimeout(() => setFlash(false), 1400);
  };

  return (
    <article className="partCard">
      <div className="partImg">
        {part.image_url
          ? <img src={part.image_url} alt={part.name} />
          : <div className="partImgPlaceholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
                  stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
        }
        {part.stock <= 0 && <span className="partOutStock">Out of stock</span>}
        {part.stock > 0 && part.stock <= 5 && (
          <span className="partLowStock">Only {part.stock} left</span>
        )}
      </div>
      <div className="partInfo">
        {part.brand && <p className="partBrand">{part.brand}</p>}
        <h3 className="partName">{part.name}</h3>
        {part.description && <p className="partDesc">{part.description}</p>}
        {part.compatible_vehicles && (
          <p className="partCompat">Fits: {part.compatible_vehicles}</p>
        )}
        <div className="partFooter">
          <span className="partPrice">${part.price.toFixed(2)}</span>
          <button
            className={`partAddBtn ${flash ? "partAdded" : ""}`}
            onClick={handleAdd}
            disabled={part.stock <= 0}
          >
            {flash ? t.added : t.addCart}
          </button>
        </div>
      </div>
    </article>
  );
}

// ── CART DRAWER ────────────────────────────────────────────
function CartDrawer({ open, onClose, onCheckout, t }: {
  open: boolean; onClose: () => void;
  onCheckout: () => void; t: typeof txt["en"];
}) {
  const { items, total, remove, update } = useCart();

  return (
    <>
      {open && <div className="cartBackdrop" onClick={onClose} />}
      <div className={`cartDrawer ${open ? "cartOpen" : ""}`}>
        <div className="cartHead">
          <h2>{t.cart}</h2>
          <button onClick={onClose} className="cartClose">✕</button>
        </div>
        {items.length === 0
          ? <p className="cartEmpty">{t.empty}</p>
          : (
            <>
              <div className="cartItems">
                {items.map(item => (
                  <div key={item.id} className="cartItem">
                    {item.image_url && <img src={item.image_url} alt={item.name} className="cartItemImg" />}
                    <div className="cartItemInfo">
                      <p className="cartItemName">{item.name}</p>
                      <p className="cartItemPrice">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="cartItemQty">
                      <button onClick={() => update(item.id, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => update(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <button className="cartItemRemove" onClick={() => remove(item.id)}>✕</button>
                  </div>
                ))}
              </div>
              <div className="cartFooter">
                <div className="cartTotal">
                  <span>{t.total}</span>
                  <strong>${total.toFixed(2)}</strong>
                </div>
                <button className="cartCheckoutBtn" onClick={onCheckout}>
                  {t.checkout}
                </button>
              </div>
            </>
          )
        }
      </div>
    </>
  );
}

// ── CHECKOUT ──────────────────────────────────────────────
function CheckoutPage({ onBack, t }: { onBack: () => void; t: typeof txt["en"] }) {
  const { items, total, clear } = useCart();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [status, setStatus] = useState<"idle"|"paying"|"ok"|"err">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("paying");
    try {
      // 1. Create order
      const orderRes = await fetch(`${site.apiBase}/orders/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          shipping_address: form.address,
          items: items.map(i => ({ part_id: i.id, quantity: i.quantity })),
        }),
      });
      if (!orderRes.ok) throw new Error();
      const order = await orderRes.json();

      // 2. Create payment intent
      const piRes = await fetch(`${site.apiBase}/orders/payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: order.id }),
      });

      if (!piRes.ok) {
        // No Stripe configured — mark as confirmed anyway (COD / manual)
        clear();
        setStatus("ok");
        return;
      }

      // 3. If Stripe is configured, load Stripe.js and confirm
      const { client_secret } = await piRes.json();
      // @ts-ignore
      const stripe = window.Stripe?.(process.env.NEXT_PUBLIC_STRIPE_KEY || "");
      if (stripe && client_secret) {
        const { error } = await stripe.confirmPayment({
          clientSecret: client_secret,
          confirmParams: { return_url: window.location.href },
          redirect: "if_required",
        });
        if (error) throw error;
      }

      clear();
      setStatus("ok");
    } catch {
      setStatus("err");
    }
  };

  if (status === "ok") {
    return (
      <div className="checkoutSuccess">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="1.8"/>
          <path d="M8 12l3 3 5-5" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        <p>{t.orderOk}</p>
        <button className="partAddBtn" onClick={onBack}>{t.back}</button>
      </div>
    );
  }

  return (
    <div className="checkoutWrap">
      <button className="checkoutBack" onClick={onBack}>{t.back}</button>
      <div className="checkoutGrid">
        {/* Left — summary */}
        <div className="checkoutSummary">
          <h2>{t.cart}</h2>
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

        {/* Right — form */}
        <form className="checkoutForm" onSubmit={handleSubmit}>
          <h2>{t.checkoutTitle}</h2>
          <input className="ctInput" placeholder={t.yourName} required
            value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input className="ctInput" placeholder={t.email} type="email" required
            value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <input className="ctInput" placeholder={t.phone} type="tel" required
            value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          <textarea className="ctInput ctTextarea" placeholder={t.address} required rows={3}
            value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
          <button type="submit" className="cartCheckoutBtn"
            disabled={status === "paying"}>
            {status === "paying" ? t.paying : `${t.pay} — $${total.toFixed(2)}`}
          </button>
          {status === "err" && <p className="ctStatusErr">{t.orderErr}</p>}
        </form>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────
export default function PartsPage() {
  const { lang } = useLang();
  const t = txt[lang];
  const { count } = useCart();

  const [parts, setParts]         = useState<Part[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading]     = useState(true);
  const [cartOpen, setCartOpen]   = useState(false);
  const [checkout, setCheckout]   = useState(false);

  // Filters
  const [category, setCategory]   = useState("");
  const [search, setSearch]       = useState("");
  const [inStock, setInStock]     = useState(false);

  const fetchParts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search)   params.set("search", search);
    if (inStock)  params.set("in_stock", "true");
    try {
      const res = await fetch(`${site.apiBase}/parts/?${params}`);
      const data = await res.json();
      setParts(data);
    } catch {
      setParts([]);
    }
    setLoading(false);
  }, [category, search, inStock]);

  useEffect(() => { fetchParts(); }, [fetchParts]);

  useEffect(() => {
    fetch(`${site.apiBase}/parts/meta/categories`)
      .then(r => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  if (checkout) {
    return (
      <main className="innerPage">
        <div className="container">
          <CheckoutPage onBack={() => setCheckout(false)} t={t} />
        </div>
      </main>
    );
  }

  return (
    <main className="innerPage">
      <div className="container">

        {/* Header */}
        <div className="partsHeader">
          <div>
            <p className="eyebrow">{t.eyebrow}</p>
            <h1 className="partsTitle">{t.title}</h1>
            <p className="partsSub">{t.sub}</p>
          </div>
          <button className="cartBtn" onClick={() => setCartOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="1.6"/>
              <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.6"/>
              <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.6"/>
            </svg>
            {t.cart}
            {count > 0 && <span className="cartBadge">{count}</span>}
          </button>
        </div>

        {/* Filters */}
        <div className="partsFilters">
          <input
            className="partsSearch ctInput"
            placeholder={t.search}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="partsCatSelect ctInput"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="">{t.all}</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <label className="partsInStock">
            <input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)} />
            {t.inStock}
          </label>
        </div>

        {/* Grid */}
        {loading
          ? <div className="partsLoading">
              {[...Array(6)].map((_,i) => <div key={i} className="partSkeleton" />)}
            </div>
          : parts.length === 0
            ? <p className="partsEmpty">{t.noResults}</p>
            : <div className="partsGrid">
                {parts.map(p => <PartCard key={p.id} part={p} t={t} />)}
              </div>
        }
      </div>

      {/* Cart drawer */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => { setCartOpen(false); setCheckout(true); }}
        t={t}
      />
    </main>
  );
}