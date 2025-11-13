# FocusTrack AI - Quick Start Guide

Get up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

This will install:
- React & React DOM
- Chart.js for visualizations
- Webpack for building
- Tailwind CSS for styling
- All necessary dev dependencies

## Step 2: Build the Extension

### Development Build (with auto-rebuild on changes)
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

The extension will be built to the `dist/` folder.

## Step 3: Create Extension Icons

1. Open `create-icons.html` in your browser
2. Click "Download All Icons"
3. Save the 3 PNG files to `public/icons/` folder:
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`

**Optional**: Replace these with your own custom icons later!

## Step 4: Load Extension in Chrome

1. Open Chrome and go to: `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top right)
3. Click **"Load unpacked"**
4. Select the `dist` folder from this project
5. The extension should now appear in your toolbar!

## Step 5: Start Using FocusTrack AI

1. **Click the extension icon** to see your popup dashboard
2. **Browse normally** - tracking starts automatically!
3. **Click "Open Full Dashboard"** for detailed analytics
4. **Try a focus session** - choose 25, 45, or 60 minutes
5. **Block distracting sites** - click "Block This Site" on any page

## Optional: Set Up AI Insights

To enable AI-powered weekly reports and coaching:

1. Get an API key from [Anthropic Console](https://console.anthropic.com/)
2. Open the extension → Full Dashboard
3. Go to Settings
4. Enter your API key in "Anthropic API Key" field
5. Save

**Note**: AI features are optional. The extension works great without them!

## Common Issues & Solutions

### Build fails with module errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Extension not loading
- Make sure you selected the `dist` folder, not the project root
- Check that `npm run build` completed without errors
- Try disabling and re-enabling the extension

### Time tracking not working
- Check that the extension has permissions (chrome://extensions/)
- Look for errors in Chrome DevTools → Extensions → FocusTrack AI

### Charts not displaying
- Make sure all dependencies installed: `npm install`
- Rebuild: `npm run build`

## Development Workflow

1. Make changes to source files in `src/`
2. Run `npm run dev` to auto-rebuild on changes
3. Click the refresh icon on `chrome://extensions/` for your extension
4. Test your changes

## File Organization

```
src/
├── background/          # Service worker & tracking engine
│   ├── service-worker.js
│   ├── time-tracker.js
│   ├── blocker.js
│   └── storage-manager.js
├── popup/              # Quick popup view
│   ├── popup.html
│   └── popup.jsx
├── dashboard/          # Full analytics dashboard
│   ├── dashboard.html
│   └── dashboard.jsx
├── utils/              # Shared utilities
│   ├── categories.js   # 100+ pre-categorized sites
│   ├── analytics.js    # Productivity calculations
│   ├── api.js          # Claude API integration
│   └── storage-manager.js
└── styles/
    └── tailwind.css
```

## What Next?

### Customize Categories
1. Open full dashboard
2. Go to Settings → Categories
3. Add your frequently visited sites
4. Assign categories (Productive, Neutral, Distracting)

### Set Goals
1. Open full dashboard
2. Go to Goals section
3. Set daily productive time goal
4. Set distraction limits
5. Set site-specific limits

### Try Focus Sessions
1. Click extension icon
2. Choose session duration (25/45/60 min)
3. All distracting sites auto-block
4. Focus on your work!
5. Get notification when done

### Enable Nuclear Mode
For maximum focus, enable Nuclear Mode to block ALL distracting sites:
1. Open full dashboard
2. Toggle "Nuclear Mode" in settings
3. All sites categorized as "distracting" are blocked
4. Toggle off to disable

## Advanced Features

### Export Your Data
```
Dashboard → Export Data → Save JSON file
```

### Import Data
```
Dashboard → Settings → Import → Select JSON file
```

### Schedule Blocks
Block social media only during work hours:
1. Dashboard → Blocked Sites
2. Add domain (e.g., twitter.com)
3. Choose "Scheduled" block type
4. Set hours (e.g., 9am-5pm Monday-Friday)

### Time Limits
Allow limited access to sites:
1. Dashboard → Blocked Sites
2. Add domain (e.g., youtube.com)
3. Choose "Time Limit" block type
4. Set daily limit (e.g., 30 minutes)

## Need Help?

- Check the main [README.md](README.md) for full documentation
- Look for errors in Chrome DevTools
- Try rebuilding: `npm run build`
- Clear extension data and reinstall

## Pro Tips

1. **Use Focus Sessions** - Most productive feature!
2. **Check dashboard weekly** - Review your patterns
3. **Set realistic goals** - Start small, increase gradually
4. **Block incrementally** - Don't block everything at once
5. **Use scheduled blocks** - Block social media during work hours only

---

**You're all set!** Start tracking, stay focused, and boost your productivity! 🚀

For questions or issues, see the main README or check the code.
