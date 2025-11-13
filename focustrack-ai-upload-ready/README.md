# FocusTrack AI - Upload-Ready Version

This is a **ready-to-upload** version of FocusTrack AI that requires **NO build steps**!

## Installation (2 Simple Steps!)

### Step 1: Generate Icons

1. Open `icons/generate-icons.html` in any web browser
2. Click "Download All Icons"
3. Save the 3 PNG files into the `icons/` folder

### Step 2: Load Extension in Chrome

1. Open Chrome and go to: `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top right)
3. Click **"Load unpacked"**
4. Select this entire `focustrack-ai-upload-ready` folder
5. Done! The extension is now active 🎉

## Features

✅ **Automatic Time Tracking** - Tracks every website you visit
✅ **100+ Pre-categorized Websites** - Productive, Distracting, Neutral
✅ **Website Blocking** - Block distracting sites permanently or on schedule
✅ **Focus Sessions** - 25/45/60 minute Pomodoro timers with auto-blocking
✅ **Beautiful Dashboard** - Charts and analytics powered by Chart.js
✅ **Productivity Score** - See your daily productivity percentage
✅ **No Build Required** - Pure JavaScript, works immediately!

## How to Use

### Track Time Automatically
Just browse normally - the extension tracks everything automatically!

### View Stats
Click the extension icon in your toolbar to see:
- Today's productivity score
- Time spent on productive vs distracting sites
- Top 5 sites visited
- Current website tracking

### Block Distracting Sites
1. Visit a distracting site
2. Click extension icon
3. Click "Block This Site"
4. The site is now blocked!

### Start a Focus Session
1. Click extension icon
2. Choose duration (25, 45, or 60 minutes)
3. All distracting sites are auto-blocked during the session
4. Get a notification when you're done!

### View Full Analytics
1. Click extension icon
2. Click "Open Full Dashboard"
3. See detailed charts:
   - Pie chart: Time by category
   - Bar chart: Top 10 sites
   - Line chart: Hourly breakdown
   - Table: Detailed site list

## File Structure

```
focustrack-ai-upload-ready/
├── manifest.json           # Extension configuration
├── background/
│   └── service-worker.js   # Main tracking engine
├── popup/
│   ├── popup.html          # Popup UI
│   ├── popup.js            # Popup logic
├── dashboard/
│   ├── dashboard.html      # Full dashboard
│   └── dashboard.js        # Dashboard logic
├── utils/
│   ├── categories.js       # 100+ categorized sites
│   └── storage.js          # IndexedDB storage
├── styles/
│   ├── popup.css           # Popup styles
│   └── dashboard.css       # Dashboard styles
├── icons/
│   └── generate-icons.html # Icon generator
└── blocked.html            # Beautiful block page
```

## Technical Details

- **Manifest V3**: Latest Chrome extension standard
- **Pure JavaScript**: No framework dependencies
- **Chart.js CDN**: Loaded via CDN for charts
- **IndexedDB**: Unlimited local storage
- **Module ES6**: Uses modern JavaScript modules

## Privacy

- 100% local - all data stored on your device
- No external servers (except Chart.js CDN)
- No telemetry or tracking
- Open source - audit the code yourself!

## Troubleshooting

### Extension not loading?
- Make sure you selected the entire folder, not just manifest.json
- Check that icons are generated and in the `icons/` folder
- Try disabling and re-enabling the extension

### Time tracking not working?
- Check extension permissions in `chrome://extensions/`
- Make sure the extension is enabled
- Check browser console for errors

### Icons missing?
- Open `icons/generate-icons.html` in a browser
- Download the 3 PNG files
- Place them in the `icons/` folder
- Reload the extension

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the code in the files
3. Check Chrome DevTools console for errors

## Credits

Built with vanilla JavaScript and Chart.js.

---

**That's it! No npm, no webpack, no build steps. Just load and go!** 🚀
