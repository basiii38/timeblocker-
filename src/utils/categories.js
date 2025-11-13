// Website categorization utility
// Categories: productive, neutral, distracting, uncategorized

export const CATEGORIES = {
  PRODUCTIVE: 'productive',
  NEUTRAL: 'neutral',
  DISTRACTING: 'distracting',
  UNCATEGORIZED: 'uncategorized'
};

export const CATEGORY_COLORS = {
  [CATEGORIES.PRODUCTIVE]: '#10b981',
  [CATEGORIES.NEUTRAL]: '#f59e0b',
  [CATEGORIES.DISTRACTING]: '#ef4444',
  [CATEGORIES.UNCATEGORIZED]: '#6b7280'
};

export const CATEGORY_LABELS = {
  [CATEGORIES.PRODUCTIVE]: 'Productive',
  [CATEGORIES.NEUTRAL]: 'Neutral',
  [CATEGORIES.DISTRACTING]: 'Distracting',
  [CATEGORIES.UNCATEGORIZED]: 'Uncategorized'
};

// Pre-populated website categories (100+ sites)
export const DEFAULT_CATEGORIES = {
  // Productive sites
  'github.com': CATEGORIES.PRODUCTIVE,
  'stackoverflow.com': CATEGORIES.PRODUCTIVE,
  'stackexchange.com': CATEGORIES.PRODUCTIVE,
  'docs.google.com': CATEGORIES.PRODUCTIVE,
  'notion.so': CATEGORIES.PRODUCTIVE,
  'figma.com': CATEGORIES.PRODUCTIVE,
  'linkedin.com': CATEGORIES.PRODUCTIVE,
  'developer.mozilla.org': CATEGORIES.PRODUCTIVE,
  'w3schools.com': CATEGORIES.PRODUCTIVE,
  'codepen.io': CATEGORIES.PRODUCTIVE,
  'codesandbox.io': CATEGORIES.PRODUCTIVE,
  'replit.com': CATEGORIES.PRODUCTIVE,
  'gitlab.com': CATEGORIES.PRODUCTIVE,
  'bitbucket.org': CATEGORIES.PRODUCTIVE,
  'jira.atlassian.com': CATEGORIES.PRODUCTIVE,
  'trello.com': CATEGORIES.PRODUCTIVE,
  'asana.com': CATEGORIES.PRODUCTIVE,
  'monday.com': CATEGORIES.PRODUCTIVE,
  'slack.com': CATEGORIES.PRODUCTIVE,
  'teams.microsoft.com': CATEGORIES.PRODUCTIVE,
  'zoom.us': CATEGORIES.PRODUCTIVE,
  'meet.google.com': CATEGORIES.PRODUCTIVE,
  'calendar.google.com': CATEGORIES.PRODUCTIVE,
  'drive.google.com': CATEGORIES.PRODUCTIVE,
  'dropbox.com': CATEGORIES.PRODUCTIVE,
  'onedrive.live.com': CATEGORIES.PRODUCTIVE,
  'evernote.com': CATEGORIES.PRODUCTIVE,
  'todoist.com': CATEGORIES.PRODUCTIVE,
  'clickup.com': CATEGORIES.PRODUCTIVE,
  'airtable.com': CATEGORIES.PRODUCTIVE,
  'coda.io': CATEGORIES.PRODUCTIVE,
  'miro.com': CATEGORIES.PRODUCTIVE,
  'canva.com': CATEGORIES.PRODUCTIVE,
  'adobe.com': CATEGORIES.PRODUCTIVE,
  'sketch.com': CATEGORIES.PRODUCTIVE,
  'invision.com': CATEGORIES.PRODUCTIVE,
  'aws.amazon.com': CATEGORIES.PRODUCTIVE,
  'console.cloud.google.com': CATEGORIES.PRODUCTIVE,
  'azure.microsoft.com': CATEGORIES.PRODUCTIVE,
  'vercel.com': CATEGORIES.PRODUCTIVE,
  'netlify.com': CATEGORIES.PRODUCTIVE,
  'heroku.com': CATEGORIES.PRODUCTIVE,
  'digitalocean.com': CATEGORIES.PRODUCTIVE,
  'coursera.org': CATEGORIES.PRODUCTIVE,
  'udemy.com': CATEGORIES.PRODUCTIVE,
  'edx.org': CATEGORIES.PRODUCTIVE,
  'khanacademy.org': CATEGORIES.PRODUCTIVE,
  'leetcode.com': CATEGORIES.PRODUCTIVE,
  'hackerrank.com': CATEGORIES.PRODUCTIVE,
  'codecademy.com': CATEGORIES.PRODUCTIVE,
  'freecodecamp.org': CATEGORIES.PRODUCTIVE,
  'pluralsight.com': CATEGORIES.PRODUCTIVE,
  'medium.com': CATEGORIES.PRODUCTIVE,
  'dev.to': CATEGORIES.PRODUCTIVE,
  'hashnode.com': CATEGORIES.PRODUCTIVE,

  // Distracting sites
  'facebook.com': CATEGORIES.DISTRACTING,
  'instagram.com': CATEGORIES.DISTRACTING,
  'twitter.com': CATEGORIES.DISTRACTING,
  'x.com': CATEGORIES.DISTRACTING,
  'reddit.com': CATEGORIES.DISTRACTING,
  'youtube.com': CATEGORIES.DISTRACTING,
  'netflix.com': CATEGORIES.DISTRACTING,
  'tiktok.com': CATEGORIES.DISTRACTING,
  'snapchat.com': CATEGORIES.DISTRACTING,
  'twitch.tv': CATEGORIES.DISTRACTING,
  'pinterest.com': CATEGORIES.DISTRACTING,
  'tumblr.com': CATEGORIES.DISTRACTING,
  'discord.com': CATEGORIES.DISTRACTING,
  'whatsapp.com': CATEGORIES.DISTRACTING,
  'messenger.com': CATEGORIES.DISTRACTING,
  'telegram.org': CATEGORIES.DISTRACTING,
  'hulu.com': CATEGORIES.DISTRACTING,
  'disneyplus.com': CATEGORIES.DISTRACTING,
  'primevideo.com': CATEGORIES.DISTRACTING,
  'hbomax.com': CATEGORIES.DISTRACTING,
  'spotify.com': CATEGORIES.DISTRACTING,
  'soundcloud.com': CATEGORIES.DISTRACTING,
  'pandora.com': CATEGORIES.DISTRACTING,
  'imgur.com': CATEGORIES.DISTRACTING,
  '9gag.com': CATEGORIES.DISTRACTING,
  'buzzfeed.com': CATEGORIES.DISTRACTING,
  'dailymail.co.uk': CATEGORIES.DISTRACTING,
  'news.ycombinator.com': CATEGORIES.DISTRACTING,
  'producthunt.com': CATEGORIES.DISTRACTING,
  'vimeo.com': CATEGORIES.DISTRACTING,
  'dailymotion.com': CATEGORIES.DISTRACTING,
  'crunchyroll.com': CATEGORIES.DISTRACTING,
  'funimation.com': CATEGORIES.DISTRACTING,
  'chess.com': CATEGORIES.DISTRACTING,
  'lichess.org': CATEGORIES.DISTRACTING,
  'miniclip.com': CATEGORIES.DISTRACTING,
  'kongregate.com': CATEGORIES.DISTRACTING,
  'armor games.com': CATEGORIES.DISTRACTING,
  'steampowered.com': CATEGORIES.DISTRACTING,
  'epicgames.com': CATEGORIES.DISTRACTING,
  'roblox.com': CATEGORIES.DISTRACTING,
  'minecraft.net': CATEGORIES.DISTRACTING,

  // Neutral sites
  'gmail.com': CATEGORIES.NEUTRAL,
  'mail.google.com': CATEGORIES.NEUTRAL,
  'outlook.com': CATEGORIES.NEUTRAL,
  'outlook.live.com': CATEGORIES.NEUTRAL,
  'yahoo.com': CATEGORIES.NEUTRAL,
  'google.com': CATEGORIES.NEUTRAL,
  'bing.com': CATEGORIES.NEUTRAL,
  'duckduckgo.com': CATEGORIES.NEUTRAL,
  'wikipedia.org': CATEGORIES.NEUTRAL,
  'amazon.com': CATEGORIES.NEUTRAL,
  'ebay.com': CATEGORIES.NEUTRAL,
  'etsy.com': CATEGORIES.NEUTRAL,
  'walmart.com': CATEGORIES.NEUTRAL,
  'target.com': CATEGORIES.NEUTRAL,
  'craigslist.org': CATEGORIES.NEUTRAL,
  'maps.google.com': CATEGORIES.NEUTRAL,
  'weather.com': CATEGORIES.NEUTRAL,
  'accuweather.com': CATEGORIES.NEUTRAL,
  'nytimes.com': CATEGORIES.NEUTRAL,
  'wsj.com': CATEGORIES.NEUTRAL,
  'bbc.com': CATEGORIES.NEUTRAL,
  'cnn.com': CATEGORIES.NEUTRAL,
  'reuters.com': CATEGORIES.NEUTRAL,
  'bloomberg.com': CATEGORIES.NEUTRAL,
  'theguardian.com': CATEGORIES.NEUTRAL,
  'npr.org': CATEGORIES.NEUTRAL,
  'apnews.com': CATEGORIES.NEUTRAL,
  'paypal.com': CATEGORIES.NEUTRAL,
  'chase.com': CATEGORIES.NEUTRAL,
  'bankofamerica.com': CATEGORIES.NEUTRAL,
  'wellsfargo.com': CATEGORIES.NEUTRAL,
  'mint.com': CATEGORIES.NEUTRAL,
  'creditkarma.com': CATEGORIES.NEUTRAL,
  'irs.gov': CATEGORIES.NEUTRAL,
  'usps.com': CATEGORIES.NEUTRAL,
  'fedex.com': CATEGORIES.NEUTRAL,
  'ups.com': CATEGORIES.NEUTRAL
};

