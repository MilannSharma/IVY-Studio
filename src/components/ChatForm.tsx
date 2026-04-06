import React, { useState } from 'react';
import { Check, X, User, Mail, Phone, Briefcase, FileText, Type } from 'lucide-react';

interface ChatFormProps {
    type: 'client' | 'project';
    initialData?: any;
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

const ChatForm: React.FC<ChatFormProps> = ({ type, initialData = {}, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        // Client fields
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        clientType: initialData.type || '',
        contact: initialData.contact || '',
        // Project fields
        projectName: initialData.name || '',
        clientName: initialData.client || '',
        projectType: initialData.type || '',
        description: initialData.description || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (type === 'client') {
            onSubmit({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                type: formData.clientType,
                contact: formData.contact
            });
        } else {
            onSubmit({
                name: formData.projectName,
                client: formData.clientName,
                type: formData.projectType,
                description: formData.description
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-4 shadow-inner">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-[#0e30f1] text-white rounded flex items-center justify-center">
                    {type === 'client' ? <User size={14} /> : <Briefcase size={14} />}
                </div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    {type === 'client' ? 'New Client Form' : 'New Project Form'}
                </h4>
            </div>

            {type === 'client' ? (
                <>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    placeholder="e.g. Milan Sharma"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                                        placeholder="email@example.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                    <input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                                        placeholder="+91..."
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Client Type</label>
                                <div className="relative">
                                    <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                    <input
                                        name="clientType"
                                        value={formData.clientType}
                                        onChange={handleChange}
                                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                                        placeholder="e.g. School"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Contact Person</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                    <input
                                        name="contact"
                                        value={formData.contact}
                                        onChange={handleChange}
                                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                                        placeholder="Name"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Project Name</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    name="projectName"
                                    value={formData.projectName}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    placeholder="e.g. Annual Staff IDs"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Client Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    name="clientName"
                                    value={formData.clientName}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    placeholder="Search client..."
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Project Type</label>
                            <div className="relative">
                                <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    name="projectType"
                                    value={formData.projectType}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    placeholder="e.g. School"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Description</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 text-gray-400" size={14} />
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                                    placeholder="Project details..."
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div className="flex gap-2 pt-2">
                <button
                    type="submit"
                    className="flex-1 py-2 bg-[#0e30f1] text-white rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
                >
                    <Check size={14} />
                    Review & Confirm
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-white border border-gray-200 text-gray-500 rounded-lg font-bold text-[10px] uppercase tracking-wider hover:bg-gray-50 transition-all"
                >
                    <X size={14} />
                </button>
            </div>
        </form>
    );
};

export default ChatForm;
