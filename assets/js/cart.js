// =====================================================
// 장바구니 메인 UI 관리 모듈
// =====================================================

// 장바구니 API 통신 함수들
import {
  getCartItems, // 장바구니 목록 조회
  updateCartItem, // 수량 업데이트
  deleteCartItem, // 아이템 삭제
  addCartItem, // 새 아이템 추가
  formatPrice, // 가격 포맷팅
} from "./cart-api.js";

import { alerts } from "./calculate.js";
import MiniAlert from "../../components/MiniAlert.js";
// ===== 상수 정의 =====
const CONSTANTS = {
  // 수량 제한 설정
  MIN_QTY: 1, // 최소 주문 수량
  MAX_QTY: 999, // 최대 주문 수량 (UI 제한)

  // 배송 방법 열거형 (서버 API와 일치해야 함)
  SHIPPING: {
    PARCEL: "PARCEL", // 택배 배송
    PICKUP: "PICKUP", // 매장 픽업
  },

  // UI 아이콘 이미지 경로 (변경 시 한 곳에서 관리)
  IMAGES: {
    CHECKED: "../assets/images/check-box-Fill.svg", // 체크된 체크박스
    UNCHECKED: "../assets/images/check-box.svg", // 빈 체크박스
    MINUS: "../assets/images/icon-minus-line.svg", // 수량 감소 버튼
    PLUS: "../assets/images/icon-plus-line.svg", // 수량 증가 버튼
  },
};

// ===== DOM 요소 캐싱 섹션 =====
// 자주 사용되는 DOM 요소들을 미리 선택하여 성능 최적화
// 페이지 로드 시 한 번만 선택하고 재사용
const dom = {
  cartContainer: document.querySelector(".cart-products-content"), // 장바구니 상품 목록 컨테이너
  orderSection: document.querySelector(".cart-order-content"), // 주문 요약 섹션
  totalOrderBtn: document.querySelector(".total-order-btn"), // 전체 주문하기 버튼
  totalPriceElem: document.querySelector(".total-price .order-price"), // 총 상품금액 표시 요소
  finalPriceElem: document.querySelector(".final-price .order-price"), // 최종 결제금액 표시 요소
  allCheckBox: document.querySelector(".cart-list .check-box"), // 전체 선택 체크박스
  addToCartButtons: document.querySelectorAll(".add-to-cart-btn"), // 장바구니 담기 버튼들 (상품 페이지용)
};

// ===== 장바구니 상태 관리 클래스 =====
/*
 * CartManager 클래스
 * 장바구니 데이터의 모든 상태 및 비즈니스 로직을 관리
 */
class CartManager {
  constructor() {
    this.items = []; // 장바구니 아이템 배열 (서버에서 가져온 데이터 + UI 상태)
  }

  // ===== 데이터 관리 메소드 =====
  // 전체 아이템 리스트 설정 (서버에서 초기 로드 시 사용)
  setItems(items) {
    this.items = items;
  }

  // 모든 장바구니 아이템 반환
  getItems() {
    return this.items;
  }

  // ID로 특정 아이템 찾기
  findById(id) {
    return this.items.find((item) => item.id === Number(id));
  }

  // ----- ### 핵심 재고 체크 함수 생성 ### -----
  // ----- 상품 ID로 재고 정보를 찾아서 수량 체크 후 결과 반환

