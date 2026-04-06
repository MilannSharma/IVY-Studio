import React, { useState } from 'react';
import { Search, ChevronDown, ArrowUpDown, ClipboardList } from 'lucide-react';
import { motion } from 'motion/react';
import CustomSelect from '../components/CustomSelect';

const TasksView: React.FC = () => {
    const [statusFilter, setStatusFilter] = useState('All');
    const [staffSearch, setStaffSearch] = useState('');

    return (
        <div className="flex-1 flex flex-col h-full bg-[#fafbfd] overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6">
                <h1 className="text-xl font-bold text-[#1e293b] tracking-tight">Project Tasks</h1>
            </div>

            {/* Filters Area */}
            <div className="px-8 pb-6 flex gap-6">
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Status</label>
                    <CustomSelect
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={[
                            { value: 'All', label: 'All' },
                            { value: 'Pending', label: 'Pending' },
                            { value: 'In Progress', label: 'In Progress' },
                            { value: 'Completed', label: 'Completed' },
                        ]}
                        width="w-32"
                    />
                </div>
                <div className="flex flex-col gap-1.5 min-w-[240px]">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Staff</label>
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Search staff"
                            value={staffSearch}
                            onChange={e => setStaffSearch(e.target.value)}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-gray-400"
                        />
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 px-8 pb-8 overflow-hidden flex flex-col">
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-[13px] font-semibold text-gray-500">
                                    <th className="px-6 py-4">Task / Type</th>
                                    <th className="px-6 py-4">Project</th>
                                    <th className="px-6 py-4">Vendor</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-gray-700 transition-colors">
                                            Due Date <ArrowUpDown size={14} className="text-gray-400" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-4">Assignee</th>
                                    <th className="px-6 py-4">Task Timer</th>
                                    <th className="px-6 py-4">
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-gray-700 transition-colors">
                                            Last Updated At <ArrowUpDown size={14} className="text-gray-400" />
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                        </table>
                    </div>

                    {/* Empty State */}
                    <div className="flex-1 flex flex-col items-center justify-center bg-[#f8fafc]/50">
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center"
                        >
                            <div className="relative mb-6">
                                {/* Clipboard Illustration */}
                                <div className="relative w-24 h-24 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-white border-2 border-gray-200 rounded-lg rotate-[-12deg] translate-x-[-10px] translate-y-[-5px]">
                                        <div className="w-8 h-2 bg-blue-500 rounded-full mx-auto mt-[-4px]" />
                                    </div>
                                    <div className="absolute inset-0 bg-white border-2 border-gray-300 rounded-lg shadow-sm">
                                        <div className="w-8 h-2 bg-blue-600 rounded-full mx-auto mt-[-4px]" />
                                        <div className="mt-4 px-3 space-y-2">
                                            <div className="h-1.5 w-full bg-gray-100 rounded" />
                                            <div className="h-1.5 w-3/4 bg-gray-100 rounded" />
                                            <div className="h-1.5 w-1/2 bg-gray-100 rounded" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-500 font-medium text-sm">No data found</p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TasksView;
