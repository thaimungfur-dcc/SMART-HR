import React from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const UserGuidePanel = ({ isOpen, onClose, title, desc }: any) => {
    const location = useLocation();
    
    if (!isOpen || typeof document === 'undefined') return null;

    // Define content mapping based on route
    let guideConfig = {
      title: 'SYSTEM DIRECTIVE',
      subtitle: title || 'Module Operation Guidelines',
      sections: [
        {
          icon: 'ShieldAlert',
          iconColor: 'text-[#b7a159]',
          title: '1. กฎข้อบังคับและขอบเขต (Rules & Scope)',
          desc: desc || 'ระบบนี้จัดการข้อมูลที่เกี่ยวข้องกับการดำเนินการ ทำหน้าที่จัดเก็บ ประมวลผล และรักษาความมั่นคงปลอดภัยตามมาตรฐาน PDPA',
          points: [
            { label: 'Authorization', text: 'สำหรับการเข้าถึงเฉพาะผู้ที่ได้รับอนุมัติ' },
            { label: 'Data Integrity', text: 'ห้ามแก้ไขข้อมูลโดยปราศจากเอกสารอ้างอิง' },
          ]
        },
        {
          icon: 'ClipboardList',
          iconColor: 'text-[#d96245]',
          title: '2. กระบวนการทำงาน (Workflow)',
          desc: 'ปฏิบัติตามลำดับขั้นตอนการตรวจสอบและบันทึกข้อมูลอย่างเคร่งครัด เพื่อให้รายงานและเอกสารระบบสอดคล้องกัน',
          blocks: ['📌 Step 1: ตรวจสอบข้อมูล', '⚙️ Step 2: ดำเนินการ', '✅ Step 3: ยืนยันผล']
        },
        {
          icon: 'CheckSquare',
          iconColor: 'text-[#3f809e]',
          title: '3. รายงานและการนำไปใช้ (Reporting)',
          desc: 'สามารถสืบค้นและส่งออกข้อมูลเพื่อประโยชน์ทางสถิติและการบริหารจัดการองค์กร'
        }
      ]
    };

    // Replace with specific data based on path
    const path = location.pathname;
    
    if (path.includes('/employees') && !path.includes('/salary')) {
      guideConfig.title = 'DIRECTORY DIRECTIVE';
      guideConfig.subtitle = 'Workforce Profile Management';
      guideConfig.sections = [
        {
          icon: 'ShieldAlert',
          iconColor: 'text-[#b7a159]',
          title: '1. ระบบประวัติและการบังคับใช้ PDPA',
          desc: 'ข้อมูลพนักงานทุกคนถือเป็นข้อมูลจำกัดสิทธิ์ขั้นสูง (Highly Confidential) ระบบนี้ทำหน้าที่เก็บข้อมูลรายบุคคลประกอบไปด้วย 4 มิติสำคัญ:',
          points: [
            { label: 'Basic Info (ประวัติทั่วไป)', text: 'ชือไทย-อังกฤษ, บัตรประชาชน, อายุ, สัญชาติ' },
            { label: 'Work Detail (การทำงาน)', text: 'วันเริ่มงาน, ตำแหน่งงาน, สังกัดหน่วย และบัญชีเงินเดือน' },
            { label: 'Contact Route (การติดต่อ)', text: 'เบอร์โทรศัพท์, อีเมลทางการ และที่อยู่พำนัก' },
            { label: 'Health & Education (สุขภาพ/การศึกษา)', text: 'ประวัติการศึกษา, ทหาร, โรคประจำตัว และญาติฉุกเฉิน' },
          ]
        },
        {
          icon: 'ClipboardList',
          iconColor: 'text-[#d96245]',
          title: '2. ระบบ Multi-step Wizard',
          desc: 'การจัดเก็บและปรับปรุงข้อมูลพนักงาน ให้ใช้กระบวนการ 4 ขั้นตอนลดความผิดพลาด:',
          blocks: ['👥 Step 1: ประวัติเบื้องต้น', '💼 Step 2: ตำแหน่งและงาน', '📍 Step 3: ที่อยู่ติดต่อ', '🎓 Step 4: วุฒิและอื่นๆ']
        },
        {
          icon: 'CheckSquare',
          iconColor: 'text-[#3f809e]',
          title: '3. สถิติพนักงานและการส่งออก',
          desc: 'สามารถใช้ข้อมูลเพื่อติดตาม Headcount และนำส่งสถิติรวมให้ฝ่ายบริหารได้ทันที'
        }
      ];
    } else if (path.includes('/payroll') || path.includes('/salary')) {
      guideConfig.title = 'PAYROLL DIRECTIVE';
      guideConfig.subtitle = 'Compensation & Benefit Management';
      guideConfig.sections = [
        {
          icon: 'CreditCard',
          iconColor: 'text-[#b7a159]',
          title: '1. ความลับทางค่าจ้าง (Compensation Privacy)',
          desc: 'ข้อมูลบัญชีเงินเดือนและโครงสร้างรายได้ เป็นข้อมูลลับสุดยอด (Top Secret) ประกอบไปด้วย:',
          points: [
            { label: 'Base Salary', text: 'ฐานเงินเดือนตามโครงสร้างตำแหน่ง' },
            { label: 'Allowances & OT', text: 'ค่าสวัสดิการ, ค่าเดินทาง, ค่าตำแหน่ง, ล่วงเวลา' },
            { label: 'Deductions', text: 'ภาษี (PND.1), ประกันสังคม (SSO), กองทุนสำรองเลี้ยงชีพ' },
            { label: 'Net Pay', text: 'ยอดสุทธิที่นำจ่ายผ่านธนาคาร' },
          ]
        },
        {
          icon: 'ClipboardList',
          iconColor: 'text-[#d96245]',
          title: '2. รอบวงจรบัญชี (Payroll Cycle)',
          desc: 'กระบวนการจัดทำค่าจ้างประจำเดือนมีขั้นตอนสำคัญดังนี้:',
          blocks: ['⏱️ 1: ปิดรอบลงเวลา', '🧮 2: คำนวณรายได้/หัก', '🏦 3: ส่งไฟล์ธนาคาร', '📄 4: ออก Payslip']
        },
        {
          icon: 'ShieldCheck',
          iconColor: 'text-[#3f809e]',
          title: '3. การตรวจสอบความถูกต้อง',
          desc: 'ระบบมีกลไกตรวจสอบความผิดปกติ (Anomaly Detection) เพื่อป้องกันการจ่ายเงินซ้ำซ้อน และบันทึกประวัติการเปลี่ยนแปลงทุกรายการ'
        }
      ];
    } else if (path.includes('/attendance') || path.includes('/time') || path.includes('/overtime')) {
      guideConfig.title = 'TIME & ATTENDANCE DIRECTIVE';
      guideConfig.subtitle = 'Machine Data Logs & Shift Integrity';
      guideConfig.sections = [
        {
          icon: 'Database',
          iconColor: 'text-[#b7a159]',
          title: '1. การเชื่อมข้อมูลจากเครื่องสแกนนิ้วมือ (Scanner Import)',
          desc: 'ระบบถูกจำกัดให้ดึงข้อมูลการลงเวลาทำงานผ่านรูปแบบไฟล์ดิบจากตัวเครื่องสแกนเท่านั้น เพื่อลดการแอบอ้าง:',
          points: [
            { label: 'CSV Import Only', text: 'นำเข้าข้อมูลโดยใช้ไฟล์ .csv ที่ส่งออกจากโปรแกรมเครื่องสแกนนิ้ว/สแกนใบหน้า' },
            { label: 'Auto-Matching', text: 'ระบบจะนำตารางเวลา (AC-No) ไปจับคู่กับรหัสพนักงานในฐานข้อมูล (Staff Index)' },
            { label: 'No Manual Clock-In', text: 'ปิดระบบการลงเวลาบนหน้าเว็บไซต์หรือมือถือ' },
          ]
        },
        {
          icon: 'Clock',
          iconColor: 'text-[#d96245]',
          title: '2. ข้อบังคับเวลาทำงานมาตรฐาน (Standard Time Rules)',
          desc: 'บริษัทใช้นโยบายกะการทำงานเวลาเดียวกัน สำหรับพนักงานทุกระดับ/ทุกแผนก:',
          points: [
            { label: 'Single Shift', text: 'เวลาเข้าทำงาน: 08:00 น. และ เวลาเลิกงาน: 17:00 น.' },
            { label: 'Lateness', text: 'ระบบจะคำนวณสายและลงบันทึก เมื่อเวลามากกว่า 08:00 น.' },
            { label: 'Absence', text: 'ขาดงานโดยไม่มีหลักฐานการสแกน และไม่มีใบลาที่ผ่านการอนุมัติ' },
          ]
        },
        {
          icon: 'ClipboardList',
          iconColor: 'text-[#3f809e]',
          title: '3. ขั้นตอนนำเข้าข้อมูล (Daily Workflow)',
          desc: 'พนักงาน HR ควรรวมข้อมูลสัปดาห์ละครั้งหรือรายวันผ่านกระบวนการดังนี้:',
          blocks: ['📁 1: อัปโหลด CSV', '🔄 2: จับคู่รหัส', '⚙️ 3: ประมวลผล', '✅ 4: เผยแพร่ (Publish)']
        }
      ];
    } else if (path.includes('/leave')) {
      guideConfig.title = 'LEAVE DIRECTIVE';
      guideConfig.subtitle = 'Absence & Leave Management';
      guideConfig.sections = [
        {
          icon: 'CalendarMinus',
          iconColor: 'text-[#b7a159]',
          title: '1. นโยบายการลา (Leave Policies)',
          desc: 'ควบคุมสิทธิ์การลางานและโควต้าของพนักงานแต่ละระดับ สอดคล้องกับกฎหมายแรงงาน:',
          points: [
            { label: 'Annual Leave', text: 'ลาพักร้อน ตามอายุงาน' },
            { label: 'Sick Leave', text: 'ลาป่วย (ต้องแสดงใบรับรองแพทย์เมื่อเกิน 3 วัน)' },
            { label: 'Personal Leave', text: 'ลากิจ โดยต้องอนุมัติล่วงหน้า' },
            { label: 'Maternity/Other', text: 'ลาคลอดบุตร, อุปสมบท, และอื่น ๆ' },
          ]
        },
        {
          icon: 'Users',
          iconColor: 'text-[#d96245]',
          title: '2. สายการพิจารณา (Approval Workflow)',
          desc: 'กฎเกณฑ์การอนุมัติตามสายบังคับบัญชา (Hierarchy):',
          blocks: ['👤 1: พนักงานยื่นคำร้อง', '👨‍💼 2: หัวหน้างานอนุมัติ', '🏢 3: HR รับทราบ/อัปเดตระบบ']
        },
        {
          icon: 'HelpCircle',
          iconColor: 'text-[#3f809e]',
          title: '3. วันหยุดประเพณี (Public Holidays)',
          desc: 'อ้างอิงตามปฏิทินวันหยุดบริษัทที่ประกาศไว้ประจำปี ระบบจะคำนวณหักลบอัตโนมัติเมื่อขอลาคร่อมวันหยุด'
        }
      ];
    } else if (path.includes('/recruitment') || path.includes('/interview') || path.includes('/job')) {
      guideConfig.title = 'RECRUITMENT DIRECTIVE';
      guideConfig.subtitle = 'Talent Acquisition & Pipeline';
      guideConfig.sections = [
        {
          icon: 'Search',
          iconColor: 'text-[#b7a159]',
          title: '1. นโยบายการสรรหา (Hiring Policy)',
          desc: 'จัดการอัตรากำลังพลและข้อมูลตัวบ่งชี้คุณสมบัติ (Job Description)',
          points: [
            { label: 'Manpower Request', text: 'ใบขออนุมัติอัตรากำลังพลจากแผนกต่างๆ' },
            { label: 'Job Posting', text: 'ประกาศรับสมัครและช่องทางการสื่อสาร' },
            { label: 'Resume Screening', text: 'คัดกรองใบสมัครตามคุณสมบัติขั้นต้น' },
            { label: 'Shortlisting', text: 'ดึงรายชื่อผู้สมัครที่ผ่านเกณฑ์เข้าสู่ Pipeline' },
          ]
        },
        {
          icon: 'Users',
          iconColor: 'text-[#d96245]',
          title: '2. กระบวนการสัมภาษณ์ (Interview Pipeline)',
          desc: 'ระบบติดตามผู้สมัครตั้งแต่เริ่มจนจบกระบวนการ:',
          blocks: ['📅 1: นัดหมายผู้สมัคร', '💬 2: สัมภาษณ์/ทดสอบ', '⭐ 3: ลงคะแนนและประเมิน', '🤝 4: ยื่นข้อเสนอ']
        },
        {
          icon: 'Database',
          iconColor: 'text-[#3f809e]',
          title: '3. ทะเบียนผู้สมัคร (Candidate Database)',
          desc: 'เก็บรวบรวมเรซูเม่และประวัติตาม PDPA เพื่อรองรับ Talent Pool สำหรับการจ้างงานในอนาคต'
        }
      ];
    } else if (path.includes('/talent') || path.includes('/orientation') || path.includes('/training')) {
      guideConfig.title = 'TALENT DEV DIRECTIVE';
      guideConfig.subtitle = 'Training & Skill Development';
      guideConfig.sections = [
        {
          icon: 'GraduationCap',
          iconColor: 'text-[#b7a159]',
          title: '1. มาตรฐานการพัฒนา (Development Standards)',
          desc: 'ติดตามและวางแผนโครงสร้างความก้าวหน้าทางอาชีพ (Career Path) อย่างเป็นระบบ',
          points: [
            { label: 'Skill Matrix', text: 'ประเมินทักษะที่จำเป็นต่อสายงานแต่ละระดับ' },
            { label: 'OJT', text: 'การฝึกสอนงานระหว่างปฏิบัติหน้าที่' },
            { label: 'Succession Plan', text: 'เตรียมพร้อมสืบทอดตำแหน่งหลักในกรณีฉุกเฉิน' },
            { label: 'Orientation', text: 'การปฐมนิเทศพนักงานใหม่' },
          ]
        },
        {
          icon: 'Award',
          iconColor: 'text-[#d96245]',
          title: '2. เส้นทางการอบรม (Training Pipeline)',
          desc: 'รูปแบบการจัดการองค์ความรู้และทักษะบุคคล:',
          blocks: ['📚 1: วิเคราะห์จุดอ่อน', '🎯 2: ดำเนินการอบรม', '🏆 3: สอบวัดระดับทักษะ', '📊 4: ประเมินผล']
        },
        {
          icon: 'ShieldCheck',
          iconColor: 'text-[#3f809e]',
          title: '3. ทะเบียนความสามารถ (Certification Log)',
          desc: 'เก็บรวบรวมบันทึกใบประกาศ รับรองผู้ตรวจสอบ ใบประกอบวิชาชีพ ซึ่งมีความสำคัญทางกฎหมายหรือมาตรฐาน ISO'
        }
      ];
    } else if (path.includes('/disciplinary') || path.includes('/labor') || path.includes('/appraisals')) {
      guideConfig.title = 'COMPLIANCE & LABOR DIRECTIVE';
      guideConfig.subtitle = 'Disciplinary & Employee Relations';
      guideConfig.sections = [
        {
          icon: 'Scale',
          iconColor: 'text-[#b7a159]',
          title: '1. กฎหมายและข้อบังคับ (Labor Laws)',
          desc: 'ระบบคลังข้อมูลกฎหมายแรงงานและข้อบังคับบริษัท เพื่อให้การพิจารณาโทษเป็นไปตามมาตรฐาน',
          points: [
            { label: 'Labor Law', text: 'พ.ร.บ. คุ้มครองแรงงาน' },
            { label: 'Company Rules', text: 'ข้อบังคับเกี่ยวกับการทำงาน' },
            { label: 'Due Process', text: 'ขั้นตอนการสอบสวนอย่างเป็นธรรม' },
          ]
        },
        {
          icon: 'AlertTriangle',
          iconColor: 'text-[#d96245]',
          title: '2. กระบวนการทางวินัย (Disciplinary Action)',
          desc: 'ขั้นตอนสืบสวนและออกหนังสือหนังสือตักเตือน:',
          blocks: ['📋 1: รับเรื่องร้องเรียน', '🔎 2: สืบสวนข้อเท็จจริง', '⚖️ 3: พิจารณาโทษ', '📝 4: ออกหนังสือเตือน']
        },
        {
          icon: 'HeartPulse',
          iconColor: 'text-[#3f809e]',
          title: '3. แรงงานสัมพันธ์ (Labor Relations)',
          desc: 'กิจกรรมสหภาพ, ข้อเรียกร้อง, สวัสดิการพนักงาน, และการบริหารความผูกพัน (Employee Engagement)'
        }
      ];
    }

    return createPortal(
        <>
            <div className={`fixed inset-0 z-[190] bg-[#212c46]/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={onClose}/>
            <div className={`fixed inset-y-0 right-0 z-[200] w-full md:w-[500px] bg-white shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col border-l-2 border-[#b7a159] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex justify-between items-center p-5 px-6 border-b-2 border-[#b7a159] bg-[#212c46] text-white shrink-0">
                    <div className="flex-1">
                        <div className="flex justify-between items-center w-full pr-4">
                            <h3 className="font-black flex items-center gap-3 uppercase tracking-widest text-lg">
                                <Icons.BookOpen size={22} className="text-[#b7a159]"/> {guideConfig.title}
                            </h3>
                        </div>
                        <div className="flex items-center justify-between w-full mt-1.5 pr-4">
                            <p className="text-[12px] font-bold text-[#d7d7d7] uppercase tracking-widest">{guideConfig.subtitle}</p>
                            <span className="text-[9px] font-mono font-medium text-white/40 tracking-wider">v1.2.0 &bull; Last Updated: 18 Jun 2026</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-white/50 hover:text-[#932c2e] hover:bg-white/10 rounded-xl transition-colors"><Icons.X size={24}/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 space-y-8 text-[#414757] text-[12px] leading-relaxed custom-scrollbar bg-white">
                    {guideConfig.sections.map((sec, idx) => {
                        const IconComp = (Icons as any)[sec.icon] || Icons.HelpCircle;
                        return (
                            <section key={idx} className="animate-fadeIn" style={{ animationDelay: `${idx * 0.1}s` }}>
                                <h4 className="text-[14px] font-black text-[#212c46] mb-3 uppercase flex items-center gap-2 border-b-2 border-[#d7d7d7] pb-2 font-mono">
                                    <IconComp size={18} className={sec.iconColor}/> {sec.title}
                                </h4>
                                <p className="text-[12px] mb-3">{sec.desc}</p>
                                
                                {sec.points && (
                                    <ul className="list-disc pl-5 space-y-2 text-[12px]">
                                        {sec.points.map((pt, pIdx) => (
                                            <li key={pIdx}>
                                                <strong className={['text-[#4d87a8]', 'text-[#b58c4f]', 'text-[#657f4d]', 'text-[#932c2e]'][pIdx % 4]}>{pt.label}:</strong> {pt.text}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                
                                {sec.blocks && (
                                    <div className="grid grid-cols-2 gap-2 text-[11px] mt-2 font-semibold">
                                        {sec.blocks.map((blk, bIdx) => (
                                            <div key={bIdx} className="p-3 bg-slate-50 border border-[#eaeaec] rounded-xl text-[#212c46]">{blk}</div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )
                    })}
                </div>
                
                <div className="p-4 bg-[#f8f9fa] border-t border-[#eaeaec] flex justify-end shrink-0">
                    <button onClick={onClose} className="px-8 py-2.5 bg-[#212c46] text-white font-black rounded-xl uppercase text-[12px] hover:bg-[#414757] hover:text-white transition-all shadow-md tracking-[0.1em] cursor-pointer">
                        รับทราบระเบียบ (Acknowledge)
                    </button>
                </div>
            </div>
        </>, document.body
    );
};
