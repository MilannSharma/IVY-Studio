import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

const AssistantView: React.FC = () => {
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
        { role: 'assistant', content: "Hello! I'm **IVY copilot**. I have access to your account knowledge base. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: userMessage,
                config: {
                    systemInstruction: `You are IVY copilot, the AI assistant for IVY Studio. IVY Studio is a comprehensive ID card printing and management platform. 
                    You help vendors, clients, and admins manage their projects, templates, and data.
                    
                    Knowledge Base:
                    - IVY Studio supports Schools, Colleges, Companies, Coaching, and Events.
                    - It handles data entry, ERP/LMS integrations (like Edunext, Darwinbox), and printable PDF generation.
                    - Key features: Project management, Custom templates, AI Quality checks, Team collaboration.
                    - Current user: Milan Sharma (Vendor Admin).
                    
                    Be helpful, professional, and concise. Always refer to yourself as IVY copilot.`,
                },
            });

            const assistantMessage = response.text || "I'm sorry, I couldn't generate a response.";
            setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#fafbfd] overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0e30f1] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <Bot size={24} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 tracking-tight">IVY copilot</h1>
                        <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                            <Sparkles size={12} className="text-blue-500" />
                            Powered by Gemini AI
                        </p>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scroll">
                <div className="max-w-4xl mx-auto space-y-6">
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                    msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-[#0e30f1]'
                                }`}>
                                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className={`p-4 rounded-2xl shadow-sm ${
                                    msg.role === 'user' 
                                        ? 'bg-[#0e30f1] text-white rounded-tr-none' 
                                        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                                }`}>
                                    <div className="prose prose-sm max-w-none prose-p:leading-relaxed">
                                        <Markdown>{msg.content}</Markdown>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex gap-3 items-center text-gray-400 text-sm font-medium">
                                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[#0e30f1]">
                                    <Bot size={16} />
                                </div>
                                <div className="flex gap-1">
                                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-gray-200">
                <div className="max-w-4xl mx-auto relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask me anything about your projects or account..."
                        className="w-full pl-6 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#0e30f1]/20 focus:border-[#0e30f1] outline-none transition-all"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className={`absolute right-2 top-2 bottom-2 px-4 rounded-xl flex items-center justify-center transition-all ${
                            input.trim() && !isLoading 
                                ? 'bg-[#0e30f1] text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700' 
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <Send size={18} />
                    </button>
                </div>
                <p className="text-center text-[10px] text-gray-400 mt-3 font-medium uppercase tracking-wider">
                    AI can make mistakes. Verify important information.
                </p>
            </div>
        </div>
    );
};

export default AssistantView;
