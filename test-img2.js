import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: [
      ['itunes:image', 'itunesImage'],
    ],
    feed: [
      ['itunes:image', 'itunesImage'],
    ]
  }
});

async function check() {
  const feedUrl = 'https://anchor.fm/s/6d0b6694/podcast/rss';
  const response = await fetch(feedUrl);
  const xml = await response.text();
  const feed = await parser.parseString(xml);
  console.log("Feed image:", feed.image);
  console.log("Feed itunesImage:", feed.itunesImage);
  console.log("Feed itunes.image:", feed.itunes?.image);
}
check();
