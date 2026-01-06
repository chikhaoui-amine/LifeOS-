
import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { Sparkles, Plus, Maximize2, Lock, Unlock, MousePointer2, ZoomIn, ZoomOut, Hand, Navigation, Expand, Shrink } from 'lucide-react';
import { useVisionBoard } from '../context/VisionBoardContext';
import { AddVisionModal } from '../components/vision/AddVisionModal';
import { FocusSession } from '../components/vision/FocusSession';
import { FreeFormItem } from '../components/vision/FreeFormItem';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

const VisionBoard: React.FC = () => {
  const { items, loading, deleteItem, updateItem } = useVisionBoard();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const [zoom, setZoom] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768 ? 0.4 : 1);
  const [canvasSize, setCanvasSize] = useState(4000);
  const [isHandMode, setIsHandMode] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const [centerPos, setCenterPos] = useState({ x: 2000, y: 2000 });
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const centerView = useCallback((smooth = false, targetZoom?: number) => {
    if (scrollAreaRef.current) {
      const el = scrollAreaRef.current;
      const currentZoom = targetZoom ?? zoom;
      const visualSize = canvasSize * currentZoom;
      const scrollLeft = (visualSize / 2) - (el.clientWidth / 2);
      const scrollTop = (visualSize / 2) - (el.clientHeight / 2);
      
      el.scrollTo({ left: scrollLeft, top: scrollTop, behavior: smooth ? 'smooth' : 'auto' });
    }
  }, [zoom, canvasSize]);

  useLayoutEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => centerView(false), 100);
      return () => clearTimeout(timer);
    }
  }, [loading, centerView]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollLeft -= dx;
        scrollAreaRef.current.scrollTop -= dy;
      }
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseUp = () => setIsPanning(false);

    if (isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning]);

  // Touch Panning for Mobile
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isHandMode && !isPanning) return;
    if (e.touches.length === 1 && (isHandMode || isPanning)) {
      const touch = e.touches[0];
      const dx = touch.clientX - lastMousePos.current.x;
      const dy = touch.clientY - lastMousePos.current.y;
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollLeft -= dx;
        scrollAreaRef.current.scrollTop -= dy;
      }
      lastMousePos.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isHandMode) {
      setIsPanning(true);
      lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleOpenAddModal = () => {
    if (scrollAreaRef.current) {
      const el = scrollAreaRef.current;
      const logicalX = (el.scrollLeft + el.clientWidth / 2) / zoom;
      const logicalY = (el.scrollTop + el.clientHeight / 2) / zoom;
      setCenterPos({ x: logicalX, y: logicalY });
    }
    setIsAddModalOpen(true);
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(2, Math.max(0.1, prev + delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isHandMode || e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      setSelectedId(null);
    } else if (e.target === e.currentTarget || (e.target as HTMLElement).id === 'canvas-wrapper') {
      setSelectedId(null);
    }
  };

  if (loading) return <LoadingSkeleton count={4} />;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col animate-in fade-in duration-700 relative overflow-hidden bg-[#f1f5f9] dark:bg-[#020617] -m-4 sm:-m-8">
      
      {isFocusMode && <FocusSession items={items} onClose={() => setIsFocusMode(false)} />}

      <div className="absolute top-4 left-0 right-0 px-4 z-[60] pointer-events-none flex flex-col gap-3">
        <div className="flex justify-between items-start w-full">
           <div className="hidden md:flex pointer-events-auto bg-white/60 dark:bg-black/60 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/20 shadow-xl flex-col">
              <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 mb-0.5">
                 <Sparkles size={14} className="fill-current animate-pulse" />
                 <span className="text-[8px] font-black uppercase tracking-[0.3em]">Vision Engine</span>
              </div>
              <h1 className="text-lg font-black text-gray-900 dark:text-white font-serif tracking-tight">Dream Space</h1>
           </div>

           <div className="pointer-events-auto flex flex-wrap justify-end gap-2 ml-auto">
              <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl p-1 rounded-xl border border-white/20 flex gap-1 shadow-lg">
                 <button onClick={() => setIsHandMode(false)} className={`p-2 rounded-lg transition-all ${!isHandMode ? 'bg-primary-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`} title="Select"><MousePointer2 size={18} /></button>
                 <button onClick={() => { setIsHandMode(true); setSelectedId(null); }} className={`p-2 rounded-lg transition-all ${isHandMode ? 'bg-primary-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`} title="Pan"><Hand size={18} /></button>
              </div>

              <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl p-1 rounded-xl border border-white/20 flex gap-1 shadow-lg">
                 <button onClick={() => handleZoom(0.1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300"><ZoomIn size={18} /></button>
                 <button onClick={() => handleZoom(-0.1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300"><ZoomOut size={18} /></button>
                 <button onClick={() => centerView(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300"><Navigation size={18} /></button>
              </div>

              <button 
                onClick={() => { setIsEditMode(!isEditMode); if(isEditMode) setSelectedId(null); }}
                className={`p-2.5 rounded-xl border transition-all shadow-lg flex items-center gap-2 font-black text-[10px] uppercase tracking-widest backdrop-blur-md ${isEditMode ? 'bg-orange-500 border-orange-400 text-white' : 'bg-white/80 dark:bg-gray-800/80 border-white/20 text-gray-700'}`}
              >
                 {isEditMode ? <Unlock size={16} /> : <Lock size={16} />}
              </button>
           </div>
        </div>
      </div>

      <div 
        ref={scrollAreaRef}
        className={`flex-1 overflow-auto relative custom-scrollbar ${isHandMode || isPanning ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsPanning(false)}
      >
        <div 
          id="canvas-wrapper"
          style={{ width: canvasSize * zoom, height: canvasSize * zoom, position: 'relative' }}
        >
          <div 
            className="absolute top-0 left-0 transition-transform duration-200 origin-top-left"
            style={{ 
              width: canvasSize, height: canvasSize, transform: `scale(${zoom})`,
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(99, 102, 241, 0.1) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}
          >
            {items.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                 <EmptyState icon={Sparkles} title="Visualize Your Future" description="Double tap or use the plus button to add your first vision." actionLabel="Begin Journey" onAction={handleOpenAddModal} />
              </div>
            ) : (
              items.map(item => (
                <FreeFormItem 
                  key={item.id} item={item} items={items} isEditing={isEditMode && !isHandMode} 
                  onUpdate={updateItem} onDelete={deleteItem} onSelect={() => !isHandMode && setSelectedId(item.id)}
                  isSelected={selectedId === item.id} zoom={zoom}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 z-[60] pointer-events-none px-4 flex items-center justify-between">
          <div className="bg-black/70 backdrop-blur-xl px-4 py-2.5 rounded-full border border-white/10 flex items-center gap-3 text-white shadow-2xl text-[9px] font-black uppercase tracking-widest">
             <span>{items.length} Elements</span>
             <div className="w-px h-3 bg-white/20" />
             <span>{Math.round(zoom * 100)}%</span>
             <button onClick={() => setIsFocusMode(true)} className="pointer-events-auto p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"><Maximize2 size={12} /></button>
          </div>

          <button 
             onClick={handleOpenAddModal}
             className="pointer-events-auto w-14 h-14 bg-primary-600 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform border-4 border-white dark:border-gray-900"
          >
             <Plus size={32} strokeWidth={3} />
          </button>
      </div>

      {isAddModalOpen && <AddVisionModal centerPos={centerPos} onClose={() => setIsAddModalOpen(false)} />}
    </div>
  );
};

export default VisionBoard;
