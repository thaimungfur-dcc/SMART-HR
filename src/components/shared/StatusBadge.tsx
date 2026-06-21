import React from 'react';
import { LucideIcon } from './LucideIcon'; // Using our shared LucideIcon
import { CheckCircle2, Clock, XCircle, AlertCircle, HelpCircle } from 'lucide-react';

export interface StatusBadgeProps {
    status: string;
    type?: 'success' | 'warning' | 'danger' | 'info' | 'default';
    icon?: string | React.ElementType; // Optional icon name
    className?: string;
    text?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type, icon, className = "", text }) => {
    // Determine colors based on type or status string heuristics
    let bg = 'bg-gray-100';
    let textCol = 'text-gray-700';
    let DefaultIcon = HelpCircle;

    const lowerStatus = status.toLowerCase();

    const t = type || (
        ['present', 'approved', 'success', 'active', 'completed', 'paid', 'pass', 'valid', 'done'].some(w => lowerStatus.includes(w)) ? 'success' :
        ['late', 'pending', 'warning', 'on_hold', 'processing', 'review', 'waiting'].some(w => lowerStatus.includes(w)) ? 'warning' :
        ['absent', 'rejected', 'danger', 'failed', 'unpaid', 'cancelled', 'fail', 'invalid'].some(w => lowerStatus.includes(w)) ? 'danger' :
        ['info', 'new', 'draft', 'submitted', 'in_progress'].some(w => lowerStatus.includes(w)) ? 'info' :
        'default'
    );

    switch (t) {
        case 'success':
            bg = 'bg-[#657f4d]/10';
            textCol = 'text-[#657f4d]';
            DefaultIcon = CheckCircle2;
            break;
        case 'warning':
            bg = 'bg-[#b7a159]/10';
            textCol = 'text-[#b7a159]';
            DefaultIcon = Clock;
            break;
        case 'danger':
            bg = 'bg-[#932c2e]/10';
            textCol = 'text-[#932c2e]';
            DefaultIcon = XCircle;
            break;
        case 'info':
            bg = 'bg-[#3f809e]/10';
            textCol = 'text-[#3f809e]';
            DefaultIcon = AlertCircle;
            break;
        default:
            bg = 'bg-gray-100';
            textCol = 'text-gray-600';
            DefaultIcon = HelpCircle;
            break;
    }

    const IconCompToUse = icon || DefaultIcon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-widest leading-none ${bg} ${textCol} ${className}`}>
            <LucideIcon name={IconCompToUse} size={12} strokeWidth={3} />
            {text || status}
        </span>
    );
};
