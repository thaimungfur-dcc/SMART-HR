import React from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';

export interface PunishmentHistoryEvent {
  id: string;
  date: string;
  category: string;
  severity: 'Verbal' | 'Written' | 'Final' | 'Suspension' | 'Dismissal';
  description: string;
  enforcedBy: string;
  referenceDoc?: string;
  thaiLawClause?: string;
}

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
}

// Mock punishment database for employees
export const MOCK_PUNISHMENT_RECORDS: Record<string, PunishmentHistoryEvent[]> = {
  'EMP-20412': [
    {
      id: 'PUN-2025-014',
      date: '2025-11-04',
      category: 'Information Security',
      severity: 'Verbal',
      description: 'ลืมล็อกเอาต์ระบบฐานข้อมูล (Database Management Console) บนเครื่องคอมพิวเตอร์พกพาส่วนตัว ทิ้งไว้ในห้องอาหารส่วนกลางนอกช่วงเวลาทำงาน',
      enforcedBy: 'คุณนพดล (IT Director)',
      referenceDoc: 'MEMO-2025-112',
      thaiLawClause: 'ระเบียบข้อบังคับเกี่ยวกับการทำงาน หมวดที่ 5 (การรักษาความลับทางข้อมูลและทรัพย์สิน)'
    }
  ],
  'EMP-20150': [
    {
      id: 'PUN-2026-002',
      date: '2026-02-12',
      category: 'Safety Regulation',
      severity: 'Verbal',
      description: 'ไม่ตระหนักการสวมใส่อุปกรณ์ป้องภัยส่วนบุคคล (Safety Helmet) ขณะคุมงานซ่อมบำรุงในจุดตัดต่อเครื่องจักรสายพานแปรรูปความร้อน',
      enforcedBy: 'คุณพงษ์ศักดิ์ (Safety Manager)',
      referenceDoc: 'WRN-2026-004',
      thaiLawClause: 'ระเบียบด้านความปลอดภัยและอาชีวอนามัยของบริษัท ข้อ 14 (หน้าที่พนักงานในการสวมใส่ PPE)'
    },
    {
      id: 'PUN-2026-019',
      date: '2026-04-18',
      category: 'Safety Regulation',
      severity: 'Written',
      description: 'ปฏิบัติงานใกล้ชุดควบคุมความดันสูงโดยละเลยหน้ากากและแว่นตานิรภัย ซึ่งเป็นครั้งที่สองหลังจากเคยตักเตือนเป็นวาจาแล้ว',
      enforcedBy: 'คุณพงษ์ศักดิ์ (Safety Manager)',
      referenceDoc: 'WRN-2026-020',
      thaiLawClause: 'พ.ร.บ. คุ้มครองแรงงาน พ.ศ. 2541 มาตรา 119 (4) ฝ่าฝืนข้อบังคับเกี่ยวกับการทำงานกรณีเตือนเป็นลายลักษณ์อักษรแล้ว'
    }
  ],
  'EMP-20311': [
    {
      id: 'PUN-2025-081',
      date: '2025-08-10',
      category: 'Misconduct',
      severity: 'Verbal',
      description: 'ใช้วาจาเสียงดังและแสดงกิริยาก้าวร้าวกับพนักงานขนส่งสับปะรดภายนอก ประเด็นปัญหาพื้นที่จอดจดทะเบียนรถบรรทุก ณ ลานเทฝั่งเหนือ',
      enforcedBy: 'คุณภัทรา (HR Relations Manager)',
      referenceDoc: 'MEMO-2025-095',
      thaiLawClause: 'ระเบียบว่าด้วยความสามัคคีและมารยาทในการร่วมงานกับพันธมิตรทางธุรกิจ'
    }
  ]
};

