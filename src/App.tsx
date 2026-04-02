import React, { useState, useEffect, createContext, useContext } from 'react';
import Sidebar from './components/Sidebar';
import OverviewView from './views/OverviewView';
import ProjectsView from './views/ProjectsView';
import TemplatesView from './views/TemplatesView';
import AIInsightsView from './views/AIInsightsView';
import ConfigurationView from './views/ConfigurationView';
import ClientsView from './views/ClientsView';
import TeamView from './views/TeamView';
import ProjectDetailsView from './views/ProjectDetailsView';
import ClientDetailsView from './views/ClientDetailsView';
import AssistantView from './views/AssistantView';
import DocumentsView from './views/DocumentsView';
import NotesView from './views/NotesView';
import TasksView from './views/TasksView';
import CommandPalette from './components/CommandPalette';
import FloatingAssistant from './components/FloatingAssistant';
import { Project, User } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { db } from './firebase';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { LogIn, Sparkles, Mail, Lock, Loader2 } from 'lucide-react';

// User Context for global access
interface UserContextType {
    user: User | null;
    login: (email: string, otp: string) => Promise<void>;
    logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within a UserProvider');
    return context;
};

export default function App() {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [selectedClient, setSelectedClient] = useState<any | null>(null);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginOtp, setLoginOtp] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [loginError, setLoginError] = useState('');

    useEffect(() => {
        // Load user from local storage on mount
        const savedUser = localStorage.getItem('ivy_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setIsAuthReady(true);
    }, []);

    const handleLogin = async (email: string, otp: string) => {
        if (otp !== '1234') {
            setLoginError('Invalid OTP. Use 1234 for testing.');
            return;
        }

        setIsLoggingIn(true);
        setLoginError('');

        try {
            // Demo Login: Purely local, no Firestore check to avoid permission errors
            const uid = btoa(email).replace(/=/g, '');
            const adminEmails = ['milansharma942105@gmail.com', 'milansharma73783@gmail.com'];
            const role = adminEmails.includes(email) ? 'admin' : 'client';
            
            const userData: User = {
                uid: uid,
                email: email,
                displayName: email.split('@')[0],
                photoURL: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=random`,
                role: role
            };

            setUser(userData);
            localStorage.setItem('ivy_user', JSON.stringify(userData));
            
            // Optional: Try to sync to Firestore in background, but don't block login
            setDoc(doc(db, 'users', uid), {
                uid: userData.uid,
                email: userData.email,
                name: userData.displayName,
                role: userData.role,
                photoUrl: userData.photoURL,
                lastLogin: new Date().toISOString()
            }).catch(err => console.warn("Background sync failed (likely permission rules):", err));

        } catch (error) {
            console.error("Login Error:", error);
            setLoginError('Failed to login. Please try again.');
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('ivy_user');
    };

    useEffect(() => {
        (window as any).openCommandPalette = () => setIsCommandPaletteOpen(true);
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const renderContent = () => {
        // Detail views take precedence
        if (selectedProject) {
            return (
                <motion.div
                    key="project-details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex flex-col overflow-hidden"
                >
                    <ProjectDetailsView project={selectedProject} onBack={() => setSelectedProject(null)} />
                </motion.div>
            );
        }

        if (selectedClient) {
            return (
                <motion.div
                    key="client-details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex flex-col overflow-hidden"
                >
                    <ClientDetailsView client={selectedClient} onBack={() => setSelectedClient(null)} />
                </motion.div>
            );
        }

        const views: Record<string, React.ReactNode> = {
            overview: <OverviewView setActiveTab={setActiveTab} />,
            projects: <ProjectsView onSelectProject={setSelectedProject} />,
            templates: <TemplatesView />,
            'ai-insights': <AIInsightsView />,
            clients: <ClientsView onSelectClient={setSelectedClient} />,
            team: <TeamView />,
            settings: <ConfigurationView />,
            assistant: <AssistantView />,
            documents: <DocumentsView />,
            notes: <NotesView />,
            tasks: <TasksView />,
        };

        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex flex-col overflow-hidden"
                >
                    {views[activeTab] || <OverviewView setActiveTab={setActiveTab} />}
                </motion.div>
            </AnimatePresence>
        );
    };

    if (!isAuthReady) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#0a0c10]">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative px-8 py-4 backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center font-black text-7xl tracking-tighter"
                    style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.3)' }}
                >
                    <span className="text-white">I</span>
                    <span className="text-orange-500">V</span>
                    <span className="text-purple-800">Y</span>
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-3xl pointer-events-none" />
                </motion.div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#0a0c10] p-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] p-10"
                >
                    <div className="flex items-center justify-center mb-10">
                        <div className="relative px-8 py-4 backdrop-blur-2xl bg-white/5 border border-white/10 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center font-black text-6xl tracking-tighter" style={{ textShadow: '3px 3px 0px rgba(0,0,0,0.3)' }}>
                            <span className="text-white">I</span>
                            <span className="text-orange-500">V</span>
                            <span className="text-purple-800">Y</span>
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-[1.5rem] pointer-events-none" />
                        </div>
                    </div>
                    
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Welcome Back</h1>
                        <p className="text-white/50 text-sm font-medium">Enter your credentials to access IVY Studio</p>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                            <input 
                                type="email" 
                                placeholder="Email Address"
                                value={loginEmail}
                                onChange={e => setLoginEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                            <input 
                                type="password" 
                                placeholder="OTP (1234)"
                                value={loginOtp}
                                onChange={e => setLoginOtp(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                            />
                        </div>
                        
                        {loginError && (
                            <p className="text-red-400 text-xs font-bold text-center">{loginError}</p>
                        )}

                        <button 
                            onClick={() => handleLogin(loginEmail, loginOtp)}
                            disabled={isLoggingIn || !loginEmail || !loginOtp}
                            className="w-full py-4 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-100 shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {isLoggingIn ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </div>

                    <div className="mt-10 flex items-center justify-center gap-2 text-gray-500">
                        <Sparkles size={14} className="text-blue-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Secure Access Terminal</span>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <UserContext.Provider value={{ user, login: handleLogin, logout: handleLogout }}>
            <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
                <Sidebar activeTab={activeTab} setActiveTab={(tab) => {
                    setActiveTab(tab);
                    setSelectedProject(null);
                    setSelectedClient(null);
                }} />
                <main className="flex-1 flex flex-col overflow-hidden relative">
                    {renderContent()}
                    <FloatingAssistant />
                    <CommandPalette 
                        isOpen={isCommandPaletteOpen} 
                        onClose={() => setIsCommandPaletteOpen(false)} 
                        onSelect={(tab) => {
                            setActiveTab(tab);
                            setSelectedProject(null);
                            setSelectedClient(null);
                        }}
                    />
                </main>
            </div>
        </UserContext.Provider>
    );
}

