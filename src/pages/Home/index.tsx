import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, Users, ShoppingCart, TrendingDown, Target, Truck, BarChart2, Settings, Menu, ChevronRight, ChevronLeft, ChevronDown, AlertCircle, Building2, Clock, PackageCheck, PhoneCall, Mail, Calendar, Library, DollarSign, PieChart, Award, Globe, Bell, Sparkles, Factory, CheckCircle2, FileText, ClipboardList, ShieldCheck, LogOut, Container, Database, FileSearch, Scale, Shield, CreditCard, Zap, Handshake, Filter, Megaphone,
  Briefcase, TrendingUp, MessageSquare, Percent, UserPlus, PartyPopper, Send, CheckSquare, GraduationCap, Info, User, AlertTriangle, Activity, Plus, BrainCircuit, Heart, CalendarDays, Banknote, Network, Cake, Gift, ChevronUp, Eye, EyeOff, SlidersHorizontal, Check, RotateCcw, Compass, ArrowLeftRight, ShieldAlert} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dbSync } from '../../services/dbSync';
import { DraggableModal } from '../../components/shared/DraggableModal';
import { useLanguage } from '../../context/LanguageContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
const MySwal = withReactContent(Swal);
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';

// --- Theme Configuration (Vibrant Palette) ---
const THEME = {
    bgMain: '#f3f3f1',
    bgGradient: 'linear-gradient(135deg, #f3f3f1 0%, #f3f3f1 100%)',
    sidebarBg: 'linear-gradient(180deg, #1d2636 0%, #0F172A 100%)',
    glassWhite: 'rgba(255, 255, 255, 0.88)',
    primary: '#212c46',
    primaryLight: '#4d87a8',
    accent: '#a94228',
    gold: '#b58c4f',
    brightGold: '#b7a159',
    success: '#657f4d',
    danger: '#932c2e',
    warning: '#a94228',
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
    coolGray: '#f3f3f1',
    c1: '#b22026',
    c2: '#932c2e',
    c3: '#851c24',
    c4: '#a94228',
    c5: '#d96245',
    c6: '#b58c4f',
    c7: '#b7a159',
    c8: '#8e9141',
    c9: '#5f7ab7',
    c10: '#bceadf',
    c11: '#f91a47',
    c12: '#fdda04',
    c13: '#e7dedd',
    c14: '#a74353',
    c15: '#c3924c',
    c16: '#ffa64a',
    c17: '#e8cec2',
    c18: '#f46e61',
    c19: '#972956',
    c20: '#9293c3',
    c21: '#ca649f',
    c22: '#dba1c2',
    c23: '#214573',
    c24: '#091d38',
};

// --- System Modules Data ---

const MOCK_STATS = [
    { label: 'Total Employees', value: '1,450', sub: '+12 New Hires (YTD)', icon: Users, color: THEME.c11 },
    { label: 'Open Positions', value: '24', sub: 'Urgent: 5 roles', icon: Briefcase, color: THEME.c2 },
    { label: 'Retention Rate', value: '96.2%', sub: 'Target: 95%', icon: ShieldCheck, color: THEME.c16 },
    { label: 'Pending Leaves', value: '18', sub: 'Requires action', icon: Calendar, color: THEME.c21 },
];

const GlassCard = ({ children, className = '', hoverEffect = true, style = {} }: any) => (
    <div className={`rounded-2xl p-4 backdrop-blur-xl shadow-[0_8px_30px_rgba(31,42,68,0.06)] border border-white/60 ${hoverEffect ? 'hover:-translate-y-1 transition-transform duration-300' : ''} ${className}`}
        style={{ backgroundColor: THEME.glassWhite, ...style }}>
        {children}
    </div>
);

