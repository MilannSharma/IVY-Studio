import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Briefcase, Building2, Users, FileText, Sparkles, Settings, X, Command } from 'lucide-react';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (tab: string) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onSelect }) => {
    const [search, setSearch] = useState('');

    const items = [
        { id: 'overview', label: 'Overview Dashboard', icon: Search, category: 'Navigation' },
        { id: 'projects', label: 'Project Management', icon: Briefcase, category: 'Navigation' },
        { id: 'templates', label: 'ID Card Templates', icon: FileText, category: 'Navigation' },
        { id: 'ai-insights', label: 'AI Quality Insights', icon: Sparkles, category: 'Navigation' },
        { id: 'clients', label: 'Clients Directory', icon: Building2, category: 'Navigation' },
        { id: 'team', label: 'Team Management', icon: Users, category: 'Navigation' },
        { id: 'settings', label: 'System Configuration', icon: Settings, category: 'Navigation' },
    ];

    const filteredItems = items.filter(item => 
        item.label.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (isOpen) onClose();
                else (window as any).openCommandPalette();
            }
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-[15vh] p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
                >
                    <div className="flex items-center px-4 py-4 border-b border-gray-100">
                        <Search className="text-gray-400 mr-3" size={20} />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Type a command or search..."
                            className="flex-1 bg-transparent border-none outline-none text-lg text-gray-900 placeholder-gray-400"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            <Command size={10} /> K
                        </div>
                        <button onClick={onClose} className="ml-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto p-2 hide-scroll">
                        {filteredItems.length > 0 ? (
                            <div className="space-y-4">
                                <div className="px-3 pt-2">
                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Navigation</h3>
                                    <div className="mt-2 space-y-1">
                                        {filteredItems.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    onSelect(item.id);
                                                    onClose();
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-blue-50 group transition-colors text-left"
                                            >
                                                <div className="p-2 bg-gray-100 group-hover:bg-blue-100 text-gray-500 group-hover:text-blue-600 rounded-lg transition-colors">
                                                    <item.icon size={18} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{item.label}</p>
                                                    <p className="text-[11px] text-gray-500">Jump to {item.label}</p>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">Go</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="text-gray-300" size={32} />
                                </div>
                                <p className="text-gray-900 font-bold">No results found</p>
                                <p className="text-sm text-gray-500 mt-1">Try searching for something else.</p>
                            </div>
                        )}
                    </div>

                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded shadow-sm text-[10px]">↑↓</kbd> to navigate</span>
                            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded shadow-sm text-[10px]">Enter</kbd> to select</span>
                        </div>
                        <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded shadow-sm text-[10px]">Esc</kbd> to close</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CommandPalette;
