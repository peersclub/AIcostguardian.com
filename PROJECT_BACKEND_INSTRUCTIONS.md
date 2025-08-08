# AI Cost Guardian - Backend Implementation Guide

## 🎯 Core Backend Architecture Requirements

### 1. Database Schema & Models

```prisma
// COMPLETE SCHEMA - Must be implemented exactly as shown
model User {
  id                String    @id @default(cuid())
  email            String    @unique
  name             String?
  image            String?
  emailVerified    DateTime?
  company          String?
  role             UserRole  @default(USER)
  onboardingStatus Json?     @default("{}")
  settings         Json?     @default("{}")
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  
  // Relations
  accounts         Account[]
  sessions         Session[]
  organization     Organization?  @relation(fields: [organizationId], references: [id])
  organizationId   String?
  apiKeys          ApiKey[]
  usageLogs        UsageLog[]
  alerts           Alert[]
  teamMembers      TeamMember[]
  activities       ActivityLog[]
  subscriptions    Subscription[]
}

model Organization {
  id               String    @id @default(cuid())
  name             String
  domain           String?   @unique
  plan             Plan      @default(FREE)
  billingEmail     String?
  stripeCustomerId String?   @unique
  settings         Json?     @default("{}")
  metadata         Json?     @default("{}")
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  
  // Relations
  users            User[]
  apiKeys          ApiKey[]
  usageLogs        UsageLog[]
  invoices         Invoice[]
  subscriptions    Subscription[]
  teamMembers      TeamMember[]
  budgets          Budget[]
}

model ApiKey {
  id               String    @id @default(cuid())
  provider         Provider
  encryptedKey     String    @db.Text
  iv               String    // Initialization vector for encryption
  tag              String    // Auth tag for GCM
  label            String?
  isActive         Boolean   @default(true)
  lastUsed         DateTime?
  lastValidated    DateTime?
  metadata         Json?     @default("{}")
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  
  // Relations
  user             User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId           String
  organization     Organization? @relation(fields: [organizationId], references: [id])
  organizationId   String?
  usageLogs        UsageLog[]
  
  @@unique([userId, provider])
  @@index([provider, isActive])
}

model UsageLog {
  id               String    @id @default(cuid())
  provider         Provider
  model            String
  operation        String    // completion, embedding, image, audio, etc.
  inputTokens      Int       @default(0)
  outputTokens     Int       @default(0)
  totalTokens      Int       @default(0)
  cost             Decimal   @db.Decimal(10, 6)
  responseTime     Int?      // in milliseconds
  statusCode       Int?
  error            String?
  metadata         Json?     @default("{}")
  timestamp        DateTime  @default(now())
  
  // Relations
  user             User      @relation(fields: [userId], references: [id])
  userId           String
  organization     Organization? @relation(fields: [organizationId], references: [id])
  organizationId   String?
  apiKey           ApiKey?   @relation(fields: [apiKeyId], references: [id])
  apiKeyId         String?
  
  @@index([userId, provider, timestamp])
  @@index([organizationId, timestamp])
}

model Alert {
  id               String    @id @default(cuid())
  name             String
  type             AlertType
  threshold        Decimal   @db.Decimal(10, 2)
  comparisonType   ComparisonType
  frequency        AlertFrequency
  isActive         Boolean   @default(true)
  lastTriggered    DateTime?
  notifyEmail      Boolean   @default(true)
  notifySlack      Boolean   @default(false)
  notifyWebhook    Boolean   @default(false)
  webhookUrl       String?
  metadata         Json?     @default("{}")
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  
  // Relations
  user             User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId           String
  notifications    AlertNotification[]
  
  @@index([userId, isActive])
}

// Enums
enum Provider {
  OPENAI
  ANTHROPIC
  GOOGLE
  XAI
  PERPLEXITY
  CUSTOM
}

enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
}

enum Plan {
  FREE
  STARTER
  GROWTH
  SCALE
  ENTERPRISE
}

enum AlertType {
  COST_THRESHOLD
  USAGE_SPIKE
  RATE_LIMIT
  ERROR_RATE
  BUDGET_EXCEEDED
}
```

