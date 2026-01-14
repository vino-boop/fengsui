
import React, { useState } from 'react';
import { FurnitureItem } from '../types';
import { FURNITURE_METADATA } from '../constants';

interface Props {
  item: FurnitureItem;
  roomWidth: number;
  roomHeight: number;
  snapInterval: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<FurnitureItem>) => void;
  onDelete: () => void;
  isStructural?: boolean;
}

const FurnitureItemView: React.FC<Props> = ({ 
  item, roomWidth, roomHeight, snapInterval, isSelected, onSelect, onUpdate, onDelete, isStructural 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const meta = FURNITURE_METADATA[item.type];
  const widthPct = (item.width / roomWidth) * 100;
  const heightPct = (item.height / roomHeight) * 100;

  const snapValue = (val: number) => Math.round(val / snapInterval) * snapInterval;

  const handleDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    setIsDragging(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialPos = { x: item.x, y: item.y };

    const onMouseMove = (moveEvent: MouseEvent) => {
      const container = document.getElementById('layout-container');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      
      const dxPct = ((moveEvent.clientX - startX) / rect.width) * 100;
      const dyPct = ((moveEvent.clientY - startY) / rect.height) * 100;

      onUpdate({
        x: Math.min(100, Math.max(0, snapValue(initialPos.x + dxPct))),
        y: Math.min(100, Math.max(0, snapValue(initialPos.y + dyPct)))
      });
    };

    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = item.width;
    const startH = item.height;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const container = document.getElementById('layout-container');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      
      const dxMeters = ((moveEvent.clientX - startX) / rect.width) * roomWidth;
      const dyMeters = ((moveEvent.clientY - startY) / rect.height) * roomHeight;
      
      const meterPerSnap = (snapInterval / 100) * Math.max(roomWidth, roomHeight);
      const snapMeters = (val: number) => Math.round(val / meterPerSnap) * meterPerSnap;

      if (isStructural) {
        if (item.rotation === 0 || item.rotation === 180) {
          onUpdate({
            width: Math.max(0.4, snapMeters(startW + dxMeters * 2))
          });
        } else {
          onUpdate({
            width: Math.max(0.4, snapMeters(startW + dyMeters * 2))
          });
        }
      } else {
        onUpdate({
          width: Math.max(meterPerSnap, snapMeters(startW + dxMeters * 2)),
          height: Math.max(meterPerSnap, snapMeters(startH + dyMeters * 2))
        });
      }
    };

    const onMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextRotation = isStructural ? (item.rotation === 0 ? 90 : 0) : (item.rotation + 45) % 360;
    onUpdate({ rotation: nextRotation });
  };

  // 根据背景色深浅动态决定图标颜色
  const isDarkColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 0.299 + g * 0.587 + b * 0.114) < 128;
  };

  const iconColor = isDarkColor(meta.color) ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.4)';

  return (
    <div
      onMouseDown={handleDragStart}
      className={`absolute cursor-move select-none flex flex-col items-center justify-center border-2 
        shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_2px_4px_rgba(0,0,0,0.1)] 
        ${isSelected ? 'border-stone-800 dark:border-gold z-30 ring-4 ring-gold/20 scale-105' : 'border-black/5 dark:border-white/5 z-20 opacity-90 hover:opacity-100'}
        ${isDragging || isResizing ? 'scale-110 shadow-2xl z-50' : 'transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)'}`}
      style={{
        left: `${item.x}%`,
        top: `${item.y}%`,
        width: `${widthPct}%`,
        height: `${heightPct}%`,
        backgroundColor: meta.color,
        transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
      }}
    >
      <div className="flex flex-col items-center justify-center w-full h-full p-2 overflow-hidden pointer-events-none">
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke={iconColor} strokeWidth="1.5">
          <path d={meta.path} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {isSelected && (
        <>
          <div 
            className="absolute -top-14 flex gap-2 rotate-0 pointer-events-auto" 
            style={{ transform: `rotate(${-item.rotation}deg)` }}
            onMouseDown={e => e.stopPropagation()}
          >
            <button onClick={handleRotate} className="bg-stone-900 dark:bg-gold text-white dark:text-stone-950 border-2 border-white/20 px-3 py-1 text-[10px] font-black hover:scale-110 transition-transform shadow-xl uppercase tracking-tighter">
              {isStructural ? '换向' : '旋转'}
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="bg-red-600 text-white border-2 border-white/20 px-3 py-1 text-[10px] font-black hover:scale-110 transition-transform shadow-xl uppercase tracking-tighter">
              删除
            </button>
          </div>
          
          <div 
            onMouseDown={handleResizeStart}
            className="absolute -bottom-2 -right-2 w-5 h-5 bg-stone-900 dark:bg-gold border-2 border-white cursor-se-resize z-40 shadow-xl pointer-events-auto rounded-full flex items-center justify-center"
            style={{ transform: `rotate(${-item.rotation}deg)` }}
          >
            <div className="w-1.5 h-1.5 bg-white/50 rounded-full" />
          </div>
        </>
      )}
    </div>
  );
};

export default FurnitureItemView;
