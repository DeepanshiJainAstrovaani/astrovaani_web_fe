const fs = require('fs');
const path = require('path');

// simple check: prevent commits that include node_modules or very large files
const stagedFiles = require('child_process')
  .execSync('git diff --name-only --cached')
  .toString()
  .split('\n')
  .filter(Boolean);

const forbidden = stagedFiles.filter(f => f.split(path.sep).includes('node_modules'));
if (forbidden.length) {
  console.error('Commit rejected: node_modules must not be committed. Files:', forbidden.join(', '));
  process.exit(1);
}

// block files > 5MB
for (const f of stagedFiles) {
  try {
    const s = fs.statSync(f);
    if (s.size > 5 * 1024 * 1024) {
      console.error(`Commit rejected: file too large (${f})`);
      process.exit(1);
    }
  } catch (e) {
    // ignore missing files
  }
}

process.exit(0);
