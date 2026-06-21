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

const files = findGrep('src/pages', /const LocalKpiCard\s*=/);
console.log("Refactoring LocalKpiCard:", files);

files.forEach(f => {
	let content = fs.readFileSync(f, 'utf8');
	
    // Remove local definition: it starts with `const LocalKpiCard =` and ends with `};\n` or `);\n`
	content = content.replace(/const LocalKpiCard\s*=\s*\([\s\S]*?=>\s*(?:\{[\s\S]*?return \([\s\S]*?\);\s*\}|\([\s\S]*?\));[\r\n]+/g, '');
	
	// Add import if not present
	if (!content.includes('KpiCard from') && !content.includes('KpiCard} from')) {
        const depth = f.split(path.sep).length - 2; 
		const relativePath = path.posix.join(...Array(depth).fill('..'), 'components/shared/KpiCard');
		content = content.replace("import React", `import KpiCard from '${relativePath}';\nimport React`);
	}
    
    content = content.replace(/<LocalKpiCard/g, '<KpiCard');
    
    // Some LocalKpiCard has icon="Users" which means it's a string!
    // But our shared KpiCard accepts a component, or wait, does shared KpiCard accept string?
    // Let's modify shared KpiCard to accept string or component!
    
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
