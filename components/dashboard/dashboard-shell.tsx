'use client';

import { AuditOutlined, FileSearchOutlined, FileTextOutlined, LogoutOutlined, SettingOutlined, TeamOutlined } from '@ant-design/icons';
import { App, Avatar, Button, Layout, Menu, Space, Tag, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const items: MenuProps['items'] = [
  { key: '/writing', icon: <FileTextOutlined />, label: '智能写作' },
  { key: '/proofread', icon: <FileSearchOutlined />, label: '文字校对' },
  { type: 'divider' },
  { key: '/users', icon: <TeamOutlined />, label: '用户管理' },
  { key: '/audit-logs', icon: <AuditOutlined />, label: '日志审计' },
  { key: '/settings', icon: <SettingOutlined />, label: '系统设置' }
];

export function DashboardShell({
  children,
  title,
  description
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const { message } = App.useApp();

  async function logout() {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    message.success('已退出当前系统。');
    router.push('/login');
    router.refresh();
  }

  return (
    <Layout className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <Tag color="blue" style={{ marginBottom: 12 }}>
            办公室
          </Tag>
          <Typography.Title level={4} style={{ color: '#fff', margin: 0 }}>
            智能写稿优化和校对
          </Typography.Title>
          <Typography.Paragraph style={{ color: 'rgba(255,255,255,0.72)', marginTop: 12, marginBottom: 0 }}>
            覆盖写稿初稿生成、风格优化、结构校对和治理留痕的一体化业务台。
          </Typography.Paragraph>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname || '/writing']}
          items={items}
          style={{ background: 'transparent', borderInlineEnd: 'none' }}
          onClick={({ key }) => router.push(key)}
        />
      </aside>
      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {title}
            </Typography.Title>
            <Typography.Text className="muted">{description}</Typography.Text>
          </div>
          <Space>
            <Tag color="processing">演示账号：admin</Tag>
            <Avatar style={{ backgroundColor: '#1358db' }}>管</Avatar>
            <Button icon={<LogoutOutlined />} onClick={logout} loading={loggingOut}>
              退出登录
            </Button>
          </Space>
        </header>
        <main className="dashboard-main">{children}</main>
      </section>
    </Layout>
  );
}
