import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import VideoGallery from './VideoGallery';

function App() {
  const [apodData, setApodData] = useState(null);
  const API_KEY = 'qvTugfpNj9qF2lpjhjW33mcjZclHYKpfRLLHCZgL';

  // Refs para las secciones
  const homeRef = useRef(null);
  const videosRef = useRef(null);
  const galleryRef = useRef(null);
  const aboutRef = useRef(null);

  // Videos disponibles en `assets/`
  const videos = [
    {
      id: 1,
      title: "Exploración Espacial 1",
      resolutions: ["4k", "1080p", "720p"],
      subtitles: ["en", "es"],
      audio: ["en"]
    },
    {
      id: 2,
      title: "Exploración Espacial 2",
      resolutions: ["4k"],
      subtitles: [],
      audio: []
    }
  ];

  // Función para hacer scroll a una sección
  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`)
      .then(response => response.json())
      .then(data => setApodData(data))
      .catch(error => console.error("Error al obtener los datos:", error));
  }, []);

  if (!apodData) return <div>Cargando...</div>;

  return (
    <div className="app">
      <header className="header">
        <h1>StarGate</h1>
        <nav>
          <ul>
            <li onClick={() => scrollToSection(homeRef)}>Home</li>
            <li onClick={() => scrollToSection(videosRef)}>Explora Videos</li>
            <li onClick={() => scrollToSection(galleryRef)}>Gallery</li>
            <li onClick={() => scrollToSection(aboutRef)}>About us</li>
          </ul>
        </nav>
      </header>
      
      {/* Sección Home con APOD */}
      <section ref={homeRef} className="hero">
        <div className="hero-bg">
          <img src={apodData.url} alt={apodData.title} />
        </div>
        <div className="hero-content">
          <h2>{apodData.title}</h2>
          <p>{apodData.explanation}</p>
          <button onClick={() => scrollToSection(videosRef)}>Explora Ahora</button>
        </div>
      </section>

      {/* Sección de Videos */}
      <section ref={videosRef} className="videos-section">
        <VideoGallery videos={videos} />
      </section>

      {/* Sección de Galería (por implementar) */}
      <section ref={galleryRef} className="gallery-section">
        <h2>Gallery</h2>
        <p>Coming soon...</p>
      </section>

      {/* Sección About (por implementar) */}
      <section ref={aboutRef} className="about-section">
        <h2>About Us</h2>
        <p>Coming soon...</p>
      </section>
    </div>
  );
}

export default App;
