
import { FurnitureItem, AnalysisResult, Room, CompassConfig } from "../types";

// NOTE: 更新为新的 FastAPI 后端地址
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

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
  try {
    // 获取认证 token（如果用户已登录）
    const token = localStorage.getItem('supabase_token');

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // 如果有 token，添加到请求头
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${BACKEND_URL}/api/analyze`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        items,
        rooms,
        roomWidth,
        roomHeight,
        config,
        imageBase64
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`后台服务异常 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error("连接堪舆服务器失败。请确保后台服务已启动。");
  }
};

/**
 * 获取分析历史记录
 */
export const getAnalysisHistory = async (): Promise<any[]> => {
  try {
    const token = localStorage.getItem('supabase_token');
    if (!token) {
      throw new Error("请先登录");
    }

    const response = await fetch(`${BACKEND_URL}/api/history`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      throw new Error("获取历史记录失败");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Get history error:", error);
    throw error;
  }
};

/**
 * 删除分析记录
 */
export const deleteAnalysis = async (analysisId: string): Promise<void> => {
  try {
    const token = localStorage.getItem('supabase_token');
    if (!token) {
      throw new Error("请先登录");
    }

    const response = await fetch(`${BACKEND_URL}/api/history/${analysisId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      throw new Error("删除失败");
    }
  } catch (error) {
    console.error("Delete analysis error:", error);
    throw error;
  }
};
