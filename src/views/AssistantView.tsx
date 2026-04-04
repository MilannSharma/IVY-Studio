import React, { useState, useRef, useEffect } from 'react';
import { 
    MessageSquare, 
    Send, 
    Bot, 
    User, 
    Sparkles, 
    History, 
    Plus, 
    X, 
    Check, 
    Loader2, 
    ChevronRight,
    Terminal,
    AlertCircle
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

type BotMode = 'chat' | 'action' | 'confirmation' | 'log';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    mode?: BotMode;
    steps?: string[];
    currentStep?: number;
    logs?: string[];
}

const AssistantView: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { 
            role: 'assistant', 
            content: "Hello! I'm **IVY Bot**, your interactive system operator. I can help you manage projects, scan data, and execute tasks directly. How can I assist you today?",
            mode: 'chat'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentMode, setCurrentMode] = useState<BotMode>('chat');
    const [activeAction, setActiveAction] = useState<{
        title: string;
        steps: string[];
        currentStep: number;
        logs: string[];
    } | null>(null);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, activeAction]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            
            // System prompt as requested
            const systemPrompt = `You are IVY Bot, an advanced AI assistant integrated inside an ERP + Design Studio platform. Your role is NOT just to chat, but to understand, act, confirm, and execute tasks directly inside the system UI on behalf of the vendor (user).

            🎯 CORE BEHAVIOR
            - Be highly interactive, clear, and action-oriented.
            - Always break tasks into steps.
            - Before performing any system action, confirm with the user.
            - After confirmation, execute step-by-step and show live progress.
            - Never assume — always validate user intent.

            🧠 UNDERSTANDING USER INTENT
            - Convert natural language into structured actions.
            - Example: "Search this client and check wrong student data" -> 1. Find Client, 2. Open First Project, 3. Scan Student Data, 4. Detect Issues.

            ⚙️ ACTION MODE
            When a user gives a command that requires system interaction:
            1. Preview Plan: Show what you will do and steps involved. Ask for confirmation.
            2. Execution Mode: Break into steps.
            3. Step-by-Step Confirmation: For critical actions, pause and ask.
            4. Completion Summary: Show results clearly.

            🎨 INTERACTION STYLE
            - Use clean formatting (bullets, steps, spacing).
            - Avoid long paragraphs.
            - Use minimal emojis (✅ ⚠️).

            🧩 SUPPORTED ACTION TYPES
            - Search (clients, projects, orders)
            - Open / Navigate screens
            - Validate data (missing, incorrect, mismatch)
            - Auto-fix or suggest fixes
            - Apply templates / rearrange design
            - Generate reports
            - Filter / sort / analyze

            If the user asks for something that sounds like an action, respond with a plan and ask for confirmation.
            Example response for action:
            "I will:
            1. Search for client 'ABC School'
            2. Open their first project
            3. Scan all student records
            
            ✅ Confirm to proceed?"`;

            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: userMessage,
                config: {
                    systemInstruction: systemPrompt,
                },
            });

            const assistantMessage = response.text || "I'm sorry, I couldn't generate a response.";
            
            // Simple heuristic to detect if the bot is proposing an action
            if (assistantMessage.toLowerCase().includes('confirm to proceed') || assistantMessage.includes('✅')) {
                setCurrentMode('confirmation');
                // Extract steps if possible (simulated for now)
                const steps = assistantMessage.split('\n').filter(line => /^\d+\./.test(line.trim())).map(line => line.replace(/^\d+\.\s*/, ''));
                
                setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: assistantMessage,
                    mode: 'confirmation',
                    steps: steps.length > 0 ? steps : ['Analyze request', 'Prepare execution', 'Finalize results']
                }]);
            } else {
                setCurrentMode('chat');
                setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage, mode: 'chat' }]);
            }
        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again.", mode: 'chat' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const startExecution = (steps: string[]) => {
        setCurrentMode('action');
        setActiveAction({
            title: "Executing Task",
            steps: steps,
            currentStep: 0,
            logs: ["Initializing IVY Bot...", "Connecting to system core..."]
        });

        // Simulate step-by-step execution
        let step = 0;
        const interval = setInterval(() => {
            if (step < steps.length) {
                setActiveAction(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        currentStep: step + 1,
                        logs: [...prev.logs, `Completed: ${steps[step]}`, `Starting: ${steps[step + 1] || 'Finalizing...'}`]
                    };
                });
                step++;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    setMessages(prev => [...prev, { 
                        role: 'assistant', 
                        content: "✅ **Task Completed Successfully**\n\nAll steps have been executed. What would you like to do next?",
                        mode: 'chat'
                    }]);
                    setActiveAction(null);
                    setCurrentMode('chat');
                }, 1000);
            }
        }, 2000);
    };

    const handleNewChat = () => {
        setMessages([{ 
            role: 'assistant', 
            content: "New session started. How can I help you today?",
            mode: 'chat'
        }]);
        setActiveAction(null);
        setCurrentMode('chat');
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#fafbfd] overflow-hidden relative">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="relative px-3 py-1 backdrop-blur-md bg-[#0e30f1]/10 border border-[#0e30f1]/20 rounded-xl flex items-center font-black text-xl tracking-tighter shadow-sm">
                        <span className="text-[#0e30f1]">I</span>
                        <span className="text-orange-500">V</span>
                        <span className="text-purple-800">Y</span>
                    </div>
                    <div className="h-6 w-px bg-gray-200 mx-1" />
                    <div className="flex items-center gap-2">
                        <Bot size={20} className="text-[#0e30f1]" />
                        <h1 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Bot Operator</h1>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => {}} 
                        className="flex items-center gap-2 px-3 py-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all text-xs font-bold uppercase tracking-wider"
                    >
                        <History size={16} />
                        History
                    </button>
                    <button 
                        onClick={handleNewChat}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#0e30f1] text-white rounded-lg hover:bg-blue-700 transition-all text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-500/20"
                    >
                        <Plus size={16} />
                        New Chat
                    </button>
                </div>
            </header>

            {/* Chat Area */}
            <div className={`flex-1 overflow-y-auto p-6 space-y-6 hide-scroll transition-all duration-500 ${activeAction ? 'pb-32' : ''}`}>
                <div className="max-w-3xl mx-auto space-y-8">
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                                    msg.role === 'user' ? 'bg-[#0e30f1] text-white' : 'bg-white border border-gray-200 text-[#0e30f1]'
                                }`}>
                                    {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                                </div>
                                <div className="space-y-2">
                                    <div className={`p-5 rounded-2xl shadow-sm ${
                                        msg.role === 'user' 
                                            ? 'bg-[#0e30f1] text-white rounded-tr-none' 
                                            : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                                    }`}>
                                        <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-inherit prose-strong:text-inherit">
                                            <Markdown>{msg.content}</Markdown>
                                        </div>

                                        {msg.mode === 'confirmation' && !activeAction && (
                                            <div className="mt-6 flex items-center gap-3">
                                                <button 
                                                    onClick={() => startExecution(msg.steps || [])}
                                                    className="flex-1 py-2.5 bg-[#0e30f1] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                                                >
                                                    <Check size={16} />
                                                    Confirm & Execute
                                                </button>
                                                <button 
                                                    onClick={() => setMessages(prev => [...prev, { role: 'assistant', content: "Action cancelled. How else can I help?", mode: 'chat' }])}
                                                    className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-200 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest text-gray-400 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                        {msg.role === 'user' ? 'You' : 'IVY Bot'} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex gap-4 items-center">
                                <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#0e30f1] shadow-sm">
                                    <Bot size={18} className="animate-pulse" />
                                </div>
                                <div className="flex gap-1.5">
                                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-[#0e30f1] rounded-full" />
                                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-[#0e30f1] rounded-full" />
                                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-[#0e30f1] rounded-full" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Bottom Action Bar (Execution Mode) */}
            <AnimatePresence>
                {activeAction && (
                    <motion.div 
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20 p-4"
                    >
                        <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#0e30f1] shrink-0">
                                    <Loader2 size={20} className="animate-spin" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">IVY Bot is working...</p>
                                        <p className="text-[10px] font-black text-blue-600">Step {activeAction.currentStep}/{activeAction.steps.length}</p>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(activeAction.currentStep / activeAction.steps.length) * 100}%` }}
                                            className="h-full bg-[#0e30f1]"
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-1 truncate font-medium">
                                        {activeAction.steps[activeAction.currentStep - 1] || 'Initializing...'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                <div className="flex flex-col items-end mr-4 hidden md:flex">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 uppercase tracking-widest">
                                        <Terminal size={10} />
                                        Live Logs
                                    </div>
                                    <p className="text-[9px] text-gray-400 font-mono truncate max-w-[150px]">
                                        {activeAction.logs[activeAction.logs.length - 1]}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setActiveAction(null)}
                                    className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                                    title="Cancel Task"
                                >
                                    <X size={20} />
                                </button>
                                <button 
                                    className="px-6 py-2.5 bg-[#0e30f1] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-blue-700 transition-all"
                                >
                                    <Check size={18} />
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Area */}
            <div className={`p-6 bg-white border-t border-gray-200 transition-all duration-500 ${activeAction ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                <div className="max-w-3xl mx-auto">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#0e30f1] to-purple-600 rounded-2xl blur opacity-0 group-focus-within:opacity-10 transition duration-500" />
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a command (e.g., 'Search client ABC and scan data')..."
                            className="w-full pl-6 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#0e30f1]/20 focus:border-[#0e30f1] outline-none transition-all relative z-10"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className={`absolute right-2 top-2 bottom-2 px-4 rounded-xl flex items-center justify-center transition-all z-20 ${
                                input.trim() && !isLoading 
                                    ? 'bg-[#0e30f1] text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700' 
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-4">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            <Sparkles size={12} className="text-blue-500" />
                            AI Operator Mode
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            <AlertCircle size={12} className="text-orange-500" />
                            Safety Confirmed
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssistantView;
