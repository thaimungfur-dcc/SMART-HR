import { UserGuidePanel } from '../../components/shared/UserGuidePanel';
import KpiCard from '../../components/shared/KpiCard';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';
import { 
  Heart, Users, BarChart3, Search, Filter, Plus, ChevronLeft, 
  ChevronRight, Edit3, Trash2, HelpCircle, X, CheckCircle2, 
  Clock, Calendar, Save, Info, Smile, Send, 
  ArrowUpRight, MessageSquare, ClipboardCheck, BrainCircuit,
  Target, Settings, ChevronDown, AlertTriangle, Landmark, CalendarDays,
  FileSpreadsheet, Activity, TrendingUp, HelpCircle as HelpIcon, ShieldAlert
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

const MOCK_SURVEYS = [
  { 
    id: 'SUR-2024-001', 
    title: 'แบบสำรวจความพึงพอใจพนักงาน Q1/2024', 
    category: 'Engagement', 
    participants: 120, 
    totalStaff: 150,
    score: 85,
    enps: 42,
    status: 'Published', 
    startDate: '2024-01-01', 
    endDate: '2024-01-15',
    aiSync: true,
    questions: 10
  },
  { 
    id: 'SUR-2024-002', 
    title: 'Work-Life Balance Survey 2024', 
    category: 'Well-being', 
    participants: 85, 
    totalStaff: 150,
    score: 52,
    enps: 15,
    status: 'Published', 
    startDate: '2024-03-01', 
    endDate: '2024-03-31',
    aiSync: true,
    questions: 12,
    riskLevel: 'High'
  },
  { 
    id: 'SUR-2024-003', 
    title: 'Internal Communication Feedback', 
    category: 'Relationship', 
    participants: 45, 
    totalStaff: 150,
    score: 64,
    enps: -5,
    status: 'Draft', 
    startDate: '2024-05-01', 
    endDate: '2024-05-15',
    aiSync: false,
    questions: 8
  },
  { 
    id: 'SUR-2024-004', 
    title: 'Annual Leadership Review', 
    category: 'Management', 
    participants: 150, 
    totalStaff: 150,
    score: 91,
    enps: 68,
    status: 'Closed', 
    startDate: '2023-12-01', 
    endDate: '2023-12-20',
    aiSync: true,
    questions: 15
  }
];

interface SurveyRecord {
  id?: string;
  title: string;
  category: string;
  participants: number;
  totalStaff: number;
  score: number;
  enps: number;
  status: string;
  startDate: string;
  endDate: string;
  aiSync: boolean;
  questions: number;
  riskLevel?: string;
}

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  survey: SurveyRecord | null;
  onSave: (survey: SurveyRecord) => void;
}

