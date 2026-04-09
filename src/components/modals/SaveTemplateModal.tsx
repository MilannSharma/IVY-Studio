import React, { useState } from 'react';
import { X, Save, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SaveTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => void;
    initialName: string;
}

const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({ isOpen, onClose, onSave, initialName }) => {
    const [name, setName] = useState(initialName + ' (Copy)');

    const handleSave = () => {
        if (name.trim()) {
            onSave(name);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                    <Save size={20} />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">Save as Copy</h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Template Name</label>
                                <div className="relative">
                                    <FileText size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter template name..."
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        autoFocus
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 font-medium">Original template will remain unchanged. This will be saved as a new design.</p>
                            </div>
                        </div>

                        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
                            <button 
                                onClick={onClose}
                                className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave}
                                className="px-8 py-2.5 bg-[#0e30f1] text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
                            >
                                <Save size={18} /> Save Copy
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SaveTemplateModal;
