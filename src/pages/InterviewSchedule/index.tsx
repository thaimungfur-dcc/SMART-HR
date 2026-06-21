import { UserGuidePanel } from '../../components/shared/UserGuidePanel';
import KpiCard from '../../components/shared/KpiCard';
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';
import { 
  CalendarDays, Search, Plus, Pencil, Trash2, X, Save, ChevronLeft, ChevronRight, 
  HelpCircle, CheckCircle2, AlertTriangle, Building2, Briefcase, 
  Video, MapPin, Mail, Clock, Send, Users, ExternalLink,
  TrendingUp, Download, ShieldCheck, UserCheck, CalendarCheck,
  Check, XCircle, MoreVertical, LayoutList, Bell, Settings,
  AlertCircle, ShieldAlert, Sliders, Info, RefreshCw
} from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { DraggableModal } from '../../components/shared/DraggableModal';
import { dbSync } from '../../services/dbSync';
import { useLanguage } from '../../context/LanguageContext';

const MySwal = withReactContent(Swal);

// --- Theme Configuration (Aligned perfectly with Home / UserPermissions palette) ---
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

interface InterviewSchedule {
  id: string;
  ticketId: string;
  candidate: string;
  jobTitle: string;
  date: string;
  time: string;
  interviewers: string[];
  mode: 'Online' | 'On-site' | 'Phone';
  location: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  notes?: string;
}

const INITIAL_SCHEDULES: InterviewSchedule[] = [
  { 
    id: 'INT-001', ticketId: 'INT-2605-01', candidate: 'ANAWAT SIRI', jobTitle: 'Senior Fullstack Developer', 
    date: '2026-05-15', time: '10:00 - 11:30', interviewers: ['Wichai (IT)', 'Somsak (Lead)'], 
    mode: 'Online', location: 'Microsoft Teams', status: 'Confirmed', notes: 'Candidate has 5 years of React experience. Strong JS fundamentals.'
  },
  { 
    id: 'INT-002', ticketId: 'INT-2605-02', candidate: 'BOONMEE KAO', jobTitle: 'Sales Executive (B2B)', 
    date: '2026-05-15', time: '14:00 - 15:00', interviewers: ['Somchai (Director)', 'Mali (HR)'], 
    mode: 'On-site', location: 'Meeting Room 4 (Floor 2)', status: 'Pending', notes: 'Requires high English proficiency. Background in chemical raw materials.'
  },
  { 
    id: 'INT-003', ticketId: 'INT-2605-03', candidate: 'CHALEE MONG', jobTitle: 'QA Automation Engineer', 
    date: '2026-05-16', time: '09:30 - 10:30', interviewers: ['Wipada (QA Manager)'], 
    mode: 'Online', location: 'Google Meet', status: 'Completed', notes: 'Excellent performance in coding test. Handled complex Selenium cases.'
  },
  { 
    id: 'INT-004', ticketId: 'INT-2605-04', candidate: 'DARA JAI', jobTitle: 'Content Creator', 
    date: '2026-05-18', time: '11:00 - 12:00', interviewers: ['Suda (CMO)'], 
    mode: 'On-site', location: 'Studio Room', status: 'Cancelled', notes: 'Candidate declined due to travel distance. Keep on file.'
  },
];