### 2. API Route Structure & Implementation

```typescript
// STANDARD API ROUTE TEMPLATE
// Every API route MUST follow this structure

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { ApiError, handleApiError } from '@/lib/errors';

// 1. Define request/response schemas
const RequestSchema = z.object({
  // Define all expected fields
});

const ResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  metadata: z.object({
    timestamp: z.string(),
    requestId: z.string(),
  }),
});

// 2. Main handler function
export async function GET/POST/PUT/DELETE(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  
  try {
    // Step 1: Rate limiting
    const rateLimitResult = await rateLimit(req);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      );
    }
    
    // Step 2: Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new ApiError('Unauthorized', 401);
    }
    
    // Step 3: Parse and validate request
    const body = await req.json();
    const validatedData = RequestSchema.parse(body);
    
    // Step 4: Authorization (check permissions)
    const hasPermission = await checkPermission(session.user.id, 'resource:action');
    if (!hasPermission) {
      throw new ApiError('Forbidden', 403);
    }
    
    // Step 5: Business logic
    const result = await performBusinessLogic(validatedData, session.user);
    
    // Step 6: Audit logging
    await logActivity({
      userId: session.user.id,
      action: 'RESOURCE_ACTION',
      metadata: { requestId, ...validatedData },
    });
    
    // Step 7: Format and return response
    const response = ResponseSchema.parse({
      success: true,
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId,
        responseTime: Date.now() - startTime,
      },
    });
    
    return NextResponse.json(response);
    
  } catch (error) {
    // Comprehensive error handling
    logger.error('API Error', { error, requestId, route: req.url });
    return handleApiError(error, requestId);
  }
}
```

### 3. Service Layer Implementation

```typescript
// services/providers/base-provider.service.ts
// ABSTRACT BASE CLASS - All providers must extend this

abstract class BaseProviderService {
  protected abstract provider: Provider;
  protected abstract baseUrl: string;
  protected abstract models: ModelConfig[];
  
  // Required implementations
  abstract testConnection(apiKey: string): Promise<TestResult>;
  abstract getUsage(apiKey: string, startDate: Date, endDate: Date): Promise<UsageData>;
  abstract calculateCost(usage: UsageData): Promise<CostBreakdown>;
  abstract makeRequest(apiKey: string, payload: any): Promise<any>;
  
  // Shared implementations
  protected async trackUsage(
    userId: string,
    usage: UsageMetrics,
    cost: number
  ): Promise<void> {
    await prisma.usageLog.create({
      data: {
        userId,
        provider: this.provider,
        ...usage,
        cost,
        timestamp: new Date(),
      },
    });
    
    // Trigger real-time update
    await this.broadcastUsageUpdate(userId, usage);
    
    // Check alerts
    await this.checkAlerts(userId, cost);
  }
  
  protected async validateApiKey(encryptedKey: string): Promise<boolean> {
    const decrypted = await decrypt(encryptedKey);
    return this.testConnection(decrypted);
  }
  
  private async broadcastUsageUpdate(userId: string, usage: UsageMetrics) {
    // WebSocket broadcast implementation
    io.to(`user:${userId}`).emit('usage:update', usage);
  }
  
  private async checkAlerts(userId: string, cost: number) {
    const alerts = await prisma.alert.findMany({
      where: { userId, isActive: true, type: 'COST_THRESHOLD' },
    });
    
    for (const alert of alerts) {
      if (this.shouldTriggerAlert(alert, cost)) {
        await this.triggerAlert(alert);
      }
    }
  }
}
```

### 4. Provider-Specific Implementations

