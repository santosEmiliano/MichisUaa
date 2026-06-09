const { body, param } = require('express-validator');
const { stripHtml } = require('../utils/sanitize');

const coloniaValidator = [
    body('nombre')
        .trim()
        .notEmpty().withMessage('El nombre es requerido')
        .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres')
        .customSanitizer(stripHtml),
    body('descripcion')
        .trim()
        .notEmpty().withMessage('La descripción es requerida')
        .isLength({ max: 400 }).withMessage('La descripción no puede exceder 400 caracteres')
        .customSanitizer(stripHtml),
    body('zona')
        .trim()
        .notEmpty().withMessage('La zona es requerida')
        .isLength({ max: 150 }).withMessage('La zona no puede exceder 150 caracteres')
        .customSanitizer(stripHtml)
];

const updateColoniaValidator = [
    param('id').isInt().withMessage('ID de colonia inválido').toInt(),
    ...coloniaValidator.map(validation => validation.optional())
];

const deleteColoniaValidator = [
    param('id').isInt().withMessage('ID de colonia inválido').toInt()
];

module.exports = {
    coloniaValidator,
    updateColoniaValidator,
    deleteColoniaValidator
};
