
export type FurnitureType = 
  | 'bed' | 'desk' | 'mainDoor' | 'roomDoor' | 'window' | 'mirror' | 'screen' | 'sofa' | 'cabinet' | 'toilet'
  | 'diningTable' | 'stove' | 'metal' | 'wood' | 'activeWater' | 'stillWater' | 'fire' | 'earth';

export type RoomType = 'livingRoom' | 'bedroom' | 'kitchen' | 'bathroom' | 'corridor' | 'balcony' | 'other';

export interface Point {
  x: number; // 0-100%
  y: number; // 0-100%
}

export interface RoomPart {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Room {
  id: string;
  type: RoomType;
  parts: RoomPart[];
}

export interface FurnitureItem {
  id: string;
  type: FurnitureType;
  x: number; // Center X %
  y: number; // Center Y %
  width: number; // Meters
  height: number; // Meters
  rotation: number; // Degrees
}

export interface CompassConfig {
  userName?: string;
  facingRotation: number;
  floor: number;
  birthday?: string;
}

export interface DirectionalAdjustment {
  direction: string;
  action: '增加' | '移除' | '保持';
  item: string;
  reason: string;
}

export interface RoomSpecificAnalysis {
  roomType: string;
  evaluation: string;
  suggestion: string;
}

export interface AnalysisResult {
  score: number;
  summary: string;
  pros: string[];
  cons: string[];
  recommendations: string[];
  baziAnalysis: {
    missingElements: string[];
    supplementaryAdvice: string;
  };
  directionalAdjustments: DirectionalAdjustment[];
  roomAnalysis: RoomSpecificAnalysis[];
  wealthPosition: {
    location: string;
    suggestion: string;
  };
  bestBedroom: {
    roomName: string;
    reason: string;
  };
}
