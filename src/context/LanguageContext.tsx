import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'EN' | 'TH';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  formatLangText: (text: string) => string;
}

const DICTIONARY: Record<string, { EN: string; TH: string }> = {
  // Navigation / Headers
  'SMART HUMAN CAPITAL': { EN: 'SMART HUMAN CAPITAL', TH: 'การจัดการทุนมนุษย์อัจฉริยะ' },
  'MANAGEMENT': { EN: 'MANAGEMENT', TH: 'ระบบบริหารงานบุคคล' },
  'INTEGRATED TALENT AND RESOURCE MANAGEMENT': { 
    EN: 'INTEGRATED TALENT AND RESOURCE MANAGEMENT', 
    TH: 'ระบบคำนวณและบริหารจัดการบุคลากรแบบรวมศูนย์' 
  },
  'HR ENGINE': { EN: 'HR ENGINE', TH: 'ระบบหลัก' },
  'Print': { EN: 'Print', TH: 'พิมพ์' },
  'Approvals': { EN: 'Approvals', TH: 'รอนุมัติ' },
  'USER GUIDE': { EN: 'USER GUIDE', TH: 'คู่มือใช้งาน' },
  'HOME': { EN: 'HOME', TH: 'หน้าแรก' },

  // Menu items
  'DASHBOARD': { EN: 'DASHBOARD', TH: 'กระดานข้อมูลหลัก' },
  'WARNING LETTERS': { EN: 'WARNING LETTER BUILDER', TH: 'ออกหนังสือเตือน' },
  'INVESTIGATION': { EN: 'INVESTIGATION', TH: 'สอบสวน' },
  'PUNISHMENT ACTIONS': { EN: 'PUNISHMENT ACTIONS', TH: 'ลงโทษ' },
  'EMPLOYEE DIRECTORY': { EN: 'EMPLOYEE DIRECTORY', TH: 'ทำเนียบพนักงาน' },
  'SALARY MASTER': { EN: 'SALARY MASTER', TH: 'สารบบฐานเงินเดือน' },
  'MY PAYSLIPS (STAFF)': { EN: 'MY PAYSLIPS (STAFF)', TH: 'ใบจ่ายเงินเดือนของฉัน (Staff)' },
  'EXPENSES': { EN: 'EXPENSES', TH: 'การเบิกค่าใช้จ่าย' },
  'TIME & ATTENDANCE': { EN: 'TIME & ATTENDANCE', TH: 'ประวัติลงเวลาทำงาน' },
  'SHIFT SCHEDULES': { EN: 'SHIFT SCHEDULES', TH: 'จัดตารางกะปฏิบัติงาน' },
  'OVERTIME': { EN: 'OVERTIME', TH: 'คำนวณล่วงเวลา (OT)' },
  'LEAVE MANAGEMENT': { EN: 'LEAVE MANAGEMENT', TH: 'จัดการการลา' },

  // Overtime Module
  'OVERTIME MANAGEMENT NODE': { EN: 'OVERTIME MANAGEMENT NODE', TH: 'ระบบบริหารการทำงานล่วงเวลา (OT)' },
  'PLANNED FORECASTING & ACTUAL PAYROLL SYNC': { 
    EN: 'PLANNED FORECASTING & ACTUAL PAYROLL SYNC', 
    TH: 'คาดการณ์ชั่วโมงล่วงเวลา & เชื่อมโยงบัญชีเงินเดือนอัตโนมัติ' 
  },
  'Pending Approval': { EN: 'Pending Approval', TH: 'รายการรอนุมัติ' },
  'Planned Cum. Hrs': { EN: 'Planned Cum. Hrs', TH: 'ชั่วโมงล่วงเวลาแผนรวม' },
  'Actual Clocked Hrs': { EN: 'Actual Clocked Hrs', TH: 'ชั่วโมงที่สแกนจริงสะสม' },
  'Cost Variance Difference': { EN: 'Cost Variance Difference', TH: 'ความต่างค่าล่วงเวลาสะสม' },
  'OT Registry': { EN: 'OT Registry', TH: 'สารบบบันทึกโอที' },
  'Variance Analytics': { EN: 'Variance Analytics', TH: 'การวิเคราะห์ความแตกต่าง' },
  'Settings Policy': { EN: 'Settings Policy', TH: 'กฎเกณฑ์นโยบายโอที' },
  'Search ID, Name or Purpose...': { EN: 'Search ID, Name or Purpose...', TH: 'ค้นหาด้วยรหัส, ชื่อ หรือจุดประสงค์...' },
  'Bulk Upload': { EN: 'Bulk Upload', TH: 'นำเข้าข้อมูลจำนวนมาก' },
  'Export CSV': { EN: 'Export CSV', TH: 'ส่งออก CSV' },
  'Print PDF': { EN: 'Print PDF', TH: 'พิมพ์รายงาน PDF' },
  'New Request': { EN: 'New Request', TH: 'คำขอตัวเลือกใหม่' },
  'Req ID': { EN: 'Req ID', TH: 'รหัสคำขอ' },
  'Employee Identity': { EN: 'Employee Identity', TH: 'พนักงาน • รหัสพนักงาน' },
  'Date': { EN: 'Date', TH: 'วันที่บันทึก' },
  'Planned Hrs': { EN: 'Planned Hrs', TH: 'ชั่วโมงตามแผน' },
  'Actual Hrs': { EN: 'Actual Hrs', TH: 'ชั่วโมงจริง' },
  'OT Purpose Purpose': { EN: 'OT Purpose Purpose', TH: 'จุดประสงค์การทำล่วงเวลา' },
  'Status Check': { EN: 'Status Check', TH: 'สถานะตรวจสอบ' },
  'Registry Action': { EN: 'Registry Action', TH: 'จัดการตาราง' },

  // Chart Labels & Statuses
  'DEPARTMENT COMMITTED OT VOLUME': { EN: 'DEPARTMENT COMMITTED OT VOLUME', TH: 'ปริมาณโอทีรวบรวมแยกตามแผนก' },
  'Planned hours versus Actual registered clocked hours by area': {
    EN: 'Planned hours versus Actual registered clocked hours by area',
    TH: 'เปรียบเทียบชั่วโมงทำแผนโอทีกับชั่วโมงที่สแกนเข้ามาทำงานจริงของแต่ละแผนก'
  },
  'OT FINANCIAL METRICS': { EN: 'OT FINANCIAL METRICS', TH: 'สรุปงบประมาณการทำงานล่วงเวลา' },
  'AREA VARIANCE SPECIFICATIONS': { EN: 'AREA VARIANCE SPECIFICATIONS', TH: 'ตารางวิเคราะห์ความแปรปรวนรายแผนก' },
  'SYSTEM OT VARIABLES': { EN: 'SYSTEM OT VARIABLES', TH: 'ตัวแปรระบบสำหรับการคำนวณค่าล่วงเวลา' },
  'REGISTRY CONFIGURATION RULES': { EN: 'REGISTRY CONFIGURATION RULES', TH: 'ขีดจำกัดงบประมาณและการจัดสรร' },

  // Employee directory statuses
  'Active': { EN: 'Active', TH: 'กำลังทำงาน' },
  'Resigned': { EN: 'Resigned', TH: 'ลาออก' },
  'Suspended': { EN: 'Suspended', TH: 'พักงาน' },
  'Permanent': { EN: 'Permanent', TH: 'พนักงานประจำ' },
  'Probation': { EN: 'Probation', TH: 'ทดลองงาน' },
  'Contract': { EN: 'Contract', TH: 'สัญญาจ้าง' },
  'Intern': { EN: 'Intern', TH: 'ฝึกงาน/อินเทิร์น' },
  'All Status': { EN: 'All Status', TH: 'สถานะการทำงานทั้งหมด' },
  'All Contract Types': { EN: 'All Contract Types', TH: 'รูปแบบการจ้างทั้งหมด' },
  'All Depts': { EN: 'All Depts', TH: 'แผนกทั้งหมด' },
  'All Offices': { EN: 'All Offices', TH: 'สาขาทั้งหมด' },
  'Search by name, ID or title...': { EN: 'Search by name, ID or title...', TH: 'ค้นหาด้วยชื่อ, รหัสพนักงาน หรือตำแหน่ง...' },
  'Add Employee': { EN: 'Add Employee', TH: 'เพิ่มพนักงานใหม่' },
  'Overall Headcount': { EN: 'Overall Headcount', TH: 'จำนวนพนักงานทั้งหมด' },
  'Active Personnel': { EN: 'Active Personnel', TH: 'พนักงานปฎิบัติงานปัจจุบัน' },
  'Offboarding/Draft': { EN: 'Offboarding/Draft', TH: 'พนักงานลาออก/รอดำเนินการ' },
  'Departments': { EN: 'Departments', TH: 'แผนก/กองสังกัด' },
  'Rostered Profiles': { EN: 'Rostered Profiles', TH: 'โปรไฟล์ในระบบ' },
  'On Duty': { EN: 'On Duty', TH: 'กำลังปฏิบัติหน้าที่' },
  'Off / Resigned': { EN: 'Off / Resigned', TH: 'ยุติบทบาทการลาออก' },
  'Active Branches': { EN: 'Active Branches', TH: 'สาขาหน่วยที่เปิดใช้' },
  'Portrait': { EN: 'Portrait', TH: 'รูปโปรไฟล์' },
  'Staff Node Identity': { EN: 'Staff Node Identity', TH: 'รหัสและชื่อพนักงาน' },
  'Department & Office': { EN: 'Department & Office', TH: 'แผนกสังกัด & สาขา' },
  'Job Position': { EN: 'Job Position', TH: 'ตำแหน่งงาน/รูปแบบจ้าง' },
  'Contact & Mobile': { EN: 'Contact & Mobile', TH: 'เบอร์ติดต่อ & อีเมล์' },
  'Status': { EN: 'Status', TH: 'สถานะปฏิบัติงาน' },
  'Action': { EN: 'Action', TH: 'จัดการ' },
  'No Nickname': { EN: 'No Nickname', TH: 'ไม่มีชื่อเล่น' },
  'No documented email': { EN: 'No documented email', TH: 'ไม่มีข้อมูลอีเมล์' },
  'Export Profiles': { EN: 'Export Profiles', TH: 'ส่งออกข้อมูลประวัติ' },

  // Customizable Widgets translations
  'Personal Dashboard Hub': { EN: 'Personal Dashboard Hub', TH: 'ศูนย์รวมวิดเจ็ตสถิติบุคลากร' },
  'Customize Widgets': { EN: 'Customize Widgets', TH: 'ปรับแต่งวิดเจ็ตหน้าหลัก' },
  'Reset Default Layout': { EN: 'Reset Default Layout', TH: 'รีเซ็ตลำดับการแสดงผลเริ่มต้น' },
  'Pending Leave Requests': { EN: 'Pending Leave Requests', TH: 'ใบลาของพนักงานรอนุมัติเสร็จสิ้น' },
  "Today's Attendance": { EN: "Today's Attendance", TH: 'บันทึกเวลาเข้า-ออกงานวันนี้' },
  'Upcoming Birthdays': { EN: 'Upcoming Birthdays', TH: 'วันเกิดและครบรอบงานของสตาฟฟ์' },
  'No pending leave requests': { EN: 'No pending leave requests', TH: 'ไม่มีใบคำขอรอดำเนินการ' },
  'Custom Late Threshold': { EN: 'Custom Late Threshold', TH: 'เกณฑ์เวลานับว่าสแกนสาย' },
  'Date Source': { EN: 'Date Source', TH: 'แหล่งอ้างอิงวันที่' },
  'Today': { EN: 'Today', TH: 'วันปัจจุบัน' },
  'Latest Date in Logs': { EN: 'Latest Date in Logs', TH: 'วันสแกนล่าสุดในคู่มือสถิติ' },
  'Days Range Look-Ahead': { EN: 'Days Range Look-Ahead', TH: 'ช่วงพิจารณาผู้เกิดล่วงหน้า' },
  'Days': { EN: 'Days', TH: 'วัน' },
  'Show Celebration Type': { EN: 'Show Celebration Type', TH: 'ประเภทการอวยพรร่วมงาน' },
  'Birthdays & Anniversaries': { EN: 'Birthdays & Anniversaries', TH: 'ทั้งวันเกิด & ครบรอบสัญญาจ้าง' },
  'Birthdays Only': { EN: 'Birthdays Only', TH: 'เฉพาะแฮปปี้เบิร์ธเดย์เท่านั้น' },
  'Anniversaries Only': { EN: 'Anniversaries Only', TH: 'เฉพาะงานครบรอบการเข้าทำงาน' },
  'Items Limit': { EN: 'Items Limit', TH: 'ขีดจำกัดแสดงรายการ' },
  'Type Filter': { EN: 'Type Filter', TH: 'กลุ่มประเภทการลา' },
  'All Types': { EN: 'All Types', TH: 'ทุกชนิดการลาทั้งหมด' },
  'Vacation Only': { EN: 'Vacation Only', TH: 'เฉพาะสิทธิพักผ่อนละเว้น' },
  'Sick Only': { EN: 'Sick Only', TH: 'เฉพาะใบลาป่วยสะสม' },
  'Business Only': { EN: 'Business Only', TH: 'เฉพาะลากิจจำเป็น' },
  'Widget Settings': { EN: 'Widget Settings', TH: 'ตั้งค่าคุณสมบัติวิดเจ็ต' },
  'Send Digital Greeting': { EN: 'Send Digital Greeting', TH: 'เขียนและร่วมแชร์การ์ดอวยพรส่งต่อ' },
  'Write your custom celebration message...': { EN: 'Write your custom celebration message...', TH: 'ระบุคำอวยพรจากใจสู่สายงานคนเก่ง...' },
  'Send Wish': { EN: 'Send Wish', TH: 'แชร์คำอวยพรดีๆ' },
  'Approve': { EN: 'Approve', TH: 'อนุมัติผ่าน' },
  'Reject': { EN: 'Reject', TH: 'ปฎิเสธยื่น' },
  'Present': { EN: 'Present', TH: 'มาทำงาน' },
  'Late': { EN: 'Late', TH: 'เข้าสายนะ' },
  'Leave': { EN: 'Leave', TH: 'พ้นลางาน' },
  'Absent': { EN: 'Absent', TH: 'ขาดงาน/ลืมสแกน' },
  'Attendance Summary': { EN: 'Attendance Summary', TH: 'ภาพรวมพฤตินิยมวันนี้' },
  'Recent Check-ins': { EN: 'Recent Check-ins', TH: 'ประวัติดอกสะดุดลงเวลารายคนล่าสุด' },
  'Manage Widget Visibility & Customization': { EN: 'Manage Widget Visibility & Customization', TH: 'ระบบยืดหยุ่นปิดเปิดแถบวิสัยทัศน์และการกสถิติ' },
  'Activate': { EN: 'Activate', TH: 'เปิดใช้งาน' },
  'Deactivate': { EN: 'Deactivate', TH: 'ปิดซ่อน' },
  'Up': { EN: 'Up', TH: 'ขึ้น' },
  'Down': { EN: 'Down', TH: 'ลง' },
  'Close': { EN: 'Close', TH: 'ปิดหน้าแผง' },

  // Holiday management
  'Company Holidays Portal': { EN: 'Company Holidays Portal', TH: 'ระบบจัดการวันหยุดของกลุ่มบริษัท' },
  'Manage Holiday Events': { EN: 'Manage Holiday Events', TH: 'ระบุและกำหนดบันทึกวันหยุดพนักงานร่วมกัน' },
  'Company Holidays': { EN: 'Company Holidays', TH: 'ลำดับวันหยุดบริษัท' },
  'Add Company Holiday': { EN: 'Add Company Holiday', TH: 'เพิ่มวันหยุดประจำปีบริษัท' },
  'Edit Holiday Details': { EN: 'Edit Holiday Details', TH: 'ปรับเปลี่ยนข้อมูลวันหยุดประจำปี' },
  'Holiday Name (English)': { EN: 'Holiday Name (English)', TH: 'ชื่อวันหยุดราชการสากล (English)' },
  'Holiday Name (Thai)': { EN: 'Holiday Name (Thai)', TH: 'ชื่อวันหยุดตามกฎหมาย (ภาษาไทย)' },
  'Observe Date': { EN: 'Observe Date', TH: 'วันที่หยุดปฏิบัติงาน' },
  'Holiday Classification': { EN: 'Holiday Classification', TH: 'ประเภทกลุ่มวันหยุด' },
  'Brief Description / Legacy': { EN: 'Brief Description / Legacy', TH: 'คำอธิบายเชิงนัยยะ / รายละเอียดชดเชย' },
  'Save Holiday Entry': { EN: 'Save Holiday Entry', TH: 'บันทึกวันหยุดลงระบบ' },
  'Delete Holiday Confirmation': { EN: 'Delete Holiday Confirmation', TH: 'คุณต้องการลบข้อบันทึกวันหยุดนี้ใช่หรือไม่?' },
  'Holiday type': { EN: 'Holiday type', TH: 'ประเภทวันหยุด' },
  'Total Off-Days Listed': { EN: 'Total Off-Days Listed', TH: 'วันหยุดทั้งหมดรวมในปีนี้' },
  'Public Holiday': { EN: 'Public Holiday', TH: 'วันหยุดนักขัตฤกษ์' },
  'Religious Holiday': { EN: 'Religious Holiday', TH: 'วันสำคัญทางศาสนา' },
  'Royal Holiday': { EN: 'Royal Holiday', TH: 'วันสำคัญของสถาบันพระมหากษัตริย์' },
  'Corporate Holiday': { EN: 'Corporate Holiday', TH: 'วันหยุดพิเศษประจำบริษัท' },
  'Action Panel': { EN: 'Action Panel', TH: 'แผงจัดการ' },
  'Search Holiday Details...': { EN: 'Search Holiday Details...', TH: 'คำค้นหาระบุกิจกรรมวันหยุด...' },
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_locale');
    return (saved as Language) || 'EN';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_locale', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'EN' ? 'TH' : 'EN');
  };

  const formatLangText = (text: string): string => {
    if (!text) return '';
    
    // 1. Check for " / " separator
    if (text.includes(' / ')) {
      const parts = text.split(' / ');
      const selected = language === 'TH' ? parts[parts.length - 1] : parts[0];
      return selected.trim();
    }
    
    // 2. Check for " (" or "(" separator where it contains Thai characters inside parentheses
    if (text.includes('(') && text.includes(')')) {
      const openIdx = text.indexOf('(');
      const closeIdx = text.indexOf(')');
      const beforeParen = text.substring(0, openIdx).trim();
      const insideParen = text.substring(openIdx + 1, closeIdx).trim();
      
      const hasThai = /[\u0e00-\u0e7f]/.test(insideParen);
      if (hasThai) {
        if (language === 'TH') {
          return insideParen;
        } else {
          return beforeParen;
        }
      }
    }
    
    return text;
  };

  const t = (key: string): string => {
    const term = DICTIONARY[key];
    if (term) {
      return term[language];
    }
    // Fallback if not found in dictionary - format it for any dual language pattern!
    return formatLangText(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, formatLangText }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