  // productId: 상품 ID, newQuantity: 새로 추가할 수량, currentQuantity: 현재 수량(기본값 0)
  checkStock(productId, newQuantity, currentQuantity = 0) {
    // 1. 해당 상품의 재고 정보 찾기
    // this.items(장바구니에 있는 모든 상품들)에서 상품 id가 일치하는 상품 찾아서 객체로 반환
    const product = this.items.find((item) => item.id === productId);

    // 2. 상품을 찾지 못한 경우에 처리
    // 상품을 찾지 못한 경우 재고 부족 메시지 반환(-> checkResult)
    if (!product) {
      return { isValid: false, message: "상품을 찾을 수 없습니다." };
    }

    // 3. 총 수량 계산(현재 수량 + 새로 추가할 수량)
    const totalQuantity = currentQuantity + newQuantity;

    // 4. 재고 체크(총 수량이 재고보다 큰지 확인)
    if (totalQuantity > product.stock) {
      return {
        isValid: false,
        message: `재고가 부족합니다. <br> 최대 ${product.stock}개까지 구매 가능합니다.`,
      };
    }

    return { isValid: true, message: "수량 추가 가능" };
  }
  // 새 아이템 추가 (동일 상품이 있으면 수량 합산)
  addItem(item) {
    // 1. 장바구니에 같은 상품이 이미 있는지 확인
    const existing = this.items.find((i) => i.productId === item.productId);

    if (existing) {
      // 2. 위에서 만든 checkStock 함수 호출
      // item.productId: 상품 ID, item.quantity: 새로 추가할 수량, existing.quantity: 현재 장바구니에 있는 수량
      const checkResult = this.checkStock(
        item.productId,
        item.quantity,
        existing.quantity
      );

      // 3. 재고 체크 결과 확인
      // 3-1. 재고 부족시 에러 발생
      if (!checkResult.isValid) {
        throw new Error(checkResult.message);
      }
      // 3-2. 재고 충분하면 수량 증가
      existing.quantity += item.quantity;
    } else {
      // 3-3. 새상품인 경우
      // 재고 체크 함수 호출(현재 수량 0 - 새 상품이니까 장바구니에 이미 담긴 값 없음)
      const checkResult = this.checkStock(item.productId, item.quantity, 0);

      // 3-4. 재고 체크 결과 확인
      // 재고 부족시 에러 발생
      if (!checkResult.isValid) {
        throw new Error(checkResult.message);
      }
      // 3-5. 재고 충분하면 새 상품 추가
      this.items.push(item); // 새 상품 추가
      // this.items: 장바구니 배열, push(): 배열 끝에 새 요소 추가, item: 새상품 정보
    }
  }

  // 아이템 삭제 (배열에서 제거 + UI에서 DOM 삭제 필요)
  removeItem(id) {
    this.items = this.items.filter((item) => item.id !== Number(id));
  }

  // ===== 상태 업데이트 메소드 =====
  // 특정 아이템의 수량 업데이트
  updateItemQuantity(id, quantity) {
    const item = this.findById(id);
    if (item) {
      item.quantity = quantity;
    }
  }

  // 특정 아이템의 체크 상태 업데이트
  updateItemCheck(id, isChecked) {
    const item = this.findById(id);
    if (item) {
      item.isChecked = isChecked;
    }
  }

  // 모든 아이템의 체크 상태 일괄 설정
  checkAllItems(isChecked) {
    this.items.forEach((item) => {
      item.isChecked = isChecked;
    });
  }

  // 체크된 아이템들만 필터링 (주문 대상 아이템)
  getCheckedItems() {
    return this.items.filter((item) => item.isChecked);
  }

  getShippingFee() {
    return this.items.reduce((sum, item) => {
      // 체크된 상품만 계산
      if (!item.isChecked) return sum;
      // 무료배송 처리
      const fee = item.shipping_fee || 0;
      return sum + fee;
    }, 0);
  }

  // 체크된 아이템들의 총 가격 계산
  getTotalPrice() {
    return this.items.reduce((sum, item) => {
      return item.isChecked ? sum + item.price * item.quantity : sum;
    }, 0);
  }

  // 모든 아이템이 체크된 상태인지 확인 (전체 선택 체크박스 UI 제어)
  areAllChecked() {
    return this.items.length > 0 && this.items.every((item) => item.isChecked);
  }

  // 빈 장바구니 체크 (비어있음 메시지 표시 여부 결정)
  isEmpty() {
    return this.items.length === 0;
  }
}

// ===== 전역 상태 인스턴스 =====
// 전체 애플리케이션에서 사용할 단일 장바구니 인스턴스
const cart = new CartManager();

// ===== 유틸리티 함수 섹션 =====
/**
 * 디바운스 함수: 빠른 연속 호출을 방지하여 성능 최적화
 * 사용처: 수량 입력 시 API 호출 빈도 제어
 */
function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer); // 이전 타이머 취소
    timer = setTimeout(() => fn(...args), delay); // 새 타이머 설정
  };
}

/**
 * 수량 유효성 검증
 * 역할: 사용자 입력값을 규칙에 맞게 정함
 * 규칙: 1 이상 110 이하, 숫자가 아닌 경우 1로 설정
 */
function validateQuantity(value) {
  if (isNaN(value) || value < CONSTANTS.MIN_QTY) return CONSTANTS.MIN_QTY;
  if (value > CONSTANTS.MAX_QTY) return CONSTANTS.MAX_QTY;
  return value;
}

