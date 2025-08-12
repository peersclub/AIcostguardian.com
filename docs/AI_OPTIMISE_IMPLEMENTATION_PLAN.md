# AI Optimise - Complete Implementation Plan

## Overview
Complete upgrade of AI Optimise to production-ready state with advanced features including thread management, shared collaboration, Claude-like UI, and functional modes.

## Database Schema Updates

### 1. Thread Management Schema
```sql
-- Update existing threads table
ALTER TABLE threads ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE threads ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT FALSE;
ALTER TABLE threads ADD COLUMN IF NOT EXISTS share_token VARCHAR(255) UNIQUE;
ALTER TABLE threads ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE threads ADD COLUMN IF NOT EXISTS mode VARCHAR(50) DEFAULT 'standard';
ALTER TABLE threads ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- Thread collaborators for shared access
CREATE TABLE IF NOT EXISTS thread_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  email VARCHAR(255),
  role VARCHAR(50) DEFAULT 'viewer', -- viewer, editor, owner
  joined_at TIMESTAMP DEFAULT NOW(),
  last_accessed TIMESTAMP,
  UNIQUE(thread_id, user_id),
  UNIQUE(thread_id, email)
);

-- Thread activity log
CREATE TABLE IF NOT EXISTS thread_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action VARCHAR(50), -- created, edited, shared, pinned, deleted, restored
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messages updates
ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited_by UUID REFERENCES users(id);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]';

-- Prompt templates and analysis
CREATE TABLE IF NOT EXISTS prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template TEXT NOT NULL,
  category VARCHAR(100),
  variables JSONB DEFAULT '[]',
  usage_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Prompt analysis history
CREATE TABLE IF NOT EXISTS prompt_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES threads(id),
  message_id UUID REFERENCES messages(id),
  prompt TEXT NOT NULL,
  analysis JSONB NOT NULL, -- tokens, complexity, intent, suggestions
  provider VARCHAR(50),
  model VARCHAR(100),
  cost_estimate DECIMAL(10, 6),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Implementation Components

### 1. Thread Management Service
```typescript
// src/services/thread-manager.ts
export class ThreadManager {
  // Core operations
  async createThread(data: CreateThreadDto): Promise<Thread>
  async deleteThread(threadId: string, userId: string): Promise<void>
  async restoreThread(threadId: string, userId: string): Promise<Thread>
  async pinThread(threadId: string, userId: string): Promise<Thread>
  async unpinThread(threadId: string, userId: string): Promise<Thread>
  
  // Sharing operations
  async shareThread(threadId: string, options: ShareOptions): Promise<ShareResult>
  async unshareThread(threadId: string, userId: string): Promise<void>
  async addCollaborator(threadId: string, email: string, role: string): Promise<void>
  async removeCollaborator(threadId: string, collaboratorId: string): Promise<void>
  async getCollaborators(threadId: string): Promise<Collaborator[]>
  
  // Query operations
  async getUserThreads(userId: string, options: QueryOptions): Promise<Thread[]>
  async getSharedThreads(userId: string): Promise<Thread[]>
  async getPinnedThreads(userId: string): Promise<Thread[]>
  async getThreadByShareToken(token: string): Promise<Thread>
  
  // Activity tracking
  async logActivity(threadId: string, action: string, metadata?: any): Promise<void>
  async getActivityLog(threadId: string): Promise<Activity[]>
}
```

### 2. Real-time Collaboration Service
```typescript
// src/services/collaboration.service.ts
export class CollaborationService {
  private io: Server
  private activeUsers: Map<string, Set<string>> // threadId -> Set<userId>
  private userCursors: Map<string, CursorPosition>
  
  // Real-time events
  onUserJoin(threadId: string, userId: string): void
  onUserLeave(threadId: string, userId: string): void
  onMessageTyping(threadId: string, userId: string, content: string): void
  onMessageSent(threadId: string, message: Message): void
  onCursorMove(threadId: string, userId: string, position: CursorPosition): void
  
  // Broadcast methods
  broadcastToThread(threadId: string, event: string, data: any): void
  broadcastPresence(threadId: string): void
  syncThreadState(threadId: string, userId: string): void
}
```

### 3. Prompt Analyzer
```typescript
// src/services/prompt-analyzer.ts
export class PromptAnalyzer {
  async analyze(prompt: string, context?: AnalysisContext): Promise<PromptAnalysis> {
    return {
      tokens: this.countTokens(prompt),
      complexity: this.calculateComplexity(prompt),
      intent: this.detectIntent(prompt),
      entities: this.extractEntities(prompt),
      suggestions: this.generateSuggestions(prompt),
      estimatedCost: this.estimateCost(prompt, context?.model),
      warnings: this.checkForIssues(prompt),
      templates: this.findMatchingTemplates(prompt)
    }
  }
  
