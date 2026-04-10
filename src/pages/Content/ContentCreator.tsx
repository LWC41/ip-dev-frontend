import React, { useState, useCallback } from 'react';
import {
  Card, Button, Input, Select, Steps, Row, Col, Tag, Tooltip,
  Spin, Alert, Divider, Typography, Space, Form, Image, Badge,
  Collapse, message, Empty, Tabs, ColorPicker,
} from 'antd';
import {
  RobotOutlined, BulbOutlined, PictureOutlined, ReloadOutlined,
  CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined,
  StarOutlined, StarFilled, InfoCircleOutlined, CopyOutlined,
  UserOutlined, EyeOutlined, HeartOutlined, BookOutlined, CameraOutlined,
  ThunderboltOutlined, SunOutlined, MoonOutlined,
} from '@ant-design/icons';
import {
  generatePrompts, generateImage, loadApiKeys,
  IMAGE_MODELS, CharacterInput, PromptResult, ImageResult,
  LLMProvider, ImageModel, ClassicPose, POSE_DESCRIPTIONS,
} from '../../store/imageGenApi';
import { useAppTheme, ThemeMode } from '../../contexts/ThemeContext';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// ── LLM provider 元信息 ──
const LLM_PROVIDERS: { id: LLMProvider; label: string; color: string; gradient: string; description: string }[] = [
  { id: 'deepseek', label: 'DeepSeek',  color: '#4D6BFE', gradient: 'linear-gradient(135deg, #4D6BFE, #7B93FF)', description: '推理能力强，提示词逻辑严谨' },
  { id: 'doubao',   label: '豆包',      color: '#1677FF', gradient: 'linear-gradient(135deg, #1677FF, #69B1FF)', description: '字节出品，贴近东方审美' },
  { id: 'kimi',     label: 'Kimi',      color: '#00B96B', gradient: 'linear-gradient(135deg, #00B96B, #36CFC9)', description: '长文理解佳，描述细腻' },
];

const STYLE_OPTIONS = [
  { value: 'cute cartoon chibi Q-version',  label: '🎀 Q版卡通（推荐）' },
  { value: 'anime illustration',             label: '✨ 日系动漫' },
  { value: 'flat illustration vector',       label: '🎨 扁平插画' },
  { value: 'watercolor painting',            label: '🖌️ 水彩画风' },
  { value: 'chibi super deformed',           label: '🌟 超Q版' },
  { value: 'chinese traditional painting',  label: '🏮 国风水墨' },
  { value: 'pixel art',                      label: '👾 像素风' },
];

const SCENE_OPTIONS = [
  { value: '', label: '🏳️ 纯白背景（默认）' },
  { value: 'in a sunlit longan orchard, golden afternoon light, lush green leaves', label: '🌿 龙眼果园' },
  { value: 'beside a clear mountain stream with colorful wildflowers', label: '🏞️ 小溪边' },
  { value: 'sweet fruit town square under a giant banyan tree with lanterns', label: '🏮 甜心镇广场' },
  { value: 'cozy wooden cabin interior with warm yellow light and fruit books', label: '🏠 爷爷木屋' },
  { value: 'candy land with pastel colors and sweet decorations', label: '🍭 糖果乐园' },
  { value: 'ancient Chinese garden with lotus pond', label: '🎋 中式庭院' },
];

const POSE_OPTIONS: { value: ClassicPose; label: string; desc: string; emoji: string }[] = [
  { value: 'default',  label: '默认造型', desc: '站立，双手两侧，微笑', emoji: '🧍' },
  { value: 'happy',    label: '开心造型', desc: '双手举过头顶欢呼，跳跃', emoji: '🙌' },
  { value: 'sleeping', label: '睡觉造型', desc: '蜷缩成球，闭眼微笑', emoji: '😴' },
  { value: 'shy',      label: '害羞造型', desc: '双手捂脸，脸颊通红', emoji: '🙈' },
  { value: 'angry',    label: '生气造型', desc: '小拳头腰间，嘴巴嘟起', emoji: '😤' },
  { value: 'custom',   label: '自定义造型', desc: '手动描述想要的姿态', emoji: '✏️' },
];

