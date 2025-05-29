import React, { useRef, useState, useEffect } from "react";
import Hls from "hls.js";
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

export default function CustomVideoPlayer({
  videoData,
  onChapterChange,
  emotion,
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [chapterCues, setChapterCues] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeChapter, setActiveChapter] = useState(null);

  // 1) Detecta Theta por thetaId
  const isTheta = Boolean(videoData.thetaId);
  console.log("CustomVideoPlayer:", videoData.title, "isTheta =", isTheta);

  // 2) Si es Theta, arma la URL; si no, basePath para DASH
  const thetaUrl = isTheta
    ? `https://media.thetavideoapi.com/org_2janifx47dr193cyz1cu29j2fdgm/` +
      `srvacc_5fynasy80kiif1r4517bmmty2/${videoData.thetaId}/master.m3u8`
    : null;
  const basePath = `/assets/video${videoData.id}/`;

  // ─── Shaka Player (DASH) ───
  useEffect(() => {
    console.log("▶ Shaka useEffect fired, isTheta=", isTheta);
    if (isTheta) {
      console.log("⏭ Skipping Shaka because this is a Theta video");
      return;
    }

    const videoEl = videoRef.current;
    const uiContainer = containerRef.current;
    if (!videoEl || !uiContainer) return;

    shaka.polyfill.installAll();
    if (!shaka.Player.isBrowserSupported()) {
      console.error("Shaka no soportado");
      return;
    }

    const player = new shaka.Player();
    player.attach(videoEl);
    new shaka.ui.Overlay(player, uiContainer, videoEl).getControls();

    player
      .load(`${basePath}manifest.mpd`)
      .then(() => console.log("✅ Shaka: DASH cargado"))
      .catch((e) =>
        console.error("💥 Shaka: error cargando manifest.mpd", e)
      );

    return () => {
      console.log("🔨 Shaka: destruyendo player");
      player.destroy();
    };
  }, [basePath, isTheta]);

  // ─── Capítulos VTT (DASH) ───
  useEffect(() => {
    if (isTheta) return;
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
              data = JSON.parse(lines[i + 1]);
            } catch {
              data = { label: lines[i + 1] };
            }
            cues.push({ ...data, start, end });
            i += 2;
          } else {
            i++;
          }
        }
        setChapterCues(cues);
      })
      .catch((err) => console.error("💥 Error cargando VTT:", err));
  }, [basePath, isTheta]);

  // ─── Timeupdate & capítulos (DASH) ───
  useEffect(() => {
    if (isTheta) return;
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const onTimeUpdate = () => setCurrentTime(videoEl.currentTime);
    videoEl.addEventListener("timeupdate", onTimeUpdate);
    return () => videoEl.removeEventListener("timeupdate", onTimeUpdate);
  }, [isTheta]);

  useEffect(() => {
    if (isTheta || chapterCues.length === 0) return;
    const cue = chapterCues.find(
      (c) => currentTime >= c.start && currentTime < c.end
    );
    if (cue && cue.label !== activeChapter?.label) {
      setActiveChapter(cue);
      onChapterChange?.(cue);
    }
  }, [currentTime, chapterCues, activeChapter, onChapterChange, isTheta]);
  console.log("videoData en CustomVideoPlayer:", videoData);
  // ─── HLS.js para Theta ───
  useEffect(() => {
    console.log("▶ HLS useEffect fired, isTheta=", isTheta);
    if (!isTheta) return;

    const videoEl = videoRef.current;
    if (!videoEl) return;

    const hls = new Hls();
    hls.loadSource(thetaUrl);
    hls.attachMedia(videoEl);
    console.log("✅ Hls.js cargando", thetaUrl);

    return () => {
      console.log("🔨 Hls.js destruir");
      hls.destroy();
    };
  }, [isTheta, thetaUrl]);

  return (
    <div
      ref={containerRef}
      className="video-container"
      style={{
        position: "relative",
        paddingBottom: isTheta ? "56.25%" : 0,
        height: isTheta ? 0 : "auto",
      }}
    >
      <video
        ref={videoRef}
        className="video-player"
        controls
        style={{ width: "100%" }}
      />

      {emotion === "happy" && !isTheta && (
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

      {activeChapter && !isTheta && (
        <div className="chapter-overlay">{activeChapter.label}</div>
      )}
    </div>
  );
}