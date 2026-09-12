import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Episode } from '../types';

interface FavoritesState {
  favorites: Record<string, Episode>;
  toggleFavorite: (episode: Episode) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: {},
      toggleFavorite: (episode) => {
        const { favorites } = get();
        const newFavs = { ...favorites };
        if (newFavs[episode.id]) {
          delete newFavs[episode.id];
        } else {
          newFavs[episode.id] = episode;
        }
        set({ favorites: newFavs });
      },
      isFavorite: (id) => {
        return !!get().favorites[id];
      }
    }),
    {
      name: 'podcast-favorites',
    }
  )
);
