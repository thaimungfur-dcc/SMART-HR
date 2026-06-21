import { UserGuidePanel } from '../../components/shared/UserGuidePanel';
import KpiCard from '../../components/shared/KpiCard';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { 
  UserPlus, Search, Plus, Trash2, X, Save, Edit2, CheckCircle2, AlertCircle, 
  Briefcase, FileText, Send, Clock, UserCheck, Inbox, ArrowRight, TrendingUp, HelpCircle,
  LayoutGrid, Users, Award, ShieldCheck, Mail, MapPin, Eye, Pencil, Trash, Filter, Info, 
  Settings, ChevronLeft, ChevronRight, Compass, Settings2, Sliders, Database
} from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { DraggableModal } from '../../components/shared/DraggableModal';
import { dbSync } from '../../services/dbSync';
import { useLanguage } from '../../context/LanguageContext';

const MySwal = withReactContent(Swal);

// --- Theme Configuration (Synced exactly with Home & User Permissions palette) ---
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
} as const;

// Preset Avatars for candidate creation
const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=250',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=250',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=250',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=250',
];

interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  stage: 'Applied' | 'Interview' | 'Offered' | 'Hired';
  dateApplied: string;
  joinDate?: string;
  salaryExpectation?: string;
  img: string;
  rating?: number;
  notes?: string;
}

interface ManpowerRequest {
  id: string;
  position: string;
  department: string;
  requestedBy: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  count: number;
  priority: 'High' | 'Normal' | 'Urgent';
  targetDate: string;
}

interface JobOpening {
  id: string;
  title: string;
  department: string;
  salaryRange: string;
  status: 'Active' | 'Draft' | 'Expired';
  applicantsCount: number;
  description: string;
}

interface PlanningRecord {
  id: string;
  department: string;
  targetHeadcount: number;
  currentHeadcount: number;
  openingsCount: number;
  quarterPlan: string;
}

const PIPELINE_STAGES = [
  { id: 'Applied', label: 'Applied (ยื่นใบสมัคร)', color: '#7a8b95', icon: Inbox },
  { id: 'Interview', label: 'Interview (สัมภาษณ์)', color: '#3f809e', icon: Users },
  { id: 'Offered', label: 'Offered (ยื่นข้อเสนอ)', color: '#b58c4f', icon: Send },
  { id: 'Hired', label: 'Hired (รับเข้าทำงาน)', color: '#657f4d', icon: UserCheck }
] as const;

