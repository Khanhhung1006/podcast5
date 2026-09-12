const feeds = [
  'https://feeds.soundcloud.com/users/soundcloud:users:341012174/sounds.rss',
  'https://anchor.fm/s/19d07410/podcast/rss',
  'https://anchor.fm/s/4cfb55bc/podcast/rss',
  'https://anchor.fm/s/6d0b6694/podcast/rss'
];

async function check() {
  for (const url of feeds) {
    try {
      const res = await fetch(url, { method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0' }});
      console.log(url, res.status);
    } catch(e) {
      console.log(url, e.message);
    }
  }
}
check();
