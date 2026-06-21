import { UserGuidePanel } from '../../components/shared/UserGuidePanel';
import KpiCard from '../../components/shared/KpiCard';
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';
import { 
  Calculator, Search, Play, CheckCircle2, AlertTriangle, X, Save, ChevronLeft, ChevronRight, 
  HelpCircle, Building2, Briefcase, Heart, TrendingUp, Users, DollarSign,
  Lock, Eye, Receipt, PiggyBank, History, Award, Coffee, Zap, Database,
  Download, Clock, ShieldCheck, RefreshCw, Calendar, CheckSquare, Banknote, FileText, Pencil
} from 'lucide-react';
import { DraggableModal } from '../../components/shared/DraggableModal';
import { dataExportService } from '../../services/dataExportService';
import { PrintPreviewModal } from '../../components/shared/PrintPreviewModal';

const THEME = {
  bgMain: 'transparent',
  primary: '#212c46', // Navy Blue for Payroll Ops
  primaryDark: '#11141e', 
  accent: '#b58c4f', 
  ai: '#3f809e', 
  aiHover: '#4d87a8',
  textMain: '#2f2926', 
  textMuted: '#414757', 
  textSubtle: '#606a5f', 
  cardBg: '#FFFFFF',
  palette: { 
    gold: '#b58c4f', rust: '#932c2e', copper: '#c5724e', eggplant: '#503447', maroon: '#851c24', brick: '#b22026', charcoal: '#414757', rose: '#ab7d82', coral: '#d96245', cream: '#f3f3f1', mustard: '#8e9141', salmon: '#d96245', 
    orangeDark: '#AC451b', sage: '#606a5f', umber: '#2f2926', redDark: '#932c2e', paleGreen: '#c4ccbe', bronze: '#8b2c3d', taupe: '#a39b7b', espresso: '#2e1e14', slateDark: '#606a5f', redPrimary: '#b22026', dustyRose: '#a57d76', brickRed: '#851c24', forestDark: '#1b2826', ochre: '#a1691e', sandGold: '#b7a159', tealDark: '#212c46', stone: '#676259', warmGrey: '#7a8b95', blackBrown: '#2f2926', mossGreen: '#657f4d', appleGreen: '#818d47', iceBlue: '#cdd4d6', olive: '#508660', cerulean: '#3f809e', navyBlue: '#212c46', steelBlue: '#4d87a8', midnight: '#2d2c4a', deepNight: '#11141e', mutedBlue: '#748b9e', cocoa: '#866760', teal: '#2b738a', plumDark: '#a54f6b', mustardDark: '#bab98b'
  }
};

// Simulated Master Data (To be pulled when calculating)
const MOCK_MASTER_DATA = [
  { 
    empId: 'EMP-24001', nameTh: 'สมชาย มุ่งมั่น', nameEn: 'Somchai Mungmun', dept: 'IT', jobTitle: 'Senior Developer', 
    image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
    payType: 'Monthly', baseSalary: 65000, workingDays: 30,
    fixedAllowances: 10500, // 5000+2000+1500+500
    fixedDeductions: 4250, // 3500+750
  },
  { 
    empId: 'EMP-22045', nameTh: 'วิภาดา แสงงาม', nameEn: 'Wipada Saengngam', dept: 'QA', jobTitle: 'QA Manager', 
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    payType: 'Monthly', baseSalary: 85000, workingDays: 30,
    fixedAllowances: 17000, // 10000+3500+1500+2000
    fixedDeductions: 6550, // 5800+750
  },
  { 
    empId: 'EMP-24050', nameTh: 'สมหมาย ใจดี', nameEn: 'Sommai Jaidee', dept: 'Production', jobTitle: 'Production Sup', 
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    payType: 'Daily', baseSalary: 550, workingDays: 26,
    fixedAllowances: 5000, // 1500+1000+1500+1000
    fixedDeductions: 2750, // 750+1500+500
  }
];

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
};

