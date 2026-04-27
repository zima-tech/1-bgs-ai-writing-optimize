'use client';

import type { AuditLog } from '@prisma/client';
import { Card, Table, Tag } from 'antd';

export function AuditLogsView({ logs }: { logs: AuditLog[] }) {
  return (
    <Card className="panel-card" title="审计留痕">
      <Table
        rowKey="id"
        dataSource={logs}
        pagination={{ pageSize: 10 }}
        columns={[
          { title: '模块', dataIndex: 'module' },
          { title: '动作', dataIndex: 'action' },
          { title: '对象', dataIndex: 'objectType' },
          { title: '操作人', dataIndex: 'operator' },
          {
            title: '结果',
            dataIndex: 'result',
            render: (value) => <Tag color={value === '成功' ? 'success' : 'error'}>{value}</Tag>
          },
          { title: '业务摘要', dataIndex: 'summary' }
        ]}
      />
    </Card>
  );
}
