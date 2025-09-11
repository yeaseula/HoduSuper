const $ = (node) => document.querySelector(node); // 작성 편의 및 가독성 위해 유틸함수 생성
const tab = $('.tab-list');

const tabSwitch = (e)=>{
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
}

tab.addEventListener('click', tabSwitch);