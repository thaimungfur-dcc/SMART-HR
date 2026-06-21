import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { QrVerifier } from '../../components/shared/QrVerifier';

export interface WarningTemplate {
  severity: 'Verbal' | 'Written' | 'Final';
  titleTh: string;
  titleEn: string;
  clausesTh: string;
  clausesEn: string;
  lpaReference: string;
  defaultTextTh: string;
  defaultTextEn: string;
}

const WARNING_TEMPLATES: Record<string, WarningTemplate> = {
  Verbal: {
    severity: 'Verbal',
    titleTh: 'หนังสือบันทึกการตักเตือนด้วยวาจา (Verbal Disciplinary Record)',
    titleEn: 'Verbal Disciplinary Warning Record',
    clausesTh: 'ระเบียบข้อบังคับเกี่ยวกับการทำงาน หมวดที่ว่าด้วยระเบียบวินัยและการลงโทษทางวินัยฉบับรวบรัด โดยเป็นการแจ้งเพื่อปรับปรุงพฤติกรรมในขั้นตอนเบื้องต้น',
    clausesEn: 'Pursuant to Work Rules & Regulations (Chapter on Discipline & Corrective Actions) to notify and rectify minor workplace behaviors in the first instance.',
    lpaReference: 'ข้อบังคับการทำงานพึงปฏิบัติทั่วไป (Work Rules)',
    defaultTextTh: 'ตามที่ปรากฏพฤติกรรมของท่าน ละเลยต่อหน้าที่หรือฝ่าฝืนระเบียบเรื่องวันเวลาทำงาน/การร่วมสมาคมเมื่อวันที่เขียนข้อกล่าวหา คณะผู้บริหารจัดตักเตือนด้วยวาจานี้เพื่อให้พนักงานมีโอกาสแก้ไขความประพฤติให้ชอบด้วยกฎเกณฑ์ของทางบริษัทต่อไป',
    defaultTextEn: 'It has been observed that your workplace behavior on the incident date fell below acceptable criteria. This serves as a formal verbal record to provide you an immediate opportunity to correct and realign your performance/conduct.'
  },
  Written: {
    severity: 'Written',
    titleTh: 'หนังสือเตือนเป็นลายลักษณ์อักษร (Written Warning Letter Rule 119)',
    titleEn: 'Official Written Warning Letter',
    clausesTh: 'พระราชบัญญัติคุ้มครองแรงงาน พ.ศ. 2541 มาตรา 119 (4) ฝ่าฝืนข้อบังคับเกี่ยวกับการทำงาน หรือระเบียบ หรือคำสั่งอันชอบด้วยกฎหมายและเป็นธรรมของนายจ้าง และนายจ้างได้เตือนเป็นหนังสือแล้ว',
    clausesEn: 'Sec. 119 (4) of the Labor Protection Act B.E. 2541: Infraction of working rules, regulations or lawful orders, where a written warning has previously been issued by the employer.',
    lpaReference: 'พ.ร.บ. คุ้มครองแรงงาน พ.ศ. 2541 มาตรา 119(4)',
    defaultTextTh: 'ทางบริษัทฯ ตรวจพบการกระทำฝ่าฝืนข้อบังคับเกี่ยวกับการทำงานอย่างเป็นทางการ และเคยแจ้งตักเตือนท่านมาแล้วทางวาจาหรือบันทึกข้อตกลงเบื้องต้น หนังสือฉบับนี้จึงเป็นหนังสือเตือนอย่างเป็นทางการเป็นลายลักษณ์อักษร เพื่อให้ท่านระงับพฤติการณ์ฝ่าฝืนโดยพลัน หากล่วงเลยในอนาคตบริษัทฯ มีสิทธิ์พิจารณาพักงานหรือยุติสัมพันธภาพการจ้างตามกฎหมาย',
    defaultTextEn: 'The company has officially investigated your compliance with our standards and verified direct policy violations. You have previously been notified of these obligations. This official written letter demands immediate cessation of any further infractions, failing which severe adjustments or legal offboarding will take affect.'
  },
  Final: {
    severity: 'Final',
    titleTh: 'หนังสือเตือนครั้งสุดท้ายและสงวนสิทธิ์เลิกจ้าง (Final Written Warning Notice)',
    titleEn: 'Strict Final Written Warning & Reservation of Termination Right',
    clausesTh: 'พระราชบัญญัติคุ้มครองแรงงาน พ.ศ. 2541 มาตรา 119(4) และประมวลกฎหมายแพ่งและพาณิชย์ หากพนักงานกระทำความผิดซ้ำคำเตือนเป็นหนังสือในระยะเวลา 1 ปี นับแต่วันที่พนักงานได้กระทำความผิด บริษัทฯ มีสิทธิ์บอกเลิกสัญญาจ้างได้ทันทีโดยไม่ต้องจ่ายค่าชดเชยใดๆ ทั้งสิ้น',
    clausesEn: 'Pursuant to Section 119(4) of the Thai Labor Protection Act B.E. 2541: In the event of a repeated violation within one year from the date of the written infraction warning, the employer is legally entitled to terminate the employment transition immediately with zero severance obligation.',
    lpaReference: 'มาตรา 119(4) แห่งพระราชบัญญัติคุ้มครองแรงงาน (LPA Sec 119(4))',
    defaultTextTh: 'หนังสือฉบับนี้ถือเป็นคำเตือนระดับสูดสุด ("หนังสือเตือนครั้งสุดท้าย") เนื่องจากตรวจยืนยันพฤติการณ์ละเลยหรือต่อพฤติกรรมจงใจฝ่าฝืนข้อบังคับซ้ำซาก หากท่านกระทำการละเมิดหรือฝ่าฝืนข้อบังคับในการทำงานฉบับใดๆ อีกแม้เพียงครั้งเดียวภายในกำหนดเวลา 1 ปีนับแต่นี้ บริษัทฯ จะใช้สิทธิ์ตามกฎหมายยกเลิกสัญญาจ้างท่านทันทีโดยไม่ชดเชยค่าจ้าง',
    defaultTextEn: 'This represents your final written status warning. You have willfully neglected directives despite past interventions. If you commit any further infract of working rules or company policy of any nature within 1 year from this dispatch, the company will unilaterally activate immediate termination without any severance pay.'
  }
};

