import { doc, setDoc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from './firebase';
import { GASService, GAS_WEB_APP_URL } from './GoogleAppsScriptService';
import { api } from './api';

/**
 * Sync mapping between Google Sheets and Firestore collections
 */
function getCollectionName(sheetName: string): string {
  const name = sheetName.toLowerCase();
  if (name === 'calendarevents' || name === 'calendar_events') {
    return 'calendar_events';
  }
  if (name === 'accesslogs' || name === 'access_logs' || name === 'system_logs' || name === 'systemlogs') {
    return 'system_logs';
  }
  if (name === 'users' || name === 'userpermissions') {
    return 'users';
  }
  if (name === 'systemconfig') {
    return 'system_config';
  }
  if (name === 'leaverequests' || name === 'leave_requests') {
    return 'leave_requests';
  }
  if (name === 'appraisals' || name === 'appraisal_requests') {
    return 'appraisals';
  }
  if (name === 'employees') {
    return 'employees';
  }
  if (name === 'companyholidays' || name === 'company_holidays' || name === 'holidays') {
    return 'company_holidays';
  }
  return sheetName;
}

export function updateLastSyncTimestamp() {
  const currentTimestamp = new Date().toISOString();
  try {
    localStorage.setItem('last_firebase_sync_time', currentTimestamp);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('firebase-synced', { detail: { timestamp: currentTimestamp } }));
    }
  } catch (err) {
    console.error('Failed to update sync timestamp:', err);
  }
}

