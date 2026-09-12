import { useAppStore } from '../store/appStore';
import { Moon, Sun, Monitor } from 'lucide-react';

export function Settings() {
  const theme = useAppStore(state => state.theme);
  const setTheme = useAppStore(state => state.setTheme);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:px-8 pt-safe">
      <h1 className="text-3xl font-bold mb-8">Cài đặt</h1>
      
      <div className="bg-surface rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Giao diện</h2>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setTheme('light')}
            className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${theme === 'light' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-border/50'}`}
          >
            <Sun size={24} />
            <span className="font-medium">Sáng</span>
          </button>
          
          <button 
            onClick={() => setTheme('dark')}
            className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${theme === 'dark' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-border/50'}`}
          >
            <Moon size={24} />
            <span className="font-medium">Tối</span>
          </button>
          
          <button 
            onClick={() => setTheme('system')}
            className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${theme === 'system' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-border/50'}`}
          >
            <Monitor size={24} />
            <span className="font-medium">Hệ thống</span>
          </button>
        </div>
      </div>
    </div>
  );
}
