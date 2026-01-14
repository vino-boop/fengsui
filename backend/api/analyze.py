"""
分析 API 路由模块
处理风水分析相关的 HTTP 请求
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional

from schema.analysis_schema import AnalyzeRequest, AnalyzeResponse
from service.fengshui_service import FengshuiService
from service.analysis_service import AnalysisService
from repository.analysis_repository import AnalysisRepository
from config import get_supabase_client
from utils.logger import logger

router = APIRouter(prefix="/api", tags=["分析"])


def get_user_id_from_token(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """
    从 Authorization header 中提取用户 ID
    
    Args:
        authorization: Authorization header（格式：Bearer <token>）
        
    Returns:
        用户 ID，如果未认证则返回 None
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    token = authorization.replace("Bearer ", "")
    
    try:
        # 使用 Supabase 验证 token
        supabase = get_supabase_client()
        user = supabase.auth.get_user(token)
        
        if user and hasattr(user, 'user') and user.user:
            return user.user.id
        return None
    except Exception as e:
        logger.warning(f"Token 验证失败: {str(e)}")
        return None


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_layout(
    request: AnalyzeRequest,
    authorization: Optional[str] = Header(None)
):
    """
    分析户型布局并返回风水报告
    
    - **items**: 家具物品列表
    - **rooms**: 房间列表
    - **roomWidth**: 房间宽度（米）
    - **roomHeight**: 房间高度（米）
    - **config**: 罗盘配置（朝向、楼层、生日等）
    - **imageBase64**: 可选的户型图 base64 编码
    """
    try:
        # 获取用户 ID（如果已登录）
        user_id = get_user_id_from_token(authorization)
        
        # 执行风水分析
        fengshui_service = FengshuiService()
        result = await fengshui_service.analyze_layout(
            items=request.items,
            rooms=request.rooms,
            room_width=request.roomWidth,
            room_height=request.roomHeight,
            config=request.config,
            image_base64=request.imageBase64
        )
        
        # 如果用户已登录，自动保存分析结果
        if user_id:
            try:
                supabase = get_supabase_client()
                repository = AnalysisRepository(supabase)
                analysis_service = AnalysisService(repository)
                
                layout_data = {
                    "items": [item.model_dump() for item in request.items],
                    "rooms": [room.model_dump() for room in request.rooms],
                    "roomWidth": request.roomWidth,
                    "roomHeight": request.roomHeight,
                    "config": request.config.model_dump()
                }
                
                await analysis_service.save_analysis(
                    user_id=user_id,
                    name=request.config.userName or "未命名",
                    layout_data=layout_data,
                    result_data=result
                )
                logger.info(f"已自动保存分析结果，user_id={user_id}")
            except Exception as e:
                # 保存失败不影响返回结果
                logger.error(f"自动保存分析结果失败: {str(e)}")
        
        return AnalyzeResponse(result=result)
        
    except Exception as e:
        logger.error(f"分析请求失败: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
