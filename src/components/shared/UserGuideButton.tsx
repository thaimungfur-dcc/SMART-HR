import React from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';

interface UserGuideButtonProps {
    onClick: () => void;
    className?: string;
    iconClassName?: string;
    textClassName?: string;
}

export default function UserGuideButton({ 
    onClick, 
    className = "bg-white/80 text-slate-500 hover:bg-slate-800 hover:text-white",
    iconClassName = "text-current",
    textClassName = "text-current"
}: UserGuideButtonProps) {
    if (typeof document === 'undefined') return null;

    return createPortal(
        <button 
            onClick={onClick} 
            className={`fixed right-0 px-1.5 py-8 rounded-l-xl shadow-md z-[100] flex flex-col items-center gap-3 hover:-translate-x-1 transition-all group ${className}`}
            style={{ top: '80px' }}
        >
            <HelpCircle size={18} className={`transition-colors ${iconClassName}`} />
            <div 
                style={{ writingMode: 'vertical-rl' }} 
                className={`text-[10px] font-black uppercase tracking-[0.2em] rotate-180 transition-colors ${textClassName}`}
            >
                USER GUIDE
            </div>
        </button>,
        document.body
    );
}
