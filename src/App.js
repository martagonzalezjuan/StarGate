import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import VideoGallery from './VideoGallery';

function App() {
  const [apodData, setApodData] = useState(null);
  const API_KEY = 'qvTugfpNj9qF2lpjhjW33mcjZclHYKpfRLLHCZgL';

  // Add refs for each section
  const homeRef = useRef(null);
  const videosRef = useRef(null);
  const galleryRef = useRef(null);
  const aboutRef = useRef(null);

  // Scroll handler function
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
      
      {/* Home section with APOD */}
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

      {/* Videos section */}
      <section ref={videosRef} className="videos-section">
        <VideoGallery />
      </section>

      {/* Gallery section (to be implemented) */}
      <section ref={galleryRef} className="gallery-section">
        <h2>Gallery</h2>
        <p>Coming soon...</p>
      </section>

      {/* About section (to be implemented) */}
      <section ref={aboutRef} className="about-section">
        <h2>About Us</h2>
        <p>Coming soon...</p>
      </section>
    </div>
  );
}

export default App;
