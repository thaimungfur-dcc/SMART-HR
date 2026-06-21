import { UserGuidePanel } from '../../components/shared/UserGuidePanel';
import KpiCard from '../../components/shared/KpiCard';
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { DraggableModal } from '../../components/shared/DraggableModal';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { initGoogleAuth, googleSignIn, logoutGoogle } from '../../services/googleAuth';
import { 
  Settings2, 
  Building2, 
  Layers, 
  Tag, 
  Users, 
  Printer, 
  Barcode, 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Save, 
  ChevronLeft, 
  ChevronRight, 
  HelpCircle, 
  Database, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Award, 
  Zap, 
  Globe, 
  Bell, 
  LogOut, 
  ChevronDown, 
  Check,
  LayoutGrid,
  FileText,
  Handshake,
  ShieldCheck,
  Key,
  Loader2,
  ShieldAlert,
  Timer,
  Info
} from 'lucide-react';
import * as Icons from 'lucide-react';

const MySwal = withReactContent(Swal);

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

// --- Theme Configuration (Synced with Home Palette) ---
const THEME = {
  bgMain: '#f3f3f1',
  bgGradient: 'transparent',
  sidebarBg: 'linear-gradient(180deg, #1d2636 0%, #0F172A 100%)',
  glassWhite: 'rgba(255, 255, 255, 0.88)',
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
  darkSlate: '#2f2926',
  silver: '#d7d7d7',
  deepNavy: '#212c46',
  brownGold: '#b58c4f',
  vibrantPurple: '#2d2c4a',
  burntOrange: '#d96245',
  slateBlue: '#748ea1',
  coolGray: '#eaeaec'
};

// --- Mock Data ---
const INITIAL_DATA = {
  departments: [
    { id: 1, name: 'Management', code: 'MGT' },
    { id: 2, name: 'Human Resources', code: 'HR' },
    { id: 3, name: 'Information Technology', code: 'IT' },
    { id: 4, name: 'Production', code: 'PROD' },
    { id: 5, name: 'Quality Assurance', code: 'QA' },
    { id: 6, name: 'Quality Control', code: 'QC' },
    { id: 7, name: 'Warehouse', code: 'WH' },
  ],
  googleSheets: [],
  leaveAutoApproval: [],
  reportPrintLayout: []
};

const TABS = [
  { id: 'departments', label: 'Departments', icon: 'Building2', title: 'Departments Registry', desc: 'Manage organizational units and coding structures.' },
  { id: 'leaveAutoApproval', label: 'Leave Auto-Approval', icon: 'ShieldCheck', title: 'LEAVE AUTO-APPROVAL CONFIG', desc: 'Configure automatic approval rules for employee leave requests based on remaining balances.' },
  { id: 'reportPrintLayout', label: 'Report Print Layout', icon: 'Printer', title: 'PRINT TEMPLATES & REPORT CONFIG', desc: 'Configure automatic repeating headers, footers, classifications and logo parameters.' },
  { id: 'googleSheets', label: 'Google Sheets', icon: 'Database', title: 'GOOGLE SHEETS SYNC', desc: 'Synchronize and format Google Sheets database configurations.' }
];

// --- Helper Components ---
const LucideIcon = ({ name, size = 16, className = "", color, style }: any) => {
    if (!name) return null;
    const IconComponent = Icons[name as keyof typeof Icons] || Icons.CircleHelp;
    return <IconComponent size={size} className={className} style={{...style, color: color}} strokeWidth={2} />;
};

