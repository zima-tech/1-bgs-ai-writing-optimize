import { DashboardShell } from '@/components/dashboard/dashboard-shell';

const titleMap: Record<string, { title: string; description: string }> = {
  '/writing': {
    title: '智能写作',
    description: '基于模板、提纲和业务要求快速形成材料初稿，并支持润色优化与保存归档。'
  },
  '/proofread': {
    title: '文字校对',
    description: '对已有材料执行错别字、语法、格式和敏感词校对，形成可追溯结果。'
  },
  '/users': {
    title: '用户管理',
    description: '维护本系统演示账号、角色信息和启停状态。'
  },
  '/audit-logs': {
    title: '日志审计',
    description: '查看系统登录、写稿、校对、保存与治理操作全量留痕。'
  },
  '/settings': {
    title: '系统设置',
    description: '维护写作策略、校对规则与 AI 降级口径等系统配置。'
  }
};

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell title="业务台" description="办公智能业务系统">{children}</DashboardShell>;
}
