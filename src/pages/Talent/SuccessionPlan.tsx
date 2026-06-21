import { Toast } from '../../components/shared/Toast';
import { UserGuidePanel } from '../../components/shared/UserGuidePanel';
import KpiCard from '../../components/shared/KpiCard';
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Network, Search, Plus, Pencil, Trash2, X, Save, ChevronLeft, ChevronRight, 
  HelpCircle, CheckCircle2, AlertTriangle, Building2, Briefcase, 
  Target, TrendingUp, Download, ShieldCheck, Clock, Eye, 
  GitBranch, Award, BarChart3, Fingerprint, Zap, Layers,
  ChevronDown, UserCheck, GraduationCap, Map, ShieldAlert,
  ArrowUpRight, UserMinus, UserPlus, LayoutList, Check, XCircle, ArrowRight, Lock, Database
} from 'lucide-react';
import { DraggableModal } from '../../components/shared/DraggableModal';
import { dbSync } from '../../services/dbSync';

// --- Theme Configuration (Vibrant Brand Colors Matched perfectly to Home & User Permissions) ---
const THEME = {
  bgMain: 'transparent',
  primary: '#212c46', // Deep navy
  primaryLight: '#4d87a8',
  accent: '#a94228', 
  gold: '#b58c4f',
  brightGold: '#b7a159',
  success: '#657f4d',
  danger: '#932c2e', 
  skyBlue: '#3f809e',
  dustyBlue: '#7a8b95',
  indigo: '#414757',
  mutedSlate: '#606a5f',
  darkSlate: '#2f2926',
  coolGray: '#eaeaec',
  cement: '#709654' // Requested border color for tables
};

interface SuccessorNode {
  name: string;
  readiness: string;
  potential: number;
  dept: string;
}

interface SuccessionPlanNode {
  id: string;
  posId: string;
  jobTitle: string;
  dept: string;
  incumbent: {
    name: string;
    risk: 'Low' | 'Medium' | 'High';
    yos: string;
  };
  successors: SuccessorNode[];
  status: string;
  priority: 'Critical' | 'High' | 'Normal';
}

const INITIAL_PLANS: SuccessionPlanNode[] = [
  { 
    id: '1', posId: 'CEO-001', jobTitle: 'Chief Executive Officer', dept: 'Management', 
    incumbent: { name: 'Dr. Prasert P.', risk: 'Low', yos: '12 Yrs' },
    successors: [
        { name: 'Wipada S.', readiness: 'Ready Now', potential: 9, dept: 'Operations' },
        { name: 'Somchai M.', readiness: '1-2 Years', potential: 8, dept: 'IT' }
    ],
    status: 'High Coverage', priority: 'Critical'
  },
  { 
    id: '2', posId: 'CTO-001', jobTitle: 'Chief Technology Officer', dept: 'Information Technology', 
    incumbent: { name: 'Wichai Dev.', risk: 'High', yos: '8 Yrs' },
    successors: [
        { name: 'Anawat S.', readiness: '1-2 Years', potential: 9, dept: 'IT' }
    ],
    status: 'At Risk', priority: 'Critical'
  },
  { 
    id: '3', posId: 'SD-001', jobTitle: 'Sales Director', dept: 'Sales', 
    incumbent: { name: 'Somchai Sales', risk: 'Medium', yos: '5 Yrs' },
    successors: [
        { name: 'Boonmee K.', readiness: '3-5 Years', potential: 7, dept: 'Sales' },
        { name: 'Kanya QA', readiness: '3-5 Years', potential: 6, dept: 'QA' }
    ],
    status: 'Gaps Identified', priority: 'High'
  },
  { 
    id: '4', posId: 'HRD-001', jobTitle: 'HR Director', dept: 'Human Resources', 
    incumbent: { name: 'Mali HR', risk: 'Low', yos: '10 Yrs' },
    successors: [],
    status: 'No Successor', priority: 'High'
  }
];

