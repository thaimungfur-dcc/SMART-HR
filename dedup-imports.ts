import fs from 'fs';
import path from 'path';

function findGrep(dir: string): string[] {
	let results: string[] = [];
	fs.readdirSync(dir).forEach(f => {
		const p = path.join(dir, f);
		if (fs.statSync(p).isDirectory()) {
			results = results.concat(findGrep(p));
		} else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
			results.push(p);
		}
	});
	return results;
}

const files = findGrep('src/pages');

files.forEach(f => {
	let content = fs.readFileSync(f, 'utf8');
	let modified = false;

    // Remove wrong imports of KpiCard, UserGuidePanel, Toast
    ['KpiCard', 'UserGuidePanel', 'Toast'].forEach(comp => {
         const regex = new RegExp(`import\\s+.*?${comp}.*?;[\\r\\n]+`, 'g');
         const matches = content.match(regex);
         if (matches && matches.length > 1) {
             // keep only the last one, or just rewrite them all correctly
             content = content.replace(regex, ''); 
             const depth = f.split(path.sep).length - 2; 
             const relativePath = path.posix.join(...Array(depth).fill('..'), `components/shared/${comp}`);
             
             const importLine = comp === 'KpiCard' ? `import KpiCard from '${relativePath}';\n` : `import { ${comp} } from '${relativePath}';\n`;
             content = importLine + content;
             modified = true;
         } else if (matches && matches.length === 1) {
             // fix path
             content = content.replace(regex, ''); 
             const depth = f.split(path.sep).length - 2; 
             const relativePath = path.posix.join(...Array(depth).fill('..'), `components/shared/${comp}`);
             const importLine = comp === 'KpiCard' ? `import KpiCard from '${relativePath}';\n` : `import { ${comp} } from '${relativePath}';\n`;
             content = importLine + content;
             modified = true;
         }
    });

	if (modified) fs.writeFileSync(f, content);
});

console.log("Imports deduplicated and fixed!");
