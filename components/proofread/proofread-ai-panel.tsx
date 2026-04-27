'use client';

import { Bubble, Conversations, Sender } from '@ant-design/x';
import type { ProofreadIssue, ProofreadTask } from '@prisma/client';
import { Card, Tag, Typography } from 'antd';
import { useMemo, useState } from 'react';

type ProofreadAIPanelProps = {
  tasks: (ProofreadTask & { issues: ProofreadIssue[] })[];
};

type LocalChat = {
  role: 'assistant' | 'user';
  content: string;
};

export function ProofreadAIPanel({ tasks }: ProofreadAIPanelProps) {
  const [activeKey, setActiveKey] = useState(tasks[0]?.id || '');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Record<string, LocalChat[]>>({});

  const activeTask = tasks.find((item) => item.id === activeKey) || tasks[0];
  const conversationItems = useMemo(
    () =>
      tasks.map((item) => ({
        key: item.id,
        label: item.title,
        group: item.status
      })),
    [tasks]
  );

  const currentMessages =
    messages[activeTask?.id || ''] ||
    (activeTask
      ? [
          {
            role: 'assistant' as const,
            content: `【任务理解】已读取《${activeTask.title}》的校对结果，当前共识别 ${activeTask.issues.length} 处问题。`
          },
          {
            role: 'assistant' as const,
            content: `【结果说明】${activeTask.summary}`
          }
        ]
      : []);

  function submitPrompt(value: string) {
    if (!activeTask || !value.trim()) return;

    setMessages((current) => ({
      ...current,
      [activeTask.id]: [
        ...(current[activeTask.id] || currentMessages),
        { role: 'user', content: value },
        {
          role: 'assistant',
          content: `【继续追问】针对“${value}”，建议优先处理${activeTask.issues[0]?.issueType || '结构规范'}问题，再复核敏感词与表述一致性。`
        }
      ]
    }));
    setInput('');
  }

  return (
    <Card className="panel-card" title="校对助手会话" extra={<Tag color="processing">Ant Design X</Tag>}>
      <div className="panel-body" style={{ display: 'grid', gap: 16 }}>
        <Typography.Paragraph className="muted" style={{ marginBottom: 0 }}>
          通过任务会话切换，查看每份材料的校对摘要、问题重点和继续修订建议。
        </Typography.Paragraph>
        <Conversations items={conversationItems} activeKey={activeTask?.id} onActiveChange={setActiveKey} groupable />
        <Bubble.List
          items={currentMessages.map((item, index) => ({
            key: `${activeTask?.id}-${index}`,
            role: item.role,
            content: item.content
          }))}
          roles={{
            assistant: { placement: 'start' },
            user: { placement: 'end' }
          }}
          autoScroll
          style={{ maxHeight: 260, overflowY: 'auto' }}
        />
        <Sender value={input} onChange={(value) => setInput(value)} onSubmit={submitPrompt} placeholder="继续追问修改口径、风险说明或定稿建议" />
      </div>
    </Card>
  );
}
