const { body, param } = require('express-validator');
const { stripHtml } = require('../utils/sanitize');

const sightingValidator = [
    body('descripcion')
        .optional()
        .trim()
        .isLength({ max: 400 }).withMessage('La descripción no puede exceder 400 caracteres')
        .customSanitizer(stripHtml),
    body('longitud')
        .notEmpty().withMessage('La longitud es requerida')
        .isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida')
        .toFloat(),
    body('latitud')
        .notEmpty().withMessage('La latitud es requerida')
        .isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida')
        .toFloat(),
    body('animalId')
        .optional({ checkFalsy: true })
        .isInt().withMessage('ID de animal inválido').toInt()
];

const verifySightingValidator = [
    param('id').isInt().withMessage('ID de avistamiento inválido').toInt(),
    body('animalId')
        .notEmpty().withMessage('ID de animal es requerido para verificar')
        .isInt().withMessage('ID de animal debe ser un entero').toInt()
];

const paramIdValidator = [
    param('id').isInt().withMessage('ID inválido').toInt()
];

module.exports = {
    sightingValidator,
    verifySightingValidator,
    paramIdValidator
};
