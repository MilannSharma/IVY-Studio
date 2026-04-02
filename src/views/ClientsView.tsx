import React from 'react';
import { Building2 as Building, Plus, Search } from 'lucide-react';

interface ClientsViewProps {
  onSelectClient: (client: any) => void;
}

const ClientsView: React.FC<ClientsViewProps> = ({ onSelectClient }) => {
    const clientsList = [
        { id: 1, name: "St. Xavier's High School", type: "School", contact: "Principal Sharma", email: "info@stxaviers.com", phone: "+91 9876543210", activeProjects: 2, status: "Active" },
        { id: 2, name: "TechCorp India", type: "Company", contact: "HR Manager", email: "hr@techcorp.in", phone: "+91 9123456789", activeProjects: 1, status: "Active" },
        { id: 3, name: "Allen Coaching Institute", type: "Institute", contact: "Admin Desk", email: "admin@allen.ac.in", phone: "+91 9988776655", activeProjects: 3, status: "Active" }
    ];

    return (
        <div className="flex-1 flex flex-col h-full bg-[#fafbfd] overflow-hidden">
            <header className="bg-white border-b border-gray-200 px-8 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Building size={20} />
                    <h1 className="text-lg font-bold text-gray-900 tracking-tight">Clients Directory</h1>
                </div>
                <button className="px-4 py-2 bg-[#0e30f1] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700 shadow-sm transition-colors">
                    <Plus size={16} /> Add Client
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 hide-scroll">
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden text-sm">
                    <div className="p-4 border-b border-gray-200 bg-[#f8fafc] flex justify-between items-center">
                        <h3 className="font-bold text-gray-900">All Clients</h3>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Search size={16} />
                            </div>
                            <input type="text" placeholder="Search clients..." className="pl-10 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64" />
                        </div>
                    </div>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                                <th className="px-6 py-3">Client Name</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Contact Person</th>
                                <th className="px-6 py-3">Active Projects</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {clientsList.map((client) => (
                                <tr key={client.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onSelectClient(client)}>
                                    <td className="px-6 py-3.5 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                            {client.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">{client.name}</div>
                                            <div className="text-xs text-gray-500">{client.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5 text-gray-600 font-medium">
                                        {client.type}
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <div className="text-sm font-medium text-gray-900">{client.contact}</div>
                                        <div className="text-xs text-gray-500">{client.phone}</div>
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <span className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 rounded-full border border-blue-200">
                                            {client.activeProjects} Projects
                                        </span>
                                    </td>
                                    <td className="px-6 py-3.5 text-right">
                                        <button className="text-blue-600 hover:text-blue-800 text-xs font-semibold hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors border border-blue-200" onClick={(e) => { e.stopPropagation(); onSelectClient(client); }}>View Profile</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ClientsView;
