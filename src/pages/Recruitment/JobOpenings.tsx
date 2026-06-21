import { Toast } from '../../components/shared/Toast';
import { UserGuidePanel } from '../../components/shared/UserGuidePanel';
import KpiCard from '../../components/shared/KpiCard';
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Briefcase, Search, Plus, Pencil, Trash2, X, Save, ChevronLeft, ChevronRight, 
  HelpCircle, CheckCircle2, AlertTriangle, MapPin, 
  Globe, Megaphone, FileText, Check, XCircle, Users, LayoutList,
  TrendingUp, Download, ShieldCheck, Clock, Eye, Send, Share2, Target, Settings, Database, Sliders, BookOpen, Compass
} from 'lucide-react';
import { dbSync } from '../../services/dbSync';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// --- Theme Configuration (Synced with Home & UserPermissions Palette) ---
const THEME = {
  bgMain: 'transparent',
  bgGradient: 'transparent',
  primary: '#212c46', // Deep navy
  accent: '#a94228',  // Vibrant Rust
  gold: '#b58c4f',
  brightGold: '#b7a159',
  success: '#657f4d',
  danger: '#932c2e',
  skyBlue: '#3f809e',
  dustyBlue: '#7a8b95',
  slateDark: '#2f2926',
  tableHeaderBg: '#222b38',
  tableHeaderBorder: '#709654'
};

// Mock JD Repository Data (For Auto-fill)
const JD_TEMPLATES = [
  { id: 'JD-001', title: 'Senior Fullstack Developer', dept: 'Information Technology', type: 'Full-time', location: 'Headquarters (Bangkok)', req: '5+ years experience in React & Node.js, Strong DB knowledge.' },
  { id: 'JD-002', title: 'Sales Executive (B2B)', dept: 'Sales', type: 'Full-time', location: 'Headquarters (Bangkok)', req: 'Proven B2B sales record. Excellent communication & negotiation skills.' },
  { id: 'JD-003', title: 'Production Operator', dept: 'Production', type: 'Contract', location: 'Factory A (Pathum Thani)', req: 'Ability to work in shifts. Physical stamina.' },
  { id: 'JD-004', title: 'Content Creator', dept: 'Marketing', type: 'Full-time', location: 'Hybrid', req: 'Creative mindset. Experience with TikTok, Reels, and Video Editing.' },
];

const INITIAL_VACANCIES = [
  { 
    id: 1, jobId: 'JOB-2605-01', jdRef: 'JD-001', title: 'Senior Fullstack Developer', dept: 'Information Technology', 
    headcount: 2, type: 'Full-time', location: 'Headquarters (Bangkok)', 
    postedDate: '2026-05-01', closingDate: '2026-06-30', applications: 24, status: 'Published'
  },
  { 
    id: 2, jobId: 'JOB-2605-02', jdRef: 'JD-002', title: 'Sales Executive (B2B)', dept: 'Sales', 
    headcount: 1, type: 'Full-time', location: 'Headquarters (Bangkok)', 
    postedDate: '2026-05-05', closingDate: '2026-05-31', applications: 12, status: 'Published'
  },
  { 
    id: 3, jobId: 'JOB-2605-03', jdRef: 'JD-003', title: 'Production Operator', dept: 'Production', 
    headcount: 5, type: 'Contract', location: 'Factory A (Pathum Thani)', 
    postedDate: '2026-05-10', closingDate: '2026-05-20', applications: 45, status: 'Closed'
  },
  { 
    id: 4, jobId: 'JOB-2605-04', jdRef: 'JD-004', title: 'Content Creator', dept: 'Marketing', 
    headcount: 1, type: 'Full-time', location: 'Hybrid', 
    postedDate: '2026-05-15', closingDate: '2026-07-15', applications: 0, status: 'Draft'
  },
];

const DEPARTMENTS = ['ALL', 'Information Technology', 'Sales', 'Marketing', 'Production', 'Human Resources', 'Quality Assurance', 'Warehouse'];
const STATUSES = ['ALL', 'Draft', 'Published', 'Closed'];

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) => {
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#2f2926]/70 backdrop-blur-sm p-4 animate-fadeIn flex-1 flex-col min-h-0 pb-6">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-sm flex flex-col overflow-hidden relative border border-[#eaeaec]">
        <div className="p-8 text-center bg-[#fcf4f7]">
          <div className="w-16 h-16 bg-[#b22026]/10 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-[#b22026]/20">
            <Trash2 size={28} className="text-[#b22026]" />
          </div>
          <h3 className="text-base font-black text-[#2f2926] uppercase tracking-widest mb-2">Delete Job Post?</h3>
          <p className="text-[11px] text-[#606a5f] font-medium leading-relaxed px-2">คุณแน่ใจหรือไม่ว่าต้องการลบประกาศรับสมัครงานนี้? การกระทำนี้ไม่สามารถย้อนกลับได้</p>
        </div>
        <div className="px-6 py-4 bg-white border-t border-[#eaeaec] flex justify-center gap-3">
          <button onClick={onClose} className="px-6 py-2.5 bg-white border border-[#d1d1d5] text-[#606a5f] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#f3f3f1] transition-all cursor-pointer">
            Cancel
          </button>
          <button onClick={() => { onConfirm(); onClose(); }} className="px-6 py-2.5 bg-[#b22026] text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md hover:bg-[#851c24] transition-all cursor-pointer">
            Delete Record
          </button>
        </div>
      </div>
    </div>, document.body
  );
};

