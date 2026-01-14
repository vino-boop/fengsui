# Supabase 数据库配置

## 目录说明

- `migrations/` - 数据库迁移文件
  - `20260113000000_init.sql` - 初始化数据库 schema
- `config.toml` - Supabase CLI 本地开发配置

## 使用方法

### 方法一：在 Supabase 控制台执行（推荐用于云端项目）

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择您的项目
3. 进入 SQL Editor
4. 复制 `migrations/20260113000000_init.sql` 的内容
5. 执行 SQL 脚本

### 方法二：使用 Supabase CLI（本地开发）

```bash
# 安装 Supabase CLI
npm install -g supabase

# 初始化 Supabase 项目（如果尚未初始化）
supabase init

# 启动本地 Supabase
supabase start

# 应用迁移
supabase db push

# 停止本地 Supabase
supabase stop
```

### 方法三：直接在项目中链接远程数据库

```bash
# 链接到远程项目
supabase link --project-ref your-project-ref

# 推送迁移到远程
supabase db push
```

## 数据库结构

### profiles 表
存储用户资料信息

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键，关联 auth.users |
| full_name | text | 用户姓名 |
| avatar_url | text | 头像 URL |
| created_at | timestamp | 创建时间 |

### analyses 表
存储风水分析记录

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| user_id | uuid | 用户 ID（可为 null） |
| name | text | 缘主姓名 |
| layout_data | jsonb | 布局数据 |
| result_data | jsonb | 分析结果 |
| created_at | timestamp | 创建时间 |

## 安全策略

两个表都启用了 Row Level Security (RLS)：
- 用户只能访问自己的数据
- profiles 表对所有人可见（仅查看）
- analyses 表完全私有

## 索引

为了优化查询性能，已创建以下索引：
- `idx_analyses_user_id` - 按用户 ID 查询
- `idx_analyses_created_at` - 按创建时间排序
- `idx_analyses_name` - 按姓名搜索
