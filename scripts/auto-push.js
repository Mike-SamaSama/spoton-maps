/*
  Auto-push watcher
  - Watches repository files (excluding node_modules, .git) for changes
  - Debounces rapid changes and then runs: git add -A && git commit -m "chore(auto): auto commit" && git push
  - Requires credentials to be configured (SSH key or credential helper)
*/

const chokidar = require('chokidar');
const { exec } = require('child_process');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const ignored = [
  'node_modules',
  '.git',
  'data',
  'dist',
  'build'
];

let timer = null;
const DEBOUNCE_MS = 2000;

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: repoRoot }, (err, stdout, stderr) => {
      if (err) return reject({ err, stdout, stderr });
      resolve({ stdout, stderr });
    });
  });
}

async function commitAndPush() {
  try {
    console.log('⏳ Preparing to auto-commit and push...');
    await run('git add -A');

    // Use a timestamped commit message to avoid identical-message no-op
    const msg = `chore(auto): auto-commit ${new Date().toISOString()}`;
    try {
      await run(`git commit -m "${msg}"`);
    } catch (cErr) {
      // If there's nothing to commit, skip
      const stderr = cErr.stderr || '';
      if (stderr.includes('nothing to commit')) {
        console.log('ℹ️ Nothing to commit');
        return;
      }
      throw cErr;
    }

    console.log('🚀 Pushing to origin...');
    await run('git push origin HEAD');
    console.log('✅ Auto-push completed');
  } catch (error) {
    console.error('❌ Auto-push failed:', error.stderr || error.err || error);
  }
}

console.log('👀 Starting file watcher for auto-push...');

const watcher = chokidar.watch(repoRoot, {
  ignored: ignored.map(i => path.join(repoRoot, i)),
  persistent: true,
  ignoreInitial: true,
  depth: 6
});

watcher.on('all', (event, filePath) => {
  // Ignore modifications inside .git (safety)
  if (filePath.includes(path.join(repoRoot, '.git'))) return;

  console.log(`🔔 ${event} -> ${path.relative(repoRoot, filePath)}`);

  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    commitAndPush();
  }, DEBOUNCE_MS);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Stopping watcher');
  watcher.close().then(() => process.exit(0));
});
