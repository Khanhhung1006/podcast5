import { create } from 'zustand';
import { Episode } from '../types';
import { Howl, Howler } from 'howler';
import { persist } from 'zustand/middleware';

interface AudioState {
  currentEpisode: Episode | null;
  queue: Episode[];
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  playbackRate: number;
  volume: number;
  howl: Howl | null;
  isBuffering: boolean;
  
  sleepTimer: number | null;
  setSleepTimer: (seconds: number | null) => void;
  showSleepTimerMenu: boolean;
  setShowSleepTimerMenu: (show: boolean) => void;
  tickSleepTimer: () => void;
  
  // Actions
  play: (episode: Episode, queue?: Episode[]) => void;
  togglePlayPause: () => void;
  pause: () => void;
  seek: (time: number) => void;
  skipForward: () => void;
  skipBackward: () => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (volume: number) => void;
  next: () => void;
  previous: () => void;
  updateTime: (time: number) => void;
  cleanup: () => void;
}

export const useAudioStore = create<AudioState>()((set, get) => ({
  currentEpisode: null,
  queue: [],
  isPlaying: false,
  duration: 0,
  currentTime: 0,
  playbackRate: 1,
  volume: 1,
  howl: null,
  isBuffering: false,
  sleepTimer: null,
  showSleepTimerMenu: false,

  setSleepTimer: (seconds) => set({ sleepTimer: seconds }),
  setShowSleepTimerMenu: (show) => set({ showSleepTimerMenu: show }),
  
  tickSleepTimer: () => {
    const { sleepTimer, pause, isPlaying } = get();
    if (sleepTimer === null) return;
    
    if (sleepTimer <= 0) {
      if (isPlaying) {
        pause();
      }
      set({ sleepTimer: null });
      return;
    }
    set({ sleepTimer: sleepTimer - 1 });
  },

  play: (episode, queue = []) => {
    const { howl, playbackRate, volume } = get();
    if (howl) {
      howl.unload();
    }

    // Initialize Howler instance
    const newHowl = new Howl({
      src: [episode.audioUrl],
      html5: true, // Force HTML5 Audio to stream (essential for large files and Safari!)
      preload: 'metadata',
      rate: playbackRate,
      volume: volume,
      onplay: () => {
        set({ isPlaying: true, isBuffering: false });
        
        // Setup Media Session API
        if ('mediaSession' in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: episode.title,
            artist: episode.podcastTitle,
            artwork: [
              { src: episode.imageUrl, sizes: '512x512', type: 'image/png' }
            ]
          });

          navigator.mediaSession.setActionHandler('play', () => get().togglePlayPause());
          navigator.mediaSession.setActionHandler('pause', () => get().togglePlayPause());
          navigator.mediaSession.setActionHandler('seekbackward', () => get().skipBackward());
          navigator.mediaSession.setActionHandler('seekforward', () => get().skipForward());
          navigator.mediaSession.setActionHandler('previoustrack', () => get().previous());
          navigator.mediaSession.setActionHandler('nexttrack', () => get().next());
        }
      },
      onpause: () => {
        set({ isPlaying: false });
      },
      onend: () => {
        set({ isPlaying: false });
        get().next();
      },
      onload: () => {
        set({ duration: newHowl.duration() });
      },
      onloaderror: () => {
        set({ isBuffering: false, isPlaying: false });
        console.error("Audio load error");
      },
      onplayerror: () => {
        newHowl.once('unlock', () => {
          newHowl.play();
        });
      }
    });

    set({ 
      currentEpisode: episode, 
      queue: queue.length > 0 ? queue : [episode], 
      howl: newHowl,
      isBuffering: true,
      currentTime: episode.progress || 0
    });
    
    // Auto-resume if progress exists
    if (episode.progress && episode.progress > 0) {
      newHowl.seek(episode.progress);
    }
    
    newHowl.play();
  },

  togglePlayPause: () => {
    const { howl, isPlaying } = get();
    if (!howl) return;
    if (isPlaying) {
      howl.pause();
    } else {
      howl.play();
    }
  },

  pause: () => {
    const { howl } = get();
    if (howl) {
      howl.pause();
    }
  },

  seek: (time) => {
    const { howl } = get();
    if (howl) {
      howl.seek(time);
      set({ currentTime: time });
    }
  },

  skipForward: () => {
    const { howl, currentTime, duration } = get();
    if (howl) {
      const newTime = Math.min(currentTime + 30, duration);
      howl.seek(newTime);
      set({ currentTime: newTime });
    }
  },

  skipBackward: () => {
    const { howl, currentTime } = get();
    if (howl) {
      const newTime = Math.max(currentTime - 15, 0);
      howl.seek(newTime);
      set({ currentTime: newTime });
    }
  },

  setPlaybackRate: (rate) => {
    const { howl } = get();
    if (howl) {
      howl.rate(rate);
    }
    set({ playbackRate: rate });
  },

  setVolume: (volume) => {
    const { howl } = get();
    if (howl) {
      howl.volume(volume);
    }
    set({ volume });
  },

  next: () => {
    const { queue, currentEpisode } = get();
    if (!currentEpisode) return;
    const currentIndex = queue.findIndex(e => e.id === currentEpisode.id);
    if (currentIndex >= 0 && currentIndex < queue.length - 1) {
      get().play(queue[currentIndex + 1], queue);
    }
  },

  previous: () => {
    const { queue, currentEpisode, currentTime } = get();
    if (!currentEpisode) return;
    
    // If more than 3 seconds in, just restart current track
    if (currentTime > 3) {
      get().seek(0);
      return;
    }

    const currentIndex = queue.findIndex(e => e.id === currentEpisode.id);
    if (currentIndex > 0) {
      get().play(queue[currentIndex - 1], queue);
    }
  },

  updateTime: (time) => {
    set({ currentTime: time });
  },

  cleanup: () => {
    const { howl } = get();
    if (howl) {
      howl.unload();
    }
  }
}));

// Setup global timer loop
setInterval(() => {
  const state = useAudioStore.getState();
  
  // Update playback time
  if (state.isPlaying && state.howl) {
    const time = state.howl.seek() as number;
    if (typeof time === 'number') {
      state.updateTime(time);
    }
  }
  
  // Tick sleep timer
  if (state.sleepTimer !== null) {
    state.tickSleepTimer();
  }
}, 1000);
