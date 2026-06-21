import React, { useState } from 'react';
import { 
  Zap, X, Calendar, DollarSign, FileText, Printer, Download, Award, 
  ChevronRight, Activity, Clock, ShieldCheck, Heart, CheckCircle2, 
  ChevronDown, User, Send, Eye, EyeOff, RefreshCw, Sparkles, Building2, CalendarDays,
  FileCheck2, CheckSquare, ListTodo, AlertTriangle
} from 'lucide-react';
import { DraggableModal } from './DraggableModal';
import Swal from 'sweetalert2';

// --- Color Palette match with system ---
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
  indigo: '#414757',
  softPurple: '#ab7d82',
  deepPurple: '#2d2c4a',
  pinkAccent: '#a54f6b',
  burntOrange: '#d96245'
};

export function QuickActionsMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'leave' | 'payslip' | 'appraisal' | null>(null);

  // Leave Form State
  const [leaveType, setLeaveType] = useState('vacation');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveRepresentative, setLeaveRepresentative] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Payslip State
  const [selectedMonth, setSelectedMonth] = useState('May 2026');
  const [isPayslipRevealed, setIsPayslipRevealed] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPayslipPassword, setShowPayslipPassword] = useState(false);
  const [payslipError, setPayslipError] = useState('');

  // Sample Payslips Data
  const payslipsDb: Record<string, {
    baseSalary: number;
    otPay: number;
    incentives: number;
    allowances: number;
    providentFund: number;
    tax: number;
    socialSecurity: number;
    bankAccount: string;
  }> = {
    'May 2026': {
      baseSalary: 45000,
      otPay: 3500,
      incentives: 5000,
      allowances: 1500,
      providentFund: 2250,
      tax: 1850,
      socialSecurity: 750,
      bankAccount: 'Kasikornbank •••• 1245'
    },
    'April 2026': {
      baseSalary: 45000,
      otPay: 1200,
      incentives: 4000,
      allowances: 1500,
      providentFund: 2250,
      tax: 1450,
      socialSecurity: 750,
      bankAccount: 'Kasikornbank •••• 1245'
    },
    'March 2026': {
      baseSalary: 45000,
      otPay: 0,
      incentives: 4000,
      allowances: 1500,
      providentFund: 2250,
      tax: 1400,
      socialSecurity: 750,
      bankAccount: 'Kasikornbank •••• 1245'
    }
  };

  // Leave Requests Submitted (Client State for demonstration)
  const [leaveHistory, setLeaveHistory] = useState([
    { id: 1, type: 'Vacation', start: '2026-04-10', end: '2026-04-12', status: 'Approved', days: 3 },
    { id: 2, type: 'Sick Leave', start: '2026-05-02', end: '2026-05-02', status: 'Approved', days: 1 }
  ]);

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !leaveReason) {
      Swal.fire({
        icon: 'error',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอกวันที่ และเหตุผลในการลาให้ครบถ้วนก่อนส่งใบสมัครค่ะ',
        confirmButtonColor: THEME.accent
      });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      Swal.fire({
        icon: 'error',
        title: 'วันที่ไม่สมเหตุสมผล',
        text: 'วันที่สิ้นสุดการลา ต้องไม่เกิดก่อนวันที่เริ่มต้นการลาค่ะ',
        confirmButtonColor: THEME.accent
      });
      return;
    }

    setSubmitLoading(true);

    // Simulate server write delay
    setTimeout(() => {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      const newLeave = {
        id: Date.now(),
        type: leaveType === 'vacation' ? 'Vacation' : leaveType === 'sick' ? 'Sick Leave' : 'Business Leave',
        start: startDate,
        end: endDate,
        status: 'Pending HR Approval',
        days: diffDays
      };

      setLeaveHistory(prev => [newLeave, ...prev]);
      setSubmitLoading(false);

      Swal.fire({
        icon: 'success',
        title: 'ส่งคำขอลาสำเร็จเรียบร้อย',
        html: `ระบบได้ทำการยื่น <strong>คำร้องล่วงหน้า</strong> (${diffDays} วัน) ไปยังฝ่ายจัดการบุคคล HR พนักงานจะได้รับการแจ้งเตือนผลพิจารณาภายใน 24 ชม. ค่ะ`,
        confirmButtonColor: THEME.success
      });

      // Reset Form and close modal
      setLeaveReason('');
      setStartDate('');
      setEndDate('');
      setLeaveRepresentative('');
      setActiveModal(null);
    }, 1200);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulation: Password "1234" is required to secure payroll data
    if (passwordInput === '1234') {
      setIsPayslipRevealed(true);
      setPayslipError('');
    } else {
      setPayslipError('รหัสผ่านไม่ถูกต้อง (ลองกดเลขแนะนำ "1234")');
    }
  };

  const handleDownloadPayslip = () => {
    Swal.fire({
      icon: 'success',
      title: 'ดาวน์โหลดสลิปเงินเดือนสำเร็จ',
      text: `ทำการดาวน์โหลดเอกสาร PAYSLIP_${selectedMonth.replace(' ', '_')}.pdf เรียบร้อยแล้ว 🔒 (ความปลอดภัยสูง)`,
      confirmButtonColor: THEME.skyBlue
    });
  };

  const currentPayslip = payslipsDb[selectedMonth] || payslipsDb['May 2026'];
  const totalEarnings = currentPayslip.baseSalary + currentPayslip.otPay + currentPayslip.incentives + currentPayslip.allowances;
  const totalDeductions = currentPayslip.providentFund + currentPayslip.tax + currentPayslip.socialSecurity;
  const netSalary = totalEarnings - totalDeductions;

  return (
    <>
      {/* FLOATING ACTION BUTTON TRIGGER */}
      <div className="relative z-[400] flex flex-col items-end gap-3.5 inline-flex">
        
        {/* Expanded Speed-Dial Menu */}
        {isMenuOpen && (
          <div className="absolute bottom-[calc(100%+14px)] right-0 flex flex-col items-end gap-2.5 animate-fadeIn">
            {/* Action 1: Submit Leave */}
            <div 
              onClick={() => { setActiveModal('leave'); setIsMenuOpen(false); }}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <span className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-white font-black text-[10px] uppercase tracking-wider shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Submit Leave (ยื่นวันลา)
              </span>
              <button className="w-11 h-11 rounded-full bg-gradient-to-br from-[#d96245] to-[#a94228] hover:from-[#e37156] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 border border-white/20">
                <CalendarDays size={18} />
              </button>
            </div>

            {/* Action 2: View Payslip */}
            <div 
              onClick={() => { 
                setActiveModal('payslip'); 
                setIsMenuOpen(false); 
                setIsPayslipRevealed(false); 
                setPasswordInput(''); 
                setShowPayslipPassword(false);
                setPayslipError(''); 
              }}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <span className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-white font-black text-[10px] uppercase tracking-wider shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                View Payslip (สลิปเงินเดือน)
              </span>
              <button className="w-11 h-11 rounded-full bg-gradient-to-br from-[#b58c4f] to-[#b7a159] hover:from-[#c8a56f] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 border border-white/20">
                <DollarSign size={18} />
              </button>
            </div>

            {/* Action 3: Appraisal Status */}
            <div 
              onClick={() => { setActiveModal('appraisal'); setIsMenuOpen(false); }}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <span className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-white font-black text-[10px] uppercase tracking-wider shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Appraisal Status (ผลประเมิน)
              </span>
              <button className="w-11 h-11 rounded-full bg-gradient-to-br from-[#3f809e] to-[#4d87a8] hover:from-[#5194b6] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 border border-white/20">
                <Award size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Main Floating Trigger Button */}
        <button 
          id="quick-actions-fab"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 transform active:scale-90 relative overflow-hidden group ${
            isMenuOpen 
              ? 'bg-slate-900 rotate-[135deg] hover:bg-slate-800' 
              : 'bg-gradient-to-r from-[#212c46] via-[#2a3c63] to-[#414757] hover:scale-105 hover:shadow-[#212c46]/40'
          }`}
          title="Quick Actions Menu"
        >
          {isMenuOpen ? (
            <X size={24} className="transition-transform duration-300" />
          ) : (
            <>
              <div className="absolute inset-0 bg-[#b7a159]/20 blur-md rounded-full animate-pulse opacity-50 z-0"></div>
              <Zap size={22} className="relative z-10 animate-bounce-subtle" />
            </>
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* 1. SUBMIT LEAVE REQUEST MODAL */}
      {/* ======================================================== */}
      <DraggableModal
        isOpen={activeModal === 'leave'}
        onClose={() => setActiveModal(null)}
        title={
          <span className="text-sm font-black uppercase text-[#212c46] tracking-widest flex items-center gap-2">
            <CalendarDays size={16} className="text-[#d96245]" /> Submit Leave Request / ยื่นใบเสนอขอลา
          </span>
        }
        width="max-w-2xl"
      >
        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100 h-full max-h-[80vh]">
          {/* Form Side */}
          <form onSubmit={handleLeaveSubmit} className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Employee Account</p>
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden shrink-0 flex items-center justify-center">
                  <User size={16} className="text-slate-500" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">พิมพพรรณ สวยงาม</h4>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Innovation Dept • Senior UX Designer</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#212c46] uppercase tracking-widest mb-1.5">Leave Type / ประเภทการลา</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'vacation', label: 'ลาพักร้อน', subtitle: 'Vacation', color: 'border-amber-400 text-amber-700 bg-amber-50/30' },
                  { value: 'sick', label: 'ลาป่วย', subtitle: 'Sick Leave', color: 'border-rose-400 text-rose-700 bg-rose-50/30' },
                  { value: 'business', label: 'ลากิจธุระ', subtitle: 'Business', color: 'border-sky-400 text-sky-700 bg-sky-50/30' },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setLeaveType(type.value)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      leaveType === type.value 
                        ? `${type.color} ring-2 ring-offset-1 ring-slate-400 shadow-sm font-bold scale-[1.02]` 
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white font-medium'
                    }`}
                  >
                    <span className="block text-xs">{type.label}</span>
                    <span className="block text-[8px] uppercase tracking-wider opacity-60 mt-0.5">{type.subtitle}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-[#212c46] uppercase tracking-widest mb-1">Start Date / เริ่มหยุด</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#4d87a8] focus:ring-1 focus:ring-[#4d87a8] outline-none transition-all bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-[#212c46] uppercase tracking-widest mb-1">End Date / สิ้นสุด</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#4d87a8] focus:ring-1 focus:ring-[#4d87a8] outline-none transition-all bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#212c46] uppercase tracking-widest mb-1">Reason / เหตุผลหรือความจำเป็น</label>
              <textarea
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                placeholder="ระบุเหตุผลย่อหรือความจำเป็นของการลาในระยะนี้..."
                rows={3}
                className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:border-[#4d87a8] focus:ring-1 focus:ring-[#4d87a8] outline-none transition-all resize-none bg-white font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#212c46] uppercase tracking-widest mb-1">Backup Representative / ลูกทีมผู้ประสานงานแทน (ถ้ามี)</label>
              <input
                type="text"
                value={leaveRepresentative}
                onChange={(e) => setLeaveRepresentative(e.target.value)}
                placeholder="ชื่อ-สกุล เพื่อนผู้ทำหน้าที่สแตนด์บายแทนระหว่างคุณหยุดงาน"
                className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:border-[#4d87a8] outline-none transition-all bg-slate-50/50 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={submitLoading}
              className={`w-full mt-2 py-3.5 bg-[#212c46] hover:bg-[#1a2338] text-white text-[10px] font-black uppercase rounded-xl tracking-widest shadow-md transition-all flex items-center justify-center gap-2 ${
                submitLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {submitLoading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> SUBMITTING TO HR SYSTEM...
                </>
              ) : (
                <>
                  <Send size={14} /> SUBMIT LEAVE LEAFLET / ส่งใบลาเข้าระบบ
                </>
              )}
            </button>
          </form>

          {/* History Side */}
          <div className="w-full lg:w-48 bg-slate-50/60 p-5 flex flex-col overflow-y-auto custom-scrollbar">
            <h4 className="text-[10px] font-black text-[#212c46] uppercase tracking-widest mb-4 border-b border-slate-200 pb-2 flex items-center gap-1.5 shrink-0">
              <Clock size={12} className="text-[#7a8b95]" /> Realtime Status
            </h4>
            
            <div className="space-y-3 flex-1">
              {leaveHistory.map((hist) => (
                <div key={hist.id} className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm relative overflow-hidden group">
                  <div className="flex items-center justify-between font-black text-[9px] uppercase tracking-wider text-slate-700">
                    <span className="font-extrabold">{hist.type}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black ${
                      hist.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      {hist.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">{hist.start} to {hist.end}</p>
                  <p className="text-[9px] text-[#4d87a8] font-black mt-1.5 uppercase">{hist.days} Days Applied</p>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-amber-500/10 text-amber-700 border border-amber-500/20 rounded-xl text-[10px] font-medium leading-relaxed shrink-0">
              <AlertTriangle size={13} className="shrink-0 mb-1" />
              <span>โควตาวันลาสะสมคงเหลือ (พักร้อน): <strong>4/6 วัน</strong></span>
            </div>
          </div>
        </div>
      </DraggableModal>

      {/* ======================================================== */}
      {/* 2. VIEW PAYSLIP MODAL */}
      {/* ======================================================== */}
      <DraggableModal
        isOpen={activeModal === 'payslip'}
        onClose={() => setActiveModal(null)}
        title={
          <span className="text-sm font-black uppercase text-[#212c46] tracking-widest flex items-center gap-2">
            <DollarSign size={16} className="text-[#b58c4f]" /> Secured Payroll Lookup / ดูใบจ่ายเงินเดือน
          </span>
        }
        width="max-w-xl"
      >
        <div className="p-6 flex flex-col h-full overflow-y-auto custom-scrollbar">
          
          {/* Security Gate (If not revealed yet) */}
          {!isPayslipRevealed ? (
            <div className="max-w-md mx-auto text-center py-10 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20 shadow-inner">
                <ShieldCheck size={32} className="animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-[#212c46] uppercase">Security Clearance Required</h3>
                <p className="text-xs text-[#7a8b95] leading-relaxed max-w-sm">
                  เพื่อป้องกันการเปิดเผยข้อมูลส่วนบุคคลภายนอกอาคาร กรุณาป้อนรหัสยืนยันตัวตนพนักงาน 4 หลัก ของคุณก่อนตรวจสอบสลิปการจ่ายเงิน
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="w-full flex flex-col gap-3">
                <div className="relative">
                  <input
                    type={showPayslipPassword ? "text" : "password"}
                    maxLength={4}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="ป้อนรหัสผ่าน 4 หลัก (ลองกด '1234')"
                    className="w-full p-3 pr-12 text-center border border-slate-200 rounded-xl text-sm font-sans tracking-[1.25em] pl-[1.25em] font-black focus:border-[#b58c4f] focus:ring-1 focus:ring-[#b58c4f] outline-none transition-all"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPayslipPassword(!showPayslipPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500/85 hover:text-slate-800 transition-colors"
                  >
                    {showPayslipPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {payslipError && <p className="text-[10px] text-red-500 font-bold uppercase">{payslipError}</p>}
                
                <button
                  type="submit"
                  className="w-full py-3 bg-[#212c46] hover:bg-[#1a2338] text-white text-[10px] font-black uppercase rounded-xl tracking-widest shadow-md transition-all"
                >
                  Confirm Identity / ยืนยันรหัสเข้าดู
                </button>
              </form>
            </div>
          ) : (
            /* Secure Payslip Content (PDF Mockup Style) */
            <div className="space-y-5 animate-fadeIn">
              
              {/* Document Header Panel */}
              <div className="flex justify-between items-start border-b border-dashed border-slate-200 pb-3 h-fit">
                <div className="flex items-center gap-2.5">
                  <Building2 size={36} className="text-[#212c46]" />
                  <div>
                    <h3 className="text-sm font-extrabold text-[#212c46] uppercase leading-none">Chaisri Agro Industrial</h3>
                    <p className="text-[8px] text-[#7a8b95] font-black mt-1 leading-none uppercase">ชัยศรีอุตสาหกรรมเกษตร • HR DEPARTMENT</p>
                  </div>
                </div>

                <div className="flex gap-2 items-center text-right">
                  <span className="text-[9px] text-[#7a8b95] font-black uppercase">Month Cycle:</span>
                  <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="p-1 px-2 border border-slate-200 rounded-lg text-[10px] font-extrabold text-[#212c46] outline-none bg-white focus:border-[#b58c4f]"
                  >
                    <option value="May 2026">May 2026</option>
                    <option value="April 2026">April 2026</option>
                    <option value="March 2026">March 2026</option>
                  </select>
                </div>
              </div>

              {/* Employee Basic Details */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px]">
                <div>
                  <span className="block text-slate-400 font-bold uppercase">Employee Code</span>
                  <span className="block font-black text-[#212c46]">CA-10245</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold uppercase">Full Name</span>
                  <span className="block font-black text-[#212c46]">พิมพพรรณ สวยงาม</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold uppercase">Section / Team</span>
                  <span className="block font-black text-[#212c46]">INNOVATION TEAM</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold uppercase">Bank Account</span>
                  <span className="block font-black text-[#212c46] font-mono">{currentPayslip.bankAccount}</span>
                </div>
              </div>

              {/* Two Column Earnings & Deductions Slip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Earnings */}
                <div className="border border-slate-100 rounded-xl bg-white p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3.5 flex items-center justify-between">
                      <span>EARNINGS / รายรับ</span>
                      <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded text-[8px]">THB</span>
                    </h4>
                    <div className="space-y-2.5 text-[11px] font-medium text-slate-600">
                      <div className="flex justify-between items-center">
                        <span>Base Salary / เงินเดือน</span>
                        <span className="font-mono font-bold text-slate-800">{currentPayslip.baseSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Overtime (OT) Pay / ค่าล่วงเวลา</span>
                        <span className="font-mono font-bold text-slate-800">{currentPayslip.otPay.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Variable Incentives / ค่าจูงใจ</span>
                        <span className="font-mono font-bold text-slate-800">{currentPayslip.incentives.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Allowances / ค่าวิชาชีพ</span>
                        <span className="font-mono font-bold text-slate-800">{currentPayslip.allowances.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-3 mt-4 flex justify-between items-center font-bold text-[12px] text-emerald-700 bg-emerald-50/20 p-2.5 rounded-lg">
                    <span>Total Earnings</span>
                    <span className="font-mono font-black">{totalEarnings.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border border-slate-100 rounded-xl bg-white p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3.5 flex items-center justify-between">
                      <span>DEDUCTIONS / รายจ่าย</span>
                      <span className="bg-rose-500/10 text-rose-600 px-2 py-0.5 rounded text-[8px]">THB</span>
                    </h4>
                    <div className="space-y-2.5 text-[11px] font-medium text-slate-600">
                      <div className="flex justify-between items-center">
                        <span>Provident Fund (3%) / กองทุนสำรอง </span>
                        <span className="font-mono font-bold text-slate-800">{currentPayslip.providentFund.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Withholding Income Tax / ภาษี</span>
                        <span className="font-mono font-bold text-slate-800">{currentPayslip.tax.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Social Security / ประกันสังคม</span>
                        <span className="font-mono font-bold text-slate-800">{currentPayslip.socialSecurity.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-3 mt-4 flex justify-between items-center font-bold text-[12px] text-rose-700 bg-rose-50/20 p-2.5 rounded-lg">
                    <span>Total Deductions</span>
                    <span className="font-mono font-black">{totalDeductions.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                </div>
              </div>

              {/* Net Cash Salary Slip Highlight */}
              <div className="bg-[#212c46] rounded-2xl p-5 text-white flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden">
                <div className="absolute right-[-10%] top-[-30%] opacity-10 rotate-12 pointer-events-none text-white">
                  <ShieldCheck size={180} />
                </div>
                <div className="relative z-10 text-center sm:text-left">
                  <span className="block text-[9px] text-[#b7a159] font-black uppercase tracking-[0.2em] mb-1">NET PAYOUT CASH VALUE</span>
                  <h4 className="text-3xl font-black font-mono tracking-tight text-[#b7a159]">
                    ฿{netSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </h4>
                  <p className="text-[10px] text-white/50 font-bold uppercase mt-1">transferred securely to your authorized bank vault</p>
                </div>

                <div className="flex items-center gap-2 relative z-10">
                  <button 
                    onClick={handleDownloadPayslip}
                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition-colors cursor-pointer"
                    title="Download Official PDF Slip"
                  >
                    <Download size={16} />
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="py-3 px-4 bg-[#b58c4f] hover:bg-[#b58c4f]/90 text-white font-black text-[10px] uppercase rounded-xl tracking-wider shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={13} /> Close and Print Slip
                  </button>
                </div>
              </div>

              {/* Security Audit Stamp Footer */}
              <div className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 mt-2">
                <ShieldCheck size={11} className="text-emerald-500" />
                <span>Verified HR Core ERP Integrity Server Stamp • Decryped 2026</span>
              </div>
            </div>
          )}
        </div>
      </DraggableModal>

      {/* ======================================================== */}
      {/* 3. CHECK APPRAISAL STATUS MODAL */}
      {/* ======================================================== */}
      <DraggableModal
        isOpen={activeModal === 'appraisal'}
        onClose={() => setActiveModal(null)}
        title={
          <span className="text-sm font-black uppercase text-[#212c46] tracking-widest flex items-center gap-2">
            <Award size={16} className="text-[#3f809e]" /> Performance Appraisal & Grading / ตรวจสอบผลประเมินครึ่งปี
          </span>
        }
        width="max-w-2xl"
      >
        <div className="p-6 flex flex-col h-full overflow-y-auto custom-scrollbar gap-5">
          
          {/* Top Grade Indicator Banner */}
          <div className="flex flex-col md:flex-row gap-5 items-center bg-slate-50 border border-slate-100 rounded-2xl p-5 shrink-0">
            {/* Circular Rating Grade Gauge */}
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="#eaeaec" strokeWidth="6" fill="transparent" />
                <circle cx="50" cy="50" r="42" stroke={THEME.skyBlue} strokeWidth="7" fill="transparent"
                  strokeDasharray="264" strokeDashoffset="18" strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-serif font-black text-[#212c46] leading-none">A</span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Excellent</span>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-1.5">
              <span className="bg-[#3f809e]/10 text-[#3f809e] px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border border-[#3f809e]/20">
                FY2026 Mid-Year Appraisal Period
              </span>
              <h3 className="text-base font-black text-[#212c46] leading-none uppercase mt-2">Employee Grade Summary</h3>
              <p className="text-xs text-[#7a8b95] leading-relaxed">
                การประเมินประสมผลงานรอบครึ่งสัญญาสะสม 180 วัน ได้รับการทบทวน ร่วมประเมินด้วยความเห็นพ้องของหัวหน้าแผนกจัดสรร และผ่านการสอบพยาน HR Audit เรียบร้อยแล้วค่ะ
              </p>
            </div>
          </div>

          {/* Core Appraisal KPI Attributes progress */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-dashed border-slate-100 pb-2 mb-1 flex items-center gap-1.5">
              <Activity size={12} className="text-[#3f809e]" /> KPI Matrix Evaluation
            </h4>

            {[
              { label: 'Key Results & Deliverables / ผลสัมฤทธิ์ตามตัวเป้าตัววัด KPIs', score: 92, targetValue: '90%', color: THEME.burntOrange },
              { label: 'Core Values & Team Collaboration / ค่านิยมหลักและการมีส่วนร่วมร่วมทีม', score: 88, targetValue: '85%', color: THEME.gold },
              { label: 'Policy & Operational Compliance / วินัย ความคุ้มครองและความถูกต้องของระเบียบ', score: 100, targetValue: '100%', color: THEME.success }
            ].map((kpi, idx) => (
              <div key={idx} className="space-y-1 bg-white p-3.5 border border-slate-100 rounded-xl shadow-sm">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-extrabold text-[#212c46]">{kpi.label}</span>
                  <span className="font-black text-slate-700">Score & Achievement: <span className="text-[#3f809e] text-xs font-mono">{kpi.score}%</span> (Target: {kpi.targetValue})</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-50 border border-slate-100 overflow-hidden relative flex items-center mt-1">
                  <div 
                    className="h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${kpi.score}%`, backgroundColor: kpi.color }} 
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Supervisor Comments Panel */}
          <div className="bg-[#b58c4f]/5 border border-[#b58c4f]/20 rounded-2xl p-5 relative overflow-hidden group">
            <div className="absolute right-[-4%] bottom-[-8%] text-[#b58c4f] opacity-[0.04] stroke-thin pointer-events-none">
              <Sparkles size={110} />
            </div>
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <Heart size={14} className="text-[#b58c4f]" />
              <span className="text-[10px] font-black text-[#b58c4f] uppercase tracking-widest">Supervisor Feedback / คำนิยมและประเมินแนะแนวทาง</span>
            </div>
            
            <p className="text-xs text-slate-700 italic font-medium leading-relaxed font-serif relative z-10 pl-4 border-l-2 border-[#b58c4f]">
              "พิมพพรรณ เป็นพนักงานที่มีเป้าหมายความประณีต ผลการทำงานมีคุณภาพสูงอย่างต่อเนื่อง ตลอดบทบาทใน Innovation Team มีความสามารถในการเชื่อมประสานนำทีมได้กระตือรือร้นและยอดเยี่ยมมาก ช่วยทีมจัดสรรแก้ไขปัญหาใหญ่เชิงวิศวกรรมได้เด่นชัด ขอชื่นชมในความทุ่มเทและการรักษามาตรฐาน ISO9001 ที่สมบูรณ์แบบค่ะ!"
            </p>

            <div className="text-right text-[9px] text-[#7a8b95] font-bold uppercase mt-3 tracking-widest relative z-10">
              — คุณเกริกพล มานิมิตร (Director, People & Culture, Chaisri Industry)
            </div>
          </div>

          {/* Timeline Audit Trail */}
          <div className="space-y-3 shrink-0">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Audit Lifecycle Milestone</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { title: 'Self Evaluation', date: '10 May 2026', done: true },
                { title: 'Supervisor Approved', date: '15 May 2026', done: true },
                { title: 'HR Committee Calibrated', date: '21 May 2026', done: true },
                { title: 'Final Grade Disclosed', date: '01 Jun 2026', done: true },
              ].map((mil, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[10px] flex gap-2 items-center relative overflow-hidden">
                  <div className={`p-1 rounded-full ${mil.done ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-200'}`}>
                    <CheckSquare size={13} />
                  </div>
                  <div>
                    <span className="block font-black text-[#212c46] truncate">{mil.title}</span>
                    <span className="block text-[8px] text-slate-400 font-semibold">{mil.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </DraggableModal>
    </>
  );
}
