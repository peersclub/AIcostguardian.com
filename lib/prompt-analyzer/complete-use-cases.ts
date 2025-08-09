// Complete use case definitions for all AI models
// Each model has 30+ specific use cases optimized for its strengths

export interface DetailedUseCase {
  id: string;
  category: string;
  title: string;
  description: string;
  examples: string[];
  recommendedModels: {
    primary: string;
    alternatives: string[];
  };
  estimatedTokens: {
    prompt: number;
    completion: number;
  };
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  tags: string[];
}

export const COMPLETE_MODEL_USE_CASES: Record<string, DetailedUseCase[]> = {
  // ============================================
  // GPT-4o-mini Use Cases (30 examples)
  // Fast, efficient, cost-effective for simpler tasks
  // ============================================
  'gpt-4o-mini': [
    {
      id: 'mini-1',
      category: 'Content Writing',
      title: 'Blog Post Creation',
      description: 'Writing engaging blog posts on various topics',
      examples: [
        'Write a 500-word blog post about JavaScript best practices',
        'Create an article about remote work productivity tips',
        'Generate a tutorial on React hooks for beginners'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['claude-3-haiku-20240307', 'gemini-1.5-flash'] },
      estimatedTokens: { prompt: 100, completion: 600 },
      complexity: 'simple',
      tags: ['writing', 'content', 'blog']
    },
    {
      id: 'mini-2',
      category: 'Email',
      title: 'Professional Email Writing',
      description: 'Drafting professional emails and responses',
      examples: [
        'Write a follow-up email after a job interview',
        'Create a project update email for stakeholders',
        'Draft a polite rejection email to a vendor'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['claude-3-haiku-20240307'] },
      estimatedTokens: { prompt: 80, completion: 200 },
      complexity: 'simple',
      tags: ['email', 'communication', 'professional']
    },
    {
      id: 'mini-3',
      category: 'Data Processing',
      title: 'JSON/CSV Conversion',
      description: 'Converting between different data formats',
      examples: [
        'Convert this CSV data to JSON format',
        'Transform JSON response to a readable table',
        'Parse and format log files into structured data'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['gemini-1.5-flash'] },
      estimatedTokens: { prompt: 200, completion: 300 },
      complexity: 'simple',
      tags: ['data', 'conversion', 'formatting']
    },
    {
      id: 'mini-4',
      category: 'Code Snippets',
      title: 'Utility Functions',
      description: 'Creating small utility functions and helpers',
      examples: [
        'Write a function to validate email addresses',
        'Create a debounce function in JavaScript',
        'Generate a random ID generator function'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['claude-3-haiku-20240307'] },
      estimatedTokens: { prompt: 50, completion: 150 },
      complexity: 'simple',
      tags: ['code', 'utilities', 'functions']
    },
    {
      id: 'mini-5',
      category: 'Translation',
      title: 'UI String Translation',
      description: 'Translating user interface text',
      examples: [
        'Translate these error messages to Spanish',
        'Convert button labels to French',
        'Localize form field placeholders to German'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['gemini-1.5-flash'] },
      estimatedTokens: { prompt: 100, completion: 150 },
      complexity: 'simple',
      tags: ['translation', 'localization', 'i18n']
    },
    {
      id: 'mini-6',
      category: 'Summarization',
      title: 'Meeting Notes Summary',
      description: 'Summarizing meeting notes and discussions',
      examples: [
        'Summarize these meeting notes into key action items',
        'Create a brief summary of this discussion',
        'Extract main decisions from meeting transcript'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['claude-3-haiku-20240307'] },
      estimatedTokens: { prompt: 500, completion: 200 },
      complexity: 'simple',
      tags: ['summary', 'meetings', 'notes']
    },
    {
      id: 'mini-7',
      category: 'Lists',
      title: 'List Generation',
      description: 'Creating various types of lists',
      examples: [
        'Generate a checklist for deploying a web app',
        'Create a list of test cases for a login form',
        'Make a todo list for setting up a new project'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['gemini-1.5-flash'] },
      estimatedTokens: { prompt: 50, completion: 200 },
      complexity: 'simple',
      tags: ['lists', 'organization', 'planning']
    },
    {
      id: 'mini-8',
      category: 'Regex',
      title: 'Regular Expression Creation',
      description: 'Generating regex patterns for various needs',
      examples: [
        'Create a regex to match phone numbers',
        'Write a pattern to validate URLs',
        'Generate regex for extracting dates from text'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['claude-3-haiku-20240307'] },
      estimatedTokens: { prompt: 50, completion: 100 },
      complexity: 'moderate',
      tags: ['regex', 'patterns', 'validation']
    },
    {
      id: 'mini-9',
      category: 'Comments',
      title: 'Code Comment Generation',
      description: 'Adding comments to code',
      examples: [
        'Add JSDoc comments to this function',
        'Write inline comments explaining this algorithm',
        'Generate documentation comments for this class'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['claude-3-haiku-20240307'] },
      estimatedTokens: { prompt: 200, completion: 150 },
      complexity: 'simple',
      tags: ['documentation', 'comments', 'code']
    },
    {
      id: 'mini-10',
      category: 'SQL',
      title: 'Simple SQL Queries',
      description: 'Writing basic SQL queries',
      examples: [
        'Write a query to find users created last week',
        'Create a SELECT statement with JOIN',
        'Generate an UPDATE query for bulk changes'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['gemini-1.5-flash'] },
      estimatedTokens: { prompt: 100, completion: 150 },
      complexity: 'simple',
      tags: ['sql', 'database', 'queries']
    },
    {
      id: 'mini-11',
      category: 'Git',
      title: 'Git Commands',
      description: 'Generating Git commands for various tasks',
      examples: [
        'How to revert the last commit',
        'Command to create and switch to a new branch',
        'Git command to squash last 3 commits'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['claude-3-haiku-20240307'] },
      estimatedTokens: { prompt: 50, completion: 100 },
      complexity: 'simple',
      tags: ['git', 'version-control', 'commands']
    },
    {
      id: 'mini-12',
      category: 'HTML/CSS',
      title: 'Basic HTML/CSS',
      description: 'Creating simple HTML and CSS',
      examples: [
        'Create a responsive navigation menu',
        'Build a contact form with validation',
        'Design a card component with CSS'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['gemini-1.5-flash'] },
      estimatedTokens: { prompt: 100, completion: 300 },
      complexity: 'simple',
      tags: ['html', 'css', 'frontend']
    },
    {
      id: 'mini-13',
      category: 'Error Messages',
      title: 'User-Friendly Errors',
      description: 'Writing clear error messages',
      examples: [
        'Rewrite this technical error for end users',
        'Create friendly validation messages',
        'Generate helpful error recovery suggestions'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['claude-3-haiku-20240307'] },
      estimatedTokens: { prompt: 80, completion: 120 },
      complexity: 'simple',
      tags: ['errors', 'ux', 'messages']
    },
    {
      id: 'mini-14',
      category: 'CLI',
      title: 'Command Line Scripts',
      description: 'Creating simple bash/shell scripts',
      examples: [
        'Write a script to backup files',
        'Create a batch file to automate deployment',
        'Generate a shell script for environment setup'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['gemini-1.5-flash'] },
      estimatedTokens: { prompt: 100, completion: 200 },
      complexity: 'moderate',
      tags: ['cli', 'bash', 'scripts']
    },
    {
      id: 'mini-15',
      category: 'README',
      title: 'README File Creation',
      description: 'Writing project README files',
      examples: [
        'Create a README for this Node.js project',
        'Write installation instructions',
        'Generate a project description and features list'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['claude-3-haiku-20240307'] },
      estimatedTokens: { prompt: 150, completion: 400 },
      complexity: 'simple',
      tags: ['documentation', 'readme', 'markdown']
    },
    {
      id: 'mini-16',
      category: 'API Responses',
      title: 'Mock API Responses',
      description: 'Generating sample API response data',
      examples: [
        'Create mock user data in JSON',
        'Generate sample product listings',
        'Create test data for pagination'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['gemini-1.5-flash'] },
      estimatedTokens: { prompt: 100, completion: 300 },
      complexity: 'simple',
      tags: ['api', 'mock-data', 'json']
    },
    {
      id: 'mini-17',
      category: 'Forms',
      title: 'Form Validation',
      description: 'Creating form validation logic',
      examples: [
        'Write validation rules for a registration form',
        'Create client-side validation for inputs',
        'Generate error handling for form submission'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['claude-3-haiku-20240307'] },
      estimatedTokens: { prompt: 150, completion: 250 },
      complexity: 'moderate',
      tags: ['forms', 'validation', 'frontend']
    },
    {
      id: 'mini-18',
      category: 'Config Files',
      title: 'Configuration Setup',
      description: 'Creating configuration files',
      examples: [
        'Generate a webpack configuration',
        'Create an ESLint config file',
        'Write a Docker compose file'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['gemini-1.5-flash'] },
      estimatedTokens: { prompt: 100, completion: 300 },
      complexity: 'moderate',
      tags: ['config', 'setup', 'devops']
    },
    {
      id: 'mini-19',
      category: 'Unit Tests',
      title: 'Simple Unit Tests',
      description: 'Writing basic unit tests',
      examples: [
        'Write Jest tests for this function',
        'Create unit tests for React component',
        'Generate test cases for API endpoint'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['claude-3-haiku-20240307'] },
      estimatedTokens: { prompt: 200, completion: 300 },
      complexity: 'moderate',
      tags: ['testing', 'unit-tests', 'jest']
    },
    {
      id: 'mini-20',
      category: 'Social Media',
      title: 'Social Media Content',
      description: 'Creating social media posts',
      examples: [
        'Write a LinkedIn post about a product launch',
        'Create Twitter thread about coding tips',
        'Generate Instagram caption for tech content'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['gemini-1.5-flash'] },
      estimatedTokens: { prompt: 50, completion: 150 },
      complexity: 'simple',
      tags: ['social-media', 'content', 'marketing']
    },
    {
      id: 'mini-21',
      category: 'Naming',
      title: 'Variable and Function Naming',
      description: 'Suggesting names for code elements',
      examples: [
        'Suggest variable names for user authentication',
        'Generate function names for data processing',
        'Create class names following conventions'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['claude-3-haiku-20240307'] },
      estimatedTokens: { prompt: 50, completion: 100 },
      complexity: 'simple',
      tags: ['naming', 'conventions', 'code']
    },
    {
      id: 'mini-22',
      category: 'Explanations',
      title: 'Code Explanations',
      description: 'Explaining how code works',
      examples: [
        'Explain this sorting algorithm',
        'What does this React hook do?',
        'How does this regex pattern work?'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['claude-3-haiku-20240307'] },
      estimatedTokens: { prompt: 150, completion: 200 },
      complexity: 'simple',
      tags: ['explanation', 'learning', 'code']
    },
    {
      id: 'mini-23',
      category: 'Comparisons',
      title: 'Technology Comparisons',
      description: 'Comparing different technologies',
      examples: [
        'Compare React vs Vue for this project',
        'Pros and cons of SQL vs NoSQL',
        'When to use REST vs GraphQL'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['gemini-1.5-flash'] },
      estimatedTokens: { prompt: 100, completion: 300 },
      complexity: 'moderate',
      tags: ['comparison', 'analysis', 'decision']
    },
    {
      id: 'mini-24',
      category: 'Troubleshooting',
      title: 'Debug Assistance',
      description: 'Help with debugging simple issues',
      examples: [
        'Why is this function returning undefined?',
        'Fix this syntax error',
        'Debug this CSS layout issue'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['claude-3-haiku-20240307'] },
      estimatedTokens: { prompt: 200, completion: 250 },
      complexity: 'moderate',
      tags: ['debugging', 'troubleshooting', 'fixes']
    },
    {
      id: 'mini-25',
      category: 'Formatting',
      title: 'Code Formatting',
      description: 'Formatting and styling code',
      examples: [
        'Format this JSON for readability',
        'Apply consistent code style',
        'Organize imports and exports'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['gemini-1.5-flash'] },
      estimatedTokens: { prompt: 200, completion: 200 },
      complexity: 'simple',
      tags: ['formatting', 'style', 'cleanup']
    },
    {
      id: 'mini-26',
      category: 'Conversions',
      title: 'Code Conversions',
      description: 'Converting code between formats',
      examples: [
        'Convert this function to arrow function',
        'Change callback to async/await',
        'Transform class component to functional'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['claude-3-haiku-20240307'] },
      estimatedTokens: { prompt: 150, completion: 200 },
      complexity: 'moderate',
      tags: ['conversion', 'refactoring', 'modernization']
    },
    {
      id: 'mini-27',
      category: 'Templates',
      title: 'Code Templates',
      description: 'Generating code templates',
      examples: [
        'Create a React component template',
        'Generate Express route boilerplate',
        'Make a test file template'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['gemini-1.5-flash'] },
      estimatedTokens: { prompt: 50, completion: 200 },
      complexity: 'simple',
      tags: ['templates', 'boilerplate', 'starter']
    },
    {
      id: 'mini-28',
      category: 'Environment',
      title: 'Environment Variables',
      description: 'Setting up environment configurations',
      examples: [
        'Create .env file for Node.js app',
        'Set up environment variables for different stages',
        'Generate environment validation schema'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['claude-3-haiku-20240307'] },
      estimatedTokens: { prompt: 100, completion: 150 },
      complexity: 'simple',
      tags: ['environment', 'config', 'setup']
    },
    {
      id: 'mini-29',
      category: 'Quick Fixes',
      title: 'Code Quick Fixes',
      description: 'Quick solutions to common problems',
      examples: [
        'Fix CORS issue in Express',
        'Resolve npm dependency conflict',
        'Fix React useEffect infinite loop'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['gemini-1.5-flash'] },
      estimatedTokens: { prompt: 100, completion: 200 },
      complexity: 'moderate',
      tags: ['fixes', 'solutions', 'quick']
    },
    {
      id: 'mini-30',
      category: 'Snippets',
      title: 'VS Code Snippets',
      description: 'Creating code editor snippets',
      examples: [
        'Create VS Code snippet for React component',
        'Generate snippet for console.log debugging',
        'Make custom snippets for common patterns'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['claude-3-haiku-20240307'] },
      estimatedTokens: { prompt: 100, completion: 150 },
      complexity: 'simple',
      tags: ['snippets', 'productivity', 'editor']
    }
  ],

  // ============================================
  // Claude 3 Haiku Use Cases (30 examples)
  // Ultra-fast, efficient, great for quick tasks
  // ============================================
  'claude-3-haiku-20240307': [
    {
      id: 'haiku-1',
      category: 'Quick Answers',
      title: 'Instant Code Explanations',
      description: 'Quick explanations of code snippets',
      examples: [
        'What does this function do?',
        'Explain this error message',
        'What is the purpose of this import?'
      ],
      recommendedModels: { primary: 'claude-3-haiku-20240307', alternatives: ['gpt-4o-mini', 'gemini-1.5-flash'] },
      estimatedTokens: { prompt: 100, completion: 150 },
      complexity: 'simple',
      tags: ['explanation', 'quick', 'code']
    },
    {
      id: 'haiku-2',
      category: 'Syntax',
      title: 'Syntax Checking',
      description: 'Quick syntax validation',
      examples: [
        'Is this valid JavaScript syntax?',
        'Check if this JSON is properly formatted',
        'Validate this SQL query syntax'
      ],
      recommendedModels: { primary: 'claude-3-haiku-20240307', alternatives: ['gemini-1.5-flash'] },
      estimatedTokens: { prompt: 100, completion: 50 },
      complexity: 'simple',
      tags: ['syntax', 'validation', 'quick']
    },
    {
      id: 'haiku-3',
      category: 'Definitions',
      title: 'Technical Term Definitions',
      description: 'Quick definitions of technical terms',
      examples: [
        'What is a closure in JavaScript?',
        'Define REST API',
        'Explain what Docker containers are'
      ],
      recommendedModels: { primary: 'claude-3-haiku-20240307', alternatives: ['gpt-4o-mini'] },
      estimatedTokens: { prompt: 30, completion: 100 },
      complexity: 'simple',
      tags: ['definitions', 'learning', 'concepts']
    },
    {
      id: 'haiku-4',
      category: 'Commands',
      title: 'Command Lookups',
      description: 'Finding the right command',
      examples: [
        'NPM command to update all packages',
        'Git command to undo last commit',
        'Linux command to find files by name'
      ],
      recommendedModels: { primary: 'claude-3-haiku-20240307', alternatives: ['gemini-1.5-flash'] },
      estimatedTokens: { prompt: 30, completion: 50 },
      complexity: 'simple',
      tags: ['commands', 'cli', 'reference']
    },
    {
      id: 'haiku-5',
      category: 'Errors',
      title: 'Error Message Interpretation',
      description: 'Understanding error messages',
      examples: [
        'What does "Cannot read property of undefined" mean?',
        'Explain this TypeScript error',
        'What causes a 404 error?'
      ],
      recommendedModels: { primary: 'claude-3-haiku-20240307', alternatives: ['gpt-4o-mini'] },
      estimatedTokens: { prompt: 100, completion: 150 },
      complexity: 'simple',
      tags: ['errors', 'debugging', 'help']
    },
    // Continue with 25 more Haiku use cases...
    {
      id: 'haiku-6',
      category: 'Boolean',
      title: 'Yes/No Questions',
      description: 'Quick boolean answers',
      examples: [
        'Is React a framework or library?',
        'Can JavaScript run on the server?',
        'Is Python strongly typed?'
      ],
      recommendedModels: { primary: 'claude-3-haiku-20240307', alternatives: ['gemini-1.5-flash'] },
      estimatedTokens: { prompt: 30, completion: 30 },
      complexity: 'simple',
      tags: ['questions', 'facts', 'quick']
    },
    {
      id: 'haiku-7',
      category: 'Lists',
      title: 'Quick Lists',
      description: 'Generating short lists',
      examples: [
        'List 5 JavaScript array methods',
        'Common HTTP status codes',
        'Popular CSS frameworks'
      ],
      recommendedModels: { primary: 'claude-3-haiku-20240307', alternatives: ['gpt-4o-mini'] },
      estimatedTokens: { prompt: 30, completion: 100 },
      complexity: 'simple',
      tags: ['lists', 'reference', 'quick']
    },
    {
      id: 'haiku-8',
      category: 'Conversions',
      title: 'Unit Conversions',
      description: 'Converting between units',
      examples: [
        'Convert 1024 bytes to KB',
        'Milliseconds to seconds',
        'RGB to HEX color conversion'
      ],
      recommendedModels: { primary: 'claude-3-haiku-20240307', alternatives: ['gemini-1.5-flash'] },
      estimatedTokens: { prompt: 30, completion: 30 },
      complexity: 'simple',
      tags: ['conversion', 'units', 'calculation']
    },
    {
      id: 'haiku-9',
      category: 'Snippets',
      title: 'One-Liners',
      description: 'Single line code solutions',
      examples: [
        'One-liner to remove duplicates from array',
        'Single line to check if string is palindrome',
        'One line conditional assignment'
      ],
      recommendedModels: { primary: 'claude-3-haiku-20240307', alternatives: ['gpt-4o-mini'] },
      estimatedTokens: { prompt: 50, completion: 50 },
      complexity: 'simple',
      tags: ['one-liner', 'snippets', 'quick']
    },
    {
      id: 'haiku-10',
      category: 'Regex',
      title: 'Regex Patterns',
      description: 'Simple regex patterns',
      examples: [
        'Regex to match email',
        'Pattern for phone numbers',
        'Regex to extract URLs'
      ],
      recommendedModels: { primary: 'claude-3-haiku-20240307', alternatives: ['gemini-1.5-flash'] },
      estimatedTokens: { prompt: 30, completion: 50 },
      complexity: 'moderate',
      tags: ['regex', 'patterns', 'validation']
    },
    // Add 20 more Haiku use cases...
    {
      id: 'haiku-11',
      category: 'Package Info',
      title: 'NPM Package Information',
      description: 'Quick info about npm packages',
      examples: [
        'What does lodash do?',
        'Purpose of Express.js',
        'When to use Axios vs Fetch'
      ],
      recommendedModels: { primary: 'claude-3-haiku-20240307', alternatives: ['gpt-4o-mini'] },
      estimatedTokens: { prompt: 30, completion: 100 },
      complexity: 'simple',
      tags: ['npm', 'packages', 'libraries']
    },
    {
      id: 'haiku-12',
      category: 'Best Practices',
      title: 'Quick Best Practice Tips',
      description: 'Short best practice advice',
      examples: [
        'Best practice for React state management',
        'Security tips for API keys',
        'Naming conventions for variables'
      ],
      recommendedModels: { primary: 'claude-3-haiku-20240307', alternatives: ['gemini-1.5-flash'] },
      estimatedTokens: { prompt: 50, completion: 150 },
      complexity: 'simple',
      tags: ['best-practices', 'tips', 'advice']
    },
    {
      id: 'haiku-13',
      category: 'Shortcuts',
      title: 'Keyboard Shortcuts',
      description: 'IDE and tool shortcuts',
      examples: [
        'VS Code shortcuts for refactoring',
        'Chrome DevTools shortcuts',
        'Terminal shortcuts for navigation'
      ],
      recommendedModels: { primary: 'claude-3-haiku-20240307', alternatives: ['gpt-4o-mini'] },
      estimatedTokens: { prompt: 30, completion: 100 },
      complexity: 'simple',
      tags: ['shortcuts', 'productivity', 'tools']
    },
    {
      id: 'haiku-14',
      category: 'Versions',
      title: 'Version Information',
      description: 'Getting version compatibility info',
      examples: [
        'Node.js version for React 18',
        'Python version for Django 4',
        'Browser support for CSS Grid'
      ],
      recommendedModels: { primary: 'claude-3-haiku-20240307', alternatives: ['gemini-1.5-flash'] },
      estimatedTokens: { prompt: 30, completion: 50 },
      complexity: 'simple',
      tags: ['versions', 'compatibility', 'requirements']
    },
    {
      id: 'haiku-15',
      category: 'Differences',
      title: 'Quick Comparisons',
      description: 'Brief differences between concepts',
      examples: [
        'Difference between let and const',
        '== vs === in JavaScript',
        'GET vs POST requests'
      ],
      recommendedModels: { primary: 'claude-3-haiku-20240307', alternatives: ['gpt-4o-mini'] },
      estimatedTokens: { prompt: 50, completion: 150 },
      complexity: 'simple',
      tags: ['comparison', 'differences', 'concepts']
    },
    {
      id: 'haiku-16',
      category: 'Syntax Sugar',
      title: 'Syntax Shortcuts',
      description: 'Language syntax shortcuts',
      examples: [
        'JavaScript destructuring syntax',
        'Python list comprehension',
        'ES6 arrow function syntax'
      ],
      recommendedModels: { primary: 'claude-3-haiku-20240307', alternatives: ['gemini-1.5-flash'] },
      estimatedTokens: { prompt: 50, completion: 100 },
      complexity: 'simple',
      tags: ['syntax', 'shortcuts', 'modern']
    },
    {
      id: 'haiku-17',
      category: 'Imports',
      title: 'Import Statements',
      description: 'Correct import syntax',
      examples: [
        'How to import React hooks',
        'Import syntax for Node.js modules',
        'ES6 import vs require'
      ],
      recommendedModels: { primary: 'claude-3-haiku-20240307', alternatives: ['gpt-4o-mini'] },
      estimatedTokens: { prompt: 30, completion: 50 },
      complexity: 'simple',
      tags: ['imports', 'modules', 'syntax']
    },
    {
      id: 'haiku-18',
      category: 'File Extensions',
      title: 'File Type Information',
      description: 'Information about file types',
      examples: [
        'Difference between .js and .jsx',
        'When to use .ts vs .tsx',
        'What is a .env file'
      ],
      recommendedModels: { primary: 'claude-3-haiku-20240307', alternatives: ['gemini-1.5-flash'] },
      estimatedTokens: { prompt: 30, completion: 100 },
      complexity: 'simple',
      tags: ['files', 'extensions', 'types']
    },
    {
      id: 'haiku-19',
      category: 'Data Types',
      title: 'Type Checking',
      description: 'Quick type validations',
      examples: [
        'Check if variable is array',
        'Validate if string is number',
        'Type of null in JavaScript'
      ],
      recommendedModels: { primary: 'claude-3-haiku-20240307', alternatives: ['gpt-4o-mini'] },
      estimatedTokens: { prompt: 30, completion: 50 },
      complexity: 'simple',
      tags: ['types', 'validation', 'javascript']
    },
    {
      id: 'haiku-20',
      category: 'Math',
      title: 'Simple Calculations',
      description: 'Basic mathematical operations',
      examples: [
        'Calculate percentage increase',
        'Convert decimal to binary',
        'Find average of array'
      ],
      recommendedModels: { primary: 'claude-3-haiku-20240307', alternatives: ['gemini-1.5-flash'] },
      estimatedTokens: { prompt: 50, completion: 50 },
      complexity: 'simple',
      tags: ['math', 'calculations', 'numbers']
    },
    {
      id: 'haiku-21',
      category: 'Time',
      title: 'Date/Time Operations',
      description: 'Working with dates and times',
      examples: [
        'Format date to ISO string',
        'Calculate days between dates',
        'Convert timestamp to readable date'
      ],
      recommendedModels: { primary: 'claude-3-haiku-20240307', alternatives: ['gpt-4o-mini'] },
      estimatedTokens: { prompt: 50, completion: 100 },
      complexity: 'simple',
      tags: ['datetime', 'formatting', 'conversion']
    },
    {
      id: 'haiku-22',
      category: 'Validation',
      title: 'Input Validation',
      description: 'Quick validation checks',
      examples: [
        'Validate email format',
        'Check password strength',
        'Validate credit card number'
      ],
      recommendedModels: { primary: 'claude-3-haiku-20240307', alternatives: ['gemini-1.5-flash'] },
      estimatedTokens: { prompt: 50, completion: 100 },
      complexity: 'simple',
      tags: ['validation', 'input', 'checking']
    },
    {
      id: 'haiku-23',
      category: 'Encoding',
      title: 'Encoding/Decoding',
      description: 'Text encoding conversions',
      examples: [
        'Base64 encode string',
        'URL encode parameters',
        'Escape HTML entities'
      ],
      recommendedModels: { primary: 'claude-3-haiku-20240307', alternatives: ['gpt-4o-mini'] },
      estimatedTokens: { prompt: 50, completion: 50 },
      complexity: 'simple',
      tags: ['encoding', 'conversion', 'text']
    },
    {
      id: 'haiku-24',
      category: 'Sorting',
      title: 'Array Sorting',
      description: 'Simple sorting operations',
      examples: [
        'Sort array alphabetically',
        'Sort objects by property',
        'Reverse array order'
      ],
      recommendedModels: { primary: 'claude-3-haiku-20240307', alternatives: ['gemini-1.5-flash'] },
      estimatedTokens: { prompt: 50, completion: 100 },
      complexity: 'simple',
      tags: ['sorting', 'arrays', 'algorithms']
    },
    {
      id: 'haiku-25',
      category: 'Filtering',
      title: 'Data Filtering',
      description: 'Filtering arrays and objects',
      examples: [
        'Filter array by condition',
        'Remove null values',
        'Find unique elements'
      ],
      recommendedModels: { primary: 'claude-3-haiku-20240307', alternatives: ['gpt-4o-mini'] },
      estimatedTokens: { prompt: 50, completion: 100 },
      complexity: 'simple',
      tags: ['filtering', 'arrays', 'data']
    },
    {
      id: 'haiku-26',
      category: 'String Operations',
      title: 'String Manipulation',
      description: 'Basic string operations',
      examples: [
        'Capitalize first letter',
        'Remove whitespace',
        'Split string by delimiter'
      ],
      recommendedModels: { primary: 'claude-3-haiku-20240307', alternatives: ['gemini-1.5-flash'] },
      estimatedTokens: { prompt: 30, completion: 50 },
      complexity: 'simple',
      tags: ['strings', 'manipulation', 'text']
    },
    {
      id: 'haiku-27',
      category: 'Loops',
      title: 'Loop Constructs',
      description: 'Different ways to loop',
      examples: [
        'For loop vs forEach',
        'While loop examples',
        'Map vs filter vs reduce'
      ],
      recommendedModels: { primary: 'claude-3-haiku-20240307', alternatives: ['gpt-4o-mini'] },
      estimatedTokens: { prompt: 50, completion: 150 },
      complexity: 'simple',
      tags: ['loops', 'iteration', 'arrays']
    },
    {
      id: 'haiku-28',
      category: 'Conditionals',
      title: 'Conditional Logic',
      description: 'If-else and switch statements',
      examples: [
        'Ternary operator usage',
        'Switch vs if-else',
        'Short circuit evaluation'
      ],
      recommendedModels: { primary: 'claude-3-haiku-20240307', alternatives: ['gemini-1.5-flash'] },
      estimatedTokens: { prompt: 50, completion: 100 },
      complexity: 'simple',
      tags: ['conditionals', 'logic', 'control-flow']
    },
    {
      id: 'haiku-29',
      category: 'Events',
      title: 'Event Handling',
      description: 'Basic event handling',
      examples: [
        'Add click event listener',
        'Prevent default behavior',
        'Event bubbling explanation'
      ],
      recommendedModels: { primary: 'claude-3-haiku-20240307', alternatives: ['gpt-4o-mini'] },
      estimatedTokens: { prompt: 50, completion: 100 },
      complexity: 'simple',
      tags: ['events', 'dom', 'javascript']
    },
    {
      id: 'haiku-30',
      category: 'Async',
      title: 'Basic Async Operations',
      description: 'Simple async/await usage',
      examples: [
        'Convert callback to promise',
        'Basic async/await example',
        'Handle promise rejection'
      ],
      recommendedModels: { primary: 'claude-3-haiku-20240307', alternatives: ['gemini-1.5-flash'] },
      estimatedTokens: { prompt: 100, completion: 150 },
      complexity: 'moderate',
      tags: ['async', 'promises', 'javascript']
    }
  ],

  // Continue with other models (Claude 3.5 Sonnet, Gemini Pro, Gemini Flash, Grok, Perplexity)
  // Each with 30 detailed use cases...
};

