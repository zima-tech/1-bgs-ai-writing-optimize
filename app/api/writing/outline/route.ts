import { NextResponse } from 'next/server';

import { generateOutline } from '@/lib/ai';
import { writeAuditLog } from '@/lib/services';

export async function POST(request: Request) {
  const payload = await request.json();
  const result = await generateOutline(payload);

  await writeAuditLog({
    module: '智能写作',
    action: '生成提纲',
    objectType: '文稿',
    summary: `完成主题“${payload.topic}”的结构提纲生成。`
  });

  return NextResponse.json(result);
}
