import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Project } from '../../types';
import CustomSelect from '../CustomSelect';
import { db, collection, addDoc, handleFirestoreError, OperationType, Timestamp } from '../../firebase';
import { useUser } from '../../App';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (project: Project) => void;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [projectType, setProjectType] = useState('School');
    const [isSubmitting, setIsSubmitting] = useState(false);
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
                client: formData.get('client') as string, // For backward compatibility
                clientId: user.uid,
                type: projectType,
                status: 'pending' as const,
                entries: 0,
                createdAt: Timestamp.now(),
            };

            const docRef = await addDoc(collection(db, 'projects'), projectData);
            
            onAdd({
                id: docRef.id,
                ...projectData
            } as Project);
            
            onClose();
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, 'projects', user.uid, user.email);
        } finally {
            setIsSubmitting(false);
        }
    };

    const typeOptions = [
        { value: 'School', label: 'School' },
        { value: 'College', label: 'College' },
        { value: 'Company', label: 'Company' },
        { value: 'Coaching', label: 'Coaching' },
        { value: 'Event', label: 'Event' },
    ];

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Create New Project</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100 transition-colors"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Project Name</label>
                        <input name="name" required type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Session 2026 ID Cards" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Client Name</label>
                        <input name="client" required type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Delhi Public School" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Project Type</label>
                        <CustomSelect 
                            value={projectType} 
                            onChange={setProjectType} 
                            options={typeOptions} 
                            width="w-full"
                        />
                    </div>
                    <div className="pt-4 flex gap-3 justify-end">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-[#0e30f1] hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                            {isSubmitting ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProjectModal;
