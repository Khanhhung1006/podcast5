export interface PodcastChannel {
  id: string;
  title: string;
  description: string;
  feedUrl: string;
  imageUrl: string;
  author: string;
  episodesCount?: number;
}

export interface Episode {
  id: string;
  title: string;
  pubDate: string;
  duration?: string;
  description: string;
  audioUrl: string;
  imageUrl: string;
  podcastId: string;
  podcastTitle: string;
  progress?: number; // saved progress in seconds
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  skipSilence: boolean;
  autoPlay: boolean;
  autoResume: boolean;
}