function JobModal({ isOpen, onClose, record, onSave }: any) {
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(record ? { ...record } : { 
        jobId: `JOB-2605-${Math.floor(10 + Math.random() * 90)}`,
        jdRef: '', title: '', dept: '', type: 'Full-time', location: 'Headquarters (Bangkok)',
        headcount: 1, closingDate: '', reqDetails: '', status: 'Draft', postedDate: '-', applications: 0
      });
    }
  }, [isOpen, record]);

  if (!isOpen || !formData) return null;

  const handleJdSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedJdId = e.target.value;
    const jd = JD_TEMPLATES.find(j => j.id === selectedJdId);
    if (jd) {
      setFormData((prev: any) => ({
        ...prev,
        jdRef: jd.id,
        title: jd.title,
        dept: jd.dept,
        type: jd.type,
        location: jd.location,
        reqDetails: jd.req
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, jdRef: '', title: '', dept: '', reqDetails: '' }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ 
      ...prev, 
      [name]: name === 'headcount' ? Number(value) : value 
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-[#2f2926]/70 backdrop-blur-sm p-4 md:p-6 animate-fadeIn">
      <div className="bg-[#f3f3f1] rounded-[24px] shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden relative border border-white/60 h-[85vh]">
        {/* Modal Header */}
        <div className="bg-[#212c46] px-6 py-5 flex justify-between items-center text-[#f3f3f1] shrink-0 border-b border-[#2d2c4a]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-[12px] bg-[#a94228]/20 text-[#a94228] flex items-center justify-center border border-[#a94228]/30 shadow-inner">
              <Megaphone size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-[16px] font-black text-white uppercase tracking-widest leading-none mb-1.5 drop-shadow-sm">{record ? 'EDIT JOB VACANCY' : 'CREATE JOB VACANCY'}</h3>
              <span className="text-[9px] font-black text-[#f3f3f1] bg-[#a94228] px-2 py-0.5 rounded-full uppercase tracking-widest border border-[#8a331c] shadow-sm font-mono text-xs">Job ID: {formData.jobId}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all text-[#7a8b95] hover:text-white"><X size={18} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white">
          <form id="jobForm" onSubmit={handleSave} className="space-y-6 animate-fadeIn">
            
            {/* Section 1: JD Auto-fill */}
            <div className="bg-[#fdfaf1] p-5 rounded-2xl border border-[#e8dbb9] shadow-sm space-y-4">
              <h4 className="text-[12px] font-black text-[#a94228] uppercase tracking-widest border-b border-[#e8dbb9] pb-2 flex items-center gap-2"><FileText size={14}/> 1. Load from JD Repository</h4>
              <div>
                <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1.5">Select Approved JD Template</label>
                <select name="jdRef" value={formData.jdRef} onChange={handleJdSelect} className="w-full bg-white border border-[#939885]/40 rounded-xl px-4 py-2.5 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#a94228] transition-all shadow-sm cursor-pointer">
                  <option value="">-- Create without Template / Manual Entry --</option>
                  {JD_TEMPLATES.map(jd => <option key={jd.id} value={jd.id}>[{jd.id}] {jd.title} ({jd.dept})</option>)}
                </select>
                <p className="text-[9px] text-[#7a8b95] font-bold mt-2 flex items-center gap-1">Selecting a template will auto-fill the details below.</p>
              </div>
            </div>

            {/* Section 2: Position Details */}
            <div className="bg-[#f9f9f9] p-5 rounded-2xl border border-[#eaeaec] shadow-sm space-y-4">
              <h4 className="text-[12px] font-black text-[#212c46] uppercase tracking-widest border-b border-[#d1d1d5] pb-2 flex items-center gap-2"><Briefcase size={14} className="text-[#3f809e]" /> 2. Position Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1.5">Job Title <span className="text-[#b22026]">*</span></label>
                  <input type="text" required name="title" value={formData.title} onChange={handleChange} className="w-full bg-white border border-[#939885]/40 rounded-xl px-4 py-2.5 text-[12px] font-black text-[#2f2926] outline-none focus:border-[#a94228] transition-all shadow-sm" placeholder="e.g. Graphic Designer" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1.5">Department <span className="text-[#b22026]">*</span></label>
                  <select required name="dept" value={formData.dept} onChange={handleChange} className="w-full bg-white border border-[#939885]/40 rounded-xl px-4 py-2.5 text-[12px] font-black text-[#2f2926] outline-none focus:border-[#a94228] transition-all shadow-sm cursor-pointer">
                    <option value="" disabled>Select Department...</option>
                    {DEPARTMENTS.filter(d => d !== 'ALL').map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1.5">Employment Type <span className="text-[#b22026]">*</span></label>
                  <select required name="type" value={formData.type} onChange={handleChange} className="w-full bg-white border border-[#939885]/40 rounded-xl px-4 py-2.5 text-[12px] font-black text-[#2f2926] outline-none focus:border-[#a94228] transition-all shadow-sm cursor-pointer">
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1.5">Location <span className="text-[#b22026]">*</span></label>
                  <input type="text" required name="location" value={formData.location} onChange={handleChange} className="w-full bg-white border border-[#939885]/40 rounded-xl px-4 py-2.5 text-[12px] font-bold text-[#2f2926] outline-none focus:border-[#a94228] transition-all shadow-sm" placeholder="e.g. HQ, Remote, Hybrid" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1.5">Requirements / Description</label>
                <textarea name="reqDetails" value={formData.reqDetails} onChange={handleChange} rows={4} placeholder="Brief job description and requirements..." className="w-full bg-white border border-[#939885]/40 rounded-xl px-4 py-3 text-[12px] font-medium text-[#2f2926] outline-none focus:border-[#a94228] shadow-sm transition-all resize-none"></textarea>
              </div>
            </div>

            {/* Section 3: Hiring Rules */}
            <div className="bg-[#f9f9f9] p-5 rounded-2xl border border-[#eaeaec] shadow-sm space-y-4">
              <h4 className="text-[12px] font-black text-[#212c46] uppercase tracking-widest border-b border-[#d1d1d5] pb-2 flex items-center gap-2"><Target size={14} className="text-[#508660]"/> 3. Hiring Constraints</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1.5">Target Headcount <span className="text-[#b22026]">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users size={14} className="text-[#7a8b95]" />
                    </div>
                    <input type="number" min="1" name="headcount" required value={formData.headcount} onChange={handleChange} className="w-full bg-white border border-[#939885]/40 rounded-xl pl-9 pr-4 py-2.5 text-[14px] font-black text-[#212c46] outline-none focus:border-[#a94228] shadow-sm transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1.5">Closing Date <span className="text-[#b22026]">*</span></label>
                  <input type="date" name="closingDate" required value={formData.closingDate} onChange={handleChange} className="w-full bg-white border border-[#939885]/40 rounded-xl px-4 py-2.5 text-[12px] font-bold text-[#2f2926] outline-none focus:border-[#a94228] shadow-sm transition-all" />
                </div>
              </div>
              
              <div className="pt-2 border-t border-[#eaeaec]">
                <label className="text-[10px] font-black text-[#414757] uppercase tracking-widest block mb-1.5 flex items-center gap-2"><Globe size={14}/> Publish Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-white border border-[#939885]/40 rounded-xl px-4 py-3 text-[12px] font-bold text-[#2f2926] outline-none focus:border-[#a94228] shadow-sm transition-all cursor-pointer">
                  <option value="Draft">Draft (Save for later)</option>
                  <option value="Published">Published (Live on Careers Page)</option>
                  <option value="Closed">Closed (Stop accepting applicants)</option>
                </select>
              </div>
            </div>

          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#f9f9f9] border-t border-[#d1d1d5] flex justify-between items-center shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-2.5 bg-white border border-[#d1d1d5] text-[#606a5f] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#eaeaec] hover:text-[#2f2926] transition-all shadow-sm cursor-pointer">Close</button>
          <button type="submit" form="jobForm" className="bg-[#212c46] text-white px-8 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md hover:bg-[#a94228] transition-all flex items-center gap-2 border border-[#1d2636] active:scale-95 cursor-pointer">
            <Save size={16}/> {record ? 'Update Vacancy' : 'Save Job Post'}
          </button>
        </div>
      </div>
    </div>, document.body
  );
}

export default function JobOpenings() {
  const [activeTab, setActiveTab] = useState<'positions' | 'settings'>('positions');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [vacancies, setVacancies] = useState<any[]>(INITIAL_VACANCIES);
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  // Policy configuration (standardized with UserPermissions)
  const [policies, setPolicies] = useState({
    autoApprove: true,
    recruitmentLock: false,
    externalSync: true,
    standardClosingDays: 45
  });

  useEffect(() => {
    const fetchStoredVacancies = async () => {
      try {
        const response = await dbSync.read('job_openings');
        if (response && response.status === 'success' && response.data && Array.isArray(response.data.items) && response.data.items.length > 0) {
          const normalized = response.data.items.map((v: any) => {
            const dept = v.dept || v.department || 'Information Technology';
            const status = v.status === 'Active' ? 'Published' : v.status === 'Expired' ? 'Closed' : v.status || 'Published';
            const applications = v.applications !== undefined ? Number(v.applications) : (v.applicantsCount !== undefined ? Number(v.applicantsCount) : 0);
            return {
              ...v,
              id: v.id,
              jobId: v.jobId || `JOB-2605-${String(v.id).replace(/\D/g, '') || Math.floor(10 + Math.random() * 90)}`,
              jdRef: v.jdRef || 'JD-001',
              title: v.title || 'Untitled Position',
              dept,
              department: dept,
              headcount: v.headcount || 1,
              type: v.type || 'Full-time',
              location: v.location || 'Headquarters (Bangkok)',
              postedDate: v.postedDate || '2026-06-01',
              closingDate: v.closingDate || '2026-07-31',
              applications,
              applicantsCount: applications,
              status,
              description: v.description || '',
              salaryRange: v.salaryRange || '30,000 - 50,000 THB',
            };
          });
          setVacancies(normalized);
        }
      } catch (err) {
        console.warn('Failed to load vacancies from store, utilizing defaults', err);
      }
    };
    fetchStoredVacancies();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3050);
  };

  const filteredVacancies = useMemo(() => {
    return vacancies.filter(job => {
      const matchSearch = String(job.jobId || '').toLowerCase().includes(search.toLowerCase()) || 
                          String(job.title || '').toLowerCase().includes(search.toLowerCase()) ||
                          String(job.location || '').toLowerCase().includes(search.toLowerCase());
      const matchDept = selectedDept === 'ALL' || job.dept === selectedDept;
      const matchStatus = selectedStatus === 'ALL' || job.status === selectedStatus;
      return matchSearch && matchDept && matchStatus;
    }).sort((a, b) => b.id - a.id);
  }, [vacancies, search, selectedDept, selectedStatus]);

  const paginatedData = filteredVacancies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredVacancies.length / itemsPerPage);

  const kpiData = useMemo(() => {
    const total = vacancies.length;
    const active = vacancies.filter(r => r.status === 'Published').length;
    const totalApps = vacancies.reduce((sum, r) => sum + (r.applications || 0), 0);
    const drafts = vacancies.filter(r => r.status === 'Draft').length;
    return { total, active, totalApps, drafts };
  }, [vacancies]);

  const handleOpenModal = (job = null) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleSaveJob = async (formData: any) => {
    let updated;
    if (editingJob) {
      let updatedData = { ...formData };
      if (formData.status === 'Published' && editingJob.status !== 'Published') {
        updatedData.postedDate = new Date().toISOString().split('T')[0];
      }
      updated = vacancies.map(r => String(r.id) === String(editingJob.id) ? updatedData : r);
      showToast("Job vacancy updated successfully.");
    } else {
      const newId = vacancies.length > 0 ? Math.max(...vacancies.map(r => Number(r.id) || 0)) + 1 : 1;
      const postedDate = formData.status === 'Published' ? new Date().toISOString().split('T')[0] : '-';
      updated = [{ ...formData, id: newId, postedDate, applications: 0 }, ...vacancies];
      showToast("New job vacancy created Successfully.");
    }

    // Set duplicate keys so that both pages (JobOpenings and index.tsx) can read successfully
    const normalizedUpdated = updated.map(v => {
      const parentDept = v.dept || v.department || 'Information Technology';
      const statusValue = v.status;
      const actStatus = (statusValue === 'Published' || statusValue === 'Active') ? 'Active' : (statusValue === 'Closed' || statusValue === 'Expired') ? 'Expired' : 'Draft';
      return {
        ...v,
        dept: parentDept,
        department: parentDept,
        applicantsCount: v.applications || 0,
        applications: v.applications || 0,
        // Active/Draft/Expired for index.tsx matching
        status: statusValue,
        statusActiveDraft: actStatus
      };
    });

    setVacancies(normalizedUpdated);
    try {
      await dbSync.write('job_openings', normalizedUpdated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    const updated = vacancies.filter(job => String(job.id) !== String(id));
    setVacancies(updated);
    showToast("Job vacancy deleted.");
    try {
      await dbSync.write('job_openings', updated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    const updated = vacancies.map(job => {
      if (String(job.id) === String(id)) {
        const postedDate = newStatus === 'Published' ? new Date().toISOString().split('T')[0] : job.postedDate;
        return { ...job, status: newStatus, postedDate };
      }
      return job;
    });

    const normalizedUpdated = updated.map(v => {
      const parentDept = v.dept || v.department || 'Information Technology';
      const statusValue = v.status;
      const actStatus = (statusValue === 'Published' || statusValue === 'Active') ? 'Active' : (statusValue === 'Closed' || statusValue === 'Expired') ? 'Expired' : 'Draft';
      return {
        ...v,
        dept: parentDept,
        department: parentDept,
        applicantsCount: v.applications || 0,
        applications: v.applications || 0,
        status: statusValue,
        statusActiveDraft: actStatus
      };
    });

    setVacancies(normalizedUpdated);
    showToast(`Job status changed to ${newStatus}.`, newStatus === 'Closed' ? 'error' : 'success');
    try {
      await dbSync.write('job_openings', normalizedUpdated);
    } catch (e) {
      console.error(e);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    let colorClass = "bg-[#f3f3f1] text-[#606a5f] border-[#d1d1d5]";
    if (status === 'Published') colorClass = "bg-[#508660]/10 text-[#508660] border-[#508660]/30";
    else if (status === 'Closed') colorClass = "bg-[#b22026]/10 text-[#b22026] border-[#b22026]/30";
    else if (status === 'Draft') colorClass = "bg-[#b58c4f]/10 text-[#b58c4f] border-[#b58c4f]/30";
    
    return (
      <span className={`px-2 py-0.5 rounded-full text-[11px] font-black uppercase tracking-widest border ${colorClass}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="flex flex-1 w-full flex-col animate-fadeIn bg-transparent space-y-4 pb-6">
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '', type: 'success' })} />}
      <DeleteConfirmModal isOpen={deleteConfirm.isOpen} onClose={() => setDeleteConfirm({ isOpen: false, id: null })} onConfirm={() => handleDelete(deleteConfirm.id as any)} />
      <JobModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        record={editingJob} 
        onSave={handleSaveJob} 
      />
      {/* FLOAT GUIDE TAB */}
      {typeof document !== 'undefined' && createPortal(
        <button 
          onClick={() => setIsGuideOpen(true)} 
          className="fixed right-0 bg-[#f8f9fa] border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#932c2e] hover:text-white hover:border-[#932c2e] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group"
          style={{ top: '80px' }}
        >
          <HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#7a8b95] group-hover:text-white" />
          <span className="font-black tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[11px]">USER GUIDE</span>
        </button>,
        document.body
      )}
      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      {/* TRANSPARENT PAGE HEADER */}
      <div className="h-14 px-8 flex flex-row items-center justify-between gap-4 z-20 shrink-0">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center group cursor-default shrink-0">
            <div className="absolute inset-0 bg-[#3f809e] blur-[15px] opacity-20 rounded-full"></div>
            <div className="relative z-10 p-1.5 border border-[#3f809e]/40 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm">
              <Megaphone size={28} className="text-[#a94228]" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex flex-col">
            <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none font-sans" style={{ fontSize: '24px' }}>
              JOB <span className="text-[#a94228]">OPENINGS</span> LISTING
            </h3>
            <p className="text-[11px] font-bold text-[#606a5f] uppercase tracking-[0.2em] mt-0.5 leading-none">
              VACANCY POSTINGS & RECRUITMENT STATUS CENTER
            </p>
          </div>
        </div>
        
        {/* TAB CONTROL STANDARDS */}
        <div className="flex items-center gap-4">
          <div className="bg-white/50 p-1.5 rounded-xl border border-white/60 shadow-inner flex flex-wrap items-center gap-1">
            <button onClick={() => setActiveTab('positions')} className={`px-5 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'positions' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#7a8b95] hover:text-[#a94228]'}`}>
              <Database size={14} /> Openings List
            </button>
            <button onClick={() => setActiveTab('settings')} className={`px-5 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'settings' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#7a8b95] hover:text-[#a94228]'}`}>
              <Settings size={14} /> Hiring Settings
            </button>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-8 w-full mt-[2px] pb-6 mb-6 flex-1 flex flex-col min-h-0">
        <div className="w-full space-y-4">
          {/* KPI CARDS COMPACT & LEAN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
            <KpiCard
              label="Total Openings"
              value={kpiData.total}
              icon={Briefcase}
              color={THEME.primary}
              description={`All Registered`} />
            <KpiCard
              label="Active (Published)"
              value={kpiData.active}
              icon={Globe}
              color={THEME.success}
              description="Live Careers Page" />
            <KpiCard
              label="Total Applications"
              value={kpiData.totalApps}
              icon={Users}
              color={THEME.skyBlue}
              description="Candidate Inflow" />
            <KpiCard
              label="Drafts Pending"
              value={kpiData.drafts}
              icon={FileText}
              color={THEME.gold}
              description="Awaiting Review" />
          </div>

          {activeTab === 'positions' ? (
            <div className="bg-white rounded-3xl shadow-lg border border-[#eaeaec] overflow-hidden flex flex-col  flex-1 min-h-0">
              
              {/* TOOLBAR */}
              <div className="px-8 py-4 border-b border-[#eaeaec] bg-[#f8f9fa] flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 justify-items-stretch">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="bg-[#f3f3f1] pl-4 pr-8 py-2 text-[11px] border border-[#eaeaec] rounded-full font-bold outline-none focus:border-[#b58c4f] focus:bg-white shadow-sm text-[#414757] transition-all uppercase tracking-wider cursor-pointer w-full sm:w-auto min-w-[120px]">
                    {DEPARTMENTS.map(d => <option key={d} value={d}>DEPT: {d}</option>)}
                  </select>
                  <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="bg-[#f3f3f1] pl-4 pr-8 py-2 text-[11px] border border-[#eaeaec] rounded-full font-bold outline-none focus:border-[#b58c4f] focus:bg-white shadow-sm text-[#414757] transition-all uppercase tracking-wider cursor-pointer w-full sm:w-auto min-w-[150px]">
                    {STATUSES.map(s => <option key={s} value={s}>STATUS: {s}</option>)}
                  </select>
                  
                  <span className="text-[#d1d1d5] mx-1 hidden lg:block">|</span>
                  
                  <div className="relative flex-1 w-full lg:w-48">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a94228]" />
                    <input type="text" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search job title, ID..." className="w-full pl-10 pr-4 py-2 text-[11px] border border-[#eaeaec] rounded-full font-bold outline-none focus:border-[#b58c4f] bg-[#f3f3f1] focus:bg-white shadow-sm text-[#2f2926] transition-all placeholder:text-[#7a8b95]" />
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button onClick={() => handleOpenModal()} className="bg-[#212c46] hover:bg-[#a94228] text-white px-6 py-2 rounded-full font-black text-[11px] uppercase tracking-widest shadow-md transition-all flex items-center gap-2 shrink-0 border border-transparent cursor-pointer">
                    <Plus size={14} strokeWidth={3} /> New Post
                  </button>
                </div>
              </div>

              {/* DATA TABLE */}
              <div className="overflow-auto custom-scrollbar  flex-1 min-h-0">
                <table className="w-full text-left font-sans border-collapse">
                  <thead className="bg-[#222b38] text-white border-b-2 border-[#709654]">
                    <tr>
                      <th className="py-4 px-4 whitespace-nowrap text-[12px] font-black uppercase tracking-widest">Job ID</th>
                      <th className="py-4 px-4 whitespace-nowrap text-[12px] font-black uppercase tracking-widest">Position & Dept</th>
                      <th className="py-4 px-4 whitespace-nowrap text-[12px] font-black uppercase tracking-widest">Hiring Details</th>
                      <th className="py-4 px-4 text-center whitespace-nowrap text-[12px] font-black uppercase tracking-widest">Applications</th>
                      <th className="py-4 px-4 text-center whitespace-nowrap text-[12px] font-black uppercase tracking-widest">Status</th>
                      <th className="py-4 px-4 text-center whitespace-nowrap text-[12px] font-black uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#eaeaec]">
                    {paginatedData.map((job) => (
                      <tr key={job.id} className="hover:bg-[#fdfaf1] transition-colors group cursor-pointer" onClick={() => handleOpenModal(job)}>
                        <td className="py-2.5 px-4 text-[12px]">
                          <p className="text-[#a94228] font-black text-[12px] font-mono">{job.jobId}</p>
                          <p className="text-[11px] text-[#7a8b95] font-bold mt-0.5">JD: {job.jdRef || 'Custom'}</p>
                        </td>
                        <td className="py-2.5 px-4 text-[12px]">
                          <p className="text-[12px] font-black text-[#2f2926] uppercase tracking-tight">{job.title}</p>
                          <p className="text-[11px] font-bold text-[#606a5f] uppercase mt-0.5 tracking-widest">{job.dept}</p>
                        </td>
                        <td className="py-2.5 px-4 text-[12px]">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-1.5 py-0.5 rounded text-[11px] font-black uppercase tracking-widest bg-[#3f809e]/10 text-[#3f809e] border border-[#3f809e]/20">{job.type}</span>
                            <span className="text-[#606a5f] text-[11px] font-black uppercase tracking-widest flex items-center gap-1"><MapPin size={10}/> {job.location}</span>
                          </div>
                          <p className="text-[11px] font-bold text-[#7a8b95] flex items-center gap-1">
                            HC: {job.headcount} | Closing: <span className={new Date(job.closingDate) < new Date() ? 'text-[#b22026]' : ''}>{job.closingDate}</span>
                          </p>
                        </td>
                        <td className="py-2.5 px-4 text-center text-[12px]">
                          <div className="inline-flex items-center justify-center bg-[#f3f3f1] border border-[#d1d1d5] rounded-lg px-3 py-1 gap-2 shadow-inner">
                            <Users size={12} className="text-[#a94228]" />
                            <span className="font-black text-[#212c46] text-[12px] font-mono">{job.applications}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <StatusBadge status={job.status} />
                        </td>
                        <td className="py-2.5 px-4 text-center text-[12px]">
                          <div className="flex justify-center items-center gap-[1px]" onClick={e => e.stopPropagation()}>
                            {job.status !== 'Published' && job.status !== 'Closed' && (
                              <button onClick={() => handleStatusChange(job.id, 'Published')} className="w-8 h-8 flex items-center justify-center rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 hover:shadow-sm transition-all active:scale-90 cursor-pointer" title="Publish Job">
                                <Globe size={16} strokeWidth={2.5} />
                              </button>
                            )}
                            {job.status === 'Published' && (
                              <button onClick={() => handleStatusChange(job.id, 'Closed')} className="w-8 h-8 flex items-center justify-center rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 hover:shadow-sm transition-all active:scale-90 cursor-pointer" title="Close Job">
                                <XCircle size={16} />
                              </button>
                            )}
                            <div className="w-[1px] h-4 bg-[#d1d1d5] mx-1"></div>
                            <button onClick={() => handleOpenModal(job)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#606a5f] hover:bg-[#eaeaec] hover:text-[#2f2926] hover:shadow-sm transition-all active:scale-90 cursor-pointer" title="Edit Job Post">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => setDeleteConfirm({ isOpen: true, id: job.id })} className="w-8 h-8 flex items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50 hover:shadow-sm transition-all active:scale-90 cursor-pointer" title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {paginatedData.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-10 text-[#7a8b95] font-bold text-[12px]">No job vacancies found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="px-8 py-3 bg-[#f8f9fa] border-t border-[#eaeaec] flex flex-col md:flex-row justify-between items-center gap-4 rounded-b-[24px] shrink-0">
                <div className="flex items-center gap-6 text-[11px] font-black text-[#7a8b95] uppercase tracking-widest">
                  <div className="flex items-center gap-3">
                    <span>Display Rows:</span>
                    <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="bg-white border border-[#eaeaec] rounded-lg px-2.5 py-1.5 outline-none font-black text-[#212c46] cursor-pointer shadow-sm focus:border-[#b58c4f]">
                      {[5, 10, 20, 50].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <p className="bg-white px-4 py-2 rounded-xl border border-[#eaeaec] shadow-sm font-mono text-[11px]">Total Records: {filteredVacancies.length}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`w-10 h-10 border border-[#eaeaec] bg-white rounded-xl flex items-center justify-center transition-all cursor-pointer ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#212c46] hover:text-white shadow-md active:scale-90'}`}>
                    <ChevronLeft size={18}/>
                  </button>
                  <div className="bg-[#212c46] text-white px-8 py-2.5 rounded-xl shadow-md font-black text-[11px] min-w-[140px] text-center uppercase tracking-widest font-mono text-center">
                    Page {currentPage} / {totalPages || 1}
                  </div>
                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className={`w-10 h-10 border border-[#eaeaec] bg-white rounded-xl flex items-center justify-center transition-all cursor-pointer ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#212c46] hover:text-white shadow-md active:scale-90'}`}>
                    <ChevronRight size={18}/>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* RECRUITMENT SETTINGS (STANDARDIZED WITH USER PERMISSIONS) */
            (<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn pb-6">
              {/* LEFT: POLICY INFO */}
              <div className="lg:col-span-4 bg-white/90 p-6 rounded-3xl shadow-lg border border-[#eaeaec] h-fit space-y-5">
                <h3 className="text-[14px] font-black text-[#212c46] uppercase tracking-widest flex items-center gap-3 border-b-2 border-[#b58c4f] pb-4 mb-2">
                  <ShieldCheck size={20} className="text-[#a94228]" /> HIRING COMPLIANCE
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-[#f8f9fa] border border-[#eaeaec] rounded-xl shadow-xs">
                    <strong className="text-[12px] text-[#212c46] block uppercase tracking-wide mb-1">Standard Lifecycle Rules</strong>
                    <p className="text-[11px] text-[#606a5f] leading-relaxed">ตำแหน่งงานเริ่มต้นแบบ Draft จะไม่มีการแสดงผลบนเว็บสาธารณะ จนกว่าผู้ตรวจสอบ (Verifier) จะกดอนุมัติจริง</p>
                  </div>
                  <div className="p-4 bg-[#932c2e]/10 border border-[#932c2e]/20 rounded-xl shadow-xs">
                    <strong className="text-[12px] text-[#932c2e] block uppercase tracking-wide mb-1">Budget Restrictions</strong>
                    <p className="text-[11px] text-[#414757] leading-relaxed">ระบบจำกัดอัตราเงินเดือนสูงสุดตามเกณฑ์แผนงาน HR Plan ที่เชื่อมตรงระบบ Google Sheets</p>
                  </div>
                </div>
              </div>
              {/* RIGHT: CONFIGURATION WORKSPACE */}
              <div className="lg:col-span-8 bg-white rounded-3xl shadow-lg border border-[#eaeaec] overflow-hidden">
                <div className="p-6 bg-[#f8f9fa] border-b border-[#eaeaec] flex justify-between items-center">
                  <h4 className="text-[14px] font-black uppercase text-[#212c46] tracking-widest flex items-center gap-3">
                    <Sliders size={20} className="text-[#b58c4f]"/> HR ATS SETTINGS
                  </h4>
                  <button onClick={() => showToast("Hiring requirements updated.")} className="bg-[#212c46] hover:bg-[#a94228] text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all">
                    Save Settings
                  </button>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-[#eaeaec] hover:border-[#b58c4f]/50 transition-all bg-white shadow-sm">
                    <div>
                      <strong className="text-[12px] text-[#212c46] block uppercase tracking-widest">Auto-Approve From Manpower Requests</strong>
                      <span className="text-[11px] text-[#7a8b95]">อนุมัติลงประกาศอัตโนมัติหากได้รับการจ้างงานจากส่วนวางแผนกำลังคน</span>
                    </div>
                    <button 
                      onClick={() => setPolicies(p => ({ ...p, autoApprove: !p.autoApprove }))}
                      className={`px-4 py-2 rounded-xl font-black text-[11px] uppercase border transition-all ${policies.autoApprove ? 'bg-[#508660]/10 border-[#508660]/30 text-[#508660]' : 'bg-white border-[#d1d1d5] text-[#7a8b95]'}`}
                    >
                      {policies.autoApprove ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-[#eaeaec] hover:border-[#b58c4f]/50 transition-all bg-white shadow-sm">
                    <div>
                      <strong className="text-[12px] text-[#212c46] block uppercase tracking-widest">Global Recruitment Lock</strong>
                      <span className="text-[11px] text-[#7a8b95]">ปิดระงับการแก้ไขและสร้างข้อมูลสมัครงานชั่วคราวทั่วประเทศ</span>
                    </div>
                    <button 
                      onClick={() => setPolicies(p => ({ ...p, recruitmentLock: !p.recruitmentLock }))}
                      className={`px-4 py-2 rounded-xl font-black text-[11px] uppercase border transition-all ${policies.recruitmentLock ? 'bg-rose-100 border-rose-300 text-[#b22026] animate-pulse' : 'bg-white border-[#d1d1d5] text-[#7a8b95]'}`}
                    >
                      {policies.recruitmentLock ? 'LOCKED' : 'UNLOCKED'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-[#eaeaec] hover:border-[#b58c4f]/50 transition-all bg-white shadow-sm">
                    <div>
                      <strong className="text-[12px] text-[#212c46] block uppercase tracking-widest">External Careers Page Sync</strong>
                      <span className="text-[11px] text-[#7a8b95]">ซิงโครไนซ์ตำแหน่ง Published ไปยัง JobDB และสมาคมหางาน</span>
                    </div>
                    <button 
                      onClick={() => setPolicies(p => ({ ...p, externalSync: !p.externalSync }))}
                      className={`px-4 py-2 rounded-xl font-black text-[11px] uppercase border transition-all ${policies.externalSync ? 'bg-[#508660]/10 border-[#508660]/30 text-[#508660]' : 'bg-white border-[#d1d1d5] text-[#7a8b95]'}`}
                    >
                      {policies.externalSync ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>

                  <div className="p-4 rounded-xl border border-[#eaeaec] bg-white shadow-sm">
                    <strong className="text-[12px] text-[#212c46] block uppercase tracking-widest mb-2">Standard Expiry Scope (Days)</strong>
                    <input 
                      type="number" 
                      value={policies.standardClosingDays} 
                      onChange={(e) => setPolicies(p => ({ ...p, standardClosingDays: Number(e.target.value) }))}
                      className="w-full bg-slate-50 border border-[#eaeaec] px-4 py-2.5 rounded-lg text-[12px] font-bold text-[#212c46] outline-none focus:border-[#a94228] transition-all" 
                    />
                  </div>
                </div>
              </div>
            </div>)
          )}

          {/* Spacer to push content from footer exactly */}
          <div className="mt-8 h-1"></div>

        </div>
      </div>
    </div>
  );
}
