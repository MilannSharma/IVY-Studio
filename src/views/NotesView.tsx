import React, { useState, useEffect, useRef } from 'react';
import { 
    Lightbulb, 
    Bell, 
    Pencil, 
    Archive, 
    Trash2, 
    Search, 
    RotateCw, 
    LayoutGrid, 
    Settings, 
    Grid2X2,
    CheckSquare,
    Image as ImageIcon,
    Pin,
    BellPlus,
    UserPlus,
    Palette,
    MoreVertical,
    Check,
    X,
    Menu
} from 'lucide-react';
import { db, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, orderBy, Timestamp, handleFirestoreError, OperationType } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '../App';

interface Note {
    id: string;
    title?: string;
    content: string;
    color?: string;
    createdAt: any;
    userId: string;
    isPinned?: boolean;
    isArchived?: boolean;
    isTrashed?: boolean;
    isReminder?: boolean;
    labels?: string[];
}

const COLORS = [
    { name: 'Default', value: 'bg-white', border: 'border-gray-200' },
    { name: 'Red', value: 'bg-[#f28b82]', border: 'border-[#f28b82]' },
    { name: 'Orange', value: 'bg-[#fbbc04]', border: 'border-[#fbbc04]' },
    { name: 'Yellow', value: 'bg-[#fff475]', border: 'border-[#fff475]' },
    { name: 'Green', value: 'bg-[#ccff90]', border: 'border-[#ccff90]' },
    { name: 'Teal', value: 'bg-[#a7ffeb]', border: 'border-[#a7ffeb]' },
    { name: 'Blue', value: 'bg-[#cbf0f8]', border: 'border-[#cbf0f8]' },
    { name: 'Dark Blue', value: 'bg-[#aecbfa]', border: 'border-[#aecbfa]' },
    { name: 'Purple', value: 'bg-[#d7aefb]', border: 'border-[#d7aefb]' },
    { name: 'Pink', value: 'bg-[#fdcfe8]', border: 'border-[#fdcfe8]' },
    { name: 'Brown', value: 'bg-[#e6c9a8]', border: 'border-[#e6c9a8]' },
    { name: 'Gray', value: 'bg-[#e8eaed]', border: 'border-[#e8eaed]' },
];

