// ===== 장바구니 전용 API 및 공통 컨포넌트 가져오기 =====
import {
  getCartItems,
  updateCartItem,
  deleteCartItem,
  formatPrice,
} from "./cart-api.js";
import MiniAlert from "../../components/MiniAlert.js";
import { alerts } from "./calculate.js";

// ===== 전역 상태 및 상수 정의 =====
let cartItems = [];

const CONSTANTS = {
  MIN_QTY: 1,
  MAX_QTY: 99,
  SHIPPING: { PARCEL: "PARCEL", PICKUP: "PICKUP" },
  IMAGES: {
    CHECKED: "../images/check-box-Fill.svg",
    UNCHECKED: "../images/check-box.svg",
    MINUS: "../images/icon-minus-line.svg",
    PLUS: "../images/icon-plus-line.svg",
  },
};

// ===== DOM 요소 캐싱 =====
const dom = {
  container: document.querySelector(".cart-products-content"),
  orderContent: document.querySelector(".cart-order-content"),
  totalBtn: document.querySelector(".total-order-btn"),
  totalPrice: document.querySelector(".total-price .order-price"),
  finalPrice: document.querySelector(".final-price .order-price"),
  allCheckbox: document.querySelector(".cart-list .check-box"),
};

// ===== 유틸리티 함수들 =====
const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const findItem = (id) => {
  const numId = Number(id);
  return cartItems.find((i) => i.id === numId);
};

const validateQty = (value) => {
  if (isNaN(value) || value < CONSTANTS.MIN_QTY) return CONSTANTS.MIN_QTY;
  if (value > CONSTANTS.MAX_QTY) return CONSTANTS.MAX_QTY;
  return value;
};
const toggleVisibility = (el, show) => el?.classList.toggle("hidden", !show);

// ===== UI 업데이트 함수들 =====
const updateCheckbox = (checkbox, checked) => {
  if (!checkbox) return;
  checkbox.classList.toggle("checked", checked);
  checkbox.innerHTML = `<img src="${
    checked ? CONSTANTS.IMAGES.CHECKED : CONSTANTS.IMAGES.UNCHECKED
  }" alt="${checked ? "체크" : "체크 안됨"}">`;
};

const updateAllCheckbox = () => {
  if (!dom.allCheckbox) return;
  const allChecked = cartItems.length && cartItems.every((i) => i.isChecked);
  updateCheckbox(dom.allCheckbox, allChecked);
};

const updateTotal = () => {
  const total = cartItems.reduce(
    (sum, i) => (i.isChecked ? sum + i.price * i.quantity : sum),
    0
  );
  if (dom.totalPrice) dom.totalPrice.textContent = formatPrice(total);
  if (dom.finalPrice) dom.finalPrice.textContent = formatPrice(total);
};

const updateQuantityUI = (productEl, qty, item) => {
  const input = productEl.querySelector(".quantity-input");
  const price = productEl.querySelector(".cart-product-order p");
  if (input) input.value = qty;
  if (price) price.textContent = `${formatPrice(item.price * qty)}원`;
  updateTotal();
};

// ===== HTML 렌더링 함수들 =====
const createProductHTML = (item) => {
  return `
    <div class="cart-product-left">
      ${createProductInfo(item)}
    </div>
    <div class="cart-product-right">
      ${createQuantityControls(item)}
      ${createOrderSection(item)}
    </div>
  `;
};

const createProductInfo = (item) => `
  <button class="check-box" aria-label="상품 선택"></button>
  <div class="cart-product-title">
    <img src="${item.image}" alt="${item.name}">
    <div class="cart-product-text">
      <div class="cart-product-dec">
        <p>제로블루</p>
        <h3>${item.name}</h3>
        <p class="strong">${formatPrice(item.price)}원</p>
        <p>${
          item.shipping_method === CONSTANTS.SHIPPING.PARCEL
            ? "택배배송 / 무료배송"
            : "배송방법: 매장픽업"
        }</p>
      </div>
    </div>
  </div>
`;

const createQuantityControls = (item) => `
  <div class="quantity-container">
    <button class="quantity-btn decrease">
      <img src="${CONSTANTS.IMAGES.MINUS}" alt="감소">
    </button>
    <input type="number" class="quantity-input"
           value="${item.quantity}"
           min="${CONSTANTS.MIN_QTY}"
           max="${CONSTANTS.MAX_QTY}">
    <button class="quantity-btn increase">
      <img src="${CONSTANTS.IMAGES.PLUS}" alt="증가">
    </button>
  </div>
`;

const createOrderSection = (item) => `
  <div class="cart-product-order">
    <p>${formatPrice(item.price * item.quantity)}원</p>
    <button class="individual-order-btn common-btn">주문하기</button>
  </div>
  <button class="close-btn" aria-label="상품 삭제"></button>
`;

