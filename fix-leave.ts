import fs from 'fs';

let content = fs.readFileSync('src/pages/LeaveManagement/constants.ts', 'utf8');
content = content.replace('export const LEAVE_TYPE_MAP', 'const LEAVE_TYPE_MAP');
fs.writeFileSync('src/pages/LeaveManagement/constants.ts', content);
console.log('Fixed constants');
