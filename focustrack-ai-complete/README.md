# FocusTrack AI - Complete Edition 🚀

> Complete AI-powered productivity tracker with website blocking, goals, insights, and analytics

## 🎉 What's Included

This is the **COMPLETE** version of FocusTrack AI with ALL features fully implemented:

### ✅ Core Features
- **Automatic Time Tracking** - Tracks all websites in real-time
- **Smart Categorization** - 100+ pre-categorized sites (Productive/Neutral/Distracting)
- **Idle Detection** - Pauses tracking after 5 minutes of inactivity
- **Productivity Score** - Real-time calculation based on your activity
- **Focus Sessions** - Pomodoro timers (25/45/60 minutes)
- **Break Timers** - 5/15 minute break tracking

### 🚫 Website Blocking
- **Always Block** - Permanently block distracting sites
- **Scheduled Blocks** - Block sites during specific days/times (e.g., Mon-Fri 9am-5pm)
- **Time Limit Blocks** - Set daily time limits (e.g., 30 min YouTube per day)
- **Nuclear Mode** - One-click block all distracting sites
- **Block Management UI** - Easy interface to add/remove/toggle blocks

### 🎯 Goals & Alerts
- **Productive Time Goals** - Set daily productive time targets
- **Distraction Limits** - Set maximum distraction time
- **Site-Specific Limits** - Limit time on specific websites
- **Real-time Notifications** - Get alerts for goal progress
- **Achievement Notifications** - Celebrate when you hit your goals

### ⚙️ Complete Settings Page
- **General Settings** - Idle timeout, dark mode, notifications
- **Block Management** - Full UI for managing blocked sites
- **Goals Management** - Create, edit, pause, and delete goals
- **Category Management** - Customize site categories
- **Data Export/Import** - Export to JSON/CSV, import data
- **Privacy Controls** - Exclude domains from tracking
- **Reset All Data** - Nuclear option to start fresh

### 📊 Enhanced Dashboard with Chart.js
- **Pie Chart** - Visual breakdown by category
- **Bar Chart** - Top 10 sites ranked by time
- **Line Chart** - Hourly activity breakdown
- **Date Range Selector** - View today, last 7 days, or last 30 days
- **Detailed Table** - Complete site breakdown with percentages

---

## 📦 Installation

### Step 1: Generate Icons (One-Time Setup)
1. Open `focustrack-ai-complete/icons/GENERATE-ICONS.html` in Chrome
2. Click "Download All Icons" button
3. Save all 3 PNG files to `focustrack-ai-complete/icons/` folder

### Step 2: Load Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `focustrack-ai-complete/` folder
5. Done! ✅

### Step 3: Start Using
1. Click the extension icon in your toolbar
2. Browse normally - tracking starts automatically
3. View stats in the popup
4. Click "⚙️ Settings" to configure blocking and goals
5. Click "📊 Dashboard" to see detailed analytics

---

## 🎮 How to Use

### Basic Usage
- **Just browse!** The extension automatically tracks all your activity
- Click the extension icon to see today's stats
- View your productivity score in real-time

### Start a Focus Session
1. Click extension icon
2. Choose 25, 45, or 60 minutes
3. Focus session begins - distracting sites are blocked
4. Get notified when complete

### Block a Distracting Site
1. Click extension icon → "⚙️ Settings"
2. Go to "Website Blocking" tab
3. Enter domain (e.g., `facebook.com`)
4. Choose block type:
   - **Always Block** - Blocked 24/7
   - **Scheduled Block** - Block during work hours
   - **Time Limit** - Allow X minutes per day
5. Click "Add Block"

### Set a Goal
1. Click extension icon → "⚙️ Settings"
2. Go to "Goals & Alerts" tab
3. Choose goal type:
   - **Productive Time Goal** - e.g., 4 hours of productive time
   - **Distraction Limit** - e.g., max 1 hour on distracting sites
   - **Site Limit** - e.g., max 30 min on YouTube
4. Set target/limit
5. Click "Create Goal"
6. You'll get notifications as you make progress!

### View Analytics
1. Click extension icon → "📊 Dashboard"
2. See beautiful charts and graphs
3. Switch between Today/Week/Month views
4. Analyze your productivity patterns

