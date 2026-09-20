import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { GpsActivityLog, GpsLocationPoint } from '../types';
import { formatDuration } from '../utils/milestonesTracker';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  Key,
  Gauge,
  Layers,
  Sparkles
} from 'lucide-react';

interface GoogleMaps3DRoutePlayerProps {
  activity: GpsActivityLog;
  onClose: () => void;
  onSwitchToLeaflet: () => void;
}

declare global {
  interface Window {
    google?: any;
    initGoogleMapsFlyby?: () => void;
  }
}

export const GoogleMaps3DRoutePlayer: React.FC<GoogleMaps3DRoutePlayerProps> = ({
  activity,
  onClose,
  onSwitchToLeaflet
}) => {
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('google_maps_api_key') || (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
  });
  const [showKeyModal, setShowKeyModal] = useState<boolean>(!apiKey);
  const [tempKeyInput, setTempKeyInput] = useState<string>(apiKey);
  const [isApiLoaded, setIsApiLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Playback & Camera State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(2); // 1x, 2x, 5x, 10x
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [mapType, setMapType] = useState<'hybrid' | 'satellite' | 'roadmap' | 'terrain'>('hybrid');
  const [tiltAngle, setTiltAngle] = useState<number>(60); // 0 to 67.5 degrees

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const googleMapRef = useRef<any>(null);
  const athleteMarkerRef = useRef<any>(null);
  const plannedPolylineRef = useRef<any>(null);
  const traversedPolylineRef = useRef<any>(null);

  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  const points: GpsLocationPoint[] = useMemo(() => {
    return activity.routePoints || [];
  }, [activity.routePoints]);

  const totalPoints = points.length;

  // 1. Load Google Maps JS API script
  useEffect(() => {
    if (!apiKey) {
      setShowKeyModal(true);
      return;
    }

    if (window.google && window.google.maps) {
      setIsApiLoaded(true);
      return;
    }

    const scriptId = 'google-maps-js-sdk';
    const existingScript = document.getElementById(scriptId);
    if (existingScript) existingScript.remove();

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=geometry,marker`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsApiLoaded(true);
      setLoadError(null);
    };

    script.onerror = () => {
      setLoadError('Failed to load Google Maps script. Check your API key and network connection.');
    };

    document.head.appendChild(script);
  }, [apiKey]);

  // 2. Initialize Google Map Instance
  useEffect(() => {
    if (!isApiLoaded || !mapContainerRef.current || points.length < 2 || !window.google?.maps) return;

    const startPt = points[0];
    const initialCenter = { lat: startPt.latitude, lng: startPt.longitude };

    const map = new window.google.maps.Map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 17.5,
      tilt: tiltAngle,
      heading: 0,
      mapTypeId: mapType,
      disableDefaultUI: true,
      gestureHandling: 'greedy'
    });

    googleMapRef.current = map;

    // Full Route (Planned) Polyline
    const pathCoordinates = points.map(p => ({ lat: p.latitude, lng: p.longitude }));
    const plannedLine = new window.google.maps.Polyline({
      path: pathCoordinates,
      geodesic: true,
      strokeColor: '#94a3b8',
      strokeOpacity: 0.4,
      strokeWeight: 4
    });
    plannedLine.setMap(map);
    plannedPolylineRef.current = plannedLine;

    // Traversed (Active Glow) Polyline
    const traversedLine = new window.google.maps.Polyline({
      path: [pathCoordinates[0]],
      geodesic: true,
      strokeColor: activity.activityType === 'cycle' ? '#FC4C02' : '#00F5D4',
      strokeOpacity: 0.95,
      strokeWeight: 6
    });
    traversedLine.setMap(map);
    traversedPolylineRef.current = traversedLine;

    // Athlete Marker
    const isCycle = activity.activityType === 'cycle';
    const isDrive = activity.activityType === 'drive';
    const athleteIconEmoji = isDrive ? '🚗' : isCycle ? '🚴' : '🏃';

    const athleteMarker = new window.google.maps.Marker({
      position: initialCenter,
      map: map,
      title: `${athleteIconEmoji} Position`,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: activity.activityType === 'cycle' ? '#FC4C02' : '#00F5D4',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3
      }
    });
    athleteMarkerRef.current = athleteMarker;

    return () => {
      if (plannedPolylineRef.current) plannedPolylineRef.current.setMap(null);
      if (traversedPolylineRef.current) traversedPolylineRef.current.setMap(null);
      if (athleteMarkerRef.current) athleteMarkerRef.current.setMap(null);
    };
  }, [isApiLoaded, points, activity.activityType]);

  // Update Map Type
  useEffect(() => {
    if (googleMapRef.current) {
      googleMapRef.current.setMapTypeId(mapType);
    }
  }, [mapType]);

  // 3. Animation Tick Loop
  useEffect(() => {
    if (!isPlaying || totalPoints < 2) return;

    const animate = (time: number) => {
      const delta = time - lastTimeRef.current;
      if (delta > 35 / playbackSpeed) {
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

  // 4. Update Camera Heading, Tilt, and Athlete Position
  useEffect(() => {
    if (!googleMapRef.current || points.length < 2 || currentIndex >= totalPoints) return;

    const map = googleMapRef.current;
    const currentP = points[currentIndex];
    const prevP = points[Math.max(0, currentIndex - 1)];

    const currentLatLng = { lat: currentP.latitude, lng: currentP.longitude };

    // Calculate heading/bearing
    const dLon = ((currentP.longitude - prevP.longitude) * Math.PI) / 180;
    const lat1 = (prevP.latitude * Math.PI) / 180;
    const lat2 = (currentP.latitude * Math.PI) / 180;
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    let heading = (Math.atan2(y, x) * 180) / Math.PI;
    heading = (heading + 360) % 360;

    // Update camera using moveCamera with 3D tilt & smooth heading
    if (typeof map.moveCamera === 'function') {
      map.moveCamera({
        center: currentLatLng,
        tilt: tiltAngle,
        heading: heading,
        zoom: 17.5
      });
    } else {
      map.panTo(currentLatLng);
    }

    // Update marker
    if (athleteMarkerRef.current) {
      athleteMarkerRef.current.setPosition(currentLatLng);
    }

    // Update traversed line
    if (traversedPolylineRef.current) {
      const traversedCoords = points.slice(0, currentIndex + 1).map(p => ({ lat: p.latitude, lng: p.longitude }));
      traversedPolylineRef.current.setPath(traversedCoords);
    }
  }, [currentIndex, points, totalPoints, tiltAngle]);

  // Telemetry Calculations
  const progressRatio = totalPoints > 1 ? currentIndex / (totalPoints - 1) : 1;
  const currentDistanceKm = Number((activity.distanceKm * progressRatio).toFixed(2));
  const currentDurationSec = Math.round(activity.durationSeconds * progressRatio);
  const currentPoint = points[currentIndex] || points[0];
  const currentAltitude = currentPoint?.altitude ? Math.round(currentPoint.altitude) : 0;
  const currentSpeedKmh = currentPoint?.speed ? Number((currentPoint.speed * 3.6).toFixed(1)) : activity.avgSpeedKmh || 0;

  const handleSaveApiKey = () => {
    const trimmed = tempKeyInput.trim();
    if (trimmed) {
      localStorage.setItem('google_maps_api_key', trimmed);
      setApiKey(trimmed);
      setShowKeyModal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-2 md:p-6 overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between z-30 bg-slate-950/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-800 shadow-xl mb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={13} className="text-amber-400" />
                <span>Google Maps 3D Vector Drone</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold">
                60° 3D Tilt
              </span>
            </div>
            <h2 className="text-sm md:text-base font-black text-white">{activity.date} • {activity.activityType.toUpperCase()}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch back to Google Hybrid / Leaflet */}
          <button
            onClick={onSwitchToLeaflet}
            className="text-xs font-bold py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Layers size={14} />
            <span>2D/Hybrid Mode</span>
          </button>

          {/* API Key Modal Button */}
          <button
            onClick={() => setShowKeyModal(true)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 hover:text-amber-300 cursor-pointer"
            title="Google Maps API Key Settings"
          >
            <Key size={16} />
          </button>
        </div>
      </div>

      {/* Main 3D Google Map Container */}
      <div className="relative flex-1 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Telemetry HUD Top Left */}
        <div className="absolute top-4 left-4 bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-800 flex items-center gap-3 shadow-2xl z-20">
          <div>
            <div className="text-[8px] text-slate-400 font-bold uppercase">DISTANCE</div>
            <div className="text-sm md:text-base font-black text-white font-mono leading-none mt-0.5">
              {currentDistanceKm} <span className="text-[10px] text-lime-400 font-normal">km</span>
            </div>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <div className="text-[8px] text-slate-400 font-bold uppercase">SPEED</div>
            <div className="text-sm md:text-base font-black text-cyan-400 font-mono leading-none mt-0.5 flex items-center gap-1">
              <Gauge size={13} className="text-cyan-400" />
              <span>{currentSpeedKmh} km/h</span>
            </div>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <div className="text-[8px] text-slate-400 font-bold uppercase">ELAPSED</div>
            <div className="text-sm md:text-base font-black text-amber-400 font-mono leading-none mt-0.5">
              {formatDuration(currentDurationSec)}
            </div>
          </div>
          {currentAltitude > 0 && (
            <>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <div className="text-[8px] text-slate-400 font-bold uppercase">ELEVATION</div>
                <div className="text-sm md:text-base font-black text-emerald-400 font-mono leading-none mt-0.5">
                  {currentAltitude}m
                </div>
              </div>
            </>
          )}
        </div>

        {/* Map View & Tilt Controls Top Right */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
          {/* Map Layer Selector */}
          <div className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-md">
            <button
              onClick={() => setMapType('hybrid')}
              className={`text-[10px] font-bold py-1 px-2 rounded-lg transition-all ${
                mapType === 'hybrid' ? 'bg-[#55198B] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hybrid
            </button>
            <button
              onClick={() => setMapType('satellite')}
              className={`text-[10px] font-bold py-1 px-2 rounded-lg transition-all ${
                mapType === 'satellite' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapType('terrain')}
              className={`text-[10px] font-bold py-1 px-2 rounded-lg transition-all ${
                mapType === 'terrain' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Terrain
            </button>
          </div>

          {/* 3D Tilt Selector */}
          <div className="flex items-center justify-between gap-1 bg-slate-950/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 text-[10px] font-bold text-slate-300">
            <span>Tilt:</span>
            <button
              onClick={() => setTiltAngle(0)}
              className={`px-2 py-0.5 rounded ${tiltAngle === 0 ? 'bg-[#55198B] text-white' : 'text-slate-400'}`}
            >
              2D
            </button>
            <button
              onClick={() => setTiltAngle(45)}
              className={`px-2 py-0.5 rounded ${tiltAngle === 45 ? 'bg-[#55198B] text-white' : 'text-slate-400'}`}
            >
              45°
            </button>
            <button
              onClick={() => setTiltAngle(65)}
              className={`px-2 py-0.5 rounded ${tiltAngle === 65 ? 'bg-[#55198B] text-white' : 'text-slate-400'}`}
            >
              65°
            </button>
          </div>
        </div>

        {/* Load Error Message */}
        {loadError && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center z-30">
            <p className="text-sm font-semibold text-rose-400 mb-3">{loadError}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowKeyModal(true)}
                className="btn-google-primary text-xs py-2 px-4"
              >
                Update API Key
              </button>
              <button
                onClick={onSwitchToLeaflet}
                className="btn-google-outlined text-xs py-2 px-4"
              >
                Switch to Google Hybrid Mode
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Timeline & Playback Bar */}
      <div className="mt-3 bg-slate-950/85 backdrop-blur-md p-3 rounded-2xl border border-slate-800 flex flex-col gap-2">
        <input
          type="range"
          min="0"
          max={totalPoints - 1}
          value={currentIndex}
          onChange={(e) => setCurrentIndex(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00F5D4]"
        />

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-xl bg-[#55198B] text-white hover:bg-[#6b21a8] cursor-pointer"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              onClick={() => {
                setCurrentIndex(0);
                setIsPlaying(true);
              }}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
              title="Replay from start"
            >
              <RotateCcw size={16} />
            </button>

            {/* Speed Pills */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
              {[1, 2, 5, 10].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                    playbackSpeed === spd ? 'bg-[#55198B] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            {currentIndex + 1} / {totalPoints} Waypoints
          </div>
        </div>
      </div>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-2 mb-2 text-amber-400">
              <Key size={20} />
              <h3 className="text-base font-black text-white">Google Maps API Key</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Google Maps 3D Vector view with 65° camera tilt and 360° heading rotation requires a Google Cloud Maps API key with <strong>Maps JavaScript API</strong> enabled.
            </p>

            <input
              type="text"
              value={tempKeyInput}
              onChange={(e) => setTempKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono mb-4 focus:outline-none focus:border-amber-400"
            />

            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setShowKeyModal(false);
                  onSwitchToLeaflet();
                }}
                className="text-xs py-2 px-3 text-slate-400 hover:text-white cursor-pointer"
              >
                Use Google Hybrid (No Key Needed)
              </button>
              <button
                onClick={handleSaveApiKey}
                disabled={!tempKeyInput.trim()}
                className="btn-google-primary text-xs py-2 px-4 cursor-pointer disabled:opacity-50"
              >
                Save & Launch 3D
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
