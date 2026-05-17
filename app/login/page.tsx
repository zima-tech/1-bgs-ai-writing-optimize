import { AuditOutlined, BulbOutlined, CheckCircleOutlined, FileProtectOutlined, FileTextOutlined } from '@ant-design/icons';
import { Space, Tag } from 'antd';
import { redirect } from 'next/navigation';

import { LoginForm } from '@/components/ui/login-form';
import { LoginTrail } from '@/components/ui/login-trail';
import { getCurrentUser } from '@/lib/auth';

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect('/writing');
  }

  return (
    <div className="login-screen">
      <LoginTrail />
      <div className="login-card">
        <div className="login-cover">
          <div className="login-cover-topline">
            <Tag color="blue">办公室智能支持</Tag>
            <span>AI Writing Console</span>
          </div>
          <h1>智能写稿优化和校对</h1>
          <p>面向办公室材料写作、结构优化、正文润色与全流程校对的智能工作台。</p>
          <div className="login-metric-grid">
            <div>
              <strong>6</strong>
              <span>类常用文稿模板</span>
            </div>
            <div>
              <strong>30</strong>
              <span>条近期审计留痕</span>
            </div>
            <div>
              <strong>AI</strong>
              <span>生成、润色、校对闭环</span>
            </div>
          </div>
          <div className="login-capability-list">
            {[
              [<FileTextOutlined key="writing" />, '材料起草', '围绕报告、通知、纪要、函件快速形成正式初稿。'],
              [<FileProtectOutlined key="proofread" />, '文字校对', '覆盖错别字、语法、格式、敏感词和逻辑一致性核验。'],
              [<AuditOutlined key="audit" />, '治理留痕', '生成、保存、校对和修订动作进入可追溯日志。']
            ].map(([icon, title, description]) => (
              <div className="login-capability" key={String(title)}>
                <span>{icon}</span>
                <div>
                  <strong>{title}</strong>
                  <p>{description}</p>
                </div>
                <CheckCircleOutlined />
              </div>
            ))}
          </div>
          <Space className="login-cover-footer" size="large">
            <Space><FileTextOutlined /> 模板写稿</Space>
            <Space><BulbOutlined /> 智能优化</Space>
          </Space>
        </div>
        <div className="login-form-panel">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
