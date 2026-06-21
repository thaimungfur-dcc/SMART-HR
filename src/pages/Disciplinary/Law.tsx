import { UserGuidePanel } from '../../components/shared/UserGuidePanel';
import KpiCard from '../../components/shared/KpiCard';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';
import { 
  Gavel, Scale, FileText, ShieldAlert, BookOpen, Search, Filter, 
  Plus, ChevronLeft, ChevronRight, Download, Eye, Edit3, Trash2, 
  HelpCircle, X, CheckCircle2, AlertTriangle, Clock, Calendar, 
  History, Info, Save, FileCheck, Landmark, ChevronDown, 
  MoreVertical, ExternalLink, FileSearch, AlignLeft, Paperclip, FileUp, File, FileImage
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

const MOCK_DOCUMENTS = [
  { 
    id: 'LAW-002', 
    title: 'พรบ. คุ้มครองแรงงาน มาตรา 118 (ค่าชดเชย)', 
    category: 'Labor Law', 
    status: 'Active', 
    updatedBy: 'Legal Dept', 
    date: '2023-12-10', 
    version: 'v4.0', 
    color: THEME.palette.cerulean, 
    content: 'มาตรา ๑๑๘ ให้นายจ้างจ่ายค่าชดเชยให้แก่ลูกจ้างซึ่งเลิกจ้าง ดังต่อไปนี้:\n\n(๑) ลูกจ้างซึ่งทำงานติดต่อกันครบหนึ่งร้อยยี่สิบวัน แต่ไม่ครบหนึ่งปี ให้จ่ายไม่น้อยกว่าค่าจ้างอัตราสุดท้ายสามสิบวัน\n(๒) ลูกจ้างซึ่งทำงานติดต่อกันครบหนึ่งปี แต่ไม่ครบสามปี ให้จ่ายไม่น้อยกว่าค่าจ้างอัตราสุดท้ายเก้าสิบวัน\n(๓) ลูกจ้างซึ่งทำงานติดต่อกันครบสามปี แต่ไม่ครบหกปี ให้จ่ายไม่น้อยกว่าค่าจ้างอัตราสุดท้ายหนึ่งร้อยแปดสิบวัน...',
    attachments: [
      { name: 'labor_protection_act_th.pdf', size: '4.8 MB', type: 'application/pdf' }
    ]
  },
  { 
    id: 'DIS-003', 
    title: 'แนวปฏิบัติการลงโทษทางวินัยพนักงาน', 
    category: 'Disciplinary', 
    status: 'Active', 
    updatedBy: 'HR Director', 
    date: '2024-02-28', 
    version: 'v1.5', 
    color: THEME.palette.burntOrange, 
    content: 'เกณฑ์การพิจารณาโทษตามลำดับความผิด:\n1. การตักเตือนด้วยวาจา (Verbal Warning): สำหรับความผิดครั้งแรกที่ไม่ร้ายแรง\n2. การตักเตือนเป็นหนังสือ (Written Warning): กรณีทำผิดซ้ำเรื่องเดิม หรือความผิดระดับกลาง\n3. การพักงาน (Suspension): กรณีความผิดซ้ำซาก หรือรอผลการสอบสวนสวนวินัย\n4. การเลิกจ้าง (Termination): กรณีความผิดร้ายแรงตามที่ระบุในข้อบังคับบริษัท',
    attachments: [
      { name: 'disciplinary_flowchart.png', size: '850 KB', type: 'image/png' }
    ]
  },
  { 
    id: 'REG-004', 
    title: 'ประกาศสวัสดิการพนักงานปี 2567', 
    category: 'Regulations', 
    status: 'Active', 
    updatedBy: 'Benefits Team', 
    date: '2024-01-01', 
    version: 'v2.0', 
    color: THEME.palette.red, 
    content: 'รายการสวัสดิการเพิ่มเติมปี 2567:\n- ประกันสุขภาพกลุ่ม: ครอบคลุมผู้ป่วยนอก 2,500 บาท/ครั้ง\n- กองทุนสำรองเลี้ยงชีพ: บริษัทสมทบสูงสุด 10% ตามอายุงาน\n- งบประมาณสำหรับการฝึกอบรม: 20,000 บาท/คน/ปี\n- วันหยุดในวันเกิด (Birthday Leave): พนักงานสามารถหยุดได้ 1 วันในเดือนเกิดโดยได้รับค่าจ้าง',
    attachments: []
  }
];

interface Attachment {
  name: string;
  size: string;
  type: string;
}

interface LawDocument {
  id?: string;
  title: string;
  category: string;
  status: string;
  updatedBy?: string;
  date?: string;
  version?: string;
  color?: string;
  content: string;
  attachments: Attachment[];
}

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: LawDocument | null;
  onSave: (doc: LawDocument) => void;
}

