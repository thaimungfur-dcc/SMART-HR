import { UserGuidePanel } from '../../components/shared/UserGuidePanel';
import KpiCard from '../../components/shared/KpiCard';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';
import { 
  FileText, ShieldAlert, BookOpen, Search, Filter, 
  Plus, ChevronLeft, ChevronRight, Download, Edit3, Trash2, 
  HelpCircle, X, CheckCircle2, Clock, Calendar, 
  Info, Save, FileCheck, AlignLeft, Paperclip, FileUp, File, FileImage,
  Sparkles, History, HardDrive, ListCollapse
} from 'lucide-react';
import { DraggableModal } from '../../components/shared/DraggableModal';
import { PrintPreviewModal } from '../../components/shared/PrintPreviewModal';

// --- System Colors (Synced perfectly with the Home/User Permissions System) ---
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
  coolGray: '#eaeaec',
  palette: {
    maroon: '#932c2e', sage: '#606a5f', charcoal: '#414757', brick: '#851c24', 
    navy: '#212c46', burntOrange: '#a94228', gold: '#b58c4f', forest: '#657f4d', 
    sand: '#b7a159', mustard: '#8e9141', plum: '#a54f6b', olive: '#bab98b',
    bronze: '#8b2c3d', apple: '#818d47', rose: '#ab7d82', slate: '#748b9e',
    cerulean: '#3f809e', moss: '#84896d', mutedBlue: '#748ea1', red: '#212c46',
    black: '#2f2926', steel: '#4d87a8', coral: '#d96245', deepGreen: '#508660',
    midnight: '#2d2c4a', warmGrey: '#7a8b95', dustyGreen: '#939885', cream: '#f3f3f1'
  }
};

