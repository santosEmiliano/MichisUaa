const { body, param } = require('express-validator');
const { stripHtml } = require('../utils/sanitize');

const registerValidator = [
    body('nombre')
        .trim()
        .notEmpty().withMessage('El nombre es requerido')
        .isLength({ max: 90 }).withMessage('El nombre no puede exceder 90 caracteres')
        .customSanitizer(stripHtml),
    body('email')
        .trim()
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('Formato de email inválido')
        .custom(value => {
            if (!value.endsWith('@edu.uaa.mx')) {
                throw new Error('El correo debe ser institucional (@edu.uaa.mx)');
            }
            return true;
        })
        .isLength({ max: 80 }).withMessage('El email no puede exceder 80 caracteres')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('La contraseña es requerida')
        .matches(/^(?=.*[A-Z])(?=.*\d)[^\s]{6,150}$/).withMessage('La contraseña debe tener entre 6 y 150 caracteres, sin espacios, al menos una mayúscula y un número'),
    body('rol')
        .optional()
        .trim()
        .isIn(['Administrador', 'Simpatizante']).withMessage('Rol inválido')
        .customSanitizer(stripHtml),
    body('colonias')
        .optional()
        .isArray().withMessage('Las colonias deben ser un arreglo de IDs')
];

const loginValidator = [
    body('email')
        .trim()
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('Formato de email inválido')
        .custom(value => {
            if (!value.endsWith('@edu.uaa.mx')) {
                throw new Error('El correo debe ser institucional (@edu.uaa.mx)');
            }
            return true;
        })
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('La contraseña es requerida')
];

const updateUserValidator = [
    param('id').isInt().withMessage('ID de usuario inválido').toInt(),
    body('nombre')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 90 }).withMessage('El nombre no puede exceder 90 caracteres')
        .customSanitizer(stripHtml),
    body('email')
        .optional({ checkFalsy: true })
        .trim()
        .isEmail().withMessage('Formato de email inválido')
        .custom(value => {
            if (!value.endsWith('@edu.uaa.mx')) {
                throw new Error('El correo debe ser institucional (@edu.uaa.mx)');
            }
            return true;
        })
        .isLength({ max: 80 }).withMessage('El email no puede exceder 80 caracteres')
        .normalizeEmail(),
    body('rol')
        .optional({ checkFalsy: true })
        .trim()
        .isIn(['Administrador', 'Simpatizante']).withMessage('Rol inválido')
        .customSanitizer(stripHtml)
];

const deleteUserValidator = [
    param('id').isInt().withMessage('ID de usuario inválido').toInt()
];

const pushTokenValidator = [
    body('pushToken')
        .trim()
        .notEmpty().withMessage('El push token es requerido')
        .isLength({ max: 255 }).withMessage('El token no puede exceder 255 caracteres')
        .customSanitizer(stripHtml)
];

module.exports = {
    registerValidator,
    loginValidator,
    updateUserValidator,
    deleteUserValidator,
    pushTokenValidator
};
