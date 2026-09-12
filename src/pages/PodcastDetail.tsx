import { useState, useEffect } from 'react';
import { PodcastChannel, Episode } from '../types';
import { fetchPodcastFeed, getCachedFeed } from '../lib/api';
import { ChevronLeft, Play, Clock, Calendar, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { useAudioStore } from '../store/audioStore';
import { useRecentStore } from '../store/recentStore';
import { formatDate, formatDuration, parseDuration } from '../lib/utils';
import { motion } from 'motion/react';

export function PodcastDetail({ podcast, onBack }: { podcast: PodcastChannel, onBack: () => void }) {
  // Synchronously initialize the state from the cache (SWR Pattern)
  const cachedData = getCachedFeed(podcast.id);
  const [episodes, setEpisodes] = useState<Episode[]>(cachedData ? cachedData.episodes : []);
  const [loading, setLoading] = useState(episodes.length === 0);
  const [error, setError] = useState<string | null>(null);
  
  const play = useAudioStore(state => state.play);
  const currentEpisode = useAudioStore(state => state.currentEpisode);
  const isPlaying = useAudioStore(state => state.isPlaying);
  
  const recentEpisodes = useRecentStore(state => state.recentEpisodes);

  const loadFeed = async (force = false) => {
    // Only show full screen/list loader if we don't have any cached episodes to display
    if (episodes.length === 0) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await fetchPodcastFeed(podcast, force);
      setEpisodes(data.episodes);
    } catch (err: any) {
      // If we don't have cached data, show the full error screen
      if (episodes.length === 0) {
        setError(err.message || 'Lỗi khi tải dữ liệu');
      } else {
        console.warn('Background update failed, keeping cached episodes:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed(false);
  }, [podcast]);

  const handlePlay = (episode: Episode) => {
    const progress = recentEpisodes[episode.id]?.progress || 0;
    play({ ...episode, progress }, episodes);
  };

  const handlePlayAll = () => {
    if (episodes.length > 0) {
      handlePlay(episodes[0]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header Area */}
      <div className="sticky top-0 z-10 glass px-4 py-4 flex items-center gap-4 border-b">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-semibold truncate">{podcast.title}</h1>
      </div>

      <div className="p-4 md:p-8 flex flex-col md:flex-row gap-6 md:gap-10">
        <div className="w-48 h-48 md:w-72 md:h-72 shrink-0 mx-auto md:mx-0">
          <img src={podcast.imageUrl} alt={podcast.title} className="w-full h-full object-cover rounded-3xl shadow-xl border" />
        </div>
        <div className="flex flex-col justify-center text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">{podcast.title}</h1>
          <p className="text-muted text-lg mb-6 line-clamp-3 md:line-clamp-none">{podcast.description}</p>
          
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <button 
              onClick={handlePlayAll}
              disabled={loading || episodes.length === 0}
              className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-semibold hover:bg-accent active:scale-95 transition-all shadow-lg disabled:opacity-50"
            >
              <Play fill="currentColor" size={20} />
              <span>Phát tất cả</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 pb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
          <span>Danh sách tập ({episodes.length})</span>
          {loading && <RefreshCw className="animate-spin text-muted" size={20} />}
        </h2>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-3 border border-red-100 dark:border-red-900/30">
            <AlertCircle size={20} />
            <span className="flex-1">{error}</span>
            <button onClick={() => loadFeed(true)} className="px-3 py-1 bg-red-100 dark:bg-red-900/50 rounded-lg text-sm font-medium">Thử lại</button>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {episodes.map((ep, i) => {
            const isCurrent = currentEpisode?.id === ep.id;
            const progress = recentEpisodes[ep.id]?.progress || 0;
            const parsedDuration = parseDuration(ep.duration);
            const progressPercent = parsedDuration > 0 ? (progress / parsedDuration) * 100 : 0;
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i > 10 ? 0 : i * 0.05 }}
                key={ep.id}
                className={`p-4 rounded-3xl border transition-all ${isCurrent ? 'bg-primary/5 border-primary/20' : 'bg-surface hover:shadow-md'}`}
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 shrink-0 relative rounded-2xl overflow-hidden bg-border cursor-pointer" onClick={() => handlePlay(ep)}>
                    <img src={ep.imageUrl} alt={ep.title} loading="lazy" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Play fill="white" className="text-white" size={24} />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-center cursor-pointer" onClick={() => handlePlay(ep)}>
                    <h3 className={`font-semibold text-lg line-clamp-1 ${isCurrent ? 'text-primary' : ''}`}>
                      {ep.title}
                    </h3>
                    <p className="text-muted text-sm line-clamp-1 mt-1">{ep.description}</p>
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted font-medium">
                      <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(ep.pubDate)}</span>
                      {ep.duration && <span className="flex items-center gap-1"><Clock size={14} /> {formatDuration(parsedDuration)}</span>}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center pl-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handlePlay(ep); }}
                      className={`p-4 rounded-full transition-all ${isCurrent && isPlaying ? 'bg-primary text-white shadow-lg' : 'bg-border/50 hover:bg-primary/10 hover:text-primary'}`}
                    >
                      <Play fill={isCurrent && isPlaying ? "currentColor" : "none"} size={20} />
                    </button>
                  </div>
                </div>

                {/* Progress bar if partly played */}
                {progress > 0 && !isCurrent && (
                  <div className="mt-3 h-1 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
