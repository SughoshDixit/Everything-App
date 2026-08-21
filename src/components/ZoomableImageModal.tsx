import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, X, ChevronLeft, Move } from 'lucide-react';

interface ZoomableImageModalProps {
  imageSrc: string;
  title: string;
  pageNumber?: number;
  onClose: () => void;
}

export const ZoomableImageModal: React.FC<ZoomableImageModalProps> = ({
  imageSrc,
  title,
  pageNumber,
  onClose
}) => {
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialTouchDistanceRef = useRef<number | null>(null);

  // Zoom handlers
  const handleZoomIn = () => {
    setScale((prev) => Math.min(3.5, prev + 0.35));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(0.8, prev - 0.35);
      if (next <= 1) {
        setPosition({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse Drag to Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
    }
  }, [isDragging, scale]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers for Mobile (Pinch-to-zoom & Pan)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      };
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      initialTouchDistanceRef.current = distance;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging && scale > 1) {
      setPosition({
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y
      });
    } else if (e.touches.length === 2 && initialTouchDistanceRef.current !== null) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      const ratio = currentDistance / initialTouchDistanceRef.current;
      setScale((prev) => Math.min(3.5, Math.max(0.8, prev * ratio)));
      initialTouchDistanceRef.current = currentDistance;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    initialTouchDistanceRef.current = null;
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div className="modal-backdrop" style={{ zIndex: 10000, backgroundColor: 'rgba(0, 0, 0, 0.95)' }}>
      <div className="w-full h-full max-w-4xl max-h-[96vh] flex flex-col justify-between p-2 md:p-4 animate-scale-up">
        {/* Header Bar */}
        <div className="flex items-center justify-between bg-zinc-950/95 backdrop-blur-md p-3 rounded-2xl border border-zinc-700 z-10">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-black text-xs border border-white/30 transition-all cursor-pointer shadow-md"
            onClick={onClose}
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
            <span className="text-white">Back</span>
          </button>

          <div className="text-center px-2">
            <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-wider truncate max-w-xs md:max-w-md">
              {title}
            </h3>
            {pageNumber && (
              <span className="text-[10px] text-cyan-400 font-bold">Playbook Page {pageNumber}</span>
            )}
          </div>

          <button
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all cursor-pointer"
            onClick={onClose}
            aria-label="Close Viewer"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Viewport Image Stage (Fits screen 100%, Zoomable, Pan-able) */}
        <div
          className="relative flex-1 my-2 flex items-center justify-center overflow-hidden bg-black/80 rounded-2xl border border-zinc-900 select-none touch-none cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDoubleClick={handleResetZoom}
        >
          <div
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          >
            <img
              src={imageSrc}
              alt={title}
              className="max-h-[75vh] max-w-[95vw] md:max-w-full object-contain rounded-lg shadow-2xl bg-white"
              draggable={false}
            />
          </div>

          {/* Drag to Pan Hint badge if zoomed */}
          {scale > 1 && (
            <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-zinc-300 font-bold border border-zinc-800 flex items-center gap-1">
              <Move size={12} className="text-cyan-400" />
              <span>Drag to Pan</span>
            </div>
          )}
        </div>

        {/* Floating Zoom Controls Bar */}
        <div className="flex items-center justify-center gap-3 bg-zinc-950/95 backdrop-blur-md py-2 px-4 rounded-full border border-zinc-800 max-w-sm mx-auto z-10 shadow-2xl">
          <button
            className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 active:scale-95 transition-all"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>

          <span className="text-xs font-mono font-bold text-cyan-400 min-w-[3.5rem] text-center">
            {Math.round(scale * 100)}%
          </span>

          <button
            className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 active:scale-95 transition-all"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>

          <div className="h-4 w-px bg-zinc-800" />

          <button
            className="btn-secondary text-[11px] flex items-center gap-1 bg-zinc-900 border-zinc-800 text-zinc-300 py-1 px-2.5 rounded-full"
            onClick={handleResetZoom}
            title="Fit to Screen"
          >
            <RotateCcw size={12} />
            <span>Fit Screen</span>
          </button>
        </div>
      </div>
    </div>
  );
};