/**
 * DOM 요소 토글
 * 역할: CSS 클래스를 이용한 요소 보이기/숨기기 제어
 * 사용처: 빈 장바구니 시 주문 섹션 숨김 처리
 */
function toggleElementVisibility(element, show) {
  if (!element) return; // null 체크
  element.classList.toggle("hidden", !show); // CSS hidden 클래스 토글
}

// ===== UI 업데이트 함수 섹션 =====
// 데이터 변경에 따른 UI 동기화를 담당 함수
// 각 함수는 단일 책임 원칙에 따라 특정 UI 요소만 업데이트

/**
 * 체크박스 UI 업데이트
 * 역할: 체크 상태에 따라 체크박스 상태 변경
 */
function updateCheckboxUI(checkbox, checked) {
  if (!checkbox) return;

  checkbox.classList.toggle("checked", checked); // CSS 스타일링
  const imgSrc = checked // 체크 상태에 따른 아이콘 선택
    ? CONSTANTS.IMAGES.CHECKED
    : CONSTANTS.IMAGES.UNCHECKED;

  // 동적으로 HTML 생성
  checkbox.innerHTML = `<img src="${imgSrc}" alt="${
    checked ? "체크됨" : "체크안됨"
  }">`;
}

/**
 * 전체 선택 체크박스 UI 업데이트
 * 호출 시점: 개별 아이템 체크 상태 변경 시
 */
function updateAllCheckboxUI() {
  if (!dom.allCheckBox) return;
  updateCheckboxUI(dom.allCheckBox, cart.areAllChecked());
}

/**
 * 총 가격 UI 업데이트
 * 표시 위치: 상품금액 + 최종결제금액
 */
function updateTotalPriceUI() {
  const total = cart.getTotalPrice();
  const shipping = cart.getShippingFee(); // 새로 추가한 배송비
  const final = total + shipping;

  if (dom.totalPriceElem) dom.totalPriceElem.textContent = formatPrice(total);
  const shipElem = document.querySelector(".ship-price .order-price");
  if (shipElem) shipElem.textContent = formatPrice(shipping);
  if (dom.finalPriceElem) dom.finalPriceElem.textContent = formatPrice(final);
}

/**
 * 개별 상품 수량/가격 UI 업데이트
 * 역할: 특정 상품의 수량 입력 필드와 가격 표시 동기화
 */
function updateQuantityUI(productEl, item) {
  const input = productEl.querySelector(".quantity-input"); // 수량 입력 필드
  const priceElem = productEl.querySelector(".cart-product-order p"); // 개별 상품 가격 표시

  if (input) input.value = item.quantity; // 수량 입력값 동기화
  if (priceElem)
    // 수량 * 단가 계산 결과 표시
    priceElem.textContent = `${formatPrice(item.price * item.quantity)}원`;

  updateTotalPriceUI(); // 전체 가격도 업데이트
}

/**
 * 주문 섹션 업데이트
 * 역할: 빈 장바구니 상태에 따라 주문 관련 UI 요소들 숨김/표시
 */
function updateOrderSectionVisibility() {
  const isEmpty = cart.isEmpty();
  toggleElementVisibility(dom.orderSection, !isEmpty); // 비어있으면 숨김
  toggleElementVisibility(dom.totalOrderBtn, !isEmpty); // 비어있으면 숨김
}

// ===== HTML 생성 섹션 =====
/* 장바구니 상품 HTML 템플릿 생성 함수 */
function createProductHTML(item) {
  // 배송 방법에 따른 텍스트 매핑
  const shippingText =
    item.shipping_method === CONSTANTS.SHIPPING.PARCEL
      ? "택배배송 / 무료배송"
      : "배송방법: 매장픽업";

  return `
      <button class="check-box" aria-label="상품 선택"></button>

      <!-- 상품 기본 정보 영역 -->
      <div class="cart-product-title">
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-product-text">
          <div class="cart-product-dec">
          <p>${item.seller.name}</p>
            <h3>${item.name}</h3>
            <p class="total-price">${formatPrice(item.price)}원</p>
            <p>${item.shipping_method} / ${
    item.shipping_fee ? formatPrice(item.shipping_fee) + "원" : "무료배송"
  }</p>
          </div>
        </div>
      </div>
  <div class="quantity-container-wrap">
      <div class="quantity-container">
        <button class="quantity-btn decrease">
          <img src="${CONSTANTS.IMAGES.MINUS}" alt="감소">
        </button>
        <input type="number" class="quantity-input" value="${item.quantity}"
               min="${CONSTANTS.MIN_QTY}" max="${CONSTANTS.MAX_QTY}">
        <button class="quantity-btn increase">
          <img src="${CONSTANTS.IMAGES.PLUS}" alt="증가">
        </button>
      </div>
  </div>
      <!-- 주문 정보 및 액션 -->
      <div class="cart-product-order">
        <p>${formatPrice(item.price * item.quantity)}원</p>
        <button class="individual-order-btn common-btn">주문하기</button>
      </div>

      <!-- 상품 삭제 버튼 -->
      <button class="close-btn" aria-label="상품 삭제"></button>

  `;
}

