"""
分析历史服务模块
负责分析历史的业务逻辑
"""

from typing import List, Dict, Any, Optional

from repository.analysis_repository import AnalysisRepository
from schema.analysis_schema import AnalysisResult, AnalysisHistory
from utils.logger import logger


class AnalysisService:
    """分析历史服务类"""
    
    def __init__(self, repository: AnalysisRepository):
        """
        初始化服务
        
        Args:
            repository: 分析数据访问对象
        """
        self.repository = repository
    
    async def save_analysis(
        self,
        user_id: Optional[str],
        name: str,
        layout_data: Dict[str, Any],
        result_data: AnalysisResult
    ) -> Dict[str, Any]:
        """
        保存分析结果
        
        Args:
            user_id: 用户 ID（可为 None）
            name: 缘主姓名
            layout_data: 布局数据
            result_data: 分析结果
            
        Returns:
            保存的记录
        """
        # 将 Pydantic 模型转换为字典
        result_dict = result_data.model_dump()
        
        return await self.repository.create_analysis(
            user_id=user_id,
            name=name,
            layout_data=layout_data,
            result_data=result_dict
        )
    
    async def get_user_history(
        self,
        user_id: str,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """
        获取用户的分析历史
        
        Args:
            user_id: 用户 ID
            limit: 返回记录数量限制
            offset: 偏移量
            
        Returns:
            分析历史列表
        """
        return await self.repository.get_user_analyses(
            user_id=user_id,
            limit=limit,
            offset=offset
        )
    
    async def delete_analysis(
        self,
        analysis_id: str,
        user_id: str
    ) -> bool:
        """
        删除分析记录
        
        Args:
            analysis_id: 分析记录 ID
            user_id: 用户 ID
            
        Returns:
            是否删除成功
        """
        return await self.repository.delete_analysis(
            analysis_id=analysis_id,
            user_id=user_id
        )
