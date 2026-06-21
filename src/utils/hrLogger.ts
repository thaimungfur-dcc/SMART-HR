import { dbSync } from '../services/dbSync';

export interface HrLogEntry {
  id: string;
  timestamp: string;
  module: string;
  action: string;
  details: string;
  user: string;
  ip?: string;
  status: 'Success' | 'Failed' | 'Warning';
}

export async function registerHrLog(module: string, action: string, details: string) {
  try {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const id = `LOG-${Date.now()}`;
    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') || 'hr-operator@chaisri.co.th' : 'system';
    
    const newLog: HrLogEntry = {
      id,
      timestamp,
      module,
      action,
      details,
      user: userEmail,
      status: 'Success'
    };

    // Read previous logs to append
    let currentLogs: HsLogWrapper | HrLogEntry[] = [];
    try {
      const response = await dbSync.read('hr_logs');
      if (Array.isArray(response)) {
        currentLogs = response;
      } else if (response && response.status === 'success' && response.data && Array.isArray(response.data.items)) {
        currentLogs = response.data.items;
      } else if (response && Array.isArray((response as any).items)) {
        currentLogs = (response as any).items;
      }
    } catch (e) {
      // Ignored
    }

    const logList = Array.isArray(currentLogs) ? currentLogs : [];
    logList.unshift(newLog);

    await dbSync.write('hr_logs', logList.slice(0, 500)); // limit to 500 logs
  } catch (err) {
    console.error('[HrLogger] Failed to registering logs:', err);
  }
}

type HsLogWrapper = { status: string; data: { items: HrLogEntry[] } };
