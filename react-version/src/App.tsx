import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScraperView } from './components/scraper/ScraperView';
import { WhatsAppBlastWizard } from './components/whatsapp/WhatsAppBlastWizard';
import { BottomNav } from './components/layout/Navigation';

const App: React.FC = () => {
  const [view, setView] = useState<'scraper' | 'whatsapp'>('scraper');

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white selection:bg-indigo-500/30">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[100px] rounded-full" />
      </div>

      <main className="p-4 pt-6 pb-28 select-none">
        <AnimatePresence mode="wait">
          {view === 'scraper' ? (
            <motion.div
              key="scraper"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <ScraperView onNavigateToWhatsApp={() => setView('whatsapp')} />
            </motion.div>
          ) : (
            <motion.div
              key="whatsapp"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <WhatsAppBlastWizard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav activeView={view} onViewChange={setView} />
    </div>
  );
};

export default App;
