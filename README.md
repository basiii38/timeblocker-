# FocusTrack AI

An AI-powered productivity tracker and website blocker for Chrome - combining the best of RescueTime and Freedom with intelligent AI insights powered by Claude.

## Features

### 🕐 Automatic Time Tracking
- Real-time tracking of time spent on every website
- Automatic idle detection (pauses after 5 minutes of inactivity)
- Multi-window support (tracks only focused window)
- Unlimited storage using IndexedDB
- Data saved every 30 seconds to prevent loss

### 🏷️ Smart Website Categorization
- Pre-populated with 100+ common websites
- Auto-categorize into: Productive (green), Neutral (yellow), Distracting (red)
- Manually customize categories
- Create custom categories for specific workflows

### 🚫 Powerful Website Blocking
- **Always Block**: Permanently block distracting sites
- **Scheduled Block**: Block sites during specific hours (e.g., social media 9am-5pm)
- **Time Limit Block**: Allow limited time per day (e.g., 30 min YouTube)
- **Nuclear Mode**: One-click block all distracting sites
- **Focus Mode**: Automatic blocking during Pomodoro sessions
- Beautiful block page with motivational quotes
- 5-minute break option for temporary unblocking

### 📊 Comprehensive Dashboard
- **Popup Dashboard**: Quick stats and actions in your toolbar
- **Full Dashboard**: Detailed analytics with beautiful charts
  - Productivity score (0-100)
  - Time breakdown by category (pie chart)
  - Top sites visited (bar chart)
  - Hourly timeline (line chart)
  - Daily/Weekly/Monthly views

### 🎯 Focus Sessions (Pomodoro)
- Quick-start timers: 25, 45, or 60 minutes
- Auto-blocks distracting sites during sessions
- Desktop notifications when complete
- Track completed sessions per day

### 🎯 Goals & Alerts
- Set daily productive time goals
- Set distraction time limits
- Site-specific time limits
- Real-time notifications:
  - Progress updates ("Halfway to your goal!")
  - Time limit warnings
  - Daily summaries

### 🤖 AI Insights (Powered by Claude)
- **Weekly AI Reports**: Personalized analysis of your productivity patterns
- **Daily Check-ins**: Motivational messages to start your day
- **AI Coaching**: Ask questions about your productivity
- **Pattern Detection**: Identifies when you're most productive
- **Distraction Analysis**: Discovers your common distraction triggers
- **Personalized Tips**: Actionable advice based on your behavior

### ⚙️ Customization
- Adjustable idle timeout
- Incognito tracking toggle
- Dark mode support
- Privacy mode (exclude specific domains)
- Export/import data (CSV/JSON)
- Reset all data option

## Installation

### Development Setup

