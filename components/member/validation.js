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

export function isValidName(value) {
    return true;
}

export async function isUniqueId(value) {
    const res = await fetch(`https://api.wenivops.co.kr/services/open-market/accounts/buyer/check-id/?id=${value}`);
    const data = await res.json();
  return data.isUnique; // 서버에서 true/false 반환
}

export const ispassid = {
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