export const dbSync = {
  /**
   * Reads data. It first tries to read from Firestore (highly performant / cached),
   * and if Firestore fails or is empty, it falls back to Google Apps Script (Google Sheets),
   * then caches the Google Sheets data in Firestore to speed up subsequent loads.
   * If both fail, it falls back to LocalStorage with robust Seed fallback data.
   */
  async read(sheetName: string): Promise<any> {
    const colName = getCollectionName(sheetName);
    
    // 1. Try Firestore read
    try {
      console.log(`[dbSync] Attempting to read ${sheetName} from Firestore (${colName})...`);
      const colRef = collection(db, colName);
      
      // Implement a 1200ms timeout for Firestore read to prevent long hangs
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Firestore read timeout")), 1200)
      );
      
      const snapshot = await Promise.race([
        getDocs(colRef),
        timeoutPromise
      ]);
      
      if (!snapshot.empty) {
        const items = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        console.log(`[dbSync] Successfully read ${items.length} items from Firestore.`);
        updateLastSyncTimestamp();
        return { status: 'success', data: { items } };
      }
      
      console.log(`[dbSync] Firestore collection ${colName} is empty. Falling back to Google Apps Script...`);
    } catch (err) {
      if (err instanceof Error && (err.message.includes('permission') || err.message.includes('Permission') || (err as any).code === 'permission-denied')) {
        try {
          handleFirestoreError(err, OperationType.LIST, colName);
        } catch (jsonErr) {
          console.error('[dbSync] Firestore permission error logged. Propagating fallback:', jsonErr);
        }
      }
      console.warn(`[dbSync] Firestore read failed or timed out. Falling back to Google Apps Script:`, err);
    }

    // 2. Try Google Apps Script (GAS) read
    if (GAS_WEB_APP_URL && GAS_WEB_APP_URL !== "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE" && GAS_WEB_APP_URL.trim() !== "") {
      try {
        // Implement a 1500ms timeout for GAS read
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("GAS read timeout")), 1500)
        );
        
        const response = await Promise.race([
          GASService.read(sheetName),
          timeoutPromise
        ]);
        
        // Safely sync Google Sheets data back into Firestore in the background for next loads
        if (response && response.status === 'success' && response.data && Array.isArray(response.data.items)) {
          const items = response.data.items;
          console.log(`[dbSync] Syncing ${items.length} items from Google Sheets into Firestore in the background.`);
          this.backgroundSyncToFirestore(sheetName, items).catch(err => {
            console.error('[dbSync] Background sync to Firestore failed:', err);
          });
        }
        
        return response;
      } catch (err) {
        console.warn(`[dbSync] Google Apps Script read failed. Falling back to LocalStorage fallback...`, err);
      }
    } else {
      console.log(`[dbSync] GAS is unconfigured. Skipping read fallback for ${sheetName}.`);
    }

    // 3. LocalStorage Fallback read
    const localKey = `db_sync_fallback_${colName}`;
    try {
      const stored = localStorage.getItem(localKey);
      if (stored) {
        const items = JSON.parse(stored);
        console.log(`[dbSync] Successfully read ${items.length} items from LocalStorage fallback.`);
        return { status: 'success', data: { items } };
      }
    } catch (err) {
      console.error(`[dbSync] LocalStorage read failed:`, err);
    }

    // 4. Default Seed/Mock Data Seed if nothing exists
    let seedItems: any[] = [];
    if (colName === 'calendar_events') {
      seedItems = [
        {
          id: 'seed-event-1',
          date: '2026-06-05',
          title: 'Smart HR Copilot Alignment Session (ประชุมปรับแนวทางระบบผู้ช่วยงาน)',
          time: '11:00',
          type: 'Meeting',
          priority: 'Normal',
          status: 'Confirmed'
        },
        {
          id: 'seed-event-2',
          date: '2026-06-10',
          title: 'Quality Assurance Review (ตรวจสอบและควบคุมคุณภาพงานบุคคล)',
          time: '14:00',
          type: 'Quality',
          priority: 'Normal',
          status: 'Confirmed'
        },
        {
          id: 'seed-event-3',
          date: '2026-06-15',
          title: 'Supplier Audit - Vendor Evaluator (ตรวจประเมินโรงงานผู้บำรุงรักษาโรงงาน)',
          time: '10:00',
          type: 'Audit',
          priority: 'Critical',
          status: 'Scheduled'
        },
        {
          id: 'seed-event-4',
          date: '2026-06-25',
          title: 'Contract Renewal Review (ทบทวนและวางแผนสัญญารับพนักงานเหมาช่วงประจำปี)',
          time: '09:30',
          type: 'Contract',
          priority: 'High',
          status: 'Scheduled'
        }
      ];
    } else if (colName === 'system_config') {
      seedItems = [
        { id: 'cfg_1', key: 'compliance_target', value: '95', description: 'เป้าหมายความสอดคล้องตามกฎระเบียบบริษัท' },
        { id: 'cfg_2', key: 'alert_retention', value: '30', description: 'จำนวนวันในการเก็บประวัติบันทึกความลื่นไหลของระบบ' }
      ];
    } else if (colName === 'leave_requests') {
      seedItems = [
        {
          id: 'LR-001',
          employeeName: 'สมชาย รักดี (Somchai Rakdee)',
          type: 'Vacation',
          start: '2026-06-02',
          end: '2026-06-04',
          days: 3,
          status: 'Approved',
          department: 'Human Resources',
          reason: 'พักผ่อนประจำปีกับครอบครัวที่ต่างจังหวัด'
        },
        {
          id: 'LR-002',
          employeeName: 'วรรณพร สดใส (Wannaporn Sodsai)',
          type: 'Sick Leave',
          start: '2026-06-08',
          end: '2026-06-09',
          days: 2,
          status: 'Approved',
          department: 'Finance & Accounting',
          reason: 'เป็นไข้หวัดตัวร้อน พักรักษาตัวที่บ้าน'
        },
        {
          id: 'LR-003',
          employeeName: 'กิตติพงษ์ ยอดเยี่ยม (Kittipong Yodyiem)',
          type: 'Business Leave',
          start: '2026-06-12',
          end: '2026-06-12',
          days: 1,
          status: 'Pending HR Approval',
          department: 'Information Technology',
          reason: 'มีนัดหมายราชการทำธุรกรรมด้านบัตรประชาชนและที่ดิน'
        },
        {
          id: 'LR-004',
          employeeName: 'นภาลัย เรืองรอง (Napalai Ruangrong)',
          type: 'Vacation',
          start: '2026-06-16',
          end: '2026-06-19',
          days: 4,
          status: 'Approved',
          department: 'Production',
          reason: 'ลาพักผ่อนประจำปี เดินทางต่างประเทศ'
        },
        {
          id: 'LR-005',
          employeeName: 'วิชัย ว่องไว (Wichai Wongwai)',
          type: 'Business Leave',
          start: '2026-06-24',
          end: '2026-06-25',
          days: 2,
          status: 'Approved',
          department: 'Logistics',
          reason: 'ไปดูแลคุณพ่อคุณแม่เดินทางและทำธุระส่วนตัว'
        }
      ];
    } else if (colName === 'employees') {
      seedItems = [
        {
          id: 'EMP-001',
          employeeId: 'U001',
          name: 'สมชาย รักดี (Somchai Rakdee)',
          department: 'Human Resources',
          position: 'HR Manager',
          email: 'somchai.r@chaisri.com',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=250',
          birthDate: '1990-06-05',
          hireDate: '2019-06-15',
          status: 'Active'
        },
        {
          id: 'EMP-002',
          employeeId: 'U002',
          name: 'วรรณพร สดใส (Wannaporn Sodsai)',
          department: 'Finance & Accounting',
          position: 'Senior Accountant',
          email: 'wannaporn.s@chaisri.com',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250',
          birthDate: '1995-06-08',
          hireDate: '2021-06-10',
          status: 'Active'
        },
        {
          id: 'EMP-003',
          employeeId: 'U003',
          name: 'กิตติพงษ์ ยอดเยี่ยม (Kittipong Yodyiem)',
          department: 'Information Technology',
          position: 'IT Lead',
          email: 'kittipong.y@chaisri.com',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250',
          birthDate: '1988-06-14',
          hireDate: '2018-06-01',
          status: 'Active'
        },
        {
          id: 'EMP-004',
          employeeId: 'U004',
          name: 'นภาลัย เรืองรอง (Napalai Ruangrong)',
          department: 'Production',
          position: 'Quality Auditor',
          email: 'napalai.r@chaisri.com',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=250',
          birthDate: '1992-06-18',
          hireDate: '2022-06-25',
          status: 'Active'
        },
        {
          id: 'EMP-005',
          employeeId: 'U005',
          name: 'วิชัย ว่องไว (Wichai Wongwai)',
          department: 'Logistics',
          position: 'Logistics Supervisor',
          email: 'wichai.w@chaisri.com',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=250',
          birthDate: '1991-06-20',
          hireDate: '2020-06-15',
          status: 'Active'
        },
        {
          id: 'EMP-006',
          employeeId: 'U006',
          name: 'สิรินทรา มีสุข (Sirintra Meesook)',
          department: 'Human Resources',
          position: 'HR Recruiter',
          email: 'sirintra.m@chaisri.com',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=250',
          birthDate: '1994-07-02',
          hireDate: '2023-06-12',
          status: 'Active'
        },
        {
          id: 'EMP-007',
          employeeId: 'U007',
          name: 'ชลวิทย์ เก่งกาจ (Chonlawit Kengkarj)',
          department: 'Production',
          position: 'Production Engineer',
          email: 'chonlawit.k@chaisri.com',
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=250',
          birthDate: '1987-06-28',
          hireDate: '2017-06-20',
          status: 'Active'
        }
      ];
    } else if (colName === 'appraisals') {
      seedItems = [
        {
          id: 'APR-001',
          employeeName: 'พิมพพรรณ สวยงาม (Pimphan Suayngam)',
          department: 'Innovation Team',
          position: 'Software Engineer',
          period: 'FY2026 Mid-Year',
          status: 'Pending HR Alignment',
          score: 93,
          grade: 'A',
          selfScore: 90,
          supervisorComments: 'ผลการทำงานมีคุณภาพสูงอย่างต่อเนื่อง ทุ่มเทและกระตือรือร้นในการทำงานร่วมทีมเป็นอย่างดี',
          date: '2026-06-01'
        },
        {
          id: 'APR-002',
          employeeName: 'ชลวิทย์ เก่งกาจ (Chonlawit Kengkarj)',
          department: 'Production',
          position: 'Production Engineer',
          period: 'FY2026 Mid-Year',
          status: 'Pending HR Alignment',
          score: 87,
          grade: 'B+',
          selfScore: 85,
          supervisorComments: 'มีความรับผิดชอบดีเด่น ควบคุมกระบวนการผลิตสอดคล้องตามมาตรฐาน ISO9001 ได้เรียบร้อยดี',
          date: '2026-06-02'
        }
      ];
    } else if (colName === 'company_holidays') {
      seedItems = [
        { id: 'hld-1', date: '2026-01-01', titleTh: 'วันขึ้นปีใหม่', titleEn: "New Year's Day", type: 'Public Holiday', description: 'วันหยุดขึ้นปีใหม่สากล' },
        { id: 'hld-2', date: '2026-03-03', titleTh: 'วันมาฆบูชา', titleEn: 'Makha Bucha Day', type: 'Religious Holiday', description: 'วันสำคัญทางพระพุทธศาสนา' },
        { id: 'hld-3', date: '2026-04-13', titleTh: 'วันสงกรานต์', titleEn: 'Songkran Festival Day 1', type: 'Public Holiday', description: 'วันขึ้นปีใหม่ไทย / วันผู้สูงอายุแห่งชาติ' },
        { id: 'hld-4', date: '2026-04-14', titleTh: 'วันสงกรานต์', titleEn: 'Songkran Festival Day 2', type: 'Public Holiday', description: 'วันครอบครัวไทย' },
        { id: 'hld-5', date: '2026-04-15', titleTh: 'วันสงกรานต์', titleEn: 'Songkran Festival Day 3', type: 'Public Holiday', description: 'วันเถลิงศกใหม่แบบไทย' },
        { id: 'hld-6', date: '2026-05-01', titleTh: 'วันแรงงานแห่งชาติ', titleEn: 'National Labour Day', type: 'Public Holiday', description: 'วันตระหนักสิทธิสตาฟฟ์และแรงงาน' },
        { id: 'hld-7', date: '2026-06-03', titleTh: 'วันเฉลิมพระชนมพรรษาสมเด็จพระราชินี', titleEn: "HM Queen's Birthday", type: 'Royal Holiday', description: 'วันเฉลิมพระชนมพรรษา สมเด็จพระนางเจ้าสุทิดาฯ' },
        { id: 'hld-8', date: '2026-07-28', titleTh: 'วันเฉลิมพระชนมพรรษา รัชกาลที่ 10', titleEn: "HM King's Birthday", type: 'Royal Holiday', description: 'วันเฉลิมพระชนมพรรษา พระบาทสมเด็จพระวชิรเกล้าเจ้าอยู่หัว' },
        { id: 'hld-9', date: '2026-08-12', titleTh: 'วันแม่แห่งชาติ', titleEn: "Mother's Day", type: 'Public Holiday', description: 'วันแม่แห่งชาติ / วันคล้ายวันพระราชสมภพ พระพันปีหลวง' },
        { id: 'hld-10', date: '2026-10-13', titleTh: 'วันคล้ายวันสวรรคต รัชกาลที่ 9', titleEn: 'King Bhumibol Memorial Day', type: 'Public Holiday', description: 'วันคล้ายวันสวรรคต พระบาทสมเด็จพระบรมชนกาธิเบศร มหาภูมิพลอดุลยเดชมหาราช บรมนาถบพิตร' },
        { id: 'hld-11', date: '2026-10-23', titleTh: 'วันปิยมหาราช', titleEn: 'Chulalongkorn Memorial Day', type: 'Public Holiday', description: 'วันระลึกและคล้ายวันสวรรคต พระบาทสมเด็จพระจุลจอมเกล้าเจ้าอยู่หัว' },
        { id: 'hld-12', date: '2026-12-05', titleTh: 'วันพ่อแห่งชาติ', titleEn: "Father's Day", type: 'Public Holiday', description: 'วันพ่อแห่งชาติ / วันชาติไทย' },
        { id: 'hld-13', date: '2026-12-31', titleTh: 'วันสิ้นปี', titleEn: "New Year's Eve", type: 'Public Holiday', description: 'วันหยุดสิ้นท้ายปีเก่าต้อนรับปีใหม่' }
      ];
    }

    // Save Seed items to LocalStorage
    try {
      localStorage.setItem(localKey, JSON.stringify(seedItems));
      console.log(`[dbSync] Seeded ${seedItems.length} items to LocalStorage fallback for ${colName}.`);
    } catch (err) {
      console.error(`[dbSync] Failed to store seed items in LocalStorage:`, err);
    }

    return { status: 'success', data: { items: seedItems } };
  },

  /**
   * Writes one or multiple rows to both Google Sheets and Firebase simultaneously.
   */
  async write(sheetName: string, data: any[]): Promise<any> {
    console.log(`[dbSync] Writing to ${sheetName} (dual persistence active)...`);
    const colName = getCollectionName(sheetName);
    
    // 1. Write to Google Sheets (GAS)
    let gasResponse;
    if (GAS_WEB_APP_URL && GAS_WEB_APP_URL !== "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE" && GAS_WEB_APP_URL.trim() !== "") {
      try {
        gasResponse = await GASService.write(sheetName, data);
      } catch (err) {
        console.warn(`[dbSync] GAS Write failed for ${sheetName}:`, err);
      }
    } else {
      console.log(`[dbSync] GAS is unconfigured. Skipping write for ${sheetName}.`);
    }

    // 2. Write to Firestore
    try {
      const batch = writeBatch(db);
      
      for (const item of data) {
        const idStr = String(item.id || item.employeeId || 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7));
        const docRef = doc(db, colName, idStr);
        
        batch.set(docRef, {
          ...item,
          id: idStr,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
      
      await batch.commit();
      console.log(`[dbSync] Successfully wrote ${data.length} items to Firestore (${colName}).`);
      updateLastSyncTimestamp();
    } catch (err) {
      if (err instanceof Error && (err.message.includes('permission') || err.message.includes('Permission') || (err as any).code === 'permission-denied')) {
        handleFirestoreError(err, OperationType.CREATE, colName);
      }
      console.error(`[dbSync] Firestore Write failed for ${sheetName}:`, err);
    }

    // 3. Write to LocalStorage fallback
    try {
      const localKey = `db_sync_fallback_${colName}`;
      const stored = localStorage.getItem(localKey);
      let localItems: any[] = stored ? JSON.parse(stored) : [];
      for (const item of data) {
        const idStr = String(item.id || item.employeeId || 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7));
        const index = localItems.findIndex(x => String(x.id) === idStr);
        const newItem = {
          ...item,
          id: idStr,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        if (index >= 0) {
          localItems[index] = newItem;
        } else {
          localItems.push(newItem);
        }
      }
      localStorage.setItem(localKey, JSON.stringify(localItems));
      console.log(`[dbSync] Successfully wrote ${data.length} items to LocalStorage fallback.`);
    } catch (err) {
      console.error(`[dbSync] LocalStorage fallback write failed:`, err);
    }

    return gasResponse || { status: 'success', data: { message: 'Saved to Firestore and LocalStorage fallback only' } };
  },

  /**
   * Updates one or multiple rows in both Google Sheets and Firebase simultaneously.
   */
  async update(sheetName: string, data: any[]): Promise<any> {
    console.log(`[dbSync] Updating in ${sheetName} (dual persistence active)...`);
    const colName = getCollectionName(sheetName);
    
    // 1. Update in Google Sheets (GAS)
    let gasResponse;
    if (GAS_WEB_APP_URL && GAS_WEB_APP_URL !== "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE" && GAS_WEB_APP_URL.trim() !== "") {
      try {
        gasResponse = await GASService.update(sheetName, data);
      } catch (err) {
        console.warn(`[dbSync] GAS Update failed for ${sheetName}:`, err);
      }
    } else {
      console.log(`[dbSync] GAS is unconfigured. Skipping update for ${sheetName}.`);
    }

    // 2. Update in Firestore
    try {
      const batch = writeBatch(db);
      
      for (const item of data) {
        if (!item.id) {
          console.warn('[dbSync] Skip update for item missing "id" field:', item);
          continue;
        }
        const idStr = String(item.id);
        const docRef = doc(db, colName, idStr);
        
        batch.set(docRef, {
          ...item,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
      
      await batch.commit();
      console.log(`[dbSync] Successfully updated ${data.length} items in Firestore (${colName}).`);
      updateLastSyncTimestamp();
    } catch (err) {
      if (err instanceof Error && (err.message.includes('permission') || err.message.includes('Permission') || (err as any).code === 'permission-denied')) {
        handleFirestoreError(err, OperationType.UPDATE, colName);
      }
      console.error(`[dbSync] Firestore Update failed for ${sheetName}:`, err);
    }

    // 3. Update in LocalStorage fallback
    try {
      const localKey = `db_sync_fallback_${colName}`;
      const stored = localStorage.getItem(localKey);
      if (stored) {
        let localItems: any[] = JSON.parse(stored);
        for (const item of data) {
          if (!item.id) continue;
          const index = localItems.findIndex(x => String(x.id) === String(item.id));
          if (index >= 0) {
            localItems[index] = {
              ...localItems[index],
              ...item,
              updatedAt: new Date().toISOString()
            };
          }
        }
        localStorage.setItem(localKey, JSON.stringify(localItems));
        console.log(`[dbSync] Successfully updated ${data.length} items in LocalStorage fallback.`);
      }
    } catch (err) {
      console.error(`[dbSync] LocalStorage fallback update failed:`, err);
    }

    return gasResponse || { status: 'success', data: { message: 'Updated in Firestore and LocalStorage fallback only' } };
  },

  /**
   * Deletes one or multiple rows in both Google Sheets and Firebase simultaneously.
   */
  async delete(sheetName: string, data: { id: string | number }[]): Promise<any> {
    console.log(`[dbSync] Deleting from ${sheetName} (dual persistence active)...`);
    const colName = getCollectionName(sheetName);
    
    // 1. Delete from Google Sheets (GAS)
    let gasResponse;
    if (GAS_WEB_APP_URL && GAS_WEB_APP_URL !== "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE" && GAS_WEB_APP_URL.trim() !== "") {
      try {
        gasResponse = await GASService.delete(sheetName, data);
      } catch (err) {
        console.warn(`[dbSync] GAS Delete failed for ${sheetName}:`, err);
      }
    } else {
      console.log(`[dbSync] GAS is unconfigured. Skipping delete for ${sheetName}.`);
    }

    // 2. Delete from Firestore
    try {
      const batch = writeBatch(db);
      
      for (const item of data) {
        const idStr = String(item.id);
        const docRef = doc(db, colName, idStr);
        batch.delete(docRef);
      }
      
      await batch.commit();
      console.log(`[dbSync] Successfully deleted ${data.length} items from Firestore (${colName}).`);
      updateLastSyncTimestamp();
    } catch (err) {
      if (err instanceof Error && (err.message.includes('permission') || err.message.includes('Permission') || (err as any).code === 'permission-denied')) {
        handleFirestoreError(err, OperationType.DELETE, colName);
      }
      console.error(`[dbSync] Firestore Delete failed for ${sheetName}:`, err);
    }

    // 3. Delete from LocalStorage fallback
    try {
      const localKey = `db_sync_fallback_${colName}`;
      const stored = localStorage.getItem(localKey);
      if (stored) {
        let localItems: any[] = JSON.parse(stored);
        const idsToDelete = data.map(item => String(item.id));
        localItems = localItems.filter(item => !idsToDelete.includes(String(item.id)));
        localStorage.setItem(localKey, JSON.stringify(localItems));
        console.log(`[dbSync] Successfully deleted ${data.length} items from LocalStorage fallback.`);
      }
    } catch (err) {
      console.error(`[dbSync] LocalStorage fallback delete failed:`, err);
    }

    return gasResponse || { status: 'success', data: { message: 'Deleted from Firestore and LocalStorage fallback only' } };
  },

  /**
   * Background sync helper to seed Firestore when reading from Sheets
   */
  async backgroundSyncToFirestore(sheetName: string, items: any[]): Promise<void> {
    const colName = getCollectionName(sheetName);
    const batch = writeBatch(db);
    
    // Sync first 100 items to avoid batch size limits (Firestore writeBatch limits to 500 ops)
    const limitedItems = items.slice(0, 450);
    
    for (const item of limitedItems) {
      const idStr = String(item.id || item.employeeId || 'synced_' + Math.random().toString(36).substring(2, 7));
      const docRef = doc(db, colName, idStr);
      batch.set(docRef, {
        ...item,
        id: idStr,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString()
      }, { merge: true });
    }
    
    await batch.commit();
    console.log(`[dbSync] Background sync complete. ${limitedItems.length} items synced to Firestore.`);
    updateLastSyncTimestamp();
  }
};
