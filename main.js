/* =========================================================
   COMPACT — Page-specific interactive components
   Safe to include on every page; each init checks for its
   elements before doing anything.
   ========================================================= */

/* ---------------- Hero parallax (home) ---------------- */
function initHeroParallax() {
  const hero = document.getElementById("hero");
  if (!hero) return;
  const media = hero.querySelector(".hero-media img");
  const content = hero.querySelector(".hero-content");
  if (!media || !content) return;

  function onScroll() {
    const rect = hero.getBoundingClientRect();
    const total = hero.offsetHeight || 1;
    const progress = Math.min(1, Math.max(0, -rect.top / total));
    media.style.transform = `translateY(${progress * 220}px) scale(${1 + progress * 0.15})`;
    content.style.transform = `translateY(${progress * -80}px)`;
    content.style.opacity = String(Math.max(0, 1 - progress / 0.8));
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------------- FAQ accordion ---------------- */
function initFaq() {
  const items = document.querySelectorAll(".faq-item");
  if (!items.length) return;
  items.forEach((item) => {
    const q = item.querySelector(".faq-q");
    q.addEventListener("click", () => {
      const wasOpen = item.classList.contains("open");
      items.forEach((i) => i.classList.remove("open"));
      if (!wasOpen) item.classList.add("open");
    });
  });
}

/* ---------------- Product spec accordion ---------------- */
function initSpecs() {
  const specs = document.querySelectorAll(".spec");
  if (!specs.length) return;
  specs.forEach((spec) => {
    spec.querySelector(".spec-q").addEventListener("click", () => {
      spec.classList.toggle("open");
    });
  });
}

/* ---------------- Why Choose Us rotating tabs ---------------- */
function initWhyChoose() {
  const items = document.querySelectorAll(".why-item");
  const images = document.querySelectorAll(".why-media img");
  if (!items.length) return;
  let active = 0;
  let timer;

  function setActive(i) {
    active = i;
    items.forEach((el, idx) => el.classList.toggle("active", idx === i));
    images.forEach((img, idx) => img.classList.toggle("show", idx % images.length === i % images.length));
  }

  items.forEach((item, i) => {
    item.addEventListener("click", () => {
      setActive(i);
      resetTimer();
    });
  });

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => setActive((active + 1) % items.length), 4500);
  }

  setActive(0);
  resetTimer();
}

/* ---------------- Quick buy bar (home) ---------------- */
function initQuickBuy() {
  const bar = document.getElementById("quickBuy");
  if (!bar) return;
  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const visible = y > window.innerHeight * 1.5 && y < max - 600;
    bar.classList.toggle("show", visible);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const btn = document.getElementById("quickBuyAdd");
  if (btn) {
    btn.addEventListener("click", () => {
      addToCart(
        { id: PRODUCT.id, name: PRODUCT.name, variant: "Transparent", price: PRODUCT.price, image: PRODUCT.image },
        1
      );
    });
  }
}

/* ---------------- Product page: gallery / variant / qty / add ---------------- */
function initProductPage() {
  const gallery = document.getElementById("galleryMain");
  if (!gallery) return;

  const images = [PRODUCT.image, "images/duo.svg", "images/safecharge.svg"];
  const mainImg = document.getElementById("galleryMainImg");
  const thumbs = document.querySelectorAll(".gallery-thumbs button");
  thumbs.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      mainImg.src = images[i];
      thumbs.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  let variant = PRODUCT.variants[0];
  const variantBtns = document.querySelectorAll(".variant-btn");
  const variantLabel = document.getElementById("variantLabel");
  variantBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      variant = btn.dataset.variant;
      variantBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      variantLabel.textContent = variant;
    });
  });

  let qty = 1;
  const qtyDisplay = document.getElementById("productQty");
  const addBtn = document.getElementById("addToCartBtn");
  function updateAddBtn() {
    addBtn.textContent = `Add to cart · ${inr(PRODUCT.price * qty)}`;
  }
  document.getElementById("qtyMinus").addEventListener("click", () => {
    qty = Math.max(1, qty - 1);
    qtyDisplay.textContent = qty;
    updateAddBtn();
  });
  document.getElementById("qtyPlus").addEventListener("click", () => {
    qty += 1;
    qtyDisplay.textContent = qty;
    updateAddBtn();
  });
  updateAddBtn();

  addBtn.addEventListener("click", () => {
    addToCart({ id: PRODUCT.id, name: PRODUCT.name, variant, price: PRODUCT.price, image: PRODUCT.image }, qty);
  });
}

/* ---------------- Checkout page ---------------- */
function initCheckout() {
  const form = document.getElementById("checkoutForm");
  if (!form) return;

  const payOptions = document.querySelectorAll(".pay-option");
  payOptions.forEach((opt) => {
    opt.addEventListener("click", () => {
      payOptions.forEach((o) => o.classList.remove("checked"));
      opt.classList.add("checked");
      opt.querySelector("input").checked = true;
    });
  });

  renderCheckoutSummary();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (getCart().length === 0) return;
    clearCart();
    document.getElementById("checkoutFormView").style.display = "none";
    document.getElementById("orderDoneView").style.display = "flex";
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function renderCheckoutSummary() {
  const box = document.getElementById("summaryBox");
  if (!box) return;
  const items = getCart();
  const subtotal = cartSubtotal(items);
  const submitBtn = document.getElementById("checkoutSubmit");

  if (items.length === 0) {
    box.innerHTML = `<div class="summary-empty">Your cart is empty. <button onclick="window.location.href='product.html'">Shop the Compact</button></div>`;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Pay " + inr(0) + " securely";
    }
    return;
  }

  box.innerHTML =
    '<div class="summary-items">' +
    items
      .map(
        (i) => `
      <div class="summary-item">
        <div class="thumb"><img src="${i.image}" alt=""><span class="qtybadge">${i.qty}</span></div>
        <div class="info">
          <div class="name">${i.name}</div>
          <div class="variant">${i.variant}</div>
        </div>
        <div class="price">${inr(i.price * i.qty)}</div>
      </div>`
      )
      .join("") +
    "</div>" +
    `<div class="summary-totals">
      <div class="row"><span>Subtotal</span><span>${inr(subtotal)}</span></div>
      <div class="row"><span>Shipping</span><span>Free</span></div>
      <div class="total"><span>Total</span><span>${inr(subtotal)}</span></div>
    </div>`;

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = "Pay " + inr(subtotal) + " securely";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initHeroParallax();
  initFaq();
  initSpecs();
  initWhyChoose();
  initQuickBuy();
  initProductPage();
  initCheckout();
});
