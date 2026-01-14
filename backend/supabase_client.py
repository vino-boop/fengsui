"""
Supabase 客户端配置
用于前端与 Supabase 的集成
"""

from supabase import create_client
from config import get_settings

# 获取配置
settings = get_settings()

# 创建 Supabase 客户端（前端使用）
supabase = create_client(settings.supabase_url, settings.supabase_key)
