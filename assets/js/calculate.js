// ===== 수량 입력 컨포넌트 =====
export function createQuantityInput(initial = 1) {
  // 수량 조절 컨테이너 생성
  const container = document.createElement("div");
  container.classList.add("quantity-container");

  // 수량 감소 버튼
  const decreaseBtn = document.createElement("button");
  decreaseBtn.classList.add("quantity-btn", "decrease");
  decreaseBtn.setAttribute("type", "button");
  decreaseBtn.innerHTML = `<img src="../images/icon-minus-line.svg" alt="" aria-hidden="true">`;

  // 수량 입력 필드 (1-99 범위 제한)
  const input = document.createElement("input");
  input.type = "number";
  input.value = initial;
  input.min = 1;
  input.max = 99;
  input.classList.add("quantity-input");

  // 수량 증가 버튼
  const increaseBtn = document.createElement("button");
  increaseBtn.classList.add("quantity-btn", "increase");
  increaseBtn.setAttribute("type", "button");
  increaseBtn.innerHTML = `<img src="../images/icon-plus-line.svg" alt="" aria-hidden="true">`;

  // 감소 버튼 이벤트: 최소값 1까지만 감소
  decreaseBtn.addEventListener("click", () => {
    input.value = Math.max(parseInt(input.value) - 1, 1);
  });

  // 증가 버튼 이벤트: 최대값 99까지만 증가
  increaseBtn.addEventListener("click", () => {
    input.value = Math.min(parseInt(input.value) + 1, 99);
  });

  // DOM 요소 조립
  container.appendChild(decreaseBtn);
  container.appendChild(input);
  container.appendChild(increaseBtn);

  return container;
}

// ===== 알림 대화상자 설정 =====
export const alerts = {
  // error
  error: {
    title: "알림",
    message: "서버를 불러올 수 없습니다. <br> 새로고침 버튼을 눌러주세요.",
    buttons: [{ text: "확인", className: "btn-confirm" }],
  },

  // 로그인 필요
  login: {
    title: "알림",
    message: "로그인이 필요한 서비스입니다. <br> 로그인 하시겠습니까?",
    buttons: [
      { text: "아니오", className: "btn-cancel" },
      { text: "예", className: "btn-confirm" },
    ],
  },

  // 상품 삭제
  delete: {
    title: "알림",
    message: "상품을 삭제하시겠습니까?",
    buttons: [
      { text: "취소", className: "btn-cancel" },
      { text: "확인", className: "btn-confirm" },
    ],
  },

  // 장바구니 중복
  cart: {
    title: "알림",
    message:
      "이미 장바구니에 있는 상품입니다. <br> 장바구니로 이동하시겠습니까?",
    buttons: [
      { text: "아니오", className: "btn-cancel" },
      { text: "예", className: "btn-confirm" },
    ],
  },

  // 재고 부족
  stock: {
    title: "알림",
    message: "재고 수량이 초과되었습니다.",
    buttons: [{ text: "확인", className: "btn-confirm" }],
  },

  // 주문 선택 목록 없음
  empty: {
    title: "알림",
    message:
      "선택된 상품이 없습니다. <br> 상품을 선택 후 주문하기 버튼을 눌러주시겠습니까?",
    buttons: [{ text: "확인", className: "btn-confirm" }],
  },

  // 수량 조정
  quantity: {
    title: "수량 조정",
    message: "",
    customContent: createQuantityInput(1),
    buttons: [
      { text: "취소", className: "btn-cancel" },
      {
        text: "수정",
        className: "btn-confirm",
        onClick: (container) => {
          const input = container.querySelector(".quantity-input");
          console.log("선택한 수량:", input.value);
        },
      },
    ],
  },
};
