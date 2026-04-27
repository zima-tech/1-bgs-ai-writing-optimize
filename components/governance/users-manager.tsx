'use client';

import type { User } from '@prisma/client';
import { App, Button, Card, Form, Input, Modal, Select, Space, Table, Tag } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function UsersManager({ users }: { users: User[] }) {
  const { message } = App.useApp();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  async function saveUser(values: {
    username: string;
    password?: string;
    name: string;
    department: string;
    role: string;
  }) {
    setLoading(true);
    const response = await fetch('/api/users/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingUser?.id, ...values })
    });
    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      message.error(result.message || '保存失败。');
      return;
    }

    message.success(editingUser ? '用户信息已更新。' : '用户已新增。');
    setOpen(false);
    setEditingUser(null);
    form.resetFields();
    router.refresh();
  }

  async function toggleUser(id: string) {
    const response = await fetch('/api/users/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const result = await response.json();

    if (!response.ok) {
      message.error(result.message || '状态切换失败。');
      return;
    }

    message.success('用户状态已更新。');
    router.refresh();
  }

  return (
    <App>
      <div className="page-stack">
      <Card
        className="panel-card"
        title="系统用户台账"
        extra={
          <Button
            type="primary"
            onClick={() => {
              setEditingUser(null);
              form.resetFields();
              setOpen(true);
            }}
          >
            新增用户
          </Button>
        }
      >
        <Table
          rowKey="id"
          pagination={false}
          dataSource={users}
          columns={[
            { title: '账号', dataIndex: 'username' },
            { title: '姓名', dataIndex: 'name' },
            { title: '部门', dataIndex: 'department' },
            { title: '角色', dataIndex: 'role' },
            {
              title: '状态',
              dataIndex: 'status',
              render: (value) => <Tag color={value === '启用' ? 'success' : 'default'}>{value}</Tag>
            },
            {
              title: '操作',
              render: (_, record) => (
                <Space>
                  <Button
                    size="small"
                    onClick={() => {
                      setEditingUser(record);
                      form.setFieldsValue(record);
                      setOpen(true);
                    }}
                  >
                    编辑
                  </Button>
                  <Button size="small" onClick={() => toggleUser(record.id)}>
                    {record.status === '启用' ? '停用' : '启用'}
                  </Button>
                </Space>
              )
            }
          ]}
        />
      </Card>
      <Modal open={open} title={editingUser ? '编辑用户' : '新增用户'} onCancel={() => setOpen(false)} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={saveUser} initialValues={{ role: '业务人员', department: '办公室' }}>
          <Form.Item label="账号" name="username" rules={[{ required: true, message: '请输入账号' }]}>
            <Input />
          </Form.Item>
          {!editingUser ? (
            <Form.Item label="初始密码" name="password" initialValue="admin123">
              <Input />
            </Form.Item>
          ) : null}
          <Form.Item label="姓名" name="name" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="部门" name="department" rules={[{ required: true, message: '请输入部门' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="角色" name="role" rules={[{ required: true, message: '请选择角色' }]}>
            <Select options={['管理员', '审核人', '业务人员'].map((item) => ({ value: item, label: item }))} />
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
