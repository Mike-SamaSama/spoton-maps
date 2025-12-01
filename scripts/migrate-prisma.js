const { spawn } = require('child_process');

console.log('🔄 Running Prisma migrations...');

const child = spawn('npx', ['prisma', 'migrate', 'deploy'], {
  stdio: 'inherit'
});

child.on('close', code => {
  if (code === 0) {
    console.log('✅ Prisma migrations completed');
    process.exit(0);
  } else {
    console.error('❌ Prisma migrations failed');
    process.exit(1);
  }
});
