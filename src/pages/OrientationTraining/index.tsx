import { UserGuidePanel } from '../../components/shared/UserGuidePanel';
import KpiCard from '../../components/shared/KpiCard';
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DraggableModal } from '../../components/shared/DraggableModal';
import { useLanguage } from '../../context/LanguageContext';

// --- Theme Configuration (Synced with Home Palette & Permissions) ---
const THEME = {
  bgMain: '#f3f3f1',
  bgGradient: 'transparent',
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
  silver: '#d7d7d7',
  coolGray: '#eaeaec'
};

interface TrainingSession {
  id: string;
  batchName: string;
  startDate: string;
  endDate: string;
  trainer: string;
  participantsCount: number;
  status: 'Draft' | 'Scheduled' | 'In Progress' | 'Completed';
  category: 'Company Orientation' | 'IT & Cybersecurity' | 'HR Policy & Welfare' | 'Department OJT';
  location: string;
  avgScore?: number;
  remarks?: string;
}

interface JourneyStep {
  id: string;
  title: string;
  duration: string;
  description: string;
  completed: boolean;
}

interface JourneyPhase {
  id: number;
  title: string;
  subtitle: string;
  status: 'In Progress' | 'Completed' | 'Locked';
  steps: JourneyStep[];
}

const INITIAL_JOURNEY_PHASES: JourneyPhase[] = [
  {
    id: 1,
    title: 'Phase 1: Welcome & Setup (Day 1)',
    subtitle: 'วันต้อนรับแรกพบ & การตั้งค่าระบบสารสนเทศ',
    status: 'In Progress',
    steps: [
      { id: 'js-1', title: 'HR Documentation', duration: '30 min', description: 'Sign contract and submit documents / เซ็นเอกสารสัญญาจ้างงานและค้ำประกันสิทธิ์', completed: true },
      { id: 'js-2', title: 'IT Setup', duration: '60 min', description: 'Get your laptop, email access, system permissions / รับมอบคอมพิวเตอร์และลงทะเบียนระบบความปลอดภัย', completed: true },
      { id: 'js-3', title: 'Office Tour', duration: '45 min', description: 'Walk around the office with your Onboarding Buddy / เดินชมทัศนียภาพสำนักงาน โซนงานหลักร่วมกับบัดดี้', completed: false },
      { id: 'js-4', title: 'Team Introduction', duration: '30 min', description: 'Say hi to your team members and line manager / แนะนำตัวสร้างสัมพันธ์กลุ่มร่วมงานและผู้สั่งการสายตรง', completed: false }
    ]
  },
  {
    id: 2,
    title: 'Phase 2: Culture & Connection (Week 1)',
    subtitle: 'ทำความเข้าใจวัฒนธรรมองค์กรและค่านิยมหลักกลุ่มบริษัท',
    status: 'Locked',
    steps: [
      { id: 'js-5', title: 'Lunch with Buddy', duration: '60 min', description: 'Go out for lunch and casual bonding session / ทานร่วมโต๊ะอาหารกลางวัน ทำความรู้จักแบบย่อยสลายแรงกดดัน', completed: false },
      { id: 'js-6', title: 'CEO Message', duration: '15 min', description: 'Watch the official digital welcome video from MD / รับชมเทปบันทึกบทต้อนรับและวิสัยทัศน์ผู้บริหารระดับสูงสุด', completed: false },
      { id: 'js-7', title: 'Values Workshop', duration: '90 min', description: 'Participate or read core values workshop handbook / ศึกษาแนวหลักวิสัยทัศน์แกนกลาง CSR และนโยบายเกรดวัฒนธรรม', completed: false }
    ]
  },
  {
    id: 3,
    title: 'Phase 3: Role & Performance (Month 1)',
    subtitle: 'ลงลึกเป้าหมายการปฏิบัติงานและเริ่มสอนงานวิชาชีพ OJT',
    status: 'Locked',
    steps: [
      { id: 'js-8', title: 'Goal Setting', duration: '60 min', description: 'Align KPIs and work expectations with line manager / กำหนดความคาดหมายดุลวัดผลงานช่วงทดลองและคีย์ KPIs', completed: false },
      { id: 'js-9', title: 'OJT Training', duration: '120 min', description: 'Start departmental specific professional training / เริ่มรอบการสอนอบรมคู่หน้างานและมาตรการวิชาการเฉพาะแผนก', completed: false }
    ]
  }
];

interface BuddyRelation {
  id: string;
  employeeId: string;
  employeeName: string;
  dept: string;
  buddyName: string;
  buddyDept: string;
  status: 'Active' | 'Completed' | 'Pending';
  meetingCount: number;
  score?: number;
  progress?: number;
}

const INITIAL_SESSIONS: TrainingSession[] = [
  {
    id: 'TRN-2024-001',
    batchName: 'อบรมปฐมนิเทศพนักงานใหม่ รุ่นที่ 1/2024',
    startDate: '2024-01-15',
    endDate: '2024-01-17',
    trainer: 'คุณสมจิตร์ (HR Director)',
    participantsCount: 8,
    status: 'Completed',
    category: 'Company Orientation',
    location: 'ห้องประชุมใหญ่ ชั้น 4 (Main Hall)',
    avgScore: 9.4,
    remarks: 'พนักงานใหม่เข้าใจวิสัยทัศน์ วัฒนธรรมองค์กร และภาพรวมบริษัทดีมาก'
  },
  {
    id: 'TRN-2024-002',
    batchName: 'อบรม IT Systems & Cybersecurity Compliance',
    startDate: '2024-02-18',
    endDate: '2024-02-18',
    trainer: 'คุณอนวัช (IT Lead)',
    participantsCount: 12,
    status: 'Completed',
    category: 'IT & Cybersecurity',
    location: 'ห้อง Lab คอมพิวเตอร์ (IT Training Lab)',
    avgScore: 8.9,
    remarks: 'ประเมินทดสอบความเข้าใจพาสเวิร์ดและการป้องกันฟิชชิ่ง ผ่านเกณฑ์ 100%'
  },
  {
    id: 'TRN-2024-003',
    batchName: 'ระเบียบข้อบังคับ คำกฎ และสวัสดิการพนักงาน',
    startDate: '2024-05-15',
    endDate: '2024-05-16',
    trainer: 'คุณลลิตา (HR Executive)',
    participantsCount: 5,
    status: 'In Progress',
    category: 'HR Policy & Welfare',
    location: 'ห้องพิจารณากฎ ชั้น 2 (Smart Room)',
    avgScore: 0,
    remarks: 'รอบปัจจุบัน อบรมเกี่ยวกับระเบียบ ข้อกฎหมายแรงงาน และการใช้สิทธิ์สวัสดิการรักษาพยาบาล'
  },
  {
    id: 'TRN-2024-004',
    batchName: 'Departmental Specific On-the-Job Training (OJT)',
    startDate: '2024-06-10',
    endDate: '2024-06-14',
    trainer: 'คุณมนัส (Engineering Manager)',
    participantsCount: 3,
    status: 'Scheduled',
    category: 'Department OJT',
    location: 'แผนกวิศวกรรมฝั่งซ้าย (Operations Zone)',
    remarks: 'เตรียมการฝึกอบรมความปลอดภัยในสายงานปฏิบัติและเครื่องจักรอุตสาหกรรม'
  }
];

const INITIAL_BUDDIES: BuddyRelation[] = [
  {
    id: 'BDY-001',
    employeeId: 'EMP-2024-003',
    employeeName: 'Anawat Siri',
    dept: 'Information Technology',
    buddyName: 'คุณสมเกียรติ (Senior Network Admin)',
    buddyDept: 'Information Technology',
    status: 'Active',
    meetingCount: 3,
    score: 8.5,
    progress: 60
  },
  {
    id: 'BDY-002',
    employeeId: 'EMP-2024-004',
    employeeName: 'Chalee Mong',
    dept: 'Quality Assurance',
    buddyName: 'คุณนิรุต (QA Automation Lead)',
    buddyDept: 'Information Technology',
    status: 'Completed',
    meetingCount: 5,
    score: 9.6,
    progress: 100
  },
  {
    id: 'BDY-003',
    employeeId: 'EMP-2024-005',
    employeeName: 'Lalita Mee',
    dept: 'Human Resources',
    buddyName: 'คุณนภาพร (Senior Compensation)',
    buddyDept: 'Human Resources',
    status: 'Pending',
    meetingCount: 0,
    progress: 15
  }
];

