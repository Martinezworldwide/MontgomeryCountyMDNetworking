# Manual Event Entry Guide

Since automated scraping requires analyzing each website's HTML structure, you can manually add real events from chamber websites.

## How to Add Real Events

### Step 1: Visit Chamber Websites

Visit these websites to find real events:

1. **Montgomery County Chamber of Commerce (MCCC)**
   - URL: https://web.mcccmd.com/events
   - Look for upcoming events and note: title, date, time, location, description

2. **Gaithersburg-Germantown Chamber of Commerce (GGCC)**
   - URL: https://www.ggchamber.org/
   - Check their events calendar

3. **Maryland Chamber of Commerce**
   - URL: https://www.mdchamber.org/events/
   - Browse upcoming events

4. **Rockville Chamber of Commerce**
   - Search for their website and events calendar

5. **Bethesda-Chevy Chase Chamber of Commerce**
   - Search for their website and events calendar

### Step 2: Edit events-data.json

Open `events-data.json` and add events in this format:

```json
{
  "lastUpdated": "2026-01-03T00:00:00Z",
  "events": [
    {
      "title": "Real Event Name",
      "chamber": "gaithersburg",
      "date": "2026-01-15",
      "time": "8:00 AM - 10:00 AM",
      "location": "Actual Event Location",
      "description": "Real event description from the chamber website",
      "link": "https://actual-event-registration-url.com"
    }
  ]
}
```

### Step 3: Chamber Values

Use these chamber values:
- `"gaithersburg"` - Gaithersburg-Germantown Chamber
- `"rockville"` - Rockville Chamber
- `"bethesda"` - Bethesda-Chevy Chase Chamber
- `"silver-spring"` - Silver Spring Chamber
- `"montgomery-county"` - Montgomery County Chamber

### Step 4: Date Format

Dates must be in `YYYY-MM-DD` format (e.g., `"2026-01-15"`)

### Step 5: Commit and Push

After adding events:
```bash
git add events-data.json
git commit -m "Add real events from chambers"
git push
```

## Automated Scraping (Future)

To implement automated scraping, you'll need to:

1. Analyze each website's HTML structure
2. Use a library like `cheerio` or `puppeteer` to parse HTML
3. Extract event data using CSS selectors or XPath
4. Handle rate limiting and respect robots.txt
5. Update the `fetch-events.js` script with actual parsing logic

