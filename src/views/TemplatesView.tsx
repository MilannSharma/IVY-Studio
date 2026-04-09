import React, { useState } from 'react';
import { Search, Plus, Layout as FileLayout, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CustomSelect from '../components/CustomSelect';
import DesignStudio from '../components/DesignStudio';
import CanvasRenderer from '../components/CanvasRenderer';
import Header from '../components/Header';
import { ID_CARD_TEMPLATES } from '../constants/templates';
import CreateTemplateModal, { TemplateConfig } from '../components/modals/CreateTemplateModal';
import TemplatePreviewModal from '../components/modals/TemplatePreviewModal';

interface TemplatesViewProps {
    setActiveTab?: (tab: string) => void;
}

const TemplateCard = ({ template, onPreview }: { template: any, onPreview: (t: any) => void }) => {
    const [currentSide, setCurrentSide] = useState<'front' | 'back'>('front');

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden group hover:border-gray-300 hover:shadow-md transition-all flex flex-col">
            <div className="h-64 bg-gray-50 border-b flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    {template.sideType === 'two-side' ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentSide}
                                    initial={{ opacity: 0, x: currentSide === 'front' ? -20 : 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: currentSide === 'front' ? 20 : -20 }}
                                    className="scale-[0.6] origin-center shadow-lg"
                                >
                                    <CanvasRenderer 
                                        data={currentSide === 'front' ? template : { ...template, elements: template.backElements || [] }} 
                                        scale={1} 
                                        selectedId={null}
                                        onSelect={() => {}}
                                        onUpdateElement={() => {}}
                                    />
                                </motion.div>
                            </AnimatePresence>
                            
                            {/* Carousel Arrows */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); setCurrentSide('front'); }}
                                className={`absolute left-2 p-2 rounded-full bg-white/90 shadow-md hover:bg-white transition-all z-20 hover:scale-110 active:scale-95 ${currentSide === 'front' ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
                                disabled={currentSide === 'front'}
                            >
                                <ChevronLeft size={16} className="text-gray-700" />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setCurrentSide('back'); }}
                                className={`absolute right-2 p-2 rounded-full bg-white/90 shadow-md hover:bg-white transition-all z-20 hover:scale-110 active:scale-95 ${currentSide === 'back' ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
                                disabled={currentSide === 'back'}
                            >
                                <ChevronRight size={16} className="text-gray-700" />
                            </button>

                            {/* Side Indicator Dots */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-black/20 backdrop-blur-md px-2 py-1 rounded-full">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setCurrentSide('front'); }}
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${currentSide === 'front' ? 'bg-white w-3' : 'bg-white/40 hover:bg-white/60'}`} 
                                />
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setCurrentSide('back'); }}
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${currentSide === 'back' ? 'bg-white w-3' : 'bg-white/40 hover:bg-white/60'}`} 
                                />
                            </div>
                        </div>
                    ) : (
                        <CanvasRenderer 
                            data={template} 
                            scale={200 / template.size.height} 
                            selectedId={null}
                            onSelect={() => {}}
                            onUpdateElement={() => {}}
                        />
                    )}
                </div>
                
                {/* Action Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                    <button
                        onClick={() => onPreview(template)}
                        className="px-4 py-2 bg-white text-black text-sm font-bold rounded-lg shadow-lg hover:scale-105 transition-transform"
                    >
                        Preview Template
                    </button>
                </div>

                {/* Side Badge */}
                <div className="absolute top-3 right-3 z-20">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-sm border backdrop-blur-md ${
                        template.sideType === 'two-side' 
                        ? 'bg-purple-50/90 text-purple-600 border-purple-100' 
                        : 'bg-blue-50/90 text-blue-600 border-blue-100'
                    }`}>
                        {template.sideType === 'two-side' ? '2 Side' : 'Single Side'}
                    </span>
                </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 line-clamp-1" title={template.name}>{template.name}</h3>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{template.size.width}x{template.size.height} mm</div>

                <div className="mt-4 flex gap-2 pt-4 border-t border-gray-100 mt-auto">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{template.category}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{template.orientation || 'vertical'}</span>
                </div>
            </div>
        </div>
    );
};

const TemplatesView: React.FC<TemplatesViewProps> = ({ setActiveTab }) => {
    const [filterType, setFilterType] = useState('All');
    const [filterEntity, setFilterEntity] = useState('All');
    const [sideFilter, setSideFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [showDesignStudio, setShowDesignStudio] = useState(false);
    const [studioType, setStudioType] = useState<'id-card' | 'visiting-card' | 'document'>('id-card');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [templateToPreview, setTemplateToPreview] = useState<any>(null);
    const [templateConfig, setTemplateConfig] = useState<TemplateConfig | null>(null);

    const filteredTemplates = ID_CARD_TEMPLATES.filter(t => {
        const matchEntity = filterEntity === 'All' || t.category.toLowerCase() === filterEntity.toLowerCase();
        const matchSide = sideFilter === 'All' || 
            (sideFilter === 'One Side' && t.sideType === 'one-side') || 
            (sideFilter === 'Two Side' && t.sideType === 'two-side');
        const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchEntity && matchSide && matchSearch;
    });

    const handleUseTemplate = (template: any) => {
        setTemplateToPreview(template);
        setIsPreviewModalOpen(true);
    };

    const handleStartEditing = (template: any) => {
        setSelectedTemplate(template);
        setShowDesignStudio(true);
    };

    const handleCreateNew = () => {
        setIsCreateModalOpen(true);
    };

    const handleAddTemplate = (config: TemplateConfig) => {
        setTemplateConfig(config);
        setIsCreateModalOpen(false);
        setShowDesignStudio(true);
    };

    if (showDesignStudio) {
        return (
            <DesignStudio 
                onClose={() => {
                    setShowDesignStudio(false);
                    setTemplateConfig(null);
                    setSelectedTemplate(null);
                }} 
                initialType={studioType} 
                initialTemplate={selectedTemplate}
                config={templateConfig}
            />
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-[#fafbfd] overflow-hidden">
            <Header title="Global Templates" icon={<FileLayout size={20} />} setActiveTab={setActiveTab}>
                <button 
                    onClick={handleCreateNew}
                    className="px-6 py-2 bg-[#0e30f1] text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
                >
                    <Plus size={18} /> Create New Template
                </button>
            </Header>

            <CreateTemplateModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onAdd={handleAddTemplate} 
            />

            <TemplatePreviewModal 
                isOpen={isPreviewModalOpen}
                onClose={() => setIsPreviewModalOpen(false)}
                template={templateToPreview}
                onStartEditing={handleStartEditing}
            />

            <div className="flex-1 overflow-y-auto hide-scroll p-8">
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Browse Templates</h2>
                    <p className="text-sm text-gray-500 mt-1">Select a template to start designing or create a custom one.</p>
                </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center mb-8">
                <div className="relative flex-1 min-w-[250px]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Search size={16} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                    />
                </div>

                <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Entity</span>
                    <CustomSelect
                        value={filterEntity}
                        onChange={setFilterEntity}
                        options={[
                            { value: 'All', label: 'All Entities' },
                            { value: 'Student', label: 'Student' },
                            { value: 'Staff', label: 'Staff' },
                            { value: 'Office', label: 'Office' },
                            { value: 'Other', label: 'Other' },
                        ]}
                        width="w-40"
                    />
                </div>

                <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sides</span>
                    <CustomSelect
                        value={sideFilter}
                        onChange={setSideFilter}
                        options={[
                            { value: 'All', label: 'All Sides' },
                            { value: 'One Side', label: 'Single Side' },
                            { value: 'Two Side', label: '2 Side' },
                        ]}
                        width="w-40"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTemplates.map(template => (
                    <TemplateCard 
                        key={template.id} 
                        template={template} 
                        onPreview={handleUseTemplate} 
                    />
                ))}
            </div>

            {filteredTemplates.length === 0 && (
                <div className="text-center py-20 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">No templates found</h3>
                    <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search term.</p>
                    <button onClick={() => { setFilterType('All'); setFilterEntity('All'); setSearchTerm(''); }} className="mt-4 px-4 py-2 text-blue-600 text-sm font-semibold hover:bg-blue-50 rounded-lg transition-colors">Clear Filters</button>
                </div>
            )}
            </div>
        </div>
    );
};

export default TemplatesView;
