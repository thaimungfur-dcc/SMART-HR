import { UserGuidePanel } from '../../components/shared/UserGuidePanel';
import KpiCard from '../../components/shared/KpiCard';
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';
import { DraggableModal } from '../../components/shared/DraggableModal';
import { useLanguage } from '../../context/LanguageContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import Swal from 'sweetalert2';
import MySwal from 'sweetalert2-react-content';

const swalReact = MySwal(Swal);

// --- Theme Configuration (Synced with Home & User Permissions) ---
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
  coolGray: '#eaeaec'
};

// --- Initial Sample Data (Preserved 100%) ---
const INITIAL_REQUESTS = [
  { id: 1, reqId: 'OT-2605-001', empId: 'E001', name: 'SOMCHAI SALES', dept: 'SALES', date: '2026-05-10', plannedHrs: 2.0, actualHrs: 2.5, reason: 'Clear pending monthly orders', status: 'Pending' },
  { id: 2, reqId: 'OT-2605-002', empId: 'E002', name: 'SUDA MARKETING', dept: 'MKT', date: '2026-05-10', plannedHrs: 3.0, actualHrs: 3.0, reason: 'Prepare Q3 campaign launch', status: 'Approved' },
  { id: 3, reqId: 'OT-2605-003', empId: 'E003', name: 'WICHAI DEV', dept: 'IT', date: '2026-05-11', plannedHrs: 4.0, actualHrs: 0.0, reason: 'Server maintenance (Downtime)', status: 'Pending' },
  { id: 4, reqId: 'OT-2605-004', empId: 'E004', name: 'MALI HR', dept: 'HR', date: '2026-05-09', plannedHrs: 1.5, actualHrs: 1.5, reason: 'Payroll processing', status: 'Approved' },
  { id: 5, reqId: 'OT-2605-005', empId: 'E005', name: 'SOMSRI WH', dept: 'WAREHOUSE', date: '2026-05-09', plannedHrs: 2.0, actualHrs: 4.0, reason: 'Stock counting', status: 'Rejected' },
  { id: 6, reqId: 'OT-2605-006', empId: 'E006', name: 'ANUSORN PROD', dept: 'PRODUCTION', date: '2026-05-10', plannedHrs: 2.5, actualHrs: 2.5, reason: 'Machine breakdown recovery', status: 'Approved' },
];

// Helper to render Lucide Icons dynamically
const kebabToPascal = (str: string) => str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
const LucideIcon = ({ name, size = 16, className = "", color, style, strokeWidth = 2.5 }: any) => {
  if (!name) return null;
  if (typeof name !== 'string') {
    const IconComponent = name;
    return <IconComponent size={size} className={className} style={{...style, color}} strokeWidth={strokeWidth} />;
  }
  const pascalName = kebabToPascal(name);
  const IconComponent = Icons[pascalName as keyof typeof Icons] || Icons.CircleHelp;
  return <IconComponent size={size} className={className} style={{...style, color}} strokeWidth={strokeWidth} />;
};