/* 장바구니 상품 DOM 요소 생성 함수 */
function createProductElement(item) {
  const article = document.createElement("article");
  article.className = "cart-product";
  article.dataset.id = item.id;
  article.innerHTML = createProductHTML(item);

  // 초기 체크 상태 동기화
  updateCheckboxUI(article.querySelector(".check-box"), item.isChecked);

  return article;
}

// ===== 렌더링 함수 섹션 =====

/* 빈 장바구니 상태 렌더링
 * 역할: 장바구니에 상품이 없을 때 표시할 안내 메시지 생성 */
function renderEmptyCart() {
  dom.cartContainer.innerHTML = `
    <div class="empty-cart">
      <h3 class="empty-cart-title">장바구니에 담긴 상품이 없습니다.</h3>
      <p class="empty-cart-message">원하는 상품을 장바구니에 담아보세요!</p>
    </div>
  `;
}

/**
 * 장바구니 상품 목록 렌더링
 * 역할: 모든 장바구니 아이템을 DOM 요소로 변환하여 화면에 표시
 * 처리 과정: 데이터 → HTML 템플릿 → DOM 요소 → 화면 삽입
 * 성능 고려: innerHTML 초기화 후 appendChild로 순차 추가
 */
function renderCartItems() {
  dom.cartContainer.innerHTML = ""; // 기존 내용 초기화
  cart.getItems().forEach((item) => {
    // 각 아이템을 DOM으로 변환
    const productEl = createProductElement(item); // HTML → DOM 요소 생성
    dom.cartContainer.appendChild(productEl); // 화면에 추가
  });
}

/**
 * 메인 렌더링 함수
 * 역할: 장바구니 상태를 분석하고 적절한 UI를 선택하여 렌더링
 * 호출 시점: 페이지 로드, 데이터 변경, 아이템 추가/삭제 시
 * 렌더링 후 관련 UI 요소들도 동기화 (가격, 체크박스, 버튼 상태)
 */
function renderCart() {
  if (!dom.cartContainer) return; // DOM 요소 존재 확인

  // 상태에 따른 조건부 렌더링
  if (cart.isEmpty()) {
    renderEmptyCart(); // 빈 장바구니 UI
  } else {
    renderCartItems(); // 상품 목록 UI
  }

  updateOrderSectionVisibility(); // 주문 섹션 표시/숨김
  updateTotalPriceUI(); // 총 가격 업데이트
  updateAllCheckboxUI(); // 전체 선택 체크박스 상태
}

// ===== 체크박스 이벤트 =====

/* 개별 상품 체크박스 클릭
 * 처리 흐름: 상태 변경 → 체크박스 UI → 가격 계산 → 전체 선택 동기화
 */
function handleItemCheckboxClick(itemId, checkbox) {
  const item = cart.findById(itemId);
  if (!item) return; // 아이템 존재 확인

  cart.updateItemCheck(itemId, !item.isChecked); // 상태 토글
  updateCheckboxUI(checkbox, item.isChecked); // 개별 체크박스 업데이트

  updateTotalPriceUI(); // 총 가격 재계산 (체크된 상품만)
  updateAllCheckboxUI(); // 전체 선택 상태 동기화
}

/**
 * 전체 선택 체크박스 클릭
 * 역할: 모든 상품을 일괄 선택/해제하고 모든 관련 UI 동기화
 * 로직: 현재 전체 선택 상태의 반대로 모든 아이템 상태 변경
 * 성능 고려: 한 번의 상태 변경으로 모든 아이템 처리
 */
