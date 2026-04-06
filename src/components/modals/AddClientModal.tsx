import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { db, collection, addDoc, handleFirestoreError, OperationType, Timestamp } from '../../firebase';
import { useUser } from '../../App';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
];

const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose }) => {
    const [clientType, setClientType] = useState('School');
    const [deliveryMode, setDeliveryMode] = useState('Bus');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useUser();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        
        try {
            const clientData = {
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string,
                gstNumber: formData.get('gstNumber') as string,
                gstName: formData.get('gstName') as string,
                gstStateCode: formData.get('gstStateCode') as string,
                gstAddress: formData.get('gstAddress') as string,
                address: formData.get('address') as string,
                pincode: formData.get('pincode') as string,
                city: formData.get('city') as string,
                state: formData.get('state') as string,
                district: formData.get('district') as string,
                schoolId: formData.get('schoolId') as string,
                type: clientType,
                deliveryMode: deliveryMode,
                status: 'Active',
                createdAt: Timestamp.now(),
                createdBy: user.uid,
                balance: 0,
                maxCredit: 0,
                salePerson: formData.get('salePerson') as string,
            };

            await addDoc(collection(db, 'clients'), clientData);
            onClose();
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, 'clients', user.uid, user.email);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Add New Client</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100 transition-colors"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                    {/* Section 1: Basic & GST Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Basic Info */}
                        <div className="space-y-5">
                            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-blue-50 pb-2">Basic Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Client Name</label>
                                    <input name="name" required type="text" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Enter client name" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                                        <input name="email" required type="email" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Enter email" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contact Number</label>
                                        <input name="phone" required type="text" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Enter phone" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">School ID (Optional)</label>
                                        <input name="schoolId" type="text" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Enter school ID" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sales Person</label>
                                        <select name="salePerson" required className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all">
                                            <option value="">Select Sales Person</option>
                                            {["Rahul Sharma", "Priya Singh", "Amit Kumar", "Neha Gupta"].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* GST Info */}
                        <div className="space-y-5">
                            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-blue-50 pb-2">GST Information</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">GST Number</label>
                                        <input name="gstNumber" type="text" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Enter GST number" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">GST Name</label>
                                        <input name="gstName" type="text" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Enter GST name" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">GST State Code</label>
                                    <input name="gstStateCode" type="text" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Enter state code" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">GST Address</label>
                                    <textarea name="gstAddress" rows={2} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none" placeholder="Enter GST address"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Type, Delivery & Address */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Type and Delivery */}
                        <div className="space-y-8">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-4">Delivery Mode</label>
                                <div className="flex gap-4">
                                    {['Bus', 'Courier'].map((mode) => (
                                        <button
                                            key={mode}
                                            type="button"
                                            onClick={() => setDeliveryMode(mode)}
                                            className={`flex-1 py-3 px-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-3 ${
                                                deliveryMode === mode 
                                                ? 'bg-blue-50 border-blue-600 text-blue-600 shadow-sm' 
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${deliveryMode === mode ? 'border-blue-600' : 'border-gray-300'}`}>
                                                {deliveryMode === mode && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                            </div>
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-4">Client Type</label>
                                <div className="flex gap-4">
                                    {['School', 'Coaching', 'Other'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setClientType(type)}
                                            className={`flex-1 py-3 px-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-3 ${
                                                clientType === type 
                                                ? 'bg-blue-50 border-blue-600 text-blue-600 shadow-sm' 
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${clientType === type ? 'border-blue-600' : 'border-gray-300'}`}>
                                                {clientType === type && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                            </div>
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Address Info */}
                        <div className="space-y-5">
                            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-blue-50 pb-2">Address Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Address</label>
                                    <input name="address" required type="text" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Enter full address" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pincode</label>
                                        <input name="pincode" required type="text" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Pincode" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                                        <input name="city" required type="text" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="City" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
                                        <select name="state" required className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all">
                                            <option value="">Select State</option>
                                            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">District</label>
                                        <input name="district" required type="text" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="District" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100 flex gap-3 justify-end sticky bottom-0 bg-white pb-4">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-all">Cancel</button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="px-10 py-2.5 text-sm font-bold text-white bg-[#0e30f1] hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all active:scale-95"
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

export default AddClientModal;
