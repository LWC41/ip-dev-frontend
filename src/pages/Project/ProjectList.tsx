import React from 'react';
import { Card, Button, Table, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const projects = [
  { id: 1, name: '广西龙眼IP', fruit: '龙眼', status: '进行中', characters: 3, createdAt: '2026-04-01' },
  { id: 2, name: '海南芒果IP', fruit: '芒果', status: '已完成', characters: 5, createdAt: '2026-03-15' },
  { id: 3, name: '福建荔枝IP', fruit: '荔枝', status: '进行中', characters: 2, createdAt: '2026-03-28' },
];

const statusColors: Record<string, string> = {
  '进行中': 'blue',
  '已完成': 'green',
};

export const ProjectList: React.FC = () => {
  const navigate = useNavigate();

  const columns = [
    { title: '项目名称', dataIndex: 'name', key: 'name' },
    { title: '水果类型', dataIndex: 'fruit', key: 'fruit' },
    { title: '角色数', dataIndex: 'characters', key: 'characters' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (status: string) => <Tag color={statusColors[status]}>{status}</Tag> },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
    { title: '操作', key: 'action', render: (_: any, record: any) => <Button type="link" onClick={() => navigate(`/projects/${record.id}`)}>查看</Button> },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>项目管理</h1>
        <Button type="primary" icon={<PlusOutlined />}>新建项目</Button>
      </div>
      <Table dataSource={projects} columns={columns} rowKey="id" />
    </div>
  );
};