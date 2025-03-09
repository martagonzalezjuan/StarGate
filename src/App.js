import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import VideoGallery from './VideoGallery';
import Logo from './logo.png'; // Asegúrate de que el archivo esté en la ruta correcta

function App() {
  const [apodData, setApodData] = useState(null);
  const API_KEY = 'qvTugfpNj9qF2lpjhjW33mcjZclHYKpfRLLHCZgL';

  // Refs para las secciones
  const homeRef = useRef(null);
  const videosRef = useRef(null);

  // Videos disponibles en `assets/`
  const videos = [
    {
      id: 1,
      title: "Hubble",
      resolutions: ["4k", "1080p", "720p"],
      subtitles: ["en", "es"],
      audio: ["en"]
    },
    {
      id: 2,
      title: "Marte",
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
        <div className="header-logo">
          <img src={Logo} alt="StarGate Logo" />
          <h1>StarGate</h1>
        </div>
        <nav>
          <ul>
            <li onClick={() => scrollToSection(homeRef)}>Home</li>
            <li onClick={() => scrollToSection(videosRef)}>Explore</li>
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
        </div>
      </section>

      {/* Sección de Videos */}
      <section ref={videosRef} className="videos-section">
        <VideoGallery videos={videos} />
      </section>
      
      {/* Footer integrado */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} StarGate. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
