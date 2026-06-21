import KpiCard from '../../components/shared/KpiCard';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  CalendarDays, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Tag, 
  FileText, 
  X, 
  RefreshCw, 
  AlertCircle, 
  BookOpen, 
  Award, 
  Globe, 
  Compass, 
  Info,
  Layers,
  Sparkles,
  SlidersHorizontal,
  Briefcase
} from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useLanguage } from '../../context/LanguageContext';
import { dbSync } from '../../services/dbSync';
import { DraggableModal } from '../../components/shared/DraggableModal';
import { motion, AnimatePresence } from 'motion/react';

const MySwal = withReactContent(Swal);

// Standard structures
interface CustomHoliday {
  id: string;
  date: string;
  titleTh: string;
  titleEn: string;
  type: 'Public Holiday' | 'Religious Holiday' | 'Royal Holiday' | 'Corporate Holiday' | string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function CompanyHolidays() {
  const { t } = useLanguage();
  
  // States
  const [holidays, setHolidays] = useState<CustomHoliday[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form fields
  const [formValues, setFormValues] = useState({
    date: new Date().toISOString().split('T')[0],
    titleTh: '',
    titleEn: '',
    type: 'Public Holiday',
    description: ''
  });

  // Load holidays
  const loadHolidays = async () => {
    setIsLoading(true);
    try {
      const response = await dbSync.read('CompanyHolidays');
      if (response && response.data && Array.isArray(response.data.items)) {
        // Sort holidays chronologically
        const sorted = [...response.data.items].sort((a: any, b: any) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        setHolidays(sorted);
      }
    } catch (err) {
      console.error('Failed to read CompanyHolidays datastore:', err);
      MySwal.fire('Error', 'Unable to load company holidays.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHolidays();
  }, []);

  // Compute stat metrics for KPIs
  const metrics = useMemo(() => {
    const total = holidays.length;
    const publicCount = holidays.filter(h => h.type === 'Public Holiday').length;
    const religiousCount = holidays.filter(h => h.type === 'Religious Holiday').length;
    const adminCount = holidays.filter(h => h.type === 'Royal Holiday' || h.type === 'Corporate Holiday').length;
    
    return {
      total,
      publicCount,
      religiousCount,
      adminCount
    };
  }, [holidays]);

  // Handle Search and Category Filter
  const filteredHolidays = useMemo(() => {
    return holidays.filter(h => {
      const matchesSearch = 
        (h.titleTh || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (h.titleEn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (h.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (h.date || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = selectedTypeFilter === 'All' || h.type === selectedTypeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [holidays, searchQuery, selectedTypeFilter]);

  // Open creation modal
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setFormValues({
      date: new Date().toISOString().split('T')[0],
      titleTh: '',
      titleEn: '',
      type: 'Public Holiday',
      description: ''
    });
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEditModal = (holiday: CustomHoliday) => {
    setModalMode('edit');
    setEditingId(holiday.id);
    setFormValues({
      date: holiday.date || '',
      titleTh: holiday.titleTh || '',
      titleEn: holiday.titleEn || '',
      type: holiday.type || 'Public Holiday',
      description: holiday.description || ''
    });
    setIsModalOpen(true);
  };

  // Save creation or modifications
  const handleSaveHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formValues.date || !formValues.titleTh || !formValues.titleEn) {
      MySwal.fire('Missing Information', 'โปรดป้อนวันที่และชื่อทั้งภาษาไทยและภาษาอังกฤษค่ะ', 'warning');
      return;
    }

    const payload: CustomHoliday = {
      id: modalMode === 'create' ? `hld-${Date.now()}` : (editingId || ''),
      date: formValues.date,
      titleTh: formValues.titleTh,
      titleEn: formValues.titleEn,
      type: formValues.type,
      description: formValues.description
    };

    setIsLoading(true);
    try {
      await dbSync.write('CompanyHolidays', [payload]);
      setIsModalOpen(false);
      MySwal.fire({
        title: 'Success!',
        text: modalMode === 'create' ? 'เพิ่มบันทึกวันหยุดบริษัทเรียบร้อยแล้วค่ะ' : 'ปรับเปลี่ยนข้อมูลวันหยุดเสร็จสมบูรณ์',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      loadHolidays();
    } catch (err) {
      console.error('Failed to write company holidays data:', err);
      MySwal.fire('Error', 'ไม่สามารถบันทึกข้อมูลวันหยุดได้ค่ะ', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete holiday
  const handleDeleteHoliday = async (holiday: CustomHoliday) => {
    const confirmation = await MySwal.fire({
      title: t('Delete Holiday Confirmation'),
      text: `${holiday.titleTh} / ${holiday.titleEn}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#932c2e',
      cancelButtonColor: '#212c46',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel'
    });

    if (confirmation.isConfirmed) {
      setIsLoading(true);
      try {
        await dbSync.delete('CompanyHolidays', [{ id: holiday.id }]);
        MySwal.fire({
          title: 'Deleted!',
          text: 'ลบข้อมูลบันทึกวันหยุดบริษัทสำเร็จเรียบร้อยค่ะ',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        loadHolidays();
      } catch (err) {
        console.error('Failed to delete company holiday:', err);
        MySwal.fire('Error', 'ไม่สามารถลบข้อมูลวันหยุดนี้ได้ค่ะ', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // For nice date displays (Thai / English depending on system language setting)
  const formatHolidayDate = (dateStr: string) => {
    if (!dateStr) return { day: '', monthShort: '', year: '', full: '' };
    try {
      const d = new Date(dateStr);
      // Let's print styled dates
      const day = d.getDate();
      const monthShort = d.toLocaleString('en-US', { month: 'short' });
      const year = d.getFullYear();
      return { day: String(day), monthShort: String(monthShort), year: String(year), full: `${day} ${monthShort} ${year}` };
    } catch (e) {
      return { day: '', monthShort: '', year: '', full: dateStr };
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#f8f9fc] px-4 sm:px-8 py-6 overflow-y-auto space-y-6">
      
      {/* HEADER HERO AREA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-[#212c46] to-[#121c2e] p-6 lg:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden shrink-0">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(circle_at_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-[#b58c4f]/10 blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-5 z-10">
          <div className="bg-[#b58c4f]/20 border border-[#b58c4f]/40 p-4 rounded-2xl shadow-inner text-[#b58c4f] shrink-0">
            <CalendarCheckIcon size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-[20px] lg:text-[24px] font-black tracking-tight leading-none uppercase text-white font-tech">
              {t('Company Holidays Portal')}
            </h1>
            <p className="text-[12px] text-slate-300 font-semibold mt-2 max-w-xl">
              {t('Manage Holiday Events')}
            </p>
          </div>
        </div>

        <button 
          onClick={handleOpenCreateModal}
          className="bg-[#b58c4f] hover:bg-[#cdaf63] text-[#121c2e] hover:shadow-[0_0_20px_rgba(181,140,79,0.4)] px-6 py-3 rounded-full font-black text-[11px] uppercase tracking-widest transition-all scale-100 hover:scale-105 active:scale-95 flex items-center gap-2 border border-transparent shadow-lg cursor-pointer z-10 shrink-0"
        >
          <Plus size={15} strokeWidth={3.5} /> {t('Add Company Holiday')}
        </button>
      </div>

      {/* KPI METADATA DASHBOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <KpiCard 
          label={t('Total Off-Days Listed')} 
          value={metrics.total} 
          icon={CalendarDays} 
          color="#3f809e" 
          description={`${t('Active Personnel')} Off`}
        />
        <KpiCard 
          label={t('Public Holiday')} 
          value={metrics.publicCount} 
          icon={Globe} 
          color="#d96245" 
          description={t('Public Holidays')}
        />
        <KpiCard 
          label={t('Religious Holiday')} 
          value={metrics.religiousCount} 
          icon={BookOpen} 
          color="#b58c4f" 
          description={t('Religious Holidays')}
        />
        <KpiCard 
          label={t('Corporate Holiday')} 
          value={metrics.adminCount} 
          icon={Award} 
          color="#525f7a" 
          description="HM & Corporate Specific"
        />
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-white rounded-2xl p-4 border border-[#eaeaec] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        {/* Dynamic Category Pill Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Public Holiday', 'Religious Holiday', 'Royal Holiday', 'Corporate Holiday'].map((typeOption) => (
            <button
              key={typeOption}
              onClick={() => setSelectedTypeFilter(typeOption)}
              className={`px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer border ${
                selectedTypeFilter === typeOption
                  ? 'bg-[#212c46] text-white border-[#212c46] shadow-sm'
                  : 'bg-slate-50 text-[#525f7a] border-[#eaeaec] hover:bg-slate-100'
              }`}
            >
              {typeOption === 'All' ? t('All Types') : t(typeOption)}
            </button>
          ))}
        </div>

        {/* Search Input Bar */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <Search size={14} strokeWidth={2.5} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search Holiday Details...')}
            className="w-full pl-10 pr-4 py-2 text-[11.5px] border border-[#eaeaec] rounded-full font-bold outline-none focus:border-[#3f809e] text-[#212c46] transition-all bg-white"
          />
        </div>
      </div>

      {/* HOLIDAYS MAIN CONTAINER */}
      <div className="bg-white rounded-3xl border border-[#eaeaec] shadow-md overflow-hidden flex flex-col  flex-1 min-h-0">
        
        {/* Loading overlay panel */}
        {isLoading && holidays.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
            <RefreshCw className="animate-spin text-[#3f809e] mb-3" size={32} />
            <p className="text-[12px] font-black uppercase tracking-wider">{t('Loading')}...</p>
          </div>
        ) : filteredHolidays.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
            <Calendar size={48} strokeWidth={1} className="text-slate-300 mb-2" />
            <p className="text-[13px] font-black uppercase tracking-wider text-slate-500">{t('No match entries')}</p>
            <p className="text-[11px] text-slate-400 mt-1">ทดลองค้นหาโดยระบุกิจกรรม ชื่อสะกด หรือเปลี่ยนตัวกรองวันหยุดค่ะ</p>
          </div>
        ) : (
          <div className=" overflow-auto custom-scrollbar  flex-1 min-h-0">
            <table className="w-full text-left font-sans border-collapse min-w-[750px]">
              <thead className="bg-[#212c46] text-white select-none sticky top-0 z-10">
                <tr className="border-b-2 border-[#b7a159]">
                  <th className="py-4 px-6 font-black uppercase tracking-widest text-[10px] w-48 text-center">{t('Observe Date')}</th>
                  <th className="py-4 px-6 font-black uppercase tracking-widest text-[10px]">{t('Holiday Title (Thai)')}</th>
                  <th className="py-4 px-6 font-black uppercase tracking-widest text-[10px]">{t('Holiday Name (English)')}</th>
                  <th className="py-4 px-6 font-black uppercase tracking-widest text-[10px] text-center w-48">{t('Holiday type')}</th>
                  <th className="py-4 px-6 font-black uppercase tracking-widest text-[10px] text-center w-32">{t('Action Panel')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#eaeaec]">
                {filteredHolidays.map((item, index) => {
                  const dateInfo = formatHolidayDate(item.date);
                  
                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-50/50 transition-colors ${index % 2 === 1 ? 'bg-slate-50/20' : ''}`}
                    >
                      {/* Observe Date Calendar Box Display */}
                      <td className="py-4 px-6 text-center select-none">
                        <div className="inline-flex flex-col items-center justify-center bg-slate-100/80 border border-slate-200/50 rounded-2xl w-28 py-1.5 shadow-sm">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#3f809e]">{dateInfo.monthShort}</span>
                          <span className="text-lg font-black font-tech text-[#212c46] leading-none mt-0.5">{dateInfo.day}</span>
                          <span className="text-[9px] font-bold text-slate-400 tracking-wider mt-0.5 bg-slate-200/50 px-2 py-0.5 rounded-full">{dateInfo.year}</span>
                        </div>
                      </td>

                      {/* Thai Title */}
                      <td className="py-4 px-6">
                        <span className="text-[13px] font-black text-[#212c46] uppercase tracking-tight block">
                          {item.titleTh}
                        </span>
                        {item.description && (
                          <span className="text-[10px] text-slate-400 font-semibold block mt-1 line-clamp-1">
                            {item.description}
                          </span>
                        )}
                      </td>

                      {/* English Title */}
                      <td className="py-4 px-6">
                        <span className="text-[12.5px] font-bold text-[#525f7a] tracking-tight block">
                          {item.titleEn}
                        </span>
                      </td>

                      {/* Holiday Classification Chip */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border font-tech
                          ${item.type === 'Public Holiday' ? 'bg-[#d96245]/10 text-[#d96245] border-[#d96245]/30' : 
                            item.type === 'Religious Holiday' ? 'bg-[#b58c4f]/15 text-[#b58c4f] border-[#b58c4f]/35' : 
                            item.type === 'Royal Holiday' ? 'bg-amber-500/10 text-amber-700 border-amber-500/30' :
                            'bg-[#3f809e]/10 text-[#3f809e] border-[#3f809e]/20'}`}>
                          {t(item.type)}
                        </span>
                      </td>

                      {/* Editing Actions */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="bg-slate-100 hover:bg-[#3f809e]/10 border border-slate-200 hover:border-[#3f809e]/30 text-slate-600 hover:text-[#3f809e] p-2 rounded-xl transition-all cursor-pointer"
                            title={t('Edit Holiday Details')}
                          >
                            <Edit size={12} strokeWidth={2.5} />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteHoliday(item)}
                            className="bg-slate-100 hover:bg-[#932c2e]/10 border border-slate-200 hover:border-[#932c2e]/30 text-slate-600 hover:text-[#932c2e] p-2 rounded-xl transition-all cursor-pointer"
                            title={t('Delete')}
                          >
                            <Trash2 size={12} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DRAGGABLE MODAL FORM */}
      <DraggableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? t('Add Company Holiday') : t('Edit Holiday Details')}
        width="max-w-xl"
      >
        <form onSubmit={handleSaveHoliday} className="flex flex-col h-full bg-white">
          <div className="p-6 overflow-y-auto space-y-4">
            
            {/* Holiday Date Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#212c46]">
                {t('Observe Date')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={formValues.date}
                  onChange={(e) => setFormValues(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-[12px] font-bold outline-none focus:border-[#30637c] transition-colors"
                />
              </div>
            </div>

            {/* Holiday Thai Title Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#212c46]">
                {t('Holiday Name (Thai)')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formValues.titleTh}
                onChange={(e) => setFormValues(prev => ({ ...prev, titleTh: e.target.value }))}
                placeholder="เช่น วันสงกรานต์"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-[12px] font-bold outline-none focus:border-[#30637c] transition-colors"
              />
            </div>

            {/* Holiday English Title Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#212c46]">
                {t('Holiday Name (English)')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formValues.titleEn}
                onChange={(e) => setFormValues(prev => ({ ...prev, titleEn: e.target.value }))}
                placeholder="e.g. Songkran Festival"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-[12px] font-bold outline-none focus:border-[#30637c] transition-colors"
              />
            </div>

            {/* Classification Selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#212c46]">
                {t('Holiday Classification')}
              </label>
              <select
                value={formValues.type}
                onChange={(e) => setFormValues(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-[12px] font-bold outline-none focus:border-[#30637c] transition-colors"
              >
                <option value="Public Holiday">{t('Public Holiday')}</option>
                <option value="Religious Holiday">{t('Religious Holiday')}</option>
                <option value="Royal Holiday">{t('Royal Holiday')}</option>
                <option value="Corporate Holiday">{t('Corporate Holiday')}</option>
              </select>
            </div>

            {/* Holiday Description Details */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#212c46]">
                {t('Brief Description / Legacy')}
              </label>
              <textarea
                value={formValues.description}
                onChange={(e) => setFormValues(prev => ({ ...prev, description: e.target.value }))}
                placeholder="ระบุวัตถุประสงค์ หรือประวัติย่อบันทึกสำหรับการหยุดชดเชย..."
                rows={3}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-[12px] font-bold outline-none focus:border-[#30637c] transition-colors resize-none"
              />
            </div>
            
          </div>

          {/* Form Actions Footer */}
          <div className="flex justify-end gap-2 p-6 bg-slate-50 border-t border-slate-100 rounded-b-3xl">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2.5 bg-[#eaebee] hover:bg-[#dddee1] text-[#2c3e50] rounded-xl text-[10.5px] uppercase font-black tracking-widest transition-colors cursor-pointer"
            >
              {t('Cancel')}
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 bg-[#212c46] hover:bg-[#303f5f] text-[#b58c4f] hover:text-white rounded-xl text-[10.5px] uppercase font-black tracking-widest transition-all cursor-pointer shadow-md"
            >
              {t('Save Holiday Entry')}
            </button>
          </div>
        </form>
      </DraggableModal>
    </div>
  );
}

// Inline fallback icon render helpers for robust visual support
function CalendarCheckIcon({ size = 20, strokeWidth = 2, className = '' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
      <path d="M16 2v4"/>
      <path d="M8 2v4"/>
      <path d="M3 10h18"/>
      <path d="m9 16 2 2 4-4"/>
    </svg>
  );
}
