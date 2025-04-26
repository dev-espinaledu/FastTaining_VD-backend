const nodemailer = require("nodemailer");
require("dotenv").config();

// Configurar el transportador de correo
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === "465",
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
        const resetLink = `${process.env.FRONTEND_URL}/auth/restablecer?token=${token}`;

        const mailOptions = {
            from: `"Soporte Fast Training" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Recuperación de contraseña",
            html: `
            <h2>Solicitud de recuperación de contraseña</h2>
            <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
            <a href="${resetLink}" target="_blank">Restablecer contraseña</a>
            <p>Este enlace expirará en 10 minutos.</p>
            `,
        }; 

        // Enviar el correo
        await transporter.sendMail(mailOptions);
        console.log(`Correo de recuperación enviado a: ${email}`);
    } catch (error) {
        console.error("Error enviando el correo:", error);
        throw new Error("Error al enviar el correo de recuperación."); // Lanzar error para ser manejado en el controlador
    }
};

module.exports = { enviarCorreoRecuperacion };