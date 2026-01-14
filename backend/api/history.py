"""
历史记录 API 路由模块
处理分析历史相关的 HTTP 请求
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional

from schema.analysis_schema import (
    SaveAnalysisRequest,
    AnalysisHistoryResponse,
    AnalysisHistory
)
from service.analysis_service import AnalysisService
from repository.analysis_repository import AnalysisRepository
from config import get_supabase_client
from utils.logger import logger

router = APIRouter(prefix="/api/history", tags=["历史记录"])


def require_auth(authorization: Optional[str] = Header(None)) -> str:
    """
    要求用户认证，返回用户 ID
    
    Args:
        authorization: Authorization header
        
    Returns:
        用户 ID
        
    Raises:
        HTTPException: 如果未认证或认证失败
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="未提供认证令牌")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        supabase = get_supabase_client()
        user = supabase.auth.get_user(token)
        
        if user and hasattr(user, 'user') and user.user:
            return user.user.id
        
        raise HTTPException(status_code=401, detail="认证令牌无效")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"认证失败: {str(e)}")
        raise HTTPException(status_code=401, detail="认证失败")


@router.get("", response_model=AnalysisHistoryResponse)
async def get_analysis_history(
    limit: int = 50,
    offset: int = 0,
    user_id: str = Depends(require_auth)
):
    """
    获取当前用户的分析历史记录
    
    - **limit**: 返回记录数量限制（默认 50）
    - **offset**: 偏移量（用于分页）
    """
    try:
        supabase = get_supabase_client()
        repository = AnalysisRepository(supabase)
        analysis_service = AnalysisService(repository)
        
        history = await analysis_service.get_user_history(
            user_id=user_id,
            limit=limit,
            offset=offset
        )
        
        return AnalysisHistoryResponse(
            data=[AnalysisHistory(**item) for item in history],
            count=len(history)
        )
        
    except Exception as e:
        logger.error(f"获取历史记录失败: {str(e)}")
        raise HTTPException(status_code=500, detail="获取历史记录失败")


@router.post("")
async def save_analysis(
    request: SaveAnalysisRequest,
    user_id: str = Depends(require_auth)
):
    """
    手动保存分析结果
    
    - **name**: 缘主姓名
    - **layoutData**: 布局数据
    - **resultData**: 分析结果
    """
    try:
        supabase = get_supabase_client()
        repository = AnalysisRepository(supabase)
        analysis_service = AnalysisService(repository)
        
        result = await analysis_service.save_analysis(
            user_id=user_id,
            name=request.name,
            layout_data=request.layoutData,
            result_data=request.resultData
        )
        
        return {"success": True, "data": result}
        
    except Exception as e:
        logger.error(f"保存分析记录失败: {str(e)}")
        raise HTTPException(status_code=500, detail="保存失败")


@router.delete("/{analysis_id}")
async def delete_analysis(
    analysis_id: str,
    user_id: str = Depends(require_auth)
):
    """
    删除指定的分析记录
    
    - **analysis_id**: 分析记录 ID
    """
    try:
        supabase = get_supabase_client()
        repository = AnalysisRepository(supabase)
        analysis_service = AnalysisService(repository)
        
        success = await analysis_service.delete_analysis(
            analysis_id=analysis_id,
            user_id=user_id
        )
        
        if not success:
            raise HTTPException(status_code=404, detail="记录不存在或无权限删除")
        
        return {"success": True, "message": "删除成功"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"删除分析记录失败: {str(e)}")
        raise HTTPException(status_code=500, detail="删除失败")
