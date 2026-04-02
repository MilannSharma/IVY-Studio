import React, { useState, useEffect, useRef } from 'react';
import { CheckSquare, Plus, Trash2, Mic, MicOff, Calendar as CalendarIcon, Search, Check, Square } from 'lucide-react';
import { db, auth, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, orderBy, Timestamp, handleFirestoreError, OperationType } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, isSameDay, startOfDay } from 'date-fns';

interface Task {
    id: string;
    title: string;
    date: string;
    completed: boolean;
    createdAt: any;
    userId: string;
}

const TasksView: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (!auth.currentUser) return;

        const q = query(
            collection(db, 'tasks'),
            where('userId', '==', auth.currentUser.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTasks: Task[] = [];
            snapshot.forEach((doc) => {
                fetchedTasks.push({ id: doc.id, ...doc.data() } as Task);
            });
            setTasks(fetchedTasks);
        }, (error) => {
            handleFirestoreError(error, OperationType.GET, 'tasks');
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setNewTaskTitle(prev => prev + ' ' + transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech Recognition Error:", event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const handleAddTask = async () => {
        if (!newTaskTitle.trim() || !auth.currentUser) return;

        try {
            await addDoc(collection(db, 'tasks'), {
                title: newTaskTitle.trim(),
                date: format(selectedDate, 'yyyy-MM-dd'),
                completed: false,
                createdAt: Timestamp.now(),
                userId: auth.currentUser.uid
            });
            setNewTaskTitle('');
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, 'tasks');
        }
    };

    const toggleTask = async (task: Task) => {
        try {
            await updateDoc(doc(db, 'tasks', task.id), {
                completed: !task.completed
            });
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `tasks/${task.id}`);
        }
    };

    const handleDeleteTask = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'tasks', id));
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `tasks/${id}`);
        }
    };

    const tasksForSelectedDate = tasks.filter(task => 
        task.date === format(selectedDate, 'yyyy-MM-dd')
    );

    const hasTasksOnDate = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return tasks.some(task => task.date === dateStr);
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#fafbfd] overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0e30f1] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <CheckSquare size={24} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 tracking-tight">Daily Tasks</h1>
                        <p className="text-xs text-gray-500 font-medium">Stay organized and track your progress.</p>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 hide-scroll">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Col: Calendar */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm overflow-hidden">
                            <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <CalendarIcon size={18} className="text-[#0e30f1]" />
                                Select Date
                            </h3>
                            <div className="custom-calendar-wrapper">
                                <Calendar
                                    onChange={(val) => setSelectedDate(val as Date)}
                                    value={selectedDate}
                                    tileContent={({ date, view }) => {
                                        if (view === 'month' && hasTasksOnDate(date)) {
                                            return <div className="w-1 h-1 bg-[#0e30f1] rounded-full mx-auto mt-1" />;
                                        }
                                        return null;
                                    }}
                                    className="w-full border-none font-sans"
                                />
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                            <h4 className="text-sm font-bold text-blue-900 mb-2">Pro Tip</h4>
                            <p className="text-xs text-blue-800 leading-relaxed">
                                Use the microphone icon to add tasks using your voice. It's faster and helps you capture ideas on the go!
                            </p>
                        </div>
                    </div>

                    {/* Right Col: Tasks */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        {/* Add Task Area */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder={`Add task for ${format(selectedDate, 'MMM dd, yyyy')}...`}
                                        value={newTaskTitle}
                                        onChange={e => setNewTaskTitle(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                                        className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0e30f1]/20 focus:border-[#0e30f1] outline-none transition-all"
                                    />
                                    <button
                                        onClick={toggleListening}
                                        className={`absolute right-2 top-2 bottom-2 px-3 rounded-lg flex items-center justify-center transition-all ${
                                            isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                                        }`}
                                        title={isListening ? 'Stop Listening' : 'Voice Input'}
                                    >
                                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                                    </button>
                                </div>
                                <button
                                    onClick={handleAddTask}
                                    disabled={!newTaskTitle.trim()}
                                    className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                                        newTaskTitle.trim() 
                                            ? 'bg-[#0e30f1] text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700' 
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Tasks List */}
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-bold text-gray-900">
                                    Tasks for {format(selectedDate, 'MMMM dd, yyyy')}
                                </h3>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    {tasksForSelectedDate.length} Tasks
                                </span>
                            </div>

                            <AnimatePresence mode="popLayout">
                                {tasksForSelectedDate.length > 0 ? (
                                    tasksForSelectedDate.map((task) => (
                                        <motion.div
                                            key={task.id}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className={`flex items-center gap-4 p-4 bg-white border rounded-2xl shadow-sm group transition-all ${
                                                task.completed ? 'border-gray-100 opacity-60' : 'border-gray-100 hover:border-blue-100 hover:shadow-md'
                                            }`}
                                        >
                                            <button
                                                onClick={() => toggleTask(task)}
                                                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                                    task.completed 
                                                        ? 'bg-green-500 border-green-500 text-white' 
                                                        : 'border-gray-200 hover:border-[#0e30f1] text-transparent'
                                                }`}
                                            >
                                                <Check size={14} />
                                            </button>
                                            <span className={`flex-1 text-sm font-medium transition-all ${
                                                task.completed ? 'text-gray-400 line-through' : 'text-gray-700'
                                            }`}>
                                                {task.title}
                                            </span>
                                            <button
                                                onClick={() => handleDeleteTask(task.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center bg-white border border-dashed border-gray-200 rounded-2xl">
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-3">
                                            <CheckSquare size={24} />
                                        </div>
                                        <p className="text-sm text-gray-500">No tasks for this date.</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-calendar-wrapper .react-calendar {
                    border: none;
                    width: 100%;
                }
                .custom-calendar-wrapper .react-calendar__tile--active {
                    background: #0e30f1 !important;
                    color: white !important;
                    border-radius: 12px;
                }
                .custom-calendar-wrapper .react-calendar__tile--now {
                    background: #eff6ff;
                    border-radius: 12px;
                    color: #0e30f1;
                    font-weight: bold;
                }
                .custom-calendar-wrapper .react-calendar__tile:hover {
                    border-radius: 12px;
                }
                .custom-calendar-wrapper .react-calendar__navigation button:hover {
                    background-color: #f8fafc;
                    border-radius: 8px;
                }
            `}</style>
        </div>
    );
};

export default TasksView;
