import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { DraggableModal } from '../../components/shared/DraggableModal';

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

export const WARNING_TEMPLATES: Record<string, WarningTemplate> = {
  Verbal: {
    severity: 'Verbal',
    titleTh: 'หนังสือบันทึกบันทึกการตักเตือนด้วยวาจา (Verbal Disciplinary Record)',
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

interface WarningLetterLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  cases: any[];
}

export function WarningLetterLibrary({ isOpen, onClose, cases }: WarningLetterLibraryProps) {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [severity, setSeverity] = useState<'Verbal' | 'Written' | 'Final'>('Written');
  
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
      const selected = cases.find(c => c.id === selectedCaseId);
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
  }, [selectedCaseId, cases]);

  // Sync templates default texts dynamically
  useEffect(() => {
    const activeTmpl = WARNING_TEMPLATES[severity];
    if (activeTmpl) {
      setCustomTextTh(activeTmpl.defaultTextTh);
      setCustomTextEn(activeTmpl.defaultTextEn);
    }
  }, [severity]);

  if (!isOpen) return null;

  const activeTemplate = WARNING_TEMPLATES[severity];

  const handlePrint = () => {
    // Create print iframe or print window cleanly
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
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      width="max-w-[850px]"
      customHeader={
        <div className="bg-[#212c46] px-5 py-3.5 flex justify-between items-center border-b-2 border-[#b58c4f]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/20">
              <Icons.FileText className="text-[#b7a159] w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-[#d7d7d7] uppercase tracking-widest leading-none">
                WARNING LETTER BUILDER / คลังหนังสือเตือนกฎหมายแรงงาน
              </h3>
              <p className="text-[10px] font-bold text-[#748b9e] uppercase tracking-wider mt-1 font-mono">
                Create Legally Compliant Warning Notices
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/75 hover:text-[#932c2e] transition-all bg-white/10 hover:bg-white/20 p-1.5 rounded-full">
            <Icons.X size={14} />
          </button>
        </div>
      }
    >
      <div className="flex flex-col md:flex-row overflow-hidden bg-[#f8f9fa] max-h-[500px]">
        {/* Editor Form Left Side */}
        <div className="w-full md:w-1/2 p-6 overflow-y-auto border-r border-[#eaeaec] bg-white space-y-4 custom-scrollbar">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-[#212c46] border-b pb-1 font-sans">
            1. Template Configuration / กำหนดเงื่อนไข
          </h4>

          <div>
            <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-wider mb-1">Select Case / อ้างอิงเลขสอบสวนคดี</label>
            <select 
              value={selectedCaseId} 
              onChange={e => setSelectedCaseId(e.target.value)}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl px-3 py-2 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#b7a159]"
            >
              <option value="">-- Choose Disciplinary Case / เลือกสำนวนคดี --</option>
              {cases.map(c => (
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
                      : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {sev} Notice
                </button>
              ))}
            </div>
          </div>

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
            <label className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-wider mb-1">Specific Defect Allegation / ข้อผิดพลาดเชิงข้อกล่าวหาเฉพาะ</label>
            <textarea 
              rows={3} 
              value={specificDetails} 
              onChange={e => setSpecificDetails(e.target.value)} 
              placeholder="ระบุพฤติกรรมการทดสอบความเสี่ยง หรือการทุจริต ละหน้าที่..."
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl p-3 text-[11px] font-bold text-[#212c46] outline-none focus:border-[#b7a159]" 
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

        {/* Live Preview Panel Right Side */}
        <div className="w-full md:w-1/2 p-6 bg-slate-50 overflow-y-auto flex flex-col space-y-4 custom-scrollbar">
          <div className="flex justify-between items-center border-b pb-1 shrink-0">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 font-sans">
              2. Document Live Preview
            </h4>
            <span className="text-[9px] font-mono font-black text-rose-500 uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> print preview active
            </span>
          </div>

          {/* Letter container mockup */}
          <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs space-y-4 text-[10px]">
            {/* Header logo & company name */}
            <div className="flex items-center gap-2.5 border-b pb-2">
              <div className="w-6 h-6 bg-[#212c46] rounded text-[#b58c4f] flex items-center justify-center font-bold text-[8px]">TAI</div>
              <div>
                <div className="font-extrabold text-[#212c46] leading-none uppercase text-[9px]">T All Intelligence Co., Ltd.</div>
                <div className="text-[7.5px] text-gray-400 mt-0.5">46 Moo 5, Klong 4, Klong Luang, Pathumthani Thailand 12120</div>
              </div>
            </div>

            {/* Warning Letter Title */}
            <div className="text-center font-black text-[#212c46] uppercase leading-snug">
              {activeTemplate.titleTh}
              <span className="block font-normal text-slate-400 text-[8.5px] lowercase italic mt-0.5">{activeTemplate.titleEn}</span>
            </div>

            {/* Metadata Table */}
            <div className="bg-[#f8f9fa] p-2.5 rounded-xl border border-[#eaeaec] grid grid-cols-2 gap-2 text-[9px] leading-relaxed">
              <div>
                <strong className="text-gray-500">EmployeeName: </strong>
                <span className="text-[#212c46] font-bold">{employeeName || '(Unspecified)'}</span>
              </div>
              <div>
                <strong className="text-gray-500">EmployeeId: </strong>
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
              <p className="bg-[#fef2f2] border border-red-100 p-2 text-[9.5px] text-gray-600 rounded-lg italic">
                {specificDetails || 'ไม่มีรายละเอียดข้อคิดค้นหรือพยานเรื่องการกระทำผิด ระบุด้านซ้ายเพื่อเรนเดอร์ใหม่...'}
              </p>
            </div>

            {/* Warning Directives */}
            <div className="space-y-2">
              <span className="font-bold text-[#212c46]">2. Restraint Directives (คำบังคับทางกฎหมาย):</span>
              <div>
                <div className="font-extrabold text-[#414757] mb-1">ฉบับภาษาไทย</div>
                <textarea 
                  rows={3} 
                  value={customTextTh} 
                  onChange={e => setCustomTextTh(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg p-2 text-[9.5px] font-normal leading-relaxed text-[#212c46] focus:border-[#b7a159] outline-none"
                />
              </div>
              <div>
                <div className="font-extrabold text-[#414757] mb-1">English Translation</div>
                <textarea 
                  rows={3} 
                  value={customTextEn} 
                  onChange={e => setCustomTextEn(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg p-2 text-[9.5px] font-normal leading-relaxed text-slate-500 focus:border-[#b7a159] outline-none"
                />
              </div>
            </div>

            {/* Legal basis */}
            <div className="bg-[#b58c4f]/10 p-2.5 rounded-xl border border-[#b58c4f]/20 text-[8.5px]">
              <strong className="text-[#a94228] block select-none">Labor Law Clause Reference: {activeTemplate.lpaReference}</strong>
              <p className="text-gray-600 leading-normal mt-0.5">
                {activeTemplate.clausesTh}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-3.5 bg-[#f8f9fa] border-t border-[#eaeaec] flex justify-between gap-3 shrink-0">
        <span className="text-[10px] font-bold text-gray-400 self-center">
          COMPANY AUDIT STANDARD APPROVED
        </span>
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={onClose} 
            className="px-4 py-2 bg-white border border-[#eaeaec] text-[#414757] rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-[#d7d7d7]/30 transition-all"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handlePrint} 
            className="bg-[#212c46] text-white px-5 py-2 rounded-xl font-black text-[11px] uppercase tracking-wider hover:bg-[#657f4d] transition-all flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Icons.Printer size={13} /> Export PDF / พิมพ์หนังสือเตือน
          </button>
        </div>
      </div>
    </DraggableModal>
  );
}
