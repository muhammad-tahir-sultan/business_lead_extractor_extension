import React from 'react';
import { History, Settings, Search, Play } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actions }) => {
    return (
        <header className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    {title}
                </h1>
                {subtitle && <p className="text-[10px] text-muted uppercase tracking-widest font-bold">{subtitle}</p>}
            </div>
            <div className="flex gap-1">
                {actions || (
                    <>
                        <Button variant="ghost" size="icon">
                            <History size={18} />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Settings size={18} />
                        </Button>
                    </>
                )}
            </div>
        </header>
    );
};

interface BottomNavProps {
    activeView: 'scraper' | 'whatsapp';
    onViewChange: (view: 'scraper' | 'whatsapp') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeView, onViewChange }) => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 p-4 pt-0 bg-[#0b0f1a]/80 backdrop-blur-xl border-t border-white/5 z-50">
            <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10 mt-4">
                <button
                    onClick={() => onViewChange('scraper')}
                    className={`
            flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all relative
            ${activeView === 'scraper' ? 'bg-indigo-500/10 text-white' : 'text-muted hover:text-white'}
          `}
                >
                    {activeView === 'scraper' && (
                        <div className="absolute inset-0 bg-indigo-500 rounded-xl -z-10 shadow-[0_0_20px_rgba(99,102,241,0.4)]" />
                    )}
                    <Search size={18} className={activeView === 'scraper' ? 'text-white' : 'text-muted'} />
                    <span className="text-xs font-bold">Scraper</span>
                </button>
                <button
                    onClick={() => onViewChange('whatsapp')}
                    className={`
            flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all relative
            ${activeView === 'whatsapp' ? 'bg-indigo-500/10 text-white' : 'text-muted hover:text-white'}
          `}
                >
                    {activeView === 'whatsapp' && (
                        <div className="absolute inset-0 bg-indigo-500 rounded-xl -z-10 shadow-[0_0_20px_rgba(99,102,241,0.4)]" />
                    )}
                    <Play size={18} className={activeView === 'whatsapp' ? 'text-white' : 'text-muted'} />
                    <span className="text-xs font-bold">WhatsApp</span>
                </button>
            </div>
        </nav>
    );
};
