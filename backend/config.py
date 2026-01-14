"""
全局配置管理模块
从环境变量读取配置并初始化 Supabase 客户端
"""

from pydantic_settings import BaseSettings
from supabase import create_client, Client
from functools import lru_cache


class Settings(BaseSettings):
    """应用配置类"""
    
    # Supabase 配置
    supabase_url: str
    supabase_key: str
    supabase_service_key: str
    
    # Gemini API 配置
    gemini_api_key: str
    
    # 服务器配置
    port: int = 8000
    host: str = "0.0.0.0"
    environment: str = "development"
    
    # CORS 配置
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """获取配置单例"""
    return Settings()


def get_supabase_client() -> Client:
    """获取 Supabase 客户端（使用 anon key，支持 RLS）"""
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_key)


def get_supabase_admin_client() -> Client:
    """获取 Supabase 管理客户端（使用 service role key，绕过 RLS）"""
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_service_key)
