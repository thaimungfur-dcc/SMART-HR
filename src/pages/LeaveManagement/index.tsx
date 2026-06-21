import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbSync } from '../../services/dbSync';
import { 
  CalendarDays, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  PlusCircle, 
  User, 
  HelpCircle, 
  TrendingUp, 
  ChevronRight, 
  ChevronLeft,
  Download, 
  Printer,
  FileSpreadsheet, 
  Activity, 
  Briefcase, 
  Heart, 
  Umbrella,
  ArrowRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Info,
  Lock,
  Unlock,
  LogOut,
  UserCheck,
  ShieldAlert,
  ClipboardList,
  AlertCircle,
  Copy,
  Check,
  ChevronDown,
  Building,
  Layers,
  Users,
  CreditCard,
  Cpu,
  Wrench,
  Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  Legend,
} from 'recharts';
import { dataExportService } from '../../services/dataExportService';

const MySwal = withReactContent(Swal);

// Color maps for styled leaf types
const LEAVE_TYPE_MAP: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
  'Vacation': { 
    label: 'Vacation (พักร้อน)', 
    icon: Umbrella, 
    color: 'text-amber-600', 
    bg: 'bg-amber-50', 
    border: 'border-amber-200' 
  },
  'Sick Leave': { 
    label: 'Sick Leave (ลาป่วย)', 
    icon: Heart, 
    color: 'text-rose-600', 
    bg: 'bg-rose-50', 
    border: 'border-rose-200' 
  },
  'Business Leave': { 
    label: 'Business Leave (ลากิจ)', 
    icon: Briefcase, 
    color: 'text-[#b58c4f]', 
    bg: 'bg-amber-50/50', 
    border: 'border-[#b58c4f]/20' 
  },
  'Personal Leave': { 
    label: 'Personal Leave (ลาส่วนตัว)', 
    icon: User, 
    color: 'text-[#3f809e]', 
    bg: 'bg-sky-50', 
    border: 'border-sky-100' 
  }
};

const DEFAULT_MAP = { 
  label: 'Other Absence', 
  icon: CalendarDays, 
  color: 'text-[#7a8b95]', 
  bg: 'bg-slate-50', 
  border: 'border-slate-200' 
};

// Helper to calculate leave cap status for any employee
const getEmployeeQuotaStatus = (empName: any, empId: any, leavesList: any[]) => {
  const caps = { Vacation: 12, Sick: 30, Business: 7 };
  const taken = { Vacation: 0, Sick: 0, Business: 0 };
  
  const cleanEmpName = String(empName || '').trim().toLowerCase().replace(/\s+/g, '') || '';
  const cleanEmpId = String(empId || '').trim().toLowerCase() || '';

  // Filter approved leaves for this employee for CURRENT YEAR
  const currentYear = new Date().getFullYear();
  const empLeaves = leavesList.filter(l => {
    if (l.status !== 'Approved') return false;
    
    // Check if leave is of current year
    const leaveYear = l.start ? new Date(l.start).getFullYear() : currentYear;
    if (leaveYear !== currentYear) return false;

    const matchId = (l.employeeId && String(l.employeeId).toLowerCase() === cleanEmpId) || 
                    (l.id && String(l.id).toLowerCase() === cleanEmpId);
    let matchName = false;
    if (l.employeeName && cleanEmpName) {
      const leaveCleanName = l.employeeName.trim().toLowerCase().replace(/\s+/g, '');
      matchName = leaveCleanName === cleanEmpName || leaveCleanName.includes(cleanEmpName) || cleanEmpName.includes(leaveCleanName);
    }
    return matchId || matchName;
  });

  empLeaves.forEach(l => {
    const days = Number(l.days) || 0;
    const typeStr = (l.type || '').toLowerCase();
    if (typeStr.includes('vacation')) {
      taken.Vacation += days;
    } else if (typeStr.includes('sick')) {
      taken.Sick += days;
    } else if (typeStr.includes('business') || typeStr.includes('personal')) {
      taken.Business += days;
    }
  });

  const exceededTypes: string[] = [];
  if (taken.Vacation > caps.Vacation) {
    exceededTypes.push(`Vacation (+${taken.Vacation - caps.Vacation}d)`);
  }
  if (taken.Sick > caps.Sick) {
    exceededTypes.push(`Sick (+${taken.Sick - caps.Sick}d)`);
  }
  if (taken.Business > caps.Business) {
    exceededTypes.push(`Business (+${taken.Business - caps.Business}d)`);
  }

  return {
    taken,
    exceeded: exceededTypes.length > 0,
    exceededText: exceededTypes.join(', '),
    details: `Vacation: ${taken.Vacation}/${caps.Vacation}, Sick: ${taken.Sick}/${caps.Sick}, Business: ${taken.Business}/${caps.Business}`
  };
};

interface LeaveManagementProps {
  role?: 'hr' | 'staff';
}

