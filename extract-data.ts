import fs from 'fs';

function extractConstants(sourcePath: string, dataPath: string, regexList: RegExp[]) {
    let content = fs.readFileSync(sourcePath, 'utf8');
    let dataContent = '';
    
    regexList.forEach(regex => {
        const match = content.match(regex);
        if (match) {
            dataContent += "export " + match[0].replace(/const /g, 'export const ') + "\n\n";
            content = content.replace(regex, "");
        }
    });

    if (dataContent) {
        fs.writeFileSync(dataPath, dataContent);
        // We will just add the import at the top
        // Finding what constants we extracted
        const consts = dataContent.match(/export const ([A-Z_0-9a-z]+)/g)?.map(x => x.replace('export const ', '')) || [];
        if (consts.length > 0) {
            content = `import { ${consts.join(', ')} } from './data';\n` + content;
            fs.writeFileSync(sourcePath, content);
            console.log(`Extracted ${consts.join(', ')} to ${dataPath}`);
        }
    }
}

// 1. Home
extractConstants(
    'src/pages/Home/index.tsx', 
    'src/pages/Home/data.ts', 
    [
        /\/\/ --- System Modules Data ---[\s\S]*?(?=const HeroBanner)/
    ]
);

// 2. JobDescription
extractConstants(
    'src/pages/JobDescription/Repository.tsx', 
    'src/pages/JobDescription/data.ts', 
    [
        /const INITIAL_JDS: JobDescription\[\] = \[[\s\S]*?\];/,
        /const DEPARTMENTS = \[[\s\S]*?\];/,
        /const LEVELS = \[[\s\S]*?\];/
    ]
);

// 3. LeaveManagement
extractConstants(
    'src/pages/LeaveManagement/index.tsx', 
    'src/pages/LeaveManagement/data.ts', 
    [
        /const LEAVE_TYPES = \[[\s\S]*?\];/
    ]
);

// 4. Employees/Directory
extractConstants(
    'src/pages/Employees/Directory.tsx', 
    'src/pages/Employees/data.ts', 
    [
        /const MOCK_DATA = \[[\s\S]*?\];/,
        /const DEPARTMENTS = \[[\s\S]*?\];/
    ]
);

console.log("Done extracting data files!");
