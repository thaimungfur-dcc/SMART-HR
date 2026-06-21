import { Toast } from '../../components/shared/Toast';
import { UserGuidePanel } from '../../components/shared/UserGuidePanel';
import KpiCard from '../../components/shared/KpiCard';
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  GitBranch, Search, Plus, Pencil, Trash2, X, Save, ChevronLeft, ChevronRight, 
  HelpCircle, CheckCircle2, AlertTriangle, Building2, Briefcase, 
  Target, TrendingUp, Download, ShieldCheck, Clock, Eye, 
  Award, BarChart3, Fingerprint, Zap, Layers,
  ChevronDown, UserCheck, GraduationCap, ListTree, Lock, Database, Compass, ArrowRight
} from 'lucide-react';
import { DraggableModal } from '../../components/shared/DraggableModal';
import { dbSync } from '../../services/dbSync';

// --- Theme Configuration (Vibrant Palette Synced perfectly with home and permissions) ---
const THEME = {
  bgMain: 'transparent', // Shared transparent background with home
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
  cement: '#709654' // Special border-b accent requested (709654)
};

interface CareerPathNode {
  id: string;
  code: string;
  titleTh: string;
  titleEn: string;
  dept: string;
  steps: string[]; // Progression steps e.g. ["Junior Engineer", "Senior Engineer", "Principal Lead"]
  minYears: number;
  status: 'ACTIVE' | 'ARCHIVED';
  updatedBy: string;
}

const INITIAL_PATHS: CareerPathNode[] = [
  { 
    id: '1', code: 'PATH-DEV', titleTh: 'เส้นทางวิศวกรรมซอฟต์แวร์', titleEn: 'Software Engineering Pathway', dept: 'Information Technology',
    steps: ['Software Engineer', 'Senior Engineer', 'Solutions Architect', 'Director of Engineering'],
    minYears: 7, status: 'ACTIVE', updatedBy: 'PHICHAMON ADMIN'
  },
  { 
    id: '2', code: 'PATH-QA', titleTh: 'เส้นทางประกันคุณภาพหลัก', titleEn: 'Quality Assurance Pathway', dept: 'Quality Assurance',
    steps: ['QA Engineer', 'Senior QA', 'QA Lead', 'Director of Product Quality'],
    minYears: 6, status: 'ACTIVE', updatedBy: 'PHICHAMON ADMIN'
  },
  { 
    id: '3', code: 'PATH-PROD', titleTh: 'เส้นทางการจัดการผลิตอุตสาหกรรม', titleEn: 'Production Operations Pathway', dept: 'Production',
    steps: ['Production Operator', 'Production Supervisor', 'Section Lead Engineer', 'Plant Manager'],
    minYears: 8, status: 'ACTIVE', updatedBy: 'SOMMAI JAIDEE'
  }
];

const DEPARTMENTS = ['ALL', 'Information Technology', 'Sales', 'Marketing', 'Production', 'Human Resources', 'Quality Assurance'];

