const $ = (node) => document.querySelector(node); // 작성 편의 및 가독성 위해 유틸함수 생성
const tab = $('.tab-list');
const targetInput = $('input[name="user-type-field"]');

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

    targetInput.value = targetdata;

    getFormFieldsArray(targetdata);
}

tab.addEventListener('click', tabSwitch);

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

function getFormFieldsArray(userType) {
    const defaultKey = ['id','password'];
    const key = defaultKey;
    const allArray = key.map((ele)=>($(`input[name="${userType}-login-${ele}"]`)))
    allArray.forEach((field,idx)=>{
        console.log(field) //console 찍어보기
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

//경고메시지
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

getFormFieldsArray('buyer')