import { UserGuidePanel } from '../../components/shared/UserGuidePanel';
import KpiCard from '../../components/shared/KpiCard';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';
import { 
  ShieldAlert, Gavel, Scale, FileText, UserX, AlertTriangle, 
  Search, Filter, Plus, ChevronLeft, ChevronRight, Download, 
  Edit3, Trash2, HelpCircle, X, CheckCircle2, Clock, Calendar, 
  Save, FileCheck, Landmark, ChevronDown, AlignLeft, Paperclip, 
  FileUp, File, FileImage, User, Banknote, Target, History, Info,
  FileSearch
} from 'lucide-react';
import { DraggableModal } from '../../components/shared/DraggableModal';

const THEME = {
  bgMain: '#f3f3f1',
  bgGradient: 'transparent',
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

const MOCK_RECORDS = [
  { 
    id: 'DIS-2024-001', 
    employee: 'สมชาย รักดี', 
    position: 'Senior Developer',
    category: 'Attendance', 
    warningLevel: 'Written Warning', 
    punishment: 'Point Deduction',
    impact: '-5 Points',
    status: 'Enforced', 
    date: '2024-03-10', 
    recordedBy: 'HR Admin',
    content: 'มาสายเกิน 5 ครั้งภายในเดือนเดียว (ครั้งที่ 2 ของปี) ได้รับการตักเตือนด้วยวาจาไปแล้วเมื่อเดือนก่อน',
    attachments: [{ name: 'attendance_report_mar.pdf', size: '1.2 MB', type: 'application/pdf' }]
  },
  { 
    id: 'DIS-2024-002', 
    employee: 'วิภาดา แสงดาว', 
    position: 'Marketing Lead',
    category: 'Integrity', 
    warningLevel: 'Suspension', 
    punishment: 'Salary Deduction',
    impact: '-10% (3 Months)',
    status: 'In Investigation', 
    date: '2024-04-02', 
    recordedBy: 'Compliance Manager',
    content: 'ตรวจพบการเบิกจ่ายค่าใช้จ่ายไม่ตรงตามจริงในโครงการส่งเสริมการขายพื้นที่ภาคเหนือ',
    attachments: [{ name: 'expense_audit_v1.docx', size: '2.5 MB', type: 'application/msword' }]
  },
  { 
    id: 'DIS-2024-003', 
    employee: 'ก้องภพ ขยันงาน', 
    position: 'Junior QA',
    category: 'Safety', 
    warningLevel: 'Verbal Warning', 
    punishment: 'Point Deduction',
    impact: '-2 Points',
    status: 'Enforced', 
    date: '2024-04-15', 
    recordedBy: 'Team Lead',
    content: 'ไม่สวมชุดอุปกรณ์ป้องกันความปลอดภัยขณะเข้าพื้นที่โซนทดสอบระบบเซิร์ฟเวอร์',
    attachments: []
  }
];

interface Attachment {
  name: string;
  size: string;
  type: string;
}

interface DisciplinaryRecord {
  id?: string;
  employee: string;
  position: string;
  category: string;
  warningLevel: string;
  punishment: string;
  impact: string;
  status: string;
  date?: string;
  recordedBy?: string;
  content: string;
  attachments: Attachment[];
}

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: DisciplinaryRecord | null;
  onSave: (record: DisciplinaryRecord) => void;
}

