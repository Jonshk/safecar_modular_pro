"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Checkout from "@/components/checkout/Checkout";
import { useCart } from "@/context/CartContext";
import { useLang } from "@/context/LangContext";
import { site } from "@/lib/content";

const catNames: Record<string, Record<string, string>> = {
  en: { Brakes:"Brakes", Electrical:"Electrical", Engine:"Engine", Suspension:"Suspension", Filters:"Filters", Cooling:"Cooling" },
  es: { Brakes:"Frenos", Electrical:"Eléctrico", Engine:"Motor", Suspension:"Suspensión", Filters:"Filtros", Cooling:"Refrigeración" },
};

const txt = {
  en: {
    eyebrow:"Parts & Components", title:"Shop repair parts",
    sub:"Quality parts for domestic, Asian and European vehicles.",
    all:"All categories", search:"Search parts...", inStock:"In stock only",
    addCart:"Add to cart", added:"Added!", noResults:"No parts found.",
    cart:"Cart", empty:"Your cart is empty.", checkout:"Proceed to checkout",
    remove:"Remove", total:"Total", qty:"Qty",
    checkoutTitle:"Checkout", yourName:"Full name", email:"Email",
    phone:"Phone", address:"Shipping address", pay:"Pay now",
    paying:"Processing...", orderOk:"Order confirmed! We'll contact you shortly.",
    orderErr:"Payment failed. Please try again.", back:"← Back to shop",
  },
  es: {
    eyebrow:"Repuestos y Componentes", title:"Compra repuestos",
    sub:"Repuestos de calidad para vehículos domésticos, asiáticos y europeos.",
    all:"Todas las categorías", search:"Buscar repuestos...", inStock:"Solo en stock",
    addCart:"Agregar", added:"¡Listo!", noResults:"No se encontraron repuestos.",
    cart:"Carrito", empty:"Tu carrito está vacío.", checkout:"Ir al pago",
    remove:"Eliminar", total:"Total", qty:"Cant",
    checkoutTitle:"Pago", yourName:"Nombre completo", email:"Correo",
    phone:"Teléfono", address:"Dirección de envío", pay:"Pagar ahora",
    paying:"Procesando...", orderOk:"¡Pedido confirmado! Te contactaremos pronto.",
    orderErr:"Pago fallido. Intenta de nuevo.", back:"← Volver a la tienda",
  },
};

interface Part {
  id:number; name:string; description:string; category:string;
  brand:string; price:number; stock:number; image_url:string; compatible_vehicles:string;
}

type FlyItem = { id:number; x:number; y:number; img:string };

// ── Cart SVG icon ──────────────────────────────────────────
function CartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4H12L18 32H50L56 12H18" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="24" cy="40" r="4" stroke="currentColor" strokeWidth="3"/>
      <circle cx="44" cy="40" r="4" stroke="currentColor" strokeWidth="3"/>
    </svg>
  );
}

