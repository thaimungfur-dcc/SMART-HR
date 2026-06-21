import { UserGuidePanel } from '../../components/shared/UserGuidePanel';
"use client";;
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Banknote, Search, Plus, Pencil, Trash2, X, Save, ChevronLeft, ChevronRight, 
  HelpCircle, CheckCircle2, AlertTriangle, Building2, Briefcase, 
  MapPin, HeartPulse, Calculator, TrendingUp, Users, DollarSign,
  Lock, Eye, EyeOff, Receipt, PiggyBank, Scale, History, Award, Coffee, Zap, Database,
  Download, Clock, ShieldCheck, RefreshCw, Calendar, User, ShieldAlert, ListTree, 
  List, LayoutGrid, UserPlus, UserCog, Upload, Link, Check, BookOpen, Trash, Settings
} from 'lucide-react';
import { DraggableModal } from '../../components/shared/DraggableModal';
import { dbSync } from '../../services/dbSync';

const THEME = {
  primary: '#851c24', 
  primaryDark: '#932c2e', 
  accent: '#b58c4f', 
  textMain: '#2f2926', 
  textMuted: '#414757', 
  textSubtle: '#606a5f', 
  palette: { 
    gold: '#b58c4f', rust: '#932c2e', copper: '#c5724e', maroon: '#851c24', brick: '#b22026', charcoal: '#414757', rose: '#ab7d82', cream: '#f3f3f1', forestDark: '#1b2826', ochre: '#a1691e', slateDark: '#606a5f', olive: '#508660', cerulean: '#3f809e', navyBlue: '#212c46'
  }
};

const INITIAL_SALARIES = [
  { 
    id: 'sal-1', empId: 'EMP-24001', nameTh: 'สมชาย มุ่งมั่น', nameEn: 'Somchai Mungmun', 
    image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
    dept: 'IT', jobTitle: 'Senior Developer', 
    payType: 'Monthly',
    baseSalary: 65000, workingDays: 30,
    allowancePos: 5000, allowanceIncentive: 2000, allowanceTravel: 2000, allowanceMeal: 1500, allowanceAccommodation: 0, allowanceRisk: 0,
    otherIncomes: [{ label: 'Internet Allowance', amount: 500 }],
    deductTax: 3500, deductSSO: 750, deductHousing: 0, deductLoan: 0,
    otherDeductions: [],
    bank: 'KBank', bankAcc: '012-3-45678-9',
    status: 'Active', lastUpdate: '2024-01-15',
    history: [
        { date: '2023-01-15', baseSalary: 60000, payType: 'Monthly', reason: 'Annual Increment 2023' },
        { date: '2024-01-15', baseSalary: 65000, payType: 'Monthly', reason: 'Promotion to Senior' }
    ]
  },
  { 
    id: 'sal-2', empId: 'EMP-22045', nameTh: 'วิภาดา แสงงาม', nameEn: 'Wipada Saengngam', 
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    dept: 'QA', jobTitle: 'QA Manager', 
    payType: 'Monthly',
    baseSalary: 85000, workingDays: 30,
    allowancePos: 10000, allowanceIncentive: 0, allowanceTravel: 3500, allowanceMeal: 1500, allowanceAccommodation: 2000, allowanceRisk: 0,
    otherIncomes: [],
    deductTax: 5800, deductSSO: 750, deductHousing: 0, deductLoan: 0,
    otherDeductions: [],
    bank: 'SCB', bankAcc: '987-6-54321-0',
    status: 'Active', lastUpdate: '2023-12-01',
    history: [
        { date: '2022-12-01', baseSalary: 80000, payType: 'Monthly', reason: 'New Hire' },
        { date: '2023-12-01', baseSalary: 85000, payType: 'Monthly', reason: 'Annual Increment 2024' }
    ]
  },
  { 
    id: 'sal-3', empId: 'EMP-24050', nameTh: 'สมหมาย ใจดี', nameEn: 'Sommai Jaidee', 
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    dept: 'PRODUCTION', jobTitle: 'Production Sup', 
    payType: 'Daily',
    baseSalary: 550, workingDays: 26,
    allowancePos: 0, allowanceIncentive: 1500, allowanceTravel: 1000, allowanceMeal: 1500, allowanceAccommodation: 0, allowanceRisk: 500,
    otherIncomes: [{ label: 'Shift Allowance', amount: 1000 }],
    deductTax: 0, deductSSO: 750, deductHousing: 1500, deductLoan: 500,
    otherDeductions: [],
    bank: 'BBL', bankAcc: '111-2-33344-5',
    status: 'Active', lastUpdate: '2024-05-15',
    history: [
        { date: '2024-05-15', baseSalary: 550, payType: 'Daily', reason: 'New Hire (Daily Worker)' }
    ]
  }
];

const SYSTEM_COMPENSATION_CONFIGS = [
  { id: 'cfg_base_salary', label: 'Base Salaries Baseline', icon: DollarSign, desc: 'ฐานเงินเดือนหลักประจำและอัตราจ้างพนักงานรายวัน (Base & Daily Baselines)' },
  { id: 'cfg_allowance_pos', label: 'Position Allowance Gate', icon: Briefcase, desc: 'ค่าตำแหน่งผู้จัดการ หัวหน้างาน และระดับชำนาญการครึ่งปีหลัง' },
  { id: 'cfg_allowance_inc', label: 'Performance Incentives Lock', icon: Award, desc: 'เงินรางวัลตามยอดส่งและสิทธิทำงานคงที่ของฝ่ายผลิตและขาย' },
  { id: 'cfg_allowance_std', label: 'Standard Welfare Outlays', icon: Coffee, desc: 'ประเภทรวมค่าเดินทาง ค่าอาหาร ค่าพาหนะเดินทาง และค่าสวัสดิการที่ทำงาน' },
  { id: 'cfg_deduct_tax', label: 'Withholding Tax Matrix', icon: Receipt, desc: 'สูตรหักบัญชีภาษี พ.ง.ด. 1 ของบุคลากรถาวร ณ ที่จ่ายรายเดี่ยว' },
  { id: 'cfg_sso_auto', label: 'Social Security Limit Gate', icon: HeartPulse, desc: 'ตัวสมทบกองทุนประกันสังคม 5% อัตโนมัติ สูงสุดไม่เกิน 750 บาท' }
];

const formatCurrency = (amount: number) => {
  if (isNaN(amount)) return '฿0';
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
};

// Safe addition helper to completely avoid NaN or Page-Crash output errors
const sumSafe = (...vals: (number | undefined | null)[]) => {
  return vals.reduce((acc: number, cur) => acc + (Number(cur) || 0), 0);
};

interface SalaryMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: any;
  onSave: (record: any) => void;
}

