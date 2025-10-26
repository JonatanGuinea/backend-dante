import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

// Endpoint para confirmar asistencia
app.post("/api/confirmar", async (req, res) => {
  const { nombre, cantidad } = req.body;

  if (!nombre || !cantidad) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  try {
    // Enviar email con Resend
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: [process.env.EMAIL_TO,"valentinavena@gmail.com"]
      subject: "Nueva confirmación de asistencia 🎂",
      html: `
        <h2>🎉 Nueva Confirmación</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Cantidad:</strong> ${cantidad}</p>
        <p><small>${new Date().toLocaleString()}</small></p>
      `,
    });

    console.log("✅ Email enviado correctamente a:", process.env.EMAIL_TO);
    res.json({ message: "Correo enviado 🎉" });

  } catch (error) {
    console.error("❌ Error al enviar email:", error);
    res.status(500).json({ message: "Error al enviar email" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Servidor funcionando en puerto ${PORT}`));

