const cloudinary = require('cloudinary').v2;

// Verifica que las variables de entorno estén cargadas
if (!process.env.CLOUDINARY_CLOUD_NAME || 
    !process.env.CLOUDINARY_API_KEY || 
    !process.env.CLOUDINARY_API_SECRET) {
  throw new Error('Faltan variables de configuración para Cloudinary');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Función mejorada para eliminar imágenes
const deleteImage = async (url) => {
  try {
    const publicId = extractPublicId(url);
    if (!publicId) return;
    
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true
    });
    return result;
  } catch (error) {
    console.error('Error al eliminar imagen de Cloudinary:', error);
    throw error;
  }
};

// Función mejorada para extraer public_id
const extractPublicId = (url) => {
  if (!url) return null;
  
  try {
    const matches = url.match(/\/upload\/.*\/([^/]+)\./);
    return matches ? matches[1] : null;
  } catch (error) {
    console.error('Error al extraer public_id:', error);
    return null;
  }
};

module.exports = {
  cloudinary,
  deleteImage,
  extractPublicId
};