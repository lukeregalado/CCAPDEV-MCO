const wrap = document.querySelector('.wrap');
const login = document.querySelector('.login-link');
const register = document.querySelector('.register-link');
const openLogin = document.querySelector('.login-popup')
const closeLogin = document.querySelector('.close-login')

// clears all input fields
function resetLoginRegisterFields() {
    document.getElementById('login-email').value = "";
    document.getElementById('login-pw').value = "";
    document.getElementById('reg-email').value = "";
    document.getElementById('reg-pw').value = "";
    document.getElementById('reg-confirm-pw').value = "";
}

// executes when Register is clicked
register.addEventListener('click', ()=> {
    wrap.classList.add('register-as');
});

// executes when user chooses Student or Lab Technician
function registerAs(r) {
    wrap.classList.add('active');
    wrap.classList.remove('register-as');
    resetLoginRegisterFields()
}

// executes when Login is clicked
login.addEventListener('click', ()=> {
    wrap.classList.remove('active');
    resetLoginRegisterFields()
});


// executes when Login (topright of main-content) is clicked
openLogin.addEventListener('click', ()=> {
    wrap.classList.add('popup');
});

// executes when close (X) button is clicked
closeLogin.addEventListener('click', ()=> {
    wrap.className = "wrap";
    resetLoginRegisterFields()
});

function openLabPopup() {
    document.getElementById("labPopup").style.display = "block";
  }

