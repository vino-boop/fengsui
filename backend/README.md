# AI 风水大师 - Python 后端服务

基于 FastAPI 的智能风水分析系统后端服务，集成 Supabase 数据库和 DeepSeek AI。

## 功能特性

- ✅ **风水分析**：调用 DeepSeek AI 进行专业风水分析
- ✅ **用户认证**：基于 Supabase Auth 的完整用户系统
- ✅ **历史记录**：保存和管理分析历史
- ✅ **数据持久化**：使用 Supabase PostgreSQL 存储
- ✅ **分层架构**：API → Service → Repository → Schema 标准架构

## 技术栈

- **框架**：FastAPI 0.115+
- **数据库**：Supabase (PostgreSQL)
- **AI 服务**：DeepSeek API
- **认证**：Supabase Auth
- **数据验证**：Pydantic

## 项目结构

```
backend/
├── main.py                     # 应用入口
├── config.py                   # 配置管理
├── requirements.txt            # 依赖包
├── .env.example               # 环境变量模板
├── api/                       # API 路由层
│   ├── analyze.py            # 分析接口
│   ├── history.py            # 历史记录接口
│   └── auth.py               # 认证接口
├── service/                   # 业务逻辑层
│   ├── fengshui_service.py   # 风水分析服务
│   └── analysis_service.py   # 历史记录服务
├── repository/                # 数据访问层
│   └── analysis_repository.py
├── schema/                    # 数据模型层
│   └── analysis_schema.py
└── utils/                     # 工具模块
    └── logger.py             # 日志工具
```

## 快速开始

### 1. 安装依赖

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```bash
# Supabase 配置（在 Supabase 控制台获取）
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# DeepSeek API 配置
DEEPSEEK_API_KEY=your-deepseek-api-key

# 服务器配置
PORT=8000
ALLOWED_ORIGINS=http://localhost:5173
```

### 3. 配置 Supabase 数据库

在 Supabase 控制台的 SQL Editor 中执行 `../supabase_schema.sql` 文件内容。

### 4. 启动服务

```bash
# 开发模式（自动重载）
uvicorn main:app --reload --port 8000

# 生产模式
uvicorn main:app --host 0.0.0.0 --port 8000
```

服务将在 `http://localhost:8000` 启动。

## API 接口文档

启动服务后访问：
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 主要接口

#### 1. 风水分析
```
POST /api/analyze
```

#### 2. 用户认证
```
POST /api/auth/register    # 注册
POST /api/auth/login       # 登录
POST /api/auth/logout      # 登出
GET  /api/auth/me          # 获取当前用户
```

#### 3. 历史记录
```
GET    /api/history        # 获取历史记录
POST   /api/history        # 保存分析结果
DELETE /api/history/{id}   # 删除记录
```

## 前端集成

更新前端 `services/geminiService.ts` 中的 API 地址：

```typescript
const BACKEND_URL = "http://localhost:8000/api/analyze";
```

## 部署说明

### 使用 Docker

```bash
# 构建镜像
docker build -t fengshui-backend .

# 运行容器
docker run -p 8000:8000 --env-file .env fengshui-backend
```

### 云平台部署

推荐部署平台：
- **Railway**: 自动化部署，支持 Python
- **Vercel**: 支持 Serverless 部署
- **Heroku**: 传统 PaaS 平台

## 安全注意事项

1. **API Key 保护**：永远不要将 `.env` 文件提交到版本控制
2. **CORS 配置**：生产环境请严格限制允许的来源
3. **数据库安全**：确保 RLS（行级安全）策略正确配置
4. **HTTPS**：生产环境必须使用 HTTPS

## 日志

日志输出到控制台，包含以下级别：
- `INFO`: 正常操作日志
- `WARNING`: 警告信息
- `ERROR`: 错误信息

## 开发规范

- 遵循 Python PEP 8 代码规范
- 所有函数必须添加类型注解和 Docstring
- 使用 Pydantic 进行数据验证
- 错误信息使用中文，便于用户理解

## 许可证

MIT License
