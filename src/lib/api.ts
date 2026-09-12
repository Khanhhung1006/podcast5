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

function parseXmlToFeed(xmlText: string, channel: PodcastChannel): { episodes: Episode[], imageUrl: string, description: string } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');

  const channelElem = doc.querySelector('channel');
  const channelImage = 
    channelElem?.querySelector('image > url')?.textContent ||
    channelElem?.getElementsByTagName('itunes:image')[0]?.getAttribute('href') ||
    channel.imageUrl;

  const channelDesc = channelElem?.querySelector('description')?.textContent || channel.description;

  const items = Array.from(doc.querySelectorAll('item'));
  const episodes: Episode[] = items.map((item) => {
    const title = item.querySelector('title')?.textContent || 'Untitled';
    const guid = item.querySelector('guid')?.textContent || item.querySelector('link')?.textContent || Math.random().toString(36);
    const pubDate = item.querySelector('pubDate')?.textContent || '';
    const duration = item.getElementsByTagName('itunes:duration')[0]?.textContent || '';
    const description = stripHtml(item.querySelector('description')?.textContent || '');
    const enclosure = item.querySelector('enclosure');
    const audioUrl = enclosure?.getAttribute('url') || '';
    const itemImage = item.getElementsByTagName('itunes:image')[0]?.getAttribute('href') || channelImage;

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

export async function fetchPodcastFeed(channel: PodcastChannel): Promise<{ episodes: Episode[], imageUrl: string, description: string }> {
  // Strategy 1: Try /api/feed (Works in local dev and Cloudflare Pages Functions)
  try {
    const response = await fetch(`/api/feed?url=${encodeURIComponent(channel.feedUrl)}`);
    if (response.ok) {
      const text = await response.text();
      // Check if response is JSON (from Express server)
      if (text.trim().startsWith('{')) {
        const data = JSON.parse(text);
        const channelImage = data.image?.url || data.itunes?.image || channel.imageUrl;
        const channelDesc = data.description || channel.description;

        const episodes: Episode[] = (data.items || []).map((item: any) => ({
          id: item.guid || item.id || item.link || Math.random().toString(36),
          title: item.title,
          pubDate: item.pubDate || item.isoDate,
          duration: item.itunesDuration,
          description: stripHtml(item.contentSnippet || item.content || item.description),
          audioUrl: item.enclosure?.url || '',
          imageUrl: item.itunes?.image || channelImage,
          podcastId: channel.id,
          podcastTitle: channel.title
        })).filter((e: Episode) => e.audioUrl !== '');

        return { episodes, imageUrl: channelImage, description: stripHtml(channelDesc) };
      } else {
        // Returned raw XML from Cloudflare Pages Function
        return parseXmlToFeed(text, channel);
      }
    }
  } catch (err) {
    console.warn('Local /api/feed unavailable, attempting fallback proxies...', err);
  }

  // Strategy 2: Fallback to CORS proxy (Works in GitHub Pages, Static hosting, Capacitor WebView)
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(channel.feedUrl)}`;
    const fallbackRes = await fetch(proxyUrl);
    if (fallbackRes.ok) {
      const xml = await fallbackRes.text();
      return parseXmlToFeed(xml, channel);
    }
  } catch (fallbackErr) {
    console.error('Proxy fallback failed:', fallbackErr);
  }

  // Strategy 3: Direct fetch attempt (if CORS allowed by host)
  try {
    const directRes = await fetch(channel.feedUrl);
    if (directRes.ok) {
      const xml = await directRes.text();
      return parseXmlToFeed(xml, channel);
    }
  } catch (directErr) {
    console.error('Direct fetch failed:', directErr);
  }

  throw new Error(`Không thể tải nguồn cấp podcast cho kênh ${channel.title}`);
}
