# EasyImg Frontend

基于 Next.js + TailwindCSS 的图片托管服务前端。

## 功能特性

- 多文件上传
- 上传后预览，支持多种格式复制链接（直链、Markdown、BBS、HTML）
- 管理后台（文件管理、上传、删除、重命名）
- JWT 认证
- Cloudflare Turnstile 验证码支持
- 深色模式

## 环境要求

- Node.js 16+
- npm 或 yarn

## 快速开始

1. 安装依赖：
   ```bash
   npm install
   ```

2. 配置环境变量（创建 `.env.local`）：

   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8001/api
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

4. 访问 http://localhost:8002

## 项目结构

```
src/
├── app/              # Next.js app router 页面
│   ├── layout.tsx    # 根布局（含 AuthProvider）
│   ├── page.tsx      # 首页（文件上传）
│   ├── upload/       # 上传页面
│   ├── login/        # 登录页面（含 Turnstile 验证）
│   └── dashboard/    # 管理后台
├── components/       # 通用组件
│   └── AuthProvider.tsx  # 认证上下文
├── lib/              # 工具函数
│   └── api.ts        # 后端 API 通信
└── styles/           # 全局样式
    └── globals.css   # TailwindCSS
```

## 配置

| 环境变量 | 说明 | 默认值 |
|---------|------|--------|
| `NEXT_PUBLIC_API_URL` | 后端 API 地址 | `/api` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile 站点密钥 | `1x00000000000000000000AA`（测试密钥） |

### Cloudflare Turnstile

登录页面集成了 Turnstile 验证码。在 Cloudflare 后台获取站点密钥和密钥密钥：

1. 进入 [Cloudflare Dashboard](https://dash.cloudflare.com/) → Turnstile
2. 添加站点，获取 Site Key 和 Secret Key
3. 前端 `.env.local` 设置 `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
4. 后端 `conf/config.yaml` 设置 `turnstile_secret_key`

> 开发环境使用 `NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA`（始终通过的测试密钥），后端 `debug: true` 时会自动跳过验证。

## 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发模式（端口 8002） |
| `npm run build` | 生产构建 |
| `npm start` | 启动生产模式 |
| `npm run lint` | 代码检查 |

## API 通信

前端直接通过 `NEXT_PUBLIC_API_URL` 配置的地址调用后端 API（不再使用 Next.js 代理转发），后端 CORS 已全开。

- `POST /api/upload` — 上传文件
- `POST /api/v1/login` — 管理员登录
- `GET /api/v1/filelist` — 文件列表
- `POST /api/v1/upload` — 管理员上传
- `DELETE /api/v1/delete` — 删除文件
- `POST /api/v1/rename` — 重命名文件
- `POST /api/v1/addfile` — 新建目录