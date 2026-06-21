import { Toast } from '../../components/shared/Toast';
import { UserGuidePanel } from '../../components/shared/UserGuidePanel';
import KpiCard from '../../components/shared/KpiCard';
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  BrainCircuit, Search, Plus, Pencil, Trash2, X, Save, ChevronLeft, ChevronRight, 
  HelpCircle, CheckCircle2, AlertTriangle, Building2, Briefcase, 
  Target, TrendingUp, Download, ShieldCheck, Clock, Eye, 
  GitBranch, Award, BarChart3, Fingerprint, Zap, Layers,
  ChevronDown, UserCheck, GraduationCap, ListTree, Lock, Database
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

interface SkillProfile {
  id: string;
  empId: string;
  nameEn: string;
  dept: string;
  jobTitle: string;
  image: string;
  skills: {
    technical: number;
    communication: number;
    leadership: number;
    problemSolving: number;
  };
  avgScore: number;
  readiness: string;
}

const INITIAL_SKILLS: SkillProfile[] = [
  { 
    id: '1', empId: 'EMP-24001', nameEn: 'Somchai Mungmun', dept: 'Information Technology', jobTitle: 'Senior Fullstack Developer',
    image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
    skills: { technical: 5, communication: 4, leadership: 3, problemSolving: 5 },
    avgScore: 4.25, readiness: 'Ready for Promotion'
  },
  { 
    id: '2', empId: 'EMP-22045', nameEn: 'Wipada Saengngam', dept: 'Quality Assurance', jobTitle: 'QA Manager', 
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    skills: { technical: 4, communication: 5, leadership: 5, problemSolving: 4 },
    avgScore: 4.50, readiness: 'High Potential'
  },
  { 
    id: '3', empId: 'EMP-24050', nameEn: 'Sommai Jaidee', dept: 'Production', jobTitle: 'Production Supervisor', 
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    skills: { technical: 5, communication: 2, leadership: 4, problemSolving: 3 },
    avgScore: 3.50, readiness: 'Training Needed'
  }
];

const DEPARTMENTS = ['ALL', 'Information Technology', 'Sales', 'Marketing', 'Production', 'Human Resources', 'Quality Assurance'];
const READINESS_LEVELS = ['Training Needed', 'Stable Performer', 'High Potential', 'Ready for Promotion'];

