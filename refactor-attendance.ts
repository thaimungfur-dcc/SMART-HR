import fs from 'fs';

const path = 'src/pages/Attendance/index.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /\/\/ Shift Options[\s\S]*?(?=export default function Attendance)/;
const match = content.match(regex);
if (match) {
   let extracted = match[0];
   fs.writeFileSync('src/pages/Attendance/data.ts', "export " + extracted.replace(/const /g, 'export const '));
   
   // Replace in origin
   content = content.replace(regex, "import { SHIFTS, MONTHLY_HISTORICAL_TRENDS_MAP, BASELINE_LOGS } from './data';\n\n");
   fs.writeFileSync(path, content);
   console.log('Extracted to data.ts');
} else {
   console.log('Match not found');
}
