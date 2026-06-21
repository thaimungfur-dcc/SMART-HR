import { UserGuidePanel } from '../../components/shared/UserGuidePanel';
import KpiCard from '../../components/shared/KpiCard';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  TrendingDown, Users, Search, Filter, Plus, ChevronLeft, ChevronRight, 
  ChevronDown, Edit3, Trash2, HelpCircle, X, CheckCircle2, Clock, 
  Calendar, Save, Info, BarChart3, PieChart, BrainCircuit, UserMinus, 
  Building2, Briefcase, TrendingUp, Target, History, ShieldAlert, BookOpen, Key, RefreshCw
} from 'lucide-react';
import { DraggableModal } from '../../components/shared/DraggableModal';

// --- Theme Configuration (Synced with Home & LaborRelations Earth-tones) ---
const THEME = {
  bgMain: 'transparent',
  primary: '#b22026',
  secondary: '#3f809e',
  accent: '#b58c4f',
  textMain: '#2f2926',
  palette: {
    maroon: '#932c2e', sage: '#606a5f', charcoal: '#414757', brick: '#851c24', 
    navy: '#212c46', burntOrange: '#a94228', gold: '#b58c4f', forest: '#657f4d', 
    sand: '#b7a159', mustard: '#8e9141', plum: '#a54f6b', olive: '#bab98b',
    bronze: '#8b2c3d', apple: '#818d47', rose: '#ab7d82', slate: '#748b9e',
    cerulean: '#3f809e', moss: '#84896d', mutedBlue: '#748ea1', red: '#b22026',
    black: '#2f2926', steel: '#4d87a8', coral: '#d96245', deepGreen: '#508660',
    midnight: '#2d2c4a', warmGrey: '#7a8b95', dustyGreen: '#939885', cream: '#f3f3f1'
  }
};

const MOCK_TURNOVERS = [
  { 
    id: 'TO-2024-001', 
    name: 'กิตติพงษ์ ใจมั่น', 
    position: 'Senior Engineer', 
    department: 'Engineering', 
    reason: 'Better Opportunity', 
    tenure: '4.5 Years', 
    exitDate: '2024-04-30', 
    status: 'Completed',
    notes: 'ได้รับข้อเสนอเงินเดือนเพิ่มขึ้น 30% และสวัสดิการที่ยืดหยุ่นกว่า...',
    aiPredictionSync: true
  },
  { 
    id: 'TO-2024-002', 
    name: 'สุนิสา สวยงาม', 
    position: 'Marketing Specialist', 
    department: 'Marketing', 
    reason: 'Work-Life Balance', 
    tenure: '1.2 Years', 
    exitDate: '2024-05-15', 
    status: 'In Progress',
    notes: 'ต้องการเวลาดูแลครอบครัวมากขึ้น เนื่องจากงานปัจจุบันมี OT บ่อยเกินไป...',
    aiPredictionSync: true
  },
  { 
    id: 'TO-2024-003', 
    name: 'อดิศักดิ์ ขยันดี', 
    position: 'Production Supervisor', 
    department: 'Operations', 
    reason: 'Personal Issues', 
    tenure: '8.2 Years', 
    exitDate: '2024-03-20', 
    status: 'Completed',
    notes: 'ย้ายกลับภูมิลำเนาเพื่อประกอบธุรกิจส่วนตัวของครอบครัว...',
    aiPredictionSync: false
  },
  { 
    id: 'TO-2024-004', 
    name: 'วิภาวี มีสุข', 
    position: 'Accountant', 
    department: 'Finance', 
    reason: 'Management Issues', 
    tenure: '2.5 Years', 
    exitDate: '2024-01-10', 
    status: 'Completed',
    notes: 'มีความขัดแย้งในสไตล์การบริหารงานกับหัวหน้าแผนกคนใหม่...',
    aiPredictionSync: true
  }
];

interface TurnoverRecord {
  id: string;
  name: string;
  position: string;
  department: string;
  reason: string;
  tenure: string;
  exitDate: string;
  status: string;
  notes: string;
  aiPredictionSync: boolean;
}

interface EditTurnoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: TurnoverRecord | null;
  onSave: (record: TurnoverRecord) => void;
}

