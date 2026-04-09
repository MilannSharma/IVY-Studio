import React, { useState, useEffect, createContext, useContext } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
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
import PrintOrdersView from './views/PrintOrdersView';
import TransactionsView from './views/TransactionsView';
import CommandPalette from './components/CommandPalette';
import FloatingAssistant from './components/FloatingAssistant';
import { Project, User } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { db, Timestamp, setDoc, doc, collection } from './firebase';
import { Sparkles, User as UserIcon, Shield } from 'lucide-react';

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            let errorMessage = "Something went wrong.";
            try {
                const parsedError = JSON.parse(this.state.error.message);
                if (parsedError.error) errorMessage = `Firestore Error: ${parsedError.error}`;
            } catch (e) {
                errorMessage = this.state.error.message || errorMessage;
            }

            return (
                <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                        <Sparkles size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Error</h1>
                    <p className="text-gray-500 max-w-md mb-8">{errorMessage}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-[#0e30f1] text-white rounded-xl font-bold"
                    >
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

// User Context for global access
interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within a UserProvider');
    return context;
};

const ComingSoonView = ({ title }: { title: string }) => (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#fafbfd] p-8 text-center">
        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 text-blue-600">
            <Sparkles size={40} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">{title}</h2>
        <p className="text-gray-500 max-w-md font-medium">This module is currently under development and will be available in the next update. Stay tuned!</p>
        <button className="mt-8 px-6 py-2.5 bg-[#0e30f1] text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">
            Get Notified
        </button>
    </div>
);

export default function App() {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [selectedClient, setSelectedClient] = useState<any | null>(null);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [user, setUser] = useState<User | null>({
        uid: 'demo-user',
        email: 'demo@ivy.studio',
        displayName: 'Demo User',
        photoURL: 'https://ui-avatars.com/api/?name=Demo+User&background=0e30f1&color=fff',
        role: 'vendor'
    });

    const handleCreateClient = async (clientData: any) => {
        try {
            const clientRef = doc(collection(db, 'clients'));
            await setDoc(clientRef, {
                ...clientData,
                id: clientRef.id,
                createdAt: Timestamp.now(),
                status: 'Active'
            });
            return clientRef.id;
        } catch (error) {
            console.error("Error creating client:", error);
            throw error;
        }
    };

    const handleCreateProject = async (projectData: any) => {
        try {
            const projectRef = doc(collection(db, 'projects'));
            await setDoc(projectRef, {
                ...projectData,
                id: projectRef.id,
                createdAt: Timestamp.now(),
                status: 'pending',
                entries: 0
            });
            return projectRef.id;
        } catch (error) {
            console.error("Error creating project:", error);
            throw error;
        }
    };

    const handleAddNote = async (noteData: any) => {
        try {
            const noteRef = doc(collection(db, 'notes'));
            await setDoc(noteRef, {
                ...noteData,
                id: noteRef.id,
                userId: user?.uid || 'demo-user',
                createdAt: Timestamp.now(),
                isPinned: false,
                isArchived: false,
                isTrashed: false
            });
            return noteRef.id;
        } catch (error) {
            console.error("Error adding note:", error);
            throw error;
        }
    };

    const handleUpdateProjectStatus = async (projectId: string, status: string) => {
        try {
            const projectRef = doc(db, 'projects', projectId);
            await setDoc(projectRef, { status }, { merge: true });
        } catch (error) {
            console.error("Error updating project status:", error);
            throw error;
        }
    };

    const handleRecordTransaction = async (transactionData: any) => {
        try {
            const transactionRef = doc(collection(db, 'transactions'));
            await setDoc(transactionRef, {
                ...transactionData,
                id: transactionRef.id,
                date: Timestamp.now(),
                status: 'Completed'
            });
            return transactionRef.id;
        } catch (error) {
            console.error("Error recording transaction:", error);
            throw error;
        }
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
            projects: <ProjectsView onSelectProject={setSelectedProject} setActiveTab={setActiveTab} />,
            templates: <TemplatesView setActiveTab={setActiveTab} />,
            'ai-insights': <AIInsightsView setActiveTab={setActiveTab} />,
            clients: <ClientsView onSelectClient={setSelectedClient} setActiveTab={setActiveTab} />,
            team: <TeamView setActiveTab={setActiveTab} />,
            settings: <ConfigurationView setActiveTab={setActiveTab} />,
            profile: (
                <div className="flex-1 flex flex-col h-full bg-[#fafbfd] overflow-hidden">
                    <Header title="My Profile" icon={<UserIcon size={20} />} setActiveTab={setActiveTab} />
                    <div className="flex-1 p-8 overflow-y-auto">
                        <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-xl">
                                    {user?.displayName?.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">{user?.displayName}</h2>
                                    <p className="text-gray-500 font-medium">{user?.email}</p>
                                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100">
                                        Role: {user?.role}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                                    <input type="text" defaultValue={user?.displayName || ''} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                                    <input type="email" defaultValue={user?.email || ''} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                </div>
                                <button className="w-full py-3 bg-[#0e30f1] text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">
                                    Update Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ),
            security: (
                <div className="flex-1 flex flex-col h-full bg-[#fafbfd] overflow-hidden">
                    <Header title="Security Settings" icon={<Shield size={20} />} setActiveTab={setActiveTab} />
                    <div className="flex-1 p-8 overflow-y-auto">
                        <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                            <h2 className="text-xl font-black text-gray-900 mb-6">Security & Privacy</h2>
                            <div className="space-y-6">
                                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                        <Shield size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-orange-900">Two-Factor Authentication</h3>
                                        <p className="text-xs text-orange-800 mt-1">Add an extra layer of security to your account by enabling 2FA.</p>
                                        <button className="mt-3 text-xs font-bold text-orange-600 hover:underline">Enable Now</button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Current Password</label>
                                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                                    <input type="password" placeholder="New password" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                </div>
                                <button className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all">
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ),
            assistant: <AssistantView 
                onNavigate={(tab) => {
                    setActiveTab(tab);
                    setSelectedProject(null);
                    setSelectedClient(null);
                }}
                onOpenProject={setSelectedProject}
                onOpenClient={setSelectedClient}
                onCreateClient={handleCreateClient}
                onCreateProject={handleCreateProject}
                onAddNote={handleAddNote}
                onUpdateProjectStatus={handleUpdateProjectStatus}
                onRecordTransaction={handleRecordTransaction}
            />,
            documents: <DocumentsView />,
            notes: <NotesView />,
            tasks: <ComingSoonView title="Daily Tasks" />,
            'project-tasks': <TasksView />,
            'print-orders': <PrintOrdersView />,
            'client-orders': <PrintOrdersView />,
            transactions: <TransactionsView />,
            'sales-revenue': <ComingSoonView title="Sales & Revenue" />,
            'profit-margin': <ComingSoonView title="Profit & Margin" />,
            'client-dues': <ComingSoonView title="Client Dues" />,
            'expected-orders': <ComingSoonView title="Expected Orders" />,
            'items-rates': <ComingSoonView title="Items & Rates" />,
            complaints: <ComingSoonView title="Complaints" />,
            whatsapp: <ComingSoonView title="WhatsApp Integration" />,
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

    return (
        <ErrorBoundary>
            <UserContext.Provider value={{ user, setUser }}>
                <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
                    <Sidebar 
                        activeTab={activeTab} 
                        setActiveTab={(tab) => {
                            setActiveTab(tab);
                            setSelectedProject(null);
                            setSelectedClient(null);
                        }} 
                    />
                    <main className="flex-1 flex flex-col overflow-hidden relative">
                        {renderContent()}
                        <FloatingAssistant 
                            onNavigate={(tab) => {
                                setActiveTab(tab);
                                setSelectedProject(null);
                                setSelectedClient(null);
                            }}
                            onOpenProject={setSelectedProject}
                            onOpenClient={setSelectedClient}
                            onCreateClient={handleCreateClient}
                            onCreateProject={handleCreateProject}
                        />
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
        </ErrorBoundary>
    );
}

