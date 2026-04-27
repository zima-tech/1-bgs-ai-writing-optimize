import { prisma } from '@/lib/prisma';
import { SettingsManager } from '@/components/governance/settings-manager';

export default async function SettingsPage() {
  const settings = await prisma.systemSetting.findMany({ orderBy: [{ groupName: 'asc' }, { key: 'asc' }] });
  return <SettingsManager settings={settings} />;
}
