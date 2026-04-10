import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { ProjectOutlined, TeamOutlined, FileOutlined, CheckCircleOutlined } from '@ant-design/icons';

export const Dashboard: React.FC = () => {
  return (
    <div>
      <h1>仪表盘</h1>
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="项目数量" value={12} prefix={<ProjectOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="角色数量" value={28} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="内容素材" value={156} prefix={<FileOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="完成任务" value={89} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="最近项目">
            <p>广西龙眼IP - 进行中</p>
            <p>海南芒果IP - 已完成</p>
            <p>福建荔枝IP - 进行中</p>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="待处理任务">
            <p>生成3D模型 x 3</p>
            <p>制作表情包 x 5</p>
            <p>审核内容 x 2</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};