const DocumentModal = ({ isOpen, onClose, document: activeDoc, onSave }: DocumentModalProps) => {
  const [formData, setFormData] = useState<LawDocument>({ title: '', category: 'Regulations', version: 'v1.0', status: 'Active', content: '', attachments: [] });
  const [isReadOnly, setIsReadOnly] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeDoc) {
      setFormData({ ...activeDoc, attachments: activeDoc.attachments || [] });
      setIsReadOnly(false); 
    } else {
      setFormData({ title: '', category: 'Regulations', version: 'v1.0', status: 'Active', content: '', attachments: [] });
      setIsReadOnly(false);
    }
  }, [activeDoc, isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files: File[] = Array.from(e.target.files) as File[];
      const newAttachments = files.map(f => ({
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(2) + ' MB',
        type: f.type
      }));
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newAttachments]
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
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
                  <FileCheck size={20} className="text-[#b58c4f]"/>
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest">
                  {isReadOnly ? 'View Document Node' : (activeDoc ? 'Edit Document Node' : 'Initialize New Document')}
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
                <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest ml-1">Document Title</label>
                <input 
                  type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  readOnly={isReadOnly}
                  className={`w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b58c4f] text-[12px] font-bold ${isReadOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
                  placeholder="ระบุชื่อเรียกเอกสาร..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest ml-1">Category Registry</label>
                <div className="relative">
                  <select 
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                    disabled={isReadOnly}
                    className={`w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b58c4f] text-[12px] font-bold cursor-pointer ${isReadOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <option value="Regulations">Company Regulations</option>
                    <option value="Labor Law">Labor Law</option>
                    <option value="Disciplinary">Disciplinary Actions</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest ml-1">Version Control</label>
                <input 
                  type="text" value={formData.version || 'v1.0'} onChange={e => setFormData({...formData, version: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b58c4f] text-[12px] font-bold"
                  placeholder="e.g. v2.4, v4.0"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest ml-1">Status Enforced</label>
                <select 
                  value={formData.status || 'Active'} onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b58c4f] text-[12px] font-bold cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest">Document Full Content</label>
                <span className="text-[9px] font-mono text-[#b58c4f] uppercase tracking-widest bg-[#b58c4f]/10 px-2 py-0.5 rounded font-black">Secure Text Repository</span>
              </div>
              <textarea 
                value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                readOnly={isReadOnly}
                rows={6}
                className={`w-full px-4 py-3 bg-[#f8fafc] border border-slate-200 rounded-2xl outline-none focus:border-[#b58c4f] text-[12px] font-medium leading-relaxed resize-none custom-scrollbar ${isReadOnly ? 'opacity-80' : ''}`}
                placeholder="พิมพ์เนื้อหาของกฎระเบียบหรือข้อกฎหมายอย่างละเอียดที่นี่..."
              />
            </div>

            {/* ATTACHMENT SECTION */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                 <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest flex items-center gap-2">
                   <Paperclip size={13}/> Attachments Node
                 </label>
                 <button 
                   type="button"
                   onClick={() => fileInputRef.current.click()}
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
              <Info size={13}/> Node Integrity: Verified
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

export default function DisciplinaryLaborLaw() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, doc: null });
  const [documents, setDocuments] = useState(MOCK_DOCUMENTS);
  const [toast, setToast] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: documents.length };
    documents.forEach(doc => {
      counts[doc.category] = (counts[doc.category] || 0) + 1;
    });
    return counts;
  }, [documents]);

  const filteredDocs = useMemo(() => {
    return documents.filter(d => 
      (activeTab === 'All' || d.category === activeTab) &&
      (d.title.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase()))
    );
  }, [documents, search, activeTab]);

  const handleSave = (docData) => {
    if (docData.id) {
      setDocuments(documents.map(d => d.id === docData.id ? docData : d));
      setToast('ปรับปรุงเอกสารในฐานชี้วัดเรียบร้อยแล้วค่ะ');
    } else {
      const prefix = docData.category === 'Regulations' ? 'REG' : docData.category === 'Labor Law' ? 'LAW' : 'DIS';
      const newDoc = { 
        ...docData, 
        id: `${prefix}-${Math.floor(100 + Math.random() * 900)}`, 
        date: new Date().toISOString().split('T')[0], 
        updatedBy: 'HR Admin',
        color: docData.category === 'Regulations' ? THEME.palette.red : docData.category === 'Labor Law' ? THEME.palette.cerulean : THEME.palette.burntOrange
      };
      setDocuments([newDoc, ...documents]);
      setToast('เพิ่มเอกสารกฎหมายชิ้นใหม่เข้าสู่ระบบเรียบร้อย');
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = (id) => {
    if(window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบเอกสารนี้ออกจากคลังข้อมูลถาวร?')) {
        setDocuments(documents.filter(d => d.id !== id));
        setToast('นำพาทความจำลองออกจากฐานข้อมูลระบบแล้วค่ะ');
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
      <DocumentModal isOpen={modal.isOpen} onClose={() => setModal({isOpen: false, doc: null})} document={modal.doc} onSave={handleSave} />
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
                      <Scale size={28} strokeWidth={2.5} className="text-[#b22026]" />
                  </div>
              </div>
              <div>
                  <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none" style={{ fontSize: '24px' }}>
                      DISCIPLINARY & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b22026] to-[#b58c4f]">LABOR LAW</span>
                  </h3>
                  <p className="text-[11px] font-bold text-[#4d5a44] uppercase tracking-[0.2em] mt-0.5 opacity-80 leading-none">
                      COMPANY REGULATIONS & LABOR LAW REGISTER
                  </p>
              </div>
          </div>

          <div className="flex items-center gap-4">
              <button 
                onClick={() => setModal({isOpen: true, doc: null})}
                className="px-6 py-2.5 bg-[#212c46] text-[#f3f3f1] rounded-xl text-[11px] font-black uppercase tracking-widest shadow-md hover:bg-[#b22026] transition-all flex items-center gap-2 active:scale-95 cursor-pointer border border-[#212c46]"
              >
                <Plus size={16} /> New Document Node
              </button>
          </div>
      </div>
      <div className="px-4 sm:px-8 w-full mt-[2px]">
        <div className="w-full">
            
            {/* KPI STATS CARDS - LEAN AND COMPACT AS REQUESTED */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3 shrink-0">
                <KpiCard label="Repository Total" value={documents.length} icon={FileText} color={THEME.palette.cerulean} description="Master Documents" />
                <KpiCard label="Enforced Policies" value={documents.filter(d => d.status === 'Active').length} icon={ShieldAlert} color={THEME.palette.forest} description="Active Nodes" />
                <KpiCard label="Law Updates" value="3" icon={Scale} color={THEME.palette.burntOrange} description="Amendments" />
                <KpiCard label="File Density" value={documents.reduce((acc, doc) => acc + (doc.attachments?.length || 0), 0)} icon={Paperclip} color={THEME.palette.slate} description="Total Attachments" />
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
                                {activeTab === 'All' ? 'Filter: Global Repository' : `Node: ${activeTab}`}
                            </div>
                            <ChevronDown size={14} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`}/>
                          </button>

                          {isFilterOpen && (
                            <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-[#939885]/20 z-[100] overflow-hidden animate-fadeIn">
                                {['All', 'Regulations', 'Labor Law', 'Disciplinary'].map((cat) => (
                                    <button 
                                        key={cat}
                                        type="button"
                                        onClick={() => { setActiveTab(cat); setIsFilterOpen(false); }}
                                        className={`w-full px-4 py-3 text-[11px] font-black uppercase tracking-widest text-left flex items-center justify-between hover:bg-[#f3f3f1] transition-all cursor-pointer ${activeTab === cat ? 'bg-[#212c46]/5 text-[#b22026]' : 'text-[#414757]'}`}
                                    >
                                        <span>{cat}</span>
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-black ${activeTab === cat ? 'bg-[#b22026] text-white' : 'bg-[#eaeaec] text-[#7a8b95]'}`}>
                                            {categoryCounts[cat] || 0}
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
                              placeholder="Search document identity..." 
                              className="w-full pl-12 pr-6 py-2.5 text-[12px] border border-[#eaeaec] rounded-full font-bold outline-none focus:border-[#b7a159] bg-white shadow-sm text-[#212c46]" 
                            />
                        </div>
                    </div>
                </div>

                {/* TABLE STREAM - CUSTOM STYLES ACCORDING TO SPEC */}
                <div className="overflow-auto custom-scrollbar  flex-1 min-h-0">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead className="bg-[#222b38] text-white">
                            <tr className="border-b-2 border-[#709654]">
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">Doc ID</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">Document Identity & Metadata</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">Classification</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Version Node</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Security Status</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center font-sans">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#eaeaec]">
                            {filteredDocs.map(doc => (
                                <tr key={doc.id} className="hover:bg-[#f8f9fa] transition-colors group">
                                    <td className="py-2.5 px-4 font-mono font-black text-[#7a8b95] text-[12px]">{doc.id}</td>
                                    <td className="py-2.5 px-4">
                                        <div className="flex flex-col">
                                            <span className="font-black text-[#2f2926] text-[12px] uppercase group-hover:text-[#b22026] transition-colors">{doc.title}</span>
                                            <div className="flex items-center gap-3 mt-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                                              <span className="text-[10px] text-[#939885] font-black flex items-center gap-1 font-mono uppercase"><Clock size={10}/> {doc.date}</span>
                                              {doc.attachments?.length > 0 && (
                                                <span className="text-[10px] text-[#3f809e] font-black uppercase tracking-widest flex items-center gap-1">
                                                  <Paperclip size={10}/> {doc.attachments.length} Files
                                                </span>
                                              )}
                                              {doc.content && <span className="text-[10px] text-[#508660] font-black uppercase tracking-widest flex items-center gap-1 font-mono"><AlignLeft size={10}/> Secure Node Uploaded</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-4">
                                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase border tracking-wider" style={{backgroundColor: `${doc.color}10`, color: doc.color, borderColor: `${doc.color}30`}}>
                                            {doc.category}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-4 text-center font-mono text-[#606a5f] text-[12px] font-black">{doc.version || 'v1.0'}</td>
                                    <td className="py-2.5 px-4 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                           <div className={`w-1.5 h-1.5 rounded-full ${doc.status === 'Active' ? 'bg-[#508660]' : 'bg-[#a94228] animate-pulse'}`}/>
                                           <span className={`text-[11px] font-black uppercase tracking-wider ${doc.status === 'Active' ? 'text-[#508660]' : 'text-[#a94228]'}`}>{doc.status || 'Active'}</span>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-4 text-center">
                                        <div className="flex justify-center items-center gap-[1px]">
                                            <button 
                                                onClick={() => setModal({isOpen: true, doc: doc})} 
                                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-[#b58c4f] hover:bg-[#b58c4f] hover:text-white hover:border-[#b58c4f] transition-all active:scale-90 shadow-xs cursor-pointer" 
                                                title="Edit Node"
                                            >
                                                <Edit3 size={13}/>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(doc.id)} 
                                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-[#b22026] hover:bg-[#b22026] hover:text-white hover:border-[#b22026] transition-all active:scale-90 shadow-xs cursor-pointer" 
                                                title="Delete Node"
                                            >
                                                <Trash2 size={13}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredDocs.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                      <div className="flex flex-col items-center opacity-30">
                                        <Scale size={48} className="mb-2 text-[#7a8b95]"/>
                                        <p className="text-[12px] font-black uppercase tracking-[0.25em] text-[#2f2926]">ไม่พบเอกสารในคลังบันทึก</p>
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
                      <p className="bg-white px-3 py-1.5 rounded-lg border border-[#eaeaec] shadow-xs font-mono">Total Elements: {filteredDocs.length}</p>
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