/**
 * Get the domain from a URL
 * @param {string} url - Full URL
 * @returns {string} Domain name
 */
export function getDomain(url) {
  try {
    const urlObj = new URL(url);
    let domain = urlObj.hostname;

    // Remove 'www.' prefix
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }

    return domain;
  } catch (error) {
    console.error('Invalid URL:', url);
    return '';
  }
}

/**
 * Get category for a domain
 * @param {string} domain - Domain name
 * @param {Object} customCategories - User's custom category mappings
 * @returns {string} Category name
 */
export function getCategoryForDomain(domain, customCategories = {}) {
  // Check custom categories first
  if (customCategories[domain]) {
    return customCategories[domain];
  }

  // Check default categories
  if (DEFAULT_CATEGORIES[domain]) {
    return DEFAULT_CATEGORIES[domain];
  }

  return CATEGORIES.UNCATEGORIZED;
}

/**
 * Get category for a URL
 * @param {string} url - Full URL
 * @param {Object} customCategories - User's custom category mappings
 * @returns {string} Category name
 */
export function getCategoryForUrl(url, customCategories = {}) {
  const domain = getDomain(url);
  return getCategoryForDomain(domain, customCategories);
}

/**
 * Update category for a domain
 * @param {string} domain - Domain name
 * @param {string} category - New category
 * @param {Object} customCategories - Current custom categories
 * @returns {Object} Updated custom categories
 */
export function updateDomainCategory(domain, category, customCategories = {}) {
  return {
    ...customCategories,
    [domain]: category
  };
}

/**
 * Get all domains grouped by category
 * @param {Object} customCategories - User's custom category mappings
 * @returns {Object} Domains grouped by category
 */
export function getDomainsByCategory(customCategories = {}) {
  const grouped = {
    [CATEGORIES.PRODUCTIVE]: [],
    [CATEGORIES.NEUTRAL]: [],
    [CATEGORIES.DISTRACTING]: [],
    [CATEGORIES.UNCATEGORIZED]: []
  };

  // Add default categories
  for (const [domain, category] of Object.entries(DEFAULT_CATEGORIES)) {
    if (!customCategories[domain]) {
      grouped[category].push(domain);
    }
  }

  // Add custom categories (they override defaults)
  for (const [domain, category] of Object.entries(customCategories)) {
    if (grouped[category]) {
      grouped[category].push(domain);
    }
  }

  return grouped;
}