// ── PART CARD ─────────────────────────────────────────────
function PartCard({ part, t, lang, onFly }: {
  part:Part; t:typeof txt["en"]; lang:string;
  onFly:(x:number,y:number,img:string)=>void;
}) {
  const { add } = useCart();
  const [flash, setFlash] = useState(false);
  const [bump, setBump]   = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleAdd = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      onFly(r.left + r.width/2, r.top + r.height/2, part.image_url || "");
    }
    add({ id:part.id, name:part.name, price:part.price, image_url:part.image_url });
    setFlash(true); setBump(true);
    setTimeout(() => setFlash(false), 1400);
    setTimeout(() => setBump(false), 400);
  };

  return (
    <article className="partCard">
      <div className="partImg">
        {part.image_url
          ? <img src={part.image_url} alt={part.name} />
          : <div className="partImgPlaceholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
        }
        {part.stock <= 0 && <span className="partOutStock">Out of stock</span>}
        {part.stock > 0 && part.stock <= 5 && <span className="partLowStock">Only {part.stock} left</span>}
      </div>
      <div className="partInfo">
        <p className="partCategoryTag">{catNames[lang]?.[part.category] || part.category}</p>
        {part.brand && <p className="partBrand">{part.brand}</p>}
        <h3 className="partName">{part.name}</h3>
        {part.description && <p className="partDesc">{part.description}</p>}
        {part.compatible_vehicles && <p className="partCompat">Fits: {part.compatible_vehicles}</p>}
        <div className="partFooter">
          <span className="partPrice">${part.price.toFixed(2)}</span>
          <button
            ref={btnRef}
            className={`partAddBtn ${flash ? "partAdded" : ""} ${bump ? "partBump" : ""}`}
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

// ── FLOATING CART ─────────────────────────────────────────
function FloatingCart({ t, onCheckout, floatRef, pulse }: {
  t: typeof txt["en"];
  onCheckout: () => void;
  floatRef: React.RefObject<HTMLDivElement>;
  pulse: boolean;
}) {
  const { items, total, remove, update, count } = useCart();
  const [open, setOpen] = useState(false);
  const [shake, setShake] = useState(false);

  // When pulse fires (new item added), shake + briefly open
  useEffect(() => {
    if (pulse) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  }, [pulse]);

  // Auto-open drawer when first item added
  const prevCount = useRef(0);
  useEffect(() => {
    if (count > prevCount.current && prevCount.current === 0) {
      setOpen(true);
    }
    prevCount.current = count;
  }, [count]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fcBackdrop"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Floating container */}
      <div
        ref={floatRef}
        className={`fcWrap ${open ? "fcWrapOpen" : ""} ${shake ? "fcShake" : ""} ${pulse ? "fcPulse" : ""}`}
      >
        {/* Toggle button — always visible */}
        <button
          className={`fcToggle ${pulse ? "fcTogglePulse" : ""}`}
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle cart"
        >
          <div className="fcToggleInner">
            <CartIcon className="fcToggleIcon" />
            {count > 0 && (
              <span className={`fcBadge ${pulse ? "fcBadgePop" : ""}`}>{count}</span>
            )}
          </div>
          {/* Breathing ring when items inside */}
          {count > 0 && <div className="fcBreathRing" />}
        </button>

        {/* Drawer panel */}
        <div className={`fcDrawer ${open ? "fcDrawerOpen" : ""}`}>
          {/* Header */}
          <div className="fcHead">
            <div className="fcHeadLeft">
              <CartIcon className="fcHeadIcon" />
              <div>
                <h2 className="fcHeadTitle">{t.cart}</h2>
                <p className="fcHeadSub">{count} {count === 1 ? "item" : "items"}</p>
              </div>
            </div>
            <button className="fcClose" onClick={() => setOpen(false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Conveyor belt */}
          <div className="fcConveyor">
            <div className="fcConveyorBelt" />
          </div>

          {/* Items */}
          {items.length === 0 ? (
            <div className="fcEmpty">
              <CartIcon className="fcEmptyIcon" />
              <p>{t.empty}</p>
            </div>
          ) : (
            <>
              <div className="fcItems">
                {items.map((item, idx) => (
                  <div key={item.id} className="fcItem" style={{ animationDelay: `${idx * 0.04}s` }}>
                    <div className="fcItemThumb">
                      {item.image_url
                        ? <img src={item.image_url} alt={item.name} />
                        : <div className="fcItemThumbFallback">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                            </svg>
                          </div>
                      }
                    </div>
                    <div className="fcItemInfo">
                      <p className="fcItemName">{item.name}</p>
                      <p className="fcItemUnit">${item.price.toFixed(2)} ea.</p>
                    </div>
                    <div className="fcQty">
                      <button className="fcQtyBtn" onClick={() => update(item.id, item.quantity - 1)}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
                      </button>
                      <span className="fcQtyNum">{item.quantity}</span>
                      <button className="fcQtyBtn" onClick={() => update(item.id, item.quantity + 1)}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
                      </button>
                    </div>
                    <p className="fcItemTotal">${(item.price * item.quantity).toFixed(2)}</p>
                    <button className="fcItemRemove" onClick={() => remove(item.id)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="fcFooter">
                <div className="fcBarcode">
                  {Array.from({length: 24}).map((_,i) => (
                    <div key={i} className="fcBarcodeBar" style={{ height:`${7+Math.sin(i*1.4)*5}px`, opacity: 0.12+(i%3)*0.09 }}/>
                  ))}
                </div>
                <div className="fcTotalRow">
                  <span className="fcTotalLabel">{t.total}</span>
                  <span className="fcTotalAmt">${total.toFixed(2)}</span>
                </div>
                <button className="fcCheckoutBtn" onClick={() => { setOpen(false); onCheckout(); }}>
                  <CartIcon className="fcCheckoutIcon" />
                  {t.checkout}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
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
  const [checkout, setCheckout]   = useState(false);
  const [pulse, setPulse]         = useState(false);

  const [flyItems, setFlyItems]   = useState<FlyItem[]>([]);
  const floatRef  = useRef<HTMLDivElement>(null);
  const flyCounter = useRef(0);
  const prevCount = useRef(count);

  const [category, setCategory] = useState("");
  const [search, setSearch]     = useState("");
  const [inStock, setInStock]   = useState(false);

  const fetchParts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search)   params.set("search", search);
    if (inStock)  params.set("in_stock", "true");
    try {
      const res = await fetch(`${site.apiBase}/parts/?${params}`);
      setParts(await res.json());
    } catch { setParts([]); }
    setLoading(false);
  }, [category, search, inStock]);

  useEffect(() => { fetchParts(); }, [fetchParts]);

  useEffect(() => {
    fetch(`${site.apiBase}/parts/meta/categories`)
      .then(r => r.json()).then(setCategories).catch(() => {});
  }, []);

  // Detect new item added → trigger pulse
  useEffect(() => {
    if (count > prevCount.current) {
      setPulse(true);
      setTimeout(() => setPulse(false), 900);
    }
    prevCount.current = count;
  }, [count]);

  // Flying item animation toward floating cart
  const handleFly = useCallback((fromX: number, fromY: number, img: string) => {
    if (!floatRef.current) return;
    const r = floatRef.current.getBoundingClientRect();
    const toX = r.left + r.width / 2;
    const toY = r.top + r.height / 2;

    const id = ++flyCounter.current;
    setFlyItems(prev => [...prev, { id, x: fromX, y: fromY, img }]);

    setTimeout(() => {
      const el = document.getElementById(`fly-${id}`);
      if (el) {
        el.style.setProperty("--fly-tx", `${toX - fromX}px`);
        el.style.setProperty("--fly-ty", `${toY - fromY}px`);
        el.classList.add("flyActive");
      }
    }, 20);

    setTimeout(() => setFlyItems(prev => prev.filter(f => f.id !== id)), 700);
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
      {/* Flying particles */}
      <div className="flyLayer" aria-hidden="true">
        {flyItems.map(fi => (
          <div key={fi.id} id={`fly-${fi.id}`} className="flyItem" style={{ left: fi.x, top: fi.y }}>
            {fi.img
              ? <img src={fi.img} alt="" />
              : <div className="flyItemFallback">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="#d91f26" strokeWidth="1.5" fill="none"/>
                  </svg>
                </div>
            }
          </div>
        ))}
      </div>

      <div className="container">
        {/* Header */}
        <div className="partsHeader">
          <div>
            <p className="eyebrow">{t.eyebrow}</p>
            <h1 className="partsTitle">{t.title}</h1>
            <p className="partsSub">{t.sub}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="partsFilters">
          <input className="partsSearch ctInput" placeholder={t.search}
            value={search} onChange={e => setSearch(e.target.value)} />
          <label className="partsInStock">
            <input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)} />
            {t.inStock}
          </label>
        </div>

        {/* Category pills */}
        <div className="partsCatPills">
          <button className={`partsCatPill ${category === "" ? "partsCatPillActive" : ""}`}
            onClick={() => setCategory("")}>{t.all}</button>
          {categories.map(cat => (
            <button key={cat}
              className={`partsCatPill ${category === cat ? "partsCatPillActive" : ""}`}
              onClick={() => setCategory(category === cat ? "" : cat)}>
              {catNames[lang]?.[cat] || cat}
            </button>
          ))}
        </div>

        {!loading && <p className="partsCount">{parts.length} {parts.length === 1 ? "part" : "parts"} found</p>}

        {loading
          ? <div className="partsLoading">{[...Array(6)].map((_,i) => <div key={i} className="partSkeleton" />)}</div>
          : parts.length === 0
            ? <p className="partsEmpty">{t.noResults}</p>
            : <div className="partsGrid">
                {parts.map(p => (
                  <PartCard key={p.id} part={p} t={t} lang={lang} onFly={handleFly} />
                ))}
              </div>
        }
      </div>

      {/* Floating cart — always visible, bottom right */}
      <FloatingCart
        t={t}
        onCheckout={() => setCheckout(true)}
        floatRef={floatRef}
        pulse={pulse}
      />
    </main>
  );
}