const nodemailer = require("nodemailer");
require("dotenv").config();

// Configurar el transportador de correo
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === "465",
    auth: {
        user: process.env.TOKEN_USER,
        pass: process.env.TOKEN_PASS,
    },
});

const correoContraseña = async (email, pass) => {
    try {

        const mensajeCorreo = {
            from: `"Soporte Fast Training" <${process.env.TOKEN_USER}>`,
            to: email,
            subject: "Contraseña Temporal Fast Training",
            html: `
            <h2>Contraseña App Fast Training</h2>
            <p>Su cuenta correo ha sido registrado en Fast Training:</p>
            <p style="color: #007bff; font-weight: bold;">${pass}</p>
            <p>Puede cambiar esta contraseña al iniciar sesión en la página web</p>
            `,
        }; 

        // Enviar el correo
        await transporter.sendMail(mensajeCorreo);
        console.log(`Correo de recuperación enviado a: ${email}`);
    } catch (error) {
        console.error("Error enviando el correo:", error);
        throw new Error("Error al enviar el correo de recuperación."); // Lanzar error para ser manejado en el controlador
    }
};

module.exports = { correoContraseña };
/*  
    await mensajeGmail.sendMail({
      from: '"Fast Training" <mariar53804@gmail.com>',
      to: email,
      subject: 'Contraseña temporal de Fast Training',
      text: `Hola, esta es tu contraseña temporal: 
            ${passAleatorea}.`,
    }).then(() => {
      console.log("Correo enviado");
    }).catch((error) => {
      console.error("Error al enviar correo:", error);
    }); */