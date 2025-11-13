// Analytics and productivity calculation utilities
import { CATEGORIES } from './categories.js';

/**
 * Calculate productivity score
 * Formula: (productive time / (productive time + distracting time)) × 100
 * Ignores neutral and uncategorized time
 * @param {Object} timeByCategory - Time spent in each category (in seconds)
 * @returns {number} Productivity score (0-100)
 */
export function calculateProductivityScore(timeByCategory) {
  const productiveTime = timeByCategory[CATEGORIES.PRODUCTIVE] || 0;
  const distractingTime = timeByCategory[CATEGORIES.DISTRACTING] || 0;

  const totalRelevantTime = productiveTime + distractingTime;

  if (totalRelevantTime === 0) {
    return 0;
  }

  return Math.round((productiveTime / totalRelevantTime) * 100);
}

/**
 * Calculate time spent by category
 * @param {Array} timeEntries - Array of time tracking entries
 * @returns {Object} Time by category in seconds
 */
export function calculateTimeByCategory(timeEntries) {
  const timeByCategory = {
    [CATEGORIES.PRODUCTIVE]: 0,
    [CATEGORIES.NEUTRAL]: 0,
    [CATEGORIES.DISTRACTING]: 0,
    [CATEGORIES.UNCATEGORIZED]: 0
  };

  for (const entry of timeEntries) {
    const category = entry.category || CATEGORIES.UNCATEGORIZED;
    timeByCategory[category] += entry.duration || 0;
  }

  return timeByCategory;
}

/**
 * Calculate time spent by domain
 * @param {Array} timeEntries - Array of time tracking entries
 * @returns {Object} Time by domain in seconds
 */
export function calculateTimeByDomain(timeEntries) {
  const timeByDomain = {};

  for (const entry of timeEntries) {
    const domain = entry.domain;
    if (!timeByDomain[domain]) {
      timeByDomain[domain] = {
        domain,
        time: 0,
        category: entry.category,
        title: entry.title
      };
    }
    timeByDomain[domain].time += entry.duration || 0;
  }

  return timeByDomain;
}

/**
 * Get top domains by time spent
 * @param {Array} timeEntries - Array of time tracking entries
 * @param {number} limit - Number of top domains to return
 * @returns {Array} Top domains sorted by time
 */
export function getTopDomains(timeEntries, limit = 10) {
  const timeByDomain = calculateTimeByDomain(timeEntries);
  const domains = Object.values(timeByDomain);

  return domains
    .sort((a, b) => b.time - a.time)
    .slice(0, limit);
}

/**
 * Calculate hourly breakdown for timeline view
 * @param {Array} timeEntries - Array of time tracking entries
 * @param {Date} date - Date to analyze
 * @returns {Array} Hourly breakdown (24 hours)
 */
export function calculateHourlyBreakdown(timeEntries, date) {
  const hourlyData = Array(24).fill(0).map((_, hour) => ({
    hour,
    productive: 0,
    neutral: 0,
    distracting: 0,
    uncategorized: 0
  }));

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  for (const entry of timeEntries) {
    const entryDate = new Date(entry.timestamp);

    // Check if entry is from target date
    if (entryDate.toDateString() !== targetDate.toDateString()) {
      continue;
    }

    const hour = entryDate.getHours();
    const category = entry.category || CATEGORIES.UNCATEGORIZED;

    hourlyData[hour][category] += entry.duration || 0;
  }

  return hourlyData;
}

/**
 * Filter entries by date range
 * @param {Array} timeEntries - Array of time tracking entries
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Filtered entries
 */
export function filterEntriesByDateRange(timeEntries, startDate, endDate) {
  return timeEntries.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= startDate && entryDate <= endDate;
  });
}

/**
 * Get entries for today
 * @param {Array} timeEntries - Array of time tracking entries
 * @returns {Array} Today's entries
 */
export function getTodayEntries(timeEntries) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return filterEntriesByDateRange(timeEntries, today, tomorrow);
}

/**
 * Get entries for this week
 * @param {Array} timeEntries - Array of time tracking entries
 * @returns {Array} This week's entries
 */
export function getWeekEntries(timeEntries) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  return filterEntriesByDateRange(timeEntries, startOfWeek, endOfWeek);
}

/**
 * Get entries for this month
 * @param {Array} timeEntries - Array of time tracking entries
 * @returns {Array} This month's entries
 */
export function getMonthEntries(timeEntries) {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  return filterEntriesByDateRange(timeEntries, startOfMonth, endOfMonth);
}

/**
 * Calculate daily productivity trend
 * @param {Array} timeEntries - Array of time tracking entries
 * @param {number} days - Number of days to analyze
 * @returns {Array} Daily productivity scores
 */
export function calculateProductivityTrend(timeEntries, days = 7) {
  const trend = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);

    const dayEntries = filterEntriesByDateRange(timeEntries, date, nextDate);
    const timeByCategory = calculateTimeByCategory(dayEntries);
    const score = calculateProductivityScore(timeByCategory);

    trend.push({
      date: date.toISOString().split('T')[0],
      score,
      timeByCategory
    });
  }

  return trend;
}

/**
 * Format seconds to human-readable time
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time
 */
export function formatTime(seconds) {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Format seconds to detailed time
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time (e.g., "2 hours 15 minutes")
 */
export function formatTimeDetailed(seconds) {
  if (seconds < 60) {
    return `${Math.round(seconds)} seconds`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }

  return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${remainingMinutes} ${remainingMinutes === 1 ? 'minute' : 'minutes'}`;
}

/**
 * Calculate percentage
 * @param {number} part - Part value
 * @param {number} total - Total value
 * @returns {number} Percentage
 */
export function calculatePercentage(part, total) {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

/**
 * Analyze productivity patterns (for AI insights)
 * @param {Array} timeEntries - Array of time tracking entries
 * @returns {Object} Pattern analysis
 */
export function analyzeProductivityPatterns(timeEntries) {
  // Calculate hourly productivity
  const hourlyProductivity = Array(24).fill(0).map((_, hour) => ({
    hour,
    productiveTime: 0,
    distractingTime: 0,
    score: 0
  }));

  for (const entry of timeEntries) {
    const hour = new Date(entry.timestamp).getHours();
    const category = entry.category;

    if (category === CATEGORIES.PRODUCTIVE) {
      hourlyProductivity[hour].productiveTime += entry.duration;
    } else if (category === CATEGORIES.DISTRACTING) {
      hourlyProductivity[hour].distractingTime += entry.duration;
    }
  }

  // Calculate scores
  hourlyProductivity.forEach(data => {
    const total = data.productiveTime + data.distractingTime;
    if (total > 0) {
      data.score = Math.round((data.productiveTime / total) * 100);
    }
  });

  // Find most productive hours
  const productiveHours = hourlyProductivity
    .filter(h => h.productiveTime > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(h => h.hour);

  // Find most distracting hours
  const distractingHours = hourlyProductivity
    .filter(h => h.distractingTime > 0)
    .sort((a, b) => b.distractingTime - a.distractingTime)
    .slice(0, 3)
    .map(h => h.hour);

  // Most visited distracting sites
  const distractingEntries = timeEntries.filter(
    e => e.category === CATEGORIES.DISTRACTING
  );
  const topDistractingSites = getTopDomains(distractingEntries, 5);

  return {
    productiveHours,
    distractingHours,
    topDistractingSites,
    hourlyProductivity
  };
}
