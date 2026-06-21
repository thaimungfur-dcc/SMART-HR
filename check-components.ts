import fs from "fs";

const content = fs.readFileSync('src/pages/Attendance/index.tsx', 'utf8');

const regex = /(const [A-Z][a-zA-Z0-9_]* = [^=]+\(.*\) => {)|(function [A-Z][a-zA-Z0-9_]*\()/g;
const matches = content.match(regex);
console.log(matches);
