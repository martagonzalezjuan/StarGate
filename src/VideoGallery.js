import React, { useState } from 'react';
import './VideoGallery.css';

function VideoGallery() {
  // En lugar de usar la API, cargamos el video local
  const localVideoUrl = process.env.PUBLIC_URL + "/assets/video_hubble_4k.mp4"; 
  const subtitlesEnUrl = process.env.PUBLIC_URL + "/assets/sub_hubble_en.vtt"; 
  const subtitlesEsUrl = process.env.PUBLIC_URL + "/assets/sub_hubble_es.vtt"; 

  const [currentVideoUrl, setCurrentVideoUrl] = useState(localVideoUrl);

  return (
    <div className="video-gallery">
      <h2>Video</h2>
      <div className="video-display">
        <div className="video-selected">
          <video controls width="100%">
            <source src={currentVideoUrl} type="video/mp4" />
            <track 
              label="Inglés" 
              kind="subtitles" 
              srcLang="en" 
              src={subtitlesEnUrl} 
              default 
            />
            
            <track 
              label="Español" 
              kind="subtitles" 
              srcLang="es" 
              src={subtitlesEsUrl} 
            />
            Tu navegador no soporta el elemento video.
          </video>
          <h3>Exploración Espacial</h3>
        </div>
      </div>
    </div>
  );
}

export default VideoGallery;
