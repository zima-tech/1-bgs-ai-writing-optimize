'use client';

import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onFinish(values: { username: string; password: string }) {
    setLoading(true);
    setError('');

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });

    const result = await response.json();

    if (!response.ok) {
      setError(result.message || '登录失败，请检查账号密码。');
      setLoading(false);
      return;
    }

    router.push('/writing');
    router.refresh();
  }

  return (
    <Card bordered={false}>
      <div style={{ marginBottom: 24 }}>
        <Typography.Title level={3} style={{ marginBottom: 8 }}>
          登录系统
        </Typography.Title>
        <Typography.Paragraph className="muted" style={{ marginBottom: 0 }}>
          使用授权账号进入业务工作台
        </Typography.Paragraph>
      </div>
      <div className="login-account-hint">演示账号：admin / admin123</div>
      {error ? <Alert type="error" message={error} style={{ marginBottom: 16 }} showIcon /> : null}
      <Form layout="vertical" onFinish={onFinish} initialValues={{ username: 'admin', password: 'admin123' }}>
        <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
          <Input size="large" placeholder="请输入用户名" />
        </Form.Item>
        <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
          <Input.Password size="large" placeholder="请输入密码" />
        </Form.Item>
        <Button type="primary" htmlType="submit" block size="large" loading={loading}>
          登录并进入系统
        </Button>
      </Form>
    </Card>
  );
}
