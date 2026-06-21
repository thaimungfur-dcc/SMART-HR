# คู่มือการจัดการฐานข้อมูล (Database Management Guide)

## สถาปัตยกรรมฐานข้อมูล
ใน SMART HR V1.0 เราได้ยกระดับระบบฐานข้อมูลจาก Local Storage เป็น **Firebase Firestore** เพื่อเพิ่มประสิทธิภาพการทำงานและรองรับผู้ใช้จำนวนมหาศาลแบบพร้อมกัน (High Concurrency).

### โครงสร้าง Collection (Collections Structure)
1. **users**
   - การจัดการสิทธิ์ (Permissions), Role 
   - ลำดับชั้นสายบังคับบัญชา (Hierarchy)
2. **attendance**
   - บันทึกการเข้า-ออกงาน (Time-in/Time-out)
   - ข้อมูล Overtime (OT)
3. **leaves**
   - ระบบร้องขอการลางาน
   - ประวัติการลางานและโควต้าของพนักงานแต่ละคน
4. **payroll**
   - ข้อมูลคำนวณเงินเดือน และสลิปเงินเดือน
   
## กฎระเบียบความปลอดภัย (Security Rules)
ตามที่เราตั้งค่าใน `firestore.rules`:
* ข้อมูลทั้งหมดจะถูกเข้าถึงได้เฉพาะผู้ที่ยืนยันตัวตนแล้ว (Authenticated Users)
* การแก้ไขข้อมูลต่างๆ จะถูกควบคุมด้วย Custom Claims เช่น `isHR` หรือ `isAdmin` 
* สิทธิ์การดูประวัติลางาน ถูกขีดวงให้สามารถดูได้เฉพาะเจ้าของข้อมูล หรือพนักงานฝ่ายบุคคลเท่านั้น

## การปรับจูนและประสิทธิภาพ (Performance Tuning)
เพื่อรับส่งหน้าข้อมูลได้อย่างรวดเร็ว:
- **Pagination & Query Limits**: ทุก Components ควรอ่านข้อมูลโดยใช้ limit() เช่น โหลดมาเพียง 50 logs ต่อการ request
- **NoSQL Flattening**: ออกแบบ JSON ให้ไม่ซับซ้อนและไม่มี Nested arrays ลึกเกิน 2 ชั้น 
- **Offline Persistence**: ระดับ SDK สามารถเปิดระบบ cache ในเครื่อง ช่วยให้แสดงผลข้อมูลได้แม้ Network ล่าช้า

## การทำงานกับสคริปต์ Sync ข้อมูล (Data Synchronization)
`dbSync.ts` เป็นโมดูลควบคุมการนำส่งและรับข้อมูลจากระบบ Mock เดิมและเปิดให้ส่งขึ้น Firebase เมื่อพร้อม ซึ่งรองรับการ Migrate ข้อมูลที่อยู่กับเครื่อง local ไปที่ศูนย์กลาง
