
import React, { useState, useRef, useEffect } from 'react';
import { Trash2, RotateCw, Scaling, Quote, Target, ArrowUp, ArrowDown, Layers, Type, Palette, AlignLeft, AlignCenter, AlignRight, Sliders, BringToFront, SendToBack, X, Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { VisionItem } from '../../types';

interface FreeFormItemProps {
  item: VisionItem;
  items?: VisionItem[];
  isEditing: boolean;
  onUpdate: (id: string, updates: Partial<VisionItem>) => void;
  onDelete: (id: string) => void;
  onSelect: () => void;
  isSelected: boolean;
  zoom: number;
}

const COLORS = ['#ffffff', '#000000', '#f87171', '#fbbf24', '#34d399', '#60a5fa', '#818cf8', '#a78bfa', '#f472b6', '#e5e7eb', 'transparent'];
const FONTS = ['Inter', 'Serif', 'Poppins', 'Mono', 'Georgia', 'Arial Black', 'Cursive', 'Fantasy'];

export const FreeFormItem: React.FC<FreeFormItemProps> = ({ 
  item, items = [], isEditing, onUpdate, onDelete, onSelect, isSelected, zoom
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const [localPos, setLocalPos] = useState({ x: item.x ?? 1500, y: item.y ?? 1500 });
  const [localSize, setLocalSize] = useState({ width: item.widthPx ?? 300, height: item.heightPx ?? 350 });
  const [localRot, setLocalRot] = useState(item.rotation ?? 0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [activeTool, setActiveTool] = useState<'none' | 'color' | 'text' | 'layers' | 'style'>('none');

  const posRef = useRef(localPos);
  const sizeRef = useRef(localSize);
  const rotRef = useRef(localRot);

  useEffect(() => {
    if (!isInteracting) {
      setLocalPos({ x: item.x ?? 1500, y: item.y ?? 1500 });
      setLocalSize({ width: item.widthPx ?? 300, height: item.heightPx ?? 350 });
      setLocalRot(item.rotation ?? 0);
    }
  }, [item, isInteracting]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isEditing) return;
    if ((e.target as HTMLElement).closest('button')) return;
    
    onSelect();
    setIsInteracting(true);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const startX = clientX;
    const startY = clientY;
    const initialPos = { ...localPos };

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      const moveX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const moveY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      const dx = (moveX - startX) / zoom;
      const dy = (moveY - startY) / zoom;
      const newPos = { x: initialPos.x + dx, y: initialPos.y + dy };
      posRef.current = newPos;
      setLocalPos(newPos);
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
      onUpdate(item.id, { x: posRef.current.x, y: posRef.current.y });
      setIsInteracting(false);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  };

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsInteracting(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const startX = clientX;
    const startY = clientY;
    const initialSize = { ...localSize };

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      const moveX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const moveY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      const dx = (moveX - startX) / zoom;
      const dy = (moveY - startY) / zoom;
      const newSize = { width: Math.max(50, initialSize.width + dx), height: Math.max(50, initialSize.height + dy) };
      sizeRef.current = newSize;
      setLocalSize(newSize);
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
      onUpdate(item.id, { widthPx: sizeRef.current.width, heightPx: sizeRef.current.height });
      setIsInteracting(false);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  };

  const handleRotateStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsInteracting(true);
    if (!nodeRef.current) return;
    const rect = nodeRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const startMouseAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
    const initialItemRotation = localRot;

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      const moveX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const moveY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      const currentMouseAngle = Math.atan2(moveY - centerY, moveX - centerX) * (180 / Math.PI);
      const deltaAngle = currentMouseAngle - startMouseAngle;
      const newRot = initialItemRotation + deltaAngle;
      rotRef.current = newRot;
      setLocalRot(newRot);
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
      onUpdate(item.id, { rotation: rotRef.current });
      setIsInteracting(false);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  };

  const changeLayer = (action: 'up' | 'down' | 'front' | 'back') => {
    const allIndices = items.map(i => i.zIndex || 1).sort((a, b) => a - b);
    const currentZ = item.zIndex || 1;
    const maxZ = allIndices[allIndices.length - 1] || 1;
    const minZ = allIndices[0] || 1;
    let newZ = currentZ;
    if (action === 'front') newZ = maxZ + 1;
    else if (action === 'back') newZ = minZ - 1;
    else if (action === 'up') newZ = currentZ + 1;
    else if (action === 'down') newZ = currentZ - 1;
    onUpdate(item.id, { zIndex: newZ });
  };

  const updateStyle = (key: keyof VisionItem, value: any) => onUpdate(item.id, { [key]: value });

  const renderContent = () => {
    switch (item.type) {
      case 'image':
        return <img src={item.content} className="w-full h-full object-cover pointer-events-none" style={{ borderRadius: `${item.borderRadius || 24}px` }} />;
      case 'quote':
        return <div className="p-6 h-full flex flex-col items-center justify-center text-center"><Quote size={20} className="mb-2 opacity-20" /><p className="italic font-serif leading-tight" style={{ fontSize: `${item.fontSize || 20}px` }}>{item.content}</p></div>;
      case 'affirmation':
        return <div className="p-6 h-full flex items-center justify-center text-center"><h3 className="font-black uppercase leading-none" style={{ fontSize: `${item.fontSize || 48}px`, fontFamily: item.fontFamily }}>{item.content}</h3></div>;
      case 'sticker':
        const Icon = (LucideIcons as any)[item.content] || LucideIcons.Star;
        return <div className="p-2 h-full flex items-center justify-center"><Icon size="80%" strokeWidth={1.5} color={item.textColor || '#000'} /></div>;
      case 'goal_ref':
        return <div className="p-6 h-full bg-slate-900 text-white rounded-[inherit] flex flex-col justify-between"><div className="text-[10px] font-black uppercase opacity-60">Goal Active</div><h4 className="font-bold text-lg leading-tight">{item.content}</h4><div className="h-1 w-full bg-white/10 rounded-full mt-4"><div className="h-full bg-primary-500 rounded-full" style={{ width: `${item.subContent}%` }} /></div></div>;
      default: return null;
    }
  };

  return (
    <>
      <div
        ref={nodeRef}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        className={`absolute select-none touch-none ${isSelected && isEditing ? 'z-[100]' : ''}`}
        style={{
          left: localPos.x, top: localPos.y, width: localSize.width, height: localSize.height,
          transform: `rotate(${localRot}deg)`, zIndex: item.zIndex || 1,
        }}
      >
        <div 
          className={`w-full h-full relative transition-shadow duration-300 ${isSelected && isEditing ? 'ring-4 ring-primary-500 shadow-2xl scale-[1.02]' : 'hover:shadow-lg'}`}
          style={{
            backgroundColor: item.backgroundColor || (item.type === 'sticker' ? 'transparent' : '#fff'),
            color: item.textColor || '#000',
            borderRadius: `${item.borderRadius || 24}px`,
            opacity: item.opacity || 1,
            overflow: 'hidden',
          }}
        >
          {renderContent()}

          {isEditing && isSelected && (
            <>
               <div onMouseDown={handleResizeStart} onTouchStart={handleResizeStart} className="absolute bottom-0 right-0 w-10 h-10 bg-white dark:bg-gray-800 text-primary-600 rounded-tl-2xl shadow-xl flex items-center justify-center border-t border-l border-gray-200 dark:border-gray-700 cursor-nwse-resize z-50">
                  <Scaling size={18} strokeWidth={2.5} />
               </div>
               <div onMouseDown={handleRotateStart} onTouchStart={handleRotateStart} className="absolute -top-12 left-1/2 -translate-x-1/2 w-10 h-10 bg-white dark:bg-gray-800 text-primary-600 rounded-full shadow-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center cursor-grab active:cursor-grabbing z-50">
                  <RotateCw size={18} strokeWidth={2.5} />
               </div>
               <button onMouseDown={(e) => { e.stopPropagation(); onDelete(item.id); }} onTouchStart={(e) => { e.stopPropagation(); onDelete(item.id); }} className="absolute -top-4 -right-4 w-10 h-10 bg-red-500 text-white rounded-full shadow-xl flex items-center justify-center border-2 border-white z-50">
                  <Trash2 size={18} strokeWidth={2.5} />
               </button>
            </>
          )}
        </div>

        {isEditing && isSelected && (
           <div className={`fixed inset-x-0 bottom-0 z-[200] pb-safe px-4 transition-all duration-300 pointer-events-none`}>
              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-t-[2.5rem] p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] pointer-events-auto max-w-2xl mx-auto flex flex-col gap-4 animate-in slide-in-from-bottom-full">
                 <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    <button onClick={() => setActiveTool(activeTool === 'style' ? 'none' : 'style')} className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${activeTool === 'style' ? 'bg-primary-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}><Sliders size={16} /> Look</button>
                    <button onClick={() => setActiveTool(activeTool === 'color' ? 'none' : 'color')} className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${activeTool === 'color' ? 'bg-primary-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}><Palette size={16} /> Color</button>
                    <button onClick={() => setActiveTool(activeTool === 'text' ? 'none' : 'text')} className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${activeTool === 'text' ? 'bg-primary-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}><Type size={16} /> Text</button>
                    <button onClick={() => setActiveTool(activeTool === 'layers' ? 'none' : 'layers')} className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${activeTool === 'layers' ? 'bg-primary-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}><Layers size={16} /> Order</button>
                 </div>

                 <div className="max-h-48 overflow-y-auto custom-scrollbar">
                    {activeTool === 'style' && (
                       <div className="space-y-4 py-2">
                          <div className="flex flex-col gap-2">
                             <div className="flex justify-between items-center px-1"><span className="text-[10px] font-black uppercase text-gray-400">Corners</span><span className="text-xs font-bold text-primary-600">{item.borderRadius || 24}px</span></div>
                             <input type="range" min="0" max="100" value={item.borderRadius || 24} onChange={e => updateStyle('borderRadius', parseInt(e.target.value))} className="w-full accent-primary-600" />
                          </div>
                          <div className="flex flex-col gap-2">
                             <div className="flex justify-between items-center px-1"><span className="text-[10px] font-black uppercase text-gray-400">Opacity</span><span className="text-xs font-bold text-primary-600">{Math.round((item.opacity || 1) * 100)}%</span></div>
                             <input type="range" min="0.1" max="1" step="0.1" value={item.opacity || 1} onChange={e => updateStyle('opacity', parseFloat(e.target.value))} className="w-full accent-primary-600" />
                          </div>
                       </div>
                    )}
                    {activeTool === 'color' && (
                       <div className="space-y-4 py-2">
                          <div>
                             <span className="text-[10px] font-black uppercase text-gray-400 mb-2 block px-1">Background</span>
                             <div className="flex flex-wrap gap-2.5">{COLORS.map(c => <button key={c} onClick={() => updateStyle('backgroundColor', c)} className={`w-8 h-8 rounded-full border-2 transition-transform active:scale-90 ${item.backgroundColor === c ? 'border-primary-500 scale-110 shadow-lg' : 'border-white dark:border-gray-700'}`} style={{ background: c }} />)}</div>
                          </div>
                       </div>
                    )}
                    {activeTool === 'text' && (
                       <div className="space-y-4 py-2">
                          <div className="grid grid-cols-4 gap-2">
                             {FONTS.map(f => <button key={f} onClick={() => updateStyle('fontFamily', f)} className={`py-2 rounded-lg text-[10px] font-bold border ${item.fontFamily === f ? 'bg-primary-50 border-primary-500 text-primary-600' : 'border-gray-200 text-gray-500'}`} style={{ fontFamily: f }}>Aa</button>)}
                          </div>
                          <div className="flex flex-col gap-2">
                             <div className="flex justify-between items-center px-1"><span className="text-[10px] font-black uppercase text-gray-400">Font Size</span><span className="text-xs font-bold text-primary-600">{item.fontSize || 24}px</span></div>
                             <input type="range" min="12" max="120" value={item.fontSize || 24} onChange={e => updateStyle('fontSize', parseInt(e.target.value))} className="w-full accent-primary-600" />
                          </div>
                       </div>
                    )}
                    {activeTool === 'layers' && (
                       <div className="grid grid-cols-2 gap-3 py-2">
                          <button onClick={() => changeLayer('front')} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"><BringToFront size={16} /> To Front</button>
                          <button onClick={() => changeLayer('back')} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"><SendToBack size={16} /> To Back</button>
                       </div>
                    )}
                 </div>
                 
                 <button onClick={() => onSelect()} className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all"><Check size={18} strokeWidth={4} /> Confirm Edits</button>
              </div>
           </div>
        )}
      </div>
    </>
  );
};
