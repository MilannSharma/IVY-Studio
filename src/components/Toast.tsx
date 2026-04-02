import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    addToast: (message: string, type?: ToastType) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(toast.id);
        }, 4000);
        return () => clearTimeout(timer);
    }, [toast.id, onRemove]);

    const icons = {
        success: <CheckCircle className="text-green-500" size={18} />,
        error: <AlertCircle className="text-red-500" size={18} />,
        warning: <AlertTriangle className="text-amber-500" size={18} />,
        info: <Info className="text-blue-500" size={18} />,
    };

    const colors = {
        success: 'border-green-100 bg-green-50',
        error: 'border-red-100 bg-red-50',
        warning: 'border-amber-100 bg-amber-50',
        info: 'border-blue-100 bg-blue-50',
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg min-w-[300px] max-w-md ${colors[toast.type]}`}
        >
            <div className="shrink-0">{icons[toast.type]}</div>
            <div className="flex-1 text-sm font-semibold text-gray-800">{toast.message}</div>
            <button
                onClick={() => onRemove(toast.id)}
                className="shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            >
                <X size={16} />
            </button>
            <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 4, ease: 'linear' }}
                className={`absolute bottom-0 left-0 h-1 rounded-full ${
                    toast.type === 'success' ? 'bg-green-500' :
                    toast.type === 'error' ? 'bg-red-500' :
                    toast.type === 'warning' ? 'bg-amber-500' :
                    'bg-blue-500'
                }`}
            />
        </motion.div>
    );
};
