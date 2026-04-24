import fetch from 'node-fetch';

async function testFetch() {
  const url = 'https://news.google.com/rss/headlines/section/topic/SPORTS?hl=en-IN&gl=IN&ceid=IN:en';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Cache-Control': 'no-cache',
      }
    });
    console.log("Status:", res.status);
    console.log("Body:", await res.text());
  } catch (e) {
    console.log("Error:", e);
  }
}
testFetch();
