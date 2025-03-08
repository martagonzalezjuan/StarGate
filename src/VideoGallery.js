import React, { useState, useEffect, useRef } from 'react';
import './VideoGallery.css';

const availableResolutions = ['4k', '1080p', '720p'];
const availableLanguages = ['en', 'es', 'fr'];

function VideoGallery({ videos }) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const currentVideo = videos && videos.length > 0 ? videos[currentVideoIndex] : null;

  const videoBasePath = currentVideo ? `${process.env.PUBLIC_URL}/assets/video${currentVideo.id}/` : '';
  const audioBasePath = currentVideo ? `${process.env.PUBLIC_URL}/assets/video${currentVideo.id}/audio${currentVideo.id}_` : '';
  const subtitlesBasePath = currentVideo ? `${process.env.PUBLIC_URL}/assets/video${currentVideo.id}/sub${currentVideo.id}_` : '';

  const handleVideoSelect = (index) => {
    if (index !== currentVideoIndex) {
      setCurrentVideoIndex(index);
    }
  };

  useEffect(() => {
    const handlePlay = () => audioRef.current && audioRef.current.play();
    const handlePause = () => audioRef.current && audioRef.current.pause();
    const handleTimeUpdate = () => {
      if (audioRef.current && videoRef.current) {
        audioRef.current.currentTime = videoRef.current.currentTime;
      }
    };

    if (videoRef.current && audioRef.current && currentVideo) {
      videoRef.current.addEventListener('play', handlePlay);
      videoRef.current.addEventListener('pause', handlePause);
      videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
    }

    return () => {
      if (videoRef.current && audioRef.current) {
        videoRef.current.removeEventListener('play', handlePlay);
        videoRef.current.removeEventListener('pause', handlePause);
        videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };
  }, [currentVideo]);

  if (!currentVideo) {
    return <div className="video-gallery">No hay videos disponibles.</div>;
  }

  return (
    <div className="video-gallery">
      <h2>Galería de Videos</h2>
      <div className="video-display">
        <div className="video-selected">
          <video key={currentVideo.id} ref={videoRef} controls width="100%">
            {availableResolutions
              .filter(res => currentVideo.resolutions.includes(res))
              .map(res => (
                <source
                  key={res}
                  src={`${videoBasePath}video${currentVideo.id}_${res}.mp4`}
                  type="video/mp4"
                />
              ))}
            {availableLanguages
              .filter(lang => currentVideo.subtitles.includes(lang))
              .map(lang => (
                <track
                  key={lang}
                  label={lang.toUpperCase()}
                  kind="subtitles"
                  srcLang={lang}
                  src={`${subtitlesBasePath}${lang}.vtt`}
                />
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

      <div className="video-slider">
        {videos.map((video, index) => (
          <div
            key={video.id}
            className={`slider-item ${index === currentVideoIndex ? 'active' : ''}`}
            onClick={() => handleVideoSelect(index)}
          >
            <video muted>
              <source
                src={`${process.env.PUBLIC_URL}/assets/video${video.id}/video${video.id}_720p.mp4`}
                type="video/mp4"
              />
            </video>
            <p>{video.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VideoGallery;
