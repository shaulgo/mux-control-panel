import { LoginForm } from '@/components/auth/login-form';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function LoginPage(): Promise<React.ReactElement> {
  const session = await getSession();

  if (session.isLoggedIn) {
    redirect('/dashboard');
  }

  return <LoginForm />;
}
