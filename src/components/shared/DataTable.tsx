import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Download, Filter } from 'lucide-react';
import { clsx } from 'clsx';
import { Pagination } from './Pagination';

export interface ColumnDef<T> {
    accessorKey?: keyof T;
    header: string; // was label in previous
    cell?: (row: T) => React.ReactNode; // was render previously
    sortable?: boolean;
    filterable?: boolean; // backwards compatibility
    className?: string;
    
    // Fallbacks for backward compat
    key?: string; 
    label?: string; 
    render?: (value: any, row: any) => React.ReactNode;
}

export interface DataTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    searchable?: boolean;
    searchPlaceholder?: string;
    itemsPerPage?: number;
    onExport?: () => void;
    renderToolbarActions?: () => React.ReactNode;
    emptyText?: string;
    
    // Base compat
    hasPagination?: boolean;
    className?: string;
    onRowClick?: (row: T) => void;
}

export function DataTable<T extends Record<string, any>>({ 
    data, 
    columns, 
    searchable = true, 
    searchPlaceholder = "Search records...", 
    itemsPerPage = 10,
    onExport,
    renderToolbarActions,
    emptyText = "No records found",
    hasPagination = true,
    className,
    onRowClick
}: DataTableProps<T>) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc'|'desc' } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(itemsPerPage);
    const [filters, setFilters] = useState<{ [key: string]: string }>({});

    // Sorting
    const handleSort = (key?: string) => {
        if (!key) return;
        let direction: 'asc'|'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Derived Data
    const processedData = useMemo(() => {
        let filteredData = [...data];

        // Search overall
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            filteredData = filteredData.filter(item => {
                return Object.values(item).some(val => 
                    val != null && String(val).toLowerCase().includes(lowerSearch)
                );
            });
        }
        
        // Column filters (backward compat)
        if (Object.keys(filters).length > 0) {
            filteredData = filteredData.filter(row => {
                return Object.entries(filters).every(([key, value]) => {
                    if (!value) return true;
                    const rowValue = row[key];
                    return String(rowValue ?? '').toLowerCase().includes(String(value).toLowerCase());
                });
            });
        }

        // Sort
        if (sortConfig) {
            filteredData.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        
        return filteredData;
    }, [data, searchTerm, sortConfig, filters]);

    // Pagination
    const paginatedData = useMemo(() => {
      if (!hasPagination) return processedData;
      const start = (currentPage - 1) * pageSize;
      return processedData.slice(start, start + pageSize);
    }, [processedData, currentPage, pageSize, hasPagination]);

    // Search input effect
    React.useEffect(() => {
        setCurrentPage(1); // Reset page on search or filter
    }, [searchTerm, filters, sortConfig]);

    // Format columns to handle both old and new schema
    const formattedColumns = columns.map(c => ({
        ...c,
        key: c.key || (c.accessorKey as string),
        label: c.label || c.header,
        renderFn: c.render || (c.cell ? (val: any, row: any) => c.cell!(row) : (val: any) => val)
    }));

    return (
        <div className={clsx("bg-white rounded-xl border border-[#eaeaec] shadow-sm overflow-hidden flex flex-col font-sans", className)}>
            {/* Toolbar */}
            <div className="p-4 border-b border-[#eaeaec] bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1 w-full max-w-sm">
                    {searchable && (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#709654] outline-none transition-shadow"
                            />
                        </div>
                    )}
                </div>
                
                <div className="flex items-center gap-2">
                    {renderToolbarActions && renderToolbarActions()}
                    {onExport && (
                        <button 
                            onClick={onExport}
                            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <Download size={16} />
                            Export
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f8f9fa] border-b border-[#eaeaec] sys-table-header">
                        <tr>
                            {formattedColumns.map((col, i) => (
                                <th 
                                    key={col.key || i} 
                                    className={`py-3 px-4 text-[10px] font-black text-[#7a8b95] uppercase tracking-widest ${col.className || ''}`}
                                >
                                    <div className="flex flex-col gap-2">
                                        <div 
                                          className={clsx(
                                              "flex items-center gap-1.5",
                                              col.sortable && "cursor-pointer hover:text-[#212c46] transition-colors"
                                          )}
                                          onClick={() => col.sortable && handleSort(col.key)}
                                        >
                                            {col.label}
                                            {col.sortable && (
                                                <span className="text-gray-300">
                                                    {sortConfig?.key === col.key ? (
                                                        sortConfig.direction === 'asc' ? <ArrowUp size={12} className="text-[#212c46]" /> : <ArrowDown size={12} className="text-[#212c46]" />
                                                    ) : <ArrowUpDown size={12} />}
                                                </span>
                                            )}
                                        </div>
                                        {col.filterable && (
                                          <div className="relative">
                                            <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input 
                                              type="text"
                                              placeholder="Filter..."
                                              value={filters[col.key] || ''}
                                              onChange={(e) => setFilters(prev => ({ ...prev, [col.key]: e.target.value }))}
                                              className="w-full bg-white border border-gray-200 rounded-lg pl-6 pr-2 py-1 text-[10px] font-medium text-gray-700 placeholder:text-gray-400 focus:ring-1 focus:ring-[#709654] outline-none transition-all"
                                            />
                                          </div>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eaeaec]">
                        {paginatedData.length > 0 ? paginatedData.map((row, rowIndex) => (
                            <tr 
                              key={rowIndex} 
                              onClick={() => onRowClick?.(row)}
                              className={clsx(
                                "hover:bg-slate-50 transition-colors",
                                onRowClick && "cursor-pointer"
                              )}
                            >
                                {formattedColumns.map((col, colIndex) => (
                                    <td key={colIndex} className={`py-3 px-4 text-sm text-[#212c46] ${col.className || ''}`}>
                                        {col.renderFn ? col.renderFn(row[col.key], row) : (row[col.key] ?? '-')}
                                    </td>
                                ))}
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={columns.length} className="py-12 text-center text-sm text-gray-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <Filter size={24} className="text-gray-300 mx-auto mb-2" />
                                        <span className="text-[12px] font-bold text-[#7a8b95] uppercase tracking-wider">{emptyText}</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Old Pagination compat, or our built in */}
            {hasPagination && processedData.length > 0 && (
                <Pagination 
                  currentPage={currentPage}
                  totalCount={processedData.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  className="rounded-b-none border-x-0 border-b-0"
                />
            )}
        </div>
    );
}
