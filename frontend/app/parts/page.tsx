"use client";

import { useEffect, useState, useCallback } from "react";
import Checkout from "@/components/checkout/Checkout";
import { useCart } from "@/context/CartContext";
import { useLang } from "@/context/LangContext";
import { site } from "@/lib/content";

// Category name translations
const catNames: Record<string, Record<string, string>> = {
  en: { Brakes:"Brakes", Electrical:"Electrical", Engine:"Engine", Suspension:"Suspension", Filters:"Filters", Cooling:"Cooling" },
  es: { Brakes:"Frenos", Electrical:"Eléctrico", Engine:"Motor", Suspension:"Suspensión", Filters:"Filtros", Cooling:"Refrigeración" },
};

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
function PartCard({ part, t, lang }: { part: Part; t: typeof txt["en"]; lang: string }) {
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
        <p className="partCategoryTag">{catNames[lang]?.[part.category] || part.category}</p>
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
          <Checkout onBack={() => setCheckout(false)} />
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

        {/* Search + stock filter */}
        <div className="partsFilters">
          <input
            className="partsSearch ctInput"
            placeholder={t.search}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <label className="partsInStock">
            <input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)} />
            {t.inStock}
          </label>
        </div>

        {/* Category pills */}
        <div className="partsCatPills">
          <button
            className={`partsCatPill ${category === "" ? "partsCatPillActive" : ""}`}
            onClick={() => setCategory("")}
          >
            {t.all}
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              className={`partsCatPill ${category === cat ? "partsCatPillActive" : ""}`}
              onClick={() => setCategory(category === cat ? "" : cat)}
            >
              {catNames[lang]?.[cat] || cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <p className="partsCount">{parts.length} {parts.length === 1 ? "part" : "parts"} found</p>
        )}

        {/* Grid */}
        {loading
          ? <div className="partsLoading">
              {[...Array(6)].map((_,i) => <div key={i} className="partSkeleton" />)}
            </div>
          : parts.length === 0
            ? <p className="partsEmpty">{t.noResults}</p>
            : <div className="partsGrid">
                {parts.map(p => <PartCard key={p.id} part={p} t={t} lang={lang} />)}
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