const SurveyModal = ({ isOpen, onClose, survey: activeSurvey, onSave }: SurveyModalProps) => {
  const [formData, setFormData] = useState<SurveyRecord>({ 
    title: '', category: 'Engagement', status: 'Draft', startDate: '', endDate: '', questions: 10, aiSync: true, participants: 0, totalStaff: 150, score: 0, enps: 0
  });

  useEffect(() => {
    if (activeSurvey) {
      setFormData({ ...activeSurvey });
    } else {
      setFormData({ 
        title: '', category: 'Engagement', status: 'Draft', startDate: '', endDate: '', questions: 10, aiSync: true, participants: 0, totalStaff: 150, score: 0, enps: 0
      });
    }
  }, [activeSurvey, isOpen]);

  if (!isOpen) return null;
  return (
    <DraggableModal
        isOpen={isOpen}
        onClose={onClose}
        width="max-w-[750px]"
        customHeader={
            <div className="bg-[#212c46] px-5 py-4 flex justify-between items-center text-[#f3f3f1] shrink-0 border-b-2 border-[#b58c4f]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <ClipboardCheck size={20} className="text-[#3f809e]"/>
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest">
                  {activeSurvey ? 'Management Survey Node' : 'Initialize New Survey'}
                </h3>
              </div>
              <button type="button" onClick={onClose} className="hover:text-[#b22026] text-white/70 transition-colors p-1.5 bg-white/10 hover:bg-white/20 rounded-full"><X size={16}/></button>
            </div>
        }
    >
        <div className="flex-1 flex flex-col overflow-hidden bg-white max-h-[75vh]">
          <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest ml-1">Survey Title</label>
              <div className="relative">
                <FileSpreadsheet size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3f809e]"/>
                <input 
                  type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full pl-11 pr-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#3f809e] text-[12px] font-bold"
                  placeholder="ระบุชื่อแบบสำรวจ..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest ml-1">Survey Category</label>
                <select 
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#3f809e] text-[12px] font-bold cursor-pointer"
                >
                  <option value="Engagement">Engagement (ความผูกพัน)</option>
                  <option value="Well-being">Well-being (ความสุข)</option>
                  <option value="Relationship">Relationship (ความสัมพันธ์)</option>
                  <option value="Management">Management (การบริหาร)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest ml-1">Lifecycle Status</label>
                <select 
                  value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#3f809e] text-[12px] font-bold cursor-pointer"
                >
                  <option value="Draft">Draft (ฉบับร่าง)</option>
                  <option value="Published">Published (เผยแพร่)</option>
                  <option value="Closed">Closed (ปิดรับข้อมูล)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest ml-1">Start Date</label>
                <div className="relative">
                  <Calendar size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3f809e]"/>
                  <input 
                    type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})}
                    className="w-full pl-11 pr-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#3f809e] text-[12px] font-bold"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest ml-1">End Date</label>
                <div className="relative">
                  <Calendar size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b22026]"/>
                  <input 
                    type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})}
                    className="w-full pl-11 pr-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b22026] text-[12px] font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest ml-1">Number of Questions</label>
                <input 
                  type="number" value={formData.questions} onChange={e => setFormData({...formData, questions: Number(e.target.value)})}
                  className="w-full px-4 py-2 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#3f809e] text-[12px] font-bold"
                  placeholder="e.g. 10"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#508660] uppercase tracking-widest ml-1">Target Respondents</label>
                <input 
                  type="number" value={formData.totalStaff} onChange={e => setFormData({...formData, totalStaff: Number(e.target.value)})}
                  className="w-full px-4 py-2 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#508660] text-[12px] font-bold"
                  placeholder="e.g. 150"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#b58c4f] uppercase tracking-widest ml-1">Survey participants</label>
                <input 
                  type="number" value={formData.participants} onChange={e => setFormData({...formData, participants: Number(e.target.value)})}
                  className="w-full px-4 py-2 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b58c4f] text-[12px] font-bold"
                  placeholder="e.g. 85"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest ml-1">Current Score (%)</label>
                <input 
                  type="number" value={formData.score} onChange={e => setFormData({...formData, score: Number(e.target.value)})}
                  className="w-full px-4 py-2 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#3f809e] text-[12px] font-bold font-mono"
                  placeholder="e.g. 75"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest ml-1">Net Promoter Score (eNPS)</label>
                <input 
                  type="number" value={formData.enps} onChange={e => setFormData({...formData, enps: Number(e.target.value)})}
                  className="w-full px-4 py-2 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#3f809e] text-[12px] font-bold font-mono"
                  placeholder="e.g. 35"
                />
              </div>
            </div>

            {/* AI COPAILOT INTEGRATED SYNERGY CARD */}
            <div className="p-4 bg-[#3f809e]/15 border border-[#3f809e]/30 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-[#3f809e]/25 shadow-xs shrink-0">
                  <BrainCircuit size={18} className="text-[#3f809e]"/>
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase text-[#212c46] tracking-wider block">AI Copilot Sync Engine</span>
                  <p className="text-[9px] font-bold text-[#606a5f]">Sync Engagement Score to Attrition Analysis systems</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[9px] font-black uppercase tracking-widest ${formData.aiSync ? 'text-[#508660]' : 'text-[#7a8b95]'}`}>{formData.aiSync ? 'Synchronized' : 'Disabled'}</span>
                <button type="button" onClick={() => setFormData({...formData, aiSync: !formData.aiSync})} className={`w-9 h-5 rounded-full relative transition-all ${formData.aiSync ? 'bg-[#508660]' : 'bg-slate-200'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-xs transition-all ${formData.aiSync ? 'left-[18px]' : 'left-0.5'}`}/>
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-[#f8fafc] border-t border-slate-100 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-1.5 text-[9px] text-[#7a8b95] font-mono font-black uppercase tracking-widest">
              <Info size={13}/> AI analysis will lock on publish and sync automatically
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest text-[#606a5f] hover:bg-[#f3f3f1] border border-[#eaeaec] bg-white cursor-pointer hover:text-[#2f2926]">
                Cancel
              </button>
              <button type="button" onClick={() => { onSave(formData); onClose(); }} className="px-5 py-2 bg-[#212c46] text-white rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-[#3f809e] shadow-xs active:scale-95 border border-[#1d2636] cursor-pointer">
                <Save size={14}/> Save Database
              </button>
            </div>
          </div>
        </div>
    </DraggableModal>
  );
};

export default function EngagementRelationship() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; survey: SurveyRecord | null }>({ isOpen: false, survey: null });
  const [surveys, setSurveys] = useState<SurveyRecord[]>(MOCK_SURVEYS);
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
    const counts: Record<string, number> = { All: surveys.length };
    surveys.forEach(s => counts[s.category] = (counts[s.category] || 0) + 1);
    return counts;
  }, [surveys]);

  const filteredSurveys = useMemo(() => {
    return surveys.filter(s => 
      (activeFilter === 'All' || s.category === activeFilter) &&
      (s.title.toLowerCase().includes(search.toLowerCase()) || (s.id && s.id.toLowerCase().includes(search.toLowerCase())))
    );
  }, [surveys, search, activeFilter]);

  const handleSave = (surveyData: SurveyRecord) => {
    if (surveyData.id) {
      setSurveys(surveys.map(s => s.id === surveyData.id ? surveyData : s));
      setToast('ปรับปรุงแบบสำรวจความสุขพนักงานสำเร็จเรียบร้อยค่ะ');
    } else {
      const newSurvey = { 
        ...surveyData, 
        id: `SUR-2024-${Math.floor(100 + Math.random() * 900)}`, 
        participants: 0,
        totalStaff: surveyData.totalStaff || 150,
        score: surveyData.score || 0,
        enps: surveyData.enps || 0
      };
      setSurveys([newSurvey, ...surveys]);
      setToast('สร้างข้อมูลสิทธิ์แบบสำรวจตัวใหม่ในระบบและจับคู่ AI สำเร็จ');
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = (id: string) => {
    if(window.confirm('ยืนยันระบบการลบข้อมูลแบบสำรวจความพึงพอใจพนักงานตัวนี้? ข้อมูลวิเคราะห์พฤติกรรมสะสมจะอันตรธานหายไปถาวรค่ะ')) {
        setSurveys(surveys.filter(s => s.id !== id));
        setToast('ลบรายการโครงสร้างแบบสำรวจพนักงานออกถาวรเรียบร้อย');
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
      <SurveyModal isOpen={modal.isOpen} onClose={() => setModal({isOpen: false, survey: null})} survey={modal.survey} onSave={handleSave} />
      {/* TOAST SYSTEM */}
      {toast && createPortal(
        <div className="fixed bottom-6 right-6 z-[1000] animate-fadeIn bg-white border-l-4 border-[#3f809e] shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-5 py-4 rounded-xl flex items-center gap-3">
            <CheckCircle2 size={18} className="text-[#3f809e]" />
            <span className="text-[11px] font-black text-[#212c46] uppercase tracking-widest font-mono">{toast}</span>
            <button onClick={() => setToast(null)} className="ml-4 text-[#64748b] hover:text-[#b22026] cursor-pointer"><X size={14}/></button>
        </div>,
        document.body
      )}
      {/* PAGE HEADER SECTION: TRANSPARENT BACKGROUND & EMBEDDED DIRECTLY IN PAGE */}
      <div className="h-14 px-8 flex flex-row items-center justify-between gap-4 z-20 shrink-0 bg-transparent">
          <div className="flex items-center gap-5">
              <div className="relative flex items-center justify-center group cursor-default shrink-0">
                  <div className="absolute inset-0 bg-[#3f809e] blur-[15px] opacity-20 rounded-full group-hover:opacity-60 transition-all duration-700"></div>
                  <div className="relative z-10 p-1.5 border border-[#3f809e]/40 rounded-xl bg-white/50 backdrop-blur-xs shadow-xs">
                      <Heart size={28} strokeWidth={2.5} className="text-[#3f809e]" />
                  </div>
              </div>
              <div>
                  <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none" style={{ fontSize: '24px' }}>
                      ENGAGEMENT & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3f809e] to-[#b58c4f]">RELATIONSHIP</span>
                  </h3>
                  <p className="text-[11px] font-bold text-[#4d5a44] uppercase tracking-[0.2em] mt-0.5 opacity-80 leading-none">
                      EMPLOYEE ENGAGEMENT & INSIGHT SYSTEM
                  </p>
              </div>
          </div>

          <div className="flex items-center gap-4">
              <button 
                onClick={() => setModal({isOpen: true, survey: null})}
                className="px-6 py-2.5 bg-[#212c46] text-[#f3f3f1] rounded-xl text-[11px] font-black uppercase tracking-widest shadow-md hover:bg-[#3f809e] transition-all flex items-center gap-2 active:scale-95 cursor-pointer border border-[#212c46]"
              >
                <Plus size={16} /> Create Survey
              </button>
          </div>
      </div>
      <div className="px-4 sm:px-8 w-full mt-[2px]">
        <div className="w-full">
            
            {/* KPI STATS CARDS - LEAN AND COMPACT AS REQUESTED */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3 shrink-0">
                <KpiCard label="Engagement Score" value="78.5%" icon={Smile} color={THEME.palette.forest} description="Average Score" />
                <KpiCard label="Employee nPS" value="+24" icon={Users} color={THEME.palette.cerulean} description="Advocacy Level" />
                <KpiCard label="AI Risk Analysis" value={surveys.filter(s => s.score < 60 && s.aiSync).length} icon={BrainCircuit} color={THEME.palette.burntOrange} description="Turnover Alert" />
                <KpiCard label="Feedbacks Recv." value="250" icon={MessageSquare} color={THEME.palette.plum} description="Inbound Insights" />
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="bg-white/90 rounded-3xl shadow-lg border border-[#eaeaec] overflow-hidden flex flex-col animate-fadeIn  flex-1 min-h-0">
                
                {/* FILTER & SEARCH */}
                <div className="px-8 py-4 border-b border-[#eaeaec] bg-[#f8f9fa] flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative" ref={dropdownRef}>
                          <button 
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center justify-between gap-3 px-4 py-2 bg-[#f3f3f1] border border-slate-200 rounded-xl min-w-[200px] text-[11px] font-black uppercase tracking-widest text-[#414757] hover:bg-white transition-all shadow-xs active:scale-95 cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                                <Filter size={14} className="text-[#b58c4f]"/>
                                {activeFilter === 'All' ? 'Filter: Global Survey' : `Type: ${activeFilter}`}
                            </div>
                            <ChevronDown size={14} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`}/>
                          </button>

                          {isFilterOpen && (
                            <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-[#939885]/20 z-[100] overflow-hidden animate-fadeIn">
                                {['All', 'Engagement', 'Well-being', 'Relationship', 'Management'].map((cat) => (
                                    <button 
                                        key={cat}
                                        type="button"
                                        onClick={() => { setActiveFilter(cat); setIsFilterOpen(false); }}
                                        className={`w-full px-4 py-3 text-[11px] font-black uppercase tracking-widest text-left flex items-center justify-between hover:bg-[#f3f3f1] transition-all cursor-pointer ${activeFilter === cat ? 'bg-[#212c46]/5 text-[#3f809e]' : 'text-[#414757]'}`}
                                    >
                                        <span>{cat}</span>
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-black ${activeFilter === cat ? 'bg-[#3f809e] text-white' : 'bg-[#eaeaec] text-[#7a8b95]'}`}>
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
                              placeholder="Search surveys or ID..." 
                              className="w-full pl-12 pr-6 py-2.5 text-[12px] border border-[#eaeaec] rounded-full font-bold outline-none focus:border-[#b7a159] bg-white shadow-sm text-[#212c46]" 
                            />
                        </div>
                    </div>
                </div>

                {/* TABLE STREAM - CUSTOM STYLES ACCORDING TO USER REQUIREMENT */}
                <div className="overflow-auto custom-scrollbar  flex-1 min-h-0">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead className="bg-[#222b38] text-white">
                            <tr className="border-b-2 border-[#709654]">
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">Survey ID</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap font-sans">Survey Identity & AI Insights</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Schedule</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Participants</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Status</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#eaeaec]">
                            {filteredSurveys.map(s => (
                                <tr key={s.id} className="hover:bg-[#f8f9fa] transition-colors group">
                                    <td className="py-2.5 px-4 font-mono font-black text-[#7a8b95] text-[12px]">{s.id}</td>
                                    <td className="py-2.5 px-4">
                                        <div className="flex flex-col text-[12px]">
                                            <div className="flex items-center gap-2">
                                              <span className="font-black text-[#2f2926] text-[12px] uppercase group-hover:text-[#3f809e] transition-colors">{s.title}</span>
                                              {s.aiSync && <BrainCircuit size={14} className="text-[#3f809e]" title="AI Copilot Synchronized"/>}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 opacity-75 group-hover:opacity-100 transition-opacity">
                                              <span className="text-[10px] text-[#b58c4f] font-black uppercase tracking-widest font-mono"><Landmark size={10}/> {s.category}</span>
                                              <span className={`text-[10px] font-black uppercase font-mono ${s.score > 70 ? 'text-[#508660]' : 'text-[#b22026]'}`}>SCORE: {s.score}%</span>
                                              {s.score < 60 && s.score > 0 && s.aiSync && (
                                                  <span className="flex items-center gap-1 text-[10px] font-black uppercase font-mono text-[#b22026] animate-pulse">
                                                      <AlertTriangle size={10}/> TURNOVER RISK DETECTED
                                                  </span>
                                              )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-4 text-center">
                                        <div className="flex flex-col items-center justify-center gap-0.5 text-[12px]">
                                          <span className="font-bold text-[#414757] font-mono">{s.startDate}</span>
                                          <div className="w-[1px] h-2 bg-[#939885]/40"></div>
                                          <span className="font-bold text-[#b22026] font-mono">{s.endDate}</span>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-4 text-center">
                                        <div className="flex flex-col items-center justify-center text-[12px]">
                                           <div className="font-black text-[#212c46] font-mono text-[12px]">{s.participants} / {s.totalStaff}</div>
                                           <div className="w-24 h-1 bg-[#eaeaec] rounded-full mt-1.5 overflow-hidden">
                                              <div className="h-full bg-[#3f809e]" style={{width: `${(s.participants/(s.totalStaff || 150))*100}%`}}></div>
                                           </div>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-4 text-center">
                                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase border tracking-wider ${s.status === 'Published' ? 'bg-[#508660]/10 text-[#508660] border-[#508660]/30' : s.status === 'Closed' ? 'bg-[#212c46]/10 text-[#212c46] border-[#212c46]/30' : 'bg-[#7a8b95]/10 text-[#7a8b95] border-[#7a8b95]/30'}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-4 text-center">
                                        <div className="flex justify-center items-center gap-[1px]">
                                            <button 
                                                onClick={() => setModal({isOpen: true, survey: s})} 
                                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-[#b58c4f] hover:bg-[#b58c4f] hover:text-white hover:border-[#b58c4f] transition-all active:scale-90 shadow-xs cursor-pointer" 
                                                title="Edit Survey"
                                            >
                                                <Edit3 size={13}/>
                                            </button>
                                            <button 
                                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-[#3f809e] hover:bg-[#3f809e] hover:text-white hover:border-[#3f809e] transition-all active:scale-90 shadow-xs cursor-pointer" 
                                                title="Analytics Hub"
                                            >
                                                <ArrowUpRight size={13}/>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(s.id || '')} 
                                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-[#b22026] hover:bg-[#b22026] hover:text-white hover:border-[#b22026] transition-all active:scale-90 shadow-xs cursor-pointer" 
                                                title="Delete Survey"
                                            >
                                                <Trash2 size={13}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredSurveys.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                      <div className="flex flex-col items-center opacity-30">
                                        <Heart size={48} className="mb-2 text-[#7a8b95]"/>
                                        <p className="text-[12px] font-black uppercase tracking-[0.25em] text-[#2f2926]">ไม่พบข้อมูลแบบสำรวจในระบบ</p>
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
                      <p className="bg-white px-3 py-1.5 rounded-lg border border-[#eaeaec] shadow-xs font-mono">Total Surveys: {filteredSurveys.length}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#508660]"></span>
                        <span>AI Cognitive Node Active</span>
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