function handleAllCheckboxClick() {
  if (!dom.allCheckBox) return; // DOM 요소 존재 확인

  // UI 상태 기반 현재 체크 상태 판단 (CSS 클래스 확인)
  const isCurrentlyChecked = dom.allCheckBox.classList.contains("checked");
  const newCheckedState = !isCurrentlyChecked; // 반대 상태로 변경

  cart.checkAllItems(newCheckedState); // 모든 아이템 상태 일괄 변경

  // 화면의 모든 개별 체크박스 UI 동기화
  cart.getItems().forEach((item) => {
    const productEl = dom.cartContainer.querySelector(`[data-id="${item.id}"]`);
    const checkbox = productEl?.querySelector(".check-box");
    updateCheckboxUI(checkbox, newCheckedState); // 각 체크박스 UI 업데이트
  });

  updateTotalPriceUI(); // 총 가격 재계산
  updateCheckboxUI(dom.allCheckBox, newCheckedState); // 전체 선택 체크박스 UI 업데이트
}

// ===== 수량 변경 이벤트  =====

/**
 * 수량 변경 메인(디바운스 적용)
 * 역할: 수량 변경 요청을 서버에 전송하고 UI 동기화
 * 성능 최적화: 300ms 디바운스로 연속 변경 시 마지막 값만 서버 전송
 * 에러 처리: 서버 실패 시 이전 상태로
 */
const handleQuantityChange = debounce(async (itemId, newQty) => {
  const item = cart.findById(itemId);
  if (!item) return; // 아이템 존재 확인

  const oldQty = item.quantity; // 이전 값 저장
  const validQty = validateQuantity(newQty);

  // 재고 체크 추가
  const checkResult = cart.checkStock(item.id, validQty, 0);
  if (!checkResult.isValid) {
    // input 필드를 최대 재고 수량으로 변경
    const productEl = dom.cartContainer.querySelector(`[data-id="${itemId}"]`);
    const input = productEl?.querySelector(".quantity-input");
    if (input) {
      input.value = item.stock; // 최대 재고 수량으로 설정
    }

    // 재고 부족 알림창 표시
    const errorAlert = {
      title: "알림",
      message: checkResult.message,
      buttons: ["확인"],
      link: null,
      linkHref: null,
      closeBackdrop: true,
      customContent: null,
    };

    new MiniAlert(errorAlert);

    // 확인 버튼에 클릭 이벤트 추가
    setTimeout(() => {
      const confirmBtn = document.querySelector(".alert-btn");
      if (confirmBtn) {
        confirmBtn.addEventListener("click", () => {
          document.querySelector(".alert-backdrop")?.remove();
        });
      }
    }, 100);

    return; // 함수 실행 중단
  }

  cart.updateItemQuantity(itemId, validQty); // 로컬 상태 변경
  const productEl = dom.cartContainer.querySelector(`[data-id="${itemId}"]`);
  updateQuantityUI(productEl, item); // UI 즉시 반영

  try {
    await updateCartItem(itemId, validQty); // API 호출
  } catch (err) {
    // console.error(err); // 콘솔 에러 메시지 숨김
    // 서버 에러 시 재고 부족 알림 표시
    const serverErrorAlert = {
      title: "재고 부족",
      message: `구매 가능 수량을 초과하였습니다.<br>최대 구매 가능 수량: ${item.stock}개`,
      buttons: ["확인"],
      link: null,
      linkHref: null,
      closeBackdrop: true,
      customContent: null,
    };

    new MiniAlert(serverErrorAlert);

    // 확인 버튼에 클릭 이벤트 추가하기
    setTimeout(() => {
      const confirmBtn = document.querySelector(".alert-btn");
      if (confirmBtn) {
        confirmBtn.addEventListener("click", () => {
          document.querySelector(".alert-backdrop")?.remove();
        });
      }
    }, 100);

    // input 필드를 최대 재고 수량으로 변경
    const input = productEl?.querySelector(".quantity-input");
    if (input) {
      input.value = item.stock; // 최대 재고 수량으로 설정
    }

    cart.updateItemQuantity(itemId, item.stock); // 상태를 최대 재고 수량으로 변경
    updateQuantityUI(productEl, item); // UI 업데이트
  }
}, 200); // 300ms 디바운스: 사용자가 빠르게 연속 클릭해도 마지막 값만 서버 전송

/**
 * 수량 감소 버튼
 * 역할: - 클릭 시 현재 수량에서 1 감소
 * 제한: 최소 수량(1) 이하로는 감소하지 않음 (validateQuantity에서 처리)
 */
function handleQuantityDecrease(itemId) {
  const item = cart.findById(itemId);
  if (item) {
    handleQuantityChange(itemId, item.quantity - 1); // 현재 수량 -1
  }
}

