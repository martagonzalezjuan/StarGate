import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";

function EmotionDetector() {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [emotion, setEmotion] = useState("");
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        // Make sure we're using the correct path
        const MODEL_URL = `${process.env.PUBLIC_URL}/models`;

        console.log("Loading models from:", MODEL_URL);

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);

        console.log("Models loaded successfully");
        setIsModelLoaded(true);
      } catch (error) {
        console.error("Error loading models:", error);
      }
    };

    loadModels();
  }, []);

  useEffect(() => {
    if (isModelLoaded) {
      startVideo();
    }
  }, [isModelLoaded]);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

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
          }
        } catch (error) {
          console.error("Error detecting emotions:", error);
          clearInterval(interval);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  if (!isModelLoaded) {
    return <div>Loading models...</div>;
  }

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onPlay={handlePlay}
        style={{ width: "100%", maxWidth: "600px" }}
      />
      <canvas ref={canvasRef} />
      {emotion && <p>Emoción detectada: {emotion}</p>}
    </div>
  );
}

export default EmotionDetector;
