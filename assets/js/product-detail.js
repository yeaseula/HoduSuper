// ===== 상품 상세 페이지 전용 JavaScript =====
import MiniAlert from "/components/MiniAlert.js";

// 1. 페이지 로드 시 실행되는 함수
document.addEventListener("DOMContentLoaded", async () => {
  await initProductDetail();
});

// 2. 상품 정보 불러와서 화면에 표시
async function initProductDetail() {
  // 2-1) URL에서 상품 ID 가져오기(api.js에서 정의한 함수 사용)
  const productId = getUrlParameter("id");
  // 2-2) 상품 정보 가져오기(api.js에서 정의한 함수 사용)
  const productDetail = await getProductDetail(productId);
  // 2-3) 상품 정보 화면에 표시
  const productInfo = displayProductInfo(productDetail);
}
// 스피너 요소들 선택
const imageSpinner = document.querySelector("#image-spinner");

// 3. 상품 정보 화면에 표시
async function displayProductInfo(productDetail) {
  const productImage = document.querySelector(".product-image img"); // 상품 이미지
  const productSeller = document.querySelector(".product-seller"); // 판매자(백엔드글로벌)
  const productTitle = document.querySelector(".product-title"); // 제품명(딥러닝 담요)
  const productPrice = document.querySelector(".price-number"); // 17,500(단가)
  const productDelivery = document.querySelector(".delivery-way"); // 택배배송
  const productDeliveryFee = document.querySelector(".delivery-fee"); // 무료배송

  // 3-1) 실제 데이터 업데이트 로직 추가
  if (productDetail) {
    document.title = `${productDetail.info}`;

    productImage.src = productDetail.image;
    productImage.alt = `${productDetail.info} - 대표 이미지`;

    // 스피너 표시 로직(이미지 로딩)
    productImage.addEventListener("load", () => {
      // 스피너 숨기기
      imageSpinner.style.display = "none";
      // 이미지 표시
      productImage.style.display = "block";
    });

    productSeller.textContent = productDetail.seller.store_name;
    productTitle.textContent = productDetail.info;
    productPrice.textContent = formatPrice(productDetail.price);
    productDelivery.textContent = productDetail.shipping_method;
    productDeliveryFee.textContent = formatPrice(productDetail.shipping_fee);

    // 3-2)메타 설명도 동적 업데이트 처리(SEO를 위해)
    const metaDescription = document.querySelector('meta[name="description"]');
    metaDescription.content = `HODU 오픈마켓에서 ${productDetail.info}를(을) 만나보세요. 개발자 필수템입니다.`;

    // 3-3) 재고 0인 경우 처리(품절 상품)
    if (productDetail.stock === 0) {
      showOutOfStock(productDetail);
    } else {
      setupQuantityControls(productDetail);
    }
  }
}

// 4. 수량 변경 버튼 클릭 이벤트 리스너
function setupQuantityControls(productDetail) {
  const decreaseBtn = document.querySelector("[data-action='decrease']");
  const increaseBtn = document.querySelector("[data-action='increase']");
  const productInput = document.querySelector("#quantity-display"); //1(버튼 숫자)
  const productTotalQuantity = document.querySelector("#total-quantity-number"); //1
  const productTotalPrice = document.querySelector("#total-price"); // 17,500(총 금액)

  // 4-1) 초기 총 가격 설정(1개 기준)
  productTotalPrice.innerHTML = `${formatPrice(
    productDetail.price
  )}<span class="unit">원</span>`;

  // 4-2)초기 버튼 상태 설정 추가(재고가 0개인 경우 대응)
  const initialQuantity = parseInt(productInput.value);
  updateButtonState(productDetail, initialQuantity);

  // 4-3) 수량 감소 버튼 클릭 이벤트
  decreaseBtn.addEventListener("click", () => {
    let productStock = parseInt(productInput.value);
    // 수량이 1개 이상인 경우에만 수량 감소 가능
    if (productStock > 1) {
      productStock--;
      productInput.value = productStock;
      updateQuantityAndPrice(
        productDetail,
        productInput,
        productTotalQuantity,
        productTotalPrice
      );
    }
  });

  // 4-4) 수량 증가 버튼 클릭 이벤트
  increaseBtn.addEventListener("click", () => {
    let productStock = parseInt(productInput.value);

    // 항상 수량 증가 (재고 체크는 updateQuantityAndPrice에서)
    productStock++;
    productInput.value = productStock;

    // updateQuantityAndPrice에서 재고 체크 및 알림창 표시
    updateQuantityAndPrice(
      productDetail,
      productInput,
      productTotalQuantity,
      productTotalPrice
    );
  });

  // 4-5)Enter 키 누르면 수량과 가격을 업데이트
  productInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      updateQuantityAndPrice(
        productDetail,
        productInput,
        productTotalQuantity,
        productTotalPrice
      );
    }
  });

  // 4-6) blur: input과 다르게 타이핑할 때마다 실행 X, 다른 곳으로 클릭할 때 실행
  productInput.addEventListener("blur", () => {
    updateQuantityAndPrice(
      productDetail,
      productInput,
      productTotalQuantity,
      productTotalPrice
    );
  });
}

