'use client';

import { Bubble, Conversations, Sender } from '@ant-design/x';
import type { ConversationMessage, WritingDocument } from '@prisma/client';
import { App, Card, Tag, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type WritingAIProps = {
  documents: (WritingDocument & { messages: ConversationMessage[] })[];
};

export function WritingAIPanel({ documents }: WritingAIProps) {
  const router = useRouter();
  const { message } = App.useApp();
  const [activeKey, setActiveKey] = useState(documents[0]?.id || '');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [localMessages, setLocalMessages] = useState<Record<string, ConversationMessage[]>>({});

  const activeDocument = documents.find((item) => item.id === activeKey) || documents[0];

  const conversationItems = useMemo(
    () =>
      documents.map((item) => ({
        key: item.id,
        label: item.title,
        group: item.status,
        timestamp: new Date(item.updatedAt).getTime()
      })),
    [documents]
  );

  const mergedMessages = activeDocument
    ? localMessages[activeDocument.id] || activeDocument.messages
    : [];

  async function submitPrompt(value: string) {
    if (!activeDocument || !value.trim()) return;

    setLoading(true);

    const response = await fetch('/api/writing/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentId: activeDocument.id,
        prompt: value,
        content: activeDocument.content
      })
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      message.error(result.message || '追问失败，请稍后再试。');
      return;
    }

    setLocalMessages((current) => ({
      ...current,
      [activeDocument.id]: result.messages
    }));
    setInput('');
    router.refresh();
  }

  return (
    <Card className="panel-card" title="写作助手会话" extra={<Tag color="processing">Ant Design X</Tag>}>
      <div className="panel-body" style={{ display: 'grid', gap: 16 }}>
        <Typography.Paragraph className="muted" style={{ marginBottom: 0 }}>
          当前会话绑定具体文稿对象，支持历史切换、业务化阶段说明和继续追问。
        </Typography.Paragraph>
        <Conversations items={conversationItems} activeKey={activeDocument?.id} onActiveChange={setActiveKey} groupable />
        <Bubble.List
          items={mergedMessages.map((item) => ({
            key: item.id,
            role: item.role === 'user' ? 'user' : 'assistant',
            content: `${item.stage ? `【${item.stage}】` : ''}${item.content}`
          }))}
          autoScroll
          roles={{
            assistant: { placement: 'start' },
            user: { placement: 'end' }
          }}
          style={{ maxHeight: 320, overflowY: 'auto' }}
        />
        <Sender
          value={input}
          onChange={(value) => setInput(value)}
          onSubmit={submitPrompt}
          loading={loading}
          placeholder="继续追问写作结构、风格优化、补充要点或定稿建议"
        />
      </div>
    </Card>
  );
}
