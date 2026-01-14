
import React, { useState, useRef, useMemo } from 'react';
import { FurnitureItem, FurnitureType, Point, Room, RoomPart, RoomType } from '../types';
import { FURNITURE_METADATA, ROOM_TYPES, STRUCTURAL_METADATA, QI_METADATA } from '../constants';
import FurnitureItemView from './FurnitureItemView';

interface Props {
  items: FurnitureItem[];
  setItems: React.Dispatch<React.SetStateAction<FurnitureItem[]>>;
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  roomWidth: number;
  setRoomWidth: (w: number) => void;
  roomHeight: number;
  setRoomHeight: (h: number) => void;
  backgroundImage: string | null;
  darkMode: boolean;
}

const SNAP_INTERVAL = 0.5;
const PROXIMITY_THRESHOLD = 1.5;
const EPSILON = 0.001; 

type RoomTool = 'rect' | 'mainDoor' | 'roomDoor' | 'window' | 'eraser' | 'merge';

interface Segment {
  start: number;
  end: number;
  pos: number;
  type: 'h' | 'v';
}

const LayoutEditor: React.FC<Props> = ({ 
  items, setItems, rooms, setRooms, 
  roomWidth, setRoomWidth, roomHeight, setRoomHeight, backgroundImage,
  darkMode
}) => {
  const [mode, setMode] = useState<'room' | 'furniture'>('room');
  const [roomTool, setRoomTool] = useState<RoomTool>('rect');
  const [furnitureTool, setFurnitureTool] = useState<FurnitureType | null>(null);
  const [hoveredQi, setHoveredQi] = useState<FurnitureType | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawingStart, setDrawingStart] = useState<Point | null>(null);
  const [previewEnd, setPreviewEnd] = useState<Point | null>(null);
  const [pendingRoom, setPendingRoom] = useState<{x: number, y: number, w: number, h: number} | null>(null);
  const [mergeSource, setMergeSource] = useState<Room | null>(null);
  const [hoveredPart, setHoveredPart] = useState<{roomId: string, partIndex: number} | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const wallEdges = useMemo(() => {
    const x = new Set<number>();
    const y = new Set<number>();
    rooms.forEach(r => r.parts.forEach(p => {
      x.add(p.x);
      x.add(p.x + p.width);
      y.add(p.y);
      y.add(p.y + p.height);
    }));
    return { x: Array.from(x), y: Array.from(y) };
  }, [rooms]);

  const snapToGrid = (val: number) => Math.round(val / SNAP_INTERVAL) * SNAP_INTERVAL;

  const getCoords = (e: React.MouseEvent | MouseEvent, shouldSnapToGrid = true) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;

    let snappedX = x;
    let snappedY = y;
    
    let closestX = wallEdges.x.find(ex => Math.abs(ex - x) < PROXIMITY_THRESHOLD);
    if (closestX !== undefined) snappedX = closestX;
    else if (shouldSnapToGrid) snappedX = snapToGrid(x);

    let closestY = wallEdges.y.find(ey => Math.abs(ey - y) < PROXIMITY_THRESHOLD);
    if (closestY !== undefined) snappedY = closestY;
    else if (shouldSnapToGrid) snappedY = snapToGrid(y);

    return { x: snappedX, y: snappedY };
  };

  const findNearestWall = (coords: Point) => {
    let best = { x: coords.x, y: coords.y, rotation: 0, dist: Infinity };
    rooms.forEach(room => {
      room.parts.forEach(part => {
        const edges = [
          { x1: part.x, y1: part.y, x2: part.x + part.width, y2: part.y, rot: 0 },
          { x1: part.x, y1: part.y + part.height, x2: part.x + part.width, y2: part.y + part.height, rot: 0 },
          { x1: part.x, y1: part.y, x2: part.x, y2: part.y + part.height, rot: 90 },
          { x1: part.x + part.width, y1: part.y, x2: part.x + part.width, y2: part.y + part.height, rot: 90 },
        ];
        edges.forEach(edge => {
          let px, py;
          if (edge.rot === 0) {
            px = Math.max(edge.x1, Math.min(edge.x2, coords.x));
            py = edge.y1;
          } else {
            px = edge.x1;
            py = Math.max(edge.y1, Math.min(edge.y2, coords.y));
          }
          const d = Math.sqrt(Math.pow(px - coords.x, 2) + Math.pow(py - coords.y, 2));
          if (d < best.dist) {
            best = { x: px, y: py, rotation: edge.rot, dist: d };
          }
        });
      });
    });
    return best;
  };

  const getBoundarySegments = (room: Room): Segment[] => {
    const finalSegments: Segment[] = [];
    const { parts } = room;
    const xCoords = Array.from(new Set(parts.flatMap(p => [p.x, p.x + p.width]))).sort((a, b) => a - b);
    const yCoords = Array.from(new Set(parts.flatMap(p => [p.y, p.y + p.height]))).sort((a, b) => a - b);

    for (const y of yCoords) {
      for (let i = 0; i < xCoords.length - 1; i++) {
        const x1 = xCoords[i];
        const x2 = xCoords[i + 1];
        const midX = (x1 + x2) / 2;
        let onEdgeCount = 0;
        let isInside = false;
        for (const p of parts) {
          if (midX > p.x + EPSILON && midX < p.x + p.width - EPSILON && y > p.y + EPSILON && y < p.y + p.height - EPSILON) {
            isInside = true;
            break;
          }
          const isOnHorizontalEdge = (Math.abs(y - p.y) < EPSILON || Math.abs(y - (p.y + p.height)) < EPSILON) && (midX >= p.x - EPSILON && midX <= p.x + p.width + EPSILON);
          if (isOnHorizontalEdge) onEdgeCount++;
        }
        if (!isInside && onEdgeCount === 1) finalSegments.push({ type: 'h', pos: y, start: x1, end: x2 });
      }
    }
    for (const x of xCoords) {
      for (let i = 0; i < yCoords.length - 1; i++) {
        const y1 = yCoords[i];
        const y2 = yCoords[i + 1];
        const midY = (y1 + y2) / 2;
        let onEdgeCount = 0;
        let isInside = false;
        for (const p of parts) {
          if (x > p.x + EPSILON && x < p.x + p.width - EPSILON && midY > p.y + EPSILON && midY < p.y + p.height - EPSILON) {
            isInside = true;
            break;
          }
          const isOnVerticalEdge = (Math.abs(x - p.x) < EPSILON || Math.abs(x - (p.x + p.width)) < EPSILON) && (midY >= p.y - EPSILON && midY <= p.y + p.height + EPSILON);
          if (isOnVerticalEdge) onEdgeCount++;
        }
        if (!isInside && onEdgeCount === 1) finalSegments.push({ type: 'v', pos: x, start: y1, end: y2 });
      }
    }
    return finalSegments;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getCoords(e, false);
    if (roomTool === 'eraser' && mode === 'room') {
      let found = null;
      for (const r of rooms) {
        const idx = r.parts.findIndex(p => coords.x >= p.x && coords.x <= p.x + p.width && coords.y >= p.y && coords.y <= p.y + p.height);
        if (idx !== -1) { found = { roomId: r.id, partIndex: idx }; break; }
      }
      setHoveredPart(found);
    } else {
      setHoveredPart(null);
    }
    if (drawingStart) setPreviewEnd(getCoords(e));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (pendingRoom) return; 
    const coords = getCoords(e);

    if (mode === 'room') {
      if (roomTool === 'eraser') {
        let hitPartIdx = -1;
        let hitRoom: Room | null = null;
        for (const r of rooms) {
          const idx = r.parts.findIndex(p => coords.x >= p.x && coords.x <= p.x + p.width && coords.y >= p.y && coords.y <= p.y + p.height);
          if (idx !== -1) { hitPartIdx = idx; hitRoom = r; break; }
        }
        if (hitRoom) {
          const updatedParts = hitRoom.parts.filter((_, i) => i !== hitPartIdx);
          if (updatedParts.length === 0) setRooms(prev => prev.filter(r => r.id !== hitRoom!.id));
          else setRooms(prev => prev.map(r => r.id === hitRoom!.id ? { ...r, parts: updatedParts } : r));
          return;
        }
        return;
      }
      if (roomTool === 'merge') {
        const clickedRoom = rooms.find(r => r.parts.some(p => coords.x >= p.x && coords.x <= p.x + p.width && coords.y >= p.y && coords.y <= p.y + p.height));
        if (!clickedRoom) { setMergeSource(null); return; }
        if (!mergeSource) setMergeSource(clickedRoom);
        else {
          if (mergeSource.id === clickedRoom.id) setMergeSource(null);
          else if (mergeSource.type === clickedRoom.type) {
            setRooms(prev => [...prev.filter(r => r.id !== mergeSource.id && r.id !== clickedRoom.id), { id: Math.random().toString(36).substr(2, 9), type: mergeSource.type, parts: [...mergeSource.parts, ...clickedRoom.parts] }]);
            setMergeSource(null);
          } else setMergeSource(clickedRoom);
        }
        return;
      }
      setDrawingStart(coords);
      setPreviewEnd(coords);
      const onMouseUp = (upEvent: MouseEvent) => {
        const finalCoords = getCoords(upEvent);
        const dx = Math.abs(coords.x - finalCoords.x);
        const dy = Math.abs(coords.y - finalCoords.y);
        if (dx >= SNAP_INTERVAL || dy >= SNAP_INTERVAL) {
          if (roomTool === 'rect') {
            setPendingRoom({ x: Math.min(coords.x, finalCoords.x), y: Math.min(coords.y, finalCoords.y), w: Math.max(dx, SNAP_INTERVAL), h: Math.max(dy, SNAP_INTERVAL) });
          } else if (STRUCTURAL_METADATA[roomTool as FurnitureType]) {
            if (rooms.length > 0) {
              const center = { x: (coords.x + finalCoords.x) / 2, y: (coords.y + finalCoords.y) / 2 };
              const snapPos = findNearestWall(center);
              const type = roomTool as FurnitureType;
              const meta = STRUCTURAL_METADATA[type]!;
              const length = snapPos.rotation === 0 ? (dx / 100) * roomWidth : (dy / 100) * roomHeight;
              setItems(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), type, x: snapPos.x, y: snapPos.y, width: Math.max(length, 0.4), height: meta.defaultSize.h, rotation: snapPos.rotation }]);
            }
          }
        }
        setDrawingStart(null); setPreviewEnd(null); window.removeEventListener('mouseup', onMouseUp);
      };
      window.addEventListener('mouseup', onMouseUp);
    } else if (mode === 'furniture') {
      if (!furnitureTool) return;
      setDrawingStart(coords);
      setPreviewEnd(coords);
      const onMouseUp = (upEvent: MouseEvent) => {
        const finalCoords = getCoords(upEvent);
        const dx = Math.abs(coords.x - finalCoords.x);
        const dy = Math.abs(coords.y - finalCoords.y);
        if (dx >= SNAP_INTERVAL || dy >= SNAP_INTERVAL) {
          const type = furnitureTool;
          const wMeters = (dx / 100) * roomWidth;
          const hMeters = (dy / 100) * roomHeight;
          setItems(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            type,
            x: (coords.x + finalCoords.x) / 2,
            y: (coords.y + finalCoords.y) / 2,
            width: Math.max(wMeters, 0.2),
            height: Math.max(hMeters, 0.2),
            rotation: 0
          }]);
        }
        setDrawingStart(null); setPreviewEnd(null); window.removeEventListener('mouseup', onMouseUp);
      };
      window.addEventListener('mouseup', onMouseUp);
    }
  };

  const finalizeRoom = (type: RoomType, targetRoomId?: string) => {
    if (!pendingRoom) return;
    const newPart: RoomPart = { x: pendingRoom.x, y: pendingRoom.y, width: pendingRoom.w, height: pendingRoom.h };
    if (targetRoomId) setRooms(prev => prev.map(r => r.id === targetRoomId ? { ...r, parts: [...r.parts, newPart] } : r));
    else setRooms(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), type, parts: [newPart] }]);
    setPendingRoom(null);
  };

  const currentPreview = useMemo(() => {
    if (!drawingStart || !previewEnd) return null;
    return { x: Math.min(drawingStart.x, previewEnd.x), y: Math.min(drawingStart.y, previewEnd.y), w: Math.abs(drawingStart.x - previewEnd.x), h: Math.abs(drawingStart.y - previewEnd.y) };
  }, [drawingStart, previewEnd]);

  const qiElements = (Object.keys(QI_METADATA) as FurnitureType[]);
  const furnitureElements = (Object.keys(FURNITURE_METADATA) as FurnitureType[]).filter(t => !STRUCTURAL_METADATA[t] && !QI_METADATA[t]);

  return (
    <div className="flex flex-col gap-6 relative transition-all">
      {/* Floating Toolbar */}
      <div className="flex flex-col gap-4 absolute -left-20 top-0 h-full no-print hidden lg:flex">
         <div className="glass flex flex-col p-2 rounded-2xl shadow-xl space-y-3">
            <button 
              onClick={() => setMode('room')} 
              className={`p-3 rounded-xl transition-all ${mode === 'room' ? 'bg-stone-900 dark:bg-gold text-white dark:text-stone-900 shadow-lg scale-110' : 'text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
              title="结构测绘"
            >
              📐
            </button>
            <button 
              onClick={() => setMode('furniture')} 
              className={`p-3 rounded-xl transition-all ${mode === 'furniture' ? 'bg-stone-900 dark:bg-gold text-white dark:text-stone-900 shadow-lg scale-110' : 'text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
              title="堪舆标识"
            >
              ☯
            </button>
         </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-stone-50/80 dark:bg-stone-800/30 p-4 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm">
        {mode === 'room' ? (
          <div className="flex gap-1 bg-white dark:bg-stone-900 p-1.5 rounded-full shadow-sm border border-stone-100 dark:border-stone-800">
             {(['rect', 'mainDoor', 'roomDoor', 'window', 'merge', 'eraser'] as RoomTool[]).map(t => (
               <button 
                key={t} 
                onClick={() => setRoomTool(t)} 
                className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${
                  roomTool === t ? (t === 'eraser' ? 'bg-red-500 text-white shadow-md' : 'bg-stone-900 dark:bg-gold text-white dark:text-stone-900 shadow-md scale-[1.05]') : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
                }`}
               >
                 {t === 'rect' ? '区域' : t === 'mainDoor' ? '大门' : t === 'roomDoor' ? '房门' : t === 'window' ? '窗户' : t === 'merge' ? '融并' : '橡皮'}
               </button>
             ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto scrollbar-hide py-1">
             <div className="flex gap-2">
               {qiElements.map(type => (
                 <button 
                  key={type} 
                  onClick={() => setFurnitureTool(prev => prev === type ? null : type)}
                  className={`p-2 rounded-2xl border transition-all min-w-[50px] flex flex-col items-center gap-1 ${
                    furnitureTool === type 
                    ? 'bg-stone-900 border-stone-900 text-white dark:bg-gold dark:border-gold dark:text-stone-900 shadow-lg scale-[1.05]' 
                    : 'bg-white border-stone-100 dark:bg-stone-900 dark:border-stone-800 text-stone-500 hover:border-gold/30'
                  }`}
                 >
                   <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d={FURNITURE_METADATA[type].path} /></svg>
                   <span className="text-[8px] font-bold">{FURNITURE_METADATA[type].name}</span>
                 </button>
               ))}
             </div>
             <div className="w-[1px] bg-stone-200 dark:bg-stone-800 my-1" />
             <div className="flex gap-2">
               {furnitureElements.map(type => (
                 <button 
                  key={type} 
                  onClick={() => setFurnitureTool(prev => prev === type ? null : type)}
                  className={`p-2 rounded-2xl border transition-all min-w-[50px] flex flex-col items-center gap-1 ${
                    furnitureTool === type 
                    ? 'bg-stone-900 border-stone-900 text-white dark:bg-gold dark:border-gold dark:text-stone-900 shadow-lg scale-[1.05]' 
                    : 'bg-white border-stone-100 dark:bg-stone-900 dark:border-stone-800 text-stone-500 hover:border-gold/30'
                  }`}
                 >
                   <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d={FURNITURE_METADATA[type].path} /></svg>
                   <span className="text-[8px] font-bold">{FURNITURE_METADATA[type].name}</span>
                 </button>
               ))}
             </div>
          </div>
        )}
      </div>

      <div 
        id="layout-container"
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        className={`relative bg-white dark:bg-stone-950 overflow-hidden select-none border border-stone-200 dark:border-stone-800 rounded-3xl transition-all shadow-inner ${
          roomTool === 'eraser' && mode === 'room' ? 'cursor-not-allowed' : 'cursor-crosshair'
        }`}
        style={{ aspectRatio: `${roomWidth}/${roomHeight}`, maxHeight: '60vh' }}
      >
        <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.07] pointer-events-none zen-pattern text-stone-500 dark:text-gold transition-colors" />
        {backgroundImage && <img src={backgroundImage} alt="Blueprint" className="absolute inset-0 w-full h-full object-contain opacity-20 dark:opacity-40 pointer-events-none grayscale" />}

        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {rooms.map(room => {
            const boundaries = getBoundarySegments(room);
            const mainPart = [...room.parts].sort((a,b) => (b.width*b.height) - (a.width*a.height))[0];
            return (
              <g key={room.id}>
                {room.parts.map((part, idx) => (
                  <rect key={`fill-${idx}`} x={`${part.x}%`} y={`${part.y}%`} width={`${part.width}%`} height={`${part.height}%`} fill={hoveredPart?.roomId === room.id && hoveredPart?.partIndex === idx ? "rgba(239, 68, 68, 0.2)" : ROOM_TYPES[room.type].color} className="transition-all" />
                ))}
                <g stroke={darkMode ? "rgba(191,166,122,0.3)" : "rgba(120, 113, 108, 0.5)"} strokeWidth="3" strokeLinecap="round">
                  {boundaries.map((seg, i) => seg.type === 'h' ? <line key={i} x1={`${seg.start}%`} y1={`${seg.pos}%`} x2={`${seg.end}%`} y2={`${seg.pos}%`} /> : <line key={i} x1={`${seg.pos}%`} y1={`${seg.start}%`} x2={`${seg.pos}%`} y2={`${seg.end}%`} />)}
                </g>
                <text x={`${mainPart.x + mainPart.width/2}%`} y={`${mainPart.y + mainPart.height/2}%`} textAnchor="middle" dominantBaseline="middle" className="fill-stone-500 dark:fill-gold/60 font-black text-[9px] uppercase tracking-widest pointer-events-none">{ROOM_TYPES[room.type].name}</text>
              </g>
            );
          })}
          {currentPreview && <rect x={`${currentPreview.x}%`} y={`${currentPreview.y}%`} width={`${currentPreview.w}%`} height={`${currentPreview.h}%`} fill="rgba(191, 166, 122, 0.08)" stroke={darkMode ? "#bfa67a" : "#8c7851"} strokeWidth="1" strokeDasharray="6,4" />}
        </svg>

        {pendingRoom && (
          <div className="absolute z-[110] glass rounded-3xl p-5 apple-shadow flex flex-col gap-2 min-w-[200px]" style={{ left: `${pendingRoom.x + pendingRoom.w / 2}%`, top: `${pendingRoom.y + pendingRoom.h / 2}%`, transform: 'translate(-50%, -50%)' }}>
            <h3 className="text-[10px] font-black uppercase text-stone-500 tracking-widest mb-3 border-b border-stone-100 dark:border-stone-800 pb-2">定义新区域</h3>
            <div className="grid grid-cols-1 gap-1">
              {Object.entries(ROOM_TYPES).map(([key, meta]) => (
                <button 
                  key={key} 
                  onClick={() => finalizeRoom(key as RoomType)}
                  className="flex items-center justify-between px-4 py-2.5 rounded-2xl hover:bg-stone-900 hover:text-white dark:hover:bg-gold dark:hover:text-stone-900 transition-all group bg-stone-50/50 dark:bg-transparent"
                >
                  <span className="text-xs font-bold">{meta.name}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-sm">+</span>
                </button>
              ))}
            </div>
            <button onClick={() => setPendingRoom(null)} className="text-[10px] font-bold text-red-500 mt-3 hover:underline text-center">取消绘制</button>
          </div>
        )}

        {items.map(item => (
          <FurnitureItemView key={item.id} item={item} roomWidth={roomWidth} roomHeight={roomHeight} snapInterval={SNAP_INTERVAL} isSelected={selectedId === item.id} onSelect={() => setSelectedId(item.id)} onUpdate={(upd) => setItems(prev => prev.map(it => it.id === item.id ? { ...it, ...upd } : it))} onDelete={() => setItems(prev => prev.filter(it => it.id !== item.id))} isStructural={!!STRUCTURAL_METADATA[item.type]} />
        ))}
      </div>
    </div>
  );
};

export default LayoutEditor;
