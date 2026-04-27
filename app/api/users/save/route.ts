import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/services';

export async function POST(request: Request) {
  const payload = await request.json();

  if (!payload.username || !payload.name) {
    return NextResponse.json({ message: '账号和姓名不能为空。' }, { status: 400 });
  }

  const user = payload.id
    ? await prisma.user.update({
        where: { id: payload.id },
        data: {
          username: payload.username,
          name: payload.name,
          department: payload.department,
          role: payload.role
        }
      })
    : await prisma.user.create({
        data: {
          username: payload.username,
          password: payload.password || 'admin123',
          name: payload.name,
          department: payload.department,
          role: payload.role,
          status: '启用'
        }
      });

  await writeAuditLog({
    module: '用户管理',
    action: payload.id ? '编辑用户' : '新增用户',
    objectType: '用户',
    objectId: user.id,
    summary: `${user.name}（${user.username}）信息已${payload.id ? '更新' : '新增'}。`
  });

  return NextResponse.json({ success: true });
}
