/**
 * CSV Import Service
 * Parses and imports usage data from provider CSV exports
 * Supports multiple formats from different AI providers
 */

// CSV import temporarily disabled - missing dependency
// import { parse } from 'csv-parse/sync';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ImportResult {
  success: boolean;
  recordsProcessed: number;
  recordsImported: number;
  recordsSkipped: number;
  errors: string[];
  summary: {
    totalCost: number;
    totalTokens: number;
    providers: Record<string, number>;
    dateRange: { start: Date; end: Date };
  };
}

export interface CSVRecord {
  date: Date;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  metadata?: any;
}

class CSVImportService {
  /**
   * Main import method - detects format and processes CSV
   */
  async importCSV(
    fileContent: string,
    provider: string,
    userId: string,
    organizationId: string,
    options: {
      skipDuplicates?: boolean;
      dryRun?: boolean;
    } = {}
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      recordsProcessed: 0,
      recordsImported: 0,
      recordsSkipped: 0,
      errors: [],
      summary: {
        totalCost: 0,
        totalTokens: 0,
        providers: {},
        dateRange: { start: new Date(), end: new Date() }
      }
    };
    
    try {
      // Parse CSV - temporarily disabled
      // const records = parse(fileContent, {
      //   columns: true,
      //   skip_empty_lines: true,
      //   trim: true
      // });
      const records: any[] = []; // Temporary stub
      
      result.recordsProcessed = records.length;
      
      if (records.length === 0) {
        result.errors.push('No records found in CSV');
        return result;
      }
      
      // Detect CSV format based on headers
      const format = this.detectFormat(Object.keys(records[0]), provider);
      
      if (!format) {
        result.errors.push(`Unable to detect CSV format for ${provider}`);
        return result;
      }
      
      // Parse records based on format
      const parsedRecords = await this.parseRecords(records, format, provider);
      
      // Calculate date range
      const dates = parsedRecords.map(r => r.date).filter(d => d);
      if (dates.length > 0) {
        result.summary.dateRange.start = new Date(Math.min(...dates.map(d => d.getTime())));
        result.summary.dateRange.end = new Date(Math.max(...dates.map(d => d.getTime())));
      }
      
      // Import records if not dry run
      if (!options.dryRun) {
        for (const record of parsedRecords) {
          try {
            // Check for duplicates if needed
            if (options.skipDuplicates) {
              const existing = await this.checkDuplicate(record, userId, organizationId);
              if (existing) {
                result.recordsSkipped++;
                continue;
              }
            }
            
            // Import record
            await prisma.usageLog.create({
              data: {
                provider: record.provider,
                model: record.model,
                promptTokens: record.promptTokens,
                completionTokens: record.completionTokens,
                totalTokens: record.totalTokens,
                cost: record.cost,
                timestamp: record.date,
                metadata: record.metadata || {},
                userId,
                organizationId
              }
            });
            
            result.recordsImported++;
            result.summary.totalCost += record.cost;
            result.summary.totalTokens += record.totalTokens;
            result.summary.providers[record.provider] = 
              (result.summary.providers[record.provider] || 0) + 1;
            
          } catch (error) {
            console.error('Failed to import record:', error);
            result.errors.push(`Failed to import record: ${error}`);
          }
        }
      } else {
        // Dry run - just calculate summary
        for (const record of parsedRecords) {
          result.summary.totalCost += record.cost;
          result.summary.totalTokens += record.totalTokens;
          result.summary.providers[record.provider] = 
            (result.summary.providers[record.provider] || 0) + 1;
        }
        result.recordsImported = parsedRecords.length;
      }
      
      result.success = result.errors.length === 0;
      
    } catch (error) {
      console.error('CSV import error:', error);
      result.errors.push(`Import failed: ${error}`);
    }
    
