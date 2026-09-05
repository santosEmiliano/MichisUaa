const { validationResult } = require('express-validator');

// express-validator incluye el valor recibido en cada error; en estos campos no debe devolverse.
const CAMPOS_SENSIBLES = ['password', 'token', 'pushToken'];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errores = errors.array().map((error) => {
            if (!CAMPOS_SENSIBLES.includes(error.path)) return error;
            const { value, ...resto } = error;
            return resto;
        });
        return res.status(400).json({
            mensaje: "Datos de entrada inválidos",
            errores
        });
    }
    next();
};

module.exports = validate;
