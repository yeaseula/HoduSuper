import {validateUsername} from './validation.js'

const $ = (node) => document.querySelector(node)

export class Members {
    constructor (infor) {
        this.infor = infor;
        this.init()
    }

    init(){
        Object.values(this.infor).forEach((ele)=>{
            const {
                istrue,
                requeire,
                containerClass,
                tag,
                fieldType,
                fieldName,
                maxlength
            } = ele;

            if(ele !== this.infor.phone) {
                if(istrue) {
                    this.field(containerClass,tag,fieldType,fieldName,maxlength)
                }
            } else {
                if(istrue) {
                    this.phonefield(containerClass,tag,fieldType,fieldName,maxlength)
                }
            }
        })
    }

    field(divName,tagName,inputType,inputName,maxlength){
        const form = document.querySelector(`.${this.infor.classname}-box form`);
        const WholeContainer = document.createElement('div');
        WholeContainer.classList.add(divName); //ex.id-container
        const inputTag = document.createElement('p');
        inputTag.classList.add('field-name')
        inputTag.textContent=tagName

        const inputBox = document.createElement('div')
        const input = document.createElement('input')
        input.setAttribute('type',inputType)
        input.setAttribute('name',inputName)
        input.setAttribute('maxlength',maxlength)

        WholeContainer.append(inputTag)
        inputBox.append(input)
        WholeContainer.append(inputBox)

        if(tagName == '아이디') { //아이디 필드의 경우 중복확인 버튼 추가
            this.valueCheckBtn('id-value-check','중복확인',inputBox)
        } else if(tagName == '사업자 등록번호') {
            this.valueCheckBtn('seller-value-check','인증',inputBox)
        }

        form.append(WholeContainer)

    }
    phonefield(divName,tagName,inputType,inputName){
        const form = document.querySelector(`.${this.infor.classname}-box form`);
        const WholeContainer = document.createElement('div');
        WholeContainer.classList.add(divName);

        //필드이름
        const inputTag = document.createElement('p');
        inputTag.textContent=tagName
        inputTag.classList.add('field-name')

        const inputBox = document.createElement('div')

        //셀렉트박스
        const select = document.createElement('select')
        select.setAttribute('name',inputName)
        const options = ["010", "011", "019", "016"];

        options.forEach(num => {
            const option = document.createElement('option');
            option.value = num; // form 전송될 값
            option.textContent = num;  // 화면에 보이는 값
            select.appendChild(option);
        });
        //중간,마지막 번호 필드
        const phone1 = document.createElement('input')
        phone1.setAttribute('type',inputType)
        phone1.setAttribute('name',`${inputName}-m`)
        const phone2 = document.createElement('input')
        phone2.setAttribute('type',`${inputType}`)
        phone2.setAttribute('name',`${inputName}-last`)

        phone1.addEventListener('input',this.limitLength)
        phone2.addEventListener('input',this.limitLength)

        //hidden
        const resPhone = document.createElement('input')
        resPhone.setAttribute('type','hidden')
        resPhone.setAttribute('name',`${inputName}-res`)

        inputBox.append(select)
        inputBox.append(phone1)
        inputBox.append(phone2)
        inputBox.append(resPhone)

        WholeContainer.append(inputTag)
        WholeContainer.append(inputBox)

        form.append(WholeContainer)

        this.phoneNumberJoin(select,phone1,phone2,resPhone)
    }

    valueCheckBtn(className,textContent,inputBox){
        let ChkButton = document.createElement('button')
        ChkButton.classList.add(className)
        ChkButton.textContent=textContent
        inputBox.append(ChkButton)
    }

    phoneNumberJoin(select,phone1,phone2,resPhone){
        const phoneArr = ['010']
        select.addEventListener('change',(e)=>{
            phoneArr[0] = e.currentTarget.value;
            const phoneNumber = phoneArr.join('')
            resPhone.value = phoneNumber
        })
        phone1.addEventListener('input',(e)=>{
            phoneArr[1] = e.currentTarget.value;
            const phoneNumber = phoneArr.join('')
            resPhone.value = phoneNumber
        })
        phone2.addEventListener('input',(e)=>{
            phoneArr[2] = e.currentTarget.value;
            const phoneNumber = phoneArr.join('')
            resPhone.value = phoneNumber
        })

    }

    limitLength(e){
        if(e.target.value.length > 4) {
            e.target.value = e.target.value.slice(0, 4);
        }
    }
}