import { Umbrella, Heart, Briefcase, User, CalendarDays } from 'lucide-react';

export const LEAVE_TYPE_MAP: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
  'Vacation': { 
    label: 'Vacation (พักร้อน)', 
    icon: Umbrella, 
    color: 'text-amber-600', 
    bg: 'bg-amber-50', 
    border: 'border-amber-200' 
  },
  'Sick Leave': { 
    label: 'Sick Leave (ลาป่วย)', 
    icon: Heart, 
    color: 'text-rose-600', 
    bg: 'bg-rose-50', 
    border: 'border-rose-200' 
  },
  'Business Leave': { 
    label: 'Business Leave (ลากิจ)', 
    icon: Briefcase, 
    color: 'text-[#b58c4f]', 
    bg: 'bg-amber-50/50', 
    border: 'border-[#b58c4f]/20' 
  },
  'Personal Leave': { 
    label: 'Personal Leave (ลาส่วนตัว)', 
    icon: User, 
    color: 'text-[#3f809e]', 
    bg: 'bg-sky-50', 
    border: 'border-sky-100' 
  }
};

export const DEFAULT_MAP = { 
  label: 'Other Absence', 
  icon: CalendarDays, 
  color: 'text-[#7a8b95]', 
  bg: 'bg-slate-50', 
  border: 'border-slate-200' 
};
