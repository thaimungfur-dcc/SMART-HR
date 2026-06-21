import React, { InputHTMLAttributes, SelectHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';

export interface BaseFieldProps {
    label: string;
    error?: string;
    helperText?: string;
    required?: boolean;
    className?: string; // Wrapper class
}

// ------------------------------------
// ValidatedInput
// ------------------------------------
export interface ValidatedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>, BaseFieldProps {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
    icon?: React.ReactNode;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({ 
    label, error, helperText, required, className = "", icon, ...props 
}) => {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            <label className="text-[11px] font-black text-[#7a8b95] uppercase tracking-widest font-sans flex items-center gap-1">
                {label} {required && <span className="text-[#932c2e]">*</span>}
            </label>
            <div className="relative flex items-center">
                {icon && <div className="absolute left-3 text-gray-400">{icon}</div>}
                <input 
                    className={`w-full ${icon ? 'pl-9' : 'pl-3'} pr-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 transition-shadow
                        ${error ? 'border-[#932c2e] focus:ring-[#932c2e]/20' : 'border-gray-200 focus:border-[#709654] focus:ring-[#709654]/20'}
                        disabled:bg-gray-50 disabled:text-gray-500
                    `}
                    {...props}
                />
            </div>
            {error && (
                <span className="text-[10px] text-[#932c2e] font-bold flex items-center gap-1 mt-0.5 animate-fadeIn">
                    <AlertCircle size={12} strokeWidth={3} /> {error}
                </span>
            )}
            {!error && helperText && (
                <span className="text-[10px] text-gray-400">{helperText}</span>
            )}
        </div>
    );
};

// ------------------------------------
// SelectDropdown
// ------------------------------------
export interface SelectOption {
    value: string | number;
    label: string;
}

export interface SelectDropdownProps extends SelectHTMLAttributes<HTMLSelectElement>, BaseFieldProps {
    options: SelectOption[];
}

export const SelectDropdown: React.FC<SelectDropdownProps> = ({
    label, error, helperText, required, className = "", options, ...props
}) => {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
             <label className="text-[11px] font-black text-[#7a8b95] uppercase tracking-widest font-sans flex items-center gap-1">
                {label} {required && <span className="text-[#932c2e]">*</span>}
            </label>
            <div className="relative">
                <select
                    className={`w-full px-3 py-2 border rounded-lg text-sm bg-white appearance-none focus:outline-none focus:ring-2 transition-shadow
                        ${error ? 'border-[#932c2e] focus:ring-[#932c2e]/20' : 'border-gray-200 focus:border-[#709654] focus:ring-[#709654]/20'}
                        disabled:bg-gray-50 disabled:text-gray-500
                    `}
                    {...props}
                >
                    <option value="" disabled className="text-gray-400">Select...</option>
                    {options.map((opt, i) => (
                        <option key={i} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                {/* Custom dropdown arrow to replace native one */}
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                     <svg className={`h-4 w-4 ${error ? 'text-[#932c2e]' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
             {error && (
                <span className="text-[10px] text-[#932c2e] font-bold flex items-center gap-1 mt-0.5 animate-fadeIn">
                    <AlertCircle size={12} strokeWidth={3} /> {error}
                </span>
            )}
            {!error && helperText && (
                <span className="text-[10px] text-gray-400">{helperText}</span>
            )}
        </div>
    );
};

// ------------------------------------
// DatePicker
// ------------------------------------
export interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>, BaseFieldProps {
    type?: 'date' | 'datetime-local' | 'time' | 'month';
}

export const DatePicker: React.FC<DatePickerProps> = ({
    label, error, helperText, required, className = "", type = "date", ...props
}) => {
    return (
       <div className={`flex flex-col gap-1.5 ${className}`}>
             <label className="text-[11px] font-black text-[#7a8b95] uppercase tracking-widest font-sans flex items-center gap-1">
                {label} {required && <span className="text-[#932c2e]">*</span>}
            </label>
            <input 
                type={type}
                className={`w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 transition-shadow
                    ${error ? 'border-[#932c2e] focus:ring-[#932c2e]/20' : 'border-gray-200 focus:border-[#709654] focus:ring-[#709654]/20'}
                    disabled:bg-gray-50 disabled:text-gray-500
                `}
                {...props}
            />
             {error && (
                <span className="text-[10px] text-[#932c2e] font-bold flex items-center gap-1 mt-0.5 animate-fadeIn">
                    <AlertCircle size={12} strokeWidth={3} /> {error}
                </span>
            )}
            {!error && helperText && (
                <span className="text-[10px] text-gray-400">{helperText}</span>
            )}
       </div>
    );
};
