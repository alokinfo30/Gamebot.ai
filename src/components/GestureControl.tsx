import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, Sparkles, AlertCircle, Hand } from 'lucide-react';
import { GestureType } from '../types/ludo';
import { soundManager } from '../logic/soundManager';

interface GestureControlProps {
  onGestureAction: (gesture: GestureType) => void;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const GestureControl: React.FC<GestureControlProps> = ({
  onGestureAction,
  isEnabled,
  onToggle,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeGesture, setActiveGesture] = useState<GestureType>('none');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detectionIntensity, setDetectionIntensity] = useState<number>(0);
  const lastGestureTime = useRef<number>(0);
  const prevFrameData = useRef<Uint8ClampedArray | null>(null);

  // Store ref to onGestureAction so requestAnimationFrame never uses a stale closure
  const onGestureActionRef = useRef(onGestureAction);
  useEffect(() => {
    onGestureActionRef.current = onGestureAction;
  }, [onGestureAction]);

  // Trigger gesture either via camera or manual simulation button
  const triggerGesture = (gesture: GestureType) => {
    const now = Date.now();
    if (now - lastGestureTime.current < 500) return; // 500ms debounce
    lastGestureTime.current = now;

    setActiveGesture(gesture);
    soundManager.playGestureDetected();
    onGestureActionRef.current(gesture);

    setTimeout(() => setActiveGesture('none'), 1200);
  };

  // Initialize Camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    let isCancelled = false;

    async function setupCamera() {
      if (!isEnabled) return;
      try {
        setCameraError(null);
        const userStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' },
        });

        if (isCancelled) {
          userStream.getTracks().forEach((track) => track.stop());
          return;
        }

