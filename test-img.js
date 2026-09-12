import Parser from 'rss-parser';

const parser = new Parser();

async function check() {
  const feedUrl = 'https://anchor.fm/s/6d0b6694/podcast/rss';
  const response = await fetch(feedUrl);
  const xml = await response.text();
  const feed = await parser.parseString(xml);
  console.log("Feed Image:", feed.image);
  console.log("Feed iTunes Image:", feed.itunes?.image);
  
  if (feed.items.length > 0) {
    console.log("Item iTunes Image:", feed.items[0].itunes?.image);
  }
}
check();
