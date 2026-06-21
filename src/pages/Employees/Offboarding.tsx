import { UserGuidePanel } from '../../components/shared/UserGuidePanel';
import KpiCard from '../../components/shared/KpiCard';
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';
import { 
  UserMinus, Search, Plus, Trash2, X, Save, ChevronLeft, ChevronRight, 
  HelpCircle, CheckCircle2, AlertTriangle, FileText, Send, Clock, BookOpen,
  MonitorSmartphone, Presentation, Upload, Link, Eye, CheckSquare, Briefcase, 
  Wallet, ShieldAlert, Key, ClipboardCheck, ArrowLeftRight, Archive, Ban, 
  MessageSquare, FileCheck
} from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { DraggableModal } from '../../components/shared/DraggableModal';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell
} from 'recharts';

const MySwal = withReactContent(Swal);

// --- Theme Configuration (Synced with Home & Permissions Deep Navy/Gold Palette) ---
const THEME = {
  bgMain: '#f3f3f1',
  bgGradient: 'transparent',
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

const DEFAULT_TASKS = {
    it: [
        { id: 'it1', label: 'รับคืน Computer / Laptop / Mobile Hardware', done: false },
        { id: 'it2', label: 'ยกเลิกสิทธิ์เข้าถึงระบบ ERP / HRMS & Cloud Space VPN', done: false },
        { id: 'it3', label: 'ปิดหรือระงับบัญชี Email องค์กรและช่องทางติดต่อ', done: false },
        { id: 'it4', label: 'สำรองข้อมูลพนักงาน (Personal Data Backup Storage)', done: false },
    ],
    hr: [
        { id: 'hr1', label: 'รับคืนบัตรพนักงาน / บัตรจอดรถพนักงาน / กุญแจอาคาร', done: false },
        { id: 'hr2', label: 'ตรวจสอบการส่งคืนชุดยูนิฟอร์มบริษัท (Company Uniform)', done: false },
        { id: 'hr3', label: 'แจ้งออกจากกองทุนประกันสังคม / ยกเลิกประกันกลุ่มสุขภาพ', done: false },
        { id: 'hr4', label: 'จัดเตรียมออกหนังสือรับรองการผ่านงาน (Certificate of Work)', done: false },
        { id: 'hr5', label: 'ตรวจสอบบันทึกการสอนงานส่งมอบหน้าที่เสร็จสิ้น (Handover Doc)', done: false },
    ],
    finance: [
        { id: 'fin1', label: 'หักล้างและเคลียร์บิลเงินสดย่อย / เงินทดรองหมุนเวียนทางการค้า', done: false },
        { id: 'fin2', label: 'เคลียร์หนี้กองทุนเงินสวัสดิการกู้ยืมพนักงาน (ถ้าคงค้าง)', done: false },
        { id: 'fin3', label: 'คำนวณสรุปสัดส่วนเงินเดือนงวดงวดเศษเฉลี่ยวันทำงาน (Prorated Salary)', done: false },
    ]
};

const INITIAL_OFFBOARDING = [
  { 
    id: 1, ticketId: 'OFF-24080', nameTh: 'วิชาญ ชาญชัย', nameEn: 'Wichan Chanchai', 
    image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
    dept: 'Sales & Marketing', jobTitle: 'Sales Executive', lastDate: '2024-08-31',
    status: 'In Progress', progress: 50,
    exitInterview: { reason: 'ได้งานใหม่ (Career Growth)', feedback: 'บริษัทมีสวัสดิการและวัฒนธรรมการทำงานที่ดีมาก แต่อยากพัฒนาและท้าทายตนเองในด้านการเป็นทีมผู้บริหารระดับที่สูงขึ้น', recommended: 'Yes' },
    tasks: {
        it: [ { id: 'it1', label: 'รับคืน Computer / Laptop / Mobile Hardware', done: true }, { id: 'it2', label: 'ยกเลิกสิทธิ์เข้าถึงระบบ ERP / HRMS & Cloud Space VPN', done: true }, { id: 'it3', label: 'ปิดหรือระงับบัญชี Email องค์กรและช่องทางติดต่อ', done: false }, { id: 'it4', label: 'สำรองข้อมูลพนักงาน (Personal Data Backup Storage)', done: false } ],
        hr: [ { id: 'hr1', label: 'รับคืนบัตรพนักงาน / บัตรจอดรถพนักงาน / กุญแจอาคาร', done: false }, { id: 'hr2', label: 'ตรวจสอบการส่งคืนชุดยูนิฟอร์มบริษัท (Company Uniform)', done: false }, { id: 'hr3', label: 'แจ้งออกจากกองทุนประกันสังคม / ยกเลิกประกันกลุ่มสุขภาพ', done: false }, { id: 'hr4', label: 'จัดเตรียมออกหนังสือรับรองการผ่านงาน (Certificate of Work)', done: true }, { id: 'hr5', label: 'ตรวจสอบบันทึกการสอนงานส่งมอบหน้าที่เสร็จสิ้น (Handover Doc)', done: true } ],
        finance: [ { id: 'fin1', label: 'หักล้างและเคลียร์บิลเงินสดย่อย / เงินทดรองหมุนเวียนทางการค้า', done: true }, { id: 'fin2', label: 'เคลียร์หนี้กองทุนเงินสวัสดิการกู้ยืมพนักงาน (ถ้าคงค้าง)', done: true }, { id: 'fin3', label: 'คำนวณสรุปสัดส่วนเงินเดือนงวดงวดเศษเฉลี่ยวันทำงาน (Prorated Salary)', done: false } ]
    }
  },
  { 
    id: 2, ticketId: 'OFF-24081', nameTh: 'สุดา มาดี', nameEn: 'Suda Madee', 
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    dept: 'Sales & Marketing', jobTitle: 'Content Creator', lastDate: '2024-09-15',
    status: 'Not Started', progress: 0,
    exitInterview: { reason: '', feedback: '', recommended: '' },
    tasks: JSON.parse(JSON.stringify(DEFAULT_TASKS))
  }
];

const ProgressBar = ({ progress }: { progress: number }) => {
    let color = THEME.burntOrange; 
    if (progress >= 100) color = THEME.success; 
    else if (progress >= 40) color = THEME.skyBlue; 

    return (
        <div className="w-full flex items-center gap-3">
            <div className="flex-1 h-3 bg-[#eaeaec] rounded-full overflow-hidden border border-[#d7d7d7]/60 shadow-inner">
                <div 
                    className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden" 
                    style={{ width: `${progress}%`, backgroundColor: color }}
                />
            </div>
            <span className="text-[11px] font-black font-mono w-9 text-right" style={{ color }}>{progress}%</span>
        </div>
    );
};

// --- Multi-Step Offboarding Modal as established in User Permissions ---
function EditOffboardingModal({ isOpen, onClose, record, onSave }: any) {
    const [modalStep, setModalStep] = useState(0);
    const [tempRecord, setTempRecord] = useState<any>({});

    useEffect(() => {
        if (isOpen && record) {
            setModalStep(0);
            setTempRecord(JSON.parse(JSON.stringify(record)));
        }
    }, [isOpen, record]);

    if (!isOpen || !record || !tempRecord) return null;

    const handleTaskToggleInStep = (category: string, taskId: string) => {
        setTempRecord((prev: any) => {
            const copy = { ...prev };
            const index = copy.tasks[category].findIndex((t: any) => t.id === taskId);
            if (index > -1) {
                copy.tasks[category][index].done = !copy.tasks[category][index].done;
            }
            return copy;
        });
    };

    const handleInterviewChange = (field: string, value: string) => {
        setTempRecord((prev: any) => ({
            ...prev,
            exitInterview: {
                ...prev.exitInterview,
                [field]: value
            }
        }));
    };

    const calculateCurrentProgress = () => {
        let total = 0, done = 0;
        Object.values(tempRecord.tasks || {}).forEach((cat: any) => {
            total += cat.length;
            done += cat.filter((t: any) => t.done).length;
        });
        return Math.round((done / total) * 100) || 0;
    };

    const handleSave = () => {
        const prog = calculateCurrentProgress();
        const stat = prog === 100 ? 'Completed' : prog > 0 ? 'In Progress' : 'Not Started';
        onSave({ ...tempRecord, progress: prog, status: stat });
        onClose();
        MySwal.fire({
            icon: 'success',
            title: 'อัปเดตข้อมูลพ้นสภาพและ Clearance แล้ว',
            html: `บันทึกข้อมูลและขั้นตอนเคลียร์ทรัพย์สินของคุณ <b>${tempRecord.nameEn}</b> เรียบร้อยแล้ว`,
            confirmButtonColor: '#212c46'
        });
    };

    const progress = calculateCurrentProgress();

    return (
        <DraggableModal
            isOpen={isOpen}
            onClose={onClose}
            width="max-w-[950px]"
            customHeader={
                <div className="bg-[#212c46] px-4 py-3 flex justify-between items-center shrink-0 border-b-2 border-[#b7a159]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/20 shadow-sm overflow-hidden">
                            <img src={tempRecord.image} className="w-full h-full object-cover grayscale opacity-90" alt={tempRecord.nameEn || 'Avatar'} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-[#d7d7d7] uppercase tracking-widest leading-none mb-1">{tempRecord.nameEn || 'CANDIDATE DISCHARGE'}</h3>
                            <p className="text-[10px] font-bold text-[#b7a159]/90 uppercase tracking-widest mt-0.5">{tempRecord.jobTitle || 'ROLE'} • {tempRecord.ticketId}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-[#932c2e] transition-all bg-white/10 hover:bg-white/20 p-1.5 rounded-full"><Icons.X size={16} /></button>
                </div>
            }
        >
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#f8f9fa] min-h-[460px]">
                {/* Left Side Step Wizard */}
                <div className="w-full md:w-[240px] bg-white border-b md:border-b-0 md:border-r border-[#eaeaec] flex flex-row md:flex-col shrink-0">
                    <div className="hidden md:block px-4 py-4 text-[10px] font-black text-[#7a8b95] uppercase tracking-widest border-b border-[#eaeaec] bg-[#f8f9fa]">Offboarding Nodes</div>
                    {[0, 1, 2, 3].map(step => (
                        <button 
                            key={step} 
                            onClick={() => setModalStep(step)} 
                            className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-3 px-4 py-3 text-left transition-all md:border-l-4 ${modalStep === step ? 'border-b-4 md:border-b-0 border-[#b7a159] bg-[#f8f9fa] text-[#212c46]' : 'border-transparent text-[#7a8b95] hover:bg-[#f8f9fa]/50'}`}
                        >
                            <LucideIcon name={step === 0 ? 'User' : step === 1 ? 'MonitorSmartphone' : step === 2 ? 'Briefcase' : 'MessageSquare'} size={16} color={modalStep === step ? THEME.brightGold : undefined} />
                            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest">
                                STEP {step + 1}: {step === 0 ? 'PROFILE' : step === 1 ? 'IT CLEARANCE' : step === 2 ? 'HR & FINANCE' : 'EXIT INTERVIEW'}
                            </span>
                        </button>
                    ))}
                    
                    <div className="hidden md:block mt-auto p-4 border-t border-[#eaeaec]">
                        <p className="text-[10px] font-black text-[#7a8b95] uppercase tracking-widest mb-2 text-center">Clearance Status</p>
                        <ProgressBar progress={progress} />
                    </div>
                </div>

                {/* Main Content Fields */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white">
                    {modalStep === 0 && (
                        <div className="space-y-4 max-w-xl animate-fadeIn pb-6 flex-1 flex-col flex min-h-0">
                            <h4 className="text-[12px] font-black text-[#212c46] uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-4">ข้อมูลพนักงานทั่วไป (Personnel Identity Data)</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">Full EN Name (ภาษาอังกฤษ)</label>
                                    <input 
                                        type="text" 
                                        value={tempRecord.nameEn || ''} 
                                        onChange={e => setTempRecord({ ...tempRecord, nameEn: e.target.value })} 
                                        className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-black uppercase text-[#212c46] outline-none focus:border-[#b7a159]" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">Full TH Name (ภาษาไทย)</label>
                                    <input 
                                        type="text" 
                                        value={tempRecord.nameTh || ''} 
                                        onChange={e => setTempRecord({ ...tempRecord, nameTh: e.target.value })} 
                                        className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#b7a159]" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">Department / สังกัดกลุ่มฝ่ายงาน</label>
                                    <input 
                                        type="text" 
                                        value={tempRecord.dept || ''} 
                                        onChange={e => setTempRecord({ ...tempRecord, dept: e.target.value })} 
                                        className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-black uppercase text-[#212c46] outline-none focus:border-[#b7a159]" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">Position / ตำแหน่งงาน</label>
                                    <input 
                                        type="text" 
                                        value={tempRecord.jobTitle || ''} 
                                        onChange={e => setTempRecord({ ...tempRecord, jobTitle: e.target.value })} 
                                        className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-black uppercase text-[#212c46] outline-none focus:border-[#b7a159]" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">Last Date of Work / วันทำงานสุดท้าย</label>
                                    <input 
                                        type="date" 
                                        value={tempRecord.lastDate || ''} 
                                        onChange={e => setTempRecord({ ...tempRecord, lastDate: e.target.value })} 
                                        className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-mono font-bold text-[#212c46] outline-none focus:border-[#b7a159]" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">Avatar Image Link (ลิงก์รูปถ่าย)</label>
                                <div className="flex flex-col sm:flex-row items-center gap-3 bg-white border border-[#eaeaec] rounded-lg p-3">
                                    <div className="w-16 h-16 rounded-xl bg-[#f8f9fa] border border-[#eaeaec] flex items-center justify-center shadow-sm overflow-hidden shrink-0">
                                        {tempRecord.image ? (
                                            <img src={tempRecord.image} className="w-full h-full object-cover grayscale font-bold" alt="Profile" />
                                        ) : (
                                            <Icons.User size={24} className="text-[#7a8b95]" />
                                        )}
                                    </div>
                                    <div className="flex-1 w-full space-y-2">
                                        <div className="flex gap-2">
                                            <button 
                                                type="button" 
                                                onClick={() => {
                                                    const input = document.createElement('input');
                                                    input.type = 'file';
                                                    input.accept = 'image/*';
                                                    input.onchange = (e: any) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onload = (ev) => {
                                                                setTempRecord({ ...tempRecord, image: ev.target?.result as string });
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    };
                                                    input.click();
                                                }} 
                                                className="bg-[#f8f9fa] border border-[#eaeaec] text-[#212c46] hover:text-[#932c2e] hover:border-[#b7a159] py-1.5 px-3 rounded-lg text-[10px] uppercase font-black tracking-widest shadow-sm flex items-center gap-1.5 flex-1 justify-center transition-colors cursor-pointer"
                                            >
                                                <Icons.Upload size={12} /> Local Computer
                                            </button>

                                            <button 
                                                type="button" 
                                                onClick={() => {
                                                    const textUrl = prompt("Enter Direct URL of image photo:");
                                                    if (textUrl) setTempRecord({ ...tempRecord, image: textUrl });
                                                }} 
                                                className="bg-[#f8f9fa] border border-[#eaeaec] text-[#212c46] hover:text-[#932c2e] hover:border-[#b7a159] py-1.5 px-3 rounded-lg text-[10px] uppercase font-black tracking-widest shadow-sm flex items-center gap-1.5 flex-1 justify-center transition-colors cursor-pointer"
                                            >
                                                <Icons.Link size={12} /> Web Link URL
                                            </button>
                                        </div>
                                        <input 
                                            type="text" 
                                            value={tempRecord.image || ''} 
                                            onChange={e => setTempRecord({ ...tempRecord, image: e.target.value })} 
                                            placeholder="https://..." 
                                            className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded border-dashed px-2 py-1.5 text-[10px] font-bold text-[#414757] outline-none" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {modalStep === 1 && (
                        <div className="space-y-4 animate-fadeIn font-bold pb-6">
                            <h4 className="text-[12px] font-black text-[#212c46] uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-4">คอมพิวเตอร์และสิทธิ์การเข้าถึง (IT Assets Node)</h4>
                            <div className="space-y-3">
                                {tempRecord.tasks?.it?.map((task: any) => (
                                    <div 
                                        key={task.id} 
                                        onClick={() => handleTaskToggleInStep('it', task.id)}
                                        className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer shadow-sm hover:shadow ${task.done ? 'bg-[#3f809e]/5 border-[#3f809e]/40' : 'bg-white border-[#eaeaec]'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-md flex items-center justify-center border font-mono ${task.done ? 'bg-[#3f809e] text-white border-[#3f809e]' : 'bg-[#f8f9fa] border-[#eaeaec]'}`}>
                                                {task.done && <Icons.Check size={12} strokeWidth={4} />}
                                            </div>
                                            <span className={`text-[12px] tracking-tight font-bold ${task.done ? 'text-[#3f809e] line-through opacity-80' : 'text-[#212c46]'}`}>{task.label}</span>
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-white border ${task.done ? 'text-emerald-700 bg-emerald-50 border-emerald-300' : 'text-[#7a8b95] border-[#eaeaec]'}`}>
                                            {task.done ? 'Returned & Cleared' : 'Pending'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {modalStep === 2 && (
                        <div className="space-y-4 animate-fadeIn pb-6">
                            <h4 className="text-[12px] font-black text-[#212c46] uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-4">ตรวจสอบสถานะบุคคลและการเงิน (HR & Finance Nodes)</h4>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-[#7a8b95] uppercase tracking-widest">HR Asset Returns & Certificates</span>
                                    {tempRecord.tasks?.hr?.map((task: any) => (
                                        <div 
                                            key={task.id} 
                                            onClick={() => handleTaskToggleInStep('hr', task.id)}
                                            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${task.done ? 'bg-[#657f4d]/5 border-[#657f4d]/30' : 'bg-white border-[#eaeaec]'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${task.done ? 'bg-[#657f4d] text-white border-[#657f4d]' : 'bg-[#f8f9fa] border-[#eaeaec]'}`}>
                                                    {task.done && <Icons.Check size={12} strokeWidth={4} />}
                                                </div>
                                                <span className={`text-[11.5px] font-bold ${task.done ? 'text-[#657f4d] line-through opacity-80' : 'text-[#212c46]'}`}>{task.label}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2 pt-2">
                                    <span className="text-[10px] font-black text-[#7a8b95] uppercase tracking-widest">Finance, Debts & Prorated Payroll</span>
                                    {tempRecord.tasks?.finance?.map((task: any) => (
                                        <div 
                                            key={task.id} 
                                            onClick={() => handleTaskToggleInStep('finance', task.id)}
                                            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${task.done ? 'bg-[#b58c4f]/5 border-[#b58c4f]/30' : 'bg-white border-[#eaeaec]'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${task.done ? 'bg-[#b58c4f] text-white border-[#b58c4f]' : 'bg-[#f8f9fa] border-[#eaeaec]'}`}>
                                                    {task.done && <Icons.Check size={12} strokeWidth={4} />}
                                                </div>
                                                <span className={`text-[11.5px] font-bold ${task.done ? 'text-[#b58c4f] line-through opacity-80' : 'text-[#212c46]'}`}>{task.label}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {modalStep === 3 && (
                        <div className="space-y-4 animate-fadeIn pb-6">
                            <h4 className="text-[12px] font-black text-[#212c46] uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-4">การบันทึกการสัมภาษณ์ความเห็นก่อนพ้นสภาพ (Exit Interview Notes)</h4>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">Primary Reason for Leaving / เหตุผลสำคัญในการลาออก</label>
                                    <select 
                                        value={tempRecord.exitInterview?.reason || ''} 
                                        onChange={e => handleInterviewChange('reason', e.target.value)} 
                                        className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2.5 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#b7a159]"
                                    >
                                        <option value="">-- โปรดระบุเหตุผล --</option>
                                        <option value="ได้งานใหม่ (Career Growth)">ได้งานใหม่ (Career Growth / Better Offer)</option>
                                        <option value="ศึกษาต่อ (Further Education)">ศึกษาต่อ (Further Education)</option>
                                        <option value="ปัญหาสุขภาพ / ครอบครัว (Personal / Health)">ปัญหาสุขภาพ / ครอบครัว (Personal / Health)</option>
                                        <option value="ไม่พอใจเนื้องาน / สภาพแวดล้อม (Work Environment)">ไม่พอใจเนื้องาน / สภาพแวดล้อม (Work Environment)</option>
                                        <option value="อื่นๆ (Others)">อื่นๆ (Others)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">Employee Feedback & Internal Suggestions / ข้อเสนอแนะพนักงาน</label>
                                    <textarea 
                                        value={tempRecord.exitInterview?.feedback || ''} 
                                        onChange={e => handleInterviewChange('feedback', e.target.value)} 
                                        placeholder="พิมพ์ความคิดเห็น ข้อพิจารณา หรือประเด็นพัฒนาองค์กร..."
                                        rows={4}
                                        className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-3 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#b7a159] resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">Would recommend this company to others? / แนะนำบริษัทให้กับคนรู้จัก</label>
                                    <div className="flex gap-6 mt-1">
                                        <label className="flex items-center gap-2 text-[12px] font-bold text-[#212c46] cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="recommended" 
                                                value="Yes" 
                                                checked={tempRecord.exitInterview?.recommended === 'Yes'} 
                                                onChange={e => handleInterviewChange('recommended', e.target.value)}
                                                className="w-4 h-4 accent-[#b7a159]" 
                                            />
                                            ยินดีแนะนำคนอื่นมาทำ (Yes, highly recommended)
                                        </label>
                                        <label className="flex items-center gap-2 text-[12px] font-bold text-[#212c46] cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="recommended" 
                                                value="No" 
                                                checked={tempRecord.exitInterview?.recommended === 'No'} 
                                                onChange={e => handleInterviewChange('recommended', e.target.value)}
                                                className="w-4 h-4 accent-[#b7a159]" 
                                            />
                                            ไม่แนะนำ (No, I would not)
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="px-6 py-3 bg-[#f8f9fa] border-t border-[#eaeaec] flex justify-end gap-3 shrink-0">
                <button onClick={onClose} className="px-5 py-2.5 bg-white border border-[#eaeaec] text-[#414757] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#d7d7d7]/30 transition-all cursor-pointer">Cancel</button>
                <button onClick={handleSave} className="bg-[#212c46] text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md hover:bg-[#414757] transition-all flex items-center gap-2 cursor-pointer"><Icons.Save size={14}/> Save Progress</button>
            </div>
        </DraggableModal>
    );
}

export default function Offboarding() {
  const [records, setRecords] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [editModal, setEditModal] = useState<{ isOpen: boolean; record: any }>({ isOpen: false, record: null });

  // Load from local storage or set initial data to prevent losing sample records
  useEffect(() => {
    const saved = localStorage.getItem('local_employees_offboarding');
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {
        setRecords(INITIAL_OFFBOARDING);
      }
    } else {
      setRecords(INITIAL_OFFBOARDING);
      localStorage.setItem('local_employees_offboarding', JSON.stringify(INITIAL_OFFBOARDING));
    }
  }, []);

  const saveToStorage = (newRecords: any[]) => {
      setRecords(newRecords);
      localStorage.setItem('local_employees_offboarding', JSON.stringify(newRecords));
  };

  // Search filtering
  const filteredRecords = useMemo(() => {
      return records.filter(r => 
          r.nameTh.toLowerCase().includes(search.toLowerCase()) || 
          r.nameEn.toLowerCase().includes(search.toLowerCase()) ||
          r.ticketId.toLowerCase().includes(search.toLowerCase()) ||
          r.dept.toLowerCase().includes(search.toLowerCase()) ||
          r.jobTitle.toLowerCase().includes(search.toLowerCase())
      );
  }, [records, search]);

  const currentData = useMemo(() => {
    return filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredRecords, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;

  // Offboarding stats
  const totalOffboardCount = records.length;
  const completedCount = records.filter(r => r.status === 'Completed').length;
  const inProgressCount = records.filter(r => r.status === 'In Progress').length;
  const notStartedCount = records.filter(r => r.status === 'Not Started').length;

  const handleOpenEdit = (rec: any) => {
      setEditModal({ isOpen: true, record: rec });
  };

  const handleSaveOffboardingRecord = (savedRecord: any) => {
      const updated = records.map(r => r.id === savedRecord.id ? savedRecord : r);
      saveToStorage(updated);
  };

  const handleInitiateOffboarding = () => {
      MySwal.fire({
          title: 'จำหน่ายรายชื่อพนักงานพ้นสภาพ',
          html: `
              <div class="text-left font-sans space-y-3 mt-4 text-[12px]">
                  <div>
                      <label class="block font-black text-[#7a8b95] uppercase tracking-widest mb-1">EN FULL NAME</label>
                      <input id="swal-en-name" class="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2 outline-none font-bold text-slate-800" value="CHUCHAI DEEDEESOM" />
                  </div>
                  <div>
                      <label class="block font-black text-[#7a8b95] uppercase tracking-widest mb-1">TH FULL NAME</label>
                      <input id="swal-th-name" class="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2 outline-none font-bold text-slate-800" value="ชูชัย ดีสมดี" />
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                      <div>
                          <label class="block font-black text-[#7a8b95] uppercase tracking-widest mb-1">POSITION</label>
                          <input id="swal-position" class="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2 outline-none font-bold text-slate-800" value="Sales Specialist" />
                      </div>
                      <div>
                          <label class="block font-black text-[#7a8b95] uppercase tracking-widest mb-1">DEPARTMENT</label>
                          <input id="swal-dept" class="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2 outline-none font-bold text-slate-800" value="Sales & Marketing" />
                      </div>
                  </div>
                  <div>
                      <label class="block font-black text-[#7a8b95] uppercase tracking-widest mb-1">LAST WORK DAY</label>
                      <input id="swal-last-date" type="date" class="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2 outline-none font-bold text-slate-800" value="${new Date().toISOString().split('T')[0]}" />
                  </div>
              </div>
          `,
          showCancelButton: true,
          confirmButtonText: 'ยืนยันและแก้ไขต่อ (Initiate)',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#212c46',
          cancelButtonColor: '#7a8b95',
          preConfirm: () => {
              const enName = (document.getElementById('swal-en-name') as HTMLInputElement).value;
              const thName = (document.getElementById('swal-th-name') as HTMLInputElement).value;
              const pos = (document.getElementById('swal-position') as HTMLInputElement).value;
              const dept = (document.getElementById('swal-dept') as HTMLInputElement).value;
              const lastDt = (document.getElementById('swal-last-date') as HTMLInputElement).value;

              if (!enName || !thName) {
                  Swal.showValidationMessage('กรุณากรอกชื่อ-นามสกุลให้ครบถ้วน');
                  return false;
              }
              return { enName, thName, pos, dept, lastDt };
          }
      }).then((result) => {
          if (result.isConfirmed && result.value) {
              const data = result.value;
              const generatedTicket = `OFF-240${Math.floor(10 + Math.random() * 90)}`;
              const newOffboardingObj = {
                  id: Date.now(),
                  ticketId: generatedTicket,
                  nameTh: data.thName,
                  nameEn: data.enName,
                  image: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
                  dept: data.dept,
                  jobTitle: data.pos,
                  lastDate: data.lastDt,
                  status: 'Not Started',
                  progress: 0,
                  exitInterview: { reason: '', feedback: '', recommended: '' },
                  tasks: JSON.parse(JSON.stringify(DEFAULT_TASKS))
              };

              const updatedList = [newOffboardingObj, ...records];
              saveToStorage(updatedList);
              setEditModal({ isOpen: true, record: newOffboardingObj });
          }
      });
  };

  const handleExportResignationForm = (recName: string) => {
      MySwal.fire({
          title: 'พิมพ์ใบตรวจสอบการเสร็จสมบูรณ์',
          html: `คุณประสงค์สั่งพิมพ์แบบฟอร์มกวาดล้างระเบียบและ Clearance Checklist ของคุณ <b>${recName}</b> เพื่อเป็นหลักฐานรูปธรรมหรือไม่?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'สั่งพิมพ์ / Export (PDF)',
          cancelButtonText: 'ยกเลิก',
          confirmButtonColor: '#212c46',
          cancelButtonColor: '#7a8b95'
      }).then((result) => {
          if (result.isConfirmed) {
              MySwal.fire({
                  title: 'สำเร็จ!',
                  text: `ดาวน์โหลดเอกสาร Clearance_Form_${recName.replace(/\s+/g, '_')}.pdf เริ่มต้นขึ้นแล้ว`,
                  icon: 'success',
                  confirmButtonColor: '#657f4d'
              });
          }
      });
  };

  const handleRemoveOffboardingPipeline = (id: number, name: string) => {
      MySwal.fire({
          title: 'ยกเลิกกระบวนการพ้นสภาพ?',
          html: `คุณแน่ใจหรือไม่ที่จะลบระเบียนข้อมูล Clearance และพ้นสภาพของพนักงานคุณ <b>${name}</b>? การดำเนินการนี้จะทำลายสิทธิ์พินิจย้อนหลัง`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'ใช่, ฉันต้องการลบ',
          cancelButtonText: 'ปิดทางเลี่ยง',
          confirmButtonColor: '#932c2e',
          cancelButtonColor: '#7a8b95'
      }).then((result) => {
          if (result.isConfirmed) {
              const updated = records.filter(r => r.id !== id);
              saveToStorage(updated);
              MySwal.fire({
                  title: 'ยุติและนำออกแล้ว',
                  text: 'ระบบดึงประวัติพ้นสภาพออกจากบัญชีงานค้าง clearance แล้ว',
                  icon: 'success',
                  confirmButtonColor: '#212c46'
              });
          }
      });
  };

  return (
    <div className="flex flex-1 w-full flex-col animate-fadeIn bg-transparent space-y-4 px-4 md:px-8 py-6 pb-6">
      
      {/* Floating User Guide Tab synced completely with UserPermissions page */}
      {typeof document !== 'undefined' && createPortal(
        <button 
          onClick={() => setIsGuideOpen(true)} 
          className="fixed right-0 bg-[#f8f9fa] border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#b7a159] hover:text-white hover:border-[#b7a159] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group cursor-pointer" 
          style={{ top: '220px' }}
        >
            <Icons.HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#7a8b95] group-hover:text-white" />
            <span className="font-black tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[11px] font-mono">USER GUIDE</span>
        </button>,
        document.body
      )}

      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      
      <EditOffboardingModal 
         isOpen={editModal.isOpen} 
         onClose={() => setEditModal({ isOpen: false, record: null })} 
         record={editModal.record} 
         onSave={handleSaveOffboardingRecord} 
      />

      {/* Synchronized Core Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0 transition-all">
          <div className="flex items-center gap-5">
              <div className="relative flex items-center justify-center group cursor-default shrink-0">
                  <div className="absolute inset-0 bg-[#932c2e] blur-[15px] opacity-20 group-hover:opacity-60 transition-all duration-700 rounded-full"></div>
                  <div className="relative z-10 p-2.5 border border-[#932c2e]/40 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm text-[#932c2e]">
                      <Icons.UserMinus size={26} strokeWidth={2.5} />
                  </div>
              </div>
              <div>
                  <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none" style={{ fontSize: '24px' }}>
                      OFFBOARDING <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#932c2e] to-[#b58c4f]">CLEARANCE</span> NODE
                  </h3>
                  <p className="text-[11.5px] font-bold text-[#7a8b95] uppercase tracking-[0.2em] mt-1 opacity-90 leading-none">
                      EXIT CLEARANCE STEPS, SYSTEM REVOCATION & ARCHIVE CONTROL
                  </p>
              </div>
          </div>

          <div className="flex items-center gap-2">
              <button 
                onClick={handleInitiateOffboarding}
                className="bg-[#212c46] hover:bg-[#414757] text-[#f8f9fa] px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-[#212c46] shadow-md cursor-pointer hover:shadow-lg"
              >
                <Plus size={14} className="text-[#b7a159]" /> ดำเนินการลาออก (Initiate Offb)
              </button>
          </div>
      </div>

      {/* Standard KPI Cards matching Home page aesthetic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 transition-all">
        <KpiCard 
          label="จำนวนลาออกรวมพ้นสภาพ (Discharged Pool)" 
          value={totalOffboardCount} 
          color={THEME.skyBlue} 
          icon={Icons.UserMinus} 
          description=" Resignations indexed"
        />
        <KpiCard 
          label="อยู่ระหว่างทวงสิทธิ์ / คืนทรัพย์สิน (In Progress)" 
          value={inProgressCount} 
          color={THEME.brightGold} 
          icon={Icons.Clock} 
          description=" Active clearing"
        />
        <KpiCard 
          label="รอดำเนินการสัมภาษณ์ความเห็น (Not Started)" 
          value={notStartedCount} 
          color={THEME.danger} 
          icon={Icons.MessageSquare} 
          description=" Interview due"
        />
        <KpiCard 
          label="เสร็จสิ้นสัญญาสมบูรณ์ 100% (Cleared & Closed)" 
          value={completedCount} 
          color={THEME.success} 
          icon={Icons.CheckCircle2} 
          description=" Handed and Revoked"
        />
      </div>

      {/* Monthly Turnover Rate Line Chart */}
      <div className="bg-white rounded-3xl p-5 border border-[#eaeaec] shadow-md animate-fadeIn">
        <div className="flex items-center justify-between border-b border-[#eaeaec] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-50 text-[#932c2e] rounded-lg">
              <Icons.TrendingUp size={16} />
            </div>
            <div>
              <h3 className="text-xs font-black text-[#212c46] uppercase tracking-wider">Monthly Turnover Trend</h3>
              <p className="text-[9px] text-[#748ea1] font-black uppercase tracking-widest mt-0.5">Staff Resignation and Turnover Ratio Analysis (%)</p>
            </div>
          </div>
          <span className="text-[8px] font-black uppercase tracking-wider text-[#932c2e] bg-red-50 px-2.5 py-1 rounded-full border border-red-100 transition-all">
            Executive Stat Panel
          </span>
        </div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[
              { name: 'Jan', rate: 1.2 },
              { name: 'Feb', rate: 0.8 },
              { name: 'Mar', rate: 1.5 },
              { name: 'Apr', rate: 0.5 },
              { name: 'May', rate: 1.1 },
              { name: 'Jun', rate: 0.9 }
            ]} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
              <XAxis dataKey="name" stroke="#7a8b95" fontSize={10} tickLine={false} />
              <YAxis stroke="#7a8b95" fontSize={10} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
              <Line type="monotone" dataKey="rate" stroke="#932c2e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Directory Table Container */}
      <div className="bg-white rounded-3xl shadow-lg border border-[#eaeaec] overflow-hidden flex flex-col  flex-1 min-h-0">
        
        {/* Filters Top Toolbar */}
        <div className="px-8 py-4 border-b border-[#eaeaec] bg-[#f8f9fa] flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <h4 className="text-[11.5px] font-black uppercase text-[#212c46] tracking-widest flex items-center gap-2">
              <Icons.ListTree size={16} className="text-[#b7a159]"/> EXIT PIPELINES AND REVIEWS
            </h4>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 w-full md:w-80">
              <Icons.Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7a8b95]" />
              <input 
                type="text" 
                value={search} 
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} 
                placeholder="ค้นหาแผนก ชื่อพนักงาน หรือรหัส Clearance..." 
                className="w-full pl-12 pr-6 py-2.5 text-[12px] border border-[#eaeaec] rounded-full font-bold outline-none focus:border-[#b7a159] bg-white shadow-sm text-[#212c46]" 
              />
            </div>
          </div>
        </div>

        {/* Directory Data Grid view */}
        <div className="overflow-x-auto custom-scrollbar flex-1 min-h-0">
          <table className="w-full text-left font-sans border-collapse select-none">
            <thead className="bg-[#f8f9fa] text-[#414757] text-[10.5px] font-black uppercase tracking-widest border-b border-[#eaeaec] font-mono">
              <tr>
                <th className="py-4 px-6 text-center w-24">Ticket ID</th>
                <th className="py-4 px-6">Employee Profile</th>
                <th className="py-4 px-6">Role & Department</th>
                <th className="py-4 px-6 text-center">Last Work Day</th>
                <th className="py-4 px-6 text-center w-52">Revocation Progress</th>
                <th className="py-4 px-6 text-center">Approval Status</th>
                <th className="py-4 px-6 text-center w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaec]">
              {currentData.map((item) => (
                <tr 
                  key={item.id} 
                  className="hover:bg-[#f8f9fa]/80 transition-colors group cursor-pointer"
                  onClick={() => handleOpenEdit(item)}
                >
                  <td className="py-4 px-6 text-center font-mono font-black text-[#932c2e] text-[11px] tracking-tight">{item.ticketId}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#d7d7d7] shadow-sm relative shrink-0">
                        <img src={item.image} className="w-full h-full object-cover grayscale opacity-90" alt={item.nameEn} />
                      </div>
                      <div>
                        <h4 className="font-black text-[#212c46] text-[13px] tracking-tight uppercase leading-none mb-1">{item.nameEn}</h4>
                        <p className="text-[11.5px] text-[#7a8b95] font-bold leading-none">{item.nameTh}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-extrabold text-[#212c46] text-[12.5px] block leading-none mb-1.5">{item.jobTitle}</span>
                    <span className="text-[9.5px] font-black uppercase tracking-widest font-mono text-[#b58c4f] bg-[#b58c4f]/5 border border-[#b58c4f]/25 px-2 py-0.5 rounded-md">{item.dept}</span>
                  </td>
                  <td className="py-4 px-6 text-center font-mono font-bold text-[#b58c4f] text-[11.5px]">{item.lastDate}</td>
                  <td className="py-4 px-6">
                     <ProgressBar progress={item.progress} />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span 
                      className="px-3 py-1.5 rounded-xl text-[9.5px] font-black uppercase tracking-widest border shadow-sm font-mono inline-block"
                      style={{ 
                        backgroundColor: item.status === 'Completed' ? THEME.success + '15' : item.status === 'In Progress' ? THEME.brightGold + '15' : THEME.danger + '15',
                        borderColor: item.status === 'Completed' ? THEME.success + '40' : item.status === 'In Progress' ? THEME.brightGold + '40' : THEME.danger + '40',
                        color: item.status === 'Completed' ? THEME.success : item.status === 'In Progress' ? THEME.brightGold : THEME.danger
                      }}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-[#212c46]/80 hover:text-white hover:bg-[#212c46] rounded-lg border border-[#eaeaec] transition-colors cursor-pointer"
                        title="Update checklist progress"
                      >
                        <Icons.Edit3 size={13} />
                      </button>
                      <button 
                        onClick={() => handleExportResignationForm(item.nameEn)}
                        className="p-1.5 text-emerald-700 hover:text-white hover:bg-[#657f4d] rounded-lg border border-[#eaeaec] transition-colors cursor-pointer"
                        title="Export Clearance Sign Form"
                      >
                        <FileText size={13} />
                      </button>
                      <button 
                        onClick={() => handleRemoveOffboardingPipeline(item.id, item.nameEn)}
                        className="p-1.5 text-rose-700 hover:text-white hover:bg-[#932c2e] rounded-lg border border-[#eaeaec] transition-colors cursor-pointer"
                        title="Delete Offboarding ticket"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentData.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[12px] font-bold text-[#7a8b95] uppercase tracking-widest bg-[#f8f9fa]/40">
                    <Icons.Inbox size={26} className="mx-auto mb-3 opacity-40 text-[#7a8b95]" /> ไม่พบรายการพ้นสภาพตามขอบข่ายค้นหาที่คุณระบุ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Footer Container */}
        <div className="px-8 py-4 border-t border-[#eaeaec] bg-[#f8f9fa] flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 font-bold">
          <div className="flex items-center gap-5 text-[11px] font-black text-[#7a8b95] uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <span>Display rows:</span>
              <select 
                value={itemsPerPage} 
                onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-white border border-[#eaeaec] rounded-lg px-2.5 py-1.5 outline-none font-black text-[#212c46] cursor-pointer shadow-sm focus:border-[#b7a159]"
              >
                {[5, 10, 20, 50].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <p className="bg-white px-3 py-1.5 rounded-lg border border-[#eaeaec] shadow-sm font-mono text-[10px]">
              Total Records matched: {filteredRecords.length}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1}
              className={`w-9 h-9 border border-[#eaeaec] bg-white rounded-lg flex items-center justify-center transition-all ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#212c46] hover:text-white hover:border-[#212c46] shadow-sm active:scale-95 cursor-pointer'}`}
            >
              <ChevronLeft size={16}/>
            </button>
            <div className="bg-white text-[#212c46] px-4 py-2 rounded-lg font-black text-[10.5px] min-w-[100px] text-center uppercase tracking-widest border border-[#eaeaec] shadow-sm font-mono">
              Page {currentPage} / {totalPages}
            </div>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
              disabled={currentPage === totalPages}
              className={`w-9 h-9 border border-[#eaeaec] bg-white rounded-lg flex items-center justify-center transition-all ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#212c46] hover:text-white hover:border-[#212c46] shadow-sm active:scale-95 cursor-pointer'}`}
            >
              <ChevronRight size={16}/>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
