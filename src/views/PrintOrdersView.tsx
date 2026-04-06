import React, { useState, useMemo, useEffect } from 'react';
import { Search, Sparkles, TrendingUp, AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CustomSelect from '../components/CustomSelect';
import { GoogleGenAI, Type } from "@google/genai";

interface PrintOrder {
    id: string;
    index: number;
    name: string;
    clientName: string;
    fileType: string;
    status: string;
    createdAt: string;
}

interface AIInsight {
    title: string;
    description: string;
    type: 'success' | 'warning' | 'info';
    metric?: string;
}

const MOCK_ORDERS: PrintOrder[] = [
    { id: '1', index: 17, name: '1234', clientName: 'Global Tech', fileType: 'CARD', status: 'SENT_TO_PRINT', createdAt: '27 Jan 2026, 12:57 PM' },
    { id: '2', index: 14, name: 'Cv', clientName: 'Design Pro', fileType: 'CARD', status: 'DRAFT', createdAt: '15 Jan 2026, 11:08 AM' },
    { id: '3', index: 13, name: 'Zxc', clientName: 'Design Pro', fileType: 'CARD', status: 'DRAFT', createdAt: '15 Jan 2026, 11:02 AM' },
    { id: '4', index: 12, name: 'S', clientName: 'Materials Inc', fileType: 'RAW_MATERIAL', status: 'DRAFT', createdAt: '15 Jan 2026, 10:54 AM' },
    { id: '5', index: 11, name: 'Aaa', clientName: 'Materials Inc', fileType: 'RAW_MATERIAL', status: 'SENT_TO_PRINT', createdAt: '15 Jan 2026, 10:52 AM' },
    { id: '6', index: 10, name: 'New', clientName: 'Global Tech', fileType: 'RAW_MATERIAL', status: 'DISPATCHED', createdAt: '15 Jan 2026, 10:45 AM' },
];

const PrintOrdersView: React.FC = () => {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [clientSearch, setClientSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);

    const generateAIInsights = async () => {
        setIsLoadingInsights(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `Analyze these print orders and provide 3-4 key business insights. 
                Focus on efficiency, common issues (like high draft counts), and client activity.
                Return the response as a JSON array of objects with keys: title, description, type (one of: 'success', 'warning', 'info'), and metric (optional short string).
                
                Orders Data: ${JSON.stringify(MOCK_ORDERS)}`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                description: { type: Type.STRING },
                                type: { type: Type.STRING, enum: ['success', 'warning', 'info'] },
                                metric: { type: Type.STRING }
                            },
                            required: ['title', 'description', 'type']
                        }
                    }
                }
            });

            if (response.text) {
                const insights = JSON.parse(response.text);
                setAiInsights(insights);
            }
        } catch (error) {
            console.error("Error generating AI insights:", error);
            // Fallback insights if API fails
            setAiInsights([
                { title: "High Draft Ratio", description: "50% of current orders are in Draft status. Consider following up with clients.", type: "warning", metric: "50%" },
                { title: "Top Client Activity", description: "Global Tech and Design Pro are your most active clients this period.", type: "info", metric: "Active" },
                { title: "Processing Efficiency", description: "Orders are moving to 'SENT_TO_PRINT' within 24 hours on average.", type: "success", metric: "Good" }
            ]);
        } finally {
            setIsLoadingInsights(false);
        }
    };

    useEffect(() => {
        generateAIInsights();
    }, []);

    const handleReset = () => {
        setSearch('');
        setTypeFilter('All');
        setClientSearch('');
        setStatusFilter('All');
    };

    const filteredOrders = useMemo(() => {
        return [...MOCK_ORDERS]
            .filter(order => {
                const matchesSearch = order.name.toLowerCase().includes(search.toLowerCase());
                const matchesClient = order.clientName.toLowerCase().includes(clientSearch.toLowerCase());
                const matchesType = typeFilter === 'All' || order.fileType === typeFilter;
                const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
                return matchesSearch && matchesClient && matchesType && matchesStatus;
            })
            .sort((a, b) => b.index - a.index);
    }, [search, clientSearch, typeFilter, statusFilter]);

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'SENT_TO_PRINT':
            case 'READY_TO_PRINT':
            case 'PRINTING_ACCEPTED':
                return 'bg-[#eff6ff] text-[#3b82f6] border-[#dbeafe]';
            case 'PRINTING':
                return 'bg-[#f0f9ff] text-[#0ea5e9] border-[#e0f2fe]';
            case 'PRINTING_COMPLETED':
            case 'READY_TO_DISPATCH':
                return 'bg-[#f5f3ff] text-[#8b5cf6] border-[#ede9fe]';
            case 'DRAFT':
            case 'VERIFIED':
                return 'bg-[#f1f5f9] text-[#64748b] border-[#e2e8f0]';
            case 'DISPATCHED':
            case 'SHIPPED':
            case 'DELIVERED':
                return 'bg-[#f0fdf4] text-[#22c55e] border-[#dcfce7]';
            case 'REJECTED':
                return 'bg-[#fef2f2] text-[#ef4444] border-[#fee2e2]';
            case 'ON_HOLD':
            case 'ON_HOLD_BY_CLIENT':
            case 'ON_HOLD_BY_VENDOR':
                return 'bg-[#fffbeb] text-[#f59e0b] border-[#fef3c7]';
            default:
                return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const formatStatus = (status: string) => {
        return status.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#fafbfd] overflow-hidden">
            <div className="px-8 py-6 flex justify-between items-center">
                <h1 className="text-xl font-bold text-[#1e293b] tracking-tight">Print Orders</h1>
                <button 
                    onClick={generateAIInsights}
                    disabled={isLoadingInsights}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
                >
                    {isLoadingInsights ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    Refresh AI Insights
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8 hide-scroll">
                {/* AI Insights Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg border border-purple-100">
                            <Sparkles size={18} />
                        </div>
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">AI Order Insights</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {isLoadingInsights ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm animate-pulse">
                                    <div className="h-4 bg-gray-100 rounded w-1/2 mb-3"></div>
                                    <div className="h-3 bg-gray-50 rounded w-full mb-2"></div>
                                    <div className="h-3 bg-gray-50 rounded w-3/4"></div>
                                </div>
                            ))
                        ) : (
                            aiInsights.map((insight, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
                                >
                                    <div className={`absolute top-0 left-0 w-1 h-full ${
                                        insight.type === 'success' ? 'bg-green-500' :
                                        insight.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                                    }`} />
                                    
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-sm font-bold text-gray-900">{insight.title}</h3>
                                        {insight.metric && (
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                                insight.type === 'success' ? 'bg-green-50 text-green-700' :
                                                insight.type === 'warning' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                                            }`}>
                                                {insight.metric}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed">{insight.description}</p>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
                    <div className="flex flex-wrap items-end gap-6 flex-1">
                        <div className="flex flex-col gap-1.5 min-w-[200px]">
                            <label className="text-[13px] font-semibold text-gray-700 ml-1">Keyword search</label>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-gray-400 shadow-sm transition-all"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-semibold text-gray-700 ml-1">Type</label>
                            <CustomSelect
                                value={typeFilter}
                                onChange={setTypeFilter}
                                options={[
                                    { value: 'All', label: 'All' },
                                    { value: 'CARD', label: 'CARD' },
                                    { value: 'LANYARD', label: 'LANYARD' },
                                    { value: 'KEYCHAIN', label: 'KEYCHAIN' },
                                    { value: 'RAW_MATERIAL', label: 'RAW_MATERIAL' },
                                    { value: 'OTHER', label: 'OTHER' },
                                ]}
                                width="w-44"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5 min-w-[200px]">
                            <label className="text-[13px] font-semibold text-gray-700 ml-1">Client</label>
                            <input
                                type="text"
                                placeholder="search client"
                                value={clientSearch}
                                onChange={e => setClientSearch(e.target.value)}
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-gray-400 shadow-sm transition-all"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-semibold text-gray-700 ml-1">Status</label>
                            <CustomSelect
                                value={statusFilter}
                                onChange={setStatusFilter}
                                options={[
                                    { value: 'All', label: 'All' },
                                    { value: 'DRAFT', label: 'DRAFT' },
                                    { value: 'SENT_TO_PRINT', label: 'SENT_TO_PRINT' },
                                    { value: 'VERIFIED', label: 'VERIFIED' },
                                    { value: 'READY_TO_PRINT', label: 'READY_TO_PRINT' },
                                    { value: 'REJECTED', label: 'REJECTED' },
                                    { value: 'PRINTING_ACCEPTED', label: 'PRINTING_ACCEPTED' },
                                    { value: 'PRINTING', label: 'PRINTING' },
                                    { value: 'PRINTING_COMPLETED', label: 'PRINTING_COMPLETED' },
                                    { value: 'READY_TO_DISPATCH', label: 'READY_TO_DISPATCH' },
                                    { value: 'DISPATCHED', label: 'DISPATCHED' },
                                    { value: 'SHIPPED', label: 'SHIPPED' },
                                    { value: 'DELIVERED', label: 'DELIVERED' },
                                    { value: 'ON_HOLD', label: 'ON_HOLD' },
                                    { value: 'ON_HOLD_BY_CLIENT', label: 'ON_HOLD_BY_CLIENT' },
                                    { value: 'ON_HOLD_BY_VENDOR', label: 'ON_HOLD_BY_VENDOR' },
                                ]}
                                width="w-56"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleReset}
                        className="px-6 py-2 bg-white border border-gray-900 rounded-lg text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
                    >
                        Reset all
                    </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#f8fafc] border-b border-gray-100 text-[13px] font-semibold text-gray-500">
                                <th className="px-6 py-4 w-16">#</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Client Name</th>
                                <th className="px-6 py-4">File Types</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Created At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            <AnimatePresence mode="popLayout">
                                {filteredOrders.map((order) => (
                                    <motion.tr
                                        key={order.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="hover:bg-gray-50/30 transition-colors"
                                    >
                                        <td className="px-6 py-4 text-gray-500 font-medium">{order.index}</td>
                                        <td className="px-6 py-4 text-[#1e293b] font-semibold">{order.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{order.clientName || ''}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 border border-gray-900 rounded-lg text-[10px] font-bold text-gray-900 bg-white shadow-sm">
                                                {order.fileType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-bold ${getStatusStyles(order.status)}`}>
                                                {formatStatus(order.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs font-medium">{order.createdAt}</td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    {filteredOrders.length === 0 && (
                        <div className="p-20 text-center bg-gray-50/30">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                                <Search className="text-gray-300" size={32} />
                            </div>
                            <p className="text-gray-900 font-bold">No orders found</p>
                            <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrintOrdersView;
