import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export default async function HomePage(): Promise<React.ReactElement> {
  const session = await getSession();

  if (session.isLoggedIn) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
