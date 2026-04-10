/**
 * 图像生成多模型 API 客户端
 *
 * LLM 提示词生成：DeepSeek / 豆包(Doubao) / Kimi
 * 文生图模型：
 *   - FLUX.1-dev   (via 阿里云百炼)
 *   - 通义万相2.1   (via 阿里云百炼)
 *   - 豆包Seedream  (via 火山引擎)
 *   - Stable Diffusion 3.5 (via Stability AI)
 */

// ────────────────────────────────────────────
// API Key 存储（localStorage）
// ────────────────────────────────────────────

export interface ApiKeys {
  deepseek: string;
  doubao: string;        // 豆包/火山引擎 API Key
  kimi: string;
  aliyun: string;        // 阿里云百炼（通义万相 + FLUX）
  stabilityai: string;   // Stability AI (SD3.5)
}

const STORAGE_KEY = 'image_gen_api_keys';

export function saveApiKeys(keys: Partial<ApiKeys>) {
  const existing = loadApiKeys();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...keys }));
}

export function loadApiKeys(): ApiKeys {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {} as ApiKeys;
  }
}

// ────────────────────────────────────────────
// 类型定义 - IP 档案结构
// ────────────────────────────────────────────

export type LLMProvider = 'deepseek' | 'doubao' | 'kimi';
export type ImageModel = 'flux1dev' | 'wanxiang' | 'seedream' | 'sd35';

/** 基本信息 */
export interface CharacterBasicInfo {
  name: string;           // 角色名（中文）
  englishName?: string;   // 英文名
  fruitType?: string;     // 水果品种/原型
  age?: string;           // 心理年龄
  gender?: string;        // 性别设定
  keywords?: string;      // 性格关键词（逗号分隔）
}

/** 外观特征 */
export interface CharacterAppearance {
  overallShape?: string;  // 整体形状
  primaryColor?: string;  // 主色调（HEX或描述）
  eyes?: string;          // 眼睛特征
  mouth?: string;         // 嘴巴特征
  signature?: string;     // 标志性特征
  clothing?: string;      // 服装/配饰
}

/** 性格设定 */
export interface CharacterPersonality {
  pros?: string;          // 优点
  cons?: string;          // 缺点
  catchphrase?: string;   // 口头禅
  hobbies?: string;       // 爱好
  dislikes?: string;      // 讨厌
}

/** 背景故事 */
export interface CharacterBackground {
  birthplace?: string;    // 出生地
  story?: string;         // 成长经历
  dream?: string;         // 梦想
  abilities?: string;     // 特殊能力
}

/** 经典造型（选择要生成哪个造型） */
export type ClassicPose =
  | 'default'    // 默认造型
  | 'sleeping'   // 睡觉
  | 'happy'      // 开心
  | 'angry'      // 生气
  | 'shy'        // 害羞
  | 'custom';    // 自定义

export interface CharacterInput {
  // 基本信息
  basicInfo: CharacterBasicInfo;
  // 外观特征
  appearance: CharacterAppearance;
  // 性格设定
  personality: CharacterPersonality;
  // 背景故事
  background: CharacterBackground;
  // 经典造型
  pose: ClassicPose;
  poseCustom?: string;    // 自定义造型描述
  // 视觉风格（影响生图风格）
  artStyle: string;
  // 场景
  scene?: string;
}

export interface PromptResult {
  provider: LLMProvider;
  prompt: string;         // 英文提示词（给文生图用）
  negativePrompt?: string;
  reasoning?: string;     // 推理说明
  error?: string;
}

export interface ImageResult {
  model: ImageModel;
  modelLabel: string;
  prompt: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  error?: string;
  duration?: number;
}

// ────────────────────────────────────────────
// 造型描述映射
// ────────────────────────────────────────────

