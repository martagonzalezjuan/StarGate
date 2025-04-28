import React, { useState } from "react";
import CustomVideoPlayer from "./CustomVideoPlayer";
import CameraPermission from "./components/CameraPermission";
import { FaPlus } from "react-icons/fa";
import "./VideoGallery.css";

function VideoGallery({ videos }) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [activeChapter, setActiveChapter] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [emotion, setEmotion] = useState(""); // Estado para la emoción detectada

  const currentVideo =
    videos && videos.length > 0 ? videos[currentVideoIndex] : null;

  const handleVideoSelect = async (index) => {
    setIsTransitioning(true);

    // Wait for fade out
    await new Promise((resolve) => setTimeout(resolve, 300));

    setCurrentVideoIndex(index);
    setActiveChapter(null);

    // Remove transition class after new video loads
    setTimeout(() => {
      setIsTransitioning(false);
    }, 50);
  };

  const handleChapterChange = (chapter) => {
    setActiveChapter(chapter);
  };

  if (!currentVideo) {
    return <div className="video-gallery">No hay videos disponibles.</div>;
  }

  return (
    <div className="video-gallery">
      <h2>Explore</h2>
      <div className="video-display">
        <div className="content-section">
          <div className="video-slider">
            {videos.map((video, index) => (
              <div
                key={video.id}
                className={`slider-item ${
                  index === currentVideoIndex ? "active" : ""
                }`}
                onClick={() => handleVideoSelect(index)}
              >
                <video
                  muted
                  playsInline
                  preload="metadata"
                  poster={`${process.env.PUBLIC_URL}/assets/video${video.id}/thumbnail.webp`} // Add thumbnails as fallback
                >
                  <source
                    src={`${process.env.PUBLIC_URL}/assets/video${video.id}/video${video.id}_720p.mp4`}
                    type="video/mp4"
                  />
                </video>
                <p>{video.title}</p>
              </div>
            ))}
            <div className="slider-item upload-placeholder">
              <div className="upload-content">
                <FaPlus size={24} />
                <p>Upload Video</p>
              </div>
            </div>
          </div>
          <div className="video-column">
            <div
              className={`video-selected ${isTransitioning ? "fade-out" : ""}`}
            >
              <CustomVideoPlayer
                key={currentVideo.id}
                videoData={currentVideo}
                onChapterChange={handleChapterChange}
                emotion={emotion}
              />
              <h3>{currentVideo.title}</h3>
            </div>
            {activeChapter && (
              <div
                className={`chapter-content ${activeChapter ? "visible" : ""}`}
              >
                <img
                  src={`${process.env.PUBLIC_URL}/assets/video${currentVideo.id}/${activeChapter.image}`}
                  alt={activeChapter.label}
                />
                <p>{activeChapter.text}</p>
              </div>
            )}
          </div>
        </div>
        <div className="camera-section">
          <CameraPermission setEmotion={setEmotion} />
        </div>
      </div>
    </div>
  );
}

export default VideoGallery;
