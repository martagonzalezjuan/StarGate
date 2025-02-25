import React, { useState, useEffect } from 'react';
import './VideoGallery.css';

function VideoGallery() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');


  useEffect(() => {
    // Para buscar videos
    fetch('https://images-api.nasa.gov/search?q=4k&media_type=video')
      .then(response => response.json())
      .then(data => {
        console.log(data); // Para inspeccionar la estructura de los datos
        if (data.collection && data.collection.items) {
          const items = data.collection.items;

          // Fetch asset details for each video to get the correct video URLs
          const fetchVideoDetails = items.map(item => {
            const nasaId = item.data[0].nasa_id;
            return fetch(`https://images-api.nasa.gov/asset/${nasaId}`)
              .then(response => response.json())
              .then(assetData => {
                const videoLinks = assetData.collection.items.filter(assetItem => 
                  assetItem.href.endsWith('.mp4') || 
                  assetItem.href.endsWith('.mov') || 
                  assetItem.href.endsWith('.avi') || 
                  assetItem.href.endsWith('.mkv')
                );
                return {
                  ...item,
                  videoLinks
                };
              });
          });

          Promise.all(fetchVideoDetails).then(validVideos => {
            const filteredVideos = validVideos.filter(video => video.videoLinks.length > 0);
            setVideos(filteredVideos);
            if (filteredVideos.length > 0) {
              setSelectedVideo(filteredVideos[0]);
              // Set the initial video URL here
              setCurrentVideoUrl(filteredVideos[0].videoLinks[0].href);
            }
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      })
      .catch(error => {
        console.error("Error al obtener los videos:", error);
        setLoading(false);
      });
  }, []);

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
    if (video?.videoLinks?.[0]?.href) {
      setCurrentVideoUrl(video.videoLinks[0].href);
    }
  };

  useEffect(() => {
    console.log("Selected video updated:", selectedVideo);
  }, [selectedVideo]);

  if (loading) {
    return <div>Cargando videos...</div>;
  }

  if (videos.length === 0) {
    return <div>No se encontraron videos en 4K reproducibles.</div>;
  }

  // Datos del video seleccionado
  const selectedData = selectedVideo?.data[0];
  const selectedVideoLink = selectedVideo?.videoLinks[0]?.href || '';

  return (
    <div className="video-gallery">
      <h2>Videos</h2>
      <div className="video-display">
        <div className="video-selected">
          {currentVideoUrl ? (
            <video controls width="100%" key={currentVideoUrl}>
              <source src={currentVideoUrl} type="video/mp4" />
              Tu navegador no soporta el elemento video.
            </video>
          ) : (
            <p>No se encontró el video seleccionado.</p>
          )}
          {selectedData && <h3>{selectedData.title}</h3>}
        </div>
      </div>
      <div className="video-slider">
        {videos.map((video, index) => {
          const data = video.data[0];
          const videoLink = video.videoLinks[0]?.href || '';
          return (
            <div
              key={index}
              className={`slider-item ${selectedVideo === video ? 'active' : ''}`}
              onClick={() => handleVideoSelect(video)}
            >
              {videoLink ? (
                <video muted>
                  <source src={videoLink} type="video/mp4" />
                  Tu navegador no soporta el elemento video.
                </video>
              ) : (
                <p>No video</p>
              )}
              <p>{data.title}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VideoGallery;
