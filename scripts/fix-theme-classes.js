const fs = require('fs');
const path = require('path');

// Theme mappings based on our theme configuration
const colorMappings = {
  // Background colors
  'bg-white': 'bg-background',
  'bg-gray-50': 'bg-muted/50',
  'bg-gray-100': 'bg-muted',
  'bg-gray-200': 'bg-border',
  'bg-gray-900': 'bg-foreground',
  'bg-black': 'bg-foreground',
  
  // Text colors
  'text-gray-900': 'text-foreground',
  'text-gray-800': 'text-foreground/90',
  'text-gray-700': 'text-foreground/80',
  'text-gray-600': 'text-muted-foreground',
  'text-gray-500': 'text-muted-foreground/80',
  'text-gray-400': 'text-muted-foreground/60',
  'text-white': 'text-background',
  
  // Border colors
  'border-gray-200': 'border-border',
  'border-gray-300': 'border-border',
  'border-gray-400': 'border-border/80',
  'border-gray-500': 'border-border/60',
  
  // Hover states
  'hover:bg-gray-50': 'hover:bg-muted/50',
  'hover:bg-gray-100': 'hover:bg-muted',
  'hover:bg-gray-200': 'hover:bg-muted/80',
  'hover:text-gray-900': 'hover:text-foreground',
  'hover:text-gray-700': 'hover:text-foreground/90',
  
  // Focus states
  'focus:ring-gray-500': 'focus:ring-ring',
  'focus:border-gray-500': 'focus:border-ring',
  
  // Dark mode specifics
  'dark:bg-gray-800': 'dark:bg-card',
  'dark:bg-gray-900': 'dark:bg-background',
  'dark:text-gray-100': 'dark:text-foreground',
  'dark:text-gray-200': 'dark:text-foreground/90',
  'dark:text-gray-300': 'dark:text-foreground/80',
  'dark:text-gray-400': 'dark:text-muted-foreground',
  'dark:border-gray-700': 'dark:border-border',
  'dark:border-gray-600': 'dark:border-border',
};

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Replace each mapping
    Object.entries(colorMappings).forEach(([oldClass, newClass]) => {
      // Create regex to match the class in various contexts
      const regex = new RegExp(`\\b${oldClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
      const newContent = content.replace(regex, newClass);
      
      if (newContent !== content) {
        hasChanges = true;
        content = newContent;
      }
    });
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dir, extensions = ['.tsx', '.jsx', '.ts', '.js']) {
  let totalFiles = 0;
  let updatedFiles = 0;
  
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and .git directories
      if (item !== 'node_modules' && item !== '.git' && item !== '.next') {
        const result = processDirectory(fullPath, extensions);
        totalFiles += result.total;
        updatedFiles += result.updated;
      }
    } else if (stat.isFile()) {
      const ext = path.extname(fullPath);
      if (extensions.includes(ext)) {
        totalFiles++;
        if (updateFile(fullPath)) {
          updatedFiles++;
        }
      }
    }
  });
  
  return { total: totalFiles, updated: updatedFiles };
}

// Main execution
console.log('🎨 Starting theme class migration...\n');

const componentsDir = path.join(process.cwd(), 'components');
const appDir = path.join(process.cwd(), 'app');

console.log('Processing components directory...');
const componentsResult = processDirectory(componentsDir);

console.log('\nProcessing app directory...');
const appResult = processDirectory(appDir);

const totalProcessed = componentsResult.total + appResult.total;
const totalUpdated = componentsResult.updated + appResult.updated;

console.log('\n' + '='.repeat(50));
console.log(`✨ Theme migration complete!`);
console.log(`📊 Files processed: ${totalProcessed}`);
console.log(`✏️  Files updated: ${totalUpdated}`);
console.log('='.repeat(50));

if (totalUpdated > 0) {
  console.log('\n⚠️  Please review the changes and test your application.');
  console.log('💡 You may need to restart your development server.');
}