        stream = userStream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current && !isCancelled) {
              const playPromise = videoRef.current.play();
              if (playPromise !== undefined) {
                playPromise.catch((err) => {
                  if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
                    console.warn('Camera video play caught:', err);
                  }
                });
              }
            }
          };
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Camera access error:', err);
          setCameraError('Camera permission denied or camera not found.');
          onToggle(false);
        }
      }
    }

    if (isEnabled) {
      setupCamera();
    } else {
      if (videoRef.current) {
        videoRef.current.onloadedmetadata = null;
        if (videoRef.current.srcObject) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
          tracks.forEach((track) => track.stop());
          videoRef.current.srcObject = null;
        }
      }
    }

    return () => {
      isCancelled = true;
      if (videoRef.current) {
        videoRef.current.onloadedmetadata = null;
        if (videoRef.current.srcObject) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
          tracks.forEach((track) => track.stop());
          videoRef.current.srcObject = null;
        }
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isEnabled, onToggle]);

  // Real-time Frame Analysis loop for Motion & Gesture Detection
  useEffect(() => {
    if (!isEnabled) return;

    let animFrameId: number;

    const processVideoFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === 4) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, 160, 120);
          const imageData = ctx.getImageData(0, 0, 160, 120);
          const data = imageData.data;

          let motionPixels = 0;
          let activeSkinPixels = 0;
          let topQuadrantSkin = 0;
          let leftQuadrantSkin = 0;
          let rightQuadrantSkin = 0;

          // Motion differential against previous frame
          if (prevFrameData.current) {
            const prev = prevFrameData.current;
            for (let i = 0; i < data.length; i += 16) {
              const diff = Math.abs(data[i] - prev[i]) + Math.abs(data[i + 1] - prev[i + 1]);
              if (diff > 40) {
                motionPixels++;
              }
            }
          }
          prevFrameData.current = new Uint8ClampedArray(data);

          // Skin color & hand contour detection
          for (let i = 0; i < data.length; i += 16) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Inclusive skin tone check
            if (r > 50 && g > 30 && r > b && (r - g) > 5) {
              activeSkinPixels++;
              const pixelIndex = i / 4;
              const y = Math.floor(pixelIndex / 160);
              const x = pixelIndex % 160;

              if (y < 45) topQuadrantSkin++;
              if (x < 65) leftQuadrantSkin++;
              if (x > 95) rightQuadrantSkin++;
            }
          }

          const intensity = Math.min(100, Math.round((activeSkinPixels / 300) * 100));
          setDetectionIntensity(intensity);

          const now = Date.now();
          if (now - lastGestureTime.current > 1000) {
            let detected: GestureType = 'none';

            // Motion wave or open palm raise
            if (motionPixels > 80 || (activeSkinPixels > 200 && topQuadrantSkin > 80)) {
              detected = 'open_hand';
            } else if (activeSkinPixels > 120) {
              if (leftQuadrantSkin > rightQuadrantSkin + 30) {
                detected = 'one_finger';
              } else if (rightQuadrantSkin > leftQuadrantSkin + 30) {
                detected = 'two_fingers';
              } else if (topQuadrantSkin > 40) {
                detected = 'three_fingers';
              } else {
                detected = 'four_fingers';
              }
            }

            if (detected !== 'none') {
              lastGestureTime.current = now;
              setActiveGesture(detected);
              soundManager.playGestureDetected();
              onGestureActionRef.current(detected);

              setTimeout(() => setActiveGesture('none'), 1000);
            }
          }
        }
      }
      animFrameId = requestAnimationFrame(processVideoFrame);
    };

    animFrameId = requestAnimationFrame(processVideoFrame);
    return () => cancelAnimationFrame(animFrameId);
  }, [isEnabled]);

  const gestureLabelMap: Record<GestureType, { label: string; icon: string }> = {
    open_hand: { label: '✋ Open Palm / Wave (Roll Dice)', icon: '🎲' },
    one_finger: { label: '☝️ 1 Finger (Select Token 1)', icon: '1️⃣' },
    two_fingers: { label: '✌️ 2 Fingers (Select Token 2)', icon: '2️⃣' },
    three_fingers: { label: '🤟 3 Fingers (Select Token 3)', icon: '3️⃣' },
    four_fingers: { label: '🖖 4 Fingers (Select Token 4)', icon: '4️⃣' },
    fist: { label: '✊ Fist (Pass)', icon: '⏩' },
    none: { label: 'Wave hand or click gesture buttons', icon: '🖐️' },
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* Toggle Button */}
      <button
        onClick={() => onToggle(!isEnabled)}
        className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
          isEnabled
            ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30'
            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
        }`}
      >
        {isEnabled ? <Camera className="w-4 h-4 text-emerald-400 animate-pulse" /> : <CameraOff className="w-4 h-4" />}
        <span>{isEnabled ? 'Camera Tracking Active' : 'Enable Camera Gestures'}</span>
      </button>

      {/* Video Stream & Meter */}
      {isEnabled && (
        <div className="w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl p-2 flex flex-col gap-2">
          <div className="relative w-full h-32 bg-black rounded-lg overflow-hidden border border-slate-800">
            <video
              ref={videoRef}
              muted
              playsInline
              className="w-full h-full object-cover transform -scale-x-100"
            />
            <canvas ref={canvasRef} width="160" height="120" className="hidden" />

            {/* Live Gesture Detection Banner */}
            <div className="absolute inset-x-0 bottom-0 bg-slate-950/85 backdrop-blur-md px-2 py-1 text-[10px] text-blue-300 font-extrabold text-center truncate border-t border-slate-800 flex items-center justify-center gap-1">
              <span>{gestureLabelMap[activeGesture].label}</span>
            </div>
          </div>

          {/* Tracking Sensitivity Meter */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
            <span>Tracking Signal</span>
            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-200"
                style={{ width: `${detectionIntensity}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Quick Interactive Gesture Buttons */}
      <div className="w-full bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-1.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Interactive Gesture Control</span>
          <Sparkles className="w-3 h-3 text-amber-400" />
        </span>
        <div className="grid grid-cols-5 gap-1">
          <button
            onClick={() => triggerGesture('open_hand')}
            className="py-1.5 px-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-[10px] font-bold text-blue-200 flex flex-col items-center justify-center transition cursor-pointer"
            title="Roll Dice with Palm"
          >
            <span>✋</span>
            <span>Roll</span>
          </button>
          <button
            onClick={() => triggerGesture('one_finger')}
            className="py-1.5 px-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] font-bold text-slate-200 flex flex-col items-center justify-center transition cursor-pointer"
            title="Select Token 1"
          >
            <span>☝️</span>
            <span>Tok 1</span>
          </button>
          <button
            onClick={() => triggerGesture('two_fingers')}
            className="py-1.5 px-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] font-bold text-slate-200 flex flex-col items-center justify-center transition cursor-pointer"
            title="Select Token 2"
          >
            <span>✌️</span>
            <span>Tok 2</span>
          </button>
          <button
            onClick={() => triggerGesture('three_fingers')}
            className="py-1.5 px-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] font-bold text-slate-200 flex flex-col items-center justify-center transition cursor-pointer"
            title="Select Token 3"
          >
            <span>🤟</span>
            <span>Tok 3</span>
          </button>
          <button
            onClick={() => triggerGesture('four_fingers')}
            className="py-1.5 px-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] font-bold text-slate-200 flex flex-col items-center justify-center transition cursor-pointer"
            title="Select Token 4"
          >
            <span>🖖</span>
            <span>Tok 4</span>
          </button>
        </div>
      </div>

      {cameraError && (
        <div className="w-full flex items-center gap-1.5 text-xs text-rose-300 bg-rose-950/60 border border-rose-800/60 px-3 py-1.5 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}
    </div>
  );
};

