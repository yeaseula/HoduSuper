//common.js
//모든 html 파일 상단에 common.js를 defer로 로드합니다
import MiniAlert from '../../components/MiniAlert.js';

document.addEventListener('DOMContentLoaded', function () {
    const $ = (node) => document.querySelector(node);
   fetch('./header.html') // 🪴경로 알맞게 수정
        .then(response => response.text())
        .then(data => {
            document.querySelector('.header').innerHTML = data;
            // ===== 검색 창 =====
            // ===== 변수 선언 =====
            const searchForm = document.querySelector(".header-search");
            const search = document.querySelector("#search");
            const searchBtn = document.querySelector(".header-search-btn");
            const searchOverlay = document.querySelector(".search-overlay");
            const searchContainer = document.querySelector(
                ".mobile-search-container"
            );
            const mobileSearchForm = document.querySelector(".mobile-search-form");
            const mobileSearch = document.querySelector(".mobile-search-input");
            const mobileTrigger = document.querySelector(".mobile-search-trigger");
            const closeBtn = document.querySelector(".mobile-search-close");

            // ===== 모바일 검색 열기 =====
            function openMobileSearch() {
                searchOverlay.classList.add("active");
                searchContainer.classList.add("active");
                document.body.style.overflow = "hidden";
                // 스크롤 방지
                setTimeout(() => mobileSearch.focus(), 300);
            }

            // ===== 모바일 검색 닫기 =====
            function closeMobileSearch() {
                searchOverlay.classList.remove("active");
                searchContainer.classList.remove("active");
                document.body.style.overflow = "";
            }
            // ===== ESC 키 닫기 =====
            function handleKeydown(e) {
                if (e.key === "Escape") closeMobileSearch();
            }
            // ===== 모바일 검색 제출 =====
            function handleMobileSearch(e) {
                e.preventDefault();

                const keyword = mobileSearch.value.trim();
                if (!keyword) {
                alert("상품의 이름을 입력해주세요!");
                return;
                }
                window.location.href = `product-detail.html?q=${encodeURIComponent(
                keyword
                )}`;
                closeMobileSearch();
            }

            // ===== 데스크톱 검색 =====
            function handleSearch(e) {
                e.preventDefault();
                const keyword = search.value.trim();
                if (!keyword) {
                    alert("상품의 이름을 입력해주세요!");
                    return;
                }
                    window.location.href = `product-detail.html?q=${encodeURIComponent(keyword
                )}`;
            }

            // ===== 이벤트 등록 =====
            searchForm.addEventListener("submit", handleSearch);
            mobileTrigger.addEventListener("click", openMobileSearch);
            closeBtn.addEventListener("click", closeMobileSearch);
            document.addEventListener("keydown", handleKeydown);
            searchOverlay.addEventListener("click", closeMobileSearch);
            mobileSearchForm.addEventListener("submit", handleMobileSearch);
        })
        .then(()=>{
            // ===== 유저 메뉴 =====
            // ===== 변수 선언 =====
            const loginBtn = document.querySelector(".header-login");
            const mypageBtn = document.querySelector(".header-mypage");
            const cartBtn = document.querySelector(".header-buyer-cart");
            const sellerCenterBtn = document.querySelector(".header-seller-center");
            // ==== login user 정보 확인 ====
            const user = JSON.parse(localStorage.getItem("user"));

            function createMenu(user) {
                const menulist = {
                    cart: { element: 'button', className: 'user-cart', descript: '장바구니' },
                    cartLogin: { element: 'a', className: 'user-cart', descript: '장바구니', link:'/pages/cart.html' },
                    login: { element: 'a', className: 'user-login', descript: '로그인', link:'/pages/login.html' },
                    mypage: { element: 'button', className: 'user-mypage', descript: '마이페이지', link:'#' },
                    sellerCenter: { element: 'button', className: 'seller-center', descript: '판매자 센터', link:'#' },
                }

                const { cart,cartLogin,login,mypage,sellerCenter } = menulist;

                const noUser = [cart,login]
                const buyer = [cartLogin,mypage]
                const seller = [mypage,sellerCenter]
                const ul = document.querySelector('.header-user-list');

                const userState = {}

                if(!user) {
                    userState.state = noUser
                } else if (user.user_type == "BUYER") {
                    userState.state = buyer
                } else if (user.user_type == "SELLER") {
                    userState.state = seller
                }

                userState.state.forEach((ele)=>{
                    const li = document.createElement('li')
                    const container = document.createElement(ele.element);
                    container.classList.add(ele.className);
                    container.innerHTML = `
                        <img src="../assets/images/${ele.className}-icon.svg">
                        <span>${ele.descript}</span>
                    `

                    li.append(container);
                    ul.append(li);

                    if(!user || user.user_type == 'BUYER') {
                        li.addEventListener('mouseenter',(e)=>{HoverEffect(e,ele)})
                        li.addEventListener('mouseleave',(e)=>{HoverEffectEnd(e,ele)})
                    }

                    if(!user) {
                        if(ele.className == 'user-cart') {
                            li.addEventListener('click',()=>{ModalOpen()})
                        }
                        if(ele.className == 'user-login') {
                            container.setAttribute('href',ele.link)
                        }
                    } else if(user.user_type == 'BUYER') {
                        if(ele.className == 'user-cart') {
                            container.setAttribute('href',ele.link)
                        }
                    }
                })

                function HoverEffect(e,ele) {
                    const target = $(`.${ele.className}`).querySelector('img')
                    target.setAttribute('src',`../assets/images/${ele.className}-color-icon.svg`)
                    const span = $(`.${ele.className}`).closest('li').querySelector('span');
                    span.style.color=`#21bf48`
                }
                function HoverEffectEnd(e,ele) {
                    const target = $(`.${ele.className}`).querySelector('img')
                    target.setAttribute('src',`../assets/images/${ele.className}-icon.svg`)
                    const span = $(`.${ele.className}`).closest('li').querySelector('span');
                    span.style.color=`rgba(118, 118, 118, 1)`
                }
                function ModalOpen() {
                    const alert = new MiniAlert({
                        title:'장바구니 이동 알림 모달',
                        message:'로그인이 필요합니다.<br> 로그인 하러 갈까요?',
                        buttons : [],
                        link:['예'],
                        linkHref:['pages/login.html'],
                        closeBackdrop : true,
                        customContent : null,
                    })
                }
            }
            createMenu(user)
        })
        .catch(error => {
            console.error('파일 로딩 오류:', error);
        })
    fetch('./footer.html') // 🪴경로 알맞게 수정
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