// =====================================================
// 장바구니 API 클라이언트 모듈
// =====================================================

// ===== API 설정 섹션 =====
// 서버 API의 기본 URL 설정
const API_URL = "https://api.wenivops.co.kr/services/open-market";

// API 엔드포인트 구성 객체 (확장성과 유지보수성을 위한 구조화)
const API_CONFIG = {
  API_URL: API_URL,

  // REST API 엔드포인트 정의
  ENDPOINTS: {
    CART: "/cart/", // 장바구니 목록 조회/추가
    CART_ITEM: "/cart/{id}/", // 특정 장바구니 아이템 조작 (수량변경/삭제)
    PRODUCT_SEARCH: "/products/?search={query}", // 상품 검색 (향후 확장 예정)
  },
};

// ===== 유틸리티 함수 =====
// 가격 포맷팅 함수: 예: 1000 → "1,000"
// UI에서 가격 표시 시 사용
export const formatPrice = (price) => {
  return price.toLocaleString("ko-KR");
};

// ===== 장바구니 API 호출 함수 =====
// 서버와의 모든 장바구니 관련 HTTP 통신을 담당
// 모든 함수는 JWT 토큰 기반 인증을 사용하며, 에러 처리를 포함

/**
 * 장바구니 목록 조회 API
 * 현재 로그인한 사용자의 모든 장바구니 아이템을 서버에서 가져옴
 * 메서드: GET
 * JWT Bearer 토큰 인증 필요
 * 반환값: { results: CartItem[], count: number, ... } 형태의 페이징된 응답
 * 에러 처리: 네트워크/인증 오류 시 상세 메시지와 함께 에러 throw
 */
export async function getCartItems() {
  const res = await fetch(`${API_URL}/cart/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access")}`, // 로컬스토리지에서 JWT 토큰 가져오기
    },
  });

  // HTTP 응답 상태 확인 및 에러 처리
  if (!res.ok) {
    const errorText = await res.text(); // 서버에서 제공하는 구체적인 에러 메시지 추출
    throw new Error(`장바구니 불러오기 실패: ${errorText}`);
  }

  return await res.json();
}

/**
 * 장바구니 아이템 수량 업데이트 API
 * 특정 장바구니 아이템의 수량을 변경 (증가/감소)
 * 메서드: PUT
 * 매개변수:
 *   - cartItemId: 장바구니 아이템의 고유 ID (서버에서 생성된 ID)
 *   - quantity: 변경할 새로운 수량 (양의 정수)
 * JWT Bearer 토큰 인증 필요
 * 반환값: 업데이트된 장바구니 아이템 객체
 * 사용 시점: 사용자가 +/- 버튼을 클릭하거나 수량 입력 시
 */
export async function updateCartItem(cartItemId, quantity) {
  const res = await fetch(`${API_CONFIG.API_URL}/cart/${cartItemId}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access")}`,
    },
    body: JSON.stringify({ quantity }), // 수량 정보만 JSON으로 전송
  });

  // HTTP 응답 상태 확인 및 구체적인 에러 메시지 생성
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `장바구니 수량 변경 실패 (ID: ${cartItemId}, 수량: ${quantity}) - ${errorText}`
    );
  }

  return await res.json();
}

/**
 * 장바구니 아이템 삭제 API
 * 특정 장바구니 아이템을 서버에서 완전히 제거
 * 메서드: DELETE
 * 매개변수:
 *   - cartItemId: 삭제할 장바구니 아이템의 고유 ID
 * JWT Bearer 토큰 인증 필요
 * 반환값: 삭제 확인 응답 (보통 빈 응답 또는 성공 메시지)
 * 사용 시점: 사용자가 X(닫기) 버튼을 클릭하여 상품을 장바구니에서 제거할 때
 */
export async function deleteCartItem(cartItemId) {
  const res = await fetch(`${API_CONFIG.API_URL}/cart/${cartItemId}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access")}`, // DELETE는 Content-Type 불필요
    },
  });

  // HTTP 응답 상태 확인 및 에러 처리
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`장바구니 삭제 실패 (ID: ${cartItemId}) - ${errorText}`);
  }

  return await res.json();
}

/**
 * 장바구니에 새 상품 추가 API
 * 새로운 상품을 사용자의 장바구니에 추가 (기존 동일 상품 있으면 수량 증가)
 * 메서드: POST
 * 매개변수:
 *   - productId: 추가할 상품의 ID (상품 상세에서 가져옴)
 *   - quantity: 추가할 수량 (기본값 1)
 * JWT Bearer 토큰 인증 필요
 * 반환값: 생성된 장바구니 아이템 객체 (서버에서 생성된 cart_item_id 포함)
 * 사용 시점: 상품 상세 페이지에서 "장바구니 담기" 버튼 클릭 시
 * 주의사항: 동일 상품이 이미 장바구니에 있으면 수량이 합산됨
 */
export async function addCartItem(productId, quantity = 1) {
  const res = await fetch(`${API_URL}/cart/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access")}`,
    },
    body: JSON.stringify({ product_id: productId, quantity }), // 서버 API 스키마에 맞춘 필드명
  });

  // HTTP 응답 상태 확인 및 에러 처리
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `장바구니 추가 실패 (상품 ID: ${productId}) - ${errorText}`
    );
  }

  return await res.json();
}
