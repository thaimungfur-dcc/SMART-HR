import { UserGuidePanel } from '../../components/shared/UserGuidePanel';
import KpiCard from '../../components/shared/KpiCard';
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { dbSync } from '../../services/dbSync';
import * as Icons from 'lucide-react';
import { 
  Receipt, Search, Download, Eye, X, ChevronLeft, ChevronRight, 
  HelpCircle, CheckCircle2, AlertTriangle, Building2, Calendar, 
  DollarSign, Printer, TrendingUp, TrendingDown, PiggyBank, Lock,
  Settings, Database, Heart, MailCheck, ShieldAlert, BadgeInfo,
  SlidersHorizontal, CheckSquare, Sparkles, RefreshCw, EyeOff, Save,
  Check, FileDown, Plus, Banknote, Landmark, ShieldCheck
} from 'lucide-react';
import { DraggableModal } from '../../components/shared/DraggableModal';

const THEME = {
  bgMain: 'transparent',
  sidebarBg: 'linear-gradient(180deg, #1d2636 0%, #0F172A 100%)',
  primary: '#212c46', // Navy Blue
  accent: '#b58c4f', // Gold Accent
  ai: '#3f809e', // Steel Blue
  success: '#657f4d', // Moss Green
  danger: '#932c2e', // Rust Red
  charcoal: '#2f2926', // Dark Slate
  warmGrey: '#7a8b95', // Muted Gray
  palette: { 
    gold: '#b58c4f', rust: '#932c2e', copper: '#c5724e', charcoal: '#414757', rose: '#ab7d82', coral: '#d96245', cream: '#f3f3f1', mustard: '#8e9141',
    navyBlue: '#212c46', olive: '#508660', cerulean: '#3f809e', warmGrey: '#7a8b95'
  }
};

// Original Mockup Data to preserve 100%
const DEFAULT_EMPLOYEES = [
  {
    employeeId: 'CA-10245',
    name: 'พิมพพรรณ สวยงาม',
    department: 'Innovation Dept',
    position: 'Senior UX Designer',
    bankAccount: 'Kasikornbank •••• 1245',
    baseSalary: 45000,
    otPay: 3500,
    incentives: 5000,
    allowances: 1500,
    providentFund: 2250,
    tax: 1850,
    socialSecurity: 750,
    status: 'Sent',
    paymentDate: '2026-10-31'
  },
  {
    employeeId: 'CA-10082',
    name: 'ธนวัฒน์ คำสอน',
    department: 'Production Admin',
    position: 'Supply Chain Coordinator',
    bankAccount: 'SCB Bank •••• 8712',
    baseSalary: 28000,
    otPay: 4200,
    incentives: 2000,
    allowances: 1000,
    providentFund: 1056,
    tax: 850,
    socialSecurity: 750,
    status: 'Approved',
    paymentDate: '2026-10-31'
  },
  {
    employeeId: 'CA-10654',
    name: 'จิราภรณ์ แสนดี',
    department: 'QC Control',
    position: 'Quality Assurance Supervisor',
    bankAccount: 'Bangkok Bank •••• 3041',
    baseSalary: 36000,
    otPay: 1500,
    incentives: 3000,
    allowances: 1200,
    providentFund: 1251,
    tax: 1100,
    socialSecurity: 750,
    status: 'Draft',
    paymentDate: '2026-10-31'
  },
  {
    employeeId: 'CA-10111',
    name: 'สมคิด มั่นคง',
    department: 'Logistic Center',
    position: 'Warehouse Manager',
    bankAccount: 'Krunthai Bank •••• 4429',
    baseSalary: 32000,
    otPay: 2000,
    incentives: 2500,
    allowances: 1000,
    providentFund: 1125,
    tax: 950,
    socialSecurity: 750,
    status: 'Draft',
    paymentDate: '2026-10-31'
  }
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
};