const RecordModal = ({ isOpen, onClose, record: activeRecord, onSave }: RecordModalProps) => {
  const [formData, setFormData] = useState<DisciplinaryRecord>({ 
    employee: '', position: '', category: 'Attendance', warningLevel: 'Verbal Warning', 
    punishment: 'Point Deduction', impact: '', status: 'In Investigation', content: '', attachments: [] 
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeRecord) {
      setFormData({ ...activeRecord });
    } else {
      setFormData({ 
        employee: '', position: '', category: 'Attendance', warningLevel: 'Verbal Warning', 
        punishment: 'Point Deduction', impact: '', status: 'In Investigation', content: '', attachments: [] 
      });
    }
  }, [activeRecord, isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files: File[] = Array.from(e.target.files) as File[];
      const newAttachments = files.map(f => ({
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(2) + ' MB',
        type: f.type
      }));
      setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...newAttachments] }));
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== index) }));
  };

  if (!isOpen) return null;
  return (
    <DraggableModal
        isOpen={isOpen}
        onClose={onClose}
        width="max-w-[850px]"
        customHeader={
            <div className="bg-[#212c46] px-5 py-4 flex justify-between items-center text-[#f3f3f1] shrink-0 border-b-2 border-[#b58c4f]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Gavel size={20} className="text-[#b58c4f]"/>
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest">
                  {activeRecord ? 'Investigation Node' : 'Record New Misconduct'}
                </h3>
              </div>
              <button onClick={onClose} className="hover:text-[#b22026] text-white/70 transition-colors p-1.5 bg-white/10 hover:bg-white/20 rounded-full"><X size={16}/></button>
            </div>
        }
    >
        <div className="flex-1 flex flex-col overflow-hidden bg-white max-h-[75vh]">
          <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest ml-1">Employee Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b58c4f]"/>
                  <input 
                    type="text" value={formData.employee} onChange={e => setFormData({...formData, employee: e.target.value})}
                    className="w-full pl-11 pr-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b58c4f] text-[12px] font-bold"
                    placeholder="ระบุชื่อพนักงาน..."
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest ml-1">Offense Category</label>
                <select 
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b58c4f] text-[12px] font-bold cursor-pointer"
                >
                  <option value="Attendance">Attendance (การขาด/ลา/มาสาย)</option>
                  <option value="Integrity">Integrity (ความซื่อสัตย์/ทุจริต)</option>
                  <option value="Safety">Safety & Compliance (ความปลอดภัย)</option>
                  <option value="Behavioral">Behavioral (พฤติกรรมไม่เหมาะสม)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest ml-1">Warning Level</label>
                <select 
                  value={formData.warningLevel} onChange={e => setFormData({...formData, warningLevel: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b58c4f] text-[12px] font-bold cursor-pointer"
                >
                  <option value="Verbal Warning">Verbal Warning</option>
                  <option value="Written Warning">Written Warning</option>
                  <option value="Suspension">Suspension</option>
                  <option value="Termination">Termination</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest ml-1">Punishment Type</label>
                <select 
                  value={formData.punishment} onChange={e => setFormData({...formData, punishment: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b58c4f] text-[12px] font-bold cursor-pointer"
                >
                  <option value="Point Deduction">Point Deduction (Evaluation)</option>
                  <option value="Salary Deduction">Salary Deduction (Payroll)</option>
                  <option value="No Pay Suspension">Suspension w/o Pay (Payroll)</option>
                  <option value="None">Non-Financial Warning</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#b22026] uppercase tracking-widest ml-1">Impact Value</label>
                <input 
                  type="text" value={formData.impact} onChange={e => setFormData({...formData, impact: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#b22026]/5 border border-[#b22026]/20 rounded-xl outline-none focus:border-[#b22026] text-[12px] font-black text-[#b22026]"
                  placeholder="e.g. -5 Points / -10%"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#508660] uppercase tracking-widest ml-1">Identity Position</label>
                <input 
                  type="text" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b58c4f] text-[12px] font-bold"
                  placeholder="Senior Developer, Marketing Lead, QA..."
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest">Investigation Details</label>
                <span className="text-[9px] font-mono text-[#b58c4f] uppercase tracking-widest bg-[#b58c4f]/10 px-2 py-0.5 rounded font-black">Misconduct Incident Log</span>
              </div>
              <textarea 
                value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                rows={5}
                className="w-full px-4 py-3 bg-[#f8fafc] border border-slate-200 rounded-2xl outline-none focus:border-[#b58c4f] text-[12px] font-medium leading-relaxed resize-none custom-scrollbar"
                placeholder="บันทึกรายละเอียดเหตุการณ์และผลการสอบสวนอย่างละเอียด..."
              />
            </div>

            {/* ATTACHMENT SECTION */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                 <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest flex items-center gap-2">
                   <Paperclip size={13}/> Attach Proof Evidence
                 </label>
                 <button 
                   type="button"
                   onClick={() => fileInputRef.current?.click()}
                   className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#3f809e] hover:text-[#212c46] cursor-pointer"
                 >
                   <FileUp size={13}/> Upload Files
                 </button>
                 <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple className="hidden" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {formData.attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-white border border-[#939885]/20 rounded-xl hover:border-[#3f809e]/40 transition-all shadow-xs">
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-7 h-7 rounded-lg bg-[#3f809e]/10 text-[#3f809e] flex items-center justify-center shrink-0">
                        {file.type && file.type.includes('image') ? <FileImage size={14}/> : <File size={14}/>}
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="text-[11px] font-bold text-[#2f2926] truncate">{file.name}</span>
                        <span className="text-[9px] font-mono text-[#748b9e]">{file.size}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button type="button" className="p-1 text-[#b58c4f] hover:bg-[#b58c4f]/10 rounded-lg" title="Download"><Download size={13}/></button>
                      <button type="button" onClick={() => removeAttachment(idx)} className="p-1 text-[#b22026] hover:bg-[#b22026]/10 rounded-lg" title="Remove"><Trash2 size={13}/></button>
                    </div>
                  </div>
                ))}
                {formData.attachments.length === 0 && (
                  <div className="col-span-full py-4 border-2 border-dashed border-[#939885]/20 rounded-xl flex flex-col items-center justify-center text-[#748b9e] opacity-60">
                     <FileSearch size={20} className="mb-1"/>
                     <span className="text-[9px] font-black uppercase tracking-widest">No attachments linked</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-[#f8fafc] border-t border-slate-100 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-1.5 text-[9px] text-[#7a8b95] font-mono font-black uppercase tracking-widest">
              <Info size={13}/> Sync with Payroll & Evaluation on safe action
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest text-[#606a5f] hover:bg-[#f3f3f1] border border-[#eaeaec] bg-white cursor-pointer hover:text-[#2f2926]">
                Cancel
              </button>
              <button type="button" onClick={() => { onSave(formData); onClose(); }} className="px-5 py-2 bg-[#b22026] text-white rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-[#932c2e] shadow-xs active:scale-95 border border-[#851c24] cursor-pointer">
                <Save size={14}/> Save Database
              </button>
            </div>
          </div>
        </div>
    </DraggableModal>
  );
};

export default function DisciplinaryActions() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; record: DisciplinaryRecord | null }>({ isOpen: false, record: null });
  const [records, setRecords] = useState<DisciplinaryRecord[]>(MOCK_RECORDS);
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
    records.forEach(r => counts[r.category] = (counts[r.category] || 0) + 1);
    return counts;
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => 
      (activeFilter === 'All' || r.category === activeFilter) &&
      (r.employee.toLowerCase().includes(search.toLowerCase()) || (r.id && r.id.toLowerCase().includes(search.toLowerCase())))
    );
  }, [records, search, activeFilter]);

  const handleSave = (recordData: DisciplinaryRecord) => {
    if (recordData.id) {
      setRecords(records.map(r => r.id === recordData.id ? recordData : r));
      setToast('อัปเดตบันทึกการทำผิดวินัยเรียบร้อยแล้วค่ะ');
    } else {
      const newRecord = { 
        ...recordData, 
        id: `DIS-2024-${Math.floor(100 + Math.random() * 900)}`, 
        date: new Date().toISOString().split('T')[0], 
        recordedBy: 'HR Admin'
      };
      setRecords([newRecord, ...records]);
      setToast('เพิ่มกรณีบันทึกความผิดทางวินัยอันใหม่เข้าฐานระบบเรียบร้อย');
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = (id: string) => {
    if(window.confirm('ยืนยันการลบข้อมูลนี้ออกจากระบบ? (ข้อมูลที่เชื่อมโยงกับ Payroll/Evaluation จะถูกยกเลิกด้วย)')) {
        setRecords(records.filter(r => r.id !== id));
        setToast('ลบรายการประวัติความผิดวินัยถาวรเรียบร้อยค่ะ');
        setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="flex flex-1 w-full flex-col animate-fadeIn bg-transparent space-y-4 pb-6 min-h-0">
      {/* USER GUIDE FLOATING TRIGGER TRIGGERED IN CONTAINER */}
      {typeof document !== 'undefined' && createPortal(
        <button onClick={() => setIsGuideOpen(true)} className="fixed right-0 bg-[#f8fafc] border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#851c24] hover:text-white hover:border-[#851c24] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group cursor-pointer" style={{ top: '120px' }}>
            <HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#64748b] group-hover:text-white" />
            <span className="font-black tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[10px] font-mono leading-none">USER GUIDE</span>
        </button>,
        document.body
      )}
      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <RecordModal isOpen={modal.isOpen} onClose={() => setModal({isOpen: false, record: null})} record={modal.record} onSave={handleSave} />
      {/* TOAST NOTIFICATION */}
      {toast && createPortal(
        <div className="fixed bottom-6 right-6 z-[1000] animate-fadeIn bg-white border-l-4 border-[#b22026] shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-5 py-4 rounded-xl flex items-center gap-3">
            <CheckCircle2 size={18} className="text-[#b22026]" />
            <span className="text-[11px] font-black text-[#212c46] uppercase tracking-widest font-mono">{toast}</span>
            <button onClick={() => setToast(null)} className="ml-4 text-[#64748b] hover:text-[#b22026] cursor-pointer"><X size={14}/></button>
        </div>,
        document.body
      )}
      {/* PAGE HEADER SECTION: TRANSPARENT BACKGROUND & EMBEDDED DIRECTLY IN PAGE */}
      <div className="h-14 px-8 flex flex-row items-center justify-between gap-4 z-20 shrink-0 bg-transparent">
          <div className="flex items-center gap-5">
              <div className="relative flex items-center justify-center group cursor-default shrink-0">
                  <div className="absolute inset-0 bg-[#b22026] blur-[15px] opacity-20 rounded-full group-hover:opacity-60 transition-all duration-700"></div>
                  <div className="relative z-10 p-1.5 border border-[#b22026]/40 rounded-xl bg-white/50 backdrop-blur-xs shadow-xs">
                      <ShieldAlert size={28} strokeWidth={2.5} className="text-[#b22026]" />
                  </div>
              </div>
              <div>
                  <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none" style={{ fontSize: '24px' }}>
                      DISCIPLINARY <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b22026] to-[#b58c4f]">ACTIONS</span>
                  </h3>
                  <p className="text-[11px] font-bold text-[#4d5a44] uppercase tracking-[0.2em] mt-0.5 opacity-80 leading-none">
                      INVESTIGATION & PUNISHMENT REGISTER
                  </p>
              </div>
          </div>

          <div className="flex items-center gap-4">
              <button 
                onClick={() => setModal({isOpen: true, record: null})}
                className="px-6 py-2.5 bg-[#212c46] text-[#f3f3f1] rounded-xl text-[11px] font-black uppercase tracking-widest shadow-md hover:bg-[#b22026] transition-all flex items-center gap-2 active:scale-95 cursor-pointer border border-[#212c46]"
              >
                <Plus size={16} /> Record Misconduct
              </button>
          </div>
      </div>
      <div className="px-4 sm:px-8 w-full mt-[2px]">
        <div className="w-full">
            
            {/* KPI STATS CARDS - LEAN AND COMPACT AS REQUESTED */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3 shrink-0">
                <KpiCard label="Active Records" value={records.length} icon={Gavel} color={THEME.palette.charcoal} description="Managed Cases" />
                <KpiCard label="Investigation" value={records.filter(r => r.status === 'In Investigation').length} icon={Scale} color={THEME.palette.burntOrange} description="Pending Node" />
                <KpiCard label="Payroll Impact" value={records.filter(r => r.punishment.includes('Salary')).length} icon={Banknote} color={THEME.palette.maroon} description="Financial Node" />
                <KpiCard label="Points Deducted" value="17" icon={Target} color={THEME.palette.plum} description="Evaluation Loss" />
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="bg-white/90 rounded-3xl shadow-lg border border-[#eaeaec] overflow-hidden flex flex-col animate-fadeIn  flex-1 min-h-0">
                
                {/* FILTER & SEARCH CONTROLS */}
                <div className="px-8 py-4 border-b border-[#eaeaec] bg-[#f8f9fa] flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative" ref={dropdownRef}>
                          <button 
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center justify-between gap-3 px-4 py-2 bg-[#f3f3f1] border border-slate-200 rounded-xl min-w-[200px] text-[11px] font-black uppercase tracking-widest text-[#414757] hover:bg-white transition-all shadow-xs active:scale-95 cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                                <Filter size={14} className="text-[#b58c4f]"/>
                                {activeFilter === 'All' ? 'Filter: Global Node' : `Category: ${activeFilter}`}
                            </div>
                            <ChevronDown size={14} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`}/>
                          </button>

                          {isFilterOpen && (
                            <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-[#939885]/20 z-[100] overflow-hidden animate-fadeIn">
                                {['All', 'Attendance', 'Integrity', 'Safety', 'Behavioral'].map((cat) => (
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
                              placeholder="Search employee or record..." 
                              className="w-full pl-12 pr-6 py-2.5 text-[12px] border border-[#eaeaec] rounded-full font-bold outline-none focus:border-[#b7a159] bg-white shadow-sm text-[#212c46]" 
                            />
                        </div>
                    </div>
                </div>

                {/* TABLE STREAM - CUSTOM STYLES ACCORDING TO SPEC */}
                <div className="overflow-auto custom-scrollbar  flex-1 min-h-0">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead className="bg-[#222b38] text-white">
                            <tr className="border-b-2 border-[#709654]">
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">Offense ID</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">Personnel Info</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">Warning Level</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">Punishment Node</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Impact</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Security Status</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center font-sans">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#eaeaec]">
                            {filteredRecords.map(r => (
                                <tr key={r.id} className="hover:bg-[#f8f9fa] transition-colors group">
                                    <td className="py-2.5 px-4 font-mono font-black text-[#7a8b95] text-[12px]">{r.id}</td>
                                    <td className="py-2.5 px-4">
                                        <div className="flex flex-col text-[12px]">
                                            <span className="font-black text-[#2f2926] text-[12px] uppercase group-hover:text-[#b22026] transition-colors">{r.employee}</span>
                                            <span className="text-[10px] text-[#748b9e] font-black uppercase tracking-wider">{r.position}</span>
                                            <div className="flex items-center gap-3 mt-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                              <span className="text-[10px] text-[#939885] font-black flex items-center gap-1 font-mono uppercase"><Clock size={10}/> {r.date}</span>
                                              <span className="text-[10px] text-[#b58c4f] font-black uppercase tracking-widest font-mono"><Landmark size={10}/> {r.category}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-4">
                                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase border tracking-wider ${r.warningLevel.includes('Verbal') ? 'bg-[#bab98b]/10 text-[#8e9141] border-[#bab98b]/30' : 'bg-[#b22026]/10 text-[#b22026] border-[#b22026]/30'}`}>
                                            {r.warningLevel}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-4">
                                        <span className="text-[11px] font-black text-[#606a5f] uppercase tracking-wider flex items-center gap-2">
                                          {r.punishment.includes('Salary') ? <Banknote size={14} className="text-[#b22026]"/> : <Target size={14} className="text-[#3f809e]"/>} {r.punishment}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-4 text-center font-mono text-[#b22026] text-[12px] font-black">{r.impact}</td>
                                    <td className="py-2.5 px-4 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                           <div className={`w-1.5 h-1.5 rounded-full ${r.status === 'Enforced' ? 'bg-[#508660]' : 'bg-[#a94228] animate-pulse'}`}/>
                                           <span className={`text-[11px] font-black uppercase tracking-wider ${r.status === 'Enforced' ? 'text-[#508660]' : 'text-[#a94228]'}`}>{r.status}</span>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-4 text-center">
                                        <div className="flex justify-center items-center gap-[1px]">
                                            <button 
                                                onClick={() => setModal({isOpen: true, record: r})} 
                                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-[#b58c4f] hover:bg-[#b58c4f] hover:text-white hover:border-[#b58c4f] transition-all active:scale-90 shadow-xs cursor-pointer" 
                                                title="Edit Node"
                                            >
                                                <Edit3 size={13}/>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(r.id || '')} 
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
                                        <Scale size={48} className="mb-2 text-[#7a8b95]"/>
                                        <p className="text-[12px] font-black uppercase tracking-[0.25em] text-[#2f2926]">ไม่พบประวัติความผิดวินัย</p>
                                      </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* TABLE FOOTER */}
                <div className="px-6 py-3 bg-[#F0EAE1]/80 backdrop-blur-md border-t-[1.5px] border-[#adb2b0]/50 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                    <div className="flex items-center gap-5 text-[11px] font-black text-[#606a5f] uppercase tracking-widest">
                      <p className="bg-white px-3 py-1.5 rounded-lg border border-[#eaeaec] shadow-xs font-mono">Total Elements: {filteredRecords.length}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#508660]"></span>
                        <span>Node Integrity SECURE</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" className="w-8 h-8 border border-slate-200 bg-white rounded-lg flex items-center justify-center opacity-40 cursor-not-allowed shadow-xs hover:bg-[#212c46] hover:text-white"><ChevronLeft size={14}/></button>
                      <div className="bg-white text-[#414757] px-4 py-1.5 rounded-lg font-black text-[11px] min-w-[100px] text-center uppercase tracking-widest border border-slate-200 shadow-xs font-mono">Page 1 / 1</div>
                      <button type="button" className="w-8 h-8 border border-slate-200 bg-white rounded-lg flex items-center justify-center opacity-40 cursor-not-allowed shadow-xs hover:bg-[#212c46] hover:text-white"><ChevronRight size={14}/></button>
                    </div>
                </div>

            </div>

            {/* SPACER MARGIN BOTTOM HELPS ADD GAP TO FOOTER FOR 32px (mt-8) */}
            <div className="mt-8 shrink-0"></div>

        </div>
      </div>
    </div>
  );
}
