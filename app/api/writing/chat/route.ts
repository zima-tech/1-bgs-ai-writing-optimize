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
  const document = await prisma.writingDocument.findUnique({
    where: { id: payload.documentId },
    include: { messages: { orderBy: { createdAt: 'asc' } } }
  });

  if (!document) {
    return NextResponse.json({ message: '未找到对应文稿，无法继续追问。' }, { status: 404 });
  }

  const assistantReply = `【继续追问】围绕“${payload.prompt}”，建议补充《${document.title}》的事实数据、执行节点和责任分工，并统一为正式书面口径。`;

  await prisma.conversationMessage.createMany({
    data: [
      {
        documentId: document.id,
        role: 'user',
        stage: '继续追问',
        content: payload.prompt
      },
      {
        documentId: document.id,
        role: 'assistant',
        stage: '结果生成',
        content: assistantReply
      }
    ]
  });

  await writeAuditLog({
    module: '智能写作',
    action: '继续追问',
    objectType: '文稿会话',
    objectId: document.id,
    summary: `围绕《${document.title}》追加一次写作追问。`
  });

  const messages = await prisma.conversationMessage.findMany({
    where: { documentId: document.id },
    orderBy: { createdAt: 'asc' }
  });

  return NextResponse.json({ messages });
}
