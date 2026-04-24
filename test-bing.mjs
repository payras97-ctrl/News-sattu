import Parser from 'rss-parser';

async function t() {
  const rssParser = new Parser();
  try {
    const res1 = await rssParser.parseURL('https://www.bing.com/news/search?q=Sports+India&format=rss');
    console.log("Sports India items:", res1.items.length, res1.items[0].title);
  } catch (e) {
    console.log("Sports India failed:", e.message);
  }
  
  try {
    const res2 = await rssParser.parseURL('https://www.bing.com/news/search?q=Sports&format=rss');
    console.log("Sports items:", res2.items.length, res2.items[0].title);
  } catch (e) {
    console.log("Sports failed:", e.message);
  }
  
  try {
    const res3 = await rssParser.parseURL('https://www.bing.com/news/search?q=India&format=rss');
    console.log("India items:", res3.items.length, res3.items[0].title);
  } catch(e) {
    console.log("India failed:", e.message);
  }
}
t();