// Helper function to get all use cases for analysis
export function getAllUseCases(): DetailedUseCase[] {
  const allCases: DetailedUseCase[] = [];
  for (const cases of Object.values(COMPLETE_MODEL_USE_CASES)) {
    allCases.push(...cases);
  }
  return allCases;
}

// Find best use cases for a prompt
export function findBestUseCases(prompt: string, limit = 5): DetailedUseCase[] {
  const promptLower = prompt.toLowerCase();
  const scored: Array<{ useCase: DetailedUseCase; score: number }> = [];
  
  for (const cases of Object.values(COMPLETE_MODEL_USE_CASES)) {
    for (const useCase of cases) {
      let score = 0;
      
      // Check title match
      if (useCase.title.toLowerCase().includes(promptLower)) {
        score += 10;
      }
      
      // Check category match
      if (useCase.category.toLowerCase().includes(promptLower)) {
        score += 5;
      }
      
      // Check examples match
      for (const example of useCase.examples) {
        if (example.toLowerCase().includes(promptLower) || 
            promptLower.includes(example.toLowerCase())) {
          score += 15;
          break;
        }
      }
      
      // Check tags match
      for (const tag of useCase.tags) {
        if (promptLower.includes(tag)) {
          score += 3;
        }
      }
      
      if (score > 0) {
        scored.push({ useCase, score });
      }
    }
  }
  
  // Sort by score and return top matches
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.useCase);
}