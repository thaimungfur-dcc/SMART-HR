import { UserGuidePanel } from '../../components/shared/UserGuidePanel';
import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Search, Clock, List, LayoutGrid, HelpCircle, X, Eye, Pencil, Trash2, Save, CalendarDays, BookOpen, ShoppingCart, AlertTriangle, ShieldCheck, Database, CheckCircle, Zap, Palmtree, Loader2 } from 'lucide-react';
import { dbSync } from '@/src/services/dbSync';
import { LeaveFilters } from '@/src/components/LeaveFilters';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
const MySwal = withReactContent(Swal);

// --- Theme Configuration (Synced Palette) ---
const THEME = {
  bgGradient: 'linear-gradient(135deg, #f8f9fa 50%, #eaeaec 100%)',
  primary: '#212c46', 
  primaryLight: '#4d87a8', 
  accent: '#b58c4f', 
  gold: '#b7a159',
  brightGold: '#b58c4f',
  success: '#932c2e', 
  danger: '#d96245', 
  mainRed: '#932c2e', 
  skyBlue: '#4d87a8',
  dustyBlue: '#7a8b95',
  indigo: '#212c46',
  softPurple: '#4d87a8',
  deepPurple: '#212c46',
  pinkAccent: '#d96245',
  mutedSlate: '#7a8b95',
  darkSlate: '#212c46',
  silver: '#eaeaec',
  deepNavy: '#212c46',
  brownGold: '#b58c4f',
  vibrantPurple: '#212c46',
  burntOrange: '#d96245',
  slateBlue: '#4d87a8',
  coolGray: '#7a8b95'
};

