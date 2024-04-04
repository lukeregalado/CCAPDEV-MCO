
function reserveSlot(){
    // Get the selected radio button
    const selectedSlot = document.querySelector('input[name="slot"]:checked');
    console.log("Slot: ", selectedSlot.id);  
    if (selectedSlot) {
        // Do something with the selected slot if needed
         fetch('/reserve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                Availability: false,
                Slot: selectedSlot.id
                }) 
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to reserve');
            }
            // action after editing
            viewPage('');
        })
        .catch(error => {
            console.error('Error reserving:', error);
        });
        // Refresh the page
            location.reload();
    } else {
        alert("Please select a slot before reserving.");
    }
}