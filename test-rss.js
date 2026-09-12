const feeds = [
  'https://anchor.fm/s/1729c130/podcast/rss'
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
