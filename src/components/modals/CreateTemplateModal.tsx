import React, { useState } from 'react';
import { X, Layout, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CreateTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (config: TemplateConfig) => void;
}

export interface TemplateConfig {
    name: string;
    type: 'id_card' | 'lanyard' | 'key_chain';
    pageFormat: 'A4' | '13x19' | 'Custom';
    customSize?: { width: number; height: number };
    margins: {
        top: number;
        left: number;
        right: number;
        bottom: number;
    };
    applicableFor: 'Staff' | 'Student' | 'Both';
}

const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [config, setConfig] = useState<TemplateConfig>({
        name: '',
        type: 'id_card',
        pageFormat: 'A4',
        margins: { top: 1, left: 1, right: 1, bottom: 1 },
        applicableFor: 'Student'
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(config);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden"
                >
                    <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Layout size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Create New Template</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto hide-scroll">
                        {/* Template Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Template Name</label>
                            <input
                                type="text"
                                required
                                value={config.name}
                                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                                placeholder="Enter template name"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>

                        {/* Template Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Template Type</label>
                            <div className="relative">
                                <select
                                    value={config.type}
                                    onChange={(e) => setConfig({ ...config, type: e.target.value as any })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none"
                                >
                                    <option value="id_card">ID Card</option>
                                    <option value="lanyard">Lanyard</option>
                                    <option value="key_chain">Key Chain</option>
                                </select>
                                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Page Format */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Page Format</label>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { id: 'A4', label: 'Page: A4', sub: '297x210mm' },
                                    { id: '13x19', label: 'Page: 13x19', sub: '330x482mm' },
                                    { id: 'Custom', label: 'Custom', sub: 'Manual Size' }
                                ].map((format) => (
                                    <button
                                        key={format.id}
                                        type="button"
                                        onClick={() => setConfig({ ...config, pageFormat: format.id as any })}
                                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                                            config.pageFormat === format.id
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                config.pageFormat === format.id ? 'border-blue-600' : 'border-gray-300'
                                            }`}>
                                                {config.pageFormat === format.id && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                                            </div>
                                            <span className={`text-sm font-bold ${config.pageFormat === format.id ? 'text-blue-900' : 'text-gray-700'}`}>
                                                {format.label}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-medium ml-6">{format.sub}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {config.pageFormat === 'Custom' && (
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Width (mm)</label>
                                    <input
                                        type="number"
                                        value={config.customSize?.width || 0}
                                        onChange={(e) => setConfig({ ...config, customSize: { ...config.customSize!, width: Number(e.target.value) } })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Height (mm)</label>
                                    <input
                                        type="number"
                                        value={config.customSize?.height || 0}
                                        onChange={(e) => setConfig({ ...config, customSize: { ...config.customSize!, height: Number(e.target.value) } })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Page Margins */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Page margin(mm)</label>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Top</label>
                                    <input
                                        type="number"
                                        value={config.margins.top}
                                        onChange={(e) => setConfig({ ...config, margins: { ...config.margins, top: Number(e.target.value) } })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Left</label>
                                    <input
                                        type="number"
                                        value={config.margins.left}
                                        onChange={(e) => setConfig({ ...config, margins: { ...config.margins, left: Number(e.target.value) } })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Right</label>
                                    <input
                                        type="number"
                                        value={config.margins.right}
                                        onChange={(e) => setConfig({ ...config, margins: { ...config.margins, right: Number(e.target.value) } })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Bottom</label>
                                    <input
                                        type="number"
                                        value={config.margins.bottom}
                                        onChange={(e) => setConfig({ ...config, margins: { ...config.margins, bottom: Number(e.target.value) } })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Applicable For */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Applicable for</label>
                            <div className="relative">
                                <select
                                    value={config.applicableFor}
                                    onChange={(e) => setConfig({ ...config, applicableFor: e.target.value as any })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none"
                                >
                                    <option value="Student">Student</option>
                                    <option value="Staff">Staff</option>
                                    <option value="Both">Both</option>
                                </select>
                                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-900 shadow-lg shadow-gray-200 transition-all active:scale-95"
                            >
                                Add template
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CreateTemplateModal;
