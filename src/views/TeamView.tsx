import React from 'react';
import { Users, Plus, Search } from 'lucide-react';

const TeamView: React.FC = () => {
    const teamMembers = [
        { id: 1, name: "Rahul Sharma", email: "rahul@vendor.com", role: "Admin", status: "Active", projects: "All" },
        { id: 2, name: "Priya Singh", email: "priya@vendor.com", role: "Project Manager", status: "Active", projects: 12 },
        { id: 3, name: "Amit Kumar", email: "amit@vendor.com", role: "Data Entry", status: "Pending", projects: 4 },
        { id: 4, name: "Neha Gupta", email: "neha@vendor.com", role: "Reviewer", status: "Active", projects: 8 }
    ];

    return (
        <div className="flex-1 flex flex-col h-full bg-[#fafbfd] overflow-hidden">
            <header className="bg-white border-b border-gray-200 px-8 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Users size={20} />
                    <h1 className="text-lg font-bold text-gray-900 tracking-tight">Team Management</h1>
                </div>
                <button className="px-4 py-2 bg-[#0e30f1] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700 shadow-sm transition-colors">
                    <Plus size={16} /> Add Staff Member
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 hide-scroll">
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden text-sm">
                    <div className="p-4 border-b border-gray-200 bg-[#f8fafc] flex justify-between items-center">
                        <h3 className="font-bold text-gray-900">Vendor Staff Access</h3>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Search size={16} />
                            </div>
                            <input type="text" placeholder="Search team..." className="pl-10 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64" />
                        </div>
                    </div>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                                <th className="px-6 py-3">Staff Name</th>
                                <th className="px-6 py-3">Global Role</th>
                                <th className="px-6 py-3">Assigned Projects</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {teamMembers.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-3.5 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">{member.name}</div>
                                            <div className="text-xs text-gray-500">{member.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${member.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {member.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3.5 font-medium text-gray-600">
                                        {member.projects}
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <span className={`flex items-center gap-1.5 text-xs font-semibold ${member.status === 'Active' ? 'text-green-600' : 'text-yellow-600'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                            {member.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3.5 text-right">
                                        <button className="text-blue-600 hover:text-blue-800 text-xs font-semibold hover:bg-blue-50 px-2 py-1 rounded transition-colors">Edit</button>
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

export default TeamView;