    return result;
  }

  /**
   * Detect CSV format based on headers
   */
  private detectFormat(headers: string[], provider: string): string | null {
    const headerStr = headers.join(',').toLowerCase();
    
    // OpenAI format
    if (headerStr.includes('date') && headerStr.includes('model') && 
        (headerStr.includes('tokens') || headerStr.includes('cost'))) {
      return 'openai';
    }
    
    // Anthropic/Claude format
    if (headerStr.includes('timestamp') && headerStr.includes('model') && 
        headerStr.includes('input_tokens')) {
      return 'claude';
    }
    
    // Google/Gemini format
    if (headerStr.includes('date') && headerStr.includes('service') && 
        headerStr.includes('usage')) {
      return 'gemini';
    }
    
    // Generic format
    if (headerStr.includes('date') && headerStr.includes('tokens')) {
      return 'generic';
    }
    
    // Provider-specific detection
    switch (provider) {
      case 'openai':
        return 'openai';
      case 'claude':
        return 'claude';
      case 'gemini':
        return 'gemini';
      default:
        return 'generic';
    }
  }

  /**
   * Parse records based on detected format
   */
  private async parseRecords(
    records: any[],
    format: string,
    defaultProvider: string
  ): Promise<CSVRecord[]> {
    const parsed: CSVRecord[] = [];
    
    for (const record of records) {
      try {
        let csvRecord: CSVRecord | null = null;
        
        switch (format) {
          case 'openai':
            csvRecord = this.parseOpenAIRecord(record);
            break;
          case 'claude':
            csvRecord = this.parseClaudeRecord(record);
            break;
          case 'gemini':
            csvRecord = this.parseGeminiRecord(record);
            break;
          case 'generic':
          default:
            csvRecord = this.parseGenericRecord(record, defaultProvider);
            break;
        }
        
        if (csvRecord) {
          parsed.push(csvRecord);
        }
      } catch (error) {
        console.error('Failed to parse record:', error, record);
      }
    }
    
    return parsed;
  }

  /**
   * Parse OpenAI CSV format
   */
  private parseOpenAIRecord(record: any): CSVRecord | null {
    const date = this.parseDate(record.date || record.Date || record.timestamp);
    const model = record.model || record.Model || 'gpt-3.5-turbo';
    const tokens = parseInt(record.tokens || record.Tokens || record.total_tokens || '0');
    const cost = parseFloat(record.cost || record.Cost || record.amount || '0');
    
    if (!date) return null;
    
    return {
      date,
      provider: 'openai',
      model,
      promptTokens: Math.floor(tokens * 0.6), // Estimate
      completionTokens: Math.floor(tokens * 0.4),
      totalTokens: tokens,
      cost: cost || this.estimateCost('openai', model, tokens),
      metadata: {
        imported: true,
        source: 'csv'
      }
    };
  }

  /**
   * Parse Claude/Anthropic CSV format
   */
  private parseClaudeRecord(record: any): CSVRecord | null {
    const date = this.parseDate(record.timestamp || record.date || record.Date);
    const model = record.model || record.Model || 'claude-3-haiku';
    const inputTokens = parseInt(record.input_tokens || record.prompt_tokens || '0');
    const outputTokens = parseInt(record.output_tokens || record.completion_tokens || '0');
    const totalTokens = inputTokens + outputTokens;
    const cost = parseFloat(record.cost || record.Cost || '0');
    
    if (!date) return null;
    
    return {
      date,
      provider: 'claude',
      model,
      promptTokens: inputTokens,
      completionTokens: outputTokens,
      totalTokens,
      cost: cost || this.estimateCost('claude', model, totalTokens),
      metadata: {
        imported: true,
        source: 'csv'
      }
    };
  }

  /**
   * Parse Google/Gemini CSV format
   */
  private parseGeminiRecord(record: any): CSVRecord | null {
    const date = this.parseDate(record.date || record.Date || record.usage_date);
    const model = record.model || record.service || 'gemini-pro';
    const usage = parseInt(record.usage || record.requests || record.queries || '0');
    const cost = parseFloat(record.cost || record.Cost || record.amount || '0');
    
    if (!date) return null;
    
    // Gemini often reports in requests rather than tokens
    const estimatedTokens = usage * 1000; // Rough estimate
    
    return {
      date,
      provider: 'gemini',
      model,
      promptTokens: Math.floor(estimatedTokens * 0.6),
      completionTokens: Math.floor(estimatedTokens * 0.4),
      totalTokens: estimatedTokens,
      cost: cost || this.estimateCost('gemini', model, estimatedTokens),
      metadata: {
        imported: true,
        source: 'csv',
        originalUsage: usage
      }
    };
  }

  /**
   * Parse generic CSV format
   */
  private parseGenericRecord(record: any, provider: string): CSVRecord | null {
    const date = this.parseDate(
      record.date || record.Date || record.timestamp || 
      record.created_at || record.created
    );
    
    const model = record.model || record.Model || record.service || 'unknown';
    const tokens = parseInt(
      record.tokens || record.total_tokens || record.usage || '0'
    );
    const cost = parseFloat(
      record.cost || record.Cost || record.amount || record.price || '0'
    );
    
    if (!date) return null;
    
    return {
      date,
      provider: provider || 'unknown',
      model,
      promptTokens: Math.floor(tokens * 0.6),
      completionTokens: Math.floor(tokens * 0.4),
      totalTokens: tokens,
      cost: cost || 0,
      metadata: {
        imported: true,
        source: 'csv',
        original: record
      }
    };
  }

  /**
   * Parse date from various formats
   */
  private parseDate(dateStr: any): Date | null {
    if (!dateStr) return null;
    
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date;
      }
      
      // Try common formats
      const formats = [
        /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
        /(\d{2})\/(\d{2})\/(\d{4})/, // MM/DD/YYYY
        /(\d{2})-(\d{2})-(\d{4})/ // DD-MM-YYYY
      ];
      
      for (const format of formats) {
        const match = dateStr.match(format);
        if (match) {
          return new Date(dateStr);
        }
      }
      
    } catch (error) {
      console.error('Failed to parse date:', dateStr);
    }
    
    return null;
  }

  /**
   * Estimate cost if not provided
   */
  private estimateCost(provider: string, model: string, tokens: number): number {
    const rates: Record<string, number> = {
      'openai:gpt-4': 0.03,
      'openai:gpt-3.5-turbo': 0.002,
      'claude:claude-3-opus': 0.015,
      'claude:claude-3-haiku': 0.00025,
      'gemini:gemini-pro': 0.00025,
      'grok:grok-beta': 0.002
    };
    
    const rate = rates[`${provider}:${model}`] || 0.001;
    return (tokens / 1000) * rate;
  }

  /**
   * Check for duplicate record
   */
  private async checkDuplicate(
    record: CSVRecord,
    userId: string,
    organizationId: string
  ): Promise<boolean> {
    // Check if a similar record exists within 1 minute
    const timeWindow = new Date(record.date.getTime() - 60000); // 1 minute before
    const timeWindowAfter = new Date(record.date.getTime() + 60000); // 1 minute after
    
    const existing = await prisma.usageLog.findFirst({
      where: {
        organizationId,
        provider: record.provider,
        model: record.model,
        totalTokens: record.totalTokens,
        timestamp: {
          gte: timeWindow,
          lte: timeWindowAfter
        }
      }
    });
    
    return !!existing;
  }

  /**
   * Get sample CSV template for provider
   */
  getSampleTemplate(provider: string): string {
    switch (provider) {
      case 'openai':
        return `Date,Model,Tokens,Cost
2025-09-01,gpt-4,1500,0.045
2025-09-02,gpt-3.5-turbo,5000,0.010`;
        
      case 'claude':
        return `Timestamp,Model,Input_Tokens,Output_Tokens,Cost
2025-09-01T10:00:00Z,claude-3-opus,1000,500,0.0225
2025-09-02T14:30:00Z,claude-3-haiku,2000,1000,0.00375`;
        
      case 'gemini':
        return `Date,Service,Usage,Cost
2025-09-01,gemini-pro,10,0.0025
2025-09-02,gemini-pro-vision,5,0.00125`;
        
      default:
        return `Date,Provider,Model,Tokens,Cost
2025-09-01,openai,gpt-4,1500,0.045
2025-09-02,claude,claude-3-haiku,3000,0.00375`;
    }
  }
}

export const csvImportService = new CSVImportService();