function PayrollDetailModal({ isOpen, onClose, record, onSave }: any) {
    const [formData, setFormData] = useState<any>(null);

    useEffect(() => {
        if (isOpen && record) {
            setFormData(JSON.parse(JSON.stringify(record)));
        }
    }, [isOpen, record]);

    if (!isOpen || !formData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numValue = value === '' ? 0 : Number(value);
        setFormData((prev: any) => ({ ...prev, [name]: numValue }));
    };

    const isReadOnly = formData.status === 'Approved' || formData.status === 'Paid';

    // Auto-calculate Totals dynamically
    const baseEqv = formData.payType === 'Daily' ? (formData.baseSalary * formData.actualDays) : formData.baseSalary;
    const totalGross = baseEqv + formData.fixedAllowances + formData.varOT + formData.varBonus;
    const totalDeductions = formData.fixedDeductions + formData.varLate + formData.varUnpaidLeave;
    const netPay = totalGross - totalDeductions;

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ 
            ...formData, 
            totalGross, 
            totalDeductions, 
            netPay 
        });
        onClose();
    };

    const NumberInput = ({ label, name, icon: Icon, hint = null, warning = false }: any) => (
        <div>
            <label className={`text-[10px] font-black uppercase tracking-widest flex items-center justify-between mb-1.5 ${warning ? 'text-[#932c2e]' : 'text-[#414757]'}`}>
                <span>{label}</span>
                {hint && <span className={`text-[8px] px-1.5 py-0.5 rounded ${warning ? 'bg-[#932c2e]/10 text-[#932c2e]' : 'text-[#3f809e] bg-[#3f809e]/10'}`}>{hint}</span>}
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon size={14} className={warning ? 'text-[#932c2e]/50' : 'text-[#7a8b95]'} />
                </div>
                <input 
                    type="number" name={name} value={formData[name] === 0 ? '' : formData[name]} onChange={handleChange} 
                    disabled={isReadOnly}
                    className={`w-full border rounded-xl pl-9 pr-4 py-2.5 text-[12px] font-black outline-none transition-all text-right font-mono
                        ${isReadOnly ? 'bg-[#eaeaec]/50 border-[#d1d1d5] text-[#7a8b95] cursor-not-allowed' : 
                          warning ? 'bg-[#fcf4f2] border-[#932c2e]/30 text-[#932c2e] focus:border-[#932c2e] focus:ring-1 focus:ring-[#932c2e]/20 shadow-sm' :
                          'bg-[#f3f3f1] border-[#eaeaec] text-[#2f2926] focus:border-[#212c46] focus:ring-1 focus:ring-[#212c46]/20 focus:bg-white shadow-sm'}`} 
                />
            </div>
        </div>
    );

    return (
        <DraggableModal
            isOpen={isOpen}
            onClose={onClose}
            width="max-w-[850px]"
            customHeader={
                <div className="bg-[#212c46] px-4 py-3 flex justify-between items-center shrink-0 border-b-2 border-[#b58c4f]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#3f809e]/20 text-[#3f809e] flex items-center justify-center border border-[#3f809e]/30 shadow-inner">
                            <Calculator size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">PAYROLL ADJUSTMENT</h3>
                            <p className="text-[10px] font-bold text-[#d7d7d7]/70 uppercase tracking-widest mt-1">Period: {formData.period}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-[#932c2e] transition-all bg-white/10 hover:bg-white/20 p-1.5 rounded-full"><Icons.X size={16} /></button>
                </div>
            }
        >
            <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-hidden bg-[#f8f9fa] font-sans">
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Profile Panel */}
                    <div className="w-full md:w-56 bg-white border-b md:border-b-0 md:border-r border-[#eaeaec] p-6 flex flex-col items-center text-center shrink-0">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border border-[#eaeaec] shadow-sm mb-3">
                            <img src={formData.image} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <h4 className="text-[12px] font-black text-[#2f2926] uppercase tracking-tight leading-tight">{formData.nameEn}</h4>
                        <span className="mt-1.5 text-[9px] font-black bg-[#eaeaec] text-[#606a5f] px-2.5 py-0.5 rounded-full uppercase border border-[#d1d1d5]">{formData.dept}</span>
                        
                        <div className="w-full mt-6 space-y-3.5 text-[10px] text-left border-t border-[#eaeaec] pt-4">
                            <div className="flex justify-between">
                                <span className="text-[#a3a092] tracking-widest uppercase font-black">Pay Type</span>
                                <span className="font-bold text-[#b58c4f] uppercase">{formData.payType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#a3a092] tracking-widest uppercase font-black">Status</span>
                                <span className={`font-bold uppercase ${formData.status === 'Draft' ? 'text-[#7a8b95]' : 'text-[#657f4d]'}`}>{formData.status}</span>
                            </div>
                        </div>
                    </div>

                    {/* Form Controls */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-white">
                        <div className="bg-[#3f809e]/10 p-3.5 rounded-xl border border-[#3f809e]/20 flex items-center gap-2.5">
                            <Database size={16} className="text-[#3f809e] shrink-0" />
                            <p className="text-[10.5px] font-bold text-[#414757]">
                                <strong className="text-[#212c46]">Note:</strong> ตัวแปรงวดปัจจุบันแก้ไขได้เฉพาะเมื่อบันทึกอยู่ในสถานะ Draft เท่านั้น
                            </p>
                        </div>

                        {/* Income Sector */}
                        <div className="bg-[#fcfbf9] p-4.5 rounded-2xl border border-[#eaeaec] shadow-sm">
                            <h4 className="text-[11px] font-black text-[#657f4d] uppercase tracking-widest mb-3.5 flex items-center gap-2 border-b border-[#eaeaec] pb-1.5">
                                <PiggyBank size={14}/> Earnings Breakdown
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {formData.payType === 'Daily' ? (
                                    <>
                                        <NumberInput label="Daily Rate" name="baseSalary" icon={DollarSign} hint="Master" />
                                        <NumberInput label="Working Days" name="actualDays" icon={Calendar} hint="Synced" />
                                    </>
                                ) : (
                                    <NumberInput label="Base Salary" name="baseSalary" icon={DollarSign} hint="Master" />
                                )}
                                <NumberInput label="Fixed Allowances" name="fixedAllowances" icon={Briefcase} hint="Contracts" />
                                <NumberInput label="Overtime (OT)" name="varOT" icon={Clock} hint="Timesheet" />
                                <NumberInput label="Special Bonus" name="varBonus" icon={Award} hint="Manual" />
                            </div>
                            <div className="mt-4 flex justify-between items-center border-t border-[#eaeaec] pt-2.5">
                                <span className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest">Gross Earning</span>
                                <span className="text-[14px] font-black font-mono text-[#657f4d]">{formatCurrency(totalGross)}</span>
                            </div>
                        </div>

                        {/* Deductions Sector */}
                        <div className="bg-[#fafafa] p-4.5 rounded-2xl border border-[#eaeaec] shadow-sm">
                            <h4 className="text-[11px] font-black text-[#932c2e] uppercase tracking-widest mb-3.5 flex items-center gap-2 border-b border-[#eaeaec] pb-1.5">
                                <TrendingUp size={14} className="rotate-180"/> Deductions Breakdown
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <NumberInput label="Fixed Deductions" name="fixedDeductions" icon={ShieldCheck} hint="Social/Tax" />
                                <div className="hidden sm:block"></div>
                                <NumberInput label="Late Penalty" name="varLate" icon={AlertTriangle} hint="Lateness" warning={true} />
                                <NumberInput label="Unpaid Leaves" name="varUnpaidLeave" icon={Calendar} hint="Leaves" warning={true} />
                            </div>
                            <div className="mt-4 flex justify-between items-center border-t border-[#eaeaec] pt-2.5">
                                <span className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest">Gross Deductions</span>
                                <span className="text-[14px] font-black font-mono text-[#932c2e]">{formatCurrency(totalDeductions)}</span>
                            </div>
                        </div>

                        {/* Final Net Net Pay */}
                        <div className="bg-[#212c46] p-4.5 rounded-2xl border border-[#11141e] flex justify-between items-center relative overflow-hidden text-white">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-[#7a8b95] uppercase tracking-widest">Calculated Net Payable</span>
                                <span className="text-[9px] text-[#4d87a8] font-bold mt-0.5">Final disburse payout amount</span>
                            </div>
                            <span className="text-[26px] font-black font-mono text-white tracking-tight">{formatCurrency(netPay)}</span>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-3 bg-[#f8f9fa] border-t border-[#eaeaec] flex justify-between items-center shrink-0">
                    <button type="button" onClick={onClose} className="px-5 py-2 bg-white border border-[#eaeaec] text-[#414757] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#eaeaec] transition-all">Cancel</button>
                    {!isReadOnly && (
                        <button type="submit" className="bg-[#212c46] text-white px-6 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md hover:bg-[#414757] transition-all flex items-center gap-2">
                            <Save size={14}/> Save Changes
                        </button>
                    )}
                </div>
            </form>
        </DraggableModal>
    );
}

function ToastNotification({ message, type = 'success', onClose }: any) {
    if (!message) return null;
    const isError = type === 'error';
    return createPortal(
        <div className={`fixed bottom-6 right-6 z-[1000] animate-fadeIn bg-white border-l-4 ${isError ? 'border-[#932c2e]' : 'border-[#657f4d]'} shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-5 py-3.5 rounded-xl flex items-center justify-between gap-4 min-w-[280px]`}>
            <div className="flex items-center gap-2.5">
                {isError ? <AlertTriangle size={16} className="text-[#932c2e]" /> : <CheckCircle2 size={16} className="text-[#657f4d]" />}
                <span className="text-[11px] font-black text-[#2f2926] uppercase tracking-widest">{message}</span>
            </div>
            <button onClick={onClose} className="text-[#7a8b95] hover:text-[#932c2e] transition-colors"><Icons.X size={14}/></button>
        </div>,
        document.body
    );
}

export default function PayrollCalculation() {
  const [activeTab, setActiveTab] = useState('registry'); // Fits the user permissions dual-tab standard
  const [records, setRecords] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [payrollPeriod, setPayrollPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [payCycle, setPayCycle] = useState('Monthly'); // 'Monthly', 'Daily_H1', 'Daily_H2'
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [modalState, setModalState] = useState<any>({ isOpen: false, record: null });
  const [toast, setToast] = useState<any>(null);

  // Multi-select for Batch Print & Export
  const [selectedRecordIds, setSelectedRecordIds] = useState<number[]>([]);
  const [isBatchPrintOpen, setIsBatchPrintOpen] = useState(false);
  const [isBatchLedgerOpen, setIsBatchLedgerOpen] = useState(false);

  const currentPeriodLabel = `${payrollPeriod}-${payCycle}`;

  // Reset selection on filter changes
  useEffect(() => {
    setSelectedRecordIds([]);
  }, [payrollPeriod, payCycle, filterStatus]);

  const handleExportCSV = async () => {
    const selectedRecords = records.filter(r => selectedRecordIds.includes(r.id));
    if (selectedRecords.length === 0) {
      setToast({ msg: 'กรุณาเลือกรายการพนักงานอย่างน้อย 1 แถวเพื่อดาวน์โหลด CSV', type: 'error' });
      return;
    }
    const mapped = selectedRecords.map(r => ({
      ID: r.id,
      Employee_ID: r.empId,
      Name_TH: r.nameTh,
      Name_EN: r.nameEn,
      Department: r.dept,
      Job_Title: r.jobTitle,
      Pay_Type: r.payType,
      Worked_Days: r.actualDays,
      Base_Salary_Equivalent: r.baseSalary,
      Allowances: r.fixedAllowances + r.varOT + r.varBonus,
      Deductions: r.fixedDeductions + r.varLate + r.varUnpaidLeave,
      Total_Gross: r.totalGross,
      Total_Deductions: r.totalDeductions,
      Net_Payable_THB: r.netPay,
      Status: r.status,
      Period: r.period
    }));
    
    dataExportService.exportToCSV(mapped, `payroll_export_${currentPeriodLabel}`);
    await dataExportService.logExport('Payroll', 'CSV', mapped.length);
    setToast({ msg: `ดาวน์โหลดพอยต์ลิสต์กึ่งสำเร็จรูป CSV เรียบร้อย (รวม ${mapped.length} นาย บันทึก Audit Firestore แล้ว)`, type: 'success' });
  };

  const handleExportPDF = async () => {
    const selectedRecords = records.filter(r => selectedRecordIds.includes(r.id));
    if (selectedRecords.length === 0) {
      setToast({ msg: 'กรุณาเลือกรายการพนักงานอย่างน้อย 1 แถวเพื่อจำลองพิมพ์ PDF', type: 'error' });
      return;
    }
    await dataExportService.logExport('Payroll', 'PDF', selectedRecords.length);
    setIsBatchLedgerOpen(true);
  };

  // Filter records
  const filteredRecords = useMemo(() => {
      return records.filter(r => {
          const matchSearch = r.nameTh.toLowerCase().includes(search.toLowerCase()) || 
                              r.nameEn.toLowerCase().includes(search.toLowerCase()) ||
                              r.empId.toLowerCase().includes(search.toLowerCase());
          const matchStatus = filterStatus === 'All' || r.status === filterStatus;
          return matchSearch && matchStatus && r.periodId === currentPeriodLabel;
      });
  }, [records, search, filterStatus, currentPeriodLabel]);

  const currentData = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;

  // KPIs
  const totalInPeriod = filteredRecords.length;
  const draftCount = filteredRecords.filter(r => r.status === 'Draft').length;
  const totalNetPay = filteredRecords.reduce((sum, r) => sum + r.netPay, 0);

  // Sync compute simulator
  const runPayrollEngine = () => {
      setIsProcessing(true);
      setTimeout(() => {
          const exists = records.some(r => r.periodId === currentPeriodLabel);
          if (exists) {
              setToast({ msg: `ระบบประมวลผลสำหรับงวดตัวเลือกนี้เสร็จสิ้นแล้ว`, type: 'error' });
              setIsProcessing(false);
              return;
          }

          // Filter template list
          const targetEmployees = MOCK_MASTER_DATA.filter(master => {
              if (payCycle === 'Monthly') return master.payType === 'Monthly';
              return master.payType === 'Daily';
          });

          if (targetEmployees.length === 0) {
              setToast({ msg: `ไม่พบประวัติพนักงานรอบระบบดังกล่าว`, type: 'error' });
              setIsProcessing(false);
              return;
          }

          const periodName = payCycle === 'Monthly' ? 'รายเดือน' : (payCycle === 'Daily_H1' ? 'รายวัน (งวด 1-15)' : 'รายวัน (งวด 16-สิ้นเดือน)');

          const generatedRecords = targetEmployees.map((master, index) => {
              const varOT = Math.floor(Math.random() * 4) * 450; 
              const varLate = Math.floor(Math.random() * 2) * 120; 
              const varUnpaidLeave = 0;
              const varBonus = 0;
              
              let maxDays = master.workingDays;
              if (master.payType === 'Daily') {
                  maxDays = 15; 
              }

              const actualDays = master.payType === 'Daily' ? maxDays - Math.floor(Math.random() * 2) : master.workingDays;
              const baseEqv = master.payType === 'Daily' ? (master.baseSalary * actualDays) : master.baseSalary;
              const allowanceFactor = master.payType === 'Daily' ? 0.5 : 1; 

              const totalGross = baseEqv + (master.fixedAllowances * allowanceFactor) + varOT + varBonus;
              const totalDeductions = (master.fixedDeductions * allowanceFactor) + varLate + varUnpaidLeave;
              const netPay = totalGross - totalDeductions;

              return {
                  ...master,
                  id: Date.now() + index,
                  periodId: currentPeriodLabel,
                  period: `${payrollPeriod} [${periodName}]`,
                  status: 'Draft',
                  actualDays,
                  varOT, varLate, varUnpaidLeave, varBonus,
                  totalGross, totalDeductions, netPay
              };
          });

          setRecords(prev => [...generatedRecords, ...prev]);
          setToast({ msg: `ประมวลผลสำเร็จ ${generatedRecords.length} รายการ`, type: 'success' });
          setIsProcessing(false);
      }, 1200);
  };

  const handleApproveAll = () => {
      const draftIds = filteredRecords.filter(r => r.status === 'Draft').map(r => r.id);
      if (draftIds.length === 0) {
          setToast({ msg: 'คงไม่มีรายการที่จะอนุมัติเพิ่ม', type: 'error' });
          return;
      }
      setRecords(prev => prev.map(r => draftIds.includes(r.id) ? { ...r, status: 'Approved' } : r));
      setToast({ msg: `อนุมัติปิดแฟ้มรอบเงินเดือน ${draftIds.length} รายการสำเร็จ`, type: 'success' });
  };

  const handleSaveRecord = (updatedData: any) => {
      setRecords(prev => prev.map(r => r.id === updatedData.id ? updatedData : r));
      setToast({ msg: 'ปรับปรุงชาร์จยอดรายได้พิเศษสำเร็จ', type: 'success' });
  };

  const generatePayslips = async () => {
    const approvedCount = filteredRecords.filter(r => r.status === 'Approved').length;
    if (approvedCount === 0) {
      setToast({ msg: 'กรุณากดอนุมัติเพื่อจัดส่งก่อนออกสลิป', type: 'error' });
      return;
    }
    const approvedIds = filteredRecords.filter(r => r.status === 'Approved').map(r => r.id);
    setSelectedRecordIds(approvedIds);
    await dataExportService.logExport('Payroll', 'PDF', approvedIds.length);
    setIsBatchPrintOpen(true);
    setToast({ msg: `กำลังประมวลสลิปพนักงาน ${approvedCount} รายการ...`, type: 'success' });
  };

  return (
      <div className="flex flex-1 w-full flex-col animate-fadeIn bg-transparent space-y-4 pb-6 min-h-0">
          {/* Floating Guide Tab */}
          {typeof document !== 'undefined' && createPortal(
            <button onClick={() => setIsGuideOpen(true)} className="fixed right-0 bg-[#f8f9fa] border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#3f809e] hover:text-white hover:border-[#3f809e] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group cursor-pointer" style={{ top: '80px' }}>
                <Icons.HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#7a8b95] group-hover:text-white" />
                <span className="font-black tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[11px]">USER GUIDE</span>
            </button>,
            document.body
          )}
          <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
          <PayrollDetailModal isOpen={modalState.isOpen} onClose={() => setModalState({isOpen: false, record: null})} record={modalState.record} onSave={handleSaveRecord} />
          <ToastNotification message={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
          {/* Batch Printed Payslips Preview Drawer Modal */}
          <PrintPreviewModal
            isOpen={isBatchPrintOpen}
            onClose={() => setIsBatchPrintOpen(false)}
            title="Batch Print Payslips - T All Intelligence"
          >
            <div className="space-y-12">
              {records.filter(r => selectedRecordIds.includes(r.id)).map((record, idx, arr) => {
                const isLast = idx === arr.length - 1;
                const totalEarnings = record.payType === 'Daily' ? (record.baseSalary * record.actualDays) + record.fixedAllowances + record.varOT + record.varBonus : record.baseSalary + record.fixedAllowances + record.varOT + record.varBonus;
                const totalDeductions = record.fixedDeductions + record.varLate + record.varUnpaidLeave;
                const netSalary = totalEarnings - totalDeductions;
                
                return (
                  <div 
                    key={record.id} 
                    className="bg-white p-8 border border-slate-200 rounded-xl relative text-left" 
                    style={{ 
                      pageBreakAfter: isLast ? 'auto' : 'always', 
                      breakAfter: isLast ? 'auto' : 'page',
                      minHeight: '210mm'
                    }}
                  >
                    {/* Standard Joint Thai/En Corporate Corporate Header */}
                    <div className="flex justify-between items-start border-b-[2px] border-slate-900 pb-4 mb-4">
                      <div className="text-left font-sans">
                        <h2 className="text-sm font-black text-[#212c46] uppercase leading-tight">T All Intelligence Co., Ltd.</h2>
                        <p className="text-[10px] text-slate-500 font-bold">บริษัท ที ออลล์ อินเทลลิเจนซ์ จำกัด</p>
                        <p className="text-[9px] text-[#606a5f] mt-1 font-mono">
                          สำนักงานใหญ่ : 46 หมู่ที่ 5 ตำบลคลองสี่ อำเภอคลองหลวง จังหวัดปทุมธานี 12120<br />
                          Head Office : 46 Moo 5, Klong 4, Klong Luang, Pathumthani Thailand 12120
                        </p>
                        <span className="text-[8px] text-[#606a5f] font-mono leading-none">TAX ID : 0-1055-57149-33-2</span>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-xs font-black text-[#b58c4f] block font-sans">PAY SLIP / ใบจ่ายเงินเดือน</span>
                        <span className="text-[8px] font-black text-[#212c46] uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded mt-1 font-mono">{record.period}</span>
                      </div>
                    </div>
                    
                    {/* Employee Info Grid */}
                    <div className="grid grid-cols-2 gap-4 text-[10px] bg-slate-50 p-3 rounded-lg border border-slate-150 mb-4 font-sans">
                      <div className="space-y-1">
                        <p><span className="text-slate-400 font-bold uppercase">Employee ID / รหัสพนักงาน:</span> <span className="font-bold text-slate-800">{record.empId}</span></p>
                        <p><span className="text-slate-400 font-bold uppercase">Name / ชื่อ:</span> <span className="font-bold text-slate-800">{record.nameEn} ({record.nameTh})</span></p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p><span className="text-slate-400 font-bold uppercase">Department / ฝ่าย:</span> <span className="font-bold text-slate-800">{record.dept}</span></p>
                        <p><span className="text-slate-400 font-bold uppercase">Job Title / ตำแหน่ง:</span> <span className="font-bold text-slate-800">{record.jobTitle}</span></p>
                      </div>
                    </div>
                    
                    {/* Calculations Ledger Columns */}
                    <div className="grid grid-cols-2 gap-4 text-[10px] mb-4 font-sans">
                      <div className="border border-slate-200 rounded-lg p-3">
                        <h4 className="font-black text-slate-700 border-b pb-1 mb-2">EARNINGS / รายรับ</h4>
                        <div className="space-y-1.5 font-mono">
                          <div className="flex justify-between">
                            <span>Base Salary ({record.payType === 'Daily' ? `${record.actualDays} days` : 'Monthly'})</span>
                            <span className="font-bold">{(record.payType === 'Daily' ? record.baseSalary * record.actualDays : record.baseSalary).toLocaleString()} THB</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fixed Allowances</span>
                            <span className="font-bold">{record.fixedAllowances.toLocaleString()} THB</span>
                          </div>
                          {record.varOT > 0 && (
                            <div className="flex justify-between text-teal-700">
                              <span>Overtime Pay (OT)</span>
                              <span className="font-bold">+{record.varOT.toLocaleString()} THB</span>
                            </div>
                          )}
                          {record.varBonus > 0 && (
                            <div className="flex justify-between text-teal-700">
                              <span>Performance Bonus</span>
                              <span className="font-bold">+{record.varBonus.toLocaleString()} THB</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="border border-slate-200 rounded-lg p-3">
                        <h4 className="font-black text-slate-700 border-b pb-1 mb-2">DEDUCTIONS / รายจ่าย</h4>
                        <div className="space-y-1.5 font-mono">
                          <div className="flex justify-between">
                            <span>Fixed Deductions</span>
                            <span className="font-bold">{record.fixedDeductions.toLocaleString()} THB</span>
                          </div>
                          {record.varLate > 0 && (
                            <div className="flex justify-between text-rose-700">
                              <span>Late Deductions & Penalty</span>
                              <span className="font-bold">-{record.varLate.toLocaleString()} THB</span>
                            </div>
                          )}
                          {record.varUnpaidLeave > 0 && (
                            <div className="flex justify-between text-rose-700">
                              <span>Unpaid Leave Deductions</span>
                              <span className="font-bold">-{record.varUnpaidLeave.toLocaleString()} THB</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Net Salary Section */}
                    <div className="bg-[#212c46] text-white p-4 rounded-xl flex justify-between items-center mb-6 font-sans">
                      <div>
                        <span className="text-[8px] text-slate-300 font-bold uppercase tracking-wider block">NET PAYABLE / รายรับสุทธิ</span>
                        <span className="text-[9px] text-[#b58c4f] font-bold">โอนเงินเข้าบัญชีธนาคารพนักงาน</span>
                      </div>
                      <span className="text-[18px] font-black font-mono text-[#b58c4f]">{netSalary.toLocaleString()} THB</span>
                    </div>
                    
                    {/* Signatures */}
                    <div className="grid grid-cols-2 gap-8 text-[9px] text-slate-400 pt-8 mt-4 border-t border-dashed font-sans">
                      <div className="text-center">
                        <div className="h-8 border-b border-slate-200"></div>
                        <p className="mt-1 font-bold">Authorized signature / ผู้จ่ายเงิน</p>
                      </div>
                      <div className="text-center">
                        <div className="h-8 border-b border-slate-200"></div>
                        <p className="mt-1 font-bold">Employee signature / ผู้รับเงิน</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </PrintPreviewModal>
          {/* Batch Roll Ledger Report Drawer Modal */}
          <PrintPreviewModal
            isOpen={isBatchLedgerOpen}
            onClose={() => setIsBatchLedgerOpen(false)}
            title="Consolidated Payroll Ledger Report"
          >
            <div className="bg-white p-8 border border-slate-200 rounded-xl relative text-left" style={{ minHeight: '297mm' }}>
              {/* Dual company corporate header */}
              <div className="flex justify-between items-start border-b-[2px] border-slate-900 pb-5 mb-5">
                <div className="text-left font-sans">
                  <h2 className="text-sm font-black text-[#212c46] uppercase leading-tight">T All Intelligence Co., Ltd.</h2>
                  <p className="text-[10px] text-slate-500 font-bold">บริษัท ที ออลล์ อินเทลลิเจนซ์ จำกัด</p>
                  <p className="text-[9px] text-[#606a5f] mt-1 font-mono">
                    สำนักงานใหญ่ : 46 หมู่ที่ 5 ตำบลคลองสี่ อำเภอคลองหลวง จังหวัดปทุมธานี 12120<br />
                    Head Office : 46 Moo 5, Klong 4, Klong Luang, Pathumthani Thailand 12120
                  </p>
                  <span className="text-[8px] text-[#606a5f] font-mono block mt-1">TAX ID : 0-1055-57149-33-2</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-[#b58c4f] block font-sans uppercase tracking-wider">Payroll Ledger Register</span>
                  <span className="text-[9px] font-bold text-[#212c46] uppercase bg-slate-100 px-2 py-0.5 rounded inline-block mt-1 font-mono">{currentPeriodLabel}</span>
                </div>
              </div>

              <h3 className="text-xs font-black text-[#212c46] tracking-wide mb-4 text-center font-sans uppercase">CONSOLIDATED PAYROLL SUMMARY REPORT / รายงานสรุปยอดรวมบัญชีการสั่งจ่ายเงินเดือน</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans border-collapse text-[10px] print-layout-table">
                  <thead>
                    <tr className="bg-[#212c46] text-white border-b border-[#b58c4f]">
                      <th className="py-2.5 px-3 font-bold">EMP ID</th>
                      <th className="py-2.5 px-3 font-bold">FULL NAME</th>
                      <th className="py-2.5 px-3 font-bold text-right font-mono">BASE SALARY</th>
                      <th className="py-2.5 px-3 font-bold text-right font-mono">ALLOWANCES</th>
                      <th className="py-2.5 px-3 font-bold text-right font-mono">DEDUCTIONS</th>
                      <th className="py-2.5 px-3 font-bold text-right font-mono">NET PAYABLE</th>
                      <th className="py-2.5 px-3 font-bold text-center">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {records.filter(r => selectedRecordIds.includes(r.id)).map((record) => {
                      const totalEarns = record.payType === 'Daily' ? (record.baseSalary * record.actualDays) + record.fixedAllowances + record.varOT + record.varBonus : record.baseSalary + record.fixedAllowances + record.varOT + record.varBonus;
                      const totalDeducts = record.fixedDeductions + record.varLate + record.varUnpaidLeave;
                      const net = totalEarns - totalDeducts;
                      return (
                        <tr key={record.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-bold text-slate-800">{record.empId}</td>
                          <td className="py-2 px-3">{record.nameEn} ({record.nameTh})</td>
                          <td className="py-2 px-3 text-right font-mono">{(record.payType === 'Daily' ? record.baseSalary * record.actualDays : record.baseSalary).toLocaleString()} THB</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-800">{(record.fixedAllowances + record.varOT + record.varBonus).toLocaleString()} THB</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-rose-800">{(record.fixedDeductions + record.varLate + record.varUnpaidLeave).toLocaleString()} THB</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">{net.toLocaleString()} THB</td>
                          <td className="py-2 px-3 text-center">
                            <span className="bg-slate-100 text-slate-700 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">{record.status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold border-t-2 border-slate-950 text-[11px]">
                      <td colSpan={2} className="py-3 px-3 text-[#212c46] font-extrabold uppercase">TOTAL DISBURSALS / ยอดรวมสุทธิ</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {records.filter(r => selectedRecordIds.includes(r.id))
                          .reduce((sum, r) => sum + (r.payType === 'Daily' ? r.baseSalary * r.actualDays : r.baseSalary), 0).toLocaleString()} THB
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-800">
                        {records.filter(r => selectedRecordIds.includes(r.id))
                          .reduce((sum, r) => sum + (r.fixedAllowances + r.varOT + r.varBonus), 0).toLocaleString()} THB
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-rose-850">
                        {records.filter(r => selectedRecordIds.includes(r.id))
                          .reduce((sum, r) => sum + (r.fixedDeductions + r.varLate + r.varUnpaidLeave), 0).toLocaleString()} THB
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-[#b58c4f] font-black underline decoration-double">
                        {records.filter(r => selectedRecordIds.includes(r.id))
                          .reduce((sum, r) => {
                            const totalEarns = r.payType === 'Daily' ? (r.baseSalary * r.actualDays) + r.fixedAllowances + r.varOT + r.varBonus : r.baseSalary + r.fixedAllowances + r.varOT + r.varBonus;
                            const totalDeducts = r.fixedDeductions + r.varLate + r.varUnpaidLeave;
                            return sum + (totalEarns - totalDeducts);
                          }, 0).toLocaleString()} THB
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Sign-off Segment */}
              <div className="grid grid-cols-2 gap-12 text-[10px] text-slate-500 pt-16 mt-8 border-t border-dashed font-sans">
                <div className="text-center">
                  <div className="h-10 border-b border-slate-400 w-2/3 mx-auto"></div>
                  <p className="mt-2 font-bold uppercase">Prepared By / ผู้จัดทำเอกสาร</p>
                  <span className="text-[9px]">Human Resource Department</span>
                </div>
                <div className="text-center">
                  <div className="h-10 border-b border-slate-400 w-2/3 mx-auto"></div>
                  <p className="mt-2 font-bold uppercase">Approved By / ผู้อนุมัติสั่งจ่าย</p>
                  <span className="text-[9px]">Chief Financial Officer / Managing Director</span>
                </div>
              </div>
            </div>
          </PrintPreviewModal>
          {/* PAGE HEADER SECTION (Transparent, styled like UserPermissions) */}
          <div className="h-14 px-8 flex flex-row items-center justify-between gap-4 z-20 shrink-0">
              <div className="flex items-center gap-5">
                  <div className="relative flex items-center justify-center group cursor-default shrink-0">
                      <div className="absolute inset-0 bg-[#3f809e] blur-[15px] opacity-20 rounded-full group-hover:opacity-60 transition-all duration-700"></div>
                      <div className="relative z-10 p-1.5 border border-[#3f809e]/40 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm">
                          <Calculator size={28} strokeWidth={2.5} className="text-[#3f809e]" />
                      </div>
                  </div>
                  <div>
                      <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none" style={{ fontSize: '24px' }}>
                          PAYROLL <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3f809e] to-[#b58c4f]">CALCULATION</span> HUB
                      </h3>
                      <p className="text-[11px] font-bold text-[#606a5f] uppercase tracking-[0.2em] mt-0.5 opacity-80 leading-none">
                          WAGE CALCULATION ENGINE & MONTHLY DISBURSAL ADJUSTMENTS
                      </p>
                  </div>
              </div>

              <div className="flex items-center gap-4">
                  <div className="relative flex items-center bg-white/55 backdrop-blur-sm border border-[#eaeaec] p-1.5 rounded-xl shadow-sm">
                      <Calendar size={14} className="text-[#b58c4f] mr-2" />
                      <span className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest mr-2">Period:</span>
                      <input 
                          type="month" 
                          value={payrollPeriod} 
                          onChange={(e) => setPayrollPeriod(e.target.value)} 
                          className="bg-transparent font-black font-mono text-[#2f2926] outline-none cursor-pointer text-[11px] mr-3"
                      />
                      <div className="w-[1px] h-4 bg-[#eaeaec] mx-2"></div>
                      <select 
                          value={payCycle} 
                          onChange={(e) => setPayCycle(e.target.value)}
                          className="bg-transparent font-black text-[#3f809e] outline-none cursor-pointer text-[10.5px] uppercase tracking-widest"
                      >
                          <option value="Monthly">Monthly Cycle</option>
                          <option value="Daily_H1">Daily Cycle H1 (1-15)</option>
                          <option value="Daily_H2">Daily Cycle H2 (16-31)</option>
                      </select>
                  </div>
              </div>
          </div>
          <div className="px-4 sm:px-8 w-full mt-[2px]">
            <div className="w-full">
                
                {/* KPI STATS (Lean & Beautiful, matching standard) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3 shrink-0">
                    <KpiCard
                        label="ACTIVE DISBURSALS"
                        value={totalInPeriod}
                        icon={Users}
                        color={THEME.palette.tealDark}
                        description="Managed Accounts" />
                    <KpiCard
                        label="DRAFTS PENDING"
                        value={draftCount}
                        icon={AlertTriangle}
                        color={draftCount > 0 ? THEME.palette.coral : THEME.palette.olive}
                        description="Awaiting Verification" />
                    <KpiCard
                        label="TOTAL GROSS EXPENSE"
                        value={formatCurrency(totalNetPay)}
                        icon={Banknote}
                        color={THEME.palette.olive}
                        description="Payout Projection" />
                    <KpiCard
                        label="ENGINE MECHANICAL"
                        value={isProcessing ? "PROCESSING..." : "VERIFIED"}
                        icon={isProcessing ? RefreshCw : ShieldCheck}
                        color={isProcessing ? THEME.palette.gold : THEME.palette.teal}
                        description="System Integrated" />
                </div>

                {/* MAIN DATA TABLE CONTAINER */}
                <div className="bg-white rounded-3xl shadow-lg border border-[#eaeaec] overflow-hidden flex flex-col animate-fadeIn  flex-1 min-h-0">
                    
                    {/* TOOLBAR */}
                    <div className="px-8 py-4 border-b border-[#eaeaec] bg-[#f8f9fa] flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-80">
                                <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7a8b95]" />
                                <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search personnel..." className="w-full pl-12 pr-6 py-2.5 text-[12px] border border-[#eaeaec] rounded-full font-bold outline-none focus:border-[#b58c4f] bg-white shadow-sm text-[#212c46]" />
                            </div>
                            <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="bg-white border border-[#eaeaec] rounded-full px-5 py-2.5 text-[11px] font-black uppercase tracking-widest outline-none focus:border-[#212c46] text-[#414757] shadow-sm cursor-pointer w-40">
                                <option value="All">All Status</option>
                                <option value="Draft">Draft Only</option>
                                <option value="Approved">Approved</option>
                                <option value="Paid">Paid</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                            {totalInPeriod === 0 ? (
                                <button onClick={runPayrollEngine} disabled={isProcessing} className="bg-[#212c46] text-white px-6 py-2.5 rounded-full font-black text-[12px] uppercase tracking-widest shadow-md hover:bg-[#3f809e] transition-all flex items-center justify-center gap-2 border border-[#212c46] cursor-pointer disabled:opacity-75">
                                    <Zap size={14} className={isProcessing ? "animate-spin" : ""} /> 
                                    {isProcessing ? 'CALCULATING ENGINE...' : 'SYNC & COMPUTE'}
                                </button>
                            ) : (
                                <>
                                    <button onClick={handleApproveAll} className="bg-white border border-[#eaeaec] text-[#606a5f] hover:bg-[#f8f9fa] hover:border-[#b58c4f] px-5 py-2.5 rounded-full font-black text-[11px] uppercase tracking-widest shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer">
                                        <CheckSquare size={14} /> Approve All
                                    </button>
                                    <button onClick={generatePayslips} className="bg-[#212c46] text-white hover:bg-[#3f809e] px-6 py-2.5 rounded-full font-black text-[12px] uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 border border-[#212c46] cursor-pointer">
                                        <FileText size={14} /> Print Payslips
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Batch Action Sub-bar */}
                    {selectedRecordIds.length > 0 && (
                        <div className="px-8 py-3 bg-amber-50/50 border-b border-[#eaeaec] flex flex-col sm:flex-row items-center justify-between gap-3 font-sans animate-fadeIn pb-6">
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-black text-[#b58c4f] uppercase tracking-wider">
                                    Selection: {selectedRecordIds.length} records chosen / เลือกอยู่ {selectedRecordIds.length} รายการ
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsBatchPrintOpen(true)}
                                    className="bg-[#b58c4f] hover:bg-[#212c46] text-white px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                                >
                                    <Icons.Printer size={12} /> BATCH PAYSLIPS
                                </button>
                                <button
                                    onClick={handleExportPDF}
                                    className="bg-[#3f809e] hover:bg-[#212c46] text-white px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                                >
                                    <Icons.Eye size={12} /> LEDGER REPORT
                                </button>
                                <button
                                    onClick={handleExportCSV}
                                    className="bg-white border border-[#cdd0db] text-[#212c46] hover:bg-slate-50 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                                >
                                    <Icons.Download size={12} /> EXPORT CSV
                                </button>
                            </div>
                        </div>
                    )}

                    {/* TABLE GRID */}
                    <div className="overflow-x-auto custom-scrollbar flex-1 min-h-0">
                        <table className="w-full text-left font-sans border-collapse min-w-[1000px]">
                            <thead className="bg-[#222b38] text-white">
                                <tr className="border-b-2 border-[#709654]">
                                    <th className="py-4 px-4 w-12 text-center">
                                        <input 
                                            type="checkbox"
                                            className="rounded border-slate-350 bg-white text-[#b58c4f] focus:ring-[#b58c4f] cursor-pointer"
                                            checked={currentData.length > 0 && currentData.every(r => selectedRecordIds.includes(r.id))}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedRecordIds(prev => Array.from(new Set([...prev, ...currentData.map(r => r.id)])));
                                                } else {
                                                    setSelectedRecordIds(prev => prev.filter(id => !currentData.some(r => r.id === id)));
                                                }
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </th>
                                    <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">Personnel Identity</th>
                                    <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">Salary / Base Eqv.</th>
                                    <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-right">Fixed Contract Items</th>
                                    <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-right">Variable Allowances</th>
                                    <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-right">Net Payable</th>
                                    <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Status</th>
                                    <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-[#eaeaec]">
                                {currentData.map((item) => {
                                    const baseEqv = item.payType === 'Daily' ? (item.baseSalary * item.actualDays) : item.baseSalary;
                                    return (
                                        <tr key={item.id} className="hover:bg-[#f8f9fa] transition-colors group cursor-pointer" onClick={() => setModalState({ isOpen: true, record: item })}>
                                            <td className="py-2.5 px-4 text-center w-12" onClick={(e) => e.stopPropagation()}>
                                                <input 
                                                    type="checkbox"
                                                    className="rounded border-[#cbd5e1] text-[#b58c4f] focus:ring-[#b58c4f] cursor-pointer"
                                                    checked={selectedRecordIds.includes(item.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedRecordIds(prev => [...prev, item.id]);
                                                        } else {
                                                            setSelectedRecordIds(prev => prev.filter(id => id !== item.id));
                                                        }
                                                    }}
                                                />
                                            </td>
                                            <td className="py-2.5 px-4 text-[12px] font-black text-[#212c46] uppercase">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#eaeaec] shadow-sm shrink-0 bg-[#f3f3f1]">
                                                        <img src={item.image} alt={item.nameEn} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-extrabold text-[12.5px] leading-tight text-[#212c46]">{item.empId}</span>
                                                        <span className="text-[10px] font-bold text-[#7a8b95] mt-0.5">{item.nameEn}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-4 text-[12px]">
                                                <p className="font-black font-mono text-[#2f2926]">{formatCurrency(baseEqv)}</p>
                                                <span className="text-[10px] font-black text-[#b58c4f] uppercase tracking-widest mt-0.5 block">{item.payType} {item.payType === 'Daily' && `(${item.actualDays} Days)`}</span>
                                            </td>
                                            <td className="py-2.5 px-4 text-[12px] text-right">
                                                <div className="flex flex-col items-end font-mono">
                                                    <span className="text-[#657f4d] font-bold">+{formatCurrency(item.fixedAllowances)}</span>
                                                    <span className="text-[#932c2e] font-bold">-{formatCurrency(item.fixedDeductions)}</span>
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-4 text-[12px] text-right font-bold">
                                                <div className="flex flex-col items-end font-mono">
                                                    <span className="text-[#3f809e]">{item.varOT > 0 || item.varBonus > 0 ? `+${formatCurrency(item.varOT + item.varBonus)}` : '-'}</span>
                                                    <span className="text-[#932c2e]">{item.varLate > 0 || item.varUnpaidLeave > 0 ? `-${formatCurrency(item.varLate + item.varUnpaidLeave)}` : '-'}</span>
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-4 text-right">
                                                <span className="text-[13px] font-black font-mono text-[#212c46] bg-[#eaeaec]/60 px-2.5 py-1 rounded shadow-inner inline-block">{formatCurrency(item.netPay)}</span>
                                            </td>
                                            <td className="py-2.5 px-4 text-center">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase border tracking-widest
                                                    ${item.status === 'Approved' ? 'bg-[#3f809e]/15 text-[#3f809e] border-[#3f809e]/30' : 
                                                      item.status === 'Paid' ? 'bg-[#657f4d]/15 text-[#657f4d] border-[#657f4d]/30' : 
                                                      'bg-[#7a8b95]/15 text-[#7a8b95] border-[#eaeaec]'}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-center items-center gap-[1px]">
                                                    <button onClick={() => setModalState({ isOpen: true, record: item })} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#3f809e] bg-[#3f809e]/10 hover:bg-[#3f809e]/20 transition-all active:scale-90 cursor-pointer" title={item.status === 'Draft' ? 'Edit Variables' : 'View Variables'}>
                                                        {item.status === 'Draft' ? <Pencil size={14} /> : <Eye size={15} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {totalInPeriod === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-20 bg-white">
                                            <div className="flex flex-col items-center justify-center text-[#7a8b95] max-w-md mx-auto">
                                                <div className="w-14 h-14 bg-[#3f809e]/10 text-[#3f809e] rounded-full flex items-center justify-center border border-[#3f809e]/20 shadow-inner mb-4">
                                                    <Calculator size={28} />
                                                </div>
                                                <p className="font-extrabold text-[13px] text-[#212c46] uppercase tracking-wider">No wage disbursals calculated</p>
                                                <p className="text-[11px] mt-1.5 text-[#606a5f] font-bold">งวดบัญชีตัวเลือก: <span className="text-[#932c2e] font-black">{payCycle === 'Monthly' ? 'รายเดือน' : 'รายวัน'}</span></p>
                                                <p className="text-[11.5px] mt-2 leading-relaxed text-[#7a8b95] text-center">เชื่อมโยงเครื่องประมวลผลเงินเดือนเข้ากับ Master Contracts แฟ้มประวัติ และบันทึกเวลาทำงานของฝ่ายผลิตได้เลย</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentData.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-10 text-[#7a8b95] font-bold text-[12px] bg-white">
                                            No entries match selected status filters.
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION (Exactly like UserPermissions) */}
                    <div className="px-8 py-3 bg-[#f8f9fa] border-t border-[#eaeaec] flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                        <div className="flex items-center gap-6 text-[11px] font-black text-[#7a8b95] uppercase tracking-widest">
                            <div className="flex items-center gap-3">
                                <span>Display Rows:</span>
                                <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="bg-white border border-[#eaeaec] rounded-lg px-3 py-1.5 outline-none font-black text-[#212c46] cursor-pointer shadow-sm">
                                    {[5, 10, 20, 50].map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                            <p className="bg-white px-4 py-2 rounded-xl border border-[#eaeaec] shadow-sm">Total Records: {filteredRecords.length}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`w-10 h-10 border border-[#eaeaec] bg-white rounded-xl flex items-center justify-center transition-all ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#212c46] hover:text-white shadow-md active:scale-90'}`}>
                                <Icons.ChevronLeft size={18}/>
                            </button>
                            <div className="bg-[#212c46] text-white px-8 py-2.5 rounded-xl shadow-md font-black text-[11px] min-w-[140px] text-center uppercase tracking-widest">
                                Page {currentPage} / {totalPages}
                            </div>
                            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className={`w-10 h-10 border border-[#eaeaec] bg-white rounded-xl flex items-center justify-center transition-all ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#212c46] hover:text-white shadow-md active:scale-90'}`}>
                                <Icons.ChevronRight size={18}/>
                            </button>
                        </div>
                    </div>

                </div>

                {/* Respecting the mt-8 spacing requested to keep elements separate from footer */}
                <div className="mt-8"></div>
            </div>
          </div>
      </div>
  );
}
