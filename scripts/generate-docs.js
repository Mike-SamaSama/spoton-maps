const fs = require('fs');
const path = require('path');

const docsPath = path.join(__dirname, '..', 'docs', 'README.md');

function generateTimestamp() {
  return new Date().toISOString();
}

function updateDocs() {
  let content = '';
  try {
    content = fs.readFileSync(docsPath, 'utf8');
  } catch (err) {
    console.error('Could not read docs README.md:', err.message);
    process.exit(1);
  }

  const markerStart = '<!-- GENERATED_AT:';
  const markerEnd = '-->';

  const regex = /<!-- GENERATED_AT:.*?-->/s;
  const ts = generateTimestamp();
  const marker = `<!-- GENERATED_AT:${ts} -->`;

  if (regex.test(content)) {
    content = content.replace(regex, marker);
  } else {
    // Insert marker after the first heading or at top
    const lines = content.split(/\r?\n/);
    let insertAt = 0;
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      if (lines[i].startsWith('#')) { insertAt = i + 1; break; }
    }
    lines.splice(insertAt, 0, marker);
    content = lines.join('\n');
  }

  fs.writeFileSync(docsPath, content, 'utf8');
  console.log('Updated', docsPath, 'with marker', marker);
}

if (require.main === module) {
  updateDocs();
}

module.exports = { updateDocs };
