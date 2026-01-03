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
git clone <your-repo-url>
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

7. Your site will be available at `https://<your-username>.github.io/MontgomeryCountyMDNetworking/`

## Updating Events

Events are stored in `events-data.json`. To update events:

1. Edit `events-data.json` with new event information
2. Follow the existing JSON structure:
```json
{
  "lastUpdated": "2024-01-01T00:00:00Z",
  "events": [
    {
      "title": "Event Name",
      "chamber": "gaithersburg",
      "date": "2024-01-15",
      "time": "8:00 AM - 10:00 AM",
      "location": "Event Location",
      "description": "Event description",
      "link": "https://event-link.com"
    }
  ]
}
```

3. Commit and push changes to GitHub

### Automated Event Updates (Optional)

For automated event updates, you can set up a GitHub Actions workflow to periodically scrape chamber websites and update `events-data.json`. This requires:

- A backend service or scraping script
- GitHub Actions workflow file (`.github/workflows/update-events.yml`)
- Proper handling of CORS and API limitations

## Supported Chambers

- **Gaithersburg Chamber of Commerce**
- **Rockville Chamber of Commerce**
- **Bethesda-Chevy Chase Chamber of Commerce**
- **Silver Spring Chamber of Commerce**

## File Structure

```
MontgomeryCountyMDNetworking/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── app.js              # JavaScript application logic
├── events-data.json    # Event data storage
├── .nojekyll           # GitHub Pages configuration
└── README.md           # This file
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

