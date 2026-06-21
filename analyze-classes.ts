import fs from "fs";
import path from "path";

function getFiles(dir: string): string[] {
	let files: string[] = [];
	fs.readdirSync(dir).forEach(f => {
		const p = path.join(dir, f);
		if (fs.statSync(p).isDirectory()) {
			files = files.concat(getFiles(p));
		} else if (p.endsWith('.tsx')) {
			files.push(p);
		}
	});
	return files;
}

const files = getFiles('./src/pages');
const classCounts: Record<string, number> = {};

files.forEach(f => {
	const content = fs.readFileSync(f, 'utf8');
	const matches = content.match(/className="([^"]+)"/g);
	if (matches) {
		matches.forEach(m => {
			const cls = m.replace('className="', '').replace('"', '');
			classCounts[cls] = (classCounts[cls] || 0) + 1;
		});
	}
});

const sorted = Object.entries(classCounts).sort((a,b) => b[1] - a[1]);
console.log(sorted.slice(0, 50));
