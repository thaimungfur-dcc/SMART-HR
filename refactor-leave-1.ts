import fs from 'fs';

const file = 'src/pages/LeaveManagement/index.tsx';
let content = fs.readFileSync(file, 'utf8');

// The match for LEAVE_TYPE_MAP & DEFAULT_MAP is around line 64-102
const constantsRegex = /\/\/ Color maps for styled leaf types\nconst LEAVE_TYPE_MAP: Record<string, \{ label: string; icon: any; color: string; bg: string; border: string \}> = \{[\s\S]*?\};\n\nconst DEFAULT_MAP = \{[\s\S]*?\};\n/;

const constantsMatch = content.match(constantsRegex);
if (!constantsMatch) {
  console.log("Could not find constants to extract.");
} else {
  let constantsCode = constantsMatch[0];
  // extract imports needed for constants
  const iconImports = "import { Umbrella, Heart, Briefcase, User, CalendarDays } from 'lucide-react';\n\n";
  fs.writeFileSync('src/pages/LeaveManagement/constants.ts', iconImports + "export " + constantsCode.replace("const LEAVE_TYPE_MAP", "const LEAVE_TYPE_MAP").replace("const DEFAULT_MAP", "export const DEFAULT_MAP") + "\nexport { LEAVE_TYPE_MAP };\n");
  
  content = content.replace(constantsRegex, "import { LEAVE_TYPE_MAP, DEFAULT_MAP } from './constants';\n");
}

fs.writeFileSync(file, content);
console.log("Extracted constants from LeaveManagement");
