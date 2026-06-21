import React from 'react';
import { LucideIcon } from './LucideIcon'; // Changed to our shared LucideIcon component

interface KpiCardProps {
    title?: string;
    label?: string; // Alias for backward compatibility
    value: string | number;
    color: string;
    icon: any; // Allow string or icon component
    description?: string;
    subLabel?: string; // Alias for backward compatibility
}

const KpiCard: React.FC<KpiCardProps> = ({ 
    title, 
    label, 
    value, 
    color, 
    icon, 
    description, 
    subLabel 
}) => {
    const displayTitle = title || label || '';
    const displayDescription = description || subLabel;
    // Helper to add alpha to hex color
    const getAlphaColor = (hex: string, alpha: string) => {
        if (hex.startsWith('#')) {
            return `${hex}${alpha}`;
        }
        return hex;
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100/80 relative overflow-hidden group h-full transition-all duration-300">
            {/* Watermark Icon */}
            <div className="absolute -right-6 -bottom-6 opacity-[0.05] transform rotate-12 group-hover:scale-110 transition-all duration-500 pointer-events-none z-0">
                <LucideIcon name={icon} size={100} color={color} />
            </div>

            <div className="relative z-10 flex justify-between items-start">
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                    {/* KPI Title */}
                    <p className="sys-kpi-label opacity-90 truncate">
                        {displayTitle}
                    </p>
                    
                    {/* KPI Value */}
                    <div className="flex items-baseline gap-2 mt-1">
                        <h4 className="sys-kpi-value truncate" style={{ color }}>
                            {value}
                        </h4>
                    </div>

                    {/* KPI Description */}
                    {displayDescription && (
                        <p className="sys-kpi-desc flex items-center gap-1.5 truncate">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></span>
                            {displayDescription}
                        </p>
                    )}
                </div>

                {/* Main Icon Box */}
                <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white transition-transform duration-300 group-hover:rotate-6" 
                    style={{ backgroundColor: getAlphaColor(color, '30') }} // 20% Opacity (Hex 33)
                >
                    <LucideIcon name={icon} size={22} color={color} />
                </div>
            </div>
        </div>
    );
};

export default KpiCard;
