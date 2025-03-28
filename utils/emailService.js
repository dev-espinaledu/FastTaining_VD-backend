const nodemailer = require("nodemailer");
require("dotenv").config();

// Configurar el transportador de correo
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true para 465, false para otros puertos
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Enviar correo de recuperación de contraseña
 * @param {string} email - Correo del usuario
 * @param {string} token - Token de recuperación
 */
const enviarCorreoRecuperacion = async (email, token) => {
    try {
    const resetLink = `http://localhost:3000/restablecer-contrasena?token=${token}`;

    const mailOptions = {
        from: `"Soporte Fast Training" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Recuperación de contraseña",
        html: `
        <h2>Solicitud de recuperación de contraseña</h2>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${resetLink}" target="_blank">Restablecer contraseña</a>
        <p>Este enlace expirará en 1 hora.</p>
        `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Correo de recuperación enviado a: ${email}`);
    } catch (error) {
        console.error("Error enviando el correo:", error);
    }
};

module.exports = { enviarCorreoRecuperacion };
