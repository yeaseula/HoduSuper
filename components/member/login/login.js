import MiniAlert from '../../../components/MiniAlert.js'

const $ = (node) => document.querySelector(node); // 작성 편의 및 가독성 위해 유틸함수 생성
const tab = $('.tab-list');
const targetInput = $('input[name="user-type-field"]');

$('.login-btn').setAttribute('disabled',true)


const loginState = {
    userType: targetInput.value || 'buyer',
    isIdChecked: false,
    isPassChecked: false,
};

const tabSwitch = (e)=>{
    e.preventDefault();
    const li = document.querySelectorAll('li');
    const targetli = e.target.closest('li');
    if(!targetli) return;
    const targetdata = targetli.dataset.target;
    const targetContainer = $(`.${targetdata}-box`);
    const Container = document.querySelectorAll('.container');

    li.forEach((ele) => ele.classList.remove('active'));
    targetli.classList.add('active');
    Container.forEach((ele) => ele.classList.remove('on'));
    targetContainer.classList.add('on');

    document.querySelectorAll('input').forEach((input) => (input.value = ''));
    $('.warning-text')?.remove();

    targetInput.value = targetdata;
    loginState.userType = targetdata;
    loginState.isIdChecked = false;
    loginState.isPassChecked = false;

    getFormFieldsArray(targetdata);
    updateJoinBtnState();
    isDone(targetdata);

}

tab.addEventListener('click', tabSwitch);

//모든 요소를 돌며 해당 클래스를 삭제
function removeClasses(selectors, classes) {
    document.querySelectorAll(selectors).forEach(el => {
        el.classList.remove(...classes);
    });
}
// 모든 필드의 값을 가져오는 함수
function getFormFields(userType) {
    const box = $(`.${userType}-box`);
    return {
        form: box.querySelector('form'),
        id: $(`input[name="${userType}-login-id"]`),
        password: $(`input[name="${userType}-login-password"]`),
        idValueChk: box.querySelector('.id-value-check')
    };
}
// 필드 입력 순서
function getFormFieldsArray(userType) {
    const defaultKey = ['id','password'];
    const key = defaultKey;
    const allArray = key.map((ele)=>($(`input[name="${userType}-login-${ele}"]`)))
    allArray.forEach((field,idx)=>{
        //console.log(field) //console 찍어보기
        field.addEventListener("focus",(e)=>{
            allArray.forEach((ele)=>{warningClear()});
            const index = allArray.indexOf(e.target);
            for(let i=0; i<index; i++) {
                if(allArray[i].value.trim() === '') {
                    const parantDiv = allArray[i].closest('div');
                    const target = parantDiv.querySelector('.empty-warning');
                    if(!target) {
                        const message = '아이디를 입력해주세요.'
                        warningMessage(parantDiv,message)
                    }
                } else {
                    $('.empty-warning')?.remove()
                }
            }
        })
        field.addEventListener('input',()=>{
            const parantDiv = field.closest('div');
            const target = parantDiv.querySelector('.empty-warning');
            if(target) {
                target.remove();
            }
        })
    })
}
// 경고메시지
function warningMessage(parantDiv,message){
    const p = document.createElement('p')
    p.classList.add('warning-text','empty-warning');
    p.textContent=message;
    parantDiv.append(p)
}
function warningClear(){
    const target = document.querySelectorAll('.empty-warning')
    target.forEach((ele)=>{
        ele.remove()
    })
}
getFormFieldsArray(loginState.userType);
// 로그인 버튼 활성화 함수
function updateJoinBtnState() {
    const { isIdChecked, isPassChecked } = loginState;
    const canJoin = isIdChecked && isPassChecked;
    $('.login-btn').disabled = !canJoin;
}
// 필드값이 채워졌는지 확인
function isDone(userType) {
    const field = getFormFields(userType);
    field.id.addEventListener('input',(e)=>{
        $(`.${userType}-box`).querySelector('.warning-text')?.remove();
    })
    field.id.addEventListener('blur',(e)=>{
        const isFill = e.currentTarget.value.trim() !== '';
        loginState.isIdChecked = isFill
        updateJoinBtnState();
        if(field.password.value.trim() == '') {
            const parantDiv = field.password.closest('div');
            const message = '비밀번호를 입력해주세요.'
            warningMessage(parantDiv,message)
        }
    })
    field.password.addEventListener('input',(e)=>{
        const isFill = e.currentTarget.value.trim() !== '';
        loginState.isPassChecked = isFill;
        updateJoinBtnState();
        e.currentTarget.closest('div').querySelector('.warning-text')?.remove();
        $(`.${userType}-box`).querySelector('.warning-text')?.remove();
    })
}
isDone(loginState.userType);
//로그인요청
async function loginAccess(fields) {
    const userType = loginState.userType;
    const username = fields.id.value;
    const password = fields.password.value;

    try{
        const res = await fetch("https://api.wenivops.co.kr/services/open-market/accounts/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        if(res.ok) {
            const data = await res.json();

            localStorage.setItem("access", data.access);
            localStorage.setItem("refresh", data.refresh);
            localStorage.setItem("user", JSON.stringify(data.user));
            const alert = new MiniAlert({
                title:'title',
                message:'로그인이 완료되었습니다!<br> 메인페이지로 이동합니다.',
                buttons : [],
                link:['예'],
                linkHref:['https://yeaseula.github.io/HoduSuper/'],
                closeBackdrop : true,
                customContent : null,
            })
            console.log("로그인성공",data.user);

            fetchWithAuth();
        } else {
            const errorData = await res.json();
            console.log(errorData.error)
            const p = document.createElement('p');
            p.classList.add('warning-text')
            p.textContent = errorData.error;

            const parantDiv = $(`.${userType}-box`)
            parantDiv.append(p)
        }
    } catch(err) {
        console.log(err);
    }
}

async function fetchWithAuth(url, options = {}) {
    let accessToken = localStorage.getItem("access");
    const refreshToken = localStorage.getItem("refresh");

    if (!accessToken || !refreshToken) {
        alert("로그인이 필요합니다.");
        return;
    }

    // 요청 시 Authorization 헤더 추가
    options.headers = {
        ...options.headers,
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
    };

    let res = await fetch(url, options);

    // access 토큰 만료 시 refresh로 재발급
    if (res.status === 401) {
            const refreshRes = await fetch("https://api.wenivops.co.kr/services/open-market/accounts/token/refresh/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken })
        });

        if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            localStorage.setItem("access", refreshData.access); // 새로운 access 저장
            accessToken = refreshData.access;
        // 원래 요청 재시도
            options.headers.Authorization = `Bearer ${accessToken}`;
            res = await fetch(url, options);
        } else {
            alert("세션이 만료되었습니다. 다시 로그인해주세요.");
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            return;
        }
    }

    return res.json();
}

$('.login-btn').addEventListener('click',(e)=>{
    e.preventDefault();
    const userType = loginState.userType;
    const fields = getFormFields(userType);
    loginAccess(fields)
})