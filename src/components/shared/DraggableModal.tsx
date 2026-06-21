import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';

interface DraggableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  width?: string;
  className?: string;
  customHeader?: React.ReactNode;
  hideDefaultHeader?: boolean;
}

export function DraggableModal({
  isOpen,
  onClose,
  title,
  children,
  width = 'max-w-2xl',
  className,
  customHeader,
  hideDefaultHeader = false
}: DraggableModalProps) {
  const nodeRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      window.dispatchEvent(new CustomEvent('modal-state-changed', { detail: { isOpen: true } }));
    }
    return () => {
      const remainingModals = document.querySelectorAll('.draggable-modal-backdrop');
      if (remainingModals.length <= 1) {
        document.body.classList.remove('modal-open');
        window.dispatchEvent(new CustomEvent('modal-state-changed', { detail: { isOpen: false } }));
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-[#1f2a44]/80 backdrop-blur-md p-4 animate-fadeIn draggable-modal-backdrop">
      <Draggable nodeRef={nodeRef} handle=".modal-handle">
        <div 
          ref={nodeRef}
          className={clsx(
            "bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col w-full max-h-[90vh]",
            width,
            className
          )}
        >
          {/* Header / Handle */}
          {!hideDefaultHeader && (
            <div className="modal-handle cursor-move w-full shrink-0">
              {customHeader ? customHeader : (
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  {typeof title === 'string' ? (
                    <h3 className="text-sm font-black text-[#111f42] uppercase tracking-widest">
                      {title}
                    </h3>
                  ) : (
                    title
                  )}
                  <button 
                    onClick={onClose}
                    className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {children}
          </div>
        </div>
      </Draggable>
    </div>
  );
}

