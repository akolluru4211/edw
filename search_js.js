const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\kollu\\EDCO\\app.js', 'utf8');
const lines = content.split(/\r?\n/);
const patterns = [
  /onAuthStateChanged/i,
  /signInWith/i,
  /handleNavigation/i,
  /updateGlobalUserData/i,
  /renderIdCard/i,
  /withdraw/i,
  /google/i,
  /github/i
];

patterns.forEach(pat => {
  console.log(`=== Matches for ${pat} ===`);
  lines.forEach((line, idx) => {
    if (pat.test(line)) {
      console.log(`${idx + 1}: ${line.trim()}`);
    }
  });
});
