import React from 'react';
import { Card, Descriptions, Button, Tabs } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';

export const ProjectDetail: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <Button onClick={() => navigate('/projects')} style={{ marginBottom: 16 }}>返回</Button>
      <Card title="项目详情">
        <Descriptions>
          <Descriptions.Item label="项目ID">{projectId}</Descriptions.Item>
          <Descriptions.Item label="项目名称">广西龙眼IP</Descriptions.Item>
          <Descriptions.Item label="水果类型">龙眼</Descriptions.Item>
          <Descriptions.Item label="目标受众">儿童</Descriptions.Item>
          <Descriptions.Item label="设计风格">可爱</Descriptions.Item>
          <Descriptions.Item label="创建时间">2026-04-01</Descriptions.Item>
        </Descriptions>
      </Card>
      
      <Tabs style={{ marginTop: 16 }} items={[
        { key: '1', label: '角色列表', children: <div><Button type="primary">新建角色</Button><p style={{ marginTop: 16 }}>暂无角色，请创建第一个角色</p></div> },
        { key: '2', label: '3D模型', children: <div><Button onClick={() => navigate(`/3d/${projectId}`)}>3D预览</Button></div> },
        { key: '3', label: '内容素材', children: <div><Button onClick={() => navigate('/content')}>内容创作</Button></div> },
      ]} />
    </div>
  );
};