import { useEffect, useState } from 'react';
import { useAppStore } from './store/appStore';
import { Home } from './pages/Home';
import { Favorites } from './pages/Favorites';
import { Settings } from './pages/Settings';
import { PodcastDetail } from './pages/PodcastDetail';
import { Player } from './components/layout/Player';
import { BottomNav } from './components/layout/BottomNav';
import { SleepTimerMenu } from './components/layout/SleepTimerMenu';
import { PodcastChannel } from './types';
import { prefetchAllChannels } from './lib/api';

export default function App() {
  const theme = useAppStore(state => state.theme);
  const activeTab = useAppStore(state => state.activeTab);
  const [selectedPodcast, setSelectedPodcast] = useState<PodcastChannel | null>(null);

  // Background prefetch all channels on app mount to ensure offline availability and auto-updates
  useEffect(() => {
    // We delay the background prefetch slightly to make sure the app finishes initial render smoothly
    const timer = setTimeout(() => {
      prefetchAllChannels();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Handle Safari Audio Context Unlock on first tap
  useEffect(() => {
    const unlockAudio = () => {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        ctx.resume().then(() => {
          document.removeEventListener('click', unlockAudio);
          document.removeEventListener('touchstart', unlockAudio);
        });
      }
    };
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  return (
    <div className="min-h-screen pb-[calc(4rem+env(safe-area-inset-bottom))] relative selection:bg-primary/30">
      {/* Routing based on activeTab */}
      {activeTab === 'home' && (
        selectedPodcast ? (
          <PodcastDetail 
            podcast={selectedPodcast} 
            onBack={() => setSelectedPodcast(null)} 
          />
        ) : (
          <Home onSelectPodcast={setSelectedPodcast} />
        )
      )}
      
      {activeTab === 'favorites' && <Favorites />}
      {activeTab === 'settings' && <Settings />}

      {/* Global Components */}
      <Player />
      <BottomNav />
      <SleepTimerMenu />
    </div>
  );
}
