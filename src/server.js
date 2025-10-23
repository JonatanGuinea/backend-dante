import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// 📁 Archivo donde se guardan las confirmaciones
const dataPath = path.join(__dirname, "./confirmaciones.json");

// Si no existe, lo creamos vacío
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, "[]", "utf-8");
}

// 📩 POST: guardar confirmación
app.post("/api/confirmar", (req, res) => {
  const { nombre, cantidad } = req.body;

  if (!nombre || !cantidad) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  const nuevaConfirmacion = {
    id: Date.now(),
    nombre,
    cantidad,
    fecha: new Date().toISOString()
  };

  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  data.push(nuevaConfirmacion);
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

  res.json({ message: "Confirmación guardada correctamente 🎉" });
});

// import { db } from "./src/config/db.js";

// app.post("/api/confirmar", async (req, res) => {
//   const { nombre, cantidad } = req.body;

//   if (!nombre || !cantidad) {
//     return res.status(400).json({ message: "Faltan datos" });
//   }

//   try {
//     await db.query("INSERT INTO confirmaciones (nombre, cantidad) VALUES (?, ?)", [nombre, cantidad]);
//     res.status(201).json({ message: "Confirmación guardada correctamente" });
//   } catch (error) {
//     console.error("Error al guardar:", error);
//     res.status(500).json({ message: "Error interno del servidor" });
//   }
// });

// app.get("/api/confirmaciones", async (req, res) => {
//   const [rows] = await db.query("SELECT * FROM confirmaciones ORDER BY fecha DESC");
//   res.json(rows);
// });




app.get("/api/confirmaciones", (req, res) => {
  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  res.json(data);
});

// 🚀 Servir el frontend compilado
const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

// Cualquier otra ruta → React
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Servidor activo en puerto ${PORT}`));

// app.listen(process.env.PORT, () => {
//   console.log(`Servidor corriendo en puerto ${process.env.PORT}`);
// });