// Helper components mapping
const LucideIcon = ({ name, size = 16, className = "", color, style, strokeWidth = 2.5 }: any) => {
    if (!name) return null;
    const IconComponent = Icons[name as keyof typeof Icons] || Icons.CircleHelp;
    if (!IconComponent) return null;
    return <IconComponent size={size} className={className} style={{...style, color: color}} strokeWidth={strokeWidth} />;
};

export default function OrientationTraining() {
  const { language } = useLanguage();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [buddies, setBuddies] = useState<BuddyRelation[]>([]);
  const [activeTab, setActiveTab] = useState<'journey' | 'management'>('journey');
  const [filterEmployeeStatus, setFilterEmployeeStatus] = useState<string>('all');
  const [filterEmployeeDept, setFilterEmployeeDept] = useState<string>('all');

  const [sessionSearch, setSessionSearch] = useState('');
  const [buddySearch, setBuddySearch] = useState('');
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Training Registry Configuration States
  const [passingThreshold, setPassingThreshold] = useState(() => {
    return localStorage.getItem('local_passing_threshold') || '80.0%';
  });
  const [buddyMatchCap, setBuddyMatchCap] = useState(() => {
    return localStorage.getItem('local_buddy_match_cap') || '1 Buddy : 2 Staff';
  });
  const [mediaNodeIsolation, setMediaNodeIsolation] = useState(() => {
    return localStorage.getItem('local_media_node_isolation') || 'Isolated SSL';
  });
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const handleSaveConfig = (data: { passingThreshold: string; buddyMatchCap: string; mediaNodeIsolation: string }) => {
    setPassingThreshold(data.passingThreshold);
    setBuddyMatchCap(data.buddyMatchCap);
    setMediaNodeIsolation(data.mediaNodeIsolation);
    localStorage.setItem('local_passing_threshold', data.passingThreshold);
    localStorage.setItem('local_buddy_match_cap', data.buddyMatchCap);
    localStorage.setItem('local_media_node_isolation', data.mediaNodeIsolation);
  };

  // Journey States with standard offline-first localStorage support
  const [journeyPhases, setJourneyPhases] = useState<JourneyPhase[]>(() => {
    const saved = localStorage.getItem('local_journey_phases');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_JOURNEY_PHASES;
  });

  const saveJourneyToStorage = (updated: JourneyPhase[]) => {
    setJourneyPhases(updated);
    localStorage.setItem('local_journey_phases', JSON.stringify(updated));
  };

  const journeyProgress = useMemo(() => {
    let total = 0;
    let completed = 0;
    journeyPhases.forEach(p => {
      p.steps.forEach(s => {
        total++;
        if (s.completed) completed++;
      });
    });
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [journeyPhases]);

  const computedPhases = useMemo(() => {
    return journeyPhases.map((phase, idx) => {
      let computedStatus: 'In Progress' | 'Completed' | 'Locked' = 'In Progress';
      
      if (idx === 0) {
        const allDone = phase.steps.every(s => s.completed);
        computedStatus = allDone ? 'Completed' : 'In Progress';
      } else {
        const prevPhaseAllDone = journeyPhases[idx - 1].steps.every(s => s.completed);
        if (prevPhaseAllDone) {
          const currentAllDone = phase.steps.every(s => s.completed);
          computedStatus = currentAllDone ? 'Completed' : 'In Progress';
        } else {
          computedStatus = 'Locked';
        }
      }
      
      return {
        ...phase,
        status: computedStatus
      };
    });
  }, [journeyPhases]);

  const toggleStepCompleted = (stepId: string) => {
    const updated = journeyPhases.map(p => {
      const hasStep = p.steps.some(s => s.id === stepId);
      if (hasStep) {
        const updatedSteps = p.steps.map(s => {
          if (s.id === stepId) {
            return { ...s, completed: !s.completed };
          }
          return s;
        });
        return { ...p, steps: updatedSteps };
      }
      return p;
    });
    saveJourneyToStorage(updated);
  };

  // Modals
  const [sessionModal, setSessionModal] = useState<{ isOpen: boolean; record: TrainingSession | null }>({ isOpen: false, record: null });
  const [buddyModal, setBuddyModal] = useState<{ isOpen: boolean; record: BuddyRelation | null }>({ isOpen: false, record: null });
  const [configModalOpen, setConfigModalOpen] = useState(false);

  // Training Rules Rules config states
  const [registryConfig, setRegistryConfig] = useState(() => {
    const saved = localStorage.getItem('local_training_registry_config');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      passingThreshold: 80,
      buddyMatchCap: 2,
      mediaIsolation: 'Isolated SSL'
    };
  });

  const saveRegistryConfig = (updated: typeof registryConfig) => {
    setRegistryConfig(updated);
    localStorage.setItem('local_training_registry_config', JSON.stringify(updated));
  };

  // Init from LocalStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('local_training_sessions');
    if (savedSessions) {
      try { setSessions(JSON.parse(savedSessions)); } catch (e) { setSessions(INITIAL_SESSIONS); }
    } else {
      setSessions(INITIAL_SESSIONS);
      localStorage.setItem('local_training_sessions', JSON.stringify(INITIAL_SESSIONS));
    }

    const savedBuddies = localStorage.getItem('local_buddies');
    if (savedBuddies) {
      try { setBuddies(JSON.parse(savedBuddies)); } catch (e) { setBuddies(INITIAL_BUDDIES); }
    } else {
      setBuddies(INITIAL_BUDDIES);
      localStorage.setItem('local_buddies', JSON.stringify(INITIAL_BUDDIES));
    }
  }, []);

  const saveSessionsToStorage = (updatedList: TrainingSession[]) => {
    setSessions(updatedList);
    localStorage.setItem('local_training_sessions', JSON.stringify(updatedList));
  };

  const saveBuddiesToStorage = (updatedList: BuddyRelation[]) => {
    setBuddies(updatedList);
    localStorage.setItem('local_buddies', JSON.stringify(updatedList));
  };

  // Metrics Calculations
  const stats = useMemo(() => {
    const completedCount = sessions.filter(s => s.status === 'Completed').length;
    const totalParticipants = sessions.reduce((acc, curr) => acc + curr.participantsCount, 0);
    const avgScore = sessions.filter(s => s.avgScore && s.avgScore > 0).reduce((acc, curr) => acc + (curr.avgScore || 0), 0) / (completedCount || 1);
    const activeBuddyMatches = buddies.filter(b => b.status === 'Active').length;

    return {
      totalBatches: sessions.length,
      participants: totalParticipants,
      avgScore: avgScore.toFixed(1) + ' / 10.0',
      activeBuddies: activeBuddyMatches
    };
  }, [sessions, buddies]);

  // Filter List
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => 
      s.batchName.toLowerCase().includes(sessionSearch.toLowerCase()) || 
      s.trainer.toLowerCase().includes(sessionSearch.toLowerCase()) ||
      s.category.toLowerCase().includes(sessionSearch.toLowerCase())
    );
  }, [sessions, sessionSearch]);

  const filteredBuddies = useMemo(() => {
    return buddies.filter(b => {
      const matchesSearch = b.employeeName.toLowerCase().includes(buddySearch.toLowerCase()) || 
                            b.buddyName.toLowerCase().includes(buddySearch.toLowerCase()) ||
                            b.dept.toLowerCase().includes(buddySearch.toLowerCase());
      
      const matchesStatus = filterEmployeeStatus === 'all' || b.status === filterEmployeeStatus;
      const matchesDept = filterEmployeeDept === 'all' || b.dept === filterEmployeeDept;
      
      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [buddies, buddySearch, filterEmployeeStatus, filterEmployeeDept]);

  const uniqueDepts = useMemo(() => {
    const depts = new Set<string>();
    buddies.forEach(b => {
      if (b.dept) depts.add(b.dept);
    });
    return Array.from(depts);
  }, [buddies]);

  const employeeStats = useMemo(() => {
    const total = buddies.length;
    const completed = buddies.filter(b => b.status === 'Completed').length;
    const pending = buddies.filter(b => b.status === 'Pending').length;
    const active = buddies.filter(b => b.status === 'Active').length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    
    return {
      total,
      completed,
      pending,
      active,
      completionRate: completionRate.toFixed(1) + '%'
    };
  }, [buddies]);

  // Add/Edit Session Form Handlers
  const openSessionEdit = (record: TrainingSession | null = null) => {
    setSessionModal({ isOpen: true, record });
  };

  const handleSaveSession = (data: TrainingSession) => {
    if (sessionModal.record) {
      // Edit
      const updated = sessions.map(item => item.id === data.id ? data : item);
      saveSessionsToStorage(updated);
    } else {
      // New
      const newElem = { ...data, id: 'TRN-' + Date.now() };
      saveSessionsToStorage([...sessions, newElem]);
    }
    setSessionModal({ isOpen: false, record: null });
  };

  const handleDeleteSession = (id: string) => {
    if (confirm('ยืนยันความต้องการที่จะลบหลักสูตรปฐมนิเทศนี้ออกจากระบบ?')) {
      const filtered = sessions.filter(item => item.id !== id);
      saveSessionsToStorage(filtered);
    }
  };

  // Add/Edit Buddy Handlers
  const openBuddyEdit = (record: BuddyRelation | null = null) => {
    setBuddyModal({ isOpen: true, record });
  };

  const handleSaveBuddy = (data: BuddyRelation) => {
    if (buddyModal.record) {
      const updated = buddies.map(item => item.id === data.id ? data : item);
      saveBuddiesToStorage(updated);
    } else {
      const newElem = { ...data, id: 'BDY-' + Date.now() };
      saveBuddiesToStorage([...buddies, newElem]);
    }
    setBuddyModal({ isOpen: false, record: null });
  };

  const handleDeleteBuddy = (id: string) => {
    if (confirm('ยืนยันที่จะยกเลิกความสัมพันธ์ระบบพี่เลี้ยงนี้?')) {
      const filtered = buddies.filter(item => item.id !== id);
      saveBuddiesToStorage(filtered);
    }
  };

  return (
    <div className="min-h-screen text-[#212c46] font-sans px-4 sm:px-8 animate-fadeIn selection:bg-[#709654]/30 flex-1 flex-col flex min-h-0 pb-6">
      {/* USER GUIDE FLOATING TAB */}
      {typeof document !== 'undefined' && createPortal(
        <button 
          onClick={() => setIsGuideOpen(true)} 
          className="fixed right-0 bg-[#f8f9fa] border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#709654] hover:text-white hover:border-[#709654] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group cursor-pointer animate-fadeIn" 
          style={{ top: '150px' }}
        >
          <Icons.HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#7a8b95] group-hover:text-white" />
          <span className="font-black tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[11px]">
            {language === 'TH' ? 'คู่มือผู้ใช้งาน' : 'USER GUIDE'}
          </span>
        </button>,
        document.body
      )}
      {/* 2. Page Header - Integrated Directly (No Background Plate, No redundant margin clutter) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-[20px] font-black text-[#212c46] uppercase tracking-widest flex items-center gap-3">
            <Icons.GraduationCap className="text-[#709654] w-6 h-6 animate-pulse" />
            {language === 'EN' ? 'Orientation & Trainings Node' : 'การอบรมและปฐมนิเทศพนักงานใหม่'}
          </h2>
          <p className="text-[11px] font-bold text-[#7a8b95] uppercase tracking-widest mt-1.5 leading-none">
            Learning Pathways, Culture Assimilations, and Buddy Mapping Registry
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex gap-2 shrink-0">
          
          {activeTab !== 'journey' && activeTab !== 'resources' && (
            <button 
              onClick={() => {
                if (activeTab === 'sessions') openSessionEdit();
                else if (activeTab === 'buddies') openBuddyEdit();
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#212c46] text-white hover:bg-[#414757] rounded-xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-md animate-fadeIn"
            >
              <Icons.Plus size={13} className="text-[#709654]" strokeWidth={3}/> 
              {activeTab === 'sessions' ? 'Add Session' : 'Map New Buddy'}
            </button>
          )}

          {activeTab === 'journey' && (
            <button 
              onClick={() => {
                if (confirm(language === 'TH' ? 'ต้องการล้างความคืบหน้าแผนพัฒนาและเริ่มใหม่จำลองใช่หรือไม่?' : 'Are you sure you want to clear your current onboarding milestones and reset progress to Day 1 default?')) {
                  saveJourneyToStorage(INITIAL_JOURNEY_PHASES);
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm hover:shadow animate-fadeIn"
            >
              <Icons.RefreshCw size={12} className="text-rose-500" />
              {language === 'TH' ? 'รีเซ็ตแผนพัฒนา' : 'Reset Journey'}
            </button>
          )}
        </div>
      </div>
      {/* 3. KPI Metrics System (Same modular density as Home page) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-0">
        <KpiCard
          icon="Calendar"
          value={stats.totalBatches}
          label="Total Training Sessions"
          color={THEME.skyBlue}
          description="เซสชันหลักสูตรสะสม" />
        <KpiCard
          icon="Users"
          value={stats.participants}
          label="Onboarded Attendants"
          color={THEME.gold}
          description="พนักงานบรรจุเข้าเรียน" />
        <KpiCard
          icon="Award"
          value={stats.avgScore}
          label="Avg Evaluation Score"
          color={THEME.success}
          description="คะแนนเกณฑ์เฉลี่ยสะสม" />
        <KpiCard
          icon="Heart"
          value={stats.activeBuddies}
          label="Active Buddy Matches"
          color={THEME.primaryLight}
          description="คู่บัดดี้ประกบใจ" />
      </div>
      {/* 5. Central Unified Console Container */}
      <div className="bg-white rounded-2xl border border-[#eaeaec] shadow-sm overflow-hidden mb-0">
        
        {/* Container Header: Unified Tabs + Conditional Context Actions */}
        <div className="bg-slate-50/70 border-b border-[#eaeaec] p-4 sm:p-5 flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4">
          
          {/* Inner Tab Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'journey', label: language === 'TH' ? 'แผนพัฒนาพนักงาน (My Journey)' : 'My Onboarding Journey', icon: 'Compass' },
              { id: 'management', label: language === 'TH' ? 'ระบบจัดการปฐมนิเทศและพี่เลี้ยง (Workplace Management Console)' : 'Workplace Management Console', icon: 'Sliders', count: sessions.length + buddies.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); }}
                className={`flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer border ${
                  activeTab === tab.id 
                    ? 'bg-white border-[#eaeaec] text-[#212c46] shadow-xs font-black' 
                    : 'bg-transparent border-transparent text-[#7a8b95] hover:text-[#212c46] hover:bg-white/40'
                }`}
              >
                <LucideIcon name={tab.icon} size={13} className={activeTab === tab.id ? 'text-[#709654]' : 'text-[#7a8b95]'} />
                <span>{tab.label}</span>
                {(tab as any).count !== undefined && (
                  <span className={`text-[9.5px] font-black px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-[#709654]/10 text-[#709654]' : 'bg-[#eaeaec] text-[#7a8b95]'}`}>
                    {(tab as any).count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Conditional Contextual Search & Filters */}
          <div className="flex shrink-0 items-center">
            {activeTab === 'management' ? (
              <div className="flex items-center gap-2 bg-[#709654]/10 px-3 py-1.5 rounded-lg border border-[#709654]/20 animate-fadeIn text-[10px] font-black tracking-widest text-[#709654] uppercase">
                <span className="w-2 h-2 rounded-full bg-[#709654] animate-pulse" />
                {language === 'TH' ? 'คอนโซลจัดการอบรมแอดมิน' : 'Management Console'}
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-[#657f4d]/5 px-3 py-1.5 rounded-lg border border-[#657f4d]/20">
                <span className="w-2 h-2 rounded-full bg-[#657f4d] animate-ping opacity-75" />
                <span className="text-[10px] font-black text-[#657f4d] uppercase tracking-widest">
                  {language === 'TH' ? 'แผนการเรียนรู้แบบตอบโต้' : 'Interactive Roadmaps'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tab 0: INTERACTIVE ONBOARDING JOURNEY ROADMAP */}
        {activeTab === 'journey' && (
          <div className="p-4 sm:p-6 bg-[#fcfcfb]/40">
            
            {/* Ambient Hero Banner matching user images exactly */}
            <div className="bg-[#133041] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-0 border border-white/5 animate-fadeIn">
              {/* Backside gradient glows */}
              <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-br from-teal-500/10 to-[#b58c4f]/15 rounded-full filter blur-2xl transform translate-x-24 -translate-y-24 pointer-events-none" />
              
              <div className="relative z-10 max-w-xl font-sans">
                <span className="inline-block bg-[#b58c4f] text-[#212c46] font-extrabold text-[10px] px-2.5 py-1 rounded tracking-widest uppercase mb-3">
                  Day 1
                </span>
                <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
                  Welcome to the Family, Thana! <span className="animate-bounce inline-block">🎉</span>
                </h3>
                <p className="text-[12px] md:text-[13px] text-slate-300 font-medium mt-2 leading-relaxed">
                  We are thrilled to have you here. This dashboard is your personal guide to getting started. Complete the missions below to unlock your full potential!
                </p>
              </div>

              {/* Progress Box Widget */}
              <div className="relative z-10 w-full md:w-auto shrink-0 bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5 flex items-center gap-6 justify-between md:justify-start">
                <div className="flex flex-col font-sans">
                  <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Overall Progress</span>
                  <span className="text-3xl md:text-4xl font-extrabold font-mono text-[#b58c4f] mt-1">{journeyProgress}%</span>
                </div>
                <div className="w-[1px] h-10 bg-white/15" />
                <div className="flex items-center gap-3 font-sans">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full p-0.5 border border-white/20 bg-slate-800 overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150" 
                        alt="Sarah" 
                        className="w-full h-full rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-slate-950 rounded-full" />
                  </div>
                  <div>
                    <span className="block text-[9px] font-black tracking-widest text-slate-400 uppercase">Buddy</span>
                    <span className="block text-[13px] font-black text-white">Sarah</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timings Phase Grid - Two Columns Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column (2/3): Phases timeline cards */}
              <div className="lg:col-span-2 space-y-6">
                {computedPhases.map((phase) => {
                  const isLocked = phase.status === 'Locked';
                  return (
                    <motion.div 
                      key={phase.id} 
                      whileHover={!isLocked ? { scale: 1.008, y: -2, boxShadow: '0 12px 20px -8px rgba(0,0,0,0.06)' } : {}}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs transition-all duration-300 ${
                        isLocked 
                          ? 'border-gray-200/50 opacity-40 bg-gray-50/20 shadow-none cursor-not-allowed' 
                          : 'border-slate-200/80 hover:border-[#709654]/40'
                      }`}
                    >
                    {/* Phase Header Row */}
                    <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100 font-sans">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          phase.status === 'Completed' 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                            : phase.status === 'In Progress' 
                            ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                            : 'bg-gray-100 text-gray-400 border border-gray-200'
                        }`}>
                          {phase.id === 1 ? <Icons.Flag size={15} /> : phase.id === 2 ? <Icons.Users size={15} /> : <Icons.Target size={15} />}
                        </div>
                        <div>
                          <h4 className="text-[12px] font-black text-[#212c46] tracking-tight">
                            {phase.id === 1 ? 'Phase 1: Welcome & Setup (Day 1)' : phase.id === 2 ? 'Phase 2: Culture & Connection (Week 1)' : 'Phase 3: Role & Performance (Month 1)'}
                          </h4>
                          <p className="text-[9.5px] font-bold text-[#7a8b95] uppercase tracking-wider mt-0.5">{phase.subtitle}</p>
                        </div>
                      </div>
                      
                      {/* Pill */}
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded ${
                        phase.status === 'Completed' 
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                          : phase.status === 'In Progress' 
                          ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' 
                          : 'bg-slate-100 text-slate-400 border border-slate-200/80 font-bold'
                      }`}>
                        {phase.status === 'Completed' ? 'Completed' : phase.status === 'In Progress' ? 'In Progress' : 'Locked'}
                      </span>
                    </div>

                    {/* Phase Connected Steps list */}
                    <div className="space-y-4 relative">
                      {phase.steps.map((step, sIdx) => {
                        const isInteractable = phase.status !== 'Locked';
                        return (
                          <div key={step.id} className="flex gap-4 items-stretch relative group">
                            
                            {/* Connector line and bullet */}
                            <div className="flex flex-col items-center shrink-0">
                              <button
                                disabled={!isInteractable}
                                onClick={() => toggleStepCompleted(step.id)}
                                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 transition-all ${
                                  step.completed 
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-sm' 
                                    : !isInteractable
                                    ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                                    : 'border-slate-300 bg-white hover:border-[#b58c4f] text-slate-400 cursor-pointer hover:scale-110'
                                }`}
                              >
                                {step.completed ? (
                                  <Icons.Check size={11} strokeWidth={4} />
                                ) : (
                                  <span className="text-[10px] font-black">{sIdx + 1}</span>
                                )}
                              </button>
                              
                              {/* micro line */}
                              {sIdx < phase.steps.length - 1 && (
                                <div className={`w-[2px] grow my-1 ${
                                  step.completed && phase.steps[sIdx + 1].completed 
                                    ? 'bg-emerald-500' 
                                    : 'bg-slate-200'
                                }`} />
                              )}
                            </div>

                            {/* Task item card */}
                            <motion.div 
                              onClick={() => isInteractable && toggleStepCompleted(step.id)}
                              whileHover={isInteractable ? { scale: 1.008, x: 2, boxShadow: '0 4px 12px -3px rgba(0,0,0,0.02)' } : {}}
                              transition={{ duration: 0.15 }}
                              className={`grow p-4 rounded-xl border transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transform group/item ${
                                step.completed 
                                  ? 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10 cursor-pointer text-slate-400' 
                                  : !isInteractable
                                  ? 'bg-gray-50/50 border-gray-100/50 text-gray-400 cursor-not-allowed'
                                  : 'bg-white border-slate-200 hover:border-[#709654] cursor-pointer text-[#212c46]'
                              }`}
                            >
                              <div className="font-sans">
                                <span className={`font-black text-[12px] tracking-tight flex items-center gap-2 ${
                                  step.completed ? 'line-through text-slate-400/80 font-semibold' : 'text-[#212c46]'
                                }`}>
                                  {step.title}
                                  {step.completed && (
                                    <span className="text-[9px] font-black bg-[#657f4d]/10 text-[#657f4d] px-2 py-0.5 rounded tracking-wide uppercase">
                                      Done / สำเร็จ
                                    </span>
                                  )}
                                  {!step.completed && isInteractable && (
                                    <span className="text-[9px] font-black bg-[#709654]/10 text-[#709654] px-1.5 py-0.5 rounded tracking-wide uppercase opacity-0 group-hover/item:opacity-100 transition-opacity duration-300">
                                      Click to toggle / คลิกเพื่อบันทึก
                                    </span>
                                  )}
                                </span>
                                <span className={`text-[10.5px] font-medium block mt-1 tracking-normal ${
                                  step.completed ? 'text-slate-400' : 'text-slate-500'
                                }`}>
                                  {step.description}
                                </span>
                              </div>
                              <span className="text-[9px] font-black font-mono tracking-wider text-[#a94228] bg-[#a94218]/5 px-2 py-0.5 rounded border border-[#a94228]/10 shrink-0 select-none">
                                {step.duration}
                              </span>
                            </motion.div>

                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
              </div>

              {/* Right Column (1/3): Portrait card & focus box */}
              <div className="space-y-6">
                
                {/* YOUR ONBOARDING BUDDY COMPONENT */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs text-center relative overflow-hidden group font-sans">
                  <span className="text-[9px] text-[#7a8b95] font-black uppercase tracking-widest block mb-4">
                    Your Onboarding Buddy
                  </span>
                  
                  {/* Circle Portrait */}
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <div className="w-24 h-24 rounded-full p-1 border-2 border-[#709654]/40 overflow-hidden bg-white shadow-xs">
                      <img 
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200" 
                        alt="Sarah Connor Profile" 
                        className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="absolute bottom-1 right-2 w-4.5 h-4.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
                  </div>

                  <h4 className="text-[14.5px] font-black text-[#212c46]">Sarah Connor</h4>
                  <p className="text-[10px] text-[#4d87a8] font-black uppercase mt-0.5 tracking-wider">Senior HR Specialist</p>
                  
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 my-4">
                    <p className="text-[11px] font-bold text-[#7a8b95] leading-relaxed italic">
                      "Hi Thana! Feel free to ask me anything about the company or where to find the best coffee!"
                    </p>
                  </div>

                  {/* Actions call triggers */}
                  <div className="flex justify-center gap-2.5 pt-1">
                    <button 
                      onClick={() => alert(language === 'TH' ? 'เปิดช่องทางแชตและบอร์ดสนทนากับพี่เลี้ยง (ระบบจำลอง)' : 'Opening conversational interface with your onboarding buddy')}
                      className="px-4 py-2 bg-[#212c46] text-[#b58c4f] hover:bg-[#b58c4f] hover:text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                      <Icons.MessageSquare size={13} /> {language === 'TH' ? 'แชตติดต่อพี่เลี้ยง' : 'Contact Buddy'}
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* Tab 1-3 Unified: WORKPLACE MANAGEMENT CONSOLE */}
        {activeTab === 'management' && (
          <div className="divide-y divide-gray-200/80 bg-white">
            
            {/* ZONE A: TRAINING SESSIONS & PROGRAMS */}
            <div className="p-5 sm:p-6 space-y-5">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4 border-[#709654] pl-4">
                <div>
                  <h3 className="text-[13px] font-black text-[#212c46] uppercase tracking-wider flex items-center gap-2">
                    <Icons.CheckSquare size={15} className="text-[#709654]" /> ตารางหลักสูตรการจัดสัมมนาปฐมนิเทศ (Orientation Sessions)
                  </h3>
                  <p className="text-[11px] text-[#7a8b95] font-bold mt-1 uppercase">
                    Admin register of live lectures, milestones, overall student passing grades
                  </p>
                </div>
                
                {/* Isolated Search bar for Sessions */}
                <div className="relative w-full md:w-72 shrink-0">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Icons.Search size={13} className="text-[#7a8b95]" />
                  </span>
                  <input 
                    type="text"
                    value={sessionSearch}
                    onChange={e => setSessionSearch(e.target.value)}
                    placeholder={language === 'TH' ? 'ค้นหาหลักสูตรรุ่น, วิทยากร, หมวดหมู่...' : 'Search Batch, Trainer, Category...'}
                    className="w-full bg-white border border-[#eaeaec] rounded-xl pl-8.5 pr-3 py-1.5 text-[11px] font-bold text-[#212c46] shadow-xs outline-none focus:border-[#709654]"
                  />
                </div>
              </div>

              {/* Table of Sessions */}
              <div className="overflow-x-auto rounded-xl border border-gray-200/65">
                <table className="w-full text-left border-collapse table-fixed min-w-[750px] text-[12px]">
                  <thead className="bg-[#222b38] text-white">
                    <tr className="border-b-2 border-[#709654]">
                      <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider w-[12%] font-mono text-left">Session ID</th>
                      <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider text-left w-[28%]">Course Batch Name</th>
                      <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider text-left w-[18%]">Main Instructor</th>
                      <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider text-center w-[12%]">Attendees</th>
                      <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider text-center w-[16%] font-mono">Date Span</th>
                      <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider text-center w-[14%]">Final Score</th>
                      <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider text-center w-[10%]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-[12px] font-medium text-[#212c46]">
                    {filteredSessions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-[#7a8b95] font-bold uppercase tracking-widest text-[11px]">
                          <Icons.Inbox className="mx-auto w-7 h-7 opacity-30 mb-2"/>
                          No sessions matching search query
                        </td>
                      </tr>
                    ) : (
                      filteredSessions.map((session) => (
                        <tr key={session.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-2.5 px-4 font-mono font-bold text-gray-400 text-[12px] truncate">{session.id}</td>
                          <td className="py-2.5 px-4">
                            <div className="flex flex-col truncate font-sans">
                              <span className="font-bold text-[#212c46] tracking-tight text-[12px]">{session.batchName}</span>
                              <span className="text-[11px] font-black text-[#a94228] uppercase tracking-wider mt-0.5">{session.category}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 font-bold text-[#414757] truncate text-[12px] font-sans">{session.trainer}</td>
                          <td className="py-2.5 px-4 text-center font-sans">
                            <div className="flex items-center justify-center gap-1.5 font-bold text-gray-750 text-[12px]">
                              <Icons.Users size={11} className="text-gray-400" />
                              <span>{session.participantsCount} ท่าน</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-center font-mono font-bold text-gray-500 text-[12px] truncate">
                            {session.startDate}
                          </td>
                          <td className="py-2.5 px-4 text-center font-sans">
                            {session.status === 'Completed' ? (
                              <div className="flex flex-col items-center">
                                <span className="font-bold text-[#657f4d] font-mono text-[12px]">{session.avgScore?.toFixed(1)}/10.0</span>
                                <span className="text-[11px] font-black uppercase text-[#657f4d] bg-[#657f4d]/8 px-1.5 py-0.2 rounded mt-0.5 tracking-wider">Passed</span>
                              </div>
                            ) : (
                              <span className={`inline-block text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                                session.status === 'In Progress' ? 'text-[#3f809e] border-[#3f809e]/20 bg-[#3f809e]/5 animate-pulse' : 'text-[#b58c4f] border-[#b58c4f]/20 bg-[#b58c4f]/5'
                              }`}>
                                {session.status}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-[1px]">
                              <button 
                                onClick={() => openSessionEdit(session)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-[#212c46] transition-colors cursor-pointer"
                                title="Edit Core Training Info"
                              >
                                <Icons.Edit3 size={11} strokeWidth={2.5} />
                              </button>
                              <button 
                                onClick={() => handleDeleteSession(session.id)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-700 transition-colors cursor-pointer"
                                title="Withdraw Session Record"
                              >
                                <Icons.Trash2 size={11} strokeWidth={2.5} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ZONE B: BUDDY MENTOR LINKAGE SYSTEM */}
            <div className="p-5 sm:p-6 space-y-5">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-l-4 border-[#3f809e] pl-4">
                <div>
                  <h3 className="text-[13px] font-black text-[#212c46] uppercase tracking-wider flex items-center gap-2 font-sans">
                    <Icons.Users size={15} className="text-[#3f809e]" /> บัดดี้คู่หูพี่เลี้ยงพนักงานใหม่ (Buddy Mentoring Alignment)
                  </h3>
                  <p className="text-[11px] text-[#7a8b95] font-bold mt-1 uppercase font-sans">
                    Track integration milestones, buddy engagement checklists, satisfaction ratings
                  </p>
                </div>

                {/* Operations filters and search row */}
                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto items-stretch sm:items-center">
                  {/* Status dropdown */}
                  <div className="flex items-center gap-1.5 bg-[#f8f9fa] px-2.5 py-1.5 rounded-xl border border-[#eaeaec] shadow-xs">
                    <Icons.Filter size={10.5} className="text-[#7a8b95]" />
                    <select
                      value={filterEmployeeStatus}
                      onChange={e => setFilterEmployeeStatus(e.target.value)}
                      className="bg-transparent text-[10px] font-black text-[#212c46] outline-none cursor-pointer uppercase tracking-wider font-sans"
                    >
                      <option value="all">{language === 'TH' ? 'ทุกสถานะ' : 'All Status'}</option>
                      <option value="Completed">{language === 'TH' ? 'สำเร็จคู่เรียน' : 'Completed'}</option>
                      <option value="Active">{language === 'TH' ? 'กำลังดูแล' : 'Active'}</option>
                      <option value="Pending">{language === 'TH' ? 'รอดำเนินการ' : 'Pending'}</option>
                    </select>
                  </div>

                  {/* Department dropdown */}
                  <div className="flex items-center gap-1.5 bg-[#f8f9fa] px-2.5 py-1.5 rounded-xl border border-[#eaeaec] shadow-xs">
                    <Icons.Briefcase size={10.5} className="text-[#7a8b95]" />
                    <select
                      value={filterEmployeeDept}
                      onChange={e => setFilterEmployeeDept(e.target.value)}
                      className="bg-transparent text-[10px] font-black text-[#212c46] outline-none cursor-pointer uppercase tracking-wider max-w-[120px] truncate font-sans"
                    >
                      <option value="all">{language === 'TH' ? 'ทุกแผนก' : 'All Depts'}</option>
                      {uniqueDepts.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  {/* Search box */}
                  <div className="relative w-full sm:w-48">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
                      <Icons.Search size={11} className="text-[#7a8b95]" />
                    </span>
                    <input 
                      type="text"
                      value={buddySearch}
                      onChange={e => setBuddySearch(e.target.value)}
                      placeholder={language === 'TH' ? 'ค้นหาชื่อบัดดี้...' : 'Search Buddy/Staff...'}
                      className="w-full bg-white border border-[#eaeaec] rounded-xl pl-7.5 pr-2.5 py-1.5 text-[10.5px] font-bold text-[#212c46] shadow-xs outline-none focus:border-[#709654]"
                    />
                  </div>
                </div>
              </div>

              {/* Mini KPI Cards panel inside section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex items-center gap-3 font-sans">
                  <div className="w-7 h-7 rounded-lg bg-[#212c46]/5 flex items-center justify-center text-[#212c46] shrink-0">
                    <Icons.Users size={13} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-[#7a8b95] uppercase tracking-wider">Total Matches</p>
                    <p className="text-[13px] font-black text-[#212c46] font-mono leading-none mt-0.5">{employeeStats.total} Pairs</p>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex items-center gap-3 font-sans">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/5 flex items-center justify-center text-amber-500 shrink-0">
                    <Icons.Hourglass size={13} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-[#7a8b95] uppercase tracking-wider">Total Pending</p>
                    <p className="text-[13px] font-black text-amber-600 font-mono leading-none mt-0.5">{employeeStats.pending} Pairs</p>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex items-center gap-3 font-sans">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/5 flex items-center justify-center text-blue-500 shrink-0">
                    <Icons.Activity size={13} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-[#7a8b95] uppercase tracking-wider">In Progress</p>
                    <p className="text-[13px] font-black text-blue-600 font-mono leading-none mt-0.5">{employeeStats.active} Pairs</p>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex items-center gap-3 font-sans">
                  <div className="w-7 h-7 rounded-lg bg-[#657f4d]/5 flex items-center justify-center text-[#657f4d] shrink-0">
                    <Icons.CheckCircle2 size={13} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-[#7a8b95] uppercase tracking-wider">Completion Rate</p>
                    <p className="text-[13px] font-black text-[#657f4d] font-mono leading-none mt-0.5">{employeeStats.completionRate}</p>
                  </div>
                </div>
              </div>

              {/* Buddy Relations Table */}
              <div className="overflow-x-auto rounded-xl border border-gray-200/65">
                <table className="w-full text-left border-collapse table-fixed min-w-[750px] text-[12px]">
                  <thead className="bg-[#222b38] text-white font-sans">
                    <tr className="border-b-2 border-[#709654]">
                      <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider w-[12%] font-mono text-left">Relation ID</th>
                      <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider text-left w-[24%]">New Employee</th>
                      <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider text-left w-[24%]">Assigned Buddy</th>
                      <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider text-center w-[12%]">Meetings Log</th>
                      <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider text-left w-[18%]">Progress Scale</th>
                      <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider text-center w-[10%]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-[12px] font-medium text-[#212c46] font-sans">
                    {filteredBuddies.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-[#7a8b95] font-bold uppercase tracking-widest text-[11px]">
                          <Icons.Inbox className="mx-auto w-7 h-7 opacity-30 mb-2"/>
                          No buddy linkages matched filters
                        </td>
                      </tr>
                    ) : (
                      filteredBuddies.map((buddy) => {
                        const computedProgress = buddy.progress ?? (buddy.status === 'Completed' ? 100 : buddy.status === 'Active' ? 60 : 0);
                        return (
                          <tr key={buddy.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-2.5 px-4 font-mono font-bold text-gray-400 text-[12px] truncate">{buddy.id}</td>
                            <td className="py-2.5 px-4">
                              <div className="flex flex-col truncate">
                                <span className="font-bold text-[#212c46] tracking-tight text-[12px]">{buddy.employeeName}</span>
                                <span className="text-[11px] font-mono text-[#a94228] font-bold mt-0.5">{buddy.dept} &bull; {buddy.employeeId}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-4">
                              <div className="flex flex-col truncate">
                                <span className="font-bold text-[#3f809e]/90 text-[12px]">{buddy.buddyName}</span>
                                <span className="text-[11px] text-gray-400 font-bold tracking-widest mt-0.5 uppercase">{buddy.buddyDept}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-4 text-center font-bold font-mono text-[12px]">
                              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200/40 rounded text-slate-600 text-[11px] uppercase font-black">
                                {buddy.meetingCount} Logged
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-[12px]">
                              <div className="flex flex-col gap-1 py-1">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className={`inline-flex items-center gap-1 px-1 py-0.2 rounded text-[11px] font-black uppercase tracking-wider ${
                                    buddy.status === 'Completed' ? 'bg-[#657f4d]/8 text-[#657f4d]' : buddy.status === 'Active' ? 'bg-[#b58c4f]/8 text-[#b58c4f]' : 'bg-slate-100 text-slate-500'
                                  }`}>
                                    {buddy.status === 'Completed' ? 'Completed' : buddy.status === 'Active' ? 'In Progress' : 'Pending'}
                                  </span>
                                  <span className="font-mono text-slate-700 font-bold">{computedProgress}%</span>
                                </div>
                                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden border border-slate-200/30">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      buddy.status === 'Completed' ? 'bg-gradient-to-r from-[#657f4d] to-emerald-500' : buddy.status === 'Active' ? 'bg-[#b58c4f]' : 'bg-slate-300'
                                    }`}
                                    style={{ width: `${computedProgress}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-[1px]">
                                <button 
                                  onClick={() => openBuddyEdit(buddy)}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-[#212c46] transition-colors cursor-pointer"
                                  title="Edit Relation Data"
                                >
                                  <Icons.Edit3 size={11} strokeWidth={2.5}/>
                                </button>
                                <button 
                                  onClick={() => handleDeleteBuddy(buddy.id)}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-700 transition-colors cursor-pointer"
                                  title="Discard Relation link"
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
            </div>

            {/* ZONE C: CONFIDENTIAL ORIENTATION LIBRARY & BLUEPRINTS */}
            <div className="p-5 sm:p-6 space-y-5 bg-slate-50/30">
              <div className="border-l-4 border-[#b58c4f] pl-4">
                <h3 className="text-[13px] font-black text-[#212c46] uppercase tracking-wider flex items-center gap-2 font-sans">
                  <Icons.FolderOpen size={15} className="text-[#b58c4f]" /> สารสนเทศในห้องอนุมัติและคลังสื่อแยกเซกเมนต์ (Orientation Library Nodes)
                </h3>
                <p className="text-[11px] text-[#7a8b95] font-bold mt-1 uppercase font-sans">
                  Read-only library containing official templates, manuals, and policies
                </p>
              </div>

              {/* Grid of Library Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: 'วิสัยทัศน์ วัฒนธรรมองค์กร & Company Vision 2026', format: 'PDF Handbook / 4.2 MB', desc: 'คู่มือเป้าหมายธุรกิจ วัฒนธรรมกลุ่มแกนกลาง และค่านิยมหลักขององค์กร', linkName: 'Download Vision_2026.pdf', color: THEME.gold },
                  { title: 'ความปลอดภัยระบบไอที และข้อบังคับ Cybersecurity Policy', format: 'Interactive Doc / 1.8 MB', desc: 'แนวทางการตั้งค่ายูสเซอร์ การระวังเรื่องฟิชชิ่งพาสเวิร์ด และระบอบปลอดภัยกฎสารนิเทศ', linkName: 'Launch Cyber_Safety_Policy.pdf', color: THEME.skyBlue },
                  { title: 'พระราชบัญญัติคุ้มครองข้อตกลงและสวัสดิการกฎบริษัท (Welfares)', format: 'Digital Registry / 8 MB', desc: 'เอกสารอธิบายการลา การใช้สิทธิ์สวัสดิการรักษากลุ่มครอบครัว และประกันภัยกลุ่ม', linkName: 'Open Welfare_Manual_TH.pdf', color: THEME.success },
                  { title: 'คอร์สเรียนปฐมนิเทศภาคบันทึกเทป (Video Lecture On-demand)', format: 'Video Playlist / STREAM', desc: 'คำต้อนรับและภาพบรรยายสรุปจากคณบดีกรรมการผู้จัดการและกลุ่มผู้บริหาร', linkName: 'Stream Full_Lecture_Stream', color: THEME.indigo }
                ].map((res, rIdx) => (
                  <motion.div 
                    key={rIdx} 
                    whileHover={{ scale: 1.015, y: -3, boxShadow: '0 12px 20px -8px rgba(0,0,0,0.06)' }}
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    className="bg-white p-5 rounded-xl border border-[#eaeaec] flex flex-col justify-between hover:border-[#709654] transition-all group font-sans"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-200">{res.format}</span>
                        <Icons.Folder className="w-5 h-5 text-gray-400 group-hover:text-[#709654] transition-all" />
                      </div>
                      <h5 className="font-bold text-[12px] text-[#212c46] leading-snug">{res.title}</h5>
                      <p className="text-[11px] text-[#7a8b95] leading-relaxed font-bold mt-1.5">{res.desc}</p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[10.5px] font-mono font-bold text-[#b58c4f]">{res.linkName}</span>
                      <button 
                        onClick={() => alert(`คุณได้สั่งเปิดไฟล์เอกสาร ${res.title} เรียบร้อยแล้ว (การใช้งานจำลอง)`)}
                        className="text-[#212c46] group-hover:text-[#709654] text-[11px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                      >
                        Open Node <Icons.ArrowRight size={12} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* 6. Settings Page Design Segment (Integrated with Standards of permissions) */}
      <div className="bg-[#f8f9fa] rounded-2xl border border-[#eaeaec] p-6 mb-0 relative overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-[12px] font-black text-[#212c46] uppercase tracking-widest flex items-center gap-2">
            <Icons.Sliders size={15} className="text-[#b58c4f]"/> การตั้งค่ากฎการอบรม (Training Registry Configuration)
          </h4>
          <button 
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#212c46] hover:bg-[#b58c4f] hover:text-white text-white rounded-lg text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs"
          >
            <Icons.Edit3 size={11} />
            {language === 'TH' ? 'แก้ไขกฎเกณฑ์' : 'Edit Rule Settings'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-xl border border-[#eaeaec]">
            <span className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-widest mb-2 font-sans">อบรมผ่านเกณฑ์ขั้นต่ำ (% Passing Threshold)</span>
            <div className="flex items-center justify-between font-sans">
              <span className="text-[18px] font-black text-[#212c46] font-mono">{passingThreshold}</span>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300">Standard Rule</span>
            </div>
            <p className="text-[10px] text-[#7a8b95] font-bold mt-2 leading-relaxed font-sans">คะแนนผลสอบท้ายบทปฐมนิเทศขั้นต่ำที่พนักงานใหม่ทุกคนจำเป็นต้องทำผ่าน</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#eaeaec]">
            <span className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-widest mb-2 font-sans">อัตราพี่เลี้ยงประกบพนักงานใหม่ (Buddy Match Cap)</span>
            <div className="flex items-center justify-between font-sans">
              <span className="text-[18px] font-black text-[#212c46] font-mono">{buddyMatchCap}</span>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-[#3f809e]/10 text-[#3f809e] border border-[#3f809e]/30">Active Limit</span>
            </div>
            <p className="text-[10px] text-[#7a8b95] font-bold mt-2 leading-relaxed font-sans">โควต้าผู้ดูแลสูงสุดป้องกันความเหนื่อยล้าสะสมของพี่เลี้ยงในกลุ่มอสังหาฯ</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#eaeaec]">
            <span className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-widest mb-2 font-sans">ระบบความปลอดภัยภาพรวม (Media Node Isolation)</span>
            <div className="flex items-center justify-between font-sans">
              <span className="text-[18px] font-black text-[#932c2e] font-mono">{mediaNodeIsolation}</span>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-300">Strict Sec</span>
            </div>
            <p className="text-[10px] text-[#7a8b95] font-bold mt-2 leading-relaxed font-sans">เปิดเซสชันเก็บประวัติแยกจาก Sandbox ป้องกันสื่อหลุดรั่วซึม</p>
          </div>
        </div>
      </div>
      {/* 7. Modal 1: Edit Training Sessions Modal */}
      {sessionModal.isOpen && (
        <EditSessionModal 
          isOpen={sessionModal.isOpen}
          record={sessionModal.record}
          onClose={() => setSessionModal({ isOpen: false, record: null })}
          onSave={handleSaveSession}
        />
      )}
      {/* 8. Modal 2: Edit Buddy Relationships Modal */}
      {buddyModal.isOpen && (
        <EditBuddyModal 
          isOpen={buddyModal.isOpen}
          record={buddyModal.record}
          onClose={() => setBuddyModal({ isOpen: false, record: null })}
          onSave={handleSaveBuddy}
        />
      )}
      {/* 8.5 Modal 3: Edit Training Registry Config Modal */}
      {isConfigModalOpen && (
        <EditConfigModal 
          isOpen={isConfigModalOpen}
          initialData={{ passingThreshold, buddyMatchCap, mediaNodeIsolation }}
          onClose={() => setIsConfigModalOpen(false)}
          onSave={handleSaveConfig}
        />
      )}
      {/* 9. User Guide Panel (Right-side transparent blur drawer) */}
      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}

function EditSessionModal({ isOpen, record, onClose, onSave }: any) {
  const [formData, setFormData] = useState<TrainingSession>({
    id: '',
    batchName: '',
    startDate: '',
    endDate: '',
    trainer: '',
    participantsCount: 0,
    status: 'Draft',
    category: 'Company Orientation',
    location: '',
    avgScore: 8.5,
    remarks: ''
  });

  useEffect(() => {
    if (record) {
      setFormData(record);
    } else {
      setFormData({
        id: '',
        batchName: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        trainer: 'คุณลลิตา (HR Executive)',
        participantsCount: 5,
        status: 'Scheduled',
        category: 'Company Orientation',
        location: 'ห้องประชุมชั้น 2',
        avgScore: 0,
        remarks: ''
      });
    }
  }, [record, isOpen]);

  return (
    <DraggableModal isOpen={isOpen} onClose={onClose} title={record ? "แก้ไขข้อมูลสัมมนานนท์อิมเพรส" : "เพื่มบันทึกหลักสูตรอบรมใหม่"}>
      <div className="p-6 space-y-4 max-w-lg font-sans">
        
        <div>
          <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">ชื่อหลักสูตรอบรม / รหัสรุ่น</label>
          <input 
            type="text"
            value={formData.batchName}
            onChange={e => setFormData({ ...formData, batchName: e.target.value })}
            className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#709654]"
            placeholder="เช่น อบรมพนักงานใหม่ ประจำเดือนมิถุนายน"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">หมวดหมู่หลักสูตร</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2 text-[12px] font-bold text-[#212c46] outline-none"
            >
              <option value="Company Orientation">Company Orientation</option>
              <option value="IT & Cybersecurity">IT & Cybersecurity</option>
              <option value="HR Policy & Welfare">HR Policy & Welfare</option>
              <option value="Department OJT">Department OJT</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">ระดับสถานะรอบ</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2 text-[12px] font-bold text-[#212c46] outline-none"
            >
              <option value="Draft">Draft</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">วิทยากรวิชาการ (Trainer)</label>
            <input 
              type="text"
              value={formData.trainer}
              onChange={e => setFormData({ ...formData, trainer: e.target.value })}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-bold text-[#212c46] outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">พนักงานผู้เข้าเรียน (ท่าน)</label>
            <input 
              type="number"
              value={formData.participantsCount}
              onChange={e => setFormData({ ...formData, participantsCount: Number(e.target.value) })}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-bold text-[#212c46] outline-none font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">วันเริ่มโครงการ</label>
            <input 
              type="date"
              value={formData.startDate}
              onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-mono font-bold text-[#212c46]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">วันสิ้นสุดโครงการ</label>
            <input 
              type="date"
              value={formData.endDate}
              onChange={e => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-mono font-bold text-[#212c46]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">สถานที่จัดการสอน / ช่องทางออนไลน์</label>
          <input 
            type="text"
            value={formData.location}
            onChange={e => setFormData({ ...formData, location: e.target.value })}
            className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-bold text-[#212c46] outline-none"
            placeholder="เช่น ห้องสัมนาเกีรยติยศ / ผ่าน MS Teams ออนไลน์"
          />
        </div>

        {formData.status === 'Completed' && (
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">คะแนนประเมินเฉลี่ยสะสม (0 to 10 Scale)</label>
            <div className="flex items-center gap-3">
              <input 
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={formData.avgScore ?? 8}
                onChange={e => setFormData({ ...formData, avgScore: Number(e.target.value) })}
                className="w-full accent-[#709654] h-1.5 bg-gray-200 rounded-lg cursor-pointer"
              />
              <span className="text-[14px] font-mono font-black text-[#212c46] min-w-[50px] text-right">{(formData.avgScore ?? 8).toFixed(1)}/10</span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">บันทึกเพิ่มเติมผู้จัด (Session Comments / Findings)</label>
          <textarea 
            rows={2}
            value={formData.remarks}
            onChange={e => setFormData({ ...formData, remarks: e.target.value })}
            placeholder="ข้อมูลสังเกตพฤติกรรมภาพรวมพนักงานใหม่..."
            className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#709654] resize-none"
          />
        </div>

        {/* Modal Submit Actions */}
        <div className="pt-4 flex justify-end gap-2.5 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white border border-[#eaeaec] text-[#414757] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#d7d7d7]/20 transition-all cursor-pointer">Cancel</button>
          <button type="button" onClick={() => onSave(formData)} className="bg-[#212c46] text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md hover:bg-[#414757] transition-all flex items-center gap-2 cursor-pointer"><Icons.Save size={14}/> Save Batch Node</button>
        </div>

      </div>
    </DraggableModal>
  );
}

function EditBuddyModal({ isOpen, record, onClose, onSave }: any) {
  const [formData, setFormData] = useState<BuddyRelation>({
    id: '',
    employeeId: '',
    employeeName: '',
    dept: '',
    buddyName: '',
    buddyDept: '',
    status: 'Active',
    meetingCount: 0,
    score: 8.5,
    progress: 60
  });

  useEffect(() => {
    if (record) {
      setFormData({
        ...record,
        progress: record.progress ?? (record.status === 'Completed' ? 100 : record.status === 'Active' ? 60 : 0)
      });
    } else {
      setFormData({
        id: '',
        employeeId: 'EMP-2024-' + Math.floor(Math.random() * 900 + 100),
        employeeName: '',
        dept: 'Information Technology',
        buddyName: 'คุณชัยเดช (Senior Support)',
        buddyDept: 'Information Technology',
        status: 'Active',
        meetingCount: 1,
        score: 8.0,
        progress: 60
      });
    }
  }, [record, isOpen]);

  return (
    <DraggableModal isOpen={isOpen} onClose={onClose} title={record ? "แก้ไขข้อมูลบัดดี้" : "จัดคู่บัดดี้ / พี่เลี้ยงใหม่"}>
      <div className="p-6 space-y-4 max-w-lg font-sans">
        
        <div>
          <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">ชื่อพนักงานใหม่ (New Employee Target)</label>
          <input 
            type="text"
            value={formData.employeeName}
            onChange={e => setFormData({ ...formData, employeeName: e.target.value })}
            className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#709654]"
            placeholder="เช่น ศรศักดิ์ ใจกล้า"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">รหัสพนักงานใหม่</label>
            <input 
              type="text"
              value={formData.employeeId}
              onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-mono font-bold text-[#212c46]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">สังกัดแผนกงาน</label>
            <input 
              type="text"
              value={formData.dept}
              onChange={e => setFormData({ ...formData, dept: e.target.value })}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-bold text-[#212c46]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">ชื่อพี่เลี้ยงร่วมงาน (Assigned Buddy)</label>
          <input 
            type="text"
            value={formData.buddyName}
            onChange={e => setFormData({ ...formData, buddyName: e.target.value })}
            className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-bold text-[#212c46] outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">แผนกของพี่เลี้ยง</label>
            <input 
              type="text"
              value={formData.buddyDept}
              onChange={e => setFormData({ ...formData, buddyDept: e.target.value })}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-bold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">สถานะความสัมพันธ์</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2 text-[12px] font-bold text-[#212c46]"
            >
              <option value="Pending">Pending Pair</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">จำนวนครั้งคุยสอนร่วม (Meetings)</label>
            <input 
              type="number"
              value={formData.meetingCount}
              onChange={e => setFormData({ ...formData, meetingCount: Number(e.target.value) })}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-mono font-bold text-[#212c46]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">คะแนนประเมินพี่เลี้ยง (Score)</label>
            <input 
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={formData.score ?? 8}
              onChange={e => setFormData({ ...formData, score: Number(e.target.value) })}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-mono font-bold text-[#212c46]"
              disabled={formData.status !== 'Completed'}
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">ความคืบหน้าการศึกษา (% Progress Bar)</label>
          <div className="flex items-center gap-3">
            <input 
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.progress ?? 0}
              onChange={e => {
                const val = Number(e.target.value);
                let newStatus = formData.status;
                if (val === 100) newStatus = 'Completed';
                else if (val === 0) newStatus = 'Pending';
                else if (formData.status === 'Completed' || formData.status === 'Pending') newStatus = 'Active';
                
                setFormData({ 
                  ...formData, 
                  progress: val,
                  status: newStatus 
                });
              }}
              className="w-full accent-[#709654] h-1.5 bg-gray-200 rounded-lg cursor-pointer"
            />
            <span className="text-[14px] font-mono font-black text-[#212c46] min-w-[50px] text-right">{(formData.progress ?? 0)}%</span>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-2.5 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white border border-[#eaeaec] text-[#414757] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#d7d7d7]/20 transition-all cursor-pointer">Cancel</button>
          <button type="button" onClick={() => onSave(formData)} className="bg-[#212c46] text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md hover:bg-[#414757] transition-all flex items-center gap-2 cursor-pointer"><Icons.Save size={14}/> Save Pair Mapping</button>
        </div>

      </div>
    </DraggableModal>
  );
}

function EditConfigModal({ isOpen, onClose, initialData, onSave }: any) {
  const [passingThreshold, setPassingThreshold] = useState(initialData.passingThreshold);
  const [buddyMatchCap, setBuddyMatchCap] = useState(initialData.buddyMatchCap);
  const [mediaNodeIsolation, setMediaNodeIsolation] = useState(initialData.mediaNodeIsolation);

  useEffect(() => {
    if (isOpen) {
      setPassingThreshold(initialData.passingThreshold);
      setBuddyMatchCap(initialData.buddyMatchCap);
      setMediaNodeIsolation(initialData.mediaNodeIsolation);
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      passingThreshold,
      buddyMatchCap,
      mediaNodeIsolation
    });
    onClose();
  };

  return (
    <DraggableModal isOpen={isOpen} onClose={onClose} title="แก้ไขการตั้งค่ามาตรฐานกฎการอบรม (Training Configuration)">
      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-w-md font-sans">
        <p className="text-[11.5px] text-[#7a8b95] leading-relaxed">
          ปรับประเด็นการประเมิน กฎเกณฑ์ และสิทธิเข้าถึงของคู่สื่อและเซสชัน เพื่อใช้สอดคล้องกับระเบียบฝ่ายทรัพยากรบุคคล
        </p>

        <div>
          <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">
            อบรมผ่านเกณฑ์ขั้นต่ำ (% Passing Threshold)
          </label>
          <select
            value={passingThreshold}
            onChange={e => setPassingThreshold(e.target.value)}
            className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2.5 text-[12px] font-bold text-[#212c46] outline-none cursor-pointer"
          >
            <option value="60.0%">60.0% (Relaxed Rule)</option>
            <option value="70.0%">70.0% (Intermediate Rule)</option>
            <option value="80.0%">80.0% (Recommended Standard)</option>
            <option value="85.0%">85.0% (Strict Rule)</option>
            <option value="90.0%">90.0% (Professional Level)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">
            อัตราพี่เลี้ยงประกบพนักงานใหม่ (Buddy Match Cap)
          </label>
          <input
            type="text"
            value={buddyMatchCap}
            onChange={e => setBuddyMatchCap(e.target.value)}
            className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#709654]"
            placeholder="เช่น 1 Buddy : 2 Staff"
          />
        </div>

        <div>
          <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">
            ระบบความปลอดภัยภาพรวม (Media Node Isolation)
          </label>
          <select
            value={mediaNodeIsolation}
            onChange={e => setMediaNodeIsolation(e.target.value)}
            className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2.5 text-[12px] font-bold text-[#212c46] outline-none cursor-pointer"
          >
            <option value="Isolated SSL">Isolated SSL</option>
            <option value="Regular Crypt">Regular Crypt</option>
            <option value="Local Sandbox">Local Sandbox</option>
          </select>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-[#414757] font-bold rounded-lg uppercase text-[10.5px] hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-[#212c46] hover:bg-[#709654] text-white px-6 py-2 rounded-lg font-black text-[10.5px] uppercase tracking-widest shadow-md transition-all cursor-pointer flex items-center gap-1"
          >
            <Icons.Save size={13}/> Save Rules
          </button>
        </div>
      </form>
    </DraggableModal>
  );
}
