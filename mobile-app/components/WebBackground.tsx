import React from 'react';

// En móvil (iOS/Android), no mostramos el fondo web complejo.
// Devolvemos null para que no renderice nada y mantenga la UI nativa intacta.
export default function WebBackground() {
  return null;
}
