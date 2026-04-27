import { redirect } from 'next/navigation';

import { getServerAuth } from '@/lib/auth';

export default function HomePage() {
  if (getServerAuth()) {
    redirect('/writing');
  }

  redirect('/login');
}
