import { Home, Heart, Settings, Moon } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useAudioStore } from '../../store/audioStore';

export function BottomNav() {
  const activeTab = useAppStore(state => state.activeTab);
  const setActiveTab = useAppStore(state => state.setActiveTab);
  const setShowSleepTimerMenu = useAudioStore(state => state.setShowSleepTimerMenu);
  const sleepTimer = useAudioStore(state => state.sleepTimer);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-t border-border flex items-center justify-around px-2 z-40 pb-safe">
      <button 
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${activeTab === 'home' ? 'text-primary' : 'text-muted hover:text-foreground'}`}
      >
        <Home size={24} className={activeTab === 'home' ? 'fill-primary/20' : ''} />
        <span className="text-[10px] font-medium">Home</span>
      </button>

      <button 
        onClick={() => setActiveTab('favorites')}
        className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${activeTab === 'favorites' ? 'text-primary' : 'text-muted hover:text-foreground'}`}
      >
        <Heart size={24} className={activeTab === 'favorites' ? 'fill-primary/20' : ''} />
        <span className="text-[10px] font-medium">Yêu thích</span>
      </button>

      <button 
        onClick={() => setActiveTab('settings')}
        className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${activeTab === 'settings' ? 'text-primary' : 'text-muted hover:text-foreground'}`}
      >
        <Settings size={24} />
        <span className="text-[10px] font-medium">Cài đặt</span>
      </button>

      <button 
        onClick={() => setShowSleepTimerMenu(true)}
        className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${sleepTimer !== null ? 'text-primary' : 'text-muted hover:text-foreground'}`}
      >
        <Moon size={24} className={sleepTimer !== null ? 'fill-primary/20' : ''} />
        <span className="text-[10px] font-medium">Hẹn giờ</span>
      </button>
    </div>
  );
}
