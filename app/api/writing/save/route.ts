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

  const document = await prisma.writingDocument.create({
    data: {
      title: payload.title,
      type: payload.type,
      status: '草稿',
      tone: payload.tone,
      keywords: payload.keywords,
      summary: payload.summary || '',
      outline: payload.outline || '',
      content: payload.content || '',
      source: 'manual-save',
      templateId: payload.templateId || null
    }
  });

  await prisma.conversationMessage.createMany({
    data: [
      {
        documentId: document.id,
        role: 'assistant',
        stage: '任务理解',
        content: `已识别《${payload.title}》的写作目标和业务要求。`
      },
      {
        documentId: document.id,
        role: 'assistant',
        stage: '结果生成',
        content: '文稿已保存至写稿台账，可继续追问或校核。'
      }
    ]
  });

  await writeAuditLog({
    module: '智能写作',
    action: '保存文稿',
    objectType: '文稿',
    objectId: document.id,
    summary: `《${payload.title}》已保存至文稿台账。`
  });

  return NextResponse.json({ success: true, id: document.id });
}
