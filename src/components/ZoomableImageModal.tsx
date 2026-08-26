import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, X, ChevronLeft, Move, Hand } from 'lucide-react';

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
  
  // Two-Finger Pinch Refs
  const initialTouchDistanceRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(1);
  const initialMidpointRef = useRef<{ x: number; y: number } | null>(null);
  const lastTapTimeRef = useRef<number>(0);

  // Zoom handlers
  const handleZoomIn = () => {
    setScale((prev) => Math.min(5.0, Number((prev + 0.5).toFixed(2))));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(1.0, Number((prev - 0.5).toFixed(2)));
      if (next <= 1.0) {
        setPosition({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Double-tap or double-click to toggle 1x / 2.5x zoom
  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (scale > 1.1) {
      handleResetZoom();
    } else {
      setScale(2.5);
    }
  };

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.25 : -0.25;
    setScale((prev) => {
      const next = Math.min(5.0, Math.max(1.0, Number((prev + zoomDelta).toFixed(2))));
      if (next <= 1.0) {
        setPosition({ x: 0, y: 0 });
      }
      return next;
    });
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

  // Touch handlers for Mobile (Two-Finger Pinch-To-Zoom & Pan)
  const handleTouchStart = (e: React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTapTimeRef.current < 300) {
      // Double tap detected
      handleDoubleTap(e);
      lastTapTimeRef.current = 0;
      return;
    }
    lastTapTimeRef.current = now;

    if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      };
    } else if (e.touches.length >= 2) {
      setIsDragging(false);
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      initialTouchDistanceRef.current = distance;
      initialScaleRef.current = scale;
      initialMidpointRef.current = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging && scale > 1) {
      setPosition({
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y
      });
    } else if (e.touches.length >= 2 && initialTouchDistanceRef.current !== null) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      const currentMidpoint = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      };

      // Calculate new pinch scale
      const factor = currentDistance / initialTouchDistanceRef.current;
      const nextScale = Math.min(5.0, Math.max(0.9, Number((initialScaleRef.current * factor).toFixed(2))));
      setScale(nextScale);

      // Pan with two-finger motion
      if (initialMidpointRef.current) {
        const dx = currentMidpoint.x - initialMidpointRef.current.x;
        const dy = currentMidpoint.y - initialMidpointRef.current.y;
        setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
        initialMidpointRef.current = currentMidpoint;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      initialTouchDistanceRef.current = null;
      initialMidpointRef.current = null;
    }
    if (e.touches.length === 0) {
      setIsDragging(false);
      if (scale < 1.0) {
        handleResetZoom();
      }
    }
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
    <div className="modal-backdrop" style={{ zIndex: 10000, backgroundColor: 'rgba(0, 0, 0, 0.96)' }}>
      <div className="w-full h-full max-w-4xl max-h-[98vh] flex flex-col justify-between p-2 md:p-4 animate-scale-up">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between bg-zinc-950/95 backdrop-blur-md p-3 rounded-2xl border border-zinc-800 z-20 shadow-xl">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-black text-xs border border-white/20 transition-all cursor-pointer shadow-md"
            onClick={onClose}
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
            <span className="text-white">Back</span>
          </button>

          <div className="text-center px-2">
            <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-wider truncate max-w-xs md:max-w-md">
              {title}
            </h3>
            {pageNumber ? (
              <span className="text-[10px] text-cyan-400 font-bold">Playbook Page {pageNumber}</span>
            ) : (
              <span className="text-[10px] text-zinc-400 font-medium">Pinch with 2 fingers to zoom</span>
            )}
          </div>

          <button
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all cursor-pointer"
            onClick={onClose}
            aria-label="Close Viewer"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Viewport Image Stage (Touch-friendly Pinch & Pan Container) */}
        <div
          className="relative flex-1 my-2 flex items-center justify-center overflow-hidden bg-black/90 rounded-2xl border border-zinc-900 select-none cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          onDoubleClick={handleDoubleTap}
        >
          <div
            style={{
              transform: `translate3d(${position.x}px, ${position.y}px, 0px) scale(${scale})`,
              transformOrigin: 'center center',
              transition: isDragging || initialTouchDistanceRef.current ? 'none' : 'transform 0.18s cubic-bezier(0.2, 0, 0, 1)',
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
              className="max-h-[76vh] max-w-[95vw] md:max-w-full object-contain rounded-lg shadow-2xl bg-white pointer-events-none"
              draggable={false}
            />
          </div>

          {/* Interactive Pinch / Pan Tooltip Hint */}
          <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
            {scale > 1.0 ? (
              <div className="bg-zinc-950/85 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-cyan-300 font-bold border border-cyan-500/40 flex items-center gap-1.5 shadow-lg">
                <Move size={12} className="text-cyan-400" />
                <span>Drag to Pan</span>
              </div>
            ) : (
              <div className="bg-zinc-950/85 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-zinc-300 font-bold border border-zinc-800 flex items-center gap-1.5 shadow-lg">
                <Hand size={12} className="text-amber-400" />
                <span>Pinch with 2 Fingers or Double-Tap</span>
              </div>
            )}
          </div>
        </div>

        {/* Floating Zoom Control Dock */}
        <div className="flex items-center justify-center gap-3 bg-zinc-950/95 backdrop-blur-md py-2 px-4 rounded-full border border-zinc-800 max-w-sm mx-auto z-20 shadow-2xl">
          <button
            className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 active:scale-95 transition-all"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>

          <span className="text-xs font-mono font-black text-cyan-400 min-w-[3.8rem] text-center">
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
            className="btn-secondary text-[11px] flex items-center gap-1 bg-zinc-900 border-zinc-800 text-zinc-300 py-1 px-3 rounded-full hover:text-white"
            onClick={handleResetZoom}
            title="Reset / Fit to Screen"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
