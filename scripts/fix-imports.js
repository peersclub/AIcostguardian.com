#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Import mappings
const importMappings = {
  // From src to lib
  '../types': '@/lib/types',
  '../../types': '@/lib/types',
  '../../../types': '@/lib/types',
  './types': '@/lib/types',
  
  '../config': '@/lib/config',
  '../../config': '@/lib/config',
  '../../../config': '@/lib/config',
  './config': '@/lib/config',
  
  '../services': '@/lib/services',
  '../../services': '@/lib/services',
  '../../../services': '@/lib/services',
  './services': '@/lib/services',
  
  '../contexts': '@/lib/contexts',
  '../../contexts': '@/lib/contexts',
  '../../../contexts': '@/lib/contexts',
  './contexts': '@/lib/contexts',
  
  '../hooks': '@/lib/hooks',
  '../../hooks': '@/lib/hooks',
  '../../../hooks': '@/lib/hooks',
  './hooks': '@/lib/hooks',
  
  '../utils': '@/lib/utils',
  '../../utils': '@/lib/utils',
  '../../../utils': '@/lib/utils',
  './utils': '@/lib/utils',
  
  // Components
  '../components': '@/components',
  '../../components': '@/components',
  '../../../components': '@/components',
  './components': '@/components',
  
  // Fix src imports
  '@/types': '@/lib/types',
  '@/config': '@/lib/config',
  '@/services': '@/lib/services',
  '@/contexts': '@/lib/contexts',
  '@/hooks': '@/lib/hooks',
};

function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix each import mapping
  Object.entries(importMappings).forEach(([from, to]) => {
    const regex = new RegExp(`from ['"]${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
    if (content.match(regex)) {
      content = content.replace(regex, `from '${to}`);
      modified = true;
    }
  });
  
  // Fix imports that are missing @/
  const relativeImportRegex = /from ['"](\.\.\/)+(components|lib|app|styles|public)\//g;
  content = content.replace(relativeImportRegex, (match, dots, folder) => {
    return `from '@/${folder}/`;
  });
  
  if (modified || content.includes('from \'@/')) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed imports in: ${filePath}`);
  }
}

// Find all TypeScript/JavaScript files
const files = glob.sync('**/*.{ts,tsx,js,jsx}', {
  ignore: ['node_modules/**', '.next/**', 'out/**', 'dist/**', 'build/**', 'scripts/**']
});

console.log(`🔍 Found ${files.length} files to check...`);

files.forEach(file => {
  try {
    fixImports(file);
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log('✨ Import fixing complete!');