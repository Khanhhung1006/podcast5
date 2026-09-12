const feeds = [
  'https://feeds.soundcloud.com/users/soundcloud:users:341012174/sounds.rss',
  'https://anchor.fm/s/19d07410/podcast/rss',
  'https://anchor.fm/s/4cfb55bc/podcast/rss',
  'https://anchor.fm/s/6d0b6694/podcast/rss',
  'https://podcasts.files.bbci.co.uk/p02pc9tn.rss',
  'https://learningenglish.voanews.com/api/z$q_oemqvv'
];

import Parser from 'rss-parser';
const parser = new Parser();

async function check() {
  for (const url of feeds) {
    try {
      const res = await fetch(url, { method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0' }});
      const xml = await res.text();
      const feed = await parser.parseString(xml);
      console.log(url, "=>", feed.itunes?.image || feed.image?.url);
    } catch(e) {
      console.log(url, "=> ERROR");
    }
  }
}
check();
