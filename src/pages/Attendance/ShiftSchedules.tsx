import { UserGuidePanel } from '../../components/shared/UserGuidePanel';
import KpiCard from '../../components/shared/KpiCard';
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';
import { 
  CalendarDays, Search, Plus, Pencil, Trash2, CheckCircle2, AlertTriangle, 
  Clock, Sun, Moon, Sunset, Coffee, Filter, Download, LayoutList, 
  CheckSquare, Layers, Building2, Workflow, HelpCircle, ChevronLeft, ChevronRight, Save, Users, Upload
} from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { DraggableModal } from '../../components/shared/DraggableModal';

const MySwal = withReactContent(Swal);

// --- Theme Configuration (Synced with Home & Permissions Deep Navy/Gold Palette) ---
const THEME = {
  bgMain: '#f3f3f1',
  bgGradient: 'transparent',
  sidebarBg: 'linear-gradient(180deg, #1d2636 0%, #0F172A 100%)',
  glassWhite: 'rgba(255, 255, 255, 0.88)',
  primary: '#212c46',
  primaryLight: '#4d87a8',
  accent: '#a94228',
  gold: '#b58c4f',
  brightGold: '#b7a159',
  success: '#657f4d',
  danger: '#932c2e',
  skyBlue: '#3f809e',
  dustyBlue: '#7a8b95',
  indigo: '#414757',
  softPurple: '#ab7d82',
  deepPurple: '#2d2c4a',
  pinkAccent: '#a54f6b',
  mutedSlate: '#606a5f',
  darkSlate: '#2f2926',
  silver: '#d7d7d7',
  deepNavy: '#212c46',
  brownGold: '#b58c4f',
  vibrantPurple: '#2d2c4a',
  burntOrange: '#d96245',
  slateBlue: '#748ea1',
  coolGray: '#eaeaec'
};

const kebabToPascal = (str: string) => str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
const LucideIcon = ({ name, size = 16, className = "", color, style, strokeWidth = 2.5 }: any) => {
    if (!name) return null;
    if (typeof name !== 'string') {
        const IconComponent = name;
        return <IconComponent size={size} className={className} style={{...style, color: color}} strokeWidth={strokeWidth} />;
    }
    const pascalName = kebabToPascal(name);
    const IconComponent = Icons[pascalName as keyof typeof Icons] || Icons.CircleHelp;
    if (!IconComponent) return null;
    return <IconComponent size={size} className={className} style={{...style, color: color}} strokeWidth={strokeWidth} />;
};

const SHIFT_TYPES: Record<string, { id: string; label: string; time: string; icon: any; color: string; bg: string; border: string }> = {
    'M': { id: 'M', label: 'Morning', time: '08:00 - 17:00', icon: Sun, color: THEME.gold, bg: '#fdfaf1', border: '#e8dbb9' },
    'A': { id: 'A', label: 'Afternoon', time: '14:00 - 23:00', icon: Sunset, color: THEME.burntOrange, bg: '#fcf4f2', border: '#eedbe2' },
    'N': { id: 'N', label: 'Night', time: '22:00 - 07:00', icon: Moon, color: THEME.primary, bg: '#f0f4f8', border: '#c5dbe5' },
    'O': { id: 'O', label: 'Day Off', time: 'Rest Day', icon: Coffee, color: THEME.dustyBlue, bg: '#f3f3f1', border: '#d1d1d5' },
};

// Manufacturing Hierarchy Data Structure
const HIERARCHY: Record<string, Record<string, string[]>> = {
    'Production': {
        'Preparation': ['Prep Team A', 'Prep Team B'],
        'Cooking': ['Cook Line 1', 'Cook Line 2'],
        'Packing': ['Pack Team A', 'Pack Team B', 'Pack Team C']
    },
    'Quality Assurance': {
        'In-line QC': ['QC Shift 1', 'QC Shift 2'],
        'Laboratory': ['Chem Lab', 'Bio Lab']
    },
    'Warehouse & Logistics': {
        'Raw Material': ['RM Receiving', 'RM Storage'],
        'Finished Goods': ['FG Loading', 'FG Forklift']
    }
};

