import React, { useState } from 'react';
import { ChevronLeft, Plus, Mail, Phone, ExternalLink, X } from 'lucide-react';

interface ClientDetailsViewProps {
  client: any;
  onBack: () => void;
}

const ClientDetailsView: React.FC<ClientDetailsViewProps> = ({ client, onBack }) => {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col gap-4 shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
                        {client.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                            {client.name}
                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-green-100 text-green-700">{client.status}</span>
                        </h1>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">{client.type} • Added Mar 2026</p>
                    </div>
                    <div className="ml-auto flex gap-3">
                        <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50 shadow-sm transition-colors text-gray-700">
                            Edit Profile
                        </button>
                        <button className="px-4 py-2 bg-[#0e30f1] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700 shadow-sm transition-colors">
                            <Plus size={16} /> New Project
                        </button>
                    </div>
                </div>

                <div className="flex px-4 overflow-x-auto hide-scroll">
                    {[
                        { id: 'overview', label: 'Overview' },
                        { id: 'projects', label: 'Projects' },
                        { id: 'staff', label: 'Client Staff Roles' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.id ? 'border-[#0e30f1] text-[#0e30f1]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 hide-scroll">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
                            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Business Details</h2>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold mb-1">Company / Institution Name</p>
                                    <p className="font-medium text-gray-900">{client.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold mb-1">Entity Type</p>
                                    <p className="font-medium text-gray-900">{client.type}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-500 font-semibold mb-1">Registered Address</p>
                                    <p className="font-medium text-gray-900">123 Education Lane, Sector 4, New Delhi, India 110001</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold mb-1">GST Number</p>
                                    <p className="font-medium text-gray-900 font-mono">22AAAAA0000A1Z5</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold mb-1">Website</p>
                                    <p className="font-medium text-blue-600 hover:underline cursor-pointer flex items-center gap-1">
                                        www.stxaviers.com <ExternalLink size={12} />
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
                            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Primary Contact</h2>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-lg">
                                    {client.contact.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{client.contact}</p>
                                    <p className="text-xs text-gray-500 font-medium">{client.type === 'School' ? 'Principal / Administrator' : 'Account Manager'}</p>
                                </div>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Mail size={16} className="text-gray-400" />
                                    {client.email}
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Phone size={16} className="text-gray-400" />
                                    {client.phone}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'projects' && (
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden h-full">
                        <div className="p-4 border-b border-gray-200 bg-[#f8fafc] flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 text-sm">Projects for this Client</h3>
                        </div>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                                    <th className="px-6 py-3">Project Name</th>
                                    <th className="px-6 py-3">Records</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {[
                                    { id: 1, name: "2026 Session ID Cards", records: 1250, status: "Active" },
                                    { id: 2, name: "2025 Session Annual Function", records: 400, status: "Completed" },
                                    { id: 3, name: "Staff ID Refresh 2026", records: 120, status: "Print Ready" },
                                    { id: 4, name: "Transport Badges", records: 45, status: "Draft" }
                                ].map((proj) => (
                                    <tr key={proj.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3.5 font-semibold text-gray-900">{proj.name}</td>
                                        <td className="px-6 py-3.5 text-gray-600 font-medium">{proj.records}</td>
                                        <td className="px-6 py-3.5">
                                            <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${proj.status === 'Active' ? 'bg-[#e2f5ec] text-[#1b7e4f]' : proj.status === 'Completed' ? 'bg-blue-50 text-blue-700' : proj.status === 'Print Ready' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {proj.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5 text-right">
                                            <button className="text-blue-600 hover:text-blue-800 text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200">Open Project</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'staff' && (
                    <div className="space-y-6">
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-1">Client Users & Access</h2>
                                <p className="text-sm text-gray-500">Add users from the client's side who can access the portal, approve data, or upload fields.</p>
                            </div>
                            <button className="px-4 py-2 bg-[#0e30f1] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700 shadow-sm transition">
                                <Plus size={16} /> Add Client User
                            </button>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                        <th className="px-6 py-3 text-left">User Details</th>
                                        <th className="px-6 py-3 text-left">Client Role</th>
                                        <th className="px-6 py-3 text-left">Portal Access</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {[
                                        { name: "Sita Sharma", email: "sita.sharma@stxaviers.com", role: "School Admin", portal: "Full Access" },
                                        { name: "Rahul Deshmukh", email: "rahul.d@stxaviers.com", role: "Data Entry Clerk", portal: "Upload Only" },
                                        { name: "Deepak Chauhan", email: "principal@stxaviers.com", role: "Approver", portal: "View & Approve" }
                                    ].map((user, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900 text-sm">{user.name}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-gray-100 text-gray-700">
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${user.portal === 'Full Access' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                                                    {user.portal}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-blue-600 hover:text-blue-800 text-xs font-semibold hover:bg-blue-50 px-3 py-1.5 rounded transition-colors mr-2">Edit</button>
                                                <button className="text-red-600 hover:text-red-800 text-xs font-semibold hover:bg-red-50 px-3 py-1.5 rounded transition-colors">Revoke</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientDetailsView;
