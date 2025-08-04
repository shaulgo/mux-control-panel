import { authenticateAdmin, validateCredentials } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as unknown as {
      email?: string;
      password?: string;
    };
    const email = String(body.email ?? '');
    const password = String(body.password ?? '');

    // Validate input
    const validation = validateCredentials(email, password);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Authenticate admin
    const authResult = await authenticateAdmin(email, password);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error ?? 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create session
    await createSession('admin', email);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
