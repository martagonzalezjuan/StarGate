const express = require('express');
const path = require('path');
const multer = require('multer'); // <-- AÑADIDO
const app = express();

// Configuración de multer para recibir archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'build', 'assets', 'uploads')); // Carpeta 'uploads' al lado de 'build'
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// ----> AQUÍ AÑADES TU ENDPOINT
app.post('/upload', upload.single('archivo'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No se subió ningún archivo.');
  }
  res.send('Archivo subido exitosamente: ' + req.file.filename);
});

// ----> Después todo sigue igual que antes
app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