// ── 内置 IP 角色预设 ──
const CHARACTER_PRESETS: { label: string; value: CharacterInput; avatar: string }[] = [
  {
    label: '龙眼龙',
    avatar: '🍈',
    value: {
      basicInfo: { name: '龙眼龙', englishName: 'Longan-Long', fruitType: '广西龙眼（南宁/贵港）', age: '8岁（心理年龄）', gender: '无明显性别，可称为"他"', keywords: '活泼、善良、勇敢、有点小调皮、真诚' },
      appearance: { overallShape: '圆润可爱的球形，略带椭圆；身高约3个头身比（Q版）；手脚短小圆滚滚', primaryColor: '#8B6914（龙眼金黄色）；辅助色#D4A017（亮金色）；阴影#654321（深棕）；叶子#32CD32（鲜绿）', eyes: '大大的圆形眼睛，占面部1/3；黑色瞳孔，白色高光点；眼神清澈明亮', mouth: '小巧的嘴巴，通常微笑；笑时露出小牙齿；偶有小舌头', signature: '头顶一片可爱小绿叶（龙眼果梗）；脸颊两个淡红晕；身体表面细腻果肉纹理；肚子略突出圆滚滚', clothing: '脖子系小红色围巾（代表广西热情），围巾上有龙眼图案；偶尔戴小斗笠' },
      personality: { pros: '乐于分享、勇敢乐观、真诚善良', cons: '有点贪吃、有时太冲动、容易害羞', catchphrase: '"嘿嘿，今天也是元气满满的一天！""龙眼来啦～"', hobbies: '在果园探险、和朋友分享美食、听广西山歌、帮爷爷干活', dislikes: '独自一人、被人说小、辣的东西' },
      background: { birthplace: '广西南宁一个古老龙眼果园，百年树龄龙眼树群落', story: '出生于阳光明媚的夏天，是果园最特别的一颗龙眼。因吸收太多阳光雨露而有灵性，变成水果精灵。果园爷爷赠予红色围巾，从此在果园快乐生活，结交许多水果朋友。', dream: '让世界各地的人都知道广西龙眼的甜美，成为广西文化传播使者', abilities: '能分辨出最甜的龙眼；与植物交流；快乐时散发甜甜香气' },
      pose: 'default', artStyle: 'cute cartoon chibi Q-version', scene: '',
    },
  },
  {
    label: '荔枝莉莉',
    avatar: '🍒',
    value: {
      basicInfo: { name: '荔枝莉莉', englishName: 'Litchi Lily', fruitType: '广西荔枝（灵山荔枝）', age: '8岁（心理年龄）', gender: '女性', keywords: '温柔、细心、有点爱美' },
      appearance: { overallShape: '圆润的Q版球形身体，2.5头身比例', primaryColor: '鲜红色为主，凹凸有致的荔枝纹理，头顶两片小绿叶', eyes: '温柔的大圆眼，睫毛微翘，眼神柔和', mouth: '小巧精致的嘴，说话轻声细语', signature: '圆润红色身体覆盖荔枝纹理；头顶两片绿叶；整体精致可爱', clothing: '穿着粉色小裙子，裙摆有荔枝图案装饰' },
      personality: { pros: '温柔体贴、细心周到、善解人意', cons: '有点爱美，偶尔会花太多时间打扮', catchphrase: '"龙眼龙，你又调皮了～""我们一起来分享甜蜜吧！"', hobbies: '打扮自己、照顾朋友、分享甜蜜', dislikes: '粗心大意、弄乱头发' },
      background: { birthplace: '广西灵山荔枝园', story: '龙眼龙最好的朋友，温柔细心的女孩，总是在朋友需要时出现', dream: '让更多人品尝到灵山荔枝的甜美', abilities: '能感知朋友的情绪、让周围充满温馨氛围' },
      pose: 'default', artStyle: 'cute cartoon chibi Q-version', scene: '',
    },
  },
  {
    label: '芒果麦克斯',
    avatar: '🥭',
    value: {
      basicInfo: { name: '芒果麦克斯', englishName: 'Mango Max', fruitType: '广西芒果（田东芒果）', age: '10岁（心理年龄）', gender: '男性', keywords: '豪爽、讲义气、有点大大咧咧' },
      appearance: { overallShape: '椭圆形的Q版身体，比龙眼龙高一点，约3头身比', primaryColor: '金黄色为主，表面光滑的芒果纹理，头顶一根小绿茎', eyes: '圆而有神的大眼，充满活力，略显霸气', mouth: '大大的嘴，经常是豪爽的笑容', signature: '椭圆形金黄身体；光滑芒果纹理；头顶绿色小茎；戴着蓝色棒球帽', clothing: '蓝色棒球帽斜戴，偶尔穿运动背心' },
      personality: { pros: '豪爽仗义、讲义气、勇敢无畏', cons: '有点大大咧咧、粗心', catchphrase: '"兄弟，有我罩着你！""没有什么困难是解决不了的！"', hobbies: '冒险探索、和龙眼龙一起玩、挑战困难', dislikes: '胆小鬼、背叛朋友' },
      background: { birthplace: '广西田东芒果山', story: '龙眼龙的哥们，经常一起冒险，豪爽仗义的男孩形象', dream: '成为最强壮的水果精灵，保护所有朋友', abilities: '力气大、敢于面对危险、跑得快' },
      pose: 'default', artStyle: 'cute cartoon chibi Q-version', scene: '',
    },
  },
  {
    label: '菠萝贝拉',
    avatar: '🍍',
    value: {
      basicInfo: { name: '菠萝贝拉', englishName: 'Pineapple Bella', fruitType: '广西菠萝（南宁菠萝）', age: '8岁（心理年龄）', gender: '女性', keywords: '幽默、乐观、爱开玩笑' },
      appearance: { overallShape: '圆柱形Q版身体，明显的菠萝纹理和可爱的刺状突起，头顶一簇绿色叶子冠', primaryColor: '金黄色为主，菠萝格纹，顶部绿色叶冠', eyes: '笑呵呵的弯月眼，总是快乐的表情', mouth: '常常大笑，嘴角上扬', signature: '圆柱形金黄身体；明显菠萝格纹；可爱刺状突起；头顶绿叶冠', clothing: '穿着花裙子，裙子上有菠萝图案' },
      personality: { pros: '幽默风趣、乐观开朗、能带给大家快乐', cons: '有时玩笑开过头', catchphrase: '"哈哈哈，生活就要这样有趣！""不开心？吃个菠萝就好啦！"', hobbies: '讲笑话、找乐子、带动气氛', dislikes: '沉闷无聊的氛围' },
      background: { birthplace: '广西南宁菠萝园', story: '果园的开心果，总是带来欢笑，是龙眼龙和朋友们的快乐源泉', dream: '让整个水果甜心镇每天都充满笑声', abilities: '感染他人快乐、化解尴尬气氛' },
      pose: 'default', artStyle: 'cute cartoon chibi Q-version', scene: '',
    },
  },
];

