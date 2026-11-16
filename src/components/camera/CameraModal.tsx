import React, { useEffect, useRef, useState } from 'react';
import { cameraService, CameraCapabilitiesState } from '../../services/cameraService';
import { useLanguage } from '../../i18n/LanguageContext';
import { Camera, X, Zap, ZapOff, RotateCcw, Check, Upload, AlertCircle } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const { lang, t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [capabilities, setCapabilities] = useState<CameraCapabilitiesState>({
    hasMultipleCameras: false,
    hasTorch: false,
    isTorchOn: false,
  });
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) {
      cameraService.stopCamera();
      setCapturedImage(null);
      setErrorMsg(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setErrorMsg(null);

    const initCamera = async () => {
      try {
        if (!videoRef.current) return;
        const caps = await cameraService.startCamera(videoRef.current, facingMode);
        if (isMounted) {
          setCapabilities(caps);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.warn('Camera start failed:', err);
          const message = err instanceof Error ? err.message : String(err);
          setErrorMsg(
            lang === 'en'
              ? `Camera access unavailable or blocked (${message}). You can still use your device native camera with the button below.`
              : `Acesso à câmera indisponível ou bloqueado (${message}). Você também pode usar a câmera nativa do celular através do botão abaixo.`
          );
          setIsLoading(false);
        }
      }
    };

    initCamera();

    return () => {
      isMounted = false;
      cameraService.stopCamera();
    };
  }, [isOpen, facingMode, lang]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    try {
      const dataUrl = cameraService.captureSnapshot(videoRef.current);
      setCapturedImage(dataUrl);
    } catch (err) {
      console.error('Capture error:', err);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const handleToggleTorch = async () => {
    const isNowOn = await cameraService.toggleTorch();
    setCapabilities((prev) => ({ ...prev, isTorchOn: isNowOn }));
  };

  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleNativeFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCapturedImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-between p-4 backdrop-blur-md select-none"
      role="dialog"
      aria-modal="true"
      aria-label={t.camera.title}
    >
      {/* Top Controls */}
      <div className="w-full max-w-lg flex items-center justify-between text-white py-2 z-10">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-cyan-400" />
          <span className="text-sm font-semibold tracking-wide">{t.camera.title}</span>
        </div>
        <div className="flex items-center gap-2">
          {capabilities.hasTorch && !capturedImage && (
            <button
              onClick={handleToggleTorch}
              className={`p-2.5 rounded-full transition-colors ${
                capabilities.isTorchOn ? 'bg-amber-400 text-slate-900' : 'bg-slate-800/80 text-white hover:bg-slate-700'
              }`}
              title="Torch"
              aria-label="Toggle torch"
            >
              {capabilities.isTorchOn ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
            </button>
          )}

          {capabilities.hasMultipleCameras && !capturedImage && (
            <button
              onClick={handleFlipCamera}
              className="p-2.5 rounded-full bg-slate-800/80 text-white hover:bg-slate-700 transition-colors"
              title="Flip Camera"
              aria-label="Switch front and rear camera"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-slate-800/80 text-white hover:bg-slate-700 transition-colors"
            title="Close"
            aria-label="Close camera modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Viewfinder Center */}
      <div className="relative w-full max-w-lg aspect-4/3 sm:aspect-16/10 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center my-auto shadow-2xl">
        {capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured ultrasound frame"
            className="w-full h-full object-contain"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full object-cover"
            />

            {/* Grid overlay */}
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="w-8 h-8 border-t-2 border-l-2 border-cyan-400/80 rounded-tl-lg" />
                <div className="w-8 h-8 border-t-2 border-r-2 border-cyan-400/80 rounded-tr-lg" />
              </div>
              <div className="text-center">
                <span className="inline-block bg-slate-900/80 text-cyan-300 text-xs px-3 py-1 rounded-full border border-cyan-500/30 backdrop-blur-sm">
                  {t.camera.frameHint}
                </span>
              </div>
              <div className="flex justify-between">
                <div className="w-8 h-8 border-b-2 border-l-2 border-cyan-400/80 rounded-bl-lg" />
                <div className="w-8 h-8 border-b-2 border-r-2 border-cyan-400/80 rounded-br-lg" />
              </div>
            </div>

            {isLoading && (
              <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-slate-300 gap-3">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-medium">{t.camera.starting}</span>
              </div>
            )}

            {errorMsg && (
              <div className="absolute inset-0 bg-slate-950/95 p-6 flex flex-col items-center justify-center text-center text-slate-300 gap-4">
                <AlertCircle className="w-10 h-10 text-amber-400" />
                <p className="text-xs text-slate-400 max-w-sm">{errorMsg}</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-lg bg-teal-800 text-cyan-200 text-xs font-semibold flex items-center gap-2 hover:bg-teal-700"
                >
                  <Upload className="w-4 h-4" />
                  {t.camera.nativeBtn}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Hidden native capture input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleNativeFileInput}
        className="hidden"
      />

      {/* Bottom Shutter / Action Controls */}
      <div className="w-full max-w-lg flex items-center justify-around py-4 z-10">
        {capturedImage ? (
          <div className="flex items-center gap-6">
            <button
              onClick={handleRetake}
              className="px-5 py-3 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              {t.camera.retake}
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-teal-900/40"
            >
              <Check className="w-4 h-4" />
              {t.camera.useImage}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full px-6">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-full bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title={t.camera.nativeBtn}
              aria-label={t.camera.nativeBtn}
            >
              <Upload className="w-5 h-5" />
            </button>

            <button
              onClick={handleCapture}
              disabled={isLoading || !!errorMsg}
              className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center p-1 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none"
              title="Capture"
              aria-label="Capture photo"
            >
              <div className="w-full h-full rounded-full bg-white hover:bg-cyan-100 transition-colors shadow-inner" />
            </button>

            <div className="w-11" />
          </div>
        )}
      </div>
    </div>
  );
};
