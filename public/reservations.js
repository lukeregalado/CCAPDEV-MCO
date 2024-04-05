
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


function filterReservations() {
    const roomDropdown = document.getElementById('roomSlotDropdown').value;
    const checkbox = document.querySelector('.availability').checked;
    // date
    const datePickerInput = document.getElementById("datePicker").value;
    // time slot
    const timeSlotDropdownSelect = document.querySelector("#timeSlotDropdown").value;
    
    console.log('Room dropdown value:', roomDropdown);
    console.log('Checkbox checked:', checkbox);
    console.log('Date picker value:', datePickerInput);
    console.log('Time slot dropdown value:', timeSlotDropdownSelect);

    fetch('/filterReservation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            Availability: checkbox,         //filter avail
            Date: datePickerInput,          //filter date
            Time: timeSlotDropdownSelect,   //filter time
            Room: roomDropdown              //filter room
        })
    })
    .then(response => {
        if (!response.ok) { //err
            throw new Error('Failed to filter reservations');
        }
        return response.json(); // parse json
    })
    .then(filteredReservations => {
        console.log("Reservations filtered successfully");
        //update table
        updateFilterReservations(filteredReservations)
    })
    .catch(error => {
        console.error('Error filtering reservations:', error);
    });
}

//helper
function updateFilterReservations(reservations) {
    const reservationTable = document.querySelector('#seatTable tbody');

    // clear previous reservations
    reservationTable.innerHTML = '';

    // check if reservations array is empty
    if (!Array.isArray(reservations) || reservations.length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.setAttribute('colspan', '4');
        emptyCell.textContent = 'No reservations found';
        emptyRow.appendChild(emptyCell);
        reservationTable.appendChild(emptyRow);
        return;
    } 

    // populate reservations
    reservations.forEach(reservation => {
        const reservationRow = document.createElement('tr');

        // create cells
        const seatNumCell = document.createElement('td');
        seatNumCell.textContent = reservation.Slot;
        reservationRow.appendChild(seatNumCell);

        const roomCell = document.createElement('td');
        roomCell.textContent = reservation.Room;
        reservationRow.appendChild(roomCell);

        const reserveeCell = document.createElement('td');
        reserveeCell.textContent = reservation.Reservee;
        reservationRow.appendChild(reserveeCell);

        const dtResCell = document.createElement('td');
        dtResCell.textContent = reservation.DateTimeRes;
        reservationRow.appendChild(dtResCell);

        // append row to table
        reservationTable.appendChild(reservationRow);
    });
}

