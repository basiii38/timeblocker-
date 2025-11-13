// Claude API integration for AI insights and coaching
import { analyzeProductivityPatterns } from './analytics.js';
import { formatTime, formatTimeDetailed } from './analytics.js';

const CLAUDE_API_ENDPOINT = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-3-5-sonnet-20241022';

class ClaudeAPI {
  constructor() {
    this.apiKey = null;
  }

  /**
   * Set API key
   * @param {string} key - Anthropic API key
   */
  setApiKey(key) {
    this.apiKey = key;
  }

  /**
   * Check if API key is set
   * @returns {boolean}
   */
  hasApiKey() {
    return !!this.apiKey;
  }

  /**
   * Make API request to Claude
   * @param {string} prompt - User prompt
   * @param {number} maxTokens - Max tokens in response
   * @returns {Promise<string>} Claude's response
   */
  async chat(prompt, maxTokens = 1024) {
    if (!this.apiKey) {
      throw new Error('API key not set. Please add your Anthropic API key in settings.');
    }

    try {
      const response = await fetch(CLAUDE_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: maxTokens,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API request failed');
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Claude API error:', error);
      throw error;
    }
  }

  /**
   * Generate weekly productivity insights
   * @param {Array} weekEntries - Time entries for the past week
   * @param {Array} previousWeekEntries - Time entries for the previous week
   * @returns {Promise<Object>} AI-generated insights
   */
  async generateWeeklyInsights(weekEntries, previousWeekEntries) {
    // Analyze patterns
    const patterns = analyzeProductivityPatterns(weekEntries);

    // Calculate weekly stats
    let productiveTime = 0;
    let distractingTime = 0;
    let neutralTime = 0;

    for (const entry of weekEntries) {
      if (entry.category === 'productive') {
        productiveTime += entry.duration;
      } else if (entry.category === 'distracting') {
        distractingTime += entry.duration;
      } else if (entry.category === 'neutral') {
        neutralTime += entry.duration;
      }
    }

    const totalTime = productiveTime + distractingTime;
    const score = totalTime > 0 ? Math.round((productiveTime / totalTime) * 100) : 0;

    // Calculate previous week stats for comparison
    let prevProductiveTime = 0;
    let prevDistractingTime = 0;

    for (const entry of previousWeekEntries) {
      if (entry.category === 'productive') {
        prevProductiveTime += entry.duration;
      } else if (entry.category === 'distracting') {
        prevDistractingTime += entry.duration;
      }
    }

    const prevTotalTime = prevProductiveTime + prevDistractingTime;
    const prevScore = prevTotalTime > 0 ? Math.round((prevProductiveTime / prevTotalTime) * 100) : 0;

    // Format productive hours
    const productiveHoursStr = patterns.productiveHours
      .map(h => `${h}:00`)
      .join(', ');

    // Format distracting hours
    const distractingHoursStr = patterns.distractingHours
      .map(h => `${h}:00`)
      .join(', ');

    // Format top distracting sites
    const distractingSitesStr = patterns.topDistractingSites
      .map(s => `${s.domain} (${formatTime(s.time)})`)
      .join(', ');

    // Build prompt for Claude
    const prompt = `You are a productivity coach analyzing a user's weekly browsing data. Provide personalized insights and actionable advice.

**This Week's Data:**
- Productivity Score: ${score}%
- Productive Time: ${formatTimeDetailed(productiveTime)}
- Distracting Time: ${formatTimeDetailed(distractingTime)}
- Total Tracked Time: ${formatTimeDetailed(totalTime)}

**Last Week's Data:**
- Productivity Score: ${prevScore}%
- Productive Time: ${formatTimeDetailed(prevProductiveTime)}
- Distracting Time: ${formatTimeDetailed(prevDistractingTime)}

**Patterns Identified:**
- Most productive hours: ${productiveHoursStr || 'No data'}
- Most distracting hours: ${distractingHoursStr || 'No data'}
- Top distracting sites: ${distractingSitesStr || 'No data'}

Please provide:
1. **Summary**: Brief overview of the week (2-3 sentences)
2. **Productivity Patterns**: Analysis of when they're most productive and why
3. **Distraction Triggers**: Common distractions and when they occur
4. **Trend Analysis**: Compare to last week - improving, declining, or stable? Why?
5. **Personalized Tips**: 3-5 specific, actionable recommendations
6. **Productivity Score Explanation**: Why did they get this score?

Keep the tone encouraging and constructive. Focus on progress and growth. Use bullet points for readability.`;

    try {
      const response = await this.chat(prompt, 2048);

      return {
        summary: this.extractSection(response, 'Summary'),
        patterns: this.extractSection(response, 'Productivity Patterns'),
        triggers: this.extractSection(response, 'Distraction Triggers'),
        trend: this.extractSection(response, 'Trend Analysis'),
        tips: this.extractSection(response, 'Personalized Tips'),
        scoreExplanation: this.extractSection(response, 'Productivity Score Explanation'),
        fullReport: response,
        weeklyStats: {
          score,
          productiveTime,
          distractingTime,
          totalTime,
          productiveHours: patterns.productiveHours,
          distractingHours: patterns.distractingHours,
          topDistractingSites: patterns.topDistractingSites
        }
      };
    } catch (error) {
      // Return fallback insights if API fails
      return this.generateFallbackInsights(weekEntries, previousWeekEntries);
    }
  }

  /**
   * Generate daily motivational check-in
   * @param {Array} recentEntries - Recent time entries
   * @returns {Promise<string>} Motivational message
   */
  async generateDailyCheckIn(recentEntries) {
    const prompt = `You are a supportive productivity coach. Generate a short (2-3 sentences), encouraging morning message to help someone start their day productively. Be warm, motivating, and specific. Include a tip or reminder about staying focused.`;

    try {
      const response = await this.chat(prompt, 256);
      return response;
    } catch (error) {
      // Fallback messages
      const fallbackMessages = [
        "Good morning! Today is a fresh start. Set your intentions and focus on what matters most.",
        "Start your day with purpose. Remember, every small step towards your goals counts.",
        "You've got this! Stay focused on your priorities and minimize distractions.",
        "New day, new opportunities. Block out distractions and make today productive.",
        "Focus is your superpower. Use it wisely today and watch yourself achieve great things."
      ];
      return fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
    }
  }

  /**
   * AI productivity coaching chat
   * @param {string} question - User's question
   * @param {Array} recentData - Recent productivity data for context
   * @returns {Promise<string>} AI response
   */
  async askCoach(question, recentData) {
    // Calculate recent stats for context
    let productiveTime = 0;
    let distractingTime = 0;

    for (const entry of recentData) {
      if (entry.category === 'productive') {
        productiveTime += entry.duration;
      } else if (entry.category === 'distracting') {
        distractingTime += entry.duration;
      }
    }

    const totalTime = productiveTime + distractingTime;
    const score = totalTime > 0 ? Math.round((productiveTime / totalTime) * 100) : 0;

    const prompt = `You are a helpful productivity coach. The user has the following recent stats:
- Productivity Score: ${score}%
- Productive Time: ${formatTime(productiveTime)}
- Distracting Time: ${formatTime(distractingTime)}

User's question: ${question}

Provide helpful, actionable advice. Be encouraging and specific. Keep your response concise (3-4 sentences).`;

    try {
      const response = await this.chat(prompt, 512);
      return response;
    } catch (error) {
      throw new Error('Unable to get coaching advice. Please check your API key and try again.');
    }
  }

  /**
   * Extract section from AI response
   * @param {string} text - Full response text
   * @param {string} sectionName - Section name to extract
   * @returns {string} Extracted section
   */
  extractSection(text, sectionName) {
    const regex = new RegExp(`\\*\\*${sectionName}[:\\*]*\\s*([\\s\\S]*?)(?=\\n\\*\\*|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  }

  /**
   * Generate fallback insights when API is unavailable
   * @param {Array} weekEntries - Week entries
   * @param {Array} previousWeekEntries - Previous week entries
   * @returns {Object} Fallback insights
   */
  generateFallbackInsights(weekEntries, previousWeekEntries) {
    let productiveTime = 0;
    let distractingTime = 0;

    for (const entry of weekEntries) {
      if (entry.category === 'productive') {
        productiveTime += entry.duration;
      } else if (entry.category === 'distracting') {
        distractingTime += entry.duration;
      }
    }

    const totalTime = productiveTime + distractingTime;
    const score = totalTime > 0 ? Math.round((productiveTime / totalTime) * 100) : 0;

    let prevProductiveTime = 0;
    let prevDistractingTime = 0;

    for (const entry of previousWeekEntries) {
      if (entry.category === 'productive') {
        prevProductiveTime += entry.duration;
      } else if (entry.category === 'distracting') {
        prevDistractingTime += entry.duration;
      }
    }

    const prevTotalTime = prevProductiveTime + prevDistractingTime;
    const prevScore = prevTotalTime > 0 ? Math.round((prevProductiveTime / prevTotalTime) * 100) : 0;

    const scoreDiff = score - prevScore;
    const trend = scoreDiff > 5 ? 'improving' : scoreDiff < -5 ? 'declining' : 'stable';

    return {
      summary: `This week, you achieved a productivity score of ${score}%, spending ${formatTimeDetailed(productiveTime)} on productive activities.`,
      patterns: 'Unable to generate AI insights. Please add your Anthropic API key in settings.',
      triggers: 'Unable to generate AI insights. Please add your Anthropic API key in settings.',
      trend: `Your productivity is ${trend} compared to last week (${prevScore}%).`,
      tips: '• Consider setting specific time blocks for focused work\n• Use the focus session feature to block distractions\n• Review your most productive hours and schedule important work accordingly',
      scoreExplanation: `Your score of ${score}% is calculated by dividing productive time by total relevant time (productive + distracting).`,
      fullReport: 'AI insights require an Anthropic API key. Please add your API key in settings to unlock AI-powered insights.',
      weeklyStats: {
        score,
        productiveTime,
        distractingTime,
        totalTime,
        productiveHours: [],
        distractingHours: [],
        topDistractingSites: []
      }
    };
  }
}

// Create singleton instance
const claudeAPI = new ClaudeAPI();

export default claudeAPI;
export { ClaudeAPI };
