import { UserGuidePanel } from '../../components/shared/UserGuidePanel';
import KpiCard from '../../components/shared/KpiCard';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Scale, MessageSquare, Users, ShieldCheck, Gavel, Search, Filter, Plus, 
  ChevronLeft, ChevronRight, Edit3, Trash2, HelpCircle, X, CheckCircle2, 
  Calendar, Save, Info, AlertTriangle, ChevronDown, 
  Paperclip, FileUp, File, User, Building2, Hammer, UserCheck, Sparkles
} from 'lucide-react';
import { DraggableModal } from '../../components/shared/DraggableModal';

// --- Theme Style Configuration (Premium Industrial Earth-tones Match Home & UserPermissions) ---
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

const MOCK_GRIEVANCES = [
  { 
    id: 'GRV-2024-001', 
    title: 'ข้อเสนอปรับปรุงค่าล่วงเวลาพนักงานฝ่ายผลิต', 
    reporter: 'สหภาพแรงงานฯ', 
    category: 'Wages & Benefits', 
    severity: 'High', 
    status: 'In Investigation', 
    date: '2024-04-10',
    assignedTo: 'HR Manager',
    content: 'สหภาพขอหารือเรื่องการปรับอัตรา OT พิเศษสำหรับกะดึก เนื่องจากมีการปรับเวลาทำงานใหม่...',
    attachments: [{ name: 'union_proposal_v1.pdf', size: '1.4 MB' }]
  },
  { 
    id: 'GRV-2024-002', 
    title: 'ร้องเรียนสภาพแวดล้อมการทำงานโซนคลังสินค้า', 
    reporter: 'สมชาย รักดี', 
    category: 'Work Environment', 
    severity: 'Medium', 
    status: 'Resolved', 
    date: '2024-03-15',
    assignedTo: 'Safety Officer',
    content: 'พนักงานแจ้งว่าระบบระบายอากาศในคลังสินค้าโซน C ทำงานไม่เต็มประสิทธิภาพ ทำให้มีอุณหภูมิสูงเกินไป',
    attachments: []
  },
  { 
    id: 'GRV-2024-003', 
    title: 'กรณีความขัดแย้งระหว่างหัวหน้างานและพนักงาน', 
    reporter: 'วิภาดา แสงดาว', 
    category: 'Behavioral', 
    severity: 'Medium', 
    status: 'Open', 
    date: '2024-05-02',
    assignedTo: 'Employee Relations',
    content: 'พนักงานแจ้งว่ามีการใช้ถ้อยคำไม่สุภาพในการสั่งงานในกลุ่มไลน์ส่วนตัว ส่งผลต่อกำลังใจในการทำงาน',
    attachments: [{ name: 'chat_screenshot.png', size: '0.8 MB' }]
  },
  { 
    id: 'GRV-2024-004', 
    title: 'ตีความประกาศบริษัทเรื่องโบนัสปี 2566', 
    reporter: 'สหภาพแรงงานฯ', 
    category: 'Policy Interpretation', 
    severity: 'Low', 
    status: 'Resolved', 
    date: '2024-01-20',
    assignedTo: 'HR Director',
    content: 'ต้องการคำชี้แจงเพิ่มเติมเกี่ยวกับการคำนวณโบนัสสำหรับพนักงานที่ทดลองงานครบ 120 วัน...',
    attachments: []
  }
];

interface Attachment {
  name: string;
  size: string;
}

interface GrievanceCase {
  id?: string;
  title: string;
  reporter: string;
  category: string;
  severity: string;
  status: string;
  date: string;
  assignedTo: string;
  content: string;
  attachments: Attachment[];
}

interface GrievanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  grievance: GrievanceCase | null;
  onSave: (grievance: GrievanceCase) => void;
}

