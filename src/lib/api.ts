import { PodcastChannel, Episode } from '../types';
import { stripHtml, parseDuration } from './utils';

export const CHANNELS: PodcastChannel[] = [
  {
    id: 'giang-oi',
    title: 'Giang Ơi Radio',
    description: 'Nơi Giang chia sẻ những suy nghĩ về cuộc sống, tình yêu, và mọi thứ.',
    feedUrl: 'https://feeds.soundcloud.com/users/soundcloud:users:341012174/sounds.rss',
    imageUrl: 'https://i1.sndcdn.com/avatars-5pPxxdlhygpRWRbY-AXPnbw-original.jpg',
    author: 'Giang Ơi'
  },
  {
    id: 'minh-niem',
    title: 'Thầy Minh Niệm',
    description: 'Những bài giảng về thiền và tâm lý.',
    feedUrl: 'https://anchor.fm/s/19d07410/podcast/rss',
    imageUrl: 'https://d3t3ozftmdmh3i.cloudfront.net/staging/podcast_uploaded_nologo/4230916/4230916-1723627030094-bbaef0ff94e35.jpg',
    author: 'Minh Niệm'
  },
  {
    id: 'hieu-tv',
    title: 'Hieu.TV',
    description: 'Chia sẻ về quản lý tài chính cá nhân, đầu tư và cuộc sống.',
    feedUrl: 'https://anchor.fm/s/4cfb55bc/podcast/rss',
    imageUrl: 'https://d3t3ozftmdmh3i.cloudfront.net/staging/podcast_uploaded_nologo/12815399/12815399-1729000052292-46e763b3cbec4.jpg',
    author: 'Hieu Nguyen'
  },
  {
    id: 'better-version',
    title: 'Better Version',
    description: 'Kênh podcast giúp bạn trở thành phiên bản tốt hơn của chính mình.',
    feedUrl: 'https://anchor.fm/s/6d0b6694/podcast/rss', 
    imageUrl: 'https://d3t3ozftmdmh3i.cloudfront.net/staging/podcast_uploaded_nologo/18194637/18194637-1769227105130-a2490b1e1541b.jpg',
    author: 'Better Version'
  }
];

function findElementByTagNames(parent: Element | Document, tagNames: string[]): Element | null {
  for (const tagName of tagNames) {
    const elem = parent.querySelector(tagName);
    if (elem) return elem;
  }
  const children = Array.from(parent.querySelectorAll('*'));
  for (const child of children) {
    const localName = child.localName || child.tagName.split(':').pop() || '';
    if (tagNames.some(t => t.toLowerCase() === localName.toLowerCase() || t.toLowerCase() === child.tagName.toLowerCase())) {
      return child;
    }
  }
  return null;
}

function parseXmlToFeed(xmlText: string, channel: PodcastChannel): { episodes: Episode[], imageUrl: string, description: string } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');

  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    console.warn('XML parsing error, using fallback matching:', parserError.textContent);
  }

  const channelElem = doc.querySelector('channel') || doc;
  
  let channelImage = channel.imageUrl;
  const imageUrlElem = channelElem.querySelector('image > url');
  if (imageUrlElem?.textContent) {
    channelImage = imageUrlElem.textContent.trim();
  } else {
    const itunesImage = findElementByTagNames(channelElem, ['itunes:image', 'image']);
    const href = itunesImage?.getAttribute('href') || itunesImage?.getAttribute('url');
    if (href) channelImage = href.trim();
  }

  const channelDesc = channelElem.querySelector('description')?.textContent || channel.description;

  const items = Array.from(doc.querySelectorAll('item')).slice(0, 50);
  const episodes: Episode[] = items.map((item) => {
    const title = item.querySelector('title')?.textContent || 'Untitled';
    const guid = item.querySelector('guid')?.textContent || item.querySelector('link')?.textContent || Math.random().toString(36);
    const pubDate = item.querySelector('pubDate')?.textContent || '';
    
    const durationElem = findElementByTagNames(item, ['itunes:duration', 'duration']);
    const duration = durationElem?.textContent || '';
    
    let description = stripHtml(
      item.querySelector('description')?.textContent || 
      item.querySelector('summary')?.textContent || 
      ''
    ).trim();
    if (description.length > 200) {
      description = description.substring(0, 200) + '...';
    }
    
    const enclosure = item.querySelector('enclosure');
    const audioUrl = enclosure?.getAttribute('url') || '';
    
    let itemImage = channelImage;
    const itunesItemImage = findElementByTagNames(item, ['itunes:image', 'image']);
    const itemHref = itunesItemImage?.getAttribute('href') || itunesItemImage?.getAttribute('url');
    if (itemHref) itemImage = itemHref.trim();

    return {
      id: guid,
      title,
      pubDate,
      duration,
      description,
      audioUrl,
      imageUrl: itemImage,
      podcastId: channel.id,
      podcastTitle: channel.title
    };
  }).filter((e: Episode) => e.audioUrl !== '');

  return {
    episodes,
    imageUrl: channelImage,
    description: stripHtml(channelDesc)
  };
}

