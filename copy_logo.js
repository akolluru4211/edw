const fs = require('fs');
const src = 'C:\\Users\\kollu\\.gemini\\antigravity-ide\\brain\\f87fabc9-7463-41b2-9109-d8108fbc2ed3\\media__1781277741028.png';
const dest = 'c:\\Users\\kollu\\EDCO\\logo.png';
try {
  fs.copyFileSync(src, dest);
  console.log('Successfully copied logo to logo.png');
} catch (e) {
  console.error('Error copying logo:', e);
}
