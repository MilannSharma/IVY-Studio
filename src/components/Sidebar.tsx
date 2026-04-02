import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Layout as FileLayout, 
  Sparkles, 
  Building2 as Building, 
  Users, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  MessageSquare,
  FileText,
  StickyNote,
  CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, logOut } from '../firebase';
import { useToast } from './Toast';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const { addToast } = useToast();
    const user = auth.currentUser;

    const handleLogout = async () => {
        try {
            await logOut();
            addToast('Logged out successfully', 'success');
        } catch (error) {
            addToast('Logout failed', 'error');
        }
    };

    const handleMouseEnter = () => {
        setIsCollapsed(false);
    };

    const handleMouseLeave = () => {
        setIsCollapsed(true);
    };

    const menuGroups = [
        {
            title: 'Workspace',
            items: [
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'projects', label: 'Projects', icon: Briefcase },
                { id: 'templates', label: 'Templates', icon: FileLayout },
            ]
        },
        {
            title: 'Tools',
            items: [
                { id: 'assistant', label: 'IVY copilot', icon: MessageSquare },
                { id: 'documents', label: 'Documents', icon: FileText },
                { id: 'notes', label: 'Notes', icon: StickyNote },
                { id: 'tasks', label: 'Daily Tasks', icon: CheckSquare },
            ]
        },
        {
            title: 'Clients',
            items: [
                { id: 'clients', label: 'Clients', icon: Building },
                { id: 'ai-insights', label: 'AI Quality', icon: Sparkles },
            ]
        },
        {
            title: 'Admin',
            items: [
                { id: 'team', label: 'Team', icon: Users },
                { id: 'settings', label: 'Configuration', icon: Settings },
            ]
        }
    ];

    return (
        <motion.div 
            initial={false}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            animate={{ 
                width: isCollapsed ? 72 : 260,
                transition: { 
                    type: 'spring', 
                    stiffness: 250, 
                    damping: 28,
                    mass: 0.8
                }
            }}
            className="bg-[#1e2330] text-gray-300 flex flex-col h-full border-r border-[#2a2f3f] shrink-0 relative z-50 overflow-hidden"
        >
            {/* Logo Section */}
            <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-[#2a2f3f]/50 h-[72px]`}>
                <AnimatePresence mode="wait">
                    {!isCollapsed ? (
                        <motion.div 
                            key="full-logo"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex items-center gap-2"
                        >
                            <div className="relative px-3 py-1 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-lg flex items-center font-black text-xl tracking-tighter" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.3)' }}>
                                <span className="text-white">I</span>
                                <span className="text-orange-500">V</span>
                                <span className="text-purple-800">Y</span>
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-xl pointer-events-none" />
                            </div>
                            <span className="text-white font-bold text-lg tracking-normal opacity-80">Studio</span>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="mini-logo"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative px-2 py-1 backdrop-blur-md bg-white/10 border border-white/20 rounded-lg shadow-lg flex items-center font-black text-sm tracking-tighter"
                            style={{ textShadow: '0.5px 0.5px 0px rgba(0,0,0,0.3)' }}
                        >
                            <span className="text-white">I</span>
                            <span className="text-orange-500">V</span>
                            <span className="text-purple-800">Y</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                {!isCollapsed && (
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <Menu size={18} />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto hide-scroll px-2 py-3 space-y-4">
                {menuGroups.map((group) => (
                    <div key={group.title}>
                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-3 overflow-hidden"
                                >
                                    {group.title}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <ul className="space-y-0.5">
                            {group.items.map(item => {
                                const isActive = activeTab === item.id;
                                return (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => setActiveTab(item.id)}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all relative group ${isActive
                                                ? 'bg-[#0e30f1]/10 text-white'
                                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            {isActive && (
                                                <motion.div 
                                                    layoutId="sidebar-active"
                                                    className="absolute left-0 w-1 h-5 bg-[#0e30f1] rounded-r-full"
                                                />
                                            )}
                                            <div className={`${isActive ? "text-[#0e30f1]" : "text-gray-400 group-hover:text-white"} transition-colors shrink-0`}>
                                                <item.icon size={18} />
                                            </div>
                                            <AnimatePresence mode="wait">
                                                {!isCollapsed && (
                                                    <motion.span 
                                                        initial={{ opacity: 0, x: -5 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -5 }}
                                                        className="whitespace-nowrap overflow-hidden"
                                                    >
                                                        {item.label}
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                            {isCollapsed && (
                                                <div className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-gray-700">
                                                    {item.label}
                                                </div>
                                            )}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>

            {/* User Profile & Collapse Toggle */}
            <div className="p-3 border-t border-[#2a2f3f] bg-[#1a1e29]/50 backdrop-blur-sm">
                <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-[#2a2f3f]" referrerPolicy="no-referrer" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 border border-[#2a2f3f]">
                            {user?.displayName?.charAt(0) || 'U'}
                        </div>
                    )}
                    {!isCollapsed && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex-1 min-w-0"
                        >
                            <p className="text-xs font-bold text-white truncate">{user?.displayName || 'User'}</p>
                            <p className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider">Vendor Admin</p>
                        </motion.div>
                    )}
                    {!isCollapsed && (
                        <button 
                            onClick={handleLogout}
                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                            <LogOut size={14} />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Sidebar;
