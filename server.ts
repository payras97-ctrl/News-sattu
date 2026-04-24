import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fetch from "node-fetch";
import Parser from "rss-parser";
import { GoogleDecoder } from "google-news-url-decoder";

// Dynamic import for readability and jsdom since they are CommonJS/ESM mixed in some environments
async function startServer() {
  const app = express();
  const PORT = 3000;
  const rssParser = new Parser();
  const googleDecoder = new GoogleDecoder();

  app.use(express.json());

  // Use dynamic imports to avoid type/module issues
  const { JSDOM } = await import("jsdom");
  const { Readability } = await import("@mozilla/readability");

  // API Route to proxy Google News RSS requests for 100% real-time news (bypassing NewsAPI 24h limits)
  app.get("/api/news", async (req, res) => {
    try {
      const { query, category, region, tl } = req.query;
      
      let url = '';
      const hl = 'en-IN';
      const gl = 'IN';
      const ceid = 'IN:en';
      
      if (query) {
        url = `https://news.google.com/rss/search?q=${encodeURIComponent(query as string)}&hl=${hl}&gl=${gl}&ceid=${ceid}`;
      } else {
        const isIndia = region === 'India';
        const cat = category ? category.toString().toLowerCase() : 'general';
        
        let topic = '';
        if (cat === 'sports') topic = 'SPORTS';
        else if (cat === 'entertainment') topic = 'ENTERTAINMENT';
        else if (cat === 'business') topic = 'BUSINESS';
        else if (cat === 'technology') topic = 'TECHNOLOGY';
        else if (cat === 'science') topic = 'SCIENCE';
        else if (cat === 'health') topic = 'HEALTH';
        else topic = isIndia ? 'NATION' : 'WORLD';

        url = `https://news.google.com/rss/headlines/section/topic/${topic}?hl=${hl}&gl=${gl}&ceid=${ceid}`;
      }

      let feed;
      try {
        feed = await rssParser.parseURL(url);
      } catch (e: any) {
        // Fallback to rss2json API on 503 or any parser error due to Google blocking our IP
        console.log("Parser failed:", e.message, "Falling back to rss2json...");
        const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
        const res = await fetch(rss2jsonUrl);
        const data = await res.json();
        if (data.status === 'ok') {
          // Map it to fit the parser model
          feed = {
            title: data.feed.title,
            items: data.items.map((i: any) => ({
              title: i.title,
              link: i.link,
              pubDate: i.pubDate,
              contentSnippet: i.description || i.content,
              source: ''
            }))
          };
        } else {
           throw new Error("rss2json failed too: " + data.message);
        }
      }
      
      let articles = feed.items.map(item => {
        let titleParts = item.title ? item.title.split(' - ') : [];
        let sourceName = item.source || (titleParts.length > 1 ? titleParts.pop()?.trim() : "News") || "News";
        let cleanTitle = titleParts.join(' - ').trim() || item.title || '';
        
        return {
          title: cleanTitle,
          description: '', // Clean up description since RSS returns mashed up html links
          url: item.link || '',
          publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
          source: { name: sourceName }
        };
      });

      // Pagination hack (we fetch all and slice)
      // Google News returns about 30-70 items.
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = 15;
      const totalResults = articles.length;
      articles = articles.slice((page - 1) * pageSize, page * pageSize);

      const data = {
        status: 'ok',
        totalResults,
        articles
      };
      
      // Native Translation Engine
      if (tl && tl !== 'en' && data.articles && data.articles.length > 0) {
        try {
          let stringsToTranslate: string[] = [];
          data.articles.forEach((a: any) => {
            stringsToTranslate.push(a.title || " ");
            stringsToTranslate.push(a.description || " ");
          });

          const separator = " ~|~ ";
          const combined = stringsToTranslate.join(separator);
          const tUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${tl}&dt=t&q=${encodeURIComponent(combined)}`;
          
          const tRes = await fetch(tUrl);
          const tData = await tRes.json();
          
          const translatedCombined = tData[0].map((item: any) => item[0]).join('');
          const translatedStrings = translatedCombined.split(separator).map((s: string) => s.trim());

          let stringIndex = 0;
          data.articles.forEach((a: any) => {
            if (translatedStrings[stringIndex]) a.title = translatedStrings[stringIndex];
            if (translatedStrings[stringIndex + 1]) a.description = translatedStrings[stringIndex + 1];
            stringIndex += 2;
          });
        } catch (e) {
          console.error("Native translation failed:", e);
        }
      }

      res.status(200).json(data);
    } catch (error) {
      console.error("Proxy error:", error);
      res.status(500).json({ message: "Failed to fetch top headlines" });
    }
  });

  // API Route to lazily fetch images from Google News articles
  app.get("/api/image", async (req, res) => {
    const targetUrl = req.query.url as string;
    const fallbackImage = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80';
    if (!targetUrl) return res.redirect(fallbackImage);
    
    try {
      let finalUrl = targetUrl;
      const decodedObj = await googleDecoder.decode(targetUrl);
      if (decodedObj.status && decodedObj.decoded_url) {
        finalUrl = decodedObj.decoded_url;
      }
      
      const response = await fetch(finalUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const html = await response.text();
      const ogImage = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i) || html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:image"[^>]*>/i);
      
      if (ogImage && ogImage[1]) {
        return res.redirect(ogImage[1]);
      } else {
        return res.redirect(fallbackImage);
      }
    } catch(e) {
      return res.redirect(fallbackImage);
    }
  });

  // API Route to proxy NewsAPI requests
  app.get("/api/extract", async (req, res) => {
    try {
      const gnewsUrl = req.query.url as string;
      const tl = req.query.tl as string;
      if (!gnewsUrl) {
        return res.status(400).json({ message: "URL is required" });
      }

      // First decode the Google News URL
      let targetUrl = gnewsUrl;
      try {
        const decodedObj = await googleDecoder.decode(gnewsUrl);
        if (decodedObj.status && decodedObj.decoded_url) {
          targetUrl = decodedObj.decoded_url;
        }
      } catch (e) {
        console.error("Decoder error:", e);
      }

      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status}`);
      }

      const html = await response.text();
      const doc = new JSDOM(html, { url: targetUrl });
      const reader = new Readability(doc.window.document);
      const article = reader.parse();

      if (!article) {
        return res.status(404).json({ message: "Could not extract article content" });
      }

      // Native Translation Engine for full article
      if (tl && tl !== 'en') {
        try {
          // Translate title and excerpt first
          const separator = " ~|~ ";
          const stringsToTranslate = [article.title || " ", article.excerpt || " "];
          
          // To translate the full content safely, instead of breaking parsing by translating HTML tags natively, 
          // we use the plaintext textContent and segment it.
          const bodySegments = article.textContent ? article.textContent.split('\n').filter(s => s.trim().length > 10).slice(0, 8) : [];
          stringsToTranslate.push(...bodySegments);

          const combined = stringsToTranslate.join(separator);
          
          // Google Translate URL
          const tUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${tl}&dt=t&q=${encodeURIComponent(combined)}`;
          const tRes = await fetch(tUrl);
          const tData = await tRes.json();

          const translatedCombined = tData[0].map((item: any) => item[0]).join('');
          const translatedStrings = translatedCombined.split(separator).map((s: string) => s.trim());

          article.title = translatedStrings[0] || article.title;
          article.excerpt = translatedStrings[1] || article.excerpt;
          
          const translatedBody = translatedStrings.slice(2);
          if (translatedBody.length > 0) {
            // Reconstruct HTML basic structure using the translated text
            article.content = translatedBody.map((p: string) => `<p>${p}</p>`).join('');
          }

        } catch (e) {
          console.error("Native extraction translation failed:", e);
        }
      }

      res.json({
        title: article.title,
        content: article.content, // HTML content
        textContent: article.textContent,
        byline: article.byline,
        siteName: article.siteName
      });
      
    } catch (error) {
      console.error("Extraction error:", error);
      res.status(500).json({ message: "Failed to extract article" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