export const POSE_DESCRIPTIONS: Record<ClassicPose, string> = {
  default:  'standing pose, arms at sides, gentle smile, bright eyes, warm and cute expression',
  sleeping: 'curled up sleeping like a ball, eyes closed with a smile, drooping leaf on head, tiny drool drop on mouth corner',
  happy:    'both hands raised above head cheering, big smile with crescent moon eyes, jumping pose with feet off ground, scarf flying',
  angry:    'small fists on waist, pouting mouth with puffed cheeks, slightly furrowed brows, still adorable not scary',
  shy:      'both hands covering face, peeking through fingers, flushed red cheeks, leaf curling shyly, toes pointing inward',
  custom:   '',
};

// ────────────────────────────────────────────
// 构建 LLM 用的 IP 档案文本
// ────────────────────────────────────────────

function buildCharacterProfile(character: CharacterInput): string {
  const { basicInfo, appearance, personality, background, pose, poseCustom, artStyle, scene } = character;

  const poseLine = pose === 'custom'
    ? `Custom pose: ${poseCustom || 'standing'}`
    : `Classic pose: ${POSE_DESCRIPTIONS[pose]}`;

  return `
=== IP Character Design Document ===

[Basic Info]
- Name: ${basicInfo.name}${basicInfo.englishName ? ` (${basicInfo.englishName})` : ''}
- Fruit type / Origin: ${basicInfo.fruitType || 'N/A'}
- Psychological age: ${basicInfo.age || 'N/A'}
- Gender: ${basicInfo.gender || 'genderless'}
- Personality keywords: ${basicInfo.keywords || 'N/A'}

[Appearance]
- Overall shape: ${appearance.overallShape || 'N/A'}
- Primary color: ${appearance.primaryColor || 'N/A'}
- Eyes: ${appearance.eyes || 'N/A'}
- Mouth: ${appearance.mouth || 'N/A'}
- Signature features: ${appearance.signature || 'N/A'}
- Clothing / Accessories: ${appearance.clothing || 'N/A'}

[Personality]
- Strengths: ${personality.pros || 'N/A'}
- Weaknesses: ${personality.cons || 'N/A'}
- Catchphrase: ${personality.catchphrase || 'N/A'}
- Hobbies: ${personality.hobbies || 'N/A'}

[Background Story]
- Birthplace: ${background.birthplace || 'N/A'}
- Story: ${background.story || 'N/A'}
- Dream: ${background.dream || 'N/A'}
- Special abilities: ${background.abilities || 'N/A'}

[Pose / Expression]
- ${poseLine}

[Art Style]
- Style: ${artStyle}
- Scene: ${scene || 'clean white background, studio lighting'}
`.trim();
}

// ────────────────────────────────────────────
// LLM System Prompt
// ────────────────────────────────────────────

const PROMPT_SYSTEM = `You are a professional AI image generation prompt engineer specializing in IP character design for Chinese fruit mascots.

Given an IP character design document, generate a high-quality English text-to-image prompt that faithfully captures every visual detail.

Rules:
1. Write in English only. Be highly specific and visual.
2. Structure: [subject description] + [pose/expression] + [art style] + [colors] + [lighting] + [background] + [quality tags]
3. Explicitly include all distinctive visual features (colors with HEX codes, shapes, accessories, signature elements).
4. Describe pose/expression from the "Classic pose" section precisely.
5. Use chibi/Q-version proportions (2.5 head ratio) unless style says otherwise.
6. End with quality boosters: "masterpiece, best quality, highly detailed, clean lines, vibrant colors, 4k resolution".
7. Output a negative_prompt to avoid common deformation issues for chibi characters.
8. Also write a brief reasoning explaining key design choices.

Respond ONLY in valid JSON: {"prompt": "...", "negative_prompt": "...", "reasoning": "..."}`;

// ────────────────────────────────────────────
// LLM 调用
// ────────────────────────────────────────────

async function callDeepSeek(character: CharacterInput, apiKey: string): Promise<PromptResult> {
  const profile = buildCharacterProfile(character);

  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: PROMPT_SYSTEM },
        { role: 'user', content: profile },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) throw new Error(`DeepSeek API error: ${res.status}`);
  const data = await res.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  return {
    provider: 'deepseek',
    prompt: parsed.prompt,
    negativePrompt: parsed.negative_prompt,
    reasoning: parsed.reasoning,
  };
}

