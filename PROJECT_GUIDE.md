# AI 风水大师 - 完整项目文档

## 项目简介

AI 风水大师是一个现代化的智能风水分析系统，结合传统堪舆学与人工智能技术，为用户提供专业的风水分析服务。

## 技术架构

### 前端
- **框架**: React 19.2 + TypeScript
- **构建工具**: Vite 6.2
- **样式**: Vanilla CSS（Apple 设计风格）
- **AI 交互**: DeepSeek API（通过后端代理）

### 后端
- **框架**: FastAPI 0.115+
- **语言**: Python 3.10+
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **AI 服务**: DeepSeek Chat API

### 架构特点
- **分层设计**: API → Service → Repository → Schema
- **前后端分离**: RESTful API 设计
- **用户认证**: 支持注册、登录和匿名使用
- **数据持久化**: 分析历史云端存储

## 功能特性

### 核心功能
1. **户型绘制**
   - 可视化布局编辑器
   - 支持房间和家具物品添加
   - 上传户型图作为背景

2. **风水分析**
   - 基于 AI 的智能分析
   - 综合评分系统（0-100）
   - 详细的改进建议
   - 八字命理分析
   - 方位调整建议

3. **用户系统**
   - 邮箱注册/登录
   - 分析历史保存
   - 匿名体验模式

4. **数据管理**
   - 云端存储
   - 历史记录查询
   - 一键删除记录

## 项目结构

```
aifengshui/
├── frontend/                    # 前端代码（根目录）
│   ├── App.tsx                 # 主应用组件
│   ├── index.tsx               # 入口文件
│   ├── types.ts                # TypeScript 类型定义
│   ├── constants.tsx           # 常量定义
│   ├── components/             # React 组件
│   │   ├── LayoutEditor.tsx   # 布局编辑器
│   │   ├── AnalysisPanel.tsx  # 分析结果面板
│   │   ├── CompassConfiguration.tsx
│   │   ├── RegistrationPage.tsx
│   │   └── FurnitureItemView.tsx
│   ├── services/               # 服务层
│   │   ├── geminiService.ts   # 风水分析服务
│   │   └── authService.ts     # 用户认证服务
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                    # Python 后端
│   ├── main.py                # FastAPI 应用入口
│   ├── config.py              # 配置管理
│   ├── requirements.txt       # Python 依赖
│   ├── .env.example          # 环境变量模板
│   ├── api/                  # API 路由层
│   │   ├── analyze.py       # 分析接口
│   │   ├── history.py       # 历史记录接口
│   │   └── auth.py          # 认证接口
│   ├── service/             # 业务逻辑层
│   │   ├── fengshui_service.py
│   │   └── analysis_service.py
│   ├── repository/          # 数据访问层
│   │   └── analysis_repository.py
│   ├── schema/              # 数据模型层
│   │   └── analysis_schema.py
│   └── utils/               # 工具模块
│       └── logger.py
│
├── supabase_schema.sql         # 数据库 Schema
└── README.md                   # 项目说明
```

## 快速开始

### 前置要求
- Node.js 16+ 和 npm
- Python 3.10+
- Supabase 账号
- DeepSeek API Key

### 1. 配置 Supabase

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 在 SQL Editor 中执行 `supabase_schema.sql`
3. 获取项目的 URL 和 API Keys

### 2. 启动后端

```bash
# 进入后端目录
cd backend

# 创建虚拟环境
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
# 复制 .env.example 为 .env 并填写配置
cp .env.example .env

# 启动服务
uvicorn main:app --reload --port 8000
```

后端将在 `http://localhost:8000` 启动。

### 3. 启动前端

```bash
# 在项目根目录
npm install

# 创建 .env.local 文件
echo "VITE_BACKEND_URL=http://localhost:8000" > .env.local

# 启动开发服务器
npm run dev
```

前端将在 `http://localhost:5173` 启动。

### 4. 访问应用

打开浏览器访问 `http://localhost:5173`

## 环境变量配置

### 后端 (.env)

```env
# Supabase 配置
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# DeepSeek API
DEEPSEEK_API_KEY=your-deepseek-api-key

# 服务器配置
PORT=8000
ALLOWED_ORIGINS=http://localhost:5173
```

### 前端 (.env.local)

```env
VITE_BACKEND_URL=http://localhost:8000
```

## API 文档

后端启动后访问：
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 主要端点

**风水分析**
- `POST /api/analyze` - 提交布局进行分析

**用户认证**
- `POST /api/auth/register` - 注册新用户
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户信息

**历史记录**
- `GET /api/history` - 获取分析历史
- `POST /api/history` - 保存分析结果
- `DELETE /api/history/{id}` - 删除记录

## 部署指南

### 后端部署（Railway 推荐）

1. 在 Railway 创建新项目
2. 连接 GitHub 仓库
3. 添加环境变量
4. Railway 会自动检测并部署 Python 应用

### 前端部署（Vercel 推荐）

1. 在 Vercel 导入项目
2. 设置环境变量 `VITE_BACKEND_URL`
3. 构建命令：`npm run build`
4. 输出目录：`dist`

### 数据库

Supabase 已提供云端托管，无需额外部署。

## 安全注意事项

1. **API Key 保护**
   - 永远不要在前端暴露 DeepSeek API Key
   - 使用后端代理所有 AI 请求

2. **环境变量**
   - 不要提交 `.env` 文件到版本控制
   - 使用 `.env.example` 作为模板

3. **CORS 配置**
   - 生产环境严格限制允许的来源
   - 不要使用通配符 `*`

4. **数据库安全**
   - 启用 Row Level Security (RLS)
   - 只暴露必要的 API
   - 定期审查访问策略

## 开发规范

### Python 后端
- 遵循 PEP 8 代码规范
- 所有函数添加类型注解和 Docstring
- 使用 Pydantic 进行数据验证
- 日志记录所有重要操作

### TypeScript 前端
- 使用函数组件和 Hooks
- Props 必须定义 TypeScript 类型
- 遵循 React 最佳实践
- 组件保持单一职责

### 通用规范
- 代码注释使用中文
- 变量/函数命名使用英文
- Git 提交信息使用中文
- 定期更新依赖包

## 故障排查

### 后端无法启动
- 检查 Python 版本（需要 3.10+）
- 确认所有依赖已安装
- 验证环境变量配置正确

### 前端无法连接后端
- 确认后端服务正在运行
- 检查 `VITE_BACKEND_URL` 配置
- 查看浏览器控制台是否有 CORS 错误

### 数据库连接失败
- 验证 Supabase URL 和 Key
- 确认网络连接正常
- 检查 RLS 策略配置

### AI 分析失败
- 确认 DeepSeek API Key 有效
- 检查账户余额
- 查看后端日志详细错误信息

## 许可证

MIT License

## 联系方式

如有问题，请提交 Issue 或 Pull Request。
