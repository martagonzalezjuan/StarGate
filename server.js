const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const app = express();

const getNextVideoFolder = () => {
  const assetsPath = path.join(__dirname, 'build', 'assets');
  if (!fs.existsSync(assetsPath)) fs.mkdirSync(assetsPath, { recursive: true });

  const folders = fs.readdirSync(assetsPath).filter(name => /^video\d+$/.test(name));
  const numbers = folders.map(name => parseInt(name.replace('video', ''))).sort((a, b) => a - b);
  const nextNumber = numbers.length > 0 ? numbers[numbers.length - 1] + 1 : 1;

  const newFolder = path.join(assetsPath, `video${nextNumber}`);
  fs.mkdirSync(newFolder);
  return newFolder;
};
//añadido 
const videoRoot = path.join(__dirname, 'build', 'assets');
app.get('/videos', (req, res) => {
  const folders = fs.readdirSync(videoRoot).filter(name => /^video\d+$/.test(name));
  const dynamicVideos = folders
    .map(name => {
      const id = parseInt(name.replace('video', ''));
      if (id <= 3) return null; // Ignora los vídeos estáticos
      return {
        id,
        title: `User Video ${id}`,
        resolutions: ["720p"],
        subtitles: [],
        audio: ["en"],
        chapters: [],
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.id - b.id);

  res.json(dynamicVideos);
});

// Configuración dinámica de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = getNextVideoFolder();
    req.uploadPath = uploadPath; // Guardamos para usar luego
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Extraemos el número de carpeta del path
    const match = req.uploadPath.match(/video(\d+)$/);
    const videoId = match ? match[1] : 'X';
    cb(null, `video${videoId}_720p.mp4`);
  }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('archivo'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No se subió ningún archivo.');
  }
  res.send('Archivo subido exitosamente en: ' + req.file.path);
});

app.use(express.static(path.join(__dirname, 'build'))); //, 'public' o 'build' dependiendo de tu estructura

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
