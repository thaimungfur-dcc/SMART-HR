import { Toast } from '../../components/shared/Toast';
import { UserGuidePanel } from '../../components/shared/UserGuidePanel';
import KpiCard from '../../components/shared/KpiCard';
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  BookOpen, Search, Plus, Pencil, Trash2, X, Save, ChevronLeft, ChevronRight, 
  HelpCircle, CheckCircle2, AlertTriangle, Building2, Briefcase, 
  Target, FileText, Check, XCircle, LayoutList, Library,
  Download, ShieldCheck, Clock, Eye, Layers, ListChecks,
  GraduationCap, Scale, History, UserCheck, Shield, ChevronDown, ListTree, Lock, Database, Printer, Settings
} from 'lucide-react';
import { DraggableModal } from '../../components/shared/DraggableModal';
import { dbSync } from '../../services/dbSync';

// --- Theme Configuration (Synced perfectly with Home / UserPermissions palette) ---
const THEME = {
  bgMain: 'transparent', // Shared transparent background with home
  primary: '#212c46', // Deep navy
  primaryLight: '#4d87a8',
  accent: '#a94228', 
  gold: '#b58c4f',
  brightGold: '#b7a159',
  success: '#657f4d',
  danger: '#932c2e', 
  skyBlue: '#3f809e',
  dustyBlue: '#7a8b95',
  indigo: '#414757',
  mutedSlate: '#606a5f',
  darkSlate: '#2f2926',
  coolGray: '#eaeaec',
  cement: '#709654' // Special border-b accent requested (709654)
};

interface JobDescription {
  id: string;
  jdCode: string;
  title: string;
  dept: string;
  level: string;
  status: string;
  updatedBy: string;
  lastUpdate: string;
  purpose: string;
  responsibilities: string;
  requirements: string;
}

