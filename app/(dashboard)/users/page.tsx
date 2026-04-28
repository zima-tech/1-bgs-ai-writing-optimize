import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/auth';
import { UsersManager } from '@/components/governance/users-manager';

export default async function UsersPage() {
  await requireAdminUser();
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
  return <UsersManager users={users} />;
}
