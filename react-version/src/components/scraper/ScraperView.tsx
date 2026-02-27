import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Play, Square, ExternalLink, MapPin, X } from 'lucide-react';
import { useScraperStore } from '../../store/useScraperStore';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Progress } from '../ui/Progress';
import { Header } from '../layout/Navigation';

interface ScraperViewProps {
    onNavigateToWhatsApp: () => void;
}

export const ScraperView: React.FC<ScraperViewProps> = ({ onNavigateToWhatsApp }) => {
    const {
        isScraping,
        progress,
        statusMessage,
        totalLeads,
        maxResults,
        results,
        setScraping,
        setProgress,
        updateStatus,
        setMaxResults,
        setResults,
        queries,
        addQuery,
        removeQuery,
        cancelScraping
    } = useScraperStore();

    const [query, setQuery] = useState('');

    useEffect(() => {
        const listener = (message: any) => {
            if (message.action === 'scraper_status') updateStatus(message.message);
            if (message.action === 'scraper_progress') setProgress(message.progress);
            if (message.action === 'scraper_complete') {
                setScraping(false);
                setResults(message.results);
                updateStatus('Scraping complete!');
            }
            if (message.action === 'scraper_error') {
                setScraping(false);
                updateStatus(`Error: ${message.error}`);
            }
        };

        chrome.runtime.onMessage.addListener(listener);
        return () => chrome.runtime.onMessage.removeListener(listener);
    }, []);

    const handleStartScraping = async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.url?.includes('google.com/maps')) {
            updateStatus('Please open Google Maps search results first.');
            return;
        }

        setScraping(true);
        updateStatus('Initiating engine...');
        chrome.tabs.sendMessage(tab.id!, {
            action: 'start_scraping',
            maxResults
        });
    };

    const handleStopScraping = async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
            chrome.tabs.sendMessage(tab.id, { action: 'stop_scraping' });
        }
        cancelScraping();
    };

    const handleExportCSV = () => {
        const headers = ['Name', 'Phone', 'Category', 'Rating', 'ReviewsCount', 'Website', 'Address', 'MapsURL'];
        const csvContent = [
            headers.join(','),
            ...results.map(r => [
                `"${(r.name || '').replace(/"/g, '""')}"`,
                `"${(r.phone || '').replace(/"/g, '""')}"`,
                `"${(r.category || '').replace(/"/g, '""')}"`,
                r.rating || 0,
                r.reviewsCount || 0,
                `"${(r.website || '').replace(/"/g, '""')}"`,
                `"${(r.address || '').replace(/"/g, '""')}"`,
                `"${(r.mapsUrl || '').replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `scraper_leads_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <Header
                title="Maps Scraper"
                subtitle="Premium Edition"
            />

            <div className="space-y-4">
                <Card className="space-y-4">
                    <Input
                        label="Scan Query"
                        placeholder="e.g. Restaurants in Dubai"
                        icon={<Search size={16} />}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && query && addQuery(query)}
                    />

                    {queries.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                            <AnimatePresence>
                                {queries.map(q => (
                                    <motion.div
                                        key={q}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        className="flex-shrink-0 flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 hover:bg-white/10 transition-all group cursor-pointer"
                                    >
                                        <button onClick={() => setQuery(q)} className="text-[10px] font-bold truncate max-w-[120px]">{q}</button>
                                        <button onClick={() => removeQuery(q)} className="opacity-40 hover:opacity-100 transition-opacity">
                                            <X size={10} className="text-red-400" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Input
                                label="Max Results"
                                type="number"
                                value={maxResults}
                                onChange={(e) => setMaxResults(parseInt(e.target.value) || 100)}
                            />
                        </div>
                        <div className="flex-1 flex items-end">
                            {!isScraping ? (
                                <Button variant="premium" fullWidth onClick={handleStartScraping}>
                                    <Play size={16} fill="white" className="mr-2" />
                                    START
                                </Button>
                            ) : (
                                <Button variant="danger" fullWidth onClick={handleStopScraping}>
                                    <Square size={16} fill="currentColor" className="mr-2" />
                                    STOP
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>

                <AnimatePresence>
                    {isScraping && (
                        <Card animate delay={0.1}>
                            <Progress value={progress} label={statusMessage} />
                        </Card>
                    )}
                </AnimatePresence>

                <Card className="min-h-[200px] flex flex-col">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted">Found leads ({totalLeads})</h3>
                        {results.length > 0 && (
                            <button onClick={handleExportCSV} className="text-[10px] text-accent font-bold hover:underline">
                                EXPORT CSV
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[250px] no-scrollbar space-y-3">
                        {results.length === 0 && !isScraping ? (
                            <div className="flex flex-col items-center justify-center py-10 opacity-20 text-center">
                                <MapPin size={40} className="mb-2" />
                                <p className="text-xs">No active results.<br />Run a search on Maps to begin.</p>
                            </div>
                        ) : (
                            results.map((lead, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all group"
                                >
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-sm font-semibold truncate pr-4 text-white/90">{lead.name}</h4>
                                        <a href={lead.mapsUrl} target="_blank" rel="noreferrer" className="text-muted hover:text-indigo-400 transition-colors">
                                            <ExternalLink size={12} />
                                        </a>
                                    </div>
                                    <div className="flex gap-3 mt-1.5">
                                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-1.5 py-0.5 rounded">⭐ {lead.rating || 'N/A'}</span>
                                        <span className="text-[10px] text-muted flex items-center gap-1">
                                            {lead.phone ? `📞 ${lead.phone}` : 'No Phone'}
                                        </span>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </Card>

                {results.length > 0 && (
                    <Button variant="secondary" fullWidth onClick={onNavigateToWhatsApp} className="py-4">
                        SEND TO WHATSAPP BLAST
                    </Button>
                )}
            </div>
        </motion.div>
    );
};
