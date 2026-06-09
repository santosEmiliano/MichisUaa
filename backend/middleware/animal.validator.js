const { body, param } = require('express-validator');

const animalValidator = [
    body('nombre')
        .trim()
        .notEmpty().withMessage('El nombre es requerido')
        .isLength({ max: 80 }).withMessage('El nombre no puede exceder 80 caracteres')
        .escape(),
    body('sexo')
        .optional()
        .trim()
        .isIn(['Macho', 'Hembra']).withMessage('El sexo debe ser Macho o Hembra')
        .escape(),
    body('esterilizado')
        .optional()
        .isBoolean().withMessage('Esterilizado debe ser booleano')
        .toBoolean(),
    body('estado')
        .optional()
        .trim()
        .isIn(['Desaparecido', 'Registrado', 'NoRegistrado']).withMessage('Estado inválido')
        .escape(),
    body('descripcion')
        .optional()
        .trim()
        .isLength({ max: 400 }).withMessage('La descripción no puede exceder 400 caracteres')
        .escape(),
    body('fecha_nac')
        .optional({ checkFalsy: true })
        .isISO8601().withMessage('Formato de fecha de nacimiento inválido'),
    body('fecha_esterilizacion')
        .optional({ checkFalsy: true })
        .isISO8601().withMessage('Formato de fecha inválido'),
    body('fecha_desaparicion')
        .optional({ checkFalsy: true })
        .isISO8601().withMessage('Formato de fecha inválido'),
    body('Colonia_idColonia')
        .notEmpty().withMessage('ID de colonia requerido')
        .isInt().withMessage('ID de colonia debe ser entero').toInt()
];

const updateAnimalValidator = [
    param('id').isInt().withMessage('ID de animal inválido').toInt(),
    ...animalValidator.map(validation => validation.optional())
];

const deleteAnimalValidator = [
    param('id').isInt().withMessage('ID de animal inválido').toInt()
];

module.exports = {
    animalValidator,
    updateAnimalValidator,
    deleteAnimalValidator
};
