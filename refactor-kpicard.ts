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

// Regex to capture local KpiCard / LocalKpiCard definitions
const defRegex = /const (Local)?KpiCard = \([^)]+\)? => \([\s\S]*?\);[\r\n]+/g;

const files = findGrep('src/pages', defRegex);
console.log("Refactoring files:", files);

files.forEach(f => {
	let content = fs.readFileSync(f, 'utf8');
	
    // Remove local definition
	content = content.replace(defRegex, '');
	
	// Add import if not present
	if (!content.includes('KpiCard from ') && !content.includes('KpiCard} from')) {
        // Find depth for relative path
        const depth = f.split(path.sep).length - 2; // src/pages/Module/File.tsx -> depth 2 means ../../
		const relativePath = '../'.repeat(depth) + 'components/shared/KpiCard';
		content = content.replace("import React", `import KpiCard from '${relativePath}';\nimport React`);
	}
    
    // Convert <LocalKpiCard to <KpiCard
    content = content.replace(/<(Local)?KpiCard/g, '<KpiCard');
    
    // Fix props
    // We replace colorAccent={...} with color={...}
    // We replace desc={...} with description={...}
    // We can just regex replace inside the tags
    
    content = content.replace(/<KpiCard([^>]+)>/g, (match, props) => {
        let newProps = props
            .replace(/colorAccent=/g, 'color=')
            .replace(/\sdesc=/g, ' description=')
            .replace(/\scolorValue=({[^}]+}|"[^"]+")/g, ''); // drop colorValue
        return `<KpiCard${newProps}>`;
    });

	fs.writeFileSync(f, content);
});

console.log("Tokens replaced!");
