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

const files = findGrep('src/pages', /const GlassCard\s*=/);
console.log("Refactoring GlassCard files:", files);

files.forEach(f => {
	let content = fs.readFileSync(f, 'utf8');
	
	content = content.replace(/const GlassCard\s*=\s*\(\{[\s\S]*?=>\s*\([\s\S]*?<\/[a-zA-Z]+>\s*\)[;,]?[\r\n]+/g, '');
	
	if (!content.includes('GlassCard from') && !content.includes('GlassCard} from')) {
        const depth = f.split(path.sep).length - 2; 
		const relativePath = path.posix.join(...Array(depth).fill('..'), 'components/shared/GlassCard');
		content = content.replace("import React", `import GlassCard from '${relativePath}';\nimport React`); // Assuming exported as { GlassCard } or default? let's check
	}

	fs.writeFileSync(f, content);
});

console.log("Lines replaced!");
