import React, { useState, useEffect } from 'react';
import { 
  X, Check, AlertTriangle, FileText, Calendar, User, Briefcase, 
  Clock, Volume2, VolumeX, Sparkles, AlertCircle, RefreshCw, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Swal from 'sweetalert2';
import { dbSync } from '../../services/dbSync';
import KpiCard from './KpiCard';

interface PendingApprovalsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PendingApprovalsPanel({ isOpen, onClose }: PendingApprovalsPanelProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'leaves' | 'appraisals'>('all');
  const [leaves, setLeaves] = useState<any[]>([]);
  const [appraisals, setAppraisals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const fetchPendingData = async () => {
    setLoading(true);
    try {
      // Fetch leaves
      const leaveRes = await dbSync.read('LeaveRequests');
      if (leaveRes?.status === 'success' && leaveRes?.data?.items) {
        // Find those pending approval
        const pendingLeaves = leaveRes.data.items.filter((item: any) => 
          item.status && (item.status.includes('Pending') || item.status.includes('รอการอ้างอิง'))
        );
        setLeaves(pendingLeaves);
      }

      // Fetch appraisals
      const appraisalRes = await dbSync.read('appraisals');
      if (appraisalRes?.status === 'success' && appraisalRes?.data?.items) {
        // Find pending appraisals (Pending HR Alignment or similar)
        const pendingAppraisals = appraisalRes.data.items.filter((item: any) => 
          item.status && (item.status.includes('Pending') || item.status.includes('รอการสอบ'))
        );
        setAppraisals(pendingAppraisals);
      }
    } catch (error) {
      console.error('Failed to load pending approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPendingData();
    }
  }, [isOpen]);

  // Listen to external DB updates to keep in sync
  useEffect(() => {
    const handleDbUpdated = () => {
      fetchPendingData();
    };
    window.addEventListener('db-updated', handleDbUpdated);
    return () => window.removeEventListener('db-updated', handleDbUpdated);
  }, []);

  const playSuccessChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      gain1.gain.setValueAtTime(0.06, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.4);

      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
        gain2.gain.setValueAtTime(0.06, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.4);
      }, 100);

      setTimeout(() => {
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(783.99, ctx.currentTime); // G5
        gain3.gain.setValueAtTime(0.08, ctx.currentTime);
        gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        osc3.start();
        osc3.stop(ctx.currentTime + 0.65);
      }, 200);
    } catch (e) {
      console.log('Audio chime blocked by browser autoplay settings');
    }
  };

  const playRejectChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(293.66, ctx.currentTime); // D4
      gain1.gain.setValueAtTime(0.08, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.35);

      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(220.00, ctx.currentTime); // A3
        gain2.gain.setValueAtTime(0.08, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.45);
      }, 150);
    } catch (e) {
      console.log('Audio chime blocked');
    }
  };

  const handleLeaveAction = async (leave: any, approve: boolean) => {
    const actionText = approve ? 'อนุมัติการลา (Approve)' : 'ปฏิเสธคำขอการลา (Reject)';
    const result = await Swal.fire({
      title: `${actionText} ของคุณ ${leave.employeeName}?`,
      text: approve 
        ? `ยืนยันการสรุปผลและอนุมัติวันหยุดลาแบบ ${leave.type} จำนวน ${leave.days} วัน พนักงานท่านนี้จะได้รับสิทธิวันหยุดทันทีค่ะ`
        : `กรุณากรอกเหตุผลหรือคำเสนอแนะในกรณีปฏิเสธการขอลาพักผ่อน`,
      icon: approve ? 'question' : 'warning',
      input: approve ? undefined : 'text',
      inputPlaceholder: approve ? undefined : 'กรอกเหตุผลปฏิเสธการลา...',
      showCancelButton: true,
      confirmButtonText: approve ? 'ยืนยันการอนุมัติ' : 'ปฏิเสธคำขอลา',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: approve ? '#657f4d' : '#932c2e',
      cancelButtonColor: '#7a8b95',
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const updatedStatus = approve ? 'Approved' : 'Rejected';
        const updatedLeave = {
          ...leave,
          status: updatedStatus,
          rejectionReason: !approve ? (result.value || 'ไม่ผ่านอนุมัติเนื่องจากเหตุผลความจำเป็นของทีมงาน') : undefined
        };

        await dbSync.update('LeaveRequests', [updatedLeave]);
        
        // Update local state
        setLeaves(prev => prev.filter(l => l.id !== leave.id));
        
        // Play acoustic chime
        if (approve) {
          playSuccessChime();
        } else {
          playRejectChime();
        }

        // Notify other systems/pages
        window.dispatchEvent(new CustomEvent('db-updated'));

        Swal.fire({
          icon: 'success',
          title: approve ? 'อนุมัติใบลาเสร็จสิ้นค่ะ' : 'ปฏิเสธใบลาเรียบร้อยแล้วค่ะ',
          text: `ทำเครื่องหมายรายการขอลาของ ${leave.employeeName} เป็น ${updatedStatus} สำเร็จ`,
          confirmButtonColor: '#212c46'
        });
      } catch (err) {
        console.error('Leave action write error:', err);
        Swal.fire('Error', 'ไม่สามารถปรับเปลี่ยนสถานะใบลาได้ กรุณาลองใหม่อีกครั้งค่ะ', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAppraisalAction = async (appraisal: any, approve: boolean) => {
    const actionText = approve ? 'อนุมัติการประเมิน (Approve & Calibrate)' : 'ตีกลับแก้ไขประเมินผล';
    const result = await Swal.fire({
      title: `${actionText} ของคุณ ${appraisal.employeeName}?`,
      text: approve 
        ? `ยืนยันการปรับสอบเกรดความสมบูรณ์และ Calibration เกรด "${appraisal.grade}" (คะแนนดิบ: ${appraisal.score}%) ของรอบ ${appraisal.period}`
        : `กรอกข้อความแนะแนวทางที่ต้องการให้ผู้ควบคุมประเมินทบทวนแก้ไขใหม่`,
      icon: approve ? 'success' : 'warning',
      input: approve ? undefined : 'text',
      inputPlaceholder: approve ? undefined : 'กรอกจุดที่พึงระวังหรือจุดให้แก้ไข...',
      showCancelButton: true,
      confirmButtonText: approve ? 'ยืนยันเกรดความลื่นไหล' : 'ตีกลับคำขอประเมิน',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: approve ? '#3f809e' : '#932c2e',
      cancelButtonColor: '#7a8b95',
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const updatedStatus = approve ? 'Calibrated & Released' : 'Rejected for Calibration';
        const updatedAppraisal = {
          ...appraisal,
          status: updatedStatus,
          rejectionReason: !approve ? (result.value || 'ต้องการ calibration แต้มเกณฑ์สัมพันธ์ใหม่') : undefined
        };

        await dbSync.update('appraisals', [updatedAppraisal]);
        
        // Update local state
        setAppraisals(prev => prev.filter(a => a.id !== appraisal.id));
        
        // Play acoustic chime
        if (approve) {
          playSuccessChime();
        } else {
          playRejectChime();
        }

        // Notify other systems/pages
        window.dispatchEvent(new CustomEvent('db-updated'));

        Swal.fire({
          icon: 'success',
          title: approve ? 'อนุมัติและปรับสอบสำเร็จ!' : 'ตีกลับใบประเมินผลเรียบร้อย',
          text: `เกรดประเมินผลพนักงาน ${appraisal.employeeName} ได้รับคำสั่ง ${updatedStatus} สำเร็จ`,
          confirmButtonColor: '#212c46'
        });
      } catch (err) {
        console.error('Appraisal action write error:', err);
        Swal.fire('Error', 'ไม่สามารถบันทึกสถานะได้ค่ะ', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const totalPendingCount = leaves.length + appraisals.length;

  const filteredLeaves = activeTab === 'all' || activeTab === 'leaves' ? leaves : [];
  const filteredAppraisals = activeTab === 'all' || activeTab === 'appraisals' ? appraisals : [];
  const totalDisplayItems = filteredLeaves.length + filteredAppraisals.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900 z-40 cursor-pointer"
          />

          {/* Drawer side-panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 24, stiffness: 220 }}
            className="fixed top-0 right-0 h-screen w-full sm:w-[500px] bg-[#f8f9fa] shadow-2xl border-l border-slate-200/80 z-50 flex flex-col overflow-hidden"
          >
            {/* Header section with theme styles */}
            <div className="bg-[#212c46] text-white p-6 relative shrink-0">
              <div className="absolute right-6 top-6 flex items-center gap-2">
                <button 
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all"
                  title="เปิด/ปิด เสียงอคูสติค"
                >
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <button 
                  onClick={onClose}
                  className="p-1.5 rounded-lg bg-[#b58c4f] hover:bg-[#c8a56f] text-white transition-all shadow-md"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#b58c4f] flex items-center justify-center text-white shrink-0 shadow-md">
                  <AlertCircle size={20} className="animate-pulse text-white" />
                </div>
                <div>
                  <h2 className="text-md font-black uppercase tracking-wider flex items-center gap-1.5">
                    <span>Pending Approvals</span>
                    {totalPendingCount > 0 && (
                      <span className="bg-rose-500 text-white text-[10px] font-black h-5 px-1.5 rounded-full flex items-center justify-center animate-bounce">
                        {totalPendingCount}
                      </span>
                    )}
                  </h2>
                  <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-0.5">
                    คณะกรรมการและส่วนตรวจสอบการลา / ผลประเมินรายบุคคล
                  </p>
                </div>
              </div>

              {/* Dynamic stats row using centralized clean design */}
              <div className="grid grid-cols-3 gap-3.5 mt-5">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col justify-between">
                  <span className="text-[8px] text-white/60 font-black uppercase tracking-wider">Total Queue</span>
                  <span className="text-xl font-bold text-[#b58c4f] mt-1">{totalPendingCount}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col justify-between">
                  <span className="text-[8px] text-white/60 font-black uppercase tracking-wider">Leaves</span>
                  <span className="text-xl font-bold text-amber-500 mt-1">{leaves.length}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col justify-between">
                  <span className="text-[8px] text-white/60 font-black uppercase tracking-wider">Appraisals</span>
                  <span className="text-xl font-bold text-[#3f809e] mt-1">{appraisals.length}</span>
                </div>
              </div>
            </div>

            {/* Sticky Navigation Tabs */}
            <div className="bg-white border-b border-slate-200/80 px-4 py-3 shrink-0 flex gap-2 justify-between items-center select-none shadow-sm">
              <div className="flex gap-1.5">
                {[
                  { id: 'all', label: `All (${totalPendingCount})` },
                  { id: 'leaves', label: `Leaves (${leaves.length})` },
                  { id: 'appraisals', label: `Appraisals (${appraisals.length})` }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === tab.id 
                        ? 'bg-[#212c46] text-white font-bold scale-[1.01]' 
                        : 'bg-[#f3f3f1] hover:bg-slate-200 text-slate-600 font-bold'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button 
                onClick={fetchPendingData}
                className="p-1 px-2 hover:bg-slate-50 text-[9px] font-black uppercase text-slate-500 hover:text-[#212c46] rounded-md border border-slate-200 flex items-center gap-1 cursor-pointer"
                title="คลิกเพื่อรีเฟรชข้อมูลคำขอ"
              >
                <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
                <span>Reload</span>
              </button>
            </div>

            {/* Scrollable pending stack section */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {loading && totalDisplayItems === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                  <RefreshCw size={24} className="text-[#b58c4f] animate-spin" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    กำลังดึงข้อมูลใบลาและประเมินผล...
                  </span>
                </div>
              ) : totalDisplayItems === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 border border-slate-200/50">
                    <Check size={28} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#212c46] uppercase">All Cleared / ไม่มีรายการค้าง</h4>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                      คำขออนุมัติการลาและคะแนนประเมินเกรดได้รับการ Calibrate ตรวจสอบครบสมบูรณ์ร้อยเปอร์เซ็นต์ค่ะ!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Leaves Segment */}
                  {filteredLeaves.map((leave) => (
                    <div 
                      key={leave.id} 
                      className="bg-white border border-slate-200/80 rounded-2xl p-4.5 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 bg-amber-500 h-full" />
                      
                      {/* Name & Department Header */}
                      <div className="flex justify-between items-start gap-2 border-b border-slate-100 pb-2.5 mb-2.5">
                        <div className="flex gap-2 items-center">
                          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                            <Calendar size={14} />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-[#212c46] leading-none uppercase">{leave.employeeName}</h4>
                            <span className="text-[8px] font-bold text-slate-400 uppercase mt-1 block">
                              {leave.department} • Days: <strong className="text-amber-600">{leave.days}</strong>
                            </span>
                          </div>
                        </div>
                        <span className="bg-amber-100/60 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                          {leave.type}
                        </span>
                      </div>

                      {/* Leave explanation body description */}
                      <div className="space-y-2 select-text">
                        <div className="bg-slate-50 p-2.5 border border-slate-100 rounded-xl text-[11px] leading-relaxed text-slate-600">
                          <strong className="text-slate-800 flex items-center gap-1.5 mb-1 text-[10px]">
                            <Clock size={11} className="text-slate-400" />
                            <span>ระยะเวลา: </span>
                            <span className="font-mono text-xs">{leave.start} ถึง {leave.end}</span>
                          </strong>
                          <strong>เหตุผลความจำเป็น: </strong> 
                          {leave.reason || 'ไม่ได้ทำบันทึกคำอธิบาย'}
                        </div>
                      </div>

                      {/* Footer Actions Panel */}
                      <div className="flex gap-2.5 justify-end items-center mt-3.5 pt-3 border-t border-dashed border-slate-100 select-none">
                        <span className="text-[8px] text-slate-400 font-mono font-bold mr-auto">ID: {leave.id}</span>
                        
                        <button
                          onClick={() => handleLeaveAction(leave, false)}
                          className="px-3 py-1.5 rounded-lg border border-[#932c2e]/20 text-[#932c2e] hover:bg-[#932c2e]/10 text-[9px] font-black uppercase flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleLeaveAction(leave, true)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#657f4d] hover:bg-[#576e42] hover:shadow-emerald-500/10 text-white text-[9px] font-black uppercase flex items-center gap-1 cursor-pointer shadow-sm transition-colors"
                        >
                          <Check size={11} /> Approve
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Appraisals Segment */}
                  {filteredAppraisals.map((appraisal) => (
                    <div 
                      key={appraisal.id} 
                      className="bg-white border border-[#3f809e]/30 rounded-2xl p-4.5 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 bg-[#3f809e] h-full" />
                      
                      {/* Name & Evaluation grade Header */}
                      <div className="flex justify-between items-start gap-2 border-b border-slate-100 pb-2.5 mb-2.5">
                        <div className="flex gap-2 items-center">
                          <div className="p-1.5 rounded-lg bg-[#3f809e]/10 text-[#3f809e]">
                            <Award size={14} />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-[#212c46] leading-none uppercase">{appraisal.employeeName}</h4>
                            <span className="text-[8.5px] font-black text-[#3f809e] uppercase mt-1 block">
                              {appraisal.department} • Period: {appraisal.period}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-lg font-serif font-black text-[#3f809e] leading-none">
                            {appraisal.grade || 'A'}
                          </span>
                          <span className="text-[7.5px] text-slate-400 font-extrabold mt-0.5">SCORE: {appraisal.score}%</span>
                        </div>
                      </div>

                      {/* Appraisal notes/matrix details context */}
                      <div className="space-y-2 select-text">
                        <div className="bg-slate-50 p-2.5 border border-slate-100 rounded-xl text-[11px] leading-relaxed text-slate-600">
                          <p className="mb-1 text-[10px] text-slate-700 font-bold">
                            คำเห็นหัวหน้าฝ่าย / Supervisor Comments:
                          </p>
                          <p className="italic font-serif pl-3 border-l text-xs border-slate-300">
                            "{appraisal.supervisorComments || 'อยู่ระหว่างใส่คำอธิบายกระบวนงานบุคคล'}"
                          </p>
                        </div>
                      </div>

                      {/* Footer Actions Panel */}
                      <div className="flex gap-2.5 justify-end items-center mt-3.5 pt-3 border-t border-dashed border-slate-100 select-none">
                        <span className="text-[8px] text-slate-400 font-mono font-bold mr-auto">ID: {appraisal.id}</span>
                        
                        <button
                          onClick={() => handleAppraisalAction(appraisal, false)}
                          className="px-3 py-1.5 rounded-lg border border-[#932c2e]/20 text-[#932c2e] hover:bg-[#932c2e]/10 text-[9px] font-black uppercase flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          Revise
                        </button>
                        <button
                          onClick={() => handleAppraisalAction(appraisal, true)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#3f809e] hover:bg-[#2f6680] text-white text-[9px] font-black uppercase flex items-center gap-1 cursor-pointer shadow-sm transition-all"
                        >
                          <Check size={11} /> Calibrate Grade
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sticky footer informational layout */}
            <div className="bg-slate-50 p-4 border-t border-slate-200/80 text-[10px] leading-relaxed text-slate-400 font-serif shrink-0 italic text-center select-none">
              Smart HR Engine • การทำรายการทั้งหมดได้รับการตอบกลับไปสู่ศูนย์คลังข้อมูล Google Sheets ทันทีตามมาตรฐาน ISO และการควบคุมคุณภาพกระบวนงานของบริษัท
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
