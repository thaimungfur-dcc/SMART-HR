import { UserGuidePanel } from '../../components/shared/UserGuidePanel';
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DraggableModal } from '../../components/shared/DraggableModal';
import { useLanguage } from '../../context/LanguageContext';
import { HistorySidebar } from './HistorySidebar';
import { DueProcessChecklistModal, CaseTimeline } from './DueProcessChecklist';
import { WarningLetterLibrary } from './WarningLetterLibrary';

// --- Theme Configuration (Synced with Home Palette) ---
const THEME = {
  bgMain: 'transparent',
  primary: '#212c46',
  primaryLight: '#4d87a8',
  accent: '#a94228',
  gold: '#b58c4f',
  brightGold: '#b7a159',
  success: '#657f4d',
  danger: '#932c2e',
  skyBlue: '#3f809e',
  dustyBlue: '#7a8b95',
  coolGray: '#eaeaec'
};

// --- MOCK CASE DATA ---
const INITIAL_CASES = [
  {
    id: 'INV-2026-001',
    employeeId: 'EMP-20412',
    employeeName: 'นายศักดิ์สิทธิ์ สุวรรณฉัตรศิริ',
    position: 'Database Administrator',
    dept: 'Information Technology',
    category: 'Information Security',
    severity: 'Critical',
    accusation: 'เข้าถึงข้อมูลลูกค้าที่อ่อนไหวโดยไม่ได้รับอนุญาต และดาวน์โหลดไฟล์ SQL นอกเวลาทำงานปกติโดยไม่มีใบแจ้งงาน (Ticket Approved)',
    status: 'Completed',
    progress: 100,
    committeeLead: 'คุณนพดล (IT Director)',
    punishment: 'Dismissal without severance pay (เลิกจ้างโดยทันทีโดยไม่มีค่าชดเชย เนื่องจากทุจริตต่อหน้าที่)',
    date: '2026-05-12',
    attachments: [
      { name: 'db_access_audit_log.xlsx', size: '2.1 MB', type: 'excel' },
      { name: 'sec_incident_report.pdf', size: '1.4 MB', type: 'pdf' }
    ],
    dueProcessSteps: {
      step_incident_report: true,
      step_fact_finding: true,
      step_notification_defense: true,
      step_committee_review: true,
      step_labor_law_vetting: true,
      step_appeal_opportunity: true
    }
  },
  {
    id: 'INV-2026-002',
    employeeId: 'EMP-20984',
    employeeName: 'นางสาวจิราภรณ์ วีระเดชกุล',
    position: 'Senior Procurement Officer',
    dept: 'Procurement & Logistics',
    category: 'Integrity',
    severity: 'Major',
    accusation: 'พบผลประโยชน์ขัดกันในการแนะนำผู้ขายวัตถุดิบ (Conflict of Interest) โดยไม่มีการแจ้งปฏิเสธความเกี่ยวข้องเครือญาติในโปรเจกต์แปรรูปสับปะรด',
    status: 'Committee Review',
    progress: 75,
    committeeLead: 'คุณสุรชัย (Internal Audit Committee Head)',
    punishment: 'Pending Resolution Assembly (อยู่ระหว่างเตรียมประกาศคำตัดสิน คาดว่าให้พักงาน 1 เดือนงดเงินเดือน)',
    date: '2026-05-28',
    attachments: [
      { name: 'family_tree_disclosure_analysis.pdf', size: '850 KB', type: 'pdf' }
    ],
    dueProcessSteps: {
      step_incident_report: true,
      step_fact_finding: true,
      step_notification_defense: true,
      step_committee_review: true
    }
  },
  {
    id: 'INV-2026-003',
    employeeId: 'EMP-20150',
    employeeName: 'นายมนตรี พูลสวัสดิ์',
    position: 'Production Line Lead',
    dept: 'Manufacturing Node B',
    category: 'Safety Regulation',
    severity: 'Normal',
    accusation: 'ละเลยการสวมใส่อุปกรณ์หมวกและแว่นตานิรภัยในเขตพื้นที่ทดสอบเครื่องจักรแปรรูปความร้อนความดันสูง ถึงแม้จะถูกเตือนเป็นลายลักษณ์อักษรแล้ว 2 ครั้ง',
    status: 'Completed',
    progress: 100,
    committeeLead: 'คุณพงษ์ศักดิ์ (Safety Manager)',
    punishment: 'Written Warning & 5-point Evaluation Deduction (ตักเตือนเป็นลายลักษณ์อักษรฉบับที่ 3 และหักแต้มประเมินโบนัส 5%)',
    date: '2026-06-02',
    attachments: [],
    dueProcessSteps: {
      step_incident_report: true,
      step_fact_finding: true,
      step_notification_defense: true,
      step_labor_law_vetting: true,
      step_appeal_opportunity: true
    }
  },
  {
    id: 'INV-2026-004',
    employeeId: 'EMP-20311',
    employeeName: 'นายสรพงษ์ แก้วเกรียงไกร',
    position: 'Inventory Operations Supervisor',
    dept: 'Warehouse Systems',
    category: 'Misconduct',
    severity: 'Normal',
    accusation: 'ใช้วาจาไม่สุภาพและแสดงพฤติกรรมก้าวร้าวต่อพนักงานขนส่งภายนอกรวมถึงเพื่อนร่วมงาน ณ อาคารกระจายสินค้าภาคเหนือ',
    status: 'Fact-Finding',
    progress: 30,
    committeeLead: 'คุณภัทรา (HR Relations Manager)',
    punishment: 'Under Review / Fact check (อยู่ระหว่างสืบพยานแวดล้อม และบันทึกถ้อยคำพนักงาน)',
    date: '2026-06-05',
    attachments: [],
    dueProcessSteps: {
      step_incident_report: true,
      step_fact_finding: true
    }
  },
  {
    id: 'INV-2026-005',
    employeeId: 'EMP-20677',
    employeeName: 'นางกาญจนา สมศรี',
    position: 'Financial Ledger Executive',
    dept: 'Accounting & Treasury',
    category: 'Integrity',
    severity: 'Critical',
    accusation: 'ความผิดบิดเบือนข้อมูลในรายงานงบดุลย่อยเพื่อปกปิดยอดเงินสดสวัสดิการพนักงานสูญหาย เป็นยอดตรวจสอบพบจำนวน 45,000 บาท',
    status: 'Accusation',
    progress: 55,
    committeeLead: 'คุณศิริพงษ์ (Chief Financial Officer)',
    punishment: 'Suspended pending investigation (สั่งพักงาน 15 วันเพื่อรอผลชี้ขาดพยานหลักฐานทางการเงิน)',
    date: '2026-06-08',
    attachments: [
      { name: 'audit_shortage_cash_v1.pdf', size: '3.4 MB', type: 'pdf' }
    ],
    dueProcessSteps: {
      step_incident_report: true,
      step_fact_finding: true,
      step_notification_defense: true
    }
  }
];

