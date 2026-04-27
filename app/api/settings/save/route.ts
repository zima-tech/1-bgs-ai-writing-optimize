import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/services';

export async function POST(request: Request) {
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
