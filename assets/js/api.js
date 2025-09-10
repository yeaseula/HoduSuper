// ===== 공통 API 설정 & 유틸(utils) 관리 & 404 에러 처리 =====

/*
========================================
 API & 유틸리티 함수 사용 방법
========================================

<상품 목록 가져오기>:
   getProducts().then(data => {
     console.log(data.results); // 상품 배열
   });

<상품 상세 정보 가져오기>:
   getProductDetail(123).then(data => {
     console.log(data); // 상품 상세 정보
   });

<가격 포맷팅>:
   formatPrice(29000); // "29,000" 반환
   formatPrice(product.price)  // 상품 가격 포맷팅

<URL 파라미터 추출>:
   getUrlParameter('id'); // URL의 ?id=값 반환

<이미지 에러 처리>:
   <img src="상품이미지" onerror="handleImageError(this)" />

========================================
*/

// ======= API 연동 설정 =======
// API 주소
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

// 전체 상품 목록을 API에서 가져오는 함수
const getProducts = async () => {
  try {
    // API 서버에 상품 목록 요청
    const response = await fetch(
      // "https://api.wenivops.co.kr/services/open-market/products/"
      `${API_CONFIG.API_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`
    );

    // HTTP 상태 코드 확인(200=성공, 404=페이지없음, 500=서버오류 등)
    if (!response.ok) {
      throw new Error("getProducts HTTP 에러 발생");
    }

    // JSON 형태의 응답을 JavaScript 객체로 변환
    const data = await response.json();
    // 호출한 곳으로 데이터 반환
    return data;
  } catch (error) {
    console.error("상품을 불러올 수 없습니다:", error);
    // API 에러 시에도 안전하게 처리할 수 있도록 빈 배열 반환
    return { results: [] };
  }
};

// 특정 상품의 상세 정보를 API에서 가져오는 함수
const getProductDetail = async (productId) => {
  try {
    const response = await fetch(
      // URL에서 {id} 부분을 실제 상품 ID(productId)로 변경
      // 예시) "https://api.wenivops.co.kr/services/open-market/products/123"
      `${API_CONFIG.API_URL}${API_CONFIG.ENDPOINTS.PRODUCT_DETAIL.replace(
        "{id}",
        productId
      )}`
    );

    // HTTP 상태 코드 확인(200=성공, 404=페이지없음, 500=서버오류 등)
    if (!response.ok) {
      if (response.status === 404) {
        console.log("404 - 상품을 찾을 수 없어 404 페이지로 이동합니다.");
        redirectTo404();
        return null;
      } else if (response.status === 500) {
        console.log("500 - 서버 내부 오류");
        return null;
      } else {
        throw new Error(`HTTP 에러 발생: ${response.status}`);
      }
    }

    // 데이터 파싱
    const data = await response.json();
    // 상품 상세 정보 반환
    return data;
  } catch (error) {
    console.error("상품 상세 정보를 불러올 수 없습니다.:", error);

    // 에러 시 null 반환(상세 정보는 단일 객체라 results 배열 없어도 됨)
    return null;
  }
};

//======= 유틸리티 함수들(utils) - 자주 사용하는 기능 묶음 =======

// 1. 가격마다 콤마 ',' 넣기(29000 => 29,000)
const formatPrice = (price) => {
  return price.toLocaleString("ko-KR"); // 한국 스타일로 포멧팅(나라마다 약간 다름)
};

// 2. URL에서 파라미터 값 가져오기 (product-detail.html?id=123 에서 123 가져오기)
const getUrlParameter = (name) => {
  //// window.location = 현재 페이지의 URL 정보, .search = URL에서 ? 뒤의 부분만 가져옴
  // URLSearchParams = 특정 파라미터의 값을 가져오는 메서드
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
};

// 3. 이미지가 깨졌을 때 기본 이미지로 바꿔주기
const handleImageError = (imgElement) => {
  imgElement.src = "./assets/images/logo-l.png";
  imgElement.alt = "기본 호두 로고";
};

//======= 404 에러 처리 함수 =======

// 404 페이지로 이동하는 함수
const redirectTo404 = () => {
  window.location.href = "../pages/404-page.html";
};