1. **Clone the repository**
   ```bash
   cd /path/to/timeblocker-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

   For development with auto-rebuild:
   ```bash
   npm run dev
   ```

4. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

### Production Build

```bash
npm run build
```

The built extension will be in the `dist` folder, ready to upload to the Chrome Web Store.

## Configuration

### Setting up AI Insights

To use AI insights, you need an Anthropic API key:

1. Get an API key from [Anthropic Console](https://console.anthropic.com/)
2. Click the extension icon
3. Open the full dashboard
4. Go to Settings
5. Enter your API key
6. Save

**Note**: AI insights are optional. The extension works fully without an API key, but you won't get AI-powered weekly reports and coaching.

### Customizing Categories

1. Click extension icon → Open Dashboard
2. Go to Settings → Categories
3. Search for a domain or add new ones
4. Assign categories (Productive, Neutral, Distracting)
5. Create custom categories for your workflow

## Usage

### Tracking Time

Time tracking starts automatically! Just browse normally and FocusTrack AI will:
- Track time on each website
- Categorize sites automatically
- Detect when you're idle
- Save data every 30 seconds

### Blocking Websites

**Quick Block Current Site:**
1. Click extension icon
2. Click "Block This Site" button

**Advanced Blocking:**
1. Open full dashboard
2. Go to "Blocked Sites" section
3. Add domain and choose block type:
   - **Always**: Blocks 24/7
   - **Scheduled**: Set specific hours/days
   - **Time Limit**: Allow X minutes per day

**Nuclear Mode:**
Click the Nuclear Mode toggle to instantly block ALL distracting sites.

### Focus Sessions

1. Click extension icon
2. Choose duration (25, 45, or 60 minutes)
3. Click start
4. All distracting sites are auto-blocked during the session
5. Get notification when complete

### Viewing Analytics

**Quick View:**
- Click extension icon for today's stats

**Detailed Analytics:**
1. Click "Open Full Dashboard"
2. Switch between Today/Week/Month views
3. View charts and breakdowns
4. Export data if needed

### AI Insights

**Weekly Report** (automatic):
- Sent every 7 days
- Analyzes productivity patterns
- Compares to previous week
- Provides personalized tips

**Ask AI Coach:**
1. Open full dashboard
2. Go to "AI Coach" section
3. Ask questions like:
   - "How can I be more productive?"
   - "When am I most focused?"
   - "Why am I getting distracted?"

## File Structure

```
focustrack-ai/
├── src/
│   ├── background/
│   │   ├── service-worker.js      # Main background script
│   │   ├── time-tracker.js        # Time tracking engine
│   │   ├── blocker.js             # Website blocking logic
│   │   └── storage-manager.js     # IndexedDB manager
│   ├── popup/
│   │   ├── popup.html             # Popup HTML
│   │   └── popup.jsx              # Popup React component
│   ├── dashboard/
│   │   ├── dashboard.html         # Dashboard HTML
│   │   └── dashboard.jsx          # Dashboard React component
│   ├── utils/
│   │   ├── categories.js          # 100+ pre-populated sites
│   │   ├── analytics.js           # Productivity calculations
│   │   ├── api.js                 # Claude API integration
│   │   └── storage-manager.js     # Storage utilities
│   └── styles/
│       └── tailwind.css           # Tailwind styles
├── public/
│   ├── blocked.html               # Block page
│   └── icons/                     # Extension icons
├── manifest.json                  # Extension manifest
├── package.json                   # Dependencies
├── webpack.config.js              # Build configuration
└── README.md                      # This file
```

## Tech Stack

- **Manifest V3**: Latest Chrome extension standard
- **React 18**: UI framework
- **Tailwind CSS**: Styling
- **Chart.js**: Data visualizations
- **IndexedDB**: Unlimited local storage
- **Claude API**: AI insights and coaching

## Chrome APIs Used

- `chrome.tabs`: Tab tracking
- `chrome.idle`: Idle detection
- `chrome.alarms`: Periodic tasks
- `chrome.notifications`: User notifications
- `chrome.declarativeNetRequest`: Website blocking
- `chrome.storage`: Settings storage
- `chrome.webNavigation`: Navigation tracking

## Privacy

FocusTrack AI is **100% private**:
- All data stored locally on your device
- No data sent to external servers (except Claude API for AI insights)
- No telemetry or tracking
- No third-party analytics
- Open source - audit the code yourself

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use and modify as needed.

## Support

If you encounter any issues:
1. Check the Chrome DevTools console for errors
2. Try disabling and re-enabling the extension
3. Clear extension data and restart
4. Open an issue on GitHub

## Roadmap

- [ ] Mobile app (iOS/Android)
- [ ] Browser sync across devices
- [ ] Team/organization features
- [ ] Advanced AI features (habit tracking, burnout detection)
- [ ] Integration with calendar apps
- [ ] Productivity challenges and achievements
- [ ] Export reports as PDF

## Credits

Built with by the FocusTrack AI team.

Powered by:
- [Anthropic Claude](https://anthropic.com/) for AI insights
- [Chart.js](https://www.chartjs.org/) for visualizations
- [React](https://react.dev/) for UI
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

**Stay focused. Stay productive. Let AI guide you.** 🚀
