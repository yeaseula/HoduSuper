/* 얼럿 컴포넌트 */

export default class MiniAlert {
  constructor({
    title,
    message,
    buttons = [],
    link = [],
    linkHerf = [],
    closeBackdrop = true,
    customContent,
  }) {
    // 백드롭 클릭으로 모달 닫기 여부 설정
    this.closeBackdrop = closeBackdrop;

    // 배경 어둡게 처리하는 백드롭 생성
    this.backdrop = document.createElement("div");
    this.backdrop.classList.add("alert-backdrop");

    // 모달 창 생성
    const modal = document.createElement("div");
    modal.classList.add("alert");

    // 모달 내부 구조 설정
    modal.innerHTML = `
      <div class="alert-content">
        <button class="close-btn"></button>
        <h2 class="alert-title sr-only">${title}</h2>
        <p class="alert-message">${message}</p>
        <div class="custom-content"></div>
        <div class="alert-actions"></div>
      </div>
    `;

    // DOM 요소들 참조 저장
    const actionsContainer = modal.querySelector(".alert-actions");
    const customContainer = modal.querySelector(".custom-content");
    const closeBtn = modal.querySelector(".close-btn");
    const messageElement = modal.querySelector(".alert-message");

    // 커스텀 콘텐츠가 있으면 기본 메시지 숨기고 커스텀 콘텐츠 표시
    if (customContent) {
      customContainer.appendChild(customContent);
      messageElement.style.display = "none";
    } else {
      // 커스텀 콘텐츠가 없으면 컨테이너 제거
      customContainer.remove();
    }

    // 버튼들 동적 생성 및 이벤트 바인딩
    if(buttons.length !== 0) {
      buttons.forEach((btnInfo) => {
        const btn = document.createElement("button");
        btn.textContent = btnInfo;
        btn.classList.add("common-btn", btnInfo.className || "alert-btn");

        btn.addEventListener("click", () => {
          // 버튼별 개별 콜백 함수 실행
          if (btnInfo.onClick) btnInfo.onClick(customContainer);

          // 버튼 클릭 시 모달 닫기
          this.close();
        });
        actionsContainer.append(btn);
      });
    }
    if(link.length !== 0) {
      link.forEach((linkInfo,idx) => {
        const btn = document.createElement("a");
        const href = linkHerf.map((ele)=>(ele));
        btn.textContent = linkInfo;
        btn.classList.add("common-btn", linkInfo.className || "alert-btn");
        btn.setAttribute('href',href[idx])
        btn.addEventListener("click", () => {
          // 버튼별 개별 콜백 함수 실행
          if (linkInfo.onClick) linkInfo.onClick(customContainer);

          // 버튼 클릭 시 모달 닫기
          this.close();
        });
        actionsContainer.append(btn);
      });
    }

    // X 버튼 클릭 이벤트
    closeBtn.addEventListener("click", () => this.close());

    // DOM에 모달 추가
    this.backdrop.append(modal);
    document.body.append(this.backdrop);

    // 백드롭 클릭 시 모달 닫기 (옵션에 따라)
    this.backdrop.addEventListener("click", () => {
      if (this.closeBackdrop) {
        this.close();
      }
    });

    // 모달 내부 클릭 시 이벤트 버블링 방지
    modal.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  /**
   * 모달 닫기 - DOM에서 백드롭 제거
   */
  close() {
    this.backdrop.remove();
  }
}

/**
 * 수량 선택 입력 컴포넌트 생성
 * @param {number} initial - 초기 수량 값 (기본값: 1)
 * @returns {HTMLElement} 수량 조절 컨테이너 요소
 */
function createQuantityInput(initial = 1) {
  // 수량 조절 컨테이너 생성
  const container = document.createElement("div");
  container.classList.add("quantity-container");

  // 수량 감소 버튼
  const decreaseBtn = document.createElement("button");
  decreaseBtn.classList.add("quantity-btn", "decrease");
  decreaseBtn.setAttribute("type", "button");
  decreaseBtn.innerHTML = `<img src="../assets/images/icon-minus-line.svg" alt="" aria-hidden="true">`;

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
  increaseBtn.innerHTML = `<img src="../assets/images/icon-plus-line.svg" alt="" aria-hidden="true">`;

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

/* 알림 모듈화 */
export const alerts = {
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
    message: "이미 장바구니에 있는 상품입니다. <br> 장바구니로 이동하시겠습니까?",
    buttons: [
      { text: "아니오", className: "btn-cancel" },
      { text: "예", className: "btn-confirm" },
    ],
  },

  // 재고 부족
  stock: {
    title: "알림",
    message: "재고 수량이 초과되었습니다.",
    buttons: [
      { text: "확인", className: "btn-confirm" },
    ],
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


