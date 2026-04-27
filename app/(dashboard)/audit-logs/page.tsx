import { prisma } from '@/lib/prisma';
import { AuditLogsView } from '@/components/governance/audit-logs-view';

export default async function AuditLogsPage() {
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' } });
  return <AuditLogsView logs={logs} />;
}
