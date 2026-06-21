import { UserGuidePanel } from '../../components/shared/UserGuidePanel';
import KpiCard from '../../components/shared/KpiCard';
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';
import { 
  ClipboardCheck, Search, Plus, Pencil, Trash2, X, Save, ChevronLeft, ChevronRight, 
  HelpCircle, CheckCircle2, AlertTriangle, Building2, Briefcase, 
  Target, Star, FileText, Check, XCircle, Users, Activity,
  TrendingUp, Download, ShieldCheck, MessageSquare, Gauge,
  Award, BarChart3, Fingerprint, Eye, LayoutList, Settings,
  AlertCircle, ShieldAlert, Sliders, Info, RefreshCw, Bell,
  UserCheck, ThumbsUp, ThumbsDown
} from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { DraggableModal } from '../../components/shared/DraggableModal';
import { dbSync } from '../../services/dbSync';
import { useLanguage } from '../../context/LanguageContext';

const MySwal = withReactContent(Swal);

// --- Theme Configuration (Synced perfectly with Home / UserPermissions palette) ---
const THEME = {
  bgMain: '#f3f3f1',
  bgGradient: 'transparent',
  sidebarBg: 'linear-gradient(180deg, #1d2636 0%, #0F172A 100%)',
  glassWhite: 'rgba(255, 255, 255, 0.88)',
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
  coolGray: '#eaeaec',
  palette: { 
    gold: '#b58c4f', rust: '#932c2e', copper: '#c5724e', eggplant: '#503447', maroon: '#851c24', brick: '#b22026', charcoal: '#414757', rose: '#ab7d82', coral: '#d96245', cream: '#f3f3f1', mustard: '#8e9141', salmon: '#d96245', 
    orangeDark: '#AC451b', sage: '#606a5f', umber: '#2f2926', redDark: '#932c2e', paleGreen: '#c4ccbe', bronze: '#8b2c3d', taupe: '#a39b7b', espresso: '#2e1e14', slateDark: '#606a5f', redPrimary: '#b22026', dustyRose: '#a57d76', brickRed: '#851c24', forestDark: '#1b2826', ochre: '#a1691e', sandGold: '#b7a159', tealDark: '#212c46', stone: '#676259', warmGrey: '#7a8b95', blackBrown: '#2f2926', mossGreen: '#657f4d', appleGreen: '#818d47', iceBlue: '#cdd4d6', olive: '#508660', cerulean: '#3f809e', navyBlue: '#212c46', steelBlue: '#4d87a8', midnight: '#2d2c4a', deepNight: '#11141e', mutedBlue: '#748b9e', cocoa: '#866760', teal: '#2b738a', plumDark: '#a54f6b', mustardDark: '#bab98b'
  }
};

interface InterviewFeedback {
  id: string;
  ticketId: string;
  candidate: string;
  jobTitle: string;
  dept: string;
  interviewer: string;
  date: string;
  scores: {
    skills: number;
    culture: number;
    attitude: number;
    potential: number;
  };
  result: 'Qualified' | 'Under Review' | 'Not Qualified';
  comments: string;
}

