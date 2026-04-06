import React, { useState } from 'react';
import { Bell, Truck, CheckCircle2, Package, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
    title: string;
    icon?: React.ReactNode;
    children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, icon, children }) => {
    const [showNotifications, setShowNotifications] = useState(false);

    const notifications = [
        { id: 1, title: 'Order Dispatched', desc: 'Order #8821 for St. Xavier\'s has been dispatched.', time: '5 mins ago', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 2, title: 'Delivery Confirmed', desc: 'Batch #441 has been delivered to TechCorp.', time: '1 hour ago', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
        { id: 3, title: 'New Project Ready', desc: 'Project "Staff IDs" is ready for final print.', time: '3 hours ago', icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <header className="bg-white border-b border-gray-200 px-8 py-3.5 flex items-center justify-between z-30">
            <div className="flex items-center gap-3">
                {icon && <div className="text-gray-600">{icon}</div>}
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h1>
            </div>
            
            <div className="flex items-center gap-4">
                {children}
                
                <div className="relative">
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`p-2 rounded-xl border transition-all relative ${showNotifications ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Bell size={20} />
                        <div className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <>
                                <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={() => setShowNotifications(false)}
                                />
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
                                >
                                    <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                        <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">3 New</span>
                                            <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-50">
                                        {notifications.map((n) => (
                                            <div key={n.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                                                <div className="flex gap-3">
                                                    <div className={`w-9 h-9 rounded-xl ${n.bg} ${n.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                                        <n.icon size={16} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-gray-900">{n.title}</p>
                                                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{n.desc}</p>
                                                        <div className="flex items-center gap-1.5 mt-2 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                                            <Clock size={10} />
                                                            {n.time}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="w-full py-3 text-[10px] font-bold text-blue-600 hover:bg-blue-50 transition-colors border-t border-gray-100 uppercase tracking-widest">
                                        View All Notifications
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-100">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
            </div>
        </header>
    );
};

export default Header;
