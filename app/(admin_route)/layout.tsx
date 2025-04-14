import React, { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

interface Props {
  children: ReactNode;
}
export default async function AdminLayout({ children }: Props) {
  const session = await getServerSession(authOptions);

  const user = session?.user as { role: string } | undefined;
  const isAdmin = user?.role === 'Admin';

  if (!isAdmin) return <h1 className="text-5xl">Access Denied</h1>;

  // return the user to sign in page if user not found in session
  // if (!isAdmin) redirect('api/auth/signin');

  return <>{children}</>;
}
