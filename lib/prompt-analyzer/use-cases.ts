// Use case definitions for AI model selection
// Each model has specific strengths and optimal use cases

export interface UseCase {
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
}

export const MODEL_USE_CASES: Record<string, UseCase[]> = {
  // GPT-4o Use Cases - Advanced reasoning, multimodal, code generation
  'gpt-4o': [
    {
      id: 'gpt4o-1',
      category: 'Code Generation',
      title: 'Complex Full-Stack Application',
      description: 'Building complete web applications with frontend and backend',
      examples: [
        'Create a real-time chat application with React and Node.js',
        'Build a e-commerce platform with payment integration',
        'Develop a social media dashboard with analytics'
      ],
      recommendedModels: { primary: 'gpt-4o', alternatives: ['claude-3-5-sonnet-20241022'] },
      estimatedTokens: { prompt: 500, completion: 2000 }
    },
    {
      id: 'gpt4o-2',
      category: 'System Architecture',
      title: 'Microservices Design',
      description: 'Designing scalable microservices architectures',
      examples: [
        'Design a microservices architecture for a banking system',
        'Create a distributed event-driven system with Kafka',
        'Architect a cloud-native application on AWS'
      ],
      recommendedModels: { primary: 'gpt-4o', alternatives: ['claude-3-5-sonnet-20241022'] },
      estimatedTokens: { prompt: 300, completion: 1500 }
    },
    {
      id: 'gpt4o-3',
      category: 'Machine Learning',
      title: 'ML Model Development',
      description: 'Creating and optimizing machine learning models',
      examples: [
        'Build a recommendation system using collaborative filtering',
        'Develop a computer vision model for object detection',
        'Create a natural language processing pipeline'
      ],
      recommendedModels: { primary: 'gpt-4o', alternatives: ['claude-3-5-sonnet-20241022'] },
      estimatedTokens: { prompt: 400, completion: 1800 }
    },
    {
      id: 'gpt4o-4',
      category: 'Code Review',
      title: 'Security Audit',
      description: 'Comprehensive security review of codebases',
      examples: [
        'Audit a Node.js application for security vulnerabilities',
        'Review smart contract code for potential exploits',
        'Analyze API endpoints for authentication issues'
      ],
      recommendedModels: { primary: 'gpt-4o', alternatives: ['claude-3-5-sonnet-20241022'] },
      estimatedTokens: { prompt: 1000, completion: 1500 }
    },
    {
      id: 'gpt4o-5',
      category: 'Algorithm Design',
      title: 'Complex Algorithm Implementation',
      description: 'Designing and implementing advanced algorithms',
      examples: [
        'Implement a distributed consensus algorithm',
        'Create a graph traversal algorithm for route optimization',
        'Design a cache eviction strategy for high-traffic systems'
      ],
      recommendedModels: { primary: 'gpt-4o', alternatives: ['claude-3-5-sonnet-20241022'] },
      estimatedTokens: { prompt: 200, completion: 1000 }
    },
    // Continue with 25 more use cases for GPT-4o
    {
      id: 'gpt4o-6',
      category: 'DevOps',
      title: 'CI/CD Pipeline Setup',
      description: 'Setting up continuous integration and deployment pipelines',
      examples: [
        'Configure GitHub Actions for automated testing and deployment',
        'Set up Jenkins pipeline for microservices',
        'Create Kubernetes deployment manifests'
      ],
      recommendedModels: { primary: 'gpt-4o', alternatives: ['claude-3-5-sonnet-20241022'] },
      estimatedTokens: { prompt: 300, completion: 1200 }
    },
    {
      id: 'gpt4o-7',
      category: 'Database Design',
      title: 'Database Schema Optimization',
      description: 'Designing and optimizing database schemas',
      examples: [
        'Design a scalable PostgreSQL schema for multi-tenant SaaS',
        'Optimize MongoDB collections for time-series data',
        'Create efficient indexing strategies for large datasets'
      ],
      recommendedModels: { primary: 'gpt-4o', alternatives: ['claude-3-5-sonnet-20241022'] },
      estimatedTokens: { prompt: 250, completion: 1000 }
    },
    {
      id: 'gpt4o-8',
      category: 'API Design',
      title: 'RESTful API Development',
      description: 'Designing comprehensive REST APIs',
      examples: [
        'Design a RESTful API for a financial services platform',
        'Create GraphQL schema for e-commerce application',
        'Develop webhook system for real-time notifications'
      ],
      recommendedModels: { primary: 'gpt-4o', alternatives: ['claude-3-5-sonnet-20241022'] },
      estimatedTokens: { prompt: 350, completion: 1400 }
    },
    {
      id: 'gpt4o-9',
      category: 'Frontend Development',
      title: 'React Component Architecture',
      description: 'Building complex React component systems',
      examples: [
        'Create a reusable component library with TypeScript',
        'Build a drag-and-drop interface with React DnD',
        'Implement real-time collaborative editing features'
      ],
      recommendedModels: { primary: 'gpt-4o', alternatives: ['claude-3-5-sonnet-20241022'] },
      estimatedTokens: { prompt: 400, completion: 1600 }
    },
    {
      id: 'gpt4o-10',
      category: 'Mobile Development',
      title: 'Cross-Platform Mobile Apps',
      description: 'Developing mobile applications with React Native or Flutter',
      examples: [
        'Build a fitness tracking app with React Native',
        'Create a social media app with Flutter',
        'Develop offline-first mobile application'
      ],
      recommendedModels: { primary: 'gpt-4o', alternatives: ['claude-3-5-sonnet-20241022'] },
      estimatedTokens: { prompt: 450, completion: 1700 }
    },
    // 20 more use cases for comprehensive coverage
    {
      id: 'gpt4o-11',
      category: 'Testing',
      title: 'Test Automation Framework',
      description: 'Creating comprehensive test automation',
      examples: [
        'Set up end-to-end testing with Cypress',
        'Create unit test suite with Jest',
        'Implement performance testing with K6'
      ],
      recommendedModels: { primary: 'gpt-4o', alternatives: ['claude-3-5-sonnet-20241022'] },
      estimatedTokens: { prompt: 300, completion: 1100 }
    },
    {
      id: 'gpt4o-12',
      category: 'Cloud Architecture',
      title: 'AWS Infrastructure Design',
      description: 'Designing cloud infrastructure on AWS',
      examples: [
        'Design serverless architecture with Lambda',
        'Set up auto-scaling EC2 infrastructure',
        'Create multi-region disaster recovery setup'
      ],
      recommendedModels: { primary: 'gpt-4o', alternatives: ['claude-3-5-sonnet-20241022'] },
      estimatedTokens: { prompt: 350, completion: 1300 }
    },
    {
      id: 'gpt4o-13',
      category: 'Blockchain',
      title: 'Smart Contract Development',
      description: 'Creating and auditing smart contracts',
      examples: [
        'Develop ERC-20 token contract',
        'Create NFT marketplace smart contract',
        'Build DeFi lending protocol'
      ],
      recommendedModels: { primary: 'gpt-4o', alternatives: ['claude-3-5-sonnet-20241022'] },
      estimatedTokens: { prompt: 400, completion: 1500 }
    },
    {
      id: 'gpt4o-14',
      category: 'Data Engineering',
      title: 'ETL Pipeline Design',
      description: 'Building data processing pipelines',
      examples: [
        'Create Apache Spark ETL pipeline',
        'Build real-time streaming with Kafka',
        'Design data warehouse with Snowflake'
      ],
      recommendedModels: { primary: 'gpt-4o', alternatives: ['claude-3-5-sonnet-20241022'] },
      estimatedTokens: { prompt: 380, completion: 1400 }
    },
    {
      id: 'gpt4o-15',
      category: 'Performance',
      title: 'Performance Optimization',
      description: 'Optimizing application performance',
      examples: [
        'Optimize React app bundle size',
        'Improve database query performance',
        'Reduce API response times'
      ],
      recommendedModels: { primary: 'gpt-4o', alternatives: ['claude-3-5-sonnet-20241022'] },
      estimatedTokens: { prompt: 500, completion: 1200 }
    },
    {
      id: 'gpt4o-16',
      category: 'Documentation',
      title: 'Technical Documentation',
      description: 'Creating comprehensive technical docs',
      examples: [
        'Write API documentation with examples',
        'Create architecture decision records',
        'Develop user guides and tutorials'
      ],
      recommendedModels: { primary: 'gpt-4o', alternatives: ['gpt-4o-mini', 'claude-3-5-sonnet-20241022'] },
      estimatedTokens: { prompt: 200, completion: 1500 }
    },
    {
      id: 'gpt4o-17',
      category: 'Integration',
      title: 'Third-Party Integrations',
      description: 'Integrating external services and APIs',
      examples: [
        'Integrate Stripe payment processing',
        'Connect Salesforce CRM API',
        'Implement OAuth 2.0 authentication'
      ],
      recommendedModels: { primary: 'gpt-4o', alternatives: ['claude-3-5-sonnet-20241022'] },
      estimatedTokens: { prompt: 350, completion: 1300 }
    },
    {
      id: 'gpt4o-18',
      category: 'Monitoring',
      title: 'Observability Setup',
      description: 'Implementing monitoring and logging',
      examples: [
        'Set up Prometheus and Grafana',
        'Implement distributed tracing',
        'Create custom metrics dashboards'
      ],
      recommendedModels: { primary: 'gpt-4o', alternatives: ['claude-3-5-sonnet-20241022'] },
      estimatedTokens: { prompt: 280, completion: 1100 }
    },
    {
      id: 'gpt4o-19',
      category: 'Containerization',
      title: 'Docker and Kubernetes',
      description: 'Container orchestration and management',
      examples: [
        'Create multi-stage Docker builds',
        'Deploy applications to Kubernetes',
        'Set up Helm charts for deployments'
      ],
      recommendedModels: { primary: 'gpt-4o', alternatives: ['claude-3-5-sonnet-20241022'] },
      estimatedTokens: { prompt: 320, completion: 1200 }
    },
    {
      id: 'gpt4o-20',
      category: 'Real-time',
      title: 'WebSocket Applications',
      description: 'Building real-time communication systems',
      examples: [
        'Create chat application with Socket.io',
        'Build collaborative editing tool',
        'Implement live streaming platform'
      ],
      recommendedModels: { primary: 'gpt-4o', alternatives: ['claude-3-5-sonnet-20241022'] },
      estimatedTokens: { prompt: 400, completion: 1600 }
    },
    {
      id: 'gpt4o-21',
      category: 'AI/ML Integration',
      title: 'AI Model Deployment',
      description: 'Deploying and serving ML models',
      examples: [
        'Deploy TensorFlow model to production',
        'Create ML API with FastAPI',
        'Implement model versioning system'
      ],
      recommendedModels: { primary: 'gpt-4o', alternatives: ['claude-3-5-sonnet-20241022'] },
      estimatedTokens: { prompt: 420, completion: 1500 }
    },
    {
      id: 'gpt4o-22',
      category: 'Game Development',
      title: 'Game Mechanics Implementation',
      description: 'Building game logic and mechanics',
      examples: [
        'Create physics engine for 2D game',
        'Implement multiplayer game server',
        'Build procedural generation system'
      ],
      recommendedModels: { primary: 'gpt-4o', alternatives: ['claude-3-5-sonnet-20241022'] },
      estimatedTokens: { prompt: 450, completion: 1800 }
    },
    {
      id: 'gpt4o-23',
      category: 'IoT',
      title: 'IoT Device Management',
      description: 'Building IoT systems and device management',
      examples: [
        'Create MQTT broker for IoT devices',
        'Build device provisioning system',
        'Implement edge computing solution'
      ],
      recommendedModels: { primary: 'gpt-4o', alternatives: ['claude-3-5-sonnet-20241022'] },
      estimatedTokens: { prompt: 380, completion: 1400 }
    },
    {
      id: 'gpt4o-24',
      category: 'Automation',
      title: 'Workflow Automation',
      description: 'Automating business processes',
      examples: [
        'Build workflow engine with state machines',
        'Create automated report generation',
        'Implement batch processing system'
      ],
      recommendedModels: { primary: 'gpt-4o', alternatives: ['claude-3-5-sonnet-20241022'] },
      estimatedTokens: { prompt: 340, completion: 1300 }
    },
    {
      id: 'gpt4o-25',
      category: 'Compliance',
      title: 'GDPR Compliance Implementation',
      description: 'Implementing privacy and compliance features',
      examples: [
        'Build data anonymization system',
        'Implement right to be forgotten',
        'Create audit trail system'
      ],
      recommendedModels: { primary: 'gpt-4o', alternatives: ['claude-3-5-sonnet-20241022'] },
      estimatedTokens: { prompt: 360, completion: 1400 }
    },
    {
      id: 'gpt4o-26',
      category: 'Search',
      title: 'Search Engine Implementation',
      description: 'Building search functionality',
      examples: [
        'Implement Elasticsearch integration',
        'Build faceted search interface',
        'Create search ranking algorithm'
      ],
      recommendedModels: { primary: 'gpt-4o', alternatives: ['claude-3-5-sonnet-20241022'] },
      estimatedTokens: { prompt: 390, completion: 1500 }
    },
    {
      id: 'gpt4o-27',
      category: 'Caching',
      title: 'Caching Strategy Design',
      description: 'Implementing caching solutions',
      examples: [
        'Design Redis caching layer',
        'Implement CDN caching strategy',
        'Build distributed cache system'
      ],
      recommendedModels: { primary: 'gpt-4o', alternatives: ['claude-3-5-sonnet-20241022'] },
      estimatedTokens: { prompt: 310, completion: 1200 }
    },
    {
      id: 'gpt4o-28',
      category: 'Messaging',
      title: 'Message Queue Systems',
      description: 'Building message-driven architectures',
      examples: [
        'Implement RabbitMQ messaging system',
        'Build event sourcing with Kafka',
        'Create pub/sub notification system'
      ],
      recommendedModels: { primary: 'gpt-4o', alternatives: ['claude-3-5-sonnet-20241022'] },
      estimatedTokens: { prompt: 370, completion: 1400 }
    },
    {
      id: 'gpt4o-29',
      category: 'Analytics',
      title: 'Analytics Platform',
      description: 'Building analytics and reporting systems',
      examples: [
        'Create custom analytics dashboard',
        'Build A/B testing framework',
        'Implement user behavior tracking'
      ],
      recommendedModels: { primary: 'gpt-4o', alternatives: ['claude-3-5-sonnet-20241022'] },
      estimatedTokens: { prompt: 410, completion: 1600 }
    },
    {
      id: 'gpt4o-30',
      category: 'Migration',
      title: 'System Migration',
      description: 'Migrating legacy systems to modern stack',
      examples: [
        'Migrate monolith to microservices',
        'Convert jQuery app to React',
        'Migrate on-premise to cloud'
      ],
      recommendedModels: { primary: 'gpt-4o', alternatives: ['claude-3-5-sonnet-20241022'] },
      estimatedTokens: { prompt: 500, completion: 2000 }
    }
  ],

  // GPT-4o-mini Use Cases - Fast, efficient for simpler tasks
  'gpt-4o-mini': [
    {
      id: 'mini-1',
      category: 'Content Generation',
      title: 'Blog Post Writing',
      description: 'Creating blog posts and articles',
      examples: [
        'Write a blog post about web development trends',
        'Create product descriptions for e-commerce',
        'Generate social media content'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['claude-3-haiku-20240307'] },
      estimatedTokens: { prompt: 100, completion: 500 }
    },
    {
      id: 'mini-2',
      category: 'Data Processing',
      title: 'JSON/CSV Manipulation',
      description: 'Processing and transforming data formats',
      examples: [
        'Convert CSV to JSON format',
        'Extract data from structured text',
        'Format data for API responses'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['claude-3-haiku-20240307'] },
      estimatedTokens: { prompt: 200, completion: 300 }
    },
    {
      id: 'mini-3',
      category: 'Code Snippets',
      title: 'Utility Functions',
      description: 'Writing small utility functions',
      examples: [
        'Create a date formatting function',
        'Write array manipulation utilities',
        'Generate regex patterns'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['claude-3-haiku-20240307'] },
      estimatedTokens: { prompt: 50, completion: 200 }
    },
    // Continue with 27 more use cases for GPT-4o-mini...
    {
      id: 'mini-4',
      category: 'Email',
      title: 'Email Templates',
      description: 'Creating email templates and responses',
      examples: [
        'Draft professional email responses',
        'Create newsletter templates',
        'Write follow-up emails'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['claude-3-haiku-20240307'] },
      estimatedTokens: { prompt: 80, completion: 250 }
    },
    {
      id: 'mini-5',
      category: 'Translation',
      title: 'Simple Translations',
      description: 'Translating text between languages',
      examples: [
        'Translate UI strings',
        'Convert documentation to other languages',
        'Localize error messages'
      ],
      recommendedModels: { primary: 'gpt-4o-mini', alternatives: ['gemini-1.5-flash'] },
      estimatedTokens: { prompt: 100, completion: 150 }
    },
    // Add remaining 25 use cases...
  ],

  // Claude 3.5 Sonnet Use Cases - Excellent for code, analysis, long context
  'claude-3-5-sonnet-20241022': [
    {
      id: 'claude-1',
      category: 'Code Refactoring',
      title: 'Large-Scale Refactoring',
      description: 'Refactoring complex codebases',
      examples: [
        'Refactor legacy JavaScript to modern TypeScript',
        'Convert class components to React hooks',
        'Optimize database queries and schema'
      ],
      recommendedModels: { primary: 'claude-3-5-sonnet-20241022', alternatives: ['gpt-4o'] },
      estimatedTokens: { prompt: 1000, completion: 1500 }
    },
    {
      id: 'claude-2',
      category: 'Technical Writing',
      title: 'Documentation Generation',
      description: 'Creating comprehensive technical documentation',
      examples: [
        'Write complete API documentation',
        'Create architectural design documents',
        'Generate code comments and docstrings'
      ],
      recommendedModels: { primary: 'claude-3-5-sonnet-20241022', alternatives: ['gpt-4o'] },
      estimatedTokens: { prompt: 300, completion: 2000 }
    },
    // Continue with 28 more use cases for Claude...
  ],

  // Claude 3 Haiku Use Cases - Fast, efficient, good for simple tasks
  'claude-3-haiku-20240307': [
    {
      id: 'haiku-1',
      category: 'Quick Answers',
      title: 'Code Explanations',
      description: 'Explaining code snippets quickly',
      examples: [
        'Explain what this function does',
        'Describe this algorithm',
        'What is the purpose of this code block'
      ],
      recommendedModels: { primary: 'claude-3-haiku-20240307', alternatives: ['gpt-4o-mini'] },
      estimatedTokens: { prompt: 100, completion: 200 }
    },
    // Continue with 29 more use cases for Haiku...
  ],

  // Gemini 1.5 Pro Use Cases - Massive context, multimodal
  'gemini-1.5-pro': [
    {
      id: 'gemini-pro-1',
      category: 'Document Analysis',
      title: 'Large Document Processing',
      description: 'Analyzing very large documents',
      examples: [
        'Analyze 500-page technical specification',
        'Summarize entire codebase documentation',
        'Extract insights from research papers'
      ],
      recommendedModels: { primary: 'gemini-1.5-pro', alternatives: ['claude-3-5-sonnet-20241022'] },
      estimatedTokens: { prompt: 50000, completion: 2000 }
    },
    // Continue with 29 more use cases for Gemini Pro...
  ],

  // Gemini 1.5 Flash Use Cases - Ultra-fast, cost-effective
  'gemini-1.5-flash': [
    {
      id: 'flash-1',
      category: 'Bulk Processing',
      title: 'High-Volume Tasks',
      description: 'Processing large volumes of simple tasks',
      examples: [
        'Classify thousands of support tickets',
        'Extract entities from documents',
        'Batch process user inputs'
      ],
      recommendedModels: { primary: 'gemini-1.5-flash', alternatives: ['claude-3-haiku-20240307'] },
      estimatedTokens: { prompt: 50, completion: 100 }
    },
    // Continue with 29 more use cases for Flash...
  ],

  // Grok-2 Use Cases - Reasoning, real-time info, humor
  'grok-2-1212': [
    {
      id: 'grok-1',
      category: 'Current Events',
      title: 'Real-Time Analysis',
      description: 'Analyzing current events and trends',
      examples: [
        'Analyze latest technology trends',
        'Summarize recent news developments',
        'Provide insights on market movements'
      ],
      recommendedModels: { primary: 'grok-2-1212', alternatives: ['sonar-pro'] },
      estimatedTokens: { prompt: 200, completion: 800 }
    },
    // Continue with 29 more use cases for Grok...
  ],

  // Perplexity Sonar Pro Use Cases - Research, citations, web search
  'sonar-pro': [
    {
      id: 'sonar-1',
      category: 'Research',
      title: 'Academic Research',
      description: 'Conducting research with citations',
      examples: [
        'Research latest AI developments with sources',
        'Find and summarize scientific papers',
        'Compile industry reports with references'
      ],
      recommendedModels: { primary: 'sonar-pro', alternatives: ['grok-2-1212'] },
      estimatedTokens: { prompt: 150, completion: 1000 }
    },
    // Continue with 29 more use cases for Sonar...
  ]
};