```typescript
// services/providers/openai.service.ts
// COMPLETE OPENAI IMPLEMENTATION

import OpenAI from 'openai';
import { BaseProviderService } from './base-provider.service';

export class OpenAIService extends BaseProviderService {
  protected provider = Provider.OPENAI;
  protected baseUrl = 'https://api.openai.com/v1';
  protected models = OPENAI_MODELS; // Import from config
  
  async testConnection(apiKey: string): Promise<TestResult> {
    try {
      const client = new OpenAI({ apiKey });
      const models = await client.models.list();
      
      return {
        success: true,
        message: 'Connection successful',
        metadata: {
          modelsAvailable: models.data.length,
          organization: client.organization,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }
  
  async getUsage(apiKey: string, startDate: Date, endDate: Date): Promise<UsageData> {
    const client = new OpenAI({ apiKey });
    
    // Fetch from OpenAI's usage endpoint
    const response = await fetch(`${this.baseUrl}/usage`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      params: {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      },
    });
    
    const data = await response.json();
    
    // Transform to our standard format
    return {
      totalTokens: data.total_tokens,
      totalCost: this.calculateCostFromTokens(data),
      breakdown: this.transformUsageBreakdown(data),
    };
  }
  
  async makeRequest(apiKey: string, payload: ChatCompletionRequest): Promise<any> {
    const startTime = Date.now();
    const client = new OpenAI({ apiKey });
    
    try {
      const completion = await client.chat.completions.create(payload);
      
      // Track usage
      await this.trackUsage(
        payload.userId,
        {
          model: payload.model,
          inputTokens: completion.usage.prompt_tokens,
          outputTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens,
        },
        this.calculateCost(completion.usage, payload.model)
      );
      
      return completion;
      
    } catch (error) {
      // Log error
      await this.logError(payload.userId, error);
      throw error;
    }
  }
  
  private calculateCost(usage: any, model: string): number {
    const pricing = this.models.find(m => m.id === model)?.pricing;
    if (!pricing) return 0;
    
    const inputCost = (usage.prompt_tokens / 1000) * pricing.input;
    const outputCost = (usage.completion_tokens / 1000) * pricing.output;
    
    return inputCost + outputCost;
  }
}
```

### 5. Encryption Service

```typescript
// services/encryption.service.ts
// CRITICAL: Must be implemented exactly as shown

import crypto from 'crypto';

class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private keyLength = 32;
  
  constructor(private encryptionKey: string) {
    if (!encryptionKey || encryptionKey.length !== 64) {
      throw new Error('Encryption key must be 32 bytes (64 hex characters)');
    }
  }
  
  encrypt(text: string): EncryptedData {
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(this.encryptionKey, 'hex');
    
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encryptedData: encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    };
  }
  
  decrypt(encryptedData: string, iv: string, tag: string): string {
    const key = Buffer.from(this.encryptionKey, 'hex');
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      key,
      Buffer.from(iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  // Helper for API keys
  async encryptApiKey(apiKey: string): Promise<StoredApiKey> {
    const { encryptedData, iv, tag } = this.encrypt(apiKey);
    
    return {
      encryptedKey: encryptedData,
      iv,
      tag,
    };
  }
  
  async decryptApiKey(stored: StoredApiKey): Promise<string> {
    return this.decrypt(stored.encryptedKey, stored.iv, stored.tag);
  }
}

export const encryption = new EncryptionService(process.env.ENCRYPTION_KEY!);
```

### 6. Real-time WebSocket Implementation

