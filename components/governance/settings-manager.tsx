'use client';

import type { SystemSetting } from '@prisma/client';
import { App, Button, Card, Descriptions, Form, Input, Modal, Space, Switch, Tag } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SettingsManager({ settings }: { settings: SystemSetting[] }) {
  const { message } = App.useApp();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState<SystemSetting | null>(null);
  const [form] = Form.useForm();

  async function saveSetting(values: { value: string; description: string; enabled: boolean }) {
    if (!current) return;

    setLoading(true);
    const response = await fetch('/api/settings/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: current.id, key: current.key, ...values })
    });
    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      message.error(result.message || '设置保存失败。');
      return;
    }

    message.success('设置已保存。');
    setOpen(false);
    setCurrent(null);
    router.refresh();
  }

  return (
    <App>
      <div className="page-stack">
        {settings.map((setting) => (
          <Card
            key={setting.id}
            className="panel-card"
            title={setting.key}
            extra={
              <Button
                size="small"
                onClick={() => {
                  setCurrent(setting);
                  form.setFieldsValue(setting);
                  setOpen(true);
                }}
              >
                编辑
              </Button>
            }
          >
            <Descriptions column={1}>
              <Descriptions.Item label="分组">{setting.groupName}</Descriptions.Item>
              <Descriptions.Item label="当前值">{setting.value}</Descriptions.Item>
              <Descriptions.Item label="类型">{setting.type}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={setting.enabled ? 'success' : 'default'}>{setting.enabled ? '启用' : '停用'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="说明">{setting.description}</Descriptions.Item>
            </Descriptions>
          </Card>
        ))}
        <Modal open={open} title="编辑系统设置" onCancel={() => setOpen(false)} footer={null} destroyOnClose>
          <Form form={form} layout="vertical" onFinish={saveSetting}>
            <Form.Item label="当前值" name="value" rules={[{ required: true, message: '请输入设置值' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="说明" name="description" rules={[{ required: true, message: '请输入说明' }]}>
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item label="是否启用" name="enabled" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Space>
              <Button onClick={() => setOpen(false)}>关闭</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存
              </Button>
            </Space>
          </Form>
        </Modal>
      </div>
    </App>
  );
}
