import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Episode } from '../types';

interface RecentState {
  recentEpisodes: Record<string, Episode>;
  saveProgress: (episode: Episode, progress: number) => void;
  getRecentEpisode: (podcastId: string) => Episode | undefined;
}

export const useRecentStore = create<RecentState>()(
  persist(
    (set, get) => ({
      recentEpisodes: {},
      saveProgress: (episode, progress) => {
        set((state) => ({
          recentEpisodes: {
            ...state.recentEpisodes,
            [episode.id]: { ...episode, progress }
          }
        }));
      },
      getRecentEpisode: (podcastId) => {
        const episodes = Object.values(get().recentEpisodes);
        // This is a simplified logic, ideally we store by ID and retrieve
        return episodes.find(e => e.podcastId === podcastId);
      }
    }),
    {
      name: 'podcast-recent',
    }
  )
);
