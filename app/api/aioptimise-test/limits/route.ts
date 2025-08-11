import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Mock usage limits
    const limits = {
      dailyLimit: 10,
      monthlyLimit: 100,
      dailyUsed: 3.45,
      monthlyUsed: 42.67,
    };
    
    return NextResponse.json(limits);
  } catch (error) {
    console.error('Failed to fetch limits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch limits' },
      { status: 500 }
    );
  }
}