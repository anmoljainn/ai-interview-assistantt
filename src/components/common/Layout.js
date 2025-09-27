import React, { useState } from 'react';
import { Layout as AntLayout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  UserOutlined,
  DashboardOutlined,
} from '@ant-design/icons';

const { Header, Content, Sider } = AntLayout;

const LayoutComponent = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <UserOutlined />,
      label: 'Interviewee',
    },
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Interviewer Dashboard',
    },
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div className="logo" />
        <Menu
          theme="dark"
          defaultSelectedKeys={[location.pathname]}
          selectedKeys={[location.pathname]}
          mode="inline"
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <AntLayout>
        <Header style={{ padding: 0, background: '#fff' }} />
        <Content style={{ margin: '16px' }}>
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default LayoutComponent;