export function HistorySidebar({ isOpen, onClose, employeeId, employeeName }: HistorySidebarProps) {
  if (typeof document === 'undefined') return null;

  // Cleanup employee ID for exact match
  const cleanEmpId = employeeId ? String(employeeId).trim() : '';
  const historyList = MOCK_PUNISHMENT_RECORDS[cleanEmpId] || [];

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'Dismissal':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Suspension':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Final':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Written':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Verbal':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return createPortal(
    <>
      <div 
        className={`fixed inset-0 z-[190] bg-[#212c46]/60 backdrop-blur-sm transition-opacity duration-500 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`} 
        onClick={onClose} 
      />
      <div 
        className={`fixed inset-y-0 right-0 z-[200] w-full md:w-[500px] bg-white shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col border-l-2 border-[#b58c4f] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-5 px-6 border-b-2 border-[#b58c4f] bg-[#212c46] text-white shrink-0">
          <div>
            <h3 className="font-black flex items-center gap-3 uppercase tracking-widest text-[14px]">
              <Icons.History size={18} className="text-[#b7a159]" /> PUNISHMENT HISTORY
            </h3>
            <p className="text-[11px] font-bold text-[#d7d7d7] uppercase tracking-wider mt-1">
              ประวัติการพิจารณาได้รับโทษทางวินัยพนักงาน
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-white/50 hover:text-[#932c2e] hover:bg-white/10 rounded-xl transition-colors"
          >
            <Icons.X size={20} />
          </button>
        </div>

        <div className="bg-[#f8f9fa] border-b border-[#eaeaec] p-4 px-6 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#212c46] text-[#b7a159] flex items-center justify-center font-bold text-[14px]">
              {employeeName ? employeeName.charAt(0) : 'E'}
            </div>
            <div>
              <div className="font-extrabold text-[#212c46] text-[13px]">{employeeName || 'ยังไม่ระบุชื่อ'}</div>
              <div className="text-[11px] font-mono font-bold text-[#a94228] mt-0.5">{cleanEmpId || 'ไม่พบรหัสพนักงาน'}</div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-[#414757] text-[12px] leading-relaxed custom-scrollbar bg-white">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-[11px] font-black uppercase text-gray-400 tracking-wider">
              Recorded Incidents ({historyList.length})
            </span>
            <span className="text-[10px] font-bold text-[#657f4d] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active Employee Record
            </span>
          </div>

          {historyList.length === 0 ? (
            <div className="text-center py-12 text-[#7a8b95] font-bold uppercase tracking-wider space-y-2">
              <Icons.ShieldCheck className="mx-auto w-10 h-10 text-[#657f4d] opacity-80" />
              <p className="text-[12px] text-[#212c46]">No Previous Disciplinary Incidents</p>
              <p className="text-[11px] text-[#7a8b95] normal-case font-normal">
                พนักงานคนนี้ไม่มีประวัติกระทำผิดวินัย หรือได้รับโทษในระบบมาก่อน
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {historyList.map((rec) => (
                <div 
                  key={rec.id} 
                  className="p-4 rounded-xl border border-[#eaeaec] bg-[#f8f9fa] shadow-2xs hover:border-[#b7a159] transition-all flex flex-col gap-3"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${getSeverityStyle(rec.severity)}`}>
                        {rec.severity}
                      </span>
                      <span className="text-[11px] font-mono text-gray-400 font-bold">{rec.id}</span>
                    </div>
                    <span className="text-[11px] font-mono text-gray-500 font-bold flex items-center gap-1">
                      <Icons.Calendar size={11} /> {rec.date}
                    </span>
                  </div>

                  <p className="font-semibold text-[#212c46] text-[11.5px] leading-relaxed">
                    {rec.description}
                  </p>

                  <div className="border-t border-[#eaeaec]/60 pt-2 flex flex-col gap-1.5 text-[11px]">
                    <div className="flex items-start gap-1.5">
                      <Icons.Briefcase size={12} className="text-[#b58c4f] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-gray-500">Authorized Investigator: </strong>
                        <span className="text-gray-800 font-bold">{rec.enforcedBy}</span>
                      </div>
                    </div>

                    {rec.thaiLawClause && (
                      <div className="flex items-start gap-1.5">
                        <Icons.Scale size={12} className="text-[#a94228] shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-gray-500">Legal Clause / ข้อบังคับอ้างอิง: </strong>
                          <span className="text-[#a94228] font-bold">{rec.thaiLawClause}</span>
                        </div>
                      </div>
                    )}

                    {rec.referenceDoc && (
                      <div className="flex items-center gap-1.5 mt-1 bg-white p-1.5 px-2.5 rounded-lg border border-slate-100 w-fit">
                        <Icons.FileText size={11} className="text-blue-500" />
                        <span className="text-blue-600 font-bold font-mono text-[10px]">{rec.referenceDoc}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-[#b58c4f]/5 border border-[#b58c4f]/25 rounded-xl p-4 mt-6">
            <h4 className="text-[11.5px] font-black text-[#212c46] uppercase flex items-center gap-1.5 mb-2">
              <Icons.Info size={14} className="text-[#b58c4f]" /> Legal Precedent Guideline
            </h4>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              ตามหลักกฎหมายคุ้มครองแรงงานไทยฉบับทั่วไป หากเคยตักเตือนเป็นลายลักษณ์อักษรแล้วในเรื่องที่คล้ายกัน หนังสือเตือนครั้งนั้นมีอายุผลบังคับไม่เกิน <b>1 ปี</b> นับแต่วันที่พนักงานกระทำความผิด ครั้งที่ 3 สามารถเลิกจ้างได้พิจารณาตามความเหมาะสมโดยไม่ต้องจ่ายเงินค่าชดเชยตามมาตรา 119(4)
            </p>
          </div>
        </div>

        <div className="p-4 bg-[#f8f9fa] border-t border-[#eaeaec] flex justify-end shrink-0">
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-[#212c46] text-white font-black rounded-xl uppercase text-[11px] hover:bg-[#414757] transition-all shadow-md tracking-wider cursor-pointer"
          >
            Close History / ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </>, document.body
  );
}
