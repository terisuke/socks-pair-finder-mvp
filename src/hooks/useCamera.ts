import { useState, useRef, useEffect, useCallback, type RefObject } from 'react';

interface UseCameraReturn {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  stream: MediaStream | null;
  error: string | null;
  isReady: boolean;
  capturePhoto: () => string | null;
  stopCamera: () => void;
}

export const useCamera = (): UseCameraReturn => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let localStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        localStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setIsReady(true);
        }
      } catch (err: unknown) {
        if (err instanceof DOMException) {
          if (err.name === 'NotAllowedError') {
            setError('カメラアクセスが拒否されました');
          } else if (err.name === 'NotFoundError') {
            setError('カメラが見つかりませんでした');
          } else {
            setError('カメラの起動に失敗しました');
          }
        } else {
          setError('カメラへのアクセスが拒否されたか、デバイスが見つかりません。');
        }
        console.error('Camera error:', err);
      }
    };

    startCamera();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg');
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsReady(false);
    }
  }, [stream]);

  return {
    videoRef,
    canvasRef,
    stream,
    error,
    isReady,
    capturePhoto,
    stopCamera,
  };
};