const READINESS_LEVELS = [
  { id: 'Ready Now', label: 'Ready Now', color: '#657f4d', bg: '#f0fdf4' },
  { id: '1-2 Years', label: '1-2 Years', color: '#3f809e', bg: '#f0f9ff' },
  { id: '3-5 Years', label: '3-5 Years', color: '#b58c4f', bg: '#fffbeb' },
  { id: 'Not Ready', label: 'Emergency Only', color: '#932c2e', bg: '#fef2f2' }
];

const DEPARTMENTS = ['ALL', 'Management', 'Information Technology', 'Sales', 'Marketing', 'Production', 'Human Resources', 'Quality Assurance'];

// --- Interactive Plan Editor Modal ---
function EditPlanModal({ isOpen, onClose, record, onSave }: { isOpen: boolean; onClose: () => void; record: SuccessionPlanNode | null; onSave: (data: SuccessionPlanNode) => void }) {
  const [formData, setFormData] = useState<any>(null);
  const [newSucc, setNewSucc] = useState({ name: '', readiness: 'Ready Now', potential: 7, dept: 'Information Technology' });

  useEffect(() => {
    if (isOpen) {
      if (record) {
        setFormData(JSON.parse(JSON.stringify(record)));
      } else {
        setFormData({
          id: `PLAN-${Date.now()}`,
          posId: `POS-${String(Math.floor(Math.random() * 900) + 100)}`,
          jobTitle: '',
          dept: 'Information Technology',
          incumbent: { name: '', risk: 'Low', yos: '1 Yr' },
          successors: [],
          status: 'Gaps Identified',
          priority: 'High'
        });
      }
      setNewSucc({ name: '', readiness: 'Ready Now', potential: 7, dept: 'Information Technology' });
    }
  }, [isOpen, record]);

  if (!isOpen || !formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('inc_')) {
      const field = name.replace('inc_', '');
      setFormData((prev: any) => ({
        ...prev,
        incumbent: { ...prev.incumbent, [field]: value }
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const addSuccessor = () => {
    if (!newSucc.name.trim()) return;
    setFormData((prev: any) => ({
      ...prev,
      successors: [...prev.successors, { ...newSucc, potential: Number(newSucc.potential) }]
    }));
    setNewSucc({ name: '', readiness: 'Ready Now', potential: 7, dept: 'Information Technology' });
  };

  const removeSuccessor = (idx: number) => {
    setFormData((prev: any) => ({
      ...prev,
      successors: prev.successors.filter((_: any, i: number) => i !== idx)
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.jobTitle || !formData.incumbent.name) {
      alert('กรุณากรอกข้อมูลชื่อตำแหน่งและชื่อผู้ครองตำแหน่งปัจจุบัน');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <DraggableModal isOpen={isOpen} onClose={onClose} title={<div className="flex items-center gap-2"><Network size={16}/><span>{record ? 'UPDATE SUCCESSION PROTOCOL' : 'DRAFT NEW SUCCESSION PIPELINE'}</span></div>} width="max-w-3xl">
      <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-5 custom-scrollbar text-[12px] text-[#212c46]">
        
        {/* Core Profile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-[10px] font-black text-[#a94228] uppercase tracking-widest border-b pb-1">POSITION DETAIL / ข้อมูลสายตำแหน่ง</h4>
            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Position Title / ตำแหน่งงาน <span className="text-red-500">*</span></label>
              <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} required placeholder="เช่น Managing Director" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[12px] font-black outline-none focus:border-[#212c46]" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Dept Node</label>
                <select name="dept" value={formData.dept} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-black outline-none cursor-pointer">
                  {DEPARTMENTS.filter(d => d !== 'ALL').map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Id Code</label>
                <input type="text" name="posId" value={formData.posId} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[12px] font-mono font-black uppercase text-center" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-[10px] font-black text-[#a94228] uppercase tracking-widest border-b pb-1">INCUMBENT PROFILE / ข้อมูลผู้ถือตำแหน่งคนปัจจุบัน</h4>
            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Incumbent Name / ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
              <input type="text" name="inc_name" value={formData.incumbent.name} onChange={handleChange} required placeholder="เช่น นายประเสริฐ ยืนชีวิต" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[12px] font-black outline-none focus:border-[#212c46]" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Years of Service (Yos)</label>
                <input type="text" name="inc_yos" value={formData.incumbent.yos} onChange={handleChange} placeholder="e.g. 10 Yrs" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-black text-center" />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Attrition Risk / ความเสี่ยง</label>
                <select name="inc_risk" value={formData.incumbent.risk} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-black cursor-pointer">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Global Strategy Levels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Succession Status / สถานะการสืบทอด</label>
            <input type="text" name="status" value={formData.status} onChange={handleChange} placeholder="e.g. High Coverage" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[12px] font-black text-[#212c46]" />
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Priority Level / ความสำคัญ</label>
            <select name="priority" value={formData.priority} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-black cursor-pointer">
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Normal">Normal</option>
            </select>
          </div>
        </div>

        {/* Successor Pipeline Nested Forms */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-widest border-b pb-1.5 flex justify-between items-center">
            <span>POTENTIAL SUCCESSORS PIPELINE / ลำดับทายาทพนักงานสืบทอด</span>
            <span className="text-[10px] bg-[#3f809e]/10 text-[#3f809e] px-2 py-0.5 rounded font-mono font-bold">Candidates: {formData.successors.length}</span>
          </h4>

          {/* New Successor Entry fields */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border">
            <div className="md:col-span-1">
              <label className="text-[8px] font-black text-slate-500 uppercase block mb-1">Candidate Name</label>
              <input type="text" value={newSucc.name} onChange={(e)=>setNewSucc(prev=>({ ...prev, name: e.target.value }))} placeholder="เช่น สมรรถภาพ ดีมาก" className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-[11px] font-bold" />
            </div>
            <div>
              <label className="text-[8px] font-black text-slate-500 uppercase block mb-1">Readiness</label>
              <select value={newSucc.readiness} onChange={(e)=>setNewSucc(prev=>({ ...prev, readiness: e.target.value }))} className="w-full bg-white border border-slate-200 rounded-md px-1 py-1 text-[10px] font-black">
                {READINESS_LEVELS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[8px] font-black text-slate-500 uppercase block mb-1">Potential Score (1-10)</label>
              <input type="number" min="1" max="10" value={newSucc.potential} onChange={(e)=>setNewSucc(prev=>({ ...prev, potential: Number(e.target.value) }))} className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-[11px] font-bold text-center" />
            </div>
            <div className="flex items-end">
              <button type="button" onClick={addSuccessor} className="w-full bg-[#212c46] hover:bg-[#a94228] text-white py-1 rounded-md font-black text-[10px] uppercase tracking-wider transition-colors">Add</button>
            </div>
          </div>

          <div className="space-y-2 pt-2 max-h-[150px] overflow-y-auto custom-scrollbar">
            {formData.successors.map((succ: any, index: number) => {
              const level = READINESS_LEVELS.find(r => r.id === succ.readiness);
              return (
                <div key={index} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-[11px]">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: level?.color || '#7a8b95' }} />
                    <span className="font-extrabold text-[#212c46]">{succ.name}</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-500 uppercase font-mono text-[9px] font-bold">{succ.readiness}</span>
                    <span className="text-slate-400">|</span>
                    <span className="bg-[#b58c4f]/10 text-[#b58c4f] px-1.5 py-0.5 rounded font-mono font-bold text-[9px]">Potential: {succ.potential}/10</span>
                  </div>
                  <button type="button" onClick={() => removeSuccessor(index)} className="text-[#932c2e]/50 hover:text-[#932c2e] p-1 rounded transition-colors"><X size={12} /></button>
                </div>
              );
            })}
            {formData.successors.length === 0 && (
              <p className="text-center py-4 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">No successors nominated for this role</p>
            )}
          </div>
        </div>
      </form>
      
      {/* Footer */}
      <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex justify-end gap-3 shrink-0">
        <button onClick={onClose} className="px-5 py-2 bg-white border border-slate-200 text-[#414757] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
        <button onClick={handleSave} className="bg-[#212c46] text-white px-5 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md hover:bg-[#a94228] transition-all flex items-center gap-2"><Save size={14}/> Save planning</button>
      </div>
    </DraggableModal>
  );
}

export default function SuccessionPlan() {
  const [activeTab, setActiveTab] = useState('registry'); // 'registry' or 'settings'
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // DB States
  const [plans, setPlans] = useState<SuccessionPlanNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination configs matching UserPermissions
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals & Toasts
  const [editModal, setEditModal] = useState<{ isOpen: boolean; record: SuccessionPlanNode | null }>({ isOpen: false, record: null });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Settings State matching standard of UserPermissions
  const [successionConfigMap, setSuccessionConfigMap] = useState<any>({ 'retention_gate': true, 'readiness_lock': false });

  const showToast = (message: string, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  useEffect(() => {
    const fetchAndLoad = async () => {
      try {
        setIsLoading(true);
        const records = await dbSync.read('succession_plans');
        if (records && records.length > 0) {
          setPlans(records);
        } else {
          // Initialize/Seed standard records
          await dbSync.write('succession_plans', INITIAL_PLANS);
          setPlans(INITIAL_PLANS);
          showToast('Initialized Succession Database collections with compliant seed structures.', 'success');
        }
      } catch (err) {
        console.error('Failed to resolve database collections, falling back, error: ', err);
        setPlans(INITIAL_PLANS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndLoad();
  }, []);

  // Filter & Search logic
  const filteredPlans = useMemo(() => {
    return plans.filter(p => {
      const query = search.toLowerCase();
      const matchSearch = p.posId.toLowerCase().includes(query) || 
                          p.jobTitle.toLowerCase().includes(query) || 
                          p.incumbent.name.toLowerCase().includes(query);
      const matchDept = selectedDept === 'ALL' || p.dept === selectedDept;
      return matchSearch && matchDept;
    });
  }, [plans, search, selectedDept]);

  // Pagination slices
  const currentData = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredPlans.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredPlans, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredPlans.length / itemsPerPage) || 1;

  // KPIs
  const kpiData = useMemo(() => {
    const total = plans.length;
    const critical = plans.filter(p => p.priority === 'Critical').length;
    const covered = plans.filter(p => p.successors.length > 0).length;
    const atRisk = plans.filter(p => p.incumbent.risk === 'High').length;
    return { total, critical, covered, atRisk };
  }, [plans]);

  // Track page reset on filter shifts
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedDept]);

  const savePlanRecord = async (savedNode: SuccessionPlanNode) => {
    try {
      let updatedList = [];
      const exists = plans.find(p => p.id === savedNode.id);
      if (exists) {
        updatedList = plans.map(p => p.id === savedNode.id ? savedNode : p);
        await dbSync.update('succession_plans', [savedNode]);
        showToast(`แก้ไขแผนสืบทอดตำแหน่ง ${savedNode.posId} เรียบร้อยแล้ว`, 'success');
      } else {
        updatedList = [savedNode, ...plans];
        await dbSync.write('succession_plans', [savedNode]);
        showToast(`ลงทะเบียนแผนสืบทอดตำแหน่งพอร์ตงานใหม่ ${savedNode.jobTitle} สำเร็จ`, 'success');
      }
      setPlans(updatedList);
    } catch (err) {
      console.error(err);
      showToast('ระบบซิงค์ข้อมูลก้อนกลางมีปัญหาขัดข้อง', 'danger');
    }
  };

  const deletePlanRecord = async (id: string, code: string) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะลบเอกสารโครงงานแผนสืบทอด ${code}?`)) return;
    try {
      const recordsToKeep = plans.filter(p => p.id !== id);
      const recordToDelete = plans.find(p => p.id === id);
      if (recordToDelete) {
        await dbSync.delete('succession_plans', [recordToDelete]);
        setPlans(recordsToKeep);
        showToast(`ลบยุทธศาสตร์แผนงานสืบทอด ${code} สำเร็จ`, 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('ประสานงานล้างแผนสัญญานัดบนกลุ่มเมฆมีปัญหาขัดข้อง', 'danger');
    }
  };

  const toggleConfigLock = (id: string) => {
    setSuccessionConfigMap((prev: any) => ({ ...prev, [id]: !prev[id] }));
    showToast('สลับล็อกกระบวนงานความมั่นคงทางทักษะแล้ว', 'success');
  };

  return (
    <div className="flex flex-1 w-full flex-col animate-fadeIn bg-transparent space-y-4 pb-6 min-h-0">
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
      {/* Action Guide Floating Trigger */}
      <button onClick={() => setIsGuideOpen(true)} className="fixed right-0 bg-[#f8f9fa] border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#a94228] hover:text-white hover:border-[#a94228] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group cursor-pointer" style={{ top: '200px' }}>
        <HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#7a8b95] group-hover:text-white" />
        <span className="font-bold tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[10px]">USER GUIDE</span>
      </button>
      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <EditPlanModal isOpen={editModal.isOpen} onClose={() => setEditModal({ isOpen: false, record: null })} record={editModal.record} onSave={savePlanRecord} />
      {/* PAGE HEADER SECTION: Transparent Background, placed straight on the canvas */}
      <div className="h-14 px-8 flex flex-row items-center justify-between gap-4 z-20 shrink-0">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center group cursor-default shrink-0">
            <div className="absolute inset-0 bg-[#3f809e] blur-[15px] opacity-20 rounded-full group-hover:opacity-60 transition-all duration-700"></div>
            <div className="relative z-10 p-1.5 border border-[#3f809e]/40 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm">
              <Network size={28} strokeWidth={2.5} className="text-[#3f809e]" />
            </div>
          </div>
          <div>
            <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none" style={{ fontSize: '24px' }}>
              SUCCESSION <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3f809e] to-[#b58c4f]">PLANNING</span>
            </h3>
            <p className="text-[11px] font-bold text-[#4d5a44] uppercase tracking-[0.2em] mt-0.5 opacity-80 leading-none">
              Strategic Talent Continuity & Leadership Pipeline Hub
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white/50 p-1 rounded-xl border border-white/60 shadow-inner flex flex-wrap items-center gap-0.5">
            <button onClick={() => setActiveTab('registry')} className={`px-5 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'registry' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#7a8b95] hover:text-[#a94228]'}`}>
              <Database size={15} /> Global Registry
            </button>
            <button onClick={() => setActiveTab('settings')} className={`px-5 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'settings' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#7a8b95] hover:text-[#a94228]'}`}>
              <Lock size={15} /> Config Settings
            </button>
          </div>
        </div>
      </div>
      {/* Main Canvas with perfect padding identical to UserPermissions */}
      <div className="px-4 sm:px-8 w-full mt-[2px]">
        <div className="w-full">

          {/* Compact Lean KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3 shrink-0">
            <KpiCard
              label="Key Positions"
              value={kpiData.total}
              iconComp={Briefcase}
              color={THEME.skyBlue}
              description="Managed Registry" />
            <KpiCard
              label="Critical Vacant"
              value={kpiData.critical - kpiData.covered}
              iconComp={Target}
              color={THEME.accent}
              description="Urgent Fill Gates" />
            <KpiCard
              label="Ready Successors"
              value={kpiData.covered}
              iconComp={UserCheck}
              color={THEME.success}
              description="Active Pipeline" />
            <KpiCard
              label="Position At-risk"
              value={kpiData.atRisk}
              iconComp={ShieldAlert}
              color={THEME.gold}
              description="High Attrition Gaps" />
          </div>

          {activeTab === 'registry' ? (
            <div className="bg-white rounded-3xl shadow-lg border border-[#eaeaec] overflow-hidden flex flex-col mb-0 mt-4 animate-fadeIn  flex-1 min-h-0">
              
              {/* Filter Toolbar */}
              <div className="px-6 py-4 border-b border-[#eaeaec] bg-[#f8f9fa] flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative">
                    <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="bg-white border border-[#eaeaec] pl-4 pr-10 py-2 rounded-xl text-[12px] font-black text-[#212c46] uppercase tracking-wide outline-none focus:border-[#b58c4f] cursor-pointer shadow-sm min-w-[180px]">
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d === 'ALL' ? 'ALL DEPARTMENTS' : d.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div className="relative flex-1 md:w-80">
                    <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7a8b95]" />
                    <input type="text" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search position title, ID code, incumbent..." className="w-full pl-11 pr-5 py-2 text-[12px] border border-[#eaeaec] rounded-xl font-bold outline-none focus:border-[#b58c4f] bg-white text-[#212c46] shadow-sm transition-all" />
                  </div>
                </div>

                <button onClick={() => setEditModal({ isOpen: true, record: null })} className="bg-[#212c46] hover:bg-[#a94228] text-white px-5 py-2 rounded-xl font-black text-[12px] uppercase tracking-widest shadow-md transition-all flex items-center gap-2 border border-transparent cursor-pointer shrink-0">
                  <Plus size={16} /> Draft Succession Plan
                </button>
              </div>

              {/* Table conforming to the strict specific guidelines */}
              <div className="overflow-auto custom-scrollbar  flex-1 min-h-0">
                <table className="w-full text-left border-collapse min-w-[950px]">
                  <thead>
                    <tr className="bg-[#222b38] text-white border-b-2 border-[#709654]">
                      <th className="py-4 px-6 text-[12px] font-black uppercase tracking-widest whitespace-nowrap">Key Position</th>
                      <th className="py-4 px-6 text-[12px] font-black uppercase tracking-widest whitespace-nowrap">Incumbent Holder</th>
                      <th className="py-4 px-6 text-[12px] font-black uppercase tracking-widest whitespace-nowrap">Attrition Risk Level</th>
                      <th className="py-4 px-6 text-[12px] font-black uppercase tracking-widest whitespace-nowrap w-1/3">Successors Pipeline</th>
                      <th className="py-4 px-6 text-[12px] font-black uppercase tracking-widest text-center whitespace-nowrap">Status</th>
                      <th className="py-4 px-6 text-[12px] font-black uppercase tracking-widest text-center whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#eaeaec]">
                    {currentData.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                        {/* Key Position column 12px */}
                        <td className="py-2.5 px-6 font-black text-[12px] whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#212c46] text-white flex items-center justify-center font-mono font-bold text-[11px] shrink-0">
                              <Briefcase size={14} />
                            </div>
                            <div>
                              <p className="text-[#212c46] font-extrabold tracking-tight uppercase">{item.jobTitle}</p>
                              <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#b58c4f] to-[#b7a159] text-[10px] font-mono font-black uppercase">{item.posId} • ({item.dept})</p>
                            </div>
                          </div>
                        </td>

                        {/* Incumbent column 12px */}
                        <td className="py-2.5 px-6 text-[12px]">
                          <div>
                            <p className="text-[#212c46] font-black uppercase">{item.incumbent.name}</p>
                            <p className="text-[#7a8b95] text-[10px] font-extrabold uppercase font-mono tracking-wider">Tenure: {item.incumbent.yos}</p>
                          </div>
                        </td>

                        {/* Attrition Risk column 11px badges */}
                        <td className="py-2.5 px-6 text-[11px]">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] border font-black uppercase tracking-wider
                            ${item.incumbent.risk === 'Low' ? 'bg-[#657f4d]/10 text-[#657f4d] border-[#657f4d]/30' : 
                              item.incumbent.risk === 'High' ? 'bg-[#932c2e]/10 text-[#932c2e] border-[#932c2e]/30 animate-pulse' : 
                              'bg-[#b58c4f]/10 text-[#b58c4f] border-[#b58c4f]/30'}`}>
                            {item.incumbent.risk} Risk
                          </span>
                        </td>

                        {/* Successor Pipeline nested nodes 12px */}
                        <td className="py-2.5 px-6 text-[12px]">
                          <div className="flex flex-wrap items-center gap-1.5 max-w-xl">
                            {item.successors.length > 0 ? (
                              item.successors.map((succ, sIdx) => {
                                const level = READINESS_LEVELS.find(r => r.id === succ.readiness);
                                return (
                                  <div key={sIdx} className="bg-[#212c46]/5 text-[#212c46] border border-[#eaeaec] rounded-lg px-2.5 py-1 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: level?.color }} />
                                    <div className="flex flex-col select-none">
                                      <span className="font-extrabold text-[11px] leading-tight text-[#212c46]">{succ.name}</span>
                                      <span className="text-[#7a8b95] text-[9px] font-bold uppercase leading-none tracking-tighter mt-0.5">{succ.readiness}</span>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <span className="text-[10px] text-[#932c2e] bg-[#932c2e]/5 border border-[#932c2e]/10 px-2 py-1 rounded-lg font-black uppercase tracking-wider flex items-center gap-1">
                                <AlertTriangle size={11} className="shrink-0" /> Empty Pipeline
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status Badge 11px */}
                        <td className="py-2.5 px-6 text-center text-[11px]">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] border font-black uppercase tracking-wider
                            ${item.status === 'High Coverage' ? 'bg-[#657f4d]/10 text-[#657f4d] border-[#657f4d]/30' : 
                              item.status === 'No Successor' ? 'bg-[#932c2e]/10 text-[#932c2e] border-[#932c2e]/30' : 
                              'bg-slate-100 text-slate-500 border-slate-300'}`}>
                            {item.status}
                          </span>
                        </td>

                        {/* Action buttons matching (w-8 h-8, gap-[1px]) */}
                        <td className="py-2.5 px-6 text-center text-[12px]">
                          <div className="flex justify-center items-center gap-[1px]">
                            <button onClick={() => setEditModal({ isOpen: true, record: item })} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#3f809e] bg-[#3f809e]/10 hover:bg-[#3f809e]/20 transition-all font-black cursor-pointer" title="Edit Plan">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => deletePlanRecord(item.id, item.jobTitle)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#932c2e] bg-[#932c2e]/10 hover:bg-[#932c2e]/20 transition-all font-black cursor-pointer" title="Delete Plan">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {currentData.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 bg-white text-center text-[#7a8b95] font-bold text-[12px] uppercase tracking-widest">
                          ไม่มีแผนงานความมั่นคงแสดงขึ้นตามข้อกำหนด
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Exact pagination standard of UserPermissions */}
              <div className="px-6 py-3 bg-slate-50 border-t border-[#eaeaec] flex flex-col md:flex-row justify-between items-center gap-4 rounded-b-3xl">
                <div className="flex items-center gap-5 text-[11px] font-black text-[#606a5f] uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <span>Display Rows:</span>
                    <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="bg-white border border-slate-300 rounded-lg px-2 py-1 outline-none font-bold text-[#212c46] cursor-pointer">
                      {[5, 10, 20, 50].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <p className="bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm font-mono text-[11px]">Total: {filteredPlans.length} Positions</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`w-8 h-8 border border-slate-300 bg-white rounded-lg flex items-center justify-center transition-all cursor-pointer ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100 active:scale-95'}`}>
                    <ChevronLeft size={16}/>
                  </button>
                  <div className="bg-white text-[#414757] px-4 py-1.5 rounded-lg font-black text-[11px] min-w-[100px] text-center border border-slate-300 font-mono">
                    Page {currentPage} / {totalPages}
                  </div>
                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className={`w-8 h-8 border border-slate-300 bg-white rounded-lg flex items-center justify-center transition-all cursor-pointer ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100 active:scale-95'}`}>
                    <ChevronRight size={16}/>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* Standard Synced Configuration Layout (Same Standard as User Permissions) */
            (<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-4 animate-fadeIn pb-6">
              {/* Left Side: Policies Policy Guide */}
              <div className="lg:col-span-4 bg-white p-6 rounded-3xl shadow-lg border border-[#eaeaec] h-fit space-y-6">
                <h3 className="text-[14px] font-black text-[#212c46] uppercase tracking-widest flex items-center gap-3 border-b-2 border-[#b7a159] pb-4 mb-3">
                  <ShieldCheck size={20} className="text-[#b7a159]" /> PIPELINE ACCESS CONTROL
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-700 font-black text-[12px] uppercase tracking-widest mb-1.5"><Clock size={16}/> Attrition Gates lock</div>
                    <p className="text-[12px] text-[#606a5f] font-bold leading-relaxed">ข้อมูลแผนสืบทอดตำแหน่งสำคัญ จะจำกัดสิทธิ์แก้ไขเฉพาะผู้มีสิทธิ์อนุมัติและคณะผู้ขัดเกลานโยบายพนักงานระดับโครงสร้างเท่านั้น</p>
                  </div>
                  <div className="p-4 bg-[#932c2e]/10 border border-[#932c2e]/30 rounded-xl">
                    <div className="flex items-center gap-2 text-[#932c2e] font-black text-[12px] uppercase tracking-widest mb-1.5"><Lock size={16}/> Succession Lockout</div>
                    <p className="text-[12px] text-[#606a5f] font-bold leading-relaxed">ป้องกันการรั่วไหลและการตั้งค่าความมั่นคงโดยมิได้รับอนุญาตแบบ Real-time</p>
                  </div>
                </div>
              </div>
              {/* Right Side: Control Mapping */}
              <div className="lg:col-span-8 bg-white rounded-3xl shadow-lg border border-[#eaeaec] overflow-hidden">
                <div className="p-6 bg-[#f8f9fa] border-b border-[#eaeaec]">
                  <h4 className="text-[14px] font-black uppercase text-[#212c46] tracking-widest flex items-center gap-3">
                    <LayoutList size={20} className="text-[#b7a159]"/> CONTINUITY CO-STRATEGY PROTOCOLS
                  </h4>
                </div>
                <div className="p-6 space-y-3">
                  {[
                    { id: 'retention_gate', label: 'CRITICAL POSITION ATTRITION METRICS', desc: 'เกณฑ์ความเสี่ยงและการคาดการณ์ผู้สืบทอดที่เหมาะสมตามหลัก SOP' },
                    { id: 'readiness_lock', label: 'READINESS PROTOCOL GATEWAY LOCKS', desc: 'ระบบตรวจสอบพอร์ตทักษะผู้ประเมินและความต่อเนื่องระดับความพร้อม' }
                  ].map(cluster => (
                    <div key={cluster.id} className={`flex items-center justify-between px-5 py-3 rounded-2xl border transition-all ${successionConfigMap[cluster.id] ? 'bg-[#932c2e]/5 border-[#932c2e]/30 shadow-sm' : 'bg-white border-[#eaeaec] hover:border-[#4d87a8]'}`}>
                      <div>
                        <span className="font-black text-[#212c46] text-[13px] uppercase tracking-widest block">{cluster.label}</span>
                        <span className="text-[11px] text-[#7a8b95] font-medium block mt-0.5">{cluster.desc}</span>
                        <span className={`text-[10px] font-black uppercase tracking-wider block mt-1.5 ${successionConfigMap[cluster.id] ? 'text-[#932c2e]' : 'text-[#657f4d]'}`}>Status: {successionConfigMap[cluster.id] ? 'Locked Security' : 'Adjustable for Verifiers'}</span>
                      </div>
                      <button onClick={()=>toggleConfigLock(cluster.id)} className={`p-2 rounded-xl transition-all shadow-sm active:scale-90 cursor-pointer ${successionConfigMap[cluster.id] ? 'bg-[#932c2e] text-white' : 'bg-white text-[#7a8b95] border border-[#eaeaec] hover:bg-[#f8f9fa]'}`}>
                        {successionConfigMap[cluster.id] ? <Lock size={18}/> : <Eye size={18}/>}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>)
          )}

          {/* Footer margin spacing helper standard matching `mt-8` / `mb-0` (32px) */}
          <div className="mt-8 h-2"></div>

        </div>
      </div>
    </div>
  );
}
