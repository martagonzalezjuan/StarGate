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

function CustomVideoPlayer({ videoData }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const containerRef = useRef(null);

  // Refs para los menús
  const settingsMenuRef = useRef(null); // Menú de configuraciones (3 puntitos)
  const ccMenuRef = useRef(null); // Menú de subtítulos (CC)

  // --- Estados del reproductor ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Menú de configuración
  const [showSettings, setShowSettings] = useState(false);
  const [showQualityOptions, setShowQualityOptions] = useState(false);

  // Subtítulos: CC
  const [showSubtitleOptions, setShowSubtitleOptions] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState("Off");

  // Tiempo
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);

  // Estado para mostrar overlay de cambio de calidad
  const [isChangingQuality, setIsChangingQuality] = useState(false);

  // Capítulos (opcional)
  const chapters = videoData.chapters || [];

  // Resolución seleccionada
  const defaultResolution = videoData.resolutions.includes("720p")
    ? "720p"
    : videoData.resolutions[0] || "Auto";
  const [selectedResolution, setSelectedResolution] =
    useState(defaultResolution);

  // Ruta base para archivos
  const basePath = `${process.env.PUBLIC_URL}/assets/video${videoData.id}/`;

  // Efectos de video
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
      setCurrentTime(vid.currentTime);
      if (audioRef.current) {
        audioRef.current.currentTime = vid.currentTime;
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

  // --- Menús: Cerrar al hacer clic fuera ---
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

  // --- Play / Pause ---
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

  // --- Mute / Unmute ---
  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    const mutedValue = !videoRef.current.muted;
    videoRef.current.muted = mutedValue;
    if (audioRef.current) {
      audioRef.current.muted = mutedValue;
    }
    setIsMuted(mutedValue);
  };

  // --- Fullscreen ---
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

  // --- Cambio de calidad sin reiniciar desde el principio y minimizando flicker ---
  const handleQualityChange = (quality) => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const wasPlaying = !videoRef.current.paused;
    setSelectedResolution(quality);
    setShowQualityOptions(false);

    // Activamos overlay para cubrir el video
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
      // Después de un corto delay, quitamos el overlay
      setTimeout(() => {
        setIsChangingQuality(false);
      }, 300);
    };
  };

  // --- Cambio de subtítulos ---
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

  // --- Seek (clic en la barra de progreso) ---
  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const rect = e.target.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percent = clickX / width;
    const newTime = percent * duration;
    videoRef.current.currentTime = newTime;
  };

  // --- Mouse Enter / Leave ---
  const handleMouseEnter = () => setShowControls(true);
  const handleMouseLeave = () => setShowControls(false);

  // --- Formatear tiempo ---
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
      {/* VIDEO principal */}
      <video
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
        {/* Subtítulos WebVTT */}
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
        Tu navegador no soporta el elemento video.
      </video>
      {videoData.audio && videoData.audio.includes("en") && (
        <audio ref={audioRef} style={{ display: "none" }}>
          <source
            src={`${basePath}audio${videoData.id}_en.aac`}
            type="audio/aac"
          />
        </audio>
      )}

      {/* Overlay para cambio de calidad */}
      {isChangingQuality && <div className="quality-overlay"></div>}

      <div className={`controls-bar ${showControls ? "" : "hidden"}`}>
        {/* Barra de progreso */}
        <div className="progress-container" onClick={handleSeek}>
          <div className="buffer-bar" style={{ width: `${bufferPercent}%` }} />
          <div
            className="progress-bar"
            style={{ width: `${progressPercent}%` }}
          />
          {chapters.map((chapter, index) => {
            const chapterPercent = duration
              ? (chapter.time / duration) * 100
              : 0;
            return (
              <div
                key={index}
                className="chapter-marker"
                style={{ left: `${chapterPercent}%` }}
                title={chapter.label}
              />
            );
          })}
        </div>

        {/* Fila inferior de controles */}
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