/**
 * 수량 증가 버튼
 * 역할: + 클릭 시 현재 수량에서 1 증가
 * 제한: 최대 수량(110) 이상으로는 증가하지 않음 (validateQuantity에서 처리)
 */
function handleQuantityIncrease(itemId) {
  const item = cart.findById(itemId);
  if (item) {
    handleQuantityChange(itemId, item.quantity + 1);
  }
}

/**
 * 수량 직접 입력
 * 역할: 사용자가 입력 필드에 직접 수량을 입력할 때 처리
 * 입력 검증: 문자열 → 정수 변환 후 validateQuantity로 범위 확인
 */
function handleQuantityInput(itemId, inputValue) {
  const item = cart.findById(itemId);
  if (item) {
    const newQuantity = parseInt(inputValue);
    handleQuantityChange(itemId, newQuantity);
  }
}

// ===== 삭제 이벤트 =====
// 장바구니에서 상품 제거 처리 (서버 동기화 포함)

/**
 * 상품 삭제
 * 역할: 사용자가 X 버튼을 클릭하여 상품을 장바구니에서 제거할 때 처리
 * 처리 순서: 서버 삭제 → 로컬 상태 삭제 → UI 삭제 → 관련 UI 업데이트
 */
function handleItemRemove(itemId) {
  const productEl = dom.cartContainer.querySelector(`[data-id="${itemId}"]`); // 삭제할 DOM 요소 참조

  // 서버에서 삭제 시도
  deleteCartItem(itemId)
    .then(() => {
      // 서버 삭제 성공 시 순차적 처리
      cart.removeItem(itemId); // 로컬 상태에서 제거
      productEl.remove(); // DOM에서 제거

      // 삭제 후 관련 UI 요소들 업데이트
      updateTotalPriceUI(); // 총 가격 재계산
      updateAllCheckboxUI(); // 전체 선택 상태 재확인

      // 모든 상품이 삭제된 경우 빈 장바구니 UI로 전환
      if (cart.isEmpty()) {
        renderCart(); // 전체 재렌더링 (빈 상태 UI)
      }

      new MiniAlert(alerts.delete); // 삭제 완료 알림
    })
    .catch(() => new MiniAlert(alerts.error)); // 삭제 실패 시 에러 알림
}

// ===== 주문 이벤트 =====
// 사용자의 주문 요청 처리 및 주문 페이지로 데이터 전달
// 개별 주문과 선택 상품 일괄 주문 지원

/**
 * 개별 상품 주문
 * 역할: 특정 상품 하나만 주문하는 주문하기 버튼 처리
 * 검증: 해당 상품이 체크된 상태인지 확인 (체크되지 않은 상품은 주문 불가)
 * 데이터 전달: sessionStorage를 통해 주문 페이지에 상품 정보 전달
 */
function handleIndividualOrder(itemId) {
  const item = cart.findById(itemId);
  if (!item) return; // 상품 존재 확인

  // 체크된 상품만 주문 가능
  if (!item.isChecked) {
    return new MiniAlert(alerts.empty); // 선택되지 않은 상품 주문 시도 시 경고
  }

  // 주문 데이터 전달 및 페이지 이동
  sessionStorage.setItem("orderItem", JSON.stringify(item)); // 단일 상품 정보 저장
  window.location.href = "order.html"; // 주문 페이지로 이동
}

/**
 * 전체 선택 상품 주문
 * 역할: 주문하기 클릭 시 체크된 모든 상품을 한번에 주문
 * 검증: 체크된 상품이 최소 1개 이상 있는지 확인
 * 데이터 전달: 체크된 모든 상품의 배열을 sessionStorage로 전달
 * 사용자 경험: 선택한 상품들의 일괄 주문으로 편의성 제공
 */
function handleTotalOrder() {
  const selectedItems = cart.getCheckedItems(); // 체크된 상품들만 필터링

  //주문할 상품이 최소 1개는 있어야 함
  if (selectedItems.length === 0) {
    return new MiniAlert(alerts.empty); // 선택된 상품 없음 경고
  }

  // 주문 데이터 전달 및 페이지 이동
  sessionStorage.setItem("orderItems", JSON.stringify(selectedItems)); // 선택된 상품 배열 저장
  window.location.href = "order.html"; // 주문 페이지로 이동
}

// ===== 장바구니 담기 =====
// 상품 페이지에서 장바구니에 상품을 추가하는 기능

