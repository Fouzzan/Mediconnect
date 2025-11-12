
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CameraIcon } from './Icons';

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
  onClear?: () => void;
  captureTrigger?: boolean;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture, onClear }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 360 } });
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setStream(newStream);
      setError(null);
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError("Camera access was denied. Please allow camera access in your browser settings and refresh the page to use this feature.");
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError("No camera was found on your device. Please connect a camera and try again.");
      } else {
        setError("Could not access the camera. Please check your browser permissions and ensure your camera is not being used by another application.");
      }
    }
  }, [stream]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageDataUrl);
        onCapture(imageDataUrl);
      }
    }
  };
  
  const handleRetake = () => {
      setCapturedImage(null);
      if(onClear) onClear();
      startCamera();
  }

  if (error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4">
      <div className="relative w-full aspect-[4/3] bg-gray-900 rounded-lg overflow-hidden shadow-lg">
        {capturedImage ? (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-3/4 h-[90%] border-4 border-dashed border-white/50 rounded-full" style={{boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)'}}></div>
            </div>
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      {capturedImage ? (
        <button
          type="button"
          onClick={handleRetake}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
        >
          Retake Photo
        </button>
      ) : (
        <button
          type="button"
          onClick={handleCapture}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
        >
          <CameraIcon className="w-6 h-6" />
          <span className="text-lg font-semibold">Capture Photo</span>
        </button>
      )}
    </div>
  );
};

export default WebcamCapture;
