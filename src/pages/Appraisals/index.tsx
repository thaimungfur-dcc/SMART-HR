import KpiCard from '../../components/shared/KpiCard';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  CheckSquare, 
  Sparkles, 
  AlertTriangle, 
  Search, 
  Filter, 
  Plus, 
  Upload, 
  Download, 
  Printer, 
  Info, 
  User, 
  Building, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Sliders, 
  CheckCircle,
  HelpCircle,
  Clock,
  ChevronRight,
  ShieldAlert,
  BarChart as BarChartIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { dbSync } from '../../services/dbSync';
import { useSearchParams } from 'react-router-dom';
import { DraggableModal } from '../../components/shared/DraggableModal';
import { CsvExport } from '../../components/shared/CsvExport';
import { CsvUpload } from '../../components/shared/CsvUpload';
import { PdfPrint } from '../../components/shared/PdfPrint';
import Swal from 'sweetalert2';

interface Appraisal {
  id: string;
  employeeName: string;
  department: string;
  position: string;
  period: string;
  status: string;
  score: number;
  grade: string;
  selfScore: number;
  supervisorComments: string;
  date: string;
  // KPI Breakdown (optional or defaulted if not exist)
  kpiTechnical?: number;
  kpiExecution?: number;
  kpiCompliance?: number;
  kpiTeamwork?: number;
}

