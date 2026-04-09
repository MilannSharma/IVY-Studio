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
    AlertCircle,
    Mic,
    MicOff
} from 'lucide-react';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import ChatForm from '../components/ChatForm';

type BotMode = 'chat' | 'action' | 'confirmation' | 'log' | 'form';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    mode?: BotMode;
    steps?: string[];
    currentStep?: number;
    logs?: string[];
    action?: {
        name: string;
        args: any;
    };
    form?: {
        type: 'client' | 'project';
        initialData: any;
    };
}

interface AssistantViewProps {
    onNavigate?: (tabId: string) => void;
    onOpenProject?: (project: any) => void;
    onOpenClient?: (client: any) => void;
    onCreateClient?: (clientData: any) => Promise<string>;
    onCreateProject?: (projectData: any) => Promise<string>;
    onAddNote?: (noteData: any) => Promise<string>;
    onUpdateProjectStatus?: (projectId: string, status: string) => Promise<void>;
    onRecordTransaction?: (transactionData: any) => Promise<string>;
}

const AssistantView: React.FC<AssistantViewProps> = ({ 
    onNavigate, 
    onOpenProject, 
    onOpenClient, 
    onCreateClient, 
    onCreateProject,
    onAddNote,
    onUpdateProjectStatus,
    onRecordTransaction
}) => {
    const [messages, setMessages] = useState<Message[]>([
        { 
            role: 'assistant', 
            content: "Hello! I'm **IVY Bot**, your interactive system operator. I can help you navigate the platform, manage projects, and execute tasks. How can I assist you today?",
            mode: 'chat'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const [interimTranscript, setInterimTranscript] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const recognitionRef = useRef<any>(null);
    const [currentMode, setCurrentMode] = useState<BotMode>('chat');
    const [activeAction, setActiveAction] = useState<{
        title: string;
        steps: string[];
        currentStep: number;
        logs: string[];
        execute: () => void;
    } | null>(null);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, activeAction]);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setIsSupported(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = navigator.language || 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[event.results.length - 1][0].transcript;
            if (event.results[event.results.length - 1].isFinal) {
                setInput(prev => (prev + ' ' + transcript).trim());
                setInterimTranscript('');
            } else {
                setInterimTranscript(transcript);
            }
        };

        recognition.onerror = (event: any) => {
            console.error("Speech Recognition Error:", event.error);
            setIsListening(false);
            setInterimTranscript('');
        };

        recognition.onend = () => {
            setIsListening(false);
            setInterimTranscript('');
        };

        recognitionRef.current = recognition;
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            
            const navigateToFn: FunctionDeclaration = {
                name: "navigateTo",
                parameters: {
                    type: Type.OBJECT,
                    description: "Navigate to a specific page or tab in the application.",
                    properties: {
                        tabId: {
                            type: Type.STRING,
                            description: "The ID of the tab to navigate to. Available tabs: overview, projects, project-tasks, print-orders, client-orders, transactions, sales-revenue, profit-margin, client-dues, expected-orders, items-rates, clients, team, complaints, whatsapp, notes, settings, ai-insights, templates, documents.",
                        },
                        label: {
                            type: Type.STRING,
                            description: "A user-friendly label for the page (e.g., 'Project Management').",
                        }
                    },
                    required: ["tabId"],
                },
            };

            const openProjectFn: FunctionDeclaration = {
                name: "openProject",
                parameters: {
                    type: Type.OBJECT,
                    description: "Open a specific project to see its details.",
                    properties: {
                        projectId: {
                            type: Type.STRING,
                            description: "The ID of the project to open.",
                        },
                        projectName: {
                            type: Type.STRING,
                            description: "The name of the project.",
                        }
                    },
                    required: ["projectId"],
                },
            };

            const openClientFn: FunctionDeclaration = {
                name: "openClient",
                parameters: {
                    type: Type.OBJECT,
                    description: "Open a specific client to see their profile and projects.",
                    properties: {
                        clientId: {
                            type: Type.STRING,
                            description: "The ID of the client to open.",
                        },
                        clientName: {
                            type: Type.STRING,
                            description: "The name of the client.",
                        }
                    },
                    required: ["clientId"],
                },
            };

            const createClientFn: FunctionDeclaration = {
                name: "createClient",
                parameters: {
                    type: Type.OBJECT,
                    description: "Create a new client in the system.",
                    properties: {
                        name: { type: Type.STRING, description: "Full name of the client or company." },
                        email: { type: Type.STRING, description: "Email address of the client." },
                        phone: { type: Type.STRING, description: "Phone number." },
                        type: { type: Type.STRING, description: "Type of client (e.g., School, Company, Individual)." },
                        contact: { type: Type.STRING, description: "Primary contact person name." }
                    },
                    required: ["name", "email"],
                },
            };

            const createProjectFn: FunctionDeclaration = {
                name: "createProject",
                parameters: {
                    type: Type.OBJECT,
                    description: "Create a new project in the system.",
                    properties: {
                        name: { type: Type.STRING, description: "Name of the project." },
                        client: { type: Type.STRING, description: "Name of the client for this project." },
                        type: { type: Type.STRING, description: "Type of project (e.g., School, College, Company)." },
                        description: { type: Type.STRING, description: "Brief description of the project." }
                    },
                    required: ["name", "client"],
                },
            };

            const addNoteFn: FunctionDeclaration = {
                name: "addNote",
                parameters: {
                    type: Type.OBJECT,
                    description: "Add a new note to the system.",
                    properties: {
                        title: { type: Type.STRING, description: "Title of the note." },
                        content: { type: Type.STRING, description: "Content/body of the note." },
                        color: { type: Type.STRING, description: "Background color (e.g., bg-white, bg-red-100, etc.)." }
                    },
                    required: ["content"],
                },
            };

            const updateProjectStatusFn: FunctionDeclaration = {
                name: "updateProjectStatus",
                parameters: {
                    type: Type.OBJECT,
                    description: "Update the status of an existing project.",
                    properties: {
                        projectId: { type: Type.STRING, description: "The ID of the project." },
                        status: { type: Type.STRING, enum: ["pending", "ongoing", "completed"], description: "The new status." }
                    },
                    required: ["projectId", "status"],
                },
            };

            const recordTransactionFn: FunctionDeclaration = {
                name: "recordTransaction",
                parameters: {
                    type: Type.OBJECT,
                    description: "Record a new financial transaction.",
                    properties: {
                        type: { type: Type.STRING, enum: ["Income", "Expense"], description: "Type of transaction." },
                        amount: { type: Type.NUMBER, description: "The amount of money." },
                        category: { type: Type.STRING, description: "Category (e.g., Sales, Rent, Salary)." },
                        description: { type: Type.STRING, description: "Brief description." }
                    },
                    required: ["type", "amount", "category"],
                },
            };

            const showFormFn: FunctionDeclaration = {
                name: "showForm",
                parameters: {
                    type: Type.OBJECT,
                    description: "Display a structured form in the chat for the user to fill out before creating a client or project.",
                    properties: {
                        formType: { 
                            type: Type.STRING, 
                            enum: ["client", "project"], 
                            description: "The type of form to display." 
                        },
                        initialData: { 
                            type: Type.OBJECT, 
                            description: "Any data already provided by the user in natural language." 
                        }
                    },
                    required: ["formType"],
                },
            };

            const systemPrompt = `You are IVY Bot, the central AI intelligence of the IVY ERP + Design Studio platform. You are highly interactive, action-oriented, and act as a "buddy" to the vendor (user).

            🚀 PROJECT KNOWLEDGE (TRAINING)
            IVY is a comprehensive business management system with the following modules:
            - **Overview**: Dashboard with revenue charts and project status.
            - **Projects**: Manage ongoing and completed projects.
            - **Clients**: Manage client profiles, wallets, and addresses.
            - **Notes**: Google Keep-style note-taking.
            - **Templates**: Pre-defined project structures.
            - **AI Insights**: Advanced business analytics.
            - **Team**: Manage staff and roles.
            - **Transactions**: Financial ledger for income/expenses.
            - **Print Orders**: Specialized manufacturing tracking.
            - **Documents**: Centralized file storage.
            - **WhatsApp**: Direct messaging integration.

            🎯 CORE BEHAVIOR
            - Be highly interactive, clear, and action-oriented.
            - Always break tasks into steps.
            - Before performing any system action (create, update, delete), confirm with the user.
            - After confirmation, execute step-by-step and show live progress.
            - Never assume — always validate user intent.
            
            📝 FORM WORKFLOW (CRITICAL)
            When a user wants to create a client or project:
            1. DO NOT ask for fields in plain text.
            2. Use the 'showForm' tool to present a structured form in the chat.
            3. Populate 'initialData' with any info the user already mentioned.
            4. After the user fills the form, you will receive the data.
            5. Summarize the data and ask for final confirmation before executing.

            🌍 MULTILINGUAL SUPPORT
            - You can understand and respond in multiple languages (Hindi, English, etc.).
            - If the user speaks Hindi, respond in Hindi but keep technical terms or action names clear.
            - Example: "मैं आपके लिए Milan Sharma का नया क्लाइंट प्रोफाइल तैयार कर रहा हूँ। ✅ क्या मैं आगे बढ़ूँ?"

            🧠 UNDERSTANDING USER INTENT
            - Convert natural language into structured actions.
            - If the user wants to see a page, use the 'navigateTo' tool.
            - If the user wants to see a specific project, use 'openProject'.
            - If the user wants to see a specific client, use 'openClient'.
            - If the user wants to create a client or project, ALWAYS start by calling 'showForm'.
            - If the user wants to take a note, use 'addNote'.
            - If the user wants to update a project status, use 'updateProjectStatus'.
            - If the user wants to record a transaction, use 'recordTransaction'.

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

            If you use a tool, also provide a text response explaining what you are about to do.`;

            const chatHistory = messages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));

            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: [...chatHistory, { role: 'user', parts: [{ text: userMessage }] }],
                config: {
                    systemInstruction: systemPrompt,
                    tools: [{ functionDeclarations: [navigateToFn, openProjectFn, openClientFn, createClientFn, createProjectFn, showFormFn, addNoteFn, updateProjectStatusFn, recordTransactionFn] }],
                },
            });

            const assistantMessage = response.text || "I'm processing your request...";
            const functionCalls = response.functionCalls;

            if (functionCalls && functionCalls.length > 0) {
                const call = functionCalls[0];
                if (call.name === 'navigateTo') {
                    const { tabId, label } = call.args as any;
                    setCurrentMode('confirmation');
                    setMessages(prev => [...prev, { 
                        role: 'assistant', 
                        content: assistantMessage || `I will navigate you to the **${label || tabId}** page. \n\n✅ Confirm to proceed?`,
                        mode: 'confirmation',
                        steps: [`Locating ${label || tabId} module`, `Preparing view transition`, `Updating system state`],
                        action: { name: 'navigateTo', args: { tabId } }
                    }]);
                } else if (call.name === 'openProject') {
                    const { projectId, projectName } = call.args as any;
                    setCurrentMode('confirmation');
                    setMessages(prev => [...prev, { 
                        role: 'assistant', 
                        content: assistantMessage || `I will open the project **${projectName || projectId}** for you. \n\n✅ Confirm to proceed?`,
                        mode: 'confirmation',
                        steps: [`Searching for project ${projectName || projectId}`, `Fetching project details`, `Opening project view`],
                        action: { name: 'openProject', args: { projectId, projectName } }
                    }]);
                } else if (call.name === 'openClient') {
                    const { clientId, clientName } = call.args as any;
                    setCurrentMode('confirmation');
                    setMessages(prev => [...prev, { 
                        role: 'assistant', 
                        content: assistantMessage || `I will open the client profile for **${clientName || clientId}**. \n\n✅ Confirm to proceed?`,
                        mode: 'confirmation',
                        steps: [`Searching for client ${clientName || clientId}`, `Fetching client data`, `Opening client profile`],
                        action: { name: 'openClient', args: { clientId, clientName } }
                    }]);
                } else if (call.name === 'createClient') {
                    const clientData = call.args as any;
                    setCurrentMode('confirmation');
                    setMessages(prev => [...prev, { 
                        role: 'assistant', 
                        content: assistantMessage || `I will create a new client profile for **${clientData.name}**. \n\n✅ Confirm to proceed?`,
                        mode: 'confirmation',
                        steps: [`Validating client data`, `Connecting to database`, `Creating client record`, `Finalizing profile`],
                        action: { name: 'createClient', args: clientData }
                    }]);
                } else if (call.name === 'createProject') {
                    const projectData = call.args as any;
                    setCurrentMode('confirmation');
                    setMessages(prev => [...prev, { 
                        role: 'assistant', 
                        content: assistantMessage || `I will create a new project **${projectData.name}** for client **${projectData.client}**. \n\n✅ Confirm to proceed?`,
                        mode: 'confirmation',
                        steps: [`Validating project details`, `Linking to client ${projectData.client}`, `Initializing project workspace`, `Saving to system`],
                        action: { name: 'createProject', args: projectData }
                    }]);
                } else if (call.name === 'showForm') {
                    const { formType, initialData } = call.args as any;
                    setCurrentMode('form');
                    setMessages(prev => [...prev, { 
                        role: 'assistant', 
                        content: assistantMessage || `Please fill out the details for the new **${formType}** below:`,
                        mode: 'form',
                        form: { type: formType, initialData }
                    }]);
                } else if (call.name === 'addNote') {
                    const noteData = call.args as any;
                    setCurrentMode('confirmation');
                    setMessages(prev => [...prev, { 
                        role: 'assistant', 
                        content: assistantMessage || `I will add a new note for you. \n\n✅ Confirm to proceed?`,
                        mode: 'confirmation',
                        steps: [`Preparing note content`, `Saving to database`, `Updating notes view`],
                        action: { name: 'addNote', args: noteData }
                    }]);
                } else if (call.name === 'updateProjectStatus') {
                    const { projectId, status } = call.args as any;
                    setCurrentMode('confirmation');
                    setMessages(prev => [...prev, { 
                        role: 'assistant', 
                        content: assistantMessage || `I will update the status of project **${projectId}** to **${status}**. \n\n✅ Confirm to proceed?`,
                        mode: 'confirmation',
                        steps: [`Locating project`, `Updating status to ${status}`, `Finalizing changes`],
                        action: { name: 'updateProjectStatus', args: { projectId, status } }
                    }]);
                } else if (call.name === 'recordTransaction') {
                    const transactionData = call.args as any;
                    setCurrentMode('confirmation');
                    setMessages(prev => [...prev, { 
                        role: 'assistant', 
                        content: assistantMessage || `I will record a new **${transactionData.type}** of **₹${transactionData.amount}** in category **${transactionData.category}**. \n\n✅ Confirm to proceed?`,
                        mode: 'confirmation',
                        steps: [`Validating transaction data`, `Calculating balances`, `Recording in ledger`, `Updating financial reports`],
                        action: { name: 'recordTransaction', args: transactionData }
                    }]);
                }
            } else if (assistantMessage.toLowerCase().includes('confirm to proceed') || assistantMessage.includes('✅')) {
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

    const handleFormSubmit = (data: any, type: 'client' | 'project') => {
        setCurrentMode('confirmation');
        const summary = type === 'client' 
            ? `### Client Details Summary\n\n**Name:** ${data.name}\n**Email:** ${data.email}\n**Phone:** ${data.phone}\n**Type:** ${data.type}\n**Contact:** ${data.contact}\n\n✅ **Confirm to create this client?**`
            : `### Project Details Summary\n\n**Project Name:** ${data.name}\n**Client:** ${data.client}\n**Type:** ${data.type}\n**Description:** ${data.description}\n\n✅ **Confirm to start this project?**`;
        
        const steps = type === 'client'
            ? [`Validating client data`, `Connecting to database`, `Creating client record`, `Finalizing profile`]
            : [`Validating project details`, `Linking to client ${data.client}`, `Initializing project workspace`, `Saving to system`];

        const action = type === 'client'
            ? { name: 'createClient', args: data }
            : { name: 'createProject', args: data };

        setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: summary,
            mode: 'confirmation',
            steps,
            action
        }]);
    };

    const startExecution = async (steps: string[], action?: { name: string, args: any }) => {
        setCurrentMode('action');
        const initialLogs = ["Initializing IVY Bot...", "Connecting to system core..."];
        setActiveAction({
            title: "Executing Task",
            steps: steps,
            currentStep: 0,
            logs: initialLogs,
            execute: () => {}
        });

        try {
            // Step 1: Validation
            await new Promise(resolve => setTimeout(resolve, 800));
            setActiveAction(prev => prev ? { ...prev, currentStep: 1, logs: [...prev.logs, "✅ Data validation complete.", "🔍 Checking for duplicates..."] } : null);

            // Step 2: Database Connection
            await new Promise(resolve => setTimeout(resolve, 1000));
            setActiveAction(prev => prev ? { ...prev, currentStep: 2, logs: [...prev.logs, "✅ Database connection established.", "📡 Preparing write operation..."] } : null);

            // Step 3: Execution
            await new Promise(resolve => setTimeout(resolve, 1200));
            let result: any = null;
            if (action) {
                if (action.name === 'navigateTo' && onNavigate) {
                    onNavigate(action.args.tabId);
                } else if (action.name === 'openProject' && onOpenProject) {
                    onOpenProject({ id: action.args.projectId, name: action.args.projectName });
                } else if (action.name === 'openClient' && onOpenClient) {
                    onOpenClient({ id: action.args.clientId, name: action.args.clientName });
                } else if (action.name === 'createClient' && onCreateClient) {
                    result = await onCreateClient(action.args);
                } else if (action.name === 'createProject' && onCreateProject) {
                    result = await onCreateProject(action.args);
                } else if (action.name === 'addNote' && onAddNote) {
                    result = await onAddNote(action.args);
                } else if (action.name === 'updateProjectStatus' && onUpdateProjectStatus) {
                    await onUpdateProjectStatus(action.args.projectId, action.args.status);
                } else if (action.name === 'recordTransaction' && onRecordTransaction) {
                    result = await onRecordTransaction(action.args);
                }
            }
            setActiveAction(prev => prev ? { ...prev, currentStep: 3, logs: [...prev.logs, `✅ Action ${action?.name} executed successfully.`, "💾 Finalizing changes..."] } : null);

            // Step 4: Finalization
            await new Promise(resolve => setTimeout(resolve, 800));
            const successMsg = action?.name === 'createClient' 
                ? `Successfully created client **${action.args.name}**. Profile is now live.`
                : action?.name === 'createProject'
                ? `Successfully created project **${action.args.name}**. Workspace is ready.`
                : action?.name === 'addNote'
                ? `Successfully added your note. You can find it in the Notes section.`
                : action?.name === 'updateProjectStatus'
                ? `Successfully updated project status to **${action.args.status}**.`
                : action?.name === 'recordTransaction'
                ? `Successfully recorded the **${action.args.type}** of **₹${action.args.amount}**.`
                : `Task **${action?.name || 'Action'}** completed successfully.`;
            
            setMessages(prev => [...prev, { role: 'assistant', content: successMsg, mode: 'chat' }]);
            setActiveAction(null);
            setCurrentMode('chat');
        } catch (error: any) {
            console.error("Execution Error:", error);
            setActiveAction(prev => prev ? { ...prev, logs: [...prev.logs, "❌ Execution failed.", `Error: ${error.message || 'Unknown error'}`] } : null);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `⚠️ **Execution Failed**\n\nI encountered an error while performing the action: ${error.message || 'Unknown error'}. \n\nPlease try again or check your permissions.`,
                mode: 'chat'
            }]);
        } finally {
            setTimeout(() => {
                if (currentMode !== 'chat') {
                    setActiveAction(null);
                    setCurrentMode('chat');
                }
            }, 2000);
        }
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
                    <div className="w-12 h-12 flex items-center justify-center">
                        <img 
                            src="/assistant.png" 
                            alt="IVY Bot" 
                            className="w-full h-full object-contain drop-shadow-sm"
                            referrerPolicy="no-referrer"
                        />
                    </div>
                    <div className="h-6 w-px bg-gray-200 mx-1" />
                    <div className="flex items-center gap-2">
                        <h1 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Bot Operator</h1>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setShowHistory(true)} 
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
                                <div className={`w-9 h-9 flex items-center justify-center shrink-0 ${
                                    msg.role === 'user' ? 'bg-[#0e30f1] text-white rounded-xl shadow-sm' : ''
                                }`}>
                                    {msg.role === 'user' ? (
                                        <User size={18} />
                                    ) : (
                                        <img 
                                            src="/assistant.png" 
                                            alt="Bot" 
                                            className="w-full h-full object-contain"
                                            referrerPolicy="no-referrer"
                                        />
                                    )}
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

                                        {msg.mode === 'form' && msg.form && (
                                            <ChatForm 
                                                type={msg.form.type} 
                                                initialData={msg.form.initialData} 
                                                onSubmit={(data) => handleFormSubmit(data, msg.form!.type)}
                                                onCancel={() => setMessages(prev => [...prev, { role: 'assistant', content: "Form cancelled.", mode: 'chat' }])}
                                            />
                                        )}

                                        {msg.mode === 'confirmation' && !activeAction && (
                                            <div className="mt-6 flex items-center gap-3">
                                                <button 
                                                    onClick={() => startExecution(msg.steps || [], msg.action)}
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
                                <div className="w-9 h-9 flex items-center justify-center">
                                    <img 
                                        src="/assistant.png" 
                                        alt="Bot" 
                                        className="w-full h-full object-contain animate-pulse"
                                        referrerPolicy="no-referrer"
                                    />
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
                                <div className="flex flex-col items-end mr-4 hidden md:flex min-w-[200px]">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">
                                        <Terminal size={10} />
                                        Live Execution Logs
                                    </div>
                                    <div className="text-[9px] text-gray-400 font-mono text-right space-y-0.5">
                                        {activeAction.logs.slice(-3).map((log, i) => (
                                            <p key={i} className={i === 2 ? 'text-gray-600 font-bold' : 'opacity-60'}>{log}</p>
                                        ))}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setActiveAction(null)}
                                    className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                                    title="Cancel Task"
                                >
                                    <X size={16} />
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
                            value={isListening ? (input + (interimTranscript ? ' ' + interimTranscript : '')).trim() : input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={isListening ? "Listening..." : "Type a command (e.g., 'Go to projects')..."}
                            className={`w-full pl-6 pr-24 py-4 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-[#0e30f1]/20 focus:border-[#0e30f1] outline-none transition-all relative z-10 ${
                                isListening ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200'
                            }`}
                        />
                        <div className="absolute right-2 top-2 bottom-2 flex items-center gap-2 z-20">
                            {isSupported && (
                                <button
                                    onClick={toggleListening}
                                    className={`px-3 h-full rounded-xl flex items-center justify-center transition-all ${
                                        isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                                    }`}
                                    title={isListening ? 'Stop Listening' : 'Voice Input'}
                                >
                                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                                </button>
                            )}
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className={`px-4 h-full rounded-xl flex items-center justify-center transition-all ${
                                    input.trim() && !isLoading 
                                        ? 'bg-[#0e30f1] text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700' 
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <Send size={18} />
                            </button>
                        </div>
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

            {/* History Modal */}
            <AnimatePresence>
                {showHistory && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowHistory(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                        >
                            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[#0e30f1]">
                                        <History size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Chat History</h2>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Your past conversations</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowHistory(false)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-8 space-y-4 hide-scroll">
                                <div className="py-12 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
                                        <MessageSquare size={32} />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-1">No History Yet</h3>
                                    <p className="text-xs text-gray-500">Your past conversations will appear here.</p>
                                </div>
                            </div>
                            
                            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                                <button 
                                    onClick={() => setShowHistory(false)}
                                    className="px-6 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-100 transition-all"
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

export default AssistantView;
