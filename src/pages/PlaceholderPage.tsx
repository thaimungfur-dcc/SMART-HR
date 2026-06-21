import React from 'react';
import { Construction } from 'lucide-react';
import { motion } from 'motion/react';

interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="px-8 pt-0 pb-0 w-full h-full flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex w-full h-full max-h-[80vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#cdd0db] bg-white/50 text-gray-500"
      >
        <Construction className="mb-4 h-16 w-16 text-[#b58c4f]" />
        <h1 className="text-2xl font-black uppercase tracking-widest text-[#212c46]">{title}</h1>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-widest max-w-md text-center text-[#7a8b95]">
          This module is currently under construction. 
          Data and functionality will be implemented in the next phase.
        </p>
      </motion.div>
    </div>
  );
}
