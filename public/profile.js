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
}