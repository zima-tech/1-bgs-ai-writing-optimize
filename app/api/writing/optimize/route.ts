import { NextResponse } from 'next/server';

import { requireApiUser } from '@/lib/auth';
import { optimizeWriting } from '@/lib/ai';
import { writeAuditLog } from '@/lib/services';

export async function POST(request: Request) {
  const auth = await requireApiUser();

  if (auth.response) {
    return auth.response;
  }

  const payload = await request.json();
  const result = await optimizeWriting(payload.content, payload.tone);

  await writeAuditLog({
    module: '智能写作',
    action: '风格优化',
    objectType: '文稿',
    summary: `完成${payload.tone}风格优化，输出来源：${result.source === 'glm' ? 'GLM' : '本地优化建议'}。`
  });

  return NextResponse.json(result);
}
