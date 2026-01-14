-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create analyses table
create table public.analyses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users, -- 允许为 null，支持匿名分析
  name text not null,
  layout_data jsonb not null,
  result_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 添加索引提升查询性能
create index idx_analyses_user_id on public.analyses(user_id);
create index idx_analyses_created_at on public.analyses(created_at desc);

-- Enable RLS for analyses
alter table public.analyses enable row level security;

-- 用户可以查看自己的分析记录
create policy "Users can view their own analyses."
  on analyses for select
  using ( auth.uid() = user_id );

-- 用户可以插入自己的分析记录
create policy "Users can insert their own analyses."
  on analyses for insert
  with check ( auth.uid() = user_id );

-- 用户可以更新自己的分析记录
create policy "Users can update their own analyses."
  on analyses for update
  using ( auth.uid() = user_id );

-- 用户可以删除自己的分析记录
create policy "Users can delete their own analyses."
  on analyses for delete
  using ( auth.uid() = user_id );
