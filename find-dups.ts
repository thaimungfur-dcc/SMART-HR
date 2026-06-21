import fs from 'fs';
import path from 'path';

function getFiles(dir: string): string[] {
	let results: string[] = [];
	fs.readdirSync(dir).forEach(f => {
		const p = path.join(dir, f);
		if (fs.statSync(p).isDirectory()) {
			results = results.concat(getFiles(p));
		} else if (p.endsWith('.tsx')) {
            results.push(p);
		}
	});
	return results;
}

const files = getFiles('src/pages');
const componentCounts: Record<string, string[]> = {};

files.forEach(f => {
	const content = fs.readFileSync(f, 'utf8');
	const matches = content.match(/const ([A-Z][a-zA-Z0-9_]*)\s*=\s*\(/g);
	if (matches) {
		matches.forEach(m => {
			const name = m.replace('const ', '').replace(/\s*=\s*\(/, '');
			if (!componentCounts[name]) componentCounts[name] = [];
            if (!componentCounts[name].includes(f)) {
                componentCounts[name].push(f);
            }
		});
	}
});

const sorted = Object.entries(componentCounts).sort((a,b) => b[1].length - a[1].length);
sorted.slice(0, 15).forEach(([name, files]) => {
   console.log(`${name}: ${files.length} pages`); 
});
