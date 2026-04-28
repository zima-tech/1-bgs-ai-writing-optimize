import { NextResponse } from 'next/server';

import { AUTH_COOKIE } from '@/lib/auth-config';
import { requireApiUser } from '@/lib/auth';
import { writeAuditLog } from '@/lib/services';

export async function POST() {
  const auth = await requireApiUser();

  if (auth.response) {
    return auth.response;
  }

  await writeAuditLog({
    module: '登录',
    action: '退出登录',
    objectType: '用户',
    objectId: auth.user.id,
    summary: `${auth.user.name}退出智能写稿优化和校对系统。`
  });

  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_COOKIE, '', { path: '/', maxAge: 0 });
  return response;
}
