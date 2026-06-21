import { 
  LayoutDashboard,
  BrainCircuit,
  Calendar,
  Users,
  Briefcase,
  Heart,
  AlertTriangle,
  Clock,
  CalendarDays,
  Banknote,
  Award,
  UserPlus,
  CheckSquare,
  Target,
  Network,
  GraduationCap,
  PieChart,
  Settings,
  Scale,
  Shield,
  FileSearch,
  FolderOpen,
  MessageSquare,
  ClipboardList,
  BookOpen,
  Bell
} from 'lucide-react';

export interface MenuItem {
  id: string;
  path?: string;
  name: string;
  icon?: any;
  isConfidential?: boolean;
  category?: string;
  subItems?: { id: string; name: string; path: string; isConfidential?: boolean }[];
}

export const MENU_ITEMS: MenuItem[] = [
  // Top Level
  { id: 'dashboard', path: '/', name: 'HR COMMAND CENTER', icon: LayoutDashboard, category: 'TOP' },
  { id: 'copilot', path: '/copilot', name: 'AI COPILOT', icon: BrainCircuit, category: 'TOP' },
  { id: 'calendar', path: '/hr-calendar', name: 'CALENDAR', icon: Calendar, category: 'TOP' },
  { id: 'notifications', path: '/notifications', name: 'NOTIFICATIONS', icon: Bell, category: 'TOP' },
  
  // CORE HR & OPERATIONS
  { 
    id: 'employees', 
    name: 'EMPLOYEES', 
    icon: Users, 
    category: 'CORE HR & OPERATIONS',
    subItems: [
      { id: 'emp_dir', name: 'EMPLOYEE DIRECTORY', path: '/employees/directory' },
      { id: 'emp_salary_master', name: 'SALARY MASTER DATA', path: '/employees/salary-master' },
      { id: 'emp_onboarding', name: 'ONBOARDING', path: '/employees/onboarding' },
      { id: 'emp_offboarding', name: 'OFFBOARDING', path: '/employees/offboarding' }
    ]
  },
  { 
    id: 'job_description', 
    name: 'JOB DESCRIPTION', 
    icon: Briefcase, 
    category: 'CORE HR & OPERATIONS',
    subItems: [
      { id: 'jd_repository', name: 'JD REPOSITORY', path: '/job-description/repository' }
    ]
  },
  { 
    id: 'labor_relations', 
    name: 'LABOR RELATIONS', 
    icon: Heart, 
    category: 'CORE HR & OPERATIONS',
    subItems: [
      { id: 'lr_union', name: 'UNION & GRIEVANCES', path: '/labor-relations/union' },
      { id: 'lr_engagement', name: 'ENGAGEMENT & RELATIONSHIP', path: '/labor-relations/engagement' },
      { id: 'lr_sports', name: 'SPORTS & SOCIAL EVENTS', path: '/labor-relations/sports' },
      { id: 'lr_pr', name: 'INTERNAL PR & NEWS', path: '/labor-relations/pr' },
      { id: 'lr_external', name: 'EXTERNAL ACTIVITIES', path: '/labor-relations/external' }
    ]
  },
  { 
    id: 'disciplinary', 
    name: 'DISCIPLINARY', 
    icon: AlertTriangle, 
    category: 'CORE HR & OPERATIONS',
    subItems: [
      { id: 'disc_company', name: 'COMPANY REGULATIONS', path: '/disciplinary/regulations' },
      { id: 'disc_law', name: 'DISCIPLINARY & LABOR LAW', path: '/disciplinary/law' },
      { id: 'disc_warning_letters', name: 'WARNING LETTERS', path: '/disciplinary/warning-letters' },
      { id: 'disc_investigation', name: 'INVESTIGATION', path: '/disciplinary/investigation' },
      { id: 'disc_actions', name: 'PUNISHMENT ACTIONS', path: '/disciplinary/actions' }
    ]
  },
  { 
    id: 'time_attendance', 
    name: 'TIME & ATTENDANCE', 
    icon: Clock, 
    category: 'CORE HR & OPERATIONS',
    subItems: [
      { id: 'ta_time', name: 'TIME & ATTENDANCE', path: '/time-attendance/records' },
      { id: 'ta_schedules', name: 'SHIFT SCHEDULES', path: '/time-attendance/schedules' },
      { id: 'ta_overtime', name: 'OVERTIME', path: '/time-attendance/overtime' }
    ]
  },
  { 
    id: 'leave_management', 
    name: 'LEAVE MANAGEMENT', 
    icon: CalendarDays, 
    category: 'CORE HR & OPERATIONS',
    subItems: [
      { id: 'leave_hr', name: 'LEAVE REQUESTS (HR)', path: '/leave/hr' },
      { id: 'leave_staff', name: 'LEAVE BALANCES (STAFF)', path: '/leave/staff' },
      { id: 'leave_holidays', name: 'HOLIDAYS', path: '/leave-management/holidays' }
    ]
  },
  { 
    id: 'payroll', 
    name: 'PAYROLL', 
    icon: Banknote, 
    category: 'CORE HR & OPERATIONS',
    subItems: [
      { id: 'payroll_calculation', name: 'PAYROLL CALCULATION', path: '/payroll/calculation' },
      { id: 'payroll_payslips_hr', name: 'PAYSLIPS (HR)', path: '/payroll/payslips-hr' },
      { id: 'payroll_payslips', name: 'MY PAYSLIPS (STAFF)', path: '/payroll/payslips' },
      { id: 'payroll_expenses', name: 'EXPENSES', path: '/payroll/expenses' }
    ]
  },
  { 
    id: 'benefits', 
    name: 'BENEFITS', 
    icon: Award, 
    category: 'CORE HR & OPERATIONS',
    subItems: [
      { id: 'ben_welfare', name: 'BENEFITS & WELFARE', path: '/benefits/welfare' }
    ]
  },

  // RECRUITMENT
  { 
    id: 'recruitment_ats', 
    name: 'RECRUITMENT (ATS)', 
    icon: UserPlus, 
    category: 'RECRUITMENT',
    subItems: [
      { id: 'rec_request', name: 'MANPOWER REQUEST', path: '/recruitment/request' },
      { id: 'rec_planning', name: 'MANPOWER PLANNING', path: '/recruitment/planning' },
      { id: 'rec_vacancies', name: 'JOB VACANCIES', path: '/recruitment/vacancies' },
      { id: 'rec_openings', name: 'JOB OPENINGS', path: '/recruitment/openings' },
      { id: 'rec_tracking', name: 'CANDIDATES TRACKING', path: '/recruitment/tracking' }
    ]
  },
  { 
    id: 'interview', 
    name: 'INTERVIEW', 
    icon: CheckSquare, 
    category: 'RECRUITMENT',
    subItems: [
      { id: 'int_schedule', name: 'INTERVIEW SCHEDULE', path: '/interview/schedule' },
      { id: 'int_interviews', name: 'INTERVIEWS', path: '/interview/list' }
    ]
  },

  // PERFORMANCE & DEVELOPMENT
  { 
    id: 'performance_mgt', 
    name: 'PERFORMANCE MGT.', 
    icon: Target, 
    category: 'PERFORMANCE & DEVELOPMENT',
    subItems: [
      { id: 'perf_kpi', name: 'KPI / OKR SETTING', path: '/performance/kpi' },
      { id: 'perf_evaluation', name: 'EVALUATION & APPRAISALS', path: '/appraisals?tab=evaluation' },
      { id: 'perf_historic', name: 'HISTORIC TRACKING', path: '/appraisals?tab=history' }
    ]
  },
  { 
    id: 'talent_planning', 
    name: 'TALENT PLANNING', 
    icon: Network, 
    category: 'PERFORMANCE & DEVELOPMENT',
    subItems: [
      { id: 'tp_skill', name: 'SKILL MATRIX', path: '/talent/skill-matrix' },
      { id: 'tp_career', name: 'CAREER PATH', path: '/talent/career-path' },
      { id: 'tp_succession', name: 'SUCCESSION PLAN', path: '/talent/succession-plan' }
    ]
  },
  { 
    id: 'talent_dev', 
    name: 'TALENT DEVELOPMENT', 
    icon: GraduationCap, 
    category: 'PERFORMANCE & DEVELOPMENT',
    subItems: [
      { id: 'td_orientation', name: 'ORIENTATION TRAINING', path: '/talent-dev/orientation' },
      { id: 'td_ojt', name: 'OJT TRAINING', path: '/talent-dev/ojt' },
      { id: 'td_inhouse', name: 'IN-HOUSE TRAINING', path: '/talent-dev/inhouse' },
      { id: 'td_public', name: 'PUBLIC & SEMINAR', path: '/talent-dev/public' }
    ]
  },

  // DATA & ANALYTICS
  { 
    id: 'hr_reports', 
    name: 'HR REPORTS & INSIGHTS', 
    icon: PieChart, 
    category: 'DATA & ANALYTICS',
    subItems: [
      { id: 'rep_summary', name: 'SUMMARY REPORT', path: '/reports/summary' },
      { id: 'rep_workforce', name: 'WORKFORCE REPORT', path: '/reports/workforce' },
      { id: 'rep_turnover', name: 'TURNOVER ANALYSIS', path: '/reports/turnover' }
    ]
  },

  // ADMINISTRATION
  { 
    id: 'system_settings', 
    name: 'SETTINGS', 
    icon: Settings, 
    category: 'ADMINISTRATION',
    subItems: [
      { id: 'user_permission', name: 'USER PERMISSION', path: '/permissions' },
      { id: 'system_config', name: 'SYSTEM CONFIG', path: '/settings' },
      { id: 'dev_permit', name: 'DEV PERMIT BETA', path: '/dev-permit' },
      { id: 'dev_logs', name: 'SYSTEM LOGS', path: '/dev-logs' }
    ]
  }
];
