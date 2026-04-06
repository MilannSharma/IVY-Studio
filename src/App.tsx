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
import PrintOrdersView from './views/PrintOrdersView';
import TransactionsView from './views/TransactionsView';
import CommandPalette from './components/CommandPalette';
import FloatingAssistant from './components/FloatingAssistant';
import { Project, User } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { db, Timestamp } from './firebase';
import { setDoc, doc, collection } from 'firebase/firestore';
import { Sparkles } from 'lucide-react';

// User Context for global access
interface UserContextType {
    user: User | null;
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
        email: 'admin@ivy.studio',
        displayName: 'Admin User',
        photoURL: 'https://ui-avatars.com/api/?name=Admin&background=random',
        role: 'admin'
    });
    const [isAuthReady, setIsAuthReady] = useState(true);

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
        setIsAuthReady(true);
    }, []);

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

    return (
        <UserContext.Provider value={{ user }}>
            <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
                <Sidebar activeTab={activeTab} setActiveTab={(tab) => {
                    setActiveTab(tab);
                    setSelectedProject(null);
                    setSelectedClient(null);
                }} />
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
    );
}

