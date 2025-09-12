// ===== 장바구니 API 설정 =====
const API_URL = "https://api.wenivops.co.kr/services/open-market";

// API 주소 설정
const API_CONFIG = {
  API_URL: API_URL,

  ENDPOINTS: {
    PRODUCTS: "/products/",
    PRODUCT_DETAIL: "/products/{id}",
    PRODUCT_SEARCH: "/products/?search={query}", // 추후 검색 기능 작업 시 사용
  },
};

// ===== 유틸리티 함수 =====
export const formatPrice = (price) => {
  return price.toLocaleString("ko-KR");
};

// ===== 장바구니 API 호출 함수들 =====
export async function getCartItems() {
  const res = await fetch("/cart/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });
  if (!res.ok) {
    const errorText = await res.text(); // 서버에서 준 에러 메시지 추출
    throw new Error(`장바구니 불러오기 실패: ${errorText}`);
  }
  return await res.json();
}

// 장바구니 수량 수정
export async function updateCartItem(cartItemId, quantity) {
  const res = await fetch(`/cart/${cartItemId}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `장바구니 수량 변경 실패 (ID: ${cartItemId}, 수량: ${quantity}) - ${errorText}`
    );
  }
  return await res.json();
}

// 장바구니 상품 삭제
export async function deleteCartItem(cartItemId) {
  const res = await fetch(`/cart/${cartItemId}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`장바구니 삭제 실패 (ID: ${cartItemId}) - ${errorText}`);
  }
  return await res.json();
}
