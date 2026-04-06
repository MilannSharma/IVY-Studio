import React, { useState, useMemo } from 'react';
import { 
    Search, 
    ArrowDownLeft, 
    ArrowUpRight, 
    ChevronDown, 
    Download,
    Calendar,
    MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CustomSelect from '../components/CustomSelect';

interface Transaction {
    id: string;
    name: string;
    date: string;
    status: string;
    amount: number;
    type: 'credit' | 'debit';
    hasDiscount?: boolean;
    category?: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
    { 
        id: '1', 
        name: 'vbnm', 
        date: '26-02-2026 04:58 PM', 
        status: 'COMPLETED', 
        amount: 11.16, 
        type: 'credit', 
        hasDiscount: true,
        category: 'Sales'
    },
    { 
        id: '2', 
        name: 'SHIPPING CHARGE #17', 
        date: '26-02-2026 04:57 PM', 
        status: 'COMPLETED', 
        amount: 10000, 
        type: 'debit', 
        hasDiscount: false,
        category: 'Shipping'
    },
    { 
        id: '3', 
        name: '17 - 1234', 
        date: '27-01-2026 12:57 PM', 
        status: 'COMPLETED', 
        amount: 12159, 
        type: 'debit', 
        hasDiscount: false,
        category: 'Order Payment'
    },
    { 
        id: '4', 
        name: '11 - aaa', 
        date: '20-01-2026 10:45 AM', 
        status: 'COMPLETED', 
        amount: 0, 
        type: 'debit', 
        hasDiscount: false,
        category: 'Miscellaneous'
    },
];

const TransactionsView: React.FC = () => {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All Transactions');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const filteredTransactions = useMemo(() => {
        return MOCK_TRANSACTIONS.filter(t => {
            const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                                 t.category?.toLowerCase().includes(search.toLowerCase());
            const matchesFilter = filter === 'All Transactions' || 
                                 (filter === 'Credited' && t.type === 'credit') ||
                                 (filter === 'Debited' && t.type === 'debit');
            return matchesSearch && matchesFilter;
        });
    }, [search, filter]);

    const totalCredited = 10012;
    const totalDebited = 10012;
    const balance = 0.00;

    return (
        <div className="flex-1 flex flex-col h-full bg-[#fafbfd] overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#1e293b] tracking-tight">Transactions</h1>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                        <Download size={18} />
                        Export
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8 hide-scroll">
                {/* Balance Card */}
                <div className="bg-white border border-gray-100 rounded-2xl p-8 mb-8 shadow-sm">
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-[#064e3b]">₹ {balance.toFixed(2)}</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 mb-8">
                    <div className="w-64">
                        <CustomSelect 
                            value={filter}
                            onChange={setFilter}
                            options={[
                                { value: 'All Transactions', label: 'All Transactions' },
                                { value: 'Credited', label: 'Credited' },
                                { value: 'Debited', label: 'Debited' },
                            ]}
                        />
                    </div>
                    <div className="flex-1 relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text"
                            placeholder="Search by name or category..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-gray-400 shadow-sm transition-all"
                        />
                    </div>
                    <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-all shadow-sm">
                        <Calendar size={20} />
                    </button>
                </div>

                {/* Recent Transactions Section */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between flex-wrap gap-4">
                        <h2 className="text-lg font-bold text-[#1e293b]">Recent Transactions</h2>
                        <div className="flex gap-3">
                            <div className="px-4 py-1.5 bg-[#059669] text-white text-xs font-bold rounded-lg shadow-sm">
                                Total Credited: {totalCredited}
                            </div>
                            <div className="px-4 py-1.5 bg-[#7f1d1d] text-white text-xs font-bold rounded-lg shadow-sm">
                                Total Debited: {totalDebited}
                            </div>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {filteredTransactions.map((t) => (
                            <div key={t.id} className="group">
                                <div 
                                    className="px-6 py-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors cursor-pointer"
                                    onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            t.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                        }`}>
                                            {t.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#1e293b] group-hover:text-blue-600 transition-colors">{t.name}</p>
                                            <p className="text-xs font-medium text-gray-500 mt-0.5">{t.date}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col items-end gap-1.5">
                                            <span className="px-3 py-1 bg-[#059669] text-white text-[10px] font-black rounded-lg">
                                                {t.status}
                                            </span>
                                        </div>
                                        
                                        <div className="flex flex-col items-end min-w-[100px]">
                                            <span className={`text-base font-black ${
                                                t.type === 'credit' ? 'text-[#059669]' : 'text-[#7f1d1d]'
                                            }`}>
                                                {t.type === 'credit' ? '+' : '-'}₹{t.amount.toLocaleString()}
                                            </span>
                                            {t.hasDiscount && (
                                                <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-bold rounded-md border border-orange-100 mt-1">
                                                    Discount
                                                </span>
                                            )}
                                        </div>

                                        <ChevronDown 
                                            size={20} 
                                            className={`text-gray-400 transition-transform duration-200 ${expandedId === t.id ? 'rotate-180' : ''}`} 
                                        />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedId === t.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden bg-gray-50/50"
                                        >
                                            <div className="px-20 py-6 grid grid-cols-3 gap-8">
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Category</p>
                                                    <p className="text-sm font-semibold text-gray-700">{t.category}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Transaction ID</p>
                                                    <p className="text-sm font-mono text-gray-600">TXN-{t.id}982347</p>
                                                </div>
                                                <div className="flex justify-end items-center">
                                                    <button className="p-2 hover:bg-white rounded-lg transition-colors text-gray-400 hover:text-gray-600">
                                                        <MoreHorizontal size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}

                        {filteredTransactions.length === 0 && (
                            <div className="p-20 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                    <Search className="text-gray-300" size={32} />
                                </div>
                                <p className="text-gray-900 font-bold">No transactions found</p>
                                <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionsView;