const INITIAL_JDS: JobDescription[] = [
  { id: '1', jdCode: 'JD-IT-01', title: 'Senior Fullstack Developer', dept: 'Information Technology', level: 'Senior', status: 'Active', updatedBy: 'HR Admin', lastUpdate: '2026-01-15', purpose: 'รับผิดชอบการออกแบบและพัฒนาระบบ Tamarind Core ERP และฟีเจอร์ใหม่ๆ บูรณาการ API และคุมฐานข้อมูลระบบหลักสินค้าเกษตรแปรรูป', responsibilities: '1. ออกแบบและพัฒนาโครงสร้างระบบ Tamarind Core ERP คลุมส่วนของ Frontend และ Backend\n2. พัฒนาสถาปัตยกรรมฟีดส์ข่าวสารและ API Gateway กลางให้มีความสถียรภาพสูงสุด\n3. จัดระบบฐานข้อมูล SQL Server ควบคู่ไปกับระบบจัดเก็บเอกสารและคลาวด์เพื่อความปลอดภัย\n4. ตรวจทานโค้ดและควบคุมคุณภาพของทีมผู้พัฒนาโปรแกรมรุ่นน้อง', requirements: '1. วุฒิการศึกษาปริญญาตรีขึ้นไป สาขาวิทยาการคอมพิวเตอร์ หรือวิศวกรรมคอมพิวเตอร์\n2. ประสบการณ์ทำงาน 5 ปีขึ้นไป ด้านการพัฒนา Fullstack Web Application\n3. เชี่ยวชาญทักษะ React, NodeJS, Express และ PostgreSQL เป็นพิเศษ\n4. มีความเข้าใจลึกซึ้งเกี่ยวกับการจัดการ DevOps และ CI/CD Pipelines' },
  { id: '2', jdCode: 'JD-SL-01', title: 'Sales Executive (B2B)', dept: 'Sales', level: 'Staff', status: 'Active', updatedBy: 'Sales Director', lastUpdate: '2026-03-10', purpose: 'ขยายฐานลูกค้ากลุ่มองค์กรและรักษาความสัมพันธ์กับคู่ค้ารายเดิม เน้นเพิ่มส่วนแบ่งทางการตลาดด้านวัตถุดิบและอาหารแปรรูปอุตสาหกรรม', responsibilities: '1. ดำเนินการเสนอยอดขาย วางแผนหากลุ่มลูกค้ารายใหม่กลุ่มอุตสาหกรรมในประเทศ\n2. เจรจาเงื่อนไขสัญญากับคู่ค้ารายใหญ่ บริหารบัญชีฝ่ายจัดซื้อของพาร์ตเนอร์เพื่อผลประโยชน์ร่วมสูงสุด\n3. รวบรวมข้อมูลคู่แข่งและสภาวะตลาดมาปรับกลยุทธ์การขายรายไตรมาส\n4. ติดตามยอดชำระเงินและประสานฝ่ายบัญชีและการจัดส่งหลังการปิดขาย', requirements: '1. วุฒิการศึกษาปริญญาตรีขึ้นไป ในสาขาบริหารธุรกิจ การตลาด หรือสาขาที่เกี่ยวข้อง\n2. มีประสบการณ์งานขายระดับองค์กร (B2B Corporate Sales) อย่างน้อย 2 ปี\n3. มีรถยนต์ส่วนบุคคลและใบขับขี่ สามารถเดินทางไปพบลูกค้านอกสถานที่ต่างอำเภอได้\n4. ทักษะการเจรจาต่อรองยอดเยี่ยมและการนำเสนอพรีเซนเทชันที่ดึงดูดใจคู่ค้า' },
  { id: '3', jdCode: 'JD-QA-02', title: 'QA Inspector', dept: 'Quality Assurance', level: 'Staff', status: 'Active', updatedBy: 'QA Manager', lastUpdate: '2025-12-05', purpose: 'ตรวจสอบคุณภาพผลิตภัณฑ์ตามมาตรฐาน ISO/GMP ในสายการผลิต สุ่มวิเคราะห์คุณภาพและประสิทธิภาพของบรรจุภัณฑ์', responsibilities: '1. ทำการควบคุมและสุ่มตรวจคุณภาพผลิตภัณฑ์ระหว่างกระบวนการผลิต ให้สอดคล้องกับมาตรฐาน SOP\n2. ตรวจสอบสุขลักษณะส่วนบุคคลและการปฏิบัติงานในเขตโรงงานและฝ่ายแปรรูปอุตสาหกรรมตามเกณฑ์ GMP/HACCP\n3. บันทึกและออกรายงานใบแจ้งปัญหา (Corrective Action Request) กรณีพบของเสียหรือมาตรฐานไม่ผ่านเกณฑ์\n4. ประสานงานเพื่อเตรียมความพร้อมรับการตรวจสอบภายนอกสำหรับการตรวจประเมินคุณภาพ ISO ประจำปี', requirements: '1. วุฒิการศึกษาระดับ ปวส. หรือ ปริญญาตรีขึ้นไป สาขาวิทยาศาสตร์การอาหาร หรือเคมี\n2. เคยผ่านงานตรวจสอบคุณภาพ (QA/QC Inspector) ในโรงงานอุตสาหกรรมอาหารอย่างน้อย 1 ปี\n3. เข้าใจระบบมาตรฐานประกันคุณภาพ GMP, HACCP, ISO 9001:2015 เป็นอย่างดี\n4. มีมนุษยสัมพันธ์ดี สามารถทำงานภายใต้ความกดดันและขัดแย้งของสายการผลิตได้ดี' },
  { id: '4', jdCode: 'JD-MKT-01', title: 'Marketing Manager', dept: 'Marketing', level: 'Manager', status: 'Draft', updatedBy: 'HR Admin', lastUpdate: '2026-05-02', purpose: 'วางแผนกลยุทธ์การตลาดและบริหารจัดการงบประมาณแคมเปญทั้งหมด ยกระดับภาพลักษณ์แบรนด์ให้เข้าตลาดระดับสากล', responsibilities: '1. วางแผนร่วมกับฝ่ายจัดการด้านงบประมาณและเป้าหมายยอดขายสำหรับทั้งปีการตลาด\n2. บริหารทีมออกแบบคอนเทนต์ สื่อโฆษณาโซเชียลมีเดีย เว็บไซต์ Facebook และช่องทาง TikTok ทั้งหมด\n3. ออกแบบกลยุทธ์การประชาสัมพันธ์สินค้าเกษตรแปรรูปและแคมเปญกระตุ้นยอดขายปลายทาง\n4. ตรวจสอบการทำ SEO/SEM และประเมินผล ROI คัดเลือกเอเจนซี่ฝ่ายโฆษณาด้านดิจิทัล', requirements: '1. ปริญญาตรีขึ้นไปสาขาการตลาด สื่อสารมวลชน หรือสาขาบริหารธุรกิจที่เกี่ยวข้อง\n2. มีประสบการณ์ในการทำงานสายการตลาดอย่างน้อย 5 ปี และเป็นหัวหน้าทีมการตลาดตั้งแต่ 2 ปีขึ้นไป\n3. ความคิดริเริ่มสร้างสรรค์ พัฒนาแบรนด์ และแคมเปญกระตุ้นยอดขายกลุ่มผู้บริโภครุ่นใหม่\n4. สามารถวิเคราะห์สถิติตลาดและเครื่องมือ Analytics ต่างๆ ได้อย่างแม่นยำ' },
  { id: '5', jdCode: 'JD-PRO-05', title: 'Production Supervisor', dept: 'Production', level: 'Supervisor', status: 'Active', updatedBy: 'Plant Manager', lastUpdate: '2026-02-20', purpose: 'ควบคุมดูแลแผนการผลิตให้เป็นไปตามเป้าหมายและดูแลความเรียบร้อยความปลอดภัยในโรงงานเครื่องจักรอุตสาหกรรม', responsibilities: '1. ควบคุมดูแลกระบวนการผลิตประจำเครื่องจักรของคนงานแผนกผลิตแปรรูป\n2. จัดทำตารางเวรหมุนเวียนพนักงานในกะ ควบคุมกำลังคนไม่ให้เกิดการขาดแคลน\n3. รายงานปัญหาเครื่องจักรขัดข้อง ประสานงานฝ่ายวิศวกรรมบำรุงรักษาในทันที\n4. บันทึกรายงานยอดผลิต ผลของเสีย อัตราการจัดส่งตามโควต้าของงานโรงงานประจำรายสัปดาห์', requirements: '1. วุฒิการศึกษา ปวส. หรือ ปริญญาตรีด้านวิศวกรรมอุตสาหการ หรือสาขาที่เกี่ยวข้อง\n2. มีประสบการณ์ระดับผลิตในฐานะผู้ควบคุมงาน (Supervisor) อย่างน้อย 3 ปี ในอุตสาหกรรมแปรรูป\n3. ตระหนักรู้สภาวะแวดล้อมความปลอดภัย (Safety First) และความสูญเปล่าด้านเวลาผลิต\n4. มีความเป็นผู้นำสูง แก้ปัญหาเฉพาะหน้าได้รวดเร็ว ดำเนินการปรับปรุงเครื่องจักรได้ทันท่วงที' }
];

const DEPARTMENTS = ['ALL', 'Information Technology', 'Sales', 'Marketing', 'Production', 'Human Resources', 'Quality Assurance'];
const LEVELS = ['ALL', 'Staff', 'Supervisor', 'Senior', 'Manager', 'Director'];

