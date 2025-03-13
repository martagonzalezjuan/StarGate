import React, { useRef, useState, useEffect } from "react";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaCompress,
  FaEllipsisH,
  FaClosedCaptioning,
} from "react-icons/fa";
import "./CustomVideoPlayer.css";

// Helper para convertir "HH:MM:SS.mmm" a segundos
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

function CustomVideoPlayer({ videoData, onChapterChange }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const containerRef = useRef(null);

  // Refs para menús
  const settingsMenuRef = useRef(null);
  const ccMenuRef = useRef(null);

  // Estados del reproductor
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showQualityOptions, setShowQualityOptions] = useState(false);
  const [showSubtitleOptions, setShowSubtitleOptions] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState("Off");

  // Tiempo
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);

  // Overlay para cambio de calidad
  const [isChangingQuality, setIsChangingQuality] = useState(false);

  // Estados para capítulos (se cargarán manualmente desde el VTT)
  const [chapterCues, setChapterCues] = useState([]); // Todas las cues
  const [activeChapter, setActiveChapter] = useState(null); // Cue activa

  // Resolución y ruta base
  const defaultResolution = videoData.resolutions.includes("4k")
    ? "4k"
    : videoData.resolutions[0] || "Auto";
  const [selectedResolution, setSelectedResolution] =
    useState(defaultResolution);
  const basePath = `${process.env.PUBLIC_URL}/assets/video${videoData.id}/`;

  // Manejo de reproducción y sincronización
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const handlePlay = () => {
      setIsPlaying(true);
      if (audioRef.current) audioRef.current.play();
    };
    const handlePause = () => {
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
    };
    const handleTimeUpdate = () => {
      const time = vid.currentTime;
      setCurrentTime(time);
      if (audioRef.current) {
        audioRef.current.currentTime = time;
      }
    };
    const handleLoadedMetadata = () => {
      setDuration(vid.duration);
    };
    const handleProgress = () => {
      if (vid.buffered.length > 0) {
        const bufferedEnd = vid.buffered.end(vid.buffered.length - 1);
        setBuffered(bufferedEnd);
      }
    };

    vid.addEventListener("play", handlePlay);
    vid.addEventListener("pause", handlePause);
    vid.addEventListener("timeupdate", handleTimeUpdate);
    vid.addEventListener("loadedmetadata", handleLoadedMetadata);
    vid.addEventListener("progress", handleProgress);

    return () => {
      vid.removeEventListener("play", handlePlay);
      vid.removeEventListener("pause", handlePause);
      vid.removeEventListener("timeupdate", handleTimeUpdate);
      vid.removeEventListener("loadedmetadata", handleLoadedMetadata);
      vid.removeEventListener("progress", handleProgress);
    };
  }, []);

  // Cargar y parsear manualmente el archivo VTT de capítulos
  useEffect(() => {
    fetch(`${basePath}chapters.vtt`)
      .then((res) => res.text())
      .then((text) => {
        // Remover la cabecera WEBVTT y líneas vacías
        const lines = text
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l && l !== "WEBVTT");
        const cues = [];
        for (let i = 0; i < lines.length; ) {
          const timeLine = lines[i];
          const timeMatch = timeLine.match(/([\d:.]+)\s*-->\s*([\d:.]+)/);
          if (timeMatch) {
            const startTime = parseTime(timeMatch[1]);
            const endTime = parseTime(timeMatch[2]);
            const cueText = lines[i + 1] || "";
            try {
              const data = JSON.parse(cueText.trim());
              data.start = startTime;
              data.end = endTime;
              cues.push(data);
            } catch (e) {
              cues.push({
                label: cueText.trim(),
                start: startTime,
                end: endTime,
              });
            }
            i += 2;
          } else {
            i++;
          }
        }
        console.log("Cues from VTT:", cues);
        setChapterCues(cues);
      })
      .catch((error) => console.error("Error loading chapters VTT:", error));
  }, [basePath]);

  // Actualizar el capítulo activo en función del tiempo del video
  useEffect(() => {
    if (chapterCues.length > 0) {
      const currentCue = chapterCues.find(
        (cue) => currentTime >= cue.start && currentTime < cue.end
      );
      if (
        currentCue &&
        (!activeChapter || currentCue.label !== activeChapter.label)
      ) {
        setActiveChapter(currentCue);
        if (typeof onChapterChange === "function") {
          onChapterChange(currentCue);
        }
      }
    }
  }, [currentTime, chapterCues, activeChapter, onChapterChange]);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        showSettings &&
        settingsMenuRef.current &&
        !settingsMenuRef.current.contains(event.target)
      ) {
        setShowSettings(false);
        setShowQualityOptions(false);
      }
      if (
        showSubtitleOptions &&
        ccMenuRef.current &&
        !ccMenuRef.current.contains(event.target)
      ) {
        setShowSubtitleOptions(false);
      }
    }
    if (showSettings || showSubtitleOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSettings, showSubtitleOptions]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    const mutedValue = !videoRef.current.muted;
    videoRef.current.muted = mutedValue;
    if (audioRef.current) audioRef.current.muted = mutedValue;
    setIsMuted(mutedValue);
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleQualityChange = (quality) => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const wasPlaying = !videoRef.current.paused;
    setSelectedResolution(quality);
    setShowQualityOptions(false);
    setIsChangingQuality(true);
    const sourceElement = videoRef.current.querySelector("source");
    if (sourceElement) {
      sourceElement.src = `${basePath}video${videoData.id}_${quality}.mp4`;
    } else {
      videoRef.current.src = `${basePath}video${videoData.id}_${quality}.mp4`;
    }
    videoRef.current.load();
    videoRef.current.onloadedmetadata = () => {
      videoRef.current.currentTime = current;
      if (wasPlaying) {
        videoRef.current.play();
        setIsPlaying(true);
      }
      setTimeout(() => {
        setIsChangingQuality(false);
      }, 300);
    };
  };

  const handleSubtitleChange = (lang) => {
    const tracks = videoRef.current?.textTracks;
    if (!tracks) return;
    for (let i = 0; i < tracks.length; i++) {
      if (lang === "Off") {
        tracks[i].mode = "disabled";
      } else {
        tracks[i].mode = tracks[i].language === lang ? "showing" : "disabled";
      }
    }
    setCurrentSubtitle(lang);
    setShowSubtitleOptions(false);
  };

  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    videoRef.current.currentTime = newTime;
  };

  const handleMouseEnter = () => setShowControls(true);
  const handleMouseLeave = () => setShowControls(false);

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const bufferPercent = duration ? (buffered / duration) * 100 : 0;

  return (
    <div
      className="video-container"
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        key={`${videoData.id}-${selectedResolution}`}
        ref={videoRef}
        className="video-player"
        controls={false}
        muted={videoData.audio?.length > 0}
        onClick={handlePlayPause}
      >
        <source
          src={`${basePath}video${videoData.id}_${selectedResolution}.mp4`}
          type="video/mp4"
        />
        {/* Track de capítulos: usamos metadata para forzar la carga */}
        <track
          kind="metadata"
          label="Chapters"
          src={`${basePath}chapters.vtt`}
          default
        />
        {/* Subtítulos */}
        {videoData.subtitles &&
          videoData.subtitles.map((lang) => (
            <track
              key={lang}
              label={lang.toUpperCase()}
              kind="subtitles"
              srcLang={lang}
              src={`${basePath}sub${videoData.id}_${lang}.vtt`}
            />
          ))}
        Tu navegador no soporta el elemento de video HTML5.
      </video>
      {videoData.audio && videoData.audio.includes("en") && (
        <audio ref={audioRef} style={{ display: "none" }}>
          <source
            src={`${basePath}audio${videoData.id}_en.m4a`}
            type="audio/aac"
          />
        </audio>
      )}
      {isChangingQuality && <div className="quality-overlay"></div>}
      <div className={`controls-bar ${showControls ? "" : "hidden"}`}>
        <div className="progress-container" onClick={handleSeek}>
          <div className="buffer-bar" style={{ width: `${bufferPercent}%` }} />
          <div
            className="progress-bar"
            style={{ width: `${progressPercent}%` }}
          />
          {/* Dibujar marcadores usando las cues extraídas del VTT */}
          {chapterCues.length > 0 &&
            chapterCues.map((chapter, index) => {
              const chapterPercent = duration
                ? (chapter.start / duration) * 100
                : 0;
              return (
                <div
                  key={index}
                  className="chapter-marker"
                  style={{ left: `${chapterPercent}%` }}
                  data-label={chapter.label}
                />
              );
            })}
        </div>
        <div className="controls-row">
          <div className="controls-left">
            <button
              className="control-btn"
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause();
              }}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            <span className="time-text">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          <div className="controls-right">
            <button className="control-btn" onClick={handleMuteToggle}>
              {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
            <div className="cc-wrapper" ref={ccMenuRef}>
              {videoData.subtitles && videoData.subtitles.length > 0 && (
                <>
                  <button
                    className="control-btn"
                    onClick={() => setShowSubtitleOptions(!showSubtitleOptions)}
                  >
                    <FaClosedCaptioning />
                  </button>
                  {showSubtitleOptions && (
                    <div className="cc-menu">
                      {videoData.subtitles.map((lang) => (
                        <div
                          key={lang}
                          className="cc-item"
                          onClick={() => handleSubtitleChange(lang)}
                        >
                          {lang.toUpperCase()}
                        </div>
                      ))}
                      <div
                        className="cc-item"
                        onClick={() => handleSubtitleChange("Off")}
                      >
                        Off
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <button className="control-btn" onClick={handleFullscreen}>
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
            <div className="settings-wrapper" ref={settingsMenuRef}>
              <button
                className="control-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettings(!showSettings);
                }}
              >
                <FaEllipsisH />
              </button>
              {showSettings && (
                <div className="settings-menu">
                  <div className="settings-option">
                    Calidad: {selectedResolution}
                  </div>
                  {videoData.resolutions.map((res) => (
                    <div
                      key={res}
                      className="quality-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQualityChange(res);
                      }}
                    >
                      {res}
                    </div>
                  ))}
                  <div
                    className="quality-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQualityChange("Auto");
                    }}
                  >
                    Auto
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomVideoPlayer;