function EditPayslipModal({ isOpen, onClose, employee, onSave }: any) {
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (isOpen && employee) {
      setFormData(JSON.parse(JSON.stringify(employee)));
    }
  }, [isOpen, employee]);

  if (!isOpen || !formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? 0 : isNaN(Number(value)) ? value : Number(value);
    setFormData((prev: any) => ({ ...prev, [name]: numValue }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const totalEarnings = formData.baseSalary + formData.otPay + formData.incentives + formData.allowances;
  const totalDeductions = formData.providentFund + formData.tax + formData.socialSecurity;
  const netSalary = totalEarnings - totalDeductions;

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      width="max-w-[850px]"
      customHeader={
        <div className="bg-[#212c46] px-4 py-3 flex justify-between items-center shrink-0 border-b-2 border-[#b58c4f]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/20 shadow-inner">
              <Receipt size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">EDIT INDIVIDUAL PAYSLIP VALUES</h3>
              <p className="text-[10px] font-bold text-[#d7d7d7]/70 uppercase tracking-widest mt-1">Personnel: {formData.name} ({formData.employeeId})</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-[#932c2e] transition-all bg-white/10 hover:bg-white/20 p-1.5 rounded-full"><Icons.X size={16} /></button>
        </div>
      }
    >
      <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-hidden bg-[#f8f9fa] font-sans">
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 bg-white flex-1">
          <div className="bg-[#3f809e]/10 p-3.5 rounded-xl border border-[#3f809e]/20 flex items-center gap-2.5">
            <SlidersHorizontal size={16} className="text-[#3f809e] shrink-0" />
            <p className="text-[11px] font-bold text-[#414757]">
              การเปลี่ยนยอดในส่วนนี้จะมีผลเฉพาะงวดปัจจุบัน โดยระบบจะสรุปยอดสะสมและประมวลภาษีใหม่อัตโนมัติทันที
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Earnings Section */}
            <div className="bg-[#fcfbf9] p-4.5 rounded-2xl border border-[#eaeaec] shadow-sm space-y-4">
              <h4 className="text-[12px] font-black text-[#657f4d] uppercase tracking-widest border-b border-[#eaeaec] pb-1.5 flex items-center gap-2">
                <PiggyBank size={14} /> Earnings Segment (THB)
              </h4>
              <div className="space-y-3.5">
                <div>
                  <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1">Base Salary / Eqv.</label>
                  <input type="number" name="baseSalary" value={formData.baseSalary} onChange={handleChange} className="w-full border rounded-xl px-4 py-2 text-[12px] font-bold font-mono outline-none text-right bg-[#f3f3f1] focus:bg-white" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1">Overtime Pay (OT)</label>
                  <input type="number" name="otPay" value={formData.otPay} onChange={handleChange} className="w-full border rounded-xl px-4 py-2 text-[12px] font-bold font-mono outline-none text-right bg-[#f3f3f1] focus:bg-white" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1">Incentives / COMM</label>
                  <input type="number" name="incentives" value={formData.incentives} onChange={handleChange} className="w-full border rounded-xl px-4 py-2 text-[12px] font-bold font-mono outline-none text-right bg-[#f3f3f1] focus:bg-white" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1">Allowances / Benefits</label>
                  <input type="number" name="allowances" value={formData.allowances} onChange={handleChange} className="w-full border rounded-xl px-4 py-2 text-[12px] font-bold font-mono outline-none text-right bg-[#f3f3f1] focus:bg-white" />
                </div>
              </div>
              <div className="border-t border-[#eaeaec] pt-2 flex justify-between items-center">
                <span className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest">Total Earnings</span>
                <span className="text-[14px] font-black font-mono text-[#657f4d]">{formatCurrency(totalEarnings)}</span>
              </div>
            </div>

            {/* Deductions Section */}
            <div className="bg-[#fafafa] p-4.5 rounded-2xl border border-[#eaeaec] shadow-sm space-y-4">
              <h4 className="text-[12px] font-black text-[#932c2e] uppercase tracking-widest border-b border-[#eaeaec] pb-1.5 flex items-center gap-2">
                <ShieldAlert size={14} /> Deductions Segment (THB)
              </h4>
              <div className="space-y-3.5">
                <div>
                  <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1">Provident Fund Contribution</label>
                  <input type="number" name="providentFund" value={formData.providentFund} onChange={handleChange} className="w-full border rounded-xl px-4 py-2 text-[12px] font-bold font-mono outline-none text-right bg-[#f3f3f1] focus:bg-white" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1">Withholding Tax</label>
                  <input type="number" name="tax" value={formData.tax} onChange={handleChange} className="w-full border rounded-xl px-4 py-2 text-[12px] font-bold font-mono outline-none text-right bg-[#f3f3f1] focus:bg-white" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1">Social Security (SSO)</label>
                  <input type="number" name="socialSecurity" value={formData.socialSecurity} onChange={handleChange} className="w-full border rounded-xl px-4 py-2 text-[12px] font-bold font-mono outline-none text-right bg-[#f3f3f1] focus:bg-white" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1">Payslip Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full border rounded-xl px-4 py-2 text-[12px] font-black outline-none bg-white font-mono">
                    <option value="Draft">Draft</option>
                    <option value="Approved">Approved</option>
                    <option value="Sent">Sent (Published)</option>
                  </select>
                </div>
              </div>
              <div className="border-t border-[#eaeaec] pt-2 flex justify-between items-center">
                <span className="text-[10px] font-black text-[#606a5f] uppercase tracking-widest">Total Deductions</span>
                <span className="text-[14px] font-black font-mono text-[#932c2e]">{formatCurrency(totalDeductions)}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#212c46] px-4.5 py-4 rounded-2xl flex justify-between items-center text-white">
            <div>
              <span className="text-[10px] font-black text-[#7a8b95] uppercase tracking-widest block">Net Calculated Salary</span>
              <span className="text-[9px] text-[#4d87a8] font-bold uppercase block mt-0.5">Disbursal amount after deduction splits</span>
            </div>
            <span className="text-[22px] font-black font-mono text-[#b58c4f]">{formatCurrency(netSalary)}</span>
          </div>
        </div>

        <div className="px-6 py-3 bg-[#f8f9fa] border-t border-[#eaeaec] flex justify-between items-center shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2 bg-white border border-[#eaeaec] text-[#414757] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#eaeaec] transition-all">Cancel</button>
          <button type="submit" className="bg-[#212c46] text-white px-6 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md hover:bg-[#414757] transition-all flex items-center gap-2">
            <Save size={14} /> Save Allocation
          </button>
        </div>
      </form>
    </DraggableModal>
  );
}

export default function PayslipsHr() {
  const [activeTab, setActiveTab] = useState('registry');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [payrollPeriod, setPayrollPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(false);

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load from state/default
  const [employees, setEmployees] = useState<any[]>([]);

  const loadPayslips = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      const [payRes, salRes] = await Promise.all([
        dbSync.read('payroll_records', forceRefresh),
        dbSync.read('salary_master', forceRefresh)
      ]);

      let payRecords: any[] = [];
      if (payRes && payRes.status === 'success' && payRes.data?.items) {
        payRecords = payRes.data.items;
      } else if (Array.isArray(payRes)) {
        payRecords = payRes;
      }

      let salRecords: any[] = [];
      if (salRes && salRes.status === 'success' && salRes.data?.items) {
        salRecords = salRes.data.items;
      } else if (Array.isArray(salRes)) {
        salRecords = salRes;
      }

      if (forceRefresh) {
        setToast('Payslip records synchronised successfully! / รหัสการจ่ายซิงก์สำเร็จ!');
      }

        if (payRecords.length > 0) {
          // Normalize payRecords to Payslip format
          const mapped = payRecords.map((r: any) => ({
            employeeId: r.empId || r.employeeId || '',
            name: r.nameTh || r.nameEn || r.name || '',
            department: r.dept || r.department || '',
            position: r.jobTitle || r.position || '',
            bankAccount: r.bankAccount || (r.bank ? `${r.bank} •••• ${String(r.bankAcc || '').slice(-4) || '1234'}` : 'Kasikornbank •••• 1245'),
            baseSalary: Number(r.baseSalary) || 0,
            otPay: Number(r.varOT) || 0,
            incentives: Number(r.varBonus) || 0,
            allowances: Number(r.fixedAllowances) || 0,
            providentFund: Number(r.providentFund) || Math.round((Number(r.baseSalary) || 0) * 0.05),
            tax: Number(r.deductTax) || 0,
            socialSecurity: Number(r.deductSSO) || 0,
            status: r.status === 'Paid' || r.status === 'Sent' ? 'Sent' : (r.status === 'Approved' ? 'Approved' : 'Draft'),
            paymentDate: r.paymentDate || '2026-10-31'
          }));
          setEmployees(mapped);
        } else {
          // If no calculations performed, use salary_master as templates
          const baseList = salRecords.length > 0 ? salRecords : [];
          if (baseList.length > 0) {
            const tempMapped = baseList.map((s: any) => ({
              employeeId: s.empId,
              name: s.nameTh || s.nameEn || '',
              department: s.dept || '',
              position: s.jobTitle || '',
              bankAccount: s.bank ? `${s.bank} •••• ${String(s.bankAcc || '').slice(-4) || '1112'}` : 'Kasikornbank •••• 1245',
              baseSalary: Number(s.baseSalary) || 0,
              otPay: 0,
              incentives: 0,
              allowances: (Number(s.allowancePos) || 0) + (Number(s.allowanceIncentive) || 0) + (Number(s.allowanceTravel) || 0),
              providentFund: Math.round((Number(s.baseSalary) || 0) * 0.05),
              tax: Number(s.deductTax) || 0,
              socialSecurity: Number(s.deductSSO) || 0,
              status: 'Draft',
              paymentDate: '2026-10-31'
            }));
            setEmployees(tempMapped);
          } else {
            setEmployees(DEFAULT_EMPLOYEES);
          }
      }
    } catch (err) {
      console.error('Failed to load dynamic payslips:', err);
      setEmployees(DEFAULT_EMPLOYEES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayslips();
  }, [payrollPeriod]);
  
  // Modal states
  const [editModal, setEditModal] = useState<any>({ isOpen: false, employee: null });
  const [viewModal, setViewModal] = useState<any>({ isOpen: false, employee: null });

  // Settings tab configurations
  const [settings, setSettings] = useState({
    passwordProtection: true,
    defaultPasscode: '1234',
    ssoContributionRate: 5,
    ssoCapValue: 750,
    providentFundDefault: 5,
    selectedRoutingFormat: 'KBANK_BIZ'
  });

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch = String(emp.name || '').toLowerCase().includes(search.toLowerCase()) || 
                          String(emp.employeeId || '').toLowerCase().includes(search.toLowerCase()) ||
                          String(emp.department || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'All' || emp.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [employees, search, filterStatus]);

  const currentData = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage) || 1;

  // KPI Calculations
  const totalRoster = employees.length;
  const draftCount = employees.filter(e => e.status === 'Draft').length;
  const approvedCount = employees.filter(e => e.status === 'Approved').length;
  const totalNetOutflow = employees.reduce((sum, e) => {
    const earns = e.baseSalary + e.otPay + e.incentives + e.allowances;
    const deducts = e.providentFund + e.tax + e.socialSecurity;
    return sum + (earns - deducts);
  }, 0);

  // Helper to save current state of employees list back to database
  const saveToDb = async (updatedEmployees: any[]) => {
    try {
      const payRes = await dbSync.read('payroll_records');
      let payRecords: any[] = [];
      if (payRes && payRes.status === 'success' && payRes.data?.items) {
        payRecords = payRes.data.items;
      } else if (Array.isArray(payRes)) {
        payRecords = payRes;
      }

      const updatedPayRecords = payRecords.map(pay => {
        const emp = updatedEmployees.find(e => e.employeeId === pay.empId);
        if (emp) {
          return {
            ...pay,
            baseSalary: emp.baseSalary,
            varOT: emp.otPay,
            varBonus: emp.incentives,
            fixedAllowances: emp.allowances,
            providentFund: emp.providentFund,
            deductTax: emp.tax,
            deductSSO: emp.socialSecurity,
            status: emp.status === 'Sent' ? 'Paid' : (emp.status === 'Approved' ? 'Approved' : 'Draft'),
            totalGross: emp.baseSalary + emp.otPay + emp.incentives + emp.allowances,
            totalDeductions: emp.providentFund + emp.tax + emp.socialSecurity,
            netPay: (emp.baseSalary + emp.otPay + emp.incentives + emp.allowances) - (emp.providentFund + emp.tax + emp.socialSecurity)
          };
        }
        return pay;
      });

      await dbSync.write('payroll_records', updatedPayRecords);
    } catch (err) {
      console.error('Failed to sync changes back to payroll_records database:', err);
    }
  };

  // Handlers
  const handleApproveAll = async () => {
    const nextList = employees.map(e => e.status === 'Draft' ? { ...e, status: 'Approved' } : e);
    setEmployees(nextList);
    await saveToDb(nextList);
    alert('Approved all draft payslips successfully!');
  };

  const handlePublishAll = async () => {
    const nextList = employees.map(e => e.status === 'Approved' ? { ...e, status: 'Sent' } : e);
    setEmployees(nextList);
    await saveToDb(nextList);
    alert('Published all approved payslips successfully! Employee portals are now updated.');
  };

  const handleUpdateSlave = async (updatedEmp: any) => {
    const nextList = employees.map(e => e.employeeId === updatedEmp.employeeId ? updatedEmp : e);
    setEmployees(nextList);
    await saveToDb(nextList);
  };

  const handleSyncFromCalculation = async () => {
    setIsLoading(true);
    try {
      const [payRes, salRes] = await Promise.all([
        dbSync.read('payroll_records'),
        dbSync.read('salary_master')
      ]);

      let payRecords: any[] = [];
      if (payRes && payRes.status === 'success' && payRes.data?.items) {
        payRecords = payRes.data.items;
      } else if (Array.isArray(payRes)) {
        payRecords = payRes;
      }

      let salRecords: any[] = [];
      if (salRes && salRes.status === 'success' && salRes.data?.items) {
        salRecords = salRes.data.items;
      } else if (Array.isArray(salRes)) {
        salRecords = salRes;
      }

      if (payRecords.length > 0) {
        const mapped = payRecords.map((r: any) => ({
          employeeId: r.empId || r.employeeId || '',
          name: r.nameTh || r.nameEn || r.name || '',
          department: r.dept || r.department || '',
          position: r.jobTitle || r.position || '',
          bankAccount: r.bankAccount || (r.bank ? `${r.bank} •••• ${String(r.bankAcc || '').slice(-4) || '1112'}` : 'Kasikornbank •••• 1245'),
          baseSalary: Number(r.baseSalary) || 0,
          otPay: Number(r.varOT) || 0,
          incentives: Number(r.varBonus) || 0,
          allowances: Number(r.fixedAllowances) || 0,
          providentFund: Number(r.providentFund) || Math.round((Number(r.baseSalary) || 0) * 0.05),
          tax: Number(r.deductTax) || 0,
          socialSecurity: Number(r.deductSSO) || 0,
          status: r.status === 'Paid' || r.status === 'Sent' ? 'Sent' : (r.status === 'Approved' ? 'Approved' : 'Draft'),
          paymentDate: r.paymentDate || '2026-10-31'
        }));
        setEmployees(mapped);
        alert('ซิงค์ข้อมูลคำนวณเงินเดือนล่าสุดสำเร็จ ' + mapped.length + ' รายการ!');
      } else {
        alert('ไม่พบประวัติผลการประมวลเงินเดือนในระบบประมวลผล กรุณากดคำนวณเงินเดือนในหน้า "ประมวลผลเงินเดือน" ก่อนค่ะ');
      }
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการเชื่อมโยงข้อมูลคำนวณเงินเดือนค่ะ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 w-full flex-col animate-fadeIn bg-transparent space-y-4 pb-6 min-h-0">
      {/* Floating Guide Tab */}
      {typeof document !== 'undefined' && createPortal(
        <button onClick={() => setIsGuideOpen(true)} className="fixed right-0 bg-[#f8f9fa] border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#b58c4f] hover:text-white hover:border-[#b58c4f] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group cursor-pointer" style={{ top: '80px' }}>
            <Icons.HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#7a8b95] group-hover:text-white" />
            <span className="font-black tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[11px]">USER GUIDE</span>
        </button>,
        document.body
      )}
      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <EditPayslipModal isOpen={editModal.isOpen} onClose={() => setEditModal({ isOpen: false, employee: null })} employee={editModal.employee} onSave={handleUpdateSlave} />
      {/* Detail Viewer Portal */}
      {viewModal.isOpen && viewModal.employee && createPortal(
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-[#212c46]/60 backdrop-blur-sm p-4 md:p-6 animate-fadeIn">
          <div className="bg-[#1e293b] rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden max-h-[92vh]">
            
            {/* Modal Header Bar matching exactly the sample */}
            <div className="bg-[#1e293b] px-6 py-4 flex justify-between items-center text-white border-b border-slate-700/60 shrink-0">
              <div className="flex items-center gap-2">
                <Landmark className="text-[#b58c4f]" size={18} />
                <span className="text-[12px] font-black uppercase tracking-widest text-[#f3f3f1]">PAYSLIP PREVIEW</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => window.print()} 
                  className="px-4 py-2 border border-slate-600 hover:border-white text-[11px] font-black uppercase rounded-lg tracking-widest flex items-center gap-1.5 transition-colors cursor-pointer bg-transparent text-gray-300 hover:text-white"
                >
                  <Printer size={14} /> PRINT
                </button>
                <button 
                  onClick={() => alert("Downloading PDF representation...")} 
                  className="px-4 py-2 bg-[#b58c4f] hover:bg-[#a94228] text-white hover:text-white text-[11px] font-black uppercase rounded-lg tracking-widest flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Download size={14} /> DOWNLOAD PDF
                </button>
                <div className="w-[1px] h-6 bg-slate-700 mx-1"></div>
                <button 
                  onClick={() => setViewModal({ isOpen: false, employee: null })} 
                  className="text-gray-400 hover:text-red-500 hover:bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            {/* Dark background sandbox to float the paper */}
            <div className="bg-[#2c374e] p-6 md:p-10 flex justify-center items-start overflow-y-auto max-h-[calc(92vh-74px)] custom-scrollbar flex-1 w-full relative">
              
              {/* White paper sheet containing the printed slip */}
              <div className="bg-white text-[#2f2926] rounded-sm shadow-2xl p-8 md:p-12 max-w-3xl w-full flex flex-col font-sans relative z-10 border border-white">
                
                {/* Salary slip header info */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b-2 border-[#212c46] pb-5 mb-5">
                  <div className="flex flex-col text-left">
                    <h4 className="text-[16px] md:text-[18px] font-black text-[#212c46] uppercase leading-tight mb-1 font-mono tracking-tight">T All Intelligence Co., Ltd.</h4>
                    <p className="text-[10px] text-[#7a8b95] font-black uppercase tracking-wider mb-2 leading-none">บริษัท ที ออลล์ อินเทลลิเจนซ์ จำกัด</p>
                    <p className="text-[11px] text-[#606a5f] font-mono leading-relaxed font-semibold">สำนักงานใหญ่ : 46 หมู่ที่ 5 ตำบลคลองสี่ อำเภอคลองหลวง จังหวัดปทุมธานี 12120</p>
                    <p className="text-[11px] text-[#606a5f] font-mono leading-relaxed font-semibold">Head Office : 46 Moo 5, Klong 4, Klong Luang, Pathumthani Thailand 12120</p>
                    <p className="text-[11px] text-[#606a5f] font-mono font-bold mt-1">TAX ID : 0-1055-57149-33-2</p>
                  </div>
                  <div className="text-right flex flex-col items-end shrink-0 md:pt-1">
                    <span className="text-[20px] md:text-[22px] font-black text-[#b58c4f] tracking-widest font-mono leading-none">PAY SLIP</span>
                    <span className="text-[9px] text-[#7a8b95] font-bold uppercase mt-1">ใบรับรองการจ่ายเงินเดือน</span>
                    <div className="border border-slate-300 rounded-lg px-3 py-1 mt-2.5 bg-slate-50/50">
                      <span className="text-[10px] font-black text-[#2f2926] tracking-wider font-mono">PERIOD: OCTOBER 2026</span>
                    </div>
                  </div>
                </div>

                {/* Grid container with Employee detailed segments */}
                <div className="border border-slate-200 rounded-xl p-4 md:p-5 bg-[#fafcfd]/60 grid grid-cols-1 md:grid-cols-2 gap-y-3.5 gap-x-6 text-[11px] font-mono mb-6 shadow-xs leading-none">
                  <div className="md:border-r border-dashed border-slate-200 md:pr-6 space-y-3">
                    <div className="flex justify-between border-b border-dashed border-slate-100 pb-2">
                      <span className="text-slate-400 font-extrabold uppercase text-[10px]">EMPLOYEE NAME:</span>
                      <span className="text-slate-900 font-black uppercase text-right pl-4">{viewModal.employee.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-slate-100 pb-2">
                      <span className="text-slate-400 font-extrabold uppercase text-[10px]">DEPARTMENT:</span>
                      <span className="text-slate-900 font-black uppercase text-right pl-4">{viewModal.employee.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-extrabold uppercase text-[10px]">BANK ACCOUNT:</span>
                      <span className="text-slate-900 font-black uppercase text-right pl-4">{viewModal.employee.bankAccount}</span>
                    </div>
                  </div>
                  <div className="md:pl-6 space-y-3">
                    <div className="flex justify-between border-b border-dashed border-slate-100 pb-2">
                      <span className="text-slate-400 font-extrabold uppercase text-[10px]">EMPLOYEE ID:</span>
                      <span className="text-slate-900 font-black uppercase">{viewModal.employee.employeeId}</span>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-slate-100 pb-2">
                      <span className="text-slate-400 font-extrabold uppercase text-[10px]">DESIGNATION:</span>
                      <span className="text-slate-900 font-black uppercase text-right pl-4">{viewModal.employee.position}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-extrabold uppercase text-[10px]">PAYMENT DATE:</span>
                      <span className="text-slate-900 font-black uppercase">{viewModal.employee.paymentDate || '2026-10-31'}</span>
                    </div>
                  </div>
                </div>

                {/* Grid detailing twin lists: Earnings & Deductions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  
                  {/* Earnings Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between bg-white shadow-xs">
                    <div className="bg-[#508660]/10 px-4 py-2.5 flex items-center justify-between border-b border-[#508660]/20 text-[#508660] font-black uppercase tracking-widest text-[11px] leading-tight">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={14} className="shrink-0 text-[#508660]" />
                        <span>EARNINGS / รายได้</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <table className="w-full text-left border-collapse text-[11px] font-mono">
                        <tbody>
                          <tr className="border-b border-dashed border-slate-100">
                            <td className="py-2.5 px-4 text-slate-500 font-extrabold">Base Salary / Eqv.</td>
                            <td className="py-2.5 px-4 text-right text-slate-900 font-black">{formatCurrency(viewModal.employee.baseSalary)}</td>
                          </tr>
                          <tr className="border-b border-dashed border-slate-100">
                            <td className="py-2.5 px-4 text-slate-500 font-extrabold">Fixed Allowances</td>
                            <td className="py-2.5 px-4 text-right text-slate-900 font-black">{formatCurrency(viewModal.employee.allowances)}</td>
                          </tr>
                          <tr className="border-b border-dashed border-slate-100">
                            <td className="py-2.5 px-4 text-slate-500 font-extrabold">Incentives / Comm</td>
                            <td className="py-2.5 px-4 text-right text-slate-900 font-black">{formatCurrency(viewModal.employee.incentives)}</td>
                          </tr>
                          <tr className="border-b border-dashed border-slate-100">
                            <td className="py-2.5 px-4 text-slate-500 font-extrabold">Overtime (OT)</td>
                            <td className="py-2.5 px-4 text-right text-slate-900 font-black">{formatCurrency(viewModal.employee.otPay)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="bg-[#fafbfc] px-4 py-3 border-t border-slate-200 flex justify-between items-center text-[11px] font-mono leading-none font-bold shrink-0">
                      <span className="text-slate-700 font-black uppercase">TOTAL EARNINGS</span>
                      <span className="text-[#508660] font-black text-[12px]">{formatCurrency(viewModal.employee.baseSalary + viewModal.employee.allowances + viewModal.employee.incentives + viewModal.employee.otPay)}</span>
                    </div>
                  </div>

                  {/* Deductions Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between bg-white shadow-xs">
                    <div className="bg-[#932c2e]/10 px-4 py-2.5 flex items-center justify-between border-b border-[#932c2e]/20 text-[#932c2e] font-black uppercase tracking-widest text-[11px] leading-tight">
                      <div className="flex items-center gap-2">
                        <TrendingDown size={14} className="shrink-0 text-[#932c2e]" />
                        <span>DEDUCTIONS / รายจ่าย</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <table className="w-full text-left border-collapse text-[11px] font-mono">
                        <tbody>
                          <tr className="border-b border-dashed border-slate-100">
                            <td className="py-2.5 px-4 text-slate-500 font-extrabold">Provident Fund</td>
                            <td className="py-2.5 px-4 text-right text-slate-900 font-black">{formatCurrency(viewModal.employee.providentFund)}</td>
                          </tr>
                          <tr className="border-b border-dashed border-slate-100">
                            <td className="py-2.5 px-4 text-slate-500 font-extrabold">Withholding Tax</td>
                            <td className="py-2.5 px-4 text-right text-slate-100 font-black bg-neutral-900/5">{formatCurrency(viewModal.employee.tax)}</td>
                          </tr>
                          <tr className="border-b border-dashed border-slate-100">
                            <td className="py-2.5 px-4 text-slate-500 font-extrabold">Social Security (SSO)</td>
                            <td className="py-2.5 px-4 text-right text-slate-900 font-black">{formatCurrency(viewModal.employee.socialSecurity)}</td>
                          </tr>
                          <tr className="border-b border-dashed border-slate-100">
                            <td className="py-2.5 px-4 text-slate-500 font-extrabold">Late / Absent Penalty</td>
                            <td className="py-2.5 px-4 text-right text-slate-900 font-black">{formatCurrency(0)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="bg-[#fafbfc] px-4 py-3 border-t border-slate-200 flex justify-between items-center text-[11px] font-mono leading-none font-bold shrink-0">
                      <span className="text-slate-700 font-black uppercase">TOTAL DEDUCTIONS</span>
                      <span className="text-[#932c2e] font-black text-[12px]">{formatCurrency(viewModal.employee.providentFund + viewModal.employee.tax + viewModal.employee.socialSecurity)}</span>
                    </div>
                  </div>

                </div>

                {/* Net Pay Dark Bar Block */}
                <div className="bg-[#212c46] text-white p-5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 shadow-md">
                  <div className="flex flex-col leading-tight">
                    <span className="font-mono text-[11px] text-gray-300 tracking-widest font-black uppercase">NET PAY TRANSFER / เงินเดืนรับสุทธิ</span>
                    <span className="text-[9px] text-[#4d87a8] mt-1.5 uppercase font-bold tracking-wider">AMOUNT TRANSFERRED TO YOUR REGISTERED ACCOUNT</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-1 sm:mt-0 font-mono leading-none">
                    <span className="text-xs font-bold text-[#b58c4f]">THB</span>
                    <span className="text-2xl md:text-[28px] font-black tracking-tighter text-white">
                      {formatCurrency(
                        (viewModal.employee.baseSalary + viewModal.employee.otPay + viewModal.employee.incentives + viewModal.employee.allowances) - 
                        (viewModal.employee.providentFund + viewModal.employee.tax + viewModal.employee.socialSecurity)
                      ).replace('฿', '').trim()}
                    </span>
                  </div>
                </div>

                {/* Signature Block representing authentic slips */}
                <div className="grid grid-cols-2 gap-12 border-t border-slate-200/80 pt-8 mt-10 text-[11px] font-mono select-none">
                  <div className="text-center flex flex-col items-center">
                    <div className="h-8 border-b border-dashed border-slate-300 w-44"></div>
                    <span className="text-[#7a8b95] font-black uppercase tracking-wider mt-2.5">Authorized Signature</span>
                    <span className="text-gray-400 text-[9px] mt-0.5">(ผู้จ่ายเงิน)</span>
                  </div>
                  <div className="text-center flex flex-col items-center">
                    <div className="h-8 border-b border-dashed border-slate-300 w-44"></div>
                    <span className="text-[#7a8b95] font-black uppercase tracking-wider mt-2.5">Employee's Signature</span>
                    <span className="text-gray-400 text-[9px] mt-0.5">(ผู้รับเงิน)</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>,
        document.body
      )}
      {/* HEADER SECTION - Placed transparently on the main page */}
      <div className="h-14 px-8 flex flex-row items-center justify-between gap-4 z-20 shrink-0 bg-transparent">
          <div className="flex items-center gap-5">
              <div className="relative flex items-center justify-center group cursor-default shrink-0">
                  <div className="absolute inset-0 bg-[#3f809e] blur-[15px] opacity-20 rounded-full group-hover:opacity-60 transition-all duration-700"></div>
                  <div className="relative z-10 p-1.5 border border-[#3f809e]/40 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm">
                      <Receipt size={28} strokeWidth={2.5} className="text-[#3f809e]" />
                  </div>
              </div>
              <div>
                  <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none" style={{ fontSize: '24px' }}>
                      PAYSLIPS <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3f809e] to-[#b58c4f]">(HR)</span> PANEL
                  </h3>
                  <p className="text-[11px] font-bold text-[#606a5f] uppercase tracking-[0.2em] mt-0.5 opacity-80 leading-none">
                      CENTRAL PAYSLIP REGISTRY & SECURITY CLEARANCE CENTER
                  </p>
              </div>
          </div>

          <div className="flex items-center gap-4">
              <button 
                  onClick={() => loadPayslips(true)} 
                  disabled={isLoading} 
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-[10.5px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-xs bg-white text-[#508660] border-[#508660]/35 hover:bg-[#508660]/10 ${isLoading ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                  <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} /> {isLoading ? 'Refreshing...' : 'Refresh Data'}
              </button>

              <div className="bg-white/50 p-1.5 rounded-xl border border-white/60 shadow-inner flex flex-wrap items-center gap-1">
                  <button onClick={() => setActiveTab('registry')} className={`px-6 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'registry' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#7a8b95] hover:text-[#932c2e]'}`}>
                    <Database size={16} /> Slips Registry
                  </button>
                  <button onClick={() => setActiveTab('settings')} className={`px-6 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'settings' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#7a8b95] hover:text-[#932c2e]'}`}>
                    <Settings size={16} /> Parameters Node
                  </button>
              </div>
          </div>
      </div>
      <div className="px-4 sm:px-8 w-full mt-[2px]">
        <div className="w-full">
            
            {/* KPI STATS - Styled cleanly, lean padding as requested */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3 shrink-0">
                <KpiCard
                  label="ACTIVE PERSONNEL"
                  value={totalRoster}
                  icon={Icons.Users}
                  color={THEME.palette.navyBlue}
                  description="Roster Database" />
                <KpiCard
                  label="DRAFTS IN WAIT"
                  value={draftCount}
                  icon={AlertTriangle}
                  color={draftCount > 0 ? THEME.palette.coral : THEME.palette.olive}
                  description="Unverified Sheets" />
                <KpiCard
                  label="APPROVED REGISTERS"
                  value={approvedCount}
                  icon={CheckCircle2}
                  color={THEME.palette.olive}
                  description="Ready to Publish" />
                <KpiCard
                  label="MONTHLY OUTFLOW"
                  value={formatCurrency(totalNetOutflow)}
                  icon={Banknote}
                  color={THEME.palette.cerulean}
                  description="THB Disbursal" />
            </div>

            {activeTab === 'registry' ? (
              <div className="bg-white rounded-3xl shadow-lg border border-[#eaeaec] overflow-hidden flex flex-col animate-fadeIn  flex-1 min-h-0">
                
                {/* TOOLBAR */}
                <div className="px-8 py-4 border-b border-[#eaeaec] bg-[#f8f9fa] flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                      <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7a8b95]" />
                      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search personnel..." className="w-full pl-12 pr-6 py-2.5 text-[12px] border border-[#eaeaec] rounded-full font-bold outline-none focus:border-[#b58c4f] bg-white shadow-sm text-[#212c46]" />
                    </div>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-white border border-[#eaeaec] rounded-full px-5 py-2.5 text-[11px] font-black uppercase tracking-widest outline-none focus:border-[#212c46] text-[#414757] shadow-sm cursor-pointer w-40">
                      <option value="All">All Status</option>
                      <option value="Draft">Draft Only</option>
                      <option value="Approved">Approved</option>
                      <option value="Sent">Sent (Published)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                    <button onClick={handleSyncFromCalculation} className="bg-white border border-[#eaeaec] text-[#606a5f] hover:bg-[#f8f9fa] hover:border-[#b58c4f] px-5 py-2.5 rounded-full font-black text-[11px] uppercase tracking-widest shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer">
                      <RefreshCw size={14} /> Synchronize Calculation
                    </button>
                    {draftCount > 0 && (
                      <button onClick={handleApproveAll} className="bg-white border border-[#eaeaec] text-[#657f4d] hover:bg-[#657f4d]/10 hover:border-[#657f4d]/30 px-5 py-2.5 rounded-full font-black text-[11px] uppercase tracking-widest shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer">
                        <CheckSquare size={14} /> Verify All Drafts
                      </button>
                    )}
                    {approvedCount > 0 && (
                      <button onClick={handlePublishAll} className="bg-[#212c46] text-white hover:bg-[#3f809e] px-6 py-2.5 rounded-full font-black text-[12px] uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 border border-[#212c46] cursor-pointer">
                        <MailCheck size={14} /> Publish Approved Slips
                      </button>
                    )}
                  </div>
                </div>

                {/* DATA TABLE (Header สี 222b38 + เส้นใต้ border-b-2 สี 709654, py-2.5 px-4) */}
                <div className="overflow-x-auto custom-scrollbar flex-1 min-h-0">
                  <table className="w-full text-left font-sans border-collapse min-w-[1000px]">
                    <thead className="bg-[#222b38] text-white">
                      <tr className="border-b-2 border-[#709654]">
                        <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">Personnel Identity</th>
                        <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">Base Wage / Roster</th>
                        <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-right">Addition Segments</th>
                        <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-right">Deducted Segments</th>
                        <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-right">Net Payable Transfer</th>
                        <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Status</th>
                        <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#eaeaec]">
                      {currentData.map((emp) => {
                        const earns = emp.baseSalary + emp.otPay + emp.incentives + emp.allowances;
                        const deducts = emp.providentFund + emp.tax + emp.socialSecurity;
                        const netPay = earns - deducts;
                        
                        return (
                          <tr key={emp.employeeId} className="hover:bg-[#f8f9fa] transition-colors group cursor-pointer" onClick={() => setViewModal({ isOpen: true, employee: emp })}>
                            <td className="py-2.5 px-4 text-[12px] font-black text-[#212c46] uppercase">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#3f809e]/10 text-[#3f809e] border border-[#3f809e]/30 flex items-center justify-center font-extrabold text-[12px] shrink-0 font-mono">
                                  {typeof emp.employeeId === 'string' ? (emp.employeeId.includes('-') ? emp.employeeId.split('-')[1] : emp.employeeId.slice(3)) : String(emp.employeeId || '')}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-extrabold text-[12.5px] leading-tight text-[#212c46]">{emp.name}</span>
                                  <span className="text-[10px] font-bold text-[#7a8b95] mt-0.5">{emp.employeeId} • {emp.department}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-4 text-[12px]">
                              <p className="font-black font-mono text-[#2f2926]">{formatCurrency(emp.baseSalary)}</p>
                              <span className="text-[10px] font-black text-[#b58c4f] uppercase tracking-widest mt-0.5 block">{emp.position}</span>
                            </td>
                            <td className="py-2.5 px-4 text-[12px] text-right font-mono">
                              <span className="text-[#657f4d] font-bold">+{formatCurrency(emp.otPay + emp.incentives + emp.allowances)}</span>
                            </td>
                            <td className="py-2.5 px-4 text-[12px] text-right font-mono">
                              <span className="text-[#932c2e] font-bold">-{formatCurrency(emp.providentFund + emp.tax + emp.socialSecurity)}</span>
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <span className="text-[13px] font-black font-mono text-[#212c46] bg-[#eaeaec]/60 px-2.5 py-1 rounded shadow-inner inline-block">{formatCurrency(netPay)}</span>
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase border tracking-widest
                                ${emp.status === 'Sent' ? 'bg-[#657f4d]/15 text-[#657f4d] border-[#657f4d]/30' : 
                                  emp.status === 'Approved' ? 'bg-[#3f809e]/15 text-[#3f809e] border-[#3f809e]/30' : 
                                  'bg-[#7a8b95]/15 text-[#7a8b95] border-[#eaeaec]'}`}>
                                {emp.status === 'Sent' ? 'Sent' : emp.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                              <div className="flex justify-center items-center gap-[1px]">
                                <button onClick={() => setViewModal({ isOpen: true, employee: emp })} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#3f809e] bg-[#3f809e]/10 hover:bg-[#3f809e]/20 transition-all active:scale-90 cursor-pointer" title="View Payslip">
                                  <Icons.Eye size={14} />
                                </button>
                                <button onClick={() => setEditModal({ isOpen: true, employee: emp })} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#b58c4f] bg-[#b58c4f]/10 hover:bg-[#b58c4f]/20 transition-all active:scale-90 cursor-pointer" title="Edit Earning Variables">
                                  <Icons.Pencil size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredEmployees.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center py-20 bg-white">
                            <div className="flex flex-col items-center justify-center text-[#7a8b95] max-w-md mx-auto">
                              <div className="w-14 h-14 bg-[#3f809e]/10 text-[#3f809e] rounded-full flex items-center justify-center border border-[#3f809e]/20 shadow-inner mb-4">
                                <Receipt size={28} />
                              </div>
                              <p className="font-extrabold text-[13px] text-[#212c46] uppercase tracking-wider">No matching records found</p>
                              <p className="text-[11px] mt-1.5 text-[#606a5f] font-bold">Try adjusting filters or checking the general search queries.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION */}
                <div className="px-8 py-3 bg-[#f8f9fa] border-t border-[#eaeaec] flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                  <div className="flex items-center gap-6 text-[11px] font-black text-[#7a8b95] uppercase tracking-widest">
                    <div className="flex items-center gap-3">
                      <span>Display Rows:</span>
                      <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="bg-white border border-[#eaeaec] rounded-lg px-3 py-1.5 outline-none font-black text-[#212c46] cursor-pointer shadow-sm">
                        {[5, 10, 20].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                    <p className="bg-white px-4 py-2 rounded-xl border border-[#eaeaec] shadow-sm">Total Records: {filteredEmployees.length}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`w-10 h-10 border border-[#eaeaec] bg-white rounded-xl flex items-center justify-center transition-all ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#212c46] hover:text-white shadow-md active:scale-90'}`}>
                      <ChevronLeft size={18}/>
                    </button>
                    <div className="bg-white text-[#212c46] px-5 py-2.5 rounded-xl font-black text-[11px] min-w-[100px] text-center uppercase tracking-widest border border-[#eaeaec] shadow-md font-mono">
                      PAGE {currentPage} / {totalPages}
                    </div>
                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className={`w-10 h-10 border border-[#eaeaec] bg-white rounded-xl flex items-center justify-center transition-all ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#212c46] hover:text-white shadow-md active:scale-90'}`}>
                      <ChevronRight size={18}/>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // ACCESS PARAMETERS CONFIGURATION - Conforms 100% to User Permissions setting logic
              (<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* SETTINGS CARD COLUMN */}
                <div className="lg:col-span-4 bg-white/90 p-6 rounded-3xl shadow-lg border border-[#eaeaec] animate-fadeIn h-fit space-y-4">
                  <h3 className="text-[14px] font-black text-[#212c46] uppercase tracking-widest flex items-center gap-3 border-b-2 border-[#b58c4f] pb-4 mb-2">
                    <BadgeInfo size={18} className="text-[#b58c4f]" /> CONFIG PARAMETERS
                  </h3>
                  <div className="space-y-4.5 text-xs font-bold leading-relaxed">
                    <div className="p-4 bg-[#f8f9fa] border border-[#eaeaec] rounded-xl">
                      <p className="text-[#3f809e] uppercase font-black tracking-wider text-[11px] mb-1">Withholding SSO splits</p>
                      <p className="text-[#606a5f]">SSO base is automatically witholded to secure vault at 5% capped on 15,000 THB gross values (Maximum 750 THB).</p>
                    </div>
                    <div className="p-4 bg-[#fafafa] border border-[#eaeaec] rounded-xl text-[#212c46]">
                      <p className="text-[#b58c4f] uppercase font-black tracking-wider text-[11px] mb-1">Passcode Vault Protected</p>
                      <p className="text-[#606a5f]">Each employee is forced to key in their 4-digit passcode prior to viewing full-ledger payslips to guarantee absolute document secrecy.</p>
                    </div>
                  </div>
                </div>
                {/* FORM CONTROLS COLUMN */}
                <div className="lg:col-span-8 bg-white rounded-3xl shadow-lg border border-[#eaeaec] overflow-hidden space-y-6 p-6">
                  <h4 className="text-[14px] font-black text-[#212c46] uppercase tracking-widest border-b pb-4 flex items-center gap-2">
                    <SlidersHorizontal size={18} className="text-[#b58c4f]" /> SYSTEM & CALCULATOR PARAMETERS CONFIGURATION
                  </h4>

                  <div className="space-y-5">
                    
                    {/* SSO Segment */}
                    <div className="p-5 border rounded-2xl bg-[#fafafa] space-y-4">
                      <h5 className="font-exrabold text-[12px] uppercase text-[#212c46] tracking-wider flex items-center gap-2">
                        <Landmark size={16} className="text-[#3f809e]" /> Social Security (SSO) Parameters
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#7a8b95] block mb-1">SSO Contribution Rate (%)</label>
                          <input type="number" value={settings.ssoContributionRate} onChange={e => setSettings({...settings, ssoContributionRate: Number(e.target.value)})} className="w-full border rounded-xl px-4 py-2 text-[12px] font-bold outline-none focus:border-[#212c46]" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#7a8b95] block mb-1">Maximum Contribution Cap (THB)</label>
                          <input type="number" value={settings.ssoCapValue} onChange={e => setSettings({...settings, ssoCapValue: Number(e.target.value)})} className="w-full border rounded-xl px-4 py-2 text-[12px] font-bold outline-none focus:border-[#212c46]" />
                        </div>
                      </div>
                    </div>

                    {/* Security Passcode Node */}
                    <div className="p-5 border rounded-2xl bg-[#fafafa] space-y-4">
                      <h5 className="font-extrabold text-[12px] uppercase text-[#212c46] tracking-wider flex items-center gap-2">
                        <Lock size={16} className="text-amber-500" /> Payslip Document Passcode protection
                      </h5>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[12.5px] font-extrabold text-[#212c46] block">Enable password requirement</span>
                          <span className="text-[10px] text-[#7a8b95] block">Require 4-digit token validation from employees in portal.</span>
                        </div>
                        <input type="checkbox" checked={settings.passwordProtection} onChange={e => setSettings({...settings, passwordProtection: e.target.checked})} className="w-4 h-4 accent-[#212c46] cursor-pointer" />
                      </div>
                      {settings.passwordProtection && (
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#7a8b95] block mb-1">Default Fallback Passcode</label>
                          <input type="text" maxLength={4} value={settings.defaultPasscode} onChange={e => setSettings({...settings, defaultPasscode: e.target.value.replace(/\D/g, '')})} className="w-48 border font-mono tracking-widest text-center rounded-xl px-4 py-2 text-[12px] font-bold outline-none focus:border-[#212c46]" />
                        </div>
                      )}
                    </div>

                    {/* Bank Routing Options */}
                    <div className="p-5 border rounded-2xl bg-[#fafafa] space-y-4">
                      <h5 className="font-extrabold text-[12px] uppercase text-[#212c46] tracking-wider flex items-center gap-2">
                        <Icons.Compass size={16} className="text-[#657f4d]" /> Bank Dispatch Exporter Settings
                      </h5>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#7a8b95] block mb-1">Default Outbound Routing File Spec</label>
                        <select value={settings.selectedRoutingFormat} onChange={e => setSettings({...settings, selectedRoutingFormat: e.target.value})} className="w-full border rounded-xl px-4 py-2 text-[12px] font-black bg-white">
                          <option value="KBANK_BIZ">KASIKORNBANK (KBANK BizPortal Format)</option>
                          <option value="SCB_BIZ">Siam Commercial Bank (SCB Business Connect)</option>
                          <option value="BBL_CORP">Bangkok Bank (BBL Corporate Finance CSV)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button onClick={() => alert('Global configurations saved in memory successfully!')} className="bg-[#212c46] text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md hover:bg-[#414757] flex items-center gap-2">
                        <Icons.CheckCircle size={14} /> Update Parameters
                      </button>
                    </div>

                  </div>
                </div>
              </div>)
            )}

            {/* SPACING SPACER FOR FOOTER PADDING AS DIRECTED (mt-8 = 32px) */}
            <div className="mt-8" />
            
        </div>
      </div>
      
      {toast && (
        <div className="fixed bottom-5 right-5 z-[200] bg-[#212c46] text-white border-l-4 border-[#b58c4f] px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-black animate-slideIn">
          <Icons.CheckCircle2 size={16} className="text-[#508660]" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
