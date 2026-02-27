import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, MessageSquare, Sliders, BarChart3, ChevronRight,
    ChevronLeft, Upload, CheckCircle2, FileText, X, History
} from 'lucide-react';
import { useWhatsAppStore } from '../../store/useWhatsAppStore';
import { useScraperStore } from '../../store/useScraperStore';
import { fileToBase64 } from '../../utils/helpers';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { TextArea } from '../ui/Input';
import { Badge, Progress } from '../ui/Progress';
import { Header } from '../layout/Navigation';

export const WhatsAppBlastWizard: React.FC = () => {
    const { results: scraperLeads } = useScraperStore();
    const {
        currentStep, setStep,
        contacts, setContacts,
        template, setTemplate,
        settings, updateSettings,
        stats, isCampaignRunning,
        setCampaignRunning,
        updateStats,
        resetStats
    } = useWhatsAppStore();

    const nextStep = () => setStep(currentStep + 1);
    const prevStep = () => setStep(currentStep - 1);

    useEffect(() => {
        const listener = (message: any) => {
            if (message.action === 'wa_stats_update') updateStats(message.stats);
            if (message.action === 'wa_campaign_finished') {
                setCampaignRunning(false);
                updateStats(message.stats);
            }
        };
        chrome.runtime.onMessage.addListener(listener);

        chrome.runtime.sendMessage({ action: 'get_wa_state' }, (state) => {
            if (state?.isRunning) {
                setCampaignRunning(true);
                updateStats(state.stats);
                setStep(4);
            }
        });

        return () => chrome.runtime.onMessage.removeListener(listener);
    }, []);

    const handleStartCampaign = async () => {
        setCampaignRunning(true);
        resetStats();

        let attachment = null;
        if (settings.sendCv) {
            try {
                attachment = await fileToBase64(chrome.runtime.getURL('assets/Muhammad_Tahir_CV.pdf'));
            } catch (e) {
                console.error("Failed to load CV:", e);
            }
        }

        chrome.runtime.sendMessage({
            action: 'start_wa_campaign',
            payload: {
                contacts,
                template,
                settings,
                attachment
            }
        });
    };

    const handleStopCampaign = () => {
        chrome.runtime.sendMessage({ action: 'stop_wa_campaign' });
        setCampaignRunning(false);
    };

    const steps = [
        { id: 1, name: 'Data', icon: Users },
        { id: 2, name: 'Message', icon: MessageSquare },
        { id: 3, name: 'Settings', icon: Sliders },
        { id: 4, name: 'Launch', icon: BarChart3 },
    ];

    const handleImportScraperLeads = () => {
        const formatted = scraperLeads.map(l => ({
            name: l.name,
            phone: l.phone || '',
            category: l.category
        }));
        setContacts(formatted);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target?.result as string;
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const nameIdx = headers.indexOf('name');
            const phoneIdx = headers.indexOf('phone');
            const categoryIdx = headers.indexOf('category');

            const imported = lines.slice(1)
                .map(line => line.split(','))
                .filter(cols => cols.length >= 2)
                .map(cols => ({
                    name: cols[nameIdx] || cols[0] || 'Unknown',
                    phone: cols[phoneIdx] || cols[1] || '',
                    category: categoryIdx !== -1 ? cols[categoryIdx] : 'Imported'
                }));
            setContacts(imported);
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6 pb-20">
            <Header
                title="WhatsApp Blast"
                subtitle={`Step ${currentStep} of 4`}
                actions={
                    <div className="flex bg-white/5 border border-white/10 rounded-full p-1 gap-1">
                        {steps.map(s => (
                            <div
                                key={s.id}
                                className={`p-1.5 rounded-full transition-all ${currentStep === s.id ? 'bg-indigo-500 text-white shadow-lg' : 'text-muted'}`}
                            >
                                <s.icon size={14} />
                            </div>
                        ))}
                    </div>
                }
            />

            <AnimatePresence mode="wait">
                {currentStep === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                        <Card className="space-y-4">
                            <h3 className="text-sm font-bold flex items-center gap-2 text-white/90">
                                <Users size={16} className="text-indigo-400" />
                                Select Audience
                            </h3>

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="secondary"
                                    className="h-32 flex-col gap-2 rounded-2xl group border-dashed"
                                    onClick={handleImportScraperLeads}
                                >
                                    <Users className="text-muted group-hover:text-indigo-400 transition-colors" size={28} />
                                    <div className="text-center">
                                        <p className="text-xs font-bold">Scraper Leads</p>
                                        <p className="text-[10px] text-muted">{scraperLeads.length} available</p>
                                    </div>
                                </Button>

                                <div className="relative h-32">
                                    <input
                                        type="file"
                                        accept=".csv"
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        onChange={handleFileUpload}
                                    />
                                    <div className="h-full flex flex-col items-center justify-center gap-2 bg-white/5 border border-white/10 border-dashed rounded-2xl hover:bg-white/10 hover:border-indigo-500/50 transition-all group">
                                        <Upload className="text-muted group-hover:text-emerald-400 transition-colors" size={28} />
                                        <div className="text-center">
                                            <p className="text-xs font-bold">Import CSV</p>
                                            <p className="text-[10px] text-muted">Upload file</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {contacts.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3"
                                >
                                    <CheckCircle2 size={16} className="text-emerald-400" />
                                    <span className="text-xs font-medium text-emerald-400">{contacts.length} Contacts loaded successfully</span>
                                </motion.div>
                            )}
                        </Card>

                        <Button
                            variant="premium"
                            fullWidth
                            disabled={contacts.length === 0}
                            onClick={nextStep}
                            className="py-4"
                        >
                            NEXT: COMPOSE MESSAGE <ChevronRight size={18} className="ml-2" />
                        </Button>
                    </motion.div>
                )}

                {currentStep === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                        <Card className="space-y-4">
                            <h3 className="text-sm font-bold flex items-center gap-2 text-white/90">
                                <MessageSquare size={16} className="text-indigo-400" />
                                Message Content
                            </h3>

                            <div className="space-y-3">
                                <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
                                    {['name', 'category', 'phone'].map(v => (
                                        <button
                                            key={v}
                                            onClick={() => setTemplate(template + `{{${v}}}`)}
                                            className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-muted hover:text-indigo-400 hover:border-indigo-500/30 transition-all"
                                        >
                                            + {v.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                                <TextArea
                                    className="h-48"
                                    placeholder="Hi {{name}}, I saw your business listed under {{category}}..."
                                    value={template}
                                    onChange={(e) => setTemplate(e.target.value)}
                                />
                            </div>
                        </Card>

                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={prevStep} className="flex-1">
                                <ChevronLeft size={18} className="mr-2" /> BACK
                            </Button>
                            <Button
                                variant="premium"
                                disabled={!template.trim()}
                                onClick={nextStep}
                                className="flex-[2] py-4"
                            >
                                NEXT: SETTINGS <ChevronRight size={18} className="ml-2" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {currentStep === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                        <Card className="space-y-6">
                            <h3 className="text-sm font-bold flex items-center gap-2 text-white/90">
                                <Sliders size={16} className="text-indigo-400" />
                                Campaign Parameters
                            </h3>

                            <div className="space-y-5">
                                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white">Attach CV</p>
                                            <p className="text-[10px] text-muted">Muhammad_Tahir_CV.pdf</p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settings.sendCv}
                                        onChange={(e) => updateSettings({ sendCv: e.target.checked })}
                                        className="w-5 h-5 rounded-lg accent-indigo-500 bg-white/5 border-white/10"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Base Delay</p>
                                        <Badge variant="primary">{settings.delayBase} Seconds</Badge>
                                    </div>
                                    <input
                                        type="range" min="5" max="60" step="1"
                                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                        value={settings.delayBase}
                                        onChange={(e) => updateSettings({ delayBase: parseInt(e.target.value) })}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-muted" />
                                        <span className="text-xs text-muted">Skip if chat history exists</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settings.skipExisting}
                                        onChange={(e) => updateSettings({ skipExisting: e.target.checked })}
                                        className="w-5 h-5 rounded-lg accent-indigo-500"
                                    />
                                </div>

                                <div className="pt-4 border-t border-white/5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-white">Anti-Ban: Batch Pausing</p>
                                            <p className="text-[10px] text-muted">Smart delays between message groups</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settings.pauseBatch}
                                            onChange={(e) => updateSettings({ pauseBatch: e.target.checked })}
                                            className="w-5 h-5 rounded-lg accent-indigo-500"
                                        />
                                    </div>

                                    {settings.pauseBatch && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            className="space-y-4 pt-2"
                                        >
                                            <div className="flex justify-between items-center text-[10px] font-bold text-muted uppercase tracking-wider">
                                                <span>Batch Size</span>
                                                <span className="text-indigo-400">{settings.batchSize} messages</span>
                                            </div>
                                            <input
                                                type="range" min="10" max="100" step="5"
                                                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                                value={settings.batchSize}
                                                onChange={(e) => updateSettings({ batchSize: parseInt(e.target.value) })}
                                            />
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </Card>

                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={prevStep} className="flex-1">
                                <ChevronLeft size={18} className="mr-2" /> BACK
                            </Button>
                            <Button variant="premium" onClick={nextStep} className="flex-[2] py-4">
                                CONFIRM & LAUNCH <ChevronRight size={18} className="ml-2" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {currentStep === 4 && (
                    <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                        <Card className="p-6 space-y-6">
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                                    <BarChart3 size={32} className="text-indigo-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Live Operations</h3>
                                <p className="text-xs text-muted">Targeting {contacts.length} verified contacts</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'SENT', val: stats.sent, color: 'text-emerald-400', icon: CheckCircle2 },
                                    { label: 'SKIPPED', val: stats.history, color: 'text-amber-400', icon: History },
                                    { label: 'INVALID', val: stats.invalid, color: 'text-red-400', icon: X },
                                    { label: 'TOTAL', val: stats.processed, color: 'text-indigo-400', icon: BarChart3 },
                                ].map(s => (
                                    <div key={s.label} className="bg-white/5 p-4 rounded-2xl border border-white/5 group hover:border-white/10 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-[10px] font-bold text-muted tracking-widest">{s.label}</p>
                                            <s.icon size={12} className="text-muted" />
                                        </div>
                                        <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
                                    </div>
                                ))}
                            </div>

                            {isCampaignRunning && (
                                <div className="space-y-4 pt-2">
                                    <Progress
                                        value={(stats.processed / (contacts.length || 1)) * 100}
                                        label="Campaign Progress"
                                        subLabel="Actively sending messages..."
                                    />
                                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-indigo-400 animate-pulse">
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                                        SYSTEM ACTIVE
                                    </div>
                                </div>
                            )}
                        </Card>

                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                onClick={() => setStep(1)}
                                disabled={isCampaignRunning}
                                className="flex-1"
                            >
                                EDIT
                            </Button>
                            {!isCampaignRunning ? (
                                <Button
                                    variant="premium"
                                    onClick={handleStartCampaign}
                                    className="flex-[3] py-5 text-lg"
                                >
                                    START CAMPAIGN
                                </Button>
                            ) : (
                                <Button
                                    variant="danger"
                                    onClick={handleStopCampaign}
                                    className="flex-[3] py-5 text-lg"
                                >
                                    STOP CAMPAIGN
                                </Button>
                            )}
                        </div>

                        {!isCampaignRunning && stats.processed > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center justify-center gap-2 py-4 text-emerald-400"
                            >
                                <CheckCircle2 size={18} />
                                <span className="text-sm font-bold uppercase tracking-[0.2em]">Campaign Finished</span>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
