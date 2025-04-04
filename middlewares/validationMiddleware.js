// middlewares/validationMiddleware.js
const validateProfileData = (req, res, next) => {
    const { nombre, apellido, telefono, fecha_nacimiento } = req.body;
    
    // Validar campos obligatorios
    if (!nombre || !apellido) {
        return res.status(400).json({ 
            success: false,
            message: "Nombre y apellido son obligatorios",
            code: "MISSING_REQUIRED_FIELDS"
        });
    }

    // Validar teléfono
    if (telefono && !/^[0-9]{10,15}$/.test(telefono)) {
        return res.status(400).json({ 
            success: false,
            message: "Formato de teléfono inválido (10-15 dígitos)",
            code: "INVALID_PHONE_FORMAT"
        });
    }

    // Validar fecha de nacimiento si es jugador
    if (fecha_nacimiento) {
        const fechaNac = new Date(fecha_nacimiento);
        const hoy = new Date();
        
        if (fechaNac >= hoy) {
            return res.status(400).json({ 
                success: false,
                message: "La fecha de nacimiento no puede ser futura",
                code: "INVALID_BIRTH_DATE"
            });
        }
        
        const edadMinima = new Date();
        edadMinima.setFullYear(edadMinima.getFullYear() - 12);
        
        if (fechaNac > edadMinima) {
            return res.status(400).json({ 
                success: false,
                message: "Debes tener al menos 12 años",
                code: "MINIMUM_AGE_REQUIRED"
            });
        }
    }

    next();
};

const validateImage = (req, res, next) => {
    if (!req.file) return next();
    
    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
            success: false,
            message: "Formato de imagen no válido. Usa JPG, PNG o WEBP.",
            code: "INVALID_IMAGE_FORMAT"
        });
    }

    // Validar tamaño (ej. 5MB máximo)
    if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
            success: false,
            message: "La imagen debe ser menor a 5MB",
            code: "IMAGE_TOO_LARGE"
        });
    }

    next();
};

module.exports = { validateProfileData, validateImage };