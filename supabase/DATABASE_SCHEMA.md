# 数据库表结构说明

## 表概览

| 表名 | 用途 | 记录数预估 |
|------|------|-----------|
| `profiles` | 用户注册数据表 | ~1000+ |
| `analyses` | 风水分析记录表 | ~10000+ |
| `user_feedbacks` | 用户回复记录表 | ~5000+ |
| `layout_drafts` | 用户画图记录表 | ~20000+ |

---

## 1. profiles - 用户注册数据表

存储用户的基本资料信息。

### 字段说明

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | uuid | PRIMARY KEY | 用户 ID，关联 auth.users |
| `full_name` | text | nullable | 用户姓名 |
| `avatar_url` | text | nullable | 头像 URL |
| `created_at` | timestamp | NOT NULL | 创建时间 |
| `updated_at` | timestamp | NOT NULL | 更新时间（自动） |

### 索引

- `idx_profiles_id` - 主键索引

### RLS 策略

- ✅ 所有人可查看资料（仅查看）
- ✅ 用户可插入自己的资料
- ✅ 用户可更新自己的资料

---

## 2. analyses - 风水分析记录表

存储用户的风水分析记录和结果。

### 字段说明

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | uuid | PRIMARY KEY | 分析记录 ID |
| `user_id` | uuid | FOREIGN KEY (nullable) | 用户 ID，null 表示匿名分析 |
| `name` | text | NOT NULL | 缘主姓名 |
| `layout_data` | jsonb | NOT NULL | 布局数据（rooms, items 等） |
| `result_data` | jsonb | NOT NULL | AI 分析结果 |
| `created_at` | timestamp | NOT NULL | 创建时间 |

### 索引

- `idx_analyses_user_id` - 按用户查询
- `idx_analyses_created_at` - 按时间排序
- `idx_analyses_name` - 按姓名搜索

### RLS 策略

- ✅ 用户可查看自己的分析记录
- ✅ 用户可插入自己的分析记录
- ✅ 用户可更新自己的分析记录
- ✅ 用户可删除自己的分析记录

---

## 3. user_feedbacks - 用户回复记录表 ✨ 新增

存储用户对分析结果的反馈、评价、问题和投诉。

### 字段说明

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | uuid | PRIMARY KEY | 反馈记录 ID |
| `user_id` | uuid | FOREIGN KEY, NOT NULL | 用户 ID |
| `analysis_id` | uuid | FOREIGN KEY (ON DELETE CASCADE) | 关联的分析记录 ID |
| `feedback_type` | text | CHECK | 反馈类型：comment, rating, question, complaint |
| `content` | text | NOT NULL | 反馈内容 |
| `rating` | integer | CHECK (1-5) | 评分（1-5 星） |
| `is_resolved` | boolean | DEFAULT false | 是否已解决（针对问题和投诉） |
| `created_at` | timestamp | NOT NULL | 创建时间 |
| `updated_at` | timestamp | NOT NULL | 更新时间（自动） |

### 反馈类型

- `comment` - 普通评论
- `rating` - 评分
- `question` - 问题咨询
- `complaint` - 投诉反馈

### 索引

- `idx_feedbacks_user_id` - 按用户查询
- `idx_feedbacks_analysis_id` - 按分析记录查询
- `idx_feedbacks_created_at` - 按时间排序

### RLS 策略

- ✅ 用户可查看自己的反馈
- ✅ 用户可添加反馈
- ✅ 用户可更新自己的反馈
- ✅ 用户可删除自己的反馈

### 使用场景

1. **评价分析质量**：用户对分析结果打分评价
2. **提出问题**：对分析结果有疑问时咨询
3. **提供建议**：对服务改进的建议
4. **投诉处理**：对不满意的地方进行投诉

---

## 4. layout_drafts - 用户画图记录表 ✨ 新增

存储用户的布局绘图草稿，支持保存、加载和管理。

### 字段说明

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | uuid | PRIMARY KEY | 草稿 ID |
| `user_id` | uuid | FOREIGN KEY (nullable) | 用户 ID，null 表示匿名草稿 |
| `draft_name` | text | NOT NULL | 草稿名称 |
| `description` | text | nullable | 草稿描述 |
| `items` | jsonb | DEFAULT [] | 家具物品列表 |
| `rooms` | jsonb | DEFAULT [] | 房间列表 |
| `room_width` | numeric | DEFAULT 12 | 房间宽度（米） |
| `room_height` | numeric | DEFAULT 9 | 房间高度（米） |
| `background_image` | text | nullable | 背景图片 URL |
| `is_favorite` | boolean | DEFAULT false | 是否收藏 |
| `tags` | text[] | DEFAULT [] | 标签列表 |
| `created_at` | timestamp | NOT NULL | 创建时间 |
| `updated_at` | timestamp | NOT NULL | 更新时间（自动） |

### 索引

- `idx_drafts_user_id` - 按用户查询
- `idx_drafts_created_at` - 按创建时间排序
- `idx_drafts_updated_at` - 按更新时间排序
- `idx_drafts_is_favorite` - 查询收藏的草稿

### RLS 策略

- ✅ 用户可查看自己的草稿
- ✅ 用户可创建草稿
- ✅ 用户可更新自己的草稿
- ✅ 用户可删除自己的草稿

### 使用场景

1. **保存草稿**：用户在绘制布局时随时保存进度
2. **多方案对比**：保存多个不同的布局方案
3. **收藏管理**：标记常用的布局为收藏
4. **标签分类**：使用标签组织草稿（如"客厅"、"卧室"等）
5. **历史版本**：通过时间戳追踪草稿的修改历史

---

## 触发器

### handle_updated_at()

自动更新 `updated_at` 字段的触发器函数。

**应用于：**
- `profiles` 表
- `user_feedbacks` 表
- `layout_drafts` 表

**作用：** 每次更新记录时自动设置 `updated_at` 为当前 UTC 时间。

---

## 数据关系图

```
auth.users (Supabase Auth)
    ↓ (1:1)
profiles (用户资料)
    ↓ (1:N)
    ├─→ analyses (分析记录)
    │       ↓ (1:N)
    │   user_feedbacks (反馈)
    │
    └─→ layout_drafts (画图草稿)
```

---

## 安全说明

所有表都启用了 **Row Level Security (RLS)**，确保：

1. ✅ 用户只能访问自己的数据
2. ✅ 匿名用户无法访问已登录用户的数据
3. ✅ 删除分析记录时，级联删除相关的反馈
4. ✅ profiles 表对所有人可见（仅查看），便于显示用户信息

---

## 性能优化

1. **索引优化**：所有高频查询字段都添加了索引
2. **JSONB 类型**：使用 JSONB 存储复杂数据，支持高效查询
3. **级联删除**：使用 `ON DELETE CASCADE` 自动清理关联数据
4. **自动触发器**：减少手动更新时间戳的开销

---

## 迁移注意事项

- ✅ 所有 SQL 语句支持幂等性（可重复运行）
- ✅ 使用 `IF NOT EXISTS` 避免重复创建
- ✅ 使用 `DROP POLICY IF EXISTS` 确保策略是最新的
- ✅ 索引创建前检查是否存在
