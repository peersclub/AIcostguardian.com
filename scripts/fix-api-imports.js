#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to process each file
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix ApiResponse imports from usage
  if (content.includes("from '@/lib/types/usage'") && content.includes('ApiResponse')) {
    // Extract the imports from usage
    const usageImportMatch = content.match(/import\s*\{([^}]+)\}\s*from\s*['"]@\/lib\/types\/usage['"]/);
    if (usageImportMatch) {
      const imports = usageImportMatch[1].split(',').map(i => i.trim());
      const apiResponseIndex = imports.findIndex(i => i === 'ApiResponse');
      
      if (apiResponseIndex !== -1) {
        // Remove ApiResponse from usage imports
        imports.splice(apiResponseIndex, 1);
        
        if (imports.length > 0) {
          // Update the usage import
          const newUsageImport = `import { ${imports.join(', ')} } from '@/lib/types/usage'`;
          content = content.replace(usageImportMatch[0], newUsageImport);
        } else {
          // Remove the usage import entirely
          content = content.replace(usageImportMatch[0] + '\n', '');
        }
        
        // Add ApiResponse import from api if not already present
        if (!content.includes("from '@/lib/types/api'")) {
          const insertPosition = content.indexOf("from '@/lib/types/usage'") + "from '@/lib/types/usage'".length;
          const lineEnd = content.indexOf('\n', insertPosition);
          content = content.slice(0, lineEnd + 1) + "import { ApiResponse } from '@/lib/types/api'\n" + content.slice(lineEnd + 1);
        } else {
          // Add ApiResponse to existing api import
          const apiImportMatch = content.match(/import\s*\{([^}]+)\}\s*from\s*['"]@\/lib\/types\/api['"]/);
          if (apiImportMatch && !apiImportMatch[1].includes('ApiResponse')) {
            const apiImports = apiImportMatch[1].split(',').map(i => i.trim());
            apiImports.push('ApiResponse');
            const newApiImport = `import { ${apiImports.join(', ')} } from '@/lib/types/api'`;
            content = content.replace(apiImportMatch[0], newApiImport);
          }
        }
        
        modified = true;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed imports in: ${filePath}`);
    return true;
  }
  return false;
}

// Main execution
console.log('🔍 Searching for files with ApiResponse imports from wrong location...\n');

const patterns = [
  '**/*.ts',
  '**/*.tsx',
];

const excludePatterns = [
  'node_modules/**',
  '.next/**',
  'build/**',
  'dist/**',
];

let filesProcessed = 0;
let filesModified = 0;

patterns.forEach(pattern => {
  const files = glob.sync(pattern, { 
    ignore: excludePatterns,
    nodir: true 
  });
  
  files.forEach(file => {
    filesProcessed++;
    if (processFile(file)) {
      filesModified++;
    }
  });
});

console.log(`\n✨ Import fixing complete!`);
console.log(`📊 Processed ${filesProcessed} files, modified ${filesModified} files`);