const GrievanceModal = ({ isOpen, onClose, grievance: activeGrv, onSave }: GrievanceModalProps) => {
  const [formData, setFormData] = useState<GrievanceCase>({ 
    title: '', reporter: '', category: 'Wages & Benefits', severity: 'Medium', 
    status: 'Open', assignedTo: '', content: '', attachments: [] 
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeGrv) {
      setFormData({ ...activeGrv });
    } else {
      setFormData({ 
        title: '', reporter: '', category: 'Wages & Benefits', severity: 'Medium', 
        status: 'Open', assignedTo: 'Employee Relations', content: '', attachments: [] 
      });
    }
  }, [activeGrv, isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) as File[] : [];
    const newAttachments = files.map(f => ({ name: f.name, size: (f.size / (1024 * 1024)).toFixed(2) + ' MB' }));
    setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...newAttachments] }));
  };

  if (!isOpen) return null;
  return (
    <DraggableModal
        isOpen={isOpen}
        onClose={onClose}
        width="max-w-[780px]"
        customHeader={
            <div className="bg-[#212c46] px-5 py-4 flex justify-between items-center text-[#f3f3f1] shrink-0 border-b-2 border-[#b22026]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Scale size={20} className="text-[#b58c4f]"/>
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest">
                  {activeGrv ? 'Modify Investigation Case Node' : 'Register New Grievance Registry'}
                </h3>
              </div>
              <button type="button" onClick={onClose} className="hover:text-[#b22026] text-white/70 transition-colors p-1.5 bg-white/10 hover:bg-white/20 rounded-full"><X size={16}/></button>
            </div>
        }
    >
        <div className="flex-1 flex flex-col overflow-hidden bg-white max-h-[75vh]">
          <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest ml-1">Case Title (ชื่องานร้องกัน)</label>
                <input 
                  type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b22026] text-[12px] font-bold text-[#212c46]"
                  placeholder="หัวข้อการร้องเรียนประสานงาน..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest ml-1">Reporter Name/Representative (ผู้แจ้งเรื่อง)</label>
                <div className="relative">
                  <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b58c4f]"/>
                  <input 
                    type="text" value={formData.reporter} onChange={e => setFormData({...formData, reporter: e.target.value})}
                    className="w-full pl-11 pr-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b22026] text-[12px] font-bold text-[#212c46]"
                    placeholder="เช่น สมชาย รักดี หรือ สหภาพแรงงานฯ..."
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest ml-1">Category (ประเภท)</label>
                <select 
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b22026] text-[12px] font-bold cursor-pointer text-[#212c46]"
                >
                  <option value="Wages & Benefits">Wages & Benefits (ค่าตอบแทน/สวัสดิการ)</option>
                  <option value="Work Environment">Work Environment (สิ่งแวดล้อมงาน)</option>
                  <option value="Behavioral">Behavioral (พฤติกรรมการทำงาน)</option>
                  <option value="Policy Interpretation">Policy Interpretation (การตีความกฎระเบียบ)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#2f2926] uppercase tracking-widest ml-1">Severity Node (ระดับความระดับ)</label>
                <select 
                  value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})}
                  className={`w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b22026] text-[12px] font-black cursor-pointer ${formData.severity === 'High' ? 'text-[#b22026]' : 'text-[#212c46]'}`}
                >
                  <option value="Low">Low (ความเสี่ยงต่ำ)</option>
                  <option value="Medium">Medium (ความเสี่ยงปานกลาง)</option>
                  <option value="High">High (ความเสี่ยงร้ายแรง)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest ml-1">Case Status (สถานะ)</label>
                <select 
                  value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b22026] text-[12px] font-bold cursor-pointer text-[#212c46]"
                >
                  <option value="Open">Open (เปิดเรื่องเพื่อคุ้มครอง)</option>
                  <option value="In Investigation">In Investigation (กำลังพิสูจน์ข้อเท็จจริง)</option>
                  <option value="Resolved">Resolved (เจรจาข้อยุติเสร็จสิ้น)</option>
                  <option value="Escalated">Escalated (ยกระดับพิจารณาบอร์ด)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest ml-1">Assigned Investigator (ผู้รับผิดชอบ)</label>
                <div className="relative">
                  <UserCheck size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3f809e]"/>
                  <input 
                    type="text" value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})}
                    className="w-full pl-11 pr-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b22026] text-[12px] font-bold text-[#212c46]"
                    placeholder="เช่น Safety Officer, Employee Relations..."
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest ml-1">Grievance Date (วันทีลงทะเบียน)</label>
                <input 
                  type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b22026] text-[12px] font-bold text-[#212c46]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest ml-1">Investigation Details (ข้อเท็จจริง และแนวทางการแก้ไข)</label>
              <textarea 
                value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                rows={4}
                className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-2xl outline-none focus:border-[#b22026] text-[12px] font-medium leading-relaxed resize-none custom-scrollbar text-[#212c46]"
                placeholder="ระบุข้อเท็จจริงและมาตรการป้องกันดูแลพนักงานอย่างละเอียด..."
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                 <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest flex items-center gap-2">
                   <Paperclip size={14}/> Evidence Log (ไฟล์หลักฐานสอบสวน)
                 </label>
                 <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#3f809e] hover:text-[#b22026] transition-colors cursor-pointer">
                   <FileUp size={14}/> Attach File
                 </button>
                 <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple className="hidden" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {formData.attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-xl shadow-xs">
                    <div className="flex items-center gap-2.5 truncate">
                      <File size={15} className="text-[#3f809e] shrink-0"/>
                      <div className="flex flex-col truncate">
                        <span className="text-[11px] font-bold text-[#212c46] truncate">{file.name}</span>
                        <span className="text-[9px] font-mono text-[#7a8b95]">{file.size}</span>
                      </div>
                    </div>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== idx) }))} className="p-1 text-[#b22026] hover:bg-red-50 rounded transition-colors cursor-pointer">
                      <Trash2 size={13}/>
                    </button>
                  </div>
                ))}
                {formData.attachments.length === 0 && (
                  <div className="col-span-full py-4 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-[#7a8b95] opacity-50 font-mono uppercase text-[9px] tracking-widest">
                    No files linked inside database
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-[#f8fafc] border-t border-slate-100 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-1.5 text-[9px] text-[#7a8b95] font-mono font-black uppercase tracking-widest">
              <Info size={13}/> Confidential Protected Node under PDPA standard
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
        </div>
    </DraggableModal>
  );
};

export default function UnionGrievances() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; grievance: GrievanceCase | null }>({ isOpen: false, grievance: null });
  const [grievances, setGrievances] = useState<GrievanceCase[]>(MOCK_GRIEVANCES);
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
    const counts: Record<string, number> = { All: grievances.length };
    grievances.forEach(g => counts[g.category] = (counts[g.category] || 0) + 1);
    return counts;
  }, [grievances]);

  const filteredGrievances = useMemo(() => {
    return grievances.filter(g => 
      (activeFilter === 'All' || g.category === activeFilter) &&
      (g.title.toLowerCase().includes(search.toLowerCase()) || (g.id && g.id.toLowerCase().includes(search.toLowerCase())))
    );
  }, [grievances, search, activeFilter]);

  const handleSave = (grvData: GrievanceCase) => {
    if (grvData.id) {
      setGrievances(grievances.map(g => g.id === grvData.id ? grvData : g));
      setToast('อัปเดตข้อมูลการสอบสวนข้อร้องเรียนสำเร็จเรียบร้อยค่ะ');
    } else {
      const newGrv = { 
        ...grvData, 
        id: `GRV-2024-${Math.floor(100 + Math.random() * 900)}`, 
        date: grvData.date || new Date().toISOString().split('T')[0],
        assignedTo: grvData.assignedTo || 'Employee Relations'
      };
      setGrievances([newGrv, ...grievances]);
      setToast('เปิดรับลงทะเบียนข้อร้องเรียนสหภาพ/พนักงานชิ้นใหม่สำเร็จค่ะ');
    }
    setTimeout(() => setToast(null), 3500);
  };

  const handleDelete = (id: string) => {
    if(window.confirm('ยืนยันรหัสการย้ายข้อร้องเรียนสกัดเข้าแฟ้มถาวร? ข้อมูลจะถูกเข้ารหัสสำรองแบบ Off-line ทั้งหมดค่ะ')) {
        setGrievances(grievances.filter(g => g.id !== id));
        setToast('ลบข้อหารือคัดเก็บคลังประวัติสำเร็จแล้ว');
        setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="flex flex-1 w-full flex-col animate-fadeIn bg-transparent space-y-4 pb-6 min-h-0">
      {/* USER GUIDE FLOATING TRIGGER PRECISELY POSITIONED */}
      {typeof document !== 'undefined' && createPortal(
        <button onClick={() => setIsGuideOpen(true)} className="fixed right-0 bg-[#f8fafc] border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#932c2e] hover:text-white hover:border-[#932c2e] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group cursor-pointer" style={{ top: '120px' }}>
            <HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#7a8b95] group-hover:text-white" />
            <span className="font-black tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[10px] font-mono leading-none">USER GUIDE</span>
        </button>,
        document.body
      )}
      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <GrievanceModal isOpen={modal.isOpen} onClose={() => setModal({isOpen: false, grievance: null})} grievance={modal.grievance} onSave={handleSave} />
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
                  <div className="absolute inset-0 bg-[#3f809e] blur-[15px] opacity-20 rounded-full group-hover:opacity-60 transition-all duration-700"></div>
                  <div className="relative z-10 p-1.5 border border-[#3f809e]/40 rounded-xl bg-white/50 backdrop-blur-xs shadow-xs">
                      <Scale size={28} strokeWidth={2.5} className="text-[#3f809e]" />
                  </div>
              </div>
              <div>
                  <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none" style={{ fontSize: '24px' }}>
                      UNION & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b22026] to-[#b58c4f]">GRIEVANCES</span>
                  </h3>
                  <p className="text-[11px] font-bold text-[#4d5a44] uppercase tracking-[0.2em] mt-0.5 opacity-80 leading-none">
                      INDUSTRIAL RELATIONS & EMPLOYEE COMPLAINT MANAGEMENT HUB
                  </p>
              </div>
          </div>

          <div className="flex items-center gap-4">
              <button 
                onClick={() => setModal({isOpen: true, grievance: null})}
                className="px-6 py-2.5 bg-[#212c46] text-[#f3f3f1] rounded-xl text-[11px] font-black uppercase tracking-widest shadow-md hover:bg-[#b22026] transition-all flex items-center gap-2 active:scale-95 cursor-pointer border border-[#212c46]"
              >
                <Plus size={16} /> Register Grievance
              </button>
          </div>
      </div>
      <div className="px-4 sm:px-8 w-full mt-[2px]">
        <div className="w-full">
            
            {/* KPI STATS CARDS - LEAN AND COMPACT AS REQUESTED */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3 shrink-0">
                <KpiCard label="Open Grievances" value={grievances.filter(g=>g.status!=='Resolved').length} icon={AlertTriangle} color={THEME.palette.red} description="Awaiting Action" />
                <KpiCard label="Resolved Cases" value={grievances.filter(g=>g.status==='Resolved').length} icon={ShieldCheck} color={THEME.palette.forest} description="Resolution Success" />
                <KpiCard label="Union Proposals" value={grievances.filter(g=>g.reporter==='สหภาพแรงงานฯ').length} icon={Hammer} color={THEME.palette.cerulean} description="Labor Proposals" />
                <KpiCard label="Avg. Response" value="1.2 days" icon={Users} color={THEME.palette.slate} description="Target Service Node" />
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
                                {activeFilter === 'All' ? 'Filter: Global Registry' : `Node: ${activeFilter}`}
                            </div>
                            <ChevronDown size={14} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`}/>
                          </button>

                          {isFilterOpen && (
                            <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-[#939885]/20 z-[100] overflow-hidden animate-fadeIn font-tech">
                                {['All', 'Wages & Benefits', 'Work Environment', 'Behavioral', 'Policy Interpretation'].map((cat) => (
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
                              type="text" value={search} onChange={e=>setSearch(e.target.value)} 
                              placeholder="Search ID, reporter, or cases..." 
                              className="w-full pl-12 pr-6 py-2.5 text-[12px] border border-[#eaeaec] rounded-full font-bold outline-none focus:border-[#b7a159] bg-white shadow-sm text-[#212c46]" 
                            />
                        </div>
                    </div>
                </div>

                {/* TABLE STREAM OVER MULTI-COL - MEETS CUSTOM CRITERIA EXACTLY */}
                <div className="overflow-auto custom-scrollbar  flex-1 min-h-0">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead className="bg-[#222b38] text-white">
                            <tr className="border-b-2 border-[#709654]">
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">Case ID</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap font-sans">Complaint Identity & Fact Node</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Classification</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Severity</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Status</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#eaeaec]">
                            {filteredGrievances.map(g => (
                                <tr key={g.id} className="hover:bg-[#f8f9fa] transition-colors group">
                                    <td className="py-2.5 px-4 font-mono font-black text-[#7a8b95] text-[12px]">{g.id}</td>
                                    <td className="py-2.5 px-4">
                                        <div className="flex flex-col text-[12px]">
                                            <div className="flex items-center gap-2">
                                              <span className="font-black text-[#2f2926] text-[12px] uppercase group-hover:text-[#b22026] transition-colors">{g.title}</span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 opacity-75 group-hover:opacity-100 transition-opacity">
                                              <span className="text-[10px] text-[#939885] font-medium flex items-center gap-1 font-mono"><User size={10}/> {g.reporter}</span>
                                              <span className="text-[10px] text-[#b58c4f] font-black uppercase tracking-widest font-mono"><Calendar size={10}/> {g.date}</span>
                                              <span className="text-[10px] text-[#748ea1] font-black uppercase tracking-widest font-mono"><UserCheck size={10}/> {g.assignedTo}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-4">
                                        <span className="text-[11px] font-black text-[#606a5f] uppercase tracking-wider flex items-center gap-1.5 leading-none">
                                          <Building2 size={13} className="text-[#3f809e]"/>
                                          {g.category}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-4 text-center">
                                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase border tracking-wider ${g.severity === 'High' ? 'bg-[#b22026]/10 text-[#b22026] border-[#b22026]/30' : g.severity === 'Medium' ? 'bg-[#a94228]/10 text-[#a94228] border-[#a94228]/30' : 'bg-[#7a8b95]/10 text-[#7a8b95] border-[#7a8b95]/30'}`}>
                                            {g.severity}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-4 text-center">
                                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase border tracking-wider ${g.status === 'Resolved' ? 'bg-[#508660]/10 text-[#508660] border-[#508660]/30' : g.status === 'In Investigation' ? 'bg-[#b58c4f]/10 text-[#b58c4f] border-[#b58c4f]/30' : 'bg-[#b22026]/10 text-[#b22026] border-[#b22026]/30'}`}>
                                            {g.status}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-4 text-center">
                                        <div className="flex justify-center items-center gap-[1px]">
                                            <button 
                                                onClick={() => setModal({isOpen: true, grievance: g})} 
                                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-[#b58c4f] hover:bg-[#b58c4f] hover:text-white hover:border-[#b58c4f] transition-all active:scale-90 shadow-xs cursor-pointer" 
                                                title="Investigate Details"
                                            >
                                                <Edit3 size={13}/>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(g.id || '')} 
                                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-[#b22026] hover:bg-[#b22026] hover:text-white hover:border-[#b22026] transition-all active:scale-90 shadow-xs cursor-pointer" 
                                                title="Archive Case"
                                            >
                                                <Trash2 size={13}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredGrievances.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                      <div className="flex flex-col items-center opacity-30">
                                        <Scale size={48} className="mb-2 text-[#7a8b95]"/>
                                        <p className="text-[12px] font-black uppercase tracking-[0.25em] text-[#2f2926]">ไม่พบข้อมูลข้อร้องเรียนในหมวดหมู่นี้</p>
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
                      <p className="bg-white px-3 py-1.5 rounded-lg border border-[#eaeaec] shadow-xs font-mono">Total Cases: {filteredGrievances.length}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#508660]"></span>
                        <span>Union Relations Active</span>
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
