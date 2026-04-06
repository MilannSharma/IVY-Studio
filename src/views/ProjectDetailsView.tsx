import React, { useState } from 'react';
import { ChevronLeft, Plus, Search, Filter, Sparkles, Activity, Download, X, Copy, Check, FileText, Users, Briefcase, Layout as FileLayout } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { Project } from '../types';

interface ProjectDetailsViewProps {
  project: Project;
  onBack: () => void;
}

const ProjectDetailsView: React.FC<ProjectDetailsViewProps> = ({ project, onBack }) => {
    const [activeTab, setActiveTab] = useState('records');
    const [isBulkEditing, setIsBulkEditing] = useState(false);
    const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
    const [basketRecords, setBasketRecords] = useState(new Set<string>());
    const [showBasketOnly, setShowBasketOnly] = useState(false);
    const [selectedRecordForReview, setSelectedRecordForReview] = useState<any>(null);

    // Sample Data
    const [records, setRecords] = useState([
        { id: "STU2025001", name: "Rahul Sharma", entity: "Student", roll_no: "101", group: "Class 10-A", status: "Approved", aiScore: 95 },
        { id: "STU2025002", name: "Priya Verma", entity: "Student", roll_no: "102", group: "Class 10-A", status: "AI Checking", aiScore: null },
        { id: "STU2025003", name: "Amit Kumar", entity: "Student", roll_no: "103", group: "Class 10-B", status: "Rejected", aiScore: 40 },
        { id: "STF2025001", name: "R.K. Singh", entity: "Staff", emp_id: "EMP-01", group: "Teaching", status: "Print Ready", aiScore: 98 },
        { id: "STU2025004", name: "Sneha Patel", entity: "Student", roll_no: "104", group: "Class 10-A", status: "File Generated", aiScore: 92 },
        { id: "STU2025005", name: "Rohan Das", entity: "Student", roll_no: "105", group: "Class 10-B", status: "Printed", aiScore: 88 },
        { id: "STU2025006", name: "Kavya Singh", entity: "Student", roll_no: "106", group: "Class 10-A", status: "Damaged", aiScore: 96 },
        { id: "STU2025007", name: "Arjun Reddy", entity: "Student", roll_no: "107", group: "Class 10-C", status: "Missing", aiScore: 90 },
    ]);

    const tasks = [
        { id: 1, title: "Data Collection (Portal)", status: "In Progress", type: "portal", progress: 65, dueDate: "2026-03-10" },
        { id: 2, title: "Template Design", status: "Completed", type: "design", progress: 100, dueDate: "2026-03-05" },
        { id: 3, title: "Generate Print PDFs", status: "Pending", type: "print", progress: 0, dueDate: "2026-03-15" }
    ];

    const RecordStatusBadge = ({ status }: { status: string }) => {
        const colors: Record<string, string> = {
            'Approved': 'bg-green-100 text-green-700',
            'AI Checking': 'bg-yellow-100 text-yellow-700',
            'Rejected': 'bg-red-100 text-red-700',
            'Print Ready': 'bg-purple-100 text-purple-700',
            'File Generated': 'bg-blue-100 text-blue-700',
            'Printed': 'bg-teal-100 text-teal-800',
            'Missing': 'bg-orange-100 text-orange-800',
            'Damaged': 'bg-red-100 text-red-800',
        };
        return <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${colors[status] || 'bg-gray-100'}`}>{status}</span>;
    };

    const TaskStatusBadge = ({ status }: { status: string }) => {
        const colors: Record<string, string> = {
            'Completed': 'bg-green-50 text-green-700 border-green-200',
            'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
            'Pending': 'bg-gray-50 text-gray-600 border-gray-200',
        };
        return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${colors[status] || 'bg-gray-100'}`}>{status}</span>;
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRecords(records.map(r => r.id));
        } else {
            setSelectedRecords([]);
        }
    };

    const handleSelectRecord = (id: string) => {
        if (selectedRecords.includes(id)) {
            setSelectedRecords(selectedRecords.filter(rId => rId !== id));
        } else {
            setSelectedRecords([...selectedRecords, id]);
        }
    };

    const handleAddToBasket = () => {
        const newBasket = new Set(basketRecords);
        selectedRecords.forEach(id => newBasket.add(id));
        setBasketRecords(newBasket);
        setSelectedRecords([]);
    };

    const handleUpdateStatus = (newStatus: string) => {
        const updatedRecords = records.map(record => {
            if (selectedRecords.includes(record.id)) {
                return { ...record, status: newStatus };
            }
            return record;
        });
        setRecords(updatedRecords);
        setSelectedRecords([]);
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col gap-4 shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                            {project.name}
                            <StatusBadge status={project.status} />
                        </h1>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">Client: {project.client} • Type: {project.type} • ID: PRJ-{1000 + project.id}</p>
                    </div>
                    <div className="ml-auto flex gap-3">
                        <button 
                            className="px-4 py-2 bg-purple-50 text-purple-600 border border-purple-200 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-purple-100 shadow-sm transition-colors"
                        >
                            <Sparkles size={16} />
                            AI Insights
                        </button>
                        <button onClick={() => setActiveTab('settings')} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors">Edit Settings</button>
                        <button className="px-4 py-2 bg-[#0e30f1] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700 shadow-sm transition-colors">
                            Generate Print Job
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex gap-6 mt-2 overflow-x-auto hide-scroll">
                    {['Records', 'Groups', 'Tasks', 'Templates', 'Print Batches', 'AI Insights', 'Audit Log', 'Team & Access', 'Integrations', 'Raw Files', 'Portal settings'].map(tab => {
                        const id = tab === 'Team & Access' ? 'team'
                            : tab === 'Portal settings' ? 'portal'
                                : tab === 'Print Batches' ? 'print-batches'
                                    : tab === 'Raw Files' ? 'raw-files'
                                        : tab === 'AI Insights' ? 'ai-insights'
                                            : tab === 'Audit Log' ? 'audit-log'
                                                : tab.toLowerCase();
                        const isActive = activeTab === id;
                        return (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`pb-3 text-sm font-semibold transition-colors relative whitespace-nowrap ${isActive ? 'text-[#0e30f1]' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {tab}
                                {isActive && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0e30f1] rounded-t-full"></div>}
                            </button>
                        );
                    })}
                </div>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 hide-scroll">
                {activeTab === 'records' && (
                    <div className="space-y-4">
                        {/* Summary Bar */}
                        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex gap-8">
                                <div><p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Records</p><p className="text-xl font-bold">{project.entries}</p></div>
                                <div><p className="text-xs text-green-600 font-medium uppercase tracking-wide">Approved</p><p className="text-xl font-bold text-green-700">840</p></div>
                                <div><p className="text-xs text-purple-600 font-medium uppercase tracking-wide">Print Ready</p><p className="text-xl font-bold text-purple-700">410</p></div>
                                <div><p className="text-xs text-red-600 font-medium uppercase tracking-wide">AI Rejected</p><p className="text-xl font-bold text-red-700">12</p></div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsBulkEditing(!isBulkEditing)}
                                    className={`flex items-center gap-2 px-3 py-1.5 border rounded-md text-xs font-semibold shadow-sm transition-colors ${isBulkEditing ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                >
                                    <FileText size={14} />
                                    {isBulkEditing ? 'Exit Bulk Edit' : 'Bulk Edit'}
                                </button>
                                <button className="flex items-center gap-2 px-3 py-1.5 bg-[#0e30f1] text-white rounded-md text-xs font-semibold hover:bg-blue-700 shadow-sm">
                                    <Plus size={14} /> Add Data
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-3 items-center">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search size={16} className="absolute inset-y-0 left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" placeholder="Search by Name, Record ID..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white outline-none" />
                            </div>
                            <button
                                onClick={() => setShowBasketOnly(!showBasketOnly)}
                                className={`px-3 py-2 border rounded-lg text-sm font-semibold flex items-center gap-2 ${showBasketOnly ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-white border-gray-300 text-gray-700'}`}
                            >
                                <Download size={14} />
                                Basket ({basketRecords.size})
                            </button>
                        </div>

                        {/* Table */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                        <th className="px-5 py-3 w-10 text-center"><input type="checkbox" checked={selectedRecords.length === records.length} onChange={handleSelectAll} /></th>
                                        <th className="px-5 py-3">Record ID</th>
                                        <th className="px-5 py-3">Name</th>
                                        <th className="px-5 py-3">Entity</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {records.filter(r => !showBasketOnly || basketRecords.has(r.id)).map((r) => (
                                        <tr key={r.id} className="hover:bg-gray-50 group">
                                            <td className="px-5 py-3 text-center">
                                                <input type="checkbox" checked={selectedRecords.includes(r.id)} onChange={() => handleSelectRecord(r.id)} />
                                            </td>
                                            <td className="px-5 py-3 font-mono text-xs text-gray-500">{r.id}</td>
                                            <td className="px-5 py-3 font-semibold text-gray-900">{r.name}</td>
                                            <td className="px-5 py-3 text-gray-600">{r.entity}</td>
                                            <td className="px-5 py-3"><RecordStatusBadge status={r.status} /></td>
                                            <td className="px-5 py-3 text-right">
                                                <button onClick={() => setSelectedRecordForReview(r)} className="text-blue-600 hover:underline font-semibold">Review</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'groups' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { name: "Class 10-A", count: 42, template: "School_ID_V2" },
                            { name: "Class 10-B", count: 38, template: "School_ID_V2" },
                            { name: "Teaching Staff", count: 12, template: "Staff_ID_Standard" }
                        ].map((g, i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{g.name}</h3>
                                        <p className="text-xs text-gray-500">{g.count} Records</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Template</p>
                                    <p className="text-sm font-semibold text-gray-700">{g.template}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'tasks' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {tasks.map(task => (
                            <div key={task.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-40">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <TaskStatusBadge status={task.status} />
                                        <span className="text-xs text-gray-500">Due: {task.dueDate}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 leading-tight">{task.title}</h3>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-500">Progress</span>
                                        <span className="text-gray-900 font-bold">{task.progress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="bg-blue-600 h-full" style={{ width: `${task.progress}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-2xl">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Project Settings</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Project Name</label>
                                <input type="text" defaultValue={project.name} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Client</label>
                                <input type="text" defaultValue={project.client} disabled className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50" />
                            </div>
                            <div className="pt-4 border-t border-gray-100 flex justify-end">
                                <button className="px-6 py-2 bg-[#0e30f1] text-white rounded-lg font-bold hover:bg-blue-700 transition">Save Changes</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Record Review Modal */}
            {selectedRecordForReview && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
                    <div className="bg-white w-[500px] h-full shadow-2xl flex flex-col animate-slide-in-right">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">{selectedRecordForReview.name}</h2>
                                <RecordStatusBadge status={selectedRecordForReview.status} />
                            </div>
                            <button onClick={() => setSelectedRecordForReview(null)} className="p-1.5 text-gray-400 hover:text-gray-900"><X size={20} /></button>
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto">
                            <div className="space-y-6">
                                <div className="aspect-square bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedRecordForReview.name}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><p className="text-xs text-gray-500 font-bold uppercase">Record ID</p><p className="text-sm font-semibold">{selectedRecordForReview.id}</p></div>
                                    <div><p className="text-xs text-gray-500 font-bold uppercase">Roll No</p><p className="text-sm font-semibold">{selectedRecordForReview.roll_no || '—'}</p></div>
                                    <div><p className="text-xs text-gray-500 font-bold uppercase">Entity</p><p className="text-sm font-semibold">{selectedRecordForReview.entity}</p></div>
                                    <div><p className="text-xs text-gray-500 font-bold uppercase">Group</p><p className="text-sm font-semibold">{selectedRecordForReview.group}</p></div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                            <button onClick={() => setSelectedRecordForReview(null)} className="flex-1 py-2 bg-white border border-gray-300 rounded-lg font-bold">Close</button>
                            <button className="flex-1 py-2 bg-[#0e30f1] text-white rounded-lg font-bold">Approve</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDetailsView;
