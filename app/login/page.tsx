import { BulbOutlined, CheckCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { Card, Col, Row, Space, Tag } from 'antd';

import { LoginForm } from '@/components/ui/login-form';

export default function LoginPage() {
  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-cover">
          <Tag color="blue" style={{ marginBottom: 18 }}>
            办公室智能支持
          </Tag>
          <h1 style={{ color: '#fff', marginTop: 0, marginBottom: 18, fontSize: 40, lineHeight: 1.2 }}>
            智能写稿优化和校对
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 16, lineHeight: 1.8 }}>
            面向办公室材料写作、结构优化、正文润色与全流程校对的业务化智能工作台。
          </p>
          <Row gutter={[16, 16]} style={{ marginTop: 28 }}>
            {[
              ['写稿提效', '围绕工作报告、通知、纪要、函件等模板快速形成初稿。'],
              ['校对提质', '覆盖错别字、语法、格式、敏感词和逻辑一致性核验。'],
              ['治理可追溯', '每次生成、保存、校对和修订都形成业务留痕。']
            ].map(([title, description]) => (
              <Col span={24} key={title}>
                <Card
                  style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.16)' }}
                  bodyStyle={{ padding: 18 }}
                >
                  <Space align="start">
                    <CheckCircleOutlined style={{ color: '#d6ebff', marginTop: 3 }} />
                    <div>
                      <h3 style={{ color: '#fff', marginTop: 0, marginBottom: 8 }}>{title}</h3>
                      <p style={{ color: 'rgba(255,255,255,0.76)', marginBottom: 0, lineHeight: 1.7 }}>{description}</p>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
          <Space size="large" style={{ marginTop: 32, color: 'rgba(255,255,255,0.82)' }}>
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
