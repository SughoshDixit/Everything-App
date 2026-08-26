import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import type { GpsActivityLog } from '../types';
import { formatDuration, generateSampleGpsActivity } from '../utils/milestonesTracker';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  X,
  Share2,
  ListOrdered,
  Video,
  Sparkles,
  Send,
  Eye,
  Crosshair,
  Gauge
} from 'lucide-react';

export type MapTileProvider = 'dark_canvas' | 'osm_standard' | 'esri_satellite' | 'esri_topo';
export type CameraTrackingMode = 'follow_drone' | 'overview' | 'perspective_3d';

interface StravaRouteFlybyPlayerProps {
  activity: GpsActivityLog;
  onOpenSocialShare?: (act: GpsActivityLog) => void;
  onCreatePostFromActivity?: (act: GpsActivityLog) => void;
  onClose: () => void;
}

export const StravaRouteFlybyPlayer: React.FC<StravaRouteFlybyPlayerProps> = ({
  activity: initialActivity,
  onOpenSocialShare,
  onCreatePostFromActivity,
  onClose
}) => {
  const [currentActivity, setCurrentActivity] = useState<GpsActivityLog>(initialActivity);
  const [tileProvider, setTileProvider] = useState<MapTileProvider>('dark_canvas');
  const [cameraMode, setCameraMode] = useState<CameraTrackingMode>('follow_drone');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(2); // 1x, 2x, 5x, 10x
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showSplitsTable, setShowSplitsTable] = useState<boolean>(false);

  // Video Recording State (MediaRecorder)
  const [isRecordingVideo, setIsRecordingVideo] = useState<boolean>(false);
  const [recordProgress, setRecordProgress] = useState<number>(0);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const plannedPolylineRef = useRef<L.Polyline | null>(null);
  const traversedPolylineRef = useRef<L.Polyline | null>(null);
  const glowPolylineRef = useRef<L.Polyline | null>(null);
  const athleteMarkerRef = useRef<L.Marker | null>(null);

  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const points = currentActivity.routePoints || [];
  const splits = currentActivity.splits || [];
  const totalPoints = points.length;

  // ---------------------------------------------------------------------------
  // 1. TILE LAYER URL CONFIGURATION (100% Free & No Watermark)
  // ---------------------------------------------------------------------------
  const getTileConfig = (provider: MapTileProvider) => {
    switch (provider) {
      case 'osm_standard':
        return {
          url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; OpenStreetMap contributors'
        };
      case 'esri_topo':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
          attribution: '&copy; Esri World Topo Map'
        };
      case 'esri_satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: '&copy; Esri World Imagery'
        };
      case 'dark_canvas':
      default:
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
          attribution: '&copy; Esri Dark Gray Canvas'
        };
    }
  };

  // ---------------------------------------------------------------------------
  // 2. INITIALIZE LEAFLET MAP INSTANCE
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!mapContainerRef.current || points.length < 2) return;

    // Clean previous instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const startPoint = points[0];
    const map = L.map(mapContainerRef.current, {
      center: [startPoint.latitude, startPoint.longitude],
      zoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    const tileConfig = getTileConfig(tileProvider);
    const tileLayer = L.tileLayer(tileConfig.url, {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: tileConfig.attribution
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Convert route points to LatLngs
    const latLngs: L.LatLngTuple[] = points.map((p) => [p.latitude, p.longitude]);

    // 1. Draw Full Planned Route (Translucent base line)
    const plannedLine = L.polyline(latLngs, {
      color: '#94a3b8',
      weight: 4,
      opacity: 0.35,
      dashArray: '6, 6'
    }).addTo(map);
    plannedPolylineRef.current = plannedLine;

    // 2. Draw Outer Glow Layer
    const glowLine = L.polyline([], {
      color: currentActivity.activityType === 'cycle' ? '#FC4C02' : '#c084fc',
      weight: 12,
      opacity: 0.35,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);
    glowPolylineRef.current = glowLine;

    // 3. Draw Sharp Traversed Active Line
    const traversedLine = L.polyline([], {
      color: currentActivity.activityType === 'cycle' ? '#FC4C02' : '#a855f7',
      weight: 5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);
    traversedPolylineRef.current = traversedLine;

    // 4. Start Point Marker (Green Badge)
    const startIcon = L.divIcon({
      className: 'custom-start-marker',
      html: `
        <div style="background: #10B981; color: white; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900; border: 2.5px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.5);">
          S
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
    L.marker([startPoint.latitude, startPoint.longitude], { icon: startIcon }).addTo(map);

    // 5. Finish Point Marker (Red Badge)
    const endPoint = points[points.length - 1];
    const endIcon = L.divIcon({
      className: 'custom-end-marker',
      html: `
        <div style="background: #EF4444; color: white; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900; border: 2.5px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.5);">
          F
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
    L.marker([endPoint.latitude, endPoint.longitude], { icon: endIcon }).addTo(map);

    // 6. Create Athlete / Vehicle Moving Beacon Marker
    const isCycle = currentActivity.activityType === 'cycle';
    const isDrive = currentActivity.activityType === 'drive';
    const athleteIcon = L.divIcon({
      className: 'osm-athlete-marker-container',
      html: `
        <div class="osm-athlete-marker" id="athlete-marker-inner">
          <div class="athlete-pulse-ring"></div>
          <div class="${isDrive ? 'athlete-headlights-beam' : 'athlete-heading-beam'}"></div>
          <div class="${isDrive ? 'athlete-car-badge' : isCycle ? 'athlete-cycle-badge' : 'athlete-core-badge'}">
            ${isDrive ? '🚗' : isCycle ? '🚴' : '🏃'}
          </div>
        </div>
      `,
      iconSize: [46, 46],
      iconAnchor: [23, 23]
    });

    const athleteMarker = L.marker([startPoint.latitude, startPoint.longitude], {
      icon: athleteIcon,
      zIndexOffset: 1000
    }).addTo(map);
    athleteMarkerRef.current = athleteMarker;

    // Fit map bounds initially
    map.fitBounds(plannedLine.getBounds(), { padding: [40, 40] });
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [currentActivity]);

  // ---------------------------------------------------------------------------
  // 3. SWITCH MAP TILES SEAMLESSLY
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const tileConfig = getTileConfig(tileProvider);
    const newTileLayer = L.tileLayer(tileConfig.url, {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: tileConfig.attribution
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTileLayer;
  }, [tileProvider]);

  // ---------------------------------------------------------------------------
  // 4. ANIMATION TICK LOOP
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isPlaying || totalPoints < 2) return;

    const animate = (time: number) => {
      const delta = time - lastTimeRef.current;
      if (delta > 30 / playbackSpeed) {
        setCurrentIndex((prev) => {
          if (prev >= totalPoints - 1) {
            setIsPlaying(false);
            return totalPoints - 1;
          }
          return prev + 1;
        });
        lastTimeRef.current = time;
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, playbackSpeed, totalPoints]);

  // ---------------------------------------------------------------------------
  // 5. UPDATE ATHLETE POSITION, ROUTE DRAWING & DYNAMIC CAMERA
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!mapInstanceRef.current || points.length < 2 || currentIndex >= totalPoints) return;

    const map = mapInstanceRef.current;
    const currentP = points[currentIndex];
    const prevP = points[Math.max(0, currentIndex - 1)];

    // Calculate heading / bearing angle for realistic direction rotation
    let headingDeg = 0;
    const dLat = currentP.latitude - prevP.latitude;
    const dLng = currentP.longitude - prevP.longitude;
    if (Math.abs(dLat) > 0.00001 || Math.abs(dLng) > 0.00001) {
      headingDeg = Math.atan2(dLng, dLat) * (180 / Math.PI);
    }

    // 1. Move Athlete Marker
    if (athleteMarkerRef.current) {
      athleteMarkerRef.current.setLatLng([currentP.latitude, currentP.longitude]);

      // Rotate inner badge towards street direction
      const markerEl = document.getElementById('athlete-marker-inner');
      if (markerEl) {
        markerEl.style.transform = `rotate(${headingDeg}deg)`;
      }
    }

    // 2. Update Traversed Polyline up to current point
    const traversedLatLngs: L.LatLngTuple[] = points.slice(0, currentIndex + 1).map((p) => [p.latitude, p.longitude]);
    if (traversedPolylineRef.current) {
      traversedPolylineRef.current.setLatLngs(traversedLatLngs);
    }
    if (glowPolylineRef.current) {
      glowPolylineRef.current.setLatLngs(traversedLatLngs);
    }

    // 3. Dynamic Camera Tracking Mode
    if (cameraMode === 'follow_drone' || cameraMode === 'perspective_3d') {
      map.panTo([currentP.latitude, currentP.longitude], {
        animate: true,
        duration: 0.15
      });
    }
  }, [currentIndex, points, totalPoints, cameraMode]);

  // Telemetry Calculations for Current Frame
  const progressRatio = totalPoints > 1 ? currentIndex / (totalPoints - 1) : 1;
  const currentDistanceKm = Number((currentActivity.distanceKm * progressRatio).toFixed(2));
  const currentDurationSec = Math.round(currentActivity.durationSeconds * progressRatio);
  const currentPoint = points[currentIndex] || points[0];
  const currentAltitude = currentPoint?.altitude ? Math.round(currentPoint.altitude) : 0;
  const currentSpeedKmh = currentPoint?.speed ? Number((currentPoint.speed * 3.6).toFixed(1)) : currentActivity.avgSpeedKmh || 0;

  // Active split calculation
  const activeSplitIndex = Math.min(
    splits.length - 1,
    Math.floor((currentDistanceKm * 1000) / (splits[0]?.distanceLabel ? 100 : 500))
  );
  const activeSplit = splits[Math.max(0, activeSplitIndex)];

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentIndex(val);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsPlaying(true);
    if (mapInstanceRef.current && points.length > 0) {
      mapInstanceRef.current.panTo([points[0].latitude, points[0].longitude]);
    }
  };

  // ---------------------------------------------------------------------------
  // 6. EXPORT ANIMATED FLYBY VIDEO CLIP (MediaRecorder API)
  // ---------------------------------------------------------------------------
  const handleExportAnimatedVideo = () => {
    if (isRecordingVideo) return;

    try {
      setIsRecordingVideo(true);
      setRecordProgress(0);
      setCurrentIndex(0);
      setIsPlaying(false);

      // Create a background recording canvas
      const recCanvas = document.createElement('canvas');
      recCanvas.width = 640;
      recCanvas.height = 360;
      const ctx = recCanvas.getContext('2d');
      if (!ctx) return;

      const stream = recCanvas.captureStream(30);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Strava_OSM_Flyby_${currentActivity.distanceKm}km_${currentActivity.activityType}_${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsRecordingVideo(false);
        setRecordProgress(100);
      };

      mediaRecorder.start();

      let stepIndex = 0;
      const stepInterval = setInterval(() => {
        stepIndex += 2;
        if (stepIndex >= totalPoints) {
          clearInterval(stepInterval);
          setCurrentIndex(totalPoints - 1);
          setRecordProgress(100);
          setTimeout(() => {
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
            }
          }, 400);
        } else {
          setCurrentIndex(stepIndex);
          setRecordProgress(Math.round((stepIndex / totalPoints) * 100));

          // Draw video frame
          ctx.fillStyle = '#0a0d14';
          ctx.fillRect(0, 0, 640, 360);

          // Route projection on video frame
          let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
          points.forEach((p) => {
            if (p.latitude < minLat) minLat = p.latitude;
            if (p.latitude > maxLat) maxLat = p.latitude;
            if (p.longitude < minLng) minLng = p.longitude;
            if (p.longitude > maxLng) maxLng = p.longitude;
          });
          const latR = maxLat - minLat || 0.001;
          const lngR = maxLng - minLng || 0.001;
          const toX = (lng: number) => 40 + ((lng - minLng) / lngR) * 560;
          const toY = (lat: number) => 320 - ((lat - minLat) / latR) * 280;

          // Traversed glowing path
          ctx.beginPath();
          ctx.strokeStyle = currentActivity.activityType === 'cycle' ? '#FC4C02' : '#c084fc';
          ctx.lineWidth = 6;
          ctx.lineCap = 'round';
          for (let i = 0; i <= stepIndex; i++) {
            const px = toX(points[i].longitude);
            const py = toY(points[i].latitude);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();

          // Athlete point
          const currPt = points[stepIndex];
          const ax = toX(currPt.longitude);
          const ay = toY(currPt.latitude);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(ax, ay, 9, 0, Math.PI * 2);
          ctx.fill();

          // Video HUD overlay
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(20, 20, 220, 60);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 16px Montserrat, sans-serif';
          ctx.fillText(`${(currentActivity.distanceKm * (stepIndex / totalPoints)).toFixed(2)} km`, 35, 48);
          ctx.fillStyle = '#c084fc';
          ctx.font = 'bold 12px Montserrat, sans-serif';
          ctx.fillText(`OpenStreetMap Ground Track`, 35, 68);
        }
      }, 33);
    } catch (err) {
      console.error('Video recording error:', err);
      setIsRecordingVideo(false);
    }
  };

  const handleSelectSample = (type: 'marine_run' | 'coastal_cycle' | 'trail_run' | 'express_drive') => {
    const sample = generateSampleGpsActivity(type);
    setCurrentActivity(sample);
    setCurrentIndex(0);
    setIsPlaying(true);
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 10000 }}>
      <div className="modal-content google-card animate-scale-up max-w-2xl w-full max-h-[96vh] overflow-y-auto p-4 md:p-6 flex flex-col justify-between">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-glass pb-3 mb-2">
          <button
            className="btn-google-outlined text-xs py-1.5 px-3 flex items-center gap-1"
            onClick={onClose}
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>

          <div className="text-center">
            <span className="text-[10px] font-bold text-[#55198B] dark:text-[#c084fc] uppercase tracking-widest block">
              OPENSTREETMAP 3D GROUND TRACKING
            </span>
            <h3 className="text-sm md:text-base font-black text-main mt-0.5 uppercase tracking-wide">
              {currentActivity.distanceKm} km {currentActivity.activityType === 'run' ? 'Running Flyby' : currentActivity.activityType === 'cycle' ? 'Cycling Flyby' : currentActivity.activityType === 'drive' ? '🚗 Road Trip Flyby' : 'Walking Flyby'}
            </h3>
          </div>

          <button className="btn-google-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Preset Sample Activity Switcher */}
        <div className="flex items-center justify-between flex-wrap gap-1.5 mb-2 bg-black/20 p-2 rounded-xl border border-glass">
          <span className="text-[11px] font-bold text-sub flex items-center gap-1">
            <Sparkles size={13} className="text-amber-400" />
            <span>Try Sample Routes:</span>
          </span>
          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => handleSelectSample('marine_run')}
              className="text-[10px] font-bold py-0.5 px-2 rounded-full bg-[#55198B]/20 text-[#c084fc] hover:bg-[#55198B] hover:text-white transition-all cursor-pointer"
            >
              🏃 5.2k Run
            </button>
            <button
              onClick={() => handleSelectSample('coastal_cycle')}
              className="text-[10px] font-bold py-0.5 px-2 rounded-full bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white transition-all cursor-pointer"
            >
              🚴 22.5k Ride
            </button>
            <button
              onClick={() => handleSelectSample('trail_run')}
              className="text-[10px] font-bold py-0.5 px-2 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
            >
              ⛰️ 7.8k Trail
            </button>
            <button
              onClick={() => handleSelectSample('express_drive')}
              className="text-[10px] font-bold py-0.5 px-2 rounded-full bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all cursor-pointer"
            >
              🚗 48k Express Drive
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 1. REALISTIC OPENSTREETMAP LEAFLET STAGE */}
        {/* ------------------------------------------------------------------- */}
        <div
          className={`relative bg-black rounded-2xl border border-glass overflow-hidden my-1 shadow-2xl transition-all duration-300 ${
            cameraMode === 'perspective_3d' ? 'transform [perspective:800px] [transform:rotateX(20deg)] shadow-purple-900/30' : ''
          }`}
          style={{ height: '340px' }}
        >
          {/* Leaflet Map DOM Element */}
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Floating Top Telemetry HUD */}
          <div className="absolute top-2.5 left-2.5 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-2.5 shadow-lg z-20">
            <div>
              <div className="text-[8px] text-slate-400 font-bold uppercase">DISTANCE</div>
              <div className="text-xs md:text-sm font-black text-white font-mono leading-none mt-0.5">
                {currentDistanceKm} <span className="text-[9px] text-lime-400 font-normal">km</span>
              </div>
            </div>

            <div className="h-5 w-px bg-slate-800" />

            <div>
              <div className="text-[8px] text-slate-400 font-bold uppercase">SPEED / PACE</div>
              <div className="text-xs md:text-sm font-black text-cyan-400 font-mono leading-none mt-0.5 flex items-center gap-1">
                <Gauge size={12} className="text-cyan-400" />
                <span>{currentSpeedKmh > 0 ? `${currentSpeedKmh} km/h` : currentActivity.avgPaceMinKm}</span>
              </div>
            </div>

            <div className="h-5 w-px bg-slate-800" />

            <div>
              <div className="text-[8px] text-slate-400 font-bold uppercase">ELAPSED</div>
              <div className="text-xs md:text-sm font-black text-amber-400 font-mono leading-none mt-0.5">
                {formatDuration(currentDurationSec)}
              </div>
            </div>

            {currentAltitude > 0 && (
              <>
                <div className="h-5 w-px bg-slate-800" />
                <div>
                  <div className="text-[8px] text-slate-400 font-bold uppercase">ALTITUDE</div>
                  <div className="text-xs md:text-sm font-black text-emerald-400 font-mono leading-none mt-0.5">
                    {currentAltitude}m
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Floating Controls Overlay (Top Right: Map Style & Camera Mode) */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-20">
            {/* Map Tiles Switcher */}
            <div className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-md p-1 rounded-lg border border-slate-800 shadow-md">
              <button
                onClick={() => setTileProvider('dark_canvas')}
                className={`text-[9px] font-bold py-0.5 px-1.5 rounded transition-all ${
                  tileProvider === 'dark_canvas' ? 'bg-[#55198B] text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Tactical Dark Map"
              >
                Dark
              </button>
              <button
                onClick={() => setTileProvider('osm_standard')}
                className={`text-[9px] font-bold py-0.5 px-1.5 rounded transition-all ${
                  tileProvider === 'osm_standard' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="OpenStreetMap Standard"
              >
                OSM Streets
              </button>
              <button
                onClick={() => setTileProvider('esri_satellite')}
                className={`text-[9px] font-bold py-0.5 px-1.5 rounded transition-all ${
                  tileProvider === 'esri_satellite' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Esri Real Satellite Imagery"
              >
                Satellite
              </button>
            </div>

            {/* Camera Modes Switcher */}
            <div className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-md p-1 rounded-lg border border-slate-800 shadow-md self-end">
              <button
                onClick={() => setCameraMode('follow_drone')}
                className={`text-[9px] font-bold py-0.5 px-1.5 rounded flex items-center gap-1 transition-all ${
                  cameraMode === 'follow_drone' ? 'bg-[#55198B] text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Follow Athlete Camera"
              >
                <Crosshair size={10} />
                <span>Follow</span>
              </button>
              <button
                onClick={() => {
                  setCameraMode('overview');
                  if (mapInstanceRef.current && plannedPolylineRef.current) {
                    mapInstanceRef.current.fitBounds(plannedPolylineRef.current.getBounds(), { padding: [40, 40] });
                  }
                }}
                className={`text-[9px] font-bold py-0.5 px-1.5 rounded flex items-center gap-1 transition-all ${
                  cameraMode === 'overview' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Full Route Overview"
              >
                <Eye size={10} />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setCameraMode('perspective_3d')}
                className={`text-[9px] font-bold py-0.5 px-1.5 rounded transition-all ${
                  cameraMode === 'perspective_3d' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="3D Tilt Perspective"
              >
                3D Tilt
              </button>
            </div>
          </div>

          {/* Floating Active Split Pill (Bottom Left) */}
          {activeSplit && (
            <div className="absolute bottom-2.5 left-2.5 bg-slate-950/90 backdrop-blur-md px-3 py-1 rounded-full border border-lime-500/40 text-[10px] text-lime-400 font-bold flex items-center gap-1.5 shadow-lg z-20">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
              <span>Split #{activeSplit.splitNumber}: {activeSplit.paceMinKm} • +{activeSplit.elevationDeltaMeters}m</span>
            </div>
          )}

          {/* Video Recording Status Overlay */}
          {isRecordingVideo && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-30">
              <div className="w-10 h-10 rounded-full bg-red-600 animate-ping mb-2" />
              <p className="text-xs font-black uppercase tracking-widest text-red-400">
                Recording OpenStreetMap Video Clip...
              </p>
              <div className="w-48 bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-red-500 h-full transition-all duration-100"
                  style={{ width: `${recordProgress}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 font-mono">{recordProgress}% completed</span>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 2. PLAYBACK CONTROLS & TIMELINE SCRUBBER */}
        {/* ------------------------------------------------------------------- */}
        <div className="bg-card p-3 rounded-2xl border border-glass my-2">
          {/* Progress Slider */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-sub">{formatDuration(currentDurationSec)}</span>
            <input
              type="range"
              min="0"
              max={Math.max(1, totalPoints - 1)}
              value={currentIndex}
              onChange={handleSeek}
              className="flex-1 accent-[#55198B] cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
            />
            <span className="text-[10px] font-mono text-sub">{formatDuration(currentActivity.durationSeconds)}</span>
          </div>

          {/* Control Buttons & Export Video */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                className="btn-google-icon"
                onClick={() => setIsPlaying(!isPlaying)}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
              </button>

              <button
                className="btn-google-icon"
                onClick={handleReset}
                title="Restart Flyby"
              >
                <RotateCcw size={16} />
              </button>

              {/* Playback Speed Multiplier Pills */}
              <div className="flex items-center gap-1 bg-black/20 p-1 rounded-full border border-glass">
                {[1, 2, 5, 10].map((s) => (
                  <button
                    key={s}
                    className={`py-0.5 px-2 rounded-full text-[10px] font-bold transition-all ${
                      playbackSpeed === s
                        ? 'bg-[#55198B] text-white font-black shadow-sm'
                        : 'text-sub hover:text-main'
                    }`}
                    onClick={() => setPlaybackSpeed(s)}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Record & Export Animated Video Button */}
              <button
                onClick={handleExportAnimatedVideo}
                disabled={isRecordingVideo}
                className="btn-google-tonal text-xs py-1.5 px-3 flex items-center gap-1 text-red-500 border-red-500/30 hover:bg-red-500/10"
                title="Export MP4/WebM Video Clip of this Route Animation"
              >
                <Video size={14} className="text-red-500" />
                <span>{isRecordingVideo ? 'Recording...' : 'Export Video Clip'}</span>
              </button>

              {/* Toggle Splits Table */}
              <button
                className={showSplitsTable ? 'btn-google-primary text-xs py-1.5 px-3' : 'btn-google-outlined text-xs py-1.5 px-3'}
                onClick={() => setShowSplitsTable(!showSplitsTable)}
              >
                <ListOrdered size={14} />
                <span>Splits</span>
              </button>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 3. 100m SPLIT TIMES EXPANDABLE DRAWER */}
        {/* ------------------------------------------------------------------- */}
        {showSplitsTable && (
          <div className="bg-card p-3 rounded-2xl border border-glass my-2 max-h-48 overflow-y-auto animate-fade-in">
            <h4 className="text-[11px] font-black text-sub uppercase tracking-wider mb-2">
              Split Times & Elevation Delta
            </h4>
            <div className="grid grid-cols-4 text-[10px] font-bold text-sub border-b border-glass pb-1 mb-1">
              <div>SPLIT</div>
              <div>TIME</div>
              <div>PACE</div>
              <div className="text-right">ELEVATION</div>
            </div>
            {splits.map((s) => (
              <div
                key={s.splitNumber}
                className="grid grid-cols-4 text-[11px] font-mono py-1 border-b border-glass/50 items-center text-sub"
              >
                <div className="font-bold text-main">#{s.splitNumber} ({s.distanceLabel})</div>
                <div className="text-emerald-600 dark:text-emerald-400 font-bold">{s.durationSeconds}s</div>
                <div className="text-cyan-600 dark:text-cyan-400">{s.paceMinKm}</div>
                <div className="text-right text-amber-600 dark:text-amber-400">
                  {s.elevationDeltaMeters >= 0 ? `+${s.elevationDeltaMeters}m` : `${s.elevationDeltaMeters}m`}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* 4. TOTAL SUMMARY CARDS & ACTIONS */}
        {/* ------------------------------------------------------------------- */}
        <div className="grid grid-cols-3 gap-2 my-2">
          <div className="bg-card p-2.5 rounded-2xl border border-glass text-center">
            <div className="text-[9px] text-sub font-bold uppercase">ELEVATION GAIN</div>
            <div className="text-sm font-black text-amber-500 font-mono mt-0.5">
              +{currentActivity.elevationGainMeters || 0}m
            </div>
          </div>

          <div className="bg-card p-2.5 rounded-2xl border border-glass text-center">
            <div className="text-[9px] text-sub font-bold uppercase">AVG PACE</div>
            <div className="text-sm font-black text-[#55198B] dark:text-[#c084fc] font-mono mt-0.5">
              {currentActivity.avgPaceMinKm}
            </div>
          </div>

          <div className="bg-card p-2.5 rounded-2xl border border-glass text-center">
            <div className="text-[9px] text-sub font-bold uppercase">MAX SPEED</div>
            <div className="text-sm font-black text-emerald-500 font-mono mt-0.5">
              {currentActivity.topSpeedKmh || 0} km/h
            </div>
          </div>
        </div>

        {/* Bottom Actions: Share Route Poster & Post to Feed */}
        <div className="grid grid-cols-2 gap-2.5 mt-2">
          {onOpenSocialShare && (
            <button
              className="btn-google-tonal py-2.5 text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5"
              onClick={() => onOpenSocialShare(currentActivity)}
            >
              <Share2 size={15} />
              <span>Share Poster</span>
            </button>
          )}

          {onCreatePostFromActivity && (
            <button
              className="btn-google-primary py-2.5 text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5"
              onClick={() => onCreatePostFromActivity(currentActivity)}
            >
              <Send size={15} />
              <span>Post to Feed</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
