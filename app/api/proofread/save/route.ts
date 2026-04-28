import { NextResponse } from 'next/server';

import { requireApiUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/services';

export async function POST(request: Request) {
  const auth = await requireApiUser();

  if (auth.response) {
    return auth.response;
  }

  const payload = await request.json();

  const task = await prisma.proofreadTask.create({
    data: {
      title: payload.title,
      sourceType: payload.sourceType || '手动录入',
      status: '已复核',
      riskLevel: payload.issues?.some((item: { severity: string }) => item.severity === '高') ? '高' : '中',
      originalContent: payload.content,
      reviewedContent: payload.reviewedContent,
      summary: payload.summary,
      source: 'manual-save',
      issues: {
        create: (payload.issues || []).map(
          (item: {
            issueType: string;
            severity: string;
            originalText: string;
            suggestion: string;
            reason: string;
            positionStart: number;
            positionEnd: number;
          }) => ({
            issueType: item.issueType,
            severity: item.severity,
            originalText: item.originalText,
            suggestion: item.suggestion,
            reason: item.reason,
            positionStart: item.positionStart,
            positionEnd: item.positionEnd
          })
        )
      }
    }
  });

  await writeAuditLog({
    module: '文字校对',
    action: '保存校对结果',
    objectType: '校对任务',
    objectId: task.id,
    summary: `《${payload.title}》校对结果已保存，共沉淀 ${payload.issues?.length || 0} 处问题。`
  });

  return NextResponse.json({ success: true, id: task.id });
}