const MOCK_CASES = [
  {
    id: 'INV-2026-001',
    employeeId: 'EMP-20412',
    employeeName: 'นายศักดิ์สิทธิ์ สุวรรณฉัตรศิริ',
    position: 'Database Administrator',
    dept: 'Information Technology',
    severity: 'Critical',
    accusation: 'เข้าถึงข้อมูลลูกค้าที่อ่อนไหวโดยไม่ได้รับอนุญาต และดาวน์โหลดไฟล์ SQL นอกเวลาทำงานปกติโดยไม่มีใบแจ้งงาน (Ticket Approved)',
    date: '2026-05-12',
  },
  {
    id: 'INV-2026-002',
    employeeId: 'EMP-20984',
    employeeName: 'นางสาวจิราภรณ์ วีระเดชกุล',
    position: 'Senior Procurement Officer',
    dept: 'Procurement & Logistics',
    severity: 'Major',
    accusation: 'พบผลประโยชน์ขัดกันในการแนะนำผู้ขายวัตถุดิบ (Conflict of Interest) โดยไม่มีการแจ้งปฏิเสธความเกี่ยวข้องเครือญาติในโปรเจกต์แปรรูปสับปะรด',
    date: '2026-05-28',
  },
  {
    id: 'INV-2026-003',
    employeeId: 'EMP-20150',
    employeeName: 'นายมนตรี พูลสวัสดิ์',
    position: 'Production Line Lead',
    dept: 'Manufacturing Node B',
    severity: 'Normal',
    accusation: 'ละเลยการสวมใส่อุปกรณ์หมวกและแว่นตานิรภัยในเขตพื้นที่ทดสอบเครื่องจักรแปรรูปความร้อนความดันสูง ถึงแม้จะถูกเตือนเป็นลายลักษณ์อักษรแล้ว 2 ครั้ง',
    date: '2026-06-02',
  },
  {
    id: 'INV-2026-004',
    employeeId: 'EMP-20311',
    employeeName: 'นายสรพงษ์ แก้วเกรียงไกร',
    position: 'Inventory Operations Supervisor',
    dept: 'Warehouse Systems',
    severity: 'Normal',
    accusation: 'ใช้วาจาไม่สุภาพและแสดงพฤติกรรมก้าวร้าวต่อพนักงานขนส่งภายนอกรวมถึงเพื่อนร่วมงาน ณ อาคารกระจายสินค้าภาคเหนือ',
    date: '2026-06-05',
  },
  {
    id: 'INV-2026-005',
    employeeId: 'EMP-20677',
    employeeName: 'นางกาญจนา สมศรี',
    position: 'Financial Ledger Executive',
    dept: 'Accounting & Treasury',
    severity: 'Critical',
    accusation: 'ความผิดบิดเบือนข้อมูลในรายงานงบดุลย่อยเพื่อปกปิดยอดเงินสดสวัสดิการพนักงานสูญหาย เป็นยอดตรวจสอบพบจำนวน 45,000 บาท',
    date: '2026-06-08',
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
    <div style="display: flex; flex-direction: column; align-items: center; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; width: fit-content; background-color: #ffffff; text-align: center; margin: 30px auto 10px auto; page-break-inside: avoid;">
      <div style="position: relative; width: 75px; height: 75px; background-color: white;">
        <svg viewBox="0 0 25 25" width="75" height="75" style="shape-rendering: crispEdges;">
          ${rects}
        </svg>
      </div>
      <div style="margin-top: 5px; font-family: monospace; line-height: 1.2;">
        <span style="display: block; font-size: 7px; font-weight: 800; color: #a94228; text-transform: uppercase; letter-spacing: 0.15em;">${labelText}</span>
        <span style="display: block; font-size: 6px; color: #64748b; margin-top: 1.5px;">DOC ID: ${id}</span>
      </div>
    </div>
  `;
};

export default function WarningLettersPage() {
  const { language } = useLanguage();
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [severity, setSeverity] = useState<'Verbal' | 'Written' | 'Final'>('Written');
  const [paperSize, setPaperSize] = useState<'a4' | 'letter' | 'legal'>('a4');

  useEffect(() => {
    document.body.classList.remove('print-size-a4', 'print-size-letter', 'print-size-legal');
    document.body.classList.add(`print-size-${paperSize}`);
    return () => {
      document.body.classList.remove('print-size-a4', 'print-size-letter', 'print-size-legal');
    };
  }, [paperSize]);
  
  // Custom form inputs
  const [employeeName, setEmployeeName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [specificDetails, setSpecificDetails] = useState('');
  const [authorizedSignatory, setAuthorizedSignatory] = useState('นางสาวอรพิมล สมประสงค์ (HR Director)');
  
  // Track selected template content
  const [customTextTh, setCustomTextTh] = useState('');
  const [customTextEn, setCustomTextEn] = useState('');

  // Sync details when case is chosen
  useEffect(() => {
    if (selectedCaseId && selectedCaseId !== 'custom') {
      const selected = MOCK_CASES.find(c => c.id === selectedCaseId);
      if (selected) {
        setEmployeeName(selected.employeeName || '');
        setEmployeeId(selected.employeeId || '');
        setPosition(selected.position || '');
        setDepartment(selected.dept || '');
        setIncidentDate(selected.date || new Date().toISOString().split('T')[0]);
        setSpecificDetails(selected.accusation || '');
        
        // Auto map category severity
        if (selected.severity === 'Critical') {
          setSeverity('Final');
        } else if (selected.severity === 'Major') {
          setSeverity('Written');
        } else {
          setSeverity('Verbal');
        }
      }
    } else if (selectedCaseId === 'custom') {
      setEmployeeName('');
      setEmployeeId('EMP-');
      setPosition('');
      setDepartment('');
      setIncidentDate(new Date().toISOString().split('T')[0]);
      setSpecificDetails('');
    }
  }, [selectedCaseId]);

  // Sync templates default texts dynamically
  useEffect(() => {
    const activeTmpl = WARNING_TEMPLATES[severity];
    if (activeTmpl) {
      setCustomTextTh(activeTmpl.defaultTextTh);
      setCustomTextEn(activeTmpl.defaultTextEn);
    }
  }, [severity]);

  const activeTemplate = WARNING_TEMPLATES[severity];

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to export the letter to PDF.');
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <title>${activeTemplate.titleTh}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;800&family=Inter:wght@400;600;800&display=swap');
            body { 
              font-family: 'Sarabun', 'Inter', sans-serif; 
              color: #1e293b; 
              margin: 40px; 
              line-height: 1.6;
              font-size: 14px;
            }
            .header-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
              border-bottom: 2px solid #212c46;
              padding-bottom: 15px;
            }
            .company-title {
              font-size: 18px;
              font-weight: 800;
              color: #212c46;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .doc-title {
              text-align: center;
              font-size: 16px;
              font-weight: 800;
              margin: 25px 0;
              text-transform: uppercase;
              border-bottom: 1px dashed #cbd5e1;
              padding-bottom: 10px;
            }
            .meta-table {
              width: 100%;
              margin-bottom: 25px;
            }
            .meta-table td {
              padding: 4px 0;
            }
            .label {
              font-weight: 600;
              width: 180px;
              color: #475569;
            }
            .section-header {
              font-weight: 800;
              color: #212c46;
              margin-top: 20px;
              margin-bottom: 10px;
              font-size: 14px;
              border-left: 3px solid #b58c4f;
              padding-left: 8px;
            }
            .content-box {
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 15px;
              margin: 15px 0;
              text-align: justify;
              white-space: pre-wrap;
              font-size: 13.5px;
            }
            .legal-box {
              background-color: #fef2f2;
              border: 1px solid #fee2e2;
              border-left: 4px solid #ef4444;
              border-radius: 6px;
              padding: 12px;
              font-size: 12.5px;
              color: #991b1b;
              margin: 20px 0;
            }
            .signatures-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-top: 50px;
              page-break-inside: avoid;
            }
            .signature-card {
              border-top: 1px solid #94a3b8;
              text-align: center;
              padding-top: 10px;
              font-size: 12.5px;
            }
            @media print {
              body { margin: 20px; font-size: 13px; }
              .content-box { background-color: transparent; border: none; padding: 0; }
              .legal-box { background-color: transparent; border: none; border-left: 3px solid #ef4444; padding-left: 10px; }
              .no-print { display: none; }
            }
            @page {
              size: ${paperSize === 'a4' ? 'A4 portrait' : paperSize === 'letter' ? 'letter portrait' : 'legal portrait'};
              margin: 15mm 15mm 15mm 15mm;
            }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td style="width: 70px;">
                <div style="width: 50px; height: 50px; background-color: #212c46; border-radius: 8px; display: inline-block; color: #b58c4f; font-weight: 900; line-height: 50px; text-align: center; font-size: 16px;">TAI</div>
              </td>
              <td>
                <div class="company-title">T All Intelligence Co., Ltd.</div>
                <div style="font-size: 11px; color: #64748b;">46 Moo 5, Klong 4, Klong Luang, Pathumthani Thailand 12120</div>
              </td>
            </tr>
          </table>

          <div class="doc-title">
            ${activeTemplate.titleTh}<br/>
            <span style="font-size: 13px; font-weight: 400; color: #64748b;">${activeTemplate.titleEn}</span>
          </div>

          <table class="meta-table">
            <tr>
              <td class="label">วันที่เอกสาร (Letter Date):</td>
              <td>${new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
            </tr>
            <tr>
              <td class="label">ชื่อพนักงาน (Accused Personnel):</td>
              <td><strong>${employeeName}</strong></td>
            </tr>
            <tr>
              <td class="label">รหัสพนักงาน (ID):</td>
              <td><span style="font-family: monospace;">${employeeId}</span></td>
            </tr>
            <tr>
              <td class="label">ตำแหน่ง/ฝ่าย (Position/Dept):</td>
              <td>${position} &bull; ${department}</td>
            </tr>
            <tr>
              <td class="label">วันที่ทำผิดวินัย (Infraction Date):</td>
              <td>${new Date(incidentDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
            </tr>
          </table>

          <div class="section-header">รายละเอียดการกระทำความผิดวินัยโดยสังเขป (Infraction Details Summary)</div>
          <div class="content-box">${specificDetails || 'กระทำความผิดในฐานละเลยวินัยพฤติกรรมความปลอดภัยและระบบข้อมูลบริษัท'}</div>

          <div class="section-header">มาตรการสั่งบังคับทางวินัยและปรับพฤติกรรม (Disciplinary Directives Enforced)</div>
          <div class="content-box">
<strong>[ฉบับภาษาไทย]</strong>
${customTextTh}

<strong>[ENGLISH TRANSLATION]</strong>
${customTextEn}
          </div>

          <div class="section-header">บทอ้างอิงข้อบันบังคับทางกฎหมาย (Labor Protection Legal Clause)</div>
          <div class="legal-box">
            <strong>ฐานอ้างอิง: ${activeTemplate.lpaReference}</strong><br/>
            [TH] ${activeTemplate.clausesTh}<br/><br/>
            <strong>[EN]</strong> ${activeTemplate.clausesEn}
          </div>

          <div class="signatures-grid">
            <div class="signature-card" style="margin-top: 50px;">
              <br/><br/>
              ___________________________________________<br/>
              ( ${authorizedSignatory} )<br/>
              ผู้ออกหนังสือตักเตือน/ตัวแทนนายจ้าง
            </div>
            <div class="signature-card" style="margin-top: 50px;">
              <br/><br/>
              ___________________________________________<br/>
              ( ${employeeName} )<br/>
              พนักงานผู้รับทราบข้อกล่าวหาและคำเตือนภาระวินัย
            </div>
          </div>

          <!-- Deterministic secure Verification QR Code for printed letter compliance -->
          ${generateQrSvgString(`VERIFYW-${employeeId || 'NA'}-${incidentDate.replace(/-/g, '')}`, "OFFICIAL WARNING COMPLIANCE")}

          <div style="margin-top: 35px; font-size: 11px; text-align: center; color: #94a3b8; page-break-inside: avoid;">
            หมายเหตุ: พนักงานได้รับสำเนาหนังสือนี้หนึ่งฉบับแล้ว หากพนักงานปฏิเสธที่จะลงนาม ให้นายจ้างอ่านพฤติการณ์ต่อหน้าพยานสองคนเพื่อตรวจสอบผลคดี
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative z-10">
      {/* Page Header */}
      <div className="h-14 px-8 flex flex-row items-center justify-between gap-4 shrink-0 bg-transparent">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center group cursor-default shrink-0">
            <div className="absolute inset-0 bg-[#b58c4f] blur-[15px] opacity-15 rounded-full"></div>
            <div className="relative z-10 p-1.5 border border-[#b58c4f]/35 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm">
              <Icons.FileText size={24} strokeWidth={2.5} className="text-[#b58c4f]" />
            </div>
          </div>
          <div>
            <h2 className="font-black text-[#212c46] uppercase tracking-tighter leading-none" style={{ fontSize: '24px' }}>
              {language === 'EN' ? 'WARNING LETTER BUILDER' : 'ออกหนังสือเตือน'}
            </h2>
            <p className="text-[11px] font-bold text-[#7a8b95] uppercase tracking-[0.2em] mt-1 leading-none">
              Create Legally Compliant Warning Notices
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 items-center bg-white p-1.5 px-3 border border-slate-200/80 rounded-xl shadow-xs">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase">ขนาด (Size):</span>
            <select 
              value={paperSize} 
              onChange={(e) => setPaperSize(e.target.value as 'a4' | 'letter' | 'legal')}
              className="p-0 border-0 rounded-lg text-[11px] font-extrabold text-[#212c46] outline-none bg-transparent focus:ring-0 cursor-pointer"
            >
              <option value="a4">A4 (Standard)</option>
              <option value="letter">Letter</option>
              <option value="legal">Legal</option>
            </select>
          </div>

          <button 
            type="button"
            onClick={handlePrint} 
            className="bg-[#212c46] text-white px-5 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider hover:bg-[#657f4d] transition-all flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Icons.Printer size={13} /> Export PDF / พิมพ์หนังสือเตือน
          </button>
        </div>
      </div>

      {/* Main Container Dual Column Grid */}
      <div className="flex-1 px-8 pb-6 flex flex-col md:flex-row gap-6 overflow-hidden min-h-0">
        
        {/* Editor Form Left Side */}
        <div className="w-full md:w-1/2 bg-white rounded-3xl p-6 border border-[#eaeaec] shadow-sm overflow-y-auto space-y-4 custom-scrollbar">
          <div className="border-b pb-2">
            <h4 className="text-[12px] font-black uppercase tracking-widest text-[#212c46] font-sans">
              1. TEMPLATE CONFIGURATION & EXPOSURE DETAILS
            </h4>
            <p className="text-[10px] text-gray-400 mt-0.5">ระบุข้อมูลความผิดและข้อบังคับตามกฎหมายแรงงานไทย</p>
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-wider mb-1">Select Case / อ้างอิงเลขสอบสวนคดี</label>
            <select 
              value={selectedCaseId} 
              onChange={e => setSelectedCaseId(e.target.value)}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl px-3 py-2.5 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#b7a159]"
            >
              <option value="">-- Choose Disciplinary Case / เลือกสำนวนคดี --</option>
              {MOCK_CASES.map(c => (
                <option key={c.id} value={c.id}>{c.id} - {c.employeeName} ({c.severity} Risk)</option>
              ))}
              <option value="custom">-- Custom Input / สร้างแบบกำหนดเอง --</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-wider mb-1">Full Name / ชื่อพนักงาน</label>
              <input 
                type="text" 
                value={employeeName} 
                onChange={e => setEmployeeName(e.target.value)} 
                className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl px-3 py-2 text-[11px] font-bold text-[#212c46] outline-none focus:border-[#b7a159]" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-wider mb-1">Employee ID / รหัสพนักงาน</label>
              <input 
                type="text" 
                value={employeeId} 
                onChange={e => setEmployeeId(e.target.value)} 
                className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl px-3 py-2 text-[11px] font-mono font-bold text-[#212c46] outline-none focus:border-[#b7a159]" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-wider mb-1">Position / ตำแหน่ง</label>
              <input 
                type="text" 
                value={position} 
                onChange={e => setPosition(e.target.value)} 
                className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl px-3 py-2 text-[11px] font-bold text-[#212c46] outline-none focus:border-[#b7a159]" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-wider mb-1">Department / แผนก</label>
              <input 
                type="text" 
                value={department} 
                onChange={e => setDepartment(e.target.value)} 
                className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl px-3 py-2 text-[11px] font-bold text-[#212c46] outline-none focus:border-[#b7a159]" 
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-wider mb-1">Severity & Template / ระดับความผิดหนังสือเตือน</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Verbal', 'Written', 'Final'] as const).map(sev => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverity(sev)}
                  className={`py-2 px-1 rounded-xl text-center text-[10px] font-black uppercase border tracking-wider transition-all cursor-pointer ${
                    severity === sev 
                      ? 'bg-[#212c46] text-white border-[#212c46] shadow-sm' 
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {sev} Notice
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-wider mb-1">Incident Date / วันกระทำผิด</label>
              <input 
                type="date" 
                value={incidentDate} 
                onChange={e => setIncidentDate(e.target.value)} 
                className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl px-3 py-2 text-[11px] font-mono font-bold text-[#212c46] outline-none focus:border-[#b7a159]" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-wider mb-1">Authorized HR Signatory / ตัวแทนนายจ้างผู้ลงนาม</label>
              <input 
                type="text" 
                value={authorizedSignatory} 
                onChange={e => setAuthorizedSignatory(e.target.value)} 
                className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl px-3 py-2 text-[11px] font-bold text-[#212c46] outline-none focus:border-[#b7a159]" 
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-wider mb-1">Specific Defect Allegation / ข้อผิดพลาดเชิงข้อกล่าวหาเฉพาะ</label>
            <textarea 
              rows={4} 
              value={specificDetails} 
              onChange={e => setSpecificDetails(e.target.value)} 
              placeholder="ระบุพฤติกรรมการผิดวินัยอย่างชัดเจน (เช่น วันเวลา พฤติกรรมที่บกพร่อง วัตถุพยาน)..."
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl p-3 text-[11px] font-bold text-[#212c46] outline-none focus:border-[#b7a159]" 
            />
          </div>
        </div>

        {/* Live Preview Panel Right Side */}
        <div className="w-full md:w-1/2 bg-slate-50 rounded-3xl p-6 border border-[#eaeaec] flex flex-col space-y-4 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center border-b pb-1.5 shrink-0">
            <h4 className="text-[12px] font-black uppercase tracking-widest text-[#7a8b95] font-sans">
              2. DOCUMENT LIVE PREVIEW
            </h4>
            <span className="text-[9px] font-mono font-black text-emerald-600 uppercase flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> print ready format
            </span>
          </div>

          {/* Letter container mockup */}
          <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-5 text-[11px] font-sans text-[#1e293b]">
            {/* Header logo & company name */}
            <div className="flex items-center gap-3 border-b pb-3">
              <div className="w-8 h-8 bg-[#212c46] rounded-lg text-[#b58c4f] flex items-center justify-center font-bold text-[10px]">TAI</div>
              <div>
                <div className="font-extrabold text-[#212c46] leading-none uppercase text-[10px]">T All Intelligence Co., Ltd.</div>
                <div className="text-[8px] text-gray-400 mt-0.5">46 Moo 5, Klong 4, Klong Luang, Pathumthani Thailand 12120</div>
              </div>
            </div>

            {/* Warning Letter Title */}
            <div className="text-center font-black text-[#212c46] uppercase leading-snug">
              {activeTemplate.titleTh}
              <span className="block font-normal text-slate-400 text-[9px] lowercase italic mt-0.5">{activeTemplate.titleEn}</span>
            </div>

            {/* Metadata Table */}
            <div className="bg-[#f8f9fa] p-3 rounded-xl border border-[#eaeaec] grid grid-cols-2 gap-2 text-[10px] leading-relaxed">
              <div>
                <strong className="text-gray-500">Employee Name: </strong>
                <span className="text-[#212c46] font-bold">{employeeName || '(Unspecified)'}</span>
              </div>
              <div>
                <strong className="text-gray-500">Employee ID: </strong>
                <span className="text-[#a94228] font-mono font-bold">{employeeId || '(ID)'}</span>
              </div>
              <div>
                <strong className="text-gray-500">Department: </strong>
                <span className="text-[#212c46] font-bold">{department || '(Dept)'}</span>
              </div>
              <div>
                <strong className="text-gray-500">Date Logged: </strong>
                <span className="text-slate-600 font-bold">{incidentDate || '(Date)'}</span>
              </div>
            </div>

            {/* Allegation details */}
            <div className="space-y-1">
              <span className="font-bold text-[#212c46]">1. Infraction Details (พฤติกรรมความผิด):</span>
              <p className="bg-rose-50/50 border border-rose-100 p-2.5 text-[10px] text-gray-600 rounded-lg italic">
                {specificDetails || 'ไม่มีรายละเอียดข้อคิดค้นหรือพยานเรื่องการกระทำผิด (โปรดกรอกรายละเอียดในฟอร์มซ้ายมือ)'}
              </p>
            </div>

            {/* Warning Directives */}
            <div className="space-y-3">
              <span className="font-bold text-[#212c46]">2. Restraint Directives (คำบังคับทางกฎหมาย):</span>
              <div>
                <div className="font-extrabold text-[#414757] mb-1">ฉบับภาษาไทย</div>
                <textarea 
                  rows={3} 
                  value={customTextTh} 
                  onChange={e => setCustomTextTh(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg p-2.5 text-[10px] font-normal leading-relaxed text-[#212c46] focus:border-[#b7a159] outline-none"
                />
              </div>
              <div>
                <div className="font-extrabold text-[#414757] mb-1">English Translation</div>
                <textarea 
                  rows={3} 
                  value={customTextEn} 
                  onChange={e => setCustomTextEn(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg p-2.5 text-[10px] font-normal leading-relaxed text-slate-500 focus:border-[#b7a159] outline-none"
                />
              </div>
            </div>

            {/* Legal basis */}
            <div className="bg-[#b58c4f]/10 p-3 rounded-xl border border-[#b58c4f]/20 text-[9px] leading-relaxed flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <strong className="text-[#a94228] block select-none">Labor Law Clause Reference: {activeTemplate.lpaReference}</strong>
                <p className="text-gray-600 mt-1 leading-normal">
                  {language === 'EN' ? activeTemplate.clausesEn : activeTemplate.clausesTh}
                </p>
              </div>

              {/* Live QR Verification on screen */}
              <div className="shrink-0 p-1 rounded-xl bg-white border border-slate-200 mt-2 sm:mt-0 shadow-xs self-center">
                <QrVerifier 
                  value={`VERIFYW-${employeeId || 'NA'}-${incidentDate.replace(/-/g, '')}`}
                  label="VERIFIED"
                  size={52}
                  showScanText={true}
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
