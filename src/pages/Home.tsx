import { useState } from 'react';
import { CHANNELS } from '../lib/api';
import { PodcastChannel } from '../types';
import { Search, Moon, Sun, Monitor } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { motion } from 'motion/react';

export function Home({ onSelectPodcast }: { onSelectPodcast: (podcast: PodcastChannel) => void }) {
  const [search, setSearch] = useState('');
  const { theme, setTheme } = useAppStore();

  const filtered = CHANNELS.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Podcast Learning</h1>
          <p className="text-muted mt-1 text-sm">Khám phá và lắng nghe mỗi ngày</p>
        </div>
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-full bg-surface border shadow-sm active:scale-95 transition-transform"
        >
          {theme === 'light' && <Sun size={20} />}
          {theme === 'dark' && <Moon size={20} />}
          {theme === 'system' && <Monitor size={20} />}
        </button>
      </header>

      <div className="relative mb-8 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Tìm kiếm podcast..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-14 pl-12 pr-4 rounded-2xl bg-surface border shadow-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all text-base"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {filtered.map((channel, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={channel.id}
            onClick={() => onSelectPodcast(channel)}
            className="group cursor-pointer rounded-3xl bg-surface border shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all"
          >
            <div className="aspect-square bg-border relative">
              <img 
                src={channel.imageUrl} 
                alt={channel.title} 
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">{channel.title}</h3>
              <p className="text-muted text-sm mt-1 line-clamp-2">{channel.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
