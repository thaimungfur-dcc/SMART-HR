import { UserGuidePanel } from '../../components/shared/UserGuidePanel';
import KpiCard from '../../components/shared/KpiCard';
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';
import { 
  UserPlus, Search, Plus, Trash2, X, Save, ChevronLeft, ChevronRight, 
  HelpCircle, CheckCircle2, AlertTriangle, FileText, Send, Clock, BookOpen,
  MonitorSmartphone, Presentation, Upload, Link, Eye, CheckSquare
} from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { DraggableModal } from '../../components/shared/DraggableModal';

const MySwal = withReactContent(Swal);

// --- Theme Configuration (Synced with Home & Permissions Palette) ---
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
    hr: [
        { id: 'hr1', label: 'รับมอบเอกสารสัญญาจ้าง (Contract Signed)', done: false },
        { id: 'hr2', label: 'ถ่ายรูปทำบัตรพนักงาน (ID Badge Created)', done: false },
        { id: 'hr3', label: 'สแกนลายนิ้วมือ / ใบหน้า (Biometric Setup)', done: false },
        { id: 'hr4', label: 'เปิดบัญชีเงินเดือนธนาคาร (Bank Account Setup)', done: false },
        { id: 'hr5', label: 'เพิ่มชื่อเข้าระบบประกันสังคม (Social Security)', done: false },
    ],
    it: [
        { id: 'it1', label: 'สร้าง Email องค์กร (Corporate Email)', done: false },
        { id: 'it2', label: 'เบิก Computer / Laptop (Hardware Issue)', done: false },
        { id: 'it3', label: 'สิทธิ์เข้าใช้ระบบ ERP / HRMS (System Access)', done: false },
        { id: 'it4', label: 'ติดตั้ง Software ที่จำเป็นตามตำแหน่งงาน', done: false },
    ],
    orientation: [
        { id: 'or1', label: 'ปฐมนิเทศกฎระเบียบบริษัท (Company Policy)', done: false },
        { id: 'or2', label: 'แนะนำโครงสร้างองค์กร (Org Chart Intro)', done: false },
        { id: 'or3', label: 'พาชมพื้นที่สำนักงาน (Office Tour)', done: false },
        { id: 'or4', label: 'แนะนำตัวกับทีมและผู้บริหาร (Team Intro)', done: false },
        { id: 'or5', label: 'มอบหมายพี่เลี้ยง (Buddy Assignment)', done: false },
    ]
};

const INITIAL_ONBOARDING = [
  { 
    id: 1, ticketId: 'ONB-24050', nameTh: 'สมหมาย ใจดี', nameEn: 'Sommai Jaidee', 
    image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
    dept: 'Information Technology', jobTitle: 'System Analyst', startDate: '2024-05-15',
    status: 'In Progress', progress: 45, buddy: 'คุณวิชัย (IT Manager)',
    tasks: {
        hr: [ { id: 'hr1', label: 'รับมอบเอกสารสัญญาจ้าง (Contract Signed)', done: true }, { id: 'hr2', label: 'ถ่ายรูปทำบัตรพนักงาน (ID Badge Created)', done: true }, { id: 'hr3', label: 'สแกนลายนิ้วมือ / ใบหน้า (Biometric Setup)', done: true }, { id: 'hr4', label: 'เปิดบัญชีเงินเดือนธนาคาร (Bank Account Setup)', done: false }, { id: 'hr5', label: 'เพิ่มชื่อเข้าระบบประกันสังคม (Social Security)', done: false } ],
        it: [ { id: 'it1', label: 'สร้าง Email องค์กร (Corporate Email)', done: true }, { id: 'it2', label: 'เบิก Computer / Laptop (Hardware Issue)', done: true }, { id: 'it3', label: 'สิทธิ์เข้าใช้ระบบ ERP / HRMS (System Access)', done: false }, { id: 'it4', label: 'ติดตั้ง Software ที่จำเป็นตามตำแหน่งงาน', done: false } ],
        orientation: [ { id: 'or1', label: 'ปฐมนิเทศกฎระเบียบบริษัท (Company Policy)', done: false }, { id: 'or2', label: 'แนะนำโครงสร้างองค์กร (Org Chart Intro)', done: false }, { id: 'or3', label: 'พาชมพื้นที่สำนักงาน (Office Tour)', done: false }, { id: 'or4', label: 'แนะนำตัวกับทีมและผู้บริหาร (Team Intro)', done: false }, { id: 'or5', label: 'มอบหมายพี่เลี้ยง (Buddy Assignment)', done: false } ]
    }
  },
  { 
    id: 2, ticketId: 'ONB-24051', nameTh: 'ลลิตา พานิช', nameEn: 'Lalita Panich', 
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    dept: 'Sales & Marketing', jobTitle: 'Digital Marketer', startDate: '2024-06-01',
    status: 'Not Started', progress: 0, buddy: 'Pending Assignment',
    tasks: JSON.parse(JSON.stringify(DEFAULT_TASKS))
  },
  { 
    id: 3, ticketId: 'ONB-24045', nameTh: 'เอกชัย วงศ์สว่าง', nameEn: 'Ekachai Wongsawang', 
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    dept: 'Production', jobTitle: 'Production Supervisor', startDate: '2024-05-01',
    status: 'Completed', progress: 100, buddy: 'คุณอนันต์ (Plant Manager)',
    tasks: {
        hr: DEFAULT_TASKS.hr.map(t => ({...t, done: true})),
        it: DEFAULT_TASKS.it.map(t => ({...t, done: true})),
        orientation: DEFAULT_TASKS.orientation.map(t => ({...t, done: true}))
    }
  }
];