/**
 * 장바구니 담기
 * 역할: 상품 상세 페이지의 장바구니 담기 버튼 처리
 * 처리 흐름: API 호출 → 서버 응답 → 로컬 상태 업데이트 → UI 재렌더링
 * 데이터 변환: 서버 응답과 상품 정보를 UI에 결합
 * 사용자 경험: 성공 시 알림 + 즉시 장바구니 목록에 반영
 */
async function handleAddToCart(product) {
  try {
    // 1: 서버에 장바구니 추가 요청
    const addedItem = await addCartItem({ productId: product.id, quantity: 1 });

    // 2: 서버 응답과 상품 정보를 객체로 결합
    const cartItem = {
      id: addedItem.id, // 서버에서 생성된 cart_item_id
      productId: product.id, // 원본 상품 ID
      name: product.name, // 상품명
      image: product.image, // 상품 이미지 URL
      price: product.price, // 단가
      seller: product.seller, // 판매자 정보
      shipping_method: product.shipping_method, // 배송 방법
      shipping_fee: product.shipping_fee, // 배송비
      quantity: 1, // 기본 수량
      isChecked: true, // 기본적으로 체크된 상태
    };

    // 3: 로컬 상태 업데이트 및 UI 재렌더링
    cart.addItem(cartItem); // 장바구니 상태에 추가
    renderCart(); // 전체 UI 재렌더링
    new MiniAlert(alerts.add); // 성공 알림
  } catch (err) {
    // 에러 처리: 사용자 알림
    new MiniAlert(alerts.error); // 실패 알림
  }
}

// ===== 이벤트 리스너 설정 섹션 =====
// 동적으로 생성된 DOM 요소들에 대한 이벤트 위임 및 바인딩
// 이벤트 위임을 활용하여 동적 요소들도 자동으로 이벤트 처리

/**
 * 장바구니 상품별 클릭 이벤트 설정
 * 동적으로 생성되는 상품 요소들에 개별적으로 이벤트를 바인딩하지 않고 부모 컨테이너에서 한 번에 처리
 * 체크박스, 수량증감버튼, 삭제버튼, 개별주문버튼
 */
function setupCartItemClickEvents() {
  if (!dom.cartContainer) {
    return; // 함수 중단
  }

  dom.cartContainer.addEventListener("click", (e) => {
    const productEl = e.target.closest(".cart-product"); // 클릭된 요소의 상위 상품 요소 찾기
    if (!productEl) return; // 상품 영역 외부 클릭 시 무시

    const itemId = productEl.dataset.id; // data-id로 상품 식별

    // 클릭된 요소를 분석하여 적절한 핸들러 호출
    if (e.target.closest(".check-box")) {
      handleItemCheckboxClick(itemId, e.target.closest(".check-box"));
    } else if (e.target.closest(".quantity-btn.decrease")) {
      handleQuantityDecrease(itemId);
    } else if (e.target.closest(".quantity-btn.increase")) {
      handleQuantityIncrease(itemId);
    } else if (e.target.closest(".close-btn")) {
      handleItemRemove(itemId);
    } else if (e.target.closest(".individual-order-btn")) {
      handleIndividualOrder(itemId);
    }
  });
}

/**
 * 수량 입력 이벤트 설정
 * 사용자가 수량 입력 필드에 직접 입력할 때 처리
 * input (keyup, change보다 더 빠른 응답)
 * 동적으로 생성되는 수량 입력 필드에 대한 일괄 처리
 */
function setupQuantityInputEvents() {
  if (!dom.cartContainer) {
    return; // 함수 중단
  }

  dom.cartContainer.addEventListener("input", (e) => {
    if (!e.target.classList.contains("quantity-input")) return; // 수량 입력 필드가 아닌 경우 무시

    const productEl = e.target.closest(".cart-product"); // 해당 상품 요소 찾기
    const itemId = productEl.dataset.id; // 상품 ID 추출
    handleQuantityInput(itemId, e.target.value); // 입력값 처리
  });
}

/**
 * 전체 선택 체크박스 이벤트 설정
 * 상단의 전체선택 체크박스 클릭 처리
 * 단일 요소이므로 직접 이벤트 바인딩
 */
function setupCheckboxEvents() {
  dom.allCheckBox?.addEventListener("click", handleAllCheckboxClick);
}

/**
 * 전체 주문 버튼 이벤트 설정
 * 하단의 주문하기 버튼 클릭 처리
 * 단일 요소이므로 직접 이벤트 바인딩
 */
