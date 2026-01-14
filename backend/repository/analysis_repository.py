"""
数据访问层 (Repository)
负责与 Supabase 数据库交互
"""

from typing import List, Optional, Dict, Any
from supabase import Client
from datetime import datetime

from utils.logger import logger


class AnalysisRepository:
    """分析历史数据访问类"""
    
    def __init__(self, supabase_client: Client):
        """
        初始化 Repository
        
        Args:
            supabase_client: Supabase 客户端实例
        """
        self.supabase = supabase_client
        self.table_name = "analyses"
    
    async def create_analysis(
        self,
        user_id: Optional[str],
        name: str,
        layout_data: Dict[str, Any],
        result_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        保存分析记录到数据库
        
        Args:
            user_id: 用户 ID（可为 None，表示匿名用户）
            name: 缘主姓名
            layout_data: 布局数据
            result_data: 分析结果数据
            
        Returns:
            创建的记录
        """
        try:
            data = {
                "user_id": user_id,
                "name": name,
                "layout_data": layout_data,
                "result_data": result_data
            }
            
            response = self.supabase.table(self.table_name).insert(data).execute()
            
            logger.info(f"分析记录已保存，user_id={user_id}, name={name}")
            return response.data[0] if response.data else {}
            
        except Exception as e:
            logger.error(f"保存分析记录失败: {str(e)}")
            raise
    
    async def get_user_analyses(
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
            分析记录列表
        """
        try:
            response = (
                self.supabase.table(self.table_name)
                .select("*")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .limit(limit)
                .offset(offset)
                .execute()
            )
            
            logger.info(f"获取用户分析历史，user_id={user_id}, count={len(response.data)}")
            return response.data
            
        except Exception as e:
            logger.error(f"获取分析历史失败: {str(e)}")
            raise
    
    async def get_analysis_by_id(
        self,
        analysis_id: str,
        user_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        根据 ID 获取分析记录
        
        Args:
            analysis_id: 分析记录 ID
            user_id: 用户 ID（用于权限验证）
            
        Returns:
            分析记录，如果不存在或无权限则返回 None
        """
        try:
            query = self.supabase.table(self.table_name).select("*").eq("id", analysis_id)
            
            # 如果提供了 user_id，添加权限检查
            if user_id:
                query = query.eq("user_id", user_id)
            
            response = query.execute()
            
            if response.data:
                return response.data[0]
            return None
            
        except Exception as e:
            logger.error(f"获取分析记录失败: {str(e)}")
            raise
    
    async def delete_analysis(
        self,
        analysis_id: str,
        user_id: str
    ) -> bool:
        """
        删除分析记录
        
        Args:
            analysis_id: 分析记录 ID
            user_id: 用户 ID（用于权限验证）
            
        Returns:
            是否删除成功
        """
        try:
            response = (
                self.supabase.table(self.table_name)
                .delete()
                .eq("id", analysis_id)
                .eq("user_id", user_id)
                .execute()
            )
            
            success = len(response.data) > 0
            if success:
                logger.info(f"分析记录已删除，id={analysis_id}")
            else:
                logger.warning(f"未找到可删除的记录，id={analysis_id}, user_id={user_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"删除分析记录失败: {str(e)}")
            raise
