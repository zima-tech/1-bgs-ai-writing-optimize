'use client';

import { CheckCircleOutlined, FileSearchOutlined, SaveOutlined } from '@ant-design/icons';
import type { ProofreadIssue, ProofreadTask } from '@prisma/client';
import { App, Button, Card, Col, Form, Input, List, Row, Space, Statistic, Tag, Typography } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ProofreadAIPanel } from '@/components/proofread/proofread-ai-panel';

type ProofreadWorkspaceProps = {
  tasks: (ProofreadTask & { issues: ProofreadIssue[] })[];
};

export function ProofreadWorkspace({ tasks }: ProofreadWorkspaceProps) {
  const { message } = App.useApp();
  const router = useRouter();
  const [form] = Form.useForm();
  const [issues, setIssues] = useState<ProofreadIssue[]>(tasks[0]?.issues || []);
  const [reviewedContent, setReviewedContent] = useState(tasks[0]?.reviewedContent || '');
  const [summary, setSummary] = useState(tasks[0]?.summary || '');
  const [loading, setLoading] = useState('');

  const stats = useMemo(
    () => [
      { title: '校对任务', value: tasks.length, suffix: '项' },
      { title: '高风险问题', value: tasks.flatMap((item) => item.issues).filter((issue) => issue.severity === '高').length, suffix: '处' },
      { title: '已复核', value: tasks.filter((item) => item.status === '已复核').length, suffix: '项' }
    ],
    [tasks]
  );

  async function runProofread() {
    const values = await form.validateFields();
    setLoading('run');
    const response = await fetch('/api/proofread/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });
    const result = await response.json();
    setLoading('');

    if (!response.ok) {
      message.error(result.message || '校对失败，请稍后再试。');
      return;
    }

    setIssues(result.issues);
    setReviewedContent(result.reviewedContent);
    setSummary(result.summary);
    message.success('校对结果已生成。');
  }

  async function saveProofread() {
    const values = await form.validateFields();
    setLoading('save');
    const response = await fetch('/api/proofread/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, reviewedContent, summary, issues })
    });
    const result = await response.json();
    setLoading('');

    if (!response.ok) {
      message.error(result.message || '保存失败，请稍后再试。');
      return;
    }

    message.success('校对结果已保存。');
    router.refresh();
  }

  return (
    <App>
      <div className="page-stack">
        <div className="page-hero">
          <Typography.Title level={3} style={{ marginTop: 0 }}>
            材料智能校对台
          </Typography.Title>
          <Typography.Paragraph className="muted">
            对正式材料执行错别字、语法、格式、敏感词和逻辑一致性识别，并将修订建议和风险等级形成台账。
          </Typography.Paragraph>
          <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
            {stats.map((item) => (
              <Card key={item.title} className="panel-card">
                <Statistic title={item.title} value={item.value} suffix={item.suffix} />
              </Card>
            ))}
          </div>
        </div>

        <Row gutter={20}>
          <Col xs={24} xl={14}>
            <Card className="panel-card" title="待校对材料" extra={<Tag color="warning">校对输入</Tag>}>
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  title: '关于办公室重点工作的总结材料',
                  sourceType: '手动录入',
                  content: '关于办公室重点工作的总结材料\n\n做为年度重点工作，我部通过学习考察形成了专题材料，请尽快报送。'
                }}
              >
                <Form.Item label="材料标题" name="title" rules={[{ required: true, message: '请输入材料标题' }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="来源方式" name="sourceType">
                  <Input />
                </Form.Item>
                <Form.Item label="材料内容" name="content" rules={[{ required: true, message: '请输入材料内容' }]}>
                  <TextArea rows={18} />
                </Form.Item>
                <Space>
                  <Button type="primary" icon={<FileSearchOutlined />} onClick={runProofread} loading={loading === 'run'}>
                    开始校对
                  </Button>
                  <Button icon={<SaveOutlined />} onClick={saveProofread} loading={loading === 'save'}>
                    保存结果
                  </Button>
                </Space>
              </Form>
            </Card>
          </Col>
          <Col xs={24} xl={10}>
            <div className="page-stack">
              <ProofreadAIPanel tasks={tasks} />
              <Card className="panel-card" title="校对结果摘要" extra={<Tag color="success">结果输出</Tag>}>
                <div className="panel-body">
                  <Typography.Paragraph>{summary || '运行校对后将在此显示结果摘要。'}</Typography.Paragraph>
                  <Typography.Title level={5}>修订后建议稿</Typography.Title>
                  <div className="editor-area" style={{ minHeight: 160 }}>
                    {reviewedContent || '暂无修订后内容'}
                  </div>
                </div>
              </Card>
              <Card className="panel-card" title="问题明细" extra={<Tag>{issues.length} 处</Tag>}>
                <div className="panel-body proofread-result">
                  {issues.length === 0 ? (
                    <Typography.Text className="muted">暂无问题明细。</Typography.Text>
                  ) : (
                    issues.map((issue) => (
                      <div className="issue-item" key={issue.id}>
                        <Space style={{ marginBottom: 8 }}>
                          <Tag color={issue.severity === '高' ? 'error' : issue.severity === '中' ? 'warning' : 'default'}>
                            {issue.issueType}
                          </Tag>
                          <Tag>{issue.severity}</Tag>
                        </Space>
                        <Typography.Text strong>{issue.originalText || '结构性问题'}</Typography.Text>
                        <Typography.Paragraph style={{ marginTop: 8, marginBottom: 8 }}>
                          建议：{issue.suggestion}
                        </Typography.Paragraph>
                        <Typography.Text className="muted">{issue.reason}</Typography.Text>
                      </div>
                    ))
                  )}
                </div>
              </Card>
              <Card className="panel-card" title="历史校对任务">
                <List
                  dataSource={tasks.slice(0, 8)}
                  renderItem={(task) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<CheckCircleOutlined style={{ color: '#1358db' }} />}
                        title={
                          <Space>
                            <span>{task.title}</span>
                            <Tag color={task.status === '已复核' ? 'success' : 'default'}>{task.status}</Tag>
                          </Space>
                        }
                        description={`${task.riskLevel}风险｜${task.issues.length} 处问题`}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </App>
  );
}
