import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { GpsLocationPoint, Workout } from '../types';
import { RotateCcw, Layers, MapPin } from 'lucide-react';

interface ActivityMapPreviewProps {
  workout: Workout;
  routePoints: GpsLocationPoint[];
  height?: string;
  className?: string;
}

export const ActivityMapPreview: React.FC<ActivityMapPreviewProps> = ({
  workout,
  routePoints,
  height = '240px',
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [mapTheme, setMapTheme] = useState<'dark' | 'satellite'>('dark');

  const isIndoor = workout.sport === 'Calisthenics' || routePoints.length < 2;

  useEffect(() => {
    if (isIndoor || !containerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: false,
      doubleClickZoom: true
    });
    mapRef.current = map;

    // Tile Layer based on theme
    const tileUrl =
      mapTheme === 'satellite'
        ? 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
        : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      subdomains: mapTheme === 'satellite' ? '0123' : 'abcd',
      maxZoom: 19,
      opacity: 0.95
    }).addTo(map);

    const latLngs: [number, number][] = routePoints.map((p) => [p.latitude, p.longitude]);

    // Outer Glow Polyline
    L.polyline(latLngs, {
      color: workout.color || '#fc4c02',
      weight: 8,
      opacity: 0.35,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Core Crisp Polyline
    L.polyline(latLngs, {
      color: workout.color || '#fc4c02',
      weight: 3.5,
      opacity: 1.0,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Start Beacon (Green)
    const startPt = latLngs[0];
    const startIcon = L.divIcon({
      className: 'custom-start-marker',
      html: `
        <div style="display:flex;align-items:center;gap:4px;background:#10b981;color:#000;font-size:9px;font-weight:900;padding:2px 6px;border-radius:12px;border:2px solid #fff;box-shadow:0 0 10px rgba(16,185,129,0.8);white-space:nowrap;">
          <span>🚩</span>
          <span>START</span>
        </div>
      `,
      iconSize: [54, 20],
      iconAnchor: [27, 10]
    });
    L.marker(startPt, { icon: startIcon }).addTo(map);

    // Finish Beacon (Orange/Checkered)
    const endPt = latLngs[latLngs.length - 1];
    const finishIcon = L.divIcon({
      className: 'custom-finish-marker',
      html: `
        <div style="display:flex;align-items:center;gap:4px;background:#fc4c02;color:#fff;font-size:9px;font-weight:900;padding:2px 6px;border-radius:12px;border:2px solid #fff;box-shadow:0 0 10px rgba(252,76,2,0.8);white-space:nowrap;">
          <span>🏁</span>
          <span>FINISH</span>
        </div>
      `,
      iconSize: [58, 20],
      iconAnchor: [29, 10]
    });
    L.marker(endPt, { icon: finishIcon }).addTo(map);

    // Fit Bounds
    const bounds = L.latLngBounds(latLngs);
    map.fitBounds(bounds, { padding: [35, 35] });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [routePoints, isIndoor, mapTheme, workout.color]);

  const handleRecenter = () => {
    if (!mapRef.current || isIndoor || routePoints.length < 2) return;
    const latLngs: [number, number][] = routePoints.map((p) => [p.latitude, p.longitude]);
    mapRef.current.fitBounds(L.latLngBounds(latLngs), { padding: [35, 35] });
  };

  if (isIndoor) {
    return (
      <div
        style={{ height }}
        className={`relative w-full rounded-2xl border border-white/10 bg-gradient-to-br from-[#121824] via-[#0E131B] to-[#080B10] p-5 flex flex-col items-center justify-center text-center shadow-inner ${className}`}
      >
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl mb-2">
          💪
        </div>
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
          Indoor Studio Session
        </h4>
        <p className="text-[11px] text-zinc-400 max-w-xs mt-1">
          Precision bodyweight repetitions recorded at {workout.location}. GPS mapping is bypassed for calisthenics.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{ height }}
      className={`relative w-full rounded-2xl border border-white/10 bg-[#090C12] overflow-hidden shadow-2xl ${className}`}
    >
      <div ref={containerRef} className="w-full h-full" />

      {/* Top Overlay Badge */}
      <div className="absolute top-2.5 left-2.5 z-[1000] flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0E131B]/90 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white/90 shadow-lg">
        <MapPin size={11} className="text-[#fc4c02]" />
        <span className="font-bold truncate max-w-[140px] sm:max-w-[200px]">{workout.location}</span>
      </div>

      {/* Control Overlay Buttons */}
      <div className="absolute top-2.5 right-2.5 z-[1000] flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setMapTheme(mapTheme === 'dark' ? 'satellite' : 'dark')}
          className="p-1.5 rounded-xl bg-[#0E131B]/90 backdrop-blur-md border border-white/10 text-white/80 hover:text-white transition shadow-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
          title="Toggle Satellite / Dark Map"
        >
          <Layers size={12} />
          <span className="hidden sm:inline">{mapTheme === 'dark' ? 'Satellite' : 'Dark'}</span>
        </button>

        <button
          type="button"
          onClick={handleRecenter}
          className="p-1.5 rounded-xl bg-[#0E131B]/90 backdrop-blur-md border border-white/10 text-white/80 hover:text-white transition shadow-lg cursor-pointer"
          title="Recenter Route"
        >
          <RotateCcw size={12} />
        </button>
      </div>
    </div>
  );
};
