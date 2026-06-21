import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import SecurityGuard from './SecurityGuard';
import { useAuth } from '../context/AuthContext';
import { PhoneCall, Mail, Bug } from 'lucide-react';
import SessionTimeoutWatcher from './SessionTimeoutWatcher';
import PendingApprovalsPanel from './shared/PendingApprovalsPanel';
import { QuickActionsMenu } from './shared/QuickActionsMenu';

const resolveDriveUrl = (url: string): string => {
  if (!url) return '';
  let fileId = '';
  const dLinkMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
  
  if (dLinkMatch) {
    fileId = dLinkMatch[1];
  } else if (idParamMatch) {
    fileId = idParamMatch[1];
  } else if (/^[a-zA-Z0-9-_]+$/.test(url.trim())) {
    fileId = url.trim();
  }
  
  if (fileId) {
    return `https://docs.google.com/uc?export=download&id=${fileId}`;
  }
  return url;
};

export default function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPendingPanelOpen, setIsPendingPanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  const getReportTitle = (pathname: string) => {
    const cleanPath = pathname.split('?')[0];
    if (cleanPath.includes('/payroll')) return 'INTEGRATED PAYROLL DISBURSAL & LABOUR EXCLUSION DISPOSITION REPORT';
    if (cleanPath === '/' || cleanPath === '/home') return 'EXECUTIVE GENERAL OVERVIEW REPORT';
    if (cleanPath.includes('/attendance')) return 'ATTENDANCE TIMESHEET & WEEKLY SHIFT PLANNER STATUS REPORT';
    if (cleanPath.includes('/leave')) return 'EMPLOYEE LEAVE DISPOSITION & ACCRUED BALANCE EXCLUSIONS';
    if (cleanPath.includes('/appraisals') || cleanPath.includes('/performance')) return 'PERFORMANCE EVALUATION INDEX & KPI APPRAISEMENTS RECORD';
    if (cleanPath.includes('/copilot')) return 'AI CO-PILOT STRATEGIC ORGANIZATIONAL HR POLICY REPORT';
    if (cleanPath.includes('/doc-summarizer')) return 'HR DOCUMENTS DIGEST & SUMMARIZED MANIFEST';
    if (cleanPath.includes('/calendar') || cleanPath.includes('/hr-calendar')) return 'MASTER WORKFORCE SCHEDULE & HOLIDAYS DISPOSITION';
    if (cleanPath.includes('/dev-permit')) return 'CONFIDENTIAL WORKSPACE EXEMPTIONS & PERMITS LOG';
    if (cleanPath.includes('/permissions')) return 'SYSTEM ACCESS POLICIES & CREDENTIALS AUTHORIZATION REGISTER';
    if (cleanPath.includes('/settings')) return 'SYSTEM COMPLIANCE PARAMETERS & METADATA CONFIGS';
    if (cleanPath.includes('/dev-logs') || cleanPath.includes('/logs')) return 'SYSTEM OPERATIONS AUDIT TRAIL LOG';
    return 'WORKFORCE ARCHIVAL DATA DISPOSITION REPORT';
  };

  const getReportId = (pathname: string) => {
    const cleanPath = pathname.split('?')[0];
    const codeMap: Record<string, string> = {
      '/': 'GEN-01',
      '/payroll': 'PAY-12',
      '/attendance': 'ATT-02',
      '/leave': 'LVE-03',
      '/appraisals': 'APP-04',
      '/copilot': 'COP-05',
      '/doc-summarizer': 'SUM-06',
      '/hr-calendar': 'CAL-07',
      '/dev-permit': 'PRM-08',
      '/permissions': 'SEC-09',
      '/settings': 'CFG-10',
      '/dev-logs': 'LOG-11'
    };
    const key = Object.keys(codeMap).find(k => cleanPath.includes(k) && k !== '/') || '/';
    const prefix = codeMap[key] || 'GEN-01';
    return `CSE-REP-${prefix}-${new Date().toISOString().slice(0,10).replace(/-/g,'')}`;
  };

  const currentTitle = getReportTitle(location.pathname);
  const currentRefId = getReportId(location.pathname);

  const [printConfig, setPrintConfig] = useState(() => {
    const companyEn = localStorage.getItem('cfg_print_company_en');
    if (!companyEn || companyEn.includes('CHAISRI') || companyEn.includes('CHAI SRI')) {
      localStorage.setItem('cfg_print_company_en', 'T All Intelligence Co., Ltd.');
      localStorage.setItem('cfg_print_company_th', '46 Moo 5, Klong 4, Klong Luang, Pathumthani Thailand 12120');
      localStorage.setItem('cfg_print_dept', 'Office of Strategic Human Resources • Corporate Management Suite');
      localStorage.setItem('cfg_print_footer', 'T All Intelligence ERP Suite');
    }
    return {
      companyEn: localStorage.getItem('cfg_print_company_en') || 'T All Intelligence Co., Ltd.',
      companyTh: localStorage.getItem('cfg_print_company_th') || '46 Moo 5, Klong 4, Klong Luang, Pathumthani Thailand 12120',
      dept: localStorage.getItem('cfg_print_dept') || 'Office of Strategic Human Resources • Corporate Management Suite',
      sysCode: localStorage.getItem('cfg_print_sys_code') || 'CSE/ERP/HRM-v3.4',
      classification: localStorage.getItem('cfg_print_classification') || 'CONFIDENTIAL',
      footer: localStorage.getItem('cfg_print_footer') || 'T All Intelligence ERP Suite',
      logoType: localStorage.getItem('cfg_print_logo_type') || 'default',
      logoValue: localStorage.getItem('cfg_print_logo_value') || ''
    };
  });

  React.useEffect(() => {
    // Expose the global watermark toggle function requested
    (window as any).toggleConfidentialWatermark = (force?: boolean) => {
      const body = document.body;
      const isCurrentlyActive = body.classList.contains('has-print-watermark');
      const shouldEnable = force !== undefined ? force : !isCurrentlyActive;
      
      if (shouldEnable) {
        body.classList.add('has-print-watermark');
        body.setAttribute('data-print-watermark', 'CONFIDENTIAL');
      } else {
        body.classList.remove('has-print-watermark');
        body.removeAttribute('data-print-watermark');
      }
      
      // Dispatch a custom event so components can react to watermark state changes if needed
      window.dispatchEvent(new CustomEvent('watermark-state-changed', { detail: { isActive: shouldEnable } }));
    };

    const handleUpdate = () => {
      setPrintConfig({
        companyEn: localStorage.getItem('cfg_print_company_en') || 'T All Intelligence Co., Ltd.',
        companyTh: localStorage.getItem('cfg_print_company_th') || '46 Moo 5, Klong 4, Klong Luang, Pathumthani Thailand 12120',
        dept: localStorage.getItem('cfg_print_dept') || 'Office of Strategic Human Resources • Corporate Management Suite',
        sysCode: localStorage.getItem('cfg_print_sys_code') || 'CSE/ERP/HRM-v3.4',
        classification: localStorage.getItem('cfg_print_classification') || 'CONFIDENTIAL',
        footer: localStorage.getItem('cfg_print_footer') || 'T All Intelligence ERP Suite',
        logoType: localStorage.getItem('cfg_print_logo_type') || 'default',
        logoValue: localStorage.getItem('cfg_print_logo_value') || ''
      });
    };
    window.addEventListener('print-template-config-updated', handleUpdate);
    return () => {
      window.removeEventListener('print-template-config-updated', handleUpdate);
    };
  }, []);

  React.useEffect(() => {
    const handleModalChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setIsModalOpen(!!customEvent.detail?.isOpen);
    };
    window.addEventListener('modal-state-changed', handleModalChange);
    setIsModalOpen(document.body.classList.contains('modal-open'));
    return () => window.removeEventListener('modal-state-changed', handleModalChange);
  }, []);

  const isSensitivePage = location.pathname.includes('/employees/salary-master') || 
                          location.pathname.includes('/payroll/payslip') || 
                          location.pathname.includes('/payroll/calculation');

  return (
    <SecurityGuard>
      {isSensitivePage && <SessionTimeoutWatcher />}
      <div className="flex h-screen w-full bg-[#f3f3f1] overflow-hidden font-sans text-slate-800">

        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className="flex flex-1 flex-col overflow-hidden relative">
          <Header onOpenPendingPanel={() => setIsPendingPanelOpen(true)} />
          <div className="flex-1 custom-scrollbar overflow-y-auto flex flex-col min-h-0 relative">
            <div className="flex-1 flex flex-col w-full pt-0">
              <main className="flex-1 shrink-0 bg-transparent flex flex-col w-full relative z-0">
                {/* AUTOMATIC PRINT-ONLY REPEATING WALL OVERLAY HEADER */}
                <div className="print-layout-header hidden print:flex flex-col w-full border-b-[3px] border-double border-slate-900 pb-2 mb-2 text-black bg-white select-none">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      {/* Company logo render wrapper */}
                      <div className="shrink-0 flex items-center justify-center">
                        {(!printConfig.logoType || printConfig.logoType === 'default' || !printConfig.logoValue) ? (
                          <div className="text-black shrink-0">
                            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" className="text-black inline-block" stroke="currentColor" strokeWidth="2.5">
                              <circle cx="12" cy="12" r="10" />
                              <circle cx="12" cy="12" r="6" />
                              <circle cx="12" cy="12" r="2" />
                            </svg>
                          </div>
                        ) : (
                          <img 
                            src={
                              printConfig.logoType === 'drive' 
                                ? resolveDriveUrl(printConfig.logoValue) 
                                : printConfig.logoValue
                            } 
                            alt="Company Logo" 
                            className="w-[38px] h-[38px] object-contain rounded-md" 
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              // Fallback if image fails to load
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                const fallbackContainer = document.createElement('div');
                                fallbackContainer.className = "text-black shrink-0";
                                fallbackContainer.innerHTML = `<svg width="38" height="38" viewBox="0 0 24 24" fill="none" class="text-black inline-block" stroke="currentColor" stroke-width="2.5">
                                  <circle cx="12" cy="12" r="10" />
                                  <circle cx="12" cy="12" r="6" />
                                  <circle cx="12" cy="12" r="2" />
                                </svg>`;
                                parent.appendChild(fallbackContainer);
                              }
                            }}
                          />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <h1 className="text-xs font-black tracking-tight leading-none uppercase text-slate-900 font-sans">
                          {printConfig.companyEn}
                        </h1>
                        <h2 className="text-[9px] font-extrabold tracking-wide uppercase mt-0.5 text-slate-700 leading-none">
                          {printConfig.companyTh}
                        </h2>
                        <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 font-technical">
                          {printConfig.dept}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right flex flex-col">
                      <span className="text-[7px] font-black text-slate-400 tracking-widest leading-none">SYSTEM PROTOCOL</span>
                      <span className="text-[9px] font-black uppercase text-slate-800 tracking-wider mt-0.5 leading-none font-mono">
                        {printConfig.sysCode}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 border-t border-slate-200 pt-1.5 flex flex-col w-full">
                    <span className="text-[8px] font-black text-slate-400 tracking-widest leading-none uppercase">OFFICIAL CLASSIFIED REPORT TITLE</span>
                    <h3 className="text-xs font-black text-slate-00 font-sans tracking-tight mt-0.5 uppercase">
                      {currentTitle}
                    </h3>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-250 w-full">
                    <div className="flex flex-col">
                      <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">REPORT ID</span>
                      <span className="text-[8px] font-extrabold text-slate-800 font-mono mt-0.5">{currentRefId}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">GENERATOR BY</span>
                      <span className="text-[8px] font-extrabold text-slate-800 uppercase mt-0.5">{user?.name || 'System Operator'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">DATE & TIME</span>
                      <span className="text-[8px] font-extrabold text-slate-800 font-mono mt-0.5">{new Date().toLocaleString('th-TH', { hour12: false })}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">CLASSIFICATION</span>
                      <span className="text-[8px] font-extrabold text-[#932c2e] mt-0.5 uppercase tracking-wider font-mono">{printConfig.classification}</span>
                    </div>
                  </div>
                </div>

                {/* AUTOMATIC PRINT-ONLY REPEATING WALL OVERLAY FOOTER */}
                <div className="print-layout-footer hidden print:flex items-center justify-between w-full border-t border-slate-300 pt-1 text-black bg-white select-none text-[8px] font-mono leading-none">
                  <div>
                    <span className="font-bold uppercase tracking-wider text-slate-500">
                      {printConfig.footer}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold uppercase text-slate-500">
                    <span>Generated Timestamp: </span>
                    <span>{new Date().toLocaleString('th-TH', { hour12: false })}</span>
                  </div>
                  <div className="print-footer-page-number font-bold text-slate-800 uppercase tracking-wider flex items-center">
                    Page&nbsp;
                  </div>
                </div>

                {/* TABLE WRAP STRUCTURE TO MANAGE CLEAN SPACERS AUTOMATICALLY */}
                <table className="print-layout-table w-full border-0 border-collapse m-0 p-0 bg-transparent flex-1 flex flex-col print:table print:flex-none">
                  <thead className="print-layout-thead hidden print:table-header-group">
                    <tr className="border-0 bg-transparent">
                      <td className="border-0 bg-transparent p-0">
                        <div className="print-layout-header-space w-full bg-transparent border-0" />
                      </td>
                    </tr>
                  </thead>
                  <tbody className="bg-transparent border-0 flex-1 flex flex-col print:table-row-group print:flex-none">
                    <tr className="border-0 bg-transparent flex-1 flex flex-col print:table-row print:flex-none">
                      <td className="border-0 bg-transparent p-0 align-top flex-1 flex flex-col min-h-0 print:table-cell print:flex-none">
                        <div className="print-layout-content w-full bg-transparent border-0 flex-1 flex flex-col min-h-0 text-left">
                          <Outlet />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="print-layout-tfoot hidden print:table-footer-group">
                    <tr className="border-0 bg-transparent">
                      <td className="border-0 bg-transparent p-0">
                        <div className="print-layout-footer-space w-full bg-transparent border-0" />
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </main>
              <footer className={`mt-0 shrink-0 py-3.5 flex flex-col items-center gap-0.5 text-center text-[#212c46] w-full bg-transparent relative transition-all duration-300 ${isModalOpen ? 'filter blur-[12px] opacity-40 pointer-events-none scale-[0.98]' : ''}`}>
                  <div className="flex items-center justify-center">
                      <span className="text-[12px] font-black uppercase tracking-widest opacity-80 font-mono">
                          INTELLIGENCE HR MANAGEMENT CENTER • EMPOWERING STRATEGIC PEOPLE MANAGEMENT
                      </span>
                  </div>
                  <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-[11px] font-medium text-[#7a8b95] mt-0.5 font-technical">
                      <p className="flex items-center">
                        <span className="font-light mr-1">System by</span> 
                        <span className="font-black text-[#212c46]">T All Intelligence</span>
                      </p>
                      <span className="hidden md:inline text-[#d7d7d7]">|</span>
                      <p className="flex items-center gap-1.5"><PhoneCall size={12} className="text-[#a54f6b]" /> 082-5695654</p>
                      <span className="hidden md:inline text-[#d7d7d7]">|</span>
                      <p className="flex items-center gap-1.5"><Mail size={12} className="text-[#3f809e]" /> tallintelligence.ho@gmail.com</p>
                      <span className="hidden md:inline text-[#d7d7d7]">|</span>
                      <p className="flex items-center gap-1.5 font-bold uppercase tracking-wider">ALL RIGHTS RESERVED</p>
                  </div>
                  
                  {/* Floating Actions inside Footer */}
                  <div className="absolute bottom-3.5 right-6 flex items-center justify-end gap-3 z-[400]">
                      <button
                          onClick={() => document.body.classList.toggle('visual-debug-active')}
                          className="w-10 h-10 rounded-full bg-white border border-[#cdd0db]/50 flex items-center justify-center text-[#748ea1] shadow-xl hover:bg-slate-50 hover:border-[#b58c4f]/40 hover:text-[#b58c4f] transition-all duration-300 shadow-[#212c46]/10 transform active:scale-90 relative overflow-hidden group"
                          title="Toggle Debug Borders 🐞"
                      >
                          <Bug size={18} className="group-hover:scale-110 transition-transform duration-300 relative z-10" />
                          <div className="absolute inset-0 bg-[#b58c4f]/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-0"></div>
                      </button>
                      <div className="flex flex-col items-end shrink-0">
                          <QuickActionsMenu />
                      </div>
                  </div>
              </footer>
            </div>
          </div>
        </div>
      </div>
      <PendingApprovalsPanel isOpen={isPendingPanelOpen} onClose={() => setIsPendingPanelOpen(false)} />
    </SecurityGuard>
  );
}
