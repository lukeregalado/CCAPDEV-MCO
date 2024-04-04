//Authors: Luke Regalado, Miguel Guerrero, Ilan Templa.

const wrap = document.querySelector('.wrap');
const login = document.querySelector('.login-link');
const register = document.querySelector('.register-link');
const registerForm = document.getElementById('registration-form');
const openLogin = document.querySelector('.login-popup');
const logout = document.querySelector('logout');
const closeLogin = document.querySelector('.close-login');


// clears all input fields
function resetLoginRegisterFields() {
    document.getElementById('login-email').value = "";
    document.getElementById('login-pw').value = "";
    document.getElementById('reg-email').value = "";
    document.getElementById('reg-pw').value = "";
    document.getElementById('reg-confirm-pw').value = "";
}

// executes when Register is clicked
register.addEventListener('click', () => {
    wrap.classList.add('register-as');
});

// executes when user chooses Student or Lab Technician
function registerAs(r) {
    wrap.classList.add('active');
    wrap.classList.remove('register-as');

    registerForm.classList = '';
    registerForm.classList.add(r)
    resetLoginRegisterFields()
}

// executes when Login is clicked
login.addEventListener('click', () => {
    wrap.classList.remove('active');
    resetLoginRegisterFields()
});

// executes when Login (topright of main-content) is clicked
openLogin.addEventListener('click', () => {
    wrap.classList.add('popup');
});

// executes when close (X) button is clicked
closeLogin.addEventListener('click', () => {
    wrap.className = "wrap";
    resetLoginRegisterFields()
});

function verifyConfirmPassword () {
    const password = document.getElementById('reg-pw').value;
    const confPassword = document.getElementById('reg-confirm-pw').value;

    if (password !== confPassword) {
        alert('Passwords do not match. Please try again.')
    } else {
        return 1;
    }

    return 0;
}

function logoutUser() {
    // send POST logout req to app
    fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        if (response.ok) {
            // logout successful
            console.log('Logout successful');
            return response.json();
        } else {
            // logout failed
            console.error('Logout failed');
            alert('Failed to logout!');
            throw new Error('Logout failed');
        }
    })
    .then(data => {
        // back to home page
        viewPage('');
    })
    .catch(error => {
        console.error('Error during logout:', error);
    });
}

document.getElementById('registration-form').addEventListener('submit', function(event) {
    event.preventDefault(); // prevent default form submission

    if (verifyConfirmPassword() == 1) {
        // fetch user input
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-pw').value;
        let pos = ''; //t for technication; s for student
        if (registerForm.classList.contains('t')){
            pos = 'Lab Technician';
        } else {
            pos = 'Student'
        }

        // send registration data to server
        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password , pos: pos})
        })
        .then(response => {
            if (response.ok) {
                // registration successful
                console.log('Registration successful');
                viewPage('profile/' + email);
            } else {
                // registration fail
                console.error('Registration failed');
                alert('An account with this email already exists!');
            }
        })
        .catch(error => {
            console.error('Error during registration:', error);
        });
    }
});

document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault(); // prevent default form submission

    // fetch user input
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-pw').value;
    const remember = document.getElementById('remember-me').checked;

    // send login data to server
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, password: password, remember: remember})
    })
    .then(response => {
        if (response.ok) {
            // login successful
            console.log('Login successful');
            return response.json(); // Parse response JSON
        } else {
            // login fail
            console.error('Login failed');
            alert('Invalid email or password');
            throw new Error('Login failed'); // Propagate error for catch block
        }
    })
    .then(data => {
        // redirect or perform action based on response data
        viewPage('profile/' + data.name);
    })
    .catch(error => {
        console.error('Error during login:', error);
    });
});



//PAGE NAVIGATION

function viewPage(page) {
    window.location.href = "/" + page;
}