#!/usr/bin/env node

/**
 * Production Readiness Check Script
 * Verifies backend is ready for deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Backend Production Readiness...\n');

const checks = [];
let passedChecks = 0;
let failedChecks = 0;

// Check 1: Required files exist
function checkRequiredFiles() {
  const requiredFiles = [
    'server.js',
    'package.json',
    'package-lock.json',
    '.gitignore',
    'Dockerfile',
    '.dockerignore',
    'DEPLOYMENT.md'
  ];

  console.log('📁 Checking Required Files...');
  let allExist = true;
  
  requiredFiles.forEach(file => {
    const exists = fs.existsSync(path.join(__dirname, file));
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allExist = false;
  });

  return allExist;
}

// Check 2: Required directories exist
function checkRequiredDirectories() {
  const requiredDirs = [
    'config',
    'controllers',
    'models',
    'routes',
    'utils'
  ];

  console.log('\n📂 Checking Required Directories...');
  let allExist = true;
  
  requiredDirs.forEach(dir => {
    const exists = fs.existsSync(path.join(__dirname, dir));
    console.log(`  ${exists ? '✅' : '❌'} ${dir}/`);
    if (!exists) allExist = false;
  });

  return allExist;
}

// Check 3: Environment variables template exists
function checkEnvSetup() {
  console.log('\n🔐 Checking Environment Configuration...');
  
  const hasEnv = fs.existsSync(path.join(__dirname, '.env'));
  const hasEnvExample = fs.existsSync(path.join(__dirname, '.env.example'));
  
  console.log(`  ${hasEnv ? '✅' : '⚠️ '} .env file ${hasEnv ? 'exists' : 'missing (will need for deployment)'}`);
  console.log(`  ${hasEnvExample ? '✅' : '⚠️ '} .env.example ${hasEnvExample ? 'exists' : 'missing (recommended)'}`);
  
  if (hasEnv) {
    const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    const hasMongoUri = envContent.includes('MONGODB_URI');
    const hasGeminiKey = envContent.includes('GEMINI_API_KEY');
    
    console.log(`  ${hasMongoUri ? '✅' : '❌'} MONGODB_URI configured`);
    console.log(`  ${hasGeminiKey ? '✅' : '❌'} GEMINI_API_KEY configured`);
    
    return hasMongoUri && hasGeminiKey;
  }
  
  return true; // Pass if no .env file yet (deployment will handle)
}

// Check 4: Package.json configuration
function checkPackageJson() {
  console.log('\n📦 Checking package.json...');
  
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  
  const hasStartScript = packageJson.scripts && packageJson.scripts.start;
  const hasEngines = packageJson.engines;
  const hasDependencies = packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0;
  
  console.log(`  ${hasStartScript ? '✅' : '❌'} Start script: ${hasStartScript || 'MISSING'}`);
  console.log(`  ${hasEngines ? '✅' : '⚠️ '} Node version specified: ${hasEngines ? 'Yes' : 'No (recommended)'}`);
  console.log(`  ${hasDependencies ? '✅' : '❌'} Dependencies: ${hasDependencies ? Object.keys(packageJson.dependencies).length + ' packages' : 'NONE'}`);
  
  return hasStartScript && hasDependencies;
}

// Check 5: Node modules installed
function checkNodeModules() {
  console.log('\n📚 Checking Dependencies...');
  
  const nodeModulesExist = fs.existsSync(path.join(__dirname, 'node_modules'));
  console.log(`  ${nodeModulesExist ? '✅' : '❌'} node_modules/ ${nodeModulesExist ? 'installed' : 'MISSING - run npm install'}`);
  
  return nodeModulesExist;
}

// Check 6: Dockerfile validation
function checkDockerfile() {
  console.log('\n🐳 Checking Docker Configuration...');
  
  const dockerfileExists = fs.existsSync(path.join(__dirname, 'Dockerfile'));
  
  if (dockerfileExists) {
    const dockerContent = fs.readFileSync(path.join(__dirname, 'Dockerfile'), 'utf8');
    const hasFrom = dockerContent.includes('FROM');
    const hasWorkdir = dockerContent.includes('WORKDIR');
    const hasExpose = dockerContent.includes('EXPOSE');
    const hasCmd = dockerContent.includes('CMD');
    
    console.log(`  ${hasFrom ? '✅' : '❌'} Base image specified`);
    console.log(`  ${hasWorkdir ? '✅' : '❌'} Working directory set`);
    console.log(`  ${hasExpose ? '✅' : '❌'} Port exposed`);
    console.log(`  ${hasCmd ? '✅' : '❌'} Start command defined`);
    
    return hasFrom && hasWorkdir && hasExpose && hasCmd;
  }
  
  console.log('  ❌ Dockerfile missing');
  return false;
}

// Run all checks
const results = {
  'Required Files': checkRequiredFiles(),
  'Required Directories': checkRequiredDirectories(),
  'Environment Setup': checkEnvSetup(),
  'Package Configuration': checkPackageJson(),
  'Dependencies': checkNodeModules(),
  'Docker Configuration': checkDockerfile()
};

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Production Readiness Summary');
console.log('='.repeat(60));

Object.entries(results).forEach(([check, passed]) => {
  console.log(`${passed ? '✅' : '❌'} ${check}: ${passed ? 'PASSED' : 'FAILED'}`);
  if (passed) passedChecks++;
  else failedChecks++;
});

console.log('='.repeat(60));
console.log(`Total Checks: ${passedChecks + failedChecks}`);
console.log(`Passed: ${passedChecks}`);
console.log(`Failed: ${failedChecks}`);
console.log('='.repeat(60));

if (failedChecks === 0) {
  console.log('\n✅ Backend is READY for deployment! 🚀');
  console.log('\nNext steps:');
  console.log('1. Review DEPLOYMENT.md for deployment options');
  console.log('2. Set up environment variables on your hosting platform');
  console.log('3. Deploy using your preferred method');
  console.log('4. Test health endpoint: GET /api/health\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Backend has issues that need to be resolved before deployment.');
  console.log('Please fix the failed checks above.\n');
  process.exit(1);
}

