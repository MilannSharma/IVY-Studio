import React, { useState, useMemo, useEffect } from 'react';
import { Settings, Plus, X } from 'lucide-react';
import { initialConfig } from '../data/initialData';
import CustomSelect from '../components/CustomSelect';

const ConfigurationView: React.FC = () => {
    const [configTab, setConfigTab] = useState('entities'); // 'entities', 'integrations', 'print', 'card-sizes'
    const [activeProjectType, setActiveProjectType] = useState(initialConfig.projectTypes[0]);

    // Print Format Modal State
    const [formatPaperSize, setFormatPaperSize] = useState('A4 Sheet (210 x 297mm)');
    const [formatCardSize, setFormatCardSize] = useState('Standard ID (86 x 54 mm)');

    // Get entities for the active project type
    const currentEntities = useMemo(() => {
        return initialConfig.entityTypes.filter(e => e.projectTypeId === activeProjectType.id);
    }, [activeProjectType]);

    const [isFormatModalOpen, setIsFormatModalOpen] = useState(false);

    // Set active entity when project type changes
    const [activeEntity, setActiveEntity] = useState(currentEntities[0] || null);

    // Update active entity if project type changes
    useEffect(() => {
        setActiveEntity(currentEntities[0] || null);
    }, [currentEntities]);

    const currentFields = initialConfig.fields.filter(f => activeEntity && f.entityId === activeEntity.id);

    // Sample Vendor Integrations
    const [integrations] = useState([
        { id: 1, name: "Edunext ERP", type: "School", status: "Connected", lastSync: "2 hours ago" },
        { id: 2, name: "Darwinbox HRMS", type: "Company", status: "Disconnected", lastSync: "-" }
    ]);

    // Card Sizes state
    const [cardSizes, setCardSizes] = useState([
        { id: 1, name: "CR80 Standard ID Card", width: 85.6, height: 53.98, unit: "mm", isDefault: true, notes: "International standard credit/ID card size" },
        { id: 2, name: "A4 Portrait", width: 210, height: 297, unit: "mm", isDefault: true, notes: "Full A4 sheet — used as paper size" },
        { id: 3, name: "A3 Landscape", width: 420, height: 297, unit: "mm", isDefault: true, notes: "A3 landscape sheet" },
        { id: 4, name: "3.5 × 2 inch (US Card)", width: 88.9, height: 50.8, unit: "mm", isDefault: true, notes: "Common US business / ID card size" },
        { id: 5, name: "Badge 4×3 inch", width: 101.6, height: 76.2, unit: "mm", isDefault: true, notes: "Standard conference/event badge" },
        { id: 6, name: "Square 54×54 mm", width: 54, height: 54, unit: "mm", isDefault: true, notes: "Square format ID card" },
        { id: 7, name: "A5 Portrait", width: 148, height: 210, unit: "mm", isDefault: true, notes: "Half-A4 size, used for larger badges" },
    ]);
    const [newCardSize, setNewCardSize] = useState({ name: '', width: '', height: '', unit: 'mm', notes: '' });
    const [addCardSizeError, setAddCardSizeError] = useState('');

    const handleAddCardSize = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCardSize.name.trim() || !newCardSize.width || !newCardSize.height) {
            setAddCardSizeError('Please fill in Name, Width and Height.');
            return;
        }
        setCardSizes(prev => [
            ...prev,
            { ...newCardSize, id: Date.now(), isDefault: false, width: parseFloat(newCardSize.width), height: parseFloat(newCardSize.height) }
        ]);
        setNewCardSize({ name: '', width: '', height: '', unit: 'mm', notes: '' });
        setAddCardSizeError('');
    };

    const handleDeleteCardSize = (id: number) => {
        setCardSizes(prev => prev.filter(s => s.id !== id));
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#fafbfd] overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-8 py-3.5 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <Settings size={20} />
                    <h1 className="text-lg font-bold text-gray-900 tracking-tight">System Configuration</h1>
                </div>
                <div className="flex gap-6 mt-2 overflow-x-auto hide-scroll">
                    {[['Entities & Fields', 'entities'], ['Integrations (ERP/LMS)', 'integrations'], ['Print Formats', 'print'], ['Card Sizes', 'card-sizes']].map(([label, id]) => {
                        const isActive = configTab === id;
                        return (
                            <button
                                key={id}
                                onClick={() => setConfigTab(id)}
                                className={`pb-3 text-sm font-semibold transition-colors relative whitespace-nowrap ${isActive ? 'text-[#0e30f1]' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {label}
                                {isActive && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0e30f1] rounded-t-full"></div>}
                            </button>
                        );
                    })}
                </div>
            </header>

            {/* Content Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-8 hide-scroll max-w-7xl mx-auto w-full">

                {configTab === 'entities' ? (
                    <>
                        <div className="mb-8 p-6 bg-blue-50 border border-blue-100 rounded-xl">
                            <h2 className="text-base font-bold text-blue-900 mb-2">How Configuration Works</h2>
                            <p className="text-sm text-blue-800 leading-relaxed">
                                As a vendor, you configure <strong>Entity Types</strong> applicable to each <strong>Project Type</strong> (e.g. Students in a School, Employees in a Company). You then define exactly which <strong>Fields</strong> belong to each entity. This automatically configures the data entry, imports, and portal interfaces.
                            </p>
                        </div>

                        {/* Project Type Selector */}
                        <div className="mb-6 flex gap-3 overflow-x-auto hide-scroll pb-2">
                            {initialConfig.projectTypes.map(pt => (
                                <button
                                    key={pt.id}
                                    onClick={() => setActiveProjectType(pt)}
                                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm border whitespace-nowrap ${activeProjectType.id === pt.id
                                        ? 'bg-[#0e30f1] text-white border-[#0e30f1]'
                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {pt.name} Projects
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Left Col: Entities */}
                            <div className="w-full md:w-1/3">
                                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
                                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-[#f8fafc]">
                                        <h3 className="font-semibold text-gray-900">Entities in <span className="text-blue-600">{activeProjectType.name}</span></h3>
                                        <button className="text-blue-600 hover:text-blue-700 p-1 bg-blue-50 hover:bg-blue-100 rounded transition-colors"><Plus size={18} /></button>
                                    </div>
                                    <div className="p-3 flex-1">
                                        {currentEntities.length > 0 ? (
                                            <ul className="space-y-2">
                                                {currentEntities.map(entity => (
                                                    <li key={entity.id}>
                                                        <button
                                                            onClick={() => setActiveEntity(entity)}
                                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors border ${activeEntity?.id === entity.id
                                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                                : 'border-transparent hover:bg-gray-50 text-gray-700'
                                                                }`}
                                                        >
                                                            <span>{entity.name}</span>
                                                            <span className={`w-2 h-2 rounded-full ${entity.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="text-center p-6 text-gray-500 text-sm">No entities defined for this project type.</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Col: Fields for selected Entity */}
                            <div className="w-full md:w-2/3">
                                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-[#f8fafc]">
                                        <h3 className="font-semibold text-gray-900">
                                            {activeEntity ? <>Fields for <span className="text-blue-600">{activeEntity.name}</span></> : "Select an entity to view fields"}
                                        </h3>
                                        <button className={`flex items-center gap-2 px-3 py-1.5 text-white text-xs font-medium rounded shadow-sm transition ${activeEntity ? 'bg-[#0e30f1] hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`} disabled={!activeEntity}>
                                            <Plus size={14} /> Add Field
                                        </button>
                                    </div>

                                    {activeEntity && currentFields.length > 0 ? (
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-white border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                                                    <th className="px-6 py-3">Label</th>
                                                    <th className="px-6 py-3">Type</th>
                                                    <th className="px-6 py-3">Required</th>
                                                    <th className="px-6 py-3 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {currentFields.map(field => (
                                                    <tr key={field.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-3.5">
                                                            <p className="font-semibold text-gray-900 text-sm">{field.label}</p>
                                                            <p className="text-xs text-gray-400 font-mono mt-0.5">{field.key}</p>
                                                        </td>
                                                        <td className="px-6 py-3.5">
                                                            <span className="px-2 py-1 text-[11px] font-semibold bg-gray-100 text-gray-600 rounded uppercase tracking-wide">
                                                                {field.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-3.5">
                                                            {field.required ? (
                                                                <span className="text-green-600 font-medium text-sm">Yes</span>
                                                            ) : (
                                                                <span className="text-gray-400 font-medium text-sm">No</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-3.5 text-right">
                                                            <button className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors">Edit</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="p-8 text-center text-gray-500 text-sm bg-gray-50">
                                            {activeEntity ? "No fields configured for this entity yet." : "Select an entity from the left to view and manage its fields."}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : configTab === 'print' ? (
                    <div className="space-y-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-1">Global Print Formats</h2>
                                <p className="text-sm text-gray-500">Define reusable print layouts (e.g. A4 - 86x54 Portrait) that can be selected across all your projects.</p>
                            </div>
                            <button onClick={() => setIsFormatModalOpen(true)} className="px-4 py-2 bg-[#0e30f1] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700 shadow-sm transition">
                                <Plus size={16} /> Create Print Format
                            </button>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                        <th className="px-6 py-3 text-left">Format Name</th>
                                        <th className="px-6 py-3 text-left">Paper Size</th>
                                        <th className="px-6 py-3 text-left">Card Layout</th>
                                        <th className="px-6 py-3 text-center">Output</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900 text-sm">A4 Standard ID Portrait</div>
                                            <div className="text-xs text-gray-500 mt-0.5">Global Default</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 font-medium">A4 (210 x 297 mm)</div>
                                            <div className="text-xs text-gray-500">Portrait</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 font-medium">86 x 54 mm</div>
                                            <div className="text-xs text-gray-500">Landscape</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2.5 py-1 text-xs font-bold text-green-700 bg-green-50 rounded bg-opacity-50 border border-green-200">
                                                8 Cards / Page
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right gap-2">
                                            <button className="text-blue-600 hover:text-blue-800 text-xs font-semibold px-3 py-1.5 rounded transition-colors mr-2 hover:bg-blue-50">Edit</button>
                                            <button className="text-red-600 hover:text-red-800 text-xs font-semibold px-3 py-1.5 rounded transition-colors hover:bg-red-50">Delete</button>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900 text-sm">A3 Landscape ID</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 font-medium">A3 (297 x 420 mm)</div>
                                            <div className="text-xs text-gray-500">Landscape</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 font-medium">86 x 54 mm</div>
                                            <div className="text-xs text-gray-500">Portrait</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2.5 py-1 text-xs font-bold text-green-700 bg-green-50 rounded bg-opacity-50 border border-green-200">
                                                21 Cards / Page
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right gap-2">
                                            <button className="text-blue-600 hover:text-blue-800 text-xs font-semibold px-3 py-1.5 rounded transition-colors mr-2 hover:bg-blue-50">Edit</button>
                                            <button className="text-red-600 hover:text-red-800 text-xs font-semibold px-3 py-1.5 rounded transition-colors hover:bg-red-50">Delete</button>
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot className="bg-gray-50 border-t border-gray-200">
                                    <tr>
                                        <td colSpan={5} className="px-6 py-3 text-xs text-gray-500 italic text-center">
                                            These presets will appear in the Project Settings dropdown when generating printable PDFs.
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {isFormatModalOpen && (
                            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                                <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900">Create New Print Format</h2>
                                            <p className="text-xs text-gray-500 mt-0.5">Define a reusable page and card layout combination.</p>
                                        </div>
                                        <button onClick={() => setIsFormatModalOpen(false)} className="text-gray-400 hover:bg-gray-200 p-1.5 rounded-lg transition-colors"><X size={20} /></button>
                                    </div>

                                    <div className="p-6 overflow-y-auto flex-1">
                                        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsFormatModalOpen(false); }}>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Format Name *</label>
                                                <input required type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. A4 Standard ID Portrait (86x54)" />
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Paper Settings</h3>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Paper Size</label>
                                                        <CustomSelect
                                                            value={formatPaperSize}
                                                            onChange={setFormatPaperSize}
                                                            options={[
                                                                { value: 'A4 Sheet (210 x 297mm)', label: 'A4 Sheet (210 x 297mm)' },
                                                                { value: 'A3 Sheet (297 x 420mm)', label: 'A3 Sheet (297 x 420mm)' },
                                                                { value: '12x18 Oversized', label: '12x18 Oversized' }
                                                            ]}
                                                            width="w-full"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Paper Orientation</label>
                                                        <div className="flex bg-gray-100 p-1 rounded-lg">
                                                            <button type="button" className="flex-1 px-3 py-1.5 text-xs font-bold rounded-md bg-white text-gray-900 shadow-sm border border-gray-200">Portrait</button>
                                                            <button type="button" className="flex-1 px-3 py-1.5 text-xs font-bold rounded-md text-gray-600 hover:text-gray-900">Landscape</button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Card Settings</h3>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Card Size</label>
                                                        <CustomSelect
                                                            value={formatCardSize}
                                                            onChange={setFormatCardSize}
                                                            options={[
                                                                { value: 'Standard ID (86 x 54 mm)', label: 'Standard ID (86 x 54 mm)' },
                                                                { value: 'Event Badge (90 x 110 mm)', label: 'Event Badge (90 x 110 mm)' }
                                                            ]}
                                                            width="w-full"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Card Orientation</label>
                                                        <div className="flex bg-gray-100 p-1 rounded-lg">
                                                            <button type="button" className="flex-1 px-3 py-1.5 text-xs font-bold rounded-md text-gray-600 hover:text-gray-900">Landscape</button>
                                                            <button type="button" className="flex-1 px-3 py-1.5 text-xs font-bold rounded-md bg-white text-gray-900 shadow-sm border border-gray-200">Portrait</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-2 border-t border-gray-100">
                                                <h3 className="text-sm font-bold text-gray-900 mb-4">Arrangement & Bleed</h3>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Gap Between Cards (mm)</label>
                                                        <input type="number" defaultValue="2" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Bleed Margin (mm)</label>
                                                        <input type="number" defaultValue="3" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Page Margins (mm) <span className="text-gray-400 font-normal">T/B/L/R</span></label>
                                                        <input type="text" defaultValue="10, 10, 10, 10" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-6">
                                                        <input type="checkbox" id="cutlines-modal" className="w-4 h-4 text-blue-600 rounded cursor-pointer" defaultChecked />
                                                        <label htmlFor="cutlines-modal" className="text-sm font-semibold text-gray-700 cursor-pointer">Include Cut Marks</label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                                                <button type="button" onClick={() => setIsFormatModalOpen(false)} className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-lg text-sm transition-colors">Cancel</button>
                                                <button type="submit" className="px-5 py-2 bg-[#0e30f1] text-white font-semibold rounded-lg text-sm hover:bg-blue-700 shadow-sm transition-colors">Save Print Format</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : configTab === 'integrations' ? (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-1">Global Integrations</h2>
                                <p className="text-sm text-gray-500">Connect external ERPs and LMS systems to enable automatic data syncing across all your projects.</p>
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#0e30f1] text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700 transition">
                                <Plus size={16} /> Add Integration
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {integrations.map(integration => (
                                <div key={integration.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xl font-bold text-gray-400">
                                                {integration.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{integration.name}</h3>
                                                <p className="text-xs text-gray-500 font-medium">{integration.type} ERP</p>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${integration.status === 'Connected' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                            {integration.status}
                                        </span>
                                    </div>
                                    <div className="border-t border-gray-100 pt-4 mt-2">
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs text-gray-500">Last Sync: <span className="font-semibold text-gray-700">{integration.lastSync}</span></p>
                                            <div className="flex gap-3">
                                                <button className="text-sm font-semibold text-gray-600 hover:text-gray-900">Settings</button>
                                                <button className="text-sm font-semibold text-blue-600 hover:text-blue-800">Test Sync</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-1">Card Sizes Library</h2>
                                <p className="text-sm text-gray-500">Manage standard and custom card dimensions used across your print formats. Default sizes are pre-loaded for your convenience.</p>
                            </div>
                        </div>

                        {/* Sizes Table */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    {cardSizes.length} Sizes Available
                                </span>
                                <span className="text-[11px] text-gray-400">
                                    <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-1.5"></span>Default &nbsp;
                                    <span className="inline-block w-2 h-2 rounded-full bg-purple-400 mr-1.5 ml-2"></span>Custom
                                </span>
                            </div>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                        <th className="px-5 py-3">Name</th>
                                        <th className="px-5 py-3 text-center">Width</th>
                                        <th className="px-5 py-3 text-center">Height</th>
                                        <th className="px-5 py-3 text-center">Unit</th>
                                        <th className="px-5 py-3">Notes</th>
                                        <th className="px-5 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {cardSizes.map(size => (
                                        <tr key={size.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <span className={`w-2 h-2 rounded-full shrink-0 ${size.isDefault ? 'bg-blue-400' : 'bg-purple-400'}`}></span>
                                                    <span className="text-sm font-semibold text-gray-900">{size.name}</span>
                                                    {size.isDefault && (
                                                        <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">Default</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className="text-sm font-mono text-gray-800">{size.width}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className="text-sm font-mono text-gray-800">{size.height}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{size.unit}</span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-xs text-gray-500">{size.notes || '—'}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                {!size.isDefault && (
                                                    <button
                                                        onClick={() => handleDeleteCardSize(size.id)}
                                                        className="text-xs font-semibold text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-all px-2 py-1 rounded hover:bg-red-50"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                                {size.isDefault && (
                                                    <span className="text-[10px] text-gray-400 italic">System</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Add Custom Size Form */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <Plus size={16} className="text-purple-600" />
                                    Add Custom Card Size
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">Custom sizes can be used in print formats and project templates.</p>
                            </div>
                            <form onSubmit={handleAddCardSize} className="p-5">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                    <div className="md:col-span-4">
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Size Name <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Custom Event Card"
                                            value={newCardSize.name}
                                            onChange={e => setNewCardSize({ ...newCardSize, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Width <span className="text-red-500">*</span></label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="e.g. 86"
                                            value={newCardSize.width}
                                            onChange={e => setNewCardSize({ ...newCardSize, width: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Height <span className="text-red-500">*</span></label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="e.g. 54"
                                            value={newCardSize.height}
                                            onChange={e => setNewCardSize({ ...newCardSize, height: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Unit</label>
                                        <CustomSelect
                                            value={newCardSize.unit}
                                            onChange={val => setNewCardSize({ ...newCardSize, unit: val })}
                                            options={[
                                                { value: 'mm', label: 'mm' },
                                                { value: 'inch', label: 'inch' },
                                                { value: 'cm', label: 'cm' },
                                                { value: 'px', label: 'px' }
                                            ]}
                                            width="w-full"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Notes</label>
                                        <input
                                            type="text"
                                            placeholder="Optional note"
                                            value={newCardSize.notes}
                                            onChange={e => setNewCardSize({ ...newCardSize, notes: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <button
                                            type="submit"
                                            className="w-full py-2 bg-[#0e30f1] hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm transition flex items-center justify-center gap-1"
                                        >
                                            <Plus size={14} />
                                            Add
                                        </button>
                                    </div>
                                </div>
                                {addCardSizeError && (
                                    <p className="text-red-500 text-xs font-medium mt-2">{addCardSizeError}</p>
                                )}
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ConfigurationView;
