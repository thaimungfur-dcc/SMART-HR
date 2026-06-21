import fs from "fs";
import path from "path";
function getFiles(dir: string): string[] {
	let files: string[] = [];
	fs.readdirSync(dir).forEach(f => {
		const p = path.join(dir, f);
		if (fs.statSync(p).isDirectory()) {
			files = files.concat(getFiles(p));
		} else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
			files.push(p);
		}
	});
	return files;
}
const all = getFiles('./src');
const sizes = all.map(f => {
	const content = fs.readFileSync(f, 'utf8');
	return {name: f, lines: content.split('\n').length};
}).sort((a,b) => b.lines - a.lines);
console.log(sizes.slice(0, 15));
