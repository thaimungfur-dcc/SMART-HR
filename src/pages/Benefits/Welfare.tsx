import { UserGuidePanel } from '../../components/shared/UserGuidePanel';
import KpiCard from '../../components/shared/KpiCard';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  HeartHandshake, Search, Plus, Pencil, Trash2, X, Save, ChevronLeft, ChevronRight, 
  HelpCircle, CheckCircle2, AlertTriangle, Building2, Briefcase, 
  MapPin, HeartPulse, CreditCard, Calendar, UploadCloud, Receipt,
  FileText, ShieldCheck, Download, Check, XCircle, Banknote, Activity,
  Stethoscope, Eye, Glasses, PieChart, PiggyBank, History, Info, BookOpen, Key, RefreshCw,
  Users, Target, ChevronDown
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

const INITIAL_CLAIMS = [
  { 
    id: 1, claimId: 'BNF-2605-001', empId: 'EMP-24001', nameTh: 'สมชาย มุ่งมั่น', nameEn: 'Somchai Mungmun', 
    dept: 'IT', image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
    date: '2026-05-02', type: 'Medical (OPD)', amount: 1200, 
    description: 'ค่ารักษาพยาบาลคลินิก (ไข้หวัด)', 
    status: 'Pending', hasReceipt: true, rejectReason: ''
  },
  { 
    id: 2, claimId: 'BNF-2605-002', empId: 'EMP-22045', nameTh: 'วิภาดา แสงงาม', nameEn: 'Wipada Saengngam', 
    dept: 'QA', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    date: '2026-05-05', type: 'Dental Care', amount: 2500, 
    description: 'อุดฟันและขูดหินปูนประจำปี', 
    status: 'Approved', hasReceipt: true, rejectReason: ''
  },
  { 
    id: 3, claimId: 'BNF-2605-003', empId: 'EMP-24050', nameTh: 'สมหมาย ใจดี', nameEn: 'Sommai Jaidee', 
    dept: 'Production', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    date: '2026-05-06', type: 'Optical (Glasses)', amount: 4500, 
    description: 'ตัดแว่นสายตาใหม่ตามสวัสดิการ 2 ปี/ครั้ง', 
    status: 'Paid', hasReceipt: true, rejectReason: ''
  },
  { 
    id: 4, claimId: 'BNF-2605-004', empId: 'EMP-24001', nameTh: 'สมชาย มุ่งมั่น', nameEn: 'Somchai Mungmun', 
    dept: 'IT', image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
    date: '2026-05-08', type: 'Health Checkup', amount: 3500, 
    description: 'ตรวจสุขภาพประจำปี โปรแกรม Advance', 
    status: 'Rejected', hasReceipt: false, rejectReason: 'ไม่มีใบเสร็จรับเงินฉบับจริง/ใบรับรองแพทย์'
  },
  { 
    id: 5, claimId: 'BNF-2605-005', empId: 'EMP-24102', nameTh: 'นลินี วงศ์สว่าง', nameEn: 'Nalinee Wongsawang', 
    dept: 'HR', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    date: '2026-05-12', type: 'Provident Fund (Loan)', amount: 50000, 
    description: 'กู้ฉุกเฉินจากกองทุนสำรองเลี้ยงชีพ (ค่ารักษาคนในครอบครัว)', 
    status: 'Pending', hasReceipt: true, rejectReason: ''
  },
];

const BENEFIT_TYPES = [
    { name: 'Medical (OPD)', icon: Stethoscope },
    { name: 'Medical (IPD)', icon: HeartPulse },
    { name: 'Dental Care', icon: Activity },
    { name: 'Optical (Glasses)', icon: Glasses },
    { name: 'Health Checkup', icon: ShieldCheck },
    { name: 'Provident Fund (Loan)', icon: PiggyBank },
    { name: 'Other Welfare', icon: HeartHandshake },
];

interface ClaimRecord {
  id: number;
  claimId: string;
  empId: string;
  nameTh: string;
  nameEn: string;
  dept: string;
  image: string;
  date: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  hasReceipt: boolean;
  rejectReason?: string;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
};

interface EditClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: ClaimRecord | null;
  onSave: (record: ClaimRecord) => void;
}

