const fs = require('fs');
const content = fs.readFileSync('src/pages/Attendance/index.tsx', 'utf8');
const lines = content.split('\n');

let startIndex = -1;
let endIndex = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes(") : activeSubTab === 'planner' ? (")) {
    startIndex = i;
  }
  if (startIndex !== -1 && i > startIndex && lines[i].trim() === ") : (") {
    endIndex = i;
    break;
  }
}

if (startIndex !== -1 && endIndex !== -1) {
  // Replace the whole block with just ") : ("
  lines.splice(startIndex, endIndex - startIndex, "      ) : (");
  fs.writeFileSync('src/pages/Attendance/index.tsx', lines.join('\n'));
  console.log("Success! Replaced lines from", startIndex, "to", endIndex);
} else {
  console.log("Could not find the bounds.", startIndex, endIndex);
}
