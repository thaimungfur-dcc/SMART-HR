import React, { useState, useEffect } from 'react';
import { 
  Bell, Check, Trash2, MailOpen, AlertCircle, RefreshCw, Send, Sparkles, 
  Volume2, VolumeX, Search, Filter, ShieldAlert, BadgeInfo, CalendarClock, DollarSign,
  Briefcase, CheckCircle2, UserCheck, MessageSquare, Megaphone, BellOff, Info, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Swal from 'sweetalert2';

// --- Color Palette matching system ---
const THEME = {
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
  slateDark: '#1d2636'
};

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category: 'system' | 'hr_ops' | 'payroll' | 'announcement';
  priority: 'critical' | 'high' | 'info' | 'success';
  timestamp: string;
  isRead: boolean;
  actionLabel?: string;
  department?: string;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'ตัววัดผลการจัดซื้อประจำปี KPIs / OKRs สื่อสารล้าหลัง',
    description: 'ฝ่ายบุคคลแจ้งเตือนความคืบหน้า: ดัชนีหลัก Cost Savings % ของแผนกจัดสรรในระบบ Google Sheets มีบันทึกต่ำกว่าเป้าเกณฑ์ 5% กรุณาเข้าพิจารณารายละเอียดร่วมตอบกลับทีมนโยบายค่ะ',
    category: 'hr_ops',
    priority: 'critical',
    timestamp: '2026-06-03T01:30:00Z',
    isRead: false,
    actionLabel: 'Review KPI Matrix',
    department: 'Purchasing & Operations'
  },
  {
    id: 'notif-2',
    title: 'ระบบเชื่อมต่อ Google Apps Script สำเร็จ',
    description: 'สโมสรการทดสอบเชื่อมต่อ: สัญญาณ ERP หลักกับฐานข้อมูล Google Sheet Web App และระบบหลังบ้าน AI Copilot ได้รับการอัปเดตและพร้อมใช้งานเรียบร้อยแล้วค่ะ',
    category: 'system',
    priority: 'success',
    timestamp: '2026-06-03T01:25:00Z',
    isRead: false,
    actionLabel: 'Check ERP Status'
  },
  {
    id: 'notif-3',
    title: 'ประกาศ: นโยบายตรวจเช็คสถานะวันลาสะสมพนักงานใหม่',
    description: 'ฝ่ายทรัพยากรมนุษย์ปรับเปลี่ยนกฎทดลองงาน 119 วัน: พนักงานชัยศรีได้รับสิทธิพักร้อนสัดส่วนพิเศษล่วงหน้าทันทีเพื่อรักษาวัฒนธรรมองค์กรที่ดี',
    category: 'announcement',
    priority: 'high',
    timestamp: '2026-06-02T18:45:00Z',
    isRead: false,
    actionLabel: 'View Policy Document',
    department: 'All Departments'
  },
  {
    id: 'notif-4',
    title: 'สลิปเงินเดือนรอบจ่ายล่าสุดถูกเข้าคลังรหัสผ่าน',
    description: 'ตู้คลังเงินเดือน (Payroll Vault) ของพนักงาน พิมพพรรณ สวยงาม ได้รับการประมวลผลและการอัปเดตรอบจ่ายสลิป May 2026 เรียบร้อยแล้วค่ะ สิทธิ์การดูถูกล็อคด้วยรหัสผ่านความปลอดภัยสูง',
    category: 'payroll',
    priority: 'info',
    timestamp: '2026-06-01T09:00:00Z',
    isRead: true,
    actionLabel: 'Check Payslip Vault'
  },
  {
    id: 'notif-5',
    title: 'ระบบรักษาความปลอดภัยเครือข่ายเปลี่ยนโหมด Gemini 3.5 API',
    description: 'คุณลักษณะ Search Grounding อัจฉริยะได้รับการตรวจสอบคีย์ GEMINI_API_KEY เพื่อความรวดเร็วและเป็นส่วนตัวในการประมวลผลคำแนะนำ',
    category: 'system',
    priority: 'info',
    timestamp: '2026-05-30T14:10:00Z',
    isRead: true
  }
];

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'critical' | 'system' | 'hr_ops' | 'announcement'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Broadcaster Form States
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<'system' | 'hr_ops' | 'payroll' | 'announcement'>('announcement');
  const [newPriority, setNewPriority] = useState<'critical' | 'high' | 'info' | 'success'>('info');
  const [newDept, setNewDept] = useState('All Departments');

  // Load notifications from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('smart_hr_notifications_db');
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {
        setNotifications(DEFAULT_NOTIFICATIONS);
      }
    } else {
      setNotifications(DEFAULT_NOTIFICATIONS);
      localStorage.setItem('smart_hr_notifications_db', JSON.stringify(DEFAULT_NOTIFICATIONS));
    }
  }, []);

  // Sync back to localStorage of change
  const saveNotifs = (updatedList: NotificationItem[]) => {
    setNotifications(updatedList);
    localStorage.setItem('smart_hr_notifications_db', JSON.stringify(updatedList));
  };

  // Synthesize custom polite HR notification chime using Web Audio API
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Note 1 (E5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      gain1.gain.setValueAtTime(0.08, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.5);

      // Note 2 (A5) played slightly later
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880.00, ctx.currentTime); // A5
        gain2.gain.setValueAtTime(0.08, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.7);
      }, 150);
    } catch (e) {
      console.log('Audio init blocked by autoplay restrictions');
    }
  };

  const markAsRead = (id: string) => {
    const next = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    saveNotifs(next);
  };

  const toggleReadStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = notifications.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n);
    saveNotifs(next);
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = notifications.filter(n => n.id !== id);
    saveNotifs(next);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'ลบข้อมูลแจ้งเตือนสำเร็จค่ะ',
      showConfirmButton: false,
      timer: 1500,
      background: '#f8f9fa'
    });
  };

  const markAllAsRead = () => {
    const next = notifications.map(n => ({ ...n, isRead: true }));
    saveNotifs(next);
    playChime();
    Swal.fire({
      icon: 'success',
      title: 'อ่านการแจ้งเตือนทั้งหมดแล้ว',
      text: 'ระบบทำเครื่องหมายว่าเปิดอ่านแลัวทั้งหมดเรียบร้อยค่ะ',
      confirmButtonColor: THEME.primary
    });
  };

  const clearAllNotifications = () => {
    Swal.fire({
      title: 'ล้างประวัติตัวแจ้งเตือนทั้งหมด?',
      text: 'คุณแน่ใจหรือไม่ว่าต้องการล้างประกาศการแจ้งเตือนทั้งหมดออกจากความทรงจำระบบทั่วไป?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่, ฉันต้องการล้าง',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: THEME.danger,
      cancelButtonColor: THEME.dustyBlue
    }).then((result) => {
      if (result.isConfirmed) {
        saveNotifs([]);
        Swal.fire({
          icon: 'success',
          title: 'ล้างสำเร็จ',
          text: 'ล้างกล่องขาเข้าประกาศแจ้งเตือนประวัติเรียบร้อยแล้วค่ะ',
          confirmButtonColor: THEME.primary
        });
      }
    });
  };

  // Broadcast Submission
  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) {
      Swal.fire({
        icon: 'error',
        title: 'ป้อนข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอกหัวข้อประกาศข่าวและคำอธิบายสถิติให้รอบสลวยด้วยค่ะ',
        confirmButtonColor: THEME.accent
      });
      return;
    }

    const newNotification: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: newTitle,
      description: newDesc,
      category: newCategory,
      priority: newPriority,
      timestamp: new Date().toISOString(),
      isRead: false,
      department: newCategory !== 'system' ? newDept : undefined,
      actionLabel: 'Explore Details'
    };

    const next = [newNotification, ...notifications];
    saveNotifs(next);
    playChime();

    Swal.fire({
      icon: 'success',
      title: 'กระจายสัญญาณแจ้งเตือนสำเร็จ!',
      html: `ส่งข้อความ <strong>"${newTitle}"</strong> ไปยังฝ่ายงานเป้าหมายและเก็บบันทึกเข้าระบบ Realtime เรียบร้อยแล้วค่ะ`,
      confirmButtonColor: THEME.success
    });

    // Reset Composer states
    setNewTitle('');
    setNewDesc('');
    setNewDept('All Departments');
  };

  // Filtering Logic
  const filteredNotifications = notifications.filter(n => {
    // 1. Filter tabs logic
    if (activeTab === 'unread' && n.isRead) return false;
    if (activeTab === 'critical' && n.priority !== 'critical') return false;
    if (activeTab === 'system' && n.category !== 'system') return false;
    if (activeTab === 'hr_ops' && n.category !== 'hr_ops') return false;
    if (activeTab === 'announcement' && n.category !== 'announcement') return false;

    // 2. Search query filter
    const query = searchTerm.toLowerCase();
    if (query) {
      return (
        n.title.toLowerCase().includes(query) ||
        n.description.toLowerCase().includes(query) ||
        (n.department && n.department.toLowerCase().includes(query))
      );
    }
    return true;
  });

  // Calculate high-level stats
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const criticalCount = notifications.filter(n => n.priority === 'critical' && !n.isRead).length;
  const activeAlertsCount = filteredNotifications.length;

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'critical':
        return {
          icon: <ShieldAlert size={14} className="text-[#932c2e]" />,
          bg: 'bg-red-50 text-[#932c2e] border-red-200/50',
          dot: 'bg-[#932c2e]',
          label: 'Critical Alert / ด่วนที่สุด'
        };
      case 'high':
        return {
          icon: <AlertCircle size={14} className="text-[#a94228]" />,
          bg: 'bg-amber-50 text-[#a94228] border-amber-200/50',
          dot: 'bg-[#a94228]',
          label: 'High Priority / สำคัญมาก'
        };
      case 'success':
        return {
          icon: <CheckCircle2 size={14} className="text-[#657f4d]" />,
          bg: 'bg-emerald-50 text-[#657f4d] border-emerald-200/50',
          dot: 'bg-[#657f4d]',
          label: 'Success Event / ดำเนินการสำเร็จ'
        };
      default:
        return {
          icon: <BadgeInfo size={14} className="text-[#3f809e]" />,
          bg: 'bg-sky-50 text-[#3f809e] border-sky-200/50',
          dot: 'bg-[#3f809e]',
          label: 'Information / ข้อมูลทั่วไป'
        };
    }
  };

  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case 'system':
        return { icon: <RefreshCw size={12} />, label: 'System Integration / ระบบบูรณาการ', color: 'bg-indigo-50 text-indigo-700' };
      case 'hr_ops':
        return { icon: <Briefcase size={12} />, label: 'HR Personnel Ops / ฝ่ายบุคคลสิทธิ์', color: 'bg-[#b58c4f]/10 text-[#b58c4f]' };
      case 'payroll':
        return { icon: <DollarSign size={12} />, label: 'Payroll Vault / ข้อมูลการโอนเงิน', color: 'bg-green-50 text-emerald-800' };
      default:
        return { icon: <Megaphone size={12} />, label: 'Announcements / ประกาศองค์กร', color: 'bg-[#3f809e]/10 text-[#3f809e]' };
    }
  };

  const formatTimestamp = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('th-TH', { 
      day: 'numeric', 
      month: 'short', 
      year: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    }) + ' น.';
  };

  return (
    <div className="pt-4 flex flex-col gap-6 animate-fadeIn px-4 sm:px-8 w-full font-sans pb-6 flex-1 min-h-0">
      
      {/* Page Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Bell size={24} className="text-[#212c46] animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-black text-[#212c46] uppercase tracking-tight">Notification Center</h1>
          </div>
          <p className="text-xs text-[#7a8b95] font-semibold leading-relaxed">
            ศูนย์ติดตามและรายงานตัวแปรกิจกกรมองค์กร ทะเบียนการเชื่อมโยงข้อมูล ERP ส่วนบุคคล และความเคารพวินัยออแลร์ตอัจฉริยะ ชัยศรีอุตสาหกรรมเกษตร
          </p>
        </div>

        {/* Audio Toggle button */}
        <div className="flex gap-2.5 items-center w-full sm:w-auto self-stretch sm:self-center">
          <button 
            onClick={() => { setSoundEnabled(!soundEnabled); if (!soundEnabled) playChime(); }}
            className={`p-2.5 rounded-xl border flex items-center gap-2 text-[10px] font-black uppercase tracking-wider shadow-sm transition-colors cursor-pointer grow sm:grow-0 justify-center h-10 ${
              soundEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
            title="Toggle notification acoustic chime"
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span>{soundEnabled ? 'Acoustic Sound On' : 'Acoustic Muted'}</span>
          </button>

          <button 
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black text-[#212c46] uppercase tracking-wider hover:bg-slate-50 shadow-sm grow sm:grow-0 h-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MailOpen size={14} className="text-[#3f809e]" />
            <span>Mark All As Read</span>
          </button>

          <button 
            onClick={clearAllNotifications}
            disabled={notifications.length === 0}
            className="p-2.5 bg-[#932c2e]/5 border border-[#932c2e]/10 text-[#932c2e] hover:bg-[#932c2e]/10 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider shadow-sm grow sm:grow-0 h-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={14} />
            <span>Clear Archive</span>
          </button>
        </div>
      </div>

      {/* KPI Overlook Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between group overflow-hidden relative">
          <div className="absolute right-[-10px] bottom-[-10px] text-slate-100 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <Bell size={80} />
          </div>
          <div className="relative z-10">
            <span className="block text-[9px] font-black tracking-widest uppercase text-[#7a8b95]">Inbox Total Alerts</span>
            <span className="block text-3xl font-black text-[#212c46] mt-1">{notifications.length}</span>
            <span className="block text-[10px] text-slate-400 mt-1 font-bold">จากกิจกรรมและบันทึก ERP ทั้งหมด</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            <Bell size={18} className="text-slate-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between group overflow-hidden relative">
          <div className="absolute right-[-10px] bottom-[-10px] text-amber-50 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <AlertCircle size={80} />
          </div>
          <div className="relative z-10">
            <span className="block text-[9px] font-black tracking-widest uppercase text-amber-600">Pending Actions</span>
            <span className="block text-3xl font-black text-amber-700 mt-1">{unreadCount}</span>
            <span className="block text-[10px] text-amber-500 mt-1 font-bold">รอการกดเปิดและพิจารณาคำตอบ</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/50 flex items-center justify-center shrink-0">
            <AlertCircle size={18} className="text-amber-600" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#932c2e]/10 flex items-center justify-between group overflow-hidden relative">
          <div className="absolute right-[-10px] bottom-[-10px] text-red-50 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <ShieldAlert size={80} />
          </div>
          <div className="relative z-10">
            <span className="block text-[9px] font-black tracking-widest uppercase text-[#932c2e]">Critical Alerts</span>
            <span className="block text-3xl font-black text-[#932c2e] mt-1">{criticalCount}</span>
            <span className="block text-[10px] text-red-400 mt-1 font-bold">ระดับสุ่มเสี่ยง / ด่วนที่สุด</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200/50 flex items-center justify-center shrink-0 animate-pulse">
            <ShieldAlert size={18} className="text-[#932c2e]" />
          </div>
        </div>
      </div>

      {/* Main Filter & Feed Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left Side: Filter, Search and Feed */}
        <div className="flex-1 w-full space-y-4">
          
          {/* Filters & Search Control Bar */}
          <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between select-none">
            
            {/* Nav tabs Category filtering */}
            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {[
                { id: 'all', label: 'All Operations' },
                { id: 'unread', label: 'Unread Only' },
                { id: 'critical', label: 'Critical' },
                { id: 'system', label: 'System API' },
                { id: 'hr_ops', label: 'HR Personnel' },
                { id: 'announcement', label: 'General' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id as any); playChime(); }}
                    className={`py-1.5 px-3.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#212c46] text-white shadow-sm font-bold scale-[1.02]' 
                        : 'bg-[#f3f3f1] hover:bg-slate-200 text-slate-600 font-bold'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Live Search bar */}
            <div className="relative w-full sm:w-60 h-10 shrink-0">
              <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="ค้นหาประกาศแจ้งเตือน..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#f3f3f1] border border-transparent rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:bg-white focus:border-[#4d87a8] outline-none transition-all h-full"
              />
            </div>
          </div>

          {/* Realtime alerts list block */}
          <div className="space-y-3.5">
            <h3 className="text-[10px] font-black text-slate-400 tracking-widest uppercase flex justify-between items-center px-1">
              <span>ACTIVE ALERT CYCLE ({activeAlertsCount} Records)</span>
              <span>Sorted by Recency</span>
            </h3>

            {filteredNotifications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100">
                  <BellOff size={28} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 uppercase">No Notifications Found</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    ไม่มีรายการแจ้งเตือนค้างอยู่ตามหัวข้อและรหัสการค้นคว้าที่กำหนดค่ะ หากมีเรื่องใหม่ อุปกรณ์จะระฆังสัญญาณให้ทราบทันที
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {filteredNotifications.map((noti) => {
                    const styling = getPriorityStyle(noti.priority);
                    const catTheme = getCategoryTheme(noti.category);

                    return (
                      <motion.div
                        key={noti.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => markAsRead(noti.id)}
                        className={`bg-white rounded-2xl border transition-all p-5 shadow-sm relative group overflow-hidden ${
                          noti.isRead 
                            ? 'border-slate-100/85 hover:border-slate-200' 
                            : 'border-l-4 border-l-[#212c46] border-slate-200 bg-slate-50/50 hover:bg-slate-50 shadow-md ring-1 ring-[#212c46]/5'
                        } cursor-pointer`}
                      >
                        {/* Red pulsating dot for unread critical alert */}
                        {!noti.isRead && noti.priority === 'critical' && (
                          <span className="absolute top-4 right-4 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                          </span>
                        )}

                        {/* Top Metadata Row */}
                        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3.5 select-none text-[10px]">
                          
                          {/* Left: Priority and Category pills */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-[8.5px] font-black border uppercase tracking-wider flex items-center gap-1 shrink-0 ${styling.bg}`}>
                              {styling.icon}
                              <span>{styling.label}</span>
                            </span>
                            
                            <span className={`px-2.5 py-1 rounded-full text-[8.5px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0 ${catTheme.color}`}>
                              {catTheme.icon}
                              <span>{catTheme.label}</span>
                            </span>

                            {noti.department && (
                              <span className="bg-[#7a8b95]/5 text-[#7a8b95] border border-slate-200/50 px-2 my-0.5 rounded text-[8px] font-bold">
                                target: {noti.department}
                              </span>
                            )}
                          </div>

                          {/* Right: Timestamp and Read Indicator */}
                          <div className="flex items-center gap-3 font-semibold text-slate-400">
                            <span>{formatTimestamp(noti.timestamp)}</span>
                            
                            {/* Actions button */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => toggleReadStatus(noti.id, e)}
                                className={`p-1.5 rounded-lg border transition-all ${
                                  noti.isRead 
                                    ? 'border-slate-100 hover:bg-slate-50 hover:border-slate-200 text-slate-400 hover:text-slate-600' 
                                    : 'border-[#212c46]/20 bg-white text-[#212c46] hover:bg-slate-100'
                                }`}
                                title={noti.isRead ? 'ทำเครื่องหมายว่ายังไม่ได้อ่าน' : 'ระบุว่าเปิดอ่านแล้ว'}
                              >
                                {noti.isRead ? <MailOpen size={13} /> : <Check size={13} />}
                              </button>

                              <button
                                onClick={(e) => deleteNotification(noti.id, e)}
                                className="p-1.5 border border-transparent rounded-lg hover:bg-red-50 hover:border-red-100 hover:text-red-600 text-slate-400 transition-all"
                                title="Delete Announcement"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                        </div>

                        {/* Title and Body */}
                        <div className="space-y-1.5 pr-6">
                          <h4 className={`text-sm tracking-tight leading-tight uppercase font-black ${
                            noti.isRead ? 'text-slate-700 font-extrabold' : 'text-[#212c46] font-black'
                          }`}>
                            {noti.title}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed font-sans pr-2">
                            {noti.description}
                          </p>
                        </div>

                        {/* Action details link/trigger mockup */}
                        {noti.actionLabel && (
                          <div className="mt-4 pt-3.5 border-t border-dashed border-slate-100 flex items-center justify-between select-none">
                            <span className="text-[9px] text-[#4d87a8] font-black uppercase tracking-wider flex items-center gap-1.5 hover:underline">
                              <span>Action Target: </span><strong>{noti.actionLabel}</strong>
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold">ID: {noti.id}</span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Broadcaster / Announcement Composer */}
        <div className="w-full lg:w-96 shrink-0 lg:sticky lg:top-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <Volume2 className="text-[#b58c4f]" size={20} />
            <div>
              <h3 className="text-sm font-black text-[#212c46] uppercase tracking-wider">HR Alert Broadcaster</h3>
              <p className="text-[9px] font-black text-slate-400 uppercase">Announcement & Alert Hub Service</p>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            สำหรับ HR Admins หรือเจ้าของสิทธิ์: ส่งข้อมูลข่าวสารเตือนพนักงาน ประสานวินัย ชัยศรีอุตสาหกรรมเกษตร ไปยังฐานหน้าบอร์ด และจำลองอัปเดตกระดิ่งแจ้งเตือนทันที
          </p>

          <form onSubmit={handleBroadcastSubmit} className="space-y-4 pt-1 flex flex-col">
            <div>
              <label className="block text-[9px] font-black text-[#212c46] uppercase tracking-widest mb-1">Alert Title / หัวข้อประกาศ</label>
              <input
                type="text"
                placeholder="ใส่หัวข้อข่าวสารหรือเรื่องด่วนดัชนี..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold focus:border-[#b58c4f] focus:ring-1 focus:ring-[#b58c4f] outline-none bg-slate-50/20"
                required
              />
            </div>

            <div>
              <label className="block text-[9px] font-black text-[#212c46] uppercase tracking-widest mb-1">Description / คำอธิบายและรายละเอียด</label>
              <textarea
                placeholder="กรอกรายละเอียดสั้นๆ เพื่อชี้แจงความเสี่ยง คลังข้อมูล คณะทำงาน หรือเป้าหมาย..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={4}
                className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:border-[#b58c4f] focus:ring-1 focus:ring-[#b58c4f] outline-none bg-slate-50/20 resize-none font-medium leading-relaxed"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[9px] font-black text-[#212c46] uppercase tracking-widest mb-1">Target Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#b58c4f] outline-none bg-white text-slate-700 cursor-pointer"
                >
                  <option value="announcement">Announcement (ประกาศ)</option>
                  <option value="hr_ops">HR Personnel (บุคคล)</option>
                  <option value="payroll">Payroll (การเงิน)</option>
                  <option value="system">System (ระบบระบบ)</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-black text-[#212c46] uppercase tracking-widest mb-1">Priority Scale</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#b58c4f] outline-none bg-white text-slate-700 cursor-pointer"
                >
                  <option value="info">Info / ข้อมูลทั่วไป</option>
                  <option value="success">Success / สำเร็จ</option>
                  <option value="high">High / สำคัญมาก</option>
                  <option value="critical">Critical / ด่วนที่สุด</option>
                </select>
              </div>
            </div>

            {newCategory !== 'system' && (
              <div>
                <label className="block text-[9px] font-black text-[#212c46] uppercase tracking-widest mb-1 flex justify-between">
                  <span>Target Department</span>
                  <span className="text-[7.5px] text-[#4d87a8] font-black uppercase">Subdivision Filter</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น All Departments, Innovation Tech, Factory"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:border-[#b58c4f] outline-none bg-slate-50/20"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-2 py-3.5 bg-gradient-to-r from-[#212c46] to-[#1a2338] hover:from-[#1a2338] text-white text-[10px] font-black uppercase rounded-xl tracking-widest shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#b58c4f]/20 hover:scale-[1.01] hover:shadow-[#212c46]/20"
            >
              <Send size={15} className="text-[#b58c4f]" /> <span>BROADCAST SIGNAL / ส่งสัญญาณ</span>
            </button>
          </form>

          {/* Quick FAQ info box */}
          <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-100 flex gap-2.5 items-start text-[10.5px] leading-relaxed text-slate-500 font-medium">
            <HelpCircle size={16} className="text-[#3f809e] shrink-0 mt-0.5" />
            <div>
              <span className="block font-black text-[#212c46] uppercase mb-0.5">Quick FAQ</span>
              ช่องสัญญานี้ทำงานด้วย Client Local DB ในการกระจายข่าวสารจำลอง หากฝ่ายเทคนิคประสงค์ดึงข้อมูลจาก Cloud ERP แผนผังฐาน Google Sheets หรือ Firebase ระบบมีความยืดหยุ่นรองรับ API เสมอค่ะ
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