const ProgressBar = ({ progress }: { progress: number }) => {
    let color = THEME.burntOrange; // low progress
    if (progress >= 100) color = THEME.success; // complete
    else if (progress >= 40) color = THEME.skyBlue; // ongoing

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

// --- Multi-Step Onboarding Modal with State Wizard ---
function EditOnboardingModal({ isOpen, onClose, record, onSave }: any) {
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
            title: 'บันทึกข้อมูลพนักงานเสร็จสิ้น',
            html: `ปรับปรุงข้อมูลความพร้อมและพัฒนาการของ <b>${tempRecord.nameEn}</b> เรียบร้อยแล้ว`,
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
                            <img src={tempRecord.image} className="w-full h-full object-cover" alt={tempRecord.nameEn || 'Avatar'} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-[#d7d7d7] uppercase tracking-widest leading-none mb-1">{tempRecord.nameEn || 'PENDING CANDIDATE'}</h3>
                            <p className="text-[10px] font-bold text-[#b7a159]/90 uppercase tracking-widest mt-0.5">{tempRecord.jobTitle || 'UNASSIGNED ROLE'} • {tempRecord.ticketId}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-[#932c2e] transition-all bg-white/10 hover:bg-white/20 p-1.5 rounded-full"><Icons.X size={16} /></button>
                </div>
            }
        >
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#f8f9fa] min-h-[460px]">
                {/* Left Step Wizard Options */}
                <div className="w-full md:w-56 bg-white border-b md:border-b-0 md:border-r border-[#eaeaec] flex flex-row md:flex-col shrink-0 font-sans">
                    <div className="hidden md:block px-4 py-4 text-[10px] font-black text-[#7a8b95] uppercase tracking-widest border-b border-[#eaeaec] bg-[#f8f9fa]">Configuration Nodes</div>
                    {[0, 1, 2, 3].map(step => (
                        <button 
                            key={step} 
                            onClick={() => setModalStep(step)} 
                            className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-3 px-4 py-3 text-left transition-all md:border-l-4 ${modalStep === step ? 'border-b-4 md:border-b-0 border-[#b7a159] bg-[#f8f9fa] text-[#212c46]' : 'border-transparent text-[#7a8b95] hover:bg-[#f8f9fa]/50'}`}
                        >
                            <LucideIcon name={step === 0 ? 'User' : step === 1 ? 'MonitorSmartphone' : step === 2 ? 'Sliders' : 'Award'} size={16} color={modalStep === step ? THEME.brightGold : undefined} />
                            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest">
                                STEP {step + 1}: {step === 0 ? 'PROFILE' : step === 1 ? 'IT & CHANNELS' : step === 2 ? 'ADMINS & CULTURE' : 'PROBATION & EVAL'}
                            </span>
                        </button>
                    ))}
                    
                    <div className="hidden md:block mt-auto p-4 border-t border-[#eaeaec]">
                        <p className="text-[10px] font-black text-[#7a8b95] uppercase tracking-widest mb-2 text-center">System Readiness</p>
                        <ProgressBar progress={progress} />
                    </div>
                </div>

                {/* Content form fields based on steps */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white">
                    {modalStep === 0 && (
                        <div className="space-y-4 max-w-xl animate-fadeIn pb-6 flex-1 flex-col flex min-h-0">
                            <h4 className="text-[12px] font-black text-[#212c46] uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-4">พนักงานใหม่ข้อมูลสมบูรณ์ (Core Identity Nodes)</h4>
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
                                    <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">Department / ฝ่ายสังกัดงาน</label>
                                    <input 
                                        type="text" 
                                        value={tempRecord.dept || ''} 
                                        onChange={e => setTempRecord({ ...tempRecord, dept: e.target.value })} 
                                        className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-black uppercase text-[#212c46] outline-none focus:border-[#b7a159]" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">Position / ตำแหน่ง</label>
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
                                    <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">Start Date / เริ่มปฏิบัติงาน</label>
                                    <input 
                                        type="date" 
                                        value={tempRecord.startDate || ''} 
                                        onChange={e => setTempRecord({ ...tempRecord, startDate: e.target.value })} 
                                        className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-mono font-bold text-[#212c46] outline-none focus:border-[#b7a159]" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">Assigned Buddy / พี่เลี้ยงประกบ</label>
                                    <input 
                                        type="text" 
                                        value={tempRecord.buddy || ''} 
                                        onChange={e => setTempRecord({ ...tempRecord, buddy: e.target.value })} 
                                        className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#b7a159]" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">Profile Avatar Link (รูปพนักงาน)</label>
                                <div className="flex flex-col sm:flex-row items-center gap-3 bg-white border border-[#eaeaec] rounded-lg p-3">
                                    <div className="w-16 h-16 rounded-xl bg-[#f8f9fa] border border-[#eaeaec] flex items-center justify-center shadow-sm overflow-hidden shrink-0">
                                        {tempRecord.image ? (
                                            <img src={tempRecord.image} className="w-full h-full object-cover" alt="Profile" />
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
                                                className="bg-[#f8f9fa] border border-[#eaeaec] text-[#212c46] hover:text-rose-800 hover:border-[#b7a159] py-1.5 px-3 rounded-lg text-[10px] uppercase font-black tracking-widest shadow-sm flex items-center gap-1.5 flex-1 justify-center transition-colors cursor-pointer"
                                            >
                                                <Icons.Upload size={12} /> Local Computer
                                            </button>

                                            <button 
                                                type="button" 
                                                onClick={() => {
                                                    const textUrl = prompt("Enter Direct URL of image photo:");
                                                    if (textUrl) setTempRecord({ ...tempRecord, image: textUrl });
                                                }} 
                                                className="bg-[#f8f9fa] border border-[#eaeaec] text-[#212c46] hover:text-rose-800 hover:border-[#b7a159] py-1.5 px-3 rounded-lg text-[10px] uppercase font-black tracking-widest shadow-sm flex items-center gap-1.5 flex-1 justify-center transition-colors cursor-pointer"
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
                        <div className="space-y-4 animate-fadeIn pb-6">
                            <h4 className="text-[12px] font-black text-[#212c46] uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-4">คอมพิวเตอร์และเครือข่ายความร่วมมือ (IT Equipments Node)</h4>
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
                                            <span className={`text-[11px] sm:text-[12px] tracking-tight font-bold ${task.done ? 'text-[#3f809e] line-through opacity-80' : 'text-[#212c46]'}`}>{task.label}</span>
                                        </div>
                                        <span className={`text-[9.5px] font-black uppercase tracking-widest px-2 py-1 rounded bg-white border ${task.done ? 'text-emerald-700 border-emerald-300' : 'text-[#7a8b95] border-[#eaeaec]'}`}>
                                            {task.done ? 'Done / เรียบร้อย' : 'Pending'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {modalStep === 2 && (
                        <div className="space-y-4 animate-fadeIn pb-6">
                            <h4 className="text-[12px] font-black text-[#212c46] uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-4">ฝ่ายงานบุคคลและปฐมนิเทศกฎ (HR Docs & Orientations Node)</h4>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-[#7a8b95] uppercase tracking-widest">HR & Documentation Items</span>
                                    {tempRecord.tasks?.hr?.map((task: any) => (
                                        <div 
                                            key={task.id} 
                                            onClick={() => handleTaskToggleInStep('hr', task.id)}
                                            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${task.done ? 'bg-[#657f4d]/5 border-[#657f4d]/30 shadow-none' : 'bg-white border-[#eaeaec]'}`}
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
                                    <span className="text-[10px] font-black text-[#7a8b95] uppercase tracking-widest">Orientation & Culture Alignment</span>
                                    {tempRecord.tasks?.orientation?.map((task: any) => (
                                        <div 
                                            key={task.id} 
                                            onClick={() => handleTaskToggleInStep('orientation', task.id)}
                                            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${task.done ? 'bg-[#b58c4f]/5 border-[#b58c4f]/30 shadow-none' : 'bg-white border-[#eaeaec]'}`}
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
                        <div className="space-y-4 max-w-xl animate-fadeIn font-sans pb-6">
                            <h4 className="text-[12px] font-black text-[#212c46] uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-4">การตั้งค่าทดลองงานและประเมินผล (Probation & Performance Scorecard)</h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">ระยะทดลองงาน (จำนวนวัน)</label>
                                    <input 
                                        type="number" 
                                        value={tempRecord.probation?.probationDays ?? 119} 
                                        onChange={e => {
                                            const days = Number(e.target.value);
                                            const pEndDate = tempRecord.startDate ? new Date(new Date(tempRecord.startDate).getTime() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '';
                                            setTempRecord({
                                                ...tempRecord,
                                                probation: {
                                                    ...(tempRecord.probation || {}),
                                                    probationDays: days,
                                                    probationEndDate: pEndDate
                                                }
                                            });
                                        }}
                                        className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-mono font-bold text-[#212c46] outline-none focus:border-[#709654]" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">วันสิ้นสุดการทดลองงาน (คำนวณ)</label>
                                    <input 
                                        type="date" 
                                        readOnly
                                        value={tempRecord.probation?.probationEndDate ?? (tempRecord.startDate ? new Date(new Date(tempRecord.startDate).getTime() + (tempRecord.probation?.probationDays ?? 119) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '')} 
                                        className="w-full bg-[#f3f4f6] cursor-not-allowed border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-mono font-bold text-[#4b5563] outline-none" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">ผู้ทำการประเมิน</label>
                                    <input 
                                        type="text" 
                                        value={tempRecord.probation?.evaluator ?? ''} 
                                        onChange={e => setTempRecord({
                                            ...tempRecord,
                                            probation: { ...(tempRecord.probation || {}), evaluator: e.target.value }
                                        })}
                                        placeholder="เช่น คุณสมศักดิ์ (HR Manager)"
                                        className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#709654]" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">สถานะการทดลองงาน</label>
                                    <select 
                                        value={tempRecord.probation?.probationStatus ?? 'On Probation'} 
                                        onChange={e => setTempRecord({
                                            ...tempRecord,
                                            probation: { ...(tempRecord.probation || {}), probationStatus: e.target.value }
                                        })}
                                        className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-black text-[#212c46] outline-none focus:border-[#709654] cursor-pointer"
                                    >
                                        <option value="On Probation">On Probation (อยู่ระหว่างทดลองงาน)</option>
                                        <option value="Passed">Passed (ผ่านเกณฑ์ประเมินสิทธิ์)</option>
                                        <option value="Failed">Failed (ไม่ผ่านการประเมินสิทธิ์)</option>
                                        <option value="Extended">Extended (ขยายเวลารอดูความพร้อม)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-[#f8f9fa] p-4 rounded-2xl border border-[#eaeaec] space-y-3">
                                <span className="block text-[10.5px] font-black text-[#212c46] uppercase tracking-widest border-b border-gray-200 pb-1">คะแนนเกณฑ์จำลองวัดความสามารถ (Scorecard - 0 to 10 Scale)</span>
                                
                                <div className="grid grid-cols-1 gap-2">
                                    {[
                                        { key: 'performance', label: 'Work Quality & Output (ผลงานเชิงปริมาณและคุณภาพ)' },
                                        { key: 'attitude', label: 'Attitude & Collaboration (ทัศนคติและการรับฟังกลุ่มทีม)' },
                                        { key: 'attendance', label: 'Attendance & Reliability (การลางานและตรงต่อเวลา)' },
                                        { key: 'compliance', label: 'Rules Compliance & Discipline (การรักษาระเบียบกติกา)' }
                                    ].map(metric => (
                                        <div key={metric.key} className="flex justify-between items-center bg-white p-2 px-3.5 rounded-xl border border-[#eaeaec]">
                                            <span className="text-[11.5px] font-bold text-[#414757]">{metric.label}</span>
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="range" 
                                                    min="0" 
                                                    max="10" 
                                                    value={tempRecord.probation?.[metric.key] ?? 8} 
                                                    onChange={e => {
                                                        const val = Number(e.target.value);
                                                        setTempRecord({
                                                            ...tempRecord,
                                                            probation: {
                                                                ...(tempRecord.probation || {}),
                                                                [metric.key]: val
                                                            }
                                                        });
                                                    }}
                                                    className="w-24 accent-[#709654] h-1 bg-[#eaeaec] rounded-lg cursor-pointer"
                                                />
                                                <span className="text-[12px] font-black font-mono text-[#212c46] w-6 text-right">{(tempRecord.probation?.[metric.key] ?? 8)}/10</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-[#709654]/5 rounded-xl p-3 border border-[#709654]/20 flex justify-between items-center">
                                    <span className="text-[10.5px] font-black text-[#222b38] uppercase tracking-widest flex items-center gap-1.5">
                                        <Icons.Award size={14} className="text-[#709654]" /> Average Score (คะแนนผลการศึกษาเฉลี่ย)
                                    </span>
                                    <span className="text-[13px] font-black text-[#709654] font-mono">
                                        {((
                                            (tempRecord.probation?.performance ?? 8) +
                                            (tempRecord.probation?.attitude ?? 8) +
                                            (tempRecord.probation?.attendance ?? 8) +
                                            (tempRecord.probation?.compliance ?? 8)
                                        ) / 4).toFixed(1)} / 10.0
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">ความคิดเห็นผู้ประเมินเพิ่มเติม (Evaluation Remarks)</label>
                                <textarea 
                                    rows={2}
                                    value={tempRecord.probation?.evalComments ?? ''} 
                                    onChange={e => setTempRecord({
                                        ...tempRecord,
                                        probation: { ...(tempRecord.probation || {}), evalComments: e.target.value }
                                    })}
                                    placeholder="ใส่ความเห็นเพื่อบันทึกประวัติการพัฒนาทักษะ..."
                                    className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#709654] resize-none" 
                                />
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



// Central Interview database sync service helper
import { dbSync } from '../../services/dbSync';

export default function Onboarding() {
  const [records, setRecords] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [editModal, setEditModal] = useState<{ isOpen: boolean; record: any }>({ isOpen: false, record: null });

  // Navigation tab matching permissions standards
  const [activeTab, setActiveTab] = useState<'roster' | 'config'>('roster');
  const [passedCandidates, setPassedCandidates] = useState<any[]>([]);

  // Load from local storage or set initial data to prevent losing sample records (100% identical data mapping)
  useEffect(() => {
    const loadPassedCandidates = async () => {
      try {
        const res = await dbSync.read('interview_feedbacks');
        if (res && res.status === 'success' && res.data && res.data.items) {
          const qualified = res.data.items.filter((item: any) => item.result === 'Qualified');
          setPassedCandidates(qualified);
        } else {
          setPassedCandidates([
            { id: 'FDB-001', candidate: 'Anawat Siri', jobTitle: 'Senior Fullstack Developer', dept: 'Information Technology', averageScore: 9.2, date: '2024-05-10', comment: 'ทักษะทางเทคนิคยอดเยี่ยม คุยทัศนคติกับทีมเข้ากันได้ดีมาก' },
            { id: 'FDB-003', candidate: 'Chalee Mong', jobTitle: 'QA Automation Engineer', dept: 'Information Technology', averageScore: 8.5, date: '2024-05-12', comment: 'ความเข้าใจในการทำ Automation test ดีเยี่ยม คุยเป็นกันเองและกระตือรือร้น' }
          ]);
        }
      } catch (e) {
        setPassedCandidates([
          { id: 'FDB-001', candidate: 'Anawat Siri', jobTitle: 'Senior Fullstack Developer', dept: 'Information Technology', averageScore: 9.2, date: '2024-05-10', comment: 'ทักษะทางเทคนิคยอดเยี่ยม คุยทัศนคติกับทีมเข้ากันได้ดีมาก' },
          { id: 'FDB-003', candidate: 'Chalee Mong', jobTitle: 'QA Automation Engineer', dept: 'Information Technology', averageScore: 8.5, date: '2024-05-12', comment: 'ความเข้าใจในการทำ Automation test ดีเยี่ยม คุยเป็นกันเองและกระตือรือร้น' }
        ]);
      }
    };
    loadPassedCandidates();

    const saved = localStorage.getItem('local_employees_onboarding');
    let parsed = [];
    if (saved) {
      try {
        parsed = JSON.parse(saved);
      } catch (e) {
        parsed = INITIAL_ONBOARDING;
      }
    } else {
      parsed = INITIAL_ONBOARDING;
    }

    // Initialize missing probation metrics dynamically so as not to break sample records
    const enriched = parsed.map((item: any) => ({
      ...item,
      probation: item.probation || {
        probationDays: 119,
        probationStatus: item.status === 'Completed' ? 'Passed' : 'On Probation',
        evaluator: item.buddy && item.buddy !== 'Unassigned Coach' ? item.buddy : 'คุณสมศักดิ์ (HR Director)',
        evalComments: item.status === 'Completed' ? 'ผ่านเกณฑ์ประเมินทดลองงานเรียบร้อย' : 'อยู่ระหว่างการประเมินและสอนงานประจำกลุ่ม',
        performance: 8,
        attitude: 9,
        attendance: 8,
        compliance: 9
      }
    }));
    setRecords(enriched);
    localStorage.setItem('local_employees_onboarding', JSON.stringify(enriched));
  }, []);

  const saveToStorage = (newRecords: any[]) => {
      setRecords(newRecords);
      localStorage.setItem('local_employees_onboarding', JSON.stringify(newRecords));
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

  // Onboarding stats for syncing with Dashboard & Home
  const totalOnboard = records.length;
  const completedCount = records.filter(r => r.status === 'Completed').length;
  const inProgressCount = records.filter(r => r.status === 'In Progress').length;
  const notStartedCount = records.filter(r => r.status === 'Not Started').length;

  const handleOpenEdit = (rec: any) => {
      setEditModal({ isOpen: true, record: rec });
  };

  const handleSaveOnboardingRecord = (savedRecord: any) => {
      const updated = records.map(r => r.id === savedRecord.id ? savedRecord : r);
      saveToStorage(updated);
  };

  // Initiation of Onboard pipeline using Passed Candidate record
  const handleInitiateOnboarding = (candidate: any) => {
    const generatedTicket = `ONB-240${Math.floor(10 + Math.random() * 90)}`;
    const newHireObj = {
        id: Date.now(),
        ticketId: generatedTicket,
        nameTh: 'ระบุข้อมูลภาษาไทย',
        nameEn: candidate.candidate || candidate.name,
        image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
        dept: candidate.dept || 'Information Technology',
        jobTitle: candidate.jobTitle || 'Officer Specialist',
        startDate: new Date().toISOString().split('T')[0],
        status: 'Not Started',
        progress: 0,
        buddy: 'Unassigned Coach',
        tasks: JSON.parse(JSON.stringify(DEFAULT_TASKS)),
        probation: {
          probationDays: 119,
          probationStatus: 'On Probation',
          evaluator: 'คุณสมศักดิ์ (HR Director)',
          evalComments: 'ดึงข้อมูลสำเร็จจากผู้ผ่านรอบสัมภาษณ์ กำกับดูแลงานอย่างใกล้ชิด',
          performance: Math.round(candidate.averageScore || 8),
          attitude: 8,
          attendance: 9,
          compliance: 9
        }
    };

    setEditModal({ isOpen: true, record: newHireObj });
    const updatedList = [newHireObj, ...records];
    saveToStorage(updatedList);
    setActiveTab('roster'); // Re-route to active grid workspace
    MySwal.fire({
      icon: 'success',
      title: 'ดึงรายชื่อสำเร็จ!',
      html: `ทำการตั้งต้นช่องเตรียมงาน Onboarding แฟ้มของ <b>${newHireObj.nameEn}</b> เรียบร้อยแล้ว`,
      confirmButtonColor: '#212c46'
    });
  };

  const handleCreateNewHirePrompt = () => {
      const generatedTicket = `ONB-240${Math.floor(10 + Math.random() * 90)}`;
      const newHireObj = {
          id: Date.now(),
          ticketId: generatedTicket,
          nameTh: 'พนักงานไท้ รอข้อมูล',
          nameEn: 'NEW HIRED CANDIDATE',
          image: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
          dept: 'Operations Dept',
          jobTitle: 'Junior Trainee Officer',
          startDate: new Date().toISOString().split('T')[0],
          status: 'Not Started',
          progress: 0,
          buddy: 'Unassigned Coach',
          tasks: JSON.parse(JSON.stringify(DEFAULT_TASKS)),
          probation: {
            probationDays: 119,
            probationStatus: 'On Probation',
            evaluator: 'คุณสมศักดิ์ (HR Director)',
            evalComments: 'บรรจุข้อมูลใหม่ทางคีย์บอร์ดโดยไม่มีตั๋วกลางผลสัมภาษณ์',
            performance: 8,
            attitude: 8,
            attendance: 9,
            compliance: 9
          }
      };

      setEditModal({ isOpen: true, record: newHireObj });

      // Save a placeholder so that we can edit it
      const updatedList = [newHireObj, ...records];
      saveToStorage(updatedList);
  };

  // Direct Core Directory Transfer
  const handleTransferToDirectory = (emp: any) => {
    const saved = localStorage.getItem('local_employee_directory');
    let dir = [];
    if (saved) {
      try { dir = JSON.parse(saved); } catch (e) { dir = []; }
    }
    
    const exists = dir.some((x: any) => x.nameEn.toLowerCase() === emp.nameEn.toLowerCase());
    if (exists) {
       MySwal.fire({
        icon: 'warning',
        title: 'พนักงานคนนี้ได้รับการนำเข้าแล้ว',
        html: `พนักงานชื่อ En: <b>${emp.nameEn}</b> มีรายชื่ออยู่ในทะเบียนพนักงานหลักเรียบร้อยแล้ว`,
        confirmButtonColor: '#222b38'
      });
      return;
    }
    
    const newEmp = {
      id: Date.now(),
      staffId: `EMP-240${emp.ticketId.replace('ONB-240', '').replace('ONB-', '') || Math.floor(10 + Math.random() * 89)}`,
      nameTh: emp.nameTh,
      nameEn: emp.nameEn,
      nickName: emp.nameEn.split(' ')[0] || '',
      image: emp.image || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
      office: 'Headquarters',
      dept: emp.dept || 'Information Technology',
      section: 'Operations Core',
      jobTitle: emp.jobTitle || 'Associate',
      jobStatus: emp.probation?.probationStatus === 'Passed' ? 'Permanent' : 'Probation',
      workStatus: 'Active',
      effDate: emp.startDate,
      hiringDate: emp.startDate,
      yos: '0 Yrs 0 Mos'
    };
    
    dir.unshift(newEmp);
    localStorage.setItem('local_employee_directory', JSON.stringify(dir));
    
    const updatedRecords = records.map(r => r.id === emp.id ? { ...r, status: 'Completed', isTransferred: true } : r);
    saveToStorage(updatedRecords);
    
    MySwal.fire({
      icon: 'success',
      title: 'โอนย้ายสำเร็จ!',
      html: `บรรจุบัตรคุณ <b>${emp.nameEn}</b> เข้าระบบฐานข้อมูลกลางทำเนียบพนักงานจริงเรียบร้อยแล้ว<br/><span class="text-xs text-gray-400 font-mono">รหัสพนักงาน: ${newEmp.staffId}</span>`,
      confirmButtonColor: '#222b38'
    });
  };

  const handleSendWelcomeEmail = (recName: string) => {
      MySwal.fire({
          title: 'เตรียมส่งอีเมลต้อนรับ (Welcome Email Ready)',
          html: `ระบบได้ทำการสร้างแบบดราฟต์หนังสือต้อนรับถึงคุณ <b>${recName}</b> เรียบร้อยแล้ว พร้อมคำชี้แจงการปฐมนิเทศวันแรก`,
          icon: 'info',
          showCancelButton: true,
          confirmButtonText: 'ส่งทันที (Send Out)',
          cancelButtonText: 'แก้ไขปรับปรุง (Edit Draft)',
          confirmButtonColor: '#212c46',
          cancelButtonColor: '#7a8b95'
      }).then((result) => {
          if (result.isConfirmed) {
              MySwal.fire({
                  title: 'สำเร็จ!',
                  text: `จดหมายนำส่งอีเมลต้อนรับพนักงานใหม่สำเร็จลุล่วงแล้ว`,
                  icon: 'success',
                  confirmButtonColor: '#657f4d'
              });
          }
      });
  };

  const handleCancelOnboardingPipeline = (id: number, name: string) => {
      MySwal.fire({
          title: 'ยกเลิกคำสั่ง Onboarding?',
          html: `คุณแน่ใจหรือไม่ที่จะยกเลิกกระบวนการเตรียมความพร้อมร่วมงานของคุณ <b>${name}</b>? การกระทำนี้ไม่สามารถย้อนคืนได้`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'ใช่, ยกเลิกเดี๋ยวนี้',
          cancelButtonText: 'ปิดทางระงับ',
          confirmButtonColor: '#932c2e',
          cancelButtonColor: '#7a8b95'
      }).then((result) => {
          if (result.isConfirmed) {
              const updated = records.filter(r => r.id !== id);
              saveToStorage(updated);
              MySwal.fire({
                  title: 'ระงับกระบวนการแล้ว',
                  text: 'รายการประวัติคำสั่งได้ถูกลบออกจากสารบบเตรียมความพร้อมเรียบร้อย',
                  icon: 'success',
                  confirmButtonColor: '#212c46'
              });
          }
      });
  };

  return (
      <div className="flex flex-1 w-full flex-col animate-fadeIn bg-transparent space-y-4 px-4 sm:px-8 py-6 mt-[2px] font-sans pb-6">
          {/* Floating User Guide Tab synced completely with UserPermissions page */}
          {typeof document !== 'undefined' && createPortal(
            <button 
              onClick={() => setIsGuideOpen(true)} 
              className="fixed right-0 bg-[#f8f9fa] border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#709654] hover:text-white hover:border-[#709654] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group cursor-pointer" 
              style={{ top: '160px' }}
            >
                <Icons.HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#7a8b95] group-hover:text-white" />
                <span className="font-black tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[11px] font-sans">USER GUIDE</span>
            </button>,
            document.body
          )}
          <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
          <EditOnboardingModal 
             isOpen={editModal.isOpen} 
             onClose={() => setEditModal({ isOpen: false, record: null })} 
             record={editModal.record} 
             onSave={handleSaveOnboardingRecord} 
          />
          {/* Synchronized Core Page Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0 transition-all">
              <div className="flex items-center gap-5">
                  <div className="relative flex items-center justify-center group cursor-default shrink-0">
                      <div className="absolute inset-0 bg-[#709654] blur-[15px] opacity-20 group-hover:opacity-60 transition-all duration-700 rounded-full"></div>
                      <div className="relative z-10 p-2.5 border border-[#709654]/40 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm text-[#709654]">
                          <Icons.UserPlus size={26} strokeWidth={2.5} />
                      </div>
                  </div>
                  <div>
                      <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none font-sans" style={{ fontSize: '24px' }}>
                          TALENT <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#212c46] to-[#709654]">ONBOARDING</span> HUB
                      </h3>
                      <p className="text-[11.5px] font-bold text-[#7a8b95] uppercase tracking-[0.2em] mt-1.5 opacity-90 leading-none font-sans">
                          NEW HIRE ADMISSION STATUS & CORE SYSTEM READY-STAGE ENGINE
                      </p>
                  </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                  {/* Premium standardized Tab bar */}
                  <div className="bg-white/70 p-1 rounded-xl border border-[#eaeaec] flex items-center shadow-sm select-none shrink-0">
                    <button 
                      onClick={() => setActiveTab('roster')}
                      className={`px-4 py-2 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${activeTab === 'roster' ? 'bg-[#212c46] text-white shadow' : 'text-[#7a8b95] hover:text-[#212c46]'}`}
                    >
                      <Icons.Users size={13} /> Admission Board
                    </button>
                    <button 
                      onClick={() => setActiveTab('config')}
                      className={`px-4 py-2 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${activeTab === 'config' ? 'bg-[#212c46] text-white shadow' : 'text-[#7a8b95] hover:text-[#212c46]'}`}
                    >
                      <Icons.Settings size={13} /> Settings & Interview Pool
                    </button>
                  </div>

                  <button 
                    onClick={handleCreateNewHirePrompt}
                    className="bg-[#212c46] hover:bg-[#414757] text-[#f8f9fa] px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-[#212c46] shadow-md cursor-pointer hover:shadow-lg"
                  >
                    <Plus size={14} className="text-[#709654]" /> เพิ่มรายชื่อ (New Hire)
                  </button>
              </div>
          </div>
          {/* Standard KPI Cards matching Home page aesthetic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 transition-all">
            <KpiCard 
              label="จำนวนรับพนักงานใหม่ทั้งหมด (Talent Pool)" 
              value={totalOnboard} 
              color={THEME.skyBlue} 
              icon={Icons.Users} 
              description=" New Hires total"
            />
            <KpiCard 
              label="กระบวนเตรียมพร้อมที่อยู่ระหว่างทาง (In Progress)" 
              value={inProgressCount} 
              color={THEME.brightGold} 
              icon={Icons.Clock} 
              description=" Onboarding work"
            />
            <KpiCard 
              label="รอดำเนินการเตรียมข้อมูล (Not Started)" 
              value={notStartedCount} 
              color={THEME.danger} 
              icon={Icons.AlertTriangle} 
              description=" Not started yet"
            />
            <KpiCard 
              label="เสร็จสิ้นสมบูรณ์ 100% (Onboard Completed)" 
              value={completedCount} 
              color={THEME.success} 
              icon={Icons.CheckCircle2} 
              description=" Ready to transfer roster"
            />
          </div>
          {activeTab === 'roster' ? (
            /* ----- ADMISSION BOARD WORKSPACE ----- */
            (<div className="bg-white rounded-3xl shadow-lg border border-[#eaeaec] overflow-hidden flex flex-col  flex-1 min-h-0">
                {/* Filters Top Toolbar */}
                <div className="px-8 py-4 border-b border-[#eaeaec] bg-[#f8f9fa] flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 font-sans">
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <h4 className="text-[11.5px] font-black uppercase text-[#222b38] tracking-widest flex items-center gap-2">
                      <Icons.ListTree size={16} className="text-[#709654]"/> ACTIVE ONBOARDING ADMISSION RECORDS
                    </h4>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 w-full md:w-80">
                      <Icons.Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7a8b95]" />
                      <input 
                        type="text" 
                        value={search} 
                        onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} 
                        placeholder="ค้นหาแผนก ชื่อพนักงาน หรือรหัสเตรียมงาน..." 
                        className="w-full pl-12 pr-6 py-2.5 text-[12px] border border-[#eaeaec] rounded-full font-bold outline-none focus:border-[#709654] bg-white shadow-sm text-[#222b38]" 
                      />
                    </div>
                  </div>
                </div>
                {/* Directory Data Grid view */}
                <div className="overflow-x-auto custom-scrollbar flex-1 min-h-0">
                  <table className="w-full text-left font-sans border-collapse select-none">
                    <thead className="bg-[#222b38] text-white">
                      <tr className="border-b-2 border-[#709654]">
                        <th className="py-4 px-6 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">ตั๋วรับโอนอ้างอิง</th>
                        <th className="py-4 px-6 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">รูปภาพและชื่อพนักงาน</th>
                        <th className="py-4 px-6 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">รายละเอียดตำแหน่ง / ฝ่าย</th>
                        <th className="py-4 px-6 font-black uppercase tracking-widest text-[12px] whitespace-nowrap w-48">ความความคืบหน้างาน</th>
                        <th className="py-4 px-6 font-black uppercase tracking-widest text-[12px] text-center whitespace-nowrap">พ้นหรือทดลองงาน</th>
                        <th className="py-4 px-6 font-black uppercase tracking-widest text-[12px] text-center whitespace-nowrap">โอนเข้าระเบียบ</th>
                        <th className="py-4 px-6 font-black uppercase tracking-widest text-[12px] text-center whitespace-nowrap">การจัดการระบบ</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#eaeaec]">
                      {currentData.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400 font-bold italic text-xs uppercase bg-[#f8f9fa]">
                            ไม่พบพนักงานใหม่หรือใบเตรียมข้อมูลในแผนกที่ระบุขณะนี้
                          </td>
                        </tr>
                      ) : (
                        currentData.map((item) => (
                          <tr key={item.id} className="hover:bg-[#f8f9fa] transition-colors group cursor-pointer" onClick={() => handleOpenEdit(item)}>
                            <td className="py-2.5 px-4">
                              <span className="block font-black font-mono text-[#3f809e] text-[12px]">{item.ticketId}</span>
                              <span className="block text-[10px] text-[#7a8b95] font-bold mt-0.5">เริ่มปฏิบัติงาน: {item.startDate}</span>
                            </td>
                            <td className="py-2.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl overflow-hidden border border-[#eaeaec] shadow-sm shrink-0 bg-[#f8f9fa]">
                                  <img src={item.image} alt={item.nameEn} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <span className="block font-black text-[#212c46] text-[12px] uppercase tracking-wide leading-none">{item.nameEn}</span>
                                  <span className="block text-[11px] font-bold text-[#606a5f] mt-1">{item.nameTh}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-4">
                              <span className="block font-black text-[#212c46] text-[12px] uppercase leading-none">{item.jobTitle}</span>
                              <span className="block text-[10.5px] text-[#b58c4f] uppercase font-bold tracking-wider mt-1.5">{item.dept}</span>
                            </td>
                            <td className="py-2.5 px-4" onClick={e => e.stopPropagation()}>
                              <ProgressBar progress={item.progress} />
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-widest border ${
                                item.probation?.probationStatus === 'Passed' ? 'bg-[#709654]/10 text-[#709654] border-[#709654]/30' : 'bg-amber-100 text-amber-700 border-amber-300'
                              }`}>
                                {item.probation?.probationStatus || 'On Probation'}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                              {item.isTransferred ? (
                                <span className="inline-flex items-center gap-1.5 bg-[#709654]/10 text-[#709654] border border-[#709654]/20 px-2 py-1 rounded-full text-[11px] font-black uppercase tracking-widest leading-none">
                                  <Icons.CheckCircle2 size={11} /> โอนสำเร็จ
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleTransferToDirectory(item)}
                                  className="inline-flex items-center gap-1 bg-[#222b38] hover:bg-[#709654] text-white px-3 py-1 rounded-full text-[11px] font-black tracking-widest uppercase shadow transition-all cursor-pointer"
                                  title="นำข้อมูลคนนี้เข้าสู่ทำเนียบพนักงานกลางล่วงหน้า"
                                >
                                  <Icons.Share2 size={11} /> โอนประวัติ
                                </button>
                              )}
                            </td>
                            <td className="py-2.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                              <div className="flex justify-center items-center gap-[2px]">
                                <button 
                                  onClick={() => handleOpenEdit(item)}
                                  className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-[#3f809e] bg-[#3f809e]/10 hover:bg-[#3f809e]/20 transition-all active:scale-95 cursor-pointer"
                                  title="แก้ไข Checklist & ประเมินงาน"
                                >
                                  <Icons.CheckSquare size={13} />
                                </button>
                                <button 
                                  onClick={() => handleSendWelcomeEmail(item.nameEn)}
                                  className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-[#657f4d] bg-[#657f4d]/10 hover:bg-[#657f4d]/20 transition-all active:scale-95 cursor-pointer"
                                  title="ส่งอีเมลอบรมต้อนรับ"
                                >
                                  <Icons.Send size={13} />
                                </button>
                                <button 
                                  onClick={() => handleCancelOnboardingPipeline(item.id, item.nameEn)}
                                  className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-[#932c2e] bg-[#932c2e]/10 hover:bg-[#932c2e]/20 transition-all active:scale-95 cursor-pointer"
                                  title="ยกเลิกสารบบเตรียมงาน"
                                >
                                  <Icons.Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Standard synced Directory Pagination component matching UserPermissions layout */}
                <div className="px-8 py-3 bg-[#f8f9fa] border-t border-[#eaeaec] flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 transition-all text-[#222b38] font-sans">
                  <div className="flex items-center gap-6 text-[11px] font-black uppercase tracking-widest text-[#7a8b95]">
                    <div className="flex items-center gap-3">
                      <span>Display Rows:</span>
                      <select 
                        value={itemsPerPage} 
                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} 
                        className="bg-white border border-[#eaeaec] rounded-lg px-3 py-1.5 outline-none font-black text-[#222b38] cursor-pointer shadow-sm focus:border-[#709654]"
                      >
                        {[5, 10, 20, 50].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                    <p className="bg-white px-4 py-2 rounded-xl border border-[#eaeaec] shadow-sm text-[#222b38]">Total Records: {filteredRecords.length}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                      disabled={currentPage === 1} 
                      className={`w-10 h-10 border border-[#eaeaec] bg-white rounded-xl flex items-center justify-center transition-all ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#222b38] hover:text-white shadow-sm active:scale-90 cursor-pointer'}`}
                    >
                      <Icons.ChevronLeft size={18}/>
                    </button>
                    <div className="bg-[#222b38] text-white px-8 py-2.5 rounded-xl shadow-md font-black text-[11px] min-w-[140px] text-center uppercase tracking-widest border border-[#222b38]">
                      Page {currentPage} / {totalPages}
                    </div>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                      disabled={currentPage === totalPages} 
                      className={`w-10 h-10 border border-[#eaeaec] bg-white rounded-xl flex items-center justify-center transition-all ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#222b38] hover:text-white shadow-sm active:scale-90 cursor-pointer'}`}
                    >
                      <Icons.ChevronRight size={18}/>
                    </button>
                  </div>
                </div>
            </div>)
          ) : (
            /* ----- SETTINGS & INTERVIEW POOL SYSTEM ----- */
            (<div className="bg-white rounded-3xl shadow-lg border border-[#eaeaec] p-8 space-y-6 font-sans">
                <div className="flex justify-between items-center border-b border-[#eaeaec] pb-4">
                  <div>
                    <h4 className="text-[14px] font-black text-[#222b38] uppercase tracking-wider flex items-center gap-2">
                      <Icons.Database className="text-[#709654]" size={18} /> Qualified Candidates Interview Pool (ผลสัมภาษณ์ผ่านเกณฑ์พร้อมบรรจุ)
                    </h4>
                    <p className="text-[11px] text-[#7a8b95] font-medium leading-none mt-1 uppercase tracking-widest">
                      Real-time syncing from Recruitment database feeds (ผลการประเมินจากรอบสัมภาษณ์)
                    </p>
                  </div>
                  <span className="p-2 px-4 rounded-xl bg-[#709654]/10 text-[#709654] font-black text-[11px] uppercase tracking-widest">
                    {passedCandidates.length} Candidates Available
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {passedCandidates.map((cand: any) => (
                    <div key={cand.id} className="p-5 rounded-2xl bg-[#f8f9fa] border border-[#eaeaec] hover:border-[#709654] transition-all flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="bg-[#3f809e]/10 text-[#3f809e] px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase font-mono">{cand.id}</span>
                            <h5 className="font-black text-[#222b38] text-[13.5px] uppercase tracking-wide mt-2">{cand.candidate}</h5>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-gray-400 block font-bold">AVG SCORE</span>
                            <span className="text-[15px] font-black text-[#709654] font-mono">{cand.averageScore || '8.8'} <span className="text-[10px] text-gray-400">/10</span></span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4 text-[12px] font-bold text-[#414757]">
                          <div className="bg-white p-2.5 rounded-xl border border-[#eaeaec]">
                            <span className="block text-[9.5px] text-[#7a8b95] uppercase tracking-widest mb-1">DEPARTMENT</span>
                            {cand.dept}
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border border-[#eaeaec]">
                            <span className="block text-[9.5px] text-[#7a8b95] uppercase tracking-widest mb-1 font-sans">JOB TITLE</span>
                            {cand.jobTitle}
                          </div>
                        </div>

                        <div className="mt-3 text-[11.5px] text-[#7a8b95] bg-white p-3 rounded-xl border border-[#eaeaec] italic">
                          "{cand.comment || cand.comments || 'ผ่านทดลองสัมภาษณ์ ความพร้อมดี มีความพยายามกระตือรือร้น'}"
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => handleInitiateOnboarding(cand)}
                          className="w-full bg-[#222b38] hover:bg-[#709654] text-white py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer select-none"
                        >
                          <Icons.Plus size={13} /> ดึงรายชื่อพนักงานนี้และเริ่ม Onboard
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 bg-[#222b38]/5 rounded-2xl p-5 border border-[#222b38]/10 text-[12px] font-medium leading-relaxed text-[#414757] flex gap-4">
                   <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#709654] shrink-0 border border-[#eaeaec] shadow-sm">
                      <Icons.Info size={20} />
                   </div>
                   <div>
                      <span className="block font-black text-[#222b38] uppercase tracking-widest text-[11px] mb-1">กฎและเงื่อนไขการเชื่อมต่อสารบบ (Recruitment-to-Onboarding Rules):</span>
                      เมื่อบันทึกผลการสัมภาษณ์จากโมดูล <span className="font-bold underline text-[#3f809e]">Interview Feedbacks</span> เป็นสถานะ <span className="font-black text-[#709654]">"Qualified"</span> ผู้สมัครดังกล่าวจะถูกดึงเข้ากลุ่มเตรียมประวัติการเข้าทำงานในแผงควบคุมนี้อัตโนมัติ ช่วยลดความซ้ำซ้อนการคีย์ข้อมูล และเมื่อประเมินพ้นทดลองงานแล้ว สามารถสั่งปุ่ม "โอนย้ายประวัติ" เพื่อส่งข้อมูลเข้าส่งทำเนียบพนักงานในหน้าสารบัญกลาง (Employee Directory) ทันทีเป็นมาตรฐานสากล
                   </div>
                </div>
            </div>)
          )}
          {/* mt-8 bottom spacing for 32px before footer */}
          
      </div>
  );
}