// --- Main Component ---
export default function SystemConfig() {
  const [activeTab, setActiveTab] = useState('departments'); 
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [data, setData] = useState<any>(INITIAL_DATA);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null); 
  const [formData, setFormData] = useState<any>({ 
      name: '', code: '', dept: '', revision: '', 
      pages: [], prefix: '', format: 'YYMMDD', sequenceDigit: 3, reset: 'Daily', note: '' 
  });

  // --- Google Sheets Integration State ---
  const [user, setUser] = useState<any>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState('1L7smTyoFDIRaQk-NDivYTMwgQ52V4ezSfagWOIR6x0s');
  const [isFormatting, setIsFormatting] = useState(false);
  const [formatLogs, setFormatLogs] = useState<string[]>([]);

  // --- Session Timeout Control States ---
  const [cfgSessionDuration, setCfgSessionDuration] = useState<number>(() => {
    const saved = localStorage.getItem('cfg_session_duration_sec');
    return saved ? parseInt(saved, 10) : 900;
  });
  const [cfgWarnThreshold, setCfgWarnThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('cfg_warn_threshold_sec');
    return saved ? parseInt(saved, 10) : 120;
  });

  // --- Leave Auto-Approval Control States ---
  const [leaveAutoApproveEnabled, setLeaveAutoApproveEnabled] = useState<boolean>(() => {
    return localStorage.getItem('cfg_leave_auto_approve_enabled') === 'true';
  });
  const [leaveAutoApproveTypes, setLeaveAutoApproveTypes] = useState<string[]>(() => {
    const saved = localStorage.getItem('cfg_leave_auto_approve_types');
    return saved ? JSON.parse(saved) : ['Vacation', 'Sick Leave'];
  });
  const [leaveAutoApproveMinBalance, setLeaveAutoApproveMinBalance] = useState<number>(() => {
    const saved = localStorage.getItem('cfg_leave_auto_approve_min_balance');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [leaveAutoApproveMaxDays, setLeaveAutoApproveMaxDays] = useState<number>(() => {
    const saved = localStorage.getItem('cfg_leave_auto_approve_max_days');
    return saved ? parseInt(saved, 10) : 5;
  });

  // --- Report Print Layout States ---
  const [printCompanyEn, setPrintCompanyEn] = useState<string>(() => {
    const saved = localStorage.getItem('cfg_print_company_en');
    if (!saved || saved.includes('CHAISRI') || saved.includes('CHAI SRI')) {
      localStorage.setItem('cfg_print_company_en', 'T All Intelligence Co., Ltd.');
      return 'T All Intelligence Co., Ltd.';
    }
    return saved;
  });
  const [printCompanyTh, setPrintCompanyTh] = useState<string>(() => {
    const saved = localStorage.getItem('cfg_print_company_th');
    if (!saved || saved.includes('บริษัท ชัยศรี')) {
      localStorage.setItem('cfg_print_company_th', '46 Moo 5, Klong 4, Klong Luang, Pathumthani Thailand 12120');
      return '46 Moo 5, Klong 4, Klong Luang, Pathumthani Thailand 12120';
    }
    return saved || '46 Moo 5, Klong 4, Klong Luang, Pathumthani Thailand 12120';
  });
  const [printDept, setPrintDept] = useState<string>(() => {
    return localStorage.getItem('cfg_print_dept') || 'Office of Strategic Human Resources • Corporate Management Suite';
  });
  const [printSysCode, setPrintSysCode] = useState<string>(() => {
    return localStorage.getItem('cfg_print_sys_code') || 'CSE/ERP/HRM-v3.4';
  });
  const [printClassification, setPrintClassification] = useState<string>(() => {
    return localStorage.getItem('cfg_print_classification') || 'CONFIDENTIAL';
  });
  const [printFooter, setPrintFooter] = useState<string>(() => {
    const saved = localStorage.getItem('cfg_print_footer');
    if (!saved || saved.includes('Chaisri')) {
      localStorage.setItem('cfg_print_footer', 'T All Intelligence ERP Suite');
      return 'T All Intelligence ERP Suite';
    }
    return saved || 'T All Intelligence ERP Suite';
  });
  const [printLogoType, setPrintLogoType] = useState<string>(() => {
    return localStorage.getItem('cfg_print_logo_type') || 'default';
  });
  const [printLogoValue, setPrintLogoValue] = useState<string>(() => {
    return localStorage.getItem('cfg_print_logo_value') || '';
  });

  // --- Print Preview Modal States ---
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(80); // Default 80% to fit screen
  const [previewPages, setPreviewPages] = useState(2); // Default to 2 pages to simulate multi-page repeating headers

  const handleSavePrintConfig = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    localStorage.setItem('cfg_print_company_en', printCompanyEn);
    localStorage.setItem('cfg_print_company_th', printCompanyTh);
    localStorage.setItem('cfg_print_dept', printDept);
    localStorage.setItem('cfg_print_sys_code', printSysCode);
    localStorage.setItem('cfg_print_classification', printClassification);
    localStorage.setItem('cfg_print_footer', printFooter);
    localStorage.setItem('cfg_print_logo_type', printLogoType);
    localStorage.setItem('cfg_print_logo_value', printLogoValue);

    window.dispatchEvent(new Event('print-template-config-updated'));

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'บันทึกค่าหัวรายงานและหน้าพิมพ์ซ้ำสำเร็จ!',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  };

  const handleSaveLeaveAutoApproveConfig = () => {
    localStorage.setItem('cfg_leave_auto_approve_enabled', String(leaveAutoApproveEnabled));
    localStorage.setItem('cfg_leave_auto_approve_types', JSON.stringify(leaveAutoApproveTypes));
    localStorage.setItem('cfg_leave_auto_approve_min_balance', String(leaveAutoApproveMinBalance));
    localStorage.setItem('cfg_leave_auto_approve_max_days', String(leaveAutoApproveMaxDays));

    window.dispatchEvent(new Event('leave-auto-approve-config-updated'));

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'บันทึกการตั้งค่าอนุมัติลาอัตโนมัติสำเร็จ!',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  };

  const handleUpdateSessionConfig = (newDuration: number, newThreshold: number) => {
    if (newThreshold >= newDuration) {
      Swal.fire({
        icon: 'error',
        title: 'กำหนดช่วงเวลาแจ้งเตือนไม่ถูกต้อง',
        text: 'หน้าต่างแจ้งเตือนเซสชันหมดอายุต้องสั้นกว่าเวลารวมเซสชันสูงสุดนะคะ',
        confirmButtonColor: '#932c2e'
      });
      return;
    }

    setCfgSessionDuration(newDuration);
    setCfgWarnThreshold(newThreshold);
    localStorage.setItem('cfg_session_duration_sec', String(newDuration));
    localStorage.setItem('cfg_warn_threshold_sec', String(newThreshold));

    // Notify same window of configuration change
    window.dispatchEvent(new Event('session-config-updated'));

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'บันทึกเซสชันความปลอดภัยเรียบร้อยแล้วค่ะ',
      showConfirmButton: false,
      timer: 2000,
      background: '#f8f9fa'
    });
  };

  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (authUser, token) => {
        setUser(authUser);
        setAuthToken(token);
      },
      () => {
        setUser(null);
        setAuthToken(null);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAuthToken(result.accessToken);
        Swal.fire({
          title: 'Signed In Successfully',
          text: `Connected to Google Account: ${result.user.email}`,
          icon: 'success',
          confirmButtonColor: '#212c46'
        });
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      Swal.fire({
        title: 'Authentication Failed',
        text: error.message || 'Could not authenticate with Google.',
        icon: 'error',
        confirmButtonColor: '#932c2e'
      });
    }
  };

  const handleDisconnect = async () => {
    const result = await Swal.fire({
      title: 'Disconnect Google Account?',
      text: 'This will clear the current Google Sheets access token session.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#932c2e',
      cancelButtonColor: '#7a8b95',
      confirmButtonText: 'Yes, Disconnect'
    });

    if (result.isConfirmed) {
      await logoutGoogle();
      setUser(null);
      setAuthToken(null);
      Swal.fire('Disconnected', 'Successfully signed out from Google account.', 'success');
    }
  };

  const handleRunSetup = async () => {
    if (!spreadsheetId.trim()) {
      Swal.fire('Error', 'Please enter a valid Spreadsheet ID', 'error');
      return;
    }

    if (!authToken) {
      Swal.fire('Authentication Required', 'Please Sign in with Google first to authorize formatting.', 'warning');
      return;
    }

    // Explicit confirmation dialog
    const confirmed = await Swal.fire({
      title: 'Initialize Sheet Formatting?',
      text: 'This will construct table schemas, freeze headers, and apply layout styles to the target spreadsheet.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#b58c4f',
      cancelButtonColor: '#7a8b95',
      confirmButtonText: 'Confirm and Start'
    });

    if (!confirmed.isConfirmed) return;

    setIsFormatting(true);
    setFormatLogs(['Starting initialization flow...']);

    try {
      const log = (msg: string) => setFormatLogs(prev => [...prev, msg]);

      log('Fetching spreadsheet metadata details...');
      const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      if (!metaRes.ok) {
        throw new Error(`Invalid Spreadsheet ID or lacks permission: ${metaRes.statusText}`);
      }

      let meta = await metaRes.json();
      let existingSheets = meta.sheets || [];
      let existingSheetTitles = existingSheets.map((s: any) => s.properties.title);
      log(`Read spreadsheet: "${meta.properties?.title || 'WMS Spreadsheet'}"`);
      log(`Found existing sheet tabs: [${existingSheetTitles.join(', ')}]`);

      const targetSheets = [
        { name: 'CalendarEvents', headers: ['id', 'date', 'title', 'time', 'type', 'priority', 'status', 'createdAt', 'updatedAt'] },
        { name: 'Users', headers: ['id', 'employeeId', 'name', 'role', 'idCard', 'avatar', 'status', 'createdAt', 'updatedAt'] },
        { name: 'AccessLogs', headers: ['id', 'userId', 'action', 'details', 'ipAddress', 'createdAt'] },
        { name: 'SystemConfig', headers: ['id', 'category', 'key', 'value', 'description', 'updatedAt'] }
      ];

      // Create missing sheets
      const addRequests: any[] = [];
      for (const target of targetSheets) {
        if (!existingSheetTitles.includes(target.name)) {
          log(`Adding missing tab section: ${target.name}`);
          addRequests.push({
            addSheet: {
              properties: {
                title: target.name
              }
            }
          });
        }
      }

      if (addRequests.length > 0) {
        const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ requests: addRequests })
        });
        if (!updateRes.ok) {
          throw new Error('Could not create missing tabs database.');
        }
        log('Created missing sheet tables successfully. Updating schema caches...');
        
        // Refresh metadata properties
        const updatedMetaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        const updatedMeta = await updatedMetaRes.json();
        existingSheets = updatedMeta.sheets || [];
      } else {
        log('All core tabs are already present. No expansion necessary.');
      }

      // Map sheet titles to sheet ids
      const sheetIdMap = new Map<string, number>();
      for (const s of existingSheets) {
        sheetIdMap.set(s.properties.title, s.properties.sheetId);
      }

      // Prepare layout updates (freeze rows & format background color)
      log('Building design batches: row freezing & header column highlight styling (#d0e0e3)...');
      const formatRequests: any[] = [];
      for (const target of targetSheets) {
        const sId = sheetIdMap.get(target.name);
        if (sId === undefined) continue;

        // Freeze row 1
        formatRequests.push({
          updateSheetProperties: {
            properties: {
              sheetId: sId,
              gridProperties: {
                frozenRowCount: 1
              }
            },
            fields: 'gridProperties.frozenRowCount'
          }
        });

        // Set header styling with #d0e0e3 background and bold dark text
        formatRequests.push({
          repeatCell: {
            range: {
              sheetId: sId,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: target.headers.length
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: {
                  red: 208 / 255,   // #d0 -> 208
                  green: 224 / 255, // #e0 -> 224
                  blue: 227 / 255   // #e3 -> 227
                },
                textFormat: {
                  bold: true,
                  fontSize: 10,
                  foregroundColor: {
                    red: 33 / 255,   // #21 -> 33
                    green: 44 / 255,  // #2c -> 44
                    blue: 70 / 255    // #46 -> 70
                  }
                },
                horizontalAlignment: 'CENTER',
                verticalAlignment: 'MIDDLE'
              }
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
          }
        });
      }

      if (formatRequests.length > 0) {
        const formatRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ requests: formatRequests })
        });
        if (!formatRes.ok) throw new Error('Failed applying layout patterns.');
        log('Executed layout properties formatting successfully.');
      }

      // Write column headers
      log('Injecting sheet field headers...');
      const valueUpdates: any[] = [];
      for (const target of targetSheets) {
        valueUpdates.push({
          range: `${target.name}!A1:I1`,
          values: [target.headers]
        });
      }

      const writeRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          valueInputOption: 'RAW',
          data: valueUpdates
        })
      });

      if (!writeRes.ok) throw new Error('Failed writing table column titles.');
      
      log('Writing setup logs: ALL OK.');
      log('Spreadsheet auto-formatting finished successfully. Tables are fully ready for the App!');
      Swal.fire({
        title: 'Sheet Configuration Complete',
        text: 'Landed headers, froze top row, and applied background color #d0e0e3 successfully.',
        icon: 'success',
        confirmButtonColor: '#b58c4f'
      });

    } catch (err: any) {
      console.error(err);
      setFormatLogs(prev => [...prev, `[FAIL] Error occurred: ${err.message}`]);
      Swal.fire('Formatting Error', err.message || 'An unexpected error occurred.', 'error');
    } finally {
      setIsFormatting(false);
    }
  };

  const activeTabData: any = TABS.find(t => t.id === activeTab);
  const currentList = data[activeTab] || [];

  const filteredList = useMemo(() => {
      return currentList.filter((item: any) => {
          const s = search.toLowerCase();
          if (activeTab === 'idFormats') {
              return (item.prefix?.toLowerCase().includes(s) || 
                      item.pages?.join(',').toLowerCase().includes(s));
          }
          return (item.name?.toLowerCase().includes(s) || 
                  item.code?.toLowerCase().includes(s) || 
                  item.dept?.toLowerCase().includes(s));
      });
  }, [currentList, search, activeTab]);

  const paginatedData = filteredList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  useEffect(() => { setCurrentPage(1); setSearch(''); }, [activeTab]);

  const handleOpenModal = (item: any = null) => {
    setEditingItem(item);
    setFormData(item ? { ...item } : { 
      name: '', code: '', dept: '', revision: '',
      pages: [], prefix: '', format: 'YYMMDD', sequenceDigit: 3, reset: 'Daily', note: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: any) => {
    e.preventDefault();
    if (editingItem) {
      setData((prev: any) => ({
        ...prev,
        [activeTab]: prev[activeTab].map((item: any) => item.id === editingItem.id ? { ...item, ...formData } : item)
      }));
    } else {
      const newId = currentList.length > 0 ? Math.max(...currentList.map((i: any) => i.id)) + 1 : 1;
      setData((prev: any) => ({
        ...prev,
        [activeTab]: [...prev[activeTab], { id: newId, ...formData }]
      }));
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: any) => {
    if(window.confirm('Are you sure you want to delete this configuration?')) {
      setData((prev: any) => ({
        ...prev,
        [activeTab]: prev[activeTab].filter((item: any) => item.id !== id)
      }));
    }
  };

  const togglePageSelection = (page: string) => {
      setFormData((prev: any) => {
          const pages = prev.pages || [];
          if (pages.includes(page)) return { ...prev, pages: pages.filter((p: string) => p !== page) };
          return { ...prev, pages: [...pages, page] };
      });
  };

  return (
      <div className="flex flex-1 w-full flex-col pb-6 animate-fadeIn bg-transparent space-y-6 min-h-0">
          {/* USER GUIDE TAB BUTTON */}
          {typeof document !== 'undefined' && createPortal(
            <button onClick={() => setIsGuideOpen(true)} className="fixed right-0 bg-[#f8f9fa] border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#932c2e] hover:text-white hover:border-[#932c2e] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group" style={{ top: '80px' }}>
                <HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#7a8b95] group-hover:text-white" />
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
                          <Settings2 size={28} strokeWidth={2.5} className="text-[#3f809e]" />
                      </div>
                  </div>
                  <div>
                      <h1 className="font-black text-[#212c46] uppercase tracking-tighter leading-none font-exception-header" style={{ fontSize: '24px' }}>
                          CONFIG <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3f809e] to-[#b58c4f]">CENTER</span>
                      </h1>
                      <p className="text-[11px] font-bold text-[#4d5a44] uppercase tracking-[0.2em] mt-0.5 opacity-80 leading-none">
                          GLOBAL MASTER DATA & SYSTEM CONFIGURATION NODE
                      </p>
                  </div>
              </div>
              
              <div className="flex items-center gap-4">
                  <div className="hidden lg:flex items-center gap-3 bg-[#212c46] text-white px-5 py-2.5 rounded-xl shadow-lg border border-[#b7a159]/30">
                      <ShieldCheck size={16} />
                      <div className="text-[10px] font-black font-mono tracking-widest uppercase">
                          Admin Access Verified
                      </div>
                  </div>
              </div>
          </div>
          {/* MAIN CONTENT AREA */}
          <div className="px-4 sm:px-8 w-full mt-[2px] pb-6">
            <div className="w-full">
                
                {/* KPI STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5 shrink-0">
                    <KpiCard
                        label="Total Records"
                        value={filteredList.length}
                        icon="Database"
                        color={THEME.primaryLight}
                        description={`Active in ${activeTabData.label}`} />
                    <KpiCard
                        label="System Node"
                        value={activeTab.charAt(0).toUpperCase() + activeTab.slice(1, 5)}
                        icon="LayoutGrid"
                        color={THEME.accent}
                        description="Master Data Module" />
                    <KpiCard
                        label="Last Modified"
                        value="Now"
                        icon="Clock"
                        color={THEME.gold}
                        description={new Date().toLocaleTimeString()} />
                    <KpiCard
                        label="Sync Status"
                        value="Active"
                        icon="CheckCircle"
                        color={THEME.success}
                        description="Database Connected" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* SIDEBAR TABS */}
                    <div className="lg:col-span-3 space-y-2 bg-white/90 p-6 rounded-3xl border border-[#eaeaec] shadow-lg h-fit">
                        <p className="text-[12px] font-black text-[#212c46] uppercase tracking-widest mb-4 border-b-2 border-[#b7a159] pb-2">Control Nodes</p>
                        {TABS.map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all relative group ${activeTab === tab.id ? 'bg-[#212c46] text-white shadow-md' : 'bg-white text-[#7a8b95] hover:bg-[#f8f9fa] hover:text-[#a94228] border border-[#eaeaec]'}`}
                            >
                                <div className={`p-2 rounded-xl shrink-0 ${activeTab === tab.id ? 'bg-[#b7a159]/20 text-[#b7a159]' : 'bg-[#f8f9fa] text-[#4d87a8] border border-[#eaeaec]'}`}>
                                    <LucideIcon name={tab.icon} size={18} />
                                </div>
                                <div className="flex-1 text-left overflow-hidden">
                                    <p className={`text-[13px] font-black uppercase tracking-tight truncate ${activeTab === tab.id ? 'text-[#d7d7d7]' : 'text-[#212c46]'}`}>{tab.label}</p>
                                    <p className={`text-[11px] font-bold uppercase tracking-widest mt-0.5 truncate ${activeTab === tab.id ? 'text-[#b7a159]' : 'text-[#7a8b95]'}`}>
                                        {tab.id === 'leaveAutoApproval' ? (leaveAutoApproveEnabled ? 'ENABLED' : 'DISABLED') : tab.id === 'reportPrintLayout' ? 'CONFIGURED' : `${(data[tab.id] || []).length} Items`}
                                    </p>
                                </div>
                                {activeTab === tab.id && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#b7a159] shadow-[0_0_8px_#b7a159]"></div>}
                            </button>
                        ))}
                    </div>

                    {/* CONTENT LIST */}
                    <div className="lg:col-span-9 bg-white rounded-3xl shadow-lg border border-[#eaeaec] overflow-hidden flex flex-col animate-fadeIn  flex-1 min-h-0">
                        {activeTab === 'googleSheets' ? (
                            <div className="flex-1 p-8 space-y-8 bg-[#f8f9fa]">
                                {/* AUTHENTICATION SECTION */}
                                <div className="bg-white p-8 rounded-2xl border border-[#eaeaec] shadow-sm space-y-6">
                                    <div>
                                        <h3 className="text-[18px] font-black text-[#212c46] uppercase tracking-wider">Authentication</h3>
                                        <p className="text-[12px] font-bold text-[#7a8b95] uppercase tracking-normal mt-1">Connect your Google Account to authorize database synchronizations and create sheets automatically.</p>
                                    </div>
                                    
                                    <div className="p-5 border border-[#eaeaec] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
                                        <div className="flex items-center gap-4">
                                            {user ? (
                                                <>
                                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#b58c4f] shrink-0">
                                                        <img src={user.photoURL || "https://lh3.googleusercontent.com/a/default-user=s96-c"} alt="User Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-sm text-[#212c46]">{user.displayName || "Advance Group DCC"}</p>
                                                        <p className="text-xs font-bold font-mono text-[#7a8b95]">{user.email || "advancegroup.dcc@gmail.com"}</p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-12 h-12 rounded-full bg-[#212c46]/5 border border-[#212c46]/10 flex items-center justify-center text-[#212c46]/40 text-sm font-black shrink-0 font-mono">
                                                       DCC
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-sm text-[#212c46]">No Account Connected</p>
                                                        <p className="text-xs font-bold font-mono text-[#7a8b95]">Click Sign in with Google to authenticate your session.</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div>
                                            {user ? (
                                                <button onClick={handleDisconnect} className="px-6 py-2.5 rounded-xl text-[#932c2e] hover:text-white border-2 border-[#932c2e]/40 hover:bg-[#932c2e] hover:border-[#932c2e] font-black text-[11px] uppercase tracking-wider transition-all duration-300">
                                                    Disconnect
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleGoogleSignIn}
                                                    className="flex items-center gap-3 px-6 py-2.5 bg-white hover:bg-slate-50 text-[#1f1f1f] font-black text-[11px] uppercase tracking-wider border-2 border-[#747775] rounded-xl hover:shadow-sm transition-all active:scale-95 duration-200"
                                                >
                                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 block shrink-0">
                                                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                                        <path fill="none" d="M0 0h48v48H0z"></path>
                                                    </svg>
                                                    <span>Sign in with Google</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* SESSION SECURITY CONFIGURATION SECTION */}
                                <div className="bg-white p-8 rounded-2xl border border-[#eaeaec] shadow-sm space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 shrink-0 shadow-sm">
                                            <ShieldAlert size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-[18px] font-black text-[#212c46] uppercase tracking-wider flex items-center gap-2">
                                                <span>Session Security Control / สิทธิ์การรักษาความปลอดภัยเซสชัน</span>
                                            </h3>
                                            <p className="text-[12px] font-bold text-[#7a8b95] uppercase tracking-normal mt-1 leading-relaxed">
                                                กำหนดเงื่อนไขเวลาความปลอดภัยของเซสชันผู้ใช้งานระบบ (Inactivity Session Expiry) เพื่อป้องกันสิทธิ์เข้าถึงข้อมูล Google Sheet ค้างในระบบ
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-[#eaeaec]/60">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[11px] font-black text-[#212c46] uppercase tracking-widest block flex items-center gap-2">
                                                <Timer size={14} className="text-[#4d87a8]" />
                                                <span>Session Duration (เวลาก่อนเซสชันหมดอายุ)</span>
                                            </label>
                                            <select
                                                value={cfgSessionDuration}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value, 10);
                                                    handleUpdateSessionConfig(val, cfgWarnThreshold);
                                                }}
                                                className="w-full bg-white border border-[#eaeaec] rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#b58c4f] shadow-sm text-[#212c46] cursor-pointer"
                                            >
                                                <option value="30">30 Seconds (ทดสอบความเร็ว / Fast 30s Demo)</option>
                                                <option value="60">1 Minute (1 นาที)</option>
                                                <option value="300">5 Minutes (5 นาที)</option>
                                                <option value="900">15 Minutes (15 นาที - ทั่วไป)</option>
                                                <option value="1800">30 Minutes (30 นาที)</option>
                                                <option value="3600">1 Hour (1 ชั่วโมง)</option>
                                            </select>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                                                ระยะเวลาที่ระบบจะปล่อยให้เซสชันค้างอยู่โดยไม่มีความเคลื่อนไหว
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[11px] font-black text-[#212c46] uppercase tracking-widest block flex items-center gap-2">
                                                <AlertTriangle size={14} className="text-amber-600" />
                                                <span>Warning Window (หน้าต่างเวลาแจ้งเตือนล่วงหน้า)</span>
                                            </label>
                                            <select
                                                value={cfgWarnThreshold}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value, 10);
                                                    handleUpdateSessionConfig(cfgSessionDuration, val);
                                                }}
                                                className="w-full bg-white border border-[#eaeaec] rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#b58c4f] shadow-sm text-[#212c46] cursor-pointer"
                                            >
                                                <option value="10">10 Seconds (ทดสอบความเร็ว / Fast 10s Demo)</option>
                                                <option value="30">30 Seconds (30 วินาที)</option>
                                                <option value="60">60 Seconds (1 นาที)</option>
                                                <option value="120">120 Seconds (2 นาที - แนะนำ)</option>
                                                <option value="300">300 Seconds (5 นาที)</option>
                                            </select>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                                                จำนวนวินาทีย้อนกลับช่วงท้ายสำหรับเริ่มกะพริบลดเวลาแจ้งเตือน
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-white border border-[#eaeaec] rounded-xl p-5 flex gap-3 text-xs leading-relaxed text-[#7a8b95] font-medium shadow-inner">
                                        <Info size={16} className="text-[#3f809e] shrink-0 mt-0.5" />
                                        <div>
                                            <span className="block font-black text-[#212c46] uppercase mb-1 tracking-wider text-[10px]">Developer Guide / คำแนะนำในการทดสอบระบบแจ้งเตือนเซสชัน</span>
                                            คุณสามารถเลือกค่าเซสชันเป็น <strong className="text-[#212c46]">30 Seconds</strong> และหน้าต่างแจ้งเตือนเป็น <strong className="text-[#212c46]">10 Seconds</strong> จากนั้นทำการปล่อยระบบทิ้งไว้ประมาณ 20 วินาที ระบบจะดึงเสียงกะพริบแจ้งเตือนความปลอดภัย <strong className="text-[#212c46]">Security alert chimes</strong> และแสดงกล่อง Pop-up ดึงเวลาให้ท่านตัดสินใจค่ะ
                                        </div>
                                    </div>
                                </div>

                                {/* SHEET CONFIGURATION */}
                                <div className="bg-white p-8 rounded-2xl border border-[#eaeaec] shadow-sm space-y-6">
                                    <div>
                                        <h3 className="text-[18px] font-black text-[#212c46] uppercase tracking-wider">Sheet Setup & Formatting</h3>
                                        <p className="text-[12px] font-bold text-[#7a8b95] uppercase tracking-normal mt-1">Automatically format the target spreadsheet (Adds headers, freezes top row, and highlights column #d0e0e3).</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[11px] font-black text-[#212c46] uppercase tracking-widest block">Spreadsheet ID</label>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <input
                                                    type="text"
                                                    value={spreadsheetId}
                                                    onChange={(e) => setSpreadsheetId(e.target.value)}
                                                    disabled={isFormatting}
                                                    placeholder="Enter Google Spreadsheet ID..."
                                                    className="flex-1 bg-white border border-[#eaeaec] rounded-xl px-4 py-3 text-xs font-bold font-mono outline-none focus:border-[#b58c4f] shadow-sm text-[#212c46]"
                                                />
                                                <button
                                                    onClick={handleRunSetup}
                                                    disabled={isFormatting}
                                                    className="px-8 py-3 bg-[#b58c4f] hover:bg-[#a57c3f] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                                                >
                                                    {isFormatting ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin" /> Formatting...
                                                        </>
                                                    ) : (
                                                        'Run Setup'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {formatLogs.length > 0 && (
                                            <div className="bg-[#1e293b] text-slate-200 p-4 rounded-xl font-mono text-[11px] space-y-1.5 max-h-48 overflow-y-auto">
                                                {formatLogs.map((log, index) => (
                                                    <div key={index} className="flex gap-2">
                                                        <span className="text-emerald-400 font-bold">►</span>
                                                        <span>{log}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : activeTab === 'reportPrintLayout' ? (
                            <div className="flex-1 p-8 space-y-8 bg-[#f8f9fa] animate-fadeIn">
                                {/* PRINT EMBEDDABLE TEMPLATES CONFIGURATION PANEL */}
                                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
                                    <div className="border-b border-slate-100 pb-4">
                                        <h3 className="text-[18px] font-black text-[#212c46] uppercase tracking-wider flex items-center gap-3">
                                            <Printer size={24} className="text-[#b58c4f]" /> Report Print Layout Configuration
                                        </h3>
                                        <p className="text-[12px] font-bold text-slate-400 uppercase tracking-normal mt-1">
                                            กำหนดหัวและท้ายรายงานสำหรับโหมดพิมพ์รายงานซ้ำอัตโนมัติในทุกหน้าเมื่อสั่งพิมพ์ (Repeating Print Header & Footer Rules)
                                        </p>
                                    </div>

                                    <form onSubmit={handleSavePrintConfig} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[11px] font-black text-[#212c46] uppercase tracking-widest block font-bold">
                                                    Company Name (English) / ชื่อบริษัท (ภาษาอังกฤษ)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={printCompanyEn}
                                                    onChange={(e) => setPrintCompanyEn(e.target.value)}
                                                    className="w-full bg-white border border-[#eaeaec] rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#b58c4f] shadow-sm text-[#212c46]"
                                                    placeholder="e.g. CHAISRI AGRO INDUSTRIAL CO., LTD."
                                                    required
                                                />
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[11px] font-black text-[#212c46] uppercase tracking-widest block font-bold">
                                                    Company Name (Thai) / ชื่อบริษัท (ภาษาไทย)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={printCompanyTh}
                                                    onChange={(e) => setPrintCompanyTh(e.target.value)}
                                                    className="w-full bg-white border border-[#eaeaec] rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#b58c4f] shadow-sm text-[#212c46]"
                                                    placeholder="e.g. บริษัท ชัยศรี แปรรูปเกษตรอุตสาหกรรม จำกัด"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[11px] font-black text-[#212c46] uppercase tracking-widest block font-bold">
                                                    Office / Department Sub-header
                                                </label>
                                                <input
                                                    type="text"
                                                    value={printDept}
                                                    onChange={(e) => setPrintDept(e.target.value)}
                                                    className="w-full bg-white border border-[#eaeaec] rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#b58c4f] shadow-sm text-[#212c46]"
                                                    placeholder="e.g. Office of Strategic Human Resources • Corporate Management Suite"
                                                    required
                                                />
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[11px] font-black text-[#212c46] uppercase tracking-widest block font-bold">
                                                    System Protocol / Version Code
                                                </label>
                                                <input
                                                    type="text"
                                                    value={printSysCode}
                                                    onChange={(e) => setPrintSysCode(e.target.value)}
                                                    className="w-full bg-white border border-[#eaeaec] rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#b58c4f] shadow-sm text-[#212c46] font-mono"
                                                    placeholder="e.g. CSE/ERP/HRM-v3.4"
                                                    required
                                                />
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[11px] font-black text-[#212c46] uppercase tracking-widest block font-bold">
                                                    Document Security Classification
                                                </label>
                                                <input
                                                    type="text"
                                                    value={printClassification}
                                                    onChange={(e) => setPrintClassification(e.target.value)}
                                                    className="w-full bg-white border border-[#eaeaec] rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#b58c4f] shadow-sm text-[#212c46]"
                                                    placeholder="e.g. CONFIDENTIAL / INTERNAL ONLY"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[11px] font-black text-[#212c46] uppercase tracking-widest block font-bold">
                                                Report Footer Brand / Tagline สำหรับตีนรายงาน
                                            </label>
                                            <input
                                                type="text"
                                                value={printFooter}
                                                onChange={(e) => setPrintFooter(e.target.value)}
                                                className="w-full bg-white border border-[#eaeaec] rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#b58c4f] shadow-sm text-[#212c46]"
                                                placeholder="e.g. Chaisri Agro Industrial ERP Suite"
                                                required
                                            />
                                        </div>

                                        {/* --- BRAND COMPANY LOGO SELECTION PANEL --- */}
                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4">
                                            <div>
                                                <label className="text-[11px] font-black text-[#212c46] uppercase tracking-widest block font-bold">
                                                    Company Logo Settings / โลโก้บริษัทหัวรายงาน
                                                </label>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-normal mt-0.5">
                                                    รองรับการป้อนลิงก์โดยตรง, ดึงภาพจาก Google Drive หรืออัพโหลดรูปภาพจากเครื่องคอมพิวเตอร์ของคุณ
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {[
                                                    { id: 'default', label: 'Default Symbol', desc: 'ใช้สัญลักษณ์วงแหวน' },
                                                    { id: 'url', label: 'Image URL', desc: 'ระบุที่อยู่ลิงก์รูป' },
                                                    { id: 'drive', label: 'Google Drive Link', desc: 'ลิงก์แชร์กูเกิลไดรฟ์' },
                                                    { id: 'upload', label: 'Computer Upload', desc: 'อัพโหลดจากเครื่อง' }
                                                ].map((type) => (
                                                    <button
                                                        key={type.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setPrintLogoType(type.id);
                                                            // Reset value when switching to default
                                                            if (type.id === 'default') {
                                                                setPrintLogoValue('');
                                                            }
                                                        }}
                                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer select-none ${
                                                            printLogoType === type.id
                                                                ? 'border-[#b58c4f] bg-[#b58c4f]/5 text-[#b58c4f] shadow-sm'
                                                                : 'border-slate-200 bg-white hover:border-[#b58c4f]/50 text-slate-600'
                                                        }`}
                                                    >
                                                        <span className="text-[11px] uppercase tracking-wider font-extrabold block">{type.label}</span>
                                                        <span className="text-[9px] text-slate-400 font-bold block mt-0.5">{type.desc}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            {printLogoType === 'url' && (
                                                <div className="flex flex-col gap-1.5 animate-fadeIn pb-6">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                        Direct Image URL / ลิงก์รูปภาพโลโก้โดยตรง
                                                    </label>
                                                    <input
                                                        type="url"
                                                        value={printLogoValue}
                                                        onChange={(e) => setPrintLogoValue(e.target.value)}
                                                        className="w-full bg-white border border-[#eaeaec] rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#b58c4f] shadow-sm text-[#212c46]"
                                                        placeholder="https://example.com/logo.png"
                                                        required={printLogoType === 'url'}
                                                    />
                                                    <p className="text-[10px] text-slate-400">ระบุลิงก์รูปภาพแบบเต็มที่ขึ้นต้นด้วย http:// หรือ https://</p>
                                                </div>
                                            )}

                                            {printLogoType === 'drive' && (
                                                <div className="flex flex-col gap-1.5 animate-fadeIn pb-6">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                        Google Drive Share Link or File ID / ลิงก์ไฟล์แชร์จากกูเกิลไดรฟ์
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={printLogoValue}
                                                        onChange={(e) => setPrintLogoValue(e.target.value)}
                                                        className="w-full bg-white border border-[#eaeaec] rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#b58c4f] shadow-sm text-[#212c46] font-mono"
                                                        placeholder="เช่น 1A2B3D4E5F... หรือ https://drive.google.com/file/d/1A2B3.../view"
                                                        required={printLogoType === 'drive'}
                                                    />
                                                    <p className="text-[10px] text-[#212c46] font-bold">
                                                        💡 ข้อแนะนำ: ต้องแชร์ไฟล์ใน Google Drive เป็นแบบ "ทุกคนที่มีลิงก์มีสิทธิ์อ่าน (Anyone with the link)" เพื่อให้หน้าพิมพ์สามารถแสดงข้อมูลภาพได้สมบูรณ์
                                                    </p>
                                                </div>
                                            )}

                                            {printLogoType === 'upload' && (
                                                <div className="flex flex-col gap-1.5 animate-fadeIn pb-6">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                        Select Image File / เลือกไฟล์ภาพสัญลักษณ์บริษัท
                                                    </label>
                                                    <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200/80">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    if (file.size > 1.5 * 1024 * 1024) {
                                                                        Swal.fire({
                                                                            icon: 'error',
                                                                            title: 'ขนาดไฟล์เกินขีดจำกัด (File system overhead alert)',
                                                                            text: 'กรุณาอัพโหลดรูปภาพโลโก้ที่มีขนาดไม่เกิน 1.5 MB เพื่อความเสถียรสูงสุดของการบันทึกลงหน่วยความจำ Local Storage นะคะ'
                                                                        });
                                                                        return;
                                                                    }
                                                                    const reader = new FileReader();
                                                                    reader.onload = (event) => {
                                                                        if (event.target?.result) {
                                                                            setPrintLogoValue(event.target.result as string);
                                                                        }
                                                                    };
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            }}
                                                            className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[11px] file:font-black file:uppercase file:tracking-wider file:bg-[#b58c4f]/10 file:text-[#b58c4f] hover:file:bg-[#b58c4f]/20 file:cursor-pointer"
                                                        />
                                                        {printLogoValue && printLogoValue.startsWith('data:') && (
                                                            <div className="relative">
                                                                <img 
                                                                    src={printLogoValue} 
                                                                    alt="Uploaded Logo preview" 
                                                                    className="w-12 h-12 object-contain border border-slate-200 rounded-lg bg-slate-50"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setPrintLogoValue('')}
                                                                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold hover:bg-red-600 transition-colors cursor-pointer"
                                                                    title="ลบออก"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-slate-400">รองรับไฟล์ประเภท .png, .jpg, .svg, .webp ขนาดไฟล์ไม่เกิน 1.5 MB</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-[11px] font-black text-[#212c46] uppercase tracking-widest border-b pb-1 font-bold">
                                                Real-Time Print Template Mockup / ตัวอย่างหน้าพิมพ์รายงานซ้ำจำลอง
                                            </h4>
                                            
                                            {/* Mockup Preview Header */}
                                            <div className="bg-white border-2 border-dashed border-slate-200 p-6 rounded-2xl relative select-none">
                                                <span className="absolute -top-3 left-4 bg-slate-900 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest font-mono">LIVE PRINT-HEADER PREVIEW MOCKUP</span>
                                                <div className="flex flex-col w-full border-b-[3px] border-double border-slate-900 pb-2 mb-2 text-black bg-white select-none mt-2">
                                                    <div className="flex items-center justify-between w-full">
                                                        <div className="flex items-center gap-4">
                                                            {/* Logo in Mockup Preview */}
                                                            <div className="shrink-0 flex items-center justify-center">
                                                                {(printLogoType === 'default' || !printLogoValue) ? (
                                                                    <div className="text-black shrink-0 font-bold">
                                                                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" className="text-black inline-block" stroke="currentColor" strokeWidth="2.5">
                                                                            <circle cx="12" cy="12" r="10" />
                                                                            <circle cx="12" cy="12" r="6" />
                                                                            <circle cx="12" cy="12" r="2" />
                                                                        </svg>
                                                                    </div>
                                                                ) : (
                                                                    <img
                                                                        src={printLogoType === 'drive' ? resolveDriveUrl(printLogoValue) : printLogoValue}
                                                                        alt="Preview Logo"
                                                                        className="w-10 h-10 object-contain rounded-md"
                                                                        referrerPolicy="no-referrer"
                                                                        onError={(e) => {
                                                                            e.currentTarget.style.display = 'none';
                                                                            const parent = e.currentTarget.parentElement;
                                                                            if (parent) {
                                                                                const fallbackContainer = document.createElement('div');
                                                                                fallbackContainer.className = "text-black shrink-0 font-bold";
                                                                                fallbackContainer.innerHTML = `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" class="text-black inline-block" stroke="currentColor" stroke-width="2.5">
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
                                                                <h1 className="text-[11px] font-black tracking-tight leading-none uppercase text-slate-900 font-sans font-bold">
                                                                    {printCompanyEn || 'CHAISRI AGRO INDUSTRIAL CO., LTD.'}
                                                                </h1>
                                                                <h2 className="text-[8px] font-extrabold tracking-wide uppercase mt-0.5 text-slate-700 leading-none">
                                                                    {printCompanyTh || 'บริษัท ชัยศรี แปรรูปเกษตรอุตสาหกรรม จำกัด'}
                                                                </h2>
                                                                <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 font-technical">
                                                                    {printDept || 'Office of Strategic Human Resources • Corporate Management Suite'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="text-right flex flex-col">
                                                            <span className="text-[6px] font-black text-slate-400 tracking-widest leading-none">SYSTEM PROTOCOL</span>
                                                            <span className="text-[8px] font-black uppercase text-slate-800 tracking-wider mt-0.5 leading-none font-mono font-bold">
                                                                {printSysCode || 'CSE/ERP/HRM-v3.4'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-2 border-t border-slate-200 pt-1.5 flex flex-col w-full">
                                                        <span className="text-[7px] font-black text-slate-400 tracking-widest leading-none uppercase">OFFICIAL CLASSIFIED REPORT TITLE</span>
                                                        <h3 className="text-[10px] font-black text-slate-950 font-sans tracking-tight mt-0.5 uppercase">
                                                            EXECUTIVE GENERAL OVERVIEW REPORT (DYNAMIC EXAMPLE)
                                                        </h3>
                                                    </div>

                                                    <div className="grid grid-cols-4 gap-1 mt-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200 w-full animate-pulse">
                                                        <div className="flex flex-col">
                                                            <span className="text-[6.5px] font-black text-slate-400 uppercase tracking-widest">REPORT ID</span>
                                                            <span className="text-[7.5px] font-extrabold text-slate-800 font-mono mt-0.5 font-bold">CSE-REP-GEN-01</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[6.5px] font-black text-slate-400 uppercase tracking-widest">GENERATOR BY</span>
                                                            <span className="text-[7.5px] font-extrabold text-slate-800 uppercase mt-0.5 font-bold">System Operator</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[6.5px] font-black text-slate-400 uppercase tracking-widest">DATE & TIME</span>
                                                            <span className="text-[7.5px] font-extrabold text-slate-800 font-mono mt-0.5 font-bold font-mono">05/06/2026 16:10:39</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[6.5px] font-black text-slate-400 uppercase tracking-widest">CLASSIFICATION</span>
                                                            <span className="text-[7.5px] font-extrabold text-rose-700 mt-0.5 uppercase tracking-wider font-mono">
                                                                {printClassification || 'CONFIDENTIAL'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Mockup Preview Footer */}
                                            <div className="border border-slate-200 p-4 rounded-xl bg-slate-50 text-[10px] space-y-1 select-none">
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-b pb-1 font-bold">Live Footer Preview</p>
                                                <div className="flex items-center justify-between w-full pt-1 text-[8px] font-mono leading-none text-slate-500">
                                                    <div>
                                                        <span className="font-bold uppercase tracking-wider">
                                                            {printFooter || 'Chaisri Agro Industrial ERP Suite'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span>Generated Timestamp: </span>
                                                        <span className="font-bold">05/06/2026 16:10:39</span>
                                                    </div>
                                                    <div className="font-bold uppercase tracking-wider">
                                                        Page 1
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setIsPrintPreviewOpen(true)}
                                                className="bg-white hover:bg-slate-50 text-[#212c46] border border-[#eaeaec] px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                                            >
                                                <Printer size={14} className="text-[#b58c4f]"/> Live A4 Page Preview
                                            </button>
                                            <button
                                                type="submit"
                                                className="bg-[#212c46] hover:bg-[#212c46]/90 text-white px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer border border-[#212c46]"
                                            >
                                                <Save size={14} className="text-[#b58c4f]"/> Save Print Settings
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        ) : activeTab === 'leaveAutoApproval' ? (
                            <div className="flex-1 p-8 space-y-8 bg-[#f8f9fa] animate-fadeIn">
                                {/* LEAVE AUTO-APPROVAL CONFIGURATION PANEL */}
                                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
                                    <div className="border-b border-slate-100 pb-4">
                                        <h3 className="text-[18px] font-black text-[#212c46] uppercase tracking-wider flex items-center gap-3 animate-pulse">
                                            <ShieldCheck className="text-emerald-500 animate-pulse" size={24} /> Leave Auto-Approval Engine
                                        </h3>
                                        <p className="text-[12px] font-bold text-slate-400 uppercase tracking-normal mt-1">Configure intelligent auto-approval rules for employee leave requests based on remaining balances.</p>
                                    </div>

                                    {/* MASTER SWITCH */}
                                    <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm hover:border-[#b58c4f]/40 transition-all duration-300">
                                        <div>
                                            <h4 className="text-xs font-black text-[#212c46] uppercase tracking-wider">Enable Autopilot Processing</h4>
                                            <p className="text-[11px] text-slate-400 font-bold uppercase mt-1">When active, qualified requests automatically fast-track to "Approved" with zero manual effort.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setLeaveAutoApproveEnabled(!leaveAutoApproveEnabled)}
                                            className={`w-14 h-8 flex items-center rounded-full p-1 transition-all duration-300 cursor-pointer outline-none relative ${leaveAutoApproveEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                        >
                                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-all duration-300 ease-in-out ${leaveAutoApproveEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </button>
                                    </div>

                                    {/* TRIGGER CONDITIONS CONTAINER */}
                                    <div className={`space-y-6 ${leaveAutoApproveEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none select-none transition-all duration-300'}`}>
                                        <div>
                                            <h4 className="text-[11px] font-black text-[#212c46] uppercase tracking-widest mb-3 border-b pb-1">1. Eligible Leave Categories</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {[
                                                    { key: 'Vacation', title: 'Vacation Leave (พักร้อน)', desc: 'Checked against Vacation entitlement cap (12 days/year)' },
                                                    { key: 'Sick Leave', title: 'Sick Leave (ลาป่วย)', desc: 'Checked against Sick Leave entitlement cap (30 days/year)' },
                                                    { key: 'Business Leave', title: 'Business Leave (ลากิจ)', desc: 'Checked against combined Business quota (7 days/year)' },
                                                    { key: 'Personal Leave', title: 'Personal Leave (ลาส่วนตัว)', desc: 'Checked against combined Business/Personal quota (7 days/year)' }
                                                ].map(item => {
                                                    const isSel = leaveAutoApproveTypes.includes(item.key);
                                                    return (
                                                        <div 
                                                            key={item.key} 
                                                            onClick={() => {
                                                                if (!leaveAutoApproveEnabled) return;
                                                                if (isSel) {
                                                                    setLeaveAutoApproveTypes(leaveAutoApproveTypes.filter(x => x !== item.key));
                                                                } else {
                                                                    setLeaveAutoApproveTypes([...leaveAutoApproveTypes, item.key]);
                                                                }
                                                            }}
                                                            className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${isSel ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                                                        >
                                                            <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${isSel ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
                                                                {isSel && <Check size={12} strokeWidth={4} />}
                                                            </div>
                                                            <div>
                                                                <p className="text-[12px] font-black text-[#212c46] uppercase tracking-tight">{item.title}</p>
                                                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight mt-0.5">{item.desc}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-[11px] font-black text-[#212c46] uppercase tracking-widest mb-3 border-b pb-1">2. Safety Guardrail Thresholds</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Remaining Balance Buffer (โควตาคงเหลือขั้นต่ำ)</label>
                                                    <div className="flex items-center gap-3">
                                                        <input 
                                                            type="number" 
                                                            min="0" 
                                                            max="10" 
                                                            value={leaveAutoApproveMinBalance} 
                                                            onChange={(e) => setLeaveAutoApproveMinBalance(Math.max(0, parseInt(e.target.value, 10) || 0))} 
                                                            className="w-20 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-[#212c46] text-center font-mono outline-none focus:border-[#b58c4f]" 
                                                        />
                                                        <div>
                                                            <p className="text-[11px] font-bold text-slate-600 uppercase">Days Left Post-Leave</p>
                                                            <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Auto-approve is blocked if employee balance falls below this limit.</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Consecutive Request Threshold (จำนวนวันลาต่อเนื่องสูงสุด)</label>
                                                    <div className="flex items-center gap-3">
                                                        <input 
                                                            type="number" 
                                                            min="1" 
                                                            max="30" 
                                                            value={leaveAutoApproveMaxDays} 
                                                            onChange={(e) => setLeaveAutoApproveMaxDays(Math.max(1, parseInt(e.target.value, 10) || 1))} 
                                                            className="w-20 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-[#212c46] text-center font-mono outline-none focus:border-[#b58c4f]" 
                                                        />
                                                        <div>
                                                            <p className="text-[11px] font-bold text-slate-600 uppercase">Max Consecutive Days</p>
                                                            <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">If request days exceed this limit, it routes to HR for manual signoff.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ACTION ENGINE ROW */}
                                    <div className="border-t border-slate-100 pt-6 flex justify-end gap-3 font-sans">
                                        <button
                                            type="button"
                                            onClick={handleSaveLeaveAutoApproveConfig}
                                            className="bg-[#212c46] hover:bg-[#212c46]/90 text-white px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer border border-[#212c46]"
                                        >
                                            <Save size={14} className="text-[#b58c4f]"/> Save Configuration
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="px-8 py-5 border-b border-[#eaeaec] bg-[#f8f9fa] flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div>
                                        <h4 className="text-[18px] font-black uppercase text-[#212c46] tracking-tight flex items-center gap-3">
                                            <LucideIcon name={activeTabData.icon} size={22} className="text-[#b7a159]"/> {activeTabData.title}
                                        </h4>
                                        <p className="text-[11px] font-bold text-[#7a8b95] uppercase tracking-widest mt-1">{activeTabData.desc}</p>
                                    </div>
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <div className="relative flex-1 md:w-64">
                                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7a8b95]" />
                                            <input type="text" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder={`Search ${activeTabData.label}...`} className="w-full pl-12 pr-4 py-2.5 text-[12px] border border-[#eaeaec] rounded-xl font-bold outline-none focus:border-[#b7a159] bg-white shadow-sm text-[#212c46]" />
                                        </div>
                                        <button onClick={() => handleOpenModal()} className="bg-[#212c46] text-white px-6 py-2.5 rounded-xl font-black text-[12px] uppercase tracking-widest shadow-md hover:bg-[#414757] hover:text-white transition-all flex items-center gap-2 shrink-0 border border-[#212c46]">
                                            <Plus size={16} /> New Record
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto custom-scrollbar flex-1 min-h-0">
                                    <table className="w-full text-left font-sans border-collapse">
                                        <thead className="bg-[#212c46] border-b-2 border-[#b7a159] text-white uppercase tracking-widest text-[12px] font-black sticky top-0 z-10">
                                            <tr>
                                                {activeTab === 'idFormats' ? (
                                                    <>
                                                        <th className="py-4 px-6 whitespace-nowrap text-[12px]">Pages</th>
                                                        <th className="py-4 px-6 text-center whitespace-nowrap text-[12px]">Prefix</th>
                                                        <th className="py-4 px-6 text-center whitespace-nowrap text-[12px]">Format</th>
                                                        <th className="py-4 px-6 text-center whitespace-nowrap text-[12px]">Rule</th>
                                                        <th className="py-4 px-6 text-center whitespace-nowrap text-[12px]">Actions</th>
                                                    </>
                                                ) : activeTab === 'pdfTemplates' ? (
                                                    <>
                                                        <th className="py-4 px-6 whitespace-nowrap text-[12px]">Template</th>
                                                        <th className="py-4 px-6 text-center whitespace-nowrap text-[12px]">Department</th>
                                                        <th className="py-4 px-6 text-center whitespace-nowrap text-[12px]">Code</th>
                                                        <th className="py-4 px-6 text-center whitespace-nowrap text-[12px]">Revision</th>
                                                        <th className="py-4 px-6 text-center whitespace-nowrap text-[12px]">Actions</th>
                                                    </>
                                                ) : (
                                                    <>
                                                        <th className="py-4 px-6 whitespace-nowrap text-[12px]">Identification</th>
                                                        {activeTab === 'departments' && <th className="py-4 px-6 text-center whitespace-nowrap text-[12px]">Sys Code</th>}
                                                        <th className="py-4 px-6 text-center whitespace-nowrap text-[12px]">Status</th>
                                                        <th className="py-4 px-6 text-center whitespace-nowrap text-[12px]">Actions</th>
                                                    </>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#eaeaec]">
                                            {paginatedData.map((item: any) => (
                                                <tr key={item.id} className="hover:bg-[#f8f9fa] transition-colors group">
                                                    {activeTab === 'idFormats' ? (
                                                        <>
                                                            <td className="py-3 px-6 text-[12px]">
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {item.pages?.map((p: any, i: any) => (
                                                                        <span key={i} className="px-2.5 py-1 bg-[#212c46]/5 text-[#212c46] rounded-lg text-[11px] font-black border border-[#eaeaec] uppercase">{p}</span>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-6 text-center font-black text-[#4d87a8] text-[12px] font-mono">{item.prefix}</td>
                                                            <td className="py-3 px-6 text-center text-[12px]">
                                                                <span className="bg-[#f8f9fa] text-[#212c46] px-3 py-1.5 rounded-lg font-mono font-black text-[12px] border border-[#eaeaec]">{item.format}</span>
                                                            </td>
                                                            <td className="py-3 px-6 text-center text-[12px]">
                                                                <p className="text-[12px] font-black text-[#212c46]">{item.sequenceDigit} Digits</p>
                                                                <p className="text-[11px] font-bold text-[#7a8b95] uppercase mt-0.5">{item.reset} Reset</p>
                                                            </td>
                                                        </>
                                                    ) : activeTab === 'pdfTemplates' ? (
                                                        <>
                                                            <td className="py-3 px-6 font-black text-[#212c46] text-[12px] uppercase tracking-tight">{item.name}</td>
                                                            <td className="py-3 px-6 text-center font-bold text-[#7a8b95] text-[11px] uppercase tracking-widest">{item.dept}</td>
                                                            <td className="py-3 px-6 text-center font-mono font-black text-[#212c46] text-[12px]">{item.code}</td>
                                                            <td className="py-3 px-6 text-center font-black text-[#d96245] text-[12px]">{item.revision}</td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td className="py-3 px-6 text-[12px]">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-2 h-2 rounded-full bg-[#b7a159] shrink-0"></div>
                                                                    <span className="font-black text-[#212c46] text-[12px] uppercase tracking-tight">{item.name}</span>
                                                                </div>
                                                            </td>
                                                            {activeTab === 'departments' && <td className="py-3 px-6 text-center font-mono font-black text-[#4d87a8] text-[12px]">{item.code}</td>}
                                                            <td className="py-3 px-6 text-center text-[12px]">
                                                               <span className="px-3 py-1 bg-[#657f4d]/10 text-[#657f4d] border border-[#657f4d]/20 rounded-full text-[11px] font-black uppercase tracking-widest">Active</span>
                                                            </td>
                                                        </>
                                                    )}
                                                    <td className="py-3 px-6 text-center text-[12px]">
                                                        <div className="flex justify-center items-center gap-[0.5px]">
                                                            <button onClick={() => handleOpenModal(item)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#eaeaec] text-[#4d87a8] hover:border-[#212c46] hover:text-[#a94228] hover:bg-[#212c46]/5 transition-all shadow-sm bg-white active:scale-90" title="Edit">
                                                                <Pencil size={16} />
                                                            </button>
                                                            <button onClick={() => handleDelete(item.id)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#eaeaec] text-[#932c2e] hover:border-[#932c2e] hover:bg-[#932c2e]/10 transition-all shadow-sm bg-white active:scale-90" title="Delete">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* PAGINATION */}
                                <div className="px-8 py-3 bg-[#f8f9fa] border-t-[1.5px] border-slate-300 flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="flex items-center gap-6 text-[11px] font-black text-[#7a8b95] uppercase tracking-widest">
                                        <div className="flex items-center gap-3">
                                            <span>Display Rows:</span>
                                            <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="bg-white border border-[#eaeaec] rounded-lg px-3 py-1.5 outline-none font-black text-[#212c46] cursor-pointer shadow-sm">
                                                {[5, 10, 20, 50].map(v => <option key={v} value={v}>{v}</option>)}
                                            </select>
                                        </div>
                                        <p className="bg-white px-4 py-2 rounded-xl border border-[#eaeaec] shadow-sm">Total Records: {filteredList.length}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`w-10 h-10 border border-[#eaeaec] bg-white rounded-xl flex items-center justify-center transition-all ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#212c46] hover:text-white shadow-md active:scale-90'}`}>
                                            <ChevronLeft size={18}/>
                                        </button>
                                        <div className="bg-[#212c46] text-white px-8 py-2.5 rounded-xl shadow-md font-black text-[11px] min-w-[140px] text-center uppercase tracking-widest">
                                            Page {currentPage} / {totalPages || 1}
                                        </div>
                                        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className={`w-10 h-10 border border-[#eaeaec] bg-white rounded-xl flex items-center justify-center transition-all ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#212c46] hover:text-white shadow-md active:scale-90'}`}>
                                            <ChevronRight size={18}/>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                
            </div>
          </div>
          {/* MODAL SYSTEM */}
          <DraggableModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            width="max-w-2xl"
            customHeader={
                <div className="bg-[#212c46] px-6 py-4 flex justify-between items-center shrink-0 border-b-4 border-[#b7a159]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/10 text-[#b7a159] flex items-center justify-center border border-white/20 shadow-md backdrop-blur-md">
                            <LucideIcon name={activeTabData.icon} size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-[#d7d7d7] uppercase tracking-widest leading-none">{editingItem ? `Modify` : `Create`} {activeTabData.label}</h3>
                            <p className="text-[11px] font-bold text-[#d7d7d7]/70 uppercase tracking-widest mt-1 flex items-center gap-2">
                              <Zap size={10} className="text-[#b7a159]" /> Strategic Config Node Management
                            </p>
                        </div>
                    </div>
                    <button onClick={()=>setIsModalOpen(false)} className="text-white/70 hover:text-[#932c2e] transition-all bg-white/10 hover:bg-white/20 p-2 rounded-full relative z-10 active:scale-90"><X size={18} /></button>
                </div>
            }
          >
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[#f8f9fa]">
                    <form id="configForm" onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-[#eaeaec] shadow-sm space-y-6">
                        <div className="space-y-6">
                            <div>
                                <label className="text-[11px] font-black text-[#212c46] uppercase tracking-widest block mb-2">{activeTab.slice(0, -1).toUpperCase()} Title/Name <span className="text-[#932c2e]">*</span></label>
                                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-white border border-[#eaeaec] rounded-lg px-4 py-2.5 text-[12px] font-black text-[#212c46] outline-none focus:border-[#b7a159] transition-all uppercase shadow-sm" placeholder={`Enter ${activeTab.slice(0, -1)} description...`} />
                            </div>
                            {activeTab === 'departments' && (
                                <div>
                                    <label className="text-[11px] font-black text-[#212c46] uppercase tracking-widest block mb-2">System Routing Code <span className="text-[#932c2e]">*</span></label>
                                    <input type="text" required value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full bg-white border border-[#eaeaec] rounded-lg px-4 py-2.5 text-[12px] font-black text-[#212c46] font-mono outline-none focus:border-[#b7a159] transition-all uppercase shadow-sm" placeholder="e.g. FIN" />
                                </div>
                            )}
                        </div>
                    </form>
                 </div>

                 <div className="p-4 bg-[#f8f9fa] border-t border-[#eaeaec] flex justify-end items-center gap-3 shrink-0">
                    <button type="button" onClick={()=>setIsModalOpen(false)} className="px-6 py-2 bg-white border border-[#eaeaec] text-[#414757] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#d7d7d7]/30 transition-all">Cancel</button>
                    <button type="submit" form="configForm" className="bg-[#212c46] text-white px-6 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md hover:bg-[#414757] hover:text-white transition-all flex items-center gap-2">
                        <Save size={14}/> Save Config
                    </button>
                 </div>
          </DraggableModal>
          {/* PRINT PREVIEW MODAL */}
          <DraggableModal
            isOpen={isPrintPreviewOpen}
            onClose={() => setIsPrintPreviewOpen(false)}
            width="max-w-[1000px]"
            customHeader={
                <div className="bg-[#212c46] px-6 py-4 flex justify-between items-center shrink-0 border-b-4 border-[#b7a159] modal-handle cursor-move select-none">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/10 text-[#b7a159] flex items-center justify-center border border-white/20 shadow-md backdrop-blur-md">
                            <Printer size={24} />
                        </div>
                        <div>
                            <h3 className="text-sm md:text-base font-black text-[#d7d7d7] uppercase tracking-wider leading-none">A4 Report Print Sheet Simulator</h3>
                            <p className="text-[10px] sm:text-[11px] font-bold text-[#d7d7d7]/70 uppercase tracking-widest mt-1 flex items-center gap-2">
                              <Zap size={10} className="text-[#b7a159]" /> Visual Layout Compliance Testing
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setIsPrintPreviewOpen(false)} className="text-white/70 hover:text-[#932c2e] transition-all bg-white/10 hover:bg-white/20 p-2 rounded-full active:scale-90 cursor-pointer"><X size={18} /></button>
                </div>
            }
          >
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-[#111c30]">
                {/* Left Sidebar Control Panel */}
                <div className="w-full md:w-[280px] bg-[#16223b] border-r border-slate-800 p-6 flex flex-col justify-between shrink-0 text-slate-300">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-[11px] font-black tracking-widest text-[#b58c4f] uppercase border-b border-slate-800 pb-2">Layout Simulation Controls</h4>
                            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                                จำลองรูปเล่มแบบ A4 Portrait เพื่อตรวจสอบระยะขอบ (Margins) และการจัดวางส่วนหัว ท้าย และโลโก้บริษัท เมื่อสั่งพิมพ์จริงผ่านบราวเซอร์
                            </p>
                        </div>

                        {/* Scale Selector */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 block">Preview Scale (Zoom)</label>
                            <div className="grid grid-cols-4 gap-1.5">
                                {[50, 70, 80, 100].map((zoom) => (
                                    <button
                                        key={zoom}
                                        type="button"
                                        onClick={() => setPreviewZoom(zoom)}
                                        className={`py-1.5 rounded-lg border text-[10px] font-black transition-all cursor-pointer ${
                                            previewZoom === zoom
                                                ? 'bg-[#b58c4f] border-[#b58c4f] text-[#111c30]'
                                                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-300'
                                        }`}
                                    >
                                        {zoom}%
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Page Count Toggle */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 block">Number of Pages Represented</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[1, 2].map((np) => (
                                    <button
                                        key={np}
                                        type="button"
                                        onClick={() => setPreviewPages(np)}
                                        className={`py-2 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                            previewPages === np
                                                ? 'bg-[#b58c4f] border-[#b58c4f] text-[#111c30]'
                                                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-400'
                                        }`}
                                    >
                                        {np} {np === 1 ? 'Page' : 'Pages (Repeat)'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quality Checklist */}
                        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3">
                            <h5 className="text-[9px] font-extrabold text-[#b58c4f] uppercase tracking-widest leading-none">Layout Checklist</h5>
                            <ul className="text-[10px] space-y-2 font-bold uppercase text-slate-400 tracking-normal list-none pl-0">
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#b58c4f]"></span>
                                    Logo Aspect ratio matches 1:1 square
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#b58c4f]"></span>
                                    Subheading text limit conforms
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#b58c4f]"></span>
                                    Confidential tag alert highlighted
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#b58c4f]"></span>
                                    Bottom footer margin & timestamp rule
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-slate-800/80">
                        <p className="text-[9px] text-[#b58c4f] font-mono leading-relaxed">
                            💡 ในการใช้งานจริง ระบบจะบังคับใช้ CSS Page Breaks `@media print` อัตโนมัติในทุกๆ หน้าตามสเปค A4 Portrait
                        </p>
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="w-full bg-[#b58c4f] hover:bg-[#b58c4f]/90 text-[#111c30] p-3 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Printer size={13} strokeWidth={3}/> Trigger Browser Print
                        </button>
                    </div>
                </div>

                {/* Right Page Canvas Workspace */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[#0b1322] flex flex-col items-center gap-8 shadow-inner select-none max-h-[75vh]">
                    {/* Visual Scale Wrapper to perform precise zoom CSS transform */}
                    <div 
                        className="transition-all duration-300 origin-top flex flex-col items-center gap-10"
                        style={{ 
                            transform: `scale(${previewZoom / 100})`, 
                            width: '740px', // Standard simulated A4 screen width proportion
                            maxHeight: 'none',
                            marginBottom: `${(previewZoom - 100) * 8}px`
                        }}
                    >
                        {Array.from({ length: previewPages }).map((_, pageIdx) => (
                            <div 
                                key={pageIdx} 
                                className="bg-white text-black p-[40px] shadow-2xl relative border border-slate-700/50 flex flex-col justify-between font-sans shrink-0 overflow-hidden select-none"
                                style={{ 
                                    width: '740px', 
                                    height: '1046px' // Proportional A4 aspect ratio height (~1.414 ratio)
                                }}
                            >
                                {/* Watermark identifier */}
                                <div className="absolute top-2 right-4 bg-[#b58c4f]/10 text-[#b58c4f] text-[7px] tracking-widest uppercase font-mono px-2 py-0.5 rounded border border-[#b58c4f]/20 z-[10]">
                                    Page {pageIdx + 1} Simulator View
                                </div>

                                {/* Outer Border Guides */}
                                <div className="absolute inset-0 border-[20px] border-slate-100 pointer-events-none select-none opacity-20" />

                                <div className="flex-1 flex flex-col justify-between h-full relative z-[2]">
                                    {/* PRINT LAYOUT SIMULATED HEADER */}
                                    <div className="border-b-[3px] border-double border-slate-900 pb-2 mb-2 bg-white flex flex-col w-full select-none">
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-3">
                                                {/* Company logo render wrapper */}
                                                <div className="shrink-0 flex items-center justify-center">
                                                    {(printLogoType === 'default' || !printLogoValue) ? (
                                                        <div className="text-black shrink-0 font-bold bg-slate-100 p-1 rounded-lg animate-pulse">
                                                            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" className="text-black inline-block" stroke="currentColor" strokeWidth="2.5">
                                                                <circle cx="12" cy="12" r="10" />
                                                                <circle cx="12" cy="12" r="6" />
                                                                <circle cx="12" cy="12" r="2" />
                                                            </svg>
                                                        </div>
                                                    ) : (
                                                        <img 
                                                            src={printLogoType === 'drive' ? resolveDriveUrl(printLogoValue) : printLogoValue} 
                                                            alt="Company Logo" 
                                                            className="w-9 h-9 object-contain rounded-md border border-slate-200" 
                                                            referrerPolicy="no-referrer"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                const parent = e.currentTarget.parentElement;
                                                                if (parent) {
                                                                    const fallbackContainer = document.createElement('div');
                                                                    fallbackContainer.className = "text-black shrink-0 font-bold bg-slate-100 p-1 rounded-lg";
                                                                    fallbackContainer.innerHTML = `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" class="text-black inline-block" stroke="currentColor" stroke-width="2.5">
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
                                                <div className="flex flex-col text-left">
                                                    <h1 className="text-[10px] sm:text-[11px] font-black tracking-tight leading-none uppercase text-slate-900 font-sans">
                                                        {printCompanyEn}
                                                    </h1>
                                                    <h2 className="text-[8px] font-extrabold tracking-wide uppercase mt-0.5 text-slate-700 leading-none">
                                                        {printCompanyTh}
                                                    </h2>
                                                    <span className="text-[6.5px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 font-mono">
                                                        {printDept}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="text-right flex flex-col">
                                                <span className="text-[6px] font-black text-slate-400 tracking-widest leading-none">SYSTEM PROTOCOL</span>
                                                <span className="text-[8px] font-black uppercase text-slate-800 tracking-wider mt-0.5 leading-none font-mono">
                                                    {printSysCode}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-1.5 border-t border-slate-200 pt-1 flex flex-col w-full text-left">
                                            <span className="text-[6.5px] font-black text-slate-400 tracking-widest leading-none uppercase">OFFICIAL CLASSIFIED REPORT TITLE</span>
                                            <h3 className="text-[9px] font-black text-slate-950 font-sans tracking-tight mt-0.5 uppercase">
                                                {pageIdx === 0 
                                                    ? 'EXECUTIVE SUMMARY & OPERATIONAL HEALTH REPORT (PAGE 1)' 
                                                    : 'STRATEGIC COMPLIANCE & KPI SCORECARD DASHBOARD (PAGE 2)'}
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-4 gap-1.5 mt-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200 w-full text-left">
                                            <div className="flex flex-col">
                                                <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest">REPORT ID</span>
                                                <span className="text-[7.5px] font-extrabold text-slate-800 font-mono mt-0.5">CSE-REP-0994</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest">GENERATOR BY</span>
                                                <span className="text-[7.5px] font-extrabold text-slate-800 uppercase mt-0.5">Chaisri Admin</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest">DATE & TIME</span>
                                                <span className="text-[7.5px] font-extrabold text-slate-800 font-mono mt-0.5">{new Date().toLocaleDateString('th-TH')} {new Date().toLocaleTimeString('th-TH', {hour12:false})}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest">CLASSIFICATION</span>
                                                <span className="text-[7.5px] font-extrabold text-[#932c2e] mt-0.5 uppercase tracking-wider font-mono">{printClassification}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SIMULATED BODY CONTENT */}
                                    <div className="flex-1 my-4 flex flex-col justify-start text-left">
                                        <div className="border border-slate-300 rounded-xl overflow-hidden p-4 bg-white space-y-4">
                                            <div className="flex items-center justify-between border-b pb-2">
                                                <p className="text-[9px] font-black text-[#212c46] uppercase tracking-wider flex items-center gap-1 leading-none">
                                                    <ShieldCheck size={12} className="text-[#b58c4f]" /> 
                                                    {pageIdx === 0 ? 'I. CHAISRI SYSTEM STABILITY METRICS' : 'II. REVENUE & RESOURCE BREAKDOWN'}
                                                </p>
                                                <span className="text-[8px] font-bold text-slate-400 font-mono">STATUS: OPTIMAL</span>
                                            </div>

                                            {pageIdx === 0 ? (
                                                <>
                                                    <p className="text-[8px] text-slate-600 leading-relaxed normal-case font-bold">
                                                        รายงานฉบับจัดพิมพ์สังเคราะห์ขึ้นเพื่อวัดผลความเสถียรของระบบ (Operational Core Compliance) ของแผนกต่าง ๆ ภายในเครือชัยศรี ประกอบด้วยข้อมูลสารสนเทศเบื้องต้นสำหรับการวิเคราะห์สถิติประยุกต์
                                                    </p>
                                                    <table className="w-full text-[8.5px] border border-slate-200">
                                                        <thead>
                                                            <tr className="bg-slate-50 text-slate-700 font-black font-mono">
                                                                <th className="border p-1 text-left">DEPARTMENT</th>
                                                                <th className="border p-1 text-center">CODE</th>
                                                                <th className="border p-1 text-center">STRENGTH</th>
                                                                <th className="border p-1 text-right">COMPLIANCE</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="font-bold font-mono">
                                                            <tr>
                                                                <td className="border p-1">Office of Strategic Human Resources</td>
                                                                <td className="border p-1 text-center">HRM</td>
                                                                <td className="border p-1 text-center">98.4%</td>
                                                                <td className="border p-1 text-right text-emerald-700">EXCELLENT</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="border p-1">Corporate Accounting & Finance</td>
                                                                <td className="border p-1 text-center">FIN</td>
                                                                <td className="border p-1 text-center">94.1%</td>
                                                                <td className="border p-1 text-right text-emerald-700">COMPLIANT</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="border p-1">Agriculture Logistics Operations</td>
                                                                <td className="border p-1 text-center">LOG</td>
                                                                <td className="border p-1 text-center">88.5%</td>
                                                                <td className="border p-1 text-right text-amber-700">STABLE</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="border p-1">Poultry Slicing Production Group 1</td>
                                                                <td className="border p-1 text-center">PRD</td>
                                                                <td className="border p-1 text-center">91.3%</td>
                                                                <td className="border p-1 text-right text-emerald-700">COMPLIANT</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-[8px] text-slate-600 leading-relaxed normal-case font-bold">
                                                        ข้อมูลเชิงลึกส่วนที่สองระบุถึงประสิทธิภาพทางการผลิตและการบริหารความเสี่ยง ซึ่งระบบสามารถแจกแจงรายรับ รายจ่าย และชั่วโมงปฏิบัติการจริงของกลุ่มบุคลากรสายเกษตรเคมีภัณฑ์ในไตรมาสล่าสุด
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="border border-slate-100 rounded-lg p-2 bg-slate-50">
                                                            <span className="text-[7px] text-slate-400 font-black tracking-widest block">QUARTERLY EFFICIENCY</span>
                                                            <span className="text-[12px] font-black text-slate-900 block mt-1">94.88 %</span>
                                                            <span className="text-[6.5px] text-emerald-600 font-bold block mt-0.5">▲ +2.4% vs Previous Quarter</span>
                                                        </div>
                                                        <div className="border border-slate-100 rounded-lg p-2 bg-slate-50">
                                                            <span className="text-[7px] text-slate-400 font-black tracking-widest block">OPERATIONAL MARGIN</span>
                                                            <span className="text-[12px] font-black text-[#932c2e] block mt-1">11,284,500 ฿</span>
                                                            <span className="text-[6.5px] text-slate-400 font-bold block mt-0.5">Excludes strategic corporate overheads</span>
                                                        </div>
                                                    </div>
                                                    <div className="border border-slate-100 p-2.5 rounded-lg text-[7.5px] font-bold text-slate-500 font-mono border-l-4 border-l-[#b58c4f] mt-1">
                                                        "เอกสารฉบับตรวจทานนี้อ้างอิงข้อมูลดิบที่ได้เชื่อมโยงเข้าฐานข้อมูลหลัก Google Sheets ของเครือชัยศรี บริษัท ชัยศรี แปรรูปเกษตรอุตสาหกรรม จำกัด เป็นการจำลองผลล่วงหน้าเพื่อประกอบการตัดสินใจ"
                                                    </div>
                                                </>
                                            )}
                                            
                                            <div className="pt-2 border-t border-dashed border-slate-300 grid grid-cols-2 gap-8 text-[8px] font-bold uppercase mt-2">
                                                <div className="border-b border-b-slate-400 pb-1 flex justify-between">
                                                    <span className="text-slate-400 font-mono">Prepared By:</span>
                                                    <span className="text-slate-900 font-mono">________________________</span>
                                                </div>
                                                <div className="border-b border-b-slate-400 pb-1 flex justify-between">
                                                    <span className="text-slate-400 font-mono">Approved By:</span>
                                                    <span className="text-slate-900 font-mono">________________________</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* PRINT LAYOUT SIMULATED FOOTER */}
                                    <div className="border-t border-slate-300 pt-1 flex items-center justify-between w-full select-none text-[7.5px] font-mono leading-none bg-white text-slate-500">
                                        <div>
                                            <span className="font-extrabold uppercase tracking-wider text-slate-600">
                                                {printFooter}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 font-bold uppercase">
                                            <span>Generated Timestamp: </span>
                                            <span>{new Date().toLocaleDateString('th-TH')} {new Date().toLocaleTimeString('th-TH', {hour12:false})}</span>
                                        </div>
                                        <div className="font-extrabold text-slate-800 uppercase tracking-wider">
                                            Page {pageIdx + 1}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </DraggableModal>
      </div>
  );
}
