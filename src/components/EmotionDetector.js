import React, { useRef, useState, useEffect, useCallback } from "react";
import { HfInference } from "@huggingface/inference";

const HF_TOKEN = process.env.REACT_APP_HF_TOKEN;
const inference = new HfInference(HF_TOKEN);

// Cambiamos al modelo justin-cv/ferplus
const MODEL_ID = "justin-cv/ferplus";

const emotionTranslations = {
  neutral: "neutral",
  happiness: "feliz",
  surprise: "sorprendido",
  sadness: "triste",
  anger: "enfadado",
  disgust: "disgustado",
  fear: "miedo",
  contempt: "desprecio",
};

function EmotionDetector({ stream }) {
  const videoRef = useRef();
  const [emotion, setEmotion] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const analyzeEmotion = useCallback(async () => {
    if (!videoRef.current || analyzing) return;

    try {
      setAnalyzing(true);
      console.log("Analizando emoción...");

      // Capturar frame del video
      const canvas = document.createElement("canvas");
      canvas.width = 224; // Tamaño requerido por el modelo
      canvas.height = 224;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, 224, 224);

      // Convertir a blob
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.8);
      });

      // Convertir blob a base64
      const reader = new FileReader();
      const base64Image = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.readAsDataURL(blob);
      });

      // Enviar a Hugging Face
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${MODEL_ID}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: base64Image,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Respuesta:", data);

      if (data && data[0]) {
        const detectedEmotion = data[0].label.toLowerCase();
        console.log("Emoción detectada:", detectedEmotion);
        setEmotion(emotionTranslations[detectedEmotion] || detectedEmotion);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setAnalyzing(false);
    }
  }, [analyzing]);

  useEffect(() => {
    const interval = setInterval(analyzeEmotion, 3000);
    return () => clearInterval(interval);
  }, [analyzeEmotion]);

  return (
    <div className="emotion-detector">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: "100%", maxWidth: "600px" }}
      />
      <div className="emotion-status">
        {analyzing ? <p>Analizando...</p> : <p>&nbsp;</p>}
        {emotion && (
          <div className="emotion-result">
            <p>Emoción detectada: {emotion}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmotionDetector;
