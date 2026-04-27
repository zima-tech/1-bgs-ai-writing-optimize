import { NextResponse } from 'next/server';

import { generateDraft } from '@/lib/ai';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/services';

export async function POST(request: Request) {
  const payload = await request.json();
  const template = payload.templateId
    ? await prisma.writingTemplate.findUnique({ where: { id: payload.templateId } })
    : null;

  const result = await generateDraft({
    title: payload.title,
    type: payload.type,
    keywords: payload.keywords,
    requirements: payload.requirements,
    tone: payload.tone,
    wordCount: Number(payload.wordCount || 1200),
    templateName: template?.name
  });

  await writeAuditLog({
    module: '智能写作',
    action: '生成初稿',
    objectType: '文稿',
    summary: `围绕《${payload.title}》完成初稿生成，来源：${result.source === 'glm' ? 'GLM' : '本地初稿'}。`
  });

  return NextResponse.json({
    content: result.content,
    summary: result.source === 'glm' ? '已基于智能模型生成正式初稿。' : '当前使用本地初稿策略生成内容，可继续完善。'
  });
}
