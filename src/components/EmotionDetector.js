import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";

function EmotionDetector({ stream, setEmotion }) {
  const videoRef = useRef();
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = `${process.env.PUBLIC_URL}/models`;
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setIsModelLoaded(true);
      } catch (error) {
        console.error("Error loading models:", error);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handlePlay = () => {
    const interval = setInterval(async () => {
      if (videoRef.current && isModelLoaded) {
        try {
          const detections = await faceapi
            .detectAllFaces(
              videoRef.current,
              new faceapi.TinyFaceDetectorOptions()
            )
            .withFaceExpressions();

          if (detections && detections[0]) {
            const emotions = detections[0].expressions;
            const dominantEmotion = Object.keys(emotions).reduce((a, b) =>
              emotions[a] > emotions[b] ? a : b
            );
            setEmotion(dominantEmotion);
            console.log("Emoción detectada:", dominantEmotion); // Para debuggear
          }
        } catch (error) {
          console.error("Error detecting emotions:", error);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  return (
    <div style={{ position: "relative" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onPlay={handlePlay}
        style={{ width: "100%", maxWidth: "600px" }}
      />
    </div>
  );
}

export default EmotionDetector;