// --- Helper Functions ---
const kebabToPascal = (str: string) => str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');

const LucideIcon = ({ name, size = 16, className = "", color, style, strokeWidth = 2.5 }: any) => {
  if (!name) return null;
  if (typeof name !== 'string') {
    const IconComp = name;
    return <IconComp size={size} className={className} style={{ ...style, color }} strokeWidth={strokeWidth} />;
  }
  const pascalName = kebabToPascal(name);
  const IconComponent = Icons[pascalName as keyof typeof Icons] || Icons.CircleHelp;
  return <IconComponent size={size} className={className} style={{ ...style, color }} strokeWidth={strokeWidth} />;
};

// --- Lean KPI Card System (กระชับและลีน แต่คงความสวยงาม) ---
const KpiCardCompact = ({ icon, value, label, colorAccent, colorValue, desc }: any) => (
  <div className="bg-white/90 px-4 py-3 rounded-2xl border border-[#eaeaec] shadow-xs min-w-[200px] relative overflow-hidden group hover:border-[#b7a159] transition-all flex flex-col justify-between animate-fadeIn pb-6 flex-1 min-h-0">
    {/* Micro scale background icon */}
    <div className="absolute -right-3 -bottom-4 opacity-[0.05] transform group-hover:scale-110 transition-transform duration-700 pointer-events-none">
      <LucideIcon name={icon} size={80} color={colorAccent} />
    </div>
    <div className="relative z-10 flex justify-between items-center w-full">
      <p className="text-[10px] font-black text-[#7a8b95] uppercase tracking-wider">{label}</p>
      <div className="w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 shadow-xs" style={{ backgroundColor: `${colorAccent}15`, borderColor: `${colorAccent}25`, color: colorAccent }}>
        <LucideIcon name={icon} size={14} />
      </div>
    </div>
    <div className="relative z-10 mt-1 flex items-baseline justify-between">
      <p className="text-[20px] font-black leading-none text-[#212c46]" style={{ color: colorValue }}>
        {value}
      </p>
      <span className="text-[10px] font-bold text-[#4d87a8] uppercase tracking-wider flex items-center gap-1 font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span> {desc}
      </span>
    </div>
  </div>
);