// --- Edit Career Path Modal ---
function EditCareerModal({ isOpen, onClose, record, onSave }: { isOpen: boolean; onClose: () => void; record: CareerPathNode | null; onSave: (data: CareerPathNode) => void }) {
  const [formData, setFormData] = useState<any>(null);
  const [newStep, setNewStep] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (record) {
        setFormData(JSON.parse(JSON.stringify(record)));
      } else {
        setFormData({
          id: `PATH-${Date.now()}`,
          code: `PATH-${String(Math.floor(Math.random() * 90) + 10)}`,
          titleTh: '',
          titleEn: '',
          dept: 'Information Technology',
          steps: ['Junior Role', 'Senior Role'],
          minYears: 5,
          status: 'ACTIVE',
          updatedBy: 'SYSTEM ADMIN'
        });
      }
      setNewStep('');
    }
  }, [isOpen, record]);

  if (!isOpen || !formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const addStep = () => {
    if (!newStep.trim()) return;
    setFormData((prev: any) => ({
      ...prev,
      steps: [...prev.steps, newStep.trim()]
    }));
    setNewStep('');
  };

  const removeStep = (indexToRemove: number) => {
    setFormData((prev: any) => ({
      ...prev,
      steps: prev.steps.filter((_: any, idx: number) => idx !== indexToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleEn || !formData.titleTh || formData.steps.length === 0) {
      alert('กรุณากรอกสายงาน และระบุลำดับสายอาชีพอย่างน้อย 1 ขั้น');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <DraggableModal isOpen={isOpen} onClose={onClose} title={<div className="flex items-center gap-2"><GitBranch size={16}/><span>{record ? 'UPDATE CAREER PATH PROTOCOL' : 'DRAFT NEW PROGRESSION PATHWAY'}</span></div>} width="max-w-2xl">
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-5 custom-scrollbar text-[12px] text-[#212c46]">
        {/* Core Profile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <label className="text-[10px] font-black text-[#a94228] uppercase tracking-widest block mb-2 font-mono">Pathway Name (Thai) / ชื่อสายอาชีพภาษาไทย <span className="text-red-500">*</span></label>
            <input type="text" name="titleTh" value={formData.titleTh} onChange={handleChange} required placeholder="เช่น เส้นทางสายวิศวกรซอฟต์แวร์" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-[12px] font-bold outline-none focus:border-[#212c46] focus:bg-white text-[#212c46]" />
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <label className="text-[10px] font-black text-[#a94228] uppercase tracking-widest block mb-2 font-mono">Pathway Identity (English) <span className="text-red-500">*</span></label>
            <input type="text" name="titleEn" value={formData.titleEn} onChange={handleChange} required placeholder="e.g. Software Engineering Pathway" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-[12px] font-bold outline-none focus:border-[#212c46] focus:bg-white text-[#212c46]" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <label className="text-[10px] font-black text-slate-500 block mb-2 uppercase tracking-wider">Department Node</label>
            <select name="dept" value={formData.dept} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[11px] font-black outline-none focus:border-[#212c46] text-[#212c46] transition-colors cursor-pointer">
              {DEPARTMENTS.filter(d=>d!=='ALL').map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <label className="text-[10px] font-black text-slate-500 block mb-2 uppercase tracking-wider">Required Minimum Years</label>
            <input type="number" name="minYears" value={formData.minYears} onChange={handleChange} required min="1" max="15" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-1 text-[12px] font-black text-center" />
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <label className="text-[10px] font-black text-slate-500 block mb-2 uppercase tracking-wider">Document Code</label>
            <input type="text" name="code" value={formData.code} onChange={handleChange} required placeholder="PATH-ID" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[12px] font-mono font-black text-center uppercase" />
          </div>
        </div>

        {/* Pathway Progression Interactive Step List */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-widest border-b pb-1.5 flex justify-between items-center">
            <span>SEQUENCE STEP ORDER / ลำดับขั้นการเลื่อนสายขั้น</span>
            <span className="text-[10px] bg-[#657f4d]/10 text-[#657f4d] px-2 py-0.5 rounded font-mono font-bold">Steps: {formData.steps.length}</span>
          </h4>

          {/* New Step Creator Add-on */}
          <div className="flex gap-2">
            <input type="text" value={newStep} onChange={(e)=>setNewStep(e.target.value)} placeholder="เพิ่ม Node ถัดไป (เช่น Senior Engineer)" className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-[12px] font-bold outline-none focus:border-[#212c46] focus:bg-white text-[#212c46]" />
            <button type="button" onClick={addStep} className="bg-[#212c46] hover:bg-[#a94228] text-white px-4 py-2 rounded-lg font-black text-[11px] uppercase tracking-widest transition-colors">Add step</button>
          </div>

          <div className="space-y-2 pt-2">
            {formData.steps.map((stepName: string, index: number) => (
              <div key={index} className="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 shadow-inner group">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#212c46] text-white flex items-center justify-center font-mono font-bold text-[10px]">{index + 1}</div>
                  <span className="text-[12px] font-extrabold text-slate-700">{stepName}</span>
                </div>
                <button type="button" onClick={() => removeStep(index)} className="text-[#932c2e]/50 hover:text-[#932c2e] p-1 rounded-md transition-colors"><X size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      </form>
      
      {/* Footer */}
      <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex justify-end gap-3 shrink-0">
        <button onClick={onClose} className="px-5 py-2 bg-white border border-slate-200 text-[#414757] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
        <button onClick={handleSubmit} className="bg-[#212c46] text-white px-5 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md hover:bg-[#a94228] transition-all flex items-center gap-2"><Save size={14}/> Save Pathway</button>
      </div>
    </DraggableModal>
  );
}

// --- Main Page Component ---
export default function CareerPath() {
  const [activeTab, setActiveTab] = useState('registry'); // 'registry' or 'settings'
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // DB States
  const [pathways, setPathways] = useState<CareerPathNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination configs matching UserPermissions
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals & Toasts
  const [editModal, setEditModal] = useState<{ isOpen: boolean; record: CareerPathNode | null }>({ isOpen: false, record: null });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Settings State matching standard of UserPermissions
  const [careerConfigMap, setCareerConfigMap] = useState<any>({ 'standards': true, 'salary_sync': false });

  const showToast = (message: string, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  useEffect(() => {
    const fetchAndLoad = async () => {
      try {
        setIsLoading(true);
        const records = await dbSync.read('career_paths');
        if (records && records.length > 0) {
          setPathways(records);
        } else {
          // Initialize/Seed standard records
          await dbSync.write('career_paths', INITIAL_PATHS);
          setPathways(INITIAL_PATHS);
          showToast('Initialized Career Paths Database with original template records.', 'success');
        }
      } catch (err) {
        console.error('Failed to resolve database collections, falling back, error: ', err);
        setPathways(INITIAL_PATHS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndLoad();
  }, []);

  // Filter & Search logic
  const filteredPathways = useMemo(() => {
    return pathways.filter(pathItem => {
      const query = search.toLowerCase();
      const matchSearch = pathItem.titleEn.toLowerCase().includes(query) || 
                          pathItem.titleTh.toLowerCase().includes(query) || 
                          pathItem.code.toLowerCase().includes(query);
      const matchDept = selectedDept === 'ALL' || pathItem.dept === selectedDept;
      return matchSearch && matchDept;
    });
  }, [pathways, search, selectedDept]);

  // Pagination slices
  const currentData = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredPathways.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredPathways, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredPathways.length / itemsPerPage) || 1;

  // KPIs
  const kpiData = useMemo(() => {
    const total = pathways.length;
    const avgYears = total > 0 ? (pathways.reduce((sum, p) => sum + p.minYears, 0) / total).toFixed(1) : '0';
    const activeLength = pathways.filter(p => p.status === 'ACTIVE').length;
    return { total, avgYears, activeLength };
  }, [pathways]);

  // Track page reset on filter shifts
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedDept]);

  const savePathwayRecord = async (savedNode: CareerPathNode) => {
    try {
      let updatedList = [];
      const exists = pathways.find(p => p.id === savedNode.id);
      if (exists) {
        updatedList = pathways.map(p => p.id === savedNode.id ? savedNode : p);
        await dbSync.update('career_paths', [savedNode]);
        showToast(`แก้ไขสายวิชาชีพ ${savedNode.code} เรียบร้อยแล้ว`, 'success');
      } else {
        updatedList = [savedNode, ...pathways];
        await dbSync.write('career_paths', [savedNode]);
        showToast(`ลงทะเบียนสายส่งเสริม ${savedNode.titleEn} พอร์ตใหม่สำเร็จ`, 'success');
      }
      setPathways(updatedList);
    } catch (err) {
      console.error(err);
      showToast('ปัญหาเชื่อมต่อบริการภายนอก', 'danger');
    }
  };

  const deletePathwayRecord = async (id: string, code: string) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะลบเอกสารสายส่งเสริมอาชีพ ${code}?`)) return;
    try {
      const recordsToKeep = pathways.filter(p => p.id !== id);
      const recordToDelete = pathways.find(p => p.id === id);
      if (recordToDelete) {
        await dbSync.delete('career_paths', [recordToDelete]);
        setPathways(recordsToKeep);
        showToast(`ลบโครงข่ายสายอาชีพ ${code} สำเร็จ`, 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('การลบข้อมูลบนระบบกลุ่มเมฆขัดข้อง', 'danger');
    }
  };

  const toggleConfigLock = (id: string) => {
    setCareerConfigMap((prev: any) => ({ ...prev, [id]: !prev[id] }));
    showToast('สลับระดับควบคุมความก้าวหน้าแล้ว', 'success');
  };

  return (
    <div className="flex flex-1 w-full flex-col animate-fadeIn bg-transparent space-y-4 pb-6 min-h-0">
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
      {/* Action Guide Floating Trigger */}
      <button onClick={() => setIsGuideOpen(true)} className="fixed right-0 bg-[#f8f9fa] border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#a94228] hover:text-white hover:border-[#a94228] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group" style={{ top: '200px' }}>
        <HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#7a8b95] group-hover:text-white" />
        <span className="font-bold tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[10px]">USER GUIDE</span>
      </button>
      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <EditCareerModal isOpen={editModal.isOpen} onClose={() => setEditModal({ isOpen: false, record: null })} record={editModal.record} onSave={savePathwayRecord} />
      {/* PAGE HEADER SECTION: Transparent Background, placed straight on the canvas */}
      <div className="h-14 px-8 flex flex-row items-center justify-between gap-4 z-20 shrink-0">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center group cursor-default shrink-0">
            <div className="absolute inset-0 bg-[#3f809e] blur-[15px] opacity-20 rounded-full group-hover:opacity-60 transition-all duration-700"></div>
            <div className="relative z-10 p-1.5 border border-[#3f809e]/40 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm">
              <Compass size={28} strokeWidth={2.5} className="text-[#3f809e]" />
            </div>
          </div>
          <div>
            <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none" style={{ fontSize: '24px' }}>
              CAREER <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3f809e] to-[#b58c4f]">PATHWAYS</span>
            </h3>
            <p className="text-[11px] font-bold text-[#4d5a44] uppercase tracking-[0.2em] mt-0.5 opacity-80 leading-none">
              Role Ladder & Technical Succession Matrix Node
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-3 shrink-0">
            <KpiCard
              label="Average Succession Years"
              value={`${kpiData.avgYears} YRS`}
              iconName="Clock"
              color={THEME.gold}
              description="Lower Bound Milestone" />
            <KpiCard
              label="Defined Career Roadmaps"
              value={kpiData.total}
              iconName="GitBranch"
              color={THEME.skyBlue}
              description="Active SOP Pipelines" />
            <KpiCard
              label="Fully Verified Pipelines"
              value={kpiData.activeLength}
              iconName="BarChart3"
              color={THEME.success}
              description="No Broken Gaps Found" />
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
                    <input type="text" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search pathway name or code..." className="w-full pl-11 pr-5 py-2 text-[12px] border border-[#eaeaec] rounded-xl font-bold outline-none focus:border-[#b58c4f] bg-white text-[#212c46] shadow-sm transition-all" />
                  </div>
                </div>

                <button onClick={() => setEditModal({ isOpen: true, record: null })} className="bg-[#212c46] hover:bg-[#a94228] text-white px-5 py-2 rounded-xl font-black text-[12px] uppercase tracking-widest shadow-md transition-all flex items-center gap-2 border border-transparent cursor-pointer shrink-0">
                  <Plus size={16} /> Draft Career Pathway
                </button>
              </div>

              {/* Table conforming to the strict specific guidelines */}
              <div className="overflow-auto custom-scrollbar  flex-1 min-h-0">
                <table className="w-full text-left border-collapse min-w-[950px]">
                  <thead>
                    <tr className="bg-[#222b38] text-white border-b-2 border-[#709654]">
                      <th className="py-4 px-6 text-[12px] font-black uppercase tracking-widest whitespace-nowrap">Document Code</th>
                      <th className="py-4 px-6 text-[12px] font-black uppercase tracking-widest whitespace-nowrap">Career Pathway Name</th>
                      <th className="py-4 px-6 text-[12px] font-black uppercase tracking-widest whitespace-nowrap">Succession Step Progression Nodes</th>
                      <th className="py-4 px-4 text-[12px] font-black uppercase tracking-widest text-center whitespace-nowrap">Milestone Years</th>
                      <th className="py-4 px-6 text-[12px] font-black uppercase tracking-widest text-center whitespace-nowrap">Status</th>
                      <th className="py-4 px-6 text-[12px] font-black uppercase tracking-widest text-center whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#eaeaec]">
                    {currentData.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                        {/* ID Code column 12px */}
                        <td className="py-2.5 px-6 font-mono font-black text-[#a94228] text-[12px] whitespace-nowrap">
                          {item.code}
                        </td>

                        {/* Title descriptions column 12px */}
                        <td className="py-2.5 px-6 font-black text-[12px]">
                          <div>
                            <p className="text-[#212c46] font-extrabold tracking-tight">{item.titleEn}</p>
                            <p className="text-[#7a8b95] text-[10px] font-bold uppercase tracking-wider">{item.titleTh} • ({item.dept})</p>
                          </div>
                        </td>

                        {/* Staggered Progression Nodes inside table 12px */}
                        <td className="py-2.5 px-6 text-[12px]">
                          <div className="flex flex-wrap items-center gap-1.5 max-w-xl">
                            {item.steps.map((stepName, stepIndex) => (
                              <React.Fragment key={stepIndex}>
                                <span className="bg-[#212c46]/5 text-[#212c46] border border-[#eaeaec] font-black text-[11px] uppercase tracking-wider px-2 px-3 py-1 rounded-lg">
                                  {stepName}
                                </span>
                                {stepIndex < item.steps.length - 1 && (
                                  <ArrowRight size={12} className="text-[#b7a159] shrink-0" />
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </td>

                        {/* Milestone years column 12px */}
                        <td className="py-2.5 px-4 text-center font-black text-[12px] font-mono text-[#2f2926]">
                          {item.minYears} Yrs
                        </td>

                        {/* Status Badge 11px */}
                        <td className="py-2.5 px-6 text-center text-[11px]">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] border font-black uppercase tracking-wider
                            ${item.status === 'ACTIVE' ? 'bg-[#657f4d]/10 text-[#657f4d] border-[#657f4d]/30' : 'bg-slate-100 text-slate-500 border-slate-300'}`}>
                            {item.status}
                          </span>
                        </td>

                        {/* Action buttons matching (w-8 h-8, gap-[1px]) */}
                        <td className="py-2.5 px-6 text-center text-[12px]">
                          <div className="flex justify-center items-center gap-[1px]">
                            <button onClick={() => setEditModal({ isOpen: true, record: item })} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#3f809e] bg-[#3f809e]/10 hover:bg-[#3f809e]/20 transition-all font-black" title="Edit Pathway">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => deletePathwayRecord(item.id, item.code)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#932c2e] bg-[#932c2e]/10 hover:bg-[#932c2e]/20 transition-all font-black" title="Delete Pathway">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {currentData.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 bg-white text-center text-[#7a8b95] font-bold text-[12px] uppercase tracking-widest">
                          ไม่มีแผนงานสายวิชาชีพแสดงขึ้นตามข้อกำหนด
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
                  <p className="bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm font-mono text-[11px]">Total: {filteredPathways.length} Pathways</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`w-8 h-8 border border-slate-300 bg-white rounded-lg flex items-center justify-center transition-all ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100 active:scale-95'}`}>
                    <ChevronLeft size={16}/>
                  </button>
                  <div className="bg-white text-[#414757] px-4 py-1.5 rounded-lg font-black text-[11px] min-w-[100px] text-center border border-slate-300 font-mono">
                    Page {currentPage} / {totalPages}
                  </div>
                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className={`w-8 h-8 border border-slate-300 bg-white rounded-lg flex items-center justify-center transition-all ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100 active:scale-95'}`}>
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
                  <ShieldCheck size={20} className="text-[#b7a159]" /> STABILITY STANDARD CONTROL
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-700 font-black text-[12px] uppercase tracking-widest mb-1.5"><Clock size={16}/> Milestone Gates Lock</div>
                    <p className="text-[12px] text-[#606a5f] font-bold leading-relaxed">การย้ายขึ้นตำแหน่งสูงขึ้นในลำดับขั้น จะต้องถูกบันทึกประเมินผ่าน SOP ฝ่ายประสานทรัพยากรบุคคล</p>
                  </div>
                  <div className="p-4 bg-[#932c2e]/10 border border-[#932c2e]/30 rounded-xl">
                    <div className="flex items-center gap-2 text-[#932c2e] font-black text-[12px] uppercase tracking-widest mb-1.5"><Lock size={16}/> Succession Lockout</div>
                    <p className="text-[12px] text-[#606a5f] font-bold leading-relaxed">ข้อมูลกำหนดบันไดพนักงานมีการสลับกลไกเพื่อรักษาประสิทธิภาพและขวัญกำลังใจในองค์กร</p>
                  </div>
                </div>
              </div>
              {/* Right Side: Control Mapping */}
              <div className="lg:col-span-8 bg-white rounded-3xl shadow-lg border border-[#eaeaec] overflow-hidden">
                <div className="p-6 bg-[#f8f9fa] border-b border-[#eaeaec]">
                  <h4 className="text-[14px] font-black uppercase text-[#212c46] tracking-widest flex items-center gap-3">
                    <ListTree size={20} className="text-[#b7a159]"/> PIPELINE STABILITY PROTOCOLS
                  </h4>
                </div>
                <div className="p-6 space-y-3">
                  {[
                    { id: 'standards', label: 'EVALUATION SUCCESSION METRICS', desc: 'เกณฑ์ปีปฏิบัติการและระดับประเมินความสามารถหลักในสายวิชาชีพ' },
                    { id: 'salary_sync', label: 'ACCUMULATED PATHS COMPENSATION INTEGRITY', desc: 'ระบบตรวจสอบพอร์ตค่าตอบแทนและการเลื่อนฐานขอนโนมัติ' }
                  ].map(cluster => (
                    <div key={cluster.id} className={`flex items-center justify-between px-5 py-3 rounded-2xl border transition-all ${careerConfigMap[cluster.id] ? 'bg-[#932c2e]/5 border-[#932c2e]/30 shadow-sm' : 'bg-white border-[#eaeaec] hover:border-[#4d87a8]'}`}>
                      <div>
                        <span className="font-black text-[#212c46] text-[13px] uppercase tracking-widest block">{cluster.label}</span>
                        <span className="text-[11px] text-[#7a8b95] font-medium block mt-0.5">{cluster.desc}</span>
                        <span className={`text-[10px] font-black uppercase tracking-wider block mt-1.5 ${careerConfigMap[cluster.id] ? 'text-[#932c2e]' : 'text-[#657f4d]'}`}>Status: {careerConfigMap[cluster.id] ? 'Locked Security' : 'Adjustable for Verifiers'}</span>
                      </div>
                      <button onClick={()=>toggleConfigLock(cluster.id)} className={`p-2 rounded-xl transition-all shadow-sm active:scale-90 ${careerConfigMap[cluster.id] ? 'bg-[#932c2e] text-white' : 'bg-white text-[#7a8b95] border border-[#eaeaec] hover:bg-[#f8f9fa]'}`}>
                        {careerConfigMap[cluster.id] ? <Lock size={18}/> : <Eye size={18}/>}
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