```typescript
// services/websocket.service.ts
// Real-time updates for usage and costs

import { Server as HTTPServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { getSession } from 'next-auth/react';

export class WebSocketService {
  private io: SocketServer;
  
  initialize(server: HTTPServer) {
    this.io = new SocketServer(server, {
      cors: {
        origin: process.env.NEXTAUTH_URL,
        credentials: true,
      },
    });
    
    // Authentication middleware
    this.io.use(async (socket, next) => {
      const session = await getSession({ req: socket.request });
      
      if (!session?.user) {
        return next(new Error('Unauthorized'));
      }
      
      socket.data.userId = session.user.id;
      socket.data.organizationId = session.user.organizationId;
      
      next();
    });
    
    // Connection handler
    this.io.on('connection', (socket) => {
      // Join user room
      socket.join(`user:${socket.data.userId}`);
      
      // Join organization room if applicable
      if (socket.data.organizationId) {
        socket.join(`org:${socket.data.organizationId}`);
      }
      
      // Handle events
      socket.on('subscribe:usage', () => this.subscribeToUsage(socket));
      socket.on('subscribe:alerts', () => this.subscribeToAlerts(socket));
      socket.on('subscribe:team', () => this.subscribeToTeam(socket));
    });
  }
  
  // Broadcast methods
  broadcastUsageUpdate(userId: string, data: UsageUpdate) {
    this.io.to(`user:${userId}`).emit('usage:update', data);
  }
  
  broadcastCostAlert(userId: string, alert: Alert) {
    this.io.to(`user:${userId}`).emit('alert:triggered', alert);
  }
  
  broadcastTeamUpdate(organizationId: string, update: TeamUpdate) {
    this.io.to(`org:${organizationId}`).emit('team:update', update);
  }
}
```

### 7. Queue & Background Jobs

```typescript
// services/queue.service.ts
// Background job processing with BullMQ

import { Queue, Worker, QueueScheduler } from 'bullmq';
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

// Define queues
export const usageQueue = new Queue('usage-processing', { connection: redis });
export const alertQueue = new Queue('alert-checking', { connection: redis });
export const emailQueue = new Queue('email-sending', { connection: redis });
export const reportQueue = new Queue('report-generation', { connection: redis });

// Usage processing worker
const usageWorker = new Worker(
  'usage-processing',
  async (job) => {
    const { userId, provider, startDate, endDate } = job.data;
    
    // Fetch usage from provider
    const service = getProviderService(provider);
    const apiKey = await getDecryptedApiKey(userId, provider);
    const usage = await service.getUsage(apiKey, startDate, endDate);
    
    // Store in database
    await prisma.usageLog.createMany({
      data: usage.map(u => ({
        userId,
        provider,
        ...u,
      })),
    });
    
    // Check alerts
    await alertQueue.add('check-alerts', { userId, usage });
    
    // Broadcast update
    websocket.broadcastUsageUpdate(userId, usage);
  },
  { connection: redis }
);

// Alert checking worker
const alertWorker = new Worker(
  'alert-checking',
  async (job) => {
    const { userId, usage } = job.data;
    
    const alerts = await prisma.alert.findMany({
      where: { userId, isActive: true },
    });
    
    for (const alert of alerts) {
      if (shouldTriggerAlert(alert, usage)) {
        // Send notifications
        if (alert.notifyEmail) {
          await emailQueue.add('send-alert', { alert, usage });
        }
        
        if (alert.notifySlack) {
          await sendSlackNotification(alert, usage);
        }
        
        if (alert.notifyWebhook) {
          await sendWebhookNotification(alert, usage);
        }
        
        // Update alert
        await prisma.alert.update({
          where: { id: alert.id },
          data: { lastTriggered: new Date() },
        });
      }
    }
  },
  { connection: redis }
);

// Schedule recurring jobs
export function initializeScheduledJobs() {
  // Daily usage sync for all users
  usageQueue.add(
    'daily-sync',
    {},
    {
      repeat: {
        pattern: '0 0 * * *', // Midnight every day
      },
    }
  );
  
  // Hourly alert checks
  alertQueue.add(
    'hourly-check',
    {},
    {
      repeat: {
        pattern: '0 * * * *', // Every hour
      },
    }
  );
  
  // Weekly reports
  reportQueue.add(
    'weekly-report',
    {},
    {
      repeat: {
        pattern: '0 0 * * MON', // Monday midnight
      },
    }
  );
}
```

