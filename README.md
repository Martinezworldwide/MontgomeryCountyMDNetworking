# Montgomery County MD Networking App

A modern web application for discovering networking events and business opportunities in Montgomery County, Maryland and surrounding areas. The app pulls information from local chambers of commerce including Gaithersburg, Rockville, Bethesda, and Silver Spring.

## Features

- **Real-time Event Display**: View upcoming networking events from multiple chambers of commerce
- **Filter by Chamber**: Filter events by specific chamber (Gaithersburg, Rockville, Bethesda, Silver Spring)
- **Date Filtering**: Filter events by date range (Today, This Week, This Month)
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Auto-refresh**: Events automatically refresh every 30 minutes
- **GitHub Pages Ready**: Deploys easily to GitHub Pages

## Getting Started

### Local Development

1. Clone this repository:
```bash
git clone https://github.com/Martinezworldwide/MontgomeryCountyMDNetworking.git
cd MontgomeryCountyMDNetworking
```

2. Open `index.html` in a web browser or use a local server:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server
```

3. Navigate to `http://localhost:8000` in your browser

### Deploying to GitHub Pages

1. Push your code to a GitHub repository

2. Go to your repository settings on GitHub

3. Navigate to **Pages** in the left sidebar

4. Under **Source**, select the branch you want to deploy (usually `main` or `master`)

5. Select the root folder (`/`) as the source

6. Click **Save**

7. Your site will be available at `https://martinezworldwide.github.io/MontgomeryCountyMDNetworking/`

## Adding Real Events

### Current Status

The app currently uses sample/mock data. To add **real events** from actual chambers of commerce:

### Option 1: Manual Entry (Recommended for now)

1. Visit chamber websites to find real events:
   - [Montgomery County Chamber of Commerce](https://web.mcccmd.com/events)
   - [Gaithersburg-Germantown Chamber](https://www.ggchamber.org/)
   - [Maryland Chamber of Commerce](https://www.mdchamber.org/events/)

2. Edit `events-data.json` and add real events following the format:
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
      "description": "Real event description",
      "link": "https://event-registration-url.com"
    }
  ]
}
```

3. See `scripts/manual-event-entry.md` for detailed instructions

### Option 2: Automated Scraping (Future)

A GitHub Actions workflow is set up (`.github/workflows/update-events.yml`) to automatically update events. However, the scraping scripts need to be customized based on each website's HTML structure.

To implement automated scraping:
1. Analyze each chamber website's HTML structure
2. Update `scripts/fetch-events.js` with parsing logic
3. The workflow will run daily and update events automatically

## Supported Chambers

- **Gaithersburg-Germantown Chamber of Commerce**
- **Rockville Chamber of Commerce**
- **Bethesda-Chevy Chase Chamber of Commerce**
- **Silver Spring Chamber of Commerce**
- **Montgomery County Chamber of Commerce**

## File Structure

```
MontgomeryCountyMDNetworking/
├── index.html              # Main HTML file
├── styles.css              # CSS styling
├── app.js                  # JavaScript application logic
├── events-data.json        # Event data storage
├── package.json            # Node.js dependencies
├── scripts/
│   ├── fetch-events.js     # Event fetching script
│   └── manual-event-entry.md  # Manual entry guide
├── .github/
│   └── workflows/
│       ├── deploy.yml      # GitHub Pages deployment
│       └── update-events.yml  # Automated event updates
├── .nojekyll               # GitHub Pages configuration
└── README.md               # This file
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Technologies Used

- HTML5
- CSS3 (with CSS Grid and Flexbox)
- Vanilla JavaScript (ES6+)
- GitHub Pages for hosting
- GitHub Actions for automation

## Contributing

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available for use.

## Contact

For questions or suggestions, please open an issue on GitHub.
