// EdWorld Co - Automated Workspace Validation Script
const fs = require('fs');
const path = require('path');

console.log("=== EdWorld Co Automated Validation ===");

const filesToCheck = [
  'index.html',
  'index.css',
  'mock_data.js',
  'app.js'
];

let allPassed = true;

// 1. Check file existence
filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ [File Exists] ${file} (${stats.size} bytes)`);
  } else {
    console.error(`❌ [File Missing] ${file}`);
    allPassed = false;
  }
});

// 2. Validate index.html content
try {
  const htmlPath = path.join(__dirname, 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  const tagsToCheck = [
    { tag: '<html', name: 'HTML tag' },
    { tag: '<head', name: 'Head tag' },
    { tag: '<body', name: 'Body tag' },
    { tag: '<header', name: 'Header semantic tag' },
    { tag: '<aside', name: 'Aside semantic tag' },
    { tag: '<main', name: 'Main semantic tag' },
    { tag: '<section', name: 'Section semantic tags' },
    { tag: '<footer', name: 'Footer semantic tags' },
    { tag: '<table', name: 'Table semantic tag' }
  ];

  tagsToCheck.forEach(item => {
    if (htmlContent.includes(item.tag)) {
      console.log(`✅ [Semantic Tag Check] Found ${item.name}`);
    } else {
      console.warn(`⚠️ [Semantic Tag Warning] Missing ${item.name} in index.html`);
    }
  });

  const idsToCheck = [
    'auth-overlay',
    'onboarding-overlay',
    'app-layout',
    'global-search-input',
    'btn-toggle-notifications',
    'dropdown-notifications',
    'view-dashboard',
    'view-courses',
    'view-projects',
    'view-connections',
    'view-messages',
    'view-leaderboard',
    'view-profile',
    'view-search',
    'general-modal',
    'toast-container'
  ];

  idsToCheck.forEach(id => {
    if (htmlContent.includes(`id="${id}"`)) {
      console.log(`✅ [Unique ID Check] Found id="${id}"`);
    } else {
      console.error(`❌ [Unique ID Error] Missing required id="${id}" in index.html`);
      allPassed = false;
    }
  });

} catch (e) {
  console.error("❌ Failed to parse index.html content", e);
  allPassed = false;
}

if (allPassed) {
  console.log("🎉 ALL AUTOMATED VERIFICATION CHECKS PASSED!");
  process.exit(0);
} else {
  console.error("❌ SOME VERIFICATION CHECKS FAILED. See details above.");
  process.exit(1);
}
