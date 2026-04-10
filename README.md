# IP开发平台 - 前端

React + TypeScript + Vite 构建的 IP 开发平台前端应用。

## 技术栈

- React 18
- TypeScript 5
- Vite 5
- Zustand (状态管理)
- Ant Design 5
- Three.js (3D 模型预览)
- React Router 6

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 依赖共享包

```bash
npm install @ip-dev/shared @ip-dev/api-client
```

## 环境变量

```bash
# 创建 .env.local
VITE_API_BASE_URL=http://localhost:8000
```

## 目录结构

```
frontend/
├── src/
│   ├── pages/         # 页面组件
│   ├── components/    # 公共组件
│   ├── store/         # Zustand 状态管理
│   ├── App.tsx        # 路由配置
│   └── main.tsx       # 入口文件
├── public/            # 静态资源
├── package.json
├── vite.config.ts    # Vite 配置
└── tsconfig.json     # TypeScript 配置
```
