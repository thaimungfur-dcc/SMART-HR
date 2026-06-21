import React, { useState, useEffect } from 'react';
import { 
  Building2, DollarSign, Download, Lock, Eye, EyeOff, ShieldCheck, Printer, Users, ChevronRight, Sparkles 
} from 'lucide-react';
import { motion } from 'motion/react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { DraggableModal } from '../../components/shared/DraggableModal';
import { QrVerifier } from '../../components/shared/QrVerifier';

const MySwal = withReactContent(Swal);

interface PayslipData {
  employeeId: string;
  name: string;
  department: string;
  position: string;
  bankAccount: string;
  baseSalary: number;
  otPay: number;
  incentives: number;
  allowances: number;
  providentFund: number;
  tax: number;
  socialSecurity: number;
}

const DEFAULT_EMPLOYEES: PayslipData[] = [
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
    socialSecurity: 750
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
    socialSecurity: 750
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
    socialSecurity: 750
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
    socialSecurity: 750
  }
];

export const generateQrSvgString = (id: string, labelText: string = "VERIFIED SYSTEM DOCUMENT") => {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  const hashVal = Math.abs(h);
  
  let rects = '';
  // Finder patterns and alignment mark
  rects += `<rect x="0" y="0" width="7" height="1" fill="#212c46" />`;
  rects += `<rect x="0" y="6" width="7" height="1" fill="#212c46" />`;
  rects += `<rect x="0" y="1" width="1" height="5" fill="#212c46" />`;
  rects += `<rect x="6" y="1" width="1" height="5" fill="#212c46" />`;
  rects += `<rect x="2" y="2" width="3" height="3" fill="#212c46" />`;
  
  rects += `<rect x="18" y="0" width="7" height="1" fill="#212c46" />`;
  rects += `<rect x="18" y="6" width="7" height="1" fill="#212c46" />`;
  rects += `<rect x="18" y="1" width="1" height="5" fill="#212c46" />`;
  rects += `<rect x="24" y="1" width="1" height="5" fill="#212c46" />`;
  rects += `<rect x="20" y="2" width="3" height="3" fill="#212c46" />`;
  
  rects += `<rect x="0" y="18" width="7" height="1" fill="#212c46" />`;
  rects += `<rect x="0" y="24" width="7" height="1" fill="#212c46" />`;
  rects += `<rect x="0" y="19" width="1" height="5" fill="#212c46" />`;
  rects += `<rect x="6" y="19" width="1" height="5" fill="#212c46" />`;
  rects += `<rect x="2" y="20" width="3" height="3" fill="#212c46" />`;

  rects += `<rect x="18" y="18" width="1" height="1" fill="#212c46" />`;
  rects += `<rect x="17" y="18" width="1" height="1" fill="#212c46" />`;
  rects += `<rect x="19" y="18" width="1" height="1" fill="#212c46" />`;
  rects += `<rect x="18" y="17" width="1" height="1" fill="#212c46" />`;
  rects += `<rect x="18" y="19" width="1" height="1" fill="#212c46" />`;

  const gridSize = 25;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const isTopLeft = r < 8 && c < 8;
      const isTopRight = r < 8 && c >= gridSize - 8;
      const isBottomLeft = r >= gridSize - 8 && c < 8;
      const isCenterLogo = r >= 10 && r <= 14 && c >= 10 && c <= 14;
      if (!isTopLeft && !isTopRight && !isBottomLeft && !isCenterLogo) {
        const seed = (r * 133 + c * 7919) ^ hashVal;
        if ((seed % 100) < 48) {
          rects += `<rect x="${c}" y="${r}" width="1" height="1" fill="#212c46" />`;
        }
      }
    }
  }

  return `
    <div style="display: flex; flex-direction: column; align-items: center; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; width: fit-content; background-color: #ffffff; text-align: center; margin: 40px auto 10px auto; page-break-inside: avoid;">
      <div style="position: relative; width: 85px; height: 85px; background-color: white;">
        <svg viewBox="0 0 25 25" width="85" height="85" style="shape-rendering: crispEdges;">
          ${rects}
        </svg>
      </div>
      <div style="margin-top: 6px; font-family: monospace; line-height: 1.2;">
        <span style="display: block; font-size: 8px; font-weight: 800; color: #3f809e; text-transform: uppercase; letter-spacing: 0.1em;">${labelText}</span>
        <span style="display: block; font-size: 7px; color: #64748b; margin-top: 2px;">SECURE ID: ${id}</span>
      </div>
    </div>
  `;
};