function isValidXmlFeed(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.startsWith('<!DOCTYPE html') || trimmed.startsWith('<html') || trimmed.startsWith('<DOCTYPE html')) {
    return false;
  }
  return (
    trimmed.includes('<rss') ||
    trimmed.includes('<channel') ||
    trimmed.includes('<feed') ||
    trimmed.includes('<xml')
  );
}

interface FeedCacheEntry {
  data: { episodes: Episode[], imageUrl: string, description: string };
  timestamp: number;
}

const feedCache: Record<string, FeedCacheEntry> = (() => {
  const cache: Record<string, FeedCacheEntry> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('podcast_feed_cache_')) {
        const id = key.substring('podcast_feed_cache_'.length);
        const item = localStorage.getItem(key);
        if (item) {
          cache[id] = JSON.parse(item);
        }
      }
    }
  } catch (e) {
    console.error('Error loading feed cache from localStorage:', e);
  }
  return cache;
})();

const CACHE_DURATION = 15 * 60 * 1000; // Cache 15 minutes to avoid hitting rate-limiting

function saveToCache(channelId: string, data: { episodes: Episode[], imageUrl: string, description: string }) {
  const entry: FeedCacheEntry = { data, timestamp: Date.now() };
  feedCache[channelId] = entry;
  try {
    localStorage.setItem(`podcast_feed_cache_${channelId}`, JSON.stringify(entry));
  } catch (e) {
    console.error('Error saving feed cache to localStorage:', e);
  }
}

export function getCachedFeed(channelId: string): { episodes: Episode[], imageUrl: string, description: string } | null {
  const cached = feedCache[channelId];
  return cached ? cached.data : null;
}

export async function prefetchAllChannels() {
  console.log('Starting background prefetch for all podcast channels...');
  // Loop sequentially with a small gap to fetch in the background without slamming the API
  for (const channel of CHANNELS) {
    try {
      console.log(`Prefetching background updates for: ${channel.title}`);
      const data = await fetchPodcastFeed(channel, true);
      console.log(`Prefetch completed for: ${channel.title}. Total episodes: ${data.episodes.length}`);
    } catch (err) {
      console.warn(`Background prefetch failed for: ${channel.title}`, err);
    }
  }
}

