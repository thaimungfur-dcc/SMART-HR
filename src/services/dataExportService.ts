import { db, auth } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

export interface ExportLogItem {
  timestamp: string;
  userEmail: string;
  module: 'Payroll' | 'Attendance' | 'Employees';
  format: 'CSV' | 'PDF';
  recordCount: number;
}

export const dataExportService = {
  async logExport(module: 'Payroll' | 'Attendance' | 'Employees', format: 'CSV' | 'PDF', recordCount: number) {
    try {
      const email = auth.currentUser?.email || 'admin@tallintelligence.co.th';
      await addDoc(collection(db, 'system_exports_audit'), {
        timestamp: new Date().toISOString(),
        userEmail: email,
        module,
        format,
        recordCount
      });
      console.log('Export audited and saved in Firestore');
    } catch (err) {
      console.warn('Audit logging failed but proceeding gracefully', err);
    }
  },

  exportToCSV(data: any[], filename: string) {
    if (data.length === 0) return;
    
    // Get distinct fields across all rows
    const allKeys = new Set<string>();
    data.forEach(row => {
      Object.keys(row).forEach(k => allKeys.add(k));
    });
    const headers = Array.from(allKeys);
    
    // Build CSV content with BOM for proper Thai characters display in Excel
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(fieldName => {
          const val = row[fieldName];
          const stringVal = val === undefined || val === null ? '' : String(val);
          // Escape quote marks
          const escaped = stringVal.replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',')
      )
    ].join('\r\n');
    
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