const EditTurnoverModal = ({ isOpen, onClose, record: activeRecord, onSave }: EditTurnoverModalProps) => {
  const [modalStep, setModalStep] = useState(0);
  const [formData, setFormData] = useState<TurnoverRecord>({ 
    id: '', name: '', position: '', department: 'Engineering', reason: 'Better Opportunity', 
    tenure: '', exitDate: '', status: 'Completed', notes: '', aiPredictionSync: true 
  });

  useEffect(() => {
    if (activeRecord) {
      setFormData({ ...activeRecord });
    } else {
      setFormData({ 
        id: '', name: '', position: '', department: 'Engineering', reason: 'Better Opportunity', 
        tenure: '', exitDate: '', status: 'Completed', notes: '', aiPredictionSync: true 
      });
    }
    setModalStep(0);
  }, [activeRecord, isOpen]);

  if (!isOpen) return null;

  return (
    <DraggableModal
        isOpen={isOpen}
        onClose={onClose}
        width="max-w-[850px]"
        customHeader={
            <div className="bg-[#212c46] px-5 py-4 flex justify-between items-center text-[#f3f3f1] shrink-0 border-b-2 border-[#b22026]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <History size={20} className="text-[#b58c4f]"/>
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest">
                  {activeRecord ? 'Configure Attrition Node' : 'Initialize Resignation Record'}
                </h3>
              </div>
              <button type="button" onClick={onClose} className="hover:text-[#b22026] text-white/70 transition-colors p-1.5 bg-white/10 hover:bg-white/20 rounded-full"><X size={16}/></button>
            </div>
        }
    >
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#f8f9fa] max-h-[75vh]">
          {/* Left Sidebar Step Navigator (Standard of User Permissions) */}
          <div className="w-full md:w-56 bg-white border-b md:border-b-0 md:border-r border-[#eaeaec] flex flex-row md:flex-col shrink-0">
            <div className="hidden md:block px-4 py-3.5 text-[10px] font-black text-[#7a8b95] uppercase tracking-widest border-b border-[#eaeaec] bg-[#f8f9fa]">Configuration Nodes</div>
            {[
              { id: 0, label: 'Personnel Profile', icon: Users },
              { id: 1, label: 'Exit Interview', icon: Target },
              { id: 2, label: 'AI Sync & Status', icon: BrainCircuit }
            ].map(step => (
                <button 
                  key={step.id} 
                  type="button"
                  onClick={() => setModalStep(step.id)} 
                  className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-3 px-4 py-3 text-left transition-all md:border-l-4 ${modalStep === step.id ? 'border-b-4 md:border-b-0 border-[#b22026] bg-[#f8f9fa] text-[#212c46]' : 'border-transparent text-[#7a8b95] hover:bg-[#f8f9fa]/50'}`}
                >
                    <step.icon size={14} className={modalStep === step.id ? 'text-[#b22026]' : 'text-[#7a8b95]'} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Node {step.id + 1}: {step.label}</span>
                </button>
            ))}
          </div>

          {/* Right Pane (Form inputs matching standard layout) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white">
            
            {modalStep === 0 && (
              <div className="space-y-4 animate-fadeIn pb-6 flex-1 flex-col flex min-h-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest">Personnel Name (ชื่อพนักงาน)</label>
                    <input 
                      type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b22026] text-[12px] font-bold text-[#212c46]"
                      placeholder="ระบุชื่อพนักงาน..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest">Position (ตำแหน่งงาน)</label>
                    <input 
                      type="text" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b22026] text-[12px] font-bold text-[#212c46]"
                      placeholder="เช่น Senior Engineer, Accountant..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest">Department (แผนก)</label>
                    <select 
                      value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b22026] text-[12px] font-bold text-[#212c46] cursor-pointer"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Operations">Operations</option>
                      <option value="Finance">Finance</option>
                      <option value="HR & Admin">HR & Admin</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest">Tenure (อายุงาน)</label>
                    <input 
                      type="text" value={formData.tenure} onChange={e => setFormData({...formData, tenure: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b22026] text-[12px] font-bold text-[#212c46]"
                      placeholder="เช่น 4.5 Years หรือ 1.2 Years..."
                    />
                  </div>
                </div>
              </div>
            )}

            {modalStep === 1 && (
              <div className="space-y-4 animate-fadeIn pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest">Primary Exit Reason (สาเหตุการออก)</label>
                    <select 
                      value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b22026] text-[12px] font-bold text-[#212c46] cursor-pointer"
                    >
                      <option value="Better Opportunity">Better Opportunity (ความต้องการพัฒนาตนเอง)</option>
                      <option value="Work-Life Balance">Work-Life Balance (ชีวิตส่วนตัว)</option>
                      <option value="Management Issues">Management Issues (การบริหารทีม)</option>
                      <option value="Personal Issues">Personal Issues (ปัญหาส่วนตัว)</option>
                      <option value="Health Issues">Health Issues (ปัญหาสุขภาพ)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest">Exit Date (วันที่ลาออก)</label>
                    <input 
                      type="date" value={formData.exitDate} onChange={e => setFormData({...formData, exitDate: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b22026] text-[12px] font-bold text-[#212c46]"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest">Exit Interview Summary Notes (บันทึกบทสัมภาษณ์)</label>
                  <textarea 
                    value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-2xl outline-none focus:border-[#b22026] text-[12px] font-medium leading-relaxed resize-none custom-scrollbar text-[#212c46]"
                    placeholder="ระบุความคิดเห็นของพนักงาน แนวทางสืบสวนและบันทึกเพิ่มเติมเพื่อประเมินเสถียรภาพแผนก..."
                  />
                </div>
              </div>
            )}

            {modalStep === 2 && (
              <div className="space-y-4 animate-fadeIn pb-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest">Status (สถานะกรณี)</label>
                  <select 
                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b22026] text-[12px] font-bold text-[#212c46] cursor-pointer"
                  >
                    <option value="Completed">Completed (วิเคราะห์สำเร็จเสร็จสิ้น)</option>
                    <option value="In Progress">In Progress (กำลังดำเนินการ Exit Interview)</option>
                  </select>
                </div>
                <div className="p-4 bg-[#3f809e]/5 border border-[#3f809e]/20 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-[#3f809e]/30 shadow-xs">
                      <BrainCircuit size={18} className="text-[#3f809e]" />
                    </div>
                    <div>
                      <span className="text-[11px] font-black uppercase text-[#212c46] tracking-wider block">AI Turnover Sync</span>
                      <p className="text-[9px] font-medium text-[#7a8b95]">ส่งต่อชุดข้อมูลเข้ารหัสเพื่อพยากรณ์ภาวะการลาออกเชิงลึก</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${formData.aiPredictionSync ? 'text-[#508660]' : 'text-[#7a8b95]'}`}>
                      {formData.aiPredictionSync ? 'Sync Online' : 'Sync Offline'}
                    </span>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, aiPredictionSync: !formData.aiPredictionSync})} 
                      className={`w-10 h-5 rounded-full relative transition-all duration-300 ${formData.aiPredictionSync ? 'bg-[#508660]' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${formData.aiPredictionSync ? 'left-[22px]' : 'left-0.5'}`}/>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Modal Buttons Footer */}
        <div className="px-6 py-4 bg-[#f8fafc] border-t border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-1.5 text-[9px] text-[#7a8b95] font-mono font-black uppercase tracking-widest">
            <Info size={13}/> Confidential Record Protected Node under PDPA standard
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest text-[#606a5f] hover:bg-[#f3f3f1] border border-[#eaeaec] bg-white cursor-pointer hover:text-[#2f2926]">
              Cancel
            </button>
            <button type="button" onClick={() => { onSave(formData); onClose(); }} className="px-5 py-2 bg-[#212c46] text-white rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-[#b22026] shadow-xs active:scale-95 border border-[#1d2636] cursor-pointer">
              <Save size={14}/> Save Database
            </button>
          </div>
        </div>
    </DraggableModal>
  );
};