  private countTokens(prompt: string): TokenCount
  private calculateComplexity(prompt: string): ComplexityScore
  private detectIntent(prompt: string): Intent[]
  private extractEntities(prompt: string): Entity[]
  private generateSuggestions(prompt: string): Suggestion[]
  private estimateCost(prompt: string, model?: string): CostEstimate
  private checkForIssues(prompt: string): Warning[]
  private findMatchingTemplates(prompt: string): Template[]
}
```

### 4. Mode Implementations

#### Focus Mode
```typescript
// src/modes/focus-mode.ts
export class FocusMode {
  // UI Changes
  hideSidePanels(): void
  minimizeInterface(): void
  enableZenWriting(): void
  disableNotifications(): void
  
  // Features
  enableDeepWork(): void
  trackFocusTime(): void
  blockDistractions(): void
}
```

#### Code Mode
```typescript
// src/modes/code-mode.ts
export class CodeMode {
  // UI Enhancements
  enableSyntaxHighlighting(): void
  showLineNumbers(): void
  enableCodeFolding(): void
  showMinimap(): void
  
  // Features
  detectLanguage(code: string): string
  formatCode(code: string, language: string): string
  runCode(code: string, language: string): ExecutionResult
  generateTests(code: string): string[]
  explainCode(code: string): Explanation
}
```

#### Research Mode
```typescript
// src/modes/research-mode.ts
export class ResearchMode {
  // UI Features
  showContextPanel(): void
  enableSourceTracking(): void
  showCitationTools(): void
  
  // Research Features
  searchSources(query: string): Source[]
  extractFacts(content: string): Fact[]
  generateCitations(sources: Source[]): Citation[]
  summarizeFindings(facts: Fact[]): Summary
  exportResearch(format: 'pdf' | 'markdown' | 'docx'): Buffer
}
```

### 5. Claude-like Input Component
```typescript
// src/components/chat/claude-input.tsx
interface ClaudeInputProps {
  onSend: (message: string, attachments?: File[]) => void
  onModeChange: (mode: ChatMode) => void
  promptAnalysis?: PromptAnalysis
}

export function ClaudeInput({ onSend, onModeChange, promptAnalysis }: ClaudeInputProps) {
  // Features:
  // - Multi-line expandable textarea
  // - File attachment support (drag & drop)
  // - Model selector dropdown
  // - Token counter
  // - Cost estimator
  // - Prompt templates
  // - @ mentions for context
  // - / commands
  // - Keyboard shortcuts
  // - Voice input
  // - Rich text formatting
}
```

### 6. Advanced Settings Panel
```typescript
// src/components/settings/advanced-settings.tsx
interface AdvancedSettings {
  // Model Parameters
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  stopSequences: string[]
  
  // Response Options
  streamResponse: boolean
  showTokenUsage: boolean
  showLatency: boolean
  autoSave: boolean
  
  // Context Management
  contextWindow: number
  memoryType: 'short' | 'long' | 'adaptive'
  includeSystemPrompt: boolean
  
  // Safety & Moderation
  enableSafetyFilters: boolean
  blockSensitiveContent: boolean
  moderationLevel: 'low' | 'medium' | 'high'
  
  // Export & Sharing
  exportFormat: 'markdown' | 'pdf' | 'json'
  shareVisibility: 'private' | 'link' | 'public'
  allowComments: boolean
}
```

## API Endpoints

### Thread Management
```typescript
// Thread CRUD
POST   /api/threads                    // Create thread
GET    /api/threads                    // List threads (with filters)
GET    /api/threads/:id                // Get thread
PUT    /api/threads/:id                // Update thread
DELETE /api/threads/:id                // Soft delete thread
POST   /api/threads/:id/restore        // Restore deleted thread

// Thread Actions
POST   /api/threads/:id/pin            // Pin thread
DELETE /api/threads/:id/pin            // Unpin thread
POST   /api/threads/:id/share          // Share thread
DELETE /api/threads/:id/share          // Unshare thread

// Collaboration
POST   /api/threads/:id/collaborators  // Add collaborator
DELETE /api/threads/:id/collaborators/:userId // Remove collaborator
GET    /api/threads/:id/collaborators  // List collaborators
GET    /api/threads/:id/activity       // Get activity log