// --- Exact Mock Documents (100% compliant with original samples and user-specified chapters) ---
const MOCK_DOCUMENTS = [
  { 
    id: 'REG-001', 
    title: 'หมวดที่ 1: บททั่วไป', 
    category: '1 บททั่วไป', 
    status: 'Active', 
    updatedBy: 'HR Admin', 
    date: '2024-01-15', 
    version: 'v2.4', 
    color: THEME.primary, 
    content: 'ข้อบังคับเกี่ยวกับการทำงานฉบับนี้จัดทำขึ้นตามพระราชบัญญัติคุ้มครองแรงงาน พ.ศ. 2541 เพื่อให้พนักงานของ บริษัท ชัยศรี อะโกรอินดัสเทรียล จำกัด รับทราบกฎระเบียบปฏิบัติและมาตรฐานจริยธรรมร่วมกัน โดยพนักงานทุกคนมีหน้าที่ปฏิบัติตามกฎนี้อย่างเคร่งครัดตั้งแต่ขั้นตอนการสมัครและบรรจุเข้าทำงาน',
    attachments: [
      { name: 'general_provisions_v2.4.pdf', size: '1.2 MB', type: 'application/pdf' }
    ]
  },
  { 
    id: 'REG-002', 
    title: 'หมวดที่ 2: การว่าจ้าง', 
    category: '2 การว่าจ้าง', 
    status: 'Active', 
    updatedBy: 'HR Admin', 
    date: '2024-01-15', 
    version: 'v2.4', 
    color: THEME.palette.sage || THEME.primary, 
    content: 'การว่าจ้างและทดลองงาน:\n1. เอกสารที่ใช้ในการสมัครงานและการคัดเลือกต้องถูกต้องตามความเป็นจริง\n2. ระยะเวลาการทดลองงานกำหนดไว้ไม่เกิน 120 วันเพื่อประเมินศักยภาพพนักงาน\n3. การแต่งตั้งโยกย้ายตำแหน่งงานตามความเหมาะสมและความจำเป็นของกำลังพล',
    attachments: [
      { name: 'employment_agreement_template.docx', size: '850 KB', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
    ]
  },
  { 
    id: 'REG-003', 
    title: 'หมวดที่ 3: วันทำงาน เวลาทำงานปกติ และเวลาพัก', 
    category: '3 วันทำงาน เวลาทำงานปกติ และเวลาพัก', 
    status: 'Active', 
    updatedBy: 'HR Admin', 
    date: '2024-01-15', 
    version: 'v2.4', 
    color: THEME.palette.charcoal || THEME.primary, 
    content: 'ชั่วโมงการทำงานและเวลาหยุดพักผ่อน:\n- วันทำงานปกติ: วันจันทร์ถึงวันศุกร์ (หรือวันเสาร์ตามลักษณะงานสายผลิต)\n- เวลาทำงานปกติ: 08:00 น. - 17:00 น.\n- เวลาหยุดพักประจำวัน: 12:00 น. - 13:00 น. (พัก 1 ชั่วโมงเต็ม)',
    attachments: [
      { name: 'work_shifts_calendar_2567.pdf', size: '1.5 MB', type: 'application/pdf' }
    ]
  },
  { 
    id: 'REG-004', 
    title: 'หมวดที่ 4: วันลา และหลักเกณฑ์การลา', 
    category: '4 วันลา และหลักเกณฑ์การลา', 
    status: 'Active', 
    updatedBy: 'HR Admin', 
    date: '2024-01-15', 
    version: 'v2.4', 
    color: THEME.palette.burntOrange || THEME.primary, 
    content: 'สิทธิและกระบวนการลาของพนักงาน:\n1. ลาป่วย: ได้รับค่าจ้างไม่เกิน 30 วันทำงานต่อปี (หากลาเกิน 3 วันทำงานต้องมีใบรับรองแพทย์)\n2. ลากิจเพื่อธุระอันจำเป็น: ได้รับสิทธิ์ลาไม่น้อยกว่า 3 วันทำงานต่อปีโดยได้รับค่าจ้าง\n3. ลาคลอด: ลาเพื่อคลอดบุตรได้ไม่เกิน 98 วัน โดยได้รับค่าจ้าง 45 วันจากบริษัท\n4. ลาทำหมัน, ลารับราชการทหาร, ลาเพื่อฝึกอบรม',
    attachments: [
      { name: 'leave_request_workflow.png', size: '420 KB', type: 'image/png' }
    ]
  },
  { 
    id: 'REG-005', 
    title: 'หมวดที่ 5: วันหยุด และหลักเกณฑ์การหยุด', 
    category: '5 วันหยุด และหลักเกณฑ์การหยุด', 
    status: 'Active', 
    updatedBy: 'HR Admin', 
    date: '2024-01-15', 
    version: 'v2.4', 
    color: THEME.palette.gold || THEME.primary, 
    content: 'ระเบียบการกำหนดวันหยุดต่างๆ บันทึกไว้เป็นฐานปฏิบัติงานพนักงาน:\n1. วันหยุดประจำสัปดาห์: อย่างน้อยสัปดาห์ละ 1 วัน (วันอาทิตย์)\n2. วันหยุดตามประเพณี: ไม่น้อยกว่า 13 วันต่อปี รวมวันแรงงานแห่งชาติโดยพนักงานได้รับค่าจ้าง\n3. วันหยุดพักผ่อนประจำปี (พักร้อน): พนักงานที่ทำงานครบ 1 ปีขึ้นไป มีสิทธิหยุดไม่น้อยกว่า 6 วันทำงานต่อปี',
    attachments: [
      { name: 'company_holidays_2567.pdf', size: '920 KB', type: 'application/pdf' }
    ]
  },
  { 
    id: 'REG-006', 
    title: 'หมวดที่ 6: หลักเกณฑ์การทำงานล่วงเวลา ทำงานในวันหยุด และการทำงานล่วงเวลาในวันหยุด', 
    category: '6 หลักเกณฑ์การทำงานล่วงเวลา ทำงานในวันหยุด และการทำงานล่วงเวลาในวันหยุด', 
    status: 'Active', 
    updatedBy: 'HR Admin', 
    date: '2024-01-15', 
    version: 'v2.4', 
    color: THEME.palette.forest || THEME.primary, 
    content: 'การอนุมัติและระวางเวลาการทำงานล่วงเวลา (OT):\n1. การทำงานล่วงเวลาหรือทำงานในวันหยุด ต้องไม่มีลักษณะที่ก่ออันตราย และพนักงานต้องให้การยินยอมล่วงหน้าเป็นลายลักษณ์อักษร\n2. อัตราการจ่ายชดเชยจะคำนวณตามข้อบังคับกฎหมายแรงงานกำหนด (1.5 เท่า สำหรับล่วงเวลาปกติ, 1 เท่า หรือ 3 เท่า สำหรับงานวันหยุดแล้วแต่กรณี)',
    attachments: []
  },
  { 
    id: 'REG-007', 
    title: 'หมวดที่ 7: วันและสถานที่ที่จ่ายค่าจ้างค่าล่วงเวลาค่าทำงานในวันหยุด และค่าล่วงเวลาในวันหยุด', 
    category: '7 วันและสถานที่ที่จ่ายค่าจ้างค่าล่วงเวลาค่าทำงานในวันหยุด และค่าล่วงเวลาในวันหยุด', 
    status: 'Active', 
    updatedBy: 'HR Admin', 
    date: '2024-01-15', 
    version: 'v2.4', 
    color: THEME.palette.sand || THEME.primary, 
    content: 'นโยบายการจ่ายเงินเดือนและผลตอบแทน:\n1. บริษัทดำเนินการจ่ายค่าจ้าง ค่าล่วงเวลา (OT) และค่าทำงานในวันหยุดเดือนละ 1 ครั้ง ผ่านทางบัญชีธนาคารพนักงานโดยตรง\n2. กำหนดจ่าย ณ วันทำการสุดท้ายของเดือน\n3. จัดเตรียมเอกสารสลิปเงินเดือน (Payslip) ให้พนักงานตรวจสอบผ่านระบบอิเล็กทรอนิกส์ร่วมกัน',
    attachments: []
  },
  { 
    id: 'REG-008', 
    title: 'หมวดที่ 8: วินัยและโทษทางวินัย', 
    category: '8 วินัยและโทษทางวินัย', 
    status: 'Active', 
    updatedBy: 'HR Admin', 
    date: '2024-01-15', 
    version: 'v2.4', 
    color: THEME.palette.mustard || THEME.primary, 
    content: 'ระบบการรักษาวินัยภายในหน่วยงาน:\n1. พนักงานต้องปฏิบัติตามหน้าที่อย่างซื่อสัตย์สุจริต ละเว้นการใช้อำนาจหน้าที่โดยมิชอบ\n2. มาตรการลงโทษทางวินัยประกอบด้วย 4 ขั้นตอนหลัก:\n   - การตักเตือนด้วยวาจา (มีบันทึกจดจำ)\n   - การตักเตือนเป็นลายลักษณ์อักษร (หนังสือเตือน มีผลบังคับใช้ 1 ปี)\n   - การพักงานโดยไม่ได้รับค่าจ้าง\n   - การเลิกจ้างโดยไม่จ่ายค่าชดเชย (กรณีกระทำผิดวินัยร้ายแรงซ้ำซาก)',
    attachments: [
      { name: 'disciplinary_guidelines_poster.pdf', size: '1.4 MB', type: 'application/pdf' }
    ]
  },
  { 
    id: 'REG-009', 
    title: 'หมวดที่ 9: การร้องทุกข์', 
    category: '9 การร้องทุกข์', 
    status: 'Active', 
    updatedBy: 'HR Admin', 
    date: '2024-01-15', 
    version: 'v2.4', 
    color: THEME.palette.plum || THEME.primary, 
    content: 'กระบวนการระงับและพิจารณาความไม่พึงพอใจของพนักงาน:\n1. ลูกจ้างที่ได้รับความเดือดร้อน มีสิทธิยื่นคำร้องทุกข์ต่อผู้บังคับบัญชาตามลำดับขั้นความช่วยเหลือ\n2. ผู้รับคำร้องต้องดำเนินการสอบสวนหาความจริงวิเคราะห์และแจ้งผลให้เสร็จสิ้นภายใน 15-30 วันทำการ\n3. มีระบบปกป้องข้อมูลผู้ร้องเพื่อความโปร่งใส',
    attachments: []
  },
  { 
    id: 'REG-010', 
    title: 'หมวดที่ 10: การเลิกจ้างการพ้นสภาพการเป็นพนักงานและการจ่ายค่าชดเชย', 
    category: '10 การเลิกจ้างการพ้นสภาพการเป็นพนักงานและการจ่ายค่าชดเชย', 
    status: 'Active', 
    updatedBy: 'HR Admin', 
    date: '2024-01-15', 
    version: 'v2.4', 
    color: THEME.palette.bronze || THEME.primary, 
    content: 'เกณฑ์ความพ้นสภาพพนักงานและการจ่ายเงินชดเชย:\n1. การพ้นสภาพจากการเกษียณอายุ (ครบ 60 ปีบริบูรณ์) หรือการยื่นหนังสือลาออกล่วงหน้าไม่น้อยกว่า 30 วัน\n2. อัตราการจ่ายชดเชยกรณีนายจ้างเลิกจ้าง จัดสรรตามพระราชบัญญัติคุ้มครองแรงงาน มาตรา 118 ตามระยะเวลาก่อนหน้าอายุงาน\n3. ข้อยกเว้นการจ่ายตามมาตรา 119 (เช่น ทุจริต, ละทิ้งหน้าที่เกิน 3 วันติดต่อกัน)',
    attachments: [
      { name: 'severance_pay_calculator.pdf', size: '1.1 MB', type: 'application/pdf' }
    ]
  },
  { 
    id: 'REG-011', 
    title: 'หมวดที่ 11: สภาพการบังคับและการประกาศใช้', 
    category: '11 สภาพการบังคับและการประกาศใช้', 
    status: 'Active', 
    updatedBy: 'HR Admin', 
    date: '2024-01-15', 
    version: 'v2.4', 
    color: THEME.palette.apple || THEME.primary, 
    content: 'ความมีผลและการประกาศครอบคลุมสิทธิพนักงาน:\n1. ข้อบังคับเกี่ยวกับการทำงานฉบับนี้ มีผลบังคับใช้กับพนักงานของบริษัทฯ ทุกตำแหน่งงาน ตั้งแต่วันที่ 1 มกราคม พ.ศ. 2567 เป็นต้นไป\n2. การแก้ไขเพิ่มเติมในอนาคต จะต้องประกาศแจ้งให้พนักงานทราบเป็นลายลักษณ์อักษรอย่างน้อย 7 วันล่วงหน้า',
    attachments: [
      { name: 'official_announcement_signed.pdf', size: '1.8 MB', type: 'application/pdf' }
    ]
  }
];

interface Attachment {
  name: string;
  size: string;
  type: string;
}

interface LawDocument {
  id?: string;
  title: string;
  category: string;
  status: string;
  updatedBy?: string;
  date?: string;
  version?: string;
  color?: string;
  content: string;
  attachments: Attachment[];
}

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: LawDocument | null;
  onSave: (doc: LawDocument) => void;
}

