import { motion, AnimatePresence } from 'motion/react';
import { useAudioStore } from '../../store/audioStore';

export function SleepTimerMenu() {
  const showSleepTimerMenu = useAudioStore(state => state.showSleepTimerMenu);
  const setShowSleepTimerMenu = useAudioStore(state => state.setShowSleepTimerMenu);
  const sleepTimer = useAudioStore(state => state.sleepTimer);
  const setSleepTimer = useAudioStore(state => state.setSleepTimer);

  const timerOptions = [
    { label: 'Tắt', value: null },
    { label: '15 phút', value: 15 * 60 },
    { label: '30 phút', value: 30 * 60 },
    { label: '45 phút', value: 45 * 60 },
    { label: '60 phút', value: 60 * 60 },
  ];

  return (
    <AnimatePresence>
      {showSleepTimerMenu && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSleepTimerMenu(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="relative bg-[#1e1e1e] rounded-t-3xl border-t border-white/10 p-6 shadow-2xl pb-safe"
          >
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
            <h3 className="text-xl font-bold text-white mb-6 text-center">Hẹn giờ đi ngủ</h3>
            <div className="flex flex-col gap-2">
              {timerOptions.map(option => (
                <button
                  key={option.label}
                  onClick={() => {
                    setSleepTimer(option.value);
                    setShowSleepTimerMenu(false);
                  }}
                  className={`p-4 rounded-2xl text-left font-medium transition-colors flex items-center justify-between ${
                    sleepTimer === option.value 
                      ? 'bg-primary text-white' 
                      : 'bg-white/5 text-white/80 hover:bg-white/10'
                  }`}
                >
                  {option.label}
                  {sleepTimer === option.value && (
                    <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
