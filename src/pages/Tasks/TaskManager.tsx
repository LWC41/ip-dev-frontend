import React from 'react';
import { Card, Table, Tag } from 'antd';

const tasks = [
  { id: 1, name: '生成3D模型', project: '广西龙眼IP', status: '进行中', createdAt: '2026-04-05' },
  { id: 2, name: '制作表情包', project: '海南芒果IP', status: '已完成', createdAt: '2026-04-03' },
  { id: 3, name: '生成海报', project: '福建荔枝IP', status: '排队中', createdAt: '2026-04-06' },
];

const statusColors: Record<string, string> = {
  '进行中': 'blue',
  '已完成': 'green',
  '排队中': 'orange',
};

export const TaskManager: React.FC = () => {
  const columns = [
    { title: '任务名称', dataIndex: 'name', key: 'name' },
    { title: '所属项目', dataIndex: 'project', key: 'project' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (status: string) => <Tag color={statusColors[status]}>{status}</Tag> },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
  ];

  return (
    <div>
      <h1>任务管理</h1>
      <Table dataSource={tasks} columns={columns} rowKey="id" style={{ marginTop: 16 }} />
    </div>
  );
};