// Function to find best model for a given prompt
export function findBestModelForPrompt(prompt: string): {
  model: string;
  useCases: UseCase[];
  confidence: number;
} {
  const promptLower = prompt.toLowerCase();
  const matches: Map<string, { cases: UseCase[]; score: number }> = new Map();

  // Check each model's use cases
  for (const [model, useCases] of Object.entries(MODEL_USE_CASES)) {
    let score = 0;
    const matchedCases: UseCase[] = [];

    for (const useCase of useCases) {
      // Check if prompt matches examples
      for (const example of useCase.examples) {
        if (promptLower.includes(example.toLowerCase()) || 
            example.toLowerCase().includes(promptLower)) {
          score += 10;
          matchedCases.push(useCase);
          break;
        }
      }

      // Check category and title matches
      if (promptLower.includes(useCase.category.toLowerCase())) {
        score += 5;
        if (!matchedCases.includes(useCase)) {
          matchedCases.push(useCase);
        }
      }

      if (promptLower.includes(useCase.title.toLowerCase())) {
        score += 7;
        if (!matchedCases.includes(useCase)) {
          matchedCases.push(useCase);
        }
      }
    }

    if (score > 0) {
      matches.set(model, { cases: matchedCases, score });
    }
  }

  // Find best match
  let bestModel = 'gpt-4o-mini'; // default
  let bestScore = 0;
  let bestCases: UseCase[] = [];

  for (const [model, data] of matches.entries()) {
    if (data.score > bestScore) {
      bestScore = data.score;
      bestModel = model;
      bestCases = data.cases;
    }
  }

  return {
    model: bestModel,
    useCases: bestCases,
    confidence: Math.min(bestScore / 100, 1)
  };
}

// Get use case statistics
export function getUseCaseStats() {
  const stats: Record<string, { total: number; categories: Set<string> }> = {};
  
  for (const [model, useCases] of Object.entries(MODEL_USE_CASES)) {
    const categories = new Set<string>();
    for (const useCase of useCases) {
      categories.add(useCase.category);
    }
    stats[model] = {
      total: useCases.length,
      categories
    };
  }
  
  return stats;
}