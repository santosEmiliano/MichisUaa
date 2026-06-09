const sanitizeHtml = require('sanitize-html');

const stripHtml = (value) => {
    if (typeof value !== 'string') return value;
    // Esto borra completamente cualquier etiqueta HTML/JS
    return sanitizeHtml(value, {
        allowedTags: [],
        allowedAttributes: {}
    });
};

module.exports = { stripHtml };
