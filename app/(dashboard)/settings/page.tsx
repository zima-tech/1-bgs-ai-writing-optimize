import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/auth';
import { SettingsManager } from '@/components/governance/settings-manager';

export default async function SettingsPage() {
  await requireAdminUser();
  const settings = await prisma.systemSetting.findMany({ orderBy: [{ groupName: 'asc' }, { key: 'asc' }] });
  return <SettingsManager settings={settings} />;
}
