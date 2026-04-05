# 心易 · XinYi

民俗文化 + 心理疏导导向的电子六爻应用（Web 端原型）。

## 已完成能力

- 组件拆分：`App.tsx` 仅保留状态编排，页面与布局拆到 `src/components/`
- 真实六爻起卦：6 爻随机（少阴/少阳/老阴/老阳）并映射本地 64 卦数据
- 本地持久化：游客历史记录保存到 `localStorage`
- 后端代理：Node.js/Express 代理 DeepSeek，前端不再暴露 API Key
- 用户系统：注册/登录，历史记录绑定账号
- PRD 对齐增强：敏感词过滤、按分类 24 小时限频、AI 三段式输出

## 技术栈

- Frontend: React 19 + TypeScript + Vite + Tailwind CSS + Motion
- Backend: Node.js + Express + MySQL + DeepSeek API

## 目录结构

```txt
xinyi/
├── server/
│   └── index.js
├── src/
│   ├── components/
│   │   ├── layout/
│   │   └── screens/
│   ├── data/
│   ├── services/
│   ├── types/
│   └── App.tsx
└── .env.local
```

## 环境变量

`.env.local` 示例：

```env
DEEPSEEK_API_KEY=your_deepseek_key
APP_URL=http://localhost:3000

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=xinyi
```

## 运行方式

```bash
# 1) 安装依赖
npm install

# 2) 启动后端（3001）
npm run dev:server

# 3) 新开终端启动前端（3000）
npm run dev
```

前端通过 Vite 代理访问 `/api/*`。
