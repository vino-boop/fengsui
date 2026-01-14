"""
风水分析服务模块
负责调用 DeepSeek API 进行风水分析
"""

import google.generativeai as genai
import json
from typing import List, Dict, Any, Optional

from schema.analysis_schema import (
    FurnitureItem, Room, CompassConfig, AnalysisResult
)
from config import get_settings
from utils.logger import logger


class FengshuiService:
    """风水分析服务类"""
    
    def __init__(self):
        self.settings = get_settings()
        genai.configure(api_key=self.settings.gemini_api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
    
    def _get_direction_name(self, deg: float) -> str:
        """
        根据角度获取方位名称
        
        Args:
            deg: 角度（0-360）
            
        Returns:
            方位名称（如：北 (坎)）
        """
        d = (deg % 360 + 360) % 360
        
        if d >= 337.5 or d < 22.5:
            return "北 (坎)"
        elif d >= 22.5 and d < 67.5:
            return "东北 (艮)"
        elif d >= 67.5 and d < 112.5:
            return "东 (震)"
        elif d >= 112.5 and d < 157.5:
            return "东南 (巽)"
        elif d >= 157.5 and d < 202.5:
            return "南 (离)"
        elif d >= 202.5 and d < 247.5:
            return "西南 (坤)"
        elif d >= 247.5 and d < 292.5:
            return "西 (兑)"
        else:
            return "西北 (乾)"
    
    def _build_system_instruction(
        self,
        config: CompassConfig,
        room_description: str,
        layout_description: str
    ) -> str:
        """
        构建系统指令
        
        Args:
            config: 罗盘配置
            room_description: 房间描述
            layout_description: 布局描述
            
        Returns:
            系统指令字符串
        """
        direction = self._get_direction_name(config.facingRotation)
        user_name = config.userName or "匿名缘主"
        
        return f"""你是一位精通传统堪舆学（风水）与现代居住环境学的数字大师。
你将分析用户提供的户型数据，并返回一个严格格式化的 JSON 报告。

输入背景：
- 用户名/缘主：{user_name}。
- 房屋大门面朝 {direction}。
- 住宅楼层：{config.floor}层。
- 缘主生日：{config.birthday or '未提供'}。
- 房间布局：{room_description}。
- 关键物件：{layout_description}。

分析要求：
1. 报告必须包含对缘主"{user_name}"的直接称呼。
2. 计算评分 (0-100)。
3. 提供总批语（要求雅致、专业、具有玄学深意）。
4. 确定财位方位及催财建议。
5. 根据用户生日给出命理建议。
6. 给出具体的方位调整建议（增加/移除/保持）。

必须严格返回 JSON 格式，不要包含任何 Markdown 代码块。结构如下：
{{
  "score": 数字,
  "summary": "包含称呼的总批语",
  "pros": ["优点1", "优点2"],
  "cons": ["缺点1", "缺点2"],
  "recommendations": ["建议1", "建议2"],
  "baziAnalysis": {{ "missingElements": ["缺金"], "supplementaryAdvice": "补全建议" }},
  "wealthPosition": {{ "location": "具体方位", "suggestion": "建议内容" }},
  "bestBedroom": {{ "roomName": "具体房间", "reason": "理由" }},
  "directionalAdjustments": [ {{ "direction": "方位名", "action": "增加/移除/保持", "item": "物件名", "reason": "依据" }} ],
  "roomAnalysis": [ {{ "roomType": "房间名", "evaluation": "评价", "suggestion": "建议" }} ]
}}"""
    
    async def analyze_layout(
        self,
        items: List[FurnitureItem],
        rooms: List[Room],
        room_width: float,
        room_height: float,
        config: CompassConfig,
        image_base64: Optional[str] = None
    ) -> AnalysisResult:
        """
        分析布局并返回风水报告
        
        Args:
            items: 家具物品列表
            rooms: 房间列表
            room_width: 房间宽度
            room_height: 房间高度
            config: 罗盘配置
            image_base64: 可选的图片 base64 编码
            
        Returns:
            分析结果
            
        Raises:
            Exception: 当 API 调用失败时
        """
        # NOTE: 构建布局描述（简化版，实际可以更详细）
        layout_description = "; ".join([
            f"{item.type}: 位置({item.x}%, {item.y}%)"
            for item in items
        ])
        
        room_description = ", ".join([room.type for room in rooms])
        
        # 构建系统指令
        system_instruction = self._build_system_instruction(
            config, room_description, layout_description
        )
        
        user_name = config.userName or "匿名"
        user_message = f"为缘主"{user_name}"进行堪舆推演。数据：{layout_description}。"
        
        # 调用 Gemini API
        try:
            # 配置生成参数，强制返回 JSON
            generation_config = genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.7
            )
            
            # 使用 chat 模式或 generate_content
            # 这里我们将系统指令和用户消息合并，或者使用 system_instruction (取决于 SDK 版本支持，1.5 flash 支持 system_instruction)
            
            # 重新初始化带系统指令的模型 (如果需要)
            model = genai.GenerativeModel(
                model_name='gemini-1.5-flash',
                system_instruction=system_instruction
            )
            
            response = model.generate_content(
                user_message,
                generation_config=generation_config
            )
            
            content = response.text
            
            # 解析 JSON 结果
            # 有时候 Gemini 返回的代码块格式可能带有 ```json ... ```，但在 response_mime_type="application/json" 下通常直接返回 JSON
            if content.startswith("```json"):
                content = content.replace("```json", "").replace("```", "")
            
            result_dict = json.loads(content)
            
            # 转换为 Pydantic 模型
            result = AnalysisResult(**result_dict)
            
            logger.info(f"风水分析完成，缘主: {user_name}, 评分: {result.score}")
            return result
            
        except Exception as e:
            logger.error(f"风水分析失败: {str(e)}")
            raise Exception(f"AI 分析服务出错: {str(e)}")
