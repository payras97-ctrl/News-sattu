import { GoogleDecoder } from 'google-news-url-decoder';
import fetch from 'node-fetch';

async function testFetch() {
    const gnUrl = 'https://news.google.com/rss/articles/CBMipwJBVV95cUxOUjlucWZIUl9RLVdMLW9fMFdVTkRqMnVDUWZSSmhhb3RaSjE5ZXlORmxFY1VtUmxMY2p4cFRlVW1XZDdWSmNOQXpuUGk3bkJyQlJBazJiZU04UzcwTHh4NWJWOWxVNzg0REF5V0did0RaQnBfdkJIWWpqWktmTkZ4SFcxcjBwMGVEZXlTSm4zRkxySVg0OWdSdjk3U3RyNUZjMjMxcS1OWWRCakJEaXVic1Q2Nld4WVl2a2VSd24wRktaNmVwUV8wbGZSSFh5SHlXWkhJeXhyWHR5bjgtaUZoTG5mQm5aVC0zTGFFRTJ0VVZWeENMczU5RGJsMW1oVUdlaDd3U3ZnUG8yMWw1NGl2YkFxcS00d0ktaUdKN1FWWExLOWZEMzNR?oc=5';
    const decoder = new GoogleDecoder();
    
    console.time("Decode");
    const decodedUrlObj = await decoder.decode(gnUrl);
    console.timeEnd("Decode");
    
    console.time("Fetch Image");
    const response = await fetch(decodedUrlObj.decoded_url);
    const text = await response.text();
    const ogImage = text.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i) || text.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:image"[^>]*>/i);
    console.timeEnd("Fetch Image");
    console.log("Image:", ogImage ? ogImage[1] : null);
}
testFetch();
