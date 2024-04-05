
function reserveSlot(){
    // Get the selected radio button
    const selectedSlot = document.querySelector('input[name="slot"]:checked');
    // date
    const datePickerInput = document.getElementById("datePicker").value;
    // time slot
    const timeSlotDropdownSelect = document.querySelector("#timeSlotDropdown").value;
    const dateTimeString = `${datePickerInput} ${timeSlotDropdownSelect}`;

    // curr date + time
    const currentDateTime = new Date();
    const formattedDateTime = currentDateTime.toLocaleString();

    const loggedin = getCookie('user');

    if (loggedin == undefined) {
        alert("Please log-in before reserving.");
    } else {
        if (datePickerInput != "") {
            if (selectedSlot) {

                fetch('/reserve', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        Availability: false,
                        Slot: selectedSlot.id,
                        DateTimeRes: dateTimeString,
                        DateTimeReq: formattedDateTime
                        }) 
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to reserve');
                    }
                    // action after editing
                    viewPage('');
                    console.log("Reserved slot", selectedSlot.id, "with date and time:", timeSlotDropdownSelect);  
                })
                .catch(error => {
                    console.error('Error reserving:', error);
                });
                // Refresh the page
                    location.reload();
            } else {
                alert("Please select a slot before reserving.");
            }
        } else {
            alert("Please select a date before reserving.");
        }
    }
}

//helper to get cookie
function getCookie(cookieName) {
    // separate cookies (split)
    const cookies = document.cookie.split(';');

    // iterate then find cookie with name cookieName
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim(); // clean

        // check if starts w/ cookieName
        if (cookie.startsWith(cookieName + '=')) {
            // extract
            return cookie.substring(cookieName.length + 1);
        }
    }

    // If the cookie is not found, return null
    return null;
}