import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { csvImportService } from '@/lib/services/csv-import.service';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Increase payload limit for CSV files
export const maxDuration = 60; // 60 seconds timeout for large files

/**
 * POST /api/usage/import
 * Import usage data from CSV file
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 2. Get user and organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true }
    });
    
    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'User or organization not found' }, { status: 404 });
    }
    
    // 3. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const provider = formData.get('provider') as string;
    const skipDuplicates = formData.get('skipDuplicates') === 'true';
    const dryRun = formData.get('dryRun') === 'true';
    
    // 4. Validate inputs
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    if (!provider) {
      return NextResponse.json({ error: 'Provider not specified' }, { status: 400 });
    }
    
    // 5. Check file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'Only CSV files are supported' }, { status: 400 });
    }
    
    // 6. Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }
    
    // 7. Read file content
    const fileContent = await file.text();
    
    // 8. Import CSV data
    console.log(`Importing CSV for ${provider} (dry run: ${dryRun})`);
    const result = await csvImportService.importCSV(
      fileContent,
      provider,
      user.id,
      user.organizationId,
      {
        skipDuplicates,
        dryRun
      }
    );
    
    // 9. Log import activity
    await prisma.activityLog.create({
      data: {
        type: 'CSV_IMPORT',
        userId: user.id,
        organizationId: user.organizationId,
        metadata: {
          provider,
          fileName: file.name,
          fileSize: file.size,
          recordsProcessed: result.recordsProcessed,
          recordsImported: result.recordsImported,
          recordsSkipped: result.recordsSkipped,
          dryRun,
          success: result.success
        }
      }
    });
    
    // 10. Return results
    return NextResponse.json({
      success: result.success,
      message: dryRun 
        ? `Dry run complete. Would import ${result.recordsImported} records.`
        : `Successfully imported ${result.recordsImported} of ${result.recordsProcessed} records.`,
      details: {
        processed: result.recordsProcessed,
        imported: result.recordsImported,
        skipped: result.recordsSkipped,
        errors: result.errors
      },
      summary: result.summary
    });
    
  } catch (error) {
    console.error('CSV import error:', error);
    return NextResponse.json(
      { error: 'Failed to import CSV file' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/usage/import
 * Get CSV import templates and instructions
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');
    
    if (provider) {
      // Return sample template for specific provider
      const template = csvImportService.getSampleTemplate(provider);
      
      return new Response(template, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${provider}-template.csv"`
        }
      });
    }
    
    // Return general information
    return NextResponse.json({
      supportedProviders: ['openai', 'claude', 'gemini', 'grok', 'generic'],
      maxFileSize: '10MB',
      fileFormat: 'CSV',
      templates: {
        openai: '/api/usage/import?provider=openai',
        claude: '/api/usage/import?provider=claude',
        gemini: '/api/usage/import?provider=gemini',
        grok: '/api/usage/import?provider=grok',
        generic: '/api/usage/import?provider=generic'
      },
      instructions: {
        openai: 'Export usage data from OpenAI dashboard > Usage > Export',
        claude: 'Export from Anthropic console > Usage > Download CSV',
        gemini: 'Export from Google Cloud Console > Billing > Reports',
        grok: 'Export from X.AI dashboard > Usage section',
        generic: 'Use Date, Provider, Model, Tokens, Cost columns'
      }
    });
    
  } catch (error) {
    console.error('CSV template error:', error);
    return NextResponse.json(
      { error: 'Failed to get CSV templates' },
      { status: 500 }
    );
  }
}