// Custom styling for the Recharts interactive analytics tooltips
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1d2636] text-white p-3.5 rounded-xl border border-slate-700/50 shadow-xl text-xs font-semibold select-none leading-relaxed">
        <p className="font-extrabold uppercase tracking-wide text-[#b58c4f] border-b border-white/10 pb-1.5 mb-1.5">
          {label}
        </p>
        <div className="space-y-1">
          {payload.map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.color || item.fill }} />
                {item.name}:
              </span>
              <span className="font-mono font-bold text-white">{item.value} pt</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function AppraisalsPage() {
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedGrade, setSelectedGrade] = useState('All');

  // Modal Controls
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedAppraisal, setSelectedAppraisal] = useState<Appraisal | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isWeightsOpen, setIsWeightsOpen] = useState(false);

  // New Appraisal Form State
  const [newAppraisal, setNewAppraisal] = useState({
    employeeName: '',
    department: '',
    position: '',
    period: 'FY2026 Mid-Year',
    status: 'Pending Assessment',
    selfScore: 80,
    supervisorComments: '',
    kpiTechnical: 80,
    kpiExecution: 80,
    kpiCompliance: 80,
    kpiTeamwork: 80,
  });

  // Departmental Weight Rules
  const [deptWeights, setDeptWeights] = useState<Record<string, { technical: number; execution: number; compliance: number; teamwork: number }>>({
    'Innovation Team': { technical: 40, execution: 30, compliance: 10, teamwork: 20 },
    'Production': { technical: 20, execution: 40, compliance: 30, teamwork: 10 },
    'Human Resources': { technical: 20, execution: 30, compliance: 20, teamwork: 30 },
    'Finance & Accounting': { technical: 20, execution: 40, compliance: 30, teamwork: 10 },
    'Logistics': { technical: 15, execution: 45, compliance: 30, teamwork: 10 },
    'Information Technology': { technical: 45, execution: 25, compliance: 10, teamwork: 20 },
    'Default': { technical: 25, execution: 25, compliance: 25, teamwork: 25 }
  });

  // Visualization & Graph Trends States
  const [selectedTrendEmployee, setSelectedTrendEmployee] = useState<string>('');
  const [showCharts, setShowCharts] = useState<boolean>(true);
  
  // Routing sync & active tab management
  const [searchParams] = useSearchParams();
  const [highlightChart, setHighlightChart] = useState<boolean>(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'history') {
      setShowCharts(true);
      setHighlightChart(true);
      
      // Smooth scroll to chart container
      setTimeout(() => {
        const el = document.getElementById('appraisals-analytics-dashboard');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);

      // Disable glow after duration
      const timer = setTimeout(() => {
        setHighlightChart(false);
      }, 3000);

      return () => clearTimeout(timer);
    } else if (tab === 'evaluation') {
      setShowCharts(false);
    }
  }, [searchParams]);

  // List of unique employee names who have appraisal records
  const uniqueAppraisalEmployees = useMemo(() => {
    const names = new Set<string>();
    appraisals.forEach(a => {
      if (a.employeeName) {
        names.add(a.employeeName.trim());
      }
    });
    return Array.from(names);
  }, [appraisals]);

  // Set default selected employee when list loads
  useEffect(() => {
    if (uniqueAppraisalEmployees.length > 0 && !selectedTrendEmployee) {
      setSelectedTrendEmployee(uniqueAppraisalEmployees[0]);
    }
  }, [uniqueAppraisalEmployees, selectedTrendEmployee]);

  // Compute trend data for the selected employee
  const employeeTrendData = useMemo(() => {
    if (!selectedTrendEmployee) return [];
    return appraisals
      .filter(a => a.employeeName?.trim() === selectedTrendEmployee.trim())
      .map(a => ({
        period: a.period || a.date || 'Review Cycle',
        date: a.date || '',
        'Technical': a.kpiTechnical ?? 80,
        'Execution': a.kpiExecution ?? 80,
        'Compliance': a.kpiCompliance ?? 80,
        'Teamwork': a.kpiTeamwork ?? 80,
        'Score': a.score ?? 80,
      }))
      .sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
  }, [appraisals, selectedTrendEmployee]);

  // Compute department breakdown averages
  const departmentalAverages = useMemo(() => {
    const depts: Record<string, { totalScore: number; count: number; tech: number; exec: number; comp: number; team: number }> = {};
    appraisals.forEach(a => {
      const dept = a.department || 'Default';
      if (!depts[dept]) {
        depts[dept] = { totalScore: 0, count: 0, tech: 0, exec: 0, comp: 0, team: 0 };
      }
      depts[dept].totalScore += a.score || 0;
      depts[dept].tech += a.kpiTechnical ?? 80;
      depts[dept].exec += a.kpiExecution ?? 80;
      depts[dept].comp += a.kpiCompliance ?? 80;
      depts[dept].team += a.kpiTeamwork ?? 80;
      depts[dept].count += 1;
    });

    return Object.keys(depts).map(dept => ({
      name: dept,
      'Avg Score': Math.round((depts[dept].totalScore / depts[dept].count) * 10) / 10,
      'Technical': Math.round((depts[dept].tech / depts[dept].count) * 10) / 10,
      'Execution': Math.round((depts[dept].exec / depts[dept].count) * 10) / 10,
      'Compliance': Math.round((depts[dept].comp / depts[dept].count) * 10) / 10,
      'Teamwork': Math.round((depts[dept].team / depts[dept].count) * 10) / 10,
    }));
  }, [appraisals]);

  // Load Initial Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const appraisalRes = await dbSync.read('appraisals');
      if (appraisalRes.status === 'success' && appraisalRes.data?.items) {
        setAppraisals(appraisalRes.data.items);
      }

      const employeeRes = await dbSync.read('employees');
      if (employeeRes.status === 'success' && employeeRes.data?.items) {
        setEmployees(employeeRes.data.items);
      }
    } catch (err) {
      console.error('Failed to load appraisals/employees:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync / Refresh UI safely
  const handleRefresh = async () => {
    await loadData();
    Swal.fire({
      icon: 'success',
      title: 'Data Synchronized',
      text: 'Successfully read latest performance KPIs from database.',
      confirmButtonColor: '#3f809e',
      timer: 1500
    });
  };

  // Departments List for filtering
  const departments = useMemo(() => {
    const list = new Set<string>();
    appraisals.forEach(a => {
      if (a.department) list.add(a.department);
    });
    return ['All', ...Array.from(list)];
  }, [appraisals]);

  // Unique status values for filtering
  const statuses = useMemo(() => {
    const list = new Set<string>();
    appraisals.forEach(a => {
      if (a.status) list.add(a.status);
    });
    return ['All', ...Array.from(list)];
  }, [appraisals]);

  // Grade list for filtering
  const grades = ['All', 'A', 'B+', 'B', 'C', 'D'];

  // Helper score converter
  const calculateGradeFromScore = (score: number): string => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  };

  // Helper to compute overall weighted score based on weights config
  const calculateFinalScore = (
    tempAppraisal: Partial<Appraisal> | Appraisal,
    dept: string
  ): number => {
    const weights = deptWeights[dept] || deptWeights['Default'];
    const tech = tempAppraisal.kpiTechnical ?? 80;
    const exec = tempAppraisal.kpiExecution ?? 80;
    const comp = tempAppraisal.kpiCompliance ?? 80;
    const team = tempAppraisal.kpiTeamwork ?? 80;

    const raw = (
      (tech * (weights.technical / 100)) +
      (exec * (weights.execution / 100)) +
      (comp * (weights.compliance / 100)) +
      (team * (weights.teamwork / 100))
    );
    return Math.round(raw * 10) / 10;
  };

  // Computed / Filtered Appraisals List
  const filteredAppraisals = useMemo(() => {
    return appraisals.filter(item => {
      const matchesSearch = 
        item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDept = selectedDept === 'All' || item.department === selectedDept;
      const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
      const matchesGrade = selectedGrade === 'All' || item.grade === selectedGrade;

      return matchesSearch && matchesDept && matchesStatus && matchesGrade;
    });
  }, [appraisals, searchQuery, selectedDept, selectedStatus, selectedGrade]);

  // Math Analytics for KPI Cards
  const stats = useMemo(() => {
    if (appraisals.length === 0) {
      return { averageScore: 0, completionRate: 0, highPerformers: 0, pendingReview: 0 };
    }

    const total = appraisals.length;
    const completedCount = appraisals.filter(a => a.status === 'Completed' || a.status === 'Approved').length;
    const completionRate = Math.round((completedCount / total) * 100);

    const scoresSum = appraisals.reduce((acc, a) => acc + (a.score || 0), 0);
    const averageScore = Math.round((scoresSum / total) * 10) / 10;

    const highPerformers = appraisals.filter(a => (a.score || 0) >= 88).length;
    const pendingReview = appraisals.filter(a => a.status !== 'Completed' && a.status !== 'Approved').length;

    return { averageScore, completionRate, highPerformers, pendingReview };
  }, [appraisals]);

  // Open detail panel for appraisal editing
  const handleOpenDetail = (appraisal: Appraisal) => {
    // Fill in default breakdown scores to prevent undefined crashes
    const prepared: Appraisal = {
      ...appraisal,
      kpiTechnical: appraisal.kpiTechnical ?? 80,
      kpiExecution: appraisal.kpiExecution ?? 80,
      kpiCompliance: appraisal.kpiCompliance ?? 80,
      kpiTeamwork: appraisal.kpiTeamwork ?? 80,
    };
    setSelectedAppraisal(prepared);
    setIsDetailOpen(true);
  };

  // Adjust parameters inside selected appraisal detail and recalculate grade
  const handleDetailChange = (field: keyof Appraisal, value: any) => {
    if (!selectedAppraisal) return;

    const updated = { ...selectedAppraisal, [field]: value };
    
    // Recalculate score and grade if score-contributing values change
    if (['kpiTechnical', 'kpiExecution', 'kpiCompliance', 'kpiTeamwork'].includes(String(field))) {
      const finalScore = calculateFinalScore(updated, updated.department);
      updated.score = finalScore;
      updated.grade = calculateGradeFromScore(finalScore);
    }

    setSelectedAppraisal(updated);
  };

  // Save edited appraisal
  const handleSaveAppraisal = async () => {
    if (!selectedAppraisal) return;

    try {
      await dbSync.update('appraisals', [selectedAppraisal]);
      
      // Update local state
      setAppraisals(prev => prev.map(a => a.id === selectedAppraisal.id ? selectedAppraisal : a));
      setIsDetailOpen(false);

      Swal.fire({
        icon: 'success',
        title: 'Appraisal Updated',
        text: `Performance scoring for ${selectedAppraisal.employeeName} has been synchronized successfully.`,
        confirmButtonColor: '#3f809e'
      });
    } catch (err: any) {
      console.error('Update failed:', err);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: err.message || 'Error occurred while saving appraisal updates.',
        confirmButtonColor: '#932c2e'
      });
    }
  };

  // Create new Performance Appraisal Entry
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppraisal.employeeName) return;

    const id = `APR-${Math.floor(100 + Math.random() * 900)}`;
    const finalScore = calculateFinalScore(newAppraisal, newAppraisal.department);
    const grade = calculateGradeFromScore(finalScore);

    const dataToSave: Appraisal = {
      ...newAppraisal,
      id,
      score: finalScore,
      grade,
      date: new Date().toISOString().split('T')[0]
    };

    try {
      await dbSync.update('appraisals', [dataToSave]);
      setAppraisals(prev => [dataToSave, ...prev]);
      setIsAddOpen(false);

      // Reset form
      setNewAppraisal({
        employeeName: '',
        department: 'Innovation Team',
        position: 'Software Engineer',
        period: 'FY2026 Mid-Year',
        status: 'Pending Assessment',
        selfScore: 80,
        supervisorComments: '',
        kpiTechnical: 80,
        kpiExecution: 80,
        kpiCompliance: 80,
        kpiTeamwork: 80,
      });

      Swal.fire({
        icon: 'success',
        title: 'Evaluation Scheduled',
        text: 'A new employee evaluation has been logged.',
        confirmButtonColor: '#3f809e'
      });
    } catch (err: any) {
      console.error('Error adding appraisal:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error Creating Request',
        text: err.message || 'Unable to schedule evaluation.',
        confirmButtonColor: '#932c2e'
      });
    }
  };

  // Handle Bulk Uploading
  const handleBulkUpload = async (rows: any[]) => {
    try {
      const processedRows: Appraisal[] = rows.map((row, i) => {
        const scoreVal = Number(row.score) || 80;
        const currentGrade = row.grade || calculateGradeFromScore(scoreVal);
        return {
          id: row.id || `APR-${Math.floor(1000 + Math.random() * 9000)}`,
          employeeName: row.employeeName || 'Unnamed Staff',
          department: row.department || 'Production',
          position: row.position || 'Operator',
          period: row.period || 'FY2026 Mid-Year',
          status: row.status || 'Pending Assessment',
          score: scoreVal,
          grade: currentGrade,
          selfScore: Number(row.selfScore) || 75,
          supervisorComments: row.supervisorComments || 'Directly imported from spreadsheet.',
          date: row.date || new Date().toISOString().split('T')[0],
          kpiTechnical: Number(row.kpiTechnical) || 80,
          kpiExecution: Number(row.kpiExecution) || 80,
          kpiCompliance: Number(row.kpiCompliance) || 80,
          kpiTeamwork: Number(row.kpiTeamwork) || 80
        };
      });

      await dbSync.update('appraisals', processedRows);
      
      // Merge with state, replacing duplicates if any
      setAppraisals(prev => {
        const copy = [...prev];
        processedRows.forEach(incoming => {
          const idx = copy.findIndex(item => item.id === incoming.id);
          if (idx !== -1) {
            copy[idx] = incoming;
          } else {
            copy.unshift(incoming);
          }
        });
        return copy;
      });

      setIsUploadOpen(false);

      Swal.fire({
        icon: 'success',
        title: 'Bulk Data Loaded',
        text: `Successfully registered or adjusted ${processedRows.length} employee evaluations.`,
        confirmButtonColor: '#3f809e'
      });
    } catch (err: any) {
      console.error('Upload failed:', err);
      Swal.fire({
        icon: 'error',
        title: 'File Upload Failed',
        text: err.message || 'Error occurred while saving your payload.',
        confirmButtonColor: '#932c2e'
      });
    }
  };

  // Look up profile photo associated with an employee from the loaded employees collections
  const getEmployeePhoto = (name: string) => {
    const match = employees.find(e => {
      // Direct equality or substring matches
      return e.name === name || name.includes(e.name) || e.name.includes(name);
    });
    return match?.avatar || null;
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6 bg-[#f3f3f1] min-h-screen text-slate-800" id="appraisals-module-page">
      {/* Banner / Header Title Area */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white px-6 py-5 rounded-[24px] border border-slate-100/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#3f809e]">
            <Award size={15} />
            <span className="text-[10px] uppercase tracking-[0.2em] font-black">Performance Alignment Hub</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-black text-[#212c46] tracking-tight uppercase mt-1">
            Employee Performance <span className="text-[#b58c4f]">KPI Calibration</span>
          </h1>
          <p className="text-xs text-[#7a8b95] font-semibold mt-1">
            Execute professional corporate valuations, calibrate appraisal parameters, and sync data instantly.
          </p>
        </div>

        {/* Action button cluster */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-[#212c46] text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            Refresh Hub
          </button>
          
          <button 
            onClick={() => setIsWeightsOpen(true)}
            className="flex items-center gap-1.5 bg-[#414757] hover:bg-[#2d2c4a] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all shadow-md"
          >
            <Sliders size={13} className="text-[#b58c4f]" />
            Formula Settings
          </button>

          <button 
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 bg-[#b58c4f] hover:bg-[#8e9141] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all shadow-md"
          >
            <Upload size={13} />
            Import Excel/CSV
          </button>

          <button 
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-[#3f809e] to-[#4d87a8] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl hover:shadow-lg active:scale-95 transition-all shadow-md"
          >
            <Plus size={14} />
            Add Appraisal
          </button>
        </div>
      </div>

      {/* KPI Stats Panel Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Average Score" 
          value={`${stats.averageScore} / 100`} 
          color="#3f809e" 
          icon={TrendingUp} 
          description="Overall organization index" 
        />
        <KpiCard 
          title="Completion Rate" 
          value={`${stats.completionRate}%`} 
          color="#657f4d" 
          icon={CheckSquare} 
          description="Completed or Approved briefs" 
        />
        <KpiCard 
          title="High Performers" 
          value={stats.highPerformers} 
          color="#b58c4f" 
          icon={Sparkles} 
          description="Graded outstanding (score 88+)" 
        />
        <KpiCard 
          title="Pending Reviews" 
          value={stats.pendingReview} 
          color="#932c2e" 
          icon={AlertTriangle} 
          description="Require immediate calibrations" 
        />
      </div>

      {/* Visual KPI Performance Dashboard */}
      <div className={`bg-white rounded-[24px] border p-6 space-y-4 transition-all duration-700 ${highlightChart ? 'border-[#3f809e] ring-4 ring-[#3f809e]/20 shadow-[0_4px_30px_rgba(63,128,158,0.15)] bg-sky-55/5' : 'border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]'}`} id="appraisals-analytics-dashboard">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#3f809e]/10 text-[#3f809e] rounded-xl flex items-center justify-center">
              <BarChartIcon size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-[#1d2636] uppercase tracking-wider">KPI Performance & Analytics Dashboard</h2>
              <p className="text-[10px] text-[#7a8b95] font-black uppercase tracking-wider mt-0.5">
                Visualizing organizational benchmarks and historic employee calibration trends
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCharts(!showCharts)}
            className="text-[10px] font-black uppercase tracking-widest text-[#3f809e] hover:text-[#212c46] hover:bg-[#3f809e]/10 transition-all px-4 py-2 bg-[#3f809e]/5 rounded-xl cursor-pointer self-start sm:self-auto"
          >
            {showCharts ? 'Minimize Dashboard' : 'Expand Dashboard'}
          </button>
        </div>

        {showCharts && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Left Box: Employee Trend Tracker */}
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100/80 flex flex-col justify-between shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-black text-[#1d2636] uppercase tracking-wider">Historic Competency Tracking</h3>
                  <p className="text-[10px] text-[#7a8b95] font-black uppercase tracking-wider mt-0.5">KPI Score evolution over review cycles</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-[#56657a] uppercase tracking-wide">Select Staff:</span>
                  <select
                    value={selectedTrendEmployee}
                    onChange={(e) => setSelectedTrendEmployee(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 outline-none text-[11px] font-black uppercase tracking-wider bg-white focus:border-[#3f809e] text-slate-600 cursor-pointer shadow-sm"
                  >
                    {uniqueAppraisalEmployees.length === 0 ? (
                      <option>No Appraisal Data</option>
                    ) : (
                      uniqueAppraisalEmployees.map((emp, i) => (
                        <option key={i} value={emp}>{emp}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {employeeTrendData.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs text-[#56657a] font-bold">No appraisal records found to display trends.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {employeeTrendData.length === 1 && (
                    <div className="bg-amber-55/10 border border-amber-200/50 rounded-xl p-3 flex gap-2 text-amber-750 text-[10px] font-black leading-relaxed uppercase">
                      <span className="text-amber-600 mt-0.5">⚠️</span>
                      <span>Single assessment tracked. Historic line graphs require at least two review cycles to render progression vectors over time.</span>
                    </div>
                  )}
                  
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={employeeTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="period" 
                          tick={{ fill: '#7a8b95', fontSize: 10, fontWeight: 700 }}
                          axisLine={{ stroke: '#e2e8f0' }}
                        />
                        <YAxis 
                          domain={[0, 100]} 
                          tick={{ fill: '#7a8b95', fontSize: 10, fontWeight: 700 }}
                          axisLine={{ stroke: '#e2e8f0' }}
                        />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '10px' }} />
                        <Line 
                          name="Overall Score" 
                          type="monotone" 
                          dataKey="Score" 
                          stroke="#3f809e" 
                          strokeWidth={3.5} 
                          activeDot={{ r: 6 }} 
                        />
                        <Line 
                          name="Technical" 
                          type="monotone" 
                          dataKey="Technical" 
                          stroke="#1e3a8a" 
                          strokeWidth={1.5} 
                          strokeDasharray="4 4" 
                        />
                        <Line 
                          name="Execution" 
                          type="monotone" 
                          dataKey="Execution" 
                          stroke="#4f46e5" 
                          strokeWidth={1.5} 
                          strokeDasharray="4 4" 
                        />
                        <Line 
                          name="Compliance" 
                          type="monotone" 
                          dataKey="Compliance" 
                          stroke="#059669" 
                          strokeWidth={1.5} 
                          strokeDasharray="4 4" 
                        />
                        <Line 
                          name="Teamwork" 
                          type="monotone" 
                          dataKey="Teamwork" 
                          stroke="#e11d48" 
                          strokeWidth={1.5} 
                          strokeDasharray="4 4" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* Right Box: Department Breakdown Comparison */}
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100/80 flex flex-col justify-between shadow-sm">
              <div className="mb-6 border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-[#1d2636] uppercase tracking-wider">Departmental Performance Benchmarks</h3>
                <p className="text-[10px] text-[#7a8b95] font-black uppercase tracking-wider mt-0.5">Average Calibrated Performance Scores compared across Operations</p>
              </div>

              {departmentalAverages.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs text-[#56657a] font-bold">Configure evaluations to generate Department benchmarking comparison.</p>
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentalAverages} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: '#7a8b95', fontSize: 9, fontWeight: 700 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        tick={{ fill: '#7a8b95', fontSize: 10, fontWeight: 700 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '10px' }} />
                      <Bar name="Average Score" dataKey="Avg Score" fill="#b58c4f" radius={[4, 4, 0, 0]} barSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filter and Control Area block */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Sub title / Summary of results */}
          <div>
            <h2 className="text-[13px] font-black text-[#1d2636] uppercase tracking-wider">Evaluation Calibration Matrix</h2>
            <p className="text-[10px] text-[#7a8b95] font-black uppercase tracking-wider mt-0.5">
              Found {filteredAppraisals.length} of {appraisals.length} appraisals matches filters
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end">
            {/* Quick Export capability */}
            <CsvExport 
              data={appraisals} 
              filename={`Appraisals_Export_${new Date().toISOString().split('T')[0]}.csv`} 
              label="Export System Data"
            />
          </div>
        </div>

        {/* Input items & Dropdown filters row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Text Search input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Search employee name, role, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none text-xs font-medium bg-slate-50 focus:bg-white focus:border-[#3f809e] focus:ring-1 focus:ring-[#3f809e]/30 transition-all text-slate-700 placeholder-slate-400"
            />
          </div>

          {/* Department Select dropdown */}
          <div className="relative">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-xs font-black uppercase tracking-wider bg-slate-50 focus:bg-white focus:border-[#3f809e] cursor-pointer text-slate-600"
            >
              <option disabled>Filter Department</option>
              {departments.map((dept, i) => (
                <option key={i} value={dept}>
                  {dept === 'All' ? 'DEPARTMENTS: ALL' : `DEPT: ${dept}`}
                </option>
              ))}
            </select>
          </div>

          {/* Status Select dropdown */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-xs font-black uppercase tracking-wider bg-slate-50 focus:bg-white focus:border-[#3f809e] cursor-pointer text-slate-600"
            >
              <option disabled>Filter Status</option>
              {statuses.map((stat, i) => (
                <option key={i} value={stat}>
                  {stat === 'All' ? 'STATUS: ALL' : `STATUS: ${stat}`}
                </option>
              ))}
            </select>
          </div>

          {/* Scale Grade select dropdown */}
          <div className="relative">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-xs font-black uppercase tracking-wider bg-slate-50 focus:bg-white focus:border-[#3f809e] cursor-pointer text-slate-600"
            >
              <option disabled>Filter Grade</option>
              {grades.map((gr, i) => (
                <option key={i} value={gr}>
                  {gr === 'All' ? 'GRADE: ALL' : `GRADE: ${gr}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main appraisal listings table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-[#3f809e] rounded-full animate-spin" />
            <span className="text-xs font-bold uppercase text-slate-400 tracking-widest">Loading appraisal metrics...</span>
          </div>
        ) : filteredAppraisals.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
              <Search size={22} />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#212c46] uppercase tracking-wider">No evaluations match criteria</h3>
              <p className="text-[11px] text-[#7a8b95] font-semibold mt-1">Please check your spelling, clear fields, or schedule a new appraisal.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar flex-1 min-h-0">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1d2636] text-white border-b border-light/5">
                <tr>
                  <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-[#b58c4f]">Staff Profile / Employee</th>
                  <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-slate-300">Department & Position</th>
                  <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-slate-300">Period</th>
                  <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-center text-slate-300">KPI Breakdown Scores</th>
                  <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-center text-slate-300 text-[#b58c4f]">Appraisal Score</th>
                  <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-center text-slate-300">Grade</th>
                  <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-center text-slate-300">Status</th>
                  <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-right text-slate-300">Calibration Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppraisals.map((app, idx) => {
                  const matchedPhoto = getEmployeePhoto(app.employeeName);
                  const isCompleted = app.status === 'Completed' || app.status === 'Approved';
                  const completionPercentage = app.status === 'Pending HR Alignment' ? 70 : isCompleted ? 100 : 35;

                  return (
                    <tr 
                      key={app.id} 
                      className="hover:bg-slate-50/70 transition-all duration-150 group"
                    >
                      {/* Employee Photo / ID */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="shrink-0 relative">
                            {matchedPhoto ? (
                              <img 
                                src={matchedPhoto} 
                                className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                alt={app.employeeName}
                              />
                            ) : (
                              <div className="w-10 h-10 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center font-black text-slate-500 uppercase tracking-tight">
                                {app.employeeName.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-extrabold text-[#1d2636] tracking-tight truncate max-w-[200px]">{app.employeeName}</span>
                            <span className="text-[10px] text-[#7a8b95] font-black uppercase mt-0.5">{app.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Position Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-black text-[#56657a] text-[11px] truncate max-w-[150px]">{app.position}</span>
                          <span className="text-[9px] text-[#b58c4f] font-bold uppercase mt-0.5">{app.department}</span>
                        </div>
                      </td>

                      {/* Period info */}
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-500">
                        {app.period}
                      </td>

                      {/* Breakdown scores */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="inline-flex items-center gap-4 text-[10px] text-slate-500 font-mono font-medium border border-slate-100 px-3 py-1 bg-slate-50/50 rounded-lg">
                          <span>Tech: <strong className="text-sky-700">{app.kpiTechnical ?? 80}</strong></span>
                          <span>Exec: <strong className="text-indigo-600">{app.kpiExecution ?? 80}</strong></span>
                          <span>Comp: <strong className="text-emerald-700">{app.kpiCompliance ?? 80}</strong></span>
                          <span>Team: <strong className="text-rose-700">{app.kpiTeamwork ?? 80}</strong></span>
                        </div>
                      </td>

                      {/* Final Score */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-[14px] font-black text-[#3f809e] font-mono">
                          {app.score}
                        </span>
                      </td>

                      {/* Final Grade Badge */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-xs ${
                          app.grade === 'A' 
                            ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                            : app.grade === 'B+' || app.grade === 'B'
                            ? 'bg-sky-100 text-sky-800 border border-sky-100'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {app.grade}
                        </span>
                      </td>

                      {/* Status indicator bar */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col w-28 gap-1.5">
                          <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full w-max ${
                            isCompleted 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : app.status === 'Pending HR Alignment'
                              ? 'bg-[#b7a159]/10 text-amber-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              isCompleted 
                                ? 'bg-emerald-500 animate-pulse' 
                                : app.status === 'Pending HR Alignment'
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                            }`} />
                            {app.status}
                          </span>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isCompleted 
                                  ? 'bg-emerald-500' 
                                  : app.status === 'Pending HR Alignment'
                                  ? 'bg-amber-500'
                                  : 'bg-[#3f809e]'
                              }`}
                              style={{ width: `${completionPercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Calibration / Edit button triggers */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleOpenDetail(app)}
                          className="px-3.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-white bg-[#212c46] hover:bg-[#3f809e] rounded-xl transition-all shadow-sm"
                        >
                          Calibrate Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAILED APPRAISAL ASSESSMENT MODAL */}
      <AnimatePresence>
        {isDetailOpen && selectedAppraisal && (
          <DraggableModal
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            title="KPI Assessment Calibration Profile"
            width="max-w-2xl"
          >
            <div className="flex flex-col bg-slate-50 h-[85vh] max-h-[85vh] text-[#212c46]" id="appraisal-modal-detail">
              {/* Profile Bar Header */}
              <div className="p-6 bg-[#1d2636] text-white flex items-center justify-between gap-4 shrink-0 border-b border-light/5">
                <div className="flex items-center gap-4">
                  {getEmployeePhoto(selectedAppraisal.employeeName) ? (
                    <img 
                      src={getEmployeePhoto(selectedAppraisal.employeeName)!} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#b58c4f] shadow"
                      alt={selectedAppraisal.employeeName}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-slate-100 text-[#1d2636] rounded-full flex items-center justify-center text-lg font-black uppercase shadow">
                      {selectedAppraisal.employeeName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-extrabold text-[#b58c4f] uppercase tracking-wider text-sm">{selectedAppraisal.employeeName}</h3>
                    <p className="text-[10px] text-slate-300 font-bold uppercase mt-0.5">{selectedAppraisal.position} | {selectedAppraisal.department}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 font-mono">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-black uppercase">KPI Index</span>
                    <h2 className="text-xl font-black text-[#3f809e]">{selectedAppraisal.score} / 100</h2>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 font-black uppercase bg-[#b58c4f] text-slate-900 rounded-full shadow-sm">
                    Grade {selectedAppraisal.grade}
                  </span>
                </div>
              </div>

              {/* Editable Elements Content Scroll */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* PDF printable structure */}
                <div id="print-appraisal-card" className="hidden print:block bg-white p-10 font-sans border border-slate-200">
                  <div className="text-center pb-6 border-b-2 border-[#212c46] mb-6">
                    <h1 className="text-2xl font-black uppercase text-[#212c46] tracking-widest">WMS INDIVIDUAL PERFORMANCE appraisal CARD</h1>
                    <p className="text-xs text-[#7a8b95] font-black uppercase tracking-wider mt-1">{selectedAppraisal.period} assessment</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs mb-0 bg-slate-50 p-4 rounded-xl">
                    <div>
                      <p className="mb-1"><strong>EMPLOYEE NAME:</strong> {selectedAppraisal.employeeName}</p>
                      <p className="mb-1"><strong>ID CODE:</strong> {selectedAppraisal.id}</p>
                      <p className="mb-1"><strong>DEPARTMENT:</strong> {selectedAppraisal.department}</p>
                      <p className="mb-1 font-[#b58c4f]"><strong>POSITION TITLE:</strong> {selectedAppraisal.position}</p>
                    </div>
                    <div className="text-right">
                      <p className="mb-1"><strong>EVALUATION DATE:</strong> {selectedAppraisal.date || new Date().toISOString().split('T')[0]}</p>
                      <p className="mb-1"><strong>STATUS:</strong> <span className="uppercase text-emerald-700 font-black">{selectedAppraisal.status}</span></p>
                      <p className="text-lg mt-2 text-[#3f809e] font-black"><strong>APPRAISAL SCORE:</strong> {selectedAppraisal.score} / 100</p>
                      <p className="text-md font-black text-[#b58c4f]"><strong>FINAL GRADE:</strong> GRADE {selectedAppraisal.grade}</p>
                    </div>
                  </div>

                  <h3 className="text-xs font-black uppercase tracking-wider text-[#212c46] mb-3 pb-1 border-b">Performance Metrics Breakdowns (Weighted Index)</h3>
                  <table className="w-full text-xs text-left mb-6">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="p-2 font-black uppercase">Evaluation Metric Element</th>
                        <th className="p-2 font-black uppercase">Allocated Weight</th>
                        <th className="p-2 font-black uppercase text-right">Achieved Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2">Technical Competence & System Knowledge</td>
                        <td className="p-2">{deptWeights[selectedAppraisal.department]?.technical ?? 25}%</td>
                        <td className="p-2 text-right font-black font-mono">{selectedAppraisal.kpiTechnical ?? 80}</td>
                      </tr>
                      <tr>
                        <td className="p-2">Execution Excellence & Yield Deliverables</td>
                        <td className="p-2">{deptWeights[selectedAppraisal.department]?.execution ?? 25}%</td>
                        <td className="p-2 text-right font-black font-mono">{selectedAppraisal.kpiExecution ?? 80}</td>
                      </tr>
                      <tr>
                        <td className="p-2">Safety, Quality & Regulatory SOP Compliance</td>
                        <td className="p-2">{deptWeights[selectedAppraisal.department]?.compliance ?? 25}%</td>
                        <td className="p-2 text-right font-black font-mono">{selectedAppraisal.kpiCompliance ?? 80}</td>
                      </tr>
                      <tr>
                        <td className="p-2">Teamwork, Initiative & Knowledge Contribution</td>
                        <td className="p-2">{deptWeights[selectedAppraisal.department]?.teamwork ?? 25}%</td>
                        <td className="p-2 text-right font-black font-mono">{selectedAppraisal.kpiTeamwork ?? 80}</td>
                      </tr>
                      <tr className="bg-slate-50 border-t font-black">
                        <td className="p-2" colSpan={2}>Aggregate Calibrated Performance Score</td>
                        <td className="p-2 text-right text-[#3f809e] font-mono">{selectedAppraisal.score} / 100</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="bg-slate-50 p-4 rounded-xl border mb-0">
                    <h4 className="font-extrabold uppercase mb-2">Evaluator Assessments & Core Calibrations</h4>
                    <p className="italic text-slate-600 leading-relaxed">"{selectedAppraisal.supervisorComments || 'No evaluative remarks compiled.'}"</p>
                  </div>

                  <div className="grid grid-cols-2 gap-12 mt-16 text-center text-xs">
                    <div>
                      <div className="border-t border-slate-400 pt-2 w-48 mx-auto font-black uppercase">Employee Signature</div>
                      <p className="text-slate-400 mt-1">Date: ____ / ____ / ________</p>
                    </div>
                    <div>
                      <div className="border-t border-slate-400 pt-2 w-48 mx-auto font-black uppercase">Supervisor Signature</div>
                      <p className="text-slate-400 mt-1">Date: ____ / ____ / ________</p>
                    </div>
                  </div>
                </div>

                {/* Weights Applied Info Frame */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 text-blue-700">
                  <span className="shrink-0 text-blue-500 mt-0.5">
                    <Info size={16} />
                  </span>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider leading-none">Formulas applied for {selectedAppraisal.department}</h4>
                    <p className="text-[10px] uppercase font-bold text-blue-500/80 leading-relaxed mt-1">
                      Weights distribution: {deptWeights[selectedAppraisal.department]?.technical ?? 25}% Tech | {deptWeights[selectedAppraisal.department]?.execution ?? 25}% Exec | {deptWeights[selectedAppraisal.department]?.compliance ?? 25}% Compliance | {deptWeights[selectedAppraisal.department]?.teamwork ?? 25}% Team.
                    </p>
                  </div>
                </div>

                {/* Subsystem sliders controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Part 1: Interactive KPI Calibration Weights */}
                  <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#212c46] pb-2 border-b flex items-center gap-1.5">
                      <Sliders size={13} className="text-[#3f809e]" /> Code KPI Calibration Indicators
                    </h3>

                    {/* Slider 1 */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-black uppercase">
                        <span className="text-slate-500">Technical Competence</span>
                        <span className="text-sky-700 font-mono">{(selectedAppraisal.kpiTechnical ?? 80)} / 100</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={selectedAppraisal.kpiTechnical ?? 80}
                        onChange={(e) => handleDetailChange('kpiTechnical', Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#3f809e]"
                      />
                    </div>

                    {/* Slider 2 */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-black uppercase">
                        <span className="text-slate-500">Execution & Yields</span>
                        <span className="text-indigo-600 font-mono">{(selectedAppraisal.kpiExecution ?? 80)} / 100</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={selectedAppraisal.kpiExecution ?? 80}
                        onChange={(e) => handleDetailChange('kpiExecution', Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#3f809e]"
                      />
                    </div>

                    {/* Slider 3 */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-black uppercase">
                        <span className="text-slate-500">Safety & Standard SOPs</span>
                        <span className="text-emerald-700 font-mono">{(selectedAppraisal.kpiCompliance ?? 80)} / 100</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={selectedAppraisal.kpiCompliance ?? 80}
                        onChange={(e) => handleDetailChange('kpiCompliance', Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#3f809e]"
                      />
                    </div>

                    {/* Slider 4 */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-black uppercase">
                        <span className="text-slate-500">Teamwork & Initiatives</span>
                        <span className="text-rose-700 font-mono">{(selectedAppraisal.kpiTeamwork ?? 80)} / 100</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={selectedAppraisal.kpiTeamwork ?? 80}
                        onChange={(e) => handleDetailChange('kpiTeamwork', Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#3f809e]"
                      />
                    </div>
                  </div>

                  {/* Part 2: Workflow Config & Metadata */}
                  <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#212c46] pb-2 border-b flex items-center gap-1.5">
                      <FileText size={13} className="text-[#b58c4f]" /> Status Control and Self Score
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Self Assessment Score</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={selectedAppraisal.selfScore || 80}
                          onChange={(e) => handleDetailChange('selfScore', Number(e.target.value))}
                          className="w-full px-3 py-2 border rounded-xl font-mono text-xs text-slate-700 bg-slate-50 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Assigned Status</label>
                        <select
                          value={selectedAppraisal.status}
                          onChange={(e) => handleDetailChange('status', e.target.value)}
                          className="w-full px-3 py-2 border rounded-xl text-xs font-black uppercase tracking-wider text-slate-600 bg-slate-50 focus:bg-white cursor-pointer"
                        >
                          <option value="Pending Assessment">Pending Assessment</option>
                          <option value="Pending HR Alignment">Pending HR Alignment</option>
                          <option value="Completed">Completed</option>
                          <option value="Approved">Approved</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase text-slate-400">Assessing Review Cycle</label>
                      <input
                        type="text"
                        value={selectedAppraisal.period}
                        onChange={(e) => handleDetailChange('period', e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>

                </div>

                {/* Supervisor narrative assessment text area */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Supervisor Assessment Comments & Guidance</label>
                  <textarea
                    rows={3}
                    placeholder="Provide constructive assessment comments or organizational feedback to align employee with target paths..."
                    value={selectedAppraisal.supervisorComments || ''}
                    onChange={(e) => handleDetailChange('supervisorComments', e.target.value)}
                    className="w-full p-4 border border-slate-200 rounded-2xl text-xs outline-none focus:border-[#3f809e] focus:ring-1 focus:ring-[#3f809e]/30 bg-white"
                  />
                </div>

              </div>

              {/* Interaction Footer Controls */}
              <div className="p-6 bg-slate-100 border-t border-slate-200 flex flex-wrap gap-3 shrink-0">
                <PdfPrint 
                  contentId="print-appraisal-card" 
                  title={`Appraisal_Report_${selectedAppraisal.employeeName.replace(/\s+/g, '_')}`}
                  className="bg-white hover:bg-slate-200 py-3"
                />

                <div className="flex-1 flex gap-3 justify-end">
                  <button
                    onClick={() => setIsDetailOpen(false)}
                    className="px-6 py-3 text-center text-xs font-black uppercase tracking-widest rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-500 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAppraisal}
                    className="px-6 py-3 text-center text-xs font-black uppercase tracking-widest text-white rounded-xl bg-gradient-to-r from-[#3f809e] to-[#4d87a8] hover:shadow-lg transition-all cursor-pointer"
                  >
                    Save Appraisal Metrics
                  </button>
                </div>
              </div>
            </div>
          </DraggableModal>
        )}
      </AnimatePresence>

      {/* SCHEDULING NEW APPRAISAL REQUEST MODAL */}
      <AnimatePresence>
        {isAddOpen && (
          <DraggableModal
            isOpen={isAddOpen}
            onClose={() => setIsAddOpen(false)}
            title="Log New Performance Assessment"
            width="max-w-md"
          >
            <form onSubmit={handleCreateRequest} className="bg-slate-50 text-slate-800" id="appraisal-add-form">
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-[#3f809e] border-b pb-2 mb-2">
                  <Calendar size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#212c46]">Create New Performance Record</span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-slate-400">Employee Name (Full Name)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. วรรณพร สดใส (Wannaporn Sodsai)"
                    value={newAppraisal.employeeName}
                    onChange={(e) => setNewAppraisal(prev => ({ ...prev, employeeName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:border-[#3f809e] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-slate-400">Department</label>
                    <select
                      value={newAppraisal.department}
                      onChange={(e) => setNewAppraisal(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full px-3 py-2.5 border rounded-xl text-xs font-black uppercase tracking-wider text-slate-600 bg-white"
                    >
                      <option value="Innovation Team">Innovation Team</option>
                      <option value="Production">Production</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Finance & Accounting">Finance & Accounting</option>
                      <option value="Logistics">Logistics</option>
                      <option value="Information Technology">Information Technology</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-slate-400">Position Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Architect"
                      value={newAppraisal.position}
                      onChange={(e) => setNewAppraisal(prev => ({ ...prev, position: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-slate-400">Evaluation Cycle</label>
                    <input
                      type="text"
                      required
                      value={newAppraisal.period}
                      onChange={(e) => setNewAppraisal(prev => ({ ...prev, period: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-700"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-slate-400">Self Evaluation Score</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newAppraisal.selfScore}
                      onChange={(e) => setNewAppraisal(prev => ({ ...prev, selfScore: Number(e.target.value) }))}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-slate-200 pt-3">
                  <span className="block text-[10px] font-black uppercase text-slate-400 mb-2">Configure Default KPI Elements</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                    <div>
                      <span>Technical Competence: </span>
                      <input 
                        type="number" 
                        className="w-full border rounded px-2 py-1 mt-0.5" 
                        value={newAppraisal.kpiTechnical} 
                        onChange={(e) => setNewAppraisal(prev => ({ ...prev, kpiTechnical: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <span>Execution Excellence: </span>
                      <input 
                        type="number" 
                        className="w-full border rounded px-2 py-1 mt-0.5" 
                        value={newAppraisal.kpiExecution} 
                        onChange={(e) => setNewAppraisal(prev => ({ ...prev, kpiExecution: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <span>Compliance Standard: </span>
                      <input 
                        type="number" 
                        className="w-full border rounded px-2 py-1 mt-0.5" 
                        value={newAppraisal.kpiCompliance} 
                        onChange={(e) => setNewAppraisal(prev => ({ ...prev, kpiCompliance: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <span>Teamwork & Initiative: </span>
                      <input 
                        type="number" 
                        className="w-full border rounded px-2 py-1 mt-0.5" 
                        value={newAppraisal.kpiTeamwork} 
                        onChange={(e) => setNewAppraisal(prev => ({ ...prev, kpiTeamwork: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-slate-400">Supervisor Remarks</label>
                  <textarea
                    placeholder="Enter key evaluative observations or assessment records..."
                    rows={2}
                    value={newAppraisal.supervisorComments}
                    onChange={(e) => setNewAppraisal(prev => ({ ...prev, supervisorComments: e.target.value }))}
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs bg-white outline-none"
                  />
                </div>
              </div>

              <div className="p-6 bg-slate-100 border-t border-slate-200 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-3 text-center text-xs font-black uppercase tracking-widest rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-center text-xs font-black uppercase tracking-widest text-white rounded-xl bg-gradient-to-r from-[#3f809e] to-[#4d87a8] hover:shadow-lg cursor-pointer"
                >
                  Create Appraisal
                </button>
              </div>
            </form>
          </DraggableModal>
        )}
      </AnimatePresence>

      {/* BULK UPLOAD ASSESSMENTS SPREADSHEET MODAL */}
      <AnimatePresence>
        {isUploadOpen && (
          <DraggableModal
            isOpen={isUploadOpen}
            onClose={() => setIsUploadOpen(false)}
            title="Bulk Import Appraisal Datasets"
            width="max-w-2xl"
          >
            <div className="p-6 space-y-4" id="appraisal-bulk-upload">
              <div className="flex items-center gap-2 text-[#b58c4f] border-b pb-2 mb-2">
                <Upload size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#212c46]">Upload Spreadsheet File (.csv, .xlsx)</span>
              </div>

              <CsvUpload 
                onUpload={handleBulkUpload} 
                requiredHeaders={['employeeName', 'department', 'position', 'period', 'score', 'grade']}
                templateName="appraisal_upload_template.xlsx"
                instructions={[
                  "Accepts CSV data with headers exactly: employeeName, department, position, period, score, grade",
                  "Optionally, you may include: kpiTechnical, kpiExecution, kpiCompliance, kpiTeamwork, selfScore, supervisorComments",
                  "Duplicate items matching the same ID codes will be dynamically updated.",
                  "Maximum single dataset file load limit: 10MB."
                ]}
              />
            </div>
          </DraggableModal>
        )}
      </AnimatePresence>

      {/* INTERACTIVE KPI FORMULA CALIBRATION COEFFICIENTS */}
      <AnimatePresence>
        {isWeightsOpen && (
          <DraggableModal
            isOpen={isWeightsOpen}
            onClose={() => setIsWeightsOpen(false)}
            title="Global Performance Formula Weights Settings"
            width="max-w-lg"
          >
            <div className="bg-slate-50 text-slate-800" id="appraisal-formula-weights">
              <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                <div className="flex items-center gap-2 text-[#3f809e] border-b pb-2">
                  <Sliders size={16} />
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#212c46] block">Department Weight Rules Calibration</span>
                    <span className="text-[9px] text-[#7a8b95] font-semibold">The combined coefficients of the 4 KPI pillars must exact 100% per family.</span>
                  </div>
                </div>

                {Object.keys(deptWeights).map((key) => {
                  const rule = deptWeights[key];
                  const sum = rule.technical + rule.execution + rule.compliance + rule.teamwork;
                  const isSane = sum === 100;

                  return (
                    <div key={key} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-[#1d2636]">{key} Formula Coefficient</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSane ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          Sum: {sum}% {isSane ? '✔ Sane' : '⚠ Error: Must be 100%'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[10px] font-black text-slate-500 uppercase">
                        <div>
                          <label className="block mb-1">Technical Skills (%)</label>
                          <input 
                            type="number"
                            min="0"
                            max="100"
                            value={rule.technical}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setDeptWeights(prev => ({
                                ...prev,
                                [key]: { ...prev[key], technical: val }
                              }));
                            }}
                            className="w-full px-2 py-1 border rounded text-xs select-none"
                          />
                        </div>

                        <div>
                          <label className="block mb-1">Execution & Yield (%)</label>
                          <input 
                            type="number"
                            min="0"
                            max="100"
                            value={rule.execution}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setDeptWeights(prev => ({
                                ...prev,
                                [key]: { ...prev[key], execution: val }
                              }));
                            }}
                            className="w-full px-2 py-1 border rounded text-xs select-none"
                          />
                        </div>

                        <div>
                          <label className="block mb-1">SOP & Guidelines Compliance (%)</label>
                          <input 
                            type="number"
                            min="0"
                            max="100"
                            value={rule.compliance}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setDeptWeights(prev => ({
                                ...prev,
                                [key]: { ...prev[key], compliance: val }
                              }));
                            }}
                            className="w-full px-2 py-1 border rounded text-xs select-none"
                          />
                        </div>

                        <div>
                          <label className="block mb-1">Teamwork & Initiatives (%)</label>
                          <input 
                            type="number"
                            min="0"
                            max="100"
                            value={rule.teamwork}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setDeptWeights(prev => ({
                                ...prev,
                                [key]: { ...prev[key], teamwork: val }
                              }));
                            }}
                            className="w-full px-2 py-1 border rounded text-xs select-none"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-6 bg-slate-100 border-t border-slate-200 flex gap-3">
                <button
                  onClick={() => setIsWeightsOpen(false)}
                  className="w-full py-3 text-center text-xs font-black uppercase tracking-widest rounded-xl bg-[#212c46] hover:bg-[#1d2636] text-white cursor-pointer"
                >
                  Minimize Settings and Apply Formulas
                </button>
              </div>
            </div>
          </DraggableModal>
        )}
      </AnimatePresence>

    </div>
  );
}
