import React, { useRef, useState, useEffect } from "react";
import * as shaka from "shaka-player/dist/shaka-player.ui.js";
import "shaka-player/dist/controls.css";
import { Canvas } from "@react-three/fiber";
import AnimatedModel from "./components/AnimatedModel";
import "./CustomVideoPlayer.css";

// Convierte "HH:MM:SS.mmm" a segundos
const parseTime = (timeStr) => {
  const parts = timeStr.split(":");
  if (parts.length === 3) {
    return (
      parseFloat(parts[0]) * 3600 +
      parseFloat(parts[1]) * 60 +
      parseFloat(parts[2])
    );
  } else if (parts.length === 2) {
    return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
  }
  return 0;
};

export default function CustomVideoPlayer({ videoData, onChapterChange, emotion }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [chapterCues, setChapterCues] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeChapter, setActiveChapter] = useState(null);

  const basePath = `/assets/video${videoData.id}/`;

  // Inicializa Shaka Player y UI con attach() y orden correcto de parámetros
  useEffect(() => {
    const videoEl = videoRef.current;
    const containerEl = containerRef.current;
    if (!videoEl || !containerEl) return;

    shaka.polyfill.installAll();
    if (!shaka.Player.isBrowserSupported()) {
      console.error("Shaka Player no soportado en este navegador");
      return;
    }

    const player = new shaka.Player();
    player.attach(videoEl);
    const ui = new shaka.ui.Overlay(player, containerEl, videoEl);
    ui.getControls();

    const manifestUri = `${basePath}manifest.mpd`;
    console.log("🚀 Shaka va a pedir este URI:", manifestUri);
    player
      .load(manifestUri)
      .then(() => console.log("Shaka: manifest cargado correctamente"))
      .catch((e) => console.error("Shaka: error al cargar manifest.mpd", e));

    return () => player.destroy();
  }, [basePath]);

  // Efecto para cargar y parsear capítulos desde VTT
  useEffect(() => {
    fetch(`${basePath}chapters.vtt`)
      .then((res) => res.text())
      .then((text) => {
        const lines = text
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l && l !== "WEBVTT");
        const cues = [];
        for (let i = 0; i < lines.length; ) {
          const m = lines[i].match(/([\d:.]+)\s*-->\s*([\d:.]+)/);
          if (m) {
            const start = parseTime(m[1]);
            const end = parseTime(m[2]);
            let data;
            try {
              data = JSON.parse(lines[i + 1].trim());
            } catch {
              data = { label: lines[i + 1].trim() };
            }
            cues.push({ ...data, start, end });
            i += 2;
          } else {
            i++;
          }
        }
        setChapterCues(cues);
      })
      .catch((err) => console.error("Error cargando chapters.vtt", err));
  }, [basePath]);

  // Efecto para actualizar currentTime
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const onTimeUpdate = () => setCurrentTime(videoEl.currentTime);
    videoEl.addEventListener("timeupdate", onTimeUpdate);
    return () => videoEl.removeEventListener("timeupdate", onTimeUpdate);
  }, []);

  // Efecto para detectar cambio de capítulo
  useEffect(() => {
    if (!chapterCues.length) return;
    const cue = chapterCues.find(
      (c) => currentTime >= c.start && currentTime < c.end
    );
    if (cue && cue.label !== activeChapter?.label) {
      setActiveChapter(cue);
      // Llamada segura a onChapterChange
      if (typeof onChapterChange === 'function') {
        onChapterChange(cue);
      }
    }
  }, [currentTime, chapterCues, activeChapter, onChapterChange]);

  return (
    <div ref={containerRef} className="video-container" style={{ position: "relative" }}>
      <video ref={videoRef} className="video-player" controls style={{ width: "100%" }} />

      {emotion === "happy" && (
        <Canvas
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <ambientLight intensity={1} />
          <AnimatedModel emotion={emotion} />
        </Canvas>
      )}

      {activeChapter && <div className="chapter-overlay">{activeChapter.label}</div>}
    </div>
  );
}