import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

import { requireApiAdminUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/services';

export async function POST(request: Request) {
  const auth = await requireApiAdminUser();

  if (auth.response) {
    return auth.response;
  }

  const payload = await request.json();

  if (!payload.username || !payload.name || !payload.department || !payload.role) {
    return NextResponse.json({ message: '账号、姓名、部门和角色不能为空。' }, { status: 400 });
  }

  try {
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
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ message: '账号已存在，请更换后重试。' }, { status: 409 });
    }

    throw error;
  }
}
