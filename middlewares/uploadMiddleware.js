const multer = require('multer');
const { cloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');

// Configuración de Multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Función para subir a Cloudinary
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        ...options
      }, 
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Middleware para subida única de archivos
const singleUpload = upload.single('foto_perfil');

// Middleware para manejar errores de subida
const handleUploadErrors = (err, req, res, next) => {
  if (err) {
    // Manejo de errores...
  }
  next();
};

module.exports = {
  singleUpload,
  uploadToCloudinary,
  handleUploadErrors
};