import * as Bull from 'bull';
import Redis from 'ioredis';
import { RawProviderData, FetchOptions } from '../../models/unified.model';
import { encrypt, decrypt } from '../../utils/encryption';
import { prisma } from '../../../lib/prisma';

export interface FetcherConfig {
  rateLimit: {
    maxRequests: number;
    windowMs: number;
  };
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
  };
}

export interface RateLimiter {
  checkLimit(): Promise<void>;
  reportUsage(): Promise<void>;
}

export abstract class BaseProviderFetcher {
  protected queue: Bull.Queue;
  protected redis: Redis;
  protected rateLimiter: RateLimiter;
  
  constructor(
    protected provider: string,
    protected config: FetcherConfig
  ) {
    this.queue = new Bull.default(`${provider}-fetch-queue`, {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      }
    });
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
    this.rateLimiter = this.createRateLimiter();
    this.setupQueueProcessor();
  }
  
  abstract fetchUsageData(
    apiKey: string, 
    options: FetchOptions
  ): Promise<RawProviderData>;
  
  abstract validateResponse(data: any): boolean;
  
  abstract getNextFetchTime(): Date;
  
  async scheduleFetch(organizationId: string, apiKey: string) {
    const jobId = `${this.provider}-${organizationId}`;
    
    // Check if job already exists
    const existingJob = await this.queue.getJob(jobId);
    if (existingJob) {
      const state = await existingJob.getState();
      if (['waiting', 'active'].includes(state)) {
        console.log(`Job ${jobId} already scheduled/running`);
        return existingJob;
      }
    }
    
    // Schedule new job
    const delay = this.calculateDelay();
    const encryptedKey = await encrypt(apiKey);
    
    return this.queue.add(
      'fetch-usage',
      {
        organizationId,
        apiKey: encryptedKey,
        provider: this.provider,
        timestamp: new Date()
      },
      {
        jobId,
        delay,
        attempts: this.config.retryPolicy.maxRetries,
        backoff: {
          type: 'exponential',
          delay: 2000 * this.config.retryPolicy.backoffMultiplier
        },
        removeOnComplete: true,
        removeOnFail: false
      }
    );
  }
  
  protected calculateDelay(): number {
    const schedules: Record<string, number> = {
      openai: 24 * 60 * 60 * 1000,    // 24 hours
      anthropic: 5 * 60 * 1000,        // 5 minutes
      google: 60 * 60 * 1000,          // 1 hour
      xai: 60 * 1000                   // 1 minute
    };
    
    return schedules[this.provider] || 60 * 60 * 1000;
  }
  
  protected async setupQueueProcessor() {
    this.queue.process('fetch-usage', async (job) => {
      const { organizationId, apiKey: encryptedKey, timestamp } = job.data;
      
      try {
        // Update fetch status
        await this.updateFetchStatus(organizationId, 'in_progress');
        
        // Decrypt API key
        const apiKey = await decrypt(encryptedKey);
        
        // Fetch data with rate limiting
        await this.rateLimiter.checkLimit();
        const rawData = await this.fetchUsageData(apiKey, { organizationId });
        await this.rateLimiter.reportUsage();
        
        // Validate response
        if (!this.validateResponse(rawData.raw)) {
          throw new Error('Invalid response format');
        }
        
        // Cache raw data
        await this.cacheRawData(organizationId, rawData);
        
        // Update fetch status
        await this.updateFetchStatus(organizationId, 'success', undefined, rawData.fetchedAt);
        
        // Emit event for processing
        await this.emitDataFetched(organizationId, rawData);
        
        // Schedule next fetch
        const nextFetchTime = this.getNextFetchTime();
        const nextDelay = nextFetchTime.getTime() - Date.now();
        await this.scheduleFetch(organizationId, apiKey);
        
        return rawData;
      } catch (error) {
        console.error(`Fetch error for ${this.provider}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await this.updateFetchStatus(organizationId, 'failed', errorMessage);
        throw error;
      }
    });
  }
  
  protected async cacheRawData(organizationId: string, data: RawProviderData) {
    const key = `raw:${this.provider}:${organizationId}:${data.dataDate.toISOString().split('T')[0]}`;
    const ttl = 86400; // 24 hours
    
    await this.redis.setex(key, ttl, JSON.stringify(data));
  }
  
  protected async updateFetchStatus(
    organizationId: string, 
    status: string, 
    errorMessage?: string,
    lastSuccessful?: Date
  ) {
    // TODO: Implement fetch status tracking when the fetchStatus model is added to the schema
    // For now, just log the status
    console.log(`Fetch status for ${this.provider}/${organizationId}: ${status}`, {
      errorMessage,
      lastSuccessful
    });
  }
  
  protected async emitDataFetched(organizationId: string, data: RawProviderData) {
    // Emit to processing queue
    const processingQueue = new Bull.default('data-processing-queue', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      }
    });
    
    await processingQueue.add('process-data', {
      provider: this.provider,
      organizationId,
      data,
      timestamp: new Date()
    });
  }
  
  protected async handleFetchError(error: any, options: FetchOptions) {
    // Log error details
    console.error(`Fetch error for ${this.provider}:`, {
      organizationId: options.organizationId,
      error: error.message,
      stack: error.stack
    });
    
    // Update metrics
    await this.redis.hincrby(`metrics:${this.provider}:errors`, 'count', 1);
  }
  
  protected createRateLimiter(): RateLimiter {
    const { maxRequests, windowMs } = this.config.rateLimit;
    const key = `ratelimit:${this.provider}`;
    
    return {
      checkLimit: async () => {
        const current = await this.redis.incr(key);
        
        if (current === 1) {
          // First request in window, set expiry
          await this.redis.pexpire(key, windowMs);
        }
        
        if (current > maxRequests) {
          const ttl = await this.redis.pttl(key);
          throw new Error(`Rate limit exceeded. Try again in ${ttl}ms`);
        }
      },
      reportUsage: async () => {
        // Report usage metrics
        await this.redis.hincrby(`metrics:${this.provider}:requests`, 'total', 1);
      }
    };
  }
  
  protected async encryptApiKey(apiKey: string): Promise<string> {
    return encrypt(apiKey);
  }
  
  async getCachedData(organizationId: string, date?: Date): Promise<RawProviderData | null> {
    const targetDate = date || new Date();
    const key = `raw:${this.provider}:${organizationId}:${targetDate.toISOString().split('T')[0]}`;
    
    const cached = await this.redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
    
    return null;
  }
}