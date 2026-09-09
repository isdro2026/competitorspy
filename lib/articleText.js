// lib/articleText.js
// Fetches a URL and extracts rough plain-text content for summarization.
export async function fetchArticleText(url, maxChars = 6000) {
    const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CompetitorSpyBot/1.0)' },
    });
    if (!res.ok) {
          throw new Error('Could not fetch URL (status ' + res.status + ')');
    }
    const html = await res.text();

  let text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();

  if (!text) {
        throw new Error('Could not extract readable text from that URL');
  }

  return text.slice(0, maxChars);
}
