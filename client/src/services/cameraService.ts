/**
 * Camera & Privacy Service
 * Safely handles visitor webcam video streams locally with zero biometric analysis or remote uploading.
 * Generates synthetic cyber-avatar if camera permission is withheld.
 */

class CameraService {
  private stream: MediaStream | null = null;
  private isAvailable: boolean = false;

  public async requestCamera(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.isAvailable = false;
        return false;
      }
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });
      this.isAvailable = true;
      return true;
    } catch (err) {
      console.warn('Webcam permission denied or unavailable:', err);
      this.stream = null;
      this.isAvailable = false;
      return false;
    }
  }

  public getStream(): MediaStream | null {
    return this.stream;
  }

  public isCameraReady(): boolean {
    return this.isAvailable && this.stream !== null && this.stream.active;
  }

  public stopStream() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.isAvailable = false;
  }

  /**
   * Captures a high-resolution snapshot frame from the live video element.
   * If live feed is unavailable, generates a stylized futuristic cyber-avatar.
   */
  public captureSnapshot(videoElement: HTMLVideoElement | null): string {
    if (videoElement && this.isCameraReady() && videoElement.videoWidth > 0) {
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mirror horizontally so visitor sees self naturally
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.92);
      }
    }

    // Fallback: Generate a stylized futuristic Holographic Explorer Avatar
    return this.generateSyntheticAvatar();
  }

  /**
   * Generates a sleek, futuristic avatar for camera-off mode
   */
  public generateSyntheticAvatar(): string {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 640, 480);
    grad.addColorStop(0, '#040915');
    grad.addColorStop(0.5, '#081735');
    grad.addColorStop(1, '#02050e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 480);

    // Cyber grid lines
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 640; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 480);
      ctx.stroke();
    }
    for (let y = 0; y < 480; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(640, y);
      ctx.stroke();
    }

    // Holographic silhouette
    ctx.save();
    ctx.translate(320, 240);

    // Halo rings
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 110, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#7928ca';
    ctx.beginPath();
    ctx.arc(0, 0, 130, 0, Math.PI * 2);
    ctx.stroke();

    // Stylized Cyber Visor / Head
    ctx.fillStyle = 'rgba(0, 242, 254, 0.2)';
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 3;
    // Head shape
    ctx.beginPath();
    ctx.arc(0, -20, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Visor glowing slit
    ctx.fillStyle = '#00f2fe';
    ctx.fillRect(-30, -25, 60, 8);

    // Shoulders
    ctx.beginPath();
    ctx.moveTo(-70, 70);
    ctx.quadraticCurveTo(0, 25, 70, 70);
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();

    // Technical overlay text
    ctx.fillStyle = '#00f2fe';
    ctx.font = 'bold 16px "Orbitron", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SYNTHETIC VISITOR AVATAR // OPTICAL SENSOR BYPASSED', 320, 430);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText('EXHIBITION AGENT #4092-A', 320, 450);

    return canvas.toDataURL('image/jpeg', 0.9);
  }
}

export const cameraService = new CameraService();