// --- Printable PDF Preview Modal ---
function JdDocumentPreviewModal({ isOpen, onClose, record }: { isOpen: boolean; onClose: () => void; record: JobDescription | null }) {
  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <DraggableModal isOpen={isOpen} onClose={onClose} title={<div className="flex items-center gap-2"><Printer size={16}/><span>OFFICIAL JD DOCUMENT PREVIEW</span></div>} width="max-w-4xl">
      <div className="flex-1 overflow-y-auto p-8 bg-[#1f2a44]/5 custom-scrollbar text-[#212c46]">
        {/* Printable Paper */}
        <div id="printable-jd-area" className="bg-white p-10 rounded-2xl border border-slate-200 shadow-lg min-h-[297mm] mx-auto w-full max-w-[210mm] relative flex flex-col justify-between" style={{ fontFamily: 'Noto Sans Thai, sans-serif !important' }}>
          
          {/* Paper Header */}
          <div>
            <div className="flex justify-between items-start border-b-4 border-[#212c46] pb-5 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#212c46] to-[#4d87a8] rounded-xl flex items-center justify-center text-[#b58c4f] font-black text-xl shadow-md border border-[#b58c4f]/30">
                  TAI
                </div>
                <div>
                  <h2 className="text-[15px] font-extrabold tracking-widest text-[#212c46] leading-none mb-1">T All Intelligence Co., Ltd.</h2>
                  <p className="text-[9px] font-bold text-[#7a8b95] tracking-wider uppercase leading-none">46 Moo 5, Klong 4, Klong Luang, Pathumthani Thailand 12120</p>
                </div>
              </div>
              <div className="text-right border-l-2 border-slate-200 pl-4">
                <p className="text-[10px] font-black text-[#212c46] font-tech leading-none mb-1">DOC REF: {record.jdCode}</p>
                <p className="text-[9px] font-bold text-[#7a8b95] uppercase leading-none mb-1">REVISION: 1.2 (Active)</p>
                <p className="text-[9px] text-[#a94228] font-bold leading-none uppercase">ISO 9001:2015 Approved</p>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="bg-[#212c46] text-white p-4 rounded-xl mb-6">
              <h1 className="text-[16px] font-black uppercase tracking-widest leading-none mb-1 text-center">ใบพรรณนาลักษณะงานและมาตรฐานตำแหน่งงาน</h1>
              <p className="text-[10px] text-slate-300 tracking-wider text-center uppercase leading-none">Job Description Position Profile Document</p>
            </div>

            {/* General Job Context Form Metas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-[11px] mb-6">
              <div>
                <p className="text-[#a94228] font-black uppercase tracking-wider mb-0.5">POSITION NAME / ชือตำแหน่ง</p>
                <p className="font-extrabold text-[#212c46] text-[12px]">{record.title}</p>
              </div>
              <div>
                <p className="text-[#a94228] font-black uppercase tracking-wider mb-0.5">DEPARTMENT / ส่วนงาน</p>
                <p className="font-extrabold text-[#212c46] text-[12px]">{record.dept}</p>
              </div>
              <div>
                <p className="text-[#a94228] font-black uppercase tracking-wider mb-0.5">JOB LEVEL / ระดับสายงาน</p>
                <p className="font-extrabold text-[#212c46] text-[12px]">{record.level}</p>
              </div>
              <div>
                <p className="text-[#a94228] font-black uppercase tracking-wider mb-0.5">EFFECTIVE DATE / วันมีผลบังคับ</p>
                <p className="font-extrabold text-[#212c46] font-tech text-[12px]">{record.lastUpdate}</p>
              </div>
            </div>

            {/* Content Section: Purpose */}
            <div className="space-y-6">
              <div>
                <h3 className="text-[11px] font-black text-[#212c46] border-b border-[#709654] pb-1 uppercase tracking-wide flex items-center gap-2 mb-2">
                  <Target size={14} className="text-[#a94228]"/> 1. JOB PURPOSE & SCOPE / เป้าหมายและขอบเขตงานประจำตำแหน่ง
                </h3>
                <p className="text-[11px] leading-relaxed text-[#212c46] font-medium bg-slate-50/50 p-3 rounded-lg border border-slate-100 italic">
                  "{record.purpose || 'ไม่มีข้อมูลวัตถุประสงค์โดยย่อ'}"
                </p>
              </div>

              {/* Responsibilities */}
              <div>
                <h3 className="text-[11px] font-black text-[#212c46] border-b border-[#709654] pb-1 uppercase tracking-wide flex items-center gap-2 mb-2">
                  <ListChecks size={14} className="text-[#657f4d]"/> 2. ROLES & RESPONSIBILITIES / หน้าที่ความรับผิดชอบหลัก
                </h3>
                <div className="text-[11px] leading-relaxed text-[#212c46] font-medium whitespace-pre-wrap bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                  {record.responsibilities || 'ยังไม่มีการกรอกข้อมูลภาระหน้าที่หลักในตารางคลังกลาง'}
                </div>
              </div>

              {/* Qualifications */}
              <div>
                <h3 className="text-[11px] font-black text-[#212c46] border-b border-[#709654] pb-1 uppercase tracking-wide flex items-center gap-2 mb-2">
                  <GraduationCap size={14} className="text-[#b7a159]"/> 3. QUALIFICATIONS & SKILL REQUIREMENTS / คุณสมบัติและทักษะความสามารถเฉพาะด้าน
                </h3>
                <div className="text-[11px] leading-relaxed text-[#212c46] font-medium whitespace-pre-wrap bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                  {record.requirements || 'ยังไม่มีการกรอกข้อมูลคุณสมบัติขั้นต่ำของตำแหน่งงาน'}
                </div>
              </div>
            </div>
          </div>

          {/* Signature Sign-offs Block */}
          <div className="pt-8 border-t border-slate-200 mt-10">
            <div className="grid grid-cols-3 gap-6 text-center text-[10px]">
              <div className="flex flex-col items-center">
                <div className="w-32 border-b border-slate-400 h-10"></div>
                <p className="font-extrabold text-[#212c46] mt-2">......................................................</p>
                <p className="font-bold text-[#7a8b95] mt-1">ผู้จัดเตรียมข้อมูลประวัติ / พนักงานเจ้าของงาน</p>
                <p className="text-[8px] text-slate-400 mt-0.5">Date: ..... / ..... / .........</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-32 border-b border-slate-400 h-10"></div>
                <p className="font-extrabold text-[#212c46] mt-2">......................................................</p>
                <p className="font-bold text-[#7a8b95] mt-1">ผู้ตรวจทานความสอดคล้อง / ผู้บังคับบัญชาสายงาน</p>
                <p className="text-[8px] text-slate-400 mt-0.5">Date: ..... / ..... / .........</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-32 border-b border-slate-400 h-10 flex items-center justify-center">
                  <span className="text-[9px] text-[#657f4d] border border-[#657f4d]/30 bg-[#657f4d]/10 px-2 py-0.5 rounded uppercase font-black tracking-widest font-tech scale-90">APPROVED SYSTEM</span>
                </div>
                <p className="font-extrabold text-[#212c46] mt-2">HR Management Authorized</p>
                <p className="font-bold text-[#7a8b95] mt-1">ผู้อนุมัติใช้ในระบบ / ผู้อำนวยการส่วนบริหารบุคคล</p>
                <p className="text-[8px] text-slate-400 mt-0.5">Date:  {record.lastUpdate}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-[8px] text-slate-400 mt-6 pt-3 border-t border-slate-100">
              <p>Chai Sri Industrial Co., Ltd. Global HR Document Repository © 2026</p>
              <p>Page 1 of 1</p>
            </div>
          </div>

        </div>
      </div>
      
      {/* Printable Actions Footer */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
        <button onClick={onClose} className="px-5 py-2 bg-white border border-slate-200 text-[#414757] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-slate-100 transition-all">
          Close Preview
        </button>
        <button onClick={handlePrint} className="bg-[#657f4d] text-white px-6 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md hover:bg-[#212c46] transition-all flex items-center gap-2">
          <Printer size={14}/> Print / Save PDF
        </button>
      </div>
    </DraggableModal>
  );
}

