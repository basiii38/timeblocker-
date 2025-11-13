# 🚀 FocusTrack AI - Install Instructions

## ⚡ UPLOAD-READY VERSION (NO BUILD REQUIRED!)

The extension is in the `focustrack-ai-upload-ready/` folder - **ready to upload directly to Chrome!**

---

## 📦 Installation Steps (2 Minutes!)

### Step 1: Generate Icons

1. Navigate to: `focustrack-ai-upload-ready/icons/`
2. Open `generate-icons.html` in any web browser
3. Click the "Download All Icons" button
4. Save all 3 PNG files (`icon16.png`, `icon48.png`, `icon128.png`) into the same `icons/` folder

### Step 2: Load Extension in Chrome

1. Open Chrome browser
2. Go to: `chrome://extensions/`
3. Enable **"Developer mode"** (toggle switch in top-right corner)
4. Click **"Load unpacked"** button
5. Select the entire `focustrack-ai-upload-ready` folder
6. ✅ **Done! Your extension is now active!**

---

## 📥 Alternative: Use the ZIP File

A pre-packaged ZIP file is available at: `focustrack-ai-upload-ready.zip`

1. Extract the ZIP file
2. Follow "Step 1" and "Step 2" above

---

## ✨ What You Get

### Core Features:
- ✅ **Automatic Time Tracking** - Tracks every website automatically
- ✅ **100+ Pre-categorized Sites** - Productive, Distracting, Neutral
- ✅ **Website Blocking** - Block sites permanently or on schedule
- ✅ **Focus Sessions (Pomodoro)** - 25/45/60 minute timers with auto-blocking
- ✅ **Beautiful Dashboard** - Charts powered by Chart.js
- ✅ **Productivity Score** - Daily productivity percentage
- ✅ **IndexedDB Storage** - Unlimited data capacity

### User Interface:
- **Popup Dashboard** - Quick stats in toolbar
- **Full Dashboard** - Comprehensive analytics with charts
- **Block Page** - Beautiful motivational quotes when sites are blocked

---

## 📁 Folder Structure

```
focustrack-ai-upload-ready/
├── manifest.json              # Extension configuration
├── README.md                  # User documentation
│
├── background/
│   └── service-worker.js      # Main tracking engine
│
├── popup/
│   ├── popup.html             # Popup interface
│   └── popup.js               # Popup logic
│
├── dashboard/
│   ├── dashboard.html         # Full dashboard
│   └── dashboard.js           # Dashboard with Chart.js
│
├── utils/
│   ├── categories.js          # 100+ categorized websites
│   └── storage.js             # IndexedDB manager
│
├── styles/
│   ├── popup.css              # Popup styles
│   └── dashboard.css          # Dashboard styles
│
├── icons/
│   └── generate-icons.html    # Icon generator tool
│
└── blocked.html               # Beautiful block page
```

---

## 🎯 Quick Start Guide

### View Your Stats
1. Click the extension icon in your Chrome toolbar
2. See today's productivity score, time breakdown, and top sites
3. Click "Open Full Dashboard" for detailed analytics

### Block a Distracting Site
1. While on any website, click the extension icon
2. Click "Block This Site"
3. The site will be blocked immediately

### Start a Focus Session
1. Click the extension icon
2. Choose duration: 25, 45, or 60 minutes
3. All distracting sites are automatically blocked
4. Get a notification when the session ends

### View Analytics
1. Click extension icon → "Open Full Dashboard"
2. View charts:
   - **Pie Chart**: Time by category
   - **Bar Chart**: Top 10 sites
   - **Line Chart**: Hourly breakdown
3. Switch between Today/Week/Month views

---

## 🛠️ Technical Details

### No Build Process!
- **Pure JavaScript** - No React, no Webpack, no npm install needed
- **Manifest V3** - Latest Chrome extension standard
- **Chart.js via CDN** - Charts loaded from CDN
- **ES6 Modules** - Modern JavaScript with imports/exports
- **IndexedDB** - Unlimited local storage

### Browser Compatibility:
- ✅ Chrome (fully supported)
- ✅ Edge (Chromium-based)
- ✅ Brave
- ✅ Opera (Chromium-based)

---

## 🔒 Privacy

- **100% Local** - All data stored on your device
- **No External Servers** - Except Chart.js CDN for visualizations
- **No Telemetry** - Zero tracking or analytics
- **No Account Required** - Works offline
- **Open Source** - Audit the code yourself!

---

## ❓ Troubleshooting

### Extension not loading?
- Make sure you selected the **entire folder**, not just `manifest.json`
- Verify icons are in the `icons/` folder
- Try disabling and re-enabling in `chrome://extensions/`

### Time tracking not working?
- Check permissions in `chrome://extensions/`
- Make sure extension is enabled (toggle switch)
- Check browser console (F12) for errors

### Icons showing as broken images?
- Open `icons/generate-icons.html` in browser
- Download all 3 PNG files
- Save them in the `icons/` folder
- Click refresh icon in `chrome://extensions/`

### Charts not displaying?
- Make sure you have internet connection (Chart.js loads from CDN)
- Check browser console for errors
- Try refreshing the dashboard page

---

## 📊 File Sizes

- **Total Extension Size**: ~20 KB
- **No Dependencies**: Everything is self-contained
- **Fast Load Times**: Vanilla JavaScript loads instantly

---

## 🎓 How It Works

1. **Time Tracking**:
   - Monitors active tab using `chrome.tabs` API
   - Detects idle state using `chrome.idle` API
   - Saves data every 30 seconds to IndexedDB
   - Categorizes websites automatically

2. **Website Blocking**:
   - Uses `chrome.webNavigation` API
   - Redirects blocked sites to custom page
   - Supports scheduled and time-limit blocks

3. **Focus Sessions**:
   - Uses `chrome.alarms` API for timers
   - Temporarily blocks distracting sites
   - Sends `chrome.notifications` when complete

---

## 💡 Pro Tips

1. **Check your dashboard weekly** to identify patterns
2. **Use focus sessions** for important work
3. **Block incrementally** - don't block everything at once
4. **Set realistic goals** - start small, increase gradually
5. **Schedule blocks** - block social media only during work hours

---

## 📝 Version Information

- **Version**: 1.0.0
- **Manifest**: V3
- **Last Updated**: 2024

---

## 🎉 You're All Set!

Your extension is now ready to help you:
- 📈 Track your productivity
- 🚫 Block distractions
- ⏱️ Focus with Pomodoro sessions
- 📊 Analyze your habits

**Start browsing and watch your productivity soar!** 🚀

For detailed documentation, see `focustrack-ai-upload-ready/README.md`
