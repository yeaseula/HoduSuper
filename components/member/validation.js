const $ = (node) => document.querySelector(node);
//field
export function isRequired(value) {
    return value.trim() !== '';
}

//password
export function isValidPass(value) {
    return /^(?=.*[a-z])(?=.*\d).{8,}$/.test(value);
}

//id
export function isValidId(value) {
    return /^[A-Za-z0-9]{1,20}$/.test(value);
}

export const ispassid = {
    ispass : false
}
export const ispassUserNum = {
    ispass : false
}

//id 중복확인
export function validateUsername(username,userType) {
    const usernameField = $(`.${userType}-id-container`);
    fetch("https://api.wenivops.co.kr/services/open-market/accounts/validate-username/", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
    })
    .then(res => res.json().then(data => ({ status: res.status, body: data })))
    .then(({ status, body }) => {
        const p = document.createElement('p')
        p.classList.add('warning-text','id-warning')
        $('.id-warning')?.remove();
        if (status === 200) {
            console.log("✅", body.message);
            p.classList.add('good')
            p.textContent = '멋진 아이디네요 :)'
            ispassid.ispass = true
        } else if (status === 400) {
            console.warn("⚠️", body.error);
            p.textContent = '이미 사용중인 아이디입니다';
            ispassid.ispass = false
        } else {
            console.error("❌ 예상치 못한 응답:", body);
            p.textContent = '이미 사용중인 아이디입니다';
            ispassid.ispass = false
        }
        usernameField.append(p);
    })
    .catch(err => console.error("에러:", err));
}

//사업자 중복확인
export function validateSellerNumber(company_registration_number) {
    const sellerNumberField = $('.sellernumber-container');
    fetch("https://api.wenivops.co.kr/services/open-market/accounts/seller/validate-registration-number/", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({ company_registration_number }),
    })
    .then(res => res.json().then(data => ({ status: res.status, body: data })))
    .then(({ status, body }) => {
        const p = document.createElement('p')
        p.classList.add('warning-text','seller-number-warning')
        $('.seller-number-warning')?.remove();
        if (status === 200) {
            console.log("✅", body.message);
            p.classList.add('good')
            p.textContent = '사용 가능한 사업자번호입니다'
            ispassUserNum.ispass = true
        } else if (status === 409) {
            console.warn("⚠️", body.error);
            p.textContent = '이미 등록된 사업자번호입니다';
            ispassUserNum.ispass = false
        } else {
            console.error("❌ 예상치 못한 응답:", body);
            p.textContent = '사업자 번호 10자리를 정확히 입력해주세요';
            ispassUserNum.ispass = false
        }
        sellerNumberField.append(p);
    })
    .catch(err => console.error("에러:", err));
}