### Export Your Data
1. Click extension icon → "⚙️ Settings"
2. Go to "Data & Privacy" tab
3. Click "Export as JSON" or "Export as CSV"
4. Your data is downloaded instantly

---

## 🏗️ Architecture

### Files Structure
```
focustrack-ai-complete/
├── manifest.json                   # Extension configuration
├── background/
│   └── service-worker.js          # Core tracking engine (318 lines)
├── popup/
│   ├── popup.html                 # Extension popup UI
│   └── popup.js                   # Popup logic
├── dashboard/
│   ├── dashboard.html             # Full dashboard with charts
│   └── dashboard.js               # Chart.js integration (414 lines)
├── settings/
│   ├── settings.html              # Complete settings page
│   ├── settings.js                # Settings management (600+ lines)
│   └── settings.css               # Professional styling
├── blocked.html                   # Block page shown when site is blocked
└── icons/
    ├── GENERATE-ICONS.html        # Icon generator
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### Key Technologies
- **Manifest V3** - Latest Chrome extension standard
- **IndexedDB** - Unlimited local storage for tracking data
- **Chart.js 4.4.0** - Beautiful charts and graphs
- **Chrome APIs**: tabs, storage, alarms, notifications, idle, webNavigation
- **Pure JavaScript** - No build process, no dependencies

---

## 🔒 Privacy

- **100% Local** - All data stored locally in IndexedDB
- **No Tracking** - No analytics, no telemetry, no data collection
- **No Cloud** - No data sent to external servers
- **Open Source** - All code is visible and auditable
- **Your Data** - Export anytime, delete anytime

---

## 📈 What Gets Tracked

### Automatically Tracked:
- Domain visited
- Time spent on each domain
- Category (productive/distracting/neutral)
- Timestamp of each session

### NOT Tracked:
- Page titles (except current session)
- URLs (except current domain)
- Form inputs
- Passwords
- Incognito tabs (unless you enable it in settings)
- Anything on `chrome://` pages

---

## 🐛 Troubleshooting

### Extension not tracking?
1. Reload the extension at `chrome://extensions/`
2. Check console for errors (right-click icon → Inspect popup)
3. Make sure you're not on a `chrome://` page

### Charts not showing?
1. Make sure you have some tracked data first
2. Check browser console for Chart.js errors
3. Verify internet connection (Chart.js loads from CDN)

### Blocks not working?
1. Go to Settings → Website Blocking
2. Verify the site is in the blocked list
3. Check if the block is enabled (toggle should be blue)
4. Reload the extension

### Goals not notifying?
1. Check Settings → General → Enable Notifications
2. Check Chrome notification permissions
3. Make sure you have enough activity to trigger the goal

---

## 💡 Tips for Productivity

1. **Set Morning Goals** - Define your productive time goal at the start of each day
2. **Use Scheduled Blocks** - Block distractions during your peak productivity hours
3. **Track Patterns** - Use the hourly chart to identify your most productive times
4. **Celebrate Wins** - Enable notifications to celebrate when you hit goals
5. **Weekly Reviews** - Check "Last 7 Days" view every Monday to plan your week

---

## 📊 Statistics

- **Total Features:** 40+
- **Total Files:** 10
- **Total Lines of Code:** ~2,000
- **Build Process:** None! Upload-ready
- **External Dependencies:** Chart.js CDN only
- **Storage:** Unlimited (IndexedDB)
- **Permissions:** 8 (minimal required)

---

## 🎉 What's New in Complete Edition

### New Features:
- ✅ Complete website blocking system (all 3 block types)
- ✅ Nuclear mode toggle
- ✅ Goals & alerts with notifications
- ✅ Complete settings page (5 tabs)
- ✅ Chart.js visualizations (3 charts)
- ✅ Date range selector (today/week/month)
- ✅ Data export (JSON + CSV)
- ✅ Category management UI
- ✅ Block management UI
- ✅ Goal management UI
- ✅ Break timers with notifications
- ✅ Hourly activity breakdown
- ✅ Privacy controls

### Enhanced:
- 📈 Dashboard now has beautiful charts
- 🎯 Popup shows settings button
- 🔧 Service worker handles all blocking logic
- 💾 Export/import functionality
- 🔔 Rich notifications for all events

---

**Built with ❤️ for productivity enthusiasts**

**No build process • No dependencies • 100% local • Privacy-focused**