// INITIAL DATA - GROUP BASED
const INITIAL_SCHEDULES = [
  { id: 1, dept: 'Production', section: 'Cooking', group: 'Cook Line 1', startDate: '2024-10-21', endDate: '2024-10-27', shift: 'M', status: 'Published' },
  { id: 2, dept: 'Production', section: 'Packing', group: 'Pack Team A', startDate: '2024-10-21', endDate: '2024-10-27', shift: 'A', status: 'Published' },
  { id: 3, dept: 'Quality Assurance', section: 'In-line QC', group: 'QC Shift 1', startDate: '2024-10-21', endDate: '2024-10-25', shift: 'N', status: 'Draft' },
  { id: 4, dept: 'Warehouse & Logistics', section: 'Finished Goods', group: 'FG Loading', startDate: '2024-10-28', endDate: '2024-11-03', shift: 'M', status: 'Published' },
];

function DeptShiftModal({ isOpen, onClose, record, onSave }: any) {
    const [modalStep, setModalStep] = useState(0);
    const [formData, setFormData] = useState<any>({ 
        dept: '', section: '', group: '', startDate: '', endDate: '', shift: 'M', status: 'Draft' 
    });

    useEffect(() => {
        if (isOpen) {
            setModalStep(0);
            if (record) {
                setFormData({ ...record });
            } else {
                const today = new Date().toISOString().split('T')[0];
                setFormData({ dept: '', section: '', group: '', startDate: today, endDate: today, shift: 'M', status: 'Draft' });
            }
        }
    }, [isOpen, record]);

    if (!isOpen) return null;

    const availableSections = formData.dept && HIERARCHY[formData.dept] ? Object.keys(HIERARCHY[formData.dept]) : [];
    const availableGroups = formData.dept && formData.section && HIERARCHY[formData.dept][formData.section] ? HIERARCHY[formData.dept][formData.section] : [];

    const handleFieldChange = (name: string, value: string) => {
        setFormData((prev: any) => {
            const newData = { ...prev, [name]: value };
            if (name === 'dept') { newData.section = ''; newData.group = ''; }
            if (name === 'section') { newData.group = ''; }
            if (name === 'startDate' && newData.endDate < value) { newData.endDate = value; }
            return newData;
        });
    };

    const handleSave = () => {
        if (!formData.dept || !formData.section || !formData.group || !formData.startDate || !formData.endDate) {
            Swal.fire({
                icon: 'warning',
                title: 'กรอกข้อมูลไม่ครบถ้วน',
                text: 'กรุณากรอกสายงาน แผนก และวันที่ทำการจัดกะให้ครบทุกช่อง',
                confirmButtonColor: '#212c46'
            });
            return;
        }
        onSave(formData);
        onClose();
        MySwal.fire({
            icon: 'success',
            title: record ? 'ปรับปรุงกะกลุ่มสำเร็จ' : 'จ่ายกะกลุ่มแผนกสำเร็จ',
            html: `ตารางประจำการกะกลุ่ม <b>${formData.group}</b> วันพ้นรอบจัดตารางเวลาเรียบร้อยแล้ว`,
            confirmButtonColor: '#212c46'
        });
    };

    return (
        <DraggableModal
            isOpen={isOpen}
            onClose={onClose}
            width="max-w-[950px]"
            customHeader={
                <div className="bg-[#212c46] px-4 py-3 flex justify-between items-center shrink-0 border-b-2 border-[#b7a159]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/20 shadow-sm overflow-hidden">
                            <Layers size={18} className="text-[#b7a159]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-[#d7d7d7] uppercase tracking-widest leading-none mb-1">{record ? 'EDIT GROUP SHIFT' : 'ASSIGN DEPT ROSTER'}</h3>
                            <p className="text-[10px] font-bold text-[#b7a159]/90 uppercase tracking-widest mt-0.5">Hierarchy Node Scheduler • No Names Required</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-[#932c2e] transition-all bg-white/10 hover:bg-white/20 p-1.5 rounded-full"><Icons.X size={16} /></button>
                </div>
            }
        >
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#f8f9fa] min-h-[460px]">
                {/* Sidebar Configuration Steps (Permissions Standard) */}
                <div className="w-full md:w-56 bg-white border-b md:border-b-0 md:border-r border-[#eaeaec] flex flex-row md:flex-col shrink-0">
                    <div className="hidden md:block px-4 py-4 text-[10px] font-black text-[#7a8b95] uppercase tracking-widest border-b border-[#eaeaec] bg-[#f8f9fa]">Roster Segments</div>
                    {[0, 1, 2, 3].map(step => (
                        <button 
                            key={step} 
                            type="button"
                            onClick={() => setModalStep(step)} 
                            className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-3 px-4 py-3 text-left transition-all md:border-l-4 ${modalStep === step ? 'border-b-4 md:border-b-0 border-[#b7a159] bg-[#f8f9fa] text-[#212c46]' : 'border-transparent text-[#7a8b95] hover:bg-[#f8f9fa]/50'}`}
                        >
                            <LucideIcon name={step === 0 ? 'Building2' : step === 1 ? 'Calendar' : step === 2 ? 'Clock' : 'CheckSquare'} size={16} color={modalStep === step ? THEME.brightGold : undefined} />
                            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest">
                                STEP {step + 1}: {step === 0 ? 'ORG TARGET' : step === 1 ? 'DATE RANGE' : step === 2 ? 'SHIFT CARD' : 'PUBLISH'}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Step Forms */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white">
                    {modalStep === 0 && (
                        <div className="space-y-4 max-w-xl animate-fadeIn pb-6 flex-1 flex-col flex min-h-0">
                            <h4 className="text-[12px] font-black text-[#212c46] uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-4">ระบุกลุ่มงานรับคำสั่งกะประจำการ (Organizational Node)</h4>
                            
                            <div>
                                <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">Department / ฝ่ายการทำงานหลัก</label>
                                <select 
                                    value={formData.dept} 
                                    onChange={e => handleFieldChange('dept', e.target.value)} 
                                    className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2.5 text-[12px] font-black text-[#212c46] outline-none focus:border-[#b7a159]"
                                >
                                    <option value="">-- เลือกฝ่ายโครงสร้าง --</option>
                                    {Object.keys(HIERARCHY).map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">Section / แผนกย่อย</label>
                                <select 
                                    value={formData.section} 
                                    onChange={e => handleFieldChange('section', e.target.value)} 
                                    disabled={!formData.dept}
                                    className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2.5 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#b7a159] disabled:opacity-50"
                                >
                                    <option value="">-- เลือกแผนกย่อย --</option>
                                    {availableSections.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">Group / สายกะฝ่ายผลิตวิกฤต</label>
                                <select 
                                    value={formData.group} 
                                    onChange={e => handleFieldChange('group', e.target.value)} 
                                    disabled={!formData.section}
                                    className="w-full bg-[#f0f4f8] border border-[#4d87a8]/40 rounded-lg px-4 py-2.5 text-[12px] font-black text-[#212c46] outline-none focus:border-[#b7a159] disabled:opacity-50"
                                >
                                    <option value="">-- เลือกกลุ่มชุดทำงาน --</option>
                                    {availableGroups.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    {modalStep === 1 && (
                        <div className="space-y-4 max-w-xl animate-fadeIn pb-6">
                            <h4 className="text-[12px] font-black text-[#212c46] uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-4">กำหนดวันปฏิบัติรอบตารางงาน (Roster Range)</h4>
                            
                            <div>
                                <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">Start Date / เริ่มปฏิบัติงานกะ</label>
                                <input 
                                    type="date" 
                                    value={formData.startDate} 
                                    onChange={e => handleFieldChange('startDate', e.target.value)} 
                                    className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-mono font-bold text-[#212c46] outline-none focus:border-[#b7a159]" 
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">End Date / วันสุดท้ายที่กะนี้มีผลลัพธ์</label>
                                <input 
                                    type="date" 
                                    value={formData.endDate} 
                                    min={formData.startDate}
                                    onChange={e => handleFieldChange('endDate', e.target.value)} 
                                    className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-mono font-bold text-[#212c46] outline-none focus:border-[#b7a159]" 
                                />
                            </div>
                        </div>
                    )}

                    {modalStep === 2 && (
                        <div className="space-y-4 animate-fadeIn pb-6">
                            <h4 className="text-[12px] font-black text-[#212c46] uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-4">เลือกรูปแบบกะการยืนเครื่องผลิต (Roster Shift Selection)</h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {Object.values(SHIFT_TYPES).map(shift => {
                                    const ShIcon = shift.icon;
                                    const isSelected = formData.shift === shift.id;
                                    return (
                                        <div 
                                            key={shift.id} 
                                            onClick={() => handleFieldChange('shift', shift.id)}
                                            className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer shadow-sm relative group hover:shadow-md ${isSelected ? 'border-transparent shadow-lg text-white' : 'bg-white border-[#eaeaec]'}`}
                                            style={isSelected ? { backgroundColor: shift.bg, borderColor: shift.color, color: shift.color } : {}}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${isSelected ? 'bg-white' : 'bg-[#f8f9fa]'}`} style={{ color: shift.color, borderColor: isSelected ? shift.border : '#eaeaec' }}>
                                                <ShIcon size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-[12.5px] uppercase tracking-widest leading-none text-[#212c46]">{shift.label}</span>
                                                <span className="text-[10px] font-bold text-[#7a8b95] font-tech mt-1.5">{shift.time}</span>
                                            </div>
                                            {isSelected && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <CheckCircle2 size={18} style={{ color: shift.color }} className="opacity-80" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {modalStep === 3 && (
                        <div className="space-y-4 max-w-xl animate-fadeIn pb-6">
                            <h4 className="text-[12px] font-black text-[#212c46] uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-4">ยืนยันสถานะการกระจายข้อมูลกะ (Roster Status Launch)</h4>
                            
                            <div>
                                <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">Publish Status / สถานะการนำออกไปใช้งาน</label>
                                <select 
                                    value={formData.status} 
                                    onChange={e => handleFieldChange('status', e.target.value)} 
                                    className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2.5 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#b7a159]"
                                >
                                    <option value="Draft">Draft (เก็บรูปแบบคาดการณ์ล่วงหน้า - กะยังไม่แจ้งพนักงาน)</option>
                                    <option value="Published">Published (เผยแพร่ใช้งานทันที - ขึ้นตารางแจ้งพนักงานในกลุ่ม)</option>
                                </select>
                            </div>

                            <div className="p-4 bg-[#fdfaf1] border border-[#e8dbb9] rounded-2xl flex items-start gap-3 mt-4">
                                <AlertTriangle className="text-[#b58c4f] shrink-0 mt-0.5" size={18} />
                                <p className="text-[11.5px] text-[#7a8b95] font-bold leading-relaxed">
                                    การตั้งค่ากะเหมากลุ่มตามระบบ L1 ➔ L2 ➔ L3 จะไม่มีรายชื่อบุคคลรายคน แต่จะเป็นการสั่งการตารางภาระงานสำหรับคุมพนักงานในกลุ่มทั้งหมดพร้อมกันเพื่อลดความซับซ้อน ปรับสีทอง-กรม ตารางซิงค์ระบบตารางหลัก
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-3 bg-[#f8f9fa] border-t border-[#eaeaec] flex justify-end gap-3 shrink-0">
                <button onClick={onClose} className="px-5 py-2 bg-white border border-[#eaeaec] text-[#414757] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#d7d7d7]/30 transition-all cursor-pointer">Cancel</button>
                <button onClick={handleSave} className="bg-[#212c46] text-white px-6 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md hover:bg-[#414757] hover:text-white transition-all flex items-center gap-2 cursor-pointer"><Icons.Save size={14}/> Save Schedule</button>
            </div>
        </DraggableModal>
    );
}

export default function ShiftSchedulesByDept() {
  const [schedules, setSchedules] = useState<any[]>([]);
  
  // Advanced Filters
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [modalState, setModalState] = useState<{ isOpen: boolean; record: any }>({ isOpen: false, record: null });
  const [toast, setToast] = useState<string | null>(null);

  // Load from local storage or set initial data to prevent losing sample records
  useEffect(() => {
    const saved = localStorage.getItem('local_shift_schedules');
    if (saved) {
      try {
        setSchedules(JSON.parse(saved));
      } catch (e) {
        setSchedules(INITIAL_SCHEDULES);
      }
    } else {
      setSchedules(INITIAL_SCHEDULES);
      localStorage.setItem('local_shift_schedules', JSON.stringify(INITIAL_SCHEDULES));
    }
  }, []);

  const saveToStorage = (newRecords: any[]) => {
      setSchedules(newRecords);
      localStorage.setItem('local_shift_schedules', JSON.stringify(newRecords));
  };

  // Filter Dropdown Options & Counts
  const deptCounts = useMemo(() => {
      const counts: Record<string, number> = {};
      schedules.forEach(s => { counts[s.dept] = (counts[s.dept] || 0) + 1; });
      return counts;
  }, [schedules]);

  const groupCounts = useMemo(() => {
      const counts: Record<string, number> = {};
      schedules.forEach(s => {
          if (!filterDept || s.dept === filterDept) {
              counts[s.group] = (counts[s.group] || 0) + 1;
          }
      });
      return counts;
  }, [schedules, filterDept]);

  const deptOptions = Object.keys(HIERARCHY);
  const groupOptions = filterDept 
      ? Object.values(HIERARCHY[filterDept] || {}).flat() 
      : Object.values(HIERARCHY).flatMap(dept => Object.values(dept).flat());
  const uniqueGroupOptions = [...new Set(groupOptions)];

  // Filtering Logic
  const filteredData = useMemo(() => {
      return schedules.map(sched => ({...sched, shiftDetails: SHIFT_TYPES[sched.shift]})).filter(r => {
          const searchStr = search.toLowerCase();
          const matchSearch = searchStr === '' || (
              r.dept?.toLowerCase().includes(searchStr) || 
              r.section?.toLowerCase().includes(searchStr) || 
              r.group?.toLowerCase().includes(searchStr) ||
              r.startDate?.includes(searchStr) ||
              r.endDate?.includes(searchStr) ||
              r.status?.toLowerCase().includes(searchStr) ||
              r.shiftDetails?.label.toLowerCase().includes(searchStr)
          );
          
          const matchDept = filterDept === '' || r.dept === filterDept;
          const matchGroup = filterGroup === '' || r.group === filterGroup;
          
          // Match Year-Month
          const matchDate = filterDate === '' || (() => {
              const [year, month] = filterDate.split('-');
              const filterStart = new Date(Number(year), Number(month) - 1, 1);
              const filterEnd = new Date(Number(year), Number(month), 0); // last day of the month
              const shiftStart = new Date(r.startDate);
              const shiftEnd = new Date(r.endDate);
              // Check if any part of the shift falls within the selected month
              return shiftStart <= filterEnd && shiftEnd >= filterStart;
          })();
          
          return matchSearch && matchDept && matchGroup && matchDate;
      }).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()); // Sort latest start date first
  }, [schedules, search, filterDept, filterGroup, filterDate]);

  const currentData = useMemo(() => {
    return filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

  // KPI Calculations
  const totalGroupShifts = filteredData.length;
  const publishedShifts = filteredData.filter(r => r.status === 'Published').length;
  const draftShifts = filteredData.filter(r => r.status === 'Draft').length;
  const uniqueGroups = new Set(filteredData.map(r => r.group)).size;

  // Handlers
  const handleOpenModal = (record = null) => setModalState({ isOpen: true, record });
  
  const handleSaveRecord = (formData: any) => {
      if (formData.id) {
          // Single Edit
          const updated = schedules.map(r => r.id === formData.id ? formData : r);
          saveToStorage(updated);
      } else {
          // Single Create (Group Level)
          let currentMaxId = schedules.length > 0 ? Math.max(...schedules.map(r => r.id)) : 0;
          const updated = [...schedules, { ...formData, id: currentMaxId + 1 }];
          saveToStorage(updated);
      }
  };

  const handleDelete = (id: number) => {
      const targetSched = schedules.find(s => s.id === id);
      if (!targetSched) return;
      MySwal.fire({
          title: 'ลบตารางงานกะหรือไม่?',
          text: `คุณต้องการลบตารางกะกลุ่มสำหรับทีม ${targetSched.group} ตลอดระยะเวลานั้น พ้นระบบด่วนใช่ไไหม? ข้อมูลนี้ไม่สามารถกู้คืนได้`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'ลบบันทึก',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#932c2e',
          cancelButtonColor: '#7a8b95'
      }).then(result => {
          if (result.isConfirmed) {
              const updated = schedules.filter(r => r.id !== id);
              saveToStorage(updated);
              Swal.fire({
                  icon: 'success',
                  title: 'ลบเรียบร้อยแล้ว',
                  text: 'ระบบทำการนำตารางกะเหมากลุ่มออกสมบูรณ์แล้ว',
                  confirmButtonColor: '#212c46'
              });
          }
      });
  };

  const handlePublishAll = () => {
      const draftsToPublish = filteredData.filter(s => s.status === 'Draft').map(s => s.id);
      if(draftsToPublish.length > 0) {
          MySwal.fire({
              title: 'เผยแพร่ตารางดราฟต์ทั้งหมด?',
              text: `ระบบจะทำการเผยแพร่ตารางดราฟต์กลุ่ม คืนสถานะใช้งานสมบูรณ์ให้พนักงานทั้งหมดจำนวน ${draftsToPublish.length} กะ`,
              icon: 'question',
              showCancelButton: true,
              confirmButtonText: 'เผยแพร่ทั้งหมด (Publish)',
              cancelButtonText: 'Cancel',
              confirmButtonColor: '#657f4d',
              cancelButtonColor: '#7a8b95'
          }).then(result => {
              if (result.isConfirmed) {
                  const updated = schedules.map(s => draftsToPublish.includes(s.id) ? {...s, status: 'Published'} : s);
                  saveToStorage(updated);
                  Swal.fire({
                      icon: 'success',
                      title: 'เผยแพร่สำเร็จ',
                      text: `ทำการเผยแพร่ตารางกำลังพลกะกลุ่มทั้งสิ้น ${draftsToPublish.length} รายการเรียบร้อยแล้ว`,
                      confirmButtonColor: '#212c46'
                  });
              }
          });
      } else {
          Swal.fire({
              icon: 'info',
              title: 'ไม่มีตารางกะแบบ Draft',
              text: 'ตารางในมุมมองปัจจุบันเป็นเวอร์ชันเผยแพร่ทั้งหมดเรียบร้อยแล้ว',
              confirmButtonColor: '#212c46'
          });
      }
  };

  return (
      <div className="flex flex-1 w-full flex-col animate-fadeIn bg-transparent space-y-4 pb-6">
          {/* USER GUIDE FLOATING TAB */}
          {typeof document !== 'undefined' && createPortal(
              <button onClick={() => setIsGuideOpen(true)} className="fixed right-0 bg-[#f8f9fa] border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#932c2e] hover:text-white hover:border-[#932c2e] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group" style={{ top: '160px' }}>
                  <Icons.HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#7a8b95] group-hover:text-white" />
                  <span className="font-black tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[11px]">DEPT GUIDE</span>
              </button>,
              document.body
          )}
          <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
          <DeptShiftModal isOpen={modalState.isOpen} onClose={() => setModalState({isOpen: false, record: null})} record={modalState.record} onSave={handleSaveRecord} />
          {/* HEADER SECTION --- Permissions Page Layout Match */}
          <div className="h-14 px-8 flex flex-row items-center justify-between gap-4 z-20 shrink-0">
              <div className="flex items-center gap-5">
                  <div className="relative flex items-center justify-center group cursor-default shrink-0">
                      <div className="absolute inset-0 bg-[#4d87a8] blur-[15px] opacity-20 rounded-full group-hover:opacity-60 transition-all duration-700"></div>
                      <div className="relative z-10 p-1.5 border border-[#4d87a8]/40 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm">
                          <Icons.Layers size={28} strokeWidth={2.5} className="text-[#3f809e]" />
                      </div>
                  </div>
                  <div>
                      <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none font-exception-header" style={{ fontSize: '24px' }}>
                          SHIFT SCHEDULES <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4d87a8] to-[#b58c4f]">BY DEPT</span> NODE
                      </h3>
                      <p className="text-[11px] font-bold text-[#4d5a44] uppercase tracking-[0.2em] mt-0.5 opacity-80 leading-none">
                          DEPARTMENTAL WIDE TEAM ROSTERS & GROUP COMPLIANCE HUB
                      </p>
                  </div>
              </div>

              <div className="flex items-center gap-3">
                  <input 
                      type="month" 
                      value={filterDate} 
                      onChange={(e) => setFilterDate(e.target.value)} 
                      className="bg-white/80 backdrop-blur-md border border-[#eaeaec] text-[#414757] px-4 py-2.5 rounded-full shadow-sm outline-none focus:border-[#4d87a8] focus:ring-1 focus:ring-[#4d87a8]/20 font-tech text-[11px] font-bold cursor-pointer" 
                      title="Filter by Month" 
                  />
                  <button 
                      onClick={handlePublishAll} 
                      className="hidden lg:flex items-center gap-2 bg-[#657f4d] border border-[#657f4d] text-white hover:bg-emerald-700 px-5 py-2.5 rounded-full shadow-sm transition-all font-black text-[11px] uppercase tracking-widest cursor-pointer"
                  >
                      <CheckSquare size={14} /> Publish View Drafts
                  </button>
              </div>
          </div>
          <div className="px-4 sm:px-8 w-full mt-[2px]">
            <div className="w-full space-y-4">
                
                {/* KPI CARDS SYSTEM */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3 shrink-0">
                    <KpiCard
                        label="Group Schedules"
                        value={totalGroupShifts}
                        icon="calendar-days"
                        color={THEME.primaryLight}
                        description="Rostered Slots" />
                    <KpiCard
                        label="Distinct Groups"
                        value={uniqueGroups}
                        icon="workflow"
                        color={THEME.gold}
                        description="Active Teams" />
                    <KpiCard
                        label="Confirmed Shifts"
                        value={publishedShifts}
                        icon="check-circle"
                        color={THEME.success}
                        description="Published Roster" />
                    <KpiCard
                        label="Draft Shifts"
                        value={draftShifts}
                        icon="alert-triangle"
                        color={draftShifts > 0 ? THEME.danger : THEME.dustyBlue}
                        description="Draft Planning" />
                </div>

                {/* MAIN ROSTER PORTAL CARD */}
                <div className="bg-white rounded-3xl shadow-lg border border-[#eaeaec] overflow-hidden flex flex-col animate-fadeIn  flex-1 min-h-0">
                    
                    {/* TOOLBAR */}
                    <div className="px-8 py-4 border-b border-[#eaeaec] bg-[#f8f9fa] flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 shrink-0">
                        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                            
                            {/* CASCADING FILTER DROPDOWNS */}
                            <select 
                                value={filterDept} 
                                onChange={(e) => { setFilterDept(e.target.value); setFilterGroup(''); }} 
                                className="bg-white border border-[#eaeaec] rounded-full px-4 py-2.5 text-[11px] font-black outline-none focus:border-[#4d87a8] text-[#414757] shadow-sm cursor-pointer w-full sm:w-44 appearance-none"
                            >
                                <option value="">All Depts</option>
                                {deptOptions.map(d => <option key={d} value={d}>{d} ({deptCounts[d] || 0})</option>)}
                            </select>

                            <select 
                                value={filterGroup} 
                                onChange={(e) => setFilterGroup(e.target.value)} 
                                className="bg-white border border-[#eaeaec] rounded-full px-4 py-2.5 text-[11px] font-black outline-none focus:border-[#4d87a8] text-[#414757] shadow-sm cursor-pointer w-full sm:w-44 appearance-none"
                            >
                                <option value="">All Groups</option>
                                {uniqueGroupOptions.map(g => <option key={g} value={g}>{g} ({groupCounts[g] || 0})</option>)}
                            </select>

                            <div className="h-6 w-[2.5px] bg-[#eaeaec] hidden sm:block mx-1"></div>

                            {/* ADVANCED SEARCH */}
                            <div className="relative w-full sm:w-64">
                                <Icons.Search size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7a8b95]" />
                                <input 
                                    type="text" 
                                    value={search} 
                                    onChange={(e) => setSearch(e.target.value)} 
                                    placeholder="Search any fields..." 
                                    className="w-full pl-11 pr-5 py-2.5 text-[11.5px] border border-[#eaeaec] rounded-full font-bold outline-none focus:border-[#4d87a8] bg-white shadow-sm text-[#212c46] transition-all" 
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto shrink-0">
                            <button 
                                onClick={() => Swal.fire({ icon: 'info', title: 'Upload Feature', text: 'เครื่องมือประมวลผล Roster CSV นำเข้าคลาวด์ อยู่ในขั้นตอนเปิดสิทธิ์ระบบ', confirmButtonColor: '#212c46' })} 
                                className="bg-white border border-[#eaeaec] text-[#212c46] hover:bg-[#f8f9fa] py-2.5 px-6 rounded-full text-[11px] uppercase font-black tracking-widest shadow-sm flex items-center justify-center gap-1.5 w-full sm:w-auto shrink-0 transition-colors cursor-pointer"
                            >
                                <Upload size={14} strokeWidth={2.5} /> Upload CSV
                            </button>
                            <button 
                                onClick={() => handleOpenModal()} 
                                className="bg-[#212c46] text-white px-6 py-2.5 rounded-full font-black text-[11px] uppercase tracking-widest shadow-md hover:bg-[#414757] transition-all flex items-center justify-center gap-2 w-full sm:w-auto shrink-0 border border-[#212c46] cursor-pointer"
                            >
                                <Plus size={14} strokeWidth={3} /> Assign Group Shift
                            </button>
                        </div>
                    </div>

                    {/* DATA TABLE RENDER */}
                    <div className="overflow-auto custom-scrollbar  flex-1 min-h-0">
                        <table className="w-full text-left font-sans border-collapse min-w-[1000px]">
                            <thead className="bg-[#212c46] text-white">
                                <tr className="border-b-2 border-[#b7a159]">
                                    <th className="py-4 px-6 font-black uppercase tracking-widest text-[11px] whitespace-nowrap">Duration Cycle</th>
                                    <th className="py-4 px-6 font-black uppercase tracking-widest text-[11px] whitespace-nowrap">Department</th>
                                    <th className="py-4 px-6 font-black uppercase tracking-widest text-[11px] whitespace-nowrap">Section</th>
                                    <th className="py-4 px-6 font-black uppercase tracking-widest text-[11px] whitespace-nowrap">Target Group</th>
                                    <th className="py-4 px-6 font-black uppercase tracking-widest text-[11px] whitespace-nowrap">Assigned Shift Config</th>
                                    <th className="py-4 px-6 font-black uppercase tracking-widest text-[11px] text-center w-36">Status</th>
                                    <th className="py-4 px-6 font-black uppercase tracking-widest text-[11px] text-center w-32">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-[#eaeaec]">
                                {currentData.map((item) => {
                                    const details = item.shiftDetails;
                                    const SIcon = details.icon;
                                    return (
                                        <tr key={item.id} className="hover:bg-[#f8f9fa] transition-colors group">
                                            <td className="py-3 px-6 whitespace-nowrap">
                                                <p className="font-tech text-[#212c46] font-black text-[12.5px] bg-[#f8f9fa] inline-block px-3 py-1 rounded-full border border-[#eaeaec]">
                                                    {item.startDate} <span className="text-[#b58c4f] font-sans font-bold text-[9.5px] mx-1.5 uppercase tracking-widest">to</span> {item.endDate}
                                                </p>
                                            </td>
                                            <td className="py-3 px-6">
                                                <p className="text-[12px] font-black text-[#212c46] uppercase tracking-wide">{item.dept}</p>
                                            </td>
                                            <td className="py-3 px-6">
                                                <p className="text-[11px] font-semibold text-[#414757] uppercase tracking-wide">{item.section}</p>
                                            </td>
                                            <td className="py-3 px-6">
                                                <p className="text-[12px] font-black text-[#b58c4f] uppercase tracking-wide flex items-center gap-1.5">
                                                    <Users size={14} className="text-[#b58c4f] opacity-70"/> {item.group}
                                                </p>
                                            </td>
                                            <td className="py-3 px-6">
                                                <div className="flex items-center gap-3 px-4 py-1.5 rounded-xl border inline-flex shadow-sm" style={{ backgroundColor: details.bg, borderColor: details.border }}>
                                                    <SIcon size={15} style={{ color: details.color }} />
                                                    <div className="flex flex-col">
                                                        <span className="text-[10.5px] font-black uppercase tracking-wider leading-none" style={{ color: details.color }}>{details.label}</span>
                                                        <span className="text-[9.5px] font-bold text-[#606a5f] font-tech mt-0.5">{details.time}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-6 text-center">
                                               <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm
                                                    ${item.status === 'Published' ? 'bg-[#657f4d]/10 text-[#657f4d] border-[#657f4d]/30' : 
                                                      'bg-[#d96245]/10 text-[#d96245] border-[#d96245]/30'}`}>
                                                   {item.status}
                                               </span>
                                            </td>
                                            <td className="py-3 px-6 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                                                <div className="flex justify-center items-center gap-1">
                                                    <button onClick={() => handleOpenModal(item)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#3f809e] hover:bg-[#3f809e]/10 hover:shadow-sm transition-all active:scale-90 cursor-pointer" title="Edit Shift">
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button onClick={() => handleDelete(item.id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#932c2e] hover:bg-[#932c2e]/10 hover:shadow-sm transition-all active:scale-90 cursor-pointer" title="Delete Shift">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {currentData.length === 0 && (
                                    <tr><td colSpan={7} className="text-center py-10 text-[#7a8b95] font-black text-[12px] uppercase">No group schedule records found matching your conditions.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION / FOOTER */}
                    <div className="px-8 py-3 bg-[#eaeaec]/30 border-t border-[#eaeaec] flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                        <div className="flex items-center gap-5 text-[11px] font-black text-[#7a8b95] uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <span>Display Rows:</span>
                                <select 
                                    value={itemsPerPage} 
                                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} 
                                    className="bg-white border border-[#eaeaec] rounded-lg px-2.5 py-1 outline-none font-black text-[#414757] cursor-pointer shadow-sm focus:border-[#4d87a8] appearance-none"
                                >
                                    {[5, 10, 20, 50].map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                            <p className="bg-white px-3.5 py-1 rounded-lg border border-[#eaeaec] shadow-sm font-tech">Total Records: {filteredData.length}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`w-9 h-9 border border-[#eaeaec] bg-white rounded-lg flex items-center justify-center transition-all cursor-pointer ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#212c46] hover:text-white hover:border-[#212c46] shadow-sm active:scale-90'}`}>
                                <ChevronLeft size={16}/>
                            </button>
                            <div className="bg-white text-[#414757] px-4 py-2 rounded-lg font-black text-[11px] min-w-[100px] text-center uppercase tracking-widest border border-[#eaeaec] shadow-sm font-tech">
                                Page {currentPage} / {totalPages}
                            </div>
                            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className={`w-9 h-9 border border-[#eaeaec] bg-white rounded-lg flex items-center justify-center transition-all cursor-pointer ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#212c46] hover:text-white hover:border-[#212c46] shadow-sm active:scale-90'}`}>
                                <ChevronRight size={16}/>
                            </button>
                        </div>
                    </div>
                </div>
                
            </div>
          </div>
      </div>
  );
}
