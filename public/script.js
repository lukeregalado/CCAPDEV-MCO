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

//Fill AppointmentTable
function generateSeats() {
    var numSeats = 20;
    var table = document.getElementById("seatTable");


    for (var i = 1; i <= numSeats; i++) {
        var row = table.insertRow();
        var seatCell = row.insertCell(0);
        var statusCell = row.insertCell(1);
        var reserveeCell = row.insertCell(2);

   
        seatCell.innerHTML = ("0" + i).slice(-2); 
        statusCell.innerHTML = "Available";
        reserveeCell.innerHTML = "None";
    }
};

// executes when Register is clicked
register.addEventListener('click', () => {
    wrap.classList.add('register-as');
});

// executes when user chooses Student or Lab Technician
function registerAs(r) {
    wrap.classList.add('active');
    wrap.classList.remove('register-as');
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

//PAGE NAVIGATION

function viewPage(page) {
    window.location.href = "/" + page;
}

const userData = {
    "im_nayeon@dlsu.edu.ph": {
        name: "Im Na-yeon",
        pfpURL: "images/sample-users/Im Na-yeon", // Corrected the concatenation
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
updateProfile("im_nayeon@dlsu.edu.ph"); //HARDCODED DEFAULT LANDING PAGE


function updateProfile(user) {
    const profileName = document.getElementById("profile-name");
    const profilePicture = document.getElementById("profile-picture");
    const profileEmail = document.getElementById("profile-email");
    const profileDescription = document.getElementById("profile-description");

    const img = new Image();

    //get user data if user is not "n/a"
    if (user != "n/a") {
        const userDetail = userData[user];

        img.onload = function () {
            profilePicture.src = fileURL;
        };
        img.onerror = function () {
            profilePicture.innerHTML = defaultProfilePicture;
            console.log('PFP NOT FOUND: Using Default.')
        };

        //update profile elements
        profileName.innerText = userDetail.name;
        profilePicture.src = userDetail.pfpURL;
        profileEmail.innerText = userDetail.email;
        profileDescription.innerText = userDetail.description;

        userData[user] = {
            name: profileName.innerText,
            pfpURL: profilePicture.src,
            email: profileEmail.innerText,
            description: profileDescription.innerText
        };
    }

    //if no user profiles exist
    if (Object.keys(userData).length === 0) {
        profileName.innerText = "n/a";
        profilePicture.src = defaultProfilePicture;
        profileEmail.innerText = "n/a@dlsu.edu.ph";
        profileDescription.innerText = "This user does not exist.";
    }
}



// --USER PROFILE EDIT-- //
const editProfile = document.querySelector('.edit-profile')

let isEditMode = false;

function toggleEditMode() {
    const profileName = document.getElementById('profile-name');
    const profilePicture = document.getElementById('profile-picture')
    const profileEmail = document.getElementById('profile-email')
    const profileDescription = document.getElementById('profile-description');

    isEditMode = !isEditMode;

    if (isEditMode) {
        profileName.contentEditable = true;
        profileDescription.contentEditable = true;
        editProfile.src = 'images/icons/save.png';
    } else {
        // disable edit
        profileName.contentEditable = false;
        profileDescription.contentEditable = false;
        editProfile.src = 'images/icons/edit.png';

        saveChangesToServer(profileEmail.textContent, profileName.textContent, profileDescription.textContent);
        updateProfile(profileEmail.textContent);
    }
}
 
editProfile.addEventListener('click', toggleEditMode);

var loadFile = function (event) {
    const profilePicture = document.getElementById("profile-picture");
    const profileEmail = document.getElementById("profile-email");
    var image = document.getElementById("output");
    profilePicture.src = URL.createObjectURL(event.target.files[0]);
    userData[profileEmail.textContent].pfpURL = profilePicture.src;
};

function saveChangesToServer(email, newName, newDescription) {
    //placeholder content
    console.log('Saving changes to the server:', newName, newDescription);
    userData[email].name = newName;
    userData[email].description = newDescription;
}

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
const searchInput = document.getElementById('user-search');

function clearSearchInput () {
    document.getElementById('user-search').value = "";
};

function searchForUser() {
    // fetch user input in the search bar
    const userInput = document.getElementById('user-search').value.trim().toLowerCase();;

    // filter data based on input
    const searchResults = Object.values(userData).filter(function (user) {
        return user.name.toLowerCase().includes(userInput);
    });

    // if only one result, update into that. if multiple, update into the closest match
    if (searchResults.length >= 1) {
        // call update profile
        updateProfile(searchResults[0].email)
    } else {
        updateProfile("n/a")
    }
}

//if user manually clicks search icon (user search)
searchUser.addEventListener('click', searchForUser);

searchInput.addEventListener('keypress', function (event) {
    //check if enter key is pressed
    if (event.key === 'Enter') {
        searchForUser();
    }
});

searchInput.addEventListener('input', function () {
    var input = this.value.toLowerCase();
    var suggestions = Object.values(userData);
    var autocompleteDiv = document.getElementById('autocomplete-user-search');

    //clear prev suggestion from prev searches
    autocompleteDiv.innerHTML = '';

    //filter -> display matching suggestions
    suggestions.filter(user => user.name.toLowerCase().includes(input)).forEach(function (user) {
        var div = document.createElement('div');
        div.classList.add('autocomplete-item');

        //suggestion pfp
        var img = document.createElement('img');
        img.src = user.pfpURL; //path to suggestion pfp
        img.alt = user.name;
        img.classList.add('autocomplete-img');
        div.appendChild(img);

        //suggestion name
        var span = document.createElement('span');
        span.textContent = user.name;
        div.appendChild(span);

        div.addEventListener('click', function () {
            //if user clicks suggestion, it will be retained in the input bar
            document.getElementById('user-search').value = user.name;
            updateProfile(user.email);
            autocompleteDiv.innerHTML = '';
        });

        autocompleteDiv.appendChild(div);   //add that div (user pfp + name)
    });

    //if user clicks away, removes display
    document.addEventListener("click", function (event) {
        if (!event.target.closest(".search-user")) {
            autocompleteDiv.innerHTML = '';
        }
    });
});

// --USER PROFILE DELETE-- //
const deleteProfileMenu = document.querySelector(".delete-profile-yesno");
const deleteProfile = document.querySelector(".delete-profile");
const deleteProfileProceed = document.querySelector("#yes-delete");
const deleteProfileCancel = document.querySelector("#no-delete");
const deleteProfileX = document.querySelector(".close-delete-profile-yesno")

deleteProfile.addEventListener('click', () => {
    deleteProfileMenu.classList.add('popup');
}); 
deleteProfileProceed.addEventListener('click', () => {
    const profileEmail = document.getElementById("profile-email");


    delete userData[profileEmail.textContent];
    deleteProfileMenu.classList.remove('popup');
    clearSearchInput();
    searchUser.dispatchEvent(new Event('click'));

    // window.location.assign('index.html'); //goes back to main dashboard
}); 

deleteProfileCancel.addEventListener('click', () => {
    deleteProfileMenu.classList.remove('popup');
}); 

deleteProfileX.addEventListener('click', () => {
    deleteProfileMenu.classList.remove('popup');
}); 