### 8. Email Service

```typescript
// services/email.service.ts
// Complete email implementation

import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import * as templates from '@/emails';

class EmailService {
  private transporter: nodemailer.Transporter;
  
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT!),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  
  async sendWelcomeEmail(user: User) {
    const html = render(templates.WelcomeEmail({ user }));
    
    await this.send({
      to: user.email,
      subject: 'Welcome to AI Cost Guardian',
      html,
    });
  }
  
  async sendAlertEmail(alert: Alert, trigger: TriggerData) {
    const html = render(templates.AlertEmail({ alert, trigger }));
    
    await this.send({
      to: alert.user.email,
      subject: `Alert: ${alert.name} triggered`,
      html,
      priority: 'high',
    });
  }
  
  async sendUsageReport(user: User, report: UsageReport) {
    const html = render(templates.UsageReportEmail({ user, report }));
    const pdf = await generatePdfReport(report);
    
    await this.send({
      to: user.email,
      subject: `Your AI Usage Report - ${report.period}`,
      html,
      attachments: [
        {
          filename: `usage-report-${report.period}.pdf`,
          content: pdf,
        },
      ],
    });
  }
  
  async sendInvoice(invoice: Invoice) {
    const html = render(templates.InvoiceEmail({ invoice }));
    const pdf = await generateInvoicePdf(invoice);
    
    await this.send({
      to: invoice.billingEmail,
      subject: `Invoice #${invoice.number}`,
      html,
      attachments: [
        {
          filename: `invoice-${invoice.number}.pdf`,
          content: pdf,
        },
      ],
    });
  }
  
  private async send(options: EmailOptions) {
    try {
      const result = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        ...options,
      });
      
      // Log email sent
      await prisma.emailLog.create({
        data: {
          to: options.to,
          subject: options.subject,
          status: 'SENT',
          messageId: result.messageId,
        },
      });
      
      return result;
    } catch (error) {
      // Log email error
      await prisma.emailLog.create({
        data: {
          to: options.to,
          subject: options.subject,
          status: 'FAILED',
          error: error.message,
        },
      });
      
      throw error;
    }
  }
}

export const emailService = new EmailService();
```

### 9. Cache Strategy

```typescript
// services/cache.service.ts
// Redis caching implementation

import { Redis } from 'ioredis';

class CacheService {
  private redis: Redis;
  private defaultTTL = 300; // 5 minutes
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!);
  }
  
  // Key patterns
  private keys = {
    userUsage: (userId: string) => `usage:${userId}`,
    organizationUsage: (orgId: string) => `org-usage:${orgId}`,
    providerStatus: (provider: string) => `provider:${provider}:status`,
    pricing: (provider: string) => `pricing:${provider}`,
    userDashboard: (userId: string) => `dashboard:${userId}`,
  };
  
  async getUserUsage(userId: string): Promise<UsageData | null> {
    const cached = await this.redis.get(this.keys.userUsage(userId));
    return cached ? JSON.parse(cached) : null;
  }
  
  async setUserUsage(userId: string, data: UsageData, ttl = this.defaultTTL) {
    await this.redis.setex(
      this.keys.userUsage(userId),
      ttl,
      JSON.stringify(data)
    );
  }
  
  async invalidateUserCache(userId: string) {
    const pattern = `*:${userId}*`;
    const keys = await this.redis.keys(pattern);
    
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
  
  // Cache aside pattern
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl = this.defaultTTL
  ): Promise<T> {
    const cached = await this.redis.get(key);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const data = await fetcher();
    await this.redis.setex(key, ttl, JSON.stringify(data));
    
    return data;
  }
  
  // Cache invalidation on write
  async invalidatePattern(pattern: string) {
    const keys = await this.redis.keys(pattern);
    
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

export const cache = new CacheService();
```

### 10. Error Handling & Logging

```typescript
// lib/errors.ts
// Comprehensive error handling

export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'AUTH_ERROR');
  }
}

