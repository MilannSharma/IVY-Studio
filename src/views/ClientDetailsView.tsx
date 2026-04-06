import React, { useState, useEffect } from 'react';
import { 
    ChevronLeft, 
    Plus, 
    Mail, 
    Phone, 
    ExternalLink, 
    X, 
    Wallet, 
    MapPin, 
    Edit3, 
    CheckCircle, 
    Clock, 
    TrendingUp, 
    FileText, 
    Send, 
    Calendar, 
    MessageSquare,
    AlertCircle,
    Building2,
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
    MoreVertical
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    LineChart, 
    Line,
    AreaChart,
    Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

interface ClientDetailsViewProps {
  client: any;
  onBack: () => void;
}

const ClientDetailsView: React.FC<ClientDetailsViewProps> = ({ client, onBack }) => {
    const [activeTab, setActiveTab] = useState('Account Details');

    // Mock data for analytics
    const revenueData = [
        { month: 'Jan', amount: 45000 },
        { month: 'Feb', amount: 52000 },
        { month: 'Mar', amount: 48000 },
        { month: 'Apr', amount: 61000 },
        { month: 'May', amount: 55000 },
        { month: 'Jun', amount: 67000 },
    ];

    const orderStats = [
        { name: 'Completed', value: 45, color: '#10b981' },
        { name: 'Ongoing', value: 12, color: '#3b82f6' },
        { name: 'Pending', value: 5, color: '#f59e0b' },
    ];

    const tabs = ['Account Details', 'Projects', 'Wallet', 'Addresses', 'Whatsapp'];

    return (
        <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden font-sans">
            {/* Top Header Section */}
            <div className="bg-white border-b border-gray-200 p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-2xl border border-gray-200">
                            {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{client.name}</h1>
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <Mail size={14} />
                                <span>{client.email}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Balance Card */}
                        <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-xl p-4 min-w-[200px] relative group">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-[#166534] font-bold text-sm">
                                    <Wallet size={16} />
                                    <span>Balance</span>
                                </div>
                                <button className="w-6 h-6 rounded-full bg-[#22c55e] text-white flex items-center justify-center hover:bg-[#16a34a] transition-colors">
                                    <Plus size={14} />
                                </button>
                            </div>
                            <div className="text-2xl font-bold text-[#166534]">₹ {client.balance?.toLocaleString() || '0.00'}</div>
                        </div>

                        {/* Credit Limit Card */}
                        <div className="bg-[#eff6ff] border border-[#dbeafe] rounded-xl p-4 min-w-[200px] relative group">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-[#1e40af] font-bold text-sm">
                                    <CreditCard size={16} />
                                    <span>Credit Limit</span>
                                </div>
                                <button className="text-blue-600 hover:text-blue-800 transition-colors">
                                    <Edit3 size={16} />
                                </button>
                            </div>
                            <div className="text-2xl font-bold text-[#1e40af]">₹ {client.maxCredit?.toLocaleString() || '0.00'}</div>
                            <div className="mt-2">
                                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full flex items-center gap-1 w-fit">
                                    <div className="w-1 h-1 rounded-full bg-red-600" />
                                    Not Approved
                                </span>
                            </div>
                        </div>

                        <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                            <Edit3 size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-[#f1f5f9] px-6 py-2 flex items-center gap-1 border-b border-gray-200">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
                            activeTab === tab 
                            ? 'bg-white text-gray-900 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scroll">
                <AnimatePresence mode="wait">
                    {activeTab === 'Account Details' && (
                        <motion.div 
                            key="account"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {/* Contact Information */}
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-gray-900 mb-6">Contact Information</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                            <Phone size={18} />
                                        </div>
                                        <span className="font-medium">{client.phone || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                            <Mail size={18} />
                                        </div>
                                        <span className="font-medium">{client.email || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Address Section */}
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-gray-900 mb-6">Address</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-3 text-gray-700">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                                <Building2 size={18} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">City</p>
                                                <p className="font-medium">{client.city || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 text-gray-700">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                                <MapPin size={18} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">State</p>
                                                <p className="font-medium uppercase">{client.state || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-3 text-gray-700">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 invisible">
                                                <Building2 size={18} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">District</p>
                                                <p className="font-medium">{client.district || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 text-gray-700">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 invisible">
                                                <MapPin size={18} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pincode</p>
                                                <p className="font-medium">{client.pincode || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Analytics Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-lg font-bold text-gray-900">Revenue Analytics</h2>
                                        <select className="text-xs font-bold text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 outline-none">
                                            <option>Last 6 Months</option>
                                            <option>Last Year</option>
                                        </select>
                                    </div>
                                    <div className="h-[250px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={revenueData}>
                                                <defs>
                                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} tickFormatter={(value) => `₹${value/1000}k`} />
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                    formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                                />
                                                <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <h2 className="text-lg font-bold text-gray-900 mb-6">Project Status</h2>
                                    <div className="space-y-6">
                                        {orderStats.map(stat => (
                                            <div key={stat.name} className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-500 font-medium">{stat.name}</span>
                                                    <span className="font-bold text-gray-900">{stat.value}</span>
                                                </div>
                                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(stat.value / 62) * 100}%` }}
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                        className="h-full rounded-full"
                                                        style={{ backgroundColor: stat.color }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <div className="pt-4 border-t border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500 font-medium">Total Projects</span>
                                                <span className="text-lg font-bold text-blue-600">62</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Vendor Options */}
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-gray-900 mb-6">Vendor Quick Actions</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Generate Invoice', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
                                        { label: 'Send Reminder', icon: Send, color: 'text-orange-600', bg: 'bg-orange-50' },
                                        { label: 'Add Payment', icon: ArrowUpRight, color: 'text-green-600', bg: 'bg-green-50' },
                                        { label: 'Adjust Credit', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
                                        { label: 'Add Note', icon: MessageSquare, color: 'text-gray-600', bg: 'bg-gray-50' },
                                        { label: 'Schedule Follow-up', icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                        { label: 'View Ledger', icon: Building2, color: 'text-cyan-600', bg: 'bg-cyan-50' },
                                        { label: 'Report Issue', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
                                    ].map(action => (
                                        <button 
                                            key={action.label}
                                            className={`flex flex-col items-center justify-center p-4 rounded-xl border border-transparent hover:border-gray-200 transition-all gap-3 ${action.bg} group`}
                                        >
                                            <div className={`p-3 rounded-lg bg-white shadow-sm group-hover:scale-110 transition-transform ${action.color}`}>
                                                <action.icon size={20} />
                                            </div>
                                            <span className="text-xs font-bold text-gray-700">{action.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'Projects' && (
                        <motion.div 
                            key="projects"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">Project History</h2>
                                <button className="px-4 py-2 bg-[#0e30f1] text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all">
                                    <Plus size={16} /> New Project
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Ongoing Projects */}
                                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                    <div className="p-4 border-b border-gray-100 bg-blue-50/30 flex items-center gap-2">
                                        <Clock size={16} className="text-blue-600" />
                                        <h3 className="font-bold text-blue-900 text-sm">Ongoing Projects</h3>
                                    </div>
                                    <div className="divide-y divide-gray-50">
                                        {[
                                            { name: '2026 Session ID Cards', progress: 65, deadline: '15 Apr 2026' },
                                            { name: 'Staff ID Refresh', progress: 30, deadline: '22 Apr 2026' },
                                            { name: 'Transport Badges', progress: 10, deadline: '05 May 2026' }
                                        ].map(proj => (
                                            <div key={proj.name} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{proj.name}</h4>
                                                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-wider">{proj.deadline}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${proj.progress}%` }} />
                                                    </div>
                                                    <span className="text-xs font-bold text-blue-600">{proj.progress}%</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Completed Projects */}
                                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                    <div className="p-4 border-b border-gray-100 bg-green-50/30 flex items-center gap-2">
                                        <CheckCircle size={16} className="text-green-600" />
                                        <h3 className="font-bold text-green-900 text-sm">Completed Projects</h3>
                                    </div>
                                    <div className="divide-y divide-gray-50">
                                        {[
                                            { name: '2025 Annual Function', date: 'Dec 2025', records: 450 },
                                            { name: 'Sports Day Badges', date: 'Nov 2025', records: 120 },
                                            { name: 'Graduation Certificates', date: 'Oct 2025', records: 85 }
                                        ].map(proj => (
                                            <div key={proj.name} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{proj.name}</h4>
                                                    <p className="text-xs text-gray-500 font-medium">{proj.records} Records • {proj.date}</p>
                                                </div>
                                                <button className="text-blue-600 hover:text-blue-800">
                                                    <ExternalLink size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'Wallet' && (
                        <motion.div 
                            key="wallet"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-200">
                                    <div className="flex items-center justify-between mb-8">
                                        <Wallet size={24} />
                                        <span className="text-xs font-bold uppercase tracking-widest opacity-80">Current Balance</span>
                                    </div>
                                    <div className="text-3xl font-bold mb-2">₹ {client.balance?.toLocaleString() || '0.00'}</div>
                                    <p className="text-sm opacity-80">Last updated today</p>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-8">
                                        <ArrowUpRight size={24} className="text-green-600" />
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Paid</span>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 mb-2">₹ 4,52,000</div>
                                    <p className="text-sm text-green-600 font-bold">+12% from last month</p>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-8">
                                        <ArrowDownRight size={24} className="text-red-600" />
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Due</span>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 mb-2">₹ 12,500</div>
                                    <p className="text-sm text-red-600 font-bold">2 invoices overdue</p>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900">Recent Transactions</h3>
                                    <button className="text-blue-600 text-xs font-bold hover:underline">View All</button>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {[
                                        { id: 'TRX-901', type: 'Payment', amount: 15000, date: '02 Apr 2026', status: 'Success' },
                                        { id: 'INV-442', type: 'Invoice', amount: 8500, date: '28 Mar 2026', status: 'Pending' },
                                        { id: 'TRX-882', type: 'Payment', amount: 22000, date: '20 Mar 2026', status: 'Success' }
                                    ].map(trx => (
                                        <div key={trx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${trx.type === 'Payment' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {trx.type === 'Payment' ? <ArrowUpRight size={20} /> : <FileText size={20} />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{trx.type} - {trx.id}</div>
                                                    <div className="text-xs text-gray-500 font-medium">{trx.date}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`font-bold ${trx.type === 'Payment' ? 'text-green-600' : 'text-gray-900'}`}>
                                                    {trx.type === 'Payment' ? '+' : '-'} ₹{trx.amount.toLocaleString()}
                                                </div>
                                                <span className={`text-[10px] font-bold uppercase ${trx.status === 'Success' ? 'text-green-600' : 'text-orange-600'}`}>{trx.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'Addresses' && (
                        <motion.div 
                            key="addresses"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-600 text-[10px] font-bold rounded uppercase tracking-wider">Primary</span>
                                </div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Building2 size={20} />
                                    </div>
                                    <h3 className="font-bold text-gray-900">Registered Office</h3>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                                    {client.address || '123 Education Lane, Sector 4, New Delhi, India 110001'}
                                </p>
                                <div className="flex items-center gap-4">
                                    <button className="text-xs font-bold text-blue-600 hover:underline">Edit Address</button>
                                    <button className="text-xs font-bold text-gray-400 hover:text-gray-600">View on Map</button>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm border-dashed flex flex-col items-center justify-center gap-4 py-12">
                                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                                    <Plus size={24} />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-gray-900">Add New Address</h3>
                                    <p className="text-xs text-gray-500 mt-1">Add shipping or billing addresses</p>
                                </div>
                                <button className="mt-2 px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">Add Now</button>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'Whatsapp' && (
                        <motion.div 
                            key="whatsapp"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center justify-center py-20"
                        >
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 text-green-600">
                                <MessageSquare size={48} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">WhatsApp Integration</h2>
                            <p className="text-gray-500 text-center max-w-md mb-8 font-medium">
                                Send direct messages, invoices, or project updates to {client.name} via WhatsApp.
                            </p>
                            <div className="flex flex-col gap-3 w-full max-w-sm">
                                <button className="w-full py-3 bg-[#25D366] text-white rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-green-100 hover:bg-[#128C7E] transition-all">
                                    <MessageSquare size={20} />
                                    Send Direct Message
                                </button>
                                <button className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all">
                                    <FileText size={20} className="text-gray-400" />
                                    Send Last Invoice
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ClientDetailsView;
