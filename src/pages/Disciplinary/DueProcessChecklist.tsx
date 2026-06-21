import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { DraggableModal } from '../../components/shared/DraggableModal';

export interface DueProcessStep {
  id: string;
  labelTh: string;
  labelEn: string;
  descriptionTh: string;
  descriptionEn: string;
  required: boolean;
  legalClause?: string;
}

export const MANDATORY_STEPS: DueProcessStep[] = [
  {
    id: 'step_incident_report',
    labelTh: 'บันทึกรายงานพฤติการณ์ความผิดเบื้องต้น',
    labelEn: 'Record Initial Incident Statement',
    descriptionTh: 'เขียนหรือบันทึกรายงานเหตุการณ์ที่เกิดขึ้นโดยผู้เห็นเหตุการณ์หรือผู้บังคับบัญชาโดยตรง',
    descriptionEn: 'Formally document the incident including timestamps, coordinates and direct eyewitness statements.',
    required: true,
    legalClause: 'ข้อบังคับการทำงานพึงปฏิบัติทั่วไป'
  },
  {
    id: 'step_fact_finding',
    labelTh: 'การตรวจสอบสิทธิข้อมูลและพยานแวดล้อม',
    labelEn: 'Fact-Finding & Gather Physical Evidents',
    descriptionTh: 'ดำเนินการจัดเก็บภาพบันทึก CCTV, ข้อมูลเครื่องสแกนนิ้ว, ดึงไฟล์ Log คอนโซลระบบอย่างปลอดภัย โดยไม่ดัดแปลง',
    descriptionEn: 'Acquire system logs, biometric entries, CCTV footages or audit reports following the chain of custody.',
    required: true,
    legalClause: 'พ.ร.บ. คุ้มครองแรงงาน หมวดวินัยฯ'
  },
  {
    id: 'step_notification_defense',
    labelTh: 'การออกหนังสือแจ้งข้อกล่าวหาและให้สิทธิชี้แจง',
    labelEn: 'Serve Notice of Allegation & Due Defense Window',
    descriptionTh: 'ส่งมอบจดหมายข้อร้องเรียนแก่ผู้ถูกกล่าวหา และให้สิทธิพนักงานเข้าชี้แจงข้อเท็จจริงพร้อมพยานหลักฐานหักล้างภายใน 3-7 วัน',
    descriptionEn: 'Formally notify the employee of specific policy infractions. Offer them the absolute legal Right to be Heard.',
    required: true,
    legalClause: 'หลักความยุติธรรมธรรมชาติ (Natural Justice) และสิทธิโต้แย้งสากล'
  },
  {
    id: 'step_committee_review',
    labelTh: 'การเรียกตรวจพิจารณาคดีโดยพยานบุคคลที่เป็นกลาง',
    labelEn: 'Form Neutral Disciplinary Committee Board',
    descriptionTh: 'แต่งตั้งคณะสืบสวนและสอบสวนที่เป็นกลางอย่างน้อย 3 คน (เช่น ตัวแทนฝ่ายทรัพยากรบุคคล, หัวหน้าแผนกภายนอก, ผู้เชี่ยวชาญกฎหมาย)',
    descriptionEn: 'Appoint non-biased members to review defense claims and assess evidence without predefined discrimination.',
    required: false,
    legalClause: 'มาตรา 119 ป.พ.พ. ความเสมอภาคธรรมภาวะ'
  },
  {
    id: 'step_labor_law_vetting',
    labelTh: 'ตรวจสอบความสอดคล้องตามมาตรา 119 แห่งกฎหมายคุ้มครองแรงงาน',
    labelEn: 'Vetting Severe Compliance with Section 119 LPA',
    descriptionTh: 'วิเคราะห์ร่วมกับฝ่ายกฎหมายว่าความผิดของพนักงานจัดเป็น "ความผิดร้ายแรงสูงสุด" หรือ "เตือนแล้วยังฝ่าฝืน" ป้องกันฟ้องคดีเลิกจ้างไม่เป็นธรรม',
    descriptionEn: 'Evaluate whether the misconduct justifies immediate unilateral termination without severance pay (LPA Sec 119).',
    required: true,
    legalClause: 'พ.ร.บ. คุ้มครองแรงงาน พ.ศ. 2541 มาตรา 119'
  },
  {
    id: 'step_appeal_opportunity',
    labelTh: 'การเปิดโอกาสให้พนักงานยื่นคำร้องอุทธรณ์โทษ',
    labelEn: 'Provide 15-Day Resolution Appeal Option',
    descriptionTh: 'แจ้งให้พนักงานทราบถึงสิทธิ์การยื่นคำร้องอุทธรณ์ผลต่อคณะกรรมการจัดการระดับสูงภายใน 15 วันทำการหลังได้รับหนังสือสั่งประกาศลงโทษ',
    descriptionEn: 'Permit the employee to officially submit an appeal letter contesting the decision to senior executive level.',
    required: true,
    legalClause: 'ระเบียบว่าด้วยมาตรการอุทธรณ์คําสั่งและผลบังคับทางกฎหมายวินัย'
  }
];

