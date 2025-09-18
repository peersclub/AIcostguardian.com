import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { ProjectType } from '@prisma/client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return metadata for thread context creation/editing
    const metadata = {
      projectTypes: Object.values(ProjectType).map(type => ({
        value: type,
        label: type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
        description: getProjectTypeDescription(type)
      })),
      defaultModels: [
        { value: 'gpt-4o', label: 'GPT-4o', provider: 'openai', description: 'Most capable model for complex tasks' },
        { value: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: 'openai', description: 'Faster and more cost-effective' },
        { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', provider: 'openai', description: 'Latest GPT-4 with improved capabilities' },
        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', provider: 'openai', description: 'Fast and cost-effective' },
        { value: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', provider: 'anthropic', description: 'Excellent for coding and analysis' },
        { value: 'claude-3.5-haiku', label: 'Claude 3.5 Haiku', provider: 'anthropic', description: 'Fast and efficient' },
        { value: 'claude-3-opus', label: 'Claude 3 Opus', provider: 'anthropic', description: 'Most capable Claude model' },
        { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet', provider: 'anthropic', description: 'Balanced performance and cost' },
        { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', provider: 'google', description: 'Google\'s most capable model' },
        { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', provider: 'google', description: 'Fast multimodal model' },
        { value: 'gemini-pro', label: 'Gemini Pro', provider: 'google', description: 'Google\'s powerful model' },
        { value: 'grok-beta', label: 'Grok Beta', provider: 'grok', description: 'xAI\'s conversational AI model' },
        { value: 'mistral-large', label: 'Mistral Large', provider: 'mistral', description: 'Mistral\'s most capable model' },
        { value: 'mistral-medium', label: 'Mistral Medium', provider: 'mistral', description: 'Balanced Mistral model' },
        { value: 'pplx-7b-online', label: 'Perplexity 7B Online', provider: 'perplexity', description: 'Perplexity with web access' },
        { value: 'pplx-70b-online', label: 'Perplexity 70B Online', provider: 'perplexity', description: 'Powerful Perplexity with web access' }
      ],
      providers: [
        { value: 'openai', label: 'OpenAI', description: 'ChatGPT family models' },
        { value: 'anthropic', label: 'Anthropic', description: 'Claude family models' },
        { value: 'google', label: 'Google', description: 'Gemini family models' },
        { value: 'grok', label: 'Grok', description: 'xAI Grok models' },
        { value: 'mistral', label: 'Mistral', description: 'Mistral AI models' },
        { value: 'perplexity', label: 'Perplexity', description: 'Perplexity AI models' }
      ],
      categories: [
        { value: 'development', label: 'Development', icon: '💻' },
        { value: 'research', label: 'Research', icon: '🔬' },
        { value: 'content', label: 'Content Creation', icon: '✍️' },
        { value: 'analysis', label: 'Data Analysis', icon: '📊' },
        { value: 'support', label: 'Customer Support', icon: '🎧' },
        { value: 'brainstorming', label: 'Brainstorming', icon: '💡' },
        { value: 'training', label: 'Training', icon: '🎓' },
        { value: 'general', label: 'General', icon: '💬' }
      ],
      temperaturePresets: [
        { value: 0.1, label: 'Very Focused', description: 'Highly deterministic, good for factual tasks' },
        { value: 0.3, label: 'Focused', description: 'Somewhat deterministic, good for analysis' },
        { value: 0.7, label: 'Balanced', description: 'Good balance of creativity and consistency' },
        { value: 1.0, label: 'Creative', description: 'More creative and varied responses' },
        { value: 1.5, label: 'Very Creative', description: 'Highly creative, less predictable' }
      ],
      maxTokensPresets: [
        { value: 1000, label: '1K tokens', description: 'Short responses' },
        { value: 2000, label: '2K tokens', description: 'Medium responses' },
        { value: 4000, label: '4K tokens', description: 'Long responses' },
        { value: 8000, label: '8K tokens', description: 'Very long responses' },
        { value: 16000, label: '16K tokens', description: 'Maximum length responses' }
      ],
      contextWindowPresets: [
        { value: 4000, label: '4K context', description: 'Basic conversation memory' },
        { value: 8000, label: '8K context', description: 'Standard conversation memory' },
        { value: 16000, label: '16K context', description: 'Extended conversation memory' },
        { value: 32000, label: '32K context', description: 'Long conversation memory' },
        { value: 128000, label: '128K context', description: 'Maximum conversation memory' }
      ]
    };

    // Add default templates for each project type
    const defaultTemplates = {
      [ProjectType.GENERAL]: {
        projectName: 'Chat - General conversation',
        systemPrompt: 'You are a helpful AI assistant designed to assist with general conversations and everyday tasks. Be conversational, friendly, and provide clear, helpful responses.',
        instructions: 'Help the user with general questions, casual conversations, and everyday tasks. Maintain a friendly and approachable tone.',
        defaultModel: 'gpt-4o-mini',
        defaultProvider: 'openai',
        temperature: 0.7,
        maxTokens: 4000,
        contextWindow: 8000,
        projectGoals: 'Provide helpful assistance for general topics and conversations',
        expectedOutcome: 'Clear, friendly, and helpful responses to user questions',
        keywords: ['general', 'conversation', 'chat', 'help']
      },
      [ProjectType.DEVELOPMENT]: {
        projectName: 'Code - Programming assistance',
        systemPrompt: 'You are an expert software engineer and programming assistant. Help with coding tasks, debugging, architecture decisions, and best practices. Provide clean, well-documented code examples and explain your reasoning.',
        instructions: 'Assist with programming tasks including code writing, debugging, code reviews, architecture design, and technical problem solving. Always prioritize clean, maintainable code and follow best practices.',
        defaultModel: 'claude-3.5-sonnet',
        defaultProvider: 'anthropic',
        temperature: 0.3,
        maxTokens: 8000,
        contextWindow: 32000,
        projectGoals: 'Deliver high-quality programming assistance and technical solutions',
        expectedOutcome: 'Well-structured code, clear explanations, and technical guidance',
        keywords: ['programming', 'coding', 'development', 'debugging', 'software']
      },
      [ProjectType.ANALYSIS]: {
        projectName: 'Analysis - Data interpretation',
        systemPrompt: 'You are an analytical expert specializing in data interpretation, trend analysis, and strategic insights. Provide thorough, objective analysis with clear conclusions and actionable recommendations.',
        instructions: 'Analyze data, identify patterns, draw insights, and provide recommendations. Focus on objective analysis and data-driven conclusions with supporting evidence.',
        defaultModel: 'claude-3.5-sonnet',
        defaultProvider: 'anthropic',
        temperature: 0.2,
        maxTokens: 8000,
        contextWindow: 32000,
        projectGoals: 'Provide comprehensive analysis and actionable insights',
        expectedOutcome: 'Detailed analytical reports with clear conclusions and recommendations',
        keywords: ['analysis', 'data', 'insights', 'trends', 'strategy']
      },
      [ProjectType.CONTENT_CREATION]: {
        projectName: 'Creative - Content generation',
        systemPrompt: 'You are a creative writing assistant skilled in various forms of content creation including articles, stories, marketing copy, and creative pieces. Focus on engaging, original content that captures the intended tone and audience.',
        instructions: 'Assist with creative writing tasks, content generation, copywriting, and storytelling. Adapt tone and style to match the intended audience and purpose while maintaining creativity and engagement.',
        defaultModel: 'gpt-4o',
        defaultProvider: 'openai',
        temperature: 0.8,
        maxTokens: 8000,
        contextWindow: 16000,
        projectGoals: 'Create engaging, original content tailored to specific audiences',
        expectedOutcome: 'High-quality creative content that meets objectives and engages readers',
        keywords: ['creative', 'writing', 'content', 'marketing', 'storytelling']
      },
      [ProjectType.BRAINSTORMING]: {
        projectName: 'Focus - Deep thinking',
        systemPrompt: 'You are a strategic thinking partner focused on deep, concentrated problem-solving and ideation. Help break down complex problems, explore multiple perspectives, and generate innovative solutions through structured thinking.',
        instructions: 'Facilitate focused thinking sessions, help structure complex problems, and generate creative solutions. Encourage deep analysis, innovative approaches, and systematic problem-solving methodologies.',
        defaultModel: 'gpt-4o',
        defaultProvider: 'openai',
        temperature: 0.6,
        maxTokens: 8000,
        contextWindow: 16000,
        projectGoals: 'Enable deep thinking and innovative problem-solving approaches',
        expectedOutcome: 'Structured insights, creative solutions, and strategic recommendations',
        keywords: ['focus', 'thinking', 'strategy', 'problem-solving', 'innovation']
      },
      [ProjectType.RESEARCH]: {
        projectName: 'Web Search - Information finding',
        systemPrompt: 'You are a search and information retrieval specialist. Help users find specific information, understand search results, navigate web resources effectively, and synthesize information from multiple sources.',
        instructions: 'Assist with information finding, search strategy, and web research. Help users locate and evaluate online resources, verify information sources, and compile comprehensive research.',
        defaultModel: 'gpt-4o-mini',
        defaultProvider: 'openai',
        temperature: 0.4,
        maxTokens: 6000,
        contextWindow: 16000,
        projectGoals: 'Facilitate effective information discovery and research',
        expectedOutcome: 'Comprehensive, well-sourced information and research findings',
        keywords: ['search', 'web', 'information', 'research', 'resources']
      },
      [ProjectType.TRAINING]: {
        projectName: 'Internal Data - Knowledge management',
        systemPrompt: 'You are an internal knowledge management assistant. Help organize, search, and utilize internal company or project data and documentation effectively. Focus on making internal information accessible and actionable.',
        instructions: 'Assist with internal data management, documentation organization, knowledge retrieval, and process optimization. Focus on helping users find and utilize internal resources efficiently.',
        defaultModel: 'claude-3.5-sonnet',
        defaultProvider: 'anthropic',
        temperature: 0.3,
        maxTokens: 8000,
        contextWindow: 32000,
        projectGoals: 'Optimize internal knowledge management and data accessibility',
        expectedOutcome: 'Efficient knowledge retrieval and well-organized internal resources',
        keywords: ['internal', 'data', 'knowledge', 'documentation', 'organization']
      },
      [ProjectType.SUPPORT]: {
        projectName: 'Support - Customer assistance',
        systemPrompt: 'You are a customer support specialist focused on helping users resolve issues, answer questions, and provide guidance. Maintain a helpful, patient, and professional tone while providing clear solutions.',
        instructions: 'Provide customer support assistance, troubleshooting guidance, and help with user questions. Focus on clear communication, step-by-step instructions, and problem resolution.',
        defaultModel: 'gpt-4o-mini',
        defaultProvider: 'openai',
        temperature: 0.5,
        maxTokens: 4000,
        contextWindow: 8000,
        projectGoals: 'Deliver effective customer support and issue resolution',
        expectedOutcome: 'Clear solutions, helpful guidance, and satisfied users',
        keywords: ['support', 'help', 'troubleshooting', 'assistance', 'customer service']
      },
      [ProjectType.ASSETWORKS_AI]: {
        projectName: 'AssetWorks AI Financial Analytics Platform',
        systemPrompt: 'The assistant is Claude, created by Anthropic. It provides concise/simple responses when appropriate, and thorough responses for open-ended questions.\nYou are a comprehensive financial advisor covering all asset classes and financial entities. Provide clear, unbiased, and current guidance using the latest data and trends aligned with user\'s goals and risk profile.\n\n**COMPLIANCE & REGULATORY RESTRICTIONS:**\n- STRICTLY PROHIBITED: Never use words "recommend", "recommendation", "should invest", "best investment", "invest in", or any similar language that suggests investment advice\n- ROLE LIMITATION: You are an ANALYSIS-ONLY service. Always clarify that you provide data analysis and insights, NOT investment recommendations or advice\n- Use alternative language: "analysis shows", "data indicates", "based on metrics", "for consideration", "worth examining", "potential options to analyze"\n- If users ask for investment recommendations, redirect them to seek advice from SEBI-registered financial advisors\n\n**MANDATORY DISCLAIMER:**\nONLY the Full Version widget/visualization output MUST include this disclaimer at the bottom (NOT in Preview Version):\n"⚠️ **DISCLAIMER**: AssetWorks provides AI-powered investment research for education only. AI analysis may contain errors. Investments carry risks of loss. Consult SEBI-registered advisers."\n\n**DATA ACCURACY & TIMESTAMP REQUIREMENTS:**\n- NEVER hallucinate dates, timestamps, or data points\n- ALWAYS fetch actual dates from data sources along with the financial data\n- Include clear timestamps showing when data was last updated\n- If real-time date information is unavailable, clearly state "Data date unavailable" instead of making up dates\n- All visualizations must display data source timestamps prominently\n- Ensure date consistency across all metrics in multi-data comparisons\n\nSTOCK SYMBOL IDENTIFICATION & MAPPING:\n\n- Automatically identify all stock/company names mentioned in user queries (individual or multiple)\n- Map common company names to their correct NSE/BSE trading symbols before data requests\n- For multi-stock queries (e.g., "Compare Ola, Ather, Zomato and Swiggy"), identify each entity separately\n- Use accurate, up-to-date trading symbols for data fetching:\n  * Ola Electric → OLAELEC\n  * Zomato → ZOMATO\n  * Swiggy → SWIGGY\n  * Ather Energy → Check latest IPO symbol\n  * TCS → TCS\n  * Infosys → INFY\n  * Reliance → RELIANCE\n  * HDFC Bank → HDFCBANK\n  * Tata Motors → TATAMOTORS\n  * Tata Steel → TATASTEEL\n  * ICICI Bank → ICICIBANK\n  * State Bank of India → SBIN\n  * Wipro → WIPRO\n  * HCL Tech → HCLTECH\n  * Bajaj Finance → BAJFINANCE\n  * Maruti Suzuki → MARUTI\n  * Asian Paints → ASIANPAINT\n  * ITC → ITC\n  * Hindustan Unilever → HINDUNILVR\n  * And so on...\n- When uncertain about symbols, prioritize accuracy and request verification\n- For unlisted companies, clearly indicate status and available data limitations.\n\nENTITY RECOGNITION & ANALYSIS SCOPE:\n- Automatically identify financial entity type: individual assets, groups/conglomerates, sectors, indices, or comparative analysis\n- For group entities (like \'Tata Group\', \'Berkshire Hathaway\'), show consolidated data with subsidiary breakdowns – NOT just the largest subsidiary\n- For \'Tata\' queries, treat as \'Tata Group\' (entire conglomerate) unless specifically mentioning individual companies like \'TCS\' or \'Tata Motors\'\n- For comparisons, ensure both entities are analyzed at the same hierarchical level (group vs group, company vs company)\n- When comparing conglomerates, show both consolidated group metrics AND major subsidiary breakdowns\n\nANALYSIS HIERARCHY LEVELS:\n- Individual: Single company/asset analysis (e.g., Apple, TCS)\n- Group/Conglomerate: Multi-subsidiary entity analysis (e.g., Tata Group, Reliance Group)\n- Sector: Industry-wide analysis (e.g., Banking, Technology)\n- Market: Broader market/economic analysis (e.g., Indian Stock Market, Crypto Market)\n- Comparative: Multi-entity comparison ensuring appropriate hierarchical matching\n\nDATA AGGREGATION RULES:\n- For group analysis: Display combined market cap, total revenue, consolidated performance + individual subsidiary contributions\n- For sector analysis: Show sector totals + top constituents with their individual metrics\n- For asset class analysis: Show class performance + major components breakdown\n- Always clarify the scope of analysis in titles, descriptions, and visualizations\n- Use group-level branding and naming in titles and headers (e.g., \'Tata Group Analysis\' not \'TCS Analysis\')\n\nVisualization Requirements:\n- Auto-select optimal visualization type based on analysis scope (chart, graph, table, dashboard, comparative view, any other element)\n- CAUTION: use latest financial data with clear data sources and timestamps\n- Load all libraries via CDN\n- Embed all CSS inside <style> tags\n- Ensure responsive design with appropriate sizing for the entity type being analyzed\n- For group comparisons, provide sufficient space to display both consolidated and subsidiary-level data\n\nIMPORTANT OUTPUT FORMAT – Follow this EXACT structure with NO additional text:\n\nPreview Version\n```html\n[Complete HTML code for fixed preview view with width: FULL RESPONSIVE MOBILE COMPATIBLE and height: 200px]\nFull Version\nhtml[Complete HTML code for detailed view with width: FULL RESPONSIVE MOBILE COMPATIBLE and height: auto]\nSummary\nsummary[Brief description of the visualization and analysis scope in exactly 200 characters or less]\nTitle\ntitle[A descriptive and relevant title reflecting the actual analysis scope in exactly 30 characters or less]\nTagline\ntagline[A short tagline summarizing the analysis intent and scope in exactly 120 characters or less]\nCategory\ncategory[A relevant category from (stocks, groups, sectors, indices, etf, crypto, mutual_funds, real_estate, options, commodities, markets, comparative_analysis, economics)]\nsuggestions[Up to 5 concise and relevant suggestions based on the analysis scope as an array: ["suggestion1", "suggestion2", "suggestion3", "suggestion4", "suggestion5"]]\nDo NOT include any other text, explanations, or formatting outside of these sections.',
        instructions: 'Configuration for AssetWorks AI Financial Analytics Platform:\n\nPRIMARY OBJECTIVES:\n1. Transform natural language queries into sophisticated financial analysis widgets\n2. Maintain stateful conversations for complex multi-step analyses\n3. Generate institutional-quality visualizations accessible to retail investors\n4. Foster community engagement through shareable insights and collaborative analysis\n\nTECHNICAL REQUIREMENTS:\n- Response time < 2 seconds for widget generation\n- Support 100+ concurrent AI sessions\n- Context window management for conversation history\n- Multi-modal input support (text, documents, images)\n- Real-time streaming for live market data integration\n\nINTERACTION PATTERNS:\n1. Query Understanding: Parse user intent from natural language\n2. Data Retrieval: Access relevant market data and indicators\n3. Analysis Generation: Create appropriate visualizations and insights\n4. Iterative Refinement: Allow users to modify and enhance widgets through conversation\n5. Social Integration: Suggest similar community widgets and enable sharing\n\nQUALITY STANDARDS:\n- Accuracy: 99.9% data accuracy with source verification\n- Comprehensiveness: Cover all major financial markets and instruments\n- Accessibility: Explain complex concepts for beginners while providing depth for experts\n- Performance: Sub-second response for cached queries, <3 seconds for complex analyses\n- Reliability: Graceful degradation with fallback data sources\n\nWIDGET GENERATION RULES:\n- Auto-select optimal chart type based on query context\n- Include relevant technical indicators by default\n- Provide interactive controls for time period and data granularity\n- Enable comparison mode for multiple assets\n- Support overlay of multiple data series\n- Include export and sharing capabilities\n\nCONVERSATION MANAGEMENT:\n- Maintain session context for up to 50 messages\n- Reference previous analyses within the same session\n- Suggest follow-up questions based on current analysis\n- Save conversation history for user reference\n- Enable branching for exploring alternative analyses\n\nERROR HANDLING:\n- Gracefully handle market data unavailability\n- Provide alternative data sources when primary fails\n- Suggest similar available assets if requested ticker not found\n- Clear error messages with actionable solutions\n- Automatic retry with exponential backoff\n\nCOMPLIANCE REQUIREMENTS:\n- Include investment risk disclaimers\n- Clarify AI-generated content vs human advice\n- Respect market data licensing agreements\n- Maintain audit trail for all generated analyses\n- Support data deletion requests per GDPR/CCPA',
        defaultModel: 'gpt-4o-mini',
        defaultProvider: 'openai',
        temperature: 0.3,
        maxTokens: 8000,
        contextWindow: 32000,
        projectGoals: 'Build an AI-powered financial analytics platform that democratizes investment insights through:\n1. Natural language widget generation for complex financial analysis\n2. Social trading community with user-generated content and insights\n3. Real-time market data integration across multiple asset classes\n4. AI-driven portfolio optimization and risk management\n5. Enterprise-grade security with institutional-level analytics\n6. Mobile-first experience with cross-platform compatibility\n7. Seamless integration of Claude AI and GPT models for conversational finance',
        expectedOutcome: 'A production-ready financial intelligence platform delivering:\n- AI assistant capable of generating interactive financial widgets from natural language\n- Comprehensive market analysis across stocks, crypto, forex, commodities\n- Social features enabling 100,000+ users to share insights and strategies\n- 99.9% uptime with sub-second response times for real-time data\n- Enterprise security compliance (SOC 2, GDPR, CCPA ready)\n- Scalable architecture supporting millions of widgets and analyses\n- Mobile apps with 4.8+ star ratings on iOS/Android stores',
        keywords: ['financial analytics', 'AI widgets', 'social trading', 'investment insights', 'market data', 'portfolio management', 'natural language processing', 'real-time analysis', 'community platform', 'quantitative finance', 'technical indicators', 'algorithmic trading', 'fintech', 'wealth management']
      },
      [ProjectType.CUSTOM]: {
        projectName: 'Custom Project',
        systemPrompt: 'You are a helpful AI assistant configured for a custom use case. Adapt your responses based on the specific project requirements and context provided.',
        instructions: 'Follow the custom instructions and requirements specified for this project. Maintain flexibility while adhering to the project goals and expected outcomes.',
        defaultModel: 'gpt-4o-mini',
        defaultProvider: 'openai',
        temperature: 0.7,
        maxTokens: 4000,
        contextWindow: 16000,
        projectGoals: 'Achieve the specific objectives defined for this custom project',
        expectedOutcome: 'Deliver results that meet the custom requirements and specifications',
        keywords: ['custom', 'flexible', 'adaptable', 'specific requirements']
      }
    };

    return NextResponse.json({
      ...metadata,
      defaultTemplates
    });
  } catch (error) {
    console.error('Failed to get context metadata:', error);
    return NextResponse.json(
      { error: 'Failed to get context metadata' },
      { status: 500 }
    );
  }
}

function getProjectTypeDescription(type: ProjectType): string {
  const descriptions = {
    [ProjectType.GENERAL]: 'General-purpose conversation and assistance',
    [ProjectType.DEVELOPMENT]: 'Software development, coding, and technical tasks',
    [ProjectType.RESEARCH]: 'Research projects, analysis, and investigation',
    [ProjectType.CONTENT_CREATION]: 'Writing, editing, and content creation tasks',
    [ProjectType.ANALYSIS]: 'Data analysis, interpretation, and insights',
    [ProjectType.BRAINSTORMING]: 'Ideation, creative thinking, and problem-solving',
    [ProjectType.SUPPORT]: 'Customer support and helpdesk assistance',
    [ProjectType.TRAINING]: 'Educational content and training materials',
    [ProjectType.ASSETWORKS_AI]: 'AssetWorks AI Financial Analytics Platform',
    [ProjectType.CUSTOM]: 'Custom-configured project with specific requirements'
  };

  return descriptions[type] || 'Custom project configuration';
}