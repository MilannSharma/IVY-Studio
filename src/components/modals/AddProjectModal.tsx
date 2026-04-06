import React, { useState } from 'react';
import { X, Loader2, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { Project } from '../../types';
import CustomSelect from '../CustomSelect';
import { db, collection, addDoc, handleFirestoreError, OperationType, Timestamp } from '../../firebase';
import { useUser } from '../../App';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (project: Project) => void;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [projectType, setProjectType] = useState('School');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [schoollogId, setSchoollogId] = useState('');
    const [session, setSession] = useState('');
    const { user } = useUser();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        
        try {
            const projectData = {
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                schoollogId,
                session,
                clientId: user.uid,
                type: projectType,
                status: 'initialized' as const,
                stage: 'Active' as const,
                entries: 0,
                createdAt: Timestamp.now(),
            };

            const docRef = await addDoc(collection(db, 'projects'), projectData);
            
            if (onAdd) {
                onAdd({
                    id: docRef.id,
                    ...projectData
                } as Project);
            }
            
            onClose();
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, 'projects', user.uid, user.email);
        } finally {
            setIsSubmitting(false);
        }
    };

    const typeOptions = ['School', 'Company', 'Coaching', 'Event', 'Other'];

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">Add New Project</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100 transition-colors"><X size={24} /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Schoollog Integration Section */}
                        <div className="bg-[#f8fafc] rounded-xl p-6 border border-gray-100 space-y-4">
                            <h3 className="text-sm font-bold text-gray-900">Schoollog Integration (Optional)</h3>
                            
                            <div className="space-y-1.5">
                                <label className="block text-sm font-bold text-gray-700">Schoollog ID</label>
                                <div className="flex gap-3">
                                    <input 
                                        value={schoollogId}
                                        onChange={e => setSchoollogId(e.target.value)}
                                        type="text" 
                                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-gray-400" 
                                        placeholder="Enter Schoollog ID" 
                                    />
                                    <button 
                                        type="button"
                                        className="px-6 py-2.5 bg-[#0f172a] text-white rounded-lg text-sm font-bold hover:bg-black transition-colors shadow-sm"
                                    >
                                        Verify ID
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-bold text-gray-700">Session</label>
                                <select 
                                    value={session}
                                    onChange={e => setSession(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white text-gray-500"
                                >
                                    <option value="">Select a session</option>
                                    <option value="2024-25">2024-25</option>
                                    <option value="2025-26">2025-26</option>
                                </select>
                            </div>
                        </div>

                        {/* Project Details */}
                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-bold text-gray-700">Project Name</label>
                                <input 
                                    name="name" 
                                    required 
                                    type="text" 
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                                    placeholder="demo Project 2" 
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-bold text-gray-700">Project Description</label>
                                <textarea 
                                    name="description" 
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none" 
                                    placeholder="Project Description" 
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-gray-700">Project Type</label>
                                <div className="flex flex-wrap gap-3">
                                    {typeOptions.map((type) => (
                                        <label 
                                            key={type}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                                                projectType === type 
                                                ? 'bg-white border-blue-500 ring-1 ring-blue-500' 
                                                : 'bg-white border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <input 
                                                type="radio" 
                                                name="projectType" 
                                                value={type}
                                                checked={projectType === type}
                                                onChange={() => setProjectType(type)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button 
                                type="button"
                                className="flex items-center gap-2 px-4 py-2 border border-gray-900 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                            >
                                <Plus size={16} /> Address
                            </button>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full py-3.5 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-900 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default AddProjectModal;