const EMPTY_CHARACTER: CharacterInput = {
  basicInfo: { name: '', englishName: '', fruitType: '', age: '', gender: '', keywords: '' },
  appearance: { overallShape: '', primaryColor: '', eyes: '', mouth: '', signature: '', clothing: '' },
  personality: { pros: '', cons: '', catchphrase: '', hobbies: '', dislikes: '' },
  background: { birthplace: '', story: '', dream: '', abilities: '' },
  pose: 'default', poseCustom: '', artStyle: 'cute cartoon chibi Q-version', scene: '',
};

const STEPS = [
  { title: '角色设定', icon: <RobotOutlined /> },
  { title: '生成提示词', icon: <BulbOutlined /> },
  { title: '文生图创作', icon: <PictureOutlined /> },
];

// ── 样式工具 ──
const glassStyle = (isDark: boolean, extra: React.CSSProperties = {}): React.CSSProperties => ({
  background: isDark
    ? 'linear-gradient(135deg, rgba(30,30,46,0.95), rgba(42,42,74,0.8))'
    : 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,247,255,0.9))',
  backdropFilter: 'blur(20px)',
  border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)'}`,
  borderRadius: 16,
  boxShadow: isDark
    ? '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
    : '0 8px 32px rgba(99,102,241,0.08), 0 2px 8px rgba(0,0,0,0.04)',
  transition: 'all 0.3s ease',
  ...extra,
});

const gradientText = (text: string, isDark: boolean) => (
  <span style={{
    background: isDark
      ? 'linear-gradient(135deg, #818cf8, #c084fc, #f472b6)'
      : 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 700,
  }}>
    {text}
  </span>
);

