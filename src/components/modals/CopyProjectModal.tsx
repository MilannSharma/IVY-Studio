import React, { useState, useEffect } from 'react';
import { X, FileText, Users, Briefcase, Copy, Check } from 'lucide-react';
import { Project } from '../../types';

interface CopyProjectModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onCopy: (project: Project) => void;
}

const CopyProjectModal: React.FC<CopyProjectModalProps> = ({ isOpen, project, onClose, onCopy }) => {
    const [projectName, setProjectName] = useState('');
    const [sessionName, setSessionName] = useState('');
    const [copyOptions, setCopyOptions] = useState({
        template: true,
        groups: true,
        records: false,
    });
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (project) {
            setProjectName(`${project.name} — Copy`);
            setSessionName('');
            setCopyOptions({ template: true, groups: true, records: false });
            setCopied(false);
        }
    }, [project]);

    if (!isOpen || !project) return null;

    const toggleOption = (key: keyof typeof copyOptions) => setCopyOptions(prev => ({ ...prev, [key]: !prev[key] }));

    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => {
            const newProject: Project = {
                ...project,
                id: Date.now(),
                name: projectName || `${project.name} — Copy`,
                session: sessionName || undefined,
                status: 'Draft',
                entries: copyOptions.records ? project.entries : 0,
            };
            onCopy(newProject);
        }, 600);
    };

    const optionConfig = [
        { key: 'template' as const, label: 'Card Template', desc: 'Copy the ID card design layout and fields', icon: FileText, color: 'blue' as const },
        { key: 'groups' as const, label: 'Groups & Structure', desc: 'Copy department / class groupings', icon: Users, color: 'indigo' as const },
        { key: 'records' as const, label: 'All Records & Data', desc: 'Copy all student/employee data and photos', icon: Briefcase, color: 'green' as const },
    ];

    const colorMap = {
        blue: { bg: 'bg-blue-50', border: 'border-blue-300', icon: 'text-blue-600', check: 'bg-blue-600 border-blue-600' },
        indigo: { bg: 'bg-indigo-50', border: 'border-indigo-300', icon: 'text-indigo-600', check: 'bg-indigo-600 border-indigo-600' },
        green: { bg: 'bg-green-50', border: 'border-green-300', icon: 'text-green-600', check: 'bg-green-600 border-green-600' },
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Copy size={18} className="text-purple-600" />
                            <h2 className="text-base font-bold text-gray-900">Copy Project</h2>
                        </div>
                        <p className="text-xs text-gray-500">Copying: <span className="font-semibold text-gray-700">{project.name}</span></p>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-white rounded-lg transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">New Project Name</label>
                        <input
                            type="text"
                            value={projectName}
                            onChange={e => setProjectName(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                            placeholder="Project name..."
                        />
                    </div>

                    <div className="space-y-3">
                        {optionConfig.map(opt => {
                            const c = colorMap[opt.color];
                            const isChecked = copyOptions[opt.key];
                            return (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => toggleOption(opt.key)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${isChecked ? `${c.bg} ${c.border}` : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isChecked ? `${c.check}` : 'border-gray-300 bg-white'}`}>
                                        {isChecked && <Check size={11} className="text-white" strokeWidth={3.5} />}
                                    </div>
                                    <div className={`shrink-0 ${isChecked ? c.icon : 'text-gray-400'}`}>
                                        <opt.icon size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-sm font-bold ${isChecked ? 'text-gray-900' : 'text-gray-600'}`}>{opt.label}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
                        Cancel
                    </button>
                    <button
                        onClick={handleCopy}
                        disabled={copied || !projectName.trim()}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${copied ? 'bg-green-500 text-white' : 'bg-[#0e30f1] text-white hover:bg-blue-700 shadow-md disabled:opacity-50'}`}
                    >
                        {copied ? <><Check size={16} strokeWidth={3} /> Copied!</> : <><Copy size={15} /> Copy Project</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CopyProjectModal;
