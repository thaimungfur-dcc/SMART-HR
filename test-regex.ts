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

const files = findGrep('src/pages', /const (Local)?KpiCard = \(\{/);
console.log("Files with KpiCard local:", files);

files.forEach(f => {
	let content = fs.readFileSync(f, 'utf8');
	const regex = /const (Local)?KpiCard = \([^)]+\)? => \([\s\S]*?\);[\r\n]+/g;
    const matches = content.match(regex);
    if(matches) {
       matches.forEach(m => console.log(`Regex matched in ${f}:\n`, m.substring(0, 100), "..."));
    }
});
