"""
用户认证 API 路由模块
处理用户注册、登录相关的 HTTP 请求
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional

from schema.analysis_schema import (
    RegisterRequest,
    LoginRequest,
    AuthResponse,
    UserProfile
)
from config import get_supabase_client
from utils.logger import logger

router = APIRouter(prefix="/api/auth", tags=["用户认证"])


@router.post("/register", response_model=AuthResponse)
async def register(request: RegisterRequest):
    """
    用户注册
    
    - **email**: 邮箱地址
    - **password**: 密码（至少 6 位）
    - **fullName**: 可选的姓名
    """
    try:
        supabase = get_supabase_client()
        
        # 使用 Supabase Auth 注册用户
        auth_response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {
                "data": {
                    "full_name": request.fullName
                }
            }
        })
        
        if not auth_response.user:
            raise HTTPException(status_code=400, detail="注册失败")
        
        # 创建用户资料记录
        try:
            supabase.table("profiles").insert({
                "id": auth_response.user.id,
                "full_name": request.fullName,
            }).execute()
        except Exception as e:
            logger.warning(f"创建用户资料失败（可能已存在）: {str(e)}")
        
        logger.info(f"新用户注册: {request.email}")
        
        return AuthResponse(
            access_token=auth_response.session.access_token if auth_response.session else "",
            user={
                "id": auth_response.user.id,
                "email": auth_response.user.email,
                "full_name": request.fullName
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"注册失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"注册失败: {str(e)}")


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """
    用户登录
    
    - **email**: 邮箱地址
    - **password**: 密码
    """
    try:
        supabase = get_supabase_client()
        
        # 使用 Supabase Auth 登录
        auth_response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        
        if not auth_response.user or not auth_response.session:
            raise HTTPException(status_code=401, detail="邮箱或密码错误")
        
        # 获取用户资料
        profile_response = supabase.table("profiles").select("*").eq("id", auth_response.user.id).execute()
        profile = profile_response.data[0] if profile_response.data else {}
        
        logger.info(f"用户登录: {request.email}")
        
        return AuthResponse(
            access_token=auth_response.session.access_token,
            user={
                "id": auth_response.user.id,
                "email": auth_response.user.email,
                "full_name": profile.get("full_name"),
                "avatar_url": profile.get("avatar_url")
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"登录失败: {str(e)}")
        raise HTTPException(status_code=401, detail="登录失败")


@router.post("/logout")
async def logout(authorization: Optional[str] = Header(None)):
    """
    用户登出
    """
    try:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="未提供认证令牌")
        
        token = authorization.replace("Bearer ", "")
        supabase = get_supabase_client()
        
        # Supabase 登出
        supabase.auth.sign_out()
        
        logger.info("用户登出")
        return {"success": True, "message": "登出成功"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"登出失败: {str(e)}")
        raise HTTPException(status_code=500, detail="登出失败")


@router.get("/me", response_model=UserProfile)
async def get_current_user(authorization: Optional[str] = Header(None)):
    """
    获取当前登录用户信息
    """
    try:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="未提供认证令牌")
        
        token = authorization.replace("Bearer ", "")
        supabase = get_supabase_client()
        
        # 验证 token 并获取用户信息
        user = supabase.auth.get_user(token)
        
        if not user or not hasattr(user, 'user') or not user.user:
            raise HTTPException(status_code=401, detail="认证令牌无效")
        
        # 获取用户资料
        profile_response = supabase.table("profiles").select("*").eq("id", user.user.id).execute()
        profile = profile_response.data[0] if profile_response.data else {}
        
        return UserProfile(
            id=user.user.id,
            email=user.user.email,
            full_name=profile.get("full_name"),
            avatar_url=profile.get("avatar_url"),
            created_at=user.user.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取用户信息失败: {str(e)}")
        raise HTTPException(status_code=401, detail="获取用户信息失败")
