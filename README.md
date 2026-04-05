# 心易 · XinYi

民俗文化 + 心理疏导导向的电子六爻应用（Web 端原型）。

## 已完成能力

- 组件拆分：`App.tsx` 仅保留状态编排，页面与布局拆到 `src/components/`
- 真实六爻起卦：6 爻随机（少阴/少阳/老阴/老阳）并映射本地 64 卦数据
- 本地持久化：游客历史记录保存到 `localStorage`
- 后端代理：Node.js/Express 代理 SiliconFlow，前端不再暴露 API Key
- 用户系统：注册/登录，历史记录绑定账号
- PRD 对齐增强：敏感词过滤、按分类 24 小时限频、AI 三段式输出

## 技术栈

- Frontend: React 19 + TypeScript + Vite + Tailwind CSS + Motion
- Backend: Node.js + Express + MySQL + SiliconFlow API

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

完整变量列表见 [`.env.example`](.env.example)。

### 本地开发

复制 `.env.example` 为 `.env.local` 并填写实际值：

```env
SILICONFLOW_API_KEY=your_siliconflow_key
SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1
SILICONFLOW_MODEL=deepseek-ai/DeepSeek-V3
APP_URL=http://localhost:3000

# 本地 MySQL（DB_* 变量名同样支持）
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=xinyi
```

### Railway 部署

在 Railway 控制台为 xinyi 服务添加以下环境变量，并将 MySQL 相关变量设置为对 MySQL 服务插件的引用（Reference Variable）：

| 变量名 | 值（Railway 引用写法） | 说明 |
|---|---|---|
| `MYSQLHOST` | `${{MySQL.MYSQLHOST}}` | MySQL 服务主机名 |
| `MYSQLPORT` | `${{MySQL.MYSQLPORT}}` | MySQL 服务端口 |
| `MYSQLUSER` | `${{MySQL.MYSQLUSER}}` | MySQL 用户名 |
| `MYSQLPASSWORD` | `${{MySQL.MYSQLPASSWORD}}` | MySQL 密码 |
| `MYSQLDATABASE` | `${{MySQL.MYSQLDATABASE}}` | 数据库名 |
| `SILICONFLOW_API_KEY` | *(your key)* | SiliconFlow API 密钥 |
| `SILICONFLOW_BASE_URL` | `https://api.siliconflow.cn/v1` | 可选，有默认值 |
| `SILICONFLOW_MODEL` | `deepseek-ai/DeepSeek-V3` | 可选，有默认值 |
| `PORT` | *(Railway 自动注入)* | 可选，默认 3001 |

> **注意**：如果不配置 MySQL 引用变量，应用启动时会报 `ECONNREFUSED 127.0.0.1:3306`，因为它会尝试连接本地 MySQL 而非 Railway 托管的数据库实例。
>
> 也可以使用单一连接字符串：将 `MYSQL_URL` 或 `DATABASE_URL` 设置为 `${{MySQL.MYSQL_URL}}`（如果 Railway MySQL 插件提供该变量）。

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