// Shared Access
GET    /api/shared/:token               // Access shared thread
POST   /api/shared/:token/join          // Join as collaborator
```

### Prompt & Analysis
```typescript
POST   /api/prompts/analyze            // Analyze prompt
GET    /api/prompts/templates          // Get templates
POST   /api/prompts/templates          // Create template
POST   /api/prompts/generate           // Generate from template
GET    /api/prompts/history            // Get analysis history
```

### Settings & Modes
```typescript
GET    /api/settings/modes             // Get available modes
PUT    /api/settings/modes/:mode       // Update mode settings
GET    /api/settings/advanced          // Get advanced settings
PUT    /api/settings/advanced          // Update advanced settings
```

## UI Components Structure

```
/app/aioptimise/
├── components/
│   ├── chat/
│   │   ├── claude-input.tsx          // Main input component
│   │   ├── message-list.tsx          // Messages display
│   │   ├── message-item.tsx          // Individual message
│   │   ├── typing-indicator.tsx      // Real-time typing
│   │   └── presence-indicator.tsx    // Active users
│   │
│   ├── thread/
│   │   ├── thread-list.tsx           // Left sidebar list
│   │   ├── thread-item.tsx           // Thread list item
│   │   ├── thread-header.tsx         // Thread title/actions
│   │   ├── thread-filters.tsx        // Filter/sort options
│   │   └── thread-search.tsx         // Search threads
│   │
│   ├── modes/
│   │   ├── mode-selector.tsx         // Mode switcher
│   │   ├── focus-mode.tsx            // Focus mode UI
│   │   ├── code-mode.tsx             // Code mode UI
│   │   └── research-mode.tsx         // Research mode UI
│   │
│   ├── analysis/
│   │   ├── prompt-analyzer.tsx       // Prompt analysis UI
│   │   ├── token-counter.tsx         // Token display
│   │   ├── cost-estimator.tsx        // Cost calculation
│   │   └── suggestions.tsx           // Prompt suggestions
│   │
│   └── settings/
│       ├── advanced-panel.tsx        // Advanced settings
│       ├── model-params.tsx          // Model parameters
│       ├── export-options.tsx        // Export settings
│       └── sharing-options.tsx       // Sharing settings
│
├── hooks/
│   ├── useThread.ts                  // Thread operations
│   ├── useCollaboration.ts           // Real-time collab
│   ├── usePromptAnalysis.ts          // Prompt analysis
│   └── useMode.ts                     // Mode management
│
├── services/
│   ├── thread-manager.ts             // Thread service
│   ├── collaboration.ts              // Collab service
│   ├── prompt-analyzer.ts            // Analysis service
│   └── mode-manager.ts               // Mode service
│
└── types/
    ├── thread.types.ts                // Thread types
    ├── collaboration.types.ts         // Collab types
    └── analysis.types.ts              // Analysis types
```

## Testing Checklist

### Functional Testing
- [ ] Thread creation, editing, deletion
- [ ] Pin/unpin functionality
- [ ] Share/unshare with link generation
- [ ] Multi-user collaboration
- [ ] Real-time message sync
- [ ] Prompt analysis accuracy
- [ ] Mode switching
- [ ] Advanced settings persistence
- [ ] File uploads
- [ ] Export functionality

### Performance Testing
- [ ] Large thread handling (1000+ messages)
- [ ] Multiple concurrent users (10+)
- [ ] Real-time sync latency (<100ms)
- [ ] Search performance (<500ms)
- [ ] Mode switching speed (<200ms)

### Security Testing
- [ ] Share token validation
- [ ] Collaborator permissions
- [ ] Rate limiting
- [ ] Input sanitization
- [ ] File upload validation
- [ ] XSS prevention
- [ ] CSRF protection

### Accessibility Testing
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Focus management
- [ ] Color contrast
- [ ] Mobile responsiveness

## Production Deployment Steps

1. **Database Migration**
   - Run schema updates
   - Create indexes
   - Set up backups

2. **Environment Setup**
   - Configure Redis for real-time
   - Set up WebSocket server
   - Configure CDN for attachments

3. **Monitoring**
   - Set up error tracking (Sentry)
   - Configure analytics
   - Set up performance monitoring

4. **Security**
   - Enable rate limiting
   - Configure CORS
   - Set up CSP headers
   - Enable audit logging

5. **Scaling**
   - Configure auto-scaling
   - Set up load balancing
   - Enable database pooling
   - Configure caching layers

## Success Metrics

- Thread creation rate > 100/day
- Average session duration > 10 minutes
- Collaboration usage > 30% of threads
- Mode usage distribution (Focus: 20%, Code: 40%, Research: 20%, Standard: 20%)
- User satisfaction score > 4.5/5
- Response time < 200ms (p95)
- Error rate < 0.1%
- Uptime > 99.9%