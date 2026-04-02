import React, { useState } from 'react';
import { Search, Plus, Layout as FileLayout } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

const TemplatesView: React.FC = () => {
    const [filterType, setFilterType] = useState('All');
    const [filterEntity, setFilterEntity] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const mockTemplates = [
        { id: 1, name: "Standard Student Modern", type: "School", entity: "Student", size: "CR80 (86x54mm)", source: "System", thumbnail: "bg-blue-50 border-blue-100 text-blue-500" },
        { id: 2, name: "Corporate Access Badge", type: "Company", entity: "Staff", size: "CR80 (86x54mm)", source: "System", thumbnail: "bg-gray-50 border-gray-200 text-gray-500" },
        { id: 3, name: "Event VIP Pass Lanyard", type: "Event", entity: "Visitor", size: "A6 (105x148mm)", source: "System", thumbnail: "bg-purple-50 border-purple-100 text-purple-500" },
        { id: 4, name: "School Staff ID Classic", type: "School", entity: "Staff", size: "CR80 (86x54mm)", source: "System", thumbnail: "bg-emerald-50 border-emerald-100 text-emerald-500" },
        { id: 5, name: "IvyPrint Custom Event", type: "Event", entity: "Visitor", size: "Custom (90x130mm)", source: "Custom", thumbnail: "bg-orange-50 border-orange-100 text-orange-500" },
        { id: 6, name: "Coaching Center Bulk ID", type: "Coaching", entity: "Student", size: "CR80 Landscape", source: "System", thumbnail: "bg-blue-50 border-blue-100 text-blue-500" },
    ];

    const filteredTemplates = mockTemplates.filter(t => {
        const matchType = filterType === 'All' || t.type === filterType;
        const matchEntity = filterEntity === 'All' || t.entity === filterEntity;
        const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchType && matchEntity && matchSearch;
    });

    return (
        <div className="flex-1 overflow-y-auto bg-[#fafbfd] hide-scroll p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Global Templates</h1>
                    <p className="text-sm text-gray-500 mt-1">Browse and use ready-made layouts or create your own custom templates.</p>
                </div>
                <button className="px-4 py-2 bg-[#0e30f1] text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 shadow-sm transition-colors">
                    <Plus size={16} /> Create New Template
                </button>
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
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Project Type</span>
                    <CustomSelect
                        value={filterType}
                        onChange={setFilterType}
                        options={[
                            { value: 'All', label: 'All Types' },
                            { value: 'School', label: 'School' },
                            { value: 'Company', label: 'Company' },
                            { value: 'Event', label: 'Event' },
                            { value: 'Coaching', label: 'Coaching' },
                        ]}
                        width="w-40"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Entity</span>
                    <CustomSelect
                        value={filterEntity}
                        onChange={setFilterEntity}
                        options={[
                            { value: 'All', label: 'All Entities' },
                            { value: 'Student', label: 'Student' },
                            { value: 'Staff', label: 'Staff' },
                            { value: 'Visitor', label: 'Visitor' },
                        ]}
                        width="w-40"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTemplates.map(template => (
                    <div key={template.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden group hover:border-gray-300 hover:shadow-md transition-all flex flex-col">
                        <div className={`h-40 ${template.thumbnail} border-b flex items-center justify-center p-4 relative`}>
                            {template.source === 'System' && (
                                <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded-full text-gray-600 border border-gray-200">System</div>
                            )}
                            {template.source === 'Custom' && (
                                <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded-full text-[#0e30f1] border border-blue-200">Custom</div>
                            )}
                            <div className="w-full h-full bg-white/50 border border-current rounded flex items-center justify-center border-dashed">
                                <FileLayout size={24} />
                            </div>

                            {/* Action Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    className="px-4 py-2 bg-white text-black text-sm font-bold rounded-lg shadow-lg hover:scale-105 transition-transform"
                                >
                                    Use Template
                                </button>
                            </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-bold text-gray-900 line-clamp-1" title={template.name}>{template.name}</h3>
                            <div className="text-xs font-medium text-gray-500 mt-1">{template.size}</div>

                            <div className="mt-4 flex gap-2 pt-4 border-t border-gray-100 mt-auto">
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{template.type}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{template.entity}</span>
                            </div>
                        </div>
                    </div>
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
    );
};

export default TemplatesView;
