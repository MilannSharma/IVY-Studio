import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Settings, 
  Search, 
  Plus, 
  Filter, 
  Copy,
  Check,
  ArrowRight,
  Loader2,
  Sparkles
} from 'lucide-react';
import Header from '../components/Header';
import { Project } from '../types';
import StatusBadge from '../components/StatusBadge';
import AddProjectModal from '../components/modals/AddProjectModal';
import CopyProjectModal from '../components/modals/CopyProjectModal';
import { motion, AnimatePresence } from 'motion/react';
import CustomSelect from '../components/CustomSelect';
import { db, collection, onSnapshot, query, orderBy, handleFirestoreError, OperationType } from '../firebase';
import { useUser } from '../App';

interface ProjectsViewProps {
  onSelectProject: (project: Project) => void;
  setActiveTab?: (tab: string) => void;
}

const ProjectsView: React.FC<ProjectsViewProps> = ({ onSelectProject, setActiveTab }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [filterClient, setFilterClient] = useState('');
    const [filterStage, setFilterStage] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectToCopy, setProjectToCopy] = useState<Project | null>(null);
    const { user } = useUser();

    useEffect(() => {
        const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const projectsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Project));
            setProjects(projectsData);
            setLoading(false);
        }, (error) => {
            handleFirestoreError(error, OperationType.LIST, 'projects', user?.uid, user?.email);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                                 (p.client?.toLowerCase().includes(search.toLowerCase()) ?? false);
            const matchesType = filterType === 'All' || p.type === filterType;
            const matchesClient = !filterClient || (p.client?.toLowerCase().includes(filterClient.toLowerCase()) ?? false);
            const matchesStage = filterStage === 'All' || p.stage === filterStage;
            const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
            return matchesSearch && matchesType && matchesClient && matchesStage && matchesStatus;
        });
    }, [projects, search, filterType, filterClient, filterStage, filterStatus]);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#fafbfd] overflow-hidden">
            <Header title="Project Management" icon={<LayoutDashboard size={20} />} setActiveTab={setActiveTab} />

            <div className="flex-1 overflow-y-auto p-8 hide-scroll">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { title: 'Total Projects', value: projects.length.toString(), icon: Briefcase, color: 'text-blue-600' },
                        { title: 'Active Today', value: projects.filter(p => p.status === 'in-progress').length.toString(), icon: Settings, color: 'text-purple-600' },
                        { title: 'Completed', value: projects.filter(p => p.status === 'completed').length.toString(), icon: FileText, color: 'text-green-600' },
                    ].map((stat, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -2 }}
                            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
                        >
                            <div className="flex flex-col gap-2">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{stat.title}</p>
                                <div className="flex items-center justify-between">
                                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                                    <stat.icon size={20} className={stat.color} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="bg-white p-4 rounded-t-xl border border-gray-200 border-b-0 flex flex-wrap gap-4 justify-between items-center">
                    <div className="flex flex-wrap gap-4 flex-1">
                        <div className="flex flex-col gap-1.5 min-w-[200px]">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Keyword search</label>
                            <div className="relative w-full">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Type</label>
                            <CustomSelect
                                value={filterType}
                                onChange={setFilterType}
                                options={[
                                    { value: 'All', label: 'All Types' },
                                    { value: 'School', label: 'School' },
                                    { value: 'College', label: 'College' },
                                    { value: 'Company', label: 'Company' },
                                    { value: 'Coaching', label: 'Coaching' },
                                ]}
                                width="w-40"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 min-w-[180px]">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Client</label>
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    placeholder="search client"
                                    value={filterClient}
                                    onChange={e => setFilterClient(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Stage</label>
                            <CustomSelect
                                value={filterStage}
                                onChange={setFilterStage}
                                options={[
                                    { value: 'All', label: 'Select' },
                                    { value: 'Active', label: 'Active' },
                                    { value: 'Inactive', label: 'Inactive' },
                                ]}
                                width="w-32"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Status</label>
                            <CustomSelect
                                value={filterStatus}
                                onChange={setFilterStatus}
                                options={[
                                    { value: 'All', label: 'Select' },
                                    { value: 'initialized', label: 'Initialized' },
                                    { value: 'in-progress', label: 'InProcess' },
                                    { value: 'completed', label: 'Completed' },
                                    { value: 'on-hold', label: 'OnHold' },
                                    { value: 'cancelled', label: 'Cancelled' },
                                ]}
                                width="w-32"
                            />
                        </div>
                    </div>
                <div className="flex flex-col justify-end h-full pt-6">
                    <button 
                        className="px-4 py-2 bg-purple-50 text-purple-600 border border-purple-200 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-purple-100 transition shadow-sm"
                    >
                        <Sparkles size={16} />
                        AI Project Insights
                    </button>
                </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-b-xl shadow-sm overflow-hidden text-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#f8fafc] border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                <th className="px-6 py-3">Project Name</th>
                                <th className="px-6 py-3">Client Name</th>
                                <th className="px-6 py-3">Sales Person</th>
                                <th className="px-6 py-3">Assigned Staff</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Created At</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                                <motion.tbody 
                                    variants={container}
                                    initial="hidden"
                                    animate="show"
                                    className="divide-y divide-gray-100"
                                >
                                    <AnimatePresence mode="popLayout">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center justify-center gap-3">
                                                        <Loader2 size={32} className="text-blue-600 animate-spin" />
                                                        <p className="text-gray-500 font-medium">Loading projects...</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : filteredProjects.map((project) => (
                                    <motion.tr 
                                        key={project.id} 
                                        variants={item}
                                        layout
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        onClick={() => onSelectProject(project)} 
                                        className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold group-hover:text-blue-600 transition-colors">{project.name}</span>
                                                    <div className="w-4 h-4 rounded-full border border-green-500 flex items-center justify-center text-green-500">
                                                        <Check size={10} strokeWidth={3} />
                                                    </div>
                                                </div>
                                                <StatusBadge status={project.status} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">{project.client}</td>
                                        <td className="px-6 py-4 text-gray-500">-</td>
                                        <td className="px-6 py-4">
                                            <div className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-400 text-xs flex justify-between items-center">
                                                Select Staff
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{project.type}</td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {project.createdAt?.toDate ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(project.createdAt.toDate()) : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md ${project.stage === 'Active' ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'}`}>
                                                {project.stage || 'Active'}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </motion.tbody>
                    </table>
                    {filteredProjects.length === 0 && (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="text-gray-300" size={32} />
                            </div>
                            <p className="text-gray-900 font-bold">No projects found</p>
                            <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filter.</p>
                        </div>
                    )}
                </div>
            </div>

            <AddProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <CopyProjectModal isOpen={!!projectToCopy} project={projectToCopy} onClose={() => setProjectToCopy(null)} onCopy={(p) => { setProjectToCopy(null); }} />
        </div>
    );
};

export default ProjectsView;
