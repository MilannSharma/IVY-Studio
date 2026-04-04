import React, { useState, useRef, useEffect } from 'react';
import { 
    MessageSquare, 
    Send, 
    Bot, 
    User, 
    Sparkles, 
    X, 
    Minus, 
    Maximize2, 
    History, 
    Plus, 
    Check, 
    Loader2, 
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

const FloatingAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { 
            role: 'assistant', 
            content: "Hello! I'm **IVY Bot**, your interactive system operator. How can I assist you today?",
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
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen, activeAction]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            
            const systemPrompt = `You are IVY Bot, an advanced AI assistant integrated inside an ERP + Design Studio platform. Your role is NOT just to chat, but to understand, act, confirm, and execute tasks directly inside the system UI on behalf of the vendor (user).

            🎯 CORE BEHAVIOR
            - Be highly interactive, clear, and action-oriented.
            - Always break tasks into steps.
            - Before performing any system action, confirm with the user.
            - After confirmation, execute step-by-step and show live progress.
            - Never assume — always validate user intent.

            ⚙️ ACTION MODE
            When a user gives a command that requires system interaction:
            1. Preview Plan: Show what you will do and steps involved. Ask for confirmation.
            2. Execution Mode: Break into steps.
            3. Step-by-Step Confirmation: For critical actions, pause and ask.
            4. Completion Summary: Show results clearly.

            🎨 INTERACTION STYLE
            - Use clean formatting.
            - Use minimal emojis (✅ ⚠️).

            If the user asks for something that sounds like an action, respond with a plan and ask for confirmation.
            Example:
            "I will:
            1. Search for client 'ABC School'
            2. Open their first project
            
            ✅ Confirm to proceed?"`;

            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: userMessage,
                config: {
                    systemInstruction: systemPrompt,
                },
            });

            const assistantMessage = response.text || "I'm sorry, I couldn't generate a response.";
            
            if (assistantMessage.toLowerCase().includes('confirm to proceed') || assistantMessage.includes('✅')) {
                setCurrentMode('confirmation');
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
                        content: "✅ **Task Completed Successfully**\n\nAll steps have been executed.",
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
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-[450px] h-[calc(100vh-120px)] bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-gray-100 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-white border-b border-gray-100 p-6 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="relative px-2 py-0.5 backdrop-blur-md bg-[#0e30f1]/10 border border-[#0e30f1]/20 rounded-lg flex items-center font-black text-lg tracking-tighter">
                                    <span className="text-[#0e30f1]">I</span>
                                    <span className="text-orange-500">V</span>
                                    <span className="text-purple-800">Y</span>
                                </div>
                                <div className="h-4 w-px bg-gray-200" />
                                <div className="flex items-center gap-1.5">
                                    <Bot size={16} className="text-[#0e30f1]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Bot Operator</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={handleNewChat} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-[#0e30f1]" title="New Chat">
                                    <Plus size={18} />
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-red-500">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className={`flex-1 overflow-y-auto p-6 space-y-6 hide-scroll bg-[#fafbfd] transition-all duration-500 ${activeAction ? 'pb-32' : ''}`}>
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-sm ${
                                            msg.role === 'user' ? 'bg-[#0e30f1] text-white' : 'bg-white border border-gray-200 text-[#0e30f1]'
                                        }`}>
                                            {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className={`p-4 rounded-2xl shadow-sm text-sm ${
                                                msg.role === 'user' 
                                                    ? 'bg-[#0e30f1] text-white rounded-tr-none' 
                                                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                                            }`}>
                                                <div className="prose prose-xs max-w-none prose-p:leading-relaxed prose-headings:text-inherit prose-strong:text-inherit">
                                                    <Markdown>{msg.content}</Markdown>
                                                </div>

                                                {msg.mode === 'confirmation' && !activeAction && (
                                                    <div className="mt-4 flex items-center gap-2">
                                                        <button 
                                                            onClick={() => startExecution(msg.steps || [])}
                                                            className="flex-1 py-2 bg-[#0e30f1] text-white rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                                                        >
                                                            <Check size={14} />
                                                            Execute
                                                        </button>
                                                        <button 
                                                            onClick={() => setMessages(prev => [...prev, { role: 'assistant', content: "Cancelled.", mode: 'chat' }])}
                                                            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold text-[10px] uppercase tracking-wider hover:bg-gray-200 transition-all"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <p className={`text-[9px] font-bold uppercase tracking-widest text-gray-400 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                                {msg.role === 'user' ? 'You' : 'IVY Bot'}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="flex gap-3 items-center">
                                        <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#0e30f1] shadow-sm">
                                            <Bot size={14} className="animate-pulse" />
                                        </div>
                                        <div className="flex gap-1">
                                            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-[#0e30f1] rounded-full" />
                                            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-[#0e30f1] rounded-full" />
                                            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-[#0e30f1] rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Bottom Action Bar (Execution Mode) */}
                        <AnimatePresence>
                            {activeAction && (
                                <motion.div 
                                    initial={{ y: 100 }}
                                    animate={{ y: 0 }}
                                    exit={{ y: 100 }}
                                    className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20 p-4"
                                >
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Loader2 size={14} className="animate-spin text-[#0e30f1]" />
                                                <p className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">Bot is working...</p>
                                            </div>
                                            <p className="text-[9px] font-black text-blue-600">Step {activeAction.currentStep}/{activeAction.steps.length}</p>
                                        </div>
                                        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(activeAction.currentStep / activeAction.steps.length) * 100}%` }}
                                                className="h-full bg-[#0e30f1]"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] text-gray-500 truncate font-medium flex-1">
                                                {activeAction.steps[activeAction.currentStep - 1] || 'Initializing...'}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setActiveAction(null)} className="p-1.5 bg-red-50 text-red-600 rounded-lg">
                                                    <X size={12} />
                                                </button>
                                                <button className="px-3 py-1 bg-[#0e30f1] text-white rounded-lg text-[9px] font-bold uppercase tracking-wider">
                                                    Confirm
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Input Area */}
                        <div className={`p-6 bg-white border-t border-gray-100 transition-all duration-500 ${activeAction ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-[#0e30f1] to-purple-600 rounded-2xl blur opacity-0 group-focus-within:opacity-10 transition duration-500" />
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type a command..."
                                    className="w-full pl-5 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#0e30f1]/20 focus:border-[#0e30f1] outline-none transition-all relative z-10"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className={`absolute right-1.5 top-1.5 bottom-1.5 w-10 rounded-xl flex items-center justify-center transition-all z-20 ${
                                        input.trim() && !isLoading 
                                            ? 'bg-[#0e30f1] text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700' 
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                            <div className="flex items-center justify-center gap-4 mt-3">
                                <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                    <Sparkles size={10} className="text-blue-500" />
                                    Interactive Mode
                                </div>
                                <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                    <AlertCircle size={10} className="text-orange-500" />
                                    Safety Guard
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(14,48,241,0.3)] transition-all duration-300 relative ${
                    isOpen ? 'bg-white text-[#0e30f1] rotate-90' : 'bg-[#0e30f1] text-white'
                }`}
            >
                {isOpen ? <X size={28} /> : (
                    <div className="relative">
                        <Bot size={32} />
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0e30f1]" 
                        />
                    </div>
                )}
            </motion.button>
        </div>
    );
};

export default FloatingAssistant;
