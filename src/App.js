import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import VideoGallery from "./VideoGallery";
import Logo from "./logo.png";

function App() {
  const [apodData, setApodData] = useState(null);
  const API_KEY = process.env.REACT_APP_NASA_API_KEY;

  const homeRef = useRef(null);
  const videosRef = useRef(null);

  // Lista estática incluyendo el stream Theta
  const staticVideos = [
    {
      id: 1,
      title: "The Extraordinary Things Hubble Has Seen",
      // DASH local
      resolutions: ["4k", "1080p"],
      subtitles: ["en", "es"],
      audio: ["en"],
      chapters: [],
    },
    {
      id: 2,
      title: "Mars: The Red Planet",
      resolutions: ["4k", "1080p"],
      subtitles: ["en", "es"],
      audio: ["en"],
      chapters: [],
    },
    {
      id: 3,
      title: "Jupiter: The Gas Giant",
      resolutions: ["4k", "1080p"],
      subtitles: ["en", "es"],
      audio: ["en"],
      chapters: [],
    },
    // Y en App.js:
{
  id: 4,
  title: "Theta Stream Example",
  thetaId: "video_2yrjx95793zgf4sjdtnycf9b1t"
}
  ];

  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetch("/videos")
      .then((res) => res.json())
      .then((userVideos) => setVideos([...staticVideos, ...userVideos]))
      .catch((err) => console.error("Error cargando videos:", err));
  }, []);

  useEffect(() => {
    fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`)
      .then((res) => res.json())
      .then((data) => setApodData(data))
      .catch((err) => console.error("Error APOD:", err));
  }, [API_KEY]);

  if (!apodData) return <div>Cargando...</div>;

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="app">
      <header className="header">
        <div className="header-logo">
          <img src={Logo} alt="StarGate Logo" />
          <h1>StarGate</h1>
        </div>
        <nav>
          <ul>
            <li onClick={() => scrollTo(homeRef)}>Home</li>
            <li onClick={() => scrollTo(videosRef)}>Explore</li>
          </ul>
        </nav>
      </header>

      <main className="main-content">
        <section ref={homeRef} className="hero">
          <div className="hero-bg">
            <img src={apodData.url} alt={apodData.title} />
          </div>
          <div className="hero-content">
            <h2>{apodData.title}</h2>
            <p>{apodData.explanation}</p>
          </div>
        </section>

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