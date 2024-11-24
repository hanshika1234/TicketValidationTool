const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Parser } = require('json2csv');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Helper function to read CSV
function readCSV(filePath, callback) {
    const results = [];
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => callback(results))
        .on('error', (error) => console.error('Error reading CSV:', error));
}

// Load CSV data
let ticketsData = [];
let contentsData = [];

readCSV(path.join(__dirname, 'data', 'tickets.csv'), (data) => {
    ticketsData = data;
    console.log('Tickets data loaded.');
});

readCSV(path.join(__dirname, 'data', 'contents.csv'), (data) => {
    contentsData = data;
    console.log('Contents data loaded.');
});

// Serve combined ticket data
app.get('/tickets', (req, res) => {
    if (!ticketsData.length || !contentsData.length) {
        return res.status(500).json({ error: 'Data not loaded yet.' });
    }

    const combinedData = ticketsData.map((ticket, index) => {
        const content = contentsData[index];
        return {
            Absender: content?.Absender || 'N/A',
            KategorieID: ticket['Kategorie ID'],
            Unterkategorietext: ticket.Unterkategorietext,
            Text: content?.Text || 'N/A',
            TicketLabel: ticket['Ticket Label'],
            AbteilungLabel: ticket['Abteilung Label'],
            ProduktLabel: ticket['Produkt Label'],
        };
    });

    res.json(combinedData);
});

// Handle user responses
let responses = [];
app.post('/response', (req, res) => {
    responses.push(req.body);
    res.json({ message: 'Response saved.' });
});

// Download responses as CSV
app.get('/download-responses', (req, res) => {
    const json2csvParser = new Parser();
    const csvData = json2csvParser.parse(responses);

    res.header('Content-Type', 'text/csv');
    res.attachment('responses.csv');
    res.send(csvData);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});