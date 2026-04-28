import { NextResponse } from 'next/server';

import { requireApiAdminUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/services';

export async function POST(request: Request) {
  const auth = await requireApiAdminUser();

  if (auth.response) {
    return auth.response;
  }

  const payload = await request.json();

  await prisma.systemSetting.update({
    where: { id: payload.id },
    data: {
      value: payload.value,
      description: payload.description,
      enabled: payload.enabled
    }
  });

  await writeAuditLog({
    module: '系统设置',
    action: '保存设置',
    objectType: '系统设置',
    objectId: payload.id,
    summary: `系统设置 ${payload.key} 已更新。`
  });

  return NextResponse.json({ success: true });
}
