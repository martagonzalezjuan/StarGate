import React, { useState } from "react";
import CustomVideoPlayer from "./CustomVideoPlayer";
import CameraPermission from "./components/CameraPermission";
import { FaPlus } from "react-icons/fa";
import "./VideoGallery.css";

function VideoGallery({ videos }) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [activeChapter, setActiveChapter] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); // Estado para el archivo seleccionado

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

  const handleUploadVideo = () => {
    setIsModalOpen(true);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file); // Guardar el archivo en el estado
      console.log("Archivo seleccionado:", file.name);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      console.log("Subiendo archivo:", selectedFile.name);
  
      const formData = new FormData();
      formData.append('archivo', selectedFile);
  
      try {
        const response = await fetch('/upload', {
          method: 'POST',
          body: formData,
        });
  
        if (response.ok) {
          const result = await response.text();
          console.log('Archivo subido correctamente:', result);
          setIsModalOpen(false); // Cierra el modal si quieres
          setSelectedFile(null); // Limpia el estado
        } else {
          console.error('Error al subir el archivo:', await response.text());
        }
      } catch (error) {
        console.error('Error de red:', error);
      }
    } else {
      console.log("No se ha seleccionado ningún archivo.");
    }
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
      {isModalOpen && (
        <div
          className="upload-modal-backdrop"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="upload-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="upload-modal-close"
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </button>

            <h2 className="upload-modal-title">Subir video</h2>
            <p className="upload-modal-desc">
              Selecciona un archivo de video desde tu dispositivo
            </p>

            <input
              type="file"
              className="upload-modal-input"
              name="archivo"
              onChange={handleFileChange} // Manejar el archivo seleccionado
            />

            <div className="upload-modal-buttons">
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn-cancel"
              >
                Cancelar
              </button>
              <button onClick={handleUpload} className="btn-upload">
                Subir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoGallery;
