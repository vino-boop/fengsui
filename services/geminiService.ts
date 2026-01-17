
import { GoogleGenAI, Type } from "@google/genai";
import { FurnitureItem, AnalysisResult, Room, CompassConfig } from "../types";
import { FURNITURE_METADATA, ROOM_TYPES, QI_METADATA } from "../constants";

const getDirectionName = (deg: number) => {
  const d = (deg % 360 + 360) % 360;
  if (d >= 337.5 || d < 22.5) return "北 (坎)";
  if (d >= 22.5 && d < 67.5) return "东北 (艮)";
  if (d >= 67.5 && d < 112.5) return "东 (震)";
  if (d >= 112.5 && d < 157.5) return "东南 (巽)";
  if (d >= 157.5 && d < 202.5) return "南 (离)";
  if (d >= 202.5 && d < 247.5) return "西南 (坤)";
  if (d >= 247.5 && d < 292.5) return "西 (兑)";
  return "西北 (乾)";
};

export const analyzeLayout = async (
  items: FurnitureItem[], 
  rooms: Room[], 
  roomWidth: number, 
  roomHeight: number, 
  config: CompassConfig,
  imageBase64?: string
): Promise<AnalysisResult> => {
  // 按照准则，在调用前获取最新的 Key
  const apiKey = process.env.API_KEY;
  
  // 检查是否具备可用的 Key 环境
  if ((!apiKey || apiKey === 'undefined') && typeof window !== 'undefined') {
    const aistudio = (window as any).aistudio;
    const hasKey = aistudio && typeof aistudio.hasSelectedApiKey === 'function' 
      ? await aistudio.hasSelectedApiKey() 
      : false;
      
    if (!hasKey) {
      throw new Error("法力源尚未配置。请返回首页通过“启用法器”配置 API Key。");
    }
  }

  // 即使 process.env.API_KEY 在此时看起来为空，
  // 只要用户在 aistudio 中选择了 Key，底层的 fetch 拦截器通常会自动处理。
  // 但我们必须传入一个非空字符串来避开 SDK 的前端校验。
  const ai = new GoogleGenAI({ apiKey: apiKey || 'managed-by-aistudio' });
  
  const layoutDescription = items.map(item => {
    const meta = FURNITURE_METADATA[item.type];
    const category = QI_METADATA[item.type] ? '五行/气场' : '生活器具';
    return `${category}-${meta.name}: 位置(${item.x}%, ${item.y}%)`;
  }).join('; ');

  const roomDescription = rooms.map(r => ROOM_TYPES[r.type].name).join(', ');

  const systemInstruction = `你是一位精通传统堪舆学（风水）与现代居住环境学的数字大师。
你将分析用户提供的户型数据，并返回一个专业的堪舆报告。

缘主信息：
- 姓名：${config.userName || '匿名缘主'}
- 房屋大门朝向：${getDirectionName(config.facingRotation)}
- 楼层：${config.floor}层
- 生日：${config.birthday || '未提供'}
- 布局分区：${roomDescription}
- 关键物品位置：${layoutDescription}

分析准则：
1. 必须在 summary 中直接称呼缘主。
2. 评价要专业，涉及理气、峦头、五行生克。
3. 财位分析要结合大门朝向。
4. 提供具体的方位调整动作（增加/移除/保持）。`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `请为缘主“${config.userName || '匿名'}”进行堪舆推演。布局数据：${layoutDescription}。`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
            cons: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            baziAnalysis: {
              type: Type.OBJECT,
              properties: {
                missingElements: { type: Type.ARRAY, items: { type: Type.STRING } },
                supplementaryAdvice: { type: Type.STRING }
              },
              required: ["missingElements", "supplementaryAdvice"]
            },
            wealthPosition: {
              type: Type.OBJECT,
              properties: {
                location: { type: Type.STRING },
                suggestion: { type: Type.STRING }
              },
              required: ["location", "suggestion"]
            },
            bestBedroom: {
              type: Type.OBJECT,
              properties: {
                roomName: { type: Type.STRING },
                reason: { type: Type.STRING }
              },
              required: ["roomName", "reason"]
            },
            directionalAdjustments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  direction: { type: Type.STRING },
                  action: { type: Type.STRING, description: "必须是 '增加', '移除' 或 '保持'" },
                  item: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ["direction", "action", "item", "reason"]
              }
            },
            roomAnalysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  roomType: { type: Type.STRING },
                  evaluation: { type: Type.STRING },
                  suggestion: { type: Type.STRING }
                },
                required: ["roomType", "evaluation", "suggestion"]
              }
            }
          },
          required: [
            "score", "summary", "pros", "cons", "recommendations", 
            "baziAnalysis", "wealthPosition", "bestBedroom", 
            "directionalAdjustments", "roomAnalysis"
          ]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI 未返回有效内容");
    
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    
    const message = error.message || "";
    if (message.includes("Requested entity was not found") || message.includes("API Key")) {
      throw new Error("法力源识别失败。请检查 API Key 是否属于已启用计费的 GCP 项目，或尝试重新选择。");
    }
    
    throw new Error("堪舆推演中途受阻，请检查网络连接或稍后再试。");
  }
};
