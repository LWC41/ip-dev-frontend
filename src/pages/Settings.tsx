import React, { useEffect } from 'react';
import { Card, Form, Input, Button, message, Divider, Typography, Tag, Alert, Row, Col, Tooltip } from 'antd';
import { KeyOutlined, InfoCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { saveApiKeys, loadApiKeys } from '../store/imageGenApi';

const { Title, Text, Link } = Typography;

interface ApiKeyConfig {
  field: string;
  label: string;
  description: string;
  placeholder: string;
  docUrl: string;
  tag: string;
  tagColor: string;
  usedFor: string[];
}

const API_KEY_CONFIGS: ApiKeyConfig[] = [
  {
    field: 'deepseek',
    label: 'DeepSeek API Key',
    description: '用于生成专业的文生图提示词（提示词工程师角色）',
    placeholder: 'sk-xxxxxxxxxxxxxxxx',
    docUrl: 'https://platform.deepseek.com/api_keys',
    tag: 'LLM',
    tagColor: '#4D6BFE',
    usedFor: ['提示词生成'],
  },
  {
    field: 'kimi',
    label: 'Kimi (Moonshot) API Key',
    description: '月之暗面 Kimi，长文理解强，生成细腻的角色提示词',
    placeholder: 'sk-xxxxxxxxxxxxxxxx',
    docUrl: 'https://platform.moonshot.cn/console/api-keys',
    tag: 'LLM',
    tagColor: '#00B96B',
    usedFor: ['提示词生成'],
  },
  {
    field: 'doubao',
    label: '豆包 / 火山引擎 API Key',
    description: '字节跳动，同时用于提示词生成（豆包LLM）和文生图（Seedream 3.0）',
    placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    docUrl: 'https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey',
    tag: 'LLM + 文生图',
    tagColor: '#1677FF',
    usedFor: ['提示词生成', '豆包Seedream文生图'],
  },
  {
    field: 'aliyun',
    label: '阿里云百炼 API Key',
    description: '同时驱动 FLUX.1-dev 和通义万相2.1 两个文生图模型',
    placeholder: 'sk-xxxxxxxxxxxxxxxx',
    docUrl: 'https://bailian.console.aliyun.com/?apiKey=1',
    tag: '文生图',
    tagColor: '#FA8C16',
    usedFor: ['FLUX.1-dev 文生图', '通义万相2.1 文生图'],
  },
  {
    field: 'stabilityai',
    label: 'Stability AI API Key',
    description: 'Stable Diffusion 3.5，对提示词遵从度最高，画面不跑偏',
    placeholder: 'sk-xxxxxxxxxxxxxxxx',
    docUrl: 'https://platform.stability.ai/account/keys',
    tag: '文生图',
    tagColor: '#1890FF',
    usedFor: ['SD 3.5 文生图'],
  },
];

const MODEL_COVERAGE = [
  {
    name: 'FLUX.1-dev',
    key: 'aliyun',
    color: '#722ED1',
    desc: '12B参数，业界最强开源，角色还原度高',
  },
  {
    name: '通义万相2.1',
    key: 'aliyun',
    color: '#FA8C16',
    desc: '中文理解强，国风/卡通表现优秀',
  },
  {
    name: '豆包 Seedream 3.0',
    key: 'doubao',
    color: '#13C2C2',
    desc: 'IP角色与品牌化场景，高美感',
  },
  {
    name: 'Stable Diffusion 3.5',
    key: 'stabilityai',
    color: '#1890FF',
    desc: '构图精准，提示词遵从度最高',
  },
];

export const Settings: React.FC = () => {
  const [form] = Form.useForm();

  useEffect(() => {
    const keys = loadApiKeys();
    form.setFieldsValue(keys);
  }, [form]);

  const onFinish = (values: any) => {
    // 过滤空字符串
    const filtered = Object.fromEntries(
      Object.entries(values).filter(([, v]) => v && String(v).trim())
    );
    saveApiKeys(filtered as any);
    message.success('API Key 已保存到本地');
  };

  const checkConfigured = (field: string) => {
    const keys = loadApiKeys();
    return !!(keys as any)[field];
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <Title level={3}>⚙️ 系统设置</Title>

      {/* 文生图模型覆盖说明 */}
      <Card style={{ marginBottom: 24, background: '#f6ffed', borderColor: '#b7eb8f' }}>
        <Text strong>🎨 已集成的文生图模型</Text>
        <Row gutter={12} style={{ marginTop: 12 }}>
          {MODEL_COVERAGE.map(m => (
            <Col span={6} key={m.name}>
              <Card
                size="small"
                style={{ borderColor: `${m.color}60`, textAlign: 'center' }}
              >
                <Tag color={m.color}>{m.name}</Tag>
                <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{m.desc}</div>
                <div style={{ marginTop: 6 }}>
                  {checkConfigured(m.key)
                    ? <Tag color="success" icon={<CheckCircleOutlined />}>已配置</Tag>
                    : <Tag color="default">未配置</Tag>
                  }
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Alert
        type="info"
        showIcon
        message="API Key 安全说明"
        description="所有 API Key 仅存储在您浏览器的 localStorage 中，不会上传到任何服务器。建议使用低权限子账号 Key。"
        style={{ marginBottom: 24 }}
      />

      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* LLM 提示词生成 Key */}
        <Card
          title={<><Tag color="blue">LLM</Tag> 提示词生成模型（DeepSeek / 豆包 / Kimi）</>}
          style={{ marginBottom: 16 }}
        >
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            配置后，内容创作页会自动调用这些模型分析角色特征，生成专业的英文文生图提示词。至少配置1个即可。
          </Text>
          <Row gutter={16}>
            {API_KEY_CONFIGS.slice(0, 3).map(cfg => (
              <Col span={8} key={cfg.field}>
                <Form.Item
                  name={cfg.field}
                  label={
                    <span>
                      <Tag color={cfg.tagColor} style={{ marginRight: 4 }}>{cfg.tag}</Tag>
                      {cfg.label}
                      {checkConfigured(cfg.field) && (
                        <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 4 }} />
                      )}
                    </span>
                  }
                >
                  <Input.Password
                    placeholder={cfg.placeholder}
                    prefix={<KeyOutlined style={{ color: cfg.tagColor }} />}
                    suffix={
                      <Tooltip title={cfg.description}>
                        <InfoCircleOutlined style={{ color: '#888' }} />
                      </Tooltip>
                    }
                  />
                </Form.Item>
                <div style={{ marginTop: -16, marginBottom: 12 }}>
                  <Link href={cfg.docUrl} target="_blank" style={{ fontSize: 11 }}>
                    🔑 获取 API Key →
                  </Link>
                </div>
              </Col>
            ))}
          </Row>
        </Card>

        {/* 文生图 Key */}
        <Card
          title={<><Tag color="purple">文生图</Tag> 图像生成模型 API Key</>}
          style={{ marginBottom: 16 }}
        >
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            配置后，内容创作页会并发调用这些模型生成图片，未配置的模型会自动跳过。建议至少配置2个以便对比。
          </Text>
          <Row gutter={16}>
            {API_KEY_CONFIGS.slice(2).map(cfg => (
              <Col span={8} key={cfg.field}>
                <Form.Item
                  name={cfg.field}
                  label={
                    <span>
                      <Tag color={cfg.tagColor} style={{ marginRight: 4 }}>{cfg.tag}</Tag>
                      {cfg.label}
                      {checkConfigured(cfg.field) && (
                        <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 4 }} />
                      )}
                    </span>
                  }
                >
                  <Input.Password
                    placeholder={cfg.placeholder}
                    prefix={<KeyOutlined style={{ color: cfg.tagColor }} />}
                    suffix={
                      <Tooltip title={cfg.description}>
                        <InfoCircleOutlined style={{ color: '#888' }} />
                      </Tooltip>
                    }
                  />
                </Form.Item>
                <div style={{ marginTop: -16, marginBottom: 4 }}>
                  {cfg.usedFor.map(u => <Tag key={u} style={{ fontSize: 10 }}>{u}</Tag>)}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <Link href={cfg.docUrl} target="_blank" style={{ fontSize: 11 }}>
                    🔑 获取 API Key →
                  </Link>
                </div>
              </Col>
            ))}
          </Row>
        </Card>

        <Divider />

        {/* 原有 Meshy 设置 */}
        <Card title="🧊 3D 模型生成（Meshy AI）" style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Meshy API Key" name="meshy">
                <Input.Password
                  placeholder="请输入 Meshy API 密钥"
                  prefix={<KeyOutlined />}
                />
              </Form.Item>
              <Link href="https://www.meshy.ai" target="_blank" style={{ fontSize: 11 }}>
                🔑 获取 Meshy API Key →
              </Link>
            </Col>
          </Row>
        </Card>

        <Form.Item>
          <Button type="primary" htmlType="submit" size="large" icon={<CheckCircleOutlined />}>
            保存所有设置
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