interface DueProcessChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  employeeName: string;
  checkedState: Record<string, boolean>;
  onToggleStep: (stepId: string) => void;
  onConfirmAll: () => void;
}

export function DueProcessChecklistModal({
  isOpen,
  onClose,
  caseId,
  employeeName,
  checkedState,
  onToggleStep,
  onConfirmAll
}: DueProcessChecklistModalProps) {
  const [showWarning, setShowWarning] = useState(false);
  const totalRequired = MANDATORY_STEPS.filter(s => s.required).length;
  const checkedRequired = MANDATORY_STEPS.filter(s => s.required && checkedState[s.id]).length;
  const isFullyCompliant = checkedRequired === totalRequired;

  const handleConfirmClick = () => {
    if (!isFullyCompliant) {
      setShowWarning(true);
    } else {
      onConfirmAll();
      onClose();
    }
  };

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      width="max-w-[700px]"
      customHeader={
        <div className="bg-[#212c46] px-5 py-3.5 flex justify-between items-center border-b-2 border-[#b58c4f]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/20">
              <Icons.ShieldCheck className="text-[#b7a159] w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-[#d7d7d7] uppercase tracking-widest leading-none">
                DUE PROCESS AUDIT / การสืบสวนสอบสวนชอบด้วยกฎหมาย
              </h3>
              <p className="text-[10px] font-bold text-[#748b9e] uppercase tracking-wider mt-1 font-mono">
                Case compliance tracking: {caseId}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/75 hover:text-[#932c2e] transition-all bg-white/10 hover:bg-white/20 p-1.5 rounded-full">
            <Icons.X size={14} />
          </button>
        </div>
      }
    >
      <div className="p-6 bg-white overflow-y-auto max-h-[500px] custom-scrollbar space-y-5">
        <div className="bg-[#f8f9fa] border border-[#eaeaec] p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black uppercase text-[#7a8b95] tracking-wider">Accused Individual</div>
            <div className="text-[12px] font-extrabold text-[#212c46] mt-0.5">{employeeName || 'ไม่ระบุพนักงาน'}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-black uppercase text-[#7a8b95] tracking-wider">Status</div>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase ${
              isFullyCompliant ? 'bg-[#657f4d]/10 text-[#657f4d] border border-[#657f4d]/25' : 'bg-[#a94228]/10 text-[#a94228] border border-[#a94228]/25'
            }`}>
              <Icons.ShieldAlert size={12} className={isFullyCompliant ? 'text-[#657f4d]' : 'text-[#a94228]'} />
              {isFullyCompliant ? 'Fully Law-Compliant' : 'Risk of Unfair Termination'}
            </span>
          </div>
        </div>

        <p className="text-[11.5px] text-[#414757] leading-relaxed">
          ความผิดพลาดในขั้นตอนสืบสวนอาจส่งผลให้ถูกฟ้องกลับฐาน <strong>เลิกจ้างไม่เป็นธรรม (Unfair Dismissal)</strong> ณ ศาลแรงงาน 
          ฝ่ายบุคคล (HR Relations) กรุณาตรวจสอบว่า ดำเนินกระบวนการตามขั้นตอน Due Process ภาระผูกพันกฎหมายครบถ้วนทุกประการ:
        </p>

        <div className="space-y-3.5">
          {MANDATORY_STEPS.map((step) => {
            const isChecked = !!checkedState[step.id];
            return (
              <div 
                key={step.id} 
                onClick={() => onToggleStep(step.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  isChecked 
                    ? 'bg-slate-50 border-slate-300' 
                    : 'bg-white border-[#eaeaec] hover:border-slate-300'
                }`}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                  isChecked ? 'bg-[#212c46] border-[#212c46] text-[#b7a159]' : 'border-gray-300 bg-white'
                }`}>
                  {isChecked && <Icons.Check size={14} strokeWidth={3} />}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-extrabold text-[#212c46] text-[11.5px] tracking-tight">
                      {step.labelTh} <span className="text-[10px] text-gray-400 font-normal">({step.labelEn})</span>
                    </span>
                    {step.required ? (
                      <span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-1.5 py-0.2 rounded uppercase">
                        Mandatory / บังคับทางแพ่ง
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-gray-500 bg-gray-50 border border-gray-200 px-1.5 py-0.2 rounded uppercase">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 leading-normal">
                    {step.descriptionTh} <span className="italic text-[10.5px]">({step.descriptionEn})</span>
                  </p>
                  {step.legalClause && (
                    <div className="text-[10.5px] font-mono font-bold text-[#b58c4f] flex items-center gap-1 shrink-0 mt-1">
                      <Icons.Scale size={11} /> {step.legalClause}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {showWarning && !isFullyCompliant && (
          <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 flex items-start gap-2.5 animate-bounce">
            <Icons.AlertTriangle className="text-orange-600 shrink-0 mt-0.5" size={16} />
            <div>
              <strong className="text-orange-800 text-[11.5px] block font-black">คำเตือนด้านความเสี่ยงทางกฎหมายแรงงาน (Legal Compliance Risk!)</strong>
              <span className="text-orange-700 text-[11px] leading-relaxed block mt-0.5">
                พนักงานชี้แจงคำหักล้างยังไม่ครบถ้วน หรือยังไม่ได้ตรวจสอบมาตรา 119 ปล่อยคดีสืบสวนนี้ไปอาจมีโอกาสที่บริษัทจะแพ้คดีเลิกจ้างไม่เป็นธรรมได้ หากจำเป็นต้องบันทึกกดปุ่มสลักรหัสลงนามปิดงานอีกครั้ง
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 py-3.5 bg-[#f8f9fa] border-t border-[#eaeaec] flex justify-between gap-3 shrink-0">
        <span className="text-[10.5px] font-bold text-[#7a8b95] self-center">
          REQUIRED: {checkedRequired} / {totalRequired} COMPLETED
        </span>
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={onClose} 
            className="px-4 py-2.5 bg-white border border-[#eaeaec] text-[#414757] rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-[#d7d7d7]/30 transition-all font-sans"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleConfirmClick} 
            className="bg-[#212c46] text-white px-5 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider shadow-md hover:bg-[#657f4d] transition-all flex items-center gap-2"
          >
            <Icons.CheckSquare size={13} /> Confirm Clearance / ยืนยันกระบวณวินัยสมบูรณ์
          </button>
        </div>
      </div>
    </DraggableModal>
  );
}

// Case Lifecycle Timeline component to track case activities
interface CaseTimelineProps {
  progress: number;
  status: string;
  date: string;
  id: string;
}

export function CaseTimeline({ progress, status, date, id }: CaseTimelineProps) {
  // Translate current progress into chronological milestone times
  const steps = [
    {
      progressThreshold: 0,
      titleTh: 'การรายงานเหตุการณ์และการจัดบันทึกกรณี',
      titleEn: 'Incident Incident Discovered',
      dateOffset: 'Day 1',
      descTh: 'ผู้ดูแลหรือสายตรงของพื้นที่ รายงานข้อมูลเข้าสู่ศูนย์วินัย HR Relations พึ่งบันทึกความคืบหน้าระบบดิจิทัล',
      descEn: 'Formal complaint registered in the secure HR database. Case identity token issued.',
      statusTag: 'Logged'
    },
    {
      progressThreshold: 20,
      titleTh: 'เปิดพิจารณาไต่สวนและสืบลบเบื้องหลัก',
      titleEn: 'Evidence Acquisition & Fact-Finding Area',
      dateOffset: 'Day 3',
      descTh: 'บอร์ดผู้ตรวจสอบดึงและสลักรหัสสำรองรักษาภาพกล้อง และพยานล็อกในเซิร์ฟเวอร์ และสัมภาษณ์พยานบุคคลแวดล้อม',
      descEn: 'Database integrity check, network session audit, physical log backup safely catalogued.',
      statusTag: 'Fact-Finding'
    },
    {
      progressThreshold: 50,
      titleTh: 'การส่งมอบหนังสือและยื่นถ้อยความชี้แจง',
      titleEn: 'Accusation Notice Served & Response Due',
      dateOffset: 'Day 7',
      descTh: 'ออกจดหมายแจ้งข้อหาให้พนักงานเซ็นรับทราบ มอบสิทธิชี้แจงเหตุการณ์โต้แย้งเพื่อความยุติธรรม',
      descEn: 'Employee formally responds with details, witness declarations or external alibi.',
      statusTag: 'Accusations'
    },
    {
      progressThreshold: 75,
      titleTh: 'ประชุมสภาคณะกรรมการสืบสวนและสลักมติสากล',
      titleEn: 'Disciplinary Assembly & Committee Review',
      dateOffset: 'Day 14',
      descTh: 'คณะกรรมการพิจารณาคะแนน พยานหลักฐาน และตัดสินว่าพนักงานความผิดร้ายแรงตามพ.ร.บ. หรือวินัยสมควรระงับงานพักงาน',
      descEn: 'Joint review with legal experts, labor leaders and operational department heads.',
      statusTag: 'Audit Board'
    },
    {
      progressThreshold: 100,
      titleTh: 'ส่งมอบจดหมายคำสั่งประกาศวินัยและประธานลงนาม',
      titleEn: 'Final Adjudication & Punishment Issuance',
      dateOffset: 'Day 21',
      descTh: 'ออกหนังสือแจ้งตักเตือน, หนังสือเลิกจ้าง หรือปรับแต้มแต้ม KPI โบนัส จัดพิมพ์จดหมายกฎหมายครบกำหนดระยะสิทธิ์อุทธรณ์พนักงานบัดดล',
      descEn: 'Formal order dispatched. Records permanently locked from unauthorized modifications.',
      statusTag: 'Executed'
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#eaeaec] p-5 shadow-xs space-y-4">
      <div className="flex justify-between items-center border-b pb-2">
        <h4 className="text-[12px] font-black text-[#212c46] uppercase flex items-center gap-2">
          <Icons.GitCommit size={15} className="text-[#a94228]" /> CASE LIFECYCLE TIMELINE / ประวัติกิจกรรมและท่อนเวลา
        </h4>
        <span className="text-[10px] font-mono font-bold bg-gray-50 border border-gray-200 px-2 py-0.5 rounded text-gray-500 uppercase">
          {id}
        </span>
      </div>

      <div className="relative pl-6 border-l-2 border-slate-200 mt-4 space-y-6">
        {steps.map((st, idx) => {
          const isReached = progress >= st.progressThreshold;
          
          return (
            <div key={idx} className="relative group">
              {/* Timeline dot */}
              <div className={`absolute -left-[31px] top-1 w-[8px] h-[8px] rounded-full border-2 transition-all ${
                isReached 
                  ? 'bg-[#212c46] border-[#b7a159] scale-125 ring-4 ring-[#b7a159]/20' 
                  : 'bg-white border-slate-300 group-hover:border-[#212c46]'
              }`} />

              <div className="flex justify-between items-start gap-4 flex-wrap">
                <div>
                  <h5 className={`font-extrabold text-[11.5px] leading-tight ${isReached ? 'text-[#212c46]' : 'text-slate-400'}`}>
                    {st.titleTh} <span className="text-[10px] font-normal text-slate-500 font-sans">({st.titleEn})</span>
                  </h5>
                  <p className={`text-[10.5px] mt-1 pr-4 leading-relaxed ${isReached ? 'text-gray-600' : 'text-gray-400/80'}`}>
                    {st.descTh} <span className="block italic text-[10px] text-gray-400 mt-0.5">{st.descEn}</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded block text-center uppercase tracking-wider ${
                    isReached ? 'bg-[#b7a159]/15 text-[#b58c4f] border border-[#b7a159]/25' : 'bg-slate-50 text-slate-400 border border-slate-100'
                  }`}>
                    {st.dateOffset}
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold block mt-1">{st.statusTag}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
