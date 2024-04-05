
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