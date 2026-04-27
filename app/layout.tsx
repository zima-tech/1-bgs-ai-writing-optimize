import { AntdRegistry } from '@ant-design/nextjs-registry';
import { App, ConfigProvider } from 'antd';
import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: '智能写稿优化和校对',
  description: '办公室智能写作、材料校对与治理管理系统'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#1358db',
                borderRadius: 12,
                colorBgLayout: '#eef3f8'
              }
            }}
          >
            <App>{children}</App>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
