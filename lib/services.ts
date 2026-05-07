import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function writeAuditLog(params: {
  module: string;
  action: string;
  objectType: string;
  objectId?: string;
  summary: string;
  result?: string;
  operator?: string;
}) {
  const currentUser = params.operator ? null : await getCurrentUser();

  await prisma.auditLog.create({
    data: {
      module: params.module,
      action: params.action,
      objectType: params.objectType,
      objectId: params.objectId,
      operator: params.operator || currentUser?.username || 'system',
      result: params.result || '成功',
      summary: params.summary
    }
  });
}

export async function getDashboardSnapshot() {
  const [documents, proofreads, templates, logs] = await Promise.all([
    prisma.writingDocument.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 30,
      include: { template: true, messages: { orderBy: { createdAt: 'asc' } } }
    }),
    prisma.proofreadTask.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 20,
      include: { issues: true }
    }),
    prisma.writingTemplate.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }]
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 12
    })
  ]);

  return { documents, proofreads, templates, logs };
}
