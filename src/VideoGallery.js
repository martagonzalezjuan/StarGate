import React, { useState } from 'react';
import './VideoGallery.css';

function VideoGallery() {
  // En lugar de usar la API, cargamos el video local
  const localVideoUrl = process.env.PUBLIC_URL + "/video_nasa_raw.mp4"; 

  const [currentVideoUrl, setCurrentVideoUrl] = useState(localVideoUrl);

  return (
    <div className="video-gallery">
      <h2>Video Local</h2>
      <div className="video-display">
        <div className="video-selected">
          <video controls width="100%">
            <source src={currentVideoUrl} type="video/mp4" />
            Tu navegador no soporta el elemento video.
          </video>
          <h3>Exploración Espacial</h3>
        </div>
      </div>
    </div>
  );
}

export default VideoGallery;
