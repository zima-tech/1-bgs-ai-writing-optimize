import { prisma } from '@/lib/prisma';
import { UsersManager } from '@/components/governance/users-manager';

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
  return <UsersManager users={users} />;
}