// --- Edit Skill Matrix Modal ---
function EditSkillModal({ isOpen, onClose, record, onSave }: { isOpen: boolean; onClose: () => void; record: SkillProfile | null; onSave: (data: SkillProfile) => void }) {
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      if (record) {
        setFormData(JSON.parse(JSON.stringify(record)));
      } else {
        setFormData({
          id: `SKILL-${Date.now()}`,
          empId: `EMP-${String(Math.floor(Math.random() * 90000) + 10000)}`,
          nameEn: '',
          dept: 'Information Technology',
          jobTitle: '',
          image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          skills: { technical: 3, communication: 3, leadership: 3, problemSolving: 3 },
          avgScore: 3.0,
          readiness: 'Stable Performer'
        });
      }
    }
  }, [isOpen, record]);

  if (!isOpen || !formData) return null;

  const handleScoreChange = (skillKey: string, value: number) => {
    setFormData((prev: any) => {
      const updatedSkills = { ...prev.skills, [skillKey]: value };
      const values = Object.values(updatedSkills) as number[];
      const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
      return {
        ...prev,
        skills: updatedSkills,
        avgScore: avg
      };
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameEn || !formData.jobTitle) {
      alert('กรุณากรอกข้อมูลพนักงานให้ครบถ้วน');
      return;
    }
    onSave(formData);
    onClose();
  };

  const ScoreBlock = ({ label, skillKey, val, color }: any) => (
    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{label}</label>
        <span className="text-[14px] font-extrabold font-mono" style={{ color }}>{val} / 5</span>
      </div>
      <input 
        type="range" min="1" max="5" step="1" value={val} 
        onChange={(e) => handleScoreChange(skillKey, Number(e.target.value))}
        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-200 accent-[#212c46]" 
      />
    </div>
  );

  return (
    <DraggableModal isOpen={isOpen} onClose={onClose} title={<div className="flex items-center gap-2"><Layers size={16}/><span>{record ? 'UPDATE TALENT SKILL MATRIX' : 'EVALUATE NEW EMPLOYEE'}</span></div>} width="max-w-2xl">
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-5 custom-scrollbar text-[12px] text-[#212c46]">
        {/* Core Profile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <label className="text-[10px] font-black text-[#a94228] uppercase tracking-widest block mb-2">Employee Name / ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
            <input type="text" name="nameEn" value={formData.nameEn} onChange={handleChange} required placeholder="e.g. Somchai Mungmun" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-[12px] font-extrabold outline-none focus:border-[#212c46] focus:bg-white text-[#212c46] transition-colors" />
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <label className="text-[10px] font-black text-[#a94228] uppercase tracking-widest block mb-2">Job Position / ตำแหน่งงาน <span className="text-red-500">*</span></label>
            <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} required placeholder="e.g. Senior Fullstack Developer" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-[12px] font-bold outline-none focus:border-[#212c46] focus:bg-white text-[#212c46] transition-colors" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <label className="text-[10px] font-black text-slate-500 block mb-2 uppercase tracking-wider">Department</label>
            <select name="dept" value={formData.dept} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[11px] font-black outline-none focus:border-[#212c46] text-[#212c46] transition-colors cursor-pointer">
              {DEPARTMENTS.filter(d=>d!=='ALL').map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <label className="text-[10px] font-black text-slate-500 block mb-2 uppercase tracking-wider">Readiness Status</label>
            <select name="readiness" value={formData.readiness} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[11px] font-black outline-none focus:border-[#212c46] text-[#212c46] transition-colors cursor-pointer">
              {READINESS_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <label className="text-[10px] font-black text-slate-500 block mb-2 uppercase tracking-wider">Employee ID / รหัสพนักงาน</label>
            <input type="text" name="empId" value={formData.empId} onChange={handleChange} required placeholder="e.g. EMP-24001" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[12px] font-mono font-black text-center" />
          </div>
        </div>

        {/* Skill Core Scales */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-widest border-b pb-1.5">SKILL SCORE SHEETS</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ScoreBlock label="Technical Expertise" skillKey="technical" val={formData.skills.technical} color={THEME.danger} />
            <ScoreBlock label="Communication" skillKey="communication" val={formData.skills.communication} color={THEME.skyBlue} />
            <ScoreBlock label="Leadership & Coordination" skillKey="leadership" val={formData.skills.leadership} color={THEME.gold} />
            <ScoreBlock label="Advanced Problem Solving" skillKey="problemSolving" val={formData.skills.problemSolving} color={THEME.success} />
          </div>
        </div>
      </form>
      
      {/* Footer */}
      <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex justify-end gap-3 shrink-0">
        <button onClick={onClose} className="px-5 py-2 bg-white border border-slate-200 text-[#414757] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
        <button onClick={handleSubmit} className="bg-[#212c46] text-white px-5 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md hover:bg-[#a94228] transition-all flex items-center gap-2"><Save size={14}/> Save Scales</button>
      </div>
    </DraggableModal>
  );
}

// --- Main Page Component ---
export default function SkillMatrix() {
  const [activeTab, setActiveTab] = useState('registry'); // 'registry' or 'settings'
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // DB States
  const [employees, setEmployees] = useState<SkillProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination configs matching UserPermissions
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals & Toasts
  const [editModal, setEditModal] = useState<{ isOpen: boolean; record: SkillProfile | null }>({ isOpen: false, record: null });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Settings State matching standard of UserPermissions
  const [skillsConfigMap, setSkillsConfigMap] = useState<any>({ 'technical': false, 'soft_skills': true });
  const [policiesExpanded, setPoliciesExpanded] = useState<any>({ corporate: true, standard: true });

  const showToast = (message: string, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  useEffect(() => {
    const fetchAndLoad = async () => {
      try {
        setIsLoading(true);
        const records = await dbSync.read('skill_matrix');
        if (records && records.length > 0) {
          setEmployees(records);
        } else {
          // Initialize/Seed standard records
          await dbSync.write('skill_matrix', INITIAL_SKILLS);
          setEmployees(INITIAL_SKILLS);
          showToast('Initialized Skill Matrix Database with original template records.', 'success');
        }
      } catch (err) {
        console.error('Failed to resolve database collections, falling back, error: ', err);
        setEmployees(INITIAL_SKILLS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndLoad();
  }, []);

  // Filter & Search logic
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const query = search.toLowerCase();
      const matchSearch = emp.nameEn.toLowerCase().includes(query) || 
                          emp.empId.toLowerCase().includes(query) || 
                          emp.jobTitle.toLowerCase().includes(query);
      const matchDept = selectedDept === 'ALL' || emp.dept === selectedDept;
      return matchSearch && matchDept;
    });
  }, [employees, search, selectedDept]);

  // Pagination slices
  const currentData = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredEmployees, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage) || 1;

  // KPIs
  const kpiData = useMemo(() => {
    const total = employees.length;
    const avg = total > 0 ? (employees.reduce((sum, e) => sum + e.avgScore, 0) / total).toFixed(2) : '0';
    const promotion = employees.filter(e => e.readiness === 'Ready for Promotion').length;
    const stable = employees.filter(e => e.readiness === 'Stable Performer' || e.readiness === 'High Potential').length;
    return { total, avg, promotion, stable };
  }, [employees]);

  // Track page reset on filter shifts
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedDept]);

  const saveSkillRecord = async (savedNode: SkillProfile) => {
    try {
      let updatedList = [];
      const exists = employees.find(e => e.id === savedNode.id);
      if (exists) {
        updatedList = employees.map(e => e.id === savedNode.id ? savedNode : e);
        await dbSync.update('skill_matrix', [savedNode]);
        showToast(`แก้ไขระเบียนทักษะ ${savedNode.empId} เรียบร้อยแล้ว`, 'success');
      } else {
        updatedList = [savedNode, ...employees];
        await dbSync.write('skill_matrix', [savedNode]);
        showToast(`ลงทะเบียนและพิจารณาทักษะของ ${savedNode.nameEn} เรียบร้อยแล้ว`, 'success');
      }
      setEmployees(updatedList);
    } catch (err) {
      console.error(err);
      showToast('ปัญหาเชื่อมต่อฐานข้อมูล', 'danger');
    }
  };

  const deleteSkillRecord = async (id: string, code: string) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะลบระเบียบประเมินทักษะของ ${code}?`)) return;
    try {
      const recordsToKeep = employees.filter(e => e.id !== id);
      const recordToDelete = employees.find(e => e.id === id);
      if (recordToDelete) {
        await dbSync.delete('skill_matrix', [recordToDelete]);
        setEmployees(recordsToKeep);
        showToast(`ลบข้อมูลทักษะพนักงาน ${code} เรียบร้อย`, 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('ระบบล้มเหลวในการส่งข้อมูลลบ', 'danger');
    }
  };

  const toggleConfigLock = (id: string) => {
    setSkillsConfigMap((prev: any) => ({ ...prev, [id]: !prev[id] }));
    showToast('ปรับปรุงนโยบายความปลอดภัยการเข้าถึงความรอบรู้แล้ว', 'success');
  };

  return (
    <div className="flex flex-1 w-full flex-col animate-fadeIn bg-transparent space-y-4 pb-6 min-h-0">
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
      {/* Action Guide Floating Trigger */}
      <button onClick={() => setIsGuideOpen(true)} className="fixed right-0 bg-[#f8f9fa] border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#a94228] hover:text-white hover:border-[#a94228] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group" style={{ top: '140px' }}>
        <HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#7a8b95] group-hover:text-white" />
        <span className="font-bold tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[10px]">USER GUIDE</span>
      </button>
      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <EditSkillModal isOpen={editModal.isOpen} onClose={() => setEditModal({ isOpen: false, record: null })} record={editModal.record} onSave={saveSkillRecord} />
      {/* PAGE HEADER SECTION: Transparent Background, placed straight on the canvas */}
      <div className="h-14 px-8 flex flex-row items-center justify-between gap-4 z-20 shrink-0">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center group cursor-default shrink-0">
            <div className="absolute inset-0 bg-[#3f809e] blur-[15px] opacity-20 rounded-full group-hover:opacity-60 transition-all duration-700"></div>
            <div className="relative z-10 p-1.5 border border-[#3f809e]/40 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm">
              <BrainCircuit size={28} strokeWidth={2.5} className="text-[#3f809e]" />
            </div>
          </div>
          <div>
            <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none" style={{ fontSize: '24px' }}>
              TALENT <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3f809e] to-[#b58c4f]">SKILL MATRIX</span>
            </h3>
            <p className="text-[11px] font-bold text-[#4d5a44] uppercase tracking-[0.2em] mt-0.5 opacity-80 leading-none">
              Competence Directory & Technical Mapping Node
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
              label="Average Group Score"
              value={kpiData.avg}
              iconName="BarChart3"
              color={THEME.skyBlue}
              description="Across Assessed Users" />
            <KpiCard
              label="Promotion Success Track"
              value={kpiData.promotion}
              iconName="Award"
              color={THEME.gold}
              description="Exceeds Core Competence" />
            <KpiCard
              label="Stable Performers"
              value={kpiData.stable}
              iconName="UserCheck"
              color={THEME.success}
              description="Certified Talent" />
            <KpiCard
              label="Functional Candidates"
              value={kpiData.total}
              iconName="AlertTriangle"
              color={THEME.accent}
              description="Managed Profiles" />
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
                    <input type="text" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search personnel name or ID..." className="w-full pl-11 pr-5 py-2 text-[12px] border border-[#eaeaec] rounded-xl font-bold outline-none focus:border-[#b58c4f] bg-white text-[#212c46] shadow-sm transition-all" />
                  </div>
                </div>

                <button onClick={() => setEditModal({ isOpen: true, record: null })} className="bg-[#212c46] hover:bg-[#a94228] text-white px-5 py-2 rounded-xl font-black text-[12px] uppercase tracking-widest shadow-md transition-all flex items-center gap-2 border border-transparent cursor-pointer shrink-0">
                  <Plus size={16} /> Evaluate Talent
                </button>
              </div>

              {/* Table conforming to the strict specific guidelines */}
              <div className="overflow-auto custom-scrollbar  flex-1 min-h-0">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-[#222b38] text-white border-b-2 border-[#709654]">
                      <th className="py-4 px-6 text-[12px] font-black uppercase tracking-widest whitespace-nowrap">Personnel Profile</th>
                      <th className="py-4 px-4 text-[12px] font-black uppercase tracking-widest text-center whitespace-nowrap">Technical</th>
                      <th className="py-4 px-4 text-[12px] font-black uppercase tracking-widest text-center whitespace-nowrap">Communication</th>
                      <th className="py-4 px-4 text-[12px] font-black uppercase tracking-widest text-center whitespace-nowrap">Leadership</th>
                      <th className="py-4 px-4 text-[12px] font-black uppercase tracking-widest text-center whitespace-nowrap">Problem Solving</th>
                      <th className="py-4 px-6 text-[12px] font-black uppercase tracking-widest text-right whitespace-nowrap">Score Index</th>
                      <th className="py-4 px-6 text-[12px] font-black uppercase tracking-widest text-center whitespace-nowrap">Promotion Readiness</th>
                      <th className="py-4 px-6 text-[12px] font-black uppercase tracking-widest text-center whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#eaeaec]">
                    {currentData.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="py-2.5 px-6 font-black text-[12px]">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#eaeaec] bg-slate-50 relative shrink-0">
                              <img src={emp.image} className="w-full h-full object-cover" onError={(e: any)=>{e.target.src='https://cdn-icons-png.flaticon.com/512/149/149071.png'}} />
                            </div>
                            <div>
                              <p className="text-[#212c46] tracking-tight text-[12px] font-black">{emp.nameEn}</p>
                              <p className="text-[#7a8b95] text-[10px] font-bold uppercase tracking-wider">{emp.jobTitle} ({emp.dept})</p>
                            </div>
                          </div>
                        </td>

                        {/* Technical Score with Compact Visual Bar */}
                        <td className="py-2.5 px-4 text-center text-[12px]">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-mono font-black text-[#a94228]">{emp.skills.technical}</span>
                            <div className="w-10 h-1.5 bg-[#eaeaec] rounded-full overflow-hidden border">
                              <div className="h-full bg-[#a94228] rounded-full" style={{ width: `${(emp.skills.technical / 5) * 100}%` }}></div>
                            </div>
                          </div>
                        </td>

                        {/* Communication Score */}
                        <td className="py-2.5 px-4 text-center text-[12px]">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-mono font-black text-[#3f809e]">{emp.skills.communication}</span>
                            <div className="w-10 h-1.5 bg-[#eaeaec] rounded-full overflow-hidden border">
                              <div className="h-full bg-[#3f809e] rounded-full" style={{ width: `${(emp.skills.communication / 5) * 100}%` }}></div>
                            </div>
                          </div>
                        </td>

                        {/* Leadership Score */}
                        <td className="py-2.5 px-4 text-center text-[12px]">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-mono font-black text-[#b58c4f]">{emp.skills.leadership}</span>
                            <div className="w-10 h-1.5 bg-[#eaeaec] rounded-full overflow-hidden border">
                              <div className="h-full bg-[#b58c4f] rounded-full" style={{ width: `${(emp.skills.leadership / 5) * 100}%` }}></div>
                            </div>
                          </div>
                        </td>

                        {/* Problem Solving Score */}
                        <td className="py-2.5 px-4 text-center text-[12px]">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-mono font-black text-[#657f4d]">{emp.skills.problemSolving}</span>
                            <div className="w-10 h-1.5 bg-[#eaeaec] rounded-full overflow-hidden border">
                              <div className="h-full bg-[#657f4d] rounded-full" style={{ width: `${(emp.skills.problemSolving / 5) * 100}%` }}></div>
                            </div>
                          </div>
                        </td>

                        {/* Average index formatted */}
                        <td className="py-2.5 px-6 text-right font-black text-[12px]">
                          <span className="font-mono text-[#2f2926] bg-[#f8f9fa] px-2 py-1 rounded border border-slate-200">{emp.avgScore.toFixed(2)}</span>
                        </td>

                        {/* Development Status Badge adjusted smaller to 11px */}
                        <td className="py-2.5 px-6 text-center text-[11px]">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] border font-black uppercase tracking-wider
                            ${emp.readiness === 'Ready for Promotion' ? 'bg-[#657f4d]/10 text-[#657f4d] border-[#657f4d]/30' : 
                              emp.readiness === 'High Potential' ? 'bg-[#3f809e]/10 text-[#3f809e] border-[#3f809e]/30' : 
                              emp.readiness === 'Stable Performer' ? 'bg-[#b58c4f]/10 text-[rgb(181,140,79)] border-[#b58c4f]/30' : 
                              'bg-[#932c2e]/10 text-[#932c2e] border-[#932c2e]/30'}`}>
                            {emp.readiness}
                          </span>
                        </td>

                        {/* Actions complying with (w-8 h-8, gap-[1px]) */}
                        <td className="py-2.5 px-6 text-center text-[12px]">
                          <div className="flex justify-center items-center gap-[1px]">
                            <button onClick={() => setEditModal({ isOpen: true, record: emp })} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#3f809e] bg-[#3f809e]/10 hover:bg-[#3f809e]/20 transition-all font-black" title="Edit Assessment">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => deleteSkillRecord(emp.id, emp.nameEn)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#932c2e] bg-[#932c2e]/10 hover:bg-[#932c2e]/20 transition-all font-black" title="Delete Profile">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {currentData.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-12 bg-white text-center text-[#7a8b95] font-bold text-[12px] uppercase tracking-widest">
                          ไม่มีข้อมูลผลทักษะตามเงื่อนไขที่เลือก
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
                  <p className="bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm font-mono text-[11px]">Total: {filteredEmployees.length} Records</p>
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
                  <ShieldCheck size={20} className="text-[#b7a159]" /> COMPLIANCE POLICIES
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-700 font-black text-[12px] uppercase tracking-widest mb-1.5"><Clock size={16}/> ISO Auditing Lock</div>
                    <p className="text-[12px] text-[#606a5f] font-bold leading-relaxed">การปรับคะแนนต้องทำผ่านขั้นตอน SOP ประจำแผนก และทำการบันทึก Log การเข้าถึงทุกครั้ง</p>
                  </div>
                  <div className="p-4 bg-[#932c2e]/10 border border-[#932c2e]/30 rounded-xl">
                    <div className="flex items-center gap-2 text-[#932c2e] font-black text-[12px] uppercase tracking-widest mb-1.5"><Lock size={16}/> Confidential Area</div>
                    <p className="text-[12px] text-[#606a5f] font-bold leading-relaxed">ข้อมูลทักษะรายบุคคลถือเป็นความลับสูงสุด ห้ามส่งออกไปภายนอกองค์กรโดยไม่มีการอนุมัติลายลักษณ์อักษร</p>
                  </div>
                </div>
              </div>
              {/* Right Side: Skills Registry Control Mapping */}
              <div className="lg:col-span-8 bg-white rounded-3xl shadow-lg border border-[#eaeaec] overflow-hidden">
                <div className="p-6 bg-[#f8f9fa] border-b border-[#eaeaec]">
                  <h4 className="text-[14px] font-black uppercase text-[#212c46] tracking-widest flex items-center gap-3">
                    <ListTree size={20} className="text-[#b7a159]"/> COMPETENCE CLUSTER LOCKS
                  </h4>
                </div>
                <div className="p-6 space-y-3">
                  {[
                    { id: 'technical', label: 'TECHNICAL CAPABILITY GROUP', desc: 'ทักษะความรู้เฉพาะทาง เช่น วิศวกรรม แปรรูป ซอฟต์แวร์ คลาวด์ และมาตรฐาน ISO' },
                    { id: 'soft_skills', label: 'BEHAVIORAL & SOFT SKILLS CLUSTER', desc: 'ความสามารถการสื่อสาร การทำงานเป็นทีม การแก้ปัญหา และการนำแผนก' }
                  ].map(cluster => (
                    <div key={cluster.id} className={`flex items-center justify-between px-5 py-3 rounded-2xl border transition-all ${skillsConfigMap[cluster.id] ? 'bg-[#932c2e]/5 border-[#932c2e]/30 shadow-sm' : 'bg-white border-[#eaeaec] hover:border-[#4d87a8]'}`}>
                      <div>
                        <span className="font-black text-[#212c46] text-[13px] uppercase tracking-widest block">{cluster.label}</span>
                        <span className="text-[11px] text-[#7a8b95] font-medium block mt-0.5">{cluster.desc}</span>
                        <span className={`text-[10px] font-black uppercase tracking-wider block mt-1.5 ${skillsConfigMap[cluster.id] ? 'text-[#932c2e]' : 'text-[#657f4d]'}`}>Status: {skillsConfigMap[cluster.id] ? 'Locked Confidential' : 'Open for Verifiers'}</span>
                      </div>
                      <button onClick={()=>toggleConfigLock(cluster.id)} className={`p-2 rounded-xl transition-all shadow-sm active:scale-90 ${skillsConfigMap[cluster.id] ? 'bg-[#932c2e] text-white' : 'bg-white text-[#7a8b95] border border-[#eaeaec] hover:bg-[#f8f9fa]'}`}>
                        {skillsConfigMap[cluster.id] ? <Lock size={18}/> : <Eye size={18}/>}
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
