import Parser from 'rss-parser';

async function testRss() {
  const rssParser = new Parser({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    }
  });
  const url = 'https://news.google.com/rss/headlines/section/topic/SPORTS?hl=en-IN&gl=IN&ceid=IN:en';
  try {
    const feed = await rssParser.parseURL(url);
    console.log("Success! Items:", feed.items.length);
  } catch (e) {
    console.log("Error:", e);
  }
}

testRss();
