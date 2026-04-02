import React, { useState, useEffect } from 'react';
import { StickyNote, Plus, Trash2, Palette, Search, X, Check } from 'lucide-react';
import { db, auth, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, orderBy, Timestamp, handleFirestoreError, OperationType } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';

interface Note {
    id: string;
    title?: string;
    content: string;
    color?: string;
    createdAt: any;
    userId: string;
}

const COLORS = [
    { name: 'White', value: 'bg-white' },
    { name: 'Red', value: 'bg-red-50' },
    { name: 'Orange', value: 'bg-orange-50' },
    { name: 'Yellow', value: 'bg-yellow-50' },
    { name: 'Green', value: 'bg-green-50' },
    { name: 'Teal', value: 'bg-teal-50' },
    { name: 'Blue', value: 'bg-blue-50' },
    { name: 'Purple', value: 'bg-purple-50' },
];

const NotesView: React.FC = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newNote, setNewNote] = useState({ title: '', content: '', color: 'bg-white' });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!auth.currentUser) return;

        const q = query(
            collection(db, 'notes'),
            where('userId', '==', auth.currentUser.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedNotes: Note[] = [];
            snapshot.forEach((doc) => {
                fetchedNotes.push({ id: doc.id, ...doc.data() } as Note);
            });
            setNotes(fetchedNotes);
        }, (error) => {
            handleFirestoreError(error, OperationType.GET, 'notes');
        });

        return () => unsubscribe();
    }, []);

    const handleAddNote = async () => {
        if (!newNote.content.trim() || !auth.currentUser) return;

        try {
            await addDoc(collection(db, 'notes'), {
                ...newNote,
                createdAt: Timestamp.now(),
                userId: auth.currentUser.uid
            });
            setNewNote({ title: '', content: '', color: 'bg-white' });
            setIsAdding(false);
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, 'notes');
        }
    };

    const handleDeleteNote = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'notes', id));
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `notes/${id}`);
        }
    };

    const updateNoteColor = async (id: string, color: string) => {
        try {
            await updateDoc(doc(db, 'notes', id), { color });
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `notes/${id}`);
        }
    };

    const filteredNotes = notes.filter(note => 
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.title && note.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="flex-1 flex flex-col h-full bg-[#fafbfd] overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0e30f1] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <StickyNote size={24} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 tracking-tight">My Notes</h1>
                        <p className="text-xs text-gray-500 font-medium">Quick thoughts and project ideas.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0e30f1]/20 focus:border-[#0e30f1] outline-none transition-all w-64"
                        />
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 hide-scroll">
                <div className="max-w-4xl mx-auto">
                    {/* Add Note Area */}
                    <div className={`mb-12 transition-all duration-300 ${isAdding ? 'scale-105' : ''}`}>
                        <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden ${isAdding ? 'shadow-xl ring-4 ring-blue-50' : ''}`}>
                            {isAdding && (
                                <input
                                    type="text"
                                    placeholder="Title"
                                    value={newNote.title}
                                    onChange={e => setNewNote({ ...newNote, title: e.target.value })}
                                    className="w-full px-5 py-3 text-sm font-bold text-gray-900 outline-none border-b border-gray-50"
                                />
                            )}
                            <textarea
                                placeholder="Take a note..."
                                value={newNote.content}
                                onFocus={() => setIsAdding(true)}
                                onChange={e => setNewNote({ ...newNote, content: e.target.value })}
                                className="w-full px-5 py-4 text-sm text-gray-700 outline-none resize-none min-h-[100px]"
                            />
                            {isAdding && (
                                <div className="px-5 py-3 flex items-center justify-between bg-gray-50/50">
                                    <div className="flex gap-1">
                                        {COLORS.map(c => (
                                            <button
                                                key={c.value}
                                                onClick={() => setNewNote({ ...newNote, color: c.value })}
                                                className={`w-6 h-6 rounded-full border border-gray-200 ${c.value} ${newNote.color === c.value ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                                                title={c.name}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setIsAdding(false)} className="px-4 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                                        <button onClick={handleAddNote} className="px-4 py-1.5 text-xs font-bold bg-[#0e30f1] text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors">Save Note</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AnimatePresence>
                            {filteredNotes.map((note) => (
                                <motion.div
                                    key={note.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className={`${note.color || 'bg-white'} border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative`}
                                >
                                    {note.title && <h3 className="text-sm font-bold text-gray-900 mb-2">{note.title}</h3>}
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                                    
                                    <div className="mt-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex gap-1.5">
                                            {COLORS.map(c => (
                                                <button
                                                    key={c.value}
                                                    onClick={() => updateNoteColor(note.id, c.value)}
                                                    className={`w-5 h-5 rounded-full border border-gray-200 ${c.value} hover:scale-110 transition-transform`}
                                                />
                                            ))}
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteNote(note.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="absolute top-4 right-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                        {note.createdAt?.toDate().toLocaleDateString()}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {filteredNotes.length === 0 && !isAdding && (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mx-auto mb-4">
                                <StickyNote size={32} />
                            </div>
                            <h3 className="text-base font-bold text-gray-900">No notes yet</h3>
                            <p className="text-sm text-gray-500">Capture your first idea above.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotesView;