const STATUSES = ['ALL', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

// --- Draggable Interview Edit/Creation Modal ---
function InterviewModal({ isOpen, onClose, record, onSave }: { isOpen: boolean; onClose: () => void; record: InterviewSchedule | null; onSave: (data: InterviewSchedule) => void }) {
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      if (record) {
        setFormData({ ...record });
      } else {
        setFormData({
          id: `INT-${Date.now()}`,
          ticketId: `INT-2605-${String(Math.floor(Math.random() * 90) + 10)}`,
          candidate: '',
          jobTitle: '',
          date: new Date().toISOString().split('T')[0],
          time: '10:00 - 11:30',
          interviewers: [],
          mode: 'Online',
          location: 'Microsoft Teams',
          status: 'Pending',
          notes: ''
        });
      }
    }
  }, [isOpen, record]);

  if (!isOpen || !formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleInterviewerAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    if (e.key === 'Enter' && target.value.trim()) {
      e.preventDefault();
      setFormData((prev: any) => ({
        ...prev,
        interviewers: [...prev.interviewers, target.value.trim()]
      }));
      target.value = '';
    }
  };

  const handleInterviewerRemove = (idx: number) => {
    setFormData((prev: any) => ({
      ...prev,
      interviewers: prev.interviewers.filter((_: any, i: number) => i !== idx)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.candidate || !formData.jobTitle || !formData.location) {
      MySwal.fire('Error', 'Please fill in all required fields.', 'error');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      width="max-w-[700px]"
      customHeader={
        <div className="bg-[#212c46] px-5 py-4 flex justify-between items-center text-white shrink-0 border-b-2 border-[#709654]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/20 shadow-sm">
              <CalendarCheck size={18} className="text-[#3f809e]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">{record ? 'EDIT INTERVIEW' : 'NEW INTERVIEW SCHEDULE'}</h3>
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">Ticket Code: {formData.ticketId}</p>
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
              <UserCheck size={14} className="text-[#b58c4f]" /> 1. Candidate & Position Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1">Candidate Name <span className="text-red-600">*</span></label>
                <input type="text" name="candidate" required value={formData.candidate} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[11px] font-black text-slate-800 outline-none focus:border-[#3f809e] transition-all" placeholder="e.g. Somchai Thai" />
              </div>
              <div>
                <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1">Job Title <span className="text-red-600">*</span></label>
                <input type="text" name="jobTitle" required value={formData.jobTitle} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[11px] font-black text-slate-800 outline-none focus:border-[#3f809e] transition-all" placeholder="e.g. Senior Fullstack Developer" />
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white p-5 rounded-2xl border border-[#eaeaec] shadow-sm space-y-4">
            <h4 className="text-[12px] font-black text-[#212c46] uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
              <Clock size={14} className="text-[#3f809e]" /> 2. Time, Mode & Location
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1">Date <span className="text-red-600">*</span></label>
                <input type="date" name="date" required value={formData.date} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[11px] font-bold text-slate-800 outline-none focus:border-[#3f809e] transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1">Time Range <span className="text-red-600">*</span></label>
                <input type="text" name="time" required value={formData.time} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[11px] font-bold text-slate-800 outline-none focus:border-[#3f809e] transition-all" placeholder="10:00 - 11:30" />
              </div>
              <div>
                <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1">Interview Mode</label>
                <select name="mode" value={formData.mode} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[11px] font-black text-slate-800 outline-none focus:border-[#3f809e] transition-all cursor-pointer">
                  <option value="Online">Online</option>
                  <option value="On-site">On-site</option>
                  <option value="Phone">Phone</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1">Location / Meeting Link <span className="text-red-600">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  {formData.mode === 'Online' ? <Video size={13} /> : <MapPin size={13} />}
                </div>
                <input type="text" name="location" required value={formData.location} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-[11px] font-bold text-[#3f809e] outline-none focus:border-[#3f809e] transition-all" placeholder={formData.mode === 'Online' ? "URL Webex / Zoom / Teams..." : "Room name and floor..."} />
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white p-5 rounded-2xl border border-[#eaeaec] shadow-sm space-y-4">
            <h4 className="text-[12px] font-black text-[#212c46] uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
              <Users size={14} className="text-[#657f4d]" /> 3. Panel of Interviewers
            </h4>
            <div>
              <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1">Add Interviewer (Type name & press Enter)</label>
              <input type="text" onKeyDown={handleInterviewerAdd} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[11px] font-bold text-slate-800 outline-none focus:border-[#3f809e] transition-all" placeholder="e.g. Somsak (CTO)" />
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {formData.interviewers && formData.interviewers.map((int: string, i: number) => (
                  <span key={i} className="bg-slate-50 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1">
                    {int}
                    <button type="button" onClick={() => handleInterviewerRemove(i)} className="text-red-500 hover:text-red-700 font-extrabold"><X size={10} /></button>
                  </span>
                ))}
                {(!formData.interviewers || formData.interviewers.length === 0) && (
                  <p className="text-[10px] text-slate-400 italic">No interviewers assigned yet.</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1">Notes / Special Instructions</label>
              <textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={2} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[11.5px] font-medium text-slate-700 outline-none focus:border-[#3f809e] transition-all" placeholder="Additional candidate requirements, portfolio items to check..."></textarea>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-[#f8f9fa] border-t border-slate-100 flex justify-between items-center shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2 hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-sm transition-all">Cancel</button>
          <div className="flex items-center gap-2">
            <button type="submit" className="bg-[#212c46] hover:bg-[#3f809e] text-white px-7 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md flex items-center gap-2 transition-all cursor-pointer">
              <Save size={14} /> {record ? 'Update Schedule' : 'Save Schedule'}
            </button>
          </div>
        </div>
      </form>
    </DraggableModal>
  );
}

export default function InterviewSchedulePage() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'settings'>('schedule');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [schedules, setSchedules] = useState<InterviewSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal Control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInt, setEditingInt] = useState<InterviewSchedule | null>(null);

  // Settings State matching standard of UserPermissions
  const [policies, setPolicies] = useState({
    autoNotify: true,
    allowReschedule: false,
    lockCompleted: true,
    calendarSync: true
  });

  // Pre-fetch/seed database items
  useEffect(() => {
    const loadInterviewData = async () => {
      setIsLoading(true);
      try {
        const res = await dbSync.read('interview_schedules');
        if (res && res.status === 'success' && res.data && Array.isArray(res.data.items) && res.data.items.length > 0) {
          // Normalize interviewers if it has string representation
          const parsed = res.data.items.map((item: any) => ({
            ...item,
            interviewers: Array.isArray(item.interviewers) 
              ? item.interviewers 
              : ((typeof item.interviewers === 'string' && item.interviewers.trim() !== '') 
                ? item.interviewers.split(',').map((s: string) => s.trim()) 
                : [])
          }));
          setSchedules(parsed);
        } else {
          // Initialize database with original 100% accurate samples
          setSchedules(INITIAL_SCHEDULES);
          await dbSync.write('interview_schedules', INITIAL_SCHEDULES);
        }
      } catch (err) {
        console.error('Failed to sync interview schedules. Loading mock fallbacks:', err);
        setSchedules(INITIAL_SCHEDULES);
      } finally {
        setIsLoading(false);
      }
    };
    loadInterviewData();
  }, []);

  const filteredSchedules = useMemo(() => {
    return schedules.filter(int => {
      const matchSearch = int.candidate.toLowerCase().includes(search.toLowerCase()) || 
                          int.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
                          int.ticketId.toLowerCase().includes(search.toLowerCase());
      const matchStatus = selectedStatus === 'ALL' || int.status === selectedStatus;
      return matchSearch && matchStatus;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [schedules, search, selectedStatus]);

  const paginatedData = filteredSchedules.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage) || 1;

  const kpiData = useMemo(() => {
    const total = schedules.length;
    const today = schedules.filter(r => r.date === new Date().toISOString().split('T')[0]).length;
    const confirmed = schedules.filter(r => r.status === 'Confirmed').length;
    const completed = schedules.filter(r => r.status === 'Completed').length;
    return { total, today, confirmed, completed };
  }, [schedules]);

  const handleOpenModal = (int: InterviewSchedule | null = null) => {
    setEditingInt(int);
    setIsModalOpen(true);
  };

  const handleSaveSchedule = async (formData: InterviewSchedule) => {
    try {
      let updated: InterviewSchedule[] = [];
      if (editingInt) {
        updated = schedules.map(r => r.id === editingInt.id ? formData : r);
        setSchedules(updated);
        await dbSync.write('interview_schedules', updated);
        MySwal.fire({ icon: 'success', title: 'Schedule Updated!', text: 'Successfully modified interview nader.', timer: 2000, showConfirmButton: false });
      } else {
        updated = [formData, ...schedules];
        setSchedules(updated);
        await dbSync.write('interview_schedules', updated);
        MySwal.fire({ icon: 'success', title: 'Schedule Created!', text: 'A new interview schedule was recorded.', timer: 2000, showConfirmButton: false });
      }
    } catch (err) {
      console.error(err);
      MySwal.fire('Error', 'Failed to save record to backend.', 'error');
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check lock
    const target = schedules.find(s => s.id === id);
    if (policies.lockCompleted && target?.status === 'Completed') {
      MySwal.fire('Policy Alert', 'Cannot delete completed interview schedules under active security rules.', 'warning');
      return;
    }

    MySwal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this interview schedule!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#932c2e',
      cancelButtonColor: '#7a8b95',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const updated = schedules.filter(int => int.id !== id);
          setSchedules(updated);
          await dbSync.delete('interview_schedules', [{ id }]);
          MySwal.fire('Deleted!', 'Interview record was successfully removed.', 'success');
        } catch (err) {
          console.error(err);
          MySwal.fire('Error', 'Failed to delete record.', 'error');
        }
      }
    });
  };

  const handleStatusChange = async (id: string, newStatus: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = schedules.map(int => int.id === id ? { ...int, status: newStatus } : int);
      setSchedules(updated);
      await dbSync.write('interview_schedules', updated);
      MySwal.fire({ icon: 'success', toast: true, position: 'top-end', title: `Status marked as ${newStatus}`, showConfirmButton: false, timer: 1500 });
    } catch (err) {
      console.error(err);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    let colorClass = "bg-[#f3f3f1] text-[#606a5f] border-[#d1d1d5]";
    if (status === 'Confirmed') colorClass = "bg-[#3f809e]/10 text-[#3f809e] border-[#3f809e]/30";
    else if (status === 'Completed') colorClass = "bg-[#508660]/10 text-[#508660] border-[#508660]/30";
    else if (status === 'Cancelled') colorClass = "bg-[#b22026]/10 text-[#b22026] border-[#b22026]/30";
    else if (status === 'Pending') colorClass = "bg-[#b58c4f]/10 text-[#b58c4f] border-[#b58c4f]/30";
    
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${colorClass}`}>
        {status}
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
      <InterviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} record={editingInt} onSave={handleSaveSchedule} />
      {/* HEADER SECTION (NO Background, directly on parent) */}
      <div className="h-14 px-8 flex flex-row items-center justify-between gap-4 z-20 shrink-0">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center group cursor-default shrink-0">
            <div className="absolute inset-0 bg-[#3f809e] blur-[15px] opacity-20 rounded-full group-hover:opacity-60 transition-all duration-700"></div>
            <div className="relative z-10 p-1.5 border border-[#3f809e]/40 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm">
              <CalendarCheck size={28} strokeWidth={2.5} className="text-[#3f809e]" />
            </div>
          </div>
          <div>
            <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none" style={{ fontSize: '24px' }}>
              INTERVIEW <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3f809e] to-[#b58c4f]">SCHEDULE</span>
            </h3>
            <p className="text-[11px] font-bold text-[#4d5a44] uppercase tracking-[0.2em] mt-0.5 opacity-80 leading-none">
              TIME MANAGEMENT & CANDIDATE COORDINATION HUB
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white/50 p-1.5 rounded-xl border border-white/60 shadow-inner flex flex-wrap items-center gap-1">
            <button onClick={() => setActiveTab('schedule')} className={`px-6 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'schedule' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#7a8b95] hover:text-[#a94228]'}`}>
              <LayoutList size={16} /> Global Schedules
            </button>
            <button onClick={() => setActiveTab('settings')} className={`px-6 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'settings' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#7a8b95] hover:text-[#a94228]'}`}>
              <Settings size={16} /> HR Policies Settings
            </button>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-8 w-full mt-[2px]">
        <div className="w-full">
          
          {/* KPI STATS (Streamlined lean padding) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3 shrink-0">
            <KpiCard
              label="Active Schedules"
              value={kpiData.total}
              icon={LayoutList}
              color={THEME.primary}
              description="Managed Pipeline" />
            <KpiCard
              label="Today Interviews"
              value={kpiData.today}
              icon={Clock}
              color={kpiData.today > 0 ? THEME.gold : THEME.dustyBlue}
              description="Requires Presence" />
            <KpiCard
              label="Confirmed"
              value={kpiData.confirmed}
              icon={CheckCircle2}
              color={THEME.success}
              description="Candidate Accepted" />
            <KpiCard
              label="Conversion Audit"
              value={`${Math.round((kpiData.completed / (kpiData.total || 1)) * 100)}%`}
              icon={TrendingUp}
              color={THEME.skyBlue}
              description="Completed State" />
          </div>

          {activeTab === 'schedule' ? (
            <div className="bg-white rounded-3xl shadow-lg border border-[#eaeaec] overflow-hidden flex flex-col  flex-1 min-h-0">
              
              {/* TOOLBAR */}
              <div className="px-6 py-4 border-b border-[#eaeaec] bg-[#f8f9fa] flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-700 outline-none focus:border-[#3f809e] shadow-sm cursor-pointer select">
                    {STATUSES.map(s => <option key={s} value={s}>Status: {s}</option>)}
                  </select>
                  <span className="text-slate-300 hidden lg:block">|</span>
                  <div className="relative flex-1 md:w-80">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search candidate, job description, ticket ID..." className="w-full pl-10 pr-6 py-2.5 text-[11px] border border-slate-200 rounded-xl font-bold outline-none focus:border-[#b58c4f] bg-white text-[#212c46] placeholder-slate-400" />
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
                  <button onClick={() => handleOpenModal()} className="bg-[#212c46] hover:bg-[#3f809e] text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md transition-all flex items-center gap-2 cursor-pointer">
                    <Plus size={14} strokeWidth={3} /> New Schedule
                  </button>
                </div>
              </div>

              {/* DATA TABLE (Standard head py-4 222b38, border-b-2 709654, py-2.5 px-4, text-[12px]) */}
              <div className="overflow-x-auto custom-scrollbar bg-white flex-1 min-h-0">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead className="bg-[#222b38] text-white">
                    <tr className="border-b-2 border-[#709654]">
                      <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-white bg-[#222b38]">Candidate Profile</th>
                      <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-white bg-[#222b38]">Applied Position</th>
                      <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-white bg-[#222b38] text-center">Schedule (Date/Time)</th>
                      <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-white bg-[#222b38]">Venue / Link</th>
                      <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-white bg-[#222b38] text-center">Status</th>
                      <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-white bg-[#222b38] text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {paginatedData.map((int) => (
                      <tr key={int.id} className="hover:bg-slate-50/70 transition-colors group cursor-pointer" onClick={() => handleOpenModal(int)}>
                        <td className="py-2.5 px-4 text-[12px]">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shadow-sm shrink-0 bg-slate-100 flex items-center justify-center text-slate-500 font-extrabold text-[12px]">
                              {int.candidate.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-black text-slate-800 text-[12px] tracking-tight leading-none mb-1">{int.candidate}</span>
                              <span className="font-tech text-[#3f809e] text-[9.5px] font-black uppercase tracking-wider leading-none">#{int.ticketId}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-[12px]">
                          <p className="font-black text-slate-700 uppercase leading-none">{int.jobTitle}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Users size={11} className="text-[#b58c4f] shrink-0" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase truncate max-w-[200px]">
                              {int.interviewers && int.interviewers.length > 0 
                                ? int.interviewers.join(', ') 
                                : 'No interviewer assigned'}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-[12px] text-center">
                          <p className="font-bold text-slate-700 font-tech">{int.date}</p>
                          <p className="text-[10.5px] font-bold text-slate-500 font-tech mt-0.5 uppercase">{int.time}</p>
                        </td>
                        <td className="py-2.5 px-4 text-[12px]">
                          <div className="flex items-start gap-2">
                            {int.mode === 'Online' ? <Video size={13} className="text-[#3f809e] mt-0.5 shrink-0" /> : <MapPin size={13} className="text-[#b58c4f] mt-0.5 shrink-0" />}
                            <div>
                              <p className="font-black text-slate-800 leading-none">{int.mode}</p>
                              {int.mode === 'Online' ? (
                                <a href={int.location} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="hover:underline text-[11px] text-[#3f809e] font-bold mt-1 inline-flex items-center gap-1">
                                  Link Join <ExternalLink size={10} />
                                </a>
                              ) : (
                                <span className="text-[10.5px] text-slate-500 font-medium">{int.location}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <StatusBadge status={int.status} />
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <div className="flex justify-center items-center gap-[1px]" onClick={(e) => e.stopPropagation()}>
                            {int.status === 'Pending' && (
                              <button onClick={(e) => handleStatusChange(int.id, 'Confirmed', e)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#508660] hover:bg-[#508660]/10 transition-all active:scale-90" title="Confirm Interview">
                                <CheckCircle2 size={15} strokeWidth={2.5} />
                              </button>
                            )}
                            {int.status === 'Confirmed' && (
                              <button onClick={(e) => handleStatusChange(int.id, 'Completed', e)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#3f809e] hover:bg-[#3f809e]/10 transition-all active:scale-90" title="Mark Completed">
                                <Check size={16} strokeWidth={3} />
                              </button>
                            )}
                            <button onClick={() => handleOpenModal(int)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#606a5f] hover:bg-slate-100 transition-all active:scale-90" title="Edit Interview">
                              <Pencil size={13} />
                            </button>
                            <button onClick={(e) => handleDelete(int.id, e)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#b22026] hover:bg-[#b22026]/10 transition-all active:scale-90" title="Delete Schedule">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {paginatedData.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-16 text-slate-400 font-bold text-[13px]">
                          No interview schedules found fitting filter criteria.
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
                  <p className="bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm font-tech">Total: {filteredSchedules.length}</p>
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
            // --- Standard security registry tab layout derived from UserPermissions ---
            (<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left sidebar card policies */}
              <div className="lg:col-span-4 bg-white p-6 rounded-3xl shadow-lg border border-[#eaeaec] animate-fadeIn h-fit">
                <h3 className="text-[13px] font-black text-[#212c46] uppercase tracking-widest flex items-center gap-3 border-b-2 border-[#b58c4f] pb-3 mb-5">
                  <ShieldAlert size={18} className="text-[#b58c4f]" /> HR SECURITY POLICIES
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-[#f8f9fa] border border-[#eaeaec] rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 text-[#3f809e] font-black text-[11.5px] uppercase tracking-wider mb-1"><Info size={16}/> Active Syncing</div>
                    <p className="text-[11px] text-[#414757] font-bold leading-relaxed">กระบวนการบันทึกสถานะจะอิงตามระบบรักษาความปลอดภัย โดยข้อมูลทั้งหมดและประวัติวันเวลาต้องตรงสถิติหลักจริงของ HR เท่านั้น</p>
                  </div>
                  <div className="p-4 bg-[#932c2e]/10 border border-[#932c2e]/20 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 text-[#932c2e] font-black text-[11.5px] uppercase tracking-wider mb-1"><ShieldCheck size={16}/> Reschedule Lock</div>
                    <p className="text-[11px] text-[#414757] font-bold leading-relaxed">เมื่อเปิดใช้งาน นโยบายล็อคผลสัมภาษณ์ (Lock Assessment) จะป้องกันการแก้ไข คืนสิทธิ์ และลบข้อมูลใดๆ เพื่อความเที่ยงตรง</p>
                  </div>
                </div>
              </div>
              {/* Right config list card */}
              <div className="lg:col-span-8 bg-white rounded-3xl shadow-lg border border-[#eaeaec] overflow-hidden">
                <div className="p-5 bg-[#f8f9fa] border-b border-[#eaeaec]">
                  <h4 className="text-[13px] font-black uppercase text-[#212c46] tracking-widest flex items-center gap-3">
                    <Sliders size={18} className="text-[#b58c4f]"/> SYSTEM CRITERIA SETTINGS
                  </h4>
                </div>
                <div className="p-6 space-y-4">
                  
                  {/* Policies Checkboxes styled identically to UserPermissions */}
                  <div className="flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 border border-[#eaeaec] rounded-2xl transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#3f809e]/10 text-[#3f809e] flex items-center justify-center">
                        <Bell size={18} />
                      </div>
                      <div>
                        <p className="text-[12px] font-extrabold text-[#212c46] uppercase">Auto-Send Invitation (แจ้งผู้สมัคร)</p>
                        <p className="text-[10px] text-slate-500 font-bold">ส่งอีเมลลิงก์และวันสัมภาษณ์อัตโนมัติแจ้งเตือนเมื่อนัดนัดหมายเสร็จสมบูรณ์</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setPolicies(p => ({ ...p, autoNotify: !p.autoNotify }))}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-all ${policies.autoNotify ? 'bg-[#508660]' : 'bg-slate-300'}`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all ${policies.autoNotify ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 border border-[#eaeaec] rounded-2xl transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#b58c4f]/10 text-[#b58c4f] flex items-center justify-center">
                        <Sliders size={18} />
                      </div>
                      <div>
                        <p className="text-[12px] font-extrabold text-[#212c46] uppercase">Allow Candidate Reschedule (ขอเลื่อนนัดหมาย)</p>
                        <p className="text-[10px] text-slate-500 font-bold">เปิดสิทธิ์ให้ผู้สมัครสามารถตอบรับหรือส่งลิ้งก์ขอเลือกคิวขยับเวลาใหม่กลับมาที่ระบบได้</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setPolicies(p => ({ ...p, allowReschedule: !p.allowReschedule }))}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-all ${policies.allowReschedule ? 'bg-[#508660]' : 'bg-slate-300'}`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all ${policies.allowReschedule ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 border border-[#eaeaec] rounded-2xl transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#932c2e]/10 text-[#932c2e] flex items-center justify-center">
                        <ShieldAlert size={18} />
                      </div>
                      <div>
                        <p className="text-[12px] font-extrabold text-[#212c46] uppercase">Lock Assessment Records (ล็อคนัดหมายสำเร็จ)</p>
                        <p className="text-[10px] text-slate-500 font-bold">ป้องกันการคืนความลับหรือลดสิทธิ์ และไม่อนุญาตให้ทำการลบเมื่อสถานะประวัติสัมภาษณ์เสร็จสมบูรณ์</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setPolicies(p => ({ ...p, lockCompleted: !p.lockCompleted }))}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-all ${policies.lockCompleted ? 'bg-[#508660]' : 'bg-slate-300'}`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all ${policies.lockCompleted ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 border border-[#eaeaec] rounded-2xl transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#212c46]/10 text-[#212c46] flex items-center justify-center">
                        <CalendarCheck size={18} />
                      </div>
                      <div>
                        <p className="text-[12px] font-extrabold text-[#212c46] uppercase">Google Calendar Multi-Sync (ซิงค์ปฏิทินกลาง)</p>
                        <p className="text-[10px] text-slate-500 font-bold">ล็อกช่วงจองคิวทีมและส่งคำยืนยันเวลากลางลงระบบบัญชี Google ของ HR ออฟฟิศทันที</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setPolicies(p => ({ ...p, calendarSync: !p.calendarSync }))}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-all ${policies.calendarSync ? 'bg-[#508660]' : 'bg-slate-300'}`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all ${policies.calendarSync ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </button>
                  </div>

                </div>
              </div>
            </div>)
          )}

          {/* Spacer setting precisely space-y gap of 32px before the main Footer */}
          

        </div>
      </div>
    </div>
  );
}
