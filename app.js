// Event data structure and management
class EventManager {
    constructor() {
        this.events = [];
        this.filteredEvents = [];
        this.chambers = {
            'gaithersburg': 'Gaithersburg-Germantown Chamber of Commerce',
            'rockville': 'Rockville Chamber of Commerce',
            'bethesda': 'Bethesda-Chevy Chase Chamber of Commerce',
            'silver-spring': 'Silver Spring Chamber of Commerce',
            'montgomery-county': 'Montgomery County Chamber of Commerce',
            'maryland': 'Maryland Chamber of Commerce'
        };
        this.init();
    }

    // Initialize the event manager
    init() {
        this.setupEventListeners();
        this.loadEvents();
    }

    // Setup event listeners for filters and refresh button
    setupEventListeners() {
        const chamberFilter = document.getElementById('chamber-filter');
        const dateFilter = document.getElementById('date-filter');
        const refreshBtn = document.getElementById('refresh-btn');

        chamberFilter.addEventListener('change', () => this.applyFilters());
        dateFilter.addEventListener('change', () => this.applyFilters());
        refreshBtn.addEventListener('click', () => this.loadEvents());
    }

    // Load events from various sources
    async loadEvents() {
        const loadingEl = document.getElementById('loading');
        const errorEl = document.getElementById('error-message');
        const eventsSection = document.getElementById('events-section');
        
        loadingEl.style.display = 'block';
        errorEl.style.display = 'none';
        eventsSection.style.display = 'none';

        try {
            // Try to load from local data file first
            await this.loadFromDataFile();
            
            // Also try to fetch from chamber websites (if APIs available)
            await this.fetchFromChambers();
            
            // If no events loaded, use sample data
            if (this.events.length === 0) {
                console.log('No events loaded, loading sample events');
                this.loadSampleEvents();
            }

            console.log(`Total events loaded: ${this.events.length}`);
            this.applyFilters();
            loadingEl.style.display = 'none';
            eventsSection.style.display = 'block';
        } catch (error) {
            console.error('Error loading events:', error);
            loadingEl.style.display = 'none';
            errorEl.textContent = 'Unable to load events. Showing cached data.';
            errorEl.style.display = 'block';
            
            // Load sample events as fallback
            if (this.events.length === 0) {
                this.loadSampleEvents();
                this.applyFilters();
                eventsSection.style.display = 'block';
            }
        }
    }

    // Load events from local data file
    async loadFromDataFile() {
        try {
            const response = await fetch('events-data.json');
            if (response.ok) {
                const data = await response.json();
                if (data.events && Array.isArray(data.events) && data.events.length > 0) {
                    this.events = data.events.map(event => this.normalizeEvent(event));
                    console.log(`Loaded ${this.events.length} events from events-data.json`);
                } else {
                    console.log('events-data.json has no events, will use sample data');
                }
            } else {
                console.log('events-data.json not found or not accessible, will use sample data');
            }
        } catch (error) {
            console.log('Error loading events-data.json:', error.message);
            console.log('Will use sample data as fallback');
        }
    }

    // Fetch events from chamber websites
    async fetchFromChambers() {
        // Note: Most chambers don't have public APIs, so we'll use sample data
        // In production, you could use a backend service or GitHub Actions to scrape
        // and update the events-data.json file periodically
        
        // For now, we'll merge any new events found
        const fetchedEvents = await this.fetchGaithersburgEvents();
        if (fetchedEvents.length > 0) {
            // Merge with existing events, avoiding duplicates
            fetchedEvents.forEach(newEvent => {
                const exists = this.events.some(e => 
                    e.title === newEvent.title && 
                    e.date === newEvent.date
                );
                if (!exists) {
                    this.events.push(newEvent);
                }
            });
        }
    }

    // Fetch events from Gaithersburg Chamber (placeholder for API integration)
    async fetchGaithersburgEvents() {
        // This is a placeholder - in production, you would:
        // 1. Use a backend API that scrapes chamber websites
        // 2. Use GitHub Actions to periodically update events-data.json
        // 3. Use RSS feeds if chambers provide them
        
        // For now, return empty array - events will come from events-data.json
        return [];
    }

