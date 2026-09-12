import express from "express";
import path from "path";
import Parser from "rss-parser";
import { createServer as createViteServer } from "vite";

const parser = new Parser({
  customFields: {
    item: [
      ['itunes:duration', 'itunesDuration'],
      ['itunes:subtitle', 'itunesSubtitle'],
      ['itunes:summary', 'itunesSummary'],
    ]
  }
});

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  // CORS middleware for API
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/feed", async (req, res) => {
    const feedUrl = req.query.url as string;
    if (!feedUrl) {
      return res.status(400).json({ error: "Missing feed URL" });
    }

    try {
      console.log(`Fetching RSS feed: ${feedUrl}`);
      // Use native fetch to get XML, then parse with rss-parser
      // This helps avoiding some header issues with direct parser.parseURL
      const response = await fetch(feedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      let xml = await response.text();
      xml = xml.trim().replace(/^\uFEFF/, ''); // Remove BOM and whitespace
      const feed = await parser.parseString(xml);
      res.json(feed);
    } catch (error: any) {
      console.error(`Error fetching feed ${feedUrl}:`, error);
      res.status(500).json({ error: "Failed to fetch or parse feed", details: error.message });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
