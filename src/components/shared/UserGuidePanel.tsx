import React from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';

export const UserGuidePanel = ({ isOpen, onClose, title = "Order Management", desc = "ระบบจัดการคำสั่งซื้อ (Sales Order) และสถานะการจัดส่ง" }: any) => {
    if (!isOpen || typeof document === 'undefined') return null;
    return createPortal(
        <>
            <div className="fixed inset-0 z-[190] bg-[#022d41]/40 backdrop-blur-sm animate-fadeIn" onClick={onClose}/>
            <div className="fixed inset-y-0 right-0 z-[200] w-full md:w-[450px] bg-white shadow-2xl flex flex-col border-l-4 border-[#af7a2b] animate-fadeIn">
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-[#f8f9fa]">
                    <div>
                        <h3 className="font-black flex items-center gap-3 uppercase tracking-widest text-xl text-[#022d41]"><Icons.BookOpen size={24} className="text-[#af7a2b]"/> GUIDELINES</h3>
                        <p className="text-[12px] font-bold text-slate-500 uppercase mt-1">{title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-[#f91a47] hover:bg-slate-100 rounded-xl transition-colors"><Icons.X size={24}/></button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6 text-[#022d41] text-[12px]">
                    <p className="font-mono">{desc}</p>
                </div>
            </div>
        </>, document.body
    );
};
