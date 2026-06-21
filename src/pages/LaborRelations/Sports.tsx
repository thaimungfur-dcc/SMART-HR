import { UserGuidePanel } from '../../components/shared/UserGuidePanel';
import KpiCard from '../../components/shared/KpiCard';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Trophy, Users, Megaphone, Globe, BarChart3, Search, Filter, Plus, 
  ChevronLeft, ChevronRight, Edit3, Trash2, HelpCircle, X, CheckCircle2, 
  Calendar, Save, Info, Smile, Send, ArrowUpRight, 
  MessageSquare, ClipboardCheck, BrainCircuit, Target, 
  Settings, ChevronDown, AlertTriangle, DollarSign, Share2, Sparkles, Building2
} from 'lucide-react';
import { DraggableModal } from '../../components/shared/DraggableModal';

// --- Theme Style Configuration (Premium Industrial Earth-tones Match Home & UserPermissions) ---
const THEME = {
  bgMain: 'transparent',
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

const MOCK_EVENTS = [
  { 
    id: 'EVT-2024-001', 
    title: 'Tamarind Cup 2024 (ฟุตบอลเชื่อมสัมพันธ์)', 
    category: 'Sports', 
    budget: 45000, 
    participants: 120, 
    status: 'Planned', 
    date: '2024-06-15',
    reach: '85%',
    responsible: 'HR Welfare'
  },
  { 
    id: 'EVT-2024-002', 
    title: 'CSR: ปลูกป่าชายเลน จังหวัดสมุทรสงคราม', 
    category: 'External', 
    budget: 28000, 
    participants: 45, 
    status: 'In Progress', 
    date: '2024-05-20',
    reach: '100%',
    responsible: 'Admin'
  },
  { 
    id: 'PR-2024-003', 
    title: 'ประกาศนโยบาย Work from Anywhere 2.0', 
    category: 'Internal PR', 
    budget: 500, 
    participants: 1500, 
    status: 'Released', 
    date: '2024-04-01',
    reach: '98%',
    responsible: 'Communications'
  },
  { 
    id: 'EVT-2024-004', 
    title: 'สงกรานต์หรรษา พาลูกหลานเที่ยวออฟฟิศ', 
    category: 'Social', 
    budget: 15000, 
    participants: 200, 
    status: 'Completed', 
    date: '2024-04-12',
    reach: '92%',
    responsible: 'HR Engagement'
  }
];

interface EventRecord {
  id?: string;
  title: string;
  category: string;
  budget: number;
  participants: number;
  status: string;
  date: string;
  reach: string;
  responsible: string;
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventRecord | null;
  onSave: (event: EventRecord) => void;
}

const EventModal = ({ isOpen, onClose, event: activeEvent, onSave }: EventModalProps) => {
  const [formData, setFormData] = useState<EventRecord>({ 
    title: '', category: 'Sports', budget: 15000, participants: 100, status: 'Planned', date: '', reach: '0%', responsible: 'HR'
  });

  useEffect(() => {
    if (activeEvent) {
      setFormData({ ...activeEvent });
    } else {
      setFormData({ 
        title: '', category: 'Sports', budget: 15000, participants: 100, status: 'Planned', date: '', reach: '0%', responsible: 'HR Welfare'
      });
    }
  }, [activeEvent, isOpen]);

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
                  <Trophy size={20} className="text-[#b58c4f]"/>
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest">
                  {activeEvent ? 'Modify Activity Registry' : 'Launch New Activity Node'}
                </h3>
              </div>
              <button type="button" onClick={onClose} className="hover:text-[#b22026] text-white/70 transition-colors p-1.5 bg-white/10 hover:bg-white/20 rounded-full"><X size={16}/></button>
            </div>
        }
    >
        <div className="flex-1 flex flex-col overflow-hidden bg-white max-h-[75vh]">
          <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest ml-1">Activity Title (ชื่อแผนงาน)</label>
              <div className="relative">
                <Trophy size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3f809e]"/>
                <input 
                  type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full pl-11 pr-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#3f809e] text-[12px] font-bold text-[#212c46]"
                  placeholder="ระบุชื่อแผนงาน หรือ หัวข้อประชาสัมพันธ์..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest ml-1">Activity Category (หมวดหมู่)</label>
                <select 
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#3f809e] text-[12px] font-bold cursor-pointer text-[#212c46]"
                >
                  <option value="Sports">Sports (กิจกรรมกีฬา)</option>
                  <option value="Social">Social (สวัสดิการส่งรักษาความสุข)</option>
                  <option value="Internal PR">Internal PR (ประชาสัมพันธ์ภายใน)</option>
                  <option value="External">External / CSR (กิจกรรมสาธารณะประโยชน์)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest ml-1">Lifecycle Status (สถานะ)</label>
                <select 
                  value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#3f809e] text-[12px] font-bold cursor-pointer text-[#212c46]"
                >
                  <option value="Planned">Planned (วางแผนงาน)</option>
                  <option value="In Progress">In Progress (กำลังดำเนินการ)</option>
                  <option value="Released">Released (ประกาศใช้แล้ว)</option>
                  <option value="Completed">Completed (เสร็จสิ้นบันทึกผล)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest ml-1">Schedule Date (วันจัดกิจกรรม)</label>
                <div className="relative">
                  <Calendar size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b58c4f]"/>
                  <input 
                    type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full pl-11 pr-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#3f809e] text-[12px] font-bold text-[#212c46]"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest ml-1">Responsible Unit (หน่วยงานดูแล)</label>
                <input 
                  type="text" value={formData.responsible} onChange={e => setFormData({...formData, responsible: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#3f809e] text-[12px] font-bold text-[#212c46]"
                  placeholder="e.g. HR Welfare"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#508660] uppercase tracking-widest ml-1">Budget Allocation (งบประมาณ)</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#508660]"/>
                  <input 
                    type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: Number(e.target.value)})}
                    className="w-full pl-10 pr-4 py-2 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#508660] text-[12px] font-bold text-[#212c46]"
                    placeholder="e.g. 15000"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#3f809e] uppercase tracking-widest ml-1">Participants (ผู้เข้าร่วม)</label>
                <input 
                  type="number" value={formData.participants} onChange={e => setFormData({...formData, participants: Number(e.target.value)})}
                  className="w-full px-4 py-2 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#3f809e] text-[12px] font-bold text-[#212c46]"
                  placeholder="e.g. 120"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#b58c4f] uppercase tracking-widest ml-1">PR Reach Rate (%)</label>
                <input 
                  type="text" value={formData.reach} onChange={e => setFormData({...formData, reach: e.target.value})}
                  className="w-full px-4 py-2 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#3f809e] text-[12px] font-bold text-[#212c46]"
                  placeholder="e.g. 95%"
                />
              </div>
            </div>

            <div className="p-4 bg-[#b58c4f]/15 border border-[#b58c4f]/30 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-[#b58c4f]/25 shadow-xs shrink-0">
                  <Megaphone size={18} className="text-[#b58c4f]"/>
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase text-[#212c46] tracking-wider block">Staff Mobile Broadcast</span>
                  <p className="text-[9px] font-bold text-[#606a5f]">Sync notification feed and broadcast news feed to TamarindPro App</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#508660]">Active Sync</span>
                <div className="w-9 h-5 rounded-full bg-[#508660] relative">
                  <div className="absolute top-0.5 right-[2px] w-4 h-4 bg-white rounded-full shadow-xs"/>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-[#f8fafc] border-t border-slate-100 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-1.5 text-[9px] text-[#7a8b95] font-mono font-black uppercase tracking-widest">
              <Info size={13}/> All activity nodes undergo audit processes to comply with company transparency standard
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

export default function SportsSocialEvents() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; event: EventRecord | null }>({ isOpen: false, event: null });
  const [events, setEvents] = useState<EventRecord[]>(MOCK_EVENTS);
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
    const counts: Record<string, number> = { All: events.length };
    events.forEach(e => counts[e.category] = (counts[e.category] || 0) + 1);
    return counts;
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => 
      (activeFilter === 'All' || e.category === activeFilter) &&
      (e.title.toLowerCase().includes(search.toLowerCase()) || (e.id && e.id.toLowerCase().includes(search.toLowerCase())))
    );
  }, [events, search, activeFilter]);

  const handleSave = (eventData: EventRecord) => {
    if (eventData.id) {
      setEvents(events.map(e => e.id === eventData.id ? eventData : e));
      setToast('อัปเดตกิจกรรมสวัสดิการพนักงานสำเร็จเรียบร้อยค่ะ');
    } else {
      const newEvent = { 
        ...eventData, 
        id: `EVT-2024-${Math.floor(100 + Math.random() * 900)}`, 
        participants: eventData.participants || 0,
        reach: eventData.reach || '0%'
      };
      setEvents([newEvent, ...events]);
      setToast('เพิ่มแผนงาน/โครงสร้างกิจกรรมสวัสดิการชิ้นใหม่สำเร็จค่ะ');
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = (id: string) => {
    if(window.confirm('ต้องการลบแผนงานสวัสดิการกิจกรรมข้อนี้? ประวัติทั้งหมดจะถูกจัดเก็บเข้าคลังสำรองแบบ Off-line ค่ะ')) {
        setEvents(events.filter(e => e.id !== id));
        setToast('ลบรายละเอียดกลุ่มกิจกรรมสำเร็จเรียบร้อย');
        setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="flex flex-1 w-full flex-col animate-fadeIn bg-transparent space-y-4 pb-6 min-h-0">
      {/* USER GUIDE FLOATING TRIGGER PRECISELY POSITIONED */}
      {typeof document !== 'undefined' && createPortal(
        <button onClick={() => setIsGuideOpen(true)} className="fixed right-0 bg-[#f8fafc] border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#851c24] hover:text-white hover:border-[#851c24] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group cursor-pointer" style={{ top: '120px' }}>
            <HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#64748b] group-hover:text-white" />
            <span className="font-black tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[10px] font-mono leading-none">USER GUIDE</span>
        </button>,
        document.body
      )}
      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <EventModal isOpen={modal.isOpen} onClose={() => setModal({isOpen: false, event: null})} event={modal.event} onSave={handleSave} />
      {/* TOAST SYSTEM */}
      {toast && createPortal(
        <div className="fixed bottom-6 right-6 z-[1000] animate-fadeIn bg-white border-l-4 border-[#3f809e] shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-5 py-4 rounded-xl flex items-center gap-3">
            <CheckCircle2 size={18} className="text-[#3f809e]" />
            <span className="text-[11px] font-black text-[#212c46] uppercase tracking-widest font-mono">{toast}</span>
            <button onClick={() => setToast(null)} className="ml-4 text-[#64748b] hover:text-[#b22026] cursor-pointer"><X size={14}/></button>
        </div>,
        document.body
      )}
      {/* PAGE HEADER SECTION: NO BACKGROUND COLOR, PLACED DIRECTLY ON MAIN PAGE AS SPECIFIED */}
      <div className="h-14 px-8 flex flex-row items-center justify-between gap-4 z-20 shrink-0 bg-transparent">
          <div className="flex items-center gap-5">
              <div className="relative flex items-center justify-center group cursor-default shrink-0">
                  <div className="absolute inset-0 bg-[#3f809e] blur-[15px] opacity-20 rounded-full group-hover:opacity-60 transition-all duration-700"></div>
                  <div className="relative z-10 p-1.5 border border-[#3f809e]/40 rounded-xl bg-white/50 backdrop-blur-xs shadow-xs">
                      <Trophy size={28} strokeWidth={2.5} className="text-[#3f809e]" />
                  </div>
              </div>
              <div>
                  <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none" style={{ fontSize: '24px' }}>
                      SPORTS & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3f809e] to-[#b58c4f]">SOCIAL</span> EVENTS
                  </h3>
                  <p className="text-[11px] font-bold text-[#4d5a44] uppercase tracking-[0.2em] mt-0.5 opacity-80 leading-none">
                      INTERNAL RELATION-BUILDING & welfare EVENTS ADVISORY HUB
                  </p>
              </div>
          </div>

          <div className="flex items-center gap-4">
              <button 
                onClick={() => setModal({isOpen: true, event: null})}
                className="px-6 py-2.5 bg-[#212c46] text-[#f3f3f1] rounded-xl text-[11px] font-black uppercase tracking-widest shadow-md hover:bg-[#b58c4f] transition-all flex items-center gap-2 active:scale-95 cursor-pointer border border-[#212c46]"
              >
                <Plus size={16} /> New Activity
              </button>
          </div>
      </div>
      <div className="px-4 sm:px-8 w-full mt-[2px]">
        <div className="w-full">
            
            {/* KPI STATS CARDS - LEAN AND COMPACT AS REQUESTED */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3 shrink-0">
                <KpiCard label="Activity Nodes" value={events.length} icon={ClipboardCheck} color={THEME.palette.charcoal} description="Total Managed" />
                <KpiCard label="Total Budget" value={`${(events.reduce((acc,e)=>acc+e.budget, 0)/1000).toFixed(1)}K`} icon={DollarSign} color={THEME.palette.forest} description="Budget Allocated" />
                <KpiCard label="Employee Reach" value="94.5%" icon={Megaphone} color={THEME.palette.burntOrange} description="Communications PR" />
                <KpiCard label="Registered Attendees" value={events.reduce((acc,e)=>acc+e.participants,0)} icon={Users} color={THEME.palette.cerulean} description="Active Personnel" />
            </div>

            {/* MAIN DATA BLOCK */}
            <div className="bg-white/90 rounded-3xl shadow-lg border border-[#eaeaec] overflow-hidden flex flex-col animate-fadeIn  flex-1 min-h-0">
                
                {/* FILTER CONTROL SEGMENT */}
                <div className="px-8 py-4 border-b border-[#eaeaec] bg-[#f8f9fa] flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative" ref={dropdownRef}>
                          <button 
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center justify-between gap-3 px-4 py-2 bg-[#f3f3f1] border border-slate-200 rounded-xl min-w-[200px] text-[11px] font-black uppercase tracking-widest text-[#414757] hover:bg-white transition-all shadow-xs active:scale-95 cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                                <Filter size={14} className="text-[#b58c4f]"/>
                                {activeFilter === 'All' ? 'Filter: Global Activities' : `Category: ${activeFilter}`}
                            </div>
                            <ChevronDown size={14} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`}/>
                          </button>

                          {isFilterOpen && (
                            <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-[#939885]/20 z-[100] overflow-hidden animate-fadeIn font-tech">
                                {['All', 'Sports', 'Social', 'Internal PR', 'External'].map((cat) => (
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
                              placeholder="Search activities or IDs..." 
                              className="w-full pl-12 pr-6 py-2.5 text-[12px] border border-[#eaeaec] rounded-full font-bold outline-none focus:border-[#b7a159] bg-white shadow-sm text-[#212c46]" 
                            />
                        </div>
                    </div>
                </div>

                {/* TABLE STREAM OVER MULTI-COL - MEETS CUSTOM CRITERIA EXACTLY */}
                <div className="overflow-auto custom-scrollbar  flex-1 min-h-0">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead className="bg-[#222b38] text-white">
                            <tr className="border-b-2 border-[#709654]">
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">Activity ID</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap font-sans">Activity Identity & Reach</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Schedule</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Budget Node</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Status</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#eaeaec]">
                            {filteredEvents.map(e => (
                                <tr key={e.id} className="hover:bg-[#f8f9fa] transition-colors group">
                                    <td className="py-2.5 px-4 font-mono font-black text-[#7a8b95] text-[12px]">{e.id}</td>
                                    <td className="py-2.5 px-4">
                                        <div className="flex flex-col text-[12px]">
                                            <div className="flex items-center gap-2">
                                              <span className="font-black text-[#2f2926] text-[12px] uppercase group-hover:text-[#3f809e] transition-colors">{e.title}</span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 opacity-75 group-hover:opacity-100 transition-opacity">
                                              <span className="text-[10px] text-[#b58c4f] font-black uppercase tracking-widest font-mono"><ClipboardCheck size={10}/> {e.category}</span>
                                              <span className="text-[10px] font-black uppercase font-mono text-[#508660]">REACH: {e.reach}</span>
                                              <span className="text-[10px] font-black uppercase font-mono text-[#7a8b95]">RESP: {e.responsible}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-4 text-center font-mono font-bold text-[#414757] text-[12px]">{e.date}</td>
                                    <td className="py-2.5 px-4 text-center font-mono font-black text-[#212c46] text-[12px]">{(e.budget || 0).toLocaleString()} THB</td>
                                    <td className="py-2.5 px-4 text-center">
                                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase border tracking-wider ${e.status === 'Completed' ? 'bg-[#508660]/10 text-[#508660] border-[#508660]/30' : e.status === 'In Progress' ? 'bg-[#3f809e]/10 text-[#3f809e] border-[#3f809e]/30' : 'bg-[#7a8b95]/10 text-[#7a8b95] border-[#7a8b95]/30'}`}>
                                            {e.status}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-4 text-center">
                                        <div className="flex justify-center items-center gap-[1px]">
                                            <button 
                                                onClick={() => setModal({isOpen: true, event: e})} 
                                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-[#b58c4f] hover:bg-[#b58c4f] hover:text-white hover:border-[#b58c4f] transition-all active:scale-90 shadow-xs cursor-pointer" 
                                                title="Edit Node"
                                            >
                                                <Edit3 size={13}/>
                                            </button>
                                            <button 
                                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-[#3f809e] hover:bg-[#3f809e] hover:text-white hover:border-[#3f809e] transition-all active:scale-90 shadow-xs cursor-pointer" 
                                                title="Broadcast PR Alert"
                                            >
                                                <Send size={13}/>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(e.id || '')} 
                                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-[#b22026] hover:bg-[#b22026] hover:text-white hover:border-[#b22026] transition-all active:scale-90 shadow-xs cursor-pointer" 
                                                title="Remove Node"
                                            >
                                                <Trash2 size={13}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredEvents.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                      <div className="flex flex-col items-center opacity-30">
                                        <Trophy size={48} className="mb-2 text-[#7a8b95]"/>
                                        <p className="text-[12px] font-black uppercase tracking-[0.25em] text-[#2f2926]">ไม่พบข้อมูลกิจกรรมในเกณฑ์ค้นหา</p>
                                      </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* TABLE CONTROLS FOOTER */}
                <div className="px-6 py-3 bg-[#F0EAE1]/80 backdrop-blur-md border-t-[1.5px] border-[#adb2b0]/50 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 font-sans">
                    <div className="flex items-center gap-5 text-[11px] font-black text-[#606a5f] uppercase tracking-widest">
                      <p className="bg-white px-3 py-1.5 rounded-lg border border-[#eaeaec] shadow-xs font-mono">Total Activities: {filteredEvents.length}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#508660]"></span>
                        <span>Welfare System Sync Active</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" className="w-8 h-8 border border-slate-200 bg-white rounded-lg flex items-center justify-center opacity-40 cursor-not-allowed shadow-xs hover:bg-[#212c46] hover:text-white"><ChevronLeft size={14}/></button>
                      <div className="bg-white text-[#414757] px-4 py-1.5 rounded-lg font-black text-[11px] min-w-[100px] text-center uppercase tracking-widest border border-slate-200 shadow-xs font-mono">Page 1 / 1</div>
                      <button type="button" className="w-8 h-8 border border-slate-200 bg-white rounded-lg flex items-center justify-center opacity-40 cursor-not-allowed shadow-xs hover:bg-[#212c46] hover:text-white"><ChevronRight size={14}/></button>
                    </div>
                </div>

            </div>

            {/* SPACER MARGIN BOTTOM GIVES EXACTLY 32PX (mt-8) SPACING TO FOOTER AS REQUESTED */}
            <div className="mt-8 shrink-0"></div>

        </div>
      </div>
    </div>
  );
}
