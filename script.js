const wrap = document.querySelector('.wrap');
const login = document.querySelector('.login-link');
const register = document.querySelector('.register-link');
const openLogin = document.querySelector('.login-popup')
const closeLogin = document.querySelector('.close-login')

register.addEventListener('click', ()=> {
    wrap.classList.add('active');
});

login.addEventListener('click', ()=> {
    wrap.classList.remove('active');
});

openLogin.addEventListener('click', ()=> {
    wrap.classList.add('popup');
});

closeLogin.addEventListener('click', ()=> {
    wrap.classList.remove('popup');
});