// 5. 사용자가 입력한 수량에 따라 총 수량과 가격을 업데이트
function updateQuantityAndPrice(
  productDetail, // API에서 받아온 상품 객체
  productInput, // 수량 입력하는 input 요소
  productTotalQuantity, // 총 수량을 표시
  productTotalPrice // 총 가격을 표시
) {
  // 5-1) 사용자가 입력한 수량을 숫자로 변환
  let currentQuantity = parseInt(productInput.value);

  // 5-2) 유효성 검사
  // 5-2-1) 수량이 숫자가 아니거나 1보다 작으면 수량을 1로 설정
  if (isNaN(currentQuantity) || currentQuantity < 1) {
    currentQuantity = 1;
  }
  // 5-2-2) 수량이 상품 재고보다 크면 수량을 상품 재고로 설정
  else if (currentQuantity >= productDetail.stock) {
    // 이미 알림창이 표시되어 있는지 확인(이 로직 없으면 알림창이 계속 쌓임)
    const existingAlert = document.querySelector(".alert");
    if (!existingAlert) {
      const customAlert = {
        title: "알림",
        message: "재고 수량이 초과되었습니다.",
        buttons: ["확인"],
      };

      new MiniAlert(customAlert);

      // 수량을 재고 최대 수량으로 업데이트
      currentQuantity = productDetail.stock;
    }
  }

  // 5-3) 화면 업데이트
  // 5-3-1) 수량 입력하는 input 요소에 유효성 검사 적용된 수량 업데이트
  productInput.value = currentQuantity;
  // 5-3-2) 총 수량을 표시
  productTotalQuantity.textContent = currentQuantity;
  // 5-3-3) 총 가격을 표시
  productTotalPrice.innerHTML = `${formatPrice(
    currentQuantity * productDetail.price
  )}<span class="unit">원</span>`;

  updateButtonState(productDetail, currentQuantity);
}

// 6. 버튼 비활성화 관리
function updateButtonState(productDetail, currentQuantity) {
  const decreaseBtn = document.querySelector("[data-action='decrease']");
  const increaseBtn = document.querySelector("[data-action='increase']");

  // 6-1) 버튼 상태만 관리
  decreaseBtn.disabled = currentQuantity <= 1;
  increaseBtn.disabled = currentQuantity >= productDetail.stock;
}

// 7. 품절 처리 함수
function showOutOfStock(productDetail) {
  const totalQuantityText = document.querySelector(".total-quantity");
  const totalQuantityLine = document.querySelector(".total-quantity.line");
  const productInput = document.querySelector("#quantity-display");
  const productTotalPrice = document.querySelector("#total-price");
  const decreaseBtn = document.querySelector("[data-action='decrease']");
  const increaseBtn = document.querySelector("[data-action='increase']");

  // 7-1) 수량 입력 필드 비활성화
  productInput.disabled = true;
  productInput.value = "0";

  // 7-2) 버튼들 비활성화
  decreaseBtn.disabled = true;
  increaseBtn.disabled = true;

  // 7-3) 총 수량과 가격을 "이 상품은 현재 구매할 수 없는 상품입니다." 메시지로 변경(네이버 참고)
  totalQuantityText.textContent = "";
  totalQuantityLine.style.display = "none";
  productTotalPrice.innerHTML = `<span style="color: var(--gray-700); font-size: 1.6rem; display: inline-block; vertical-align: middle; line-height: 1;">이 상품은 현재 구매할 수 없는 상품입니다.</span>`;
}
