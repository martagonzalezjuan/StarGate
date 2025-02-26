const express = require('express');
const path = require('path');
const app = express();

// Servir archivos estáticos de la carpeta build
app.use(express.static(path.join(__dirname, 'build')));

// Redirigir todas las rutas al index.html (útil para aplicaciones de una sola página)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
