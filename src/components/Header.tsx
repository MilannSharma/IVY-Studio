import React, { useState } from 'react';
import { Bell, Truck, CheckCircle2, Package, Clock, X, User as UserIcon, Shield, LogOut, ChevronDown, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '../App';

interface HeaderProps {
    title: string;
    icon?: React.ReactNode;
    children?: React.ReactNode;
    setActiveTab?: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ title, icon, children, setActiveTab }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const { user, setUser } = useUser();

    const notifications = [
        { id: 1, title: 'Order Dispatched', desc: 'Order #8821 for St. Xavier\'s has been dispatched.', time: '5 mins ago', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 2, title: 'Delivery Confirmed', desc: 'Batch #441 has been delivered to TechCorp.', time: '1 hour ago', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
        { id: 3, title: 'New Project Ready', desc: 'Project "Staff IDs" is ready for final print.', time: '3 hours ago', icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    const handleSwitchProfile = () => {
        if (!user) return;
        const newRole = user.role === 'vendor' ? 'self' : 'vendor';
        setUser({ ...user, role: newRole });
        setShowProfileMenu(false);
    };

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

                <div className="relative">
                    <button 
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className={`flex items-center gap-2.5 pl-2 border-l border-gray-100 transition-all hover:opacity-80 ${showProfileMenu ? 'opacity-70' : ''}`}
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-gray-900 leading-none mb-1">{user?.displayName}</p>
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                                user?.role === 'vendor' 
                                ? 'text-orange-600 bg-orange-50 border-orange-100' 
                                : 'text-blue-600 bg-blue-50 border-blue-100'
                            }`}>
                                {user?.role || 'User'}
                            </span>
                        </div>
                        <div className="w-9 h-9 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-100 shadow-sm relative">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                                <UserIcon size={18} className="text-gray-400" />
                            )}
                        </div>
                        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {showProfileMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
                                >
                                    <div className="p-2 space-y-1">
                                        <button 
                                            onClick={() => {
                                                if (setActiveTab) setActiveTab('profile');
                                                setShowProfileMenu(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-xl transition-all group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                <UserIcon size={16} />
                                            </div>
                                            <span className="font-bold">My Profile</span>
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if (setActiveTab) setActiveTab('security');
                                                setShowProfileMenu(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-xl transition-all group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                <Shield size={16} />
                                            </div>
                                            <span className="font-bold">Security</span>
                                        </button>
                                        
                                        <div className="h-px bg-gray-100 mx-2 my-1" />
                                        
                                        <div className="px-3 py-2">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Switch Profile</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button 
                                                    onClick={() => {
                                                        if (user?.role !== 'vendor') handleSwitchProfile();
                                                    }}
                                                    className={`px-3 py-2 text-[10px] font-black uppercase rounded-lg border transition-all ${
                                                        user?.role === 'vendor' 
                                                        ? 'bg-orange-500 text-white border-orange-600 shadow-md' 
                                                        : 'bg-white text-gray-400 border-gray-200 hover:border-orange-200 hover:text-orange-500'
                                                    }`}
                                                >
                                                    Vendor
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        if (user?.role !== 'self') handleSwitchProfile();
                                                    }}
                                                    className={`px-3 py-2 text-[10px] font-black uppercase rounded-lg border transition-all ${
                                                        user?.role === 'self' 
                                                        ? 'bg-blue-600 text-white border-blue-700 shadow-md' 
                                                        : 'bg-white text-gray-400 border-gray-200 hover:border-blue-200 hover:text-blue-500'
                                                    }`}
                                                >
                                                    Self
                                                </button>
                                            </div>
                                        </div>

                                        <div className="h-px bg-gray-100 mx-2 my-1" />

                                        <button 
                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                                                <LogOut size={16} />
                                            </div>
                                            <span className="font-bold">Sign Out</span>
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

export default Header;