export class AuthorizationError extends ApiError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'AUTHZ_ERROR');
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class RateLimitError extends ApiError {
  constructor(retryAfter: number) {
    super('Rate limit exceeded', 429, 'RATE_LIMIT', { retryAfter });
  }
}

export async function handleApiError(error: any, requestId: string) {
  // Log to monitoring service
  await logger.error('API Error', {
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
    },
    requestId,
  });
  
  // Determine response
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        requestId,
      },
      { status: error.statusCode }
    );
  }
  
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors,
        requestId,
      },
      { status: 400 }
    );
  }
  
  // Generic error
  return NextResponse.json(
    {
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      requestId,
    },
    { status: 500 }
  );
}
```

### 11. Testing Requirements

```typescript
// __tests__/api/example.test.ts
// Test template for all API routes

import { createMocks } from 'node-mocks-http';
import { prismaMock } from '@/tests/prisma-mock';
import handler from '@/app/api/route/route';

describe('API Route: /api/route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Authentication', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });
      
      await handler(req, res);
      
      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: 'Unauthorized',
      });
    });
  });
  
  describe('Validation', () => {
    it('should validate request body', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: { invalid: 'data' },
      });
      
      await handler(req, res);
      
      expect(res._getStatusCode()).toBe(400);
    });
  });
  
  describe('Business Logic', () => {
    it('should perform expected operation', async () => {
      prismaMock.model.findMany.mockResolvedValue([]);
      
      const { req, res } = createMocks({
        method: 'GET',
        headers: { authorization: 'Bearer valid-token' },
      });
      
      await handler(req, res);
      
      expect(res._getStatusCode()).toBe(200);
      expect(prismaMock.model.findMany).toHaveBeenCalled();
    });
  });
  
  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      prismaMock.model.findMany.mockRejectedValue(new Error('DB Error'));
      
      const { req, res } = createMocks({
        method: 'GET',
      });
      
      await handler(req, res);
      
      expect(res._getStatusCode()).toBe(500);
    });
  });
});
```

## Critical Implementation Checklist

### Before Starting ANY Feature:
- [ ] Database schema defined and migrated
- [ ] Environment variables configured
- [ ] Redis connection established
- [ ] Email service tested
- [ ] Error tracking connected (Sentry)

### For EVERY API Route:
- [ ] Authentication implemented
- [ ] Authorization checked
- [ ] Input validation with Zod
- [ ] Rate limiting active
- [ ] Error handling complete
- [ ] Audit logging enabled
- [ ] Cache strategy defined
- [ ] Tests written (min 80% coverage)

### For EVERY Service:
- [ ] Extends BaseService class
- [ ] Implements required interfaces
- [ ] Has error recovery
- [ ] Includes retry logic
- [ ] Logs all operations
- [ ] Updates cache appropriately
- [ ] Broadcasts real-time updates
- [ ] Has integration tests

### Security Checklist:
- [ ] API keys encrypted with AES-256-GCM
- [ ] All inputs sanitized
- [ ] SQL injection prevented (Prisma)
- [ ] Rate limiting per user/IP
- [ ] CORS configured correctly
- [ ] Sessions secure (httpOnly, secure, sameSite)
- [ ] Audit logs for all sensitive operations

### Performance Requirements:
- [ ] Database queries < 100ms
- [ ] API responses < 500ms
- [ ] Cache hit ratio > 80%
- [ ] Real-time updates < 1s
- [ ] Background jobs queued
- [ ] Pagination implemented
- [ ] N+1 queries eliminated

## DO NOT PROCEED WITHOUT:
1. Real database connection (no mock data)
2. Encryption key configured
3. Email service operational
4. Redis cache running
5. All environment variables set
6. Error tracking active
7. Monitoring dashboard accessible

This guide ensures complete backend implementation with no shortcuts or mock data. Every feature must be production-ready from the start.