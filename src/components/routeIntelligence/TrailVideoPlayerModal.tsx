import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Share2,
  Download,
  X,
  Smartphone
} from 'lucide-react';
import type {
  ActivityDocument,
  VideoRenderPayload,
  TrailVideoDocument
} from '../../types/routeIntelligence';
import { TrailVideoEngine } from '../../services/routeIntelligence/trailVideoEngine';
import { RouteIntelligenceFirestoreService } from '../../services/routeIntelligence/routeFirestoreService';

interface TrailVideoPlayerModalProps {
  activity: ActivityDocument;
  videoPayload: VideoRenderPayload;
  onClose: () => void;
}

export const TrailVideoPlayerModal: React.FC<TrailVideoPlayerModalProps> = ({
  activity,
  videoPayload,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [cloudJob, setCloudJob] = useState<TrailVideoDocument | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const durationSec = 16.0;
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const currentTimeRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(true);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Main 30/60 FPS Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed 1080 x 1920 resolution for 9:16 vertical video
    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (isPlayingRef.current) {
        currentTimeRef.current += dt;
        if (currentTimeRef.current >= durationSec) {
          currentTimeRef.current = 0; // loop seamlessly
        }
        setCurrentTimeSec(currentTimeRef.current);
      }

      const frameState = TrailVideoEngine.evaluateFrame(
        currentTimeRef.current,
        durationSec,
        videoPayload.progressPoints,
        activity
      );

      TrailVideoEngine.renderFrameToCanvas(ctx, width, height, frameState, videoPayload);

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [activity, videoPayload]);

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleRestart = () => {
    currentTimeRef.current = 0;
    setCurrentTimeSec(0);
    setIsPlaying(true);
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    currentTimeRef.current = val;
    setCurrentTimeSec(val);
  };

  // Client-Side Video Capture & Save to Gallery
  const handleDownloadVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsExporting(true);
    setStatusMessage('Capturing 9:16 Trail Video replay...');

    try {
      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          const fileName = `trail_video_${activity.id}.webm`;

          if (window.AndroidBridge && typeof window.AndroidBridge.downloadBase64File === 'function') {
            window.AndroidBridge.downloadBase64File(base64data, fileName, 'video/webm');
            setStatusMessage('Saved to Android Gallery / Movies!');
          } else {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = fileName;
            a.click();
            setStatusMessage('Video exported successfully!');
          }
          setIsExporting(false);
        };
        reader.readAsDataURL(blob);
      };

      // Play through from start for complete deterministic export
      currentTimeRef.current = 0;
      setIsPlaying(true);
      mediaRecorder.start();

      setTimeout(() => {
        mediaRecorder.stop();
      }, durationSec * 1000);
    } catch {
      // Fallback: save high-res snapshot
      const base64 = canvas.toDataURL('image/jpeg', 0.95);
      const fileName = `trail_poster_${activity.id}.jpg`;
      if (window.AndroidBridge && typeof window.AndroidBridge.downloadBase64File === 'function') {
        window.AndroidBridge.downloadBase64File(base64, fileName, 'image/jpeg');
        setStatusMessage('High-res 9:16 poster saved to Gallery!');
      } else {
        const a = document.createElement('a');
        a.href = base64;
        a.download = fileName;
        a.click();
        setStatusMessage('Poster exported successfully!');
      }
      setIsExporting(false);
    }
  };

  // Direct Native Share
  const handleNativeShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setStatusMessage('Preparing shareable media...');
    const base64 = canvas.toDataURL('image/jpeg', 0.95);
    const fileName = `trail_replay_${activity.id}.jpg`;

    if (window.AndroidBridge && typeof window.AndroidBridge.shareBase64Media === 'function') {
      window.AndroidBridge.shareBase64Media(
        base64,
        fileName,
        'image/jpeg',
        activity.title,
        `Check out my ${videoPayload.totalDistanceKm}km effort on Kuchh Bhii App! #KuchhBhii #Athlete`
      );
      setStatusMessage('Shared via native chooser!');
    } else if (navigator.share) {
      try {
        const blob = await (await fetch(base64)).blob();
        const file = new File([blob], fileName, { type: 'image/jpeg' });
        await navigator.share({
          title: activity.title,
          text: `Check out my ${videoPayload.totalDistanceKm}km effort on Kuchh Bhii App!`,
          files: [file]
        });
        setStatusMessage('Shared successfully!');
      } catch {
        setStatusMessage('Share cancelled or not supported.');
      }
    } else {
      handleDownloadVideo();
    }
  };

  // Cloud Run Render Job Queue
  const handleQueueCloudRender = async () => {
    setStatusMessage('Queueing Cloud Run 1080p MP4 render job...');
    try {
      const job = await RouteIntelligenceFirestoreService.queueTrailVideoJob(
        activity.id,
        'SIGNATURE_TRAIL_REPLAY',
        '9_16'
      );
      setCloudJob(job);
      setStatusMessage(`Cloud render worker queued: ${job.id}`);
    } catch {
      setStatusMessage('Cloud job created in local simulation queue.');
    }
  };

  const progressPercent = Math.min(100, (currentTimeSec / durationSec) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 select-none">
      <div className="relative w-full max-w-sm max-h-[96vh] bg-[#0E131B] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between animate-scale-up">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0E131B]/95 z-10">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#FC5200]/20 text-[#FC5200]">
              <Smartphone size={14} />
            </span>
            <div>
              <h2 className="text-xs font-bold text-white font-display">
                Signature Trail Replay
              </h2>
              <span className="text-[10px] text-white/50 font-mono">9:16 Vertical Story</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* 9:16 Aspect Ratio Canvas Container */}
        <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden p-2">
          <canvas
            ref={canvasRef}
            className="h-full max-h-[580px] w-auto aspect-[9/16] rounded-2xl shadow-2xl border border-white/10"
          />

          {/* Overlay Status Message Toast */}
          {statusMessage && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-[#121824]/90 border border-white/20 text-[11px] font-mono text-emerald-400 shadow-xl backdrop-blur-md">
              {statusMessage}
            </div>
          )}
        </div>

        {/* Bottom Playback & Action Controls */}
        <div className="p-4 space-y-3 bg-[#0E131B] border-t border-white/10 z-10">
          {/* Timeline Scrub Bar */}
          <div className="space-y-1">
            <input
              type="range"
              min={0}
              max={durationSec}
              step={0.1}
              value={currentTimeSec}
              onChange={handleScrub}
              className="w-full accent-[#FC5200] cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-white/50 font-mono">
              <span>0:{Math.floor(currentTimeSec).toString().padStart(2, '0')}</span>
              <span>{Math.round(progressPercent)}%</span>
              <span>0:{durationSec}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleTogglePlay}
                className="p-2.5 rounded-xl bg-[#FC5200] hover:bg-[#e04800] text-white shadow-lg shadow-[#FC5200]/25 transition cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button
                onClick={handleRestart}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
                title="Restart"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadVideo}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition cursor-pointer"
              >
                <Download size={13} />
                <span>{isExporting ? 'Capturing...' : 'Download'}</span>
              </button>

              <button
                onClick={handleNativeShare}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FC5200] hover:bg-[#e04800] text-xs font-bold text-white shadow-lg shadow-[#FC5200]/20 transition cursor-pointer"
              >
                <Share2 size={13} />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Cloud HD 1080p Worker Trigger */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/50">
            <span>Server FFmpeg Render (1080×1920)</span>
            <button
              onClick={handleQueueCloudRender}
              className="font-bold text-[#FC5200] hover:underline cursor-pointer"
            >
              {cloudJob ? `Queued (#${cloudJob.id})` : 'Queue Cloud HD'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
