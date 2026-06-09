const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            mensaje: "Datos de entrada inválidos", 
            errores: errors.array() 
        });
    }
    next();
};

module.exports = validate;
