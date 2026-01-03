// REAL event scraper using Puppeteer to handle JavaScript-rendered content
// This will actually fetch real events from chamber websites

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

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

// Function to parse date from various formats
function parseDate(dateText) {
    if (!dateText) return '';
    
    // Try common date formats
    const formats = [
        /(\d{1,2})\/(\d{1,2})\/(\d{4})/,  // MM/DD/YYYY
        /(\d{4})-(\d{2})-(\d{2})/,        // YYYY-MM-DD
        /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/i,
        /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+(\d{1,2}),?\s+(\d{4})/i
    ];
    
    for (const format of formats) {
        const match = dateText.match(format);
        if (match) {
            return formatDate(match[0]);
        }
    }
    
    return '';
}

// Fetch real events from MCCC using Puppeteer
async function fetchMCCCEvents() {
    const events = [];
    let browser;
    
    try {
        console.log('Fetching REAL events from Montgomery County Chamber of Commerce...');
        browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        // Set a realistic user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        console.log('Loading MCCC events page...');
        await page.goto('https://web.mcccmd.com/events', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        // Wait for events to load (adjust selector based on actual page structure)
        await page.waitForTimeout(3000); // Give JavaScript time to render
        
        // Extract events from the page
        // We'll try multiple selectors to find events
        const eventData = await page.evaluate(() => {
            const events = [];
            
            // Try to find event elements - common patterns
            const selectors = [
                '.event',
                '.event-item',
                '.calendar-event',
                '[data-event]',
                '.event-list-item',
                'article.event',
                '.event-card',
                'tr.event-row',
                '.event-row',
                'div[class*="event"]'
            ];
            
            let eventElements = [];
            for (const selector of selectors) {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    eventElements = Array.from(elements);
                    console.log(`Found ${elements.length} events using selector: ${selector}`);
                    break;
                }
            }
            
            // If no specific selector found, try to find any elements with dates
            if (eventElements.length === 0) {
                const allElements = document.querySelectorAll('div, li, tr, article');
                eventElements = Array.from(allElements).filter(el => {
                    const text = el.textContent || '';
                    return (text.includes('AM') || text.includes('PM') || text.includes('Mixer') || 
                           text.includes('EXCELerator') || /\d{1,2}\/\d{1,2}\/\d{4}/.test(text));
                }).slice(0, 20);
            }
            
            eventElements.forEach((element, index) => {
                if (index >= 20) return; // Limit to 20 events
                
                const text = element.textContent || '';
                const innerHTML = element.innerHTML || '';
                
                // Extract title
                const titleEl = element.querySelector('h2, h3, h4, h5, .title, .event-title, a');
                let title = titleEl ? titleEl.textContent.trim() : '';
                if (!title) {
                    // Try to get first line of text
                    const lines = text.split('\n').filter(l => l.trim().length > 0);
                    title = lines[0] ? lines[0].trim().substring(0, 200) : '';
                }
                
                // Extract date
                const dateMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{4})|(\d{4}-\d{2}-\d{2})|(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}|(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2},?\s+\d{4}/i);
                const date = dateMatch ? dateMatch[0] : '';
                
                // Extract time
                const timeMatch = text.match(/(\d{1,2}:\d{2}\s*(AM|PM|am|pm))/i);
                const time = timeMatch ? timeMatch[0] : '';
                
                // Extract location
                const locationMatch = text.match(/(location|venue|at|where)[:\s]+([^\n]+)/i);
                let location = locationMatch ? locationMatch[2].trim().substring(0, 200) : '';
                
                // Extract link
                const linkEl = element.querySelector('a[href]');
                let link = linkEl ? linkEl.href : '';
                if (link && !link.startsWith('http')) {
                    link = link.startsWith('/') ? `https://web.mcccmd.com${link}` : `https://web.mcccmd.com/${link}`;
                } else if (!link) {
                    link = 'https://web.mcccmd.com/events';
                }
                
                // Extract description
                const descEl = element.querySelector('p, .description, .event-description');
                let description = descEl ? descEl.textContent.trim().substring(0, 300) : '';
                if (!description) {
                    const lines = text.split('\n').filter(l => l.trim().length > 10);
                    description = lines.slice(1, 3).join(' ').trim().substring(0, 300);
                }
                
                if (title && date && title.length > 5) {
                    events.push({
                        title: title.substring(0, 200),
                        date: date,
                        time: time,
                        location: location,
                        description: description,
                        link: link,
                        rawText: text.substring(0, 500) // For debugging
                    });
                }
            });
            
            return events;
        });
        
        // Process and format events
        for (const event of eventData) {
            const formattedDate = parseDate(event.date);
            if (formattedDate) {
                events.push({
                    title: event.title,
                    chamber: 'montgomery-county',
                    date: formattedDate,
                    time: event.time,
                    location: event.location,
                    description: event.description,
                    link: event.link
                });
            }
        }
        
        console.log(`Found ${events.length} real events from MCCC`);
        
    } catch (error) {
        console.error('Error fetching MCCC events:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
    
    return events;
}

// Fetch real events from GGCC
async function fetchGGCCEvents() {
    const events = [];
    let browser;
    
    try {
        console.log('Fetching REAL events from Gaithersburg-Germantown Chamber of Commerce...');
        browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        
        console.log('Loading GGCC website...');
        await page.goto('https://www.ggchamber.org/', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        await page.waitForTimeout(3000);
        
        // Try to find events page link and navigate to it
        const eventsLink = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a[href*="event"], a[href*="calendar"]'));
            return links.length > 0 ? links[0].href : null;
        });
        
        if (eventsLink && eventsLink.includes('event')) {
            console.log(`Navigating to events page: ${eventsLink}`);
            await page.goto(eventsLink, { waitUntil: 'networkidle2', timeout: 30000 });
            await page.waitForTimeout(3000);
        }
        
        // Extract events (similar logic to MCCC)
        const eventData = await page.evaluate(() => {
            const events = [];
            const selectors = ['.event', '.event-item', '.calendar-event', '[data-event]', '.event-list-item'];
            let eventElements = [];
            
            for (const selector of selectors) {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    eventElements = Array.from(elements);
                    break;
                }
            }
            
            if (eventElements.length === 0) {
                const allElements = document.querySelectorAll('div, li, article');
                eventElements = Array.from(allElements).filter(el => {
                    const text = el.textContent || '';
                    return text.includes('event') || /\d{1,2}\/\d{1,2}\/\d{4}/.test(text);
                }).slice(0, 20);
            }
            
            eventElements.forEach((element) => {
                const text = element.textContent || '';
                const titleEl = element.querySelector('h2, h3, h4, .title, a');
                const title = titleEl ? titleEl.textContent.trim() : text.split('\n')[0].trim().substring(0, 200);
                const dateMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{4})|(\d{4}-\d{2}-\d{2})/);
                const date = dateMatch ? dateMatch[0] : '';
                const timeMatch = text.match(/(\d{1,2}:\d{2}\s*(AM|PM))/i);
                const time = timeMatch ? timeMatch[0] : '';
                const linkEl = element.querySelector('a[href]');
                let link = linkEl ? linkEl.href : '';
                if (link && !link.startsWith('http')) {
                    link = `https://www.ggchamber.org${link.startsWith('/') ? link : '/' + link}`;
                } else if (!link) {
                    link = 'https://www.ggchamber.org/';
                }
                
                if (title && date && title.length > 5) {
                    events.push({ title, date, time, link });
                }
            });
            
            return events;
        });
        
        for (const event of eventData) {
            const formattedDate = parseDate(event.date);
            if (formattedDate) {
                events.push({
                    title: event.title,
                    chamber: 'gaithersburg',
                    date: formattedDate,
                    time: event.time,
                    location: '',
                    description: '',
                    link: event.link
                });
            }
        }
        
        console.log(`Found ${events.length} real events from GGCC`);
        
    } catch (error) {
        console.error('Error fetching GGCC events:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
    
    return events;
}

// Main function
async function main() {
    console.log('='.repeat(60));
    console.log('FETCHING REAL EVENTS FROM CHAMBERS OF COMMERCE');
    console.log('='.repeat(60));
    
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
        const key = `${event.title}-${event.date}`.toLowerCase();
        if (!seen.has(key)) {
            seen.add(key);
            uniqueEvents.push(event);
        }
    }
    
    // Sort by date
    uniqueEvents.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log(`TOTAL REAL EVENTS FOUND: ${uniqueEvents.length}`);
    console.log('='.repeat(60));
    
    if (uniqueEvents.length > 0) {
        uniqueEvents.forEach((event, i) => {
            console.log(`${i + 1}. ${event.title} - ${event.date} (${event.chamber})`);
        });
    }
    
    // Save to file
    if (uniqueEvents.length > 0) {
        const data = {
            lastUpdated: new Date().toISOString(),
            events: uniqueEvents
        };
        
        const filePath = path.join(__dirname, '..', 'events-data.json');
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`\n✅ Saved ${uniqueEvents.length} REAL events to events-data.json`);
    } else {
        console.log('\n⚠️  No events found. This could mean:');
        console.log('   1. The website structure changed');
        console.log('   2. There are no upcoming events');
        console.log('   3. Events are loaded differently than expected');
        console.log('\nKeeping existing events in events-data.json');
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { fetchMCCCEvents, fetchGGCCEvents, formatDate, parseDate };

