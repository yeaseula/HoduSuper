// ===== 상품 목록 페이지 전용 JavaScript =====

// 페이지 로드 시 상품 목록 초기화
document.addEventListener("DOMContentLoaded", async () => {
  await initProducts();
});

// initProduct 함수(상품 목록 초기화 함수)
async function initProducts() {
  const productData = await getProducts();
  displayProducts(productData.results); // API는 results 배열로 데이터를 보내줌
}

// 상품 목록 화면에 표시
function displayProducts(products) {
  const productsGrid = document.querySelector(".products-grid");

  // 기존 내용 초기화
  productsGrid.innerHTML = "";

  // 상품이 없는 경우 처리
  // products.length === 0 ----> 빈 배열일 경우
  if (!products || products.length === 0) {
    productsGrid.innerHTML = "<p> 등록된 상품이 없습니다. </p>";
    return;
  }

  const sortedProducts = products.sort((a, b) => a.id - b.id);
  // 각 상품 카드 생성 및 추가
  products.forEach((product) => {
    const productCard = createProductCard(product);
    productsGrid.appendChild(productCard);
  });
}

// 개별 상품 카드 생성
function createProductCard(product) {
  const article = document.createElement("article");
  article.classList.add("product-card");
  article.setAttribute("itemscope", "");
  article.setAttribute("itemtype", "https://schema.org/Product");

  // 클릭 시 상세 페이지로 이동
  article.style.cursor = "pointer";
  article.addEventListener(
    "click",
    () => (window.location.href = `product-detail.html?id=${product.id}`)
  );
  article.innerHTML = `
            <img
              src="${product.image}"
              alt="${product.name} 상품 이미지"
              onerror="handleImageError(this)"
            />
    <div class="product-card-text">
      <p>${product.seller.store_name}</p>
      <h3 itemprop="name">${product.info}</h3>
      <div itemprop="price">
        <span>${formatPrice(product.price)}</span>
        <span>원</span>
      </div>
    </div>
  `;

  return article;
}
