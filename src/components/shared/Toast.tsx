import React from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose }: any) => {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div className="fixed bottom-6 right-6 z-[1000] animate-slideInRight flex items-center gap-3 bg-white px-5 py-3.5 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#eaeaec]">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${type === 'success' ? 'bg-[#657f4d]/10 text-[#657f4d]' : 'bg-[#932c2e]/10 text-[#932c2e]'}`}>
        {type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
      </div>
      <div className="flex flex-col">
        <span className="text-[12px] font-black text-[#2f2926] uppercase tracking-wider">{type === 'success' ? 'SUCCESS' : 'ALERT'}</span>
        <span className="text-[11px] font-medium text-[#606a5f]">{message}</span>
      </div>
      <button onClick={onClose} className="ml-4 text-[#7a8b95] hover:text-[#2f2926] transition-colors"><X size={14} /></button>
    </div>,
    document.body
  );
};
