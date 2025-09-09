import {Members} from './Member.js';
import{ isRequired,isValidPass,isValidId,validateUsername } from './validation.js'

const $ = (node) => document.querySelector(node); // 작성 편의 및 가독성 위해 유틸함수 생성

const tab = $('.tab-list')
const targetInput = $('input[name="user-type-field"]')

tab.addEventListener('click',(e)=>{ //event 위임
    e.preventDefault();
    const li = document.querySelectorAll('li');
    const targetli = e.target.closest('li');
    const targetdata = targetli.dataset.target;
    //console.log(li.dataset.target) // target or purchase
    const targetContainer = $(`.${targetdata}-box`);
    const Container = document.querySelectorAll('.container');

    li.forEach((ele)=>{
        if(ele.classList.contains('active')) {
            ele.classList.remove('active')
        }
    })
    targetli.classList.add('active')

    Container.forEach((ele)=>{
        if(ele.classList.contains('on')) {
            ele.classList.remove('on')
        }
    })
    targetContainer.classList.add('on')

    targetInput.value=targetdata
})


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
        maxlength:null
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
        maxlength:null
    },
    sellerNum:{
        istrue:true,
        requeire:true,
        containerClass:'sellernumber-container',
        tag:'사업자 등록번호',
        fieldType:'number',
        fieldName:'sellernumber',
        maxlength:15
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

//id 중복확인
//id 유효할 경우 인증버튼 활성화
$('.id-value-check').setAttribute('disabled',true)
$(`input[name="buyer-user-id"]`).addEventListener('input',(e)=>{
    if(isValidId(e.currentTarget.value)) {
        $('.id-value-check').removeAttribute('disabled')
    } else {
        $('.id-value-check').setAttribute('disabled',true)
    }
})

$('.id-value-check').addEventListener('click',(e)=>{
    e.preventDefault();
    const userType = targetInput.value == 'buyer' ? 'buyer' : 'seller';
    const username = $(`input[name="${userType}-user-id"]`).value;
    validateUsername(username,userType)
})


 //초기 비밀번호 재확인-disabled
 //password 유효성 일치 할 경우 체크 아이콘 컬러 변경
 //password 양식에 맞을 경우 비밀번호 재확인 필드 on

$('input[name="buyer-user-pass2"]').setAttribute('disabled',true)

$('input[name="buyer-user-pass"]').addEventListener('input',(e)=>{
    if(isValidPass(e.currentTarget.value)) {
        e.currentTarget.closest('div').classList.add('ischecked')
        $('input[name="buyer-user-pass2"]').removeAttribute('disabled')
    } else {
        e.currentTarget.closest('div').classList.remove('ischecked')
        $('input[name="buyer-user-pass2"]').setAttribute('disabled',true)
    }
})


$('input[name="buyer-user-pass2"]').addEventListener('input',(e)=>{
    const passwordValue = $('input[name="buyer-user-pass"]').value;
    const targetValue = e.currentTarget.value
    if(passwordValue == targetValue) {
        e.currentTarget.closest('div').classList.add('ischecked')
        e.currentTarget.classList.remove('warning')
        $('.warning-text').remove()
    } else {
        if(!$('.warning-text')){ //한 번만 생성합니다
            const p = document.createElement('p')
            p.classList.add('warning-text')
            p.textContent='비밀번호가 일치하지 않습니다'
            e.currentTarget.closest('div').append(p)
        }

        e.currentTarget.closest('div').classList.remove('ischecked')
        e.currentTarget.classList.add('warning')
    }
})

 $('.join-btn').addEventListener('click',(e)=>{
    e.preventDefault();

    const userType = targetInput.value == 'buyer' ? 'buyer' : 'seller';

    const username = $(`input[name="${userType}-user-id"]`).value;
    const password = $(`input[name="${userType}-user-pass"]`).value;
    const phoneMiddle = $(`input[name="${userType}-user-phone-m"]`).value;
    const phoneLast = $(`input[name="${userType}-user-phone-last"]`).value;
    const phone_number = $(`input[name="${userType}-user-phone-res"]`).value;
    const name = $(`input[name="${userType}-user-name"]`).value;
    const agreement = $(`input[name="agreement"]:checked`);

    if(!isRequired(username)) {
        alert('아이디를 입력해 주세요.')
        $(`input[name="${userType}-user-id"]`).focus()
        return
    }
    if(!isValidId(username)) {
        alert('아이디는 20자 이하의 아이디는 영문 대,소문자와 숫자만 가능합니다.')
        return
    }
    if(!isRequired(password)) {
        alert('비밀번호를 입력해 주세요.')
        return
    }
    if(!isValidPass(password)) {
        alert('비밀번호는 8자 이상,영소문자를 포함해야합니다.')
        return
    }
    if(!isRequired(name)) {
        alert('이름을 입력해 주세요.')
        return
    }
    if(!isRequired(phoneMiddle)) {
        alert('휴대폰 번호를 입력해 주세요.')
        return
    }
    if(phone_number.length < 10) {
        alert('휴대폰 번호를 정확히 입력해 주세요.')
        return
    }
    if(!isRequired(phoneLast)) {
        alert('휴대폰 번호를 입력해 주세요.')
        return
    }
    if(!agreement) {
        alert('이용약관 및 개인정보처리방침에 체크해 주세요.')
        return
    }

    // const requestBody = {
    //     username, //id
    //     password,
    //     name,
    //     phone_number //phoneResult
    // };
})