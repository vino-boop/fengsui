-- AI 风水大师 - 初始化数据库 Schema
-- 创建时间: 2026-01-13
-- 说明: 此脚本支持幂等性，可以安全地重复运行

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==================== 1. 用户注册数据表 (profiles) ====================
-- Create profiles table (if not exists)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 创建索引（如果不存在）
do $$ 
begin
  if not exists (select 1 from pg_indexes where indexname = 'idx_profiles_id') then
    create index idx_profiles_id on public.profiles(id);
  end if;
end $$;

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- 删除旧策略并重新创建（确保策略是最新的）
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

drop policy if exists "Users can insert their own profile." on public.profiles;
create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- ==================== 2. 分析记录表 (analyses) ====================
-- Create analyses table (if not exists)
create table if not exists public.analyses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users, -- 允许为 null，支持匿名分析
  name text not null,
  layout_data jsonb not null,
  result_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 创建索引提升查询性能（如果不存在）
do $$ 
begin
  if not exists (select 1 from pg_indexes where indexname = 'idx_analyses_user_id') then
    create index idx_analyses_user_id on public.analyses(user_id);
  end if;
  
  if not exists (select 1 from pg_indexes where indexname = 'idx_analyses_created_at') then
    create index idx_analyses_created_at on public.analyses(created_at desc);
  end if;
  
  if not exists (select 1 from pg_indexes where indexname = 'idx_analyses_name') then
    create index idx_analyses_name on public.analyses(name);
  end if;
end $$;

-- Enable RLS for analyses
alter table public.analyses enable row level security;

-- 删除旧策略并重新创建
drop policy if exists "Users can view their own analyses." on public.analyses;
create policy "Users can view their own analyses."
  on analyses for select
  using ( auth.uid() = user_id );

drop policy if exists "Users can insert their own analyses." on public.analyses;
create policy "Users can insert their own analyses."
  on analyses for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can update their own analyses." on public.analyses;
create policy "Users can update their own analyses."
  on analyses for update
  using ( auth.uid() = user_id );

drop policy if exists "Users can delete their own analyses." on public.analyses;
create policy "Users can delete their own analyses."
  on analyses for delete
  using ( auth.uid() = user_id );

-- ==================== 3. 用户回复记录表 (user_feedbacks) ====================
-- 用于存储用户对分析结果的反馈、评价和回复
create table if not exists public.user_feedbacks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  analysis_id uuid references public.analyses(id) on delete cascade,
  feedback_type text not null check (feedback_type in ('comment', 'rating', 'question', 'complaint')),
  content text not null,
  rating integer check (rating >= 1 and rating <= 5),
  is_resolved boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 创建索引
do $$ 
begin
  if not exists (select 1 from pg_indexes where indexname = 'idx_feedbacks_user_id') then
    create index idx_feedbacks_user_id on public.user_feedbacks(user_id);
  end if;
  
  if not exists (select 1 from pg_indexes where indexname = 'idx_feedbacks_analysis_id') then
    create index idx_feedbacks_analysis_id on public.user_feedbacks(analysis_id);
  end if;
  
  if not exists (select 1 from pg_indexes where indexname = 'idx_feedbacks_created_at') then
    create index idx_feedbacks_created_at on public.user_feedbacks(created_at desc);
  end if;
end $$;

-- Enable RLS
alter table public.user_feedbacks enable row level security;

-- RLS 策略
drop policy if exists "Users can view their own feedbacks." on public.user_feedbacks;
create policy "Users can view their own feedbacks."
  on user_feedbacks for select
  using ( auth.uid() = user_id );

drop policy if exists "Users can insert their own feedbacks." on public.user_feedbacks;
create policy "Users can insert their own feedbacks."
  on user_feedbacks for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can update their own feedbacks." on public.user_feedbacks;
create policy "Users can update their own feedbacks."
  on user_feedbacks for update
  using ( auth.uid() = user_id );

drop policy if exists "Users can delete their own feedbacks." on public.user_feedbacks;
create policy "Users can delete their own feedbacks."
  on user_feedbacks for delete
  using ( auth.uid() = user_id );

-- ==================== 4. 用户画图记录表 (layout_drafts) ====================
-- 用于存储用户的布局绘图草稿，支持保存和加载
create table if not exists public.layout_drafts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users,
  draft_name text not null,
  description text,
  items jsonb not null default '[]'::jsonb,
  rooms jsonb not null default '[]'::jsonb,
  room_width numeric not null default 12,
  room_height numeric not null default 9,
  background_image text,
  is_favorite boolean default false,
  tags text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 创建索引
do $$ 
begin
  if not exists (select 1 from pg_indexes where indexname = 'idx_drafts_user_id') then
    create index idx_drafts_user_id on public.layout_drafts(user_id);
  end if;
  
  if not exists (select 1 from pg_indexes where indexname = 'idx_drafts_created_at') then
    create index idx_drafts_created_at on public.layout_drafts(created_at desc);
  end if;
  
  if not exists (select 1 from pg_indexes where indexname = 'idx_drafts_updated_at') then
    create index idx_drafts_updated_at on public.layout_drafts(updated_at desc);
  end if;
  
  if not exists (select 1 from pg_indexes where indexname = 'idx_drafts_is_favorite') then
    create index idx_drafts_is_favorite on public.layout_drafts(is_favorite);
  end if;
end $$;

-- Enable RLS
alter table public.layout_drafts enable row level security;

-- RLS 策略
drop policy if exists "Users can view their own drafts." on public.layout_drafts;
create policy "Users can view their own drafts."
  on layout_drafts for select
  using ( auth.uid() = user_id );

drop policy if exists "Users can insert their own drafts." on public.layout_drafts;
create policy "Users can insert their own drafts."
  on layout_drafts for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can update their own drafts." on public.layout_drafts;
create policy "Users can update their own drafts."
  on layout_drafts for update
  using ( auth.uid() = user_id );

drop policy if exists "Users can delete their own drafts." on public.layout_drafts;
create policy "Users can delete their own drafts."
  on layout_drafts for delete
  using ( auth.uid() = user_id );

-- ==================== 更新时间触发器 ====================
-- 自动更新 updated_at 字段的函数
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- 为需要的表添加触发器
drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.user_feedbacks;
create trigger set_updated_at
  before update on public.user_feedbacks
  for each row
  execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.layout_drafts;
create trigger set_updated_at
  before update on public.layout_drafts
  for each row
  execute function public.handle_updated_at();

-- ==================== 初始化完成 ====================
-- 数据库初始化完成，包含以下表：
-- 1. profiles - 用户注册数据表
-- 2. analyses - 风水分析记录表
-- 3. user_feedbacks - 用户回复记录表
-- 4. layout_drafts - 用户画图记录表
-- 
-- 本脚本可以安全地重复运行，不会导致错误