async function callDoubao(character: CharacterInput, apiKey: string): Promise<PromptResult> {
  const profile = buildCharacterProfile(character);

  const res = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'doubao-pro-32k-241215',
      messages: [
        { role: 'system', content: PROMPT_SYSTEM },
        { role: 'user', content: profile },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) throw new Error(`豆包 API error: ${res.status}`);
  const data = await res.json();
  const text = data.choices[0].message.content;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
  return {
    provider: 'doubao',
    prompt: parsed.prompt,
    negativePrompt: parsed.negative_prompt,
    reasoning: parsed.reasoning,
  };
}

async function callKimi(character: CharacterInput, apiKey: string): Promise<PromptResult> {
  const profile = buildCharacterProfile(character);

  const res = await fetch('https://api.moonshot.cn/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'moonshot-v1-8k',
      messages: [
        { role: 'system', content: PROMPT_SYSTEM },
        { role: 'user', content: profile },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) throw new Error(`Kimi API error: ${res.status}`);
  const data = await res.json();
  const text = data.choices[0].message.content;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
  return {
    provider: 'kimi',
    prompt: parsed.prompt,
    negativePrompt: parsed.negative_prompt,
    reasoning: parsed.reasoning,
  };
}

export async function generatePrompts(
  character: CharacterInput,
  keys: ApiKeys
): Promise<PromptResult[]> {
  const tasks: Promise<PromptResult>[] = [];

  if (keys.deepseek) tasks.push(callDeepSeek(character, keys.deepseek).catch(e => ({ provider: 'deepseek' as LLMProvider, prompt: '', error: e.message })));
  if (keys.doubao)   tasks.push(callDoubao(character, keys.doubao).catch(e => ({ provider: 'doubao' as LLMProvider, prompt: '', error: e.message })));
  if (keys.kimi)     tasks.push(callKimi(character, keys.kimi).catch(e => ({ provider: 'kimi' as LLMProvider, prompt: '', error: e.message })));

  if (tasks.length === 0) throw new Error('请先在设置中配置至少一个 LLM API Key');
  return Promise.all(tasks);
}

// ────────────────────────────────────────────
// 文生图模型调用
// ────────────────────────────────────────────

/** FLUX.1-dev via 阿里云百炼 */
async function callFlux1(prompt: string, negativePrompt: string, apiKey: string): Promise<string> {
  const res = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify({
      model: 'flux-dev',
      input: { prompt, negative_prompt: negativePrompt || '' },
      parameters: { size: '1024*1024', n: 1 },
    }),
  });
  if (!res.ok) throw new Error(`FLUX.1 submit error: ${res.status}`);
  const data = await res.json();
  const taskId = data.output?.task_id;
  if (!taskId) throw new Error('FLUX.1 未返回 task_id');
  return pollAliyunTask(taskId, apiKey);
}

/** 通义万相2.1 via 阿里云百炼 */
async function callWanxiang(prompt: string, negativePrompt: string, apiKey: string): Promise<string> {
  const res = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify({
      model: 'wanx2.1-t2i-turbo',
      input: { prompt, negative_prompt: negativePrompt || '' },
      parameters: { size: '1024*1024', n: 1, style: '<auto>' },
    }),
  });
  if (!res.ok) throw new Error(`通义万相 submit error: ${res.status}`);
  const data = await res.json();
  const taskId = data.output?.task_id;
  if (!taskId) throw new Error('通义万相未返回 task_id');
  return pollAliyunTask(taskId, apiKey);
}

/** 轮询阿里云百炼异步任务 */
async function pollAliyunTask(taskId: string, apiKey: string): Promise<string> {
  for (let i = 0; i < 60; i++) {
    await sleep(3000);
    const res = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (!res.ok) throw new Error(`轮询失败: ${res.status}`);
    const data = await res.json();
    const status = data.output?.task_status;
    if (status === 'SUCCEEDED') {
      const url = data.output?.results?.[0]?.url;
      if (!url) throw new Error('未获取到图片 URL');
      return url;
    }
    if (status === 'FAILED') throw new Error(data.output?.message || '生成失败');
  }
  throw new Error('生成超时（180s）');
}

