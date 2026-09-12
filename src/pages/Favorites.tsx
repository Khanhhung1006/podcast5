import { useFavoritesStore } from '../store/favoritesStore';
import { useAudioStore } from '../store/audioStore';
import { Play } from 'lucide-react';
import { formatDuration } from '../lib/utils';

export function Favorites() {
  const favorites = useFavoritesStore(state => state.favorites);
  const play = useAudioStore(state => state.play);
  const currentEpisode = useAudioStore(state => state.currentEpisode);
  const isPlaying = useAudioStore(state => state.isPlaying);
  
  const episodes = Object.values(favorites);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:px-8 pt-safe">
      <h1 className="text-3xl font-bold mb-8">Yêu thích</h1>
      
      {episodes.length === 0 ? (
        <div className="text-center text-muted py-20">
          Chưa có tập podcast nào trong danh sách yêu thích.
        </div>
      ) : (
        <div className="space-y-4">
          {episodes.map(episode => {
            const isCurrent = currentEpisode?.id === episode.id;
            
            return (
              <div 
                key={episode.id}
                className="flex items-center gap-4 p-4 rounded-2xl bg-surface hover:bg-surface/80 transition-colors cursor-pointer group"
                onClick={() => !isCurrent && play(episode, episodes)}
              >
                <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-border">
                  <img src={episode.imageUrl} alt="" className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <Play className="text-white ml-0.5" size={20} fill="currentColor" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold line-clamp-1 mb-1 ${isCurrent ? 'text-primary' : ''}`}>
                    {episode.title}
                  </h3>
                  <div className="flex items-center text-xs text-muted">
                    <span className="truncate">{episode.podcastTitle}</span>
                    <span className="mx-2">•</span>
                    <span>{episode.duration}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