// --- Creation & Editing Modal using DraggableModal framework standard ---
function EditJdModal({ isOpen, onClose, record, onSave }: { isOpen: boolean; onClose: () => void; record: JobDescription | null; onSave: (data: JobDescription) => void }) {
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      if (record) {
        setFormData({ ...record });
      } else {
        setFormData({
          id: `JD-${Date.now()}`,
          jdCode: `JD-${new Date().getFullYear().toString().slice(2)}${String(Math.floor(Math.random() * 90) + 10)}-${String(Math.floor(Math.random() * 900) + 100)}`,
          title: '',
          dept: 'Information Technology',
          level: 'Staff',
          status: 'Draft',
          updatedBy: 'HR Specialist',
          lastUpdate: new Date().toISOString().split('T')[0],
          purpose: '',
          responsibilities: '',
          requirements: ''
        });
      }
    }
  }, [isOpen, record]);

  if (!isOpen || !formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.jdCode) {
      alert('โปรดระบุข้อมูลหัวข้อตำแหน่งงานและรหัสเอกสารให้ครบถ้วน');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <DraggableModal isOpen={isOpen} onClose={onClose} title={<div className="flex items-center gap-2"><Briefcase size={16}/><span>{record ? 'EDIT JOB DESCRIPTION RECORD' : 'CREATE NEW JD RECORD'}</span></div>} width="max-w-4xl">
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6 custom-scrollbar text-[12px] text-[#212c46]">
        {/* Row 1: Identification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <label className="text-[10px] font-black text-[#a94228] uppercase tracking-widest block mb-2">Job Title / ชือตำแหน่งงาน (ไทย/อังกฤษ) <span className="text-red-500">*</span></label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Senior Fullstack Developer" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-[12px] font-extrabold outline-none focus:border-[#212c46] focus:bg-white text-[#212c46] transition-colors" />
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <label className="text-[10px] font-black text-[#a94228] uppercase tracking-widest block mb-2">Job Description Code / รหัสเอกสารอ้างอิง <span className="text-red-500">*</span></label>
            <input type="text" name="jdCode" value={formData.jdCode} onChange={handleChange} required placeholder="e.g. JD-IT-01" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-[12px] font-mono font-black tracking-wide outline-none focus:border-[#212c46] focus:bg-white text-[#212c46] transition-colors" />
          </div>
        </div>

        {/* Row 2: Department, level, status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-2">Organization Department / สังกัดส่วนงาน</label>
            <select name="dept" value={formData.dept} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-[12px] font-bold outline-none focus:border-[#212c46] text-[#212c46] transition-colors cursor-pointer">
              {DEPARTMENTS.filter(d=>d!=='ALL').map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-2">Hierarchical Level / ระดับปฏิบัติการ</label>
            <select name="level" value={formData.level} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-[12px] font-bold outline-none focus:border-[#212c46] text-[#212c46] transition-colors cursor-pointer">
              {LEVELS.filter(l=>l!=='ALL').map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-2">ISO Validation Status / สถานะควบคุม</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-[12px] font-bold outline-none focus:border-[#212c46] text-[#212c46] transition-colors cursor-pointer">
              <option value="Active">Active (Official)</option>
              <option value="Draft">Draft (In Review)</option>
              <option value="Archived">Archived (Historical)</option>
            </select>
          </div>
        </div>

        {/* Part 3: Purpose Text Area */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-2 flex items-center gap-2"><Target size={14} className="text-[#a94228]"/> 1. Job Purpose Description / วัตถุประสงค์โดยสังเขปของตําแหน่งงาน</label>
          <textarea rows={2} name="purpose" value={formData.purpose} onChange={handleChange} placeholder="Explain the main overarching goal of this position in 2-3 sentences..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-[12px] font-medium outline-none focus:border-[#212c46] focus:bg-white text-[#212c46] transition-colors resize-none custom-scrollbar" />
        </div>

        {/* Part 4: Detailed Multi-line Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-2 flex items-center gap-2"><ListChecks size={14} className="text-[#657f4d]"/> 2. Key Responsibilities / หน้าทีความรับผิดชอบหลักระบุเป็นข้อๆ</label>
            <textarea rows={7} name="responsibilities" value={formData.responsibilities} onChange={handleChange} placeholder="1. ออกแบบกระบวนการทำงาน...&#10;2. ควบคุมแผนการจํานวนวันผลิต...&#10;3. ติดตามประเมินผลการรายงาน..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-[12px] font-medium outline-none focus:border-[#212c46] focus:bg-white text-[#212c46] transition-colors resize-none custom-scrollbar font-mono" />
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-2 flex items-center gap-2"><GraduationCap size={14} className="text-[#b7a159]"/> 3. Qualifications & Competency / ประสบการณ์และทักษะความสามารถ</label>
            <textarea rows={7} name="requirements" value={formData.requirements} onChange={handleChange} placeholder="- วุฒิการศึกษาปริญญาตรีขึ้นไปสาขาการบริหาร...&#10;- มีประสบการณ์การทำงาน 3 ปีขึ้นไปในการคุมกำลังผล...&#10;- สามารถฟังพูดเข้าใจภาษาต่างประเทศได้ดี..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-[12px] font-medium outline-none focus:border-[#212c46] focus:bg-white text-[#212c46] transition-colors resize-none custom-scrollbar font-mono" />
          </div>
        </div>

        {/* Metadata Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <label className="text-[10px] font-black text-[#7a8b95] uppercase tracking-widest block mb-1.5 flex items-center gap-1.5"><History size={12}/> Effective Release Date / วันเริ่มควบคุม</label>
            <input type="date" name="lastUpdate" value={formData.lastUpdate} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-[12px] font-bold text-[#212c46] font-tech" />
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <label className="text-[10px] font-black text-[#7a8b95] uppercase tracking-widest block mb-1.5 flex items-center gap-1.5"><UserCheck size={12}/> Editor Identifier / ผู้อัปเดตประวัติ</label>
            <input type="text" name="updatedBy" value={formData.updatedBy} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-[12px] font-extrabold text-[#212c46]" />
          </div>
        </div>
      </form>
      
      {/* Modal Actions */}
      <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex justify-end gap-3 shrink-0">
        <button onClick={onClose} className="px-5 py-2 bg-white border border-slate-200 text-[#414757] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all">
          Cancel
        </button>
        <button onClick={handleSubmit} className="bg-[#212c46] text-white px-5 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md hover:bg-[#a94228] transition-all flex items-center gap-2">
          <Save size={14}/> Save JD Record
        </button>
      </div>
    </DraggableModal>
  );
}

// --- Main Page Component ---
export default function JDRepository() {
  const [activeTab, setActiveTab] = useState('registry'); // 'registry' or 'settings'
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  
  // Data Records Sync
  const [jds, setJds] = useState<JobDescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination matching exact UserPermissions layout
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal Triggers
  const [editModal, setEditModal] = useState<{ isOpen: boolean; record: JobDescription | null }>({ isOpen: false, record: null });
  const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; record: JobDescription | null }>({ isOpen: false, record: null });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Settings State matching standard of UserPermissions
  const [complianceExpanded, setComplianceExpanded] = useState<any>({ corporate: true, standard: true, regulatory: false });
  const [restrictiveMap, setRestrictiveMap] = useState<any>({ 'salary_master': true, 'confidential_eval': true });

  const showToast = (message: string, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // Dual Persistence Data Loader & Auto Seeder
  useEffect(() => {
    const fetchAndLoad = async () => {
      try {
        setIsLoading(true);
        const records = await dbSync.read('jd_repository');
        if (records && records.length > 0) {
          setJds(records);
        } else {
          // Initialize/Seed standard records
          await dbSync.write('jd_repository', INITIAL_JDS);
          setJds(INITIAL_JDS);
          showToast('Initialized JD Repository Database with template records.', 'success');
        }
      } catch (err) {
        console.error('Failed to resolve database collections, falling back, error: ', err);
        setJds(INITIAL_JDS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndLoad();
  }, []);

  // Filter & Search computation
  const filteredJds = useMemo(() => {
    return jds.filter(jd => {
      const query = search.toLowerCase();
      const matchQuery = jd.jdCode.toLowerCase().includes(query) || 
                         jd.title.toLowerCase().includes(query) || 
                         jd.purpose.toLowerCase().includes(query) ||
                         jd.dept.toLowerCase().includes(query);
      const matchDept = selectedDept === 'ALL' || jd.dept === selectedDept;
      const matchLevel = selectedLevel === 'ALL' || jd.level === selectedLevel;
      return matchQuery && matchDept && matchLevel;
    }).sort((a, b) => b.jdCode.localeCompare(a.jdCode));
  }, [jds, search, selectedDept, selectedLevel]);

  // Pagination slices matching standard UserPermissions layout
  const currentData = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredJds.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredJds, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredJds.length / itemsPerPage) || 1;

  // Track page reset on filter shifts
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedDept, selectedLevel]);

  // Aggregate metric configurations
  const kpiData = useMemo(() => {
    return {
      total: jds.length,
      active: jds.filter(j => j.status === 'Active').length,
      depts: new Set(jds.map(j => j.dept)).size,
      drafts: jds.filter(j => j.status === 'Draft' || j.status === 'Under Review').length
    };
  }, [jds]);

  const saveJdRecord = async (savedNode: JobDescription) => {
    try {
      let updatedList = [];
      const exists = jds.find(j => j.id === savedNode.id);
      if (exists) {
        updatedList = jds.map(j => j.id === savedNode.id ? savedNode : j);
        await dbSync.update('jd_repository', [savedNode]);
        showToast(`แก้ไขระเบียน ${savedNode.jdCode} สำเร็จ`, 'success');
      } else {
        updatedList = [savedNode, ...jds];
        await dbSync.write('jd_repository', [savedNode]);
        showToast(`บันทึกตำแหน่ง ${savedNode.jdCode} ใหม่เรียบร้อยแล้ว`, 'success');
      }
      setJds(updatedList);
    } catch (err) {
      console.error(err);
      showToast('ปัญหาเชื่อมต่อฐานข้อมูล', 'error');
    }
  };

  const deleteJdRecord = async (id: string, code: string) => {
    if (window.confirm(`ยืนยันการลบลักษณะงานตำแหน่ง รหัส [${code}] ออกจากคลังจัดเก็บส่วนกลางหรือไม่? การกระทำนี้ไม่สามารถย้อนกลับตามข้อกำหนด ISO ได้`)) {
      try {
        const remaining = jds.filter(j => j.id !== id);
        await dbSync.delete('jd_repository', [{ id }]);
        setJds(remaining);
        showToast(`ลบประวัติรหัส ${code} เรียบร้อยแล้ว`, 'success');
      } catch (err) {
        console.error(err);
        showToast('ไม่สามารถลบออกจากระเบียนหลักได้', 'error');
      }
    }
  };

  const toggleRestrictive = (id: string) => {
    setRestrictiveMap((prev: any) => ({ ...prev, [id]: !prev[id] }));
    showToast(`อัปเดตสถานะความปลอดภัยนโยบายส่วนตัวจำเพาะสำเร็จ`, 'success');
  };

  const toggleComplianceExpand = (id: string) => {
    setComplianceExpanded((prev: any) => ({ ...prev, [id]: !prev[id] }));
  };

  const StatusBadge = ({ status }: { status: string }) => {
    let styleClass = "bg-slate-100 text-slate-500 border-slate-200";
    if (status === 'Active') styleClass = "bg-[#657f4d]/10 text-[#657f4d] border-[#657f4d]/30";
    else if (status === 'Draft') styleClass = "bg-[#b58c4f]/10 text-[#b58c4f] border-[#b58c4f]/30";
    else if (status === 'Archived') styleClass = "bg-[#932c2e]/10 text-[#932c2e] border-[#932c2e]/30";

    return (
      <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${styleClass}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="flex flex-1 w-full flex-col animate-fadeIn bg-transparent space-y-4 pb-6 min-h-0">
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '', type: 'success' })} />}
      {/* FLOATING USER GUIDE TAB - Styled identically to UserPermissions */}
      {typeof document !== 'undefined' && createPortal(
        <button onClick={() => setIsGuideOpen(true)} className="fixed right-0 bg-[#f8f9fa] border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#a94228] hover:text-white hover:border-[#a94228] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group cursor-pointer" style={{ top: '80px' }}>
          <HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#7a8b95] group-hover:text-white" />
          <span className="font-black tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[11px]">USER GUIDE</span>
        </button>,
        document.body
      )}
      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <EditJdModal 
        isOpen={editModal.isOpen} 
        onClose={() => setEditModal({ isOpen: false, record: null })} 
        record={editModal.record} 
        onSave={saveJdRecord} 
      />
      <JdDocumentPreviewModal 
        isOpen={previewModal.isOpen} 
        onClose={() => setPreviewModal({ isOpen: false, record: null })} 
        record={previewModal.record} 
      />
      {/* HEADER SECTION - Laid flat natively without background color */}
      <div className="h-14 px-8 flex flex-row items-center justify-between gap-4 z-20 shrink-0">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center group cursor-default shrink-0">
            <div className="absolute inset-0 bg-[#3f809e] blur-[15px] opacity-20 rounded-full group-hover:opacity-60 transition-all duration-700"></div>
            <div className="relative z-10 p-1.5 border border-[#3f809e]/40 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm">
              <Briefcase size={28} strokeWidth={2.5} className="text-[#3f809e]" />
            </div>
          </div>
          <div>
            <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none" style={{ fontSize: '24px' }}>
              JD <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3f809e] to-[#b58c4f]">REPOSITORY</span> NODE
            </h3>
            <p className="text-[11px] font-bold text-[#4d5a44] uppercase tracking-[0.2em] mt-0.5 opacity-80 leading-none">
              CENTRALIZED JOB DESCRIPTION & COMPETENCY LIBRARY
            </p>
          </div>
        </div>

        {/* Tab Selection Navigation matching UserPermissions */}
        <div className="flex items-center gap-4">
          <div className="bg-white/50 p-1.5 rounded-xl border border-white/60 shadow-inner flex flex-wrap items-center gap-1">
            <button onClick={() => setActiveTab('registry')} className={`px-6 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'registry' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#7a8b95] hover:text-[#a94228]'}`}>
              <Database size={16} /> Global Registry
            </button>
            <button onClick={() => setActiveTab('settings')} className={`px-6 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'settings' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#7a8b95] hover:text-[#a94228]'}`}>
              <Settings size={16} /> JD Settings
            </button>
          </div>
        </div>
      </div>
      {/* MAIN CONTAINER */}
      <div className="px-4 sm:px-8 w-full mt-[2px]">
        <div className="w-full">
          
          {/* LEAN KPI METRICS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3 shrink-0">
            <KpiCard
              label="Managed Positions"
              value={isLoading ? '...' : kpiData.total}
              iconName="Briefcase"
              color={THEME.primaryLight}
              description="Active Profiles" />
            <KpiCard
              label="ISO Approved (Active)"
              value={isLoading ? '...' : kpiData.active}
              iconName="ShieldCheck"
              color={THEME.success}
              description="Standard Verified" />
            <KpiCard
              label="Dept. Coverage"
              value={isLoading ? '...' : kpiData.depts}
              iconName="Building2"
              color={THEME.skyBlue}
              description="Corporate Units" />
            <KpiCard
              label="Awaiting validation / Drafts"
              value={isLoading ? '...' : kpiData.drafts}
              iconName="Clock"
              color={THEME.gold}
              description="Pending Audit" />
          </div>

          {activeTab === 'registry' ? (
            /* Tab Content: Registry Listing */
            (<div className="bg-white rounded-3xl shadow-lg border border-[#eaeaec] overflow-hidden flex flex-col animate-fadeIn  flex-1 min-h-0">
              {/* Tool Filter Bar mimicking UserPermissions Search Panel */}
              <div className="px-8 py-4 border-b border-[#eaeaec] bg-[#f8f9fa] flex flex-col xl:flex-row justify-between items-center gap-4 shrink-0">
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                  <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="bg-white border border-[#eaeaec] pl-4 pr-10 py-2 text-[11px] font-black rounded-lg outline-none focus:border-[#b7a159] shadow-sm uppercase tracking-wider text-[#414757] cursor-pointer min-w-[130px]">
                    <option value="ALL">ALL DEPARTMENTS</option>
                    {DEPARTMENTS.filter(d=>d!=='ALL').map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
                  </select>
                  <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="bg-white border border-[#eaeaec] pl-4 pr-10 py-2 text-[11px] font-black rounded-lg outline-none focus:border-[#b7a159] shadow-sm uppercase tracking-wider text-[#414757] cursor-pointer min-w-[130px]">
                    <option value="ALL">ALL LEVELS</option>
                    {LEVELS.filter(l=>l!=='ALL').map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
                  </select>
                  
                  <span className="text-[#eaeaec] hidden lg:block font-extralight text-lg">|</span>
                  
                  {/* Search bar matching UserPermissions input shape */}
                  <div className="relative flex-1 sm:w-80 w-full">
                    <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7a8b95]" />
                    <input 
                      type="text" 
                      value={search} 
                      onChange={e => setSearch(e.target.value)} 
                      placeholder="Search code, positions or criteria..." 
                      className="w-full pl-12 pr-6 py-2 text-[12px] border border-[#eaeaec] rounded-full font-bold outline-none focus:border-[#b7a159] bg-white shadow-sm text-[#212c46] placeholder:text-[#cbd5e1]" 
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
                  <button 
                    onClick={() => setEditModal({ isOpen: true, record: null })} 
                    className="bg-[#212c46] text-white px-6 py-2.5 rounded-full font-black text-[12px] uppercase tracking-widest shadow-md hover:bg-[#a94228] transition-all flex items-center gap-2 border border-[#212c46] active:scale-95 cursor-pointer"
                  >
                    <Plus size={16} strokeWidth={2.5} /> Create JD Profile
                  </button>
                </div>
              </div>
              {/* DATA TABLE - CUSTOM STYLED MANDATES */}
              <div className="overflow-x-auto custom-scrollbar flex-1 min-h-0">
                <table className="w-full text-left font-sans border-collapse min-w-[950px]">
                  {/* Table Header: py-4, background 222b38 + underline border-[#709654] */}
                  <thead className="bg-[#222b38] text-white">
                    <tr className="border-b-2 border-[#709654]">
                      <th className="py-4 px-6 font-black uppercase tracking-widest text-[12px] whitespace-nowrap w-[150px]">JD Code</th>
                      <th className="py-4 px-6 font-black uppercase tracking-widest text-[12px] whitespace-nowrap w-[250px]">Role / Position Target</th>
                      <th className="py-4 px-6 font-black uppercase tracking-widest text-[12px] w-[40%]">Primary Operational Goal</th>
                      <th className="py-4 px-6 font-black uppercase tracking-widest text-[12px] text-center w-[150px]">Doc Status</th>
                      <th className="py-4 px-6 font-black uppercase tracking-widest text-[12px] text-center w-[120px]">Actions</th>
                    </tr>
                  </thead>
                  
                  {/* Row content padding is py-2.5, Font size 12px */}
                  <tbody className="bg-white divide-y divide-[#eaeaec]">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div className="w-10 h-10 border-4 border-slate-200 border-t-[#212c46] rounded-full animate-spin"></div>
                            <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">LOADING REPOSITORY RECORDS...</span>
                          </div>
                        </td>
                      </tr>
                    ) : currentData.length > 0 ? (
                      currentData.map((node) => (
                        <tr key={node.id} className="hover:bg-slate-50/70 transition-colors group">
                          {/* Row: JD Code (12px, py-2.5) */}
                          <td className="py-2.5 px-6 font-mono font-black text-[#a94228] text-[12px] tracking-wide">{node.jdCode}</td>
                          
                          {/* Row: Title & Dept info (12px, py-2.5) */}
                          <td className="py-2.5 px-6">
                            <div className="flex flex-col">
                              <span className="text-[12px] font-black text-[#212c46] uppercase leading-snug tracking-tight group-hover:text-[#a94228] transition-colors">{node.title}</span>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[10px] font-black text-[#b7a159] uppercase tracking-wider">{node.dept}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase">{node.level}</span>
                              </div>
                            </div>
                          </td>

                          {/* Row: Purpose (12px, py-2.5) */}
                          <td className="py-2.5 px-6">
                            <p className="text-[12px] text-[#606a5f] font-medium leading-relaxed line-clamp-2">
                              {node.purpose || 'ไม่มีข้อมูลระบุขอบเขตวัตถุประสงค์การทํางานหลัก'}
                            </p>
                          </td>

                          {/* Row: Status Badges (11px) */}
                          <td className="py-2.5 px-6 text-center">
                            <StatusBadge status={node.status} />
                          </td>

                          {/* Action section: w-8 h-8 buttons with gap-[1px] */}
                          <td className="py-2.5 px-6">
                            <div className="flex items-center justify-center gap-[1px]">
                              <button 
                                onClick={() => setPreviewModal({ isOpen: true, record: node })}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#212c46] hover:bg-[#212c46]/10 transition-colors active:scale-90 shadow-sm border border-transparent" 
                                title="PREVIEW ISO DOCUMENT"
                              >
                                <Eye size={15} strokeWidth={2.5} />
                              </button>
                              <button 
                                onClick={() => setEditModal({ isOpen: true, record: node })}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#4d87a8] hover:bg-[#4d87a8]/10 transition-colors active:scale-90 shadow-sm border border-transparent" 
                                title="EDIT RECORD"
                              >
                                <Pencil size={15} strokeWidth={2.5} />
                              </button>
                              <button 
                                onClick={() => deleteJdRecord(node.id, node.jdCode)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#932c2e] hover:bg-[#932c2e]/10 transition-colors active:scale-90 shadow-sm border border-transparent" 
                                title="ARCHIVE / REMOVE"
                              >
                                <Trash2 size={15} strokeWidth={2.5} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-[#7a8b95] font-bold text-[12px]">
                          NO MATCHING JOB DESCRIPTIONS REGISTERED IN REPOSITORY.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* PAGINATION PANEL - Exactly matches standard layout of UserPermissions */}
              <div className="px-8 py-3 bg-[#f8f9fa] border-t border-[#eaeaec] flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                <div className="flex items-center gap-6 text-[11px] font-black text-[#7a8b95] uppercase tracking-widest">
                  <div className="flex items-center gap-3">
                    <span>Display Rows:</span>
                    <select 
                      value={itemsPerPage} 
                      onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} 
                      className="bg-white border border-[#eaeaec] rounded-lg px-3 py-1.5 outline-none font-black text-[#212c46] cursor-pointer shadow-sm"
                    >
                      {[5, 10, 20, 50].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <p className="bg-white px-4 py-2 rounded-xl border border-[#eaeaec] shadow-sm">
                    Total Positions: {filteredJds.length}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                    disabled={currentPage === 1} 
                    className={`w-10 h-10 border border-[#eaeaec] bg-white rounded-xl flex items-center justify-center transition-all ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#212c46] hover:text-white shadow-md active:scale-90'}`}
                  >
                    <ChevronLeft size={18}/>
                  </button>
                  <div className="bg-[#212c46] text-white px-8 py-2.5 rounded-xl shadow-md font-black text-[11px] min-w-[140px] text-center uppercase tracking-widest">
                    Page {currentPage} / {totalPages}
                  </div>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                    disabled={currentPage === totalPages} 
                    className={`w-10 h-10 border border-[#eaeaec] bg-white rounded-xl flex items-center justify-center transition-all ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#212c46] hover:text-white shadow-md active:scale-90'}`}
                  >
                    <ChevronRight size={18}/>
                  </button>
                </div>
              </div>
            </div>)
          ) : (
            /* Tab Content: Settings Panel matching exact UserPermissions layout architecture */
            (<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn pb-6">
              {/* COMPLIANCE RULES CARD - left column */}
              <div className="lg:col-span-4 bg-white p-6 rounded-3xl shadow-lg border border-[#eaeaec] h-fit">
                <h3 className="text-[14px] font-black text-[#212c46] uppercase tracking-widest flex items-center gap-3 border-b-2 border-[#b7a159] pb-4 mb-6">
                  <Shield size={20} className="text-[#b7a159]" /> COMPLIANCE CONTROLS
                </h3>
                <div className="space-y-5">
                  <div className="p-5 bg-[#f8f9fa] border border-[#eaeaec] rounded-2xl shadow-sm hover:border-[#4d87a8] transition-colors">
                    <div className="flex items-center gap-2 text-[#4d87a8] font-black text-[12px] uppercase tracking-widest mb-2">
                      <ShieldCheck size={18}/> ISO 9001 Alignment
                    </div>
                    <p className="text-[12px] text-[#414757] font-bold leading-relaxed">
                      เอกสารลักษณะงานทั้งหมดจำเป็นต้องได้รับการตรวจสอบประวัติโดยผู้ถือสิทธิ์ Manager หรือบุคคลผู้ได้รับอนุญาตเพื่อรับรองมาตรฐานความสอดคล้องตามประมวลกฎหมาย
                    </p>
                  </div>
                  <div className="p-5 bg-[#932c2e]/10 border border-[#932c2e]/30 rounded-2xl shadow-sm hover:border-[#932c2e] transition-colors">
                    <div className="flex items-center gap-2 text-[#932c2e] font-black text-[12px] uppercase tracking-widest mb-2">
                      <Lock size={18}/> Restrictive Data
                    </div>
                    <p className="text-[12px] text-[#414757] font-bold leading-relaxed">
                      การเข้าถึงโครงสร้างเงินเดือน หรือประเมินข้อสอบคุณสมบัติภายในจะถูกปิดจำกัด และซอดคล้องกับพนักงาน HR ฝังระบบเท่านั้น
                    </p>
                  </div>
                </div>
              </div>
              {/* COMPLIANCE SETTING DETAILS - right column */}
              <div className="lg:col-span-8 bg-white rounded-3xl shadow-lg border border-[#eaeaec] overflow-hidden">
                <div className="p-6 bg-[#f8f9fa] border-b border-[#eaeaec]">
                  <h4 className="text-[14px] font-black uppercase text-[#212c46] tracking-widest flex items-center gap-3">
                    <ListTree size={20} className="text-[#b7a159]"/> SYSTEM COMPLIANCE MATRIX
                  </h4>
                </div>
                <div className="p-6 space-y-3 custom-scrollbar">
                  
                  {/* Category: Corporate Standards */}
                  <div className="space-y-2">
                    <div className={`flex items-center justify-between px-4 py-2.5 rounded-2xl border transition-all ${restrictiveMap['salary_master'] ? 'bg-[#932c2e]/5 border-[#932c2e]/30 shadow-sm' : 'bg-white border-[#eaeaec] hover:border-[#4d87a8]'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${restrictiveMap['salary_master'] ? 'bg-[#932c2e]/20 text-[#932c2e] border-[#932c2e]/30' : 'bg-[#f8f9fa] text-[#212c46] border-[#eaeaec]'}`}>
                          <Layers size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-[#212c46] text-[13px] uppercase tracking-widest">Restrict Salary Mappings with JDs</span>
                            <button onClick={() => toggleComplianceExpand('corporate')} className="p-1 hover:bg-slate-100 rounded transition-colors text-[#b7a159]">
                              <ChevronDown size={18} className={`transition-transform duration-300 ${complianceExpanded.corporate ? 'rotate-180' : ''}`} />
                            </button>
                          </div>
                          <span className={`text-[11px] font-black uppercase tracking-widest ${restrictiveMap['salary_master'] ? 'text-[#932c2e]' : 'text-[#7a8b95]'}`}>
                            Policy {restrictiveMap['salary_master'] ? 'Highly Restricted' : 'Active Standard'}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => toggleRestrictive('salary_master')} className={`p-2.5 rounded-xl transition-all shadow-sm active:scale-95 ${restrictiveMap['salary_master'] ? 'bg-[#932c2e] text-white' : 'bg-white text-[#7a8b95] border border-[#eaeaec] hover:bg-[#f8f9fa]'}`}>
                        {restrictiveMap['salary_master'] ? <Lock size={18}/> : <Eye size={18}/>}
                      </button>
                    </div>

                    {complianceExpanded.corporate && (
                      <div className="ml-16 space-y-2 animate-fadeIn pr-4 pb-6">
                        <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border bg-white transition-all ${restrictiveMap['confidential_eval'] ? 'border-[#932c2e]/40 bg-[#932c2e]/5' : 'border-slate-200'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${restrictiveMap['confidential_eval'] ? 'bg-[#932c2e]' : 'bg-[#b7a159]'}`}></div>
                            <span className="text-[12px] font-black text-[#212c46] uppercase">Restrict Technical Competency Benchmarks</span>
                          </div>
                          <button onClick={() => toggleRestrictive('confidential_eval')} className={`p-2 rounded-lg transition-colors ${restrictiveMap['confidential_eval'] ? 'text-[#932c2e] bg-[#932c2e]/10' : 'text-[#7a8b95] hover:bg-slate-100'}`}>
                            {restrictiveMap['confidential_eval'] ? <Lock size={16}/> : <Eye size={16}/>}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Standard Rules: ISO Compliance Verification */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl border bg-white border-[#eaeaec]">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center border bg-slate-50 border-slate-200">
                          <Check size={18} className="text-[#657f4d]"/>
                        </div>
                        <div>
                          <p className="font-black text-[#212c46] text-[13px] uppercase tracking-widest">Enforce Revision History Logger</p>
                          <p className="text-[11px] text-[#7a8b95] font-bold uppercase">System enforces automatic audit trails for any JD edit</p>
                        </div>
                      </div>
                      <span className="px-3.5 py-1.5 rounded-full bg-[#657f4d]/10 text-[#657f4d] font-black text-[10px] tracking-widest border border-[#657f4d]/30">MANDATORY</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>)
          )}

          {/* Spacer removed */}

        </div>
      </div>
    </div>
  );
}
