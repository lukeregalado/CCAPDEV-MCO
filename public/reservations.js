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

    const reservee = document.getElementById("names").value

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
                        DateTimeReq: formattedDateTime,
                        reservee: reservee
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
// function getCookie(cookieName) {
//     // separate cookies (split)
//     const cookies = document.cookie.split(';');

//     // iterate then find cookie with name cookieName
//     for (let i = 0; i < cookies.length; i++) {
//         const cookie = cookies[i].trim(); // clean

//         // check if starts w/ cookieName
//         if (cookie.startsWith(cookieName + '=')) {
//             // extract
//             return cookie.substring(cookieName.length + 1);
//         }
//     }

//     // If the cookie is not found, return null
//     return null;
// }

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  function filterReservations() {
    const roomDropdown = document.getElementById('roomSlotDropdown');
    var roomDropdownVal = "any";
    var checkboxVal = "";
    var datePickerInputVal = "";
    var timeSlotDropdownSelectVal = "";

    if (roomDropdown != null) {
        roomDropdownVal = roomDropdown.value;
    }

    const checkbox = document.querySelector('.availability');
    if (checkbox != null) {
        checkboxVal = checkbox.checked;
    }

    // date
    const datePickerInput = document.getElementById("datePicker");
    if (datePickerInput != null) {
        datePickerInputVal = datePickerInput.value;
    }

    // time slot
    const timeSlotDropdownSelect = document.querySelector("#timeSlotDropdown");
    if (timeSlotDropdownSelect != null) {
        timeSlotDropdownSelectVal = timeSlotDropdownSelect.value;
    }
    
    console.log('Room dropdown value:', roomDropdownVal);
    console.log('Checkbox checked:', checkboxVal);
    console.log('Date picker value:', datePickerInputVal);
    console.log('Time slot dropdown value:', timeSlotDropdownSelectVal);

    fetch('/filterReservation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            Availability: checkboxVal,         //filter avail
            Date: datePickerInputVal,          //filter date
            Time: timeSlotDropdownSelect,   //filter time
            Room: roomDropdownVal           //filter room
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

//runs when page is loaded
document.addEventListener('DOMContentLoaded', function() {
    filterReservations();
});

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

var reservationItemsDelete = document.querySelectorAll('.reservation-item-delete');

reservationItemsDelete.forEach(function(item){
    item.addEventListener('click', function(){
        var reservationId = this.id;    
        console.log(reservationId);
        var confirmation = confirm("Are you sure you want to delete this reservation?");

        if(confirmation){
            const arr = reservationId.split("=");
            console.log(arr);

            fetch('/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    Availability: true,
                    Slot: arr[0],
                    Room: arr[1],
                    Date: arr[2],
                    edit: false
                    }) 
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete');
                }
                // action after deleting
                viewPage('');
                console.log("Deleted slot", arr[0], "with date and time:", arr[2]);  
            })
            .catch(error => {
                console.error('Error deleting:', error);
            });
            // Refresh the page
                location.reload();
        }
    });
});

var reservationItemsEdit = document.querySelectorAll('.reservation-item-edit');

reservationItemsEdit.forEach(function(item){
    item.addEventListener('click', function(){
        var reservationId = this.id;    

        var confirmation = confirm("Are you sure you want to edit this reservation?");
        console.log("aaa");    
        if(confirmation){
            const arr = reservationId.split("=");
            console.log("dfg")
            
            console.log("asd")
            fetch('/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    Availability: true,
                    Slot: arr[0],
                    Room: arr[1],
                    Date: arr[2],
                    edit: true
                    }) 
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to edit');
                }
                // action after editing
                viewPage('editslot');
                console.log("Edited slot", arr[0], "with date and time:", arr[2]);  
            })
            .catch(error => {
                console.error('Error editing:', error);
            });
        }
    });
});

function viewPage(page) {
    window.location.href = "/" + page;
}