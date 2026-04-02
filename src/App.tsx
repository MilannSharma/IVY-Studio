import React, { useState, useEffect } from 'react';
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
import { Project } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { auth, onAuthStateChanged, signIn, logOut, User } from './firebase';
import { LogIn, Sparkles } from 'lucide-react';

export default function App() {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [selectedClient, setSelectedClient] = useState<any | null>(null);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setIsAuthReady(true);
        });
        return () => unsubscribe();
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
                    className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] p-10 text-center"
                >
                    <div className="flex items-center justify-center mb-12">
                        <div className="relative px-10 py-5 backdrop-blur-2xl bg-white/5 border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center font-black text-8xl tracking-tighter" style={{ textShadow: '3px 3px 0px rgba(0,0,0,0.3)' }}>
                            <span className="text-white">I</span>
                            <span className="text-orange-500">V</span>
                            <span className="text-purple-800">Y</span>
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-[2rem] pointer-events-none" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-4">IVY Studio</h1>
                    <p className="text-white/60 font-medium mb-10 leading-relaxed max-w-[280px] mx-auto">
                        Next-generation ID card management with cinematic precision.
                    </p>
                    <button 
                        onClick={signIn}
                        className="w-full py-4 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-100 shadow-2xl transition-all group"
                    >
                        <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                        Continue with Google
                    </button>
                    <div className="mt-12 flex items-center justify-center gap-2 text-gray-400">
                        <Sparkles size={16} className="text-blue-500" />
                        <span className="text-xs font-bold uppercase tracking-widest">Powered by AI Intelligence</span>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
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
    );
}

