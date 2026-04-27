'use client';

import { BulbOutlined, FileTextOutlined, SaveOutlined } from '@ant-design/icons';
import type { AuditLog, ConversationMessage, WritingDocument, WritingTemplate } from '@prisma/client';
import { App, Button, Card, Col, Empty, Form, Input, InputNumber, List, Row, Select, Space, Statistic, Tag, Timeline, Typography } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { WritingAIPanel } from '@/components/writing/writing-ai-panel';

type WritingWorkspaceProps = {
  templates: WritingTemplate[];
  documents: (WritingDocument & { template: WritingTemplate | null; messages: ConversationMessage[] })[];
  logs: AuditLog[];
};

export function WritingWorkspace({ templates, documents, logs }: WritingWorkspaceProps) {
  const { message } = App.useApp();
  const router = useRouter();
  const [form] = Form.useForm();
  const [content, setContent] = useState(documents[0]?.content || '');
  const [outline, setOutline] = useState(documents[0]?.outline || '');
  const [summary, setSummary] = useState(documents[0]?.summary || '');
  const [loading, setLoading] = useState('');

  const stats = useMemo(
    () => [
      { title: '文稿台账', value: documents.length, suffix: '份' },
      { title: '启用模板', value: templates.length, suffix: '类' },
      { title: '今日留痕', value: logs.length, suffix: '条' },
      { title: '已定稿', value: documents.filter((item) => item.status === '已定稿').length, suffix: '份' }
    ],
    [documents, logs.length, templates.length]
  );

  async function callApi(url: string, payload: Record<string, unknown>, successMessage: string) {
    setLoading(url);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    setLoading('');

    if (!response.ok) {
      message.error(result.message || '处理失败，请稍后再试。');
      return null;
    }

    message.success(successMessage);
    return result;
  }

  async function generateDraft() {
    const values = await form.validateFields();
    const result = await callApi('/api/writing/generate', values, '初稿已生成。');
    if (!result) return;
    setContent(result.content);
    setSummary(result.summary || '已基于当前任务生成初稿。');
  }

  async function generateOutline() {
    const values = await form.validateFields(['title', 'keywords', 'requirements']);
    const result = await callApi(
      '/api/writing/outline',
      { topic: values.title || values.keywords, requirements: values.requirements },
      '提纲已生成。'
    );
    if (!result) return;
    setOutline(result.outline);
  }

  async function optimizeDraft() {
    const values = await form.validateFields(['tone']);
    const result = await callApi('/api/writing/optimize', { content, tone: values.tone }, '文稿已优化。');
    if (!result) return;
    setContent(result.content);
  }

  async function saveDraft() {
    const values = await form.validateFields();
    const result = await callApi(
      '/api/writing/save',
      { ...values, content, outline, summary },
      '文稿已保存并写入台账。'
    );
    if (!result) return;
    router.refresh();
  }

  return (
    <App>
      <div className="page-stack">
        <div className="page-hero">
          <Typography.Title level={3} style={{ marginTop: 0 }}>
            办公材料智能写作台
          </Typography.Title>
          <Typography.Paragraph className="muted">
            按模板选材、智能起草、结构优化、会话追问和定稿保存一体推进，所有写稿动作同步沉淀台账与审计留痕。
          </Typography.Paragraph>
          <div className="summary-grid">
            {stats.map((item) => (
              <Card key={item.title} className="panel-card">
                <Statistic title={item.title} value={item.value} suffix={item.suffix} />
              </Card>
            ))}
          </div>
        </div>

        <div className="workspace-grid">
          <Card className="panel-card" title="模板与参数" extra={<Tag color="processing">智能写作</Tag>}>
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                title: '关于办公室重点任务推进情况的报告',
                type: '工作报告',
                keywords: '重点任务推进、督办落实、流程优化',
                requirements: '突出执行结果、节点安排和下一步计划，控制在 1200 字左右。',
                tone: '正式稳健',
                wordCount: 1200,
                templateId: templates[0]?.id
              }}
            >
              <Form.Item label="模板" name="templateId">
                <Select
                  options={templates.map((item) => ({
                    value: item.id,
                    label: `${item.name}｜${item.description}`
                  }))}
                />
              </Form.Item>
              <Form.Item label="文稿标题" name="title" rules={[{ required: true, message: '请输入标题' }]}>
                <Input />
              </Form.Item>
              <Form.Item label="文稿类型" name="type" rules={[{ required: true, message: '请选择文稿类型' }]}>
                <Select options={['工作报告', '会议纪要', '通知', '函', '讲话稿', '简报'].map((item) => ({ value: item, label: item }))} />
              </Form.Item>
              <Form.Item label="关键词" name="keywords" rules={[{ required: true, message: '请输入关键词' }]}>
                <Input />
              </Form.Item>
              <Form.Item label="写作要求" name="requirements">
                <TextArea rows={4} />
              </Form.Item>
              <Row gutter={12}>
                <Col span={14}>
                  <Form.Item label="表达风格" name="tone">
                    <Select options={['正式稳健', '简洁明晰', '汇报口径', '领导讲话风格'].map((item) => ({ value: item, label: item }))} />
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item label="目标字数" name="wordCount">
                    <InputNumber min={500} max={5000} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Space wrap>
                <Button type="primary" icon={<FileTextOutlined />} loading={loading === '/api/writing/generate'} onClick={generateDraft}>
                  生成初稿
                </Button>
                <Button loading={loading === '/api/writing/outline'} onClick={generateOutline}>
                  生成提纲
                </Button>
                <Button icon={<BulbOutlined />} loading={loading === '/api/writing/optimize'} onClick={optimizeDraft}>
                  风格优化
                </Button>
                <Button icon={<SaveOutlined />} loading={loading === '/api/writing/save'} onClick={saveDraft}>
                  保存文稿
                </Button>
              </Space>
            </Form>
          </Card>

          <div className="page-stack">
            <Card className="panel-card" title="文稿编辑区" extra={<Tag color="blue">可继续编辑</Tag>}>
              <div className="panel-body">
                <TextArea rows={18} value={content} onChange={(event) => setContent(event.target.value)} />
              </div>
            </Card>
            <Card className="panel-card" title="结构提纲与摘要">
              <div className="panel-body">
                <Typography.Title level={5}>提纲</Typography.Title>
                <div className="editor-area" style={{ minHeight: 160 }}>{outline || '请先生成提纲。'}</div>
                <Typography.Title level={5} style={{ marginTop: 20 }}>摘要</Typography.Title>
                <div className="editor-area" style={{ minHeight: 120 }}>{summary || '生成初稿后将在此沉淀摘要。'}</div>
              </div>
            </Card>
          </div>

          <div className="page-stack">
            <WritingAIPanel documents={documents.map((item) => ({ ...item, messages: item.messages }))} />
            <Card className="panel-card" title="历史文稿台账" extra={<Tag>{documents.length} 份</Tag>}>
              <List
                dataSource={documents.slice(0, 8)}
                locale={{ emptyText: <Empty description="暂无历史文稿" /> }}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <span>{item.title}</span>
                          <Tag color={item.status === '已定稿' ? 'success' : 'default'}>{item.status}</Tag>
                        </Space>
                      }
                      description={`${item.type}｜${item.tone}｜${item.template?.name || '通用模板'}`}
                    />
                  </List.Item>
                )}
              />
            </Card>
            <Card className="panel-card" title="最近写稿留痕">
              <Timeline
                items={logs.map((log) => ({
                  children: `${log.module}｜${log.action}｜${log.summary}`
                }))}
              />
            </Card>
          </div>
        </div>
      </div>
    </App>
  );
}
