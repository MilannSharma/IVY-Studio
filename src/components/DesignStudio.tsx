import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Type, 
  Square, 
  Image as ImageIcon, 
  Layers, 
  MousePointer2, 
  Undo2, 
  Redo2, 
  Download, 
  Save, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  ChevronLeft,
  User,
  Settings2,
  Trash2,
  Copy,
  Move,
  Grid3X3,
  Smartphone,
  CreditCard,
  FileText,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Plus,
  Search,
  X,
  ChevronDown,
  Sparkles,
  Sticker,
  UploadCloud,
  History,
  Home,
  Layout,
  PenTool,
  FolderOpen,
  Grid,
  MoreHorizontal,
  Share2,
  Cloud,
  ChevronRight,
  Monitor,
  Mic,
  Globe,
  Languages,
  Minus,
  Maximize2,
  Minimize2,
  FilePlus,
  StickyNote,
  MessageSquare,
  FileImage,
  FileType,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Lock,
  Unlock,
  BringToFront,
  SendToBack,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  Eraser,
  Wand2,
  Play,
  Circle as CircleIcon,
  Triangle as TriangleIcon,
  Star as StarIcon,
  Heart as HeartIcon,
  QrCode,
  Barcode,
  Shapes,
  Frame,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CanvasRenderer from './CanvasRenderer';
import { Template, ID_CARD_TEMPLATES, TemplateElement } from '../constants/templates';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { TemplateConfig } from './modals/CreateTemplateModal';
import SaveTemplateModal from './modals/SaveTemplateModal';

import { useToast } from './Toast';

interface DesignStudioProps {
  onClose: () => void;
  initialType?: 'id-card' | 'visiting-card' | 'document';
  initialTemplate?: Template | null;
  config?: TemplateConfig | null;
}

