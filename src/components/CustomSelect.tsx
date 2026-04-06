import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  icon?: React.ReactNode;
  width?: string;
  name?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  icon,
  width = 'w-48',
  name,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div className={`relative ${width}`} ref={containerRef}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border rounded-xl shadow-sm transition-all duration-200 ${
          isOpen
            ? 'border-[#0e30f1] ring-2 ring-[#0e30f1]/10'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {icon && <div className="text-gray-400 shrink-0">{icon}</div>}
          <span className={`text-sm font-semibold truncate ${selectedOption ? 'text-gray-700' : 'text-gray-400'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-400 shrink-0"
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 mt-[6px] w-full bg-white rounded-2xl border border-gray-100 shadow-xl z-50 p-1.5"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
          >
            <div className="max-h-60 overflow-y-auto minimal-scrollbar pr-1" style={{ direction: 'rtl' }}>
              <div style={{ direction: 'ltr' }}>
                {options.map((option, index) => {
                  const isSelected = option.value === value;
                  return (
                    <motion.button
                      key={option.value}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                        isSelected
                          ? 'bg-[#0e30f1]/8 text-[#0e30f1] font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span>{option.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isSelected && (
                          <ArrowRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                        {isSelected && <Check size={14} className="shrink-0" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
            {options.length > 8 && (
              <div className="flex justify-center py-1 text-gray-300 border-t border-gray-50 mt-1">
                <ChevronDown size={14} className="animate-bounce" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;
