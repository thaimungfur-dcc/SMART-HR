import { UserGuidePanel } from '../../components/shared/UserGuidePanel';
import KpiCard from '../../components/shared/KpiCard';
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DraggableModal } from '../../components/shared/DraggableModal';
import { useLanguage } from '../../context/LanguageContext';
import { getStatusPrintClass, PRINT_STATUS_STYLES } from '../../utils/printUtils';

// --- Theme Configuration (Synced with Home & Permissions Theme) ---
const THEME = {
  bgMain: '#f3f3f1',
  primary: '#212c46',
  primaryLight: '#4d87a8',
  accent: '#a94228',
  gold: '#b58c4f',
  brightGold: '#b7a159',
  success: '#657f4d',
  danger: '#932c2e',
  skyBlue: '#3f809e',
  dustyBlue: '#7a8b95'
};

interface SkillItem {
  name: string;
  mastered: boolean;
}

interface Learner {
  id: string;
  employeeName: string;
  employeeId: string;
  dept: string;
  role: string;
  trainerName: string;
  trainerDept: string;
  hoursCompleted: number;
  totalHours: number;
  status: 'Pending' | 'Active' | 'Completed';
  lastMeetingDate: string;
  gradeScore?: number; // scale of 10
  skills?: SkillItem[];
}

interface CoachingLog {
  id: string;
  learnerId: string;
  learnerName: string;
  subject: string;
  trainerName: string;
  date: string;
  durationMinutes: number;
  rating: number; // scale of 5.0
  notes: string;
}

const INITIAL_LEARNERS: Learner[] = [
  { 
    id: 'OJT-001', 
    employeeName: 'ธนา พงษ์สิทธิ์ (Thana)', 
    employeeId: 'EMP-2026-032', 
    dept: 'Property Management', 
    role: 'Operations Assistant', 
    trainerName: 'คุณสุรชัย วชิระประภา', 
    trainerDept: 'Operations Mgr', 
    hoursCompleted: 45, 
    totalHours: 60, 
    status: 'Active', 
    lastMeetingDate: '2026-06-05', 
    gradeScore: 8.5,
    skills: [
      { name: 'Introduction to Central ERP Platform', mastered: true },
      { name: 'On-Site Facility Standard Audits', mastered: true },
      { name: 'Procurement Request Workflows', mastered: true },
      { name: 'Tenancy Regulatory Code Check', mastered: true },
      { name: 'Operations Incident Dispatching', mastered: false }
    ]
  },
  { 
    id: 'OJT-002', 
    employeeName: 'ปิยาภรณ์ จิตตระการ (Piyaporn)', 
    employeeId: 'EMP-2026-041', 
    dept: 'Marketing Dept', 
    role: 'Social Media Officer', 
    trainerName: 'คุณอุบลรัตน์ พลพาณิชย์', 
    trainerDept: 'Design Lead', 
    hoursCompleted: 60, 
    totalHours: 60, 
    status: 'Completed', 
    lastMeetingDate: '2026-06-01', 
    gradeScore: 9.6,
    skills: [
      { name: 'Brand Voice Sync Guidelines', mastered: true },
      { name: 'Lead Conversion Retargeting', mastered: true },
      { name: 'Social Editorial Orchestration', mastered: true },
      { name: 'Dynamic Banner Creation Standard', mastered: true },
      { name: 'Performance Analytics Auditing', mastered: true }
    ]
  },
  { 
    id: 'OJT-003', 
    employeeName: 'สันติ นเรศวรรณ (Santi)', 
    employeeId: 'EMP-2026-045', 
    dept: 'Finance & Accounts', 
    role: 'Junior Accountant', 
    trainerName: 'คุณประพันธ์ กิจโกศล', 
    trainerDept: 'CFO Office', 
    hoursCompleted: 15, 
    totalHours: 60, 
    status: 'Active', 
    lastMeetingDate: '2026-06-08', 
    gradeScore: 7.2,
    skills: [
      { name: 'General Ledger Balancing Controls', mastered: true },
      { name: 'Corporate Tax Invoice Filings', mastered: true },
      { name: 'Automated Bank Reconciliations', mastered: false },
      { name: 'Direct Cost Allocations Matrix', mastered: false },
      { name: 'Corporate Audit Safeguards', mastered: false }
    ]
  },
  { 
    id: 'OJT-004', 
    employeeName: 'ลลิตา รวงทอง (Lalita)', 
    employeeId: 'EMP-2026-050', 
    dept: 'Legal & Procurement', 
    role: 'Compliance Officer', 
    trainerName: 'คุณสรวิชญ์ พัฒนวร', 
    trainerDept: 'Legal VP', 
    hoursCompleted: 0, 
    totalHours: 60, 
    status: 'Pending', 
    lastMeetingDate: 'N/A', 
    gradeScore: 0,
    skills: [
      { name: 'Contract Taxonomy Frameworks', mastered: false },
      { name: 'Vendor Compliance Screening', mastered: false },
      { name: 'Data Privacy Impact Assessments', mastered: false },
      { name: 'Standard NDA Execution Check', mastered: false },
      { name: 'Arbitration Case Briefing Rules', mastered: false }
    ]
  }
];

const INITIAL_LOGS: CoachingLog[] = [
  { id: 'LOG-301', learnerId: 'OJT-001', learnerName: 'ธนา พงษ์สิทธิ์ (Thana)', subject: 'อบรมระบบพอร์ทัลบริหารพัสดุและจัดซื้อกลาง (Property Central ERP)', trainerName: 'คุณสุรชัย วชิระประภา', date: '2026-06-02', durationMinutes: 180, rating: 4.5, notes: 'เรียนรู้ระบบและการเปิดใบขอเสนอจัดซื้อวัสดุหน้างานได้ดี มีทัศนคติเรียนรู้เร็วมาก' },
  { id: 'LOG-302', learnerId: 'OJT-001', learnerName: 'ธนา พงษ์สิทธิ์ (Thana)', subject: 'เรียนรู้สัญญาเช่าข้อบังคับพนักงานกลุ่มเป้าหมาย (Operations Code)', trainerName: 'คุณสุรชัย วชิระประภา', date: '2026-06-05', durationMinutes: 120, rating: 4.0, notes: 'มีความแม่นยำในการระบุข้อกำหนดสิทธิค้ำประกันและอัตราค่าปรับอาคาร' },
  { id: 'LOG-303', learnerId: 'OJT-002', learnerName: 'ปิยาภรณ์ จิตตระการ (Piyaporn)', subject: 'วางกลยุทธ์แคมเปญอสังหาฯ และสร้างวิจารณ์คอนสตรัคชั่นเสร็จสิ้น', trainerName: 'คุณอุบลรัตน์ พลพาณิชย์', date: '2026-06-01', durationMinutes: 240, rating: 5.0, notes: 'สอบประเมินภาคปฏิบัติดีเลิศ นำเสนอบทเรียนได้ครบถ้วน แนะนำพ้นโปรได้ทันที' }
];

