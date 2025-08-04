import { getIronSession, type IronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export type SessionData = {
  userId: string;
  email: string;
  isLoggedIn: boolean;
};

const defaultSession: SessionData = {
  userId: '',
  email: '',
  isLoggedIn: false,
};

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET environment variable is required');
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  // @ts-expect-error - Next.js 15 type compatibility issue with iron-session
  const session = await getIronSession<SessionData>(cookieStore, {
    password: process.env.SESSION_SECRET!,
    cookieName: 'mux-control-panel-session',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    },
  });

  if (!session.isLoggedIn) {
    session.userId = defaultSession.userId;
    session.email = defaultSession.email;
    session.isLoggedIn = defaultSession.isLoggedIn;
  }

  return session;
}

export async function createSession(
  userId: string,
  email: string
): Promise<void> {
  const session = await getSession();
  session.userId = userId;
  session.email = email;
  session.isLoggedIn = true;
  await session.save();
}

export async function destroySession(): Promise<void> {
  const session = await getSession();
  await session.destroy();
}

export async function requireAuth(): Promise<SessionData> {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect('/login');
  }

  // Return only the data shape, not the IronSession methods.
  return {
    userId: session.userId,
    email: session.email,
    isLoggedIn: session.isLoggedIn,
  };
}
