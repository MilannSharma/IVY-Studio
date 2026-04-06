import React, { useState, useRef, useEffect } from 'react';
import { 
    MessageSquare, 
    X, 
    Send, 
    Bot, 
    User, 
    Sparkles, 
    History, 
    Plus, 
    Check, 
    Loader2, 
    Terminal,
    AlertCircle,
    Mic,
    MicOff
} from 'lucide-react';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import ChatForm from './ChatForm';
import { useUser } from '../App';

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
    suggestions?: string[];
}

    interface FloatingAssistantProps {
        onNavigate?: (tabId: string) => void;
        onOpenProject?: (project: any) => void;
        onOpenClient?: (client: any) => void;
        onCreateClient?: (clientData: any) => Promise<string>;
        onCreateProject?: (projectData: any) => Promise<string>;
        onAddNote?: (noteData: any) => Promise<string>;
        onUpdateProjectStatus?: (projectId: string, status: string) => Promise<void>;
        onRecordTransaction?: (transactionData: any) => Promise<string>;
    }

    const FloatingAssistant: React.FC<FloatingAssistantProps> = ({ 
        onNavigate, 
        onOpenProject, 
        onOpenClient, 
        onCreateClient, 
        onCreateProject,
        onAddNote,
        onUpdateProjectStatus,
        onRecordTransaction
    }) => {
    const { user } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        if (messages.length === 0) {
            const firstName = user?.displayName?.split(' ')[0] || 'Admin';
            setMessages([
                { 
                    role: 'assistant', 
                    content: `Hello ${firstName}! 🚀 I'm **IVY Bot**, your system buddy. How can I help you today?\n\nI can assist you with:\n- Navigating to different sections (like Projects, Sales, or Clients).\n- Opening specific project or client details.\n- Creating new clients or projects.\n- Checking system analytics like profit margins or dues.\n\n**What's on your mind?**`,
                    mode: 'chat',
                    suggestions: [
                        "Create a new client",
                        "Show me the Sales Revenue",
                        "Check my pending tasks",
                        "Open a project"
                    ]
                }
            ]);
        }
    }, [user]);

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const [interimTranscript, setInterimTranscript] = useState('');
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
        if (isOpen) scrollToBottom();
    }, [messages, activeAction, isOpen]);

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

    const handleSend = async (overrideMessage?: string) => {
        const userMessage = overrideMessage || input.trim();
        if (!userMessage || isLoading) return;

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
                        content: { type: Type.STRING, description: "Content of the note." },
                        color: { type: Type.STRING, description: "Background color of the note (hex code)." }
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
                        status: { 
                            type: Type.STRING, 
                            enum: ["initialized", "in-progress", "completed", "on-hold", "cancelled"],
                            description: "The new status." 
                        }
                    },
                    required: ["projectId", "status"],
                },
            };

            const recordTransactionFn: FunctionDeclaration = {
                name: "recordTransaction",
                parameters: {
                    type: Type.OBJECT,
                    description: "Record a new financial transaction (Income or Expense).",
                    properties: {
                        type: { type: Type.STRING, enum: ["Income", "Expense"], description: "Type of transaction." },
                        amount: { type: Type.NUMBER, description: "Amount of the transaction." },
                        category: { type: Type.STRING, description: "Category (e.g., Project Payment, Salary, Rent)." },
                        description: { type: Type.STRING, description: "Brief description." },
                        client: { type: Type.STRING, description: "Associated client name (optional)." }
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
            - Use clean formatting (bullets, bold text).
            - Keep the conversation flowing. If you perform an action, explain what you did and ask if there's anything else.
            - Use minimal emojis (✅ 🚀 🔍).
            - If the user just says "hello" or "hi", greet them warmly as a buddy and offer help with quick actions.
            - To provide quick action buttons, append [SUGGESTIONS: "Action 1", "Action 2"] at the end of your message. Always suggest relevant next steps.`;

            const chatHistory = messages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));

            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: [...chatHistory, { role: 'user', parts: [{ text: userMessage }] }],
                config: {
                    systemInstruction: systemPrompt,
                    tools: [{ functionDeclarations: [
                        navigateToFn, 
                        openProjectFn, 
                        openClientFn, 
                        createClientFn, 
                        createProjectFn, 
                        showFormFn,
                        addNoteFn,
                        updateProjectStatusFn,
                        recordTransactionFn
                    ] }],
                },
            });

            let assistantMessage = response.text || "I'm processing your request...";
            let suggestions: string[] = [];

            // Simple parser for suggestions in format [SUGGESTIONS: "A", "B"]
            const suggestionMatch = assistantMessage.match(/\[SUGGESTIONS:\s*(.*?)\]/);
            if (suggestionMatch) {
                try {
                    suggestions = JSON.parse(`[${suggestionMatch[1]}]`);
                    assistantMessage = assistantMessage.replace(suggestionMatch[0], '').trim();
                } catch (e) {
                    console.error("Failed to parse suggestions:", e);
                }
            }

            const functionCalls = response.functionCalls;

            if (functionCalls && functionCalls.length > 0) {
                const call = functionCalls[0];
                if (call.name === 'navigateTo') {
                    const { tabId, label } = call.args as any;
                    setMessages(prev => [...prev, { 
                        role: 'assistant', 
                        content: assistantMessage || `Sure! Navigating you to the **${label || tabId}** page now. 🚀`,
                        mode: 'chat',
                        suggestions
                    }]);
                    startExecution([`Locating ${label || tabId} module`, `Preparing view transition`, `Updating system state`], { name: 'navigateTo', args: { tabId } });
                } else if (call.name === 'openProject') {
                    const { projectId, projectName } = call.args as any;
                    setMessages(prev => [...prev, { 
                        role: 'assistant', 
                        content: assistantMessage || `Opening project **${projectName || projectId}** for you. 🔍`,
                        mode: 'chat',
                        suggestions
                    }]);
                    startExecution([`Searching for project ${projectName || projectId}`, `Fetching project details`, `Opening project view`], { name: 'openProject', args: { projectId, projectName } });
                } else if (call.name === 'openClient') {
                    const { clientId, clientName } = call.args as any;
                    setMessages(prev => [...prev, { 
                        role: 'assistant', 
                        content: assistantMessage || `Pulling up the profile for **${clientName || clientId}**. 🔍`,
                        mode: 'chat',
                        suggestions
                    }]);
                    startExecution([`Searching for client ${clientName || clientId}`, `Fetching client data`, `Opening client profile`], { name: 'openClient', args: { clientId, clientName } });
                } else if (call.name === 'createClient') {
                    const clientData = call.args as any;
                    setCurrentMode('confirmation');
                    setMessages(prev => [...prev, { 
                        role: 'assistant', 
                        content: assistantMessage || `I will create a new client profile for **${clientData.name}**. \n\n✅ Confirm to proceed?`,
                        mode: 'confirmation',
                        steps: [`Validating client data`, `Connecting to database`, `Creating client record`, `Finalizing profile`],
                        action: { name: 'createClient', args: clientData },
                        suggestions
                    }]);
                } else if (call.name === 'createProject') {
                    const projectData = call.args as any;
                    setCurrentMode('confirmation');
                    setMessages(prev => [...prev, { 
                        role: 'assistant', 
                        content: assistantMessage || `I will create a new project **${projectData.name}** for client **${projectData.client}**. \n\n✅ Confirm to proceed?`,
                        mode: 'confirmation',
                        steps: [`Validating project details`, `Linking to client ${projectData.client}`, `Initializing project workspace`, `Saving to system`],
                        action: { name: 'createProject', args: projectData },
                        suggestions
                    }]);
                } else if (call.name === 'showForm') {
                    const { formType, initialData } = call.args as any;
                    setCurrentMode('form');
                    setMessages(prev => [...prev, { 
                        role: 'assistant', 
                        content: assistantMessage || `Please fill out the details for the new **${formType}** below:`,
                        mode: 'form',
                        form: { type: formType, initialData },
                        suggestions
                    }]);
                } else if (call.name === 'addNote') {
                    const noteData = call.args as any;
                    setCurrentMode('confirmation');
                    setMessages(prev => [...prev, { 
                        role: 'assistant', 
                        content: assistantMessage || `I will add a new note: **${noteData.title || 'Untitled'}**. \n\n✅ Confirm to save?`,
                        mode: 'confirmation',
                        steps: [`Preparing note content`, `Setting background color`, `Saving to your notes`],
                        action: { name: 'addNote', args: noteData },
                        suggestions
                    }]);
                } else if (call.name === 'updateProjectStatus') {
                    const { projectId, status } = call.args as any;
                    setCurrentMode('confirmation');
                    setMessages(prev => [...prev, { 
                        role: 'assistant', 
                        content: assistantMessage || `I will update the status of project **${projectId}** to **${status}**. \n\n✅ Confirm to proceed?`,
                        mode: 'confirmation',
                        steps: [`Locating project`, `Updating status to ${status}`, `Refreshing project view`],
                        action: { name: 'updateProjectStatus', args: { projectId, status } },
                        suggestions
                    }]);
                } else if (call.name === 'recordTransaction') {
                    const transactionData = call.args as any;
                    setCurrentMode('confirmation');
                    setMessages(prev => [...prev, { 
                        role: 'assistant', 
                        content: assistantMessage || `I will record a new **${transactionData.type}** of **₹${transactionData.amount}** for **${transactionData.category}**. \n\n✅ Confirm to record?`,
                        mode: 'confirmation',
                        steps: [`Validating transaction amount`, `Categorizing as ${transactionData.category}`, `Updating financial ledger`],
                        action: { name: 'recordTransaction', args: transactionData },
                        suggestions
                    }]);
                }
            } else if (assistantMessage.toLowerCase().includes('confirm to proceed') || assistantMessage.includes('✅')) {
                setCurrentMode('confirmation');
                const steps = assistantMessage.split('\n').filter(line => /^\d+\./.test(line.trim())).map(line => line.replace(/^\d+\.\s*/, ''));
                setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: assistantMessage,
                    mode: 'confirmation',
                    steps: steps.length > 0 ? steps : ['Analyze request', 'Prepare execution', 'Finalize results'],
                    suggestions
                }]);
            } else {
                setCurrentMode('chat');
                setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage, mode: 'chat', suggestions }]);
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
                ? `Note **${action.args.title || 'Untitled'}** has been saved to your notes.`
                : action?.name === 'updateProjectStatus'
                ? `Project status updated to **${action.args.status}**.`
                : action?.name === 'recordTransaction'
                ? `Transaction of **₹${action.args.amount}** recorded successfully.`
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
            // Keep logs visible for a moment if successful, or longer if error
            setTimeout(() => {
                if (currentMode !== 'chat') {
                    setActiveAction(null);
                    setCurrentMode('chat');
                }
            }, 2000);
        }
    };

    const handleNewChat = () => {
        const firstName = user?.displayName?.split(' ')[0] || 'Admin';
        setMessages([{ 
            role: 'assistant', 
            content: `Hello ${firstName}! 🚀 I'm back. How can I help you today?\n\nI can assist you with:\n- Navigating to different sections (like Projects, Sales, or Clients).\n- Opening specific project or client details.\n- Creating new clients or projects.\n- Checking system analytics like profit margins or dues.\n\n**What's on your mind?**`,
            mode: 'chat',
            suggestions: [
                "Create a new client",
                "Show me the Sales Revenue",
                "Check my pending tasks",
                "Open a project"
            ]
        }]);
        setActiveAction(null);
        setCurrentMode('chat');
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-[400px] h-[600px] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-200 overflow-hidden flex flex-col relative"
                    >
                        {/* Header */}
                        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 flex items-center justify-center">
                                    <img 
                                        src="/assistant.png" 
                                        alt="IVY Bot" 
                                        className="w-full h-full object-contain drop-shadow-sm"
                                        referrerPolicy="no-referrer"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">IVY Bot</h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">System Operator</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={handleNewChat} className="p-2 text-gray-400 hover:text-[#0e30f1] hover:bg-blue-50 rounded-lg transition-all" title="New Chat">
                                    <Plus size={18} />
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scroll relative">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-8 h-8 flex items-center justify-center shrink-0 ${
                                            msg.role === 'user' ? 'bg-[#0e30f1] text-white rounded-lg shadow-sm' : ''
                                        }`}>
                                            {msg.role === 'user' ? (
                                                <User size={16} />
                                            ) : (
                                                <img 
                                                    src="/assistant.png" 
                                                    alt="Bot" 
                                                    className="w-full h-full object-contain"
                                                    referrerPolicy="no-referrer"
                                                />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <div className={`p-4 rounded-2xl text-sm ${
                                                msg.role === 'user' 
                                                    ? 'bg-[#0e30f1] text-white rounded-tr-none' 
                                                    : 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100'
                                            }`}>
                                                <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-inherit prose-strong:text-inherit">
                                                    <Markdown>{msg.content}</Markdown>
                                                </div>

                                                {msg.suggestions && msg.suggestions.length > 0 && (
                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        {msg.suggestions.map((suggestion, sIdx) => (
                                                            <button
                                                                key={sIdx}
                                                                onClick={() => handleSend(suggestion)}
                                                                className="px-3 py-1.5 bg-white border border-[#0e30f1]/20 text-[#0e30f1] rounded-full text-[11px] font-bold hover:bg-[#0e30f1] hover:text-white transition-all shadow-sm"
                                                            >
                                                                {suggestion}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                {msg.mode === 'form' && msg.form && (
                                                    <ChatForm 
                                                        type={msg.form.type} 
                                                        initialData={msg.form.initialData} 
                                                        onSubmit={(data) => handleFormSubmit(data, msg.form!.type)}
                                                        onCancel={() => setMessages(prev => [...prev, { role: 'assistant', content: "No problem, we can skip the form for now. How else can I assist you?", mode: 'chat' }])}
                                                    />
                                                )}

                                                {msg.mode === 'confirmation' && !activeAction && (
                                                    <div className="mt-4 flex flex-col gap-2">
                                                        <button 
                                                            onClick={() => startExecution(msg.steps || [], msg.action)}
                                                            className="w-full py-2 bg-[#0e30f1] text-white rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                                                        >
                                                            <Check size={14} />
                                                            Execute Action
                                                        </button>
                                                        <button 
                                                            onClick={() => setMessages(prev => [...prev, { role: 'assistant', content: "No problem, I've cancelled that for you. What else can I help you with?", mode: 'chat' }])}
                                                            className="w-full py-2 bg-white border border-gray-200 text-gray-500 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-gray-50 transition-all"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="flex gap-3 items-center">
                                        <div className="w-8 h-8 flex items-center justify-center">
                                            <img 
                                                src="/assistant.png" 
                                                alt="Bot" 
                                                className="w-full h-full object-contain animate-pulse"
                                                referrerPolicy="no-referrer"
                                            />
                                        </div>
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-[#0e30f1] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-1.5 h-1.5 bg-[#0e30f1] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-1.5 h-1.5 bg-[#0e30f1] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />

                            {/* Action Overlay */}
                            <AnimatePresence>
                                {activeAction && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        className="absolute bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 z-20"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">Executing Task...</p>
                                            <div className="flex items-center gap-1 text-[9px] font-mono text-green-600">
                                                <Terminal size={10} />
                                                Live Logs
                                            </div>
                                        </div>
                                        <div className="h-1 w-full bg-gray-100 rounded-full mt-1 overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(activeAction.currentStep / activeAction.steps.length) * 100}%` }}
                                                className="h-full bg-[#0e30f1]"
                                            />
                                        </div>
                                        <div className="mt-2 space-y-0.5">
                                            {activeAction.logs.slice(-2).map((log, i) => (
                                                <p key={i} className={`text-[9px] font-mono truncate ${i === 1 ? 'text-gray-600 font-bold' : 'text-gray-400 opacity-60'}`}>
                                                    {log}
                                                </p>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Input */}
                        <div className={`p-4 bg-white border-t border-gray-100 ${activeAction ? 'opacity-30 pointer-events-none' : ''}`}>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={isListening ? (input + (interimTranscript ? ' ' + interimTranscript : '')).trim() : input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder={isListening ? "Listening..." : "Type a command..."}
                                    className={`w-full pl-4 pr-20 py-3 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-[#0e30f1]/20 focus:border-[#0e30f1] outline-none transition-all ${
                                        isListening ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200'
                                    }`}
                                />
                                <div className="absolute right-2 top-1.5 bottom-1.5 flex items-center gap-1">
                                    {isSupported && (
                                        <button
                                            onClick={toggleListening}
                                            className={`px-2 h-full rounded-lg flex items-center justify-center transition-all ${
                                                isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                                            }`}
                                            title={isListening ? 'Stop Listening' : 'Voice Input'}
                                        >
                                            {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleSend()}
                                        disabled={!input.trim() || isLoading}
                                        className={`px-3 h-full rounded-lg flex items-center justify-center transition-all ${
                                            input.trim() && !isLoading 
                                                ? 'bg-[#0e30f1] text-white shadow-lg shadow-blue-500/20' 
                                                : 'bg-gray-200 text-gray-400'
                                        }`}
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                animate={!isOpen ? {
                    y: [0, -10, 0],
                    transition: {
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }
                } : {}}
                className={`w-24 h-24 flex items-center justify-center transition-all duration-500 relative group ${
                    isOpen ? 'bg-white/10 backdrop-blur-md rounded-full shadow-2xl text-white rotate-90' : 'bg-transparent'
                }`}
            >
                {!isOpen && (
                    <motion.div 
                        initial={{ scale: 0, y: 10 }}
                        animate={{ 
                            scale: 1, 
                            y: [0, -5, 0],
                        }}
                        transition={{
                            y: {
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            },
                            scale: { duration: 0.3 }
                        }}
                        className="absolute -top-2 -right-2 bg-orange-500 px-3 py-1 rounded-full border-2 border-white shadow-xl z-20 flex items-center justify-center"
                    >
                        <span className="text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">Ask Me</span>
                    </motion.div>
                )}
                {isOpen ? (
                    <X size={40} className="drop-shadow-lg" />
                ) : (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <img 
                            src="/assistant.png" 
                            alt="IVY Bot" 
                            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_15px_30px_rgba(14,48,241,0.4)]"
                            referrerPolicy="no-referrer"
                        />
                    </div>
                )}
            </motion.button>
        </div>
    );
};

export default FloatingAssistant;
