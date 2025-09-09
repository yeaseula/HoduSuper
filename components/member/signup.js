
import { Members } from './Member.js';
import { isRequired, isValidPass, isValidId, validateUsername, ispassid } from './validation.js';

const $ = (node) => document.querySelector(node); // 작성 편의 및 가독성 위해 유틸함수 생성

const tab = $('.tab-list')
const targetInput = $('input[name="user-type-field"]')
let targetVal = targetInput.value
let userType = targetVal == 'buyer' ? 'buyer' : 'seller';

tab.addEventListener('click', (e) => {
    e.preventDefault();
    const li = document.querySelectorAll('li');
    const targetli = e.target.closest('li');
    const targetdata = targetli.dataset.target;
    const targetContainer = $(`.${targetdata}-box`);
    const Container = document.querySelectorAll('.container');

    li.forEach((ele) => ele.classList.remove('active'));
    targetli.classList.add('active');
    Container.forEach((ele) => ele.classList.remove('on'));
    targetContainer.classList.add('on');

    // 상태 및 입력값 초기화
    targetInput.value = targetdata;
    joinState.userType = targetdata;
    joinState.isIdChecked = false;
    joinState.isPassMatch = false;
    joinState.isAllField = false;
    joinState.isAgree = false;
    joinState.isSellerNumber = false;

    // 모든 input/select 초기화
    document.querySelectorAll('input').forEach((input) => (input.value = ''));
    document.querySelectorAll('select').forEach((select) => (select.value = '010'));
    $('.id-warning')?.remove();
    removeClasses('.ischecked', ['ischecked']);

    // 이벤트 재바인딩 및 유효성 검사
    validationAll(targetdata);
    bindJoinBtnActiveEvents(targetdata);
    isJoinBtnActive();
    phoneNumberJoin();
});

const buyer = new Members({
    classname: 'buyer',
    id:{
        istrue:true, //필드 사용 여부
        requeire:true, //필수or선택
        containerClass:'buyer-id-container',
        tag:'아이디',
        fieldType:'text',
        fieldName:'buyer-user-id',
        maxlength:10
    },
    pass:{
        istrue:true,
        requeire:true,
        containerClass:'buyer-pass-container',
        tag:'비밀번호',
        fieldType:'password',
        fieldName:'buyer-user-pass',
        maxlength:13
    },
    pass2:{
        istrue:true,
        requeire:true,
        containerClass:'buyer-pass2-container',
        tag:'비밀번호 재확인',
        fieldType:'password',
        fieldName:'buyer-user-pass2',
        maxlength:13
    },
    name:{
        istrue:true,
        requeire:true,
        containerClass:'buyer-userName-container',
        tag:'이름',
        fieldType:'text',
        fieldName:'buyer-user-name',
        maxlength:null
    },
    phone:{
        istrue:true,
        requeire:true,
        containerClass:'buyer-phone-container',
        tag:'휴대폰 번호',
        fieldType:'number',
        fieldName:'buyer-user-phone',
        maxlength:4
    }
})

const seller = new Members({
    classname: 'seller',
    id:{
        istrue:true, //필드 사용 여부
        requeire:true, //필수or선택
        containerClass:'seller-id-container',
        tag:'아이디',
        fieldType:'text',
        fieldName:'seller-user-id',
        maxlength:10
    },
    pass:{
        istrue:true,
        requeire:true,
        containerClass:'seller-pass-container',
        tag:'비밀번호',
        fieldType:'password',
        fieldName:'seller-user-pass',
        maxlength:13
    },
    pass2:{
        istrue:true,
        requeire:true,
        containerClass:'seller-pass2-container',
        tag:'비밀번호 재확인',
        fieldType:'password',
        fieldName:'seller-user-pass2',
        maxlength:13
    },
    name:{
        istrue:true,
        requeire:true,
        containerClass:'seller-userName-container',
        tag:'이름',
        fieldType:'text',
        fieldName:'seller-user-name',
        maxlength:null
    },
    phone:{
        istrue:true,
        requeire:true,
        containerClass:'seller-phone-container',
        tag:'휴대폰 번호',
        fieldType:'number',
        fieldName:'seller-user-phone',
        maxlength:4
    },
    sellerNum:{
        istrue:true,
        requeire:true,
        containerClass:'sellernumber-container',
        tag:'사업자 등록번호',
        fieldType:'number',
        fieldName:'sellernumber',
        maxlength:10
    },
    sellerName: {
        istrue:true,
        requeire:true,
        containerClass:'sellername-container',
        tag:'스토어 이름',
        fieldType:'text',
        fieldName:'sellername',
        maxlength:null
    }
})