/** 豆包 Seedream via 火山引擎 */
async function callSeedream(prompt: string, negativePrompt: string, apiKey: string): Promise<string> {
  // 新版 Seedream 不支持 negative_prompt / guidance_scale / width+height
  // 将 negative_prompt 内容合并到 prompt 中以避免不支持的参数
  let finalPrompt = prompt;
  if (negativePrompt) {
    finalPrompt = `${prompt}. Avoid: ${negativePrompt}`;
  }
  const res = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'ep-20260409091828-k7t9x',
      prompt: finalPrompt,
      size: '2048x2048',
      response_format: 'url',
      watermark: false,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`豆包Seedream error: ${res.status} ${err}`);
  }
  const data = await res.json();
  const url = data.data?.[0]?.url;
  if (!url) throw new Error('豆包Seedream未返回图片URL');
  return url;
}

/** Stable Diffusion 3.5 via Stability AI */
async function callSD35(prompt: string, negativePrompt: string, apiKey: string): Promise<string> {
  const formData = new FormData();
  formData.append('prompt', prompt);
  formData.append('negative_prompt', negativePrompt || '');
  formData.append('model', 'sd3.5-large');
  formData.append('output_format', 'jpeg');
  formData.append('width', '1024');
  formData.append('height', '1024');
  formData.append('cfg_scale', '7');

  const res = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
    },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SD3.5 error: ${res.status} ${err}`);
  }
  const data = await res.json();
  const b64 = data.image;
  if (!b64) throw new Error('SD3.5未返回图片数据');
  const blob = await fetch(`data:image/jpeg;base64,${b64}`).then(r => r.blob());
  return URL.createObjectURL(blob);
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ────────────────────────────────────────────
// 模型元信息
// ────────────────────────────────────────────

export const IMAGE_MODELS: {
  id: ImageModel;
  label: string;
  description: string;
  keyField: keyof ApiKeys;
  color: string;
  strengths: string;
}[] = [
  {
    id: 'flux1dev',
    label: 'FLUX.1-dev',
    description: 'Black Forest Labs 出品，12B参数，业界最强开源文生图，角色还原度高',
    keyField: 'aliyun',
    color: '#722ED1',
    strengths: '高还原度 · 细节丰富 · 中文优化版',
  },
  {
    id: 'wanxiang',
    label: '通义万相 2.1',
    description: '阿里云出品，对中文提示词理解好，国风/卡通风格表现优秀',
    keyField: 'aliyun',
    color: '#FA8C16',
    strengths: '中文理解 · 国风/卡通 · 速度快',
  },
  {
    id: 'seedream',
    label: '豆包 Seedream 3.0',
    description: '字节跳动出品，IP角色与品牌化场景表现优秀，写实与动漫均衡',
    keyField: 'doubao',
    color: '#13C2C2',
    strengths: 'IP角色 · 品牌场景 · 高美感',
  },
  {
    id: 'sd35',
    label: 'Stable Diffusion 3.5',
    description: 'Stability AI 出品，构图精准，不跑偏，对提示词遵从度最高',
    keyField: 'stabilityai',
    color: '#1890FF',
    strengths: '高遵从度 · 不跑偏 · 构图精准',
  },
];

export async function generateImage(
  model: ImageModel,
  prompt: string,
  negativePrompt: string,
  keys: ApiKeys
): Promise<string> {
  switch (model) {
    case 'flux1dev':  return callFlux1(prompt, negativePrompt, keys.aliyun);
    case 'wanxiang':  return callWanxiang(prompt, negativePrompt, keys.aliyun);
    case 'seedream':  return callSeedream(prompt, negativePrompt, keys.doubao);
    case 'sd35':      return callSD35(prompt, negativePrompt, keys.stabilityai);
  }
}
