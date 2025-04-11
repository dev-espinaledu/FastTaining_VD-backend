const { Usuario, Persona, sequelize } = require("../models");
const bcrypt = require("bcryptjs");
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const {correoContraseña}=require('../utils/EmailPasword')

dotenv.config();

function generarPasswordAzar(){
  //Lista de caracteres que van dentro de la contraseña
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*_+';
  
  //Variable en la que se almacenará la contraseña
  let password = '';
  const longitud= 11;

  for (let i = 0; i < longitud; i++) {
    password += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return password;
}



//-------------------------------------------------------------------------------------------
const CrearUsuario = async (req,res)=>{
  const {email, rol}= req.body;
  const t = await sequelize.transaction(); 

  try{

    if (!email || !rol) {
      return res.status(400).json({ error: "Datos incompletos" });
    }
    //Verifica que el usuario no existe 
    const exist = await Usuario.findOne({where:{email}});
    if (exist){
      return res.status(400).json({ error: "El correo ya está registrado" })
    }

    //Rol id
    const roles = {
      administrador: 1,
      entrenador: 2,
      jugador: 3,
    };
    
    const rol_id = roles[rol.toLowerCase()];
    if (!rol_id) {
      return res.status(400).json({ error: "Rol inválido" });
    }

    //Crear la contraseña del usuario al azar
    const passAleatorea = generarPasswordAzar(); // Contraseña aleatorea creada por la función anterior
    const hashedPassword = await bcrypt.hash(passAleatorea, 10);

    //Enviar correo

    //Crear el id de persona
    const persona = await Persona.create(
      { nombre: null, apellido:null, telefono: null  },
      { transaction: t }
    );
    //Crear el usuario 
    const usuario = await Usuario.create(
      {
        email,
        password:hashedPassword,
        persona_id: persona.id,
        rol_id, // Rol asignador
      },
      { transaction: t }
    );

    let data ={}
    //Crear jugador o entrenador
    if(rol_id ==2){
      const entrenador = await Entrenador.create(
        {usuario_id: usuario.id},
        { transaction: t }
      );
      data ={entrenador};
    }else if(rol_id ==3){
      const jugador = await Jugador.create(
        {usuario_id: usuario.id},
        { transaction: t }
      );
      data ={jugador};
    }

    // Confirmar transacción
    console.log("Usuario creado correctamente");

    await correoContraseña(email, passAleatorea);

    res.json({
      success: true,
      message: "Correo de recuperación enviado",
    });
    await t.commit();


  }catch(e){
    await t.rollback(); 
    console.log("Error en CrearUsuario", e)
    return res.status(500).json({mjs:`Error desde el método CrearUsuario ${e}`})
  }
}

//-------------------------------------------------------------------------------------------

const VerUsuarios= async(req, res) =>{
  try{
    const usuarios = await Usuario.findAll({});
    res.json(usuarios);
  }catch(e){
    console.log(`Error desde el método VerUsuarios ${e}`)
    res.status(500).json({error:`Error desde el médoto VerUsuarios, ${e}`})
  }
}


//-------------------------------------------------------------------------------------------

module.exports= {CrearUsuario, VerUsuarios};

/* 
# Crear contenido del archivo de texto con los 10 comandos más importantes y 10 comandos raros pero útiles de Git

contenido_txt = """

# Guardar el archivo
file_path = "/mnt/data/comandos_git_utiles.txt"
with open(file_path, "w") as f:
    f.write(contenido_txt)

file_path */