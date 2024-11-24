let currentTicketIndex = 0;
let tickets = [];

// Load tickets from the backend
function loadTickets() {
    fetch('http://localhost:3000/tickets')
        .then(response => response.json())
        .then(data => {
            tickets = data;
            if (tickets.length > 0) {
                displayTicket(tickets[currentTicketIndex]);
            } else {
                document.getElementById('ticket-meta').innerHTML = '<p>No tickets available.</p>';
            }
        })
        .catch(error => console.error('Error fetching tickets:', error));
}

// Display a ticket
function displayTicket(ticket) {
    document.getElementById('ticket-meta').innerHTML = `
        <p><strong>Ticket Creator:</strong> ${ticket.Absender}</p>
        <p><strong>Category:</strong> ${ticket.KategorieID}</p>
        <p><strong>Subcategory:</strong> ${ticket.Unterkategorietext}</p>
    `;
    document.getElementById('initial-communication').innerHTML = `
        <p>${ticket.Text}</p>
    `;
    document.getElementById('validation-question').innerHTML = `
        <p>Is this classification correct?</p>
        <p><strong>Ticket Label:</strong> ${ticket.TicketLabel}</p>
        <p><strong>Abteilung Label:</strong> ${ticket.AbteilungLabel}</p>
        <p><strong>Produkt Label:</strong> ${ticket.ProduktLabel}</p>
    `;
}

// Submit response
function submitResponse(response) {
    const ticketResponse = {
        ticketIndex: currentTicketIndex,
        response,
    };

    fetch('http://localhost:3000/response', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketResponse),
    }).catch(error => console.error('Error submitting response:', error));

    currentTicketIndex++;
    if (currentTicketIndex < tickets.length) {
        displayTicket(tickets[currentTicketIndex]);
    } else {
        alert('All tickets reviewed!');
    }
}

// Download responses
function downloadResponses() {
    fetch('http://localhost:3000/download-responses')
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'responses.csv';
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => console.error('Error downloading responses:', error));
}

// Initialize
window.onload = loadTickets;
