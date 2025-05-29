// src/VideoGallery.js
import React, { useState } from "react";
import CustomVideoPlayer from "./CustomVideoPlayer";
import CameraPermission from "./components/CameraPermission";
import { FaPlus } from "react-icons/fa";
import "./VideoGallery.css";

function VideoGallery({ videos }) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [activeChapter, setActiveChapter] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [emotion, setEmotion] = useState(""); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const currentVideo =
    videos && videos.length > 0 ? videos[currentVideoIndex] : null;

  const handleVideoSelect = async (index) => {
    setIsTransitioning(true);
    await new Promise((r) => setTimeout(r, 300));
    setCurrentVideoIndex(index);
    setActiveChapter(null);
    setTimeout(() => setIsTransitioning(false), 50);
  };

  const handleChapterChange = (chapter) => {
    setActiveChapter(chapter);
  };

  const handleUploadVideo = () => setIsModalOpen(true);
  const handleFileChange = (e) => setSelectedFile(e.target.files[0] || null);
  const handleUpload = async () => {
    if (!selectedFile) return console.log("No hay archivo para subir");
    const formData = new FormData();
    formData.append("archivo", selectedFile);
    try {
      const res = await fetch("/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error(await res.text());
      console.log("Subido:", await res.text());
      setIsModalOpen(false);
      setSelectedFile(null);
    } catch (err) {
      console.error("Error upload:", err);
    }
  };

  if (!currentVideo) {
    return <div className="video-gallery">No hay videos disponibles</div>;
  }

  return (
    <div className="video-gallery">
      <h2>Explore</h2>
      <div className="video-display">
        <div className="content-section">
          {/* SLIDER DE MINIATURAS */}
          <div className="video-slider">
            {videos.map((video, idx) => (
              <div
                key={video.id}
                className={`slider-item ${idx === currentVideoIndex ? "active" : ""}`}
                onClick={() => handleVideoSelect(idx)}
              >
                <img
                  src={`${process.env.PUBLIC_URL}/assets/video${video.id}/thumbnail.webp`}
                  alt={video.title}
                />
                <p>{video.title}</p>
              </div>
            ))}
            <div
              className="slider-item upload-placeholder"
              onClick={handleUploadVideo}
            >
              <div className="upload-content">
                <FaPlus size={24} />
                <p>Upload Video</p>
              </div>
            </div>
          </div>

          {/* PANEL PRINCIPAL */}
          <div className="video-column">
            <div className={`video-selected ${isTransitioning ? "fade-out" : ""}`}>
              <CustomVideoPlayer
                key={currentVideo.id}
                videoData={currentVideo}           
                onChapterChange={handleChapterChange}
                emotion={emotion}
              />
              <h3>{currentVideo.title}</h3>
            </div>

            {/* CONTENIDO DEL CAPÍTULO ACTIVO */}
            {activeChapter && (
              <div className={`chapter-content visible`}>
                <img
                  src={`${process.env.PUBLIC_URL}/assets/video${currentVideo.id}/${activeChapter.image}`}
                  alt={activeChapter.label}
                />
                <p>{activeChapter.text}</p>
              </div>
            )}
          </div>
        </div>

        {/* SECCIÓN CÁMARA/EMOCIÓN */}
        <div className="camera-section">
          <CameraPermission setEmotion={setEmotion} />
        </div>
      </div>

      {/* MODAL DE SUBIDA */}
      {isModalOpen && (
        <div className="upload-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
            <button className="upload-modal-close" onClick={() => setIsModalOpen(false)}>
              &times;
            </button>
            <h2>Upload video</h2>
            <input type="file" onChange={handleFileChange} />
            <div className="upload-modal-buttons">
              <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button className="btn-upload" onClick={handleUpload}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoGallery;