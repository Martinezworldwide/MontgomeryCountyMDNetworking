// Script to fetch REAL events from Montgomery County chambers of commerce
// Uses web scraping to extract event data from chamber websites

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const cheerio = require('cheerio');

// Function to fetch HTML from a URL
function fetchHTML(url) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const protocol = urlObj.protocol === 'https:' ? https : http;
        
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        };
        
        protocol.get(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve(data);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Simple HTML parser using regex (basic implementation)
function parseEventsFromHTML(html, source) {
    const events = [];
    
    // Try to find event-like patterns in HTML
    // This is a basic implementation - would need customization per website
    
    // Look for date patterns (YYYY-MM-DD, MM/DD/YYYY, etc.)
    const datePatterns = [
        /(\d{4})-(\d{2})-(\d{2})/g,
        /(\d{1,2})\/(\d{1,2})\/(\d{4})/g,
        /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/gi
    ];
    
    // Look for event titles (usually in h2, h3, or strong tags)
    const titlePattern = /<(h2|h3|h4|strong)[^>]*>([^<]+)<\/\1>/gi;
    
    // Extract potential event information
    // Note: This is simplified - real implementation would need DOM parsing
    
    return events;
}

// Function to format date to YYYY-MM-DD
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

// Function to fetch events from MCCC
async function fetchMCCCEvents() {
    const events = [];
    try {
        console.log('Fetching events from Montgomery County Chamber of Commerce...');
        const html = await fetchHTML('https://web.mcccmd.com/events');
        const $ = cheerio.load(html);
        
        console.log('MCCC HTML fetched. Parsing events...');
        
        // Try different selectors to find events
        // Common patterns: .event, .event-item, .calendar-event, [data-event], etc.
        const selectors = [
            '.event',
            '.event-item',
            '.calendar-event',
            '[data-event]',
            '.event-list-item',
            'article.event',
            '.event-card'
        ];
        
        let eventElements = $();
        for (const selector of selectors) {
            eventElements = $(selector);
            if (eventElements.length > 0) {
                console.log(`Found events using selector: ${selector}`);
                break;
            }
        }
        
        // If no specific event selector found, try to find any list items or cards
        if (eventElements.length === 0) {
            eventElements = $('li, .card, .item, article').filter((i, el) => {
                const text = $(el).text().toLowerCase();
                return text.includes('event') || text.includes('january') || text.includes('february') || 
                       text.includes('march') || text.includes('april') || text.includes('may');
            });
        }
        
        eventElements.each((i, element) => {
            if (i >= 20) return false; // Limit to 20 events
            
            const $el = $(element);
            const text = $el.text();
            
            // Extract title - try h2, h3, h4, or first strong/link
            let title = $el.find('h2, h3, h4').first().text().trim() ||
                       $el.find('a').first().text().trim() ||
                       $el.find('strong').first().text().trim() ||
                       text.split('\n')[0].trim().substring(0, 100);
            
            // Extract date - look for date patterns
            let date = '';
            const dateText = text.match(/(\d{1,2}\/\d{1,2}\/\d{4})|(\d{4}-\d{2}-\d{2})|(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i);
            if (dateText) {
                date = formatDate(dateText[0]);
            }
            
            // Extract link
            let link = $el.find('a').first().attr('href') || '';
            if (link && !link.startsWith('http')) {
                link = link.startsWith('/') ? `https://web.mcccmd.com${link}` : `https://web.mcccmd.com/${link}`;
            } else if (!link) {
                link = 'https://web.mcccmd.com/events';
            }
            
            // Extract time
            const timeMatch = text.match(/(\d{1,2}:\d{2}\s*(AM|PM|am|pm))/i);
            const time = timeMatch ? timeMatch[0] : '';
            
            // Extract location
            const locationMatch = text.match(/(location|venue|at)[:\s]+([^\n]+)/i);
            const location = locationMatch ? locationMatch[2].trim().substring(0, 200) : '';
            
            // Extract description
            const description = $el.find('p').first().text().trim().substring(0, 300) || 
                              text.split('\n').slice(1, 3).join(' ').trim().substring(0, 300);
            
            if (title && date && title.length > 5) {
                events.push({
                    title: title.substring(0, 200),
                    chamber: 'montgomery-county',
                    date: date,
                    time: time,
                    location: location,
                    description: description,
                    link: link
                });
            }
        });
        
        console.log(`Found ${events.length} events from MCCC`);
    } catch (error) {
        console.error('Error fetching MCCC events:', error.message);
    }
    return events;
}

// Function to fetch events from GGCC
async function fetchGGCCEvents() {
    const events = [];
    try {
        console.log('Fetching events from Gaithersburg-Germantown Chamber of Commerce...');
        const html = await fetchHTML('https://www.ggchamber.org/');
        const $ = cheerio.load(html);
        
        console.log('GGCC HTML fetched. Parsing events...');
        
        // Try to find events page or events section
        // First try to find a link to events page
        const eventsLink = $('a[href*="event"], a[href*="calendar"]').first().attr('href');
        let eventsHTML = html;
        
        if (eventsLink && eventsLink.includes('event')) {
            try {
                const fullLink = eventsLink.startsWith('http') ? eventsLink : `https://www.ggchamber.org${eventsLink}`;
                eventsHTML = await fetchHTML(fullLink);
                $ = cheerio.load(eventsHTML);
            } catch (e) {
                console.log('Could not fetch events page, using homepage');
            }
        }
        
        // Similar parsing as MCCC
        const selectors = ['.event', '.event-item', '.calendar-event', '[data-event]', '.event-list-item', 'article.event'];
        let eventElements = $();
        for (const selector of selectors) {
            eventElements = $(selector);
            if (eventElements.length > 0) break;
        }
        
        if (eventElements.length === 0) {
            eventElements = $('li, .card, .item, article').filter((i, el) => {
                const text = $(el).text().toLowerCase();
                return text.includes('event') || /\d{1,2}\/\d{1,2}\/\d{4}/.test(text);
            });
        }
        
        eventElements.each((i, element) => {
            if (i >= 20) return false;
            
            const $el = $(element);
            const text = $el.text();
            
            let title = $el.find('h2, h3, h4').first().text().trim() ||
                       $el.find('a').first().text().trim() ||
                       $el.find('strong').first().text().trim() ||
                       text.split('\n')[0].trim().substring(0, 100);
            
            const dateText = text.match(/(\d{1,2}\/\d{1,2}\/\d{4})|(\d{4}-\d{2}-\d{2})|(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i);
            let date = dateText ? formatDate(dateText[0]) : '';
            
            let link = $el.find('a').first().attr('href') || '';
            if (link && !link.startsWith('http')) {
                link = link.startsWith('/') ? `https://www.ggchamber.org${link}` : `https://www.ggchamber.org/${link}`;
            } else if (!link) {
                link = 'https://www.ggchamber.org/';
            }
            
            const timeMatch = text.match(/(\d{1,2}:\d{2}\s*(AM|PM|am|pm))/i);
            const time = timeMatch ? timeMatch[0] : '';
            
            const locationMatch = text.match(/(location|venue|at)[:\s]+([^\n]+)/i);
            const location = locationMatch ? locationMatch[2].trim().substring(0, 200) : '';
            
            const description = $el.find('p').first().text().trim().substring(0, 300) || 
                              text.split('\n').slice(1, 3).join(' ').trim().substring(0, 300);
            
            if (title && date && title.length > 5) {
                events.push({
                    title: title.substring(0, 200),
                    chamber: 'gaithersburg',
                    date: date,
                    time: time,
                    location: location,
                    description: description,
                    link: link
                });
            }
        });
        
        console.log(`Found ${events.length} events from GGCC`);
    } catch (error) {
        console.error('Error fetching GGCC events:', error.message);
    }
    return events;
}

// Main function
async function main() {
    console.log('Starting real event fetch...');
    
    const allEvents = [];
    
    // Fetch from all sources
    const mcccEvents = await fetchMCCCEvents();
    const ggccEvents = await fetchGGCCEvents();
    
    allEvents.push(...mcccEvents);
    allEvents.push(...ggccEvents);
    
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
    
    // Remove duplicates
    const uniqueEvents = [];
    const seen = new Set();
    for (const event of validEvents) {
        const key = `${event.title}-${event.date}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueEvents.push(event);
        }
    }
    
    // Sort by date
    uniqueEvents.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });
    
    console.log(`Total valid upcoming events: ${uniqueEvents.length}`);
    
    // Save to file
    if (uniqueEvents.length > 0) {
        const data = {
            lastUpdated: new Date().toISOString(),
            events: uniqueEvents
        };
        
        const filePath = path.join(__dirname, '..', 'events-data.json');
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`Saved ${uniqueEvents.length} real events to events-data.json`);
    } else {
        console.log('No events found. Keeping existing events.');
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { fetchMCCCEvents, fetchGGCCEvents, formatDate };

