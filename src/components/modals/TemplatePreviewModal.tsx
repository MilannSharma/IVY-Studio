import React from 'react';
import { X, Edit3, Layout as FileLayout } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CanvasRenderer from '../CanvasRenderer';
import { Template } from '../../constants/templates';

interface TemplatePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    template: Template | null;
    onStartEditing: (template: Template) => void;
}

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({ isOpen, onClose, template, onStartEditing }) => {
    if (!template) return null;

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
                        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                    <FileLayout size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{template.name}</h2>
                                    <p className="text-sm text-gray-500 uppercase tracking-wider font-bold">{template.category} • {template.sideType === 'two-side' ? '2 Side' : 'Single Side'}</p>
                                </div>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
                            <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                                {/* Front Side */}
                                <div className="flex flex-col items-center gap-4">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Front Side</span>
                                    <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
                                        <CanvasRenderer 
                                            data={template} 
                                            scale={0.8} 
                                            selectedId={null}
                                            onSelect={() => {}}
                                            onUpdateElement={() => {}}
                                        />
                                    </div>
                                </div>

                                {/* Back Side (if applicable) */}
                                {template.sideType === 'two-side' && (
                                    <div className="flex flex-col items-center gap-4">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Back Side</span>
                                        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
                                            <CanvasRenderer 
                                                data={{
                                                    ...template,
                                                    elements: template.backElements || []
                                                }} 
                                                scale={0.8} 
                                                selectedId={null}
                                                onSelect={() => {}}
                                                onUpdateElement={() => {}}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-6 border-t border-gray-100 bg-white flex items-center justify-end gap-4">
                            <button 
                                onClick={onClose}
                                className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    onStartEditing(template);
                                    onClose();
                                }}
                                className="px-8 py-3 bg-[#0e30f1] text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
                            >
                                <Edit3 size={18} /> Start Editing
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default TemplatePreviewModal;
