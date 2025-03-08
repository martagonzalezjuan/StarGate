// VideoGallery.js
import React, { useState } from 'react';
import CustomVideoPlayer from './CustomVideoPlayer';
import './VideoGallery.css';

function VideoGallery({ videos }) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const currentVideo = videos && videos.length > 0 ? videos[currentVideoIndex] : null;

  const handleVideoSelect = (index) => {
    if (index !== currentVideoIndex) {
      setCurrentVideoIndex(index);
    }
  };

  if (!currentVideo) {
    return <div className="video-gallery">No hay videos disponibles.</div>;
  }

  return (
    <div className="video-gallery">
      <h2>Explore</h2>
      <div className="video-display">
        <div className="video-selected">
          <CustomVideoPlayer key={currentVideo.id} videoData={currentVideo} />
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