function setupOrderEvents() {
  dom.totalOrderBtn?.addEventListener("click", handleTotalOrder);
}

/**
 * 장바구니 담기 버튼 이벤트 설정
 * 상품 페이지의 장바구니 담기 버튼들 처리
 * data-product 속성에 JSON으로 저장된 상품 정보 사용
 * 상품 상세 페이지, 상품 목록 페이지의 장바구니 담기 버튼
 */
function setupAddToCartEvents() {
  dom.addToCartButtons.forEach((btn) => {
    // 모든 장바구니 담기 버튼에 이벤트 바인딩
    btn.addEventListener("click", () => {
      const product = JSON.parse(btn.dataset.product); // data-product JSON 파싱
      handleAddToCart(product); // 장바구니 추가 처리
    });
  });
}

// 장바구니 버튼 클릭 시 로그인 체크 함수
function checkUserLogin() {
  const user = JSON.parse(localStorage.getItem("user"));
  const pathPrefixfile = location.pathname.includes("/pages/") ? "" : "pages/";

  if (!user) {
    const alert = new MiniAlert({
      title: "장바구니 이동 알림 모달",
      message: "로그인이 필요합니다.<br> 로그인 하러 갈까요?",
      buttons: [],
      link: ["예"],
      linkHref: [`${pathPrefixfile}login.html`],
      closeBackdrop: true,
      customContent: null,
    });
    return false; // 로그인 안됨
  }
  return true; // 로그인 됨
}
/**
 * 모든 이벤트 리스너 일괄 설정 함수
 * 페이지 로드 완료 후 모든 이벤트 리스너를 한 번에 설정
 * DOMContentLoaded 이벤트 후 호출
 * 코드 중복 방지 및 일관성 있는 이벤트 설정
 */
function setupAllEventListeners() {
  setupCartItemClickEvents();
  setupQuantityInputEvents();
  setupCheckboxEvents();
  setupOrderEvents();
  setupAddToCartEvents();
}

// ===== 애플리케이션 초기화  =====
// 페이지 로드 완료 후 데이터 로드 및 UI 초기 설정

/**
 * 장바구니 데이터 로드 함수
 * 서버에서 사용자의 장바구니 데이터를 가져와서 UI에 맞는 형태로 변환
 * 서버 API 응답 → UI 내부 상태 객체
 * 네트워크 오류 시 빈 장바구니로 초기화
 * 오프라인 상황에도 기본 UI 제공
 */
async function loadCartData() {
  try {
    // 서버에서 장바구니 데이터 가져오기
    const data = await getCartItems();

    // 서버 데이터를 UI에 적합한 형태로 변환
    const items = (data.results || []).map((i) => ({
      id: i.id, // 서버에서 생성된 cart_item_id
      productId: i.product.id, // 원본 상품 ID
      name: i.product.name, // 상품명
      image: i.product.image, // 상품 이미지
      price: i.product.price, // 단가
      seller: i.product.seller, // 판매자 정보
      shipping_method: i.product.shipping_method, // 배송 방법
      shipping_fee: i.product.shipping_fee || 0, // 배송비
      quantity: i.quantity, // 서버에 저장된 수량
      stock: i.product.stock, // 상품 재고 수량
      isChecked: true, // 기본적으로 모든 아이템 체크 상태
    }));

    // 처리된 데이터를 전역 상태에 설정
    cart.setItems(items);
  } catch (err) {
    // 네트워크 오류 또는 인증 오류 시 빈 상태로 초기화
    cart.setItems([]); // 에러 시 빈 장바구니로 설정
  }
}

/**
 * 메인 애플리케이션 시작점
 * DOM 로드 완료 후 전체 애플리케이션 초기화
 * 실행 순서: 1) 데이터 로드 2) UI 렌더링 3) 이벤트 리스너 설정
 * 비동기 처리: 데이터 로드가 완료될 때까지 기다린 후 UI 업데이트
 * 사용자 경험: 에러 상황에도 기본적인 UI는 제공
 */
document.addEventListener("DOMContentLoaded", async () => {
  await loadCartData(); // 서버 데이터 로드 대기
  renderCart(); // 데이터 기반 초기 UI 렌더링
  setupAllEventListeners(); // 모든 이벤트 리스너 설정
});

// 전역 함수로 등록하여 다른 파일에서 사용 가능하게 만들기
window.checkUserLogin = checkUserLogin;
