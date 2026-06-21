import React from 'react';
import * as Icons from 'lucide-react';

const kebabToPascal = (str: string) => str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');

interface LucideIconProps {
  name: string | React.ElementType;
  size?: number;
  className?: string;
  color?: string;
  style?: React.CSSProperties;
  strokeWidth?: number;
}

export const LucideIcon: React.FC<LucideIconProps> = ({ name, size = 16, className = "", color, style, strokeWidth = 2.5 }) => {
    if (!name) return null;
    if (typeof name !== 'string') {
        const IconComponent = name as React.ElementType;
        return <IconComponent size={size} className={className} style={{...style, color: color}} strokeWidth={strokeWidth} />;
    }
    const pascalName = kebabToPascal(name);
    const IconComponent = (Icons as any)[pascalName] || Icons.CircleHelp;
    if (!IconComponent) return null;
    return <IconComponent size={size} className={className} style={{...style, color: color}} strokeWidth={strokeWidth} />;
};
