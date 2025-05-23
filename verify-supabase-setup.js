#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

console.log(`${colors.bold}${colors.cyan}Not a Label - Supabase Setup Verification${colors.reset}\n`);

// Define the required files and directories
const requiredFiles = [
  { path: '.env.local', description: 'Environment variables' },
  { path: 'middleware.ts', description: 'Next.js middleware for Supabase auth' },
  { path: 'supabase-schema.sql', description: 'Database schema SQL' },
  { path: 'supabase-rls-policies.sql', description: 'Row Level Security policies' },
  { path: 'src/utils/supabase/server.ts', description: 'Server-side Supabase client' },
  { path: 'src/utils/supabase/client.ts', description: 'Client-side Supabase client' },
  { path: 'src/utils/supabase/middleware.ts', description: 'Middleware utilities' },
  { path: 'src/app/auth/confirm/route.ts', description: 'Auth confirmation handler' },
];

// Check for the existence of required files
console.log(`${colors.bold}Checking required files:${colors.reset}\n`);

let missingFiles = 0;
let notaLabelRoot = process.cwd();

// Check if we're in the right directory
const isInNotaLabelFrontend = fs.existsSync(path.join(notaLabelRoot, 'not-a-label-frontend'));
if (isInNotaLabelFrontend) {
  notaLabelRoot = path.join(notaLabelRoot, 'not-a-label-frontend');
  console.log(`${colors.yellow}Working directory: ${notaLabelRoot}${colors.reset}\n`);
}

requiredFiles.forEach(file => {
  const filePath = path.join(notaLabelRoot, file.path);
  const exists = fs.existsSync(filePath);
  
  const status = exists 
    ? `${colors.green}✓ Found${colors.reset}` 
    : `${colors.red}✗ Missing${colors.reset}`;
    
  console.log(`${status} - ${file.description} (${file.path})`);
  
  if (!exists) {
    missingFiles++;
  }
});

// Check for Supabase packages
console.log(`\n${colors.bold}Checking Supabase dependencies:${colors.reset}\n`);
let packageJson;

try {
  packageJson = JSON.parse(fs.readFileSync(path.join(notaLabelRoot, 'package.json'), 'utf8'));
  
  const dependencies = {...packageJson.dependencies, ...packageJson.devDependencies};
  
  const requiredPackages = [
    '@supabase/supabase-js',
    '@supabase/ssr',
  ];
  
  requiredPackages.forEach(pkg => {
    const isInstalled = dependencies && dependencies[pkg];
    const status = isInstalled 
      ? `${colors.green}✓ Installed${colors.reset}` 
      : `${colors.red}✗ Not installed${colors.reset}`;
      
    console.log(`${status} - ${pkg}`);
    
    if (!isInstalled) {
      missingFiles++;
    }
  });
} catch (error) {
  console.log(`${colors.red}✗ Could not read package.json${colors.reset}`);
  missingFiles++;
}

// Check for .env.local file and Supabase variables
console.log(`\n${colors.bold}Checking environment variables:${colors.reset}\n`);

const envLocalPath = path.join(notaLabelRoot, '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  
  const checkEnvVar = (name) => {
    const hasVar = envContent.includes(name + '=');
    const isEmpty = envContent.includes(name + '=\n') || envContent.includes(name + '=\r\n') || envContent.includes(name + '=your-');
    
    let status;
    if (!hasVar) {
      status = `${colors.red}✗ Missing${colors.reset}`;
      missingFiles++;
    } else if (isEmpty) {
      status = `${colors.yellow}⚠ Empty${colors.reset}`;
    } else {
      status = `${colors.green}✓ Configured${colors.reset}`;
    }
    
    console.log(`${status} - ${name}`);
  };
  
  checkEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  checkEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');
} else {
  console.log(`${colors.red}✗ .env.local file not found${colors.reset}`);
}

// Summary
console.log(`\n${colors.bold}Summary:${colors.reset}`);

if (missingFiles === 0) {
  console.log(`${colors.green}All Supabase integration files are present. You're good to go!${colors.reset}`);
  console.log(`\nNext steps:`);
  console.log(`1. Make sure you've run the SQL schema and RLS policies in your Supabase project`);
  console.log(`2. Check that your .env.local file has the correct values`);
  console.log(`3. Start the app with ${colors.cyan}npm run dev${colors.reset}`);
  console.log(`4. Visit ${colors.cyan}http://localhost:3000/supabase-test${colors.reset} to test the integration`);
} else {
  console.log(`${colors.red}Found ${missingFiles} missing components. Please check the guide to complete the setup.${colors.reset}`);
  console.log(`\nTo complete the setup, follow the guide in ${colors.cyan}SUPABASE-INTEGRATION-GUIDE.md${colors.reset}`);
}

console.log(`\n${colors.bold}Need help?${colors.reset}`);
console.log(`- Check the Supabase docs: ${colors.blue}https://supabase.com/docs${colors.reset}`);
console.log(`- Follow the integration guide: ${colors.cyan}SUPABASE-INTEGRATION-GUIDE.md${colors.reset}`); 