// --- Main Page Component ---
export default function Overtime() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'requests' | 'analytics' | 'settings'>('requests');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // States with Local L2 Persistence
  const [requests, setRequests] = useState<any[]>(() => {
    const saved = localStorage.getItem('ot_module_requests');
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('ot_module_settings');
    const defaultSettings = {
      standardOtRate: 1.5,
      holidayOtRate: 3.0,
      maxWeeklyHrs: 36,
      autoApproveThreshold: 4.0,
      plannedAlertThreshold: 2.0,
      enableBreaksRule: true,
      itBudget: 45000,
      salesBudget: 60000,
      mktBudget: 40000,
      hrBudget: 15000,
      whBudget: 50000,
      prodBudget: 90000,
    };
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('ot_module_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('ot_module_settings', JSON.stringify(settings));
  }, [settings]);

  // --- CRUD Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedReq, setSelectedReq] = useState<any | null>(null);
  
  // Form State
  const [formReqId, setFormReqId] = useState('');
  const [formEmpId, setFormEmpId] = useState('');
  const [formName, setFormName] = useState('');
  const [formDept, setFormDept] = useState('SALES');
  const [formDate, setFormDate] = useState('');
  const [formPlannedHrs, setFormPlannedHrs] = useState(2.0);
  const [formActualHrs, setFormActualHrs] = useState(0.0);
  const [formReason, setFormReason] = useState('');
  const [formStatus, setFormStatus] = useState('Pending');

  // --- CSV Import Modal State ---
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedRowsData, setImportedRowsData] = useState<any[]>([]);
  const [conflictedRows, setConflictedRows] = useState(0);

  const departments = ['SALES', 'MKT', 'IT', 'HR', 'WAREHOUSE', 'PRODUCTION'];

  // --- Filter and Search Logic ---
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchSearch = 
        req.name.toLowerCase().includes(search.toLowerCase()) ||
        req.empId.toLowerCase().includes(search.toLowerCase()) ||
        req.reqId.toLowerCase().includes(search.toLowerCase()) ||
        req.reason.toLowerCase().includes(search.toLowerCase());
      
      const matchDept = filterDept === 'All' || req.dept === filterDept;
      const matchStatus = filterStatus === 'All' || req.status === filterStatus;

      return matchSearch && matchDept && matchStatus;
    });
  }, [requests, search, filterDept, filterStatus]);

  // Pagination
  const pagerCount = Math.ceil(filteredRequests.length / itemsPerPage) || 1;
  const currentRequests = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredRequests.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredRequests, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterDept, filterStatus]);

  // --- KPI Core calculations ---
  const kpis = useMemo(() => {
    const pending = requests.filter(r => r.status === 'Pending').length;
    const totalPlanned = requests.reduce((acc, curr) => acc + (Number(curr.plannedHrs) || 0), 0);
    const totalActual = requests.reduce((acc, curr) => acc + (Number(curr.actualHrs) || 0), 0);
    
    // Variance is Actual - Planned (or absolute)
    const variance = (totalActual - totalPlanned).toFixed(1);
    
    // Overlimit Weekly Hours count
    const limitCount = requests.filter(r => (Number(r.actualHrs) || 0) > 4.0).length;

    return {
      pending,
      totalPlanned: totalPlanned.toFixed(1),
      totalActual: totalActual.toFixed(1),
      variance: variance,
      limitCount,
      totalCount: requests.length
    };
  }, [requests]);

  // --- Chart Pre-computation ---
  const deptChartData = useMemo(() => {
    return departments.map(d => {
      const dReqs = requests.filter(r => r.dept === d);
      const plannedSum = dReqs.reduce((acc, curr) => acc + (Number(curr.plannedHrs) || 0), 0);
      const actualSum = dReqs.reduce((acc, curr) => acc + (Number(curr.actualHrs) || 0), 0);
      return {
        department: d,
        Planned: Number(plannedSum.toFixed(1)),
        Actual: Number(actualSum.toFixed(1)),
        Overtime_Difference: Number((actualSum - plannedSum).toFixed(1))
      };
    });
  }, [requests]);

  // --- Action Handlers ---
  const handleOpenAddModal = () => {
    setModalMode('add');
    setSelectedReq(null);
    
    // Generate new Temp ID
    const nextNum = String(requests.length + 1).padStart(3, '0');
    setFormReqId(`OT-2605-${nextNum}`);
    setFormEmpId('E007');
    setFormName('');
    setFormDept('SALES');
    
    // Today formatted date
    const todayStr = '2026-05-12';
    setFormDate(todayStr);
    setFormPlannedHrs(2.5);
    setFormActualHrs(0.0);
    setFormReason('');
    setFormStatus('Pending');

    setIsModalOpen(true);
  };

  const handleOpenEditModal = (req: any) => {
    setModalMode('edit');
    setSelectedReq(req);
    
    setFormReqId(req.reqId);
    setFormEmpId(req.empId);
    setFormName(req.name);
    setFormDept(req.dept);
    setFormDate(req.date);
    setFormPlannedHrs(req.plannedHrs);
    setFormActualHrs(req.actualHrs);
    setFormReason(req.reason);
    setFormStatus(req.status);

    setIsModalOpen(true);
  };

  const handleSaveRequest = () => {
    if (!formName.trim()) {
      swalReact.fire('Error', 'โปรดระบุชื่อพนักงานให้ถูกต้อง', 'error');
      return;
    }
    if (!formReason.trim()) {
      swalReact.fire('Error', 'โปรดระบุเหตุผลในการทำงานล่วงเวลา (OT Reason) ให้ละเอียด', 'error');
      return;
    }

    if (modalMode === 'add') {
      const newObj = {
        id: Date.now(),
        reqId: formReqId,
        empId: formEmpId,
        name: formName,
        dept: formDept,
        date: formDate,
        plannedHrs: Number(formPlannedHrs),
        actualHrs: Number(formActualHrs),
        reason: formReason,
        status: formStatus
      };
      setRequests(prev => [newObj, ...prev]);
      swalReact.fire({
        icon: 'success',
        title: 'บันทึกสำเร็จ',
        text: `เพิ่มบันทึกขอเวลาล่วงเวลาของ ${formName} เรียบร้อยแล้ว`,
        confirmButtonColor: THEME.primary
      });
    } else {
      setRequests(prev => prev.map(item => {
        if (item.id === selectedReq.id) {
          return {
            ...item,
            reqId: formReqId,
            empId: formEmpId,
            name: formName,
            dept: formDept,
            date: formDate,
            plannedHrs: Number(formPlannedHrs),
            actualHrs: Number(formActualHrs),
            reason: formReason,
            status: formStatus
          };
        }
        return item;
      }));
      swalReact.fire({
        icon: 'success',
        title: 'แก้ไขสำเร็จ',
        text: 'อัปเดตข้อมูลข้อมูลล่วงเวลาพนักงานเรียบร้อยแล้ว',
        confirmButtonColor: THEME.primary
      });
    }
    setIsModalOpen(false);
  };

  const handleDeleteRequest = (id: number, name: string) => {
    swalReact.fire({
      title: 'ลบรายการขอโอที?',
      text: `คุณกำลังจะลบข้อมูลคำขอโอทีของ ${name} ตลาดกาล ออกจากระบบ`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: THEME.danger,
      cancelButtonColor: '#7a8b95',
      confirmButtonText: 'ยืนยันการลบ',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        setRequests(prev => prev.filter(x => x.id !== id));
        swalReact.fire('ลบข้อมูลสำเร็จแล้ว!', '', 'success');
      }
    });
  };

  const handleQuickStatus = (id: number, status: string) => {
    setRequests(prev => prev.map(x => x.id === id ? { ...x, status } : x));
    swalReact.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `อัปเดตสถานะคำขอเป็น ${status} แล้ว` ,
      showConfirmButton: false,
      timer: 1800
    });
  };

  // --- Bulk CSV Upload (As required by AGENTS.md) ---
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).map(line => line.split(','));
      if (lines.length <= 1) return;

      const matched: any[] = [];
      let conflictCount = 0;

      // Expecting standard format header-less or matching header: ReqID, EmpID, Name, Dept, Date, PlannedHrs, ActualHrs, Reason, Status
      const keys = lines[0].map(h => h.trim().toLowerCase());
      const hasHeader = keys.includes('reqid') || keys.includes('empid') || keys.includes('name');
      const dataRows = hasHeader ? lines.slice(1) : lines;

      dataRows.forEach((row, index) => {
        if (row.length < 5 || !row[1]) return; // empty row or missing EmpID

        const rReqId = row[0] ? row[0].trim() : `OT-AUTO-${Math.floor(1000 + Math.random() * 9000)}`;
        const rEmpId = row[1] ? row[1].trim() : '';
        const rName = row[2] ? row[2].trim() : '';
        const rDept = row[3] ? row[3].trim().toUpperCase() : 'SALES';
        const rDate = row[4] ? row[4].trim() : '2026-05-12';
        const rPlanned = parseFloat(row[5]) || 2.0;
        const rActual = parseFloat(row[6]) || 0.0;
        const rReason = row[7] ? row[7].trim() : 'Overtime operational needs';
        const rStatus = row[8] ? row[8].trim() : 'Pending';

        // Check Conflict
        const conflictExists = requests.some(all => all.empId === rEmpId && all.date === rDate);
        if (conflictExists) {
          conflictCount++;
        }

        matched.push({
          rowNum: index + 1,
          reqId: rReqId,
          empId: rEmpId,
          name: rName,
          dept: rDept,
          date: rDate,
          plannedHrs: rPlanned,
          actualHrs: rActual,
          reason: rReason,
          status: rStatus,
          isDuplicate: conflictExists
        });
      });

      setImportedRowsData(matched);
      setConflictedRows(conflictCount);
      setIsImportModalOpen(true);
    };
    reader.readAsText(file);
    // Reset target value to allow re-trigger same file
    e.target.value = '';
  };

  const handleConfirmCSVImport = () => {
    // Merge only or replace
    const toImport = importedRowsData.map((row, i) => ({
      id: Date.now() + i,
      reqId: row.reqId,
      empId: row.empId,
      name: row.name,
      dept: row.dept,
      date: row.date,
      plannedHrs: row.plannedHrs,
      actualHrs: row.actualHrs,
      reason: row.reason,
      status: row.status
    }));

    setRequests(prev => [...toImport, ...prev]);
    setIsImportModalOpen(false);

    swalReact.fire({
      icon: 'success',
      title: 'นำเข้าไฟล์สำเร็จ',
      text: `นำเข้าร้านประวัติโอทีโรงงานพนักงานเพิ่มจำนวน ${toImport.length} รายการเสร็จสิ้น`
    });
  };

  // --- CSV Export (As required by AGENTS.md) ---
  const handleExportCSV = () => {
    const headers = ['Request ID', 'Employee ID', 'Name', 'Department', 'Date', 'Planned Hrs', 'Actual Hrs', 'Reason', 'Status'];
    const rows = filteredRequests.map(r => [
      r.reqId,
      r.empId,
      r.name,
      r.dept,
      r.date,
      r.plannedHrs,
      r.actualHrs,
      r.reason,
      r.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `OT_REPORT_EXPORT_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- PDF Printing System with Standard Header Layout (As required by AGENTS.md) ---
  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rowsHtml = filteredRequests.map(r => `
      <tr style="border-bottom: 1px solid #eaeaec;">
        <td style="padding: 10px 6px; font-weight: bold;">${r.reqId}</td>
        <td style="padding: 10px 5px;">${r.empId}</td>
        <td style="padding: 10px 5px; font-weight: bold;">${r.name}</td>
        <td style="padding: 10px 5px; text-transform: uppercase;">${r.dept}</td>
        <td style="padding: 10px 5px;">${r.date}</td>
        <td style="padding: 10px 5px; text-align: center;">${r.plannedHrs.toFixed(1)}</td>
        <td style="padding: 10px 5px; text-align: center;">${r.actualHrs.toFixed(1)}</td>
        <td style="padding: 10px 5px; font-size: 11px; max-width: 200px;">${r.reason}</td>
        <td style="padding: 10px 5px; text-align: center;"><span style="font-weight: bold; padding: 3px 8px; border-radius: 4px; font-size: 10px; ${
          r.status === 'Approved' ? 'background: #657f4d20; color: #657f4d;' : 
          r.status === 'Rejected' ? 'background: #932c2e20; color: #932c2e;' : 
          'background: #3f809e20; color: #3f809e;'
        }">${r.status}</span></td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Overtime Management Registry Report</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; color: #212c46; margin: 40px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #b7a159; padding-bottom: 20px; margin-bottom: 30px; }
            .company { font-weight: 900; font-size: 18px; text-transform: uppercase; tracking: 0.1em; }
            .title { font-weight: 700; text-align: right; text-transform: uppercase; font-size: 14px; color: #a94228; }
            .meta { font-size: 11px; color: #7a8b95; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { background-color: #212c46; color: white; padding: 12px 6px; font-weight: 800; text-transform: uppercase; text-align: left; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="company"><span style="color:#b7a159;">★</span> SMART LAW HR SYSTEMS</div>
              <div class="meta">Corporate Legal & Operational Logistics Platform</div>
            </div>
            <div>
              <div class="title">Overtime Audit Record Registry</div>
              <div class="meta" style="text-align: right;">Generated on: ${new Date().toLocaleString()}</div>
            </div>
          </div>
          <div style="margin-bottom: 20px;">
            <p><strong>Total Scoped Entries:</strong> ${filteredRequests.length} record(s) matching current filtered criteria.</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>REQ ID</th>
                <th>EMP ID</th>
                <th>NAME</th>
                <th>DEPT</th>
                <th>DATE</th>
                <th style="text-align: center;">PLANNED (HRS)</th>
                <th style="text-align: center;">ACTUAL (HRS)</th>
                <th>OT PURPOSE</th>
                <th style="text-align: center;">STATUS</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <div style="margin-top: 50px; border-top: 1px dotted #eaeaec; padding-top: 20px; font-size: 10px; color: #7a8b95; text-align: center;">
            CONFIDENTIAL HR AUDITING SHEET · SMART LAW SYSTEMS · PAGE 1 OF 1
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-1 w-full flex-col animate-fadeIn bg-transparent space-y-4 pb-6 min-h-0">
      {/* USER GUIDE FLOATING TAB */}
      {typeof document !== 'undefined' && createPortal(
        <button onClick={() => setIsGuideOpen(true)} className="fixed right-0 bg-[#f8f9fa] border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#932c2e] hover:text-white hover:border-[#932c2e] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group" style={{ top: '80px' }}>
          <Icons.HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#7a8b95] group-hover:text-white" />
          <span className="font-black tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[10px]">USER GUIDE</span>
        </button>,
        document.body
      )}
      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      {/* HEADER SECTION (Uniformed with User Permissions Layout) */}
      <div className="h-14 px-8 flex flex-row items-center justify-between gap-4 z-20 shrink-0">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center group cursor-default shrink-0">
            <div className="absolute inset-0 bg-[#3f809e] blur-[15px] opacity-20 rounded-full group-hover:opacity-60 transition-all duration-700"></div>
            <div className="relative z-10 p-1.5 border border-[#3f809e]/40 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm">
              <Icons.Clock size={28} strokeWidth={2.5} className="text-[#3f809e]" />
            </div>
          </div>
          <div>
            <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none" style={{ fontSize: '24px' }}>
              OVERTIME <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3f809e] to-[#b58c4f]">MANAGEMENT</span> NODE
            </h3>
            <p className="text-[11px] font-bold text-[#4d5a44] uppercase tracking-[0.2em] mt-0.5 opacity-80 leading-none">
              PLANNED FORECASTING & ACTUAL PAYROLL SYNC
            </p>
          </div>
        </div>

        {/* Global Toolbar Tabs */}
        <div className="flex items-center gap-4">
          <div className="bg-white/50 p-1.5 rounded-xl border border-white/60 shadow-inner flex flex-wrap items-center gap-1">
            <button onClick={() => setActiveTab('requests')} className={`px-5 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'requests' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#7a8b95] hover:text-[#a94228]'}`}>
              <Icons.ClipboardList size={15} /> OT Registry
            </button>
            <button onClick={() => setActiveTab('analytics')} className={`px-5 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#7a8b95] hover:text-[#a94228]'}`}>
              <Icons.TrendingUp size={15} /> Variance Analytics
            </button>
            <button onClick={() => setActiveTab('settings')} className={`px-5 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'settings' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#7a8b95] hover:text-[#a94228]'}`}>
              <Icons.Settings size={15} /> Settings Policy
            </button>
          </div>
        </div>
      </div>
      <div className="px-8 w-full mt-[2px]">
        
        {/* KPI STATS CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 shrink-0">
          <KpiCard
            label="Pending Approval"
            value={kpis.pending}
            icon="clock"
            color={THEME.skyBlue}
            description="Awaiting Actions" />
          <KpiCard
            label="Planned Cum. Hrs"
            value={kpis.totalPlanned}
            icon="clipboard-list"
            color={THEME.gold}
            description="Scheduled Forecast" />
          <KpiCard
            label="Actual Clocked Hrs"
            value={kpis.totalActual}
            icon="timer"
            color={THEME.success}
            description="Real Attendance" />
          <KpiCard
            label="Cost Variance Difference"
            value={`${kpis.variance} Hrs`}
            icon="alert-circle"
            color={Number(kpis.variance) > 0 ? THEME.accent : THEME.success}
            description="Variance Delta" />
        </div>

        {/* --- TAB 1: REQUESTS REGISTRY --- */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-3xl shadow-lg border border-[#eaeaec] overflow-hidden flex flex-col animate-fadeIn  flex-1 min-h-0">
            {/* Filter toolbar */}
            <div className="px-6 py-4 border-b border-[#eaeaec] bg-[#f8f9fa] flex flex-col lg:flex-row justify-between items-center gap-4 shrink-0">
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Icons.Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7a8b95]" />
                  <input 
                    type="text" 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    placeholder="Search ID, Name or Purpose..." 
                    className="w-full pl-10 pr-4 py-2 text-[12px] border border-[#eaeaec] rounded-xl font-bold bg-white text-[#212c46] outline-none focus:border-[#b7a159]" 
                  />
                </div>

                {/* Filter Dept */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-[#7a8b95] uppercase">Dept:</span>
                  <select 
                    value={filterDept} 
                    onChange={e => setFilterDept(e.target.value)} 
                    className="bg-white border border-[#eaeaec] text-[#212c46] font-bold text-[11px] py-1.5 px-3 rounded-lg outline-none cursor-pointer hover:border-[#b7a159]"
                  >
                    <option value="All">ALL DEPARTMENTS</option>
                    {departments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Filter Status */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-[#7a8b95] uppercase">Status:</span>
                  <select 
                    value={filterStatus} 
                    onChange={e => setFilterStatus(e.target.value)} 
                    className="bg-white border border-[#eaeaec] text-[#212c46] font-bold text-[11px] py-1.5 px-3 rounded-lg outline-none cursor-pointer hover:border-[#b7a159]"
                  >
                    <option value="All">ALL STATUS</option>
                    <option value="Pending">PENDING</option>
                    <option value="Approved">APPROVED</option>
                    <option value="Rejected">REJECTED</option>
                  </select>
                </div>

                {(search || filterDept !== 'All' || filterStatus !== 'All') && (
                  <button 
                    onClick={() => { setSearch(''); setFilterDept('All'); setFilterStatus('All'); }}
                    className="text-[#932c2e] hover:bg-[#932c2e]/10 px-3 py-1.5 rounded-lg border border-[#932c2e]/30 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Icons.RotateCcw size={12} /> Clear Filter
                  </button>
                )}
              </div>

              {/* Action Buttons (Bulk CSV + Export + PDF Print) */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
                <label className="bg-[#f8f9fa] border border-[#eaeaec] text-[#212c46] hover:bg-[#212c46]/5 hover:border-[#212c46] px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider cursor-pointer shadow-sm flex items-center gap-1.5 transition-all">
                  <Icons.Upload size={14} className="text-sky-700" />
                  <span>Bulk Upload</span>
                  <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
                </label>
                <button onClick={handleExportCSV} className="bg-[#f8f9fa] border border-[#eaeaec] text-[#212c46] hover:bg-[#212c46]/5 hover:border-[#212c46] px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-all">
                  <Icons.FileSpreadsheet size={14} className="text-emerald-700" />
                  <span>Export CSV</span>
                </button>
                <button onClick={handlePrintPDF} className="bg-[#f8f9fa] border border-[#eaeaec] text-[#212c46] hover:bg-[#212c46]/5 hover:border-[#212c46] px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-all">
                  <Icons.Printer size={14} className="text-[#b7a159]" />
                  <span>Print PDF</span>
                </button>
                <button onClick={handleOpenAddModal} className="bg-[#212c46] text-white border border-[#212c46] hover:bg-[#414757] px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-md flex items-center gap-1.5 transition-all">
                  <Icons.Plus size={14} className="text-[#b7a159]" />
                  <span>New Request</span>
                </button>
              </div>
            </div>

            {/* Main Table View */}
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left font-sans border-collapse">
                <thead className="bg-[#212c46] text-white">
                  <tr className="border-b-2 border-[#b7a159]">
                    <th className="py-4 px-6 font-black uppercase tracking-widest text-[11px] whitespace-nowrap">Req ID</th>
                    <th className="py-4 px-6 font-black uppercase tracking-widest text-[11px] whitespace-nowrap">Employee Identity</th>
                    <th className="py-4 px-6 font-black uppercase tracking-widest text-[11px] whitespace-nowrap text-center">Date</th>
                    <th className="py-4 px-6 font-black uppercase tracking-widest text-[11px] whitespace-nowrap text-center">Planned Hrs</th>
                    <th className="py-4 px-6 font-black uppercase tracking-widest text-[11px] whitespace-nowrap text-center">Actual Hrs</th>
                    <th className="py-4 px-6 font-black uppercase tracking-widest text-[11px] whitespace-nowrap">OT Purpose Purpose</th>
                    <th className="py-4 px-6 font-black uppercase tracking-widest text-[11px] whitespace-nowrap text-center">Status Check</th>
                    <th className="py-4 px-6 font-black uppercase tracking-widest text-[11px] text-center whitespace-nowrap">Registry Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#eaeaec]">
                  {currentRequests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 font-bold uppercase text-[12px]">
                        <Icons.Inbox size={32} className="mx-auto block text-slate-300 mb-2" />
                        No requested Overtime entries match current filtered scoped criteria
                      </td>
                    </tr>
                  ) : (
                    currentRequests.map(req => {
                      const isOverLimit = req.actualHrs > settings.maxWeeklyHrs / 5; // daily proxy limit
                      return (
                        <tr key={req.id} className="hover:bg-[#f8f9fa] transition-colors group">
                          <td className="py-3 px-6 font-black text-[#212c46] text-[12px]">{req.reqId}</td>
                          <td className="py-3 px-6">
                            <div className="flex flex-col">
                              <span className="font-extrabold text-[#212c46] text-[12px] uppercase">{req.name}</span>
                              <span className="text-[10px] text-[#4d87a8] font-black uppercase tracking-wider">{req.empId} • {req.dept}</span>
                            </div>
                          </td>
                          <td className="py-3 px-6 text-center">
                            <span className="text-[11px] font-bold text-[#606a5f] uppercase">{req.date}</span>
                          </td>
                          <td className="py-3 px-6 text-center">
                            <span className="text-[12px] font-black text-[#212c46]">{req.plannedHrs.toFixed(1)} <span className="text-[10px] text-[#7a8b95]">Hrs</span></span>
                          </td>
                          <td className="py-3 px-6 text-center">
                            <span className={`text-[12px] font-black ${isOverLimit ? 'text-[#932c2e]' : 'text-slate-800'}`}>
                              {req.actualHrs.toFixed(1)} <span className="text-[10px] text-[#7a8b95]">Hrs</span>
                            </span>
                            {isOverLimit && (
                              <span className="block text-[8px] font-black text-[#932c2e] uppercase tracking-wider animate-pulse">Exceeded Daily Policy</span>
                            )}
                          </td>
                          <td className="py-3 px-6 max-w-sm">
                            <span className="text-[11px] font-medium text-slate-600 block line-clamp-1">{req.reason}</span>
                          </td>
                          <td className="py-3 px-6 text-center whitespace-nowrap">
                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border shadow-sm ${
                              req.status === 'Approved' ? 'bg-[#657f4d]15 border-[#657f4d]30 text-[#657f4d]' :
                              req.status === 'Rejected' ? 'bg-[#932c2e]15 border-[#932c2e]30 text-[#932c2e]' :
                              'bg-[#3f809e]15 border-[#3f809e]30 text-[#3f809e]'
                            }`}>
                              ● {req.status}
                            </span>
                          </td>
                          <td className="py-3 px-6">
                            <div className="flex items-center justify-center gap-2">
                              {req.status === 'Pending' && (
                                <>
                                  <button onClick={() => handleQuickStatus(req.id, 'Approved')} className="p-1 text-[#657f4d] hover:bg-[#657f4d]/15 rounded-lg border border-[#657f4d]/30 transition-colors" title="Approve">
                                    <Icons.CheckCircle size={14} />
                                  </button>
                                  <button onClick={() => handleQuickStatus(req.id, 'Rejected')} className="p-1 text-[#932c2e] hover:bg-[#932c2e]/15 rounded-lg border border-[#932c2e]/30 transition-colors" title="Reject">
                                    <Icons.XCircle size={14} />
                                  </button>
                                </>
                              )}
                              <button onClick={() => handleOpenEditModal(req)} className="p-1 text-[#3f809e] hover:bg-[#3f809e]/15 rounded-lg border border-[#3f809e]/30 transition-colors" title="Modify Edit">
                                  <Icons.Edit size={14} />
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

            {/* Pagination Standard footer */}
            <div className="px-6 py-4 bg-[#f8f9fa] border-t border-[#eaeaec] flex justify-between items-center text-[#7a8b95] text-[11px] font-black uppercase shrink-0">
              <span>Showing {filteredRequests.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredRequests.length)} of {filteredRequests.length} results</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-[#eaeaec] bg-white rounded-lg hover:border-[#b7a159] text-[#212c46] disabled:opacity-50"
                >
                  Prev
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: pagerCount }, (_, k) => k + 1).map(pNum => (
                    <button 
                      key={pNum} 
                      onClick={() => setCurrentPage(pNum)} 
                      className={`w-7 h-7 rounded-lg font-black border text-[11px] transition-all flex items-center justify-center ${pNum === currentPage ? 'bg-[#212c46] text-white border-[#212c46] shadow-sm' : 'bg-white border-[#eaeaec] text-[#7a8b95] hover:border-[#b7a159]'}`}
                    >
                      {pNum}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(pagerCount, prev + 1))} 
                  disabled={currentPage === pagerCount}
                  className="px-3 py-1 border border-[#eaeaec] bg-white rounded-lg hover:border-[#b7a159] text-[#212c46] disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: OVERTIME VARIANCE ANALYTICS --- */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fadeIn pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Bar Chart */}
              <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-[#eaeaec] shadow-lg flex flex-col justify-between">
                <div>
                  <h4 className="text-[13px] font-extrabold uppercase text-[#212c46] tracking-widest flex items-center gap-2 mb-1.5">
                    <Icons.BarChart size={18} className="text-[#b7a159]" /> DEPARTMENT COMMITTED OT VOLUME
                  </h4>
                  <p className="text-[10px] font-bold text-[#7a8b95] uppercase tracking-wider mb-6">Planned hours versus Actual registered clocked hours by area</p>
                </div>
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="department" stroke="#7a8b95" fontSize={11} fontWeight="bold" />
                      <YAxis stroke="#7a8b95" fontSize={11} fontWeight="bold" />
                      <Tooltip contentStyle={{ fontSize: '11px', fontWeight: 'bold', borderRadius: '12px', border: '1px solid #eaeaec' }} />
                      <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                      <Bar dataKey="Planned" fill="#3f809e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Actual" fill="#b58c4f" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Overtime_Difference" fill="#932c2e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right Budget Analysis Widget */}
              <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-[#eaeaec] shadow-lg flex flex-col">
                <h4 className="text-[13px] font-extrabold uppercase text-[#212c46] tracking-widest flex items-center gap-2 border-b border-[#eaeaec] pb-4 mb-4">
                  <Icons.PieChart size={18} className="text-[#a94228]"/> OT FINANCIAL METRICS
                </h4>
                <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                  {departments.map(dept => {
                    const matchedBudget = (settings as any)[`${dept.toLowerCase()}Budget`] || 10000;
                    const usedHrs = requests.filter(r => r.dept === dept && r.status === 'Approved').reduce((acc, curr) => acc + (Number(curr.actualHrs) || 0), 0);
                    // Approximate cost: 350 THB hourly rate average
                    const currentCost = Math.round(usedHrs * 350 * settings.standardOtRate);
                    const usagePct = Math.min(100, Math.round((currentCost / matchedBudget) * 100));

                    return (
                      <div key={dept} className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl hover:border-[#b7a159] transition-colors">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-extrabold text-[#212c46] text-[11px] tracking-wider uppercase">{dept} DEPARTMENT</span>
                          <span className="text-[10px] font-black text-rose-800 uppercase">{usagePct}% USED</span>
                        </div>
                        <div className="w-full bg-[#eaeaec] h-2 rounded-full overflow-hidden mb-2">
                          <div 
                            className="h-full rounded-full transition-all duration-1000"
                            style={{ 
                              width: `${usagePct}%`, 
                              backgroundColor: usagePct > 80 ? '#932c2e' : usagePct > 50 ? '#b58c4f' : '#657f4d' 
                            }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                          <span>Est Costs: <b>{currentCost.toLocaleString()} THB</b></span>
                          <span>Budget: <b>{matchedBudget.toLocaleString()} THB</b></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Department Breakdown table */}
            <div className="bg-white p-6 rounded-3xl border border-[#eaeaec] shadow-lg">
              <h4 className="text-[13px] font-extrabold uppercase text-[#212c46] tracking-widest flex items-center gap-2 mb-4">
                <Icons.Activity size={18} className="text-[#3f809e]"/> AREA VARIANCE SPECIFICATIONS
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs border-collapse">
                  <thead className="bg-[#212c46] text-white">
                    <tr className="border-b border-[#b7a159]">
                      <th className="p-3 font-bold uppercase tracking-wider text-[11px]">Department Area</th>
                      <th className="p-3 font-bold uppercase tracking-wider text-[11px] text-center">Requests Count</th>
                      <th className="p-3 font-bold uppercase tracking-wider text-[11px] text-center">Planned Hours</th>
                      <th className="p-3 font-bold uppercase tracking-wider text-[11px] text-center">Actual Hours</th>
                      <th className="p-3 font-bold uppercase tracking-wider text-[11px] text-center">Approved Hours</th>
                      <th className="p-3 font-bold uppercase tracking-wider text-[11px] text-center">Variance (Hrs)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eaeaec]">
                    {departments.map((dept, i) => {
                      const dReqs = requests.filter(r => r.dept === dept);
                      const plannedSum = dReqs.reduce((acc, curr) => acc + (Number(curr.plannedHrs) || 0), 0);
                      const actualSum = dReqs.reduce((acc, curr) => acc + (Number(curr.actualHrs) || 0), 0);
                      const apprSum = dReqs.filter(r => r.status === 'Approved').reduce((acc, curr) => acc + (Number(curr.actualHrs) || 0), 0);
                      const variance = (actualSum - plannedSum).toFixed(1);

                      return (
                        <tr key={dept} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-extrabold text-[#212c46] uppercase leading-none">{dept} Node</td>
                          <td className="p-3 text-center text-slate-600 font-bold">{dReqs.length}</td>
                          <td className="p-3 text-center text-[#212c46] font-bold">{plannedSum.toFixed(1)}</td>
                          <td className="p-3 text-center text-slate-800 font-bold">{actualSum.toFixed(1)}</td>
                          <td className="p-3 text-center text-[#657f4d] font-black">{apprSum.toFixed(1)}</td>
                          <td className="p-3 text-center font-black">
                            <span style={{ color: Number(variance) > 0 ? '#a94228' : '#657f4d' }}>
                              {Number(variance) > 0 ? `+${variance}` : variance} Hrs
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: SETTINGS POLICY (Custom Standardized as User Permissions) --- */}
        {settings && activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn pb-6">
            
            {/* Left Controls Card */}
            <div className="lg:col-span-4 bg-white/95 p-6 rounded-3xl shadow-lg border border-[#eaeaec] h-fit">
              <h3 className="text-[13px] font-black text-[#212c46] uppercase tracking-widest flex items-center gap-3 border-b-2 border-[#b7a159] pb-4 mb-5">
                <Icons.Sliders size={18} className="text-[#b7a159]" /> SYSTEM OT VARIABLES
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-wider mb-1">Standard Multiplier (Day OT)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={settings.standardOtRate} 
                    onChange={e => setSettings({ ...settings, standardOtRate: parseFloat(e.target.value) || 1.5 })}
                    className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl px-4 py-2 text-[12px] font-bold text-[#212c46] outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-wider mb-1">Holiday Multiplier (Night OT)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={settings.holidayOtRate} 
                    onChange={e => setSettings({ ...settings, holidayOtRate: parseFloat(e.target.value) || 3.0 })}
                    className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl px-4 py-2 text-[12px] font-bold text-[#212c46] outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-wider mb-1">Max Legal Hours / Person / Week</label>
                  <input 
                    type="number" 
                    value={settings.maxWeeklyHrs} 
                    onChange={e => setSettings({ ...settings, maxWeeklyHrs: parseInt(e.target.value) || 36 })}
                    className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl px-4 py-2 text-[12px] font-bold text-[#212c46] outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-wider mb-1">Auto-Approve Threshold Hours</label>
                  <input 
                    type="number" 
                    step="0.5"
                    value={settings.autoApproveThreshold} 
                    onChange={e => setSettings({ ...settings, autoApproveThreshold: parseFloat(e.target.value) || 4.0 })}
                    className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl px-4 py-2 text-[12px] font-bold text-[#212c46] outline-none" 
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input 
                    type="checkbox" 
                    checked={settings.enableBreaksRule} 
                    onChange={e => setSettings({ ...settings, enableBreaksRule: e.target.checked })}
                    className="w-4 h-4 accent-[#212c46] cursor-pointer" 
                    id="breaksRuleCheck" 
                  />
                  <label htmlFor="breaksRuleCheck" className="text-[11px] font-black text-[#212c46] uppercase tracking-widest cursor-pointer">Require 20min breaks prior to OT</label>
                </div>
              </div>
            </div>

            {/* Right Budget Allocations Node */}
            <div className="lg:col-span-8 bg-white p-6 rounded-3xl shadow-lg border border-[#eaeaec]">
              <div className="p-4 bg-[#f8f9fa] border border-[#eaeaec] rounded-2xl mb-6">
                <h4 className="text-[13px] font-black uppercase text-[#212c46] tracking-widest flex items-center gap-3"><Icons.PlusSquare size={18} className="text-[#b7a159]"/> REGISTRY CONFIGURATION RULES</h4>
              </div>

              <div className="space-y-4">
                <p className="text-[12px] text-slate-500 font-bold uppercase tracking-wider mb-4 leading-relaxed">Allocate monthly OT funding threshold by department nodes manually: (THB)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {departments.map(dept => {
                    const key = `${dept.toLowerCase()}Budget`;
                    const currentBud = (settings as any)[key] || 10000;
                    return (
                      <div key={dept} className="flex items-center justify-between border-b border-[#eaeaec] pb-3">
                        <span className="font-extrabold text-[#212c46] text-[11px] tracking-wider uppercase">{dept} Area Limit</span>
                        <div className="relative w-44">
                          <input 
                            type="number" 
                            step="1000"
                            value={currentBud} 
                            onChange={e => setSettings({ ...settings, [key]: parseInt(e.target.value) || 5000 })}
                            className="bg-slate-50 border border-[#eaeaec] rounded-lg pl-4 pr-12 py-1.5 w-full text-right font-black text-[11px] text-[#212c46]"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-[#7a8b95] uppercase">THB</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-6 border-t border-[#eaeaec] flex justify-end">
                  <button 
                    onClick={() => {
                      swalReact.fire({
                        icon: 'success',
                        title: 'บันทึกสำเร็จ',
                        text: 'บันทึกการตั้งค่าตัวแปรกฎหมายและเพดานงบประมาณแผนกเรียบร้อย',
                        confirmButtonColor: THEME.primary
                      });
                    }} 
                    className="bg-[#212c46] text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md hover:bg-[#414757] transition-all flex items-center gap-2"
                  >
                    <Icons.Save size={14} /> Update OT Configurations
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* --- ADD / EDIT DRAGGABLE MODAL (Standards as User Permissions) --- */}
      <DraggableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        width="max-w-[700px]"
        customHeader={
          <div className="bg-[#212c46] px-5 py-4 flex justify-between items-center shrink-0 border-b-2 border-[#b7a159]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/20 shadow-sm overflow-hidden">
                <Icons.Clock size={18} className="text-[#b7a159]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">{modalMode === 'add' ? 'ADD NEW OVERTIME' : 'EDIT OVERTIME ENTRY'}</h3>
                <p className="text-[10px] font-bold text-[#d7d7d7]/70 uppercase tracking-widest mt-1">Audit Record Control Node : {formReqId}</p>
              </div>
            </div>
            <button onClick={() => setIsModalOpen(false)} className="text-white/70 hover:text-red-500 transition-all bg-white/5 hover:bg-white/10 p-1.5 rounded-full">
              <Icons.X size={16} />
            </button>
          </div>
        }
      >
        <div className="p-6 space-y-4 bg-white/95 text-[#212c46]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-widest mb-1">Employee Name</label>
              <input 
                type="text" 
                value={formName} 
                onChange={e => setFormName(e.target.value.toUpperCase())}
                placeholder="e.g. SOMCHAI SALES" 
                className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl px-4 py-2 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#b7a159]" 
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-widest mb-1">Employee ID Code</label>
              <input 
                type="text" 
                value={formEmpId} 
                onChange={e => setFormEmpId(e.target.value.toUpperCase())}
                placeholder="e.g. E001" 
                className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl px-4 py-2 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#b7a159]" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-widest mb-1">Department</label>
              <select 
                value={formDept} 
                onChange={e => setFormDept(e.target.value)}
                className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl px-4 py-2 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#b7a159] cursor-pointer"
              >
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-widest mb-1">Service Date</label>
              <input 
                type="date" 
                value={formDate} 
                onChange={e => setFormDate(e.target.value)}
                className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl px-4 py-2 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#b7a159]" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-widest mb-1">Planned forecasted Hours</label>
              <input 
                type="number" 
                step="0.5"
                value={formPlannedHrs} 
                onChange={e => setFormPlannedHrs(parseFloat(e.target.value) || 0.0)}
                className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl px-4 py-2 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#b7a159]" 
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-widest mb-1">Actual Worked Clock Hours</label>
              <input 
                type="number" 
                step="0.5"
                value={formActualHrs} 
                onChange={e => setFormActualHrs(parseFloat(e.target.value) || 0.0)}
                className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl px-4 py-2 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#b7a159]" 
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-widest mb-1">OT Reason Details</label>
            <textarea 
              rows={3}
              value={formReason} 
              onChange={e => setFormReason(e.target.value)}
              placeholder="e.g. Cleared monthly shipments..."
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl px-4 py-2 text-[11px] font-medium text-[#212c46] outline-none focus:border-[#b7a159]" 
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-widest mb-1">Status Verification</label>
            <select 
              value={formStatus} 
              onChange={e => setFormStatus(e.target.value)}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl px-4 py-2 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#b7a159] cursor-pointer"
            >
              <option value="Pending">PENDING APPROVAL</option>
              <option value="Approved">APPROVED & COMMITTED</option>
              <option value="Rejected">REJECTED BY MANAGEMENT</option>
            </select>
          </div>

          <div className="pt-4 border-t border-[#eaeaec] flex justify-between items-center shrink-0">
            <div>
              {modalMode === 'edit' && (
                <button
                  type="button"
                  onClick={() => {
                    if (selectedReq) {
                      handleDeleteRequest(selectedReq.id, selectedReq.name);
                      setIsModalOpen(false);
                    }
                  }}
                  className="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 hover:text-rose-800 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Icons.Trash2 size={13} /> Delete Request
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 bg-white border border-[#eaeaec] text-[#414757] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#d7d7d7]/30 transition-all cursor-pointer">Cancel</button>
              <button type="button" onClick={handleSaveRequest} className="bg-[#212c46] text-white px-5 py-2 rounded-xl font-black text-[12px] uppercase tracking-widest shadow-md hover:bg-[#414757] transition-all flex items-center gap-1.5 cursor-pointer"><Icons.Save size={13}/> Save Entry</button>
            </div>
          </div>
        </div>
      </DraggableModal>
      {/* --- BULK IMPORT DATA PREVIEW MODAL (Standard as required by AGENTS.md) --- */}
      <DraggableModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        width="max-w-[850px]"
        customHeader={
          <div className="bg-[#212c46] px-5 py-4 flex justify-between items-center shrink-0 border-b-2 border-[#b7a159]">
            <div className="flex items-center gap-3">
              <Icons.Upload size={18} className="text-[#b7a159]" />
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">BULK OVERTIME CSV PREVIEW TABLE</h3>
                <p className="text-[10px] font-bold text-[#d7d7d7]/70 uppercase tracking-widest mt-1">Review items prior database write</p>
              </div>
            </div>
            <button onClick={() => setIsImportModalOpen(false)} className="text-white/70 hover:text-red-500 transition-all bg-white/5 hover:bg-white/10 p-1.5 rounded-full">
              <Icons.X size={16} />
            </button>
          </div>
        }
      >
        <div className="p-6 bg-[#f8f9fa] flex-1 flex flex-col overflow-hidden max-h-[500px]">
          {conflictedRows > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-0 flex items-center gap-2.5 shrink-0 text-amber-700 animate-fadeIn">
              <Icons.AlertTriangle size={16} className="shrink-0" />
              <p className="text-[11px] font-bold uppercase tracking-wider">
                พบข้อมูลซ้ำซ้อนทางความขัดแย้ง {conflictedRows} รายการ (พนักงานที่มีวันที่ขอทับซ้อนกับข้อมูลหลัก)
              </p>
            </div>
          )}

          <div className="flex-1 overflow-auto rounded-xl border border-[#eaeaec] bg-white min-h-0">
            <table className="w-full text-left font-sans text-[11px] border-collapse">
              <thead className="bg-[#212c46] text-white">
                <tr>
                  <th className="p-2.5 font-black uppercase">Seq</th>
                  <th className="p-2.5 font-black uppercase">Req ID</th>
                  <th className="p-2.5 font-black uppercase">Emp ID</th>
                  <th className="p-2.5 font-black uppercase">Name</th>
                  <th className="p-2.5 font-black uppercase">Dept</th>
                  <th className="p-2.5 font-black uppercase">Date</th>
                  <th className="p-2.5 font-black uppercase text-center">Planned Hrs</th>
                  <th className="p-2.5 font-black uppercase text-center">Actual Hrs</th>
                  <th className="p-2.5 font-black uppercase">Conflict Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaeaec]">
                {importedRowsData.map((row, index) => (
                  <tr key={index} className={`hover:bg-slate-50 ${row.isDuplicate ? 'bg-rose-50/50' : ''}`}>
                    <td className="p-2.5 font-bold text-slate-400">{row.rowNum}</td>
                    <td className="p-2.5 font-mono text-[#212c46] font-bold">{row.reqId}</td>
                    <td className="p-2.5 font-bold text-[#4d87a8]">{row.empId}</td>
                    <td className="p-2.5 font-extrabold uppercase">{row.name}</td>
                    <td className="p-2.5 uppercase font-medium">{row.dept}</td>
                    <td className="p-2.5">{row.date}</td>
                    <td className="p-2.5 text-center font-bold">{row.plannedHrs.toFixed(1)}</td>
                    <td className="p-2.5 text-center font-bold">{row.actualHrs.toFixed(1)}</td>
                    <td className="p-2.5">
                      {row.isDuplicate ? (
                        <span className="text-[#932c2e] font-black uppercase tracking-wider text-[9px] animate-pulse">● Duplicate Target Date</span>
                      ) : (
                        <span className="text-[#657f4d] font-black uppercase tracking-wider text-[9px]">● Safe Entry</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t border-[#eaeaec] flex justify-end gap-3 shrink-0 bg-white p-3 rounded-xl">
            <button onClick={() => setIsImportModalOpen(false)} className="px-5 py-2 bg-white border border-[#eaeaec] text-[#414757] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#d7d7d7]/30 transition-all">Cancel</button>
            <button onClick={handleConfirmCSVImport} className="bg-[#212c46] text-white px-5 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md hover:bg-[#414757] transition-all flex items-center gap-1.5"><Icons.CheckCircle size={13}/> Commit {importedRowsData.length} Entries</button>
          </div>
        </div>
      </DraggableModal>
    </div>
  );
}