const HeroBanner = () => {
    const bgImage = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000";
    return (
      <div className="relative w-full rounded-2xl overflow-hidden shadow-xl group bg-[#212c46] border border-[#414757] font-exception-hero">
        <div className="absolute inset-0 transform transition-transform duration-[2000ms] group-hover:scale-105">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-60"
            style={{ backgroundImage: `url(${bgImage})`, backgroundPosition: 'center 35%' }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#212c46]/95 via-[#212c46]/70 to-transparent" />
        <div className="relative z-10 h-full flex flex-col md:flex-row items-center justify-between p-4 md:p-6 w-full gap-6">
          <div className="flex flex-col justify-center flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Users size={12} className="text-[#b7a159]" />
              <span className="text-[9px] text-[#b7a159] font-black uppercase tracking-[0.2em] drop-shadow-sm">People Operations</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none mb-3 drop-shadow-md">
              Empowering <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b58c4f] to-[#f3e5ab]">Strategic Talent</span>
            </h2>
            <div className="mb-6">
              <p className="text-white/90 text-xs font-medium leading-relaxed max-w-2xl">
                "เชื่อมโยงเป้าหมายองค์กร เข้ากับศักยภาพของบุคลากร เพื่อการเติบโตอย่างยั่งยืน" <br/><span className="text-[#b7a159] font-bold">SMART HR Management</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <button className="bg-[#b58c4f] hover:bg-[#8e9141] border border-[#b7a159]/30 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-2 shadow-lg hover:shadow-[0_0_15px_rgba(181,140,79,0.5)]">
                <Building2 size={12} /> Org Chart
              </button>
              <div className="bg-white/5 border border-white/10 px-4 py-2 text-center rounded-xl flex items-center gap-2 shadow-inner backdrop-blur-md">
                <ShieldCheck size={14} className="text-[#657f4d]" />
                <span className="text-white font-black tracking-tighter text-sm">ISO 9001</span>
                <span className="text-[8px] text-white/50 font-bold uppercase tracking-widest leading-none mt-0.5">Compliant</span>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <a 
              href="/copilot"
              className="bg-gradient-to-br from-[#1d2636] to-[#2d2c4a] border border-[#b7a159]/40 p-1 rounded-2xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(181,140,79,0.3)] hover:-translate-y-1 transition-all group/ai"
            >
              <div className="bg-[#1d2636] border border-white/10 rounded-xl px-8 py-5 flex flex-col items-center gap-2">
                <div className="relative">
                   <div className="absolute inset-0 bg-[#b7a159]/20 blur-xl rounded-full scale-150 animate-pulse" />
                   <BrainCircuit size={40} className="text-[#b7a159] relative z-10 group-hover/ai:scale-110 transition-transform duration-500" />
                </div>
                <span className="text-[#b7a159] text-[13px] font-black uppercase tracking-[0.2em] mt-1">HR COPILOT</span>
                <span className="text-[8px] text-white/40 font-bold tracking-[0.4em]">SMART ASSISTANT</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    );
};

const CorporateAnnouncementsCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const announcements = [
        { id: 1, type: "COMPANY UPDATE", issue: "Q1 Townhall Summary", subject: "Review the key takeaways and targets from our recent townhall.", date: "12 May 2026", isNew: true, image: "https://images.unsplash.com/photo-1542382156909-923bea7b0a72?q=80&w=500" },
        { id: 2, type: "HR ANNOUNCEMENT", issue: "New Hybrid Work Policy", subject: "Review the updated guidelines for remote working and flexible hours.", date: "14 May 2026", isNew: true, image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=500" },
        { id: 3, type: "EVENT", issue: "Annual Team Building", subject: "Join us for our annual retreat. Details and registration inside.", date: "20 May 2026", isNew: false, image: "https://images.unsplash.com/photo-1511632765486-a01c80cf59af?q=80&w=500" },
        { id: 4, type: "TRAINING", issue: "Leadership Workshop", subject: "Mandatory training for all mid-level managers next month.", date: "02 Jun 2026", isNew: false, image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=500" },
        { id: 5, type: "WELLNESS", issue: "Health Checkup Camp", subject: "Annual free health checkup for employees and dependents.", date: "15 Jun 2026", isNew: false, image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=500" },
        { id: 6, type: "IT UPDATE", issue: "New HR System Portal", subject: "We are migrating to a new performance tracking system. Read more.", date: "01 Jul 2026", isNew: false, image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=500" },
    ];

    const nextSlide = () => setCurrentIndex((prev) => (prev === announcements.length - 1 ? 0 : prev + 1));
    const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? announcements.length - 1 : prev - 1));

    // Show up to 4 items on large screens
    const visibleAnnouncements = [];
    for (let i = 0; i < 4; i++) {
        visibleAnnouncements.push(announcements[(currentIndex + i) % announcements.length]);
    }

    return (
        <div className="w-full bg-[#f6f5f3] py-5 rounded-2xl relative overflow-hidden shadow-inner border border-[#e5e5e5]">
            <div className="flex items-center absolute top-1/2 -translate-y-1/2 left-2 z-20">
                <button onClick={prevSlide} className="bg-gray-600/80 hover:bg-gray-800 text-white p-2 rounded shadow-lg backdrop-blur transition-colors">
                    <ChevronLeft size={24} />
                </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 px-14">
                {visibleAnnouncements.map((ann, idx) => (
                    <div key={`${ann.id}-${idx}`} className="bg-white rounded-xl overflow-hidden shadow-sm flex flex-col relative h-[145px] border border-gray-100 group transition-all hover:shadow-md justify-between  flex-1 min-h-0">
                        {ann.isNew && (
                            <div className="absolute -left-10 top-5 bg-[#a73527] text-white font-black px-11 py-1 -rotate-45 z-20 shadow-md text-[11px] tracking-wider">
                                NEW
                            </div>
                        )}
                        
                        <div className="p-2 pt-3 text-center z-10 relative">
                            <h3 className="font-extrabold text-[#3a4454] leading-tight text-[12px] drop-shadow-sm">{ann.type}</h3>
                            <h4 className="font-bold text-[#56657a] text-[10px] mt-0.5">{ann.issue}</h4>
                            <h2 className="font-black text-[#1e4e6d] text-[13px] mt-2 drop-shadow-sm leading-tight line-clamp-2">{ann.subject}</h2>
                        </div>
                        
                        <div className="bg-[#364b5e] text-white py-1.5 px-2 mx-2 mb-2 rounded-lg text-center flex items-center justify-center gap-1 z-10 shadow-sm relative shrink-0">
                            <span className="text-[9px] font-medium tracking-wide">Date</span>
                            <span className="flex items-center gap-0.5 mx-1 text-white/50"><span className="w-0.5 h-0.5 bg-white/50 rounded-full"></span><span className="w-1 h-1 bg-white/80 rounded-full"></span></span>
                            <span className="text-[10px] font-black tracking-wide">{ann.date}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center absolute top-1/2 -translate-y-1/2 right-2 z-20">
                <button onClick={nextSlide} className="bg-gray-600/80 hover:bg-gray-800 text-white p-2 rounded shadow-lg backdrop-blur transition-colors">
                    <ChevronRight size={24} />
                </button>
            </div>

            <div className="flex justify-center items-center gap-2 mt-4">
                {announcements.map((_, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentIndex ? 'bg-[#1e4e6d] ring-2 ring-[#1e4e6d]/30 ring-offset-2' : 'bg-gray-400 hover:bg-gray-500'}`}
                    />
                ))}
            </div>
        </div>
    );
};

const MetricCard = ({ label, val, unit, icon: Icon, color, desc }: any) => (
  <div className="bg-white/90 rounded-2xl p-4 shadow-sm border border-[#f3f3f1] relative overflow-hidden group h-full transition-all hover:shadow-md">
    <div className="absolute -right-6 -bottom-6 opacity-[0.1] transform rotate-12 group-hover:scale-110 transition-all duration-700 pointer-events-none z-0">
        <Icon size={100} style={{color: color}} />
    </div>
    <div className="relative z-10 flex justify-between items-start">
        <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[#7a8b95] uppercase tracking-wider opacity-90 truncate">{label}</p>
            <h4 className="text-2xl font-black tracking-tight mt-0.5" style={{color: THEME.primary}}>{val}</h4>
            {desc && (
                <p className="text-[10px] text-[#7a8b95] font-bold mt-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: color}}></span>
                    {desc}
                </p>
            )}
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white backdrop-blur-md shadow-sm" 
            style={{backgroundColor: color + '15'}}>
            <Icon size={18} style={{color: color}} />
        </div>
    </div>
  </div>
);

const SalesChartArea = () => {
  const data = [
    { name: "Quality Manuals", target: 60, actual: 64, color: THEME.c2 },
    { name: "Procedures", target: 25, actual: 20, color: THEME.c11 },
    { name: "Work Instructions", target: 15, actual: 16, color: THEME.c16 },
  ];
  return (
    <GlassCard className="lg:col-span-2 bg-gradient-to-br from-white to-[#f3f3f1] border-[#f3f3f1]">
      <div className="flex justify-between items-center mb-4 relative z-10">
        <h2 className="text-base font-black text-[#212c46] flex items-center gap-2 uppercase tracking-tight">
            <BarChart2 size={16} className="text-[#932c2e]" /> Document Distribution
        </h2>
        <span className="text-[8px] text-white font-black bg-[#3f809e] px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">Real-time</span>
      </div>
      <div className="space-y-4 relative z-10">
        {data.map((item, i) => (
            <div key={i} className="flex items-center gap-4 group/bar">
              <div className="w-28 text-[9px] font-black text-[#435665] uppercase truncate tracking-tight">{item.name}</div>
              <div className="flex-1 h-4 rounded-lg relative flex items-center bg-[#f3f3f1]/40 shadow-inner overflow-hidden">
                <div className="h-full transition-all duration-1000 relative z-10 rounded-lg"
                  style={{ width: `${item.actual}%`, background: `linear-gradient(90deg, ${item.color}, ${item.color}dd)` }} />
              </div>
              <div className="w-10 text-right">
                <span className="text-[10px] font-black text-[#212c46]">{item.actual}%</span>
              </div>
            </div>
        ))}
      </div>
    </GlassCard>
  );
};

const UrgentTasks = () => (
  <GlassCard className="bg-gradient-to-b from-white to-[#f3f3f1]/20 border-[#7a8b95]/30">
    <div className="flex justify-between items-center mb-4 relative z-10">
      <h2 className="text-base font-black text-[#212c46] flex items-center gap-2 uppercase tracking-tight">
          <AlertCircle size={16} className="text-[#932c2e]" /> Critical Action
      </h2>
      <span className="text-[8px] font-black bg-[#932c2e]/10 text-[#932c2e] px-3 py-1 rounded-full uppercase tracking-widest">3 Tasks</span>
    </div>
    <div className="space-y-2.5 relative z-10">
        {[
          { title: "Approve Quality Manual - ISO9001", type: "Document Approval", icon: ShoppingCart, urgent: true, color: 'text-[#932c2e]', bg: 'bg-[#932c2e]/10' },
          { title: "Review Audit Report - Q1", type: "Audit Review", icon: Target, urgent: true, color: 'text-[#d96245]', bg: 'bg-[#d96245]/10' },
          { title: "Review Q3 Management Cycle", type: "Management Review", icon: Megaphone, urgent: false, color: 'text-[#3f809e]', bg: 'bg-[#3f809e]/10' },
        ].map((task, i) => (
          <div key={i} className="p-3 bg-white/70 rounded-xl border border-[#f3f3f1]/30 flex gap-3 items-start hover:bg-white transition-all shadow-sm">
            <div className={`p-2 rounded-lg ${task.bg} ${task.color} shrink-0`}>
                <task.icon size={12}/>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-[#1f2a44] tracking-tight truncate">{task.title}</p>
                <div className="flex justify-between items-center mt-1">
                    <p className="text-[8px] text-[#7a8b95] font-bold uppercase">{task.type}</p>
                    {task.urgent && <span className="text-[7px] font-black text-[#a94228] uppercase animate-pulse">Critical</span>}
                </div>
            </div>
          </div>
        ))}
    </div>
    <button className="w-full mt-4 py-3 bg-[#1f2a44] text-white text-[9px] font-bold uppercase rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 tracking-widest hover:bg-[#254268]">
        <Calendar size={12} /> Schedule
    </button>
  </GlassCard>
);

const NewFamilyMembers = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const defaultMembers = [
      { name: 'พิมพพรรณ สวยงาม', role: 'UX/UI DESIGNER', dept: 'Innovation', joinDate: '01 Jan', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop' },
      { name: 'ธนวัฒน์ มาดี', role: 'FULLSTACK DEV', dept: 'Digital Tech', joinDate: '02 Jan', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop' },
      { name: 'เกริกพล ขยันงาน', role: 'HR SPECIALIST', dept: 'People', joinDate: '05 Jan', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop' },
    ];

    useEffect(() => {
        const loadSyncedMembers = async () => {
            try {
                const res = await dbSync.read('candidates');
                if (res && res.status === 'success' && res.data && Array.isArray(res.data.items)) {
                    const hiredCandidates = res.data.items.filter((c: any) => c.stage === 'Hired');
                    if (hiredCandidates.length > 0) {
                        const mapped = hiredCandidates.map((c: any) => {
                            // Format join date nicely, e.g., '2026-06-01' -> '01 Jun'
                            let formattedDate = 'TBD';
                            if (c.joinDate) {
                                try {
                                    const dateParts = c.joinDate.split('-');
                                    if (dateParts.length === 3) {
                                        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                        const day = dateParts[2];
                                        const monthIndex = parseInt(dateParts[1], 10) - 1;
                                        if (monthIndex >= 0 && monthIndex < 12) {
                                            formattedDate = `${day} ${months[monthIndex]}`;
                                        }
                                    } else {
                                        formattedDate = c.joinDate;
                                    }
                                } catch (_) {
                                    formattedDate = c.joinDate;
                                }
                            }
                            return {
                                name: c.name,
                                role: c.position ? c.position.toUpperCase() : 'CO-WORKER',
                                dept: c.department,
                                joinDate: formattedDate,
                                img: c.img || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250'
                            };
                        });
                        setMembers(mapped);
                    } else {
                        setMembers(defaultMembers);
                    }
                } else {
                    setMembers(defaultMembers);
                }
            } catch (err) {
                console.error("Failed to load synced family members on home dashboard:", err);
                setMembers(defaultMembers);
            } finally {
                setLoading(false);
            }
        };

        loadSyncedMembers();
    }, []);

    const openWelcome = (m: any) => {
      setSelectedMember(m);
      setIsModalOpen(true);
    };

    return (
      <>
      <GlassCard className="bg-white border-[#f3f3f1] col-span-1 lg:col-span-2 relative overflow-hidden">
        <div className="absolute right-[-5%] top-[-10%] opacity-[0.03] pointer-events-none transform rotate-12 z-0">
          <Users size={240} />
        </div>
        <div className="flex justify-between items-center mb-6 relative z-10">
           <h2 className="text-sm font-black text-[#212c46] flex items-center gap-2 uppercase tracking-wide">
             <UserPlus size={16} className="text-[#3f809e]" /> OUR NEW FAMILY MEMBERS
           </h2>
           <span className="text-[9px] font-black text-[#3f809e] bg-[#3f809e]/10 px-3 py-1.5 rounded-full uppercase tracking-widest border border-[#3f809e]/20 hover:bg-[#3f809e] hover:text-white transition-colors cursor-pointer">WELCOME HOME</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          {members.map((m, i) => (
            <div key={i} onClick={() => openWelcome(m)} className="bg-white rounded-2xl border border-[#f3f3f1]/30 hover:border-[#3f809e]/60 p-5 flex flex-col items-center relative shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group">
              <div className="relative mb-4">
                <img src={m.img} alt={m.name} className="w-16 h-16 rounded-2xl object-cover shadow-md" />
                <div className="absolute -bottom-2 -right-2 bg-[#4d87a8] p-1.5 rounded-lg text-white shadow-sm border-2 border-white group-hover:scale-110 transition-transform">
                  <Sparkles size={12} />
                </div>
              </div>
              <h3 className="text-[#212c46] font-bold text-sm mb-1">{m.name}</h3>
              <p className="text-[#4d87a8] text-[9px] font-black uppercase tracking-widest">{m.role}</p>
              <p className="text-[#7a8b95] text-[10px] font-medium mt-0.5">{m.dept}</p>
              <div className="w-full h-px bg-[#f3f3f1] my-4" />
              <div className="w-full flex justify-between items-center text-[10px] font-black text-[#7a8b95] uppercase tracking-wider">
                <span>JOIN</span>
                <span className="text-[#212c46]">{m.joinDate}</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <DraggableModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={<span className="text-sm font-black uppercase text-[#022d41] tracking-widest flex items-center gap-2"><Sparkles size={16} className="text-[#b58c4f]"/> Welcome to the Team</span>}
        width="max-w-md"
      >
        <div className="p-6">
          {selectedMember && (
             <div className="text-center mb-6">
               <img src={selectedMember.img} alt={selectedMember.name} className="w-24 h-24 rounded-full object-cover border-4 border-[#3f809e]/20 shadow-md mx-auto mb-4" />
               <h3 className="text-xl font-black text-[#212c46] mb-1">{selectedMember.name}</h3>
               <p className="text-[#4d87a8] text-xs font-black uppercase tracking-widest mb-1">{selectedMember.role}</p>
               <p className="text-[#7a8b95] text-xs font-medium">{selectedMember.dept}</p>
             </div>
          )}
          
          <div className="mb-6 shrink-0">
            <label className="block text-[10px] font-black text-[#212c46] uppercase tracking-widest mb-2 text-center">Say Hello & Welcome</label>
            <div className="relative">
              <textarea 
                className="w-full h-24 p-3 pr-12 border border-[#cdd0db] rounded-xl text-sm focus:border-[#4d87a8] focus:ring-1 focus:ring-[#4d87a8] outline-none transition-all resize-none bg-[#f3f3f1]/50 font-medium shadow-inner"
                placeholder="Type a welcome message..."
              ></textarea>
              <button className="absolute bottom-3 right-3 w-8 h-8 bg-[#4d87a8] hover:bg-[#3f809e] text-white rounded-lg flex items-center justify-center transition-colors shadow-md">
                <Send size={14} />
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
             <h4 className="text-[10px] font-black text-[#7a8b95] uppercase tracking-widest mb-3 border-b border-[#f3f3f1] pb-2">Recent Greetings (3)</h4>
             <div className="space-y-3">
                <div className="bg-white p-3 rounded-xl border border-[#f3f3f1] shadow-sm relative">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="text-xs font-bold text-[#212c46]">วิชัย สุขใจ</span>
                     <span className="text-[9px] text-[#7a8b95] ml-auto">10 mins ago</span>
                  </div>
                  <p className="text-xs text-[#4a5568] leading-relaxed">Welcome to the team! Glad to have you here.</p>
                </div>
                <div className="bg-[#f0f7fa] p-3 rounded-xl border border-[#bce0f0] shadow-sm relative">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="text-xs font-bold text-[#212c46]">LAW Team</span>
                     <span className="text-[9px] text-[#7a8b95] ml-auto">20 mins ago</span>
                  </div>
                  <p className="text-xs text-[#4a5568] leading-relaxed">We are excited to see your impact in our company!</p>
                </div>
             </div>
          </div>
        </div>
      </DraggableModal>
      </>
    );
};

const UpcomingBirthdaysAndAnniversaries = () => {
    const [employees, setEmployees] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpcomingModalOpen, setIsUpcomingModalOpen] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState<any>(null);
    const [newWish, setNewWish] = useState('');
    const [wishes, setWishes] = useState<{ [employeeId: string]: any[] }>({});
    const { t } = useLanguage();

    useEffect(() => {
        const loadEmployees = async () => {
            try {
                setIsLoading(true);
                const res = await dbSync.read('employees');
                if (res && res.status === 'success' && res.data && Array.isArray(res.data.items)) {
                    setEmployees(res.data.items);
                }
            } catch (err) {
                console.error("Failed to load employees for birthdays/anniversaries widget:", err);
            } finally {
                setIsLoading(false);
            }
        };

        try {
            const stored = localStorage.getItem('employee_congratulations_feed');
            if (stored) {
                setWishes(JSON.parse(stored));
            } else {
                const initialWishes = {
                    'U001': [
                        { id: 'w1', author: 'วิชัย สุขใจ (Wichai Sukjai)', text: 'สุขสันต์วันเกิดครับพี่สมชาย มีความสุขมากๆ ร่างกายแข็งแรงครับ! 🎂🎉', time: '10 mins ago', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150' },
                        { id: 'w2', author: 'สิรินทรา มีสุข (Sirintra Meesook)', text: 'Happy Birthday to our best manager! 🎁🥳', time: '2 hrs ago', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150' }
                    ],
                    'U003': [
                        { id: 'w3', author: 'นภาลัย เรืองรอง (Napalai Ruangrong)', text: 'ยินดีด้วยกับการทำงานครบรอบ 8 ปีค่ะ! เป็นเสาหลักของทีม IT เสมอมา 👍', time: '1 hr ago', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150' }
                    ]
                };
                setWishes(initialWishes);
                localStorage.setItem('employee_congratulations_feed', JSON.stringify(initialWishes));
            }
        } catch (e) {
            console.error(e);
        }

        loadEmployees();
    }, []);

    const getMonthName = (m: number) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[m - 1] || '';
    };

    // Calculate birthdays for today and yesterday ONLY
    const celebrations = useMemo(() => {
        const list: any[] = [];
        const testDate = new Date(); // Using actual current system date!
        
        employees.forEach(emp => {
            if (emp.birthDate) {
                const parts = emp.birthDate.split('-');
                if (parts.length === 3) {
                    const month = parseInt(parts[1], 10);
                    const day = parseInt(parts[2], 10);
                    
                    const todayZero = new Date(testDate.getFullYear(), testDate.getMonth(), testDate.getDate());
                    const bdayZero = new Date(testDate.getFullYear(), month - 1, day);
                    const diffTime = bdayZero.getTime() - todayZero.getTime();
                    let diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                    
                    // Boundary safety for dates across wrapping years
                    if (diffDays < -180) {
                        bdayZero.setFullYear(testDate.getFullYear() + 1);
                        diffDays = Math.round((bdayZero.getTime() - todayZero.getTime()) / (1000 * 60 * 60 * 24));
                    } else if (diffDays > 180) {
                        bdayZero.setFullYear(testDate.getFullYear() - 1);
                        diffDays = Math.round((bdayZero.getTime() - todayZero.getTime()) / (1000 * 60 * 60 * 24));
                    }

                    // For the main "Birthday Wish" card: ONLY today (0) or yesterday (-1)
                    if (diffDays === 0 || diffDays === -1) {
                        list.push({
                            id: `bday-${emp.employeeId}`,
                            employeeId: emp.employeeId,
                            employee: emp,
                            type: 'birthday',
                            month,
                            day,
                            dateLabel: `${day} ${getMonthName(month)}`,
                            daysLeft: diffDays,
                            milestone: `Birthday (วันเกิด)`,
                            title: 'Birthday (วันเกิด)'
                        });
                    }
                }
            }
        });
        
        return list.sort((a, b) => b.daysLeft - a.daysLeft); // Today first, Yesterday second
    }, [employees]);

    // Calculate all celebrations for the next 30 days for the modal lookup
    const allUpcomingCelebrations = useMemo(() => {
        const list: any[] = [];
        const testDate = new Date();
        
        employees.forEach(emp => {
            // 1. Check Birthday
            if (emp.birthDate) {
                const parts = emp.birthDate.split('-');
                if (parts.length === 3) {
                    const month = parseInt(parts[1], 10);
                    const day = parseInt(parts[2], 10);
                    
                    const bdayThisYear = new Date(2026, month - 1, day);
                    const diffTime = bdayThisYear.getTime() - testDate.getTime();
                    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diffDays >= 0 && diffDays <= 30) {
                        list.push({
                            id: `bday-${emp.employeeId}`,
                            employeeId: emp.employeeId,
                            employee: emp,
                            type: 'birthday',
                            month,
                            day,
                            dateLabel: `${day} ${getMonthName(month)}`,
                            daysLeft: diffDays,
                            milestone: `Birthday (วันเกิด)`,
                            title: 'Birthday (วันเกิด)'
                        });
                    }
                }
            }
            
            // 2. Check Anniversary
            if (emp.hireDate) {
                const parts = emp.hireDate.split('-');
                if (parts.length === 3) {
                    const year = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10);
                    const day = parseInt(parts[2], 10);
                    
                    const annivThisYear = new Date(2026, month - 1, day);
                    const diffTime = annivThisYear.getTime() - testDate.getTime();
                    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diffDays >= 0 && diffDays <= 30) {
                        const tenures = 2026 - year;
                        if (tenures > 0) {
                            list.push({
                                id: `anniv-${emp.employeeId}`,
                                employeeId: emp.employeeId,
                                employee: emp,
                                type: 'anniversary',
                                month,
                                day,
                                dateLabel: `${day} ${getMonthName(month)}`,
                                daysLeft: diffDays,
                                milestone: `${tenures} Year Anniversary`,
                                title: 'Work Anniversary'
                            });
                        }
                    }
                }
            }
        });
        
        return list.sort((a, b) => a.daysLeft - b.daysLeft);
    }, [employees]);

    const openGreeting = (celebration: any) => {
        setSelectedPerson(celebration);
        setIsModalOpen(true);
    };

    const handlePostWish = () => {
        if (!newWish.trim() || !selectedPerson) return;
        
        const targetId = selectedPerson.employeeId;
        const comment = {
            id: 'wish_' + Date.now(),
            author: 'คุณ (You)',
            text: newWish,
            time: 'Just now',
            avatar: 'https://drive.google.com/thumbnail?id=1Z_fRbN9S4aA7OkHb3mlim_t60wIT4huY&sz=w400'
        };

        const updated = {
            ...wishes,
            [targetId]: [comment, ...(wishes[targetId] || [])]
        };

        setWishes(updated);
        localStorage.setItem('employee_congratulations_feed', JSON.stringify(updated));
        setNewWish('');
    };

    return (
        <>
        <GlassCard className="bg-white border-[#eaeaec] flex flex-col relative overflow-hidden">
            <div className="absolute right-[-10%] bottom-[-10%] opacity-[0.03] pointer-events-none transform -rotate-12 z-0">
                <PartyPopper size={200} />
            </div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-2">
                    <Cake size={20} className="text-[#932c2e]" />
                    <h2 className="text-sm font-black text-[#212c46] uppercase tracking-wide leading-tight">
                        Birthday Wish<br/>อวยพรวันเกิด
                    </h2>
                </div>
                <span className="text-[8px] font-black tracking-wider uppercase px-2.5 py-1 bg-[#b7a159]/15 text-[#b7a159] border border-[#b7a159]/30 rounded-full animate-pulse">
                    Today & Yesterday
                </span>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-[#7a8b95]">
                    <div className="w-6 h-6 border-2 border-[#b7a159] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[10px] font-black uppercase tracking-wider">Syncing Database...</span>
                </div>
            ) : celebrations.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-[#7a8b95] text-center border border-dashed border-[#eaeaec] rounded-xl bg-slate-50/50">
                    <Cake size={24} className="opacity-40 mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-wider">{t('No birthdays today or yesterday')}</span>
                    <p className="text-[8px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Tap button below to explore upcoming celebrations</p>
                </div>
            ) : (
                <div className="space-y-3 flex-1 relative z-10 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                    {celebrations.map((c) => {
                        let daysText = '';
                        let daysColor = '';
                        
                        if (c.daysLeft === 0) {
                            daysText = 'TODAY! 🥳';
                            daysColor = 'bg-emerald-50 text-emerald-600 border border-emerald-100 font-extrabold scale-105';
                        } else if (c.daysLeft === -1) {
                            daysText = 'YESTERDAY 🕒';
                            daysColor = 'bg-slate-55 text-slate-500 border border-slate-200';
                        }

                        const celebrationWishes = wishes[c.employeeId] || [];

                        return (
                            <div 
                                key={c.id} 
                                onClick={() => openGreeting(c)} 
                                className="flex items-center gap-3.5 bg-white border border-[#f3f3f1]/60 hover:border-[#b7a159]/60 rounded-2xl p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
                            >
                                <div className="relative">
                                    <img 
                                        src={c.employee.avatar} 
                                        alt={c.employee.name} 
                                        className="w-11 h-11 rounded-xl object-cover border border-white shadow-sm shadow-black/10 group-hover:scale-105 transition-transform" 
                                    />
                                    <div className="absolute -bottom-1 -right-1 bg-[#212c46] hover:bg-[#a94228] transition-colors p-1 rounded-md text-white border border-white">
                                        <Cake size={10} />
                                    </div>
                                </div>
                                
                                <div className="flex-1 min-w-0 text-left">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <h3 className="text-[#212c46] font-extrabold text-xs tracking-tight truncate max-w-[150px]">{c.employee.name.split(' (')[0]}</h3>
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${daysColor}`}>
                                            {daysText}
                                        </span>
                                    </div>
                                    <p className="text-[#7a8b95] text-[9px] font-bold mt-0.5">
                                        🎂 {c.employee.department} • {c.employee.position}
                                    </p>
                                    {celebrationWishes.length > 0 && (
                                        <span className="inline-flex items-center gap-1 text-[8px] font-extrabold text-[#3f809e] mt-1 bg-[#3f809e]/15 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                            💌 {celebrationWishes.length} greetings
                                        </span>
                                    )}
                                </div>
                                
                                <div className="text-[10px] font-black text-[#b58c4f] tracking-wider shrink-0 bg-[#fbfaf8] border border-dashed border-[#e8dfcf] px-2.5 py-1.5 rounded-xl text-center">
                                    <span className="block text-[8px] text-[#7a8b95] font-bold uppercase tracking-widest scale-90">DATE</span>
                                    {c.dateLabel}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            
            <button 
                onClick={() => setIsUpcomingModalOpen(true)} 
                className="mt-4 w-full bg-[#212c46] text-[#b58c4f] border border-[#212c46] hover:bg-[#254268] hover:text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2 shadow-md relative z-10 cursor-pointer"
            >
                <Cake size={13} strokeWidth={2.5} /> UPCOMING BIRTHDAYS & ANNIVERSARIES
            </button>
        </GlassCard>

        {/* Existing greeting Modal */}
        <DraggableModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)}
            title={
                <span className="text-sm font-black uppercase text-[#212c46] tracking-widest flex items-center gap-2">
                    <PartyPopper size={16} className="text-[#d96245]"/> {t('Celebrations Feed')}
                </span>
            }
            width="max-w-md"
        >
            <div className="p-6 max-h-[85vh] overflow-y-auto custom-scrollbar flex flex-col bg-[#fdfbf7] relative">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#fce9aa]/30 to-transparent z-0 pointer-events-none"></div>
                
                {selectedPerson && (
                    <div className="flex flex-col items-center gap-3 mb-6 relative z-10 pt-4 text-center">
                        <div className="relative font-sans">
                            <img 
                                src={selectedPerson.employee.avatar} 
                                alt={selectedPerson.employee.name} 
                                className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md cursor-default shadow-black/15" 
                            />
                            <div className="absolute -bottom-2 -right-2 bg-[#d96245] p-2 rounded-xl text-white shadow-md border-2 border-white">
                                {selectedPerson.type === 'birthday' ? <Cake size={16} /> : <Gift size={16} />}
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] text-[#b7a159] font-black uppercase tracking-[0.2em] mb-1">
                                {selectedPerson.type === 'birthday' ? 'HAPPY BIRTHDAY!' : 'HAPPY WORK ANNIVERSARY!'}
                            </p>
                            <h3 className="text-xl font-serif font-black text-[#212c46]">
                                {selectedPerson.employee.name}
                            </h3>
                            <p className="text-[11px] font-bold text-[#7a8b95] mt-1.5 bg-white/85 border border-[#eaeaec]/60 px-3 py-1 rounded-full inline-block">
                                {selectedPerson.employee.position} • {selectedPerson.employee.department}
                            </p>
                            <p className="text-[10px] text-[#d96245] font-black uppercase tracking-widest mt-2 font-mono">
                                {selectedPerson.milestone} • {selectedPerson.dateLabel}
                            </p>
                        </div>
                    </div>
                )}
                
                <div className="mb-6 shrink-0 relative z-10 text-left">
                    <label className="block text-[10px] font-black text-[#b58c4f] uppercase tracking-widest mb-2 text-center">Write a congratulatory message</label>
                    <div className="relative shadow-sm rounded-xl overflow-hidden border border-[#e8dcc4] bg-white">
                        <textarea 
                            value={newWish}
                            onChange={(e) => setNewWish(e.target.value)}
                            className="w-full h-24 p-3 pr-12 text-xs focus:outline-none resize-none font-medium placeholder:text-[#d3ccc0] font-sans"
                            placeholder="Type safe regulatory congratulations here..."
                        ></textarea>
                        <button 
                            onClick={handlePostWish}
                            className="absolute bottom-3 right-3 w-8 h-8 bg-gradient-to-r from-[#b58c4f] to-[#b7a159] text-white rounded-lg flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
                        >
                            <Send size={14} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col min-h-0 relative z-10">
                    <h4 className="text-[10px] font-black text-[#7a8b95] uppercase tracking-widest mb-4 text-center opacity-60">Congratulation Wishes Feed</h4>
                    <div className="space-y-3 custom-scrollbar overflow-y-auto max-h-[250px] pr-1">
                        {selectedPerson && wishes[selectedPerson.employeeId] && wishes[selectedPerson.employeeId].length > 0 ? (
                            wishes[selectedPerson.employeeId].map((wish) => (
                                <div key={wish.id} className="bg-white p-4 rounded-xl border border-[#f3f3f1] shadow-sm relative transition-all hover:border-[#bce0f0] text-left">
                                    <div className="flex items-center gap-3 mb-2">
                                        <img 
                                            src={wish.avatar || 'https://i.pravatar.cc/150'} 
                                            alt={wish.author} 
                                            className="w-8 h-8 rounded-full border border-[#f3f3f1] overflow-hidden shrink-0 object-cover" 
                                        />
                                        <div>
                                            <span className="block text-xs font-extrabold text-[#212c46]">{wish.author}</span>
                                            <span className="block text-[9px] text-[#7a8b95]">{wish.time}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-[#554e4c] leading-relaxed font-sans italic font-medium">"{wish.text}"</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 text-gray-400 border border-dashed border-[#eaeaec] rounded-xl bg-white/50">
                                <Cake size={20} className="mx-auto text-amber-500 opacity-40 mb-2 animate-bounce" />
                                <span className="text-[10px] uppercase font-black tracking-widest">No wishes posted yet</span>
                                <p className="text-[9px] text-slate-400 mt-1">Be the first to congratulate them!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DraggableModal>

        {/* New 30-day look ahead modal */}
        <DraggableModal 
            isOpen={isUpcomingModalOpen} 
            onClose={() => setIsUpcomingModalOpen(false)}
            title={
                <span className="text-sm font-black uppercase text-[#212c46] tracking-widest flex items-center gap-2">
                    <Cake size={16} className="text-[#d96245]"/> {t('Upcoming Birthdays & Anniversaries')}
                </span>
            }
            width="max-w-md"
        >
            <div className="p-6 max-h-[85vh] overflow-y-auto custom-scrollbar flex flex-col bg-white">
                <p className="text-[10px] text-[#748ea1] font-black uppercase tracking-widest mb-4">
                    Celebration list look-ahead (Next 30 days)
                </p>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2 text-[#7a8b95]">
                        <div className="w-6 h-6 border-2 border-[#b7a159] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[10px] font-black uppercase tracking-wider">Syncing Database...</span>
                    </div>
                ) : allUpcomingCelebrations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-[#7a8b95] text-center border border-dashed border-[#eaeaec] rounded-xl bg-slate-50/30">
                        <Cake size={24} className="opacity-40 mb-2" />
                        <span className="text-[10px] font-black uppercase tracking-wider">No Celebrations in Next 30 Days</span>
                    </div>
                ) : (
                    <div className="space-y-3 overflow-y-auto max-h-[400px] pr-1">
                        {allUpcomingCelebrations.map((c) => {
                            let daysText = '';
                            let daysColor = '';
                            
                            if (c.daysLeft === 0) {
                                daysText = 'TODAY! 🥳';
                                daysColor = 'bg-emerald-50 text-emerald-600 border border-emerald-100 font-extrabold scale-105';
                            } else if (c.daysLeft === 1) {
                                daysText = 'TOMORROW 🎁';
                                daysColor = 'bg-amber-50 text-amber-600 border border-amber-100';
                            } else {
                                daysText = `In ${c.daysLeft} days`;
                                daysColor = 'bg-[#3f809e]/10 text-[#3f809e] border border-[#3f809e]/20';
                            }

                            return (
                                <div 
                                    key={c.id} 
                                    onClick={() => {
                                        setIsUpcomingModalOpen(false);
                                        openGreeting(c);
                                    }} 
                                    className="flex items-center gap-3 bg-[#fdfbf7] hover:bg-[#b7a159]/5 border border-[#eaeaec]/60 hover:border-[#b7a159]/40 rounded-xl p-3 shadow-2xs hover:shadow-sm transition-all cursor-pointer group"
                                >
                                    <div className="relative">
                                        <img 
                                            src={c.employee.avatar} 
                                            alt={c.employee.name} 
                                            className="w-10 h-10 rounded-lg object-cover bg-slate-50" 
                                        />
                                        <div className="absolute -bottom-1 -right-1 bg-[#212c46] hover:bg-[#a94228] transition-colors p-1 rounded text-white border border-white">
                                            {c.type === 'birthday' ? <Cake size={8} /> : <Gift size={8} />}
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <h4 className="text-[#212c46] font-extrabold text-[11px] truncate">{c.employee.name.split(' (')[0]}</h4>
                                            <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider ${daysColor}`}>
                                                {daysText}
                                            </span>
                                        </div>
                                        <p className="text-[#7a8b95] text-[8.5px] font-bold mt-0.5">
                                            {c.type === 'birthday' ? '🎂 BD' : '💼 WA'} • {c.employee.department} • {c.milestone}
                                        </p>
                                    </div>
                                    
                                    <div className="text-[9px] font-black text-[#b7a159] tracking-wider shrink-0 bg-white border border-[#eaeaec]/50 px-2 py-1 rounded-lg text-center font-mono">
                                        {c.dateLabel}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DraggableModal>
        </>
    );
};

const CustomizableWidgetHub = ({ leaves, employees, attendance, setLeaves, setAttendance, isLoading, t }: any) => {
    const [isCustomizing, setIsCustomizing] = useState(false);
    const [wishes, setWishes] = useState<{ [key: string]: any[] }>(() => {
        const saved = localStorage.getItem('employee_congratulations_feed');
        return saved ? JSON.parse(saved) : {};
    });
    
    // Sparkle elements for fun micro-animations
    const [confettis, setConfettis] = useState<any[]>([]);

    // Load or initialize widget config
    const [widgetSetup, setWidgetSetup] = useState<any[]>(() => {
        const saved = localStorage.getItem('dashboard_custom_widgets_setup');
        if (saved) {
            try { return JSON.parse(saved); } catch(e){}
        }
        return [
            { id: 'pending_leaves', visible: true, order: 0, settings: { limit: 3, leaveTypeFilter: 'All' }, activeSettingsTab: null },
            { id: 'today_attendance', visible: true, order: 1, settings: { limit: 4, lateThreshold: '08:30', dateMode: 'Latest' }, activeSettingsTab: null },
            { id: 'upcoming_birthdays', visible: true, order: 2, settings: { limit: 3, daysHorizon: 30, celebrationType: 'All' }, activeSettingsTab: null }
        ];
    });

    const triggerCelebration = () => {
        const symbols = ['🎉', '🎂', '✨', '🎁', '🎈', '💖', '⭐', '🧁'];
        const newConfettis = Array.from({ length: 18 }).map((_, i) => ({
            id: `conf-${Date.now()}-${i}`,
            x: Math.random() * 80 + 10, // percentage left
            y: Math.random() * 40 + 60, // percentage top
            size: Math.random() * 1.5 + 0.8, // scale
            symbol: symbols[Math.floor(Math.random() * symbols.length)],
            delay: Math.random() * 0.4
        }));
        setConfettis(newConfettis);
        setTimeout(() => setConfettis([]), 2800);
    };

    const updateSetup = (newSetup: any[]) => {
        setWidgetSetup(newSetup);
        localStorage.setItem('dashboard_custom_widgets_setup', JSON.stringify(newSetup));
    };

    const toggleVisibility = (id: string) => {
        const idx = widgetSetup.findIndex(w => w.id === id);
        if (idx !== -1) {
            const copy = [...widgetSetup];
            copy[idx] = { ...copy[idx], visible: !copy[idx].visible };
            updateSetup(copy);
        }
    };

    const moveWidget = (id: string, direction: 'up' | 'down') => {
        const sorted = [...widgetSetup].sort((a,b) => (a.order ?? 0) - (b.order ?? 0));
        const idx = sorted.findIndex(w => w.id === id);
        if (idx === -1) return;
        
        let swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= sorted.length) return;

        // swap orders
        const temp = sorted[idx].order;
        sorted[idx].order = sorted[swapIdx].order;
        sorted[swapIdx].order = temp;

        updateSetup(sorted);
    };

    const resetLayout = () => {
        const base = [
            { id: 'pending_leaves', visible: true, order: 0, settings: { limit: 3, leaveTypeFilter: 'All' } },
            { id: 'today_attendance', visible: true, order: 1, settings: { limit: 4, lateThreshold: '08:30', dateMode: 'Latest' } },
            { id: 'upcoming_birthdays', visible: true, order: 2, settings: { limit: 3, daysHorizon: 30, celebrationType: 'All' } }
        ];
        updateSetup(base);
        MySwal.fire({
            title: t('Reset Default Layout'),
            text: t('Dashboard widget order and settings have been restored to defaults.'),
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    };

    const updateWidgetSettings = (id: string, key: string, val: any) => {
        const copy = widgetSetup.map(w => {
            if (w.id === id) {
                return {
                    ...w,
                    settings: { ...w.settings, [key]: val }
                };
            }
            return w;
        });
        updateSetup(copy);
    };

    const toggleSettingsDrawer = (id: string) => {
        const copy = widgetSetup.map(w => {
            if (w.id === id) {
                return { ...w, showSettings: !w.showSettings };
            }
            return { ...w, showSettings: false }; // close others
        });
        updateSetup(copy);
    };

    // --- LEAVE ACTIONS ---
    const handleLeaveApproval = async (reqId: string, action: 'Approved' | 'Rejected') => {
        try {
            const updated = leaves.map((l: any) => l.id === reqId ? { ...l, status: action } : l);
            setLeaves(updated);
            await dbSync.write('LeaveRequests', updated);
            
            MySwal.fire({
                title: action === 'Approved' ? t('Approve') : t('Reject'),
                text: `${t('Leave request has been')} ${t(action).toLowerCase()} ${t('successfully')}.`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        } catch (e) {
            console.error(e);
            MySwal.fire({
                title: 'Error',
                text: 'Failed to process request.',
                icon: 'error'
            });
        }
    };

    // --- SEED TODAY'S ATTENDANCE ---
    const seedTodaysAttendance = async () => {
        const realTodayStr = new Date().toISOString().split('T')[0];
        const seedLogs = [
            { id: `att-seed-${Date.now()}-1`, employeeId: 'U001', date: realTodayStr, checkIn: '08:14', checkOut: '17:30', status: 'Present', hours: 9.2, shift: 'Regular Shift', mode: 'Office' },
            { id: `att-seed-${Date.now()}-2`, employeeId: 'U002', date: realTodayStr, checkIn: '08:28', checkOut: '17:35', status: 'Present', hours: 9.1, shift: 'Regular Shift', mode: 'Office' },
            { id: `att-seed-${Date.now()}-3`, employeeId: 'U003', date: realTodayStr, checkIn: '08:44', checkOut: '17:01', status: 'Late', hours: 8.3, shift: 'Regular Shift', mode: 'Office' },
            { id: `att-seed-${Date.now()}-4`, employeeId: 'U004', date: realTodayStr, checkIn: '08:02', checkOut: '', status: 'Present', hours: 4.0, shift: 'Regular Shift', mode: 'Remote' },
            { id: `att-seed-${Date.now()}-5`, employeeId: 'U005', date: realTodayStr, checkIn: '', checkOut: '', status: 'Leave', hours: 0, shift: 'Regular Shift', mode: 'Office' },
        ];

        try {
            const updated = [...attendance, ...seedLogs];
            setAttendance(updated);
            await dbSync.write('Attendance', updated);
            MySwal.fire({
                title: t('Today'),
                text: 'Generated realistic attendance logs for today! Real-time metrics successfully calibrated.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (e) {
            console.error(e);
        }
    };

    // Sort widgets based on order attribute
    const sortedWidgets = useMemo(() => {
        return [...widgetSetup].sort((a,b) => (a.order ?? 0) - (b.order ?? 0));
    }, [widgetSetup]);

    return (
        <div className="w-full space-y-4 shrink-0 relative" id="smart-dashboard-widget-hub">
            <style>{`
                @keyframes floatUpFast {
                    0% {
                        transform: translateY(0) scale(0.6);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 0.9;
                    }
                    100% {
                        transform: translateY(-120px) scale(1.1);
                        opacity: 0;
                    }
                }
                .animate-floatUpFast {
                    animation: floatUpFast 2.2s ease-out forwards;
                }
            `}</style>

            {/* Title Control Header bar */}
            <div className="flex items-center justify-between bg-[#212c46] text-white px-5 py-3 rounded-2xl shadow-sm border border-[#303f5e]">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal size={18} className="text-[#b58c4f]" />
                    <div>
                        <h2 className="text-xs font-black uppercase tracking-wider">{t('Personal Dashboard Hub')}</h2>
                        <h3 className="text-[9px] text-[#748ea1] uppercase font-black tracking-widest">{t('Manage Widget Visibility & Customization')}</h3>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsCustomizing(true)} 
                        className="bg-[#b58c4f] hover:bg-[#8e9141] text-white text-[9px] font-black uppercase px-4 py-2 rounded-xl transition-all shadow flex items-center gap-1.5 cursor-pointer border border-[#b7a159]/20 font-sans"
                    >
                        <Settings size={12} strokeWidth={2.5} />
                        {t('Customize Widgets')}
                    </button>
                    <button 
                        onClick={resetLayout}
                        className="bg-transparent hover:bg-white/10 text-slate-300 text-[9px] font-black uppercase px-3 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer border border-white/10 font-sans"
                    >
                        <RotateCcw size={11} />
                        <span className="hidden sm:inline">{t('Reset Default Layout')}</span>
                    </button>
                </div>
            </div>

            {/* Float visual confettis container */}
            {confettis.length > 0 && (
                <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
                    {confettis.map(c => (
                        <div 
                            key={c.id} 
                            className="absolute text-xl select-none animate-floatUpFast opacity-0"
                            style={{ 
                                left: `${c.x}%`, 
                                top: `${c.y}%`, 
                                transform: `scale(${c.size})`,
                                animationDelay: `${c.delay}s`,
                                animationDuration: '2.5s'
                            }}
                        >
                            {c.symbol}
                        </div>
                    ))}
                </div>
            )}

            {/* Widgets Rendering Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {sortedWidgets.filter(w => w.visible).map((w) => {
                    if (w.id === 'pending_leaves') {
                        // --- Leaf request filters and rendering ---
                        const typeFilter = w.settings.leaveTypeFilter || 'All';
                        const itemsLimit = w.settings.limit || 3;
                        
                        const filteredPending = leaves.filter((l: any) => {
                            if (l.status !== 'Pending') return false;
                            if (typeFilter === 'All') return true;
                            if (typeFilter === 'Vacation') return l.type?.toLowerCase().includes('vacation');
                            if (typeFilter === 'Sick') return l.type?.toLowerCase().includes('sick');
                            if (typeFilter === 'Business') return l.type?.toLowerCase().includes('business') || l.type?.toLowerCase().includes('personal');
                            return true;
                        }).slice(0, itemsLimit);

                        return (
                            <GlassCard key={w.id} className="relative flex flex-col justify-between border-[#eaeaec]/60 overflow-hidden min-h-[380px]" hoverEffect={true}>
                                <div className="space-y-3 flex-1 flex flex-col">
                                    {/* Widget header */}
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-[#4d87a8]/10 text-[#4d87a8] rounded-lg">
                                                <ClipboardList size={15} className="text-[#3f809e]"/>
                                            </div>
                                            <div>
                                                <h3 className="text-[11px] font-black text-[#212c46] uppercase tracking-wider">{t('Pending Leave Requests')}</h3>
                                                <p className="text-[8px] text-[#748ea1] font-bold uppercase tracking-widest leading-none mt-0.5">{t('Approvals')} ({filteredPending.length} rcvd)</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {/* Order adjusters */}
                                            <button onClick={() => moveWidget(w.id, 'up')} className="p-0.5 text-[#748ea1] hover:text-[#212c46] hover:bg-slate-50 rounded cursor-pointer" title={t('Up')}>
                                                <ChevronUp size={13} />
                                            </button>
                                            <button onClick={() => moveWidget(w.id, 'down')} className="p-0.5 text-[#748ea1] hover:text-[#212c46] hover:bg-slate-50 rounded cursor-pointer" title={t('Down')}>
                                                <ChevronDown size={13} />
                                            </button>
                                            <button onClick={() => toggleSettingsDrawer(w.id)} className={`p-0.5 rounded transition-colors cursor-pointer ${w.showSettings ? 'text-[#b58c4f] bg-[#b58c4f]/10' : 'text-[#748ea1] hover:text-[#212c46] hover:bg-slate-50'}`}>
                                                <Settings size={13} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Settings Form Inline */}
                                    {w.showSettings && (
                                        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-2 animate-fadeIn text-[10px] shrink-0 flex-1 flex-col flex min-h-0 pb-6">
                                            <p className="font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1">
                                                <SlidersHorizontal size={10} /> {t('Widget Settings')}
                                            </p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Type Filter')}</label>
                                                    <select 
                                                        value={typeFilter} 
                                                        onChange={(e) => updateWidgetSettings(w.id, 'leaveTypeFilter', e.target.value)}
                                                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[9px] outline-none"
                                                    >
                                                        <option value="All">{t('All Types')}</option>
                                                        <option value="Vacation">{t('Vacation Only')}</option>
                                                        <option value="Sick">{t('Sick Only')}</option>
                                                        <option value="Business">{t('Business Only')}</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Items Limit')}</label>
                                                    <select 
                                                        value={itemsLimit} 
                                                        onChange={(e) => updateWidgetSettings(w.id, 'limit', Number(e.target.value))}
                                                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[9px] outline-none"
                                                    >
                                                        <option value="2">2</option>
                                                        <option value="3">3</option>
                                                        <option value="5">5</option>
                                                        <option value="8">8</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Leave content */}
                                    <div className="space-y-2 flex-1 overflow-y-auto max-h-[260px] pr-1">
                                        {filteredPending.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center gap-1">
                                                <CheckCircle2 size={22} className="opacity-40 text-emerald-500" />
                                                <span className="text-[10px] font-black uppercase tracking-wider">{t('No pending leave requests')}</span>
                                            </div>
                                        ) : (
                                            filteredPending.map((l: any) => {
                                                // Find avatar matching employee name
                                                const cleanName = (l.employeeName || '').split(' (')[0].toLowerCase();
                                                const empMatch = employees.find(e => (e.name || '').toLowerCase().includes(cleanName));
                                                return (
                                                    <div key={l.id} className="p-2.5 bg-white border border-slate-100 rounded-xl hover:shadow-xs transition-all text-xs flex flex-col gap-2 relative">
                                                        <div className="flex gap-2">
                                                            <img 
                                                                src={empMatch?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop'} 
                                                                alt={l.employeeName} 
                                                                className="w-8 h-8 rounded-lg object-cover bg-slate-100"
                                                            />
                                                            <div className="min-w-0 flex-1">
                                                                <p className="font-extrabold text-[#212c46] truncate leading-tight">{l.employeeName}</p>
                                                                <p className="text-[8px] font-black uppercase text-slate-400 mt-0.5 tracking-wider truncate">
                                                                    {t(l.type)} ({l.days} {t('Days').toLowerCase()})
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="bg-slate-50/50 p-1.5 rounded-lg border border-slate-100 text-[10px] text-slate-500 font-medium leading-normal line-clamp-2">
                                                            📅 {l.start || 'N/A'} ~ {l.end || 'N/A'} <br />
                                                            ✏️ "{l.reason || 'No documented details'}"
                                                        </div>
                                                        <div className="flex gap-1.5 mt-0.5">
                                                            <button 
                                                                onClick={() => handleLeaveApproval(l.id, 'Approved')}
                                                                className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase rounded shadow-sm hover:shadow transition-all cursor-pointer text-center border-0"
                                                            >
                                                                {t('Approve')}
                                                            </button>
                                                            <button 
                                                                onClick={() => handleLeaveApproval(l.id, 'Rejected')}
                                                                className="flex-1 py-1 bg-[#932c2e]/10 hover:bg-[#932c2e]/20 text-[#932c2e] text-[9px] font-black uppercase rounded shadow-sm transition-all cursor-pointer text-center border-0"
                                                            >
                                                                {t('Reject')}
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </GlassCard>
                        );
                    } else if (w.id === 'today_attendance') {
                        // --- ATTENDANCE STATS CALCULATION ---
                        const dateMode = w.settings.dateMode || 'Latest';
                        const threshold = w.settings.lateThreshold || '08:30';
                        const listLimit = w.settings.limit || 4;

                        // Find target date
                        let targetDateStr = new Date().toISOString().split('T')[0];
                        if (dateMode === 'Latest' && attendance.length > 0) {
                            // Find the most recent date
                            const dates = attendance.map(a => a.date).filter(Boolean);
                            if (dates.length > 0) {
                                targetDateStr = dates.reduce((a, b) => a > b ? a : b);
                            }
                        }

                        // Filter logs for targetDate
                        const targetLogs = attendance.filter(a => a.date === targetDateStr);
                        
                        // Calculate metrics
                        const stats = {
                            present: 0,
                            late: 0,
                            leave: 0,
                            absent: 0
                        };

                        targetLogs.forEach((l: any) => {
                            const stat = (l.status || '').toLowerCase();
                            if (stat === 'present') stats.present++;
                            else if (stat === 'late') stats.late++;
                            else if (stat === 'leave') stats.leave++;
                            else if (stat === 'absent') stats.absent++;
                        });

                        const totalUsers = targetLogs.length || 1;
                        const attendanceRate = Math.round(((stats.present + stats.late) / totalUsers) * 100);

                        return (
                            <GlassCard key={w.id} className="relative flex flex-col justify-between border-[#eaeaec]/60 overflow-hidden min-h-[380px]" hoverEffect={true}>
                                <div className="space-y-3 flex-1 flex flex-col">
                                    {/* Header */}
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg">
                                                <ShieldCheck size={15} />
                                            </div>
                                            <div>
                                                <h3 className="text-[11px] font-black text-[#212c46] uppercase tracking-wider">{t("Today's Attendance")}</h3>
                                                <p className="text-[8px] text-[#748ea1] font-bold uppercase tracking-widest mt-0.5 leading-none">{targetDateStr}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => moveWidget(w.id, 'up')} className="p-0.5 text-[#748ea1] hover:text-[#212c46] hover:bg-slate-50 opacity-100 rounded cursor-pointer" title={t('Up')}>
                                                <ChevronUp size={13} />
                                            </button>
                                            <button onClick={() => moveWidget(w.id, 'down')} className="p-0.5 text-[#748ea1] hover:text-[#212c46] hover:bg-slate-50 opacity-100 rounded cursor-pointer" title={t('Down')}>
                                                <ChevronDown size={13} />
                                            </button>
                                            <button onClick={() => toggleSettingsDrawer(w.id)} className={`p-0.5 rounded transition-colors cursor-pointer ${w.showSettings ? 'text-[#b58c4f] bg-[#b58c4f]/10' : 'text-[#748ea1] hover:text-[#212c46] hover:bg-slate-50'}`}>
                                                <Settings size={13} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Settings Drawer */}
                                    {w.showSettings && (
                                        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-2 animate-fadeIn text-[10px] shrink-0 text-left">
                                            <p className="font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1">
                                                <SlidersHorizontal size={10} /> {t('Widget Settings')}
                                            </p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Date Source')}</label>
                                                    <select 
                                                        value={dateMode} 
                                                        onChange={(e) => updateWidgetSettings(w.id, 'dateMode', e.target.value)}
                                                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[9px] outline-none"
                                                    >
                                                        <option value="Latest">{t('Latest Date in Logs')}</option>
                                                        <option value="Today">{t('Today')}</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Custom Late Threshold')}</label>
                                                    <select 
                                                        value={threshold} 
                                                        onChange={(e) => updateWidgetSettings(w.id, 'lateThreshold', e.target.value)}
                                                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[9px] outline-none"
                                                    >
                                                        <option value="08:00">08:00</option>
                                                        <option value="08:15">08:15</option>
                                                        <option value="08:30">08:30</option>
                                                        <option value="08:45">08:45</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Attendance Content */}
                                    <div className="space-y-3 flex-1 flex flex-col justify-between">
                                        {targetLogs.length === 0 ? (
                                            <div className="flex-1 flex flex-col items-center justify-center p-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-center gap-2 my-auto">
                                                <Activity size={24} className="text-slate-400 opacity-60" />
                                                <div>
                                                    <p className="text-[11px] font-black uppercase text-slate-500">{t('No check-ins logged for today yet')}</p>
                                                    <p className="text-[9px] text-slate-400 mt-1 font-medium">Simulate logs for demonstration of real-time graphs</p>
                                                </div>
                                                <button 
                                                    onClick={seedTodaysAttendance}
                                                    className="px-4 py-1.5 bg-[#212c46] text-white text-[9px] font-black uppercase rounded shadow-sm hover:shadow transition-all cursor-pointer border border-[#212c46] font-sans"
                                                >
                                                    💡 Generate Test Logs
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Stats block */}
                                                <div className="grid grid-cols-4 gap-1 text-center font-tech">
                                                    <div className="bg-[#657f4d]/5 border border-[#657f4d]/20 px-1 py-1.5 rounded-lg text-emerald-700 leading-none">
                                                        <span className="block text-[15px] font-black">{stats.present}</span>
                                                        <span className="text-[7.5px] font-black uppercase leading-none mt-1 inline-block">{t('Present')}</span>
                                                    </div>
                                                    <div className="bg-[#b58c4f]/5 border border-[#b58c4f]/20 px-1 py-1.5 rounded-lg text-orange-600 leading-none">
                                                        <span className="block text-[15px] font-black">{stats.late}</span>
                                                        <span className="text-[7.5px] font-black uppercase leading-none mt-1 inline-block">{t('Late')}</span>
                                                    </div>
                                                    <div className="bg-[#3f809e]/5 border border-[#3f809e]/20 px-1 py-1.5 rounded-lg text-[#3f809e] leading-none">
                                                        <span className="block text-[15px] font-black">{stats.leave}</span>
                                                        <span className="text-[7.5px] font-black uppercase leading-none mt-1 inline-block">{t('Leave')}</span>
                                                    </div>
                                                    <div className="bg-[#932c2e]/5 border border-[#932c2e]/20 px-1 py-1.5 rounded-lg text-rose-700 leading-none">
                                                        <span className="block text-[15px] font-black">{stats.absent}</span>
                                                        <span className="text-[7.5px] font-black uppercase leading-none mt-1 inline-block">{t('Absent')}</span>
                                                    </div>
                                                </div>

                                                {/* Progress circle */}
                                                <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-2.5 rounded-2xl">
                                                    <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
                                                        <svg className="w-full h-full transform -rotate-90">
                                                            <circle cx="22" cy="22" r="18" stroke="#eaeaec" strokeWidth="4" fill="transparent" />
                                                            <circle cx="22" cy="22" r="18" stroke="#657f4d" strokeWidth="4" fill="transparent"
                                                                    strokeDasharray={2 * Math.PI * 18}
                                                                    strokeDashoffset={2 * Math.PI * 18 * (1 - (isNaN(attendanceRate) ? 0 : attendanceRate) / 100)} />
                                                        </svg>
                                                        <span className="absolute text-[10px] font-black text-[#212c46] tracking-tighter">{isNaN(attendanceRate)?0:attendanceRate}%</span>
                                                    </div>
                                                    <div className="min-w-0 text-left">
                                                        <p className="text-[9px] font-black uppercase tracking-wider text-[#212c46]">{t('Attendance Summary')}</p>
                                                        <p className="text-[8px] text-[#748ea1] leading-tight font-bold mt-0.5">
                                                            Target metrics configured. Standard count thresholds calibrated at <span className="font-tech text-[#b58c4f] font-bold">{threshold} AM</span>.
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Log lists */}
                                                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 text-left">
                                                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider mb-1 flex items-center gap-1">
                                                        <Clock size={10} /> {t('Recent Check-ins')}
                                                    </p>
                                                    {targetLogs.slice(0, listLimit).map((l: any) => {
                                                        const cleanId = (l.employeeId || '').toUpperCase();
                                                        const emp = employees.find(e => e.employeeId === cleanId);
                                                        const statusCol = l.status === 'Present' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' :
                                                                          l.status === 'Late' ? 'text-orange-600 bg-orange-50 border-orange-100' : 
                                                                          l.status === 'Leave' ? 'text-[#3f809e] bg-slate-50 border-slate-100' : 'text-[#932c2e] bg-rose-50 border-rose-100';
                                                        return (
                                                            <div key={l.id} className="flex justify-between items-center text-[10px] bg-white border border-slate-100 rounded-lg py-1.5 px-2 hover:shadow-2xs">
                                                                <div className="flex items-center gap-1.5 min-w-0">
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${l.status==='Present'?'bg-emerald-500':l.status==='Late'?'bg-amber-500':'bg-slate-400'}`}></div>
                                                                    <span className="font-extrabold text-[#212c46] truncate max-w-[120px]">{emp?.name ? emp.name.split(' (')[0] : `Staff ${cleanId}`}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 font-tech text-right">
                                                                    <span className="text-slate-400 text-[8px] tracking-wide font-bold">IN {l.checkIn || '--:--'}</span>
                                                                    <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 rounded border ${statusCol}`}>{t(l.status)}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </GlassCard>
                        );
                    } else if (w.id === 'upcoming_birthdays') {
                        // --- CELEBRATIONS CALCULATION ---
                        const lookAhead = w.settings.daysHorizon || 30;
                        const celeLimit = w.settings.limit || 3;
                        const celType = w.settings.celebrationType || 'All';

                        const targetCelebrations: any[] = [];
                        const refDate = new Date('2026-06-04'); // Reference focal point in logs

                        employees.forEach(emp => {
                            // Birthdays
                            if (emp.birthDate && (celType === 'All' || celType === 'Birthday')) {
                                const parts = emp.birthDate.split('-');
                                if (parts.length === 3) {
                                    const month = parseInt(parts[1], 10);
                                    const day = parseInt(parts[2], 10);
                                    
                                    const anniversaryThisYear = new Date(2026, month - 1, day);
                                    const diff = Math.round((anniversaryThisYear.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24));
                                    
                                    if (diff >= 0 && diff <= lookAhead) {
                                        targetCelebrations.push({
                                            empId: emp.employeeId,
                                            emp,
                                            type: 'birthday',
                                            daysLeft: diff,
                                            title: `Birthday (วันเกิด)`,
                                            desc: `Turning milestone age`,
                                            badge: '🎂 BD'
                                        });
                                    }
                                }
                            }
                            // Anniversaries
                            if (emp.hireDate && (celType === 'All' || celType === 'Anniversary')) {
                                const parts = emp.hireDate.split('-');
                                if (parts.length === 3) {
                                    const year = parseInt(parts[0], 10);
                                    const month = parseInt(parts[1], 10);
                                    const day = parseInt(parts[2], 10);
                                    
                                    const annivThisYear = new Date(2026, month - 1, day);
                                    const diff = Math.round((annivThisYear.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24));
                                    
                                    if (diff >= 0 && diff <= lookAhead) {
                                        const milestoneYear = 2026 - year;
                                        if (milestoneYear > 0) {
                                            targetCelebrations.push({
                                                empId: emp.employeeId,
                                                emp,
                                                type: 'anniversary',
                                                daysLeft: diff,
                                                title: `Work Anniversary (ครบรอบ)`,
                                                desc: `${milestoneYear} Years in company`,
                                                badge: '💼 WA'
                                            });
                                        }
                                    }
                                }
                            }
                        });

                        // Sort by chronological order
                        targetCelebrations.sort((a,b) => a.daysLeft - b.daysLeft);
                        const displayedCelebrations = targetCelebrations.slice(0, celeLimit);

                        return (
                            <GlassCard key={w.id} className="relative flex flex-col justify-between border-[#eaeaec]/60 overflow-hidden min-h-[380px]" hoverEffect={true}>
                                <div className="space-y-3 flex-1 flex flex-col">
                                    {/* Header */}
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-rose-500/10 text-rose-600 rounded-lg">
                                                <Cake size={15} />
                                            </div>
                                            <div>
                                                <h3 className="text-[11px] font-black text-[#212c46] uppercase tracking-wider">{t('Upcoming Birthdays')}</h3>
                                                <p className="text-[8px] text-[#748ea1] font-bold uppercase tracking-widest mt-0.5 leading-none">{t('Days Range Look-Ahead')} ({lookAhead} {t('Days').toLowerCase()})</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => moveWidget(w.id, 'up')} className="p-0.5 text-[#748ea1] hover:text-[#212c46] hover:bg-slate-50 opacity-100 rounded cursor-pointer" title={t('Up')}>
                                                <ChevronUp size={13} />
                                            </button>
                                            <button onClick={() => moveWidget(w.id, 'down')} className="p-0.5 text-[#748ea1] hover:text-[#212c46] hover:bg-slate-50 opacity-100 rounded cursor-pointer" title={t('Down')}>
                                                <ChevronDown size={13} />
                                            </button>
                                            <button onClick={() => toggleSettingsDrawer(w.id)} className={`p-0.5 rounded transition-colors cursor-pointer ${w.showSettings ? 'text-[#b58c4f] bg-[#b58c4f]/10' : 'text-[#748ea1] hover:text-[#212c46] hover:bg-slate-50'}`}>
                                                <Settings size={13} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Settings Form */}
                                    {w.showSettings && (
                                        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-2 animate-fadeIn text-[10px] shrink-0 text-left">
                                            <p className="font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1">
                                                <SlidersHorizontal size={10} /> {t('Widget Settings')}
                                            </p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Show Celebration Type')}</label>
                                                    <select 
                                                        value={celType} 
                                                        onChange={(e) => updateWidgetSettings(w.id, 'celebrationType', e.target.value)}
                                                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[9px] outline-none"
                                                    >
                                                        <option value="All">{t('Birthdays & Anniversaries')}</option>
                                                        <option value="Birthday">{t('Birthdays Only')}</option>
                                                        <option value="Anniversary">{t('Anniversaries Only')}</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('Days Range Look-Ahead')}</label>
                                                    <select 
                                                        value={lookAhead} 
                                                        onChange={(e) => updateWidgetSettings(w.id, 'daysHorizon', Number(e.target.value))}
                                                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[9px] outline-none"
                                                    >
                                                        <option value="7">7 {t('Days').toLowerCase()}</option>
                                                        <option value="15">15 {t('Days').toLowerCase()}</option>
                                                        <option value="30">30 {t('Days').toLowerCase()}</option>
                                                        <option value="60">60 {t('Days').toLowerCase()}</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Content list block */}
                                    <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[260px] pr-1 text-left">
                                        {displayedCelebrations.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center gap-1">
                                                <Gift size={22} className="opacity-40 text-rose-500 animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-wider">{t('No Celebrations')}</span>
                                            </div>
                                        ) : (
                                            displayedCelebrations.map((c, i) => {
                                                const hasWishes = (wishes[c.empId] || []).length;
                                                return (
                                                    <div key={`${c.empId}-${c.type}`} className="p-2 bg-white border border-slate-100 rounded-xl hover:shadow-xs transition-colors flex flex-col gap-1.5 text-xs">
                                                        <div className="flex items-center gap-2">
                                                            <img 
                                                                src={c.emp?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop'} 
                                                                alt={c.emp?.name} 
                                                                className="w-8 h-8 rounded-lg object-cover"
                                                            />
                                                            <div className="min-w-0 flex-1">
                                                                <p className="font-extrabold text-[#212c46] leading-tight truncate">{c.emp?.name.split(' (')[0]}</p>
                                                                <p className="text-[8.5px] font-bold text-[#b58c4f] uppercase tracking-wide">
                                                                    {c.badge} • {c.daysLeft === 0 ? 'Today! 🎉' : `In ${c.daysLeft} days`}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 font-tech">
                                                                    {c.emp?.birthDate ? `${c.emp.birthDate.split('-')[2]}/${c.emp.birthDate.split('-')[1]}` : '--'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Digital Wish Card inline form */}
                                                        <div className="border-t border-dashed border-slate-150 pt-1.5 flex gap-1 items-center">
                                                            <input 
                                                                type="text" 
                                                                placeholder={t('Write your custom celebration message...').slice(0, 22) + '...'}
                                                                id={`wish-input-${c.empId}-${c.type}`}
                                                                className="flex-1 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[8.5px] outline-none font-medium text-slate-600 focus:border-rose-400 placeholder:opacity-50"
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        const val = (e.currentTarget.value || '').trim();
                                                                        if (!val) return;
                                                                        
                                                                        const list = wishes[c.empId] || [];
                                                                        const newWishItem = {
                                                                            id: `wish-${Date.now()}`,
                                                                            author: 'คุณ (You)',
                                                                            text: val,
                                                                            time: 'Just now'
                                                                        };
                                                                        const updatedFeed = { ...wishes, [c.empId]: [newWishItem, ...list] };
                                                                        setWishes(updatedFeed);
                                                                        localStorage.setItem('employee_congratulations_feed', JSON.stringify(updatedFeed));
                                                                        
                                                                        e.currentTarget.value = '';
                                                                        triggerCelebration();
                                                                        
                                                                        MySwal.fire({
                                                                            title: t('Greeting Sent'),
                                                                            text: 'Digital wish posted to celebration card successfully!',
                                                                            icon: 'success',
                                                                            timer: 1500,
                                                                            showConfirmButton: false,
                                                                            toast: true,
                                                                            position: 'top-end'
                                                                        });
                                                                    }
                                                                }}
                                                            />
                                                            <button 
                                                                onClick={() => {
                                                                    const inpEl = document.getElementById(`wish-input-${c.empId}-${c.type}`) as HTMLInputElement;
                                                                    const val = (inpEl?.value || '').trim();
                                                                    if (!val) return;

                                                                    const list = wishes[c.empId] || [];
                                                                    const newWishItem = {
                                                                        id: `wish-${Date.now()}`,
                                                                        author: 'คุณ (You)',
                                                                        text: val,
                                                                        time: 'Just now'
                                                                    };
                                                                    const updatedFeed = { ...wishes, [c.empId]: [newWishItem, ...list] };
                                                                    setWishes(updatedFeed);
                                                                    localStorage.setItem('employee_congratulations_feed', JSON.stringify(updatedFeed));
                                                                    
                                                                    inpEl.value = '';
                                                                    triggerCelebration();

                                                                    MySwal.fire({
                                                                        title: t('Greeting Sent'),
                                                                        text: 'Digital wish posted to celebration card successfully!',
                                                                        icon: 'success',
                                                                        timer: 1500,
                                                                        showConfirmButton: false,
                                                                        toast: true,
                                                                        position: 'top-end'
                                                                    });
                                                                }}
                                                                className="p-1 px-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[8px] font-black uppercase transition-all flex items-center justify-center cursor-pointer border-0 shrink-0"
                                                            >
                                                                <Send size={8} />
                                                            </button>
                                                        </div>

                                                        {hasWishes > 0 && (
                                                            <p className="text-[7.5px] font-black uppercase text-[#3f809e] text-right leading-none mt-0.5 tracking-wider">
                                                                💌 Posted {hasWishes} greeting messages
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </GlassCard>
                        );
                    }
                    return null;
                })}
            </div>

            {/* Widget Manage Modal */}
            <DraggableModal 
                isOpen={isCustomizing} 
                onClose={() => setIsCustomizing(false)}
                title={
                    <span className="text-sm font-black uppercase text-[#212c46] tracking-widest flex items-center gap-2">
                        <SlidersHorizontal size={15} className="text-[#b58c4f]"/>
                        {t('Customize Widgets')}
                    </span>
                }
                width="max-w-md"
            >
                <div className="p-5 space-y-4">
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        Customize which dynamic widgets are visible, toggle their operational limits, or drag-order their layout priorities. Changes apply instantly.
                    </p>

                    <div className="space-y-2 border-y border-slate-100 py-3">
                        {sortedWidgets.map((w, idx) => {
                            const nameLabel = w.id === 'pending_leaves' ? t('Pending Leave Requests') :
                                              w.id === 'today_attendance' ? t("Today's Attendance") : t('Upcoming Birthdays');
                            return (
                                <div key={w.id} className="flex justify-between items-center bg-white border border-slate-150 rounded-xl p-3 shadow-xs">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <span className="font-tech text-xs text-slate-400 font-extrabold flex-shrink-0">#{idx + 1}</span>
                                        <span className="text-xs font-black text-[#212c46] truncate">{nameLabel}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {/* Move Up */}
                                        <button 
                                            onClick={() => moveWidget(w.id, 'up')}
                                            disabled={idx === 0}
                                            className="p-1 border border-slate-200 hover:border-[#212c46] text-slate-400 hover:text-[#212c46] rounded-lg transition-colors cursor-pointer bg-slate-50 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                                        >
                                            <ChevronUp size={11} strokeWidth={2.5} />
                                        </button>
                                        
                                        {/* Move Down */}
                                        <button 
                                            onClick={() => moveWidget(w.id, 'down')}
                                            disabled={idx === sortedWidgets.length - 1}
                                            className="p-1 border border-slate-200 hover:border-[#212c46] text-slate-400 hover:text-[#212c46] rounded-lg transition-colors cursor-pointer bg-slate-50 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                                        >
                                            <ChevronDown size={11} strokeWidth={2.5} />
                                        </button>

                                        {/* Toggle visibility */}
                                        <button 
                                            onClick={() => toggleVisibility(w.id)}
                                            className={`p-1 px-2 text-[8px] font-black uppercase rounded-lg transition-all flex items-center gap-1 border border-none cursor-pointer
                                                ${w.visible ? 'bg-emerald-50 text-emerald-750 hover:bg-emerald-100' : 'bg-rose-50 text-rose-750 hover:bg-rose-100'}`}
                                        >
                                            {w.visible ? <Eye size={10} /> : <EyeOff size={10} />}
                                            {w.visible ? t('Activate') : t('Deactivate')}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex gap-2">
                        <button 
                            onClick={resetLayout}
                            className="flex-1 py-2 border border-slate-200 text-[#414757] hover:bg-slate-50 text-[10px] font-extrabold uppercase rounded-full tracking-wider cursor-pointer font-sans"
                        >
                            {t('Reset Default Layout')}
                        </button>
                        <button 
                            onClick={() => setIsCustomizing(false)}
                            className="flex-1 py-2 bg-[#212c46] text-white hover:bg-[#303f5e] text-[10px] font-black uppercase rounded-full tracking-wider cursor-pointer font-sans"
                        >
                            {t('Close')}
                        </button>
                    </div>
                </div>
            </DraggableModal>
        </div>
    );
};

const CorporateNews = () => {
    const [isReadModalOpen, setIsReadModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isShowAllModalOpen, setIsShowAllModalOpen] = useState(false);
    const [selectedNews, setSelectedNews] = useState<any>(null);
    const [newsList, setNewsList] = useState<any[]>([]);

    // Form inputs and fields
    const [newsTitle, setNewsTitle] = useState('');
    const [newsCategory, setNewsCategory] = useState('COMPANY UPDATE');
    const [newsAuthor, setNewsAuthor] = useState('CEO OFFICE');
    const [newsPreview, setNewsPreview] = useState('');
    const [newsFullText, setNewsFullText] = useState('');
    const [newsImage, setNewsImage] = useState('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800');

    const defaultNews = [
      { category: 'COMPANY UPDATE', title: 'ประกาศผลประกอบการ ไตรมาส 1 / 2026', date: '08 May 2026', preview: 'ผลประกอบการไตรมาสแรกเติบโตขึ้น 15% ขอบคุณพนักงานทุกท่านที่ช่วย...', fullText: 'ผลประกอบการไตรมาสแรกเติบโตขึ้น 15% ขอบคุณพนักงานทุกท่านที่ร่วมใจประคองเป้าหมาย จนส่งผลให้สถิติตัวเลขเติบโตและปรับปรุงมาตรฐานการปฏิบัติงานให้โดดเด่นเยี่ยมยอดต่อไป!', author: 'CEO OFFICE', image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800' },
      { category: 'HR ANNOUNCEMENT', title: 'อัปเดตนโยบาย Work from Anywhere', date: '05 May 2026', preview: 'นโยบายการทำงานจากที่ใดก็ได้ได้ถูกปรับปรุงเพื่อเพิ่มความยืดหยุ่นให้...', fullText: 'นโยบายการทำงานจากที่ใดก็ได้ได้ถูกปรับปรุงเพื่อเพิ่มความยืดหยุ่นให้พนักงานทำงานแบบผสมผสาน (Hybrid) โดยสามารถยื่นลงเวลาผ่านทางผู้รับรองสายงานในระบบ ERP ได้ทันที', author: 'PEOPLE TEAM', image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800' },
      { category: 'EVENT', title: 'เชิญร่วมงาน Townhall ประจำเดือน', date: '01 May 2026', preview: 'พบปะพูดคุยกับผู้บริหารและรับฟังทิศทางของบริษัท พร้อมกิจกรรม...', fullText: 'ขอเชิญเพื่อนพนักงานร่วมงานประเมินสัปดาห์ทาวน์ฮอลล์ ถ่ายทอดภาพรวมความเคลื่อนไหวทางเศรษฐกิจ พัฒนาการผลิต และรับคำถามตอบแบบเปิดใจในวันศุกร์นี้ผ่านสตรีมมิ่งภายใน', author: 'INTERNAL COMMS', image: 'https://images.unsplash.com/photo-1511632765486-a01c80cf59af?q=80&w=800' },
    ];

    useEffect(() => {
        const loadNews = async () => {
            try {
                const res = await dbSync.read('CorporateNews');
                if (res && res.status === 'success' && res.data && Array.isArray(res.data.items) && res.data.items.length > 0) {
                    setNewsList(res.data.items);
                } else {
                    setNewsList(defaultNews);
                    await dbSync.write('CorporateNews', defaultNews);
                }
            } catch (err) {
                console.error("Failed to load corporate news:", err);
                setNewsList(defaultNews);
            }
        };
        loadNews();
    }, []);

    const openNews = (n: any) => {
      setSelectedNews(n);
      setIsReadModalOpen(true);
    };

    const handleAddNews = async () => {
       if (!newsTitle || !newsPreview) {
          MySwal.fire({ icon: 'error', title: 'Missing details', text: 'Please fill in Title and Summary.' });
          return;
       }

       const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
       const d = new Date();
       const dayStr = String(d.getDate()).padStart(2, '0');
       const formattedDate = `${dayStr} ${months[d.getMonth()]} ${d.getFullYear()}`;

       const newItem = {
          category: newsCategory,
          title: newsTitle,
          date: formattedDate,
          preview: newsPreview,
          fullText: newsFullText || newsPreview,
          author: newsAuthor,
          image: newsImage
       };

       try {
           const updatedNews = [newItem, ...newsList];
           setNewsList(updatedNews);
           await dbSync.write('CorporateNews', updatedNews);
           setIsAddModalOpen(false);

           // Reset inputs
           setNewsTitle('');
           setNewsPreview('');
           setNewsFullText('');

           MySwal.fire({
              icon: 'success',
              title: 'Announcement Posted!',
              showConfirmButton: false,
              timer: 1500
           });
       } catch (err) {
           console.error(err);
           MySwal.fire({ icon: 'error', title: 'Connection Failure' });
       }
    };

    return (
      <>
      <GlassCard className="bg-white border-[#f3f3f1] col-span-1 lg:col-span-2 flex flex-col relative overflow-hidden">
        <div className="absolute left-[35%] top-[-30%] opacity-[0.02] pointer-events-none transform rotate-12 z-0">
          <Globe size={380} />
        </div>
        <div className="flex justify-between items-center mb-6 relative z-10">
          <h2 className="text-sm font-black text-[#212c46] flex items-center gap-2 uppercase tracking-wide">
            <Globe size={16} className="text-[#3f809e]" /> CORPORATE NEWS BOARD
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="text-[10px] font-black text-white bg-gradient-to-r from-[#d96245] to-[#b7a159] hover:from-[#c25035] hover:to-[#a38e4a] px-4 py-2 rounded-lg uppercase tracking-widest transition-all shadow-md flex items-center gap-1.5 outline-none hover:scale-105 active:scale-95 border border-[#d96245]/20 cursor-pointer"
            >
              <Plus size={14} /> ADD UPDATE
            </button>
            <button 
              onClick={() => setIsShowAllModalOpen(true)}
              className="text-[10px] font-black text-[#212c46] bg-white px-4 py-2 rounded-lg uppercase tracking-widest border border-[#f3f3f1] hover:bg-[#f3f3f1] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3f809e] cursor-pointer"
            >
              ALL
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
          {newsList.slice(0, 3).map((n, i) => (
            <div key={i} onClick={() => openNews(n)} className="flex flex-col bg-white border border-[#f3f3f1] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1">
              <div className="relative h-36 w-full overflow-hidden">
                <img src={n.image} alt={n.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                   <span className="text-[9px] font-black text-white uppercase tracking-widest bg-[#3f809e] px-2.5 py-1 rounded-md shadow-sm">{n.category}</span>
                   <span className="text-white/90 text-[10px] font-bold tracking-wider drop-shadow-md">{n.date}</span>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1 text-left">
                <h3 className="text-[#212c46] font-bold text-sm mb-2 line-clamp-2 leading-snug group-hover:text-[#3f809e] transition-colors">{n.title}</h3>
                <p className="text-[#7a8b95] text-[11px] font-medium line-clamp-2 leading-relaxed flex-1">{n.preview}</p>
                <div className="mt-4 pt-3 border-t border-[#f3f3f1] flex items-center justify-between">
                  <span className="text-[10px] font-black text-[#a0abb2] uppercase tracking-widest flex items-center gap-1.5"><User size={10}/> {n.author}</span>
                  <div className="flex items-center gap-1 text-[10px] font-black text-[#d96245] opacity-0 group-hover:opacity-100 transition-all transform translate-x-3 group-hover:translate-x-0 duration-300">
                    READ <ChevronRight size={12} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* READ DETAILED NEWS MODAL */}
      <DraggableModal 
        isOpen={isReadModalOpen} 
        onClose={() => setIsReadModalOpen(false)}
        title={<span className="text-sm font-black uppercase text-[#212c46] tracking-widest flex items-center gap-2"><Globe size={16} className="text-[#3f809e]"/> Corporate News Publication</span>}
        width="max-w-2xl"
      >
        <div className="p-0 overflow-hidden flex flex-col max-h-[85vh] text-left">
          {selectedNews && (
             <>
                <div className="relative h-48 w-full shrink-0">
                   <img src={selectedNews.image} alt={selectedNews.title} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest bg-[#3f809e] px-3 py-1 rounded-md shadow-sm">{selectedNews.category}</span>
                        <span className="text-white/80 text-xs font-bold">{selectedNews.date}</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-md">{selectedNews.title}</h2>
                   </div>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                  <div className="whitespace-pre-wrap text-[#4a5568] text-sm leading-relaxed mb-0 font-medium">
                    {selectedNews.fullText}
                  </div>
                  <div className="bg-[#f3f3f1] rounded-xl p-4 border border-[#f3f3f1] flex items-center gap-3">
                     <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 shrink-0">
                        <User size={18} className="text-[#3f809e]" />
                     </div>
                     <div>
                       <p className="text-[10px] font-black text-[#7a8b95] uppercase tracking-widest">Published By</p>
                       <p className="text-xs font-black text-[#212c46]">{selectedNews.author}</p>
                     </div>
                  </div>
                </div>
             </>
          )}
        </div>
      </DraggableModal>

      {/* CREATING NEWS ANNOUNCEMENT MODAL */}
      <DraggableModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title={<span className="text-sm font-black uppercase text-[#212c46] tracking-widest flex items-center gap-1.5"><Plus size={16} className="text-[#a94228]"/> Publish Corporate Update</span>}
        width="max-w-xl"
      >
        <div className="p-6 space-y-4 text-left font-sans">
          <div>
            <label className="block text-[9px] font-black text-[#212c46] uppercase tracking-wider mb-1.5">Announcement Title*</label>
            <input 
              type="text" 
              value={newsTitle} 
              onChange={(e) => setNewsTitle(e.target.value)}
              placeholder="e.g. นโยบายปรับโครงสร้างค่าจ้างและการปฏิบัติงานประจำปี"
              className="w-full px-3.5 py-2.5 border border-[#ccd0db] rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#212c46] font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-black text-[#212c46] uppercase tracking-wider mb-1.5">News Category</label>
              <select 
                value={newsCategory}
                onChange={(e) => setNewsCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-[#ccd0db] rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#212c46]"
              >
                <option value="COMPANY UPDATE">COMPANY UPDATE</option>
                <option value="HR ANNOUNCEMENT">HR ANNOUNCEMENT</option>
                <option value="EVENT">EVENT</option>
                <option value="SAFETY ALERT">SAFETY ALERT</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-black text-[#212c46] uppercase tracking-wider mb-1.5">Publish Author</label>
              <input 
                type="text" 
                value={newsAuthor} 
                onChange={(e) => setNewsAuthor(e.target.value)}
                placeholder="e.g. HR STRATEGY TEAM"
                className="w-full px-3 py-2.5 border border-[#ccd0db] rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#212c46]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-black text-[#212c46] uppercase tracking-wider mb-1.5">Brief Summary (Preview Text)*</label>
            <textarea 
              value={newsPreview} 
              onChange={(e) => setNewsPreview(e.target.value)}
              placeholder="Provide a quick 1-2 sentence preview teaser..."
              className="w-full h-16 p-3 border border-[#ccd0db] rounded-xl text-xs outline-none resize-none font-medium"
            />
          </div>

          <div>
            <label className="block text-[9px] font-black text-[#212c46] uppercase tracking-wider mb-1.5">Full Content Article</label>
            <textarea 
              value={newsFullText} 
              onChange={(e) => setNewsFullText(e.target.value)}
              placeholder="Write the complete announcement context here..."
              className="w-full h-28 p-3 border border-[#ccd0db] rounded-xl text-xs outline-none resize-none font-medium"
            />
          </div>

          <div>
            <label className="block text-[9px] font-black text-[#212c46] uppercase tracking-wider mb-2">Preset Visual Theme Cover Image</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=300', tag: 'Corporate' },
                { url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=300', tag: 'Office' },
                { url: 'https://images.unsplash.com/photo-1511632765486-a01c80cf59af?q=80&w=300', tag: 'Townhall' },
                { url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=300', tag: 'Teamwork' },
              ].map((preset, idx) => (
                <button 
                  key={idx}
                  onClick={() => setNewsImage(preset.url)}
                  className={`relative h-14 rounded-lg overflow-hidden border-2 p-0 cursor-pointer
                    ${newsImage === preset.url ? 'border-[#3f809e] ring-2 ring-[#3f809e]/30 scale-102' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={preset.url} className="w-full h-full object-cover" alt="" />
                  <span className="absolute bottom-1 left-1.5 text-[8px] bg-black/60 text-white font-black uppercase px-1 rounded">{preset.tag}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddNews}
              className="px-5 py-2 bg-[#212c46] hover:bg-[#2e3e5f] text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-md cursor-pointer"
            >
              Post Now
            </button>
          </div>
        </div>
      </DraggableModal>

      {/* SHOW HISTORICAL ALL ANNOUNCEMENTS MODAL */}
      <DraggableModal 
        isOpen={isShowAllModalOpen} 
        onClose={() => setIsShowAllModalOpen(false)}
        title={<span className="text-sm font-black uppercase text-[#212c46] tracking-widest flex items-center gap-1.5"><Globe size={16} className="text-[#3f809e]"/> Complete News & Updates Archive</span>}
        width="max-w-3xl"
      >
        <div className="p-6 text-left max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {newsList.map((n, i) => (
                <div key={i} onClick={() => { setIsShowAllModalOpen(false); openNews(n); }} className="flex gap-4 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200/50">
                  <img src={n.image} className="w-20 h-20 rounded-lg object-cover shrink-0 my-auto" alt="" />
                  <div className="min-w-0 flex-1">
                     <span className="text-[8px] font-black bg-[#3f809e]/10 text-[#3f809e] px-2 py-0.5 rounded uppercase tracking-wider">{n.category}</span>
                     <h3 className="text-xs font-bold text-[#212c46] mt-1 mb-0.5 line-clamp-1">{n.title}</h3>
                     <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed mb-1">{n.preview}</p>
                     <span className="text-[9px] text-[#7a8b95] font-semibold">{n.date} · {n.author}</span>
                  </div>
                </div>
             ))}
          </div>
        </div>
      </DraggableModal>
      </>
    );
};

const CorporateAlert = () => {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // Form field states
    const [alertTitle, setAlertTitle] = useState('');
    const [alertDesc, setAlertDesc] = useState('');
    const [alertTheme, setAlertTheme] = useState<'red' | 'blue' | 'amber'>('blue');
    
    const defaultAlerts = [
      { title: 'การประเมินผลงานรอบครึ่งปี', desc: 'Mid-year review starts Monday. Ensure all self-evaluations are done.', icon: 'CalendarDays', color: '#932c2e', bg: '#932c2e26', theme: 'red' },
      { title: 'สวัสดิการประกันกลุ่มใหม่', desc: 'Update on group insurance plan for FY2025 available now.', icon: 'Info', color: '#3f809e', bg: '#3f809e26', theme: 'blue' },
    ];

    useEffect(() => {
        const loadAlerts = async () => {
            try {
                const res = await dbSync.read('CorporateAlerts');
                if (res && res.status === 'success' && res.data && Array.isArray(res.data.items) && res.data.items.length > 0) {
                    setAlerts(res.data.items);
                } else {
                    setAlerts(defaultAlerts);
                    await dbSync.write('CorporateAlerts', defaultAlerts);
                }
            } catch (err) {
                console.error("Failed to load alerts:", err);
                setAlerts(defaultAlerts);
            }
        };
        loadAlerts();
    }, []);

    const handleAddAlert = async () => {
        if (!alertTitle || !alertDesc) {
             MySwal.fire({ icon: 'error', title: 'โปรดกรอกหัวข้อและรายละเอียด' });
             return;
        }

        let icName = 'Info';
        let clr = '#3f809e';
        let bgClr = '#3f809e1e';

        if (alertTheme === 'red') {
             icName = 'AlertCircle';
             clr = '#a94228';
             bgClr = '#a9422818';
        } else if (alertTheme === 'amber') {
             icName = 'Megaphone';
             clr = '#b58c4f';
             bgClr = '#b58c4f1e';
        }

        const newAlert = {
             title: alertTitle,
             desc: alertDesc,
             icon: icName,
             color: clr,
             bg: bgClr,
             theme: alertTheme
        };

        try {
            const updatedAlerts = [newAlert, ...alerts];
            setAlerts(updatedAlerts);
            await dbSync.write('CorporateAlerts', updatedAlerts);
            setIsAddModalOpen(false);

            setAlertTitle('');
            setAlertDesc('');

            MySwal.fire({
                 icon: 'success',
                 title: 'Added Corporate Alert!',
                 showConfirmButton: false,
                 timer: 1500
            });
        } catch (err) {
            console.error(err);
            MySwal.fire({ icon: 'error', title: 'Connection Issue' });
        }
    };

    // Helper to resolve icon from string
    const resolveAlertIcon = (iconName: string) => {
        if (iconName === 'CalendarDays') return CalendarDays;
        if (iconName === 'AlertCircle') return AlertCircle;
        if (iconName === 'Megaphone') return Megaphone;
        return Info;
    };

    return (
      <>
      <GlassCard className="bg-white border-[#f3f3f1] flex flex-col relative overflow-hidden">
        <div className="absolute right-[-5%] bottom-[-5%] opacity-[0.02] pointer-events-none transform -rotate-12 z-0">
          <Megaphone size={220} />
        </div>
        <div className="flex justify-between items-start mb-6 relative z-10 w-full">
          <div className="flex items-center gap-2">
            <Megaphone size={20} className="text-[#932c2e]" />
            <h2 className="text-sm font-black text-[#212c46] uppercase tracking-wide leading-tight text-left">
              CORPORATE<br/>ALERT
            </h2>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="text-[9px] font-black text-white bg-[#a94228] hover:bg-[#8e351f] px-2.5 py-1.5 rounded uppercase tracking-wider transition-colors cursor-pointer"
          >
            ADD UPDATE
          </button>
        </div>
        
        <div className="space-y-4 flex-1 relative z-10 text-left overflow-y-auto max-h-[280px] custom-scrollbar pr-1">
          {alerts.map((alert, i) => {
            const IconComponent = resolveAlertIcon(alert.icon);
            return (
              <div key={i} className="flex items-start gap-3 border border-transparent rounded-xl p-4 transition-all cursor-pointer group hover:-translate-y-0.5 hover:shadow-md" style={{ backgroundColor: alert.bg }}>
                <IconComponent size={16} className="shrink-0 mt-0.5" style={{ color: alert.color }} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[13px] mb-1 leading-tight" style={{ color: alert.color }}>{alert.title}</h3>
                  <p className="text-[10px] font-medium leading-relaxed font-sans" style={{ color: alert.color, opacity: 0.85 }}>{alert.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* CREATE ALERT MODAL */}
      <DraggableModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title={<span className="text-sm font-black uppercase text-[#212c46] tracking-widest flex items-center gap-1.5"><Megaphone size={16} className="text-[#a94228]"/> Broadcast Instant Alert</span>}
        width="max-w-md"
      >
        <div className="p-6 space-y-4 text-left font-sans">
          <div>
            <label className="block text-[9px] font-black text-[#212c46] uppercase tracking-wider mb-1.5">Alert Header / Title*</label>
            <input 
              type="text" 
              value={alertTitle} 
              onChange={(e) => setAlertTitle(e.target.value)}
              placeholder="e.g. ปิดปรับปรุงลานจอดรถ P3 เสาร์นี้"
              className="w-full px-3 py-2 border border-[#ccd0db] rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#212c46]"
            />
          </div>

          <div>
            <label className="block text-[9px] font-black text-[#212c46] uppercase tracking-wider mb-1.5">Notification Theme Alert Color</label>
            <select 
              value={alertTheme}
              onChange={(e) => setAlertTheme(e.target.value as any)}
              className="w-full px-3 py-2 bg-white border border-[#ccd0db] rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#212c46]"
            >
              <option value="blue">Blue (General Benefit/Insurance Info)</option>
              <option value="amber">Amber (Important Announcement/Meeting)</option>
              <option value="red">Red (Urgent Alert/Deadline)</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-black text-[#212c46] uppercase tracking-wider mb-1.5">Brief Description / Guide content*</label>
            <textarea 
              value={alertDesc} 
              onChange={(e) => setAlertDesc(e.target.value)}
              placeholder="Provide context and action items..."
              className="w-full h-20 p-3 border border-[#ccd0db] rounded-xl text-xs outline-none resize-none font-medium"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddAlert}
              className="px-5 py-2 bg-[#212c46] hover:bg-[#2d3a56] text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-md cursor-pointer"
            >
              Broadcast Alert
            </button>
          </div>
        </div>
      </DraggableModal>
      </>
    );
};



const BASELINE_LOGS = [
  { id: 'att-log-1', employeeId: 'U001', date: '2026-06-04', checkIn: '08:15', checkOut: '17:30', status: 'Present', hours: 9.25, shift: 'Regular Shift', mode: 'Office' },
  { id: 'att-log-2', employeeId: 'U002', date: '2026-06-04', checkIn: '08:29', checkOut: '17:45', status: 'Present', hours: 9.25, shift: 'Regular Shift', mode: 'Office' },
  { id: 'att-log-3', employeeId: 'U003', date: '2026-06-04', checkIn: '08:45', checkOut: '17:00', status: 'Late', hours: 8.25, shift: 'Regular Shift', mode: 'Office' },
  { id: 'att-log-4', employeeId: 'U004', date: '2026-06-04', checkIn: '08:00', checkOut: '17:00', status: 'Present', hours: 9.0, shift: 'Regular Shift', mode: 'Remote' },
  { id: 'att-log-5', employeeId: 'U005', date: '2026-06-04', checkIn: '', checkOut: '', status: 'Leave', hours: 0, shift: 'Regular Shift', mode: 'Office' },
  { id: 'att-log-6', employeeId: 'U001', date: '2026-06-03', checkIn: '08:10', checkOut: '17:30', status: 'Present', hours: 9.4, shift: 'Regular Shift', mode: 'Office' },
  { id: 'att-log-7', employeeId: 'U002', date: '2026-06-03', checkIn: '08:15', checkOut: '17:30', status: 'Present', hours: 9.25, shift: 'Regular Shift', mode: 'Office' },
  { id: 'att-log-8', employeeId: 'U003', date: '2026-06-03', checkIn: '08:35', checkOut: '17:05', status: 'Late', hours: 8.5, shift: 'Regular Shift', mode: 'Office' },
  { id: 'att-log-9', employeeId: 'U001', date: '2026-06-02', checkIn: '08:12', checkOut: '17:30', status: 'Present', hours: 9.3, shift: 'Regular Shift', mode: 'Office' },
  { id: 'att-log-10', employeeId: 'U002', date: '2026-06-02', checkIn: '08:14', checkOut: '17:30', status: 'Present', hours: 9.25, shift: 'Regular Shift', mode: 'Office' },
];

export default function Home() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // --- Dynamic calculations for Recharts ---
  const departmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    employees.forEach(emp => {
      const dept = emp.department || 'Other';
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [employees]);

  const leaveTrends = useMemo(() => {
    const counts: Record<string, number> = {
      'Vacation': 0,
      'Sick': 0,
      'Business': 0,
      'Other': 0
    };
    leaves.forEach(leave => {
      const type = (leave.type || '').toLowerCase();
      const dbDays = Number(leave.days) || 1;
      if (type.includes('vacation')) {
        counts['Vacation'] += dbDays;
      } else if (type.includes('sick')) {
        counts['Sick'] += dbDays;
      } else if (type.includes('business') || type.includes('personal')) {
        counts['Business'] += dbDays;
      } else {
        counts['Other'] += dbDays;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [leaves]);

  const turnoverData = [
    { name: 'Jan', rate: 1.2 },
    { name: 'Feb', rate: 0.8 },
    { name: 'Mar', rate: 1.5 },
    { name: 'Apr', rate: 0.5 },
    { name: 'May', rate: 1.1 },
    { name: 'Jun', rate: 0.9 }
  ];

  const CHART_COLORS = [
    '#254268', // Deep corporate Navy
    '#b58c4f', // Warm golden
    '#5f7ab7', // Sky Blue accent
    '#a73527', // Alert contrast
    '#657f4d', // Soft Sage Green
    '#748ea1', // Clean Slate
  ];

  // Load backend data for calculations
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const leavesRes = await dbSync.read('LeaveRequests');
        if (leavesRes && leavesRes.status === 'success' && leavesRes.data) {
          setLeaves(leavesRes.data.items || []);
        }
        const empRes = await dbSync.read('employees');
        if (empRes && empRes.status === 'success' && empRes.data) {
          setEmployees(empRes.data.items || []);
        }
        
        // Fetch real-time attendance logs
        const attRes = await dbSync.read('Attendance');
        if (attRes && attRes.status === 'success' && attRes.data && attRes.data.items && attRes.data.items.length > 0) {
          setAttendance(attRes.data.items);
        } else {
          setAttendance(BASELINE_LOGS);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentUser = {
      name: user?.name || 'SMART LAW Developer',
      position: user?.role || 'LEAD COUNSEL',
      avatar: user?.avatar || 'https://drive.google.com/thumbnail?id=1Z_fRbN9S4aA7OkHb3mlim_t60wIT4huY&sz=w400'
  };

  // Find corresponding employee details
  const matchedEmployee = useMemo(() => {
    if (!user) return null;
    return employees.find(
      (emp) => 
        emp.employeeId === user.employeeId || 
        emp.email?.toLowerCase() === user.email?.toLowerCase() ||
        emp.name?.toLowerCase().includes(user.name?.toLowerCase())
    );
  }, [employees, user]);

  const targetName = matchedEmployee?.name || user?.name || '';

  // Calculate dynamic remaining leave balances based on approved requests
  const leaveStats = useMemo(() => {
    const caps = {
      Vacation: 12,
      Sick: 30,
      Business: 7
    };

    const taken = {
      Vacation: 0,
      Sick: 0,
      Business: 0
    };

    if (targetName) {
      // Direct exact match & sub-string matches
      const targetClean = targetName.toLowerCase().replace(/\s+/g, '');
      const userApprovedLeaves = leaves.filter(l => {
        if (!l.employeeName || l.status !== 'Approved') return false;
        const leaveClean = l.employeeName.toLowerCase().replace(/\s+/g, '');
        return leaveClean === targetClean || leaveClean.includes(targetClean) || targetClean.includes(leaveClean);
      });

      userApprovedLeaves.forEach(l => {
        const type = l.type || '';
        const days = Number(l.days) || 0;
        if (type.toLowerCase().includes('vacation')) {
          taken.Vacation += days;
        } else if (type.toLowerCase().includes('sick')) {
          taken.Sick += days;
        } else if (type.toLowerCase().includes('business') || type.toLowerCase().includes('personal')) {
          taken.Business += days;
        }
      });
    }

    return {
      vacationTotal: caps.Vacation,
      vacationTaken: taken.Vacation,
      vacationLeft: Math.max(0, caps.Vacation - taken.Vacation),

      sickTotal: caps.Sick,
      sickTaken: taken.Sick,
      sickLeft: Math.max(0, caps.Sick - taken.Sick),

      businessTotal: caps.Business,
      businessTaken: taken.Business,
      businessLeft: Math.max(0, caps.Business - taken.Business),
    };
  }, [leaves, targetName]);

  // --- LEAVE ACTIONS & APPROVALS HUB ---
  const handleLeaveApproval = async (reqId: string, action: 'Approved' | 'Rejected') => {
      try {
          const updated = leaves.map((l: any) => l.id === reqId ? { ...l, status: action } : l);
          setLeaves(updated);
          await dbSync.write('LeaveRequests', updated);
          
          MySwal.fire({
              title: action === 'Approved' ? t('Approve') : t('Reject'),
              text: `${t('Leave request has been')} ${t(action).toLowerCase()} ${t('successfully')}.`,
              icon: 'success',
              timer: 1500,
              showConfirmButton: false,
              toast: true,
              position: 'top-end'
          });
      } catch (e) {
          console.error(e);
          MySwal.fire({
              title: 'Error',
              text: 'Failed to process request.',
              icon: 'error'
          });
      }
  };

  // --- SEED TODAY'S ATTENDANCE ---
  const seedTodaysAttendance = async () => {
      const realTodayStr = new Date().toISOString().split('T')[0];
      const seedLogs = [
          { id: `att-seed-${Date.now()}-1`, employeeId: 'U001', date: realTodayStr, checkIn: '08:14', checkOut: '17:30', status: 'Present', hours: 9.2, shift: 'Regular Shift', mode: 'Office' },
          { id: `att-seed-${Date.now()}-2`, employeeId: 'U002', date: realTodayStr, checkIn: '08:28', checkOut: '17:35', status: 'Present', hours: 9.1, shift: 'Regular Shift', mode: 'Office' },
          { id: `att-seed-${Date.now()}-3`, employeeId: 'U003', date: realTodayStr, checkIn: '08:44', checkOut: '17:01', status: 'Late', hours: 8.3, shift: 'Regular Shift', mode: 'Office' },
          { id: `att-seed-${Date.now()}-4`, employeeId: 'U004', date: realTodayStr, checkIn: '08:02', checkOut: '', status: 'Present', hours: 4.0, shift: 'Regular Shift', mode: 'Remote' },
          { id: `att-seed-${Date.now()}-5`, employeeId: 'U005', date: realTodayStr, checkIn: '', checkOut: '', status: 'Leave', hours: 0, shift: 'Regular Shift', mode: 'Office' },
      ];

      try {
          const updated = [...attendance, ...seedLogs];
          setAttendance(updated);
          await dbSync.write('Attendance', updated);
          MySwal.fire({
              title: t('Today'),
              text: 'Generated realistic attendance logs for today! Real-time metrics successfully calibrated.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
          });
      } catch (e) {
          console.error(e);
      }
  };

  const filteredPending = useMemo(() => {
    return leaves.filter((l: any) => l.status === 'Pending').slice(0, 3);
  }, [leaves]);

  const targetDateStr = useMemo(() => {
    let dStr = new Date().toISOString().split('T')[0];
    if (attendance.length > 0) {
        const dates = attendance.map(a => a.date).filter(Boolean);
        if (dates.length > 0) {
            dStr = dates.reduce((a, b) => a > b ? a : b);
        }
    }
    return dStr;
  }, [attendance]);

  const attendanceStats = useMemo(() => {
    const targetLogs = attendance.filter(a => a.date === targetDateStr);
    const stats = {
        present: 0,
        late: 0,
        leave: 0,
        absent: 0
    };

    targetLogs.forEach((l: any) => {
        const stat = (l.status || '').toLowerCase();
        if (stat === 'present') stats.present++;
        else if (stat === 'late') stats.late++;
        else if (stat === 'leave') stats.leave++;
        else if (stat === 'absent') stats.absent++;
    });

    const totalUsers = targetLogs.length || 1;
    const attendanceRate = Math.round(((stats.present + stats.late) / totalUsers) * 100);

    return { stats, targetLogs, attendanceRate };
  }, [attendance, targetDateStr]);

  return (
    <div className="pt-4 flex flex-col gap-5 animate-fadeIn px-4 sm:px-8 w-full pb-6">
      <div className="flex flex-row justify-between items-center gap-4">
          <div className="flex flex-col justify-center">
              <h1 className="text-3xl md:text-4xl text-[#212c46] tracking-tight uppercase font-exception-greeting leading-none">
                  Morning, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b58c4f] to-[#8e9141] font-medium">{currentUser.name}!</span>
              </h1>
              <p className="text-[#748ea1] text-[10px] font-black uppercase tracking-widest mt-2 flex items-center gap-1.5 leading-none">
                  <TrendingUp size={14} className="text-[#d96245]" /> Compliance Rate: <span className="text-[#3f809e]">High (98.2%)</span>
              </p>
          </div>
          <div className="flex flex-row gap-3">
              <button className="bg-white text-[#212c46] px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md border border-[#cdd0db]/50 transition-all flex items-center gap-2 hover:-translate-y-0.5 whitespace-nowrap">
                  <FileSearch size={16} className="text-[#3f809e]" /> <span className="hidden sm:inline">Case Lookup</span>
              </button>
              <button className="bg-gradient-to-r from-[#3f809e] via-[#4d87a8] to-[#748ea1] text-white px-7 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all flex items-center gap-2 whitespace-nowrap">
                  <Scale size={16} /> <span className="hidden sm:inline">New Case File</span>
              </button>
          </div>
      </div>

      <HeroBanner />

      {/* 3-Column Bento Grid: Stacked KPIs, Pending Leaves, Today's Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: KPIs stacked vertically */}
          <div className="flex flex-col gap-4">
              {MOCK_STATS.map((stat, idx) => (
                  <MetricCard key={idx} {...stat} val={stat.value} desc={stat.sub} />
              ))}
          </div>

          {/* Column 2: Pending Leave Requests */}
          <GlassCard className="relative flex flex-col justify-between border-[#eaeaec]/60 overflow-hidden min-h-[380px]" hoverEffect={true}>
              <div className="space-y-4 flex-1 flex flex-col">
                  {/* Widget header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-[#4d87a8]/10 text-[#4d87a8] rounded-lg">
                              <ClipboardList size={16} className="text-[#3f809e]"/>
                          </div>
                          <div className="text-left">
                              <h3 className="text-[11px] font-black text-[#212c46] uppercase tracking-wider">{t('Pending Leave Requests')}</h3>
                              <p className="text-[8px] text-[#748ea1] font-bold uppercase tracking-widest leading-none mt-0.5">{t('Approvals')}</p>
                          </div>
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                          {leaves.filter((l: any) => l.status === 'Pending').length} {t('Pending')}
                      </span>
                  </div>

                  {/* Leave content */}
                  <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[280px] pr-1">
                      {isLoading ? (
                          <div className="flex flex-col items-center justify-center py-12 gap-2 text-[#7a8b95]">
                              <div className="w-5 h-5 border-2 border-[#3f809e] border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-[8px] font-black uppercase tracking-wider">Syncing database...</span>
                          </div>
                      ) : filteredPending.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-[#7a8b95] text-center border border-dashed border-[#eaeaec] rounded-xl bg-slate-50/20">
                              <CheckCircle2 size={24} className="text-[#657f4d] opacity-50 mb-2 animate-pulse" />
                              <span className="text-[10px] font-black uppercase tracking-wider">{t('All Clear')}!</span>
                              <p className="text-[8.5px] text-slate-400 mt-0.5 uppercase tracking-wider font-bold">No pending leave requests left to clear</p>
                          </div>
                      ) : (
                          filteredPending.map((req: any, index: number) => {
                              const empInfo = employees.find((e: any) => e.name === req.employeeName);
                              return (
                                  <div key={req.id || index} className="p-3 bg-slate-50 border border-[#f3f3f1] rounded-xl flex flex-col gap-2 transition-all hover:bg-white hover:border-[#3f809e]/30 shadow-2xs">
                                      <div className="flex items-center gap-2">
                                          <img 
                                              src={empInfo?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150'} 
                                              alt={req.employeeName} 
                                              className="w-8 h-8 rounded-full border border-white shadow-sm object-cover" 
                                          />
                                          <div className="min-w-0 flex-1 text-left">
                                              <span className="block text-[11px] font-extrabold text-[#212c46] leading-tight truncate">{req.employeeName}</span>
                                              <span className="block text-[8px] font-black uppercase tracking-widest text-[#748ea1] mt-0.5 leading-none">
                                                  {empInfo?.department || 'Operations'} • {empInfo?.position || 'Staff'}
                                              </span>
                                          </div>
                                      </div>
                                      <div className="flex items-center justify-between text-[10px] font-extrabold border-t border-slate-100 pt-1.5 mt-0.5 text-left">
                                          <div className="flex flex-col text-left">
                                              <span className="text-amber-600 block text-[9.5px]">🏝️ {req.type}</span>
                                              <span className="text-[8.5px] text-[#748ea1] mt-0.5 leading-none">{req.startDate} {t('to')} {req.endDate}</span>
                                          </div>
                                          <span className="text-slate-800 shrink-0 bg-slate-100/80 px-2 py-0.5 rounded-md font-mono">{req.days} {t('days')}</span>
                                      </div>
                                      <p className="text-[9.5px] text-slate-600 italic bg-white border border-slate-100 px-2 py-1 rounded-md mt-1 leading-snug font-sans text-left">"{req.reason || 'No reason provided'}"</p>
                                      
                                      <div className="grid grid-cols-2 gap-2 mt-1 pt-1.5 border-t border-slate-100">
                                          <button 
                                              onClick={() => handleLeaveApproval(req.id, 'Rejected')}
                                              className="w-full py-1.5 border border-[#932c2e]/20 text-[#932c2e] hover:bg-[#932c2e]/10 rounded-lg text-[8.5px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                                          >
                                              {t('Reject')}
                                          </button>
                                          <button 
                                              onClick={() => handleLeaveApproval(req.id, 'Approved')}
                                              className="w-full py-1.5 bg-[#212c46] hover:bg-[#2e3e60] text-white rounded-lg text-[8.5px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                                          >
                                              {t('Approve')}
                                          </button>
                                      </div>
                                  </div>
                              );
                          })
                      )}
                  </div>
              </div>
          </GlassCard>

          {/* Column 3: Today's Attendance */}
          <GlassCard className="relative flex flex-col justify-between border-[#eaeaec]/60 overflow-hidden min-h-[380px]" hoverEffect={true}>
              <div className="space-y-4 flex-1 flex flex-col">
                  {/* Widget header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-[#b58c4f]/10 text-[#b58c4f] rounded-lg">
                              <Clock size={16} className="text-[#b58c4f]"/>
                          </div>
                          <div className="text-left">
                              <h3 className="text-[11px] font-black text-[#212c46] uppercase tracking-wider">{t("Today's Attendance")}</h3>
                              <p className="text-[8px] text-[#748ea1] font-bold uppercase tracking-widest leading-none mt-0.5">{t('Daily Shift Metrics')}</p>
                          </div>
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-[#b58c4f] bg-[#b58c4f]/15 border border-[#b58c4f]/20 px-2 py-0.5 rounded-full shrink-0">
                          {targetDateStr}
                      </span>
                  </div>

                  {/* Attendance content */}
                  <div className="space-y-3.5 flex-1 flex flex-col min-h-0">
                      {/* Metric Circular Progress bar with simple radial indicator */}
                      <div className="flex items-center justify-around bg-slate-50 border border-[#f3f3f1] rounded-2xl p-3 shadow-2xs shrink-0">
                          <div className="relative w-16 h-16 flex items-center justify-center">
                              {/* Simple SVG Circle */}
                              <svg className="w-full h-full transform -rotate-90">
                                  <circle className="text-slate-200" strokeWidth="4" stroke="currentColor" fill="transparent" r="24" cx="32" cy="32"/>
                                  <circle className="text-[#b58c4f]" strokeWidth="4" strokeDasharray={150.79} strokeDashoffset={150.79 - (150.79 * attendanceStats.attendanceRate) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="24" cx="32" cy="32"/>
                              </svg>
                              <span className="absolute text-xs font-black text-[#212c46]">{attendanceStats.attendanceRate}%</span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-left shrink-0">
                              <div className="flex flex-col text-left">
                                  <span className="text-[11px] font-extrabold text-emerald-600 leading-tight">Present: {attendanceStats.stats.present}</span>
                                  <span className="text-[7.5px] text-[#748ea1] font-black uppercase">On Time</span>
                              </div>
                              <div className="flex flex-col text-left">
                                  <span className="text-[11px] font-extrabold text-amber-500 leading-tight">Late: {attendanceStats.stats.late}</span>
                                  <span className="text-[7.5px] text-[#748ea1] font-black uppercase">Delay Alert</span>
                              </div>
                              <div className="flex flex-col text-left">
                                  <span className="text-[11px] font-extrabold text-[#3f809e] leading-tight">Leave: {attendanceStats.stats.leave}</span>
                                  <span className="text-[7.5px] text-[#748ea1] font-black uppercase">Approved</span>
                              </div>
                              <div className="flex flex-col text-left">
                                  <span className="text-[11px] font-extrabold text-[#932c2e] leading-tight">Absent: {attendanceStats.stats.absent}</span>
                                  <span className="text-[7.5px] text-[#748ea1] font-black uppercase">No Checkin</span>
                              </div>
                          </div>
                      </div>

                      {/* Display recent attendance log items */}
                      <div className="flex-1 overflow-y-auto max-h-[240px] space-y-2 pr-1">
                          {attendanceStats.targetLogs.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-6 text-[#7a8b95] text-center border border-dashed border-[#eaeaec] rounded-xl">
                                  <AlertCircle size={20} className="opacity-40 mb-1" />
                                  <span className="text-[9px] font-black uppercase tracking-wider">No logs listed for today</span>
                                  <button 
                                      onClick={seedTodaysAttendance}
                                      className="mt-2 px-3 py-1 bg-[#212c46] text-white text-[8px] font-black uppercase rounded-md tracking-wider transition-all hover:bg-slate-800 cursor-pointer"
                                  >
                                      💡 Core Seed Test Log
                                  </button>
                              </div>
                          ) : (
                              attendanceStats.targetLogs.slice(0, 4).map((log: any) => {
                                  const emp = employees.find((e: any) => e.employeeId === log.employeeId);
                                  const isLate = log.status === 'Late';
                                  const isLeave = log.status === 'Leave';
                                  
                                  return (
                                      <div key={log.id} className="p-2 border border-[#f3f3f1] rounded-xl bg-white/70 hover:bg-white transition-all flex items-center justify-between text-left shadow-3xs hover:shadow-2xs">
                                          <div className="flex items-center gap-2 min-w-0">
                                              <img 
                                                  src={emp?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150'} 
                                                  alt="Avatar" 
                                                  className="w-7 h-7 rounded-lg object-cover shrink-0 border border-slate-100" 
                                              />
                                              <div className="min-w-0 flex-1">
                                                  <span className="block text-[10px] font-extrabold text-[#212c46] truncate">{emp?.name?.split(' (')[0] || log.employeeId}</span>
                                                  <span className="block text-[8px] text-[#748ea1] leading-none mt-0.5">{log.shift} • {log.mode}</span>
                                              </div>
                                          </div>
                                          
                                          <div className="text-right shrink-0">
                                              <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                                  isLate ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                  isLeave ? 'bg-sky-50 text-sky-600' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                              }`}>
                                                  {log.checkIn || 'No-In'} {isLeave ? 'Leave' : ''}
                                              </span>
                                              <span className="block text-[7px] text-[#748ea1] font-bold mt-0.5 font-mono">{log.checkOut || 'Active'}</span>
                                          </div>
                                      </div>
                                  );
                              })
                          )}
                      </div>
                  </div>
              </div>
          </GlassCard>
      </div>

      <CorporateAnnouncementsCarousel />

      {/* Visual Workspace Shortcuts (Explore by Sector Layout - 2 Rows x 6 Columns) */}
      <div 
         className="bg-white border border-[#f3f3f1] rounded-3xl p-6 backdrop-blur-xl shadow-[0_8px_30px_rgba(31,42,68,0.06)] space-y-6 relative overflow-hidden"
         style={{ backgroundColor: THEME.glassWhite }}
      >
         <div className="absolute top-0 right-0 w-32 h-32 bg-[#3f809e]/5 rounded-full blur-2xl pointer-events-none" />
         <div>
            <h3 className="text-sm font-black text-[#212c46] tracking-wider uppercase mb-1 flex items-center gap-2">
               <Compass size={18} className="text-[#3f809e]" /> Explore by sector / สำรวจแยกตามหมวดหมู่
            </h3>
            <p className="text-[10px] text-[#55697d] uppercase font-black tracking-widest">Quick shortcut hubs to central database sectors and processes</p>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Health Clearance', sub: 'ประวัติ/จำหน่ายสุขภาพ', icon: Heart, href: '/employees/offboarding', color: 'text-[#3f809e]', isHighlight: false },
              { label: 'AI HR Copilot', sub: 'ปัญญาประดิษฐ์สืบค้น', icon: BrainCircuit, href: '/copilot', color: 'text-[#3f809e]', isHighlight: false }, // IT & techs red card match!
              { label: 'Leave & Absences', sub: 'คำขอลางานและประวัติ', icon: ArrowLeftRight, href: '/leave', color: 'text-[#3f809e]', isHighlight: false },
              { label: 'Safety & Risks', sub: 'การอนุมัติ/ความปลอดภัย', icon: ShieldAlert, href: '/permissions', color: 'text-[#3f809e]', isHighlight: false },
              { label: 'Calendar Grid', sub: 'รอบวันกิจกรรมบริษัท', icon: Calendar, href: '/hr-calendar', color: 'text-[#3f809e]', isHighlight: false },
              { label: 'Attendance Node', sub: 'ระบบลงเวลาเข้าทำงาน', icon: Zap, href: '/attendance', color: 'text-[#3f809e]', isHighlight: false },
              { label: 'Staff Directory', sub: 'สำรวจแผนกรายพนักงาน', icon: Users, href: '/employees/directory', color: 'text-[#3f809e]', isHighlight: false },
              { label: 'Legal Digest AI', sub: 'วิเคราะห์กฎหมาย/ข้อตกลง', icon: FileText, href: '/doc-summarizer', color: 'text-[#3f809e]', isHighlight: false },
              { label: 'Payroll & Master', sub: 'สิทธิประโยชน์พนักงาน', icon: Gift, href: '/payroll', color: 'text-[#3f809e]', isHighlight: false },
              { label: 'Config Panel', sub: 'ตั้งค่าโครงสร้างฐานข้อมูล', icon: Database, href: '/settings', color: 'text-[#3f809e]', isHighlight: false },
              { label: 'Onboarding Portal', sub: 'ต้อนรับพนักงานเข้ามาใหม่', icon: Briefcase, href: '/employees/onboarding', color: 'text-[#3f809e]', isHighlight: false },
              { label: 'Contract Manager', sub: 'สัญญาจ้างและสัจพจน์', icon: Settings, href: '/employees/salary-master', color: 'text-[#3f809e]', isHighlight: false }
            ].map((shortcut, idx) => {
               const IconComponent = shortcut.icon;
               return (
                  <a
                     key={idx}
                     href={shortcut.href}
                     className={`group flex flex-col items-center text-center justify-center py-6 px-4 rounded-xl border transition-all duration-300 hover:scale-[1.03] select-none hover:shadow-lg cursor-pointer ${
                        shortcut.isHighlight 
                           ? 'bg-gradient-to-r from-[#3f809e] to-[#4d87a8] border-[#3f809e] text-white shadow-lg shadow-[#3f809e]/30 hover:from-[#35708c] hover:to-[#437996]' 
                           : 'bg-white/95 border-[#dae0e9] text-slate-800 hover:border-[#3f809e] hover:bg-gradient-to-r hover:from-[#3f809e] hover:to-[#4d87a8] hover:text-white hover:shadow-[#3f809e]/30'
                     }`}
                  >
                     <div className={`mb-3 transition-transform duration-300 group-hover:scale-110 ${shortcut.isHighlight ? 'text-white' : shortcut.color + ' group-hover:text-white'}`}>
                        <IconComponent size={32} strokeWidth={2} />
                     </div>
                     <span className={`text-[12px] font-black uppercase tracking-tight block transition-colors duration-300 ${shortcut.isHighlight ? 'text-white' : 'text-slate-800 group-hover:text-white'}`}>
                        {shortcut.label}
                     </span>
                     <span className={`text-[9px] font-bold block mt-1.5 leading-none transition-colors duration-300 ${shortcut.isHighlight ? 'text-white/80' : 'text-[#748ea1] group-hover:text-white/90'}`}>
                        {shortcut.sub}
                     </span>
                  </a>
               );
            })}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <NewFamilyMembers />
          <UpcomingBirthdaysAndAnniversaries />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <CorporateNews />
          <CorporateAlert />
      </div>
    </div>
  );
}
