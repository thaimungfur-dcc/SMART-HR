import fs from 'fs';
import path from 'path';

const filesToRestore = [
  'Benefits/Welfare.tsx',
  'Disciplinary/Actions.tsx',
  'Disciplinary/Law.tsx',
  'LaborRelations/Engagement.tsx',
  'LaborRelations/Sports.tsx',
  'LaborRelations/Union.tsx',
  'Payroll/Expenses.tsx',
  'Recruitment/JobOpenings.tsx',
  'Reports/Turnover.tsx',
  'UserPermissions/index.tsx'
];

filesToRestore.forEach(f => {
  const dest = path.join('src/pages', f);
  const src = path.join('/tmp/pages', f);
  if (fs.existsSync(src)) {
     fs.copyFileSync(src, dest);
     console.log('Restored', f);
  }
});
