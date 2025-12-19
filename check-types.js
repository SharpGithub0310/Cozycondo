#!/usr/bin/env node

/**
 * TypeScript type checking script
 * This script performs type checking without emitting files
 */

const { spawn } = require('child_process');
const path = require('path');

const projectRoot = process.cwd();
const tsconfigPath = path.join(projectRoot, 'tsconfig.json');

console.log('🔍 Running TypeScript type check...');
console.log(`Project root: ${projectRoot}`);
console.log(`TSConfig: ${tsconfigPath}`);

// Try to run TypeScript compiler
const tsc = spawn('npx', ['tsc', '--noEmit', '--project', tsconfigPath], {
  stdio: 'inherit',
  shell: true
});

tsc.on('close', (code) => {
  if (code === 0) {
    console.log('✅ TypeScript compilation successful - no type errors found!');
    process.exit(0);
  } else {
    console.log(`❌ TypeScript compilation failed with exit code ${code}`);
    console.log('\n💡 To fix these errors, check the output above and update your code.');
    process.exit(code);
  }
});

tsc.on('error', (error) => {
  console.error('❌ Error running TypeScript compiler:', error.message);
  console.log('\n💡 Make sure TypeScript is installed: npm install typescript --save-dev');
  process.exit(1);
});