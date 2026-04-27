import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/services';

export async function POST(request: Request) {
  const payload = await request.json();
  const user = await prisma.user.findUnique({ where: { id: payload.id } });

  if (!user) {
    return NextResponse.json({ message: '未找到对应用户。' }, { status: 404 });
  }

  const nextStatus = user.status === '启用' ? '停用' : '启用';
  await prisma.user.update({
    where: { id: user.id },
    data: { status: nextStatus }
  });

  await writeAuditLog({
    module: '用户管理',
    action: `${nextStatus}用户`,
    objectType: '用户',
    objectId: user.id,
    summary: `${user.name}状态已更新为${nextStatus}。`
  });

  return NextResponse.json({ success: true });
}
