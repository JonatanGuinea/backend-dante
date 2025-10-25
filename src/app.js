import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import nodemailer from "nodemailer";
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

  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  data.push(nuevaConfirmacion);
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

  // ✉️ Enviar email al organizador
  try {
    await transporter.sendMail({
      from: `"Confirmaciones 🎉" <${process.env.EMAIL_USER}>`,
      to: process.env.DEST_EMAIL, // a dónde querés que llegue el aviso
      subject: "Nueva confirmación de asistencia",
      text: `${nombre} confirmó ${cantidad} persona(s).`,
      html: `<h2>Nueva confirmación 🎉</h2>
             <p><strong>Nombre:</strong> ${nombre}</p>
             <p><strong>Cantidad:</strong> ${cantidad}</p>
             <p><em>${new Date().toLocaleString()}</em></p>`,
    });

    console.log("📧 Email enviado correctamente");
  } catch (error) {
    console.error("❌ Error al enviar el email:", error);
  }

  res.json({ message: "Confirmación guardada correctamente 🎉" });
});

// 📋 GET: obtener confirmaciones
app.get("/api/confirmaciones", (req, res) => {
  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  res.json(data);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Servidor activo en puerto ${PORT}`));