export default function LeaveManagement({ role = 'staff' }: LeaveManagementProps) {
  const { user } = useAuth();
  
  // Data States
  const [leaves, setLeaves] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // HR Tab and Sorting States
  const [activeTab, setActiveTab] = useState<'registry' | 'overview' | 'team-calendar'>('registry');
  const [overviewSortField, setOverviewSortField] = useState<string>('start');
  const [overviewSortDir, setOverviewSortDir] = useState<'asc' | 'desc'>('desc');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [calDate, setCalDate] = useState<Date>(new Date());

  const handleOverviewSort = (field: string) => {
    if (overviewSortField === field) {
      setOverviewSortDir(overviewSortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setOverviewSortField(field);
      setOverviewSortDir('asc');
    }
  };

  const renderSortIcon = (field: string) => {
    if (overviewSortField !== field) {
      return <ArrowUpDown size={11} className="inline opacity-40 ml-1" />;
    }
    return overviewSortDir === 'asc' ? (
      <ArrowUp size={11} className="inline ml-1 text-[#b7a159]" />
    ) : (
      <ArrowDown size={11} className="inline ml-1 text-[#b7a159]" />
    );
  };

  // Staff Private Mode States
  const [inputEmployeeId, setInputEmployeeId] = useState<string>('');
  const [verifiedEmployeeId, setVerifiedEmployeeId] = useState<string>(() => {
    return localStorage.getItem('verified_staff_leave_id') || '';
  });
  
  // HR Filters
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchEmployeeQuery, setSearchEmployeeQuery] = useState<string>('');

  // Dropdown Open States for Custom Premium Filters
  const [isRegistryDeptOpen, setIsRegistryDeptOpen] = useState<boolean>(false);
  const [isRegistryTypeOpen, setIsRegistryTypeOpen] = useState<boolean>(false);
  const [isOverviewDeptOpen, setIsOverviewDeptOpen] = useState<boolean>(false);
  const [isOverviewTypeOpen, setIsOverviewTypeOpen] = useState<boolean>(false);
  
  // Modals and form fields
  const [focusedEmployeeId, setFocusedEmployeeId] = useState<string>('');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [newLeaveForm, setNewLeaveForm] = useState({
    employeeName: '',
    department: 'Human Resources',
    type: 'Vacation',
    start: '',
    end: '',
    reason: '',
    status: 'Pending HR Approval'
  });

  // Custom Premium Lists & Helper functions for Dropdowns
  const departmentsList = [
    { value: 'All', label: 'All Departments', icon: Layers, bg: 'bg-[#212c46]' },
    { value: 'Human Resources', label: 'Human Resources (HR)', icon: Users, bg: 'bg-indigo-600' },
    { value: 'Finance & Accounting', label: 'Finance & Accounting', icon: CreditCard, bg: 'bg-emerald-600' },
    { value: 'Information Technology', label: 'Information Technology (IT)', icon: Cpu, bg: 'bg-sky-600' },
    { value: 'Production', label: 'Production (ฝ่ายผลิต)', icon: Wrench, bg: 'bg-amber-600' },
    { value: 'Logistics', label: 'Logistics (คลังและขนส่ง)', icon: Truck, bg: 'bg-rose-600' },
  ];

  const typesList = [
    { value: 'All', label: 'All Categories', icon: Layers, bg: 'bg-[#212c46]' },
    { value: 'Vacation', label: 'Vacation (ลาพักร้อน)', icon: Umbrella, bg: 'bg-amber-500' },
    { value: 'Sick Leave', label: 'Sick Leave (ลาป่วย)', icon: Heart, bg: 'bg-rose-500' },
    { value: 'Business Leave', label: 'Business Leave (ลากิจ)', icon: Briefcase, bg: 'bg-[#b58c4f]' },
    { value: 'Personal Leave', label: 'Personal Leave (ลาส่วนตัว)', icon: User, bg: 'bg-[#3f809e]' },
  ];

  const getDeptCount = (deptValue: string) => {
    if (deptValue === 'All') return leaves.length;
    return leaves.filter(l => l.department === deptValue).length;
  };

  const getTypeCount = (typeValue: string) => {
    if (typeValue === 'All') return leaves.length;
    return leaves.filter(l => l.type === typeValue).length;
  };

  const calendarDaysList = useMemo(() => {
    const year = calDate.getFullYear();
    const month = calDate.getMonth();
    
    // First day of the month
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday, etc.
    // Total days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Total days in previous month
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells = [];

    // 1. Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      cells.push({
        key: `prev-${dayNum}`,
        dayNum,
        date: dateStr,
        isCurrentMonth: false
      });
    }

    // 2. Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      cells.push({
        key: `curr-${i}`,
        dayNum: i,
        date: dateStr,
        isCurrentMonth: true
      });
    }

    // 3. Next month leading days to complete 42 cells (6 rows)
    let nextMonthDay = 1;
    while (cells.length < 42) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(nextMonthDay).padStart(2, '0')}`;
      cells.push({
        key: `next-${nextMonthDay}`,
        dayNum: nextMonthDay,
        date: dateStr,
        isCurrentMonth: false
      });
      nextMonthDay++;
    }

    return cells;
  }, [calDate]);

  const getApprovedLeavesForDate = (dateStr: string) => {
    return leaves.filter(l => l.status === 'Approved' && dateStr >= l.start && dateStr <= l.end);
  };

  // Pull records on Mount
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const leavesRes = await dbSync.read('LeaveRequests');
      if (leavesRes && leavesRes.status === 'success' && leavesRes.data) {
        setLeaves(leavesRes.data.items || []);
      }
      const employeesRes = await dbSync.read('employees');
      if (employeesRes && employeesRes.status === 'success' && employeesRes.data) {
        setEmployees(employeesRes.data.items || []);
      }
    } catch (err) {
      console.error('Failed to load records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Sync default user to input fields or verification checks
  useEffect(() => {
    if (user && !verifiedEmployeeId && employees.length > 0) {
      const matched = employees.find(
        (e) => 
          e.employeeId === user.employeeId || 
          e.email?.toLowerCase() === user.email?.toLowerCase() ||
          e.name?.toLowerCase().includes(user.name?.toLowerCase())
      );
      if (matched) {
        const idToUse = matched.employeeId || matched.id;
        setVerifiedEmployeeId(idToUse);
        localStorage.setItem('verified_staff_leave_id', idToUse);
      }
    }
  }, [user, employees, verifiedEmployeeId]);

  // Sync focused employee for timeline controls in HR mode
  useEffect(() => {
    if (role === 'hr' && employees.length > 0 && !focusedEmployeeId) {
      setFocusedEmployeeId(employees[0]?.employeeId || '');
    }
  }, [role, employees, focusedEmployeeId]);

  // Handling Employee Lock verification
  const handleVerifyId = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = inputEmployeeId.trim();
    if (!cleanInput) {
      MySwal.fire({
        title: 'กรุณากรอกรหัสพนักงาน',
        text: 'โปรดกรอกรหัสพนักงานของคุณเพื่อเริ่มตรวจสอบข้อมูล',
        icon: 'warning',
        confirmButtonColor: '#212c46'
      });
      return;
    }

    // Match employeeId or ID
    const found = employees.find(
      (emp) => 
        emp.employeeId?.toLowerCase() === cleanInput.toLowerCase() ||
        emp.id?.toLowerCase() === cleanInput.toLowerCase()
    );

    if (found) {
      const targetId = found.employeeId || found.id;
      setVerifiedEmployeeId(targetId);
      localStorage.setItem('verified_staff_leave_id', targetId);
      setInputEmployeeId('');
      MySwal.fire({
        title: 'ยืนยันตัวตนสำเร็จ (Verified)',
        text: `ยินดีต้อนรับคุณ ${found.name} เข้าสู่ระบบประวัติการลาของคุณ`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      MySwal.fire({
        title: 'ไม่พบรหัสพนักงานนี้ (Not Found)',
        text: 'ไม่พบคอมมูนิตี้หรือชื่อที่มีรหัสตรงกับที่กรอก โปรดตรวจสอบกับฝ่ายบุคคลอีกครั้ง',
        icon: 'error',
        confirmButtonColor: '#cf2d2d'
      });
    }
  };

  // Switch/Logout employee on current browser
  const handleSwitchProfile = () => {
    localStorage.removeItem('verified_staff_leave_id');
    setVerifiedEmployeeId('');
    MySwal.fire({
      title: 'ลบเซสชันสำเร็จ',
      text: 'คุณได้ออกจากโปรไฟล์ประวัติการลาส่วนตัวเพื่อความปลอดภัยเรียบร้อยแล้ว',
      icon: 'info',
      timer: 1500,
      showConfirmButton: false
    });
  };

  // Pre-fill fields for individual leave requests
  const handleOpenSubmitDialog = () => {
    let defaultName = '';
    let defaultDept = 'Human Resources';

    if (role === 'staff') {
      const currentStaff = employees.find(e => e.employeeId === verifiedEmployeeId || e.id === verifiedEmployeeId);
      if (currentStaff) {
        defaultName = currentStaff.name || '';
        defaultDept = currentStaff.department || 'Human Resources';
      }
    } else {
      const selectedStaff = employees.find(e => e.employeeId === focusedEmployeeId || e.id === focusedEmployeeId);
      if (selectedStaff) {
        defaultName = selectedStaff.name || '';
        defaultDept = selectedStaff.department || 'Human Resources';
      } else {
        defaultName = user?.name || '';
      }
    }
    
    setNewLeaveForm({
      employeeName: defaultName,
      department: defaultDept,
      type: 'Vacation',
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
      reason: '',
      status: 'Pending HR Approval'
    });
    setIsSubmitModalOpen(true);
  };

  // Dynamic balance check selector helper for submitting leaves
  const getFormBalanceCalculations = () => {
    const targetId = role === 'staff' ? verifiedEmployeeId : focusedEmployeeId;
    const emp = employees.find(e => e.employeeId === targetId || e.id === targetId);
    if (!emp) return { cap: 0, used: 0, left: 0, duration: 0, endingBal: 0, exceeded: false, message: 'Please select an employee' };

    const caps = { Vacation: 12, Sick: 30, Business: 7 };
    const taken = { Vacation: 0, Sick: 0, Business: 0 };

    const targetIdStr = String(emp.employeeId || emp.id).toLowerCase();
    const cleanEmpName = emp.name?.trim().toLowerCase().replace(/\s+/g, '') || '';

    const employeeLeaves = leaves.filter(l => {
      if (l.status !== 'Approved') return false;
      const matchId = (l.employeeId && String(l.employeeId).toLowerCase() === targetIdStr) || (emp.id && String(l.id).toLowerCase() === targetIdStr);
      let matchName = false;
      if (l.employeeName && cleanEmpName) {
        const leaveCleanName = l.employeeName.trim().toLowerCase().replace(/\s+/g, '');
        matchName = leaveCleanName === cleanEmpName || leaveCleanName.includes(cleanEmpName) || cleanEmpName.includes(leaveCleanName);
      }
      return matchId || matchName;
    });

    employeeLeaves.forEach(l => {
      const days = Number(l.days) || 0;
      const typeStr = (l.type || '').toLowerCase();
      if (typeStr.includes('vacation')) {
        taken.Vacation += days;
      } else if (typeStr.includes('sick')) {
        taken.Sick += days;
      } else {
        taken.Business += days;
      }
    });

    let cap = 12;
    let used = 0;
    const requestType = newLeaveForm.type;
    if (requestType.toLowerCase().includes('vacation')) {
      cap = caps.Vacation;
      used = taken.Vacation;
    } else if (requestType.toLowerCase().includes('sick')) {
      cap = caps.Sick;
      used = taken.Sick;
    } else {
      cap = caps.Business;
      used = taken.Business;
    }

    const left = Math.max(0, cap - used);
    
    let duration = 0;
    if (newLeaveForm.start && newLeaveForm.end) {
      const s = new Date(newLeaveForm.start);
      const e = new Date(newLeaveForm.end);
      if (e >= s) {
        duration = Math.ceil(Math.abs(e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      }
    }

    const endingBal = left - duration;
    const exceeded = endingBal < 0;

    return { cap, used, left, duration, endingBal, exceeded, empName: emp.name };
  };

  // Submit actual record
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeaveForm.employeeName || !newLeaveForm.start || !newLeaveForm.end || !newLeaveForm.reason) {
      MySwal.fire('Error', 'Please complete all required fields.', 'error');
      return;
    }

    const start = new Date(newLeaveForm.start);
    const end = new Date(newLeaveForm.end);
    if (end < start) {
      MySwal.fire('Error', 'End date cannot be earlier than start date.', 'error');
      return;
    }

    const durationDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const balCheck = getFormBalanceCalculations();

    if (balCheck.exceeded) {
      const confirmExceed = await MySwal.fire({
        title: 'โควตาการลาไม่เพียงพอ (Quota Balance Exceeded)',
        text: `คุณพยายามยื่นขอลาพักงานจำนวจ ${balCheck.duration} วัน แต่มีสิทธิ์โควตาคงเหลือเพียง ${balCheck.left} วันสำหรับประเภท ${newLeaveForm.type} (เกินสิทธิ์มา ${Math.abs(balCheck.endingBal)} วัน) คุณต้องการส่งคำขอเพื่อรับการพิจารณาเป็นกรณีพิเศษ และยอมรับการปรับหักกรณีไม่มีเงินเดือน (Unpaid Leave) หรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#212c46',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ใช่, ฉันขอยืนยันส่งเรื่องแบบกรณีพิเศษ (Unpaid)',
        cancelButtonText: 'ยกเลิกการส่งแบบฟอร์ม'
      });
      if (!confirmExceed.isConfirmed) {
        return;
      }
    }

    const leaveId = `LR-${Date.now().toString().substring(6)}`;
    
    // Auto-map designated employee details to match system models
    const targetId = role === 'staff' ? verifiedEmployeeId : focusedEmployeeId;
    
    // Check Leave Auto-Approval logic
    const autoApproveEnabled = localStorage.getItem('cfg_leave_auto_approve_enabled') === 'true';
    const autoApproveTypesRaw = localStorage.getItem('cfg_leave_auto_approve_types');
    const autoApproveTypes = autoApproveTypesRaw ? JSON.parse(autoApproveTypesRaw) : ['Vacation', 'Sick Leave'];
    const autoApproveMinBal = parseInt(localStorage.getItem('cfg_leave_auto_approve_min_balance') || '0', 10);
    const autoApproveMaxDays = parseInt(localStorage.getItem('cfg_leave_auto_approve_max_days') || '5', 10);

    let finalStatus = 'Pending HR Approval';
    let isAutoApproved = false;

    if (autoApproveEnabled && autoApproveTypes.includes(newLeaveForm.type)) {
      if (durationDays <= autoApproveMaxDays) {
        // Calculate current approved request days for this individual worker
        const employeeIdToMatch = targetId;
        const matchedEmp = employees.find(e => e.employeeId === employeeIdToMatch || e.id === employeeIdToMatch);
        const cleanEmpName = matchedEmp?.name?.trim().toLowerCase().replace(/\s+/g, '') || '';

        const employeeLeaves = leaves.filter(l => {
          const matchId = l.employeeId === employeeIdToMatch || (matchedEmp && l.employeeId === matchedEmp.id);
          let matchName = false;
          if (l.employeeName && cleanEmpName) {
            const leaveCleanName = l.employeeName.trim().toLowerCase().replace(/\s+/g, '');
            matchName = leaveCleanName === cleanEmpName || leaveCleanName.includes(cleanEmpName) || cleanEmpName.includes(leaveCleanName);
          }
          return matchId || matchName;
        });

        const caps = { Vacation: 12, Sick: 30, Business: 7 };
        const taken = { Vacation: 0, Sick: 0, Business: 0 };

        employeeLeaves.forEach(l => {
          if (l.status === 'Approved') {
            const days = Number(l.days) || 0;
            const typeStr = (l.type || '').toLowerCase();
            if (typeStr.includes('vacation')) {
              taken.Vacation += days;
            } else if (typeStr.includes('sick')) {
              taken.Sick += days;
            } else if (typeStr.includes('business') || typeStr.includes('personal')) {
              taken.Business += days;
            }
          }
        });

        let capForType = 0;
        let usedForType = 0;
        const requestedTypeLower = newLeaveForm.type.toLowerCase();
        
        if (requestedTypeLower.includes('vacation')) {
          capForType = caps.Vacation;
          usedForType = taken.Vacation;
        } else if (requestedTypeLower.includes('sick')) {
          capForType = caps.Sick;
          usedForType = taken.Sick;
        } else if (requestedTypeLower.includes('business') || requestedTypeLower.includes('personal')) {
          capForType = caps.Business;
          usedForType = taken.Business;
        }

        const remainingBefore = capForType - usedForType;
        const balanceAfter = remainingBefore - durationDays;

        if (remainingBefore >= durationDays && balanceAfter >= autoApproveMinBal) {
          finalStatus = 'Approved';
          isAutoApproved = true;
        }
      }
    }

    const payload = {
      id: leaveId,
      ...newLeaveForm,
      status: finalStatus,
      days: durationDays,
      employeeId: targetId,
      submittedAt: new Date().toISOString().split('T')[0]
    };

    setIsLoading(true);
    try {
      await dbSync.write('LeaveRequests', [payload]);
      setLeaves((prev) => [payload, ...prev]);
      setIsSubmitModalOpen(false);
      MySwal.fire({
        title: isAutoApproved ? 'Approved Automatically!' : 'Successfully Submitted!',
        text: isAutoApproved 
          ? `Your leave request for ${newLeaveForm.type} was approved automatically as you have a sufficient remaining balance.`
          : 'Your leave application has been registered and is now routing through the approval timeline.',
        icon: 'success',
        confirmButtonColor: '#212c46'
      });
    } catch (err) {
      console.error(err);
      MySwal.fire('Error', 'Failed to register leave request into system storage.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Status modifier for HR approval action
  const handleApproveReject = async (id: string, nextStatus: 'Approved' | 'Rejected') => {
    const targetLeave = leaves.find(l => l.id === id);
    if (!targetLeave) return;

    const actionText = nextStatus === 'Approved' ? 'approve' : 'reject';
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: `Do you want to ${actionText} this leave request? This will instantly resolve the approval timeline node.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: nextStatus === 'Approved' ? 'rgba(16, 185, 129, 1)' : 'rgba(239, 68, 68, 1)',
      cancelButtonColor: '#7a8b95',
      confirmButtonText: `Yes, ${actionText} it!`
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        const updated = { ...targetLeave, status: nextStatus };
        await dbSync.update('LeaveRequests', [updated]);
        setLeaves(prev => prev.map(l => l.id === id ? updated : l));
        MySwal.fire('Completed!', `Request has been marked as ${nextStatus}.`, 'success');
      } catch (err) {
        console.error(err);
        MySwal.fire('Error', 'Failed to commit approval status.', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Find info about target selected employee (either verified staff or chosen HR focus)
  const focusedEmployeeObj = useMemo(() => {
    const targetId = role === 'staff' ? verifiedEmployeeId : focusedEmployeeId;
    return employees.find(e => e.employeeId === targetId || e.id === targetId) || null;
  }, [employees, role, verifiedEmployeeId, focusedEmployeeId]);

  // Extract logs or leaves matching target individual worker
  const focusedEmployeeLeavesTimeline = useMemo(() => {
    if (!focusedEmployeeObj) return [];
    
    const targetCleanName = focusedEmployeeObj.name?.trim().toLowerCase().replace(/\s+/g, '');
    const targetId = focusedEmployeeObj.employeeId || focusedEmployeeObj.id;

    return leaves.filter(l => {
      const matchId = l.employeeId === targetId || l.employeeId === focusedEmployeeObj.id;
      let matchName = false;
      if (l.employeeName) {
        const leaveCleanName = l.employeeName.trim().toLowerCase().replace(/\s+/g, '');
        matchName = leaveCleanName === targetCleanName || leaveCleanName.includes(targetCleanName) || targetCleanName.includes(leaveCleanName);
      }
      return matchId || matchName;
    }).sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime()); // Newest start date first
  }, [leaves, focusedEmployeeObj]);

  // Calculate leave caps and consumption for target user
  const personalLeaveAllowances = useMemo(() => {
    const caps = { Vacation: 12, Sick: 30, Business: 7 };
    const taken = { Vacation: 0, Sick: 0, Business: 0 };

    focusedEmployeeLeavesTimeline.forEach(l => {
      if (l.status === 'Approved') {
        const days = Number(l.days) || 0;
        const typeStr = (l.type || '').toLowerCase();
        if (typeStr.includes('vacation')) {
          taken.Vacation += days;
        } else if (typeStr.includes('sick')) {
          taken.Sick += days;
        } else if (typeStr.includes('business') || typeStr.includes('personal')) {
          taken.Business += days;
        }
      }
    });

    return [
      {
        type: 'Vacation',
        label: 'Vacation Allowance (พักร้อน)',
        cap: caps.Vacation,
        used: taken.Vacation,
        left: Math.max(0, caps.Vacation - taken.Vacation),
        color: '#f59e0b',
        barStyle: 'bg-amber-500'
      },
      {
        type: 'Sick Leave',
        label: 'Sick Leave Allowance (ลาป่วย)',
        cap: caps.Sick,
        used: taken.Sick,
        left: Math.max(0, caps.Sick - taken.Sick),
        color: '#10b981',
        barStyle: 'bg-emerald-600'
      },
      {
        type: 'Business Leave',
        label: 'Business Leave Allowance (ลากิจ)',
        cap: caps.Business,
        used: taken.Business,
        left: Math.max(0, caps.Business - taken.Business),
        color: '#3f809e',
        barStyle: 'bg-[#3f809e]'
      }
    ];
  }, [focusedEmployeeLeavesTimeline]);

  // Filter company wide database entries (HR ONLY)
  const filteredSystemLeaves = useMemo(() => {
    return leaves.filter(l => {
      const matchDept = selectedDept === 'All' || l.department === selectedDept;
      const matchType = selectedType === 'All' || l.type === selectedType;
      const matchStatus = selectedStatus === 'All' || l.status === selectedStatus;
      
      const searchTxt = searchEmployeeQuery.toLowerCase();
      const matchSearch = !searchTxt || 
        l.employeeName?.toLowerCase().includes(searchTxt) || 
        l.reason?.toLowerCase().includes(searchTxt) ||
        l.id?.toLowerCase().includes(searchTxt);

      return matchDept && matchType && matchStatus && matchSearch;
    });
  }, [leaves, selectedDept, selectedType, selectedStatus, searchEmployeeQuery]);

  // Global HR level statistics
  const statistics = useMemo(() => {
    const total = leaves.length;
    const pending = leaves.filter(l => l.status === 'Pending HR Approval' || l.status === 'Pending').length;
    const approved = leaves.filter(l => l.status === 'Approved').length;
    const rejected = leaves.filter(l => l.status === 'Rejected').length;
    return { total, pending, approved, rejected };
  }, [leaves]);

  const leaveTrends = useMemo(() => {
    const counts: Record<string, number> = {
      'Vacation': 0,
      'Sick Leave': 0,
      'Business Leave': 0,
      'Personal Leave': 0
    };
    leaves.forEach(leave => {
      const type = leave.type || 'Other';
      const dbDays = Number(leave.days) || 1;
      if (counts[type] !== undefined) {
        counts[type] += dbDays;
      } else {
        const normalized = type.toLowerCase();
        if (normalized.includes('vacation')) {
          counts['Vacation'] += dbDays;
        } else if (normalized.includes('sick')) {
          counts['Sick Leave'] += dbDays;
        } else if (normalized.includes('business')) {
          counts['Business Leave'] += dbDays;
        } else {
          counts['Personal Leave'] += dbDays;
        }
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [leaves]);

  const monthlyLeaveByDept = useMemo(() => {
    const departments = [
      'Human Resources',
      'Finance & Accounting',
      'Information Technology',
      'Production',
      'Logistics'
    ];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const data = months.map(m => {
      const row: any = { name: m };
      departments.forEach(d => {
        row[d] = 0;
      });
      return row;
    });

    const currentYear = new Date().getFullYear();

    leaves.forEach(l => {
      if (l.status === 'Approved' && l.start) {
        const date = new Date(l.start);
        if (date.getFullYear() === currentYear) {
          const monthIndex = date.getMonth();
          if (monthIndex >= 0 && monthIndex < 12) {
            const dept = l.department || 'Production';
            const matchedDept = departments.find(d => d.toLowerCase() === dept.trim().toLowerCase()) || 'Production';
            data[monthIndex][matchedDept] += Number(l.days) || 0;
          }
        }
      }
    });

    return data;
  }, [leaves]);

  const sortedFilteredLeaves = useMemo(() => {
    const list = [...filteredSystemLeaves];

    list.sort((a, b) => {
      let valA = a[overviewSortField];
      let valB = b[overviewSortField];

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (overviewSortField === 'days') {
        const numA = Number(valA) || 0;
        const numB = Number(valB) || 0;
        return overviewSortDir === 'asc' ? numA - numB : numB - numA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();

      if (strA < strB) return overviewSortDir === 'asc' ? -1 : 1;
      if (strA > strB) return overviewSortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [filteredSystemLeaves, overviewSortField, overviewSortDir]);


  // Export all database leave entries for the current year
  const handleExportAllLeavesCsv = async () => {
    const currentYear = new Date().getFullYear();
    const currentYearLeaves = leaves.filter(l => {
      if (!l.start) return false;
      return new Date(l.start).getFullYear() === currentYear;
    });

    if (currentYearLeaves.length === 0) {
      MySwal.fire({
        icon: 'info',
        title: 'ไม่มีข้อมูลปีปัจจุบัน',
        text: `ไม่พบข้อมูลประวัติการลาสำหรับปี ${currentYear}`,
        confirmButtonColor: '#212c46'
      });
      return;
    }

    // Map each leave request to a clean readable row
    const mappedRows = currentYearLeaves.map(l => {
      const quotaStatus = getEmployeeQuotaStatus(l.employeeName || '', l.employeeId || '', leaves);
      return {
        'Request ID (รหัสคำขอ)': l.id || '',
        'Employee ID (รหัสพนักงาน)': l.employeeId || '',
        'Employee Name (ชื่อพนักงาน)': l.employeeName || '',
        'Department (แผนก)': l.department || '',
        'Leave Type (ประเภทการลา)': l.type || '',
        'Start Date (วันเริ่มต้น)': l.start || '',
        'End Date (วันสิ้นสุด)': l.end || '',
        'Days Taken (จำนวนวัน)': l.days || 1,
        'Reason (เหตุผล)': l.reason || '',
        'Status (สถานะ)': l.status || '',
        'Quota Exceeded (จำนวนเกินโควตา)': quotaStatus.exceeded ? `Yes (${quotaStatus.exceededText})` : 'No',
        'Quota Details (รายละเอียดโควตาปีนี้)': quotaStatus.details,
        'Submitted At (ส่งใบคำขอเมื่อ)': l.submittedAt || l.createdAt || '-'
      };
    });

    try {
      dataExportService.exportToCSV(mappedRows, `comprehensive_leave_report_${currentYear}`);
      await dataExportService.logExport('Employees', 'CSV', mappedRows.length);
      
      MySwal.fire({
        icon: 'success',
        title: 'ดาวน์โหลดรายงานสำเร็จ',
        text: 'รายงานข้อมูลการลาทั้งหมดของปีปัจจุบันถูกส่งออกและเข้าบันทึกรายงานระบบเรียบร้อยแล้ว',
        confirmButtonColor: '#212c46'
      });
    } catch (err) {
      console.error(err);
      MySwal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถออกรายงาน CSV ได้ในขณะนี้',
        confirmButtonColor: '#212c46'
      });
    }
  };

  // Export individual leave utilization data as a formatted CSV document
  const handleExportLeaveHistoryCsv = () => {
    if (!focusedEmployeeObj) return;

    try {
      const csvLines: string[] = [];

      // 1. Report Header info
      csvLines.push('"INDIVIDUAL LEAVE UTILIZATION REPORT (รายงานสรุปการลาส่วนบุคคล)"');
      csvLines.push(`"Employee Name / ชื่อพนักงาน","${focusedEmployeeObj.name || ''}"`);
      csvLines.push(`"Employee ID / รหัสพนักงาน","${focusedEmployeeObj.employeeId || ''}"`);
      csvLines.push(`"Position / ตำแหน่ง","${focusedEmployeeObj.position || 'Employee'}"`);
      csvLines.push(`"Department / แผนก","${focusedEmployeeObj.department || ''}"`);
      csvLines.push(`"Report Issued Date / วันที่ออกรายงาน","${new Date().toLocaleString('th-TH')}"`);
      csvLines.push(''); // blank row

      // 2. Allowances Summary Part
      csvLines.push('"LEAVE UTILIZATION SUMMARY (สรุปสิทธิ์การลางาน)"');
      csvLines.push('"Leave Category (ประเภทการลา)","Total Allowance (โควตาทั้งหมด)","Used (ใช้สิทธิ์แล้ว)","Remaining (สิทธิ์คงเหลือ)"');
      
      personalLeaveAllowances.forEach((allowed: any) => {
        csvLines.push(`"${allowed.label || allowed.type}","${allowed.cap}","${allowed.used}","${allowed.left}"`);
      });
      csvLines.push(''); // blank row

      // 3. Itemized Lists Part
      csvLines.push('"DETAILED LEAVE REQUESTS TIMELINE (ข้อมูลรายการลาทั้งหมด)"');
      csvLines.push('"Request ID (รหัสคำขอ)","Leave Type (ประเภทการลา)","Start Date (วันเริ่มต้น)","End Date (วันสิ้นสุด)","Days (จำนวนวัน)","Reason (เหตุผลการลา)","Status (สถานะ)","Created Date / Updated Date"');

      focusedEmployeeLeavesTimeline.forEach((item: any) => {
        const cleanType = item.type || '';
        const cleanStart = item.start || '';
        const cleanEnd = item.end || '';
        const cleanDays = item.days || 1;
        const cleanReason = (item.reason || '').replace(/"/g, '""');
        const cleanStatus = item.status || '';
        const cleanDate = item.createdAt ? new Date(item.createdAt).toLocaleString('th-TH') : '';
        
        csvLines.push(`"${item.id || ''}","${cleanType}","${cleanStart}","${cleanEnd}","${cleanDays}","${cleanReason}","${cleanStatus}","${cleanDate}"`);
      });

      // Join lines with UTF-8 BOM to support direct Excel open without gibberish Thai characters.
      const csvString = '\uFEFF' + csvLines.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Leave_Report_${focusedEmployeeObj.employeeId}_${focusedEmployeeObj.name.replace(/\s+/g, '_')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      MySwal.fire({
        icon: 'success',
        title: 'ดาวน์โหลดรายงานสำเร็จ',
        text: 'รายงานประวัติการลาถูกดาวน์โหลดเป็นไฟล์ CSV สำหรับเปิดบน Excel หรือ Google Sheets เรียบร้อยแล้ว',
        confirmButtonColor: '#212c46'
      });
    } catch (err) {
      console.error('Failed to export leave history:', err);
      MySwal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถออกรายงานในรูปแบบเอกสารได้ในขณะนี้',
        confirmButtonColor: '#212c46'
      });
    }
  };

  // Open a printable popup with pre-formatted layout as a document report
  const handlePrintLeaveReport = () => {
    if (!focusedEmployeeObj) return;

    const windowPrint = window.open('', '', 'width=950,height=750');
    if (!windowPrint) {
      MySwal.fire({
        icon: 'warning',
        title: 'โปรดอนุญาตป๊อปอัป',
        text: 'ระบบไม่สามารถเปิดหน้าต่างพิมพ์ใบรายงานได้ เนื่องจากป๊อปอัปถูกปิดกั้น',
        confirmButtonColor: '#212c46'
      });
      return;
    }

    const quotaRows = personalLeaveAllowances.map((allowed: any) => `
      <tr>
        <td style="font-weight: bold; color: #1e293b; padding: 12px 14px; border-bottom: 1px solid #e2e8f0;">${allowed.label}</td>
        <td style="text-align: center; font-weight: 700; padding: 12px 14px; border-bottom: 1px solid #e2e8f0;">${allowed.cap} วัน</td>
        <td style="text-align: center; color: #059669; font-weight: 700; padding: 12px 14px; border-bottom: 1px solid #e2e8f0;">${allowed.used} วัน</td>
        <td style="text-align: center; color: #b45309; font-weight: 700; padding: 12px 14px; border-bottom: 1px solid #e2e8f0;">${allowed.left} วัน</td>
      </tr>
    `).join('');

    const timelineRows = focusedEmployeeLeavesTimeline.length === 0 
      ? `<tr><td colspan="6" style="text-align: center; color: #94a3b8; font-style: italic; padding: 30px;">ไม่พบรายการบันทึกประวัติการลา</td></tr>`
      : focusedEmployeeLeavesTimeline.map((item: any) => {
          const statusIsApproved = item.status === 'Approved';
          const statusIsRejected = item.status === 'Rejected';
          const statusColor = statusIsApproved ? '#10b981' : statusIsRejected ? '#ef4444' : '#f59e0b';
          const statusBg = statusIsApproved ? '#ecfdf5' : statusIsRejected ? '#fef2f2' : '#fffbeb';
          
          return `
            <tr>
              <td style="font-family: monospace; font-size: 11px; font-weight: bold; color: #475569; padding: 12px 14px; border-bottom: 1px solid #e2e8f0;">${item.id}</td>
              <td style="font-weight: bold; color: #1e293b; padding: 12px 14px; border-bottom: 1px solid #e2e8f0;">${item.type}</td>
              <td style="font-family: monospace; font-weight: 600; padding: 12px 14px; border-bottom: 1px solid #e2e8f0;">${item.start} ~ ${item.end}</td>
              <td style="text-align: center; font-weight: 700; padding: 12px 14px; border-bottom: 1px solid #e2e8f0;">${item.days} วัน</td>
              <td style="color: #64748b; font-style: italic; font-size: 11px; padding: 12px 14px; border-bottom: 1px solid #e2e8f0;">"${item.reason || '-'}"</td>
              <td style="text-align: center; padding: 12px 14px; border-bottom: 1px solid #e2e8f0;">
                <span style="display: inline-block; padding: 4px 8px; font-size: 10px; font-weight: 950; border-radius: 6px; text-transform: uppercase; background-color: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusColor}44;">
                  ${item.status}
                </span>
              </td>
            </tr>
          `;
        }).join('');

    windowPrint.document.write(`
      <html>
        <head>
          <title>รายงานประวัติและการใช้วันลาพนักงาน - ${focusedEmployeeObj.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;800&family=JetBrains+Mono:wght@400;700&display=swap');
            body { 
              font-family: 'Sarabun', 'Helvetica Neue', Arial, sans-serif; 
              padding: 45px; 
              color: #1e293b; 
              line-height: 1.5;
              background-color: #ffffff;
            }
            .header-container { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-start; 
              border-bottom: 3px double #e2e8f0; 
              padding-bottom: 25px; 
              margin-bottom: 35px; 
            }
            .company-info h1 {
              font-size: 26px;
              font-weight: 800;
              color: #212c46;
              margin: 0;
              letter-spacing: 0.5px;
            }
            .company-info p {
              font-size: 12px;
              color: #64748b;
              margin: 4px 0 0 0;
              font-weight: 600;
            }
            .document-title {
              text-align: right;
            }
            .document-title h2 {
              font-size: 18px;
              font-weight: 800;
              color: #b58c4f;
              margin: 0;
              text-transform: uppercase;
            }
            .document-title p {
              font-size: 11px;
              color: #64748b;
              margin: 5px 0 0 0;
              font-family: 'JetBrains Mono', monospace;
            }
            
            .employee-card {
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 20px;
              margin-bottom: 35px;
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
            }
            .info-item {
              font-size: 13px;
            }
            .info-label {
              color: #64748b;
              font-weight: 600;
              display: inline-block;
              width: 130px;
            }
            .info-value {
              color: #1e293b;
              font-weight: 800;
            }

            h3 {
              font-size: 15px;
              font-weight: 800;
              color: #212c46;
              border-left: 4px solid #b58c4f;
              padding-left: 10px;
              margin-top: 0;
              margin-bottom: 15px;
              text-transform: uppercase;
            }

            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 40px;
            }
            th { 
              background: #f1f5f9; 
              text-align: left; 
              padding: 12px 14px; 
              font-size: 11px; 
              font-weight: 800; 
              text-transform: uppercase; 
              border-bottom: 2px solid #cbd5e1;
              color: #475569;
            }
            td { 
              padding: 12px 14px; 
              font-size: 12.5px; 
              border-bottom: 1px solid #e2e8f0; 
              color: #334155;
            }
            
            .footer {
              margin-top: 60px;
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              color: #94a3b8;
            }

            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="company-info">
              <h1>T ALL INTELLIGENCE CO., LTD.</h1>
              <p>46 Moo 5, Klong 4, Klong Luang, Pathumthani Thailand 12120</p>
            </div>
            <div class="document-title">
              <h2>LEAVE UTILIZATION REPORT</h2>
              <p>เอกสารสรุปสิทธิ์และการใช้วันสะสม</p>
            </div>
          </div>

          <div class="employee-card">
            <div class="info-item">
              <span class="info-label">ชื่อพนักงาน:</span>
              <span class="info-value">${focusedEmployeeObj.name}</span>
            </div>
            <div class="info-item">
              <span class="info-label">รหัสพนักงาน:</span>
              <span class="info-value" style="font-family: monospace;">${focusedEmployeeObj.employeeId}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ตำแหน่ง:</span>
              <span class="info-value">${focusedEmployeeObj.position || 'พนักงานปฏิบัติการ'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">แผนก / สังกัด:</span>
              <span class="info-value">${focusedEmployeeObj.department}</span>
            </div>
          </div>

          <h3>1. สรุปสิทธิ์วันลาคงเหลือปัจจุบัน (Leave Quota Summary)</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 40%;">ประเภทโควตาการลา (Leave Quota Category)</th>
                <th style="width: 20%; text-align: center;">สิทธิ์ทั้งหมด (Cap)</th>
                <th style="width: 20%; text-align: center;">ใช้สิทธิ์แล้ว (Used)</th>
                <th style="width: 20%; text-align: center;">คงเหลือ (Remaining)</th>
              </tr>
            </thead>
            <tbody>
              ${quotaRows}
            </tbody>
          </table>

          <h3>2. ประวัติรายการคำขอลา (Leave Application History Timeline)</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 15%;">รหัสคำขอ</th>
                <th style="width: 20%;">ประเภทการลา</th>
                <th style="width: 25%;">ช่วงวันที่ลา</th>
                <th style="width: 10%; text-align: center;">จำนวนวัน</th>
                <th style="width: 18%;">เหตุผลการลา</th>
                <th style="width: 12%; text-align: center;">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              ${timelineRows}
            </tbody>
          </table>

          <div class="footer">
            <div>วันที่ออกเอกสาร: ${new Date().toLocaleString('th-TH')}</div>
            <div>Chai Sri Agro Industrial HR Document Management System • Confidential</div>
          </div>
        </body>
      </html>
    `);

    windowPrint.document.close();
    windowPrint.focus();
    setTimeout(() => {
      windowPrint.print();
      windowPrint.close();
    }, 600);
  };


  // ==================== RENDERING STAFF LOCK SCREEN ====================
  if (role === 'staff' && !verifiedEmployeeId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f3f3f1] min-h-screen px-4 py-8" id="staff-verification-screen">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white max-w-md w-full rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
        >
          {/* Header Shield Accent */}
          <div className="bg-[#212c46] px-6 py-6 text-center text-white space-y-2 border-b-4 border-[#b58c4f]">
            <div className="mx-auto w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-[#b58c4f]">
              <Lock size={24} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-wider"> STAFF IDENTITY VERIFICATION</h2>
            <p className="text-[10px] uppercase text-slate-300 font-bold tracking-widest">
              กรุณาระบุรหัสพนักงานส่วนตัวสำหรับเข้าดูประวัติและโควตาการลา
            </p>
          </div>

          <form onSubmit={handleVerifyId} className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#212c46] block">
                รหัสพนักงานของคุณ (Employee ID) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="ตัวอย่างเช่น: EMP001, EMP002"
                  value={inputEmployeeId}
                  onChange={(e) => setInputEmployeeId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#3f809e] focus:bg-white rounded-xl py-3 px-4 text-xs font-black text-slate-800 outline-none transition-all shadow-inner uppercase font-mono"
                />
              </div>
              <p className="text-[9px] text-[#748ea1] font-extrabold flex items-center gap-1">
                <Info size={11} className="text-[#3f809e]" />
                ระบบประหยัดเวลา: รหัสสำหรับดีไวซ์นี้จะถูกบันทึกในอุปกรณ์จนกว่าคุณจะกดออฟไลน์โปรไฟล์
              </p>
            </div>

            {/* Quick Suggestions Helper box for developer/user convenience */}
            {employees.length > 0 && (
              <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl space-y-1.5">
                <p className="text-[8px] font-black uppercase tracking-widest text-amber-700">💡 รหัสพนักงานที่ใช้งานอยู่ในระบบ (สำหรับทดสอบ):</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {employees.slice(0, 4).map((emp) => (
                    <button
                      type="button"
                      key={emp.employeeId || emp.id}
                      onClick={() => setInputEmployeeId(emp.employeeId || emp.id)}
                      className="px-2 py-1 bg-white hover:bg-[#212c46] hover:text-white border border-amber-200 hover:border-[#212c46] rounded-md text-[9px] font-black uppercase transition-all shadow-sm font-mono cursor-pointer"
                    >
                      {emp.employeeId || emp.id} ({emp.name?.split(' ')[0]})
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#212c46] text-[#b58c4f] hover:bg-[#2e3b5c] hover:text-white transition-all font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 border border-[#212c46]/20 shadow-md cursor-pointer active:scale-95"
            >
              <Unlock size={14} /> ตรวจสอบตัวตน (Access Portal)
            </button>
          </form>
        </motion.div>
      </div>
    );
  }


  // ==================== RENDERING STAFF INDIVIDUAL PORTAL ====================
  if (role === 'staff' && verifiedEmployeeId && focusedEmployeeObj) {
    return (
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6 bg-[#f3f3f1] min-h-screen text-slate-800" id="staff-personal-leave-dashboard">
        
        {/* Welcome Section Header */}
        <div className="bg-white rounded-3xl border border-slate-150 p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
          <div className="flex items-center gap-4">
            <img 
              src={focusedEmployeeObj.avatar || 'https://drive.google.com/thumbnail?id=1Z_fRbN9S4aA7OkHb3mlim_t60wIT4huY&sz=w400'} 
              alt={focusedEmployeeObj.name} 
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 select-none shadow-sm shrink-0"
            />
            <div>
              <p className="text-[10px] font-black uppercase text-amber-600 tracking-wider flex items-center gap-1">
                <UserCheck size={12} className="text-[#b58c4f]" /> Staff Absence Portal (ประวัติส่วนบุคคล)
              </p>
              <h1 className="text-xl font-black uppercase tracking-tight text-[#212c46] leading-none mt-1">
                {focusedEmployeeObj.name}
              </h1>
              <p className="text-[10px] font-bold text-[#7a8b95] uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                รหัสพนักงาน: <span className="font-mono font-extrabold text-[#212c46] bg-slate-100 px-1.5 py-0.5 rounded">{focusedEmployeeObj.employeeId}</span> • {focusedEmployeeObj.position || 'Employee'} • {focusedEmployeeObj.department}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            {/* Download Leave History CSV */}
            <button 
              onClick={handleExportLeaveHistoryCsv}
              title="ดาวน์โหลดรายงานประวัติการลาและโควตาคงเหลือเป็นไฟล์ CSV สำหรับ Excel"
              className="bg-emerald-700 text-white hover:bg-emerald-800 px-4 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-emerald-800/10 shadow-md active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet size={15} /> สรุปการลา (Export CSV)
            </button>

            {/* Print official PDF report */}
            <button 
              onClick={handlePrintLeaveReport}
              title="พิมพ์เอกสารสรุปสิทธิ์วันลาและการใช้วันสะสมเป็น PDF"
              className="bg-sky-700 text-white hover:bg-sky-800 px-4 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-sky-800/10 shadow-md active:scale-95 cursor-pointer"
            >
              <Printer size={15} /> พิมพ์รายงาน (Print PDF)
            </button>

            {/* Create Leave Button */}
            <button 
              onClick={handleOpenSubmitDialog}
              className="bg-[#212c46] text-[#b58c4f] hover:bg-[#2e3b5a] hover:text-white px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-[#212c46]/20 shadow-md active:scale-95 cursor-pointer"
            >
              <PlusCircle size={15} /> เขียนใบลาพักงาน (Submit Form)
            </button>

            {/* Logout/Dissociate Button */}
            <button 
              onClick={handleSwitchProfile}
              title="ออกจากโปรไฟล์ส่วนบุคคลเพื่อความปลอดภัย"
              className="p-3 bg-red-50 hover:bg-red-100 border border-red-100 font-black text-red-600 hover:text-red-800 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Dashboard split for Staff: Left side is Allowance Progress Bars, Right is Live Node Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Allowances Bars Box */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <TrendingUp size={18} className="text-[#b58c4f]" />
                <div>
                  <h3 className="text-xs font-black uppercase text-[#212c46] tracking-wider">โควตาการลาคงเหลือ (Available Allowances)</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">อนุมัติและจำกัดสิทธิ์คงเหลือในปีปัจจุบัน</p>
                </div>
              </div>

              <div className="space-y-5">
                {personalLeaveAllowances.map((allowed) => {
                  const percentLeft = (allowed.left / allowed.cap) * 100;
                  return (
                    <div key={allowed.type} className="space-y-2" id={`staff-balance-bar-${allowed.type.toLowerCase().substring(0, 4)}`}>
                      <div className="flex justify-between items-center text-[10px] font-black uppercase">
                        <span className="text-slate-600 font-extrabold flex items-center gap-1">{allowed.label}</span>
                        <span className="text-[#212c46] font-black bg-slate-50 border border-slate-100 px-2 py-0.5 rounded tracking-tight">{allowed.left} / {allowed.cap} วันเหลือต์</span>
                      </div>
                      
                      {/* Visual Progress bar */}
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentLeft}%` }}
                          transition={{ duration: 0.9, ease: 'easeOut' }}
                          className={`h-full ${allowed.barStyle} rounded-full`}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>ใช้ไปแล้ว: {allowed.used} วัน (Approved)</span>
                        <span>สิทธิ์ทั้งหมด: {allowed.cap} วัน</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Info guidelines warning card */}
              <div className="p-4 bg-[#212c46]/5 border-l-4 border-[#3f809e] rounded-xl flex items-start gap-2.5">
                <AlertCircle size={15} className="text-[#3f809e] shrink-0 mt-0.5" />
                <p className="text-[9px] text-slate-500 font-bold leading-normal uppercase">
                  หมายเหตุ: หากต้องการแจ้งลาเร่งด่วนภายนอกระบบ หรือข้อมูลไม่ถูกต้อง โปรดประสานงานฝ่ายทรัพยากรบุคคล (HR Service Center) ทันที
                </p>
              </div>
            </div>
          </div>

          {/* Timeline Visual Progress Box */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-slate-500" />
                  <div>
                    <h3 className="text-xs font-black uppercase text-[#212c46] tracking-wider">ไทม์ไลน์สถานะการลา (Request Timeline History)</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">ติดตามทุกขั้นตอนการอนุมัติและประวัติการลารายการที่นี่</p>
                  </div>
                </div>
                <span className="text-[9px] font-black text-slate-500 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded">
                  {focusedEmployeeLeavesTimeline.length} รายการทั้งหมด
                </span>
              </div>

              {/* Loader */}
              {isLoading ? (
                <div className="text-center py-12 animate-pulse font-extrabold text-xs text-slate-400 uppercase">
                  กำลังซิงก์ข้อมูลประวัติความปลอดภัย...
                </div>
              ) : focusedEmployeeLeavesTimeline.length === 0 ? (
                <div className="text-center py-14 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                  <div className="mx-auto w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-2">
                    <ClipboardList size={20} />
                  </div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">ไม่พบประวัติการส่งใบลาของคุณ</p>
                  <p className="text-[9px] text-slate-300 font-bold uppercase mt-1 leading-relaxed px-10">
                    รายการการลาย้อนหลังที่ถูกสร้างใหม่ผ่านระบบจะปรากฏขึ้นที่นี่โดยอัตโนมัติ
                  </p>
                </div>
              ) : (
                <div className="relative pl-4 border-l border-slate-200 ml-2.5 space-y-6 pt-2 pb-2">
                  {focusedEmployeeLeavesTimeline.map((item, index) => {
                    const mapObj = LEAVE_TYPE_MAP[item.type] || DEFAULT_MAP;
                    const TypeIconComponent = mapObj.icon;
                    const statusIsApproved = item.status === 'Approved';
                    const statusIsRejected = item.status === 'Rejected';
                    const statusIsPending = !statusIsApproved && !statusIsRejected;

                    return (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative"
                      >
                        {/* Timeline Circle Bullet Node */}
                        <div className={`absolute -left-[22.5px] top-1.5 w-4.5 h-4.5 rounded-full border-2 ${
                          statusIsApproved ? 'bg-emerald-500 border-white ring-4 ring-emerald-500/15' :
                          statusIsRejected ? 'bg-rose-500 border-white ring-4 ring-rose-500/15' :
                          'bg-amber-400 border-white ring-4 ring-amber-400/15'
                        }`} />

                        {/* Content inside Box */}
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-150 shadow-sm space-y-3">
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                              <span className={`inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${mapObj.bg} ${mapObj.color} ${mapObj.border}`}>
                                <TypeIconComponent size={10} />
                                {item.type}
                              </span>
                              <h4 className="text-[11px] font-extrabold text-[#212c46] mt-1.5">
                                {item.days} Day{item.days > 1 ? 's' : ''} Absence ({item.days} วัน)
                              </h4>
                            </div>
                            
                            {/* Outcome Badge */}
                            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                              statusIsApproved ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                              statusIsRejected ? 'bg-rose-550 border-rose-100 text-rose-800' :
                              'bg-amber-50 border-amber-100 text-amber-800'
                            }`}>
                              {item.status}
                            </span>
                          </div>

                          {/* Request specifications */}
                          <div className="text-[10px] text-slate-500 font-semibold space-y-1">
                            <p className="flex items-center gap-1 font-mono uppercase tracking-tight text-slate-600">
                              <span className="text-slate-400 font-bold">ช่วงวันที่ลา:</span>
                              <span className="text-[#212c46] font-bold">{item.start}</span>
                              <ArrowRight size={10} className="text-slate-400" />
                              <span className="text-[#212c46] font-bold">{item.end}</span>
                            </p>
                            <p className="italic text-slate-400 text-[10px] bg-white border border-slate-100 p-2 rounded-lg leading-relaxed">
                              "{item.reason || 'กรุณาลากิจกรรมพักผ่อน'}"
                            </p>
                          </div>

                          {/* Approval step progress tracking */}
                          <div className="pt-2 border-t border-slate-200/60 text-[8px] font-black uppercase tracking-widest space-y-1.5 leading-relaxed">
                            <div className="flex items-center gap-1.5 text-emerald-600">
                              <CheckCircle size={10} />
                              <span>ขั้นตอนที่ 1: ตรวจสอบและยื่นคำขอลาเรียบร้อยแล้ว</span>
                            </div>

                            <div className={`flex items-center gap-1.5 ${statusIsPending ? 'text-amber-500' : 'text-emerald-600'}`}>
                              {statusIsPending ? <Clock size={10} /> : <CheckCircle size={10} />}
                              <span>ขั้นตอนที่ 2: อยู่ระหว่างการตรวจสอบของฝ่ายบุคคล (HR Review)</span>
                            </div>

                            <div className={`flex items-center gap-1.5 ${
                              statusIsApproved ? 'text-emerald-600' :
                              statusIsRejected ? 'text-rose-600' :
                              'text-slate-300'
                            }`}>
                              {statusIsApproved ? <CheckCircle size={10} /> : statusIsRejected ? <XCircle size={10} /> : <Clock size={10} />}
                              <span>ขั้นตอนที่ 3: {statusIsApproved ? 'อนุมัติเรียบร้อยและหักลบโควตาคงเหลือแล้ว' : statusIsRejected ? 'คำขอลาถูกปฏิเสธ / ยกเลิกคำขอแล้ว' : 'รอการลงนามอนุมัติขั้นสุดท้าย'}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* mt-8 bottom spacing for 32px before footer */}
        <div className="mt-8" />

      </div>
    );
  }


  // ==================== RENDERING HR LEAVE ADMINISTRATION CENTER ====================
  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6 bg-[#f3f3f1] min-h-screen text-slate-800" id="leave-management-hub">
      
      {/* HEADER COMPONENT */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5" id="leave-header-section">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-[#212c46] rounded-2xl border border-indigo-100 shadow-sm">
            <CalendarDays size={32} className="text-[#3f809e]" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#212c46] leading-none">
              LEAVE AND ABSENCE HUB (HR PORTAL)
            </h1>
            <p className="text-[11px] font-bold text-[#7a8b95] uppercase tracking-[0.15em] mt-1.5 flex items-center gap-1.5">
              <Activity size={12} className="text-[#b58c4f]" aria-hidden="true" />
              Dynamic approval node tracking, balances & timeline records
            </p>
          </div>
        </div>
        
        {/* ACTION BUTTON */}
        <button 
          onClick={handleOpenSubmitDialog}
          className="bg-[#212c46] text-[#b7a159] hover:bg-[#2e3b5a] hover:text-white px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-[#212c46]/20 shadow-md active:scale-95 cursor-pointer self-start md:self-auto"
          id="btn-file-leave"
        >
          <PlusCircle size={16} strokeWidth={2.5} /> File Staff Leave Request
        </button>
      </div>

      {/* STATS DECK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="leave-stats-row">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-[#212c46] rounded-xl flex items-center justify-center">
            <CalendarDays size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#7a8b95]">Total Leave Cases</p>
            <h4 className="text-2xl font-black text-[#212c46] mt-0.5">{statistics.total}</h4>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Clock size={20} className="animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Pending Actions</p>
            <h4 className="text-2xl font-black text-[#212c46] mt-0.5">{statistics.pending}</h4>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Approved Absences</p>
            <h4 className="text-2xl font-black text-[#212c46] mt-0.5">{statistics.approved}</h4>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
            <XCircle size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Rejected Requests</p>
            <h4 className="text-2xl font-black text-[#212c46] mt-0.5">{statistics.rejected}</h4>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-slate-205 gap-2" id="leave-tabs-navigation">
        <button
          onClick={() => setActiveTab('registry')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'registry'
              ? 'border-[#212c46] text-[#212c46] font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Timeline & Approvals
        </button>
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'border-[#212c46] text-[#212c46] font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Leave Overview Dashboard
        </button>
        <button
          onClick={() => setActiveTab('team-calendar')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'team-calendar'
              ? 'border-[#212c46] text-[#212c46] font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Team Leave Calendar (ปฏิทินตรวจเช็ค Staffing Gaps)
        </button>
      </div>

      {activeTab === 'registry' && (
        /* CORE SPLIT: LEFT TIMELINE & TRACK BALANCES, RIGHT ACTIVE DIRECTORY LIST */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: ACTIVE WORKER SELECTOR, BALANCES AND THE BRAND-NEW DETAILED HISTORICAL TIMELINE */}
          <div className="lg:col-span-1 space-y-5">
            
            {/* 1. TIMELINE CONTROLLING PANEL (WORKER FOCUS) */}
            <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <User size={18} className="text-[#3f809e]" />
                <div>
                  <h3 className="text-xs font-black uppercase text-[#212c46] tracking-wider">Leave Timeline Focus (HR Audit)</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Select workspace member to analyze</p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Select control */}
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider block mb-1">Company Staff Member</label>
                  <select
                    value={focusedEmployeeId}
                    onChange={(e) => setFocusedEmployeeId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#212c46] outline-none cursor-pointer focus:border-[#3f809e] focus:bg-white transition-all shadow-inner animate-none"
                  >
                    {employees.map((emp) => (
                      <option key={emp.employeeId || emp.id} value={emp.employeeId || emp.id}>
                        {emp.name} ({emp.employeeId || 'No Code'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Current chosen details */}
                {focusedEmployeeObj && (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                      <img 
                        src={focusedEmployeeObj.avatar || 'https://drive.google.com/thumbnail?id=1Z_fRbN9S4aA7OkHb3mlim_t60wIT4huY&sz=w400'} 
                        alt={focusedEmployeeObj.name}
                        className="w-10 h-10 rounded-xl object-cover shrink-0 select-none border border-slate-200"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-[#212c46] truncate leading-tight">{focusedEmployeeObj.name}</p>
                        <p className="text-[9px] font-extrabold text-slate-400 leading-none mt-1">
                          {focusedEmployeeObj.position || 'Specialist'}
                        </p>
                        <span className="inline-block mt-1 px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 text-[8px] font-black text-[#3f809e] uppercase tracking-widest rounded animate-none">
                          {focusedEmployeeObj.department}
                        </span>
                      </div>
                    </div>

                    {/* Exceeded warning banner directly in sidebar */}
                    {(() => {
                      const sidebarQuota = getEmployeeQuotaStatus(
                        focusedEmployeeObj.name || '',
                        focusedEmployeeObj.employeeId || focusedEmployeeObj.id || '',
                        leaves
                      );
                      if (sidebarQuota.exceeded) {
                        return (
                          <div className="p-2.5 bg-rose-50 border border-rose-150 rounded-xl flex items-center gap-2 text-[10px] text-rose-700 font-extrabold animate-pulse">
                            <AlertCircle size={14} className="text-rose-500 shrink-0" />
                            <span>Exceeded Annual Cap: {sidebarQuota.exceededText}</span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* 2. SPECIFIC BALANCES CAP */}
            <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase text-[#212c46] tracking-wider flex items-center gap-1">
                <TrendingUp size={14} className="text-[#b58c4f]" /> Available Allowances
              </h3>
              
              <div className="space-y-4">
                {personalLeaveAllowances.map((allowed) => {
                  const percentLeft = (allowed.left / allowed.cap) * 100;
                  return (
                    <div key={allowed.type} className="space-y-1.5" id={`balance-bar-${allowed.type.toLowerCase().replace(/\s+/g, '-')}`}>
                      <div className="flex justify-between items-center text-[10px] font-black uppercase">
                        <span className="text-slate-600 flex items-center gap-1">{allowed.label}</span>
                        <span className="text-[#212c46] tracking-tight">{allowed.left} / {allowed.cap} Left</span>
                      </div>
                      {/* Visual Bar */}
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${percentLeft}%` }}
                           transition={{ duration: 0.8, ease: 'easeOut' }}
                           className={`h-full ${allowed.barStyle} rounded-full`}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Consumed: {allowed.used} days</span>
                        <span>Total allowance: {allowed.cap} days</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ONLINE LEAVE SUBMISSION SHARE CARD (ต้องการ link + QR Code ให้พนักงานสามารถส่งใบลาออนไลน์ได้) */}
            <div className="bg-gradient-to-br from-[#212c46] to-[#2d3a58] rounded-2xl border border-[#3f809e]/30 p-5 shadow-lg text-white space-y-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <div className="p-1.5 bg-[#b7a159]/20 text-[#b7a159] rounded-xl">
                  <UserCheck size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase text-white tracking-wider">Online Employee Leave Portal</h3>
                  <p className="text-[9px] text-[#b7a159] font-bold uppercase tracking-wider">ลิงก์ & QR Code สำหรับให้พนักงานยื่นใบลาส่งทางออนไลน์</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                {/* QR Code Container */}
                <div className="bg-white p-2.5 rounded-xl border-2 border-[#b7a159]/50 shadow-inner">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '/leave')}`}
                    alt="Leave Form QR Code"
                    className="w-32 h-32 select-none"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <p className="text-[8.5px] font-extrabold text-slate-300 uppercase tracking-widest text-center leading-normal">
                  สแกนเพื่อเข้าสู่ระบบบยื่นใบลาด้วยตนเอง (Staff Portal)
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-[#b7a159] tracking-wider block">คัดลอกลิงก์แชร์ผ่านแชทกลุ่มบริษัท (Shareable Link)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/leave`}
                    className="flex-1 bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none select-all"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/leave`);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                      MySwal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'คัดลอกลิงก์สำเร็จแล้ว!',
                        showConfirmButton: false,
                        timer: 1500
                      });
                    }}
                    className="px-3 bg-[#b7a159] hover:bg-[#caba79] text-[#212c46] rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer"
                    title="Copy Link"
                  >
                    {copiedLink ? <Check size={14} strokeWidth={3} /> : <Copy size={14} strokeWidth={3} />}
                  </button>
                </div>
              </div>
            </div>

            {/* 3. HISTORICAL LEAVE REQUEST TIMELINE */}
            <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-sm space-y-4" id="leave-historical-timeline-widget">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-slate-500" />
                  <div>
                    <h3 className="text-xs font-black uppercase text-[#212c46] tracking-wider">Leave Timeline History</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Lifecycle flow of leave decisions</p>
                  </div>
                </div>
                <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                  {focusedEmployeeLeavesTimeline.length} Total
                </span>
              </div>

              {/* Visual Timeline component list */}
              {isLoading ? (
                <div className="space-y-4 py-8 animate-pulse text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase">Synchronizing with timeline nodes...</p>
                </div>
              ) : focusedEmployeeLeavesTimeline.length === 0 ? (
                <div className="text-center py-10 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-150">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">No leave applications lodged</p>
                  <p className="text-[9px] text-slate-300 font-bold uppercase mt-1 leading-relaxed px-5">
                    Lodging a new request will automatically boot its first timeline node.
                  </p>
                </div>
              ) : (
                <div className="relative pl-3 border-l border-slate-200 ml-2 space-y-6 pt-2 pb-2">
                  
                  {focusedEmployeeLeavesTimeline.map((item, index) => {
                    const mapObj = LEAVE_TYPE_MAP[item.type] || DEFAULT_MAP;
                    const TypeIconComponent = mapObj.icon;
                    const statusIsApproved = item.status === 'Approved';
                    const statusIsRejected = item.status === 'Rejected';
                    const statusIsPending = !statusIsApproved && !statusIsRejected;

                    return (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative"
                      >
                        {/* Sub-Timeline Bullet Node indicator */}
                        <div className={`absolute -left-[19.5px] top-1.5 w-3.5 h-3.5 rounded-full border-2 ${
                          statusIsApproved ? 'bg-emerald-500 border-white ring-4 ring-emerald-500/15' :
                          statusIsRejected ? 'bg-rose-500 border-white ring-4 ring-rose-500/15' :
                          'bg-amber-400 border-white ring-4 ring-amber-400/15'
                        }`} />

                        {/* Content details block */}
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-150 shadow-sm space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className={`inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${mapObj.bg} ${mapObj.color} ${mapObj.border}`}>
                                <TypeIconComponent size={10} />
                                {item.type}
                              </span>
                              <h4 className="text-[11px] font-extrabold text-[#212c46] mt-1">
                                {item.days} Day{item.days > 1 ? 's' : ''} Absence ({item.days} วัน)
                              </h4>
                            </div>
                            
                            {/* Node Outcome Badge */}
                            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                              statusIsApproved ? 'bg-emerald-100 text-emerald-800' :
                              statusIsRejected ? 'bg-rose-100 text-rose-800' :
                              'bg-amber-100 text-amber-805'
                            }`}>
                              {item.status}
                            </span>
                          </div>

                          {/* Request parameters display */}
                          <div className="text-[10px] text-slate-500 font-bold space-y-1">
                            <p className="flex items-center gap-1 font-mono uppercase tracking-tight">
                              <span className="text-slate-400">Duration:</span>
                              <span className="text-[#212c46]">{item.start}</span>
                              <ArrowRight size={10} className="text-slate-400" />
                              <span className="text-[#212c46]">{item.end}</span>
                            </p>
                            <p className="italic text-slate-400 text-[9px] line-clamp-2">
                              "{item.reason || 'No statement provided'}"
                            </p>
                          </div>

                          {/* Lifecycle step tracker */}
                          <div className="pt-2 border-t border-slate-200/60 text-[8px] font-black uppercase tracking-wider space-y-1.5">
                            <div className="flex items-center gap-1.5 text-emerald-600">
                              <CheckCircle size={10} />
                              <span>Node 1: Request Submitted</span>
                            </div>

                            <div className={`flex items-center gap-1.5 ${statusIsPending ? 'text-amber-500 animate-pulse' : 'text-emerald-600'}`}>
                              {statusIsPending ? <Clock size={10} /> : <CheckCircle size={10} />}
                              <span>Node 2: Under HR Compliance Review</span>
                            </div>

                            <div className={`flex items-center gap-1.5 ${
                              statusIsApproved ? 'text-emerald-600' :
                              statusIsRejected ? 'text-rose-600' :
                              'text-slate-300'
                            }`}>
                              {statusIsApproved ? <CheckCircle size={10} /> : statusIsRejected ? <XCircle size={10} /> : <Clock size={10} />}
                              <span>Node 3: {statusIsApproved ? 'Approved & Balances Deducted' : statusIsRejected ? 'Rejected & Closed' : 'Awaiting Final Signature'}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: DETAILED SYSTEM LEAVE DATABASE TABLE WITH ROBUST CRITERIA FILTERS */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* DATABASE CONTROL FILTERING PANEL */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4" id="leave-search-filters">
              <h3 className="text-xs font-black uppercase text-[#212c46] tracking-wider flex items-center gap-1.5">
                <Filter size={14} className="text-[#3f809e]" /> Database Filtering Matrix
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Search text query */}
                <div className="sm:col-span-1">
                  <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider block mb-1">Search Keywords</label>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search name, description, ID..."
                      value={searchEmployeeQuery}
                      onChange={(e) => setSearchEmployeeQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#3f809e] transition-all"
                    />
                  </div>
                </div>

                {/* Custom Premium Department Dropdown */}
                <div className="relative">
                  <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                    Department
                  </label>
                  
                  {/* Trigger Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistryDeptOpen(!isRegistryDeptOpen);
                      setIsRegistryTypeOpen(false); // Close other
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#3f809e] transition-all flex items-center justify-between cursor-pointer select-none"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      {(() => {
                        const selectedObj = departmentsList.find(d => d.value === selectedDept) || departmentsList[0];
                        const ActiveIcon = selectedObj.icon;
                        return (
                          <>
                            <span className={`p-1 rounded-md text-white ${selectedObj.bg || 'bg-slate-500'}`}>
                              <ActiveIcon size={12} />
                            </span>
                            <span className="font-extrabold text-[#212c46] truncate">{selectedObj.label}</span>
                          </>
                        );
                      })()}
                    </span>
                    <span className="flex items-center gap-1.5 ml-2">
                      <span className="px-1.5 py-0.5 bg-slate-200/75 text-[#212c46] text-[8px] font-extrabold rounded">
                        {getDeptCount(selectedDept)}
                      </span>
                      <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isRegistryDeptOpen ? 'rotate-180' : ''}`} />
                    </span>
                  </button>

                  {/* Backdrop close overlay */}
                  {isRegistryDeptOpen && (
                    <div className="fixed inset-0 z-20" onClick={() => setIsRegistryDeptOpen(false)} />
                  )}

                  {/* Dropdown Options */}
                  <AnimatePresence>
                    {isRegistryDeptOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.12 }}
                        className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-250 rounded-xl shadow-xl z-30 overflow-hidden max-h-60 overflow-y-auto"
                      >
                        <div className="p-1.5 space-y-1">
                          {departmentsList.map((dept) => {
                            const isSelected = selectedDept === dept.value;
                            const OptionIcon = dept.icon;
                            const count = getDeptCount(dept.value);
                            return (
                              <button
                                key={dept.value}
                                type="button"
                                onClick={() => {
                                  setSelectedDept(dept.value);
                                  setIsRegistryDeptOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                  isSelected 
                                    ? 'bg-[#212c46] text-white font-extrabold shadow-sm' 
                                    : 'text-[#212c46] hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span className={`p-1 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    <OptionIcon size={12} />
                                  </span>
                                  <span className="truncate">{dept.label}</span>
                                </div>
                                <span className={`px-1.5 py-0.5 text-[8.5px] font-black rounded ${
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

                {/* Custom Premium Leave Type Dropdown */}
                <div className="relative">
                  <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                    Absence Type
                  </label>
                  
                  {/* Trigger Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistryTypeOpen(!isRegistryTypeOpen);
                      setIsRegistryDeptOpen(false); // Close other
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#3f809e] transition-all flex items-center justify-between cursor-pointer select-none"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      {(() => {
                        const selectedObj = typesList.find(t => t.value === selectedType) || typesList[0];
                        const ActiveIcon = selectedObj.icon;
                        return (
                          <>
                            <span className={`p-1 rounded-md text-white ${selectedObj.bg || 'bg-slate-500'}`}>
                              <ActiveIcon size={12} />
                            </span>
                            <span className="font-extrabold text-[#212c46] truncate">{selectedObj.label}</span>
                          </>
                        );
                      })()}
                    </span>
                    <span className="flex items-center gap-1.5 ml-2">
                      <span className="px-1.5 py-0.5 bg-slate-200/75 text-[#212c46] text-[8px] font-extrabold rounded">
                        {getTypeCount(selectedType)}
                      </span>
                      <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isRegistryTypeOpen ? 'rotate-180' : ''}`} />
                    </span>
                  </button>

                  {/* Backdrop close overlay */}
                  {isRegistryTypeOpen && (
                    <div className="fixed inset-0 z-20" onClick={() => setIsRegistryTypeOpen(false)} />
                  )}

                  {/* Dropdown Options */}
                  <AnimatePresence>
                    {isRegistryTypeOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.12 }}
                        className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-250 rounded-xl shadow-xl z-30 overflow-hidden max-h-60 overflow-y-auto"
                      >
                        <div className="p-1.5 space-y-1">
                          {typesList.map((type) => {
                            const isSelected = selectedType === type.value;
                            const OptionIcon = type.icon;
                            const count = getTypeCount(type.value);
                            return (
                              <button
                                key={type.value}
                                type="button"
                                onClick={() => {
                                  setSelectedType(type.value);
                                  setIsRegistryTypeOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                  isSelected 
                                    ? 'bg-[#212c46] text-white font-extrabold shadow-sm' 
                                    : 'text-[#212c46] hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span className={`p-1 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    <OptionIcon size={12} />
                                  </span>
                                  <span className="truncate">{type.label}</span>
                                </div>
                                <span className={`px-1.5 py-0.5 text-[8.5px] font-black rounded ${
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

                {/* Select Status */}
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider block mb-1">Approval Stage</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#3f809e] cursor-pointer"
                  >
                    <option value="All">All Stages</option>
                    <option value="Pending HR Approval">Pending HR Approval</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ACTIVE SYSTEM DATABASE TABLE */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="leave-database-results-panel">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h4 className="text-xs font-black uppercase text-[#212c46] tracking-wider">Leave Applications Registry</h4>
                  <p className="text-[9px] text-[#7a8b95] font-bold uppercase mt-0.5">
                    Discovered {filteredSystemLeaves.length} matching application entries
                  </p>
                </div>
                
                {/* NEW FUNCTIONAL EXPORT OPTIONS */}
                <button 
                  onClick={handleExportAllLeavesCsv}
                  className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-250 rounded-lg text-[9px] font-black uppercase tracking-wider text-emerald-800 hover:text-white hover:bg-emerald-600 transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                >
                  <FileSpreadsheet size={11} /> Export Year CSV
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans border-collapse">
                  <thead className="bg-[#212c46] text-[#eaeaec] border-b border-slate-200 text-[10px] font-black uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-5">Reg ID</th>
                      <th className="py-3 px-5">Employee Info</th>
                      <th className="py-3 px-5">Leave Category</th>
                      <th className="py-3 px-5">Duration (Days)</th>
                      <th className="py-3 px-5">Quotas Check</th>
                      <th className="py-3 px-5">Approval Stage</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {filteredSystemLeaves.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center text-slate-400 font-extrabold uppercase tracking-widest text-[10px]">
                          No synchronized leave request rows detected
                        </td>
                      </tr>
                    ) : (
                      filteredSystemLeaves.map((l) => {
                        const mapObj = LEAVE_TYPE_MAP[l.type] || DEFAULT_MAP;
                        const TypeIcon = mapObj.icon;
                        const isPending = l.status === 'Pending HR Approval' || l.status === 'Pending';
                        const quotaStatus = getEmployeeQuotaStatus(l.employeeName || '', l.employeeId || '', leaves);
                        
                        // Exceeded quotas high-light style row
                        const alertRowStyle = quotaStatus.exceeded 
                          ? 'bg-rose-50/50 hover:bg-rose-100/50 transition-colors border-l-4 border-l-rose-500' 
                          : 'hover:bg-slate-50 transition-colors';

                        return (
                          <tr key={l.id} className={alertRowStyle}>
                            <td className="py-3 px-5 font-mono text-[10px] font-bold text-slate-400">
                              {l.id}
                            </td>
                            <td className="py-3 px-5">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-extrabold text-[#212c46] uppercase select-none border border-slate-200">
                                  {l.employeeName?.substring(0, 2)}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-extrabold text-[#212c46] truncate leading-normal">{l.employeeName}</p>
                                  <p className="text-[8px] font-black uppercase tracking-wider text-slate-400 leading-none mt-0.5">
                                    {l.department || 'Operations'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-5">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase border mb-0.5 ${mapObj.bg} ${mapObj.color} ${mapObj.border}`}>
                                <TypeIcon size={10} />
                                {l.type}
                              </span>
                            </td>
                            <td className="py-3 px-5">
                              <div className="font-extrabold text-slate-700">
                                {l.days} {l.days > 1 ? 'Days' : 'Day'} <span className="text-[10px] text-slate-400">({l.days} วัน)</span>
                              </div>
                              <p className="text-[8px] font-bold font-mono text-[#7a8b95] tracking-tight mt-0.5">
                                {l.start} ➡ {l.end}
                              </p>
                            </td>
                            <td className="py-3 px-5">
                              {quotaStatus.exceeded ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-50 border border-rose-200 text-rose-700 animate-pulse">
                                  <ShieldAlert size={11} className="text-rose-550" />
                                  {quotaStatus.exceededText}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 border border-emerald-150 text-emerald-700">
                                  <CheckCircle size={10} />
                                  Normal Allowance
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-5">
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                l.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                l.status === 'Rejected' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                                'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}>
                                <span className={`w-1 h-1 rounded-full ${
                                  l.status === 'Approved' ? 'bg-emerald-500' :
                                  l.status === 'Rejected' ? 'bg-rose-500' :
                                  'bg-amber-500'
                                }`} />
                                {l.status}
                              </span>
                            </td>
                            <td className="py-3 px-5 text-right">
                              {isPending ? (
                                <div className="inline-flex gap-1.5">
                                  <button
                                    onClick={() => handleApproveReject(l.id, 'Approved')}
                                    className="px-2 py-1 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-700 rounded text-[9px] font-black uppercase cursor-pointer transition-all"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleApproveReject(l.id, 'Rejected')}
                                    className="px-2 py-1 bg-rose-50 border border-rose-300 hover:bg-rose-100 text-rose-600 rounded text-[9px] font-black uppercase cursor-pointer transition-all"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded border border-slate-150">
                                  Closed Entry
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        /* COMPREHENSIVE SORTABLE & FILTERABLE LEAVE OVERVIEW DASHBOARD */
        <div className="space-y-4 animate-fadeIn pb-6" id="leave-overview-dashboard-widget">
          
          {/* SEARCH & FILTERS CONTROLS CARD */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-wrap gap-4">
              <h3 className="text-xs font-black uppercase text-[#212c46] tracking-wider flex items-center gap-1.5">
                <ClipboardList size={14} className="text-[#3f809e]" /> Consolidated Workspace Filters
              </h3>
              
              {/* PRIMARY CSV EXPORT ACTION BUTTON */}
              <button 
                onClick={handleExportAllLeavesCsv}
                className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/10 cursor-pointer self-start sm:self-auto"
              >
                <FileSpreadsheet size={14} /> Export Current Year to CSV
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Search input text */}
              <div>
                <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider block mb-1">Employee Search</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name, statement, ID..."
                    value={searchEmployeeQuery}
                    onChange={(e) => setSearchEmployeeQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#3f809e] transition-all"
                  />
                </div>
              </div>

              {/* Custom Premium Department Dropdown */}
              <div className="relative">
                <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                  Department
                </label>
                
                {/* Trigger Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsOverviewDeptOpen(!isOverviewDeptOpen);
                    setIsOverviewTypeOpen(false); // Close other
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#3f809e] transition-all flex items-center justify-between cursor-pointer select-none"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    {(() => {
                      const selectedObj = departmentsList.find(d => d.value === selectedDept) || departmentsList[0];
                      const ActiveIcon = selectedObj.icon;
                      return (
                        <>
                          <span className={`p-1 rounded-md text-white ${selectedObj.bg || 'bg-slate-500'}`}>
                            <ActiveIcon size={12} />
                          </span>
                          <span className="font-extrabold text-[#212c46] truncate">{selectedObj.label}</span>
                        </>
                      );
                    })()}
                  </span>
                  <span className="flex items-center gap-1.5 ml-2">
                    <span className="px-1.5 py-0.5 bg-slate-200/75 text-[#212c46] text-[8px] font-extrabold rounded">
                      {getDeptCount(selectedDept)}
                    </span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOverviewDeptOpen ? 'rotate-180' : ''}`} />
                  </span>
                </button>

                {/* Backdrop close overlay */}
                {isOverviewDeptOpen && (
                  <div className="fixed inset-0 z-20" onClick={() => setIsOverviewDeptOpen(false)} />
                )}

                {/* Dropdown Options */}
                <AnimatePresence>
                  {isOverviewDeptOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.12 }}
                      className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-250 rounded-xl shadow-xl z-30 overflow-hidden max-h-60 overflow-y-auto"
                    >
                      <div className="p-1.5 space-y-1">
                        {departmentsList.map((dept) => {
                          const isSelected = selectedDept === dept.value;
                          const OptionIcon = dept.icon;
                          const count = getDeptCount(dept.value);
                          return (
                            <button
                              key={dept.value}
                              type="button"
                              onClick={() => {
                                setSelectedDept(dept.value);
                                setIsOverviewDeptOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                isSelected 
                                  ? 'bg-[#212c46] text-white font-extrabold shadow-sm' 
                                  : 'text-[#212c46] hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className={`p-1 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                  <OptionIcon size={12} />
                                </span>
                                <span className="truncate">{dept.label}</span>
                              </div>
                              <span className={`px-1.5 py-0.5 text-[8.5px] font-black rounded ${
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

              {/* Custom Premium Leave Type Dropdown */}
              <div className="relative">
                <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                  Leave Category
                </label>
                
                {/* Trigger Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsOverviewTypeOpen(!isOverviewTypeOpen);
                    setIsOverviewDeptOpen(false); // Close other
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#3f809e] transition-all flex items-center justify-between cursor-pointer select-none"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    {(() => {
                      const selectedObj = typesList.find(t => t.value === selectedType) || typesList[0];
                      const ActiveIcon = selectedObj.icon;
                      return (
                        <>
                          <span className={`p-1 rounded-md text-white ${selectedObj.bg || 'bg-slate-500'}`}>
                            <ActiveIcon size={12} />
                          </span>
                          <span className="font-extrabold text-[#212c46] truncate">{selectedObj.label}</span>
                        </>
                      );
                    })()}
                  </span>
                  <span className="flex items-center gap-1.5 ml-2">
                    <span className="px-1.5 py-0.5 bg-slate-200/75 text-[#212c46] text-[8px] font-extrabold rounded">
                      {getTypeCount(selectedType)}
                    </span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOverviewTypeOpen ? 'rotate-180' : ''}`} />
                  </span>
                </button>

                {/* Backdrop close overlay */}
                {isOverviewTypeOpen && (
                  <div className="fixed inset-0 z-20" onClick={() => setIsOverviewTypeOpen(false)} />
                )}

                {/* Dropdown Options */}
                <AnimatePresence>
                  {isOverviewTypeOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.12 }}
                      className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-250 rounded-xl shadow-xl z-30 overflow-hidden max-h-60 overflow-y-auto"
                    >
                      <div className="p-1.5 space-y-1">
                        {typesList.map((type) => {
                          const isSelected = selectedType === type.value;
                          const OptionIcon = type.icon;
                          const count = getTypeCount(type.value);
                          return (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => {
                                setSelectedType(type.value);
                                setIsOverviewTypeOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                isSelected 
                                  ? 'bg-[#212c46] text-white font-extrabold shadow-sm' 
                                  : 'text-[#212c46] hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className={`p-1 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                  <OptionIcon size={12} />
                                </span>
                                <span className="truncate">{type.label}</span>
                              </div>
                              <span className={`px-1.5 py-0.5 text-[8.5px] font-black rounded ${
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

              {/* Status Selector */}
              <div>
                <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider block mb-1">Approval Stage</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#3f809e] cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending HR Approval">Pending HR Approval</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* SINGLE SORTABLE INTERACTIVE TABLE CONTAINER */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-[#212c46] text-white flex justify-between items-center flex-wrap gap-4 border-b border-slate-250">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#b7a159]">Unified Leave Overview Registry</h4>
                <p className="text-[9px] text-slate-350 font-bold uppercase mt-0.5">
                  Consolidated {sortedFilteredLeaves.length} matching rows. Click headers to toggle sorting order.
                </p>
              </div>
              <div className="text-[8px] font-black tracking-widest uppercase bg-white/10 px-3 py-1 rounded-full border border-white/10 text-[#b7a159]">
                Interactive Sorting Matrix
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans border-collapse">
                <thead className="bg-[#121c33] text-[#eaeaec] border-b border-slate-200 text-[10px] font-black uppercase tracking-wider select-none">
                  <tr>
                    <th onClick={() => handleOverviewSort('id')} className="py-3 px-5 cursor-pointer hover:bg-white/10 transition-colors">
                      Reg ID {renderSortIcon('id')}
                    </th>
                    <th onClick={() => handleOverviewSort('employeeName')} className="py-3 px-5 cursor-pointer hover:bg-white/10 transition-colors">
                      Employee Info {renderSortIcon('employeeName')}
                    </th>
                    <th onClick={() => handleOverviewSort('department')} className="py-3 px-5 cursor-pointer hover:bg-white/10 transition-colors">
                      Department {renderSortIcon('department')}
                    </th>
                    <th onClick={() => handleOverviewSort('type')} className="py-3 px-5 cursor-pointer hover:bg-white/10 transition-colors">
                      Leave Type {renderSortIcon('type')}
                    </th>
                    <th onClick={() => handleOverviewSort('days')} className="py-3 px-5 cursor-pointer hover:bg-white/10 transition-colors">
                      Duration {renderSortIcon('days')}
                    </th>
                    <th className="py-3 px-5">
                      Description Statement
                    </th>
                    <th onClick={() => handleOverviewSort('status')} className="py-3 px-5 cursor-pointer hover:bg-white/10 transition-colors">
                      Approval Stage {renderSortIcon('status')}
                    </th>
                    <th className="py-3 px-5">
                      Quota Limit Warning
                    </th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {sortedFilteredLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-20 text-center text-slate-400 font-black uppercase tracking-widest text-[10px] bg-slate-50/50">
                        No leave records mapped to current selection criteria
                      </td>
                    </tr>
                  ) : (
                    sortedFilteredLeaves.map((l) => {
                      const mapObj = LEAVE_TYPE_MAP[l.type] || DEFAULT_MAP;
                      const TypeIcon = mapObj.icon;
                      const isPending = l.status === 'Pending HR Approval' || l.status === 'Pending';
                      const quotaStatus = getEmployeeQuotaStatus(l.employeeName || '', l.employeeId || '', leaves);

                      // Red background highlight warning for exceeded leaves
                      const rowStyle = quotaStatus.exceeded
                        ? 'bg-rose-50/55 hover:bg-rose-100/50 border-l-4 border-l-rose-500 font-medium transition-all'
                        : 'hover:bg-slate-50 transition-colors';

                      return (
                        <tr key={l.id} className={rowStyle}>
                          <td className="py-3.5 px-5 font-mono text-[10px] font-bold text-slate-400">
                            {l.id}
                          </td>
                          <td className="py-3.5 px-5">
                            <p className="font-extrabold text-[#212c46] leading-tight">{l.employeeName}</p>
                            <span className="text-[9px] font-extrabold text-slate-400 font-mono tracking-tight block mt-0.5">
                              ID: {l.employeeId || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-[11px] font-bold text-slate-600">
                            {l.department || 'Operations'}
                          </td>
                          <td className="py-3.5 px-5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase border ${mapObj.bg} ${mapObj.color} ${mapObj.border}`}>
                              <TypeIcon size={10} />
                              {l.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="font-extrabold text-[#212c46] text-xs">
                              {l.days} {l.days > 1 ? 'Days' : 'Day'} <span className="text-[9px] text-slate-400 font-bold">({l.days} วัน)</span>
                            </div>
                            <span className="text-[9px] font-bold font-mono text-slate-400 block mt-0.5">
                              {l.start} ➡ {l.end}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 max-w-xs">
                            <p className="text-[10px] text-slate-500 font-semibold italic truncate" title={l.reason}>
                              "{l.reason || 'No statement provided'}"
                            </p>
                          </td>
                          <td className="py-3.5 px-5">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                              l.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                              l.status === 'Rejected' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                              'bg-amber-100 text-amber-801 border border-amber-200'
                            }`}>
                              <span className={`w-1 h-1 rounded-full ${
                                l.status === 'Approved' ? 'bg-emerald-500' :
                                l.status === 'Rejected' ? 'bg-rose-500' :
                                'bg-amber-500'
                              }`} />
                              {l.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            {quotaStatus.exceeded ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-50 border border-rose-200 text-rose-700 animate-pulse">
                                  <ShieldAlert size={10} className="text-rose-500" />
                                  Quota Exceeded
                                </span>
                                <span className="block text-[8px] font-semibold text-rose-600/90 font-mono">
                                  {quotaStatus.exceededText}
                                </span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 border border-emerald-100 text-emerald-700">
                                <CheckCircle size={9} />
                                Compliant (ปกติ)
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            {isPending ? (
                              <div className="inline-flex gap-1">
                                <button
                                  onClick={() => handleApproveReject(l.id, 'Approved')}
                                  className="px-2 py-1 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-700 rounded text-[9px] font-black uppercase cursor-pointer transition-all"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleApproveReject(l.id, 'Rejected')}
                                  className="px-2 py-1 bg-rose-50 border border-rose-300 hover:bg-rose-100 text-rose-600 rounded text-[9px] font-black uppercase cursor-pointer transition-all"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-150 uppercase tracking-wide">
                                Locked
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'team-calendar' && (
        <div className="space-y-6 animate-fadeIn pb-6" id="team-leave-calendar-widget">
          
          {/* CALENDAR CONTROLS HEADER */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#212c46]/10 text-[#212c46] rounded-xl">
                <CalendarDays size={20} />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase text-[#212c46] tracking-wider">Team Leave Calendar (ปฏิทินตรวจเช็คอัตรากำลังพล)</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wide">
                    Synced with Main Calendar (เชื่อมโยงกับปฏิทินตารางหลักเรียบร้อยแล้ว)
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() - 1, 1))}
                className="p-2 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer text-slate-600"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-black text-[#212c46] uppercase px-3 text-center min-w-[170px] select-none font-sans">
                {calDate.toLocaleString('th-TH', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() + 1, 1))}
                className="p-2 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer text-slate-600"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setCalDate(new Date())}
                className="ml-2 px-3.5 py-2 hover:bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all text-[#212c46] cursor-pointer"
              >
                Today
              </button>
            </div>
          </div>

          {/* DYNAMIC STAFFING GAPS AUDIT SUMMARY SHEET */}
          {(() => {
            const currentYear = calDate.getFullYear();
            const currentMonth = calDate.getMonth();
            
            let totalGapsInMonth = 0;
            const gapsMap: { [dateStr: string]: Array<{ dept: string; names: string[] }> } = {};

            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            for (let d = 1; d <= daysInMonth; d++) {
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              const dayLeaves = leaves.filter(l => l.status === 'Approved' && dateStr >= l.start && dateStr <= l.end);
              
              const deptCounts: { [dept: string]: string[] } = {};
              dayLeaves.forEach(l => {
                const emp = employees.find(e => e.name === l.employeeName || e.employeeId === l.employeeId || e.id === l.employeeId);
                const dept = l.department || emp?.department || 'Operations';
                if (!deptCounts[dept]) deptCounts[dept] = [];
                deptCounts[dept].push(l.employeeName || 'Unknown Employee');
              });

              const dayGaps: Array<{ dept: string; names: string[] }> = [];
              Object.keys(deptCounts).forEach(dept => {
                if (deptCounts[dept].length >= 2) {
                  dayGaps.push({ dept, names: deptCounts[dept] });
                  totalGapsInMonth++;
                }
              });

              if (dayGaps.length > 0) {
                gapsMap[dateStr] = dayGaps;
              }
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Gaps Overview Card */}
                <div className="md:col-span-1 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3.5">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <ShieldAlert size={18} className={totalGapsInMonth > 0 ? "text-rose-500 animate-pulse" : "text-emerald-500"} />
                    <div>
                      <h4 className="text-xs font-black uppercase text-[#212c46] tracking-wider">Gap Threat Audit Matrix</h4>
                      <p className="text-[9px] text-[#7a8b95] font-bold uppercase">Monthly staffing bottleneck analyzer</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl text-center space-y-1.5 bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gaps Detected This Month</p>
                    <h5 className={`text-4xl font-black ${totalGapsInMonth > 0 ? "text-rose-600 animate-bounce" : "text-emerald-600"}`}>
                      {totalGapsInMonth}
                    </h5>
                    <p className="text-[9px] font-black text-slate-500 uppercase leading-relaxed px-2">
                      {totalGapsInMonth > 0 
                        ? "⚠️ มีวันที่มีทีมงานแผนกเดียวกันลากรณีพิเศษซ้อนทับกันเกิน 2 คนขึ้นไป" 
                        : "✅ กำลังพลจัดตั้งสมบูรณ์แบบ ไม่มีข้อบกพร่องตามเป้าหมายของบริษัท"
                      }
                    </p>
                  </div>

                  <div className="text-[9px] bg-amber-50/55 border border-amber-100 p-3 rounded-xl text-[#7e601c] font-semibold leading-relaxed">
                    <p className="font-extrabold text-[10px] uppercase text-[#7e601c] mb-1">💡 What defines a Staffing Gap?</p>
                    ระบบจะคำนวณและแจ้งเตือนภัยคุกคักกำลังผลอัตโนมัติ (Staffing Gap) ณ วันใดก็ตามที่มีสมาชิกแผนกเดียวกันตั้งแต่ 2 คนขึ้นไปลาพร้อมกัน ทำให้เกิดโอกาสงานสะดุดได้ค่ะ
                  </div>
                </div>

                {/* 2. List of Detected Gaps for Quick Management */}
                <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3.5 flex flex-col">
                  <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                    <div className="flex items-center gap-2">
                      <ClipboardList size={16} className="text-[#3f809e]" />
                      <div>
                        <h4 className="text-xs font-black uppercase text-[#212c46] tracking-wider">Staffing Gap Timeline & Actions</h4>
                        <p className="text-[9px] text-[#7a8b95] font-bold uppercase">Critical overlaps required manager oversight</p>
                      </div>
                    </div>
                    {totalGapsInMonth > 0 && (
                      <span className="text-[8px] font-black tracking-widest bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full uppercase border border-rose-100">
                        Requires Attention
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[220px] flex-1 pr-1">
                    {Object.keys(gapsMap).length === 0 ? (
                      <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center text-slate-400">
                        <CheckCircle size={32} className="text-emerald-500 mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#212c46]">No Bottlenecks Found</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 leading-relaxed">
                          All personnel timelines are perfectly balanced and secure.
                        </p>
                      </div>
                    ) : (
                      Object.keys(gapsMap).sort().map(dateStr => {
                        const dateObj = new Date(dateStr);
                        const formattedDate = dateObj.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
                        return (
                          <div key={dateStr} className="p-3 bg-rose-50/45 border border-rose-100 rounded-xl space-y-2 hover:bg-rose-100/30 transition-all">
                            <div className="flex justify-between items-center font-bold text-[10px] text-[#212c46]">
                              <span className="font-mono text-slate-400 font-bold">{dateStr}</span>
                              <span className="text-rose-700 font-extrabold">{formattedDate}</span>
                            </div>
                            <div className="space-y-1.5">
                              {gapsMap[dateStr].map((g, i) => (
                                <div key={i} className="text-[10px] font-semibold text-slate-700 font-sans">
                                  <div className="flex items-center gap-1 text-rose-800 font-black uppercase text-[9px] tracking-wide">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                                    <span>แผนก {g.dept}</span>
                                  </div>
                                  <p className="text-[9px] text-slate-500 font-bold mt-0.5 font-sans">
                                    ผู้ลาพร้อมกัน ({g.names.length} ท่าน): <span className="font-black text-rose-700">{g.names.join(', ')}</span>
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* THE MONTHLY GRID */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            
            {/* GRID HEADER (Seven Day Names) */}
            <div className="grid grid-cols-7 text-center border-b border-slate-100 bg-slate-50 select-none">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                <div 
                  key={day} 
                  className={`py-3 text-[10px] font-black uppercase tracking-widest ${
                    idx === 0 || idx === 6 ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* GRID DATE CELLS (6-row grid) */}
            <div className="grid grid-cols-7 divide-x divide-y divide-[#f1f5f9] bg-slate-100/25">
              {calendarDaysList.map((dayItem, index) => {
                const dayApprovedLeaves = getApprovedLeavesForDate(dayItem.date);
                
                // Group leaves by department for staffing gap threat flagging
                const dayDeptsMap: { [dept: string]: string[] } = {};
                dayApprovedLeaves.forEach(l => {
                  const emp = employees.find(e => e.name === l.employeeName || e.employeeId === l.employeeId || e.id === l.employeeId);
                  const dept = l.department || emp?.department || 'Operations';
                  if (!dayDeptsMap[dept]) dayDeptsMap[dept] = [];
                  dayDeptsMap[dept].push(l.employeeName || 'Staff Member');
                });

                let dayHasGap = false;
                let dayGapDepts: string[] = [];
                Object.keys(dayDeptsMap).forEach(dept => {
                  if (dayDeptsMap[dept].length >= 2) {
                    dayHasGap = true;
                    dayGapDepts.push(dept);
                  }
                });

                // Is today?
                const isToday = dayItem.date === new Date().toISOString().split('T')[0];

                return (
                  <div 
                    key={dayItem.key} 
                    className={`min-h-[140px] bg-white p-2 flex flex-col justify-between transition-all hover:bg-slate-50/70 relative ${
                      !dayItem.isCurrentMonth ? 'opacity-40 bg-slate-50/[0.15]' : ''
                    } ${isToday ? 'ring-2 ring-indigo-500 ring-inset shadow-md bg-indigo-50/10' : ''}`}
                  >
                    {/* Day number cell top bar */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-black tracking-tighter w-6 h-6 rounded-lg flex items-center justify-center font-mono ${
                        isToday 
                          ? 'bg-[#212c46] text-white font-extrabold' 
                          : 'text-slate-700 font-bold'
                      }`}>
                        {dayItem.dayNum}
                      </span>
                      
                      {dayItem.isCurrentMonth && dayApprovedLeaves.length > 0 && (
                        <span className="text-[8px] font-black text-[#3f809e] bg-[#3f809e]/10 border border-[#3f809e]/10 px-1.5 py-0.5 rounded-full uppercase font-mono select-none">
                          {dayApprovedLeaves.length} Active
                        </span>
                      )}
                    </div>

                    {/* Day approved leaves list cards */}
                    <div className="mt-2 flex-1 space-y-1.5 overflow-y-auto max-h-[85px] pr-0.5 custom-scrollbar">
                      {dayApprovedLeaves.map(leave => {
                        const mapObj = LEAVE_TYPE_MAP[leave.type] || DEFAULT_MAP;
                        const TypeIcon = mapObj.icon;
                        return (
                          <div
                            key={leave.id}
                            onClick={() => {
                              MySwal.fire({
                                title: `${leave.employeeName} (${leave.type})`,
                                html: `
                                  <div class="text-left text-xs space-y-2 font-sans pt-2">
                                    <p><strong>แผนก (Department):</strong> ${leave.department || 'Operations'}</p>
                                    <p><strong>ระยะเวลาลา (Period):</strong> ${leave.start} ถึง ${leave.end} (${leave.days} วัน)</p>
                                    <p><strong>เหตุผลการลา (Reason):</strong> ${leave.reason || 'ไม่ได้ระบุเหตุผล'}</p>
                                    <p><strong>สถานะความสอดคล้องโควตา:</strong> ${
                                      leaves.filter(x => x.employeeId === leave.employeeId && x.status === 'Approved').length > 15
                                        ? '<span class="text-rose-600 font-bold">Quota Over-limit Warning</span>'
                                        : '<span class="text-emerald-600 font-bold">Compliant / ภายในโควตาปกติ</span>'
                                    }</p>
                                  </div>
                                `,
                                icon: 'info',
                                confirmButtonColor: '#212c46'
                              });
                            }}
                            className={`p-1.5 rounded-lg border text-[9px] font-bold truncate cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${mapObj.bg} ${mapObj.color} ${mapObj.border} flex items-center gap-1`}
                            title={`${leave.employeeName} - ${leave.type}: ${leave.reason}`}
                          >
                            <TypeIcon size={10} className="shrink-0" />
                            <span className="truncate">{leave.employeeName}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Threat / Staffing GAP Warnings panel at the bottom of cell */}
                    {dayHasGap && (
                      <div 
                        className="mt-1.5 p-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-[8px] font-black uppercase tracking-wide flex items-center gap-1 cursor-pointer select-none"
                        onClick={() => {
                          MySwal.fire({
                            title: 'ภัยคุกคามกำลังพล (Staffing Gap Detected)',
                            text: `ในวันที่ ${dayItem.date} สำหรับแผนก: ${dayGapDepts.join(', ')} มีเจ้าหน้าที่ขอหยุดงานพร้อมกันมากกว่า 2 คนขึ้นไป อาจจะส่งผลให้กำลังพลฝ่ายผลิตหรือส่วนงานล่าช้าได้ค่ะ กรุณาตรวจสอบแผนการปฏิบัติการทดแทน`,
                            icon: 'warning',
                            confirmButtonColor: '#212c46'
                          });
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping inline-block shrink-0" />
                        <span className="truncate text-rose-800">Gap Alert: {dayGapDepts.join(', ')}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FORM MODAL COMPONENT */}
      <AnimatePresence>
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#212c46]/60 backdrop-blur-sm p-4" id="leave-form-modal">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200"
            >
              <div className="bg-[#212c46] px-6 py-5 flex items-center justify-between border-b-4 border-[#3f809e]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 text-[#b7a159] rounded-xl">
                    <PlusCircle size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Lodge Absence Request</h3>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-wider mt-0.5">Fill out your parameters honestly</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="p-1 px-2.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                {/* Employee pre-fill */}
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Employee Name (ชื่อ-นามสกุล) *</label>
                  <input
                    type="text"
                    required
                    value={newLeaveForm.employeeName}
                    onChange={(e) => setNewLeaveForm({ ...newLeaveForm, employeeName: e.target.value })}
                    className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#212c46] outline-none focus:border-[#3f809e] transition-all shadow-inner"
                    placeholder="e.g. Somchai Suksan"
                    readOnly={role === 'staff'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Department select */}
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Department *</label>
                    <select
                      value={newLeaveForm.department}
                      disabled={role === 'staff'}
                      onChange={(e) => setNewLeaveForm({ ...newLeaveForm, department: e.target.value })}
                      className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none text-[#212c46] disabled:opacity-75 cursor-pointer"
                    >
                      <option value="Human Resources">Human Resources (HR)</option>
                      <option value="Finance & Accounting">Finance & Accounting</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Production">Production (ฝ่ายผลิต)</option>
                      <option value="Logistics">Logistics (คลังและขนส่ง)</option>
                    </select>
                  </div>

                  {/* Type of absence */}
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Absence Category *</label>
                    <select
                      value={newLeaveForm.type}
                      onChange={(e) => setNewLeaveForm({ ...newLeaveForm, type: e.target.value })}
                      className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none text-[#212c46] cursor-pointer"
                    >
                      <option value="Vacation">Vacation (พักร้อน)</option>
                      <option value="Sick Leave">Sick Leave (ลาป่วย)</option>
                      <option value="Business Leave">Business Leave (ลากิจ)</option>
                      <option value="Personal Leave">Personal Leave (ลาส่วนตัว)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={newLeaveForm.start}
                      onChange={(e) => setNewLeaveForm({ ...newLeaveForm, start: e.target.value })}
                      className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none text-[#212c46] font-mono"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">End Date *</label>
                    <input
                      type="date"
                      required
                      value={newLeaveForm.end}
                      onChange={(e) => setNewLeaveForm({ ...newLeaveForm, end: e.target.value })}
                      className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none text-[#212c46] font-mono"
                    />
                  </div>
                </div>

                {/* Reason description */}
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Statement Reason (เหตุผลการลา) *</label>
                  <textarea
                    required
                    rows={3}
                    value={newLeaveForm.reason}
                    onChange={(e) => setNewLeaveForm({ ...newLeaveForm, reason: e.target.value })}
                    className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none text-[#212c46] resize-none"
                    placeholder="e.g. Taking annual relaxation leave / sick leave..."
                  />
                </div>

                {/* Real-time Quota Balance Validation Box */}
                {(() => {
                  const bc = getFormBalanceCalculations();
                  if (!bc.empName) return null;
                  return (
                    <div className={`p-4 rounded-2xl border ${bc.exceeded ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-900'} transition-all text-xs space-y-2`}>
                      <div className="flex justify-between items-center font-black uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <Activity size={13} className={bc.exceeded ? 'text-rose-600 animate-pulse' : 'text-emerald-600'} />
                          <span>สิทธิ์คงเหลือ & ยืนยันข้อมูล (Live Balance Check)</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${bc.exceeded ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {bc.exceeded ? 'Quota Exceeded' : 'Quota Sufficient'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-semibold text-slate-600 pt-1">
                        <div className="bg-white/60 p-2 rounded-xl border border-black/5 font-sans">
                          <div className="text-[14px] font-black text-[#212c46]">{bc.left} วัน</div>
                          <div className="text-[8px] font-bold uppercase text-slate-400 mt-0.5">คงเหลือ (Available)</div>
                        </div>
                        <div className="bg-white/60 p-2 rounded-xl border border-black/5 font-sans">
                          <div className="text-[14px] font-black text-[#212c46]">{bc.duration} วัน</div>
                          <div className="text-[8px] font-bold uppercase text-slate-400 mt-0.5">ขอใช้ลา (Requested)</div>
                        </div>
                        <div className="bg-white/60 p-2 rounded-xl border border-black/5 font-sans">
                          <div className={`text-[14px] font-black ${bc.exceeded ? 'text-rose-600' : 'text-emerald-700'}`}>{bc.endingBal} วัน</div>
                          <div className="text-[8px] font-bold uppercase text-slate-400 mt-0.5">ยอดหลังลา (Projected)</div>
                        </div>
                      </div>

                      {bc.exceeded && (
                        <p className="text-[9.5px] font-extrabold text-rose-600 flex items-center gap-1 mt-0.5 leading-relaxed">
                          <ShieldAlert size={12} className="shrink-0 text-rose-500 animate-bounce" />
                          <span>คำเตือน: คุณลาเกินโควตาคงเหลือ จะไม่อนุมัติเป็นแบบลาปกติอัตโนมัติ และจะตั้งเรื่องเป็น "Unpaid Leave" ค่ะ</span>
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* Submission Actions */}
                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#212c46] text-[#b7a159] hover:bg-[#2d3a58] text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* mt-8 bottom spacing for 32px before footer */}
      <div className="mt-8" />

    </div>
  );
}
