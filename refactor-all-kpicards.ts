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

// Just match "const KpiCard =" or "const LocalKpiCard ="
const files = findGrep('src/pages', /const (Local)?KpiCard\s*=/);
console.log("Refactoring files:", files);

files.forEach(f => {
	let content = fs.readFileSync(f, 'utf8');
	
    // Remove local definition: it starts with `const KpiCard =` and ends with `);\n`
	content = content.replace(/const (Local)?KpiCard\s*=\s*\([\s\S]*?=>\s*\([\s\S]*?\);[\r\n]+/g, '');
	
	// Add import if not present
	if (!content.includes('KpiCard from') && !content.includes('KpiCard} from')) {
        const depth = f.split(path.sep).length - 2; 
		const relativePath = path.posix.join(...Array(depth).fill('..'), 'components/shared/KpiCard');
		content = content.replace("import React", `import KpiCard from '${relativePath}';\nimport React`);
	}
    
    content = content.replace(/<(Local)?KpiCard/g, '<KpiCard');
    
    content = content.replace(/<KpiCard([^>]+)>/g, (match, props) => {
        let newProps = props
            .replace(/\scolorAccent=/g, ' color=')
            .replace(/\sdesc=/g, ' description=')
            .replace(/\scolorValue=({[^}]+}|"[^"]+")/g, ''); 
        return `<KpiCard${newProps}>`;
    });

	fs.writeFileSync(f, content);
});

console.log("Lines replaced!");
