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

const files = findGrep('src/pages', /const UserGuidePanel\s*=/);
console.log("Refactoring UserGuidePanel:", files);

files.forEach(f => {
	let content = fs.readFileSync(f, 'utf8');
	
    // Remove local definition: it starts with `const UserGuidePanel =` and ends with `};\n` or `);\n`
	content = content.replace(/const UserGuidePanel\s*=\s*\([\s\S]*?=>\s*(?:\{[\s\S]*?return \([\s\S]*?\);\s*\}|\([\s\S]*?\));[\r\n]+/g, '');
	
	// Add import if not present
	if (!content.includes('UserGuidePanel from') && !content.includes('UserGuidePanel} from')) {
        const depth = f.split(path.sep).length - 2; 
		const relativePath = path.posix.join(...Array(depth).fill('..'), 'components/shared/UserGuidePanel');
		content = content.replace("import React", `import { UserGuidePanel } from '${relativePath}';\nimport React`); // Assuming exported as { UserGuidePanel } 
	}
    

	fs.writeFileSync(f, content);
});

console.log("UserGuidePanel replaced!");