function SalaryMasterModal({ isOpen, onClose, record, onSave }: SalaryMasterModalProps) {
    const [activeTab, setActiveTab] = useState('structure');
    const [formData, setFormData] = useState<any>(null);
    const [adjustReason, setAdjustReason] = useState('');

    useEffect(() => {
        if (isOpen && record) {
            const data = JSON.parse(JSON.stringify(record));
            if (!data.otherIncomes) data.otherIncomes = [];
            if (!data.otherDeductions) data.otherDeductions = [];
            if (data.workingDays === undefined) data.workingDays = 26;
            
            setFormData(data);
            setAdjustReason('');
            setActiveTab('structure');
        }
    }, [isOpen, record]);

    if (!isOpen || !formData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'payType') {
            setFormData((prev: any) => ({ ...prev, [name]: value }));
        } else {
            const numValue = value === '' ? 0 : Number(value);
            setFormData((prev: any) => ({ ...prev, [name]: numValue }));
        }
    };

    const handleAddOther = (type: 'otherIncomes' | 'otherDeductions') => {
        setFormData((prev: any) => ({
            ...prev,
            [type]: [...(prev[type] || []), { label: '', amount: 0 }]
        }));
    };

    const handleRemoveOther = (type: 'otherIncomes' | 'otherDeductions', index: number) => {
        setFormData((prev: any) => {
            const newArray = [...prev[type]];
            newArray.splice(index, 1);
            return { ...prev, [type]: newArray };
        });
    };

    const handleOtherChange = (type: 'otherIncomes' | 'otherDeductions', index: number, field: string, value: string) => {
        setFormData((prev: any) => {
            const newArray = [...prev[type]];
            newArray[index] = { 
                ...newArray[index], 
                [field]: field === 'amount' ? (value === '' ? 0 : Number(value)) : value 
            };
            return { ...prev, [type]: newArray };
        });
    };

    const handleAutoCalculateSSO = () => {
        const base = formData.payType === 'Daily' ? sumSafe(formData.baseSalary) * sumSafe(formData.workingDays || 26) : sumSafe(formData.baseSalary);
        const calcSSO = Math.round(Math.min(base * 0.05, 750));
        setFormData((prev: any) => ({ ...prev, deductSSO: calcSSO }));
    };

    const isBaseOrTypeChanged = record && (formData.baseSalary !== record.baseSalary || formData.payType !== record.payType);

    const baseMonthlyEq = formData.payType === 'Daily' ? sumSafe(formData.baseSalary) * sumSafe(formData.workingDays || 0) : sumSafe(formData.baseSalary);
    const totalOtherIncome = Array.isArray(formData.otherIncomes) ? formData.otherIncomes.reduce((sum: number, item: any) => sum + sumSafe(item.amount), 0) : 0;
    const totalOtherDeduct = Array.isArray(formData.otherDeductions) ? formData.otherDeductions.reduce((sum: number, item: any) => sum + sumSafe(item.amount), 0) : 0;

    const fixedGross = baseMonthlyEq + sumSafe(
      formData.allowancePos, 
      formData.allowanceIncentive, 
      formData.allowanceTravel, 
      formData.allowanceMeal, 
      formData.allowanceAccommodation, 
      formData.allowanceRisk, 
      totalOtherIncome
    );
    const fixedDeductions = sumSafe(
      formData.deductTax, 
      formData.deductSSO, 
      formData.deductHousing, 
      formData.deductLoan, 
      totalOtherDeduct
    );
    const fixedNet = fixedGross - fixedDeductions;

    const handleSubmitSave = (e: React.FormEvent) => {
        e.preventDefault();
        
        let updatedHistory = [...(formData.history || [])];

        if (isBaseOrTypeChanged) {
            if (!adjustReason.trim()) {
                alert("กรุณาระบุเหตุผลการปรับเงินเดือนในแท็บปรับปรุงโครงสร้างก่อนบันทึก");
                return;
            }
            updatedHistory.unshift({
                date: new Date().toISOString().split('T')[0],
                baseSalary: formData.baseSalary,
                payType: formData.payType,
                reason: adjustReason
            });
        }

        onSave({ 
            ...formData, 
            history: updatedHistory,
            lastUpdate: new Date().toISOString().split('T')[0] 
        });
        onClose();
    };

    const NumberInput = ({ label, name, icon: Icon, isReadOnly = false, hint = null }: any) => (
        <div className="flex flex-col">
            <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest flex items-center justify-between mb-1.5">
                <span>{label}</span>
                {hint && <span className="text-[8px] text-[#3f809e] bg-[#3f809e]/10 px-1.5 py-0.5 rounded font-black uppercase font-mono">{hint}</span>}
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {Icon && <Icon size={14} className="text-[#7a8b95]" />}
                </div>
                <input 
                    type="number" name={name} value={formData[name] === 0 ? '' : formData[name] || ''} onChange={handleChange} 
                    disabled={isReadOnly}
                    className="w-full border border-[#cbd5e1]/40 rounded-xl pl-9 pr-4 py-2.5 text-[12px] font-black outline-none transition-all font-mono text-right bg-[#f8fafc]/90 text-[#212c46] focus:border-[#b58c4f] focus:ring-1 focus:ring-[#b58c4f]/20 shadow-xs"
                />
            </div>
        </div>
    );

    return (
        <DraggableModal
            isOpen={isOpen}
            onClose={onClose}
            width="max-w-[950px]"
            customHeader={
                <div className="bg-[#212c46] px-5 py-4 flex justify-between items-center shrink-0 border-b-2 border-[#b58c4f]">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#851c24]/20 text-[#d96245] flex items-center justify-center border border-[#851c24]/30 shadow-inner">
                            <Scale size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">SALARY MASTER CONFIG</h3>
                            <span className="text-[9px] font-black text-[#f3f3f1] bg-[#851c24] px-2 py-0.5 rounded mt-1.5 inline-block uppercase tracking-widest border border-[#932c2e] shadow-sm font-mono">Employee: {formData.empId}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-[#932c2e] transition-all bg-white/10 hover:bg-white/20 p-1.5 rounded-full"><X size={16} /></button>
                </div>
            }
        >
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white min-h-[500px]">
                {/* Left Panel: Profile */}
                <div className="w-full md:w-64 bg-[#f3f4f6]/40 border-r border-[#e2e8f0] flex flex-col shrink-0 p-6">
                    <div className="mb-6 flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden border border-[#cbd5e1] shadow-sm mb-3 bg-white">
                            <img src={formData.image} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <h4 className="text-[14px] font-black text-[#212c46] uppercase tracking-tight">{formData.nameEn}</h4>
                        <p className="text-[11px] font-bold text-[#414757] mt-0.5">{formData.nameTh}</p>
                        <span className="mt-2 text-[10px] font-black bg-[#e2e8f0] text-[#475569] px-3 py-1 rounded-full uppercase border border-[#cbd5e1]">{formData.jobTitle}</span>
                    </div>

                    <div className="space-y-4 mb-6 text-[11px] font-medium text-[#414757] bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-xs">
                        <div className="flex justify-between border-b border-[#e2e8f0] pb-2">
                            <span className="text-[#64748b] uppercase tracking-widest text-[9px] font-black">Department</span>
                            <span className="font-bold text-right text-[#212c46]">{formData.dept}</span>
                        </div>
                        <div className="flex justify-between border-b border-[#e2e8f0] pb-2">
                            <span className="text-[#64748b] uppercase tracking-widest text-[9px] font-black">Bank</span>
                            <span className="font-bold text-right text-[#212c46]">{formData.bank}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[#64748b] uppercase tracking-widest text-[9px] font-black">Account No.</span>
                            <span className="font-black font-mono text-[#3f809e]">{formData.bankAcc}</span>
                        </div>
                    </div>

                    <div className="mt-auto space-y-2">
                        <p className="text-[9px] font-black text-[#64748b] uppercase tracking-widest text-center border-b border-[#e2e8f0] pb-2 mb-2">Automation tools</p>
                        <button type="button" onClick={handleAutoCalculateSSO} className="w-full bg-white border border-[#508660]/40 text-[#508660] hover:bg-[#508660]/10 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer">
                            <Zap size={13}/> Calc SSO (5%)
                        </button>
                    </div>
                </div>
                
                {/* Right Panel: Editor with Form */}
                <form id="salaryForm" onSubmit={handleSubmitSave} className="flex-1 flex flex-col overflow-hidden bg-white">
                    {/* Internal Tabs */}
                    <div className="flex px-6 pt-4 border-b border-[#e2e8f0] gap-6 shrink-0 bg-[#f8fafc]">
                        <button type="button" onClick={() => setActiveTab('structure')} className={`pb-3 px-2 border-b-[3px] transition-all font-black text-[11px] uppercase tracking-widest cursor-pointer ${activeTab === 'structure' ? 'border-[#851c24] text-[#851c24]' : 'border-transparent text-[#64748b] hover:text-[#212c46]'}`}>
                            <PiggyBank size={14} className="inline mr-1.5 -mt-0.5" /> Compensation Structure
                        </button>
                        <button type="button" onClick={() => setActiveTab('history')} className={`pb-3 px-2 border-b-[3px] transition-all font-black text-[11px] uppercase tracking-widest cursor-pointer ${activeTab === 'history' ? 'border-[#851c24] text-[#851c24]' : 'border-transparent text-[#64748b] hover:text-[#212c46]'}`}>
                            <History size={14} className="inline mr-1.5 -mt-0.5" /> Adjustment History
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        {/* TAB: Structure */}
                        <div className={`space-y-6 animate-fadeIn ${activeTab === 'structure' ? 'block' : 'hidden'}`}>
                            
                            <div className="bg-[#f1f5f9] p-4 rounded-xl border border-[#cbd5e1]/60 flex items-center gap-3">
                                <Database size={18} className="text-[#851c24]" />
                                <p className="text-[11px] font-medium text-[#414757]">
                                    <strong className="text-[#212c46]">Master Data Note:</strong> ข้อมูลในหน้านี้คือ <b>ฐานข้อมูลคงที่ (Fixed Baseline)</b> ตัวเลขประเมินสุทธิด้านล่างจะไม่รวมรายการแปรผันรายเดือน เช่น OT หรือหักสาย/ขาดงาน
                                </p>
                            </div>

                            {/* INCOME SECTION */}
                            <div className="bg-[#fefaf0] p-5 rounded-2xl border border-[#b58c4f]/30 shadow-xs relative">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-[12px] font-black text-[#508660] uppercase tracking-widest flex items-center gap-2"><PiggyBank size={14}/> Fixed Income / Earnings</h4>
                                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-[#e2e8f0] shadow-sm">
                                        <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest">Pay Type:</label>
                                        <select name="payType" value={formData.payType} onChange={handleChange} className="text-[11px] font-bold text-[#212c46] outline-none bg-transparent cursor-pointer font-sans">
                                            <option value="Monthly">Monthly</option>
                                            <option value="Daily">Daily</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                                    {formData.payType === 'Daily' ? (
                                        <>
                                            <NumberInput label="Daily Rate (ค่าจ้างรายวัน)" name="baseSalary" icon={DollarSign} hint="Fixed" />
                                            <NumberInput label="Std. Working Days" name="workingDays" icon={Calendar} hint="Reference" />
                                        </>
                                    ) : (
                                        <NumberInput label="Base Salary (เงินเดือนพื้นฐาน)" name="baseSalary" icon={DollarSign} hint="Fixed" />
                                    )}
                                    <NumberInput label="Position Allowance (ค่าตำแหน่ง)" name="allowancePos" icon={Briefcase} hint="Fixed" />
                                    <NumberInput label="Fixed Incentive (เงินตามผลงาน)" name="allowanceIncentive" icon={Award} hint="Fixed" />
                                    <NumberInput label="Travel Allowance (ค่าเดินทาง)" name="allowanceTravel" icon={MapPin} hint="Fixed" />
                                    <NumberInput label="Meal Allowance (ค่าอาหาร)" name="allowanceMeal" icon={Coffee} hint="Fixed" />
                                    <NumberInput label="Accommodation (ค่าที่พัก)" name="allowanceAccommodation" icon={Building2} hint="Fixed" />
                                    <NumberInput label="Risk Allowance (ค่าความเสี่ยง)" name="allowanceRisk" icon={ShieldCheck} hint="Fixed" />
                                </div>
                                
                                {/* Dynamic Other Incomes */}
                                {formData.otherIncomes && formData.otherIncomes.length > 0 && (
                                    <div className="mt-4 space-y-3 pt-3 border-t border-dashed border-[#b58c4f]/30">
                                        {formData.otherIncomes.map((item: any, index: number) => (
                                            <div key={index} className="flex items-end gap-3 bg-white/50 p-2 rounded-xl border border-[#b58c4f]/20">
                                                <div className="flex-1">
                                                    <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1.5">Other Fixed Income Name</label>
                                                    <input type="text" value={item.label} onChange={(e) => handleOtherChange('otherIncomes', index, 'label', e.target.value)} placeholder="e.g. Skill Allowance" className="w-full bg-white border border-[#e2e8f0] rounded-lg px-3 py-2 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#508660]" />
                                                </div>
                                                <div className="w-1/3">
                                                    <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1.5">Amount</label>
                                                    <input type="number" value={item.amount === 0 ? '' : item.amount} onChange={(e) => handleOtherChange('otherIncomes', index, 'amount', e.target.value)} placeholder="0" className="w-full bg-white border border-[#e2e8f0] rounded-lg px-3 py-2 text-[12px] font-black text-[#212c46] outline-none focus:border-[#508660] text-right font-mono" />
                                                </div>
                                                <button type="button" onClick={() => handleRemoveOther('otherIncomes', index)} className="p-2.5 text-[#b22026] hover:bg-[#b22026]/10 rounded-lg transition-colors border border-transparent hover:border-[#b22026]/20 mb-0.5 cursor-pointer">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <div className="mt-3 flex justify-start">
                                    <button type="button" onClick={() => handleAddOther('otherIncomes')} className="text-[10px] font-black uppercase tracking-widest text-[#508660] hover:bg-[#508660]/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-[#508660]/20 font-sans">
                                        <Plus size={14} /> Add Fixed Income
                                    </button>
                                </div>

                                <div className="mt-4 flex justify-between items-center border-t border-[#b58c4f]/35 pt-3">
                                    <span className="text-[11px] font-black text-[#414757] uppercase tracking-widest">Total Fixed Gross (Reference)</span>
                                    <span className="text-[16px] font-black font-mono text-[#508660]">{formatCurrency(fixedGross)}</span>
                                </div>
                            </div>

                            {/* DEDUCTION SECTION */}
                            <div className="bg-[#fef2f2] p-5 rounded-2xl border border-[#eedbe2] shadow-xs">
                                <h4 className="text-[12px] font-black text-[#b22026] uppercase tracking-widest mb-4 flex items-center gap-2"><TrendingUp size={14} className="rotate-180"/> Fixed Deductions</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <NumberInput label="Tax Deduction (ภาษีหัก ณ ที่จ่าย)" name="deductTax" icon={Receipt} hint="Fixed" />
                                    <NumberInput label="Social Security (ประกันสังคม)" name="deductSSO" icon={HeartPulse} hint="Auto-Calc" />
                                    <NumberInput label="Housing/Rent (ค่าบ้านพัก)" name="deductHousing" icon={Building2} hint="Fixed" />
                                    <NumberInput label="Loans (เงินกู้ยืม)" name="deductLoan" icon={Banknote} hint="Fixed" />
                                </div>

                                {/* Dynamic Other Deductions */}
                                {formData.otherDeductions && formData.otherDeductions.length > 0 && (
                                    <div className="mt-4 space-y-3 pt-3 border-t border-dashed border-[#eedbe2]">
                                        {formData.otherDeductions.map((item: any, index: number) => (
                                            <div key={index} className="flex items-end gap-3 bg-white/50 p-2 rounded-xl border border-[#eedbe2]/50">
                                                <div className="flex-1">
                                                    <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1.5">Other Fixed Deduction Name</label>
                                                    <input type="text" value={item.label} onChange={(e) => handleOtherChange('otherDeductions', index, 'label', e.target.value)} placeholder="e.g. Welfare Fund" className="w-full bg-white border border-[#eedbe2] rounded-lg px-3 py-2 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#b22026]" />
                                                </div>
                                                <div className="w-1/3">
                                                    <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1.5">Amount</label>
                                                    <input type="number" value={item.amount === 0 ? '' : item.amount} onChange={(e) => handleOtherChange('otherDeductions', index, 'amount', e.target.value)} placeholder="0" className="w-full bg-white border border-[#eedbe2] rounded-lg px-3 py-2 text-[12px] font-black text-[#212c46] outline-none focus:border-[#b22026] text-right font-mono" />
                                                </div>
                                                <button type="button" onClick={() => handleRemoveOther('otherDeductions', index)} className="p-2.5 text-[#b22026] hover:bg-[#b22026]/10 rounded-lg transition-colors border border-transparent hover:border-[#b22026]/20 mb-0.5 cursor-pointer">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-3 flex justify-start">
                                    <button type="button" onClick={() => handleAddOther('otherDeductions')} className="text-[10px] font-black uppercase tracking-widest text-[#b22026] hover:bg-[#b22026]/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-[#b22026]/20 font-sans">
                                        <Plus size={14} /> Add Fixed Deduction
                                    </button>
                                </div>

                                <div className="mt-4 flex justify-between items-center border-t border-[#eedbe2] pt-3">
                                    <span className="text-[11px] font-black text-[#414757] uppercase tracking-widest">Total Fixed Deductions</span>
                                    <span className="text-[16px] font-black font-mono text-[#b22026]">{formatCurrency(fixedDeductions)}</span>
                                </div>
                            </div>

                            {/* Dynamic Adjustment Reason */}
                            {isBaseOrTypeChanged && (
                                <div className="bg-[#fff7ed] p-5 rounded-2xl border border-[#fdba74] shadow-xs animate-fadeIn flex-1 flex-col flex min-h-0 pb-6">
                                    <label className="text-[11px] font-black text-[#9a3412] uppercase tracking-widest block mb-2 flex items-center gap-2"><History size={14}/> Adjustment Reason (Required)</label>
                                    <input 
                                        type="text" value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} required
                                        placeholder="e.g. Annual Increment, Promotion, Re-evaluation..." 
                                        className="w-full bg-white border border-[#fdba74] rounded-xl px-4 py-2.5 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#c2410c] focus:ring-1 focus:ring-[#c2410c]/20 shadow-xs transition-all" 
                                    />
                                </div>
                            )}

                            <div className="bg-[#212c46] p-5 rounded-2xl border border-[#1e293b] shadow-md flex justify-between items-center relative overflow-hidden">
                                <div className="flex flex-col relative z-10 text-white">
                                    <span className="text-[11px] font-black text-[#38bdf8] uppercase tracking-widest">Baseline Net Payable (Reference)</span>
                                    <span className="text-[9px] text-[#93c5fd] font-medium mt-0.5">Excludes dynamic monthly variables (e.g. OT, Lateness, Deducted Days)</span>
                                </div>
                                <span className="text-[24px] font-black font-mono text-white tracking-wider relative z-10">{formatCurrency(fixedNet)}</span>
                            </div>
                        </div>

                        {/* TAB: History */}
                        <div className={`space-y-4 animate-fadeIn ${activeTab === 'history' ? 'block' : 'hidden'}`}>
                            {formData.history && formData.history.length > 0 ? (
                                formData.history.map((h: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center p-5 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl shadow-sm hover:border-[#b58c4f] transition-colors">
                                       <div className="flex items-start gap-4">
                                           <div className="w-10 h-10 rounded-xl bg-[#212c46] text-white flex items-center justify-center shrink-0 border border-[#1e293b] shadow-sm">
                                               <History size={18}/>
                                           </div>
                                           <div>
                                              <p className="font-black text-[#212c46] text-[13px] uppercase tracking-wide">{h.reason}</p>
                                              <p className="text-[11px] text-[#64748b] mt-1 font-bold">Effective Date: <span className="font-mono text-[#475569]">{h.date}</span></p>
                                           </div>
                                       </div>
                                       <div className="text-right">
                                          <p className="font-black text-[#508660] font-mono text-[16px]">{formatCurrency(h.baseSalary)}</p>
                                          <p className="text-[10px] uppercase font-black tracking-widest text-[#b58c4f] mt-0.5 border border-[#fce8d8] bg-[#fdf5ed] px-2 py-0.5 rounded-md inline-block font-sans">{h.payType}</p>
                                       </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 text-[#64748b] font-black text-[12px] uppercase">No salary adjustment history found.</div>
                            )}
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex justify-end gap-3 shrink-0">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white border border-[#e2e8f0] text-[#475569] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#f1f5f9] hover:text-[#212c46] transition-all shadow-sm cursor-pointer font-sans">Cancel</button>
                        <button type="submit" className="bg-[#851c24] text-white px-8 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md hover:bg-[#b22026] transition-all flex items-center gap-2 border border-[#932c2e] cursor-pointer font-sans">
                            <Save size={16}/> Save Master Structure
                        </button>
                    </div>
                </form>
            </div>
        </DraggableModal>
    );
}

function parseEmployeeName(emp: any) {
  let nameTh = emp.nameTh || '';
  let nameEn = emp.nameEn || '';
  
  if (emp.name && (!nameTh || !nameEn)) {
    const match = emp.name.match(/^([^(]+)\s*(?:\(([^)]+)\))?/);
    if (match) {
      if (!nameTh) nameTh = match[1]?.trim() || '';
      if (!nameEn) nameEn = match[2]?.trim() || match[1]?.trim() || '';
    }
  }
  
  return {
    nameTh: nameTh || emp.name || '-',
    nameEn: nameEn || emp.name || '-'
  };
}

function ToastNotification({ message, onClose }: { message: string | null; onClose: () => void }) {
    if (!message) return null;
    return createPortal(
        <div className="fixed bottom-6 right-6 z-[1000] animate-fadeIn bg-white border-l-4 border-[#851c24] shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-5 py-4 rounded-xl flex items-center gap-3">
            <CheckCircle2 size={18} className="text-[#851c24]" />
            <span className="text-[11px] font-black text-[#212c46] uppercase tracking-widest font-sans">{message}</span>
            <button onClick={onClose} className="ml-4 text-[#64748b] hover:text-[#b22026]"><X size={14}/></button>
        </div>,
        document.body
    );
}

export default function SalaryMaster() {
  const [activeTab, setActiveTab] = useState<'registry'|'settings'>('registry');
  const [records, setRecords] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showValues, setShowValues] = useState(false); // set to false by default as requested to match showValues image status
  const [isLoading, setIsLoading] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [modalState, setModalState] = useState<{ isOpen: boolean; record: any }>({ isOpen: false, record: null });
  const [toast, setToast] = useState<string | null>(null);

  const [confidentialityMap, setConfidentialityMap] = useState<Record<string, boolean>>({
    'cfg_base_salary': true,
    'cfg_deduct_tax': true
  });

  const fetchAndLoad = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      const [response, empResponse] = await Promise.all([
        dbSync.read('salary_master', forceRefresh),
        dbSync.read('employees', forceRefresh).catch(() => null)
      ]);

      let loadedItems: any[] = [];
      if (Array.isArray(response)) {
          loadedItems = response;
      } else if (response && response.status === 'success' && response.data && Array.isArray(response.data.items)) {
          loadedItems = response.data.items;
      } else if (response && Array.isArray(response.items)) {
          loadedItems = response.items;
      }

      let empList: any[] = [];
      if (empResponse && empResponse.status === 'success' && empResponse.data && Array.isArray(empResponse.data.items)) {
          empList = empResponse.data.items;
      } else if (empResponse && Array.isArray(empResponse.items)) {
          empList = empResponse.items;
      } else if (Array.isArray(empResponse)) {
          empList = empResponse;
      }

      let baseRecords = loadedItems.length > 0 ? loadedItems : INITIAL_SALARIES;
      let hasPendingSync = false;
      let mergedRecords = JSON.parse(JSON.stringify(baseRecords));

      if (empList.length > 0) {
          const salaryMapByEmpId = new Map(mergedRecords.map((r: any) => [String(r.empId || '').toLowerCase(), r]));

          empList.forEach((emp: any) => {
              const empId = emp.staffId || emp.employeeId;
              if (!empId) return;

              const parsedName = parseEmployeeName(emp);
              const key = String(empId).toLowerCase();

              const existingSal: any = salaryMapByEmpId.get(key);
              if (existingSal) {
                  let updated = false;
                  const thVal = parsedName.nameTh || existingSal.nameTh || '-';
                  const enVal = parsedName.nameEn || existingSal.nameEn || '-';
                  const deptVal = emp.department || emp.dept || existingSal.dept || '-';
                  const jtVal = emp.position || emp.jobTitle || existingSal.jobTitle || '-';
                  
                  if (existingSal.nameTh !== thVal) { existingSal.nameTh = thVal; updated = true; }
                  if (existingSal.nameEn !== enVal) { existingSal.nameEn = enVal; updated = true; }
                  if (existingSal.dept !== deptVal) { existingSal.dept = deptVal; updated = true; }
                  if (existingSal.jobTitle !== jtVal) { existingSal.jobTitle = jtVal; updated = true; }
                  const avatarImg = emp.image || emp.avatar || existingSal.image || '';
                  if (existingSal.image !== avatarImg) { existingSal.image = avatarImg; updated = true; }
                  const empStatus = emp.workStatus || emp.status || existingSal.status || 'Active';
                  if (existingSal.status !== empStatus) { existingSal.status = empStatus; updated = true; }
                  if (updated) {
                      hasPendingSync = true;
                  }
              } else {
                  const isPermanent = emp.jobStatus === 'Permanent' || emp.position === 'HR Manager' || emp.position === 'Senior Accountant' || emp.position === 'IT Lead';
                  const defaultBase = isPermanent ? 15000 : 350;
                  const newSal = {
                      id: `sal-${empId}`,
                      empId: empId,
                      nameTh: parsedName.nameTh,
                      nameEn: parsedName.nameEn,
                      image: emp.image || emp.avatar || '',
                      dept: emp.department || emp.dept || '-',
                      jobTitle: emp.position || emp.jobTitle || '-',
                      payType: isPermanent ? 'Monthly' : 'Daily',
                      baseSalary: defaultBase,
                      workingDays: isPermanent ? 30 : 26,
                      allowancePos: 0,
                      allowanceIncentive: 0,
                      allowanceTravel: 0,
                      allowanceMeal: 0,
                      allowanceAccommodation: 0,
                      allowanceRisk: 0,
                      otherIncomes: [],
                      deductTax: 0,
                      deductSSO: 0,
                      deductHousing: 0,
                      deductLoan: 0,
                      otherDeductions: [],
                      bank: emp.bankName || emp.bank || 'KBank',
                      bankAcc: emp.bankAccount || emp.bankAcc || '',
                      status: emp.workStatus || emp.status || 'Active',
                      lastUpdate: new Date().toISOString().slice(0, 10),
                      history: []
                  };
                  mergedRecords.push(newSal);
                  hasPendingSync = true;
              }
          });
      }

      if (hasPendingSync || loadedItems.length === 0 || forceRefresh) {
          await dbSync.write('salary_master', mergedRecords);
      }
      setRecords(mergedRecords);
      if (forceRefresh) {
          setToast("Data Refreshed & Synced successfully! / ซิงค์ข้อมูลเรียบร้อย!");
      }
    } catch (err) {
      console.error('[SalaryMaster] Loading/Sync failed: ', err);
      setRecords(INITIAL_SALARIES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
      fetchAndLoad();
  }, []);

  const filteredRecords = useMemo(() => {
      return records.filter(r => {
          const nameThStr = r.nameTh ? String(r.nameTh).toLowerCase() : '';
          const nameEnStr = r.nameEn ? String(r.nameEn).toLowerCase() : '';
          const empIdStr = r.empId ? String(r.empId).toLowerCase() : '';
          const deptStr = r.dept ? String(r.dept).toLowerCase() : '';
          const matchSearch = nameThStr.includes(search.toLowerCase()) || 
                              nameEnStr.includes(search.toLowerCase()) ||
                              empIdStr.includes(search.toLowerCase());
          const matchDept = filterDept === '' || deptStr === filterDept.toLowerCase();
          return matchSearch && matchDept;
      });
  }, [records, search, filterDept]);

  const currentData = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;

  // Safe Math with sumSafe to prevent NaN errors
  const totalEmp = records.length;
  const avgSalary = records.reduce((sum, r) => {
    const baseline = r.payType === 'Daily' ? sumSafe(r.baseSalary) * sumSafe(r.workingDays || 26) : sumSafe(r.baseSalary);
    return sum + baseline;
  }, 0) / (totalEmp || 1);
  
  const totalPayroll = records.reduce((sum, r) => {
      const baseMonthlyEq = r.payType === 'Daily' ? sumSafe(r.baseSalary) * sumSafe(r.workingDays || 26) : sumSafe(r.baseSalary);
      const otherInc = Array.isArray(r.otherIncomes) ? r.otherIncomes.reduce((acc: number, i: any) => acc + sumSafe(i.amount), 0) : 0;
      const otherDed = Array.isArray(r.otherDeductions) ? r.otherDeductions.reduce((acc: number, d: any) => acc + sumSafe(d.amount), 0) : 0;

      const gross = baseMonthlyEq + sumSafe(
        r.allowancePos, 
        r.allowanceIncentive, 
        r.allowanceTravel, 
        r.allowanceMeal, 
        r.allowanceAccommodation, 
        r.allowanceRisk, 
        otherInc
      );
      const deduct = sumSafe(
        r.deductTax, 
        r.deductSSO, 
        r.deductHousing, 
        r.deductLoan, 
        otherDed
      );
      return sum + (gross - deduct);
  }, 0);

  const departments = useMemo(() => {
    return [...new Set(records.map(e => e.dept).filter(Boolean))];
  }, [records]);

  const handleOpenModal = (record: any) => setModalState({ isOpen: true, record });
  
  const handleSaveRecord = async (updatedData: any) => {
      try {
        const updatedRecords = records.map(r => r.id === updatedData.id ? updatedData : r);
        setRecords(updatedRecords);
        await dbSync.update('salary_master', [updatedData]);
        setToast('Master Data updated successfully.');
        setTimeout(() => setToast(null), 3000);
      } catch (err) {
        console.error(err);
        setToast('Failed to update and sync salary baseline.');
        setTimeout(() => setToast(null), 3000);
      }
  };

  const handleExport = () => {
      setToast('Exporting Payroll baselines matrix to CSV...');
      setTimeout(() => setToast(null), 3000);
  };

  const toggleConfidentiality = (id: string) => {
    setConfidentialityMap(prev => ({ ...prev, [id]: !prev[id] }));
    setToast('Configuration lock state toggled.');
    setTimeout(() => setToast(null), 2500);
  };

  return (
      <div className="flex flex-1 w-full flex-col animate-fadeIn bg-transparent space-y-5 px-4 sm:px-8 py-4 pb-6">
          {/* Floating Action Guide trigger */}
          <button onClick={() => setIsGuideOpen(true)} className="fixed right-0 bg-[#f8fafc] border border-[#e2e8f0] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#851c24] hover:text-white hover:border-[#851c24] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group cursor-pointer" style={{ top: '120px' }}>
              <HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#64748b] group-hover:text-white" />
              <span className="font-black tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[10px] font-mono leading-none">USER GUIDE</span>
          </button>
          <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
          <SalaryMasterModal isOpen={modalState.isOpen} onClose={() => setModalState({isOpen: false, record: null})} record={modalState.record} onSave={handleSaveRecord} />
          <ToastNotification message={toast} onClose={() => setToast(null)} />
          {/* PAGE HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 bg-transparent">
              <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center group cursor-default shrink-0">
                      <div className="absolute inset-0 bg-[#851c24] blur-[15px] opacity-15 rounded-full group-hover:opacity-45 transition-all duration-700"></div>
                      <div className="relative z-10 p-2.5 border border-[#851c24]/40 rounded-2xl bg-white shadow-sm">
                          <Database size={26} strokeWidth={2.5} className="text-[#851c24]" />
                      </div>
                  </div>
                  <div>
                      <div className="flex items-center gap-2">
                          <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none" style={{ fontSize: '26px' }}>
                              SALARY <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#851c24] to-[#b58c4f]">MASTER DATA</span>
                          </h3>
                          <span className="bg-[#851c24] text-white text-[9px] font-black px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider shadow-sm font-mono leading-none">
                              <Lock size={10} strokeWidth={3} /> HR ONLY
                          </span>
                      </div>
                      <p className="text-[10px] font-black text-[#64748b] uppercase tracking-[0.25em] mt-1.5 leading-none">
                          CONFIDENTIAL FIXED BASELINE CONFIGURATION
                      </p>
                  </div>
              </div>
              
              <div className="flex items-center gap-3">
                  <button onClick={() => fetchAndLoad(true)} disabled={isLoading} className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full border text-[10.5px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-xs bg-white text-[#508660] border-[#508660]/35 hover:bg-[#508660]/10 ${isLoading ? 'opacity-40 cursor-not-allowed' : ''}`}>
                      <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} /> {isLoading ? 'Refreshing...' : 'Refresh Data'}
                  </button>
                  
                  <button onClick={() => setShowValues(!showValues)} className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full border text-[10.5px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-xs ${showValues ? 'bg-white text-[#851c24] border-[#851c24]/35 shadow-sm' : 'bg-white text-[#475569] border-[#cbd5e1] hover:text-[#212c46]'}`}>
                      {showValues ? <Eye size={13} /> : <EyeOff size={13} />} {showValues ? 'Hide Values' : 'Show Values'}
                  </button>
                  
                  <div className="bg-white/60 p-1 rounded-full border border-[#cbd5e1]/40 shadow-inner flex items-center gap-0.5">
                      <button onClick={() => setActiveTab('registry')} className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'registry' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#64748b] hover:text-[#851c24]'}`}>
                        <Database size={14} /> Global Registry
                      </button>
                      <button onClick={() => setActiveTab('settings')} className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'settings' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#64748b] hover:text-[#851c24]'}`}>
                        <Settings size={14} /> Config Settings
                      </button>
                  </div>
              </div>
          </div>
          <div className="w-full">
                {activeTab === 'registry' ? (
                    <>
                        {/* KPI CARDS (Precisely Matching the style in Image 1) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5 shrink-0">
                            {/* 1. TOTAL STAFF */}
                            <div className="bg-white/95 px-5 py-4 rounded-3xl border border-[#cbd5e1]/50 shadow-sm flex flex-col justify-between relative overflow-hidden transition-all hover:border-[#b58c4f]">
                                <div className="flex justify-between items-start">
                                    <p className="text-[10px] font-black text-[#64748b] uppercase tracking-widest leading-none">TOTAL STAFF IN REGISTRY</p>
                                    <div className="w-9 h-9 rounded-xl bg-[#64748b]/10 text-[#475569] flex items-center justify-center shrink-0 shadow-inner">
                                        <Users size={16} />
                                    </div>
                                </div>
                                <div className="flex items-end justify-between mt-2">
                                    <p className="text-[28px] font-black leading-none text-[#212c46] font-mono">{totalEmp}</p>
                                    <span className="text-[9px] font-black uppercase text-[#64748b]/80 tracking-widest leading-none flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#508660] animate-pulse"></span> ACTIVE PROFILES
                                    </span>
                                </div>
                            </div>

                            {/* 2. AVG BASE */}
                            <div className="bg-white/95 px-5 py-4 rounded-3xl border border-[#cbd5e1]/50 shadow-sm flex flex-col justify-between relative overflow-hidden transition-all hover:border-[#b58c4f]">
                                <div className="flex justify-between items-start">
                                    <p className="text-[10px] font-black text-[#64748b] uppercase tracking-widest leading-none">AVG. BASE EQV.</p>
                                    <div className="w-9 h-9 rounded-xl bg-[#b58c4f]/15 text-[#b58c4f] flex items-center justify-center shrink-0 shadow-inner">
                                        <TrendingUp size={16} />
                                    </div>
                                </div>
                                <div className="flex items-end justify-between mt-2">
                                    <p className="text-[26px] font-black leading-none text-[#212c46] font-mono">{showValues ? formatCurrency(avgSalary) : '***,***'}</p>
                                    <span className="text-[8.5px] font-black uppercase text-[#475569] tracking-widest leading-none text-right">
                                        MONTHLY<br/>EQUIVALENT
                                    </span>
                                </div>
                            </div>

                            {/* 3. TOTAL FIXED NET */}
                            <div className="bg-white/95 px-5 py-4 rounded-3xl border border-[#cbd5e1]/50 shadow-sm flex flex-col justify-between relative overflow-hidden transition-all hover:border-[#b58c4f]">
                                <div className="flex justify-between items-start">
                                    <p className="text-[10px] font-black text-[#64748b] uppercase tracking-widest leading-none">TOTAL FIXED NET</p>
                                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-[#508660] flex items-center justify-center shrink-0 shadow-inner">
                                        <Banknote size={16} />
                                    </div>
                                </div>
                                <div className="flex items-end justify-between mt-2">
                                    <p className="text-[26px] font-black leading-none text-[#508660] font-mono">{showValues ? formatCurrency(totalPayroll) : '***,***'}</p>
                                    <span className="text-[8.5px] font-black uppercase text-[#64748b] tracking-widest leading-none text-right">
                                        BASELINE<br/>PAYABLE
                                    </span>
                                </div>
                            </div>

                            {/* 4. SYSTEM SECURITY */}
                            <div className="bg-white/95 px-5 py-4 rounded-3xl border border-[#cbd5e1]/50 shadow-sm flex flex-col justify-between relative overflow-hidden transition-all hover:border-[#b58c4f]">
                                <div className="flex justify-between items-start">
                                    <p className="text-[10px] font-black text-[#64748b] uppercase tracking-widest leading-none">SYSTEM SECURITY</p>
                                    <div className="w-9 h-9 rounded-xl bg-[#851c24]/10 text-[#851c24] flex items-center justify-center shrink-0 shadow-inner border border-[#851c24]/10">
                                        <ShieldCheck size={16} />
                                    </div>
                                </div>
                                <div className="flex items-end justify-between mt-2">
                                    <p className="text-[24px] font-black leading-none text-[#b22026] uppercase">LOCKED</p>
                                    <span className="text-[9px] font-black uppercase text-[#64748b]/85 tracking-widest leading-none">
                                        ENCRYPTED DATA
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* MAIN REGISTRY TABLE CARD CONTAINER */}
                        <div className="bg-white rounded-[24px] shadow-lg border border-[#cbd5e1]/45 overflow-hidden flex flex-col animate-fadeIn  flex-1 min-h-0">
                            
                            {/* Toolbar */}
                            <div className="px-6 py-4 border-b border-[#cbd5e1]/40 bg-[#f8fafc] flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                                    <div className="relative min-w-[240px] flex-1 sm:flex-initial">
                                        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#851c24]" />
                                        <input type="text" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search employee..." className="w-full pl-10 pr-5 py-2.5 text-[11.5px] border border-[#cbd5e1] rounded-full font-bold outline-none focus:border-[#851c24] bg-white text-[#212c46] shadow-2xs tracking-tight transition-all placeholder:text-[#64748b]/70" />
                                    </div>
                                    <select value={filterDept} onChange={(e)=>setFilterDept(e.target.value)} className="bg-white border border-[#cbd5e1] rounded-full px-4 py-2 text-[11.5px] font-bold outline-none focus:border-[#851c24] text-[#475569] shadow-2xs cursor-pointer w-44">
                                        <option value="">All Depts</option>
                                        {departments.map((d: any) => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <button onClick={handleExport} className="bg-[#212c46] hover:bg-[#851c24] text-white px-6 py-2.5 rounded-full font-black text-[11px] uppercase tracking-widest shadow-xs transition-all flex items-center gap-2 shrink-0 border border-transparent cursor-pointer font-sans">
                                    <Download size={13} strokeWidth={3} /> Export Data
                                </button>
                            </div>

                            {/* TABLE DESIGN SPECIFIED EXACTLY */}
                            <div className="overflow-x-auto custom-scrollbar bg-white  flex-1 min-h-0">
                                <table className="w-full text-left font-sans border-collapse min-w-[1050px]">
                                    <thead className="bg-[#f8fafc] text-[#475569]">
                                        <tr className="border-b-2 border-[#851c24]">
                                            <th className="py-3 px-5 text-[11px] font-black uppercase tracking-widest">Employee Profile</th>
                                            <th className="py-3 px-5 text-[11px] font-black uppercase tracking-widest">Position & Dept</th>
                                            <th className="py-3 px-5 text-[11px] font-black uppercase tracking-widest text-right">Base / Rate</th>
                                            <th className="py-3 px-5 text-[11px] font-black uppercase tracking-widest text-right">Fixed Allowances</th>
                                            <th className="py-3 px-5 text-[11px] font-black uppercase tracking-widest text-right">Fixed Deductions</th>
                                            <th className="py-3 px-5 text-[11px] font-black uppercase tracking-widest text-right">Fixed Net (Baseline)</th>
                                            <th className="py-3 px-5 text-[11px] font-black uppercase tracking-widest text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-[#cbd5e1]/30">
                                        {currentData.map((item) => {
                                            const otherInc = Array.isArray(item.otherIncomes) ? item.otherIncomes.reduce((sum: number, i: any) => sum + sumSafe(i.amount), 0) : 0;
                                            const otherDed = Array.isArray(item.otherDeductions) ? item.otherDeductions.reduce((sum: number, d: any) => sum + sumSafe(d.amount), 0) : 0;

                                            const baseSalaryCalculated = sumSafe(item.baseSalary);
                                            const baseMonthlyEq = item.payType === 'Daily' ? baseSalaryCalculated * sumSafe(item.workingDays || 26) : baseSalaryCalculated;
                                            
                                            const totalAllowances = sumSafe(
                                              item.allowancePos, 
                                              item.allowanceIncentive, 
                                              item.allowanceTravel, 
                                              item.allowanceMeal, 
                                              item.allowanceAccommodation, 
                                              item.allowanceRisk, 
                                              otherInc
                                            );
                                            const totalDeductionsCalculated = sumSafe(
                                              item.deductTax, 
                                              item.deductSSO, 
                                              item.deductHousing, 
                                              item.deductLoan, 
                                              otherDed
                                            );
                                            
                                            const gross = baseMonthlyEq + totalAllowances;
                                            const net = gross - totalDeductionsCalculated;

                                            return (
                                            <tr key={item.id} className="hover:bg-[#f1f5f9]/20 transition-colors group cursor-pointer" onClick={() => handleOpenModal(item)}>
                                                <td className="py-3 px-5 text-[12px]">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-[#cbd5e1] shadow-xs shrink-0 bg-[#f1f5f9]">
                                                            {item.image ? <img referrerPolicy="no-referrer" src={item.image} alt={item.nameEn} className="w-full h-full object-cover" /> : <User size={18}/>}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-[#212c46] text-[12.5px] leading-tight tracking-tight">{item.empId}</span>
                                                            <span className="font-bold text-[#64748b] text-[11px] leading-none mt-1">{item.nameEn}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-5 text-[12px]">
                                                    <p className="font-black text-[#212c46] text-[12px] leading-tight">{item.jobTitle}</p>
                                                    <p className="font-bold text-[#851c24] text-[9.5px] uppercase mt-1 leading-none">{item.dept}</p>
                                                </td>
                                                <td className="py-3 px-5 text-right text-[12px]">
                                                    <p className="font-black font-mono text-[#212c46] text-[12.5px]">{showValues ? formatCurrency(baseSalaryCalculated) : '***,***'}</p>
                                                    <p className="text-[9px] font-black text-[#3f809e] uppercase tracking-widest mt-1.5 leading-none">/ {item.payType}</p>
                                                </td>
                                                <td className="py-3 px-5 text-right text-[12px]">
                                                    <p className="font-black font-mono text-[#508660] text-[12.5px]">+{showValues ? formatCurrency(totalAllowances) : '***,***'}</p>
                                                    {otherInc > 0 && <p className="text-[8.5px] font-black text-[#508660]/90 uppercase tracking-widest mt-1.5 leading-none inline-block border border-emerald-200 bg-[#f0f9f6] px-1.5 py-0.5 rounded-md font-mono">+OTHER INC.</p>}
                                                </td>
                                                <td className="py-3 px-5 text-right text-[12px]">
                                                    <p className="font-black font-mono text-[#b22026] text-[12.5px]">{showValues ? `-${formatCurrency(totalDeductionsCalculated)}` : '***,***'}</p>
                                                    {otherDed > 0 && <p className="text-[8.5px] font-black text-[#b22026]/90 uppercase tracking-widest mt-1.5 leading-none inline-block border border-rose-200 bg-rose-50 px-1.5 py-0.5 rounded-md font-mono">-OTHER DED.</p>}
                                                </td>
                                                <td className="py-3 px-5 text-right text-[12px]">
                                                    <div className="bg-[#f1f5f9] px-3.5 py-1.5 rounded-xl border border-[#cbd5e1]/30 inline-block">
                                                        <p className="font-black font-mono text-[#212c46] text-[13px]">{showValues ? formatCurrency(net) : '***,***'}</p>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-5 text-center text-[12px]" onClick={e => e.stopPropagation()}>
                                                    <div className="flex justify-center items-center">
                                                        <button onClick={() => handleOpenModal(item)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#3f809e] bg-[#3f809e]/5 hover:bg-[#3f809e]/15 hover:shadow-xs transition-all focus:outline-none cursor-pointer" title="Edit Parameters">
                                                            <Pencil size={13} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )})}
                                        {currentData.length === 0 && (
                                            <tr><td colSpan={7} className="text-center py-16 text-[#64748b] font-black text-[12px] uppercase">No configurations matched standard filters.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* PAGINATION PANEL */}
                            <div className="px-6 py-4.5 bg-[#f8fafc] border-t border-[#cbd5e1]/40 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                                <div className="flex items-center gap-6 text-[10px] font-black text-[#64748b] uppercase tracking-widest flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <span>Display:</span>
                                        <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="bg-white border border-[#cbd5e1] rounded-lg px-2 py-1.5 outline-none font-black text-[#475569] cursor-pointer shadow-2xs font-sans">
                                            {[5, 10, 20, 50].map((v: any) => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                    </div>
                                    <p className="bg-white px-3.5 py-1.5 rounded-lg border border-[#cbd5e1] shadow-2xs font-mono">Total Registry count: {filteredRecords.length}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`w-9 h-9 border border-[#cbd5e1] bg-white rounded-lg flex items-center justify-center transition-all cursor-pointer ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#212c46] hover:text-white hover:border-[#212c46] shadow-2xs active:scale-95'}`}>
                                        <ChevronLeft size={16}/>
                                    </button>
                                    <div className="bg-white text-[#475569] px-4 py-2 rounded-lg font-black text-[10px] min-w-[100px] text-center uppercase tracking-widest border border-[#cbd5e1] shadow-2xs font-mono">
                                        Page {currentPage} / {totalPages}
                                    </div>
                                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className={`w-9 h-9 border border-[#cbd5e1] bg-white rounded-lg flex items-center justify-center transition-all cursor-pointer ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#212c46] hover:text-white hover:border-[#212c46] shadow-2xs active:scale-95'}`}>
                                        <ChevronRight size={16}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* CONFIG SETTINGS TAB */
                    (<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn pb-6">
                        {/* Access Policies guide card */}
                        <div className="lg:col-span-4 bg-white/95 p-6 rounded-[24px] shadow-lg border border-[#cbd5e1]/45 h-fit">
                            <h3 className="text-[13px] font-black text-[#212c46] uppercase tracking-widest flex items-center gap-3 border-b-2 border-[#b58c4f] pb-4 mb-6"><ShieldAlert size={20} className="text-[#b58c4f]" /> STABILITY BASELINES</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-white border border-[#cbd5e1] rounded-xl shadow-xs hover:border-[#508660] transition-colors">
                                    <div className="flex items-center gap-2 text-[#508660] font-black text-[11px] uppercase tracking-widest mb-1.5"><Eye size={16}/> Public Node</div>
                                    <p className="text-[11px] text-[#64748b] font-bold leading-relaxed">โมดูลสาธารณะ: บุคลากรสามารถขอตรวจสอบเบื้องต้น ผ่านระบบสลิปและข้อตกลงได้โดยสะดวก</p>
                                </div>
                                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl shadow-xs hover:border-[#932c2e] transition-colors">
                                    <div className="flex items-center gap-2 text-[#932c2e] font-black text-[11px] uppercase tracking-widest mb-1.5"><Lock size={15}/> Restricted Gate</div>
                                    <p className="text-[11px] text-rose-700/80 font-bold leading-relaxed">พื้นที่จำกัด: ข้อมูลจะถูกเข้ารหัสลับและซ่อนโดยสัมบูรณ์ เฉพาะเจ้าหน้าที่ HR เท่านั้นจึงใช้งานได้</p>
                                </div>
                            </div>
                        </div>
                        {/* Dynamic baselines lock lists */}
                        <div className="lg:col-span-8 bg-white rounded-[24px] shadow-lg border border-[#cbd5e1]/45 overflow-hidden">
                            <div className="p-6 bg-[#f8fafc] border-b border-[#cbd5e1]/40">
                                <h4 className="text-[13px] font-black uppercase text-[#212c46] tracking-widest flex items-center gap-3"><ListTree size={18} className="text-[#b58c4f]"/> COMPENSATION ACCESS BASES</h4>
                            </div>
                            <div className="p-6 space-y-4">
                                {SYSTEM_COMPENSATION_CONFIGS.map(cfg => (
                                    <div key={cfg.id} className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${confidentialityMap[cfg.id] ? 'bg-rose-50/40 border-rose-200/60 shadow-2xs' : 'bg-white border-[#cbd5e1]/50 hover:border-[#851c24]/20'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-inner ${confidentialityMap[cfg.id] ? 'bg-rose-500/10 text-[#851c24] border-rose-200/60' : 'bg-[#f1f5f9] text-[#212c46] border-[#cbd5e1]/50'}`}>
                                                <cfg.icon size={20}/>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-[#212c46] text-[12px] uppercase tracking-widest">{cfg.label}</span>
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${confidentialityMap[cfg.id] ? 'text-[#851c24]' : 'text-[#64748b]'}`}>{cfg.desc}</span>
                                            </div>
                                        </div>
                                        <button onClick={()=>toggleConfidentiality(cfg.id)} className={`p-2.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 border ${confidentialityMap[cfg.id] ? 'bg-[#851c24] text-white border-[#932c2e]' : 'bg-white text-[#64748b] border-[#cbd5e1] hover:bg-[#f8fafc]'}`}>
                                            {confidentialityMap[cfg.id] ? <Lock size={16}/> : <Eye size={16}/>}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>)
                )}

                <div className="mt-8 h-8 w-full" />
          </div>
      </div>
  );
}
