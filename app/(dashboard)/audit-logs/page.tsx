import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/auth';
import { AuditLogsView } from '@/components/governance/audit-logs-view';

export default async function AuditLogsPage() {
  await requireAdminUser();
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  return <AuditLogsView logs={logs} />;
}