// ────────────────────────────────────────────────────
// 主组件
// ────────────────────────────────────────────────────
export const ContentCreator: React.FC = () => {
  const { mode } = useAppTheme();
  const isDark = mode === 'dark';

  const [step, setStep] = useState(0);
  const [character, setCharacter] = useState<CharacterInput>(EMPTY_CHARACTER);

  const [promptResults, setPromptResults] = useState<PromptResult[]>([]);
  const [promptLoading, setPromptLoading] = useState(false);

  const [selectedPrompt, setSelectedPrompt] = useState<PromptResult | null>(null);
  const [editedPrompt, setEditedPrompt] = useState('');
  const [editedNegPrompt, setEditedNegPrompt] = useState('');

  const [imageResults, setImageResults] = useState<ImageResult[]>([]);
  const [imageLoading, setImageLoading] = useState(false);

  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // 快捷函数
  const updateBasic = (patch: Partial<typeof character.basicInfo>) =>
    setCharacter(p => ({ ...p, basicInfo: { ...p.basicInfo, ...patch } }));
  const updateAppearance = (patch: Partial<typeof character.appearance>) =>
    setCharacter(p => ({ ...p, appearance: { ...p.appearance, ...patch } }));
  const updatePersonality = (patch: Partial<typeof character.personality>) =>
    setCharacter(p => ({ ...p, personality: { ...p.personality, ...patch } }));
  const updateBackground = (patch: Partial<typeof character.background>) =>
    setCharacter(p => ({ ...p, background: { ...p.background, ...patch } }));

  const applyPreset = (preset: CharacterInput) => {
    setCharacter({ ...preset });
    message.success('已填入角色档案，可按需修改后生成提示词');
  };

  // ── Step 1：生成提示词 ──
  const handleGeneratePrompts = useCallback(async () => {
    if (!character.basicInfo.name) { message.warning('请填写角色名称'); return; }
    if (!character.appearance.overallShape && !character.appearance.signature) {
      message.warning('请至少填写外观特征（整体形状或标志性特征）'); return;
    }
    const keys = loadApiKeys();
    if (!keys.deepseek && !keys.doubao && !keys.kimi) {
      message.error('请先在「设置」页配置 LLM API Key'); return;
    }
    setPromptLoading(true);
    setPromptResults([]);
    try {
      const results = await generatePrompts(character, keys);
      setPromptResults(results.filter(r => !r.error));
      const errored = results.filter(r => r.error);
      errored.forEach(r => message.warning(`${r.provider} 生成失败: ${r.error}`));
      if (results.some(r => !r.error)) {
        setStep(1);
        const first = results.find(r => !r.error);
        if (first) {
          setSelectedPrompt(first);
          setEditedPrompt(first.prompt);
          setEditedNegPrompt(first.negativePrompt || '');
        }
      }
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setPromptLoading(false);
    }
  }, [character]);

  // ── Step 2：文生图 ──
  const handleGenerateImages = useCallback(async () => {
    if (!editedPrompt) { message.warning('请先选择一个提示词'); return; }
    const keys = loadApiKeys();
    const availableModels = IMAGE_MODELS.filter(m => keys[m.keyField]);
    if (!availableModels.length) { message.error('请先配置文生图模型的 API Key'); return; }

    setImageLoading(true);
    setStep(2);
    const initResults: ImageResult[] = availableModels.map(m => ({
      model: m.id, modelLabel: m.label, prompt: editedPrompt, status: 'loading',
    }));
    setImageResults(initResults);

    const tasks = availableModels.map(async (m) => {
      const start = Date.now();
      try {
        const url = await generateImage(m.id, editedPrompt, editedNegPrompt, keys);
        setImageResults(prev => prev.map(r =>
          r.model === m.id ? { ...r, status: 'success', imageUrl: url, duration: Date.now() - start } : r
        ));
      } catch (e: any) {
        setImageResults(prev => prev.map(r =>
          r.model === m.id ? { ...r, status: 'error', error: e.message, duration: Date.now() - start } : r
        ));
      }
    });
    await Promise.allSettled(tasks);
    setImageLoading(false);
  }, [editedPrompt, editedNegPrompt]);

  const toggleFavorite = (modelId: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(modelId) ? next.delete(modelId) : next.add(modelId);
      return next;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('已复制到剪贴板');
  };

  const handleReset = () => {
    setStep(0);
    setCharacter(EMPTY_CHARACTER);
    setPromptResults([]);
    setSelectedPrompt(null);
    setImageResults([]);
    setEditedPrompt('');
    setEditedNegPrompt('');
  };

  // ────────────────────────────────────────────────────
  // 渲染
  // ────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      {/* ═══ Hero 标题区 ═══ */}
      <div style={{
        marginBottom: 32,
        padding: '32px 36px',
        borderRadius: 20,
        position: 'relative',
        overflow: 'hidden',
        ...glassStyle(isDark, {
          background: isDark
            ? 'linear-gradient(135deg, #1e1e2e 0%, #2d1b69 50%, #1e1e2e 100%)'
            : 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 30%, #fdf4ff 70%, #eef2ff 100%)',
        }),
      }}>
        {/* 装饰光圈 */}
        <div style={{
          position: 'absolute', top: -60, right: -60, width: 200, height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -40, left: 120, width: 160, height: 160,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.12), transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div>
            <Title level={2} style={{ margin: 0, fontSize: 28 }}>
              {gradientText('IP 角色文生图工作台', isDark)}
            </Title>
            <Paragraph style={{ margin: '8px 0 0', color: isDark ? '#9ca3af' : '#6b7280', fontSize: 14 }}>
              按 IP 设计文档填写档案 → AI 生成专业提示词 → 多模型文生图 → 对比最优结果
            </Paragraph>
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReset}
            size="large"
            style={{
              borderRadius: 12,
              fontWeight: 600,
              ...glassStyle(isDark, { padding: '8px 24px' }),
            }}
          >
            重新开始
          </Button>
        </div>

        {/* 步骤条 */}
        <div style={{ marginTop: 24 }}>
          <Steps
            current={step}
            items={STEPS}
            style={{
              '.ant-steps-item-finish .ant-steps-item-icon': { background: '#6366f1', borderColor: '#6366f1' },
            } as any}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          STEP 0：角色设定
      ══════════════════════════════════════════════ */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 16,
          ...glassStyle(isDark),
        }}
        styles={{
          header: {
            borderBottom: `1px solid ${isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)'}`,
            padding: '16px 24px',
          },
          body: { padding: '24px' },
        }}
        title={
          <span style={{ fontSize: 16, fontWeight: 600 }}>
            <RobotOutlined style={{ marginRight: 8, color: '#6366f1' }} />
            角色设定
          </span>
        }
        extra={
          <Tag style={{
            borderRadius: 20,
            padding: '2px 12px',
            fontWeight: 600,
            background: isDark ? 'rgba(99,102,241,0.2)' : '#eef2ff',
            color: '#6366f1',
            border: 'none',
          }}>
            Step 1
          </Tag>
        }
      >
        {/* 预设快速填入 */}
        <div style={{
          marginBottom: 24,
          padding: '16px 20px',
          borderRadius: 14,
          background: isDark
            ? 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.06))'
            : 'linear-gradient(135deg, #eef2ff, #f5f3ff)',
          border: `1px dashed ${isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.2)'}`,
        }}>
          <Text strong style={{ marginRight: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ThunderboltOutlined style={{ color: '#f59e0b' }} />
            快速填入预设角色：
          </Text>
          <Space wrap size={8}>
            {CHARACTER_PRESETS.map(p => (
              <Button
                key={p.label}
                onClick={() => applyPreset(p.value)}
                style={{
                  borderRadius: 10,
                  fontWeight: 500,
                  border: `1px solid ${isDark ? 'rgba(99,102,241,0.3)' : '#ddd'}`,
                  background: character.basicInfo.name === p.value.basicInfo.name
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : (isDark ? '#2a2a4a' : '#fff'),
                  color: character.basicInfo.name === p.value.basicInfo.name ? '#fff' : undefined,
                }}
              >
                <span style={{ fontSize: 18, marginRight: 4 }}>{p.avatar}</span>
                {p.label}
              </Button>
            ))}
            <Button
              type="dashed"
              onClick={() => setCharacter(EMPTY_CHARACTER)}
              style={{ borderRadius: 10, fontWeight: 500 }}
            >
              ✏️ 自定义
            </Button>
          </Space>
        </div>

        {/* 五维度 Tabs */}
        <Tabs
          defaultActiveKey="basic"
          type="card"
          style={{ marginBottom: 8 }}
          items={[
            {
              key: 'basic',
              label: <><UserOutlined /> 基本信息</>,
              children: (
                <Row gutter={[20, 0]}>
                  <Col span={8}>
                    <Form.Item label="角色名称" required>
                      <Input
                        placeholder="例：龙眼龙"
                        value={character.basicInfo.name}
                        onChange={e => updateBasic({ name: e.target.value })}
                        size="large"
                        style={{ borderRadius: 10 }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="英文名">
                      <Input placeholder="例：Longan-Long" value={character.basicInfo.englishName} onChange={e => updateBasic({ englishName: e.target.value })} style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="水果品种/原型">
                      <Input placeholder="例：广西龙眼" value={character.basicInfo.fruitType} onChange={e => updateBasic({ fruitType: e.target.value })} style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="心理年龄">
                      <Input placeholder="例：8岁" value={character.basicInfo.age} onChange={e => updateBasic({ age: e.target.value })} style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="性别设定">
                      <Input placeholder="例：无明显性别" value={character.basicInfo.gender} onChange={e => updateBasic({ gender: e.target.value })} style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label={<span>性格关键词 <Tooltip title="用顿号分隔，3-6个词最佳"><InfoCircleOutlined style={{ color: '#aaa' }} /></Tooltip></span>}>
                      <Input placeholder="活泼、善良、勇敢" value={character.basicInfo.keywords} onChange={e => updateBasic({ keywords: e.target.value })} style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'appearance',
              label: <><EyeOutlined /> 外观特征</>,
              children: (
                <Row gutter={[20, 0]}>
                  <Col span={12}>
                    <Form.Item label={<span>整体形状 <Tooltip title="身体形状、头身比、四肢特征"><InfoCircleOutlined style={{ color: '#aaa' }} /></Tooltip></span>}>
                      <TextArea rows={2} placeholder="圆润球形，3头身Q版" value={character.appearance.overallShape} onChange={e => updateAppearance({ overallShape: e.target.value })} style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label={<span>主色调 <Tooltip title="颜色名称或HEX色值"><InfoCircleOutlined style={{ color: '#aaa' }} /></Tooltip></span>}>
                      <TextArea rows={2} placeholder="主色#8B6914（金黄）" value={character.appearance.primaryColor} onChange={e => updateAppearance({ primaryColor: e.target.value })} style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="眼睛特征">
                      <TextArea rows={2} placeholder="大圆眼，占面部1/3" value={character.appearance.eyes} onChange={e => updateAppearance({ eyes: e.target.value })} style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="嘴巴特征">
                      <TextArea rows={2} placeholder="小巧微笑嘴" value={character.appearance.mouth} onChange={e => updateAppearance({ mouth: e.target.value })} style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label={<span>标志性特征 <Tooltip title="最重要的视觉识别元素"><InfoCircleOutlined style={{ color: '#aaa' }} /></Tooltip></span>}>
                      <TextArea rows={2} placeholder="头顶小绿叶；脸颊红晕" value={character.appearance.signature} onChange={e => updateAppearance({ signature: e.target.value })} showCount maxLength={200} style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="服装/配饰">
                      <TextArea rows={2} placeholder="红色围巾，有龙眼图案" value={character.appearance.clothing} onChange={e => updateAppearance({ clothing: e.target.value })} style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'personality',
              label: <><HeartOutlined /> 性格设定</>,
              children: (
                <Row gutter={[20, 0]}>
                  <Col span={12}>
                    <Form.Item label="优点">
                      <TextArea rows={2} placeholder="乐于分享、勇敢乐观" value={character.personality.pros} onChange={e => updatePersonality({ pros: e.target.value })} style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="缺点">
                      <TextArea rows={2} placeholder="有点贪吃、太冲动" value={character.personality.cons} onChange={e => updatePersonality({ cons: e.target.value })} style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="口头禅">
                      <TextArea rows={2} placeholder='"嘿嘿，元气满满！"' value={character.personality.catchphrase} onChange={e => updatePersonality({ catchphrase: e.target.value })} style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="爱好">
                      <TextArea rows={2} placeholder="果园探险、分享美食" value={character.personality.hobbies} onChange={e => updatePersonality({ hobbies: e.target.value })} style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="讨厌">
                      <Input placeholder="独自一人、辣的东西" value={character.personality.dislikes} onChange={e => updatePersonality({ dislikes: e.target.value })} style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'background',
              label: <><BookOutlined /> 背景故事</>,
              children: (
                <Row gutter={[20, 0]}>
                  <Col span={12}>
                    <Form.Item label="出生地">
                      <Input placeholder="广西南宁古老龙眼果园" value={character.background.birthplace} onChange={e => updateBackground({ birthplace: e.target.value })} style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="梦想">
                      <Input placeholder="让世界知道广西龙眼的甜美" value={character.background.dream} onChange={e => updateBackground({ dream: e.target.value })} style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="成长经历">
                      <TextArea rows={3} placeholder="出生于阳光明媚的夏天…" value={character.background.story} onChange={e => updateBackground({ story: e.target.value })} showCount maxLength={300} style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="特殊能力">
                      <Input placeholder="分辨最甜的龙眼；与植物交流" value={character.background.abilities} onChange={e => updateBackground({ abilities: e.target.value })} style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'pose',
              label: <><CameraOutlined /> 经典造型</>,
              children: (
                <>
                  <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                    {POSE_OPTIONS.map(p => {
                      const isSelected = character.pose === p.value;
                      return (
                        <Col span={8} key={p.value}>
                          <div
                            onClick={() => setCharacter(c => ({ ...c, pose: p.value }))}
                            style={{
                              padding: '14px 16px',
                              borderRadius: 14,
                              cursor: 'pointer',
                              transition: 'all 0.25s ease',
                              border: isSelected
                                ? `2px solid #6366f1`
                                : `1px solid ${isDark ? '#2a2a4a' : '#e8e8f0'}`,
                              background: isSelected
                                ? (isDark ? 'rgba(99,102,241,0.12)' : 'linear-gradient(135deg, #eef2ff, #f5f3ff)')
                                : (isDark ? '#1e1e2e' : '#fff'),
                              transform: isSelected ? 'translateY(-2px)' : 'none',
                              boxShadow: isSelected
                                ? '0 4px 16px rgba(99,102,241,0.2)'
                                : (isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'),
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontSize: 24, lineHeight: 1 }}>{p.emoji}</span>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 13, color: isDark ? '#e4e4f0' : '#1e1e2e' }}>{p.label}</div>
                                <div style={{ fontSize: 11, color: isDark ? '#9ca3af' : '#9ca3af', marginTop: 2 }}>{p.desc}</div>
                              </div>
                              {isSelected && (
                                <CheckCircleOutlined style={{ color: '#6366f1', fontSize: 16 }} />
                              )}
                            </div>
                          </div>
                        </Col>
                      );
                    })}
                  </Row>

                  {character.pose === 'custom' && (
                    <Form.Item label="自定义造型描述">
                      <TextArea
                        rows={3}
                        placeholder="单手托着发光的龙眼，另一只手指向远方…"
                        value={character.poseCustom}
                        onChange={e => setCharacter(c => ({ ...c, poseCustom: e.target.value }))}
                        showCount maxLength={200}
                        style={{ borderRadius: 10 }}
                      />
                    </Form.Item>
                  )}

                  {character.pose !== 'custom' && (
                    <Alert
                      type="info"
                      showIcon
                      icon={<BulbOutlined />}
                      message="选中造型的英文描述"
                      description={
                        <code style={{ fontSize: 12, fontFamily: 'monospace', color: isDark ? '#a5b4fc' : '#6366f1', background: isDark ? 'rgba(99,102,241,0.08)' : '#f5f3ff', padding: '4px 8px', borderRadius: 6 }}>
                          {POSE_DESCRIPTIONS[character.pose]}
                        </code>
                      }
                      style={{ marginTop: 8, borderRadius: 12, border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : '#e0e7ff'}`, background: isDark ? 'rgba(99,102,241,0.05)' : '#f5f3ff' }}
                    />
                  )}

                  <Divider style={{ margin: '20px 0', borderColor: isDark ? '#2a2a4a' : '#e8e8f0' }} />

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="艺术风格" required>
                        <Select
                          value={character.artStyle}
                          onChange={v => setCharacter(c => ({ ...c, artStyle: v }))}
                          options={STYLE_OPTIONS}
                          style={{ width: '100%', borderRadius: 10 }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="场景">
                        <Select
                          value={character.scene}
                          onChange={v => setCharacter(c => ({ ...c, scene: v }))}
                          options={SCENE_OPTIONS}
                          style={{ width: '100%', borderRadius: 10 }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              ),
            },
          ]}
        />

        {/* 生成按钮 */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 8, padding: '16px 0 4px',
          borderTop: `1px solid ${isDark ? '#2a2a4a' : '#f0f0f0'}`,
        }}>
          <Space size={6}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              将调用
            </Text>
            {LLM_PROVIDERS.map(p => (
              <Tag key={p.id} style={{
                borderRadius: 16,
                fontWeight: 600,
                background: p.gradient,
                color: '#fff',
                border: 'none',
                padding: '2px 10px',
              }}>
                {p.label}
              </Tag>
            ))}
            <Text type="secondary" style={{ fontSize: 13 }}>生成专业提示词</Text>
          </Space>
          <Button
            type="primary"
            size="large"
            icon={<BulbOutlined />}
            loading={promptLoading}
            onClick={handleGeneratePrompts}
            disabled={!character.basicInfo.name}
            style={{
              borderRadius: 14,
              fontWeight: 600,
              height: 48,
              paddingInline: 32,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              border: 'none',
              boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
            }}
          >
            {promptLoading ? '正在生成提示词…' : '🚀 生成提示词'}
          </Button>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════
          STEP 1：提示词结果
      ══════════════════════════════════════════════ */}
      {(promptResults.length > 0 || promptLoading) && (
        <Card
          style={{ marginBottom: 24, borderRadius: 16, ...glassStyle(isDark) }}
          styles={{
            header: { borderBottom: `1px solid ${isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)'}`, padding: '16px 24px' },
            body: { padding: '24px' },
          }}
          title={
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              <BulbOutlined style={{ marginRight: 8, color: '#f59e0b' }} />
              LLM 提示词生成结果
            </span>
          }
          extra={
            <Tag style={{
              borderRadius: 20, padding: '2px 12px', fontWeight: 600,
              background: isDark ? 'rgba(245,158,11,0.15)' : '#fffbeb',
              color: '#f59e0b', border: 'none',
            }}>Step 2</Tag>
          }
        >
          {promptLoading && (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <Spin size="large" indicator={<LoadingOutlined style={{ fontSize: 40, color: '#6366f1' }} />} />
              <div style={{ marginTop: 16 }}>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  AI 正在解析 IP 档案，生成专业文生图提示词…
                </Text>
              </div>
            </div>
          )}

          <Row gutter={16}>
            {LLM_PROVIDERS.map(provider => {
              const result = promptResults.find(r => r.provider === provider.id);
              const isSelected = selectedPrompt?.provider === provider.id;

              return (
                <Col span={8} key={provider.id}>
                  <div
                    onClick={() => {
                      if (result && !result.error) {
                        setSelectedPrompt(result);
                        setEditedPrompt(result.prompt);
                        setEditedNegPrompt(result.negativePrompt || '');
                      }
                    }}
                    style={{
                      borderRadius: 14,
                      padding: '16px',
                      cursor: result ? 'pointer' : 'default',
                      opacity: result ? 1 : 0.5,
                      minHeight: 220,
                      transition: 'all 0.3s ease',
                      border: isSelected
                        ? `2px solid ${provider.color}`
                        : `1px solid ${isDark ? '#2a2a4a' : '#e8e8f0'}`,
                      background: isSelected
                        ? (isDark ? 'rgba(99,102,241,0.08)' : '#f5f3ff')
                        : (isDark ? '#1e1e2e' : '#fff'),
                      transform: isSelected ? 'translateY(-2px)' : 'none',
                      boxShadow: isSelected
                        ? `0 4px 20px ${provider.color}30`
                        : (isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'),
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <Tag style={{
                        borderRadius: 16, fontWeight: 600, background: provider.gradient,
                        color: '#fff', border: 'none', padding: '2px 12px',
                      }}>{provider.label}</Tag>
                      <Space size={4}>
                        {isSelected && <Tag color="success" style={{ borderRadius: 12, fontSize: 11 }}><CheckCircleOutlined /> 已选用</Tag>}
                        {result && !result.error && (
                          <Tooltip title="复制提示词">
                            <Button type="text" size="small" icon={<CopyOutlined />}
                              onClick={e => { e.stopPropagation(); copyToClipboard(result.prompt); }}
                            />
                          </Tooltip>
                        )}
                      </Space>
                    </div>

                    {!result ? (
                      <div style={{ textAlign: 'center', padding: 24 }}>
                        <Spin size="small" />
                        <div><Text type="secondary" style={{ fontSize: 12 }}>生成中…</Text></div>
                      </div>
                    ) : result.error ? (
                      <Alert type="error" message={result.error} showIcon style={{ borderRadius: 10 }} />
                    ) : (
                      <>
                        <Text type="secondary" style={{ fontSize: 11 }}>{provider.description}</Text>
                        <Paragraph
                          ellipsis={{ rows: 4, expandable: true, symbol: '展开' }}
                          style={{
                            marginTop: 10, fontSize: 12, fontFamily: 'monospace',
                            background: isDark ? '#13131f' : '#f8f7ff',
                            padding: '10px 12px', borderRadius: 10,
                            border: `1px solid ${isDark ? '#2a2a4a' : '#eee'}`,
                          }}
                        >
                          {result.prompt}
                        </Paragraph>
                        {result.negativePrompt && (
                          <Paragraph
                            ellipsis={{ rows: 2 }}
                            style={{ fontSize: 11, color: isDark ? '#9ca3af' : '#999', marginBottom: 0, marginTop: 6 }}
                          >
                            ❌ {result.negativePrompt}
                          </Paragraph>
                        )}
                        {result.reasoning && (
                          <Text type="secondary" style={{ fontSize: 10, display: 'block', marginTop: 6, fontStyle: 'italic', color: isDark ? '#818cf8' : '#6366f1' }}>
                            💡 {result.reasoning}
                          </Text>
                        )}
                      </>
                    )}
                  </div>
                </Col>
              );
            })}
          </Row>

          {/* 编辑区 */}
          {selectedPrompt && (
            <>
              <Divider>
                <Text type="secondary">✏️ 微调选中的提示词后再生图（可选）</Text>
              </Divider>
              <Row gutter={16}>
                <Col span={16}>
                  <Form.Item label={<span style={{ fontWeight: 600 }}>正向提示词（Prompt）</span>}>
                    <TextArea
                      rows={3}
                      value={editedPrompt}
                      onChange={e => setEditedPrompt(e.target.value)}
                      style={{ fontFamily: 'monospace', fontSize: 12, borderRadius: 10, background: isDark ? '#13131f' : '#fff' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label={<span style={{ fontWeight: 600 }}>反向提示词</span>}>
                    <TextArea
                      rows={3}
                      value={editedNegPrompt}
                      onChange={e => setEditedNegPrompt(e.target.value)}
                      style={{ fontFamily: 'monospace', fontSize: 12, borderRadius: 10, background: isDark ? '#13131f' : '#fff' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space wrap>
                  {IMAGE_MODELS.map(m => {
                    const keys = loadApiKeys();
                    const hasKey = !!keys[m.keyField];
                    return (
                      <Tag key={m.id}
                        style={{
                          borderRadius: 16, fontWeight: 500, padding: '2px 10px',
                          opacity: hasKey ? 1 : 0.4,
                          background: hasKey ? `${m.color}18` : undefined,
                          color: hasKey ? m.color : undefined,
                        }}
                      >
                        {m.label} {hasKey ? '✓' : '(未配置)'}
                      </Tag>
                    );
                  })}
                </Space>
                <Button
                  type="primary"
                  size="large"
                  icon={<PictureOutlined />}
                  loading={imageLoading}
                  onClick={handleGenerateImages}
                  disabled={!editedPrompt}
                  style={{
                    borderRadius: 14, fontWeight: 600, height: 48, paddingInline: 32,
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(34,197,94,0.35)',
                  }}
                >
                  {imageLoading ? '多模型并发生成中…' : '🎨 开始文生图（多模型对比）'}
                </Button>
              </div>
            </>
          )}
        </Card>
      )}

      {/* ══════════════════════════════════════════════
          STEP 2：文生图结果
      ══════════════════════════════════════════════ */}
      {imageResults.length > 0 && (
        <Card
          style={{ marginBottom: 24, borderRadius: 16, ...glassStyle(isDark) }}
          styles={{
            header: { borderBottom: `1px solid ${isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)'}`, padding: '16px 24px' },
            body: { padding: '24px' },
          }}
          title={
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              <PictureOutlined style={{ marginRight: 8, color: '#22c55e' }} />
              多模型生图结果对比
            </span>
          }
          extra={
            <Space>
              <Tag style={{
                borderRadius: 20, padding: '2px 12px', fontWeight: 600,
                background: isDark ? 'rgba(139,92,246,0.15)' : '#faf5ff',
                color: '#8b5cf6', border: 'none',
              }}>Step 3</Tag>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {imageResults.filter(r => r.status === 'success').length}/{imageResults.length} 完成
              </Text>
            </Space>
          }
        >
          <Alert
            type="info"
            showIcon
            icon={<RobotOutlined />}
            message={
              <span>
                角色：<Text strong>{character.basicInfo.name}</Text> · 造型：{POSE_OPTIONS.find(p => p.value === character.pose)?.label || ''}
              </span>
            }
            description={
              <code style={{ fontSize: 12, fontFamily: 'monospace', color: isDark ? '#a5b4fc' : '#6366f1' }}>
                {editedPrompt}
              </code>
            }
            style={{
              marginBottom: 20, borderRadius: 12,
              background: isDark ? 'rgba(99,102,241,0.05)' : '#f5f3ff',
              border: `1px solid ${isDark ? 'rgba(99,102,241,0.15)' : '#e0e7ff'}`,
            }}
          />

          <Row gutter={[16, 16]}>
            {IMAGE_MODELS.map(modelMeta => {
              const result = imageResults.find(r => r.model === modelMeta.id);
              if (!result) return null;
              const isFav = favorites.has(modelMeta.id);

              return (
                <Col xs={24} sm={12} lg={6} key={modelMeta.id}>
                  <Badge.Ribbon
                    text={isFav ? '⭐ 收藏' : ''}
                    color="gold"
                    style={{ display: isFav ? 'block' : 'none' }}
                  >
                    <div style={{
                      borderRadius: 16, overflow: 'hidden',
                      border: `2px solid ${modelMeta.color}25`,
                      background: isDark ? '#1e1e2e' : '#fff',
                      boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.06)',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                    }}>
                      {/* 图片区域 */}
                      <div style={{
                        height: 280, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        borderRadius: '14px 14px 0 0', overflow: 'hidden',
                      }}>
                        {result.status === 'loading' ? (
                          <>
                            <Spin indicator={<LoadingOutlined style={{ fontSize: 36, color: modelMeta.color }} spin />} />
                            <Text type="secondary" style={{ marginTop: 12, fontSize: 12 }}>生成中…</Text>
                          </>
                        ) : result.status === 'error' ? (
                          <>
                            <CloseCircleOutlined style={{ fontSize: 36, color: '#ef4444' }} />
                            <Text type="danger" style={{ marginTop: 12, fontSize: 12, textAlign: 'center', padding: '0 16px' }}>
                              {result.error}
                            </Text>
                          </>
                        ) : (
                          <Image
                            src={result.imageUrl}
                            alt={modelMeta.label}
                            style={{ width: '100%', height: 280, objectFit: 'cover' }}
                            preview={{ mask: '🔍 查看大图' }}
                          />
                        )}
                      </div>

                      {/* 信息区域 */}
                      <div style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Tag style={{
                            borderRadius: 16, fontWeight: 600,
                            background: `${modelMeta.color}18`, color: modelMeta.color,
                            border: 'none', padding: '2px 12px',
                          }}>
                            {modelMeta.label}
                          </Tag>
                          <Button
                            type="text" size="small"
                            icon={isFav ? <StarFilled style={{ color: '#fbbf24' }} /> : <StarOutlined style={{ color: isDark ? '#9ca3af' : '#ccc' }} />}
                            onClick={() => toggleFavorite(modelMeta.id)}
                          />
                        </div>
                        <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 6 }}>
                          {modelMeta.strengths}
                        </Text>
                        {result.duration && result.status !== 'loading' && (
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            ⏱ {(result.duration / 1000).toFixed(1)}s
                          </Text>
                        )}
                        {result.status === 'success' && result.imageUrl && (
                          <Button
                            size="small"
                            block
                            style={{
                              marginTop: 10, borderRadius: 10, fontWeight: 600,
                              background: `linear-gradient(135deg, ${modelMeta.color}, ${modelMeta.color}cc)`,
                              color: '#fff', border: 'none',
                            }}
                            onClick={() => {
                              const a = document.createElement('a');
                              a.href = result.imageUrl!;
                              a.download = `${character.basicInfo.name}_${character.pose}_${modelMeta.id}.jpg`;
                              a.click();
                            }}
                          >
                            ⬇️ 下载图片
                          </Button>
                        )}
                      </div>
                    </div>
                  </Badge.Ribbon>
                </Col>
              );
            })}
          </Row>

          <Divider style={{ borderColor: isDark ? '#2a2a4a' : '#e8e8f0' }} />
          <Collapse
            ghost
            items={[{
              key: '1',
              label: <Text type="secondary">📖 各模型特点说明</Text>,
              children: (
                <Row gutter={16}>
                  {IMAGE_MODELS.map(m => (
                    <Col span={6} key={m.id}>
                      <div style={{
                        padding: 16, borderRadius: 12,
                        background: isDark ? '#1e1e2e' : '#fff',
                        border: `1px solid ${m.color}25`,
                      }}>
                        <Tag style={{
                          borderRadius: 16, fontWeight: 600,
                          background: `${m.color}18`, color: m.color,
                          border: 'none', padding: '2px 12px',
                        }}>{m.label}</Tag>
                        <Paragraph style={{ fontSize: 12, marginTop: 8, marginBottom: 0, color: isDark ? '#9ca3af' : '#666' }}>
                          {m.description}
                        </Paragraph>
                      </div>
                    </Col>
                  ))}
                </Row>
              ),
            }]}
          />
        </Card>
      )}

      {/* 空状态 */}
      {step === 0 && promptResults.length === 0 && !promptLoading && (
        <div style={{
          textAlign: 'center', padding: '64px 24px',
          background: isDark ? 'rgba(99,102,241,0.03)' : '#fafbff',
          borderRadius: 16, border: `1px dashed ${isDark ? '#2a2a4a' : '#e0e7ff'}`,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎨</div>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                选择预设角色或自定义填写 IP 档案，点击「生成提示词」开始创作<br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  需先配置 API Key · 支持龙眼龙、荔枝莉莉、芒果麦克斯等预设角色
                </Text>
              </span>
            }
          />
        </div>
      )}
    </div>
  );
};