export default function TurnoverAnalysis() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; record: TurnoverRecord | null }>({ isOpen: false, record: null });
  const [records, setRecords] = useState<TurnoverRecord[]>(MOCK_TURNOVERS);
  const [toast, setToast] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsFilterOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { All: records.length };
    records.forEach(r => counts[r.department] = (counts[r.department] || 0) + 1);
    return counts;
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => 
      (activeFilter === 'All' || r.department === activeFilter) &&
      (r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()) || r.position.toLowerCase().includes(search.toLowerCase()))
    );
  }, [records, search, activeFilter]);

  const handleSave = (data: TurnoverRecord) => {
    if (data.id) {
      setRecords(records.map(r => r.id === data.id ? data : r));
      setToast('อัปเดตข้อมูลวิเคราะห์และบทสัมภาษณ์การลาออกสำเร็จค่ะ');
    } else {
      const newEntry = { 
        ...data, 
        id: `TO-2024-${Math.floor(100 + Math.random() * 900)}`, 
        exitDate: data.exitDate || new Date().toISOString().split('T')[0]
      };
      setRecords([newEntry, ...records]);
      setToast('ลงทะเบียนแบบสำรวจ Exit Case สำเร็จเรียบร้อยค่ะ');
    }
    setTimeout(() => setToast(null), 3500);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('ยืนยันรหัสการย้ายประวัติการลาออกสกัดชุดวิเคราะห์? ข้อมูลจะถูกจัดเก็บแบบออฟไลน์เท่านั้น')) {
      setRecords(records.filter(r => r.id !== id));
      setToast('ลบและบันทึกประวัติการลาออกลงหน่วยจัดเก็บเก่าย้อนหลังสำเร็จ');
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="flex flex-1 w-full flex-col animate-fadeIn bg-transparent space-y-4 pb-6">
      {/* Floating User Guide Button (Matching standard style & exactly positioned) */}
      {typeof document !== 'undefined' && createPortal(
        <button onClick={() => setIsGuideOpen(true)} className="fixed right-0 bg-[#f8fafc] border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#932c2e] hover:text-white hover:border-[#932c2e] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group cursor-pointer" style={{ top: '120px' }}>
            <HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#7a8b95] group-hover:text-white" />
            <span className="font-black tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[10px] font-mono leading-none">USER GUIDE</span>
        </button>,
        document.body
      )}
      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <EditTurnoverModal isOpen={modal.isOpen} onClose={() => setModal({isOpen: false, record: null})} record={modal.record} onSave={handleSave} />
      {/* TOAST SYSTEM */}
      {toast && createPortal(
        <div className="fixed bottom-6 right-6 z-[1000] animate-fadeIn bg-white border-l-4 border-[#b22026] shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-5 py-4 rounded-xl flex items-center gap-3">
            <CheckCircle2 size={18} className="text-[#b22026]" />
            <span className="text-[11px] font-black text-[#212c46] uppercase tracking-widest font-mono">{toast}</span>
            <button onClick={() => setToast(null)} className="ml-4 text-[#64748b] hover:text-[#b22026] cursor-pointer"><X size={14}/></button>
        </div>,
        document.body
      )}
      {/* PAGE HEADER SECTION: NO BACKGROUND COLOR, PLACED DIRECTLY ON MAIN PAGE AS SPECIFIED */}
      <div className="h-14 px-8 flex flex-row items-center justify-between gap-4 z-20 shrink-0 bg-transparent">
          <div className="flex items-center gap-5">
              <div className="relative flex items-center justify-center group cursor-default shrink-0">
                  <div className="absolute inset-0 bg-[#b22026] blur-[15px] opacity-20 rounded-full group-hover:opacity-60 transition-all duration-700"></div>
                  <div className="relative z-10 p-1.5 border border-[#b22026]/40 rounded-xl bg-white/50 backdrop-blur-xs shadow-xs">
                      <TrendingDown size={28} strokeWidth={2.5} className="text-[#b22026]" />
                  </div>
              </div>
              <div>
                  <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none" style={{ fontSize: '24px' }}>
                      TURNOVER <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b22026] to-[#b58c4f]">ANALYSIS</span>
                  </h3>
                  <p className="text-[11px] font-bold text-[#4d5a44] uppercase tracking-[0.2em] mt-0.5 opacity-80 leading-none">
                      STAFF ATTRITION ANALYTICS & EXIT INTERVIEW CONTROL NODE
                  </p>
              </div>
          </div>

          <div className="flex items-center gap-4">
              <button 
                onClick={() => setModal({isOpen: true, record: null})}
                className="px-6 py-2.5 bg-[#212c46] text-[#f3f3f1] rounded-xl text-[11px] font-black uppercase tracking-widest shadow-md hover:bg-[#b22026] transition-all flex items-center gap-2 active:scale-95 cursor-pointer border border-[#212c46]"
              >
                <Plus size={16} /> Register Exit Case
              </button>
          </div>
      </div>
      <div className="px-4 sm:px-8 w-full mt-[2px]">
        <div className="w-full">
            
            {/* KPI STATS CARDS - LEAN AND COMPACT AS REQUESTED */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3 shrink-0">
                <KpiCard label="YTD Attrition" value={records.length} icon={UserMinus} color={THEME.palette.brick} description="Active Exit Cases" />
                <KpiCard label="Turnover Rate" value="4.2%" icon={TrendingDown} color={THEME.palette.red} description="Annual Forecast" />
                <KpiCard label="Avg Experience" value="3.5 Yrs" icon={Clock} color={THEME.palette.slate} description="Workforce Tenure" />
                <KpiCard label="Retention Rate" value="95.8%" icon={TrendingUp} color={THEME.palette.forest} description="Healthy Standard" />
            </div>

            {/* MAIN DATA BLOCK */}
            <div className="bg-white/90 rounded-3xl shadow-lg border border-[#eaeaec] overflow-hidden flex flex-col animate-fadeIn  flex-1 min-h-0">
                
                {/* FILTER CONTROL SEGMENT */}
                <div className="px-8 py-4 border-b border-[#eaeaec] bg-[#f8f9fa] flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative" ref={dropdownRef}>
                          <button 
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center justify-between gap-3 px-4 py-2 bg-[#f3f3f1] border border-slate-200 rounded-xl min-w-[200px] text-[11px] font-black uppercase tracking-widest text-[#414757] hover:bg-white transition-all shadow-xs active:scale-95 cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                                <Filter size={14} className="text-[#b58c4f]"/>
                                {activeFilter === 'All' ? 'Filter: Global Registry' : `Dept: ${activeFilter}`}
                            </div>
                            <ChevronDown size={14} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`}/>
                          </button>

                          {isFilterOpen && (
                            <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-[#939885]/20 z-[100] overflow-hidden animate-fadeIn font-tech">
                                {['All', 'Engineering', 'Marketing', 'Operations', 'Finance'].map((cat) => (
                                    <button 
                                        key={cat}
                                        type="button"
                                        onClick={() => { setActiveFilter(cat); setIsFilterOpen(false); }}
                                        className={`w-full px-4 py-3 text-[11px] font-black uppercase tracking-widest text-left flex items-center justify-between hover:bg-[#f3f3f1] transition-all cursor-pointer ${activeFilter === cat ? 'bg-[#212c46]/5 text-[#b22026]' : 'text-[#414757]'}`}
                                    >
                                        <span>{cat}</span>
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-black ${activeFilter === cat ? 'bg-[#b22026] text-white' : 'bg-[#eaeaec] text-[#7a8b95]'}`}>
                                            {filterCounts[cat] || 0}
                                        </span>
                                    </button>
                                ))}
                            </div>
                          )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7a8b95]" />
                            <input 
                              type="text" value={search} onChange={e => setSearch(e.target.value)} 
                              placeholder="Search employee, ID, position..." 
                              className="w-full pl-12 pr-6 py-2.5 text-[12px] border border-[#eaeaec] rounded-full font-bold outline-none focus:border-[#b7a159] bg-white shadow-sm text-[#212c46]" 
                            />
                        </div>
                    </div>
                </div>

                {/* TABLE STREAM OVER MULTI-COL */}
                <div className="overflow-auto custom-scrollbar  flex-1 min-h-0">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead className="bg-[#222b38] text-white">
                            <tr className="border-b-2 border-[#709654]">
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">Record ID</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap font-sans">Personnel & Attrition Node</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Primary Reason</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Tenure</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center font-sans">Exit Date</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">AI Sync Status</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#eaeaec]">
                            {filteredRecords.map(r => (
                                <tr key={r.id} className="hover:bg-[#f8f9fa] transition-colors group">
                                    <td className="py-2.5 px-4 font-mono font-black text-[#7a8b95] text-[12px]">{r.id}</td>
                                    <td className="py-2.5 px-4">
                                        <div className="flex flex-col text-[12px]">
                                            <div className="flex items-center gap-2">
                                              <span className="font-black text-[#2f2926] text-[12px] uppercase group-hover:text-[#b22026] transition-colors">{r.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 opacity-75 group-hover:opacity-100 transition-opacity">
                                              <span className="text-[10px] text-[#939885] font-medium flex items-center gap-1 font-mono"><Briefcase size={10}/> {r.position}</span>
                                              <span className="text-[10px] text-[#b58c4f] font-black uppercase tracking-widest font-mono"><Building2 size={10}/> {r.department}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-4 text-center">
                                        <span className="text-[11px] font-black text-[#606a5f] uppercase tracking-wider flex items-center justify-center gap-1.5 leading-none">
                                          <Target size={13} className="text-[#3f809e]"/>
                                          {r.reason}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-4 text-center font-mono text-[#2f2926] font-bold text-[12px]">
                                        {r.tenure}
                                    </td>
                                    <td className="py-2.5 px-4 text-center font-mono text-[#b22026] font-bold text-[12px]">
                                        {r.exitDate}
                                    </td>
                                    <td className="py-2.5 px-4 text-center">
                                        <div className="flex items-center justify-center">
                                            {r.aiPredictionSync ? (
                                                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase border tracking-wider bg-[#508660]/10 text-[#508660] border-[#508660]/30 flex items-center gap-1">
                                                  <BrainCircuit size={10} /> Active
                                                </span>
                                            ) : (
                                                <span className="text-[11px] font-mono text-slate-300">-</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-4 text-center">
                                        <div className="flex justify-center items-center gap-[1px]">
                                            <button 
                                                onClick={() => setModal({isOpen: true, record: r})} 
                                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-[#b58c4f] hover:bg-[#b58c4f] hover:text-white hover:border-[#b58c4f] transition-all active:scale-90 shadow-xs cursor-pointer" 
                                                title="Edit / View Node"
                                            >
                                                <Edit3 size={13}/>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(r.id)} 
                                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-[#b22026] hover:bg-[#b22026] hover:text-white hover:border-[#b22026] transition-all active:scale-90 shadow-xs cursor-pointer" 
                                                title="Delete Node"
                                            >
                                                <Trash2 size={13}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredRecords.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center">
                                      <div className="flex flex-col items-center opacity-30">
                                        <Users size={48} className="mb-2 text-[#7a8b95]"/>
                                        <p className="text-[12px] font-black uppercase tracking-[0.25em] text-[#2f2926]">ไม่พบข้อมูลวิเคราะห์อัตรการลาออกในระบบ</p>
                                      </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* TABLE CONTROLS FOOTER */}
                <div className="px-6 py-3 bg-[#F0EAE1]/80 backdrop-blur-md border-t-[1.5px] border-[#adb2b0]/50 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 font-sans">
                    <div className="flex items-center gap-5 text-[11px] font-black text-[#606a5f] uppercase tracking-widest">
                      <p className="bg-white px-3 py-1.5 rounded-lg border border-[#eaeaec] shadow-xs font-mono">Total Records: {filteredRecords.length}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#508660]"></span>
                        <span>AI Predictive Synced</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" className="w-8 h-8 border border-slate-200 bg-white rounded-lg flex items-center justify-center opacity-40 cursor-not-allowed shadow-xs hover:bg-[#212c46] hover:text-white"><ChevronLeft size={14}/></button>
                      <div className="bg-white text-[#414757] px-4 py-1.5 rounded-lg font-black text-[11px] min-w-[100px] text-center uppercase tracking-widest border border-slate-200 shadow-xs font-mono">Page 1 / 1</div>
                      <button type="button" className="w-8 h-8 border border-slate-200 bg-white rounded-lg flex items-center justify-center opacity-40 cursor-not-allowed shadow-xs hover:bg-[#212c46] hover:text-white"><ChevronRight size={14}/></button>
                    </div>
                </div>

            </div>

            {/* SPACER MARGIN BOTTOM GIVES EXACTLY 32PX (mt-8) SPACING TO FOOTER AS REQUESTED */}
            <div className="mt-8 shrink-0"></div>

        </div>
      </div>
    </div>
  );
}
