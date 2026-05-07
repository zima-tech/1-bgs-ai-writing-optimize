import { prisma } from '@/lib/prisma';
import { ProofreadWorkspace } from '@/components/proofread/proofread-workspace';

export default async function ProofreadPage() {
  const tasks = await prisma.proofreadTask.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 30,
    include: { issues: true }
  });

  return <ProofreadWorkspace tasks={tasks} />;
}