export default function OjtTraining() {
  const { language } = useLanguage();
  const [learners, setLearners] = useState<Learner[]>([]);
  const [coachingLogs, setCoachingLogs] = useState<CoachingLog[]>([]);
  const [activeTab, setActiveTab] = useState<'learners' | 'logs'>('learners');
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modals
  const [learnerModal, setLearnerModal] = useState<{ isOpen: boolean; record: Learner | null }>({ isOpen: false, record: null });
  const [logModal, setLogModal] = useState<{ isOpen: boolean; record: CoachingLog | null }>({ isOpen: false, record: null });
  const [isSubmitRecordOpen, setIsSubmitRecordOpen] = useState(false);

  // Registry Settings Policy States
  const [requiredHours, setRequiredHours] = useState(() => localStorage.getItem('local_ojt_required_hours') || '60 Hrs');
  const [targetScore, setTargetScore] = useState(() => localStorage.getItem('local_ojt_target_score') || '8.0 / 10.0');
  const [trainerMandatory, setTrainerMandatory] = useState(() => localStorage.getItem('local_ojt_trainer_mandatory') || 'True (Admin Sign)');
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);

  // Initialization
  useEffect(() => {
    const savedLearners = localStorage.getItem('local_ojt_learners');
    const savedLogs = localStorage.getItem('local_ojt_logs');

    if (savedLearners) {
      try { setLearners(JSON.parse(savedLearners)); } catch (e) { setLearners(INITIAL_LEARNERS); }
    } else {
      setLearners(INITIAL_LEARNERS);
      localStorage.setItem('local_ojt_learners', JSON.stringify(INITIAL_LEARNERS));
    }

    if (savedLogs) {
      try { setCoachingLogs(JSON.parse(savedLogs)); } catch (e) { setCoachingLogs(INITIAL_LOGS); }
    } else {
      setCoachingLogs(INITIAL_LOGS);
      localStorage.setItem('local_ojt_logs', JSON.stringify(INITIAL_LOGS));
    }
  }, []);

  // Save triggers
  const saveLearners = (updated: Learner[]) => {
    setLearners(updated);
    localStorage.setItem('local_ojt_learners', JSON.stringify(updated));
  };

  const saveLogs = (updated: CoachingLog[]) => {
    setCoachingLogs(updated);
    localStorage.setItem('local_ojt_logs', JSON.stringify(updated));
  };

  const handleSavePolicy = (data: { requiredHours: string; targetScore: string; trainerMandatory: string }) => {
    setRequiredHours(data.requiredHours);
    setTargetScore(data.targetScore);
    setTrainerMandatory(data.trainerMandatory);
    localStorage.setItem('local_ojt_required_hours', data.requiredHours);
    localStorage.setItem('local_ojt_target_score', data.targetScore);
    localStorage.setItem('local_ojt_trainer_mandatory', data.trainerMandatory);
  };

  // KPI Computations
  const stats = useMemo(() => {
    const total = learners.length;
    const active = learners.filter(l => l.status === 'Active').length;
    const completed = learners.filter(l => l.status === 'Completed').length;
    const totalHours = learners.reduce((acc, curr) => acc + curr.hoursCompleted, 0);
    const avgScore = learners.filter(l => l.gradeScore && l.gradeScore > 0);
    const average = avgScore.length > 0 ? (avgScore.reduce((acc, curr) => acc + (curr.gradeScore ?? 0), 0) / avgScore.length).toFixed(1) : '0';

    return { total, active, completed, totalHours, average };
  }, [learners]);

  // Filters logic
  const filteredLearners = useMemo(() => {
    return learners.filter(l => {
      const matchSearch = l.employeeName.toLowerCase().includes(search.toLowerCase()) || 
                          l.employeeId.toLowerCase().includes(search.toLowerCase()) ||
                          l.trainerName.toLowerCase().includes(search.toLowerCase());
      const matchDept = filterDept === 'all' || l.dept === filterDept;
      const matchStatus = filterStatus === 'all' || l.status === filterStatus;
      return matchSearch && matchDept && matchStatus;
    });
  }, [learners, search, filterDept, filterStatus]);

  const filteredLogs = useMemo(() => {
    return coachingLogs.filter(log => {
      const matchSearch = log.learnerName.toLowerCase().includes(search.toLowerCase()) || 
                          log.subject.toLowerCase().includes(search.toLowerCase()) ||
                          log.trainerName.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [coachingLogs, search]);

  const departments = useMemo(() => {
    return Array.from(new Set(learners.map(l => l.dept)));
  }, [learners]);

  // Handlers for Learners
  const openLearnerEdit = (record: Learner | null = null) => {
    setLearnerModal({ isOpen: true, record });
  };

  const handleSaveLearner = (data: Learner) => {
    if (learnerModal.record) {
      const updated = learners.map(item => item.id === data.id ? data : item);
      saveLearners(updated);
    } else {
      const newElem = { ...data, id: 'OJT-' + Date.now().toString().slice(-3) };
      saveLearners([...learners, newElem]);
    }
    setLearnerModal({ isOpen: false, record: null });
  };

  const handleDeleteLearner = (id: string) => {
    if (confirm('ยืนยันระบบจัดการต้องการยกเลิกประวัติเทรนนิ่งข้อตกลง OJT นี้?')) {
      const filtered = learners.filter(item => item.id !== id);
      saveLearners(filtered);
    }
  };

  // Handlers for Logs
  const openLogEdit = (record: CoachingLog | null = null) => {
    setLogModal({ isOpen: true, record });
  };

  const handleSaveLog = (data: CoachingLog) => {
    if (logModal.record) {
      const updated = coachingLogs.map(item => item.id === data.id ? data : item);
      saveLogs(updated);
    } else {
      const newElem = { ...data, id: 'LOG-' + Date.now().toString().slice(-3) };
      saveLogs([...coachingLogs, newElem]);

      // side effect: auto add hours completed to learner if matching
      const targetLearner = learners.find(l => l.id === data.learnerId);
      if (targetLearner) {
        const addedHours = Math.round(data.durationMinutes / 60);
        const updatedHours = Math.min(targetLearner.hoursCompleted + addedHours, targetLearner.totalHours);
        const updatedStatus = updatedHours === targetLearner.totalHours ? 'Completed' : 'Active';
        const updatedLearners = learners.map(l => l.id === data.learnerId ? {
          ...l,
          hoursCompleted: updatedHours,
          status: updatedStatus as any,
          lastMeetingDate: data.date
        } : l);
        saveLearners(updatedLearners);
      }
    }
    setLogModal({ isOpen: false, record: null });
  };

  const handleDeleteLog = (id: string) => {
    if (confirm('ต้องการลบบันทึกประชามตินี้ออกใช่หรือไม่?')) {
      const filtered = coachingLogs.filter(item => item.id !== id);
      saveLogs(filtered);
    }
  };

  const handlePrintOjtReport = () => {
    const windowPrint = window.open('', '', 'width=900,height=650');
    if (!windowPrint) return;

    const learnersRows = filteredLearners.map(l => {
      const skillsList = l.skills || [];
      const skillsCount = skillsList.length || 5;
      const masteredCount = skillsList.filter(sk => sk.mastered).length;
      const percentValue = skillsCount > 0 ? Math.round((masteredCount / skillsCount) * 100) : 0;
      const printStatusClass = getStatusPrintClass(l.status);
      
      return `
        <tr>
          <td style="font-family: monospace; font-weight: bold; color: #4b5563;">${l.id}</td>
          <td>
            <div style="font-weight: bold; color: #111827;">${l.employeeName}</div>
            <div style="font-size: 10px; color: #4b5563; font-family: monospace; margin-top: 2px;">${l.employeeId} &bull; ${l.dept}</div>
          </td>
          <td>
            <div style="font-weight: bold; color: #374151;">${l.trainerName}</div>
            <div style="font-size: 10px; color: #6b7280; font-family: monospace; margin-top: 2px; text-transform: uppercase;">${l.trainerDept}</div>
          </td>
          <td style="font-family: monospace; text-align: center; font-weight: bold;">${l.hoursCompleted} / ${l.totalHours} Hrs</td>
          <td>
            <div style="display: flex; flex-direction: column; gap: 3px;">
              <div style="font-size: 10px; font-weight: bold; display: flex; justify-content: space-between;">
                <span>Skills Mastery</span>
                <span>${masteredCount}/${skillsCount} (${percentValue}%)</span>
              </div>
              <div style="width: 100%; height: 6px; background-color: #f3f4f6; border-radius: 3px; overflow: hidden; border: 1px solid #e5e7eb;">
                <div style="width: ${percentValue}%; height: 100%; background-color: #3f809e; border-radius: 3px;"></div>
              </div>
            </div>
          </td>
          <td style="text-align: center;">
            <span class="${printStatusClass}">${l.status}</span>
          </td>
        </tr>
      `;
    }).join('');

    windowPrint.document.write(`
      <html>
        <head>
          <title>OJT Trainee Progress Report</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Noto+Sans+Thai:wght@400;700&display=swap');
            body { 
              font-family: 'Inter', 'Noto Sans Thai', sans-serif; 
              padding: 50px; 
              color: #1f2937; 
              background-color: #ffffff;
            }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-end; 
              border-bottom: 3px double #1f2937; 
              padding-bottom: 15px; 
              margin-bottom: 30px; 
            }
            .logo-section { display: flex; align-items: center; gap: 10px; }
            .company { font-weight: 900; font-size: 18px; color: #212c46; letter-spacing: 1px; }
            .company-sub { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #b58c4f; letter-spacing: 1.5px; margin-top: 2px; }
            .title-section { text-align: right; }
            .doc-title { font-weight: 900; font-size: 16px; color: #212c46; letter-spacing: 1px; text-transform: uppercase; }
            .meta { font-size: 10px; color: #6b7280; font-family: monospace; margin-top: 3px; }
            
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { 
              background: #212c46; 
              color: #ffffff; 
              text-align: left; 
              padding: 12px; 
              font-size: 11px; 
              font-weight: 700; 
              text-transform: uppercase; 
              letter-spacing: 0.5px;
              border: 1px solid #e5e7eb;
            }
            td { padding: 12px; font-size: 11px; border: 1px solid #e5e7eb; }
            
            .footer { 
              margin-top: 50px; 
              border-top: 1px solid #e5e7eb; 
              padding-top: 15px; 
              display: flex; 
              justify-content: space-between; 
              font-size: 9px; 
              font-weight: bold; 
              color: #9ca3af; 
              text-transform: uppercase; 
              letter-spacing: 1px;
            }
            
            ${PRINT_STATUS_STYLES}
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-section">
              <div>
                <div class="company">★ CHAISRI AGROINDUSTRIAL</div>
                <div class="company-sub">HR Organizational Logistics Platform</div>
              </div>
            </div>
            <div class="title-section">
              <div class="doc-title">OJT Trainee Progress Report</div>
              <div class="meta">Generated: ${new Date().toLocaleString()} &bull; Total Trainees: ${filteredLearners.length}</div>
            </div>
          </div>
          
          <p style="font-size: 11px; color: #374151; font-weight: bold; margin-bottom: 20px;">
            This registry displays the status of all active, pending, and completed on-the-job trainee operations under division-appointed trainers.
          </p>
          
          <table>
            <thead>
              <tr>
                <th style="width: 12%;">Trainee ID</th>
                <th style="width: 25%;">Assigned Apprentice</th>
                <th style="width: 25%;">Assigned Coach</th>
                <th style="width: 13%; text-align: center;">OJT Hours</th>
                <th style="width: 15%;">Skills Progress</th>
                <th style="width: 10%; text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${learnersRows || `<tr><td colspan="6" style="text-align: center; color: #9ca3af; font-weight: bold; padding: 24px;">No active trainee found</td></tr>`}
            </tbody>
          </table>
          
          <div class="footer">
            <span>CONFIDENTIAL - FOR INTERNAL HR AUDIT ONLY</span>
            <span>SYSTEM POWERED BY CHAISRI HR LOGS</span>
            <span>Page 1 of 1</span>
          </div>
        </body>
      </html>
    `);

    windowPrint.document.close();
    windowPrint.focus();
    setTimeout(() => {
      windowPrint.print();
      windowPrint.close();
    }, 500);
  };

  return (
    <div className="flex flex-1 w-full flex-col animate-fadeIn bg-transparent space-y-4 px-4 sm:px-8 pb-6 min-h-0">
      {/* USER GUIDE FLOATING DRAWER TRIGGER */}
      {typeof document !== 'undefined' && createPortal(
        <button 
          onClick={() => setIsGuideOpen(true)} 
          className="fixed right-0 bg-[#f8f9fa] border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#b58c4f] hover:text-white hover:border-[#b58c4f] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group cursor-pointer animate-fadeIn" 
          style={{ top: '150px' }}
        >
          <Icons.HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#7a8b95] group-hover:text-white" />
          <span className="font-black tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[11px]">
            {language === 'TH' ? 'คู่มือ OJT GUIDE' : 'OJT GUIDE'}
          </span>
        </button>,
        document.body
      )}
      {/* 2. Page Header - No Background Canvas design strictly following permissions layout */}
      <div className="h-14 flex flex-row items-center justify-between gap-4 z-20 shrink-0 mt-2">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center group cursor-default shrink-0">
            <div className="absolute inset-0 bg-[#b58c4f] blur-[15px] opacity-20 rounded-full group-hover:opacity-60 transition-all duration-700"></div>
            <div className="relative z-10 p-1.5 border border-[#b58c4f]/40 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm">
              <Icons.BookOpenCheck size={28} strokeWidth={2.5} className="text-[#b58c4f]" />
            </div>
          </div>
          <div>
            <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none" style={{ fontSize: '24px' }}>
              OJT <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b58c4f] to-[#709654]">TRAINING</span> MODULE
            </h3>
            <p className="text-[11px] font-bold text-[#4d5a44] uppercase tracking-[0.2em] mt-0.5 opacity-80 leading-none">
              On-The-Job Professional Apprenticeship & Coaching Registry
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
          <div className="bg-white/50 p-1.5 rounded-xl border border-white/60 shadow-inner flex items-center gap-1">
            <button 
              onClick={() => setActiveTab('learners')} 
              className={`px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'learners' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#7a8b95] hover:text-[#b58c4f]'}`}
            >
              <Icons.Award size={13} /> Learners Matrix
            </button>
            <button 
              onClick={() => setActiveTab('logs')} 
              className={`px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'logs' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#7a8b95] hover:text-[#b58c4f]'}`}
            >
              <Icons.ClipboardList size={13} /> Coaching Logs
            </button>
          </div>

          <button 
            onClick={handlePrintOjtReport}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-[#212c46] rounded-xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm"
            title="Generate custom printed PDF report with unified header and footer"
          >
            <Icons.Printer size={13} className="text-[#b58c4f]" />
            Print OJT Report
          </button>

          <button 
            onClick={() => setIsSubmitRecordOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#657f4d] hover:bg-[#709654] text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-md"
            title="Submit training record with skills assessment"
          >
            <Icons.CheckSquare size={13} />
            Submit Record
          </button>

          <button 
            onClick={() => {
              if (activeTab === 'learners') openLearnerEdit();
              else openLogEdit();
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#212c46] text-white hover:bg-[#b58c4f] rounded-xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-md"
          >
            <Icons.Plus size={13} className="text-[#657f4d]" strokeWidth={3}/> 
            {activeTab === 'learners' ? 'Add Learner' : 'Record Activity'}
          </button>
        </div>
      </div>
      {/* 3. Standard KPI Dashboard Container matching Permissions Exactly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2 mb-3">
        <KpiCard
          icon="Users"
          value={stats.total}
          label="Total OJT Learners"
          color={THEME.skyBlue}
          description="พนักงานลงทะเบียน OJT" />
        <KpiCard
          icon="TrendingUp"
          value={stats.active}
          label="Active Coaching"
          color={THEME.gold}
          description="อยู่ระหว่างเรียนรู้คู่หน้างาน" />
        <KpiCard
          icon="CheckCircle"
          value={stats.completed}
          label="Graduated Learners"
          color={THEME.success}
          description="สำเร็จผ่านประเมินมาตรฐาน" />
        <KpiCard
          icon="Award"
          value={stats.average}
          label="Average Evaluation"
          color={THEME.accent}
          description="คะแนนเฉลี่ยผลทดสอบ / 10.0" />
      </div>
      {/* 5. Main Content Unified Grid Container */}
      <div className="bg-white rounded-2xl border border-[#eaeaec] shadow-sm overflow-hidden mb-0 font-sans">
        
        {/* Table Controls (Search & Filters) */}
        <div className="bg-slate-50/70 border-b border-[#eaeaec] p-4 sm:p-5 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#b58c4f] animate-pulse" />
            <span className="text-[11px] font-black text-[#212c46] uppercase tracking-widest leading-none">
              {activeTab === 'learners' ? 'APPRENTICESHIP REGISTRY' : 'COACHING LOG ENTRIES'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center shrink-0">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Icons.Search size={13} className="text-gray-400" />
              </span>
              <input 
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={language === 'TH' ? 'ค้นหาชื่อ, รหัส, วิทยากรพี่เลี้ยง...' : 'Search Name, ID, Trainer coach...'}
                className="w-full bg-white border border-[#eaeaec] rounded-xl pl-8.5 pr-3 py-1.5 text-[11px] font-bold text-[#212c46] shadow-xs outline-none focus:border-[#b58c4f]"
              />
            </div>

            {/* Department Filter (Only for Learners Tab) */}
            {activeTab === 'learners' && (
              <>
                <select
                  value={filterDept}
                  onChange={e => setFilterDept(e.target.value)}
                  className="bg-white border border-[#eaeaec] rounded-xl px-3 py-1.5 text-[11px] font-bold text-[#212c46] outline-none"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="bg-white border border-[#eaeaec] rounded-xl px-3 py-1.5 text-[11px] font-bold text-[#212c46] outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </>
            )}
          </div>
        </div>

        {/* Tab 1: Learners Grid */}
        {activeTab === 'learners' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-[850px] text-[12px]">
              <thead className="bg-[#222b38] text-white">
                <tr className="border-b-2 border-[#b58c4f]">
                  <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider w-[12%] font-mono text-left">Learner ID</th>
                  <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider text-left w-[24%]">Assigned Apprentice</th>
                  <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider text-left w-[24%]">Assigned Coach (PM)</th>
                  <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider text-center w-[12%]">OJT Duration</th>
                  <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider text-left w-[18%]">Progress Matrix</th>
                  <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider text-center w-[10%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[12px] font-medium text-[#212c46]">
                {filteredLearners.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-[#7a8b95] font-bold uppercase tracking-widest text-[11px]">
                      <Icons.Inbox className="mx-auto w-7 h-7 opacity-30 mb-2"/>
                      No OJT Apprentices matched filter
                    </td>
                  </tr>
                ) : (
                  filteredLearners.map((learner) => {
                    const skillsList = learner.skills || [];
                    const skillsCount = skillsList.length || 5;
                    const masteredCount = skillsList.filter(s => s.mastered).length;
                    const computedProgress = skillsCount > 0 ? Math.min(Math.round((masteredCount / skillsCount) * 100), 100) : 0;
                    return (
                      <tr key={learner.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-gray-400 text-[12px] truncate">{learner.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col truncate">
                            <span className="font-bold text-[#212c46] tracking-tight text-[12px]">{learner.employeeName}</span>
                            <span className="text-[11px] font-mono text-[#a94228] font-bold mt-0.5">{learner.dept} &bull; {learner.employeeId}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col truncate">
                            <span className="font-bold text-[#3f809e]/90 text-[12px]">{learner.trainerName}</span>
                            <span className="text-[11px] text-gray-400 font-bold tracking-widest mt-0.5 uppercase">{learner.trainerDept}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold font-mono text-[11.5px]">
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200/40 rounded text-slate-600">
                            {learner.hoursCompleted} / {learner.totalHours} Hrs
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1 py-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className={`inline-flex items-center gap-1 px-1 py-0.2 rounded text-[10px] font-black uppercase tracking-wider ${
                                learner.status === 'Completed' ? 'bg-[#657f4d]/8 text-[#657f4d]' : learner.status === 'Active' ? 'bg-[#b58c4f]/8 text-[#b58c4f]' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {learner.status === 'Completed' ? 'Certified' : learner.status === 'Active' ? 'Coaching' : 'Pending'}
                              </span>
                              <span className="font-mono text-slate-700 font-bold">{computedProgress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/30">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  learner.status === 'Completed' ? 'bg-gradient-to-r from-[#657f4d] to-[#709654]' : learner.status === 'Active' ? 'bg-[#3f809e]' : 'bg-slate-300'
                                }`}
                                style={{ width: `${computedProgress}%` }}
                              />
                            </div>
                            <span className="text-[9.5px] font-bold text-gray-400 mt-0.5">
                              {masteredCount} of {skillsCount} Skills Mastered
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-[1px]">
                            <button 
                              onClick={() => openLearnerEdit(learner)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-[#212c46] transition-colors cursor-pointer"
                              title="Edit Apprentice"
                            >
                              <Icons.Edit3 size={11} strokeWidth={2.5}/>
                            </button>
                            <button 
                              onClick={() => handleDeleteLearner(learner.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-700 transition-colors cursor-pointer"
                              title="Delete Apprentice"
                            >
                              <Icons.Trash2 size={11} strokeWidth={2.5}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Coaching Logs */}
        {activeTab === 'logs' && (
          <div className="overflow-x-auto animate-fadeIn pb-6">
            <table className="w-full text-left border-collapse table-fixed min-w-[850px] text-[12px]">
              <thead className="bg-[#222b38] text-white">
                <tr className="border-b-2 border-[#b58c4f]">
                  <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider w-[12%] font-mono text-left">Log ID</th>
                  <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider text-left w-[20%]">Apprentice Name</th>
                  <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider text-left w-[36%]">OJT Activities / Curriculum</th>
                  <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider text-left w-[14%]">Coached By</th>
                  <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider text-center w-[10%]">Hours Logged</th>
                  <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider text-center w-[8%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[12px] font-medium text-[#212c46]">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-[#7a8b95] font-bold uppercase tracking-widest text-[11px]">
                      <Icons.Inbox className="mx-auto w-7 h-7 opacity-30 mb-2"/>
                      No coaching logs recorded
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-400 text-[12px] truncate">{log.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col truncate">
                          <span className="font-bold text-[#212c46] tracking-tight">{log.learnerName}</span>
                          <span className="text-[10px] font-mono text-[#b58c4f] font-bold mt-0.5">{log.date}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#212c46] text-[12px] leading-snug">{log.subject}</span>
                          {log.notes && <span className="text-[11px] text-gray-400 italic mt-0.5 mt-1 font-bold truncate max-w-[280px]">{log.notes}</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#3f809e]/90">{log.trainerName}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200/40 rounded text-slate-600 font-mono font-bold">
                          {(log.durationMinutes / 60).toFixed(1)} Hrs
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-[1px]">
                          <button 
                            onClick={() => openLogEdit(log)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-[#212c46] transition-colors cursor-pointer"
                            title="Edit Coaching Log"
                          >
                            <Icons.Edit3 size={11} strokeWidth={2.5}/>
                          </button>
                          <button 
                            onClick={() => handleDeleteLog(log.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-700 transition-colors cursor-pointer"
                            title="Remove Coaching Log"
                          >
                            <Icons.Trash2 size={11} strokeWidth={2.5}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* 6. Model Registry Configuration Settings Segment (Standardized design inspired by permissions) */}
      <div className="bg-[#f8f9fa] rounded-2xl border border-[#eaeaec] p-6 mb-0 relative overflow-hidden font-sans">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-[12px] font-black text-[#212c46] uppercase tracking-widest flex items-center gap-2">
            <Icons.Sliders size={15} className="text-[#b58c4f]"/> ระบบนโยบายมาตรฐานการประเมิน (OJT Policy & Standards Configuration)
          </h4>
          <button 
            onClick={() => setIsPolicyModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#212c46] hover:bg-[#b58c4f] hover:text-white text-white rounded-lg text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs"
          >
            <Icons.Edit3 size={11} />
            {language === 'TH' ? 'แก้ไขนโยบาย' : 'Edit Policy Rules'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-xl border border-[#eaeaec]">
            <span className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-widest mb-2 font-sans">จำนวนชั่วโมง OJT ขั้นต่ำ (Required OJT Hours)</span>
            <div className="flex items-center justify-between font-sans">
              <span className="text-[18px] font-black text-[#212c46] font-mono">{requiredHours}</span>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300">Department Standard</span>
            </div>
            <p className="text-[10px] text-[#7a8b95] font-bold mt-2 leading-relaxed font-sans">จำนวนชั่วโมงเรียนรู้งานภาคสนามที่พนักงานทุกคนต้องเก็บสะสมให้ครบตามเกณฑ์</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#eaeaec]">
            <span className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-widest mb-2 font-sans">เกรดผ่านประเมินเฉลี่ยขั้นต่ำ (Score Passing Grade)</span>
            <div className="flex items-center justify-between font-sans">
              <span className="text-[18px] font-black text-[#212c46] font-mono">{targetScore}</span>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300">Certified Cap</span>
            </div>
            <p className="text-[10px] text-[#7a8b95] font-bold mt-2 leading-relaxed font-sans">ผลทดสอบประเมินปลายทางคิดรวมจากแบบวิทยากรผู้ฝึกสอนสอนหน้างานสัมผัส</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#eaeaec]">
            <span className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-widest mb-2 font-sans">การปิดรับรองผลบังคับ (Evaluator Sign-Off)</span>
            <div className="flex items-center justify-between font-sans">
              <span className="text-[18px] font-black text-[#932c2e] font-mono">{trainerMandatory}</span>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-300">Verification Rule</span>
            </div>
            <p className="text-[10px] text-[#7a8b95] font-bold mt-2 leading-relaxed font-sans">ข้อบังคับให้ผู้จัดฝ่ายทรัพยากรลงลายเซ็นระเบียนดิจิตอลยืนยันผลอบรมสิ้นสุด</p>
          </div>
        </div>
      </div>
      {/* --- ALL DRAGGABLE ACTION MODALS --- */}
      {/* MODAL 1: Learner Detail / Edit */}
      {learnerModal.isOpen && (
        <EditLearnerModal 
          isOpen={learnerModal.isOpen}
          record={learnerModal.record}
          onClose={() => setLearnerModal({ isOpen: false, record: null })}
          onSave={handleSaveLearner}
        />
      )}
      {/* MODAL 2: Coaching Log Entry Creator */}
      {logModal.isOpen && (
        <EditLogModal 
          isOpen={logModal.isOpen}
          record={logModal.record}
          learnersList={learners}
          onClose={() => setLogModal({ isOpen: false, record: null })}
          onSave={handleSaveLog}
        />
      )}
      {/* MODAL 3: Policy Configuration Manager */}
      {isPolicyModalOpen && (
        <EditPolicyModal 
          isOpen={isPolicyModalOpen}
          initialData={{ requiredHours, targetScore, trainerMandatory }}
          onClose={() => setIsPolicyModalOpen(false)}
          onSave={handleSavePolicy}
        />
      )}
      {/* MODAL 5: Submit Training Record with Skills Assessment */}
      {isSubmitRecordOpen && (
        <SubmitTrainingRecordModal 
          isOpen={isSubmitRecordOpen}
          learnersList={learners}
          onClose={() => setIsSubmitRecordOpen(false)}
          onSave={(newLog: CoachingLog, updatedSkills: SkillItem[], targetLearnerId: string) => {
            const logId = 'LOG-' + Date.now().toString().slice(-3);
            const extendedLog = { ...newLog, id: logId };
            const nextLogs = [extendedLog, ...coachingLogs];
            saveLogs(nextLogs);

            const nextLearners = learners.map(l => {
              if (l.id === targetLearnerId) {
                const addedHours = Math.round(newLog.durationMinutes / 60);
                const nextHours = Math.min(l.hoursCompleted + addedHours, l.totalHours);
                const allMastered = updatedSkills.length > 0 && updatedSkills.every(s => s.mastered);
                
                let nextStatus = l.status;
                if (allMastered) {
                  nextStatus = 'Completed';
                } else if (l.status === 'Pending' && nextHours > 0) {
                  nextStatus = 'Active';
                }

                return {
                  ...l,
                  skills: updatedSkills,
                  hoursCompleted: nextHours,
                  status: nextStatus as any,
                  lastMeetingDate: newLog.date
                };
              }
              return l;
            });
            saveLearners(nextLearners);
            setIsSubmitRecordOpen(false);
          }}
        />
      )}
      {/* MODAL 4: Sidebar Help Panels Standard Layout */}
      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}

// --- SUB-DIALOG FORMS AND DETAILS MODAL ---

function EditLearnerModal({ isOpen, record, onClose, onSave }: any) {
  const [formData, setFormData] = useState<Learner>({
    id: '',
    employeeName: '',
    employeeId: '',
    dept: '',
    role: '',
    trainerName: '',
    trainerDept: '',
    hoursCompleted: 0,
    totalHours: 60,
    status: 'Active',
    lastMeetingDate: 'N/A',
    gradeScore: 8.0
  });

  useEffect(() => {
    if (record) {
      setFormData(record);
    } else {
      setFormData({
        id: '',
        employeeName: '',
        employeeId: 'EMP-2026-',
        dept: 'Property Management',
        role: 'Assistant Specialist',
        trainerName: '',
        trainerDept: 'Supervisor',
        hoursCompleted: 0,
        totalHours: 60,
        status: 'Active',
        lastMeetingDate: 'N/A',
        gradeScore: 0
      });
    }
  }, [record, isOpen]);

  return (
    <DraggableModal isOpen={isOpen} onClose={onClose} title={record ? "แก้ไขแฟ้มประวัติพนักงาน OJT" : "สร้างคำสั่งแฟ้มประวัติ OJT ใหม่"}>
      <div className="p-6 space-y-4 max-w-lg font-sans">
        <div>
          <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">ชื่อพนักงานใหม่ (Learner Name)</label>
          <input 
            type="text"
            value={formData.employeeName}
            onChange={e => setFormData({ ...formData, employeeName: e.target.value })}
            className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#b58c4f]"
            placeholder="เช่น ธนา พงษ์สิทธิ์"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">รหัสประจำตัวพนักงาน</label>
            <input 
              type="text"
              value={formData.employeeId}
              onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-bold text-[#212c46] outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">แผนก / สังกัดปฏิบัติ</label>
            <input 
              type="text"
              value={formData.dept}
              onChange={e => setFormData({ ...formData, dept: e.target.value })}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-bold text-[#212c46]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">สายวิชาชีพ / ตำแหน่ง</label>
            <input 
              type="text"
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-bold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">ประเมินผลคะแนนเกรด (/ 10.0)</label>
            <input 
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={formData.gradeScore ?? 0}
              onChange={e => setFormData({ ...formData, gradeScore: Number(e.target.value) })}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px]"
            />
          </div>
        </div>

        <div className="border-t border-dashed border-[#eaeaec] pt-4">
          <span className="block text-[10px] font-black text-[#b58c4f] uppercase tracking-widest mb-3">ผู้ฝึกสอนประกบผล (Coach Profile)</span>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">ชื่อพี่เลี้ยงเวิร์กชอป</label>
              <input 
                type="text"
                value={formData.trainerName}
                onChange={e => setFormData({ ...formData, trainerName: e.target.value })}
                className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-bold focus:border-[#709654]"
                placeholder="เช่น คุณสรวิชญ์ พัฒนวร"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">ตำแหน่งพี่เลี้ยง</label>
              <input 
                type="text"
                value={formData.trainerDept}
                onChange={e => setFormData({ ...formData, trainerDept: e.target.value })}
                className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px]"
                placeholder="เช่น Legal VP"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-dashed border-[#eaeaec] pt-4">
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">สถานะปัจจุบันหลักสูตร</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2 text-[12px] font-bold"
            >
              <option value="Pending">Pending</option>
              <option value="Active">Active / กำลังติวงาน</option>
              <option value="Completed">Completed / รับรองวิทยะ</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans font-bold">ชั่วโมงเก็บได้สะสม (Hrs)</label>
            <div className="flex gap-2">
              <input 
                type="number"
                value={formData.hoursCompleted}
                onChange={e => setFormData({ ...formData, hoursCompleted: Number(e.target.value) })}
                className="w-20 bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2 text-[12px] font-mono font-bold"
              />
              <span className="text-gray-400 py-2 text-[12px] font-bold">Of {formData.totalHours} Hrs Total</span>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-2.5 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white border border-[#eaeaec] text-[#414757] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#d7d7d7]/20 transition-all cursor-pointer">Cancel</button>
          <button type="button" onClick={() => onSave(formData)} className="bg-[#212c46] hover:bg-[#b58c4f] text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md transition-all flex items-center gap-2 cursor-pointer"><Icons.Save size={14}/> Save Apprentice</button>
        </div>
      </div>
    </DraggableModal>
  );
}

// COACHING LOG FORM WRAPPER
function EditLogModal({ isOpen, record, learnersList, onClose, onSave }: any) {
  const [formData, setFormData] = useState<CoachingLog>({
    id: '',
    learnerId: '',
    learnerName: '',
    subject: '',
    trainerName: '',
    date: '',
    durationMinutes: 120,
    rating: 5,
    notes: ''
  });

  useEffect(() => {
    if (record) {
      setFormData(record);
    } else {
      setFormData({
        id: '',
        learnerId: learnersList[0]?.id || '',
        learnerName: learnersList[0]?.employeeName || '',
        subject: '',
        trainerName: learnersList[0]?.trainerName || '',
        date: new Date().toISOString().split('T')[0],
        durationMinutes: 120,
        rating: 5,
        notes: ''
      });
    }
  }, [record, isOpen, learnersList]);

  const handleSelectLearner = (learnerId: string) => {
    const matched = learnersList.find((l: any) => l.id === learnerId);
    if (matched) {
      setFormData({
        ...formData,
        learnerId,
        learnerName: matched.employeeName,
        trainerName: matched.trainerName
      });
    }
  };

  return (
    <DraggableModal isOpen={isOpen} onClose={onClose} title={record ? "แก้ไขสมุดบันทึก OJT Session" : "บันทึกชั่วโมงการทำงานคู่ OJT ใหม่"}>
      <div className="p-6 space-y-4 max-w-lg font-sans">
        <div>
          <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">เลือกพนักงานเป้าหมายเรียนงาน</label>
          <select 
            value={formData.learnerId}
            onChange={e => handleSelectLearner(e.target.value)}
            className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2.5 text-[12px] font-bold text-[#212c46]"
            disabled={!!record}
          >
            {learnersList.map((l: any) => (
              <option key={l.id} value={l.id}>{l.employeeName} ({l.id})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">หัวข้อ / ทักษะวิชาชีพหลักสูตรปฏิบัติการ (OJT Subject)</label>
          <input 
            type="text"
            value={formData.subject}
            onChange={e => setFormData({ ...formData, subject: e.target.value })}
            className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-20 text-[12px] text-[#212c46] font-bold h-11"
            placeholder="เช่น วางรายงานข้อบังคับ แนะนำขั้นตอน PMS"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">ผู้สอยงาน (Coach / PM)</label>
            <input 
              type="text"
              value={formData.trainerName}
              onChange={e => setFormData({ ...formData, trainerName: e.target.value })}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">ระยะเวลาระดมสมอง (นาที)</label>
            <input 
              type="number"
              step="30"
              value={formData.durationMinutes}
              onChange={e => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">วันที่ติวสอน</label>
            <input 
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">คะแนนผลงาน (Rating 1.0 - 5.0)</label>
            <input 
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">บันทึกข้อแนะนำพฤติกรรม (Coaching Notes)</label>
          <textarea 
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg p-3 text-[12px] h-20 resize-none font-bold outline-none font-sans"
            placeholder="รายละเอียดและคะแนนพฤติกรรมระหว่างการประกบ..."
          />
        </div>

        <div className="pt-4 flex justify-end gap-2.5 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white border border-[#eaeaec] text-[#414757] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#d7d7d7]/20 transition-all cursor-pointer">Cancel</button>
          <button type="submit" onClick={() => onSave(formData)} className="bg-[#212c46] hover:bg-[#b58c4f] text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md transition-all flex items-center gap-2 cursor-pointer"><Icons.Save size={14}/> Save Action Log</button>
        </div>
      </div>
    </DraggableModal>
  );
}

// POLICY MANAGEMENT DIALOG
function EditPolicyModal({ isOpen, onClose, initialData, onSave }: any) {
  const [requiredHours, setRequiredHours] = useState(initialData.requiredHours);
  const [targetScore, setTargetScore] = useState(initialData.targetScore);
  const [trainerMandatory, setTrainerMandatory] = useState(initialData.trainerMandatory);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ requiredHours, targetScore, trainerMandatory });
    onClose();
  };

  return (
    <DraggableModal isOpen={isOpen} onClose={onClose} title="แก้ไขกฎนโยบาย OJT มาตรฐาน">
      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-w-md font-sans">
        <p className="text-[11.5px] text-[#7a8b95] leading-relaxed">
          ความแม่นยำข้อกฎหมายปฐมนิเทศ และตัวเลขเป้าหมายทดสอบพนักงานกลุ่ม SMART LAW
        </p>

        <div>
          <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">จำนวนชั่วโมง OJT ขั้นต่ำ</label>
          <select 
            value={requiredHours} 
            onChange={e => setRequiredHours(e.target.value)}
            className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2.5 text-[12px] font-bold"
          >
            <option value="40 Hrs">40 Hrs (Basic OJT)</option>
            <option value="60 Hrs">60 Hrs (Recommended standard)</option>
            <option value="120 Hrs">120 Hrs (Intensive Apprenticeship)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">อัตราผลคะแนนสอบประเมินขั้นตํ่า</label>
          <select 
            value={targetScore} 
            onChange={e => setTargetScore(e.target.value)}
            className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2.5 text-[12px] font-bold"
          >
            <option value="7.0 / 10.0">7.0 / 10.0 (Satisfactory)</option>
            <option value="8.0 / 10.0">8.0 / 10.0 (Recommended Standard)</option>
            <option value="9.0 / 10.0">9.0 / 10.0 (Excellent Certification)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">การปิดรับรับรองเอกสารดิจิตอล</label>
          <select 
            value={trainerMandatory} 
            onChange={e => setTrainerMandatory(e.target.value)}
            className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2.5 text-[12px] font-bold"
          >
            <option value="True (Admin Sign)">True (Admin Sign Mandatory)</option>
            <option value="False (Auto Sign)">False (No Sign-off required)</option>
          </select>
        </div>

        <div className="pt-4 flex justify-end gap-2.5 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-[#414757] font-bold rounded-lg uppercase text-[10.5px]">Cancel</button>
          <button type="submit" className="bg-[#212c46] hover:bg-[#b58c4f] text-white px-5 py-2 rounded-lg font-black text-[10.5px] uppercase tracking-widest shadow-md flex items-center gap-1"><Icons.Save size={13}/> Save Rules</button>
        </div>
      </form>
    </DraggableModal>
  );
}

// REGISTER SUBMIT TRAINING RECORD AND SKILLS COMPETENCY MODAL
function SubmitTrainingRecordModal({ isOpen, learnersList, onClose, onSave }: any) {
  const [selectedLearnerId, setSelectedLearnerId] = useState(learnersList[0]?.id || '');
  const [trainerName, setTrainerName] = useState('');
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState(120);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [rating, setRating] = useState(4.5);
  const [notes, setNotes] = useState('');
  
  // Local list of skill items of the selected apprentice
  const [skills, setSkills] = useState<SkillItem[]>([]);

  // Sync details when selected learner changes
  useEffect(() => {
    const matched = learnersList.find((l: any) => l.id === selectedLearnerId);
    if (matched) {
      setTrainerName(matched.trainerName || '');
      // Fallback skills if not defined
      const defaultSkills = matched.skills || [
        { name: 'Introduction to Core Procedures', mastered: false },
        { name: 'On-Job Technical Competence', mastered: false },
        { name: 'Workflow Integration Standards', mastered: false },
        { name: 'Safety Compliance Regulations', mastered: false },
        { name: 'Final Performance Assessment', mastered: false }
      ];
      setSkills(defaultSkills);
    }
  }, [selectedLearnerId, learnersList]);

  const handleToggleSkill = (index: number) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], mastered: !updated[index].mastered };
    setSkills(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLearnerId) return;

    const matched = learnersList.find((l: any) => l.id === selectedLearnerId);
    
    const newLog: CoachingLog = {
      id: '',
      learnerId: selectedLearnerId,
      learnerName: matched ? matched.employeeName : 'Unknown',
      subject: subject || 'Competency Session & Assessment',
      trainerName,
      date,
      durationMinutes: duration,
      rating,
      notes: notes || 'Performance assessed.'
    };

    onSave(newLog, skills, selectedLearnerId);
  };

  return (
    <DraggableModal isOpen={isOpen} onClose={onClose} title="รับคำสั่งประเมินทักษะ & ส่งเสริม OJT (Submit Training Record)">
      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-w-lg font-sans">
        <div>
          <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">
            เลือกพนักงานเข้ารับการประเมิน OJT (Trainee Apprentice)
          </label>
          <select
            value={selectedLearnerId}
            onChange={e => setSelectedLearnerId(e.target.value)}
            className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2 text-[12px] font-bold text-[#212c46] outline-none"
          >
            {learnersList.map((l: any) => (
              <option key={l.id} value={l.id}>
                {l.employeeName} ({l.dept} &bull; {l.id})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">
              ชื่อผู้ตรวจสอบพี่เลี้ยง (Trainer / Coach)
            </label>
            <input
              type="text"
              required
              value={trainerName}
              onChange={e => setTrainerName(e.target.value)}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2 text-[12px] font-bold text-[#212c46]"
              placeholder="เช่น คุณวิทยากร"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">
              วันที่ทดสอบประเมิน (Assessment Date)
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2 text-[12px] font-bold text-[#212c46]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">
              เวลาเรียนรู้งานเพิ่มเติม (นาที)
            </label>
            <select
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2 text-[12px] font-bold text-[#212c46]"
            >
              <option value="30">30 นาที (0.5 ชม.)</option>
              <option value="60">60 นาที (1.0 ชม.)</option>
              <option value="120">120 นาที (2.0 ชม.)</option>
              <option value="180">180 นาที (3.0 ชม.)</option>
              <option value="240">240 นาที (4.0 ชม.)</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">
              หัวข้อหลักสูตรประเมิน (Training Subject)
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="ระบุข้อกำหนดที่ฝึกสอนงาน..."
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2 text-[12px] font-bold text-[#212c46]"
            />
          </div>
        </div>

        {/* Dynamic Skill Competency Checklist */}
        <div className="border border-[#eaeaec] bg-slate-50/50 rounded-xl p-4">
          <span className="block text-[10.5px] font-black text-[#b58c4f] uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Icons.CheckSquare size={13} className="text-[#657f4d]"/> ประเมินทักษะสมรรถนะ (Competency Assessment Checklist)
          </span>
          <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
            {skills.map((s, idx) => (
              <label key={idx} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-[#eaeaec] cursor-pointer hover:border-[#b58c4f] transition-colors select-none">
                <input
                  type="checkbox"
                  checked={s.mastered}
                  onChange={() => handleToggleSkill(idx)}
                  className="rounded text-[#657f4d] focus:ring-[#657f4d] w-4 h-4"
                />
                <div className="flex flex-col">
                  <span className="text-[11.5px] font-bold text-[#212c46] leading-none">{s.name}</span>
                  <span className={`text-[9.5px] font-black uppercase mt-1 leading-none ${s.mastered ? 'text-[#657f4d]' : 'text-[#7a8b95]'}`}>
                    {s.mastered ? '★ Mastery Vetted' : '☉ In Coaching'}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">
              คะแนนประเมินศักยภาพ (Rating 1.0 - 5.0)
            </label>
            <input
              type="number"
              min="1.0"
              max="5.0"
              step="0.1"
              required
              value={rating}
              onChange={e => setRating(Number(e.target.value))}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2 text-[12px] font-black text-[#212c46]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">
              บันทึกคะแนนคำติชม (Performance Feedback)
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="ระบุคำแนะนำการเรียนรู้งานเพิ่มเติม..."
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-1.5 text-[12px] font-bold text-[#212c46] h-10 resize-none font-sans"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-2.5 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-[#eaeaec] text-[#414757] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#d7d7d7]/20 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-[#657f4d] hover:bg-[#709654] text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Icons.CheckSquare size={14} /> Submit Assessment
          </button>
        </div>
      </form>
    </DraggableModal>
  );
}
