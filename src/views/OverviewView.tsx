import React, { useState, useEffect } from 'react';
import { Activity, ArrowUpRight, Users, Briefcase, FileCheck, AlertCircle, Loader2, UserPlus, PlusCircle } from 'lucide-react';
import { motion } from 'motion/react';
import Header from '../components/Header';
import { db, collection, onSnapshot, query, orderBy, limit, handleFirestoreError, OperationType } from '../firebase';
import { Project } from '../types';
import { useUser } from '../App';

interface OverviewViewProps {
  setActiveTab: (tab: string) => void;
}

const OverviewView: React.FC<OverviewViewProps> = ({ setActiveTab }) => {
    const [stats, setStats] = useState({
        totalProcessing: 0,
        activeProjects: 0,
        aiRejected: 0,
        readyToPrint: 0,
        clientsCount: 0
    });
    const [recentProjects, setRecentProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const { user } = useUser();

    const recentActivities = [
        { id: 1, title: 'New Client Created', desc: 'You just created a New Client: "St. Xavier\'s School"', time: '10 mins ago', icon: UserPlus, color: 'text-orange-600', bg: 'bg-orange-50' },
        { id: 2, title: 'Project Created', desc: 'You just created project for "St. Xavier\'s"', time: '15 mins ago', icon: PlusCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 3, title: 'Batch Exported', desc: '1,200 PDFs generated for TechCorp.', time: '2 hours ago', icon: FileCheck, color: 'text-green-600', bg: 'bg-green-50' },
    ];

    useEffect(() => {
        const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'), limit(5));
        
        const unsubscribe = onSnapshot(collection(db, 'projects'), (snapshot) => {
            const projects = snapshot.docs.map(doc => doc.data() as Project);
            
            const active = projects.filter(p => p.status === 'in-progress').length;
            const completed = projects.filter(p => p.status === 'completed').length;
            const pending = projects.filter(p => p.status === 'pending').length;
            
            // Mocking some stats based on projects for demo purposes
            setStats({
                totalProcessing: projects.reduce((acc, p) => acc + (p.entries || 0), 0),
                activeProjects: active,
                aiRejected: Math.floor(projects.length * 1.5), // Mocked
                readyToPrint: projects.filter(p => p.status === 'completed').reduce((acc, p) => acc + (p.entries || 0), 0),
                clientsCount: new Set(projects.map(p => p.clientId)).size
            });

            setRecentProjects(snapshot.docs.slice(0, 3).map(doc => ({ id: doc.id, ...doc.data() } as Project)));
            setLoading(false);
        }, (error) => {
            handleFirestoreError(error, OperationType.LIST, 'projects', user?.uid, user?.email);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

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

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#fafbfd]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={48} className="text-blue-600 animate-spin" />
                    <p className="text-gray-500 font-bold text-xl">Initializing Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-[#fafbfd] overflow-hidden">
            <Header title="Overview" icon={<Activity size={20} />} setActiveTab={setActiveTab}>
                <div className="hidden md:flex text-sm text-gray-500 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm font-medium items-center gap-2">
                    <Activity size={16} /> System Status: <span className="text-green-600 font-bold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> All Systems Operational</span>
                </div>
            </Header>

            <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="flex-1 overflow-y-auto hide-scroll p-8"
            >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total Processing', value: stats.totalProcessing.toLocaleString(), trend: '+12% this week', trendColor: 'text-green-600', trendBg: 'bg-green-50', icon: Briefcase, iconColor: 'text-blue-600' },
                    { label: 'Active Projects', value: stats.activeProjects.toString(), sub: `Across ${stats.clientsCount} Clients`, icon: Users, iconColor: 'text-purple-600' },
                    { label: 'AI Rejected', value: stats.aiRejected.toString(), trend: '1.8% Error Rate', trendColor: 'text-red-600', trendBg: 'bg-red-50', icon: AlertCircle, iconColor: 'text-red-600' },
                    { label: 'Ready to Print', value: stats.readyToPrint.toLocaleString(), isDark: true, icon: FileCheck, iconColor: 'text-[#0e30f1]' },
                ].map((stat, i) => (
                    <motion.div 
                        key={i} 
                        variants={item}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className={`${stat.isDark ? 'bg-[#1e2330] border-b-4 border-[#0e30f1]' : 'bg-white border border-gray-200'} p-6 rounded-2xl shadow-sm relative overflow-hidden group`}
                    >
                        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${stat.isDark ? 'text-white' : stat.iconColor}`}>
                            <stat.icon size={48} />
                        </div>
                        <h3 className={`text-xs font-bold ${stat.isDark ? 'text-gray-400' : 'text-gray-400'} uppercase tracking-widest mb-2`}>{stat.label}</h3>
                        <div className={`text-4xl font-black ${stat.isDark ? 'text-white' : 'text-gray-900'} mb-1`}>{stat.value}</div>
                        {stat.trend && (
                            <div className={`text-xs font-semibold ${stat.trendColor} ${stat.trendBg} inline-block px-2 py-0.5 rounded-md mt-2`}>{stat.trend}</div>
                        )}
                        {stat.sub && (
                            <div className="text-xs font-semibold text-gray-500 mt-2">{stat.sub}</div>
                        )}
                        {stat.isDark && (
                            <button className="text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-md mt-2 transition w-full">Export Batches</button>
                        )}
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div variants={item} className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-[#f8fafc] flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">Recent Active Projects</h3>
                            <button className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1" onClick={() => setActiveTab('projects')}>
                                View All <ArrowUpRight size={14} />
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                        <th className="px-6 py-4">Project</th>
                                        <th className="px-6 py-4">Client</th>
                                        <th className="px-6 py-4">Progress</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {recentProjects.map((item, i) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-4 font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.name}</td>
                                            <td className="px-6 py-4 text-gray-600 font-medium">{item.client || 'Unknown'}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-full bg-gray-200 rounded-full h-2 max-w-[120px] overflow-hidden">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${item.status === 'completed' ? 100 : item.status === 'in-progress' ? 50 : 10}%` }}
                                                            transition={{ duration: 1, delay: 0.5 }}
                                                            className={`${item.status === 'completed' ? 'bg-green-600' : 'bg-blue-600'} h-2 rounded-full`}
                                                        ></motion.div>
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-700">{item.status === 'completed' ? 100 : item.status === 'in-progress' ? 50 : 10}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {recentProjects.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-8 text-center text-gray-500">No active projects</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={item}>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-bold text-gray-900">Recent Activity</h3>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Latest Updates</span>
                        </div>
                        <div className="space-y-4">
                            {recentActivities.map((act, i) => (
                                <motion.div 
                                    key={act.id} 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + (i * 0.1) }}
                                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                                    className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group"
                                >
                                    <div className="flex gap-4">
                                        <div className={`w-12 h-12 rounded-2xl ${act.bg} ${act.color} flex items-center justify-center shrink-0 group-hover:rotate-6 transition-transform`}>
                                            <act.icon size={24} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="text-sm font-bold text-gray-900 truncate">{act.title}</p>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter whitespace-nowrap ml-2">{act.time}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{act.desc}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <button className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors mt-2">
                            View Full Activity Log
                        </button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    </div>
    );
};

export default OverviewView;
