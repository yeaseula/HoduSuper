// ===== 상품 상세 페이지 전용 JavaScript =====
import MiniAlert from "/components/MiniAlert.js";

//js파일 최상단
const $ = (node) => document.querySelector(node);

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
  const productId = productDetail.id;

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
    setupTabControls();

    // 3-4) 상품 정보 탭 내용 생성
    const productInfoContent = document.getElementById("product-info-content");
    if (productInfoContent) {
      productInfoContent.innerHTML = createProductInfoContent(productId);
    } else {
      productInfoContent.innerHTML = `<p>상품 정보를 불러올 수 없습니다.</p>`;
    }

    // 3-5) 리뷰 탭 내용 생성
    const reviewContent = document.getElementById("review-content");
    if (reviewContent) {
      reviewContent.innerHTML = createReviewContent(productId);
    } else {
      reviewContent.innerHTML = `<p>리뷰 정보를 불러올 수 없습니다.</p>`;
    }

    // 3-6) Q&A 탭 내용 생성 (공통 데이터)
    const qaContent = document.getElementById("qa-content");
    if (qaContent) {
      qaContent.innerHTML = createQAContent();
    } else {
      qaContent.innerHTML = `<p>Q&A 정보를 불러올 수 없습니다.</p>`;
    }

    // 3-7) 반품/교환정보 탭 내용 생성 (공통 데이터)
    const returnExchangeContent = document.getElementById(
      "return-exchange-content"
    );
    if (returnExchangeContent) {
      returnExchangeContent.innerHTML = createReturnExchangeContent();
    } else {
      returnExchangeContent.innerHTML = `<p>반품/교환 정보를 불러올 수 없습니다.</p>`;
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

// 8. 탭 컨트롤(전환) 설정
function setupTabControls() {
  const tab = document.querySelector(".tab-list");

  const tabSwitch = (e) => {
    e.preventDefault();

    const li = document.querySelectorAll("li");
    const targetli = e.target.closest("li");
    if (!targetli) return;

    const targetdata = targetli.dataset.target;
    const targetContainer = $(`.${targetdata}-box`);
    const Container = document.querySelectorAll(".container");

    li.forEach((ele) => ele.classList.remove("active"));
    targetli.classList.add("active");
    Container.forEach((ele) => ele.classList.remove("on"));
    targetContainer.classList.add("on");
  };
  tab.addEventListener("click", tabSwitch);
}

// 9. 상품 정보 탭 내용 생성
function createProductInfoContent(productId) {
  // id를 통해 상품 정보 가지고 오기
  const product = window.tabContents[productId];
  if (!product) return "<p>상품 정보를 찾을 수 없습니다.</p>";

  return `
    <h3 class="content-title">${product.productName} 상세 정보</h3>
    <div class="product-specs">
      <div class="spec-item">
        <span class="spec-label">재질</span>
        <span class="spec-value">&nbsp; ${product.specs.material}</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">크기</span>
        <span class="spec-value">&nbsp; ${product.specs.size}</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">색상</span>
        <span class="spec-value">&nbsp; ${product.specs.color}</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">제조국</span>
        <span class="spec-value">&nbsp; ${product.specs.made}</span>
      </div>
    </div>
    <div class="product-description">
      <h4 class="description-title">상품 설명</h4>
      <p class="description-text"> ${product.description}</p>
    </div>
  `;
}
// 10. 리뷰 탭 내용 생성
function createReviewContent(productId) {
  const product = window.tabContents[productId];
  if (!product) return "<p>리뷰 정보를 찾을 수 없습니다.</p>";

  // 배열로 되어 있는 리뷰를 map을 통해 하나씩 가지고 오고 join을 통해 하나의 문자열로 만들기
  // rating(리뷰 점수)에 따라 꽉찬 별 출력하고 나머지는 빈 별 출력하기(5개 별 중에서)
  const reviewsHtml = product.reviews
    .map(
      (review) => `
  <div class="review-contents"> 
    <div class="review-header">
      <span class="reviewer-name">${review.name}</span>
      <span class="review-date">(${review.date})</span>
    </div>
    <div class="review-rating"> ${"★".repeat(review.rating)}${"☆".repeat(
        5 - review.rating
      )}</div>
    <p class="review-text">${review.text}</p>
  </div>
`
    )
    .join("");

  return `
    <h3 class="review-title">${product.productName} 리뷰</h3>
    <div class="review-summary">
      <div class="rating-summary">
        <div class="rating-score">${product.rating}</div>
        <div class="rating-stars">★★★★★</div>
        <div class="rating-count">(${product.reviewCount}개 리뷰)</div>
      </div>
    </div>
    <div class="review-list">
      ${reviewsHtml}
    </div>
  `;
}

// 11. Q&A 탭 내용 생성 (공통 데이터 - 모든 상품에 동일 내용 노출)
function createQAContent() {
  return `
    <h3 class="content-title">상품 Q&A</h3>
    <div class="qa-summary">
      <p class="qa-count">총 2개의 문의가 있습니다.</p>
    </div>
    
      <div class="qa-item">
        <div class="qa-question">
          <span class="question-text">배송은 얼마나 걸리나요?</span>
          <span class="qa-date">(2025.06.13)</span>
        </div>
        <div class="qa-answer">
          <strong>답변:</strong> 주문 후 1-2일 내에 배송되며, 택배사 사정에 따라 
          지연될 수 있습니다. 배송 추적은 주문내역에서 확인 가능합니다.
        </div>
      </div>
      
      <div class="qa-item">
        <div class="qa-question">
          <span class="question-text">교환/반품 가능한가요?</span>
          <span class="qa-date">(2025.06.13)</span>
        </div>
        <div class="qa-answer">
          <strong>답변:</strong> 상품 수령 후 7일 이내에 교환/반품이 가능합니다. 
          단, 상품이 손상되었거나 사용 흔적이 있는 경우는 제외됩니다.
        </div>
      </div>
    </div>
  `;
}

// 12. 반품/교환정보 탭 내용 생성 (공통 데이터 - 모든 상품에 동일 내용 노출)

function createReturnExchangeContent() {
  return `
    <h3 class="content-title">반품/교환 안내</h3>
    
    <div class="return-info">
      <h4 class="info-title">반품/교환 가능 기간</h4>
      <ul class="info-list">
        <li>• 구매자 단순 변심은 상품 수령 후 7일 이내(구매자 반품배송비 부담)</li>
        <li>• 표시/광고와 상이, 계약 내용과 다르게 이행된 경우 상품 수령 후 3개월 이내 혹은 표시/광고와 다른 사실을 안 날로부터 30일 이내/li>
      </ul>
    </div>
    
    <div class="return-conditions">
      <h4 class="info-title">반품/교환 불가 사유</h4>
      <ul class="info-list">
        <li>1. 반품요청기간이 지난 경우</li>
        <li>2. 구매자의 책임 있는 사유로 상품 등이 멸실 또는 훼손된 경우</li>
        <li>3. 구매자의 책임있는 사유로 포장이 훼손되어 상품 가치가 현저히 상실된 경우</li>
        <li>4. 구매자의 사용 또는 일부 소비에 의하여 상품의 가치가 현저히 감소한 경우</li>
        <li>5. 시간의 경과에 의하여 재판매가 곤란할 정도로 상품 등의 가치가 현저히 감소한 경우</li>
        <li>6. 고객의 요청사항에 맞춰 제작에 들어가는 맞춤제작상품의 경우</li>
        <li>7. 복제가 가능한 상품 등의 포장을 훼손한 경우</li>
      </ul>
    </div>
    
    <div class="contact-info">
      <h4 class="info-title">문의처</h4>
      <div class="contact-details">
        <p>고객센터: 1588-0000 (평일 09:00-18:00)</p>
        <p>이메일: customer@hodu.com</p>
        <p>카카오톡: @HODUSHOP고객센터</p>
      </div>
    </div>
  `;
}
