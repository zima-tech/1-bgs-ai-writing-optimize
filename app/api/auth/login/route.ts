import { NextResponse } from 'next/server';

import { AUTH_COOKIE } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/services';

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (username !== 'admin' || password !== 'admin123') {
    return NextResponse.json({ message: '账号或密码错误，请核对后重试。' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { username: 'admin' } });

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });
  }

  await writeAuditLog({
    module: '登录',
    action: '登录成功',
    objectType: '用户',
    objectId: user?.id,
    summary: '管理员登录智能写稿优化和校对系统。'
  });

  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_COOKIE, 'admin', { httpOnly: true, sameSite: 'lax', path: '/' });
  return response;
}
