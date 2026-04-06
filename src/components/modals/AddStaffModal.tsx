import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { db, collection, addDoc, handleFirestoreError, OperationType, Timestamp } from '../../firebase';
import { useUser } from '../../App';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
];

const ROLES = [
    { id: 'Staff', label: 'Staff' },
    { id: 'Salesperson', label: 'Salesperson' },
    { id: 'Credit_manager', label: 'Credit_manager' },
    { id: 'Accounts', label: 'Accounts' },
    { id: 'Admin', label: 'Admin' }
];

const AddStaffModal: React.FC<AddStaffModalProps> = ({ isOpen, onClose }) => {
    const [role, setRole] = useState('Staff');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useUser();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        
        try {
            const staffData = {
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string,
                role: role,
                address: formData.get('address') as string,
                pincode: formData.get('pincode') as string,
                city: formData.get('city') as string,
                state: formData.get('state') as string,
                district: formData.get('district') as string,
                status: 'Active',
                createdAt: Timestamp.now(),
                createdBy: user.uid,
            };

            await addDoc(collection(db, 'staff'), staffData);
            onClose();
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, 'staff', user.uid, user.email);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Add New Staff</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100 transition-colors"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                            <input name="name" required type="text" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Full Name" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                            <input name="email" required type="email" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Email" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contact <span className="text-red-500">*</span></label>
                            <input name="phone" required type="text" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Contact Number" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Role <span className="text-red-500">*</span></label>
                            <div className="flex flex-wrap gap-4">
                                {ROLES.map((r) => (
                                    <label key={r.id} className="flex items-center gap-2 cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input 
                                                type="radio" 
                                                name="role" 
                                                value={r.id} 
                                                checked={role === r.id}
                                                onChange={() => setRole(r.id)}
                                                className="sr-only"
                                            />
                                            <div className={`w-5 h-5 rounded-full border-2 transition-all ${role === r.id ? 'border-blue-600' : 'border-gray-300 group-hover:border-gray-400'}`}>
                                                {role === r.id && <div className="w-2.5 h-2.5 rounded-full bg-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                                            </div>
                                        </div>
                                        <span className={`text-sm font-medium ${role === r.id ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}>{r.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address</label>
                            <input name="address" type="text" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Address" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pincode</label>
                                <input name="pincode" type="text" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Pincode" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                                <input name="city" type="text" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="City" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
                                <select name="state" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all">
                                    <option value="">Select State</option>
                                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">District</label>
                                <input name="district" type="text" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Select District" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full py-3 text-sm font-bold text-white bg-[#0e30f1] hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStaffModal;