$(`input[name="${joinState.userType}-user-pass2"]`).setAttribute('disabled',true)//id인증버튼
$('.join-btn').setAttribute('disabled',true)//회원가입버튼
$('.seller-value-check').setAttribute('disabled',true)//사업자등록번호버튼

// 버튼 활성화 함수 (상태 기반)
function updateJoinBtnState() {
    const { isIdChecked, isPassMatch, isAllField, isAgree } = joinState;
    const canJoin = isIdChecked && isPassMatch && isAllField && isAgree;
    $('.join-btn').disabled = !canJoin;
}

//input[type="number"] maxlangth
const numberTypeInput = document.querySelectorAll('input[type="number"]')

numberTypeInput.forEach(input=>{
    input.addEventListener('input',limitLength)
})

function limitLength(e){
    const maxLength = e.target.getAttribute('maxlength')
    if(e.target.value.length > maxLength) {
        e.target.value = e.target.value.slice(0, maxLength);
    }
}

// 휴대폰번호 필드 조립 함수 (userType별 동적 바인딩)
function phoneNumberJoin() {
    const userType = joinState.userType;
    const phoneArr = ['010', '', ''];
    const resultPhone = $(`input[name="${userType}-user-phone-res"]`);
    $(`select[name="${userType}-user-phone"]`).onchange = (e) => {
        phoneArr[0] = e.currentTarget.value;
        resultPhone.value = phoneArr.join('');
    };
    $(`input[name="${userType}-user-phone-m"]`).oninput = (e) => {
        phoneArr[1] = e.currentTarget.value;
        resultPhone.value = phoneArr.join('');
    };
    $(`input[name="${userType}-user-phone-last"]`).oninput = (e) => {
        phoneArr[2] = e.currentTarget.value;
        resultPhone.value = phoneArr.join('');
    };
}

function removeClasses(selectors, classes) {
    document.querySelectorAll(selectors).forEach(el => {
        el.classList.remove(...classes);
    });
}

