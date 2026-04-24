import Parser from 'rss-parser';
import fetch from 'node-fetch';

async function testAllOrigins() {
  const url = 'https://news.google.com/rss/headlines/section/topic/SPORTS?hl=en-IN&gl=IN&ceid=IN:en';
  try {
    const rawUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(rawUrl);
    const data = await response.json();
    const xml = data.contents;
    
    const rssParser = new Parser();
    const feed = await rssParser.parseString(xml);
    console.log("Success! Items:", feed.items.length);
    console.log("Title:", feed.items[0].title);
  } catch (e) {
    console.log("Error:", e.message);
  }
}
testAllOrigins();