// --- Edit & Create Draggable Form Modal (มีมาตรฐานเดียวกับหน้าสิทธิ์ผู้ใช้งาน) ---
function EditCaseModal({ isOpen, onClose, record, onSave }: any) {
  const [modalStep, setModalStep] = useState(0);
  const [formData, setFormData] = useState<any>({
    id: '', employeeId: '', employeeName: '', position: '', dept: '',
    category: 'Information Security', severity: 'Normal', accusation: '',
    status: 'Fact-Finding', progress: 0, committeeLead: '', punishment: '',
    date: '', attachments: []
  });

  useEffect(() => {
    if (isOpen && record) {
      setModalStep(0);
      setFormData(JSON.parse(JSON.stringify(record)));
    } else if (isOpen) {
      setModalStep(0);
      setFormData({
        id: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`,
        employeeId: 'EMP-',
        employeeName: '',
        position: '',
        dept: 'Information Technology',
        category: 'Information Security',
        severity: 'Normal',
        accusation: '',
        status: 'Fact-Finding',
        progress: 10,
        committeeLead: '',
        punishment: 'Pending Review Assembly',
        date: new Date().toISOString().split('T')[0],
        attachments: []
      });
    }
  }, [isOpen, record]);

  if (!isOpen) return null;

  const handleProgressChange = (val: number) => {
    let s = formData.status;
    if (val === 100) s = 'Completed';
    else if (val <= 20) s = 'Fact-Finding';
    else if (val <= 50) s = 'Accusation';
    else if (val <= 85) s = 'Committee Review';
    else if (val < 100) s = 'Pending Resolution';

    setFormData({ ...formData, progress: val, status: s });
  };

  const handleFileLocalUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const newAttach = {
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.type.includes('pdf') ? 'pdf' : file.type.includes('excel') || file.type.includes('sheet') ? 'excel' : 'document'
      };
      setFormData({
        ...formData,
        attachments: [...formData.attachments, newAttach]
      });
    }
  };

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      width="max-w-[850px]"
      customHeader={
        <div className="bg-[#212c46] px-5 py-3.5 flex justify-between items-center shrink-0 border-b-2 border-[#b7a159]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/20 shadow-sm">
              <Icons.Scale className="text-[#b7a159] w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-[#d7d7d7] uppercase tracking-widest leading-none">
                {record ? 'EDIT CASE RECORD / แก้ไขสำนวนเลขคดี' : 'NEW INVESTIGATION CASE / สร้างสำนวนคดีใหม่'}
              </h3>
              <p className="text-[10px] font-bold text-[#748b9e] uppercase tracking-wider mt-1 font-mono">
                {formData.id || 'GENERATING CASE NUMBER...'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-[#932c2e] transition-all bg-white/10 hover:bg-white/20 p-1.5 rounded-full"><Icons.X size={14} /></button>
        </div>
      }
    >
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#f8f9fa]">
        {/* Step-by-Step Node Sidebar style user permission */}
        <div className="w-full md:w-52 bg-white border-b md:border-b-0 md:border-r border-[#eaeaec] flex flex-row md:flex-col shrink-0 p-1.5 md:p-3 space-y-0 md:space-y-1.5 gap-1 md:gap-0">
          {[0, 1, 2].map(step => (
            <button
              key={step}
              type="button"
              onClick={() => setModalStep(step)}
              className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all font-sans ${modalStep === step ? 'bg-[#212c46] text-white shadow-sm' : 'text-[#7a8b95] hover:bg-[#f8f9fa] hover:text-[#212c46]'}`}
            >
              <LucideIcon name={step === 0 ? 'User' : step === 1 ? 'ShieldAlert' : 'FileCheck'} size={14} color={modalStep === step ? THEME.brightGold : undefined} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {step === 0 ? '1. Accused' : step === 1 ? '2. Allegation' : '3. Final Verdict'}
              </span>
            </button>
          ))}
        </div>

        {/* Content Panel */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white space-y-4 max-h-[450px]">
          {modalStep === 0 && (
            <div className="space-y-4 animate-fadeIn pb-6">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 border-b pb-1 font-sans">Accused Personnel Details / พนักงานผู้เกี่ยวข้อง</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-wider mb-1">Employee ID / รหัสพนักงาน</label>
                  <input type="text" value={formData.employeeId} onChange={e => setFormData({ ...formData, employeeId: e.target.value })} className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl px-3 py-2 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#b7a159]" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-wider mb-1">Employee Name (TH) / ชื่อพนักงาน</label>
                  <input type="text" value={formData.employeeName} onChange={e => setFormData({ ...formData, employeeName: e.target.value })} className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl px-3 py-2 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#b7a159]" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-wider mb-1">Position / ตำแหน่งหน้าที</label>
                  <input type="text" value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl px-3 py-2 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#b7a159]" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-wider mb-1">Department Nodes / สังกัดแผนก</label>
                  <input type="text" value={formData.dept} onChange={e => setFormData({ ...formData, dept: e.target.value })} className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl px-3 py-2 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#b7a159]" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-wider mb-1">Date Logged / วันที่เริ่มบันทึกสำนวน</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl px-3 py-2 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#b7a159] font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-wider mb-1">Severe Risk Level / ระดับแรงกระแทกความผิด</label>
                  <select value={formData.severity} onChange={e => setFormData({ ...formData, severity: e.target.value })} className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl px-3 py-2 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#b7a159]">
                    <option value="Normal">Normal Practice / วินัยไม่ร้ายแรง</option>
                    <option value="Major">Major Breach / วินัยกลางระดับความเสียหายจำกัด</option>
                    <option value="Critical">Critical Standard Danger / วินัยร้ายแรงสูงสุด</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {modalStep === 1 && (
            <div className="space-y-4 animate-fadeIn pb-6">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 border-b pb-1 font-sans">Investigation Allegations & Board Leader / บริบทความผิดและคณะกรรมการ</h4>
              <div>
                <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-wider mb-1">Incident Category / ลักษณะพฤติกรรมผิดวินัย</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl px-3 py-2 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#b7a159]">
                  <option value="Information Security">Information Security / ล่วงละเมิดสิทธิ์ข้อมูลคอมพิวเตอร์</option>
                  <option value="Integrity">Integrity / ความขัดแย้งเชิงผลประโยชน์ ทุจริต</option>
                  <option value="Safety Regulation">Safety Regulation / ไม่ปลอดภัยตามหลักเครื่องจักร</option>
                  <option value="Misconduct">Misconduct / ทัศนคติ พฤติกรรมก้าวร้าวต่อองค์การ</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-wider mb-1">Detailed Investigation Claims / รายละเอียดข้อกล่าวหาและประเด็นพยานหลักฐาน</label>
                <textarea rows={4} value={formData.accusation} onChange={e => setFormData({ ...formData, accusation: e.target.value })} className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl p-3 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#b7a159]" placeholder="ระบุวันเวลาพฤติการณ์ที่ถูกรายงานหรือถูกกล่าวหา พร้อมพยานเอกสารประกอบเริ่มต้น..." />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-wider mb-1">Committee Chairman Lead / ประธานคณะกรรมการพิจารณาตรวจสอบ</label>
                <input type="text" value={formData.committeeLead} onChange={e => setFormData({ ...formData, committeeLead: e.target.value })} className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl px-3 py-2 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#b7a159]" placeholder="ระบุยศ/ชื่อ นามสกุลตำแหน่งกรรมการสูงสุดผู้ดูแลเคส" />
              </div>
            </div>
          )}

          {modalStep === 2 && (
            <div className="space-y-4 animate-fadeIn pb-6">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 border-b pb-1 font-sans">Final Decision & Penalty / ผลความก้าวหน้าและการพินิจลงโทษ</h4>
              <div>
                <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-wider mb-1">Stage Status Progress Rate / ความคืบหน้าสำนวน ({formData.progress}%)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={formData.progress}
                    onChange={e => handleProgressChange(Number(e.target.value))}
                    className="flex-1 accent-[#709654] cursor-pointer"
                  />
                  <span className="text-[12px] font-mono font-black text-[#212c46] bg-slate-50 border border-slate-200 px-2 py-1 rounded">{formData.progress}%</span>
                </div>
                <p className="text-[9.5px] text-[#7a8b95] font-black uppercase mt-1">
                  Current automatically Synced Stage: <strong className="text-[#a94228]">{formData.status}</strong>
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-wider mb-1">Adjudged Discipline Actions / มาตรการลงทัณฑ์วินัยที่ประกาศใช้</label>
                <textarea rows={3} value={formData.punishment} onChange={e => setFormData({ ...formData, punishment: e.target.value })} className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl p-3 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#b7a159]" placeholder="ระบุการตักเตือน, การกักยอดเงิน, การลงทัณฑ์ หรือการตักเตือนด้วยวาจาที่มีผลต่อเนื่อง..." />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-wider mb-1">Attached Chain of Proofs / แนบไฟล์หลักฐานสืบสวนคดี</label>
                <div className="border border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center bg-[#f8f9fa] hover:border-slate-450 transition-colors">
                  <Icons.CloudUpload size={24} className="text-slate-400 mb-2" />
                  <p className="text-[11px] text-[#212c46] font-bold">Drag and drop file here, or browse local system</p>
                  <p className="text-[9px] text-[#7a8b95] font-semibold mt-1">Accept PDF, DOCX, XLSX (Max size 10MB per unit)</p>
                  <input type="file" onChange={handleFileLocalUpload} className="hidden" id="fileLocalSearchApp" />
                  <label htmlFor="fileLocalSearchApp" className="mt-3 inline-block bg-white text-[#212c46] border border-slate-300 font-black text-[10px] tracking-wider uppercase px-4 py-1.5 rounded-lg cursor-pointer shadow-xs hover:bg-[#212c46] hover:text-white transition-all">Select file</label>
                </div>
                {formData.attachments.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {formData.attachments.map((file: any, index: number) => (
                      <div key={index} className="flex items-center justify-between text-[11px] font-bold text-slate-600 bg-white border border-[#eaeaec] px-3 py-1.5 rounded-lg shadow-2xs">
                        <span className="flex items-center gap-1.5">
                          <Icons.Paperclip size={12} className="text-[#a94228]" />
                          {file.name} ({file.size})
                        </span>
                        <button type="button" onClick={() => setFormData({ ...formData, attachments: formData.attachments.filter((_: any, idx: number) => idx !== index) })} className="text-[#932c2e] hover:text-rose-600 font-bold px-1.5">Delete</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-3.5 bg-[#f8f9fa] border-t border-[#eaeaec] flex justify-end gap-3 shrink-0">
        <button onClick={onClose} className="px-5 py-2.5 bg-white border border-[#eaeaec] text-[#414757] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#d7d7d7]/30 transition-all">Cancel</button>
        <button onClick={() => { onSave(formData); onClose(); }} className="bg-[#212c46] text-white px-5 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md hover:bg-[#414757] hover:text-white transition-all flex items-center gap-2"><Icons.Save size={13} /> Save Record / บันทึกข้อมูล</button>
      </div>
    </DraggableModal>
  );
}

// --- Main Page Component ---
export default function DisciplinaryInvestigation() {
  const { language, formatLangText } = useLanguage();
  const [cases, setCases] = useState<any[]>(INITIAL_CASES);
  const [activeTab, setActiveTab] = useState<'bboard' | 'registry'>('bboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [modalState, setModalState] = useState<{ isOpen: boolean; record: any | null }>({ isOpen: false, record: null });

  // Premium Custom Dropdown Open States
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isSeverityDropdownOpen, setIsSeverityDropdownOpen] = useState(false);

  // Configuration options for beautiful premium dropdowns
  const categoryOptions = [
    { value: 'all', label: 'All Violations / ลักษณะความผิดทั้งหมด', icon: Icons.Tag, bg: 'bg-[#212c46]' },
    { value: 'Information Security', label: 'Information Security / สิทธิ์ข้อมูลคอมพิวเตอร์', icon: Icons.Cpu, bg: 'bg-indigo-600' },
    { value: 'Integrity', label: 'Integrity / ความซื่อสัตย์สุจริต ทุจริต', icon: Icons.Coins, bg: 'bg-emerald-600' },
    { value: 'Safety Regulation', label: 'Safety Regulation / ความปลอดภัยตามหลักเครื่องจักร', icon: Icons.ShieldAlert, bg: 'bg-amber-600' },
    { value: 'Misconduct', label: 'Misconduct / ทัศนคติไม่พึงประสงค์', icon: Icons.Skull, bg: 'bg-rose-600' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Case Statuses / ทุกขั้นตอนคดี', icon: Icons.Layers, bg: 'bg-[#212c46]' },
    { value: 'Fact-Finding', label: 'Fact-Finding / ไต่สวนรวบรวมหลักฐาน', icon: Icons.Search, bg: 'bg-sky-600' },
    { value: 'Accusation', label: 'Accusation / บันทึกข้อกล่าวหาพนักงาน', icon: Icons.FileQuestion, bg: 'bg-[#b58c4f]' },
    { value: 'Committee Review', label: 'Committee Review / คณะกรรมการพิจารณาความ', icon: Icons.Users, bg: 'bg-violet-600' },
    { value: 'Pending Resolution', label: 'Pending Resolution / พิพากษาลงโทษ', icon: Icons.Scale, bg: 'bg-amber-500' },
    { value: 'Completed', label: 'Completed / ปิดคดี/ลงโทษลุล่วง', icon: Icons.CheckCircle, bg: 'bg-emerald-600' },
  ];

  const severityOptions = [
    { value: 'all', label: 'All Severities / ทุกความเสียหาย', icon: Icons.Flag, bg: 'bg-[#212c46]' },
    { value: 'Normal', label: 'Normal Practice / วินัยระดับต้น', icon: Icons.Info, bg: 'bg-emerald-600' },
    { value: 'Major', label: 'Major Breach / วินัยระดับกลาง', icon: Icons.AlertTriangle, bg: 'bg-amber-600' },
    { value: 'Critical', label: 'Critical Danger / วินัยร้ายแรง', icon: Icons.Skull, bg: 'bg-rose-600' },
  ];

  const getCategoryCount = (val: string) => {
    if (val === 'all') return cases.length;
    return cases.filter(c => c.category === val).length;
  };

  const getStatusCount = (val: string) => {
    if (val === 'all') return cases.length;
    return cases.filter(c => c.status === val).length;
  };

  const getSeverityCount = (val: string) => {
    if (val === 'all') return cases.length;
    return cases.filter(c => c.severity === val).length;
  };

  // Interactive configurations matching requested features
  const [historySidebar, setHistorySidebar] = useState<{ isOpen: boolean; employeeId: string; employeeName: string }>({
    isOpen: false,
    employeeId: '',
    employeeName: ''
  });
  const [warningLetterOpen, setWarningLetterOpen] = useState(false);
  const [dueProcessState, setDueProcessState] = useState<{ isOpen: boolean; caseId: string; employeeName: string; checkedSteps: Record<string, boolean> }>({
    isOpen: false,
    caseId: '',
    employeeName: '',
    checkedSteps: {}
  });
  const [selectedTimelineCase, setSelectedTimelineCase] = useState<any>(INITIAL_CASES[1]);

  // Calculating Real-world high responsive stats based on the active case set
  const stats = useMemo(() => {
    const total = cases.length;
    const critical = cases.filter(c => c.severity === 'Critical').length;
    const active = cases.filter(c => c.status !== 'Completed').length;
    const completed = cases.filter(c => c.status === 'Completed').length;
    const unresolvedPoints = cases.filter(c => c.status === 'Fact-Finding' || c.status === 'Accusation').length;
    const rate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      critical,
      active,
      unresolvedPoints,
      completed,
      completionRatePercent: rate.toFixed(0) + '%'
    };
  }, [cases]);

  const uniqueDepts = useMemo(() => {
    const set = new Set<string>();
    cases.forEach(c => { if (c.dept) set.add(c.dept); });
    return Array.from(set);
  }, [cases]);

  const filteredCases = useMemo(() => {
    return cases.filter(item => {
      const query = searchQuery.toLowerCase();
      const matchSearch = item.id.toLowerCase().includes(query) ||
                          item.employeeName.toLowerCase().includes(query) ||
                          item.employeeId.toLowerCase().includes(query) ||
                          item.position.toLowerCase().includes(query) ||
                          item.committeeLead.toLowerCase().includes(query);

      const matchCategory = filterCategory === 'all' || item.category === filterCategory;
      const matchSeverity = filterSeverity === 'all' || item.severity === filterSeverity;
      const matchStatus = filterStatus === 'all' || item.status === filterStatus;

      return matchSearch && matchCategory && matchSeverity && matchStatus;
    });
  }, [cases, searchQuery, filterCategory, filterSeverity, filterStatus]);

  const handleSaveRecord = (record: any) => {
    const existsIndex = cases.findIndex(c => c.id === record.id);
    if (existsIndex >= 0) {
      const updated = [...cases];
      updated[existsIndex] = {
        ...updated[existsIndex],
        ...record
      };
      setCases(updated);
    } else {
      setCases([{ ...record, dueProcessSteps: {} }, ...cases]);
    }
  };

  const handleToggleDueProcessStep = (caseId: string, stepId: string) => {
    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        const currentSteps = c.dueProcessSteps || {};
        const updatedSteps = {
          ...currentSteps,
          [stepId]: !currentSteps[stepId]
        };
        return {
          ...c,
          dueProcessSteps: updatedSteps
        };
      }
      return c;
    }));

    // Keep state fully synchronized in the active modal
    setDueProcessState(prev => {
      if (prev.caseId === caseId) {
        return {
          ...prev,
          checkedSteps: {
            ...prev.checkedSteps,
            [stepId]: !prev.checkedSteps[stepId]
          }
        };
      }
      return prev;
    });
  };

  const handleConfirmDueProcessClearance = (caseId: string) => {
    console.log(`Case ${caseId} passed full labor audit clearance`);
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm(`Are you sure you want to completely discard investigation case ${id}? การกู้ประวัติสืบสวนจะไม่สามารถดำเนินการได้`)) {
      setCases(cases.filter(c => c.id !== id));
    }
  };

  return (
    <div className="flex flex-1 w-full flex-col animate-fadeIn bg-transparent space-y-4 pb-6">
      {/* Floating User Guide Button (มาตรฐานเดียวกับ User Permissions Node) */}
      {typeof document !== 'undefined' && createPortal(
        <button onClick={() => setIsGuideOpen(true)} className="fixed right-0 bg-white border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#932c2e] hover:text-white hover:border-[#932c2e] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group cursor-pointer" style={{ top: '80px' }}>
          <Icons.HelpCircle size={16} className="shrink-0 group-hover:rotate-12 transition-transform text-[#7a8b95] group-hover:text-white" />
          <span className="font-black tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[10px]">USER GUIDE</span>
        </button>,
        document.body
      )}

      {/* User Guide Panel Hook */}
      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Case Editor Dialog Hook */}
      <EditCaseModal isOpen={modalState.isOpen} onClose={() => setModalState({ isOpen: false, record: null })} record={modalState.record} onSave={handleSaveRecord} />

      {/* Quick-view Punishment History Sidebar */}
      <HistorySidebar 
        isOpen={historySidebar.isOpen} 
        onClose={() => setHistorySidebar({ isOpen: false, employeeId: '', employeeName: '' })} 
        employeeId={historySidebar.employeeId} 
        employeeName={historySidebar.employeeName} 
      />

      {/* Due Process Compliance Audit Checklist Modal */}
      <DueProcessChecklistModal 
        isOpen={dueProcessState.isOpen} 
        onClose={() => setDueProcessState(prev => ({ ...prev, isOpen: false }))} 
        caseId={dueProcessState.caseId} 
        employeeName={dueProcessState.employeeName} 
        checkedState={dueProcessState.checkedSteps} 
        onToggleStep={(stepId) => handleToggleDueProcessStep(dueProcessState.caseId, stepId)} 
        onConfirmAll={() => handleConfirmDueProcessClearance(dueProcessState.caseId)} 
      />

      {/* Legally Compliant Warning Letter Library Builder */}
      <WarningLetterLibrary 
        isOpen={warningLetterOpen} 
        onClose={() => setWarningLetterOpen(false)} 
        cases={cases} 
      />

      {/* 2. PAGE HEADER - NO REDUNDANT BACKGROUND PLATE, LAYING DIRECTLY ON HOMEPAGE */}
      <div className="h-14 px-8 flex flex-row items-center justify-between gap-4 z-20 shrink-0">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center group cursor-default shrink-0">
            <div className="absolute inset-0 bg-[#a94228] blur-[15px] opacity-15 rounded-full group-hover:opacity-40 transition-all duration-700"></div>
            <div className="relative z-10 p-1.5 border border-[#a94228]/35 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm">
              <Icons.Scale size={24} strokeWidth={2.5} className="text-[#a94228]" />
            </div>
          </div>
          <div>
            <h2 className="font-black text-[#212c46] uppercase tracking-tighter leading-none" style={{ fontSize: '24px' }}>
              {language === 'EN' ? 'DISCIPLINARY INVESTIGATION' : 'การสอบสวนวินัยพนักงาน'}
            </h2>
            <p className="text-[11px] font-bold text-[#7a8b95] uppercase tracking-[0.2em] mt-1 leading-none">
              Restricted Board Node & Incident Adjudication Registry
            </p>
          </div>
        </div>

        {/* Header Controller Tabs */}
        <div className="flex items-center gap-3">
          <div className="bg-white/50 p-1 rounded-xl border border-white/60 shadow-inner flex flex-wrap items-center gap-1">
            <button onClick={() => setActiveTab('bboard')} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'bboard' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#7a8b95] hover:text-[#a94228]'}`}>
              <Icons.ShieldAlert size={14} /> Case Board
            </button>
            <button onClick={() => setActiveTab('registry')} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'registry' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#7a8b95] hover:text-[#a94228]'}`}>
              <Icons.History size={14} /> Enforced Actions
            </button>
          </div>
        </div>
      </div>

      {/* 3. FLUID CONTENT AREA */}
      <div className="px-4 sm:px-8 w-full mt-[2px] pb-6 flex flex-col space-y-4">
        
        {/* LEAN KPI CARD SECTION - COMPACT AND ELEGANT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCardCompact label="Active Personnel Under Investigation" value={stats.active} icon="user-x" colorAccent={THEME.accent} colorValue={THEME.primary} desc="Current Inquests" />
          <KpiCardCompact label="Fact-Finding Proofing Phase" value={stats.unresolvedPoints} icon="files" colorAccent={THEME.brightGold} colorValue={THEME.primary} desc="Gathering Log" />
          <KpiCardCompact label="Critical Standard Breaches" value={stats.critical} icon="alert-triangle" colorAccent={THEME.danger} colorValue={THEME.danger} desc="Severe Risk Codes" />
          <KpiCardCompact label="Discipline Resolution Rate" value={stats.completionRatePercent} icon="check-square" colorAccent={THEME.success} colorValue={THEME.success} desc="Ratio Closed" />
        </div>

        {/* TABLE FILTER BLOCK */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#eaeaec] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#eaeaec] bg-[#f8f9fa] flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4">
            
            {/* Multi Options dropdown filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Premium Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                    setIsStatusDropdownOpen(false);
                    setIsSeverityDropdownOpen(false);
                  }}
                  className="flex items-center justify-between gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#eaeaec] shadow-2xs text-[11.5px] font-bold text-[#212c46] hover:border-[#b7a159] transition-all select-none cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    {(() => {
                      const selectedObj = categoryOptions.find(o => o.value === filterCategory) || categoryOptions[0];
                      const ActiveIcon = selectedObj.icon;
                      return (
                        <>
                          <span className={`p-0.5 rounded text-[#7a8b95]`}>
                            <ActiveIcon size={12} />
                          </span>
                          <span className="font-extrabold text-[#212c46] truncate">
                            {formatLangText(selectedObj.label)}
                          </span>
                        </>
                      );
                    })()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.2 bg-slate-100 text-slate-500 text-[8.5px] font-extrabold rounded-md border border-slate-200/60">
                      {getCategoryCount(filterCategory)}
                    </span>
                    <Icons.ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                  </span>
                </button>

                {isCategoryDropdownOpen && (
                  <div className="fixed inset-0 z-20" onClick={() => setIsCategoryDropdownOpen(false)} />
                )}

                <AnimatePresence>
                  {isCategoryDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.12 }}
                      className="absolute left-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-30 overflow-hidden min-w-[200px] w-max max-w-[280px]"
                    >
                      <div className="p-1 space-y-0.5">
                        {categoryOptions.map((opt) => {
                          const isSelected = filterCategory === opt.value;
                          const OptionIcon = opt.icon;
                          const count = getCategoryCount(opt.value);
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setFilterCategory(opt.value);
                                setIsCategoryDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                                isSelected 
                                  ? 'bg-[#212c46] text-white font-extrabold shadow-sm' 
                                  : 'text-[#212c46] hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className={`p-1 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                  <OptionIcon size={11} />
                                </span>
                                <span className="truncate">{formatLangText(opt.label)}</span>
                              </div>
                              <span className={`px-1.5 py-0.5 text-[8px] font-black rounded ${
                                isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200/50'
                              }`}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Status Premium Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsStatusDropdownOpen(!isStatusDropdownOpen);
                    setIsCategoryDropdownOpen(false);
                    setIsSeverityDropdownOpen(false);
                  }}
                  className="flex items-center justify-between gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#eaeaec] shadow-2xs text-[11.5px] font-bold text-[#212c46] hover:border-[#b7a159] transition-all select-none cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    {(() => {
                      const selectedObj = statusOptions.find(o => o.value === filterStatus) || statusOptions[0];
                      const ActiveIcon = selectedObj.icon;
                      return (
                        <>
                          <span className={`p-0.5 rounded text-[#7a8b95]`}>
                            <ActiveIcon size={12} />
                          </span>
                          <span className="font-extrabold text-[#212c46] truncate">
                            {formatLangText(selectedObj.label)}
                          </span>
                        </>
                      );
                    })()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.2 bg-slate-100 text-slate-500 text-[8.5px] font-extrabold rounded-md border border-slate-200/60">
                      {getStatusCount(filterStatus)}
                    </span>
                    <Icons.ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                  </span>
                </button>

                {isStatusDropdownOpen && (
                  <div className="fixed inset-0 z-20" onClick={() => setIsStatusDropdownOpen(false)} />
                )}

                <AnimatePresence>
                  {isStatusDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.12 }}
                      className="absolute left-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-30 overflow-hidden min-w-[200px] w-max max-w-[280px]"
                    >
                      <div className="p-1 space-y-0.5">
                        {statusOptions.map((opt) => {
                          const isSelected = filterStatus === opt.value;
                          const OptionIcon = opt.icon;
                          const count = getStatusCount(opt.value);
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setFilterStatus(opt.value);
                                setIsStatusDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                                isSelected 
                                  ? 'bg-[#212c46] text-white font-extrabold shadow-sm' 
                                  : 'text-[#212c46] hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className={`p-1 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                  <OptionIcon size={11} />
                                </span>
                                <span className="truncate">{formatLangText(opt.label)}</span>
                              </div>
                              <span className={`px-1.5 py-0.5 text-[8px] font-black rounded ${
                                isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200/50'
                              }`}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Severity Premium Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsSeverityDropdownOpen(!isSeverityDropdownOpen);
                    setIsCategoryDropdownOpen(false);
                    setIsStatusDropdownOpen(false);
                  }}
                  className="flex items-center justify-between gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#eaeaec] shadow-2xs text-[11.5px] font-bold text-[#212c46] hover:border-[#b7a159] transition-all select-none cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    {(() => {
                      const selectedObj = severityOptions.find(o => o.value === filterSeverity) || severityOptions[0];
                      const ActiveIcon = selectedObj.icon;
                      return (
                        <>
                          <span className={`p-0.5 rounded text-[#7a8b95]`}>
                            <ActiveIcon size={12} />
                          </span>
                          <span className="font-extrabold text-[#212c46] truncate">
                            {formatLangText(selectedObj.label)}
                          </span>
                        </>
                      );
                    })()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.2 bg-slate-100 text-slate-500 text-[8.5px] font-extrabold rounded-md border border-slate-200/60">
                      {getSeverityCount(filterSeverity)}
                    </span>
                    <Icons.ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${isSeverityDropdownOpen ? 'rotate-180' : ''}`} />
                  </span>
                </button>

                {isSeverityDropdownOpen && (
                  <div className="fixed inset-0 z-20" onClick={() => setIsSeverityDropdownOpen(false)} />
                )}

                <AnimatePresence>
                  {isSeverityDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.12 }}
                      className="absolute left-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-30 overflow-hidden min-w-[200px] w-max max-w-[280px]"
                    >
                      <div className="p-1 space-y-0.5">
                        {severityOptions.map((opt) => {
                          const isSelected = filterSeverity === opt.value;
                          const OptionIcon = opt.icon;
                          const count = getSeverityCount(opt.value);
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setFilterSeverity(opt.value);
                                setIsSeverityDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                                isSelected 
                                  ? 'bg-[#212c46] text-white font-extrabold shadow-sm' 
                                  : 'text-[#212c46] hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className={`p-1 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                  <OptionIcon size={11} />
                                </span>
                                <span className="truncate">{formatLangText(opt.label)}</span>
                              </div>
                              <span className={`px-1.5 py-0.5 text-[8px] font-black rounded ${
                                isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200/50'
                              }`}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Global search input & creation button */}
            <div className="flex items-center gap-3 w-full xl:w-auto">
              <div className="relative flex-1 xl:w-80">
                <Icons.Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7a8b95]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={language === 'EN' ? "Search case, name, or lead..." : "ค้นหาเลขที่คดี, ชื่อผู้เกี่ยวข้อง, คณะสืบสวน..."}
                  className="w-full pl-10 pr-4 py-2 text-[11.5px] border border-[#eaeaec] rounded-full font-bold outline-none focus:border-[#b7a159] bg-white text-[#212c46] shadow-2xs"
                />
              </div>
              <button
                onClick={() => setWarningLetterOpen(true)}
                className="bg-white text-[#212c46] border border-[#eaeaec] px-5 py-2 rounded-full font-black text-[11.5px] uppercase tracking-wider shadow-xs hover:bg-[#212c46] hover:text-white transition-all flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Icons.FileText size={14} className="text-[#b58c4f]" /> {formatLangText('Warnings Library / คลังจดหมายเตือน')}
              </button>
              <button
                onClick={() => setModalState({ isOpen: true, record: null })}
                className="bg-[#212c46] text-white px-5 py-2 rounded-full font-black text-[11.5px] uppercase tracking-wider shadow-md hover:bg-[#a94228] transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Icons.Plus size={14} /> {formatLangText('New Case / สร้างสำนวนคดี')}
              </button>
            </div>
          </div>

          {/* DRAGGABLE LIST / TABLE COMPONENT */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans border-collapse">
              <thead className="bg-[#222b38] text-white">
                <tr className="border-b-2 border-[#709654]">
                  <th className="py-4 px-4 text-[12px] font-black uppercase tracking-widest text-[#709654] w-[13%] font-mono">
                    {language === 'EN' ? 'CASE NUMBER' : 'เลขที่สำนวนคดี'}
                  </th>
                  <th className="py-4 px-4 text-[12px] font-black uppercase tracking-widest text-left w-[24%]">
                    {language === 'EN' ? 'ACCUSED CORPORATE PERSONNEL' : 'พนักงานผู้เกี่ยวข้อง'}
                  </th>
                  <th className="py-4 px-4 text-[12px] font-black uppercase tracking-widest text-left w-[25%]">
                    {language === 'EN' ? 'ALLEGATIONS DESCRIPTION' : 'รายละเอียดบริบทความผิดวินัย'}
                  </th>
                  <th className="py-4 px-4 text-[12px] font-black uppercase tracking-widest text-left w-[14%]">
                    {language === 'EN' ? 'COMMITTEE HEAD LEAD' : 'ประธานกรรมการพิจารณา'}
                  </th>
                  <th className="py-4 px-4 text-[12px] font-black uppercase tracking-widest text-center w-[16%]">
                    {language === 'EN' ? 'INQUEST FLOW STATUS' : 'สถานะสืบสวน'}
                  </th>
                  <th className="py-4 px-4 text-[12px] font-black uppercase tracking-widest text-center w-[8%]">
                    {language === 'EN' ? 'ACTIONS' : 'จัดการ'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#eaeaec]">
                {filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-[#7a8b95] font-bold uppercase tracking-widest">
                      <Icons.Inbox className="mx-auto w-8 h-8 opacity-40 mb-2" />
                      {formatLangText('No active inquiry cases found / ไม่พบข้อมูลสำนวนการสอบสวนคดี')}
                    </td>
                  </tr>
                ) : (
                  filteredCases.map(item => {
                    const isCompleted = item.status === 'Completed';
                    const isCritical = item.severity === 'Critical';
                    return (
                      <tr key={item.id} className="hover:bg-[#f8f9fa] transition-colors group">
                        {/* Case identity code */}
                        <td className="py-2.5 px-4 font-mono font-bold text-gray-400 text-[11.5px] truncate select-all">
                          {item.id}
                        </td>
                        
                        {/* Accused identity details */}
                        <td className="py-2.5 px-4">
                          <div className="flex flex-col max-w-sm truncate">
                            <span className="font-extrabold text-[#212c46] tracking-tight text-[12px]">{item.employeeName}</span>
                            <span className="text-[10px] font-mono font-bold text-[#a94228] mt-0.5">{item.employeeId} &bull; {item.dept}</span>
                            <span className="text-[10px] font-bold text-slate-400">{item.position}</span>
                          </div>
                        </td>

                        {/* Text allegation body details */}
                        <td className="py-2.5 px-4">
                          <div className="max-w-md">
                            <p className="text-[11.5px] font-bold text-[#414757] leading-relaxed line-clamp-2" title={item.accusation}>
                              {item.accusation}
                            </p>
                            
                            {/* Actions / Punishment tag preview */}
                            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                              <span className={`inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[9.5px] font-bold tracking-tight uppercase ${isCritical ? 'bg-rose-50 text-[#932c2e] border border-rose-200' : 'bg-[#b7a159]/10 text-[#b58c4f]'}`}>
                                {item.severity} Risk
                              </span>
                              {isCompleted && (
                                <span className="text-[9.5px] font-black text-[#657f4d] bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                                  {formatLangText('Enforced Punishment Complete / ดำเนินการลงโทษลุล่วง')}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Chairman in charge */}
                        <td className="py-2.5 px-4 text-slate-600 font-bold text-[12px]">
                          {item.committeeLead || '-'}
                        </td>

                        {/* Visual Stage Progress Bar and status text */}
                        <td className="py-2.5 px-4">
                          <div className="flex flex-col gap-1 max-w-[140px] mx-auto">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className={`inline-flex items-center gap-1 font-black uppercase text-[10px] ${
                                item.status === 'Completed'
                                  ? 'text-[#657f4d]'
                                  : item.status === 'Committee Review' || item.status === 'Pending Resolution'
                                  ? 'text-[#b58c4f]'
                                  : 'text-sky-600'
                              }`}>
                                {formatLangText(item.status)}
                              </span>
                              <span className="font-mono font-extrabold text-[#212c46]">{item.progress}%</span>
                            </div>
                            
                            {/* Horizontal progress visualization scale */}
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden border border-[#eaeaec]">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  item.status === 'Completed'
                                    ? 'bg-[#657f4d]'
                                    : item.status === 'Committee Review' || item.status === 'Pending Resolution'
                                    ? 'bg-[#b58c4f]'
                                    : 'bg-sky-500'
                                  }`}
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Interactive actions */}
                        <td className="py-2.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-[1px]">
                            <button
                              onClick={() => {
                                setSelectedTimelineCase(item);
                                // Scroll to timeline
                                document.getElementById('lifecycle-timeline-section')?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                                selectedTimelineCase?.id === item.id 
                                  ? 'bg-[#b7a159] text-white' 
                                  : 'text-slate-500 hover:text-white hover:bg-[#b7a159]'
                              }`}
                              title={formatLangText('Trace Case Timeline / ติดตามความคืบหน้าขั้นตอนคดี')}
                            >
                              <Icons.GitCommit size={12} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => setDueProcessState({
                                isOpen: true,
                                caseId: item.id,
                                employeeName: item.employeeName,
                                checkedSteps: item.dueProcessSteps || {}
                              })}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-[#657f4d] transition-colors cursor-pointer"
                              title={formatLangText('Due Process Audit / ตรวจสอบขั้นตอนทางกฎหมาย')}
                            >
                              <Icons.ShieldCheck size={12} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => setHistorySidebar({
                                isOpen: true,
                                employeeId: item.employeeId,
                                employeeName: item.employeeName
                              })}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-[#4d87a8] transition-colors cursor-pointer"
                              title={formatLangText('Punishment History Sidebar / ดูประวัติพฤติกรรมย้อนหลัง')}
                            >
                              <Icons.History size={12} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => setModalState({ isOpen: true, record: item })}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-[#212c46] transition-colors cursor-pointer"
                              title="Edit Case Details"
                            >
                              <Icons.Edit3 size={12} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(item.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-700 transition-colors cursor-pointer"
                              title="Discard Case link"
                            >
                              <Icons.Trash2 size={12} strokeWidth={2.5} />
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
        </div>

        {/* Interactive Case Lifecycle Timeline Component */}
        {selectedTimelineCase && (
          <div id="lifecycle-timeline-section" className="bg-white rounded-3xl p-6 border border-[#eaeaec] shadow-sm mt-4 animate-scaleUp">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 mb-6">
              <div>
                <span className="text-[10px] font-black uppercase text-[#b58c4f] tracking-widest font-mono">
                  {formatLangText('LIVE CASE TRACING & LIFECYCLE / แผนภูมิการสืบสวนและสิทธิเรียกร้องพนักงาน')}
                </span>
                <h4 className="text-[14px] font-black text-[#212c46] uppercase tracking-tight mt-1">
                  Timeline Case: {selectedTimelineCase.id} &bull; {selectedTimelineCase.employeeName}
                </h4>
                <p className="text-[11px] font-bold text-[#7a8b95] mt-1">
                  {formatLangText('Accused of / ข้อกล่าวหา:')} <span className="text-[#a94228] italic font-normal">{selectedTimelineCase.accusation}</span>
                </p>
              </div>
              <div className="mt-3 md:mt-0 flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Current Phase:</span>
                <span className="text-[11px] font-black uppercase tracking-wide px-3 py-1 bg-[#212c46] text-white rounded-lg">
                  {formatLangText(selectedTimelineCase.status)}
                </span>
              </div>
            </div>

            {/* Embed the beautiful CaseTimeline component */}
            <div className="pt-2">
              <CaseTimeline 
                progress={selectedTimelineCase.progress} 
                status={selectedTimelineCase.status} 
                date={selectedTimelineCase.date} 
                id={selectedTimelineCase.id} 
              />
            </div>
          </div>
        )}

        {/* 32px Footer Spacing Margin Section - mt-8 helps create consistent layout flow */}
        <div className="mt-8 shrink-0 flex justify-between items-center text-[#7a8b95] text-[11px] font-bold uppercase tracking-wider">
          <div>SHOWING {filteredCases.length} OF {cases.length} {language === 'EN' ? 'INVESTIGATION CASES' : 'คดีสอบสวนวินัยทั้งหมด'}</div>
          <div>SMART LAW NODE VERSION 4.1.2026</div>
        </div>
      </div>
    </div>
  );
}
