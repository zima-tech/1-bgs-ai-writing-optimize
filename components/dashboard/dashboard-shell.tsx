'use client';

import { AuditOutlined, FileSearchOutlined, FileTextOutlined, LogoutOutlined, SettingOutlined, TeamOutlined } from '@ant-design/icons';
import { App, Avatar, Button, Layout, Menu, Space, Tag, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';

const items: NonNullable<MenuProps['items']> = [
  { key: '/writing', icon: <FileTextOutlined />, label: '智能写作' },
  { key: '/proofread', icon: <FileSearchOutlined />, label: '文字校对' },
  { type: 'divider' },
  { key: '/users', icon: <TeamOutlined />, label: '用户管理' },
  { key: '/audit-logs', icon: <AuditOutlined />, label: '日志审计' },
  { key: '/settings', icon: <SettingOutlined />, label: '系统设置' }
];

const adminOnlyKeys = new Set(['/users', '/audit-logs', '/settings']);

export function DashboardShell({
  children,
  title,
  description,
  currentUser
}: {
  children: React.ReactNode;
  title: string;
  description: string;
  currentUser: {
    username: string;
    name: string;
    role: string;
  };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [isNavigating, startNavigation] = useTransition();
  const { message } = App.useApp();

  const visibleItems = useMemo(
    () =>
      currentUser.role === '管理员'
        ? items
        : items.filter((item) => {
          if (!item) {
            return false;
          }

          if ('type' in item && item.type === 'divider') {
            return false;
          }

          return !('key' in item) || !adminOnlyKeys.has(String(item.key));
        }),
    [currentUser.role]
  );

  useEffect(() => {
    visibleItems.forEach((item) => {
      if (item && 'key' in item && typeof item.key === 'string' && item.key !== pathname) {
        router.prefetch(item.key);
      }
    });
  }, [pathname, router, visibleItems]);

  function navigate(key: string) {
    if (key === pathname || isNavigating) {
      return;
    }

    startNavigation(() => {
      router.push(key);
    });
  }

  async function logout() {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    message.success('已退出当前系统。');
    router.push('/login');
    router.refresh();
  }

  return (
    <Layout className={`dashboard-layout${isNavigating ? ' is-navigating' : ''}`}>
      <div className="route-progress" />
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
          items={visibleItems}
          disabled={isNavigating}
          style={{ background: 'transparent', borderInlineEnd: 'none' }}
          onClick={({ key }) => navigate(key)}
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
            <Tag color="processing">{currentUser.role}</Tag>
            <Tag>{currentUser.username}</Tag>
            <Avatar style={{ backgroundColor: '#1358db' }}>{currentUser.name.slice(0, 1)}</Avatar>
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