// --- Helper Components ---
const KPICard = ({ title, val, color, icon: IconComponent, desc }: any) => (
  <div className="bg-white/90 rounded-2xl p-4 shadow-sm border border-[#eaeaec] relative overflow-hidden group h-full transition-all hover:border-[#b7a159] animate-fadeIn flex-col flex pb-6 flex-1 min-h-0">
    <div className="absolute -right-6 -bottom-6 opacity-[0.05] transform group-hover:scale-110 transition-transform duration-700 pointer-events-none z-0">
        <IconComponent size={100} color={color} />
    </div>
    <div className="relative z-10 flex justify-between items-center h-full">
        <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-[#7691ad] uppercase tracking-widest opacity-90 truncate">{title}</p>
            <h4 className="text-3xl font-black tracking-tighter mt-0.5 text-[#212c46]">{val}</h4>
            <p className="text-[10px] text-[#5a4e70] font-bold mt-1.5 flex items-center gap-1.5 bg-white/40 w-fit px-2 py-0.5 rounded-full border border-black/5">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{backgroundColor: color}}></span>
                {desc}
            </p>
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-[#eaeaec] shadow-sm transition-all group-hover:rotate-6" 
            style={{backgroundColor: color + '10', color: color}}>
            <IconComponent size={20} />
        </div>
    </div>
  </div>
);

// --- Main App Component ---
export default function HrCalendar() {
  const [activeTab, setActiveTab] = useState('calendar'); 
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  
  const [events, setEvents] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [companyHolidays, setCompanyHolidays] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  const [leaveForm, setLeaveForm] = useState({
    id: '', employeeName: '', type: 'Vacation', start: '', end: '', days: 1, status: 'Pending HR Approval', department: 'Human Resources', reason: ''
  });

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await dbSync.read('CalendarEvents');
      if (response && response.data && response.data.items) {
        setEvents(response.data.items);
      }
    } catch (error) {
      console.error("Failed to fetch calendar events:", error);
      MySwal.fire('Error', 'Unable to load events from server.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const response = await dbSync.read('LeaveRequests');
      if (response && response.data && response.data.items) {
        setLeaves(response.data.items);
      }
    } catch (error) {
      console.error("Failed to fetch leave requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanyHolidays = async () => {
    setIsLoading(true);
    try {
      const response = await dbSync.read('CompanyHolidays');
      if (response && response.data && response.data.items) {
        setCompanyHolidays(response.data.items);
      }
    } catch (error) {
      console.error("Failed to fetch custom company holidays:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchLeaves();
    fetchCompanyHolidays();
  }, []);

  const handleOpenLeaveModal = (mode: string, leave: any = null, prefillDate: any = null) => {
    setModalMode(mode);
    setLeaveForm(leave ? { ...leave } : {
      id: `LR-${Date.now().toString().substring(6)}`,
      employeeName: '',
      type: 'Vacation',
      start: prefillDate || new Date().toISOString().split('T')[0],
      end: prefillDate || new Date().toISOString().split('T')[0],
      days: 1,
      status: 'Pending HR Approval',
      department: 'Human Resources',
      reason: ''
    });
    setIsModalOpen(true);
  };

  const handleSaveLeave = async (e: any) => {
    e.preventDefault();
    if (!leaveForm.employeeName || !leaveForm.start || !leaveForm.end || !leaveForm.reason) {
      MySwal.fire('Error', 'กรุณากรอกข้อมูลให้ครบถ้วนก่อนส่งใบสมัครค่ะ', 'error');
      return;
    }

    const start = new Date(leaveForm.start);
    const end = new Date(leaveForm.end);
    if (end < start) {
      MySwal.fire('Error', 'วันที่สิ้นสุดการลา ต้องไม่เกิดก่อนวันที่เริ่มต้นการลาค่ะ', 'error');
      return;
    }

    const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const payload = { ...leaveForm, days: diffDays };

    setIsLoading(true);
    try {
      if (modalMode === 'create_leave') {
        await dbSync.write('LeaveRequests', [payload]);
        setLeaves(prev => [...prev, payload]);
        MySwal.fire('Success', 'คำขอลาของทีมงานได้รับการส่งเข้าระบบเรียบร้อยแล้วค่ะ', 'success');
      } else {
        await dbSync.write('LeaveRequests', [payload]);
        setLeaves(prev => prev.map(l => l.id === leaveForm.id ? payload : l));
        MySwal.fire('Success', 'อัปเดตข้อมูลการลาเรียบร้อยแล้วค่ะ', 'success');
      }
    } catch (error) {
      console.error("Save leave error:", error);
      MySwal.fire('Error', 'Failed to save leave request.', 'error');
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  const handleDeleteLeave = async (id: string) => {
    const result = await MySwal.fire({
      title: 'ต้องการลบคำขอนี้หรือไม่?',
      text: "การลบคำขอลาหน้านี้จะไม่สามารถกู้คืนได้นะคะ!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d96245',
      cancelButtonColor: '#7a8b95',
      confirmButtonText: 'ใช่, ฉันต้องการลบ!'
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        await dbSync.delete('LeaveRequests', [{ id }]);
        setLeaves(prev => prev.filter(l => l.id !== id));
        MySwal.fire('Deleted!', 'ลบรายการขอลานี้สําเร็จแล้ว', 'success');
      } catch (error) {
        console.error("Delete leave error:", error);
        MySwal.fire('Error', 'ลบข้อมูลไม่สำเร็จ', 'error');
      } finally {
        setIsLoading(false);
        setIsModalOpen(false);
      }
    }
  };

  const isDateOnLeave = (dateStr: string, leave: any) => {
    if (!dateStr || !leave.start || !leave.end) return false;
    return dateStr >= leave.start && dateStr <= leave.end;
  };

  const currentMonthLeaves = useMemo(() => {
    return leaves.filter(l => {
      const currYearMonth = currentDate.toISOString().substring(0, 7);
      const startYM = l.start?.substring(0, 7) || '';
      const endYM = l.end?.substring(0, 7) || '';
      return startYM === currYearMonth || endYM === currYearMonth;
    });
  }, [leaves, currentDate]);

  const filteredLeaves = useMemo(() => {
    return leaves.filter(l => {
      const matchSearch = l.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.reason?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept = selectedDept === 'All' || l.department === selectedDept;
      const matchType = selectedType === 'All' || l.type === selectedType;
      return matchSearch && matchDept && matchType;
    });
  }, [leaves, searchQuery, selectedDept, selectedType]);

  const THAI_HOLIDAYS = [
    { month: 1, day: 1, title: 'วันขึ้นปีใหม่' },
    { month: 3, day: 3, title: 'วันมาฆบูชา' },
    { month: 4, day: 13, title: 'วันสงกรานต์' },
    { month: 4, day: 14, title: 'วันสงกรานต์' },
    { month: 4, day: 15, title: 'วันสงกรานต์' },
    { month: 5, day: 1, title: 'วันแรงงานแห่งชาติ' },
    { month: 6, day: 3, title: 'วันเฉลิมพระชนมพรรษา สมเด็จพระนางเจ้าสุทิดา พัชรสุธาพิมลลักษณ พระบรมราชินี' },
    { month: 7, day: 28, title: 'วันเฉลิมพระชนมพรรษา พระบาทสมเด็จพระปรเมนทรรามาธิบดี ศรีสินทรมหาวชิราลงกรณ พระวชิรเกล้าเจ้าอยู่หัว (รัชกาลที่ 10)' },
    { month: 8, day: 12, title: 'วันแม่แห่งชาติ' },
    { month: 10, day: 13, title: 'วันหยุดชดเชย วันนวมินทรมหาราช' },
    { month: 10, day: 23, title: 'วันปิยมหาราช' },
    { month: 12, day: 5, title: 'วันพ่อแห่งชาติ' },
    { month: 12, day: 31, title: 'วันสิ้นปี' }
  ];

  const getHolidaysForYear = (year: number) => {
    return THAI_HOLIDAYS.map((h, i) => ({
      id: `HOLIDAY-${year}-${h.month}-${h.day}-${i}`,
      date: `${year}-${String(h.month).padStart(2, '0')}-${String(h.day).padStart(2, '0')}`,
      title: h.title,
      time: '00:00',
      type: 'Holiday',
      priority: 'High',
      status: 'Confirmed',
      color: 'bg-[#d96245]/20 text-[#d96245] border-[#d96245] border-dashed border-2 text-[10.5px] font-bold',
      isSystemHoliday: true
    }));
  };

  const dbHolidaysMapped = useMemo(() => {
    if (companyHolidays && companyHolidays.length > 0) {
      return companyHolidays.map((h, i) => {
        const titleStr = h.titleTh && h.titleEn 
          ? `${h.titleTh} (${h.titleEn})` 
          : (h.titleTh || h.titleEn || h.title || 'วันหยุดประจำบริษัท');
        return {
          id: h.id || `HOLIDAY-DB-${h.date}-${i}`,
          date: h.date,
          title: titleStr,
          time: '00:00',
          type: 'Holiday',
          priority: 'High',
          status: 'Confirmed',
          color: h.type === 'Religious Holiday' 
            ? 'bg-[#b58c4f]/15 text-[#b58c4f] border-[#b58c4f] border-dashed border-2 text-[10.5px] font-bold' 
            : h.type === 'Royal Holiday'
              ? 'bg-amber-500/10 text-amber-700 border-amber-500/50 border-dashed border-2 text-[10.5px] font-bold'
              : 'bg-[#d96245]/20 text-[#d96245] border-[#d96245] border-dashed border-2 text-[10.5px] font-bold',
          isSystemHoliday: true
        };
      });
    }
    
    // Fallback if db has no entries yet: generate for current and neighboring years
    const year = currentDate.getFullYear();
    return [
      ...getHolidaysForYear(year - 1),
      ...getHolidaysForYear(year),
      ...getHolidaysForYear(year + 1)
    ];
  }, [companyHolidays, currentDate]);

  const allEvents = useMemo(() => {
    return [...dbHolidaysMapped, ...events];
  }, [dbHolidaysMapped, events]);

  const [eventForm, setEventForm] = useState({
    id: '', date: '', title: '', time: '', type: 'Meeting', priority: 'Normal', status: 'Scheduled'
  });

  // Calendar Logic
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push({ day: null });
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ 
        day: i, dateStr,
        isToday: dateStr === new Date().toISOString().split('T')[0],
        isSunday: new Date(year, month, i).getDay() === 0,
        isSaturday: new Date(year, month, i).getDay() === 6
      });
    }
    while (days.length < 42) days.push({ day: null });
    return days;
  }, [currentDate]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter(ev => {
      const matchSearch = ev.title.toLowerCase().includes(searchQuery.toLowerCase()) || ev.type.toLowerCase().includes(searchQuery.toLowerCase());
      const evMonth = ev.date?.substring(0, 7) || '';
      const currMonth = currentDate.toISOString().substring(0, 7);
      return matchSearch && (activeTab === 'list' ? true : evMonth === currMonth);
    }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allEvents, searchQuery, currentDate, activeTab]);

  const paginatedEvents = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage) || 1;

  const handleOpenModal = (mode: string, event: any = null, prefillDate: any = null) => {
    setModalMode(mode);
    setEventForm(event ? { ...event } : {
      id: `EV-${currentDate.getFullYear().toString().substring(2)}${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(events.length + 1).padStart(3, '0')}`,
      date: prefillDate || new Date().toISOString().split('T')[0],
      title: '', time: '09:00', type: 'Meeting', priority: 'Normal', status: 'Scheduled'
    });
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (e: any) => {
    e.preventDefault();
    if ((eventForm as any).isSystemHoliday) {
       MySwal.fire('Error', 'Cannot edit system holidays.', 'error');
       return;
    }

    const typeColors: any = {
      'Meeting': 'bg-[#5372ba]/10 text-[#5372ba] border-[#5372ba]/20',
      'Audit': 'bg-[#ce870a]/10 text-[#ce870a] border-[#ce870a]/20',
      'Finance': 'bg-[#b84530]/10 text-[#b84530] border-[#b84530]/20',
      'Quality': 'bg-[#d96245]/10 text-[#d96245] border-[#d96245]/20',
      'Contract': 'bg-[#6293b9]/10 text-[#6293b9] border-[#6293b9]/20',
      'Holiday': 'bg-[#d96245]/20 text-[#d96245] border-[#d96245] border-dashed border-2'
    };
    const payload = { ...eventForm, color: typeColors[eventForm.type] || 'bg-[#f8f9fa] text-[#435665] border-[#eaeaec]' };
    
    setIsLoading(true);
    try {
        if (modalMode === 'create') {
            await dbSync.write('CalendarEvents', [payload]);
            setEvents([...events, payload]);
            MySwal.fire('Success', 'Activity Scheduled Successfully', 'success');
        } else {
            await dbSync.update('CalendarEvents', [payload]);
            setEvents(events.map(ev => ev.id === eventForm.id ? payload : ev));
            MySwal.fire('Success', 'Activity Modified Successfully', 'success');
        }
    } catch (error) {
        console.error("Save error:", error);
        MySwal.fire('Error', 'Failed to save event.', 'error');
    } finally {
        setIsLoading(false);
        setIsModalOpen(false);
    }
  };

  const handleDeleteEvent = async (id: string, isSystemHoliday?: boolean) => {
    if (isSystemHoliday) {
        MySwal.fire('Information', 'System holidays cannot be deleted.', 'info');
        return;
    }
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this schedule deletion!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d96245',
      cancelButtonColor: '#7a8b95',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
        setIsLoading(true);
        try {
            await dbSync.delete('CalendarEvents', [{ id }]);
            setEvents(events.filter(e => e.id !== id));
            MySwal.fire('Deleted!', 'Activity has been deleted.', 'success');
        } catch (error) {
            console.error("Delete error:", error);
            MySwal.fire('Error', 'Failed to delete event.', 'error');
        } finally {
            setIsLoading(false);
        }
    }
  };

  return (
    <div className="flex flex-1 w-full flex-col pb-6 animate-fadeIn bg-transparent space-y-6">
      
      {/* USER GUIDE FLOATING TAB */}
      {typeof document !== 'undefined' && createPortal(
        <button onClick={() => setIsGuideOpen(true)} className="fixed right-0 bg-white border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#d96245] hover:text-white hover:border-[#d96245] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group" style={{ top: '80px' }}>
            <HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#d96245] group-hover:text-white" />
            <span className="font-black tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[11px]">USER GUIDE</span>
        </button>,
        document.body
      )}

      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* HEADER SECTION */}
      <div className="h-14 px-8 flex flex-row items-center justify-between gap-4 z-20 shrink-0">
          <div className="flex items-center gap-5">
              <div className="relative flex items-center justify-center group cursor-default shrink-0">
                  <div className="absolute inset-0 bg-[#3f809e] blur-[15px] opacity-20 rounded-full group-hover:opacity-60 transition-all duration-700"></div>
                  <div className="relative z-10 p-1.5 border border-[#3f809e]/40 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm">
                      <CalendarDays size={28} strokeWidth={2.5} className="text-[#3f809e]" />
                  </div>
              </div>
              <div>
                  <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none" style={{ fontSize: '24px' }}>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3f809e] to-[#b58c4f]">CALENDAR</span> HUB
                  </h3>
                  <p className="text-[11px] font-bold text-[#4d5a44] uppercase tracking-[0.2em] mt-0.5 opacity-80 leading-none">
                      STRATEGIC OPERATIONAL SCHEDULE & SALES PLAN
                  </p>
              </div>
          </div>

          <div className="flex bg-[#f8f9fa] border border-[#eaeaec] p-1 rounded-full shadow-sm inline-flex">
              <button onClick={() => setActiveTab('calendar')} className={`px-5 py-2 text-[11px] font-black uppercase tracking-widest rounded-full transition-all flex items-center gap-2 ${activeTab === 'calendar' ? 'bg-[#212c46] text-[#d7d7d7] shadow-md' : 'text-[#7a8b95] hover:text-[#932c2e]'}`}>
                <LayoutGrid size={14} /> Calendar View
              </button>
              <button onClick={() => setActiveTab('team-leave')} className={`px-5 py-2 text-[11px] font-black uppercase tracking-widest rounded-full transition-all flex items-center gap-2 ${activeTab === 'team-leave' ? 'bg-[#212c46] text-[#d7d7d7] shadow-md' : 'text-[#7a8b95] hover:text-[#932c2e]'}`}>
                <Palmtree size={14} /> Team Leave
              </button>
              <button onClick={() => setActiveTab('list')} className={`px-5 py-2 text-[11px] font-black uppercase tracking-widest rounded-full transition-all flex items-center gap-2 ${activeTab === 'list' ? 'bg-[#212c46] text-[#d7d7d7] shadow-md' : 'text-[#7a8b95] hover:text-[#932c2e]'}`}>
                <List size={14} /> List View
              </button>
          </div>
      </div>

      <div className="px-4 sm:px-8 w-full mt-[2px] pb-6">
        <div className="w-full">
            
            {/* KPI STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5 shrink-0">
                {activeTab === 'team-leave' ? (
                    <>
                        <KPICard title="Leaves this Month" val={currentMonthLeaves.length} icon={Palmtree} color={THEME.burntOrange} desc="Total Requests" />
                        <KPICard title="Vacations (พักร้อน)" val={currentMonthLeaves.filter(l => l.type === 'Vacation').length} icon={ShieldCheck} color={THEME.primaryLight} desc="Relaxation" />
                        <KPICard title="Sick Leaves (ลาป่วย)" val={currentMonthLeaves.filter(l => l.type === 'Sick Leave').length} icon={AlertTriangle} color={THEME.danger} desc="Medical Exemption" />
                        <KPICard title="Pending Approval" val={leaves.filter(l => l.status === 'Pending HR Approval').length} icon={Clock} color={THEME.accent} desc="Requires HR Action" />
                    </>
                ) : (
                    <>
                        <KPICard title="Scheduled Tasks" val={filteredEvents.length} icon={Database} color={THEME.primaryLight} desc="Current View" />
                        <KPICard title="Critical Priorities" val={events.filter(e => e.priority === 'Critical').length} icon={AlertTriangle} color={THEME.danger} desc="Action Required" />
                        <KPICard title="Supplier Audits" val={events.filter(e => e.type === 'Audit').length} icon={ShieldCheck} color={THEME.accent} desc="Verification Node" />
                        <KPICard title="Sync Status" val="Live" icon={CheckCircle} color={THEME.success} desc="System Synced" />
                    </>
                )}
            </div>

            {/* LEAVE STATS FILTERS SECTION */}
            {activeTab === 'team-leave' && (
              <LeaveFilters 
                selectedDept={selectedDept}
                setSelectedDept={setSelectedDept}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                leaves={leaves}
                onClear={() => {
                  setSelectedDept('All');
                  setSelectedType('All');
                  setSearchQuery('');
                }}
              />
            )}

            {/* CONTENT BLOCK - CALENDAR OR LIST */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#eaeaec]/60 overflow-hidden flex flex-col animate-fadeIn relative  flex-1 min-h-0">
                {isLoading && (
                   <div className="absolute inset-0 z-50 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
                     <Loader2 size={32} className="animate-spin text-[#212c46]" />
                   </div>
                )}
                <div className="px-8 py-4 bg-[#f8f9fa] flex flex-col md:flex-row justify-between items-center gap-4 border-b border-[#eaeaec]/60 shrink-0">
                    {/* MONTH/YEAR NAVIGATION BAR */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center justify-between bg-white px-2 py-1.5 rounded-xl border border-[#eaeaec] shadow-sm min-w-[220px]">
                            <button 
                                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} 
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#5372ba] hover:bg-[#f8f9fa] transition-colors"
                            >
                                <ChevronLeft size={18}/>
                            </button>
                            <h4 className="text-[13px] font-black uppercase text-[#212c46] tracking-widest">
                                {currentDate.toLocaleString('en-US', { month: 'long' })} {currentDate.getFullYear()}
                            </h4>
                            <button 
                                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} 
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#5372ba] hover:bg-[#f8f9fa] transition-colors"
                            >
                                <ChevronRight size={18}/>
                            </button>
                        </div>
                        <button onClick={() => setCurrentDate(new Date())} className="bg-white border border-[#eaeaec] text-[#212c46] px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-sm hover:bg-[#f8f9fa] transition-colors">
                            TODAY
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
                        {activeTab === 'team-leave' ? (
                            <button onClick={() => handleOpenLeaveModal('create_leave')} className="bg-[#212c46] text-[#b7a159] hover:bg-[#254268] hover:text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-sm transition-all flex items-center gap-2 border border-[#212c46] shrink-0">
                                <Plus size={16} strokeWidth={3} /> File Leave
                            </button>
                        ) : (
                            <>
                                <div className="relative flex-1 md:w-72 min-w-[200px]">
                                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7691ad]" />
                                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search activities..." className="w-full pl-12 pr-4 py-2.5 text-[12px] border border-[#eaeaec] rounded-xl font-bold outline-none focus:border-[#b7a159] bg-white shadow-sm text-[#212c46]" />
                                </div>
                                <button onClick={() => handleOpenModal('create')} className="bg-[#212c46] text-[#b7a159] hover:bg-[#254268] hover:text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-sm transition-all flex items-center gap-2 border border-[#212c46] shrink-0">
                                    <Plus size={16} strokeWidth={3} /> Add Task
                                </button>
                                <button className="bg-white text-[#d96245] px-5 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-sm hover:bg-[#d96245] hover:text-white transition-all flex items-center gap-2 border border-[#eaeaec] hover:border-[#d96245] shrink-0">
                                    <Palmtree size={16} /> Holiday
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="overflow-auto custom-scrollbar  flex-1 min-h-0">
                    {activeTab === 'calendar' ? (
                        <div className="grid grid-cols-7 border-b border-[#eaeaec]">
                            {daysOfWeek.map(d => {
                                let bgClass = "bg-[#212c46] text-[#eaeaec]";
                                if (d === 'SUN') bgClass = "bg-[#d96245] text-white";
                                else if (d === 'SAT') bgClass = "bg-[#999dc7] text-white";
                                return (
                                    <div key={d} className={`py-3 text-center text-[12px] font-black tracking-widest border-r border-[#ffffff20] last:border-r-0 ${bgClass}`}>
                                        {d}
                                    </div>
                                );
                            })}
                            {calendarDays.map((d, i) => {
                                const dayEvents = allEvents.filter(e => e.date === d.dateStr);
                                return (
                                    <div key={i} className={`min-h-[135px] border-r border-b border-[#eaeaec]/50 p-2.5 group transition-all relative ${!d.day ? 'bg-[#f8f9fa]/50 opacity-40' : 'bg-white hover:bg-[#f8f9fa]'}`}>
                                        {d.day && (
                                            <div className="h-full flex flex-col relative">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleOpenModal('create', null, d.dateStr); }}
                                                    className="absolute -top-1 -right-1 w-6 h-6 bg-[#212c46] text-[#b7a159] rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-[#b7a159] hover:text-[#212c46] z-20"
                                                    title="Add Task to this date"
                                                >
                                                    <Plus size={14} strokeWidth={3} />
                                                </button>
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`text-[14px] font-black ${d.isToday ? 'bg-[#212c46] text-[#b7a159] w-8 h-8 flex items-center justify-center rounded-xl shadow-md transform rotate-3' : d.isSunday ? 'text-[#d96245]' : 'text-[#7691ad]'}`}>
                                                        {d.day}
                                                    </span>
                                                    {dayEvents.length > 0 && <span className="text-[9px] font-black text-[#212c46] bg-[#eaeaec] px-1.5 py-0.5 rounded-md uppercase border border-[#b7a159] mr-6">{dayEvents.length} Tasks</span>}
                                                </div>
                                                <div className="space-y-1.5 overflow-y-auto custom-scrollbar flex-1 max-h-[90px]">
                                                    {dayEvents.map(ev => (
                                                        <div key={ev.id} onClick={(e) => { e.stopPropagation(); handleOpenModal('view', ev); }} className={`px-2.5 py-1.5 rounded-md text-[11px] font-black border truncate cursor-pointer hover:brightness-95 transition-all shadow-sm ${ev.color}`}>
                                                            {ev.title}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : activeTab === 'team-leave' ? (
                        <div className="grid grid-cols-7 border-b border-[#eaeaec] animate-fadeIn pb-6">
                            {daysOfWeek.map(d => {
                                let bgClass = "bg-[#212c46] text-[#eaeaec]";
                                if (d === 'SUN') bgClass = "bg-[#d96245] text-white";
                                else if (d === 'SAT') bgClass = "bg-[#999dc7] text-white";
                                return (
                                    <div key={d} className={`py-3 text-center text-[12px] font-black tracking-widest border-r border-[#ffffff20] last:border-r-0 ${bgClass}`}>
                                        {d}
                                    </div>
                                );
                            })}
                            {calendarDays.map((d, i) => {
                                const dayLeaves = filteredLeaves.filter(lv => isDateOnLeave(d.dateStr, lv));
                                return (
                                    <div key={i} className={`min-h-[135px] border-r border-b border-[#eaeaec]/50 p-2.5 group transition-all relative ${!d.day ? 'bg-[#f8f9fa]/50 opacity-40' : 'bg-white hover:bg-[#f8f9fa]'}`}>
                                        {d.day && (
                                            <div className="h-full flex flex-col relative w-full overflow-hidden">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleOpenLeaveModal('create_leave', null, d.dateStr); }}
                                                    className="absolute -top-1 -right-1 w-6 h-6 bg-[#212c46] text-[#b7a159] rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-[#b58c4f] hover:text-white transition-all z-20 pointer-events-auto"
                                                    title="Add Leave Request to this date"
                                                >
                                                    <Plus size={14} strokeWidth={3} />
                                                </button>
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`text-[14px] font-black ${d.isToday ? 'bg-[#212c46] text-[#b7a159] w-8 h-8 flex items-center justify-center rounded-xl shadow-md transform rotate-3' : d.isSunday ? 'text-[#d96245]' : 'text-[#7691ad]'}`}>
                                                        {d.day}
                                                    </span>
                                                    {dayLeaves.length > 0 && (
                                                        <span className="text-[9px] font-black text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-200">
                                                            {dayLeaves.length} ลา ({dayLeaves.filter(l => l.status === 'Approved').length} อนุมัติ)
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="space-y-1.5 overflow-y-auto custom-scrollbar flex-1 max-h-[90px]">
                                                    {dayLeaves.map(lv => {
                                                        let colorStyle = "bg-teal-50 border-teal-200 text-teal-700";
                                                        if (lv.type === 'Sick Leave') colorStyle = "bg-rose-50 border-rose-200 text-rose-700";
                                                        else if (lv.type === 'Business Leave') colorStyle = "bg-amber-50 border-[#b58c4f]/30 text-amber-700";
                                                        else if (lv.type === 'Personal Leave') colorStyle = "bg-blue-50 border-blue-200 text-blue-700";
                                                        
                                                        const isPending = lv.status !== 'Approved';
                                                        return (
                                                            <div key={lv.id} onClick={(e) => { e.stopPropagation(); handleOpenLeaveModal('view_leave', lv); }} className={`px-2 py-1 rounded-md text-[10px] font-bold border truncate cursor-pointer hover:brightness-95 transition-all shadow-sm ${colorStyle} ${isPending ? 'opacity-85 border-dashed' : ''}`} title={`${lv.employeeName}: ${lv.type} (${lv.reason})`}>
                                                                <span className="font-extrabold">{lv.employeeName.split(' ')[0]}</span> - {lv.type === 'Vacation' ? 'พักร้อน' : lv.type === 'Sick Leave' ? 'ป่วย' : lv.type === 'Business Leave' ? 'กิจ' : 'ส่วนตัว'}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <table className="w-full text-left font-sans border-collapse">
                            <thead className="bg-[#212c46] text-white sticky top-0 z-10 border-b-2 border-[#b58c4f]">
                                <tr>
                                    <th className="py-4 px-6 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">ID Code</th>
                                    <th className="py-4 px-6 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">Schedule Info</th>
                                    <th className="py-4 px-6 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">Activity Description</th>
                                    <th className="py-4 px-6 font-black uppercase tracking-widest text-[12px] text-center">Category</th>
                                    <th className="py-4 px-6 font-black uppercase tracking-widest text-[12px] text-center">Priority</th>
                                    <th className="py-4 px-6 font-black uppercase tracking-widest text-[12px] text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-[#eaeaec]">
                                {paginatedEvents.length > 0 ? paginatedEvents.map(ev => (
                                    <tr key={ev.id} className="hover:bg-[#f8f9fa] transition-colors group">
                                        <td className="py-3 px-6 font-mono font-black text-[#7691ad] uppercase text-[12px]">{ev.id}</td>
                                        <td className="py-3 px-6 text-[12px]">
                                            <div className="flex flex-col">
                                                <span className="font-black text-[#212c46]">{new Date(ev.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                <span className="text-[11px] text-[#ce870a] font-black flex items-center gap-1.5 uppercase tracking-tight mt-0.5"><Clock size={12}/> {ev.time} HRS</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-6 font-black text-[#212c46] uppercase tracking-tight text-[12px]">{ev.title}</td>
                                        <td className="py-3 px-6 text-center text-[12px]">
                                            <span className={`px-4 py-1 rounded-md text-[11px] font-black border uppercase tracking-widest ${ev.color}`}>{ev.type}</span>
                                        </td>
                                        <td className="py-3 px-6 text-center text-[12px]">
                                            <div className={`inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase border tracking-widest ${ev.priority==='Critical' ? 'bg-[#d96245]/10 text-[#d96245] border-[#d96245]/30' : ev.priority==='High' ? 'bg-[#ce870a]/10 text-[#ce870a] border-[#ce870a]/30' : 'bg-[#5372ba]/10 text-[#5372ba] border-[#5372ba]/30'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${ev.priority==='Critical' ? 'bg-[#d96245] animate-pulse' : 'bg-current'}`}></div>
                                                {ev.priority}
                                            </div>
                                        </td>
                                        <td className="py-3 px-6 text-center text-[12px]">
                                            <div className="flex justify-center items-center gap-[1px]">
                                                <button onClick={() => handleOpenModal('view', ev)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#eaeaec] text-[#5372ba] hover:border-[#212c46] hover:text-[#212c46] hover:bg-[#212c46]/5 bg-white transition-all shadow-sm active:scale-90" title="View"><Eye size={16}/></button>
                                                {!ev.isSystemHoliday && <button onClick={() => handleOpenModal('edit', ev)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#eaeaec] text-[#ce870a] hover:border-[#212c46] hover:text-[#212c46] hover:bg-[#212c46]/5 bg-white transition-all shadow-sm active:scale-90" title="Edit"><Pencil size={16}/></button>}
                                                {!ev.isSystemHoliday && <button onClick={() => handleDeleteEvent(ev.id, ev.isSystemHoliday)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#eaeaec] text-[#d96245] hover:border-[#212c46] hover:text-[#212c46] hover:bg-[#212c46]/5 bg-white transition-all shadow-sm active:scale-90" title="Delete"><Trash2 size={16}/></button>}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center text-[#7691ad] font-black uppercase tracking-widest text-[12px] opacity-60">No scheduled events found for this criteria</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* PAGINATION */}
                {activeTab === 'list' && (
                    <div className="px-8 py-3 bg-[#d7d7d7] border-t-[1.5px] border-slate-300 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                        <div className="flex items-center gap-6 text-[11px] font-black text-[#7691ad] uppercase tracking-widest">
                            <div className="flex items-center gap-3">
                                <span>Display Rows:</span>
                                <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="bg-white border border-[#eaeaec] rounded-lg px-3 py-1.5 outline-none focus:border-[#b7a159] text-[#212c46] cursor-pointer shadow-sm font-black text-[12px]">
                                    {[5, 10, 20, 50].map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                            <p className="bg-white px-4 py-2 rounded-xl border border-[#eaeaec] shadow-sm">Total Activities: {filteredEvents.length}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`w-10 h-10 border border-[#eaeaec] bg-white rounded-xl flex items-center justify-center transition-all ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#212c46] hover:text-[#b7a159] shadow-md active:scale-90'}`}>
                                <ChevronLeft size={18}/>
                            </button>
                            <div className="bg-[#212c46] text-[#b7a159] px-8 py-2.5 rounded-xl shadow-md font-black text-[11px] min-w-[140px] text-center uppercase tracking-widest border border-[#212c46]">
                                Page {currentPage} / {totalPages || 1}
                            </div>
                            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className={`w-10 h-10 border border-[#eaeaec] bg-white rounded-xl flex items-center justify-center transition-all ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#212c46] hover:text-[#b7a159] shadow-md active:scale-90'}`}>
                                <ChevronRight size={18}/>
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
        </div>
      </div>

      {/* MODAL SYSTEM */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-[#212c46]/80 backdrop-blur-md p-4 animate-fadeIn">
            <div className="bg-[#f8f9fa] rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden relative border border-[#b7a159]">
                <div className="bg-[#212c46] px-8 py-6 flex justify-between items-center shrink-0 border-b-4 border-[#b7a159] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 scale-150"><CalendarDays size={120} className="text-white"/></div>
                    <div className="flex items-center gap-5 relative z-10">
                      <div className="w-14 h-14 rounded-2xl bg-white/10 text-[#b7a159] flex items-center justify-center border border-white/20 shadow-md backdrop-blur-md">
                        {modalMode.includes('leave') ? <Palmtree size={28} /> : <CalendarIcon size={28} />}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-[#eaeaec] uppercase tracking-widest leading-none">
                          {modalMode === 'create_leave' ? 'File Team Leave' : 
                           modalMode === 'view_leave' ? 'Leave Request Record' : 
                           modalMode === 'edit_leave' ? 'Modify Leave Request' :
                           modalMode === 'create' ? 'Schedule Activity' : 
                           modalMode === 'view' ? 'Activity Record' : 'Modify Schedule'}
                        </h3>
                        <p className="text-[12px] font-bold text-[#7691ad] uppercase tracking-widest mt-1.5 flex items-center gap-2">
                           <Zap size={12} className="text-[#b7a159]" /> 
                           {modalMode.includes('leave') ? 'Leave & Absence Management Hub' : 'Strategic Operations Planning'}
                        </p>
                      </div>
                    </div>
                    <button onClick={()=>setIsModalOpen(false)} className="text-[#9094ac] hover:text-[#d96245] transition-all bg-white/5 hover:bg-white/10 p-2.5 rounded-full active:scale-90 relative z-10"><X size={20} /></button>
                </div>
                
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    {modalMode.includes('leave') ? (
                        <form id="leaveForm" onSubmit={handleSaveLeave} className="space-y-6 bg-white p-6 rounded-2xl border border-[#eaeaec] shadow-sm">
                            <div>
                              <label className="text-[11px] font-black text-[#212c46] uppercase tracking-widest block mb-2">Employee Name / ชื่อ-นามสกุลผู้ขอลา <span className="text-[#d96245]">*</span></label>
                              <input required disabled={modalMode==='view_leave'} value={leaveForm.employeeName} onChange={e=>setLeaveForm({...leaveForm, employeeName: e.target.value})} className="w-full bg-white border border-[#eaeaec] rounded-lg px-4 py-2.5 text-[12px] font-black text-[#212c46] outline-none focus:border-[#b7a159] transition-all shadow-sm disabled:bg-[#f8f9fa]" placeholder="เช่น สมชาย มีความสุข" />
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                  <label className="text-[11px] font-black text-[#212c46] uppercase tracking-widest block mb-2">Department / สังกัดแผนก <span className="text-[#d96245]">*</span></label>
                                  <select disabled={modalMode==='view_leave'} value={leaveForm.department} onChange={e=>setLeaveForm({...leaveForm, department: e.target.value})} className="w-full bg-white border border-[#eaeaec] rounded-lg px-4 py-2.5 text-[12px] font-black text-[#212c46] outline-none cursor-pointer focus:border-[#b7a159] transition-all shadow-sm disabled:bg-[#f8f9fa]">
                                      <option value="Human Resources">Human Resources (HR)</option>
                                      <option value="Finance & Accounting">Finance & Accounting</option>
                                      <option value="Information Technology">Information Technology</option>
                                      <option value="Production">Production (ฝ่ายผลิต)</option>
                                      <option value="Logistics">Logistics (คลังและขนส่ง)</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[11px] font-black text-[#212c46] uppercase tracking-widest block mb-2">Leave Type / ประเภทการลา <span className="text-[#d96245]">*</span></label>
                                  <select disabled={modalMode==='view_leave'} value={leaveForm.type} onChange={e=>setLeaveForm({...leaveForm, type: e.target.value})} className="w-full bg-white border border-[#eaeaec] rounded-lg px-4 py-2.5 text-[12px] font-black text-[#212c46] outline-none cursor-pointer focus:border-[#b7a159] transition-all shadow-sm disabled:bg-[#f8f9fa]">
                                      <option value="Vacation">Vacation (ลาพักร้อน)</option>
                                      <option value="Sick Leave">Sick Leave (ลาป่วย)</option>
                                      <option value="Business Leave">Business Leave (ลากิจ)</option>
                                      <option value="Personal Leave">Personal Leave (ลาส่วนตัว)</option>
                                  </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                  <label className="text-[11px] font-black text-[#212c46] uppercase tracking-widest block mb-1">Start Date / วันเริ่มต้น <span className="text-[#d96245]">*</span></label>
                                  <input type="date" required disabled={modalMode==='view_leave'} value={leaveForm.start} onChange={e=>setLeaveForm({...leaveForm, start: e.target.value})} className="w-full bg-white border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-black text-[#212c46] outline-none focus:border-[#b7a159] transition-all shadow-sm disabled:bg-[#f8f9fa] font-mono" />
                                </div>
                                <div>
                                  <label className="text-[11px] font-black text-[#212c46] uppercase tracking-widest block mb-1">End Date / วันสิ้นสุด <span className="text-[#d96245]">*</span></label>
                                  <input type="date" required disabled={modalMode==='view_leave'} value={leaveForm.end} onChange={e=>setLeaveForm({...leaveForm, end: e.target.value})} className="w-full bg-white border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-black text-[#212c46] outline-none focus:border-[#b7a159] transition-all shadow-sm disabled:bg-[#f8f9fa] font-mono" />
                                </div>
                            </div>
                            <div>
                              <label className="text-[11px] font-black text-[#212c46] uppercase tracking-widest block mb-2">Reason for Leave / เหตุผลการลา <span className="text-[#d96245]">*</span></label>
                              <textarea required rows={3} disabled={modalMode==='view_leave'} value={leaveForm.reason} onChange={e=>setLeaveForm({...leaveForm, reason: e.target.value})} className="w-full bg-white border border-[#eaeaec] rounded-lg px-4 py-2.5 text-[12px] font-semibold text-[#212c46] outline-none focus:border-[#b7a159] transition-all shadow-sm disabled:bg-[#f8f9fa] resize-none" placeholder="เช่น ลาหยุดพักร้อนประจำปี..." />
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                  <label className="text-[11px] font-black text-[#212c46] uppercase tracking-widest block mb-2">Approval Status / สถานะคำขอ <span className="text-[#d96245]">*</span></label>
                                  <select disabled={modalMode==='view_leave'} value={leaveForm.status} onChange={e=>setLeaveForm({...leaveForm, status: e.target.value})} className="w-full bg-white border border-[#eaeaec] rounded-lg px-4 py-2.5 text-[12px] font-black text-[#212c46] outline-none cursor-pointer focus:border-[#b7a159] transition-all shadow-sm disabled:bg-[#f8f9fa]">
                                      <option value="Pending HR Approval">Pending HR Approval</option>
                                      <option value="Approved">Approved</option>
                                      <option value="Rejected">Rejected</option>
                                  </select>
                                </div>
                                {modalMode === 'view_leave' && (
                                  <div className="flex flex-col justify-end pb-1.5 pl-2">
                                    <span className="text-[11px] font-black text-[#7a8b95] uppercase tracking-widest block mb-1">Total Duration / ระยะเวลารวม</span>
                                    <span className="text-[13px] font-black text-[#212c46] bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 inline-block">{leaveForm.days} {leaveForm.days > 1 ? 'Days' : 'Day'} (วัน)</span>
                                  </div>
                                )}
                            </div>
                        </form>
                    ) : (
                        <form id="calendarForm" onSubmit={handleSaveEvent} className="space-y-6 bg-white p-6 rounded-2xl border border-[#eaeaec] shadow-sm">
                            <div>
                              <label className="text-[11px] font-black text-[#212c46] uppercase tracking-widest block mb-2">Activity Description <span className="text-[#d96245]">*</span></label>
                              <input required disabled={modalMode==='view'} value={eventForm.title} onChange={e=>setEventForm({...eventForm, title: e.target.value})} className="w-full bg-white border border-[#eaeaec] rounded-lg px-4 py-2.5 text-[12px] font-black text-[#212c46] uppercase outline-none focus:border-[#b7a159] transition-all shadow-sm disabled:bg-[#f8f9fa]" placeholder="e.g. Audit Vendor Premises" />
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                  <label className="text-[11px] font-black text-[#212c46] uppercase tracking-widest block mb-2">Target Date <span className="text-[#d96245]">*</span></label>
                                  <input type="date" required disabled={modalMode==='view'} value={eventForm.date} onChange={e=>setEventForm({...eventForm, date: e.target.value})} className="w-full bg-white border border-[#eaeaec] rounded-lg px-4 py-2.5 text-[12px] font-black text-[#212c46] outline-none focus:border-[#b7a159] transition-all shadow-sm disabled:bg-[#f8f9fa] font-mono" />
                                </div>
                                <div>
                                  <label className="text-[11px] font-black text-[#212c46] uppercase tracking-widest block mb-2">Execution Time <span className="text-[#d96245]">*</span></label>
                                  <input type="time" required disabled={modalMode==='view'} value={eventForm.time} onChange={e=>setEventForm({...eventForm, time: e.target.value})} className="w-full bg-white border border-[#eaeaec] rounded-lg px-4 py-2.5 text-[12px] font-black text-[#212c46] outline-none focus:border-[#b7a159] transition-all shadow-sm disabled:bg-[#f8f9fa] font-mono" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                  <label className="text-[11px] font-black text-[#212c46] uppercase tracking-widest block mb-2">Workstream Category <span className="text-[#d96245]">*</span></label>
                                  <select disabled={modalMode==='view'} value={eventForm.type} onChange={e=>setEventForm({...eventForm, type: e.target.value})} className="w-full bg-white border border-[#eaeaec] rounded-lg px-4 py-2.5 text-[12px] font-black text-[#212c46] outline-none cursor-pointer focus:border-[#b7a159] transition-all shadow-sm disabled:bg-[#f8f9fa]">
                                      <option value="Meeting">Meeting</option>
                                      <option value="Audit">Audit</option>
                                      <option value="Quality">Quality</option>
                                      <option value="Finance">Finance</option>
                                      <option value="Contract">Contract</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[11px] font-black text-[#212c46] uppercase tracking-widest block mb-2">Priority Level <span className="text-[#d96245]">*</span></label>
                                  <select disabled={modalMode==='view'} value={eventForm.priority} onChange={e=>setEventForm({...eventForm, priority: e.target.value})} className="w-full bg-white border border-[#eaeaec] rounded-lg px-4 py-2.5 text-[12px] font-black text-[#212c46] outline-none cursor-pointer focus:border-[#b7a159] transition-all shadow-sm disabled:bg-[#f8f9fa]">
                                      <option value="Normal">Normal</option>
                                      <option value="High">High</option>
                                      <option value="Critical">Critical</option>
                                  </select>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
                
                <div className="p-6 bg-[#f8f9fa] border-t border-[#eaeaec] flex justify-end gap-3 shrink-0">
                    <button type="button" onClick={()=>setIsModalOpen(false)} className="px-8 py-2.5 bg-white border border-[#eaeaec] text-[#435665] rounded-xl font-bold text-[12px] uppercase tracking-widest hover:bg-[#eaeaec]/30 transition-all shadow-sm">Cancel</button>
                    {modalMode.includes('leave') ? (
                      modalMode !== 'view_leave' ? (
                        <button type="submit" form="leaveForm" className="bg-[#212c46] text-[#b7a159] px-8 py-2.5 rounded-xl font-black text-[12px] uppercase tracking-widest shadow-md hover:bg-[#254268] hover:text-white transition-all flex items-center gap-2 border border-[#212c46]">
                          <Save size={16}/> {modalMode === 'create_leave' ? 'Submit Claim' : 'Save Update'}
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button type="button" onClick={()=>handleDeleteLeave(leaveForm.id)} className="bg-rose-600 text-white hover:bg-rose-700 px-6 py-2.5 rounded-xl font-black text-[12px] uppercase tracking-widest shadow-md transition-all flex items-center gap-2">
                            <Trash2 size={16}/> Delete Claim
                          </button>
                          <button type="button" onClick={()=>setModalMode('edit_leave')} className="bg-[#212c46] text-[#b7a159] px-8 py-2.5 rounded-xl font-black text-[12px] uppercase tracking-widest shadow-md hover:bg-[#254268] hover:text-white transition-all flex items-center gap-2 border border-[#212c46]">
                            <Pencil size={16}/> Modify Claim
                          </button>
                        </div>
                      )
                    ) : (
                      modalMode !== 'view' ? (
                        <button type="submit" form="calendarForm" className="bg-[#212c46] text-[#b7a159] px-8 py-2.5 rounded-xl font-black text-[12px] uppercase tracking-widest shadow-md hover:bg-[#254268] hover:text-white transition-all flex items-center gap-2 border border-[#212c46]">
                          <Save size={16}/> {modalMode === 'create' ? 'Register' : 'Save Update'}
                        </button>
                      ) : (
                        <button type="button" onClick={()=>setModalMode('edit')} className="bg-[#212c46] text-[#b7a159] px-8 py-2.5 rounded-xl font-black text-[12px] uppercase tracking-widest shadow-md hover:bg-[#254268] hover:text-white transition-all flex items-center gap-2 border border-[#212c46]">
                          <Pencil size={16}/> Modify Activity
                        </button>
                      )
                    )}
                </div>
            </div>
        </div>, document.body
      )}
    </div>
  );
}
