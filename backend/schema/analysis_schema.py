"""
数据验证 Schema 模块
定义所有 API 请求和响应的数据模型
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


# ==================== 基础类型 ====================

class FurnitureItem(BaseModel):
    """家具物品模型"""
    id: str
    type: str
    x: float  # Center X %
    y: float  # Center Y %
    width: float  # Meters
    height: float  # Meters
    rotation: float  # Degrees


class RoomPart(BaseModel):
    """房间部分模型"""
    x: float
    y: float
    width: float
    height: float


class Room(BaseModel):
    """房间模型"""
    id: str
    type: str
    parts: List[RoomPart]


class CompassConfig(BaseModel):
    """罗盘配置模型"""
    userName: Optional[str] = None
    facingRotation: float
    floor: int
    birthday: Optional[str] = None


# ==================== 分析相关 ====================

class DirectionalAdjustment(BaseModel):
    """方位调整建议"""
    direction: str
    action: str  # '增加' | '移除' | '保持'
    item: str
    reason: str


class RoomSpecificAnalysis(BaseModel):
    """房间专项分析"""
    roomType: str
    evaluation: str
    suggestion: str


class BaziAnalysis(BaseModel):
    """八字分析"""
    missingElements: List[str]
    supplementaryAdvice: str


class WealthPosition(BaseModel):
    """财位信息"""
    location: str
    suggestion: str


class BestBedroom(BaseModel):
    """最佳卧室"""
    roomName: str
    reason: str


class AnalysisResult(BaseModel):
    """风水分析结果"""
    score: int = Field(..., ge=0, le=100)
    summary: str
    pros: List[str]
    cons: List[str]
    recommendations: List[str]
    baziAnalysis: BaziAnalysis
    directionalAdjustments: List[DirectionalAdjustment]
    roomAnalysis: List[RoomSpecificAnalysis]
    wealthPosition: WealthPosition
    bestBedroom: BestBedroom


# ==================== API 请求/响应 ====================

class AnalyzeRequest(BaseModel):
    """分析请求模型"""
    items: List[FurnitureItem]
    rooms: List[Room]
    roomWidth: float
    roomHeight: float
    config: CompassConfig
    imageBase64: Optional[str] = None


class AnalyzeResponse(BaseModel):
    """分析响应模型"""
    result: AnalysisResult


class SaveAnalysisRequest(BaseModel):
    """保存分析请求"""
    name: str
    layoutData: Dict[str, Any]
    resultData: AnalysisResult


class AnalysisHistory(BaseModel):
    """分析历史记录"""
    id: str
    user_id: Optional[str] = None
    name: str
    layout_data: Dict[str, Any]
    result_data: Dict[str, Any]
    created_at: datetime


class AnalysisHistoryResponse(BaseModel):
    """历史记录响应"""
    data: List[AnalysisHistory]
    count: int


# ==================== 用户认证相关 ====================

class RegisterRequest(BaseModel):
    """注册请求"""
    email: str
    password: str = Field(..., min_length=6)
    fullName: Optional[str] = None


class LoginRequest(BaseModel):
    """登录请求"""
    email: str
    password: str


class AuthResponse(BaseModel):
    """认证响应"""
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


class UserProfile(BaseModel):
    """用户资料"""
    id: str
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime
