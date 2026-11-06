/* ==========================================================================
   1. MAHSULOTLAR RO'YXATI VA SAVAT MASSIVI (Data)
   Har bir mahsulot: { name, price, category }
   ========================================================================== */
const products = [
  { name: "ruchka", price: 3000, category: "O'quv" },
  { name: "chizg'ich", price: 4000, category: "O'quv" },
  { name: "sharbat", price: 6000, category: "Ichimlik" },
  { name: "suv", price: 3000, category: "Ichimlik" },
  { name: "shokolad", price: 8000, category: "Shirinlik" },
  { name: "pechenye", price: 5000, category: "Shirinlik" }
];

// Savat massivi (let bilan e'lon qilingan)
let cart = [];

// Tanlangan toifa va qidiruv holati
let currentCategory = "Hammasi";
let searchQuery = "";

/* ==========================================================================
   2. DOM ELEMENTLARINI TANLASH
   ========================================================================== */
const productsContainer = document.getElementById("productsContainer");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const categoryButtons = document.querySelectorAll(".category-btn");
const searchInput = document.getElementById("searchInput");
const themeToggle = document.getElementById("themeToggle");

// Savat modali elementlari
const cartBox = document.getElementById("cartBox");
const cartModal = document.getElementById("cartModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalClearBtn = document.getElementById("modalClearBtn");
const cartItemsList = document.getElementById("cartItemsList");
const modalTotal = document.getElementById("modalTotal");
const modalOrderBtn = document.getElementById("modalOrderBtn");

/* ==========================================================================
   3. JAMI NARXNI HISOBLASH (calcTotal funksiyasi)
   for sikli orqali savatdagi barcha narxlarni qo'shadi
   ========================================================================== */
function calcTotal() {
  let total = 0;

  for (let i = 0; i < cart.length; i++) {
    total += cart[i].price;
  }

  // Jami summani ekranga yozish
  cartTotal.textContent = total.toLocaleString("uz-UZ");
}

/* ==========================================================================
   4. SAVATGA MAHSULOT QO'SHISH
   cart.push() bilan qo'shiladi va calcTotal() chaqiriladi
   ========================================================================== */
function addToCart(index, btn) {
  // Mahsulotni savat massiviga qo'shamiz
  cart.push(products[index]);

  // Tepada savatdagi sonini (cart.length) yangilaymiz
  cartCount.textContent = cart.length;

  // Har safar qo'shilganda jami narxni hisoblaymiz
  calcTotal();

  // Tugmada qisqa tasdiq vizual ko'rinishi
  if (btn) {
    const oldText = btn.textContent;
    btn.textContent = "Qo'shildi ✓";
    btn.classList.add("added");
    setTimeout(() => {
      btn.textContent = oldText;
      btn.classList.remove("added");
    }, 600);
  }
}

// Global scope'da ishlashi uchun window obyektiga biriktiramiz
window.addToCart = addToCart;

/* ==========================================================================
   5. SAVAT BOSILGANDA RO'YXATNI CHIQARISH (Modal logikasi)
   ========================================================================== */
function openCartModal() {
  renderCartModal();
  cartModal.style.display = "flex";
}

function closeCartModal() {
  cartModal.style.display = "none";
}

function renderCartModal() {
  if (cart.length === 0) {
    cartItemsList.innerHTML = `<p class="empty-cart-text">Savatingiz hozircha bo'sh.</p>`;
    modalTotal.textContent = "0";
    return;
  }

  // Mahsulotlarni nomi bo'yicha guruhlash (masalan: ruchka x2)
  const grouped = {};
  for (let i = 0; i < cart.length; i++) {
    const item = cart[i];
    if (!grouped[item.name]) {
      grouped[item.name] = { count: 0, price: item.price };
    }
    grouped[item.name].count++;
  }

  cartItemsList.innerHTML = "";
  let total = 0;
  for (const name in grouped) {
    const item = grouped[name];
    const subtotal = item.count * item.price;
    total += subtotal;

    const row = document.createElement("div");
    row.className = "cart-item-row";
    row.innerHTML = `
      <div class="cart-item-info">
        <span class="item-name">${name}</span>
        <span class="item-unit-price">${item.price.toLocaleString("uz-UZ")} so'm</span>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" type="button" onclick="changeQty('${name}', -1)" title="Bitta kamaytirish">−</button>
        <span class="item-qty">${item.count}</span>
        <button class="qty-btn" type="button" onclick="changeQty('${name}', 1)" title="Bitta qo'shish">+</button>
        <span class="item-subtotal">${subtotal.toLocaleString("uz-UZ")} so'm</span>
      </div>
    `;
    cartItemsList.appendChild(row);
  }

  modalTotal.textContent = total.toLocaleString("uz-UZ");
}

// Savatdagi bitta mahsulot sonini oshirish yoki kamaytirish
function changeQty(productName, delta) {
  if (delta > 0) {
    const product = products.find(p => p.name === productName);
    if (product) cart.push(product);
  } else if (delta < 0) {
    const idx = cart.findIndex(p => p.name === productName);
    if (idx !== -1) cart.splice(idx, 1);
  }

  cartCount.textContent = cart.length;
  calcTotal();
  renderCartModal();
}

window.changeQty = changeQty;

/* ==========================================================================
   6. KARTOCHKALARNI CHIZISH (for sikli va if sharti bilan)
   ========================================================================== */
function renderProducts() {
  productsContainer.innerHTML = "";
  let found = false;

  // for sikli orqali barcha mahsulotlarni aylanib chiqamiz
  for (let i = 0; i < products.length; i++) {
    const product = products[i];

    // if sharti: toifani tekshirish
    const matchCategory = (currentCategory === "Hammasi" || product.category === currentCategory);

    // if sharti: qidiruv so'zini tekshirish
    const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase().trim());

    if (matchCategory && matchSearch) {
      found = true;

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div>
          <span class="card-badge">${product.category}</span>
          <h3 class="card-name">${product.name}</h3>
          <p class="card-price">${product.price.toLocaleString("uz-UZ")} so'm</p>
        </div>
        <button type="button" class="add-btn" onclick="addToCart(${i}, this)">Savatga</button>
      `;

      productsContainer.appendChild(card);
    }
  }

  // Hech narsa topilmasa
  if (!found) {
    productsContainer.innerHTML = `<div class="empty-msg">Hech qanday mahsulot topilmadi.</div>`;
  }
}

/* ==========================================================================
   7. HODISALARNI TINGLASH (Toifalar, Qidiruv, Dark Mode, Savat oynasi)
   ========================================================================== */
// Savat qutisi bosilganda oynani ochish
cartBox.addEventListener("click", openCartModal);
cartBox.addEventListener("keydown", function (e) {
  if (e.key === "Enter" || e.key === " ") {
    openCartModal();
  }
});

// Modalni yopish
closeModalBtn.addEventListener("click", closeCartModal);
modalCloseBtn.addEventListener("click", closeCartModal);

// Modal orqali savatni tozalash
modalClearBtn.addEventListener("click", function () {
  cart = [];
  cartCount.textContent = 0;
  calcTotal();
  renderCartModal();
});

// Tashqi qism bosilganda modalni yopish
cartModal.addEventListener("click", function (e) {
  if (e.target === cartModal) {
    closeCartModal();
  }
});

// ESC tugmasi bosilganda modalni yopish
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && cartModal.style.display === "flex") {
    closeCartModal();
  }
});

// Toifa tugmalari bosilganda if bilan filtrlash
for (let i = 0; i < categoryButtons.length; i++) {
  categoryButtons[i].addEventListener("click", function () {
    for (let j = 0; j < categoryButtons.length; j++) {
      categoryButtons[j].classList.remove("active");
    }
    this.classList.add("active");
    currentCategory = this.dataset.category;
    renderProducts();
  });
}

// Qidiruv maydoniga yozilganda
searchInput.addEventListener("input", function (e) {
  searchQuery = e.target.value;
  renderProducts();
});

// Qorong'i / Yorug' rejim (Dark Mode)
themeToggle.addEventListener("click", function () {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  themeToggle.textContent = isDark ? "☀️ Kun rejimi" : "🌙 Tun rejimi";
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// Saqlangan rejimni tiklash
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  themeToggle.textContent = "☀️ Kun rejimi";
}

/* ==========================================================================
   8. DASTLABKI ISHGA TUSHIRISH
   ========================================================================== */
renderProducts();
calcTotal();
