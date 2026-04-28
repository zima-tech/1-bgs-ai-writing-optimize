import { NextResponse } from 'next/server';

import { requireApiUser } from '@/lib/auth';
import { proofreadContent } from '@/lib/ai';
import { writeAuditLog } from '@/lib/services';

export async function POST(request: Request) {
  const auth = await requireApiUser();

  if (auth.response) {
    return auth.response;
  }

  const payload = await request.json();
  const result = await proofreadContent(payload);

  await writeAuditLog({
    module: '文字校对',
    action: '执行校对',
    objectType: '校对任务',
    summary: `完成《${payload.title}》的校对分析，共识别 ${result.issues.length} 处重点问题。`
  });

  return NextResponse.json({
    reviewedContent: result.reviewedContent,
    summary: result.summary,
    issues: result.issues.map((issue, index) => ({ ...issue, id: `draft-issue-${index + 1}` }))
  });
}
