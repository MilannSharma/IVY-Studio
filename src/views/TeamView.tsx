import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit2, Loader2 } from 'lucide-react';
import { db, collection, onSnapshot, query, orderBy, handleFirestoreError, OperationType } from '../firebase';
import { useUser } from '../App';
import AddStaffModal from '../components/modals/AddStaffModal';
import Header from '../components/Header';

interface TeamViewProps {
    setActiveTab?: (tab: string) => void;
}

const TeamView: React.FC<TeamViewProps> = ({ setActiveTab }) => {
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const { user } = useUser();

    const ROLES = ['All', 'Staff', 'Salesperson', 'Credit_manager', 'Accounts', 'Admin'];

    useEffect(() => {
        const q = query(collection(db, 'staff'), orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const staffData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setStaff(staffData);
            setLoading(false);
        }, (error) => {
            handleFirestoreError(error, OperationType.LIST, 'staff', user?.uid, user?.email);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const filteredStaff = staff.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
            s.email.toLowerCase().includes(search.toLowerCase()) ||
            s.phone.toLowerCase().includes(search.toLowerCase());
        
        const matchesRole = roleFilter === 'All' || s.role === roleFilter;
        
        return matchesSearch && matchesRole;
    });

    return (
        <div className="flex-1 flex flex-col h-full bg-[#fafbfd] overflow-hidden">
            <Header title="Staffs" icon={<Users size={20} />} setActiveTab={setActiveTab}>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-[#0e30f1] text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 shadow-sm transition-all active:scale-95"
                >
                    <Plus size={16} /> Add New
                </button>
            </Header>

            <div className="flex-1 overflow-y-auto p-8 hide-scroll">
                <div className="mb-6 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg">
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total Records : {filteredStaff.length}</span>
                        </div>
                        <select 
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 bg-white outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        >
                            {ROLES.map(role => (
                                <option key={role} value={role}>{role === 'All' ? 'All Roles' : role}</option>
                            ))}
                        </select>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Search size={16} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search staff..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64 bg-white shadow-sm" 
                        />
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden text-sm">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#f8fafc] border-b border-gray-200 text-xs font-bold text-gray-500">
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <Loader2 size={32} className="text-blue-600 animate-spin" />
                                            <p className="text-gray-500 font-medium">Loading staff members...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredStaff.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No staff members found.
                                    </td>
                                </tr>
                            ) : filteredStaff.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{member.name}</td>
                                    <td className="px-6 py-4 text-gray-600">{member.email}</td>
                                    <td className="px-6 py-4 text-gray-600 font-medium">{member.phone}</td>
                                    <td className="px-6 py-4 text-gray-600">{member.role}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-gray-400 text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                            {member.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                            <Edit2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <AddStaffModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default TeamView;
