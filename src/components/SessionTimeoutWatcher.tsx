import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { DraggableModal } from './shared/DraggableModal';
import { ShieldAlert, Timer, RefreshCw, LogOut, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';

// Standard themes matching core layout
const THEME = {
  primary: '#212c46',
  primaryLight: '#4d87a8',
  danger: '#932c2e',
  success: '#657f4d',
  amber: '#a94228',
  slateDark: '#1d2636'
};

export default function SessionTimeoutWatcher() {
  const { isAuthenticated, logout } = useAuth();
  
  // Load session security configs from localStorage or use robust defaults
  const [sessionDuration, setSessionDuration] = useState<number>(() => {
    const saved = localStorage.getItem('cfg_session_duration_sec');
    return saved ? parseInt(saved, 10) : 900; // default 15 minutes
  });

  const [warnThreshold, setWarnThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('cfg_warn_threshold_sec');
    return saved ? parseInt(saved, 10) : 120; // default 2 minutes
  });

  const [timeLeft, setTimeLeft] = useState<number>(sessionDuration);
  const [isWarningOpen, setIsWarningOpen] = useState<boolean>(false);
  const [isPlayingAlertChime, setIsPlayingAlertChime] = useState<boolean>(false);

  // Refs for tracking timer and last activity
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActiveRef = useRef<number>(Date.now());
  const soundEnabledRef = useRef<boolean>(true);

  // Keep state updated in case localStorage changes from settings page
  useEffect(() => {
    const handleStorageChange = () => {
      const savedDuration = localStorage.getItem('cfg_session_duration_sec');
      const savedThreshold = localStorage.getItem('cfg_warn_threshold_sec');
      
      const newDuration = savedDuration ? parseInt(savedDuration, 10) : 900;
      const newThreshold = savedThreshold ? parseInt(savedThreshold, 10) : 120;

      setSessionDuration(newDuration);
      setWarnThreshold(newThreshold);
      
      // Rescale timeLeft if warning modal is not active to prevent instant jumps
      if (!isWarningOpen) {
        setTimeLeft(newDuration);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Also listen to a custom event for instant multi-component local sync on same page
    window.addEventListener('session-config-updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('session-config-updated', handleStorageChange);
    };
  }, [isWarningOpen]);

  // Synthesize warning bell acoustic chime using Web Audio API to alert user politely
  const playWarningChime = () => {
    if (!soundEnabledRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Tone 1: Warn chord
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(440, ctx.currentTime); // A4
      gain1.gain.setValueAtTime(0.06, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.9);

      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(554.37, ctx.currentTime); // C#5
        gain2.gain.setValueAtTime(0.06, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 1.3);
      }, 200);
    } catch (e) {
      console.log('Audio blocked by user gesture requirements');
    }
  };

  // Main timer handler
  useEffect(() => {
    if (!isAuthenticated) {
      // Clear timers and close warnings when logged out
      if (timerRef.current) clearInterval(timerRef.current);
      setIsWarningOpen(false);
      return;
    }

    // Reset timer back to current session duration on initial sign-in
    setTimeLeft(sessionDuration);
    lastActiveRef.current = Date.now();

    timerRef.current = setInterval(() => {
      // Periodic countdown check
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAuthenticated, sessionDuration, warnThreshold]);

  // Handle warnings and auto-logout triggered by timeLeft changes
  useEffect(() => {
    if (!isAuthenticated) return;

    if (timeLeft <= warnThreshold && timeLeft > 0) {
      if (!isWarningOpen) {
        setIsWarningOpen(true);
        playWarningChime();
      }
    }

    if (timeLeft === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      handleSessionExpired();
    }
  }, [timeLeft, warnThreshold, isWarningOpen, isAuthenticated]); // Added dependency to react when timeLeft drops

  // Monitor user activities to keep session fresh
  useEffect(() => {
    if (!isAuthenticated || isWarningOpen) return;

    const handleUserActivity = () => {
      const now = Date.now();
      // Throttle activity updates to once every 2 seconds for performance
      if (now - lastActiveRef.current > 2000) {
        lastActiveRef.current = now;
        setTimeLeft(sessionDuration);
        
        // Update a temporary shared key in localStorage so other tabs (if multi-window) can keep active together!
        localStorage.setItem('session_last_activity_ts', String(now));
      }
    };

    // Standard DOM listeners representing real user interaction
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'click', 'touchstart'];
    events.forEach(event => window.addEventListener(event, handleUserActivity));

    return () => {
      events.forEach(event => window.removeEventListener(event, handleUserActivity));
    };
  }, [isAuthenticated, isWarningOpen, sessionDuration]);

  // Sync across screens if someone is active in another tab
  useEffect(() => {
    if (!isAuthenticated || isWarningOpen) return;

    const handleStorageSync = (e: StorageEvent) => {
      if (e.key === 'session_last_activity_ts' && e.newValue) {
        // Reset timer as we observed activity on another tab
        setTimeLeft(sessionDuration);
      }
    };

    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, [isAuthenticated, isWarningOpen, sessionDuration]);

  // Reset/Extend the session
  const extendSession = () => {
    setTimeLeft(sessionDuration);
    lastActiveRef.current = Date.now();
    localStorage.setItem('session_last_activity_ts', String(Date.now()));
    setIsWarningOpen(false);

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'ต่อเวลาเซสชันสำเร็จ',
      text: 'ระบบได้เพิ่มอายุความปลอดภัยและการเข้าถึงข้อมูลของคุณเรียบร้อยแล้วค่ะ',
      showConfirmButton: false,
      timer: 2500,
      background: '#f8f9fa',
      iconColor: THEME.success
    });
  };

  // Immediate manual logout
  const handleManualLogout = () => {
    setIsWarningOpen(false);
    logout();
    Swal.fire({
      icon: 'info',
      title: 'ออกจากระบบสำเร็จ',
      text: 'คุณได้ออกจากเซสชันรักษาความปลอดภัยด้วยตนเองเรียบร้อยแล้วค่ะ',
      confirmButtonColor: THEME.primary
    });
  };

  // Automatic logout due to inactivity
  const handleSessionExpired = () => {
    setIsWarningOpen(false);
    logout();
    
    Swal.fire({
      icon: 'warning',
      title: 'เซสชันหมดอายุ',
      html: `
        <div class="text-left font-sans text-xs leading-relaxed space-y-2">
          <p class="font-extrabold text-slate-800 text-sm">การเชื่อมต่อขาดช่วงเนื่องจากไม่มีกิจกรรมตามช่วงเวลาที่กำหนด</p>
          <p class="text-slate-500 font-medium font-thai">เพื่อป้องกันประสิทธิภาพสูงสุดของคลังข้อมูล Google Sheets และระบบเครือข่ายของ <strong>บริษัท ชัยศรีอุตสาหกรรมเกษตร จำกัด</strong> กรุณาเข้าสู่ระบบใหม่อีกครั้งค่ะ</p>
        </div>
      `,
      confirmButtonColor: THEME.danger,
      confirmButtonText: 'รับทราบค่านโยบาย'
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Compute stats/warnings
  const percentLeft = (timeLeft / sessionDuration) * 100;
  const isUrgent = timeLeft <= 30; // highlight yellow/red under 30 seconds

  return (
    <>
      {/* Draggable warning modal */}
      <DraggableModal
        isOpen={isWarningOpen}
        onClose={extendSession} // Click 'X' to extend session as a safeguard
        title={
          <div className="flex items-center gap-2 text-rose-700 font-black tracking-wider text-xs">
            <ShieldAlert size={16} className="animate-bounce" />
            <span>SECURITY TIMEOUT ALERT / เตือนภัยระยะเวลาเซสชัน</span>
          </div>
        }
        width="max-w-md"
      >
        <div className="p-6 space-y-5 flex flex-col font-sans select-none bg-slate-50/50">
          
          {/* Header Visual with Pulsing alert */}
          <div className="flex flex-col items-center justify-center text-center py-2">
            <div className={`relative w-20 h-20 rounded-full flex items-center justify-center border-4 ${
              isUrgent ? 'border-red-500/20 bg-red-50 text-red-600' : 'border-amber-500/20 bg-amber-50 text-amber-600'
            }`}>
              <Timer size={40} className="animate-pulse" />
              
              {/* Spinning status ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke={isUrgent ? '#e11d48' : '#d97706'}
                  strokeWidth="3.5"
                  fill="transparent"
                  strokeDasharray="226"
                  strokeDashoffset={226 - (226 * percentLeft) / 100}
                  className="transition-all duration-100"
                />
              </svg>
            </div>
            
            <h3 className="mt-4 text-2xl font-black text-[#212c46] font-mono tracking-tight">
              {formatTime(timeLeft)}
            </h3>
            <p className="text-[10px] font-black uppercase text-rose-600 tracking-widest mt-1">
              {timeLeft <= 10 ? 'Auto-logging out in seconds!' : 'Session Expiring Soon!'}
            </p>
          </div>

          {/* Bilingual Detailed Explanation Message */}
          <div className="bg-white border border-slate-200/60 rounded-2xl p-4.5 shadow-sm space-y-2">
            <div className="flex gap-2 items-start">
              <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-slate-800 leading-relaxed uppercase">
                Are you still working with us?
              </p>
            </div>
            <p className="text-[11.5px] font-medium text-slate-500 leading-relaxed pl-5 font-thai">
              คุณไม่ได้ใช้งานระบบหรือป้อนข้อมูลใดๆ มาระยะหนึ่งแล้ว เพื่อรักษาความปลอดภัยของสิทธิ์ผู้บริหารและบัญชี ERP ระบบจะทำการปิดเซสชันและทำความสะอาดแคชในอีกสักครู่ค่ะ
            </p>
          </div>

          {/* Action buttons list */}
          <div className="grid grid-cols-2 gap-3 pb-1 shrink-0">
            <button
              onClick={handleManualLogout}
              className="py-3.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[#212c46] hover:text-[#932c2e] text-[10px] font-black uppercase rounded-xl tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut size={14} />
              <span>Log Out / ปิดเซสชัน</span>
            </button>

            <button
              onClick={extendSession}
              className="py-3.5 bg-gradient-to-r from-[#212c46] to-[#121b2d] text-white hover:from-[#121b2d] text-[10px] font-black uppercase rounded-xl tracking-widest shadow-md border border-[#b58c4f]/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw size={14} className="animate-spin-slow text-[#b58c4f]" />
              <span>EXTEND / ต่ออายุ</span>
            </button>
          </div>

          {/* Institutional footer */}
          <div className="text-[8.5px] font-black uppercase tracking-widest text-[#7a8b95] text-center font-mono">
            CHAI SRI AGRO-INDUSTRIAL SECURITY GATEWAY • SYSTEM SEC 01
          </div>

        </div>
      </DraggableModal>
    </>
  );
}
