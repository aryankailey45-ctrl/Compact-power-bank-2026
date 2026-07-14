/* =========================================================
   COMPACT — Cart state, Nav, Footer drawer, shared UI logic
   ========================================================= */

const PRODUCT = {
  id: "compact-wireless",
  name: "Compact Wireless Powerbank",
  tagline: "Power. Without limits.",
  price: 3499,
  compareAt: 4999,
  variants: ["Transparent", "Stealth Black"],
  bullets: [
    "10,000 mAh · airplane friendly",
    "40W wireless · 250W wired fast charge",
    "SafeCharge 6-layer protection",
    "Dual-port USB-C + USB-A",
  ],
  image: "images/hero-image.png",
};

function inr(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

/* ---------------- Cart storage ---------------- */
const CART_KEY = "compact_cart_items";

function getCart() {
  try {
    const raw = sessionStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(items) {
  try {
    sessionStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch (e) {
    /* ignore */
  }
  renderCart();
}

function cartCount(items) {
  return items.reduce((n, i) => n + i.qty, 0);
}
function cartSubtotal(items) {
  return items.reduce((n, i) => n + i.qty * i.price, 0);
}

function addToCart(item, qty) {
  qty = qty || 1;
  const items = getCart();
  const idx = items.findIndex((p) => p.id === item.id && p.variant === item.variant);
  if (idx >= 0) {
    items[idx].qty += qty;
  } else {
    items.push(Object.assign({}, item, { qty }));
  }
  saveCart(items);
  openCart();
}

function removeFromCart(id, variant) {
  const items = getCart().filter((p) => !(p.id === id && p.variant === variant));
  saveCart(items);
}

function setCartQty(id, variant, qty) {
  let items = getCart()
    .map((p) => (p.id === id && p.variant === variant ? Object.assign({}, p, { qty }) : p))
    .filter((p) => p.qty > 0);
  saveCart(items);
}

function clearCart() {
  saveCart([]);
}

/* ---------------- Cart drawer render ---------------- */
function renderCart() {
  const items = getCart();
  const count = cartCount(items);
  const subtotal = cartSubtotal(items);

  document.querySelectorAll(".cart-badge").forEach((el) => {
    el.textContent = count;
    el.classList.toggle("show", count > 0);
  });

  if (typeof renderCheckoutSummary === "function" && document.getElementById("summaryBox")) {
    renderCheckoutSummary();
  }

  const body = document.getElementById("cartBody");
  const footer = document.getElementById("cartFooter");
  if (!body) return;

  if (items.length === 0) {
    body.innerHTML =
      '<div class="cart-empty">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>' +
      "<p>Your cart is empty.</p>" +
      '<a href="product.html" onclick="closeCart()">Shop the Compact</a>' +
      "</div>";
    if (footer) footer.classList.remove("show");
    return;
  }

  body.innerHTML =
    "<ul>" +
    items
      .map(
        (i) => `
      <li class="cart-item">
        <div class="thumb"><img src="${i.image}" alt="${i.name}"></div>
        <div class="info">
          <div class="row1">
            <div>
              <div class="name">${i.name}</div>
              <div class="variant">${i.variant}</div>
            </div>
            <button class="remove-btn" aria-label="Remove" onclick="removeFromCart('${i.id}','${i.variant}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </button>
          </div>
          <div class="row2">
            <div class="qty-control">
              <button onclick="setCartQty('${i.id}','${i.variant}',${i.qty - 1})">−</button>
              <span>${i.qty}</span>
              <button onclick="setCartQty('${i.id}','${i.variant}',${i.qty + 1})">+</button>
            </div>
            <div class="price">${inr(i.price * i.qty)}</div>
          </div>
        </div>
      </li>`
      )
      .join("") +
    "</ul>";

  if (footer) {
    footer.classList.add("show");
    footer.innerHTML = `
      <div class="line"><span class="sub">Subtotal</span><span>${inr(subtotal)}</span></div>
      <div class="ship"><span>Shipping</span><span>Free · 2-day delivery</span></div>
      <a href="checkout.html" class="btn-solid checkout-btn" onclick="closeCart()">Checkout — ${inr(subtotal)}</a>
    `;
  }
}

/* ---------------- Cart drawer open/close ---------------- */
function openCart() {
  document.getElementById("cartOverlay").classList.add("show");
  document.getElementById("cartDrawer").classList.add("show");
  document.body.style.overflow = "hidden";
}
function closeCart() {
  document.getElementById("cartOverlay").classList.remove("show");
  document.getElementById("cartDrawer").classList.remove("show");
  document.body.style.overflow = "";
}

/* ---------------- Nav scroll + mobile menu ---------------- */
function initNav() {
  const nav = document.getElementById("siteNav");
  if (!nav) return;
  const isHome = nav.dataset.home === "true";

  function onScroll() {
    const scrolled = window.scrollY > 20;
    nav.classList.toggle("scrolled", scrolled);
    nav.classList.toggle("on-dark", isHome && !scrolled);
  }
  onScroll();
  window.addEventListener("scroll", onScroll);

  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const menuClose = document.getElementById("menuClose");
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => mobileMenu.classList.add("open"));
    menuClose.addEventListener("click", () => mobileMenu.classList.remove("open"));
    mobileMenu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => mobileMenu.classList.remove("open"))
    );
  }

  const cartBtn = document.getElementById("cartBtn");
  if (cartBtn) cartBtn.addEventListener("click", openCart);
  const overlay = document.getElementById("cartOverlay");
  if (overlay) overlay.addEventListener("click", closeCart);
  const cartClose = document.getElementById("cartClose");
  if (cartClose) cartClose.addEventListener("click", closeCart);
}

/* ---------------- Reveal-on-scroll ---------------- */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "-60px" }
  );
  els.forEach((el, i) => {
    el.style.transitionDelay = (i % 6) * 0.06 + "s";
    io.observe(el);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  renderCart();
  initReveal();
});
