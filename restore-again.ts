import fs from 'fs';
import path from 'path';

const filesToRestore = [
  'Home/index.tsx',
  'JobDescription/Repository.tsx',
  'Employees/Directory.tsx',
  'LeaveManagement/index.tsx'
];

filesToRestore.forEach(f => {
  const dest = path.join('src/pages', f);
  const src = path.join('/tmp/pages', f);
  if (fs.existsSync(src)) {
     fs.copyFileSync(src, dest);
     console.log('Restored', f);
  }
});