const DesignStudio: React.FC<DesignStudioProps> = ({ onClose, initialType = 'id-card', initialTemplate = null, config = null }) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'elements' | 'text' | 'uploads' | 'tools' | 'projects'>('templates');
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  
  const { addToast } = useToast();

  // Initialize pages based on config or initialTemplate
  const getInitialPages = () => {
    if (initialTemplate) {
      const initialPages = [initialTemplate];
      if (initialTemplate.sideType === 'two-side' && initialTemplate.backElements) {
        initialPages.push({
          ...initialTemplate,
          id: `${initialTemplate.id}-back`,
          name: `${initialTemplate.name} (Back)`,
          elements: initialTemplate.backElements
        });
      }
      return initialPages;
    }
    if (config) {
      let width = 340;
      let height = 540;
      
      if (config.pageFormat === 'A4') {
        width = 297 * 3.78; // mm to px approx
        height = 210 * 3.78;
      } else if (config.pageFormat === '13x19') {
        width = 330 * 3.78;
        height = 482 * 3.78;
      } else if (config.pageFormat === 'Custom' && config.customSize) {
        width = config.customSize.width * 3.78;
        height = config.customSize.height * 3.78;
      }

      let category: 'student' | 'staff' | 'office' | 'other' = 'student';
      if (config.applicableFor === 'Staff') category = 'staff';
      else if (config.applicableFor === 'Both') category = 'other';

      return [{
        id: `new-${Date.now()}`,
        name: config.name,
        category,
        sideType: 'one-side' as const,
        size: { width, height },
        pages: 1,
        elements: [
          { 
            id: "bg", 
            type: "shape" as const, 
            shape: "rect" as const, 
            position: { x: 0, y: 0 }, 
            size: { width, height }, 
            style: { fill: "#ffffff" }, 
            draggable: false, 
            editable: false 
          }
        ]
      }];
    }
    return [ID_CARD_TEMPLATES[0]];
  };

  const [pages, setPages] = useState<Template[]>(getInitialPages());
  const [selectedPageIdx, setSelectedPageIdx] = useState(0);
  const [activeElementCategory, setActiveElementCategory] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(80);
  const [filter, setFilter] = useState<'student' | 'staff' | 'office' | 'other'>('student');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploads, setUploads] = useState<{ id: string, url: string }[]>([]);
  const [undoStack, setUndoStack] = useState<Template[][]>([]);
  const [redoStack, setRedoStack] = useState<Template[][]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setUploads(prev => [{ id: Math.random().toString(36).substr(2, 9), url }, ...prev]);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredTemplates = ID_CARD_TEMPLATES.filter(
    t => t.category === filter && t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const saveToUndo = useCallback(() => {
    setUndoStack(prev => [...prev.slice(-19), [...pages]]);
    setRedoStack([]);
  }, [pages]);

  const undo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, [...pages]]);
    setPages(previous);
    setUndoStack(prev => prev.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, [...pages]]);
    setPages(next);
    setRedoStack(prev => prev.slice(0, -1));
  };

  const addPage = (template: Template) => {
    if (pages.length >= 2) {
      return;
    }
    saveToUndo();
    // Use the size of the first page if available to ensure consistency
    const baseTemplate = pages.length > 0 ? pages[0] : template;
    setPages([...pages, { 
      ...baseTemplate, 
      id: `page-${Date.now()}`,
      elements: [
        { 
          id: "bg", 
          type: "shape" as const, 
          shape: "rect" as const, 
          position: { x: 0, y: 0 }, 
          size: { width: baseTemplate.size.width, height: baseTemplate.size.height }, 
          style: { fill: "#ffffff" }, 
          draggable: false, 
          editable: false 
        }
      ]
    }]);
    setSelectedPageIdx(pages.length);
  };

  const updateElement = (pageIdx: number, elementId: string, updates: any) => {
    setPages(prev => prev.map((page, pIdx) => {
      if (pIdx !== pageIdx) return page;
      return {
        ...page,
        elements: page.elements.map(el => {
          if (el.id !== elementId) return el;
          
          // Deep merge for style and position if they exist in updates
          const newEl = { ...el, ...updates };
          if (updates.style) newEl.style = { ...el.style, ...updates.style };
          if (updates.position) newEl.position = { ...el.position, ...updates.position };
          if (updates.size) newEl.size = { ...el.size, ...updates.size };
          
          return newEl;
        })
      };
    }));
  };

  const addElement = (type: TemplateElement['type'], options: any = {}) => {
    saveToUndo();
    const newElement: TemplateElement = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      position: { x: 50, y: 50 },
      size: { width: 100, height: 100 },
      draggable: true,
      editable: true,
      style: {
        fontSize: 16,
        fill: '#000000',
        fontFamily: 'Inter',
        textAlign: 'left',
        ...options.style
      },
      ...options
    };
    
    setPages(prev => prev.map((page, pIdx) => {
      if (pIdx !== selectedPageIdx) return page;
      return {
        ...page,
        elements: [...page.elements, newElement]
      };
    }));
    setSelectedId(newElement.id);
  };

  const deleteElement = (pageIdx: number, elementId: string) => {
    saveToUndo();
    setPages(prev => prev.map((page, pIdx) => {
      if (pIdx !== pageIdx) return page;
      return {
        ...page,
        elements: page.elements.filter(el => el.id !== elementId)
      };
    }));
    setSelectedId(null);
  };

  const handleSaveCopy = (newName: string) => {
    addToast(`Template saved as "${newName}" successfully!`, 'success');
    // In a real app, we would save this to a database or local storage
  };

  const exportAsPDF = async () => {
    if (pages.length === 0) return;
    
    const firstPage = pages[0];
    const widthMm = Math.round(firstPage.size.width / 3.78);
    const heightMm = Math.round(firstPage.size.height / 3.78);
    
    const orientation = widthMm > heightMm ? 'l' : 'p';
    const pdf = new jsPDF(orientation, 'mm', [widthMm, heightMm]);
    
    const canvasElements = document.querySelectorAll('.canvas-renderer-container');
    
    for (let i = 0; i < canvasElements.length; i++) {
      if (i > 0) pdf.addPage([widthMm, heightMm], orientation);
      
      const canvas = await html2canvas(canvasElements[i] as HTMLElement, { 
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, widthMm, heightMm);
    }
    
    pdf.save(`${pages[0].name || 'id-card'}.pdf`);
  };

  const selectedElement = pages[selectedPageIdx]?.elements.find(el => el.id === selectedId);

  return (
    <div className="fixed inset-0 bg-[#f3f4f6] z-[100] flex flex-col font-sans text-gray-900 overflow-hidden select-none">
      {/* Top Navigation */}
      <header className="h-14 bg-[#0e30f1] flex items-center justify-between px-4 shrink-0 z-20 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Home size={20} />
          </button>
          <div className="h-6 w-px bg-white/20 mx-2" />
          <div className="flex items-center gap-2">
            <button onClick={undo} className="p-1.5 hover:bg-white/10 rounded-md disabled:opacity-30" disabled={undoStack.length === 0}><Undo2 size={18} /></button>
            <button onClick={redo} className="p-1.5 hover:bg-white/10 rounded-md disabled:opacity-30" disabled={redoStack.length === 0}><Redo2 size={18} /></button>
          </div>
          <div className="h-6 w-px bg-white/20 mx-2" />
          <div className="flex items-center gap-2">
            <Cloud size={16} className="text-white/60" />
            <span className="text-xs font-medium text-white/80">Design Studio Mode</span>
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
          <span className="text-sm font-bold tracking-tight uppercase">IVY Design Studio</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setShowFileMenu(!showFileMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white text-sm font-bold rounded-lg hover:bg-white/20 transition-all border border-white/10"
            >
              <FolderOpen size={16} />
              File
              <ChevronDown size={14} className={`transition-transform ${showFileMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showFileMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 top-12 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 p-2 text-gray-900 z-50"
                >
                  <button 
                    onClick={() => {
                      setIsSaveModalOpen(true);
                      setShowFileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 p-2.5 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all text-sm font-bold group"
                  >
                    <Save size={16} className="text-gray-400 group-hover:text-blue-600" />
                    Save as Copy
                  </button>
                  <button 
                    onClick={() => onClose()}
                    className="w-full flex items-center gap-3 p-2.5 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all text-sm font-bold group"
                  >
                    <X size={16} className="text-gray-400 group-hover:text-red-600" />
                    Close Editor
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-6 w-px bg-white/20" />

          <button 
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 px-6 py-2 bg-white text-[#0e30f1] text-sm font-bold rounded-lg hover:bg-gray-100 shadow-lg transition-all"
          >
            <Share2 size={16} />
            Export
          </button>
          
          <AnimatePresence>
            {showExportMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-4 top-14 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 text-gray-900 z-50"
              >
                <h3 className="text-sm font-bold mb-4 px-2">Download Options</h3>
                <div className="space-y-2">
                  <button onClick={exportAsPDF} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-all group">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                      <FileType size={20} />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold">Bulk PDF Export</div>
                      <div className="text-[10px] text-gray-500 font-medium">Best for mass printing</div>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-all group">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                      <FileImage size={20} />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold">Download PNG</div>
                      <div className="text-[10px] text-gray-500 font-medium">Single page image</div>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <aside className="w-[72px] bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-2 shrink-0 z-10">
          {[
            { id: 'templates', icon: Layout, label: 'Templates' },
            { id: 'elements', icon: Sticker, label: 'Elements' },
            { id: 'text', icon: Type, label: 'Text' },
            { id: 'uploads', icon: UploadCloud, label: 'Uploads' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setIsSidePanelOpen(true);
              }}
              className={`flex flex-col items-center gap-1 w-full py-3 transition-all relative group ${
                activeTab === tab.id && isSidePanelOpen ? 'text-[#0e30f1]' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <tab.icon size={24} strokeWidth={activeTab === tab.id && isSidePanelOpen ? 2.5 : 2} />
              <span className="text-[10px] font-bold tracking-tight">{tab.label}</span>
            </button>
          ))}
        </aside>

        {/* Side Panel Content */}
        <AnimatePresence>
          {isSidePanelOpen && (
            <motion.aside 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-white/80 backdrop-blur-xl border-r border-gray-200 flex flex-col shrink-0 z-10 shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100 flex flex-col gap-4">
                {activeTab === 'templates' && (
                  <div className="flex flex-wrap gap-2">
                    {['student', 'staff', 'office', 'other'].map((cat) => (
                      <button 
                        key={cat}
                        onClick={() => setFilter(cat as any)}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all uppercase ${filter === cat ? 'bg-[#0e30f1] text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder={`Search ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/50 border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0e30f1]/20 focus:border-[#0e30f1] outline-none shadow-sm transition-all"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 hide-scroll">
                {activeTab === 'templates' && (
                  <div className="grid grid-cols-2 gap-4">
                    {filteredTemplates.map(template => (
                      <div 
                        key={template.id} 
                        onClick={() => addPage(template)}
                        className="aspect-[3/4] bg-gray-50 rounded-xl border-2 border-transparent hover:border-[#0e30f1] cursor-pointer transition-all overflow-hidden group relative shadow-sm"
                      >
                        <div className="absolute inset-0 z-0">
                          <CanvasRenderer 
                            data={template} 
                            scale={140 / template.size.width} 
                            selectedId={null}
                            onSelect={() => {}}
                            onUpdateElement={() => {}}
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                          <span className="text-white text-xs font-bold">Add Page</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'text' && (
                  <div className="space-y-8">
                    <button 
                      onClick={() => addElement('text', { content: 'Add a text box', style: { fontSize: 16, fontWeight: 'normal' }, size: { width: 200, height: 20 } })}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
                    >
                      Add a text box
                    </button>

                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Default text styles</h3>
                      <div className="space-y-3">
                        <button 
                          onClick={() => addElement('text', { content: 'Add a heading', style: { fontSize: 32, fontWeight: 'bold', fontFamily: 'Inter' }, size: { width: 300, height: 40 } })}
                          className="w-full py-6 bg-white hover:bg-gray-50 rounded-2xl text-left px-6 border border-gray-200 transition-all font-bold text-2xl shadow-sm"
                        >
                          Add a heading
                        </button>
                        <button 
                          onClick={() => addElement('text', { content: 'Add a subheading', style: { fontSize: 24, fontWeight: 'bold', fontFamily: 'Inter' }, size: { width: 250, height: 30 } })}
                          className="w-full py-4 bg-white hover:bg-gray-50 rounded-2xl text-left px-6 border border-gray-200 transition-all font-bold text-lg shadow-sm"
                        >
                          Add a subheading
                        </button>
                        <button 
                          onClick={() => addElement('text', { content: 'Add a little bit of body text', style: { fontSize: 14, fontWeight: 'normal', fontFamily: 'Inter' }, size: { width: 200, height: 20 } })}
                          className="w-full py-3 bg-white hover:bg-gray-50 rounded-2xl text-left px-6 border border-gray-200 transition-all text-sm shadow-sm"
                        >
                          Add a little bit of body text
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Font combinations</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Sparkle', style: { fontFamily: 'Pacifico', fill: '#fbbf24', fontSize: 28 } },
                          { label: 'CALL NOW', style: { fontFamily: 'Bebas Neue', fill: '#0d9488', fontSize: 32 } },
                          { label: 'Open 24/7', style: { fontFamily: 'Dancing Script', fill: '#db2777', fontSize: 28 } },
                          { label: 'COMIC CARTOON', style: { fontFamily: 'Fredoka One', fill: '#06b6d4', fontSize: 24 } },
                          { label: 'Bride & Groom', style: { fontFamily: 'Playfair Display', fill: '#1e293b', fontSize: 24, fontStyle: 'italic' } },
                          { label: 'Official Memo', style: { fontFamily: 'Courier New', fill: '#334155', fontSize: 18 } },
                          { label: 'We\'re Hiring!', style: { fontFamily: 'Montserrat', fill: '#2563eb', fontSize: 24, fontWeight: 'bold' } },
                          { label: 'plush pen', style: { fontFamily: 'Comfortaa', fill: '#f472b6', fontSize: 24 } },
                          { label: 'BRILLO', style: { fontFamily: 'Monoton', fill: '#ec4899', fontSize: 28 } },
                          { label: 'COFFEE PLEASE', style: { fontFamily: 'Bungee', fill: '#d97706', fontSize: 24 } },
                          { label: 'Groovy', style: { fontFamily: 'Lobster', fill: '#ef4444', fontSize: 28 } },
                          { label: 'TECH STACK', style: { fontFamily: 'Orbitron', fill: '#475569', fontSize: 24 } },
                        ].map((combo, i) => (
                          <button 
                            key={i}
                            onClick={() => addElement('text', { content: combo.label, style: combo.style, size: { width: 140, height: 40 } })}
                            className="aspect-square bg-white hover:bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center p-4 transition-all hover:scale-105 shadow-sm group overflow-hidden"
                          >
                            <span style={{ 
                              fontFamily: combo.style.fontFamily, 
                              color: combo.style.fill, 
                              fontSize: combo.style.fontSize / 2,
                              fontWeight: combo.style.fontWeight as any,
                              fontStyle: combo.style.fontStyle as any
                            }} className="text-center line-clamp-2 leading-tight">
                              {combo.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'uploads' && (
                  <div className="space-y-6">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-8 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <UploadCloud size={24} />
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-bold text-gray-900 block">Upload Files</span>
                        <span className="text-[10px] text-gray-400 font-medium">PNG, JPG or SVG (Max 5MB)</span>
                      </div>
                    </button>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Uploads</h3>
                        <span className="text-[10px] font-bold text-gray-400">{uploads.length} items</span>
                      </div>
                      
                      {uploads.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-gray-300 gap-2">
                          <ImageIcon size={48} strokeWidth={1} />
                          <span className="text-xs font-medium">No uploads yet</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {uploads.map((upload) => (
                            <div 
                              key={upload.id}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', upload.url);
                              }}
                              onClick={() => addElement('image', { src: upload.url })}
                              className="aspect-square bg-gray-50 rounded-xl border border-gray-100 overflow-hidden cursor-pointer group relative hover:ring-2 hover:ring-blue-500 transition-all"
                            >
                              <img 
                                src={upload.url} 
                                alt="Upload" 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Plus size={20} className="text-white" />
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUploads(prev => prev.filter(u => u.id !== upload.id));
                                }}
                                className="absolute top-1 right-1 w-6 h-6 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'elements' && !activeElementCategory && (
                  <div className="grid grid-cols-3 gap-y-6 gap-x-4">
                    {[
                      { id: 'shapes', label: 'Shapes', icon: Shapes, color: 'bg-cyan-50 text-cyan-500', onClick: () => setActiveElementCategory('shapes') },
                      { id: 'graphics', label: 'Graphics', icon: Sticker, color: 'bg-pink-50 text-pink-500', onClick: () => setActiveElementCategory('graphics') },
                      { id: 'frames', label: 'Frames', icon: Frame, color: 'bg-green-50 text-green-500', onClick: () => setActiveElementCategory('frames') },
                      { id: 'photos', label: 'Photos', icon: ImageIcon, color: 'bg-blue-50 text-blue-500', onClick: () => addElement('image', { src: 'https://picsum.photos/seed/ivy/400/400' }) },
                      { id: 'qr', label: 'QR Code', icon: QrCode, color: 'bg-purple-50 text-purple-500', onClick: () => addElement('qr', { content: 'https://ivy.studio' }) },
                      { id: 'upload', label: 'Upload Elements', icon: UploadCloud, color: 'bg-orange-50 text-orange-500', onClick: () => setActiveTab('uploads'), subLabel: '(only in PNG form)' },
                    ].map((item) => (
                      <button 
                        key={item.id}
                        onClick={item.onClick}
                        className="flex flex-col items-center gap-2 group"
                      >
                        <div className={`w-full aspect-square ${item.color} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform border border-white relative`}>
                          <div className="absolute inset-0 bg-white/40 rounded-2xl -rotate-3 scale-95 -z-10" />
                          <item.icon size={32} strokeWidth={1.5} />
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900 leading-tight">{item.label}</span>
                          {item.subLabel && <span className="text-[8px] text-gray-400 font-medium">{item.subLabel}</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {activeTab === 'elements' && activeElementCategory === 'shapes' && (
                  <div className="space-y-8">
                    <button 
                      onClick={() => setActiveElementCategory(null)}
                      className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-4"
                    >
                      <ArrowLeft size={16} />
                      <span className="text-sm font-bold">Back to Elements</span>
                    </button>

                    {[
                      {
                        title: 'Basic Shapes',
                        items: [
                          { shape: 'rect', label: 'Square' },
                          { shape: 'rect', style: { borderRadius: 10 }, label: 'Rounded' },
                          { shape: 'circle', label: 'Circle' },
                          { shape: 'polygon', sides: 3, label: 'Triangle' },
                          { shape: 'polygon', sides: 3, rotation: 180, label: 'Inv Triangle' },
                        ]
                      },
                      {
                        title: 'Polygons',
                        items: [
                          { shape: 'polygon', sides: 5, label: 'Pentagon' },
                          { shape: 'polygon', sides: 6, label: 'Hexagon' },
                          { shape: 'polygon', sides: 6, rotation: 30, label: 'Hexagon 2' },
                          { shape: 'polygon', sides: 8, label: 'Octagon' },
                          { shape: 'polygon', sides: 10, label: 'Decagon' },
                        ]
                      },
                      {
                        title: 'Stars',
                        items: [
                          { shape: 'star', points: 4, label: '4-Point' },
                          { shape: 'star', points: 5, label: '5-Point' },
                          { shape: 'star', points: 6, label: '6-Point' },
                          { shape: 'star', points: 8, label: '8-Point' },
                          { shape: 'star', points: 12, label: '12-Point' },
                        ]
                      },
                      {
                        title: 'Arrows',
                        items: [
                          { shape: 'arrow', rotation: 0, label: 'Right' },
                          { shape: 'arrow', rotation: 180, label: 'Left' },
                          { shape: 'arrow', rotation: -90, label: 'Up' },
                          { shape: 'arrow', rotation: 90, label: 'Down' },
                          { shape: 'arrow', rotation: 0, label: 'Double', points: [0, 0, 50, 0], pointerAtBeginning: true },
                        ]
                      }
                    ].map((section) => (
                      <div key={section.title} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-gray-900">{section.title}</h3>
                          <button className="text-[10px] font-bold text-blue-600 hover:underline">See all</button>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {section.items.map((item, i) => (
                            <button 
                              key={i}
                              onClick={() => addElement('shape', { ...item, style: { fill: '#000000', ...item.style } })}
                              className="aspect-square bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all group"
                              title={item.label}
                            >
                              <div className="w-6 h-6 bg-black group-hover:scale-110 transition-transform" style={{ 
                                clipPath: item.shape === 'circle' ? 'circle(50%)' : 
                                         item.shape === 'polygon' && item.sides === 3 ? 'polygon(50% 0%, 0% 100%, 100% 100%)' :
                                         item.shape === 'polygon' && item.sides === 5 ? 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' :
                                         item.shape === 'polygon' && item.sides === 6 ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' :
                                         item.shape === 'polygon' && item.sides === 8 ? 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' :
                                         item.shape === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' :
                                         item.shape === 'arrow' ? 'polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)' :
                                         'none',
                                borderRadius: item.style?.borderRadius ? '4px' : '0',
                                transform: `rotate(${item.rotation || 0}deg)`
                              }} />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'elements' && activeElementCategory === 'graphics' && (
                  <div className="space-y-8">
                    <button 
                      onClick={() => setActiveElementCategory(null)}
                      className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-4"
                    >
                      <ArrowLeft size={16} />
                      <span className="text-sm font-bold">Back to Elements</span>
                    </button>

                    {[
                      {
                        title: 'Stickers',
                        items: [
                          { url: 'https://cdn-icons-png.flaticon.com/512/2584/2584602.png', label: 'Badge' },
                          { url: 'https://cdn-icons-png.flaticon.com/512/190/190411.png', label: 'Check' },
                          { url: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png', label: 'Star' },
                          { url: 'https://cdn-icons-png.flaticon.com/512/2107/2107845.png', label: 'Heart' },
                        ]
                      },
                      {
                        title: 'Illustrations',
                        items: [
                          { url: 'https://cdn-icons-png.flaticon.com/512/1048/1048953.png', label: 'School' },
                          { url: 'https://cdn-icons-png.flaticon.com/512/2997/2997300.png', label: 'Office' },
                          { url: 'https://cdn-icons-png.flaticon.com/512/1995/1995531.png', label: 'Student' },
                          { url: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', label: 'User' },
                        ]
                      }
                    ].map((section) => (
                      <div key={section.title} className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-900">{section.title}</h3>
                        <div className="grid grid-cols-4 gap-3">
                          {section.items.map((item, i) => (
                            <button 
                              key={i}
                              onClick={() => addElement('image', { src: item.url })}
                              className="aspect-square bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center p-2 transition-all group border border-gray-100"
                              title={item.label}
                            >
                              <img src={item.url} alt={item.label} className="w-full h-full object-contain group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'elements' && activeElementCategory === 'frames' && (
                  <div className="space-y-8">
                    <button 
                      onClick={() => setActiveElementCategory(null)}
                      className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-4"
                    >
                      <ArrowLeft size={16} />
                      <span className="text-sm font-bold">Back to Elements</span>
                    </button>

                    {[
                      {
                        title: 'Basic shapes',
                        items: [
                          { shape: 'rect', label: 'Square Frame' },
                          { shape: 'rect', style: { borderRadius: 20 }, label: 'Rounded Frame' },
                          { shape: 'circle', label: 'Circle Frame' },
                          { shape: 'polygon', sides: 3, label: 'Triangle Frame' },
                          { shape: 'polygon', sides: 6, label: 'Hexagon Frame' },
                        ]
                      },
                      {
                        title: 'Special shapes',
                        items: [
                          { shape: 'star', points: 5, label: 'Star Frame' },
                          { shape: 'star', points: 8, label: 'Flower Frame' },
                          { shape: 'heart', label: 'Heart Frame' },
                        ]
                      },
                      {
                        title: 'Film and photo',
                        items: [
                          { shape: 'rect', label: 'Polaroid', style: { stroke: '#eee', strokeWidth: 10 } },
                          { shape: 'rect', label: 'Film Strip', style: { stroke: '#000', strokeWidth: 2 } },
                        ]
                      },
                      {
                        title: 'Devices',
                        items: [
                          { shape: 'rect', label: 'Mobile', style: { borderRadius: 30, stroke: '#333', strokeWidth: 4 } },
                          { shape: 'rect', label: 'Desktop', style: { borderRadius: 5, stroke: '#333', strokeWidth: 4 } },
                        ]
                      },
                      {
                        title: 'Paper',
                        items: [
                          { shape: 'rect', label: 'Torn Paper', style: { strokeDasharray: [5, 5], stroke: '#ccc' } },
                        ]
                      },
                      {
                        title: 'Flowers',
                        items: [
                          { shape: 'star', points: 8, label: 'Flower Frame' },
                        ]
                      },
                      {
                        title: 'Blob',
                        items: [
                          { shape: 'circle', label: 'Blob 1', style: { scaleX: 1.2, scaleY: 0.8 } },
                        ]
                      }
                    ].map((section) => (
                      <div key={section.title} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-gray-900">{section.title}</h3>
                          <button className="text-[10px] font-bold text-blue-600 hover:underline">See all</button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {section.items.map((item, i) => (
                            <button 
                              key={i}
                              onClick={() => addElement('image', { 
                                src: 'https://picsum.photos/seed/frame/400/400', 
                                isFrame: true,
                                frameShape: item.shape,
                                points: (item as any).points,
                                sides: (item as any).sides,
                                style: { ...item.style, opacity: 0.8 } 
                              })}
                              className="aspect-square bg-blue-50 hover:bg-blue-100 rounded-xl flex flex-col items-center justify-center transition-all group border border-blue-100 overflow-hidden relative"
                              title={item.label}
                            >
                              <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/frame/100/100')] bg-cover opacity-20" />
                              <div className="w-10 h-10 border-2 border-blue-400 bg-white/50 z-10" style={{ 
                                clipPath: item.shape === 'circle' ? 'circle(50%)' : 
                                         item.shape === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' :
                                         item.shape === 'polygon' && item.sides === 3 ? 'polygon(50% 0%, 0% 100%, 100% 100%)' :
                                         item.shape === 'polygon' && item.sides === 6 ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' :
                                         item.shape === 'heart' ? 'path("M 50 25 C 50 0 0 0 0 25 C 0 50 50 50 50 75 C 50 50 100 50 100 25 C 100 0 50 0 50 25")' :
                                         'none',
                                borderRadius: item.style?.borderRadius ? `${item.style.borderRadius / 2}px` : '0',
                              }} />
                              <span className="text-[8px] font-bold text-blue-600 mt-1 z-10">{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Canvas Area */}
        <main 
          className="flex-1 bg-[#ebecef] relative overflow-y-auto p-12 flex flex-col items-center gap-12 hide-scroll"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const url = e.dataTransfer.getData('text/plain');
            if (url) {
              addElement('image', { src: url });
            }
          }}
        >
          {/* Floating Controller */}
          <AnimatePresence>
            {selectedElement && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-20 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl border border-gray-200 px-4 py-2 flex items-center gap-3 z-50 min-w-max"
              >
                {/* Common Controls: Color & Opacity */}
                <div className="flex items-center gap-2">
                  <div className="relative group">
                    <div 
                      className="w-8 h-8 rounded-full border border-gray-200 cursor-pointer shadow-sm overflow-hidden"
                      style={{ background: selectedElement.style?.fill || '#000000' }}
                    >
                      <input 
                        type="color" 
                        value={selectedElement.style?.fill || '#000000'}
                        onChange={(e) => updateElement(selectedPageIdx, selectedId!, { style: { fill: e.target.value } })}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      Fill Color
                    </div>
                  </div>

                  {(selectedElement.type === 'shape' || selectedElement.type === 'image') && (
                    <div className="relative group">
                      <div 
                        className="w-8 h-8 rounded-full border border-gray-200 cursor-pointer shadow-sm overflow-hidden flex items-center justify-center bg-white"
                      >
                        <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300" style={{ borderColor: selectedElement.style?.stroke || '#cccccc' }} />
                        <input 
                          type="color" 
                          value={selectedElement.style?.stroke || '#000000'}
                          onChange={(e) => updateElement(selectedPageIdx, selectedId!, { style: { stroke: e.target.value } })}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        Border Color
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-8 w-px bg-gray-200 mx-1" />

                {/* Text Specific Controls */}
                {selectedElement.type === 'text' && (
                  <>
                    <div className="flex items-center gap-2">
                      <select 
                        value={selectedElement.style?.fontFamily || 'Inter'}
                        onChange={(e) => updateElement(selectedPageIdx, selectedId!, { style: { fontFamily: e.target.value } })}
                        className="bg-gray-100 border-none rounded-lg px-2 py-1.5 text-xs font-bold outline-none min-w-[100px]"
                      >
                        {['Inter', 'Roboto', 'Pacifico', 'Bebas Neue', 'Dancing Script', 'Fredoka One', 'Playfair Display', 'Montserrat', 'Orbitron'].map(font => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </select>

                      <div className="flex items-center bg-gray-100 rounded-lg px-1">
                        <button 
                          onClick={() => updateElement(selectedPageIdx, selectedId!, { style: { fontSize: Math.max(1, (selectedElement.style?.fontSize || 16) - 1) } })}
                          className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <input 
                          type="number" 
                          value={selectedElement.style?.fontSize || 16}
                          onChange={(e) => updateElement(selectedPageIdx, selectedId!, { style: { fontSize: parseInt(e.target.value) || 16 } })}
                          className="w-10 bg-transparent border-none text-center text-xs font-bold outline-none"
                        />
                        <button 
                          onClick={() => updateElement(selectedPageIdx, selectedId!, { style: { fontSize: (selectedElement.style?.fontSize || 16) + 1 } })}
                          className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="h-8 w-px bg-gray-200 mx-1" />

                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => updateElement(selectedPageIdx, selectedId!, { style: { fontWeight: selectedElement.style?.fontWeight === 'bold' ? 'normal' : 'bold' } })} 
                        className={`p-2 rounded-lg transition-all ${selectedElement.style?.fontWeight === 'bold' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                        title="Bold"
                      >
                        <Bold size={18} />
                      </button>
                      <button 
                        onClick={() => updateElement(selectedPageIdx, selectedId!, { style: { fontStyle: selectedElement.style?.fontStyle === 'italic' ? 'normal' : 'italic' } })} 
                        className={`p-2 rounded-lg transition-all ${selectedElement.style?.fontStyle === 'italic' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                        title="Italic"
                      >
                        <Italic size={18} />
                      </button>
                      <button 
                        onClick={() => updateElement(selectedPageIdx, selectedId!, { style: { textDecoration: selectedElement.style?.textDecoration === 'underline' ? 'none' : 'underline' } })} 
                        className={`p-2 rounded-lg transition-all ${selectedElement.style?.textDecoration === 'underline' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                        title="Underline"
                      >
                        <Underline size={18} />
                      </button>
                    </div>

                    <div className="h-8 w-px bg-gray-200 mx-1" />

                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => updateElement(selectedPageIdx, selectedId!, { style: { textAlign: 'left' } })} 
                        className={`p-2 rounded-lg transition-all ${selectedElement.style?.textAlign === 'left' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                        title="Align Left"
                      >
                        <AlignLeft size={18} />
                      </button>
                      <button 
                        onClick={() => updateElement(selectedPageIdx, selectedId!, { style: { textAlign: 'center' } })} 
                        className={`p-2 rounded-lg transition-all ${selectedElement.style?.textAlign === 'center' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                        title="Align Center"
                      >
                        <AlignCenter size={18} />
                      </button>
                      <button 
                        onClick={() => updateElement(selectedPageIdx, selectedId!, { style: { textAlign: 'right' } })} 
                        className={`p-2 rounded-lg transition-all ${selectedElement.style?.textAlign === 'right' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                        title="Align Right"
                      >
                        <AlignRight size={18} />
                      </button>
                    </div>

                    <div className="h-8 w-px bg-gray-200 mx-1" />

                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => updateElement(selectedPageIdx, selectedId!, { content: selectedElement.content?.toUpperCase() })} 
                        className="p-2 hover:bg-gray-100 rounded-lg transition-all text-xs font-bold"
                        title="Uppercase"
                      >
                        AA
                      </button>
                      <button 
                        onClick={() => updateElement(selectedPageIdx, selectedId!, { content: selectedElement.content?.toLowerCase() })} 
                        className="p-2 hover:bg-gray-100 rounded-lg transition-all text-xs font-bold"
                        title="Lowercase"
                      >
                        aa
                      </button>
                    </div>
                  </>
                )}

                {/* Shape Specific Controls */}
                {selectedElement.type === 'shape' && (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-bold text-gray-400 uppercase">Radius</span>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={selectedElement.style?.borderRadius || 0}
                          onChange={(e) => updateElement(selectedPageIdx, selectedId!, { style: { borderRadius: parseInt(e.target.value) } })}
                          className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-bold text-gray-400 uppercase">Border</span>
                        <input 
                          type="range" 
                          min="0" 
                          max="20" 
                          value={selectedElement.style?.strokeWidth || 0}
                          onChange={(e) => updateElement(selectedPageIdx, selectedId!, { style: { strokeWidth: parseInt(e.target.value) } })}
                          className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Image Specific Controls */}
                {selectedElement.type === 'image' && (
                  <>
                    <button 
                      onClick={() => {
                        const newSrc = prompt('Enter image URL:', selectedElement.src);
                        if (newSrc) updateElement(selectedPageIdx, selectedId!, { src: newSrc });
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all text-xs font-bold"
                    >
                      <UploadCloud size={14} />
                      Replace
                    </button>
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-bold text-gray-400 uppercase">Opacity</span>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.1"
                        value={selectedElement.style?.opacity ?? 1}
                        onChange={(e) => updateElement(selectedPageIdx, selectedId!, { style: { opacity: parseFloat(e.target.value) } })}
                        className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  </>
                )}

                <div className="h-8 w-px bg-gray-200 mx-1" />

                {/* Positioning & Actions */}
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => {
                      const page = pages[selectedPageIdx];
                      const elements = [...page.elements];
                      const idx = elements.findIndex(el => el.id === selectedId);
                      if (idx < elements.length - 1) {
                        const [el] = elements.splice(idx, 1);
                        elements.push(el);
                        setPages(prev => prev.map((p, i) => i === selectedPageIdx ? { ...p, elements } : p));
                      }
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                    title="Bring to Front"
                  >
                    <BringToFront size={18} />
                  </button>
                  <button 
                    onClick={() => {
                      const page = pages[selectedPageIdx];
                      const elements = [...page.elements];
                      const idx = elements.findIndex(el => el.id === selectedId);
                      if (idx > 0) {
                        const [el] = elements.splice(idx, 1);
                        elements.unshift(el);
                        setPages(prev => prev.map((p, i) => i === selectedPageIdx ? { ...p, elements } : p));
                      }
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                    title="Send to Back"
                  >
                    <SendToBack size={18} />
                  </button>
                  <button 
                    onClick={() => {
                      const page = pages[selectedPageIdx];
                      const el = page.elements.find(e => e.id === selectedId);
                      if (el) {
                        addElement(el.type, { ...el, id: Math.random().toString(36).substr(2, 9), position: { x: el.position.x + 10, y: el.position.y + 10 } });
                      }
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                    title="Duplicate"
                  >
                    <Copy size={18} />
                  </button>
                  <button onClick={() => deleteElement(selectedPageIdx, selectedId!)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-all" title="Delete"><Trash2 size={18} /></button>
                </div>

                <div className="h-8 w-px bg-gray-200 mx-1" />

                <button onClick={() => setSelectedId(null)} className="p-2 hover:bg-gray-100 rounded-lg" title="Deselect"><X size={18} /></button>
              </motion.div>
            )}
          </AnimatePresence>

          {pages.map((page, idx) => (
            <div key={page.id} className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-between w-full px-2">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  {idx === 0 ? 'Front Side of ID Card' : 'Back Side of ID Card'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded-full shadow-sm border border-gray-100">
                    {Math.round(page.size.width / 3.78)} x {Math.round(page.size.height / 3.78)} mm
                  </span>
                </div>
              </div>
              
              <div 
                className={`canvas-renderer-container relative group transition-all ${selectedPageIdx === idx ? 'ring-4 ring-blue-500/20' : ''}`}
                onClick={() => setSelectedPageIdx(idx)}
              >
                <div className="absolute -left-12 top-0 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-xs font-bold text-gray-400">{idx + 1}</div>
                  {pages.length > 1 && (
                    <button onClick={(e) => {
                      e.stopPropagation();
                      setPages(pages.filter((_, i) => i !== idx));
                      if (selectedPageIdx >= pages.length - 1) setSelectedPageIdx(0);
                    }} className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-red-500 hover:bg-red-50">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <CanvasRenderer 
                  data={page} 
                  scale={zoom / 100} 
                  selectedId={selectedPageIdx === idx ? selectedId : null}
                  onSelect={setSelectedId}
                  onUpdateElement={(id, updates) => updateElement(idx, id, updates)}
                />
              </div>
            </div>
          ))}

          {pages.length < 2 && (
            <button 
              onClick={() => addPage(ID_CARD_TEMPLATES[0])}
              className="w-[340px] h-[100px] border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all group"
            >
              <Plus size={24} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold">Add New Page</span>
            </button>
          )}

          {/* Zoom Controls */}
          <div className="fixed bottom-8 right-8 bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 px-4 py-2 flex items-center gap-4 z-50">
            <button onClick={() => setZoom(Math.max(10, zoom - 10))} className="p-2 hover:bg-gray-100 rounded-lg"><ZoomOut size={18} /></button>
            <span className="text-sm font-bold w-12 text-center">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="p-2 hover:bg-gray-100 rounded-lg"><ZoomIn size={18} /></button>
          </div>
        </main>
      </div>

      <SaveTemplateModal 
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveCopy}
        initialName={pages[0]?.name || 'Untitled Template'}
      />
    </div>
  );
};

export default DesignStudio;
