import fs from 'fs';
import path from 'path';

function findGrep(dir: string, regex: RegExp): string[] {
	let results: string[] = [];
	fs.readdirSync(dir).forEach(f => {
		const p = path.join(dir, f);
		if (fs.statSync(p).isDirectory()) {
			results = results.concat(findGrep(p, regex));
		} else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
			const content = fs.readFileSync(p, 'utf8');
			if (regex.test(content)) {
				results.push(p);
			}
		}
	});
	return results;
}

const files = findGrep('src/pages', /const LucideIcon\s*=/);
console.log("Refactoring LucideIcon:", files);

files.forEach(f => {
	let content = fs.readFileSync(f, 'utf8');
	
    // Also remove const kebabToPascal
    content = content.replace(/const kebabToPascal = \([^)]+\) => [\s\S]*?;[\r\n]+/g, '');
    
	content = content.replace(/const LucideIcon\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*?return <IconComponent[\s\S]*?;\n\};[\r\n]+/g, '');
	
	if (!content.includes('LucideIcon from') && !content.includes('LucideIcon} from')) {
        const depth = f.split(path.sep).length - 2; 
		const relativePath = path.posix.join(...Array(depth).fill('..'), 'components/shared/LucideIcon');
		content = content.replace("import React", `import { LucideIcon } from '${relativePath}';\nimport React`);
	}

	fs.writeFileSync(f, content);
});

console.log("LucideIcon refactored!");
