// Script to fetch real events from Montgomery County chambers of commerce
// This script will be run by GitHub Actions to update events-data.json

const fs = require('fs');
const path = require('path');

// Event sources - URLs for chamber of commerce event calendars
const EVENT_SOURCES = {
    mccc: {
        name: 'Montgomery County Chamber of Commerce',
        url: 'https://web.mcccmd.com/events',
        chamber: 'montgomery-county'
    },
    ggcc: {
        name: 'Gaithersburg-Germantown Chamber of Commerce',
        url: 'https://www.ggchamber.org/',
        chamber: 'gaithersburg'
    },
    mdchamber: {
        name: 'Maryland Chamber of Commerce',
        url: 'https://www.mdchamber.org/events/',
        chamber: 'maryland'
    }
};

// Function to parse date string to YYYY-MM-DD format
function formatDate(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        return '';
    }
}

// Function to fetch events from MCCC (Montgomery County Chamber)
async function fetchMCCCEvents() {
    try {
        // Note: This is a placeholder - actual implementation would require
        // parsing HTML or using an API if available
        // For now, we'll return an empty array and log that scraping is needed
        console.log('MCCC events: HTML scraping required - not implemented yet');
        return [];
    } catch (error) {
        console.error('Error fetching MCCC events:', error.message);
        return [];
    }
}

// Function to fetch events from GGCC (Gaithersburg-Germantown Chamber)
async function fetchGGCCEvents() {
    try {
        console.log('GGCC events: HTML scraping required - not implemented yet');
        return [];
    } catch (error) {
        console.error('Error fetching GGCC events:', error.message);
        return [];
    }
}

// Function to fetch events from Maryland Chamber
async function fetchMarylandChamberEvents() {
    try {
        console.log('Maryland Chamber events: HTML scraping required - not implemented yet');
        return [];
    } catch (error) {
        console.error('Error fetching Maryland Chamber events:', error.message);
        return [];
    }
}

// Main function to fetch all events
async function fetchAllEvents() {
    console.log('Starting event fetch from chambers of commerce...');
    
    const allEvents = [];
    
    // Fetch from each source
    const mcccEvents = await fetchMCCCEvents();
    const ggccEvents = await fetchGGCCEvents();
    const mdChamberEvents = await fetchMarylandChamberEvents();
    
    // Combine all events
    allEvents.push(...mcccEvents);
    allEvents.push(...ggccEvents);
    allEvents.push(...mdChamberEvents);
    
    // Filter out events with invalid dates or past dates
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const validEvents = allEvents.filter(event => {
        if (!event.date) return false;
        const eventDate = new Date(event.date);
        if (isNaN(eventDate.getTime())) return false;
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= now;
    });
    
    // Sort by date
    validEvents.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });
    
    console.log(`Fetched ${validEvents.length} valid upcoming events`);
    
    return validEvents;
}

// Function to save events to JSON file
function saveEvents(events) {
    const data = {
        lastUpdated: new Date().toISOString(),
        events: events
    };
    
    const filePath = path.join(__dirname, '..', 'events-data.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Saved ${events.length} events to events-data.json`);
}

// Run the script
async function main() {
    try {
        const events = await fetchAllEvents();
        
        // If no events were fetched, keep existing events but update timestamp
        if (events.length === 0) {
            console.log('No new events fetched. Checking existing events...');
            const existingPath = path.join(__dirname, '..', 'events-data.json');
            if (fs.existsSync(existingPath)) {
                const existing = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
                if (existing.events && existing.events.length > 0) {
                    console.log('Keeping existing events');
                    existing.lastUpdated = new Date().toISOString();
                    fs.writeFileSync(existingPath, JSON.stringify(existing, null, 2));
                    return;
                }
            }
        }
        
        saveEvents(events);
    } catch (error) {
        console.error('Error in main:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { fetchAllEvents, formatDate };

