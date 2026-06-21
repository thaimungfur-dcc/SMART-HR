import React from 'react';
import { Search, SlidersHorizontal, Palmtree, AlertTriangle, Briefcase, User, Layers, RefreshCw, CheckCircle2, HelpCircle } from 'lucide-react';

interface LeaveFiltersProps {
  selectedDept: string;
  setSelectedDept: (dept: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  leaves: any[];
  onClear: () => void;
}

export function LeaveFilters({
  selectedDept,
  setSelectedDept,
  selectedType,
  setSelectedType,
  searchQuery,
  setSearchQuery,
  leaves,
  onClear,
}: LeaveFiltersProps) {
  // Compute counts dynamically based on active dataset
  const getDeptCount = (deptName: string) => {
    if (deptName === 'All') return leaves.length;
    return leaves.filter((l) => l.department === deptName).length;
  };

  const getTypeCount = (typeName: string) => {
    if (typeName === 'All') return leaves.length;
    return leaves.filter((l) => l.type === typeName).length;
  };

  const departments = [
    { value: 'All', label: 'All Departments / ทุกแผนก' },
    { value: 'Human Resources', label: 'Human Resources (HR)' },
    { value: 'Finance & Accounting', label: 'Finance & Accounting' },
    { value: 'Information Technology', label: 'Information Technology (IT)' },
    { value: 'Production', label: 'Production (ฝ่ายผลิต)' },
    { value: 'Logistics', label: 'Logistics (คลังและขนส่ง)' },
  ];

  const leaveTypes = [
    { value: 'All', label: 'All Leaves / ทุกประเภท', icon: Layers, color: 'text-slate-600 bg-slate-100' },
    { value: 'Vacation', label: 'Vacation / Annual Leave (ลาพักร้อน)', icon: Palmtree, color: 'text-teal-700 bg-teal-50 border-teal-200' },
    { value: 'Sick Leave', label: 'Sick Leave (ลาป่วย)', icon: AlertTriangle, color: 'text-rose-700 bg-rose-50 border-rose-200' },
    { value: 'Business Leave', label: 'Business Leave (ลากิจ)', icon: Briefcase, color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { value: 'Personal Leave', label: 'Personal Leave (ลาส่วนตัว)', icon: User, color: 'text-blue-700 bg-blue-50 border-blue-200' },
  ];

  const isFilterActive = selectedDept !== 'All' || selectedType !== 'All' || searchQuery !== '';

  return (
    <div id="leave_filters_card" className="bg-white rounded-2xl border border-[#eaeaec]/60 p-6 shadow-sm mb-5 transition-all animate-fadeIn">
      <div className="flex flex-col gap-6">
        {/* Header and Quick stats */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-[#eaeaec]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#212c46]/5 flex items-center justify-center text-[#212c46]">
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <h4 className="text-[13px] font-black uppercase text-[#212c46] tracking-widest flex items-center gap-2">
                Leave Filter Controls <span className="text-[10px] text-[#b58c4f] font-mono tracking-normal">(เครื่องมือกรองข้อมูล)</span>
              </h4>
              <p className="text-[11px] font-bold text-[#7691ad] uppercase tracking-wider mt-0.5">
                Segment and filter personnel absence requests by segment or type
              </p>
            </div>
          </div>

          {/* Quick Active Status */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {isFilterActive && (
              <button
                onClick={onClear}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-rose-200 bg-rose-50 text-rose-700 text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-rose-100 transition-all cursor-pointer active:scale-95"
              >
                <RefreshCw size={12} className="animate-spin" style={{ animationDuration: '3s' }} />
                Reset Filters ({[
                  selectedDept !== 'All' ? 'Dept' : '',
                  selectedType !== 'All' ? 'Type' : '',
                  searchQuery ? 'Search' : '',
                ].filter(Boolean).length})
              </button>
            )}
            <div className="px-3.5 py-1.5 rounded-full bg-[#212c46]/5 border border-[#eaeaec] text-[#212c46] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b58c4f] animate-pulse"></span>
              Live Matches: {leaves.length} records
            </div>
          </div>
        </div>

        {/* Row 1: Search and Type Pills */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* Search Box */}
          <div className="xl:col-span-4">
            <label className="text-[10px] font-black text-[#212c46] uppercase tracking-widest block mb-2">
              Search Employee or Reason / ค้นหาชื่อหรือสาเหตุ
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7691ad]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="พิมพ์ชื่อพนักงาน หรือเหตุผลเพื่อค้นหา..."
                className="w-full pl-12 pr-4 py-2.5 text-[12px] border border-[#eaeaec] rounded-xl font-bold outline-none focus:border-[#b7a159] bg-white shadow-sm text-[#212c46] transition-colors"
              />
            </div>
          </div>

          {/* Type Pills */}
          <div className="xl:col-span-8">
            <label className="text-[10px] font-black text-[#212c46] uppercase tracking-widest block mb-2">
              Filter by Leave Type / จำแนกตามประเภทการลา
            </label>
            <div className="flex flex-wrap gap-2.5">
              {leaveTypes.map((type) => {
                const isSelected = selectedType === type.value;
                const Icon = type.icon;
                const count = getTypeCount(type.value);

                return (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`px-4 py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-2 border transition-all cursor-pointer shadow-sm active:scale-95 ${
                      isSelected
                        ? 'bg-[#212c46] border-[#212c46] text-white'
                        : 'bg-white border-[#eaeaec] text-[#435665] hover:bg-[#f8f9fa] hover:border-[#b7a159]'
                    }`}
                  >
                    <Icon size={14} className={isSelected ? 'text-[#b7a159]' : 'text-slate-500'} />
                    <span>{type.label.split(' / ')[0]}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${
                        isSelected
                          ? 'bg-[#b7a159] text-[#212c46]'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 2: Department Pills */}
        <div className="pt-2 border-t border-[#f8f9fa]">
          <label className="text-[10px] font-black text-[#212c46] uppercase tracking-widest block mb-2.5">
            Filter by Department / จำแนกแผนกต้นสังกัด
          </label>
          <div className="flex flex-wrap gap-2">
            {departments.map((dept) => {
              const isSelected = selectedDept === dept.value;
              const count = getDeptCount(dept.value);

              return (
                <button
                  key={dept.value}
                  onClick={() => setSelectedDept(dept.value)}
                  className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all border flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 ${
                    isSelected
                      ? 'bg-[#b58c4f] border-[#b58c4f] text-white'
                      : 'bg-slate-50 border-[#eaeaec] text-[#435665] hover:bg-white hover:border-[#b58c4f]'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-slate-400'}`}></span>
                  <span>{dept.label}</span>
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded text-[9px] font-black ${
                      isSelected
                        ? 'bg-white text-[#b58c4f]'
                        : 'bg-slate-200/60 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