// --- Draggable Document Detail & Creator Modal ---
const DocumentModal = ({ isOpen, onClose, document: activeDoc, onSave }: DocumentModalProps) => {
  const [formData, setFormData] = useState<LawDocument>({ title: '', category: '1 บททั่วไป', version: 'v1.0', status: 'Active', content: '', attachments: [] });
  const [isReadOnly, setIsReadOnly] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeDoc) {
      setFormData({ ...activeDoc, attachments: activeDoc.attachments || [] });
      setIsReadOnly(false); 
    } else {
      setFormData({ title: '', category: '1 บททั่วไป', version: 'v1.0', status: 'Active', content: '', attachments: [] });
      setIsReadOnly(false);
    }
  }, [activeDoc, isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files: File[] = Array.from(e.target.files) as File[];
      const newAttachments = files.map(f => ({
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(2) + ' MB',
        type: f.type
      }));
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newAttachments]
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;
  return (
    <DraggableModal
        isOpen={isOpen}
        onClose={onClose}
        width="max-w-[850px]"
        customHeader={
            <div className="bg-[#212c46] px-5 py-3.5 flex justify-between items-center text-[#f3f3f1] shrink-0 border-b-2 border-[#b58c4f]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <FileCheck size={20} className="text-[#b58c4f]"/>
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest leading-none">
                  {activeDoc ? 'Edit Document Node' : 'Initialize New Document'}
                </h3>
              </div>
              <button onClick={onClose} className="hover:text-[#932c2e] text-white/70 transition-colors p-1.5 bg-white/10 hover:bg-white/20 rounded-full"><X size={16}/></button>
            </div>
        }
    >
        <div className="flex-1 flex flex-col overflow-hidden bg-white max-h-[75vh]">
          <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#7a8b95] uppercase tracking-widest ml-1">Document Title</label>
                <input 
                  type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  readOnly={isReadOnly}
                  className={`w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b58c4f] text-[12px] font-bold ${isReadOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
                  placeholder="ระบุชื่อเรียกเอกสาร..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#7a8b95] uppercase tracking-widest ml-1">Category Registry</label>
                <div className="relative">
                  <select 
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                    disabled={isReadOnly}
                    className={`w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b58c4f] text-[12px] font-bold cursor-pointer ${isReadOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <option value="1 บททั่วไป">1 บททั่วไป</option>
                    <option value="2 การว่าจ้าง">2 การว่าจ้าง</option>
                    <option value="3 วันทำงาน เวลาทำงานปกติ และเวลาพัก">3 วันทำงาน เวลาทำงานปกติ และเวลาพัก</option>
                    <option value="4 วันลา และหลักเกณฑ์การลา">4 วันลา และหลักเกณฑ์การลา</option>
                    <option value="5 วันหยุด และหลักเกณฑ์การหยุด">5 วันหยุด และหลักเกณฑ์การหยุด</option>
                    <option value="6 หลักเกณฑ์การทำงานล่วงเวลา ทำงานในวันหยุด และการทำงานล่วงเวลาในวันหยุด">6 หลักเกณฑ์การทำงานล่วงเวลา...</option>
                    <option value="7 วันและสถานที่ที่จ่ายค่าจ้างค่าล่วงเวลาค่าทำงานในวันหยุด และค่าล่วงเวลาในวันหยุด">7 วันและสถานที่ที่จ่ายค่าจ้าง...</option>
                    <option value="8 วินัยและโทษทางวินัย">8 วินัยและโทษทางวินัย</option>
                    <option value="9 การร้องทุกข์">9 การร้องทุกข์</option>
                    <option value="10 การเลิกจ้างการพ้นสภาพการเป็นพนักงานและการจ่ายค่าชดเชย">10 การเลิกจ้างการพ้นสภาพฯ</option>
                    <option value="11 สภาพการบังคับและการประกาศใช้">11 สภาพการบังคับและการประกาศใช้</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#7a8b95] uppercase tracking-widest ml-1">Version Control</label>
                <input 
                  type="text" value={formData.version || 'v1.0'} onChange={e => setFormData({...formData, version: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b58c4f] text-[12px] font-bold"
                  placeholder="e.g. v2.4, v4.0"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#7a8b95] uppercase tracking-widest ml-1">Status Enforced</label>
                <select 
                  value={formData.status || 'Active'} onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl outline-none focus:border-[#b58c4f] text-[12px] font-bold cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-[#7a8b95] uppercase tracking-widest">Document Full Content</label>
                <span className="text-[9px] font-mono text-[#b58c4f] uppercase tracking-widest bg-[#b58c4f]/10 px-2 py-0.5 rounded font-black">Secure Text Repository</span>
              </div>
              <textarea 
                value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                readOnly={isReadOnly}
                rows={6}
                className={`w-full px-4 py-3 bg-[#f8fafc] border border-slate-200 rounded-2xl outline-none focus:border-[#b58c4f] text-[12px] font-medium leading-relaxed resize-none custom-scrollbar ${isReadOnly ? 'opacity-80' : ''}`}
                placeholder="พิมพ์เนื้อหาของกฎระเบียบหรือข้อกฎหมายอย่างละเอียดที่นี่..."
              />
            </div>

            {/* ATTACHMENT SECTION */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                 <label className="text-[10px] font-black text-[#7a8b95] uppercase tracking-widest flex items-center gap-2">
                   <Paperclip size={13}/> Attachments Node
                 </label>
                 <button 
                   type="button"
                   onClick={() => fileInputRef.current?.click()}
                   className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#3f809e] hover:text-[#212c46] cursor-pointer"
                 >
                   <FileUp size={13}/> Upload Files
                 </button>
                 <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple className="hidden" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {formData.attachments?.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl hover:border-[#3f809e]/40 transition-all shadow-xs">
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-7 h-7 rounded-lg bg-[#3f809e]/10 text-[#3f809e] flex items-center justify-center shrink-0 font-bold">
                        {file.type && file.type.includes('image') ? <FileImage size={14}/> : <File size={14}/>}
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="text-[11px] font-bold text-[#212c46] truncate">{file.name}</span>
                        <span className="text-[9px] font-mono text-[#7a8b95]">{file.size}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button type="button" className="p-1 text-[#b58c4f] hover:bg-[#b58c4f]/10 rounded-lg" title="Download"><Download size={13}/></button>
                      <button type="button" onClick={() => removeAttachment(idx)} className="p-1 text-[#932c2e] hover:bg-[#932c2e]/10 rounded-lg" title="Remove"><Trash2 size={13}/></button>
                    </div>
                  </div>
                ))}
                {(!formData.attachments || formData.attachments.length === 0) && (
                  <div className="col-span-full py-4 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-[#7a8b95] opacity-60">
                     <Icons.FileSearch size={20} className="mb-1 text-slate-400"/>
                     <span className="text-[9px] font-black uppercase tracking-widest">No attachments linked</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          <div className="px-6 py-4 bg-[#f8fafc] border-t border-slate-100 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-1.5 text-[9px] text-[#7a8b95] font-mono font-black uppercase tracking-widest">
              <Info size={13}/> Node Integrity: Verified
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest text-[#606a5f] hover:bg-[#f3f3f1] border border-[#eaeaec] bg-white cursor-pointer hover:text-[#212c46]">
                Cancel
              </button>
              <button type="button" onClick={() => { onSave(formData); onClose(); }} className="px-5 py-2 bg-[#212c46] text-white rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-[#414757] shadow-xs active:scale-95 border border-[#212c46] cursor-pointer">
                <Save size={14}/> Save Database
              </button>
            </div>
          </div>
        </div>
    </DraggableModal>
  );
};

// --- Printable PDF Preview Modal ---
interface RegulationPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: LawDocument | null;
}

const RegulationPreviewModal = ({ isOpen, onClose, document: record }: RegulationPreviewModalProps) => {
  if (!isOpen || !record) return null;

  return (
    <PrintPreviewModal
      isOpen={isOpen}
      onClose={onClose}
      title={record.title}
      documentId={record.id}
      defaultWatermark="CONFIDENTIAL"
    >
      <div className="space-y-6">
        {/* Document Title Banner */}
        <div className="bg-[#212c46] text-white p-4 rounded-xl mb-4 flex flex-col items-center">
          <h1 className="text-[14px] font-black uppercase tracking-widest leading-none mb-1.5 text-center text-[#b58c4f]">
            ข้อบังคับและระเบียบปฏิบัติเกี่ยวกับการทำงาน
          </h1>
          <p className="text-[9px] text-slate-300 tracking-wider text-center uppercase leading-none font-mono">
            WORKPLACE REGULATIONS & COMPLIANCE SYSTEM
          </p>
        </div>

        {/* Document Details Metadata bar */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-[11px]">
          <div>
            <p className="text-[#a94228] font-black uppercase tracking-wider text-[9px] mb-0.5">CLASSIFICATION / หมวดหมู่งาน</p>
            <p className="font-extrabold text-[#212c46] text-[11px] truncate">{record.category}</p>
          </div>
          <div>
            <p className="text-[#a94228] font-black uppercase tracking-wider text-[9px] mb-0.5">LAST UPDATED / อัปเดตล่าสุด</p>
            <p className="font-extrabold text-[#212c46] text-[11px] font-mono">{record.date} (โดย {record.updatedBy || 'HR Admin'})</p>
          </div>
          <div>
            <p className="text-[#a94228] font-black uppercase tracking-wider text-[9px] mb-0.5">SECURITY AUDIT / สถานะระบบ</p>
            <p className="font-extrabold text-[#508660] text-[11px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#508660]"></span> ACTIVE COMPLIANT
            </p>
          </div>
        </div>

        {/* Document Subsection Heading */}
        <div>
          <h3 className="text-[12px] font-black text-[#212c46] border-b border-[#b58c4f]/40 pb-1.5 uppercase tracking-wide flex items-center gap-2">
            <Icons.FileText size={14} className="text-[#b58c4f]"/> {record.title}
          </h3>
        </div>

        {/* Main Content Area */}
        <div className="text-[12px] leading-relaxed text-[#212c46] font-medium whitespace-pre-wrap bg-slate-50/30 p-6 rounded-xl border border-slate-100 min-h-[140mm] font-serif shadow-inner">
          {record.content || 'ไม่มีฐานข้อมูลคำบรรยายระเบียบอย่างเป็นทางการในหมวดนี้'}
        </div>
        
        {/* Attachments */}
        {record.attachments && record.attachments.length > 0 && (
          <div className="mt-4 no-print">
            <h4 className="text-[10px] font-black text-[#7a8b95] uppercase tracking-widest mb-2 flex items-center gap-1.5 font-mono">
              <Icons.Paperclip size={12}/> Linked Official Files ({record.attachments.length})
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              {record.attachments.map((att, i) => (
                <div key={i} className="p-2 bg-slate-50 border border-slate-100 rounded-lg flex justify-between items-center text-[#414757]">
                  <span className="font-bold truncate max-w-[140px]">{att.name}</span>
                  <span className="text-slate-400 font-normal">{att.size}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Core Footer Section */}
        <div className="border-t border-slate-200 pt-8 mt-12">
          <div className="flex justify-between items-end text-[10px] text-[#606a5f]">
            <div>
              <p className="font-bold">จัดทำโดย: ______________________________</p>
              <p className="mt-1 pl-12 text-[9px]">( เจ้าหน้าที่สารระบบทรัพยากรมนุษย์ )</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center text-[8px] text-slate-300 font-black uppercase mb-1 mx-auto leading-tight">
                PROPOSED<br/>OFFICIAL<br/>STAMP
              </div>
              <p className="text-[9px] font-bold">ตราประทับควบคุมเอกสาร TAI</p>
            </div>
            <div className="text-right">
              <p className="font-bold">ลงนามอนุมัติ: ______________________________</p>
              <p className="mt-1 pr-12 text-[9px]">( อธิบดีฝ่ายพิจารณาวินัยและการว่าจ้าง )</p>
            </div>
          </div>
        </div>
      </div>
    </PrintPreviewModal>
  );
};

// --- Main Company Regulations Component ---
export default function CompanyRegulations() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; doc: LawDocument | null }>({ isOpen: false, doc: null });
  const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; doc: LawDocument | null }>({ isOpen: false, doc: null });
  const [documents, setDocuments] = useState<LawDocument[]>(MOCK_DOCUMENTS);
  const [toast, setToast] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: documents.length };
    documents.forEach(doc => {
      counts[doc.category] = (counts[doc.category] || 0) + 1;
    });
    return counts;
  }, [documents]);

  const filteredDocs = useMemo(() => {
    return documents.filter(d => 
      (activeTab === 'All' || d.category === activeTab) &&
      (d.title.toLowerCase().includes(search.toLowerCase()) || d.id?.toLowerCase().includes(search.toLowerCase()))
    );
  }, [documents, search, activeTab]);

  const handleSave = (docData: LawDocument) => {
    if (docData.id) {
      setDocuments(documents.map(d => d.id === docData.id ? docData : d));
      setToast('ปรับปรุงเอกสารข้อบังคับในระบบเรียบร้อยแล้วค่ะ');
    } else {
      const prefix = 'REG';
      const newDoc: LawDocument = { 
        ...docData, 
        id: `${prefix}-${Math.floor(100 + Math.random() * 900)}`, 
        date: new Date().toISOString().split('T')[0], 
        updatedBy: 'HR Admin',
        color: THEME.primary
      };
      setDocuments([newDoc, ...documents]);
      setToast('สร้างระบบข้อบังคับหรือประกาศชิ้นใหม่เสร็จสิ้น');
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = (id: string | undefined) => {
    if (!id) return;
    if(window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบเอกสารนี้ออกจากคลังข้อมูลถาวร?')) {
        setDocuments(documents.filter(d => d.id !== id));
        setToast('นำพาทความจำลองออกจากคลังระบบแล้วค่ะ');
        setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="flex flex-1 w-full flex-col animate-fadeIn bg-transparent space-y-4 pb-6 min-h-0">
      {/* USER GUIDE FLOATING TRIGGER TRIGGERED IN CONTAINER */}
      {typeof window !== 'undefined' && createPortal(
        <button onClick={() => setIsGuideOpen(true)} className="fixed right-0 bg-[#f8fafc] border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#b7a159] hover:text-white hover:border-[#b7a159] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group cursor-pointer" style={{ top: '120px' }}>
            <HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#64748b] group-hover:text-white" />
            <span className="font-black tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[10px] font-mono leading-none">USER GUIDE</span>
        </button>,
        document.body
      )}
      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <DocumentModal isOpen={modal.isOpen} onClose={() => setModal({isOpen: false, doc: null})} document={modal.doc} onSave={handleSave} />
      <RegulationPreviewModal isOpen={previewModal.isOpen} onClose={() => setPreviewModal({isOpen: false, doc: null})} document={previewModal.doc} />
      {/* TOAST NOTIFICATION */}
      {toast && createPortal(
        <div className="fixed bottom-6 right-6 z-[1000] animate-fadeIn bg-white border-l-4 border-[#b7a159] shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-5 py-4 rounded-xl flex items-center gap-3">
            <CheckCircle2 size={18} className="text-[#212c46]" />
            <span className="text-[11px] font-black text-[#212c46] uppercase tracking-widest font-mono">{toast}</span>
            <button onClick={() => setToast(null)} className="ml-4 text-[#64748b] hover:text-[#212c46] cursor-pointer"><X size={14}/></button>
        </div>,
        document.body
      )}
      {/* PAGE HEADER SECTION: TRANSPARENT BACKGROUND & EMBEDDED DIRECTLY IN PAGE */}
      <div className="h-14 px-8 flex flex-row items-center justify-between gap-4 z-20 shrink-0 bg-transparent">
          <div className="flex items-center gap-5">
              <div className="relative flex items-center justify-center group cursor-default shrink-0">
                  <div className="absolute inset-0 bg-[#212c46] blur-[15px] opacity-15 rounded-full group-hover:opacity-40 transition-all duration-700"></div>
                  <div className="relative z-10 p-1.5 border border-[#212c46]/45 rounded-xl bg-white/50 backdrop-blur-xs shadow-xs">
                      <Icons.Archive size={28} strokeWidth={2.5} className="text-[#212c46]" />
                  </div>
              </div>
              <div>
                  <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none" style={{ fontSize: '24px' }}>
                      COMPANY <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#212c46] to-[#b58c4f]">REGULATIONS</span>
                  </h3>
                  <p className="text-[11px] font-bold text-[#7a8b95] uppercase tracking-[0.2em] mt-0.5 opacity-80 leading-none">
                      Internal Standard Regulations & Corporate Rules Registry
                  </p>
              </div>
          </div>

          <div className="flex items-center gap-4">
              <button 
                onClick={() => setModal({isOpen: true, doc: null})}
                className="px-6 py-2.5 bg-[#212c46] text-[#f3f3f1] rounded-xl text-[11px] font-black uppercase tracking-widest shadow-md hover:bg-[#b7a159] transition-all flex items-center gap-2 active:scale-95 cursor-pointer border border-[#212c46]"
              >
                <Plus size={16} /> New Document Node
              </button>
          </div>
      </div>
      <div className="px-4 sm:px-8 w-full mt-[2px]">
        <div className="w-full">
            
            {/* KPI STATS CARDS - LEAN AND COMPACT AS REQUESTED */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3 shrink-0">
                <KpiCard label="Repository Total" value={documents.length} icon={FileText} color={THEME.primary} description="Master Documents" />
                <KpiCard label="Enforced Policies" value={documents.filter(d => d.status === 'Active').length} icon={ShieldAlert} color={THEME.success} description="Active Nodes" />
                <KpiCard label="Critical Updates" value="2" icon={History} color={THEME.accent} description="Amendments" />
                <KpiCard label="File Density" value={documents.reduce((acc, doc) => acc + (doc.attachments?.length || 0), 0)} icon={Paperclip} color={THEME.skyBlue} description="Total Attachments" />
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="bg-white/90 rounded-3xl border border-[#eaeaec] overflow-hidden flex flex-col animate-fadeIn  flex-1 min-h-0">
                
                {/* FILTER & SEARCH CONTROLS */}
                <div className="px-8 py-4 border-b border-[#eaeaec] bg-[#f8f9fa] flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative" ref={dropdownRef}>
                          <button 
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center justify-between gap-3 px-4 py-2 bg-[#f3f3f1] border border-slate-200 rounded-xl min-w-[200px] text-[11px] font-black uppercase tracking-widest text-[#414757] hover:bg-white transition-all shadow-xs active:scale-95 cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                                <Filter size={14} className="text-[#b58c4f]"/>
                                {activeTab === 'All' ? 'Filter: Global Repository' : `Node: ${activeTab}`}
                            </div>
                            <Icons.ChevronDown size={14} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`}/>
                          </button>

                          {isFilterOpen && (
                            <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-200 z-[100] overflow-hidden animate-fadeIn max-h-[300px] overflow-y-auto custom-scrollbar">
                                {[
                                  'All',
                                  '1 บททั่วไป',
                                  '2 การว่าจ้าง',
                                  '3 วันทำงาน เวลาทำงานปกติ และเวลาพัก',
                                  '4 วันลา และหลักเกณฑ์การลา',
                                  '5 วันหยุด และหลักเกณฑ์การหยุด',
                                  '6 หลักเกณฑ์การทำงานล่วงเวลา ทำงานในวันหยุด และการทำงานล่วงเวลาในวันหยุด',
                                  '7 วันและสถานที่ที่จ่ายค่าจ้างค่าล่วงเวลาค่าทำงานในวันหยุด และค่าล่วงเวลาในวันหยุด',
                                  '8 วินัยและโทษทางวินัย',
                                  '9 การร้องทุกข์',
                                  '10 การเลิกจ้างการพ้นสภาพการเป็นพนักงานและการจ่ายค่าชดเชย',
                                  '11 สภาพการบังคับและการประกาศใช้'
                                ].map((cat) => (
                                    <button 
                                        key={cat}
                                        type="button"
                                        onClick={() => { setActiveTab(cat); setIsFilterOpen(false); }}
                                        className={`w-full px-4 py-3 text-[11px] font-black uppercase tracking-widest text-left flex items-center justify-between hover:bg-[#f3f3f1] transition-all cursor-pointer ${activeTab === cat ? 'bg-[#212c46]/5 text-[#b7a159]' : 'text-[#414757]'}`}
                                    >
                                        <span className="truncate pr-2">{cat}</span>
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-black shrink-0 ${activeTab === cat ? 'bg-[#212c46] text-white' : 'bg-[#eaeaec] text-[#7a8b95]'}`}>
                                            {categoryCounts[cat] || 0}
                                        </span>
                                    </button>
                                ))}
                            </div>
                          )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Icons.Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7a8b95]" />
                            <input 
                              type="text" value={search} onChange={e=>setSearch(e.target.value)} 
                              placeholder="Search document identity..." 
                              className="w-full pl-12 pr-6 py-2.5 text-[12px] border border-[#eaeaec] rounded-full font-bold outline-none focus:border-[#b7a159] bg-white shadow-sm text-[#212c46]" 
                            />
                        </div>
                    </div>
                </div>

                {/* TABLE STREAM - CUSTOM STYLES ACCORDING TO SPEC */}
                <div className="overflow-auto custom-scrollbar  flex-1 min-h-0">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead className="bg-[#222b38] text-white">
                            <tr className="border-b-2 border-[#709654]">
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">Doc ID</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">Document Identity & Metadata</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] whitespace-nowrap">Classification</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Version Node</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center">Security Status</th>
                                <th className="py-4 px-4 font-black uppercase tracking-widest text-[12px] text-center font-sans">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#eaeaec]">
                            {filteredDocs.map(doc => (
                                <tr key={doc.id} className="hover:bg-[#f8f9fa] transition-colors group">
                                    <td className="py-2.5 px-4 font-mono font-black text-[#7a8b95] text-[12px]">{doc.id}</td>
                                    <td className="py-2.5 px-4">
                                        <div className="flex flex-col">
                                            <span className="font-black text-[#212c46] text-[12px] uppercase group-hover:text-[#b7a159] transition-colors">{doc.title}</span>
                                            <div className="flex items-center gap-3 mt-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                                              <span className="text-[10px] text-slate-400 font-black flex items-center gap-1 font-mono uppercase"><Clock size={10}/> {doc.date}</span>
                                              {doc.attachments && doc.attachments.length > 0 && (
                                                <span className="text-[10px] text-[#3f809e] font-black uppercase tracking-widest flex items-center gap-1">
                                                  <Paperclip size={10}/> {doc.attachments.length} Files
                                                </span>
                                              )}
                                              {doc.content && <span className="text-[10px] text-[#508660] font-black uppercase tracking-widest flex items-center gap-1 font-mono"><AlignLeft size={10}/> Secure Node Uploaded</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-4">
                                        <span className="px-2 py-0.5 rounded-md text-[11px] font-black uppercase border tracking-wider" style={{backgroundColor: `${doc.color}10`, color: doc.color, borderColor: `${doc.color}30`}}>
                                            {doc.category}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-4 text-center font-mono text-[#606a5f] text-[12px] font-black">{doc.version || 'v1.0'}</td>
                                    <td className="py-2.5 px-4 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                           <div className={`w-1.5 h-1.5 rounded-full ${doc.status === 'Active' ? 'bg-[#508660]' : 'bg-[#932c2e] animate-pulse'}`}/>
                                           <span className={`text-[11px] font-black uppercase tracking-wider ${doc.status === 'Active' ? 'text-[#508660]' : 'text-[#932c2e]'}`}>{doc.status || 'Active'}</span>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-4 text-center">
                                        <div className="flex justify-center items-center gap-[1px]">
                                            <button 
                                                onClick={() => setPreviewModal({isOpen: true, doc: doc})} 
                                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-[#3f809e] hover:bg-[#3f809e]/10 hover:text-[#3f809e] hover:border-[#3f809e] transition-all active:scale-90 shadow-sm cursor-pointer mr-[1px] hover:scale-105" 
                                                title="Preview PDF"
                                            >
                                                <Icons.Eye size={13}/>
                                            </button>
                                            <button 
                                                onClick={() => setModal({isOpen: true, doc: doc})} 
                                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-[#b58c4f] hover:bg-[#b58c4f] hover:text-white hover:border-[#b58c4f] transition-all active:scale-90 shadow-xs cursor-pointer" 
                                                title="Edit Node"
                                            >
                                                <Edit3 size={13}/>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(doc.id)} 
                                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-[#932c2e] hover:bg-[#932c2e] hover:text-white hover:border-[#932c2e] transition-all active:scale-90 shadow-xs cursor-pointer" 
                                                title="Delete Node"
                                            >
                                                <Trash2 size={13}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredDocs.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                      <div className="flex flex-col items-center opacity-30">
                                        <Icons.Scale size={48} className="mb-2 text-[#7a8b95]"/>
                                        <p className="text-[12px] font-black uppercase tracking-[0.25em] text-[#2f2926]">ไม่พบเอกสารในคลังบันทึก</p>
                                      </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* TABLE FOOTER */}
                <div className="px-6 py-3 bg-[#f8fafc]/80 backdrop-blur-md border-t-[1.5px] border-[#adb2b0]/50 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                    <div className="flex items-center gap-5 text-[11px] font-black text-[#606a5f] uppercase tracking-widest">
                      <p className="bg-white px-3 py-1.5 rounded-lg border border-[#eaeaec] shadow-xs font-mono text-[11px]">Total Elements: {filteredDocs.length}</p>
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#508660]"></span>
                        <span>Node Integrity SECURE</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" className="w-8 h-8 border border-slate-200 bg-white rounded-lg flex items-center justify-center opacity-40 cursor-not-allowed shadow-xs hover:bg-[#212c46] hover:text-white"><ChevronLeft size={14}/></button>
                      <div className="bg-white text-[#414757] px-4 py-1.5 rounded-lg font-black text-[11px] min-w-[100px] text-center uppercase tracking-widest border border-slate-200 shadow-xs font-mono">Page 1 / 1</div>
                      <button type="button" className="w-8 h-8 border border-slate-200 bg-white rounded-lg flex items-center justify-center opacity-40 cursor-not-allowed shadow-xs hover:bg-[#212c46] hover:text-white"><ChevronRight size={14}/></button>
                    </div>
                </div>

            </div>

            {/* SPACER MARGIN BOTTOM HELPS ADD GAP TO FOOTER FOR 32px (mt-8) as requested */}
            <div className="mt-8 shrink-0"></div>

        </div>
      </div>
    </div>
  );
}
