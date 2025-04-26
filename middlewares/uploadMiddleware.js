const multer = require('multer');
const { cloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');

// Configuración de multer para manejar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (validTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes JPEG, PNG o WEBP'), false);
    }
  }
});

// Función mejorada para subir a Cloudinary
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'user-profiles',
        ...options
      }, 
      (error, result) => {
        if (result) {
          console.log('Subida a Cloudinary exitosa:', result);
          resolve(result);
        } else {
          console.error('Error al subir a Cloudinary:', error);
          reject(error);
        }
      }
    );
    
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Middleware para manejar errores de subida
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message,
      code: 'UPLOAD_ERROR'
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
      code: 'IMAGE_UPLOAD_ERROR'
    });
  }
  next();
};

module.exports = {
  singleUpload: upload.single('foto_perfil'),
  uploadToCloudinary,
  handleUploadErrors
};