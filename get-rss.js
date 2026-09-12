const podcasts = [
  "Giang Ơi Radio",
  "Minh Niệm",
  "Hieu.TV",
  "Better Version"
];

async function findFeeds() {
  for (const name of podcasts) {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(name)}&media=podcast&limit=1`);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      console.log(name, data.results[0].feedUrl);
    } else {
      console.log(name, "NOT FOUND");
    }
  }
}
findFeeds();
