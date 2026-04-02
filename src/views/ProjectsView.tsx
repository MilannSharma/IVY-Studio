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
  ArrowRight,
  Loader2
} from 'lucide-react';
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
}

const ProjectsView: React.FC<ProjectsViewProps> = ({ onSelectProject }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('All');
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
            const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
            return matchesSearch && matchesType && matchesStatus;
        });
    }, [projects, search, filterType, filterStatus]);

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
            <header className="bg-white border-b border-gray-200 px-8 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <LayoutDashboard size={20} />
                    <h1 className="text-lg font-bold text-gray-900 tracking-tight">Project Management</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                </div>
            </header>

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
                    <div className="flex gap-4 flex-1">
                        <div className="relative max-w-sm w-full">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            />
                        </div>
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
                            icon={<Filter size={16} />}
                            width="w-48"
                        />
                        <CustomSelect
                            value={filterStatus}
                            onChange={setFilterStatus}
                            options={[
                                { value: 'All', label: 'All Statuses' },
                                { value: 'in-progress', label: 'Active' },
                                { value: 'pending', label: 'Draft' },
                                { value: 'completed', label: 'Completed' },
                                { value: 'cancelled', label: 'Cancelled' },
                            ]}
                            icon={<Filter size={16} />}
                            width="w-48"
                        />
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0e30f1] hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all"
                    >
                        <Plus size={16} /> Add Project
                    </motion.button>
                </div>

                <div className="bg-white border border-gray-200 rounded-b-xl shadow-sm overflow-hidden text-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#f8fafc] border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                <th className="px-6 py-3">Project Name</th>
                                <th className="px-6 py-3">Client</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Records</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Action</th>
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
                                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold uppercase">
                                                    {project.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold group-hover:text-blue-600 transition-colors">{project.name}</span>
                                                    <span className="text-[11px] text-gray-400 font-medium">ID: PRJ-{1000 + project.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">{project.client}</td>
                                        <td className="px-6 py-4 text-gray-500">{project.type}</td>
                                        <td className="px-6 py-4 text-gray-500">{project.entries.toLocaleString()}</td>
                                        <td className="px-6 py-4"><StatusBadge status={project.status} /></td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setProjectToCopy(project); }}
                                                    className="text-xs px-3 py-1.5 font-semibold text-gray-600 bg-gray-100 hover:bg-purple-50 hover:text-purple-700 rounded-md transition-colors flex items-center gap-1"
                                                >
                                                    <Copy size={13} /> Copy
                                                </button>
                                                <button className="text-xs px-3 py-1.5 font-semibold text-gray-600 bg-gray-100 group-hover:bg-blue-50 group-hover:text-blue-600 rounded-md transition-colors flex items-center gap-1">
                                                    Details <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                                </button>
                                            </div>
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

            <AddProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={(proj) => setProjects([proj, ...projects])} />
            <CopyProjectModal isOpen={!!projectToCopy} project={projectToCopy} onClose={() => setProjectToCopy(null)} onCopy={(p) => { setProjects([p, ...projects]); setProjectToCopy(null); }} />
        </div>
    );
};

export default ProjectsView;
