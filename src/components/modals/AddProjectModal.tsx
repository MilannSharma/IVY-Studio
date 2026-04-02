import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Project } from '../../types';
import CustomSelect from '../CustomSelect';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (project: Project) => void;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [projectType, setProjectType] = useState('School');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newProject: Project = {
            id: Date.now(),
            name: formData.get('name') as string,
            client: formData.get('client') as string,
            type: projectType,
            status: 'Draft',
            entries: 0
        };
        onAdd(newProject);
        onClose();
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
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#0e30f1] hover:bg-blue-700 rounded-lg shadow-sm">Create Project</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProjectModal;
