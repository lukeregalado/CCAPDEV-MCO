const wrap = document.querySelector('.wrap');
const login = document.querySelector('.login-link');
const register = document.querySelector('.register-link');
const registerForm = document.getElementById('registration-form');
const openLogin = document.querySelector('.login-popup')
const closeLogin = document.querySelector('.close-login');

// clears all input fields
function resetLoginRegisterFields() {
    document.getElementById('login-email').value = "";
    document.getElementById('login-pw').value = "";
    document.getElementById('reg-email').value = "";
    document.getElementById('reg-pw').value = "";
    document.getElementById('reg-confirm-pw').value = "";
}

// //Fill AppointmentTable
// function generateSeats() {
//     var numSeats = 20;
//     var table = document.getElementById("seatTable");


//     for (var i = 1; i <= numSeats; i++) {
//         var row = table.insertRow();
//         var seatCell = row.insertCell(0);
//         var statusCell = row.insertCell(1);
//         var reserveeCell = row.insertCell(2);

   
//         seatCell.innerHTML = ("0" + i).slice(-2); 
//         statusCell.innerHTML = "Available";
//         reserveeCell.innerHTML = "None";
//     }
// };

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


//PAGE NAVIGATION

function viewPage(page) {
    window.location.href = "/" + page;
}

const userData = {
    "im_nayeon@dlsu.edu.ph": {
        name: "Im Na-yeon",
        pfpURL: "images/sample-users/Im Na-yeon",
        email: "im_nayeon@dlsu.edu.ph",
        description: "Student at DLSU University. Lead vocalist of TWICE."
    },
    "yoo_jeongyeon@dlsu.edu.ph": {
        name: "Yoo Jeong-yeon",
        pfpURL: "images/sample-users/Yoo Jeong-yeon",
        email: "yoo_jeongyeon@dlsu.edu.ph",
        description: "Lab Technician at a certain DLSU Lab. Main vocalist of TWICE."
    },
    "hirai_momo@dlsu.edu.ph": {
        name: "Hirai Momo",
        pfpURL: "images/sample-users/Hirai Momo",
        email: "hirai_momo@dlsu.edu.ph",
        description: "Lab Technician at a certain DLSU Lab. Main dancer of TWICE."
    },
    "minatozaki_sana@dlsu.edu.ph": {
        name: "Minatozaki Sana",
        pfpURL: "images/sample-users/Minatozaki Sana",
        email: "minatozaki_sana@dlsu.edu.ph",
        description: "Lab Technician at a certain DLSU Lab. Lead vocalist of TWICE."
    },
    "park_jihyo@dlsu.edu.ph": {
        name: "Park Ji-hyo",
        pfpURL: "images/sample-users/Park Ji-hyo",
        email: "park_jihyo@dlsu.edu.ph",
        description: "Student at DLSU University. Main vocalist and leader of TWICE."
    }
};

const defaultProfilePicture = "images/sample-users/Name";

generateSeats();

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

        // saveChangesToServer(profileEmail.textContent, profileName.textContent, profileDescription.textContent);
        // updateProfile(profileEmail.textContent);

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

var loadFile = function (event) {
    const profilePicture = document.getElementById("profile-picture");
    const profileEmail = document.getElementById("profile-email");
    var image = document.getElementById("output");
    profilePicture.src = URL.createObjectURL(event.target.files[0]);
    userData[profileEmail.textContent].pfpURL = profilePicture.src;
};

function uploadProfilePicture(file) {
    // Placeholder function for handling the file upload
    // You can implement this function to handle the upload to your server and update the profile picture
    console.log('Uploading profile picture:', file.name);

    // Update the profile picture preview
    const reader = new FileReader();
    reader.onload = function (e) {
        const profilePicture = document.getElementById("profile-picture");
        profilePicture.src = e.target.result;
    };
    reader.readAsDataURL(file);
}


// --USER PROFILE SEARCH-- //
const searchUser = document.querySelector('.search-user-icon')
// const searchInput = document.getElementById('user-search');

function clearSearchInput () {
    document.getElementById('user-search').value = "";
};

// function searchForUser() {
//     // fetch user input in the search bar
//     const userInput = document.getElementById('user-search').value.trim().toLowerCase();;

//     // filter data based on input
//     const searchResults = Object.values(userData).filter(function (user) {
//         return user.name.toLowerCase().includes(userInput);
//     });

//     // if only one result, update into that. if multiple, update into the closest match
//     if (searchResults.length >= 1) {
//         // call update profile
//         updateProfile(searchResults[0].email)
//     } else {
//         updateProfile("n/a")
//     }
// }

// //if user manually clicks search icon (user search)
// searchUser.addEventListener('click', searchForUser);

// searchInput.addEventListener('keypress', function (event) {
//     //check if enter key is pressed
//     if (event.key === 'Enter') {
//         searchForUser();
//     }
// });

// searchInput.addEventListener('input', function () {
//     var input = this.value.toLowerCase();
//     var suggestions = Object.values(userData);
//     var autocompleteDiv = document.getElementById('autocomplete-user-search');

//     //clear prev suggestion from prev searches
//     autocompleteDiv.innerHTML = '';

//     //filter -> display matching suggestions
//     suggestions.filter(user => user.name.toLowerCase().includes(input)).forEach(function (user) {
//         var div = document.createElement('div');
//         div.classList.add('autocomplete-item');

//         //suggestion pfp
//         var img = document.createElement('img');
//         img.src = user.pfpURL; //path to suggestion pfp
//         img.alt = user.name;
//         img.classList.add('autocomplete-img');
//         div.appendChild(img);

//         //suggestion name
//         var span = document.createElement('span');
//         span.textContent = user.name;
//         div.appendChild(span);

//         div.addEventListener('click', function () {
//             //if user clicks suggestion, it will be retained in the input bar
//             document.getElementById('user-search').value = user.name;
//             updateProfile(user.email);
//             autocompleteDiv.innerHTML = '';
//         });

//         autocompleteDiv.appendChild(div);   //add that div (user pfp + name)
//     });

//     //if user clicks away, removes display
//     document.addEventListener("click", function (event) {
//         if (!event.target.closest(".search-user")) {
//             autocompleteDiv.innerHTML = '';
//         }
//     });
// });

// --USER PROFILE DELETE-- //

// const deleteProfileBtn = document.querySelector(".delete-profile");
// const deleteProfileProceed = document.querySelector("#yes-delete");
// const deleteProfileCancel = document.querySelector("#no-delete");
// const deleteProfileX = document.querySelector(".close-delete-profile-yesno")

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
}

