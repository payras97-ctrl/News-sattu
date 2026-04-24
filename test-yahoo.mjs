import Parser from 'rss-parser';

async function testYahooTopics() {
  const rssParser = new Parser();
  const topics = [
    'https://news.yahoo.com/rss/world',
    'https://news.yahoo.com/rss/science',
    'https://news.yahoo.com/rss/health',
    'https://news.yahoo.com/rss/entertainment',
    'https://finance.yahoo.com/news/rss',
    'https://news.yahoo.com/rss/tech'
  ];
  for (const t of topics) {
    try {
      const feed = await rssParser.parseURL(t);
      console.log(t, feed.items.length);
    } catch(e) {
      console.log(t, "ERROR", e.message);
    }
  }
}
testYahooTopics();
