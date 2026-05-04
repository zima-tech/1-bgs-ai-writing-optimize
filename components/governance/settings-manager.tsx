'use client';

import type { SystemSetting } from '@prisma/client';
import { App, Button, Form, Input, Modal, Space, Switch, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SettingsManager({ settings }: { settings: SystemSetting[] }) {
  const { message } = App.useApp();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState<SystemSetting | null>(null);
  const [form] = Form.useForm();

  const columns: ColumnsType<SystemSetting> = [
    { title: '设置项', dataIndex: 'key', width: 240, fixed: 'left' },
    { title: '分组', dataIndex: 'groupName', width: 160 },
    { title: '当前值', dataIndex: 'value', width: 180, ellipsis: true },
    { title: '类型', dataIndex: 'type', width: 100 },
    {
      title: '状态',
      dataIndex: 'enabled',
      width: 100,
      render: (enabled: boolean) => <Tag color={enabled ? 'success' : 'default'}>{enabled ? '启用' : '停用'}</Tag>
    },
    { title: '说明', dataIndex: 'description', ellipsis: true },
    {
      title: '操作',
      key: 'action',
      width: 96,
      fixed: 'right',
      render: (_, setting) => (
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
      )
    }
  ];

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
        <Table
          className="panel-card"
          rowKey="id"
          columns={columns}
          dataSource={settings}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 960, y: 'calc(100vh - 260px)' }}
        />
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
