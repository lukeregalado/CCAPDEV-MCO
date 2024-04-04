<<<<<<< HEAD
//Authors: Luke Regalado, Miguel Guerrero, Ilan Templa.

const login = document.querySelector('.login-link');
const register = document.querySelector('.register-link');
const registerForm = document.getElementById('registration-form');
const openLogin = document.querySelector('.login-popup');
const logout = document.querySelector('logout');
const closeLogin = document.querySelector('.close-login');
const pfpUpload = document.getElementById('pfpFileInput');

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

function pfpUploadClick () {
    pfpUpload.click();
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

const defaultProfilePicture = "images/sample-users/Name";

// --USER PROFILE EDIT-- //
function toggleEditMode() {
    const profileName = document.getElementById('profile-name');
    const profilePicture = document.getElementById('profile-picture')
    const profileEmail = document.getElementById('profile-email')
    const profileDescription = document.getElementById('profile-description');
    const editProfile = document.querySelector('.edit-profile')


    if (profileName.contentEditable == false || !profileName.hasAttribute("contentEditable")) {
        profileName.contentEditable = true;
        profileDescription.contentEditable = true;
        editProfile.src = '/images/icons/save.png';
    } else {
        // disable edit
        profileName.contentEditable = false;
        profileDescription.contentEditable = false;
        editProfile.src = '/images/icons/edit.png';

        //for editing the db itself
        fetch('/edit-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                email: profileEmail.textContent, 
                name: profileName.textContent, 
                description: profileDescription.textContent}) // pass email of user to be edited (key)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to edit profile');
            }
            // action after editing
            // viewPage('');
        })
        .catch(error => {
            console.error('Error editing profile:', error);
        });
    
    }
}

pfpUpload.addEventListener('change', function(event) {
    event.preventDefault(); // prevent default form submission


    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    // send POST request to server
    fetch('/uploadPfp', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            console.log('File uploaded successfully');
        } else {
            console.error('File upload failed');
        }
    })
    .catch(error => {
        console.error('Error during file upload:', error);
    });
});

var loadFile = function (event) {
    const profilePicture = document.getElementById("profile-picture");
    const profileEmail = document.getElementById("profile-email");

    profilePicture.src = URL.createObjectURL(event.target.files[0]);
    userData[profileEmail.textContent].pfpURL = profilePicture.src;
};

function uploadProfilePicture(file) {
    // file upload
    console.log('Uploading profile picture:', file.name);

    const profileEmail = document.getElementById("profile-email");
    const pfpURL = document.getElementById("profile-picture");

    // formdata (to hold image file)
    const formData = new FormData();
    formData.append('photo', file, file.name);
    formData.append('email', profileEmail.textContent);

    // send POST request to send file to server
    fetch('/uploadProfilePicture', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            //upload successful yippieeeeee
            console.log('Profile picture uploaded successfully');
            pfpURL.src = '/images/uploads/' + file.name;
        } else {
            //upload failed
            console.error('Profile picture upload failed');
        }
    })
    .catch(error => {
        //err
        console.error('Error during profile picture upload:', error);
    });
}


// --USER PROFILE SEARCH-- //
const searchUser = document.querySelector('.search-user-icon')
// const searchInput = document.getElementById('user-search');

function clearSearchInput () {
    document.getElementById('user-search').value = "";
};


// --USER PROFILE DELETE-- //

function deleteProfile() {
    const profileEmail = document.getElementById('profile-email').textContent;
    // AJAX req to delete profile
    fetch('/delete-profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: profileEmail }) // pass email of user to be deleted (key)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete profile');
        }
        // action after deletion
        viewPage('');
    })
    .catch(error => {
        console.error('Error deleting profile:', error);
    });

}

function deleteProfileBtnClick () {
    // confirm if the user wants to delete the profile
    const deleteProfileMenu = document.querySelector(".delete-profile-yesno");
    deleteProfileMenu.classList.add('popup');
}

// function deleteProfile() {
//     const profileEmail = document.getElementById("profile-email");


//     delete userData[profileEmail.textContent];
//     deleteProfileMenu.classList.remove('popup');
//     clearSearchInput();
//     searchUser.dispatchEvent(new Event('click'));

//     // window.location.assign('index.html'); //goes back to main dashboard
// }

function cancelDeleteProfile() {
    const deleteProfileMenu = document.querySelector(".delete-profile-yesno");
    deleteProfileMenu.classList.remove('popup');
}

function searchQuery() {
    const searchInput = document.getElementById('user-search');
    const inputData = searchInput.value;
    console.log(inputData);
    console.log(JSON.stringify({data: inputData}));

    // AJAX req for search
    fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({data: inputData})
    })

    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch search suggestions');
        }
        return response.json(); // Parse JSON here
    })
    .then(searchSuggestions => {
        // handle response from server if needed
        console.log('Response from server:', searchSuggestions);
        updateSuggestions(searchSuggestions);
    })
    .catch(error => {
        console.error('Error sending data to server:', error);
    });
}

