# 项目结构

```
passkey-demo/
├── ui/                    # 前端 Next.js 应用
│   ├── src/
│   │   ├── app/           # App Router 页面
│   │   │   ├── page.tsx   # 首页
│   │   │   ├── layout.tsx # 根布局
│   │   │   └── globals.css # 全局样式
│   │   └── components/    # React 组件 (待创建)
│   ├── public/            # 静态资源
│   └── package.json       # 前端依赖
├── app/                   # 后端服务器
│   ├── src/
│   │   ├── controllers/   # 控制器 (待创建)
│   │   ├── routes/        # 路由 (待创建)
│   │   ├── services/      # 业务逻辑 (待创建)
│   │   ├── storage/       # 数据存储 (待创建)
│   │   └── types/         # 类型定义 (待创建)
│   └── package.json       # 后端依赖
├── docs/                  # 项目文档
│   ├── PROJECT_STRUCTURE.md
│   └── API_DOCS.md        # API 文档 (待创建)
├── CLAUDE.md              # Claude 开发指南
└── README.md              # 项目说明
```

## 开发工作流程

1. **前端开发**：在 `ui/` 目录下工作
   - `pnpm dev` 启动前端开发服务器
   - 端口：3000

2. **后端开发**：在 `app/` 目录下工作  
   - 待定后端启动命令
   - 端口：待定

3. **文档更新**：在 `docs/` 目录下维护项目文档

## 技术栈

- **前端**：Next.js 15 + TypeScript + Tailwind CSS
- **后端**：待定 (Node.js + Express 或其他)
- **存储**：文件存储 (JSON)
- **认证**：FIDO2 WebAuthn Passkeys