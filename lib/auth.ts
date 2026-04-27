import { cookies } from 'next/headers';

export const AUTH_COOKIE = 'bgs_admin_session';

export function getServerAuth() {
  const cookieStore = cookies();
  return cookieStore.get(AUTH_COOKIE)?.value === 'admin';
}
