import fetch from 'node-fetch';

async function testLocalProxy() {
  const url = 'http://localhost:3000/api/news?category=sports&region=India&tl=en&page=1';
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Articles count:", data.articles?.length);
    console.log("Error:", data.message);
  } catch (e) {
    console.log("Error:", e.message);
  }
}
testLocalProxy();
