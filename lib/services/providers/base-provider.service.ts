// services/providers/base-provider.service.ts
// ABSTRACT BASE CLASS - All providers must extend this

import { Provider } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { encryption } from '../encryption.service';
import { io } from '@/lib/services/websocket.service';

export interface TestResult {
  success: boolean;
  message: string;
  metadata?: any;
  error?: any;
}

export interface UsageData {
  totalTokens: number;
  totalCost: number;
  breakdown: any;
}

export interface CostBreakdown {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  currency: string;
}

export interface UsageMetrics {
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface ModelConfig {
  id: string;
  name: string;
  pricing: {
    input: number;
    output: number;
  };
}

export abstract class BaseProviderService {
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
        model: usage.model,
        operation: 'completion',
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
        cost,
        timestamp: new Date(),
      },
    });
    
    // Trigger real-time update
    await this.broadcastUsageUpdate(userId, usage);
    
    // Check alerts
    await this.checkAlerts(userId, cost);
  }
  
  protected async validateApiKey(encryptedKey: string, iv: string, tag: string): Promise<boolean> {
    try {
      const decrypted = await encryption.decryptApiKey({ encryptedKey, iv, tag });
      const result = await this.testConnection(decrypted);
      return result.success;
    } catch (error) {
      console.error('API key validation failed:', error);
      return false;
    }
  }
  
  private async broadcastUsageUpdate(userId: string, usage: UsageMetrics) {
    // WebSocket broadcast implementation
    if (io) {
      io.to(`user:${userId}`).emit('usage:update', usage);
    }
  }
  
  private async checkAlerts(userId: string, cost: number) {
    const alerts = await prisma.alert.findMany({
      where: { 
        userId, 
        isActive: true, 
        type: 'COST_THRESHOLD' 
      },
    });
    
    for (const alert of alerts) {
      if (this.shouldTriggerAlert(alert, cost)) {
        await this.triggerAlert(alert);
      }
    }
  }
  
  private shouldTriggerAlert(alert: any, cost: number): boolean {
    const threshold = Number(alert.threshold);
    
    switch (alert.comparisonType) {
      case 'GREATER_THAN':
        return cost > threshold;
      case 'GREATER_THAN_OR_EQUAL':
        return cost >= threshold;
      case 'LESS_THAN':
        return cost < threshold;
      case 'LESS_THAN_OR_EQUAL':
        return cost <= threshold;
      case 'EQUAL':
        return cost === threshold;
      case 'NOT_EQUAL':
        return cost !== threshold;
      default:
        return false;
    }
  }
  
  private async triggerAlert(alert: any) {
    // Update last triggered
    await prisma.alert.update({
      where: { id: alert.id },
      data: { lastTriggered: new Date() },
    });
    
    // Create alert notification
    await prisma.alertNotification.create({
      data: {
        alertId: alert.id,
        channel: 'email',
        status: 'pending',
        createdAt: new Date(),
      },
    });
    
    // Broadcast alert
    if (io) {
      io.to(`user:${alert.userId}`).emit('alert:triggered', alert);
    }
  }
  
  // Helper method to get decrypted API key
  protected async getDecryptedApiKey(userId: string): Promise<string | null> {
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        userId,
        provider: this.provider,
        isActive: true,
      },
    });
    
    if (!apiKey) {
      return null;
    }
    
    return encryption.decrypt(apiKey.encryptedKey, apiKey.iv, apiKey.tag);
  }
}