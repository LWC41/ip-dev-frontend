import React from 'react';
import { Layout, Menu, Avatar, Switch, Space, Tooltip } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined, ProjectOutlined, AppstoreOutlined,
  FileOutlined, SettingOutlined, BulbOutlined,
  BulbFilled, SunOutlined,
} from '@ant-design/icons';
import { useAppTheme } from '../../contexts/ThemeContext';

const { Header, Sider, Content } = Layout;

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggle } = useAppTheme();

  const isDark = mode === 'dark';

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
    { key: '/projects', icon: <ProjectOutlined />, label: '项目管理' },
    { key: '/content', icon: <AppstoreOutlined />, label: '内容创作' },
    { key: '/tasks', icon: <FileOutlined />, label: '任务管理' },
    { key: '/settings', icon: <SettingOutlined />, label: '设置' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* ── 顶部 Header ── */}
      <Header
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #312e81 0%, #4c1d95 50%, #581c87 100%)'
            : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: isDark
            ? '0 4px 24px rgba(0,0,0,0.4)'
            : '0 4px 24px rgba(99,102,241,0.25)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: 64,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              fontWeight: 700,
              color: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            IP
          </div>
          <span style={{ color: '#fff', fontSize: 20, fontWeight: 700, letterSpacing: 1 }}>
            IP 开发 Agent
          </span>
          <span
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: 12,
              marginLeft: 4,
              padding: '2px 8px',
              borderRadius: 20,
              background: 'rgba(255,255,255,0.1)',
            }}
          >
            v2.0
          </span>
        </div>

        {/* 主题切换 */}
        <Tooltip title={isDark ? '切换到亮色模式' : '切换到暗色模式'}>
          <Switch
            checked={isDark}
            onChange={toggle}
            checkedChildren={<BulbFilled style={{ color: '#fbbf24' }} />}
            unCheckedChildren={<SunOutlined />}
            style={{
              background: isDark ? '#4c1d95' : '#e0e7ff',
              border: isDark ? '1px solid #6d28d9' : 'none',
            }}
          />
        </Tooltip>
      </Header>

      <Layout>
        {/* ── 侧边栏 ── */}
        <Sider
          width={220}
          style={{
            background: 'transparent',
            borderRight: `1px solid ${isDark ? '#2a2a4a' : '#e8e8f0'}`,
            padding: '16px 0',
          }}
          theme={isDark ? 'dark' : 'light'}
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            onClick={({ key }) => navigate(key)}
            items={menuItems}
            style={{
              height: '100%',
              borderRight: 0,
              background: 'transparent',
              fontWeight: 500,
              fontSize: 14,
            }}
          />
        </Sider>

        {/* ── 内容区 ── */}
        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              background: isDark ? '#1e1e2e' : '#ffffff',
              padding: 28,
              margin: 0,
              minHeight: 280,
              borderRadius: 16,
              boxShadow: isDark
                ? '0 2px 16px rgba(0,0,0,0.3)'
                : '0 2px 16px rgba(0,0,0,0.06)',
              transition: 'background 0.3s, box-shadow 0.3s',
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};
