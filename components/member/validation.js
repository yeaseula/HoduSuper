export function isRequired(value) {
    return value.trim() !== '';
}

export function isValidPass(value) {
    return /^(?=.*[a-z])(?=.*\d).{8,}$/.test(value);
}


export function isValidName(value) {
  return true;
}

export async function isUniqueId(value) {
  const res = await fetch(`https://api.wenivops.co.kr/services/open-market/accounts/buyer/check-id/?id=${value}`);
  const data = await res.json();
  return data.isUnique; // 서버에서 true/false 반환
}