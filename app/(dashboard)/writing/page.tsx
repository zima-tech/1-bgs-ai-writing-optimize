import { getDashboardSnapshot } from '@/lib/services';
import { WritingWorkspace } from '@/components/writing/writing-workspace';

export default async function WritingPage() {
  const snapshot = await getDashboardSnapshot();
  return <WritingWorkspace templates={snapshot.templates} documents={snapshot.documents} logs={snapshot.logs.slice(0, 8)} />;
}
