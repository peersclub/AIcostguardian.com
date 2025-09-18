# Collaborative Thread Context System - Database Schema Enhancement

## 🎯 Overview

Transform AIThreads into persistent, collaborative AI projects with rich context management, editable instructions, and seamless team collaboration.

## 📊 New Models

### 1. ThreadContext (Project Configuration)
```prisma
model ThreadContext {
  id                String    @id @default(cuid())
  threadId          String    @unique

  // Core Project Settings
  projectName       String?   // Optional project name (can differ from thread title)
  projectType       ProjectType @default(GENERAL)
  systemPrompt      String?   @db.Text // Editable system prompt
  instructions      String?   @db.Text // Project instructions/guidelines

  // AI Behavior Configuration
  defaultModel      String?   @default("gpt-4o-mini")
  defaultProvider   String?   @default("openai")
  temperature       Float?    @default(0.7)
  maxTokens         Int?      @default(4000)
  topP              Float?    @default(1.0)

  // Context Management
  contextWindow     Int?      @default(8000)
  memoryEnabled     Boolean   @default(true)
  memorySize        Int?      @default(50) // Number of messages to remember

  // Collaboration Settings
  allowEditing      Boolean   @default(true)  // Can collaborators edit context?
  requireApproval   Boolean   @default(false) // Require approval for context changes?

  // Project Metadata
  category          String?   // e.g., "Development", "Research", "Content"
  keywords          String[]  @default([])
  projectGoals      String?   @db.Text
  expectedOutcome   String?   @db.Text

  // Versioning
  version           Int       @default(1)
  lastEditedBy      String?
  lastEditedAt      DateTime?

  // Template Support
  isTemplate        Boolean   @default(false)
  templateName      String?
  templateCategory  String?
  usageCount        Int       @default(0) // If template, track usage

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  thread            AIThread  @relation(fields: [threadId], references: [id], onDelete: Cascade)
  lastEditor        User?     @relation(fields: [lastEditedBy], references: [id])
  revisions         ThreadContextRevision[]

  @@index([threadId])
  @@index([projectType])
  @@index([isTemplate, templateCategory])
}
```

### 2. ThreadContextRevision (Version Control)
```prisma
model ThreadContextRevision {
  id                String    @id @default(cuid())
  contextId         String
  version           Int

  // What changed
  changedBy         String
  changeType        ChangeType
  changeDescription String?

  // Snapshot of changes
  previousData      Json      // Previous state
  newData           Json      // New state
  diffSummary       String?   // Human-readable summary

  // Approval workflow
  status            RevisionStatus @default(PENDING)
  approvedBy        String?
  approvedAt        DateTime?
  rejectedReason    String?

  createdAt         DateTime  @default(now())

  context           ThreadContext @relation(fields: [contextId], references: [id], onDelete: Cascade)
  editor            User         @relation(fields: [changedBy], references: [id])
  approver          User?        @relation("ApprovedRevisions", fields: [approvedBy], references: [id])

  @@unique([contextId, version])
  @@index([contextId])
  @@index([changedBy])
}
```

### 3. ProjectTemplate (Reusable Templates)
```prisma
model ProjectTemplate {
  id                String    @id @default(cuid())
  name              String
  description       String?   @db.Text
  category          String

  // Template Configuration
  systemPrompt      String?   @db.Text
  instructions      String?   @db.Text
  defaultModel      String?
  defaultProvider   String?
  temperature       Float?
  maxTokens         Int?

  // Template Metadata
  tags              String[]  @default([])
  isPublic          Boolean   @default(false)
  isOfficial        Boolean   @default(false) // Official company templates

  // Usage Tracking
  usageCount        Int       @default(0)
  rating            Float?    // User ratings
  ratingCount       Int       @default(0)

  // Template Structure
  sampleMessages    Json?     // Example conversation starters
  requiredVars      Json?     // Variables that need to be filled

  createdBy         String
  organizationId    String?   // Organization-specific templates

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  creator           User         @relation(fields: [createdBy], references: [id])
  organization      Organization? @relation(fields: [organizationId], references: [id])

  @@index([category])
  @@index([isPublic, isOfficial])
  @@index([organizationId])
  @@index([usageCount])
}
```

### 4. ThreadOnboarding (Context Sharing)
```prisma
model ThreadOnboarding {
  id                String    @id @default(cuid())
  threadId          String
  newUserId         String
  invitedBy         String

  // Onboarding Content
  contextSummary    String?   @db.Text  // AI-generated context summary
  keyInstructions   String[]  @default([]) // Important points to know
  recentHighlights  Json?     // Important recent messages/decisions

  // Onboarding Status
  status            OnboardingStatus @default(PENDING)
  completedAt       DateTime?
  viewedInstructions Boolean  @default(false)
  acknowledgedContext Boolean @default(false)

  // Custom Welcome
  welcomeMessage    String?   @db.Text

  createdAt         DateTime  @default(now())

  thread            AIThread  @relation(fields: [threadId], references: [id], onDelete: Cascade)
  newUser           User      @relation(fields: [newUserId], references: [id])
  inviter           User      @relation("ThreadInvitations", fields: [invitedBy], references: [id])

  @@unique([threadId, newUserId])
  @@index([threadId])
  @@index([newUserId])
}
```