    // Load sample events for demonstration
    loadSampleEvents() {
        const now = new Date();
        const sampleEvents = [
            {
                title: 'Gaithersburg Business Networking Breakfast',
                chamber: 'gaithersburg',
                date: this.formatDate(this.addDays(now, 3)),
                time: '8:00 AM - 10:00 AM',
                location: 'Gaithersburg Marriott Washingtonian Center, 9751 Washingtonian Blvd, Gaithersburg, MD 20878',
                description: 'Join local business leaders for networking and breakfast. Meet potential clients and partners.',
                link: 'https://www.gaithersburgmd.gov'
            },
            {
                title: 'Rockville Chamber Monthly Mixer',
                chamber: 'rockville',
                date: this.formatDate(this.addDays(now, 7)),
                time: '5:30 PM - 7:30 PM',
                location: 'Rockville Town Square, 200 E Middle Ln, Rockville, MD 20850',
                description: 'Monthly networking mixer for Rockville Chamber members and guests.',
                link: 'https://www.rockvillemd.gov'
            },
            {
                title: 'Bethesda Business Expo',
                chamber: 'bethesda',
                date: this.formatDate(this.addDays(now, 10)),
                time: '10:00 AM - 4:00 PM',
                location: 'Bethesda North Marriott Hotel & Conference Center, 5701 Marinelli Rd, Bethesda, MD 20852',
                description: 'Annual business expo featuring local businesses, vendors, and networking opportunities.',
                link: 'https://www.bethesda.org'
            },
            {
                title: 'Silver Spring Small Business Workshop',
                chamber: 'silver-spring',
                date: this.formatDate(this.addDays(now, 5)),
                time: '2:00 PM - 4:00 PM',
                location: 'Silver Spring Civic Building, 1 Veterans Pl, Silver Spring, MD 20910',
                description: 'Workshop on small business growth strategies and resources available in Montgomery County.',
                link: 'https://www.silverspringdowntown.com'
            },
            {
                title: 'Gaithersburg Tech Meetup',
                chamber: 'gaithersburg',
                date: this.formatDate(this.addDays(now, 12)),
                time: '6:00 PM - 8:00 PM',
                location: 'Gaithersburg Innovation Center, 655 Quince Orchard Rd, Gaithersburg, MD 20878',
                description: 'Monthly meetup for tech professionals and entrepreneurs in the Gaithersburg area.',
                link: 'https://www.gaithersburgmd.gov'
            },
            {
                title: 'Rockville Women in Business Luncheon',
                chamber: 'rockville',
                date: this.formatDate(this.addDays(now, 14)),
                time: '12:00 PM - 2:00 PM',
                location: 'Rockville Country Club, 16001 Falls Rd, Rockville, MD 20854',
                description: 'Networking luncheon for women business owners and professionals.',
                link: 'https://www.rockvillemd.gov'
            }
        ];

        this.events = sampleEvents.map(event => this.normalizeEvent(event));
    }

    // Normalize event data to ensure consistent structure
    normalizeEvent(event) {
        return {
            title: event.title || 'Untitled Event',
            chamber: event.chamber || 'unknown',
            date: event.date || '',
            time: event.time || '',
            location: event.location || '',
            description: event.description || '',
            link: event.link || '#',
            _sample: event._sample || false // Track if event is sample data
        };
    }

    // Apply filters based on selected options
    applyFilters() {
        const chamberFilter = document.getElementById('chamber-filter').value;
        const dateFilter = document.getElementById('date-filter').value;

        this.filteredEvents = this.events.filter(event => {
            // Chamber filter
            if (chamberFilter !== 'all' && event.chamber !== chamberFilter) {
                return false;
            }

            // Date filter
            if (dateFilter !== 'all') {
                const eventDate = new Date(event.date);
                const now = new Date();
                now.setHours(0, 0, 0, 0);

                switch (dateFilter) {
                    case 'today':
                        const today = new Date(now);
                        if (eventDate.getTime() !== today.getTime()) {
                            return false;
                        }
                        break;
                    case 'week':
                        const weekFromNow = new Date(now);
                        weekFromNow.setDate(weekFromNow.getDate() + 7);
                        if (eventDate < now || eventDate > weekFromNow) {
                            return false;
                        }
                        break;
                    case 'month':
                        const monthFromNow = new Date(now);
                        monthFromNow.setMonth(monthFromNow.getMonth() + 1);
                        if (eventDate < now || eventDate > monthFromNow) {
                            return false;
                        }
                        break;
                }
            }

            // Only show future events
            const eventDate = new Date(event.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return eventDate >= today;
        });

        // Sort by date
        // Sort by date
        this.filteredEvents.sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
        });

        console.log(`Filtered events: ${this.filteredEvents.length} out of ${this.events.length} total`);
        this.renderEvents();
    }

    // Render events to the DOM
    renderEvents() {
        const eventsGrid = document.getElementById('events-grid');
        const emptyState = document.getElementById('empty-state');

        eventsGrid.innerHTML = '';

        if (this.filteredEvents.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        this.filteredEvents.forEach(event => {
            const eventCard = this.createEventCard(event);
            eventsGrid.appendChild(eventCard);
        });
    }

    // Create an event card element
    createEventCard(event) {
        const card = document.createElement('div');
        card.className = 'event-card';

        const chamberName = this.chambers[event.chamber] || 'Chamber of Commerce';

        card.innerHTML = `
            <h3 class="event-title">${this.escapeHtml(event.title)}</h3>
            <span class="event-chamber">${this.escapeHtml(chamberName)}</span>
            <div class="event-date">
                <span>📅</span>
                <span>${this.formatDisplayDate(event.date)}</span>
            </div>
            <div class="event-time">
                <span>🕐</span>
                <span>${this.escapeHtml(event.time)}</span>
            </div>
            <div class="event-location">
                <span>📍</span>
                <span>${this.escapeHtml(event.location)}</span>
            </div>
            <p class="event-description">${this.escapeHtml(event.description)}</p>
            <a href="${this.escapeHtml(event.link)}" target="_blank" rel="noopener noreferrer" class="event-link">
                Learn More →
            </a>
        `;

        return card;
    }

    // Utility: Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Utility: Format date for storage (YYYY-MM-DD)
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Utility: Format date for display
    formatDisplayDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
    }

    // Utility: Add days to a date
    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const eventManager = new EventManager();
    
    // Auto-refresh events every 30 minutes
    setInterval(() => {
        eventManager.loadEvents();
    }, 30 * 60 * 1000);
});