function updateSuggestions(suggestions) {
    const autocompleteContainer = document.getElementById('autocomplete-user-search');
    autocompleteContainer.innerHTML = ''; // clear previous suggestions
    
    if (!Array.isArray(suggestions)) {
        console.error('Received invalid suggestions:', suggestions);
        return;
    }
    
    suggestions.forEach(suggestion => {
        const suggestionItem = document.createElement('div');
        suggestionItem.classList.add('autocomplete-item');
        suggestionItem.innerHTML = `
            <img src="${suggestion.pfpURL}" alt="${suggestion.name}">
            <span>${suggestion.name}</span>
        `;
        suggestionItem.addEventListener('click', function() {
            // navigate to the user's profile page when clicked
            viewPage('profile/' + suggestion.name);
        });
        autocompleteContainer.appendChild(suggestionItem);
    });
=======
//Authors: Luke Regalado, Miguel Guerrero, Ilan Templa.

const pfpUpload = document.getElementById('pfpFileInput');

function pfpUploadClick () {
    pfpUpload.click();
}

const defaultProfilePicture = "images/sample-users/Name";

// --USER PROFILE EDIT-- //
function toggleEditMode() {
    const profileName = document.getElementById('profile-name');
    const profilePicture = document.getElementById('profile-picture')
    const profileEmail = document.getElementById('profile-email')
    const profileDescription = document.getElementById('profile-description');
    const editProfile = document.querySelector('.edit-profile')


    if (profileName.contentEditable == false || !profileName.hasAttribute("contentEditable")) {
        profileName.contentEditable = true;
        profileDescription.contentEditable = true;
        editProfile.src = '/images/icons/save.png';
    } else {
        // disable edit
        profileName.contentEditable = false;
        profileDescription.contentEditable = false;
        editProfile.src = '/images/icons/edit.png';

        //for editing the db itself
        fetch('/edit-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                email: profileEmail.textContent, 
                name: profileName.textContent, 
                description: profileDescription.textContent}) // pass email of user to be edited (key)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to edit profile');
            }
            // action after editing
            // viewPage('');
        })
        .catch(error => {
            console.error('Error editing profile:', error);
        });
    
    }
}

pfpUpload.addEventListener('change', function(event) {
    event.preventDefault(); // prevent default form submission


    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    // send POST request to server
    fetch('/uploadPfp', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            console.log('File uploaded successfully');
        } else {
            console.error('File upload failed');
        }
    })
    .catch(error => {
        console.error('Error during file upload:', error);
    });
});

var loadFile = function (event) {
    const profilePicture = document.getElementById("profile-picture");
    const profileEmail = document.getElementById("profile-email");

    profilePicture.src = URL.createObjectURL(event.target.files[0]);
    userData[profileEmail.textContent].pfpURL = profilePicture.src;
};

function uploadProfilePicture(file) {
    // file upload
    console.log('Uploading profile picture:', file.name);

    const profileEmail = document.getElementById("profile-email");
    const pfpURL = document.getElementById("profile-picture");

    // formdata (to hold image file)
    const formData = new FormData();
    formData.append('photo', file, file.name);
    formData.append('email', profileEmail.textContent);

    // send POST request to send file to server
    fetch('/uploadProfilePicture', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            //upload successful yippieeeeee
            console.log('Profile picture uploaded successfully');
            pfpURL.src = '/images/uploads/' + file.name;
        } else {
            //upload failed
            console.error('Profile picture upload failed');
        }
    })
    .catch(error => {
        //err
        console.error('Error during profile picture upload:', error);
    });
}


// --USER PROFILE SEARCH-- //
const searchUser = document.querySelector('.search-user-icon')
// const searchInput = document.getElementById('user-search');

function clearSearchInput () {
    document.getElementById('user-search').value = "";
};


// --USER PROFILE DELETE-- //

function deleteProfile() {
    const profileEmail = document.getElementById('profile-email').textContent;
    // AJAX req to delete profile
    fetch('/delete-profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: profileEmail }) // pass email of user to be deleted (key)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete profile');
        }
        // action after deletion
        viewPage('');
    })
    .catch(error => {
        console.error('Error deleting profile:', error);
    });

}

function deleteProfileBtnClick () {
    // confirm if the user wants to delete the profile
    const deleteProfileMenu = document.querySelector(".delete-profile-yesno");
    deleteProfileMenu.classList.add('popup');
}

function cancelDeleteProfile() {
    const deleteProfileMenu = document.querySelector(".delete-profile-yesno");
    deleteProfileMenu.classList.remove('popup');
}

function searchQuery() {
    const searchInput = document.getElementById('user-search');
    const inputData = searchInput.value;
    console.log(inputData);
    console.log(JSON.stringify({data: inputData}));

    // AJAX req for search
    fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({data: inputData})
    })

    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch search suggestions');
        }
        return response.json(); // Parse JSON here
    })
    .then(searchSuggestions => {
        // handle response from server if needed
        console.log('Response from server:', searchSuggestions);
        updateSuggestions(searchSuggestions);
    })
    .catch(error => {
        console.error('Error sending data to server:', error);
    });
}

function updateSuggestions(suggestions) {
    const autocompleteContainer = document.getElementById('autocomplete-user-search');
    autocompleteContainer.innerHTML = ''; // clear previous suggestions
    
    if (!Array.isArray(suggestions)) {
        console.error('Received invalid suggestions:', suggestions);
        return;
    }
    
    suggestions.forEach(suggestion => {
        const suggestionItem = document.createElement('div');
        suggestionItem.classList.add('autocomplete-item');
        suggestionItem.innerHTML = `
            <img src="${suggestion.pfpURL}" alt="${suggestion.name}">
            <span>${suggestion.name}</span>
        `;
        suggestionItem.addEventListener('click', function() {
            // navigate to the user's profile page when clicked
            viewPage('profile/' + suggestion.name);
        });
        autocompleteContainer.appendChild(suggestionItem);
    });
>>>>>>> aa2cfefacac14b0b68e2adc23b555f6f1ef28103
}