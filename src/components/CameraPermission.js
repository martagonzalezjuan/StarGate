import React, { useState } from "react";
import EmotionDetector from "./EmotionDetector";
import "./CameraPermission.css";

function CameraPermission({ setEmotion }) {
  const [hasPermission, setHasPermission] = useState(false);
  const [stream, setStream] = useState(null);
  const [currentEmotion, setCurrentEmotion] = useState("");

  const handleEmotionChange = (emotion) => {
    setCurrentEmotion(emotion);
    setEmotion(emotion);
  };

  const requestCameraPermission = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      setStream(mediaStream);
      setHasPermission(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      setHasPermission(false);
    }
  };

  return (
    <div className="camera-permission">
      {!hasPermission ? (
        <div className="permission-request">
          <h3>Acceso a la Cámara</h3>
          <p>Para detectar emociones, necesitamos acceso a tu cámara.</p>
          <button onClick={requestCameraPermission}>Permitir Acceso</button>
        </div>
      ) : (
        <>
          <EmotionDetector stream={stream} setEmotion={handleEmotionChange} />
          <div className="emotion-indicator">
            <p>Emoción detectada: {currentEmotion || "ninguna"}</p>
          </div>
        </>
      )}
    </div>
  );
}

export default CameraPermission;
