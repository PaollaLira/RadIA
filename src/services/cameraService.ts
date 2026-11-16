export interface CameraCapabilitiesState {
  hasMultipleCameras: boolean;
  hasTorch: boolean;
  isTorchOn: boolean;
}

class CameraService {
  private activeStream: MediaStream | null = null;
  private currentFacingMode: 'environment' | 'user' = 'environment';
  private torchState = false;

  public async isCameraSupported(): Promise<boolean> {
    return !!(
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function'
    );
  }

  public async startCamera(
    videoElement: HTMLVideoElement,
    facingMode: 'environment' | 'user' = 'environment'
  ): Promise<CameraCapabilitiesState> {
    this.stopCamera();
    this.currentFacingMode = facingMode;

    const constraints: MediaStreamConstraints = {
      audio: false,
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.activeStream = stream;
      videoElement.srcObject = stream;
      await videoElement.play();

      const track = stream.getVideoTracks()[0];
      const capabilities = (track?.getCapabilities ? track.getCapabilities() : {}) as {
        torch?: boolean;
      };

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');

      return {
        hasMultipleCameras: videoInputs.length > 1,
        hasTorch: !!capabilities.torch,
        isTorchOn: false,
      };
    } catch (err) {
      console.error('Falha ao iniciar stream da câmera:', err);
      throw err;
    }
  }

  public async toggleTorch(): Promise<boolean> {
    if (!this.activeStream) return false;
    const track = this.activeStream.getVideoTracks()[0];
    if (!track) return false;

    try {
      this.torchState = !this.torchState;
      // applyConstraints com torch (suportado no Chrome Android e Safari iOS recente)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (track as any).applyConstraints({
        advanced: [{ torch: this.torchState }],
      });
      return this.torchState;
    } catch (err) {
      console.warn('Lanterna/Torch não suportada neste dispositivo:', err);
      return false;
    }
  }

  public captureSnapshot(videoElement: HTMLVideoElement): string {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth || 1280;
    canvas.height = videoElement.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Não foi possível obter contexto 2D para captura');
    }

    // Se estiver na câmera frontal, espelha para visualização natural
    if (this.currentFacingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.92);
  }

  public stopCamera(): void {
    if (this.activeStream) {
      this.activeStream.getTracks().forEach((track) => track.stop());
      this.activeStream = null;
      this.torchState = false;
    }
  }
}

export const cameraService = new CameraService();
