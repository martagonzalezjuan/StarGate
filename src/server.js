const express = require("express");
const app = express();
const port = process.env.PORT || 3000; // Usa el puerto 3000 o el que definas en la variable de entorno PORT

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static("public"));

// Ruta para enviar el archivo index.html (opcional, ya que express.static lo servirá automáticamente)
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