const INITIAL_RECORDS: InterviewFeedback[] = [
  { 
    id: 'FDB-001', 
    ticketId: 'FDB-2605-01', 
    candidate: 'Anawat Siri', 
    jobTitle: 'Senior Fullstack Developer', 
    dept: 'Information Technology', 
    interviewer: 'Wichai (IT Manager)', 
    date: '2026-05-15', 
    scores: { skills: 9, culture: 8, attitude: 9, potential: 8 }, 
    result: 'Qualified', 
    comments: 'ทักษะทางเทคนิคดีเยี่ยม มีความเข้าใจระบบซับซ้อนได้เร็วมาก ทัศนคติเชิงบวก' 
  },
  { 
    id: 'FDB-002', 
    ticketId: 'FDB-2605-02', 
    candidate: 'Boonmee Kao', 
    jobTitle: 'Sales Executive (B2B)', 
    dept: 'Sales', 
    interviewer: 'Somchai (Sales Dir)', 
    date: '2026-05-15', 
    scores: { skills: 6, culture: 7, attitude: 8, potential: 7 }, 
    result: 'Under Review', 
    comments: 'บุคลิกดี เจรจาเก่ง แต่ความเข้าใจในเทคนิคอลผลิตภัณฑ์ยังจำกัด ต้องฝึกฝนเพิ่มเติม' 
  },
  { 
    id: 'FDB-003', 
    ticketId: 'FDB-2605-03', 
    candidate: 'Chalee Mong', 
    jobTitle: 'QA Automation Engineer', 
    dept: 'Information Technology', 
    interviewer: 'Wipada (QA Lead)', 
    date: '2026-05-16', 
    scores: { skills: 8, culture: 9, attitude: 9, potential: 9 }, 
    result: 'Qualified', 
    comments: 'Highly recommended. ประสบการณ์ตรงสายเรื่อง Cypress และ CI/CD มีทัศนคติการเรียนรู้ดีที่สุด' 
  },
  { 
    id: 'FDB-004', 
    ticketId: 'FDB-2605-04', 
    candidate: 'Dara Jai', 
    jobTitle: 'Content Creator', 
    dept: 'Marketing', 
    interviewer: 'Suda (CMO)', 
    date: '2026-05-18', 
    scores: { skills: 4, culture: 6, attitude: 5, potential: 4 }, 
    result: 'Not Qualified', 
    comments: 'Portfolio ยังไม่ตรงตามที่ทีมฝ่ายผลิตคอนเทนต์ต้องการ ประสบการณ์ยังน้อยเกินไป' 
  },
];

const DEPARTMENTS = ['ALL', 'Information Technology', 'Sales', 'Marketing', 'Production', 'Human Resources', 'Quality Assurance'];
const RESULTS = ['ALL', 'Qualified', 'Under Review', 'Not Qualified'];

