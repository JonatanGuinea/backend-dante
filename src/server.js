import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🗂 Ruta del archivo donde se guardan las confirmaciones
const dataPath = path.resolve("confirmaciones.json");

// 📨 Configuración del envío de emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 📄 Endpoint para obtener confirmaciones
app.get("/api/confirmaciones", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    res.json(data);
  } catch (error) {
    console.error("Error al leer confirmaciones:", error);
    res.status(500).json({ message: "Error al leer confirmaciones" });
  }
});

// ✍️ Endpoint para confirmar asistencia
app.post("/api/confirmar", async (req, res) => {
  const { nombre, cantidad } = req.body;

  if (!nombre || !cantidad) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  try {
    // Leer archivo existente
    const data = fs.existsSync(dataPath)
      ? JSON.parse(fs.readFileSync(dataPath, "utf-8"))
      : [];

    // Crear nueva confirmación
    const nuevaConfirmacion = {
      id: Date.now(),
      nombre,
      cantidad,
      fecha: new Date().toISOString(),
    };

    // Guardar en el archivo JSON
    data.push(nuevaConfirmacion);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

    // ✉️ Enviar correo al organizador (vos)
    await transporter.sendMail({
      from: `"Cumple de Dante 🎉" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "Nueva confirmación de asistencia 🎂",
      html: `
        <h2>🎈 Nueva Confirmación</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Cantidad:</strong> ${cantidad}</p>
        <p><small>Fecha: ${new Date().toLocaleString()}</small></p>
      `,
    });

    console.log("✅ Email enviado correctamente a:", process.env.EMAIL_USER);
    res.json({ message: "Confirmación guardada y correo enviado 🎉" });

  } catch (error) {
    console.error("❌ Error al procesar confirmación:", error);
    res.status(500).json({ message: "Error al guardar o enviar email" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Servidor funcionando en puerto ${PORT}`));