const EditClaimModal = ({ isOpen, onClose, record: activeRecord, onSave }: EditClaimModalProps) => {
  const [modalStep, setModalStep] = useState(0);
  const [formData, setFormData] = useState<ClaimRecord>({ 
    id: 0, claimId: '', empId: 'EMP-24001', nameTh: 'สมชาย มุ่งมั่น', nameEn: 'Somchai Mungmun', 
    dept: 'IT', image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
    date: '', type: 'Medical (OPD)', amount: 0, 
    description: '', status: 'Pending', hasReceipt: true, rejectReason: ''
  });

  useEffect(() => {
    if (activeRecord) {
      setFormData({ ...activeRecord });
    } else {
      setFormData({ 
        id: 0, claimId: `BNF-2605-${Math.floor(100 + Math.random() * 900)}`, empId: 'EMP-24001', nameTh: 'สมชาย มุ่งมั่น', nameEn: 'Somchai Mungmun', 
        dept: 'IT', image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
        date: new Date().toISOString().split('T')[0], type: 'Medical (OPD)', amount: 0, 
        description: '', status: 'Pending', hasReceipt: true, rejectReason: ''
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
                  <HeartHandshake size={20} className="text-[#b58c4f]"/>
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest">
                  {activeRecord ? 'Configure Welfare Node' : 'Initialize Benefit Claim Ticket'}
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
              { id: 1, label: 'Welfare Details', icon: Target },
              { id: 2, label: 'Audit & Visibility', icon: ShieldCheck }
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
                    <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest">Personnel Name EN (ชื่อพนักงานอังกฤษ) *</label>
                    <input 
                      type="text" value={formData.nameEn} onChange={e => {
                        const val = e.target.value;
                        // Synchronize TH and ID for simplicity
                        let th = formData.nameTh;
                        let emp = formData.empId;
                        let img = formData.image;
                        if (val.includes('Somchai')) { th = 'สมชาย มุ่งมั่น'; emp='EMP-24001'; img='https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80'; }
                        else if (val.includes('Wipada')) { th = 'วิภาดา แสงงาม'; emp='EMP-22045'; img='https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'; }
                        else if (val.includes('Sommai')) { th = 'สมหมาย ใจดี'; emp='EMP-24050'; img='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'; }
                        else if (val.includes('Nalinee')) { th = 'นลินี วงศ์สว่าง'; emp='EMP-24102'; img='https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80'; }
                        setFormData({...formData, nameEn: val, nameTh: th, empId: emp, image: img});
                      }}
                      className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b22026] text-[12px] font-bold text-[#212c46]"
                      placeholder="เช่น Somchai Mungmun..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest">Personnel Name TH (ชื่อพนักงานไทย)</label>
                    <input 
                      type="text" value={formData.nameTh} onChange={e => setFormData({...formData, nameTh: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b22026] text-[12px] font-bold text-[#212c46]"
                      placeholder="เช่น สมชาย มุ่งมั่น..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest">Department (แผนก)</label>
                    <select 
                      value={formData.dept} onChange={e => setFormData({...formData, dept: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b22026] text-[12px] font-bold text-[#212c46] cursor-pointer"
                    >
                      <option value="IT">IT</option>
                      <option value="QA">QA</option>
                      <option value="Production">Production</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest">Employee ID (รหัสพนักงาน)</label>
                    <input 
                      type="text" value={formData.empId} onChange={e => setFormData({...formData, empId: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b22026] text-[12px] font-bold text-[#212c46]"
                      placeholder="เช่น EMP-24001..."
                    />
                  </div>
                </div>
              </div>
            )}

            {modalStep === 1 && (
              <div className="space-y-4 animate-fadeIn pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest">Primary Welfare Type (ประเภทสวัสดิการ)</label>
                    <select 
                      value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b22026] text-[12px] font-bold text-[#212c46] cursor-pointer"
                    >
                      {BENEFIT_TYPES.map(t => (
                        <option key={t.name} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest">Welfare Claim Date (วันที่เบิก)</label>
                    <input 
                      type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b22026] text-[12px] font-bold text-[#212c46]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest">Claim Amount Value (จำนวนเงินเบิก) *</label>
                    <input 
                      type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                      className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b22026] text-[12px] font-bold text-[#212c46]"
                      placeholder="ระบุจำนวนเงินเป็นบาท..."
                    />
                  </div>
                  <div className="space-y-1.5 flex flex-col justify-end pb-1">
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-[10px] font-black uppercase text-[#606a5f]">Attach Original Receipt</span>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, hasReceipt: !formData.hasReceipt})} 
                        className={`w-10 h-5 rounded-full relative transition-all duration-300 ${formData.hasReceipt ? 'bg-[#508660]' : 'bg-slate-200'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${formData.hasReceipt ? 'left-[22px]' : 'left-0.5'}`}/>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest">Welfare Description Notes (รายละเอียดการรักษาพยาบาล/การซื้อพัสดุ) *</label>
                  <textarea 
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-2xl outline-none focus:border-[#b22026] text-[12px] font-medium leading-relaxed resize-none custom-scrollbar text-[#212c46]"
                    placeholder="ป้อนข้อมูลสถานที่รับบริการการตรวจวินิจฉัยเพื่อบันทึกประวัติการเบิกและอำนวยความสะดวกในการตรวจสอบสิทธิ์..."
                  />
                </div>
              </div>
            )}

            {modalStep === 2 && (
              <div className="space-y-4 animate-fadeIn pb-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest">Status Protocol (ระดับและสถานะรายการ)</label>
                  <select 
                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b22026] text-[12px] font-bold text-[#212c46] cursor-pointer"
                  >
                    <option value="Pending">Pending (รอตรวจสอบเอกสารแวดล้อม)</option>
                    <option value="Approved">Approved (ผ่านการพิจารณาตรวจสอบสิทธิ์สำเร็จ)</option>
                    <option value="Paid">Paid (ดำเนินการโอนจ่ายเงินสำเร็จ)</option>
                    <option value="Rejected">Rejected (ปฏิเสธคำเบิกจ่ายเนื่องจากคุณสมบัติขาด)</option>
                  </select>
                </div>
                
                {formData.status === 'Rejected' && (
                  <div className="space-y-1.5 animate-fadeIn pb-6">
                    <label className="text-[10px] font-black text-[#b22026] uppercase tracking-widest">Rejection Reason Note (เหตุผลในการปฏิเสธการเบิก) *</label>
                    <textarea 
                      value={formData.rejectReason || ''} onChange={e => setFormData({...formData, rejectReason: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-[#fff5f5] border border-red-200 rounded-xl outline-none focus:border-[#b22026] text-[12px] font-medium leading-relaxed resize-none text-[#932c2e]"
                      placeholder="ระบุเหตุผลเพื่อแจ้งเตือนพนักงานให้แก้ไขจัดส่งเอกสารใบเสร็จเข้ามาใหม่..."
                    />
                  </div>
                )}

                <div className="p-4 bg-[#3f809e]/5 border border-[#3f809e]/20 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-[#3f809e]/30 shadow-xs">
                      <ShieldCheck size={18} className="text-[#3f809e]" />
                    </div>
                    <div>
                      <span className="text-[11px] font-black uppercase text-[#212c46] tracking-wider block">PDPA Compliance Shield</span>
                      <p className="text-[9px] font-medium text-[#7a8b95]">รักษาความลับระดับสูงตามมาตรฐานจัดเก็บข้อมูลประสุขภาพอ่อนไหว</p>
                    </div>
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

export default function BenefitsWelfare() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; record: ClaimRecord | null }>({ isOpen: false, record: null });
  const [records, setRecords] = useState<ClaimRecord[]>(INITIAL_CLAIMS);
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
    records.forEach(r => counts[r.status] = (counts[r.status] || 0) + 1);
    return counts;
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => 
      (activeFilter === 'All' || r.status === activeFilter) &&
      (r.nameEn.toLowerCase().includes(search.toLowerCase()) || r.claimId.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase()) || r.dept.toLowerCase().includes(search.toLowerCase()))
    );
  }, [records, search, activeFilter]);

  const handleSave = (data: ClaimRecord) => {
    if (data.id) {
      setRecords(records.map(r => r.id === data.id ? data : r));
      setToast('อัปเดตข้อมูลสลักคำเบิกจ่ายสวัสดิการพนักงานสำเร็จค่ะ');
    } else {
      const newEntry = { 
        ...data, 
        id: Math.floor(100 + Math.random() * 900), 
        claimId: `BNF-2605-${Math.floor(100 + Math.random() * 900)}`, 
        date: data.date || new Date().toISOString().split('T')[0]
      };
      setRecords([newEntry, ...records]);
      setToast('ลงทะเบียนชุดพยานเบิกจ่ายสวัสดิการสำเร็จเรียบร้อยค่ะ');
    }
    setTimeout(() => setToast(null), 3500);
  };

  const handleApproveDirect = (id: number) => {
    setRecords(records.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
    setToast('อนุมัติบันทึกเบิกจ่ายวงเงินสำเร็จเรียบร้อย');
    setTimeout(() => setToast(null), 3000);
  };

  const handleRejectDirect = (id: number) => {
    const reason = window.prompt("ระบุเหตุผลในการปฏิเสธการเบิก (Reason for rejection):", "เอกสารหลักฐานไม่ชัดเจน / ขาดสำเนาใบเสร็จรับเงิน");
    if (reason !== null) {
      setRecords(records.map(r => r.id === id ? { ...r, status: 'Rejected', rejectReason: reason } : r));
      setToast('บันทึกการเปิดประเด็นขัดแย้งปฏิเสธเบิกจ่ายสำเร็จ');
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('ยืนยันประสงค์ทำลายรายการเบิกสวัสดิการข้อนี้? ข้อมูลจะไม่ปรากฏในการประเมินสิทธิพนักงานประจำปี')) {
      setRecords(records.filter(r => r.id !== id));
      setToast('ลบชุดพยานเบิกสวัสดิการออกจากเครื่องมือวิเคราะห์สำเร็จ');
      setTimeout(() => setToast(null), 3000);
    }
  };

  // KPI Calculations
  const pendingCount = records.filter(r => r.status === 'Pending').length;
  const approvedTotal = records.filter(r => r.status === 'Approved').reduce((acc, r) => acc + r.amount, 0);
  const paidTotal = records.filter(r => r.status === 'Paid').reduce((acc, r) => acc + r.amount, 0);

  return (
    <div className="flex flex-1 w-full flex-col animate-fadeIn bg-transparent space-y-4 pb-6">
      {/* Floating User Guide Button (Matching UserPermissions style) */}
      {typeof document !== 'undefined' && createPortal(
        <button onClick={() => setIsGuideOpen(true)} className="fixed right-0 bg-[#f8fafc] border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#932c2e] hover:text-white hover:border-[#932c2e] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group cursor-pointer" style={{ top: '120px' }}>
            <HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#7a8b95] group-hover:text-white" />
            <span className="font-black tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[10px] font-mono leading-none">USER GUIDE</span>
        </button>,
        document.body
      )}
      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <EditClaimModal isOpen={modal.isOpen} onClose={() => setModal({isOpen: false, record: null})} record={modal.record} onSave={handleSave} />
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
                      <HeartHandshake size={28} strokeWidth={2.5} className="text-[#b22026]" />
                  </div>
              </div>
              <div>
                  <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none" style={{ fontSize: '24px' }}>
                      BENEFITS <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b22026] to-[#b58c4f]">& WELFARE</span>
                  </h3>
                  <p className="text-[11px] font-bold text-[#4d5a44] uppercase tracking-[0.2em] mt-0.5 opacity-80 leading-none">
                      MEDICAL, FUNDS & EMPLOYEE WELFARE CLAIMS HUB
                  </p>
              </div>
          </div>

          <div className="flex items-center gap-4">
              <button 
                onClick={() => setModal({isOpen: true, record: null})}
                className="px-6 py-2.5 bg-[#212c46] text-[#f3f3f1] rounded-xl text-[11px] font-black uppercase tracking-widest shadow-md hover:bg-[#b22026] transition-all flex items-center gap-2 active:scale-95 cursor-pointer border border-[#212c46]"
              >
                <Plus size={16} /> Register Claim Case
              </button>
          </div>
      </div>
      <div className="px-4 sm:px-8 w-full mt-[2px]">
        <div className="w-full">
            
            {/* KPI STATS CARDS - LEAN AND COMPACT AS REQUESTED */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3 shrink-0">
                <KpiCard label="Total Claims" value={records.length} icon={Receipt} color={THEME.palette.brick} description="Welfare Records" />
                <KpiCard label="Pending Approval" value={pendingCount} icon={Activity} color={THEME.palette.red} description="Action Required" />
                <KpiCard label="Approved Amount" value={`฿${formatCurrency(approvedTotal)}`} icon={CheckCircle2} color={THEME.palette.slate} description="Awaiting Payment" />
                <KpiCard label="Paid Settlement" value={`฿${formatCurrency(paidTotal)}`} icon={Banknote} color={THEME.palette.forest} description="Healthy Settlement" />
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
                                <HelpCircle size={14} className="text-[#b58c4f]"/>
                                {activeFilter === 'All' ? 'Filter: Global Registry' : `Status: ${activeFilter}`}
                            </div>
                            <ChevronDown size={14} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`}/>
                          </button>

                          {isFilterOpen && (
                            <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-[#939885]/20 z-[100] overflow-hidden animate-fadeIn font-tech">
                                {['All', 'Pending', 'Approved', 'Paid', 'Rejected'].map((cat) => (
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
                              placeholder="Search employee, Ticket ID, benefit..." 
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
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">Ticket ID</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap font-sans">Personnel Node</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center w-1/3">Benefit Details & Descriptions</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-right">Amount (THB)</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Status</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#eaeaec]">
                            {filteredRecords.map(r => {
                                const typeInfo = BENEFIT_TYPES.find(t => t.name === r.type) || { icon: Receipt };
                                const TypeIcon = typeInfo.icon;
                                
                                return (
                                <tr key={r.id} className="hover:bg-[#f8f9fa] transition-colors group">
                                    <td className="py-2.5 px-4">
                                        <p className="font-mono font-black text-[#7a8b95] text-[12px]">{r.claimId}</p>
                                        <p className="text-[10px] text-[#b58c4f] font-bold font-mono mt-0.5">{r.date}</p>
                                    </td>
                                    <td className="py-2.5 px-4 text-[12px]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl overflow-hidden border border-[#939885]/30 shadow-sm shrink-0 bg-[#f3f3f1]">
                                                {r.image ? <img src={r.image} alt={r.nameEn} className="w-full h-full object-cover" /> : <Users size={18}/>}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-[#2f2926] text-[12px] tracking-tight truncate group-hover:text-[#b22026] transition-colors">{r.nameEn}</span>
                                                <span className="font-bold text-[#606a5f] text-[10px] font-mono">{r.dept}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-4">
                                        <div className="flex items-start gap-2">
                                            <TypeIcon size={14} className="text-[#606a5f] mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-[12px] font-black text-[#2f2926] font-mono">{r.type}</p>
                                                <p className="text-[11px] font-medium text-[#7a8b95] mt-0.5 line-clamp-1">{r.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-4 text-right">
                                        <p className="text-[14px] font-black font-mono text-[#212c46]">{formatCurrency(r.amount)}</p>
                                        <div className="mt-0.5 flex justify-end">
                                            {r.hasReceipt ? 
                                                <span className="flex items-center gap-1 text-[9px] font-black text-[#508660] uppercase font-mono"><Receipt size={10}/> Receipt Attached</span> : 
                                                <span className="flex items-center gap-1 text-[9px] font-black text-[#b22026] uppercase font-mono"><AlertTriangle size={10}/> Missing Receipt</span>
                                            }
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-4 text-center">
                                       <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase border tracking-wider flex items-center justify-center gap-1 max-w-[110px] mx-auto
                                            ${r.status === 'Approved' ? 'bg-[#3f809e]/10 text-[#3f809e] border-[#3f809e]/30' : 
                                              r.status === 'Paid' ? 'bg-[#508660]/10 text-[#508660] border-[#508660]/30' : 
                                              r.status === 'Rejected' ? 'bg-[#b22026]/10 text-[#b22026] border-[#b22026]/30' : 
                                              'bg-[#b58c4f]/10 text-[#b58c4f] border-[#b58c4f]/30'}`}>
                                           {r.status}
                                       </span>
                                    </td>
                                    <td className="py-2.5 px-4 text-center">
                                        <div className="flex justify-center items-center gap-[1px]">
                                            {r.status === 'Pending' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleApproveDirect(r.id)} 
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-[#508660] hover:bg-[#508660] hover:text-white hover:border-[#508660] transition-all active:scale-90 shadow-xs cursor-pointer" 
                                                        title="Approve Ticket"
                                                    >
                                                        <Check size={14} strokeWidth={3}/>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRejectDirect(r.id)} 
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-[#b22026] hover:bg-[#b22026] hover:text-white hover:border-[#b22026] transition-all active:scale-90 shadow-xs cursor-pointer" 
                                                        title="Reject Ticket"
                                                    >
                                                        <XCircle size={14}/>
                                                    </button>
                                                </>
                                            )}
                                            <button 
                                                onClick={() => setModal({isOpen: true, record: r})} 
                                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-[#b58c4f] hover:bg-[#b58c4f] hover:text-white hover:border-[#b58c4f] transition-all active:scale-90 shadow-xs cursor-pointer" 
                                                title="Edit Node Details"
                                            >
                                                <Pencil size={13}/>
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
                            )})}
                            {filteredRecords.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                      <div className="flex flex-col items-center opacity-30">
                                        <HeartHandshake size={48} className="mb-2 text-[#7a8b95]"/>
                                        <p className="text-[12px] font-black uppercase tracking-[0.25em] text-[#2f2926]">ไม่พบข้อมูลคำร้องขอเบิกจ่ายสวัสดิการในระบบ</p>
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
                      <p className="bg-white px-3 py-1.5 rounded-lg border border-[#eaeaec] shadow-xs font-mono font-black">Total Records: {filteredRecords.length}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#508660]"></span>
                        <span>PDPA Compliant Shield Active</span>
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
