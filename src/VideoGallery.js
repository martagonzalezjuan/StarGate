import React, { useState, useEffect, useRef } from 'react';
import './VideoGallery.css';

const availableResolutions = ['4k', '1080p', '720p'];
const availableLanguages = ['en', 'es', 'fr']; // Agrega más idiomas si los necesitas

function VideoGallery({ videos }) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const currentVideo = videos.length > 0 ? videos[currentVideoIndex] : null;

  const videoBasePath = currentVideo ? `${process.env.PUBLIC_URL}/assets/video${currentVideo.id}/` : '';
  const audioBasePath = currentVideo ? `${process.env.PUBLIC_URL}/assets/video${currentVideo.id}/audio${currentVideo.id}_` : '';
  const subtitlesBasePath = currentVideo ? `${process.env.PUBLIC_URL}/assets/video${currentVideo.id}/sub${currentVideo.id}_` : '';

  // Cambia el video al hacer clic en una miniatura
  const handleVideoSelect = (index) => {
    setCurrentVideoIndex(index);
  };

  // ✅ Aseguramos que useEffect siempre se ejecuta
  useEffect(() => {
    if (videoRef.current && audioRef.current && currentVideo) {
      videoRef.current.addEventListener('play', () => audioRef.current.play());
      videoRef.current.addEventListener('pause', () => audioRef.current.pause());
      videoRef.current.addEventListener('timeupdate', () => {
        audioRef.current.currentTime = videoRef.current.currentTime;
      });
    }
  }, [currentVideoIndex, currentVideo]);

  if (!currentVideo) {
    return <div className='video-gallery'>No hay videos disponibles.</div>;
  }

  return (
    <div className="video-gallery">
      <h2>Galería de Videos</h2>
      <div className="video-display">
        <div className="video-selected">
          <video ref={videoRef} controls width="100%">
            {currentVideo.resolutions.map(res => (
              <source key={res} src={`${videoBasePath}video${currentVideo.id}_${res}.mp4`} type="video/mp4" />
            ))}
            {currentVideo.subtitles.map(lang => (
              <track key={lang} label={lang.toUpperCase()} kind="subtitles" srcLang={lang} src={`${subtitlesBasePath}${lang}.vtt`} />
            ))}
            Tu navegador no soporta el elemento video.
          </video>
          {currentVideo.audio.includes("en") && (
            <audio ref={audioRef}>
              <source src={`${audioBasePath}en.wav`} type="audio/wav" />
            </audio>
          )}
          <h3>{currentVideo.title}</h3>
        </div>
      </div>

      {/* Carrusel de videos */}
      <div className="video-slider">
        {videos.map((video, index) => (
          <div
            key={video.id}
            className={`slider-item ${index === currentVideoIndex ? 'active' : ''}`}
            onClick={() => handleVideoSelect(index)}
          >
            <video muted>
              <source src={`${process.env.PUBLIC_URL}/assets/video${video.id}/video${video.id}_720p.mp4`} type="video/mp4" />
            </video>
            <p>{video.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VideoGallery;