### 5. ThreadKnowledgeBase (Accumulated Knowledge)
```prisma
model ThreadKnowledgeBase {
  id                String    @id @default(cuid())
  threadId          String

  // Knowledge Entries
  title             String
  content           String    @db.Text
  type              KnowledgeType @default(INSIGHT)

  // Source Information
  sourceMessageId   String?   // Message that generated this knowledge
  extractedBy       String?   // User who added/AI that extracted

  // Organization
  category          String?
  tags              String[]  @default([])
  importance        ImportanceLevel @default(MEDIUM)

  // Collaboration
  votes             Int       @default(0) // Community voting
  isValidated       Boolean   @default(false)
  validatedBy       String?

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  thread            AIThread  @relation(fields: [threadId], references: [id], onDelete: Cascade)
  sourceMessage     AIMessage? @relation(fields: [sourceMessageId], references: [id])
  extractor         User?     @relation(fields: [extractedBy], references: [id])
  validator         User?     @relation("ValidatedKnowledge", fields: [validatedBy], references: [id])

  @@index([threadId])
  @@index([type, importance])
  @@index([category])
}
```

## 🔧 Enhanced Existing Models

### AIThread Enhancement
```prisma
// Add to existing AIThread model:
model AIThread {
  // ... existing fields ...

  // Project Enhancement
  projectStatus     ProjectStatus @default(ACTIVE)
  projectDeadline   DateTime?
  projectBudget     Float?       // Budget allocation for AI costs
  budgetSpent       Float        @default(0)

  // Advanced Sharing
  publicShareEnabled Boolean     @default(false)
  publicShareConfig Json?        // Public sharing configuration

  // Knowledge Management
  knowledgeExtraction Boolean    @default(true) // Auto-extract insights
  autoSummarize     Boolean      @default(false) // Auto-generate summaries

  // New Relations
  context           ThreadContext?
  onboardings       ThreadOnboarding[]
  knowledgeBase     ThreadKnowledgeBase[]
  usedTemplate      ProjectTemplate? @relation(fields: [templateId], references: [id])
  templateId        String?
}
```

### User Model Enhancement
```prisma
// Add to existing User model:
model User {
  // ... existing fields ...

  // New Relations for Collaboration
  editedContexts       ThreadContext[]
  contextRevisions     ThreadContextRevision[]
  approvedRevisions    ThreadContextRevision[] @relation("ApprovedRevisions")
  createdTemplates     ProjectTemplate[]
  threadInvitations    ThreadOnboarding[] @relation("ThreadInvitations")
  extractedKnowledge   ThreadKnowledgeBase[]
  validatedKnowledge   ThreadKnowledgeBase[] @relation("ValidatedKnowledge")
  onboardings          ThreadOnboarding[]
}
```

## 📝 New Enums

```prisma
enum ProjectType {
  GENERAL          // General conversation
  DEVELOPMENT      // Software development
  RESEARCH         // Research project
  CONTENT_CREATION // Content/writing
  ANALYSIS         // Data analysis
  BRAINSTORMING    // Ideation session
  SUPPORT          // Customer support
  TRAINING         // Training/education
  CUSTOM           // Custom project type
}

enum ChangeType {
  SYSTEM_PROMPT    // System prompt modification
  INSTRUCTIONS     // Instructions change
  MODEL_CONFIG     // AI model settings
  COLLABORATION    // Collaboration settings
  METADATA         // Project metadata
  TEMPLATE_UPDATE  // Template modification
}

enum RevisionStatus {
  PENDING          // Awaiting approval
  APPROVED         // Change approved
  REJECTED         // Change rejected
  AUTO_APPROVED    // Automatically approved
}

enum OnboardingStatus {
  PENDING          // Not started
  IN_PROGRESS      // User viewing content
  COMPLETED        // Onboarding finished
  SKIPPED          // User skipped onboarding
}

enum KnowledgeType {
  INSIGHT          // Key insight or learning
  DECISION         // Important decision made
  REFERENCE        // Reference material
  TEMPLATE         // Reusable template/pattern
  WARNING          // Important warning/caveat
  BEST_PRACTICE    // Best practice identified
}

enum ImportanceLevel {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum ProjectStatus {
  ACTIVE           // Currently active
  PAUSED           // Temporarily paused
  COMPLETED        // Project completed
  ARCHIVED         // Archived for reference
  TEMPLATE         // Used as template
}
```

## 🔄 Migration Strategy

1. **Phase 1**: Add new models without breaking existing functionality
2. **Phase 2**: Migrate existing AIThreads to include ThreadContext
3. **Phase 3**: Enable collaborative editing features
4. **Phase 4**: Add template system and knowledge base

## 🎯 Key Benefits

1. **Persistent Context**: Projects maintain context across sessions
2. **Collaborative Editing**: Team members can edit instructions together
3. **Knowledge Accumulation**: Important insights are preserved
4. **Template System**: Reusable project configurations
5. **Smart Onboarding**: New collaborators get proper context
6. **Version Control**: Track all context changes
7. **Organization**: Projects can be categorized and managed