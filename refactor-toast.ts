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

const files = findGrep('src/pages', /const Toast\s*=/);
console.log("Refactoring Toast in:", files);

files.forEach(f => {
	let content = fs.readFileSync(f, 'utf8');
	
    // Remove local definition: it starts with `const Toast =` and ends with `);\n`
	content = content.replace(/const Toast\s*=\s*\([^)]*\)\s*=>\s*\([\s\S]*?createPortal\([\s\S]*?document\.body\s*\)\s*\);[\r\n]+/g, '');
	
	// Add import if not present
	if (!content.includes('Toast from') && !content.includes('Toast} from')) {
        const depth = f.split(path.sep).length - 2; 
		const relativePath = path.posix.join(...Array(depth).fill('..'), 'components/shared/Toast');
		content = content.replace("import React", `import { Toast } from '${relativePath}';\nimport React`); 
	}
    

	fs.writeFileSync(f, content);
});

console.log("Toast replaced!");