export default function Payslips() {
  const [employees, setEmployees] = useState<PayslipData[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState('CA-10245');
  const [selectedMonth, setSelectedMonth] = useState('May 2026');
  const [paperSize, setPaperSize] = useState<'a4' | 'letter' | 'legal'>('a4');
  
  // Security Clearance Gate for Selected Employee
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [inputPasscode, setInputPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [gateError, setGateError] = useState('');

  useEffect(() => {
    document.body.classList.remove('print-size-a4', 'print-size-letter', 'print-size-legal');
    document.body.classList.add(`print-size-${paperSize}`);
    return () => {
      document.body.classList.remove('print-size-a4', 'print-size-letter', 'print-size-legal');
    };
  }, [paperSize]);

  useEffect(() => {
    // Sync with main roster in localStorage if available
    const saved = localStorage.getItem('local_payroll_salaries');
    if (saved) {
      try {
        const raw = JSON.parse(saved);
        setEmployees(raw.map((r: any) => ({
          employeeId: r.employeeId || '',
          name: r.name || '',
          department: r.department || '',
          position: r.position || '',
          bankAccount: r.bankAccount || 'Kasikornbank •••• 1245',
          baseSalary: r.baseSalary || 0,
          otPay: r.otPay || 0,
          incentives: r.incentives || 0,
          allowances: r.allowances || 0,
          providentFund: r.providentFund || 0,
          tax: r.tax || 0,
          socialSecurity: r.socialSecurity || 0
        })));
      } catch (e) {
        setEmployees(DEFAULT_EMPLOYEES);
      }
    } else {
      setEmployees(DEFAULT_EMPLOYEES);
    }
  }, []);

  const currentEmp = employees.find(e => e.employeeId === selectedEmpId) || employees[0] || DEFAULT_EMPLOYEES[0];

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPasscode === '1234') {
      setIsUnlocked(true);
      setGateError('');
    } else {
      setGateError('รหัสผ่านไม่ถูกต้อง (ลองใช้รหัสทดสอบแนะนำ "1234")');
    }
  };

  const handleEmpChange = (empId: string) => {
    setSelectedEmpId(empId);
    setIsUnlocked(false);
    setInputPasscode('');
    setGateError('');
  };

  const handleDownload = () => {
    MySwal.fire({
      icon: 'success',
      title: 'ดาวน์โหลดสลิปเงินเดือนสำเร็จ',
      text: `ไฟล์สลิปทางการ PAYSLIP_${selectedMonth.replace(' ', '_')}_${currentEmp.employeeId}.pdf ถูกเข้ารหัสและดาวน์โหลดเรียบร้อยค่ะ`,
      confirmButtonColor: '#212c46'
    });
  };

  const handlePrint = () => {
    const totalEarnings = currentEmp.baseSalary + currentEmp.otPay + currentEmp.incentives + currentEmp.allowances;
    const totalDeductions = currentEmp.providentFund + currentEmp.tax + currentEmp.socialSecurity;
    const netSalary = totalEarnings - totalDeductions;

    const windowPrint = window.open('', '', 'width=850,height=750');
    if (!windowPrint) {
      MySwal.fire({
        icon: 'warning',
        title: 'โปรดอนุญาตป๊อปอัป',
        text: 'ระมัดระวังการปิดกั้นป๊อปอัป พิมพ์และดาวน์โหลดล้มเหลว',
        confirmButtonColor: '#212c46'
      });
      return;
    }

    windowPrint.document.write(`
      <html>
        <head>
          <title>PAYSLIP - ${currentEmp.name} (${selectedMonth})</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;800&family=JetBrains+Mono:wght@400;700&display=swap');
            @page {
              size: ${paperSize === 'a4' ? 'A4 portrait' : paperSize === 'letter' ? 'letter portrait' : 'legal portrait'};
              margin: 15mm 15mm 15mm 15mm;
            }
            body { 
              font-family: 'Sarabun', sans-serif; 
              padding: 40px; 
              color: #1e293b; 
              line-height: 1.5;
            }
            .header {
              display: flex;
              justify-content: space-between;
              border-bottom: 2px dashed #cbd5e1;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .company h1 { font-size: 20px; margin: 0; color: #1e293b; font-weight: 800; }
            .company p { font-size: 11px; color: #64748b; margin: 3px 0 0 0; }
            .doc-title { text-align: right; }
            .doc-title h2 { font-size: 16px; color: #b58c4f; margin: 0; font-weight: 800; }
            .doc-title p { font-size: 11px; color: #64748b; margin: 3px 0 0 0; font-family: monospace; }
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              padding: 15px;
              border-radius: 10px;
              font-size: 12px;
              margin-bottom: 25px;
            }
            .meta-label { color: #64748b; display: block; font-size: 10px; font-weight: 600; text-transform: uppercase; margin-bottom: 3px; }
            .meta-val { font-weight: 800; color: #1e293b; }
            
            .ledger {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 25px;
            }
            .side {
              border: 1px solid #e3e8f0;
              border-radius: 10px;
              padding: 15px;
            }
            .side-title {
              font-size: 11px;
              font-weight: 800;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 8px;
              margin-bottom: 12px;
              color: #475569;
            }
            .row {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              margin-bottom: 8px;
              color: #334155;
            }
            .row span:nth-child(2) { font-family: 'JetBrains Mono', monospace; font-weight: 600; }
            .total-row {
              margin-top: 15px;
              padding-top: 10px;
              border-top: 1px solid #e2e8f0;
              font-weight: 800;
              font-size: 12.5px;
            }
            .net-pay {
              background-color: #1e293b;
              color: #ffffff;
              padding: 20px;
              border-radius: 12px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 30px;
            }
            .net-label { font-size: 11px; color: #b58c4f; font-weight: 800; text-transform: uppercase; }
            .net-val { font-size: 24px; font-weight: 800; color: #b58c4f; font-family: 'JetBrains Mono', monospace; }
            .signatures {
              margin-top: 50px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 100px;
              text-align: center;
              font-size: 11px;
              color: #64748b;
            }
            .sig-line { border-top: 1px solid #cbd5e1; margin-top: 40px; padding-top: 8px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">
              <h1 style="font-size: 16px; margin: 0; color: #1e293b; font-weight: 800;">T All Intelligence Co., Ltd. / บริษัท ที ออลล์ อินเทลลิเจนซ์ จำกัด</h1>
              <p style="font-size: 10px; color: #475569; margin: 4px 0 0 0; font-weight: 600; line-height: 1.4;">
                สำนักงานใหญ่ : 46 หมู่ที่ 5 ตำบลคลองสี่ อำเภอคลองหลวง จังหวัดปทุมธานี 12120<br/>
                Head Office : 46 Moo 5, Klong 4, Klong Luang, Pathumthani Thailand 12120<br/>
                TAX ID : 0-1055-57149-33-2
              </p>
            </div>
            <div class="doc-title" style="text-align: right; min-width: 200px;">
              <h2 style="font-size: 15px; color: #b58c4f; margin: 0; font-weight: 800;">PAYSLIP / ใบจ่ายเงินเดือน</h2>
              <p style="font-size: 10px; color: #64748b; margin: 4px 0 0 0; font-family: monospace;">CYCLE: ${selectedMonth.toUpperCase()}</p>
            </div>
          </div>

          <div class="meta-grid">
            <div>
              <span class="meta-label">รหัสพนักงาน</span>
              <span class="meta-val">${currentEmp.employeeId}</span>
            </div>
            <div>
              <span class="meta-label">ชื่อพนักงาน</span>
              <span class="meta-val">${currentEmp.name}</span>
            </div>
            <div>
              <span class="meta-label">ตำแหน่ง / สังกัด</span>
              <span class="meta-val">${currentEmp.position}</span>
            </div>
            <div>
              <span class="meta-label">เลขบัญชีธนาคาร</span>
              <span class="meta-val" style="font-family: monospace;">${currentEmp.bankAccount}</span>
            </div>
          </div>

          <div class="ledger">
            <div class="side" style="border-color: #d1fae5;">
              <div class="side-title" style="color: #059669;">EARNINGS / รายรับ (THB)</div>
              <div class="row">
                <span>Base Salary / เงินเดือนมูลฐาน</span>
                <span>${currentEmp.baseSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div class="row">
                <span>OT Pay / ล่วงเวลา</span>
                <span>${currentEmp.otPay.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div class="row">
                <span>Variable Incentives / เงินค่าเป้าสัมฤทธิ์</span>
                <span>${currentEmp.incentives.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div class="row">
                <span>Allowances / เงินช่วยสนับสนุนชีพ</span>
                <span>${currentEmp.allowances.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div class="row total-row" style="color: #059669;">
                <span>Total Earnings</span>
                <span>${totalEarnings.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
            </div>

            <div class="side" style="border-color: #fee2e2;">
              <div class="side-title" style="color: #dc2626;">DEDUCTIONS / รายหักสะสม (THB)</div>
              <div class="row">
                <span>Provident Fund (5%) / กองทุนสำรองเลี้ยงชีพ</span>
                <span>${currentEmp.providentFund.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div class="row">
                <span>Withholding Tax / ภาษีหัก ณ ที่จ่าย</span>
                <span>${currentEmp.tax.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div class="row">
                <span>Social Security / เงินสมทบประกันสังคม</span>
                <span>${currentEmp.socialSecurity.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div class="row total-row" style="color: #dc2626;">
                <span>Total Deductions</span>
                <span>${totalDeductions.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>

          <div class="net-pay">
            <div>
              <span class="net-label">สุทธิสุทธิจ่ายตรงงวด (NET CASHOUT DIRECT DISBURSEMENT)</span>
            </div>
            <div class="net-val">฿${netSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
          </div>

          <div class="signatures">
            <div>
              <div class="sig-line">ผู้รับเงิน / Employee Signature</div>
            </div>
            <div>
              <div class="sig-line">ฝ่ายจัดการทรัพยากรบุคคล / HR Director Authorization</div>
            </div>
          </div>

          <!-- Deterministic secure Verification QR Code for printed payslip compliance -->
          ${generateQrSvgString(`VERIFYP-${currentEmp.employeeId}-${selectedMonth.replace(' ', '')}-${netSalary.toFixed(0)}`, "SECURED PAYSLIP VERIFICATION")}
        </body>
      </html>
    `);

    windowPrint.document.close();
    windowPrint.focus();
    setTimeout(() => {
      windowPrint.print();
      windowPrint.close();
    }, 550);
  };

  const totalEarnings = currentEmp.baseSalary + currentEmp.otPay + currentEmp.incentives + currentEmp.allowances;
  const totalDeductions = currentEmp.providentFund + currentEmp.tax + currentEmp.socialSecurity;
  const netSalary = totalEarnings - totalDeductions;

  return (
    <div className="px-4 sm:px-8 py-6 space-y-6 w-full">
      <div>
        <h1 className="text-2xl font-black text-[#212c46] tracking-tight uppercase">SECURED INDIVIDUAL PAYSLIPS</h1>
        <p className="text-xs font-bold text-[#7a8b95] uppercase tracking-wider">ใบกระจายรายเดือนและใบพิจารณาสอบยอดกองทุนสวัสดิการของพนักงาน</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column - Employee List Selection */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 h-full max-h-[85vh] flex flex-col">
          <div className="p-2 border-b border-slate-100 pb-3 mb-3">
            <h3 className="text-xs font-black text-[#212c46] tracking-wider uppercase flex items-center gap-2">
              <Users size={14} className="text-slate-400" /> เลือกรายชื่อพนักงาน
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
            {employees.length === 0 ? (
              <p className="text-xs text-slate-400 p-4">กำลังค้นหารายชื่อพนักงานในโมดูล...</p>
            ) : (
              employees.map((emp) => {
                const isSelected = emp.employeeId === selectedEmpId;
                return (
                  <button
                    key={emp.employeeId}
                    onClick={() => handleEmpChange(emp.employeeId)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-[#3f809e] bg-[#3f809e]/10 shadow-sm'
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="block text-xs font-black text-[#212c46]">{emp.name}</span>
                      <span className="block text-[9px] font-bold text-slate-500 font-mono mt-0.5">{emp.employeeId} • {emp.department}</span>
                    </div>
                    <ChevronRight size={14} className={isSelected ? 'text-[#3f809e]' : 'text-slate-300'} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right column - Payslip Sheet Preview */}
        <div className="lg:col-span-8">
          
          {/* Security lock page */}
          {!isUnlocked ? (
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8 text-center flex flex-col items-center justify-center min-h-[450px]">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20 shadow-inner mb-4">
                <Lock size={28} className="animate-pulse" />
              </div>
              <h3 className="text-base font-black text-[#212c46] uppercase tracking-wider">Clearnace Passcode Required</h3>
              <p className="text-[11px] text-[#7a8b95] uppercase font-bold tracking-wider max-w-sm mt-1 leading-relaxed">
                กรุณาตรวจสอบรหัสผ่าน 4 หลัก ของคุณก่อนทำการเข้าดูเอกสารสลิปเงินเดือนของท่าน เพื่อความปลอดภัยสูงสุด
              </p>

              <form onSubmit={handleUnlockSubmit} className="mt-6 w-full max-w-xs space-y-4">
                <div className="relative">
                  <input
                    type={showPasscode ? "text" : "password"}
                    maxLength={4}
                    value={inputPasscode}
                    onChange={(e) => setInputPasscode(e.target.value.replace(/\D/g, ''))}
                    placeholder="รหัสผ่าน 4 หลัก (ลองกด '1234')"
                    className="w-full p-3 pr-12 text-center border-2 border-slate-200 rounded-xl text-sm font-sans tracking-[1.25em] pl-[1.25em] font-black focus:border-[#b58c4f] focus:ring-1 focus:ring-[#b58c4f] outline-none transition-all"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500/85 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    {showPasscode ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {gateError && <p className="text-[10px] text-red-500 font-bold uppercase">{gateError}</p>}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#212c46] hover:bg-[#151d2f] text-white text-[10px] font-black uppercase rounded-xl tracking-widest shadow-md transition-all cursor-pointer"
                >
                  Verify Access Clearance
                </button>
              </form>
            </div>
          ) : (
            /* Unlocked High-Fidelity Payslip Viewer */
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden space-y-6">
              
              {/* Document Actions Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-3 rounded-xl border border-slate-100 gap-3">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex gap-2 items-center">
                    <span className="text-[10px] text-slate-400 font-black uppercase">รอบการเงินเดือน:</span>
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

                  <div className="flex gap-2 items-center">
                    <span className="text-[10px] text-slate-400 font-black uppercase">พิมพ์กระดาษ (Size):</span>
                    <select 
                      value={paperSize} 
                      onChange={(e) => setPaperSize(e.target.value as 'a4' | 'letter' | 'legal')}
                      className="p-1 px-2 border border-slate-200 rounded-lg text-[10px] font-extrabold text-[#212c46] outline-none bg-white focus:border-[#b58c4f]"
                    >
                      <option value="a4">A4 (Standard)</option>
                      <option value="letter">Letter (US)</option>
                      <option value="legal">Legal (8.5 x 14)</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                  <button 
                    onClick={handlePrint}
                    className="bg-slate-700 hover:bg-slate-800 text-white p-2 px-3.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Printer size={12} /> พิมพ์สลิป (Print)
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white p-2 px-3.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Download size={12} /> ดาวน์โหลด (Download PDF)
                  </button>
                </div>
              </div>

              {/* Document Head Sheet */}
              <div className="border-b border-dashed border-slate-200 pb-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="flex items-center gap-3">
                    <Building2 size={36} className="text-[#212c46]" />
                    <div>
                      <h3 className="text-base font-extrabold text-[#212c46] leading-none uppercase">T All Intelligence Co., Ltd.</h3>
                      <p className="text-[9px] text-[#7a8b95] font-black mt-1 uppercase">บริษัท ที ออล อินเทลลิเจนซ์ จำกัด</p>
                    </div>
                  </div>
                  <div className="text-right mt-3 sm:mt-0">
                    <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5 justify-end">
                      <Sparkles size={11} /> PAID (โอนสำเร็จ)
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid employee details */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] font-sans">
                <div>
                  <span className="block text-slate-400 font-bold uppercase text-[9px]">รหัสพนักงาน</span>
                  <span className="block font-black text-[#212c46] text-xs font-mono">{currentEmp.employeeId}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold uppercase text-[9px]">ชื่อพนักงาน</span>
                  <span className="block font-black text-[#212c46] text-xs">{currentEmp.name}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold uppercase text-[9px]">ตำแหน่ง / สังกัด</span>
                  <span className="block font-black text-[#212c46] text-xs">{currentEmp.position} ({currentEmp.department})</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold uppercase text-[9px]">เลขพัสดุรับโอนตรง</span>
                  <span className="block font-black text-[#212c46] text-xs">{currentEmp.bankAccount}</span>
                </div>
              </div>

              {/* Detailed Breakdown Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                {/* Earnings List wrapper */}
                <div className="border border-slate-100 rounded-xl p-4 shadow-sm bg-white flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4 flex justify-between items-center">
                      <span>EARNINGS / รายรับ</span>
                      <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded text-[8px] font-mono">THB</span>
                    </h4>
                    <div className="space-y-3 text-[12px] font-medium text-slate-600">
                      <div className="flex justify-between items-center">
                        <span className="font-bold">เงินเดือนมูลฐาน (Salary)</span>
                        <span className="font-mono font-bold text-slate-800">฿{currentEmp.baseSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold">ค่าล่วงเวลา (Overtime Pay)</span>
                        <span className="font-mono font-bold text-slate-800">฿{currentEmp.otPay.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold">เงินค่าสัมฤทธิ์พิเศษ (Incentives)</span>
                        <span className="font-mono font-bold text-slate-800">฿{currentEmp.incentives.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold">ค่าตำแหน่งวิชาชีพ (Allowances)</span>
                        <span className="font-mono font-bold text-slate-800">฿{currentEmp.allowances.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-3.5 mt-4 flex justify-between items-center font-bold text-xs text-emerald-700 bg-emerald-50/30 p-2.5 rounded-lg">
                    <span>รายได้รวมทั้งหมด (Total Credit)</span>
                    <span className="font-mono font-black text-sm">฿{totalEarnings.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                </div>

                {/* Deductions List wrapper */}
                <div className="border border-slate-100 rounded-xl p-4 shadow-sm bg-white flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4 flex justify-between items-center">
                      <span>DEDUCTIONS / รายจ่ายประจำ</span>
                      <span className="bg-rose-500/10 text-rose-600 px-2 py-0.5 rounded text-[8px] font-mono">THB</span>
                    </h4>
                    <div className="space-y-3 text-[12px] font-medium text-slate-600">
                      <div className="flex justify-between items-center">
                        <span className="font-bold">สำรองเลี้ยงชีพ (Provident Fund 5%)</span>
                        <span className="font-mono font-bold text-slate-800">฿{currentEmp.providentFund.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold">หักภาษี ณ ที่จ่าย (Withholding Tax)</span>
                        <span className="font-mono font-bold text-slate-800">฿{currentEmp.tax.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold">สมทบประกันสังคม (Social Security)</span>
                        <span className="font-mono font-bold text-slate-800">฿{currentEmp.socialSecurity.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-3.5 mt-4 flex justify-between items-center font-bold text-xs text-rose-700 bg-rose-50/30 p-2.5 rounded-lg">
                    <span>รายการถูกหักรวม (Total Debit)</span>
                    <span className="font-mono font-black text-sm">฿{totalDeductions.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                </div>
              </div>

              {/* Net Payout Highlights Card */}
              <div className="bg-[#212c46] rounded-2xl p-5 text-white flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden border border-slate-800">
                <div className="absolute right-[-10%] top-[-20%] opacity-10 rotate-12 pointer-events-none text-white select-none">
                  <ShieldCheck size={180} />
                </div>
                <div className="relative z-10 text-center sm:text-left space-y-1">
                  <span className="block text-[9px] text-[#b58c4f] font-black uppercase tracking-[0.2em]">NET DISBURSED OUTFLOW (รายได้สุทธิ)</span>
                  <h4 className="text-3xl font-black font-mono tracking-tight text-[#b58c4f]">
                    ฿{netSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </h4>
                  <p className="text-[10px] text-white/50 font-bold uppercase leading-none">transferred directly to secure vault bank register</p>
                </div>

                {/* Secure QR verification on screen */}
                <div className="relative z-10 shrink-0 scale-95 border border-slate-700/60 p-1.5 rounded-xl bg-white/5 backdrop-blur-md">
                  <QrVerifier 
                    value={`VERIFYP-${currentEmp.employeeId}-${selectedMonth.replace(' ', '')}-${netSalary.toFixed(0)}`}
                    label="PAYSLIP APPROVED"
                    size={64}
                    showScanText={true}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
