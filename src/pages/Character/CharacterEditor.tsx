import React from 'react';
import { Card, Form, Input, Button } from 'antd';

export const CharacterEditor: React.FC = () => {
  return (
    <div>
      <h1>角色设计</h1>
      <Card style={{ marginTop: 16 }}>
        <Form layout="vertical">
          <Form.Item label="角色名称">
            <Input placeholder="例如：龙眼龙" />
          </Form.Item>
          <Form.Item label="性格描述">
            <Input.TextArea rows={3} placeholder="例如：活泼可爱、善良勇敢" />
          </Form.Item>
          <Form.Item label="外观描述">
            <Input.TextArea rows={4} placeholder="例如：金黄色皮肤，圆润造型，大眼睛" />
          </Form.Item>
          <Form.Item>
            <Button type="primary">保存角色</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};