export async function fetchPodcastFeed(channel: PodcastChannel, forceRefresh = false): Promise<{ episodes: Episode[], imageUrl: string, description: string }> {
  const cached = feedCache[channel.id];

  // 1. If fresh cache exists and not forcing refresh, return it instantly
  if (!forceRefresh && cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    console.log(`Returning fresh cached feed for: ${channel.title}`);
    return cached.data;
  }

  // 2. Try to fetch fresh data
  try {
    // Strategy 1: Direct fetch attempt first (Extremely fast & reliable because hosts like Anchor.fm allow CORS '*' directly!)
    try {
      console.log(`Trying direct fetch for: ${channel.title}`);
      const directRes = await fetch(channel.feedUrl);
      if (directRes.ok) {
        const xml = await directRes.text();
        if (isValidXmlFeed(xml)) {
          const parsed = parseXmlToFeed(xml, channel);
          if (parsed.episodes.length > 0) {
            console.log(`Successfully fetched feed directly from source: ${channel.title}`);
            saveToCache(channel.id, parsed);
            return parsed;
          }
        }
      }
    } catch (directErr) {
      console.warn(`Direct fetch failed (likely CORS restriction for some hosts, falling back to proxies):`, directErr);
    }

    // Strategy 2: Local /api/feed (Works in local dev and Cloudflare Pages Functions)
    try {
      console.log(`Trying local proxy: /api/feed`);
      const response = await fetch(`/api/feed?url=${encodeURIComponent(channel.feedUrl)}`);
      if (response.ok) {
        const text = await response.text();
        const trimmed = text.trim();
        
        // Check if response is JSON (from Express server)
        if (trimmed.startsWith('{')) {
          const data = JSON.parse(trimmed);
          const channelImage = data.image?.url || data.itunes?.image || channel.imageUrl;
          const channelDesc = data.description || channel.description;

          const episodes: Episode[] = (data.items || []).slice(0, 50).map((item: any) => {
            const rawDesc = stripHtml(item.contentSnippet || item.content || item.description || '');
            const truncatedDesc = rawDesc.length > 200 ? rawDesc.substring(0, 200) + '...' : rawDesc;
            return {
              id: item.guid || item.id || item.link || Math.random().toString(36),
              title: item.title,
              pubDate: item.pubDate || item.isoDate,
              duration: item.itunesDuration,
              description: truncatedDesc,
              audioUrl: item.enclosure?.url || '',
              imageUrl: item.itunes?.image || channelImage,
              podcastId: channel.id,
              podcastTitle: channel.title
            };
          }).filter((e: Episode) => e.audioUrl !== '');

          if (episodes.length > 0) {
            const result = { episodes, imageUrl: channelImage, description: stripHtml(channelDesc) };
            saveToCache(channel.id, result);
            return result;
          }
        } else if (isValidXmlFeed(text)) {
          // Returned raw XML from Cloudflare Pages Function
          const parsed = parseXmlToFeed(text, channel);
          if (parsed.episodes.length > 0) {
            saveToCache(channel.id, parsed);
            return parsed;
          }
        }
      }
    } catch (err) {
      console.warn('Strategy 2 /api/feed failed, falling back...', err);
    }

    // Strategy 3: Try JSON-wrapped AllOrigins with Base64 Decoding (Extremely reliable fallback that SoundCloud never blocks!)
    try {
      console.log(`Trying JSON-wrapped AllOrigins for: ${channel.title}`);
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(channel.feedUrl)}`);
      if (res.ok) {
        const json = await res.json();
        const contents = json.contents;
        if (contents) {
          let xmlText = '';
          if (contents.startsWith('data:')) {
            const base64Index = contents.indexOf('base64,');
            if (base64Index !== -1) {
              const base64Str = contents.substring(base64Index + 7);
              try {
                xmlText = decodeURIComponent(escape(atob(base64Str)));
              } catch (e) {
                xmlText = atob(base64Str);
              }
            }
          } else {
            xmlText = contents;
          }

          if (isValidXmlFeed(xmlText)) {
            const parsed = parseXmlToFeed(xmlText, channel);
            if (parsed.episodes.length > 0) {
              console.log(`Successfully loaded and parsed feed via JSON-wrapped AllOrigins Base64 for: ${channel.title}`);
              saveToCache(channel.id, parsed);
              return parsed;
            }
          }
        }
      }
    } catch (allOriginsErr) {
      console.warn('JSON-wrapped AllOrigins fetch failed:', allOriginsErr);
    }

    // Strategy 4: Public CORS proxies (backup fallbacks)
    const proxies = [
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(channel.feedUrl)}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(channel.feedUrl)}`
    ];

    for (const proxyUrl of proxies) {
      try {
        console.log(`Trying proxy: ${proxyUrl}`);
        const res = await fetch(proxyUrl);
        if (res.ok) {
          const text = await res.text();
          if (isValidXmlFeed(text)) {
            const parsed = parseXmlToFeed(text, channel);
            if (parsed.episodes.length > 0) {
              console.log(`Successfully loaded and parsed feed via: ${proxyUrl}`);
              saveToCache(channel.id, parsed);
              return parsed;
            }
          }
        }
      } catch (proxyErr) {
        console.warn(`Proxy ${proxyUrl} failed:`, proxyErr);
      }
    }
  } catch (outerErr) {
    console.error('Outer fetching error:', outerErr);
  }

  // 3. Fallback: If all network attempts failed but we have stale cache, return it to avoid app breaking!
  if (cached) {
    console.warn(`All network attempts failed. Returning stale cache for offline use: ${channel.title}`);
    return cached.data;
  }

  throw new Error(`Không thể tải nguồn cấp podcast cho kênh ${channel.title}. Vui lòng kiểm tra lại kết nối mạng.`);
}