// 유효성 검사 및 이벤트 바인딩 통합
function validationAll(userType) {
    const fields = getFormFields(userType);
    // 아이디 입력 시 유효성 검사 및 인증버튼 활성화
    fields.id.addEventListener('input', (e) => {
        if (isValidId(e.currentTarget.value)) {
            fields.idValueChk.removeAttribute('disabled');
        } else {
            fields.idValueChk.setAttribute('disabled', true);
        }
        joinState.isIdChecked = false;
        updateJoinBtnState();
    });
    // 아이디 인증 버튼 클릭
    fields.idValueChk.addEventListener('click', (e) => {
        e.preventDefault();
        const username = fields.id.value;
        validateUsername(username, userType);
        setTimeout(() => {
            joinState.isIdChecked = ispassid.ispass;
            updateJoinBtnState();
        }, 900);
    });
    // 비밀번호 입력 시 유효성 검사
    fields.pass.addEventListener('input', (e) => {
        if (isValidPass(e.currentTarget.value)) {
            e.currentTarget.closest('div').classList.add('ischecked');
            fields.pass2.removeAttribute('disabled');
        } else {
            e.currentTarget.closest('div').classList.remove('ischecked');
            fields.pass2.setAttribute('disabled', true);
        }
        joinState.isPassMatch = false;
        updateJoinBtnState();
    });
    // 비밀번호 재확인 입력 시 일치 검사
    fields.pass2.addEventListener('input', (e) => {
        const passwordValue = fields.pass.value;
        const reCheckValue = e.currentTarget.value;
        if (passwordValue === reCheckValue && isValidPass(passwordValue)) {
            e.currentTarget.closest('div').classList.add('ischecked');
            e.currentTarget.classList.remove('warning');
            $('.pass-warning')?.remove();
            joinState.isPassMatch = true;
        } else {
            if (!$('.pass-warning')) {
                const p = document.createElement('p');
                p.classList.add('warning-text', 'pass-warning');
                p.textContent = '비밀번호가 일치하지 않습니다';
                e.currentTarget.closest('div').append(p);
            }
            e.currentTarget.closest('div').classList.remove('ischecked');
            e.currentTarget.classList.add('warning');
            joinState.isPassMatch = false;
        }
        updateJoinBtnState();
    });
    // 사업자 등록번호 인증 버튼 활성화
    fields.sellerNum.addEventListener('input', (e) => {
        if(e.currentTarget.value.length == 10) {
            $('.seller-value-check').removeAttribute('disabled')
        } else {
            $('.seller-value-check').setAttribute('disabled',true)
        }
    })

    // 필수 입력값 모두 채워졌는지 검사
    fields.form.querySelectorAll('input[required]').forEach((input) => {
        input.addEventListener('input', () => {
            joinState.isAllField = Array.from(fields.form.querySelectorAll('input[required]')).every(
                (el) => el.value.trim() !== ''
            );
            updateJoinBtnState();
        });
    });
    // 약관 동의 체크
    fields.agreement?.addEventListener('change', () => {
        joinState.isAgree = !!fields.agreement.checked;
        updateJoinBtnState();
    });
}
validationAll(joinState.userType);

// 버튼 활성화 상태 갱신
function isJoinBtnActive() {
    updateJoinBtnState();
}


// 이벤트 바인딩 함수 (탭 전환 시마다 재바인딩)
function bindJoinBtnActiveEvents(userType) {
    const fields = getFormFields(userType);
    // 필수 입력값
    fields.form.querySelectorAll('input[required]').forEach((input) => {
        input.addEventListener('input', isJoinBtnActive);
    });
    // 약관 동의
    fields.agreement?.addEventListener('change', isJoinBtnActive);
    // 비밀번호 재확인
    fields.pass2?.addEventListener('input', isJoinBtnActive);
}
bindJoinBtnActiveEvents(joinState.userType);
isJoinBtnActive();


$('.join-btn').addEventListener('click', (e) => {
    e.preventDefault();
    const userType = joinState.userType;
    const fields = getFormFields(userType);
    const username = fields.id.value;
    const password = fields.pass.value;
    const phoneMiddle = fields.phoneM.value;
    const phoneLast = fields.phoneL.value;
    const phone_number = fields.phoneRes.value;
    const name = fields.name.value;
    const agreement = fields.agreement.checked;

    if (!isRequired(username)) {
        alert('아이디를 입력해 주세요.');
        fields.id.focus();
        return;
    }
    if (!isValidId(username)) {
        alert('아이디는 20자 이하의 아이디는 영문 대,소문자와 숫자만 가능합니다.');
        return;
    }
    if (!isRequired(password)) {
        alert('비밀번호를 입력해 주세요.');
        return;
    }
    if (!isValidPass(password)) {
        alert('비밀번호는 8자 이상,영소문자를 포함해야합니다.');
        return;
    }
    if (!isRequired(name)) {
        alert('이름을 입력해 주세요.');
        return;
    }
    if (!isRequired(phoneMiddle)) {
        alert('휴대폰 번호를 입력해 주세요.');
        return;
    }
    if (phone_number.length < 10) {
        alert('휴대폰 번호를 정확히 입력해 주세요.');
        return;
    }
    if (!isRequired(phoneLast)) {
        alert('휴대폰 번호를 입력해 주세요.');
        return;
    }
    if (!agreement) {
        alert('이용약관 및 개인정보처리방침에 체크해 주세요.');
        return;
    }

    // const requestBody = {
    //   username,
    //   password,
    //   name,
    //   phone_number,
    // };
});