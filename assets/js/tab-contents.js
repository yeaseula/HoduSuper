const tabContents = {
  1: {
    productName: "개발자 노트북 파우치",
    specs: {
      material: "기타",
      size: "30cm x 25.5cm(13인치)",
      color: "검정",
      made: "국산",
    },
    description:
      "노트북 파우치 바꿨더니 누가봐도 개발자! 개발자 삶에 활력을 불어넣어 줄 메세지가 담긴 노트북 파우치!",
    reviews: [
      {
        name: "라이캣",
        rating: 4,
        date: "2025.06.17",
        text: "120만원이어도 사세요! 매우 이쁨",
      },
      {
        name: "소울곰",
        rating: 5,
        date: "2025.06.09",
        text: "외관 및 내부 마감 모두 좋습니다.",
      },
      {
        name: "검정토끼",
        rating: 5,
        date: "2025.06.02",
        text: "디자인이 너무나 마음에 드네요 ㅋㅋ",
      },
    ],
    rating: 4.9,
    reviewCount: 16,
  },
  2: {
    productName: "개발자 금속 키링(커피)",
    specs: {
      material: "기타",
      size: "5mm~20mm",
      color: "실버",
      made: "국산",
    },
    description:
      "누가 봐도 '개발자다!' 싶은 귀여운 키링! <네, 개발잡니다> 키링은 이름처럼 '네, 저는 개발자입니다.'하고 개발자 느낌을 주기 위해 개발자 하면 떠오르는 항목들로 구성하였습니다.",
    reviews: [
      {
        name: "개리",
        rating: 4,
        date: "2025.03.10",
        text: "선물용으로 구매했어요! 귀여워요",
      },
      {
        name: "라면소녀",
        rating: 5,
        date: "2025.03.08",
        text: "필통에 달았는데 예뻐요 :)",
      },
      {
        name: "페낭FE천재",
        rating: 5,
        date: "2025.03.07",
        text: "정말 마음에 듭니다! 예쁘고 귀엽고 다해요",
      },
    ],
    rating: 4.8,
    reviewCount: 77,
  },
  3: {
    productName: "딥러닝 무릎 담요",
    specs: {
      material: "폴리에스테르, 극세사",
      size: "110cm x 69cm",
      color: "블루, 네이비",
      made: "국산",
    },
    description:
      "날씨가 추워 코드를 치는데 얼어 죽을 것 같은 개발자들을 위한 특별한 담요입니다. 담요 가장자리에 조개스티치를 주어 따뜻함과 귀여움 UP UP!",
    reviews: [
      {
        name: "김개발자",
        rating: 5,
        date: "2025.07.15",
        text: "정말 좋아요! 코딩할 때 무릎이 따뜻해서 좋아요!",
      },
      {
        name: "박위니브",
        rating: 5,
        date: "2025.07.10",
        text: "개발자 필수템이라고 하신 게 맞네요! 너무 예뻐요",
      },
      {
        name: "모두연",
        rating: 4,
        date: "2025.07.08",
        text: "품질이 좋습니다! 가격이 18만원이라 좀 비싸요 ㅠㅠ",
      },
    ],
    rating: 4.8,
    reviewCount: 127,
  },
  4: {
    productName: "개발자 스티커 팩",
    specs: {
      material: "기타",
      size: "95mm~105mm",
      color: "-",
      made: "국산",
    },
    description:
      "개발자스러움이 한껏 느껴지는 스티커! 무려 25종의 스티커가 들어있는 우당탕탕 라이캣의 실험실 스티커 팩!",
    reviews: [
      {
        name: "모두연",
        rating: 4,
        date: "2025.05.12",
        text: "퀄리티가 상당해요!",
      },
      {
        name: "박위닙",
        rating: 5,
        date: "2025.05.09",
        text: "디자인 이뻐요, 매우 이쁨",
      },
      {
        name: "10분코딩",
        rating: 5,
        date: "2025.05.07",
        text: "너무 귀엽습니다. 위니브 스티커 짱짱맨",
      },
    ],
    rating: 4.9,
    reviewCount: 33,
  },
  5: {
    productName: "개발자 금속 키링(버그를 Java라)",
    specs: {
      material: "기타",
      size: "20mm~30mm",
      color: "실버",
      made: "국산",
    },
    description:
      "에러와 버그로부터 우리를 지켜줄 부적이 되어줄 거예요! 라이캣의 발명품으로 버그 잡기에 성공한 개발자 개리씨의 모습!",
    reviews: [
      {
        name: "명슬팀장",
        rating: 5,
        date: "2025.01.12",
        text: "키링이 정말 예쁘고 품질도 좋아요!...",
      },
      {
        name: "상민대장",
        rating: 5,
        date: "2025.01.09",
        text: "버그를 Java라... 정말 재미있는 문구네요!...",
      },
      {
        name: "친절한채현씨",
        rating: 5,
        date: "2025.01.07",
        text: "금속 질감이 좋고 무게감도 적당해요...",
      },
    ],
    rating: 4.9,
    reviewCount: 89,
  },
};
// 다른 파일에서 접근 할 수 있게 전역 변수로 만들기
window.tabContents = tabContents;
