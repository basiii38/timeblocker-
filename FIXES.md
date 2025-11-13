# FocusTrack AI - Bug Fixes & Improvements

## Issues to Fix:

### 1. Expand Site Categorization (100+ → 2000+ sites)
- **Status**: Creating comprehensive list
- **Impact**: High - Core functionality
- **File**: `background/service-worker.js`

### 2. Whitelist Removal Not Working
- **Status**: Need to fix
- **Impact**: High - Feature broken
- **File**: `popup/popup.js`
- **Issue**: removeFromWhitelist function needs proper binding

### 3. Category Change Not Syncing
- **Status**: Need to investigate
- **Impact**: High - Core functionality
- **Files**: `popup/popup.js`, `background/service-worker.js`

### 4. Dark Mode Not Working
- **Status**: Need to implement
- **Impact**: Medium - UX feature
- **Files**: `popup/popup.html`, `dashboard/dashboard.html`, `settings/settings.js`

### 5. Settings Opens New Tab Instead of Reusing
- **Status**: Need to fix
- **Impact**: Medium - UX annoyance
- **File**: `popup/popup.js`

### 6. Import Data Not Working
- **Status**: Need to implement
- **Impact**: Medium - Feature incomplete
- **File**: `settings/settings.js`

### 7. Break/Pomodoro Need Timer Display
- **Status**: Need to add countdown
- **Impact**: Medium - UX improvement
- **Files**: `popup/popup.js`, `popup/popup.html`

### 8. Time Break Not Working Properly
- **Status**: Need to investigate
- **Impact**: High - Feature broken
- **File**: `background/service-worker.js`

### 9. Blocked Page Reload Issue
- **Status**: Need to fix
- **Impact**: Medium - UX issue
- **File**: `blocked.html`

### 10. Blocked Page Go Back Button
- **Status**: Need to fix
- **Impact**: High - Feature broken
- **File**: `blocked.html`

## Implementation Plan:

1. Fix critical bugs first (whitelist, category, blocked page)
2. Expand site categorization
3. Implement missing features (dark mode, import, timers)
4. Test all fixes
5. Commit and push

## Priority Order:
1. Whitelist removal (CRITICAL)
2. Category change sync (CRITICAL)
3. Blocked page navigation (CRITICAL)
4. Expand site list (HIGH)
5. Settings tab reuse (MEDIUM)
6. Timer displays (MEDIUM)
7. Dark mode (LOW)
8. Import data (LOW)
