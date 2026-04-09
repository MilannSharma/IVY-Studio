import React, { useState, useEffect } from 'react';
import { FileText, Upload, Trash2, Download, Search, Plus, File, Image, FileCode, FileArchive } from 'lucide-react';
import { db, storage, collection, addDoc, onSnapshot, query, where, orderBy, Timestamp, handleFirestoreError, OperationType, deleteDoc, doc, ref, uploadBytes, getDownloadURL, deleteObject } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '../App';

interface Document {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    uploadedAt: any;
    userId: string;
}

const DocumentsView: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const { user } = useUser();

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'documents'),
            where('userId', '==', user.uid),
            orderBy('uploadedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs: Document[] = [];
            snapshot.forEach((doc) => {
                docs.push({ id: doc.id, ...doc.data() } as Document);
            });
            setDocuments(docs);
        }, (error) => {
            handleFirestoreError(error, OperationType.GET, 'documents', user.uid, user.email);
        });

        return () => unsubscribe();
    }, [user]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const storageRef = ref(storage, `documents/${user.uid}/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            await addDoc(collection(db, 'documents'), {
                name: file.name,
                url: downloadURL,
                type: file.type,
                size: file.size,
                uploadedAt: Timestamp.now(),
                userId: user.uid,
                storagePath: snapshot.ref.fullPath
            });

            setUploadProgress(100);
        } catch (error) {
            console.error("Upload Error:", error);
        } finally {
            setIsUploading(false);
            setTimeout(() => setUploadProgress(0), 1000);
        }
    };

    const deleteDocument = async (docId: string, storagePath?: string) => {
        if (!user) return;
        if (!window.confirm('Are you sure you want to delete this document?')) return;
        try {
            if (storagePath) {
                const storageRef = ref(storage, storagePath);
                await deleteObject(storageRef);
            }
            await deleteDoc(doc(db, 'documents', docId));
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `documents/${docId}`, user.uid, user.email);
        }
    };

    const filteredDocs = documents.filter(doc => 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (type: string) => {
        if (type.includes('image')) return <Image size={20} className="text-blue-500" />;
        if (type.includes('pdf')) return <FileText size={20} className="text-red-500" />;
        if (type.includes('zip') || type.includes('rar')) return <FileArchive size={20} className="text-purple-500" />;
        if (type.includes('code') || type.includes('javascript') || type.includes('html')) return <FileCode size={20} className="text-green-500" />;
        return <File size={20} className="text-gray-500" />;
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#fafbfd] overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0e30f1] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 tracking-tight">Document Storage</h1>
                        <p className="text-xs text-gray-500 font-medium">Manage and store your project files securely.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0e30f1]/20 focus:border-[#0e30f1] outline-none transition-all w-64"
                        />
                    </div>
                    <label className="flex items-center gap-2 px-4 py-2 bg-[#0e30f1] text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all cursor-pointer">
                        <Upload size={18} />
                        Upload File
                        <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                    </label>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 hide-scroll">
                {isUploading && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                            <Upload size={20} className="animate-bounce" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-blue-900">Uploading document...</p>
                            <div className="w-full h-1.5 bg-blue-200 rounded-full mt-2 overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 2 }}
                                    className="h-full bg-blue-600"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {filteredDocs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {filteredDocs.map((doc) => (
                                <motion.div
                                    key={doc.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                                            {getFileIcon(doc.type)}
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a 
                                                href={doc.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            >
                                                <Download size={16} />
                                            </a>
                                            <button 
                                                onClick={() => deleteDocument(doc.id, (doc as any).storagePath)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 truncate mb-1" title={doc.name}>{doc.name}</h3>
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{formatSize(doc.size)}</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                            {doc.uploadedAt?.toDate().toLocaleDateString()}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12">
                        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center text-gray-400 mb-6">
                            <FileText size={40} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No documents found</h3>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto">
                            Upload your first document to get started. You can store PDFs, images, and other project files here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentsView;
