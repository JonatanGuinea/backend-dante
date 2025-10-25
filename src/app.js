import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import "dotenv/config";
import nodemailer from "nodemailer";

dotenv.config();
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

// ✉️ Configurar transporte de correo (usa tus credenciales)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // tu email
    pass: process.env.EMAIL_PASS, // contraseña o App Password
  },
});

// 📩 POST: guardar confirmación
app.post("/api/confirmar", async (req, res) => {
  const { nombre, cantidad } = req.body;

  if (!nombre || !cantidad) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  const nuevaConfirmacion = {
    id: Date.now(),
    nombre,
    cantidad,
    fecha: new Date().toISOString(),
  };

  // Guardar en JSON
  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  data.push(nuevaConfirmacion);
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

  // ✅ RESPONDE rápido al usuario
  res.json({ message: "Confirmación guardada correctamente 🎉" });

  // ✉️ Enviar correo en segundo plano
  (async () => {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Confirmaciones 🎉" <${process.env.EMAIL_USER}>`,
        to: process.env.DEST_EMAIL,
        subject: "Nueva confirmación de asistencia 🎂",
        html: `
          <div style="font-family:sans-serif; background:#f7f7f7; padding:20px; border-radius:10px;">
            <h2 style="color:#2E7D32;">Nueva confirmación 🎉</h2>
            <p><b>Nombre:</b> ${nombre}</p>
            <p><b>Cantidad:</b> ${cantidad}</p>
            <p><i>${new Date().toLocaleString()}</i></p>
          </div>
        `,
      });

      console.log(`📧 Email enviado: ${nombre} (${cantidad} personas)`);
    } catch (error) {
      console.error("❌ Error al enviar el email:", error);
    }
  })();
});



// 📋 GET: obtener confirmaciones
app.get("/api/confirmaciones", (req, res) => {
  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  res.json(data);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Servidor activo en puerto ${PORT}`));
