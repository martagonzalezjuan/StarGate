import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import VideoGallery from "./VideoGallery";
import Logo from "./logo.png"; // Asegúrate de que el archivo esté en la ruta correcta

function App() {
  const [apodData, setApodData] = useState(null);
  const API_KEY = process.env.REACT_APP_NASA_API_KEY;

  // Refs para las secciones
  const homeRef = useRef(null);
  const videosRef = useRef(null);

  // Videos disponibles en `assets/` con capítulos personalizados
  const videos = [
    {
      id: 1,
      title: "The Extraordinay Things Hubble Has Seen ",
      resolutions: ["4k", "1080p", "720p", "480p", "360p"],
      subtitles: ["en", "es", "fr"],
      audio: ["en"],
      chapters: [],
    },
    {
      id: 2,
      title: "Mars: The Red Planet",
      resolutions: ["4k", "1080p", "720p", "480p", "360p"],
      subtitles: ["en", "es", "fr"],
      audio: ["en"],
      chapters: [],
    },
    {
      id: 3,
      title: "Jupiter: The Gas Giant",
      resolutions: ["4k", "1080p", "720p", "480p", "360p"],
      subtitles: ["en", "es", "fr"],
      audio: ["en"],
      chapters: [],
    },
  ];

  // Función para hacer scroll a una sección
  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`)
      .then((response) => response.json())
      .then((data) => setApodData(data))
      .catch((error) => console.error("Error al obtener los datos:", error));
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
      <main className="main-content">
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
      </main>
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} StarGate. No rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
