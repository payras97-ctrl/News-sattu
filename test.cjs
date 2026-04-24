import fetch from "node-fetch";

async function test() {
  const url = `https://newsapi.org/v2/top-headlines?country=in&category=general&apiKey=6af246a0593b4a0194c13a3a2f4a8dac`;
  const res = await fetch(url);
  const data = await res.json();
  console.log("Response:", JSON.stringify(data, null, 2));
}

test();
