/**
 * Print Utilities for accurate rendering of statuses and layouts in Print / PDF Mode.
 */

/**
 * Maps internal application status strings (like 'pending', 'approved') 
 * to corresponding CSS class markers (e.g. 'status-pending') for accurate rendering.
 * Supports both English and Thai status variants.
 */
export function getStatusPrintClass(status: string): string {
  if (!status) return 'status-default';
  const normalized = status.toLowerCase().trim();
  
  switch (normalized) {
    // Pending group
    case 'pending':
    case 'waiting':
    case 'รออนุมัติ':
    case 'กำลังรอ':
      return 'status-pending';

    // Approved & Completed group
    case 'approved':
    case 'certified':
    case 'completed':
    case 'passed':
    case 'success':
    case 'อนุมัติแล้ว':
    case 'สำเร็จ':
    case 'ผ่านเกณฑ์':
      return 'status-approved';

    // Active & Progress group
    case 'active':
    case 'coaching':
    case 'in progress':
    case 'กำลังอบรม':
    case 'กำลังดำเนินการ':
      return 'status-active';

    // Rejected & Discarded group
    case 'rejected':
    case 'failed':
    case 'cancelled':
    case 'discarded':
    case 'ไม่อนุมัติ':
    case 'ล้มเหลว':
    case 'ยกเลิก':
      return 'status-rejected';

    default:
      return 'status-default';
  }
}

/**
 * Custom CSS definitions to be injected into printable pages 
 * for accurate rendering of status indicators and overall layout.
 */
export const PRINT_STATUS_STYLES = `
  /* Print Layout & Typography Definitions */
  @media print {
    body {
      background-color: #ffffff !important;
      color: #000000 !important;
      font-family: 'Inter', 'Noto Sans Thai', sans-serif !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }

  /* Status CSS Class Markers for Print Mode */
  .status-pending {
    background-color: #fef3c7 !important;
    color: #d97706 !important;
    border: 1px solid #f59e0b !important;
    padding: 3px 8px !important;
    border-radius: 4px !important;
    font-size: 11px !important;
    font-weight: bold !important;
    text-transform: uppercase !important;
    display: inline-block !important;
    white-space: nowrap !important;
  }

  .status-approved {
    background-color: #d1fae5 !important;
    color: #059669 !important;
    border: 1px solid #10b981 !important;
    padding: 3px 8px !important;
    border-radius: 4px !important;
    font-size: 11px !important;
    font-weight: bold !important;
    text-transform: uppercase !important;
    display: inline-block !important;
    white-space: nowrap !important;
  }

  .status-active {
    background-color: #dbeafe !important;
    color: #2563eb !important;
    border: 1px solid #3b82f6 !important;
    padding: 3px 8px !important;
    border-radius: 4px !important;
    font-size: 11px !important;
    font-weight: bold !important;
    text-transform: uppercase !important;
    display: inline-block !important;
    white-space: nowrap !important;
  }

  .status-rejected {
    background-color: #fee2e2 !important;
    color: #dc2626 !important;
    border: 1px solid #ef4444 !important;
    padding: 3px 8px !important;
    border-radius: 4px !important;
    font-size: 11px !important;
    font-weight: bold !important;
    text-transform: uppercase !important;
    display: inline-block !important;
    white-space: nowrap !important;
  }

  .status-default {
    background-color: #f3f4f6 !important;
    color: #4b5563 !important;
    border: 1px solid #d1d5db !important;
    padding: 3px 8px !important;
    border-radius: 4px !important;
    font-size: 11px !important;
    font-weight: bold !important;
    display: inline-block !important;
    white-space: nowrap !important;
  }
`;
