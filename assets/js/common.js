//common.js
//모든 html 파일 상단에 common.js를 defer로 로드합니다

document.addEventListener('DOMContentLoaded', function () {
    const $ = (node) => document.querySelector(node);

    fetch('/footer.html') // 🪴경로 알맞게 수정
        .then(response => response.text())
        .then(data => {
            document.querySelector('.footer').innerHTML = data;
            // 🪴선택자 알맞게 수정

            // 🪴toggle 관련 기능
            // 왜 여기에 붙이냐면 비동기로 footer.html을 불러오고 있기때문에
            // 바깥에서 해당 기능 호출하면 아직 DOM이 로드되지 않아 오류 발생합니다
            // 푸터 반응형 메뉴 토글 기능 - 작은 화면에서 메뉴 접기/펼치기
            const toggleBtn = document.querySelector(".footer-menu-toggle");
            const footerMenu = document.querySelector(".footer-menu");

            if (toggleBtn && footerMenu) {
                // 토글 버튼 클릭 이벤트
                toggleBtn.addEventListener("click", () => {
                // 현재 메뉴 상태 확인
                const expanded = toggleBtn.getAttribute("aria-expanded") === "true";

                // 접근성 속성 업데이트
                toggleBtn.setAttribute("aria-expanded", !expanded);
                footerMenu.hidden = expanded;
                });
            }
            //여기까지는 제가 사용하던 코드인데
            //지우고 다른 코드 넣어도 됩니다
        })
        .catch(error => {
            console.error('파일 로딩 오류:', error);
        })
})