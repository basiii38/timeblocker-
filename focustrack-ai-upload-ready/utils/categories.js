// Website categorization utility
export const CATEGORIES = {
  PRODUCTIVE: 'productive',
  NEUTRAL: 'neutral',
  DISTRACTING: 'distracting',
  UNCATEGORIZED: 'uncategorized'
};

export const DEFAULT_CATEGORIES = {
  // Productive sites
  'github.com': 'productive',
  'stackoverflow.com': 'productive',
  'stackexchange.com': 'productive',
  'docs.google.com': 'productive',
  'notion.so': 'productive',
  'figma.com': 'productive',
  'linkedin.com': 'productive',
  'developer.mozilla.org': 'productive',
  'w3schools.com': 'productive',
  'codepen.io': 'productive',
  'codesandbox.io': 'productive',
  'replit.com': 'productive',
  'gitlab.com': 'productive',
  'bitbucket.org': 'productive',
  'jira.atlassian.com': 'productive',
  'trello.com': 'productive',
  'asana.com': 'productive',
  'monday.com': 'productive',
  'slack.com': 'productive',
  'teams.microsoft.com': 'productive',
  'zoom.us': 'productive',
  'meet.google.com': 'productive',
  'calendar.google.com': 'productive',
  'drive.google.com': 'productive',
  'dropbox.com': 'productive',
  'onedrive.live.com': 'productive',
  'evernote.com': 'productive',
  'todoist.com': 'productive',
  'clickup.com': 'productive',
  'airtable.com': 'productive',
  'coda.io': 'productive',
  'miro.com': 'productive',
  'canva.com': 'productive',
  'adobe.com': 'productive',
  'sketch.com': 'productive',
  'invision.com': 'productive',
  'aws.amazon.com': 'productive',
  'console.cloud.google.com': 'productive',
  'azure.microsoft.com': 'productive',
  'vercel.com': 'productive',
  'netlify.com': 'productive',
  'heroku.com': 'productive',
  'digitalocean.com': 'productive',
  'coursera.org': 'productive',
  'udemy.com': 'productive',
  'edx.org': 'productive',
  'khanacademy.org': 'productive',
  'leetcode.com': 'productive',
  'hackerrank.com': 'productive',
  'codecademy.com': 'productive',
  'freecodecamp.org': 'productive',
  'pluralsight.com': 'productive',
  'medium.com': 'productive',
  'dev.to': 'productive',
  'hashnode.com': 'productive',

  // Distracting sites
  'facebook.com': 'distracting',
  'instagram.com': 'distracting',
  'twitter.com': 'distracting',
  'x.com': 'distracting',
  'reddit.com': 'distracting',
  'youtube.com': 'distracting',
  'netflix.com': 'distracting',
  'tiktok.com': 'distracting',
  'snapchat.com': 'distracting',
  'twitch.tv': 'distracting',
  'pinterest.com': 'distracting',
  'tumblr.com': 'distracting',
  'discord.com': 'distracting',
  'whatsapp.com': 'distracting',
  'messenger.com': 'distracting',
  'telegram.org': 'distracting',
  'hulu.com': 'distracting',
  'disneyplus.com': 'distracting',
  'primevideo.com': 'distracting',
  'hbomax.com': 'distracting',
  'spotify.com': 'distracting',
  'soundcloud.com': 'distracting',
  'pandora.com': 'distracting',
  'imgur.com': 'distracting',
  '9gag.com': 'distracting',
  'buzzfeed.com': 'distracting',
  'dailymail.co.uk': 'distracting',
  'news.ycombinator.com': 'distracting',
  'producthunt.com': 'distracting',
  'vimeo.com': 'distracting',
  'dailymotion.com': 'distracting',
  'crunchyroll.com': 'distracting',
  'funimation.com': 'distracting',
  'chess.com': 'distracting',
  'lichess.org': 'distracting',
  'miniclip.com': 'distracting',
  'kongregate.com': 'distracting',
  'armorgames.com': 'distracting',
  'steampowered.com': 'distracting',
  'epicgames.com': 'distracting',
  'roblox.com': 'distracting',
  'minecraft.net': 'distracting',

  // Neutral sites
  'gmail.com': 'neutral',
  'mail.google.com': 'neutral',
  'outlook.com': 'neutral',
  'outlook.live.com': 'neutral',
  'yahoo.com': 'neutral',
  'google.com': 'neutral',
  'bing.com': 'neutral',
  'duckduckgo.com': 'neutral',
  'wikipedia.org': 'neutral',
  'amazon.com': 'neutral',
  'ebay.com': 'neutral',
  'etsy.com': 'neutral',
  'walmart.com': 'neutral',
  'target.com': 'neutral',
  'craigslist.org': 'neutral',
  'maps.google.com': 'neutral',
  'weather.com': 'neutral',
  'accuweather.com': 'neutral',
  'nytimes.com': 'neutral',
  'wsj.com': 'neutral',
  'bbc.com': 'neutral',
  'cnn.com': 'neutral',
  'reuters.com': 'neutral',
  'bloomberg.com': 'neutral',
  'theguardian.com': 'neutral',
  'npr.org': 'neutral',
  'apnews.com': 'neutral',
  'paypal.com': 'neutral',
  'chase.com': 'neutral',
  'bankofamerica.com': 'neutral',
  'wellsfargo.com': 'neutral',
  'mint.com': 'neutral',
  'creditkarma.com': 'neutral',
  'irs.gov': 'neutral',
  'usps.com': 'neutral',
  'fedex.com': 'neutral',
  'ups.com': 'neutral'
};

export function getDomain(url) {
  try {
    const urlObj = new URL(url);
    let domain = urlObj.hostname;
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }
    return domain;
  } catch (error) {
    return '';
  }
}

export function getCategoryForUrl(url, customCategories = {}) {
  const domain = getDomain(url);
  if (customCategories[domain]) {
    return customCategories[domain];
  }
  if (DEFAULT_CATEGORIES[domain]) {
    return DEFAULT_CATEGORIES[domain];
  }
  return CATEGORIES.UNCATEGORIZED;
}