export default function Recruitment() {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  
  // Tabs: 'requests' | 'planning' | 'openings' | 'candidates' | 'settings'
  const [activeTab, setActiveTab] = useState<'requests' | 'planning' | 'openings' | 'candidates' | 'settings'>('candidates');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Real database synchronous state
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [requests, setRequests] = useState<ManpowerRequest[]>([]);
  const [openings, setOpenings] = useState<JobOpening[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination standard states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals controller
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [editCandidate, setEditCandidate] = useState<Candidate | null>(null);

  // Policy configurations standardized with User Permissions
  const [policies, setPolicies] = useState({
    autoApprove: true,
    recruitmentLock: false,
    externalSync: false,
    standardClosingDays: 30
  });

  // Candidate editor input states
  const [candName, setCandName] = useState('');
  const [candEmail, setCandEmail] = useState('');
  const [candPosition, setCandPosition] = useState('');
  const [candDepartment, setCandDepartment] = useState('');
  const [candStage, setCandStage] = useState<'Applied' | 'Interview' | 'Offered' | 'Hired'>('Applied');
  const [candJoinDate, setCandJoinDate] = useState('');
  const [candSalary, setCandSalary] = useState('');
  const [candImg, setCandImg] = useState(AVATAR_PRESETS[0]);
  const [candNotes, setCandNotes] = useState('');

  // Sample static manpower planning database targets
  const planningRecords: PlanningRecord[] = [
    { id: 'PLN-001', department: 'Digital Tech', targetHeadcount: 18, currentHeadcount: 16, openingsCount: 1, quarterPlan: 'Q3-2026' },
    { id: 'PLN-002', department: 'Innovation', targetHeadcount: 8, currentHeadcount: 7, openingsCount: 0, quarterPlan: 'Q3-2026' },
    { id: 'PLN-003', department: 'Production', targetHeadcount: 55, currentHeadcount: 52, openingsCount: 2, quarterPlan: 'Q3-2026' },
    { id: 'PLN-004', department: 'People', targetHeadcount: 6, currentHeadcount: 5, openingsCount: 1, quarterPlan: 'Q3-2026' },
    { id: 'PLN-005', department: 'Marketing', targetHeadcount: 10, currentHeadcount: 9, openingsCount: 0, quarterPlan: 'Q3-2026' }
  ];

  // Sync route properties with the active tab structure
  useEffect(() => {
    if (tab) {
      if (tab === 'vacancies' || tab === 'openings') {
        setActiveTab('openings');
      } else if (tab === 'tracking' || tab === 'candidates') {
        setActiveTab('candidates');
      } else if (tab === 'request' || tab === 'requests') {
        setActiveTab('requests');
      } else if (tab === 'planning') {
        setActiveTab('planning');
      } else if (tab === 'settings') {
        setActiveTab('settings');
      }
    }
  }, [tab]);

  const handleTabChange = (newTab: 'requests' | 'planning' | 'openings' | 'candidates' | 'settings') => {
    setActiveTab(newTab);
    setCurrentPage(1);
    if (newTab === 'openings') {
      navigate('/recruitment/vacancies');
    } else if (newTab === 'candidates') {
      navigate('/recruitment/tracking');
    } else if (newTab === 'requests') {
      navigate('/recruitment/request');
    } else if (newTab === 'planning') {
      navigate('/recruitment/planning');
    } else if (newTab === 'settings') {
      navigate('/recruitment/settings');
    }
  };

  // Pre-fetch/seed database items
  useEffect(() => {
    const loadAllRecruitmentData = async () => {
      setIsLoading(true);
      try {
        // 1. Candidates Fetch
        const candRes = await dbSync.read('candidates');
        if (candRes && candRes.status === 'success' && candRes.data && Array.isArray(candRes.data.items) && candRes.data.items.length > 0) {
          setCandidates(candRes.data.items);
        } else {
          // Pure original mock dataset
          const initialCandidates: Candidate[] = [
            { id: 'CAND-001', name: 'พิมพพรรณ สวยงาม', email: 'pimphan.s@gmail.com', position: 'UX/UI DESIGNER', department: 'Innovation', stage: 'Hired', dateApplied: '2026-05-10', joinDate: '2026-06-01', salaryExpectation: '45,000 THB', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop', notes: 'Excellent visual design skills and presentation quality.' },
            { id: 'CAND-002', name: 'ธนวัฒน์ มาดี', email: 'thanawat.m@gmail.com', position: 'FULLSTACK DEV', department: 'Digital Tech', stage: 'Hired', dateApplied: '2026-05-12', joinDate: '2026-06-02', salaryExpectation: '55,000 THB', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop', notes: 'Strong backend foundation with Express and structural optimization.' },
            { id: 'CAND-003', name: 'เกริกพล ขยันงาน', email: 'krikphon.k@gmail.com', position: 'HR SPECIALIST', department: 'People', stage: 'Hired', dateApplied: '2026-05-15', joinDate: '2026-06-05', salaryExpectation: '38,000 THB', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop', notes: 'Great communication style, has good background in talent acquisition.' },
            { id: 'CAND-004', name: 'อนุกูล พรดี', email: 'anukul.p@gmail.com', position: 'Senior QA Engineer', department: 'IT', stage: 'Interview', dateApplied: '2026-05-20', salaryExpectation: '48,000 THB', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250', notes: 'Experienced in automated testing APIs.' },
            { id: 'CAND-005', name: 'จารุวรรณ ชื่นมื่น', email: 'jaruwan.c@gmail.com', position: 'Social Content Writer', department: 'Marketing', stage: 'Applied', dateApplied: '2026-06-01', salaryExpectation: '28,000 THB', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250', notes: 'Drafting impressive copy and creative blogs.' }
          ];
          setCandidates(initialCandidates);
          await dbSync.write('candidates', initialCandidates);
        }

        // 2. Manpower Requests Fetch
        const reqRes = await dbSync.read('manpower_requests');
        if (reqRes && reqRes.status === 'success' && reqRes.data && Array.isArray(reqRes.data.items) && reqRes.data.items.length > 0) {
          setRequests(reqRes.data.items);
        } else {
          const initialRequests: ManpowerRequest[] = [
            { id: 'MPR-001', position: 'Production Engineer', department: 'Production', count: 2, status: 'Approved', priority: 'High', targetDate: '2026-07-01', requestedBy: 'คุณชลวิทย์ (Lead Engineer)' },
            { id: 'MPR-002', position: 'Technical Recruiter', department: 'People', count: 1, status: 'Pending', priority: 'Normal', targetDate: '2026-07-15', requestedBy: 'คุณสมชาย (HR Manager)' },
            { id: 'MPR-003', position: 'Fullstack Developer', department: 'Digital Tech', count: 1, status: 'Approved', priority: 'Urgent', targetDate: '2026-06-30', requestedBy: 'คุณกิตติพงษ์ (IT Lead)' }
          ];
          setRequests(initialRequests);
          await dbSync.write('manpower_requests', initialRequests);
        }

        // 3. Job Openings Fetch
        const opRes = await dbSync.read('job_openings');
        if (opRes && opRes.status === 'success' && opRes.data && Array.isArray(opRes.data.items) && opRes.data.items.length > 0) {
          const normalized = opRes.data.items.map((v: any) => {
            const dep = v.department || v.dept || 'Information Technology';
            const stat = (v.status === 'Published' || v.status === 'Active') ? 'Active' : (v.status === 'Closed' || v.status === 'Expired') ? 'Expired' : 'Draft';
            const apps = v.applicantsCount !== undefined ? Number(v.applicantsCount) : (v.applications !== undefined ? Number(v.applications) : 0);
            return {
              ...v,
              department: dep,
              dept: dep,
              status: stat,
              applicantsCount: apps,
              applications: apps,
              jobId: v.jobId || `JOB-2605-${String(v.id).replace(/\D/g, '') || '99'}`,
              jdRef: v.jdRef || 'Custom',
              headcount: v.headcount || 1,
              type: v.type || 'Full-time',
              location: v.location || 'Headquarters (Bangkok)',
              postedDate: v.postedDate || '2026-06-01',
              closingDate: v.closingDate || '2026-07-31',
              salaryRange: v.salaryRange || '30,000 - 50,050 THB',
              description: v.description || ''
            };
          });
          setOpenings(normalized);
        } else {
          const initialOpenings: JobOpening[] = [
            { id: 'OPN-001', title: 'Senior Software Engineer (React / NodeJS)', department: 'Information Technology', salaryRange: '60,000 - 90,000 THB', status: 'Active', applicantsCount: 18, description: 'Design and build high-performance reactive web dashboards and core database models using serverless integrations and modern architectures.' },
            { id: 'OPN-002', title: 'Quality Auditor (QA / ISO9001)', department: 'Production', salaryRange: '35,000 - 45,000 THB', status: 'Active', applicantsCount: 7, description: 'Perform full inspections, compliance reviews, vendor criteria checks, and regular document audits under ISO9001 standard practices.' },
            { id: 'OPN-003', title: 'Product Representative', department: 'Marketing', salaryRange: '25,000 - 35,000 THB', status: 'Draft', applicantsCount: 0, description: 'Develop robust, aesthetic marketing messages, present newly designed product features, and host customer evaluation workshops.' }
          ];
          setOpenings(initialOpenings);
          await dbSync.write('job_openings', initialOpenings);
        }
      } catch (err) {
        console.error('Failed to load recruitment data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAllRecruitmentData();
  }, []);

  // Filter computation rules
  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [candidates, searchTerm]);

  const filteredOpenings = useMemo(() => {
    return openings.filter(op => 
      op.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (op.salaryRange && op.salaryRange.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (op.description && op.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [openings, searchTerm]);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => 
      req.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.priority.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [requests, searchTerm]);

  const itemsForPagination = useMemo(() => {
    if (activeTab === 'candidates') return filteredCandidates;
    if (activeTab === 'openings') return filteredOpenings;
    if (activeTab === 'requests') return filteredRequests;
    return planningRecords;
  }, [activeTab, filteredCandidates, filteredOpenings, filteredRequests, planningRecords]);

  const currentPaginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return itemsForPagination.slice(startIndex, startIndex + itemsPerPage);
  }, [itemsForPagination, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(itemsForPagination.length / itemsPerPage) || 1;

  // Evaluation KPI stats
  const stats = useMemo(() => {
    return {
      applied: candidates.filter(c => c.stage === 'Applied').length,
      interview: candidates.filter(c => c.stage === 'Interview').length,
      offered: candidates.filter(c => c.stage === 'Offered').length,
      hired: candidates.filter(c => c.stage === 'Hired').length,
      activeOpenings: openings.filter(o => o.status === 'Active').length,
      pendingRequests: requests.filter(r => r.status === 'Pending').length,
    };
  }, [candidates, openings, requests]);

  // Modal actions handlers
  const handleOpenCandidateModal = (cand: Candidate | null = null) => {
    if (policies.recruitmentLock) {
      MySwal.fire({ icon: 'error', title: 'Recruitment Locked', text: 'ระบบสรรหากำลังปิดระงับแก้ไขชั่วคราวผ่าน ATS Global Lock' });
      return;
    }
    if (cand) {
      setEditCandidate(cand);
      setCandName(cand.name);
      setCandEmail(cand.email);
      setCandPosition(cand.position);
      setCandDepartment(cand.department);
      setCandStage(cand.stage);
      setCandJoinDate(cand.joinDate || '');
      setCandSalary(cand.salaryExpectation || '');
      setCandImg(cand.img || AVATAR_PRESETS[0]);
      setCandNotes(cand.notes || '');
    } else {
      setEditCandidate(null);
      setCandName('');
      setCandEmail('');
      setCandPosition('');
      setCandDepartment('');
      setCandStage('Applied');
      setCandJoinDate('');
      setCandSalary('');
      setCandImg(AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)]);
      setCandNotes('');
    }
    setIsCandidateModalOpen(true);
  };

  const handleSaveCandidate = async () => {
    if (!candName || !candEmail || !candPosition || !candDepartment) {
      MySwal.fire({ icon: 'error', title: 'Missing Fields', text: 'กรุณากรอกข้อมูล ชื่อ, อีเมล, ตำแหน่งงาน และแผนกความต้องการให้ครบถ้วน' });
      return;
    }

    try {
      let updatedCandidates = [...candidates];
      if (editCandidate) {
        updatedCandidates = candidates.map(c => String(c.id) === String(editCandidate.id) ? {
          ...c,
          name: candName,
          email: candEmail,
          position: candPosition,
          department: candDepartment,
          stage: candStage,
          joinDate: candJoinDate,
          salaryExpectation: candSalary,
          img: candImg,
          notes: candNotes
        } : c);
        await dbSync.write('candidates', updatedCandidates);
        MySwal.fire({ icon: 'success', title: 'Candidate Updated', showConfirmButton: false, timer: 1500 });
      } else {
        const newCand: Candidate = {
          id: 'CAND-' + Date.now().toString().slice(-6),
          name: candName,
          email: candEmail,
          position: candPosition,
          department: candDepartment,
          stage: candStage,
          dateApplied: new Date().toISOString().split('T')[0],
          joinDate: candJoinDate,
          salaryExpectation: candSalary,
          img: candImg,
          notes: candNotes
        };
        updatedCandidates.push(newCand);
        await dbSync.write('candidates', updatedCandidates);
        MySwal.fire({ icon: 'success', title: 'Candidate Registered', showConfirmButton: false, timer: 1500 });
      }
      setCandidates(updatedCandidates);
      setIsCandidateModalOpen(false);
    } catch (err) {
      console.error(err);
      MySwal.fire({ icon: 'error', title: 'Saving Failed', text: 'An error occurred during database update.' });
    }
  };

  const handleUpdateStage = async (candId: string, nextStage: 'Applied' | 'Interview' | 'Offered' | 'Hired') => {
    if (policies.recruitmentLock) {
      MySwal.fire({ icon: 'error', title: 'Recruitment Locked', text: 'การแก้ไขสถานะปิดระงับผ่านนโยบายความมั่นคง' });
      return;
    }
    try {
      const updatedCandidates = candidates.map(c => String(c.id) === String(candId) ? { ...c, stage: nextStage } : c);
      setCandidates(updatedCandidates);
      await dbSync.write('candidates', updatedCandidates);
      
      MySwal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        icon: 'success',
        title: `Moved to ${nextStage}`
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCandidate = async (candId: string) => {
    if (policies.recruitmentLock) {
      MySwal.fire({ icon: 'error', title: 'Recruitment Locked' });
      return;
    }
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: "คุณต้องการถอนรายชื่อรหัสผู้สมัครรายนี้ออกจากฐานข้อมูลหรือไม่?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#932c2e',
      cancelButtonColor: '#ccd0db',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const updated = candidates.filter(c => String(c.id) !== String(candId));
        setCandidates(updated);
        await dbSync.delete('candidates', [{ id: candId }]);
        MySwal.fire('Deleted!', 'Candidate record has been successfully removed.', 'success');
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="flex flex-1 w-full flex-col animate-fadeIn bg-transparent space-y-4 select-none pb-6 min-h-0">
      {/* 1. Header user guide floating tab */}
      <button 
        onClick={() => setIsGuideOpen(true)} 
        className="fixed right-0 bg-[#f8f9fa] border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#709654] hover:text-white hover:border-[#709654] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group" 
        style={{ top: '80px' }}
      >
        <HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#7a8b95] group-hover:text-white" />
        <span className="font-black tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[11px] font-mono">USER GUIDE</span>
      </button>
      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      {/* 2. Page Header Bar - bg-transparent, placed directly on home page background */}
      <div className="h-14 px-8 flex flex-row items-center justify-between gap-4 z-20 shrink-0 bg-transparent mt-2">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center group cursor-default shrink-0">
            <div className="absolute inset-0 bg-[#709654] blur-[15px] opacity-20 rounded-full group-hover:opacity-60 transition-all duration-700"></div>
            <div className="relative z-10 p-1.5 border border-[#709654]/40 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm">
              <UserPlus size={28} strokeWidth={2.5} className="text-[#657f4d]" />
            </div>
          </div>
          <div>
            <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none" style={{ fontSize: '24px' }}>
              RECRUITMENT <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#657f4d] to-[#b58c4f]">ATS PORTAL</span>
            </h3>
            <p className="text-[11px] font-bold text-[#606a5f] uppercase tracking-[0.2em] mt-0.5 opacity-80 leading-none">
              TALENT PIPELINES, VACANCIES & SYSTEM AUDITING
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white/50 p-1.5 rounded-xl border border-white/60 shadow-inner flex flex-wrap items-center gap-1">
            <button onClick={() => handleTabChange('candidates')} className={`px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${activeTab === 'candidates' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#7a8b95] hover:text-[#a94228]'}`}>
              <UserPlus size={14} /> Candidates
            </button>
            <button onClick={() => handleTabChange('openings')} className={`px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${activeTab === 'openings' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#7a8b95] hover:text-[#a94228]'}`}>
              <Briefcase size={14} /> Openings
            </button>
            <button onClick={() => handleTabChange('requests')} className={`px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${activeTab === 'requests' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#7a8b95] hover:text-[#a94228]'}`}>
              <FileText size={14} /> Requests
            </button>
            <button onClick={() => handleTabChange('planning')} className={`px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${activeTab === 'planning' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#7a8b95] hover:text-[#a94228]'}`}>
              <TrendingUp size={14} /> Planning
            </button>
            <button onClick={() => handleTabChange('settings')} className={`px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${activeTab === 'settings' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#7a8b95] hover:text-[#a94228]'}`}>
              <Settings size={14} /> Global Settings
            </button>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-8 w-full mt-[2px]">
        
        {/* 3. Local KPI Cards - Padding adjusted tighter and leaner but pristine */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <KpiCard
            label="Active Postings"
            value={stats.activeOpenings}
            icon={Briefcase}
            color="#3f809e"
            description="Live Vacancies" />
          <KpiCard
            label="Total Pipelines"
            value={candidates.length}
            icon={UserPlus}
            color="#212c46"
            description="Enrolled Talents" />
          <KpiCard
            label="Pending Approval"
            value={stats.pendingRequests}
            icon={Clock}
            color="#b58c4f"
            description="Awaiting Actions" />
          <KpiCard
            label="Successful Hires"
            value={stats.hired}
            icon={CheckCircle2}
            color="#657f4d"
            description="Joined Family" />
        </div>

        {/* 4. Main Body Grid Container */}
        <div className="bg-white rounded-3xl shadow-lg border border-[#eaeaec] overflow-hidden flex flex-col animate-fadeIn  flex-1 min-h-0">
          
          {/* SEARCH BAR & GENERAL FILTERS */}
          {activeTab !== 'settings' && (
            <div className="px-6 py-4 border-b border-[#eaeaec] bg-[#f8f9fa] flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7a8b95]" />
                  <input 
                    type="text" 
                    value={searchTerm} 
                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                    placeholder="Search applicant name, job keywords, specialty..." 
                    className="w-full pl-11 pr-6 py-2 border border-[#eaeaec] rounded-full text-[12px] font-bold outline-none focus:border-[#709654] bg-white text-[#212c46] shadow-sm transition-colors" 
                  />
                </div>
                {activeTab === 'candidates' && (
                  <div className="flex bg-[#f8f9fa] border border-[#eaeaec] p-1 rounded-full shadow-sm inline-flex">
                    <button onClick={() => setViewMode('kanban')} className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === 'kanban' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#7a8b95]'}`}>
                      <LayoutGrid size={12} /> Kanban
                    </button>
                    <button onClick={() => setViewMode('list')} className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === 'list' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#7a8b95]'}`}>
                      <FileText size={12} /> List Matrix
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                {activeTab === 'candidates' && (
                  <button 
                    onClick={() => handleOpenCandidateModal(null)} 
                    className="bg-[#212c46] text-white px-5 py-2 rounded-full font-black text-[12px] uppercase tracking-widest shadow-md hover:bg-[#709654] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={16} /> New Candidate
                  </button>
                )}
                {activeTab === 'requests' && (
                  <button 
                    onClick={() => {
                      if (policies.recruitmentLock) {
                        MySwal.fire({ icon: 'error', title: 'Recruitment Locked' });
                        return;
                      }
                      MySwal.fire({
                        title: 'Manpower Request / แผนขอเพิ่มกำลังพล',
                        html: `
                          <input id="req-pos" class="swal2-input" placeholder="Position Needed">
                          <input id="req-dept" class="swal2-input" placeholder="Department">
                          <input id="req-count" type="number" class="swal2-input" value="1" placeholder="Headcount">
                          <select id="req-priority" class="swal2-input">
                            <option value="Normal">Priority: Normal</option>
                            <option value="High">Priority: High</option>
                            <option value="Urgent">Priority: Urgent</option>
                          </select>
                          <input id="req-date" type="date" class="swal2-input" placeholder="Target Hiring Date">
                          <input id="req-by" class="swal2-input" placeholder="Request By Officer Name">
                        `,
                        showCancelButton: true,
                        confirmButtonColor: '#212c46',
                        confirmButtonText: 'Submit Request',
                        preConfirm: () => {
                          return {
                            position: (document.getElementById('req-pos') as HTMLInputElement).value,
                            department: (document.getElementById('req-dept') as HTMLInputElement).value,
                            count: Number((document.getElementById('req-count') as HTMLInputElement).value),
                            priority: (document.getElementById('req-priority') as HTMLSelectElement).value,
                            targetDate: (document.getElementById('req-date') as HTMLInputElement).value,
                            requestedBy: (document.getElementById('req-by') as HTMLInputElement).value,
                          }
                        }
                      }).then(async (result) => {
                        if (result.isConfirmed) {
                          const { position, department, count, priority, targetDate, requestedBy } = result.value;
                          if (!position || !department) return;
                          const newReq: ManpowerRequest = {
                            id: 'MPR-' + Date.now().toString().slice(-4),
                            position,
                            department,
                            count: count || 1,
                            priority: priority as any,
                            targetDate: targetDate || new Date().toISOString().split('T')[0],
                            requestedBy: requestedBy || 'Hiring Department Coordinator',
                            status: 'Pending'
                          };
                          const updated = [...requests, newReq];
                          setRequests(updated);
                          await dbSync.write('manpower_requests', updated);
                          MySwal.fire('Submitted!', 'Your manpower request has been recorded.', 'success');
                        }
                      });
                    }}
                    className="bg-[#212c46] text-white px-5 py-2 rounded-full font-black text-[12px] uppercase tracking-widest shadow-md hover:bg-[#709654] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={16} /> New Request
                  </button>
                )}
                {activeTab === 'openings' && (
                  <button 
                    onClick={() => {
                      if (policies.recruitmentLock) {
                        MySwal.fire({ icon: 'error', title: 'Recruitment Locked' });
                        return;
                      }
                      MySwal.fire({
                        title: 'Add Job Opening',
                        html: `
                          <input id="op-title" class="swal2-input" placeholder="Job Title (e.g., Accountant)">
                          <input id="op-dept" class="swal2-input" placeholder="Department (e.g., Marketing)">
                          <input id="op-salary" class="swal2-input" placeholder="Salary Range">
                          <textarea id="op-desc" class="swal2-textarea" placeholder="Job description..."></textarea>
                        `,
                        showCancelButton: true,
                        confirmButtonColor: '#212c46',
                        confirmButtonText: 'Add Position',
                        preConfirm: () => {
                          return {
                            title: (document.getElementById('op-title') as HTMLInputElement).value,
                            department: (document.getElementById('op-dept') as HTMLInputElement).value,
                            salaryRange: (document.getElementById('op-salary') as HTMLInputElement).value,
                            description: (document.getElementById('op-desc') as HTMLTextAreaElement).value
                          }
                        }
                      }).then(async (result) => {
                        if (result.isConfirmed) {
                          const { title, department, salaryRange, description } = result.value;
                          if (!title || !department) return;
                          const newOpId = 'OPN-' + Date.now().toString().slice(-4);
                          const newOp: any = {
                            id: newOpId,
                            title,
                            department,
                            dept: department,
                            salaryRange: salaryRange || 'Negotiable',
                            status: 'Active',
                            applicantsCount: 0,
                            applications: 0,
                            description: description || '',
                            // Extra fields for JobOpenings.tsx compatibility
                            jobId: `JOB-2605-${Date.now().toString().slice(-2)}`,
                            jdRef: 'Custom',
                            headcount: 1,
                            type: 'Full-time',
                            location: 'Headquarters (Bangkok)',
                            postedDate: new Date().toISOString().split('T')[0],
                            closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                          };
                          const updated = [...openings, newOp];
                          setOpenings(updated);
                          await dbSync.write('job_openings', updated);
                          MySwal.fire({ icon: 'success', title: 'Position Added' });
                        }
                      });
                    }}
                    className="bg-[#212c46] text-white px-5 py-2 rounded-full font-black text-[12px] uppercase tracking-widest shadow-md hover:bg-[#709654] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={16} /> New Opening
                  </button>
                )}
              </div>
            </div>
          )}

          {/* DYNAMIC CONTENT SWITCHER */}
          <div className="overflow-auto custom-scrollbar bg-white min-h-[450px]  flex-1 min-h-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-10 h-10 border-4 border-[#212c46]/20 border-t-[#709654] rounded-full animate-spin" />
                <span className="text-[12px] font-black text-[#212c46] uppercase tracking-widest animate-pulse">Synchronizing Security Nodes...</span>
              </div>
            ) : (
              <>
                {/* 1. CANDIDATES PORTAL */}
                {activeTab === 'candidates' && (
                  viewMode === 'kanban' ? (
                    <div className="flex gap-4 p-6 min-w-[1240px] h-full items-start bg-[#fcfdfd]">
                      {PIPELINE_STAGES.map(stage => {
                        const stageCandidates = filteredCandidates.filter(c => c.stage === stage.id);
                        return (
                          <div key={stage.id} className="w-[280px] shrink-0 flex flex-col h-full bg-[#f8f9fa] rounded-2xl border border-[#eaeaec] p-4 shadow-sm">
                            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                              <span className="text-[11px] font-black uppercase text-[#212c46] tracking-wider flex items-center gap-1.5">
                                <stage.icon size={13} style={{ color: stage.color }} />
                                {stage.label}
                              </span>
                              <span className="bg-[#212c46]/5 text-[#212c46] text-[10px] font-bold font-mono px-2 py-0.5 rounded-full">
                                {stageCandidates.length}
                              </span>
                            </div>
                            
                            <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1 pb-4 flex-1">
                              {stageCandidates.map(cand => (
                                <div key={cand.id} className="bg-white border border-[#eaeaec] hover:border-[#709654]/60 p-4 rounded-xl shadow-sm hover:shadow-md transition-all group relative">
                                  <div className="flex items-center gap-3 mb-2">
                                    <img src={cand.img} className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0" alt="" />
                                    <div className="min-w-0 flex-1">
                                      <h4 className="text-[12px] font-black text-[#212c46] truncate group-hover:text-[#657f4d] transition-colors">{cand.name}</h4>
                                      <p className="text-[9px] text-[#7a8b95] uppercase font-black tracking-widest">{cand.department}</p>
                                    </div>
                                  </div>
                                  <p className="text-[12px] font-bold text-slate-800 mb-1">{cand.position}</p>
                                  <p className="text-[10px] text-slate-500 font-mono mb-2">{cand.email}</p>
                                  {cand.notes && <p className="text-[10px] italic text-[#7a8b95] line-clamp-2 bg-slate-50 p-2 rounded-lg mb-3">{cand.notes}</p>}
                                  
                                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                    <button onClick={() => handleDeleteCandidate(cand.id)} className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors" title="Remove Applicant">
                                      <Trash2 size={13} />
                                    </button>
                                    <div className="flex gap-1">
                                      <button onClick={() => handleOpenCandidateModal(cand)} className="px-2 py-1 text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded">
                                        Edit
                                      </button>
                                      {stage.id !== 'Hired' && (
                                        <button 
                                          onClick={() => {
                                            const idx = PIPELINE_STAGES.findIndex(s => s.id === stage.id);
                                            if (idx < PIPELINE_STAGES.length - 1) {
                                              handleUpdateStage(cand.id, PIPELINE_STAGES[idx + 1].id as any);
                                            }
                                          }}
                                          className="px-2 py-1 text-[10px] font-black text-white bg-[#709654] hover:bg-[#5a7a43] rounded flex items-center gap-0.5 uppercase"
                                        >
                                          INVITE <ArrowRight size={10} />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {stageCandidates.length === 0 && (
                                <div className="h-28 border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-center p-6 text-gray-400">
                                  <Inbox size={18} className="opacity-40 mb-1" />
                                  <span className="text-[9px] font-bold uppercase tracking-wider">Empty Pipeline</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* CANDIDATES LIST VIEW (MATRIX) */
                    (<table className="w-full text-left font-sans border-collapse">
                      <thead className="bg-[#222b38] text-white">
                        <tr className="border-b-2 border-[#709654]">
                          <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">Candidate Identity</th>
                          <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">Responsibility Target</th>
                          <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">Information / Metric</th>
                          <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Status Stage</th>
                          <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Action Node</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-[#eaeaec]">
                        {currentPaginatedData.map((item: any) => (
                          <tr key={item.id} className="hover:bg-[#f8f9fa] transition-colors group">
                            <td className="py-2.5 px-4 text-[12px]">
                              <div className="flex items-center gap-4">
                                <img src={item.img} className="w-9 h-9 rounded-xl object-cover border border-[#eaeaec] shadow-sm shrink-0" />
                                <div className="flex flex-col">
                                  <span className="font-extrabold text-[#212c46] uppercase">{item.name}</span>
                                  <span className="text-[10px] text-[#7a8b95] font-mono leading-none mt-0.5">{item.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-4 text-[12px]">
                              <p className="font-black text-[#212c46] uppercase leading-none">{item.position}</p>
                              <p className="text-[11px] font-bold text-[#b58c4f] uppercase mt-1 leading-none">{item.department}</p>
                            </td>
                            <td className="py-2.5 px-4 text-[12px]">
                              <p className="font-bold text-[#4d87a8] uppercase leading-none">Salary: {item.salaryExpectation || 'Negotiable'}</p>
                              <p className="text-[10px] text-[#7a8b95] font-mono mt-1">Applied: {item.dateApplied || '2026-06-01'}</p>
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase border tracking-widest"
                                style={{
                                  backgroundColor: `${PIPELINE_STAGES.find(s=>s.id === item.stage)?.color}10`,
                                  color: PIPELINE_STAGES.find(s=>s.id === item.stage)?.color,
                                  borderColor: `${PIPELINE_STAGES.find(s=>s.id === item.stage)?.color}35`
                                }}
                              >
                                {item.stage}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <div className="flex justify-center items-center gap-[1px]">
                                <button onClick={() => {
                                  const idx = PIPELINE_STAGES.findIndex(s => s.id === item.stage);
                                  if (idx < PIPELINE_STAGES.length - 1) {
                                    handleUpdateStage(item.id, PIPELINE_STAGES[idx + 1].id as any);
                                  } else {
                                    MySwal.fire({ icon: 'info', title: 'Ultimate stage', text: 'ถอนหรือปรับสถานะพนักงานในเมนูปรับแต่ง' });
                                  }
                                }} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#657f4d] bg-[#657f4d]/10 hover:bg-[#657f4d]/20 transition-all active:scale-90" title="Promote Stage">
                                  <ArrowRight size={14} />
                                </button>
                                <button onClick={() => handleOpenCandidateModal(item)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#3f809e] bg-[#3f809e]/10 hover:bg-[#3f809e]/20 transition-all active:scale-90" title="Edit candidate">
                                  <Pencil size={14} />
                                </button>
                                <button onClick={() => handleDeleteCandidate(item.id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#932c2e] bg-[#932c2e]/10 hover:bg-[#932c2e]/20 transition-all active:scale-90" title="Delete record">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {currentPaginatedData.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-gray-400 font-bold text-[12px] uppercase">No candidates matching keyword.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>)
                  )
                )}

                {/* 2. JOB OPENINGS PORTAL */}
                {activeTab === 'openings' && (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#fcfdfd]">
                    {filteredOpenings.map(op => (
                      <div key={op.id} className="bg-white border text-left border-gray-200 rounded-2xl p-6 relative flex flex-col group hover:-translate-y-1 transition-all hover:shadow-md">
                        <span className={`absolute top-4 right-4 text-[11px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider border
                          ${op.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : op.status === 'Draft' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                          {op.status}
                        </span>
                        <h3 className="text-[13px] font-black text-[#212c46] mb-1 group-hover:text-[#657f4d] transition-colors pr-12 uppercase">{op.title}</h3>
                        <p className="text-[11px] font-black text-[#3f809e] uppercase tracking-widest mb-4">{op.department}</p>
                        
                        <p className="text-[12px] text-slate-600 mb-6 flex-1 max-h-24 overflow-y-auto leading-relaxed">{op.description}</p>
                        
                        <div className="border-t border-[#f3f3f1] pt-4 mt-auto flex items-center justify-between">
                          <div>
                            <p className="text-[9px] font-black text-[#7a8b95] uppercase">Salary Scale</p>
                            <p className="text-[12px] font-extrabold text-slate-800">{op.salaryRange}</p>
                          </div>
                          <span className="text-[11px] font-black text-[#212c46] bg-[#212c46]/5 px-3 py-1.5 rounded-full uppercase">
                            {op.applicantsCount} Applicants
                          </span>
                        </div>
                      </div>
                    ))}
                    {filteredOpenings.length === 0 && (
                      <div className="col-span-3 py-16 text-center text-gray-400 font-bold text-[12px] uppercase">No positions active matching query.</div>
                    )}
                  </div>
                )}

                {/* 3. MANPOWER REQUESTS PORTAL */}
                {activeTab === 'requests' && (
                  <table className="w-full text-left font-sans border-collapse">
                    <thead className="bg-[#222b38] text-white">
                      <tr className="border-b-2 border-[#709654]">
                        <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">Proposed Position</th>
                        <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">Specialty Dept</th>
                        <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">Requested By</th>
                        <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Headcounts</th>
                        <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Priority</th>
                        <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center font-mono">Target Date</th>
                        <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Authorization</th>
                        <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Action Node</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#eaeaec]">
                      {currentPaginatedData.map((req: any) => (
                        <tr key={req.id} className="hover:bg-[#f8f9fa] transition-colors group">
                          <td className="py-2.5 px-4 text-[12px] font-black text-[#212c46] uppercase">{req.position}</td>
                          <td className="py-2.5 px-4 text-[12px] font-semibold text-slate-700">{req.department}</td>
                          <td className="py-2.5 px-4 text-[12px] font-bold text-[#7a8b95]">{req.requestedBy}</td>
                          <td className="py-2.5 px-4 text-[12px] text-center font-extrabold font-mono text-slate-800">{req.count}</td>
                          <td className="py-2.5 px-4 text-center">
                            <span className={`px-2.5 py-1.5 rounded-full text-[11px] font-black uppercase border tracking-wider
                              ${req.priority === 'Urgent' ? 'bg-rose-50 text-rose-700 border-rose-250 animate-pulse' : req.priority === 'High' ? 'bg-amber-50 text-amber-700 border-amber-250' : 'bg-slate-100 text-slate-650'}`}>
                              {req.priority}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-center font-extrabold font-mono text-[12px]">{req.targetDate}</td>
                          <td className="py-2.5 px-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase border tracking-wider
                              ${req.status === 'Approved' ? 'bg-emerald-50 text-[#657f4d] border-[#657f4d]/30' : req.status === 'Pending' ? 'bg-amber-50 text-[#b58c4f] border-[#b58c4f]/30' : 'bg-rose-50 text-[#932c2e] border-[#932c2e]/30'}`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            {req.status === 'Pending' ? (
                              <div className="flex justify-center items-center gap-[1px]">
                                <button 
                                  onClick={async () => {
                                    if (policies.recruitmentLock) return;
                                    const updated = requests.map(r => String(r.id) === String(req.id) ? { ...r, status: 'Approved' as const } : r);
                                    setRequests(updated);
                                    await dbSync.write('manpower_requests', updated);
                                    MySwal.fire({ icon: 'success', toast: true, position: 'top-end', title: 'Request Approved!', showConfirmButton: false, timer: 1500 });
                                  }}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg text-white bg-[#657f4d] hover:bg-[#52683e] transition-all active:scale-90 shadow-sm"
                                  title="Approve Policy"
                                >
                                  <CheckCircle2 size={14} />
                                </button>
                                <button 
                                  onClick={async () => {
                                    if (policies.recruitmentLock) return;
                                    const updated = requests.map(r => String(r.id) === String(req.id) ? { ...r, status: 'Rejected' as const } : r);
                                    setRequests(updated);
                                    await dbSync.write('manpower_requests', updated);
                                    MySwal.fire({ icon: 'error', toast: true, position: 'top-end', title: 'Request Rejected', showConfirmButton: false, timer: 1500 });
                                  }}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg text-white bg-[#932c2e] hover:bg-[#a63032] transition-all active:scale-90 shadow-sm"
                                  title="Reject Policy"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest italic">Decision Made</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {currentPaginatedData.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-gray-400 font-bold text-[12px] uppercase">No planning requests recorded.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}

                {/* 4. MANPOWER PLANNING PORTAL (AESTHETIC ADDITION) */}
                {activeTab === 'planning' && (
                  <table className="w-full text-left font-sans border-collapse">
                    <thead className="bg-[#222b38] text-white">
                      <tr className="border-b-2 border-[#709654]">
                        <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">Planning ID</th>
                        <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">Department Focus</th>
                        <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Target HC</th>
                        <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Current Active HC</th>
                        <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Vacancies Ratio</th>
                        <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Assoc. Quarter</th>
                        <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Compliance Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#eaeaec]">
                      {currentPaginatedData.map((plan: any) => {
                        const gap = plan.targetHeadcount - plan.currentHeadcount;
                        return (
                          <tr key={plan.id} className="hover:bg-[#f8f9fa] transition-colors">
                            <td className="py-2.5 px-4 text-[12px] font-mono text-[#c5724e] font-black">{plan.id}</td>
                            <td className="py-2.5 px-4 text-[12px] font-black text-[#212c46] uppercase">{plan.department}</td>
                            <td className="py-2.5 px-4 text-[12px] text-center font-extrabold font-mono">{plan.targetHeadcount}</td>
                            <td className="py-2.5 px-4 text-[12px] text-center font-extrabold font-mono text-slate-750">{plan.currentHeadcount}</td>
                            <td className="py-2.5 px-4 text-center font-extrabold text-[12px] text-[#212c46]">
                              <span className="bg-[#3f809e]/10 text-[#3f809e] px-2.5 py-1 rounded-full text-[11px] font-black">
                                Shortage: {gap} pax
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-center font-extrabold font-mono text-slate-500 text-[12px]">{plan.quarterPlan}</td>
                            <td className="py-2.5 px-4 text-center">
                              <span className="px-2.5 py-1.5 rounded-full text-[11px] font-black uppercase border tracking-wider bg-emerald-50 text-[#657f4d] border-[#657f4d]/30">
                                COMPLIANT ✓
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}

                {/* 5. ATS SETTINGS PORTAL (Standardized with User Permissions Security Standard) */}
                {activeTab === 'settings' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 items-start bg-[#fcfdfd] animate-fadeIn">
                    
                    {/* LEFT SETTING PANEL - INFORMATION COMPLIANCE CARD */}
                    <div className="lg:col-span-4 bg-white/90 p-6 rounded-2xl shadow-sm border border-[#eaeaec] h-fit space-y-5">
                      <h3 className="text-[13px] font-black text-[#212c46] uppercase tracking-widest flex items-center gap-3 border-b-2 border-[#709654] pb-4 mb-2">
                        <ShieldCheck size={20} className="text-[#709654]" /> RECRUITMENT SECURITY
                      </h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-[#f8f9fa] border border-[#eaeaec] rounded-xl shadow-xs">
                          <strong className="text-[12px] text-[#212c46] block uppercase tracking-wide mb-1 flex items-center gap-1.5">
                            <Sliders size={14} className="text-[#3f809e]" /> ATS Public Nodes
                          </strong>
                          <p className="text-[11px] text-[#606a5f] leading-relaxed">โมดูลการสรรหาได้รับการลงทะเบียนเป็น Public Node พนักงานทั่วไปรับสิทธิ์เพื่อตรวจสอบสถานะเบื้องต้นโดยอัตโนมัติ</p>
                        </div>
                        <div className="p-4 bg-[#932c2e]/10 border border-[#932c2e]/20 rounded-xl shadow-xs">
                          <strong className="text-[12px] text-[#932c2e] block uppercase tracking-wide mb-1 flex items-center gap-1.5">
                            <Info size={14} className="text-[#932c2e]" /> Budget Restrictions
                          </strong>
                          <p className="text-[11px] text-[#414757] leading-relaxed">การลงรายการเงินเดือนและข้อเสนอทุกระดับ จำเป็นต้องผ่านเกณฑ์อนุมัติสูงสุดตามตารางงบจ้างงาน Sheets</p>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT SETTING PANEL - WORKSPACE CONFIGURATIONS */}
                    <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-[#eaeaec] overflow-hidden">
                      <div className="p-6 bg-[#f8f9fa] border-b border-[#eaeaec] flex justify-between items-center">
                        <h4 className="text-[13px] font-black uppercase text-[#212c46] tracking-widest flex items-center gap-3">
                          <Database size={18} className="text-[#b58c4f]"/> SYSTEM POLICY DIRECTIVES
                        </h4>
                        <button onClick={() => MySwal.fire({ icon: 'success', title: 'Directives Updated', text: 'บันทึกนโนบายควบคุมระดับระบบ ATS สำเร็จ' })} className="bg-[#212c46] hover:bg-[#709654] text-white px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all">
                          Save Settings
                        </button>
                      </div>

                      <div className="p-6 space-y-6">
                        
                        {/* Policy 1: Auto Approve Link */}
                        <div className="flex items-center justify-between p-4 rounded-xl border border-[#eaeaec] hover:border-[#b58c4f]/50 transition-all bg-white shadow-sm">
                          <div>
                            <strong className="text-[12px] text-[#212c46] block uppercase tracking-widest">Auto-Approve Sync from Sheets</strong>
                            <span className="text-[11px] text-[#7a8b95]">อนุมัติและปรับเปลี่ยนโครงสร้างกำลังคนอัตโนมัติเมื่อฝ่ายแผนเสนอแนะ</span>
                          </div>
                          <button 
                            onClick={() => setPolicies(p => ({ ...p, autoApprove: !p.autoApprove }))}
                            className={`px-4 py-2 rounded-xl font-black text-[11px] uppercase border transition-all ${policies.autoApprove ? 'bg-[#508660]/10 border-[#508660]/30 text-[#508660]' : 'bg-white border-[#d1d1d5] text-[#7a8b95]'}`}
                          >
                            {policies.autoApprove ? 'ENABLED' : 'DISABLED'}
                          </button>
                        </div>

                        {/* Policy 2: Global Recruitment Lock */}
                        <div className="flex items-center justify-between p-4 rounded-xl border border-[#eaeaec] hover:border-[#b58c4f]/50 transition-all bg-white shadow-sm">
                          <div>
                            <strong className="text-[12px] text-[#212c46] block uppercase tracking-widest">Global Recruitment Lock (ATS LOCK)</strong>
                            <span className="text-[11px] text-[#7a8b95]">ปิดจำกัดและเพิกถอนงดแก้งานรับสมัคร และสถานะผู้สมัครชั่วคราวทั่วประเทศ</span>
                          </div>
                          <button 
                            onClick={() => setPolicies(p => ({ ...p, recruitmentLock: !p.recruitmentLock }))}
                            className={`px-4 py-2 rounded-xl font-black text-[11px] uppercase border transition-all ${policies.recruitmentLock ? 'bg-rose-100 border-rose-300 text-[#b22026] animate-pulse' : 'bg-white border-[#d1d1d5] text-[#7a8b95]'}`}
                          >
                            {policies.recruitmentLock ? 'LOCKED' : 'UNLOCKED'}
                          </button>
                        </div>

                        {/* Policy 3: Careers external syncer */}
                        <div className="flex items-center justify-between p-4 rounded-xl border border-[#eaeaec] hover:border-[#b58c4f]/50 transition-all bg-white shadow-sm">
                          <div>
                            <strong className="text-[12px] text-[#212c46] block uppercase tracking-widest">External Career Channel Integration</strong>
                            <span className="text-[11px] text-[#7a8b95]">ส่งต่อข้อมูลอัตโนมัติอัปเดตตรงไปยัง JobDB และ LinkedIn Recruiter</span>
                          </div>
                          <button 
                            onClick={() => setPolicies(p => ({ ...p, externalSync: !p.externalSync }))}
                            className={`px-4 py-2 rounded-xl font-black text-[11px] uppercase border transition-all ${policies.externalSync ? 'bg-[#508660]/10 border-[#508660]/30 text-[#508660]' : 'bg-white border-[#d1d1d5] text-[#7a8b95]'}`}
                          >
                            {policies.externalSync ? 'ENABLED' : 'DISABLED'}
                          </button>
                        </div>

                        {/* Policy 4: Standard Close Date scale */}
                        <div className="p-4 rounded-xl border border-[#eaeaec] bg-white shadow-sm">
                          <strong className="text-[12px] text-[#212c46] block uppercase tracking-widest mb-2">Standard Expirations Framework (Days)</strong>
                          <input 
                            type="number" 
                            value={policies.standardClosingDays} 
                            onChange={(e) => setPolicies(p => ({ ...p, standardClosingDays: Number(e.target.value) }))}
                            className="w-full bg-slate-50 border border-[#eaeaec] px-4 py-2 rounded-xl text-[12px] font-bold text-[#212c46] outline-none focus:border-[#709654] transition-all" 
                          />
                        </div>

                      </div>
                    </div>

                  </div>
                )}
              </>
            )}
          </div>

          {/* 5. Pagination - Shared Standard Footer (Pushes away from the footer exactly by using mt-8 of the container wrapper / spacing helper below) */}
          <div className="px-6 py-3 bg-[#eaeaec]/80 backdrop-blur-md border-t-[1.5px] border-[#adb2b0]/55 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 rounded-b-3xl">
            <div className="flex items-center gap-6 text-[11px] font-black text-[#606a5f] uppercase tracking-widest font-mono">
              <div className="flex items-center gap-2">
                <span>Display Rows:</span>
                <select 
                  value={itemsPerPage} 
                  onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} 
                  className="bg-white border border-[#eaeaec] rounded-lg px-2.5 py-1 outline-none font-black text-[#212c46] cursor-pointer shadow-sm focus:border-[#709654]"
                >
                  {[5, 10, 20, 50].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <p className="bg-white px-3.5 py-1.5 rounded-lg border border-[#eaeaec] shadow-sm">Total Records: {itemsForPagination.length}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1} 
                className={`w-9 h-9 border border-[#eaeaec] bg-white rounded-lg flex items-center justify-center transition-all cursor-pointer ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#212c46] hover:text-white shadow-sm active:scale-90'}`}
              >
                <ChevronLeft size={16}/>
              </button>
              <div className="bg-white text-[#212c46] px-4 py-1.5 rounded-lg font-black text-[11px] min-w-[100px] text-center uppercase tracking-widest border border-[#eaeaec] shadow-sm font-mono">
                Page {currentPage} / {totalPages}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                disabled={currentPage === totalPages || totalPages === 0} 
                className={`w-9 h-9 border border-[#eaeaec] bg-white rounded-lg flex items-center justify-center transition-all cursor-pointer ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#212c46] hover:text-white shadow-sm active:scale-90'}`}
              >
                <ChevronRight size={16}/>
              </button>
            </div>
          </div>

        </div>

        {/* 6. Spacing contribution from final container bottom margin to push exactly 32px (mt-8 = 32px) from footer */}
        <div className="mt-8 h-1"></div>

      </div>
      {/* DRAGGABLE CANDIDATE CREATION / EDITING MODAL */}
      <DraggableModal 
        isOpen={isCandidateModalOpen} 
        onClose={() => setIsCandidateModalOpen(false)}
        title={
          <span className="text-sm font-black uppercase text-[#212c46] tracking-widest flex items-center gap-2">
            <UserPlus size={16} className="text-[#709654]" /> 
            {editCandidate ? 'Edit Candidate Details' : 'Register New Talent Candidate'}
          </span>
        }
        width="max-w-xl"
      >
        <div className="p-6 space-y-4 font-sans text-left bg-white rounded-b-2xl">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-[#212c46] uppercase tracking-wider mb-1.5">Candidate Name (Th / En)*</label>
              <input 
                type="text" 
                value={candName}
                onChange={(e) => setCandName(e.target.value)}
                placeholder="e.g. นิวัติ สุขสรรค์"
                className="w-full px-3 py-2 border border-[#ccd0db] rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#212c46]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#212c46] uppercase tracking-wider mb-1.5">Candidate Email Address*</label>
              <input 
                type="email" 
                value={candEmail}
                onChange={(e) => setCandEmail(e.target.value)}
                placeholder="e.g. niwat.s@gmail.com"
                className="w-full px-3 py-2 border border-[#ccd0db] rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#212c46]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-[#212c46] uppercase tracking-wider mb-1.5">Job Position Title*</label>
              <input 
                type="text" 
                value={candPosition}
                onChange={(e) => setCandPosition(e.target.value)}
                placeholder="e.g. Production Manager"
                className="w-full px-3 py-2 border border-[#ccd0db] rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#212c46]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#212c46] uppercase tracking-wider mb-1.5">Department Specialty*</label>
              <input 
                type="text" 
                value={candDepartment}
                onChange={(e) => setCandDepartment(e.target.value)}
                placeholder="e.g. Production / Quality"
                className="w-full px-3 py-2 border border-[#ccd0db] rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#212c46]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black text-[#212c46] uppercase tracking-wider mb-1.5">Current Stage Group</label>
              <select 
                value={candStage}
                onChange={(e) => setCandStage(e.target.value as any)}
                className="w-full px-3 py-2 border border-[#ccd0db] bg-white rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#212c46]"
              >
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Offered">Offered</option>
                <option value="Hired">Hired (รับเข้าทำงาน)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#212c46] uppercase tracking-wider mb-1.5">Planned Joining Date</label>
              <input 
                type="date" 
                value={candJoinDate}
                onChange={(e) => setCandJoinDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#ccd0db] rounded-xl text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#212c46] uppercase tracking-wider mb-1.5">Salary Expectation</label>
              <input 
                type="text" 
                value={candSalary}
                onChange={(e) => setCandSalary(e.target.value)}
                placeholder="e.g. 35,000 THB"
                className="w-full px-3 py-2 border border-[#ccd0db] rounded-xl text-xs outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#212c46] uppercase tracking-wider mb-2">Preset Avatar Icon Selection</label>
            <div className="flex gap-3">
              {AVATAR_PRESETS.map((preset, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCandImg(preset)}
                  className={`relative w-10 h-10 rounded-full overflow-hidden border-2 transition-all p-0 cursor-pointer
                    ${candImg === preset ? 'border-[#709654] scale-110 shadow-md ring-2 ring-[#709654]/20' : 'border-transparent opacity-75 hover:opacity-100'}`}
                >
                  <img src={preset} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#212c46] uppercase tracking-wider mb-1.5">Evaluator Feedback / Notes</label>
            <textarea 
              value={candNotes}
              onChange={(e) => setCandNotes(e.target.value)}
              placeholder="Provide interview assessments, certification results, or general notes..."
              className="w-full h-20 p-3 border border-[#ccd0db] rounded-xl text-xs outline-none resize-none font-medium"
            />
          </div>

          {candStage === 'Hired' && (
            <div className="bg-[#657f4d]/5 border border-[#657f4d]/20 rounded-xl p-3 flex gap-2 items-start animate-fadeIn">
              <CheckCircle2 size={16} className="text-[#657f4d] shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black text-[#657f4d] uppercase tracking-wide">Automatic Sync Broadcast Enabled</p>
                <p className="text-[9px] text-[#52683e] font-semibold mt-0.5">
                  Saving this candidate with Hired status will instantly publish their profile on the Dashboard "New Family Members" listing.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button 
              onClick={() => setIsCandidateModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-black uppercase tracking-widest rounded-xl"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveCandidate}
              className="px-5 py-2 bg-[#212c46] hover:bg-[#709654] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Save size={13} /> Save Candidate
            </button>
          </div>
        </div>
      </DraggableModal>
    </div>
  );
}
