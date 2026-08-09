import { useEffect, useRef } from "react";

/**
 * Starts the webcam on mount and stops it on unmount.
 * Returns a ref to attach to a <video> element, plus a helper
 * to grab the current frame as a JPEG Blob for upload.
 */
export function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    }

    start();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const captureFrame = () => {
    return new Promise((resolve) => {
      const video = videoRef.current;
      if (!video || video.videoWidth === 0) {
        resolve(null);
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
    });
  };

  return { videoRef, captureFrame };
}