const NotesView: React.FC = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newNote, setNewNote] = useState({ title: '', content: '', color: 'bg-white' });
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'notes' | 'reminders' | 'archive' | 'trash'>('notes');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const { user } = useUser();
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const editContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                if (isAdding) {
                    handleAddNote();
                }
            }
            if (editContainerRef.current && !editContainerRef.current.contains(event.target as Node)) {
                if (editingNote) {
                    handleUpdateNote();
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isAdding, newNote, editingNote]);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'notes'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedNotes: Note[] = [];
            snapshot.forEach((doc) => {
                fetchedNotes.push({ id: doc.id, ...doc.data() } as Note);
            });
            setNotes(fetchedNotes);
        }, (error) => {
            handleFirestoreError(error, OperationType.GET, 'notes', user.uid, user.email);
        });

        return () => unsubscribe();
    }, [user]);

    const handleAddNote = async () => {
        const title = newNote.title.trim();
        const content = newNote.content.trim();
        const color = newNote.color;

        // Immediately collapse to feel "fast"
        setIsAdding(false);
        setNewNote({ title: '', content: '', color: 'bg-white' });

        if ((!content && !title) || !user) {
            return;
        }

        try {
            await addDoc(collection(db, 'notes'), {
                title,
                content,
                color,
                createdAt: Timestamp.now(),
                userId: user.uid,
                isPinned: false,
                isArchived: false,
                isTrashed: false
            });
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, 'notes', user.uid, user.email);
        }
    };

    const togglePin = async (id: string, current: boolean) => {
        try {
            await updateDoc(doc(db, 'notes', id), { isPinned: !current });
        } catch (error) {
            console.error("Error toggling pin:", error);
        }
    };

    const moveToTrash = async (id: string) => {
        try {
            await updateDoc(doc(db, 'notes', id), { isTrashed: true, isArchived: false, isPinned: false });
        } catch (error) {
            console.error("Error moving to trash:", error);
        }
    };

    const archiveNote = async (id: string, current: boolean) => {
        try {
            await updateDoc(doc(db, 'notes', id), { isArchived: !current, isPinned: false });
        } catch (error) {
            console.error("Error archiving note:", error);
        }
    };

    const updateColor = async (id: string, color: string) => {
        try {
            await updateDoc(doc(db, 'notes', id), { color });
        } catch (error) {
            console.error("Error updating color:", error);
        }
    };

    const deletePermanently = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'notes', id));
        } catch (error) {
            console.error("Error deleting permanently:", error);
        }
    };

    const restoreFromTrash = async (id: string) => {
        try {
            await updateDoc(doc(db, 'notes', id), { isTrashed: false });
        } catch (error) {
            console.error("Error restoring note:", error);
        }
    };

    const toggleReminder = async (id: string, current: boolean) => {
        try {
            await updateDoc(doc(db, 'notes', id), { isReminder: !current });
        } catch (error) {
            console.error("Error toggling reminder:", error);
        }
    };

    const addLabel = async (id: string) => {
        const label = prompt("Enter label name:");
        if (!label) return;
        
        try {
            const note = notes.find(n => n.id === id);
            const labels = note?.labels || [];
            if (!labels.includes(label)) {
                await updateDoc(doc(db, 'notes', id), { 
                    labels: [...labels, label] 
                });
            }
        } catch (error) {
            console.error("Error adding label:", error);
        }
    };

    const makeCopy = async (id: string) => {
        const note = notes.find(n => n.id === id);
        if (!note || !user) return;
        
        try {
            await addDoc(collection(db, 'notes'), {
                title: note.title ? `${note.title} (copy)` : '',
                content: note.content,
                color: note.color || 'bg-white',
                createdAt: Timestamp.now(),
                userId: user.uid,
                isPinned: false,
                isArchived: false,
                isTrashed: false,
                labels: note.labels || []
            });
        } catch (error) {
            console.error("Error copying note:", error);
        }
    };

    const handleUpdateNote = async () => {
        if (!editingNote || !user) return;
        
        const title = editingNote.title?.trim() || '';
        const content = editingNote.content.trim();
        const color = editingNote.color;

        if (!content && !title) {
            setEditingNote(null);
            return;
        }

        try {
            await updateDoc(doc(db, 'notes', editingNote.id), {
                title,
                content,
                color,
            });
            setEditingNote(null);
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, 'notes', user.uid, user.email);
        }
    };

    const filteredNotes = notes.filter(note => {
        const matchesSearch = note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (note.title && note.title.toLowerCase().includes(searchQuery.toLowerCase()));
        
        if (!matchesSearch) return false;

        if (activeFilter === 'trash') return note.isTrashed;
        if (note.isTrashed) return false;

        if (activeFilter === 'archive') return note.isArchived;
        if (note.isArchived) return false;

        if (activeFilter === 'reminders') return note.isReminder;

        return true;
    });

    const pinnedNotes = filteredNotes.filter(n => n.isPinned);
    const otherNotes = filteredNotes.filter(n => !n.isPinned);

    const sidebarItems = [
        { id: 'notes', label: 'Notes', icon: Lightbulb },
        { id: 'reminders', label: 'Reminders', icon: Bell },
    ];

    const allLabels = Array.from(new Set(notes.flatMap(n => n.labels || []))).sort();

    return (
        <div className="flex-1 flex flex-col h-full bg-white text-gray-900 overflow-hidden font-sans">
            {/* Top Bar */}
            <header className="h-16 border-b border-gray-200 flex items-center px-4 shrink-0 gap-4 bg-white">
                <div className="flex-1 max-w-2xl relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600">
                        <Search size={20} />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-100 border-none rounded-lg py-3 pl-12 pr-4 text-base focus:bg-white focus:shadow-md outline-none transition-all placeholder-gray-500 text-gray-900"
                    />
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    <button 
                        onClick={() => setActiveFilter(activeFilter === 'trash' ? 'notes' : 'trash')}
                        className={`p-3 rounded-full transition-all duration-200 ${
                            activeFilter === 'trash' 
                                ? 'bg-red-50 text-red-600 shadow-inner' 
                                : 'hover:bg-gray-100 text-gray-600'
                        }`}
                        title="Trash"
                    >
                        <Trash2 size={22} />
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar removed as per request */}

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 hide-scroll flex flex-col items-center bg-white">
                    {/* Note Input */}
                    {activeFilter === 'notes' && (
                        <div className="w-full max-w-xl mb-12 mt-4" ref={containerRef}>
                            <div className={`bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-all duration-200 ${isAdding ? 'shadow-lg' : ''}`}>
                                <AnimatePresence mode="wait">
                                    {!isAdding ? (
                                        <motion.div 
                                            key="collapsed"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.1 }}
                                            onClick={() => setIsAdding(true)}
                                            className="px-4 py-3 flex items-center justify-between cursor-text text-gray-500"
                                        >
                                            <span className="text-base font-medium">Take a note...</span>
                                            <div className="flex items-center gap-2">
                                                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><CheckSquare size={20} /></button>
                                                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Pencil size={20} /></button>
                                                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ImageIcon size={20} /></button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div 
                                            key="expanded"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.1, ease: "easeOut" }}
                                            className={`flex flex-col ${newNote.color}`}
                                        >
                                            <div className="flex items-center px-4 py-2">
                                                <input 
                                                    type="text" 
                                                    placeholder="Title"
                                                    value={newNote.title}
                                                    onChange={e => setNewNote({ ...newNote, title: e.target.value })}
                                                    className="flex-1 bg-transparent border-none outline-none text-lg font-medium placeholder-gray-500 py-2 text-gray-900"
                                                    autoFocus
                                                />
                                                <button className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-500">
                                                    <Pin size={20} />
                                                </button>
                                            </div>
                                            <textarea 
                                                ref={inputRef}
                                                placeholder="Take a note..."
                                                value={newNote.content}
                                                onChange={e => setNewNote({ ...newNote, content: e.target.value })}
                                                className="px-4 py-2 bg-transparent border-none outline-none text-base placeholder-gray-500 resize-none min-h-[100px] text-gray-900"
                                            />
                                            <div className="px-4 py-2 flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                    <div className="relative group/colors">
                                                        <button className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-500" title="Background options"><Palette size={18} /></button>
                                                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover/colors:flex bg-white border border-gray-200 p-2 rounded-lg shadow-xl z-50 gap-1 flex-wrap w-32">
                                                            {COLORS.map(c => (
                                                                <button 
                                                                    key={c.value}
                                                                    onClick={() => setNewNote({ ...newNote, color: c.value })}
                                                                    className={`w-6 h-6 rounded-full border border-gray-200 ${c.value} hover:border-gray-400 transition-all`}
                                                                    title={c.name}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={handleAddNote}
                                                    className="px-6 py-2 hover:bg-black/5 rounded-lg text-sm font-bold transition-all text-gray-700"
                                                >
                                                    Save Note
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {/* Note Grid */}
                    <div className="w-full max-w-7xl px-4">
                        {pinnedNotes.length > 0 && (
                            <div className="mb-8">
                                <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4 ml-2">Pinned</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    <AnimatePresence>
                                        {pinnedNotes.map(note => (
                                            <NoteCard 
                                                key={note.id} 
                                                note={note} 
                                                onTogglePin={togglePin}
                                                onArchive={archiveNote}
                                                onTrash={moveToTrash}
                                                onDelete={deletePermanently}
                                                onRestore={restoreFromTrash}
                                                onColorChange={updateColor}
                                                onToggleReminder={toggleReminder}
                                                onAddLabel={addLabel}
                                                onCopy={makeCopy}
                                                onEdit={() => setEditingNote(note)}
                                                isTrash={activeFilter === 'trash'}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}

                        {pinnedNotes.length > 0 && otherNotes.length > 0 && (
                            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4 ml-2">Others</h4>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            <AnimatePresence>
                                {otherNotes.map(note => (
                                    <NoteCard 
                                        key={note.id} 
                                        note={note} 
                                        onTogglePin={togglePin}
                                        onArchive={archiveNote}
                                        onTrash={moveToTrash}
                                        onDelete={deletePermanently}
                                        onRestore={restoreFromTrash}
                                        onColorChange={updateColor}
                                        onToggleReminder={toggleReminder}
                                        onAddLabel={addLabel}
                                        onCopy={makeCopy}
                                        onEdit={() => setEditingNote(note)}
                                        isTrash={activeFilter === 'trash'}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>

                        {filteredNotes.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                    {activeFilter === 'notes' ? <Lightbulb size={48} className="opacity-20" /> : 
                                     activeFilter === 'archive' ? <Archive size={48} className="opacity-20" /> :
                                     <Trash2 size={48} className="opacity-20" />}
                                </div>
                                <p className="text-xl font-medium">
                                    {activeFilter === 'notes' ? 'Notes you add appear here' : 
                                     activeFilter === 'archive' ? 'Your archived notes appear here' :
                                     'No notes in Trash'}
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingNote && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                        <motion.div 
                            ref={editContainerRef}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`w-full max-w-xl rounded-lg shadow-2xl overflow-hidden border border-gray-200 ${editingNote.color || 'bg-white'}`}
                        >
                            <div className="flex items-center px-4 py-2">
                                <input 
                                    type="text" 
                                    placeholder="Title"
                                    value={editingNote.title || ''}
                                    onChange={e => setEditingNote({ ...editingNote, title: e.target.value })}
                                    className="flex-1 bg-transparent border-none outline-none text-lg font-medium placeholder-gray-500 py-2 text-gray-900"
                                />
                                <button 
                                    onClick={() => togglePin(editingNote.id, !!editingNote.isPinned)}
                                    className={`p-2 hover:bg-black/5 rounded-full transition-colors ${editingNote.isPinned ? 'text-yellow-600' : 'text-gray-500'}`}
                                >
                                    <Pin size={20} fill={editingNote.isPinned ? "currentColor" : "none"} />
                                </button>
                            </div>
                            <textarea 
                                placeholder="Take a note..."
                                value={editingNote.content}
                                onChange={e => setEditingNote({ ...editingNote, content: e.target.value })}
                                className="px-4 py-2 bg-transparent border-none outline-none text-base placeholder-gray-500 resize-none min-h-[200px] text-gray-900 w-full"
                            />
                            <div className="px-4 py-2 flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    <div className="relative group/colors">
                                        <button className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-500" title="Background options"><Palette size={18} /></button>
                                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover/colors:flex bg-white border border-gray-200 p-2 rounded-lg shadow-xl z-50 gap-1 flex-wrap w-32">
                                            {COLORS.map(c => (
                                                <button 
                                                    key={c.value}
                                                    onClick={() => setEditingNote({ ...editingNote, color: c.value })}
                                                    className={`w-6 h-6 rounded-full border border-gray-200 ${c.value} hover:border-gray-400 transition-all`}
                                                    title={c.name}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            moveToTrash(editingNote.id);
                                            setEditingNote(null);
                                        }}
                                        className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-500" 
                                        title="Delete note"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <button 
                                    onClick={handleUpdateNote}
                                    className="px-6 py-2 hover:bg-black/5 rounded-lg text-sm font-bold transition-all text-gray-700"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

interface NoteCardProps {
    note: Note;
    onTogglePin: (id: string, current: boolean) => void;
    onArchive: (id: string, current: boolean) => void;
    onTrash: (id: string) => void;
    onDelete: (id: string) => void;
    onRestore: (id: string) => void;
    onColorChange: (id: string, color: string) => void;
    onToggleReminder: (id: string, current: boolean) => void;
    onAddLabel: (id: string) => void;
    onCopy: (id: string) => void;
    onEdit: () => void;
    isTrash?: boolean;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onTogglePin, onArchive, onTrash, onDelete, onRestore, onColorChange, onToggleReminder, onAddLabel, onCopy, onEdit, isTrash }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`group relative flex flex-col rounded-lg border border-gray-200 p-4 transition-all hover:shadow-md ${note.color || 'bg-white'}`}
        >
            <div className="flex items-start justify-between mb-2">
                <h3 className="text-base font-medium text-gray-900 leading-tight pr-6">{note.title}</h3>
                {!isTrash && (
                    <button 
                        onClick={() => onTogglePin(note.id, !!note.isPinned)}
                        className={`absolute top-2 right-2 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 hover:bg-black/5 ${note.isPinned ? 'opacity-100 text-yellow-600' : 'text-gray-400'}`}
                    >
                        <Pin size={18} fill={note.isPinned ? "currentColor" : "none"} />
                    </button>
                )}
            </div>
            
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed mb-4 flex-1">
                {note.content}
            </p>

            {note.labels && note.labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                    {note.labels.map(label => (
                        <span key={label} className="px-2 py-0.5 bg-black/5 rounded-full text-[10px] font-medium text-gray-600">
                            {label}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-0.5">
                    {!isTrash ? (
                        <>
                            <div className="relative group/colors">
                                <button className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-500" title="Background options"><Palette size={16} /></button>
                                <div className="absolute bottom-full left-0 mb-2 hidden group-hover/colors:flex bg-white border border-gray-200 p-2 rounded-lg shadow-xl z-50 gap-1 flex-wrap w-32">
                                    {COLORS.map(c => (
                                        <button 
                                            key={c.value}
                                            onClick={() => onColorChange(note.id, c.value)}
                                            className={`w-6 h-6 rounded-full border border-gray-200 ${c.value} hover:border-gray-400 transition-all`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <button 
                                onClick={onEdit}
                                className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-500" 
                                title="Edit note"
                            >
                                <Pencil size={16} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                onClick={() => onDelete(note.id)}
                                className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-500" 
                                title="Delete permanently"
                            >
                                <Trash2 size={16} />
                            </button>
                            <button 
                                onClick={() => onRestore(note.id)}
                                className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-500" 
                                title="Restore"
                            >
                                <RotateCw size={16} />
                            </button>
                        </>
                    )}
                </div>
            </div>
            
            {/* Selection Checkmark */}
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-2 border-gray-200 shadow-md">
                <Check size={14} />
            </div>
        </motion.div>
    );
};

export default NotesView;

