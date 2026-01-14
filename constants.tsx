
import React from 'react';
import { FurnitureType, RoomType } from './types';

// 高级感配色方案：莫兰迪色系 + 低饱和金，提升了白天模式下的辨识度
export const ROOM_TYPES: Record<RoomType, { name: string; color: string }> = {
  livingRoom: { name: '客厅', color: 'rgba(168, 162, 158, 0.25)' }, // 砂砾灰
  bedroom: { name: '卧室', color: 'rgba(191, 166, 122, 0.18)' }, // 浅稻金
  kitchen: { name: '厨房', color: 'rgba(148, 163, 184, 0.22)' }, // 雾霾蓝
  bathroom: { name: '卫生间', color: 'rgba(203, 213, 225, 0.3)' }, // 冰晶蓝
  corridor: { name: '走廊', color: 'rgba(245, 245, 244, 0.4)' }, // 云石白
  balcony: { name: '阳台', color: 'rgba(132, 146, 131, 0.2)' }, // 苔藓绿
  other: { name: '其他', color: 'rgba(0, 0, 0, 0.04)' },
};

export const STRUCTURAL_METADATA: Partial<Record<FurnitureType, { name: string; color: string; defaultSize: { w: number; h: number }; path: string }>> = {
  mainDoor: { 
    name: '住宅大门', 
    color: '#44403c', // 暖深灰
    defaultSize: { w: 1.0, h: 0.2 },
    path: 'M2 20V4h16v16M6 12h2v2H6v-2z'
  },
  roomDoor: { 
    name: '房间门', 
    color: '#78716c', // 中灰
    defaultSize: { w: 0.8, h: 0.15 },
    path: 'M3 21V3h14v18M7 11h2v2H7v-2z'
  },
  window: { 
    name: '窗户', 
    color: '#94a3b8', // 灰蓝
    defaultSize: { w: 1.5, h: 0.15 },
    path: 'M3 3h18v18H3V3zm2 2v6h6V5H5zm8 0v6h6V5h-6zM5 13v6h6v-6H5zm8 0v6h6v-6h-6z'
  },
};

export const QI_METADATA: Partial<Record<FurnitureType, { name: string; color: string; defaultSize: { w: number; h: number }; path: string; description?: string }>> = {
  metal: { 
    name: '金', color: '#e2e8f0', defaultSize: { w: 0.5, h: 0.5 },
    path: 'M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z',
    description: '可代表：铜钟、金属摆件、保险柜、白色/金色装饰。'
  },
  wood: { 
    name: '木', color: '#84cc16', defaultSize: { w: 0.5, h: 0.8 },
    path: 'M12 3v18M8 6h8M6 10h12M4 14h16',
    description: '可代表：绿植、木制家具、高柜、青绿色装饰。'
  },
  activeWater: { 
    name: '动水', color: '#3b82f6', defaultSize: { w: 0.6, h: 0.4 },
    path: 'M2 12c4-4 6 4 10 0s6-4 10 0 M2 16c4-4 6 4 10 0s6-4 10 0 M12 8l2 2-2 2',
    description: '可代表：鱼缸、饮水机、流水造景、加湿器。'
  },
  stillWater: { 
    name: '静水', color: '#1e3a8a', defaultSize: { w: 0.6, h: 0.4 },
    path: 'M4 10c0 4 3 7 8 7s8-3 8-7 M4 10h16 M12 12v1',
    description: '可代表：蓝色地毯、水养植物容器、黑色装饰。'
  },
  fire: { 
    name: '火', color: '#ef4444', defaultSize: { w: 0.5, h: 0.6 },
    path: 'M12 2l-4 8 2 1 2-5 2 5 2-1-4-8z M8 14l4 8 4-8-4 2-4-2z',
    description: '可代表：落地灯、红色饰品、电子设备、取暖器。'
  },
  earth: { 
    name: '土', color: '#bfa67a', defaultSize: { w: 0.6, h: 0.6 },
    path: 'M4 4h16v16H4z M4 4l16 16 M20 4L4 20',
    description: '可代表：陶瓷花瓶、石材摆件、黄色/咖啡色装饰。'
  },
};

export const FURNITURE_METADATA: Record<FurnitureType, { name: string; color: string; defaultSize: { w: number; h: number }; path: string; description?: string }> = {
  ...STRUCTURAL_METADATA,
  ...QI_METADATA,
  bed: { 
    name: '床位', 
    color: '#475569', 
    defaultSize: { w: 1.8, h: 2.0 },
    path: 'M2 7v13h20V7H2zm2 2h7v4H4V9zm9 0h7v4h-7V9z'
  },
  desk: { 
    name: '书桌', 
    color: '#71717a', 
    defaultSize: { w: 1.2, h: 0.6 },
    path: 'M4 8h16v8H4V8zm2 10v2h2v-2H6zm10 0v2h2v-2h-2z'
  },
  diningTable: {
    name: '餐桌',
    color: '#525252', 
    defaultSize: { w: 1.6, h: 0.9 },
    path: 'M4 6h16v2H4V6zm2 2v10h2V8H6zm10 0v10h2V8h-2z'
  },
  stove: {
    name: '灶台',
    color: '#18181b', 
    defaultSize: { w: 0.8, h: 0.6 },
    path: 'M4 4h16v16H4V4zm4 4a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4zM6 16h12'
  },
  mirror: { 
    name: '镜子', 
    color: '#e2e8f0', 
    defaultSize: { w: 0.6, h: 0.1 },
    path: 'M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 18a8 8 0 118-8 8 8 0 01-8 8z'
  },
  screen: { 
    name: '屏风', 
    color: '#bfa67a', 
    defaultSize: { w: 1.2, h: 0.1 },
    path: 'M4 4h16v16H4V4zm4 0v16M12 4v16M16 4v16'
  },
  sofa: { 
    name: '沙发', 
    color: '#64748b', 
    defaultSize: { w: 2.2, h: 0.9 },
    path: 'M4 10v7h16v-7H4zm0-2h16v2H4V8zm-2 9h2v2H2v-2zm18 0h2v2h-2v-2z'
  },
  cabinet: { 
    name: '柜子', 
    color: '#a1a1aa', 
    defaultSize: { w: 1.0, h: 0.4 },
    path: 'M4 4h16v16H4V4zm2 2v4h12V6H6zm0 6v6h12v-6H6z'
  },
  toilet: { 
    name: '马桶', 
    color: '#f1f5f9', 
    defaultSize: { w: 0.5, h: 0.7 },
    path: 'M7 18h10v2H7v-2zm0-4h10v2H7v-2zm8-10H9v8h6V4z'
  },
} as Record<FurnitureType, { name: string; color: string; defaultSize: { w: number; h: number }; path: string; description?: string }>;

export const ANALYSIS_STEPS = [
  "正在读取平面图几何参数...",
  "分析户型拓扑结构与功能分区...",
  "核查门窗朝向、采光与关键气口...",
  "感应五行气场与水位能量分布...",
  "评估灶位、餐位与整体格局...",
  "生成扁平化数字堪舆报告..."
];
