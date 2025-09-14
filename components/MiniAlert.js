/* 얼럿 컴포넌트 */
const pathPrefix = location.pathname.includes('/pages/') ? '../' : '';
export default class MiniAlert {
    constructor({title, message, buttons, link, linkHref, closeBackdrop, customContent}) {
            this.title = title;
            this.message = message;
            this.buttons = buttons;
            this.link = link;
            this.linkHref = linkHref;
            this.closeBackdrop = closeBackdrop;
            this.customContent = customContent;
            this.init();
        }
        init(){
            const test = { //dom 구조 변경 시 수정할부분
                backdrop: { elementType : 'div', className : 'alert-backdrop'},
                modal: { elementType : 'div', className : 'alert'},
                alertContent: { elementType : 'div', className : 'alert-content'},
                closeBtn: { elementType: 'button', className: 'close-btn'},
                alertTitle: { elementType: 'h2', className : 'sr-only'},
                alertMessage: { elementType: 'p', className: 'alert-message'},
                customContentBox: { elementType: 'div', className: 'custom-content'},
                alertAction: { elementType: 'div', className: 'alert-actions' }
            }
            const domElements = {};
            Object.entries(test).forEach(([name,def])=>{
                const ele = document.createElement(def.elementType);
                ele.classList.add(def.className);
                domElements[name] = ele;
            })

            //조립함수
            this.assemble(domElements)

            if(this.closeBackdrop) {
                domElements.backdrop.addEventListener('click',this.close);
            }
            domElements.closeBtn.addEventListener('click',this.close);
            domElements.modal.addEventListener('click',(e)=>{e.stopPropagation()});
        }
        assemble(domElements) {
            const { alertAction, //dom 구조 변경 시 수정할부분
                alertContent,
                alertMessage,
                alertTitle,
                closeBtn,
                backdrop,
                customContentBox,
                customContent,
                modal
            } = domElements;
            //console.log(domElements)
            closeBtn.innerHTML = `<img src="${pathPrefix}assets/images/close-btn.svg">`
            alertTitle.innerHTML = this.title;
            alertMessage.innerHTML = this.message;
            customContentBox.innerHTML = this.customContent;

            //예외처리, 버튼 사용할때
            if(this.buttons !== null) {
                this.buttons.forEach((btnInfo) => {
                    this.setButtonType(domElements,alertAction,'button',btnInfo)
                });
            }
            //예외처리, 하이퍼링크 사용할때
            if(this.link !== null) {
                this.link.forEach((linkInfo,idx) => {
                    this.setHrefType(domElements,alertAction,'a',linkInfo);
                });
            }
            if(this.customContent !== null) { //커스텀메시지가 존재할때
                //dom 구조 변경 시 수정할부분
                this.appendFuc(domElements,alertContent,closeBtn,alertTitle,customContent,alertAction)
            } else {
                this.appendFuc(domElements,alertContent,closeBtn,alertTitle,alertMessage,alertAction)
            }
            modal.append(alertContent)
            backdrop.append(modal)

            document.body.append(backdrop)
        }
        setButtonType(domElements,alertAction,domType,btnInfo) {
            const btn = document.createElement(domType);
            btn.textContent = btnInfo;
            btn.classList.add("common-btn","alert-btn");
            alertAction.append(btn);
        }
        setHrefType(domElements,alertAction,domType,linkInfo) {
            this.setButtonType(domElements,alertAction,'a',linkInfo);
            const href = this.linkHref.map((ele)=>(ele));
            alertAction.querySelectorAll('a').forEach((a,idx)=>{
                a.setAttribute('href',href[idx])
            })
        }
        //dom 붙이기
        //dom 구조 변경 시 수정할부분
        appendFuc(domElements,alertContent,closeBtn,title,messagetype,btnAction){
            alertContent.append(
                closeBtn,
                title,
                messagetype,
                btnAction,
            )
        }
        close() {
            document.querySelector('.alert-backdrop')?.remove();
        }
}