const createProductElement = (item) => {
  const article = document.createElement("article");
  article.className = "cart-product";
  article.dataset.id = item.id;
  article.innerHTML = createProductHTML(item);
  updateCheckbox(article.querySelector(".check-box"), item.isChecked);
  return article;
};

const renderCart = () => {
  if (!dom.container) return;

  if (!cartItems.length) {
    dom.container.innerHTML = `
      <div class="empty-cart">
        <h3 class="empty-cart-title">장바구니에 담긴 상품이 없습니다.</h3>
        <p class="empty-cart-message">원하는 상품을 장바구니에 담아보세요!</p>
      </div>
    `;
    toggleVisibility(dom.orderContent, false);
    toggleVisibility(dom.totalBtn, false);
    return;
  }

  dom.container.innerHTML = "";
  cartItems.forEach((item) => {
    const productElement = createProductElement(item);
    dom.container.appendChild(productElement);
  });

  toggleVisibility(dom.orderContent, true);
  toggleVisibility(dom.totalBtn, true);
  updateTotal();
  updateAllCheckbox();
};

// ===== 이벤트 핸들러 함수들 =====
const handleCheckboxClick = (item, checkbox) => {
  item.isChecked = !item.isChecked;
  updateCheckbox(checkbox, item.isChecked);
  updateTotal();
  updateAllCheckbox();
};

const handleQuantityChange = debounce(async (productEl, item, newQty) => {
  const oldQty = item.quantity;
  const qty = validateQty(newQty);
  item.quantity = qty;
  updateQuantityUI(productEl, qty, item);

  try {
    await updateCartItem(item.id, qty);
  } catch (err) {
    console.error(err);
    new MiniAlert(alerts.error);
    item.quantity = oldQty;
    updateQuantityUI(productEl, oldQty, item);
  }
}, 300);

const handleRemove = (productEl, item) => {
  deleteCartItem(item.id)
    .then(() => {
      cartItems = cartItems.filter((i) => i.id !== item.id);
      productEl.remove();
      updateTotal();
      updateAllCheckbox();
      if (!cartItems.length) renderCart();
    })
    .catch(() => new MiniAlert(alerts.error));
};

const handleIndividualOrder = (item) => {
  if (!item.isChecked) return new MiniAlert(alerts.empty);
  sessionStorage.setItem("orderItem", JSON.stringify(item));
  window.location.href = "order.html";
};

const handleTotalOrder = () => {
  const checked = cartItems.filter((i) => i.isChecked);
  if (!checked.length) return new MiniAlert(alerts.empty);
  sessionStorage.setItem("orderItems", JSON.stringify(checked));
  window.location.href = "order.html";
};

const handleAllCheckboxClick = () => {
  if (!dom.allCheckbox) return;
  const newState = !dom.allCheckbox.classList.contains("checked");
  cartItems.forEach((i) => {
    i.isChecked = newState;
    const productEl = dom.container.querySelector(`[data-id="${i.id}"]`);
    updateCheckbox(productEl?.querySelector(".check-box"), newState);
  });
  updateTotal();
  updateCheckbox(dom.allCheckbox, newState);
};

// ===== 이벤트 리스너 설정 =====
const setupEventListeners = () => {
  dom.container.addEventListener("click", (e) => {
    const productEl = e.target.closest(".cart-product");
    if (!productEl) return;
    const item = findItem(productEl.dataset.id);
    if (!item) return;

    if (e.target.closest(".check-box"))
      handleCheckboxClick(item, e.target.closest(".check-box"));
    else if (e.target.closest(".quantity-btn.decrease"))
      handleQuantityChange(productEl, item, item.quantity - 1);
    else if (e.target.closest(".quantity-btn.increase"))
      handleQuantityChange(productEl, item, item.quantity + 1);
    else if (e.target.closest(".close-btn")) handleRemove(productEl, item);
    else if (e.target.closest(".individual-order-btn"))
      handleIndividualOrder(item);
  });

  dom.container.addEventListener("input", (e) => {
    if (!e.target.classList.contains("quantity-input")) return;
    const productEl = e.target.closest(".cart-product");
    const item = findItem(productEl.dataset.id);
    handleQuantityChange(productEl, item, parseInt(e.target.value));
  });

  dom.allCheckbox?.addEventListener("click", handleAllCheckboxClick);
  dom.totalBtn?.addEventListener("click", handleTotalOrder);
};

// ===== 애플리케이션 초기화 =====
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const data = await getCartItems();
    cartItems = (data.results || []).map((i) => ({
      id: i.id,
      productId: i.product.id,
      name: i.product.name,
      image: i.product.image,
      price: i.product.price,
      seller: i.product.seller,
      shipping_method: i.product.shipping_method,
      quantity: i.quantity,
      isChecked: true,
    }));
  } catch (err) {
    console.error(err);
    cartItems = [];
  } finally {
    renderCart();
    setupEventListeners();
  }
});
