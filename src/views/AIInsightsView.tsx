import React from 'react';
import { Sparkles, TrendingUp, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

const AIInsightsView: React.FC = () => {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="flex-1 overflow-y-auto bg-[#fafbfd] hide-scroll p-8"
        >
            <motion.div variants={item} className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <div className="p-2 border border-purple-200 bg-purple-50 text-purple-600 rounded-lg"><Sparkles size={20} /></div>
                        AI Processing Insights
                    </h1>
                    <p className="text-sm text-gray-500 mt-2">Monitor automated quality checks, facial recognition, and data validation.</p>
                </div>
                <div className="flex gap-3">
                    <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 bg-white outline-none focus:ring-2 focus:ring-purple-500 transition-all">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>All Time</option>
                    </select>
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 bg-[#0e30f1] text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
                    >
                        Review Flagged Items (42)
                    </motion.button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total Analysed', value: '128.5K', sub: 'Photos & Records', color: 'border-t-purple-500', icon: TrendingUp, iconColor: 'text-purple-500' },
                    { label: 'Auto-Approved', value: '96.2%', sub: '123,617 items', color: 'border-t-green-500', icon: CheckCircle2, iconColor: 'text-green-500' },
                    { label: 'Flagged / Rejected', value: '3.8%', sub: '4,883 items', color: 'border-t-red-500', icon: AlertCircle, iconColor: 'text-red-500' },
                    { label: 'Avg Processing Time', value: '0.8s', sub: 'Per Record', color: 'border-t-blue-500', icon: Clock, iconColor: 'text-blue-500' },
                ].map((stat, i) => (
                    <motion.div 
                        key={i} 
                        variants={item}
                        whileHover={{ y: -5 }}
                        className={`bg-white border border-gray-200 p-6 rounded-2xl shadow-sm border-t-4 ${stat.color} text-center flex flex-col items-center justify-center h-full relative overflow-hidden group`}
                    >
                        <div className={`absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity ${stat.iconColor}`}>
                            <stat.icon size={40} />
                        </div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{stat.label}</h3>
                        <div className={`text-4xl font-black ${stat.iconColor} mb-1`}>{stat.value}</div>
                        <div className="text-xs font-semibold text-gray-500 mt-2">{stat.sub}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <motion.div variants={item} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 mb-6 flex justify-between items-center">
                        Top Rejection Reasons
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">This Week</span>
                    </h3>
                    <div className="space-y-6">
                        {[
                            { reason: "Face Not Detected / Blurry", count: 2145, pct: 44, color: "bg-red-500" },
                            { reason: "Incorrect Uniform Color", count: 1205, pct: 25, color: "bg-orange-500" },
                            { reason: "Multiple Faces Detected", count: 850, pct: 17, color: "bg-yellow-500" },
                            { reason: "Name / Format Mismatch", count: 683, pct: 14, color: "bg-purple-500" }
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-semibold text-gray-700">{item.reason}</span>
                                    <span className="text-sm font-bold text-gray-900">{item.count}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.pct}%` }}
                                        transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                        className={`${item.color} h-2 rounded-full`}
                                    ></motion.div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div variants={item} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[400px]">
                    <div className="px-6 py-4 border-b border-gray-100 bg-[#f8fafc] flex justify-between items-center sticky top-0 z-10">
                        <h3 className="font-bold text-gray-900">Recent AI Actions & Log</h3>
                        <button className="text-sm text-blue-600 font-semibold hover:underline">View All</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scroll">
                        {[
                            { time: "Just now", action: "Flagged", details: "Project: St Xavier's - Student 'Aarav Kumar' (ID: 1024), Reason: Photo background is not white.", status: "rejected" },
                            { time: "2 mins ago", action: "Approved", details: "Processed 124 records for 'TechCorp IDs' via bulk upload. 100% match.", status: "approved" },
                            { time: "15 mins ago", action: "Flagged", details: "Project: DPS - Staff 'Priya Singh' (ID: T-10), Reason: Face cropped too closely.", status: "rejected" },
                            { time: "1 hr ago", action: "Correction", details: "Auto-corrected capitalization for 45 student names in Batch 'A'.", status: "correction" },
                            { time: "2 hrs ago", action: "Approved", details: "Processed 58 records for 'St Xavier's'. Quality check passed.", status: "approved" },
                        ].map((log, i) => (
                            <motion.div 
                                key={i} 
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 + (i * 0.05) }}
                                className="flex gap-4 p-3.5 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition group"
                            >
                                <div className="flex-shrink-0 mt-1">
                                    <div className={`w-2.5 h-2.5 rounded-full ${log.status === 'rejected' ? 'bg-red-500' :
                                        log.status === 'approved' ? 'bg-green-500' :
                                            'bg-yellow-500'
                                        } group-hover:scale-125 transition-transform`}></div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${log.status === 'rejected' ? 'bg-red-50 text-red-700' :
                                            log.status === 'approved' ? 'bg-green-50 text-green-700' :
                                                'bg-yellow-50 text-yellow-700'
                                            }`}>{log.action}</span>
                                        <span className="text-[11px] text-gray-400 font-medium">{log.time}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed pr-2">{log.details}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AIInsightsView;
