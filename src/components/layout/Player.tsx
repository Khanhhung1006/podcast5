import { useState, useEffect, useRef } from 'react';
import { useAudioStore } from '../../store/audioStore';
import { useRecentStore } from '../../store/recentStore';
import { useFavoritesStore } from '../../store/favoritesStore';
import { Play, Pause, SkipBack, SkipForward, ChevronDown, MoreVertical, FastForward, Rewind, Moon, Share, Heart } from 'lucide-react';
import { formatDuration } from '../../lib/utils';
import { motion, AnimatePresence, useDragControls } from 'motion/react';

export function Player() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const currentEpisode = useAudioStore(state => state.currentEpisode);
  const isPlaying = useAudioStore(state => state.isPlaying);
  const isBuffering = useAudioStore(state => state.isBuffering);
  const currentTime = useAudioStore(state => state.currentTime);
  const duration = useAudioStore(state => state.duration);
  const playbackRate = useAudioStore(state => state.playbackRate);
  const howl = useAudioStore(state => state.howl);
  
  const togglePlayPause = useAudioStore(state => state.togglePlayPause);
  const pause = useAudioStore(state => state.pause);
  const seek = useAudioStore(state => state.seek);
  const next = useAudioStore(state => state.next);
  const previous = useAudioStore(state => state.previous);
  const skipForward = useAudioStore(state => state.skipForward);
  const skipBackward = useAudioStore(state => state.skipBackward);
  const setPlaybackRate = useAudioStore(state => state.setPlaybackRate);
  
  const sleepTimer = useAudioStore(state => state.sleepTimer);
  const setSleepTimer = useAudioStore(state => state.setSleepTimer);
  const showSleepTimerMenu = useAudioStore(state => state.showSleepTimerMenu);
  const setShowSleepTimerMenu = useAudioStore(state => state.setShowSleepTimerMenu);
  
  const saveProgress = useRecentStore(state => state.saveProgress);
  const toggleFavorite = useFavoritesStore(state => state.toggleFavorite);
  const favorites = useFavoritesStore(state => state.favorites);
  
  const isFav = currentEpisode ? !!favorites[currentEpisode.id] : false;

  const dragControls = useDragControls();

  // Periodically save progress
  useEffect(() => {
    if (!currentEpisode || !isPlaying) return;
    const interval = setInterval(() => {
      saveProgress(currentEpisode, currentTime);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentEpisode, isPlaying, currentTime, saveProgress]);

  if (!currentEpisode) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    seek(time);
  };

  const handleRateCycle = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  };

  return (
    <>
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-50 p-2 md:p-4"
          >
            <div className="max-w-5xl mx-auto glass rounded-3xl p-3 flex items-center gap-4 shadow-xl border border-white/20 cursor-pointer"
                 onClick={() => setIsExpanded(true)}>
              <div className="w-14 h-14 shrink-0 rounded-2xl overflow-hidden relative bg-border">
                <img src={currentEpisode.imageUrl} className="w-full h-full object-cover" alt="" />
                {isBuffering && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm line-clamp-1">{currentEpisode.title}</h4>
                <p className="text-muted text-xs line-clamp-1">{currentEpisode.podcastTitle}</p>
              </div>
              
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <button onClick={togglePlayPause} className="p-3 bg-primary text-white rounded-full hover:bg-accent active:scale-95 transition-all shadow-md">
                  {isPlaying ? <Pause fill="currentColor" size={20} /> : <Play fill="currentColor" size={20} className="ml-0.5" />}
                </button>
              </div>
            </div>
            
            {/* Progress line */}
            <div className="absolute bottom-2 md:bottom-4 left-4 md:left-6 right-4 md:right-6 h-1 rounded-full overflow-hidden pointer-events-none z-10">
              <div className="h-full bg-primary/20 absolute inset-0" />
              <div className="h-full bg-primary absolute left-0 top-0 transition-all duration-1000 ease-linear" style={{ width: `${progressPercent}%` }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.y > 100 || velocity.y > 500) {
                setIsExpanded(false);
              }
            }}
            className="fixed inset-0 z-50 bg-[#121212] flex flex-col overflow-hidden"
          >
            {/* Rich Blurred Background reminiscent of YTM */}
            <div 
              className="absolute inset-0 opacity-40 blur-[80px] scale-150 pointer-events-none transition-opacity duration-1000 origin-top"
              style={{ 
                backgroundImage: `url(${currentEpisode.imageUrl})`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
              }} 
            />
            {/* Dark overlay to ensure text contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-[#121212] pointer-events-none" />
                 
            <div className="relative flex-1 flex flex-col w-full h-full text-white/90">
              
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-4 shrink-0">
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <ChevronDown size={32} />
                </button>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-white/50">Đang phát từ podcast</span>
                  <span className="text-sm font-bold line-clamp-1 max-w-[200px]">{currentEpisode.podcastTitle}</span>
                </div>
                <button className="p-2 -mr-2 hover:bg-white/10 rounded-full transition-colors">
                  <MoreVertical size={24} />
                </button>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col px-6 pb-8 overflow-y-auto overflow-x-hidden no-scrollbar justify-center max-w-md mx-auto w-full">
                
                {/* Artwork */}
                <motion.div 
                  className={`w-full aspect-square rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden bg-black/20 mb-8 transition-transform duration-500 ease-out border border-white/5 ${isPlaying ? 'scale-100' : 'scale-[0.97]'}`}
                >
                  <img src={currentEpisode.imageUrl} className="w-full h-full object-cover" alt="" />
                </motion.div>

                {/* Info & Actions */}
                <div className="flex items-start justify-between gap-4 mb-8">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold line-clamp-2 leading-tight mb-1">{currentEpisode.title}</h2>
                    <p className="text-white/60 text-lg line-clamp-1">{currentEpisode.podcastTitle}</p>
                  </div>
                  <div className="flex gap-2 shrink-0 pt-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(currentEpisode);
                      }}
                      className={`p-2 transition-colors ${isFav ? 'text-orange-500' : 'text-white/70 hover:text-white'}`}
                    >
                      <Heart size={24} className={isFav ? 'fill-orange-500 stroke-orange-500' : ''} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6 group">
                  <div className="relative h-1 bg-white/20 rounded-full mb-2">
                    <input 
                      type="range" 
                      min={0} 
                      max={duration || 100} 
                      value={currentTime} 
                      onChange={handleSeek}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                    <div 
                      className="absolute top-0 left-0 h-full bg-white rounded-full pointer-events-none z-10" 
                      style={{ width: `${progressPercent}%` }} 
                    />
                    {/* YTM style thumb that appears on hover/drag - standard css technique */}
                    <div 
                      className="absolute top-1/2 -mt-1.5 w-3 h-3 bg-white rounded-full shadow pointer-events-none z-10 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ left: `calc(${progressPercent}% - 6px)` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-medium text-white/50 tabular-nums">
                    <span>{formatDuration(currentTime)}</span>
                    <span>{formatDuration(duration)}</span>
                  </div>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center justify-between mb-8">
                  <button onClick={handleRateCycle} className="w-12 h-12 flex items-center justify-center font-bold text-sm text-white/70 hover:text-white transition-colors">
                    {playbackRate}x
                  </button>
                  <button onClick={previous} className="p-3 text-white hover:bg-white/10 rounded-full active:scale-95 transition-all">
                    <SkipBack size={32} />
                  </button>
                  <button onClick={togglePlayPause} className="w-20 h-20 bg-white text-black flex items-center justify-center rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all">
                    {isPlaying ? <Pause fill="currentColor" size={36} /> : <Play fill="currentColor" size={36} className="ml-1" />}
                  </button>
                  <button onClick={next} className="p-3 text-white hover:bg-white/10 rounded-full active:scale-95 transition-all">
                    <SkipForward size={32} />
                  </button>
                  <button 
                    onClick={() => setShowSleepTimerMenu(true)}
                    className={`w-12 h-12 flex flex-col items-center justify-center transition-all rounded-full hover:bg-white/10 ${sleepTimer !== null ? 'text-primary' : 'text-white/70 hover:text-white'}`}
                  >
                    <Moon size={20} className={sleepTimer !== null ? 'fill-primary' : ''} />
                    {sleepTimer !== null && <span className="text-[9px] font-bold leading-none mt-0.5">{Math.ceil(sleepTimer / 60)}m</span>}
                  </button>
                </div>
                
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
