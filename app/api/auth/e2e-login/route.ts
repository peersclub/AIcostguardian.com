import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth-config'; // Assuming this is where you have your NextAuth options
import { getServerSession } from 'next-auth/next';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== 'test') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // This is a simplified way to create a session for testing.
  // In a real app, you would use the NextAuth.js session management.
  // For the purpose of E2E tests, we can create a session manually.
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      sessionToken: require('crypto').randomBytes(32).toString('hex'),
    },
  });

  const cookies = `next-auth.session-token=${session.sessionToken}`;

  const response = NextResponse.json({ success: true, userId: user.id });
  response.headers.set('Set-Cookie', cookies);

  return response;
}