// --- Draggable Feedback Edit/Creation Modal ---
function FeedbackModal({ isOpen, onClose, record, onSave }: { isOpen: boolean; onClose: () => void; record: InterviewFeedback | null; onSave: (data: InterviewFeedback) => void }) {
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      if (record) {
        setFormData({ ...record });
      } else {
        setFormData({
          id: `FDB-${Date.now()}`,
          ticketId: `FDB-2605-${String(Math.floor(Math.random() * 90) + 10)}`,
          candidate: '',
          jobTitle: '',
          dept: 'Information Technology',
          interviewer: 'Wichai (IT Manager)',
          date: new Date().toISOString().split('T')[0],
          scores: { skills: 5, culture: 5, attitude: 5, potential: 5 },
          result: 'Under Review',
          comments: ''
        });
      }
    }
  }, [isOpen, record]);

  if (!isOpen || !formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleScoreChange = (key: string, val: string) => {
    setFormData((prev: any) => ({
      ...prev,
      scores: { ...prev.scores, [key]: Number(val) }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.candidate || !formData.jobTitle || !formData.comments || !formData.dept) {
      MySwal.fire('Error', 'Please fill in all required fields.', 'error');
      return;
    }
    onSave(formData);
    onClose();
  };

  const avgScore = ((formData.scores.skills + formData.scores.culture + formData.scores.attitude + formData.scores.potential) / 4).toFixed(1);

  const ScoreSliderInput = ({ label, icon: Icon, val, name }: any) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2 group hover:border-[#b58c4f]/40 transition-all">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <Icon size={13} className="text-[#b58c4f] shrink-0" />
          <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-[13px] font-black font-tech text-slate-800">{val} / 10</span>
      </div>
      <input type="range" min="0" max="10" step="1" value={val} onChange={(e) => handleScoreChange(name, e.target.value)} className="w-full accent-[#b58c4f] h-1.5 cursor-pointer" />
    </div>
  );

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      width="max-w-[850px]"
      customHeader={
        <div className="bg-[#212c46] px-5 py-4 flex justify-between items-center text-white shrink-0 border-b-2 border-[#709654]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/20 shadow-sm">
              <ClipboardCheck size={18} className="text-[#b58c4f]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">{record ? 'EDIT ASSESSMENT' : 'NEW CANDIDATE EVALUATION'}</h3>
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">Ref Code: {formData.ticketId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"><X size={16} /></button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col bg-[#f8f9fa] overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {/* Section 1 */}
          <div className="bg-white p-5 rounded-2xl border border-[#eaeaec] shadow-sm space-y-4">
            <h4 className="text-[12px] font-black text-[#212c46] uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
              <UserCheck size={14} className="text-[#3f809e]" /> 1. Candidate Bio-Data
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1">Candidate Name <span className="text-red-600">*</span></label>
                <input type="text" name="candidate" required value={formData.candidate} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[11px] font-bold text-slate-800 outline-none focus:border-[#3f809e] transition-all" placeholder="e.g. Somchai Thai" />
              </div>
              <div className="sm:col-span-1">
                <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1">Applied Position <span className="text-red-600">*</span></label>
                <input type="text" name="jobTitle" required value={formData.jobTitle} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[11px] font-bold text-slate-800 outline-none focus:border-[#3f809e] transition-all" placeholder="e.g. Sales Director" />
              </div>
              <div>
                <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1">Department <span className="text-red-600">*</span></label>
                <select name="dept" required value={formData.dept} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[11px] font-black text-slate-800 outline-none focus:border-[#3f809e] transition-all cursor-pointer">
                  {DEPARTMENTS.filter(d => d !== 'ALL').map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1">Lead Assessor / Interviewer <span className="text-red-600">*</span></label>
                <input type="text" name="interviewer" required value={formData.interviewer} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[11px] font-bold text-slate-800 outline-none focus:border-[#3f809e] transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1">Evaluation Date <span className="text-red-600">*</span></label>
                <input type="date" name="date" required value={formData.date} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[11px] font-bold text-slate-800 outline-none focus:border-[#3f809e] transition-all" />
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-[#f8f9fa] p-5 rounded-2xl border border-[#eaeaec] shadow-inner space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h4 className="text-[12px] font-black text-[#212c46] uppercase tracking-widest flex items-center gap-2">
                <Gauge size={14} className="text-[#b58c4f]" /> 2. Dual Grading Matrix
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase">Average Grade:</span>
                <span className="text-[16px] font-black text-[#3f809e] font-tech">{avgScore} <span className="text-[10.5px] text-slate-400">/ 10</span></span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ScoreSliderInput label="Technical Aptitude" name="skills" val={formData.scores.skills} icon={Fingerprint} />
              <ScoreSliderInput label="Group culture fit" name="culture" val={formData.scores.culture} icon={Building2} />
              <ScoreSliderInput label="Positive attitude" name="attitude" val={formData.scores.attitude} icon={Activity} />
              <ScoreSliderInput label="Adaptive potential" name="potential" val={formData.scores.potential} icon={TrendingUp} />
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white p-5 rounded-2xl border border-[#eaeaec] shadow-sm space-y-4">
            <h4 className="text-[12px] font-black text-[#212c46] uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
              <MessageSquare size={14} className="text-[#657f4d]" /> 3. Remarks, Verdict & Comments
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-5">
                <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-2">Decision Status <span className="text-red-600">*</span></label>
                <div className="space-y-2">
                  {RESULTS.filter(r => r !== 'ALL').map((res) => (
                    <label key={res} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData.result === res ? 'bg-slate-50 border-[#b58c4f] shadow-sm' : 'bg-white border-slate-200'}`}>
                      <input type="radio" name="result" value={res} checked={formData.result === res} onChange={handleChange} className="hidden" />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.result === res ? 'border-[#b58c4f] bg-[#b58c4f]' : 'border-slate-300'}`}>
                        {formData.result === res && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                      </div>
                      <span className="text-[11px] font-black uppercase text-slate-700">{res}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-7">
                <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-2">Interviewer Summary Comments <span className="text-red-600">*</span></label>
                <textarea name="comments" required value={formData.comments} onChange={handleChange} rows={5} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[11.5px] font-medium text-slate-700 outline-none focus:border-[#3f809e] transition-all" placeholder="Provide clear description of why candidate passed or failed..."></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-[#f8f9fa] border-t border-slate-100 flex justify-between items-center shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2 hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-sm transition-all">Cancel</button>
          <div className="flex items-center gap-2">
            <button type="submit" className="bg-[#212c46] hover:bg-[#b58c4f] text-white px-8 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md flex items-center gap-2 transition-all cursor-pointer">
              <Save size={14} /> Save Assessment Decisions
            </button>
          </div>
        </div>
      </form>
    </DraggableModal>
  );
}

export default function InterviewAssessmentPage() {
  const [activeTab, setActiveTab] = useState<'registry' | 'settings'>('registry');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [records, setRecords] = useState<InterviewFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedResult, setSelectedResult] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRec, setEditingRec] = useState<InterviewFeedback | null>(null);

  // Settings State matching standard of UserPermissions
  const [policies, setPolicies] = useState({
    lockDecision: true,
    requireReview: false,
    autoNotifyHR: true,
    allowWeightOverride: true,
  });

  useEffect(() => {
    const loadInterviewFeedbacks = async () => {
      setIsLoading(true);
      try {
        const res = await dbSync.read('interview_feedbacks');
        if (res && res.status === 'success' && res.data && Array.isArray(res.data.items) && res.data.items.length > 0) {
          setRecords(res.data.items);
        } else {
          // Initialize database with original 100% accurate samples
          setRecords(INITIAL_RECORDS);
          await dbSync.write('interview_feedbacks', INITIAL_RECORDS);
        }
      } catch (err) {
        console.error('Failed to sync interview feedbacks. Loading mock fallbacks:', err);
        setRecords(INITIAL_RECORDS);
      } finally {
        setIsLoading(false);
      }
    };
    loadInterviewFeedbacks();
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      const matchSearch = rec.candidate.toLowerCase().includes(search.toLowerCase()) || 
                          rec.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
                          rec.interviewer.toLowerCase().includes(search.toLowerCase()) ||
                          rec.ticketId.toLowerCase().includes(search.toLowerCase());
      const matchDept = selectedDept === 'ALL' || rec.dept === selectedDept;
      const matchResult = selectedResult === 'ALL' || rec.result === selectedResult;
      return matchSearch && matchDept && matchResult;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, search, selectedDept, selectedResult]);

  const paginatedData = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;

  const kpiData = useMemo(() => {
    const total = records.length;
    const passed = records.filter(r => r.result === 'Qualified').length;
    const failed = records.filter(r => r.result === 'Not Qualified').length;
    let avgSum = 0;
    records.forEach(r => {
      avgSum += (r.scores.skills + r.scores.culture + r.scores.attitude + r.scores.potential) / 4;
    });
    const avgGlobal = total > 0 ? (avgSum / total).toFixed(1) : '0';
    return { total, passed, failed, avgGlobal };
  }, [records]);

  const handleOpenModal = (rec: InterviewFeedback | null = null) => {
    setEditingRec(rec);
    setIsModalOpen(true);
  };

  const handleSaveFeedback = async (formData: InterviewFeedback) => {
    try {
      let updated: InterviewFeedback[] = [];
      if (editingRec) {
        updated = records.map(r => r.id === editingRec.id ? formData : r);
        setRecords(updated);
        await dbSync.write('interview_feedbacks', updated);
        MySwal.fire({ icon: 'success', title: 'Assessment Saved!', text: 'Candidate assessment scores were updated.', timer: 2000, showConfirmButton: false });
      } else {
        updated = [formData, ...records];
        setRecords(updated);
        await dbSync.write('interview_feedbacks', updated);
        MySwal.fire({ icon: 'success', title: 'Evaluation Recorded!', text: 'Recorded successfully.', timer: 2000, showConfirmButton: false });
      }
    } catch (err) {
      console.error(err);
      MySwal.fire('Error', 'Failed to save to database.', 'error');
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Check lock
    const target = records.find(r => r.id === id);
    if (policies.lockDecision && (target?.result === 'Qualified' || target?.result === 'Not Qualified')) {
      MySwal.fire('Policy Alert', 'Decided assessments cannot be deleted under current active Settings policy.', 'warning');
      return;
    }

    MySwal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this feedback evaluation record!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#932c2e',
      cancelButtonColor: '#7a8b95',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const updated = records.filter(r => r.id !== id);
          setRecords(updated);
          await dbSync.delete('interview_feedbacks', [{ id }]);
          MySwal.fire('Deleted!', 'Candidate feedback record deleted successfully.', 'success');
        } catch (err) {
          console.error(err);
          MySwal.fire('Error', 'Failed to delete evaluation record.', 'error');
        }
      }
    });
  };

  const ResultBadge = ({ result }: { result: string }) => {
    let colorClass = "bg-[#f3f3f1] text-[#606a5f] border-[#d1d1d5]";
    if (result === 'Qualified') colorClass = "bg-[#557e4e]/10 text-[#557e4e] border-[#557e4e]/30";
    else if (result === 'Not Qualified') colorClass = "bg-[#b22026]/10 text-[#b22026] border-[#b22026]/30";
    else if (result === 'Under Review') colorClass = "bg-[#b58c4f]/10 text-[#b58c4f] border-[#b58c4f]/30";
    
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${colorClass}`}>
        {result}
      </span>
    );
  };

  return (
    <div className="flex flex-1 w-full flex-col animate-fadeIn bg-transparent space-y-4 pb-6 min-h-0">
      {/* USER GUIDE FLOATING TAB */}
      {typeof document !== 'undefined' && createPortal(
        <button onClick={() => setIsGuideOpen(true)} className="fixed right-0 bg-[#f8f9fa] border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#932c2e] hover:text-white hover:border-[#932c2e] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group" style={{ top: '80px' }}>
          <HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#7a8b95] group-hover:text-white" />
          <span className="font-black tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[11px]">USER GUIDE</span>
        </button>,
        document.body
      )}
      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <FeedbackModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} record={editingRec} onSave={handleSaveFeedback} />
      {/* HEADER SECTION (NO Background, transparent layout over parent) */}
      <div className="h-14 px-8 flex flex-row items-center justify-between gap-4 z-20 shrink-0">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center group cursor-default shrink-0">
            <div className="absolute inset-0 bg-[#3f809e] blur-[15px] opacity-20 rounded-full group-hover:opacity-60 transition-all duration-700"></div>
            <div className="relative z-10 p-1.5 border border-[#3f809e]/40 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm">
              <ClipboardCheck size={28} strokeWidth={2.5} className="text-[#3f809e]" />
            </div>
          </div>
          <div>
            <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none" style={{ fontSize: '24px' }}>
              INTERVIEW <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3f809e] to-[#b58c4f]">EVALUATION</span>
            </h3>
            <p className="text-[11px] font-bold text-[#4d5a44] uppercase tracking-[0.2em] mt-0.5 opacity-80 leading-none">
              ASSESSMENT SCORING & TALENT EVALUATION RECORDS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white/50 p-1.5 rounded-xl border border-white/60 shadow-inner flex flex-wrap items-center gap-1">
            <button onClick={() => setActiveTab('registry')} className={`px-6 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'registry' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#7a8b95] hover:text-[#a94228]'}`}>
              <LayoutList size={16} /> Global Assessments
            </button>
            <button onClick={() => setActiveTab('settings')} className={`px-6 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'settings' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#7a8b95] hover:text-[#a94228]'}`}>
              <Settings size={16} /> Evaluation Criteria Settings
            </button>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-8 w-full mt-[2px]">
        <div className="w-full">
          
          {/* KPI STATS (Streamlined lean padding) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3 shrink-0">
            <KpiCard
              label="Assessments Recorded"
              value={kpiData.total}
              icon={LayoutList}
              color={THEME.primary}
              description="Managed Candidates" />
            <KpiCard
              label="Qualified Candidates"
              value={kpiData.passed}
              icon={Award}
              color={THEME.success}
              description="Ready For Hiring Offer" />
            <KpiCard
              label="Avg Score Rating"
              value={kpiData.avgGlobal}
              icon={Star}
              color={THEME.gold}
              description="Out of 10.0 Scale" />
            <KpiCard
              label="Variance ratio"
              value={`${Math.round((kpiData.failed / (kpiData.total || 1)) * 100)}%`}
              icon={TrendingUp}
              color={THEME.accent}
              description="Rejection variance" />
          </div>

          {activeTab === 'registry' ? (
            <div className="bg-white rounded-3xl shadow-lg border border-[#eaeaec] overflow-hidden flex flex-col  flex-1 min-h-0">
              
              {/* TOOLBAR */}
              <div className="px-6 py-4 border-b border-[#eaeaec] bg-[#f8f9fa] flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-[11px] font-black uppercase tracking-widest text-[#212c46] outline-none focus:border-[#3f809e] shadow-sm cursor-pointer select">
                    {DEPARTMENTS.map(d => <option key={d} value={d}>DEPT: {d === 'Information Technology' ? 'IT' : d}</option>)}
                  </select>
                  <select value={selectedResult} onChange={(e) => setSelectedResult(e.target.value)} className="bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-[11px] font-black uppercase tracking-widest text-[#212c46] outline-none focus:border-[#3f809e] shadow-sm cursor-pointer select">
                    {RESULTS.map(r => <option key={r} value={r}>RESULT: {r}</option>)}
                  </select>
                  <span className="text-slate-300 hidden lg:block">|</span>
                  <div className="relative flex-1 md:w-80">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search candidate, position, ticket ID, assessor..." className="w-full pl-10 pr-6 py-2.5 text-[11px] border border-slate-200 rounded-xl font-bold outline-none focus:border-[#b58c4f] bg-white text-[#212c46] placeholder-slate-400" />
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
                  <button onClick={() => handleOpenModal()} className="bg-[#212c46] hover:bg-[#3f809e] text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md transition-all flex items-center gap-2 cursor-pointer">
                    <Plus size={14} strokeWidth={3} /> Record Feedback
                  </button>
                </div>
              </div>

              {/* DATA TABLE (Standard head py-4 222b38, border-b-2 709654, py-2.5 px-4, text-[12px]) */}
              <div className="overflow-x-auto custom-scrollbar bg-white flex-1 min-h-0">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead className="bg-[#222b38] text-white">
                    <tr className="border-b-2 border-[#709654]">
                      <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-white bg-[#222b38]">Candidate Profile</th>
                      <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-white bg-[#222b38] text-center">Avg Score</th>
                      <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-white bg-[#222b38]">Assessment Detail</th>
                      <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-white bg-[#222b38]">Assessed By...</th>
                      <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-white bg-[#222b38] text-center">Decision</th>
                      <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-white bg-[#222b38] text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {paginatedData.map((rec) => {
                      const avg = ((rec.scores.skills + rec.scores.culture + rec.scores.attitude + rec.scores.potential)/4).toFixed(1);
                      return (
                        <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors group cursor-pointer" onClick={() => handleOpenModal(rec)}>
                          <td className="py-2.5 px-4 text-[12px]">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shadow-sm shrink-0 bg-slate-100 flex items-center justify-center text-slate-500 font-extrabold text-[12px]">
                                {rec.candidate.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-black text-slate-800 text-[12px] tracking-tight leading-none mb-1">{rec.candidate}</span>
                                <span className="font-tech text-slate-400 text-[9px] font-black uppercase tracking-wider leading-none">#{rec.ticketId}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-[12px] text-center font-mono">
                            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full border font-black text-[12px] text-center ${Number(avg) >= 8 ? 'bg-[#508660]/10 border-[#508660]/30 text-[#508660]' : Number(avg) >= 6 ? 'bg-[#b58c4f]/10 border-[#b58c4f]/20 text-[#b58c4f]' : 'bg-[#b22026]/10 border-[#b22026]/20 text-[#b22026]'}`}>
                              {avg}
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-[12px] max-w-[280px]">
                            <div className="flex items-center gap-1 mt-0.5 mb-1 text-slate-600 font-bold leading-tight">
                              <MessageSquare size={12} className="text-[#b58c4f] shrink-0" />
                              <span className="truncate">{rec.comments}</span>
                            </div>
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="text-[9px] font-black font-tech px-1.5 bg-slate-50 border border-slate-200 text-slate-500 rounded">TEC:{rec.scores.skills}</span>
                              <span className="text-[9px] font-black font-tech px-1.5 bg-slate-50 border border-slate-200 text-slate-500 rounded">CUL:{rec.scores.culture}</span>
                              <span className="text-[9px] font-black font-tech px-1.5 bg-slate-50 border border-slate-200 text-slate-500 rounded">ATT:{rec.scores.attitude}</span>
                              <span className="text-[9px] font-black font-tech px-1.5 bg-slate-50 border border-slate-200 text-slate-500 rounded">POT:{rec.scores.potential}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-[12px]">
                            <p className="font-black text-slate-700 leading-none">{rec.interviewer}</p>
                            <p className="text-[10px] font-tech font-bold text-slate-400 mt-1 uppercase">{rec.date}</p>
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <ResultBadge result={rec.result} />
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <div className="flex justify-center items-center gap-[1px]" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => handleOpenModal(rec)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#606a5f] hover:bg-slate-100 transition-all active:scale-90" title="Edit Assessment">
                                <Pencil size={13} />
                              </button>
                              <button onClick={(e) => handleDelete(rec.id, e)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#b22026] hover:bg-[#b22026]/10 transition-all active:scale-90" title="Delete Feedback">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )})}
                    {paginatedData.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-16 text-slate-400 font-bold text-[13px]">
                          No interview feedback evaluations found matching options.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="px-6 py-3 bg-[#eaeaec]/40 border-t border-[#eaeaec] flex flex-col md:flex-row justify-between items-center gap-4 rounded-b-3xl shrink-0">
                <div className="flex items-center gap-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>Rows:</span>
                    <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none font-bold text-slate-700 cursor-pointer shadow-sm">
                      {[5, 10, 20, 50].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <p className="bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm font-tech">Total: {filteredRecords.length}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`w-8 h-8 border border-slate-200 bg-white rounded-lg flex items-center justify-center transition-all ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#212c46] hover:text-white shadow-sm active:scale-90'}`}>
                    <ChevronLeft size={14}/>
                  </button>
                  <div className="bg-white text-slate-600 px-3 py-1.5 rounded-lg font-black text-[11px] min-w-[90px] text-center uppercase border border-slate-100 shadow-sm font-tech">
                    Page {currentPage} / {totalPages}
                  </div>
                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className={`w-8 h-8 border border-slate-200 bg-white rounded-lg flex items-center justify-center transition-all ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#212c46] hover:text-white shadow-sm active:scale-90'}`}>
                    <ChevronRight size={14}/>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // --- Standard security policies settings tab layout derived strictly from UserPermissions ---
            (<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left sidebar card policies */}
              <div className="lg:col-span-4 bg-white p-6 rounded-3xl shadow-lg border border-[#eaeaec] animate-fadeIn h-fit font-sans">
                <h3 className="text-[13px] font-black text-[#212c46] uppercase tracking-widest flex items-center gap-3 border-b-2 border-[#b58c4f] pb-3 mb-5">
                  <ShieldAlert size={18} className="text-[#b58c4f]" /> SECURITY MATRIX POLICIES
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-[#f8f9fa] border border-[#eaeaec] rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 text-[#3f809e] font-black text-[11.5px] uppercase tracking-wider mb-1"><Info size={16}/> Weighted Mean Model</div>
                    <p className="text-[11px] text-[#414757] font-bold leading-relaxed">ข้อมูลแบบประเมินและทัศนคติจะประกอบกันเป็น Standard Score (เฉลี่ยเท่าเทียมกันทั้ง 4 มิติ) เสมอ โดยการแก้ตัวเลขต้องผ่านความปลอดภัยขั้นสูง</p>
                  </div>
                  <div className="p-4 bg-[#932c2e]/15 border border-[#932c2e]/25 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 text-[#932c2e] font-black text-[11.5px] uppercase tracking-wider mb-1"><ShieldCheck size={16}/> Lock Completed Verdicts</div>
                    <p className="text-[11px] text-[#414757] font-bold leading-relaxed">เมื่อผู้ตัดสินทำการปรับสถานะผู้สมัครเป็น "Qualified" หรือ "Not Qualified" แล้ว ข้อมูลดังกล่าวจะล็อคทันทีเพื่อป้องกันทิศทางประวัติเปลี่ยนไปตามอำเภอใจ</p>
                  </div>
                </div>
              </div>
              {/* Right config list card */}
              <div className="lg:col-span-8 bg-white rounded-3xl shadow-lg border border-[#eaeaec] overflow-hidden">
                <div className="p-5 bg-[#f8f9fa] border-b border-[#eaeaec]">
                  <h4 className="text-[13px] font-black uppercase text-[#212c46] tracking-widest flex items-center gap-3">
                    <Sliders size={18} className="text-[#b58c4f]"/> SYSTEM EVALUATION SETTINGS
                  </h4>
                </div>
                <div className="p-6 space-y-4">
                  {/* Policies checkboxes styled identical to UserPermissions page */}
                  <div className="flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 border border-[#eaeaec] rounded-2xl transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#3f809e]/10 text-[#3f809e] flex items-center justify-center shrink-0">
                        <Lock size={18} />
                      </div>
                      <div>
                        <p className="text-[12px] font-extrabold text-[#212c46] uppercase leading-none mb-1">Lock Completed Verdicts (ล็อกผลประเมินเมื่ออนุมัติ)</p>
                        <p className="text-[10px] text-slate-400 font-bold leading-none">เมื่อสถานะพิจารณาเป็นผ่านหรือปัดคะแนนตก จะระงับการลบแก้ไขตารางนัดหมายและแบบประเมิน</p>
                      </div>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={policies.lockDecision} onChange={(e) => setPolicies({ ...policies, lockDecision: e.target.checked })} className="sr-only peer" id="toggle-p1" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#508660]"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 border border-[#eaeaec] rounded-2xl transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#b58c4f]/10 text-[#b58c4f] flex items-center justify-center shrink-0">
                        <Users size={18} />
                      </div>
                      <div>
                        <p className="text-[12px] font-extrabold text-[#212c46] uppercase leading-none mb-1">Double Stage Checking (ต้องการความเห็นกรรมการ 2 ท่าน)</p>
                        <p className="text-[10px] text-slate-400 font-bold leading-none">กระตุ้นความปลอดภัย: ต้องมีใบประเมินและทัศนคติโดยเฉลี่ยอย่างน้อยสองคนเพื่อเปลี่ยนเป็น Qualified</p>
                      </div>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={policies.requireReview} onChange={(e) => setPolicies({ ...policies, requireReview: e.target.checked })} className="sr-only peer" id="toggle-p2" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#508660]"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 border border-[#eaeaec] rounded-2xl transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#a94228]/10 text-[#a94228] flex items-center justify-center shrink-0">
                        <Bell size={18} />
                      </div>
                      <div>
                        <p className="text-[12px] font-extrabold text-[#212c46] uppercase leading-none mb-1">Auto-Notify HR Recruiter (แจ้งแผนกสรรหารวดเร็ว)</p>
                        <p className="text-[10px] text-slate-400 font-bold leading-none">ส่งอีเมลผลใบประเมินและเฉลี่ยสรุปตรงไปที่กอง HR ทันทีที่คุณตัดสินใจเสร็จสิ้น</p>
                      </div>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={policies.autoNotifyHR} onChange={(e) => setPolicies({ ...policies, autoNotifyHR: e.target.checked })} className="sr-only peer" id="toggle-p3" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#508660]"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 border border-[#eaeaec] rounded-2xl transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#d96245] flex items-center justify-center shrink-0">
                        <Sliders size={18} />
                      </div>
                      <div>
                        <p className="text-[12px] font-extrabold text-[#212c46] uppercase leading-none mb-1">Allow Weighted Override (เปิดประเมินข้ามเกณฑ์เฉลี่ย)</p>
                        <p className="text-[10px] text-slate-400 font-bold leading-none">อนุญาตให้ระบุผ่าน Qualified ได้ แม้คะแนนพิจารณารายด้านจะต่ำกว่าขั้นต่ำ 6 คะแนน</p>
                      </div>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={policies.allowWeightOverride} onChange={(e) => setPolicies({ ...policies, allowWeightOverride: e.target.checked })} className="sr-only peer" id="toggle-p4" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#508660]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>)
          )}

          {/* SPACING HELPER BEFORE FOOTER (Exactly mt-8) */}
          <div className="mt-8 h-2"></div>

        </div>
      </div>
    </div>
  );
}

// Custom Lock Icon
const Lock = ({ size, className }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 16} height={size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
);
