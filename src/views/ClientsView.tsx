import React, { useState, useEffect, useMemo } from 'react';
import { Building2 as Building, Plus, Search, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronsUpDown, X, Check } from 'lucide-react';
import Header from '../components/Header';
import { db, collection, onSnapshot, query, orderBy, handleFirestoreError, OperationType } from '../firebase';
import { useUser } from '../App';
import AddClientModal from '../components/modals/AddClientModal';

interface ClientsViewProps {
  onSelectClient: (client: any) => void;
  setActiveTab?: (tab: string) => void;
}

const ClientsView: React.FC<ClientsViewProps> = ({ onSelectClient, setActiveTab }) => {
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedSalesPersons, setSelectedSalesPersons] = useState<string[]>([]);
    const [isSalesDropdownOpen, setIsSalesDropdownOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useUser();

    // Mock sales persons - in a real app, these would come from a 'team' or 'users' collection
    const salesPersons = useMemo(() => {
        const uniqueSales = Array.from(new Set(clients.map(c => c.salePerson).filter(Boolean)));
        // Ensure we have some default ones if none are in clients yet
        const defaults = ["Rahul Sharma", "Priya Singh", "Amit Kumar", "Neha Gupta"];
        return Array.from(new Set([...defaults, ...uniqueSales]));
    }, [clients]);

    useEffect(() => {
        const q = query(collection(db, 'clients'), orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const clientsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setClients(clientsData);
            setLoading(false);
        }, (error) => {
            handleFirestoreError(error, OperationType.LIST, 'clients', user?.uid, user?.email);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const filteredClients = useMemo(() => {
        return clients.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                                 (c.email?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
                                 (c.phone?.toLowerCase().includes(search.toLowerCase()) ?? false);
            
            const matchesSalesPerson = selectedSalesPersons.length === 0 || 
                                      selectedSalesPersons.includes(c.salePerson);
            
            return matchesSearch && matchesSalesPerson;
        });
    }, [clients, search, selectedSalesPersons]);

    const toggleSalesPerson = (name: string) => {
        setSelectedSalesPersons(prev => 
            prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
        );
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#fafbfd] overflow-hidden">
            <Header title="Clients Directory" icon={<Building size={20} />} setActiveTab={setActiveTab}>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-2.5 bg-[#0e30f1] text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 shadow-md transition-all active:scale-95"
                >
                    Add New Client
                </button>
            </Header>

            <div className="flex-1 overflow-y-auto p-8 hide-scroll">
                <div className="mb-8 flex flex-wrap items-end gap-6">
                    <div className="flex flex-col gap-1.5 flex-1 max-w-md">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Search Client</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Search size={16} />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search by name, email or phone..." 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm transition-all" 
                            />
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 min-w-[280px] relative">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Filter By Sales Person</label>
                        <div 
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white shadow-sm cursor-pointer flex items-center justify-between min-h-[42px]"
                            onClick={() => setIsSalesDropdownOpen(!isSalesDropdownOpen)}
                        >
                            <div className="flex flex-wrap gap-1">
                                {selectedSalesPersons.length === 0 ? (
                                    <span className="text-gray-400">Select Sales Person</span>
                                ) : (
                                    selectedSalesPersons.map(name => (
                                        <span key={name} className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                                            {name}
                                            <X size={10} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleSalesPerson(name); }} />
                                        </span>
                                    ))
                                )}
                            </div>
                            <ChevronsUpDown size={14} className="text-gray-400 shrink-0" />
                        </div>

                        {isSalesDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsSalesDropdownOpen(false)} />
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-2 max-h-60 overflow-y-auto custom-scrollbar">
                                    {salesPersons.map(name => (
                                        <div 
                                            key={name}
                                            className="px-4 py-2 hover:bg-gray-50 flex items-center justify-between cursor-pointer group"
                                            onClick={() => toggleSalesPerson(name)}
                                        >
                                            <span className={`text-sm ${selectedSalesPersons.includes(name) ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>
                                                {name}
                                            </span>
                                            {selectedSalesPersons.includes(name) && <Check size={14} className="text-blue-600" />}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden text-sm">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                                <th className="px-6 py-3">
                                    <div className="flex items-center gap-2">
                                        Client Name <ChevronsUpDown size={12} className="text-gray-400" />
                                    </div>
                                </th>
                                <th className="px-6 py-3">
                                    <div className="flex items-center gap-2">
                                        Contact <ChevronsUpDown size={12} className="text-gray-400" />
                                    </div>
                                </th>
                                <th className="px-6 py-3">Sale Person</th>
                                <th className="px-6 py-3">
                                    <div className="flex items-center gap-2">
                                        Type <ChevronsUpDown size={12} className="text-gray-400" />
                                    </div>
                                </th>
                                <th className="px-6 py-3">
                                    <div className="flex items-center gap-2">
                                        Max Credit <ChevronsUpDown size={12} className="text-gray-400" />
                                    </div>
                                </th>
                                <th className="px-6 py-3">
                                    <div className="flex items-center gap-2">
                                        Balance <ChevronsUpDown size={12} className="text-gray-400" />
                                    </div>
                                </th>
                                <th className="px-6 py-3">
                                    <div className="flex items-center gap-2">
                                        Created At <ChevronsUpDown size={12} className="text-gray-400" />
                                    </div>
                                </th>
                                <th className="px-6 py-3">Address</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <Loader2 size={32} className="text-blue-600 animate-spin" />
                                            <p className="text-gray-500 font-medium">Loading clients...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                                        No clients found.
                                    </td>
                                </tr>
                            ) : filteredClients.map((client) => (
                                <tr key={client.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onSelectClient(client)}>
                                    <td className="px-6 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                                {client.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{client.name}</div>
                                                <div className="text-xs text-gray-500">{client.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5 text-gray-600 font-medium">
                                        {client.phone || 'N/A'}
                                    </td>
                                    <td className="px-6 py-3.5 text-gray-600">
                                        {client.salePerson || 'N/A'}
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                            client.type === 'School' ? 'bg-blue-100 text-blue-700' : 
                                            client.type === 'Coaching' ? 'bg-purple-100 text-purple-700' : 
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {client.type || 'Other'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3.5 text-gray-600 font-medium">
                                        ₹{client.maxCredit?.toLocaleString() || '0'}
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <span className={`font-bold ${client.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            ₹{client.balance?.toLocaleString() || '0'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3.5 text-gray-500 text-xs">
                                        {client.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                                    </td>
                                    <td className="px-6 py-3.5 text-gray-500 text-xs max-w-[200px] truncate">
                                        {client.address || 'N/A'}
                                    </td>
                                    <td className="px-6 py-3.5 text-right">
                                        <button className="text-blue-600 hover:text-blue-800 text-xs font-semibold hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors border border-blue-200" onClick={(e) => { e.stopPropagation(); onSelectClient(client); }}>View Profile</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-6 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                            <button className="p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-30"><ChevronsLeft size={14} /></button>
                            <button className="p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-30"><ChevronLeft size={14} /></button>
                            <span className="mx-2">Page <span className="font-bold text-gray-900">1</span> of <span className="font-bold text-gray-900">{Math.ceil(filteredClients.length / 25) || 1}</span></span>
                            <button className="p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-30"><ChevronRight size={14} /></button>
                            <button className="p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-30"><ChevronsRight size={14} /></button>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                            <span>Showing {filteredClients.length} clients</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <select className="px-2 py-1 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-blue-500 bg-white">
                                <option>Show 25</option>
                                <option>Show 50</option>
                                <option>Show 100</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <AddClientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default ClientsView;
