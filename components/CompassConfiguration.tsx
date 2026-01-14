
import React, { useState, useRef, useEffect } from 'react';
import { Room, FurnitureItem, CompassConfig } from '../types';
import { ROOM_TYPES, FURNITURE_METADATA } from '../constants';

interface Props {
  rooms: Room[];
  items: FurnitureItem[];
  roomWidth: number;
  roomHeight: number;
  backgroundImage: string | null;
  onConfirm: (config: CompassConfig) => void;
  onBack: () => void;
}

const CompassConfiguration: React.FC<Props> = ({ rooms, items, roomWidth, roomHeight, backgroundImage, onConfirm, onBack }) => {
  const [rotation, setRotation] = useState(0);
  const [floor, setFloor] = useState(1);
  const [birthday, setBirthday] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const compassRef = useRef<HTMLDivElement>(null);
  const startAngleRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!compassRef.current) return;
    setIsDragging(true);
    const rect = compassRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    startAngleRef.current = angle - rotation;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !compassRef.current) return;
      const rect = compassRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
      setRotation(angle - startAngleRef.current);
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const getDirectionText = (deg: number) => {
    const d = (deg % 360 + 360) % 360;
    if (d >= 337.5 || d < 22.5) return "正北 (坎)";
    if (d >= 22.5 && d < 67.5) return "东北 (艮)";
    if (d >= 67.5 && d < 112.5) return "正东 (震)";
    if (d >= 112.5 && d < 157.5) return "东南 (巽)";
    if (d >= 157.5 && d < 202.5) return "正南 (离)";
    if (d >= 202.5 && d < 247.5) return "西南 (坤)";
    if (d >= 247.5 && d < 292.5) return "正西 (兑)";
    return "西北 (乾)";
  };

  const directions = [
    { label: '坎', angle: 0 },
    { label: '艮', angle: 45 },
    { label: '震', angle: 90 },
    { label: '巽', angle: 135 },
    { label: '离', angle: 180 },
    { label: '坤', angle: 225 },
    { label: '兑', angle: 270 },
    { label: '乾', angle: 315 }
  ];

  const earthlyBranches = [
    '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'
  ];

  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500 transition-colors">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black tracking-[0.3em] uppercase text-stone-800 dark:text-gold transition-colors">立极定方 · 气象合一</h2>
        <p className="text-[10px] font-bold text-stone-400 dark:text-gold/40 uppercase tracking-widest">Rotate the compass overlay to define house facing</p>
      </div>

      <div className="relative flex items-center justify-center w-full max-w-4xl aspect-square md:aspect-video bg-stone-100 dark:bg-stone-900 border-2 border-stone-800 dark:border-gold/30 overflow-hidden shadow-[20px_20px_0px_0px_rgba(28,25,23,0.03)] dark:shadow-[20px_20px_0px_0px_rgba(184,155,114,0.02)] group transition-colors">
        
        {/* 地形底图 */}
        <div className="absolute inset-0 flex items-center justify-center p-8 transition-all duration-700 group-hover:scale-[1.02]">
          {backgroundImage ? (
            <img src={backgroundImage} alt="Floorplan" className="w-full h-full object-contain opacity-70 grayscale contrast-125 dark:opacity-40" />
          ) : (
            <div className="w-full h-full opacity-30 dark:opacity-10">
              <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio={`${roomWidth}/${roomHeight}`}>
                {rooms.map(room => room.parts.map((p, i) => <rect key={i} x={p.x} y={p.y} width={p.width} height={p.height} fill="currentColor" className="text-stone-400 dark:text-gold" />))}
              </svg>
            </div>
          )}
        </div>

        {/* 红线指针 */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-red-600/40 pointer-events-none z-30">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-red-600 text-white text-[10px] font-black shadow-xl whitespace-nowrap uppercase tracking-widest">
            {getDirectionText(rotation)}
          </div>
          <div className="absolute top-[3.25rem] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-red-600"></div>
        </div>

        {/* 罗盘叠加层 (40% 透明度) */}
        <div 
          ref={compassRef}
          onMouseDown={handleMouseDown}
          className="relative w-80 h-80 md:w-[450px] md:h-[450px] cursor-grab active:cursor-grabbing select-none z-20 opacity-40 hover:opacity-70 dark:opacity-50 dark:hover:opacity-90 transition-opacity duration-300"
        >
          {/* 旋转罗盘主体 */}
          <div 
            className="absolute inset-0 rounded-full border-[10px] border-stone-900 dark:border-gold bg-stone-200/80 dark:bg-stone-800/90 shadow-2xl flex items-center justify-center transition-colors"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {/* 方位环 */}
            {directions.map(dir => (
              <div key={dir.label} className="absolute h-full left-1/2 -translate-x-1/2 py-6 flex flex-col items-center" style={{ transform: `rotate(${dir.angle}deg)` }}>
                <span 
                  className="text-lg font-black text-stone-900 dark:text-gold-light transition-colors" 
                  style={{ transform: `rotate(${-dir.angle - rotation}deg)` }}
                >
                  {dir.label}
                </span>
                <div className="w-[1px] h-4 bg-stone-900/40 dark:bg-gold/40 mt-1"></div>
              </div>
            ))}

            {/* 十二地支环 */}
            {earthlyBranches.map((branch, idx) => (
              <div key={branch} className="absolute h-full left-1/2 -translate-x-1/2 py-20 flex flex-col items-center" style={{ transform: `rotate(${idx * 30}deg)` }}>
                <span 
                  className="text-[10px] font-bold text-stone-600 dark:text-gold/60 transition-colors" 
                  style={{ transform: `rotate(${-idx * 30 - rotation}deg)` }}
                >
                  {branch}
                </span>
              </div>
            ))}

            {/* 装饰线条 */}
            <div className="absolute inset-[15%] rounded-full border border-stone-800/20 dark:border-gold/10" />
            <div className="absolute inset-[30%] rounded-full border-2 border-stone-800/40 dark:border-gold/30" />
            <div className="absolute inset-[45%] rounded-full border border-stone-800/20 dark:border-gold/10" />
          </div>

          {/* 罗盘中心太极 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-white dark:bg-stone-900 border-4 border-stone-900 dark:border-gold flex items-center justify-center shadow-lg transition-colors">
              <span className="text-3xl font-black text-stone-900 dark:text-gold">☯</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-lg space-y-8 bg-white dark:bg-stone-900 border-2 border-stone-800 dark:border-gold/30 p-8 shadow-[12px_12px_0px_0px_rgba(28,25,23,0.05)] dark:shadow-[12px_12px_0px_0px_rgba(184,155,114,0.05)] transition-colors">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-stone-400 dark:text-gold/40 uppercase tracking-widest block">所在楼层 / FLOOR LEVEL</label>
            <div className="flex items-center border-2 border-stone-800 dark:border-gold/30 bg-stone-50 dark:bg-stone-800 overflow-hidden transition-colors">
              <button onClick={() => setFloor(Math.max(1, floor - 1))} className="px-5 py-2 font-black hover:bg-stone-800 dark:hover:bg-gold hover:text-white dark:hover:text-stone-900 transition-all text-xl">-</button>
              <input 
                type="number" 
                value={floor} 
                onChange={e => setFloor(Math.max(1, Number(e.target.value)))}
                className="flex-1 text-center font-black text-lg bg-transparent outline-none dark:text-gold-light"
              />
              <button onClick={() => setFloor(floor + 1)} className="px-5 py-2 font-black hover:bg-stone-800 dark:hover:bg-gold hover:text-white dark:hover:text-stone-900 transition-all text-xl">+</button>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-stone-400 dark:text-gold/40 uppercase tracking-widest block">阳历生日 / BIRTH DATE (SOLAR)</label>
            <input 
              type="date" 
              value={birthday}
              onChange={e => setBirthday(e.target.value)}
              className="w-full border-2 border-stone-800 dark:border-gold/30 bg-stone-50 dark:bg-stone-800 px-4 py-2.5 text-sm font-black outline-none focus:ring-4 ring-stone-100 dark:ring-gold/10 transition-all uppercase dark:text-gold-light"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={onBack}
            className="flex-1 py-4 border-2 border-stone-800 dark:border-gold/40 text-[11px] font-black hover:bg-stone-50 dark:hover:bg-stone-800 dark:text-stone-300 transition-all uppercase tracking-widest"
          >
            返回布局修改
          </button>
          <button 
            onClick={() => onConfirm({ facingRotation: rotation, floor, birthday })}
            className="flex-[2] py-4 bg-stone-900 dark:bg-gold text-white dark:text-stone-900 text-[11px] font-black shadow-[6px_6px_0px_0px_rgba(28,25,23,0.3)] dark:shadow-[6px_6px_0px_0px_rgba(184,155,114,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase tracking-[0.4em]"
          >
            开启推演引擎
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompassConfiguration;
